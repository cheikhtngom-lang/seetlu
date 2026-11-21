import { describe, expect, test } from 'vitest';
import { distanceM } from '@/lib/domain/geo';
import { planifierImport, similariteNom, trouverDoublon, type PlaceExistante } from '@/lib/domain/dedupe';
import type { PlaceCandidate } from '@/lib/domain/overpass';

const P = { lat: 14.6708, lng: -17.4381 };
/** Décale un point vers le nord d'environ `m` mètres. */
const auNord = (m: number) => ({ lat: P.lat + m / 111_195, lng: P.lng });

const candidat = (over: Partial<PlaceCandidate> = {}): PlaceCandidate => ({
  source: 'osm',
  sourceId: 'node/1',
  nom: 'Salon Awa Coiffure',
  metier: 'coiffure',
  ...P,
  telephoneBrut: null,
  mail: null,
  site: null,
  reseaux: {},
  adresse: null,
  ...over,
});

const existante = (over: Partial<PlaceExistante> = {}): PlaceExistante => ({
  id: 'p1',
  nom: 'Salon Awa Coiffure',
  ...P,
  telephone: null,
  ...over,
});

describe('distanceM', () => {
  test('un point est à 0 m de lui-même', () => {
    expect(distanceM(P, P)).toBe(0);
  });

  test('0,001° de latitude fait environ 111 m', () => {
    const d = distanceM(P, { lat: P.lat + 0.001, lng: P.lng });
    expect(d).toBeGreaterThan(110);
    expect(d).toBeLessThan(112);
  });
});

describe('similariteNom', () => {
  test('ignore casse, accents et espaces multiples', () => {
    expect(similariteNom('Salon Awa Coiffure', 'salon awa  coiffure')).toBe(1);
    expect(similariteNom('Médina Lavage', 'medina lavage')).toBe(1);
  });

  test('des noms différents sont peu similaires', () => {
    expect(similariteNom('Garage Ndiaye', 'Pharmacie Guigon')).toBeLessThan(0.5);
  });
});

describe('trouverDoublon', () => {
  test('même téléphone à 3 km : doublon', () => {
    const e = existante({ nom: 'Autre nom', telephone: '+221771234567', ...auNord(3000) });
    expect(trouverDoublon({ nom: 'Salon Awa', ...P, telephone: '+221771234567' }, [e])).toBe(e);
  });

  test('nom similaire à 20 m : doublon', () => {
    const e = existante({ ...auNord(20) });
    expect(trouverDoublon({ nom: 'salon awa  coiffure', ...P, telephone: null }, [e])).toBe(e);
  });

  test('même nom à 80 m : pas un doublon', () => {
    expect(trouverDoublon({ nom: 'Salon Awa Coiffure', ...P, telephone: null }, [existante({ ...auNord(80) })])).toBeNull();
  });

  test('noms différents à 10 m : pas un doublon', () => {
    const e = existante({ nom: 'Pharmacie Guigon', ...auNord(10) });
    expect(trouverDoublon({ nom: 'Salon Awa Coiffure', ...P, telephone: null }, [e])).toBeNull();
  });
});

describe('planifierImport', () => {
  test('un candidat présent deux fois dans le lot n’est créé qu’une fois', () => {
    const plan = planifierImport([candidat(), candidat({ sourceId: 'way/7' })], [], new Set());
    expect(plan.aCreer).toHaveLength(1);
  });

  test('une source déjà connue est comptée sans création ni fusion', () => {
    const plan = planifierImport([candidat()], [], new Set(['osm:node/1']));
    expect(plan).toEqual({ aCreer: [], aFusionner: [], dejaConnus: 1 });
  });

  test('un candidat proche d’une place existante de même nom est fusionné', () => {
    const plan = planifierImport([candidat({ sourceId: 'node/2' })], [existante({ id: 'abc', ...auNord(15) })], new Set());
    expect(plan.aCreer).toEqual([]);
    expect(plan.aFusionner).toEqual([{ placeId: 'abc', candidat: expect.objectContaining({ sourceId: 'node/2' }) }]);
  });

  test('le téléphone brut est normalisé pour la comparaison', () => {
    const e = existante({ id: 'tel', nom: 'Autre', telephone: '+221771234567', ...auNord(900) });
    const plan = planifierImport([candidat({ telephoneBrut: '77 123 45 67' })], [e], new Set());
    expect(plan.aFusionner[0]?.placeId).toBe('tel');
  });
});
