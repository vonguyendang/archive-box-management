<?php
require 'db_config.php';

$data = json_decode(file_get_contents('php://input'));

if (empty($data->token) || empty($data->new_password)) {
    json_response(['error' => 'Thiếu thông tin.'], 400);
}

try {
    // Kiểm tra token hợp lệ và chưa hết hạn
    $stmt = $pdo->prepare("SELECT id FROM users WHERE reset_token = ? AND reset_expiry > NOW()");
    $stmt->execute([$data->token]);
    $user = $stmt->fetch();

    if ($user) {
        $hashed_pass = password_hash($data->new_password, PASSWORD_DEFAULT);
        
        // Cập nhật mật khẩu và xóa token
        $update = $pdo->prepare("UPDATE users SET password = ?, reset_token = NULL, reset_expiry = NULL WHERE id = ?");
        $update->execute([$hashed_pass, $user['id']]);

        json_response(['message' => 'Mật khẩu đã được thay đổi thành công.']);
    } else {
        json_response(['error' => 'Link reset không hợp lệ hoặc đã hết hạn.'], 400);
    }
} catch (PDOException $e) {
    json_response(['error' => 'Lỗi: ' . $e->getMessage()], 500);
}
?>