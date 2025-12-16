<?php
/**
 * API Newsletter - Inscription via Brevo (Sendinblue)
 *
 * Endpoint: POST /api/newsletter.php
 * Body: { "email": "user@example.com" }
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Gestion des requêtes OPTIONS (preflight CORS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Uniquement POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Méthode non autorisée']);
    exit;
}

// Charger la configuration Brevo
$configFile = __DIR__ . '/../config/brevo.php';
if (!file_exists($configFile)) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Configuration manquante']);
    exit;
}

$config = require $configFile;
$apiKey = $config['api_key'] ?? '';
$listId = $config['list_id'] ?? 0;

if (empty($apiKey) || empty($listId)) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Configuration Brevo incomplète']);
    exit;
}

// Récupérer les données
$input = json_decode(file_get_contents('php://input'), true);
$email = filter_var($input['email'] ?? '', FILTER_VALIDATE_EMAIL);

if (!$email) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Email invalide']);
    exit;
}

// Préparer la requête vers l'API Brevo
$data = [
    'email' => $email,
    'listIds' => [(int)$listId],
    'updateEnabled' => true, // Met à jour si déjà existant
    'attributes' => [
        'SOURCE' => 'Site web - Footer'
    ]
];

$ch = curl_init();
curl_setopt_array($ch, [
    CURLOPT_URL => 'https://api.brevo.com/v3/contacts',
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => json_encode($data),
    CURLOPT_HTTPHEADER => [
        'accept: application/json',
        'api-key: ' . $apiKey,
        'content-type: application/json'
    ]
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);
curl_close($ch);

// Gérer les erreurs cURL
if ($error) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Erreur de connexion au service']);
    exit;
}

// Interpréter la réponse Brevo
$result = json_decode($response, true);

if ($httpCode === 201) {
    // Nouveau contact créé
    echo json_encode([
        'success' => true,
        'message' => 'Inscription réussie ! Vous recevrez un email de confirmation.'
    ]);
} elseif ($httpCode === 204) {
    // Contact mis à jour
    echo json_encode([
        'success' => true,
        'message' => 'Vous êtes déjà inscrit(e) à notre newsletter.'
    ]);
} elseif ($httpCode === 400 && isset($result['code']) && $result['code'] === 'duplicate_parameter') {
    // Email déjà dans la liste
    echo json_encode([
        'success' => true,
        'message' => 'Vous êtes déjà inscrit(e) à notre newsletter.'
    ]);
} else {
    // Autre erreur
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Une erreur est survenue. Veuillez réessayer plus tard.'
    ]);
}
