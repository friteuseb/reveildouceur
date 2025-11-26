/**
 * Réveil Douceur - Application JavaScript
 * Version 2.1 - Support articles bruts
 */

(function() {
  'use strict';

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
      { label: 'À propos', href: '/a-propos.html', id: 'about' },
      { label: 'Contact', href: '/contact.html', id: 'contact' }
    ],
    footerLinks: {
      main: [
        { label: 'Accueil', href: '/' },
        { label: 'À propos', href: '/a-propos.html' },
        { label: 'Contact', href: '/contact.html' }
      ],
      legal: [
        { label: 'Mentions légales', href: '/mentions-legales.html' },
        { label: 'Confidentialité', href: '/confidentialite.html' }
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
      const toggle = document.getElementById('theme-toggle');
      if (toggle) {
        toggle.setAttribute('aria-label',
          theme === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre'
        );
      }
    },

    toggle() {
      const current = document.documentElement.getAttribute('data-theme') || 'light';
      const next = current === 'dark' ? 'light' : 'dark';
      localStorage.setItem(this.STORAGE_KEY, next);
      this.applyTheme(next);
    },

    bindToggle() {
      const toggle = document.getElementById('theme-toggle');
      if (toggle) {
        toggle.addEventListener('click', () => this.toggle());
      }
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
   * Formate une date en français
   */
  function formatDate(date) {
    if (!(date instanceof Date) || isNaN(date)) {
      return 'Date inconnue';
    }
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  // ========================================
  // Chargement des articles
  // ========================================

  async function fetchDirectoryListing(path) {
    // Méthode 1: Essayer de charger index.json (le plus fiable)
    try {
      const jsonResponse = await fetch(path + 'index.json');
      if (jsonResponse.ok) {
        const files = await jsonResponse.json();
        console.log('Articles chargés depuis index.json:', files);
        const ignoreList = CONFIG.articles?.ignoreFiles || [];
        const filtered = files.filter(f => {
          if (ignoreList.includes(f)) return false;
          if (f.includes('template')) return false;
          return f.endsWith('.html');
        });
        console.log('Articles filtrés:', filtered);
        return filtered;
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
          // Aussi vérifier le texte du lien (Python http.server)
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

  function findThumbnail(basePath, filename) {
    const baseName = filename.replace('.html', '');
    // On assume que le SVG existe toujours avec le même nom que le HTML
    // Fallback via onerror dans l'img si le fichier n'existe pas
    return `${basePath}${baseName}.svg`;
  }

  async function fetchArticleMetadata(filename) {
    try {
      const url = CONFIG.articles.path + filename;
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const htmlContent = await response.text();

      const title = extractTitle(htmlContent, filename);
      const excerpt = extractExcerpt(htmlContent);
      const date = extractDate(filename, htmlContent);
      const isRaw = isRawArticle(htmlContent);
      const thumbnail = findThumbnail(CONFIG.articles.path, filename);

      return {
        filename,
        url: isRaw ? `/article.html?file=${encodeURIComponent(filename)}` : CONFIG.articles.path + filename,
        rawUrl: CONFIG.articles.path + filename,
        title,
        excerpt,
        date,
        thumbnail,
        isRaw
      };
    } catch (error) {
      console.error(`Erreur chargement ${filename}:`, error);
      return null;
    }
  }

  async function loadArticles() {
    const filenames = await fetchDirectoryListing(CONFIG.articles.path);
    if (filenames.length === 0) return [];

    const articlePromises = filenames.map(fetchArticleMetadata);
    const articles = await Promise.all(articlePromises);

    return articles
      .filter(article => article !== null)
      .sort((a, b) => b.date - a.date);
  }

  // ========================================
  // Rendu des articles
  // ========================================

  function createArticleCard(article) {
    const formattedDate = formatDate(article.date);

    return `
      <article class="article-card">
        <div class="article-card__image">
          <a href="${article.url}" aria-label="Lire ${article.title}">
            <img
              src="${article.thumbnail}"
              alt="${article.title}"
              loading="lazy"
              onerror="this.src='${CONFIG.articles.defaultThumbnail}'"
            >
          </a>
        </div>
        <div class="article-card__content">
          <time class="article-card__date" datetime="${article.date.toISOString()}">${formattedDate}</time>
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

  function renderArticles(articles, container) {
    if (articles.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state__icon">📝</div>
          <p>Aucun article pour le moment.<br>Les premiers contenus arrivent bientôt.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = articles.map(createArticleCard).join('');
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

    // Page d'accueil : charger la grille d'articles
    const articlesGrid = document.getElementById('articles-grid');
    if (articlesGrid) {
      showLoader(articlesGrid);
      try {
        const articles = await loadArticles();
        renderArticles(articles, articlesGrid);
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
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
