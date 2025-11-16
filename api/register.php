<?php
require 'db_config.php';

$data = json_decode(file_get_contents('php://input'));

if (empty($data->username) || empty($data->password) || empty($data->email)) {
    json_response(['error' => 'Vui lòng điền đầy đủ thông tin.'], 400);
}

try {
    // Kiểm tra user tồn tại
    $stmt = $pdo->prepare("SELECT id FROM users WHERE username = ? OR email = ?");
    $stmt->execute([$data->username, $data->email]);
    if ($stmt->rowCount() > 0) {
        json_response(['error' => 'Tên đăng nhập hoặc Email đã được sử dụng.'], 409);
    }

    // Mặc định role_id = 4 (Guest) hoặc 3 (Viewer) tùy bạn chọn
    $default_role = 3; 
    $hashed_pass = password_hash($data->password, PASSWORD_DEFAULT);

    $sql = "INSERT INTO users (username, password, email, fullname, role_id, active) VALUES (?, ?, ?, ?, ?, 1)";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$data->username, $hashed_pass, $data->email, $data->fullname ?? '', $default_role]);

    json_response(['message' => 'Đăng ký thành công! Vui lòng đăng nhập.']);

} catch (PDOException $e) {
    json_response(['error' => 'Lỗi: ' . $e->getMessage()], 500);
}
?>