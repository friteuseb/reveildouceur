/**
 * Réveil Douceur - Application JavaScript
 * Version 2.2 - Optimisation performances (WebP, lazy loading avancé)
 */

// ========================================
// Matomo Analytics (respect Do Not Track)
// ========================================
var _paq = window._paq = window._paq || [];
_paq.push(['setDoNotTrack', true]); // Respect DNT browser setting
_paq.push(['trackPageView']);
_paq.push(['enableLinkTracking']);
(function() {
  var u="https://www.matomo.typo3hub.com/";
  _paq.push(['setTrackerUrl', u+'matomo.php']);
  _paq.push(['setSiteId', '10']);
  var d=document, g=d.createElement('script'), s=d.getElementsByTagName('script')[0];
  g.async=true; g.src=u+'matomo.js'; s.parentNode.insertBefore(g,s);
})();

(function() {
  'use strict';

  // ========================================
  // Détection support WebP
  // ========================================
  const supportsWebP = (function() {
    const canvas = document.createElement('canvas');
    if (canvas.getContext && canvas.getContext('2d')) {
      return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
    }
    return false;
  })();

  // ========================================
  // Configuration
  // ========================================
  const CONFIG = typeof SITE_CONFIG !== 'undefined' ? SITE_CONFIG : {
    siteName: 'Réveil Douceur',
    tagline: 'Éveil scientifique et bienveillant',
    articles: {
      path: '/articles/',
      defaultThumbnail: '/images/default-thumbnail.svg',
      thumbnailFormats: ['webp', 'jpg', 'jpeg', 'png', 'svg'],
      // Fichiers à ignorer dans le listing
      ignoreFiles: ['index.html', 'template.html']
    },
    navigation: [
      { label: 'Accueil', href: '/', id: 'home' },
      { label: 'À propos', href: '/a-propos.php', id: 'about' },
      { label: 'Contact', href: '/contact.php', id: 'contact' }
    ],
    footerLinks: {
      main: [
        { label: 'Accueil', href: '/' },
        { label: 'À propos', href: '/a-propos.php' },
        { label: 'Contact', href: '/contact.php' }
      ],
      legal: [
        { label: 'Mentions légales', href: '/mentions-legales.php' },
        { label: 'Confidentialité', href: '/confidentialite.php' }
      ]
    },
    theme: {
      respectSystemPreference: true,
      default: 'light'
    }
  };

  // ========================================
  // Gestion du thème (Dark Mode)
  // ========================================
  const ThemeManager = {
    STORAGE_KEY: 'reveil-douceur-theme',

    init() {
      this.applyTheme(this.getPreferredTheme());
      if (window.matchMedia) {
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
          if (!localStorage.getItem(this.STORAGE_KEY)) {
            this.applyTheme(e.matches ? 'dark' : 'light');
          }
        });
      }
    },

    getPreferredTheme() {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved) return saved;
      if (CONFIG.theme.respectSystemPreference && window.matchMedia) {
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
          return 'dark';
        }
      }
      return CONFIG.theme.default || 'light';
    },

    applyTheme(theme) {
      document.documentElement.setAttribute('data-theme', theme);
      this.updateToggleButton(theme);
    },

    updateToggleButton(theme) {
      const toggles = document.querySelectorAll('#theme-toggle, #theme-toggle-mobile');
      toggles.forEach(toggle => {
        toggle.setAttribute('aria-label',
          theme === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre'
        );
      });
    },

    toggle() {
      const current = document.documentElement.getAttribute('data-theme') || 'light';
      const next = current === 'dark' ? 'light' : 'dark';
      localStorage.setItem(this.STORAGE_KEY, next);
      this.applyTheme(next);
    },

    bindToggle() {
      const toggles = document.querySelectorAll('#theme-toggle, #theme-toggle-mobile');
      toggles.forEach(toggle => {
        toggle.addEventListener('click', () => this.toggle());
      });
    }
  };

  ThemeManager.init();

  // ========================================
  // Chargement des includes (Header/Footer)
  // ========================================
  const IncludesManager = {
    async loadInclude(elementId, path) {
      const element = document.getElementById(elementId);
      if (!element) return false;

      try {
        const response = await fetch(path);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const html = await response.text();
        element.innerHTML = html;
        return true;
      } catch (error) {
        console.warn(`Include ${path} non trouvé, utilisation du fallback`);
        return false;
      }
    },

    async init() {
      await Promise.all([
        this.loadInclude('header-include', '/includes/header.html'),
        this.loadInclude('footer-include', '/includes/footer.html')
      ]);
      this.initNavigation();
      this.initFooter();
      ThemeManager.bindToggle();
      initMobileNav();
    },

    initNavigation() {
      const nav = document.getElementById('main-nav');
      if (!nav) return;

      const currentPath = window.location.pathname;
      const links = CONFIG.navigation.map(item => {
        const isActive = currentPath === item.href ||
                        (item.href !== '/' && currentPath.startsWith(item.href.replace('.html', '')));
        return `<a href="${item.href}" class="nav__link ${isActive ? 'nav__link--active' : ''}">${item.label}</a>`;
      }).join('');
      nav.innerHTML = links;
    },

    initFooter() {
      const footerNav = document.getElementById('footer-nav');
      if (footerNav && CONFIG.footerLinks.main) {
        footerNav.innerHTML = CONFIG.footerLinks.main
          .map(item => `<li><a href="${item.href}" class="footer__link">${item.label}</a></li>`)
          .join('');
      }

      const footerLegal = document.getElementById('footer-legal');
      if (footerLegal && CONFIG.footerLinks.legal) {
        footerLegal.innerHTML = CONFIG.footerLinks.legal
          .map(item => `<li><a href="${item.href}" class="footer__link">${item.label}</a></li>`)
          .join('');
      }

      const copyright = document.getElementById('footer-copyright');
      if (copyright) {
        const year = CONFIG.year || new Date().getFullYear();
        copyright.innerHTML = `&copy; ${year} ${CONFIG.siteName}. Tous droits réservés.`;
      }
    }
  };

  // ========================================
  // Utilitaires - Parsing articles
  // ========================================

  /**
   * Extrait une date depuis le nom de fichier ou le contenu
   * Formats supportés: YYYY-MM-DD, article-TIMESTAMP, etc.
   */
  function extractDate(filename, htmlContent) {
    // 1. Chercher format YYYY-MM-DD dans le nom
    const dateMatch = filename.match(/(\d{4}-\d{2}-\d{2})/);
    if (dateMatch) {
      return new Date(dateMatch[1]);
    }

    // 2. Chercher un timestamp dans le nom (article-1764106218413)
    const timestampMatch = filename.match(/(\d{13})/);
    if (timestampMatch) {
      return new Date(parseInt(timestampMatch[1]));
    }

    // 3. Chercher une date dans le contenu HTML
    if (htmlContent) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlContent, 'text/html');

      // Chercher balise time
      const timeEl = doc.querySelector('time[datetime]');
      if (timeEl) {
        return new Date(timeEl.getAttribute('datetime'));
      }

      // Chercher meta article:published_time
      const metaDate = doc.querySelector('meta[name="article:published_time"], meta[property="article:published_time"]');
      if (metaDate) {
        return new Date(metaDate.getAttribute('content'));
      }
    }

    // 4. Fallback: date actuelle
    return new Date();
  }

  /**
   * Extrait le titre depuis le contenu HTML
   */
  function extractTitle(htmlContent, filename) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');

    // 1. Chercher <title> (articles complets)
    let title = doc.querySelector('title')?.textContent;
    if (title) {
      // Retirer le suffix " - Réveil Douceur"
      title = title.replace(/\s*[-–—]\s*Réveil Douceur\s*$/i, '').trim();
      if (title) return title;
    }

    // 2. Chercher le premier <h1>
    const h1 = doc.querySelector('h1');
    if (h1) {
      // Si le h1 contient des tabs/séparateurs (format brut avec metadata)
      let h1Text = h1.textContent;
      if (h1Text.includes('\t')) {
        h1Text = h1Text.split('\t')[0];
      }
      return h1Text.trim();
    }

    // 3. Fallback: nom du fichier
    return filename.replace(/\.html$/, '').replace(/[-_]/g, ' ');
  }

  /**
   * Extrait le résumé/excerpt depuis le contenu HTML
   */
  function extractExcerpt(htmlContent, maxLength = 200) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');

    // 1. Chercher meta description
    const metaDesc = doc.querySelector('meta[name="description"]');
    if (metaDesc?.content) {
      return metaDesc.content.trim();
    }

    // 2. Chercher le premier paragraphe significatif
    const paragraphs = doc.querySelectorAll('p');
    for (const p of paragraphs) {
      const text = p.textContent.trim();
      if (text.length > 50) {
        if (text.length > maxLength) {
          return text.substring(0, maxLength).replace(/\s+\S*$/, '') + '...';
        }
        return text;
      }
    }

    // 3. Fallback
    return 'Cliquez pour lire cet article...';
  }

  /**
   * Vérifie si un fichier HTML est un article "brut" (sans structure complète)
   */
  function isRawArticle(htmlContent) {
    return !htmlContent.includes('<!DOCTYPE') && !htmlContent.includes('<html');
  }

  /**
   * Formate une date - année uniquement
   */
  function formatDate(date) {
    if (!(date instanceof Date) || isNaN(date)) {
      return '';
    }
    return date.getFullYear().toString();
  }

  // ========================================
  // Chargement des articles
  // ========================================

  // Variable globale pour stocker les catégories
  let categoriesData = {};
  let articlesWithCategories = [];

  async function fetchDirectoryListing(path) {
    // Méthode 1: Essayer de charger index.json (le plus fiable)
    try {
      const jsonResponse = await fetch(path + 'index.json');
      if (jsonResponse.ok) {
        const data = await jsonResponse.json();

        // Nouveau format avec catégories
        if (data.categories && data.articles) {
          categoriesData = data.categories;
          articlesWithCategories = data.articles;
          console.log('Articles chargés depuis index.json (nouveau format):', data.articles.length);
          return data.articles.map(a => a.file);
        }

        // Ancien format (array de strings) - compatibilité
        if (Array.isArray(data)) {
          console.log('Articles chargés depuis index.json (ancien format):', data);
          const ignoreList = CONFIG.articles?.ignoreFiles || [];
          return data.filter(f => {
            if (ignoreList.includes(f)) return false;
            if (f.includes('template')) return false;
            return f.endsWith('.html');
          });
        }
      }
    } catch (e) {
      console.log('index.json non trouvé ou erreur:', e.message);
    }

    // Méthode 2: Directory listing (Apache, nginx, ou Python http.server)
    try {
      const response = await fetch(path);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const html = await response.text();
      console.log('Directory listing reçu, parsing...');

      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');

      const links = Array.from(doc.querySelectorAll('a'));
      const htmlFiles = links
        .map(a => {
          const href = a.getAttribute('href');
          const text = a.textContent;
          return href || text;
        })
        .filter(href => {
          if (!href || !href.endsWith('.html')) return false;
          if (href.startsWith('?') || href.startsWith('/')) return false;
          const filename = href.replace(/^\.\//, '');
          if ((CONFIG.articles?.ignoreFiles || []).includes(filename)) return false;
          if (filename.includes('template')) return false;
          return true;
        })
        .map(href => href.replace(/^\.\//, ''));

      console.log('Articles trouvés:', htmlFiles);
      return htmlFiles;
    } catch (error) {
      console.error('Erreur lecture répertoire:', error);
      return [];
    }
  }

  function getArticleCategory(filename) {
    const articleData = articlesWithCategories.find(a => a.file === filename);
    if (articleData && articleData.category && categoriesData[articleData.category]) {
      return {
        id: articleData.category,
        ...categoriesData[articleData.category]
      };
    }
    return null;
  }

  function findThumbnail(basePath, filename, useThumb = false) {
    const baseName = filename.replace('.html', '');
    // Utiliser WebP si supporté, avec fallback PNG
    const suffix = useThumb ? '-thumb' : '';
    if (supportsWebP) {
      return `/images/illustrations/${baseName}${suffix}.webp`;
    }
    return `/images/illustrations/${baseName}.png`;
  }

  async function fetchArticleMetadata(filename) {
    // Vérifier si l'article a des métadonnées inline (pour les quizz, pages externes, etc.)
    const articleData = articlesWithCategories.find(a => a.file === filename);

    if (articleData && articleData.title && articleData.href) {
      // Article avec métadonnées inline - pas besoin de fetch
      const baseName = filename.replace('.html', '');
      const category = getArticleCategory(filename);

      return {
        filename,
        url: articleData.href,
        rawUrl: articleData.href,
        title: articleData.title,
        excerpt: articleData.excerpt || '',
        date: articleData.date ? new Date(articleData.date).getTime() : Date.now(),
        thumbnail: findThumbnail('/images/illustrations/', filename, true),
        heroImage: findThumbnail('/images/illustrations/', filename, false),
        isRaw: false,
        category
      };
    }

    // Article standard - fetch pour extraire les métadonnées
    try {
      const url = CONFIG.articles.path + filename;
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const htmlContent = await response.text();

      const title = extractTitle(htmlContent, filename);
      const excerpt = extractExcerpt(htmlContent);
      const date = extractDate(filename, htmlContent);
      const isRaw = isRawArticle(htmlContent);
      const thumbnail = findThumbnail(CONFIG.articles.path, filename, true); // Thumbnails pour cards
      const heroImage = findThumbnail(CONFIG.articles.path, filename, false); // Full size pour hero
      const category = getArticleCategory(filename);

      return {
        filename,
        url: isRaw ? `/article.html?file=${encodeURIComponent(filename)}` : CONFIG.articles.path + filename,
        rawUrl: CONFIG.articles.path + filename,
        title,
        excerpt,
        date,
        thumbnail,
        heroImage,
        isRaw,
        category
      };
    } catch (error) {
      console.error(`Erreur chargement ${filename}:`, error);
      return null;
    }
  }

  /**
   * Mélange un tableau avec une graine (seed) pour résultat reproductible
   * Utilise l'algorithme Fisher-Yates avec un générateur pseudo-aléatoire
   */
  function seededShuffle(array, seed) {
    const shuffled = [...array];

    // Générateur pseudo-aléatoire simple basé sur la seed
    const random = () => {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff;
      return seed / 0x7fffffff;
    };

    // Fisher-Yates shuffle
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    return shuffled;
  }

  /**
   * Génère une seed basée sur la date du jour
   * Change chaque jour à minuit
   */
  function getDailySeed() {
    const today = new Date();
    return today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  }

  async function loadArticles() {
    const filenames = await fetchDirectoryListing(CONFIG.articles.path);
    if (filenames.length === 0) return [];

    const articlePromises = filenames.map(fetchArticleMetadata);
    const articles = await Promise.all(articlePromises);

    const validArticles = articles.filter(article => article !== null);

    // Trier par date (plus récent d'abord)
    validArticles.sort((a, b) => b.date - a.date);

    // Garder les 3 plus récents, mélanger le reste avec rotation quotidienne
    const recentCount = 3;
    const recentArticles = validArticles.slice(0, recentCount);
    const olderArticles = validArticles.slice(recentCount);

    // Mélanger les anciens articles avec une seed quotidienne
    const shuffledOlder = seededShuffle(olderArticles, getDailySeed());

    return [...recentArticles, ...shuffledOlder];
  }

  // ========================================
  // Rendu des articles
  // ========================================

  function createArticleCard(article, index) {
    const categoryBadge = article.category
      ? `<span class="article-card__category" style="background-color: ${article.category.color}">${article.category.label}</span>`
      : '';

    // Les 6 premiers articles sont chargés immédiatement (au-dessus du fold)
    const isAboveFold = index < 6;
    const loadingAttr = isAboveFold ? 'eager' : 'lazy';
    const fetchPriority = isAboveFold ? 'high' : 'low';

    // Fallback vers PNG si WebP non disponible
    const baseName = article.filename.replace('.html', '');
    const fallbackSrc = `/images/illustrations/${baseName}.png`;
    const slug = baseName;

    return `
      <article class="article-card" data-category="${article.category?.id || ''}" data-slug="${slug}">
        <div class="article-card__image">
          <a href="${article.url}" aria-label="Lire ${article.title}">
            <img
              src="${article.thumbnail}"
              alt="${article.title}"
              loading="${loadingAttr}"
              fetchpriority="${fetchPriority}"
              decoding="async"
              width="400"
              height="225"
              onerror="this.onerror=null; this.src='${fallbackSrc}'; if(this.src.includes('.png')) this.src='${CONFIG.articles.defaultThumbnail}';"
            >
          </a>
        </div>
        <div class="article-card__content">
          <div class="article-card__meta">
            ${categoryBadge}
            <div class="article-card__vote" data-slug="${slug}">
              <button class="article-card__vote-btn article-card__vote-btn--like" data-vote="1" title="J'aime">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>
                <span class="article-card__vote-count" data-count="likes">0</span>
              </button>
              <button class="article-card__vote-btn article-card__vote-btn--dislike" data-vote="-1" title="Je n'aime pas">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"/></svg>
                <span class="article-card__vote-count" data-count="dislikes">0</span>
              </button>
            </div>
          </div>
          <h2 class="article-card__title">
            <a href="${article.url}">${article.title}</a>
          </h2>
          <p class="article-card__excerpt">${article.excerpt}</p>
          <a href="${article.url}" class="article-card__link">
            Lire la suite
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </a>
        </div>
      </article>
    `;
  }

  // Variable pour stocker le filtre actif
  let activeFilter = null;
  let allArticles = [];

  function createCategoryFilters() {
    if (Object.keys(categoriesData).length === 0) return '';

    const filterButtons = Object.entries(categoriesData)
      .map(([id, cat]) => `
        <button class="category-filter" data-category="${id}" style="--cat-color: ${cat.color}">
          ${cat.label}
        </button>
      `).join('');

    return `
      <div class="category-filters">
        <button class="category-filter category-filter--active" data-category="">Tous</button>
        <button class="category-filter category-filter--sort" data-sort="popular">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>
          Plus aimés
        </button>
        ${filterButtons}
      </div>
    `;
  }

  function filterArticles(categoryId) {
    activeFilter = categoryId || null;

    // Mettre à jour les boutons actifs
    document.querySelectorAll('.category-filter').forEach(btn => {
      const isActive = btn.dataset.category === (categoryId || '');
      btn.classList.toggle('category-filter--active', isActive);
    });

    // Filtrer les cartes
    document.querySelectorAll('.article-card').forEach(card => {
      const cardCategory = card.dataset.category;
      const shouldShow = !categoryId || cardCategory === categoryId;
      card.style.display = shouldShow ? '' : 'none';
    });
  }

  let currentSort = 'recent'; // 'recent' ou 'popular'

  function initCategoryFilters() {
    document.querySelectorAll('.category-filter').forEach(btn => {
      btn.addEventListener('click', async () => {
        // Gestion du tri par popularité
        if (btn.dataset.sort === 'popular') {
          await sortByPopularity();
          return;
        }

        // Réinitialiser le tri à "récent" lors du changement de catégorie
        currentSort = 'recent';
        document.querySelector('[data-sort="popular"]')?.classList.remove('category-filter--active');

        filterArticles(btn.dataset.category);
      });
    });
  }

  async function sortByPopularity() {
    const sortBtn = document.querySelector('[data-sort="popular"]');
    const allBtn = document.querySelector('[data-category=""]');

    // Toggle: si déjà actif, revenir au tri récent
    if (currentSort === 'popular') {
      currentSort = 'recent';
      sortBtn?.classList.remove('category-filter--active');
      allBtn?.classList.add('category-filter--active');
      resetToDefaultOrder();
      return;
    }

    currentSort = 'popular';

    // Mettre à jour les boutons
    document.querySelectorAll('.category-filter').forEach(b => b.classList.remove('category-filter--active'));
    sortBtn?.classList.add('category-filter--active');

    // Charger le classement
    const ranking = await VoteManager.loadRanking();
    if (ranking.length === 0) {
      // Pas encore de votes, garder l'ordre actuel
      return;
    }

    // Créer un map slug -> position dans le ranking
    const rankMap = new Map();
    ranking.forEach((r, index) => {
      rankMap.set(r.slug, { index, score: r.score, likes: r.likes });
    });

    // Récupérer et trier les cartes
    const container = document.querySelector('.articles-grid__cards');
    if (!container) return;

    const cards = Array.from(container.querySelectorAll('.article-card'));

    cards.sort((a, b) => {
      const slugA = a.dataset.slug;
      const slugB = b.dataset.slug;
      const rankA = rankMap.get(slugA);
      const rankB = rankMap.get(slugB);

      // Articles avec votes en premier, triés par score
      if (rankA && rankB) {
        return rankB.score - rankA.score || rankB.likes - rankA.likes;
      }
      if (rankA) return -1;
      if (rankB) return 1;
      return 0; // Garder l'ordre relatif pour les articles sans votes
    });

    // Réordonner le DOM
    cards.forEach(card => container.appendChild(card));

    // Afficher tous les articles (retirer le filtre catégorie)
    cards.forEach(card => card.style.display = '');
    activeFilter = null;
  }

  function resetToDefaultOrder() {
    const container = document.querySelector('.articles-grid__cards');
    if (!container) return;

    // Trier par l'ordre original (basé sur allArticles)
    const cards = Array.from(container.querySelectorAll('.article-card'));
    const slugOrder = allArticles.map(a => a.filename.replace('.html', ''));

    cards.sort((a, b) => {
      const indexA = slugOrder.indexOf(a.dataset.slug);
      const indexB = slugOrder.indexOf(b.dataset.slug);
      return indexA - indexB;
    });

    cards.forEach(card => container.appendChild(card));

    // Réappliquer le filtre si nécessaire
    if (activeFilter) {
      filterArticles(activeFilter);
    }
  }

  function renderArticles(articles, container) {
    allArticles = articles;

    if (articles.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state__icon">📝</div>
          <p>Aucun article pour le moment.<br>Les premiers contenus arrivent bientôt.</p>
        </div>
      `;
      return;
    }

    const filtersHTML = createCategoryFilters();
    const articlesHTML = articles.map((article, index) => createArticleCard(article, index)).join('');

    // Note explicative sur l'ordre des articles
    const orderNoteHTML = articles.length > 3 ? `
      <p class="articles-grid__order-note">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"></circle>
          <path d="M12 16v-4M12 8h.01"></path>
        </svg>
        Les 3 premiers articles sont les plus récents. Les autres sont mélangés chaque jour pour vous faire découvrir l'ensemble de nos analyses.
      </p>
    ` : '';

    container.innerHTML = `
      ${filtersHTML}
      ${orderNoteHTML}
      <div class="articles-grid__cards">
        ${articlesHTML}
      </div>
    `;

    initCategoryFilters();
  }

  function showLoader(container) {
    container.innerHTML = `
      <div class="loader">
        <div class="loader__spinner"></div>
      </div>
    `;
  }

  // ========================================
  // Affichage d'un article brut (page article.html)
  // ========================================

  async function loadRawArticle() {
    const container = document.getElementById('article-content');
    if (!container) return;

    const params = new URLSearchParams(window.location.search);
    const filename = params.get('file');

    if (!filename) {
      container.innerHTML = '<p>Article non trouvé.</p>';
      return;
    }

    try {
      const url = CONFIG.articles.path + filename;
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const htmlContent = await response.text();
      const title = extractTitle(htmlContent, filename);
      const date = extractDate(filename, htmlContent);
      const formattedDate = formatDate(date);

      // Mettre à jour le titre de la page
      document.title = `${title} - ${CONFIG.siteName}`;

      // Mettre à jour les meta tags
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.content = extractExcerpt(htmlContent);
      }

      // Chercher thumbnail
      const thumbnail = findThumbnail(CONFIG.articles.path, filename);

      // Construire l'affichage
      container.innerHTML = `
        <article class="article">
          <header class="article__header">
            <p class="article__meta">
              <time datetime="${date.toISOString()}">${formattedDate}</time>
            </p>
            <h1 class="article__title">${title}</h1>
          </header>

          ${thumbnail !== CONFIG.articles.defaultThumbnail ? `
          <figure class="article__hero-image">
            <img src="${thumbnail}" alt="${title}" loading="eager">
          </figure>
          ` : ''}

          <div class="article__content">
            ${processRawContent(htmlContent)}
          </div>

          <nav class="mt-lg">
            <a href="/" class="btn btn--secondary">← Retour aux articles</a>
          </nav>
        </article>
      `;

    } catch (error) {
      console.error('Erreur chargement article:', error);
      container.innerHTML = `
        <div class="error-page">
          <h1>Article non trouvé</h1>
          <p>L'article demandé n'existe pas ou a été supprimé.</p>
          <a href="/" class="btn btn--primary">Retour à l'accueil</a>
        </div>
      `;
    }
  }

  /**
   * Nettoie et structure le contenu brut d'un article
   */
  function processRawContent(htmlContent) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');

    // Retirer le premier h1 (déjà affiché dans le header)
    const firstH1 = doc.querySelector('h1');
    if (firstH1) {
      firstH1.remove();
    }

    // Retourner le contenu nettoyé
    return doc.body.innerHTML;
  }

  // ========================================
  // Navigation mobile
  // ========================================

  function initMobileNav() {
    const toggle = document.getElementById('nav-toggle');
    const nav = document.getElementById('main-nav');

    if (!toggle || !nav) return;

    toggle.addEventListener('click', () => {
      nav.classList.toggle('nav--open');
      const isOpen = nav.classList.contains('nav--open');
      toggle.setAttribute('aria-expanded', isOpen);
    });

    nav.addEventListener('click', (e) => {
      if (e.target.classList.contains('nav__link')) {
        nav.classList.remove('nav--open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });

    document.addEventListener('click', (e) => {
      if (!nav.contains(e.target) && !toggle.contains(e.target)) {
        nav.classList.remove('nav--open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // ========================================
  // Système de vote
  // ========================================

  const VoteManager = {
    API_URL: '/api/vote.php',
    ranking: [], // Cache du classement

    // Charger les votes pour plusieurs articles (batch)
    async loadBatchVotes(slugs) {
      if (!slugs || slugs.length === 0) return {};
      try {
        const response = await fetch(`${this.API_URL}?articles=${encodeURIComponent(slugs.join(','))}`, {
          credentials: 'include' // Important pour les cookies
        });
        if (!response.ok) return {};
        const data = await response.json();
        return data.votes || {};
      } catch (error) {
        console.error('Erreur chargement votes batch:', error);
        return {};
      }
    },

    // Charger les votes pour un seul article
    async loadVotes(slug) {
      try {
        const response = await fetch(`${this.API_URL}?article=${encodeURIComponent(slug)}`, {
          credentials: 'include'
        });
        if (!response.ok) return null;
        return await response.json();
      } catch (error) {
        console.error('Erreur chargement votes:', error);
        return null;
      }
    },

    // Charger le classement par votes
    async loadRanking() {
      try {
        const response = await fetch(`${this.API_URL}?ranking=true`, {
          credentials: 'include'
        });
        if (!response.ok) return [];
        const data = await response.json();
        this.ranking = data.ranking || [];
        return this.ranking;
      } catch (error) {
        console.error('Erreur chargement ranking:', error);
        return [];
      }
    },

    // Envoyer un vote
    async sendVote(slug, voteType) {
      try {
        const response = await fetch(this.API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ article: slug, vote: voteType })
        });
        if (!response.ok) return null;
        return await response.json();
      } catch (error) {
        console.error('Erreur envoi vote:', error);
        return null;
      }
    },

    // Mettre à jour l'affichage d'un composant de vote
    updateVoteDisplay(container, data) {
      if (!container || !data) return;

      const likesEl = container.querySelector('[data-count="likes"]');
      const dislikesEl = container.querySelector('[data-count="dislikes"]');
      const likeBtn = container.querySelector('[data-vote="1"]');
      const dislikeBtn = container.querySelector('[data-vote="-1"]');

      if (likesEl) likesEl.textContent = data.likes || 0;
      if (dislikesEl) dislikesEl.textContent = data.dislikes || 0;
      if (likeBtn) likeBtn.classList.toggle('active', data.userVote === 1);
      if (dislikeBtn) dislikeBtn.classList.toggle('active', data.userVote === -1);
    },

    // Mettre à jour tous les affichages pour un slug
    updateAllDisplaysForSlug(slug, data) {
      document.querySelectorAll(`[data-slug="${slug}"]`).forEach(container => {
        this.updateVoteDisplay(container, data);
      });
    },

    // Gérer le clic sur un bouton de vote
    async handleVoteClick(e) {
      const btn = e.target.closest('[data-vote]');
      if (!btn) return;

      const container = btn.closest('[data-slug]');
      if (!container) return;

      const slug = container.dataset.slug;
      const voteType = parseInt(btn.dataset.vote, 10);
      const isActive = btn.classList.contains('active');

      // Désactiver les boutons pendant la requête
      const buttons = container.querySelectorAll('[data-vote]');
      buttons.forEach(b => b.disabled = true);

      const data = await this.sendVote(slug, isActive ? 0 : voteType);

      buttons.forEach(b => b.disabled = false);

      if (data) {
        this.updateAllDisplaysForSlug(slug, data);
      }
    },

    // Initialiser les votes pour les cartes d'articles
    async initCardVotes() {
      const cards = document.querySelectorAll('.article-card[data-slug]');
      if (cards.length === 0) return;

      const slugs = Array.from(cards).map(card => card.dataset.slug).filter(Boolean);
      const votes = await this.loadBatchVotes(slugs);

      Object.entries(votes).forEach(([slug, data]) => {
        this.updateAllDisplaysForSlug(slug, data);
      });

      // Ajouter les écouteurs d'événements (délégation)
      const gridContainer = document.querySelector('.articles-grid__cards');
      if (gridContainer) {
        gridContainer.addEventListener('click', (e) => {
          const voteBtn = e.target.closest('[data-vote]');
          if (voteBtn) {
            e.preventDefault();
            e.stopPropagation();
            this.handleVoteClick(e);
          }
        });
      } else {
        console.error('VoteManager: .articles-grid__cards not found');
      }
    },

    // Créer le HTML du composant de vote pour les articles
    createArticleVoteHTML(position) {
      return `
        <div class="article-vote article-vote--${position}" data-position="${position}">
          <span class="article-vote__label">Cet article vous a-t-il été utile ?</span>
          <div class="article-vote__buttons">
            <button class="article-vote__btn article-vote__btn--like" data-vote="1" aria-label="J'aime">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>
              <span class="article-vote__count" data-count="likes">0</span>
            </button>
            <button class="article-vote__btn article-vote__btn--dislike" data-vote="-1" aria-label="Je n'aime pas">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"/></svg>
              <span class="article-vote__count" data-count="dislikes">0</span>
            </button>
          </div>
        </div>
      `;
    },

    // Initialiser les votes pour une page article
    async initArticleVotes() {
      const path = window.location.pathname;
      const match = path.match(/\/articles\/([a-z0-9-]+)\.html$/);
      if (!match) return;

      const slug = match[1];

      // Points d'insertion
      const heroImage = document.querySelector('.article__hero-image');
      const sources = document.querySelector('.article__sources');
      const dataViz = document.querySelector('.article__data-viz');

      // Insérer en haut (après hero image)
      if (heroImage) {
        const topVote = this.createArticleVoteHTML('top');
        heroImage.insertAdjacentHTML('afterend', `<div data-slug="${slug}">${topVote}</div>`);
      }

      // Insérer en bas (avant sources ou data-viz)
      const bottomInsertPoint = sources || dataViz;
      if (bottomInsertPoint) {
        const bottomVote = this.createArticleVoteHTML('bottom');
        bottomInsertPoint.insertAdjacentHTML('beforebegin', `<div data-slug="${slug}">${bottomVote}</div>`);
      }

      // Charger les votes
      const data = await this.loadVotes(slug);
      if (data) {
        this.updateAllDisplaysForSlug(slug, data);
      }

      // Ajouter les écouteurs
      document.querySelectorAll('.article-vote').forEach(container => {
        container.addEventListener('click', (e) => {
          if (e.target.closest('[data-vote]')) {
            e.preventDefault();
            this.handleVoteClick(e);
          }
        });
      });
    }
  };

  // ========================================
  // Recherche
  // ========================================

  const SearchManager = {
    modal: null,
    input: null,
    results: null,
    isOpen: false,
    articlesLoaded: false,
    previousActiveElement: null,

    init() {
      this.createModal();
      this.bindEvents();
    },

    async ensureArticlesLoaded() {
      if (this.articlesLoaded || allArticles.length > 0) {
        this.articlesLoaded = true;
        return;
      }

      try {
        const articles = await loadArticles();
        allArticles = articles;
        this.articlesLoaded = true;
      } catch (error) {
        console.error('Erreur chargement articles pour recherche:', error);
      }
    },

    createModal() {
      const modalHTML = `
        <div class="search-modal" id="search-modal" role="dialog" aria-modal="true" aria-label="Rechercher">
          <div class="search-modal__container">
            <div class="search-modal__header">
              <svg class="search-modal__icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="M21 21l-4.35-4.35"></path>
              </svg>
              <input type="text" class="search-modal__input" id="search-input" placeholder="Rechercher un article..." autocomplete="off">
              <button class="search-modal__close" id="search-close">Esc</button>
            </div>
            <div class="search-modal__results" id="search-results">
              <div class="search-modal__hint">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <circle cx="11" cy="11" r="8"></circle>
                  <path d="M21 21l-4.35-4.35"></path>
                </svg>
                Tapez pour rechercher dans les titres et contenus des articles
              </div>
            </div>
          </div>
        </div>
      `;

      document.body.insertAdjacentHTML('beforeend', modalHTML);

      this.modal = document.getElementById('search-modal');
      this.input = document.getElementById('search-input');
      this.results = document.getElementById('search-results');
    },

    bindEvents() {
      // Toggle button - utiliser délégation d'événements pour gérer le timing
      document.addEventListener('click', (e) => {
        const toggleBtn = e.target.closest('#search-toggle, .header__search-btn');
        if (toggleBtn) {
          e.preventDefault();
          this.open();
        }
      });

      // Close button
      const closeBtn = document.getElementById('search-close');
      if (closeBtn) {
        closeBtn.addEventListener('click', () => this.close());
      }

      // Click outside to close
      if (this.modal) {
        this.modal.addEventListener('click', (e) => {
          if (e.target === this.modal) {
            this.close();
          }
        });
      }

      // Keyboard shortcuts
      document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + K to open
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
          e.preventDefault();
          this.toggle();
        }
        // Escape to close
        if (e.key === 'Escape' && this.isOpen) {
          this.close();
        }
        // Focus trap - Tab key handling
        if (e.key === 'Tab' && this.isOpen) {
          this.handleFocusTrap(e);
        }
      });

      // Search on input
      if (this.input) {
        this.input.addEventListener('input', () => {
          this.search(this.input.value);
        });
      }
    },

    async open() {
      if (!this.modal) return;
      // Sauvegarder l'élément actif pour y revenir à la fermeture
      this.previousActiveElement = document.activeElement;
      this.modal.classList.add('search-modal--open');
      this.isOpen = true;
      document.body.style.overflow = 'hidden';
      setTimeout(() => this.input?.focus(), 100);

      // Charger les articles si pas encore fait (pour pages autres que accueil)
      await this.ensureArticlesLoaded();
    },

    close() {
      if (!this.modal) return;
      this.modal.classList.remove('search-modal--open');
      this.isOpen = false;
      document.body.style.overflow = '';
      if (this.input) this.input.value = '';
      this.showHint();
      // Restaurer le focus sur l'élément précédent
      if (this.previousActiveElement) {
        this.previousActiveElement.focus();
        this.previousActiveElement = null;
      }
    },

    toggle() {
      this.isOpen ? this.close() : this.open();
    },

    handleFocusTrap(e) {
      const focusableElements = this.modal.querySelectorAll(
        'input, button, a[href], [tabindex]:not([tabindex="-1"])'
      );
      const focusable = Array.from(focusableElements).filter(el => !el.disabled && el.offsetParent !== null);

      if (focusable.length === 0) return;

      const firstElement = focusable[0];
      const lastElement = focusable[focusable.length - 1];

      if (e.shiftKey) {
        // Shift + Tab : si on est sur le premier, aller au dernier
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab : si on est sur le dernier, aller au premier
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    },

    showHint() {
      if (!this.results) return;
      this.results.innerHTML = `
        <div class="search-modal__hint">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="M21 21l-4.35-4.35"></path>
          </svg>
          Tapez pour rechercher dans les titres et contenus des articles
        </div>
      `;
    },

    search(query) {
      if (!this.results) return;

      const trimmedQuery = query.trim().toLowerCase();

      if (trimmedQuery.length < 2) {
        this.showHint();
        return;
      }

      // Search through all loaded articles
      const matches = allArticles.filter(article => {
        const titleMatch = article.title.toLowerCase().includes(trimmedQuery);
        const excerptMatch = article.excerpt.toLowerCase().includes(trimmedQuery);
        const categoryMatch = article.category?.label.toLowerCase().includes(trimmedQuery);
        return titleMatch || excerptMatch || categoryMatch;
      });

      this.renderResults(matches, trimmedQuery);
    },

    highlightText(text, query) {
      if (!query) return text;
      const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
      return text.replace(regex, '<mark>$1</mark>');
    },

    renderResults(matches, query) {
      if (matches.length === 0) {
        this.results.innerHTML = `
          <div class="search-modal__empty">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M8 15s1.5-2 4-2 4 2 4 2"></path>
              <line x1="9" y1="9" x2="9.01" y2="9"></line>
              <line x1="15" y1="9" x2="15.01" y2="9"></line>
            </svg>
            Aucun article trouvé pour "<strong>${query}</strong>"
          </div>
        `;
        return;
      }

      const countHTML = `<div class="search-modal__count">${matches.length} résultat${matches.length > 1 ? 's' : ''}</div>`;

      const resultsHTML = matches.map(article => {
        const categoryBadge = article.category
          ? `<span class="search-modal__result-category" style="background-color: ${article.category.color}">${article.category.label}</span>`
          : '';

        return `
          <a href="${article.url}" class="search-modal__result">
            ${categoryBadge}
            <div class="search-modal__result-title">${this.highlightText(article.title, query)}</div>
            <div class="search-modal__result-excerpt">${this.highlightText(article.excerpt, query)}</div>
          </a>
        `;
      }).join('');

      this.results.innerHTML = countHTML + resultsHTML;
    }
  };

  // ========================================
  // Newsletter
  // ========================================

  const NewsletterManager = {
    form: null,
    input: null,
    button: null,
    status: null,

    init() {
      this.form = document.getElementById('newsletter-form');
      if (!this.form) return;

      this.input = this.form.querySelector('input[type="email"]');
      this.button = this.form.querySelector('button[type="submit"]');
      this.status = document.getElementById('newsletter-status');

      this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    },

    async handleSubmit(e) {
      e.preventDefault();

      const email = this.input?.value?.trim();
      if (!email) return;

      // Désactiver le bouton pendant la requête
      if (this.button) {
        this.button.disabled = true;
        this.button.textContent = 'Envoi...';
      }

      this.setStatus('', '');

      try {
        const response = await fetch('/api/newsletter.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        });

        const data = await response.json();

        if (data.success) {
          this.setStatus(data.message, 'success');
          this.input.value = '';
        } else {
          this.setStatus(data.message || 'Une erreur est survenue.', 'error');
        }
      } catch (error) {
        console.error('Erreur newsletter:', error);
        this.setStatus('Erreur de connexion. Veuillez réessayer.', 'error');
      } finally {
        if (this.button) {
          this.button.disabled = false;
          this.button.textContent = "S'inscrire";
        }
      }
    },

    setStatus(message, type) {
      if (!this.status) return;
      this.status.textContent = message;
      this.status.className = 'footer__newsletter-status' + (type ? ' ' + type : '');
    }
  };

  // ========================================
  // Initialisation
  // ========================================

  async function init() {
    const headerInclude = document.getElementById('header-include');
    const footerInclude = document.getElementById('footer-include');

    if (headerInclude || footerInclude) {
      await IncludesManager.init();
    } else {
      ThemeManager.bindToggle();
      initMobileNav();
    }

    // Initialiser la recherche
    SearchManager.init();

    // Page d'accueil : charger la grille d'articles
    const articlesGrid = document.getElementById('articles-grid');
    if (articlesGrid) {
      showLoader(articlesGrid);
      try {
        const articles = await loadArticles();
        renderArticles(articles, articlesGrid);
        // Initialiser les votes sur les cartes
        await VoteManager.initCardVotes();
      } catch (error) {
        console.error('Erreur chargement articles:', error);
        articlesGrid.innerHTML = `
          <div class="empty-state">
            <p>Une erreur est survenue lors du chargement des articles.</p>
          </div>
        `;
      }
    }

    // Page article : charger l'article brut
    const articleContent = document.getElementById('article-content');
    if (articleContent) {
      await loadRawArticle();
    }

    // Initialiser les votes pour les pages article (insertion automatique)
    await VoteManager.initArticleVotes();

    // Initialiser la newsletter
    NewsletterManager.init();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
