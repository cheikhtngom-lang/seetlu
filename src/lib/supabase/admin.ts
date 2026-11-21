import 'server-only';
import { createClient } from '@supabase/supabase-js';
import { SCHEMA, exigerConfigSupabase } from './config';

/**
 * Client avec la clé secrète : contourne la RLS. Réservé à la redirection publique /r/[code],
 * qui doit lire un lien suivi sans session.
 */
export function createAdminClient() {
  const { url } = exigerConfigSupabase();
  const secret = process.env.SUPABASE_SECRET_KEY;
  if (!secret) throw new Error('SUPABASE_SECRET_KEY manquante dans .env.local.');
  return createClient(url, secret, {
    db: { schema: SCHEMA },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
