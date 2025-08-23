import { useEffect, useRef } from 'react'
import { io, Socket } from 'socket.io-client'
import type { ServerToClientEvents, ClientToServerEvents } from '@aiartbrush/shared'
import { useGameStore } from '@/lib/store'

type TypedSocket = Socket<ServerToClientEvents, ClientToServerEvents>

// Global singleton socket instance to prevent multiple connections
let globalSocket: TypedSocket | null = null

export function useSocket() {
  const socketRef = useRef<TypedSocket | null>(null)
  const { setRoom, setCurrentPlayer, updateRoom, updateGame, setTimeRemaining, setConnectionStatus, setProcessingPrompt, setErrorMessage } = useGameStore()
  
  useEffect(() => {
    // Use global socket if it exists and is connected
    if (globalSocket && globalSocket.connected) {
      console.log('🔌 Frontend: Reusing existing global socket connection:', globalSocket.id)
      socketRef.current = globalSocket
      setConnectionStatus('connected')
      return
    }
    
    // Create new socket only if global one doesn't exist or is disconnected
    if (!globalSocket || !globalSocket.connected) {
      console.log('🔌 Frontend: Creating new singleton socket connection')
      setConnectionStatus('connecting')
      
      globalSocket = io(process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3001', {
        transports: ['websocket', 'polling'],
        forceNew: false,
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5
      })
      
      socketRef.current = globalSocket
      
      const socket = globalSocket
      
      // Only attach event listeners once to prevent duplicates
      if (!socket.hasListeners('connect')) {
        socket.on('connect', () => {
          console.log('🔌 Frontend: Connected to server with ID:', socket.id)
          setConnectionStatus('connected')
        })
        
        socket.on('disconnect', (reason) => {
          console.log('🔌 Frontend: Disconnected from server, reason:', reason)
          setConnectionStatus('disconnected')
        })
        
        socket.io.on('reconnect', () => {
          console.log('🔌 Frontend: Reconnected to server with new ID:', socket.id)
          setConnectionStatus('connected')
        })
        
        socket.on('connect_error', (error) => {
          console.error('🔌 Frontend: Connection error:', error)
          setConnectionStatus('error')
        })
        
        socket.on('room:created', (room) => {
          console.log('🏠 Frontend: Room created:', room.code)
          setRoom(room)
        })
        
        socket.on('room:joined', (room, player) => {
          console.log('🏠 Frontend: Joined room:', room.code, 'as player:', player.nickname, 'with socket ID:', socket.id)
          setRoom(room)
          setCurrentPlayer(player)
        })
        
        socket.on('room:updated', (room) => {
          console.log('🏠 Frontend: Room updated:', room.code)
          if (room.currentGame) {
            console.log('🏠 Frontend: Room game rounds with images:', room.currentGame.rounds.map(r => ({ index: r.index, hasImage: !!r.generatedImage, status: r.status })))
          }
          updateRoom(room)
        })
        
        socket.on('game:started', (game) => {
          console.log('🎮 Frontend: Game started:', game.id)
          updateGame(game)
        })
        
        socket.on('game:updated', (game) => {
          console.log('🎮 Frontend: Game updated:', game.id)
          console.log('🎮 Frontend: Game rounds with images:', game.rounds.map(r => ({ index: r.index, hasImage: !!r.generatedImage, status: r.status })))
          updateGame(game)
        })
        
        socket.on('turn:timer', (time) => {
          setTimeRemaining(time)
        })
        
        socket.on('prompt:processing', () => {
          console.log('🎨 Frontend: Prompt is being processed, showing loader')
          setProcessingPrompt(true)
        })
        
        socket.on('image:generated', (imageUrl) => {
          console.log('🎨 Frontend: Image generated:', imageUrl)
          setProcessingPrompt(false)
        })
        
        socket.on('image:failed', (error) => {
          console.log('❌ Frontend: Image generation failed:', error)
          setProcessingPrompt(false)
          alert(`Image generation failed: ${error}`)
        })
        
        socket.on('prompt:error', (error) => {
          console.log('❌ Frontend: Prompt submission error:', error)
          setProcessingPrompt(false)
          setErrorMessage(error)
        })

        socket.on('game:results', (results) => {
          console.log('🏆 Frontend: Game results received:', results)
          // Store results in session storage for the results page
          sessionStorage.setItem(`game-results-${results.gameId}`, JSON.stringify(results))
          // Navigate to results page
          window.location.href = `/results?gameId=${results.gameId}`
        })
        
        console.log('✅ Frontend: Event listeners attached to socket:', socket.id)
      }
    }
    
    // Never disconnect the global socket in development
    return () => {
      if (process.env.NODE_ENV === 'production' && globalSocket) {
        console.log('🔌 Frontend: Disconnecting global socket on unmount')
        globalSocket.disconnect()
        globalSocket = null
        socketRef.current = null
      }
    }
  }, [setRoom, setCurrentPlayer, updateRoom, updateGame, setTimeRemaining, setConnectionStatus, setProcessingPrompt])
  
  return socketRef.current
}