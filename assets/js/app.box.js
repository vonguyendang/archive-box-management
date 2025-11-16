// === BOX MODAL METHODS ===

App.prototype.handleGridClick = function(e) {
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

App.prototype.showBoxModal = async function(boxId, shelfId = null, row = null, col = null) {
    this.dom.boxForm.reset();
    this.dom.boxModalDeleteBtn.classList.add('hidden');
    this.dom.boxModal.classList.add('active');
    
    const today = new Date().toISOString().split('T')[0];
    const fiveYearsLater = new Date(new Date().setFullYear(new Date().getFullYear() + 5)).toISOString().split('T')[0];

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
        document.getElementById('box-expiry').value = fiveYearsLater;
        document.getElementById('box-stored_by').value = this.currentUser.fullname || this.currentUser.username;
        document.getElementById('box-agency').value = 'Trung tâm Chất lượng, Chế biến và Phát triển thị trường vùng 6';
        document.getElementById('box-department').value = 'HÀNH CHÍNH, TỔNG HỢP';
    }
}

App.prototype.hideBoxModal = function() {
    this.dom.boxModal.classList.remove('active');
}

App.prototype.handleSaveBox = async function(e) {
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

App.prototype.handleDeleteBox = async function() {
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