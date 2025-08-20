# AiArtBrush Deployment Guide

## 1. Overview

This guide provides comprehensive deployment instructions for the AiArtBrush system across different environments, including development, staging, and production deployments using modern cloud platforms.

## 2. Deployment Architecture

### 2.1 Deployment Strategy

AiArtBrush follows a **distributed deployment model** with separate hosting for frontend and backend components:

- **Frontend**: Deployed on Vercel for optimal Next.js performance and global CDN
- **Backend**: Deployed on Railway or Render for Node.js hosting with auto-scaling
- **Database**: Managed Redis via Upstash for global low-latency access
- **Storage**: Local file system with CDN integration for image delivery

### 2.2 Environment Overview

```mermaid
graph TB
    subgraph "Production Environment"
        FE_PROD[Vercel Frontend]
        BE_PROD[Railway Backend]
        DB_PROD[Upstash Redis]
        CDN_PROD[Vercel CDN]
    end
    
    subgraph "Staging Environment"
        FE_STAGE[Vercel Preview]
        BE_STAGE[Railway Preview]
        DB_STAGE[Upstash Staging]
    end
    
    subgraph "Development Environment"
        FE_DEV[Local Next.js]
        BE_DEV[Local Node.js]
        DB_DEV[Local Redis]
    end
    
    FE_PROD --> BE_PROD
    BE_PROD --> DB_PROD
    FE_PROD --> CDN_PROD
    
    FE_STAGE --> BE_STAGE
    BE_STAGE --> DB_STAGE
    
    FE_DEV --> BE_DEV
    BE_DEV --> DB_DEV
```

## 3. Pre-Deployment Checklist

### 3.1 Code Preparation

```bash
# 1. Ensure all tests pass
npm run test

# 2. Check TypeScript compilation
npm run type-check

# 3. Lint code
npm run lint

# 4. Build all packages
npm run build

# 5. Security audit
npm audit

# 6. Update documentation
# Ensure README and docs are current
```

### 3.2 Environment Variables Audit

**Required Environment Variables:**
```bash
# Backend Production Variables
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://your-domain.vercel.app
REDIS_URL=rediss://username:password@global-redis.upstash.io:6380
GEMINI_API_KEY=production_gemini_key
REPLICATE_API_TOKEN=production_replicate_token

# Frontend Production Variables
NEXT_PUBLIC_SERVER_URL=https://your-backend.railway.app
NEXT_PUBLIC_ENVIRONMENT=production
```

### 3.3 External Service Configuration

**Verify API Quotas:**
- Google Gemini API: Production quota limits
- Replicate API: Billing and rate limits configured
- Upstash Redis: Database size and connection limits

## 4. Database Deployment (Redis)

### 4.1 Upstash Setup

#### 4.1.1 Account Creation
1. Visit [Upstash Console](https://console.upstash.com/)
2. Create account and verify email
3. Choose appropriate pricing plan

#### 4.1.2 Database Creation
```bash
# Create Redis database via CLI (optional)
npm install -g @upstash/cli
upstash auth
upstash redis create artloop-prod --region global
```

**Via Web Console:**
1. Click "Create Database"
2. Choose "Global" for worldwide low latency
3. Set database name: `artloop-production`
4. Configure TLS: Enabled
5. Choose region: Global (recommended)

#### 4.1.3 Connection Configuration
```bash
# Get connection details from Upstash console
REDIS_URL=rediss://username:password@global-redis.upstash.io:6380
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_rest_token
```

### 4.2 Data Migration (if applicable)

```bash
# Export development data (optional)
redis-cli --rdb /path/to/dump.rdb

# Import to production (use with caution)
# Usually not needed for session-based data
```

### 4.3 Redis Configuration Verification

```javascript
// Test production Redis connection
const redis = new Redis(process.env.REDIS_URL)

redis.ping().then(() => {
  console.log('✅ Production Redis connected')
}).catch(error => {
  console.error('❌ Redis connection failed:', error)
})
```

## 5. Backend Deployment

### 5.1 Railway Deployment

#### 5.1.1 Initial Setup

**Option A: CLI Deployment**
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Initialize project
cd backend
railway init

# Link to existing project (if applicable)
railway link [project-id]
```

**Option B: GitHub Integration**
1. Visit [Railway Dashboard](https://railway.app/dashboard)
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. Choose backend directory as root path

#### 5.1.2 Environment Configuration

```bash
# Set environment variables via CLI
railway variables set NODE_ENV=production
railway variables set PORT=3001
railway variables set FRONTEND_URL=https://your-domain.vercel.app
railway variables set REDIS_URL=rediss://your-redis-url
railway variables set GEMINI_API_KEY=your_production_key
railway variables set REPLICATE_API_TOKEN=your_production_token

# Or upload .env file
railway variables set --from-file .env.production
```

**Railway Configuration File (railway.toml):**
```toml
[build]
builder = "nixpacks"
buildCommand = "npm install && npm run build"

[deploy]
startCommand = "npm start"
healthcheckPath = "/health"
healthcheckTimeout = 300
restartPolicyType = "always"

[env]
NODE_ENV = "production"
PORT = "3001"
```

#### 5.1.3 Build Configuration

**Package.json Scripts:**
```json
{
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js",
    "dev": "tsx watch src/index.ts",
    "test": "jest",
    "lint": "eslint src/**/*.ts"
  }
}
```

**TypeScript Configuration:**
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.test.ts"]
}
```

#### 5.1.4 Deployment Process

```bash
# Deploy via CLI
railway deploy

# Or push to GitHub (if connected)
git push origin main

# Monitor deployment
railway logs --tail
```

### 5.2 Alternative: Render Deployment

#### 5.2.1 Setup Process
1. Connect GitHub repository to Render
2. Create new "Web Service"
3. Select repository and backend directory
4. Configure build and start commands

**Render Configuration:**
```yaml
# render.yaml
services:
  - type: web
    name: artloop-backend
    env: node
    plan: starter
    buildCommand: npm install && npm run build
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 3001
      - key: REDIS_URL
        sync: false
      - key: GEMINI_API_KEY
        sync: false
      - key: REPLICATE_API_TOKEN
        sync: false
```

### 5.3 Health Monitoring Setup

```typescript
// Enhanced health check endpoint
app.get('/health', async (req, res) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version,
    services: {
      redis: 'connected',
      queue: 'active'
    }
  }
  
  try {
    // Test Redis connection
    await redis.ping()
    health.services.redis = 'connected'
    
    // Test AI services
    const queueStats = await queue.getJobCounts()
    health.services.queue = queueStats.waiting < 100 ? 'active' : 'overloaded'
    
    res.status(200).json(health)
  } catch (error) {
    health.status = 'error'
    health.services.redis = 'disconnected'
    res.status(503).json(health)
  }
})
```

## 6. Frontend Deployment

### 6.1 Vercel Deployment

#### 6.1.1 Project Setup

**Option A: Vercel CLI**
```bash
# Install Vercel CLI
npm install -g vercel

# Navigate to frontend directory
cd frontend

# Deploy to Vercel
vercel

# Follow prompts:
# ? Set up and deploy "frontend"? [Y/n] y
# ? Which scope do you want to deploy to? [your-team]
# ? Link to existing project? [y/N] n
# ? What's your project's name? artloop-frontend
# ? In which directory is your code located? ./
```

**Option B: GitHub Integration**
1. Visit [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import Git repository
4. Select frontend directory as root
5. Configure environment variables

#### 6.1.2 Environment Configuration

```bash
# Set production environment variables
vercel env add NEXT_PUBLIC_SERVER_URL production
# Enter: https://your-backend.railway.app

vercel env add NEXT_PUBLIC_ENVIRONMENT production
# Enter: production

vercel env add NEXT_PUBLIC_WS_URL production
# Enter: wss://your-backend.railway.app
```

**Vercel Configuration (vercel.json):**
```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "installCommand": "npm install",
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 30
    }
  },
  "headers": [
    {
      "source": "/images/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=86400"
        }
      ]
    }
  ],
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://your-backend.railway.app/api/:path*"
    }
  ]
}
```

#### 6.1.3 Build Configuration

**Next.js Configuration (next.config.js):**
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  images: {
    domains: ['localhost', 'your-backend.railway.app'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  // Production optimizations
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
}

module.exports = nextConfig
```

#### 6.1.4 Deployment Process

```bash
# Deploy to production
vercel --prod

# Deploy preview (staging)
vercel

# Check deployment status
vercel ls

# View logs
vercel logs [deployment-url]
```

### 6.2 Custom Domain Setup

#### 6.2.1 Domain Configuration

```bash
# Add custom domain via CLI
vercel domains add your-domain.com

# Or via Vercel dashboard:
# Project Settings → Domains → Add Domain
```

#### 6.2.2 SSL Certificate
- Vercel automatically provisions SSL certificates
- HTTPS is enforced by default
- Custom certificates can be uploaded if needed

#### 6.2.3 DNS Configuration
```dns
# DNS Records for your-domain.com
Type    Name    Value                   TTL
CNAME   @       cname.vercel-dns.com.   Auto
CNAME   www     cname.vercel-dns.com.   Auto
```

## 7. CI/CD Pipeline Setup

### 7.1 GitHub Actions Workflow

**.github/workflows/deploy.yml:**
```yaml
name: Deploy ART-loop

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      redis:
        image: redis:7-alpine
        ports:
          - 6379:6379
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build shared package
        run: |
          cd shared
          npm run build
      
      - name: Run tests
        run: npm run test
        env:
          REDIS_URL: redis://localhost:6379
          GEMINI_API_KEY: ${{ secrets.GEMINI_API_KEY }}
          REPLICATE_API_TOKEN: ${{ secrets.REPLICATE_API_TOKEN }}
      
      - name: Type check
        run: npm run type-check
      
      - name: Lint
        run: npm run lint

  deploy-backend:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Deploy to Railway
        uses: railway/railway-cli-action@v1
        with:
          api-token: ${{ secrets.RAILWAY_API_TOKEN }}
          project-id: ${{ secrets.RAILWAY_PROJECT_ID }}
          service-name: backend
        env:
          RAILWAY_ENVIRONMENT: production

  deploy-frontend:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Deploy to Vercel
        uses: vercel/action@v1
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

### 7.2 Environment Secrets Configuration

**GitHub Repository Secrets:**
```bash
# Required secrets in GitHub repository settings
RAILWAY_API_TOKEN=your_railway_token
RAILWAY_PROJECT_ID=your_project_id
VERCEL_TOKEN=your_vercel_token
ORG_ID=your_vercel_org_id
PROJECT_ID=your_vercel_project_id
GEMINI_API_KEY=your_production_gemini_key
REPLICATE_API_TOKEN=your_production_replicate_token
```

### 7.3 Preview Deployments

**Automatic Preview Deployments:**
- Vercel: Automatic preview for every PR
- Railway: Create preview environment for feature branches

```yaml
# Additional workflow for preview deployments
name: Preview Deployment

on:
  pull_request:
    branches: [main]

jobs:
  deploy-preview:
    runs-on: ubuntu-latest
    steps:
      - name: Deploy Preview
        run: |
          # Deploy backend to Railway preview
          railway deploy --environment preview
          
          # Deploy frontend to Vercel preview
          vercel deploy --token ${{ secrets.VERCEL_TOKEN }}
```

## 8. Monitoring and Observability

### 8.1 Application Monitoring

#### 8.1.1 Health Checks

```typescript
// Backend health monitoring
setInterval(async () => {
  try {
    const health = await fetch('/health')
    if (!health.ok) {
      console.error('Health check failed:', health.status)
    }
  } catch (error) {
    console.error('Health check error:', error)
  }
}, 60000) // Check every minute
```

#### 8.1.2 Error Tracking

**Sentry Integration:**
```bash
# Install Sentry
npm install @sentry/node @sentry/nextjs

# Configure Sentry
# sentry.client.config.js (frontend)
# sentry.server.config.js (backend)
```

```typescript
// Backend Sentry configuration
import * as Sentry from '@sentry/node'

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
})
```

### 8.2 Performance Monitoring

#### 8.2.1 Metrics Collection

```typescript
// Custom metrics
interface Metrics {
  games_created_total: number
  images_generated_total: number
  active_connections: number
  response_time_avg: number
}

// Collect metrics
const metrics = {
  games_created_total: await redis.get('metrics:games_created') || 0,
  active_connections: io.engine.clientsCount,
  response_time_avg: calculateAverageResponseTime()
}
```

#### 8.2.2 Logging Strategy

```typescript
// Structured logging
import winston from 'winston'

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
})
```

## 9. Security Configuration

### 9.1 Environment Security

**Secrets Management:**
```bash
# Use environment variables for all secrets
# Never commit .env files to version control
# Use platform-specific secret management

# Vercel: Environment Variables in dashboard
# Railway: Environment variables in project settings
# GitHub: Repository secrets for CI/CD
```

### 9.2 Network Security

**CORS Configuration:**
```typescript
// Production CORS settings
app.use(cors({
  origin: [
    'https://your-domain.vercel.app',
    'https://your-domain.com'
  ],
  credentials: false,
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))
```

**Security Headers:**
```typescript
// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"]
    }
  }
}))
```

### 9.3 API Security

**Rate Limiting:**
```typescript
import rateLimit from 'express-rate-limit'

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP'
})

app.use('/api/', limiter)
```

## 10. Backup and Recovery

### 10.1 Data Backup Strategy

**Redis Backup:**
```bash
# Upstash automatic backups (built-in)
# Daily backups with 7-day retention
# Point-in-time recovery available

# Manual backup (if needed)
redis-cli --rdb backup-$(date +%Y%m%d).rdb
```

**Code Backup:**
- Git repository serves as primary backup
- Multiple deployment environments provide redundancy
- Regular dependency updates and security patches

### 10.2 Disaster Recovery

**Recovery Procedures:**
1. **Service Outage**: Automatic failover via platform health checks
2. **Data Loss**: Restore from latest Redis backup
3. **Code Issues**: Rollback to previous deployment
4. **Security Breach**: Revoke API keys, update secrets, redeploy

**Recovery Time Objectives:**
- **RTO (Recovery Time Objective)**: 15 minutes
- **RPO (Recovery Point Objective)**: 1 hour
- **Service Availability**: 99.9% uptime target

## 11. Scaling Considerations

### 11.1 Horizontal Scaling

**Backend Scaling:**
```yaml
# Railway scaling configuration
[deploy]
replicas = { min = 1, max = 10 }
autoscaling = true
cpu_threshold = 80
memory_threshold = 85
```

**Frontend Scaling:**
- Vercel automatically scales based on traffic
- Global edge network provides geographic distribution
- Static assets cached at CDN edge locations

### 11.2 Database Scaling

**Redis Scaling Options:**
- Upstash automatic scaling based on usage
- Connection pooling for efficient resource usage
- Read replicas for high-traffic scenarios

### 11.3 Cost Optimization

**Resource Optimization:**
```typescript
// Efficient resource usage
const redisPool = new Redis.Cluster([
  { host: 'redis-1', port: 6379 },
  { host: 'redis-2', port: 6379 }
], {
  enableReadyCheck: false,
  redisOptions: {
    password: process.env.REDIS_PASSWORD
  }
})
```

## 12. Deployment Verification

### 12.1 Post-Deployment Checklist

```bash
# 1. Health check endpoints
curl https://your-backend.railway.app/health

# 2. Frontend accessibility
curl https://your-domain.vercel.app

# 3. API functionality
curl https://your-backend.railway.app/api/health

# 4. WebSocket connectivity
# Test real-time features in browser

# 5. Database connectivity
# Check Redis connection via health endpoint

# 6. External service integration
# Verify AI generation works end-to-end
```

### 12.2 Performance Verification

```bash
# Load testing with artillery
npm install -g artillery
artillery quick --count 10 --num 100 https://your-domain.vercel.app

# Monitor response times
curl -w "@curl-format.txt" -o /dev/null https://your-backend.railway.app/health
```

### 12.3 Security Verification

```bash
# SSL certificate check
openssl s_client -connect your-domain.vercel.app:443 -servername your-domain.vercel.app

# Security headers check
curl -I https://your-domain.vercel.app

# CORS verification
curl -H "Origin: https://malicious-site.com" https://your-backend.railway.app/health
```

---

**Document Version**: 1.0  
**Last Updated**: August 2025  
**Deployment Tested**: Vercel + Railway + Upstash  
**Next Review**: September 2025