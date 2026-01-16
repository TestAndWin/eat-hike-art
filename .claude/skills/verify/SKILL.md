---
name: verify
description: Verifies implementation by running build checks, testing API endpoints, and checking UI rendering. Use this skill after completing work to ensure everything functions correctly.
---

# Implementation Verifier

## Purpose

Verify that recent changes work correctly by running build checks, testing API endpoints, and visually inspecting UI changes.

## When to Use

- After implementing a feature
- After fixing a bug
- Before committing code
- When user asks to "test" or "verify" the implementation

## Steps

### 1. Determine What Changed

Run `git diff --name-only HEAD~1` or `git status` to identify:
- Which categories of files changed (UI, API, config, etc.)
- What specific verification is needed

### 2. Build & Type Check (Always)

```bash
npm run build
```

**If errors occur:**
- Show the error clearly
- Explain the cause
- Offer to fix it
- Re-run build after fix

### 3. API Endpoint Testing (If API files changed)

For each changed API endpoint in `src/pages/api/`:

```bash
# GET request
curl -s http://localhost:4321/api/[endpoint] | head -50

# POST request (with sample data)
curl -s -X POST http://localhost:4321/api/[endpoint] \
  -H "Content-Type: application/json" \
  -d '{"key": "value"}' | head -50

# Protected endpoint (with session cookie)
curl -s http://localhost:4321/api/[endpoint] \
  -H "Cookie: session=test-session" | head -50
```

**Verify:**
- [ ] Endpoint returns expected status code
- [ ] Response format matches expected schema
- [ ] Error cases handled correctly
- [ ] Auth protection works (if applicable)

### 4. UI Verification (If UI files changed)

**Option A: Dev server check**
```bash
# Start dev server if not running
npm run dev &

# Wait for server to be ready
sleep 3

# Open in browser (macOS)
open http://localhost:4321/[page-path]
```

**Option B: Screenshot comparison (if available)**
- Take screenshot of the changed page
- Compare with expected design
- Note any visual issues

**Verify:**
- [ ] Page loads without errors
- [ ] Layout matches design expectations
- [ ] Responsive behavior works (resize browser)
- [ ] Interactive elements function correctly
- [ ] German text is used for UI labels

### 5. Summary Report

After all checks, provide a summary:

```
## Verification Results

### Build ✅/❌
- TypeScript: [pass/fail]
- Build: [pass/fail]

### API Endpoints ✅/❌
- GET /api/entries: [status]
- POST /api/entries: [status]

### UI Pages ✅/❌
- /restaurants: [status]
- /admin/entries: [status]

### Issues Found
- [List any issues that need attention]

### Recommendations
- [Any suggestions for improvement]
```

## API Endpoint Reference

Common project endpoints to test:

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| /api/entries | GET | No | List all entries |
| /api/entries | POST | Yes | Create entry |
| /api/entries/[id] | GET | No | Get single entry |
| /api/entries/[id] | PUT | Yes | Update entry |
| /api/entries/[id] | DELETE | Yes | Delete entry |
| /api/auth/login | POST | No | Login |
| /api/auth/logout | POST | Yes | Logout |
| /api/upload | POST | Yes | Upload image |

## UI Pages Reference

| Page | Path | Notes |
|------|------|-------|
| Homepage | / | Latest 3 entries |
| Restaurants | /restaurants | Category listing |
| Art | /art | Category listing |
| Tours | /tours | Category listing |
| Entry Detail | /[category]/[slug] | Dynamic route |
| Leaderboard | /[category]/leaderboard | Rankings |
| Admin Login | /admin/login | Auth page |
| Admin Dashboard | /admin | Entry management |
| Admin Entry Edit | /admin/entries/[id] | Form page |

## Quick Commands

```bash
# Full verification
npm run build && npm run dev

# Check if server is running
curl -s -o /dev/null -w "%{http_code}" http://localhost:4321/

# Kill dev server
pkill -f "astro dev" || true
```

## Checklist

- [ ] Build passes without errors
- [ ] TypeScript has no type errors
- [ ] API endpoints return expected responses
- [ ] UI pages load correctly
- [ ] No console errors in browser
- [ ] German text used for all UI labels
