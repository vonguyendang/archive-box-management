/**
 * LỚP QUẢN LÝ ỨNG DỤNG (FRONTEND)
 * Giao tiếp với API (PHP) để lấy và gửi dữ liệu.
 */
class App {
    constructor() {
        this.currentShelfId = 1; // Bắt đầu với kệ ID 1 (Kệ A)
        this.shelves = []; // Sẽ được tải từ API
        this.roles = []; // Sẽ được tải từ API
        this.charts = {}; // Lưu trữ các đối tượng chart

        this.cacheElements();
        this.registerEventListeners();
        this.init();
    }

    // Lưu các phần tử DOM thường dùng
    cacheElements() {
        this.dom = {
            sidebarLinks: document.querySelectorAll('.nav-link'),
            pageSections: document.querySelectorAll('.page-content'),
            shelfTabsContainer: document.getElementById('shelf-tabs'),
            shelfGrid: document.getElementById('shelf-grid'),
            currentShelfLabel: document.getElementById('current-shelf-label'),
            
            // Modal Thùng
            boxModal: document.getElementById('box-modal'),
            boxModalTitle: document.getElementById('box-modal-title'),
            boxModalCloseBtn: document.getElementById('close-modal-btn'),
            boxModalDeleteBtn: document.getElementById('delete-box-btn'),
            boxForm: document.getElementById('box-form'),
            
            searchForm: document.getElementById('search-form'),
            searchResultsBody: document.getElementById('search-results-body'),
            filterShelf: document.getElementById('filter-shelf'),
            
            // Alert
            alertModal: document.getElementById('alert-modal'),
            alertMessage: document.getElementById('alert-message'),
            alertOkBtn: document.getElementById('alert-ok-btn'),
            
            // Trang User
            usersPage: document.getElementById('users-page'),
            usersTableBody: document.getElementById('users-table-body'),
            addUserBtn: document.getElementById('add-user-btn'),
            
            // Modal User
            userModal: document.getElementById('user-modal'),
            userModalTitle: document.getElementById('user-modal-title'),
            userModalCloseBtn: document.getElementById('close-user-modal-btn'),
            userModalDeleteBtn: document.getElementById('delete-user-btn'),
            userForm: document.getElementById('user-form'),
            userRoleSelect: document.getElementById('user-role-select'),
            
            // Trang Stats
            statsPage: document.getElementById('stats-page'),
        };
    }

    // Đăng ký tất cả các sự kiện
    registerEventListeners() {
        // Điều hướng chính
        this.dom.sidebarLinks.forEach(link => {
            link.addEventListener('click', (e) => this.handleNavClick(e));
        });

        // Tabs kệ
        this.dom.shelfTabsContainer.addEventListener('click', (e) => this.handleShelfTabClick(e));

        // Grid
        this.dom.shelfGrid.addEventListener('click', (e) => this.handleGridClick(e));

        // Modal Thùng
        this.dom.boxModalCloseBtn.addEventListener('click', () => this.hideBoxModal());
        this.dom.boxForm.addEventListener('submit', (e) => this.handleSaveBox(e));
        this.dom.boxModalDeleteBtn.addEventListener('click', () => this.handleDeleteBox());

        // Tìm kiếm
        this.dom.searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.renderSearchResults();
        });
        
        // Bảng kết quả tìm kiếm (delegation)
        this.dom.searchResultsBody.addEventListener('click', (e) => {
            const button = e.target.closest('.view-box-btn');
            if(button) {
                const boxId = parseInt(button.dataset.boxId);
                this.showBoxModal(boxId);
            }
        });
        
        // Alert Modal
        this.dom.alertOkBtn.addEventListener('click', () => {
            this.dom.alertModal.classList.remove('active');
        });

        // --- Sự kiện cho User ---
        this.dom.addUserBtn.addEventListener('click', () => this.showUserModal(null));
        
        this.dom.usersTableBody.addEventListener('click', (e) => {
            if (e.target.closest('.edit-user-btn')) {
                const userId = e.target.closest('.edit-user-btn').dataset.userId;
                this.showUserModal(parseInt(userId));
            }
            if (e.target.closest('.delete-user-btn')) {
                const userId = e.target.closest('.delete-user-btn').dataset.userId;
                this.handleDeleteUser(parseInt(userId));
            }
        });
        
        this.dom.userModalCloseBtn.addEventListener('click', () => this.hideUserModal());
        this.dom.userForm.addEventListener('submit', (e) => this.handleSaveUser(e));
        this.dom.userModalDeleteBtn.addEventListener('click', () => this.handleDeleteUser());

        // Sự kiện Đăng Xuất
    const logoutBtn = document.getElementById('logout-btn');
    if(logoutBtn) {
        logoutBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            await fetch('api/logout.php');
            window.location.href = 'login.html';
        });
    }
    }

    // Khởi tạo ứng dụng
    async init() {
        try {
        const authRes = await fetch('api/check_session.php');
        if (!authRes.ok) {
            window.location.href = 'login.html'; // Chưa đăng nhập -> Đá về Login
            return;
        }
        const authData = await authRes.json();
        // Bạn có thể lưu thông tin user vào this.currentUser nếu cần
        console.log("Chào mừng:", authData.user.fullname);
    } catch (e) {
        window.location.href = 'login.html';
        return;
    }
        try {
            // Tải song song cả Kệ và Vai Trò
            const [rolesResponse, shelvesResponse] = await Promise.all([
                fetch('api/get_roles.php'),
                fetch('api/get_shelves.php') // Tải kệ từ API
            ]);

            if (!rolesResponse.ok) throw new Error('Lỗi khi tải danh sách vai trò');
            this.roles = await rolesResponse.json();
            
            if (!shelvesResponse.ok) throw new Error('Lỗi khi tải danh sách kệ');
            this.shelves = await shelvesResponse.json();
            
            this.renderShelfTabs();
            this.renderSearchFilters();
            this.loadRolesIntoSelect(); // Điền vai trò vào modal user
            
            if (this.shelves.length > 0) {
                this.currentShelfId = this.shelves[0].id; // Đặt kệ đầu tiên
            }
            
            this.navigateTo('dashboard'); // Trang mặc định
            await this.renderShelfGrid(); // Tải grid cho kệ đầu tiên

        } catch (error) {
            this.showAlert(`Lỗi tải dữ liệu ban đầu: ${error.message}`);
        }
    }
    
    // Hiển thị thông báo
    showAlert(message) {
        this.dom.alertMessage.textContent = message;
        this.dom.alertModal.classList.add('active');
    }

    // Xử lý điều hướng
    handleNavClick(e) {
        e.preventDefault();
        const page = e.currentTarget.dataset.page;
        this.navigateTo(page);
    }
    
    // Điều hướng đến 1 trang
    navigateTo(page) {
        this.dom.pageSections.forEach(p => p.classList.add('hidden'));
        const activePage = document.getElementById(`${page}-page`);
        if (activePage) activePage.classList.remove('hidden');

        this.dom.sidebarLinks.forEach(link => {
            link.classList.toggle('active', link.dataset.page === page);
        });

        // Tải dữ liệu khi chuyển trang
        if (page === 'stats' && !this.charts.statusChart) {
            this.renderStatsCharts(); // Chỉ render lần đầu
        }
        if(page === 'search') {
            this.renderSearchResults(); // Luôn tải lại khi vào trang
        }
        if (page === 'users') {
            this.renderUsersTable(); // Luôn tải lại khi vào trang
        }
    }

    // === Dashboard (Kệ) ===
    renderShelfTabs() {
        this.dom.shelfTabsContainer.innerHTML = '';
        this.shelves.forEach((shelf, index) => {
            const isActive = index === 0;
            this.dom.shelfTabsContainer.innerHTML += `
                <li class="mr-2">
                    <a href="#" data-shelf-id="${shelf.id}" 
                       class="inline-block p-4 border-b-2 ${isActive ? 'text-blue-600 border-blue-600 active' : 'border-transparent rounded-t-lg hover:text-gray-600 hover:border-gray-300'}">
                       Kệ ${shelf.shelf_code}
                    </a>
                </li>
            `;
        });
    }
    
    handleShelfTabClick(e) {
        if (e.target.tagName === 'A') {
            e.preventDefault();
            this.currentShelfId = parseInt(e.target.dataset.shelfId);
            this.renderShelfGrid(); // Tải lại grid
            
            document.querySelectorAll('#shelf-tabs a').forEach(a => a.className = "inline-block p-4 border-b-2 border-transparent rounded-t-lg hover:text-gray-600 hover:border-gray-300");
            e.target.className = "inline-block p-4 text-blue-600 border-b-2 border-blue-600 rounded-t-lg active";
        }
    }

    async renderShelfGrid() {
        const shelf = this.shelves.find(s => s.id === this.currentShelfId);
        if (!shelf) return;
        
        this.dom.currentShelfLabel.textContent = `Sơ Đồ Kệ ${shelf.shelf_code}`;
        this.dom.shelfGrid.innerHTML = '<div class="col-span-30 text-center p-10">Đang tải...</div>'; // Loading state

        try {
            const response = await fetch(`api/get_boxs.php?shelf_id=${this.currentShelfId}`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const boxs = await response.json();
            
            const boxMap = new Map(boxs.map(box => [`${box.row}-${box.col}`, box]));
            
            let gridHtml = '';
            for (let r = 1; r <= 20; r++) { // 20 Tầng
                for (let c = 1; c <= 30; c++) { // 30 Ô
                    const box = boxMap.get(`${r}-${c}`);
                    let cellClass = 'grid-cell';
                    let cellContent = `${r}.${c}`;
                    let boxIdAttr = '';
                    
                    if (box) {
                        cellClass += ' occupied';
                        if (box.status === 'expired') cellClass += ' expired';
                        else if (box.status === 'nearing') cellClass += ' nearing-expiry';
                        
                        cellContent = `<span class="font-bold">${box.code}</span>`;
                        boxIdAttr = `data-box-id="${box.id}"`;
                    }
                    
                    gridHtml += `
                        <div class="${cellClass}" data-row="${r}" data-col="${c}" ${boxIdAttr} title="Vị trí ${shelf.shelf_code}.${r}.${c}">
                            <div class="grid-cell-inner">${cellContent}</div>
                        </div>
                    `;
                }
            }
            this.dom.shelfGrid.innerHTML = gridHtml;
        } catch (error) {
            this.dom.shelfGrid.innerHTML = `<div class="col-span-30 text-center p-10 text-red-500">Lỗi khi tải sơ đồ kệ: ${error.message}</div>`;
        }
    }

    // === Modal Thùng ===
    handleGridClick(e) {
        const cell = e.target.closest('.grid-cell');
        if (!cell) return;
        
        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);
        const boxId = cell.dataset.boxId;
        
        if (boxId) {
            this.showBoxModal(parseInt(boxId)); // Xem/Sửa
        } else {
            this.showBoxModal(null, this.currentShelfId, row, col); // Thêm mới
        }
    }

    async showBoxModal(boxId, shelfId = null, row = null, col = null) {
        this.dom.boxForm.reset();
        this.dom.boxModalDeleteBtn.classList.add('hidden');
        this.dom.boxModal.classList.add('active');
        
        const today = new Date().toISOString().split('T')[0];

        if (boxId) { // Xem/Sửa
            this.dom.boxModalTitle.textContent = 'Đang tải chi tiết thùng...';
            try {
                const response = await fetch(`api/get_boxs.php?id=${boxId}`);
                if (!response.ok) throw new Error('Không tìm thấy thùng');
                const box = await response.json();
                
                this.dom.boxModalTitle.textContent = `Chi Tiết Thùng: ${box.code}`;
                this.dom.boxModalDeleteBtn.classList.remove('hidden');
                
                // Điền form
                document.getElementById('box-id').value = box.id;
                document.getElementById('box-location').value = `${box.shelf_code}.T${box.row}.${box.col}`;
                document.getElementById('box-shelf-id').value = box.shelf_id;
                document.getElementById('box-row').value = box.row;
                document.getElementById('box-col').value = box.col;
                document.getElementById('box-code').value = box.code;
                document.getElementById('box-year').value = box.year;
                document.getElementById('box-type').value = box.type;
                document.getElementById('box-agency').value = box.agency;
                document.getElementById('box-department').value = box.department;
                document.getElementById('box-stored_by').value = box.stored_by;
                document.getElementById('box-stored_date').value = box.stored_date;
                document.getElementById('box-expiry').value = box.expiry;
                document.getElementById('box-note').value = box.note;
                
            } catch (error) {
                this.hideBoxModal();
                this.showAlert(error.message);
                return;
            }
            
        } else { // Thêm mới
            this.dom.boxModalTitle.textContent = 'Thêm Thùng Mới';
            const shelf = this.shelves.find(s => s.id === shelfId);
            
            document.getElementById('box-id').value = '';
            document.getElementById('box-location').value = `${shelf.shelf_code}.T${row}.${col}`;
            document.getElementById('box-shelf-id').value = shelfId;
            document.getElementById('box-row').value = row;
            document.getElementById('box-col').value = col;
            document.getElementById('box-stored_date').value = today;
            document.getElementById('box-expiry').value = today;
        }
    }

    hideBoxModal() {
        this.dom.boxModal.classList.remove('active');
    }

    async handleSaveBox(e) {
        e.preventDefault();
        const id = document.getElementById('box-id').value ? parseInt(document.getElementById('box-id').value) : null;
        
        const data = {
            id: id,
            shelf_id: parseInt(document.getElementById('box-shelf-id').value),
            row: parseInt(document.getElementById('box-row').value),
            col: parseInt(document.getElementById('box-col').value),
            code: document.getElementById('box-code').value,
            year: parseInt(document.getElementById('box-year').value),
            type: document.getElementById('box-type').value,
            agency: document.getElementById('box-agency').value,
            department: document.getElementById('box-department').value,
            stored_by: document.getElementById('box-stored_by').value,
            stored_date: document.getElementById('box-stored_date').value,
            expiry: document.getElementById('box-expiry').value,
            note: document.getElementById('box-note').value,
        };

        if (!data.code || !data.year || !data.type || !data.stored_date || !data.expiry) {
            this.showAlert('Vui lòng điền đầy đủ các trường bắt buộc (*)');
            return;
        }

        try {
            const response = await fetch('api/save_box.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            
            const result = await response.json();
            if (!response.ok) throw new Error(result.error || 'Lỗi không xác định');
            
            this.showAlert(result.message);
            this.hideBoxModal();
            this.renderShelfGrid(); // Cập nhật lại grid
            if (this.dom.pageSections[1].classList.contains('hidden') === false) { // Nếu đang ở trang search
                this.renderSearchResults();
            }
        } catch (error) {
            this.showAlert(`Lỗi khi lưu: ${error.message}`);
        }
    }

    async handleDeleteBox() {
        const id = parseInt(document.getElementById('box-id').value);
        if (!id) return;

        if (confirm('Bạn có chắc chắn muốn xóa thùng này? Hành động này không thể hoàn tác.')) {
            try {
                const response = await fetch('api/delete_box.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: id })
                });
                
                const result = await response.json();
                if (!response.ok) throw new Error(result.error || 'Lỗi không xác định');
                
                this.showAlert(result.message);
                this.hideBoxModal();
                this.renderShelfGrid();
                if (this.dom.pageSections[1].classList.contains('hidden') === false) {
                    this.renderSearchResults();
                }
            } catch (error) {
                this.showAlert(`Lỗi khi xóa: ${error.message}`);
            }
        }
    }

    // === Search ===
    renderSearchFilters() {
        this.shelves.forEach(shelf => {
            this.dom.filterShelf.innerHTML += `<option value="${shelf.id}">Kệ ${shelf.shelf_code}</option>`;
        });
    }

    async renderSearchResults() {
        const filters = {
            code: document.getElementById('filter-code').value,
            year: document.getElementById('filter-year').value,
            type: document.getElementById('filter-type').value,
            agency: document.getElementById('filter-agency').value,
            department: document.getElementById('filter-department').value,
            stored_by: document.getElementById('filter-stored_by').value,
            shelf_id: document.getElementById('filter-shelf').value,
            status: document.getElementById('filter-status').value,
        };
        
        const params = new URLSearchParams(Object.entries(filters).filter(([key, val]) => val));
        this.dom.searchResultsBody.innerHTML = `<tr><td colspan="9" class="text-center p-6 text-gray-500">Đang tìm kiếm...</td></tr>`;

        try {
            const response = await fetch(`api/get_boxs.php?${params.toString()}`);
            if (!response.ok) throw new Error('Lỗi máy chủ');
            const results = await response.json();
            
            const tbody = this.dom.searchResultsBody;
            tbody.innerHTML = '';
            
            if (results.length === 0) {
                tbody.innerHTML = `<tr><td colspan="9" class="text-center p-6 text-gray-500">Không tìm thấy kết quả nào.</td></tr>`;
                return;
            }

            results.forEach(box => {
                let statusClass = 'bg-green-100 text-green-800';
                let statusText = 'Đang lưu';
                if (box.status === 'expired') {
                    statusClass = 'bg-red-100 text-red-800';
                    statusText = 'Quá hạn';
                } else if (box.status === 'nearing') {
                    statusClass = 'bg-yellow-100 text-yellow-800';
                    statusText = 'Sắp hết hạn';
                }
                
                tbody.innerHTML += `
                    <tr>
                        <td class="td-cell font-medium">${box.shelf_code}.T${box.row}.${box.col}</td>
                        <td class="td-cell">${box.code}</td>
                        <td class="td-cell">${box.year}</td>
                        <td class="td-cell">${box.type}</td>
                        <td class="td-cell">${box.agency}</td>
                        <td class="td-cell">${box.department}</td>
                        <td class="td-cell">${box.expiry}</td>
                        <td class="td-cell">
                            <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClass}">
                                ${statusText}
                            </span>
                        </td>
                        <td class="td-cell">
                            <button class="view-box-btn text-blue-600 hover:text-blue-900" data-box-id="${box.id}"><i class="fas fa-edit"></i> Xem</button>
                        </td>
                    </tr>
                `;
            });
        } catch (error) {
            this.dom.searchResultsBody.innerHTML = `<tr><td colspan="9" class="text-center p-6 text-red-500">Lỗi khi tìm kiếm: ${error.message}</td></tr>`;
        }
    }
    
    // === Stats ===
    renderStatsCharts() {
        this.dom.statsPage.innerHTML = `
            <h2 class="text-3xl font-bold mb-6">Thống Kê Báo Cáo</h2>
            <p class="text-gray-600">Bạn cần tự triển khai hàm <code>renderStatsCharts</code> trong <code>app.js</code> bằng cách fetch dữ liệu từ <code>api/get_stats.php</code> và dùng Chart.js để vẽ biểu đồ.</p>
        `;
    }
    
    // === (MỚI) Quản Lý User ===
    
    // 1. Tải danh sách vai trò vào modal
    loadRolesIntoSelect() {
        this.dom.userRoleSelect.innerHTML = '<option value="">-- Chọn vai trò --</option>';
        this.roles.forEach(role => {
            this.dom.userRoleSelect.innerHTML += `<option value="${role.id}">${role.role_name}</option>`;
        });
    }

    // 2. Hiển thị bảng người dùng
    async renderUsersTable() {
        this.dom.usersTableBody.innerHTML = `<tr><td colspan="6" class="text-center p-6 text-gray-500">Đang tải danh sách người dùng...</td></tr>`;

        try {
            const response = await fetch('api/get_users.php');
            if (!response.ok) throw new Error('Lỗi khi tải người dùng');
            const users = await response.json();
            
            const tbody = this.dom.usersTableBody;
            tbody.innerHTML = '';

            if (users.length === 0) {
                tbody.innerHTML = `<tr><td colspan="6" class="text-center p-6 text-gray-500">Chưa có người dùng nào.</td></tr>`;
                return;
            }

            users.forEach(user => {
                const statusClass = user.active == 1 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
                const statusText = user.active == 1 ? 'Hoạt động' : 'Bị khóa';
                
                tbody.innerHTML += `
                    <tr>
                        <td class="td-cell font-medium">${user.username}</td>
                        <td class="td-cell">${user.fullname}</td>
                        <td class="td-cell">${user.email}</td>
                        <td class="td-cell">${user.role_name}</td>
                        <td class="td-cell">
                            <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClass}">
                                ${statusText}
                            </span>
                        </td>
                        <td class="td-cell">
                            <button class="edit-user-btn text-blue-600 hover:text-blue-900 mr-3" data-user-id="${user.id}"><i class="fas fa-edit"></i> Sửa</button>
                            <button class="delete-user-btn text-red-600 hover:text-red-900" data-user-id="${user.id}"><i class="fas fa-trash"></i> Xóa</button>
                        </td>
                    </tr>
                `;
            });

        } catch (error) {
            this.dom.usersTableBody.innerHTML = `<tr><td colspan="6" class="text-center p-6 text-red-500">${error.message}</td></tr>`;
        }
    }

    // 3. Hiển thị modal thêm/sửa user
    async showUserModal(userId) {
        this.dom.userForm.reset();
        this.dom.userModalDeleteBtn.classList.add('hidden');
        this.dom.userModal.classList.add('active');
        
        // Đặt lại trường password
        document.getElementById('user-password').placeholder = "Để trống nếu không muốn thay đổi";
        document.getElementById('user-password').required = false;

        if (userId) { // Sửa user
            this.dom.userModalTitle.textContent = 'Đang tải...';
            try {
                const response = await fetch(`api/get_users.php?id=${userId}`);
                if (!response.ok) throw new Error('Không tìm thấy người dùng');
                const user = await response.json();

                this.dom.userModalTitle.textContent = `Sửa Người Dùng: ${user.username}`;
                this.dom.userModalDeleteBtn.classList.remove('hidden');
                
                // Điền form
                document.getElementById('user-id').value = user.id;
                document.getElementById('user-username').value = user.username;
                document.getElementById('user-fullname').value = user.fullname;
                document.getElementById('user-email').value = user.email;
                this.dom.userRoleSelect.value = user.role_id;
                document.querySelector(`input[name="user-active"][value="${user.active}"]`).checked = true;

            } catch (error) {
                this.hideUserModal();
                this.showAlert(error.message);
            }
        } else { // Thêm user
            this.dom.userModalTitle.textContent = 'Thêm Người Dùng Mới';
            document.getElementById('user-id').value = '';
            document.getElementById('user-password').placeholder = "Mật khẩu (bắt buộc)";
            document.getElementById('user-password').required = true;
            document.querySelector(`input[name="user-active"][value="1"]`).checked = true;
        }
    }

    // 4. Ẩn modal user
    hideUserModal() {
        this.dom.userModal.classList.remove('active');
    }

    // 5. Lưu user (Thêm/Sửa)
    async handleSaveUser(e) {
        e.preventDefault();
        const id = document.getElementById('user-id').value ? parseInt(document.getElementById('user-id').value) : null;
        const password = document.getElementById('user-password').value;
        
        const data = {
            id: id,
            username: document.getElementById('user-username').value,
            fullname: document.getElementById('user-fullname').value,
            email: document.getElementById('user-email').value,
            role_id: parseInt(this.dom.userRoleSelect.value),
            active: parseInt(document.querySelector('input[name="user-active"]:checked').value),
            password: password // Gửi mật khẩu (có thể rỗng)
        };

        // Validate
        if (!data.username || !data.role_id) {
            this.showAlert('Tên đăng nhập và Vai trò là bắt buộc.');
            return;
        }
        if (!id && !data.password) {
            this.showAlert('Mật khẩu là bắt buộc khi thêm người dùng mới.');
            return;
        }

        try {
            const response = await fetch('api/save_user.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.error || 'Lỗi không xác định');

            this.showAlert(result.message);
            this.hideUserModal();
            this.renderUsersTable(); // Cập nhật lại bảng

        } catch (error) {
            this.showAlert(`Lỗi khi lưu: ${error.message}`);
        }
    }

    // 6. Xóa user
    async handleDeleteUser(userId = null) {
        // Nếu không có userId (từ nút Sửa), lấy từ nút Xóa trong modal
        const id = userId || parseInt(document.getElementById('user-id').value);
        if (!id) return;
        
        if (id === 1) {
            this.showAlert('Không thể xóa tài khoản Quản Trị Viên gốc.');
            return;
        }

        if (confirm(`Bạn có chắc chắn muốn xóa người dùng (ID: ${id})?`)) {
            try {
                const response = await fetch('api/delete_user.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: id })
                });
                
                const result = await response.json();
                if (!response.ok) throw new Error(result.error || 'Lỗi không xác định');

                this.showAlert(result.message);
                this.hideUserModal();
                this.renderUsersTable(); // Cập nhật lại bảng

            } catch (error) {
                this.showAlert(`Lỗi khi xóa: ${error.message}`);
            }
        }
    }
}

// Khởi chạy ứng dụng khi DOM đã tải
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});