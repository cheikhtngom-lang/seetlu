import type { Metadata } from 'next';
import { EnPreparation } from '@/components/ui/EnPreparation';

export const metadata: Metadata = { title: 'Prospects' };

export default function PageProspects() {
  return (
    <EnPreparation
      titre="Prospects"
      texte="Ici, la liste des commerces récoltés, classés par score, avec leur statut et leurs relances."
    />
  );
}
