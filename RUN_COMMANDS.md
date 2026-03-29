# 🚀 StarOil - Exact Commands to Run

## IMPORTANT: Keep Two Terminals Running!

You MUST have **two terminal windows** open at the same time for the application to work.

---

## Terminal 1: Backend Server

### Step 1: Open PowerShell or Command Prompt

### Step 2: Navigate to backend directory
```powershell
cd C:\Users\ishyc\Downloads\ngrok-v3-stable-windows-amd64\StarOil\backend
```

### Step 3: Start the backend server
```powershell
$env:PATH += ";C:\Program Files\nodejs"; npm run dev
```

### Expected Output:
```
> staroil-backend@1.0.0 dev
> ts-node-dev --respawn --transpile-only src/server.ts

[INFO] HH:MM:SS ts-node-dev ver. X.X.X
2026-03-23 HH:MM:SS [info]: 🚀 StarOil API Server started {
  "service": "staroil-api",
  "port": "3000",
  "environment": "development"
}
```

**✓ If you see this, the backend is running!**

**⚠️ DO NOT CLOSE THIS TERMINAL - KEEP IT RUNNING**

---

## Terminal 2: Frontend Server

### Step 1: Open a NEW PowerShell or Command Prompt window

**Do NOT use the same terminal as the backend!**

### Step 2: Navigate to frontend directory
```powershell
cd C:\Users\ishyc\Downloads\ngrok-v3-stable-windows-amd64\StarOil\frontend
```

### Step 3: If first time, install dependencies
```powershell
$env:PATH += ";C:\Program Files\nodejs"; npm install --legacy-peer-deps
```

This will take 1-2 minutes. Wait for it to complete.

### Step 4: Start the frontend server
```powershell
$env:PATH += ";C:\Program Files\nodejs"; npm run dev
```

### Expected Output:
```
  VITE v5.4.21  ready in 373 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

**✓ If you see this, the frontend is running!**

**⚠️ DO NOT CLOSE THIS TERMINAL - KEEP IT RUNNING**

---

## Browser: Access the Application

### Step 1: Open any web browser

Chrome, Firefox, Edge, Safari - any modern browser works.

### Step 2: Go to this URL
```
http://localhost:5173
```

### Step 3: You should see the StarOil login page

### Step 4: Login with these credentials
```
Email:    admin@staroil.local
Password: StarOil123!
```

### Step 5: Click "Sign In"

### ✓ You're in! Explore the dashboard

---

## 📱 What You'll See

After login, you'll have access to:

### Left Sidebar Navigation:
- 📊 Dashboard
- 🛒 Sales
- 📦 Inventory
- ⏰ Shifts
- 📈 Reports
- ⚙️ Settings (Admin only)

### Dashboard Features:
- Total Sales KPI
- Total Refunds KPI
- Average Transaction Value
- Low Stock Alerts
- Sales by Payment Method chart
- Top Sales list

### Each Section:
- **Sales** - Manage transactions
- **Inventory** - Track stock levels
- **Shifts** - Employee time tracking
- **Reports** - View analytics
- **Settings** - Configure system

---

## ⚠️ Important Notes

### Both Terminals Must Stay Open
If you close either terminal:
- Backend closed = API won't work, frontend shows errors
- Frontend closed = http://localhost:5173 won't respond

### To Stop the Application
```powershell
# In each terminal, press:
Ctrl + C

# Then close the terminal window
```

### To Restart the Application
```powershell
# In the same terminals, run the commands again:

# Terminal 1:
$env:PATH += ";C:\Program Files\nodejs"; npm run dev

# Terminal 2:
$env:PATH += ";C:\Program Files\nodejs"; npm run dev
```

---

## 🆘 If Something Goes Wrong

### "npm command not found"
```powershell
# Add Node.js to PATH:
$env:PATH += ";C:\Program Files\nodejs"

# Then try the npm command again
```

### "Cannot find module..."
```powershell
# In the folder (backend or frontend), run:
npm install

# Then try npm run dev again
```

### "Port 5173 already in use"
```powershell
# Close the other instance:
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# Then run npm run dev again
```

### "Connection refused" when accessing http://localhost:5173
```powershell
# Make sure BOTH servers are running
# Check Terminal 1: Is the backend running?
# Check Terminal 2: Is the frontend running?

# Both should show "ready" or "listening"
```

---

## ✅ Checklist to Verify Setup

- [ ] Terminal 1 open with backend running on port 3000
- [ ] Terminal 2 open with frontend running on port 5173
- [ ] Browser can access http://localhost:5173
- [ ] Login page displays correctly
- [ ] Can login with admin@staroil.local / StarOil123!
- [ ] Dashboard loads with data
- [ ] Can navigate to Sales, Inventory, Shifts pages
- [ ] API calls are working (no console errors)

---

## 📋 Exact Copy-Paste Commands

### Backend (Copy entire line including $env:PATH)
```
$env:PATH += ";C:\Program Files\nodejs"; cd C:\Users\ishyc\Downloads\ngrok-v3-stable-windows-amd64\StarOil\backend; npm run dev
```

### Frontend Install (first time only)
```
$env:PATH += ";C:\Program Files\nodejs"; cd C:\Users\ishyc\Downloads\ngrok-v3-stable-windows-amd64\StarOil\frontend; npm install --legacy-peer-deps
```

### Frontend Start (copy entire line)
```
$env:PATH += ";C:\Program Files\nodejs"; cd C:\Users\ishyc\Downloads\ngrok-v3-stable-windows-amd64\StarOil\frontend; npm run dev
```

---

## 🎯 Quick Test After Login

### In Dashboard:
1. Look at the KPI cards at the top
2. Try clicking on "Sales" in the sidebar
3. Try clicking on "Inventory"
4. Try clicking on "Shifts"
5. Try clicking on "Reports"
6. (Admin) Try clicking on "Settings"

All pages should load without errors!

---

## 🎉 Success!

If you can:
1. ✅ See the login page at http://localhost:5173
2. ✅ Login with the credentials provided
3. ✅ Navigate to different pages
4. ✅ See data loading

**Then StarOil is working correctly!**

---

## 💾 Keep These Commands Saved

For future use, save these terminal commands:

**Backend:**
```
$env:PATH += ";C:\Program Files\nodejs"; cd C:\Users\ishyc\Downloads\ngrok-v3-stable-windows-amd64\StarOil\backend; npm run dev
```

**Frontend:**
```
$env:PATH += ";C:\Program Files\nodejs"; cd C:\Users\ishyc\Downloads\ngrok-v3-stable-windows-amd64\StarOil\frontend; npm run dev
```

Run these every time you want to start the application.

---

**Happy managing your gas stations! 🚀**
