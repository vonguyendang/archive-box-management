<?php
require 'db_config.php';

// SQL cơ bản, join với Bảng roles và KHÔNG BAO GIỜ lấy mật khẩu
$sql = "SELECT 
            u.id, 
            u.username, 
            u.fullname, 
            u.email, 
            u.active, 
            u.role_id, 
            r.role_name 
        FROM users u
        LEFT JOIN roles r ON u.role_id = r.id
        WHERE 1=1";

$params = [];

// Lấy chi tiết 1 user
if (!empty($_GET['id'])) {
    $sql .= " AND u.id = ?";
    $params[] = $_GET['id'];
}

try {
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    
    if (!empty($_GET['id'])) {
        // Trả về 1 object nếu tìm 1 user
        $user = $stmt->fetch();
        if ($user) {
            json_response($user);
        } else {
            json_response(['error' => 'Không tìm thấy người dùng'], 404);
        }
    } else {
        // Trả về mảng nếu lấy danh sách
        $users = $stmt->fetchAll();
        json_response($users);
    }

} catch (\PDOException $e) {
    json_response(['error' => $e->getMessage()], 500);
}
?>