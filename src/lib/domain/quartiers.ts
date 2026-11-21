import { distanceM } from './geo';

export type Quartier = { nom: string; lat: number; lng: number; rayonM: number };

/** Centres approximatifs, modifiables à l'écran. */
export const QUARTIERS: Quartier[] = [
  { nom: 'Plateau', lat: 14.6708, lng: -17.4381, rayonM: 1500 },
  { nom: 'Médina', lat: 14.6833, lng: -17.45, rayonM: 1500 },
  { nom: 'Point E / Fann', lat: 14.693, lng: -17.463, rayonM: 1500 },
  { nom: 'Mermoz / Sacré-Cœur', lat: 14.708, lng: -17.47, rayonM: 2000 },
  { nom: 'Ouakam', lat: 14.723, lng: -17.49, rayonM: 2000 },
  { nom: 'Grand Yoff', lat: 14.736, lng: -17.455, rayonM: 2000 },
  { nom: 'Almadies', lat: 14.745, lng: -17.515, rayonM: 2000 },
  { nom: 'Yoff', lat: 14.756, lng: -17.47, rayonM: 2000 },
  { nom: 'Parcelles Assainies', lat: 14.765, lng: -17.44, rayonM: 2500 },
  { nom: 'Pikine', lat: 14.755, lng: -17.395, rayonM: 3000 },
  { nom: 'Guédiawaye', lat: 14.777, lng: -17.395, rayonM: 2500 },
  { nom: 'Rufisque', lat: 14.716, lng: -17.273, rayonM: 3000 },
  { nom: 'Thiès', lat: 14.791, lng: -16.926, rayonM: 4000 },
];

/** Nom du quartier dont le cercle contient le point (le plus proche du centre), sinon null. */
export function quartierPlusProche(lat: number, lng: number): string | null {
  let meilleur: { nom: string; d: number } | null = null;
  for (const q of QUARTIERS) {
    const d = distanceM({ lat, lng }, q);
    if (d <= q.rayonM && (!meilleur || d < meilleur.d)) meilleur = { nom: q.nom, d };
  }
  return meilleur?.nom ?? null;
}
