import type { ReactNode } from 'react';
import { Bains } from './Bains';

/** État vide qui guide vers la prochaine action. Le motif est une marque de bains non teinte. */
export function EtatVide({ titre, texte, action }: { titre: string; texte: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-start gap-3 py-6">
      <Bains niveau={1} reserve taille="grand" />
      <div className="flex max-w-[52ch] flex-col gap-1">
        <p className="text-base font-semibold text-encre">{titre}</p>
        <p className="text-sm text-encre-2">{texte}</p>
      </div>
      {action}
    </div>
  );
}

export function Squelette({ className = 'h-4 w-full' }: { className?: string }) {
  return <span className={`block animate-pulse rounded bg-surface-2 ${className}`} aria-hidden="true" />;
}
