<?php
require 'db_config.php';

// SQL cơ bản
// Chúng ta tính toán 'status' ngay trong SQL để lọc
$sql = "SELECT 
            b.*, 
            s.shelf_code,
            CASE
                WHEN b.expiry <= CURDATE() THEN 'expired'
                WHEN b.expiry <= DATE_ADD(CURDATE(), INTERVAL 90 DAY) THEN 'nearing'
                ELSE 'good'
            END AS status
        FROM boxes b
        JOIN shelves s ON b.shelf_id = s.id
        WHERE 1=1"; // Bắt đầu với điều kiện luôn đúng

$params = []; // Mảng chứa các tham số cho prepared statement

// --- XỬ LÝ LỌC ---

// Lọc theo Kệ
if (!empty($_GET['shelf_id'])) {
    $sql .= " AND b.shelf_id = ?";
    $params[] = $_GET['shelf_id'];
}

// Lọc theo ID (để lấy chi tiết 1 thùng)
if (!empty($_GET['id'])) {
    $sql .= " AND b.id = ?";
    $params[] = $_GET['id'];
}

// Lọc theo Mã thùng
if (!empty($_GET['code'])) {
    $sql .= " AND b.code LIKE ?";
    $params[] = '%' . $_GET['code'] . '%';
}

// Lọc theo Năm
if (!empty($_GET['year'])) {
    $sql .= " AND b.year = ?";
    $params[] = $_GET['year'];
}

// Lọc theo Loại
if (!empty($_GET['type'])) {
    $sql .= " AND b.type LIKE ?";
    $params[] = '%' . $_GET['type'] . '%';
}

// Lọc theo Cơ quan
if (!empty($_GET['agency'])) {
    $sql .= " AND b.agency LIKE ?";
    $params[] = '%' . $_GET['agency'] . '%';
}

// Lọc theo Phòng ban
if (!empty($_GET['department'])) {
    $sql .= " AND b.department LIKE ?";
    $params[] = '%' . $_GET['department'] . '%';
}

// Lọc theo Người lưu
if (!empty($_GET['stored_by'])) {
    $sql .= " AND b.stored_by LIKE ?";
    $params[] = '%' . $_GET['stored_by'] . '%';
}

// Lọc theo Trạng thái ( phức tạp hơn một chút )
if (!empty($_GET['status'])) {
    if ($_GET['status'] == 'good') {
        $sql .= " AND b.expiry > DATE_ADD(CURDATE(), INTERVAL 90 DAY)";
    } elseif ($_GET['status'] == 'nearing') {
        $sql .= " AND b.expiry BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 90 DAY)";
    } elseif ($_GET['status'] == 'expired') {
        $sql .= " AND b.expiry < CURDATE()";
    }
}

// --- THỰC THI TRUY VẤN ---
try {
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $results = $stmt->fetchAll();

    // Nếu hỏi chi tiết 1 thùng, trả về object, không phải mảng
    if (!empty($_GET['id']) && count($results) > 0) {
        json_response($results[0]);
    }

    json_response($results); // Trả về mảng kết quả

} catch (\PDOException $e) {
    json_response(['error' => $e->getMessage()], 500);
}

?>