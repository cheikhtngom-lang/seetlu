import { describe, expect, test } from 'vitest';
import { LIBELLES_PRIORITE, LIBELLES_STATUT, niveauBain } from '@/lib/domain/libelles';
import { STATUTS } from '@/lib/domain/score';

describe('niveauBain', () => {
  test('premier = trois bains, ensuite = deux, plus tard = un', () => {
    expect(niveauBain('premier')).toBe(3);
    expect(niveauBain('ensuite')).toBe(2);
    expect(niveauBain('plus_tard')).toBe(1);
  });
});

describe('libellés', () => {
  test('chaque statut a un libellé français', () => {
    for (const s of STATUTS) expect(LIBELLES_STATUT[s].length).toBeGreaterThan(0);
    expect(LIBELLES_STATUT.a_repondu).toBe('A répondu');
    expect(LIBELLES_STATUT.ne_plus_contacter).toBe('Ne plus contacter');
  });

  test('chaque priorité a un libellé', () => {
    expect(LIBELLES_PRIORITE).toEqual({ premier: 'En premier', ensuite: 'Ensuite', plus_tard: 'Plus tard' });
  });
});
