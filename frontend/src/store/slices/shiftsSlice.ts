import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { shiftsAPI } from '../../services/api';
import { mockShifts } from '../../mocks/data';

interface EmployeeShift {
  id: string;
  stationId: string;
  employeeId: string;
  shiftDate: string;
  clockInTime: string;
  clockOutTime?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  tasksCompleted?: string;
}

interface ShiftsState {
  shifts: EmployeeShift[];
  currentShift: EmployeeShift | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  total: number;
}

const initialState: ShiftsState = {
  shifts: mockShifts as any,
  currentShift: null,
  isLoading: false,
  isSaving: false,
  error: null,
  total: mockShifts.length,
};

export const fetchShifts = createAsyncThunk(
  'shifts/fetchShifts',
  async ({ stationId, page, limit }: any, { rejectWithValue }) => {
    try {
      const response = await shiftsAPI.list({ stationId, page, limit });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch shifts');
    }
  }
);

export const clockIn = createAsyncThunk(
  'shifts/clockIn',
  async (data: any, { rejectWithValue }) => {
    try {
      const response = await shiftsAPI.clockIn(data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to clock in');
    }
  }
);

export const clockOut = createAsyncThunk(
  'shifts/clockOut',
  async ({ shiftId, data }: any, { rejectWithValue }) => {
    try {
      const response = await shiftsAPI.clockOut(shiftId, data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to clock out');
    }
  }
);

const shiftsSlice = createSlice({
  name: 'shifts',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchShifts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchShifts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.shifts = action.payload.shifts;
        state.total = action.payload.total;
      })
      .addCase(fetchShifts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(clockIn.pending, (state) => {
        state.isSaving = true;
        state.error = null;
      })
      .addCase(clockIn.fulfilled, (state, action) => {
        state.isSaving = false;
        state.currentShift = action.payload;
      })
      .addCase(clockIn.rejected, (state, action) => {
        state.isSaving = false;
        state.error = action.payload as string;
      })
      .addCase(clockOut.pending, (state) => {
        state.isSaving = true;
      })
      .addCase(clockOut.fulfilled, (state, action) => {
        state.isSaving = false;
        state.currentShift = action.payload;
      });
  },
});

export const { clearError } = shiftsSlice.actions;
export default shiftsSlice.reducer;
