<?php
require 'db_config.php';

$data = json_decode(file_get_contents('php://input'));

$id = $data->id ?? null;

if (empty($id)) {
    json_response(['error' => 'Không có ID thùng để xóa.'], 400);
}

try {
    $sql = "DELETE FROM boxes WHERE id = ?";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$id]);
    
    if ($stmt->rowCount() > 0) {
        json_response(['message' => 'Đã xóa thùng thành công.']);
    } else {
        json_response(['error' => 'Không tìm thấy thùng để xóa.'], 404);
    }

} catch (\PDOException $e) {
    json_response(['error' => 'Lỗi CSDL: ' . $e->getMessage()], 500);
}
?>