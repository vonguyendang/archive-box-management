<?php
require 'db_config.php';

try {
    $stmt = $pdo->query("SELECT id, role_name FROM roles ORDER BY role_name");
    $roles = $stmt->fetchAll();
    json_response($roles);
    
} catch (\PDOException $e) {
    json_response(['error' => $e->getMessage()], 500);
}
?>