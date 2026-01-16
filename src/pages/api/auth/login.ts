import type { APIRoute } from 'astro';
import { verifyPassword, createSession, getPasswordHash } from '@/lib/services/auth';

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const body = await request.json();
    const { password } = body;

    if (!password) {
      return new Response(
        JSON.stringify({ error: 'Passwort erforderlich' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const passwordHash = getPasswordHash();
    if (!passwordHash) {
      console.error('ADMIN_PASSWORD_HASH not configured');
      return new Response(
        JSON.stringify({ error: 'Server nicht konfiguriert' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const isValid = await verifyPassword(password, passwordHash);
    if (!isValid) {
      return new Response(
        JSON.stringify({ error: 'Ungültiges Passwort' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Create session
    const sessionId = crypto.randomUUID();
    await createSession(sessionId);

    // Set session cookie
    cookies.set('session', sessionId, {
      httpOnly: true,
      secure: import.meta.env.PROD,
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Login error:', error);
    return new Response(
      JSON.stringify({ error: 'Anmeldung fehlgeschlagen' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
