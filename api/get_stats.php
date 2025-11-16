<?php
require 'db_config.php';

try {
    // 1. Thống kê theo trạng thái
    $status_sql = "SELECT 
        SUM(CASE WHEN expiry <= CURDATE() THEN 1 ELSE 0 END) AS expired,
        SUM(CASE WHEN expiry BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 90 DAY) THEN 1 ELSE 0 END) AS nearing,
        SUM(CASE WHEN expiry > DATE_ADD(CURDATE(), INTERVAL 90 DAY) THEN 1 ELSE 0 END) AS good
    FROM boxes";
    $statusCount = $pdo->query($status_sql)->fetch();
    
    // 2. Thống kê theo kệ
    $shelf_sql = "SELECT s.shelf_code, COUNT(b.id) AS count 
                  FROM shelves s 
                  LEFT JOIN boxes b ON s.id = b.shelf_id 
                  GROUP BY s.id 
                  ORDER BY s.shelf_code";
    // Lấy dạng 'A' => 5, 'B' => 10
    $shelfCount = $pdo->query($shelf_sql)->fetchAll(PDO::FETCH_KEY_PAIR); 
    
    // 3. Thống kê theo năm
    $year_sql = "SELECT year, COUNT(id) AS count 
                 FROM boxes 
                 GROUP BY year 
                 ORDER BY year";
    $yearCount = $pdo->query($year_sql)->fetchAll(PDO::FETCH_KEY_PAIR);
    
    // Trả về tất cả dữ liệu
    json_response([
        'statusCount' => $statusCount,
        'shelfCount'  => $shelfCount,
        'yearCount'   => $yearCount
    ]);

} catch (\PDOException $e) {
    json_response(['error' => $e->getMessage()], 500);
}
?>