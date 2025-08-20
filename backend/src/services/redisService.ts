import Redis from 'ioredis'
import type { Room, Game, Player } from '@ai-art-chain/shared'

let redis: Redis

export { redis }

export async function initializeRedis() {
  console.log('🔧 Redis: Initializing Redis connection to', process.env.REDIS_URL || 'redis://localhost:6379')
  redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379')
  
  redis.on('connect', () => {
    console.log('✅ Redis: Successfully connected to Redis')
  })
  
  redis.on('error', (err) => {
    console.error('❌ Redis: Connection error:', err)
  })
  
  redis.on('ready', () => {
    console.log('✅ Redis: Redis is ready to accept commands')
  })
  
  return redis
}

export function getRedis() {
  if (!redis) {
    throw new Error('Redis not initialized')
  }
  return redis
}

export const roomService = {
  async create(room: Room): Promise<void> {
    await redis.setex(`room:${room.id}`, 3600, JSON.stringify(room))
    await redis.setex(`room:code:${room.code}`, 3600, room.id)
  },
  
  async get(roomId: string): Promise<Room | null> {
    const data = await redis.get(`room:${roomId}`)
    return data ? JSON.parse(data) : null
  },
  
  async getByCode(code: string): Promise<Room | null> {
    const roomId = await redis.get(`room:code:${code}`)
    if (!roomId) return null
    return this.get(roomId)
  },
  
  async update(room: Room): Promise<void> {
    await redis.setex(`room:${room.id}`, 3600, JSON.stringify(room))
  },
  
  async delete(roomId: string): Promise<void> {
    const room = await this.get(roomId)
    if (room) {
      await redis.del(`room:${roomId}`)
      await redis.del(`room:code:${room.code}`)
    }
  }
}

export const gameService = {
  async create(game: Game): Promise<void> {
    await redis.setex(`game:${game.id}`, 7200, JSON.stringify(game))
  },
  
  async get(gameId: string): Promise<Game | null> {
    const data = await redis.get(`game:${gameId}`)
    return data ? JSON.parse(data) : null
  },
  
  async update(game: Game): Promise<void> {
    await redis.setex(`game:${game.id}`, 7200, JSON.stringify(game))
  },
  
  async delete(gameId: string): Promise<void> {
    await redis.del(`game:${gameId}`)
  }
}

export const sessionService = {
  async setPlayerSession(sessionId: string, player: Player, roomId: string): Promise<void> {
    console.log('🔧 Redis: Setting player session for', sessionId, 'in room', roomId)
    await redis.setex(`session:${sessionId}`, 3600, JSON.stringify({ player, roomId }))
    console.log('✅ Redis: Player session set successfully')
  },
  
  async getPlayerSession(sessionId: string): Promise<{ player: Player; roomId: string } | null> {
    console.log('🔧 Redis: Getting player session for', sessionId)
    const data = await redis.get(`session:${sessionId}`)
    const result = data ? JSON.parse(data) : null
    console.log('📦 Redis: Player session result:', result ? 'found' : 'not found')
    return result
  },
  
  async deletePlayerSession(sessionId: string): Promise<void> {
    console.log('🔧 Redis: Deleting player session for', sessionId)
    await redis.del(`session:${sessionId}`)
    console.log('✅ Redis: Player session deleted')
  }
}