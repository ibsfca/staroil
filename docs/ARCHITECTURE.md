# StarOil Architecture & Tech Stack

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     Gas Station Network                         │
│                                                                 │
│ Station #1          Station #2          Station #3             │
│ ┌──────────────┐   ┌──────────────┐   ┌──────────────┐         │
│ │ Web Browser  │   │ Web Browser  │   │ Web Browser  │         │
│ │ (React +     │   │ (React +     │   │ (React +     │         │
│ │ ServiceWorker)   │ ServiceWorker)   │ ServiceWorker)   │         │
│ └──────┬───────┘   └──────┬───────┘   └──────┬───────┘         │
│        │ HTTPS            │ HTTPS            │ HTTPS            │
│        └─────────────────┬─────────────────┬─┘                  │
│                          │                 │                    │
│                    ┌─────▼─────┐           │                    │
│                    │  Nginx     │           │                    │
│                    │ (Reverse   │           │                    │
│                    │  Proxy)    │           │                    │
│                    └─────┬─────┘           │                    │
└─────────────────────────┼───────────────────┼────────────────────┘
                          │                   │
                    ┌─────▼──────────────────▼──────┐
                    │   Node.js + Express API       │
                    │  (REST Endpoints)             │
                    ├───────────────────────────────┤
                    │ • Auth (JWT)                  │
                    │ • Sales                       │
                    │ • Inventory                   │
                    │ • Shifts                      │
                    │ • Reporting                   │
                    │ • Sync (offline)              │
                    └─────────────┬──────────────────┘
                                  │
                    ┌─────────────▼──────────────┐
                    │   PostgreSQL Database      │
                    │  (Relational DB)           │
                    │                            │
                    │ • Users, Stations          │
                    │ • Sales, Inventory         │
                    │ • Shifts, POs, Refunds     │
                    │ • Sync Queue               │
                    └────────────────────────────┘

Backup & Logging
┌────────────────────────────────────┐
│ • Automated daily DB backups       │
│ • Structured logs (Winston)        │
│ • Audit trail (user actions)       │
└────────────────────────────────────┘
```

---

## Frontend Architecture

### Tech Stack
- **Framework:** React 18 + TypeScript
- **Build Tool:** Vite (fast dev server, optimized bundles)
- **State Management:** Redux Toolkit or Zustand (lightweight alternative)
- **Styling:** TailwindCSS + Headless UI
- **HTTP Client:** Axios with interceptors
- **Navigation:** React Router v6
- **Offline:** Service Worker (Workbox) + IndexedDB
- **Charts:** Recharts or Chart.js
- **Forms:** React Hook Form + Zod validation

### Directory Structure
```
frontend/
├── public/
│   ├── index.html
│   ├── manifest.json (PWA)
│   └── service-worker.js (offline cache)
├── src/
│   ├── components/
│   │   ├── Dashboard/
│   │   ├── SalesEntry/
│   │   ├── InventoryTracking/
│   │   ├── ShiftLog/
│   │   ├── Reports/
│   │   └── common/ (Button, Modal, etc.)
│   ├── pages/
│   │   ├── Login.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Sales/
│   │   ├── Inventory/
│   │   ├── Shifts/
│   │   └── Reports/
│   ├── services/
│   │   ├── api.ts (Axios config + endpoints)
│   │   ├── auth.ts
│   │   ├── storage.ts (IndexedDB)
│   │   └── sync.ts (offline sync queue)
│   ├── store/
│   │   ├── authSlice.ts
│   │   ├── dashboardSlice.ts
│   │   ├── salesSlice.ts
│   │   └── store.ts (Redux)
│   ├── utils/
│   │   ├── validators.ts
│   │   ├── formatters.ts
│   │   └── constants.ts
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useSync.ts
│   │   └── useOffline.ts
│   ├── App.tsx
│   └── main.tsx
├── vite.config.ts
├── tailwind.config.js
├── package.json
└── tsconfig.json
```

### Offline-First Strategy

#### IndexedDB Schema (Client-Side)
```javascript
// Database: startoil-local
// Stores:
{
  sales: { keyPath: 'id' },              // pending sales
  inventory_counts: { keyPath: 'id' },   // pending counts
  shifts: { keyPath: 'id' },             // pending shifts
  refunds: { keyPath: 'id' },            // pending refunds
  sync_queue: { keyPath: 'id' },         // mutations to sync
  cache: { keyPath: 'url' }              // API responses
}
```

#### Sync Flow
1. **Offline Mode:** User creates sale → stored in IndexedDB + sync_queue
2. **Back Online:** Service Worker detects connectivity
3. **Batch Sync:** POST `/api/sync` with queued mutations
4. **Merge:** Server applies changes, returns updated state
5. **Conflict:** If conflict detected, logged for manager review
6. **Purge:** Sync queue cleared on success

#### Service Worker (Workbox)
```typescript
// Cache strategies:
// 1. Network-first (API calls) → fallback to cache
// 2. Cache-first (static assets, images)
// 3. Stale-while-revalidate (non-critical data)

// Sync tags for background sync (when back online)
// Event: 'sync' tag 'sales-sync' triggers batch POST
```

---

## Backend Architecture

### Tech Stack
- **Runtime:** Node.js 18+
- **Framework:** Express.js 4
- **Language:** TypeScript
- **ORM:** Prisma (type-safe database access)
- **Database:** PostgreSQL 14+
- **Auth:** JWT (jsonwebtoken) + bcrypt
- **Validation:** express-validator + Zod
- **Logging:** Winston
- **Email:** Nodemailer (SMTP)
- **File Upload:** Multer
- **Testing:** Jest + Supertest

### Directory Structure
```
backend/
├── src/
│   ├── controllers/
│   │   ├── authController.ts
│   │   ├── salesController.ts
│   │   ├── inventoryController.ts
│   │   ├── shiftsController.ts
│   │   ├── reportsController.ts
│   │   ├── suppliersController.ts
│   │   └── syncController.ts (offline sync)
│   ├── routes/
│   │   ├── auth.ts
│   │   ├── sales.ts
│   │   ├── inventory.ts
│   │   ├── shifts.ts
│   │   ├── reports.ts
│   │   ├── suppliers.ts
│   │   └── index.ts (route aggregator)
│   ├── middleware/
│   │   ├── auth.ts (JWT verification)
│   │   ├── errorHandler.ts
│   │   ├── validation.ts
│   │   ├── logging.ts
│   │   └── roleCheck.ts (RBAC)
│   ├── services/
│   │   ├── authService.ts
│   │   ├── salesService.ts
│   │   ├── inventoryService.ts
│   │   ├── reportService.ts
│   │   ├── emailService.ts
│   │   ├── syncService.ts (offline merge)
│   │   └── csvExportService.ts
│   ├── models/ (Prisma schemas compiled)
│   │   └── (auto-generated from schema.prisma)
│   ├── utils/
│   │   ├── logger.ts (Winston config)
│   │   ├── errorCodes.ts
│   │   └── validators.ts
│   ├── jobs/ (background tasks)
│   │   ├── dailySummaryJob.ts (cron: 11 PM)
│   │   ├── backupJob.ts (cron: 2 AM)
│   │   └── scheduler.ts (node-schedule)
│   ├── database/
│   │   ├── migrations/ (Prisma migrations)
│   │   ├── seeds/ (test data)
│   │   └── schema.prisma
│   ├── app.ts (Express app factory)
│   └── server.ts (entry point)
├── tests/
│   ├── unit/
│   ├── integration/
│   └── fixtures/
├── prisma/
│   ├── schema.prisma (data model definition)
│   ├── migrations/ (version controlled)
│   └── seed.ts
├── .env.example
├── package.json
├── tsconfig.json
└── jest.config.js
```

### Key Endpoints

#### Authentication
```
POST   /api/auth/login             { email, password }
POST   /api/auth/refresh           { refresh_token }
POST   /api/auth/logout
GET    /api/auth/me                (verify current user)
```

#### Sales
```
POST   /api/sales                  { station_id, items[], payment_method }
GET    /api/sales                  ?station_id=&date_from=&date_to=
GET    /api/sales/:id
PATCH  /api/sales/:id              (edit before finalization)
DELETE /api/sales/:id              (void only by manager)
```

#### Inventory
```
GET    /api/inventory              ?station_id=&item_type=
POST   /api/inventory/counts       { station_id, item_id, quantity, count_type }
GET    /api/inventory/counts       ?station_id=&date_from=&date_to=
GET    /api/inventory/low-stock    ?station_id=
PATCH  /api/inventory/:id/reorder  { reorder_level }
```

#### Employee Shifts
```
POST   /api/shifts                 { station_id, clock_in, clock_out, tasks[], notes }
GET    /api/shifts                 ?station_id=&status=&date=
GET    /api/shifts/:id
PATCH  /api/shifts/:id/approve     { manager_notes }
PATCH  /api/shifts/:id/reject      { reason }
```

#### Reporting
```
GET    /api/reports/daily-summary  ?station_id=&date=
GET    /api/reports/export/csv     ?report_type=&date_from=&date_to=
POST   /api/reports/email          ?date=&recipient=
GET    /api/reports/inventory      ?station_id=&date=
GET    /api/reports/payroll        ?station_id=&month=
```

#### Offline Sync
```
POST   /api/sync                   { mutations: [{ id, type, payload, timestamp }] }
       ↓ Server response:
       { status: 'success', conflicts?: [{...}], merged_state: {...} }
```

#### Purchase Orders
```
POST   /api/purchase-orders        { station_id, supplier_id, items[], expected_delivery }
GET    /api/purchase-orders        ?station_id=&status=
PATCH  /api/purchase-orders/:id    { status, notes }
```

---

## Database Design

### PostgreSQL Schema Highlights

#### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'manager', 'employee')),
  station_id UUID REFERENCES stations(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_station_id ON users(station_id);
```

#### Sales Table (with relationships)
```sql
CREATE TABLE sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  station_id UUID NOT NULL REFERENCES stations(id),
  employee_id UUID NOT NULL REFERENCES users(id),
  sale_date DATE NOT NULL,
  sale_time TIME NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  payment_method VARCHAR(50) CHECK (payment_method IN ('cash', 'card')),
  is_finalized BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE sale_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id UUID NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES inventory_items(id),
  quantity DECIMAL(10, 3) NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  subtotal DECIMAL(10, 2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
  fuel_grade VARCHAR(50) -- 'regular', 'premium', 'diesel' (for fuel items)
);

CREATE INDEX idx_sales_station_id ON sales(station_id);
CREATE INDEX idx_sales_date ON sales(sale_date);
```

#### Inventory & Sync Tables
```sql
CREATE TABLE inventory_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  station_id UUID NOT NULL REFERENCES stations(id),
  item_name VARCHAR(255) NOT NULL,
  item_type VARCHAR(50) CHECK (item_type IN ('fuel', 'convenience')),
  sku VARCHAR(100),
  current_quantity DECIMAL(10, 3) NOT NULL DEFAULT 0,
  unit_of_measure VARCHAR(50) DEFAULT 'units',
  reorder_level DECIMAL(10, 3),
  last_count_date TIMESTAMP
);

CREATE TABLE sync_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  station_id UUID NOT NULL REFERENCES stations(id),
  user_id UUID REFERENCES users(id),
  mutation_type VARCHAR(50) NOT NULL, -- 'create_sale', 'create_shift', etc.
  payload JSONB NOT NULL,
  client_timestamp TIMESTAMP NOT NULL,
  server_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'applied', 'conflict'
  conflict_details JSONB, -- if status = 'conflict'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_sync_queue_status ON sync_queue(status);
CREATE INDEX idx_sync_queue_timestamp ON sync_queue(client_timestamp);
```

### Prisma Schema (excerpt)
```prisma
// schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id            String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  email         String    @unique
  passwordHash  String
  firstName     String
  lastName      String
  role          Role      @default(EMPLOYEE)
  stationId     String?   @db.Uuid
  station       Station?  @relation(fields: [stationId], references: [id])
  isActive      Boolean   @default(true)
  lastLogin     DateTime?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  sales         Sale[]
  shifts        EmployeeShift[]
  inventoryCounts InventoryCount[]
  refunds       Refund[]

  @@index([email])
  @@index([stationId])
}

model Sale {
  id              String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  stationId       String    @db.Uuid
  station         Station   @relation(fields: [stationId], references: [id])
  employeeId      String    @db.Uuid
  employee        User      @relation(fields: [employeeId], references: [id])
  saleDate        DateTime
  totalAmount     Decimal   @db.Decimal(10, 2)
  paymentMethod   PaymentMethod
  isFinalized     Boolean   @default(false)
  items           SaleItem[]
  refunds         Refund[]
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  @@index([stationId])
  @@index([saleDate])
}

// ... more models
```

---

## Security Architecture

### Authentication Flow
```
1. User submits credentials (email/password)
   ↓
2. Backend validates & hashes with bcrypt
   ↓
3. Generate JWT token (exp: 8 hours, HS256 algorithm)
   ↓
4. Return { access_token, refresh_token (exp: 7 days) }
   ↓
5. Client stores in httpOnly cookie + localStorage (access)
   ↓
6. All API requests include Authorization: Bearer <JWT>
   ↓
7. Middleware verifies JWT signature & expiry
   ↓
8. On token expiry, client calls POST /refresh with refresh_token
```

### Authorization (RBAC)
```
Middleware: roleCheck(['manager', 'admin'])
  ↓ allows routes only to specified roles
  
GET /api/reports/all-stations
  ↓ requires role: 'manager' or 'admin'
  
DELETE /api/users/:id
  ↓ requires role: 'admin'
```

### Data Encryption
```
- At Rest:
  • Database: PostgreSQL with encrypted columns (pgcrypto)
  • Sensitive fields: password_hash (bcrypt), API keys
  
- In Transit:
  • HTTPS/TLS 1.2+ enforced
  • All APIs require HTTPS
  
- Session:
  • httpOnly, Secure, SameSite=Strict cookies
  • JWT tokens: non-sensitive claims only (user_id, role, iat, exp)
```

### Audit Logging
```
Every action logged (schema):
{
  user_id: UUID,
  action: 'create_sale' | 'approve_shift' | 'login' | ...,
  resource_type: 'Sale' | 'User' | ...,
  resource_id: UUID,
  timestamp: ISO8601,
  changes: { before: {...}, after: {...} },
  ip_address: '192.168.1.1',
  status: 'success' | 'failure'
}

Table: audit_logs
→ Indexed by user_id, action, timestamp
→ Retained for 1 year (configurable)
```

---

## Deployment Architecture

### Docker Compose Stack
```yaml
version: '3.8'
services:
  postgres:
    image: postgres:14-alpine
    environment:
      POSTGRES_DB: startoil
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backups:/backups
    ports:
      - "5432:5432"

  api:
    build: ./backend
    environment:
      NODE_ENV: production
      DATABASE_URL: postgresql://${DB_USER}:${DB_PASSWORD}@postgres:5432/startoil
      JWT_SECRET: ${JWT_SECRET}
    depends_on:
      - postgres
    ports:
      - "3000:3000"
    restart: unless-stopped

  app:
    build: ./frontend
    ports:
      - "3001:80"
    depends_on:
      - api
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./certs:/etc/nginx/certs
    depends_on:
      - api
      - app
    restart: unless-stopped

volumes:
  postgres_data:
```

### Nginx Config (excerpt)
```nginx
upstream api {
  server api:3000;
}

upstream frontend {
  server app:3001;
}

server {
  listen 443 ssl http2;
  server_name manager.gasstation.local;
  
  ssl_certificate /etc/nginx/certs/cert.pem;
  ssl_certificate_key /etc/nginx/certs/key.pem;
  ssl_protocols TLSv1.2 TLSv1.3;
  ssl_ciphers HIGH:!aNULL:!MD5;
  
  # API routes
  location /api {
    proxy_pass http://api;
    proxy_set_header Authorization $http_authorization;
    proxy_pass_header Authorization;
  }
  
  # Frontend static + SPA
  location / {
    proxy_pass http://frontend;
  }
}

# HTTP → HTTPS redirect
server {
  listen 80;
  server_name manager.gasstation.local;
  return 301 https://$server_name$request_uri;
}
```

### Backup & Recovery
```bash
# Automated cron job (2 AM daily)
0 2 * * * pg_dump startoil | gzip > /backups/startoil-$(date +%Y%m%d).sql.gz

# Retention: 30-day rolling window
0 3 * * * find /backups -name "startoil-*.sql.gz" -mtime +30 -delete

# Recovery (if needed)
gzip -dc /backups/startoil-20260323.sql.gz | psql startoil
```

---

## Monitoring & Logging

### Application Logging (Winston)
```typescript
const logger = winston.createLogger({
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

// Log example
logger.info('Sale created', { saleId: '123', amount: 50.00, userId: 'user-456' });
```

### Health Check Endpoint
```
GET /api/health
Returns: { status: 'ok', db: 'connected', uptime: 3600 }
```

### Performance Monitoring
- Response time tracking per endpoint
- Database query performance (Prisma logging)
- Error rate by endpoint
- Cache hit/miss ratios

---

## CI/CD Pipeline (Optional)

### GitHub Actions (test & deploy on push)
```yaml
name: CI/CD

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:14
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run lint
      - run: npm test
      - run: npm run build
  
  deploy:
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - run: ssh deploy@server "cd /app && git pull && docker-compose up -d"
```

---

## Performance Optimizations

### Frontend
- Code splitting (React.lazy, Suspense)
- Image optimization (WebP, lazy loading)
- Service Worker caching (cache-first for static assets)
- Memoization (React.memo, useMemo)

### Backend
- Database indexing (on foreign keys, frequently filtered columns)
- Query optimization (select specific columns, join optimization)
- Connection pooling (PgBouncer)
- API response caching (Redis optional for future)
- Pagination (limit: 50, offset-based or cursor)

### Database
- Partitioning (sales table by date, if > 100M rows)
- Vacuum & analyze (weekly maintenance)
- Prepared statements (via Prisma ORM)

---

## Scalability Roadmap (Post-MVP)

1. **Horizontal Scaling:** Multiple API instances behind load balancer
2. **Caching Layer:** Redis for session storage + query caching
3. **Read Replicas:** PostgreSQL standby for reporting queries
4. **CDN:** CloudFlare for static assets
5. **Message Queue:** Bull.js for async jobs (email, CSV generation)
6. **Microservices (future):** Separate reporting service, sync service

---

**Document Version:** 1.0  
**Last Updated:** March 23, 2026
