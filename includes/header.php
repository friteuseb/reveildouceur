<header class="header">
  <!-- Barre supérieure -->
  <div class="header__topbar">
    <div class="container header__topbar-inner">
      <span class="header__tagline">Questionnez. Vérifiez. Pensez par vous-même.</span>
      <div class="header__topbar-actions">
        <button class="theme-toggle" id="theme-toggle" aria-label="Changer de thème" title="Changer de thème">
          <svg class="theme-toggle__icon theme-toggle__icon--light" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="5"></circle>
            <line x1="12" y1="1" x2="12" y2="3"></line>
            <line x1="12" y1="21" x2="12" y2="23"></line>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
            <line x1="1" y1="12" x2="3" y2="12"></line>
            <line x1="21" y1="12" x2="23" y2="12"></line>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
          </svg>
          <svg class="theme-toggle__icon theme-toggle__icon--dark" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
          </svg>
        </button>
      </div>
    </div>
  </div>

  <!-- Header principal -->
  <div class="header__main">
    <div class="container header__main-inner">
      <a href="/" class="header__monogram" aria-label="Retour à l'accueil" title="Accueil"><span class="header__monogram-r">R</span><span class="header__monogram-d">D</span></a>
      <a href="/" class="header__logo">
        <span class="header__logo-text">Réveil</span>
        <span class="header__logo-accent">Douceur</span>
      </a>
    </div>
  </div>

  <!-- Navigation -->
  <div class="header__navbar">
    <div class="container header__navbar-inner">
      <button class="nav-toggle" id="nav-toggle" aria-label="Menu" aria-expanded="false">
        <span class="nav-toggle__bars">
          <span class="nav-toggle__bar"></span>
          <span class="nav-toggle__bar"></span>
          <span class="nav-toggle__bar"></span>
        </span>
        <span class="nav-toggle__label">Menu</span>
      </button>

      <nav class="nav" id="main-nav" role="navigation" aria-label="Navigation principale">
        <?php
        $current_page = basename($_SERVER['PHP_SELF']);
        $nav_items = [
          ['href' => '/', 'file' => 'index.php', 'label' => 'Accueil'],
          ['href' => '/a-propos.php', 'file' => 'a-propos.php', 'label' => 'À propos'],
          ['href' => '/contact.php', 'file' => 'contact.php', 'label' => 'Contact']
        ];
        foreach ($nav_items as $item):
          $is_active = ($current_page === $item['file']) ? ' nav__link--active' : '';
        ?>
        <a href="<?= $item['href'] ?>" class="nav__link<?= $is_active ?>"><?= $item['label'] ?></a>
        <?php endforeach; ?>
      </nav>

      <div class="header__actions">
        <button class="theme-toggle theme-toggle--mobile" id="theme-toggle-mobile" aria-label="Changer de thème" title="Changer de thème">
          <svg class="theme-toggle__icon theme-toggle__icon--light" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="5"></circle>
            <line x1="12" y1="1" x2="12" y2="3"></line>
            <line x1="12" y1="21" x2="12" y2="23"></line>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
            <line x1="1" y1="12" x2="3" y2="12"></line>
            <line x1="21" y1="12" x2="23" y2="12"></line>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
          </svg>
          <svg class="theme-toggle__icon theme-toggle__icon--dark" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
          </svg>
        </button>
        <button class="header__search-btn" aria-label="Rechercher" title="Rechercher">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="M21 21l-4.35-4.35"></path>
          </svg>
        </button>
      </div>
    </div>
  </div>
</header>
