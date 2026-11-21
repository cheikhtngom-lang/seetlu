import Link from 'next/link';
import { classesBouton } from './Button';
import { EtatVide } from './EtatVide';
import { Panel } from './Panel';

/** Écran provisoire d'une section pas encore construite (remplacé tâche par tâche). */
export function EnPreparation({ titre, texte }: { titre: string; texte: string }) {
  return (
    <div className="mx-auto flex max-w-[1240px] flex-col gap-5">
      <header className="border-b border-filet pb-4">
        <h1 className="text-[28px] leading-tight font-semibold tracking-[-0.02em]">{titre}</h1>
      </header>
      <Panel>
        <EtatVide
          titre="En préparation"
          texte={texte}
          action={
            <Link href="/app" className={classesBouton('clair')}>
              Retour au tableau de bord
            </Link>
          }
        />
      </Panel>
    </div>
  );
}
