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
  YYYY-MM-DD_slug-de-l-article.svg     # Illustration SVG (backup/source)
/images/illustrations/
  YYYY-MM-DD_slug-de-l-article.png     # Illustration PNG (utilisée pour le partage social)
/css/style.css                          # Styles (inclut dark mode)
/js/app.js                              # Chargement dynamique des articles
/includes/header.html                   # Header commun
/includes/footer.html                   # Footer commun
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
        <img src="/images/illustrations/YYYY-MM-DD_slug.png" alt="Description" loading="eager">
      </figure>
      <div class="article__content">
        <!-- Contenu -->
      </div>
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

**IMPORTANT pour les images :**
- Toutes les méta images (og:image, twitter:image, Schema.org) doivent pointer vers `/images/illustrations/YYYY-MM-DD_slug.png`
- L'image hero de l'article utilise aussi ce chemin PNG
- Les fichiers SVG dans `/articles/` sont des fichiers sources/backup, pas pour le partage social

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

## Articles existants (au 26/11/2025)

### Économie/Finance
- `votre-salaire-vaut-combien-en-vrai` - Inflation, création monétaire, pouvoir d'achat
- `creation-monetaire-comment-nait-largent` - Fonctionnement de la création monétaire

### Médias
- `qui-possede-votre-journal-prefere` - Concentration des médias, 9 milliardaires

### Technologie
- `pourquoi-vous-ne-pouvez-pas-lacher-votre-telephone` - Addiction smartphone, dark patterns
- `ia-consommation-eau-data-centers` - IA et eau, cycle de refroidissement

### Environnement/Climat
- `europe-seule-a-sauver-la-planete` - Politiques climatiques, 8% des émissions
- `qui-pollue-vraiment-le-classement` - 4 méthodes de calcul des émissions
- `bio-supermarche-vs-maraicher-local` - Bio importé vs local conventionnel

### Société
- `dictatures-democraties-comparons-vraiment` - France/Chine/Russie, libertés civiles
- `violences-conjugales-ce-que-disent-les-chiffres` - Données OMS par région
- `violence-psychologique-suicide-masculin-le-tabou` - Suicide masculin, violences psy
- `hommes-sensibles-ce-que-disent-les-etudes` - Préférences déclarées vs révélées (femmes)
- `ce-que-les-hommes-disent-vouloir-vs-realite` - Préférences déclarées vs révélées (hommes)

### Santé/Alimentation
- `additifs-alimentaires-ce-que-dit-la-science` - Additifs, études scientifiques
- `pesticides-ce-que-revelent-les-etudes` - Pesticides, données scientifiques

### Religion/Culture
- `textes-religieux-paix-violence-analyse-academique` - Analyse comparative des textes
- `politiques-immigration-analyse-comparative` - Politiques par pays

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
# Commit et push un nouvel article
git add -A && git commit -m "Ajout article: [titre]" && git push

# Sur le serveur de prod
git pull origin main
```

## Repo GitHub
`git@github.com:friteuseb/reveildouceur.git`

## URL du site
https://reveildouceur.fr
