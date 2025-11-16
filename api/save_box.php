<?php
session_start(); // (*** MỚI ***)
require 'db_config.php';

// (*** MỚI: Lấy ID người dùng từ session ***)
$user_id = $_SESSION['user_id'] ?? null;
if (!$user_id) {
    json_response(['error' => 'Bạn cần đăng nhập để thực hiện hành động này.'], 401);
}

// Nhận dữ liệu JSON thô từ body của request
$data = json_decode(file_get_contents('php://input'));

// Validate dữ liệu cơ bản (trong dự án thật nên validate kỹ hơn)
if (empty($data->code) || empty($data->year) || empty($data->type) || empty($data->stored_date) || empty($data->expiry)) {
    json_response(['error' => 'Vui lòng điền các trường bắt buộc.'], 400);
}

// Tách id ra (nếu có)
$id = $data->id ?? null;

try {
    if ($id) {
        // --- CẬP NHẬT (UPDATE) ---
        $sql = "UPDATE boxes SET 
                    code = ?, year = ?, type = ?, note = ?, expiry = ?, 
                    stored_date = ?, stored_by = ?, agency = ?, department = ?, 
                    `row` = ?, `col` = ?, shelf_id = ?
                WHERE id = ?";
        
        $params = [
            $data->code, $data->year, $data->type, $data->note, $data->expiry,
            $data->stored_date, $data->stored_by, $data->agency, $data->department,
            $data->row, $data->col, $data->shelf_id,
            $id
        ];
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $message = 'Cập nhật thùng thành công!';

        // (*** MỚI: Ghi log cập nhật ***)
        write_log($pdo, $user_id, 'Cập nhật thùng', 'Cập nhật thùng ID ' . $id . ' (Mã: ' . $data->code . ')');

    } else {
        // --- THÊM MỚI (INSERT) ---
        $sql = "INSERT INTO boxes 
                    (code, year, type, note, expiry, stored_date, stored_by, 
                     agency, department, `row`, `col`, shelf_id)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        
        $params = [
            $data->code, $data->year, $data->type, $data->note, $data->expiry,
            $data->stored_date, $data->stored_by, $data->agency, $data->department,
            $data->row, $data->col, $data->shelf_id
        ];
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $id = $pdo->lastInsertId(); // Lấy ID vừa chèn
        $message = 'Thêm thùng mới thành công!';

        // (*** MỚI: Ghi log thêm mới ***)
        write_log($pdo, $user_id, 'Tạo thùng mới', 'Tạo thùng ID ' . $id . ' (Mã: ' . $data->code . ')');
    }
    
    // Trả về dữ liệu đã lưu (bao gồm cả ID) và thông báo
    json_response([
        'message' => $message,
        'id' => $id
    ]);

} catch (\PDOException $e) {
    // Lỗi 1062: Duplicate entry (vi phạm UNIQUE key)
    if ($e->errorInfo[1] == 1062) {
        json_response(['error' => 'Lỗi: Vị trí này đã có thùng. Không thể lưu.'], 409); // 409 Conflict
    } else {
        json_response(['error' => 'Lỗi CSDL: ' . $e->getMessage()], 500);
    }
}
?>