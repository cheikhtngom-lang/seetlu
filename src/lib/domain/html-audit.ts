import { parse } from 'node-html-parser';

/** Ce que l'on peut vérifier gratuitement sur le site d'un commerce. */
export type SiteChecks = {
  joignable: boolean;
  https: boolean;
  mobile: boolean;
  titre: string | null;
  metaDescription: boolean;
  anneeCopyright: number | null;
  lienWhatsApp: boolean;
  reservationEnLigne: boolean;
};

export type PageLue = { titre: string | null; description: string | null; texte: string };

const TEXTE_MAX = 6000;
const TEXTE_MIN_UTILE = 200;
const DELAI_MS = 8000;
const TAILLE_MAX_OCTETS = 1_000_000;
const RESERVATION = /r[ée]serv|rendez-vous|booking|calendly|prendre rdv/i;

const reduireEspaces = (s: string) => s.replace(/\s+/g, ' ').trim();

function racineSansCode(html: string) {
  const racine = parse(html);
  for (const n of racine.querySelectorAll('script, style, noscript, template')) n.remove();
  return racine;
}

function metaContenu(racine: ReturnType<typeof parse>, nom: string): string | null {
  const v = racine.querySelector(`meta[name="${nom}"]`)?.getAttribute('content')?.trim();
  return v ? v : null;
}

export function extraireTexte(html: string): PageLue {
  const racine = racineSansCode(html);
  const titre = reduireEspaces(racine.querySelector('title')?.text ?? '') || null;
  const corps = racine.querySelector('body') ?? racine;
  return {
    titre,
    description: metaContenu(racine, 'description'),
    // structuredText sépare les blocs (h1, p, div…) au lieu de les coller.
    texte: reduireEspaces(corps.structuredText).slice(0, TEXTE_MAX),
  };
}

/** Vrai quand la page ne contient presque pas de texte (app JavaScript, page vide). */
export function besoinDescriptionManuelle(page: PageLue): boolean {
  return page.texte.length < TEXTE_MIN_UTILE;
}

export function auditerHtml(html: string, urlFinale: string, anneeCourante: number): SiteChecks {
  const racine = parse(html);
  const page = extraireTexte(html);

  const annees = [...page.texte.matchAll(/(?:©|&copy;|copyright)\s*(?:\d{4}\s*[-–]\s*)?(\d{4})/gi)]
    .map((m) => Number(m[1]))
    .filter((a) => a >= 1995 && a <= anneeCourante);

  const liens = racine.querySelectorAll('a').map((a) => a.getAttribute('href') ?? '');

  return {
    joignable: true,
    https: urlFinale.startsWith('https://'),
    mobile: racine.querySelector('meta[name="viewport"]') !== null,
    titre: page.titre,
    metaDescription: page.description !== null,
    anneeCopyright: annees.length ? Math.max(...annees) : null,
    lienWhatsApp: liens.some((h) => /wa\.me\/|api\.whatsapp\.com|whatsapp:\/\//i.test(h)),
    reservationEnLigne: RESERVATION.test(page.texte) || liens.some((h) => /calendly|booking/i.test(h)),
  };
}

async function lireAuPlus(res: Response, octetsMax: number): Promise<string> {
  if (!res.body) return (await res.text()).slice(0, octetsMax);
  const lecteur = res.body.getReader();
  const morceaux: Uint8Array[] = [];
  let total = 0;
  while (total < octetsMax) {
    const { done, value } = await lecteur.read();
    if (done) break;
    morceaux.push(value);
    total += value.byteLength;
  }
  await lecteur.cancel().catch(() => {});
  const tout = new Uint8Array(Math.min(total, octetsMax));
  let pos = 0;
  for (const m of morceaux) {
    const part = m.subarray(0, tout.length - pos);
    tout.set(part, pos);
    pos += part.byteLength;
    if (pos >= tout.length) break;
  }
  return new TextDecoder().decode(tout);
}

/** Télécharge une page (8 s, 1 Mo au plus). Renvoie null si elle est injoignable. */
export async function telechargerPage(
  url: string,
  fetchImpl: typeof fetch = fetch,
): Promise<{ html: string; urlFinale: string } | null> {
  const ctrl = new AbortController();
  const minuteur = setTimeout(() => ctrl.abort(), DELAI_MS);
  try {
    const res = await fetchImpl(url, {
      redirect: 'follow',
      signal: ctrl.signal,
      headers: { 'user-agent': 'Mozilla/5.0 (compatible; SeetluAudit/0.1)', accept: 'text/html' },
    });
    if (!res.ok) return null;
    const html = await lireAuPlus(res, TAILLE_MAX_OCTETS);
    return { html, urlFinale: res.url || url };
  } catch {
    return null;
  } finally {
    clearTimeout(minuteur);
  }
}
