import type { APIRoute } from 'astro';
import { deleteSession } from '@/lib/services/auth';

export const POST: APIRoute = async ({ cookies }) => {
  const sessionId = cookies.get('session')?.value;

  if (sessionId) {
    await deleteSession(sessionId);
  }

  // Clear the session cookie
  cookies.delete('session', { path: '/' });

  return new Response(
    JSON.stringify({ success: true }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
};
