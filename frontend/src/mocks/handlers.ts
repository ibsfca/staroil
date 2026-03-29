/**
 * MSW (Mock Service Worker) Handlers
 * Intercepts API calls and returns mock data for demo/testing
 */

import { http, HttpResponse } from 'msw';
import {
  mockDemoUser,
  mockStations,
  mockManagers,
  mockEmployees,
  mockInventoryItems,
  mockShifts,
  mockRecentSales,
} from './data';

// Build stations response with relationships
const buildStationWithDetails = (stationId: string) => {
  const station = mockStations.find((s) => s.id === stationId);
  const manager = mockManagers.find((m) => m.stationId === stationId);
  const employees = mockEmployees.filter((e) => e.stationId === stationId);
  const inventory = mockInventoryItems.filter((i) => i.stationId === stationId);
  const shifts = mockShifts.filter((s) => s.stationId === stationId);
  const sales = mockRecentSales.filter((s) => s.stationId === stationId);

  return {
    ...station,
    manager,
    users: employees,
    inventoryItems: inventory,
    shifts,
    sales,
  };
};

export const handlers = [
  // Auth: Login
  http.post('*/api/auth/login', async ({ request }) => {
    const body = (await request.json()) as { email: string; password: string };

    // Demo: accept admin@staroil.local or any email with password "demo"
    if (body.password === 'demo' || (body.email === 'admin@staroil.local' && body.password === 'password')) {
      return HttpResponse.json(
        {
          success: true,
          message: 'Login successful',
          data: {
            user: mockDemoUser,
            token: 'mock-jwt-token-' + Date.now(),
            refreshToken: 'mock-refresh-token-' + Date.now(),
          },
        },
        { status: 200 }
      );
    }

    return HttpResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }),

  // Auth: Verify Token
  http.post('*/api/auth/verify', () => {
    return HttpResponse.json(
      {
        success: true,
        data: { user: mockDemoUser },
      },
      { status: 200 }
    );
  }),

  // Auth: Refresh Token
  http.post('*/api/auth/refresh', () => {
    return HttpResponse.json(
      {
        success: true,
        data: {
          token: 'mock-jwt-token-' + Date.now(),
        },
      },
      { status: 200 }
    );
  }),

  // Stations: Get all stations
  http.get('*/api/stations', () => {
    const stationsWithStats = mockStations.map((station) => {
      const manager = mockManagers.find((m) => m.stationId === station.id);
      const employees = mockEmployees.filter((e) => e.stationId === station.id);
      const inventory = mockInventoryItems.filter((i) => i.stationId === station.id);
      const fuelInventory = inventory.filter((i) => i.type === 'FUEL');
      const convInventory = inventory.filter((i) => i.type === 'CONVENIENCE');
      const lowStockItems = inventory.filter((i) => i.quantity <= (i.reorderLevel || 10));
      const totalInventoryValue = inventory.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

      return {
        ...station,
        manager,
        users: employees,
        inventoryItems: inventory,
        stats: {
          totalEmployees: employees.length,
          activeEmployees: employees.filter((e) => e.isActive).length,
          fuelTypesCount: fuelInventory.length,
          convenienceItemsCount: convInventory.length,
          totalInventoryValue,
          lowStockItemsCount: lowStockItems.length,
          recentSalesCount: mockRecentSales.filter((s) => s.stationId === station.id).length,
          recentSalesTotal: mockRecentSales
            .filter((s) => s.stationId === station.id)
            .reduce((sum, s) => sum + s.totalAmount, 0),
        },
      };
    });

    return HttpResponse.json(
      {
        message: 'Stations retrieved successfully',
        data: stationsWithStats,
        total: stationsWithStats.length,
      },
      { status: 200 }
    );
  }),

  // Stations: Get station details
  http.get('*/api/stations/:stationId', ({ params }) => {
    const { stationId } = params;
    const stationDetail = buildStationWithDetails(stationId as string);

    if (!stationDetail.id) {
      return HttpResponse.json(
        { error: 'Station not found' },
        { status: 404 }
      );
    }

    return HttpResponse.json(
      {
        message: 'Station details retrieved successfully',
        data: stationDetail,
      },
      { status: 200 }
    );
  }),

  // Stations: Get fuel inventory
  http.get('*/api/stations/:stationId/fuel-inventory', ({ params }) => {
    const { stationId } = params;
    const fuelItems = mockInventoryItems.filter(
      (i) => i.stationId === stationId && i.type === 'FUEL'
    );

    return HttpResponse.json(
      {
        message: 'Fuel inventory retrieved successfully',
        data: fuelItems,
        total: fuelItems.length,
      },
      { status: 200 }
    );
  }),

  // Stations: Get station summary
  http.get('*/api/stations/:stationId/summary', ({ params }) => {
    const { stationId } = params;
    const station = mockStations.find((s) => s.id === stationId);
    const employees = mockEmployees.filter((e) => e.stationId === stationId);
    const inventory = mockInventoryItems.filter((i) => i.stationId === stationId);
    const sales = mockRecentSales.filter((s) => s.stationId === stationId);
    const lowStockItems = inventory.filter((i) => i.quantity <= (i.reorderLevel || 10));

    const totalInventoryValue = inventory.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    const totalSales = sales.reduce((sum, s) => sum + s.totalAmount, 0);
    const today = new Date('2026-03-27').toDateString();
    const todaySales = sales
      .filter((s) => new Date(s.createdAt).toDateString() === today)
      .reduce((sum, s) => sum + s.totalAmount, 0);

    return HttpResponse.json(
      {
        message: 'Station summary retrieved successfully',
        data: {
          station,
          stats: {
            activeEmployees: employees.filter((e) => e.isActive).length,
            totalSales,
            todaySales,
            totalInventoryValue,
            lowStockItemsCount: lowStockItems.length,
            totalInventoryItems: inventory.length,
          },
        },
      },
      { status: 200 }
    );
  }),

  // Employees: Get all employees
  http.get('*/api/employees', () => {
    return HttpResponse.json(
      {
        success: true,
        data: mockEmployees,
        total: mockEmployees.length,
      },
      { status: 200 }
    );
  }),

  // Employees: Get employee by ID
  http.get('*/api/employees/:employeeId', ({ params }) => {
    const { employeeId } = params;
    const employee = mockEmployees.find((e) => e.id === employeeId);

    if (!employee) {
      return HttpResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      );
    }

    return HttpResponse.json(
      {
        success: true,
        data: employee,
      },
      { status: 200 }
    );
  }),

  // Shifts: Get all shifts
  http.get('*/api/shifts', ({ request }) => {
    const url = new URL(request.url);
    const stationId = url.searchParams.get('stationId');

    let shifts = mockShifts;
    if (stationId) {
      shifts = shifts.filter((s) => s.stationId === stationId);
    }

    return HttpResponse.json(
      {
        success: true,
        data: shifts,
        count: shifts.length,
      },
      { status: 200 }
    );
  }),

  // Shifts: Get active shift for employee
  http.get('*/api/shifts/active/:employeeId', ({ params }) => {
    const { employeeId } = params;
    const activeShift = mockShifts.find(
      (s) => s.employeeId === employeeId && s.status === 'ACTIVE'
    );

    if (!activeShift) {
      return HttpResponse.json(
        {
          error: 'No active shift',
          message: 'Employee does not have an active shift',
        },
        { status: 404 }
      );
    }

    return HttpResponse.json(
      {
        success: true,
        data: activeShift,
      },
      { status: 200 }
    );
  }),

  // Dashboard: Get dashboard data
  http.get('*/api/dashboard', () => {
    const today = new Date('2026-03-27');
    const todaySales = mockRecentSales.filter(
      (s) => new Date(s.createdAt).toDateString() === today.toDateString()
    );
    const totalSales = mockRecentSales.reduce((sum, s) => sum + s.totalAmount, 0);
    const activeShifts = mockShifts.filter((s) => s.status === 'ACTIVE');

    return HttpResponse.json(
      {
        success: true,
        message: 'Dashboard data retrieved',
        data: {
          todaySales: todaySales.reduce((sum, s) => sum + s.totalAmount, 0),
          totalSales,
          activeShifts: activeShifts.length,
          totalEmployees: mockEmployees.length,
          lowStockItems: mockInventoryItems.filter(
            (i) => i.quantity <= (i.reorderLevel || 10)
          ).length,
          recentSales: mockRecentSales.slice(0, 5),
        },
      },
      { status: 200 }
    );
  }),

  // Catch-all for unhandled requests
  http.all('*', ({ request }) => {
    console.warn('Unhandled request:', request.method, request.url);
    return HttpResponse.json(
      { error: 'Not implemented in mock' },
      { status: 501 }
    );
  }),
];
