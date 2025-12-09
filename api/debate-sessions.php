<?php
/**
 * API pour les sessions de débat avec vote
 *
 * Endpoints:
 * POST /api/debate-sessions.php?action=create    - Créer une session
 * GET  /api/debate-sessions.php?action=get&code=XXX - Récupérer une session
 * POST /api/debate-sessions.php?action=vote      - Voter pour un article
 * GET  /api/debate-sessions.php?action=results&code=XXX - Résultats des votes
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Rate limiting par IP (30 requêtes/minute max)
session_start();
$clientIP = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
$rateLimitKey = 'api_rate_' . md5($clientIP);

if (!isset($_SESSION[$rateLimitKey])) {
    $_SESSION[$rateLimitKey] = ['count' => 0, 'reset' => time() + 60];
}

if (time() > $_SESSION[$rateLimitKey]['reset']) {
    $_SESSION[$rateLimitKey] = ['count' => 0, 'reset' => time() + 60];
}

$_SESSION[$rateLimitKey]['count']++;

if ($_SESSION[$rateLimitKey]['count'] > 30) {
    header('Retry-After: ' . ($_SESSION[$rateLimitKey]['reset'] - time()));
    http_response_code(429);
    echo json_encode(['error' => 'Trop de requêtes. Réessayez dans quelques secondes.']);
    exit;
}

// Configuration
define('DB_PATH', __DIR__ . '/data/debates.sqlite');
define('SESSION_EXPIRY_HOURS', 72); // Sessions expirent après 72h
define('MAX_VOTES_PER_PARTICIPANT', 5);

/**
 * Initialise la base de données SQLite
 */
function initDatabase(): PDO {
    $dataDir = dirname(DB_PATH);
    if (!is_dir($dataDir)) {
        mkdir($dataDir, 0755, true);
    }

    $db = new PDO('sqlite:' . DB_PATH);
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Créer les tables si elles n'existent pas
    $db->exec("
        CREATE TABLE IF NOT EXISTS sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            code VARCHAR(8) UNIQUE NOT NULL,
            name VARCHAR(100) NOT NULL,
            organizer_token VARCHAR(32) NOT NULL,
            articles TEXT NOT NULL,
            max_votes INTEGER DEFAULT 3,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            expires_at DATETIME NOT NULL
        );

        CREATE TABLE IF NOT EXISTS participants (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id INTEGER NOT NULL,
            token VARCHAR(32) NOT NULL,
            name VARCHAR(50) NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE,
            UNIQUE(session_id, token)
        );

        CREATE TABLE IF NOT EXISTS votes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id INTEGER NOT NULL,
            participant_id INTEGER NOT NULL,
            article_slug VARCHAR(100) NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE,
            FOREIGN KEY (participant_id) REFERENCES participants(id) ON DELETE CASCADE,
            UNIQUE(participant_id, article_slug)
        );

        CREATE INDEX IF NOT EXISTS idx_sessions_code ON sessions(code);
        CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);
        CREATE INDEX IF NOT EXISTS idx_votes_session ON votes(session_id);
    ");

    // Nettoyer les sessions expirées
    $db->exec("DELETE FROM sessions WHERE expires_at < datetime('now')");

    return $db;
}

/**
 * Génère un code de session unique (6 caractères alphanumériques)
 */
function generateSessionCode(PDO $db): string {
    $chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Sans I, O, 0, 1 pour éviter confusion
    do {
        $code = '';
        for ($i = 0; $i < 6; $i++) {
            $code .= $chars[random_int(0, strlen($chars) - 1)];
        }
        $stmt = $db->prepare("SELECT COUNT(*) FROM sessions WHERE code = ?");
        $stmt->execute([$code]);
    } while ($stmt->fetchColumn() > 0);

    return $code;
}

/**
 * Génère un token unique
 */
function generateToken(): string {
    return bin2hex(random_bytes(16));
}

/**
 * Réponse JSON
 */
function jsonResponse(array $data, int $status = 200): void {
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

/**
 * Erreur JSON
 */
function jsonError(string $message, int $status = 400): void {
    jsonResponse(['error' => $message], $status);
}

/**
 * Récupère les données POST JSON
 */
function getPostData(): array {
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);
    return is_array($data) ? $data : [];
}

// === ACTIONS ===

/**
 * Créer une nouvelle session de débat
 */
function createSession(PDO $db): void {
    $data = getPostData();

    $name = trim($data['name'] ?? '');
    $articles = $data['articles'] ?? [];
    $maxVotes = intval($data['maxVotes'] ?? 3);

    if (empty($name)) {
        jsonError('Le nom de la session est requis');
    }
    if (strlen($name) > 100) {
        jsonError('Le nom est trop long (max 100 caractères)');
    }
    if (empty($articles) || !is_array($articles)) {
        jsonError('Sélectionnez au moins un article');
    }
    if (count($articles) > 20) {
        jsonError('Maximum 20 articles par session');
    }
    if ($maxVotes < 1 || $maxVotes > 10) {
        $maxVotes = 3;
    }

    // Nettoyer les slugs d'articles
    $articles = array_map(function($slug) {
        return preg_replace('/[^a-z0-9\-]/', '', strtolower($slug));
    }, $articles);
    $articles = array_filter($articles);
    $articles = array_values(array_unique($articles));

    if (empty($articles)) {
        jsonError('Aucun article valide sélectionné');
    }

    $code = generateSessionCode($db);
    $organizerToken = generateToken();
    $expiresAt = date('Y-m-d H:i:s', strtotime('+' . SESSION_EXPIRY_HOURS . ' hours'));

    $stmt = $db->prepare("
        INSERT INTO sessions (code, name, organizer_token, articles, max_votes, expires_at)
        VALUES (?, ?, ?, ?, ?, ?)
    ");
    $stmt->execute([
        $code,
        $name,
        $organizerToken,
        json_encode($articles),
        $maxVotes,
        $expiresAt
    ]);

    jsonResponse([
        'success' => true,
        'session' => [
            'code' => $code,
            'name' => $name,
            'organizerToken' => $organizerToken,
            'articles' => $articles,
            'maxVotes' => $maxVotes,
            'expiresAt' => $expiresAt,
            'shareUrl' => 'https://reveildouceur.fr/organiser-debat.html?session=' . $code
        ]
    ]);
}

/**
 * Récupérer les informations d'une session
 */
function getSession(PDO $db): void {
    $code = strtoupper(trim($_GET['code'] ?? ''));

    if (empty($code) || strlen($code) !== 6) {
        jsonError('Code de session invalide');
    }

    $stmt = $db->prepare("
        SELECT id, code, name, articles, max_votes, created_at, expires_at
        FROM sessions
        WHERE code = ? AND expires_at > datetime('now')
    ");
    $stmt->execute([$code]);
    $session = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$session) {
        jsonError('Session non trouvée ou expirée', 404);
    }

    // Compter les participants
    $stmt = $db->prepare("SELECT COUNT(*) FROM participants WHERE session_id = ?");
    $stmt->execute([$session['id']]);
    $participantCount = $stmt->fetchColumn();

    jsonResponse([
        'success' => true,
        'session' => [
            'code' => $session['code'],
            'name' => $session['name'],
            'articles' => json_decode($session['articles'], true),
            'maxVotes' => intval($session['max_votes']),
            'participantCount' => intval($participantCount),
            'createdAt' => $session['created_at'],
            'expiresAt' => $session['expires_at']
        ]
    ]);
}

/**
 * Rejoindre une session et/ou voter
 */
function vote(PDO $db): void {
    $data = getPostData();

    $code = strtoupper(trim($data['code'] ?? ''));
    $participantName = trim($data['participantName'] ?? '');
    $participantToken = trim($data['participantToken'] ?? '');
    $votes = $data['votes'] ?? [];

    if (empty($code) || strlen($code) !== 6) {
        jsonError('Code de session invalide');
    }
    if (empty($participantName) || strlen($participantName) > 50) {
        jsonError('Nom de participant invalide (max 50 caractères)');
    }
    if (!is_array($votes)) {
        jsonError('Format de votes invalide');
    }

    // Récupérer la session
    $stmt = $db->prepare("
        SELECT id, articles, max_votes
        FROM sessions
        WHERE code = ? AND expires_at > datetime('now')
    ");
    $stmt->execute([$code]);
    $session = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$session) {
        jsonError('Session non trouvée ou expirée', 404);
    }

    $sessionId = $session['id'];
    $allowedArticles = json_decode($session['articles'], true);
    $maxVotes = intval($session['max_votes']);

    // Valider les votes
    $votes = array_filter($votes, function($slug) use ($allowedArticles) {
        return in_array($slug, $allowedArticles);
    });
    $votes = array_values(array_unique($votes));

    if (count($votes) > $maxVotes) {
        jsonError("Maximum $maxVotes votes autorisés");
    }

    // Créer ou récupérer le participant
    if (empty($participantToken)) {
        $participantToken = generateToken();
    }

    $db->beginTransaction();

    try {
        // Vérifier si le participant existe déjà
        $stmt = $db->prepare("
            SELECT id, name FROM participants
            WHERE session_id = ? AND token = ?
        ");
        $stmt->execute([$sessionId, $participantToken]);
        $participant = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($participant) {
            $participantId = $participant['id'];
            // Mettre à jour le nom si différent
            if ($participant['name'] !== $participantName) {
                $stmt = $db->prepare("UPDATE participants SET name = ? WHERE id = ?");
                $stmt->execute([$participantName, $participantId]);
            }
        } else {
            // Créer le participant
            $stmt = $db->prepare("
                INSERT INTO participants (session_id, token, name)
                VALUES (?, ?, ?)
            ");
            $stmt->execute([$sessionId, $participantToken, $participantName]);
            $participantId = $db->lastInsertId();
        }

        // Supprimer les anciens votes de ce participant
        $stmt = $db->prepare("DELETE FROM votes WHERE participant_id = ?");
        $stmt->execute([$participantId]);

        // Insérer les nouveaux votes
        $stmt = $db->prepare("
            INSERT INTO votes (session_id, participant_id, article_slug)
            VALUES (?, ?, ?)
        ");
        foreach ($votes as $slug) {
            $stmt->execute([$sessionId, $participantId, $slug]);
        }

        $db->commit();

        jsonResponse([
            'success' => true,
            'participantToken' => $participantToken,
            'votesRegistered' => count($votes)
        ]);

    } catch (Exception $e) {
        $db->rollBack();
        jsonError('Erreur lors de l\'enregistrement des votes');
    }
}

/**
 * Récupérer les résultats des votes
 */
function getResults(PDO $db): void {
    $code = strtoupper(trim($_GET['code'] ?? ''));
    $organizerToken = trim($_GET['token'] ?? '');

    if (empty($code) || strlen($code) !== 6) {
        jsonError('Code de session invalide');
    }

    // Récupérer la session
    $stmt = $db->prepare("
        SELECT id, name, articles, max_votes, organizer_token, created_at, expires_at
        FROM sessions
        WHERE code = ? AND expires_at > datetime('now')
    ");
    $stmt->execute([$code]);
    $session = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$session) {
        jsonError('Session non trouvée ou expirée', 404);
    }

    $isOrganizer = ($organizerToken === $session['organizer_token']);
    $sessionId = $session['id'];
    $articles = json_decode($session['articles'], true);

    // Compter les votes par article
    $stmt = $db->prepare("
        SELECT article_slug, COUNT(*) as vote_count
        FROM votes
        WHERE session_id = ?
        GROUP BY article_slug
        ORDER BY vote_count DESC
    ");
    $stmt->execute([$sessionId]);
    $voteCounts = $stmt->fetchAll(PDO::FETCH_KEY_PAIR);

    // Construire les résultats
    $results = [];
    foreach ($articles as $slug) {
        $results[] = [
            'slug' => $slug,
            'votes' => intval($voteCounts[$slug] ?? 0)
        ];
    }

    // Trier par nombre de votes décroissant
    usort($results, function($a, $b) {
        return $b['votes'] - $a['votes'];
    });

    // Liste des participants
    $stmt = $db->prepare("SELECT name FROM participants WHERE session_id = ?");
    $stmt->execute([$sessionId]);
    $participants = $stmt->fetchAll(PDO::FETCH_COLUMN);

    // Détail des votes si organisateur
    $voteDetails = [];
    if ($isOrganizer) {
        $stmt = $db->prepare("
            SELECT p.name, v.article_slug
            FROM votes v
            JOIN participants p ON v.participant_id = p.id
            WHERE v.session_id = ?
            ORDER BY p.name, v.article_slug
        ");
        $stmt->execute([$sessionId]);
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            if (!isset($voteDetails[$row['name']])) {
                $voteDetails[$row['name']] = [];
            }
            $voteDetails[$row['name']][] = $row['article_slug'];
        }
    }

    jsonResponse([
        'success' => true,
        'session' => [
            'code' => $code,
            'name' => $session['name'],
            'maxVotes' => intval($session['max_votes']),
            'expiresAt' => $session['expires_at']
        ],
        'participantCount' => count($participants),
        'participants' => $participants,
        'results' => $results,
        'isOrganizer' => $isOrganizer,
        'voteDetails' => $isOrganizer ? $voteDetails : null
    ]);
}

// === ROUTING ===

try {
    $db = initDatabase();
    $action = $_GET['action'] ?? '';

    switch ($action) {
        case 'create':
            if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
                jsonError('Méthode non autorisée', 405);
            }
            createSession($db);
            break;

        case 'get':
            getSession($db);
            break;

        case 'vote':
            if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
                jsonError('Méthode non autorisée', 405);
            }
            vote($db);
            break;

        case 'results':
            getResults($db);
            break;

        default:
            jsonError('Action non reconnue. Actions disponibles: create, get, vote, results');
    }

} catch (PDOException $e) {
    error_log('Database error: ' . $e->getMessage());
    jsonError('Erreur de base de données', 500);
} catch (Exception $e) {
    error_log('Error: ' . $e->getMessage());
    jsonError('Erreur serveur', 500);
}
