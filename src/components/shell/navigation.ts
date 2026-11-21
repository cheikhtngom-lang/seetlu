import { LayoutGrid, Map, Package, Store, type LucideIcon } from 'lucide-react';

export type CleNav = 'accueil' | 'carte' | 'prospects' | 'produits';

export const NAVIGATION: Array<{ cle: CleNav; href: string; libelle: string; court: string; icone: LucideIcon }> = [
  { cle: 'accueil', href: '/app', libelle: 'Tableau de bord', court: 'Accueil', icone: LayoutGrid },
  { cle: 'carte', href: '/app/carte', libelle: 'Carte', court: 'Carte', icone: Map },
  { cle: 'prospects', href: '/app/prospects', libelle: 'Prospects', court: 'Prospects', icone: Store },
  { cle: 'produits', href: '/app/produits', libelle: 'Produits', court: 'Produits', icone: Package },
];

export function estActif(href: string, chemin: string): boolean {
  return href === '/app' ? chemin === '/app' : chemin === href || chemin.startsWith(`${href}/`);
}
