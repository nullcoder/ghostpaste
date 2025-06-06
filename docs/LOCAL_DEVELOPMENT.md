# 🚀 Local Development Setup

This guide explains how to set up and run GhostPaste locally for development.

## Prerequisites

- Node.js 20.x or later
- npm or yarn
- Git

## Initial Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/nullcoder/ghostpaste.git
   cd ghostpaste
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up local environment variables**
   Create a `.dev.vars` file in the root directory:
   ```bash
   # Local development secrets
   # Add any local development secrets here
   # Example:
   # API_SECRET=your-secret-here
   ```

## Development Workflows

### Standard Next.js Development

For regular Next.js development without Cloudflare Workers features:

```bash
npm run dev
```

This starts the Next.js development server at `http://localhost:3000` with hot module replacement.

### Cloudflare Workers Development

For development with full Cloudflare Workers features (R2, KV, etc.):

```bash
npm run preview
```

This command:

1. Builds the app with `@opennextjs/cloudflare`
2. Starts wrangler dev with local Miniflare v3 simulation
3. Persists local state to `.wrangler/state` directory

#### Local vs Remote Development

- **Local development (default)**: Uses Miniflare v3 to simulate Cloudflare services locally

  ```bash
  npm run preview         # Local simulation (no billing)
  ```

- **Remote development**: Connects to actual Cloudflare services
  ```bash
  npm run preview:remote  # Uses real Cloudflare resources (may incur charges)
  ```

## Available Scripts

| Script                   | Description                                       |
| ------------------------ | ------------------------------------------------- |
| `npm run dev`            | Start Next.js development server                  |
| `npm run build`          | Build Next.js for production                      |
| `npm run preview`        | Build and run with local Cloudflare simulation    |
| `npm run preview:remote` | Build and run with remote Cloudflare resources    |
| `npm run cf:dev`         | Run wrangler dev without rebuilding               |
| `npm run deploy`         | Deploy to production                              |
| `npm run deploy:staging` | Deploy to staging environment                     |
| `npm run test`           | Run tests                                         |
| `npm run lint`           | Run ESLint                                        |
| `npm run typecheck`      | Run TypeScript type checking                      |
| `npm run cf:typegen`     | Generate TypeScript types for Cloudflare bindings |
| `npm run cf:tail`        | Tail production logs                              |

## Local Services Simulation

When using `npm run preview`, the following services are simulated locally:

### R2 Storage

- Local R2 bucket simulation for file storage
- Data persisted in `.wrangler/state/r2`
- No AWS S3 API calls or charges

### KV Storage (when enabled)

- Local KV namespace simulation
- Data persisted in `.wrangler/state/kv`
- No Cloudflare KV API calls or charges

### Environment Variables

- Development environment uses `env.development` from `wrangler.toml`
- Secrets loaded from `.dev.vars` file
- `ENVIRONMENT=development` and `NEXT_PUBLIC_APP_URL=http://localhost:3000`

## Debugging

### View Logs

During local development, all console logs are visible in the terminal.

### Inspect Local State

Check the `.wrangler/state` directory to inspect:

- R2 bucket contents
- KV namespace data
- Cache contents

### TypeScript Types

Generate types for Cloudflare bindings:

```bash
npm run cf:typegen
```

This updates `worker-configuration.d.ts` with the latest binding types.

## Troubleshooting

### Port Already in Use

If port 8787 is already in use:

```bash
# Find the process using the port
lsof -i :8787

# Kill the process
kill -9 <PID>
```

### Build Errors

If you encounter build errors:

1. Delete `.next` and `.open-next` directories
2. Run `npm run cf:build` again

### R2 Bucket Not Found

Ensure the R2 binding is correctly configured in `wrangler.toml`:

```toml
[[r2_buckets]]
binding = "GHOSTPASTE_BUCKET"
bucket_name = "ghostpaste-bucket"
```

### Hot Reload Not Working

The Cloudflare Workers preview doesn't support hot reload. You need to:

1. Make your changes
2. Stop the dev server (Ctrl+C)
3. Run `npm run preview` again

For faster development of UI components, use `npm run dev` for Next.js hot reload, then test with `npm run preview` when you need Workers features.

## Performance Tips

1. **Use local development** (`npm run preview`) for most development to avoid API charges
2. **Persist state** with `--persist-to` flag to maintain data between restarts
3. **Clear state** by deleting `.wrangler/state` when you need a fresh start
4. **Use remote development** (`npm run preview:remote`) only when testing with production-like data

## Next Steps

- Check out the [Architecture Guide](./SPEC.md) to understand the system design
- Review [Security Guidelines](./SPEC.md#security-considerations) for encryption implementation
- See [Contributing Guide](../README.md#contributing) for code standards
