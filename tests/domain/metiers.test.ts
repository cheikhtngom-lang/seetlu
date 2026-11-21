import { describe, expect, test } from 'vitest';
import { METIERS, metierDepuisTags } from '@/lib/domain/metiers';

describe('metierDepuisTags', () => {
  test('reconnaît un salon de coiffure', () => {
    expect(metierDepuisTags({ shop: 'hairdresser', name: 'X' })).toBe('coiffure');
  });

  test('reconnaît un lavage auto', () => {
    expect(metierDepuisTags({ amenity: 'car_wash' })).toBe('lavage_auto');
  });

  test('renvoie null pour un métier non suivi', () => {
    expect(metierDepuisTags({ shop: 'bakery' })).toBeNull();
  });
});

describe('METIERS', () => {
  test('chaque métier a un libellé et au moins une étiquette OSM', () => {
    for (const m of Object.values(METIERS)) {
      expect(m.label.length).toBeGreaterThan(0);
      expect(m.osm.length).toBeGreaterThan(0);
    }
  });
});
