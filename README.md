# Kuber Industries - Sales Data Analyzer
## Google Apps Script Web Application

A complete web application for tracking and analyzing sales data across multiple e-commerce platforms with search functionality and Excel report generation.

---

## 📋 Features

### 1. **Dashboard**
- Total sales and revenue statistics
- This month's sales overview
- Platform-wise sales breakdown
- Top 10 selling products

### 2. **Search & Analyze**
- Search by Product Name, Bundle ID, Parent EAN, or Platform ID
- Filter by platform, order status, and date range
- View sales summary with total quantity and revenue
- Export search results to Excel

### 3. **Upload Records**
- Add single records with form input
- Bulk upload via CSV file or paste data
- Drag and drop file upload support
- Support for Excel (.xlsx) and CSV files

### 4. **Reports & Export**
- Generate custom date range reports
- Filter by platform and order status
- Preview before download
- Export to Excel or CSV format

### 5. **View All Data**
- Browse all records with pagination
- Filter by platform
- Edit and delete records
- Real-time data refresh

---

## 🗂️ Data Structure

### Sheet Structure (One sheet per platform)
| Column | Field | Description |
|--------|-------|-------------|
| A | Platform ID | Platform's unique order/item ID |
| B | Bundle ID | Kuber's common bundle identifier |
| C | Parent EAN | Kuber's unique product identifier |
| D | Product Name | Name of the product |
| E | Shipped Units | Number of units shipped |

### Platforms (Auto-created sheets)
- Amazon
- Flipkart
- Meesho
- Myntra
- JioMart
- Snapdeal
- Other

---

## 🚀 Setup Instructions

### Step 1: Create Google Apps Script Project

1. Go to [Google Apps Script](https://script.google.com/)
2. Click **"New Project"**
3. Name it **"Kuber Industries Sales Analyzer"**

### Step 2: Add the Code Files

Create the following files in your Apps Script project:

1. **Code.gs** - Copy content from `Code.gs`
2. **Index.html** - Copy content from `Index.html`
3. **Stylesheet.html** - Copy content from `Stylesheet.html`
4. **JavaScript.html** - Copy content from `JavaScript.html`

### Step 3: Initialize the Spreadsheet

1. In Apps Script editor, select `initializePlatformSheets` from the function dropdown
2. Click **Run**
3. Grant necessary permissions when prompted
4. Check the **Execution Log** for your Spreadsheet ID
5. Copy the Spreadsheet ID and paste it in `Code.gs`:
   ```javascript
   const CONFIG = {
     SPREADSHEET_ID: 'YOUR_SPREADSHEET_ID_HERE',
     ...
   };
   ```

### Step 4: Deploy as Web App

1. Click **Deploy** → **New Deployment**
2. Click the gear icon ⚙️ → Select **"Web app"**
3. Configure:
   - **Description**: "Kuber Sales Analyzer v1.0"
   - **Execute as**: "Me"
   - **Who has access**: "Anyone" (or "Anyone within [your organization]")
4. Click **Deploy**
5. Copy the **Web app URL**

### Step 5: Access Your Web App

Open the Web app URL in your browser to start using the application!

---

## 📊 Upload Format

### Excel/CSV File Format (5 Columns)

| Platform ID | Bundle ID | Parent EAN | Product Name | Shipped Units |
|-------------|-----------|------------|--------------|---------------|
| AMZ-001-2024 | BDL-KIT-001 | EAN-KI-001 | Storage Container Set | 25 |
| FLP-002-2024 | BDL-KIT-001 | EAN-KI-002 | Spice Box Set | 15 |

### How to Upload:
1. Select the **Platform** (Amazon, Flipkart, etc.)
2. Upload your Excel/CSV file (drag & drop or click to browse)
3. Click **Upload to Platform Sheet**

The system will automatically:
- Parse the file data
- Skip header row if detected
- Add all records to the selected platform sheet

---

## 🔧 Configuration

Edit the `CONFIG` object in `Code.gs` to customize:

```javascript
const CONFIG = {
  SPREADSHEET_ID: 'your-spreadsheet-id',
  ADMIN_EMAILS: ['admin@kuberindustries.com'],
  DATE_FORMAT: 'dd/MM/yyyy',
  TIMEZONE: 'Asia/Kolkata'
};
```

---

## 📱 Mobile Support

The web app is fully responsive and works on:
- Desktop browsers
- Tablets
- Mobile phones

---

## 🔒 Security

- The app runs under your Google account permissions
- Only authorized users can access the web app
- Data is stored securely in Google Sheets

---

## 🛠️ Troubleshooting

### "Script function not found" error
- Make sure all function names match exactly
- Check for typos in function calls

### "Authorization required" error
- Re-run the `initializePlatformSheets` function
- Accept all permission requests

### Data not loading
- Check the Spreadsheet ID in CONFIG
- Verify the spreadsheet hasn't been deleted
- Check browser console for errors

### Slow performance
- Large datasets may take time to load
- Use date filters to limit data
- Consider archiving old data

---

## 📝 Version History

### v1.0.0 (Initial Release)
- Dashboard with analytics
- Search and filter functionality
- Single and bulk record upload
- Excel/CSV export
- Edit and delete records
- Multi-platform support

---

## 📧 Support

For issues or feature requests, contact the development team.

---

## 📄 License

Internal use only - Kuber Industries © 2024
