# 🔑 MyKeyManager - Advanced License Management System

> **Complete single-user software license management system with smart deployment options**

[![Docker Pulls](https://img.shields.io/docker/pulls/acwild/mykeymanager-all-in-one)](https://hub.docker.com/r/acwild/mykeymanager-all-in-one)
[![Image Size](https://img.shields.io/docker/image-size/acwild/mykeymanager-all-in-one/latest)](https://hub.docker.com/r/acwild/mykeymanager-all-in-one)
[![Version](https://img.shields.io/badge/version-v1.1.1-green.svg)](https://github.com/Acwildweb/MyKeyManager)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/Acwildweb/MyKeyManager/blob/main/LICENSE)

## 🚀 Quick Start - All-in-One Container

**Deploy in 10 seconds with pre-built Docker Hub image:**

```bash
# 1. Download configuration
curl -o docker-compose.yml https://raw.githubusercontent.com/Acwildweb/MyKeyManager/main/docker-compose.hub-all-in-one.yml

# 2. Configure port (optional)
echo "MYKEYMANAGER_PORT=8080" > .env

# 3. Deploy instantly
docker-compose --env-file .env up -d

# 4. Access application
open http://localhost:8080
```

**Default credentials:** `admin` / `ChangeMe!123` ⚠️ **Change immediately!**

---

## 📦 Available Images

### All-in-One Container (Recommended for Quick Testing)
```bash
docker pull acwild/mykeymanager-all-in-one:latest
```

**Includes everything in a single container:**
- ✅ React Frontend (Nginx)
- ✅ FastAPI Backend 
- ✅ PostgreSQL Database
- ✅ Redis Cache
- ✅ SMTP Server (Postfix)

### Microservices (Recommended for Production)
```bash
# Separate optimized containers
docker pull acwild/mykeymanager-frontend:latest
docker pull acwild/mykeymanager-backend:latest
```

---

## 🎯 Deployment Options

## 🚀 Deployment Options

### Option 1: Quick Start All-in-One (Recommended for Testing)
```bash
# Using Docker Compose for instant deployment
curl -O https://raw.githubusercontent.com/acwild/MyKeyManager/main/docker-compose.hub-all-in-one.yml
docker-compose -f docker-compose.hub-all-in-one.yml up -d
```
**Access:** http://localhost:3000  
**Time:** ~30 seconds  
**Use case:** Testing, development, quick demos

### Option 2: Production Microservices
```bash
# Production-ready with separate containers
curl -O https://raw.githubusercontent.com/acwild/MyKeyManager/main/docker-compose.hub.yml
docker-compose -f docker-compose.hub.yml up -d
```
**Access:** http://localhost:3000  
**Time:** ~45 seconds  
**Use case:** Production, scaling, customization

### Option 3: Custom Build
```bash
# Build from source for maximum control
git clone https://github.com/acwild/MyKeyManager.git
cd MyKeyManager
docker-compose up -d
```
**Access:** http://localhost:3000  
**Time:** ~5 minutes  
**Use case:** Development, customization, contribution

### Option 2: Docker Compose All-in-One
```yaml
version: '3.8'
services:
  mykeymanager:
    image: acwild/mykeymanager-all-in-one:latest
    ports:
      - "8080:80"
    volumes:
      - postgres_data:/var/lib/postgresql/14/main
      - app_logs:/app/logs
    environment:
      - SECRET_KEY=your-secret-key-here
      - POSTGRES_PASSWORD=secure-password
    restart: unless-stopped

volumes:
  postgres_data:
  app_logs:
```

### Option 3: Microservices (Production)
```bash
# Download full microservices compose
curl -o docker-compose.yml https://raw.githubusercontent.com/Acwildweb/MyKeyManager/main/docker-compose.hub.yml

# Deploy with intelligent port configuration
docker-compose up -d
```

---

## 🔧 Smart Port Management

The system includes **intelligent port conflict detection**:

```bash
# Automatic port detection
⚠️  Port 80 occupied by Apache
✅  Suggesting alternative: 8080

⚠️  Port 8000 occupied by Python dev server  
✅  Suggesting alternative: 8001

✅  PostgreSQL port 5432 available
✅  Redis port 6379 available
```

### Manual Port Configuration
```bash
# Set custom ports via environment variables
docker run -d \
  --name mykeymanager \
  -p 9080:80 \
  -e MYKEYMANAGER_PORT=9080 \
  -e SECRET_KEY=your-secret-here \
  acwild/mykeymanager-all-in-one:latest
```

---

## 🏗️ What's Included

### Core Features
- **📋 Complete License Management** - CRUD operations for software licenses
- **🏷️ Category System** - Organize licenses with custom categories and icons  
- **📧 Email Notifications** - Automatic email on license usage (SMTP configurable)
- **🔐 Secure Authentication** - JWT-based single-user authentication
- **📊 Usage Tracking** - Track last usage date for each license
- **🔗 ISO Downloads** - Direct download links for software ISOs

### Admin Panel Features
- **🎨 Dynamic Logo Management** - Upload and manage custom logos
- **🔄 Dynamic Favicon** - Configure favicon from admin panel
- **⭐ FontAwesome Icons** - Complete icon management with 1,500+ icons
- **🎛️ Responsive Interface** - Modern, mobile-first design
- **📱 Brand Customization** - Full branding control

### Technical Stack
- **Frontend:** React 18.3.1 + TypeScript + Vite
- **Backend:** FastAPI + SQLAlchemy + PostgreSQL  
- **Cache:** Redis for sessions and caching
- **Web Server:** Nginx (optimized configuration)
- **Email:** Postfix SMTP server (configurable for external)
- **Process Manager:** Supervisor (for All-in-One container)

---

## 🔧 Configuration

### Environment Variables
```bash
# Port Configuration
MYKEYMANAGER_PORT=8080        # External port mapping

# Security  
SECRET_KEY=your-secret-key    # JWT secret (auto-generated)
POSTGRES_PASSWORD=secure-pwd  # Database password

# SMTP Configuration (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
EMAIL_FROM=noreply@yourdomain.com

# Application
DEBUG=false
CORS_ORIGINS=http://localhost:8080
TZ=Europe/Rome
```

### Persistent Data
```bash
# Important volumes to persist
-v postgres_data:/var/lib/postgresql/14/main    # Database
-v app_logs:/app/logs                           # Application logs  
-v custom_config:/app/config                    # Custom configurations
```

---

## 🔍 Health Monitoring

### Built-in Health Checks
```bash
# Check all services status
docker exec mykeymanager /app/scripts/health.sh

# Output example:
# ✅ PostgreSQL: Running
# ✅ Redis: Running  
# ✅ Backend API: Running
# ✅ Frontend (Nginx): Running
# 🎉 All services are healthy!
```

### Individual Service Control
```bash
# Supervisor control (All-in-One only)
docker exec mykeymanager supervisorctl status
docker exec mykeymanager supervisorctl restart backend
docker exec mykeymanager supervisorctl restart nginx

# View specific service logs
docker exec mykeymanager tail -f /app/logs/backend.out.log
docker exec mykeymanager tail -f /app/logs/nginx.err.log
```

---

## 📊 Resource Requirements

### Minimum Requirements
- **RAM:** 1GB (2GB recommended)
- **CPU:** 1 core (2 cores recommended)  
- **Disk:** 5GB (10GB recommended)
- **Network:** 1 port exposed

### Resource Limits (Configurable)
```yaml
deploy:
  resources:
    limits:
      memory: 2G      # Maximum RAM
      cpus: '1.0'     # Maximum CPU cores
    reservations:
      memory: 512M    # Guaranteed RAM
      cpus: '0.25'    # Guaranteed CPU
```

---

## 🔄 Backup & Restore

### Database Backup
```bash
# Backup database
docker exec mykeymanager sudo -u postgres pg_dump mykeymanager > backup_$(date +%Y%m%d_%H%M%S).sql

# Backup complete data volume
docker run --rm -v mykeymanager_postgres_data:/data -v $(pwd):/backup ubuntu \
  tar czf /backup/data_backup_$(date +%Y%m%d_%H%M%S).tar.gz -C /data .
```

### Restore Process
```bash
# Restore database
cat backup_20250822_120000.sql | docker exec -i mykeymanager sudo -u postgres psql mykeymanager

# Restore data volume
docker run --rm -v mykeymanager_postgres_data:/data -v $(pwd):/backup ubuntu \
  tar xzf /backup/data_backup_20250822_120000.tar.gz -C /data
```

---

## 🚀 Advanced Usage

### Custom SMTP Configuration
```bash
# External SMTP (Gmail example)
docker run -d \
  --name mykeymanager \
  -p 8080:80 \
  -e SMTP_HOST=smtp.gmail.com \
  -e SMTP_PORT=587 \
  -e SMTP_USER=your-email@gmail.com \
  -e SMTP_PASSWORD=your-app-password \
  -e EMAIL_FROM=noreply@yourdomain.com \
  acwild/mykeymanager-all-in-one:latest
```

### Production Deployment with Reverse Proxy
```nginx
# Nginx reverse proxy example
server {
    listen 443 ssl;
    server_name yourdomain.com;
    
    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Docker Swarm Deployment
```yaml
version: '3.8'
services:
  mykeymanager:
    image: acwild/mykeymanager-all-in-one:latest
    deploy:
      replicas: 2
      placement:
        constraints: [node.role == worker]
      resources:
        limits:
          memory: 2G
          cpus: '1.0'
    ports:
      - "8080:80"
    volumes:
      - postgres_data:/var/lib/postgresql/14/main
```

---

## 🆚 Comparison: All-in-One vs Microservices

| Aspect | All-in-One | Microservices |
|--------|-------------|---------------|
| **Setup Time** | 🥇 10 seconds | 🥈 2-3 minutes |
| **Simplicity** | 🥇 Maximum | 🥉 Complex |
| **Scalability** | 🥉 Limited | 🥇 Excellent |
| **Resource Usage** | 🥇 Minimal | 🥉 Higher |
| **Maintenance** | 🥇 Simple | 🥉 Complex |
| **High Availability** | 🥉 Single Point | 🥇 Redundant |
| **Production Ready** | ⚠️ Small/Medium | ✅ Enterprise |

---

## 📚 Documentation & Support

### Complete Documentation
- **GitHub Repository:** https://github.com/Acwildweb/MyKeyManager
- **All-in-One Guide:** [ALL_IN_ONE_GUIDE.md](https://github.com/Acwildweb/MyKeyManager/blob/main/ALL_IN_ONE_GUIDE.md)
- **Advanced Port Config:** [ADVANCED_PORT_CONFIG.md](https://github.com/Acwildweb/MyKeyManager/blob/main/ADVANCED_PORT_CONFIG.md)
- **Deployment Guide:** [DEPLOYMENT_GUIDE.md](https://github.com/Acwildweb/MyKeyManager/blob/main/DEPLOYMENT_GUIDE.md)

### API Documentation
Once running, access the interactive API documentation:
- **Swagger UI:** http://localhost:8080/docs
- **ReDoc:** http://localhost:8080/redoc

### Support
- **GitHub Issues:** https://github.com/Acwildweb/MyKeyManager/issues
- **Email Support:** info@acwild.it
- **Response Time:** 24-48 hours

---

## 🎯 Use Cases

### ✅ Perfect For:
- **Quick demos and presentations**
- **Personal license management** 
- **Small team software tracking**
- **Development and testing**
- **Learning Docker containerization**
- **Workshop and training environments**

### ⚠️ Consider Microservices For:
- **High-traffic production** environments
- **Multi-tenant** requirements  
- **Horizontal scaling** needs
- **High availability** requirements
- **Large team** development

---

## 🏢 About

**Developed by A.c. wild s.a.s**
- 📍 Via Spagna, 33 - Palermo, Italy
- 🌐 www.acwild.it | www.myeliminacode.it  
- 📧 info@acwild.it

## 📄 License

MIT License - see [LICENSE](https://github.com/Acwildweb/MyKeyManager/blob/main/LICENSE) for details.

---

⭐ **If this project helps you, please consider giving it a star on GitHub!**

**MyKeyManager v1.1.1** - 🚀 Choose your deployment: speed, simplicity, or scalability!
