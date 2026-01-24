/**
 * Kuber Industries - Sales Data Analyzer
 * Google Apps Script Web Application
 * 
 * Sheet Structure:
 * - Each sheet = One Platform (Amazon, Flipkart, Meesho, etc.)
 * - Column A: Platform Unique ID (platform's order/item ID - different for each platform)
 * - Column B: Bundle ID (Kuber's bundle identifier - can vary across platforms)
 * - Column C: Parent EAN (Kuber's UNIQUE product identifier - SAME across ALL platforms)
 * - Column D: Product Name
 * - Column E: Shipped Units
 * - Column F: Month (1-12)
 * - Column G: Year (e.g., 2024, 2025)
 */

// ================== CONFIGURATION ==================
const CONFIG = {
  SPREADSHEET_ID: '1T1QSKDXkS1Kb1IORJOMqAQJXgGRPNKzAV0XypDlR3Ao', // Your Google Sheet ID
  ADMIN_EMAILS: ['admin@kuberindustries.com'], // Add admin email addresses
  TIMEZONE: 'Asia/Kolkata',
  MONTHS: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
};

// ================== WEB APP ENDPOINTS ==================

/**
 * Serves the web application HTML
 */
function doGet(e) {
  return HtmlService.createTemplateFromFile('Index')
    .evaluate()
    .setTitle('Kuber Industries - Sales Analyzer')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

/**
 * Include HTML files (for modular code)
 */
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

// ================== SPREADSHEET OPERATIONS ==================

/**
 * Get or create the main spreadsheet
 */
function getSpreadsheet() {
  if (CONFIG.SPREADSHEET_ID) {
    return SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  }
  // Create new spreadsheet if ID not set
  const ss = SpreadsheetApp.create('Kuber Industries Sales Data');
  Logger.log('Created new spreadsheet with ID: ' + ss.getId());
  return ss;
}

/**
 * Initialize sheets for all platforms
 */
function initializePlatformSheets() {
  const ss = getSpreadsheet();
  const platforms = ['Amazon', 'Flipkart', 'Meesho', 'Myntra', 'JioMart', 'Snapdeal', 'Other'];
  const headers = [
    'Platform ID',
    'Bundle ID', 
    'Parent EAN',
    'Product Name',
    'Shipped Units',
    'Month',
    'Year'
  ];
  
  platforms.forEach(platform => {
    let sheet = ss.getSheetByName(platform);
    if (!sheet) {
      sheet = ss.insertSheet(platform);
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      sheet.getRange(1, 1, 1, headers.length)
        .setBackground('#1a73e8')
        .setFontColor('white')
        .setFontWeight('bold');
      sheet.setFrozenRows(1);
    }
  });
  
  // Delete default Sheet1 if exists
  const defaultSheet = ss.getSheetByName('Sheet1');
  if (defaultSheet && ss.getSheets().length > 1) {
    ss.deleteSheet(defaultSheet);
  }
  
  return 'Initialized successfully! Spreadsheet ID: ' + ss.getId();
}

/**
 * Get all platform names
 */
function getPlatforms() {
  const ss = getSpreadsheet();
  return ss.getSheets().map(sheet => sheet.getName());
}

/**
 * Get all data from a specific platform
 */
function getPlatformData(platform) {
  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName(platform);
  if (!sheet) return [];
  
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];
  
  const headers = data[0];
  return data.slice(1).map((row, index) => {
    const obj = { rowIndex: index + 2 }; // +2 for header and 0-index
    headers.forEach((header, i) => {
      obj[header] = row[i];
    });
    return obj;
  });
}

/**
 * Get all data across all platforms
 */
function getAllData() {
  const platforms = getPlatforms();
  const allData = [];
  
  platforms.forEach(platform => {
    const data = getPlatformData(platform);
    data.forEach(row => {
      row.Platform = platform;
      allData.push(row);
    });
  });
  
  return allData;
}

// ================== UPLOAD/IMPORT OPERATIONS ==================

/**
 * Upload records to a specific platform sheet
 */
function uploadRecords(platform, records) {
  const ss = getSpreadsheet();
  let sheet = ss.getSheetByName(platform);
  
  if (!sheet) {
    // Create sheet if doesn't exist
    sheet = ss.insertSheet(platform);
    const headers = ['Platform ID', 'Bundle ID', 'Parent EAN', 'Product Name', 'Shipped Units', 'Month', 'Year'];
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(1, 1, 1, headers.length)
      .setBackground('#1a73e8')
      .setFontColor('white')
      .setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();
  
  const lastRow = sheet.getLastRow();
  const dataToInsert = records.map(record => [
    record.platformId || '',
    record.bundleId || '',
    record.parentEan || '',
    record.productName || '',
    record.shippedUnits || 0,
    record.month || currentMonth,
    record.year || currentYear
  ]);
  
  if (dataToInsert.length > 0) {
    sheet.getRange(lastRow + 1, 1, dataToInsert.length, 7).setValues(dataToInsert);
  }
  
  return { success: true, message: `Uploaded ${records.length} records to ${platform}` };
}

/**
 * Upload single record
 */
function uploadSingleRecord(platform, record) {
  return uploadRecords(platform, [record]);
}

/**
 * Bulk upload from parsed CSV/Excel data
 */
function bulkUpload(platform, csvData) {
  try {
    const lines = csvData.split('\n');
    const records = [];
    
    // Skip header if present
    const startIndex = lines[0].toLowerCase().includes('platform') ? 1 : 0;
    
    for (let i = startIndex; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      if (values.length >= 4 && values[0]) {
        const now = new Date();
        records.push({
          platformId: values[0],
          bundleId: values[1] || '',
          parentEan: values[2] || '',
          productName: values[3] || '',
          shippedUnits: parseInt(values[4]) || 0,
          month: parseInt(values[5]) || (now.getMonth() + 1),
          year: parseInt(values[6]) || now.getFullYear()
        });
      }
    }
    
    return uploadRecords(platform, records);
  } catch (error) {
    return { success: false, message: 'Error parsing data: ' + error.message };
  }
}

/**
 * Upload from Excel/CSV file data (2D array)
 */
function uploadFromFile(platform, dataArray) {
  try {
    const records = [];
    const now = new Date();
    
    // Skip header row if present
    const startIndex = (dataArray[0] && String(dataArray[0][0]).toLowerCase().includes('platform')) ? 1 : 0;
    
    for (let i = startIndex; i < dataArray.length; i++) {
      const row = dataArray[i];
      if (row && row[0]) {
        records.push({
          platformId: String(row[0] || ''),
          bundleId: String(row[1] || ''),
          parentEan: String(row[2] || ''),
          productName: String(row[3] || ''),
          shippedUnits: parseInt(row[4]) || 0,
          month: parseInt(row[5]) || (now.getMonth() + 1),
          year: parseInt(row[6]) || now.getFullYear()
        });
      }
    }
    
    if (records.length === 0) {
      return { success: false, message: 'No valid records found in the file' };
    }
    
    return uploadRecords(platform, records);
  } catch (error) {
    return { success: false, message: 'Error processing file: ' + error.message };
  }
}

// ================== SEARCH OPERATIONS ==================

/**
 * Search across all platforms
 */
function searchAllPlatforms(query) {
  const allData = getAllData();
  const queryLower = query.toLowerCase();
  
  return allData.filter(row => {
    return Object.values(row).some(value => 
      String(value).toLowerCase().includes(queryLower)
    );
  });
}

/**
 * Search by specific field
 */
function searchByField(field, value, platform = null) {
  let data;
  if (platform) {
    data = getPlatformData(platform);
    data.forEach(row => row.Platform = platform);
  } else {
    data = getAllData();
  }
  
  const valueLower = value.toLowerCase();
  return data.filter(row => {
    const fieldValue = String(row[field] || '').toLowerCase();
    return fieldValue.includes(valueLower);
  });
}

/**
 * Advanced search with multiple criteria
 */
function advancedSearch(criteria) {
  let data = getAllData();
  
  // Filter by platform
  if (criteria.platform && criteria.platform !== 'All') {
    data = data.filter(row => row.Platform === criteria.platform);
  }
  
  // Filter by search query
  if (criteria.query) {
    const queryLower = criteria.query.toLowerCase();
    data = data.filter(row => 
      String(row['Platform ID']).toLowerCase().includes(queryLower) ||
      String(row['Bundle ID']).toLowerCase().includes(queryLower) ||
      String(row['Parent EAN']).toLowerCase().includes(queryLower) ||
      String(row['Product Name']).toLowerCase().includes(queryLower)
    );
  }
  
  // Filter by Bundle ID
  if (criteria.bundleId && criteria.bundleId !== 'All') {
    data = data.filter(row => row['Bundle ID'] === criteria.bundleId);
  }
  
  // Filter by Parent EAN
  if (criteria.parentEan && criteria.parentEan !== 'All') {
    data = data.filter(row => row['Parent EAN'] === criteria.parentEan);
  }
  
  // Filter by month
  if (criteria.month && criteria.month !== 'All') {
    const targetMonth = parseInt(criteria.month);
    data = data.filter(row => parseInt(row['Month']) === targetMonth);
  }
  
  // Filter by year
  if (criteria.year && criteria.year !== 'All') {
    const targetYear = parseInt(criteria.year);
    data = data.filter(row => parseInt(row['Year']) === targetYear);
  }
  
  // Filter by year range (for custom date range filter)
  if (criteria.startYear && criteria.endYear) {
    const startYear = parseInt(criteria.startYear);
    const endYear = parseInt(criteria.endYear);
    const startMonth = parseInt(criteria.startMonth) || 1;
    const endMonth = parseInt(criteria.endMonth) || 12;
    
    data = data.filter(row => {
      const rowYear = parseInt(row['Year']);
      const rowMonth = parseInt(row['Month']);
      
      // Create comparable values (year * 100 + month)
      const rowValue = rowYear * 100 + rowMonth;
      const startValue = startYear * 100 + startMonth;
      const endValue = endYear * 100 + endMonth;
      
      return rowValue >= startValue && rowValue <= endValue;
    });
  }
  
  return data;
}

// ================== ANALYTICS & REPORTS ==================

/**
 * Get sales summary for an item
 */
function getItemSalesSummary(searchValue) {
  const results = searchAllPlatforms(searchValue);
  
  const summary = {
    totalShippedUnits: 0,
    platformBreakdown: {}
  };
  
  results.forEach(row => {
    const units = parseInt(row['Shipped Units']) || 0;
    const platform = row.Platform;
    
    summary.totalShippedUnits += units;
    
    // Platform breakdown
    if (!summary.platformBreakdown[platform]) {
      summary.platformBreakdown[platform] = { shippedUnits: 0 };
    }
    summary.platformBreakdown[platform].shippedUnits += units;
  });
  
  summary.matchCount = results.length;
  summary.results = results;
  
  return summary;
}

/**
 * Get date range report
 */
function getDateRangeReport(startDate, endDate, platform = 'All') {
  const criteria = {
    platform: platform,
    startDate: startDate,
    endDate: endDate
  };
  
  return advancedSearch(criteria);
}

/**
 * Get dashboard statistics
 */
function getDashboardStats() {
  const allData = getAllData();
  const platforms = getPlatforms();
  
  let totalShippedUnits = 0;
  
  const platformStats = {};
  const topProducts = {};
  const bundleStats = {};
  
  allData.forEach(row => {
    const units = parseInt(row['Shipped Units']) || 0;
    const platform = row.Platform;
    const productName = row['Product Name'];
    const bundleId = row['Bundle ID'];
    const parentEan = row['Parent EAN'];
    
    totalShippedUnits += units;
    
    // Platform stats
    if (!platformStats[platform]) {
      platformStats[platform] = { shippedUnits: 0, recordCount: 0 };
    }
    platformStats[platform].shippedUnits += units;
    platformStats[platform].recordCount++;
    
    // Top products by Parent EAN
    if (parentEan) {
      if (!topProducts[parentEan]) {
        topProducts[parentEan] = { shippedUnits: 0, productName: productName || parentEan, bundleId: bundleId };
      }
      topProducts[parentEan].shippedUnits += units;
    }
    
    // Bundle stats
    if (bundleId) {
      if (!bundleStats[bundleId]) {
        bundleStats[bundleId] = { shippedUnits: 0, productCount: 0 };
      }
      bundleStats[bundleId].shippedUnits += units;
      bundleStats[bundleId].productCount++;
    }
  });
  
  // Sort top products
  const topProductsArray = Object.entries(topProducts)
    .map(([ean, stats]) => ({ parentEan: ean, ...stats }))
    .sort((a, b) => b.shippedUnits - a.shippedUnits)
    .slice(0, 10);
  
  return {
    totalShippedUnits,
    totalRecords: allData.length,
    platformCount: platforms.length,
    platformStats,
    topProducts: topProductsArray,
    bundleStats
  };
}

// ================== EXPORT OPERATIONS ==================

/**
 * Generate Excel report data for download
 */
function generateExcelReport(criteria) {
  const data = advancedSearch(criteria);
  
  // Prepare data for Excel
  const headers = ['Platform', 'Platform ID', 'Bundle ID', 'Parent EAN', 
                   'Product Name', 'Shipped Units', 'Month', 'Year'];
  
  const rows = data.map(row => [
    row.Platform || '',
    row['Platform ID'] || '',
    row['Bundle ID'] || '',
    row['Parent EAN'] || '',
    row['Product Name'] || '',
    row['Shipped Units'] || 0,
    getMonthName(row['Month']) || '',
    row['Year'] || ''
  ]);
  
  return {
    headers: headers,
    data: rows,
    filename: `Sales_Report_${formatDate(new Date())}.xlsx`
  };
}

/**
 * Create downloadable CSV content
 */
function generateCSVContent(criteria) {
  const reportData = generateExcelReport(criteria);
  
  let csv = reportData.headers.join(',') + '\n';
  reportData.data.forEach(row => {
    csv += row.map(cell => {
      // Escape quotes and wrap in quotes if contains comma
      const cellStr = String(cell);
      if (cellStr.includes(',') || cellStr.includes('"')) {
        return '"' + cellStr.replace(/"/g, '""') + '"';
      }
      return cellStr;
    }).join(',') + '\n';
  });
  
  return csv;
}

// ================== UTILITY FUNCTIONS ==================

/**
 * Get month name from month number
 */
function getMonthName(monthNum) {
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                  'July', 'August', 'September', 'October', 'November', 'December'];
  const index = parseInt(monthNum) - 1;
  return months[index] || '';
}

/**
 * Get available years from data
 */
function getAvailableYears() {
  const allData = getAllData();
  const years = [...new Set(allData.map(r => parseInt(r['Year'])).filter(Boolean))];
  const currentYear = new Date().getFullYear();
  
  // Add current year and next 2 years if not present
  for (let y = currentYear - 5; y <= currentYear + 1; y++) {
    if (!years.includes(y)) years.push(y);
  }
  
  return years.sort((a, b) => b - a); // Sort descending
}

/**
 * Delete a record
 */
function deleteRecord(platform, rowIndex) {
  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName(platform);
  if (sheet && rowIndex > 1) {
    sheet.deleteRow(rowIndex);
    return { success: true, message: 'Record deleted successfully' };
  }
  return { success: false, message: 'Could not delete record' };
}

/**
 * Update a record
 */
function updateRecord(platform, rowIndex, record) {
  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName(platform);
  const now = new Date();
  
  if (sheet && rowIndex > 1) {
    const rowData = [
      record.platformId || '',
      record.bundleId || '',
      record.parentEan || '',
      record.productName || '',
      record.shippedUnits || 0,
      record.month || (now.getMonth() + 1),
      record.year || now.getFullYear()
    ];
    
    sheet.getRange(rowIndex, 1, 1, 7).setValues([rowData]);
    return { success: true, message: 'Record updated successfully' };
  }
  return { success: false, message: 'Could not update record' };
}

/**
 * Get unique values for filters
 */
function getFilterOptions() {
  const allData = getAllData();
  
  const bundleIds = [...new Set(allData.map(r => r['Bundle ID']).filter(Boolean))];
  const parentEans = [...new Set(allData.map(r => r['Parent EAN']).filter(Boolean))];
  const years = getAvailableYears();
  
  return {
    platforms: getPlatforms(),
    bundleIds: bundleIds.sort(),
    parentEans: parentEans.sort(),
    years: years,
    months: [
      { value: 1, name: 'January' },
      { value: 2, name: 'February' },
      { value: 3, name: 'March' },
      { value: 4, name: 'April' },
      { value: 5, name: 'May' },
      { value: 6, name: 'June' },
      { value: 7, name: 'July' },
      { value: 8, name: 'August' },
      { value: 9, name: 'September' },
      { value: 10, name: 'October' },
      { value: 11, name: 'November' },
      { value: 12, name: 'December' }
    ]
  };
}
