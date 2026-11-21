import { describe, expect, test } from 'vitest';
import { FakeAi } from '@/lib/ai/fake';
import { calculerScore } from '@/lib/domain/score';

const ai = new FakeAi();
const produit = { nom: 'File Salon', resume: 'File d’attente', arguments: ['a', 'b', 'c'], url: 'https://file.sn' };
const place = { nom: 'Salon Awa', metier: 'coiffure' as const, quartier: 'Plateau' };

describe('FakeAi', () => {
  test('le message contient le jeton {LIEN}', async () => {
    const { texte } = await ai.ecrireMessage({ produit, place, manques: ['Pas de site web'], salutationWolof: false });
    expect(texte).toContain('{LIEN}');
  });

  test('la salutation wolof est respectée', async () => {
    const { texte } = await ai.ecrireMessage({ produit, place, manques: [], salutationWolof: true });
    expect(texte.startsWith('Salaam aleekum')).toBe(true);
  });

  test('trouve le métier dans la description manuelle', async () => {
    const a = await ai.analyserProduit({
      url: 'https://file.sn',
      page: { titre: 'File', description: null, texte: '' },
      descriptionManuelle: "file d'attente pour salons de coiffure",
    });
    expect(a.metiers).toContain('coiffure');
    expect(a.arguments).toHaveLength(3);
  });

  test('explique à partir des raisons du score', async () => {
    const score = calculerScore({
      adequation: 'principal',
      telephone: { e164: '+221771234567', type: 'mobile' },
      site: null,
      checks: null,
      pagespeed: null,
      aReseaux: false,
      distanceM: 0,
      rayonM: 1000,
    });
    const { pourquoi } = await ai.expliquerProspect({ produit, place, score });
    expect(pourquoi).toContain('Pas de site web');
  });
});
