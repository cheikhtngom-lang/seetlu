import type { Metadata } from 'next';
import { EnPreparation } from '@/components/ui/EnPreparation';

export const metadata: Metadata = { title: 'Nouveau produit' };

export default function PageNouveauProduit() {
  return (
    <EnPreparation
      titre="Nouveau produit"
      texte="Bientôt : collez l'adresse de votre site, Seetlu l'analyse et propose les métiers à prospecter."
    />
  );
}
