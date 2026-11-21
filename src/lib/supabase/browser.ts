import { createBrowserClient as creerClient } from '@supabase/ssr';
import { exigerConfigSupabase } from './config';

/** Client Supabase dans le navigateur (session en cookies, RLS appliquée). */
export function createBrowserClient() {
  const { url, cle } = exigerConfigSupabase();
  return creerClient(url, cle);
}
