# Seetlu — Phase 1 : socle de prospection — plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Objectif :** l'utilisateur colle le lien d'un de ses produits, récolte les commerces d'une zone de Dakar sur une carte, voit un score expliqué pour chacun et ouvre WhatsApp avec un message prêt.

**Architecture :**
- Une app Next.js (App Router, TypeScript) hébergée sur Netlify, avec Supabase pour la base, la connexion et les règles d'accès (RLS).
- La logique métier est pure et testée, dans `src/lib/domain/`.
- Les appels longs ou limités par un quota (Overpass, PageSpeed) partent **du navigateur**. Les appels IA (Gemini) passent par des routes courtes, une par action. Aucune tâche de fond en phase 1.

**Pile technique :** Next.js (dernière version stable, ≥ 15), React, TypeScript strict, Tailwind CSS v4, Supabase (`@supabase/supabase-js`, `@supabase/ssr`), `@google/genai`, `zod`, `maplibre-gl` (v5) avec les tuiles OpenFreeMap, `@tanstack/react-table`, `motion`, `node-html-parser`, Vitest.

**Spec :** `docs/superpowers/specs/2026-11-21-seetlu-design.md` (sections 4 à 10, phase 1).

**Écart assumé par rapport à la spec (§8, file `jobs` + pg_cron) :**
- L'offre gratuite de Netlify coupe une fonction après environ 10 s.
- Overpass et PageSpeed peuvent dépasser ce délai. Ils sont donc appelés par le navigateur, qui n'a pas de limite (les deux API acceptent CORS).
- Les appels IA sont faits un par un depuis le client, avec une attente entre deux appels.
- La table `jobs` et pg_cron arrivent en phase 2 (analytics), où ils sont nécessaires.

## Contraintes globales

- **Coût :** aucun service payant, aucune carte bancaire. Pas de Google Places, pas d'aspiration de Google Maps, Facebook ou Instagram.
- **Langue et formats :** interface entièrement en français, montants en FCFA, numéros stockés au format E.164 `+221XXXXXXXXX`.
- **Préfixes sénégalais :** mobiles = 70, 75, 76, 77, 78 ; fixes = 33.
- **Doublons :** deux lieux sont le même si leur téléphone normalisé est identique, ou si leurs noms sont similaires (≥ 0,8) et qu'ils sont à ≤ 50 m.
- **Statuts de prospect :** `a_contacter`, `contacte`, `a_repondu`, `demo`, `client`, `perdu`, `ne_plus_contacter`.
- **Relances :** J+3 et J+7 après l'envoi, jamais envoyées automatiquement.
- **Envoi :** l'outil prépare, l'utilisateur envoie. Aucun envoi automatique.
- **Désinscription :** chaque message se termine par `PHRASE_STOP` (tâche 6). Un téléphone présent dans `opt_outs` ne reçoit jamais de message préparé.
- **Fonds de carte :** style `https://tiles.openfreemap.org/styles/positron`. Attribution « © contributeurs OpenStreetMap » toujours visible sur la carte.
- **IA :** modèle lu dans `GEMINI_MODEL`, clé lue dans `GEMINI_API_KEY`. On n'envoie à Gemini que des données publiques de commerces. Avec `AI_FAKE=1`, une IA factice déterministe remplace Gemini (tests et dev sans clé).
- **Design :** toute tâche d'interface charge d'abord les skills `impeccable` et `emil-design-eng`, et `dataviz` pour les graphiques. Le résultat ne doit pas avoir l'air fait par une IA : pas de dégradé violet, pas de grille de cartes identiques, pas d'icône décorative sur chaque titre.
- **Mobile :** chaque écran est utilisable à 375 px de large.
- **Secrets :** l'utilisateur remplit lui-même `.env.local` et les variables Netlify. Claude ne saisit aucune clé.
- **Commits :** chaque étape « Commit » demande l'accord de l'utilisateur avant de s'exécuter.

## Points de vigilance (relecture)

Ces cinq cas ne sont pas couverts par les tests principaux et toucheraient l'utilisateur en premier :

1. **Overpass saturé ou en erreur** (déjà observé : « server too busy »). Le client essaie le serveur miroir, puis affiche « Serveur de cartes saturé, réessayez dans une minute ». Une récolte relancée ne crée pas de doublons. Tests : tâche 3 (`executerOverpass`) et tâche 4 (`planifierImport`).
2. **Quota Gemini épuisé (erreur 429).** Listes, scores et fiches marchent toujours. Le rédacteur de message affiche le délai et permet d'écrire le message à la main. Test : tâche 9 (`mapperErreurGemini`).
3. **Site produit sans texte**, comme les apps React/Vite de l'utilisateur (Lavage Auto), qui renvoient un HTML presque vide. L'outil demande une description de 2 phrases au lieu d'inventer. Test : tâche 7 (`besoinDescriptionManuelle`).
4. **Téléphones mal formés :** plusieurs numéros dans un champ, séparateurs variés, numéro étranger. On choisit le premier mobile sénégalais valide et on garde le texte brut. Tests : tâche 2.
5. **Commerce désinscrit puis récolté à nouveau** depuis une autre source : il reste bloqué, car le blocage se vérifie sur le téléphone, pas sur la fiche. Test : tâche 6 (`estBloque`).

---

## Structure des fichiers

```
Seetlu/
  package.json  next.config.ts  tsconfig.json  vitest.config.ts  netlify.toml  .env.example  DESIGN.md
  supabase/migrations/0001_schema.sql   0002_rls.sql
  src/lib/domain/      logique pure, testée
    metiers.ts  phone.ts  overpass.ts  geo.ts  dedupe.ts  score.ts  html-audit.ts  message.ts  quartiers.ts
  src/lib/ai/          provider.ts  gemini.ts  fake.ts  schemas.ts  prompts.ts
  src/lib/supabase/    server.ts  browser.ts  middleware.ts  admin.ts  database.types.ts
  src/lib/data/        accès base côté serveur : products.ts  harvests.ts  prospects.ts  messages.ts
  src/middleware.ts
  src/app/             layout.tsx  globals.css  page.tsx (redirection)
    connexion/page.tsx  auth/callback/route.ts
    app/layout.tsx (coque : barre latérale)  app/page.tsx (tableau de bord)
    app/produits/page.tsx  app/produits/nouveau/page.tsx  app/produits/[id]/page.tsx
    app/carte/page.tsx  app/prospects/page.tsx  app/prospects/[id]/page.tsx
    api/produits/analyse/route.ts  api/recoltes/route.ts
    api/prospects/[id]/audit/route.ts  api/prospects/[id]/pourquoi/route.ts
    api/prospects/[id]/message/route.ts  api/prospects/[id]/statut/route.ts  api/prospects/[id]/oublier/route.ts
    r/[code]/route.ts
  src/components/ui/   composants de base (bouton, champ, badge, tableau, panneau)
  src/features/        carte/  prospects/  fiche/  message/  tableau-de-bord/
  tests/domain/*.test.ts   tests/ai/*.test.ts
```

---

### Tâche 1 : Créer le projet et le banc de tests

**Fichiers :**
- Créer : le projet entier via `create-next-app`, plus `vitest.config.ts`, `.env.example`, `netlify.toml`
- Test : `tests/domain/smoke.test.ts`

**Interfaces :**
- Produit : l'alias `@/` vers `src/` (dans Next et dans Vitest), et les scripts npm `dev`, `build`, `test`, `lint`.

- [ ] **Étape 1 : créer le projet**
  - Dans `C:\Users\SEGEASA\OneDrive - SEGEA SA\Bureau\Gestion Saas\Seetlu`, garder le dossier `docs/` existant.
  - Lancer `npx create-next-app@latest . --ts --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm`.
  - Puis `git init`.
- [ ] **Étape 2 : installer les dépendances**
  - Lancer `npm i @supabase/supabase-js @supabase/ssr @google/genai zod maplibre-gl @tanstack/react-table motion node-html-parser`.
  - Puis `npm i -D vitest @vitest/coverage-v8 vite-tsconfig-paths tsx`.
- [ ] **Étape 3 : configurer**
  - `vitest.config.ts` : environnement `node`, plugin `vite-tsconfig-paths`, `include: ['tests/**/*.test.ts']`.
  - Script `"test": "vitest run"`.
  - `.env.example` contient : `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_APP_URL`, `GEMINI_API_KEY`, `GEMINI_MODEL`, `AI_FAKE`, `AI_INTERVALLE_MS=6000`.
  - `netlify.toml` : `[build] command = "npm run build"`, `publish = ".next"`.
  - `.gitignore` contient `.env*.local`.
- [ ] **Étape 4 : écrire le test de fumée** `tests/domain/smoke.test.ts` : `expect(1 + 1).toBe(2)`.
- [ ] **Étape 5 : vérifier**
  - `npm test` : 1 test passe.
  - `npm run build` : la compilation réussit.
  - Si le contrôle d'application du PC bloque le binaire natif de Next (SWC) ou de Vitest (esbuild/rollup) : s'arrêter et le signaler à l'utilisateur. Ne pas contourner.
- [ ] **Étape 6 : commit** `chore: créer le projet Seetlu (Next.js + Vitest)`

### Tâche 2 : Métiers et téléphones

**Fichiers :**
- Créer : `src/lib/domain/metiers.ts`, `src/lib/domain/phone.ts`
- Test : `tests/domain/metiers.test.ts`, `tests/domain/phone.test.ts`

**Interfaces :**
- Produit :
  ```ts
  export type MetierKey = 'coiffure'|'lavage_auto'|'garage'|'immobilier'|'restaurant'|'hotel'|'pharmacie'|'clinique'|'ecole'|'boutique'|'salle_sport';
  export const METIERS: Record<MetierKey, { label: string; osm: Array<[cle: string, valeur: string]>; overture: string[] }>;
  export function metierDepuisTags(tags: Record<string, string>): MetierKey | null;
  export type TelephoneNormalise = { e164: string; type: 'mobile' | 'fixe' };
  export function normaliserTelephone(brut: string | null | undefined): TelephoneNormalise | null;
  ```
- Valeurs OSM de `METIERS` :

  | Métier | Étiquettes OSM |
  |---|---|
  | coiffure | `shop=hairdresser`, `shop=beauty` |
  | lavage_auto | `amenity=car_wash` |
  | garage | `shop=car_repair`, `shop=tyres` |
  | immobilier | `office=estate_agent` |
  | restaurant | `amenity=restaurant`, `amenity=fast_food` |
  | hotel | `tourism=hotel`, `tourism=guest_house` |
  | pharmacie | `amenity=pharmacy` |
  | clinique | `amenity=clinic`, `amenity=doctors`, `amenity=dentist` |
  | ecole | `amenity=school`, `amenity=kindergarten` |
  | boutique | `shop=clothes`, `shop=boutique` |
  | salle_sport | `leisure=fitness_centre` |

  Le champ `overture` reste vide (`[]`) jusqu'à la phase 3.

- [ ] **Étape 1 : écrire les tests qui doivent échouer**
  ```ts
  expect(metierDepuisTags({ shop: 'hairdresser', name: 'X' })).toBe('coiffure');
  expect(metierDepuisTags({ amenity: 'car_wash' })).toBe('lavage_auto');
  expect(metierDepuisTags({ shop: 'bakery' })).toBeNull();
  expect(normaliserTelephone('77 123 45 67')).toEqual({ e164: '+221771234567', type: 'mobile' });
  expect(normaliserTelephone('+221 77-123-45-67')?.e164).toBe('+221771234567');
  expect(normaliserTelephone('00221781234567')).toEqual({ e164: '+221781234567', type: 'mobile' });
  expect(normaliserTelephone('221 33 821 00 00')).toEqual({ e164: '+221338210000', type: 'fixe' });
  expect(normaliserTelephone('33 821 00 00 / 76 555 44 33')?.e164).toBe('+221765554433'); // le mobile passe avant
  expect(normaliserTelephone('77 123 45 67; 33 821 00 00')?.e164).toBe('+221771234567');
  expect(normaliserTelephone('+33 6 12 34 56 78')).toBeNull();
  expect(normaliserTelephone('74 123 45 67')).toBeNull();
  expect(normaliserTelephone('12345')).toBeNull();
  expect(normaliserTelephone(null)).toBeNull();
  ```
- [ ] **Étape 2 :** `npm test` → les tests ÉCHOUENT (module introuvable).
- [ ] **Étape 3 : implémenter `metiers.ts` et `phone.ts`.**
  - Découper le texte brut sur `;`, `/`, `,` et ` ou `.
  - Garder uniquement les chiffres et retirer le préfixe `00221`, `+221` ou `221`. Il doit rester exactement 9 chiffres.
  - Classer chaque morceau valide, puis préférer un mobile à un fixe.
- [ ] **Étape 4 :** `npm test` → tout PASSE.
- [ ] **Étape 5 : commit** `feat(domain): métiers et normalisation des téléphones sénégalais`

### Tâche 3 : Requête et lecture Overpass, quartiers

**Fichiers :**
- Créer : `src/lib/domain/overpass.ts`, `src/lib/domain/quartiers.ts`
- Test : `tests/domain/overpass.test.ts`

**Interfaces :**
- Utilise : `MetierKey`, `METIERS`, `metierDepuisTags` (tâche 2).
- Produit :
  ```ts
  export type Zone = { lat: number; lng: number; rayonM: number };
  export type PlaceCandidate = { source: 'osm'; sourceId: string; nom: string; metier: MetierKey; lat: number; lng: number;
    telephoneBrut: string | null; mail: string | null; site: string | null; reseaux: Record<string, string>; adresse: string | null };
  export const SERVEURS_OVERPASS = ['https://overpass-api.de/api/interpreter', 'https://overpass.kumi.systems/api/interpreter'];
  export function requeteOverpass(zone: Zone, metiers: MetierKey[]): string;
  export function parserOverpass(json: unknown): PlaceCandidate[];
  export class OverpassIndisponible extends Error {}
  export async function executerOverpass(requete: string, fetchImpl: typeof fetch = fetch): Promise<unknown>;
  // quartiers.ts
  export type Quartier = { nom: string; lat: number; lng: number; rayonM: number };
  export const QUARTIERS: Quartier[];
  export function quartierPlusProche(lat: number, lng: number): string | null; // nom du quartier dont le cercle contient le point (le plus proche du centre), sinon null
  ```
- `QUARTIERS` : centres approximatifs, modifiables à l'écran.

  | Quartier | Centre | Rayon |
  |---|---|---|
  | Plateau | 14.6708, -17.4381 | 1 500 m |
  | Médina | 14.6833, -17.4500 | 1 500 m |
  | Point E / Fann | 14.6930, -17.4630 | 1 500 m |
  | Mermoz / Sacré-Cœur | 14.7080, -17.4700 | 2 000 m |
  | Ouakam | 14.7230, -17.4900 | 2 000 m |
  | Grand Yoff | 14.7360, -17.4550 | 2 000 m |
  | Almadies | 14.7450, -17.5150 | 2 000 m |
  | Yoff | 14.7560, -17.4700 | 2 000 m |
  | Parcelles Assainies | 14.7650, -17.4400 | 2 500 m |
  | Pikine | 14.7550, -17.3950 | 3 000 m |
  | Guédiawaye | 14.7770, -17.3950 | 2 500 m |
  | Rufisque | 14.7160, -17.2730 | 3 000 m |
  | Thiès | 14.7910, -16.9260 | 4 000 m |

- [ ] **Étape 1 : écrire les tests qui doivent échouer**
  - `requeteOverpass({lat:14.6708,lng:-17.4381,rayonM:1500},['coiffure'])` :
    - commence par `[out:json][timeout:25];(` ;
    - contient `nwr["shop"="hairdresser"](around:1500,14.6708,-17.4381);` et `nwr["shop"="beauty"](around:1500,14.6708,-17.4381);` ;
    - se termine par `);out center tags;`.
  - `parserOverpass` :
    - un `node` id 1, avec `lat`/`lon` et les tags `{name:'Salon Awa', shop:'hairdresser', phone:'77 123 45 67'}`, donne `sourceId 'node/1'`, `metier 'coiffure'` et `telephoneBrut '77 123 45 67'` ;
    - un `way` avec `center:{lat,lon}` utilise ce centre ;
    - un élément sans `name` est ignoré ;
    - `contact:phone` est utilisé si `phone` manque ;
    - `email` ou `contact:email` donne `mail` ;
    - `contact:facebook` donne `reseaux.facebook` ;
    - un JSON invalide donne `[]`.
  - `quartierPlusProche(14.6710, -17.4385)` vaut `'Plateau'`, et `quartierPlusProche(16.0, -16.5)` vaut `null`.
  - `executerOverpass` :
    - avec un `fetch` factice qui renvoie d'abord 504 puis 200 `{elements:[]}`, le résultat vaut `{elements:[]}` et le second appel vise `SERVEURS_OVERPASS[1]` ;
    - si les deux répondent 429, l'appel lève `OverpassIndisponible`.
- [ ] **Étape 2 :** `npm test` → ÉCHEC.
- [ ] **Étape 3 : implémenter.**
  - La requête est envoyée en `POST` avec `data=<requête>` (encodage formulaire).
  - Délai de 30 s par serveur, avec `AbortController`.
- [ ] **Étape 4 :** `npm test` → PASSE.
- [ ] **Étape 5 : commit** `feat(domain): requête Overpass, lecture et serveur de secours`

### Tâche 4 : Distances et doublons

**Fichiers :**
- Créer : `src/lib/domain/geo.ts`, `src/lib/domain/dedupe.ts`
- Test : `tests/domain/dedupe.test.ts`

**Interfaces :**
- Utilise : `PlaceCandidate` (tâche 3), `normaliserTelephone` (tâche 2).
- Produit :
  ```ts
  export function distanceM(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number; // haversine
  export type PlaceExistante = { id: string; nom: string; lat: number; lng: number; telephone: string | null };
  export function similariteNom(a: string, b: string): number; // 0..1
  export function trouverDoublon(c: { nom: string; lat: number; lng: number; telephone: string | null }, existantes: PlaceExistante[]): PlaceExistante | null;
  export type PlanImport = { aCreer: PlaceCandidate[]; aFusionner: Array<{ placeId: string; candidat: PlaceCandidate }>; dejaConnus: number };
  export function planifierImport(candidats: PlaceCandidate[], existantes: PlaceExistante[], sourcesConnues: Set<string>): PlanImport;
  ```
- `similariteNom` : coefficient de Dice sur les bigrammes, après passage en minuscules, suppression des accents et réduction des espaces.
- `sourcesConnues` : clés `"osm:node/1"`. Un candidat déjà connu par sa source compte dans `dejaConnus`, sans création ni fusion.

- [ ] **Étape 1 : écrire les tests qui doivent échouer**
  - `distanceM` entre (14.6708, -17.4381) et (14.6708, -17.4381) vaut 0.
  - Un écart de 0,001° de latitude donne entre 110 et 112 m.
  - Même téléphone à 3 km : doublon.
  - « Salon Awa Coiffure » et « salon awa  coiffure » à 20 m : doublon.
  - Même nom à 80 m : `null`.
  - Noms différents à 10 m : `null`.
  - `planifierImport` avec deux fois le même candidat dans le lot : `aCreer.length === 1`.
  - Un candidat dont `"osm:node/1"` est dans `sourcesConnues` : `dejaConnus === 1` et rien dans `aCreer`.
  - Un candidat proche d'une place existante de même nom : il va dans `aFusionner` avec son `placeId`.
- [ ] **Étape 2 :** `npm test` → ÉCHEC.
- [ ] **Étape 3 : implémenter** (seuils : 50 m et similarité ≥ 0,8, voir Contraintes globales).
- [ ] **Étape 4 :** `npm test` → PASSE.
- [ ] **Étape 5 : commit** `feat(domain): distances, doublons et plan d'import`

### Tâche 5 : Score d'opportunité

**Fichiers :**
- Créer : `src/lib/domain/score.ts`, `src/lib/domain/html-audit.ts` (le type seulement ici, la fonction arrive en tâche 7)
- Test : `tests/domain/score.test.ts`

**Interfaces :**
- Utilise : `TelephoneNormalise` (tâche 2).
- Produit :
  ```ts
  // html-audit.ts (type)
  export type SiteChecks = { joignable: boolean; https: boolean; mobile: boolean; titre: string | null; metaDescription: boolean;
    anneeCopyright: number | null; lienWhatsApp: boolean; reservationEnLigne: boolean };
  // score.ts
  export const POIDS = { adequation: 30, manques: 25, joignabilite: 25, proximite: 20 } as const;
  export type ScoreInput = { adequation: 'principal' | 'secondaire'; telephone: TelephoneNormalise | null; site: string | null;
    checks: SiteChecks | null; pagespeed: number | null; aReseaux: boolean; distanceM: number; rayonM: number };
  export type ScorePart = { cle: 'adequation' | 'manques' | 'joignabilite' | 'proximite'; label: string; points: number; max: number; raisons: string[] };
  export type Priorite = 'premier' | 'ensuite' | 'plus_tard';
  export const STATUTS = ['a_contacter','contacte','a_repondu','demo','client','perdu','ne_plus_contacter'] as const;
  export type ProspectStatut = typeof STATUTS[number]; // identique à l'enum SQL prospect_statut (tâche 8)
  export type ScoreResult = { total: number; priorite: Priorite; parts: ScorePart[] };
  export function calculerScore(i: ScoreInput, poids?: typeof POIDS): ScoreResult;
  export function manquesLisibles(r: ScoreResult): string[];
  ```
- Règles (barème visible sur la fiche) :
  - **Adéquation :** `principal` = 30, `secondaire` = 15. Un métier est `principal` s'il figure dans `product.metiers`.
  - **Manques (max 25) :**
    - pas de site = 25, raison « Pas de site web » ;
    - site non audité = 10, raison « Site pas encore analysé » ;
    - site injoignable = 20 ;
    - sinon, on additionne, plafond 25 : pas HTTPS +6, pas adapté au mobile +7, PageSpeed < 50 +6, pas de réservation en ligne +6.
  - **Joignabilité :** mobile = 25 (« Mobile, probablement sur WhatsApp »), fixe = 12, aucun numéro = 0 (« Aucun numéro connu »).
  - **Proximité :** `round(20 × max(0, 1 − distanceM / rayonM))`.
  - **Priorité :** total ≥ 70 = `premier`, ≥ 45 = `ensuite`, sinon `plus_tard`.

- [ ] **Étape 1 : écrire les tests qui doivent échouer**
  - Principal, sans site, mobile, distance 0 : `total 100`, `priorite 'premier'`, 4 parts.
  - Secondaire, site HTTPS + mobile + réservation, PageSpeed 90, fixe, distance = rayon : `total 27`, `'plus_tard'`.
  - Principal, site non audité, aucun numéro, distance = rayon / 2 : `30 + 10 + 0 + 10 = 50`, `'ensuite'`.
  - Manques cumulés (pas HTTPS, pas mobile, PageSpeed 30, pas de réservation) : la part `manques` vaut 25, plafonnée.
  - `manquesLisibles` du premier cas donne `['Pas de site web']`.
- [ ] **Étape 2 :** `npm test` → ÉCHEC.
- [ ] **Étape 3 : implémenter.**
- [ ] **Étape 4 :** `npm test` → PASSE.
- [ ] **Étape 5 : commit** `feat(domain): score d'opportunité expliqué`

### Tâche 6 : Message, liens et désinscription

**Fichiers :**
- Créer : `src/lib/domain/message.ts`
- Test : `tests/domain/message.test.ts`

**Interfaces :**
- Produit :
  ```ts
  export const PHRASE_STOP = 'Si vous ne souhaitez plus recevoir de message, répondez simplement STOP.';
  export const MAX_MESSAGE = 700;
  export function assemblerMessage(texteIa: string, lien: string): string;
  export function lienWhatsApp(e164: string, texte: string): string;
  export function lienMail(mail: string, sujet: string, texte: string): string;
  export function nouveauCode(): string;                    // 8 caractères [A-Za-z0-9], via crypto.getRandomValues
  export function urlCible(urlProduit: string, code: string): string; // ajoute le paramètre sl=code
  export function datesRelance(envoyeLe: Date): { j3: Date; j7: Date };
  export function estBloque(contacts: Array<string | null>, optOuts: Set<string>): boolean; // contacts = téléphone E.164 et/ou mail en minuscules
  ```

- [ ] **Étape 1 : écrire les tests qui doivent échouer**
  - `assemblerMessage('Bonjour {LIEN} merci', 'https://x/r/abc')` contient `'https://x/r/abc'`, plus `{LIEN}`, et se termine par `PHRASE_STOP`.
  - Sans `{LIEN}` dans le texte, le lien est ajouté avant `PHRASE_STOP`.
  - Si `PHRASE_STOP` est déjà présente, elle n'est pas doublée.
  - Un texte de 2 000 caractères donne un résultat de longueur ≤ 700 qui contient toujours le lien et `PHRASE_STOP`.
  - `lienWhatsApp('+221771234567', 'Bonjour à vous')` vaut `'https://wa.me/221771234567?text=Bonjour%20%C3%A0%20vous'`.
  - `urlCible('https://lavage.sn/?a=1', 'abc')` vaut `'https://lavage.sn/?a=1&sl=abc'`.
  - `nouveauCode()` respecte `/^[A-Za-z0-9]{8}$/` et deux appels donnent deux valeurs différentes.
  - `datesRelance(new Date('2026-11-21T10:00:00Z'))` donne `j3` = 2026-11-24 et `j7` = 2026-11-28.
  - `estBloque(['+221771234567', null], new Set(['+221771234567']))` vaut `true`.
  - `estBloque([null, 'awa@exemple.sn'], new Set(['awa@exemple.sn']))` vaut `true`.
  - `estBloque([null, null], new Set(['+221771234567']))` vaut `false`.
- [ ] **Étape 2 :** `npm test` → ÉCHEC.
- [ ] **Étape 3 : implémenter.** La troncature coupe le texte IA au dernier espace, pour que lien + `PHRASE_STOP` tiennent dans 700 caractères.
- [ ] **Étape 4 :** `npm test` → PASSE.
- [ ] **Étape 5 : commit** `feat(domain): assemblage du message, liens WhatsApp et désinscription`

### Tâche 7 : Lecture des pages web (audit et produit)

**Fichiers :**
- Modifier : `src/lib/domain/html-audit.ts` (ajouter les fonctions)
- Test : `tests/domain/html-audit.test.ts`

**Interfaces :**
- Utilise : `SiteChecks` (tâche 5).
- Produit :
  ```ts
  export function auditerHtml(html: string, urlFinale: string, anneeCourante: number): SiteChecks;
  export type PageLue = { titre: string | null; description: string | null; texte: string };
  export function extraireTexte(html: string): PageLue;  // sans script ni style, espaces réduits, 6 000 caractères max
  export function besoinDescriptionManuelle(page: PageLue): boolean; // texte < 200 caractères
  export async function telechargerPage(url: string, fetchImpl?: typeof fetch): Promise<{ html: string; urlFinale: string } | null>; // 8 s, 1 Mo max, null en cas d'erreur
  ```
- Détection de `reservationEnLigne` : regex insensible à la casse `/r[ée]server|rendez-vous|booking|calendly|prendre rdv/`.

- [ ] **Étape 1 : écrire les tests qui doivent échouer**
  - Une page avec `<meta name="viewport">` donne `mobile: true`.
  - L'URL `http://…` donne `https: false`.
  - Le texte `© 2019` donne `anneeCopyright: 2019`.
  - Un lien `https://wa.me/221…` donne `lienWhatsApp: true`.
  - Le texte « Réservez en ligne » donne `reservationEnLigne: true`.
  - Pour le HTML d'une app React vide (`<div id="root"></div>` + scripts), `extraireTexte(...).texte.length < 200` et `besoinDescriptionManuelle` vaut `true`.
  - Si le `fetch` factice lève une exception, `telechargerPage` renvoie `null`.
- [ ] **Étape 2 :** `npm test` → ÉCHEC.
- [ ] **Étape 3 : implémenter** avec `node-html-parser`.
- [ ] **Étape 4 :** `npm test` → PASSE.
- [ ] **Étape 5 : commit** `feat(domain): audit HTML et extraction du texte d'une page`

### Tâche 8 : Base Supabase, règles d'accès et connexion

**Prérequis utilisateur :**
- Créer le projet Supabase, en vérifiant d'abord qu'il reste une place gratuite (voir spec §14).
- Remplir `.env.local`.
- Dans Supabase, régler le SMTP sur Resend.
- Lancer `npx supabase login`.

**Fichiers :**
- Créer : `supabase/migrations/0001_schema.sql`, `supabase/migrations/0002_rls.sql`, `src/lib/supabase/{server,browser,middleware,admin}.ts`, `src/middleware.ts`, `src/app/connexion/page.tsx`, `src/app/auth/callback/route.ts`, `src/lib/supabase/database.types.ts` (généré)

**Interfaces :**
- Produit : les tables et colonnes ci-dessous (les tâches suivantes s'en servent), plus ces fonctions :
  - `createServerClient()` dans `server.ts` ;
  - `createBrowserClient()` dans `browser.ts` ;
  - `createAdminClient()` dans `admin.ts` (service role, uniquement dans `/r/[code]`) ;
  - la fonction SQL `ensure_workspace() returns uuid`.

- Schéma (`0001_schema.sql`), noms à respecter à la lettre :
  ```sql
  create type prospect_statut as enum ('a_contacter','contacte','a_repondu','demo','client','perdu','ne_plus_contacter');
  workspaces(id uuid pk default gen_random_uuid(), nom text not null, created_at timestamptz default now())
  members(workspace_id uuid → workspaces on delete cascade, user_id uuid → auth.users on delete cascade, role text default 'owner', pk(workspace_id,user_id))
  products(id uuid pk, workspace_id uuid not null, url text not null, nom text not null, resume text, description_manuelle text,
           metiers text[] not null default '{}', arguments text[] not null default '{}', prix text,
           tracking_site_id text unique not null default encode(gen_random_bytes(6),'hex'), created_at)
  places(id uuid pk, workspace_id uuid not null, nom text not null, metier text not null, lat float8 not null, lng float8 not null,
         telephone text, telephone_type text check (telephone_type in ('mobile','fixe')), telephone_brut text, mail text, site text,
         reseaux jsonb not null default '{}', adresse text, quartier text, created_at, updated_at)
  place_sources(workspace_id uuid not null, place_id uuid → places on delete cascade, source text check (source in ('osm','overture','photo','lien','csv','manuel')),
                source_id text not null, pk(workspace_id, source, source_id))
  harvests(id uuid pk, workspace_id, product_id → products on delete cascade, centre_lat float8, centre_lng float8, rayon_m int, metiers text[], trouves int, nouveaux int, created_at)
  prospects(id uuid pk, workspace_id, product_id → products on delete cascade, place_id → places on delete cascade, harvest_id → harvests on delete set null,
            score int not null, score_detail jsonb not null, priorite text not null, pourquoi text, statut prospect_statut not null default 'a_contacter',
            notes text, dernier_contact_at timestamptz, prochaine_relance_at timestamptz, created_at, updated_at, unique(product_id, place_id))
  audits(id uuid pk, workspace_id, place_id → places on delete cascade, checks jsonb not null, pagespeed int, created_at)
  messages(id uuid pk, workspace_id, prospect_id → prospects on delete cascade, texte text not null, canal text check (canal in ('whatsapp','mail','copie')), code text not null, envoye_at timestamptz, created_at)
  tracked_links(code text pk, workspace_id, prospect_id → prospects on delete cascade, product_id → products on delete cascade, cible_url text not null,
                clics int not null default 0, premier_clic_at timestamptz, dernier_clic_at timestamptz)
  prospect_events(id uuid pk, workspace_id, prospect_id → prospects on delete cascade, type text check (type in ('statut','message','note','clic')), de text, vers text, created_at)
  opt_outs(workspace_id uuid not null, contact text not null, created_at, pk(workspace_id, contact))  -- téléphone E.164 ou mail en minuscules
  ```
  - Index : `places(workspace_id, lat, lng)`, `prospects(workspace_id, statut, score desc)`.
- `0002_rls.sql` :
  - RLS activé sur toutes les tables.
  - Fonction `is_member(ws uuid) returns boolean`, `security definer`, `stable`.
  - Politique `for all using (is_member(workspace_id)) with check (is_member(workspace_id))` sur chaque table qui porte `workspace_id`.
  - `ensure_workspace()` crée « Mon espace » et le lien de membre si l'utilisateur n'en a pas, puis renvoie l'id.

- [ ] **Étape 1 :** écrire les deux migrations.
- [ ] **Étape 2 :** `npx supabase link --project-ref <ref>`, puis `npx supabase db push` → les migrations sont appliquées sans erreur.
- [ ] **Étape 3 :** `npx supabase gen types typescript --linked > src/lib/supabase/database.types.ts`.
- [ ] **Étape 4 : implémenter la connexion par lien magique.**
  - Page `/connexion` : un champ mail et le bouton « Recevoir mon lien ».
  - `auth/callback` échange le code, appelle `ensure_workspace()`, puis redirige vers `/app`.
  - Le middleware renvoie toute page `/app/*` non connectée vers `/connexion`.
- [ ] **Étape 5 : vérifier.**
  - `npm run dev`, ouvrir `/app` : on est redirigé vers `/connexion`.
  - Après le lien reçu par mail, `/app` s'affiche.
  - Dans le SQL Editor : `select count(*) from members` = 1.
  - Avec la clé anon et sans session, `select * from places` renvoie 0 ligne.
- [ ] **Étape 6 : commit** `feat(db): schéma, RLS et connexion par lien magique`

### Tâche 9 : Couche IA

**Fichiers :**
- Créer : `src/lib/ai/{provider,gemini,fake,schemas,prompts}.ts`
- Test : `tests/ai/gemini-errors.test.ts`, `tests/ai/fake.test.ts`

**Interfaces :**
- Utilise : `MetierKey` (tâche 2), `ScoreResult` (tâche 5), `PageLue` (tâche 7).
- Produit :
  ```ts
  export type AnalyseProduit = { nom: string; resume: string; metiers: MetierKey[]; arguments: [string, string, string]; prix: string | null };
  export type ProduitResume = { nom: string; resume: string; arguments: string[]; url: string };
  export type PlaceResume = { nom: string; metier: MetierKey; quartier: string | null };
  export interface AiProvider {
    analyserProduit(i: { url: string; page: PageLue; descriptionManuelle?: string }): Promise<AnalyseProduit>;
    expliquerProspect(i: { produit: ProduitResume; place: PlaceResume; score: ScoreResult }): Promise<{ pourquoi: string }>;
    ecrireMessage(i: { produit: ProduitResume; place: PlaceResume; manques: string[]; salutationWolof: boolean }): Promise<{ texte: string }>;
  }
  export class AiQuotaError extends Error { constructor(public reessayerDansS: number) { super('quota'); } }
  export function getAi(): AiProvider;                     // FakeAi si AI_FAKE=1, sinon GeminiAi
  export function mapperErreurGemini(e: unknown): Error;   // statut 429 → AiQuotaError (retryDelay lu, 60 s par défaut)
  ```
- Schémas `zod` dans `schemas.ts`, passés à Gemini en sortie JSON structurée (`responseMimeType: 'application/json'` + schéma). Une réponse invalide lève une erreur. `metiers` est limité aux valeurs de `MetierKey`.
- Consignes à figer dans `prompts.ts` :
  - **`ecrireMessage` :** français simple et chaleureux, vouvoiement, 450 caractères max. Si `salutationWolof`, commencer par « Salaam aleekum ». Citer un seul manque. Inclure le jeton `{LIEN}` tel quel. Pas d'émoji en série. Pas de promesse chiffrée inventée.
  - **`expliquerProspect` :** 2 phrases max, factuelles, fondées sur les `raisons` du score.
  - **`analyserProduit` :** n'utiliser que la page et `descriptionManuelle`, et ne pas inventer de prix.

- [ ] **Étape 1 : écrire les tests qui doivent échouer**
  - `mapperErreurGemini({ status: 429, message: '… retryDelay":"37s" …' })` est une `AiQuotaError` avec `reessayerDansS === 37`.
  - Une erreur 500 n'est pas une `AiQuotaError`.
  - `FakeAi.ecrireMessage(...)` renvoie un texte qui contient `{LIEN}`.
  - `FakeAi.analyserProduit` avec la description « file d'attente pour salons de coiffure » donne `metiers` qui contient `'coiffure'`.
- [ ] **Étape 2 :** `npm test` → ÉCHEC.
- [ ] **Étape 3 : implémenter.**
  - `GeminiAi` passe par `@google/genai` avec `GEMINI_MODEL`.
  - `FakeAi` est déterministe : il cherche des mots-clés dans le texte pour trouver les métiers.
- [ ] **Étape 4 :** `npm test` → PASSE.
- [ ] **Étape 5 : test manuel avec la clé.**
  - Créer d'abord le script `scripts/essai-ia.ts` (`tsx` est dans les dépendances de dev, tâche 1). Il appelle `telechargerPage` + `extraireTexte` + `getAi().analyserProduit`.
  - Avec la vraie clé, `npx tsx scripts/essai-ia.ts https://<un site de l'utilisateur>` affiche une `AnalyseProduit` valide.
- [ ] **Étape 6 : commit** `feat(ai): fournisseur Gemini, IA factice et gestion du quota`

### Tâche 10 : Socle visuel et coque de l'app

**Fichiers :**
- Créer : `DESIGN.md`, `src/app/globals.css` (jetons), `src/components/ui/*`, `src/app/app/layout.tsx`

**Interfaces :**
- Produit :
  - Composants `Button`, `Input`, `Badge` (variantes : 7 statuts + 3 priorités), `Panel`, `Stat`, `EmptyState`, `Skeleton`, `Toast`.
  - Coque avec barre latérale : Tableau de bord, Carte, Prospects, Produits. En bas, l'utilisateur et la déconnexion.
  - Sur mobile, la barre latérale devient une barre en bas d'écran.

- [ ] **Étape 1 :** charger les skills `impeccable` (création du design system / `DESIGN.md`) et `emil-design-eng`.
- [ ] **Étape 2 :** écrire `DESIGN.md` : direction artistique, palette en jetons clair et sombre, typographie, espacements, rayons, règles de mouvement (durées, courbes, `prefers-reduced-motion`).
  - Ancrage voulu : un outil de terrain sénégalais, sobre et dense en information, comme Linear ou Vercel.
  - À éviter : le « SaaS IA » générique.
- [ ] **Étape 3 :** implémenter les jetons dans `globals.css` (Tailwind v4 `@theme`), puis les composants et la coque.
- [ ] **Étape 4 : vérifier.**
  - `npm run dev`, puis `/app` à 1 440 px et à 375 px : la coque est complète, sans défilement horizontal.
  - Le contraste du texte est ≥ 4,5:1 en clair et en sombre.
  - Lancer l'audit du skill `impeccable` sur la coque : aucun problème bloquant.
- [ ] **Étape 5 : commit** `feat(ui): design system et coque de l'application`

### Tâche 11 : Mes produits

**Fichiers :**
- Créer : `src/app/api/produits/analyse/route.ts`, `src/lib/data/products.ts`, `src/app/app/produits/{page,nouveau/page,[id]/page}.tsx`

**Interfaces :**
- Utilise : `telechargerPage`, `extraireTexte`, `besoinDescriptionManuelle` (tâche 7), `getAi`, `AiQuotaError` (tâche 9).
- Produit :
  - `POST /api/produits/analyse` reçoit `{ url, descriptionManuelle? }`.
  - Réponses possibles :
    - `200 { analyse: AnalyseProduit }` ;
    - `422 { erreur: 'description_requise' }` ;
    - `429 { erreur: 'quota', reessayerDansS }` ;
    - `400 { erreur: 'url_invalide' | 'site_injoignable' }`.
  - Fonctions dans `products.ts` : `listerProduits()`, `lireProduit(id)`, `creerProduit(data)`, `majProduit(id, data)`.

- [ ] **Étape 1 :** route `analyse`.
  - URL validée par zod (`http` ou `https` uniquement).
  - `telechargerPage` ; si le résultat est `null`, renvoyer `site_injoignable`.
  - Si `besoinDescriptionManuelle` est vrai et qu'il n'y a pas de `descriptionManuelle`, renvoyer 422.
  - Sinon, appeler l'IA.
- [ ] **Étape 2 :** page « Nouveau produit ».
  - Un champ URL et le bouton « Analyser ».
  - Sur un 422, afficher : « Votre site est une application JavaScript : décrivez votre produit en 2 phrases », puis relancer avec la description.
  - Afficher ensuite le formulaire prérempli et modifiable (nom, résumé, métiers cochables parmi `METIERS`, 3 arguments, prix), puis « Enregistrer ».
- [ ] **Étape 3 :** liste des produits (nom, URL, métiers ciblés, nombre de prospects) et page d'édition.
- [ ] **Étape 4 : vérifier.**
  - Avec `AI_FAKE=1`, ajouter `https://example.com` : le formulaire se remplit et l'enregistrement fonctionne.
  - Avec la vraie clé, ajouter un vrai site de l'utilisateur.
  - Une URL invalide affiche une erreur dans le champ.
- [ ] **Étape 5 : commit** `feat(produits): ajout d'un produit par son lien avec analyse IA`

### Tâche 12 : Carte et récolte

**Fichiers :**
- Créer : `src/features/carte/{CarteZone.tsx,recolter.ts}`, `src/app/app/carte/page.tsx`, `src/app/api/recoltes/route.ts`, `src/lib/data/harvests.ts`
- Test : `tests/domain/recolte-score.test.ts`

**Interfaces :**
- Utilise : `requeteOverpass`, `executerOverpass`, `parserOverpass`, `OverpassIndisponible`, `QUARTIERS` (tâche 3), `planifierImport`, `distanceM` (tâche 4), `normaliserTelephone` (tâche 2), `calculerScore` (tâche 5).
- Produit :
  - `POST /api/recoltes` reçoit `{ productId, zone: Zone, metiers: MetierKey[], candidats: PlaceCandidate[] }` (au plus 2 000 candidats, validé par zod).
  - Réponse : `200 { harvestId, trouves, nouveaux, fusionnes, prospectsCrees }`.
  - Fonction pure exportée par `src/lib/data/harvests.ts`, sans aucun accès à la base, et testée :
    ```ts
    export function scoreInitial(
      place: { metier: MetierKey; lat: number; lng: number; telephone: TelephoneNormalise | null; site: string | null; reseaux: Record<string, string> },
      produit: { metiers: MetierKey[] }, zone: Zone): ScoreResult;
    ```
  - À l'insertion, `places.quartier` vaut `quartierPlusProche(lat, lng)` et `places.mail` est mis en minuscules.

- [ ] **Étape 1 : écrire le test qui doit échouer** pour `scoreInitial`.
  - Une place `coiffure` avec un mobile, sans site, au centre de la zone, pour un produit dont `metiers = ['coiffure']`, donne `total 100`.
  - La même place hors zone donne une `proximite` de 0.
- [ ] **Étape 2 :** `npm test` → ÉCHEC. Implémenter `scoreInitial`. `npm test` → PASSE.
- [ ] **Étape 3 :** route `recoltes`.
  - Charger les places du workspace dans le carré qui entoure la zone, avec leurs `place_sources`.
  - Appliquer `planifierImport`.
  - Insérer les nouvelles places et leurs sources. Pour les fusions, compléter seulement les champs vides (téléphone, site, réseaux).
  - Créer les prospects (`on conflict (product_id, place_id) do nothing`) avec `scoreInitial`.
  - Écrire la ligne `harvests`.
- [ ] **Étape 4 :** composant `CarteZone`.
  - Carte MapLibre avec le style OpenFreeMap positron.
  - Liste des `QUARTIERS`, avec un curseur de rayon de 300 à 5 000 m. Un clic sur la carte déplace le centre.
  - Cercle de la zone affiché ; métiers cochés et préremplis par le produit choisi.
  - Bouton « Récolter ».
  - `recolter.ts` exécute Overpass dans le navigateur, puis envoie le résultat à `POST /api/recoltes`.
  - Les prospects s'affichent en marqueurs regroupés (source GeoJSON avec `cluster: true`), colorés par priorité.
  - Si `OverpassIndisponible` : message « Serveur de cartes saturé, réessayez dans une minute » et bouton « Réessayer ».
- [ ] **Étape 5 : vérifier.**
  - Produit coiffure, Plateau, 1 500 m : récolte.
  - Le compteur affiche « X trouvés, Y nouveaux ».
  - Une deuxième récolte identique donne `nouveaux = 0` et aucun prospect en double (`select product_id, place_id, count(*) … having count(*) > 1` renvoie 0 ligne).
  - L'attribution OSM est visible.
- [ ] **Étape 6 : commit** `feat(carte): récolte d'une zone OpenStreetMap et création des prospects`

### Tâche 13 : Liste des prospects

**Fichiers :**
- Créer : `src/features/prospects/{TableProspects.tsx,filtres.ts}`, `src/app/app/prospects/page.tsx`, `src/lib/data/prospects.ts`
- Test : `tests/domain/filtres.test.ts`

**Interfaces :**
- Produit :
  ```ts
  export type FiltresProspects = { productId?: string; statut?: ProspectStatut; priorite?: Priorite; metier?: MetierKey; quartier?: string; avecTelephone?: boolean; recherche?: string };
  export function filtresDepuisParams(p: URLSearchParams): FiltresProspects;
  export function filtresVersParams(f: FiltresProspects): URLSearchParams;
  export type ProspectLigne = { id: string; nom: string; metier: MetierKey; quartier: string | null; score: number; priorite: Priorite;
    aTelephone: boolean; statut: ProspectStatut; prochaineRelanceAt: string | null };
  export async function listerProspects(f: FiltresProspects, page: number): Promise<{ lignes: ProspectLigne[]; total: number }>; // 50 par page, tri score décroissant
  ```

- [ ] **Étape 1 : écrire le test qui doit échouer.**
  - Aller-retour `filtresVersParams` → `filtresDepuisParams` sans perte.
  - Un statut inconnu dans l'URL est ignoré.
- [ ] **Étape 2 :** `npm test` → ÉCHEC. Implémenter `filtres.ts`. `npm test` → PASSE.
- [ ] **Étape 3 : tableau.**
  - Colonnes : nom, métier, quartier, score, priorité, téléphone (oui/non), statut, prochaine relance.
  - Filtres synchronisés avec l'URL, recherche par nom, pagination de 50.
  - Clic sur une ligne : ouverture de la fiche.
  - Sur mobile, les lignes deviennent des cartes compactes.
- [ ] **Étape 4 : vérifier.** Filtrer « priorité premier + avec téléphone » : seules ces lignes restent. L'URL partagée garde les filtres.
- [ ] **Étape 5 : commit** `feat(prospects): liste filtrable des prospects`

### Tâche 14 : Fiche prospect

**Fichiers :**
- Créer :
  - `src/features/fiche/{Fiche.tsx,AuditPresence.tsx,DetailScore.tsx,pagespeed.ts}`
  - `src/app/app/prospects/[id]/page.tsx`
  - `src/app/api/prospects/[id]/{audit,pourquoi,statut,oublier}/route.ts`

**Interfaces :**
- Utilise : `auditerHtml`, `telechargerPage` (tâche 7), `calculerScore` (tâche 5), `getAi` (tâche 9).
- Produit :
  - `POST /api/prospects/[id]/audit` reçoit `{ pagespeed: number | null }`.
    - Il télécharge le site, enregistre l'`audit` et recalcule le score de **tous** les prospects de cette place.
    - La proximité est recalculée avec la zone du `harvest` de chaque prospect. Sans `harvest`, la zone est un cercle de 2 000 m centré sur la place, donc la proximité est maximale.
    - Réponse : `{ checks, score }`.
  - `POST /api/prospects/[id]/pourquoi` répond `{ pourquoi }` ou `429` (quota). Le résultat est gardé dans `prospects.pourquoi`.
  - `POST /api/prospects/[id]/statut` reçoit `{ statut, note? }`.
    - Il écrit un `prospect_events`.
    - Le statut `ne_plus_contacter` ajoute le téléphone et le mail connus dans `opt_outs`.
  - `POST /api/prospects/[id]/oublier` ajoute le téléphone et le mail connus dans `opt_outs`, puis supprime la place (cascade).
  - `pagespeed.ts` exporte `mesurerPageSpeed(url): Promise<number | null>`, appelé depuis le navigateur.
    - API : `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=…&strategy=mobile&category=performance`.
    - Résultat : `round(score × 100)`, ou `null` en cas d'erreur.

- [ ] **Étape 1 : page fiche.**
  - Nom, métier, quartier, petite carte, téléphone (bouton d'appel `tel:`), site, réseaux.
  - Bouton « Vérifier sur Google Maps » vers `https://www.google.com/maps/search/?api=1&query=<nom>%20<lat>,<lng>`.
- [ ] **Étape 2 :** `DetailScore` affiche les 4 parts, avec points / max et raisons. Le total s'anime de 0 à sa valeur avec `motion`, et cette animation est coupée si `prefers-reduced-motion`.
- [ ] **Étape 3 :** bouton « Analyser sa présence » : PageSpeed côté navigateur, puis `POST audit`. Afficher `AuditPresence` avec la liste « Ce qui va bien / Ce qui manque », comme dans la vidéo de référence.
- [ ] **Étape 4 :** « Pourquoi le contacter » : appelé à la première ouverture si `pourquoi` est vide. Sur un 429, afficher « IA en pause, réessayez dans N s ».
- [ ] **Étape 5 :** changement de statut, notes, historique (`prospect_events`), et bouton « Oublier ce commerce » avec confirmation qui explique que c'est définitif.
- [ ] **Étape 6 : vérifier.**
  - Une fiche avec un site : l'audit remplit les vérifications et le score change.
  - Une fiche sans site : « Pas de site web » apparaît dans le détail.
  - « Oublier » : la fiche disparaît, et le téléphone est dans `opt_outs`.
- [ ] **Étape 7 : commit** `feat(fiche): fiche prospect, audit de présence et score détaillé`

### Tâche 15 : Rédaction et envoi préparé

**Fichiers :**
- Créer : `src/features/message/{Redacteur.tsx,fileIa.ts}`, `src/app/api/prospects/[id]/message/route.ts`, `src/lib/data/messages.ts`
- Test : `tests/domain/file-ia.test.ts`

**Interfaces :**
- Utilise : `assemblerMessage`, `lienWhatsApp`, `lienMail`, `nouveauCode`, `urlCible`, `datesRelance`, `estBloque`, `PHRASE_STOP` (tâche 6), `manquesLisibles` (tâche 5), `getAi` (tâche 9).
- Produit :
  - `POST /api/prospects/[id]/message` reçoit `{ salutationWolof: boolean }`.
    - Si `estBloque([place.telephone, place.mail], optOuts)` est vrai, réponse `403 { erreur: 'desinscrit' }`.
    - Sinon, il crée le `tracked_links` (code, `cible_url = urlCible(product.url, code)`), puis le `messages`.
    - Réponse : `{ messageId, texte, lienWhatsApp }`.
  - `PATCH /api/prospects/[id]/message` reçoit `{ messageId, canal, envoye: true }`.
    - Statut passé à `contacte`, `dernier_contact_at` = maintenant, `prochaine_relance_at` = `j3`.
    - Écriture d'un `prospect_events`.
  - `POST /api/prospects/[id]/statut` avec `{ relanceFaite: true }` :
    - si `prochaine_relance_at` était le J+3 du dernier message envoyé, il passe au J+7 de ce même message ;
    - sinon, il passe à `null` (fin des relances) ;
    - un `prospect_events` de type `note` est écrit.
  - `fileIa.ts` exporte `creerFileIa(intervalleMs: number, executer: (id: string) => Promise<'ok' | { quota: number }>)`.
    - La file traite les identifiants un par un, en respectant l'intervalle.
    - Sur un quota, elle attend `quota` secondes puis réessaie.
    - Elle expose `progression: { faits: number; total: number }`.
- Le lien inséré dans le message est `${NEXT_PUBLIC_APP_URL}/r/${code}`.

- [ ] **Étape 1 : écrire le test qui doit échouer** pour `creerFileIa`, avec des faux minuteurs (`vi.useFakeTimers`).
  - 3 identifiants avec un intervalle de 6 000 ms : `executer` est appelé à t = 0, 6 000 et 12 000.
  - Un retour `{ quota: 30 }` sur le 2e retarde le nouvel essai de 30 s.
  - `progression.faits` finit à 3.
- [ ] **Étape 2 :** `npm test` → ÉCHEC. Implémenter. `npm test` → PASSE.
- [ ] **Étape 3 :** `Redacteur` dans la fiche.
  - Case « Salutation en wolof », puis « Rédiger ».
  - Le texte apparaît dans une zone modifiable.
  - Boutons « Ouvrir WhatsApp » (désactivé sans mobile), « Ouvrir le mail » (si un mail est connu) et « Copier ».
  - Au retour sur l'onglet, l'outil demande « Message envoyé ? » (Oui / Pas encore). « Oui » appelle le `PATCH`.
  - Sur un 429, la zone reste modifiable pour écrire le message à la main ; `assemblerMessage` est appliqué au moment d'enregistrer.
- [ ] **Étape 4 :** dans la liste des prospects, bouton « Préparer les 20 premiers ».
  - Il prend les 20 prospects `a_contacter` de meilleur score, avec un téléphone et non bloqués.
  - Il les passe à `creerFileIa(AI_INTERVALLE_MS)` et affiche la progression.
  - Les messages prêts sont accessibles un par un, avec un bouton « Suivant ».
- [ ] **Étape 5 : vérifier.**
  - « Ouvrir WhatsApp » ouvre `wa.me` avec le texte, le lien `/r/…` et `PHRASE_STOP`.
  - Après « Oui », le statut vaut `contacte` et la relance est à J+3.
  - Un prospect désinscrit n'a pas de bouton « Rédiger ».
  - Chronométrer « Préparer les 20 premiers » sur un vrai produit (objectif de la spec : 20 messages en moins de 10 minutes, avec le quota gratuit).
- [ ] **Étape 6 : commit** `feat(message): rédaction IA, lien WhatsApp prérempli et relances`

### Tâche 16 : Lien suivi `/r/[code]`

**Fichiers :**
- Créer : `src/app/r/[code]/route.ts`

**Interfaces :**
- Utilise : `createAdminClient` (tâche 8), `tracked_links`, `prospect_events`.
- Produit : `GET /r/{code}`.
  - Code connu : redirection 302 vers `cible_url`, `clics + 1`, `premier_clic_at` rempli s'il était vide, `dernier_clic_at` = maintenant, et un `prospect_events` de type `clic`.
  - Code inconnu : redirection 302 vers `NEXT_PUBLIC_APP_URL`.
  - Aucune IP ni aucun agent utilisateur n'est enregistré.

- [ ] **Étape 1 :** implémenter.
- [ ] **Étape 2 : vérifier.**
  - Ouvrir un lien `/r/<code>` issu de la tâche 15 : on arrive sur le site du produit avec `?sl=<code>`, et `clics` vaut 1.
  - `/r/inconnu` renvoie à l'accueil.
- [ ] **Étape 3 : commit** `feat(liens): redirection suivie /r/[code]`

### Tâche 17 : Tableau de bord d'accueil

**Fichiers :**
- Créer : `src/features/tableau-de-bord/*`, `src/app/app/page.tsx`

**Interfaces :**
- Utilise : `listerProspects` (tâche 13), `prospect_events`, `tracked_links`.
- Produit :
  - **Meilleure recommandation** : le prospect `a_contacter` qui a le meilleur score, avec son `pourquoi`.
  - **Compteurs** par statut.
  - **Carte de chaleur** des prospects (couche `heatmap` de MapLibre).
  - **« À contacter en premier »** : les 5 premiers.
  - **« Relances du jour »** : `prochaine_relance_at` ≤ aujourd'hui.
  - **« Ont ouvert votre lien »** : `tracked_links.clics > 0` sur les 7 derniers jours.
  - **Activité récente** : les 10 derniers `prospect_events`.

- [ ] **Étape 1 :** charger les skills `dataviz` et `emil-design-eng`, puis construire les blocs.
  - Disposition asymétrique, la recommandation en premier : pas une grille de cartes identiques.
  - Un état vide utile pour un compte neuf : « Ajoutez votre premier produit », puis « Récoltez une zone ».
- [ ] **Étape 2 : vérifier.**
  - Compte neuf : les états vides guident jusqu'à la première récolte.
  - Après une récolte et un message envoyé : chaque bloc est rempli et cohérent avec la liste.
  - Rendu correct à 375 px.
- [ ] **Étape 3 : commit** `feat(accueil): tableau de bord de prospection`

### Tâche 18 : Mise en ligne et vérification complète

**Prérequis utilisateur :**
- Créer le dépôt GitHub privé et le site Netlify relié à ce dépôt.
- Saisir les variables d'environnement dans Netlify.
- Ajouter l'URL Netlify dans les « Redirect URLs » de Supabase Auth.

**Fichiers :**
- Modifier : `README.md` (installation, variables, commandes)

- [ ] **Étape 1 :** `npm test` (tout passe), `npm run lint` (0 erreur), `npm run build` (réussi).
- [ ] **Étape 2 :** pousser sur GitHub, seulement avec l'accord de l'utilisateur. Le déploiement Netlify réussit.
- [ ] **Étape 3 : parcours complet sur l'URL de production.**
  1. Connexion par lien magique.
  2. Ajout d'un vrai produit de l'utilisateur.
  3. Récolte d'un quartier.
  4. Ouverture d'une fiche, audit, puis « pourquoi ».
  5. Rédaction, puis ouverture WhatsApp.
  6. « Message envoyé ».
  7. Clic sur le lien `/r/…` depuis un autre téléphone.
  8. Le tableau de bord montre le clic.
- [ ] **Étape 4 :** noter dans `README.md` les quotas observés (Gemini, Overpass) et le temps mesuré pour « 20 messages ».
- [ ] **Étape 5 : commit** `docs: README et mise en ligne de la phase 1`
