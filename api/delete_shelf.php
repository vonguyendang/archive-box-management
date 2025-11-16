<?php
session_start();
require 'db_config.php';

// Bảo mật: Chỉ Admin (1) hoặc Staff (2) mới được xóa kệ
if (!isset($_SESSION['user_id'])) {
    json_response(['error' => 'Bạn cần đăng nhập.'], 401);
}
$allowed_roles = [1, 2];
if (!in_array($_SESSION['role_id'], $allowed_roles)) {
    json_response(['error' => 'Bạn không có quyền thực hiện hành động này.'], 403);
}

$user_id = $_SESSION['user_id'];
$data = json_decode(file_get_contents('php://input'));
$id = $data->id ?? null;

if (empty($id)) {
    json_response(['error' => 'Không có ID kệ để xóa.'], 400);
}

try {
    // *** KIỂM TRA QUAN TRỌNG: Đảm bảo kệ rỗng trước khi xóa ***
    $check_sql = "SELECT COUNT(id) AS count FROM boxes WHERE shelf_id = ?";
    $check_stmt = $pdo->prepare($check_sql);
    $check_stmt->execute([$id]);
    $result = $check_stmt->fetch();

    if ($result['count'] > 0) {
        // Nếu kệ không rỗng, từ chối xóa
        json_response(['error' => 'Không thể xóa kệ này vì vẫn còn ' . $result['count'] . ' thùng hồ sơ. Vui lòng di chuyển hoặc xóa hết thùng trước.'], 403); // 403 Forbidden
    }

    // Nếu kệ rỗng, tiếp tục xóa
    
    // Lấy thông tin kệ để ghi log (trước khi xóa)
    $shelf_info_stmt = $pdo->prepare("SELECT shelf_code FROM shelves WHERE id = ?");
    $shelf_info_stmt->execute([$id]);
    $shelf_info = $shelf_info_stmt->fetch();
    $shelf_code = $shelf_info ? $shelf_info['shelf_code'] : 'ID ' . $id;

    // Tiến hành xóa
    $sql = "DELETE FROM shelves WHERE id = ?";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$id]);
    
    if ($stmt->rowCount() > 0) {
        // Ghi log
        write_log($pdo, $user_id, 'Xóa kệ', 'Người dùng (ID: ' . $user_id . ') đã xóa kệ "' . $shelf_code . '" (ID: ' . $id . ')');
        
        json_response(['message' => 'Đã xóa kệ thành công.']);
    } else {
        json_response(['error' => 'Không tìm thấy kệ để xóa.'], 404);
    }

} catch (\PDOException $e) {
    json_response(['error' => 'Lỗi CSDL: ' . $e->getMessage()], 500);
}
?>