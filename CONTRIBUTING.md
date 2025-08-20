# Contributing to AiArtBrush

First off, thank you for considering contributing to AiArtBrush! It's people like you that make AiArtBrush such a great collaborative platform for AI-powered art creation.

## Code of Conduct

This project and everyone participating in it is governed by our commitment to fostering an open and welcoming environment. By participating, you are expected to uphold high standards of respect and collaboration.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the issue list as you might find that you don't need to create one. When you are creating a bug report, please include as many details as possible.

**Before Submitting A Bug Report:**
- Check the [documentation](./documentation/) for troubleshooting guides
- Perform a search to see if the problem has already been reported
- Check if you can reproduce the problem in the latest version

**How to Submit A Good Bug Report:**

Bugs are tracked as [GitHub issues](https://github.com/your-org/AiArtBrush/issues). Create an issue and provide the following information:

- **Use a clear and descriptive title**
- **Describe the exact steps to reproduce the problem**
- **Provide specific examples to demonstrate the steps**
- **Describe the behavior you observed after following the steps**
- **Explain which behavior you expected to see instead and why**
- **Include screenshots and animated GIFs if helpful**
- **Include your environment details**: OS, Node.js version, browser version

### Suggesting Enhancements

Enhancement suggestions are tracked as [GitHub issues](https://github.com/your-org/AiArtBrush/issues). When creating an enhancement suggestion, please include:

- **Use a clear and descriptive title**
- **Provide a step-by-step description of the suggested enhancement**
- **Provide specific examples to demonstrate the steps**
- **Describe the current behavior and explain the behavior you expected to see**
- **Explain why this enhancement would be useful**
- **List some other applications where this enhancement exists**

### Pull Requests

The process described here has several goals:
- Maintain AiArtBrush's quality
- Fix problems that are important to users
- Engage the community in working toward the best possible AiArtBrush
- Enable a sustainable system for maintainers to review contributions

**Before Submitting a Pull Request:**
1. Read the [Development Setup Guide](./documentation/06-development-setup.md)
2. Follow the [coding standards](#coding-standards) outlined below
3. Include tests when adding new functionality
4. Update documentation for any changed functionality

## Development Process

### 1. Fork and Clone

```bash
# Fork the repository on GitHub, then:
git clone https://github.com/your-username/AiArtBrush.git
cd AiArtBrush
git remote add upstream https://github.com/your-org/AiArtBrush.git
```

### 2. Set Up Development Environment

Follow the complete setup guide in [Development Setup](./documentation/06-development-setup.md):

```bash
# Install dependencies
npm install

# Set up environment variables
cp backend/.env.example backend/.env
cp frontend/.env.local.example frontend/.env.local

# Start development servers
npm run dev
```

### 3. Create a Branch

```bash
# Create a new branch for your feature/fix
git checkout -b feature/your-feature-name
# or
git checkout -b fix/issue-description
```

### 4. Make Changes

- Write your code following our [coding standards](#coding-standards)
- Add or update tests as needed
- Update documentation if you're changing functionality
- Make sure your changes don't break existing functionality

### 5. Test Your Changes

```bash
# Run all tests
npm run test

# Check code quality
npm run lint
npm run type-check

# Test the application manually
npm run dev
```

### 6. Commit Your Changes

We follow [Conventional Commits](https://www.conventionalcommits.org/) specification:

```bash
# Format: type(scope): description
git commit -m "feat(backend): add image compression service"
git commit -m "fix(frontend): resolve socket connection timeout"
git commit -m "docs(api): update websocket event documentation"
```

**Commit Types:**
- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that do not affect the meaning of the code
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `perf`: A code change that improves performance
- `test`: Adding missing tests or correcting existing tests
- `chore`: Changes to the build process or auxiliary tools

### 7. Push and Create Pull Request

```bash
# Push your branch to your fork
git push origin feature/your-feature-name

# Create a Pull Request through GitHub's interface
```

## Coding Standards

### TypeScript

- **Strict TypeScript**: Enable strict mode, avoid `any` types
- **Type Safety**: Provide explicit types for function parameters and return values
- **Interfaces**: Use interfaces for object shapes, types for unions/primitives

```typescript
// Good
interface Player {
  id: string
  nickname: string
  score: number
}

function createPlayer(nickname: string): Player {
  return {
    id: nanoid(),
    nickname,
    score: 0
  }
}

// Avoid
function createPlayer(nickname: any): any {
  return {
    id: nanoid(),
    nickname,
    score: 0
  }
}
```

### React Components

- **Functional Components**: Use function components with hooks
- **TypeScript Props**: Define prop types with interfaces
- **Component Organization**: Keep components focused and single-purpose

```typescript
interface GameRoomProps {
  room: Room
  currentPlayer: Player
  onStartGame: () => void
}

export function GameRoom({ room, currentPlayer, onStartGame }: GameRoomProps) {
  // Component implementation
}
```

### Backend Services

- **Service Pattern**: Organize business logic into services
- **Error Handling**: Proper error handling with typed errors
- **Async/Await**: Use async/await instead of Promise chains

```typescript
class GameService {
  async createGame(room: Room): Promise<Game> {
    try {
      const game: Game = {
        id: nanoid(),
        roomId: room.id,
        // ... other properties
      }
      
      await this.gameRepository.save(game)
      return game
    } catch (error) {
      console.error('Failed to create game:', error)
      throw new GameCreationError('Could not create game')
    }
  }
}
```

### Code Style

- **ESLint**: Follow the project's ESLint configuration
- **Prettier**: Code formatting is handled automatically
- **Naming**: Use descriptive names for variables, functions, and components

```typescript
// Good
const isPlayerTurn = currentPlayer.id === activePlayer.id
const handlePromptSubmission = (prompt: string) => { /* ... */ }

// Avoid
const flag = currentPlayer.id === activePlayer.id
const handle = (p: string) => { /* ... */ }
```

### Documentation

- **JSDoc Comments**: Document complex functions and public APIs
- **README Updates**: Update README for new features
- **Type Documentation**: Document complex types and interfaces

```typescript
/**
 * Generates an AI-enhanced image based on user prompt and style selection
 * @param prompt - User's creative prompt
 * @param previousImage - URL of the previous image in the sequence
 * @param styleSelection - Selected art style configuration
 * @returns Promise resolving to the generated image URL
 */
async function generateImage(
  prompt: string,
  previousImage?: string,
  styleSelection?: StyleSelection
): Promise<string> {
  // Implementation
}
```

## Testing Guidelines

### Unit Tests

- **Test Coverage**: Aim for high test coverage on business logic
- **Test Structure**: Use descriptive test names and organize with `describe` blocks
- **Mocking**: Mock external dependencies appropriately

```typescript
describe('GameService', () => {
  describe('createGame', () => {
    it('should create a game with correct initial state', async () => {
      const room = mockRoom()
      const game = await gameService.createGame(room)
      
      expect(game.roomId).toBe(room.id)
      expect(game.status).toBe('waiting')
      expect(game.rounds).toHaveLength(0)
    })
  })
})
```

### Integration Tests

- **Real Scenarios**: Test complete user workflows
- **Error Handling**: Test error conditions and edge cases
- **Performance**: Include performance tests for critical paths

### E2E Tests

- **User Journeys**: Test complete user workflows from UI
- **Cross-browser**: Test on multiple browsers when possible
- **Mobile**: Include mobile testing for responsive features

## Review Process

### Pull Request Guidelines

1. **Small, Focused Changes**: Keep PRs focused on a single feature or fix
2. **Clear Description**: Explain what your PR does and why
3. **Link Issues**: Reference any related issues
4. **Screenshots**: Include screenshots for UI changes
5. **Breaking Changes**: Clearly document any breaking changes

### Review Criteria

Reviewers will check for:
- **Code Quality**: Adherence to coding standards
- **Functionality**: Does the code work as intended?
- **Tests**: Are there adequate tests for the changes?
- **Documentation**: Is documentation updated appropriately?
- **Performance**: Are there any performance implications?
- **Security**: Are there any security concerns?

## Getting Help

### Resources

- **Documentation**: Check the [documentation directory](./documentation/)
- **API Reference**: See [API Documentation](./documentation/05-api-documentation.md)
- **Setup Issues**: Refer to [Development Setup](./documentation/06-development-setup.md)

### Communication

- **GitHub Issues**: For bugs and feature requests
- **GitHub Discussions**: For questions and general discussion
- **Pull Request Comments**: For code-specific discussions

### Development Questions

If you're unsure about:
- **Architecture decisions**: Check [System Architecture](./documentation/02-system-architecture.md)
- **Data flow**: See [Data Flow](./documentation/03-data-flow.md)
- **Integration**: Refer to [Integration Guide](./documentation/04-integration-guide.md)

## Recognition

Contributors who make significant contributions will be:
- Added to the README contributors section
- Mentioned in release notes
- Invited to join the core contributor team

## Project Roadmap

Check our [project roadmap](./README.md#roadmap) to see planned features and how you can contribute to upcoming developments.

---

Thank you for contributing to AiArtBrush! Your efforts help make collaborative AI art creation accessible and enjoyable for everyone.