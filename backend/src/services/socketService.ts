import { Server, Socket } from 'socket.io'
import { nanoid } from 'nanoid'
import type { 
  ServerToClientEvents, 
  ClientToServerEvents, 
  Room, 
  Player, 
  RoomSettings,
  Game
} from '@ai-art-chain/shared'

interface GameConfig {
  maxPlayers: number
  roundsPerPlayer: number
  turnTimeLimit: number
  votingTimeLimit: number
  gameMode: 'casual' | 'competitive'
}

function getGameConfig(): GameConfig {
  // Parse environment variables with defaults and validation
  const maxPlayers = Math.max(2, Math.min(12, parseInt(process.env.GAME_MAX_PLAYERS || '8')))
  const roundsPerPlayer = Math.max(1, Math.min(10, parseInt(process.env.GAME_ROUNDS_PER_PLAYER || '2')))
  const turnTimeLimit = Math.max(10, Math.min(300, parseInt(process.env.GAME_TURN_TIME_LIMIT || '60')))
  const votingTimeLimit = Math.max(5, Math.min(60, parseInt(process.env.GAME_VOTING_TIME_LIMIT || '20')))
  const gameMode = ['casual', 'competitive'].includes(process.env.GAME_DEFAULT_MODE || 'casual') 
    ? (process.env.GAME_DEFAULT_MODE as 'casual' | 'competitive') 
    : 'casual'

  return {
    maxPlayers,
    roundsPerPlayer,
    turnTimeLimit,
    votingTimeLimit,
    gameMode
  }
}
import { roomService, sessionService, getRedis } from './redisService'
import { gameManager } from './gameService'
import { galleryService } from './galleryService'
import { ART_CATEGORIES, ART_STYLES } from '@ai-art-chain/shared/src/artStyles'

type IoServer = Server<ClientToServerEvents, ServerToClientEvents>
type IoSocket = Socket<ClientToServerEvents, ServerToClientEvents>

export function setupSocketHandlers(io: IoServer) {
  io.on('connection', (socket: IoSocket) => {
    console.log('🔌 Socket: Client connected:', socket.id)
    
    socket.on('room:create', async (settings, callback) => {
      try {
        const roomCode = generateRoomCode()
        // Get default game configuration from environment
        const defaultConfig = getGameConfig()
        console.log('🎯 SocketService: Using game configuration:', defaultConfig)
        
        const room: Room = {
          id: nanoid(),
          code: roomCode,
          players: [],
          settings: {
            maxPlayers: settings.maxPlayers || defaultConfig.maxPlayers,
            roundsPerPlayer: settings.roundsPerPlayer || defaultConfig.roundsPerPlayer,
            turnTimeLimit: settings.turnTimeLimit || defaultConfig.turnTimeLimit,
            votingTimeLimit: settings.votingTimeLimit || defaultConfig.votingTimeLimit,
            gameMode: settings.gameMode || defaultConfig.gameMode
          },
          createdAt: new Date(),
          status: 'waiting'
        }
        
        await roomService.create(room)
        callback(room)
        socket.emit('room:created', room)
      } catch (error) {
        console.error('Error creating room:', error)
        socket.emit('room:error', 'Failed to create room')
      }
    })
    
    socket.on('room:join', async (code, nickname, callback) => {
      try {
        console.log(`Player ${socket.id} attempting to join room ${code} with nickname ${nickname}`)
        const room = await roomService.getByCode(code.toUpperCase())
        
        if (!room) {
          console.log(`Room ${code} not found`)
          callback({ success: false, error: 'Room not found' })
          return
        }
        
        console.log(`Room ${code} found with ${room.players.length} players`)
        
        if (room.players.length >= room.settings.maxPlayers) {
          callback({ success: false, error: 'Room is full' })
          return
        }
        
        // Check if player is already in room (reconnection by nickname or socket ID)
        let existingPlayer = room.players.find(p => p.id === socket.id)
        
        // If not found by socket ID, check by nickname (for reconnections)
        if (!existingPlayer && nickname) {
          existingPlayer = room.players.find(p => p.nickname === nickname && p.status === 'disconnected')
          if (existingPlayer) {
            console.log('🔄 Reconnection: Found disconnected player by nickname, updating socket ID')
            // Update the player's socket ID for reconnection
            existingPlayer.id = socket.id
          }
        }
        
        let player: Player
        
        if (existingPlayer) {
          // Player reconnecting
          existingPlayer.status = 'connected'
          existingPlayer.nickname = nickname || existingPlayer.nickname
          player = existingPlayer
          console.log('🔄 Reconnection: Player reconnected as', player.nickname)
        } else {
          // New player joining
          player = {
            id: socket.id,
            nickname: nickname || `Player ${room.players.length + 1}`,
            score: 0,
            isHost: room.players.length === 0,
            status: 'connected'
          }
          room.players.push(player)
          console.log('👤 New Player: Added new player', player.nickname)
        }
        await roomService.update(room)
        await sessionService.setPlayerSession(socket.id, player, room.id)
        
        socket.join(room.id)
        console.log(`🏠 Room: Player ${player.nickname} (${socket.id}) successfully joined room ${room.code}`)
        console.log(`🏠 Room: Player is host: ${player.isHost}`)
        console.log(`🏠 Room: Room has ${room.players.length} players total`)
        
        callback({ success: true, room })
        
        socket.emit('room:joined', room, player)
        socket.to(room.id).emit('player:joined', player)
        io.to(room.id).emit('room:updated', room)
      } catch (error) {
        console.error('Error joining room:', error)
        callback({ success: false, error: 'Failed to join room' })
      }
    })
    
    socket.on('room:leave', async () => {
      try {
        const session = await sessionService.getPlayerSession(socket.id)
        if (!session) return
        
        const { roomId } = session
        const room = await roomService.get(roomId)
        if (!room) return
        
        room.players = room.players.filter(p => p.id !== socket.id)
        
        if (room.players.length === 0) {
          await roomService.delete(roomId)
        } else {
          if (room.players[0] && !room.players.some(p => p.isHost)) {
            room.players[0].isHost = true
          }
          await roomService.update(room)
          socket.to(roomId).emit('player:left', socket.id)
          io.to(roomId).emit('room:updated', room)
        }
        
        socket.leave(roomId)
        await sessionService.deletePlayerSession(socket.id)
      } catch (error) {
        console.error('Error leaving room:', error)
      }
    })
    
    socket.on('game:start', async () => {
      try {
        console.log('🎯 Backend: Received game:start event from socket:', socket.id)
        
        let session = await sessionService.getPlayerSession(socket.id)
        console.log('🎯 Backend: Player session:', session)
        
        if (!session) {
          console.error('❌ Backend: No session found for socket:', socket.id)
          // Debug: Show all active sessions and try to recover
          console.log('🔍 Debug: Checking all rooms for this socket...')
          let sessionCreated = false
          
          try {
            const redis = getRedis()
            const allRooms = await redis.keys('room:*')
            console.log('🔍 Debug: Found', allRooms.length, 'room keys')
            
            for (const roomKey of allRooms) {
              if (!roomKey.includes('code:')) {
                const roomData = await redis.get(roomKey)
                if (roomData) {
                  const room = JSON.parse(roomData)
                  console.log('🔍 Debug: Checking room', room.code, 'with', room.players.length, 'players')
                  const player = room.players.find((p: any) => p.id === socket.id)
                  if (player) {
                    console.log('🔍 Debug: Found player in room without session:', room.code, player.nickname, 'isHost:', player.isHost)
                    // Create session for this player since they exist in room but have no session
                    await sessionService.setPlayerSession(socket.id, player, room.id)
                    console.log('✅ Debug: Created missing session for player, retrying...')
                    sessionCreated = true
                    break
                  }
                }
              }
            }
          } catch (err) {
            console.error('Debug check failed:', err)
          }
          
          if (!sessionCreated) {
            console.error('❌ Backend: Could not recover session for socket:', socket.id)
            return
          }
          
          // Retry getting session after creating it
          session = await sessionService.getPlayerSession(socket.id)
          console.log('🔄 Backend: Retry session lookup result:', !!session)
        }
        
        if (!session || !session.roomId || !session.player) {
          console.error('❌ Backend: Invalid session data')
          return
        }
        
        const { roomId, player } = session
        console.log('🎯 Backend: Room ID:', roomId, 'Player:', player)
        
        if (!player.isHost) {
          console.error('❌ Backend: Player is not host, cannot start game')
          return
        }
        
        const room = await roomService.get(roomId)
        console.log('🎯 Backend: Room found:', !!room, 'Players count:', room?.players.length)
        
        if (!room || room.players.length < 2) {
          console.error('❌ Backend: Room not found or not enough players:', { room: !!room, playerCount: room?.players.length })
          return
        }
        
        console.log('🎯 Backend: Creating game...')
        const game = await gameManager.createGame(room)
        console.log('🎯 Backend: Game created:', game.id)
        
        room.currentGame = game
        room.status = 'in_game'
        await roomService.update(room)
        console.log('🎯 Backend: Room updated to in_game status')
        
        io.to(roomId).emit('game:started', game)
        io.to(roomId).emit('room:updated', room)
        console.log('🎯 Backend: Emitted game:started and room:updated events')
        
        gameManager.startNextRound(io, game, room)
        console.log('🎯 Backend: Started next round')
      } catch (error) {
        console.error('❌ Backend: Error starting game:', error)
        console.error('❌ Backend: Error stack:', (error as Error).stack)
      }
    })
    
    socket.on('prompt:submit', async (prompt, styleSelection) => {
      try {
        console.log('🎯 Socket: Received prompt:submit from socket:', socket.id, 'Prompt:', prompt)
        
        // Validate prompt
        if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
          console.error('❌ Socket: Empty or invalid prompt submitted')
          socket.emit('prompt:error', 'Please enter a valid description for your artwork.')
          return
        }
        
        const session = await sessionService.getPlayerSession(socket.id)
        if (!session) {
          console.error('❌ Socket: No session found for prompt submission, socket:', socket.id)
          socket.emit('prompt:error', 'Session expired. Please refresh the page and rejoin the room.')
          return
        }
        
        const { roomId, player } = session
        console.log('🎯 Socket: Getting room for prompt submission:', roomId, 'Player:', player.nickname)
        
        const room = await roomService.get(roomId)
        if (!room) {
          console.error('❌ Socket: Room not found for prompt submission')
          socket.emit('prompt:error', 'Room not found. Please rejoin the game.')
          return
        }
        
        if (!room.currentGame) {
          console.error('❌ Socket: No current game in room for prompt submission')
          socket.emit('prompt:error', 'No active game. Please start a new game.')
          return
        }
        
        // Check if it's the player's turn
        const currentRound = room.currentGame.rounds[room.currentGame.currentRoundIndex]
        if (!currentRound || currentRound.playerId !== socket.id) {
          console.error('❌ Socket: Not player\'s turn for prompt submission')
          socket.emit('prompt:error', 'It\'s not your turn yet. Please wait.')
          return
        }
        
        if (currentRound.status !== 'waiting') {
          console.error('❌ Socket: Round not in waiting status')
          socket.emit('prompt:error', 'This round is no longer accepting prompts.')
          return
        }
        
        console.log('🎯 Socket: All validations passed, calling handlePromptSubmission')
        console.log('🎯 Socket: Style selection:', styleSelection)
        await gameManager.handlePromptSubmission(io, room, socket.id, prompt.trim(), styleSelection)
      } catch (error) {
        console.error('❌ Socket: Error submitting prompt:', error)
        console.error('❌ Socket: Error stack:', (error as Error).stack)
        socket.emit('prompt:error', 'An error occurred while submitting your prompt. Please try again.')
      }
    })
    
    socket.on('vote:cast', async (vote) => {
      try {
        const session = await sessionService.getPlayerSession(socket.id)
        if (!session) return
        
        const { roomId } = session
        const room = await roomService.get(roomId)
        if (!room?.currentGame) return
        
        await gameManager.handleVote(io, room, socket.id, vote)
      } catch (error) {
        console.error('Error casting vote:', error)
      }
    })
    
    socket.on('styles:get', async (callback) => {
      try {
        callback({
          categories: ART_CATEGORIES,
          styles: ART_STYLES
        })
      } catch (error) {
        console.error('Error fetching styles:', error)
      }
    })
    
    socket.on('gallery:get', async (callback, filters) => {
      try {
        const artworks = await galleryService.getGalleryArtworks(filters)
        callback(artworks)
      } catch (error) {
        console.error('Error fetching gallery:', error)
        callback([])
      }
    })
    
    socket.on('gallery:setMainImage', async (gameId, imageIndex, callback) => {
      try {
        const success = await galleryService.setMainDisplayImage(gameId, imageIndex)
        callback(success)
      } catch (error) {
        console.error('Error setting main display image:', error)
        callback(false)
      }
    })
    
    socket.on('disconnect', async () => {
      console.log('🔌 Socket: Client disconnected:', socket.id)
      
      const session = await sessionService.getPlayerSession(socket.id)
      console.log('🔌 Socket: Session found for disconnected client:', !!session)
      
      if (!session) return
      
      const { roomId } = session
      const room = await roomService.get(roomId)
      if (!room) return
      
      const player = room.players.find(p => p.id === socket.id)
      if (player) {
        console.log('🔌 Socket: Marking player as disconnected:', player.nickname)
        player.status = 'disconnected'
        await roomService.update(room)
        socket.to(roomId).emit('player:updated', player)
      }
    })
  })
}

function generateRoomCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}