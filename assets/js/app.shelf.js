// === SHELF MODAL METHODS ===

App.prototype.showShelfModal = function(isAdding = false) {
    this.dom.shelfForm.reset();
    
    const allowedRoles = [1, 2];
    if (isAdding || !allowedRoles.includes(this.currentUser.role_id)) {
        this.dom.deleteShelfBtnFromEdit.style.display = 'none';
    } else {
        this.dom.deleteShelfBtnFromEdit.style.display = 'block';
    }

    if (isAdding) {
        this.dom.shelfModalTitle.textContent = "Thêm Kệ Mới";
        this.dom.shelfEditId.value = '';
        this.dom.shelfEditCode.value = '';
        this.dom.shelfEditRows.value = 10;
        this.dom.shelfEditCols.value = 20;
    } else {
        this.dom.shelfModalTitle.textContent = "Chỉnh Sửa Kệ";
        const shelf = this.shelves.find(s => s.id === this.currentShelfId);
        if (!shelf) {
            this.showAlert('Vui lòng chọn một kệ để sửa.');
            return;
        }
        this.dom.shelfEditId.value = shelf.id;
        this.dom.shelfEditCode.value = shelf.shelf_code;
        this.dom.shelfEditRows.value = shelf.num_rows;
        this.dom.shelfEditCols.value = shelf.num_cols;
    }
    
    this.dom.shelfModal.classList.add('active');
}

App.prototype.hideShelfModal = function() {
    this.dom.shelfModal.classList.remove('active');
}

App.prototype.handleSaveShelf = async function(e) {
    e.preventDefault();
    
    const id = this.dom.shelfEditId.value ? parseInt(this.dom.shelfEditId.value) : null;
    const code = this.dom.shelfEditCode.value;
    const rows = parseInt(this.dom.shelfEditRows.value);
    const cols = parseInt(this.dom.shelfEditCols.value);

    if (!code || !rows || !cols) {
        this.showAlert('Vui lòng điền đầy đủ thông tin.');
        return;
    }

    const url = id ? 'api/save_shelf.php' : 'api/add_shelf.php';
    const data = {
        id: id, 
        shelf_code: code,
        num_rows: rows,
        num_cols: cols
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Lỗi không xác định');
        
        this.showAlert(result.message);
        this.hideShelfModal();
        
        await this.loadInitialData(); 
        this.currentShelfId = result.id; 
        
        this.renderShelfTabs();
        this.renderShelfGrid();
        this.renderSearchFilters();
        
    } catch (error) {
        this.showAlert(`Lỗi khi lưu kệ: ${error.message}`);
    }
}

App.prototype.showDeleteShelfConfirm = function() {
    const shelf = this.shelves.find(s => s.id === this.currentShelfId);
    if (!shelf) return; 

    if (this.currentBoxesOnShelf.length > 0) {
        this.showAlert(`Không thể xóa kệ ${shelf.shelf_code} vì vẫn còn ${this.currentBoxesOnShelf.length} thùng hồ sơ. Vui lòng di chuyển hoặc xóa hết thùng hồ sơ trước.`);
        return;
    }

    this.dom.deleteShelfConfirmLabel.innerHTML = `Hành động này không thể hoàn tác. Để xác nhận, vui lòng nhập <strong>${shelf.shelf_code}</strong> vào ô bên dưới.`;
    this.dom.deleteShelfConfirmInput.value = '';
    this.dom.deleteShelfConfirmInput.dataset.expectedCode = shelf.shelf_code;
    this.dom.deleteShelfConfirmBtn.disabled = true;

    this.hideShelfModal(); 
    this.dom.deleteShelfConfirmModal.classList.add('active'); 
}

App.prototype.hideDeleteShelfConfirm = function() {
    this.dom.deleteShelfConfirmModal.classList.remove('active');
}

App.prototype.handleDeleteShelfInput = function() {
    const input = this.dom.deleteShelfConfirmInput.value;
    const expected = this.dom.deleteShelfConfirmInput.dataset.expectedCode;
    this.dom.deleteShelfConfirmBtn.disabled = (input !== expected);
}

App.prototype.handleDeleteShelfConfirm = async function() {
    const id = this.currentShelfId;
    if (!id) return;
    
    this.dom.deleteShelfConfirmBtn.disabled = true;
    this.dom.deleteShelfConfirmBtn.textContent = "Đang xóa...";

    try {
        const response = await fetch('api/delete_shelf.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: id })
        });
        
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Lỗi không xác định');

        this.showAlert(result.message);
        this.hideDeleteShelfConfirm();

        await this.loadInitialData(); 
        this.currentShelfId = this.shelves.length > 0 ? this.shelves[0].id : null;

        this.renderShelfTabs();
        this.renderShelfGrid();
        this.renderSearchFilters();
        
    } catch (error) {
        this.showAlert(`Lỗi khi xóa kệ: ${error.message}`);
    } finally {
        this.dom.deleteShelfConfirmBtn.disabled = false;
        this.dom.deleteShelfConfirmBtn.textContent = "Xác Nhận Xóa";
    }
}