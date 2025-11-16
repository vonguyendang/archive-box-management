<?php
session_start();
require 'db_config.php';

// (*** CẬP NHẬT TOÀN BỘ LOGIC BẢO MẬT ***)

// 1. Yêu cầu đăng nhập (bất kỳ ai cũng phải đăng nhập)
if (!isset($_SESSION['user_id'])) {
    json_response(['error' => 'Bạn cần đăng nhập để xem thông tin này.'], 401);
}

// 2. Lấy thông tin session
$user_id = $_SESSION['user_id'];
$role_id = $_SESSION['role_id'];

try {
    // 3. SQL cơ bản và mảng tham số (params)
    $sql = "SELECT 
                l.id, 
                l.log_time, 
                l.action, 
                l.detail, 
                u.username 
            FROM user_logs l
            LEFT JOIN users u ON l.user_id = u.id";
    
    $params = [];

    // 4. Logic Phân Quyền
    // Nếu không phải Admin (role_id != 1), thì chỉ lấy log của chính user đó
    if ($role_id != 1) {
        $sql .= " WHERE l.user_id = ?";
        $params[] = $user_id;
    }
    // Nếu là Admin (role_id == 1), không thêm 'WHERE', sẽ lấy tất cả log.

    // 5. Thêm ORDER BY và LIMIT (luôn chạy)
    $sql .= " ORDER BY l.log_time DESC LIMIT 200";
    
    // 6. Thực thi truy vấn
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $logs = $stmt->fetchAll();
    
    json_response($logs);

} catch (\PDOException $e) {
    json_response(['error' => 'Lỗi CSDL: ' . $e->getMessage()], 500);
}
?>