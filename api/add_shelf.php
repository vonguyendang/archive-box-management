<?php
session_start();
require 'db_config.php';

// Bảo mật: Chỉ Admin (1) hoặc Staff (2) mới được thêm kệ
if (!isset($_SESSION['user_id'])) {
    json_response(['error' => 'Bạn cần đăng nhập.'], 401);
}

$allowed_roles = [1, 2]; // 1 = admin, 2 = staff
if (!in_array($_SESSION['role_id'], $allowed_roles)) {
    json_response(['error' => 'Bạn không có quyền thực hiện hành động này.'], 403);
}

$data = json_decode(file_get_contents('php://input'));
$shelf_code = $data->shelf_code ?? null;

if (empty($shelf_code)) {
    json_response(['error' => 'Ký hiệu kệ là bắt buộc.'], 400);
}

if (strlen($shelf_code) !== 1 || !preg_match('/^[A-Z]$/i', $shelf_code)) {
    json_response(['error' => 'Ký hiệu kệ phải là 1 chữ cái (A-Z).'], 400);
}

$shelf_code = strtoupper($shelf_code);

try {
    $sql = "INSERT INTO shelves (shelf_code) VALUES (?)";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$shelf_code]);
    
    $new_id = $pdo->lastInsertId();
    
    json_response([
        'message' => 'Thêm kệ mới thành công!',
        'id' => $new_id,
        'shelf_code' => $shelf_code
    ]);

} catch (\PDOException $e) {
    // Lỗi 1062: Duplicate entry (Kệ đã tồn tại)
    if ($e->errorInfo[1] == 1062) {
        json_response(['error' => 'Lỗi: Ký hiệu kệ này đã tồn tại.'], 409); // 409 Conflict
    } else {
        json_response(['error' => 'Lỗi CSDL: ' . $e->getMessage()], 500);
    }
}
?>