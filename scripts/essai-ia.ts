/**
 * Essai réel de l'analyse d'un produit avec Gemini.
 * Usage : npx tsx --env-file=.env.local scripts/essai-ia.ts https://mon-site.sn ["description manuelle"]
 */
import { getAi } from '../src/lib/ai';
import { besoinDescriptionManuelle, extraireTexte, telechargerPage } from '../src/lib/domain/html-audit';

async function main() {
  const [url, descriptionManuelle] = process.argv.slice(2);
  if (!url) throw new Error('Donnez une URL.');

  const telecharge = await telechargerPage(url);
  if (!telecharge) throw new Error(`Site injoignable : ${url}`);

  const page = extraireTexte(telecharge.html);
  console.log(`Texte lu : ${page.texte.length} caractères`);
  if (besoinDescriptionManuelle(page) && !descriptionManuelle) {
    console.log('Page presque vide (app JavaScript) : relancez avec une description en 2e argument.');
    return;
  }
  console.log(JSON.stringify(await getAi().analyserProduit({ url, page, descriptionManuelle }), null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
