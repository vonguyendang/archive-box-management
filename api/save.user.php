<?php
require 'db_config.php';

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