import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { redirectionAcces } from '@/lib/domain/acces';
import { configSupabase } from './config';

/** Rafraîchit la session Supabase à chaque navigation et protège les pages /app. */
export async function majSession(request: NextRequest): Promise<NextResponse> {
  let reponse = NextResponse.next({ request });
  const config = configSupabase();
  if (!config) return reponse; // développement avant la création du projet Supabase

  const supabase = createServerClient(config.url, config.cle, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(liste, entetes) {
        for (const { name, value } of liste) request.cookies.set(name, value);
        reponse = NextResponse.next({ request });
        for (const { name, value, options } of liste) reponse.cookies.set(name, value, options);
        for (const [cle, valeur] of Object.entries(entetes ?? {})) reponse.headers.set(cle, valeur);
      },
    },
  });

  const { data } = await supabase.auth.getClaims();
  const cible = redirectionAcces(request.nextUrl.pathname, Boolean(data?.claims));
  if (!cible) return reponse;

  const redirection = NextResponse.redirect(new URL(cible, request.url));
  for (const cookie of reponse.cookies.getAll()) redirection.cookies.set(cookie);
  return redirection;
}
