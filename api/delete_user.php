<?php
require 'db_config.php';

$data = json_decode(file_get_contents('php://input'));
$id = $data->id ?? null;

if (empty($id)) {
    json_response(['error' => 'Không có ID người dùng để xóa.'], 400);
}

// Biện pháp an toàn: Không cho xóa user admin gốc (giả sử id=1)
if ($id == 1) {
    json_response(['error' => 'Không thể xóa Quản Trị Viên gốc.'], 403);
}

try {
    $sql = "DELETE FROM users WHERE id = ?";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$id]);
    
    if ($stmt->rowCount() > 0) {
        json_response(['message' => 'Đã xóa người dùng thành công.']);
    } else {
        json_response(['error' => 'Không tìm thấy người dùng để xóa.'], 404);
    }

} catch (\PDOException $e) {
    json_response(['error' => 'Lỗi CSDL: ' . $e->getMessage()], 500);
}
?>