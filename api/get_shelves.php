<?php
require 'db_config.php';

try {
    // CẬP NHẬT: Lấy thêm num_rows và num_cols
    $stmt = $pdo->query("SELECT id, shelf_code, num_rows, num_cols FROM shelves ORDER BY shelf_code");
    $shelves = $stmt->fetchAll();
    json_response($shelves);
    
} catch (\PDOException $e) {
    json_response(['error' => $e->getMessage()], 500);
}
?>