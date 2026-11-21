import { describe, expect, test } from 'vitest';
import { redirectionAcces, suiteSure } from '@/lib/domain/acces';

describe('redirectionAcces', () => {
  test('une page /app sans session renvoie vers la connexion en gardant la suite', () => {
    expect(redirectionAcces('/app/prospects', false)).toBe('/connexion?suite=%2Fapp%2Fprospects');
  });

  test('une page /app avec session passe', () => {
    expect(redirectionAcces('/app', true)).toBeNull();
  });

  test('la page de connexion avec session renvoie vers /app', () => {
    expect(redirectionAcces('/connexion', true)).toBe('/app');
  });

  test('la page de connexion sans session passe', () => {
    expect(redirectionAcces('/connexion', false)).toBeNull();
  });

  test('le lien suivi /r est toujours public', () => {
    expect(redirectionAcces('/r/abc12345', false)).toBeNull();
  });
});

describe('suiteSure', () => {
  test('accepte un chemin interne de l’app', () => {
    expect(suiteSure('/app/prospects?statut=contacte')).toBe('/app/prospects?statut=contacte');
  });

  test('refuse une adresse externe ou détournée', () => {
    expect(suiteSure('https://pirate.example')).toBe('/app');
    expect(suiteSure('//pirate.example')).toBe('/app');
    expect(suiteSure('/\\pirate.example')).toBe('/app');
    expect(suiteSure(null)).toBe('/app');
  });
});
