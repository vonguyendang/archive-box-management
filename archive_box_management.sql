-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Máy chủ: localhost
-- Thời gian đã tạo: Th10 16, 2025 lúc 08:41 AM
-- Phiên bản máy phục vụ: 10.4.28-MariaDB
-- Phiên bản PHP: 8.2.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+07:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Cơ sở dữ liệu: `archive_box_management`
--

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `boxes`
--

CREATE TABLE `boxes` (
  `id` int(11) NOT NULL,
  `shelf_id` int(11) NOT NULL,
  `code` varchar(20) NOT NULL,
  `year` int(11) NOT NULL,
  `type` varchar(100) NOT NULL,
  `note` mediumtext DEFAULT NULL,
  `expiry` date NOT NULL,
  `stored_date` date NOT NULL,
  `stored_by` varchar(255) DEFAULT NULL,
  `agency` varchar(255) DEFAULT NULL,
  `department` varchar(255) DEFAULT NULL,
  `row` int(11) NOT NULL,
  `col` int(11) NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `boxes`
--

INSERT INTO `boxes` (`id`, `shelf_id`, `code`, `year`, `type`, `note`, `expiry`, `stored_date`, `stored_by`, `agency`, `department`, `row`, `col`) VALUES
(1, 1, 'N76', 2022, 'Chứng thư', 'Ghi chú cho thùng N76', '2025-12-31', '2022-01-15', 'Nguyễn Văn A', 'Cơ Quan X', 'Phòng Y', 2, 5),
(2, 1, 'H55', 2023, 'Hồ sơ nhân sự', 'Hồ sơ nhân viên 2023', '2023-06-30', '2023-01-01', 'Trần Thị B', 'Cơ Quan X', 'Phòng Nhân S?', 1, 1),
(3, 2, 'K90', 2021, 'Kế toán', 'Tài liệu thu 2021', '2026-01-01', '2021-03-10', 'Lê Văn C', 'Cơ Quan Z', 'Phòng Kế Toán', 5, 10),
(4, 1, 'T12', 2023, 'Tài liệu dự án', 'Dự án ABC', '2024-01-10', '2023-05-20', 'Phạm Thị D', 'Cơ Quan X', 'Phòng Dự Án', 3, 2),
(5, 1, 'H89', 2025, 'Chứng thư', '', '2029-12-16', '2025-11-16', 'Võ Nguyễn Đăng', 'Cơ Quan X', 'Phòng Y', 9, 10);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `files`
--

CREATE TABLE `files` (
  `id` int(11) NOT NULL,
  `box_id` int(11) NOT NULL,
  `file_code` varchar(50) DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `description` mediumtext DEFAULT NULL,
  `date_created` date DEFAULT NULL,
  `status` varchar(50) DEFAULT NULL,
  `created_by` varchar(255) DEFAULT NULL,
  `department` varchar(255) DEFAULT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `files`
--

INSERT INTO `files` (`id`, `box_id`, `file_code`, `title`, `description`, `date_created`, `status`, `created_by`, `department`) VALUES
(1, 1, 'CT-001', 'Chứng thư ABC', 'Chi tiết chứng thư ABC', '2022-01-10', 'Đang lưu', 'Nguyễn Văn A', 'Phòng Y'),
(2, 1, 'CT-002', 'Chứng thư XYZ', 'Chi tiết chứng thư XYZ', '2022-01-12', 'Đang lưu', 'Nguyễn Văn A', 'Phòng Y'),
(3, 2, 'HS-001', 'Hồ sơ NV 01', 'Hồ sơ nhân viên Nguyễn văn A', '2023-01-05', 'Đang lưu', 'Trần Thị B', 'Phòng Nhân Sự');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `roles`
--

CREATE TABLE `roles` (
  `id` int(11) NOT NULL,
  `role_name` varchar(50) NOT NULL,
  `description` varchar(255) DEFAULT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `roles`
--

INSERT INTO `roles` (`id`, `role_name`, `description`) VALUES
(1, 'admin', 'Quản trị hệ thống'),
(2, 'staff', 'Nhân viên quản lý kho/thùng hồ sơ'),
(3, 'viewer', 'Nhân viên tra cứu, xuất báo cáo'),
(4, 'guest', 'Người dùng công khai/quyền hạn chế');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `shelves`
--

CREATE TABLE `shelves` (
  `id` int(11) NOT NULL,
  `shelf_code` char(1) NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `shelves`
--

INSERT INTO `shelves` (`id`, `shelf_code`) VALUES
(1, 'A'),
(2, 'B'),
(3, 'C'),
(4, 'D'),
(5, 'E'),
(6, 'F'),
(7, 'G');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `fullname` varchar(100) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `role_id` int(11) DEFAULT NULL,
  `active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `reset_token` varchar(64) DEFAULT NULL,
  `reset_expiry` datetime DEFAULT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `users`
--

INSERT INTO `users` (`id`, `username`, `password`, `fullname`, `email`, `role_id`, `active`, `created_at`, `reset_token`, `reset_expiry`) VALUES
(1, 'admin', '$2y$10$XAfwK3gvaTqOmFt7h1DTcefNgEgCPCVKtoys5sBZtbYIlW0nchpQ.', 'Quản Trị Viên', 'admin@kho.com', 1, 1, '2025-11-16 04:31:54', NULL, NULL),
(2, 'nhanvienkho', '$2y$10$XAfwK3gvaTqOmFt7h1DTcefNgEgCPCVKtoys5sBZtbYIlW0nchpQ.', 'Nhân viên kho', 'kho@kho.com', 2, 1, '2025-11-16 04:31:54', NULL, NULL),
(3, 'tracuu', '$2y$10$XAfwK3gvaTqOmFt7h1DTcefNgEgCPCVKtoys5sBZtbYIlW0nchpQ.', 'Nhân viên truy xuất', 'tracuu@kho.com', 3, 1, '2025-11-16 04:31:54', NULL, NULL),
(4, 'dangvo', '$2y$10$l7OHrRqT8vpyMvhlAcD4K.8QlXFCxhGOoWDoE7t3ysGpOicTE2vt.', 'Võ Nguyễn Đăng', 'vodang2702@gmail.com', 1, 1, '2025-11-16 05:35:40', NULL, NULL);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `user_logs`
--

CREATE TABLE `user_logs` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `action` varchar(255) NOT NULL,
  `log_time` timestamp NULL DEFAULT current_timestamp(),
  `detail` mediumtext DEFAULT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Chỉ mục cho các bảng đã đổ
--

--
-- Chỉ mục cho bảng `boxes`
--
ALTER TABLE `boxes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_location` (`shelf_id`,`row`,`col`);

--
-- Chỉ mục cho bảng `files`
--
ALTER TABLE `files`
  ADD PRIMARY KEY (`id`),
  ADD KEY `box_id` (`box_id`);

--
-- Chỉ mục cho bảng `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `role_name` (`role_name`);

--
-- Chỉ mục cho bảng `shelves`
--
ALTER TABLE `shelves`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `shelf_code` (`shelf_code`);

--
-- Chỉ mục cho bảng `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `role_id` (`role_id`);

--
-- Chỉ mục cho bảng `user_logs`
--
ALTER TABLE `user_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- AUTO_INCREMENT cho các bảng đã đổ
--

--
-- AUTO_INCREMENT cho bảng `boxes`
--
ALTER TABLE `boxes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT cho bảng `files`
--
ALTER TABLE `files`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT cho bảng `roles`
--
ALTER TABLE `roles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT cho bảng `shelves`
--
ALTER TABLE `shelves`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT cho bảng `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT cho bảng `user_logs`
--
ALTER TABLE `user_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
