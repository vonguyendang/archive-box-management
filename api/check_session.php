<?php
session_start();
require 'db_config.php'; // Để dùng hàm json_response

if (isset($_SESSION['user_id'])) {
    json_response([
        'logged_in' => true,
        'user' => [
            'id' => $_SESSION['user_id'],
            'username' => $_SESSION['username'],
            'fullname' => $_SESSION['fullname'],
            'role_id' => $_SESSION['role_id']
        ]
    ]);
} else {
    json_response(['logged_in' => false], 401);
}
?>