'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Palette, 
  Clock, 
  Users, 
  Heart, 
  Download, 
  Filter,
  TrendingUp,
  Sparkles,
  Grid,
  List,
  Eye
} from 'lucide-react'
import type { GameResults, ArtCategory } from '@aiartbrush/shared'
import { ART_CATEGORIES } from '@aiartbrush/shared'
import Image from 'next/image'
import { useSocket } from '@/hooks/useSocket'
import { ArtworkViewer } from './ArtworkViewer'

interface ArtGalleryProps {
  className?: string
}

export function ArtGallery({ className = '' }: ArtGalleryProps) {
  const socket = useSocket()
  const [artworks, setArtworks] = useState<GameResults[]>([])
  const [filteredArtworks, setFilteredArtworks] = useState<GameResults[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'players'>('recent')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [likedArtworks, setLikedArtworks] = useState<Set<string>>(new Set())
  const [selectedArtwork, setSelectedArtwork] = useState<GameResults | null>(null)
  const [isViewerOpen, setIsViewerOpen] = useState(false)

  // Fetch artworks from backend
  useEffect(() => {
    if (socket) {
      fetchArtworks()
    }
  }, [socket])

  // Filter artworks when category or sort changes
  useEffect(() => {
    let filtered = [...artworks]

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(artwork => 
        artwork.imageSequence.some(img => 
          img.artStyle?.category.id === selectedCategory
        )
      )
    }

    // Sort artworks
    switch (sortBy) {
      case 'recent':
        filtered.sort((a, b) => 
          new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
        )
        break
      case 'popular':
        // Sort by liked count (mock data for now)
        filtered.sort((a, b) => 
          (likedArtworks.has(b.gameId) ? 1 : 0) - (likedArtworks.has(a.gameId) ? 1 : 0)
        )
        break
      case 'players':
        filtered.sort((a, b) => b.players.length - a.players.length)
        break
    }

    setFilteredArtworks(filtered)
  }, [artworks, selectedCategory, sortBy, likedArtworks])

  const fetchArtworks = async () => {
    try {
      setLoading(true)
      
      if (!socket) {
        console.log('Socket not connected, showing empty gallery')
        setArtworks([])
        return
      }
      
      // Fetch artworks from backend via socket
      socket.emit('gallery:get', (fetchedArtworks: GameResults[]) => {
        console.log('Fetched artworks from gallery:', fetchedArtworks.length)
        setArtworks(fetchedArtworks)
      })
    } catch (error) {
      console.error('Failed to fetch artworks:', error)
      setArtworks([])
    } finally {
      setLoading(false)
    }
  }

  const handleLike = (gameId: string) => {
    setLikedArtworks(prev => {
      const newSet = new Set(prev)
      if (newSet.has(gameId)) {
        newSet.delete(gameId)
      } else {
        newSet.add(gameId)
      }
      return newSet
    })
  }

  const handleDownload = async (imageUrl: string, filename: string) => {
    try {
      const response = await fetch(imageUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `artwork-${filename}.png`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Download failed:', error)
    }
  }

  const handleViewArtwork = (artwork: GameResults) => {
    setSelectedArtwork(artwork)
    setIsViewerOpen(true)
  }

  const handleCloseViewer = () => {
    setIsViewerOpen(false)
    setSelectedArtwork(null)
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header Section */}
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Community Gallery
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Explore amazing collaborative artworks created by our community
        </p>
      </div>

      {/* Filter Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            {/* Category Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      All Categories
                    </div>
                  </SelectItem>
                  {ART_CATEGORIES.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      <div className="flex items-center gap-2">
                        <span>{category.icon}</span>
                        {category.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Sort Options */}
            <div className="flex items-center gap-4">
              <div className="flex gap-2">
                <Button
                  variant={sortBy === 'recent' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSortBy('recent')}
                >
                  <Clock className="w-4 h-4 mr-1" />
                  Recent
                </Button>
                <Button
                  variant={sortBy === 'popular' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSortBy('popular')}
                >
                  <TrendingUp className="w-4 h-4 mr-1" />
                  Popular
                </Button>
                <Button
                  variant={sortBy === 'players' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSortBy('players')}
                >
                  <Users className="w-4 h-4 mr-1" />
                  Players
                </Button>
              </div>

              {/* View Mode Toggle */}
              <div className="flex gap-1 border rounded-lg p-1">
                <Button
                  variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="h-7 w-7 p-0"
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="h-7 w-7 p-0"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gallery Content */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading artworks...</p>
          </div>
        </div>
      ) : filteredArtworks.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Palette className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Artworks Yet</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Be the first to create a collaborative masterpiece!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className={
          viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
            : 'space-y-4'
        }>
          {filteredArtworks.map((artwork) => (
            <ArtworkCard
              key={artwork.gameId}
              artwork={artwork}
              viewMode={viewMode}
              isLiked={likedArtworks.has(artwork.gameId)}
              onLike={() => handleLike(artwork.gameId)}
              onDownload={handleDownload}
              onView={() => handleViewArtwork(artwork)}
            />
          ))}
        </div>
      )}

      {/* Artwork Viewer Modal */}
      <ArtworkViewer
        artwork={selectedArtwork}
        isOpen={isViewerOpen}
        onClose={handleCloseViewer}
        onLike={() => selectedArtwork && handleLike(selectedArtwork.gameId)}
        onDownload={handleDownload}
        isLiked={selectedArtwork ? likedArtworks.has(selectedArtwork.gameId) : false}
        mainImageIndex={selectedArtwork?.mainDisplayImageIndex}
        canEditMainImage={true} // For now, allow all users to set main image - can be restricted later
        onSetMainImage={(imageIndex) => {
          if (selectedArtwork) {
            // Update local state to reflect the change immediately
            setSelectedArtwork({
              ...selectedArtwork,
              mainDisplayImageIndex: imageIndex
            })
            // Optionally refresh the gallery to show updated artwork
            fetchArtworks()
          }
        }}
      />
    </div>
  )
}

interface ArtworkCardProps {
  artwork: GameResults
  viewMode: 'grid' | 'list'
  isLiked: boolean
  onLike: () => void
  onDownload: (imageUrl: string, filename: string) => void
  onView: () => void
}

function ArtworkCard({ artwork, viewMode, isLiked, onLike, onDownload, onView }: ArtworkCardProps) {
  const mainImageIndex = artwork.mainDisplayImageIndex ?? artwork.imageSequence.length - 1
  const displayImage = artwork.imageSequence[mainImageIndex]
  const styles = Array.from(new Set(artwork.imageSequence.map(img => img.artStyle?.name).filter(Boolean)))
  const [currentImageIndex, setCurrentImageIndex] = useState(artwork.imageSequence.length - 1)
  
  if (viewMode === 'grid') {
    return (
      <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group">
        {/* Image Preview - Click to View */}
        <div 
          className="aspect-square relative bg-gray-100 dark:bg-gray-800"
          onClick={onView}
        >
          {displayImage && (
            <img
              src={displayImage.imageUrl}
              alt="Collaborative artwork"
              className="w-full h-full object-cover"
            />
          )}
          
          {/* View Overlay */}
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Button
              variant="secondary"
              size="sm"
              className="rounded-full"
            >
              <Eye className="w-4 h-4 mr-2" />
              View Evolution
            </Button>
          </div>
          
          {/* Round Count Badge */}
          {artwork.imageSequence.length > 1 && (
            <div className="absolute top-2 right-2">
              <Badge className="bg-black/70 text-white border-0">
                {artwork.imageSequence.length} rounds
              </Badge>
            </div>
          )}
        </div>

        {/* Card Content */}
        <CardContent className="p-4 space-y-3">
          {/* Players */}
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Users className="w-4 h-4" />
            <span>{artwork.players.length} players</span>
            <span className="text-gray-400">•</span>
            <span>{artwork.totalRounds} rounds</span>
          </div>

          {/* Styles Used */}
          {styles.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {styles.slice(0, 3).map((style) => (
                <Badge key={style} variant="secondary" className="text-xs">
                  {style}
                </Badge>
              ))}
              {styles.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{styles.length - 3} more
                </Badge>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                onLike()
              }}
              className="flex-1"
            >
              <Heart className={`w-4 h-4 mr-1 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
              {isLiked ? 'Liked' : 'Like'}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                if (displayImage) {
                  onDownload(displayImage.imageUrl, `${artwork.gameId}-main`)
                }
              }}
              className="flex-1"
            >
              <Download className="w-4 h-4 mr-1" />
              Download
            </Button>
          </div>

          {/* Timestamp */}
          <p className="text-xs text-gray-500">
            {new Date(artwork.completedAt).toLocaleDateString()}
          </p>
        </CardContent>
      </Card>
    )
  }

  // List View
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group" onClick={onView}>
      <CardContent className="p-4">
        <div className="flex gap-4">
          {/* Thumbnail */}
          <div className="w-32 h-32 flex-shrink-0 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden relative">
            {displayImage && (
              <img
                src={displayImage.imageUrl}
                alt="Collaborative artwork"
                className="w-full h-full object-cover"
              />
            )}
            {/* Round Count Badge */}
            {artwork.imageSequence.length > 1 && (
              <div className="absolute top-1 right-1">
                <Badge className="bg-black/70 text-white border-0 text-xs">
                  {artwork.imageSequence.length}
                </Badge>
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex-1 space-y-2">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold">Collaborative Artwork</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Room Code: {artwork.roomCode}
                </p>
              </div>
              
              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    onLike()
                  }}
                >
                  <Heart className={`w-4 h-4 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    const finalImage = artwork.imageSequence[artwork.imageSequence.length - 1]
                    if (finalImage) {
                      onDownload(finalImage.imageUrl, `${artwork.gameId}-final`)
                    }
                  }}
                >
                  <Download className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    onView()
                  }}
                >
                  <Eye className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Player List */}
            <div className="flex items-center gap-2 text-sm">
              <Users className="w-4 h-4 text-gray-500" />
              <span className="text-gray-600 dark:text-gray-400">
                {artwork.players.map(p => p.nickname).join(', ')}
              </span>
            </div>

            {/* Styles */}
            <div className="flex flex-wrap gap-1">
              {styles.map((style) => (
                <Badge key={style} variant="secondary" className="text-xs">
                  {style}
                </Badge>
              ))}
            </div>

            {/* Evolution Preview */}
            <div className="flex gap-1">
              {artwork.imageSequence.slice(0, 5).map((img, idx) => (
                <div
                  key={idx}
                  className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden"
                  title={`Round ${idx + 1}: ${img.prompt}`}
                >
                  <img
                    src={img.imageUrl}
                    alt={`Round ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
              {artwork.imageSequence.length > 5 && (
                <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center text-xs font-medium">
                  +{artwork.imageSequence.length - 5}
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}