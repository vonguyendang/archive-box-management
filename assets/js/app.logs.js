// === LOGS PAGE METHODS ===

App.prototype.renderLogsTable = async function() {
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