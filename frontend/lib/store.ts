import { create } from 'zustand'
import type { Room, Player, Game, GameState } from '@ai-art-chain/shared'

interface GameStore extends GameState {
  isProcessingPrompt: boolean
  errorMessage: string | null
  setRoom: (room: Room | null) => void
  setCurrentPlayer: (player: Player | null) => void
  setConnectionStatus: (status: GameState['connectionStatus']) => void
  updateRoom: (room: Room) => void
  updateGame: (game: Game) => void
  setTimeRemaining: (time: number) => void
  setProcessingPrompt: (processing: boolean) => void
  setErrorMessage: (message: string | null) => void
  reset: () => void
}

export const useGameStore = create<GameStore>((set) => ({
  room: null,
  currentPlayer: null,
  isMyTurn: false,
  timeRemaining: 0,
  connectionStatus: 'connecting',
  isProcessingPrompt: false,
  errorMessage: null,
  
  setRoom: (room) => set({ room }),
  setCurrentPlayer: (player) => set({ currentPlayer: player }),
  setConnectionStatus: (status) => set({ connectionStatus: status }),
  setProcessingPrompt: (processing) => set({ isProcessingPrompt: processing }),
  setErrorMessage: (message) => set({ errorMessage: message }),
  
  updateRoom: (room) => set((state) => {
    const isMyTurn = room.currentGame?.rounds[room.currentGame.currentRoundIndex]?.playerId === state.currentPlayer?.id
    return { room, isMyTurn }
  }),
  
  updateGame: (game) => set((state) => {
    if (!state.room) return state
    const isMyTurn = game.rounds[game.currentRoundIndex]?.playerId === state.currentPlayer?.id
    return { 
      room: { ...state.room, currentGame: game },
      isMyTurn
    }
  }),
  
  setTimeRemaining: (time) => set({ timeRemaining: time }),
  
  reset: () => set({
    room: null,
    currentPlayer: null,
    isMyTurn: false,
    timeRemaining: 0,
    connectionStatus: 'connecting',
    isProcessingPrompt: false,
    errorMessage: null
  })
}))