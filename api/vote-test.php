<?php
// Wrapper pour tester vote.php et capturer les erreurs
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "=== Test vote.php ===\n";
echo "PHP: " . PHP_VERSION . "\n";

// Simuler une requête GET
$_SERVER['REQUEST_METHOD'] = 'GET';
$_GET['article'] = 'test-article';

try {
    include __DIR__ . '/vote.php';
} catch (Throwable $e) {
    echo "\nERREUR CAPTURÉE:\n";
    echo "Type: " . get_class($e) . "\n";
    echo "Message: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . "\n";
    echo "Line: " . $e->getLine() . "\n";
}
