import { Server } from 'socket.io'
import { nanoid } from 'nanoid'
import type { 
  ServerToClientEvents, 
  ClientToServerEvents, 
  Room, 
  Game, 
  Round,
  Vote,
  VotingResults
} from '@ai-art-chain/shared'
import { gameService, roomService } from './redisService'
import { generateImage } from './aiService'
import { galleryService } from './galleryService'
import { imageStorageService } from './imageStorageService'

type IoServer = Server<ClientToServerEvents, ServerToClientEvents>

class GameManager {
  private turnTimers: Map<string, NodeJS.Timeout> = new Map()
  private votingTimers: Map<string, NodeJS.Timeout> = new Map()
  
  async createGame(room: Room): Promise<Game> {
    const game: Game = {
      id: nanoid(),
      roomId: room.id,
      rounds: [],
      currentRoundIndex: 0,
      status: 'waiting',
      scores: room.players.reduce((acc, p) => ({ ...acc, [p.id]: 0 }), {}),
      startedAt: new Date()
    }
    
    await gameService.create(game)
    return game
  }
  
  async startNextRound(io: IoServer, game: Game, room: Room) {
    console.log('🎯 GameService: Starting next round for game:', game.id)
    
    // Calculate total rounds: players * rounds per player
    const totalRounds = room.players.length * room.settings.roundsPerPlayer
    console.log('🎯 GameService: Current round index:', game.currentRoundIndex, 'Total rounds needed:', totalRounds, `(${room.players.length} players × ${room.settings.roundsPerPlayer} rounds each)`)
    
    if (game.currentRoundIndex >= totalRounds) {
      console.log('🎯 GameService: Game completed, ending game')
      await this.endGame(io, game, room)
      return
    }
    
    const playerIndex = game.currentRoundIndex % room.players.length
    const currentPlayer = room.players[playerIndex]
    
    console.log('🎯 GameService: Player index:', playerIndex, 'Current player:', currentPlayer.nickname, 'ID:', currentPlayer.id)
    
    const round: Round = {
      index: game.currentRoundIndex,
      playerId: currentPlayer.id,
      prompt: '',
      previousImage: game.rounds[game.currentRoundIndex - 1]?.generatedImage,
      votes: [],
      status: 'waiting',
      startedAt: new Date()
    }
    
    console.log('🎯 GameService: Created round:', { index: round.index, playerId: round.playerId, status: round.status })
    
    game.rounds.push(round)
    game.status = 'active'
    
    console.log('🎯 GameService: Game now has', game.rounds.length, 'rounds')
    
    await gameService.update(game)
    console.log('🎯 GameService: Game state updated in Redis')
    
    // Update room's currentGame reference to keep it in sync
    room.currentGame = game
    await roomService.update(room)
    console.log('🎯 GameService: Room updated with latest game state')
    
    io.to(room.id).emit('turn:started', round, currentPlayer.id)
    io.to(room.id).emit('game:updated', game)
    
    this.startTurnTimer(io, game, room)
    console.log('🎯 GameService: Turn timer started for round', game.currentRoundIndex)
  }
  
  private startTurnTimer(io: IoServer, game: Game, room: Room) {
    const timerId = this.turnTimers.get(game.id)
    if (timerId) clearTimeout(timerId)
    
    let timeRemaining = room.settings.turnTimeLimit
    
    const interval = setInterval(() => {
      timeRemaining--
      io.to(room.id).emit('turn:timer', timeRemaining)
      
      if (timeRemaining <= 0) {
        clearInterval(interval)
        this.handleTurnTimeout(io, game, room)
      }
    }, 1000)
    
    this.turnTimers.set(game.id, interval as any)
  }
  
  private async handleTurnTimeout(io: IoServer, game: Game, room: Room) {
    const currentRound = game.rounds[game.currentRoundIndex]
    currentRound.status = 'completed'
    currentRound.completedAt = new Date()
    
    game.currentRoundIndex++
    await gameService.update(game)
    
    io.to(room.id).emit('turn:ended', currentRound)
    io.to(room.id).emit('game:updated', game)
    
    // Move to next player immediately
    setTimeout(() => {
      this.startNextRound(io, game, room)
    }, 1500)
  }
  
  async handlePromptSubmission(io: IoServer, room: Room, playerId: string, prompt: string, styleSelection?: any) {
    if (!room.currentGame) {
      console.error('❌ GameService: No current game found in room')
      return
    }
    
    // Fetch the latest game state from Redis to avoid stale data
    console.log('🎯 GameService: Fetching latest game state from Redis:', room.currentGame.id)
    const game = await gameService.get(room.currentGame.id)
    if (!game) {
      console.error('❌ GameService: Game not found in Redis:', room.currentGame.id)
      return
    }
    
    console.log('🎯 GameService: Handling prompt submission for player:', playerId)
    console.log('🎯 GameService: Game ID:', game.id, 'Current round index:', game.currentRoundIndex)
    console.log('🎯 GameService: Total rounds:', game.rounds.length)
    console.log('🎯 GameService: Rounds array:', game.rounds.map(r => ({ index: r.index, playerId: r.playerId, status: r.status })))
    
    const currentRound = game.rounds[game.currentRoundIndex]
    if (!currentRound) {
      console.error('❌ GameService: Current round not found! Index:', game.currentRoundIndex, 'Available rounds:', game.rounds.length)
      return
    }
    
    console.log('🎯 GameService: Current round:', { index: currentRound.index, playerId: currentRound.playerId, status: currentRound.status })
    
    if (currentRound.playerId !== playerId) {
      console.error('❌ GameService: Player ID mismatch. Expected:', currentRound.playerId, 'Got:', playerId)
      return
    }
    
    if (currentRound.status !== 'waiting') {
      console.error('❌ GameService: Round not in waiting status. Current status:', currentRound.status)
      return
    }
    
    const timerId = this.turnTimers.get(game.id)
    if (timerId) clearTimeout(timerId)
    
    currentRound.prompt = prompt
    currentRound.selectedStyle = styleSelection
    currentRound.status = 'generating'
    await gameService.update(game)
    
    // Update room's currentGame reference
    room.currentGame = game
    await roomService.update(room)
    
    io.to(room.id).emit('prompt:processing')
    
    try {
      // Get current artwork description from previous round
      const previousRound = game.rounds[game.currentRoundIndex - 1]
      const currentArtworkDescription = previousRound?.artworkDescription
      
      // Collect style history from previous rounds
      const styleHistory = game.rounds
        .filter(r => r.selectedStyle && r.index < currentRound.index)
        .map(r => r.selectedStyle)
      
      const result = await generateImage(prompt, currentRound.previousImage, currentArtworkDescription, styleSelection, styleHistory)
      
      // Download and store image locally
      try {
        const localImageUrl = await imageStorageService.downloadAndStore(
          result.imageUrl, 
          game.id, 
          currentRound.index
        )
        currentRound.generatedImage = localImageUrl
        console.log('🖼️ GameService: Image stored locally:', localImageUrl)
      } catch (error) {
        console.error('⚠️ GameService: Failed to store image locally, using original URL:', error)
        currentRound.generatedImage = result.imageUrl
      }
      
      currentRound.artworkDescription = result.newArtworkDescription
      currentRound.status = 'completed'
      currentRound.completedAt = new Date()
      
      // Move to next round immediately
      game.currentRoundIndex++
      await gameService.update(game)
      
      // Update room's currentGame reference with the latest game state
      room.currentGame = game
      await roomService.update(room)
      
      console.log('🎨 GameService: Image generated and saved:', result.imageUrl)
      console.log('🎨 GameService: Updated artwork description:', result.newArtworkDescription)
      console.log('🎨 GameService: Moving to next round immediately, index:', game.currentRoundIndex)
      
      // Send the image to all players
      io.to(room.id).emit('image:generated', result.imageUrl)
      io.to(room.id).emit('game:updated', game)
      io.to(room.id).emit('room:updated', room)
      io.to(room.id).emit('turn:ended', currentRound)
      
      // Start next player's turn immediately (with a small delay for UI transition)
      setTimeout(() => {
        this.startNextRound(io, game, room)
      }, 1500)
    } catch (error) {
      console.error('Image generation failed:', error)
      io.to(room.id).emit('image:failed', 'Failed to generate image')
      
      currentRound.status = 'completed'
      game.currentRoundIndex++
      await gameService.update(game)
      
      setTimeout(() => {
        this.startNextRound(io, game, room)
      }, 3000)
    }
  }
  
  private startVoting(io: IoServer, game: Game, room: Room) {
    const currentRound = game.rounds[game.currentRoundIndex]
    game.status = 'voting'
    
    io.to(room.id).emit('voting:started', currentRound)
    
    let timeRemaining = room.settings.votingTimeLimit
    
    const interval = setInterval(async () => {
      timeRemaining--
      
      if (timeRemaining <= 0) {
        clearInterval(interval)
        await this.endVoting(io, game, room)
      }
    }, 1000)
    
    this.votingTimers.set(game.id, interval as any)
  }
  
  async handleVote(io: IoServer, room: Room, playerId: string, vote: 'up' | 'down') {
    const game = room.currentGame
    if (!game || game.status !== 'voting') return
    
    const currentRound = game.rounds[game.currentRoundIndex]
    
    if (currentRound.playerId === playerId) return
    
    const existingVote = currentRound.votes.find(v => v.playerId === playerId)
    if (existingVote) {
      existingVote.vote = vote
      existingVote.timestamp = new Date()
    } else {
      currentRound.votes.push({
        playerId,
        vote,
        timestamp: new Date()
      })
    }
    
    await gameService.update(game)
    io.to(room.id).emit('vote:received', playerId)
  }
  
  private async endVoting(io: IoServer, game: Game, room: Room) {
    const timerId = this.votingTimers.get(game.id)
    if (timerId) clearTimeout(timerId)
    
    const currentRound = game.rounds[game.currentRoundIndex]
    
    const upVotes = currentRound.votes.filter(v => v.vote === 'up').length
    const downVotes = currentRound.votes.filter(v => v.vote === 'down').length
    
    let pointsAwarded = 0
    if (room.settings.gameMode === 'competitive') {
      pointsAwarded = (upVotes * 2) - downVotes
      game.scores[currentRound.playerId] = (game.scores[currentRound.playerId] || 0) + pointsAwarded
    }
    
    const results: VotingResults = {
      upVotes,
      downVotes,
      pointsAwarded
    }
    
    currentRound.status = 'completed'
    currentRound.completedAt = new Date()
    game.currentRoundIndex++
    
    await gameService.update(game)
    
    io.to(room.id).emit('voting:ended', results)
    io.to(room.id).emit('scores:updated', game.scores)
    io.to(room.id).emit('turn:ended', currentRound)
    
    setTimeout(() => {
      this.startNextRound(io, game, room)
    }, 5000)
  }
  
  private async endGame(io: IoServer, game: Game, room: Room) {
    game.status = 'finished'
    game.endedAt = new Date()
    
    await gameService.update(game)
    
    // Create comprehensive game results
    const imageSequence = game.rounds
      .filter(round => round.generatedImage) // Only include rounds with generated images
      .map(round => {
        const player = room.players.find(p => p.id === round.playerId)
        return {
          roundIndex: round.index,
          playerId: round.playerId,
          playerName: player?.nickname || 'Unknown Player',
          prompt: round.prompt,
          imageUrl: round.generatedImage!,
          artworkDescription: round.artworkDescription || '',
          generatedAt: round.completedAt || round.startedAt,
          artStyle: round.selectedStyle?.primaryStyle,
          styleHistory: game.rounds
            .filter(r => r.selectedStyle && r.index <= round.index)
            .map(r => r.selectedStyle?.primaryStyle)
            .filter((style): style is any => style !== undefined)
        }
      })

    const gameResults = {
      gameId: game.id,
      roomCode: room.code,
      completedAt: new Date(),
      totalRounds: game.rounds.length,
      players: room.players,
      mainDisplayImageIndex: imageSequence.length - 1, // Default to last image
      imageSequence
    }
    
    console.log('🎯 GameService: Game completed! Results:', {
      gameId: gameResults.gameId,
      totalImages: gameResults.imageSequence.length,
      players: gameResults.players.map(p => p.nickname)
    })
    
    // Store game results and add to public gallery
    await this.saveGameResults(gameResults)
    await galleryService.addToGallery(gameResults)
    
    room.status = 'finished'
    room.currentGame = undefined
    await roomService.update(room)
    
    // Emit both the game ended and results events
    io.to(room.id).emit('game:ended', game)
    io.to(room.id).emit('game:results', gameResults)
    io.to(room.id).emit('room:updated', room)
  }
  
  private async saveGameResults(results: any) {
    try {
      // Save to Redis with game results
      const { redis } = await import('./redisService')
      const key = `game_results:${results.gameId}`
      await redis.setex(key, 86400 * 7, JSON.stringify(results)) // Store for 7 days
      console.log('✅ GameService: Game results saved to Redis')
    } catch (error) {
      console.error('❌ GameService: Failed to save game results:', error)
    }
  }
}

export const gameManager = new GameManager()