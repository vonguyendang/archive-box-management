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
        this.currentUser = null; // Lưu thông tin người dùng đăng nhập

        this.currentResults = []; // Lưu kết quả tìm kiếm thô
        this.currentSort = {
            column: 'shelf_code', // Cột mặc định
            direction: 'asc' // Hướng mặc định
        };

        this.cacheElements();
        this.registerEventListeners();
        this.init(); // Khởi tạo
    }

    // Lưu các phần tử DOM thường dùng
    cacheElements() {
        this.dom = {
            sidebar: document.getElementById('sidebar'),
            sidebarOverlay: document.getElementById('sidebar-overlay'),
            sidebarToggleBtn: document.getElementById('sidebar-toggle-btn'),
            sidebarToggleIcon: document.getElementById('sidebar-toggle-icon'),
            navTexts: document.querySelectorAll('.nav-text'),

            userInfoFullname: document.getElementById('user-info-fullname'),
            userInfoRole: document.getElementById('user-info-role'),

            sidebarLinks: document.querySelectorAll('.nav-link'),
            pageSections: document.querySelectorAll('.page-content'),
            shelfTabsContainer: document.getElementById('shelf-tabs'),
            shelfGrid: document.getElementById('shelf-grid'),
            currentShelfLabel: document.getElementById('current-shelf-label'),
            
            boxModal: document.getElementById('box-modal'),
            boxModalTitle: document.getElementById('box-modal-title'),
            boxModalCloseBtn: document.getElementById('close-modal-btn'),
            boxModalDeleteBtn: document.getElementById('delete-box-btn'),
            boxForm: document.getElementById('box-form'),
            
            searchForm: document.getElementById('search-form'),
            searchResultsBody: document.getElementById('search-results-body'),
            searchResultsHeader: document.getElementById('search-results-header'), 
            filterShelf: document.getElementById('filter-shelf'),
            
            alertModal: document.getElementById('alert-modal'),
            alertMessage: document.getElementById('alert-message'),
            alertOkBtn: document.getElementById('alert-ok-btn'),
            
            usersPage: document.getElementById('users-page'),
            usersTableBody: document.getElementById('users-table-body'),
            addUserBtn: document.getElementById('add-user-btn'),
            
            userModal: document.getElementById('user-modal'),
            userModalTitle: document.getElementById('user-modal-title'),
            userModalCloseBtn: document.getElementById('close-user-modal-btn'),
            userModalDeleteBtn: document.getElementById('delete-user-btn'),
            userForm: document.getElementById('user-form'),
            userRoleSelect: document.getElementById('user-role-select'),
            
            statsPage: document.getElementById('stats-page'),

            logsPage: document.getElementById('logs-page'),
            logsTableBody: document.getElementById('logs-table-body'),
            
            logoutBtn: document.getElementById('logout-btn'),
        };
    }

    // Đăng ký tất cả các sự kiện
    registerEventListeners() {
        if (this.dom.sidebarToggleBtn) {
            this.dom.sidebarToggleBtn.addEventListener('click', () => this.handleSidebarToggle());
        }
        if (this.dom.sidebarOverlay) {
            this.dom.sidebarOverlay.addEventListener('click', () => this.handleSidebarToggle());
        }

        this.dom.sidebarLinks.forEach(link => {
            link.addEventListener('click', (e) => this.handleNavClick(e));
        });

        this.dom.shelfTabsContainer.addEventListener('click', (e) => {
            if (e.target.tagName === 'A') {
                this.handleShelfTabClick(e);
            }
            if (e.target.id === 'add-shelf-btn') {
                this.handleAddShelf();
            }
        });

        this.dom.shelfGrid.addEventListener('click', (e) => this.handleGridClick(e));

        this.dom.boxModalCloseBtn.addEventListener('click', () => this.hideBoxModal());
        this.dom.boxForm.addEventListener('submit', (e) => this.handleSaveBox(e));
        this.dom.boxModalDeleteBtn.addEventListener('click', () => this.handleDeleteBox());

        this.dom.searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.renderSearchResults(); 
        });
        
        if (this.dom.searchResultsHeader) {
            this.dom.searchResultsHeader.addEventListener('click', (e) => this.handleSortClick(e));
        }

        this.dom.searchResultsBody.addEventListener('click', (e) => {
            const button = e.target.closest('.view-box-btn');
            if(button) {
                const boxId = parseInt(button.dataset.boxId);
                this.showBoxModal(boxId);
            }
        });
        
        this.dom.alertOkBtn.addEventListener('click', () => {
            this.dom.alertModal.classList.remove('active');
        });

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
        
        if(this.dom.logoutBtn) {
            this.dom.logoutBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                await fetch('api/logout.php');
                window.location.href = 'login.html';
            });
        }
    }

    handleSidebarToggle() {
        const isMobile = window.innerWidth < 768;
        
        if (isMobile) {
            this.dom.sidebar.classList.toggle('-translate-x-full');
            this.dom.sidebarOverlay.classList.toggle('hidden');
            
            this.dom.sidebar.classList.remove('w-20');
            this.dom.sidebar.classList.add('w-64');
            this.dom.navTexts.forEach(t => t.classList.remove('hidden'));
            
            document.querySelectorAll('.nav-link, #logout-btn, #sidebar h1, #user-info-container').forEach(el => {
                el.classList.remove('justify-center');
            });
        } else {
            this.dom.sidebar.classList.toggle('w-64');
            this.dom.sidebar.classList.toggle('w-20');
            this.dom.navTexts.forEach(t => t.classList.toggle('hidden'));

            document.querySelectorAll('.nav-link, #logout-btn, #sidebar h1, #user-info-container').forEach(el => {
                el.classList.toggle('justify-center');
            });
        }

        const isClosed = this.dom.sidebar.classList.contains('-translate-x-full') || 
                           this.dom.sidebar.classList.contains('w-20');
                           
        this.dom.sidebarToggleIcon.className = isClosed ? 'fas fa-bars fa-lg' : 'fas fa-times fa-lg';
    }

    // (*** CẬP NHẬT HÀM NÀY ***)
    async checkAuthentication() {
        try {
            const authRes = await fetch('api/check_session.php');
            if (!authRes.ok) {
                window.location.href = 'login.html';
                return false;
            }
            const authData = await authRes.json();
            this.currentUser = authData.user;
            console.log(`Đã đăng nhập với tư cách: ${this.currentUser.fullname} (Role: ${this.currentUser.role_id})`);
            
            // Chỉ ẩn "Quản lý User" nếu không phải Admin
            if (this.currentUser.role_id != 1) {
                const userNav = document.querySelector('a[data-page="users"]');
                if (userNav) userNav.parentElement.style.display = 'none';
                
                // (*** XÓA BỎ: Khối code ẩn "Quản lý Logs" đã bị xóa ***)
                // const logsNav = document.querySelector('a[data-page="logs"]');
                // if (logsNav) logsNav.parentElement.style.display = 'none';
            }
            return true;
        } catch (e) {
            window.location.href = 'login.html';
            return false;
        }
    }

    async loadInitialData() {
        try {
            const [rolesResponse, shelvesResponse] = await Promise.all([
                fetch('api/get_roles.php'),
                fetch('api/get_shelves.php')
            ]);

            if (!rolesResponse.ok) throw new Error('Lỗi khi tải danh sách vai trò');
            this.roles = await rolesResponse.json();
            
            if (!shelvesResponse.ok) throw new Error('Lỗi khi tải danh sách kệ');
            this.shelves = await shelvesResponse.json(); 
            
            this.renderShelfTabs();
            this.renderSearchFilters();
            this.loadRolesIntoSelect(); 
            
            if(this.shelves.length > 0) {
                 this.currentShelfId = this.shelves[0].id;
            }
        } catch (error) {
            this.showAlert(`Lỗi tải dữ liệu ban đầu: ${error.message}`);
        }
    }

    renderUserInfo() {
        if (!this.currentUser || !this.dom.userInfoFullname) return;

        this.dom.userInfoFullname.textContent = this.currentUser.fullname || this.currentUser.username;

        const role = this.roles.find(r => r.id === this.currentUser.role_id);
        const roleName = role ? role.role_name : '';
        this.dom.userInfoRole.textContent = roleName;
    }

    async init() {
        const loggedIn = await this.checkAuthentication();
        if (!loggedIn) return;

        await this.loadInitialData();
        
        this.renderUserInfo();

        if (window.innerWidth >= 768) {
             this.dom.sidebarToggleIcon.className = 'fas fa-bars fa-lg';
             this.handleSidebarToggle(); 
        }

        this.navigateTo('dashboard');
        await this.renderShelfGrid();
    }
    
    showAlert(message) {
        this.dom.alertMessage.textContent = message;
        this.dom.alertModal.classList.add('active');
    }

    handleNavClick(e) {
        e.preventDefault();
        const page = e.currentTarget.dataset.page;
        this.navigateTo(page);
    }
    
    navigateTo(page) {
        this.dom.pageSections.forEach(p => p.classList.add('hidden'));
        const activePage = document.getElementById(`${page}-page`);
        if (activePage) activePage.classList.remove('hidden');

        this.dom.sidebarLinks.forEach(link => {
            link.classList.remove('bg-blue-600', 'text-white'); 
            if (link.dataset.page === page) {
                link.classList.add('bg-blue-600', 'text-white');
            }
        });

        if (page === 'stats') {
            this.renderStatsCharts();
        }
        if(page === 'search') {
            if (this.currentResults.length === 0) {
                 this.renderSearchResults();
            }
        }
        if (page === 'users') {
            this.renderUsersTable();
        }
        if (page === 'logs') {
            this.renderLogsTable();
        }

        const isMobile = window.innerWidth < 768;
        if (isMobile && !this.dom.sidebar.classList.contains('-translate-x-full')) {
            this.handleSidebarToggle();
        }
    }

    // === Dashboard (Kệ) ===
    
    renderShelfTabs() {
        this.dom.shelfTabsContainer.innerHTML = '';
        this.shelves.forEach((shelf, index) => {
            const isActive = this.currentShelfId === shelf.id;
            this.dom.shelfTabsContainer.innerHTML += `
                <li class="mr-2">
                    <a href="#" data-shelf-id="${shelf.id}" 
                       class="inline-block p-4 border-b-2 ${isActive ? 'text-blue-600 border-blue-600 active' : 'border-transparent rounded-t-lg hover:text-gray-600 hover:border-gray-300'}">
                       Kệ ${shelf.shelf_code}
                    </a>
                </li>
            `;
        });
        
        if (this.currentUser && (this.currentUser.role_id == 1 || this.currentUser.role_id == 2)) {
            this.dom.shelfTabsContainer.innerHTML += `
                <li class="ml-2">
                    <button id="add-shelf-btn" class="p-4 text-green-500 hover:text-green-700 font-medium transition-colors" title="Thêm kệ mới">
                        <i class="fas fa-plus"></i> Thêm Kệ
                    </button>
                </li>
            `;
        }
    }
    
    handleShelfTabClick(e) {
        e.preventDefault();
        this.currentShelfId = parseInt(e.target.dataset.shelfId);
        this.renderShelfGrid(); 
        
        document.querySelectorAll('#shelf-tabs a').forEach(a => a.className = "inline-block p-4 border-b-2 border-transparent rounded-t-lg hover:text-gray-600 hover:border-gray-300");
        e.target.className = "inline-block p-4 text-blue-600 border-b-2 border-blue-600 rounded-t-lg active";
    }

    async handleAddShelf() {
        const newCode = prompt("Nhập ký hiệu kệ mới (1 chữ cái, ví dụ: H):");
        
        if (!newCode) return; 
        
        if (newCode.length !== 1 || !/^[A-Z]$/i.test(newCode)) {
            this.showAlert("Ký hiệu kệ phải là 1 chữ cái (A-Z).");
            return;
        }

        try {
            const response = await fetch('api/add_shelf.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ shelf_code: newCode.toUpperCase() })
            });
            
            const result = await response.json();
            if (!response.ok) throw new Error(result.error || 'Lỗi không xác định');
            
            this.showAlert(`Thêm kệ "${result.shelf_code}" thành công!`);
            
            await this.loadInitialData(); 
            this.currentShelfId = result.id; 
            this.renderShelfTabs();
            this.renderShelfGrid();

        } catch (error) {
            this.showAlert(`Lỗi khi thêm kệ: ${error.message}`);
        }
    }

    async renderShelfGrid() {
        const shelf = this.shelves.find(s => s.id === this.currentShelfId);
        if (!shelf) return;
        
        this.dom.currentShelfLabel.textContent = `Sơ Đồ Kệ ${shelf.shelf_code}`;
        this.dom.shelfGrid.innerHTML = '<div class="col-span-30 text-center p-10">Đang tải...</div>';

        try {
            const response = await fetch(`api/get_boxs.php?shelf_id=${this.currentShelfId}`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const boxes = await response.json();
            
            const boxMap = new Map(boxes.map(box => [`${box.row}-${box.col}`, box]));
            
            let gridHtml = '';
            for (let r = 1; r <= 10; r++) { 
                for (let c = 1; c <= 20; c++) { 
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
            this.showBoxModal(parseInt(boxId)); 
        } else {
            this.showBoxModal(null, this.currentShelfId, row, col); 
        }
    }

    async showBoxModal(boxId, shelfId = null, row = null, col = null) {
        this.dom.boxForm.reset();
        this.dom.boxModalDeleteBtn.classList.add('hidden');
        this.dom.boxModal.classList.add('active');
        
        const today = new Date().toISOString().split('T')[0];

        if (boxId) { 
            this.dom.boxModalTitle.textContent = 'Đang tải chi tiết thùng...';
            try {
                const response = await fetch(`api/get_boxs.php?id=${boxId}`);
                if (!response.ok) throw new Error('Không tìm thấy thùng');
                const box = await response.json();
                
                this.dom.boxModalTitle.textContent = `Chi Tiết Thùng: ${box.code}`;
                this.dom.boxModalDeleteBtn.classList.remove('hidden');
                
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
            
        } else { 
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
            this.renderShelfGrid(); 
            if (this.dom.pageSections[1].classList.contains('hidden') === false) { 
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
        this.dom.filterShelf.innerHTML = '<option value="">Tất cả kệ</option>'; 
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
            
            this.currentResults = await response.json();
            
            this.sortAndRenderResults();

        } catch (error) {
            this.dom.searchResultsBody.innerHTML = `<tr><td colspan="9" class="text-center p-6 text-red-500">Lỗi khi tìm kiếm: ${error.message}</td></tr>`;
        }
    }

    handleSortClick(e) {
        e.preventDefault();
        const link = e.target.closest('.sort-link');
        if (!link) return;

        const column = link.dataset.sort;

        if (this.currentSort.column === column) {
            this.currentSort.direction = (this.currentSort.direction === 'asc') ? 'desc' : 'asc';
        } else {
            this.currentSort.column = column;
            this.currentSort.direction = 'asc';
        }

        this.sortAndRenderResults();
    }
    
    sortAndRenderResults() {
        const { column, direction } = this.currentSort;
        const tbody = this.dom.searchResultsBody;
        
        this.dom.searchResultsHeader.querySelectorAll('.sort-link').forEach(link => {
            link.classList.remove('active');
            const icon = link.querySelector('i');
            icon.className = 'fas fa-sort'; 
        });

        const activeLink = this.dom.searchResultsHeader.querySelector(`.sort-link[data-sort="${column}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
            const icon = activeLink.querySelector('i');
            icon.className = (direction === 'asc') ? 'fas fa-sort-up' : 'fas fa-sort-down';
        }

        if (this.currentResults.length === 0) {
            tbody.innerHTML = `<tr><td colspan="9" class="text-center p-6 text-gray-500">Không tìm thấy kết quả nào.</td></tr>`;
            return;
        }

        const sortedResults = [...this.currentResults].sort((a, b) => {
            let valA = a[column];
            let valB = b[column];
            
            if (column === 'shelf_code') {
                valA = `${a.shelf_code}.${a.row}.${a.col}`;
                valB = `${b.shelf_code}.${b.row}.${b.col}`;
            }

            if (valA < valB) {
                return direction === 'asc' ? -1 : 1;
            }
            if (valA > valB) {
                return direction === 'asc' ? 1 : -1;
            }
            return 0;
        });

        tbody.innerHTML = ''; 
        
        sortedResults.forEach(box => {
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
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-800 align-middle font-medium">${box.shelf_code}.T${box.row}.${box.col}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-800 align-middle">${box.code}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-800 align-middle">${box.year}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-800 align-middle">${box.type}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-800 align-middle">${box.agency}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-800 align-middle">${box.department}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-800 align-middle">${box.expiry}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-800 align-middle">
                        <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClass}">
                            ${statusText}
                        </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-800 align-middle">
                        <button class="view-box-btn text-blue-600 hover:text-blue-900" data-box-id="${box.id}"><i class="fas fa-edit"></i> Xem</button>
                    </td>
                </tr>
            `;
        });
    }

    
    // === Stats ===
    async renderStatsCharts() {
        const statusCanvas = document.getElementById('status-chart');
        const shelfCanvas = document.getElementById('shelf-chart');
        const yearCanvas = document.getElementById('year-chart');

        if (!statusCanvas || !shelfCanvas || !yearCanvas) {
            this.dom.statsPage.innerHTML = `<h2 class="text-3xl font-bold mb-6">Thống Kê Báo Cáo</h2><p class="text-red-500">Lỗi: Không tìm thấy thẻ canvas trong index.html.</p>`;
            return;
        }

        this.dom.statsPage.querySelector('h2').innerHTML = "Thống Kê Báo Cáo";
        
        try {
            const response = await fetch('api/get_stats.php');
            if(!response.ok) throw new Error('Lỗi tải dữ liệu thống kê');
            const stats = await response.json();

            Object.values(this.charts).forEach(chart => {
                if (chart && typeof chart.destroy === 'function') chart.destroy();
            });

            const statusCtx = statusCanvas.getContext('2d');
            this.charts.statusChart = new Chart(statusCtx, {
                type: 'doughnut',
                data: {
                    labels: ['Đang lưu (Tốt)', 'Sắp hết hạn', 'Quá hạn'],
                    datasets: [{
                        data: [stats.statusCount.good, stats.statusCount.nearing, stats.statusCount.expired],
                        backgroundColor: ['#4a90e2', '#f0ad4e', '#d9534f'],
                    }]
                },
                options: { responsive: true, maintainAspectRatio: true } 
            });

            const shelfCtx = shelfCanvas.getContext('2d');
            this.charts.shelfChart = new Chart(shelfCtx, {
                type: 'bar',
                data: {
                    labels: Object.keys(stats.shelfCount),
                    datasets: [{
                        label: 'Số lượng thùng',
                        data: Object.values(stats.shelfCount),
                        backgroundColor: '#3b82f6',
                    }]
                },
                options: { responsive: true, maintainAspectRatio: true, plugins: { legend: { display: false } } } 
            });
            
            const yearCtx = yearCanvas.getContext('2d');
            this.charts.yearChart = new Chart(yearCtx, {
                type: 'line',
                data: {
                    labels: Object.keys(stats.yearCount),
                    datasets: [{
                        label: 'Số lượng thùng theo năm',
                        data: Object.values(stats.yearCount),
                        backgroundColor: '#16a34a',
                        borderColor: '#16a34a',
                        fill: false,
                        tension: 0.1
                    }]
                },
                options: { responsive: true, maintainAspectRatio: true, plugins: { legend: { display: false } } } 
            });

        } catch (error) {
            this.dom.statsPage.innerHTML = `<h2 class="text-3xl font-bold mb-6">Thống Kê Báo Cáo</h2><p class="text-red-500 text-center p-10">${error.message}</p>`;
        }
    }
    
    // === Quản Lý User ===
    
    loadRolesIntoSelect() {
        this.dom.userRoleSelect.innerHTML = '<option value="">-- Chọn vai trò --</option>';
        this.roles.forEach(role => {
            this.dom.userRoleSelect.innerHTML += `<option value="${role.id}">${role.role_name}</option>`;
        });
    }

    async renderUsersTable() {
        this.dom.usersTableBody.innerHTML = `<tr><td colspan="6" class="text-center p-6 text-gray-500">Đang tải danh sách người dùng...</td></tr>`;

        try {
            const response = await fetch('api/get_users.php');
            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || 'Lỗi khi tải người dùng');
            }
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
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-800 align-middle font-medium">${user.username}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-800 align-middle">${user.fullname}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-800 align-middle">${user.email}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-800 align-middle">${user.role_name}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-800 align-middle">
                            <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClass}">
                                ${statusText}
                            </span>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-800 align-middle">
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
    
    async renderLogsTable() {
        this.dom.logsTableBody.innerHTML = `<tr><td colspan="4" class="text-center p-6 text-gray-500">Đang tải lịch sử...</td></tr>`;

        try {
            const response = await fetch('api/get_logs.php');
            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || 'Lỗi khi tải logs');
            }
            const logs = await response.json();
            
            const tbody = this.dom.logsTableBody;
            tbody.innerHTML = '';

            if (logs.length === 0) {
                tbody.innerHTML = `<tr><td colspan="4" class="text-center p-6 text-gray-500">Chưa có lịch sử hoạt động nào.</td></tr>`;
                return;
            }

            logs.forEach(log => {
                tbody.innerHTML += `
                    <tr>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-800 align-middle">${log.log_time}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-800 align-middle font-medium">${log.username || 'N/A'}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-800 align-middle">${log.action}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-800 align-middle">${log.detail || ''}</td>
                    </tr>
                `;
            });

        } catch (error) {
            this.dom.logsTableBody.innerHTML = `<tr><td colspan="4" class="text-center p-6 text-red-500">${error.message}</td></tr>`;
        }
    }


    async showUserModal(userId) {
        this.dom.userForm.reset();
        this.dom.userModalDeleteBtn.classList.add('hidden');
        this.dom.userModal.classList.add('active');
        
        document.getElementById('user-password').placeholder = "Để trống nếu không muốn thay đổi";
        document.getElementById('user-password').required = false;

        if (userId) { 
            this.dom.userModalTitle.textContent = 'Đang tải...';
            try {
                const response = await fetch(`api/get_users.php?id=${userId}`);
                if (!response.ok) throw new Error('Không tìm thấy người dùng');
                const user = await response.json();

                this.dom.userModalTitle.textContent = `Sửa Người Dùng: ${user.username}`;
                this.dom.userModalDeleteBtn.classList.remove('hidden');
                
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
        } else { 
            this.dom.userModalTitle.textContent = 'Thêm Người Dùng Mới';
            document.getElementById('user-id').value = '';
            document.getElementById('user-password').placeholder = "Mật khẩu (bắt buộc)";
            document.getElementById('user-password').required = true;
            document.querySelector(`input[name="user-active"][value="1"]`).checked = true;
        }
    }

    hideUserModal() {
        this.dom.userModal.classList.remove('active');
    }

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
            password: password 
        };

        if (!data.username || !data.role_id) {
            this.showAlert('Tên đăng nhập và Vai trò là bắt buộc.');
            return;
        }
        if (!id && !data.password) {
            this.showAlert('Mật khẩu là bắt buộc khi thêm người dùng mới.');
            return;
        }

        try {
            const response = await fetch('api/save.user.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.error || 'Lỗi không xác định');

            this.showAlert(result.message);
            this.hideUserModal();
            this.renderUsersTable(); 

        } catch (error) {
            this.showAlert(`Lỗi khi lưu: ${error.message}`);
        }
    }

    async handleDeleteUser(userId = null) {
        const id = userId || parseInt(document.getElementById('user-id').value);
        if (!id) return;
        
        if (id === 1) { 
            this.showAlert('Không thể xóa tài khoản Quản Trị Viên gốc.');
            return;
        }
        
        if (this.currentUser && id === this.currentUser.id) {
            this.showAlert('Bạn không thể tự xóa chính mình.');
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
                this.renderUsersTable(); 

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