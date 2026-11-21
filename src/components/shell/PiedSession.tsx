import { LogOut } from 'lucide-react';
import { deconnexion } from '@/app/app/actions';
import { configSupabase } from '@/lib/supabase/config';
import { createServerClient } from '@/lib/supabase/server';

/** Bas du rail : qui est connecté, et la déconnexion. Lu à chaque requête (dans un Suspense). */
export async function PiedSession() {
  if (!configSupabase()) return <span>Supabase non configuré</span>;

  const supabase = await createServerClient();
  const { data } = await supabase.auth.getClaims();
  const mail = typeof data?.claims?.email === 'string' ? data.claims.email : null;

  return (
    <div className="flex items-center justify-between gap-2">
      <span className="truncate" title={mail ?? undefined}>
        {mail ?? 'Non connecté'}
      </span>
      <form action={deconnexion}>
        <button
          type="submit"
          aria-label="Se déconnecter"
          title="Se déconnecter"
          className="grid size-8 place-items-center rounded-md text-cuve-encre-2 transition-colors hover:bg-cuve-2 hover:text-cuve-encre focus-visible:outline-ocre-vif"
        >
          <LogOut size={16} strokeWidth={1.75} aria-hidden="true" />
        </button>
      </form>
    </div>
  );
}
