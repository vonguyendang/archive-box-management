# 📦 Hệ Thống Quản Lý Kho Lưu Trữ (Archive Box Management)

Đây là một dự án ứng dụng web PHP/MySQL đơn giản để quản lý và theo dõi các thùng hồ sơ trong một kho lưu trữ vật lý. Ứng dụng cung cấp một giao diện trực quan để xem sơ đồ kệ, thêm/sửa/xóa thùng hồ sơ, tìm kiếm, thống kê và quản lý người dùng.

## ✨ Mục Đích Dự Án

Mục đích chính là số hóa việc quản lý kho, thay thế các phương thức theo dõi thủ công (như Excel hoặc sổ sách) bằng một hệ thống tập trung. Hệ thống giúp:
* Trực quan hóa không gian kho (biết ô nào trống, ô nào đầy).
* Nhanh chóng định vị thùng hồ sơ.
* Theo dõi hạn lưu trữ của hồ sơ để có kế hoạch tiêu hủy.
* Phân quyền truy cập cho nhân viên (Admin, Staff, Viewer).
* Ghi lại lịch sử hoạt động cho mục đích kiểm toán.

---

## 🚀 Chức năng Chính

Hệ thống được xây dựng với giao diện frontend (HTML, Tailwind CSS, JS) và backend (API bằng PHP).

### 1. Quản lý Kho (Trang Tổng Quan)
* **Sơ đồ Kệ trực quan:** Hiển thị mỗi kệ dưới dạng một lưới (grid).
* **Hiển thị Trạng thái:** Các ô được tô màu khác nhau: Ô trống, Đã có thùng, Sắp hết hạn (vàng), Quá hạn (đỏ).
* **Tương tác nhanh:** Click vào ô trống để thêm thùng mới; click vào ô đã có thùng để xem/sửa chi tiết.
* **Quản lý Kệ (Admin/Staff):**
    * Thêm kệ mới (+ Thêm Kệ).
    * Chỉnh sửa Ký hiệu, Số hàng, Số cột của kệ hiện tại (nút "Chỉnh Sửa Kệ").
    * Xóa kệ (yêu cầu kệ phải rỗng và xác nhận bằng cách nhập tên kệ).

### 2. Quản lý Thùng Hồ Sơ
* Thêm, Sửa, Xóa thùng hồ sơ.
* Quản lý các thông tin chi tiết: Mã thùng, Năm, Loại hồ sơ, Cơ quan, Phòng ban, Người lưu, Ngày lưu, Hạn lưu.

### 3. Tìm kiếm và Lọc
* Trang tìm kiếm mạnh mẽ cho phép lọc thùng theo tất cả các tiêu chí trên, bao gồm cả trạng thái (Đang lưu, Sắp hết hạn, Quá hạn).
* Sắp xếp kết quả tìm kiếm (tăng/giảm) theo bất kỳ cột nào.

### 4. Thống kê & Báo cáo
* Biểu đồ tròn thống kê thùng theo Trạng Thái.
* Biểu đồ cột thống kê số lượng thùng theo từng Kệ.
* Biểu đồ đường thống kê số lượng thùng theo Năm.

### 5. Quản lý Người dùng & Bảo mật
* **Đăng nhập/Đăng xuất/Đăng ký:** Hệ thống xác thực người dùng dựa trên session.
* **Quên mật khẩu:** Chức năng cho phép người dùng reset mật khẩu.
* **Phân quyền (Roles):** Chỉ Admin mới có quyền truy cập trang "Quản lý User".
* **Quản lý Logs:**
    * Tất cả các hành động quan trọng (Đăng nhập, Thêm/Sửa/Xóa thùng, Sửa/Xóa Kệ, Thêm/Sửa/Xóa User) đều được ghi lại.
    * Admin xem được log của tất cả người dùng.
    * Người dùng thường chỉ xem được log của chính mình.

### 6. Giao diện (UI/UX)
* **Sidebar thông minh:** Có thể thu gọn/mở rộng trên desktop.
* **Responsive:** Sidebar tự động ẩn trên thiết bị di động (mobile) để tiết kiệm không gian.
* **Modal:** Sử dụng modal (hộp thoại) cho tất cả các hành động Thêm/Sửa/Xóa.

---

## 🛠️ Hướng dẫn Cài đặt & Sử dụng

### 1. Yêu cầu
* Một môi trường server PHP (ví dụ: XAMPP, WAMP, MAMP).
* Cơ sở dữ liệu MySQL.

### 2. Cài đặt Database
1.  Mở công cụ quản lý CSDL của bạn (ví dụ: phpMyAdmin).
2.  Tạo một cơ sở dữ liệu mới. Tên CSDL được khuyến nghị trong tệp cấu hình là `archive_box_management`.
3.  Chọn CSDL vừa tạo, đi đến tab **Import**.
4.  Tải lên và thực thi tệp `if0_36492418_archive_box_management.sql`. Thao tác này sẽ tạo tất cả các bảng (`users`, `roles`, `shelves`, `boxes`, `user_logs`, `files`) và dữ liệu mẫu.
5.  **QUAN TRỌNG:** Chạy thêm lệnh SQL này để cập nhật bảng `shelves` cho tính năng kích thước động:
    ```sql
    ALTER TABLE `shelves`
    ADD COLUMN `num_rows` INT(11) NOT NULL DEFAULT 10 AFTER `shelf_code`,
    ADD COLUMN `num_cols` INT(11) NOT NULL DEFAULT 20 AFTER `num_rows`;
    ```

### 3. Cấu hình Code
1.  Sao chép toàn bộ thư mục dự án vào thư mục `htdocs` (XAMPP) hoặc `www` (WAMP) của bạn.
2.  Mở tệp `api/db_config.php`.
3.  Chỉnh sửa thông tin kết nối CSDL cho phù hợp với môi trường của bạn:
    ```php
    define('DB_HOST', 'localhost');
    define('DB_PORT', '3306');
    define('DB_USER', 'root'); // <-- Thay bằng user của bạn
    define('DB_PASS', ''); // <-- Thay bằng mật khẩu của bạn
    define('DB_NAME', 'archive_box_management');
    ```
4.  Thời gian hết hạn session (phiên đăng nhập) được đặt ở đầu tệp này, mặc định là 8 giờ (28800 giây).

### 4. Khởi chạy
1.  Khởi động server Apache và MySQL của bạn.
2.  Mở trình duyệt và truy cập: `http://localhost/[TÊN_THƯ_MỤC_DỰ_ÁN]/login.html`

### 5. Tài khoản Mặc định
Sử dụng các tài khoản mẫu từ tệp `.sql`. Mật khẩu cho tất cả tài khoản là: **`123`**

* **Admin:** `admin`
* **Staff:** `nhanvienkho`
* **Viewer:** `tracuu`