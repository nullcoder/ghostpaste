# Cloudflare Turnstile Setup

This guide explains how to set up Cloudflare Turnstile for bot protection in GhostPaste.

## Overview

Cloudflare Turnstile is a privacy-first CAPTCHA alternative that provides bot protection without compromising user experience. GhostPaste integrates Turnstile to protect the gist creation endpoint from abuse.

## Setup Instructions

### 1. Create a Turnstile Widget

1. Log in to your [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to **Turnstile** in the sidebar
3. Click **Add Widget**
4. Configure your widget:
   - **Widget Name**: GhostPaste Production (or similar)
   - **Hostname**: Your domain (e.g., `ghostpaste.dev`)
   - **Widget Mode**: Managed (recommended)
   - **Widget Type**: Invisible (recommended for better UX)
5. Click **Create**

### 2. Configure Environment Variables

After creating the widget, you'll receive two keys:

- **Site Key**: Public key used in the frontend
- **Secret Key**: Private key used for server-side verification

#### Local Development

Create two files for local development:

**`.env`** (for build-time variables):

```bash
# Public site key (visible in browser)
NEXT_PUBLIC_TURNSTILE_SITE_KEY=1x00000000000000000000AA
```

**`.dev.vars`** (for runtime secrets):

```bash
# Secret key for server-side verification
TURNSTILE_SECRET_KEY=1x0000000000000000000000000000000AA
```

#### Production (Cloudflare Workers)

1. Update `wrangler.toml` with the public site key:

   ```toml
   [vars]
   NEXT_PUBLIC_TURNSTILE_SITE_KEY = "your_site_key_here"
   ```

2. Set the secret key as a Cloudflare secret:

   ```bash
   wrangler secret put TURNSTILE_SECRET_KEY
   # Enter your secret key when prompted
   ```

   Note: The `TURNSTILE_SECRET_KEY` is defined as an empty string in `wrangler.toml` for TypeScript type generation, but the actual value is stored securely as a Cloudflare secret.

### 3. Testing

#### Local Testing

For local development, you can use Cloudflare's test keys:

- **Site Key**: `1x00000000000000000000AA` (always passes)
- **Secret Key**: `1x0000000000000000000000000000000AA`

#### Disable Turnstile (Optional)

To disable Turnstile temporarily, simply leave the environment variables unset or empty.

## How It Works

1. **Client-Side**: When creating a gist, users complete the Turnstile challenge
2. **Token Generation**: Turnstile generates a token upon successful completion
3. **Server Verification**: The token is sent with the gist creation request and verified server-side
4. **Zero-Knowledge**: The verification happens without compromising the encrypted content

## Security Considerations

- **Never expose the secret key**: It should only be used server-side
- **Always verify tokens**: Client-side validation alone is not sufficient
- **Token expiry**: Tokens expire after 300 seconds (5 minutes)
- **One-time use**: Each token can only be verified once

## Troubleshooting

### Widget Not Appearing

- Check that `NEXT_PUBLIC_TURNSTILE_SITE_KEY` is set correctly
- Verify the hostname matches your configuration
- Check browser console for errors

### Verification Failures

- Ensure `TURNSTILE_SECRET_KEY` is set in production
- Check that tokens are being sent with requests
- Verify the secret key matches the site key's widget

### Development Issues

- Use the test keys for local development
- Ensure environment variables are loaded correctly
- Check that the Turnstile script is loading

## References

- [Cloudflare Turnstile Documentation](https://developers.cloudflare.com/turnstile/)
- [Getting Started Guide](https://developers.cloudflare.com/turnstile/get-started/)
- [Server-side Validation](https://developers.cloudflare.com/turnstile/get-started/server-side-validation/)
