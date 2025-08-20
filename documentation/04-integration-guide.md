# AiArtBrush Integration Guide

## 1. Overview

This document provides comprehensive integration guidance for the AiArtBrush system, covering external service integrations, API configurations, third-party dependencies, and extension points for future development.

## 2. External Service Integrations

### 2.1 Google Gemini AI Integration

#### 2.1.1 Service Overview
Google Gemini AI is used for intelligent prompt enhancement, providing context-aware improvements to user prompts for better image generation results.

#### 2.1.2 Configuration

```typescript
// Gemini Configuration
interface GeminiConfig {
  apiKey: string                    // GEMINI_API_KEY environment variable
  model: 'gemini-1.5-flash'       // Fast model for prompt enhancement
  generationConfig: {
    temperature: 0.7,              // Creativity level
    topP: 0.8,                     // Nucleus sampling
    topK: 40,                      // Top-K sampling
    maxOutputTokens: 1024,         // Response length limit
  },
  safetySettings: [
    {
      category: 'HARM_CATEGORY_HARASSMENT',
      threshold: 'BLOCK_MEDIUM_AND_ABOVE'
    },
    {
      category: 'HARM_CATEGORY_HATE_SPEECH',
      threshold: 'BLOCK_MEDIUM_AND_ABOVE'
    }
  ]
}
```

#### 2.1.3 Implementation Details

```typescript
// Service Integration (/backend/src/services/aiService.ts)
import { GoogleGenerativeAI } from '@google/generative-ai'

class GeminiService {
  private client: GoogleGenerativeAI
  private model: GenerativeModel
  
  constructor() {
    this.client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
    this.model = this.client.getGenerativeModel({ model: 'gemini-1.5-flash' })
  }
  
  async enhancePrompt(
    userPrompt: string, 
    artworkContext: string, 
    styleContext: StyleSelection
  ): Promise<string> {
    const enhancementPrompt = this.buildEnhancementPrompt(
      userPrompt, 
      artworkContext, 
      styleContext
    )
    
    try {
      const result = await this.model.generateContent(enhancementPrompt)
      return result.response.text()
    } catch (error) {
      console.error('Gemini enhancement failed:', error)
      return userPrompt // Fallback to original prompt
    }
  }
}
```

#### 2.1.4 API Limits and Quotas

```typescript
// Rate Limiting Configuration
interface GeminiLimits {
  requestsPerMinute: 60,           // Free tier limit
  requestsPerDay: 1500,            // Daily quota
  maxPromptLength: 30720,          // Characters (30k)
  maxResponseLength: 2048,         // Tokens
  timeout: 30000,                  // 30 second timeout
  
  errorHandling: {
    quotaExceeded: 'Use original prompt',
    networkError: 'Retry with exponential backoff',
    invalidResponse: 'Parse and use partial response'
  }
}
```

### 2.2 Replicate AI Integration

#### 2.2.1 Service Overview
Replicate provides access to Stable Diffusion XL for high-quality image generation, supporting both text-to-image and image-to-image workflows.

#### 2.2.2 Configuration

```typescript
// Replicate Configuration
interface ReplicateConfig {
  apiToken: string,                              // REPLICATE_API_TOKEN
  model: 'stability-ai/sdxl:7762fd07',          // SDXL model version
  baseUrl: 'https://api.replicate.com',
  
  defaultParams: {
    width: 1024,
    height: 1024,
    num_outputs: 1,
    scheduler: 'K_EULER',
    num_inference_steps: 20,
    guidance_scale: 7.5,
    prompt_strength: 0.8,                        // For img2img
    negative_prompt: 'blurry, bad quality, distorted, ugly'
  },
  
  limits: {
    maxConcurrentJobs: 5,
    timeoutMs: 300000,                          // 5 minutes
    retryAttempts: 3,
    retryDelayMs: 5000
  }
}
```

#### 2.2.3 Implementation Details

```typescript
// Replicate Service Integration
import Replicate from 'replicate'

class ReplicateService {
  private client: Replicate
  
  constructor() {
    this.client = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN!
    })
  }
  
  async generateImage(params: GenerationParams): Promise<string> {
    const input = this.buildReplicateInput(params)
    
    try {
      const output = await this.client.run(
        'stability-ai/sdxl:7762fd07cf6d9b2b8a4f25ade0f8b0f5bf2e7b0f',
        { input }
      ) as string[]
      
      return output[0] // Return first generated image
    } catch (error) {
      console.error('Replicate generation failed:', error)
      throw new Error('Image generation failed')
    }
  }
  
  private buildReplicateInput(params: GenerationParams) {
    return {
      prompt: params.enhancedPrompt,
      image: params.previousImage,              // For img2img
      width: 1024,
      height: 1024,
      num_outputs: 1,
      scheduler: params.scheduler || 'K_EULER',
      num_inference_steps: params.inferenceSteps || 20,
      guidance_scale: params.guidanceScale || 7.5,
      prompt_strength: params.strength || 0.8,
      negative_prompt: params.negativePrompt,
      seed: params.seed                         // Optional for reproducibility
    }
  }
}
```

#### 2.2.4 Cost Management

```typescript
// Cost Optimization Strategies
interface CostOptimization {
  prediction_pricing: {
    base_cost: '$0.0025 per second',
    avg_generation_time: '10-30 seconds',
    estimated_cost_per_image: '$0.025-$0.075'
  },
  
  optimization_strategies: {
    parameter_tuning: {
      inference_steps: 'Reduce from 50 to 20 for faster generation',
      guidance_scale: 'Use 7.5 instead of 15 for efficiency',
      image_size: 'Use 1024x1024 as standard resolution'
    },
    
    queue_management: {
      max_concurrent: 5,
      batch_processing: false,              // SDXL doesn't support batching
      priority_queue: 'Implement if needed for paid tiers'
    },
    
    caching: {
      duplicate_detection: 'Hash prompts to avoid regeneration',
      result_caching: 'Store results with prompt fingerprints',
      style_templates: 'Pre-generate common style combinations'
    }
  }
}
```

### 2.3 Redis Integration

#### 2.3.1 Service Overview
Redis serves as the primary database for real-time data storage, session management, and game state persistence.

#### 2.3.2 Configuration

```typescript
// Redis Configuration
interface RedisConfig {
  development: {
    host: 'localhost',
    port: 6379,
    password: undefined,
    db: 0,
    retryDelayOnFailover: 100,
    maxRetriesPerRequest: 3
  },
  
  production: {
    url: process.env.REDIS_URL,               // Upstash or other managed Redis
    tls: true,
    retryDelayOnFailover: 500,
    maxRetriesPerRequest: 10,
    connectTimeout: 60000,
    commandTimeout: 5000
  },
  
  keyPatterns: {
    rooms: 'room:{roomId}',
    roomCodes: 'room:code:{roomCode}',
    games: 'game:{gameId}',
    sessions: 'session:{socketId}',
    gameResults: 'game_results:{gameId}',
    gallery: 'gallery:{gameId}',
    galleryIndex: 'gallery:index',
    likes: 'gallery:likes:{gameId}',
    featured: 'gallery:featured'
  },
  
  ttlSeconds: {
    rooms: 3600,                              // 1 hour
    games: 7200,                              // 2 hours  
    sessions: 3600,                           // 1 hour
    gameResults: 604800,                      // 7 days
    gallery: 2592000                          // 30 days
  }
}
```

#### 2.3.3 Implementation Details

```typescript
// Redis Service Layer (/backend/src/services/redisService.ts)
import Redis from 'ioredis'

class RedisService {
  private client: Redis
  
  constructor() {
    this.client = new Redis(process.env.REDIS_URL || {
      host: 'localhost',
      port: 6379,
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3
    })
    
    this.client.on('connect', () => {
      console.log('✅ Redis: Successfully connected')
    })
    
    this.client.on('error', (error) => {
      console.error('❌ Redis: Connection error:', error)
    })
  }
  
  // Generic CRUD operations with TTL
  async set(key: string, value: any, ttl?: number): Promise<void> {
    const serialized = JSON.stringify(value)
    if (ttl) {
      await this.client.setex(key, ttl, serialized)
    } else {
      await this.client.set(key, serialized)
    }
  }
  
  async get<T>(key: string): Promise<T | null> {
    const value = await this.client.get(key)
    return value ? JSON.parse(value) : null
  }
  
  async delete(key: string): Promise<void> {
    await this.client.del(key)
  }
  
  // Atomic operations for game state
  async updateRoomAtomically(
    roomId: string, 
    updateFn: (room: Room) => Room
  ): Promise<Room | null> {
    const key = `room:${roomId}`
    
    // Use Redis transaction for atomic updates
    const multi = this.client.multi()
    const room = await this.get<Room>(key)
    
    if (!room) return null
    
    const updatedRoom = updateFn(room)
    multi.setex(key, 3600, JSON.stringify(updatedRoom))
    
    await multi.exec()
    return updatedRoom
  }
}
```

#### 2.3.4 Production Deployment (Upstash)

```typescript
// Upstash Integration Configuration
interface UpstashConfig {
  connectionString: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
  
  features: {
    globalReplication: true,               // Multi-region support
    autoScaling: true,                     // Pay-per-request pricing
    encryption: true,                      // TLS encryption
    backups: true,                         // Automated backups
    monitoring: true                       // Built-in observability
  },
  
  limits: {
    maxConnections: 1000,                  // Concurrent connections
    maxDatabaseSize: '1 GB',               // Free tier limit
    maxRequestsPerSecond: 1000,            // Rate limits
    commandTimeout: 1000                   // 1 second timeout
  }
}
```

### 2.4 Socket.io Integration

#### 2.4.1 Service Overview
Socket.io enables real-time bidirectional communication between clients and server for live gameplay updates.

#### 2.4.2 Configuration

```typescript
// Socket.io Configuration
interface SocketIOConfig {
  server: {
    cors: {
      origin: [process.env.FRONTEND_URL, 'http://localhost:3000'],
      methods: ['GET', 'POST'],
      allowedHeaders: ['*'],
      credentials: false
    },
    
    connectionStateRecovery: {
      maxDisconnectionDuration: 2 * 60 * 1000,    // 2 minutes
      skipMiddlewares: true
    },
    
    transports: ['websocket', 'polling'],
    
    pingTimeout: 60000,                            // 60 seconds
    pingInterval: 25000,                           // 25 seconds
    upgradeTimeout: 10000,                         // 10 seconds
    maxHttpBufferSize: 1e6                         // 1MB
  },
  
  client: {
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 20000,
    forceNew: false
  }
}
```

#### 2.4.3 Event Schema

```typescript
// Socket Event Definitions (/shared/src/types.ts)
interface ServerToClientEvents {
  // Room Events
  'room:created': (room: Room) => void
  'room:joined': (room: Room, player: Player) => void
  'room:updated': (room: Room) => void
  'room:error': (error: string) => void
  
  // Game Events
  'game:started': (game: Game) => void
  'game:updated': (game: Game) => void
  'game:ended': (game: Game) => void
  'game:results': (results: GameResults) => void
  
  // Turn Events
  'turn:started': (round: Round, playerId: string) => void
  'turn:timer': (timeRemaining: number) => void
  'turn:ended': (round: Round) => void
  
  // Image Events
  'prompt:processing': () => void
  'image:generated': (imageUrl: string) => void
  'image:failed': (error: string) => void
  
  // Player Events
  'player:joined': (player: Player) => void
  'player:left': (playerId: string) => void
  'player:updated': (player: Player) => void
  
  // Voting Events
  'voting:started': (round: Round) => void
  'voting:ended': (results: VotingResults) => void
  'vote:received': (playerId: string) => void
  
  // Score Events
  'scores:updated': (scores: Record<string, number>) => void
}

interface ClientToServerEvents {
  // Room Management
  'room:create': (settings: RoomSettings, callback: (room: Room) => void) => void
  'room:join': (code: string, nickname: string, callback: (result: JoinResult) => void) => void
  'room:leave': () => void
  
  // Game Control
  'game:start': () => void
  'prompt:submit': (prompt: string, styleSelection?: StyleSelection) => void
  'vote:cast': (vote: 'up' | 'down') => void
  
  // Data Requests
  'styles:get': (callback: (styles: StyleDatabase) => void) => void
  'gallery:get': (callback: (artworks: GameResults[]) => void, filters?: GalleryFilters) => void
  'gallery:setMainImage': (gameId: string, imageIndex: number, callback: (success: boolean) => void) => void
}
```

## 3. Frontend Integration Patterns

### 3.1 Socket.io Client Integration

```typescript
// Custom Socket Hook (/frontend/hooks/useSocket.ts)
import { useEffect, useRef } from 'react'
import { io, Socket } from 'socket.io-client'
import { useStore } from '@/lib/store'

export function useSocket() {
  const socketRef = useRef<Socket | null>(null)
  const { setSocket, setConnected } = useStore()
  
  useEffect(() => {
    if (!socketRef.current) {
      // Create singleton socket connection
      socketRef.current = io(process.env.NEXT_PUBLIC_SERVER_URL!, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000
      })
      
      // Connection event handlers
      socketRef.current.on('connect', () => {
        console.log('Socket connected:', socketRef.current?.id)
        setConnected(true)
        setSocket(socketRef.current)
      })
      
      socketRef.current.on('disconnect', () => {
        console.log('Socket disconnected')
        setConnected(false)
      })
      
      // Game event handlers
      socketRef.current.on('room:updated', (room) => {
        useStore.getState().setRoom(room)
      })
      
      socketRef.current.on('game:updated', (game) => {
        useStore.getState().updateGame(game)
      })
      
      // Error handlers
      socketRef.current.on('connect_error', (error) => {
        console.error('Socket connection error:', error)
        setConnected(false)
      })
    }
    
    return () => {
      // Cleanup on unmount
      socketRef.current?.disconnect()
      socketRef.current = null
    }
  }, [setSocket, setConnected])
  
  return socketRef.current
}
```

### 3.2 State Management Integration

```typescript
// Zustand Store Integration (/frontend/lib/store.ts)
import { create } from 'zustand'
import { Socket } from 'socket.io-client'

interface AppState {
  // Socket connection
  socket: Socket | null
  isConnected: boolean
  
  // Game state
  room: Room | null
  player: Player | null
  currentGame: Game | null
  
  // UI state
  isProcessing: boolean
  error: string | null
  
  // Actions
  setSocket: (socket: Socket | null) => void
  setConnected: (connected: boolean) => void
  setRoom: (room: Room | null) => void
  updateGame: (game: Game) => void
  setError: (error: string | null) => void
}

export const useStore = create<AppState>((set, get) => ({
  // Initial state
  socket: null,
  isConnected: false,
  room: null,
  player: null,
  currentGame: null,
  isProcessing: false,
  error: null,
  
  // Actions
  setSocket: (socket) => set({ socket }),
  setConnected: (isConnected) => set({ isConnected }),
  setRoom: (room) => set({ room }),
  
  updateGame: (game) => {
    const { room } = get()
    if (room) {
      set({
        currentGame: game,
        room: { ...room, currentGame: game }
      })
    }
  },
  
  setError: (error) => set({ error })
}))
```

### 3.3 Component Integration Patterns

```typescript
// Component Integration Example
import { useSocket } from '@/hooks/useSocket'
import { useStore } from '@/lib/store'

export function GameRoom() {
  const socket = useSocket()
  const { room, player, currentGame, isProcessing } = useStore()
  
  const handleStartGame = () => {
    if (socket && player?.isHost) {
      socket.emit('game:start')
    }
  }
  
  const handleSubmitPrompt = (prompt: string, style: StyleSelection) => {
    if (socket && prompt.trim()) {
      socket.emit('prompt:submit', prompt, style)
      useStore.getState().setProcessing(true)
    }
  }
  
  // Real-time UI updates based on game state
  return (
    <div className="game-room">
      {room && (
        <>
          <RoomInfo room={room} />
          {currentGame ? (
            <GameInterface 
              game={currentGame}
              onSubmitPrompt={handleSubmitPrompt}
              isProcessing={isProcessing}
            />
          ) : (
            <GameLobby 
              room={room}
              canStart={player?.isHost && room.players.length >= 2}
              onStartGame={handleStartGame}
            />
          )}
        </>
      )}
    </div>
  )
}
```

## 4. API Integration Specifications

### 4.1 REST API Endpoints

```typescript
// API Endpoint Specifications
interface APIEndpoints {
  health: {
    method: 'GET',
    path: '/health',
    description: 'Server health check',
    response: {
      status: 'ok' | 'error',
      timestamp: string,
      uptime: number,
      services: {
        redis: 'connected' | 'disconnected',
        queue: 'active' | 'paused'
      }
    }
  },
  
  gameResults: {
    method: 'GET',
    path: '/api/game-results/:gameId',
    description: 'Retrieve completed game results',
    parameters: {
      gameId: string
    },
    response: GameResults | null,
    errors: {
      404: 'Game not found',
      500: 'Server error'
    }
  },
  
  staticImages: {
    method: 'GET',
    path: '/images/:filename',
    description: 'Serve stored images',
    parameters: {
      filename: string   // Format: {gameId}-round-{index}.png
    },
    headers: {
      'Cache-Control': 'public, max-age=86400',
      'Content-Type': 'image/png'
    }
  }
}
```

### 4.2 WebSocket API Specification

```typescript
// WebSocket Event Documentation
interface WebSocketAPI {
  roomManagement: {
    'room:create': {
      description: 'Create new game room',
      payload: RoomSettings,
      response: Room,
      errors: ['Invalid settings', 'Server error']
    },
    
    'room:join': {
      description: 'Join existing room',
      payload: { code: string, nickname: string },
      response: { success: boolean, room?: Room, error?: string },
      errors: ['Room not found', 'Room full', 'Invalid nickname']
    }
  },
  
  gameFlow: {
    'game:start': {
      description: 'Start game (host only)',
      payload: void,
      broadcast: 'game:started',
      errors: ['Not host', 'Insufficient players', 'Game already active']
    },
    
    'prompt:submit': {
      description: 'Submit round prompt',
      payload: { prompt: string, style?: StyleSelection },
      broadcast: ['prompt:processing', 'image:generated'],
      errors: ['Not your turn', 'Invalid prompt', 'Generation failed']
    }
  }
}
```

## 5. Third-Party Dependencies

### 5.1 Frontend Dependencies

```json
{
  "core": {
    "next": "14.2.13",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "typescript": "^5.0.0"
  },
  
  "ui": {
    "@radix-ui/react-dialog": "^1.0.5",
    "@radix-ui/react-select": "^1.2.2",
    "@radix-ui/react-button": "^1.0.3",
    "lucide-react": "^0.378.0",
    "tailwindcss": "^3.4.1"
  },
  
  "state": {
    "zustand": "^4.5.2"
  },
  
  "networking": {
    "socket.io-client": "^4.7.5"
  },
  
  "development": {
    "eslint": "^8.57.0",
    "eslint-config-next": "14.2.13",
    "@types/node": "^20.0.0",
    "@types/react": "^18.3.1"
  }
}
```

### 5.2 Backend Dependencies

```json
{
  "core": {
    "express": "^4.19.2",
    "typescript": "^5.0.0",
    "tsx": "^4.7.1"
  },
  
  "realtime": {
    "socket.io": "^4.7.5"
  },
  
  "database": {
    "ioredis": "^5.3.2"
  },
  
  "queue": {
    "bull": "^4.12.2"
  },
  
  "ai": {
    "replicate": "^0.25.2",
    "@google/generative-ai": "^0.24.1"
  },
  
  "utilities": {
    "nanoid": "^5.0.6",
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "zod": "^3.22.4"
  },
  
  "development": {
    "@types/express": "^4.17.21",
    "@types/cors": "^2.8.17",
    "@types/node": "^20.0.0",
    "nodemon": "^3.1.0"
  }
}
```

### 5.3 Dependency Security Considerations

```typescript
// Security Configuration for Dependencies
interface SecurityConfig {
  vulnerabilityScanning: {
    tool: 'npm audit',
    frequency: 'Weekly',
    autoFix: 'Low and medium severity',
    reporting: 'Security team notification'
  },
  
  updatePolicy: {
    major: 'Manual review required',
    minor: 'Automated with testing',
    patch: 'Automated deployment',
    security: 'Immediate priority update'
  },
  
  trustedSources: [
    'npm registry',
    'GitHub packages',
    'Official vendor packages'
  ],
  
  bannedPackages: [
    // Packages with known security issues
    'Any packages with high severity vulnerabilities'
  ]
}
```

## 6. Environment Configuration

### 6.1 Development Environment

```bash
# Frontend Environment (.env.local)
NEXT_PUBLIC_SERVER_URL=http://localhost:3001
NEXT_PUBLIC_WS_URL=ws://localhost:3001
NEXT_PUBLIC_ENVIRONMENT=development

# Backend Environment (.env)
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
REDIS_URL=redis://localhost:6379

# External APIs
GEMINI_API_KEY=your_gemini_api_key_here
REPLICATE_API_TOKEN=your_replicate_token_here

# AI Configuration
AI_STRENGTH=0.15
AI_GUIDANCE_SCALE=7.5
AI_INFERENCE_STEPS=20
AI_SCHEDULER=K_EULER
AI_NEGATIVE_PROMPT=blurry, bad quality, distorted, ugly
AI_IMAGE_SIZE=1024

# Game Configuration
GAME_MAX_PLAYERS=8
GAME_ROUNDS_PER_PLAYER=2
GAME_TURN_TIME_LIMIT=60
GAME_VOTING_TIME_LIMIT=20
GAME_DEFAULT_MODE=casual
```

### 6.2 Production Environment

```bash
# Frontend Environment
NEXT_PUBLIC_SERVER_URL=https://your-backend-domain.com
NEXT_PUBLIC_WS_URL=wss://your-backend-domain.com
NEXT_PUBLIC_ENVIRONMENT=production
NEXT_PUBLIC_ANALYTICS_ID=your_analytics_id

# Backend Environment
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://your-frontend-domain.vercel.app

# Database
REDIS_URL=rediss://username:password@your-redis-host:6380
UPSTASH_REDIS_REST_URL=https://your-upstash-endpoint.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_upstash_token

# External APIs (Production Keys)
GEMINI_API_KEY=your_production_gemini_key
REPLICATE_API_TOKEN=your_production_replicate_token

# Monitoring
SENTRY_DSN=your_sentry_dsn
LOG_LEVEL=info
ENABLE_METRICS=true
```

## 7. Testing Integration

### 7.1 Frontend Testing

```typescript
// Testing Configuration for Socket Integration
import { render, screen, waitFor } from '@testing-library/react'
import { Server } from 'socket.io'
import { io as ClientIO } from 'socket.io-client'
import { createServer } from 'http'

describe('Socket Integration Tests', () => {
  let httpServer: any
  let ioServer: Server
  let clientSocket: any
  
  beforeEach((done) => {
    httpServer = createServer()
    ioServer = new Server(httpServer)
    httpServer.listen(() => {
      const port = httpServer.address().port
      clientSocket = ClientIO(`http://localhost:${port}`)
      clientSocket.on('connect', done)
    })
  })
  
  afterEach(() => {
    ioServer.close()
    clientSocket.close()
  })
  
  test('should handle room creation', async () => {
    const roomSettings = {
      maxPlayers: 4,
      roundsPerPlayer: 2,
      turnTimeLimit: 60,
      gameMode: 'casual'
    }
    
    clientSocket.emit('room:create', roomSettings)
    
    await waitFor(() => {
      expect(screen.getByText(/room created/i)).toBeInTheDocument()
    })
  })
})
```

### 7.2 Backend Testing

```typescript
// Integration Testing for External Services
import { AIService } from '../src/services/aiService'
import { RedisService } from '../src/services/redisService'

describe('AI Service Integration', () => {
  let aiService: AIService
  let redisService: RedisService
  
  beforeEach(() => {
    aiService = new AIService()
    redisService = new RedisService()
  })
  
  test('should generate image with fallback', async () => {
    const result = await aiService.generateImage({
      prompt: 'test prompt',
      previousImage: null,
      style: null
    })
    
    expect(result).toHaveProperty('imageUrl')
    expect(result.imageUrl).toMatch(/^https?:\/\//)
  })
  
  test('should handle Redis connection failure', async () => {
    // Mock Redis failure
    jest.spyOn(redisService, 'get').mockRejectedValue(new Error('Redis down'))
    
    const result = await redisService.get('test:key')
    expect(result).toBeNull()
  })
})
```

## 8. Monitoring and Observability Integration

### 8.1 Application Performance Monitoring

```typescript
// APM Integration Setup
interface APMConfig {
  sentry: {
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
    tracesSampleRate: 0.1,
    integrations: [
      'Express',
      'Redis',
      'Socket.io'
    ],
    beforeSend: (event) => {
      // Filter sensitive data
      if (event.exception) {
        delete event.user?.ip_address
      }
      return event
    }
  },
  
  customMetrics: {
    gameMetrics: [
      'games_created_total',
      'games_completed_total',
      'images_generated_total',
      'active_players_gauge'
    ],
    
    performance: [
      'image_generation_duration',
      'api_response_time',
      'websocket_latency'
    ],
    
    errors: [
      'ai_service_errors',
      'redis_connection_errors',
      'websocket_disconnections'
    ]
  }
}
```

### 8.2 Health Check Integration

```typescript
// Comprehensive Health Checks
interface HealthCheckService {
  async checkRedis(): Promise<HealthStatus> {
    try {
      await redis.ping()
      return { status: 'healthy', responseTime: Date.now() }
    } catch (error) {
      return { status: 'unhealthy', error: error.message }
    }
  },
  
  async checkAIServices(): Promise<HealthStatus> {
    const checks = await Promise.allSettled([
      this.checkGemini(),
      this.checkReplicate()
    ])
    
    return {
      status: checks.every(c => c.status === 'fulfilled') ? 'healthy' : 'degraded',
      services: {
        gemini: checks[0].status,
        replicate: checks[1].status
      }
    }
  },
  
  async checkQueue(): Promise<HealthStatus> {
    try {
      const waiting = await queue.waiting()
      const active = await queue.active()
      
      return {
        status: 'healthy',
        metrics: { waiting, active }
      }
    } catch (error) {
      return { status: 'unhealthy', error: error.message }
    }
  }
}
```

---

**Document Version**: 1.0  
**Last Updated**: August 2025  
**Next Review**: September 2025