<?php
session_start(); // (MỚI) Bắt đầu session
require 'db_config.php';

// (MỚI) Bảo mật: Chỉ Admin mới được xóa user
if (!isset($_SESSION['user_id'])) {
    json_response(['error' => 'Bạn cần đăng nhập.'], 401);
}
if ($_SESSION['role_id'] != 1) { // 1 = admin
    json_response(['error' => 'Bạn không có quyền thực hiện hành động này.'], 403);
}

// (*** MỚI: Lấy ID của admin đang thực hiện ***)
$admin_user_id = $_SESSION['user_id'];

$data = json_decode(file_get_contents('php://input'));
$id = $data->id ?? null;

if (empty($id)) {
    json_response(['error' => 'Không có ID người dùng để xóa.'], 400);
}

// Biện pháp an toàn: Không cho xóa user admin gốc (giả sử id=1)
if ($id == 1) {
    json_response(['error' => 'Không thể xóa Quản Trị Viên gốc.'], 403);
}

// (MỚI) Không cho Admin tự xóa chính mình
if ($id == $admin_user_id) {
    json_response(['error' => 'Bạn không thể tự xóa chính mình.'], 403);
}

try {
    // (*** MỚI: Lấy tên user bị xóa để ghi log ***)
    $user_stmt = $pdo->prepare("SELECT username FROM users WHERE id = ?");
    $user_stmt->execute([$id]);
    $user_to_delete = $user_stmt->fetch();
    $username_to_delete = $user_to_delete ? $user_to_delete['username'] : 'ID ' . $id;
    // (*** Hết phần mới ***)

    $sql = "DELETE FROM users WHERE id = ?";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$id]);
    
    if ($stmt->rowCount() > 0) {
        // (*** MỚI: Ghi log hành động xóa ***)
        write_log($pdo, $admin_user_id, 'Xóa người dùng', 'Admin (ID: ' . $admin_user_id . ') đã xóa người dùng "' . $username_to_delete . '" (ID: ' . $id . ')');
        
        json_response(['message' => 'Đã xóa người dùng thành công.']);
    } else {
        json_response(['error' => 'Không tìm thấy người dùng để xóa.'], 404);
    }

} catch (\PDOException $e) {
    json_response(['error' => 'Lỗi CSDL: ' . $e->getMessage()], 500);
}
?>