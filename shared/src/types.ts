export interface Player {
  id: string
  nickname: string
  avatar?: string
  score: number
  isHost: boolean
  status: 'connected' | 'disconnected' | 'reconnecting'
}

export interface Room {
  id: string
  code: string
  players: Player[]
  currentGame?: Game
  settings: RoomSettings
  createdAt: Date
  status: 'waiting' | 'in_game' | 'finished'
}

export interface RoomSettings {
  maxPlayers: number
  roundsPerPlayer: number
  turnTimeLimit: number
  votingTimeLimit: number
  gameMode: 'casual' | 'competitive'
}

export interface Game {
  id: string
  roomId: string
  rounds: Round[]
  currentRoundIndex: number
  status: 'waiting' | 'active' | 'voting' | 'between_rounds' | 'finished'
  scores: Record<string, number>
  startedAt: Date
  endedAt?: Date
}

export interface Round {
  index: number
  playerId: string
  prompt: string
  previousImage?: string
  generatedImage?: string
  artworkDescription?: string // Cumulative description of what's in the artwork
  selectedStyle?: StyleSelection
  styleHistory?: ArtStyle[]
  styleMixingInstructions?: string
  votes: Vote[]
  status: 'waiting' | 'generating' | 'voting' | 'completed'
  startedAt: Date
  completedAt?: Date
}

export interface Vote {
  playerId: string
  vote: 'up' | 'down'
  timestamp: Date
}

export interface GameState {
  room: Room | null
  currentPlayer: Player | null
  isMyTurn: boolean
  timeRemaining: number
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error'
}

export type ServerToClientEvents = {
  'room:created': (room: Room) => void
  'room:joined': (room: Room, player: Player) => void
  'room:updated': (room: Room) => void
  'room:error': (error: string) => void
  
  'player:joined': (player: Player) => void
  'player:left': (playerId: string) => void
  'player:updated': (player: Player) => void
  
  'game:started': (game: Game) => void
  'game:ended': (game: Game) => void
  'game:updated': (game: Game) => void
  'game:results': (results: GameResults) => void
  
  'turn:started': (round: Round, playerId: string) => void
  'turn:ended': (round: Round) => void
  'turn:timer': (timeRemaining: number) => void
  
  'prompt:processing': () => void
  'prompt:error': (error: string) => void
  'image:generated': (imageUrl: string) => void
  'image:failed': (error: string) => void
  
  'voting:started': (round: Round) => void
  'voting:ended': (results: VotingResults) => void
  'vote:received': (playerId: string) => void
  
  'scores:updated': (scores: Record<string, number>) => void
  'chat:message': (message: ChatMessage) => void
  'connection:status': (status: string) => void
}

export type ClientToServerEvents = {
  'room:create': (settings: Partial<RoomSettings>, callback: (room: Room) => void) => void
  'room:join': (code: string, nickname: string, callback: (result: { success: boolean; room?: Room; error?: string }) => void) => void
  'room:leave': () => void
  
  'game:start': () => void
  'game:end': () => void
  
  'prompt:submit': (prompt: string, styleSelection?: StyleSelection) => void
  'vote:cast': (vote: 'up' | 'down') => void
  
  'chat:send': (message: string) => void
  'player:update': (data: Partial<Player>) => void
  
  'styles:get': (callback: (styles: { categories: ArtCategory[], styles: ArtStyle[] }) => void) => void
  'gallery:get': (callback: (artworks: GameResults[]) => void, filters?: { category?: string, style?: string, limit?: number }) => void
  'gallery:setMainImage': (gameId: string, imageIndex: number, callback: (success: boolean) => void) => void
}

export interface VotingResults {
  upVotes: number
  downVotes: number
  pointsAwarded: number
}

export interface ChatMessage {
  id: string
  playerId: string
  playerName: string
  message: string
  timestamp: Date
  type: 'chat' | 'system'
}

export interface GameResults {
  gameId: string
  roomCode: string
  completedAt: Date
  totalRounds: number
  players: Player[]
  mainDisplayImageIndex?: number // Index of the image to show as main display in gallery
  imageSequence: {
    roundIndex: number
    playerId: string
    playerName: string
    prompt: string
    imageUrl: string
    artworkDescription: string
    generatedAt: Date
    artStyle?: ArtStyle
    styleHistory?: ArtStyle[]
  }[]
}

// Art Style System
export interface ArtStyle {
  id: string
  name: string
  category: ArtCategory
  subcategory?: string
  description: string
  promptTemplate: string
  parameters?: {
    strength?: number
    guidanceScale?: number
    negativePrompt?: string
  }
  tags: string[]
  isPopular?: boolean
}

export interface ArtCategory {
  id: string
  name: string
  description: string
  icon: string
  subcategories?: string[]
}

export interface StyleSelection {
  primaryStyle: ArtStyle
  accentStyle?: ArtStyle
  preserveExisting: boolean
  blendStrength: number // 0.1 to 1.0
}

