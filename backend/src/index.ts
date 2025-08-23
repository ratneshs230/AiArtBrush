import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'path'
import { setupSocketHandlers } from './services/socketService'
import { initializeRedis } from './services/redisService'
import { initializeAIQueue } from './services/aiService'
import { getGameResults } from './controllers/gameResultsController'
import type { ServerToClientEvents, ClientToServerEvents } from '@aiartbrush/shared'

dotenv.config()

const app = express()
const httpServer = createServer(app)
const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
  cors: {
    origin: [process.env.FRONTEND_URL || 'http://localhost:3000', 'http://localhost:3000'],
    methods: ['GET', 'POST'],
    allowedHeaders: ['*'],
    credentials: false
  }
})

app.use(cors())
app.use(express.json())

// Serve static images
const storageDir = path.join(process.cwd(), 'storage', 'images')
app.use('/images', express.static(storageDir))

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.get('/api/game-results/:gameId', getGameResults)

async function startServer() {
  try {
    await initializeRedis()
    await initializeAIQueue()
    
    setupSocketHandlers(io)
    
    const PORT = process.env.PORT || 3001
    httpServer.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`)
    })
  } catch (error) {
    console.error('Failed to start server:', error)
    process.exit(1)
  }
}

startServer()