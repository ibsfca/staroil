# StarOil – Gas Station Manager App

A modern, self-hosted web application for managing multiple gas stations. Features real-time dashboards, employee shift tracking, POS sales entry, inventory management, and offline-sync capability.

**Status:** MVP Specification & Architecture Complete | Ready for Development

---

## 🎯 Quick Start

### For Project Managers / Stakeholders
1. Read [`docs/MVP_SPEC.md`](docs/MVP_SPEC.md) – Complete feature set, timeline, success metrics
2. Read [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) – Tech stack, system design, deployment

### For Developers
1. Clone this repo
2. Follow [Setup Instructions](#setup) below
3. Refer to [Project Structure](#project-structure) for file organization
4. Check [Development](#development) for build & test commands

---

## 📋 Features (MVP)

✅ **Point-of-Sale (POS):** Manual sales entry with multiple payment methods (cash, card)  
✅ **Inventory Tracking:** Fuel by grade + convenience items with low-stock alerts  
✅ **Employee Shifts:** Daily shift logs with task completion & approval workflow  
✅ **Sales Invoicing:** Daily/weekly invoices with payment reconciliation  
✅ **Purchase Orders:** Manage supplier orders & receipts  
✅ **Returns & Refunds:** Track refunds with audit trail  
✅ **Manager Dashboard:** Real-time KPIs (sales, fuel, top items, cash reconciliation) across all stations  
✅ **Reporting:** CSV exports, email summaries, trend reports  
✅ **Offline-First:** Continues working offline; syncs when internet returns  
✅ **Self-Hosted:** Single-machine Docker deployment per station  
✅ **Role-Based Access:** Admin, Manager, Employee permissions  

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18 + TypeScript, Vite, TailwindCSS, Redux Toolkit, Service Workers (offline) |
| **Backend** | Node.js + Express.js, TypeScript |
| **Database** | PostgreSQL 14+ |
| **ORM** | Prisma |
| **Auth** | JWT (8h tokens) + bcrypt |
| **Deployment** | Docker + Docker Compose, Nginx (reverse proxy) |
| **Logging** | Winston |
| **Testing** | Jest, React Testing Library, Supertest |

---

## 📦 Project Structure

```
StarOil/
├── backend/                           # Node.js REST API
│   ├── src/
│   │   ├── controllers/               # Request handlers
│   │   ├── routes/                    # API endpoint definitions
│   │   ├── middleware/                # Auth, validation, error handling
│   │   ├── services/                  # Business logic
│   │   ├── database/                  # Prisma schema & migrations
│   │   ├── utils/                     # Helpers, validators, logger
│   │   ├── jobs/                      # Cron tasks (backups, emails)
│   │   ├── app.ts                     # Express app factory
│   │   └── server.ts                  # Server entry point
│   ├── tests/                         # Unit, integration tests
│   ├── prisma/
│   │   ├── schema.prisma              # Data model definition
│   │   └── migrations/                # Version-controlled DB migrations
│   ├── .env.example                   # Environment variables template
│   ├── Dockerfile
│   ├── package.json
│   └── README.md                      # Backend-specific setup
│
├── frontend/                          # React web app
│   ├── public/
│   │   ├── index.html
│   │   ├── manifest.json              # PWA manifest
│   │   └── service-worker.js          # Offline support
│   ├── src/
│   │   ├── components/                # Reusable React components
│   │   ├── pages/                     # Page-level components
│   │   ├── services/                  # API calls, storage, sync
│   │   ├── store/                     # Redux slices
│   │   ├── hooks/                     # Custom React hooks
│   │   ├── utils/                     # Formatters, validators, constants
│   │   ├── App.tsx                    # Main app component
│   │   └── main.tsx                   # React entry point
│   ├── tests/                         # Component & integration tests
│   ├── vite.config.ts                 # Vite build config
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   ├── package.json
│   └── README.md                      # Frontend-specific setup
│
├── docs/                              # Project documentation
│   ├── MVP_SPEC.md                    # Feature spec, data model, roadmap
│   ├── ARCHITECTURE.md                # Tech stack, system design, deployment
│   ├── API_ENDPOINTS.md               # Detailed API reference (TBD)
│   ├── DATABASE_SCHEMA.md             # Full Prisma schema (TBD)
│   ├── DEPLOYMENT.md                  # Self-hosting guide (TBD)
│   └── TROUBLESHOOTING.md             # Common issues & fixes (TBD)
│
├── docker-compose.yml                 # Multi-container orchestration
├── nginx.conf                         # Reverse proxy configuration
├── .gitignore
├── .env.example                       # Root environment template
└── README.md                          # This file
```

---

## 🚀 Setup Instructions

### Prerequisites
- **Node.js** 18+ (LTS recommended)
- **Docker** & **Docker Compose** (for containerized deployment)
- **PostgreSQL** 14+ (or use Docker image)
- **Git** for version control

### Local Development (Without Docker)

#### 1. Clone Repository
```bash
git clone <repo-url>
cd StarOil
```

#### 2. Backend Setup
```bash
cd backend
cp .env.example .env
# Edit .env with your database credentials

npm install
npm run prisma:generate
npm run prisma:migrate
npm run seed                  # Optional: load test data
npm run dev                   # Start API on http://localhost:3000
```

#### 3. Frontend Setup (New Terminal)
```bash
cd frontend
cp .env.example .env
# Edit .env with API_URL=http://localhost:3000

npm install
npm run dev                   # Start on http://localhost:5173
```

#### 4. Access Application
- **Frontend:** http://localhost:5173
- **API:** http://localhost:3000/api/health

### Docker Deployment (Production-Ready)

#### 1. Configure Environment
```bash
cp .env.example .env
# Edit .env for your gas station (DB credentials, JWT secret, mail settings)
```

#### 2. Build & Run
```bash
docker-compose build
docker-compose up -d
```

#### 3. Initialize Database (First Run Only)
```bash
docker-compose exec api npm run prisma:migrate
docker-compose exec api npm run seed
```

#### 4. Access Application
- **Frontend:** https://manager.gasstation.local (configure DNS/hosts)
- **API:** https://manager.gasstation.local/api

#### 5. View Logs
```bash
docker-compose logs -f api
docker-compose logs -f app
```

---

## 🔧 Development

### Build Backend
```bash
cd backend
npm run build                 # Compile TypeScript → dist/
npm run lint                  # ESLint check
npm run type-check           # TypeScript check
```

### Build Frontend
```bash
cd frontend
npm run build                 # Vite build → dist/
npm run preview              # Preview production build locally
```

### Run Tests
```bash
# Backend unit tests
cd backend && npm test

# Frontend component tests
cd frontend && npm test

# Integration tests (requires API running)
cd backend && npm run test:integration
```

### Database Management

#### Generate Prisma Client
```bash
cd backend
npm run prisma:generate
```

#### Create Database Migration
```bash
# After modifying schema.prisma
npm run prisma:migrate dev --name <migration_name>
```

#### Reset Database (⚠️ deletes all data)
```bash
npm run prisma:reset
```

#### View Database in Prisma Studio
```bash
npm run prisma:studio        # Opens UI at http://localhost:5555
```

---

## 📖 API Documentation

### Authentication
```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"manager@station1.local","password":"password123"}'

# Response
{
  "accessToken": "eyJhbGc...",
  "refreshToken": "...",
  "user": { "id": "uuid", "email": "...", "role": "manager" }
}

# Use in subsequent requests
curl -X GET http://localhost:3000/api/sales \
  -H "Authorization: Bearer eyJhbGc..."
```

### Sales Entry
```bash
curl -X POST http://localhost:3000/api/sales \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "stationId": "station-uuid",
    "items": [
      { "itemId": "fuel-regular", "quantity": 10, "unitPrice": 3.45, "fuelGrade": "regular" },
      { "itemId": "water-bottle", "quantity": 2, "unitPrice": 2.00 }
    ],
    "paymentMethod": "card",
    "saleDate": "2026-03-23",
    "saleTime": "12:30"
  }'
```

### Dashboard KPIs
```bash
curl -X GET "http://localhost:3000/api/reports/daily-summary?station_id=<uuid>&date=2026-03-23" \
  -H "Authorization: Bearer <token>"

# Response includes sales total, fuel breakdown, top items, payment methods, etc.
```

For complete API reference, see [`docs/API_ENDPOINTS.md`](docs/API_ENDPOINTS.md) (to be created during development).

---

## 🔐 Security

- **HTTPS/TLS:** Required in production (Nginx enforces HTTPS redirect)
- **Authentication:** JWT tokens with 8-hour expiry
- **Password Hashing:** bcrypt (12 rounds)
- **Input Validation:** Server-side validation on all endpoints
- **CORS:** Restricted to configured domains
- **Audit Logging:** All user actions logged (login, sales, approvals)
- **Database Encryption:** Passwords & sensitive fields hashed
- **Session Timeout:** Auto-logout after 30 minutes inactivity

See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for detailed security architecture.

---

## 📊 Offline-First Sync

When internet is unavailable:
1. Employee creates sale → stored locally in browser IndexedDB
2. Status indicator shows "Offline (queued)"
3. When connection returns → automatic batch sync to server
4. Manager dashboard updated with merged data

### Manual Sync Trigger
```javascript
// In browser console
await syncQueue.syncNow();
```

See [`frontend/src/services/sync.ts`](frontend/src/services/sync.ts) for implementation details.

---

## 📦 Deployment

### Self-Hosted (Single Machine)
1. **Server Requirements:** 4 GB RAM, 20 GB disk, Ubuntu 20.04+ or Windows Server
2. **Install Docker:** Follow [Docker installation](https://docs.docker.com/install/)
3. **Configure DNS:** Point `manager.gasstation.local` to server IP
4. **Deploy:** `docker-compose up -d`
5. **Backup:** Automated daily backups in `/backups/` directory

### Maintenance
- **Logs:** Check Docker logs regularly for errors
- **Database:** Weekly VACUUM & ANALYZE (auto via cron)
- **Backups:** Verified daily (30-day retention)
- **Updates:** Pull latest code, rebuild Docker image, redeploy

See [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) for detailed instructions.

---

## 📈 Monitoring & Logs

### Application Health
```bash
curl http://localhost:3000/api/health
# Output: { "status": "ok", "db": "connected", "uptime": 3600 }
```

### View Logs
```bash
# Docker logs (all services)
docker-compose logs -f

# API logs only
docker-compose logs -f api

# Frontend logs
docker-compose logs -f app
```

### Log Files (Local)
- **API:** `backend/logs/error.log`, `combined.log`
- **Database:** PostgreSQL logs in Docker volume

---

## 🧪 Testing

### Backend Unit Tests
```bash
cd backend
npm test                      # Run all tests
npm test -- --watch          # Watch mode
npm test -- --coverage       # With coverage report
```

### Frontend Component Tests
```bash
cd frontend
npm test                      # Run all tests
npm test -- --watch          # Watch mode
```

### Integration Tests (Against Live API)
```bash
cd backend
npm run test:integration      # Requires API running
```

### E2E Tests (Cypress - Future)
```bash
cd frontend
npm run test:e2e              # Full user workflow tests
```

---

## 🐛 Troubleshooting

### Database Connection Error
```bash
# Check PostgreSQL is running
docker-compose ps

# Verify DATABASE_URL in .env
cat .env | grep DATABASE_URL

# Reset migrations (development only)
cd backend && npm run prisma:reset
```

### Port Already in Use
```bash
# Change ports in docker-compose.yml or .env
# Or kill existing process
lsof -i :3000  # Find process on port 3000
kill -9 <PID>
```

### Sync Queue Stuck
```bash
# Manually clear IndexedDB (browser console)
indexedDB.deleteDatabase('startoil-local');
```

See [`docs/TROUBLESHOOTING.md`](docs/TROUBLESHOOTING.md) for more solutions.

---

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| [`MVP_SPEC.md`](docs/MVP_SPEC.md) | Feature specification, data model, success metrics |
| [`ARCHITECTURE.md`](docs/ARCHITECTURE.md) | Tech stack, system design, deployment architecture |
| [`API_ENDPOINTS.md`](docs/API_ENDPOINTS.md) | Complete API reference (TBD) |
| [`DEPLOYMENT.md`](docs/DEPLOYMENT.md) | Self-hosting & ops guide (TBD) |
| [`DATABASE_SCHEMA.md`](docs/DATABASE_SCHEMA.md) | Full Prisma schema documentation (TBD) |
| [`TROUBLESHOOTING.md`](docs/TROUBLESHOOTING.md) | Common issues & solutions (TBD) |

---

## 🚦 Development Roadmap

### Phase 1: Foundation (Weeks 1–3)
- [ ] Backend scaffold + Prisma setup
- [ ] Database migrations
- [ ] Authentication endpoints
- [ ] Frontend app shell

### Phase 2: Core Features (Weeks 4–8)
- [ ] Sales entry & API
- [ ] Inventory tracking
- [ ] Employee shifts
- [ ] Refunds & returns
- [ ] PO management

### Phase 3: Dashboard & Reporting (Weeks 9–11)
- [ ] Manager KPI dashboard
- [ ] CSV export service
- [ ] Email notifications
- [ ] Charts & visualizations

### Phase 4: Offline & Testing (Weeks 12–13)
- [ ] Service Worker setup
- [ ] Offline sync queue
- [ ] Unit & integration tests
- [ ] Mobile-responsive design

### Phase 5: Deployment (Week 14+)
- [ ] Docker setup
- [ ] Security hardening
- [ ] Load testing
- [ ] UAT & documentation
- [ ] Go-live

---

## 💡 Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Write tests for new features
3. Ensure code passes linting: `npm run lint`
4. Commit with clear messages: `git commit -m "feat: add sales dashboard"`
5. Push and create Pull Request

---

## 📝 License

Proprietary – StarOil Gas Station Manager  
© 2026 All Rights Reserved

---

## 📞 Support

- **Developers:** See [`backend/README.md`](backend/README.md) & [`frontend/README.md`](frontend/README.md)
- **Deployment:** [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md)
- **Issues:** Create GitHub issue with logs & reproduction steps
- **Email:** `support@staroil.local` (TBD)

---

**Last Updated:** March 23, 2026  
**Version:** 1.0 (MVP Spec & Architecture)  
**Next Step:** Begin Phase 1 Backend Development
