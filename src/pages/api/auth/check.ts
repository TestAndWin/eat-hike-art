import type { APIRoute } from 'astro';
import { requireAuth } from '@/lib/services/auth';

export const GET: APIRoute = async ({ cookies }) => {
  const isAuthenticated = await requireAuth(cookies);

  return new Response(
    JSON.stringify({ authenticated: isAuthenticated }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
};
