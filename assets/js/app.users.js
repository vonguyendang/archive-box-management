// === USERS PAGE METHODS ===

App.prototype.loadRolesIntoSelect = function() {
    this.dom.userRoleSelect.innerHTML = '<option value="">-- Chọn vai trò --</option>';
    this.roles.forEach(role => {
        this.dom.userRoleSelect.innerHTML += `<option value="${role.id}">${role.role_name}</option>`;
    });
}

App.prototype.renderUsersTable = async function() {
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


App.prototype.showUserModal = async function(userId) {
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

App.prototype.hideUserModal = function() {
    this.dom.userModal.classList.remove('active');
}

App.prototype.handleSaveUser = async function(e) {
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
        const response = await fetch('api/save_user.php', {
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

App.prototype.handleDeleteUser = async function(userId = null) {
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