import { redis } from './redisService'
import type { GameResults } from '@aiartbrush/shared'
import { imageStorageService } from './imageStorageService'

class GalleryService {
  private readonly GALLERY_PREFIX = 'gallery:'
  private readonly GALLERY_INDEX = 'gallery:index'
  private readonly LIKES_PREFIX = 'gallery:likes:'
  private readonly FEATURED_KEY = 'gallery:featured'
  
  /**
   * Add completed game to public gallery
   */
  async addToGallery(gameResults: GameResults): Promise<void> {
    try {
      // Process and store images locally before adding to gallery
      const processedGameResults = await imageStorageService.processGameImages(gameResults)
      
      const key = `${this.GALLERY_PREFIX}${processedGameResults.gameId}`
      
      // Store game results with local image URLs
      await redis.setex(key, 86400 * 30, JSON.stringify(processedGameResults)) // Store for 30 days
      
      // Add to gallery index with timestamp for sorting
      await redis.zadd(
        this.GALLERY_INDEX, 
        Date.now(), 
        processedGameResults.gameId
      )
      
      // Initialize likes counter
      await redis.set(`${this.LIKES_PREFIX}${processedGameResults.gameId}`, 0)
      
      console.log('✅ Gallery: Added artwork to public gallery with local images:', processedGameResults.gameId)
    } catch (error) {
      console.error('❌ Gallery: Failed to add artwork:', error)
    }
  }
  
  /**
   * Get gallery artworks with filters
   */
  async getGalleryArtworks(options?: {
    category?: string
    style?: string
    limit?: number
    offset?: number
    sortBy?: 'recent' | 'popular' | 'players'
  }): Promise<GameResults[]> {
    try {
      const limit = options?.limit || 20
      const offset = options?.offset || 0
      
      // Get artwork IDs from index (sorted by timestamp)
      const artworkIds = await redis.zrevrange(
        this.GALLERY_INDEX,
        offset,
        offset + limit - 1
      )
      
      if (artworkIds.length === 0) {
        return []
      }
      
      // Fetch artwork data
      const artworks: GameResults[] = []
      for (const id of artworkIds) {
        const data = await redis.get(`${this.GALLERY_PREFIX}${id}`)
        if (data) {
          const artwork = JSON.parse(data) as GameResults
          
          // Apply category filter
          if (options?.category) {
            const hasCategory = artwork.imageSequence.some(
              img => img.artStyle?.category.id === options.category
            )
            if (!hasCategory) continue
          }
          
          // Apply style filter
          if (options?.style) {
            const hasStyle = artwork.imageSequence.some(
              img => img.artStyle?.id === options.style
            )
            if (!hasStyle) continue
          }
          
          artworks.push(artwork)
        }
      }
      
      // Sort if needed
      if (options?.sortBy === 'popular') {
        // Sort by likes (would need to fetch likes count)
        const artworksWithLikes = await Promise.all(
          artworks.map(async (artwork) => {
            const likes = await this.getLikesCount(artwork.gameId)
            return { artwork, likes }
          })
        )
        artworksWithLikes.sort((a, b) => b.likes - a.likes)
        return artworksWithLikes.map(item => item.artwork)
      } else if (options?.sortBy === 'players') {
        artworks.sort((a, b) => b.players.length - a.players.length)
      }
      // Default is 'recent' which is already sorted by timestamp
      
      return artworks.slice(0, limit)
    } catch (error) {
      console.error('❌ Gallery: Failed to fetch artworks:', error)
      return []
    }
  }
  
  /**
   * Like/unlike an artwork
   */
  async toggleLike(gameId: string, userId: string): Promise<number> {
    try {
      const likeKey = `${this.LIKES_PREFIX}${gameId}`
      const userLikeKey = `${this.LIKES_PREFIX}user:${userId}`
      
      // Check if user already liked this artwork
      const alreadyLiked = await redis.sismember(userLikeKey, gameId)
      
      if (alreadyLiked) {
        // Unlike
        await redis.srem(userLikeKey, gameId)
        const newCount = await redis.decr(likeKey)
        return Math.max(0, newCount) // Ensure non-negative
      } else {
        // Like
        await redis.sadd(userLikeKey, gameId)
        return await redis.incr(likeKey)
      }
    } catch (error) {
      console.error('❌ Gallery: Failed to toggle like:', error)
      return 0
    }
  }
  
  /**
   * Get likes count for an artwork
   */
  async getLikesCount(gameId: string): Promise<number> {
    try {
      const count = await redis.get(`${this.LIKES_PREFIX}${gameId}`)
      return parseInt(count || '0')
    } catch (error) {
      console.error('❌ Gallery: Failed to get likes count:', error)
      return 0
    }
  }
  
  /**
   * Get featured artworks (curated or top-rated)
   */
  async getFeaturedArtworks(limit: number = 6): Promise<GameResults[]> {
    try {
      // Get manually featured artworks
      const featuredIds = await redis.smembers(this.FEATURED_KEY)
      
      // If not enough featured, get most liked
      if (featuredIds.length < limit) {
        const popularIds = await this.getPopularArtworkIds(limit - featuredIds.length)
        featuredIds.push(...popularIds)
      }
      
      // Fetch artwork data
      const artworks: GameResults[] = []
      for (const id of featuredIds.slice(0, limit)) {
        const data = await redis.get(`${this.GALLERY_PREFIX}${id}`)
        if (data) {
          artworks.push(JSON.parse(data))
        }
      }
      
      return artworks
    } catch (error) {
      console.error('❌ Gallery: Failed to get featured artworks:', error)
      return []
    }
  }
  
  /**
   * Get most popular artwork IDs
   */
  private async getPopularArtworkIds(limit: number): Promise<string[]> {
    try {
      // Get all artwork IDs
      const allIds = await redis.zrevrange(this.GALLERY_INDEX, 0, 100)
      
      // Get likes for each
      const idsWithLikes = await Promise.all(
        allIds.map(async (id) => {
          const likes = await this.getLikesCount(id)
          return { id, likes }
        })
      )
      
      // Sort by likes and return top IDs
      idsWithLikes.sort((a, b) => b.likes - a.likes)
      return idsWithLikes.slice(0, limit).map(item => item.id)
    } catch (error) {
      console.error('❌ Gallery: Failed to get popular artworks:', error)
      return []
    }
  }
  
  /**
   * Set main display image for an artwork
   */
  async setMainDisplayImage(gameId: string, imageIndex: number): Promise<boolean> {
    try {
      const key = `${this.GALLERY_PREFIX}${gameId}`
      const data = await redis.get(key)
      
      if (!data) {
        console.error('❌ Gallery: Artwork not found:', gameId)
        return false
      }
      
      const artwork = JSON.parse(data) as GameResults
      
      // Validate image index
      if (imageIndex < 0 || imageIndex >= artwork.imageSequence.length) {
        console.error('❌ Gallery: Invalid image index:', imageIndex, 'for artwork with', artwork.imageSequence.length, 'images')
        return false
      }
      
      // Update main display image index
      artwork.mainDisplayImageIndex = imageIndex
      
      // Save back to Redis
      await redis.setex(key, 86400 * 30, JSON.stringify(artwork))
      
      console.log('✅ Gallery: Set main display image for', gameId, 'to index', imageIndex)
      return true
    } catch (error) {
      console.error('❌ Gallery: Failed to set main display image:', error)
      return false
    }
  }

  /**
   * Mark an artwork as featured
   */
  async markAsFeatured(gameId: string): Promise<void> {
    try {
      await redis.sadd(this.FEATURED_KEY, gameId)
      console.log('✅ Gallery: Marked as featured:', gameId)
    } catch (error) {
      console.error('❌ Gallery: Failed to mark as featured:', error)
    }
  }
  
  /**
   * Get gallery statistics
   */
  async getGalleryStats(): Promise<{
    totalArtworks: number
    totalPlayers: number
    totalStyles: number
    popularCategories: { category: string, count: number }[]
  }> {
    try {
      const totalArtworks = await redis.zcard(this.GALLERY_INDEX)
      
      // Get sample of artworks for statistics
      const sampleIds = await redis.zrevrange(this.GALLERY_INDEX, 0, 100)
      const players = new Set<string>()
      const styles = new Set<string>()
      const categoryCount = new Map<string, number>()
      
      for (const id of sampleIds) {
        const data = await redis.get(`${this.GALLERY_PREFIX}${id}`)
        if (data) {
          const artwork = JSON.parse(data) as GameResults
          
          // Count unique players
          artwork.players.forEach(p => players.add(p.id))
          
          // Count unique styles and categories
          artwork.imageSequence.forEach(img => {
            if (img.artStyle) {
              styles.add(img.artStyle.id)
              const categoryId = img.artStyle.category.id
              categoryCount.set(categoryId, (categoryCount.get(categoryId) || 0) + 1)
            }
          })
        }
      }
      
      // Sort categories by count
      const popularCategories = Array.from(categoryCount.entries())
        .map(([category, count]) => ({ category, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)
      
      return {
        totalArtworks,
        totalPlayers: players.size,
        totalStyles: styles.size,
        popularCategories
      }
    } catch (error) {
      console.error('❌ Gallery: Failed to get stats:', error)
      return {
        totalArtworks: 0,
        totalPlayers: 0,
        totalStyles: 0,
        popularCategories: []
      }
    }
  }
}

export const galleryService = new GalleryService()