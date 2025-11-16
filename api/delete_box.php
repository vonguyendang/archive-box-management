<?php
session_start(); // (*** MỚI ***)
require 'db_config.php';

// (*** MỚI: Lấy ID người dùng từ session ***)
$user_id = $_SESSION['user_id'] ?? null;
if (!$user_id) {
    json_response(['error' => 'Bạn cần đăng nhập để thực hiện hành động này.'], 401);
}

$data = json_decode(file_get_contents('php://input'));
$id = $data->id ?? null;

if (empty($id)) {
    json_response(['error' => 'Không có ID thùng để xóa.'], 400);
}

try {
    // (*** MỚI: Lấy thông tin thùng TRƯỚC KHI XÓA để ghi log ***)
    $box_stmt = $pdo->prepare("SELECT code FROM boxes WHERE id = ?");
    $box_stmt->execute([$id]);
    $box_to_delete = $box_stmt->fetch();
    $box_code = $box_to_delete ? $box_to_delete['code'] : 'ID ' . $id;
    // (*** Hết phần mới ***)


    $sql = "DELETE FROM boxes WHERE id = ?";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$id]);
    
    if ($stmt->rowCount() > 0) {
        // (*** MỚI: Ghi log hành động xóa ***)
        // Giả sử $user_id đã được lấy từ session
        write_log($pdo, $user_id, 'Xóa thùng', 'Người dùng (ID: ' . $user_id . ') đã xóa thùng "' . $box_code . '" (ID: ' . $id . ')');

        json_response(['message' => 'Đã xóa thùng thành công.']);
    } else {
        json_response(['error' => 'Không tìm thấy thùng để xóa.'], 404);
    }

} catch (\PDOException $e) {
    json_response(['error' => 'Lỗi CSDL: ' . $e->getMessage()], 500);
}
?>