import 'server-only';
import { createServerClient as creerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { exigerConfigSupabase } from './config';

/** Client Supabase côté serveur, lié aux cookies de la requête (RLS appliquée). */
export async function createServerClient() {
  const { url, cle } = exigerConfigSupabase();
  const pot = await cookies();
  return creerClient(url, cle, {
    cookies: {
      getAll: () => pot.getAll(),
      setAll(liste) {
        try {
          for (const { name, value, options } of liste) pot.set(name, value, options);
        } catch {
          // Appelé depuis un Server Component : proxy.ts rafraîchit déjà la session.
        }
      },
    },
  });
}
