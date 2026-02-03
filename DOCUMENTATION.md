# Kuber Industries Sales Data Analyzer
## Complete Documentation

---

## 📋 Table of Contents
1. [Overview](#overview)
2. [Tech Stack](#tech-stack)
3. [Features](#features)
4. [System Requirements](#system-requirements)
5. [Installation](#installation)
6. [Usage Guide](#usage-guide)
7. [API Reference](#api-reference)
8. [Database Schema](#database-schema)
9. [File Structure](#file-structure)
10. [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

**Kuber Industries Sales Data Analyzer** is a comprehensive web-based application designed to manage, analyze, and report sales data across multiple e-commerce platforms (Amazon, Flipkart, Meesho, etc.). It provides a centralized dashboard for tracking shipped units, generating reports, and managing product data.

### Key Capabilities
- Multi-platform sales data management
- Bulk upload from Excel/CSV files
- Advanced search with multiple filters
- Detailed reports with export options
- Admin panel for data management
- Database backup functionality

---

## 🛠️ Tech Stack

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| **Node.js** | 18.x+ | JavaScript runtime environment |
| **Express.js** | 4.x | Web application framework |
| **better-sqlite3** | 9.x | SQLite database driver (synchronous) |
| **multer** | 1.x | File upload middleware |
| **xlsx** | 0.18.x | Excel file parsing |

### Frontend
| Technology | Purpose |
|------------|---------|
| **HTML5** | Page structure and semantic markup |
| **CSS3** | Styling with CSS variables and Flexbox/Grid |
| **Vanilla JavaScript** | Application logic and DOM manipulation |
| **Font Awesome** | Icon library |
| **Google Fonts (Poppins)** | Typography |
| **SheetJS (XLSX)** | Client-side Excel parsing |

### Database
| Technology | Purpose |
|------------|---------|
| **SQLite** | Lightweight, serverless relational database |
| **File**: `kuber_sales.db` | Single-file database storage |

### Development & Deployment
| Tool | Purpose |
|------|---------|
| **Batch Scripts (.bat)** | Windows automation scripts |
| **Git** | Version control |
| **Ngrok** | Public URL tunneling (optional) |

---

## ✨ Features

### 1. Dashboard
- Total records, platforms, shipped units overview
- Platform-wise statistics
- Top 10 products ranking
- Real-time data refresh

### 2. Search & Analyze
- Full-text search across all fields
- Filter by Platform, Bundle ID, Parent EAN
- Date filters: Month-wise, Year-wise, Custom Range
- Pagination with customizable page size (25-1000)
- Export results to Excel

### 3. Upload Data
- **Single Record Entry**: Manual form input
- **Bulk Upload**: Excel (.xlsx, .xls) and CSV file support
- **Drag & Drop**: Intuitive file upload
- **Progress Tracking**: Real-time extraction and upload progress
- Auto-detection of record count

### 4. Generate Reports
- Custom date range reports
- Platform-specific reports
- Export to Excel and CSV formats
- Summary statistics

### 5. View All Data
- Complete database view
- Platform filtering
- Edit and delete individual records
- Pagination controls

### 6. Admin Panel
- **Database Backup**: Download complete database backup
- **Filtered Delete**: Delete records by platform/month/year
- **Preview Before Delete**: See exactly what will be deleted
- **Delete All**: Complete database wipe (with confirmations)

---

## 💻 System Requirements

### Minimum Requirements
- **OS**: Windows 10/11
- **RAM**: 4 GB
- **Disk Space**: 500 MB free
- **Node.js**: Version 18.x or higher

### Recommended
- **RAM**: 8 GB+
- **Modern Browser**: Chrome, Firefox, Edge (latest versions)

---

## 📥 Installation

### Quick Install
1. Download or clone the project
2. Run `setup_project.bat` (first time only)
3. Run `start.bat` to launch

### Manual Install
```bash
# Install Node.js dependencies
npm install

# Start the server
node server.js
```

### Create Desktop Shortcut
```
Run: create_shortcut.bat
```

---

## 📖 Usage Guide

### Starting the Application
1. Double-click `start.bat` or desktop shortcut
2. Browser opens automatically to `http://localhost:3000`
3. Login with credentials: **admin** / **admin123**

### Uploading Data
1. Go to **Upload Data**
2. Select Platform from dropdown
3. Either:
   - Drag & drop Excel/CSV file
   - Click to browse and select file
   - Paste CSV data directly
4. Click **Upload to Platform Sheet**

### Excel Format Required
| Platform ID | Bundle ID | Parent EAN | Product Name | Shipped Units | Month | Year |
|-------------|-----------|------------|--------------|---------------|-------|------|
| B0ABC123 | KI-BDL-001 | 8901234567890 | Storage Box | 50 | 1 | 2026 |

> **Note**: Month should be 1-12 (January=1, December=12)

### Generating Reports
1. Go to **Generate Reports**
2. Select filters (Platform, Date Range)
3. Click **Preview Report**
4. Download as Excel or CSV

### Backing Up Database
1. Go to **Admin Panel**
2. Click **Download Database Backup**
3. Save the `.db` file safely

---

## 🔌 API Reference

### Dashboard
```
GET /api/dashboard
Response: { totalRecords, totalPlatforms, totalShippedUnits, platformStats, topProducts }
```

### Search
```
POST /api/search?page=1&limit=200
Body: { query, platform, bundleId, parentEan, month, year }
Response: { results, total, page, limit }
```

### Upload
```
POST /api/upload/single - Single record
POST /api/upload/bulk - Bulk array data
POST /api/upload/csv - CSV text data
```

### Records
```
GET /api/data - All records (paginated)
PUT /api/records/:id - Update record
DELETE /api/records/:id - Delete record
```

### Admin
```
POST /api/admin/preview-delete - Preview records to delete
POST /api/admin/delete-filtered - Delete by filters
DELETE /api/admin/delete-all - Delete all records
GET /api/admin/backup - Download database backup
```

---

## 🗄️ Database Schema

### Table: `sales_records`
| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary key, auto-increment |
| platform | TEXT | E-commerce platform name |
| platform_id | TEXT | Platform-specific product ID |
| bundle_id | TEXT | Internal bundle identifier |
| parent_ean | TEXT | Parent EAN/barcode |
| product_name | TEXT | Product description |
| shipped_units | INTEGER | Number of units shipped |
| month | INTEGER | Month (1-12) |
| year | INTEGER | Year (YYYY) |
| created_at | DATETIME | Record creation timestamp |

### Indexes
- `idx_platform` on platform
- `idx_month_year` on (month, year)
- `idx_bundle_id` on bundle_id

---

## 📁 File Structure

```
kuber-sales-analyzer/
├── public/                 # Frontend files
│   ├── index.html         # Main HTML page
│   ├── app.js             # JavaScript application
│   ├── styles.css         # CSS styles
│   └── logo.png           # Application logo
├── server.js              # Express server & API routes
├── database.js            # SQLite database operations
├── package.json           # Node.js dependencies
├── kuber_sales.db         # SQLite database file
├── start.bat              # Professional single-window launcher
├── setup_project.bat      # First-time setup script
├── create_shortcut.bat    # Desktop shortcut creator
├── run_app.bat            # Alternative launcher with Ngrok
└── README.md              # This documentation
```

---

## 🔧 Troubleshooting

### Server Won't Start
```
Error: EADDRINUSE
Solution: Another process is using port 3000. Close it or change the port.
```

### Excel Upload Fails
```
Issue: Month shows as January for all records
Solution: Ensure Month column contains numbers 1-12 or text names
```

### Database Error
```
Issue: Database locked or corrupted
Solution: Stop server, restore from backup, restart
```

### Slow Performance
```
Issue: Large dataset loading slowly
Solution: Use pagination (set 200-500 per page instead of 1000)
```

---

## 📞 Support

For technical support or feature requests, please contact the development team.

---

## 📄 License

Proprietary software. All rights reserved.
© 2026 Kuber Industries

---

**Version**: 1.0.0  
**Last Updated**: February 2026
