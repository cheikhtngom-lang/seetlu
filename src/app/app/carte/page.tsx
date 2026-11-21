import type { Metadata } from 'next';
import { EnPreparation } from '@/components/ui/EnPreparation';

export const metadata: Metadata = { title: 'Carte' };

export default function PageCarte() {
  return (
    <EnPreparation
      titre="Carte"
      texte="Ici, vous tracerez une zone de Dakar et récolterez les commerces qui correspondent à votre produit."
    />
  );
}
