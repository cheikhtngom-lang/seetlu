import { describe, expect, test } from 'vitest';
import { calculerScore, manquesLisibles, type ScoreInput } from '@/lib/domain/score';
import type { SiteChecks } from '@/lib/domain/html-audit';

const siteParfait: SiteChecks = {
  joignable: true,
  https: true,
  mobile: true,
  titre: 'Garage',
  metaDescription: true,
  anneeCopyright: 2026,
  lienWhatsApp: true,
  reservationEnLigne: true,
};

const base: ScoreInput = {
  adequation: 'principal',
  telephone: { e164: '+221771234567', type: 'mobile' },
  site: null,
  checks: null,
  pagespeed: null,
  aReseaux: false,
  distanceM: 0,
  rayonM: 1500,
};

const part = (r: ReturnType<typeof calculerScore>, cle: string) => r.parts.find((p) => p.cle === cle)!;

describe('calculerScore', () => {
  test('principal, sans site, mobile, au centre : 100 et à contacter en premier', () => {
    const r = calculerScore(base);
    expect(r.total).toBe(100);
    expect(r.priorite).toBe('premier');
    expect(r.parts).toHaveLength(4);
  });

  test('secondaire, site parfait, fixe, au bord de la zone : 27 et plus tard', () => {
    const r = calculerScore({
      ...base,
      adequation: 'secondaire',
      telephone: { e164: '+221338210000', type: 'fixe' },
      site: 'https://garage.sn',
      checks: siteParfait,
      pagespeed: 90,
      distanceM: 1500,
    });
    expect(r.total).toBe(27);
    expect(r.priorite).toBe('plus_tard');
  });

  test('site non audité, aucun numéro, à mi-rayon : 50 et ensuite', () => {
    const r = calculerScore({ ...base, telephone: null, site: 'https://x.sn', distanceM: 750 });
    expect(part(r, 'manques').points).toBe(10);
    expect(part(r, 'joignabilite').points).toBe(0);
    expect(part(r, 'proximite').points).toBe(10);
    expect(r.total).toBe(50);
    expect(r.priorite).toBe('ensuite');
  });

  test('les manques cumulés sont plafonnés à 25', () => {
    const r = calculerScore({
      ...base,
      site: 'http://x.sn',
      checks: { ...siteParfait, https: false, mobile: false, reservationEnLigne: false },
      pagespeed: 30,
    });
    const m = part(r, 'manques');
    expect(m.points).toBe(25);
    expect(m.max).toBe(25);
  });

  test('un site injoignable vaut 20 points de manques', () => {
    const r = calculerScore({ ...base, site: 'https://mort.sn', checks: { ...siteParfait, joignable: false } });
    expect(part(r, 'manques').points).toBe(20);
  });

  test('hors de la zone, la proximité vaut 0', () => {
    expect(part(calculerScore({ ...base, distanceM: 4000 }), 'proximite').points).toBe(0);
  });
});

describe('manquesLisibles', () => {
  test('renvoie les raisons de la part manques', () => {
    expect(manquesLisibles(calculerScore(base))).toEqual(['Pas de site web']);
  });
});
