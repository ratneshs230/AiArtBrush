'use client'

import { useState } from 'react'
import { useSocket } from '@/hooks/useSocket'
import { useGameStore } from '@/lib/store'
import type { Socket } from 'socket.io-client'
import type { ServerToClientEvents, ClientToServerEvents, StyleSelection, ArtStyle } from '@ai-art-chain/shared'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Palette, Users, Zap, Settings, ChevronDown, ChevronUp, Sparkles } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { StyleSelector } from '@/components/StyleSelector'
import { ArtGallery } from '@/components/ArtGallery'

export default function Home() {
  const socket = useSocket()
  const { room, connectionStatus } = useGameStore()
  const [roomCode, setRoomCode] = useState('')
  const [nickname, setNickname] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [gameSettings, setGameSettings] = useState({
    maxPlayers: 8,
    roundsPerPlayer: 2,
    turnTimeLimit: 60,
    gameMode: 'casual' as 'casual' | 'competitive'
  })
  
  if (room) {
    return <GameRoom socket={socket} />
  }
  
  const handleCreateRoom = () => {
    if (!socket || !nickname.trim()) return
    
    setIsCreating(true)
    socket.emit('room:create', gameSettings, (room) => {
      socket.emit('room:join', room.code, nickname, (result) => {
        if (!result.success) {
          console.error(result.error)
        }
        setIsCreating(false)
      })
    })
  }
  
  const handleJoinRoom = () => {
    if (!socket || !roomCode.trim() || !nickname.trim()) {
      console.log('Join room blocked:', { socket: !!socket, roomCode, nickname, connectionStatus })
      return
    }
    
    console.log('Attempting to join room:', roomCode.toUpperCase(), 'with nickname:', nickname)
    
    socket.emit('room:join', roomCode.toUpperCase(), nickname, (result) => {
      console.log('Join room result:', result)
      if (!result.success) {
        alert(result.error || 'Failed to join room')
      }
    })
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            AI Art Chain
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Create evolving artwork with friends using AI
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6 mb-12 max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <Palette className="w-8 h-8 text-purple-500 mb-2" />
              <CardTitle>Collaborative Creation</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Each player adds to the evolving artwork with creative prompts
              </CardDescription>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <Users className="w-8 h-8 text-blue-500 mb-2" />
              <CardTitle>Play with Friends</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Create a room and invite friends or join random matches
              </CardDescription>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <Zap className="w-8 h-8 text-yellow-500 mb-2" />
              <CardTitle>AI-Powered</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Watch as AI transforms prompts into stunning visual art
              </CardDescription>
            </CardContent>
          </Card>
        </div>
        
        <div className="max-w-md mx-auto space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Start Playing</CardTitle>
              <CardDescription>
                Enter your nickname to get started
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Your nickname"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                maxLength={20}
              />

              {/* Advanced Settings */}
              <div className="space-y-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="w-full flex items-center justify-center gap-2"
                >
                  <Settings className="w-4 h-4" />
                  Game Settings
                  {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </Button>

                {showAdvanced && (
                  <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="maxPlayers">Max Players</Label>
                        <Select
                          value={gameSettings.maxPlayers.toString()}
                          onValueChange={(value) => setGameSettings({...gameSettings, maxPlayers: parseInt(value)})}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({length: 11}, (_, i) => i + 2).map(num => (
                              <SelectItem key={num} value={num.toString()}>{num} players</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="roundsPerPlayer">Rounds per Player</Label>
                        <Select
                          value={gameSettings.roundsPerPlayer.toString()}
                          onValueChange={(value) => setGameSettings({...gameSettings, roundsPerPlayer: parseInt(value)})}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {[1, 2, 3, 4, 5].map(num => (
                              <SelectItem key={num} value={num.toString()}>{num} {num === 1 ? 'round' : 'rounds'}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="turnTime">Turn Time</Label>
                        <Select
                          value={gameSettings.turnTimeLimit.toString()}
                          onValueChange={(value) => setGameSettings({...gameSettings, turnTimeLimit: parseInt(value)})}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="30">30 seconds</SelectItem>
                            <SelectItem value="45">45 seconds</SelectItem>
                            <SelectItem value="60">1 minute</SelectItem>
                            <SelectItem value="90">1.5 minutes</SelectItem>
                            <SelectItem value="120">2 minutes</SelectItem>
                            <SelectItem value="180">3 minutes</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="gameMode">Game Mode</Label>
                        <Select
                          value={gameSettings.gameMode}
                          onValueChange={(value: 'casual' | 'competitive') => setGameSettings({...gameSettings, gameMode: value})}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="casual">Casual</SelectItem>
                            <SelectItem value="competitive">Competitive</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="text-sm text-gray-600 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/20 p-3 rounded">
                      <strong>Total game length:</strong> {gameSettings.maxPlayers} players × {gameSettings.roundsPerPlayer} rounds each = {gameSettings.maxPlayers * gameSettings.roundsPerPlayer} total rounds
                    </div>
                  </div>
                )}
              </div>
              
              <div className="space-y-4">
                <Button 
                  onClick={handleCreateRoom} 
                  className="w-full"
                  disabled={!nickname.trim() || isCreating || connectionStatus !== 'connected'}
                >
                  Create New Room
                </Button>
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Or join existing
                    </span>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Input
                    placeholder="Room code"
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                    maxLength={6}
                  />
                  <Button 
                    onClick={handleJoinRoom}
                    disabled={!nickname.trim() || !roomCode.trim() || connectionStatus !== 'connected'}
                  >
                    Join Room
                  </Button>
                </div>
              </div>
              
              <div className="text-center">
                {connectionStatus === 'connecting' && (
                  <p className="text-sm text-yellow-600">
                    Connecting to server...
                  </p>
                )}
                {connectionStatus === 'connected' && (
                  <p className="text-sm text-green-600">
                    ✓ Connected to server
                  </p>
                )}
                {connectionStatus === 'disconnected' && (
                  <p className="text-sm text-red-600">
                    ✗ Disconnected from server
                  </p>
                )}
                {connectionStatus === 'error' && (
                  <p className="text-sm text-red-600">
                    ✗ Connection error - please refresh
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Art Gallery Section */}
        <div className="mt-20 border-t pt-20">
          <ArtGallery />
        </div>
      </div>
    </div>
  )
}

type TypedSocket = Socket<ServerToClientEvents, ClientToServerEvents> | null

function GameRoom({ socket }: { socket: TypedSocket }) {
  const { room, currentPlayer, isMyTurn, timeRemaining, isProcessingPrompt, errorMessage, setErrorMessage } = useGameStore()
  const [prompt, setPrompt] = useState('')
  const [selectedStyle, setSelectedStyle] = useState<StyleSelection | null>(null)
  const [isStyleSelectorOpen, setIsStyleSelectorOpen] = useState(false)
  const [existingStyles, setExistingStyles] = useState<ArtStyle[]>([])
  
  if (!room || !currentPlayer) return null
  
  const handleStartGame = () => {
    console.log('🎮 Frontend: Start game button clicked')
    console.log('🎮 Frontend: Socket exists:', !!socket)
    console.log('🎮 Frontend: Socket ID:', socket?.id)
    console.log('🎮 Frontend: Current player:', currentPlayer)
    console.log('🎮 Frontend: Room:', room)
    console.log('🎮 Frontend: Room status:', room?.status)
    console.log('🎮 Frontend: Players count:', room?.players.length)
    console.log('🎮 Frontend: Is current player host:', currentPlayer?.isHost)
    
    if (!socket) {
      console.error('❌ Frontend: No socket connection')
      return
    }
    
    if (!room) {
      console.error('❌ Frontend: Not in a room')
      return
    }
    
    if (!currentPlayer) {
      console.error('❌ Frontend: No current player data')
      return
    }
    
    if (!currentPlayer.isHost) {
      console.error('❌ Frontend: Not a host, cannot start game')
      return
    }
    
    console.log('🎮 Frontend: All checks passed, emitting game:start event')
    socket.emit('game:start')
  }
  
  const handleSubmitPrompt = () => {
    // Clear any previous error messages
    setErrorMessage(null)
    
    if (!socket) {
      console.error('❌ Frontend: No socket connection')
      setErrorMessage('Not connected to server. Please refresh the page.')
      return
    }
    
    if (!prompt.trim()) {
      console.error('❌ Frontend: Empty prompt submitted')
      setErrorMessage('Please enter a description for your artwork before submitting.')
      return
    }
    
    if (isProcessingPrompt) {
      console.error('❌ Frontend: Already processing a prompt')
      return
    }
    
    if (!room || !currentPlayer) {
      console.error('❌ Frontend: Not properly joined to room')
      setErrorMessage('You need to join a room first before submitting prompts.')
      return
    }
    
    if (!isMyTurn) {
      console.error('❌ Frontend: Not your turn')
      setErrorMessage('Please wait for your turn to submit a prompt.')
      return
    }
    
    console.log('🎨 Frontend: Submitting prompt:', prompt, 'with style:', selectedStyle)
    socket.emit('prompt:submit', prompt, selectedStyle || undefined)
    setPrompt('')
    setSelectedStyle(null)
  }

  const handleStyleSelect = (styleSelection: StyleSelection) => {
    setSelectedStyle(styleSelection)
    console.log('🎨 Frontend: Style selected:', styleSelection)
  }
  
  const handleLeaveRoom = () => {
    if (!socket) return
    socket.emit('room:leave')
    useGameStore.getState().reset()
  }
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="container mx-auto max-w-6xl">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold">Room: {room.code}</h2>
            <p className="text-gray-600 dark:text-gray-400">
              {room.players.length} / {room.settings.maxPlayers} players
            </p>
          </div>
          
          <Button variant="outline" onClick={handleLeaveRoom}>
            Leave Room
          </Button>
        </div>
        
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Canvas</CardTitle>
                {room.status === 'in_game' && (
                  <CardDescription>
                    Round {(room.currentGame?.currentRoundIndex || 0) + 1} of {room.players.length * room.settings.roundsPerPlayer}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent>
                {room.status === 'waiting' && (
                  <div className="text-center py-12">
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Waiting for game to start...
                    </p>
                    {currentPlayer.isHost && room.players.length >= 2 && (
                      <Button onClick={handleStartGame} size="lg">
                        Start Game
                      </Button>
                    )}
                    {currentPlayer.isHost && room.players.length < 2 && (
                      <p className="text-sm text-gray-500">
                        Need at least 2 players to start
                      </p>
                    )}
                  </div>
                )}
                
                {room.status === 'in_game' && room.currentGame && (
                  <div className="space-y-4">
                    {/* Display the latest generated image from any completed round */}
                    {(() => {
                      // Find the most recent round with a generated image
                      const latestImageRound = room.currentGame.rounds
                        .slice()
                        .reverse()
                        .find(round => round.generatedImage)
                      
                      if (latestImageRound?.generatedImage) {
                        return (
                          <div className="aspect-square bg-gray-200 dark:bg-gray-800 rounded-lg overflow-hidden border-2 border-purple-200 dark:border-purple-700">
                            <img 
                              src={latestImageRound.generatedImage} 
                              alt="Generated artwork"
                              className="w-full h-full object-contain"
                              onLoad={() => console.log('🎨 Frontend: Image loaded successfully')}
                              onError={(e) => console.error('❌ Frontend: Image failed to load:', e)}
                            />
                          </div>
                        )
                      }
                      
                      // Show placeholder if no image yet
                      return (
                        <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600">
                          <div className="text-center text-gray-500 dark:text-gray-400">
                            <div className="text-4xl mb-2">🎨</div>
                            <p>Artwork will appear here</p>
                          </div>
                        </div>
                      )
                    })()}
                    
                    {/* Error message display */}
                    {errorMessage && (
                      <div className="p-3 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-lg">
                        <div className="flex justify-between items-start">
                          <p className="text-red-700 dark:text-red-300 text-sm">{errorMessage}</p>
                          <button 
                            onClick={() => setErrorMessage(null)}
                            className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-200 ml-2"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    )}
                    
                    {isMyTurn && room.currentGame.status === 'active' && (
                      <div className="space-y-2">
                        <div className="bg-purple-100 dark:bg-purple-900/20 border border-purple-300 dark:border-purple-700 rounded-lg p-3">
                          <p className="font-semibold text-purple-700 dark:text-purple-300">
                            🎨 It's your turn! Time remaining: {timeRemaining}s
                          </p>
                        </div>
                        {isProcessingPrompt ? (
                          <div className="flex items-center justify-center p-6">
                            <div className="flex flex-col items-center gap-3">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                              <p className="text-gray-600 dark:text-gray-400 font-medium">
                                AI is creating your artwork...
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-500">
                                The next player will go once it's ready
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {/* Style Selection Display */}
                            {selectedStyle && (
                              <div className="p-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 rounded-lg">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <Sparkles className="w-4 h-4 text-purple-600" />
                                    <span className="text-sm font-medium">Style: {selectedStyle.primaryStyle.name}</span>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setSelectedStyle(null)}
                                    className="h-6 w-6 p-0"
                                  >
                                    ×
                                  </Button>
                                </div>
                                {selectedStyle.accentStyle && (
                                  <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                                    Mixed with: {selectedStyle.accentStyle.name}
                                  </p>
                                )}
                              </div>
                            )}

                            {/* Prompt Input */}
                            <div className="flex gap-2">
                              <Input
                                placeholder="Describe your addition to the artwork..."
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && !selectedStyle && setIsStyleSelectorOpen(true)}
                                disabled={isProcessingPrompt}
                                className="flex-1"
                              />
                              <Button
                                variant="outline"
                                onClick={() => setIsStyleSelectorOpen(true)}
                                disabled={isProcessingPrompt}
                                className="flex items-center gap-2"
                              >
                                <Palette className="w-4 h-4" />
                                Style
                              </Button>
                            </div>

                            {/* Submit Button */}
                            <Button 
                              onClick={handleSubmitPrompt} 
                              disabled={!prompt.trim() || !selectedStyle || isProcessingPrompt}
                              className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                            >
                              {selectedStyle ? `Generate with ${selectedStyle.primaryStyle.name}` : 'Select Style to Submit'}
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {!isMyTurn && room.currentGame.status === 'active' && (
                      <div className="text-center space-y-2">
                        <p className="text-gray-600 dark:text-gray-400">
                          {(() => {
                            const currentPlayer = room.players.find(p => p.id === room.currentGame?.rounds[room.currentGame.currentRoundIndex]?.playerId)
                            return currentPlayer ? `${currentPlayer.nickname} is adding to the artwork...` : 'Waiting for next player...'
                          })()}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Your turn is coming up!
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Players</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {room.players.map((player) => {
                    const isCurrentTurn = room.currentGame && 
                      room.currentGame.rounds[room.currentGame.currentRoundIndex]?.playerId === player.id
                    
                    return (
                      <div 
                        key={player.id}
                        className={`flex justify-between items-center p-2 rounded transition-all ${
                          isCurrentTurn 
                            ? 'bg-purple-100 dark:bg-purple-900/30 border border-purple-300 dark:border-purple-700' 
                            : 'bg-gray-100 dark:bg-gray-800'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${
                            player.status === 'connected' ? 'bg-green-500' : 'bg-gray-400'
                          }`} />
                          <span className={`font-medium ${isCurrentTurn ? 'text-purple-700 dark:text-purple-300' : ''}`}>
                            {player.nickname}
                            {player.id === currentPlayer.id && ' (You)'}
                            {player.isHost && ' 👑'}
                            {isCurrentTurn && ' 🎨'}
                          </span>
                        </div>
                        {room.settings.gameMode === 'competitive' && (
                          <span className="text-sm font-bold">{player.score} pts</span>
                        )}
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
            
            {room.currentGame && room.settings.gameMode === 'competitive' && (
              <Card>
                <CardHeader>
                  <CardTitle>Scores</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    {Object.entries(room.currentGame.scores)
                      .sort(([,a], [,b]) => b - a)
                      .map(([playerId, score]) => {
                        const player = room.players.find(p => p.id === playerId)
                        return (
                          <div key={playerId} className="flex justify-between">
                            <span>{player?.nickname || 'Unknown'}</span>
                            <span className="font-bold">{score}</span>
                          </div>
                        )
                      })}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Style Selector Modal */}
        <StyleSelector
          isOpen={isStyleSelectorOpen}
          onClose={() => setIsStyleSelectorOpen(false)}
          onStyleSelect={handleStyleSelect}
          existingStyles={existingStyles}
          showStyleMixing={room.currentGame?.rounds && room.currentGame.rounds.length > 0}
        />
      </div>
    </div>
  )
}