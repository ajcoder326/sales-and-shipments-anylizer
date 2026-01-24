// ==================== Global Variables ====================
let allData = [];
let searchResults = [];
let reportData = [];
let currentPage = 1;
const itemsPerPage = 25;
let uploadedFileData = null;

// Admin Credentials
const ADMIN_CREDENTIALS = { id: 'admin', password: 'admin123' };

// ==================== Initialize App ====================
document.addEventListener('DOMContentLoaded', function () { checkLoginStatus(); });

function checkLoginStatus() {
    const isLoggedIn = sessionStorage.getItem('kuberLoggedIn');
    if (isLoggedIn === 'true') showMainApp();
    else showLoginScreen();
}

function showLoginScreen() {
    document.getElementById('loginScreen').style.display = 'flex';
    document.getElementById('sidebar').style.display = 'none';
    document.getElementById('mainContent').style.display = 'none';
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
}

function handleLogin(e) {
    e.preventDefault();
    const userId = document.getElementById('loginId').value.trim();
    const password = document.getElementById('loginPassword').value;
    const errorDiv = document.getElementById('loginError');
    if (userId === ADMIN_CREDENTIALS.id && password === ADMIN_CREDENTIALS.password) {
        sessionStorage.setItem('kuberLoggedIn', 'true');
        sessionStorage.setItem('kuberUser', userId);
        errorDiv.textContent = '';
        showMainApp();
    } else {
        errorDiv.textContent = 'Invalid User ID or Password. Please try again.';
        document.getElementById('loginPassword').value = '';
    }
}

function showMainApp() {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('sidebar').style.display = 'block';
    document.getElementById('mainContent').style.display = 'block';
    initializeApp();
}

function logout() {
    sessionStorage.removeItem('kuberLoggedIn');
    sessionStorage.removeItem('kuberUser');
    location.reload();
}

function initializeApp() {
    showLoading();
    initNavigation();
    initEventListeners();
    document.getElementById('logoutBtn').addEventListener('click', logout);
    const now = new Date();
    document.getElementById('recordMonth').value = now.getMonth() + 1;
    initYearDropdowns();
    initDateFilterTabs();
    loadDashboard();
    loadPlatformDropdowns();
    loadFilterOptions();
    hideLoading();
}

// ==================== Date Filter Functions ====================
let currentSearchDateFilter = 'none';
let currentReportDateFilter = 'none';

function initYearDropdowns() {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let y = currentYear + 1; y >= currentYear - 5; y--) years.push(y);
    const yearSelects = ['searchYear', 'searchMonthYear', 'reportYear', 'reportMonthYear', 'recordYear', 'editYear', 'searchStartYear', 'searchEndYear', 'reportStartYear', 'reportEndYear'];
    yearSelects.forEach(id => {
        const select = document.getElementById(id);
        if (select) {
            select.innerHTML = '<option value="">Select Year</option>';
            years.forEach(year => {
                const option = document.createElement('option');
                option.value = year;
                option.textContent = year;
                if ((id === 'recordYear' || id === 'editYear') && year === currentYear) option.selected = true;
                select.appendChild(option);
            });
        }
    });
}

function initDateFilterTabs() {
    document.querySelectorAll('.date-filter-tabs:not(#reportDateTabs) .date-tab').forEach(tab => {
        tab.addEventListener('click', function () {
            currentSearchDateFilter = this.dataset.filter;
            document.querySelectorAll('.date-filter-tabs:not(#reportDateTabs) .date-tab').forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            document.querySelectorAll('.date-filter-options:not(#reportDateOptions) .date-option').forEach(opt => opt.style.display = 'none');
            if (currentSearchDateFilter !== 'none') {
                const optionId = 'dateFilter' + currentSearchDateFilter.charAt(0).toUpperCase() + currentSearchDateFilter.slice(1);
                const option = document.getElementById(optionId);
                if (option) option.style.display = 'block';
            }
        });
    });
    document.querySelectorAll('#reportDateTabs .date-tab').forEach(tab => {
        tab.addEventListener('click', function () {
            currentReportDateFilter = this.dataset.filter;
            document.querySelectorAll('#reportDateTabs .date-tab').forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            document.querySelectorAll('#reportDateOptions .date-option').forEach(opt => opt.style.display = 'none');
            if (currentReportDateFilter !== 'none') {
                const optionId = 'reportDateFilter' + currentReportDateFilter.charAt(0).toUpperCase() + currentReportDateFilter.slice(1);
                const option = document.getElementById(optionId);
                if (option) option.style.display = 'block';
            }
        });
    });
}

// ==================== Navigation ====================
function initNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const pages = document.querySelectorAll('.page');
    navItems.forEach(item => {
        item.addEventListener('click', function (e) {
            e.preventDefault();
            navItems.forEach(i => i.classList.remove('active'));
            pages.forEach(p => p.classList.remove('active'));
            this.classList.add('active');
            const pageName = this.dataset.page;
            document.getElementById(pageName + 'Page').classList.add('active');
            document.getElementById('pageTitle').textContent = this.querySelector('span').textContent;
            document.getElementById('sidebar').classList.remove('mobile-open');
            if (pageName === 'dashboard') loadDashboard();
            if (pageName === 'data') loadAllData();
        });
    });
    document.getElementById('toggleSidebar').addEventListener('click', function () { document.getElementById('sidebar').classList.toggle('collapsed'); });
    document.getElementById('mobileToggle').addEventListener('click', function () { document.getElementById('sidebar').classList.toggle('mobile-open'); });
}

// ==================== Event Listeners ====================
function initEventListeners() {
    document.getElementById('quickSearch').addEventListener('keypress', function (e) { if (e.key === 'Enter') quickSearch(this.value); });
    document.getElementById('searchBtn').addEventListener('click', performSearch);
    document.getElementById('mainSearchInput').addEventListener('keypress', function (e) { if (e.key === 'Enter') performSearch(); });
    document.getElementById('exportSearchResults').addEventListener('click', exportSearchResults);
    document.getElementById('singleRecordForm').addEventListener('submit', submitSingleRecord);
    document.getElementById('uploadArea').addEventListener('click', function () { document.getElementById('fileInput').click(); });
    document.getElementById('fileInput').addEventListener('change', handleFileUpload);
    document.getElementById('bulkUploadBtn').addEventListener('click', bulkUpload);
    document.getElementById('removeFile').addEventListener('click', clearUploadedFile);
    const uploadArea = document.getElementById('uploadArea');
    uploadArea.addEventListener('dragover', function (e) { e.preventDefault(); this.style.borderColor = '#1a73e8'; this.style.background = 'rgba(26, 115, 232, 0.1)'; });
    uploadArea.addEventListener('dragleave', function (e) { e.preventDefault(); this.style.borderColor = '#dadce0'; this.style.background = 'transparent'; });
    uploadArea.addEventListener('drop', function (e) { e.preventDefault(); this.style.borderColor = '#dadce0'; this.style.background = 'transparent'; handleDroppedFile(e.dataTransfer.files[0]); });
    document.getElementById('previewReportBtn').addEventListener('click', previewReport);
    document.getElementById('downloadExcelBtn').addEventListener('click', downloadExcel);
    document.getElementById('downloadCsvBtn').addEventListener('click', downloadCSV);
    document.getElementById('refreshDataBtn').addEventListener('click', loadAllData);
    document.getElementById('dataPlatformFilter').addEventListener('change', filterAllData);
    document.getElementById('closeEditModal').addEventListener('click', closeEditModal);
    document.getElementById('cancelEdit').addEventListener('click', closeEditModal);
    document.getElementById('editRecordForm').addEventListener('submit', saveEditedRecord);
    document.getElementById('editModal').addEventListener('click', function (e) { if (e.target === this) closeEditModal(); });
}

// ==================== API Functions ====================
function loadPlatformDropdowns() {
    fetch('/api/platforms')
        .then(res => res.json())
        .then(platforms => {
            const dropdowns = ['recordPlatform', 'bulkPlatform', 'platformFilter', 'reportPlatform', 'dataPlatformFilter'];
            dropdowns.forEach(id => {
                const select = document.getElementById(id);
                if (select) {
                    if (id === 'platformFilter' || id === 'reportPlatform' || id === 'dataPlatformFilter') {
                        const firstOption = select.options[0];
                        select.innerHTML = '';
                        select.appendChild(firstOption);
                    } else {
                        select.innerHTML = '<option value="">-- Select Platform --</option>';
                    }
                    platforms.forEach(platform => {
                        const option = document.createElement('option');
                        option.value = platform;
                        option.textContent = platform;
                        select.appendChild(option);
                    });
                }
            });
        })
        .catch(handleError);
}

function loadFilterOptions() {
    fetch('/api/filter-options')
        .then(res => res.json())
        .then(options => {
            const bundleSelects = ['bundleIdFilter', 'reportBundleId'];
            bundleSelects.forEach(id => {
                const select = document.getElementById(id);
                if (select) {
                    select.innerHTML = '<option value="All">All Bundle IDs</option>';
                    options.bundleIds.forEach(bundleId => {
                        const option = document.createElement('option');
                        option.value = bundleId;
                        option.textContent = bundleId;
                        select.appendChild(option);
                    });
                }
            });
            const parentEanSelect = document.getElementById('parentEanFilter');
            if (parentEanSelect) {
                parentEanSelect.innerHTML = '<option value="All">All Parent EANs</option>';
                options.parentEans.forEach(ean => {
                    const option = document.createElement('option');
                    option.value = ean;
                    option.textContent = ean;
                    parentEanSelect.appendChild(option);
                });
            }
        })
        .catch(handleError);
}

// ==================== Dashboard ====================
function loadDashboard() {
    showLoading();
    fetch('/api/dashboard')
        .then(res => res.json())
        .then(stats => {
            document.getElementById('totalShippedUnits').textContent = formatNumber(stats.totalShippedUnits);
            document.getElementById('totalRecords').textContent = formatNumber(stats.totalRecords);
            document.getElementById('bundleCount').textContent = Object.keys(stats.bundleStats || {}).length;
            document.getElementById('platformCount').textContent = stats.platformCount;
            renderPlatformStats(stats.platformStats);
            renderTopProducts(stats.topProducts);
            hideLoading();
        })
        .catch(error => { hideLoading(); handleError(error); });
}

function renderPlatformStats(platformStats) {
    const container = document.getElementById('platformStats');
    const colors = ['#1a73e8', '#34a853', '#ea4335', '#fbbc04', '#9c27b0', '#ff9800', '#00bcd4'];
    let html = '';
    let index = 0;
    for (const platform in platformStats) {
        const stats = platformStats[platform];
        html += `<div class="platform-stat-item"><div class="platform-name"><div class="platform-badge" style="background: ${colors[index % colors.length]}"></div><span>${platform}</span></div><div class="platform-values"><span>Records: <strong>${formatNumber(stats.recordCount)}</strong></span><span>Shipped: <strong>${formatNumber(stats.shippedUnits)} units</strong></span></div></div>`;
        index++;
    }
    container.innerHTML = html || '<p style="text-align: center; color: #80868b;">No data available</p>';
}

function renderTopProducts(products) {
    const container = document.getElementById('topProducts');
    if (!products || products.length === 0) { container.innerHTML = '<p style="text-align: center; color: #80868b;">No products found</p>'; return; }
    let html = '';
    products.forEach((product, index) => {
        html += `<div class="top-product-item"><div class="product-rank">${index + 1}</div><div class="product-info"><h4>${escapeHtml(product.productName || product.parentEan)}</h4><p>EAN: ${escapeHtml(product.parentEan)} | Bundle: ${escapeHtml(product.bundleId || 'N/A')}</p></div><div class="product-sales"><div class="qty">${formatNumber(product.shippedUnits)} units</div></div></div>`;
    });
    container.innerHTML = html;
}

// ==================== Search ====================
function performSearch() {
    const query = document.getElementById('mainSearchInput').value;
    const platform = document.getElementById('platformFilter').value;
    const bundleId = document.getElementById('bundleIdFilter').value;
    const parentEan = document.getElementById('parentEanFilter').value;
    const criteria = { query, platform, bundleId, parentEan };
    addDateFilters(criteria, 'search');
    const hasFilter = query || platform !== 'All' || bundleId !== 'All' || parentEan !== 'All' || criteria.month || criteria.year || criteria.startYear || criteria.endYear;
    if (!hasFilter) { showToast('Please enter a search query or select filters', 'warning'); return; }
    showLoading();
    fetch('/api/search', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(criteria) })
        .then(res => res.json())
        .then(results => { searchResults = results; displaySearchResults(results); hideLoading(); })
        .catch(error => { hideLoading(); handleError(error); });
}

function addDateFilters(criteria, page) {
    const prefix = page === 'search' ? 'search' : 'report';
    const currentFilter = page === 'search' ? currentSearchDateFilter : currentReportDateFilter;
    switch (currentFilter) {
        case 'month':
            const month = document.getElementById(prefix + 'Month').value;
            const monthYear = document.getElementById(prefix + 'MonthYear').value;
            if (month && monthYear) { criteria.month = month; criteria.year = monthYear; }
            break;
        case 'year':
            const year = document.getElementById(prefix + 'Year').value;
            if (year) criteria.year = year;
            break;
        case 'range':
            const startMonth = document.getElementById(prefix + 'StartMonth').value;
            const startYear = document.getElementById(prefix + 'StartYear').value;
            const endMonth = document.getElementById(prefix + 'EndMonth').value;
            const endYear = document.getElementById(prefix + 'EndYear').value;
            if (startYear && endYear) { criteria.startMonth = startMonth || 1; criteria.startYear = startYear; criteria.endMonth = endMonth || 12; criteria.endYear = endYear; }
            break;
    }
}

function displaySearchResults(results) {
    const container = document.getElementById('searchResultsBody');
    const card = document.getElementById('searchResultsCard');
    const countSpan = document.getElementById('resultCount');
    const summaryDiv = document.getElementById('searchSummary');
    countSpan.textContent = results.length;
    card.style.display = 'block';
    let totalUnits = 0;
    const platforms = {};
    const bundles = {};
    results.forEach(row => {
        const units = parseInt(row['Shipped Units']) || 0;
        totalUnits += units;
        const platform = row.Platform || 'Unknown';
        platforms[platform] = (platforms[platform] || 0) + units;
        const bundleId = row['Bundle ID'];
        if (bundleId) bundles[bundleId] = true;
    });
    summaryDiv.innerHTML = `<div class="summary-item"><h4>${formatNumber(results.length)}</h4><p>Records Found</p></div><div class="summary-item"><h4>${formatNumber(totalUnits)}</h4><p>Total Shipped Units</p></div><div class="summary-item"><h4>${Object.keys(bundles).length}</h4><p>Unique Bundles</p></div><div class="summary-item"><h4>${Object.keys(platforms).length}</h4><p>Platforms</p></div>`;
    let html = '';
    results.forEach(row => {
        html += `<tr><td>${escapeHtml(row.Platform || '')}</td><td>${escapeHtml(row['Platform ID'] || '')}</td><td>${escapeHtml(row['Bundle ID'] || '')}</td><td>${escapeHtml(row['Parent EAN'] || '')}</td><td>${escapeHtml(row['Product Name'] || '')}</td><td>${row['Shipped Units'] || 0}</td><td>${getMonthName(row['Month'])}</td><td>${row['Year'] || ''}</td></tr>`;
    });
    container.innerHTML = html || '<tr><td colspan="8" style="text-align: center;">No results found</td></tr>';
}

function quickSearch(query) {
    if (!query.trim()) return;
    document.querySelector('[data-page="search"]').click();
    document.getElementById('mainSearchInput').value = query;
    performSearch();
}

function exportSearchResults() {
    if (searchResults.length === 0) { showToast('No results to export', 'warning'); return; }
    exportToExcel(searchResults, 'Search_Results');
}

// ==================== Upload Functions ====================
function submitSingleRecord(e) {
    e.preventDefault();
    const platform = document.getElementById('recordPlatform').value;
    const record = {
        platformId: document.getElementById('recordPlatformId').value,
        bundleId: document.getElementById('recordBundleId').value,
        parentEan: document.getElementById('recordParentEan').value,
        productName: document.getElementById('recordProductName').value,
        shippedUnits: parseInt(document.getElementById('recordShippedUnits').value) || 0,
        month: parseInt(document.getElementById('recordMonth').value),
        year: parseInt(document.getElementById('recordYear').value)
    };
    if (!platform) { showToast('Please select a platform', 'warning'); return; }
    if (!record.month || !record.year) { showToast('Please select Month and Year', 'warning'); return; }
    showLoading();
    fetch('/api/upload/single', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ platform, record }) })
        .then(res => res.json())
        .then(result => { hideLoading(); if (result.success) { showToast(result.message, 'success'); document.getElementById('singleRecordForm').reset(); loadFilterOptions(); } else showToast(result.message, 'error'); })
        .catch(error => { hideLoading(); handleError(error); });
}

function handleFileUpload(e) { const file = e.target.files[0]; if (file) handleDroppedFile(file); }

function handleDroppedFile(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function (e) {
        let content = e.target.result;
        let dataArray = [];
        if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
            const workbook = XLSX.read(content, { type: 'binary' });
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            dataArray = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
            document.getElementById('csvData').value = XLSX.utils.sheet_to_csv(firstSheet);
        } else {
            document.getElementById('csvData').value = content;
            dataArray = content.split('\n').map(row => row.split(',').map(cell => cell.trim()));
        }
        uploadedFileData = dataArray;
        const recordCount = dataArray.length > 0 ? dataArray.length - 1 : 0;
        document.getElementById('fileName').textContent = file.name;
        document.getElementById('recordCount').textContent = `${recordCount} records detected`;
        document.getElementById('filePreview').style.display = 'block';
        showToast(`File "${file.name}" loaded - ${recordCount} records ready to upload`, 'success');
    };
    if (file.name.endsWith('.csv')) reader.readAsText(file);
    else reader.readAsBinaryString(file);
}

function clearUploadedFile() {
    uploadedFileData = null;
    document.getElementById('fileInput').value = '';
    document.getElementById('csvData').value = '';
    document.getElementById('filePreview').style.display = 'none';
}

function bulkUpload() {
    const platform = document.getElementById('bulkPlatform').value;
    const csvData = document.getElementById('csvData').value;
    if (!platform) { showToast('Please select a platform first', 'warning'); return; }
    if (!csvData.trim() && !uploadedFileData) { showToast('Please upload a file or paste CSV data', 'warning'); return; }
    showLoading();
    document.getElementById('uploadProgress').style.display = 'block';
    const endpoint = uploadedFileData ? '/api/upload/bulk' : '/api/upload/csv';
    const body = uploadedFileData ? { platform, data: uploadedFileData } : { platform, csvData };
    fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
        .then(res => res.json())
        .then(result => {
            hideLoading();
            document.getElementById('uploadProgress').style.display = 'none';
            if (result.success) { showToast(result.message, 'success'); clearUploadedFile(); loadFilterOptions(); const resultDiv = document.getElementById('uploadResult'); resultDiv.innerHTML = `<div class="success-message"><i class="fas fa-check-circle"></i> ${result.message}</div>`; resultDiv.style.display = 'block'; setTimeout(() => { resultDiv.style.display = 'none'; }, 5000); }
            else showToast(result.message, 'error');
        })
        .catch(error => { hideLoading(); document.getElementById('uploadProgress').style.display = 'none'; handleError(error); });
}

// ==================== Reports ====================
function previewReport() {
    const criteria = { platform: document.getElementById('reportPlatform').value, bundleId: document.getElementById('reportBundleId').value, query: document.getElementById('reportQuery').value };
    addDateFilters(criteria, 'report');
    showLoading();
    fetch('/api/search', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(criteria) })
        .then(res => res.json())
        .then(data => { reportData = data; displayReportPreview(data); hideLoading(); })
        .catch(error => { hideLoading(); handleError(error); });
}

function displayReportPreview(data) {
    const card = document.getElementById('reportPreviewCard');
    const countSpan = document.getElementById('reportCount');
    const summaryDiv = document.getElementById('reportSummary');
    const tbody = document.getElementById('reportBody');
    card.style.display = 'block';
    countSpan.textContent = data.length;
    let totalUnits = 0;
    const bundles = {};
    data.forEach(row => { const units = parseInt(row['Shipped Units']) || 0; totalUnits += units; if (row['Bundle ID']) bundles[row['Bundle ID']] = true; });
    summaryDiv.innerHTML = `<div class="summary-item"><h4>${formatNumber(data.length)}</h4><p>Total Records</p></div><div class="summary-item"><h4>${formatNumber(totalUnits)}</h4><p>Total Shipped Units</p></div><div class="summary-item"><h4>${Object.keys(bundles).length}</h4><p>Unique Bundles</p></div>`;
    const previewData = data.slice(0, 100);
    let html = '';
    previewData.forEach(row => { html += `<tr><td>${escapeHtml(row.Platform || '')}</td><td>${escapeHtml(row['Platform ID'] || '')}</td><td>${escapeHtml(row['Bundle ID'] || '')}</td><td>${escapeHtml(row['Parent EAN'] || '')}</td><td>${escapeHtml(row['Product Name'] || '')}</td><td>${row['Shipped Units'] || 0}</td><td>${getMonthName(row['Month'])}</td><td>${row['Year'] || ''}</td></tr>`; });
    if (data.length > 100) html += `<tr><td colspan="8" style="text-align: center; color: #80868b;">Showing first 100 of ${data.length} records. Download to see all.</td></tr>`;
    tbody.innerHTML = html || '<tr><td colspan="8" style="text-align: center;">No data found</td></tr>';
}

function downloadExcel() {
    if (reportData.length === 0) { previewReport(); setTimeout(() => { if (reportData.length > 0) exportToExcel(reportData, 'Sales_Report'); else showToast('No data to export. Please preview first.', 'warning'); }, 2000); return; }
    exportToExcel(reportData, 'Sales_Report');
}

function downloadCSV() {
    if (reportData.length === 0) { showToast('No data to export. Please preview first.', 'warning'); return; }
    exportToCSV(reportData, 'Sales_Report');
}

function exportToExcel(data, filename) {
    const headers = ['Platform', 'Platform ID', 'Bundle ID', 'Parent EAN', 'Product Name', 'Shipped Units', 'Month', 'Year'];
    const rows = data.map(row => [row.Platform || '', row['Platform ID'] || '', row['Bundle ID'] || '', row['Parent EAN'] || '', row['Product Name'] || '', row['Shipped Units'] || 0, getMonthName(row['Month']) || '', row['Year'] || '']);
    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sales Data');
    ws['!cols'] = [{ wch: 12 }, { wch: 20 }, { wch: 15 }, { wch: 15 }, { wch: 30 }, { wch: 12 }, { wch: 12 }, { wch: 8 }];
    const dateStr = new Date().toISOString().split('T')[0];
    XLSX.writeFile(wb, `${filename}_${dateStr}.xlsx`);
    showToast('Excel file downloaded successfully', 'success');
}

function exportToCSV(data, filename) {
    const headers = ['Platform', 'Platform ID', 'Bundle ID', 'Parent EAN', 'Product Name', 'Shipped Units', 'Month', 'Year'];
    let csv = headers.join(',') + '\n';
    data.forEach(row => {
        const values = [row.Platform || '', row['Platform ID'] || '', row['Bundle ID'] || '', row['Parent EAN'] || '', row['Product Name'] || '', row['Shipped Units'] || 0, getMonthName(row['Month']) || '', row['Year'] || ''].map(val => { const str = String(val); if (str.includes(',') || str.includes('"')) return '"' + str.replace(/"/g, '""') + '"'; return str; });
        csv += values.join(',') + '\n';
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    showToast('CSV file downloaded successfully', 'success');
}

// ==================== All Data Page ====================
function loadAllData() {
    showLoading();
    fetch('/api/data')
        .then(res => res.json())
        .then(data => { allData = data; filterAllData(); hideLoading(); })
        .catch(error => { hideLoading(); handleError(error); });
}

function filterAllData() {
    const platform = document.getElementById('dataPlatformFilter').value;
    let filteredData = allData;
    if (platform !== 'All') filteredData = allData.filter(row => row.Platform === platform);
    currentPage = 1;
    renderAllDataTable(filteredData);
}

function renderAllDataTable(data) {
    const tbody = document.getElementById('allDataBody');
    const pagination = document.getElementById('dataPagination');
    const totalPages = Math.ceil(data.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageData = data.slice(startIndex, endIndex);
    let html = '';
    pageData.forEach(row => {
        const rowData = JSON.stringify(row).replace(/'/g, "\\'").replace(/"/g, '&quot;');
        html += `<tr><td>${escapeHtml(row.Platform || '')}</td><td>${escapeHtml(row['Platform ID'] || '')}</td><td>${escapeHtml(row['Bundle ID'] || '')}</td><td>${escapeHtml(row['Parent EAN'] || '')}</td><td>${escapeHtml(row['Product Name'] || '')}</td><td>${row['Shipped Units'] || 0}</td><td>${getMonthName(row['Month'])}</td><td>${row['Year'] || ''}</td><td class="actions"><button class="btn-edit" onclick='editRecord(${row.id}, ${rowData})'><i class="fas fa-edit"></i></button><button class="btn-delete" onclick="deleteRecord(${row.id})"><i class="fas fa-trash"></i></button></td></tr>`;
    });
    tbody.innerHTML = html || '<tr><td colspan="9" style="text-align: center;">No data found</td></tr>';
    let paginationHtml = '';
    if (totalPages > 1) {
        paginationHtml += `<button onclick="changePage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>‹ Prev</button>`;
        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) paginationHtml += `<button onclick="changePage(${i})" class="${i === currentPage ? 'active' : ''}">${i}</button>`;
            else if (i === currentPage - 3 || i === currentPage + 3) paginationHtml += `<button disabled>...</button>`;
        }
        paginationHtml += `<button onclick="changePage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>Next ›</button>`;
    }
    pagination.innerHTML = paginationHtml;
}

function changePage(page) {
    const platform = document.getElementById('dataPlatformFilter').value;
    let filteredData = allData;
    if (platform !== 'All') filteredData = allData.filter(row => row.Platform === platform);
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    if (page >= 1 && page <= totalPages) { currentPage = page; renderAllDataTable(filteredData); }
}

// ==================== Edit/Delete Functions ====================
function editRecord(id, row) {
    document.getElementById('editRowIndex').value = id;
    document.getElementById('editPlatform').value = row.Platform || '';
    document.getElementById('editPlatformId').value = row['Platform ID'] || '';
    document.getElementById('editBundleId').value = row['Bundle ID'] || '';
    document.getElementById('editParentEan').value = row['Parent EAN'] || '';
    document.getElementById('editProductName').value = row['Product Name'] || '';
    document.getElementById('editShippedUnits').value = row['Shipped Units'] || 0;
    document.getElementById('editMonth').value = row['Month'] || '';
    document.getElementById('editYear').value = row['Year'] || '';
    document.getElementById('editModal').classList.add('show');
}

function closeEditModal() { document.getElementById('editModal').classList.remove('show'); }

function saveEditedRecord(e) {
    e.preventDefault();
    const id = parseInt(document.getElementById('editRowIndex').value);
    const record = { platformId: document.getElementById('editPlatformId').value, bundleId: document.getElementById('editBundleId').value, parentEan: document.getElementById('editParentEan').value, productName: document.getElementById('editProductName').value, shippedUnits: parseInt(document.getElementById('editShippedUnits').value) || 0, month: parseInt(document.getElementById('editMonth').value), year: parseInt(document.getElementById('editYear').value) };
    if (!record.month || !record.year) { showToast('Please select Month and Year', 'warning'); return; }
    showLoading();
    fetch(`/api/record/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(record) })
        .then(res => res.json())
        .then(result => { hideLoading(); closeEditModal(); if (result.success) { showToast(result.message, 'success'); loadAllData(); } else showToast(result.message, 'error'); })
        .catch(error => { hideLoading(); handleError(error); });
}

function deleteRecord(id) {
    if (!confirm('Are you sure you want to delete this record?')) return;
    showLoading();
    fetch(`/api/record/${id}`, { method: 'DELETE' })
        .then(res => res.json())
        .then(result => { hideLoading(); if (result.success) { showToast(result.message, 'success'); loadAllData(); } else showToast(result.message, 'error'); })
        .catch(error => { hideLoading(); handleError(error); });
}

// ==================== Utility Functions ====================
function getMonthName(monthNum) {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return months[parseInt(monthNum) - 1] || '';
}
function formatNumber(num) { if (!num) return '0'; return new Intl.NumberFormat('en-IN').format(Math.round(num * 100) / 100); }
function escapeHtml(text) { if (!text) return ''; const div = document.createElement('div'); div.textContent = text; return div.innerHTML; }
function showLoading() { document.getElementById('loadingOverlay').classList.add('show'); }
function hideLoading() { document.getElementById('loadingOverlay').classList.remove('show'); }
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    toast.className = 'toast ' + type;
    toastMessage.textContent = message;
    const icon = toast.querySelector('i');
    if (type === 'success') icon.className = 'fas fa-check-circle';
    else if (type === 'error') icon.className = 'fas fa-times-circle';
    else if (type === 'warning') icon.className = 'fas fa-exclamation-triangle';
    toast.classList.add('show');
    setTimeout(() => { toast.classList.remove('show'); }, 3000);
}
function handleError(error) { console.error('Error:', error); showToast('An error occurred: ' + (error.message || error), 'error'); }
