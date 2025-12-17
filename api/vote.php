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

// Activer l'affichage des erreurs pour debug
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

// Capturer les erreurs fatales
register_shutdown_function(function() {
    $error = error_get_last();
    if ($error && in_array($error['type'], [E_ERROR, E_PARSE, E_CORE_ERROR, E_COMPILE_ERROR])) {
        if (!headers_sent()) {
            header('Content-Type: application/json; charset=utf-8');
            http_response_code(500);
        }
        echo json_encode([
            'error' => 'Fatal error',
            'message' => $error['message'],
            'file' => basename($error['file']),
            'line' => $error['line']
        ]);
    }
});

header('Content-Type: application/json; charset=utf-8');

// Désactiver le cache pour l'API (les votes doivent être en temps réel)
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Pragma: no-cache');
header('Expires: 0');

// CORS dynamique (production + dev)
$allowedOrigins = ['https://reveildouceur.fr', 'https://reveildouceur.ddev.site'];
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $allowedOrigins)) {
    header('Access-Control-Allow-Origin: ' . $origin);
} else {
    header('Access-Control-Allow-Origin: https://reveildouceur.fr');
}
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

// Initialiser ou migrer la DB
define('VOTE_API_INCLUDED', true);

if (!file_exists($dbPath)) {
    if (!is_writable(__DIR__)) {
        http_response_code(500);
        echo json_encode(['error' => 'Directory not writable', 'dir' => __DIR__]);
        exit;
    }
    require_once __DIR__ . '/init-db.php';
}

try {
    $db = new SQLite3($dbPath);
    $db->busyTimeout(5000);

    // Vérifier si la migration est nécessaire (ip_hash -> voter_token)
    $result = $db->query("PRAGMA table_info(votes)");
    $hasVoterToken = false;
    $hasIpHash = false;
    while ($row = $result->fetchArray(SQLITE3_ASSOC)) {
        if ($row['name'] === 'voter_token') $hasVoterToken = true;
        if ($row['name'] === 'ip_hash') $hasIpHash = true;
    }

    // Migration nécessaire (méthode compatible toutes versions SQLite)
    if ($hasIpHash && !$hasVoterToken) {
        $db->exec('BEGIN TRANSACTION');
        $db->exec('CREATE TABLE votes_new (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            article_slug TEXT NOT NULL,
            voter_token TEXT NOT NULL,
            vote_type INTEGER NOT NULL CHECK(vote_type IN (-1, 1)),
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(article_slug, voter_token)
        )');
        $db->exec('INSERT INTO votes_new (id, article_slug, voter_token, vote_type, created_at, updated_at)
                   SELECT id, article_slug, ip_hash, vote_type, created_at, updated_at FROM votes');
        $db->exec('DROP TABLE votes');
        $db->exec('ALTER TABLE votes_new RENAME TO votes');
        $db->exec('CREATE INDEX IF NOT EXISTS idx_article ON votes(article_slug)');
        $db->exec('CREATE INDEX IF NOT EXISTS idx_voter ON votes(voter_token)');
        $db->exec('COMMIT');
    }

    // Si la table n'a ni l'un ni l'autre, recréer
    if (!$hasVoterToken && !$hasIpHash) {
        require_once __DIR__ . '/init-db.php';
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed', 'message' => $e->getMessage()]);
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

    // Définir le cookie - syntaxe compatible PHP < 7.3
    $expire = time() + $cookieExpiry;
    $path = '/';
    $domain = '';
    $secure = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off';
    $httponly = true;

    // Ajouter SameSite via header si possible (PHP < 7.3 workaround)
    if (PHP_VERSION_ID >= 70300) {
        setcookie($cookieName, $token, [
            'expires' => $expire,
            'path' => $path,
            'domain' => $domain,
            'secure' => $secure,
            'httponly' => $httponly,
            'samesite' => 'Lax'
        ]);
    } else {
        // Fallback pour PHP < 7.3 - SameSite via path hack
        setcookie($cookieName, $token, $expire, "$path; SameSite=Lax", $domain, $secure, $httponly);
    }

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
