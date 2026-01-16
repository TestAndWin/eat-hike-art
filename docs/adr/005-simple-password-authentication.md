# ADR-005: Simple Password Authentication

**Status:** Accepted
**Date:** 2026-01-04
**Decision Makers:** Michael Schlottmann

## Context

The application needs authentication to protect the admin area:

- CRUD operations on content
- Voice-to-Publish workflow
- Image uploads
- Draft management

Key constraints:
- Only 2 users (the site owners)
- No public registration
- Self-hosted on Linux server
- Astro Server Endpoints for API

## Decision

**Use simple password authentication with session cookies.**

### Authentication Flow

```
┌─────────────────────────────────────────────────────────────┐
│  1. User visits /admin                                      │
│                         ↓                                   │
│  2. No valid session → Redirect to /admin/login             │
│                         ↓                                   │
│  3. User enters password                                    │
│                         ↓                                   │
│  4. POST /api/auth/login                                    │
│     → Verify password against stored hash                   │
│     → Create session ID                                     │
│     → Store session (file-based)                            │
│     → Set HttpOnly cookie                                   │
│                         ↓                                   │
│  5. Redirect to /admin                                      │
│                         ↓                                   │
│  6. Subsequent requests include session cookie              │
│     → Validate session on each protected request            │
└─────────────────────────────────────────────────────────────┘
```

### Implementation

**Password Storage** (environment variable):
```bash
# .env (not in Git)
ADMIN_PASSWORD_HASH="$argon2id$v=19$m=65536,t=3,p=4$..."
```

**Session Storage** (file-based, in data directory):
```
/var/www/data/
  sessions/
    abc123-def456.json    ← { "createdAt": "...", "expiresAt": "..." }
```

**Login Endpoint:**
```typescript
// src/pages/api/auth/login.ts
import { verifyPassword } from '@/lib/services/auth';

export async function POST({ request, cookies }) {
  const { password } = await request.json();

  const isValid = await verifyPassword(
    password,
    import.meta.env.ADMIN_PASSWORD_HASH
  );

  if (!isValid) {
    return new Response(
      JSON.stringify({ error: 'Invalid password' }),
      { status: 401 }
    );
  }

  const sessionId = crypto.randomUUID();
  await createSession(sessionId);

  cookies.set('session', sessionId, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 60 * 24 * 7  // 7 days
  });

  return new Response(JSON.stringify({ success: true }));
}
```

**Auth Middleware:**
```typescript
// src/lib/services/auth.ts
import { readFile, writeFile, unlink } from 'fs/promises';
import path from 'path';

const SESSIONS_DIR = path.join(process.env.DATA_DIR || '/var/www/data', 'sessions');

export async function validateSession(sessionId: string): Promise<boolean> {
  if (!sessionId) return false;

  try {
    const sessionPath = path.join(SESSIONS_DIR, `${sessionId}.json`);
    const session = JSON.parse(await readFile(sessionPath, 'utf-8'));

    if (new Date(session.expiresAt) < new Date()) {
      await unlink(sessionPath);  // Clean up expired session
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

export async function requireAuth(cookies: AstroCookies): Promise<boolean> {
  const sessionId = cookies.get('session')?.value;
  return validateSession(sessionId);
}
```

**Protected API Endpoint:**
```typescript
// src/pages/api/entries/[id].ts
import { requireAuth } from '@/lib/services/auth';

export async function PUT({ params, request, cookies }) {
  if (!await requireAuth(cookies)) {
    return new Response(null, { status: 401 });
  }

  // ... handle update
}
```

### Security Measures

| Measure | Implementation |
|---------|----------------|
| Password hashing | Argon2id (recommended) or bcrypt |
| Cookie flags | HttpOnly, Secure, SameSite=Strict |
| HTTPS | Enforced via Nginx/Caddy |
| Session expiry | 7 days, configurable |
| Rate limiting | Optional: limit login attempts |

## Alternatives

### HTTP Basic Auth (Nginx)

| Pro | Contra |
|-----|--------|
| Zero application code | Ugly browser popup |
| Handled by web server | No logout functionality |
| | Not suitable for API calls from JS |

**Rejected because:** Poor UX with browser popup. Doesn't work well with React admin components making API calls.

### Auth.js (NextAuth)

| Pro | Contra |
|-----|--------|
| Feature-rich | Massive overkill for 2 users |
| OAuth support | Additional dependency |
| Session handling built-in | Complex setup |

**Rejected because:** Designed for applications with many users and OAuth providers. Unnecessary complexity for a private admin area.

### Passkey / WebAuthn

| Pro | Contra |
|-----|--------|
| Very secure | Complex implementation |
| Modern, passwordless | Device-bound credentials |
| Phishing-resistant | Overkill for this use case |

**Rejected because:** While technically superior, the implementation effort is not justified for 2 trusted users on a private admin area.

### Magic Link (Email)

| Pro | Contra |
|-----|--------|
| No password to remember | Requires email service |
| Secure | Slower login flow |
| | External dependency |

**Rejected because:** Introduces email service dependency. Slower UX for a simple private login.

## Consequences

### Positive

- **Simple implementation**: Can be built in a few hours
- **No external dependencies**: Everything self-contained
- **Good UX**: Standard login form, proper logout
- **API-compatible**: Session cookie works for admin UI and API calls
- **Self-hosted**: No third-party auth service

### Negative

- **Single password**: Shared between both users (no individual accounts)
- **No "forgot password"**: Must manually reset via environment variable
- **Session management**: Must implement cleanup of expired sessions

### Mitigations

- Can extend to 2 separate accounts later if needed (add users.json file)
- Document password reset procedure
- Cron job to clean expired sessions:
  ```bash
  find /var/www/data/sessions -name "*.json" -mtime +7 -delete
  ```

### Future Considerations

If requirements change, the auth system can be extended:
- Add individual user accounts (username + password hash in JSON file)
- Add role-based access (editor vs. admin)
- Upgrade to Passkey for better security
