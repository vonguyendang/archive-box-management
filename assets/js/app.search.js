// === SEARCH PAGE METHODS ===

App.prototype.renderSearchFilters = function() {
    this.dom.filterShelf.innerHTML = '<option value="">Tất cả kệ</option>'; 
    this.shelves.forEach(shelf => {
        this.dom.filterShelf.innerHTML += `<option value="${shelf.id}">Kệ ${shelf.shelf_code}</option>`;
    });
}

App.prototype.renderSearchResults = async function() {
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

App.prototype.handleSortClick = function(e) {
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

App.prototype.sortAndRenderResults = function() {
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