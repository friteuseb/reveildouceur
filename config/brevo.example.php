<?php
/**
 * Configuration Brevo (Sendinblue) pour la newsletter
 *
 * 1. Copiez ce fichier vers config/brevo.php
 * 2. Remplissez votre clé API et l'ID de liste
 *
 * Pour obtenir ces valeurs :
 * - Clé API : Brevo > Paramètres > SMTP & API > Clés API
 * - ID Liste : Brevo > Contacts > Listes > Cliquer sur la liste > L'ID est dans l'URL
 */

return [
    'api_key' => 'VOTRE_CLE_API_BREVO',
    'list_id' => 0, // ID numérique de votre liste
];
