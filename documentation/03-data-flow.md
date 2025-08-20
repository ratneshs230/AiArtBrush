# ART-loop Data Flow Document

## 1. Overview

This document describes the data flow patterns within the ART-loop system, covering user interactions, real-time communication, data persistence, and external service integrations. The system implements an event-driven architecture with real-time synchronization across multiple clients.

## 2. High-Level Data Flow

### 2.1 System Data Flow Diagram

```mermaid
flowchart TD
    subgraph "Client Layer"
        USER[User Input]
        UI[React UI Components]
        STATE[Zustand State]
        SOCKET[Socket.io Client]
    end
    
    subgraph "Transport Layer"
        HTTP[HTTP/REST]
        WS[WebSocket Connection]
    end
    
    subgraph "Application Layer"
        EXPRESS[Express Server]
        SOCKETIO[Socket.io Server]
        SERVICES[Backend Services]
        QUEUE[Bull Queue]
    end
    
    subgraph "Data Layer"
        REDIS[(Redis Database)]
        FILES[File System]
    end
    
    subgraph "External Services"
        REPLICATE[Replicate API]
        GEMINI[Google Gemini]
    end
    
    USER --> UI
    UI --> STATE
    STATE --> SOCKET
    STATE --> HTTP
    
    SOCKET --> WS
    HTTP --> EXPRESS
    WS --> SOCKETIO
    
    EXPRESS --> SERVICES
    SOCKETIO --> SERVICES
    SERVICES --> QUEUE
    SERVICES --> REDIS
    SERVICES --> FILES
    
    QUEUE --> REPLICATE
    QUEUE --> GEMINI
    
    REDIS --> SERVICES
    FILES --> EXPRESS
    EXPRESS --> HTTP
    SOCKETIO --> WS
    WS --> SOCKET
    HTTP --> STATE
    SOCKET --> STATE
    STATE --> UI
```

### 2.2 Data Flow Principles

- **Unidirectional Flow**: Data flows in predictable patterns from user input to state updates
- **Event-Driven**: Real-time updates propagate through WebSocket events
- **State Synchronization**: Multiple clients maintain synchronized game state
- **Asynchronous Processing**: Long-running operations (AI generation) handled via queues
- **Persistent Storage**: Critical data persisted in Redis with appropriate TTL

## 3. User Journey Data Flows

### 3.1 Room Creation and Joining Flow

```mermaid
sequenceDiagram
    participant User as User
    participant Frontend as Frontend
    participant Socket as Socket.io
    participant RoomService as Room Service
    participant Redis as Redis
    
    User->>Frontend: Click "Create Room"
    Frontend->>Frontend: Generate settings form
    User->>Frontend: Configure settings & submit
    Frontend->>Socket: emit('room:create', settings)
    Socket->>RoomService: createRoom(settings)
    RoomService->>RoomService: Generate 6-char code
    RoomService->>Redis: Store room data (TTL: 1hr)
    RoomService->>Redis: Store code mapping
    RoomService->>Socket: Room created
    Socket->>Frontend: emit('room:created', room)
    Frontend->>Frontend: Update state & navigate
    Frontend->>User: Display room code & interface
    
    Note over User,Redis: Room Joining Flow
    User->>Frontend: Enter room code & nickname
    Frontend->>Socket: emit('room:join', code, nickname)
    Socket->>RoomService: joinRoom(code, nickname)
    RoomService->>Redis: Fetch room by code
    RoomService->>Redis: Add player to room
    RoomService->>Socket: Join successful
    Socket->>Frontend: emit('room:joined', room, player)
    Socket->>Frontend: emit('room:updated', room) [to all]
    Frontend->>Frontend: Update state
    Frontend->>User: Show game lobby
```

### 3.2 Game Initialization and Turn Management Flow

```mermaid
sequenceDiagram
    participant Host as Host Player
    participant Players as Other Players
    participant Frontend as Frontend
    participant Socket as Socket.io
    participant GameService as Game Service
    participant Redis as Redis
    
    Host->>Frontend: Click "Start Game"
    Frontend->>Socket: emit('game:start')
    Socket->>GameService: startGame()
    GameService->>GameService: Validate players (≥2)
    GameService->>Redis: Create game object
    GameService->>Redis: Update room status
    GameService->>Socket: Game started
    Socket->>Frontend: emit('game:started', game) [to all]
    Socket->>Frontend: emit('room:updated', room) [to all]
    Frontend->>Host: Show game interface
    Frontend->>Players: Show game interface
    
    Note over Host,Redis: First Turn Initialization
    GameService->>GameService: Calculate first player
    GameService->>Redis: Create first round
    GameService->>Socket: Start first turn
    Socket->>Frontend: emit('turn:started', round, playerId) [to all]
    Socket->>Frontend: emit('turn:timer', timeRemaining) [to all]
    Frontend->>Frontend: Update UI for current player
    Frontend->>Host: Show prompt input (if their turn)
    Frontend->>Players: Show waiting state
```

### 3.3 Prompt Submission and AI Generation Flow

```mermaid
sequenceDiagram
    participant Player as Current Player
    participant Frontend as Frontend
    participant Socket as Socket.io
    participant GameService as Game Service
    participant AIService as AI Service
    participant Queue as Bull Queue
    participant Gemini as Google Gemini
    participant Replicate as Replicate API
    participant Storage as Image Storage
    participant Redis as Redis
    
    Player->>Frontend: Enter prompt & select style
    Frontend->>Frontend: Validate input
    Frontend->>Socket: emit('prompt:submit', prompt, style)
    Socket->>GameService: handlePromptSubmission()
    GameService->>Redis: Update round status to 'generating'
    GameService->>Socket: emit('prompt:processing') [to all]
    Frontend->>Player: Show generating state
    
    GameService->>AIService: generateImage(prompt, previousImage, style)
    AIService->>Queue: Add generation job
    Queue->>Gemini: Enhance prompt with context
    Gemini-->>Queue: Enhanced prompt
    Queue->>Replicate: Generate image with enhanced prompt
    Replicate-->>Queue: Generated image URL
    Queue->>Storage: Download & store image locally
    Storage-->>Queue: Local image URL
    Queue->>AIService: Job complete
    AIService->>GameService: Image ready
    
    GameService->>Redis: Update round with image & status
    GameService->>Redis: Increment current round index
    GameService->>Socket: emit('image:generated', imageUrl) [to all]
    GameService->>Socket: emit('game:updated', game) [to all]
    Frontend->>Player: Display generated image
    
    Note over Player,Redis: Next Turn or Game End
    alt More rounds remaining
        GameService->>GameService: Start next round
        GameService->>Socket: emit('turn:started', nextRound, nextPlayerId)
    else Game complete
        GameService->>GameService: endGame()
        GameService->>Redis: Save final results
        GameService->>Socket: emit('game:ended', results) [to all]
    end
```

## 4. Real-Time Communication Patterns

### 4.1 WebSocket Event Flow

```mermaid
graph LR
    subgraph "Client Events"
        CE1[room:create]
        CE2[room:join]
        CE3[game:start]
        CE4[prompt:submit]
        CE5[vote:cast]
        CE6[gallery:get]
    end
    
    subgraph "Server Processing"
        SP1[Validate Input]
        SP2[Update State]
        SP3[Persist Data]
        SP4[Process Business Logic]
    end
    
    subgraph "Server Events"
        SE1[room:created]
        SE2[room:updated]
        SE3[game:started]
        SE4[turn:started]
        SE5[image:generated]
        SE6[game:ended]
    end
    
    CE1 --> SP1
    CE2 --> SP1
    CE3 --> SP1
    CE4 --> SP1
    CE5 --> SP1
    CE6 --> SP1
    
    SP1 --> SP2
    SP2 --> SP3
    SP3 --> SP4
    
    SP4 --> SE1
    SP4 --> SE2
    SP4 --> SE3
    SP4 --> SE4
    SP4 --> SE5
    SP4 --> SE6
```

### 4.2 State Synchronization Pattern

```typescript
// Client State Update Flow
interface StateUpdateFlow {
  // 1. User Action
  userAction: () => void
  
  // 2. Optimistic Update (optional)
  optimisticUpdate: (localState: AppState) => AppState
  
  // 3. Server Communication
  serverRequest: (socket: Socket) => void
  
  // 4. Server Response
  serverResponse: (data: any) => void
  
  // 5. State Confirmation/Correction
  stateSync: (serverState: any, localState: AppState) => AppState
}

// Example: Room Joining Flow
const roomJoinFlow: StateUpdateFlow = {
  userAction: () => {
    // User clicks "Join Room"
    setIsJoining(true)
  },
  
  optimisticUpdate: (state) => ({
    ...state,
    isJoining: true,
    error: null
  }),
  
  serverRequest: (socket) => {
    socket.emit('room:join', roomCode, nickname)
  },
  
  serverResponse: (result) => {
    if (result.success) {
      setRoom(result.room)
      setPlayer(result.player)
    } else {
      setError(result.error)
    }
    setIsJoining(false)
  },
  
  stateSync: (serverRoom, localState) => ({
    ...localState,
    room: serverRoom,
    isJoining: false
  })
}
```

## 5. Data Persistence Patterns

### 5.1 Redis Data Lifecycle

```mermaid
stateDiagram-v2
    [*] --> Created: User creates room/game
    Created --> Active: Players join/interact
    Active --> Updated: State changes
    Updated --> Active: Continued interaction
    Active --> Expired: TTL timeout
    Active --> Completed: Natural completion
    Completed --> Archived: Move to long-term storage
    Expired --> [*]: Automatic cleanup
    Archived --> [*]: Manual/scheduled cleanup
    
    note right of Created: TTL set based on data type
    note right of Updated: TTL refreshed on activity
    note right of Expired: Redis auto-deletes
    note right of Archived: Gallery/results storage
```

### 5.2 Data Persistence Strategy

```typescript
// TTL Configuration by Data Type
interface TTLConfig {
  rooms: 3600,              // 1 hour - active gaming sessions
  games: 7200,              // 2 hours - extended for generation time
  sessions: 3600,           // 1 hour - player session duration
  roomCodes: 3600,          // 1 hour - matches room TTL
  gameResults: 604800,      // 7 days - downloadable results
  galleryItems: 2592000,    // 30 days - public gallery
  galleryIndex: -1,         // No expiration - permanent index
  likes: -1                 // No expiration - permanent engagement
}

// Data Refresh Strategy
interface DataRefreshPattern {
  onUserActivity: [
    'sessions',     // Extend session on any activity
    'rooms'         // Extend room on player activity
  ],
  
  onGameActivity: [
    'games',        // Extend game on turns/updates
    'rooms'         // Keep room alive during game
  ],
  
  onCompletion: [
    'gameResults',  // Create results with 7-day TTL
    'galleryItems'  // Add to gallery with 30-day TTL
  ]
}
```

### 5.3 File System Storage Pattern

```mermaid
flowchart TD
    subgraph "Image Generation"
        REPLICATE[Replicate generates image]
        URL[Returns remote URL]
    end
    
    subgraph "Local Storage Process"
        DOWNLOAD[Download image]
        VALIDATE[Validate file]
        STORE[Store with naming pattern]
        SERVE[Serve via Express static]
    end
    
    subgraph "File Organization"
        STRUCTURE["/storage/images/{gameId}-round-{index}.png"]
        ACCESS["/images/{filename} endpoint"]
    end
    
    REPLICATE --> URL
    URL --> DOWNLOAD
    DOWNLOAD --> VALIDATE
    VALIDATE --> STORE
    STORE --> STRUCTURE
    STRUCTURE --> ACCESS
    ACCESS --> SERVE
```

## 6. External Service Integration Flows

### 6.1 AI Service Integration Pattern

```mermaid
sequenceDiagram
    participant Game as Game Service
    participant AI as AI Service
    participant Queue as Bull Queue
    participant Gemini as Google Gemini
    participant Replicate as Replicate API
    participant Storage as Storage Service
    
    Game->>AI: generateImage(prompt, context, style)
    AI->>Queue: Enqueue generation job
    
    par Prompt Enhancement
        Queue->>Gemini: Enhance prompt with context
        Gemini-->>Queue: Enhanced prompt + metadata
    and Preparation
        Queue->>Queue: Prepare generation parameters
        Queue->>Queue: Apply style modifications
    end
    
    Queue->>Replicate: Submit generation request
    Replicate-->>Queue: Generation ID
    Queue->>Queue: Poll for completion
    
    loop Until Complete
        Queue->>Replicate: Check status
        Replicate-->>Queue: Status update
    end
    
    Replicate-->>Queue: Final image URL
    Queue->>Storage: Download and store locally
    Storage-->>Queue: Local URL
    Queue->>AI: Job complete with local URL
    AI->>Game: Image ready
```

### 6.2 Error Handling and Fallback Flow

```mermaid
flowchart TD
    START[AI Generation Request] --> ENHANCE{Gemini Available?}
    
    ENHANCE -->|Yes| GEMINI[Enhance with Gemini]
    ENHANCE -->|No| BASIC[Use basic prompt]
    
    GEMINI --> REPLICATE{Replicate Available?}
    BASIC --> REPLICATE
    
    REPLICATE -->|Yes| GENERATE[Generate Image]
    REPLICATE -->|No| FALLBACK[Use Fallback Image]
    
    GENERATE --> SUCCESS{Generation Success?}
    SUCCESS -->|Yes| STORE[Store Locally]
    SUCCESS -->|No| RETRY{Retry Count < 3?}
    
    RETRY -->|Yes| REPLICATE
    RETRY -->|No| FALLBACK
    
    STORE --> RETURN[Return Local URL]
    FALLBACK --> RETURN
    
    RETURN --> END[Continue Game Flow]
```

## 7. Performance Data Flow Optimizations

### 7.1 Caching Strategy

```typescript
// Multi-Layer Caching Architecture
interface CachingLayers {
  browser: {
    // Client-side caching
    staticAssets: 'Cache-Control: max-age=31536000',
    generatedImages: 'Cache-Control: max-age=86400',
    apiResponses: 'No caching for real-time data'
  },
  
  cdn: {
    // CDN caching (Vercel/Cloudflare)
    staticFiles: 'Global edge caching',
    images: 'Regional caching with origin pull',
    api: 'No caching for dynamic content'
  },
  
  redis: {
    // Application-level caching
    gameSessions: 'In-memory for active games',
    userSessions: 'Fast session lookup',
    galleryData: 'Cached queries for popular content'
  },
  
  fileSystem: {
    // Local image storage
    generatedImages: 'Permanent local storage',
    thumbnails: 'Generated on-demand (future)',
    backups: 'Periodic backup to cloud storage'
  }
}
```

### 7.2 Data Flow Optimization Patterns

```mermaid
graph TD
    subgraph "Request Optimization"
        BATCH[Batch Operations]
        PIPELINE[Redis Pipelining]
        COMPRESS[Response Compression]
    end
    
    subgraph "Real-time Optimization"
        THROTTLE[Event Throttling]
        DEBOUNCE[User Input Debouncing]
        SELECTIVE[Selective Updates]
    end
    
    subgraph "Storage Optimization"
        TTL[Smart TTL Management]
        CLEANUP[Automated Cleanup]
        SHARDING[Data Sharding]
    end
    
    subgraph "Network Optimization"
        CDN[CDN Distribution]
        COMPRESS2[Asset Compression]
        HTTP2[HTTP/2 Multiplexing]
    end
    
    BATCH --> PIPELINE
    PIPELINE --> COMPRESS
    
    THROTTLE --> DEBOUNCE
    DEBOUNCE --> SELECTIVE
    
    TTL --> CLEANUP
    CLEANUP --> SHARDING
    
    CDN --> COMPRESS2
    COMPRESS2 --> HTTP2
```

## 8. Security Data Flow

### 8.1 Input Validation Flow

```mermaid
flowchart TD
    INPUT[User Input] --> CLIENT_VAL[Client Validation]
    CLIENT_VAL --> SANITIZE[Input Sanitization]
    SANITIZE --> TRANSPORT[Secure Transport]
    
    TRANSPORT --> SERVER_VAL[Server Validation]
    SERVER_VAL --> SCHEMA[Schema Validation]
    SCHEMA --> BUSINESS[Business Logic Validation]
    
    BUSINESS --> AUTHORIZED{Authorized?}
    AUTHORIZED -->|Yes| PROCESS[Process Request]
    AUTHORIZED -->|No| REJECT[Reject with Error]
    
    PROCESS --> PERSIST[Persist if Valid]
    REJECT --> LOG[Log Security Event]
    
    PERSIST --> RESPONSE[Send Response]
    LOG --> ERROR_RESPONSE[Send Error Response]
```

### 8.2 Session Security Flow

```typescript
// Session Security Pattern
interface SessionSecurityFlow {
  creation: {
    sessionId: 'Generated from socket ID',
    validation: 'Validate nickname and room access',
    isolation: 'Isolate session data by room',
    ttl: 'Set appropriate expiration'
  },
  
  validation: {
    onRequest: 'Validate session exists and is active',
    authCheck: 'Verify player permissions for action',
    roomAccess: 'Confirm player belongs to room',
    rateLimit: 'Apply rate limiting per session'
  },
  
  cleanup: {
    onDisconnect: 'Mark session as disconnected',
    onExpiry: 'Auto-remove expired sessions',
    onGameEnd: 'Clean up game-specific data',
    onRoomEmpty: 'Remove room and associated sessions'
  }
}
```

## 9. Monitoring and Analytics Data Flow

### 9.1 Logging Data Flow

```mermaid
flowchart LR
    subgraph "Application Events"
        USER_ACTION[User Actions]
        SYSTEM_EVENT[System Events]
        ERROR_EVENT[Error Events]
        PERFORMANCE[Performance Metrics]
    end
    
    subgraph "Collection Layer"
        FRONTEND_LOG[Frontend Logging]
        BACKEND_LOG[Backend Logging]
        STRUCTURED[Structured Logging]
    end
    
    subgraph "Processing Layer"
        FILTER[Event Filtering]
        ENRICH[Context Enrichment]
        AGGREGATE[Metric Aggregation]
    end
    
    subgraph "Storage & Analysis"
        LOG_STORE[Log Storage]
        METRICS[Metrics Database]
        DASHBOARD[Monitoring Dashboard]
    end
    
    USER_ACTION --> FRONTEND_LOG
    SYSTEM_EVENT --> BACKEND_LOG
    ERROR_EVENT --> BACKEND_LOG
    PERFORMANCE --> STRUCTURED
    
    FRONTEND_LOG --> FILTER
    BACKEND_LOG --> FILTER
    STRUCTURED --> FILTER
    
    FILTER --> ENRICH
    ENRICH --> AGGREGATE
    
    AGGREGATE --> LOG_STORE
    AGGREGATE --> METRICS
    METRICS --> DASHBOARD
```

### 9.2 Analytics Event Schema

```typescript
// Analytics Event Structure
interface AnalyticsEvent {
  // Event Identification
  eventType: 'user_action' | 'system_event' | 'error' | 'performance'
  eventName: string
  timestamp: string
  sessionId: string
  
  // Context Information
  userId?: string
  roomId?: string
  gameId?: string
  
  // Event-Specific Data
  properties: {
    // User actions
    buttonClicked?: string
    promptSubmitted?: { length: number, hasStyle: boolean }
    imageGenerated?: { duration: number, success: boolean }
    
    // System events
    roomCreated?: { playerCount: number, settings: RoomSettings }
    gameCompleted?: { duration: number, rounds: number, players: number }
    
    // Performance metrics
    loadTime?: number
    renderTime?: number
    apiResponseTime?: number
    
    // Error details
    errorMessage?: string
    errorStack?: string
    errorContext?: Record<string, any>
  }
}
```

## 10. Data Consistency and Conflict Resolution

### 10.1 Eventual Consistency Pattern

```mermaid
sequenceDiagram
    participant Client1 as Client 1
    participant Client2 as Client 2
    participant Server as Server
    participant Redis as Redis
    
    Note over Client1,Redis: Concurrent User Actions
    Client1->>Server: Action A
    Client2->>Server: Action B
    
    Server->>Redis: Process Action A
    Server->>Redis: Process Action B
    
    Redis->>Server: Updated State
    Server->>Client1: Broadcast Update
    Server->>Client2: Broadcast Update
    
    Client1->>Client1: Reconcile Local State
    Client2->>Client2: Reconcile Local State
    
    Note over Client1,Redis: State Convergence Achieved
```

### 10.2 Conflict Resolution Strategies

```typescript
// Conflict Resolution Patterns
interface ConflictResolution {
  roomJoining: {
    strategy: 'First-come-first-served',
    implementation: 'Atomic Redis operations',
    fallback: 'Room full error message'
  },
  
  turnManagement: {
    strategy: 'Server authoritative',
    implementation: 'Single source of truth in Redis',
    validation: 'Reject out-of-turn submissions'
  },
  
  gameState: {
    strategy: 'Last-write-wins',
    implementation: 'Redis atomic updates',
    synchronization: 'Broadcast to all clients'
  },
  
  galleryUpdates: {
    strategy: 'Merge compatible changes',
    implementation: 'Separate counters for likes',
    conflict: 'Independent user actions'
  }
}
```

---

**Document Version**: 1.0  
**Last Updated**: August 2025  
**Next Review**: September 2025