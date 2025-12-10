<?php
/**
 * API de gestion des votes - Réveil Douceur
 *
 * RGPD-friendly: utilise un cookie anonyme au lieu de l'IP
 *
 * Endpoints:
 *   GET  ?article=slug           → Stats d'un article + vote utilisateur
 *   GET  ?articles=slug1,slug2   → Stats batch
 *   GET  ?ranking=true           → Classement par likes
 *   POST {article, vote}         → Enregistre/modifie un vote
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: https://reveildouceur.fr');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true');

// Préflight CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// Configuration
$dbPath = __DIR__ . '/votes.db';
$cookieName = 'rd_vote_token';
$cookieExpiry = 60 * 60 * 24 * 365 * 2; // 2 ans

// Initialiser la DB si elle n'existe pas
if (!file_exists($dbPath)) {
    require_once __DIR__ . '/init-db.php';
}

try {
    $db = new SQLite3($dbPath);
    $db->busyTimeout(5000);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed']);
    exit;
}

/**
 * Génère ou récupère le token anonyme de l'utilisateur
 * Aucune donnée personnelle - juste un UUID aléatoire
 */
function getOrCreateVoterToken(): string {
    global $cookieName, $cookieExpiry;

    // Vérifier si le token existe dans le cookie
    if (isset($_COOKIE[$cookieName]) && preg_match('/^[a-f0-9]{64}$/', $_COOKIE[$cookieName])) {
        return $_COOKIE[$cookieName];
    }

    // Générer un nouveau token aléatoire (non lié à l'IP ou autre donnée personnelle)
    $token = bin2hex(random_bytes(32));

    // Définir le cookie (sera envoyé avec la réponse)
    setcookie($cookieName, $token, [
        'expires' => time() + $cookieExpiry,
        'path' => '/',
        'domain' => '',
        'secure' => true,
        'httponly' => true,
        'samesite' => 'Lax'
    ]);

    return $token;
}

/**
 * Valide le slug d'article
 */
function validateSlug(string $slug): bool {
    return preg_match('/^[a-z0-9-]+$/', $slug) && strlen($slug) < 200;
}

/**
 * Récupère les stats d'un article
 */
function getArticleStats(SQLite3 $db, string $slug): array {
    $stmt = $db->prepare('SELECT likes, dislikes FROM vote_stats WHERE article_slug = :slug');
    $stmt->bindValue(':slug', $slug, SQLITE3_TEXT);
    $result = $stmt->execute()->fetchArray(SQLITE3_ASSOC);

    return $result ?: ['likes' => 0, 'dislikes' => 0];
}

/**
 * Récupère le vote de l'utilisateur courant
 */
function getUserVote(SQLite3 $db, string $slug, string $voterToken): ?int {
    $stmt = $db->prepare('SELECT vote_type FROM votes WHERE article_slug = :slug AND voter_token = :token');
    $stmt->bindValue(':slug', $slug, SQLITE3_TEXT);
    $stmt->bindValue(':token', $voterToken, SQLITE3_TEXT);
    $result = $stmt->execute()->fetchArray(SQLITE3_ASSOC);

    return $result ? (int)$result['vote_type'] : null;
}

/**
 * Met à jour les stats agrégées
 */
function updateStats(SQLite3 $db, string $slug): void {
    $stmt = $db->prepare('
        INSERT INTO vote_stats (article_slug, likes, dislikes, updated_at)
        VALUES (:slug,
            (SELECT COUNT(*) FROM votes WHERE article_slug = :slug AND vote_type = 1),
            (SELECT COUNT(*) FROM votes WHERE article_slug = :slug AND vote_type = -1),
            CURRENT_TIMESTAMP
        )
        ON CONFLICT(article_slug) DO UPDATE SET
            likes = (SELECT COUNT(*) FROM votes WHERE article_slug = :slug AND vote_type = 1),
            dislikes = (SELECT COUNT(*) FROM votes WHERE article_slug = :slug AND vote_type = -1),
            updated_at = CURRENT_TIMESTAMP
    ');
    $stmt->bindValue(':slug', $slug, SQLITE3_TEXT);
    $stmt->execute();
}

/**
 * Récupère le classement des articles par likes
 */
function getRanking(SQLite3 $db, int $limit = 100): array {
    $stmt = $db->prepare('
        SELECT article_slug, likes, dislikes,
               (likes - dislikes) as score
        FROM vote_stats
        WHERE likes > 0
        ORDER BY score DESC, likes DESC
        LIMIT :limit
    ');
    $stmt->bindValue(':limit', $limit, SQLITE3_INTEGER);
    $result = $stmt->execute();

    $ranking = [];
    while ($row = $result->fetchArray(SQLITE3_ASSOC)) {
        $ranking[] = [
            'slug' => $row['article_slug'],
            'likes' => (int)$row['likes'],
            'dislikes' => (int)$row['dislikes'],
            'score' => (int)$row['score']
        ];
    }
    return $ranking;
}

// ============ TRAITEMENT DES REQUÊTES ============

$method = $_SERVER['REQUEST_METHOD'];
$voterToken = getOrCreateVoterToken();

// GET: Récupérer les stats
if ($method === 'GET') {

    // Mode ranking: ?ranking=true
    if (isset($_GET['ranking'])) {
        $limit = isset($_GET['limit']) ? min(100, max(1, (int)$_GET['limit'])) : 100;
        echo json_encode(['ranking' => getRanking($db, $limit)]);
        exit;
    }

    // Mode batch: ?articles=slug1,slug2,slug3
    if (isset($_GET['articles'])) {
        $slugs = array_filter(explode(',', $_GET['articles']), 'validateSlug');

        if (empty($slugs)) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid article slugs']);
            exit;
        }

        $results = [];

        foreach ($slugs as $slug) {
            $stats = getArticleStats($db, $slug);
            $userVote = getUserVote($db, $slug, $voterToken);
            $results[$slug] = [
                'likes' => (int)$stats['likes'],
                'dislikes' => (int)$stats['dislikes'],
                'userVote' => $userVote
            ];
        }

        echo json_encode(['votes' => $results]);
        exit;
    }

    // Mode single: ?article=slug
    $slug = $_GET['article'] ?? '';

    if (!$slug || !validateSlug($slug)) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid article slug']);
        exit;
    }

    $stats = getArticleStats($db, $slug);
    $userVote = getUserVote($db, $slug, $voterToken);

    echo json_encode([
        'article' => $slug,
        'likes' => (int)$stats['likes'],
        'dislikes' => (int)$stats['dislikes'],
        'userVote' => $userVote
    ]);
    exit;
}

// POST: Enregistrer un vote
if ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);

    $slug = $input['article'] ?? '';
    $vote = isset($input['vote']) ? (int)$input['vote'] : null;

    // Validation
    if (!$slug || !validateSlug($slug)) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid article slug']);
        exit;
    }

    if ($vote === null || !in_array($vote, [-1, 0, 1])) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid vote value (-1, 0, or 1)']);
        exit;
    }

    // Annulation de vote
    if ($vote === 0) {
        $stmt = $db->prepare('DELETE FROM votes WHERE article_slug = :slug AND voter_token = :token');
        $stmt->bindValue(':slug', $slug, SQLITE3_TEXT);
        $stmt->bindValue(':token', $voterToken, SQLITE3_TEXT);
        $stmt->execute();
    } else {
        // Upsert du vote
        $stmt = $db->prepare('
            INSERT INTO votes (article_slug, voter_token, vote_type, updated_at)
            VALUES (:slug, :token, :vote, CURRENT_TIMESTAMP)
            ON CONFLICT(article_slug, voter_token) DO UPDATE SET
                vote_type = :vote,
                updated_at = CURRENT_TIMESTAMP
        ');
        $stmt->bindValue(':slug', $slug, SQLITE3_TEXT);
        $stmt->bindValue(':token', $voterToken, SQLITE3_TEXT);
        $stmt->bindValue(':vote', $vote, SQLITE3_INTEGER);
        $stmt->execute();
    }

    // Mettre à jour les stats
    updateStats($db, $slug);

    // Renvoyer les nouvelles stats
    $stats = getArticleStats($db, $slug);
    $userVote = $vote === 0 ? null : $vote;

    echo json_encode([
        'success' => true,
        'article' => $slug,
        'likes' => (int)$stats['likes'],
        'dislikes' => (int)$stats['dislikes'],
        'userVote' => $userVote
    ]);
    exit;
}

// Méthode non supportée
http_response_code(405);
echo json_encode(['error' => 'Method not allowed']);
