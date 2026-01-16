import { readFile, writeFile, unlink, mkdir } from 'fs/promises';
import path from 'path';
import * as argon2 from 'argon2';
import type { AstroCookies } from 'astro';
import type { Session } from '@/lib/types';

const DATA_DIR = import.meta.env.DATA_DIR || process.env.DATA_DIR || '/var/www/data';
const SESSIONS_DIR = path.join(DATA_DIR, 'sessions');

// Session duration: 7 days
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Ensure the sessions directory exists
 */
async function ensureSessionsDir(): Promise<void> {
  try {
    await mkdir(SESSIONS_DIR, { recursive: true });
  } catch (error) {
    // Directory already exists
  }
}

/**
 * Verify a password against the stored hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  try {
    return await argon2.verify(hash, password);
  } catch {
    return false;
  }
}

/**
 * Hash a password using Argon2id
 */
export async function hashPassword(password: string): Promise<string> {
  return argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 4,
  });
}

/**
 * Create a new session and store it
 */
export async function createSession(sessionId: string): Promise<Session> {
  await ensureSessionsDir();

  const now = new Date();
  const session: Session = {
    id: sessionId,
    createdAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + SESSION_DURATION_MS).toISOString(),
  };

  const sessionPath = path.join(SESSIONS_DIR, `${sessionId}.json`);
  await writeFile(sessionPath, JSON.stringify(session, null, 2), 'utf-8');

  return session;
}

/**
 * Validate a session by its ID
 */
export async function validateSession(sessionId: string | undefined): Promise<boolean> {
  if (!sessionId) return false;

  try {
    const sessionPath = path.join(SESSIONS_DIR, `${sessionId}.json`);
    const sessionData = await readFile(sessionPath, 'utf-8');
    const session: Session = JSON.parse(sessionData);

    // Check if session is expired
    if (new Date(session.expiresAt) < new Date()) {
      // Clean up expired session
      await unlink(sessionPath).catch(() => {});
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Delete a session (logout)
 */
export async function deleteSession(sessionId: string): Promise<void> {
  try {
    const sessionPath = path.join(SESSIONS_DIR, `${sessionId}.json`);
    await unlink(sessionPath);
  } catch {
    // Session doesn't exist, ignore
  }
}

/**
 * Check if the request has a valid session (for use in API endpoints and pages)
 */
export async function requireAuth(cookies: AstroCookies): Promise<boolean> {
  const sessionId = cookies.get('session')?.value;
  return validateSession(sessionId);
}

/**
 * Get the admin password hash from environment
 */
export function getPasswordHash(): string {
  return import.meta.env.ADMIN_PASSWORD_HASH || process.env.ADMIN_PASSWORD_HASH || '';
}
