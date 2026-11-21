export type TelephoneNormalise = { e164: string; type: 'mobile' | 'fixe' };

const PREFIXES_MOBILE = ['70', '75', '76', '77', '78'];
const PREFIXES_FIXE = ['33'];

function classer(national: string): TelephoneNormalise['type'] | null {
  const prefixe = national.slice(0, 2);
  if (PREFIXES_MOBILE.includes(prefixe)) return 'mobile';
  if (PREFIXES_FIXE.includes(prefixe)) return 'fixe';
  return null;
}

/** Ramène un morceau de texte à un numéro national sénégalais à 9 chiffres, ou null. */
function versNational(morceau: string): string | null {
  let chiffres = morceau.replace(/\D/g, '');
  if (chiffres.startsWith('00221')) chiffres = chiffres.slice(5);
  else if (chiffres.startsWith('221') && chiffres.length === 12) chiffres = chiffres.slice(3);
  return chiffres.length === 9 ? chiffres : null;
}

/**
 * Normalise un ou plusieurs numéros saisis librement (« 77 123 45 67 ; 33 821 00 00 »)
 * au format E.164 sénégalais. Préfère le premier mobile, sinon le premier fixe.
 */
export function normaliserTelephone(brut: string | null | undefined): TelephoneNormalise | null {
  if (!brut) return null;
  const valides: TelephoneNormalise[] = [];
  for (const morceau of brut.split(/[;/,]|\sou\s/i)) {
    const national = versNational(morceau);
    if (!national) continue;
    const type = classer(national);
    if (type) valides.push({ e164: `+221${national}`, type });
  }
  return valides.find((t) => t.type === 'mobile') ?? valides[0] ?? null;
}
