<?php
require 'db_config.php';

$data = json_decode(file_get_contents('php://input'));

if (empty($data->email)) {
    json_response(['error' => 'Vui lòng nhập email.'], 400);
}

try {
    $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->execute([$data->email]);
    $user = $stmt->fetch();

    if ($user) {
        // Tạo token ngẫu nhiên
        $token = bin2hex(random_bytes(32));
        $expiry = date('Y-m-d H:i:s', strtotime('+1 hour')); // Hết hạn sau 1 giờ

        // Lưu token vào DB
        $update = $pdo->prepare("UPDATE users SET reset_token = ?, reset_expiry = ? WHERE id = ?");
        $update->execute([$token, $expiry, $user['id']]);

        // TRONG THỰC TẾ: Gửi email chứa link: http://domain.com/reset_password.html?token=$token
        // Ở ĐÂY (DEMO): Trả về token luôn để test
        json_response([
            'message' => 'Yêu cầu thành công. (Môi trường Dev: Token reset của bạn là bên dưới)',
            'dev_token_link' => "reset_password.html?token=" . $token
        ]);
    } else {
        // Bảo mật: Không báo lỗi nếu email không tồn tại, cứ báo thành công ảo
        json_response(['message' => 'Nếu email tồn tại, chúng tôi đã gửi link reset mật khẩu.']);
    }
} catch (PDOException $e) {
    json_response(['error' => 'Lỗi: ' . $e->getMessage()], 500);
}
?>