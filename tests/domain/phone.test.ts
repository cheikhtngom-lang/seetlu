import { describe, expect, test } from 'vitest';
import { normaliserTelephone } from '@/lib/domain/phone';

describe('normaliserTelephone', () => {
  test('mobile écrit avec espaces', () => {
    expect(normaliserTelephone('77 123 45 67')).toEqual({ e164: '+221771234567', type: 'mobile' });
  });

  test('indicatif +221 et tirets', () => {
    expect(normaliserTelephone('+221 77-123-45-67')?.e164).toBe('+221771234567');
  });

  test('indicatif 00221', () => {
    expect(normaliserTelephone('00221781234567')).toEqual({ e164: '+221781234567', type: 'mobile' });
  });

  test('fixe avec indicatif 221 sans plus', () => {
    expect(normaliserTelephone('221 33 821 00 00')).toEqual({ e164: '+221338210000', type: 'fixe' });
  });

  test('le mobile passe avant le fixe quand il est second', () => {
    expect(normaliserTelephone('33 821 00 00 / 76 555 44 33')?.e164).toBe('+221765554433');
  });

  test('le premier mobile est gardé quand il est premier', () => {
    expect(normaliserTelephone('77 123 45 67; 33 821 00 00')?.e164).toBe('+221771234567');
  });

  test('numéro étranger refusé', () => {
    expect(normaliserTelephone('+33 6 12 34 56 78')).toBeNull();
  });

  test('préfixe mobile inconnu refusé', () => {
    expect(normaliserTelephone('74 123 45 67')).toBeNull();
  });

  test('trop court refusé', () => {
    expect(normaliserTelephone('12345')).toBeNull();
  });

  test('null et vide renvoient null', () => {
    expect(normaliserTelephone(null)).toBeNull();
    expect(normaliserTelephone(undefined)).toBeNull();
    expect(normaliserTelephone('')).toBeNull();
  });
});
