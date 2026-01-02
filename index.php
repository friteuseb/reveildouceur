<?php
/**
 * Page d'accueil avec formulaire de suggestion
 */
session_start();

// Génération du token CSRF
if (empty($_SESSION['csrf_token'])) {
    $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
}

// Timestamp pour vérification temporelle anti-bot
$form_time = time();

// Rate limiting : max 3 suggestions par heure
if (!isset($_SESSION['suggestion_count'])) {
    $_SESSION['suggestion_count'] = 0;
    $_SESSION['suggestion_reset'] = time() + 3600;
}
if (time() > $_SESSION['suggestion_reset']) {
    $_SESSION['suggestion_count'] = 0;
    $_SESSION['suggestion_reset'] = time() + 3600;
}

$suggestion_message = '';
$suggestion_type = '';

// Traitement du formulaire de suggestion
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['suggestion_form'])) {
    // Honeypot check
    if (!empty($_POST['website'])) {
        $suggestion_message = "Merci pour votre suggestion !";
        $suggestion_type = 'success';
    }
    // CSRF check
    elseif (!isset($_POST['csrf_token']) || $_POST['csrf_token'] !== $_SESSION['csrf_token']) {
        $suggestion_message = "Erreur de sécurité. Veuillez rafraîchir la page.";
        $suggestion_type = 'error';
    }
    // Time check (minimum 3 seconds)
    elseif (isset($_POST['form_time']) && (time() - intval($_POST['form_time'])) < 3) {
        $suggestion_message = "Merci pour votre suggestion !";
        $suggestion_type = 'success';
    }
    // Rate limiting check
    elseif ($_SESSION['suggestion_count'] >= 3) {
        $suggestion_message = "Trop de suggestions. Réessayez dans une heure.";
        $suggestion_type = 'error';
    }
    else {
        $topic = trim(filter_input(INPUT_POST, 'topic', FILTER_SANITIZE_SPECIAL_CHARS) ?? '');
        $email = trim(filter_input(INPUT_POST, 'email', FILTER_SANITIZE_EMAIL) ?? '');

        if (strlen($topic) < 5) {
            $suggestion_message = "Votre suggestion doit contenir au moins 5 caractères.";
            $suggestion_type = 'error';
        } else {
            // Envoi de l'email
            $configFile = __DIR__ . '/config/mail.php';

            if (file_exists($configFile)) {
                $config = require $configFile;
                require_once __DIR__ . '/includes/Mailer.php';

                $mailer = new Mailer($config['smtp']);

                $emailSubject = "[Réveil Douceur] Suggestion de sujet";
                $emailBody = "Nouvelle suggestion de sujet\n";
                $emailBody .= "============================\n\n";
                $emailBody .= "Sujet proposé :\n" . $topic . "\n\n";
                if (!empty($email)) {
                    $emailBody .= "Email (optionnel) : " . $email . "\n\n";
                }
                $emailBody .= "============================\n";
                $emailBody .= "Envoyé le " . date('d/m/Y à H:i') . "\n";
                $emailBody .= "IP : " . ($_SERVER['REMOTE_ADDR'] ?? 'inconnue') . "\n";

                $sent = $mailer->send(
                    $config['recipient']['email'],
                    $config['recipient']['name'],
                    $emailSubject,
                    $emailBody
                );

                if ($sent) {
                    $suggestion_message = "Merci pour votre suggestion ! Nous la lirons avec attention.";
                    $suggestion_type = 'success';
                    $_SESSION['suggestion_count']++;
                    $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
                } else {
                    $suggestion_message = "Erreur lors de l'envoi. Réessayez plus tard.";
                    $suggestion_type = 'error';
                }
            } else {
                $suggestion_message = "Configuration manquante.";
                $suggestion_type = 'error';
            }
        }
    }
}
?>
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <!-- SEO Meta Tags -->
  <title>Réveil Douceur - Questionnez. Vérifiez. Pensez par vous-même.</title>
  <meta name="description" content="Et si on se posait les bonnes questions ? Un espace de réflexion basé sur des sources vérifiables. Ni alarmisme, ni complotisme. Juste des faits et des questions.">
  <meta name="keywords" content="réflexion, sources, faits, questions, analyse, décryptage, société">
  <meta name="author" content="Réveil Douceur">
  <link rel="canonical" href="https://reveildouceur.fr/">

  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://reveildouceur.fr/">
  <meta property="og:title" content="Réveil Douceur - Questionnez. Vérifiez. Pensez par vous-même.">
  <meta property="og:description" content="Et si on se posait les bonnes questions ? Un espace de réflexion sourcé, sans alarmisme ni complotisme.">
  <meta property="og:image" content="https://reveildouceur.fr/images/og-image.svg">
  <meta property="og:locale" content="fr_FR">
  <meta property="og:site_name" content="Réveil Douceur">

  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:url" content="https://reveildouceur.fr/">
  <meta name="twitter:title" content="Réveil Douceur - Questionnez. Vérifiez. Pensez par vous-même.">
  <meta name="twitter:description" content="Et si on se posait les bonnes questions ? Un espace de réflexion sourcé, sans alarmisme ni complotisme.">
  <meta name="twitter:image" content="https://reveildouceur.fr/images/og-image.svg">

  <!-- Theme Color -->
  <meta name="theme-color" content="#5B7B6F" media="(prefers-color-scheme: light)">
  <meta name="theme-color" content="#1A1D1E" media="(prefers-color-scheme: dark)">

  <!-- Favicon -->
  <link rel="icon" type="image/svg+xml" href="/images/favicon.svg">
  <link rel="apple-touch-icon" href="/images/apple-touch-icon.png">

  <!-- Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Playfair+Display:wght@400;600;700&display=swap" rel="stylesheet">

  <!-- Styles -->
  <link rel="stylesheet" href="/css/style.css">

  <!-- Schema.org JSON-LD -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Réveil Douceur",
    "description": "Et si on se posait les bonnes questions ? Un espace de réflexion basé sur des sources vérifiables.",
    "url": "https://reveildouceur.fr/",
    "inLanguage": "fr-FR",
    "publisher": {
      "@type": "Organization",
      "name": "Réveil Douceur",
      "logo": {
        "@type": "ImageObject",
        "url": "https://reveildouceur.fr/images/logo.svg"
      }
    }
  }
  </script>

  <!-- Config (à charger avant app.js) -->
  <script src="/js/config.js"></script>

  <!-- Analytics -->
  <?php include 'includes/analytics.php'; ?>
</head>
<body>
  <!-- Skip Link (accessibilité) -->
  <a href="#main-content" class="skip-link">Aller au contenu principal</a>

  <!-- Header -->
  <?php include 'includes/header.php'; ?>

  <main id="main-content">
    <!-- Hero Section -->
    <section class="hero hero--compact">
      <div class="hero__background">
        <div class="hero__gradient"></div>
        <div class="hero__pattern"></div>
      </div>
      <div class="container hero__content">
        <p class="hero__intro">
          Vous avez parfois l'impression que quelque chose ne colle pas ?
          Que les explications sont trop simples ?
        </p>
        <h1 class="hero__title">
          <span class="hero__title-line">Et si on se posait</span>
          <span class="hero__title-accent">les bonnes questions ?</span>
        </h1>
      </div>
    </section>

    <!-- Articles Section -->
    <section class="articles-section" id="articles-section">
      <div class="container">
        <div class="articles-section__header">
          <div class="articles-section__title-group">
            <span class="articles-section__label">Explorer</span>
            <h2 class="articles-section__title">Derniers articles</h2>
          </div>
          <p class="articles-section__description">
            Des analyses sourcées sur les sujets qui comptent. Économie, santé, société, médias...
          </p>
        </div>
        <div id="articles-grid" class="articles-grid">
          <!-- Les articles sont chargés dynamiquement par JavaScript -->
          <div class="loader">
            <div class="loader__spinner"></div>
          </div>
          <noscript>
            <div class="empty-state">
              <div class="empty-state__icon">📚</div>
              <p>JavaScript est nécessaire pour afficher les articles.<br>
              Activez JavaScript dans votre navigateur pour profiter de l'expérience complète.</p>
            </div>
          </noscript>
        </div>
      </div>
    </section>

    <!-- Démarche Section -->
    <section class="demarche">
      <div class="container">
        <div class="demarche__header">
          <span class="demarche__label">Notre approche</span>
          <h2 class="demarche__title">Un espace de réflexion différent</h2>
          <p class="demarche__subtitle">
            Entre le conformisme aveugle et les théories farfelues,
            nous proposons un chemin : celui de la <em>curiosité éclairée</em>.
          </p>
        </div>

        <div class="demarche__pillars">
          <div class="pillar">
            <div class="pillar__number">01</div>
            <div class="pillar__icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="11" cy="11" r="8"/>
                <path d="M21 21l-4.35-4.35"/>
                <path d="M11 8v6M8 11h6"/>
              </svg>
            </div>
            <h3 class="pillar__title">Des questions, pas des accusations</h3>
            <p class="pillar__text">
              Nous ne vous dirons jamais "réveillez-vous" ou "on vous ment".
              Nous posons des questions. Vous y répondez par vous-même.
            </p>
          </div>

          <div class="pillar">
            <div class="pillar__number">02</div>
            <div class="pillar__icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                <path d="M8 7h8M8 11h8M8 15h5"/>
              </svg>
            </div>
            <h3 class="pillar__title">Toujours sourcé</h3>
            <p class="pillar__text">
              Chaque article cite ses sources : études scientifiques, rapports officiels,
              données publiques. Vérifiez par vous-même.
            </p>
          </div>

          <div class="pillar">
            <div class="pillar__number">03</div>
            <div class="pillar__icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 6v6l4 2"/>
              </svg>
            </div>
            <h3 class="pillar__title">Nuance et complexité</h3>
            <p class="pillar__text">
              La réalité est rarement binaire. Nous explorons les zones grises,
              les "oui, mais", les paradoxes que personne n'ose aborder.
            </p>
          </div>
        </div>

        <div class="demarche__cta">
          <div class="demarche__cta-content">
            <p>
              <strong>Notre promesse :</strong> vous ne trouverez ici ni alarmisme, ni complotisme,
              ni moralisation. Juste des faits, des questions, et l'invitation à réfléchir.
            </p>
            <a href="/a-propos.php" class="btn btn--secondary">En savoir plus sur notre démarche</a>
          </div>
        </div>
      </div>
    </section>

    <!-- Section Suggestion -->
    <section class="suggestion-section" id="suggestion-section">
      <div class="container">
        <div class="suggestion-box">
          <div class="suggestion-box__content">
            <h2 class="suggestion-box__title">Un sujet vous intrigue ?</h2>
            <p class="suggestion-box__text">
              Proposez un sujet d'article. Si les données existent, on s'y plonge.
            </p>
          </div>

          <?php if ($suggestion_message): ?>
          <div class="form-message form-message--<?= $suggestion_type ?>">
            <?= htmlspecialchars($suggestion_message) ?>
          </div>
          <?php endif; ?>

          <form method="POST" action="#suggestion-section" class="suggestion-form">
            <input type="hidden" name="suggestion_form" value="1">
            <input type="hidden" name="csrf_token" value="<?= htmlspecialchars($_SESSION['csrf_token']) ?>">
            <input type="hidden" name="form_time" value="<?= $form_time ?>">

            <!-- Honeypot -->
            <div style="position:absolute;left:-9999px;opacity:0;height:0;" aria-hidden="true">
              <input type="text" name="website" tabindex="-1" autocomplete="off">
            </div>

            <div class="suggestion-form__fields">
              <div class="suggestion-form__main">
                <label for="topic" class="sr-only">Votre suggestion de sujet</label>
                <textarea
                  id="topic"
                  name="topic"
                  class="suggestion-form__input"
                  placeholder="Ex: Pourquoi les prix de l'immobilier ont-ils autant augmenté ? Qui finance vraiment les partis politiques ?"
                  required
                  minlength="5"
                  maxlength="500"
                  rows="3"
                ></textarea>
              </div>
              <div class="suggestion-form__row">
                <div class="suggestion-form__email">
                  <label for="suggest-email" class="sr-only">Votre email (optionnel)</label>
                  <input
                    type="email"
                    id="suggest-email"
                    name="email"
                    class="suggestion-form__input"
                    placeholder="Email (optionnel)"
                    maxlength="255"
                  >
                </div>
                <button type="submit" class="btn btn--primary suggestion-form__submit">
                  Proposer ce sujet
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
                  </svg>
                </button>
              </div>
              <div class="suggestion-form__consent">
                <label class="form-checkbox">
                  <input type="checkbox" name="consent" required>
                  <span>J'accepte la <a href="/confidentialite.php" target="_blank" rel="noopener">politique de confidentialité</a></span>
                </label>
              </div>
            </div>
          </form>
        </div>
      </div>
    </section>
  </main>

  <!-- Footer -->
  <?php include 'includes/footer.php'; ?>

  <!-- Scripts -->
  <script src="/js/app.js"></script>
</body>
</html>
