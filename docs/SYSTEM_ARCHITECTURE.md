# CampusArchive: System Architecture Specification
**Document Version:** 1.0.0  
**Target Infrastructure:** AWS EC2 + S3 / Supabase PostgreSQL / Node.js + Express / React SPA

---

## 1. High-Level Architecture Diagram

```text
+---------------------------------------------------------------------------------------------------+
|                                      CLIENT TIER (User Interfaces)                                 |
|  +-----------------------------------+  +-----------------------------------+  +----------------+ |
|  | Web Browser (React SPA / Vite)    |  |  Mobile Web / PWA Client App      |  | Desktop Client | |
|  +-----------------------------------+  +-----------------------------------+  +----------------+ |
+---------------------------------------------------|-----------------------------------------------+
                                                    | HTTPS / TLS 1.3
                                                    v
+---------------------------------------------------------------------------------------------------+
|                                INGRESS & EDGE ROUTING TIER                                        |
|  +----------------------------------------------------------------------------------------------+  |
|  |  CloudFront CDN / Cloudflare Edge (DDoS Protection, Web Application Firewall, Static Caching)  |  |
|  +----------------------------------------------------------------------------------------------+  |
|                                                   | Internal Proxy / SSL Termination               |
|  +----------------------------------------------------------------------------------------------+  |
|  |  Nginx Reverse Proxy & Load Balancer (SSL Termination, Gzip/Brotli, Rate Limiting, HTTP/2)    |  |
|  +----------------------------------------------------------------------------------------------+  |
+---------------------------------------------------|-----------------------------------------------+
                                                    | HTTP REST API
                                                    v
+---------------------------------------------------------------------------------------------------+
|                                APPLICATION SERVICE TIER (Stateless)                               |
|  +----------------------------------------------------------------------------------------------+  |
|  | Node.js / Express API Gateway & Application Server Cluster (PM2 Process Manager)              |  |
|  |  [ Auth Guard ] [ Validation Middleware ] [ Security Headers ] [ Router ] [ Controller Layer] |  |
|  +----------------------------------------------------------------------------------------------+  |
|         |                     |                      |                        |                   |
|         v                     v                      v                        v                   |
|  +--------------+    +-----------------+    +------------------+    +-------------------+         |
|  | Auth Module  |    | Academic Module |    | Resource Module  |    | Search & Admin    |         |
|  +--------------+    +-----------------+    +------------------+    +-------------------+         |
+---------|---------------------|----------------------|------------------------|-------------------+
                                | SQL Queries / S3 SDK
                                v
+---------------------------------------------------------------------------------------------------+
|                                   DATA & STORAGE TIER                                             |
|  +------------------------------+  +---------------------------+  +-----------------------------+ |
|  | PostgreSQL Database          |  | Redis In-Memory Cache     |  | AWS S3 / Supabase Storage   | |
|  | (Universities, Courses,      |  | (Session Tokens,          |  | (PDF Files, Thumbnails,     | |
|  |  Resources, Comments, Stats) |  |  Rate Limit Windows)      |  |  Quarantined Uploads)       | |
|  +------------------------------+  +---------------------------+  +-----------------------------+ |
+---------------------------------------------------------------------------------------------------+
```

---

## 2. Layer Responsibilities

### 2.1 Ingress Tier (Nginx + SSL)
- SSL/TLS Termination using Let's Encrypt certificates.
- Reverse proxy forwarding requests on port 80/443 to backend Node.js server (port 5000) and frontend static files.
- Rate limiting to prevent brute-force attacks and scrapers.

### 2.2 Application Tier (Node.js + Express + PM2)
- Express router utilizing clean modular controller-service-repository patterns.
- Pre-signed URL generator for secure file upload/download directly to cloud storage.
- Statutory RBAC authorization middleware (`Student`, `Moderator`, `Administrator`).

### 2.3 Persistence Tier (Supabase PostgreSQL + Storage)
- Relational schema enforcing foreign key integrity across `Universities` → `Departments` → `Programs` → `Semesters` → `Courses` → `Resources`.
- Binary object storage configured with CORS policies and bucket isolation.
