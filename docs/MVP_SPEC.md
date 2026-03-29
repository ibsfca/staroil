# Gas Station Manager App – MVP Specification

**Project:** StarOil – Multi-Location Gas Station Management System  
**Version:** 1.0 (MVP)  
**Date:** March 2026  
**Status:** Requirements Locked

---

## 1. Executive Summary

A self-hosted, web-based application enabling gas station managers to centrally oversee 2–5 locations, with real-time dashboards, employee shift tracking, POS sales entry, inventory management, and offline-sync capability. Designed for 2–5 employees per location, reliable internet, and self-hosted deployment.

---

## 2. Core Features (MVP Scope)

### 2.1 Point-of-Sale (POS) Sales Entry
- **Web form-based manual entry** (no hardware integration in v1)
- Employee logs sales transaction: date, time, fuel grades sold, convenience items, payment method (cash/card)
- Receipt printable (browser print, PDF export optional)
- Per-location sales entry; manager sees consolidated view
- Simple, fast UX (minimal clicks to complete a sale)

### 2.2 Inventory Management
- **Fuel inventory:** Track aggregate daily sales by grade (Regular, Premium, Diesel)
- **Convenience items:** Manual count-based tracking (snacks, drinks, tobacco)
- Low-stock alerts when items fall below manager-set thresholds
- Daily opening/closing inventory counts entered by employees
- CSV export for reconciliation

### 2.3 Sales Invoicing & Accounts Receivable
- Generate daily/weekly sales invoices per station
- Track customer (if repeat customer sales exists; otherwise minimal for gas station use case)
- Payment reconciliation (cash vs. card breakdown)
- CSV export for accounting

### 2.4 Purchase Orders & Supplier Management
- Create/track purchase orders for fuel and convenience items
- Manage supplier contact info and default pricing
- PO status tracking (pending, received, invoiced)
- CSV export

### 2.5 Returns & Refunds
- Simple refund entry (fuel grade, amount, reason, payment reversal)
- Tracked separately for reconciliation

### 2.6 Employee Shift Management
- Daily shift log per employee:
  - Clock in/out time
  - Tasks completed (checklist)
  - Notes
  - Opening/closing fuel tank readings & convenience inventory counts
  - Submit for manager review
- Manager dashboard: view all shifts, approve/reject, comments

### 2.7 Manager Dashboard (Multi-Location Consolidated View)
- **Real-time KPIs:**
  - Total daily sales (all stations + per-station)
  - Fuel sold by grade (aggregate % breakdown)
  - Top 5 convenience items by revenue
  - Payment method breakdown (cash vs. card %)
  - Cash reconciliation (expected vs. actual, variances flagged)
  
- **Alerts:**
  - Low inventory items (per station)
  - Pending approvals (shifts, returns, POs)
  - End-of-day cash discrepancies
  
- **Reporting:**
  - Daily sales summary email or in-app notification
  - Weekly sales trend
  - Inventory aging report
  - Employee shift summary (hours, attendance)

- **Toggle views:** All stations or drill down to per-station detail

### 2.8 Basic Accounting Sync
- **CSV export** of:
  - Daily sales by station
  - Fuel inventory adjustments
  - Refunds/returns
  - PO receipts
  - General ledger-ready format
- Manual import into QuickBooks/Xero or accounting software

---

## 3. User Roles & Permissions

| Role | Capabilities |
|------|--------------|
| **Admin** | Create stations, manage users, view all reports, system settings |
| **Station Manager** | View own station + all stations (consolidated), approve shifts, manage inventory, generate reports |
| **Employee** | Enter sales, submit shift logs, view own shifts, view station KPIs |

---

## 4. Data Model (High-Level Schema)

### Core Tables

```
STATIONS
├─ id (UUID)
├─ name
├─ address
├─ phone
├─ manager_id (FK → USERS)
├─ created_at
└─ updated_at

USERS
├─ id (UUID)
├─ email
├─ password_hash
├─ first_name
├─ last_name
├─ role (admin, manager, employee)
├─ station_id (FK → STATIONS, NULL for admin)
├─ is_active
├─ created_at
└─ updated_at

SALES
├─ id (UUID)
├─ station_id (FK → STATIONS)
├─ employee_id (FK → USERS)
├─ sale_date
├─ sale_time
├─ total_amount
├─ payment_method (cash, card)
└─ created_at

SALE_ITEMS
├─ id (UUID)
├─ sale_id (FK → SALES)
├─ item_id (FK → INVENTORY_ITEMS)
├─ quantity
├─ unit_price
├─ subtotal
└─ fuel_grade (for fuel: regular, premium, diesel)

INVENTORY_ITEMS
├─ id (UUID)
├─ station_id (FK → STATIONS)
├─ item_name
├─ item_type (fuel, convenience)
├─ sku
├─ current_quantity
├─ unit_of_measure (gallons, units)
├─ reorder_level (low-stock threshold)
├─ last_count_date
├─ created_at
└─ updated_at

INVENTORY_COUNTS
├─ id (UUID)
├─ station_id (FK → STATIONS)
├─ employee_id (FK → USERS)
├─ count_date
├─ count_type (opening, closing)
├─ item_id (FK → INVENTORY_ITEMS)
├─ counted_quantity
├─ notes
└─ created_at

EMPLOYEE_SHIFTS
├─ id (UUID)
├─ station_id (FK → STATIONS)
├─ employee_id (FK → USERS)
├─ shift_date
├─ clock_in_time
├─ clock_out_time
├─ status (submitted, approved, rejected)
├─ tasks_completed (JSON array of task names)
├─ notes
├─ manager_approval_id (FK → USERS, NULL until approved)
├─ approved_at
└─ created_at

REFUNDS
├─ id (UUID)
├─ station_id (FK → STATIONS)
├─ sale_id (FK → SALES, optional)
├─ employee_id (FK → USERS)
├─ refund_date
├─ fuel_grade (if fuel)
├─ amount
├─ reason
├─ status (pending, approved, rejected)
└─ created_at

SUPPLIERS
├─ id (UUID)
├─ name
├─ contact_person
├─ email
├─ phone
├─ address
└─ created_at

PURCHASE_ORDERS
├─ id (UUID)
├─ station_id (FK → STATIONS)
├─ supplier_id (FK → SUPPLIERS)
├─ po_date
├─ expected_delivery_date
├─ status (pending, received, invoiced, cancelled)
├─ total_amount
└─ created_at

PO_ITEMS
├─ id (UUID)
├─ po_id (FK → PURCHASE_ORDERS)
├─ item_id (FK → INVENTORY_ITEMS)
├─ quantity
├─ unit_price
└─ subtotal
```

---

## 5. Tech Stack Recommendation

### Frontend
- **React 18** (component library, state management via Redux Toolkit or Zustand)
- **Vite** (fast build tool, dev server)
- **TypeScript** (type safety)
- **TailwindCSS** (styling, responsive design)
- **Axios** (HTTP client)
- **React Router** (navigation)
- **Offline-first:** Service Worker (Workbox) + IndexedDB for local sync queue
- **Charts:** Recharts or Chart.js for KPI dashboards

### Backend
- **Node.js + Express.js** (lightweight, fast API server)
- **PostgreSQL** (relational DB, ACID compliance for financial data)
- **Prisma ORM** (type-safe database access)
- **JWT** (stateless authentication)
- **Express-validator** (input validation)
- **Multer** (file uploads for CSV import/export)
- **Nodemailer** (email notifications for daily summaries)
- **Winston** (structured logging)

### Infrastructure & Deployment
- **Self-hosted:** Docker + Docker Compose (single-machine or multi-machine deployment)
- **Database:** PostgreSQL 14+
- **Reverse Proxy:** Nginx (SSL, load balancing if needed)
- **Backup:** Automated daily DB backups to local storage or cloud
- **Sync Engine:** Custom sync queue (PostgreSQL-backed) to handle offline changes

### Development Tools
- **Version Control:** Git
- **CI/CD:** GitHub Actions (optional, for testing)
- **Testing:** Jest (unit), React Testing Library (component), Supertest (API)
- **Code Quality:** ESLint, Prettier

---

## 6. Offline-First Architecture

### Goal
Allow stations with occasional internet outages to continue operations and sync when back online.

### Implementation
1. **Frontend Service Worker:**
   - Cache API responses (sales, inventory, shifts)
   - Queue mutations (new sales, refunds, shift submissions) in IndexedDB
   - Retry sync queue every 30s or on manual "sync" button
   
2. **Backend Sync Endpoint:**
   - `/api/sync` accepts batched mutations with timestamps
   - Merges offline changes, detects conflicts, applies last-write-wins or manager-approved resolution
   - Returns updated state to client
   
3. **Conflict Resolution:**
   - If offline change conflicts with newer server data, log conflict and notify manager
   - Manager reviews and approves conflicted transaction

### Status Indicator
- Green: connected
- Yellow: offline (queued for sync)
- Red: sync failed (requires manual review)

---

## 7. Security Requirements

- **Authentication:** JWT tokens (exp: 8 hours), refresh tokens for extended sessions
- **HTTPS:** Enforce SSL/TLS in production
- **Password:** bcrypt hashing (min 12 chars, strength validation)
- **CORS:** Restrict to known station domains
- **Input Validation:** Server-side validation on all endpoints
- **Audit Logging:** Track user actions (login, sales entry, refund approval) for compliance
- **Database Encryption:** Encrypted at rest (optional for MVP; recommended for production)
- **Session Timeout:** Auto-logout after 30 mins of inactivity

---

## 8. Reporting & CSV Exports

### Daily Manager Reports (in-app or email)
1. **Sales Summary:** Total sales, fuel by grade, payment breakdown
2. **Inventory Alerts:** Low stock items, variance from last count
3. **Shift Summary:** Clocked hours, pending approvals
4. **Cash Reconciliation:** Expected cash (sales) vs. drawer count

### CSV Export Endpoints
- Sales transactions (date range, per-station)
- Inventory movements (counts, adjustments)
- PO receipts & supplier payables
- Employee hours & payroll-ready report
- General ledger export (chart of accounts format)

---

## 9. API Endpoints (Core Set)

### Authentication
- `POST /api/auth/login` → JWT token
- `POST /api/auth/refresh` → New token
- `POST /api/auth/logout`

### Stations
- `GET /api/stations` → Manager's stations or all (admin)
- `GET /api/stations/:id/dashboard` → KPI dashboard
- `GET /api/stations/:id/kpis?date_from=&date_to=`

### Sales
- `POST /api/sales` → Create sale entry
- `GET /api/sales?station_id=&date_from=&date_to=` → List sales
- `GET /api/sales/:id` → Sale detail
- `PATCH /api/sales/:id` → Edit (if not finalized)

### Inventory
- `GET /api/inventory?station_id=` → Inventory list
- `POST /api/inventory/counts` → Log count
- `PATCH /api/inventory/:id/reorder_level` → Update threshold
- `GET /api/inventory/low-stock?station_id=` → Alerts

### Employee Shifts
- `POST /api/shifts` → Submit shift log
- `GET /api/shifts?station_id=&status=` → Manager's approval queue
- `PATCH /api/shifts/:id/approve` → Manager approval
- `PATCH /api/shifts/:id/reject` → Manager rejection

### Refunds
- `POST /api/refunds` → Create refund
- `GET /api/refunds?station_id=&status=`
- `PATCH /api/refunds/:id/approve`

### Purchase Orders
- `POST /api/purchase-orders` → Create PO
- `GET /api/purchase-orders?station_id=`
- `PATCH /api/purchase-orders/:id/status` → Update status

### Reporting
- `GET /api/reports/daily-summary?station_id=&date=` → JSON report
- `GET /api/reports/export/csv?report_type=sales&date_from=&date_to=` → CSV download
- `POST /api/reports/email-daily-summary` → Trigger email

### Sync (Offline)
- `POST /api/sync` → Batch mutation sync (offline queue)

---

## 10. UI/UX Wireframe Overview

### Main Navigation
```
Dashboard (KPIs, alerts)
├─ Sales Entry
├─ Inventory
│  ├─ Current Counts
│  ├─ Low Stock Alerts
│  └─ Adjustment Log
├─ Employee Shifts
│  ├─ My Shift Log (for employee)
│  └─ Approval Queue (for manager)
├─ Refunds & Returns
├─ Purchase Orders
├─ Supplier Management
├─ Reports
│  ├─ Daily Summary
│  ├─ Sales Trends
│  ├─ Inventory Report
│  └─ Export to CSV
├─ Settings
│  └─ Users, Stations, Thresholds
└─ Logout
```

### Sample Screens (MVP)

#### 1. **Manager Dashboard**
```
┌─────────────────────────────────────────┐
│ StarOil Manager Dashboard               │
├─────────────────────────────────────────┤
│ [View: All Stations ▼] [Today ▼]       │
├─────────────────────────────────────────┤
│ Total Sales Today: $12,450              │
│ Card: 60% | Cash: 40%                   │
│ Fuel Sold: Regular 500 gal | Premium... │
│ Top Items: Bottled Water, Energy Drink  │
├─────────────────────────────────────────┤
│ ⚠️  LOW STOCK ALERTS                     │
│ • Station #1: Diesel below threshold    │
│ • Station #2: Cigarettes (low)          │
├─────────────────────────────────────────┤
│ ⏳ PENDING APPROVALS                     │
│ • 3 shift submissions (Station #1)      │
│ • 1 refund request (Station #2)         │
├─────────────────────────────────────────┤
│ CASH RECONCILIATION                     │
│ Station #1: Expected $5,200 / Actual... │
└─────────────────────────────────────────┘
```

#### 2. **Sales Entry Form (Employee)**
```
┌─────────────────────────────────────────┐
│ New Sale Entry                          │
├─────────────────────────────────────────┤
│ Date: [Today] Time: [12:34 PM]          │
│                                         │
│ FUEL SALES                              │
│ Regular (gal): [___] @ $3.45            │
│ Premium (gal): [___] @ $3.75            │
│ Diesel (gal): [___] @ $3.35             │
│                                         │
│ CONVENIENCE ITEMS                       │
│ [+ Add Item]                            │
│ • Bottled Water x2 @ $2.00 = $4.00      │
│ • Snack Pack x1 @ $5.99 = $5.99         │
│                                         │
│ Subtotal: $______                       │
│ Payment Method: [Cash ▼]                │
│                                         │
│ [Cancel] [Save & Print] [+ Add Another] │
└─────────────────────────────────────────┘
```

#### 3. **Employee Shift Log**
```
┌─────────────────────────────────────────┐
│ Shift Log - March 23, 2026              │
├─────────────────────────────────────────┤
│ Clock In: [09:00 AM]                    │
│ Clock Out: [05:00 PM]                   │
│                                         │
│ OPENING COUNTS (9:00 AM)                │
│ Regular Tank: [___] gal                 │
│ Premium Tank: [___] gal                 │
│ Diesel Tank: [___] gal                  │
│ Convenience Items: [Count] Button       │
│                                         │
│ TASKS COMPLETED                         │
│ ☑ Clean restrooms                       │
│ ☑ Restock shelves                       │
│ ☐ Check pumps                           │
│                                         │
│ CLOSING COUNTS (5:00 PM)                │
│ Regular Tank: [___] gal                 │
│ Premium Tank: [___] gal                 │
│ Diesel Tank: [___] gal                  │
│                                         │
│ Notes: [___________________]             │
│                                         │
│ [Save as Draft] [Submit for Approval]   │
└─────────────────────────────────────────┘
```

---

## 11. Deployment & Self-Hosting Guide

### Prerequisites
- Linux server (Ubuntu 20.04+) or Windows Server with Docker
- 4 GB RAM, 20 GB disk minimum per station
- Docker & Docker Compose installed
- PostgreSQL 14+ (or bundled in Docker)

### Deployment Steps
1. Clone repo from Git server
2. Run `docker-compose up -d` (spins up API, React, PostgreSQL, Nginx)
3. Create admin user via CLI or web setup wizard
4. Add stations and invite manager/employee users
5. Backup cron job configured (daily at 2 AM)
6. HTTPS certificate provisioned (Let's Encrypt via Certbot)

### Operational Notes
- Each gas station hosts its own instance (isolated DB)
- Central monitoring dashboard optional (future enhancement)
- Backup SOP: Daily snapshots, 30-day retention

---

## 12. MVP Development Roadmap

### Phase 1: Foundation (Weeks 1–3)
- [ ] Backend scaffold (Node.js, Express, PostgreSQL, Prisma)
- [ ] Core data model (Users, Stations, Sales, Inventory)
- [ ] Authentication (JWT login/logout)
- [ ] Database seeding (test data: 2 stations, 5 users, 100 sample sales)

### Phase 2: Core Features (Weeks 4–8)
- [ ] Sales entry form + API
- [ ] Inventory tracking + low-stock alerts
- [ ] Employee shift logging + approval workflow
- [ ] Basic refunds & returns
- [ ] PO management (basic)

### Phase 3: Dashboard & Reporting (Weeks 9–11)
- [ ] Manager KPI dashboard
- [ ] CSV exports
- [ ] Email notifications (daily summary)
- [ ] Basic charts (sales trend, fuel breakdown)

### Phase 4: Offline & Polish (Weeks 12–13)
- [ ] Service Worker + IndexedDB cache
- [ ] Offline sync queue
- [ ] Mobile-responsive UI
- [ ] Testing (unit, integration, E2E)

### Phase 5: Deployment & UAT (Week 14+)
- [ ] Docker setup & docs
- [ ] Security review & hardening
- [ ] Load testing & optimization
- [ ] User training materials
- [ ] Go-live to pilot station(s)

**Estimated Total Effort:** 14 weeks (1 full-stack dev + 1 UI/UX dev) or 10 weeks (2 full-stack devs)

---

## 13. Success Metrics (First 3 Months)

- ✅ Zero unplanned downtime post-launch
- ✅ Average sales entry time < 60 seconds
- ✅ Manager dashboard load time < 3 seconds
- ✅ 95%+ shift approvals processed same-day
- ✅ Inventory variance < 2% (accurate counts)
- ✅ Employee adoption > 80% (active usage)
- ✅ Net Promoter Score (NPS) > 50
- ✅ Payback period on software cost < 6 months (time saved + accuracy)

---

## 14. Risk Mitigation

| Risk | Mitigation |
|------|-----------|
| Internet outage | Offline-first sync queue + local caching |
| Data loss | Daily automated backups (30-day retention) |
| Unauthorized access | JWT auth + RBAC, audit logging |
| Hardware failure | Hot-swap backup server + failover DNS |
| Employee resistance | Training + quick-reference guides + phone support |
| Scope creep | Lock MVP features; features post-launch in roadmap |

---

## 15. Future Enhancements (Post-MVP)

- [ ] Mobile app (iOS/Android native or React Native)
- [ ] Pump integration (real-time fuel data, price locks)
- [ ] Advanced analytics (predictive demand, margin analysis)
- [ ] Multi-station consolidated reporting (single cloud dashboard)
- [ ] QuickBooks/Xero direct integration (sync GL automatically)
- [ ] Loyalty program integration
- [ ] Driver/tanker truck management (for fuel delivery tracking)
- [ ] AI-driven inventory forecasting

---

## Appendix: Glossary

- **POS:** Point of Sale (sales entry, transactions)
- **SKU:** Stock Keeping Unit (product code)
- **KPI:** Key Performance Indicator (metrics)
- **JWT:** JSON Web Token (authentication)
- **ORM:** Object Relational Mapping (database interface)
- **CSV:** Comma-Separated Values (spreadsheet export)
- **RBAC:** Role-Based Access Control (permissions)
- **API:** Application Programming Interface (server endpoints)

---

**Document Owner:** Product Manager  
**Last Updated:** March 23, 2026  
**Next Review:** After MVP launch
