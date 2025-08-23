# 🎨 AiArtBrush

**Collaborative multiplayer artwork creation powered by AI**

AiArtBrush is an innovative web application that enables players to create evolving digital artwork through collaborative AI-powered image generation. Players take turns building upon previous artwork by submitting creative prompts, resulting in unique visual stories that showcase the power of human creativity combined with artificial intelligence.

![AiArtBrush Demo](https://img.shields.io/badge/Status-Beta-orange)
![License](https://img.shields.io/badge/License-MIT-blue)
![Node](https://img.shields.io/badge/Node-18+-green)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue)

## ✨ Features

### 🎭 Collaborative Art Creation
- **Multiplayer Sessions**: 2-8 players create artwork together in real-time
- **Turn-based Gameplay**: Players take sequential turns adding to the evolving artwork
- **Real-time Synchronization**: Live updates across all connected clients

### 🤖 AI-Powered Generation
- **Stable Diffusion XL**: High-quality image generation via Replicate API
- **Smart Prompt Enhancement**: Google Gemini AI improves prompts with context
- **Advanced Style System**: 200+ art styles with mixing capabilities

### 🖼️ Rich User Experience
- **Interactive Gallery**: Browse community creations with evolution viewing
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **No Registration**: Jump in instantly with just a nickname

### ⚡ Technical Excellence
- **WebSocket Real-time**: Instant updates and live collaboration
- **Type-Safe**: Full TypeScript coverage across frontend and backend
- **Optimized Performance**: Efficient caching and lazy loading

## 🚀 Quick Start

### Prerequisites
- Node.js 18.0.0 or higher
- Redis (local or cloud)
- API keys for Google Gemini and Replicate

### Installation

```bash
# Clone the repository
git clone https://github.com/ratneshs230/AiArtBrush.git
cd AiArtBrush

# Install dependencies for all packages
npm install

# Set up environment variables
cp backend/.env.example backend/.env
cp frontend/.env.local.example frontend/.env.local

# Edit the .env files with your API keys
# GEMINI_API_KEY=your_gemini_key
# REPLICATE_API_TOKEN=your_replicate_token
```

### Development

```bash
# Start Redis (with Docker)
docker run -d --name aiartbrush-redis -p 6379:6379 redis:7-alpine

# Start all services in development mode
npm run dev

# This will start:
# - Backend server on http://localhost:3001
# - Frontend server on http://localhost:3000
# - Shared package in watch mode
```

Open [http://localhost:3000](http://localhost:3000) to start creating collaborative artwork!

## 🏗️ Architecture

AiArtBrush follows a modern distributed architecture:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   External      │
│   (Next.js)     │◄──►│   (Node.js)     │◄──►│   Services      │
│                 │    │                 │    │                 │
│ • React 18      │    │ • Express       │    │ • Replicate     │
│ • TypeScript    │    │ • Socket.io     │    │ • Google Gemini │
│ • Tailwind CSS  │    │ • Redis         │    │ • Upstash       │
│ • Zustand       │    │ • Bull Queue    │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Tech Stack

**Frontend**
- [Next.js 14](https://nextjs.org/) - React framework with App Router
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first styling
- [Radix UI](https://www.radix-ui.com/) - Accessible components
- [Zustand](https://zustand-demo.pmnd.rs/) - State management
- [Socket.io Client](https://socket.io/) - Real-time communication

**Backend**
- [Node.js](https://nodejs.org/) - JavaScript runtime
- [Express](https://expressjs.com/) - Web application framework
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Socket.io](https://socket.io/) - Real-time bidirectional communication
- [Redis](https://redis.io/) - In-memory data store
- [Bull](https://github.com/OptimalBits/bull) - Job queue for AI processing

**External Services**
- [Replicate](https://replicate.com/) - AI image generation (Stable Diffusion XL)
- [Google Gemini](https://ai.google.dev/) - Prompt enhancement
- [Upstash](https://upstash.com/) - Managed Redis (production)

## 📖 Documentation

Comprehensive documentation is available in the `/documentation` directory:

- **[📋 Project Requirements](./documentation/01-project-requirements.md)** - Complete feature specifications
- **[🏗️ System Architecture](./documentation/02-system-architecture.md)** - Technical design and patterns
- **[🔄 Data Flow](./documentation/03-data-flow.md)** - Data movement and state management
- **[🔌 Integration Guide](./documentation/04-integration-guide.md)** - External service setup
- **[📡 API Documentation](./documentation/05-api-documentation.md)** - Complete API reference
- **[🛠️ Development Setup](./documentation/06-development-setup.md)** - Detailed setup instructions
- **[🚀 Deployment Guide](./documentation/07-deployment-guide.md)** - Production deployment

## 🎮 How to Play

1. **Create or Join a Room**: Start a new game or join with a room code
2. **Configure Settings**: Set player count, rounds, and time limits
3. **Take Turns**: Each player submits creative prompts in sequence
4. **Choose Art Styles**: Select from 200+ styles to influence the generation
5. **Watch AI Create**: See your prompts transformed into evolving artwork
6. **Share Results**: Download images and share your collaborative masterpiece

## 🌟 Game Modes

### Casual Mode
- **Focus**: Creative collaboration and fun
- **No Scoring**: Pure artistic expression
- **Relaxed Timing**: Generous turn limits

### Competitive Mode *(Coming Soon)*
- **Voting System**: Players rate each other's contributions
- **Leaderboards**: Track your artistic success
- **Tournaments**: Organized competitive events

## 🛠️ Development

### Project Structure

```
AiArtBrush/
├── backend/          # Node.js Express server
│   ├── src/
│   │   ├── services/ # Business logic services
│   │   ├── controllers/ # HTTP route handlers
│   │   └── index.ts  # Server entry point
│   └── storage/      # Local image storage
├── frontend/         # Next.js React application
│   ├── app/          # App router pages
│   ├── components/   # React components
│   ├── hooks/        # Custom React hooks
│   └── lib/          # Utilities and store
├── shared/           # Shared TypeScript definitions
│   └── src/
│       ├── types.ts  # Core type definitions
│       └── artStyles.ts # Art style database
└── documentation/    # Technical documentation
```

### Available Scripts

```bash
# Development
npm run dev          # Start all services in development
npm run build        # Build all packages for production
npm run start        # Start production server

# Quality Assurance
npm run test         # Run all tests
npm run type-check   # TypeScript compilation check
npm run lint         # ESLint code quality check
npm run format       # Prettier code formatting

# Package Management
npm run clean        # Clean all build artifacts
npm run reset        # Full reset and reinstall
```

### Environment Variables

**Backend (.env)**
```bash
# Server Configuration
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Database Configuration
REDIS_URL=redis://localhost:6379

# External API Keys (Required)
GEMINI_API_KEY=your_gemini_api_key_here
REPLICATE_API_TOKEN=your_replicate_token_here

# AI Generation Settings (Optional)
AI_STRENGTH=0.15              # Image generation strength (0.1-1.0, default: 0.25)
AI_GUIDANCE_SCALE=7.5         # How closely to follow the prompt (1-20, default: 7.5)
AI_INFERENCE_STEPS=20         # Generation quality steps (10-50, default: 30)
AI_SCHEDULER=K_EULER          # Sampling scheduler (default: K_EULER)
AI_NEGATIVE_PROMPT=blurry, bad quality, distorted, ugly  # What to avoid
AI_IMAGE_SIZE=1024            # Output image size in pixels (default: 1024)

# Game Configuration (Optional)
GAME_MAX_PLAYERS=8
GAME_ROUNDS_PER_PLAYER=2
GAME_TURN_TIME_LIMIT=60
GAME_VOTING_TIME_LIMIT=20
GAME_DEFAULT_MODE=casual

# Development Settings
LOG_LEVEL=debug
ENABLE_CORS=true

# Image Storage
IMAGES_BASE_URL=http://localhost:3001/images
```

**Frontend (.env.local)**
```bash
# Backend API Configuration
NEXT_PUBLIC_SERVER_URL=http://localhost:3001

# Environment
NEXT_PUBLIC_ENVIRONMENT=development
```

## 🚀 Deployment

AiArtBrush is designed for modern cloud deployment:

### Recommended Stack
- **Frontend**: [Vercel](https://vercel.com/) - Optimal Next.js hosting
- **Backend**: [Railway](https://railway.app/) or [Render](https://render.com/) - Node.js hosting
- **Database**: [Upstash](https://upstash.com/) - Managed Redis

### One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/ratneshs230/AiArtBrush)

For detailed deployment instructions, see the [Deployment Guide](./documentation/07-deployment-guide.md).

## 🤝 Contributing

We welcome contributions! Please read our [Contributing Guidelines](./CONTRIBUTING.md) before submitting PRs.

### Development Workflow

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes** and add tests
4. **Commit your changes**: `git commit -m 'Add amazing feature'`
5. **Push to the branch**: `git push origin feature/amazing-feature`
6. **Open a Pull Request**

### Code Style

- **TypeScript**: Strict mode enabled, no `any` types
- **ESLint**: Airbnb configuration with custom rules
- **Prettier**: Automatic code formatting
- **Testing**: Jest for unit tests, Playwright for E2E

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## 🙏 Acknowledgments

- **Stable Diffusion** by Stability AI for the image generation model
- **OpenAI** for inspiring AI-human collaboration
- **Replicate** for providing accessible AI model hosting
- **Google** for the Gemini AI API
- **The Open Source Community** for the amazing tools and libraries

## 📞 Support

- **Documentation**: Check the `/documentation` directory
- **Issues**: [GitHub Issues](https://github.com/your-org/AiArtBrush/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-org/AiArtBrush/discussions)

## 🔮 Roadmap

### Short Term (Q4 2025)
- [ ] User accounts and persistent profiles
- [ ] Enhanced voting and scoring systems
- [ ] Mobile app development
- [ ] Custom style creation tools

### Medium Term (Q1 2026)
- [ ] Video generation capabilities
- [ ] VR/AR integration
- [ ] Tournament and competition modes
- [ ] Marketplace for custom styles

### Long Term (2026+)
- [ ] Machine learning recommendations
- [ ] Blockchain artwork ownership
- [ ] Educational curriculum integration
- [ ] Professional artist collaboration tools

---

<div align="center">

**Made with ❤️ by the AiArtBrush team**

[Website](https://aiartbrush.app) • [Documentation](./documentation/) • [API Reference](./documentation/05-api-documentation.md)

</div>
