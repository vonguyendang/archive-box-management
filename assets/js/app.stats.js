// === STATS PAGE METHODS ===

App.prototype.renderStatsCharts = async function() {
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