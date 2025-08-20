import { Request, Response } from 'express'
import { redis } from '../services/redisService'

export async function getGameResults(req: Request, res: Response) {
  try {
    const { gameId } = req.params
    
    if (!gameId) {
      return res.status(400).json({ error: 'Game ID is required' })
    }
    
    const key = `game_results:${gameId}`
    const resultsData = await redis.get(key)
    
    if (!resultsData) {
      return res.status(404).json({ error: 'Game results not found' })
    }
    
    const results = JSON.parse(resultsData)
    res.json(results)
    
  } catch (error) {
    console.error('Error retrieving game results:', error)
    res.status(500).json({ error: 'Failed to retrieve game results' })
  }
}