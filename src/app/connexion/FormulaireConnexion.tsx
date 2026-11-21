'use client';

import { MailCheck } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { suiteSure } from '@/lib/domain/acces';
import { configSupabase } from '@/lib/supabase/config';
import { createBrowserClient } from '@/lib/supabase/browser';

type Etat = { phase: 'saisie' } | { phase: 'envoi' } | { phase: 'envoye'; mail: string } | { phase: 'erreur'; message: string };

export function FormulaireConnexion() {
  const params = useSearchParams();
  const lienExpire = params.get('erreur') === 'lien';
  const [etat, setEtat] = useState<Etat>({ phase: 'saisie' });

  async function envoyer(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const mail = String(new FormData(e.currentTarget).get('mail') ?? '').trim().toLowerCase();
    if (!configSupabase()) {
      setEtat({ phase: 'erreur', message: 'Supabase n’est pas encore configuré (.env.local).' });
      return;
    }
    setEtat({ phase: 'envoi' });
    const suite = suiteSure(params.get('suite'));
    const { error } = await createBrowserClient().auth.signInWithOtp({
      email: mail,
      options: { emailRedirectTo: `${location.origin}/auth/callback?suite=${encodeURIComponent(suite)}` },
    });
    if (error) {
      const tropTot = error.status === 429 || /rate limit/i.test(error.message);
      setEtat({
        phase: 'erreur',
        message: tropTot
          ? 'Trop de demandes en peu de temps. Attendez une minute, puis réessayez.'
          : 'Le lien n’a pas pu être envoyé. Vérifiez l’adresse, puis réessayez.',
      });
      return;
    }
    setEtat({ phase: 'envoye', mail });
  }

  if (etat.phase === 'envoye') {
    return (
      <div role="status" className="flex flex-col gap-3 rounded-lg border border-filet bg-surface p-5">
        <MailCheck size={22} strokeWidth={1.75} className="text-bain-2" aria-hidden="true" />
        <p className="text-sm">
          Lien envoyé à <strong className="font-semibold">{etat.mail}</strong>. Ouvrez-le depuis ce navigateur pour entrer
          dans Seetlu.
        </p>
        <button
          type="button"
          onClick={() => setEtat({ phase: 'saisie' })}
          className="self-start text-[13px] text-encre-2 underline hover:text-encre"
        >
          Utiliser une autre adresse
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={envoyer} className="flex flex-col gap-4" noValidate={false}>
      {lienExpire ? (
        <p role="alert" className="rounded-md bg-rouge-fond px-3 py-2 text-[13px] text-rouge">
          Ce lien de connexion a expiré ou a déjà servi. Demandez-en un nouveau.
        </p>
      ) : null}
      <Input
        label="Adresse mail"
        name="mail"
        type="email"
        autoComplete="email"
        inputMode="email"
        required
        placeholder="vous@exemple.sn"
        erreur={etat.phase === 'erreur' ? etat.message : null}
      />
      <Button type="submit" disabled={etat.phase === 'envoi'}>
        {etat.phase === 'envoi' ? 'Envoi du lien…' : 'Recevoir mon lien'}
      </Button>
    </form>
  );
}
