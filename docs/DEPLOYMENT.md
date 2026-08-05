# CampusArchive: Production Deployment Specification
**Target Environment:** AWS EC2 (Ubuntu 22.04 LTS) + Nginx + PM2 + SSL + Supabase PostgreSQL

---

## 1. Deployment Stack Diagram

```text
[ Internet Client ]
       │ HTTPS / Port 443 (TLS 1.3)
       ▼
[ Nginx Reverse Proxy / Load Balancer ]
       ├── Static File Serving (/frontend/dist)
       └── Proxy Pass http://localhost:5000 (/api/v1)
              │
              ▼
       [ PM2 Process Manager ]
              ├── Cluster Instance 1 (Node.js API)
              └── Cluster Instance 2 (Node.js API)
                     │
                     ├── [ Supabase PostgreSQL DB ]
                     └── [ AWS S3 / Supabase Storage ]
```

---

## 2. Production Deployment Steps

1. **GitHub Repository Sync:** Push production release tag to GitHub `main` branch.
2. **AWS EC2 Provisioning:** Launch t3.small EC2 instance with Security Group opening ports 80, 443, and SSH (22).
3. **PM2 Cluster Configuration:** Configure `ecosystem.config.js` to manage Node.js cluster instances with auto-restart on failure.
4. **Nginx Reverse Proxy & Let's Encrypt SSL:**
   - Configure Nginx virtual host block routing `/api` to `localhost:5000` and `/` to Vite build output.
   - Run Certbot `certbot --nginx -d campusarchive.edu` for automatic SSL/TLS certificate renewal.
