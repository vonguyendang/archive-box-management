<?php
session_start();
require 'db_config.php';

// Bảo mật: Chỉ Admin (1) hoặc Staff (2) mới được sửa kệ
if (!isset($_SESSION['user_id'])) {
    json_response(['error' => 'Bạn cần đăng nhập.'], 401);
}
$allowed_roles = [1, 2];
if (!in_array($_SESSION['role_id'], $allowed_roles)) {
    json_response(['error' => 'Bạn không có quyền thực hiện hành động này.'], 403);
}

$data = json_decode(file_get_contents('php://input'));

$id = $data->id ?? null;
$shelf_code = $data->shelf_code ?? null;
$num_rows = $data->num_rows ?? 10;
$num_cols = $data->num_cols ?? 20;

if (empty($id) || empty($shelf_code)) {
    json_response(['error' => 'Thiếu ID hoặc Ký hiệu kệ.'], 400);
}

if (strlen($shelf_code) !== 1 || !preg_match('/^[A-Z]$/i', $shelf_code)) {
    json_response(['error' => 'Ký hiệu kệ phải là 1 chữ cái (A-Z).'], 400);
}

if ($num_rows <= 0 || $num_cols <= 0) {
    json_response(['error' => 'Số hàng và cột phải lớn hơn 0.'], 400);
}

try {
    $sql = "UPDATE shelves SET shelf_code = ?, num_rows = ?, num_cols = ? WHERE id = ?";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([strtoupper($shelf_code), $num_rows, $num_cols, $id]);
    
    json_response([
        'message' => 'Cập nhật kệ thành công!',
        'id' => $id,
        'shelf_code' => $shelf_code,
        'num_rows' => $num_rows,
        'num_cols' => $num_cols
    ]);

} catch (\PDOException $e) {
    if ($e->errorInfo[1] == 1062) {
        json_response(['error' => 'Lỗi: Ký hiệu kệ này đã tồn tại.'], 409);
    } else {
        json_response(['error' => 'Lỗi CSDL: ' . $e->getMessage()], 500);
    }
}
?>