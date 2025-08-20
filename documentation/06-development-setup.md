# AiArtBrush Development Setup Guide

## 1. Overview

This guide provides step-by-step instructions for setting up the AiArtBrush development environment, including all dependencies, configuration, and best practices for local development.

## 2. Prerequisites

### 2.1 System Requirements

**Operating System:**
- macOS 10.15+ / Windows 10+ / Linux (Ubuntu 18.04+ recommended)
- 64-bit architecture

**Hardware Requirements:**
- RAM: 8GB minimum, 16GB recommended
- Storage: 10GB free space
- CPU: Multi-core processor (4+ cores recommended)
- Network: Stable internet connection for AI services

### 2.2 Required Software

**Core Dependencies:**
```bash
# Node.js (Version 18.0.0 or higher)
node --version  # Should output v18.0.0 or higher
npm --version   # Should output 9.0.0 or higher

# Git (Latest stable version)
git --version

# Code Editor (Recommended: VS Code)
# Download from: https://code.visualstudio.com/
```

**Optional but Recommended:**
```bash
# Docker (for Redis local setup)
docker --version

# pnpm (faster package manager)
npm install -g pnpm

# Postman or similar (for API testing)
```

### 2.3 External Service Accounts

**Required API Keys:**
1. **Google Gemini API Key**
   - Visit: https://ai.google.dev/
   - Create project and enable Gemini API
   - Generate API key

2. **Replicate API Token**
   - Visit: https://replicate.com/
   - Create account and get API token
   - Note: Requires credit card for API usage

**Optional Services:**
- Redis Cloud account (for production-like testing)
- Upstash account (for managed Redis)

## 3. Project Setup

### 3.1 Repository Clone

```bash
# Clone the repository
git clone https://github.com/your-org/AiArtBrush.git
cd AiArtBrush

# Check repository structure
ls -la
# Should show: backend/, frontend/, shared/, documentation/, package.json
```

### 3.2 Install Dependencies

```bash
# Install root dependencies and all workspace packages
npm install

# Alternative with pnpm (if installed)
pnpm install

# Verify workspace setup
npm run --silent workspaces list
```

**Expected Output:**
```
@aiartbrush/backend
@aiartbrush/frontend
@aiartbrush/shared
```

### 3.3 Environment Configuration

#### 3.3.1 Backend Environment Setup

```bash
# Navigate to backend directory
cd backend

# Copy environment template
cp .env.example .env

# Edit environment file
nano .env  # or use your preferred editor
```

**Backend Environment Variables (.env):**
```bash
# Server Configuration
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Database Configuration
REDIS_URL=redis://localhost:6379

# External API Keys (REQUIRED)
GEMINI_API_KEY=your_gemini_api_key_here
REPLICATE_API_TOKEN=your_replicate_token_here

# AI Generation Settings
AI_STRENGTH=0.15
AI_GUIDANCE_SCALE=7.5
AI_INFERENCE_STEPS=20
AI_SCHEDULER=K_EULER
AI_NEGATIVE_PROMPT=blurry, bad quality, distorted, ugly
AI_IMAGE_SIZE=1024

# Game Configuration
GAME_MAX_PLAYERS=8
GAME_ROUNDS_PER_PLAYER=2
GAME_TURN_TIME_LIMIT=60
GAME_VOTING_TIME_LIMIT=20
GAME_DEFAULT_MODE=casual

# Development Settings
LOG_LEVEL=debug
ENABLE_CORS=true
```

#### 3.3.2 Frontend Environment Setup

```bash
# Navigate to frontend directory
cd ../frontend

# Copy environment template
cp .env.local.example .env.local

# Edit environment file
nano .env.local
```

**Frontend Environment Variables (.env.local):**
```bash
# Backend API Configuration
NEXT_PUBLIC_SERVER_URL=http://localhost:3001
NEXT_PUBLIC_WS_URL=ws://localhost:3001

# Environment
NEXT_PUBLIC_ENVIRONMENT=development

# Analytics (Optional)
NEXT_PUBLIC_ANALYTICS_ID=your_analytics_id

# Feature Flags
NEXT_PUBLIC_ENABLE_DEBUG=true
NEXT_PUBLIC_ENABLE_GALLERY=true
```

## 4. Database Setup

### 4.1 Redis Installation

#### Option A: Docker Setup (Recommended)

```bash
# Pull Redis image
docker pull redis:7-alpine

# Run Redis container
docker run -d \
  --name artloop-redis \
  -p 6379:6379 \
  redis:7-alpine

# Verify Redis is running
docker ps | grep redis
```

#### Option B: Local Installation

**macOS (using Homebrew):**
```bash
brew install redis
brew services start redis
```

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install redis-server
sudo systemctl start redis-server
sudo systemctl enable redis-server
```

**Windows:**
```bash
# Using Chocolatey
choco install redis-64

# Or download from: https://github.com/tporadowski/redis/releases
```

### 4.2 Redis Configuration Verification

```bash
# Test Redis connection
redis-cli ping
# Expected response: PONG

# Check Redis info
redis-cli info server

# Test from Node.js (optional)
cd backend
npm run test:redis  # Custom script to test Redis connection
```

### 4.3 Database Schema Setup

```bash
# Navigate to backend directory
cd backend

# Run database initialization (if any scripts exist)
npm run db:setup

# Seed development data (optional)
npm run db:seed
```

## 5. Development Server Setup

### 5.1 Shared Package Build

```bash
# Navigate to shared directory
cd shared

# Build shared types
npm run build

# Watch for changes (in separate terminal)
npm run dev
```

### 5.2 Backend Server

```bash
# Navigate to backend directory
cd backend

# Install dependencies (if not done already)
npm install

# Start development server
npm run dev

# Expected output:
# 🔧 Redis: Successfully connected to Redis
# 🔧 AI Service: Gemini API key exists: true
# 🔧 AI Service: Replicate API token exists: true
# ✅ AI Service: Google Gemini client initialized
# ✅ AI Service: Replicate client initialized for img2img
# AI queue initialized
# Server running on port 3001
```

### 5.3 Frontend Server

```bash
# Open new terminal and navigate to frontend
cd frontend

# Install dependencies (if not done already)
npm install

# Start development server
npm run dev

# Expected output:
# ▲ Next.js 14.2.13
# - Local:        http://localhost:3000
# - Network:      http://192.168.1.100:3000
```

### 5.4 Concurrent Development

```bash
# From root directory, start all services
npm run dev

# This will concurrently run:
# - Shared package in watch mode
# - Backend server with hot reload
# - Frontend server with hot reload
```

**Expected Output:**
```
[shared]  ✓ Built in 150ms
[backend] Server running on port 3001
[frontend] ▲ Next.js 14.2.13
[frontend] - Local:        http://localhost:3000
```

## 6. Development Tools Setup

### 6.1 VS Code Configuration

**Recommended Extensions:**
```json
{
  "recommendations": [
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-json",
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "ms-vscode.vscode-jest",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense"
  ]
}
```

**Workspace Settings (.vscode/settings.json):**
```json
{
  "typescript.preferences.includePackageJsonAutoImports": "on",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "files.associations": {
    "*.css": "tailwindcss"
  },
  "emmet.includeLanguages": {
    "javascript": "javascriptreact",
    "typescript": "typescriptreact"
  }
}
```

**Debug Configuration (.vscode/launch.json):**
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug Backend",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/backend/src/index.ts",
      "outFiles": ["${workspaceFolder}/backend/dist/**/*.js"],
      "envFile": "${workspaceFolder}/backend/.env",
      "console": "integratedTerminal"
    },
    {
      "name": "Debug Frontend",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/frontend/node_modules/.bin/next",
      "args": ["dev"],
      "cwd": "${workspaceFolder}/frontend",
      "console": "integratedTerminal"
    }
  ]
}
```

### 6.2 Git Hooks Setup

```bash
# Install husky for git hooks
npm install --save-dev husky

# Initialize husky
npx husky install

# Add pre-commit hook
npx husky add .husky/pre-commit "npm run lint"

# Add commit message hook
npx husky add .husky/commit-msg "npm run commitlint"
```

**Commit Message Convention:**
```bash
# Format: type(scope): description
feat(backend): add image storage service
fix(frontend): resolve socket connection issue
docs(api): update endpoint documentation
```

### 6.3 Testing Setup

#### Unit Tests
```bash
# Backend tests
cd backend
npm run test

# Frontend tests
cd frontend
npm run test

# Run all tests
cd .. && npm run test
```

#### Integration Tests
```bash
# Start test environment
npm run test:setup

# Run integration tests
npm run test:integration

# Cleanup test environment
npm run test:cleanup
```

#### E2E Tests (Optional)
```bash
# Install Playwright
npm install -D @playwright/test

# Run E2E tests
npm run test:e2e
```

## 7. Development Workflow

### 7.1 Daily Development Process

1. **Start Development Environment:**
```bash
# Terminal 1: Start all services
npm run dev

# Terminal 2: Watch shared package (if making type changes)
cd shared && npm run dev

# Terminal 3: Available for commands
```

2. **Development Tasks:**
```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Formatting
npm run format

# Testing
npm run test
```

3. **Code Quality Checks:**
```bash
# Run all quality checks
npm run quality-check

# This runs: lint, type-check, test
```

### 7.2 Feature Development Workflow

1. **Create Feature Branch:**
```bash
git checkout -b feature/new-feature-name
```

2. **Development Cycle:**
```bash
# Make changes
# Run tests
npm run test

# Check types
npm run type-check

# Lint code
npm run lint

# Commit changes
git add .
git commit -m "feat: implement new feature"
```

3. **Pre-merge Checklist:**
- [ ] All tests passing
- [ ] No TypeScript errors
- [ ] ESLint passing
- [ ] Code formatted
- [ ] Documentation updated
- [ ] Environment variables documented

### 7.3 Debugging

#### Backend Debugging
```bash
# Enable debug logging
DEBUG=artloop:* npm run dev

# Or set LOG_LEVEL in .env
LOG_LEVEL=debug
```

#### Frontend Debugging
```bash
# Enable Next.js debug mode
DEBUG=* npm run dev

# React Developer Tools
# Install: https://chrome.google.com/webstore/detail/react-developer-tools
```

#### Redis Debugging
```bash
# Monitor Redis commands
redis-cli monitor

# Check Redis keys
redis-cli keys "*"

# Inspect specific key
redis-cli get "room:abc123"
```

## 8. Common Issues and Solutions

### 8.1 Installation Issues

**Node.js Version Mismatch:**
```bash
# Check current version
node --version

# Install Node Version Manager (nvm)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Install and use correct Node.js version
nvm install 18
nvm use 18
```

**Package Installation Fails:**
```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

### 8.2 Redis Connection Issues

**Redis Not Running:**
```bash
# Check if Redis is running
redis-cli ping

# Start Redis (Docker)
docker start artloop-redis

# Start Redis (local)
redis-server
```

**Connection Refused:**
```bash
# Check Redis port
netstat -an | grep 6379

# Check Redis logs
docker logs artloop-redis
```

### 8.3 API Key Issues

**Missing API Keys:**
```bash
# Check environment variables
echo $GEMINI_API_KEY
echo $REPLICATE_API_TOKEN

# Verify .env file exists and has correct values
cat backend/.env | grep -E "(GEMINI|REPLICATE)"
```

**Invalid API Keys:**
```bash
# Test Gemini API
curl -H "Authorization: Bearer $GEMINI_API_KEY" \
  https://generativelanguage.googleapis.com/v1/models

# Test Replicate API
curl -H "Authorization: Token $REPLICATE_API_TOKEN" \
  https://api.replicate.com/v1/models
```

### 8.4 Port Conflicts

**Port Already in Use:**
```bash
# Check what's using port 3001
lsof -i :3001

# Kill process using port
kill -9 <PID>

# Or use different port
PORT=3002 npm run dev
```

### 8.5 TypeScript Issues

**Module Not Found:**
```bash
# Rebuild shared package
cd shared && npm run build

# Clear TypeScript cache
rm -rf backend/.tsbuildinfo frontend/.next/cache
```

**Type Errors:**
```bash
# Check all TypeScript errors
npm run type-check

# Restart TypeScript server in VS Code
# Ctrl+Shift+P -> "TypeScript: Restart TS Server"
```

## 9. Performance Optimization

### 9.1 Development Performance

**Faster Installation:**
```bash
# Use pnpm instead of npm
npm install -g pnpm
pnpm install
```

**Faster Builds:**
```bash
# Use SWC instead of Babel (Next.js 12+)
# Already configured in next.config.js

# Enable TypeScript incremental compilation
# Already configured in tsconfig.json
```

### 9.2 Development Server Optimization

**Next.js Optimizations:**
```javascript
// next.config.js
module.exports = {
  experimental: {
    turbo: true,        // Enable Turbopack (faster dev builds)
    swcMinify: true     // Use SWC for minification
  }
}
```

**Backend Optimizations:**
```javascript
// Use tsx for faster TypeScript execution
"scripts": {
  "dev": "tsx watch src/index.ts"
}
```

## 10. Environment Troubleshooting

### 10.1 Health Check Commands

```bash
# Check all services
npm run health-check

# Individual service checks
npm run health-check:redis
npm run health-check:backend
npm run health-check:frontend
```

### 10.2 Reset Development Environment

```bash
# Full reset (use with caution)
npm run dev:reset

# This will:
# 1. Stop all services
# 2. Clear Redis data
# 3. Remove node_modules
# 4. Reinstall dependencies
# 5. Restart services
```

### 10.3 Logging and Monitoring

**Development Logs:**
```bash
# Backend logs
tail -f backend/logs/development.log

# Frontend logs (browser console)
# Open browser dev tools -> Console

# Redis logs
docker logs -f artloop-redis
```

## 11. Contributing Guidelines

### 11.1 Code Style

- Follow ESLint configuration
- Use Prettier for formatting
- Write meaningful commit messages
- Add JSDoc comments for functions
- Write tests for new features

### 11.2 Pull Request Process

1. Create feature branch
2. Make changes with tests
3. Update documentation
4. Submit pull request
5. Address review feedback
6. Merge after approval

### 11.3 Development Best Practices

- Keep functions small and focused
- Use TypeScript strictly (no `any` types)
- Handle errors gracefully
- Write comprehensive tests
- Document complex logic
- Follow security best practices

---

**Document Version**: 1.0  
**Last Updated**: August 2025  
**Next Review**: September 2025  
**Setup Tested On**: Node.js 18.17.0, npm 9.6.7