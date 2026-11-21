# Seetlu — document de conception

*Nom provisoire : « seetlu » veut dire « observer attentivement » en wolof. L'utilisateur peut le changer.*
*Date : 21/11/2026. Statut : brouillon, à valider.*

---

## 1. Intention et pourquoi

L'utilisateur crée et vend plusieurs SaaS au Sénégal : Lavage Auto, file d'attente des salons, GestionImmo, Mécanique, Racaha Store, etc. Il passe du temps à chercher des clients à la main. Il veut un outil qui **analyse, prospecte et lui prépare des clients à contacter**, à sa place.

L'idée vient d'une vidéo TikTok de référence (« Blean Prospect », @bleanlab) :
- on choisit une ville et une zone sur une carte ;
- l'outil scanne les commerces par métier (garages, coiffeurs, restaurants) ;
- il les met en liste ;
- chaque fiche a un audit du site (SEO, vitesse), un score d'opportunité calculé par une IA, et le téléphone et le mail.

L'utilisateur veut aller plus loin :
1. **Partir de ses propres produits.** Il colle le lien d'un de ses sites. L'outil comprend l'offre et trouve les commerces à qui la vendre.
2. **Remplacer Google Analytics** sur ses sites.
3. **Faire quelque chose de jamais vu en Afrique**, avec une interface qui n'a pas l'air faite par une IA.
4. **Plus tard**, vendre l'outil à d'autres SaaS et boutiques en ligne (multi-clients).

**Constat qui change la conception.** Le 21/11, j'ai interrogé OpenStreetMap sur Dakar :

| Métier | Nombre | Avec téléphone | Avec site web |
|---|---|---|---|
| Coiffeurs | 188 | 12 | 0 |
| Lavages auto | 33 | 3 | 0 |
| Garages | 55 | 6 | 3 |
| Agences immobilières | 24 | 4 | 1 |
| Restaurants | 593 | 104 | 41 |

Au Sénégal, les commerces n'ont presque jamais de site. Ils sont présents sur WhatsApp, Facebook, Instagram et Google Maps. L'audit « site web » de la vidéo ne suffit donc pas. Seetlu évalue **toute la présence en ligne** d'un commerce et sait **trouver des prospects sans base de données riche** (photo d'enseigne, lien collé).

## 2. Pour qui

- **Version 1 :** l'utilisateur seul, pour vendre ses propres produits. Une seule personne, plusieurs produits.
- **Plus tard :** d'autres éditeurs de SaaS et des boutiques en ligne, chacun dans son espace (« workspace »). Le modèle de données est multi-clients dès la version 1, même si une seule personne s'en sert.

## 3. Objectifs, non-objectifs, anti-objectifs

**Objectifs (version 1)**
- Passer du lien d'un produit à 20 messages de prospection prêts à envoyer, en moins de 10 minutes.
- Savoir quel prospect contacter en premier, et pourquoi, en une phrase.
- Voir le trafic de chaque site de l'utilisateur sans Google Analytics.
- Être prévenu quand un prospect contacté ouvre le site du produit.

**Non-objectifs (version 1)**
- Pas d'envoi automatique de messages. L'outil prépare, l'utilisateur envoie.
- Pas d'abonnement payant ni de facturation : cela viendra avec le multi-clients.
- Pas d'application mobile native : une web app adaptée au téléphone suffit.

**Anti-objectifs (c'est un échec même si ça marche)**
- Un rendu générique « fait par IA » : dégradés violets, cartes identiques, icônes partout, textes creux.
- Un coût : tout doit tenir dans des offres gratuites, sans carte bancaire.
- Récupérer des données en violant les conditions d'un service. Pas d'aspiration (scraping) de Google Maps, Facebook ou Instagram.
- Un compte WhatsApp bloqué ou une plainte à la CDP à cause de l'outil.
- Un outil lent ou illisible sur un téléphone en 3G/4G à Dakar.

## 4. Contraintes

**Budget : zéro.** L'utilisateur a refusé Google Places parce que c'est payant. Chaque service utilisé doit avoir une offre gratuite sans carte bancaire :

| Besoin | Service | Remarque |
|---|---|---|
| Base de données, connexion, fichiers, tâches planifiées | Supabase (offre gratuite) | 500 Mo de base. Le projet se met en pause après 7 jours sans activité. 2 projets gratuits actifs au maximum par compte. |
| Hébergement de l'app | Netlify (offre gratuite) | Usage commercial autorisé. Pas l'offre gratuite de Vercel, qui l'interdit. |
| IA (texte et photo) | Gemini, offre gratuite de Google AI Studio | Limites par minute et par jour. Google peut utiliser les données envoyées pour améliorer ses produits : on n'envoie que des données publiques de commerces. |
| Fonds de carte | OpenFreeMap + MapLibre GL | Gratuit, sans clé, usage commercial autorisé. Pas les tuiles de tile.openstreetmap.org, interdites en usage intensif. |
| Vitesse des sites | API PageSpeed Insights de Google | Gratuite. |
| Mails d'alerte | Resend (offre gratuite) | L'utilisateur l'utilise déjà dans Antigravity. |

Les quotas sont à revérifier au moment du build : ils changent souvent.

**Loi.** Loi sénégalaise n° 2008-12 sur les données personnelles, contrôlée par la CDP.
- On ne garde que des données professionnelles publiques : nom du commerce, téléphone affiché, lien de page.
- Chaque message préparé contient une phrase pour ne plus être contacté.
- Un prospect peut être effacé définitivement (bouton « Oublier ce commerce »).
- Le script de suivi des sites ne pose aucun cookie et ne garde aucune adresse IP.

**Licences des données.**
- OpenStreetMap (ODbL) : afficher « © contributeurs OpenStreetMap ».
- Overture Maps : afficher l'attribution Overture.

**PC de développement.** La stratégie de sécurité de SEGEA bloque les modules compilés lancés depuis le dossier temporaire, et le pare-feu bloque Node vers Amazon S3. Les gros traitements de données (import Overture) tournent donc sur un serveur, pas sur le PC.

**Langue et marché.**
- Interface en français, montants en FCFA, numéros au format +221.
- Mobiles sénégalais : préfixes 70, 75, 76, 77, 78. Fixes : 33.

**Outils habituels de l'utilisateur.** Next.js / React, Supabase, anime.js, Motion, Leaflet, Tailwind. On les reprend.

## 5. Approches étudiées

| Approche | Avantages | Inconvénients | Décision |
|---|---|---|---|
| **A. Une seule app Next.js + Supabase**, tâches longues dans les Edge Functions de Supabase | Gratuit, outils habituels, multi-clients avec les règles d'accès Postgres (RLS) | Les tâches longues doivent être découpées en petits lots | **Retenue** |
| B. App Next.js + serveur séparé (VPS) pour les tâches | Tâches longues sans limite, navigateur sans tête possible pour les audits | Les VPS « gratuits » (Oracle) demandent une carte bancaire ; plus de maintenance | Rejetée (budget) |
| C. Outils sans code (n8n, Retool) + Supabase | Très rapide à monter | Rendu générique, impossible à revendre comme produit | Rejetée (anti-objectifs) |
| Source de données Google Places | Meilleure couverture à Dakar | Payant | **Refusée par l'utilisateur** |
| IA locale (Qwen3 via Ollama, comme la vidéo) | Gratuit, privé | Pas d'Ollama, carte graphique MX570 2 Go trop faible, impossible en multi-clients | Rejetée |

## 6. Décisions de l'utilisateur

- **L'outil prépare, l'utilisateur envoie.** Un clic ouvre WhatsApp (`https://wa.me/221XXXXXXXXX?text=…`) ou le mail avec le message rempli.
- **Gratuit uniquement**, pas de Google Places.
- Le projet vit dans `Gestion Saas\Seetlu`.
- **Références visuelles :** les meilleurs tableaux de bord du monde, react.dev pour la clarté, anime.js pour la landing page. Utiliser les skills de design installés (impeccable, taste-skill, emil-design-eng, animate, dataviz) pour éviter le rendu « IA ».
- **Objectif à terme :** outil multi-clients pour SaaS et e-commerce.

## 7. Ce que fait le produit

### 7.1 Mes produits

- L'utilisateur colle l'URL d'un de ses sites.
- Seetlu télécharge la page (HTML, titre, méta, textes visibles). L'IA en tire une fiche :
  - ce que vend le produit, en une phrase ;
  - les **métiers cibles**, convertis en étiquettes OpenStreetMap et en catégories Overture (ex. salon → `shop=hairdresser`, `shop=beauty`, `hair_salon`, `barber`) ;
  - les 3 arguments clés ;
  - le prix s'il est visible.
- L'utilisateur peut tout corriger.
- Chaque produit reçoit un identifiant de suivi pour le script d'analytics (7.7).

### 7.2 Carte et récolte

- Carte MapLibre avec les tuiles OpenFreeMap. On trace une zone (cercle ou polygone), ou on choisit un quartier dans une liste (Plateau, Médina, Parcelles, Almadies, Pikine, Guédiawaye, Rufisque, Thiès…).
- On coche les métiers, préremplis par le produit choisi, puis on clique sur « Récolter ».
- **Sources gratuites :**
  1. **OpenStreetMap**, via l'API Overpass, en direct.
  2. **Overture Maps** (places) : importé une fois par mois sur le serveur, pour le Sénégal et les catégories utiles. Contient téléphones, sites et liens de réseaux sociaux. Couverture à Dakar **non encore mesurée** : à mesurer en premier lors du build.
  3. **Photo d'enseigne** (7.8).
  4. **Lien collé** (7.9).
  5. **Import CSV.**
- **Doublons :** fusion si les noms se ressemblent et sont à moins de 50 m, ou si le téléphone normalisé (+221) est le même. On garde la trace de chaque source.
- Les marqueurs sont regroupés en grappes avec leur nombre, comme dans la vidéo.

### 7.3 Prospects

- Tableau filtrable : métier, quartier, score, statut, produit, source, a un téléphone ou non.
- **Statuts :** à contacter → contacté → a répondu → démo → client / perdu / ne plus contacter.
- Un même commerce peut être prospect pour plusieurs produits. Exemple : un garage qui lave aussi des voitures intéresse Mécanique et Lavage Auto.

### 7.4 Fiche prospect et score

**Audit de présence en ligne** (seulement ce qu'on peut vérifier gratuitement et légalement) :
- **Téléphone :** présent ou non, mobile ou fixe. Un mobile est probablement joignable sur WhatsApp : c'est une indication, pas une vérification.
- **Site :** existe ou non. S'il existe : HTTPS, adapté au mobile, titre et méta, score PageSpeed, date du copyright si visible.
- **Réseaux :** pages Facebook ou Instagram connues, venant d'Overture ou ajoutées à la main.
- **Google Maps :** lien de recherche construit (nom + coordonnées), pour que l'utilisateur vérifie d'un clic. Aucune lecture automatique de Google.

**Score d'opportunité de 0 à 100**, calculé par des **règles visibles**, sans IA, pour marcher même quand le quota IA est épuisé :
- adéquation entre le métier et le produit ;
- manques en ligne (pas de site, pas de prise de rendez-vous, etc.) ;
- joignabilité (mobile = plus) ;
- distance à la zone visée.

Le détail du calcul s'affiche sur la fiche.

**L'IA ajoute :** deux lignes « pourquoi le contacter maintenant », et une recommandation « à contacter en premier / plus tard ».

### 7.5 Message préparé

- L'IA écrit un message court en français, adapté au commerce et au produit. Il commence par une salutation chaleureuse, avec possibilité de formule en wolof. Il contient un argument lié à un manque constaté, un **lien suivi** et une phrase de désinscription.
- **Boutons :** « Ouvrir WhatsApp », « Ouvrir le mail », « Copier ».
- Après le clic, l'outil demande « Message envoyé ? » et passe le statut à « contacté ».
- **Relances :** un rappel dans l'outil à J+3 et J+7, sans envoi automatique.

### 7.6 Lien suivi

- Chaque message contient un lien court propre au prospect : `/r/{code}`. Il redirige vers le site du produit avec `?sl={code}`.
- Le script d'analytics (7.7) lit ce code et rattache la visite au prospect.
- **Alerte :** « Salon Awa vient d'ouvrir votre page tarifs », dans l'outil et par mail (Resend).
- Ces prospects passent en tête de la liste « Prospects chauds ».

### 7.7 Analytics (à la place de Google Analytics)

- Script d'environ 2 Ko à coller sur chaque site : `<script defer src="…/s.js" data-site="ID"></script>`.
- **Sans cookie.** Un visiteur est compté grâce à une empreinte quotidienne (IP + navigateur + sel changé chaque jour, hachés). L'IP n'est jamais stockée. Même principe que Plausible.
- **Mesure :** pages vues, visiteurs, sources (référent, UTM, lien suivi), appareil, pays, durée approximative, et événements personnalisés (`seetlu('signup')`).
- **Tableau de bord par site :** courbes, pages les plus vues, sources, entonnoir vers l'inscription, temps réel.
- **Collecte :** une Edge Function Supabase. Le quota gratuit (environ 500 000 appels par mois, à vérifier) limite la v1 à quelques centaines de milliers d'événements par mois, tous sites confondus. C'est suffisant pour commencer.
- Le script est installé sur les sites de l'utilisateur par lui ou par Claude, dans les projets de `Gestion Saas`.

### 7.8 Terrain : photo d'enseigne

- Une page adaptée au téléphone, installable comme une app (PWA). On prend une photo de la devanture.
- L'IA (Gemini, qui lit les images) extrait le nom, le téléphone et le métier. Le GPS du téléphone donne la position. L'utilisateur confirme et la fiche est créée.
- C'est la réponse au manque de données en Afrique, et ce qu'on ne voit pas ailleurs.

### 7.9 Lien collé

- **Lien Google Maps :** on lit le nom et les coordonnées **dans l'URL elle-même** (`/place/Nom/@lat,lng`). On ne télécharge pas la page Google.
- **Lien Facebook ou Instagram :** enregistré comme réseau du prospect. Le nom vient de l'adresse et l'utilisateur complète.

### 7.10 Tableau de bord d'accueil

Inspiré de la vidéo, en mieux :
- meilleure recommandation du jour ;
- nombre de prospects par statut ;
- carte de chaleur de la zone ;
- « À contacter en premier » ;
- prospects chauds (ont ouvert le lien) ;
- activité récente ;
- trafic des sites sur 7 jours.

### 7.11 Landing page publique

- Présente Seetlu comme futur produit, avec une liste d'attente.
- Animations anime.js, entrées et défilement soignés, dans l'esprit de clarté de react.dev.
- Elle sert aussi de démo du script d'analytics, installé sur elle-même.

## 8. Architecture

```
Navigateur / téléphone (Next.js App Router, React, TypeScript)
   │  pages : landing, app (tableau de bord, carte, prospects, fiche, produits, analytics, terrain)
   ▼
Netlify (gratuit) ── routes serveur Next.js : actions courtes (créer, modifier, lancer une tâche)
   │
   ▼
Supabase (gratuit)
   ├─ Postgres + RLS (tout porte un workspace_id)
   ├─ Auth (lien magique par mail)
   ├─ Storage (photos d'enseignes)
   ├─ Edge Functions : collect (analytics), r (redirection du lien suivi), worker (tâches)
   └─ pg_cron : appelle « worker » chaque minute ; garde le projet éveillé
         │
         ▼
   Services externes gratuits : Overpass (OSM), PageSpeed Insights, Gemini, Resend

Import Overture mensuel : GitHub Actions (gratuit) → client overturemaps → catégories utiles du Sénégal → Supabase
```

- **File de tâches :** une table `jobs` (type, données, statut, essais, prochain essai). Le worker traite de petits lots, en respectant les limites de Gemini et d'Overpass. Types de tâches : récolter une zone, auditer un prospect, rédiger un message, résumer un produit, lire une photo, recalculer les cumuls d'analytics.
- **IA remplaçable :** une seule interface (`ai.resumerProduit`, `ai.expliquerScore`, `ai.ecrireMessage`, `ai.lireEnseigne`). Gemini en v1. On pourra passer à un modèle payant pour les clients payants.

## 9. Modèle de données (esquisse)

- `workspaces`, `members`
- `products` : url, nom, résumé, cibles (étiquettes OSM, catégories Overture), arguments, `tracking_site_id`
- `places` : source(s), id de source, nom, métier, lat, lng, téléphone normalisé, site, réseaux, adresse, quartier
- `zones`, `harvests` : zone tracée, métiers, produit, compteurs
- `prospects` : (workspace, produit, place) unique ; score, détail du score, raison IA, statut, notes, dernier contact, prochaine relance
- `audits` : prospect, vérifications (JSON), PageSpeed, date
- `messages` : prospect, texte, canal, code de lien suivi, envoyé le
- `tracked_links` : code, prospect, produit, clics, première visite
- `analytics_events` : site, horodatage, chemin, référent, UTM, appareil, pays, empreinte du jour, code suivi, nom d'événement
- `analytics_daily` : cumuls par jour, pour des graphiques rapides et une base légère
- `alerts`, `jobs`, `opt_outs` : téléphones ou mails à ne plus contacter, vérifiés avant chaque message

Les événements bruts de plus de 90 jours sont supprimés : seuls les cumuls restent, pour tenir dans les 500 Mo.

## 10. Phases

1. **Socle prospection :**
   - produits par lien ;
   - carte et récolte OpenStreetMap ;
   - prospects, fiche, score par règles ;
   - message IA et bouton WhatsApp ;
   - suivi des statuts et tableau de bord.
2. **Analytics et lien suivi :**
   - script `s.js` et collecte ;
   - tableau de bord des sites ;
   - redirection `/r/{code}` ;
   - alertes « prospect chaud » ;
   - installation du script sur les sites de l'utilisateur.
3. **Données africaines :**
   - import Overture (mesurer d'abord la couverture de Dakar) ;
   - photo d'enseigne ;
   - lien collé ;
   - import CSV.
4. **Landing page et ouverture multi-clients :**
   - landing animée et liste d'attente ;
   - inscription d'autres espaces.

## 11. Laissé au constructeur

- Bibliothèque de composants et de graphiques. Le résultat doit passer les skills de design (impeccable, taste-skill, dataviz) sans rendu générique.
- Poids exacts du score, à condition qu'ils restent visibles et réglables.
- Style de la carte, palette, typographie.
- Découpage exact des Edge Functions et des routes Next.js.
- Format du sel quotidien et de l'empreinte d'analytics, à condition de ne garder ni IP ni cookie.

## 12. Prérequis (comptes que l'utilisateur crée lui-même)

Claude ne crée pas de compte et ne saisit aucune clé à la place de l'utilisateur.

- **Supabase :** un projet pour Seetlu. Voir la question ouverte 1.
- **Google AI Studio :** une clé API Gemini, gratuite, sans carte.
- **Netlify :** un compte gratuit, relié au dépôt.
- **GitHub :** un dépôt privé pour Seetlu, et GitHub Actions pour l'import mensuel d'Overture.
- **Resend :** clé déjà utilisée dans Antigravity, réutilisable si l'utilisateur le souhaite.

## 13. Choix faits par Claude pendant la relecture (à corriger si besoin)

- **Connexion par lien magique.** Les mails partent par Resend en SMTP, car le serveur de mail intégré de Supabase n'envoie que quelques mails par heure.
- **Adresse de départ :** un sous-domaine gratuit `*.netlify.app`. Un nom de domaine pourra être branché plus tard sans rien changer au code. Seul le script d'analytics devra être recollé.
- **Données de test :** le premier produit ajouté sert à régler le score. L'utilisateur choisit lequel.

## 14. Questions ouvertes (à l'utilisateur)

1. **Place Supabase.** L'offre gratuite limite à 2 projets actifs. Lavage Auto, Racaha Store, SEGEA 2026 et Antigravity utilisent déjà Supabase. L'utilisateur ne sait pas s'il reste une place.
   - **Choix de Claude :** à vérifier au début du build, dans le tableau de bord Supabase.
   - **Sans place libre :** mettre en pause un projet gratuit inactif. Il reste restaurable. L'utilisateur choisit lequel.
   - **À éviter :** partager la base d'une autre app, car ses utilisateurs et ses règles d'accès se mélangeraient.
2. **Ordre de la landing page.** L'utilisateur n'a pas tranché. **Choix de Claude :** phase 4, car l'outil doit d'abord servir à l'utilisateur. Elle peut remonter avant la phase 2 sans rien changer au reste.
