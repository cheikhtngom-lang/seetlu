import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Marque } from '@/components/shell/Marque';
import { Bains } from '@/components/ui/Bains';
import { FormulaireConnexion } from './FormulaireConnexion';

export const metadata: Metadata = { title: 'Connexion' };

export default function PageConnexion() {
  return (
    <div className="grid min-h-dvh md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
      <aside className="flex flex-col justify-between gap-10 bg-cuve px-6 py-8 text-cuve-encre md:px-12 md:py-12">
        <Marque />
        <div className="flex max-w-[30ch] flex-col gap-5">
          <p className="text-[clamp(28px,3.4vw,44px)] leading-[1.08] font-semibold tracking-[-0.025em] [font-stretch:90%] text-balance">
            Qui appeler aujourd&apos;hui, et pourquoi.
          </p>
          <ul className="flex flex-col gap-3 text-[14px] text-cuve-encre-2">
            <li className="flex items-center gap-3">
              <Bains niveau={3} className="[&>span]:bg-cuve-encre" />
              En premier : le commerce qui a le plus besoin de votre produit
            </li>
            <li className="flex items-center gap-3">
              <Bains niveau={2} className="[&>span:nth-child(-n+2)]:bg-cuve-encre-2" />
              Ensuite : ceux à relancer cette semaine
            </li>
            <li className="flex items-center gap-3">
              <Bains niveau={1} className="[&>span:first-child]:bg-cuve-encre-2/50" />
              Plus tard : le reste de la zone
            </li>
          </ul>
        </div>
        <p className="text-[12px] text-cuve-encre-2">Données publiques de commerces · aucun envoi automatique</p>
      </aside>

      <main className="flex items-center px-6 py-12 md:px-16">
        <div className="flex w-full max-w-[400px] flex-col gap-6">
          <div className="flex flex-col gap-1.5">
            <h1 className="text-[26px] font-semibold tracking-[-0.02em]">Connexion</h1>
            <p className="text-sm text-encre-2">Recevez un lien de connexion par mail. Pas de mot de passe à retenir.</p>
          </div>
          <Suspense fallback={<div className="h-[132px]" />}>
            <FormulaireConnexion />
          </Suspense>
        </div>
      </main>
    </div>
  );
}
