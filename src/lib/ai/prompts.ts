import type { PageLue } from '@/lib/domain/html-audit';
import { METIERS, METIER_KEYS } from '@/lib/domain/metiers';
import type { ScoreResult } from '@/lib/domain/score';
import type { PlaceResume, ProduitResume } from './provider';

const listeMetiers = METIER_KEYS.map((k) => `- ${k} : ${METIERS[k].label}`).join('\n');

export function promptAnalyseProduit(i: { url: string; page: PageLue; descriptionManuelle?: string }): string {
  return `Tu analyses le site d'un logiciel (SaaS) vendu au Sénégal, pour trouver à quels commerces le proposer.
N'utilise QUE les informations ci-dessous. N'invente aucun prix : si aucun prix n'est écrit, prix = null.

URL : ${i.url}
Titre : ${i.page.titre ?? '(aucun)'}
Description : ${i.page.description ?? '(aucune)'}
Texte de la page : ${i.page.texte || '(vide)'}
${i.descriptionManuelle ? `Description donnée par l'éditeur : ${i.descriptionManuelle}` : ''}

Réponds en français :
- nom : nom du produit
- resume : ce que vend le produit, en une phrase
- metiers : les métiers clients, choisis UNIQUEMENT dans cette liste (clés) :
${listeMetiers}
- arguments : exactement 3 arguments clés, courts
- prix : le prix tel qu'écrit sur la page, ou null`;
}

export function promptPourquoi(i: { produit: ProduitResume; place: PlaceResume; score: ScoreResult }): string {
  const raisons = i.score.parts.flatMap((p) => p.raisons).join(' ; ');
  return `Produit : ${i.produit.nom} — ${i.produit.resume}
Commerce : ${i.place.nom} (${METIERS[i.place.metier].label}${i.place.quartier ? `, ${i.place.quartier}` : ''})
Score d'opportunité : ${i.score.total}/100. Constats : ${raisons}

En 2 phrases au plus, factuelles et fondées uniquement sur ces constats, explique en français
pourquoi contacter ce commerce maintenant pour lui proposer ce produit.`;
}

export function promptMessage(i: {
  produit: ProduitResume;
  place: PlaceResume;
  manques: string[];
  salutationWolof: boolean;
}): string {
  return `Écris un message WhatsApp de prospection pour ce commerce de Dakar.

Produit : ${i.produit.nom} — ${i.produit.resume}
Arguments : ${i.produit.arguments.join(' ; ')}
Commerce : ${i.place.nom} (${METIERS[i.place.metier].label}${i.place.quartier ? `, ${i.place.quartier}` : ''})
Manques constatés : ${i.manques.length ? i.manques.join(' ; ') : 'aucun en particulier'}

Règles :
- français simple et chaleureux, vouvoiement, 450 caractères au plus
- ${i.salutationWolof ? 'commence par « Salaam aleekum »' : 'commence par « Bonjour »'}
- cite UN seul manque, s'il y en a, et relie-le à un argument du produit
- écris le jeton {LIEN} tel quel, à l'endroit où mettre le lien vers le produit
- pas de série d'émojis, aucune promesse chiffrée inventée
- n'ajoute pas de phrase de désinscription (elle est ajoutée automatiquement)`;
}
