<?php
/**
 * Script de debug pour le système de votes
 * À SUPPRIMER après debug
 */

header('Content-Type: text/html; charset=utf-8');

echo "<h1>Debug Votes - Réveil Douceur</h1>";

// 1. Vérifier la base de données
$dbPath = __DIR__ . '/votes.db';
echo "<h2>1. Base de données</h2>";
echo "<p>Chemin: <code>$dbPath</code></p>";

if (file_exists($dbPath)) {
    echo "<p style='color:green'>✅ Fichier existe</p>";
    echo "<p>Taille: " . filesize($dbPath) . " octets</p>";
    echo "<p>Permissions: " . substr(sprintf('%o', fileperms($dbPath)), -4) . "</p>";

    try {
        $db = new SQLite3($dbPath);
        echo "<p style='color:green'>✅ Connexion SQLite OK</p>";

        // Votes
        echo "<h3>Table votes (derniers 10):</h3>";
        echo "<pre>";
        $result = $db->query('SELECT * FROM votes ORDER BY created_at DESC LIMIT 10');
        $count = 0;
        while ($row = $result->fetchArray(SQLITE3_ASSOC)) {
            print_r($row);
            $count++;
        }
        echo "</pre>";
        echo "<p>Nombre affiché: $count</p>";

        // Stats
        echo "<h3>Table vote_stats (avec likes > 0):</h3>";
        echo "<pre>";
        $result = $db->query('SELECT * FROM vote_stats WHERE likes > 0 OR dislikes > 0');
        while ($row = $result->fetchArray(SQLITE3_ASSOC)) {
            print_r($row);
        }
        echo "</pre>";

        // Test requête spécifique
        echo "<h3>Test Salvador:</h3>";
        $stmt = $db->prepare('SELECT * FROM vote_stats WHERE article_slug = :slug');
        $stmt->bindValue(':slug', 'salvador-france-faible-avec-les-loups', SQLITE3_TEXT);
        $result = $stmt->execute()->fetchArray(SQLITE3_ASSOC);
        echo "<pre>";
        print_r($result ?: 'Aucun résultat');
        echo "</pre>";

    } catch (Exception $e) {
        echo "<p style='color:red'>❌ Erreur SQLite: " . $e->getMessage() . "</p>";
    }
} else {
    echo "<p style='color:red'>❌ Fichier n'existe pas</p>";
}

// 2. Test API
echo "<h2>2. Test API</h2>";

$testUrl = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http") . "://" . $_SERVER['HTTP_HOST'] . "/api/vote.php?article=salvador-france-faible-avec-les-loups";
echo "<p>URL: <code>$testUrl</code></p>";

$response = @file_get_contents($testUrl);
if ($response) {
    echo "<p style='color:green'>✅ API répond</p>";
    echo "<pre>" . htmlspecialchars($response) . "</pre>";
} else {
    echo "<p style='color:red'>❌ API ne répond pas</p>";
}

// 3. Cookies
echo "<h2>3. Cookies</h2>";
echo "<pre>";
print_r($_COOKIE);
echo "</pre>";

// 4. Info serveur
echo "<h2>4. Info serveur</h2>";
echo "<p>PHP: " . phpversion() . "</p>";
echo "<p>SQLite3: " . (class_exists('SQLite3') ? '✅ Disponible' : '❌ Non disponible') . "</p>";
echo "<p>Document Root: " . $_SERVER['DOCUMENT_ROOT'] . "</p>";

echo "<hr><p><em>Script de debug - À supprimer après utilisation</em></p>";
