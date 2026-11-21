import Link from 'next/link';
import { Suspense } from 'react';
import { Plus } from 'lucide-react';
import { classesBouton } from '@/components/ui/Button';
import { DateDuJour } from '@/components/ui/DateDuJour';
import { EtatVide } from '@/components/ui/EtatVide';
import { Panel } from '@/components/ui/Panel';

export default function TableauDeBord() {
  return (
    <div className="mx-auto flex max-w-[1240px] flex-col gap-5">
      <header className="flex flex-wrap items-baseline gap-x-4 gap-y-1 border-b border-filet pb-4">
        <h1 className="text-[28px] leading-tight font-semibold tracking-[-0.02em]">Tableau de bord</h1>
        <Suspense fallback={<span className="h-5 w-40" />}>
          <DateDuJour className="text-sm text-encre-2" />
        </Suspense>
      </header>

      <Panel>
        <EtatVide
          titre="Ajoutez votre premier produit"
          texte="Collez le lien d'un de vos sites : Seetlu en déduit les commerces à qui le proposer, puis vous les classe sur la carte."
          action={
            <Link href="/app/produits/nouveau" className={classesBouton('primaire')}>
              <Plus size={16} strokeWidth={2} aria-hidden="true" />
              Ajouter un produit
            </Link>
          }
        />
      </Panel>
    </div>
  );
}
