// === DASHBOARD & GRID METHODS ===

App.prototype.renderShelfTabs = function() {
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
    
    const allowedRoles = [1, 2]; 
    if (this.currentUser && allowedRoles.includes(this.currentUser.role_id)) {
        this.dom.shelfTabsContainer.innerHTML += `
            <li class="ml-2">
                <button id="add-shelf-btn" class="p-4 text-green-500 hover:text-green-700 font-medium transition-colors" title="Thêm kệ mới">
                    <i class="fas fa-plus"></i> Thêm Kệ
                </button>
            </li>
        `;
    }
}

App.prototype.handleShelfTabClick = function(e) {
    e.preventDefault();
    this.currentShelfId = parseInt(e.target.dataset.shelfId);
    this.renderShelfGrid(); 
    
    document.querySelectorAll('#shelf-tabs a').forEach(a => a.className = "inline-block p-4 border-b-2 border-transparent rounded-t-lg hover:text-gray-600 hover:border-gray-300");
    e.target.className = "inline-block p-4 text-blue-600 border-b-2 border-blue-600 rounded-t-lg active";
}

App.prototype.handleAddShelf = async function() {
    this.showShelfModal(true); // true = Add mode
}

App.prototype.renderShelfGrid = async function() {
    this.currentBoxesOnShelf = []; // Reset
    
    const shelf = this.shelves.find(s => s.id === this.currentShelfId);
    if (!shelf) {
         this.dom.shelfGrid.innerHTML = `<div class="text-center p-10 text-gray-500">Không có kệ nào được chọn. Hãy thêm một kệ mới.</div>`;
        this.dom.currentShelfLabel.textContent = 'Chưa có kệ nào';
        this.dom.editShelfBtn.classList.add('hidden'); // Ẩn nút sửa nếu không có kệ
         return;
    }
    
    this.dom.editShelfBtn.classList.remove('hidden'); // Hiện nút sửa
    this.dom.currentShelfLabel.textContent = `Sơ Đồ Kệ ${shelf.shelf_code} (${shelf.num_rows}x${shelf.num_cols})`;
    this.dom.shelfGrid.innerHTML = '<div class="col-span-30 text-center p-10">Đang tải...</div>';

    this.dom.shelfGrid.style.gridTemplateColumns = `repeat(${shelf.num_cols}, minmax(30px, 1fr))`;
    this.dom.shelfGrid.style.gridTemplateRows = `repeat(${shelf.num_rows}, minmax(30px, 1fr))`;

    try {
        const response = await fetch(`api/get_boxs.php?shelf_id=${this.currentShelfId}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const boxes = await response.json();
        
        this.currentBoxesOnShelf = boxes;
        
        const boxMap = new Map(boxes.map(box => [`${box.row}-${box.col}`, box]));
        
        let gridHtml = '';
        for (let r = 1; r <= shelf.num_rows; r++) { 
            for (let c = 1; c <= shelf.num_cols; c++) { 
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
        this.dom.shelfGrid.innerHTML = `<div class="text-center p-10 text-red-500">Lỗi khi tải sơ đồ kệ: ${error.message}</div>`;
    }
}