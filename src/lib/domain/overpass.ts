import { METIERS, metierDepuisTags, type MetierKey } from './metiers';

export type Zone = { lat: number; lng: number; rayonM: number };

export type PlaceCandidate = {
  source: 'osm';
  sourceId: string;
  nom: string;
  metier: MetierKey;
  lat: number;
  lng: number;
  telephoneBrut: string | null;
  mail: string | null;
  site: string | null;
  reseaux: Record<string, string>;
  adresse: string | null;
};

export const SERVEURS_OVERPASS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
];

const DELAI_SERVEUR_MS = 30_000;

export class OverpassIndisponible extends Error {
  constructor() {
    super('Serveur de cartes saturé, réessayez dans une minute');
    this.name = 'OverpassIndisponible';
  }
}

export function requeteOverpass(zone: Zone, metiers: MetierKey[]): string {
  const autour = `(around:${zone.rayonM},${zone.lat},${zone.lng})`;
  const lignes = metiers.flatMap((m) => METIERS[m].osm.map(([k, v]) => `nwr["${k}"="${v}"]${autour};`));
  return `[out:json][timeout:25];(${lignes.join('')});out center tags;`;
}

type ElementOsm = {
  type?: string;
  id?: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
};

const RESEAUX = ['facebook', 'instagram', 'tiktok', 'twitter', 'whatsapp'] as const;

function premier(tags: Record<string, string>, ...cles: string[]): string | null {
  for (const c of cles) if (tags[c]) return tags[c];
  return null;
}

function adresseDepuis(tags: Record<string, string>): string | null {
  const morceaux = [tags['addr:housenumber'], tags['addr:street'], tags['addr:city']].filter(Boolean);
  return morceaux.length ? morceaux.join(' ') : null;
}

export function parserOverpass(json: unknown): PlaceCandidate[] {
  const elements = (json as { elements?: unknown } | null)?.elements;
  if (!Array.isArray(elements)) return [];

  const candidats: PlaceCandidate[] = [];
  for (const el of elements as ElementOsm[]) {
    const tags = el.tags ?? {};
    const nom = tags.name?.trim();
    const metier = metierDepuisTags(tags);
    const lat = el.lat ?? el.center?.lat;
    const lng = el.lon ?? el.center?.lon;
    if (!nom || !metier || lat === undefined || lng === undefined || !el.type || el.id === undefined) continue;

    const reseaux: Record<string, string> = {};
    for (const r of RESEAUX) {
      const v = premier(tags, `contact:${r}`, r);
      if (v) reseaux[r] = v;
    }

    candidats.push({
      source: 'osm',
      sourceId: `${el.type}/${el.id}`,
      nom,
      metier,
      lat,
      lng,
      telephoneBrut: premier(tags, 'phone', 'contact:phone', 'contact:mobile', 'mobile'),
      mail: premier(tags, 'email', 'contact:email'),
      site: premier(tags, 'website', 'contact:website', 'url'),
      reseaux,
      adresse: adresseDepuis(tags),
    });
  }
  return candidats;
}

/** Envoie la requête au premier serveur qui répond ; passe au suivant en cas d'erreur. */
export async function executerOverpass(requete: string, fetchImpl: typeof fetch = fetch): Promise<unknown> {
  for (const serveur of SERVEURS_OVERPASS) {
    const ctrl = new AbortController();
    const minuteur = setTimeout(() => ctrl.abort(), DELAI_SERVEUR_MS);
    try {
      const res = await fetchImpl(serveur, {
        method: 'POST',
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        body: `data=${encodeURIComponent(requete)}`,
        signal: ctrl.signal,
      });
      if (res.ok) return await res.json();
    } catch {
      // coupure réseau ou délai dépassé : on essaie le serveur suivant
    } finally {
      clearTimeout(minuteur);
    }
  }
  throw new OverpassIndisponible();
}
