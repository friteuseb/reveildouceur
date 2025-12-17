# Réveil Douceur - Guide pour Claude Code

## Contexte du projet

**Réveil Douceur** est un site de "redpill douce" — un espace qui pose des questions sur les narratifs dominants, mais sans tomber dans le complotisme ou l'agressivité.

**Philosophie :**
- Des questions, pas des accusations
- Toujours sourcé (études, rapports officiels, données publiques)
- Nuance et complexité (pas de réponses binaires)
- Ni alarmisme, ni complotisme, ni moralisation

**Tagline :** "Questionnez. Vérifiez. Pensez par vous-même."

## Structure des fichiers

```
/articles/
  slug-de-l-article.html               # Article HTML (sans date dans le nom)
  slug-de-l-article.svg                # Infographie SVG (pour data-viz en bas de l'article)
/images/illustrations/
  slug-de-l-article.png                # Illustration PNG style Moebius (original)
  slug-de-l-article.webp               # Version WebP optimisée (générée automatiquement)
  slug-de-l-article-thumb.webp         # Thumbnail 400px pour les cards
/scripts/
  generate-illustrations.py             # Script de génération d'images Moebius
  optimize-images.py                     # Script d'optimisation WebP
  migrate-urls.py                        # Script de migration URLs (dates → sans dates)
  purge-cache.sh                        # Purge du cache Cloudflare
/css/style.css                          # Styles (inclut dark mode + quizz)
/js/app.js                              # Chargement dynamique des articles (WebP + lazy loading)
/js/quizz.js                            # Logique interactive des quizz
/includes/header.html                   # Header commun
/includes/footer.html                   # Footer commun
/.venv/                                  # Environnement Python virtuel
```

## Format d'un article

### Nom de fichier
`slug-en-minuscules.html` (sans date) + illustration PNG dans `/images/illustrations/`

### Structure HTML requise
```html
<!DOCTYPE html>
<html lang="fr">
<head>
  <!-- SEO: title, description, canonical -->
  <!-- Open Graph: og:image pointe vers /images/illustrations/slug.png -->
  <!-- Twitter Cards: twitter:image pointe vers /images/illustrations/slug.png -->
  <!-- Schema.org JSON-LD: image pointe vers /images/illustrations/slug.png -->
  <link rel="stylesheet" href="/css/style.css">
  <script src="/js/config.js"></script>
</head>
<body>
  <div id="header-include"></div>
  <main id="main-content">
    <article class="article">
      <header class="article__header">
        <p class="article__meta"><time datetime="YYYY-MM-DD">Date</time></p>
        <h1 class="article__title">Titre</h1>
      </header>
      <figure class="article__hero-image">
        <!-- Image PNG style Moebius générée par le script -->
        <img src="/images/illustrations/slug.png" alt="Description" loading="eager">
      </figure>
      <div class="article__content">
        <!-- Contenu de l'article -->
      </div>
      <figure class="article__data-viz">
        <!-- Infographie SVG avec les données clés -->
        <figcaption>Les données clés en un coup d'œil</figcaption>
        <img src="/articles/slug.svg" alt="Infographie" loading="lazy">
      </figure>
      <aside class="article__sources">
        <h3>Sources et références</h3>
        <ul>
          <li><strong>[1]</strong> Source - <a href="URL" target="_blank" rel="noopener">Titre</a></li>
        </ul>
      </aside>
    </article>
  </main>
  <div id="footer-include"></div>
  <script src="/js/app.js"></script>
</body>
</html>
```

**IMPORTANT pour les images (2 types) :**

1. **PNG style Moebius** (`/images/illustrations/`) :
   - Utilisé pour : hero image, og:image, twitter:image, Schema.org
   - Généré avec : `python3 scripts/generate-illustrations.py slug.html`
   - Style : illustration artistique Moebius (Jean Giraud)

2. **SVG infographique** (`/articles/`) :
   - Utilisé pour : section data-viz en bas de l'article
   - Créé manuellement avec les données clés de l'article
   - Style : graphiques, chiffres, fond sombre (#1a202c), couleurs vives

### Style d'écriture

1. **Accroche personnelle** : Commencer par une anecdote ou situation relatable
2. **Poser la question** : Formuler le problème comme une question, pas une accusation
3. **Les faits** : Données chiffrées, tableaux, sources officielles
4. **Les nuances** : Présenter plusieurs angles, reconnaître la complexité
5. **Ce qu'on peut en retenir** : Synthèse factuelle, pas de moralisation
6. **Question ouverte finale** : Laisser le lecteur réfléchir

**Ton :** Curieux, factuel, respectueux. Jamais condescendant ou accusateur.

**Vocabulaire à éviter :** "réveillez-vous", "on vous ment", "complot", "moutons", "élites", "ils"

**Vocabulaire à privilégier :** "les données montrent", "une question se pose", "les études suggèrent", "paradoxalement"

## Illustrations SVG

- Dimensions : `viewBox="0 0 800 450"`
- Style : Moderne, épuré, gradients sombres
- Couleurs principales :
  - Fond : dégradés bleu-gris foncé (#1a202c, #2d3748)
  - Accent positif : vert (#48bb78, #4ade80)
  - Accent négatif : rouge (#e53e3e, #fc8181)
  - Accent neutre : orange (#ed8936)
  - Texte : blanc (#ffffff), gris (#a0aec0)
- Inclure : données clés, graphiques simplifiés, titre

## Articles existants (au 28/11/2025)

### Économie/Finance
- `votre-salaire-vaut-combien-en-vrai` - Inflation, création monétaire, pouvoir d'achat
- `creation-monetaire-comment-nait-largent` - Fonctionnement de la création monétaire
- `fraude-fiscale-vs-sociale-vrais-chiffres` - Comparaison fraude fiscale et sociale
- `vrai-cout-securite-sociale-comparaison-mondiale` - Système de santé comparé

### Médias
- `qui-possede-votre-journal-prefere` - Concentration des médias, 9 milliardaires
- `fact-checkers-le-dossier-complet` - Fact-checkers, financement, limites
- `qui-desinforme-vraiment-chiffres` - Désinformation, sources et chiffres

### Technologie
- `pourquoi-vous-ne-pouvez-pas-lacher-votre-telephone` - Addiction smartphone, dark patterns
- `ia-consommation-eau-data-centers` - IA et eau, cycle de refroidissement

### Environnement/Climat
- `europe-seule-a-sauver-la-planete` - Politiques climatiques, 8% des émissions
- `qui-pollue-vraiment-le-classement` - 4 méthodes de calcul des émissions
- `bio-supermarche-vs-maraicher-local` - Bio importé vs local conventionnel
- `co2-a-travers-les-ages-geologiques` - CO2 historique, perspective géologique
- `verdissement-terre-co2-plantes` - Effet du CO2 sur la végétation
- `nucleaire-francais-danger-ou-solution` - Nucléaire français, risques et avantages
- `voiture-electrique-bilan-carbone-reel` - Bilan carbone véhicules électriques
- `geoingenierie-le-dossier-complet` - Géoingénierie, techniques et risques

### Société
- `dictatures-democraties-comparons-vraiment` - France/Chine/Russie, libertés civiles
- `violences-conjugales-ce-que-disent-les-chiffres` - Données OMS par région
- `violence-psychologique-suicide-masculin-le-tabou` - Suicide masculin, violences psy
- `hommes-sensibles-ce-que-disent-les-etudes` - Préférences déclarées vs révélées (femmes)
- `ce-que-les-hommes-disent-vouloir-vs-realite` - Préférences déclarées vs révélées (hommes)
- `demographie-europeenne-le-sujet-tabou` - Démographie, natalité européenne
- `france-liberte-expression-ce-que-disent-les-chiffres` - Censure, liberté d'expression, comparaisons

### Santé/Alimentation
- `additifs-alimentaires-ce-que-dit-la-science` - Additifs, études scientifiques
- `pesticides-ce-que-revelent-les-etudes` - Pesticides, données scientifiques
- `covid-ce-quon-disait-vs-ce-quon-sait` - COVID, évolution des connaissances
- `systeme-sante-francais-equation-impossible` - Système de santé, financement

### Religion/Culture
- `textes-religieux-paix-violence-analyse-academique` - Analyse comparative des textes
- `politiques-immigration-analyse-comparative` - Politiques par pays

### Géopolitique
- `ukraine-interets-economiques-chaque-camp` - Ukraine, intérêts économiques
- `france-usa-souverainete-a-geometrie-variable` - Souveraineté, comparaison
- `salvador-france-faible-avec-les-loups` - Salvador, sécurité, comparaison

### Politique/Économie française
- `france-quel-niveau-de-socialisme` - France, niveau de redistribution

### Quizz interactifs
- `miroir-pensee` - Le Miroir de la Pensée Libre (introspection, autonomie intellectuelle)
- `miroir-croyances` - Le Miroir des Croyances Invisibles (influences philosophiques)

## Format des Quizz

Il existe **deux types** de quizz sur le site :

### Type 1 : Quizz Miroir (introspection)
Quizz psychologiques/philosophiques à la **racine du site** avec leur propre JS.

**Fichiers :**
- `/miroir-slug.html` - Page HTML du quizz
- `/js/miroir-slug.js` - Logique JS spécifique
- `/images/illustrations/miroir-slug.png` - Illustration Moebius

**Quizz miroir existants :**
- `miroir-pensee` - Pensée libre, conditionnements, conformisme
- `miroir-croyances` - Influences spirituelles et idéologiques

### Type 2 : Quizz Articles (éducatifs)
Quizz factuels dans `/articles/` utilisant le système de quizz générique.

**Fichiers :**
- `/articles/quizz-slug.html` - Le quizz HTML
- `/images/illustrations/quizz-slug.png` - Illustration
- `/js/quizz.js` - Script JS générique (déjà présent)

## Workflow pour un nouveau quizz

### Option A : Quizz Miroir (introspection, psychologique)

1. **Créer le fichier HTML** `/miroir-slug.html`
   - Copier la structure de `miroir-pensee.html` ou `miroir-croyances.html`
   - Modifier les meta tags (title, description, og:image)

2. **Créer le fichier JS** `/js/miroir-slug.js`
   - Définir les questions, réponses, et logique de scoring
   - S'inspirer de `miroir-pensee.js` ou `miroir-croyances.js`

3. **Ajouter le prompt d'illustration** dans `scripts/generate-illustrations.py`
   ```python
   "miroir-slug": "Description visuelle pour l'IA...",
   ```

4. **Générer l'illustration**
   ```bash
   python3 scripts/generate-illustrations.py miroir-slug.html
   ```
   Note : Le script cherche dans /articles/, donc générer manuellement :
   ```bash
   # Ou utiliser directement Pollinations (voir script)
   ```

5. **Optimiser l'image**
   ```bash
   .venv/bin/python scripts/optimize-images.py images/illustrations/miroir-slug.png
   ```

6. **Ajouter dans index.json** avec métadonnées inline (OBLIGATOIRE pour les cards)
   ```json
   {
     "file": "miroir-slug.html",
     "category": "quizz",
     "href": "/miroir-slug.html",
     "title": "Titre du quizz",
     "excerpt": "Description courte pour la card...",
     "date": "YYYY-MM-DD"
   }
   ```
   **Important** : Les champs `href`, `title`, `excerpt` sont obligatoires pour les fichiers hors /articles/

7. **Mettre à jour /quizz.html** pour ajouter la card du nouveau quizz

8. **Mettre à jour le sitemap** `/sitemap.xml`

9. **Déployer**
   ```bash
   git add -A && git commit -m "Ajout quizz: [titre]" && git push && bash scripts/purge-cache.sh
   ```

### Option B : Quizz Article (éducatif, factuel)

1. **Copier le template** `/articles/quizz-template.html`
2. **Modifier les méta-données** (title, description, og:image)
3. **Rédiger les questions** (5 à 15 recommandé)
   - Toujours sourcer les explications
   - Varier les sujets pour maintenir l'intérêt
4. **Ajouter dans index.json** :
   ```json
   { "file": "quizz-slug.html", "category": "quizz" }
   ```
5. **Générer l'illustration** : `python3 scripts/generate-illustrations.py quizz-slug.html`
6. **Optimiser** : `.venv/bin/python scripts/optimize-images.py`
7. **Mettre à jour le sitemap**
8. **Déployer**

## Structure index.json pour les quizz externes

Pour les quizz à la racine (miroir-*), utiliser le format avec métadonnées inline :

```json
{
  "file": "miroir-slug.html",
  "category": "quizz",
  "href": "/miroir-slug.html",
  "title": "Titre complet du quizz",
  "excerpt": "Description de 1-2 phrases pour la card d'aperçu.",
  "date": "2025-12-01"
}
```

**Pourquoi ?** Le système charge normalement les métadonnées en fetchant le fichier depuis `/articles/`. Pour les fichiers ailleurs, on fournit les métadonnées directement dans index.json.

## Idées d'articles futurs

### Économie
- [ ] Qui profite vraiment de l'inflation ?
- [ ] Le mythe de la méritocratie en chiffres
- [ ] Retraites : ce que personne n'ose calculer

### Santé
- [ ] Big Pharma : entre fantasmes et réalités
- [ ] Perturbateurs endocriniens : état des lieux scientifique
- [ ] Santé mentale : pourquoi ça explose ?

### Société
- [ ] Mobilité sociale : le rêve français en chiffres
- [ ] Éducation nationale : comparaison internationale
- [ ] Criminalité : ce que disent vraiment les stats

### Médias/Tech
- [ ] Algorithmes : qui décide ce que vous voyez ?
- [ ] Fact-checkers : qui vérifie les vérificateurs ?
- [ ] Sondages : comment orienter l'opinion

### Géopolitique
- [ ] Guerres : à qui profitent-elles ?
- [ ] ONG : financement et influence
- [ ] Sanctions économiques : efficacité réelle

## Commandes utiles

```bash
# Générer l'illustration PNG style Moebius pour un article
python3 scripts/generate-illustrations.py slug.html

# Générer les illustrations manquantes pour tous les articles
python3 scripts/generate-illustrations.py --missing

# === OPTIMISATION DES IMAGES ===

# Optimiser toutes les images PNG → WebP (réduit de 50-95% le poids)
.venv/bin/python scripts/optimize-images.py

# Mode simulation (voir ce qui serait fait sans modifier)
.venv/bin/python scripts/optimize-images.py --dry-run

# Forcer la réoptimisation de toutes les images
.venv/bin/python scripts/optimize-images.py --force

# Optimiser une seule image
.venv/bin/python scripts/optimize-images.py images/illustrations/nom.png

# Installer/mettre à jour Pillow si nécessaire
.venv/bin/pip install -U Pillow

# === ARTICLES SIMILAIRES (Sur le même thème) ===

# Générer les sections "Sur le même thème" pour tous les articles
.venv/bin/python scripts/generate-related-articles.py

# Mode simulation (voir ce qui serait fait sans modifier)
.venv/bin/python scripts/generate-related-articles.py --dry-run

# Forcer la régénération même si déjà présent
.venv/bin/python scripts/generate-related-articles.py --force

# Traiter un seul article
.venv/bin/python scripts/generate-related-articles.py --article slug-de-larticle

# Utiliser OpenAI API au lieu de sentence-transformers (local)
.venv/bin/python scripts/generate-related-articles.py --openai

# Installer les dépendances si nécessaire
.venv/bin/pip install sentence-transformers beautifulsoup4 numpy

# === DÉPLOIEMENT ===

# Commit et push avec purge du cache Cloudflare
git add -A && git commit -m "Ajout article: [titre]" && git deploy

# Ajout d'un prompt spécifique pour un nouvel article
# Éditer scripts/generate-illustrations.py > ARTICLE_SPECIFIC_PROMPTS

# === NEWSLETTER ===

# Prévisualiser l'email (génère newsletter-preview.html)
python3 scripts/send-newsletter.py slug-article --preview

# Envoyer un email de test à l'admin
python3 scripts/send-newsletter.py slug-article --test

# Envoyer la newsletter à tous les abonnés
python3 scripts/send-newsletter.py slug-article
```

## Workflow complet pour un nouvel article

1. **Rédiger l'article HTML** dans `/articles/slug.html`
   - Utiliser un article existant comme template
   - Vérifier les meta tags (og:image, twitter:image, Schema.org → PNG)
   - Inclure `<div id="header-include"></div>` et `<div id="footer-include"></div>`

2. **Créer l'infographie SVG** dans `/articles/slug.svg`
   - viewBox="0 0 800 450", fond sombre, données clés

3. **Ajouter l'article dans `/articles/index.json`** (OBLIGATOIRE)
   ```json
   { "file": "slug.html", "category": "categorie" }
   ```
   Catégories : `economie`, `medias`, `tech`, `environnement`, `societe`, `sante`, `geopolitique`, `quizz`

4. **Ajouter un prompt spécifique** dans `scripts/generate-illustrations.py` > `ARTICLE_SPECIFIC_PROMPTS`
   ```python
   "slug": "Description visuelle pour l'IA...",
   ```

5. **Générer l'image Moebius** : `python3 scripts/generate-illustrations.py slug.html`
   - Utilise Pollinations.ai (gratuit) ou Google Gemini si clé API dans `.env`

6. **Optimiser les images** : `.venv/bin/python scripts/optimize-images.py`
   - Génère automatiquement les versions WebP et thumbnails
   - Réduit le poids des images de 50-95%

7. **Générer les articles similaires** : `.venv/bin/python scripts/generate-related-articles.py`
   - Calcule la similarité sémantique entre tous les articles
   - Injecte automatiquement la section "Sur le même thème"
   - Utilise sentence-transformers (local) ou OpenAI API (--openai)

8. **Mettre à jour le sitemap** `/sitemap.xml` (OBLIGATOIRE)
   ```xml
   <url>
     <loc>https://reveildouceur.fr/articles/slug.html</loc>
     <lastmod>YYYY-MM-DD</lastmod>
     <changefreq>monthly</changefreq>
     <priority>0.9</priority>
   </url>
   ```

9. **Commit et deploy** : `git add -A && git commit -m "Ajout article: [titre]" && git deploy`
   - `git deploy` = push + purge cache Cloudflare

10. **Envoyer la newsletter aux abonnés** (optionnel)
    ```bash
    # Prévisualiser d'abord
    python3 scripts/send-newsletter.py slug --preview

    # Envoyer un test à l'admin
    python3 scripts/send-newsletter.py slug --test

    # Envoyer à tous les abonnés
    python3 scripts/send-newsletter.py slug
    ```
    - Utilise l'API Brevo pour créer et envoyer une campagne email
    - Le template inclut l'image, le titre, la description et un bouton vers l'article

## Précautions juridiques pour les articles sensibles

Les sujets suivants nécessitent des **précautions rédactionnelles renforcées** pour éviter plaintes et poursuites :

### Sujets à risque
- Immigration, démographie, origines ethniques
- Religion (islam, christianisme, judaïsme...)
- Violence conjugale, différences hommes/femmes
- Personnalités nommément citées (politiques, journalistes, entrepreneurs)
- Fact-checkers, médias mainstream
- COVID, vaccins, santé publique

### Règles de protection légale

1. **Toujours sourcer avec des sources officielles**
   - Études peer-reviewed (DOI, liens directs)
   - Rapports d'organismes publics (INSEE, OCDE, OMS, Eurostat)
   - Éviter les sources militantes ou partisanes

2. **Formulation prudente**
   - ✅ "Les données suggèrent que..." / "Une étude de X montre..."
   - ✅ "Selon les chiffres de l'INSEE..." / "D'après le rapport de..."
   - ❌ "Il est évident que..." / "Tout le monde sait que..."
   - ❌ Accusations directes sans preuve

3. **Présenter les nuances et contre-arguments**
   - Inclure systématiquement une section "Ce que la nuance exige"
   - Mentionner les limites méthodologiques des études
   - Présenter les hypothèses concurrentes

4. **Éviter la diffamation**
   - Ne pas accuser nommément sans preuve judiciaire
   - Utiliser "présumé", "selon X", "d'après les accusations de"
   - Ne pas prêter d'intentions malveillantes

5. **Mentions légales dans l'article**
   - Pour les sujets très sensibles, ajouter un disclaimer :
   ```html
   <p class="article__disclaimer">
     <em>Cet article présente des données issues de sources officielles dans un but informatif.
     Il ne constitue pas une prise de position politique et invite à la réflexion critique.</em>
   </p>
   ```

6. **Droit de réponse**
   - Le site dispose d'une page contact pour exercer un droit de réponse
   - Répondre rapidement et de bonne foi aux demandes de correction

### Check-list avant publication (articles sensibles)

- [ ] Toutes les affirmations sont sourcées
- [ ] Les sources sont officielles/académiques
- [ ] Le ton est interrogatif, pas accusatoire
- [ ] Les nuances et limites sont présentées
- [ ] Aucune personne n'est diffamée
- [ ] Le vocabulaire interdit est évité ("complot", "on vous ment", etc.)
- [ ] L'article pose des questions, ne donne pas de réponses définitives

## Optimisation des performances

### Images (WebP automatique)

Le site utilise automatiquement les images WebP quand disponibles :
- **JavaScript** : Détecte le support WebP et charge les thumbnails optimisés
- **Apache** : Sert automatiquement WebP aux navigateurs compatibles via `.htaccess`
- **Fallback** : Si WebP non disponible, les PNG originaux sont servis

### Lazy Loading

Les images utilisent le lazy loading natif du navigateur :
- Les 6 premiers articles sont chargés immédiatement (`loading="eager"`)
- Les autres sont chargés à la demande (`loading="lazy"`)
- `fetchpriority` et `decoding="async"` optimisent le rendu

### Cache

Configuration dans `.htaccess` :
- Images : 1 an (immutable)
- CSS/JS : 1 an (immutable)
- HTML : 1 heure + stale-while-revalidate
- JSON : 1 jour

### Compression

- GZIP activé pour HTML, CSS, JS, JSON, SVG
- WebP réduit les images de 50-95% par rapport au PNG

## Notes techniques

- **Articles HTML** : chargent header/footer via JS (`fetch('/includes/header.html')`)
- **Pages PHP** : utilisent `include 'includes/header.php'`
- Les deux systèmes coexistent (hybride PHP/HTML)

## Repo GitHub
`git@github.com:friteuseb/reveildouceur.git`

## URL du site
https://reveildouceur.fr
