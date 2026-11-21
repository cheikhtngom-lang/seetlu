import type { NextRequest } from 'next/server';
import { majSession } from '@/lib/supabase/session';

export function proxy(request: NextRequest) {
  return majSession(request);
}

export const config = {
  matcher: ['/app/:path*', '/connexion'],
};
