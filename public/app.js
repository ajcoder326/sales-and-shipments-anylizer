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
    const yearSelects = ['searchYear', 'searchMonthYear', 'reportYear', 'reportMonthYear', 'recordYear', 'editYear', 'searchStartYear', 'searchEndYear', 'reportStartYear', 'reportEndYear', 'adminYearFilter'];
    yearSelects.forEach(id => {
        const select = document.getElementById(id);
        if (select) {
            const firstOptionText = id === 'adminYearFilter' ? 'All Years' : 'Select Year';
            select.innerHTML = `<option value="">${firstOptionText}</option>`;
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

    // Page size change listener
    const pageSizeSelect = document.getElementById('searchPageSize');
    if (pageSizeSelect) {
        pageSizeSelect.addEventListener('change', changePageSize);
    }
}

// ==================== API Functions ====================
function loadPlatformDropdowns() {
    fetch('/api/platforms')
        .then(res => res.json())
        .then(platforms => {
            const dropdowns = ['recordPlatform', 'bulkPlatform', 'platformFilter', 'reportPlatform', 'dataPlatformFilter', 'adminPlatformFilter'];
            dropdowns.forEach(id => {
                const select = document.getElementById(id);
                if (select) {
                    if (id === 'platformFilter' || id === 'reportPlatform' || id === 'dataPlatformFilter' || id === 'adminPlatformFilter') {
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
    // Add pagination params with dynamic page size
    const page = window.searchPage || 1;
    const limit = parseInt(document.getElementById('searchPageSize')?.value) || 200;
    fetch(`/api/search?page=${page}&limit=${limit}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(criteria)
    })
        .then(res => res.json())
        .then(response => {
            searchResults = response.results;
            displaySearchResults(response.results, response.total, response.page, response.limit);
            // Store for pagination
            window.searchTotal = response.total;
            window.searchPage = response.page;
            window.searchLimit = response.limit;
            hideLoading();
        })
        .catch(error => { hideLoading(); handleError(error); });
}

function addDateFilters(criteria, page) {
    const prefix = page === 'search' ? 'search' : 'report';
    const currentFilter = page === 'search' ? currentSearchDateFilter : currentReportDateFilter;
    switch (currentFilter) {
        case 'month':
            const month = document.getElementById(prefix + 'Month').value;
            const monthYear = document.getElementById(prefix + 'MonthYear').value;
            if (month) criteria.month = month;
            if (monthYear) criteria.year = monthYear;
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

function displaySearchResults(results, total, page, limit) {
    const container = document.getElementById('searchResultsBody');
    const card = document.getElementById('searchResultsCard');
    const countSpan = document.getElementById('resultCount');
    const summaryDiv = document.getElementById('searchSummary');
    countSpan.textContent = total || results.length;
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
    summaryDiv.innerHTML = `<div class="summary-item"><h4>${formatNumber(total || results.length)}</h4><p>Records Found</p></div><div class="summary-item"><h4>${formatNumber(totalUnits)}</h4><p>Total Shipped Units</p></div><div class="summary-item"><h4>${Object.keys(bundles).length}</h4><p>Unique Bundles</p></div><div class="summary-item"><h4>${Object.keys(platforms).length}</h4><p>Platforms</p></div>`;
    let html = '';
    results.forEach(row => {
        html += `<tr><td>${escapeHtml(row.Platform || '')}</td><td>${escapeHtml(row['Platform ID'] || '')}</td><td>${escapeHtml(row['Bundle ID'] || '')}</td><td>${escapeHtml(row['Parent EAN'] || '')}</td><td>${escapeHtml(row['Product Name'] || '')}</td><td>${row['Shipped Units'] || 0}</td><td>${getMonthName(row['Month'])}</td><td>${row['Year'] || ''}</td></tr>`;
    });
    container.innerHTML = html || '<tr><td colspan="8" style="text-align: center;">No results found</td></tr>';

    // Render pagination controls
    renderSearchPagination(total, page, limit);
}

function renderSearchPagination(total, page, limit) {
    const pagination = document.getElementById('searchPagination');
    const paginationInfo = document.getElementById('paginationInfo');
    if (!pagination) return;

    const totalPages = Math.ceil((total || 0) / (limit || 200));
    const startRecord = ((page - 1) * limit) + 1;
    const endRecord = Math.min(page * limit, total);

    // Update pagination info
    if (paginationInfo) {
        paginationInfo.textContent = `Showing ${formatNumber(startRecord)}-${formatNumber(endRecord)} of ${formatNumber(total)}`;
    }

    let html = '';
    if (totalPages > 1) {
        // First and Prev buttons
        html += `<button class="prev-btn" onclick="changeSearchPage(1)" ${page === 1 ? 'disabled' : ''} title="First Page">«</button>`;
        html += `<button class="prev-btn" onclick="changeSearchPage(${page - 1})" ${page === 1 ? 'disabled' : ''}>‹ Prev</button>`;

        // Page numbers
        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= page - 2 && i <= page + 2)) {
                html += `<button onclick="changeSearchPage(${i})" class="${i === page ? 'active' : ''}">${i}</button>`;
            } else if (i === page - 3 || i === page + 3) {
                html += `<button disabled>...</button>`;
            }
        }

        // Next and Last buttons
        html += `<button class="next-btn" onclick="changeSearchPage(${page + 1})" ${page === totalPages ? 'disabled' : ''}>Next ›</button>`;
        html += `<button class="next-btn" onclick="changeSearchPage(${totalPages})" ${page === totalPages ? 'disabled' : ''} title="Last Page">»</button>`;
    }
    pagination.innerHTML = html;
}

function changeSearchPage(newPage) {
    if (newPage < 1) return;
    const total = window.searchTotal || 0;
    const limit = parseInt(document.getElementById('searchPageSize')?.value) || 200;
    const totalPages = Math.ceil(total / limit);
    if (newPage > totalPages) return;
    window.searchPage = newPage;
    performSearch();
}

function changePageSize() {
    window.searchPage = 1; // Reset to first page when changing page size
    performSearch();
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

    // Show extraction progress
    showExtractionProgress(0, 'Reading file...');

    const reader = new FileReader();

    reader.onprogress = function (e) {
        if (e.lengthComputable) {
            const percent = Math.round((e.loaded / e.total) * 30); // Reading is 0-30%
            updateExtractionProgress(percent, 'Reading file data...');
        }
    };

    reader.onload = function (e) {
        updateExtractionProgress(35, 'Parsing file structure...');

        // Use setTimeout to allow UI to update
        setTimeout(() => {
            let content = e.target.result;
            let dataArray = [];

            try {
                if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
                    updateExtractionProgress(45, 'Reading Excel workbook...');

                    setTimeout(() => {
                        const workbook = XLSX.read(content, { type: 'binary' });
                        updateExtractionProgress(60, 'Extracting sheet data...');

                        setTimeout(() => {
                            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                            updateExtractionProgress(75, 'Converting to table format...');

                            setTimeout(() => {
                                dataArray = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
                                updateExtractionProgress(90, 'Preparing preview...');

                                setTimeout(() => {
                                    document.getElementById('csvData').value = XLSX.utils.sheet_to_csv(firstSheet);
                                    finalizeFileLoad(file, dataArray);
                                }, 100);
                            }, 100);
                        }, 100);
                    }, 100);
                } else {
                    updateExtractionProgress(60, 'Parsing CSV data...');
                    setTimeout(() => {
                        document.getElementById('csvData').value = content;
                        dataArray = content.split('\n').map(row => row.split(',').map(cell => cell.trim()));
                        updateExtractionProgress(90, 'Preparing preview...');
                        setTimeout(() => {
                            finalizeFileLoad(file, dataArray);
                        }, 100);
                    }, 100);
                }
            } catch (error) {
                hideExtractionProgress();
                showToast('Error reading file: ' + error.message, 'error');
            }
        }, 50);
    };

    reader.onerror = function () {
        hideExtractionProgress();
        showToast('Error reading file', 'error');
    };

    if (file.name.endsWith('.csv')) reader.readAsText(file);
    else reader.readAsBinaryString(file);
}

function finalizeFileLoad(file, dataArray) {
    uploadedFileData = dataArray;
    const recordCount = dataArray.length > 0 ? dataArray.length - 1 : 0;
    document.getElementById('fileName').textContent = file.name;
    document.getElementById('recordCount').textContent = `${formatNumber(recordCount)} records detected`;
    document.getElementById('filePreview').style.display = 'block';

    updateExtractionProgress(100, 'Complete!');
    setTimeout(() => {
        hideExtractionProgress();
        showToast(`File "${file.name}" loaded - ${formatNumber(recordCount)} records ready to upload`, 'success');
    }, 500);
}

function showExtractionProgress(percent, status) {
    const overlay = document.getElementById('uploadProgressOverlay');
    const title = overlay.querySelector('h3');
    title.innerHTML = '<i class="fas fa-file-excel"></i> Extracting Data';
    overlay.classList.add('show');
    updateExtractionProgress(percent, status);
}

function updateExtractionProgress(percent, status) {
    document.getElementById('uploadProgressBar').style.width = percent + '%';
    document.getElementById('uploadProgressPercent').textContent = percent + '%';
    document.getElementById('uploadProgressRecords').textContent = '';
    document.getElementById('uploadProgressStatus').textContent = status;
    document.getElementById('uploadEstimatedTime').textContent = percent < 100 ? 'Processing...' : 'Done!';
}

function hideExtractionProgress() {
    const overlay = document.getElementById('uploadProgressOverlay');
    const title = overlay.querySelector('h3');
    title.innerHTML = '<i class="fas fa-cloud-upload-alt"></i> Uploading Data';
    overlay.classList.remove('show');
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

    const totalRecords = uploadedFileData ? uploadedFileData.length - 1 : csvData.trim().split('\n').length - 1;

    // Show progress overlay
    showUploadProgress(0, totalRecords, 'Preparing upload...');

    const endpoint = uploadedFileData ? '/api/upload/bulk' : '/api/upload/csv';
    const body = uploadedFileData ? { platform, data: uploadedFileData } : { platform, csvData };

    const startTime = Date.now();

    // Use XMLHttpRequest for progress tracking
    const xhr = new XMLHttpRequest();
    xhr.open('POST', endpoint, true);
    xhr.setRequestHeader('Content-Type', 'application/json');

    xhr.upload.onprogress = function (e) {
        if (e.lengthComputable) {
            const percent = Math.round((e.loaded / e.total) * 50); // Upload is 50% of work
            const elapsed = (Date.now() - startTime) / 1000;
            const estimatedTotal = (elapsed / (percent / 100)) - elapsed;
            updateUploadProgress(percent, Math.round(totalRecords * percent / 100), totalRecords, 'Uploading data to server...', estimatedTotal);
        }
    };

    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                let result;
                try {
                    result = JSON.parse(xhr.responseText);
                } catch (e) {
                    hideUploadProgress();
                    showToast('Server returned invalid response', 'error');
                    return;
                }

                // Simulate processing progress (50-100%)
                simulateProcessingProgress(50, 100, totalRecords, function () {
                    hideUploadProgress();
                    if (result.success) {
                        showToast(result.message, 'success');
                        clearUploadedFile();
                        loadPlatformDropdowns();
                        const resultDiv = document.getElementById('uploadResult');
                        resultDiv.innerHTML = `<div class="success-message"><i class="fas fa-check-circle"></i> ${result.message}</div>`;
                        resultDiv.style.display = 'block';
                        setTimeout(() => { resultDiv.style.display = 'none'; }, 5000);
                    } else {
                        showToast(result.message, 'error');
                    }
                });
            } else {
                hideUploadProgress();
                showToast('Upload failed: ' + xhr.statusText, 'error');
            }
        }
    };

    xhr.onerror = function () {
        hideUploadProgress();
        showToast('Network error during upload', 'error');
    };

    xhr.send(JSON.stringify(body));
}

function showUploadProgress(percent, current, total, status) {
    const overlay = document.getElementById('uploadProgressOverlay');
    overlay.classList.add('show');
    updateUploadProgress(percent, current, total, status, 0);
}

function updateUploadProgress(percent, current, total, status, estimatedSeconds) {
    document.getElementById('uploadProgressBar').style.width = percent + '%';
    document.getElementById('uploadProgressPercent').textContent = percent + '%';
    document.getElementById('uploadProgressRecords').textContent = `${formatNumber(current)} / ${formatNumber(total)} records`;
    document.getElementById('uploadProgressStatus').textContent = status;

    if (estimatedSeconds > 0) {
        const mins = Math.floor(estimatedSeconds / 60);
        const secs = Math.round(estimatedSeconds % 60);
        const timeStr = mins > 0 ? `${mins}m ${secs}s remaining` : `${secs}s remaining`;
        document.getElementById('uploadEstimatedTime').textContent = timeStr;
    } else if (percent >= 100) {
        document.getElementById('uploadEstimatedTime').textContent = 'Completing...';
    } else {
        document.getElementById('uploadEstimatedTime').textContent = 'Calculating...';
    }
}

function hideUploadProgress() {
    document.getElementById('uploadProgressOverlay').classList.remove('show');
}

function simulateProcessingProgress(fromPercent, toPercent, totalRecords, callback) {
    let current = fromPercent;
    const step = (toPercent - fromPercent) / 20;
    const interval = setInterval(() => {
        current += step;
        if (current >= toPercent) {
            current = toPercent;
            clearInterval(interval);
            setTimeout(callback, 300);
        }
        const recordsProcessed = Math.round(totalRecords * current / 100);
        updateUploadProgress(Math.round(current), recordsProcessed, totalRecords, 'Processing records...', 0);
    }, 100);
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
    const page = window.allDataPage || 1;
    const limit = 25;
    const platform = document.getElementById('dataPlatformFilter')?.value || 'All';
    fetch(`/api/data?page=${page}&limit=${limit}&platform=${encodeURIComponent(platform)}`)
        .then(res => res.json())
        .then(data => {
            allData = data.results;
            window.allDataTotal = data.total;
            window.allDataPage = data.page;
            window.allDataLimit = data.limit;
            renderAllDataTable(allData, data.total, data.page, data.limit);
            hideLoading();
        })
        .catch(error => { hideLoading(); handleError(error); });
}

function filterAllData() {
    window.allDataPage = 1;
    loadAllData();
}

function renderAllDataTable(data) {
    const tbody = document.getElementById('allDataBody');
    const pagination = document.getElementById('dataPagination');
    const totalPages = Math.ceil((window.allDataTotal || 0) / (window.allDataLimit || 25));
    const page = window.allDataPage || 1;
    let html = '';
    (data || []).forEach(row => {
        const rowData = JSON.stringify(row).replace(/'/g, "\\'").replace(/"/g, '&quot;');
        html += `<tr><td>${escapeHtml(row.Platform || '')}</td><td>${escapeHtml(row['Platform ID'] || '')}</td><td>${escapeHtml(row['Bundle ID'] || '')}</td><td>${escapeHtml(row['Parent EAN'] || '')}</td><td>${escapeHtml(row['Product Name'] || '')}</td><td>${row['Shipped Units'] || 0}</td><td>${getMonthName(row['Month'])}</td><td>${row['Year'] || ''}</td><td class="actions"><button class="btn-edit" onclick='editRecord(${row.id}, ${rowData})'><i class="fas fa-edit"></i></button><button class="btn-delete" onclick="deleteRecord(${row.id})"><i class="fas fa-trash"></i></button></td></tr>`;
    });
    tbody.innerHTML = html || '<tr><td colspan="9" style="text-align: center;">No data found</td></tr>';
    let paginationHtml = '';
    if (totalPages > 1) {
        paginationHtml += `<button onclick="changePage(${page - 1})" ${page === 1 ? 'disabled' : ''}>‹ Prev</button>`;
        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= page - 2 && i <= page + 2)) paginationHtml += `<button onclick="changePage(${i})" class="${i === page ? 'active' : ''}">${i}</button>`;
            else if (i === page - 3 || i === page + 3) paginationHtml += `<button disabled>...</button>`;
        }
        paginationHtml += `<button onclick="changePage(${page + 1})" ${page === totalPages ? 'disabled' : ''}>Next ›</button>`;
    }
    pagination.innerHTML = paginationHtml;
}

function changePage(page) {
    const totalPages = Math.ceil((window.allDataTotal || 0) / (window.allDataLimit || 25));
    if (page >= 1 && page <= totalPages) {
        window.allDataPage = page;
        loadAllData();
    }
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

// ==================== Admin Panel Functions ====================
let deletePreviewData = [];

function loadAdminFilters() {
    fetch('/api/filters')
        .then(res => res.json())
        .then(data => {
            // Populate platform filter
            const platformSelect = document.getElementById('adminPlatformFilter');
            if (platformSelect) {
                platformSelect.innerHTML = '<option value="">All Platforms</option>';
                data.platforms.forEach(p => {
                    platformSelect.innerHTML += `<option value="${escapeHtml(p)}">${escapeHtml(p)}</option>`;
                });
            }
            // Populate year filter
            const yearSelect = document.getElementById('adminYearFilter');
            if (yearSelect) {
                yearSelect.innerHTML = '<option value="">All Years</option>';
                data.years.forEach(y => {
                    yearSelect.innerHTML += `<option value="${y}">${y}</option>`;
                });
            }
        });
}

function previewDeleteRecords() {
    const platform = document.getElementById('adminPlatformFilter').value;
    const month = document.getElementById('adminMonthFilter').value;
    const year = document.getElementById('adminYearFilter').value;

    showLoading();
    fetch('/api/admin/preview-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform, month, year })
    })
        .then(res => res.json())
        .then(data => {
            hideLoading();
            if (data.success) {
                deletePreviewData = data.records;
                const tbody = document.getElementById('deletePreviewBody');
                document.getElementById('deleteRecordCount').textContent = data.count;

                if (data.count === 0) {
                    tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;">No records match the selected filters</td></tr>';
                    document.getElementById('deleteFilteredBtn').style.display = 'none';
                } else {
                    let html = '';
                    // Show max 100 rows in preview
                    const preview = data.records.slice(0, 100);
                    preview.forEach(row => {
                        html += `<tr>
                        <td>${escapeHtml(row.Platform)}</td>
                        <td>${escapeHtml(row['Platform ID'])}</td>
                        <td>${escapeHtml(row['Bundle ID'])}</td>
                        <td>${escapeHtml(row['Product Name'])}</td>
                        <td>${formatNumber(row['Shipped Units'])}</td>
                        <td>${getMonthName(row['Month'])}</td>
                        <td>${row['Year']}</td>
                    </tr>`;
                    });
                    if (data.count > 100) {
                        html += `<tr><td colspan="7" style="text-align: center; color: #6c757d;">... and ${data.count - 100} more records</td></tr>`;
                    }
                    tbody.innerHTML = html;
                    document.getElementById('deleteFilteredBtn').style.display = 'inline-flex';
                }
                document.getElementById('deletePreviewSection').style.display = 'block';
                document.getElementById('cancelDeleteBtn').style.display = 'inline-flex';
            } else {
                showToast(data.message || 'Error loading preview', 'error');
            }
        })
        .catch(error => { hideLoading(); handleError(error); });
}

function deleteFilteredRecords() {
    const platform = document.getElementById('adminPlatformFilter').value;
    const month = document.getElementById('adminMonthFilter').value;
    const year = document.getElementById('adminYearFilter').value;
    const count = document.getElementById('deleteRecordCount').textContent;

    let filterDesc = [];
    if (platform) filterDesc.push(`Platform: ${platform}`);
    if (month) filterDesc.push(`Month: ${getMonthName(month)}`);
    if (year) filterDesc.push(`Year: ${year}`);
    const filterText = filterDesc.length > 0 ? filterDesc.join(', ') : 'ALL matching records';

    if (!confirm(`⚠️ WARNING: You are about to DELETE ${count} records!\n\nFilters: ${filterText}\n\nThis action CANNOT be undone. Are you sure?`)) return;
    if (!confirm(`🔴 FINAL CONFIRMATION: Delete ${count} records permanently?`)) return;

    showLoading();
    fetch('/api/admin/delete-filtered', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform, month, year })
    })
        .then(res => res.json())
        .then(result => {
            hideLoading();
            if (result.success) {
                showToast(result.message, 'success');
                cancelDeletePreview();
                loadFilterOptions();
                loadDashboard();
            } else {
                showToast(result.message || 'Delete failed', 'error');
            }
        })
        .catch(error => { hideLoading(); handleError(error); });
}

function deleteAllData() {
    fetch('/api/dashboard')
        .then(res => res.json())
        .then(data => {
            const totalRecords = data.totalRecords || 0;
            if (totalRecords === 0) {
                showToast('No data to delete', 'warning');
                return;
            }
            if (!confirm(`⚠️ DANGER: You are about to DELETE ALL ${totalRecords} records from the database!\n\nThis action CANNOT be undone.\n\nAre you absolutely sure?`)) return;
            if (!confirm(`🔴 FINAL CONFIRMATION: Permanently delete all ${totalRecords} records?`)) return;

            showLoading();
            fetch('/api/admin/delete-all', { method: 'DELETE' })
                .then(res => res.json())
                .then(result => {
                    hideLoading();
                    if (result.success) {
                        showToast(result.message, 'success');
                        cancelDeletePreview();
                        loadFilterOptions();
                        loadDashboard();
                    } else {
                        showToast(result.message || 'Delete failed', 'error');
                    }
                })
                .catch(error => { hideLoading(); handleError(error); });
        });
}

function cancelDeletePreview() {
    document.getElementById('deletePreviewSection').style.display = 'none';
    document.getElementById('deleteFilteredBtn').style.display = 'none';
    document.getElementById('cancelDeleteBtn').style.display = 'none';
    document.getElementById('deletePreviewBody').innerHTML = '';
    deletePreviewData = [];
}

// Admin event listeners
document.addEventListener('DOMContentLoaded', function () {
    const previewBtn = document.getElementById('previewDeleteBtn');
    if (previewBtn) previewBtn.addEventListener('click', previewDeleteRecords);

    const deleteFilteredBtn = document.getElementById('deleteFilteredBtn');
    if (deleteFilteredBtn) deleteFilteredBtn.addEventListener('click', deleteFilteredRecords);

    const deleteAllBtn = document.getElementById('deleteAllBtn');
    if (deleteAllBtn) deleteAllBtn.addEventListener('click', deleteAllData);

    const cancelBtn = document.getElementById('cancelDeleteBtn');
    if (cancelBtn) cancelBtn.addEventListener('click', cancelDeletePreview);

    const backupBtn = document.getElementById('backupDatabaseBtn');
    if (backupBtn) backupBtn.addEventListener('click', backupDatabase);
});

function backupDatabase() {
    showToast('Preparing database backup...', 'success');

    // Create hidden download link
    const link = document.createElement('a');
    link.href = '/api/admin/backup';
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Update last backup info
    const now = new Date();
    const timeStr = now.toLocaleString();
    const infoSpan = document.getElementById('lastBackupInfo');
    if (infoSpan) {
        infoSpan.innerHTML = `<i class="fas fa-check-circle" style="color: #4caf50;"></i> Last backup: ${timeStr}`;
    }

    setTimeout(() => {
        showToast('Database backup download started!', 'success');
    }, 500);
}
