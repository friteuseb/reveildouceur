<?php
/**
 * Initialisation de la base de données SQLite pour les votes
 * À exécuter une seule fois pour créer la structure
 *
 * RGPD-friendly: utilise voter_token (cookie anonyme) au lieu de l'IP
 */

$dbPath = __DIR__ . '/votes.db';

try {
    $db = new SQLite3($dbPath);

    // Table des votes - utilise voter_token au lieu de ip_hash
    $db->exec('
        CREATE TABLE IF NOT EXISTS votes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            article_slug TEXT NOT NULL,
            voter_token TEXT NOT NULL,
            vote_type INTEGER NOT NULL CHECK(vote_type IN (-1, 1)),
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(article_slug, voter_token)
        )
    ');

    // Index pour les requêtes fréquentes
    $db->exec('CREATE INDEX IF NOT EXISTS idx_article ON votes(article_slug)');
    $db->exec('CREATE INDEX IF NOT EXISTS idx_voter ON votes(voter_token)');

    // Table des statistiques agrégées (cache pour performance)
    $db->exec('
        CREATE TABLE IF NOT EXISTS vote_stats (
            article_slug TEXT PRIMARY KEY,
            likes INTEGER DEFAULT 0,
            dislikes INTEGER DEFAULT 0,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ');

    // Migration: renommer ip_hash en voter_token si l'ancienne colonne existe
    $result = $db->query("PRAGMA table_info(votes)");
    $hasIpHash = false;
    while ($row = $result->fetchArray(SQLITE3_ASSOC)) {
        if ($row['name'] === 'ip_hash') {
            $hasIpHash = true;
            break;
        }
    }

    if ($hasIpHash) {
        // SQLite ne supporte pas RENAME COLUMN directement dans toutes les versions
        // On crée une nouvelle table et on migre les données
        $db->exec('
            CREATE TABLE IF NOT EXISTS votes_new (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                article_slug TEXT NOT NULL,
                voter_token TEXT NOT NULL,
                vote_type INTEGER NOT NULL CHECK(vote_type IN (-1, 1)),
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(article_slug, voter_token)
            )
        ');
        $db->exec('INSERT OR IGNORE INTO votes_new (id, article_slug, voter_token, vote_type, created_at, updated_at) SELECT id, article_slug, ip_hash, vote_type, created_at, updated_at FROM votes');
        $db->exec('DROP TABLE votes');
        $db->exec('ALTER TABLE votes_new RENAME TO votes');
        $db->exec('CREATE INDEX IF NOT EXISTS idx_article ON votes(article_slug)');
        $db->exec('CREATE INDEX IF NOT EXISTS idx_voter ON votes(voter_token)');
    }

    // Permissions sécurisées
    chmod($dbPath, 0640);

    // Message seulement si exécuté directement en CLI (pas inclus par l'API)
    if (!defined('VOTE_API_INCLUDED') && php_sapi_name() === 'cli') {
        echo "Base de données créée/mise à jour avec succès: $dbPath\n";
    }

} catch (Exception $e) {
    if (!defined('VOTE_API_INCLUDED')) {
        echo "Erreur: " . $e->getMessage() . "\n";
        exit(1);
    }
    // Si inclus par l'API, laisser l'erreur remonter
    throw $e;
}
