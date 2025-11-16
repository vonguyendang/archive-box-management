<?php
require 'db_config.php';

try {
    $stmt = $pdo->query("SELECT id, shelf_code FROM shelves ORDER BY shelf_code");
    $shelves = $stmt->fetchAll();
    json_response($shelves);
    
} catch (\PDOException $e) {
    json_response(['error' => $e->getMessage()], 500);
}
?>