import type { Priorite, ProspectStatut } from './score';

export const LIBELLES_STATUT: Record<ProspectStatut, string> = {
  a_contacter: 'À contacter',
  contacte: 'Contacté',
  a_repondu: 'A répondu',
  demo: 'Démo',
  client: 'Client',
  perdu: 'Perdu',
  ne_plus_contacter: 'Ne plus contacter',
};

export const LIBELLES_PRIORITE: Record<Priorite, string> = {
  premier: 'En premier',
  ensuite: 'Ensuite',
  plus_tard: 'Plus tard',
};

export type NiveauBain = 1 | 2 | 3;

/** Nombre de bains d'indigo : plus la priorité est haute, plus la marque est profonde. */
export function niveauBain(p: Priorite): NiveauBain {
  return p === 'premier' ? 3 : p === 'ensuite' ? 2 : 1;
}
