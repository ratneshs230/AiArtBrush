'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Download, ArrowLeft, Share2, Trophy, Palette, Users } from 'lucide-react'
import Link from 'next/link'
import type { GameResults } from '@ai-art-chain/shared'

function ResultsContent() {
  const searchParams = useSearchParams()
  const gameId = searchParams.get('gameId')
  const [results, setResults] = useState<GameResults | null>(null)
  const [loading, setLoading] = useState(true)
  const [downloadingImage, setDownloadingImage] = useState<string | null>(null)

  useEffect(() => {
    const loadResults = async () => {
      if (!gameId) {
        setLoading(false)
        return
      }

      // Try session storage first
      const resultsData = sessionStorage.getItem(`game-results-${gameId}`)
      if (resultsData) {
        try {
          const parsedResults = JSON.parse(resultsData)
          setResults(parsedResults)
          setLoading(false)
          return
        } catch (error) {
          console.error('Failed to parse game results from session storage:', error)
        }
      }

      // Fallback to API
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3001'}/api/game-results/${gameId}`)
        if (response.ok) {
          const apiResults = await response.json()
          setResults(apiResults)
        } else {
          console.error('Failed to fetch game results from API:', response.statusText)
        }
      } catch (error) {
        console.error('Error fetching game results:', error)
      }
      
      setLoading(false)
    }

    loadResults()
  }, [gameId])

  const downloadImage = async (imageUrl: string, filename: string) => {
    setDownloadingImage(imageUrl)
    try {
      const response = await fetch(imageUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Failed to download image:', error)
      alert('Failed to download image. Please try again.')
    } finally {
      setDownloadingImage(null)
    }
  }

  const downloadAllImages = async () => {
    if (!results) return
    
    setDownloadingImage('all')
    try {
      for (let index = 0; index < results.imageSequence.length; index++) {
        const image = results.imageSequence[index]
        const filename = `artwork-round-${image.roundIndex + 1}-${image.playerName}-${image.prompt.slice(0, 20)}.png`
        await downloadImage(image.imageUrl, filename)
        
        // Add delay between downloads to avoid overwhelming the browser
        if (index < results.imageSequence.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000))
        }
      }
    } catch (error) {
      console.error('Failed to download all images:', error)
      alert('Failed to download some images. Please try again.')
    } finally {
      setDownloadingImage(null)
    }
  }

  const shareResults = () => {
    if (navigator.share) {
      navigator.share({
        title: `AI Art Chain - Room ${results?.roomCode}`,
        text: `Check out our collaborative AI artwork created in ${results?.totalRounds} rounds!`,
        url: window.location.href
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert('Results link copied to clipboard!')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  if (!results) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-bold mb-2">Game Results Not Found</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              The game results could not be loaded. This may happen if the game was too old or there was an error.
            </p>
            <Link href="/">
              <Button className="bg-purple-600 hover:bg-purple-700">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Return Home
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-6">
      <div className="container mx-auto max-w-6xl px-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              🎨 Game Complete!
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Room {results.roomCode} • {results.imageSequence.length} artworks created
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={shareResults}>
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
            <Button 
              onClick={downloadAllImages}
              disabled={downloadingImage === 'all'}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Download className="w-4 h-4 mr-2" />
              {downloadingImage === 'all' ? 'Downloading...' : 'Download All'}
            </Button>
          </div>
        </div>

        {/* Game Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <Palette className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <p className="text-2xl font-bold">{results.imageSequence.length}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Artworks Created</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold">{results.players.length}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Players</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Trophy className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
              <p className="text-2xl font-bold">{results.totalRounds}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Rounds</p>
            </CardContent>
          </Card>
        </div>

        {/* Image Gallery */}
        <div className="space-y-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Artwork Evolution</h2>
          
          {results.imageSequence.map((image, index) => (
            <Card key={image.roundIndex} className="overflow-hidden">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">
                      Round {image.roundIndex + 1}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary">{image.playerName}</Badge>
                      <span className="text-sm">"{image.prompt}"</span>
                    </CardDescription>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => downloadImage(
                      image.imageUrl,
                      `artwork-round-${image.roundIndex + 1}-${image.playerName}-${image.prompt.slice(0, 20)}.png`
                    )}
                    disabled={downloadingImage === image.imageUrl}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    {downloadingImage === image.imageUrl ? 'Downloading...' : 'Download'}
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="relative">
                    <img
                      src={image.imageUrl}
                      alt={`Round ${image.roundIndex + 1}: ${image.prompt}`}
                      className="w-full rounded-lg shadow-lg"
                      style={{ aspectRatio: '1/1', objectFit: 'cover' }}
                    />
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Prompt</h4>
                      <p className="text-gray-700 dark:text-gray-300 italic">"{image.prompt}"</p>
                    </div>
                    
                    {image.artworkDescription && (
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Artwork Contains</h4>
                        <p className="text-gray-700 dark:text-gray-300">{image.artworkDescription}</p>
                      </div>
                    )}
                    
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Created By</h4>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{image.playerName}</Badge>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {new Date(image.generatedAt).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Players List */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Players</CardTitle>
            <CardDescription>Everyone who participated in this game</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {results.players.map((player) => (
                <Badge key={player.id} variant="secondary" className="px-3 py-1">
                  {player.nickname}
                  {player.isHost && ' 👑'}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="text-center mt-8">
          <Link href="/">
            <Button variant="outline" size="lg">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Play Again
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function GameResultsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading game results...</p>
        </div>
      </div>
    }>
      <ResultsContent />
    </Suspense>
  )
}