'use client'

import { useState } from 'react'
import { useSocket } from '@/hooks/useSocket'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  ChevronLeft, 
  ChevronRight, 
  Download, 
  Heart, 
  User,
  Calendar,
  Palette,
  Star,
  Crown
} from 'lucide-react'
import type { GameResults } from '@ai-art-chain/shared'
import Image from 'next/image'

interface ArtworkViewerProps {
  artwork: GameResults | null
  isOpen: boolean
  onClose: () => void
  onLike?: () => void
  onDownload?: (imageUrl: string, filename: string) => void
  isLiked?: boolean
  onSetMainImage?: (roundIndex: number) => void
  mainImageIndex?: number
  canEditMainImage?: boolean
}

export function ArtworkViewer({ 
  artwork, 
  isOpen, 
  onClose, 
  onLike, 
  onDownload, 
  isLiked = false,
  onSetMainImage,
  mainImageIndex,
  canEditMainImage = false
}: ArtworkViewerProps) {
  const socket = useSocket()
  const [currentRoundIndex, setCurrentRoundIndex] = useState(0)
  const [isSettingMainImage, setIsSettingMainImage] = useState(false)

  if (!artwork) return null

  const currentRound = artwork.imageSequence[currentRoundIndex]
  const player = artwork.players.find(p => p.id === currentRound?.playerId)

  const goToPrevious = () => {
    setCurrentRoundIndex(Math.max(0, currentRoundIndex - 1))
  }

  const goToNext = () => {
    setCurrentRoundIndex(Math.min(artwork.imageSequence.length - 1, currentRoundIndex + 1))
  }

  const handleDownload = () => {
    if (currentRound && onDownload) {
      onDownload(currentRound.imageUrl, `${artwork.gameId}-round-${currentRoundIndex + 1}`)
    }
  }

  const handleSetAsMain = () => {
    if (!socket || !artwork || isSettingMainImage) return
    
    setIsSettingMainImage(true)
    socket.emit('gallery:setMainImage', artwork.gameId, currentRoundIndex, (success) => {
      setIsSettingMainImage(false)
      if (success) {
        console.log('✅ Main display image updated successfully')
        if (onSetMainImage) {
          onSetMainImage(currentRoundIndex)
        }
      } else {
        console.error('❌ Failed to update main display image')
      }
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Collaborative Artwork</span>
            <div className="flex items-center gap-2">
              <Badge variant="outline">Room {artwork.roomCode}</Badge>
              <Badge variant="secondary">{artwork.players.length} players</Badge>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
          {/* Main Image Display */}
          <div className="lg:col-span-2 flex flex-col">
            <div className="relative aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden mb-4">
              {currentRound && (
                <img
                  src={currentRound.imageUrl}
                  alt={`Round ${currentRoundIndex + 1} - ${currentRound.prompt}`}
                  className="w-full h-full object-cover"
                />
              )}
              
              {/* Main Image Badge */}
              {mainImageIndex === currentRoundIndex && (
                <div className="absolute top-3 right-3">
                  <Badge className="bg-yellow-500 text-yellow-900 border-yellow-600">
                    <Star className="w-3 h-3 mr-1" />
                    Main Display
                  </Badge>
                </div>
              )}
              
              {/* Navigation Controls */}
              <div className="absolute inset-y-0 left-0 flex items-center">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={goToPrevious}
                  disabled={currentRoundIndex === 0}
                  className="ml-2 rounded-full bg-black/50 hover:bg-black/70 text-white border-0"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="absolute inset-y-0 right-0 flex items-center">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={goToNext}
                  disabled={currentRoundIndex === artwork.imageSequence.length - 1}
                  className="mr-2 rounded-full bg-black/50 hover:bg-black/70 text-white border-0"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Round Navigation */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {artwork.imageSequence.map((round, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentRoundIndex(idx)}
                  className={`relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                    idx === currentRoundIndex 
                      ? 'border-blue-500 ring-2 ring-blue-200' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <img
                    src={round.imageUrl}
                    alt={`Round ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {/* Round number overlay */}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <span className="text-white text-xs font-medium">{idx + 1}</span>
                  </div>
                  {/* Main image indicator */}
                  {mainImageIndex === idx && (
                    <div className="absolute top-1 right-1">
                      <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Details Panel */}
          <div className="space-y-4">
            {/* Current Round Info */}
            {currentRound && (
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-3">
                <h3 className="font-semibold flex items-center gap-2">
                  Round {currentRoundIndex + 1} of {artwork.imageSequence.length}
                  {player?.isHost && <Crown className="w-4 h-4 text-yellow-500" />}
                </h3>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <User className="w-4 h-4 text-gray-500" />
                    <span>{player?.nickname || 'Unknown Player'}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span>{new Date(currentRound.generatedAt).toLocaleString()}</span>
                  </div>
                  
                  {currentRound.artStyle && (
                    <div className="flex items-center gap-2 text-sm">
                      <Palette className="w-4 h-4 text-gray-500" />
                      <Badge variant="outline">{currentRound.artStyle.name}</Badge>
                    </div>
                  )}
                </div>
                
                <div className="border-t pt-2 mt-2">
                  <p className="text-sm font-medium mb-1">Prompt:</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {currentRound.prompt}
                  </p>
                </div>
                
                {currentRound.artworkDescription && (
                  <div className="border-t pt-2 mt-2">
                    <p className="text-sm font-medium mb-1">AI Description:</p>
                    <p className="text-xs text-gray-500">
                      {currentRound.artworkDescription}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="space-y-2">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onLike}
                  className="flex-1"
                >
                  <Heart className={`w-4 h-4 mr-2 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                  {isLiked ? 'Liked' : 'Like'}
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownload}
                  className="flex-1"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
              
              {canEditMainImage && (
                <Button
                  variant={mainImageIndex === currentRoundIndex ? "secondary" : "outline"}
                  size="sm"
                  onClick={handleSetAsMain}
                  disabled={isSettingMainImage}
                  className="w-full"
                >
                  <Star className="w-4 h-4 mr-2" />
                  {isSettingMainImage 
                    ? 'Updating...' 
                    : mainImageIndex === currentRoundIndex 
                      ? 'Main Display Image' 
                      : 'Set as Main Display'
                  }
                </Button>
              )}
            </div>

            {/* Game Stats */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-2">
              <h4 className="font-medium">Game Statistics</h4>
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span>Total Rounds:</span>
                  <span>{artwork.totalRounds}</span>
                </div>
                <div className="flex justify-between">
                  <span>Players:</span>
                  <span>{artwork.players.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Completed:</span>
                  <span>{new Date(artwork.completedAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {/* Player List */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <h4 className="font-medium mb-2">Players</h4>
              <div className="space-y-1">
                {artwork.players.map((player) => (
                  <div key={player.id} className="flex items-center gap-2 text-sm">
                    <User className="w-3 h-3 text-gray-500" />
                    <span>{player.nickname}</span>
                    {player.isHost && <Crown className="w-3 h-3 text-yellow-500" />}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}