/**
 * LỚP QUẢN LÝ ỨNG DỤNG (FRONTEND) - PHIÊN BẢN LÕI (CORE)
 * Chứa các hàm khởi tạo, điều hướng chính, và xác thực.
 * Các logic tính năng (Dashboard, User, Box,...) được tải từ các tệp riêng.
 */
class App {
    constructor() {
        this.currentShelfId = 1; 
        this.shelves = []; 
        this.roles = []; 
        this.charts = {}; 
        this.currentUser = null; 

        this.currentResults = []; 
        this.currentSort = {
            column: 'shelf_code', 
            direction: 'asc' 
        };
        
        this.currentBoxesOnShelf = [];

        this.cacheElements();
        this.registerEventListeners();
        this.init(); 
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
            editShelfBtn: document.getElementById('edit-shelf-btn'), 
            
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

            shelfModal: document.getElementById('shelf-modal'),
            shelfModalTitle: document.getElementById('shelf-modal-title'),
            shelfModalCloseBtn: document.getElementById('close-shelf-modal-btn'),
            shelfForm: document.getElementById('shelf-form'),
            shelfEditId: document.getElementById('shelf-edit-id'),
            shelfEditCode: document.getElementById('shelf-edit-code'),
            shelfEditRows: document.getElementById('shelf-edit-rows'),
            shelfEditCols: document.getElementById('shelf-edit-cols'),
            
            deleteShelfBtnFromEdit: document.getElementById('delete-shelf-btn-from-edit'),
            deleteShelfConfirmModal: document.getElementById('delete-shelf-confirm-modal'),
            deleteShelfConfirmLabel: document.getElementById('delete-shelf-confirm-label'),
            deleteShelfConfirmInput: document.getElementById('delete-shelf-confirm-input'),
            closeDeleteShelfConfirmBtn: document.getElementById('close-delete-shelf-confirm-btn'),
            deleteShelfConfirmBtn: document.getElementById('delete-shelf-confirm-btn'),
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
            const tabLink = e.target.closest('a[data-shelf-id]');
            if (tabLink) {
                this.handleShelfTabClick(e);
            }
            const addBtn = e.target.closest('#add-shelf-btn');
            if (addBtn) {
                this.handleAddShelf();
            }
        });

        if (this.dom.editShelfBtn) {
            this.dom.editShelfBtn.addEventListener('click', () => this.showShelfModal(false));
        }
        if (this.dom.shelfModalCloseBtn) {
            this.dom.shelfModalCloseBtn.addEventListener('click', () => this.hideShelfModal());
        }
        if (this.dom.shelfForm) {
            this.dom.shelfForm.addEventListener('submit', (e) => this.handleSaveShelf(e));
        }
        
        if (this.dom.deleteShelfBtnFromEdit) {
            this.dom.deleteShelfBtnFromEdit.addEventListener('click', () => this.showDeleteShelfConfirm());
        }
        if (this.dom.closeDeleteShelfConfirmBtn) {
            this.dom.closeDeleteShelfConfirmBtn.addEventListener('click', () => this.hideDeleteShelfConfirm());
        }
        if (this.dom.deleteShelfConfirmInput) {
            this.dom.deleteShelfConfirmInput.addEventListener('input', () => this.handleDeleteShelfInput());
        }
        if (this.dom.deleteShelfConfirmBtn) {
            this.dom.deleteShelfConfirmBtn.addEventListener('click', () => this.handleDeleteShelfConfirm());
        }

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
            
            if (this.currentUser.role_id != 1) {
                const userNav = document.querySelector('a[data-page="users"]');
                if (userNav) userNav.parentElement.style.display = 'none';
            }
            
            const allowedRoles = [1, 2]; // 1 = admin, 2 = staff
            if (!allowedRoles.includes(this.currentUser.role_id)) {
                if (this.dom.editShelfBtn) this.dom.editShelfBtn.style.display = 'none';
                if (this.dom.deleteShelfBtnFromEdit) this.dom.deleteShelfBtnFromEdit.style.display = 'none';
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
            } else {
                this.currentShelfId = null;
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

        // Gọi hàm render tương ứng cho từng trang
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
        // Trang Dashboard được render khi click tab (handleShelfTabClick)

        const isMobile = window.innerWidth < 768;
        if (isMobile && !this.dom.sidebar.classList.contains('-translate-x-full')) {
            this.handleSidebarToggle();
        }
    }
}

// Khởi chạy ứng dụng khi DOM đã tải
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});