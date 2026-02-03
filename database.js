// ==================== Pagination Helpers ====================
function getAllDataPaginated(platform = 'All', page = 1, limit = 25) {
  let sql = 'SELECT * FROM sales_records';
  let params = [];
  if (platform && platform !== 'All') {
    sql += ' WHERE platform = ?';
    params.push(platform);
  }
  sql += ' ORDER BY id DESC';
  // Get total count
  let countSql = 'SELECT COUNT(*) as total FROM sales_records';
  let countParams = [];
  if (platform && platform !== 'All') {
    countSql += ' WHERE platform = ?';
    countParams.push(platform);
  }
  const total = runQuery(countSql, countParams)[0]?.total || 0;
  // Pagination
  sql += ' LIMIT ? OFFSET ?';
  params.push(limit, (page - 1) * limit);
  const results = runQuery(sql, params).map(formatRecord);
  return { results, total };
}

function advancedSearchPaginated(criteria, page = 1, limit = 25) {
  let sql = 'SELECT * FROM sales_records WHERE 1=1';
  const params = [];

  if (criteria.platform && criteria.platform !== 'All') {
    sql += ' AND platform = ?';
    params.push(criteria.platform);
  }

  if (criteria.query) {
    sql += ` AND (platform_id LIKE ? OR bundle_id LIKE ? OR parent_ean LIKE ? OR product_name LIKE ?)`;
    const term = `%${criteria.query}%`;
    params.push(term, term, term, term);
  }

  if (criteria.bundleId && criteria.bundleId !== 'All') {
    sql += ' AND bundle_id = ?';
    params.push(criteria.bundleId);
  }

  if (criteria.parentEan && criteria.parentEan !== 'All') {
    sql += ' AND parent_ean = ?';
    params.push(criteria.parentEan);
  }

  if (criteria.month && criteria.month !== 'All') {
    sql += ' AND month = ?';
    params.push(parseInt(criteria.month));
  }

  if (criteria.year && criteria.year !== 'All') {
    sql += ' AND year = ?';
    params.push(parseInt(criteria.year));
  }

  if (criteria.startYear && criteria.endYear) {
    const startMonth = parseInt(criteria.startMonth) || 1;
    const endMonth = parseInt(criteria.endMonth) || 12;
    const startYear = parseInt(criteria.startYear);
    const endYear = parseInt(criteria.endYear);
    sql += ` AND ((year * 100 + month) >= ? AND (year * 100 + month) <= ?)`;
    params.push(startYear * 100 + startMonth, endYear * 100 + endMonth);
  }

  // Get total count
  let countSql = 'SELECT COUNT(*) as total FROM sales_records WHERE 1=1';
  const countParams = [];
  if (criteria.platform && criteria.platform !== 'All') {
    countSql += ' AND platform = ?';
    countParams.push(criteria.platform);
  }
  if (criteria.query) {
    countSql += ` AND (platform_id LIKE ? OR bundle_id LIKE ? OR parent_ean LIKE ? OR product_name LIKE ?)`;
    const term = `%${criteria.query}%`;
    countParams.push(term, term, term, term);
  }
  if (criteria.bundleId && criteria.bundleId !== 'All') {
    countSql += ' AND bundle_id = ?';
    countParams.push(criteria.bundleId);
  }
  if (criteria.parentEan && criteria.parentEan !== 'All') {
    countSql += ' AND parent_ean = ?';
    countParams.push(criteria.parentEan);
  }
  if (criteria.month && criteria.month !== 'All') {
    countSql += ' AND month = ?';
    countParams.push(parseInt(criteria.month));
  }
  if (criteria.year && criteria.year !== 'All') {
    countSql += ' AND year = ?';
    countParams.push(parseInt(criteria.year));
  }
  if (criteria.startYear && criteria.endYear) {
    const startMonth = parseInt(criteria.startMonth) || 1;
    const endMonth = parseInt(criteria.endMonth) || 12;
    const startYear = parseInt(criteria.startYear);
    const endYear = parseInt(criteria.endYear);
    countSql += ` AND ((year * 100 + month) >= ? AND (year * 100 + month) <= ?)`;
    countParams.push(startYear * 100 + startMonth, endYear * 100 + endMonth);
  }
  sql += ' ORDER BY id DESC LIMIT ? OFFSET ?';
  params.push(limit, (page - 1) * limit);
  const total = runQuery(countSql, countParams)[0]?.total || 0;
  const results = runQuery(sql, params).map(formatRecord);
  return { results, total };
}
/**
 * Database Module - SQLite Setup using sql.js
 * Replaces Google Sheets with local SQLite database
 */

const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

// Database file location
const DB_PATH = path.join(__dirname, 'sales_data.db');

let db = null;

// Initialize database
async function initializeDatabase() {
  const SQL = await initSqlJs();

  // Load existing database or create new one
  try {
    if (fs.existsSync(DB_PATH)) {
      const fileBuffer = fs.readFileSync(DB_PATH);
      db = new SQL.Database(fileBuffer);
      console.log('✅ Loaded existing database');
    } else {
      db = new SQL.Database();
      console.log('✅ Created new database');
    }
  } catch (err) {
    db = new SQL.Database();
    console.log('✅ Created new database (fresh start)');
  }

  // Create tables
  db.run(`
    CREATE TABLE IF NOT EXISTS sales_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      platform TEXT NOT NULL,
      platform_id TEXT,
      bundle_id TEXT,
      parent_ean TEXT,
      product_name TEXT,
      shipped_units INTEGER DEFAULT 0,
      month INTEGER,
      year INTEGER,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create indexes
  db.run('CREATE INDEX IF NOT EXISTS idx_platform ON sales_records(platform)');
  db.run('CREATE INDEX IF NOT EXISTS idx_bundle_id ON sales_records(bundle_id)');
  db.run('CREATE INDEX IF NOT EXISTS idx_parent_ean ON sales_records(parent_ean)');

  // Platforms table
  db.run(`
    CREATE TABLE IF NOT EXISTS platforms (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL
    )
  `);

  // Insert default platforms
  const defaultPlatforms = ['Amazon', 'Flipkart', 'Meesho', 'Myntra', 'JioMart', 'Snapdeal', 'Other'];
  defaultPlatforms.forEach(p => {
    try { db.run('INSERT OR IGNORE INTO platforms (name) VALUES (?)', [p]); } catch (e) { }
  });

  saveDatabase();
  console.log('✅ Database initialized successfully');
  return db;
}

// Save database to file
function saveDatabase() {
  if (!db) return;
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(DB_PATH, buffer);
}

// Helper to run query and return results
function runQuery(sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const results = [];
  while (stmt.step()) {
    results.push(stmt.getAsObject());
  }
  stmt.free();
  return results;
}

// ==================== Platform Operations ====================
function getPlatforms() {
  const results = runQuery('SELECT name FROM platforms ORDER BY name');
  return results.map(row => row.name);
}

// ==================== Record Operations ====================
function uploadRecords(platform, records) {
  try {
    db.run('BEGIN TRANSACTION');

    const stmt = db.prepare(`
      INSERT INTO sales_records (platform, platform_id, bundle_id, parent_ean, product_name, shipped_units, month, year)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    records.forEach(record => {
      stmt.run([
        platform,
        record.platformId || '',
        record.bundleId || '',
        record.parentEan || '',
        record.productName || '',
        record.shippedUnits || 0,
        record.month || new Date().getMonth() + 1,
        record.year || new Date().getFullYear()
      ]);
    });

    stmt.free();
    db.run('COMMIT');

    // Save to disk after the bulk operation
    saveDatabase();
    return { success: true, message: `Uploaded ${records.length} records to ${platform}` };

  } catch (error) {
    db.run('ROLLBACK');
    console.error('Upload failed:', error);
    throw new Error('Database error during bulk upload: ' + error.message);
  }
}

function formatRecord(row) {
  return {
    id: row.id,
    rowIndex: row.id,
    Platform: row.platform,
    'Platform ID': row.platform_id,
    'Bundle ID': row.bundle_id,
    'Parent EAN': row.parent_ean,
    'Product Name': row.product_name,
    'Shipped Units': row.shipped_units,
    'Month': row.month,
    'Year': row.year
  };
}

function getAllData(platform = 'All') {
  let sql = 'SELECT * FROM sales_records';
  let params = [];
  if (platform && platform !== 'All') {
    sql += ' WHERE platform = ?';
    params.push(platform);
  }
  sql += ' ORDER BY id DESC';
  return runQuery(sql, params).map(formatRecord);
}

function advancedSearch(criteria) {
  let sql = 'SELECT * FROM sales_records WHERE 1=1';
  const params = [];

  if (criteria.platform && criteria.platform !== 'All') {
    sql += ' AND platform = ?';
    params.push(criteria.platform);
  }

  if (criteria.query) {
    sql += ` AND (platform_id LIKE ? OR bundle_id LIKE ? OR parent_ean LIKE ? OR product_name LIKE ?)`;
    const term = `%${criteria.query}%`;
    params.push(term, term, term, term);
  }

  if (criteria.bundleId && criteria.bundleId !== 'All') {
    sql += ' AND bundle_id = ?';
    params.push(criteria.bundleId);
  }

  if (criteria.parentEan && criteria.parentEan !== 'All') {
    sql += ' AND parent_ean = ?';
    params.push(criteria.parentEan);
  }

  if (criteria.month && criteria.month !== 'All') {
    sql += ' AND month = ?';
    params.push(parseInt(criteria.month));
  }

  if (criteria.year && criteria.year !== 'All') {
    sql += ' AND year = ?';
    params.push(parseInt(criteria.year));
  }

  if (criteria.startYear && criteria.endYear) {
    const startMonth = parseInt(criteria.startMonth) || 1;
    const endMonth = parseInt(criteria.endMonth) || 12;
    const startYear = parseInt(criteria.startYear);
    const endYear = parseInt(criteria.endYear);
    sql += ` AND ((year * 100 + month) >= ? AND (year * 100 + month) <= ?)`;
    params.push(startYear * 100 + startMonth, endYear * 100 + endMonth);
  }

  sql += ' ORDER BY id DESC';
  return runQuery(sql, params).map(formatRecord);
}

function updateRecord(id, record) {
  db.run(`
    UPDATE sales_records
    SET platform_id = ?, bundle_id = ?, parent_ean = ?, product_name = ?, shipped_units = ?, month = ?, year = ?
    WHERE id = ?
  `, [
    record.platformId || '',
    record.bundleId || '',
    record.parentEan || '',
    record.productName || '',
    record.shippedUnits || 0,
    record.month,
    record.year,
    id
  ]);
  saveDatabase();
  return { success: true, message: 'Record updated successfully' };
}

function deleteRecord(id) {
  db.run('DELETE FROM sales_records WHERE id = ?', [id]);
  saveDatabase();
  return { success: true, message: 'Record deleted successfully' };
}

// ==================== Dashboard & Analytics ====================
function getDashboardStats() {
  const totalStats = runQuery('SELECT COUNT(*) as totalRecords, COALESCE(SUM(shipped_units), 0) as totalShippedUnits FROM sales_records')[0] || { totalRecords: 0, totalShippedUnits: 0 };
  const platformCountResult = runQuery('SELECT COUNT(DISTINCT platform) as count FROM sales_records')[0] || { count: 0 };

  const platformStatsRows = runQuery('SELECT platform, COUNT(*) as recordCount, SUM(shipped_units) as shippedUnits FROM sales_records GROUP BY platform');
  const platformStats = {};
  platformStatsRows.forEach(row => {
    platformStats[row.platform] = { recordCount: row.recordCount, shippedUnits: row.shippedUnits || 0 };
  });

  const topProducts = runQuery(`
    SELECT parent_ean as parentEan, product_name as productName, bundle_id as bundleId, SUM(shipped_units) as shippedUnits
    FROM sales_records WHERE parent_ean IS NOT NULL AND parent_ean != ''
    GROUP BY parent_ean ORDER BY shippedUnits DESC LIMIT 10
  `);

  const bundleStatsRows = runQuery(`
    SELECT bundle_id, SUM(shipped_units) as shippedUnits, COUNT(*) as productCount
    FROM sales_records WHERE bundle_id IS NOT NULL AND bundle_id != '' GROUP BY bundle_id
  `);
  const bundleStats = {};
  bundleStatsRows.forEach(row => {
    bundleStats[row.bundle_id] = { shippedUnits: row.shippedUnits || 0, productCount: row.productCount };
  });

  return {
    totalRecords: totalStats.totalRecords,
    totalShippedUnits: totalStats.totalShippedUnits,
    platformCount: platformCountResult.count,
    platformStats,
    topProducts,
    bundleStats
  };
}

function getFilterOptions() {
  const platforms = getPlatforms();
  const bundleIds = runQuery("SELECT DISTINCT bundle_id FROM sales_records WHERE bundle_id IS NOT NULL AND bundle_id != '' ORDER BY bundle_id").map(r => r.bundle_id);
  const parentEans = runQuery("SELECT DISTINCT parent_ean FROM sales_records WHERE parent_ean IS NOT NULL AND parent_ean != '' ORDER BY parent_ean").map(r => r.parent_ean);

  const currentYear = new Date().getFullYear();
  const years = [];
  for (let y = currentYear + 1; y >= currentYear - 5; y--) years.push(y);

  const months = [
    { value: 1, name: 'January' }, { value: 2, name: 'February' }, { value: 3, name: 'March' },
    { value: 4, name: 'April' }, { value: 5, name: 'May' }, { value: 6, name: 'June' },
    { value: 7, name: 'July' }, { value: 8, name: 'August' }, { value: 9, name: 'September' },
    { value: 10, name: 'October' }, { value: 11, name: 'November' }, { value: 12, name: 'December' }
  ];

  return { platforms, bundleIds, parentEans, years, months };
}

// ==================== Admin Functions ====================
function deleteByFilter(platform, month, year) {
  let sql = 'DELETE FROM sales_records WHERE 1=1';
  const params = [];

  if (platform) {
    sql += ' AND platform = ?';
    params.push(platform);
  }
  if (month) {
    sql += ' AND month = ?';
    params.push(parseInt(month));
  }
  if (year) {
    sql += ' AND year = ?';
    params.push(parseInt(year));
  }

  // Get count before deleting
  let countSql = sql.replace('DELETE FROM', 'SELECT COUNT(*) as count FROM');
  const countResult = runQuery(countSql, params)[0] || { count: 0 };
  const deletedCount = countResult.count;

  // Perform deletion
  db.run(sql, params);
  saveDatabase();

  return {
    success: true,
    message: `Successfully deleted ${deletedCount} records`,
    deletedCount
  };
}

function deleteAllRecords() {
  const countResult = runQuery('SELECT COUNT(*) as count FROM sales_records')[0] || { count: 0 };
  const deletedCount = countResult.count;

  db.run('DELETE FROM sales_records');
  saveDatabase();

  return {
    success: true,
    message: `Successfully deleted all ${deletedCount} records`,
    deletedCount
  };
}

// Search with no pagination for delete preview
function searchRecords(criteria) {
  let sql = 'SELECT * FROM sales_records WHERE 1=1';
  const params = [];

  if (criteria.platform && criteria.platform !== 'All') {
    sql += ' AND platform = ?';
    params.push(criteria.platform);
  }

  if (criteria.month) {
    sql += ' AND month = ?';
    params.push(parseInt(criteria.month));
  }

  if (criteria.year) {
    sql += ' AND year = ?';
    params.push(parseInt(criteria.year));
  }

  sql += ' ORDER BY id DESC';
  const results = runQuery(sql, params).map(formatRecord);
  return { results, total: results.length };
}

module.exports = {
  initializeDatabase,
  getPlatforms,
  uploadRecords,
  getAllData,
  advancedSearch,
  getAllDataPaginated,
  advancedSearchPaginated,
  updateRecord,
  deleteRecord,
  getDashboardStats,
  getFilterOptions,
  deleteByFilter,
  deleteAllRecords,
  searchRecords
};
