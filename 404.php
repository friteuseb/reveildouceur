<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <title>Page introuvable - Réveil Douceur</title>
  <meta name="robots" content="noindex, nofollow">

  <!-- Theme Color -->
  <meta name="theme-color" content="#5B7B6F" media="(prefers-color-scheme: light)">
  <meta name="theme-color" content="#1A1D1E" media="(prefers-color-scheme: dark)">

  <!-- Favicon -->
  <link rel="icon" type="image/svg+xml" href="/images/favicon.svg">

  <!-- Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Playfair+Display:wght@600;700&display=swap" rel="stylesheet">

  <!-- Styles -->
  <link rel="stylesheet" href="/css/style.css">

  <!-- Config -->
  <script src="/js/config.js"></script>

  <!-- Analytics -->
  <?php include 'includes/analytics.php'; ?>
</head>
<body>
  <a href="#main-content" class="skip-link">Aller au contenu principal</a>

  <?php include 'includes/header.php'; ?>

  <main id="main-content">
    <div class="container">
      <div class="error-page">
        <div class="error-page__code">404</div>
        <h1 class="error-page__title">Page introuvable</h1>
        <p class="error-page__text">
          La page que vous recherchez semble avoir disparu ou n'a jamais existé.<br>
          Pas de panique, même les meilleurs explorateurs se perdent parfois.
        </p>
        <a href="/" class="btn btn--primary">Retour à l'accueil</a>
      </div>
    </div>
  </main>

  <?php include 'includes/footer.php'; ?>

  <script src="/js/app.js"></script>
</body>
</html>
