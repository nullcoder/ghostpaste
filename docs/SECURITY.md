# 🔒 Security Best Practices

This guide outlines security best practices for developing and using GhostPaste.

## For Developers

### 1. Key Management

#### ✅ DO

```typescript
// Keep keys in memory only
const key = await generateEncryptionKey();

// Share keys via URL fragments
const url = `https://ghostpaste.dev/g/${id}#key=${key}`;

// Use crypto.getRandomValues for all randomness
const iv = crypto.getRandomValues(new Uint8Array(12));
```

#### ❌ DON'T

```typescript
// Never log keys
console.log("Key:", key); // NEVER DO THIS

// Never send keys to server
await fetch("/api/log", { body: JSON.stringify({ key }) }); // NEVER

// Never use Math.random for crypto
const badIv = Array.from({ length: 12 }, () => Math.floor(Math.random() * 256)); // INSECURE
```

### 2. Error Handling

#### ✅ DO

```typescript
try {
  await decrypt(data, key);
} catch (error) {
  // Generic error message
  throw new Error("Decryption failed");
}
```

#### ❌ DON'T

```typescript
try {
  await decrypt(data, key);
} catch (error) {
  // Don't leak sensitive info
  throw new Error(`Failed with key ${key}: ${error.message}`); // LEAKS KEY
}
```

### 3. Input Validation

#### ✅ DO

```typescript
// Validate file sizes
if (file.content.length > MAX_FILE_SIZE) {
  throw new FileTooLargeError("File exceeds size limit");
}

// Validate file counts
if (files.length > MAX_FILES) {
  throw new TooManyFilesError("Too many files");
}

// Sanitize filenames
const safeName = filename.replace(/[^\w.-]/g, "_");
```

### 4. Secure Defaults

#### ✅ DO

```typescript
// Use secure defaults
const DEFAULT_PBKDF2_ITERATIONS = 100_000;
const DEFAULT_KEY_LENGTH = 256;
const DEFAULT_IV_LENGTH = 12;

// Enforce HTTPS in production
if (window.location.protocol !== "https:" && !isDevelopment) {
  window.location.protocol = "https:";
}
```

### 5. Side-Channel Protection

#### ✅ DO

```typescript
// Constant-time comparison
function constantTimeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a[i] ^ b[i];
  }
  return diff === 0;
}
```

## For Users

### 1. URL Sharing

#### 🔒 Secure Channels

- **Encrypted messaging**: Signal, WhatsApp, Telegram (secret chats)
- **Encrypted email**: ProtonMail, Tutanota
- **In-person**: QR codes, written notes
- **Password managers**: Store URLs in secure vaults

#### ⚠️ Avoid

- **Plain email**: Can be intercepted
- **SMS**: Not encrypted, stored by carriers
- **Public forums**: Anyone can access
- **Cloud storage**: Unless encrypted

### 2. PIN Selection

#### 💪 Strong PINs

- Mix letters and numbers: `Blue42Sky`, `Cat2024Moon`
- Use phrases: `MyDog$Spot123`, `Coffee@9AM`
- Avoid patterns: Not `1234abcd` or `Pass1234`
- Unique per gist: Don't reuse PINs

#### 🚫 Weak PINs

- Sequential: `1234`, `abcd`
- Repeated: `1111`, `aaaa`
- Common words: `password`, `admin`
- Personal info: Birthdays, names

### 3. Operational Security

#### Before Sharing

- ✅ Verify the recipient
- ✅ Check the URL is complete (includes `#key=...`)
- ✅ Consider expiration time
- ✅ Use PIN for sensitive content

#### After Sharing

- ✅ Confirm receipt with recipient
- ✅ Delete sensitive URLs from chat history
- ✅ Use one-time view for extra security
- ✅ Monitor access if concerned

### 4. Browser Security

#### Keep Secure

- 🔄 Update browser regularly
- 🛡️ Use reputable browsers (Chrome, Firefox, Safari, Edge)
- 🔒 Check for HTTPS padlock
- 🚫 Avoid browser extensions on sensitive pages

#### Privacy Mode

- 🕵️ Use incognito/private mode for sensitive gists
- 🧹 Clear browser data after viewing sensitive content
- 📵 Disable browser sync for GhostPaste

## Incident Response

### If a URL is Compromised

1. **Immediate Actions**

   - URLs with expiration: Wait for expiry
   - URLs without expiration: Cannot be revoked
   - Change any exposed sensitive data

2. **Prevention**
   - Use one-time view for sensitive data
   - Set short expiration times
   - Use PIN protection
   - Share URLs more carefully next time

### If You Suspect Tampering

1. **Signs of Tampering**

   - Decryption fails unexpectedly
   - Content doesn't match expectations
   - Unexpected error messages

2. **Response**
   - Don't enter PINs on suspicious pages
   - Verify URL domain is correct
   - Request sender to reshare
   - Report suspicious activity

## Security Checklist

### For Each Release

- [ ] Run security tests
- [ ] Check for dependency vulnerabilities (`npm audit`)
- [ ] Review error messages for information leaks
- [ ] Verify CSP headers are strict
- [ ] Test with various browsers
- [ ] Check for console.log statements with sensitive data

### For Deployment

- [ ] HTTPS enforced
- [ ] Security headers configured
- [ ] Rate limiting enabled
- [ ] Error logging doesn't include sensitive data
- [ ] Environment variables secured
- [ ] No debug mode in production

## Reporting Security Issues

If you discover a security vulnerability:

1. **DO NOT** create a public issue
2. Email: security@ghostpaste.dev
3. Include:
   - Description of vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

We aim to respond within 48 hours and fix critical issues within 7 days.

## Security Resources

- [OWASP Cryptographic Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cryptographic_Storage_Cheat_Sheet.html)
- [MDN Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API)
- [NIST Cryptographic Standards](https://csrc.nist.gov/publications/sp)

---

_Last updated: 2024-06-06_
