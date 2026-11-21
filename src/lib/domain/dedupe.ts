import { distanceM } from './geo';
import type { PlaceCandidate } from './overpass';
import { normaliserTelephone } from './phone';

export type PlaceExistante = { id: string; nom: string; lat: number; lng: number; telephone: string | null };

export type PlanImport = {
  aCreer: PlaceCandidate[];
  aFusionner: Array<{ placeId: string; candidat: PlaceCandidate }>;
  dejaConnus: number;
};

const DISTANCE_MAX_M = 50;
const SIMILARITE_MIN = 0.8;

function normaliserNom(nom: string): string {
  return nom
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

function bigrammes(s: string): Map<string, number> {
  const m = new Map<string, number>();
  for (let i = 0; i < s.length - 1; i++) {
    const b = s.slice(i, i + 2);
    m.set(b, (m.get(b) ?? 0) + 1);
  }
  return m;
}

/** Coefficient de Dice sur les bigrammes des noms normalisés (0 à 1). */
export function similariteNom(a: string, b: string): number {
  const na = normaliserNom(a);
  const nb = normaliserNom(b);
  if (na === nb) return 1;
  if (na.length < 2 || nb.length < 2) return 0;
  const ba = bigrammes(na);
  const bb = bigrammes(nb);
  let communs = 0;
  for (const [k, n] of ba) communs += Math.min(n, bb.get(k) ?? 0);
  return (2 * communs) / (na.length - 1 + (nb.length - 1));
}

/** Même téléphone normalisé, ou nom similaire (≥ 0,8) à 50 m au plus. */
export function trouverDoublon(
  c: { nom: string; lat: number; lng: number; telephone: string | null },
  existantes: PlaceExistante[],
): PlaceExistante | null {
  if (c.telephone) {
    const parTel = existantes.find((e) => e.telephone === c.telephone);
    if (parTel) return parTel;
  }
  return (
    existantes.find((e) => distanceM(c, e) <= DISTANCE_MAX_M && similariteNom(c.nom, e.nom) >= SIMILARITE_MIN) ?? null
  );
}

/**
 * Répartit un lot de candidats : déjà connus par leur source, à fusionner avec une place
 * existante, ou à créer. Les doublons à l'intérieur du lot ne sont créés qu'une fois.
 */
export function planifierImport(
  candidats: PlaceCandidate[],
  existantes: PlaceExistante[],
  sourcesConnues: Set<string>,
): PlanImport {
  const plan: PlanImport = { aCreer: [], aFusionner: [], dejaConnus: 0 };
  const nouvelles: PlaceExistante[] = [];

  for (const c of candidats) {
    if (sourcesConnues.has(`${c.source}:${c.sourceId}`)) {
      plan.dejaConnus++;
      continue;
    }
    const cible = { nom: c.nom, lat: c.lat, lng: c.lng, telephone: normaliserTelephone(c.telephoneBrut)?.e164 ?? null };

    const existante = trouverDoublon(cible, existantes);
    if (existante) {
      plan.aFusionner.push({ placeId: existante.id, candidat: c });
      continue;
    }
    if (trouverDoublon(cible, nouvelles)) continue;

    nouvelles.push({ id: `nouveau:${nouvelles.length}`, ...cible });
    plan.aCreer.push(c);
  }
  return plan;
}
