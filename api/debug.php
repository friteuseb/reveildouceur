<?php
/**
 * Script de diagnostic - À SUPPRIMER après debug
 */
header('Content-Type: application/json');

$checks = [];

// 1. Version PHP
$checks['php_version'] = PHP_VERSION;
$checks['php_version_ok'] = version_compare(PHP_VERSION, '7.0.0', '>=');

// 2. Extension SQLite3
$checks['sqlite3_loaded'] = extension_loaded('sqlite3');

// 3. Permissions du répertoire
$checks['dir'] = __DIR__;
$checks['dir_writable'] = is_writable(__DIR__);
$checks['dir_permissions'] = substr(sprintf('%o', fileperms(__DIR__)), -4);

// 4. Fichier votes.db
$dbPath = __DIR__ . '/votes.db';
$checks['db_exists'] = file_exists($dbPath);
if (file_exists($dbPath)) {
    $checks['db_writable'] = is_writable($dbPath);
    $checks['db_permissions'] = substr(sprintf('%o', fileperms($dbPath)), -4);
}

// 5. Test création fichier
$testFile = __DIR__ . '/test_write_' . time() . '.tmp';
$checks['can_create_file'] = @file_put_contents($testFile, 'test') !== false;
if (file_exists($testFile)) {
    unlink($testFile);
}

// 6. Test SQLite3
if ($checks['sqlite3_loaded']) {
    try {
        $testDb = new SQLite3(':memory:');
        $checks['sqlite3_works'] = true;
        $testDb->close();
    } catch (Exception $e) {
        $checks['sqlite3_works'] = false;
        $checks['sqlite3_error'] = $e->getMessage();
    }
}

// 7. Test création DB sur disque
if ($checks['sqlite3_loaded'] && $checks['dir_writable']) {
    try {
        $testDbPath = __DIR__ . '/test_db_' . time() . '.db';
        $testDb = new SQLite3($testDbPath);
        $testDb->exec('CREATE TABLE test (id INTEGER)');
        $checks['sqlite3_disk_works'] = true;
        $testDb->close();
        unlink($testDbPath);
    } catch (Exception $e) {
        $checks['sqlite3_disk_works'] = false;
        $checks['sqlite3_disk_error'] = $e->getMessage();
    }
}

// 8. Utilisateur/groupe du processus
$checks['process_user'] = function_exists('posix_getpwuid') ? posix_getpwuid(posix_geteuid())['name'] : 'unknown';

// Résumé
$checks['all_ok'] = $checks['php_version_ok']
    && $checks['sqlite3_loaded']
    && $checks['dir_writable']
    && ($checks['sqlite3_works'] ?? false)
    && ($checks['sqlite3_disk_works'] ?? false);

echo json_encode($checks, JSON_PRETTY_PRINT);
