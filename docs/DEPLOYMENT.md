# 🚀 Deployment Guide – StarOil Gas Station Manager

This guide covers self-hosted deployment of StarOil on a single machine or multi-machine setup.

---

## Table of Contents

1. [System Requirements](#system-requirements)
2. [Pre-Deployment Checklist](#pre-deployment-checklist)
3. [Docker Installation](#docker-installation)
4. [Environment Configuration](#environment-configuration)
5. [SSL/HTTPS Setup](#sslhttps-setup)
6. [Initial Deployment](#initial-deployment)
7. [Post-Deployment Verification](#post-deployment-verification)
8. [Backup & Recovery](#backup--recovery)
9. [Monitoring & Logs](#monitoring--logs)
10. [Troubleshooting](#troubleshooting)
11. [Scaling & Performance](#scaling--performance)
12. [Maintenance Schedule](#maintenance-schedule)

---

## System Requirements

### Hardware (Minimum)
- **CPU:** 2 cores (4+ cores recommended for multi-station)
- **RAM:** 4 GB (8 GB for production)
- **Disk:** 20 GB SSD (100+ GB for high transaction volume)
- **Network:** 10 Mbps+ (1 Gbps recommended)

### Operating System
- **Linux:** Ubuntu 20.04 LTS, 22.04 LTS, Debian 11+
- **Windows:** Windows Server 2019+ with WSL2 or Hyper-V
- **macOS:** Docker Desktop (for testing only)

### Network
- Reliable internet connection (or failover for offline-first sync)
- Static IP address or dynamic DNS
- Port access: 80 (HTTP), 443 (HTTPS), 5432 (PostgreSQL, internal only)

---

## Pre-Deployment Checklist

- [ ] Server access verified (SSH or RDP)
- [ ] Docker & Docker Compose installed
- [ ] Domain name configured (or local DNS entry)
- [ ] SSL certificate obtained (self-signed or Let's Encrypt)
- [ ] Database backup strategy defined
- [ ] Admin user password created (min 12 chars, mix of upper/lower/numbers/symbols)
- [ ] Email SMTP credentials configured
- [ ] Network firewall rules configured (allow 80, 443, deny 5432)
- [ ] Git repo cloned to server

---

## Docker Installation

### Ubuntu/Debian

#### 1. Install Docker
```bash
# Update package manager
sudo apt-get update

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add current user to docker group (optional, avoids sudo)
sudo usermod -aG docker $USER
newgrp docker

# Verify installation
docker --version
docker run hello-world
```

#### 2. Install Docker Compose
```bash
# Download latest Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

# Make executable
sudo chmod +x /usr/local/bin/docker-compose

# Verify installation
docker-compose --version
```

### Windows Server (WSL2)

```powershell
# Enable WSL2
wsl --install

# Install Docker Desktop
# Download from https://www.docker.com/products/docker-desktop
# Or via Chocolatey:
choco install docker-desktop -y
```

---

## Environment Configuration

### 1. Clone Repository
```bash
git clone <your-repo-url> /opt/staroil
cd /opt/staroil
```

### 2. Create Environment File
```bash
# Copy template
cp .env.example .env

# Edit with your values
nano .env
```

### 3. Configure .env Values

**Critical Parameters:**
```bash
# Set strong secrets
JWT_SECRET=$(openssl rand -base64 32)
JWT_REFRESH_SECRET=$(openssl rand -base64 32)

# Database
DB_PASSWORD=$(openssl rand -base64 16)  # Change default password!

# Domain
DOMAIN=manager.station1.local  # Update for your station

# Email (optional but recommended)
MAIL_HOST=smtp.gmail.com
MAIL_USER=your-email@gmail.com
MAIL_PASSWORD=your-app-password  # Use Gmail app password, not account password

# Environment
ENVIRONMENT=production
NODE_ENV=production
LOG_LEVEL=info
```

### 4. Store Secrets Securely
```bash
# On production servers, use a secrets manager
# Option 1: Docker Secrets (Swarm mode)
# Option 2: Vault, AWS Secrets Manager
# Option 3: Environment file with restricted permissions

# Restrict .env file access
chmod 600 .env
```

---

## SSL/HTTPS Setup

### Option 1: Self-Signed Certificate (Development/Testing)

```bash
# Create certs directory
mkdir -p certs

# Generate self-signed certificate (valid 365 days)
openssl req -x509 -newkey rsa:4096 -keyout certs/key.pem -out certs/cert.pem \
  -days 365 -nodes -subj "/CN=manager.gasstation.local"

# Set permissions
chmod 600 certs/key.pem
chmod 644 certs/cert.pem

# Verify certificate
openssl x509 -in certs/cert.pem -text -noout
```

### Option 2: Let's Encrypt (Production, Free)

```bash
# Install Certbot
sudo apt-get install -y certbot python3-certbot-nginx

# Obtain certificate (requires domain DNS)
sudo certbot certonly --standalone \
  -d manager.station1.local \
  --email admin@station1.local \
  --agree-tos

# Certificate location: /etc/letsencrypt/live/manager.station1.local/
# Copy to project
sudo cp /etc/letsencrypt/live/manager.station1.local/fullchain.pem certs/cert.pem
sudo cp /etc/letsencrypt/live/manager.station1.local/privkey.pem certs/key.pem
sudo chown $(whoami):$(whoami) certs/*.pem

# Auto-renew (optional)
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
```

### Option 3: Commercial Certificate

1. Purchase certificate from CA (Comodo, Sectigo, etc.)
2. Download cert and key files
3. Copy to `certs/cert.pem` and `certs/key.pem`

---

## Initial Deployment

### 1. Build Docker Images
```bash
cd /opt/staroil

# Build all services
docker-compose build

# This may take 5-10 minutes
```

### 2. Start Services
```bash
# Start in background
docker-compose up -d

# Verify services are running
docker-compose ps

# Expected output:
# STATUS: running for all services
```

### 3. Initialize Database
```bash
# Run migrations
docker-compose exec api npm run prisma:migrate

# Load seed data (optional, for testing)
docker-compose exec api npm run seed

# Verify database
docker-compose exec api npm run prisma:studio  # Opens http://localhost:5555
```

### 4. Create Admin User
```bash
# Option A: Via API (if seed script includes endpoint)
curl -X POST http://localhost:3000/api/auth/setup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@station1.local",
    "password": "SecurePassword123!",
    "firstName": "Admin",
    "lastName": "User"
  }'

# Option B: Via database directly
docker-compose exec postgres psql -U startoil_user -d startoil -c \
  "INSERT INTO users (email, password_hash, first_name, last_name, role) \
   VALUES ('admin@station1.local', '\$2b\$12\$...', 'Admin', 'User', 'admin');"

# Option C: Wait for setup wizard on first login
```

### 5. Verify Deployment
```bash
# Health check
curl -I https://manager.station1.local/api/health

# Expected: HTTP 200

# Frontend
curl -I https://manager.station1.local/

# Expected: HTTP 200
```

---

## Post-Deployment Verification

### 1. Test User Login
```bash
# Via API
curl -X POST https://manager.station1.local/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@station1.local","password":"SecurePassword123!"}'

# Expected: JWT token in response
```

### 2. Test Sales Entry
```bash
curl -X POST https://manager.station1.local/api/sales \
  -H "Authorization: Bearer <your-jwt-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "stationId": "<station-uuid>",
    "items": [
      {"itemId": "fuel-regular", "quantity": 10, "unitPrice": 3.45}
    ],
    "paymentMethod": "cash",
    "saleDate": "2026-03-23",
    "saleTime": "12:30"
  }'
```

### 3. Check Logs
```bash
# API logs
docker-compose logs -f api

# Database logs
docker-compose logs -f postgres

# Nginx logs
docker-compose logs -f nginx
```

### 4. Performance Baseline
```bash
# Measure API response time
time curl https://manager.station1.local/api/health

# Expected: < 200ms

# Database query time
docker-compose exec postgres psql -U startoil_user -d startoil -c \
  "SELECT count(*) FROM users;"
```

---

## Backup & Recovery

### 1. Automated Backups

#### Setup Cron Job (Linux)
```bash
# Create backup script
sudo nano /usr/local/bin/staroil-backup.sh

#!/bin/bash
BACKUP_DIR="/opt/staroil/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DB_NAME="startoil"
DB_USER="startoil_user"

# Create backup directory
mkdir -p $BACKUP_DIR

# Dump database
docker-compose -f /opt/staroil/docker-compose.yml exec -T postgres \
  pg_dump -U $DB_USER $DB_NAME | gzip > $BACKUP_DIR/startoil_$TIMESTAMP.sql.gz

# Cleanup old backups (keep last 30 days)
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete

echo "Backup completed: $BACKUP_DIR/startoil_$TIMESTAMP.sql.gz"

# Make executable
sudo chmod +x /usr/local/bin/staroil-backup.sh

# Add to crontab (2 AM daily)
(crontab -l 2>/dev/null; echo "0 2 * * * /usr/local/bin/staroil-backup.sh") | crontab -
```

#### Setup Cron Job (Windows Task Scheduler)
```powershell
# Create backup script: C:\Scripts\backup-staroil.ps1
$backupDir = "C:\staroil\backups"
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backupFile = "$backupDir\startoil_$timestamp.sql.gz"

# Create backup
docker-compose -f C:\staroil\docker-compose.yml exec -T postgres `
  pg_dump -U startoil_user startoil | gzip > $backupFile

# Cleanup old backups
Get-ChildItem "$backupDir\*.sql.gz" -mtime +30 | Remove-Item

# Schedule via Task Scheduler
$taskAction = New-ScheduledTaskAction -Execute "powershell" -Argument "-File C:\Scripts\backup-staroil.ps1"
$taskTrigger = New-ScheduledTaskTrigger -Daily -At 2:00AM
Register-ScheduledTask -TaskName "StarOil Backup" -Action $taskAction -Trigger $taskTrigger -AsJob
```

### 2. Manual Backup
```bash
# Backup database only
docker-compose exec -T postgres \
  pg_dump -U startoil_user startoil | gzip > backup-manual-$(date +%Y%m%d).sql.gz

# Backup entire application (code + data)
cd /opt
tar -czf staroil-backup-$(date +%Y%m%d).tar.gz staroil/

# List backups
ls -lah /opt/staroil/backups/
```

### 3. Database Recovery
```bash
# List available backups
ls -lah /opt/staroil/backups/

# Restore from backup
gunzip -c /opt/staroil/backups/startoil_20260323.sql.gz | \
  docker-compose exec -T postgres psql -U startoil_user startoil

# Verify restoration
docker-compose exec postgres psql -U startoil_user -d startoil -c \
  "SELECT count(*) FROM sales;"
```

### 4. Volume Backup
```bash
# Backup PostgreSQL volume
docker run --rm -v postgres_data:/source -v $(pwd):/backup \
  alpine tar czf /backup/postgres_volume.tar.gz -C /source .

# Restore volume
docker run --rm -v postgres_data:/dest -v $(pwd):/source \
  alpine tar xzf /source/postgres_volume.tar.gz -C /dest
```

---

## Monitoring & Logs

### 1. Real-Time Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f api
docker-compose logs -f postgres
docker-compose logs -f nginx

# Last N lines
docker-compose logs --tail=100 api
```

### 2. Log Files
```bash
# API logs (written to host)
tail -f backend/logs/combined.log
tail -f backend/logs/error.log

# Nginx access logs
docker-compose exec nginx tail -f /var/log/nginx/access.log
```

### 3. Health Checks
```bash
# API health
curl -s http://localhost:3000/api/health | jq .

# Database connection
docker-compose exec postgres pg_isready -U startoil_user

# Service status
docker-compose ps
docker stats
```

### 4. Performance Monitoring
```bash
# CPU & Memory usage
docker stats staroil-api staroil-db staroil-app

# Database query time
docker-compose exec postgres psql -U startoil_user -d startoil -c \
  "SELECT query, mean_exec_time FROM pg_stat_statements ORDER BY mean_exec_time DESC LIMIT 10;"

# Slow queries (PostgreSQL)
docker-compose exec postgres psql -U startoil_user -d startoil -c \
  "ALTER SYSTEM SET log_min_duration_statement = 1000;" && \
  docker-compose restart postgres
```

---

## Troubleshooting

### Issue: Database Connection Refused

**Symptom:** `Error: connect ECONNREFUSED 127.0.0.1:5432`

**Solution:**
```bash
# Check if PostgreSQL is running
docker-compose ps | grep postgres

# Restart database
docker-compose restart postgres

# Check logs
docker-compose logs postgres

# Verify connection
docker-compose exec postgres pg_isready -U startoil_user
```

### Issue: Port 80/443 Already in Use

**Symptom:** `Port 80 in use` or `bind: address already in use`

**Solution:**
```bash
# Find process using port
sudo lsof -i :80
sudo lsof -i :443

# Kill process
sudo kill -9 <PID>

# Or change port in docker-compose.yml
# ports:
#   - "8080:80"
#   - "8443:443"
```

### Issue: Out of Disk Space

**Symptom:** `No space left on device`

**Solution:**
```bash
# Check disk usage
df -h

# Remove unused Docker data
docker system prune -a --volumes

# Clean up backups
find /opt/staroil/backups -name "*.sql.gz" -mtime +30 -delete

# Extend volume (if using LVM)
sudo lvextend -L +50G /dev/mapper/vg0-startoil && \
sudo resize2fs /dev/mapper/vg0-startoil
```

### Issue: API Crash on Startup

**Symptom:** Container exits with code 1

**Solution:**
```bash
# Check API logs
docker-compose logs api

# Verify environment variables
docker-compose exec api env | grep DATABASE_URL

# Check database migrations
docker-compose exec api npm run prisma:status

# Run migrations manually
docker-compose exec api npm run prisma:migrate
```

### Issue: HTTPS Certificate Error

**Symptom:** `NET::ERR_CERT_INVALID` or certificate warning

**Solution:**
```bash
# Verify certificate dates
openssl x509 -in certs/cert.pem -text -noout | grep -A 2 Validity

# Renew Let's Encrypt certificate
sudo certbot renew --force-renewal

# Copy renewed certificate
sudo cp /etc/letsencrypt/live/manager.station1.local/*.pem certs/

# Restart Nginx
docker-compose restart nginx
```

---

## Scaling & Performance

### 1. Horizontal Scaling (Multiple API Instances)

```yaml
# docker-compose.yml modification
services:
  api:
    build: ./backend
    # ... config
    
  api-2:
    build: ./backend
    # ... same config, different port internally

  nginx:
    # Uses upstream with load balancing
    upstream api_backend {
      server api:3000;
      server api-2:3000;
    }
```

### 2. Database Optimization

```sql
-- Create indexes for frequently queried columns
CREATE INDEX idx_sales_station_date ON sales(station_id, sale_date);
CREATE INDEX idx_inventory_station ON inventory_items(station_id);

-- Analyze query performance
EXPLAIN ANALYZE SELECT * FROM sales WHERE station_id = '...' AND sale_date = '...';

-- Vacuum and analyze (maintenance)
VACUUM ANALYZE sales;
```

### 3. Caching Layer (Optional)

```bash
# Add Redis for session/query caching
docker pull redis:7-alpine

# In docker-compose.yml
redis:
  image: redis:7-alpine
  ports:
    - "6379:6379"
```

---

## Maintenance Schedule

### Daily
- [ ] Check error logs: `docker-compose logs api | grep ERROR`
- [ ] Verify backups: `ls -lah backups/ | head -5`
- [ ] Monitor disk space: `df -h`

### Weekly
- [ ] Review performance metrics
- [ ] Check for updates: `docker pull` latest images
- [ ] Validate backup recovery: `docker-compose exec postgres pg_dump -U startoil_user startoil | wc -l`
- [ ] Review audit logs

### Monthly
- [ ] Update Docker images & dependencies
- [ ] Security patches: `sudo apt update && sudo apt upgrade`
- [ ] Database maintenance: `VACUUM ANALYZE` (auto but verify)
- [ ] Review users & permissions
- [ ] Rotate JWT secrets (optional)

### Quarterly
- [ ] Full DR (disaster recovery) test
- [ ] Capacity planning review
- [ ] Security audit
- [ ] Performance optimization review

### Annually
- [ ] SSL certificate renewal (if Let's Encrypt, auto but verify)
- [ ] Major version upgrades
- [ ] Comprehensive security review
- [ ] Compliance audit

---

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [PostgreSQL Backup & Restore](https://www.postgresql.org/docs/14/backup.html)
- [Nginx Configuration](https://nginx.org/en/docs/)
- [Let's Encrypt](https://letsencrypt.org/)
- [Node.js Best Practices](https://nodejs.org/en/docs/guides/nodejs-performance/)

---

**Document Version:** 1.0  
**Last Updated:** March 23, 2026  
**Maintained By:** DevOps Team
