# TOPTHAI TRAVEL COMPANY - Website

A lightweight, fast, and responsive tour introduction website for TOPTHAI TRAVEL COMPANY featuring Thailand and Vietnam tour packages with a contact form system.

## 🌟 Features

- **Responsive Landing Page**: Beautiful, mobile-friendly design showcasing company information and tour packages
- **Contact Form**: Full validation, database storage, and email notifications
- **SQLite Database**: Lightweight file-based database for contact submissions
- **Email Notifications**: Automated email alerts for new contact form submissions
- **Docker Support**: Easy deployment with Docker Compose
- **Auto-restart**: Automatic recovery from crashes with health checks
- **Rate Limiting**: Protection against spam (10 requests/minute per IP)
- **Security**: Input sanitization and validation

## 🏢 Company Information

**TOPTHAI TRAVEL COMPANY**

- **Thailand Hotline**: (+66) 98-246-8010
- **Vietnam Hotline**: (+84) 944-36-21-39
- **Email**: topthaiasia@gmail.com
- **Address**: 32 Lat Krabang 20, Lat Krabang, Bangkok 10520, Thailand

## 📋 Requirements

- Docker & Docker Compose (recommended)
- OR Node.js 18+ (for local development)

## 🚀 Quick Start with Docker

### 1. Clone or download this project

```bash
cd topthai-travel-website
```

### 2. Create environment file

Copy the example environment file and configure it:

```bash
cp .env.example .env
```

Edit `.env` with your settings:

```env
# Server Configuration
PORT=3000
NODE_ENV=production

# Database Configuration
DATABASE_URL=/app/data/topthai.db

# SMTP Email Configuration (Gmail example)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Email Addresses
FROM_EMAIL=your-email@gmail.com
TO_EMAIL=topthaiasia@gmail.com
```

### 3. Start the application

```bash
docker compose up -d
```

The website will be available at `http://localhost:3000`

### 4. Check application status

```bash
# View logs
docker compose logs -f

# Check health status
docker compose ps

# Test health endpoint
curl http://localhost:3000/healthz
```

### 5. Stop the application

```bash
docker compose down
```

## 📧 Email Configuration

### Gmail Setup (Recommended)

1. Enable 2-Factor Authentication on your Google account
2. Generate an App Password:
   - Go to https://myaccount.google.com/apppasswords
   - Select "Mail" and your device
   - Copy the generated password
3. Use the App Password in your `.env` file as `SMTP_PASS`

### Other Email Providers

Update the SMTP settings in `.env`:

```env
# For Outlook/Hotmail
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587

# For Yahoo
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587

# For custom SMTP server
SMTP_HOST=your-smtp-server.com
SMTP_PORT=587
```

## 🛠️ Local Development (Without Docker)

### 1. Install dependencies

```bash
npm install
```

### 2. Create data directory

```bash
mkdir data
```

### 3. Create .env file

```bash
cp .env.example .env
# Edit .env with your settings
```

### 4. Start the development server

```bash
npm run dev
```

The website will be available at `http://localhost:3000`

## 📂 Project Structure

```
topthai-travel-website/
├── frontend/                 # Frontend files
│   ├── index.html           # Main HTML page
│   ├── styles.css           # Styling
│   └── app.js               # Client-side JavaScript
├── server/                   # Backend files
│   ├── index.js             # Express server
│   ├── db.js                # SQLite database layer
│   ├── email.js             # Email functionality
│   └── routes/
│       └── contact.js       # Contact form route
├── data/                     # SQLite database (created automatically)
├── Dockerfile               # Docker configuration
├── docker-compose.yml       # Docker Compose configuration
├── package.json             # Node.js dependencies
├── .env.example             # Environment variables template
└── README.md               # This file
```

## 🔧 Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | `3000` | Server port |
| `NODE_ENV` | No | `development` | Environment mode |
| `DATABASE_URL` | No | `data/topthai.db` | SQLite database path |
| `SMTP_HOST` | Yes | - | SMTP server hostname |
| `SMTP_PORT` | No | `587` | SMTP server port |
| `SMTP_USER` | Yes | - | SMTP username/email |
| `SMTP_PASS` | Yes | - | SMTP password |
| `FROM_EMAIL` | No | `SMTP_USER` | Email sender address |
| `TO_EMAIL` | No | `topthaiasia@gmail.com` | Email recipient address |

## 🔒 Security Features

- **Rate Limiting**: 10 requests per minute per IP on contact form
- **Input Validation**: Server-side and client-side validation
- **Input Sanitization**: HTML tag removal from user inputs
- **Non-root User**: Docker container runs as non-root user
- **Environment Variables**: Secrets stored in environment variables
- **CORS Protection**: Configured CORS headers

## 🏥 Health Check & Monitoring

The application includes a health check endpoint at `/healthz`:

```bash
curl http://localhost:3000/healthz
# Response: {"status":"ok","timestamp":"2025-11-25T..."}
```

Docker health checks run automatically:
- Interval: 30 seconds
- Timeout: 10 seconds
- Retries: 3
- Start period: 40 seconds

## 🔄 Auto-restart & Recovery

The application automatically restarts on crashes through:

1. **Docker restart policy**: `restart: always`
2. **Health checks**: Automatic container restart on unhealthy status
3. **Graceful shutdown**: Proper cleanup on SIGTERM/SIGINT signals
4. **Process manager**: dumb-init handles signals correctly

## 📊 Database

SQLite database stores contact form submissions:

```sql
CREATE TABLE contacts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    message TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

Database file is persisted in the `./data` directory (mapped as Docker volume).

## 🐛 Troubleshooting

### Application won't start

```bash
# Check logs
docker compose logs web

# Restart the container
docker compose restart web
```

### Email not sending

1. Verify SMTP credentials in `.env`
2. Check if your email provider requires App Passwords
3. Review logs: `docker compose logs web | grep -i email`
4. Test SMTP settings with a mail client

### Database errors

```bash
# Ensure data directory exists and has correct permissions
mkdir -p data
chmod 755 data

# If corrupted, backup and delete the database
mv data/topthai.db data/topthai.db.backup
docker compose restart web
```

### Port already in use

Change the port in `.env`:

```env
PORT=8080
```

Then rebuild:

```bash
docker compose down
docker compose up -d
```

## 📝 API Endpoints

### POST /api/contact
Submit a contact form

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+66982468010",
  "message": "Optional message"
}
```

**Response:**
```json
{
  "ok": true,
  "message": "Contact form submitted successfully",
  "id": 1
}
```

### GET /healthz
Health check endpoint

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-11-25T10:30:00.000Z"
}
```

## 🌐 Deployment Notes

- Ensure `.env` file is properly configured before deployment
- Database file in `./data` directory will persist across restarts
- For production, consider using a reverse proxy (nginx) for SSL/TLS
- Regular backups of the `./data` directory are recommended
- Monitor logs with `docker compose logs -f web`

## 📄 License

ISC

## 👨‍💻 Support

For support or inquiries:
- Email: topthaiasia@gmail.com
- Thailand: (+66) 98-246-8010
- Vietnam: (+84) 944-36-21-39

---

© 2025 TOPTHAI TRAVEL COMPANY. All rights reserved.

