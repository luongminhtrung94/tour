# TOPTHAI TRAVEL COMPANY - Setup Guide

This guide will help you set up and run the TOPTHAI TRAVEL website.

## 📋 Prerequisites

Choose ONE of the following methods:

### Method 1: Docker (Recommended)
- Docker Desktop installed
- That's it!

### Method 2: Local Development
- Node.js 18 or higher
- npm (comes with Node.js)

## 🚀 Quick Start

### Windows Users

#### Option A: Docker (Recommended)

1. **Create environment file:**
   ```cmd
   copy .env.example .env
   notepad .env
   ```

2. **Edit `.env` with your email settings** (see Email Configuration below)

3. **Run the start script:**
   ```cmd
   start-docker.bat
   ```

4. **Open your browser:**
   - Website: http://localhost:3000
   - Health check: http://localhost:3000/healthz

#### Option B: Local Development

1. **Create environment file:**
   ```cmd
   copy .env.example .env
   notepad .env
   ```

2. **Edit `.env` with your email settings** (see Email Configuration below)

3. **Run the start script:**
   ```cmd
   start-local.bat
   ```

4. **Open your browser:**
   - Website: http://localhost:3000

### Linux/Mac Users

#### Option A: Docker (Recommended)

```bash
# 1. Create environment file
cp .env.example .env
nano .env  # or vim, or any text editor

# 2. Edit .env with your email settings (see Email Configuration below)

# 3. Start the application
docker compose up -d --build

# 4. Open your browser
# Website: http://localhost:3000
# Health check: http://localhost:3000/healthz

# View logs
docker compose logs -f

# Stop the application
docker compose down
```

#### Option B: Local Development

```bash
# 1. Create environment file
cp .env.example .env
nano .env  # or vim, or any text editor

# 2. Edit .env with your email settings (see Email Configuration below)

# 3. Install dependencies
npm install

# 4. Create data directory
mkdir -p data

# 5. Start the server
npm start

# For development with auto-reload:
npm run dev

# Open your browser: http://localhost:3000
```

## 📧 Email Configuration

To receive contact form submissions via email, you need to configure SMTP settings in your `.env` file.

### Gmail Setup (Easiest)

1. **Enable 2-Factor Authentication:**
   - Go to Google Account settings
   - Enable 2-Step Verification

2. **Create App Password:**
   - Visit: https://myaccount.google.com/apppasswords
   - Select "Mail" and your device
   - Click "Generate"
   - Copy the 16-character password

3. **Update `.env` file:**
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=xxxx xxxx xxxx xxxx    # Your app password
   FROM_EMAIL=your-email@gmail.com
   TO_EMAIL=topthaiasia@gmail.com
   ```

### Other Email Providers

#### Outlook/Hotmail
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=your-email@outlook.com
SMTP_PASS=your-password
```

#### Yahoo
```env
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
SMTP_USER=your-email@yahoo.com
SMTP_PASS=your-app-password    # Requires app password
```

#### Custom SMTP Server
```env
SMTP_HOST=mail.yourdomain.com
SMTP_PORT=587
SMTP_USER=your-username
SMTP_PASS=your-password
```

## ✅ Verification

After starting the application, verify it's working:

### 1. Check Health Status

**Docker:**
```cmd
docker compose ps
```

Should show status as "healthy" after 30-40 seconds.

**Browser:**
Visit: http://localhost:3000/healthz

Should return:
```json
{"status":"ok","timestamp":"2025-11-25T..."}
```

### 2. Test the Website

1. Open http://localhost:3000
2. Scroll to the contact form
3. Fill in the form with test data
4. Click "Send Message"
5. Check if you receive an email at the configured TO_EMAIL address

### 3. View Logs

**Docker:**
```cmd
docker compose logs -f web
```

**Local:**
Logs appear in the terminal where you ran the server.

## 🐛 Troubleshooting

### "Docker is not running" error

**Solution:** Start Docker Desktop and wait for it to fully initialize.

### "Node.js is not installed" error

**Solution:** Install Node.js from https://nodejs.org (download LTS version)

### Email not sending

**Symptoms:** Form submits successfully but no email received.

**Solutions:**
1. Check SMTP credentials in `.env`
2. Verify you're using App Password (not regular password) for Gmail
3. Check spam/junk folder
4. View logs for email errors:
   ```cmd
   docker compose logs web | findstr /i "email"
   ```

### Port 3000 already in use

**Solution:** Change the port in `.env`:
```env
PORT=8080
```

Then restart:
```cmd
# Docker
docker compose down
docker compose up -d

# Local
# Just restart the script
```

### Database errors

**Solution:** 
1. Ensure the `data` directory exists
2. If corrupted, backup and delete:
   ```cmd
   move data\topthai.db data\topthai.db.backup
   ```
3. Restart the application (database will be recreated)

### Container keeps restarting

**Check logs:**
```cmd
docker compose logs web
```

Common causes:
- Invalid environment variables
- Database file permission issues
- Port conflict

## 📁 Project Structure

```
topthai-travel-website/
├── frontend/                 # Website files
│   ├── index.html           # Main page
│   ├── styles.css           # Styling
│   └── app.js               # Contact form logic
├── server/                   # Backend
│   ├── index.js             # Express server
│   ├── db.js                # Database
│   ├── email.js             # Email service
│   └── routes/
│       └── contact.js       # Contact API
├── data/                     # SQLite database (auto-created)
├── .env                      # Your settings (create from .env.example)
├── .env.example             # Template
├── docker-compose.yml       # Docker configuration
├── Dockerfile               # Docker image
├── package.json             # Dependencies
├── start-docker.bat         # Windows Docker start script
├── start-local.bat          # Windows local start script
└── README.md               # Main documentation
```

## 🔧 Useful Commands

### Docker

```cmd
# Start
docker compose up -d

# Stop
docker compose down

# Restart
docker compose restart

# View logs
docker compose logs -f

# View logs (last 100 lines)
docker compose logs --tail=100

# Check status
docker compose ps

# Rebuild after code changes
docker compose up -d --build

# Remove everything (including data volume)
docker compose down -v
```

### Local Development

```cmd
# Install dependencies
npm install

# Start server
npm start

# Development mode (auto-restart on changes)
npm run dev
```

## 🌐 Accessing from Other Devices

To access the website from other devices on your network:

1. Find your computer's IP address:
   ```cmd
   ipconfig
   ```
   Look for "IPv4 Address" (e.g., 192.168.1.100)

2. On other devices, open:
   ```
   http://192.168.1.100:3000
   ```

**Note:** Make sure your firewall allows connections on port 3000.

## 🔒 Security Notes

- Never commit `.env` file to version control
- Use strong, unique passwords for SMTP
- For production, use HTTPS with a reverse proxy (nginx)
- Regularly backup the `data` directory
- Update dependencies regularly: `npm update`

## 📞 Support

Need help? Contact:
- Email: topthaiasia@gmail.com
- Thailand: (+66) 98-246-8010
- Vietnam: (+84) 944-36-21-39

---

© 2025 TOPTHAI TRAVEL COMPANY

