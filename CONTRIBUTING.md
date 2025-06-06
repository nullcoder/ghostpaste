# Contributing to GhostPaste

Thank you for your interest in contributing to GhostPaste! We welcome contributions from the community.

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- npm 10+
- Git
- A Cloudflare account (for R2 storage testing)

### Local Development Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/nullcoder/ghostpaste.git
   cd ghostpaste
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env.local
   ```

   Fill in your Cloudflare R2 credentials in `.env.local`

4. **Run development server**
   ```bash
   npm run dev
   ```

For detailed local development instructions, see [docs/LOCAL_DEVELOPMENT.md](docs/LOCAL_DEVELOPMENT.md).

## 📝 Development Workflow

### 1. Create an Issue

Before starting work:

- Check existing issues to avoid duplicates
- Create a new issue describing your proposed change
- Wait for maintainer feedback/approval

### 2. Create a Branch

```bash
git checkout main
git pull origin main
git checkout -b feat/your-feature-name
```

Branch naming conventions:

- `feat/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation changes
- `refactor/` - Code refactoring
- `test/` - Test additions/changes
- `chore/` - Maintenance tasks

### 3. Make Your Changes

- Follow the existing code style
- Add tests for new functionality
- Update documentation as needed
- Keep commits focused and atomic

### 4. Run Tests and Linting

Before committing:

```bash
npm run test        # Run unit tests
npm run lint        # Run ESLint
npm run typecheck   # Run TypeScript checks
```

### 5. Commit Your Changes

We follow conventional commits:

```bash
git commit -m "feat: add encryption key rotation"
git commit -m "fix: resolve PIN validation issue"
git commit -m "docs: update API documentation"
```

### 6. Push and Create PR

```bash
git push origin feat/your-feature-name
```

Then create a pull request on GitHub with:

- Clear description of changes
- Reference to related issue(s)
- Screenshots for UI changes
- Test results

## 🏗️ Code Guidelines

### TypeScript

- Use strict TypeScript settings
- Define interfaces for all data structures
- Avoid `any` types
- Document complex types

### React/Next.js

- Use functional components with hooks
- Follow Next.js 15 app router patterns
- Keep components small and focused
- Use shadcn/ui components when possible

### Security

- **NEVER** log encryption keys or sensitive data
- **NEVER** send keys to the server
- **ALWAYS** validate user input
- **ALWAYS** use HTTPS in production
- Follow zero-knowledge encryption principles

### Edge Runtime Compatibility

All code must be compatible with Cloudflare Workers:

- No Node.js-specific APIs
- Use Web APIs (fetch, crypto, etc.)
- Keep bundle sizes small
- Respect CPU time limits (50ms)

## 🧪 Testing

### Unit Tests

- Write tests for all utility functions
- Test error cases and edge conditions
- Use Vitest for testing
- Maintain >80% coverage for critical paths

### Integration Tests

- Test complete user flows
- Verify encryption/decryption
- Test API endpoints
- Check error handling

### Manual Testing

Before submitting PR:

- [ ] Create a new gist
- [ ] View shared gist
- [ ] Edit with PIN
- [ ] Test expiry features
- [ ] Verify mobile responsiveness

## 📚 Documentation

### Code Documentation

- Add JSDoc comments for public APIs
- Document complex algorithms
- Include usage examples
- Update README for new features

### Project Documentation

Update relevant docs:

- `README.md` - Project overview
- `docs/SPEC.md` - Technical specifications
- `docs/TODO.md` - Mark completed tasks
- `CLAUDE.md` - AI assistant guidelines

## 🎯 Pull Request Process

1. **PR Title**: Use conventional commit format
2. **Description**: Explain what and why
3. **Testing**: Describe how you tested
4. **Screenshots**: Include for UI changes
5. **Review**: Address feedback promptly

### PR Checklist

- [ ] Tests pass locally
- [ ] Linting passes
- [ ] TypeScript checks pass
- [ ] Documentation updated
- [ ] No console.logs left
- [ ] No commented code
- [ ] Follows security guidelines

## 💡 Feature Requests

We welcome feature suggestions! Please:

- Open an issue with `[Feature Request]` prefix
- Describe the use case
- Explain expected behavior
- Consider security implications

## 🐛 Bug Reports

When reporting bugs:

- Use the bug report template
- Include reproduction steps
- Provide browser/OS information
- Include error messages
- Add screenshots if applicable

## 🤝 Code of Conduct

### Be Respectful

- Treat everyone with respect
- Welcome newcomers
- Be patient with questions
- Give constructive feedback

### Be Professional

- Stay on topic
- Avoid offensive language
- Respect differing opinions
- Focus on what's best for the project

## 📬 Communication

- **Issues**: Bug reports and feature requests
- **Discussions**: General questions and ideas
- **Pull Requests**: Code contributions

## 🏆 Recognition

Contributors will be:

- Listed in the README
- Credited in release notes
- Thanked in commit messages

## ❓ Questions?

If you have questions:

1. Check existing documentation
2. Search closed issues
3. Ask in GitHub Discussions
4. Tag @nullcoder for help

---

Thank you for contributing to GhostPaste! 👻
