import { describe, expect, test } from 'vitest';
import { auditerHtml, besoinDescriptionManuelle, extraireTexte, telechargerPage } from '@/lib/domain/html-audit';

const page = (corps: string, tete = '') =>
  `<!doctype html><html><head>${tete}</head><body>${corps}</body></html>`;

describe('auditerHtml', () => {
  test('viewport présent : adapté au mobile', () => {
    const c = auditerHtml(page('x', '<meta name="viewport" content="width=device-width">'), 'https://a.sn', 2026);
    expect(c.mobile).toBe(true);
    expect(c.joignable).toBe(true);
  });

  test('sans viewport : pas adapté au mobile', () => {
    expect(auditerHtml(page('x'), 'https://a.sn', 2026).mobile).toBe(false);
  });

  test('URL en http : pas de HTTPS', () => {
    expect(auditerHtml(page('x'), 'http://a.sn', 2026).https).toBe(false);
  });

  test('titre et meta description', () => {
    const c = auditerHtml(
      page('x', '<title> Garage Ndiaye </title><meta name="description" content="Réparation">'),
      'https://a.sn',
      2026,
    );
    expect(c.titre).toBe('Garage Ndiaye');
    expect(c.metaDescription).toBe(true);
  });

  test('année du copyright', () => {
    expect(auditerHtml(page('<footer>© 2019 Garage</footer>'), 'https://a.sn', 2026).anneeCopyright).toBe(2019);
  });

  test('une année future est ignorée', () => {
    expect(auditerHtml(page('<footer>© 2099</footer>'), 'https://a.sn', 2026).anneeCopyright).toBeNull();
  });

  test('lien WhatsApp détecté', () => {
    expect(auditerHtml(page('<a href="https://wa.me/221771234567">WA</a>'), 'https://a.sn', 2026).lienWhatsApp).toBe(true);
  });

  test('réservation en ligne détectée', () => {
    expect(auditerHtml(page('<p>Réservez en ligne</p>'), 'https://a.sn', 2026).reservationEnLigne).toBe(true);
    expect(auditerHtml(page('<a>Prendre RDV</a>'), 'https://a.sn', 2026).reservationEnLigne).toBe(true);
    expect(auditerHtml(page('<p>Bienvenue</p>'), 'https://a.sn', 2026).reservationEnLigne).toBe(false);
  });
});

describe('extraireTexte', () => {
  test('retire scripts et styles, réduit les espaces', () => {
    const p = extraireTexte(
      page('<h1>Lavage   Auto</h1><script>var x=1</script><style>p{}</style><p>Dakar</p>', '<title>T</title>'),
    );
    expect(p.texte).toBe('Lavage Auto Dakar');
    expect(p.titre).toBe('T');
  });

  test('limite le texte à 6 000 caractères', () => {
    expect(extraireTexte(page(`<p>${'a '.repeat(5000)}</p>`)).texte.length).toBeLessThanOrEqual(6000);
  });

  test('une app React vide demande une description manuelle', () => {
    const p = extraireTexte(page('<div id="root"></div><script type="module" src="/assets/index.js"></script>', '<title>Lavage Auto</title>'));
    expect(p.texte.length).toBeLessThan(200);
    expect(besoinDescriptionManuelle(p)).toBe(true);
  });

  test('une vraie page n’en demande pas', () => {
    expect(besoinDescriptionManuelle({ titre: null, description: null, texte: 'mot '.repeat(80) })).toBe(false);
  });
});

describe('telechargerPage', () => {
  test('une erreur réseau donne null', async () => {
    const faux = (async () => {
      throw new TypeError('fetch failed');
    }) as unknown as typeof fetch;
    await expect(telechargerPage('https://a.sn', faux)).resolves.toBeNull();
  });

  test('une réponse 404 donne null', async () => {
    const faux = (async () => new Response('non', { status: 404 })) as unknown as typeof fetch;
    await expect(telechargerPage('https://a.sn', faux)).resolves.toBeNull();
  });

  test('renvoie le HTML et l’URL finale', async () => {
    const faux = (async () => {
      const r = new Response('<html>ok</html>', { status: 200, headers: { 'content-type': 'text/html' } });
      Object.defineProperty(r, 'url', { value: 'https://www.a.sn/' });
      return r;
    }) as unknown as typeof fetch;
    await expect(telechargerPage('http://a.sn', faux)).resolves.toEqual({ html: '<html>ok</html>', urlFinale: 'https://www.a.sn/' });
  });
});
