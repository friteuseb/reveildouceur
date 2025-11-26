/**
 * Réveil Douceur - Configuration centralisée
 * ==========================================
 * Modifiez ce fichier pour personnaliser votre site.
 */

const SITE_CONFIG = {
  // ========================================
  // Informations générales
  // ========================================
  siteName: 'Réveil Douceur',
  tagline: 'Éveil scientifique et bienveillant',
  description: 'Un espace d\'éveil doux basé sur des faits scientifiques et des études sourcées.',
  url: 'https://reveildouceur.fr',
  language: 'fr-FR',
  year: new Date().getFullYear(),

  // ========================================
  // Contact
  // ========================================
  email: 'contact@reveildouceur.fr',
  // ID Formspree pour le formulaire (créez un compte sur formspree.io)
  formspreeId: 'VOTRE_ID',

  // ========================================
  // Réseaux sociaux (laissez vide si non utilisé)
  // ========================================
  social: {
    twitter: '',
    facebook: '',
    linkedin: '',
    instagram: ''
  },

  // ========================================
  // Configuration des articles
  // ========================================
  articles: {
    path: '/articles/',
    defaultThumbnail: '/images/default-thumbnail.svg',
    thumbnailFormats: ['webp', 'jpg', 'jpeg', 'png', 'svg'],
    excerptLength: 200,
    // Fichiers à ignorer dans le listing
    ignoreFiles: ['index.html', 'index.json']
  },

  // ========================================
  // Navigation
  // ========================================
  navigation: [
    { label: 'Accueil', href: '/', id: 'home' },
    { label: 'À propos', href: '/a-propos.html', id: 'about' },
    { label: 'Contact', href: '/contact.html', id: 'contact' }
  ],

  // ========================================
  // Liens du footer
  // ========================================
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

  // ========================================
  // Thème
  // ========================================
  theme: {
    // Respecter la préférence système par défaut
    respectSystemPreference: true,
    // Thème par défaut si pas de préférence ('light' ou 'dark')
    default: 'light'
  },

  // ========================================
  // SEO
  // ========================================
  seo: {
    titleSuffix: ' - Réveil Douceur',
    ogImage: '/images/og-image.svg'
  }
};

// Export pour utilisation dans d'autres scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SITE_CONFIG;
}
