# Guide : Ajouter un nouvel article

## Structure du site (version 2.0)

```
ReveilDouceur/
├── index.html              ← Page d'accueil
├── a-propos.html           ← Page À propos
├── contact.html            ← Page Contact
├── 404.html                ← Page erreur
├── css/
│   └── style.css           ← Design (light + dark mode)
├── js/
│   ├── config.js           ← Configuration centralisée
│   └── app.js              ← Logique du site
├── includes/
│   ├── header.html         ← Header partagé (une seule fois)
│   └── footer.html         ← Footer partagé (une seule fois)
├── images/
│   ├── favicon.svg
│   ├── logo.svg
│   ├── og-image.svg
│   └── default-thumbnail.svg
└── articles/
    └── YYYY-MM-DD_slug.html + .svg/.jpg
```

---

## Étapes pour ajouter un article

### 1. Préparer vos fichiers

Vous avez besoin de **2 fichiers** avec le **même nom** :

```
2025-02-01_mon-article.html   ← L'article
2025-02-01_mon-article.jpg    ← La miniature (ou .svg, .webp, .png)
```

**Format du nom :** `AAAA-MM-JJ_titre-en-minuscules.extension`

### 2. Copier et modifier le template

1. **Copiez** : `articles/2025-01-15_exemple-article-template.html`
2. **Renommez** avec votre date et slug
3. **Modifiez** les zones marquées "À PERSONNALISER" :

#### Dans le `<head>` :
- `<title>` → Votre titre + " - Réveil Douceur"
- `<meta name="description">` → Résumé (150-160 caractères)
- `<meta name="article:published_time">` → Date YYYY-MM-DD
- Toutes les URLs avec le nom du fichier
- Le JSON-LD Schema.org

#### Dans le `<body>` :
- `<time datetime="...">` → Votre date
- `<h1>` → Votre titre
- Le contenu de `<div class="article__content">`
- Les sources dans `<aside class="article__sources">`

### 3. Préparer l'image

| Critère | Valeur |
|---------|--------|
| Dimensions | 800×450 px (16:9) ou 600×600 px (carré) |
| Taille max | 300 Ko |
| Formats | JPG, WebP, PNG, SVG |
| Nom | Identique à l'article |

### 4. Uploader

Déposez les 2 fichiers dans `/articles/` via FTP ou votre hébergeur.

**C'est tout !** L'article apparaîtra automatiquement sur la page d'accueil.

---

## Personnalisation du site

### Modifier la configuration

Éditez `js/config.js` pour changer :

```javascript
const SITE_CONFIG = {
  siteName: 'Réveil Douceur',        // Nom du site
  tagline: 'Éveil scientifique...',   // Slogan
  email: 'contact@votredomaine.fr',   // Email de contact
  formspreeId: 'xxxxx',               // ID Formspree pour le formulaire

  navigation: [                        // Menu principal
    { label: 'Accueil', href: '/', id: 'home' },
    { label: 'À propos', href: '/a-propos.html', id: 'about' },
    // Ajouter d'autres pages ici
  ],

  theme: {
    respectSystemPreference: true,     // Suivre le mode sombre du système
    default: 'light'                   // Thème par défaut
  }
};
```

### Modifier le header/footer

Éditez une seule fois ces fichiers, tous les changements s'appliquent partout :
- `includes/header.html`
- `includes/footer.html`

### Modifier le style

Éditez `css/style.css`. Les couleurs sont définies en haut du fichier :

```css
:root {
  --color-primary: #5B7B6F;      /* Couleur principale (vert sauge) */
  --color-secondary: #D4C5B5;    /* Couleur secondaire (beige) */
  --color-accent: #C9A87C;       /* Couleur d'accent (or) */
  /* ... */
}
```

---

## Mode sombre

Le site supporte automatiquement le mode sombre :
- **Préférence système** : Suit le réglage de l'utilisateur
- **Toggle manuel** : Bouton en haut à droite
- **Persistance** : Le choix est mémorisé dans le navigateur

Les couleurs du mode sombre sont dans `css/style.css` sous `[data-theme="dark"]`.

---

## Checklist avant publication

- [ ] Nom de fichier : `YYYY-MM-DD_slug.html`
- [ ] Image avec le même nom (avant l'extension)
- [ ] `<title>` personnalisé
- [ ] `<meta description>` (150-160 caractères)
- [ ] Dates cohérentes partout
- [ ] Sources listées et liens fonctionnels
- [ ] Image < 300 Ko
- [ ] Test en mode clair ET sombre

---

## Bonnes pratiques SEO

1. **Titre** : 50-60 caractères max
2. **Description** : 150-160 caractères avec mots-clés
3. **URL** : courte, descriptive, sans accents
4. **Images** : toujours un `alt` descriptif
5. **Liens externes** : `target="_blank" rel="noopener"`
6. **Sources** : toujours citer vos références

---

## Hébergement

Le site fonctionne avec tout hébergement supportant le **directory listing** (Apache par défaut).

**Configuration requise (.htaccess)** :
```apache
<Directory "/articles">
    Options +Indexes
</Directory>
```

Pour OVH, o2switch, Infomaniak, etc., c'est généralement activé par défaut.

---

## Besoin d'aide ?

Contactez-nous via la page Contact du site.
