/**
 * Kuber Industries - Sales Data Analyzer
 * Express.js Local Server
 */

const express = require('express');
const cors = require('cors');
const multer = require('multer');
const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

// Import database module
const db = require('./database');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// File upload configuration
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

// Start server after database is ready
async function startServer() {
    await db.initializeDatabase();

    // Start the Express server
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

// ==================== API ROUTES ====================

// Get all platforms
app.get('/api/platforms', (req, res) => {
    try {
        const platforms = db.getPlatforms();
        res.json(platforms);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get dashboard statistics
app.get('/api/dashboard', (req, res) => {
    try {
        const stats = db.getDashboardStats();
        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get filter options
app.get('/api/filter-options', (req, res) => {
    try {
        const options = db.getFilterOptions();
        res.json(options);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Advanced search
app.post('/api/search', (req, res) => {
    try {
        const criteria = req.body;
        const results = db.advancedSearch(criteria);
        res.json(results);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all data
app.get('/api/data', (req, res) => {
    try {
        const platform = req.query.platform || 'All';
        const data = db.getAllData(platform);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Upload single record
app.post('/api/upload/single', (req, res) => {
    try {
        const { platform, record } = req.body;
        if (!platform) {
            return res.status(400).json({ success: false, message: 'Platform is required' });
        }
        const result = db.uploadRecords(platform, [record]);
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Bulk upload from file
app.post('/api/upload/file', upload.single('file'), (req, res) => {
    try {
        const platform = req.body.platform;
        if (!platform) {
            return res.status(400).json({ success: false, message: 'Platform is required' });
        }

        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }

        // Parse Excel/CSV file
        const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const dataArray = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });

        const records = parseFileData(dataArray);
        const result = db.uploadRecords(platform, records);
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Bulk upload from JSON data (parsed on client)
app.post('/api/upload/bulk', (req, res) => {
    try {
        const { platform, data } = req.body;
        if (!platform) {
            return res.status(400).json({ success: false, message: 'Platform is required' });
        }

        const records = parseFileData(data);
        const result = db.uploadRecords(platform, records);
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Bulk upload from CSV text
app.post('/api/upload/csv', (req, res) => {
    try {
        const { platform, csvData } = req.body;
        if (!platform) {
            return res.status(400).json({ success: false, message: 'Platform is required' });
        }

        const lines = csvData.split('\n');
        const dataArray = lines.map(line => line.split(',').map(cell => cell.trim()));

        const records = parseFileData(dataArray);
        const result = db.uploadRecords(platform, records);
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Parse file data array to records
function parseFileData(dataArray) {
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

    return records;
}

// Update a record
app.put('/api/record/:id', (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const record = req.body;
        const result = db.updateRecord(id, record);
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Delete a record
app.delete('/api/record/:id', (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const result = db.deleteRecord(id);
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Export to Excel
app.post('/api/export/excel', (req, res) => {
    try {
        const criteria = req.body;
        const data = db.advancedSearch(criteria);

        // Prepare data for Excel
        const headers = ['Platform', 'Platform ID', 'Bundle ID', 'Parent EAN', 'Product Name', 'Shipped Units', 'Month', 'Year'];
        const rows = data.map(row => [
            row.Platform || '',
            row['Platform ID'] || '',
            row['Bundle ID'] || '',
            row['Parent EAN'] || '',
            row['Product Name'] || '',
            row['Shipped Units'] || 0,
            getMonthName(row['Month']),
            row['Year'] || ''
        ]);

        const wsData = [headers, ...rows];
        const ws = XLSX.utils.aoa_to_sheet(wsData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Sales Report');

        const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

        res.setHeader('Content-Disposition', `attachment; filename="Sales_Report_${formatDate(new Date())}.xlsx"`);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.send(buffer);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Export to CSV
app.post('/api/export/csv', (req, res) => {
    try {
        const criteria = req.body;
        const data = db.advancedSearch(criteria);

        const headers = ['Platform', 'Platform ID', 'Bundle ID', 'Parent EAN', 'Product Name', 'Shipped Units', 'Month', 'Year'];
        let csv = headers.join(',') + '\n';

        data.forEach(row => {
            const cells = [
                row.Platform || '',
                row['Platform ID'] || '',
                row['Bundle ID'] || '',
                row['Parent EAN'] || '',
                row['Product Name'] || '',
                row['Shipped Units'] || 0,
                getMonthName(row['Month']),
                row['Year'] || ''
            ];
            csv += cells.map(cell => {
                const str = String(cell);
                if (str.includes(',') || str.includes('"')) {
                    return '"' + str.replace(/"/g, '""') + '"';
                }
                return str;
            }).join(',') + '\n';
        });

        res.setHeader('Content-Disposition', `attachment; filename="Sales_Report_${formatDate(new Date())}.csv"`);
        res.setHeader('Content-Type', 'text/csv');
        res.send(csv);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Utility functions
function getMonthName(monthNum) {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const index = parseInt(monthNum) - 1;
    return months[index] || '';
}

function formatDate(date) {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
}

// Global error handler
app.use((err, req, res, next) => {
    console.error('Server Error:', err);
    res.status(500).json({
        success: false,
        message: err.message || 'Internal Server Error'
    });
});

// Serve the main app
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
startServer().then(() => {
    console.log('');
    console.log('╔══════════════════════════════════════════════════════════════╗');
    console.log('║       Kuber Industries - Sales Data Analyzer                 ║');
    console.log('╠══════════════════════════════════════════════════════════════╣');
    console.log(`║  🌐 Local URL:    http://localhost:${PORT}                       ║`);
    console.log('║                                                              ║');
    console.log('║  📤 To share via ngrok:                                      ║');
    console.log(`║     Run: ngrok http ${PORT}                                      ║`);
    console.log('║     Then share the generated URL with others                 ║');
    console.log('╚══════════════════════════════════════════════════════════════╝');
    console.log('');
}).catch(err => {
    console.error('Failed to start server:', err);
    process.exit(1);
});
