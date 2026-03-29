# StarOil - Remaining Work Guide

## 📊 Current Progress: 85% Complete

All backend APIs are **production-ready**. Frontend forms need completion.

---

## 🎯 High-Priority: Next 3 Features to Build

### 1. **Inventory Update Form** (2 hours)
**Status**: Backend API ✅ | Frontend UI ⏳  
**Why**: Core attendant workflow (after Sales entry)

**File to Create**: `frontend/src/components/NewInventoryForm.tsx`

```typescript
// Pattern: Similar to NewSaleForm.tsx

Key Features:
- Modal popup with "Add Inventory" button
- Form fields:
  * Item selector (dropdown of existing items)
  * Item type selector (FUEL, SNACK, BEVERAGE, SUPPLY, OTHER)
  * Quantity adjustment (+ / - buttons for easy entry)
  * Reorder level input
  * Unit price input (editable, pre-filled)
  * Total value (auto-calculated: qty × price)
- Submit button calls: POST /api/inventory
- Validation: Required fields, positive numbers
- Success: Refreshes inventory list

Endpoint Already Exists:
- POST /api/inventory (ready for calls)
- Validation schema: createInventoryItemSchema (in backend/src/middleware/validation.ts)
```

**Integration Points**:
- Add to `frontend/src/pages/Inventory.tsx`
- Use `useTranslation()` for French/English
- Call `dispatch(fetchInventory())` on success

---

### 2. **Employee Profile Editor** (2 hours)
**Status**: Backend API ✅ | Frontend UI ⏳  
**Why**: Managers must be able to add/edit employees

**File to Create**: `frontend/src/components/EmployeeEditor.tsx`

```typescript
// Pattern: Reusable form modal for create/edit

Key Features:
- Modal form for new/edit employee
- Form fields:
  * First name
  * Last name
  * Email (regex validation)
  * Phone number (optional, format: +1-234-567-8900)
  * Role selector (ADMIN / MANAGER / EMPLOYEE dropdown)
  * Station selector (multi-location support)
  * Password (for new employees, hashed on backend)
  * Is Active toggle (for deactivation)
- Submit button calls:
  * POST /api/employees (create)
  * PUT /api/employees/:id (update)
- Validation:
  * Email uniqueness checked by backend
  * Password 8+ chars, 1 number, 1 uppercase
- Success: Refresh employee list

Endpoints:
- POST /api/employees (validation: createEmployeeSchema)
- PUT /api/employees/:id (validation: updateEmployeeSchema)
```

**Integration Points**:
- Add to `frontend/src/pages/Employees.tsx`
- Show "Edit" button in employee table rows
- Show "Add Employee" button in page header
- Requires manager/admin role (backend enforces)

---

### 3. **Shift Clock In/Out UI** (2 hours)
**Status**: Backend API ✅ | Frontend UI ⏳  
**Why**: Attendants must track work hours

**File to Create**: `frontend/src/components/ShiftClockIn.tsx` or Update `Shifts.tsx`

```typescript
// Pattern: Simple time tracking interface

Key Features:
- If NO active shift:
  * Show large blue "CLOCK IN" button
  * Show current time
  * Optional notes textarea
  * Clicking calls: POST /api/shifts
  * Shows shift ID and start time on success
  
- If ACTIVE shift exists:
  * Show "Clocked In" text with start time
  * Show elapsed time counter (updates every second)
  * Show large red "CLOCK OUT" button
  * Optional end notes
  * Clicking calls: PUT /api/shifts/:id (ends shift)
  * Shows shift summary: start, end, hours worked

- Shift History Table:
  * Shows all completed shifts for this employee
  * Columns: Date, Start Time, End Time, Hours, Station
  * Sortable by date

Endpoints:
- GET /api/shifts/active/:employeeId (check if clocked in)
- POST /api/shifts (start shift)
- PUT /api/shifts/:id (end shift, auto-calculates hours)
- GET /api/shifts (list history)
```

**Integration Points**:
- Display in `frontend/src/pages/Shifts.tsx`
- Auto-refresh active shift status every 30 seconds
- Use `useTranslation()` for labels
- Show employee name from Redux store

---

## 🔄 Medium-Priority: Integration Tasks

### 4. **Update Dashboard to Use Real APIs** (1.5 hours)
**Status**: Partial ⏳

**File to Update**: `frontend/src/pages/Dashboard.tsx`

**Currently**: Dashboard shows placeholder data  
**Needed**: Connect to 3 new analytics endpoints

```typescript
// Currently: Hardcoded data
// Needed: Fetch from new APIs

On component mount, call:
1. GET /api/dashboard/metrics
   - Returns: totalSales, refunds, avgTransaction, lowStockCount, 
              activeShifts, salesByPaymentMethod, topSales
   - Display in: KPI cards at top
   
2. GET /api/dashboard/inventory-summary  
   - Returns: totalItems, totalValue, lowStockCount, itemsByType
   - Display in: Inventory section
   
3. GET /api/dashboard/employee-summary
   - Returns: shiftsPerEmployee, totalHours, employeeProductivity
   - Display in: Employee section

Include date range selector:
- Last 7 days (default)
- Last 30 days
- Last 90 days
- Custom date range

Error handling:
- Show loading spinner while fetching
- Show error message if API fails
- Show "No data" if empty results
```

**Redux Integration**:
- Create new thunk: `fetchDashboardMetrics(dateRange)`
- Add to `store/slices/dashboardSlice.ts`
- Use `useSelector()` to get data in component

---

## 📋 Additional Forms Needed

### 5. **Refund Entry Form** (1 hour)
**File**: `frontend/src/components/RefundForm.tsx`

```typescript
Modal form triggered from Sales table (Edit button → Refund option)

Fields:
- Sale ID (pre-filled from selected sale)
- Refund amount (pre-filled, editable)
- Refund reason (dropdown: WRONG_PRICE, DAMAGED, CUSTOMER_REQUEST, OTHER)
- Notes (optional)
- Submit calls: POST /api/refunds

Backend endpoint ready:
- POST /api/refunds
```

---

### 6. **Reports Generator** (3 hours)
**File**: Update `frontend/src/pages/Reports.tsx`

```typescript
Currently: Empty placeholder  
Needed: Functional reporting

Features:
1. Daily Report
   - Date selector
   - Shows: Total sales, items by type, payment breakdown, active shifts
   - Export button → CSV
   
2. Weekly Report
   - Week selector (Mon-Sun)
   - Chart: Sales by day
   - Employee hours summary
   - Inventory changes summary
   
3. Monthly Report
   - Month/Year selector
   - Chart: Daily sales trend
   - Top sales transactions
   - Best-selling items
   - Employee payroll summary

Endpoint needed:
- GET /api/reports/daily?date=2026-03-26
- GET /api/reports/weekly?startDate=...&endDate=...
- GET /api/reports/monthly?month=3&year=2026

(These endpoints don't exist yet - would need to create if detailed reports needed)
```

---

## 🛠️ Implementation Steps (in order)

```
WEEK 1:
  ✓ Day 1: Inventory Form (NewInventoryForm.tsx)
  ✓ Day 2: Employee Editor (EmployeeEditor.tsx)
  ✓ Day 3: Shift Clock In/Out (ShiftClockIn component)
  
WEEK 2:
  ✓ Day 1: Dashboard integration (fetch real APIs)
  ✓ Day 2: Refund Form (RefundForm.tsx)
  
WEEK 3:
  ✓ Day 1-2: Reports page (optional, lower priority)
  ✓ Day 3: Bug fixes & polish

WEEK 4:
  ✓ Testing all workflows end-to-end
  ✓ Performance optimization
  ✓ Production ready!
```

---

## 🎨 Design Patterns to Follow

All new components should follow existing patterns:

### Modal Forms Pattern (like NewSaleForm)

```typescript
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';

interface NewComponentProps {
  show: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const NewComponent: React.FC<NewComponentProps> = ({
  show,
  onClose,
  onSuccess
}) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({ /* fields */ });
  const [errors, setErrors] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors('');
    
    try {
      const response = await apiClient.post('/resource', formData);
      // Dispatch Redux action to refresh list
      dispatch(fetchResourceList());
      onSuccess?.();
      onClose();
    } catch (error: any) {
      setErrors(error.response?.data?.message || 'Error');
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">{t('new.resource.title')}</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Form fields */}
          
          {errors && <div className="text-red-500 text-sm">{errors}</div>}
          
          <div className="flex gap-2 justify-end mt-6">
            <button onClick={onClose} className="px-4 py-2 text-gray-700">
              {t('common.cancel')}
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
            >
              {loading ? t('common.loading') : t('common.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
```

---

## 📌 Key Files Reference

### Backend APIs (All Ready ✅)
- `/backend/src/routes/shifts.ts` - 6 endpoints for shift management
- `/backend/src/routes/employees.ts` - 5 endpoints for employee CRUD
- `/backend/src/routes/dashboard.ts` - 3 endpoints for analytics
- `/backend/src/middleware/validation.ts` - Joi schemas for all data types
- `/backend/src/middleware/auth.ts` - JWT verification & role checks

### Frontend Components (Partially Complete ⏳)
- ✅ `NewSaleForm.tsx` - Sales entry (COMPLETE)
- ⏳ `NewInventoryForm.tsx` - Inventory entry (NEEDS CREATION)
- ⏳ `EmployeeEditor.tsx` - Employee management (NEEDS CREATION)
- ⏳ `ShiftClockIn.tsx` - Time tracking (NEEDS CREATION)
- ⏳ `RefundForm.tsx` - Refund processing (NEEDS CREATION)

### Page Files (Need Integration)
- `frontend/src/pages/Inventory.tsx` - Add NewInventoryForm
- `frontend/src/pages/Employees.tsx` - Add EmployeeEditor
- `frontend/src/pages/Shifts.tsx` - Add ShiftClockIn
- `frontend/src/pages/Dashboard.tsx` - Connect to real APIs
- `frontend/src/pages/Reports.tsx` - Reports implementation

---

## 🚀 Quick Start Next Session

```bash
# Start both servers
cd backend && npm run dev  # Terminal 1
cd frontend && npm run dev # Terminal 2

# When ready to create NewInventoryForm:
# 1. Create: frontend/src/components/NewInventoryForm.tsx
# 2. Update: frontend/src/pages/Inventory.tsx (import & add button)
# 3. Add translations for French labels in i18n/locales/fr.json
# 4. Test: Click "Add Item" button in Inventory page
# 5. Fill form and verify API call succeeds

# Repeat for other components...
```

---

## 📊 Completion Timeline

| Component | Est. Time | Difficulty | Priority |
|-----------|-----------|-----------|----------|
| Inventory Form | 1.5h | Easy | 🔴 HIGH |
| Employee Editor | 1.5h | Easy | 🔴 HIGH |
| Shift Clock In | 1.5h | Easy | 🟡 MEDIUM |
| Dashboard APIs | 1h | Easy | 🟡 MEDIUM |
| Refund Form | 1h | Easy | 🟡 MEDIUM |
| Reports Page | 3h | Medium | 🟢 LOW |
| **Total Remaining** | **~9 hours** | | |

**Estimated Full Completion**: 1-2 days of focused development

---

## ✅ Success Criteria

Each new feature is "done" when:
- [x] Component created with all fields
- [x] Form validation working
- [x] API call succeeds
- [x] Redux state updates
- [x] List refreshes after create/update
- [x] Translations added (French + English)
- [x] Error handling displays user-friendly messages
- [x] No console errors
- [x] Responsive on mobile/tablet
- [x] Tested end-to-end

---

## 💡 Pro Tips

1. **Copy NewSaleForm**: It's a great template - copy the structure for other forms
2. **Use DevTools**: Network tab shows API calls; Redux extension shows state
3. **Test API first**: Use curl or Postman to verify API works before building UI
4. **Keyboard Enter**: Add onKeyPress enter on forms for better UX
5. **Loading state**: Always disable submit button + show spinner while loading
6. **Error messages**: Show friendly errors from backend API response

---

## 🎓 What You'll Learn

Building remaining components will demonstrate:
- React form patterns & validation
- Redux state management at scale
- API integration & error handling
- Responsive form design
- Multi-language UI text management
- Component reusability & composition

---

**Next Step**: Start with `NewInventoryForm.tsx` — it's the most frequently used daily.

Good luck! 🚀
