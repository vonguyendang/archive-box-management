<?php
session_start();
require 'db_config.php';

$data = json_decode(file_get_contents('php://input'));

if (empty($data->username) || empty($data->password)) {
    json_response(['error' => 'Vui lòng nhập tên đăng nhập và mật khẩu.'], 400);
}

try {
    $stmt = $pdo->prepare("SELECT * FROM users WHERE username = ? AND active = 1");
    $stmt->execute([$data->username]);
    $user = $stmt->fetch();

    if ($user && password_verify($data->password, $user['password'])) {
        // Đăng nhập thành công, lưu session
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['username'] = $user['username'];
        $_SESSION['role_id'] = $user['role_id'];
        $_SESSION['fullname'] = $user['fullname'];

        // (*** MỚI: Ghi log đăng nhập ***)
        write_log($pdo, $user['id'], 'Đăng nhập', 'Người dùng "' . $user['username'] . '" đã đăng nhập.');

        json_response(['message' => 'Đăng nhập thành công!', 'redirect' => 'index.html']);
    } else {
        json_response(['error' => 'Tên đăng nhập hoặc mật khẩu không đúng (hoặc tài khoản bị khóa).'], 401);
    }
} catch (PDOException $e) {
    json_response(['error' => 'Lỗi hệ thống: ' . $e->getMessage()], 500);
}
?>