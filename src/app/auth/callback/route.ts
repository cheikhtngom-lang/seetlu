import { NextResponse, type NextRequest } from 'next/server';
import { suiteSure } from '@/lib/domain/acces';
import { createServerClient } from '@/lib/supabase/server';

/** Retour du lien magique : ouvre la session, crée l'espace au premier passage, puis entre dans l'app. */
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const suite = suiteSure(url.searchParams.get('suite'));

  if (code) {
    const supabase = await createServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      await supabase.rpc('ensure_workspace');
      return NextResponse.redirect(new URL(suite, url.origin));
    }
  }
  return NextResponse.redirect(new URL('/connexion?erreur=lien', url.origin));
}
