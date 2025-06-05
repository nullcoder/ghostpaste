# 👻 GhostPaste

> Zero-knowledge encrypted code sharing platform where your secrets stay secret

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 🔐 What is GhostPaste?

GhostPaste is a privacy-focused code sharing platform that ensures your code snippets remain completely private through client-side encryption. Unlike traditional code sharing services, our servers never have access to your plaintext content - everything is encrypted in your browser before being uploaded.

### ✨ Key Features

- **🔒 Zero-Knowledge Encryption** - Your code is encrypted locally using AES-GCM before leaving your browser
- **👤 No Account Required** - Share code instantly without signing up
- **✏️ PIN-Protected Editing** - Set a PIN to allow editing your snippets later
- **⏱️ Self-Expiring Content** - Set snippets to auto-delete after a specified time
- **👁️ One-Time View** - Create snippets that disappear after being viewed once
- **📝 Version History** - Track changes with automatic versioning
- **🎨 Syntax Highlighting** - Beautiful code display with CodeMirror 6
- **🌓 Dark/Light Mode** - Easy on the eyes, day or night

## 🚀 Quick Start

### Sharing Code

1. Visit [ghostpaste.dev](https://ghostpaste.dev)
2. Paste or write your code
3. Add multiple files if needed
4. Set optional expiration or PIN
5. Click "Create" and share the generated link

### Viewing Shared Code

Simply open the shared link - the decryption key is in the URL fragment and never sent to our servers.

## 🛡️ Security & Privacy

- **Client-Side Encryption**: All encryption/decryption happens in your browser using the Web Crypto API
- **Zero-Knowledge**: Servers only store encrypted blobs - we can't read your content even if we wanted to
- **No Tracking**: No analytics, no cookies, no user tracking
- **Open Source**: Verify our security claims by reviewing the code

## 🛠️ Technical Stack

- **Frontend**: Next.js 15 with React
- **UI Components**: shadcn/ui
- **Code Editor**: CodeMirror 6
- **Encryption**: Web Crypto API (AES-GCM)
- **Storage**: Cloudflare R2
- **Deployment**: Cloudflare Workers

## 📊 Limits

| Resource | Limit | Why? |
|----------|-------|------|
| File size | 500 KB | Covers 99% of code files |
| Total size | 5 MB | Enough for ~10-20 typical files |
| Files per paste | 20 | Keeps the UI responsive |
| Versions kept | 50 | Balances history with storage |

## 🔧 Development

### Prerequisites

- Node.js 18+
- npm or yarn
- Cloudflare account (for R2 storage)

### Setup

```bash
# Clone the repository
git clone https://github.com/nullcoder/ghostpaste.git
cd ghostpaste

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Configure your Cloudflare R2 credentials in .env.local

# Run development server
npm run dev
```

### Environment Variables

```env
CLOUDFLARE_ACCOUNT_ID=your_account_id
CLOUDFLARE_R2_ACCESS_KEY_ID=your_access_key
CLOUDFLARE_R2_SECRET_ACCESS_KEY=your_secret_key
CLOUDFLARE_R2_BUCKET_NAME=ghostpaste-bucket
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 📖 Documentation

- [Technical Specification](docs/SPEC.md) - Detailed architecture and implementation details
- [AI Development Guide](CLAUDE.md) - Guidelines for AI-assisted development

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) (coming soon).

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

---

<p align="center">
  Made with ❤️ by <a href="https://github.com/nullcoder">Thanan Traiongthawon</a>
</p>

<p align="center">
  <a href="https://ghostpaste.dev">Visit GhostPaste</a> •
  <a href="https://github.com/nullcoder/ghostpaste/issues">Report Bug</a> •
  <a href="https://github.com/nullcoder/ghostpaste/issues">Request Feature</a>
</p>