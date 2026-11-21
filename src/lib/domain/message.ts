export const PHRASE_STOP = 'Si vous ne souhaitez plus recevoir de message, répondez simplement STOP.';
export const MAX_MESSAGE = 700;

const JETON_LIEN = '{LIEN}';
const SEPARATEUR_STOP = '\n\n';

/**
 * Insère le lien suivi à la place de {LIEN} (ou l'ajoute), termine par la phrase STOP
 * et garantit au plus MAX_MESSAGE caractères sans jamais perdre le lien ni la phrase STOP.
 */
export function assemblerMessage(texteIa: string, lien: string): string {
  const texte = texteIa.split(PHRASE_STOP).join('').trim();
  const corps = texte.includes(JETON_LIEN)
    ? texte.split(JETON_LIEN).join(lien).trim()
    : `${texte}\n${lien}`;

  const complet = `${corps}${SEPARATEUR_STOP}${PHRASE_STOP}`;
  if (complet.length <= MAX_MESSAGE) return complet;

  // Trop long : on coupe le texte seul, puis on remet le lien et la phrase STOP à la fin.
  const queue = `…\n${lien}${SEPARATEUR_STOP}${PHRASE_STOP}`;
  const sansLien = texte.split(JETON_LIEN).join('').replace(/\s+/g, ' ').trim();
  const budget = MAX_MESSAGE - queue.length;
  const coupe = sansLien.slice(0, budget);
  const dernierEspace = coupe.lastIndexOf(' ');
  return `${(dernierEspace > 0 ? coupe.slice(0, dernierEspace) : coupe).trim()}${queue}`;
}

export function lienWhatsApp(e164: string, texte: string): string {
  return `https://wa.me/${e164.replace(/\D/g, '')}?text=${encodeURIComponent(texte)}`;
}

export function lienMail(mail: string, sujet: string, texte: string): string {
  return `mailto:${mail}?subject=${encodeURIComponent(sujet)}&body=${encodeURIComponent(texte)}`;
}

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

/** Code de lien suivi : 8 caractères [A-Za-z0-9], tirés sans biais. */
export function nouveauCode(): string {
  let code = '';
  while (code.length < 8) {
    for (const octet of crypto.getRandomValues(new Uint8Array(16))) {
      if (octet < 248 && code.length < 8) code += ALPHABET[octet % 62];
    }
  }
  return code;
}

/** URL du produit avec le paramètre sl=<code>, en gardant la requête existante. */
export function urlCible(urlProduit: string, code: string): string {
  const url = new URL(urlProduit);
  url.searchParams.set('sl', code);
  return url.toString();
}

const JOUR_MS = 86_400_000;

export function datesRelance(envoyeLe: Date): { j3: Date; j7: Date } {
  return { j3: new Date(envoyeLe.getTime() + 3 * JOUR_MS), j7: new Date(envoyeLe.getTime() + 7 * JOUR_MS) };
}

/** Vrai si l'un des contacts (téléphone E.164, mail en minuscules) est désinscrit. */
export function estBloque(contacts: Array<string | null>, optOuts: Set<string>): boolean {
  return contacts.some((c) => c !== null && optOuts.has(c));
}
