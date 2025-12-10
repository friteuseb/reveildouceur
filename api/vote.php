<?php
/**
 * API de gestion des votes - Réveil Douceur
 *
 * Endpoints:
 *   GET  ?article=slug        → Récupère les stats d'un article + vote de l'utilisateur
 *   POST {article, vote}      → Enregistre/modifie un vote (1 = like, -1 = dislike, 0 = annuler)
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: https://reveildouceur.fr');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Préflight CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// Configuration
$dbPath = __DIR__ . '/votes.db';

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
 * Hash l'IP pour la confidentialité (RGPD)
 */
function getIpHash(): string {
    $ip = $_SERVER['HTTP_X_FORWARDED_FOR'] ?? $_SERVER['HTTP_X_REAL_IP'] ?? $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    // Prendre la première IP si plusieurs (proxy)
    $ip = explode(',', $ip)[0];
    $ip = trim($ip);
    // Hash avec sel pour éviter la réversibilité
    $salt = 'reveildouceur_2024_votes';
    return hash('sha256', $ip . $salt);
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
function getUserVote(SQLite3 $db, string $slug, string $ipHash): ?int {
    $stmt = $db->prepare('SELECT vote_type FROM votes WHERE article_slug = :slug AND ip_hash = :ip');
    $stmt->bindValue(':slug', $slug, SQLITE3_TEXT);
    $stmt->bindValue(':ip', $ipHash, SQLITE3_TEXT);
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

// ============ TRAITEMENT DES REQUÊTES ============

$method = $_SERVER['REQUEST_METHOD'];

// GET: Récupérer les stats (single ou batch)
if ($method === 'GET') {
    // Mode batch: ?articles=slug1,slug2,slug3
    if (isset($_GET['articles'])) {
        $slugs = array_filter(explode(',', $_GET['articles']), 'validateSlug');

        if (empty($slugs)) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid article slugs']);
            exit;
        }

        $ipHash = getIpHash();
        $results = [];

        foreach ($slugs as $slug) {
            $stats = getArticleStats($db, $slug);
            $userVote = getUserVote($db, $slug, $ipHash);
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

    $ipHash = getIpHash();
    $stats = getArticleStats($db, $slug);
    $userVote = getUserVote($db, $slug, $ipHash);

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

    $ipHash = getIpHash();

    // Annulation de vote
    if ($vote === 0) {
        $stmt = $db->prepare('DELETE FROM votes WHERE article_slug = :slug AND ip_hash = :ip');
        $stmt->bindValue(':slug', $slug, SQLITE3_TEXT);
        $stmt->bindValue(':ip', $ipHash, SQLITE3_TEXT);
        $stmt->execute();
    } else {
        // Upsert du vote
        $stmt = $db->prepare('
            INSERT INTO votes (article_slug, ip_hash, vote_type, updated_at)
            VALUES (:slug, :ip, :vote, CURRENT_TIMESTAMP)
            ON CONFLICT(article_slug, ip_hash) DO UPDATE SET
                vote_type = :vote,
                updated_at = CURRENT_TIMESTAMP
        ');
        $stmt->bindValue(':slug', $slug, SQLITE3_TEXT);
        $stmt->bindValue(':ip', $ipHash, SQLITE3_TEXT);
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
