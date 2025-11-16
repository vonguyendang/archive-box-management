-- phpMyAdmin SQL Dump
-- version 4.9.0.1
-- https://www.phpmyadmin.net/
--
-- Host: sql311.infinityfree.com
-- Generation Time: Nov 15, 2025 at 11:38 PM
-- Server version: 11.4.7-MariaDB
-- PHP Version: 7.2.22

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `archive_box_management`
--

-- --------------------------------------------------------

--
-- Table structure for table `boxes`
--

CREATE TABLE `boxes` (
  `id` int(11) NOT NULL,
  `shelf_id` int(11) NOT NULL,
  `code` varchar(20) NOT NULL,
  `year` int(11) NOT NULL,
  `type` varchar(100) NOT NULL,
  `note` text DEFAULT NULL,
  `expiry` date NOT NULL,
  `stored_date` date NOT NULL,
  `stored_by` varchar(255) DEFAULT NULL,
  `agency` varchar(255) DEFAULT NULL,
  `department` varchar(255) DEFAULT NULL,
  `row` int(11) NOT NULL,
  `col` int(11) NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Dumping data for table `boxes`
--

INSERT INTO `boxes` (`id`, `shelf_id`, `code`, `year`, `type`, `note`, `expiry`, `stored_date`, `stored_by`, `agency`, `department`, `row`, `col`) VALUES
(1, 1, 'N76', 2022, 'Ch?ng th?', 'Ghi chú m?u cho thùng N76', '2025-12-31', '2022-01-15', 'Nguy?n V?n A', 'C? Quan X', 'Phòng Y', 2, 5),
(2, 1, 'H55', 2023, 'H? s? nhân s?', 'H? s? nhân viên 2023', '2023-06-30', '2023-01-01', 'Tr?n Th? B', 'C? Quan X', 'Phòng Nhân S?', 1, 1),
(3, 2, 'K90', 2021, 'K? toán', 'Tài li?u thu? 2021', '2026-01-01', '2021-03-10', 'Lê V?n C', 'C? Quan Z', 'Phòng K? Toán', 5, 10),
(4, 1, 'T12', 2023, 'Tài li?u d? án', 'D? án ABC', '2024-01-10', '2023-05-20', 'Ph?m Th? D', 'C? Quan X', 'Phòng D? Án', 3, 2);

-- --------------------------------------------------------

--
-- Table structure for table `files`
--

CREATE TABLE `files` (
  `id` int(11) NOT NULL,
  `box_id` int(11) NOT NULL,
  `file_code` varchar(50) DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `date_created` date DEFAULT NULL,
  `status` varchar(50) DEFAULT NULL,
  `created_by` varchar(255) DEFAULT NULL,
  `department` varchar(255) DEFAULT NULL
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Dumping data for table `files`
--

INSERT INTO `files` (`id`, `box_id`, `file_code`, `title`, `description`, `date_created`, `status`, `created_by`, `department`) VALUES
(1, 1, 'CT-001', 'Ch?ng th? ABC', 'Chi ti?t ch?ng th? ABC', '2022-01-10', '?ang l?u', 'Nguy?n V?n A', 'Phòng Y'),
(2, 1, 'CT-002', 'Ch?ng th? XYZ', 'Chi ti?t ch?ng th? XYZ', '2022-01-12', '?ang l?u', 'Nguy?n V?n A', 'Phòng Y'),
(3, 2, 'HS-001', 'H? s? NV 01', 'H? s? nhân viên Nguy?n V?n A', '2023-01-05', '?ang l?u', 'Tr?n Th? B', 'Phòng Nhân S?');

-- --------------------------------------------------------

--
-- Table structure for table `roles`
--

CREATE TABLE `roles` (
  `id` int(11) NOT NULL,
  `role_name` varchar(50) NOT NULL,
  `description` varchar(255) DEFAULT NULL
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Dumping data for table `roles`
--

INSERT INTO `roles` (`id`, `role_name`, `description`) VALUES
(1, 'admin', 'Qu?n tr? h? th?ng'),
(2, 'staff', 'Nhân viên qu?n lý kho/thùng h? s?'),
(3, 'viewer', 'Nhân viên tra c?u, xu?t báo cáo'),
(4, 'guest', 'Ng??i dùng công khai/quy?n h?n ch?');

-- --------------------------------------------------------

--
-- Table structure for table `shelves`
--

CREATE TABLE `shelves` (
  `id` int(11) NOT NULL,
  `shelf_code` char(1) NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Dumping data for table `shelves`
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
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `fullname` varchar(100) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `role_id` int(11) DEFAULT NULL,
  `active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Dumping data for table `users`
--
-- Bổ sung dữ liệu mẫu người dùng (mật khẩu '123' ĐÃ ĐƯỢC HASH)
-- Mật khẩu là: 123
INSERT INTO `users` (`id`, `username`, `password`, `fullname`, `email`, `role_id`, `active`, `created_at`) VALUES
(1, 'admin', '$2y$10$Y.a6A.b6rVEk7U6Q0/L0p.3.GZg1PbWJJ.p./H3G.Jpu2fO.PimF2', 'Qu?n Tr? Viên', 'admin@kho.com', 1, 1, '2025-11-16 04:31:54'),
(2, 'nhanvienkho', '$2y$10$Y.a6A.b6rVEk7U6Q0/L0p.3.GZg1PbWJJ.p./H3G.Jpu2fO.PimF2', 'Nguy?n V?n Kho', 'kho@kho.com', 2, 1, '2025-11-16 04:31:54'),
(3, 'tracuu', '$2y$10$Y.a6A.b6rVEk7U6Q0/L0p.3.GZg1PbWJJ.p./H3G.Jpu2fO.PimF2', 'Tr?n Th? Tra C?u', 'tracuu@kho.com', 3, 1, '2025-11-16 04:31:54');

-- --------------------------------------------------------

--
-- Table structure for table `user_logs`
--

CREATE TABLE `user_logs` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `action` varchar(255) NOT NULL,
  `log_time` timestamp NULL DEFAULT current_timestamp(),
  `detail` text DEFAULT NULL
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `boxes`
--
ALTER TABLE `boxes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_location` (`shelf_id`,`row`,`col`);

--
-- Indexes for table `files`
--
ALTER TABLE `files`
  ADD PRIMARY KEY (`id`),
  ADD KEY `box_id` (`box_id`);

--
-- Indexes for table `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `role_name` (`role_name`);

--
-- Indexes for table `shelves`
--
ALTER TABLE `shelves`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `shelf_code` (`shelf_code`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `role_id` (`role_id`);

--
-- Indexes for table `user_logs`
--
ALTER TABLE `user_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `boxes`
--
ALTER TABLE `boxes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `files`
--
ALTER TABLE `files`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `roles`
--
ALTER TABLE `roles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `shelves`
--
ALTER TABLE `shelves`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `user_logs`
--
ALTER TABLE `user_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
