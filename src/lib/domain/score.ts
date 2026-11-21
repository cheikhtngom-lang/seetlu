import type { SiteChecks } from './html-audit';
import type { TelephoneNormalise } from './phone';

/** Barème par défaut : il s'affiche sur la fiche et reste réglable. */
export const POIDS = { adequation: 30, manques: 25, joignabilite: 25, proximite: 20 } as const;
type Poids = { [K in keyof typeof POIDS]: number };

export const STATUTS = ['a_contacter', 'contacte', 'a_repondu', 'demo', 'client', 'perdu', 'ne_plus_contacter'] as const;
/** Identique à l'enum SQL prospect_statut. */
export type ProspectStatut = (typeof STATUTS)[number];

export type Priorite = 'premier' | 'ensuite' | 'plus_tard';

export type ScoreInput = {
  adequation: 'principal' | 'secondaire';
  telephone: TelephoneNormalise | null;
  site: string | null;
  checks: SiteChecks | null;
  pagespeed: number | null;
  aReseaux: boolean;
  distanceM: number;
  rayonM: number;
};

export type ScorePart = {
  cle: 'adequation' | 'manques' | 'joignabilite' | 'proximite';
  label: string;
  points: number;
  max: number;
  raisons: string[];
};

export type ScoreResult = { total: number; priorite: Priorite; parts: ScorePart[] };

const SEUIL_PREMIER = 70;
const SEUIL_ENSUITE = 45;

/** Points de manques sur une base de 25, ramenés ensuite au poids choisi. */
function manquesSur25(i: ScoreInput): { points: number; raisons: string[] } {
  if (!i.site) return { points: 25, raisons: ['Pas de site web'] };
  if (!i.checks) return { points: 10, raisons: ['Site pas encore analysé'] };
  if (!i.checks.joignable) return { points: 20, raisons: ['Site injoignable'] };

  const manques: Array<[actif: boolean, points: number, raison: string]> = [
    [!i.checks.https, 6, 'Site sans HTTPS'],
    [!i.checks.mobile, 7, 'Site non adapté au mobile'],
    [i.pagespeed !== null && i.pagespeed < 50, 6, 'Site lent (PageSpeed < 50)'],
    [!i.checks.reservationEnLigne, 6, 'Pas de réservation en ligne'],
  ];
  const actifs = manques.filter(([actif]) => actif);
  const points = actifs.reduce((s, [, p]) => s + p, 0);
  return { points: Math.min(points, 25), raisons: actifs.map(([, , r]) => r) };
}

function joignabilite(i: ScoreInput, max: number): { points: number; raisons: string[] } {
  if (i.telephone?.type === 'mobile') return { points: max, raisons: ['Mobile, probablement sur WhatsApp'] };
  if (i.telephone?.type === 'fixe') return { points: Math.round((max * 12) / 25), raisons: ['Fixe uniquement'] };
  return { points: 0, raisons: ['Aucun numéro connu'] };
}

function proximite(i: ScoreInput, max: number): { points: number; raisons: string[] } {
  const points = Math.round(max * Math.max(0, 1 - i.distanceM / i.rayonM));
  const raison = i.distanceM > i.rayonM ? 'Hors de la zone' : `À ${Math.round(i.distanceM)} m du centre de la zone`;
  return { points, raisons: [raison] };
}

export function calculerScore(i: ScoreInput, poids: Poids = POIDS): ScoreResult {
  const m = manquesSur25(i);
  const j = joignabilite(i, poids.joignabilite);
  const p = proximite(i, poids.proximite);

  const parts: ScorePart[] = [
    {
      cle: 'adequation',
      label: 'Adéquation au produit',
      points: i.adequation === 'principal' ? poids.adequation : Math.round(poids.adequation / 2),
      max: poids.adequation,
      raisons: [i.adequation === 'principal' ? 'Métier ciblé par le produit' : 'Métier voisin de la cible'],
    },
    {
      cle: 'manques',
      label: 'Manques en ligne',
      points: Math.round((m.points * poids.manques) / 25),
      max: poids.manques,
      raisons: m.raisons,
    },
    { cle: 'joignabilite', label: 'Joignabilité', points: j.points, max: poids.joignabilite, raisons: j.raisons },
    { cle: 'proximite', label: 'Proximité', points: p.points, max: poids.proximite, raisons: p.raisons },
  ];

  const total = parts.reduce((s, x) => s + x.points, 0);
  const priorite: Priorite = total >= SEUIL_PREMIER ? 'premier' : total >= SEUIL_ENSUITE ? 'ensuite' : 'plus_tard';
  return { total, priorite, parts };
}

/** Raisons de la part « manques », reprises dans le message de prospection. */
export function manquesLisibles(r: ScoreResult): string[] {
  return r.parts.find((p) => p.cle === 'manques')?.raisons ?? [];
}
