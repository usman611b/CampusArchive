# CampusArchive: DevOps & Cloud Architecture Specification
**Production Deployment & Infrastructure Engineering Specification v1.0.0**
**Author:** Senior DevOps Engineer & Cloud Architect
**Date:** August 2026
**Target Architecture:** $0 Free-Tier MVP (AWS EC2 + Supabase + Nginx + PM2 + Cloudflare)

---

## Table of Contents
1. [Deployment Architecture & Request Flow](#1-deployment-architecture--request-flow)
2. [Server Setup & System Configuration](#2-server-setup--system-configuration)
3. [Domain, DNS & SSL Architecture](#3-domain-dns--ssl-architecture)
4. [Environment Variables & Secret Management](#4-environment-variables--secret-management)
5. [Git Workflow & Deployment Pipeline](#5-git-workflow--deployment-pipeline)
6. [Monitoring, Observability & Log Management](#6-monitoring-observability--log-management)
7. [Security Hardening & Infrastructure Protection](#7-security-hardening--infrastructure-protection)
8. [Backup & Data Protection Strategy](#8-backup--data-protection-strategy)
9. [Disaster Recovery & Operational Runbook](#9-disaster-recovery--operational-runbook)
10. [Scaling Plan ($0 Free-Tier MVP vs Enterprise)](#10-scaling-plan-0-free-tier-mvp-vs-enterprise)

---

# 1. Deployment Architecture & Request Flow

### 1.1 High-Level $0 MVP Infrastructure Topology
The production infrastructure runs on a **Single AWS EC2 Free Tier (`t2.micro` / `t3.micro` - 1 vCPU, 1GB RAM, 8GB EBS)** instance running Ubuntu 24.04 LTS, integrated with managed Supabase cloud services and Cloudflare DNS.

```
+---------------------------------------------------------------------------------------------------+
|                                     CLIENT EDGE / PUBLIC INTERNET                                 |
|                         (Browser Clients / Mobile PWA / University Networks)                      |
+---------------------------------------------------|-----------------------------------------------+
                                                    | HTTPS (Port 443) / WSS
                                                    v
+---------------------------------------------------------------------------------------------------+
|                                CLOUDFLARE FREE TIER EDGE SERVICES                                 |
|  - DNS Resolution (A Records pointing to AWS EC2 Elastic IP)                                      |
|  - Free Proxy DDoS Mitigation & Edge SSL (Full/Strict Mode)                                       |
+---------------------------------------------------|-----------------------------------------------+
                                                    | Encrypted HTTPS / TLS 1.3
                                                    v
+---------------------------------------------------------------------------------------------------+
|                            AWS EC2 FREE TIER INSTANCE (Ubuntu 24.04 LTS)                         |
|                                                                                                   |
|  +---------------------------------------------------------------------------------------------+  |
|  | FIREWALL (UFW): Open Ports 22 (SSH), 80 (HTTP), 443 (HTTPS) Only                           |  |
|  +----------------------------------------------+----------------------------------------------+  |
|                                                 |                                                 |
|                                                 v                                                 |
|  +---------------------------------------------------------------------------------------------+  |
|  | NGINX REVERSE PROXY & STATIC FILE SERVER                                                    |  |
|  |  - Serves Built React SPA Static Assets directly from `/var/www/campusarchive/frontend/dist`  |  |
|  |  - Handles Let's Encrypt TLS 1.3 SSL Termination & Auto-Redirect (HTTP -> HTTPS)            |  |
|  |  - Proxies `/api/v1/*` requests to Node.js backend on `http://127.0.0.1:4000`                |  |
|  +----------------------------------------------+----------------------------------------------+  |
|                                                 |                                                 |
|                                                 v                                                 |
|  +---------------------------------------------------------------------------------------------+  |
|  | PM2 PROCESS MANAGER (Node.js Express App Cluster)                                           |  |
|  |  - Process Name: `campusarchive-api` (Port 4000)                                           |  |
|  |  - Auto-restart on crash / System reboot (`pm2 startup`)                                   |  |
|  +---------------------------------------------------------------------------------------------+  |
+---------------------------------------------------|-----------------------------------------------+
                                                    | HTTPS / WSS / SQL SDK
                                                    v
+---------------------------------------------------------------------------------------------------+
|                                  SUPABASE CLOUD MANAGED SERVICES                                  |
|  +------------------------------+  +---------------------------+  +-----------------------------+ |
|  | Supabase PostgreSQL Database |  | Supabase Auth Service     |  | Supabase Object Storage     | |
|  | (Entities, FTS, pgvector)    |  | (JWT Issuance & Signatures)|  | (Documents, Images, Avatars)| |
|  +------------------------------+  +---------------------------+  +-----------------------------+ |
+---------------------------------------------------------------------------------------------------+
```

### 1.2 Step-by-Step Request Flow
1. **Static Frontend Request:** User visits `https://campusarchive.com`. Cloudflare resolves DNS to the EC2 Elastic IP. Nginx catches port 443 and directly streams static HTML/JS/CSS assets from local disk (`/var/www/campusarchive/frontend/dist`).
2. **API Request Routing:** React app calls `https://campusarchive.com/api/v1/resources`. Nginx catches the `/api/` prefix and reverse-proxies the request internally to `http://127.0.0.1:4000`.
3. **Backend Execution:** Node.js/Express app running under PM2 processes the request, validates JWT with Supabase Auth, executes business logic, and queries PostgreSQL via Supabase SDK.
4. **Direct File Upload Stream:** File uploads bypass EC2 RAM entirely. Express issues a pre-signed URL pointing directly to Supabase Storage API (`https://<project-id>.supabase.co/storage/v1/object/...`). The React client PUTs binary data straight to Supabase Storage.

---

# 2. Server Setup & System Configuration

### 2.1 Server Specifications
* **Operating System:** Ubuntu 24.04 LTS (Noble Numbat).
* **Instance Type:** AWS EC2 `t2.micro` or `t3.micro` (1 vCPU, 1GB RAM, 8GB EBS SSD).
* **Static Network Address:** AWS Elastic IP attached to instance to guarantee permanent IP address.

### 2.2 Software Stack Installation & Specs
1. **Node.js Runtime:** Node.js 20 LTS installed via NodeSource binary distributions.
2. **Package Manager:** `npm` v10+.
3. **Process Manager:** PM2 global package (`npm install -g pm2`).
4. **Web Server / Proxy:** Nginx (`sudo apt install nginx`).
5. **SSL Automation:** Certbot & Nginx plugin (`sudo apt install certbot python3-certbot-nginx`).
6. **Firewall:** Uncomplicated Firewall (`UFW`).

### 2.3 Firewall Security Rules (UFW Blueprint)
To prevent unauthorized entry, UFW blocks all inbound ports except SSH, HTTP, and HTTPS:
```
Status: active
To                         Action      From
--                         ------      ----
22/tcp (SSH)               ALLOW       Anywhere
80/tcp (HTTP)              ALLOW       Anywhere
443/tcp (HTTPS)            ALLOW       Anywhere
```
*Port 4000 (Node.js API) is strictly bound to `127.0.0.1` and blocked from external ingress.*

---

# 3. Domain, DNS & SSL Architecture

### 3.1 DNS Configuration Blueprint (Cloudflare / Registrar)
* **Root A Record:** `campusarchive.com` -> Points to EC2 Elastic IP (`Proxy Status: Proxied`).
* **Subdomain CNAME Record:** `api.campusarchive.com` -> Points to `campusarchive.com`.
* **Wildcard A Record (Multi-Tenant Ready):** `*.campusarchive.com` -> Points to EC2 Elastic IP.

### 3.2 Nginx Reverse Proxy Production Blueprint
```nginx
# /etc/nginx/sites-available/campusarchive.conf

# 1. HTTP to HTTPS Automatic Redirection
server {
    listen 80;
    listen [::]:80;
    server_name campusarchive.com www.campusarchive.com api.campusarchive.com;
    return 301 https://$host$request_uri;
}

# 2. Primary Production Server Block (HTTPS)
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name campusarchive.com www.campusarchive.com api.campusarchive.com;

    # Let's Encrypt Certificates
    ssl_certificate /etc/letsencrypt/live/campusarchive.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/campusarchive.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Gzip Payload Compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml image/svg+xml;

    # Security Headers
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains" always;

    # Frontend Static Single-Page Application (React)
    location / {
        root /var/www/campusarchive/frontend/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
        expires 30d;
    }

    # API Proxy Gateway (Express Backend)
    location /api/ {
        proxy_pass http://127.0.0.1:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 60s;
    }
}
```

### 3.3 SSL Certificate Automation
* Certificates managed via Let's Encrypt Certbot.
* Automatic renewal verified via systemd timer (`certbot.timer`) executing `certbot renew --quiet` twice daily.

---

# 4. Environment Variables & Secret Management

### 4.1 Frontend Environment Specifications (`frontend/.env.production`)
*Note: Frontend variables are bundled into static JS during build time.*
```env
VITE_API_BASE_URL=https://campusarchive.com/api/v1
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 4.2 Backend Environment Specifications (`backend/.env`)
*Note: Stored strictly on server file system (`/var/www/campusarchive/backend/.env`) with restricted permissions (`chmod 600`).*
```env
PORT=4000
NODE_ENV=production
CORS_ORIGIN=https://campusarchive.com

# Supabase Managed Credentials
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.service_role...
SUPABASE_JWT_SECRET=your-super-secret-jwt-signing-key

# Rate Limiting Settings
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 4.3 Environment Variable Protection Best Practices
* **Zero Secrets in Git:** `.env`, `.env.local`, and build artifacts strictly added to `.gitignore`.
* **Runtime Startup Assertion:** Backend validates all environment variables on boot via Zod schema (`env.config.ts`); app terminates instantly if mandatory keys are missing.

---

# 5. Git Workflow & Deployment Pipeline

### 5.1 Branching Model
* `main`: Production-ready code. Commits trigger deployment builds.
* `develop`: Active feature integration branch.

### 5.2 Lightweight $0 Zero-Downtime Deployment Process

```
[ Developer Push to main ] 
         │
         v
[ GitHub Repository ]
         │
         v (Manual SSH or GitHub Action Runner)
[ Connect to EC2 Server ]
         │
         ├── 1. `git pull origin main`
         ├── 2. Build Frontend: `cd frontend && npm install && npm run build`
         ├── 3. Build Backend: `cd ../backend && npm install && npm run build`
         └── 4. Zero-Downtime Reload: `pm2 reload ecosystem.config.js`
```

### 5.3 PM2 Ecosystem Production Configuration Blueprint
```javascript
// /var/www/campusarchive/backend/ecosystem.config.js
module.exports = {
  apps: [
    {
      name: 'campusarchive-api',
      script: './dist/server.js',
      instances: 1, // Single instance for EC2 Free Tier memory bounds
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '400M', // Prevents EC2 RAM exhaustion
      env_production: {
        NODE_ENV: 'production',
        PORT: 4000
      }
    }
  ]
};
```

---

# 6. Monitoring, Observability & Log Management

### 6.1 Process & System Monitoring
* **PM2 Process Health:** Monitored via `pm2 status` and real-time CPU/Memory dashboard (`pm2 monit`).
* **Disk Space Alerting:** OS cron job checking `df -h` to alert if EBS storage utilization exceeds 85%.

### 6.2 Log Management & Log Rotation Blueprint
To prevent the 8GB EC2 EBS SSD disk from filling up, all logs are rotated automatically:

1. **PM2 Log Rotation (`pm2-logrotate` module):**
   * Max log size: 10MB per file.
   * Retained files: 7 rotated logs.
   * Compression: Gzip.
2. **Nginx Logs:** Managed via OS `/etc/logrotate.d/nginx` rotating logs weekly with 14-day retention.
3. **Application Logs:** Structured JSON logs produced via Pino written to `/var/log/campusarchive/app.log`.

---

# 7. Security Hardening & Infrastructure Protection

1. **SSH Hardening (`/etc/ssh/sshd_config`):**
   * Password Authentication disabled (`PasswordAuthentication no`). Only RSA/Ed25519 SSH keys permitted.
   * Root login forbidden (`PermitRootLogin no`). Access limited to non-root `ubuntu` user with `sudo` rights.
   * Default SSH port optional customization.
2. **HTTP Security Headers (Nginx):** Enforces HSTS (2 years), `X-Frame-Options DENY`, `X-Content-Type-Options nosniff`, and CSP headers.
3. **Application Unprivileged Execution:** Express app executed under non-root PM2 process context.
4. **File System Permissions:** Site root directory owned by `ubuntu:www-data` with restrictive `755` folder and `644` file permissions. `.env` permissions set to `600`.

---

# 8. Backup & Data Protection Strategy

```
+--------------------------------------------------------------------------------------------------+
|                                BACKUP & DATA PROTECTION STRATEGY                                 |
|                                                                                                  |
|  +------------------------------+   +------------------------------+   +----------------------+  |
|  | PostgreSQL Database          |   | Supabase Object Storage      |   | EC2 Server Configs   |  |
|  | - Managed Daily Snapshots    |   | - Multi-AZ Cloud Storage     |   | - Git Versioned Code |  |
|  | - Continuous WAL Archives    |   | - Immutable Bucket Policies  |   | - GitHub Repository  |  |
|  | - 30-Day PITR Retention    |   | - Quarantine Path Guard      |   | - Config Backups     |  |
|  +------------------------------+   +------------------------------+   +----------------------+  |
+--------------------------------------------------------------------------------------------------+
```

1. **Database Backups (Supabase Managed):**
   * Daily automatic database snapshots retained for 30 days.
   * Continuous Write-Ahead Log (WAL) archiving enabling Point-In-Time Recovery (PITR).
2. **Uploaded Documents (Supabase Storage):**
   * Binary files stored in AWS S3 multi-AZ cloud infrastructure managed by Supabase, offering 99.999999999% (11 9s) durability.
3. **Server Configuration Backups:**
   * Nginx site configurations, PM2 ecosystem files, and build scripts tracked in private GitHub repository.

---

# 9. Disaster Recovery & Operational Runbook

### 9.1 Emergency Recovery Runbooks

#### Scenario 1: Server Unexpected Reboot (Power Outage / AWS Maintenance)
* **Automated Recovery:** PM2 system service automatically restarts Node.js application on boot (`pm2 startup`). Nginx starts automatically via systemd.
* **Verification:** Run `pm2 status` and `systemctl status nginx`.

#### Scenario 2: Node.js Application Crash (Uncaught Exception)
* **Automated Recovery:** PM2 automatically restarts the process in < 1 second.
* **Investigation:** Inspect crash stack trace via `pm2 logs campusarchive-api --err --lines 100`.

#### Scenario 3: SSL Certificate Expiration / Failure
* **Manual Recovery Command:** `sudo certbot renew --force-renewal` followed by `sudo systemctl reload nginx`.

---

# 10. Scaling Plan ($0 Free-Tier MVP vs Enterprise)

```
+---------------------------------------------------------------------------------------------------+
|                                 INFRASTRUCTURE EVOLUTION PATH                                     |
|                                                                                                   |
|  [ Current $0 Free-Tier MVP ]                                                                     |
|  Single AWS EC2 Instance (Nginx + React Static + Express Node API) + Supabase Free Cloud          |
|                                                                                                   |
|                                         │ Migration Path                                          |
|                                         v                                                         |
|  [ Future Enterprise Architecture ]                                                               |
|  - Edge CDN: AWS CloudFront / Cloudflare Enterprise (Static Assets & Global Caching)              |
|  - Compute Tier: AWS ECS Fargate Containers (Auto-scaling Node.js API Cluster)                    |
|  - Load Balancer: AWS Application Load Balancer (ALB) with SSL Termination                        |
|  - Database Tier: AWS RDS PostgreSQL (Multi-AZ Master + Read Replicas) / Supabase Pro             |
|  - In-Memory Cache: AWS ElastiCache Redis Cluster (Session & Rate Limit Caching)                  |
+---------------------------------------------------------------------------------------------------+
```

### 10.1 Comparative Architectural Scale Specs

| Infrastructure Layer | Current $0 Free-Tier MVP | Future Enterprise Scale Path |
| :--- | :--- | :--- |
| **Monthly Operating Cost** | **$0.00 / month** | $150.00+ / month |
| **Compute Hosting** | Single AWS EC2 `t2.micro` (1 vCPU, 1GB RAM) | AWS ECS Fargate Auto-Scaling Container Cluster |
| **Web Server / Proxy** | Local Nginx Reverse Proxy | AWS Application Load Balancer (ALB) |
| **Content Delivery** | Direct Nginx Disk Delivery | AWS CloudFront Global Edge CDN |
| **Database Tier** | Supabase Free Managed PostgreSQL | Supabase Pro / AWS RDS PostgreSQL Multi-AZ |
| **Caching Subsystem** | Local In-Memory `node-cache` (24h TTL) | AWS ElastiCache Redis Cluster |
| **User Load Capacity** | Up to 10,000 Active Users | 100,000+ Active Users |

---
**End of DevOps & Cloud Architecture Specification**
