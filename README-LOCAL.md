# Kuber Industries Sales Analyzer - Local Server

## Quick Start

### 1. First Time Setup
```bash
# Open Command Prompt in this folder
npm install
```

### 2. Start the Server
**Option A:** Double-click `start.bat`

**Option B:** Run manually:
```bash
npm start
```

### 3. Access the Application
Open in browser: **http://localhost:3000**

**Login Credentials:**
- User ID: `admin`
- Password: `admin123`

---

## Share with Others via Ngrok

### Step 1: Install Ngrok (One Time)
1. Download from: https://ngrok.com/download
2. Extract and place `ngrok.exe` in a folder
3. Add to PATH or keep in this directory

### Step 2: Start Ngrok Tunnel
```bash
# In a NEW terminal window (keep server running):
ngrok http 3000
```

### Step 3: Share the URL
Ngrok will show a URL like: `https://abc123.ngrok.io`
Share this URL with others - they can access the app from anywhere!

---

## Data Storage
- All data is stored in `sales_data.db` (SQLite database)
- To backup: Simply copy the `sales_data.db` file
- To restore: Replace `sales_data.db` with your backup

---

## Troubleshooting

**"Node.js not found"**
- Install Node.js from https://nodejs.org/

**"Port 3000 in use"**
- Change port: `set PORT=3001 && npm start`

**"Cannot connect"**
- Check firewall settings
- Make sure the server is running
