import { METIERS, METIER_KEYS, type MetierKey } from '@/lib/domain/metiers';
import type { AiProvider } from './provider';

/** Mots-clés (sans accents, en minuscules) qui trahissent chaque métier client. */
const INDICES: Record<MetierKey, string[]> = {
  coiffure: ['coiffure', 'coiffeur', 'salon', 'barbier', 'beaute', 'tresse'],
  lavage_auto: ['lavage', 'car wash', 'nettoyage auto'],
  garage: ['garage', 'mecanique', 'mecanicien', 'reparation auto'],
  immobilier: ['immobilier', 'agence', 'loyer', 'locataire', 'appartement'],
  restaurant: ['restaurant', 'resto', 'cuisine', 'menu'],
  hotel: ['hotel', 'chambre', 'hebergement', 'meuble'],
  pharmacie: ['pharmacie'],
  clinique: ['clinique', 'medecin', 'dentiste', 'medical', 'sante'],
  ecole: ['ecole', 'eleve', 'enseignant', 'scolaire'],
  boutique: ['boutique', 'vetement', 'e-commerce', 'commande en ligne'],
  salle_sport: ['fitness', 'salle de sport', 'gym'],
};

const sansAccents = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();

/** IA déterministe pour les tests et le développement sans clé (AI_FAKE=1). */
export class FakeAi implements AiProvider {
  async analyserProduit(i: Parameters<AiProvider['analyserProduit']>[0]) {
    const corpus = sansAccents(
      [i.page.titre, i.page.description, i.page.texte, i.descriptionManuelle].filter(Boolean).join(' '),
    );
    const metiers = METIER_KEYS.filter((k) => INDICES[k].some((mot) => corpus.includes(mot)));
    const nom = i.page.titre ?? new URL(i.url).hostname;
    return {
      nom,
      resume: (i.descriptionManuelle ?? i.page.description ?? i.page.texte).slice(0, 160) || nom,
      metiers: metiers.length ? metiers : (['boutique'] as MetierKey[]),
      arguments: ['Gain de temps au quotidien', 'Clients mieux servis', 'Prise en main rapide'],
      prix: null,
    };
  }

  async expliquerProspect(i: Parameters<AiProvider['expliquerProspect']>[0]) {
    const raisons = i.score.parts.flatMap((p) => p.raisons).slice(0, 3).join(', ');
    return { pourquoi: `${i.place.nom} : ${raisons}.` };
  }

  async ecrireMessage(i: Parameters<AiProvider['ecrireMessage']>[0]) {
    const salut = i.salutationWolof ? 'Salaam aleekum' : 'Bonjour';
    const manque = i.manques[0] ? ` Nous avons remarqué : ${i.manques[0].toLowerCase()}.` : '';
    return {
      texte: `${salut} ${i.place.nom},${manque} ${i.produit.nom} aide les ${METIERS[i.place.metier].label.toLowerCase()} à Dakar : ${i.produit.resume} Découvrez-le ici : {LIEN}`,
    };
  }
}
