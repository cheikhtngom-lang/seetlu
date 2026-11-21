import { describe, expect, test } from 'vitest';
import {
  MAX_MESSAGE,
  PHRASE_STOP,
  assemblerMessage,
  datesRelance,
  estBloque,
  lienMail,
  lienWhatsApp,
  nouveauCode,
  urlCible,
} from '@/lib/domain/message';

const LIEN = 'https://x/r/abc';

describe('assemblerMessage', () => {
  test('remplace {LIEN} et termine par la phrase STOP', () => {
    const m = assemblerMessage('Bonjour {LIEN} merci', LIEN);
    expect(m).toContain(LIEN);
    expect(m).not.toContain('{LIEN}');
    expect(m.endsWith(PHRASE_STOP)).toBe(true);
  });

  test('ajoute le lien avant la phrase STOP s’il manque', () => {
    const m = assemblerMessage('Bonjour, voici notre offre.', LIEN);
    expect(m.indexOf(LIEN)).toBeGreaterThan(-1);
    expect(m.indexOf(LIEN)).toBeLessThan(m.indexOf(PHRASE_STOP));
  });

  test('ne double pas la phrase STOP', () => {
    const m = assemblerMessage(`Bonjour {LIEN}\n${PHRASE_STOP}`, LIEN);
    expect(m.split(PHRASE_STOP)).toHaveLength(2);
  });

  test('un texte trop long est coupé mais garde le lien et la phrase STOP', () => {
    const m = assemblerMessage(`${'mot '.repeat(500)}{LIEN}`, LIEN);
    expect(m.length).toBeLessThanOrEqual(MAX_MESSAGE);
    expect(m).toContain(LIEN);
    expect(m.endsWith(PHRASE_STOP)).toBe(true);
  });
});

describe('liens', () => {
  test('lien WhatsApp sans le +, texte encodé', () => {
    expect(lienWhatsApp('+221771234567', 'Bonjour à vous')).toBe(
      'https://wa.me/221771234567?text=Bonjour%20%C3%A0%20vous',
    );
  });

  test('lien mail avec sujet et corps encodés', () => {
    expect(lienMail('a@b.sn', 'Sujet é', 'Corps')).toBe('mailto:a@b.sn?subject=Sujet%20%C3%A9&body=Corps');
  });

  test('urlCible ajoute sl= en gardant la requête existante', () => {
    expect(urlCible('https://lavage.sn/?a=1', 'abc')).toBe('https://lavage.sn/?a=1&sl=abc');
    expect(urlCible('https://lavage.sn', 'abc')).toBe('https://lavage.sn/?sl=abc');
  });

  test('nouveauCode fait 8 caractères alphanumériques et varie', () => {
    const a = nouveauCode();
    expect(a).toMatch(/^[A-Za-z0-9]{8}$/);
    expect(nouveauCode()).not.toBe(a);
  });
});

describe('relances', () => {
  test('J+3 et J+7', () => {
    const { j3, j7 } = datesRelance(new Date('2026-11-21T10:00:00Z'));
    expect(j3.toISOString()).toBe('2026-11-24T10:00:00.000Z');
    expect(j7.toISOString()).toBe('2026-11-28T10:00:00.000Z');
  });
});

describe('estBloque', () => {
  const opt = new Set(['+221771234567', 'awa@exemple.sn']);

  test('bloqué par le téléphone', () => {
    expect(estBloque(['+221771234567', null], opt)).toBe(true);
  });

  test('bloqué par le mail', () => {
    expect(estBloque([null, 'awa@exemple.sn'], opt)).toBe(true);
  });

  test('aucun contact connu : pas bloqué', () => {
    expect(estBloque([null, null], opt)).toBe(false);
  });
});
