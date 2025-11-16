<?php
session_start(); // (MỚI) Bắt đầu session
require 'db_config.php';

// (MỚI) Bảo mật: Chỉ Admin mới được lưu user
if (!isset($_SESSION['user_id'])) {
    json_response(['error' => 'Bạn cần đăng nhập.'], 401);
}
if ($_SESSION['role_id'] != 1) { // 1 = admin
    json_response(['error' => 'Bạn không có quyền thực hiện hành động này.'], 403);
}

// (*** MỚI: Lấy ID của admin đang thực hiện ***)
$admin_user_id = $_SESSION['user_id'];

// Nhận dữ liệu JSON
$data = json_decode(file_get_contents('php://input'));

// Validate dữ liệu
if (empty($data->username) || empty($data->role_id)) {
    json_response(['error' => 'Tên đăng nhập và Vai trò là bắt buộc.'], 400);
}

$id = $data->id ?? null;
$password = $data->password ?? null;

try {
    if ($id) {
        // --- CẬP NHẬT (UPDATE) ---
        $params = [
            $data->username,
            $data->fullname,
            $data->email,
            $data->role_id,
            $data->active
        ];
        
        $sql = "UPDATE users SET 
                    username = ?, 
                    fullname = ?, 
                    email = ?, 
                    role_id = ?, 
                    active = ?";
        
        // Chỉ cập nhật mật khẩu nếu nó được cung cấp (không rỗng)
        if (!empty($password)) {
            $hashed_password = password_hash($password, PASSWORD_DEFAULT);
            $sql .= ", password = ?";
            $params[] = $hashed_password;
        }
        
        $sql .= " WHERE id = ?";
        $params[] = $id;
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $message = 'Cập nhật người dùng thành công!';

        // (*** MỚI: Ghi log cập nhật user ***)
        write_log($pdo, $admin_user_id, 'Cập nhật người dùng', 'Admin (ID: ' . $admin_user_id . ') đã cập nhật người dùng "' . $data->username . '" (ID: ' . $id . ')');

    } else {
        // --- THÊM MỚI (INSERT) ---
        
        // Mật khẩu là bắt buộc khi thêm mới
        if (empty($password)) {
            json_response(['error' => 'Mật khẩu là bắt buộc khi tạo người dùng mới.'], 400);
        }
        
        $hashed_password = password_hash($password, PASSWORD_DEFAULT);
        
        $sql = "INSERT INTO users 
                    (username, fullname, email, role_id, active, password)
                VALUES (?, ?, ?, ?, ?, ?)";
        
        $params = [
            $data->username,
            $data->fullname,
            $data->email,
            $data->role_id,
            $data->active,
            $hashed_password
        ];
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $id = $pdo->lastInsertId();
        $message = 'Thêm người dùng mới thành công!';

        // (*** MỚI: Ghi log tạo user ***)
        write_log($pdo, $admin_user_id, 'Tạo người dùng mới', 'Admin (ID: ' . $admin_user_id . ') đã tạo người dùng mới "' . $data->username . '" (ID: ' . $id . ')');
    }
    
    json_response([
        'message' => $message,
        'id' => $id
    ]);

} catch (\PDOException $e) {
    // Lỗi 1062: Duplicate entry (username hoặc email đã tồn tại)
    if ($e->errorInfo[1] == 1062) {
        json_response(['error' => 'Lỗi: Tên đăng nhập hoặc Email đã tồn tại.'], 409); // 409 Conflict
    } else {
        json_response(['error' => 'Lỗi CSDL: ' . $e->getMessage()], 500);
    }
}
?>