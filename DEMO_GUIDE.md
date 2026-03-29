# StarOil Demo Setup Guide

This guide shows two approaches to populate demo data for StarOil.

---

## Option 1: Frontend Mock Mode (Recommended for Quick Testing)

**✅ Best for:** Quick demos, frontend development, testing without backend

### Quick Start

1. **Open the browser developer console (F12)**

2. **Paste and run this command:**
   ```javascript
   localStorage.setItem('MOCK_MODE', 'true');
   location.reload();
   ```

3. **Login with demo credentials:**
   - Email: `admin@staroil.local`
   - Password: `demo` (or any password)

### Demo Data Included

- ✅ 2 fully featured gas stations (Downtown + Highway)
- ✅ 4 employees with different roles  
- ✅ 2 active and completed shifts
- ✅ 25+ fuel and convenience inventory items
- ✅ Recent sales transactions
- ✅ Station statistics and analytics

### Console Commands

Run these commands in the browser console (F12):

```javascript
// Enable mock mode
mockDemo.enable()

// Disable mock mode (use real backend API)
mockDemo.disable()

// Check current status
mockDemo.status()
```

### How It Works

- Mock Service Worker (MSW) intercepts all API calls
- Returns realistic demo data from `src/mocks/data.ts`
- No backend server needed
- Works offline
- Can be toggled on/off anytime

### Demo Features to Test

| Feature | Details |
|---------|---------|
| **Login** | Email: `admin@staroil.local`, Password: `demo` |
| **Stations** | View all 2 stations with full details |
| **Employees** | 4 employees across stations with shifts |
| **Inventory** | 8+ fuel types, 3+ convenience items per station |
| **Dashboard** | Real-time stats, low stock alerts |
| **Shifts** | Active and completed shifts with timing |
| **Sales** | Recent transactions with breakdown |

---

## Option 2: Database Seeding (Real Backend with Mock Data)

**✅ Best for:** End-to-end testing, API development, persistent data

### Prerequisites

- SQLite installed or Docker with database running
- Backend server running: `npm run dev` in `backend/`

### Setup Steps

1. **Install dependencies** (if not already done):
   ```bash
   cd backend
   npm install
   ```

2. **Run database migrations:**
   ```bash
   npm run prisma:migrate dev
   ```

3. **Seed the database with demo data:**
   ```bash
   npm run prisma:seed
   ```

4. **Start the backend server:**
   ```bash
   npm run dev
   ```

5. **Start the frontend** (new terminal):
   ```bash
   cd frontend
   npm run dev
   ```

6. **Access at:** `http://localhost:5173`

### Demo Login Credentials

After seeding, you can login with:

```
Email: admin@staroil.local
Password: password

Or:
- sarah.johnson@staroil.local / password (Downtown Manager)
- emily.rodriguez@staroil.local / password (Downtown Employee)
- michael.chen@staroil.local / password (Highway Manager)
- lisa.park@staroil.local / password (Highway Employee)
```

### What Gets Seeded

```
✅ 2 Complete Stations
✅ 1 Admin user
✅ 2 Station Managers (one per station)
✅ 4 Employees (2 per station)
✅ 11 Inventory items per station:
   • 3 Fuel types (Regular 87, Premium 91, Diesel)
   • 3 Convenience items (Coffee, Water, Snacks)
✅ 2 Employee Shifts (completed + active)
✅ 2 Sample Sales transactions
```

### Verifying Seed Success

Check the Prisma Studio UI:
```bash
npm run prisma:studio
```

Opens at: http://localhost:5555

---

## Switching Between Mock Mode and Real Database

| Scenario | Steps |
|----------|-------|
| **Switch to Mock Mode** | Run `mockDemo.enable()` in console, reload |
| **Switch to Real API** | Run `mockDemo.disable()` in console, reload |
| **Use Docker Database** | `docker-compose up -d`, then start backend normally |

---

## Demo Workflow Examples

### Example 1: Quick Frontend Testing
```bash
# Terminal 1: Start frontend (mock mode will be on)
cd frontend
npm run dev

# Then in browser console:
mockDemo.enable()
# Refresh page and login with demo credentials
```

### Example 2: Full Stack Testing
```bash
# Terminal 1: Start database (Docker)
docker-compose up -d

# Terminal 2: Start backend
cd backend
npm run prisma:seed
npm run dev

# Terminal 3: Start frontend
cd frontend
npm run dev

# Login with credentials from seeded database
```

### Example 3: Switching Between Methods

```bash
# Start in mock mode for quick testing
mockDemo.enable()

# Later, connect to real database when ready
mockDemo.disable()

# Backend API calls will now use real database
```

---

## Troubleshooting

### Mock mode not working?
- Check browser console for errors (F12)
- Verify `localStorage.getItem('MOCK_MODE')` returns `'true'`
- Clear browser cache and reload

### Seed script fails?
```bash
# Reset database
npm run prisma:reset

# Then try seeding again
npm run prisma:seed
```

### API returning 404 in mock mode?
- Check that MSW handlers cover your endpoint
- Add new handler in `src/mocks/handlers.ts` if needed
- Check browser console for "Unhandled request" warnings

### Can't login with demo credentials?
- Verify email matches exactly (case-sensitive)
- Password is just `demo` for mock mode
- For database seeding, use the credentials listed above

---

## Extending Mock Data

### Add More Demo Users

Edit `src/mocks/data.ts` and add to `mockEmployees`:

```typescript
{
  id: 'user-emp-5',
  name: 'New Employee',
  email: 'new.employee@staroil.local',
  role: 'EMPLOYEE',
  stationId: 'station-downtown',
  isActive: true,
  lastLogin: new Date().toISOString(),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}
```

### Add More Inventory Items

Edit `src/mocks/data.ts` and add to `mockInventoryItems`:

```typescript
{
  id: 'inv-new-item',
  stationId: 'station-downtown',
  name: 'New Item',
  type: 'CONVENIENCE',
  sku: 'CONV-NEW-ITEM',
  quantity: 100,
  unitPrice: 4.99,
  reorderLevel: 20,
  // ... other fields
}
```

### Add More Handlers

Edit `src/mocks/handlers.ts` to intercept new API endpoints:

```typescript
http.get('*/api/new-endpoint', () => {
  return HttpResponse.json({
    success: true,
    data: [/* mock data */],
  });
}),
```

---

## Performance Notes

- **Mock Mode:** Instant responses, no network latency
- **Real API:** Subject to network/database performance
- **Both:** Suitable for demo and development work

---

## Next Steps

1. Choose your approach (Mock or Real Database)
2. Follow the setup steps for your chosen option
3. Login and explore the Stations feature
4. Test different user roles (Admin, Manager, Employee)
5. Check out the Dashboard, Inventory, and Shifts sections

**Happy demoing!** 🚀
