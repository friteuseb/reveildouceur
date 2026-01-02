<?php
/**
 * Page de contact avec formulaire sécurisé
 * Protections : CSRF, Honeypot, Time-check, Rate limiting
 */

session_start();

// Génération du token CSRF
if (empty($_SESSION['csrf_token'])) {
    $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
}

// Timestamp pour vérification temporelle anti-bot
$form_time = time();

// Rate limiting : max 5 messages par heure
if (!isset($_SESSION['contact_count'])) {
    $_SESSION['contact_count'] = 0;
    $_SESSION['contact_reset'] = time() + 3600;
}
if (time() > $_SESSION['contact_reset']) {
    $_SESSION['contact_count'] = 0;
    $_SESSION['contact_reset'] = time() + 3600;
}

$message = '';
$messageType = '';
$formData = ['name' => '', 'email' => '', 'subject' => '', 'message' => ''];

// Traitement du formulaire
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Vérification honeypot (champ caché qui doit rester vide)
    if (!empty($_POST['website'])) {
        $message = "Votre message a été envoyé. Nous vous répondrons dans les plus brefs délais.";
        $messageType = 'success';
    }
    // Time check (minimum 3 seconds to fill the form)
    elseif (isset($_POST['form_time']) && (time() - intval($_POST['form_time'])) < 3) {
        $message = "Votre message a été envoyé. Nous vous répondrons dans les plus brefs délais.";
        $messageType = 'success';
    }
    // Rate limiting check
    elseif ($_SESSION['contact_count'] >= 5) {
        $message = "Trop de messages envoyés. Veuillez réessayer dans une heure.";
        $messageType = 'error';
    }
    // Vérification CSRF
    elseif (!isset($_POST['csrf_token']) || $_POST['csrf_token'] !== $_SESSION['csrf_token']) {
        $message = "Erreur de sécurité. Veuillez rafraîchir la page et réessayer.";
        $messageType = 'error';
    }
    // Formulaire valide, on traite
    else {
        // Récupération et nettoyage des données
        $formData['name'] = trim(filter_input(INPUT_POST, 'name', FILTER_SANITIZE_SPECIAL_CHARS) ?? '');
        $formData['email'] = trim(filter_input(INPUT_POST, 'email', FILTER_SANITIZE_EMAIL) ?? '');
        $formData['subject'] = trim(filter_input(INPUT_POST, 'subject', FILTER_SANITIZE_SPECIAL_CHARS) ?? '');
        $formData['message'] = trim(filter_input(INPUT_POST, 'message', FILTER_SANITIZE_SPECIAL_CHARS) ?? '');

        // Validation
        $errors = [];
        if (strlen($formData['name']) < 2) {
            $errors[] = "Le nom doit contenir au moins 2 caractères.";
        }
        if (!filter_var($formData['email'], FILTER_VALIDATE_EMAIL)) {
            $errors[] = "L'adresse email n'est pas valide.";
        }
        if (strlen($formData['subject']) < 3) {
            $errors[] = "Le sujet doit contenir au moins 3 caractères.";
        }
        if (strlen($formData['message']) < 10) {
            $errors[] = "Le message doit contenir au moins 10 caractères.";
        }

        if (!empty($errors)) {
            $message = implode('<br>', $errors);
            $messageType = 'error';
        } else {
            // Envoi de l'email
            $configFile = __DIR__ . '/config/mail.php';

            if (!file_exists($configFile)) {
                $message = "Configuration email manquante. Contactez l'administrateur.";
                $messageType = 'error';
            } else {
                $config = require $configFile;
                require_once __DIR__ . '/includes/Mailer.php';

                $mailer = new Mailer($config['smtp']);

                $emailSubject = "[Réveil Douceur] " . $formData['subject'];
                $emailBody = "Nouveau message depuis le formulaire de contact\n";
                $emailBody .= "==========================================\n\n";
                $emailBody .= "Nom : " . $formData['name'] . "\n";
                $emailBody .= "Email : " . $formData['email'] . "\n";
                $emailBody .= "Sujet : " . $formData['subject'] . "\n\n";
                $emailBody .= "Message :\n" . $formData['message'] . "\n\n";
                $emailBody .= "==========================================\n";
                $emailBody .= "Envoyé le " . date('d/m/Y à H:i') . "\n";
                $emailBody .= "IP : " . ($_SERVER['REMOTE_ADDR'] ?? 'inconnue') . "\n";

                $sent = $mailer->send(
                    $config['recipient']['email'],
                    $config['recipient']['name'],
                    $emailSubject,
                    $emailBody
                );

                if ($sent) {
                    $message = "Votre message a été envoyé. Nous vous répondrons dans les plus brefs délais.";
                    $messageType = 'success';
                    $formData = ['name' => '', 'email' => '', 'subject' => '', 'message' => ''];
                    $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
                    $_SESSION['contact_count']++;
                } else {
                    $message = "Une erreur est survenue lors de l'envoi. Veuillez réessayer plus tard.";
                    $messageType = 'error';
                    error_log("Erreur Mailer: " . $mailer->getLastError());
                }
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
  <title>Contact - Réveil Douceur</title>
  <meta name="description" content="Contactez-nous pour toute question, suggestion ou remarque concernant Réveil Douceur.">
  <meta name="robots" content="noindex, nofollow">
  <link rel="canonical" href="https://reveildouceur.fr/contact.php">

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
  <style>
    .contact-form {
      max-width: 600px;
      margin: 0 auto;
    }

    .form-group {
      margin-bottom: 1.5rem;
    }

    .form-label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
      color: var(--color-text);
    }

    .form-label .required {
      color: #e53e3e;
    }

    .form-input,
    .form-textarea {
      width: 100%;
      padding: 0.75rem 1rem;
      font-size: 1rem;
      font-family: inherit;
      border: 2px solid var(--color-border, #E8E4DF);
      border-radius: 8px;
      background: var(--color-surface, #FFFFFF);
      color: var(--color-text);
      transition: border-color 0.2s, box-shadow 0.2s;
    }

    .form-input:focus,
    .form-textarea:focus {
      outline: none;
      border-color: var(--color-primary, #5B7B6F);
      box-shadow: 0 0 0 3px rgba(91, 123, 111, 0.1);
    }

    .form-textarea {
      min-height: 150px;
      resize: vertical;
    }

    .form-message {
      padding: 1rem 1.25rem;
      border-radius: 8px;
      margin-bottom: 1.5rem;
      font-size: 0.95rem;
    }

    .form-message--success {
      background: #f0fff4;
      border: 1px solid #48bb78;
      color: #276749;
    }

    .form-message--error {
      background: #fff5f5;
      border: 1px solid #fc8181;
      color: #c53030;
    }

    [data-theme="dark"] .form-message--success {
      background: rgba(72, 187, 120, 0.1);
      color: #68d391;
    }

    [data-theme="dark"] .form-message--error {
      background: rgba(252, 129, 129, 0.1);
      color: #fc8181;
    }

    .form-submit {
      width: 100%;
      padding: 1rem;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
    }

    /* Honeypot - caché visuellement mais accessible aux bots */
    .hp-field {
      position: absolute;
      left: -9999px;
      opacity: 0;
      height: 0;
      width: 0;
      z-index: -1;
    }

    /* Checkbox consentement RGPD */
    .form-group--checkbox {
      margin-bottom: 1.5rem;
    }

    .form-checkbox {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      cursor: pointer;
      font-size: 0.9rem;
      line-height: 1.5;
    }

    .form-checkbox input[type="checkbox"] {
      width: 18px;
      height: 18px;
      margin-top: 2px;
      flex-shrink: 0;
      accent-color: var(--color-primary, #5B7B6F);
      cursor: pointer;
    }

    .form-checkbox__text {
      color: var(--color-text-secondary, #666);
    }

    .form-checkbox__text a {
      color: var(--color-primary, #5B7B6F);
      text-decoration: underline;
    }

    .form-checkbox__text a:hover {
      text-decoration: none;
    }

    .contact-intro {
      text-align: center;
      margin-bottom: 2rem;
      color: var(--color-text-secondary);
    }

    .contact-info {
      margin-top: 3rem;
      padding-top: 2rem;
      border-top: 1px solid var(--color-border, #E8E4DF);
      text-align: center;
      color: var(--color-text-secondary);
      font-size: 0.9rem;
    }
  </style>

  <!-- Config -->
  <script src="/js/config.js"></script>

  <!-- Analytics -->
  <?php include 'includes/analytics.php'; ?>
</head>
<body>
  <!-- Skip Link -->
  <a href="#main-content" class="skip-link">Aller au contenu principal</a>

  <!-- Header -->
  <?php include 'includes/header.php'; ?>

  <main id="main-content">
    <article class="article">
      <header class="article__header">
        <div class="container">
          <h1 class="article__title">Contact</h1>
        </div>
      </header>

      <div class="container">
        <div class="article__content">
          <p class="contact-intro">
            Une question, une suggestion, une remarque ?<br>
            N'hésitez pas à nous écrire. Nous lisons tous les messages.
          </p>

          <?php if ($message): ?>
          <div class="form-message form-message--<?= $messageType ?>">
            <?= $message ?>
          </div>
          <?php endif; ?>

          <form method="POST" action="" class="contact-form" novalidate>
            <!-- Token CSRF -->
            <input type="hidden" name="csrf_token" value="<?= htmlspecialchars($_SESSION['csrf_token']) ?>">
            <input type="hidden" name="form_time" value="<?= $form_time ?>">

            <!-- Honeypot anti-spam -->
            <div class="hp-field" aria-hidden="true">
              <label for="website">Ne pas remplir ce champ</label>
              <input type="text" name="website" id="website" tabindex="-1" autocomplete="off">
            </div>

            <div class="form-group">
              <label for="name" class="form-label">
                Nom <span class="required">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                class="form-input"
                required
                minlength="2"
                maxlength="100"
                value="<?= htmlspecialchars($formData['name']) ?>"
                placeholder="Votre nom"
              >
            </div>

            <div class="form-group">
              <label for="email" class="form-label">
                Email <span class="required">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                class="form-input"
                required
                maxlength="255"
                value="<?= htmlspecialchars($formData['email']) ?>"
                placeholder="votre@email.com"
              >
            </div>

            <div class="form-group">
              <label for="subject" class="form-label">
                Sujet <span class="required">*</span>
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                class="form-input"
                required
                minlength="3"
                maxlength="200"
                value="<?= htmlspecialchars($formData['subject']) ?>"
                placeholder="Le sujet de votre message"
              >
            </div>

            <div class="form-group">
              <label for="message" class="form-label">
                Message <span class="required">*</span>
              </label>
              <textarea
                id="message"
                name="message"
                class="form-textarea"
                required
                minlength="10"
                maxlength="5000"
                placeholder="Votre message..."
              ><?= htmlspecialchars($formData['message']) ?></textarea>
            </div>

            <div class="form-group form-group--checkbox">
              <label class="form-checkbox">
                <input type="checkbox" name="consent" id="consent" required>
                <span class="form-checkbox__text">
                  J'accepte que mes données soient traitées conformément à la
                  <a href="/confidentialite.php" target="_blank" rel="noopener">politique de confidentialité</a>
                  <span class="required">*</span>
                </span>
              </label>
            </div>

            <button type="submit" class="btn btn--primary form-submit">
              Envoyer le message
            </button>
          </form>

          <div class="contact-info">
            <p>
              Nous nous efforçons de répondre sous 48h.<br>
              Merci pour votre patience.
            </p>
          </div>
        </div>
      </div>
    </article>
  </main>

  <!-- Footer -->
  <?php include 'includes/footer.php'; ?>

  <!-- Scripts -->
  <script src="/js/app.js"></script>
</body>
</html>
