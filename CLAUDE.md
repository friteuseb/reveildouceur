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
  YYYY-MM-DD_slug-de-l-article.html    # Article HTML
  YYYY-MM-DD_slug-de-l-article.svg     # Infographie SVG (pour data-viz en bas de l'article)
/images/illustrations/
  YYYY-MM-DD_slug-de-l-article.png     # Illustration PNG style Moebius (original)
  YYYY-MM-DD_slug-de-l-article.webp    # Version WebP optimisée (générée automatiquement)
  YYYY-MM-DD_slug-de-l-article-thumb.webp  # Thumbnail 400px pour les cards
/scripts/
  generate-illustrations.py             # Script de génération d'images Moebius
  optimize-images.py                     # Script d'optimisation WebP (NEW)
  purge-cache.sh                        # Purge du cache Cloudflare
/css/style.css                          # Styles (inclut dark mode)
/js/app.js                              # Chargement dynamique des articles (WebP + lazy loading)
/includes/header.html                   # Header commun
/includes/footer.html                   # Footer commun
/.venv/                                  # Environnement Python virtuel
```

## Format d'un article

### Nom de fichier
`YYYY-MM-DD_slug-en-minuscules.html` + illustration PNG dans `/images/illustrations/`

### Structure HTML requise
```html
<!DOCTYPE html>
<html lang="fr">
<head>
  <!-- SEO: title, description, canonical -->
  <!-- Open Graph: og:image pointe vers /images/illustrations/YYYY-MM-DD_slug.png -->
  <!-- Twitter Cards: twitter:image pointe vers /images/illustrations/YYYY-MM-DD_slug.png -->
  <!-- Schema.org JSON-LD: image pointe vers /images/illustrations/YYYY-MM-DD_slug.png -->
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
        <img src="/images/illustrations/YYYY-MM-DD_slug.png" alt="Description" loading="eager">
      </figure>
      <div class="article__content">
        <!-- Contenu de l'article -->
      </div>
      <figure class="article__data-viz">
        <!-- Infographie SVG avec les données clés -->
        <figcaption>Les données clés en un coup d'œil</figcaption>
        <img src="/articles/YYYY-MM-DD_slug.svg" alt="Infographie" loading="lazy">
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
   - Généré avec : `python3 scripts/generate-illustrations.py YYYY-MM-DD_slug.html`
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
python3 scripts/generate-illustrations.py YYYY-MM-DD_slug.html

# Générer les illustrations manquantes pour tous les articles
python3 scripts/generate-illustrations.py --missing

# === OPTIMISATION DES IMAGES (NEW) ===

# Optimiser toutes les images PNG → WebP (réduit de 50-95% le poids)
.venv/bin/python scripts/optimize-images.py

# Mode simulation (voir ce qui serait fait sans modifier)
.venv/bin/python scripts/optimize-images.py --dry-run

# Forcer la réoptimisation de toutes les images
.venv/bin/python scripts/optimize-images.py --force

# Optimiser une seule image
.venv/bin/python scripts/optimize-images.py images/illustrations/2025-11-28_nom.png

# Installer/mettre à jour Pillow si nécessaire
.venv/bin/pip install -U Pillow

# === DÉPLOIEMENT ===

# Commit et push avec purge du cache Cloudflare
git add -A && git commit -m "Ajout article: [titre]" && git deploy

# Ajout d'un prompt spécifique pour un nouvel article
# Éditer scripts/generate-illustrations.py > ARTICLE_SPECIFIC_PROMPTS
```

## Workflow complet pour un nouvel article

1. **Rédiger l'article HTML** dans `/articles/YYYY-MM-DD_slug.html`
   - Utiliser un article existant comme template
   - Vérifier les meta tags (og:image, twitter:image, Schema.org → PNG)
   - Inclure `<div id="header-include"></div>` et `<div id="footer-include"></div>`

2. **Créer l'infographie SVG** dans `/articles/YYYY-MM-DD_slug.svg`
   - viewBox="0 0 800 450", fond sombre, données clés

3. **Ajouter l'article dans `/articles/index.json`** (OBLIGATOIRE)
   ```json
   { "file": "YYYY-MM-DD_slug.html", "category": "categorie" }
   ```
   Catégories : `economie`, `medias`, `tech`, `environnement`, `societe`, `sante`, `geopolitique`

4. **Ajouter un prompt spécifique** dans `scripts/generate-illustrations.py` > `ARTICLE_SPECIFIC_PROMPTS`
   ```python
   "slug-sans-date": "Description visuelle pour l'IA...",
   ```

5. **Générer l'image Moebius** : `python3 scripts/generate-illustrations.py YYYY-MM-DD_slug.html`
   - Utilise Pollinations.ai (gratuit) ou Google Gemini si clé API dans `.env`

6. **Optimiser les images** : `.venv/bin/python scripts/optimize-images.py`
   - Génère automatiquement les versions WebP et thumbnails
   - Réduit le poids des images de 50-95%

7. **Commit et deploy** : `git add -A && git commit -m "Ajout article: [titre]" && git deploy`
   - `git deploy` = push + purge cache Cloudflare

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
