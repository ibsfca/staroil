/**
 * Mock Mode Helper & Demo Credentials
 * 
 * QUICK START:
 * 1. Open browser console (F12)
 * 2. Copy-paste one of the commands below
 * 3. Refresh the page
 * 
 * DEMO CREDENTIALS:
 * Email: admin@staroil.local
 * Password: demo (or any password)
 * 
 * OR use these in console:
 */

// Example: Enable mock mode and log credentials
export function initMockDemo() {
  localStorage.setItem('MOCK_MODE', 'true');
  console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║  🎭 MOCK MODE ENABLED                                     ║
║                                                            ║
║  Demo Login Credentials:                                  ║
║  ─────────────────────────────────────────────────────    ║
║  Email:    admin@staroil.local                            ║
║  Password: demo                                           ║
║                                                            ║
║  Or any email with password: demo                         ║
║                                                            ║
║  📍 Demo Data:                                            ║
║  • 2 Gas Stations (Downtown + Highway)                   ║
║  • 4 Employees with shifts                               ║
║  • 25+ Inventory items (fuel & convenience)              ║
║  • Recent sales transactions                             ║
║                                                            ║
║  🔄 Reload the page to see mock data                      ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
  `);
  window.location.reload();
}

// Example: Disable mock mode
export function disableMockDemo() {
  localStorage.removeItem('MOCK_MODE');
  console.log('❌ Mock mode disabled. Reload page to use real API.');
  window.location.reload();
}

// Example: Check current mode
export function checkMockMode() {
  const enabled = localStorage.getItem('MOCK_MODE') === 'true';
  console.log(`Mock mode is currently: ${enabled ? '✅ ENABLED' : '❌ DISABLED'}`);
  return enabled;
}

// Attach to window for easy access in console
if (typeof window !== 'undefined') {
  (window as any).mockDemo = {
    enable: initMockDemo,
    disable: disableMockDemo,
    status: checkMockMode,
  };

  // Log available commands on app start
  console.log(`
╔═══════════════════════════════════════════════════════╗
║  💡 Demo Commands (run in console):                  ║
║  ───────────────────────────────────────────────     ║
║  mockDemo.enable()   - Enable mock mode             ║
║  mockDemo.disable()  - Disable mock mode            ║
║  mockDemo.status()   - Check current mode           ║
╚═══════════════════════════════════════════════════════╝
  `);
}

/**
 * Demo Credentials
 * Use these to test the login flow
 */
export const DEMO_CREDENTIALS = {
  admin: {
    email: 'admin@staroil.local',
    password: 'demo',
  },
  // Any email works with password 'demo'
  anyUser: {
    email: 'test@example.com',
    password: 'demo',
  },
};

/**
 * Demo Data Map
 * Reference for what mock data is available
 */
export const DEMO_DATA_MAP = {
  stations: [
    { id: 'station-downtown', name: 'Downtown Station' },
    { id: 'station-highway', name: 'Highway Station' },
  ],
  employees: [
    { id: 'user-emp-1', name: 'Emily Rodriguez', station: 'Downtown' },
    { id: 'user-emp-2', name: 'David Williams', station: 'Downtown' },
    { id: 'user-emp-3', name: 'Lisa Park', station: 'Highway' },
    { id: 'user-emp-4', name: 'James Martin', station: 'Highway' },
  ],
  fuelTypes: ['Regular 87', 'Premium 91', 'Diesel'],
  inventoryCount: 11, // 8 fuel + 3 convenience per station
};
