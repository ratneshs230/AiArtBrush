import fs from 'fs'
import path from 'path'
import https from 'https'
import http from 'http'
import { promisify } from 'util'
import { pipeline } from 'stream'

const pipelineAsync = promisify(pipeline)

class ImageStorageService {
  private readonly STORAGE_DIR = path.join(process.cwd(), 'storage', 'images')
  private readonly IMAGES_BASE_URL = process.env.IMAGES_BASE_URL || 'http://localhost:3001/images'
  
  constructor() {
    this.ensureStorageDirectory()
  }
  
  private ensureStorageDirectory() {
    if (!fs.existsSync(this.STORAGE_DIR)) {
      fs.mkdirSync(this.STORAGE_DIR, { recursive: true })
      console.log('📁 ImageStorage: Created storage directory:', this.STORAGE_DIR)
    }
  }
  
  /**
   * Download and store an image from a URL
   */
  async downloadAndStore(imageUrl: string, gameId: string, roundIndex: number): Promise<string> {
    try {
      const filename = `${gameId}-round-${roundIndex}.png`
      const localPath = path.join(this.STORAGE_DIR, filename)
      
      // Skip if already exists
      if (fs.existsSync(localPath)) {
        console.log('📁 ImageStorage: Image already exists locally:', filename)
        return `${this.IMAGES_BASE_URL}/${filename}`
      }
      
      console.log('📁 ImageStorage: Downloading image:', imageUrl)
      
      // Determine protocol
      const isHttps = imageUrl.startsWith('https://')
      const client = isHttps ? https : http
      
      return new Promise((resolve, reject) => {
        const request = client.get(imageUrl, (response) => {
          if (response.statusCode !== 200) {
            reject(new Error(`Failed to download image: ${response.statusCode}`))
            return
          }
          
          const writeStream = fs.createWriteStream(localPath)
          
          pipelineAsync(response, writeStream)
            .then(() => {
              const localUrl = `${this.IMAGES_BASE_URL}/${filename}`
              console.log('✅ ImageStorage: Image downloaded and stored:', filename)
              resolve(localUrl)
            })
            .catch(reject)
        })
        
        request.on('error', reject)
        request.setTimeout(30000, () => {
          request.destroy()
          reject(new Error('Download timeout'))
        })
      })
    } catch (error) {
      console.error('❌ ImageStorage: Failed to download image:', error)
      throw error
    }
  }
  
  /**
   * Get local path for an image
   */
  getLocalPath(filename: string): string {
    return path.join(this.STORAGE_DIR, filename)
  }
  
  /**
   * Check if image exists locally
   */
  imageExists(filename: string): boolean {
    return fs.existsSync(this.getLocalPath(filename))
  }
  
  /**
   * Get public URL for locally stored image
   */
  getPublicUrl(filename: string): string {
    return `${this.IMAGES_BASE_URL}/${filename}`
  }
  
  /**
   * Clean up old images (older than specified days)
   */
  async cleanupOldImages(olderThanDays: number = 90): Promise<void> {
    try {
      const files = fs.readdirSync(this.STORAGE_DIR)
      const cutoffTime = Date.now() - (olderThanDays * 24 * 60 * 60 * 1000)
      
      let deletedCount = 0
      for (const file of files) {
        const filePath = path.join(this.STORAGE_DIR, file)
        const stats = fs.statSync(filePath)
        
        if (stats.mtime.getTime() < cutoffTime) {
          fs.unlinkSync(filePath)
          deletedCount++
        }
      }
      
      if (deletedCount > 0) {
        console.log(`🗑️ ImageStorage: Cleaned up ${deletedCount} old images`)
      }
    } catch (error) {
      console.error('❌ ImageStorage: Cleanup failed:', error)
    }
  }
  
  /**
   * Get storage statistics
   */
  getStorageStats(): { totalImages: number; totalSizeMB: number } {
    try {
      const files = fs.readdirSync(this.STORAGE_DIR)
      let totalSize = 0
      
      for (const file of files) {
        const filePath = path.join(this.STORAGE_DIR, file)
        const stats = fs.statSync(filePath)
        totalSize += stats.size
      }
      
      return {
        totalImages: files.length,
        totalSizeMB: Math.round(totalSize / (1024 * 1024) * 100) / 100
      }
    } catch (error) {
      console.error('❌ ImageStorage: Failed to get stats:', error)
      return { totalImages: 0, totalSizeMB: 0 }
    }
  }
  
  /**
   * Process and store all images from a game result
   */
  async processGameImages(gameResult: any): Promise<any> {
    try {
      console.log(`📁 ImageStorage: Processing ${gameResult.imageSequence.length} images for game ${gameResult.gameId}`)
      
      const updatedImageSequence = await Promise.all(
        gameResult.imageSequence.map(async (image: any, index: number) => {
          try {
            const localUrl = await this.downloadAndStore(image.imageUrl, gameResult.gameId, index)
            return {
              ...image,
              imageUrl: localUrl,
              originalUrl: image.imageUrl // Keep reference to original
            }
          } catch (error) {
            console.error(`❌ ImageStorage: Failed to process image ${index}:`, error)
            // Keep original URL if download fails
            return image
          }
        })
      )
      
      return {
        ...gameResult,
        imageSequence: updatedImageSequence
      }
    } catch (error) {
      console.error('❌ ImageStorage: Failed to process game images:', error)
      return gameResult
    }
  }
}

export const imageStorageService = new ImageStorageService()