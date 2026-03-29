# StarOil Development & Workspace Customization

This file provides workspace-specific guidance for VS Code Copilot and developers working on StarOil.

---

## Project Overview

**StarOil** is a self-hosted, multi-location gas station management application.

- **Languages:** TypeScript (backend & frontend), SQL (database)
- **Frontend:** React 18, Vite, TailwindCSS, Redux Toolkit
- **Backend:** Node.js + Express, PostgreSQL, Prisma ORM
- **Deployment:** Docker Compose (self-hosted)
- **Key Features:** POS sales, inventory, employee shifts, offline-sync, multi-location dashboard

---

## Workspace Structure

```
StarOil/
├── backend/          # Node.js REST API
├── frontend/         # React web app
├── docs/             # Project documentation
├── docker-compose.yml
├── README.md         # Start here!
└── .github/          # This file
```

---

## Getting Started (Developer)

### Prerequisites
- Node.js 18+ LTS
- Docker & Docker Compose (for containerized testing)
- PostgreSQL 14+ (or use Docker)
- Git

### Quick Start

```bash
# 1. Clone and setup
git clone <repo-url>
cd StarOil

# 2. Backend
cd backend
cp .env.example .env
npm install
npm run prisma:generate
npm run prisma:migrate dev
npm run dev

# 3. Frontend (new terminal)
cd frontend
cp .env.example .env
npm install
npm run dev

# Access: http://localhost:5173
```

### Using Docker (Recommended)

```bash
docker-compose build
docker-compose up -d
docker-compose exec api npm run prisma:migrate
# Access: http://localhost (or https://manager.gasstation.local)
```

---

## Key Documentation

1. **[README.md](README.md)** – Project overview, features, setup
2. **[docs/MVP_SPEC.md](docs/MVP_SPEC.md)** – Feature specification & requirements
3. **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)** – Tech stack, system design, API endpoints
4. **[docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)** – Self-hosting & ops guide
5. **[backend/README.md](backend/README.md)** – Backend development guide (TBD)
6. **[frontend/README.md](frontend/README.md)** – Frontend development guide (TBD)

---

## Code Guidelines

### TypeScript
- **Strict mode enabled:** `strict: true` in `tsconfig.json`
- **Naming:** camelCase for variables/functions, PascalCase for classes/types
- **Types:** Use explicit types, avoid `any`
- **Files:** `.ts` for source, `.test.ts` for tests

### React Components
- **Functional components** with hooks (no class components)
- **Props typing:** Use `interface` or `type`
- **Styling:** TailwindCSS classes (no CSS-in-JS)
- **File structure:** `components/ComponentName/ComponentName.tsx`

### Backend (Express)
- **Controllers:** Handle HTTP requests
- **Services:** Business logic
- **Middleware:** Auth, validation, error handling
- **Routes:** API endpoint definitions
- **Models:** Prisma auto-generated from `schema.prisma`

### Database
- **Migrations:** Version-controlled in `prisma/migrations/`
- **Naming:** snake_case for tables/columns
- **Schema:** Define in `prisma/schema.prisma`
- **Indexes:** Add for foreign keys & frequently queried columns

### Git Workflow
- **Branches:** `feature/name`, `bugfix/name`, `docs/name`
- **Commits:** Conventional: `feat:`, `fix:`, `docs:`, `test:`, `chore:`
- **PRs:** Link to issues, include description & testing steps

---

## Common Development Tasks

### Add a New Feature

1. **Create database model** → `prisma/schema.prisma`
2. **Run migration** → `npm run prisma:migrate dev --name <feature>`
3. **Create API endpoint** → `backend/src/routes/`
4. **Implement business logic** → `backend/src/services/`
5. **Build React component** → `frontend/src/components/` or `pages/`
6. **Wire up API calls** → `frontend/src/services/api.ts`
7. **Write tests** → `*.test.ts`

### Add a Database Migration

```bash
cd backend

# Modify schema.prisma, then:
npm run prisma:migrate dev --name <migration_name>

# This creates & applies the migration automatically
# Commit migration to git
```

### Run Tests

```bash
# Backend
cd backend && npm test

# Frontend
cd frontend && npm test

# With coverage
npm test -- --coverage
```

### Fix ESLint / Type Errors

```bash
# Check for errors
npm run lint
npm run type-check

# Auto-fix linting issues
npm run lint -- --fix
```

### Build for Production

```bash
# Backend
cd backend && npm run build
# Output: dist/

# Frontend
cd frontend && npm run build
# Output: dist/

# Docker (builds both)
docker-compose build
```

---

## Debugging

### Backend (Node.js)

```bash
# Enable debug logs
LOG_LEVEL=debug npm run dev

# VS Code debugging (Ctrl+Shift+D)
# Select "Node" configuration and press Start

# Breakpoints set in VS Code will pause execution
```

### Frontend (React)

```bash
# Chrome DevTools (F12)
# React DevTools browser extension recommended

# Debug in VS Code
# F5 → Select "Chrome" → Open http://localhost:5173
```

### Database (PostgreSQL)

```bash
# Open Prisma Studio (UI for database)
cd backend && npm run prisma:studio
# Opens http://localhost:5555

# Query directly
docker-compose exec postgres psql -U startoil_user -d startoil
# PostgreSQL interactive prompt
```

---

## Testing Strategy

- **Unit tests:** Individual functions/components (Jest)
- **Integration tests:** API endpoints with real DB (Supertest)
- **Component tests:** React components (React Testing Library)
- **E2E tests:** Full user workflows (Cypress, optional)

### Write a Test

```typescript
// Example: backend/src/services/salesService.test.ts
import { createSale } from './salesService';

describe('Sales Service', () => {
  it('should create a sale with items', async () => {
    const sale = await createSale({
      stationId: 'station-123',
      items: [{ itemId: 'fuel', quantity: 10, unitPrice: 3.45 }],
      paymentMethod: 'cash'
    });
    
    expect(sale).toHaveProperty('id');
    expect(sale.totalAmount).toBe(34.50);
  });
});
```

---

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| `DATABASE_URL` not found | Copy `.env.example` to `.env` and fill in values |
| Port 3000 in use | `lsof -i :3000` then `kill -9 <PID>` or change port in `.env` |
| Prisma client not found | `npm run prisma:generate` in backend |
| `ENOSPC: no space left on device` | `docker system prune -a --volumes` |
| React not hot-reloading | Check `VITE_API_URL` in `.env` |

---

## Deployment Checklist

- [ ] All tests passing: `npm test`
- [ ] No linting errors: `npm run lint`
- [ ] Environment variables set in `.env`
- [ ] Database migrations applied: `npm run prisma:migrate`
- [ ] SSL certificate in place (if HTTPS)
- [ ] Backups configured and tested
- [ ] DNS/domain points to server
- [ ] Docker images built: `docker-compose build`
- [ ] Services running: `docker-compose up -d`
- [ ] Health check passes: `curl http://localhost:3000/api/health`

---

## Performance Optimization Tips

- **Frontend:** Code splitting (React.lazy), memoization (React.memo), service workers
- **Backend:** Database indexing, query optimization, connection pooling
- **Database:** Vacuum & analyze, partitioning for large tables, prepared statements
- **General:** Caching (Redis optional), CDN for assets, compression (gzip)

See `docs/ARCHITECTURE.md` for detailed performance section.

---

## Security Reminders

- ✅ **Never commit `.env`** – Add to `.gitignore`
- ✅ **Use HTTPS in production** – Nginx enforces TLS
- ✅ **Validate input server-side** – Don't trust client data
- ✅ **Hashing & salting:** Passwords hashed with bcrypt
- ✅ **JWT tokens:** Short-lived (8h), refresh tokens (7d)
- ✅ **Audit logging:** All user actions logged
- ✅ **Rate limiting:** Protect against brute force attacks
- ✅ **CORS:** Restrict to known domains

---

## Useful Commands

```bash
# Development
npm run dev              # Start backend + frontend (from root)
npm run build            # Build for production
npm test                 # Run all tests

# Database
npm run prisma:studio   # Open database UI
npm run prisma:migrate  # Run migrations
npm run prisma:reset    # Reset DB (dev only)
npm run seed            # Load test data

# Docker
docker-compose up -d    # Start services
docker-compose down     # Stop services
docker-compose logs     # View logs
docker stats            # Resource usage

# Git
git log --oneline --graph --decorate --all
git rebase -i HEAD~N    # Interactive rebase last N commits
git cherry-pick <sha>   # Apply commit to current branch
```

---

## Getting Help

1. **Check existing docs** → See list above
2. **Search GitHub issues** → Solutions to common problems
3. **Review code comments** → Many complex functions documented
4. **Ask in PRs** → Team reviews provide guidance
5. **Check logs** → `docker-compose logs api` for errors

---

## Next Steps for New Developers

1. ✅ Read [README.md](README.md) – Overview & features
2. ✅ Read [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) – System design
3. ✅ Run locally: `docker-compose up -d`
4. ✅ Explore codebase (start with `backend/src/app.ts` and `frontend/src/App.tsx`)
5. ✅ Pick a small task from GitHub issues
6. ✅ Make a PR with tests & documentation

---

**Last Updated:** March 23, 2026  
**Maintained By:** StarOil Development Team
