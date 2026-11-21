import type { Metadata } from 'next';
import { EnPreparation } from '@/components/ui/EnPreparation';

export const metadata: Metadata = { title: 'Produits' };

export default function PageProduits() {
  return (
    <EnPreparation
      titre="Produits"
      texte="Ici, vous collerez le lien de vos sites (Lavage Auto, GestionImmo…) pour que Seetlu en déduise les commerces à cibler."
    />
  );
}
