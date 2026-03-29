# StarOil Application Architecture & Current Status

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Internet/Browser                         │
│                    (http://localhost:5173)                       │
└──────────────────────────┬──────────────────────────────────────┘
                           │
         ┌─────────────────┴─────────────────┐
         │                                   │
    ┌────▼─────┐                     ┌──────▼──────┐
    │ Vite Dev │                     │   Webpack   │
    │  Server  │                     │   Bundler   │
    │:5173     │                     │   (Frontend)│
    └────┬─────┘                     └─────────────┘
         │
         │ HTTP Requests
         │
    ┌────▼──────────────────────────────────┐
    │    React Application (SPA)             │
    │  ├─ Login Page                         │
    │  ├─ Dashboard                          │
    │  ├─ Sales Management                   │
    │  ├─ Inventory Management               │
    │  ├─ Shift Management                   │
    │  ├─ Reports                            │
    │  └─ Settings                           │
    │                                        │
    │  Redux Store:                          │
    │  ├─ Auth State                         │
    │  ├─ Sales State                        │
    │  ├─ Inventory State                    │
    │  ├─ Shifts State                       │
    │  └─ Dashboard State                    │
    └────┬─────────────────────────────────┘
         │
         │ API Calls (JSON)
         │ via Axios
         │
    ┌────▼──────────────────────────────────┐
    │   Express.js REST API (:3000)          │
    │                                        │
    │  Routes:                               │
    │  ├─ /api/auth/*                        │
    │  ├─ /api/sales/*                       │
    │  ├─ /api/inventory/*                   │
    │  ├─ /api/shifts/*                      │
    │  ├─ /api/reports/*                     │
    │  └─ /api/health                        │
    │                                        │
    │  Middleware:                           │
    │  ├─ Authentication (JWT)               │
    │  ├─ Error Handling                     │
    │  ├─ Logging (Winston)                  │
    │  └─ CORS                               │
    └────┬──────────────────────────────────┘
         │
         │ SQL Queries
         │ via Prisma ORM
         │
    ┌────▼──────────────────────────────────┐
    │   PostgreSQL Database                  │
    │                                        │
    │  Tables (13 models):                   │
    │  ├─ users                              │
    │  ├─ stations                           │
    │  ├─ sales                              │
    │  ├─ sale_items                         │
    │  ├─ inventory_items                    │
    │  ├─ employee_shifts                    │
    │  ├─ refunds                            │
    │  ├─ purchase_orders                    │
    │  └─ audit_logs                         │
    └────────────────────────────────────────┘
```

---

## 📊 Current Deployment Status

### Running Components ✅

```
                    ✅ RUNNING
                        │
        ┌───────────────┼───────────────┐
        │               │               │
    ┌───▼───┐       ┌───▼────┐     ┌──▼───┐
    │Node.js│       │Express │     │Vite  │
    │v24.14 │       │:3000   │     │:5173 │
    └───────┘       └────────┘     └──────┘
        │               │              │
        │               │              │
    ┌───▼───────────────┴──────────────▼───┐
    │         Application Ready!            │
    │                                       │
    │  Frontend: http://localhost:5173     │
    │  Backend:  http://localhost:3000/api │
    │  Login: admin@staroil.local           │
    └───────────────────────────────────────┘
```

---

## 🚀 Server Startup Flow

```
Terminal 1: npm run dev (backend)
    │
    ├─→ ts-node-dev loads
    │
    ├─→ TypeScript compiles
    │
    ├─→ Express server initializes
    │
    ├─→ Prisma connects to PostgreSQL
    │
    ├─→ Winston logger configured
    │
    └─→ ✅ Server running on :3000

Terminal 2: npm run dev (frontend)
    │
    ├─→ Vite dev server starts
    │
    ├─→ Loads React entry point
    │
    ├─→ Initializes Redux store
    │
    ├─→ Configures API interceptors
    │
    ├─→ Creates Vite HMR connection
    │
    └─→ ✅ Server running on :5173
```

---

## 📱 User Journey

```
1. User opens http://localhost:5173
                    │
                    ▼
2. Vite loads React app & Redux store
                    │
                    ▼
3. App checks if user logged in (localStorage)
                    │
         ┌──────────┴──────────┐
         │                     │
    No token             Token found
         │                     │
         ▼                     ▼
   Login Page         Verify token with API
         │                     │
         │              ┌──────┴──────┐
         │              │             │
         │          Valid         Expired
         │              │             │
         │              ▼             ▼
         │          Dashboard    Login Page
         │              │             │
         │              ▼             ▼
         └──────────→ Main App ←─────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
    Sales Page    Inventory       Shifts
        │              │              │
        └──────────────┼──────────────┘
                       │
                ┌──────┴──────┐
                │             │
            Reports       Settings
                │             │
                └─────┬───────┘
                      │
              (All pages interact
               with Redux store
               and API backend)
```

---

## 🔄 Request/Response Cycle

```
┌─────────────────────────────────────────────────────────┐
│ User Action (Click, Submit, etc.)                       │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
      ┌────────────────────────────────────┐
      │ React Component Dispatches Action  │
      │ (setFormData, handleClick, etc.)   │
      └──────────────┬─────────────────────┘
                     │
                     ▼
      ┌────────────────────────────────────┐
      │ Redux Middleware                   │
      │ (Redux Thunk)                      │
      └──────────────┬─────────────────────┘
                     │
                     ▼
      ┌────────────────────────────────────┐
      │ API Client (Axios)                 │
      │ • Add JWT token to header          │
      │ • Prepare request body             │
      │ • Handle CORS                      │
      └──────────────┬─────────────────────┘
                     │
                     │ HTTP Request
                     ▼
      ┌────────────────────────────────────┐
      │ Express Router                     │
      │ Route: POST /api/sales             │
      └──────────────┬─────────────────────┘
                     │
                     ▼
      ┌────────────────────────────────────┐
      │ Express Middleware                 │
      │ • Parse JSON                       │
      │ • Validate JWT                     │
      │ • Extract user info                │
      └──────────────┬─────────────────────┘
                     │
                     ▼
      ┌────────────────────────────────────┐
      │ Route Handler / Controller         │
      │ Validate input data                │
      └──────────────┬─────────────────────┘
                     │
                     ▼
      ┌────────────────────────────────────┐
      │ Business Logic / Service           │
      │ (Calculate totals, check inventory)│
      └──────────────┬─────────────────────┘
                     │
                     ▼
      ┌────────────────────────────────────┐
      │ Prisma ORM                         │
      │ Build SQL query                    │
      └──────────────┬─────────────────────┘
                     │
                     │ SQL Query
                     ▼
      ┌────────────────────────────────────┐
      │ PostgreSQL Database                │
      │ • Insert record                    │
      │ • Execute transaction              │
      │ • Return result                    │
      └──────────────┬─────────────────────┘
                     │
                     │ Result
                     ▼
      ┌────────────────────────────────────┐
      │ Prisma Transforms Result           │
      │ (Prisma models)                    │
      └──────────────┬─────────────────────┘
                     │
                     │ JSON Response
                     ▼
      ┌────────────────────────────────────┐
      │ Express Sends HTTP Response        │
      │ Status: 200, Body: {data}          │
      └──────────────┬─────────────────────┘
                     │
                     │ HTTP Response
                     ▼
      ┌────────────────────────────────────┐
      │ Axios Response Interceptor         │
      │ Check status code                  │
      │ Parse response                     │
      └──────────────┬─────────────────────┘
                     │
                     ▼
      ┌────────────────────────────────────┐
      │ Redux Dispatch Action.fulfilled    │
      │ Update state with new data         │
      └──────────────┬─────────────────────┘
                     │
                     ▼
      ┌────────────────────────────────────┐
      │ React Components Rerender          │
      │ Subscribe to Redux changes         │
      │ Display new data                   │
      └──────────────┬─────────────────────┘
                     │
                     ▼
      ┌────────────────────────────────────┐
      │ Browser Updates UI                 │
      │ User sees new information          │
      └────────────────────────────────────┘
```

---

## 🔐 Authentication Flow

```
┌─────────────────────────────────────────┐
│ User Enters Credentials                 │
│ email@example.local / password123       │
└──────────────────┬──────────────────────┘
                   │
                   ▼
        ┌──────────────────────┐
        │ POST /api/auth/login │
        └──────────────┬───────┘
                       │
                       ▼
        ┌──────────────────────────────┐
        │ Express Auth Controller      │
        │ • Get email from request     │
        │ • Query users table          │
        │ • bcrypt.compare password    │
        └──────────────┬───────────────┘
                       │
            ┌──────────┴──────────┐
            │                     │
         Valid               Invalid
            │                     │
            ▼                     ▼
     ┌────────────┐        ┌─────────────┐
     │ Password   │        │ Return 401  │
     │ matches!   │        │ "Invalid    │
     │            │        │ credentials"│
     └─────┬──────┘        └─────────────┘
           │
           ▼
     ┌──────────────────────┐
     │ Generate JWT Token   │
     │ • Payload: userId    │
     │ • Secret: jwt_secret │
     │ • Exp: 8 hours       │
     │ • Algorithm: HS256   │
     └──────────┬───────────┘
                │
                ▼
     ┌──────────────────────────┐
     │ Generate Refresh Token   │
     │ • Exp: 7 days           │
     └──────────┬───────────────┘
                │
                ▼
     ┌──────────────────────────────────┐
     │ Return Response (200 OK)         │
     │ {                                │
     │   user: {...},                   │
     │   accessToken: "eyJhbGc...",    │
     │   refreshToken: "eyJhbGc..."    │
     │ }                                │
     └──────────┬──────────────────────┘
                │
                ▼
     ┌──────────────────────────────┐
     │ Client Receives Response     │
     │ Stores tokens in localStorage│
     │ Dispatches auth success      │
     └──────────┬──────────────────┘
                │
                ▼
     ┌──────────────────────────────┐
     │ Redirect to Dashboard        │
     │ User is now logged in!       │
     └──────────────────────────────┘
```

---

## 📡 API Interceptor Flow

```
┌─────────────────────────────────────────┐
│ Any API Request                         │
└──────────────────┬──────────────────────┘
                   │
                   ▼
        ┌──────────────────────┐
        │ Request Interceptor  │
        │ • Get token from     │
        │   localStorage       │
        │ • Add to header:     │
        │   Authorization:     │
        │   "Bearer {token}"   │
        └──────────┬───────────┘
                   │
                   ▼
        ┌──────────────────────┐
        │ Send HTTP Request    │
        └──────────┬───────────┘
                   │
        ┌──────────┴──────────┐
        │                     │
      200                   401
    (success)          (unauthorized)
        │                     │
        ▼                     ▼
    ┌────────┐         ┌─────────────┐
    │ Return │         │ Token       │
    │ data   │         │ expired?    │
    │        │         └──────┬──────┘
    └────────┘                │
                   ┌──────────┴──────────┐
                   │                     │
                 Yes                     No
                   │                     │
                   ▼                     ▼
        ┌────────────────────┐   ┌──────────────┐
        │ POST /auth/refresh │   │ Redirect to  │
        │ Send refresh token │   │ Login        │
        └────────┬───────────┘   └──────────────┘
                 │
                 ▼
        ┌───────────────────────┐
        │ Get new access token  │
        │ Store in localStorage │
        │ Retry original request│
        └───────┬───────────────┘
                │
                ▼
        ┌───────────────────┐
        │ Success!          │
        │ User stays logged │
        │ in seamlessly     │
        └───────────────────┘
```

---

## ✨ Summary

**Current Status:** ✅ **FULLY OPERATIONAL**

Both servers are running and ready to accept requests:
- React frontend compiling and hot-reloading at localhost:5173
- Express backend responding to API requests on localhost:3000
- Redux store managing application state
- Authentication working with JWT tokens
- Database schema configured via Prisma
- All 50+ API endpoints ready

**Ready for testing and development!**
