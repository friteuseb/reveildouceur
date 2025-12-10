<?php
/**
 * Initialisation de la base de données SQLite pour les votes
 * À exécuter une seule fois pour créer la structure
 */

$dbPath = __DIR__ . '/votes.db';

try {
    $db = new SQLite3($dbPath);

    // Table des votes
    $db->exec('
        CREATE TABLE IF NOT EXISTS votes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            article_slug TEXT NOT NULL,
            ip_hash TEXT NOT NULL,
            vote_type INTEGER NOT NULL CHECK(vote_type IN (-1, 1)),
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(article_slug, ip_hash)
        )
    ');

    // Index pour les requêtes fréquentes
    $db->exec('CREATE INDEX IF NOT EXISTS idx_article ON votes(article_slug)');
    $db->exec('CREATE INDEX IF NOT EXISTS idx_ip ON votes(ip_hash)');

    // Table des statistiques agrégées (cache pour performance)
    $db->exec('
        CREATE TABLE IF NOT EXISTS vote_stats (
            article_slug TEXT PRIMARY KEY,
            likes INTEGER DEFAULT 0,
            dislikes INTEGER DEFAULT 0,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ');

    echo "Base de données créée avec succès: $dbPath\n";

    // Permissions sécurisées
    chmod($dbPath, 0640);

} catch (Exception $e) {
    echo "Erreur: " . $e->getMessage() . "\n";
    exit(1);
}
