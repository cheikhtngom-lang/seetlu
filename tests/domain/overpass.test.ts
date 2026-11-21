import { describe, expect, test } from 'vitest';
import {
  OverpassIndisponible,
  SERVEURS_OVERPASS,
  executerOverpass,
  parserOverpass,
  requeteOverpass,
} from '@/lib/domain/overpass';
import { quartierPlusProche } from '@/lib/domain/quartiers';

const plateau = { lat: 14.6708, lng: -17.4381, rayonM: 1500 };

describe('requeteOverpass', () => {
  const q = requeteOverpass(plateau, ['coiffure']);

  test('commence par l’en-tête JSON avec délai', () => {
    expect(q.startsWith('[out:json][timeout:25];(')).toBe(true);
  });

  test('contient une ligne par étiquette du métier', () => {
    expect(q).toContain('nwr["shop"="hairdresser"](around:1500,14.6708,-17.4381);');
    expect(q).toContain('nwr["shop"="beauty"](around:1500,14.6708,-17.4381);');
  });

  test('demande le centre des surfaces et les étiquettes', () => {
    expect(q.endsWith(');out center tags;')).toBe(true);
  });
});

describe('parserOverpass', () => {
  test('lit un nœud nommé', () => {
    const [p] = parserOverpass({
      elements: [
        { type: 'node', id: 1, lat: 14.67, lon: -17.43, tags: { name: 'Salon Awa', shop: 'hairdresser', phone: '77 123 45 67' } },
      ],
    });
    expect(p).toMatchObject({
      source: 'osm',
      sourceId: 'node/1',
      nom: 'Salon Awa',
      metier: 'coiffure',
      lat: 14.67,
      lng: -17.43,
      telephoneBrut: '77 123 45 67',
    });
  });

  test('utilise le centre d’une surface', () => {
    const [p] = parserOverpass({
      elements: [{ type: 'way', id: 9, center: { lat: 14.7, lon: -17.45 }, tags: { name: 'Lavage Diop', amenity: 'car_wash' } }],
    });
    expect(p).toMatchObject({ sourceId: 'way/9', lat: 14.7, lng: -17.45, metier: 'lavage_auto' });
  });

  test('ignore un élément sans nom', () => {
    expect(parserOverpass({ elements: [{ type: 'node', id: 2, lat: 1, lon: 1, tags: { shop: 'hairdresser' } }] })).toEqual([]);
  });

  test('prend contact:phone, email et contact:facebook', () => {
    const [p] = parserOverpass({
      elements: [
        {
          type: 'node',
          id: 3,
          lat: 1,
          lon: 1,
          tags: {
            name: 'Garage Ndiaye',
            shop: 'car_repair',
            'contact:phone': '78 000 00 00',
            email: 'garage@exemple.sn',
            'contact:facebook': 'https://facebook.com/garagendiaye',
          },
        },
      ],
    });
    expect(p.telephoneBrut).toBe('78 000 00 00');
    expect(p.mail).toBe('garage@exemple.sn');
    expect(p.reseaux.facebook).toBe('https://facebook.com/garagendiaye');
  });

  test('un JSON invalide donne une liste vide', () => {
    expect(parserOverpass(null)).toEqual([]);
    expect(parserOverpass({ nope: true })).toEqual([]);
  });
});

describe('executerOverpass', () => {
  const reponse = (status: number, corps: unknown = {}) =>
    new Response(JSON.stringify(corps), { status, headers: { 'content-type': 'application/json' } });

  test('passe au serveur de secours après une erreur 504', async () => {
    const appels: string[] = [];
    const faux = (async (url: string) => {
      appels.push(url);
      return appels.length === 1 ? reponse(504) : reponse(200, { elements: [] });
    }) as unknown as typeof fetch;

    await expect(executerOverpass('q', faux)).resolves.toEqual({ elements: [] });
    expect(appels[1]).toBe(SERVEURS_OVERPASS[1]);
  });

  test('lève OverpassIndisponible si tous les serveurs refusent', async () => {
    const faux = (async () => reponse(429)) as unknown as typeof fetch;
    await expect(executerOverpass('q', faux)).rejects.toBeInstanceOf(OverpassIndisponible);
  });

  test('une coupure réseau passe aussi au serveur suivant', async () => {
    let n = 0;
    const faux = (async () => {
      n++;
      if (n === 1) throw new TypeError('fetch failed');
      return reponse(200, { elements: [{ id: 1 }] });
    }) as unknown as typeof fetch;
    await expect(executerOverpass('q', faux)).resolves.toEqual({ elements: [{ id: 1 }] });
  });
});

describe('quartierPlusProche', () => {
  test('un point du Plateau', () => {
    expect(quartierPlusProche(14.671, -17.4385)).toBe('Plateau');
  });

  test('un point hors de toute zone connue', () => {
    expect(quartierPlusProche(16.0, -16.5)).toBeNull();
  });
});
