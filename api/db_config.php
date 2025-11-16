<?php
// Thông tin kết nối CSDL
define('DB_HOST', 'localhost');
define('DB_PORT', '3306');
define('DB_USER', 'root'); // <-- THAY ĐỔI
define('DB_PASS', ''); // <-- THAY ĐỔI
define('DB_NAME', 'archive_box_management'); // Tên CSDL từ tệp .sql

// Cài đặt DSN (Data Source Name)
$dsn = "mysql:host=" . DB_HOST . ";port=" . DB_PORT . ";dbname=" . DB_NAME . ";charset=utf8mb4";

// Tùy chọn cho PDO
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION, // Bật báo lỗi
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC, // Trả về dạng mảng associative
    PDO::ATTR_EMULATE_PREPARES   => false, // Tắt chế độ mô phỏng prepared statements
];

// Tạo kết nối PDO
try {
     $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
} catch (\PDOException $e) {
     // Nếu kết nối thất bại, "chết" và báo lỗi
     http_response_code(500);
     echo json_encode(['error' => 'Database connection failed: ' . $e->getMessage()]);
     exit;
}

// Hàm trợ giúp để trả về JSON và thoát
function json_response($data, $code = 200) {
    http_response_code($code);
    header('Content-Type: application/json');
    echo json_encode($data);
    exit;
}

// Đặt header chung cho các API
header('Content-Type: application/json');

?>