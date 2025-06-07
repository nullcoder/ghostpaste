# 👻 GhostPaste

> Zero-knowledge encrypted code sharing platform where your secrets stay secret

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 🔐 What is GhostPaste?

GhostPaste is a privacy-focused code sharing platform that ensures your code snippets remain completely private through client-side encryption. Unlike traditional code sharing services, our servers never have access to your plaintext content - everything is encrypted in your browser before being uploaded.

### ✨ Key Features

- **🔒 Zero-Knowledge Encryption** - Your code is encrypted locally using AES-GCM before leaving your browser
- **👤 No Account Required** - Share code instantly without signing up
- **✏️ Password-Protected Editing** - Set a password to allow editing your snippets later
- **📝 Multi-File Support** - Share multiple files in a single gist
- **🎨 Syntax Highlighting** - Beautiful code display with CodeMirror 6
- **📋 One-Click Copy** - Copy code or share links instantly
- **🌓 Dark/Light Mode** - Easy on the eyes, day or night
- **⌨️ Keyboard Shortcuts** - Power user friendly with full keyboard support
- **📱 Responsive Design** - Works perfectly on all devices
- **🚀 Global Edge Deployment** - Fast access from anywhere in the world

### 🚧 Coming Soon

- **⏱️ Self-Expiring Content** - Set snippets to auto-delete after a specified time
- **👁️ One-Time View** - Create snippets that disappear after being viewed once
- **📝 Version History** - Track changes with automatic versioning (storage ready)

## 🚀 Quick Start

### Sharing Code

1. Visit [ghostpaste.dev](https://ghostpaste.dev)
2. Paste or write your code
3. Add multiple files if needed (click "Add File")
4. Set an optional password for editing
5. Click "Create Gist" and share the generated link

### Viewing Shared Code

Simply open the shared link - the decryption key is in the URL fragment (#key=...) and never sent to our servers.

### Keyboard Shortcuts

- `Cmd/Ctrl + S` - Save gist
- `Cmd/Ctrl + Enter` - Create/update gist
- `Cmd/Ctrl + ?` - Show all shortcuts
- `Escape` - Close dialogs

## 🛡️ Security & Privacy

- **Client-Side Encryption**: All encryption/decryption happens in your browser using the Web Crypto API
- **Zero-Knowledge**: Servers only store encrypted blobs - we can't read your content even if we wanted to
- **No Tracking**: No analytics, no cookies, no user tracking
- **Open Source**: Verify our security claims by reviewing the code

## 🛠️ Technical Stack

- **Framework**: Next.js 15 with React 19
- **Runtime**: Cloudflare Workers (Edge)
- **UI Components**: shadcn/ui with Radix UI
- **Code Editor**: CodeMirror 6
- **Encryption**: Web Crypto API (AES-GCM)
- **Storage**: Cloudflare R2 with versioning
- **Styling**: Tailwind CSS with CSS variables
- **Testing**: Vitest with React Testing Library

## 📊 Limits

| Resource        | Limit  | Why?                            |
| --------------- | ------ | ------------------------------- |
| File size       | 500 KB | Covers 99% of code files        |
| Total size      | 5 MB   | Enough for ~10-20 typical files |
| Files per paste | 20     | Keeps the UI responsive         |
| Versions kept   | 50     | Balances history with storage   |

## 📁 Project Structure

```
ghostpaste/
├── app/                    # Next.js app router
│   ├── api/                # API routes
│   ├── create/             # Gist creation page
│   ├── g/[id]/             # Gist viewing page
│   └── demo/               # Component demos
├── components/             # React components
│   ├── ui/                 # Reusable UI components
│   └── *.tsx               # Feature components
├── lib/                    # Core utilities
│   ├── storage.ts          # R2 storage client
│   ├── crypto.ts           # Encryption utilities
│   ├── binary.ts           # Binary encoding
│   └── ...                 # Other utilities
├── types/                  # TypeScript types
├── docs/                   # Documentation
└── public/                 # Static assets
```

## 🔧 Development

### Prerequisites

- Node.js 20+
- npm or yarn
- Git

### Quick Start

```bash
# Clone the repository
git clone https://github.com/nullcoder/ghostpaste.git
cd ghostpaste

# Install dependencies
npm install

# Start development server
npm run dev             # Next.js development (hot reload)
# OR
npm run preview         # Full Cloudflare Workers simulation
```

See our [Local Development Guide](./docs/LOCAL_DEVELOPMENT.md) for detailed setup instructions.

### Configuration

Create a `wrangler.toml` file:

```toml
name = "ghostpaste"
compatibility_date = "2024-12-01"

[[r2_buckets]]
binding = "GHOSTPASTE_BUCKET"
bucket_name = "ghostpaste-bucket"

[vars]
NEXT_PUBLIC_APP_URL = "https://ghostpaste.dev"
```

For local development secrets, create `.dev.vars`:

```
# Any additional secrets go here
```

### Deployment

```bash
# Build for Cloudflare Workers
npm run build

# Deploy to production
npm run deploy
```

## 📈 Development Status

GhostPaste is actively being developed. Here's what's completed and what's in progress:

### ✅ Completed

- Core encryption/decryption system
- Multi-file editor with syntax highlighting
- Password-protected editing
- Responsive UI with dark/light mode
- Copy-to-clipboard functionality
- Keyboard shortcuts
- Error handling and boundaries
- R2 storage with versioning support
- 100% of UI components (Phase 4)

### 🚧 In Progress

- API endpoints (Phase 5 - Storage foundation complete)
- Self-expiring gists
- One-time view functionality
- Version history UI

### 📅 Upcoming

- Full API implementation
- Deployment to production
- Performance optimizations
- Additional features based on user feedback

## 📖 Documentation

- [Technical Specification](docs/SPEC.md) - Detailed architecture and implementation details
- [Encryption Architecture](docs/ENCRYPTION.md) - In-depth encryption documentation
- [Security Best Practices](docs/SECURITY.md) - Security guidelines for developers and users
- [AI Development Guide](CLAUDE.md) - Guidelines for AI-assisted development
- [Implementation TODO](docs/TODO.md) - Development roadmap and progress tracking
- [Contributing Guide](CONTRIBUTING.md) - How to contribute to the project
- [Local Development](docs/LOCAL_DEVELOPMENT.md) - Setting up your development environment
- [Phase Tracking](docs/PHASE_5_ISSUE_TRACKING.md) - Current development phase status

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for detailed information on how to contribute to this project.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Code editing powered by [CodeMirror](https://codemirror.net/)
- Hosted on [Cloudflare](https://www.cloudflare.com/)

## 🤖 Built with Claude Code

GhostPaste is a testament to the power of AI-assisted development. This entire project was built through a collaborative dialogue between human creativity and Claude's technical expertise. From architecture decisions to implementation details, every line of code emerged from thoughtful conversation.

### The Collaboration Story

What started as an idea for a privacy-focused code sharing platform evolved through hundreds of interactions with Claude Code. Together, we:

- **Architected** a zero-knowledge encryption system that keeps data private
- **Designed** a clean, intuitive UI using modern React patterns
- **Implemented** edge-compatible code for global performance
- **Solved** complex challenges like versioning and binary encoding
- **Refined** the user experience through iterative improvements

This project demonstrates that AI can be more than just a coding assistant - it can be a true development partner that helps bring ideas to life while maintaining high standards for security, performance, and user experience.

### Key Achievements

- **100% AI-Paired Development**: Every component built through human-AI collaboration
- **Production-Ready Code**: Comprehensive testing, error handling, and documentation
- **Security-First Design**: Encryption implementation guided by best practices
- **Modern Architecture**: Leveraging cutting-edge web technologies

---

<p align="center">
  <strong>A collaborative creation</strong><br>
  Built through the synergy of human vision and AI capability<br>
  <em>Powered by Claude Code + Human Creativity</em>
</p>

<p align="center">
  <a href="https://ghostpaste.dev">Visit GhostPaste</a> •
  <a href="https://github.com/nullcoder/ghostpaste/issues">Report Bug</a> •
  <a href="https://github.com/nullcoder/ghostpaste/issues">Request Feature</a>
</p>
