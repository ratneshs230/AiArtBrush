# ART-loop API Documentation

## 1. Overview

This document provides comprehensive API documentation for the ART-loop system, covering REST endpoints, WebSocket events, data schemas, and client integration examples.

## 2. API Architecture

### 2.1 API Design Principles
- **RESTful Design**: Standard HTTP methods for resource operations
- **Real-time Events**: WebSocket-based communication for live updates
- **Type Safety**: TypeScript interfaces for all API contracts
- **Error Handling**: Consistent error response formats
- **Versioning**: API versioning strategy for future compatibility

### 2.2 Base URLs

```typescript
interface APIConfig {
  development: {
    rest: 'http://localhost:3001',
    websocket: 'ws://localhost:3001'
  },
  production: {
    rest: 'https://api.artloop.app',
    websocket: 'wss://api.artloop.app'
  }
}
```

### 2.3 Authentication

ART-loop uses a **sessionless authentication model** for simplicity:
- No user registration or login required
- Player identification via WebSocket connection and nickname
- Session management through Redis with socket ID mapping
- Room access controlled by 6-character room codes

## 3. REST API Endpoints

### 3.1 Health Check Endpoint

#### GET /health

Check server health and service status.

**Request:**
```http
GET /health
Accept: application/json
```

**Response:**
```typescript
interface HealthResponse {
  status: 'ok' | 'error'
  timestamp: string
  uptime: number
  version: string
  services: {
    redis: 'connected' | 'disconnected'
    queue: 'active' | 'paused' | 'error'
    ai_services: {
      gemini: 'available' | 'unavailable'
      replicate: 'available' | 'unavailable'
    }
  }
  metrics?: {
    active_rooms: number
    active_games: number
    queued_jobs: number
  }
}
```

**Example Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-08-20T22:00:00.000Z",
  "uptime": 86400,
  "version": "1.0.0",
  "services": {
    "redis": "connected",
    "queue": "active",
    "ai_services": {
      "gemini": "available",
      "replicate": "available"
    }
  },
  "metrics": {
    "active_rooms": 5,
    "active_games": 3,
    "queued_jobs": 2
  }
}
```

**Status Codes:**
- `200 OK` - Server is healthy
- `503 Service Unavailable` - Server or critical services are down

### 3.2 Game Results Endpoint

#### GET /api/game-results/:gameId

Retrieve completed game results and artwork sequence.

**Request:**
```http
GET /api/game-results/abc123-def456-ghi789
Accept: application/json
```

**Parameters:**
- `gameId` (string, required) - Unique game identifier

**Response:**
```typescript
interface GameResultsResponse extends GameResults {
  gameId: string
  roomCode: string
  completedAt: string
  totalRounds: number
  players: Player[]
  mainDisplayImageIndex: number
  imageSequence: ImageRound[]
}

interface ImageRound {
  roundIndex: number
  playerId: string
  playerName: string
  prompt: string
  imageUrl: string
  artworkDescription: string
  generatedAt: string
  artStyle?: {
    id: string
    name: string
    category: string
  }
  styleHistory: string[]
}
```

**Example Response:**
```json
{
  "gameId": "abc123-def456-ghi789",
  "roomCode": "ABCD12",
  "completedAt": "2025-08-20T22:00:00.000Z",
  "totalRounds": 4,
  "players": [
    {
      "id": "socket123",
      "nickname": "Artist1",
      "isHost": true,
      "score": 15
    },
    {
      "id": "socket456",
      "nickname": "Artist2", 
      "isHost": false,
      "score": 12
    }
  ],
  "mainDisplayImageIndex": 3,
  "imageSequence": [
    {
      "roundIndex": 0,
      "playerId": "socket123",
      "playerName": "Artist1",
      "prompt": "A magical forest at sunset",
      "imageUrl": "http://localhost:3001/images/abc123-round-0.png",
      "artworkDescription": "Fantasy Settlement: A magical forest at sunset",
      "generatedAt": "2025-08-20T21:30:00.000Z",
      "artStyle": {
        "id": "fantasy_settlement",
        "name": "Fantasy Settlement",
        "category": "illustration"
      },
      "styleHistory": ["fantasy_settlement"]
    }
  ]
}
```

**Status Codes:**
- `200 OK` - Game results found
- `404 Not Found` - Game ID does not exist or has expired
- `500 Internal Server Error` - Server error retrieving results

### 3.3 Static Image Serving

#### GET /images/:filename

Serve locally stored generated images.

**Request:**
```http
GET /images/abc123-def456-ghi789-round-0.png
Accept: image/png, image/jpeg, image/*
```

**Parameters:**
- `filename` (string, required) - Image filename with format: `{gameId}-round-{index}.png`

**Response Headers:**
```http
Content-Type: image/png
Content-Length: 1048576
Cache-Control: public, max-age=86400
ETag: "W/abc123-1234567890"
Last-Modified: Wed, 20 Aug 2025 22:00:00 GMT
```

**Status Codes:**
- `200 OK` - Image found and served
- `404 Not Found` - Image file does not exist
- `304 Not Modified` - Client cache is current (if ETag/Last-Modified match)

## 4. WebSocket API

### 4.1 Connection Management

#### Connection Establishment

**Client Connection:**
```typescript
import { io } from 'socket.io-client'

const socket = io('http://localhost:3001', {
  transports: ['websocket', 'polling'],
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000
})

socket.on('connect', () => {
  console.log('Connected:', socket.id)
})
```

#### Connection Events

**connect**
```typescript
socket.on('connect', () => {
  // Client successfully connected
  console.log('Socket connected:', socket.id)
})
```

**disconnect**
```typescript
socket.on('disconnect', (reason: string) => {
  // Client disconnected
  console.log('Socket disconnected:', reason)
})
```

**connect_error**
```typescript
socket.on('connect_error', (error: Error) => {
  // Connection failed
  console.error('Connection error:', error.message)
})
```

### 4.2 Room Management Events

#### room:create

Create a new game room with specified settings.

**Client Emit:**
```typescript
interface RoomSettings {
  maxPlayers: number        // 2-8 players
  roundsPerPlayer: number   // 1-10 rounds
  turnTimeLimit: number     // 30-300 seconds
  votingTimeLimit: number   // 5-60 seconds (future feature)
  gameMode: 'casual' | 'competitive'
}

socket.emit('room:create', settings, (room: Room) => {
  console.log('Room created:', room.code)
})
```

**Server Response:**
```typescript
interface Room {
  id: string
  code: string              // 6-character uppercase
  players: Player[]
  currentGame?: Game
  settings: RoomSettings
  createdAt: string
  status: 'waiting' | 'in_game' | 'finished'
}
```

**Example:**
```typescript
const settings: RoomSettings = {
  maxPlayers: 4,
  roundsPerPlayer: 2,
  turnTimeLimit: 60,
  votingTimeLimit: 20,
  gameMode: 'casual'
}

socket.emit('room:create', settings, (room) => {
  console.log(`Room ${room.code} created with ${room.players.length} players`)
})
```

#### room:join

Join an existing room using room code and nickname.

**Client Emit:**
```typescript
interface JoinResult {
  success: boolean
  room?: Room
  error?: string
}

socket.emit('room:join', 'ABCD12', 'PlayerName', (result: JoinResult) => {
  if (result.success) {
    console.log('Joined room:', result.room?.code)
  } else {
    console.error('Join failed:', result.error)
  }
})
```

**Possible Errors:**
- `"Room not found"` - Invalid room code
- `"Room is full"` - Maximum players reached
- `"Invalid nickname"` - Empty or invalid nickname
- `"Game already started"` - Cannot join active game

#### room:leave

Leave the current room.

**Client Emit:**
```typescript
socket.emit('room:leave')
```

**Server Response:**
- Removes player from room
- Updates remaining players
- Deletes room if empty
- Promotes new host if current host leaves

### 4.3 Room State Events

#### room:created

Emitted to creator when room is successfully created.

**Server Emit:**
```typescript
socket.emit('room:created', room: Room)
```

#### room:joined

Emitted to player who successfully joined.

**Server Emit:**
```typescript
socket.emit('room:joined', room: Room, player: Player)
```

#### room:updated

Broadcasted when room state changes (players join/leave, settings change).

**Server Emit:**
```typescript
socket.to(roomId).emit('room:updated', room: Room)
```

#### room:error

Emitted when room operation fails.

**Server Emit:**
```typescript
socket.emit('room:error', error: string)
```

### 4.4 Game Management Events

#### game:start

Start a new game (host only).

**Client Emit:**
```typescript
socket.emit('game:start')
```

**Requirements:**
- Player must be room host
- Minimum 2 players in room
- No active game in progress

**Server Response:**
- Creates new game instance
- Starts first round
- Broadcasts game:started to all players

#### game:started

Broadcasted when game begins.

**Server Emit:**
```typescript
interface Game {
  id: string
  roomId: string
  rounds: Round[]
  currentRoundIndex: number
  status: 'waiting' | 'active' | 'voting' | 'finished'
  scores: Record<string, number>
  startedAt: string
}

socket.to(roomId).emit('game:started', game: Game)
```

#### game:updated

Broadcasted when game state changes.

**Server Emit:**
```typescript
socket.to(roomId).emit('game:updated', game: Game)
```

#### game:ended

Broadcasted when game completes.

**Server Emit:**
```typescript
socket.to(roomId).emit('game:ended', game: Game)
```

#### game:results

Emitted with complete game results.

**Server Emit:**
```typescript
socket.to(roomId).emit('game:results', results: GameResults)
```

### 4.5 Turn Management Events

#### turn:started

Broadcasted when a new turn begins.

**Server Emit:**
```typescript
interface Round {
  index: number
  playerId: string
  prompt: string
  previousImage?: string
  generatedImage?: string
  artworkDescription?: string
  selectedStyle?: StyleSelection
  votes: Vote[]
  status: 'waiting' | 'generating' | 'voting' | 'completed'
  startedAt: string
  completedAt?: string
}

socket.to(roomId).emit('turn:started', round: Round, playerId: string)
```

#### turn:timer

Broadcasted every second with remaining time.

**Server Emit:**
```typescript
socket.to(roomId).emit('turn:timer', timeRemaining: number)
```

#### turn:ended

Broadcasted when turn completes.

**Server Emit:**
```typescript
socket.to(roomId).emit('turn:ended', round: Round)
```

### 4.6 Prompt and Image Events

#### prompt:submit

Submit prompt for current turn.

**Client Emit:**
```typescript
interface StyleSelection {
  primaryStyle: ArtStyle
  accentStyle?: ArtStyle
  blendStrength: number     // 0.1-1.0
  preserveExisting: boolean
}

socket.emit('prompt:submit', prompt: string, styleSelection?: StyleSelection)
```

**Validation:**
- Must be current player's turn
- Prompt must be non-empty string
- Maximum prompt length: 500 characters

#### prompt:processing

Broadcasted when AI generation starts.

**Server Emit:**
```typescript
socket.to(roomId).emit('prompt:processing')
```

#### image:generated

Broadcasted when image generation completes.

**Server Emit:**
```typescript
socket.to(roomId).emit('image:generated', imageUrl: string)
```

#### image:failed

Emitted when image generation fails.

**Server Emit:**
```typescript
socket.emit('image:failed', error: string)
```

### 4.7 Player Events

#### player:joined

Broadcasted when new player joins room.

**Server Emit:**
```typescript
interface Player {
  id: string                // Socket ID
  nickname: string
  score: number
  isHost: boolean
  status: 'connected' | 'disconnected'
}

socket.to(roomId).emit('player:joined', player: Player)
```

#### player:left

Broadcasted when player leaves room.

**Server Emit:**
```typescript
socket.to(roomId).emit('player:left', playerId: string)
```

#### player:updated

Broadcasted when player state changes.

**Server Emit:**
```typescript
socket.to(roomId).emit('player:updated', player: Player)
```

### 4.8 Gallery Events

#### gallery:get

Request gallery artworks with optional filters.

**Client Emit:**
```typescript
interface GalleryFilters {
  category?: string
  style?: string
  limit?: number
  offset?: number
  sortBy?: 'recent' | 'popular' | 'players'
}

socket.emit('gallery:get', (artworks: GameResults[]) => {
  console.log('Gallery artworks:', artworks.length)
}, filters?: GalleryFilters)
```

#### gallery:setMainImage

Set main display image for artwork (host only).

**Client Emit:**
```typescript
socket.emit('gallery:setMainImage', gameId: string, imageIndex: number, (success: boolean) => {
  console.log('Main image updated:', success)
})
```

### 4.9 Style System Events

#### styles:get

Request available art styles database.

**Client Emit:**
```typescript
interface StyleDatabase {
  categories: ArtCategory[]
  styles: ArtStyle[]
}

socket.emit('styles:get', (data: StyleDatabase) => {
  console.log('Art styles loaded:', data.styles.length)
})
```

## 5. Data Schemas

### 5.1 Core Types

#### Player Schema
```typescript
interface Player {
  id: string                // Unique socket ID
  nickname: string          // Display name (3-20 characters)
  score: number            // Game score (competitive mode)
  isHost: boolean          // Room host privileges
  status: 'connected' | 'disconnected' | 'reconnecting'
}
```

#### Room Schema
```typescript
interface Room {
  id: string               // Unique room ID
  code: string            // 6-character access code
  players: Player[]       // Connected players
  currentGame?: Game      // Active game instance
  settings: RoomSettings  // Game configuration
  createdAt: string       // ISO timestamp
  status: 'waiting' | 'in_game' | 'finished'
}

interface RoomSettings {
  maxPlayers: number      // 2-8
  roundsPerPlayer: number // 1-10
  turnTimeLimit: number   // 30-300 seconds
  votingTimeLimit: number // 5-60 seconds
  gameMode: 'casual' | 'competitive'
}
```

#### Game Schema
```typescript
interface Game {
  id: string              // Unique game ID
  roomId: string         // Parent room ID
  rounds: Round[]        // Game rounds
  currentRoundIndex: number
  status: 'waiting' | 'active' | 'voting' | 'finished'
  scores: Record<string, number> // Player scores
  startedAt: string      // ISO timestamp
  endedAt?: string       // ISO timestamp
}

interface Round {
  index: number          // Round number (0-based)
  playerId: string       // Current player ID
  prompt: string         // User prompt
  previousImage?: string // Previous round image URL
  generatedImage?: string // Generated image URL
  artworkDescription?: string // AI description
  selectedStyle?: StyleSelection
  votes: Vote[]          // Player votes (competitive mode)
  status: 'waiting' | 'generating' | 'voting' | 'completed'
  startedAt: string      // ISO timestamp
  completedAt?: string   // ISO timestamp
}
```

### 5.2 Art Style System

#### Art Style Schema
```typescript
interface ArtStyle {
  id: string             // Unique style identifier
  name: string           // Display name
  category: ArtCategory  // Style category
  subcategory: string    // Subcategory name
  description: string    // Style description
  promptTemplate: string // Template for prompt enhancement
  parameters: {          // Generation parameters
    strength?: number
    guidanceScale?: number
  }
  tags: string[]         // Search tags
  isPopular?: boolean    // Featured style
}

interface ArtCategory {
  id: string             // Category ID
  name: string           // Display name
  description: string    // Category description
  icon: string           // Emoji icon
  subcategories: string[] // Available subcategories
}

interface StyleSelection {
  primaryStyle: ArtStyle
  accentStyle?: ArtStyle
  blendStrength: number  // 0.1-1.0
  preserveExisting: boolean
}
```

### 5.3 Gallery System

#### Gallery Schema
```typescript
interface GameResults {
  gameId: string
  roomCode: string
  completedAt: string
  totalRounds: number
  players: Player[]
  mainDisplayImageIndex: number
  imageSequence: ImageRound[]
}

interface ImageRound {
  roundIndex: number
  playerId: string
  playerName: string
  prompt: string
  imageUrl: string
  artworkDescription: string
  generatedAt: string
  artStyle?: {
    id: string
    name: string
    category: string
  }
  styleHistory: string[]
}
```

## 6. Error Handling

### 6.1 Error Response Format

```typescript
interface APIError {
  error: {
    code: string           // Error code
    message: string        // Human-readable message
    details?: any          // Additional error details
    timestamp: string      // ISO timestamp
    path?: string          // API endpoint
  }
}
```

### 6.2 Common Error Codes

#### HTTP Status Codes
- `400 Bad Request` - Invalid request parameters
- `401 Unauthorized` - Authentication required
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `429 Too Many Requests` - Rate limit exceeded
- `500 Internal Server Error` - Server error
- `503 Service Unavailable` - Service temporarily unavailable

#### WebSocket Error Codes
```typescript
interface WebSocketErrors {
  // Room Errors
  ROOM_NOT_FOUND: 'Room with specified code does not exist'
  ROOM_FULL: 'Room has reached maximum player capacity'
  ROOM_GAME_ACTIVE: 'Cannot join room with active game'
  
  // Game Errors
  NOT_HOST: 'Only room host can perform this action'
  INSUFFICIENT_PLAYERS: 'Minimum 2 players required to start game'
  GAME_NOT_ACTIVE: 'No active game in room'
  NOT_PLAYER_TURN: 'Action not allowed, not player turn'
  
  // Prompt Errors
  INVALID_PROMPT: 'Prompt must be non-empty string'
  PROMPT_TOO_LONG: 'Prompt exceeds maximum length'
  GENERATION_FAILED: 'AI image generation failed'
  
  // Connection Errors
  SESSION_EXPIRED: 'Player session has expired'
  DUPLICATE_NICKNAME: 'Nickname already in use'
  INVALID_NICKNAME: 'Nickname must be 3-20 characters'
}
```

## 7. Rate Limiting

### 7.1 Rate Limit Configuration

```typescript
interface RateLimits {
  // REST API Limits
  api: {
    windowMs: 60000,        // 1 minute window
    maxRequests: 100,       // 100 requests per minute
    standardHeaders: true,
    legacyHeaders: false
  },
  
  // WebSocket Event Limits
  websocket: {
    roomCreate: {
      windowMs: 300000,     // 5 minute window
      maxEvents: 5          // 5 room creations per 5 minutes
    },
    promptSubmit: {
      windowMs: 60000,      // 1 minute window
      maxEvents: 10         // 10 prompts per minute
    },
    galleryRequest: {
      windowMs: 60000,      // 1 minute window
      maxEvents: 30         // 30 gallery requests per minute
    }
  },
  
  // AI Service Limits
  aiGeneration: {
    perPlayer: {
      windowMs: 300000,     // 5 minute window
      maxGenerations: 10    // 10 generations per player per 5 minutes
    },
    global: {
      concurrentJobs: 5,    // Maximum concurrent AI jobs
      queueLimit: 50        // Maximum queued jobs
    }
  }
}
```

### 7.2 Rate Limit Headers

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 85
X-RateLimit-Reset: 1692567600
X-RateLimit-Window: 60000
```

## 8. Client Integration Examples

### 8.1 React Hook Integration

```typescript
// useArtLoop Hook
import { useEffect, useRef, useState } from 'react'
import { io, Socket } from 'socket.io-client'

interface UseArtLoopReturn {
  socket: Socket | null
  isConnected: boolean
  room: Room | null
  createRoom: (settings: RoomSettings) => Promise<Room>
  joinRoom: (code: string, nickname: string) => Promise<boolean>
  submitPrompt: (prompt: string, style?: StyleSelection) => void
}

export function useArtLoop(): UseArtLoopReturn {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [room, setRoom] = useState<Room | null>(null)
  
  useEffect(() => {
    const newSocket = io(process.env.NEXT_PUBLIC_SERVER_URL!)
    
    newSocket.on('connect', () => {
      setIsConnected(true)
      setSocket(newSocket)
    })
    
    newSocket.on('disconnect', () => {
      setIsConnected(false)
    })
    
    newSocket.on('room:updated', (updatedRoom: Room) => {
      setRoom(updatedRoom)
    })
    
    return () => {
      newSocket.close()
    }
  }, [])
  
  const createRoom = async (settings: RoomSettings): Promise<Room> => {
    return new Promise((resolve, reject) => {
      if (!socket) {
        reject(new Error('Socket not connected'))
        return
      }
      
      socket.emit('room:create', settings, (room: Room) => {
        setRoom(room)
        resolve(room)
      })
      
      socket.on('room:error', (error: string) => {
        reject(new Error(error))
      })
    })
  }
  
  const joinRoom = async (code: string, nickname: string): Promise<boolean> => {
    return new Promise((resolve, reject) => {
      if (!socket) {
        reject(new Error('Socket not connected'))
        return
      }
      
      socket.emit('room:join', code, nickname, (result: JoinResult) => {
        if (result.success && result.room) {
          setRoom(result.room)
          resolve(true)
        } else {
          reject(new Error(result.error))
        }
      })
    })
  }
  
  const submitPrompt = (prompt: string, style?: StyleSelection) => {
    if (socket && prompt.trim()) {
      socket.emit('prompt:submit', prompt, style)
    }
  }
  
  return {
    socket,
    isConnected,
    room,
    createRoom,
    joinRoom,
    submitPrompt
  }
}
```

### 8.2 Complete Game Flow Example

```typescript
// Complete game implementation
export function GameFlow() {
  const { socket, room, createRoom, joinRoom, submitPrompt } = useArtLoop()
  const [gameState, setGameState] = useState<'lobby' | 'waiting' | 'playing' | 'results'>('lobby')
  const [currentGame, setCurrentGame] = useState<Game | null>(null)
  
  useEffect(() => {
    if (!socket) return
    
    socket.on('game:started', (game: Game) => {
      setCurrentGame(game)
      setGameState('playing')
    })
    
    socket.on('turn:started', (round: Round, playerId: string) => {
      if (playerId === socket.id) {
        setGameState('playing')
      } else {
        setGameState('waiting')
      }
    })
    
    socket.on('game:results', (results: GameResults) => {
      setGameState('results')
    })
    
    return () => {
      socket.off('game:started')
      socket.off('turn:started')
      socket.off('game:results')
    }
  }, [socket])
  
  const handleCreateRoom = async () => {
    try {
      await createRoom({
        maxPlayers: 4,
        roundsPerPlayer: 2,
        turnTimeLimit: 60,
        votingTimeLimit: 20,
        gameMode: 'casual'
      })
      setGameState('lobby')
    } catch (error) {
      console.error('Failed to create room:', error)
    }
  }
  
  const handleStartGame = () => {
    if (socket) {
      socket.emit('game:start')
    }
  }
  
  const handleSubmitPrompt = (prompt: string, style: StyleSelection) => {
    submitPrompt(prompt, style)
    setGameState('waiting')
  }
  
  return (
    <div className="game-flow">
      {gameState === 'lobby' && room && (
        <GameLobby 
          room={room} 
          onStartGame={handleStartGame}
        />
      )}
      
      {gameState === 'playing' && (
        <PromptInput 
          onSubmit={handleSubmitPrompt}
        />
      )}
      
      {gameState === 'waiting' && (
        <WaitingScreen 
          message="AI is generating your image..."
        />
      )}
      
      {gameState === 'results' && (
        <GameResults />
      )}
    </div>
  )
}
```

---

**Document Version**: 1.0  
**Last Updated**: August 2025  
**API Version**: v1  
**Next Review**: September 2025