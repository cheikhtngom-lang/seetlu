/**
 * Toutes les tables de Seetlu vivent dans le schéma « seetlu » : l'app peut partager un projet
 * Supabase avec une autre sans mélanger les tables.
 */
export const SCHEMA = 'seetlu' as const;

/** Adresse et clé publique du projet Supabase, ou null tant que .env.local n'est pas rempli. */
export function configSupabase(): { url: string; cle: string } | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const cle = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  return url && cle ? { url, cle } : null;
}

export function exigerConfigSupabase(): { url: string; cle: string } {
  const config = configSupabase();
  if (!config) {
    throw new Error('Supabase non configuré : remplir NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY dans .env.local.');
  }
  return config;
}
