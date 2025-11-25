# Deployment Guide - TOPTHAI TRAVEL COMPANY Website

This guide covers deploying the website to various production environments.

## 🌐 Deployment Options

1. **Docker on VPS** (Recommended - DigitalOcean, AWS EC2, etc.)
2. **Cloud Platforms** (Google Cloud Run, AWS ECS, Azure Container Instances)
3. **Heroku** (Platform as a Service)
4. **Traditional Hosting** (cPanel, Plesk with Node.js support)

---

## 📦 Option 1: Docker on VPS (Recommended)

This is the most straightforward deployment method for any VPS.

### Prerequisites
- VPS with Ubuntu 20.04+ or Debian 11+
- Root or sudo access
- Domain name (optional but recommended)

### Step 1: Prepare the Server

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo apt install docker-compose -y

# Enable Docker to start on boot
sudo systemctl enable docker

# Add your user to docker group (optional)
sudo usermod -aG docker $USER
```

### Step 2: Transfer Files to Server

```bash
# From your local machine
scp -r topthai-travel-website user@your-server-ip:/home/user/

# OR clone from Git
ssh user@your-server-ip
cd /home/user
git clone https://your-repo.git topthai-travel-website
cd topthai-travel-website
```

### Step 3: Configure Environment

```bash
# Create .env file
cp .env.example .env
nano .env
```

Update with production settings:
```env
NODE_ENV=production
PORT=3000
DATABASE_URL=/app/data/topthai.db

# Your SMTP settings
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL=your-email@gmail.com
TO_EMAIL=topthaiasia@gmail.com
```

### Step 4: Deploy

```bash
# Build and start
docker compose up -d --build

# Verify it's running
docker compose ps

# Check logs
docker compose logs -f
```

### Step 5: Configure Nginx Reverse Proxy (Recommended)

Install Nginx:
```bash
sudo apt install nginx -y
```

Create Nginx configuration:
```bash
sudo nano /etc/nginx/sites-available/topthai
```

Add this configuration:
```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    client_max_body_size 10M;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/topthai /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Step 6: Setup SSL with Let's Encrypt (Recommended)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obtain certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Certbot will automatically configure Nginx for HTTPS
```

### Step 7: Configure Firewall

```bash
# Allow necessary ports
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

### Step 8: Verify Deployment

```bash
# Check health endpoint
curl http://localhost:3000/healthz

# Or from outside
curl http://your-domain.com/healthz
```

---

## 🚀 Option 2: Google Cloud Run

### Prerequisites
- Google Cloud account
- `gcloud` CLI installed

### Step 1: Prepare Dockerfile

The existing Dockerfile is already optimized for Cloud Run.

### Step 2: Build and Push Image

```bash
# Set project
gcloud config set project YOUR_PROJECT_ID

# Build and push
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/topthai-travel

# OR use Artifact Registry
gcloud builds submit --tag us-central1-docker.pkg.dev/YOUR_PROJECT_ID/topthai/web
```

### Step 3: Deploy to Cloud Run

```bash
gcloud run deploy topthai-travel \
  --image gcr.io/YOUR_PROJECT_ID/topthai-travel \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 3000 \
  --set-env-vars "NODE_ENV=production" \
  --set-env-vars "SMTP_HOST=smtp.gmail.com" \
  --set-env-vars "SMTP_PORT=587" \
  --set-env-vars "SMTP_USER=your-email@gmail.com" \
  --set-secrets "SMTP_PASS=smtp-password:latest" \
  --set-env-vars "TO_EMAIL=topthaiasia@gmail.com"
```

**Note:** For Cloud Run, you'll need to use Cloud SQL or Cloud Storage for persistent database storage, as the local filesystem is ephemeral.

---

## 🌊 Option 3: AWS ECS (Elastic Container Service)

### Prerequisites
- AWS account
- AWS CLI configured
- ECR repository created

### Step 1: Build and Push to ECR

```bash
# Login to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin YOUR_ACCOUNT.dkr.ecr.us-east-1.amazonaws.com

# Build image
docker build -t topthai-travel .

# Tag image
docker tag topthai-travel:latest YOUR_ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/topthai-travel:latest

# Push to ECR
docker push YOUR_ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/topthai-travel:latest
```

### Step 2: Create Task Definition

Create `task-definition.json`:
```json
{
  "family": "topthai-travel",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "containerDefinitions": [
    {
      "name": "web",
      "image": "YOUR_ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/topthai-travel:latest",
      "portMappings": [
        {
          "containerPort": 3000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {"name": "NODE_ENV", "value": "production"},
        {"name": "PORT", "value": "3000"}
      ],
      "secrets": [
        {"name": "SMTP_USER", "valueFrom": "arn:aws:secretsmanager:..."},
        {"name": "SMTP_PASS", "valueFrom": "arn:aws:secretsmanager:..."}
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/topthai-travel",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

### Step 3: Deploy

```bash
# Register task definition
aws ecs register-task-definition --cli-input-json file://task-definition.json

# Create or update service
aws ecs create-service \
  --cluster your-cluster \
  --service-name topthai-travel \
  --task-definition topthai-travel \
  --desired-count 1 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-xxx],securityGroups=[sg-xxx],assignPublicIp=ENABLED}"
```

---

## 🎨 Option 4: Heroku

### Prerequisites
- Heroku account
- Heroku CLI installed

### Step 1: Create heroku.yml

Create `heroku.yml`:
```yaml
build:
  docker:
    web: Dockerfile
run:
  web: node server/index.js
```

### Step 2: Deploy

```bash
# Login to Heroku
heroku login

# Create app
heroku create topthai-travel

# Set stack to container
heroku stack:set container -a topthai-travel

# Set environment variables
heroku config:set NODE_ENV=production -a topthai-travel
heroku config:set SMTP_HOST=smtp.gmail.com -a topthai-travel
heroku config:set SMTP_PORT=587 -a topthai-travel
heroku config:set SMTP_USER=your-email@gmail.com -a topthai-travel
heroku config:set SMTP_PASS=your-app-password -a topthai-travel
heroku config:set TO_EMAIL=topthaiasia@gmail.com -a topthai-travel

# Deploy
git push heroku main
```

**Note:** Heroku's filesystem is ephemeral. Consider using a Heroku add-on like PostgreSQL instead of SQLite for production.

---

## 🔧 Production Best Practices

### 1. Database Backup

Setup automated backups:

```bash
# Create backup script
cat > backup-db.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/home/user/backups"
mkdir -p $BACKUP_DIR
cp /home/user/topthai-travel-website/data/topthai.db $BACKUP_DIR/topthai_$DATE.db
# Keep only last 30 days
find $BACKUP_DIR -name "topthai_*.db" -mtime +30 -delete
EOF

chmod +x backup-db.sh

# Add to crontab (daily at 2 AM)
crontab -e
# Add: 0 2 * * * /home/user/backup-db.sh
```

### 2. Monitoring

Setup monitoring with uptime checks:

```bash
# Install monitoring agent (example: Netdata)
bash <(curl -Ss https://my-netdata.io/kickstart.sh)

# Or use external services like:
# - UptimeRobot (https://uptimerobot.com)
# - Pingdom (https://pingdom.com)
# - StatusCake (https://statuscake.com)
```

### 3. Log Rotation

Configure log rotation:

```bash
# For Docker logs
sudo nano /etc/docker/daemon.json
```

Add:
```json
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
```

Restart Docker:
```bash
sudo systemctl restart docker
```

### 4. Update Strategy

```bash
# Create update script
cat > update.sh << 'EOF'
#!/bin/bash
cd /home/user/topthai-travel-website
git pull origin main
docker compose down
docker compose up -d --build
docker compose logs -f
EOF

chmod +x update.sh
```

### 5. Security Hardening

```bash
# Disable root SSH login
sudo nano /etc/ssh/sshd_config
# Set: PermitRootLogin no

# Setup fail2ban
sudo apt install fail2ban -y
sudo systemctl enable fail2ban

# Keep system updated
sudo apt update && sudo apt upgrade -y
```

---

## 📊 Monitoring & Maintenance

### Health Checks

Setup external monitoring for `/healthz` endpoint:
- Interval: Every 5 minutes
- Timeout: 10 seconds
- Alert on: 3 consecutive failures

### Database Maintenance

```bash
# Check database size
ls -lh data/topthai.db

# Compact database (if needed)
sqlite3 data/topthai.db "VACUUM;"
```

### View Application Logs

```bash
# Docker
docker compose logs -f --tail=100

# Or specific time range
docker compose logs --since 30m

# Export logs
docker compose logs > logs_$(date +%Y%m%d).txt
```

---

## 🆘 Rollback Procedure

If deployment fails:

```bash
# Stop current deployment
docker compose down

# Pull previous version
git checkout previous-commit-hash

# Restore database backup
cp /home/user/backups/topthai_YYYYMMDD.db data/topthai.db

# Redeploy
docker compose up -d

# Verify
curl http://localhost:3000/healthz
```

---

## 📞 Support

For deployment assistance:
- Email: topthaiasia@gmail.com
- Thailand: (+66) 98-246-8010
- Vietnam: (+84) 944-36-21-39

---

© 2025 TOPTHAI TRAVEL COMPANY

