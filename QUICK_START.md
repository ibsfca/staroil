# StarOil Quick Start Guide

## Prerequisites Installed ✅
- Node.js 18+ (v11.9.0 npm confirmed)
- PowerShell execution policy set

## Current Setup Status

### Backend (In Progress)
- ✅ Dependencies configured (package.json fixed)
- ⏳ npm install running
- ⏳ Next: Database migrations
- ⏳ Next: Seed data

### Frontend (Ready)
- ✅ All source code created
- ✅ Configuration complete
- ⏳ Awaiting npm install

---

## 🚀 Commands to Run (When installations complete)

### Terminal 1 - Backend Server

```powershell
cd C:\Users\ishyc\Downloads\ngrok-v3-stable-windows-amd64\StarOil\backend

# Generate Prisma client
& "C:\Program Files\nodejs\npm.cmd" run prisma:generate

# Run database migrations
& "C:\Program Files\nodejs\npm.cmd" run prisma:migrate

# Seed database with test data
& "C:\Program Files\nodejs\npm.cmd" run seed

# Start dev server
& "C:\Program Files\nodejs\npm.cmd" run dev
```

Backend will run on: **http://localhost:3000**

### Terminal 2 - Frontend Dev Server

```powershell
cd C:\Users\ishyc\Downloads\ngrok-v3-stable-windows-amd64\StarOil\frontend

# Install dependencies
& "C:\Program Files\nodejs\npm.cmd" install

# Start Vite dev server
& "C:\Program Files\nodejs\npm.cmd" run dev
```

Frontend will run on: **http://localhost:5173**

---

## 🔐 Demo Login Credentials

Once both servers are running:

1. Open **http://localhost:5173** in your browser
2. Login with:
   - **Email:** admin@staroil.local
   - **Password:** StarOil123!

---

## Database Configuration

### Environment Variables

Create/check `.env` file in backend:

```env
DATABASE_URL="postgresql://startoil_user:startoil_password@localhost:5432/startoil"
NODE_ENV=development
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_REFRESH_SECRET=your_super_secret_refresh_key
JWT_EXPIRE=8h
JWT_REFRESH_EXPIRE=7d
API_PORT=3000
API_URL=http://localhost:3000
CORS_ORIGIN=http://localhost:5173
```

**Note:** For development, these defaults work. For production, use strong secrets!

---

## Available Features

### Dashboard
- Real-time KPI cards (sales, refunds, inventory value)
- Payment method breakdown
- Top sales overview

### Sales Management
- Create/view sales transactions
- Track payment methods (cash, card)
- Finalize sales

### Inventory Management
- Track fuel and convenience items
- Monitor stock levels
- Low-stock alerts

### Shift Management
- Employee clock in/out
- Shift duration tracking
- Manager approval workflow

### Reports
- Sales analytics by location/payment method
- Inventory valuation
- Employee shift summaries
- Financial metrics

### Settings (Admin Only)
- Company configuration
- User management
- Inventory item setup
- Notification preferences

---

## Troubleshooting

### NPM Command Not Found
Use the full path:
```powershell
& "C:\Program Files\nodejs\npm.cmd" install
```

### Port Already in Use
- Backend (3000): `netstat -ano | findstr :3000`
- Frontend (5173): Change VITE_PORT in .env

### Database Connection Error
Ensure PostgreSQL is running:
```powershell
# Docker option:
docker-compose up -d postgres
```

### Prisma Client Not Found
```powershell
& "C:\Program Files\nodejs\npm.cmd" run prisma:generate
```

---

## API Health Check

Once backend is running:
```powershell
curl http://localhost:3000/api/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2026-03-24T...",
  "uptime": "..."
}
```

---

## Next Steps After Setup

1. ✅ Get backend + frontend running
2. Test login with demo credentials
3. Explore all features in the dashboard
4. Check `.github/copilot-instructions.md` for development guidelines
5. Review `docs/ARCHITECTURE.md` for technical details

---

**Happy managing! 🚀 StarOil Manager is ready to go!**
