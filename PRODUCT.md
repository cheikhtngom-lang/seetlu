# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Aujourd'hui :** une seule personne. Elle édite plusieurs SaaS au Sénégal (Lavage Auto, file d'attente des salons, GestionImmo, Mécanique, Racaha Store…) et cherche des commerces à qui les vendre.
- **Où :** surtout **au bureau, sur ordinateur** (confirmé). Le téléphone est secondaire, mais l'outil doit rester utilisable à 375 px. La capture terrain par photo arrive en phase 3.
- **Plus tard :** d'autres éditeurs de SaaS et des boutiques en ligne, chacun dans son espace.

## Product Purpose

Seetlu analyse, prospecte et prépare des clients à contacter.
- On colle le lien d'un produit. L'outil en déduit les métiers cibles, récolte les commerces d'une zone sur une carte et note chacun sur 100 avec des raisons visibles.
- Il rédige un message WhatsApp ou mail prêt à envoyer. **L'utilisateur envoie lui-même** : l'outil n'envoie rien automatiquement.
- Il suit les relances et la visite du lien suivi. En phase 2, il remplace aussi Google Analytics sur les sites de l'utilisateur.

**Succès :** passer du lien d'un produit à 20 messages prêts en moins de 10 minutes, et savoir quel commerce appeler en premier, et pourquoi.

## Positioning

- **Fait pour l'Afrique de l'Ouest.** Les commerces y ont rarement un site : ils sont sur WhatsApp, Facebook et Google Maps. Le score juge donc toute la présence en ligne, pas seulement un site web.
- **Trouve des prospects même là où les bases de données sont pauvres :** OpenStreetMap, Overture Maps, photo d'enseigne, lien collé.
- **Relie la prospection au trafic.** Le lien suivi signale quand un prospect contacté ouvre le site du produit.

## Operating Context

- Données publiques de commerces de Dakar et du Sénégal : quartiers (Plateau, Médina, Parcelles, Almadies, Pikine…), numéros +221 (mobiles 70/75/76/77/78, fixes 33).
- Le WhatsApp de l'utilisateur sert de canal d'envoi, via des liens `wa.me` préremplis.
- Connexions lentes possibles (3G/4G), donc des pages légères.

## Capabilities and Constraints

- **Budget zéro :** Supabase, Netlify, Gemini, OpenFreeMap et PageSpeed en offre gratuite. Ni Google Places ni aspiration de sites tiers.
- **Loi sénégalaise 2008-12 (CDP) :**
  - données professionnelles publiques seulement ;
  - phrase STOP à la fin de chaque message ;
  - « Oublier ce commerce » efface la fiche définitivement ;
  - les téléphones et mails désinscrits sont bloqués.
- **Langue :** interface en français, montants en FCFA.
- **Termes du produit :** produit, récolte, zone, quartier, prospect, fiche, score d'opportunité, priorité (premier / ensuite / plus tard), statut (à contacter, contacté, a répondu, démo, client, perdu, ne plus contacter), relance (J+3, J+7), lien suivi, désinscrit.
- **Pile technique :** Next.js 16, React 19, Tailwind v4, Supabase, MapLibre (v6), Gemini.

## Brand Commitments

- **Nom :** Seetlu, définitif (confirmé). En wolof, il veut dire « observer attentivement ».
- **Ton :** vouvoiement (confirmé). Français simple et direct, sans jargon marketing.
- **Rendu :** l'utilisateur ne veut pas d'une interface qui « a l'air faite par une IA ». Il cite comme références les meilleurs tableaux de bord du monde, la clarté de react.dev, et anime.js pour la future landing page.
- Pas de logo existant.

## Evidence on Hand

- Vidéo de référence : `Downloads\tik tok video\WhatsApp Video 2026-11-20 at 18.44.27.mp4` (« Blean Prospect »).
- Chiffres OpenStreetMap à Dakar (21/11/2026) : 188 coiffeurs (12 avec téléphone, 0 site), 33 lavages auto (3 téléphones).
- Aucun client, aucun témoignage, aucun chiffre d'usage, aucun prix : ne rien inventer.

## Product Principles

1. **Expliquer avant de classer :** chaque score montre ses raisons. L'utilisateur doit pouvoir dire pourquoi il appelle ce commerce.
2. **Préparer, jamais envoyer à sa place :** l'humain garde le dernier geste.
3. **Marcher sans IA :** listes, scores et fiches fonctionnent même quand le quota gratuit est épuisé.
4. **Respecter le prospect :** des données publiques seulement, et un STOP qui marche vraiment.
5. **Léger et rapide en Afrique de l'Ouest :** pas de page lourde, pas de dépendance payante.
