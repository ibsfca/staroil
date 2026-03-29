import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { reportsAPI } from '../../services/api';
import { mockDashboardMetrics } from '../../mocks/data';

interface DashboardMetrics {
  totalSales: number;
  totalRefunds: number;
  averageTransactionValue: number;
  totalInventoryValue: number;
  lowStockItems: number;
  activeEmployees: number;
  salesByPaymentMethod: any[];
  topSales: any[];
}

interface DashboardState {
  metrics: DashboardMetrics | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: DashboardState = {
  metrics: mockDashboardMetrics,
  isLoading: false,
  error: null,
};

export const fetchDashboardMetrics = createAsyncThunk(
  'dashboard/fetchMetrics',
  async ({ stationId, startDate, endDate }: any, { rejectWithValue }) => {
    try {
      const response = await reportsAPI.dashboardMetrics({
        stationId,
        startDate,
        endDate,
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch metrics'
      );
    }
  }
);

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardMetrics.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDashboardMetrics.fulfilled, (state, action) => {
        state.isLoading = false;
        state.metrics = action.payload;
      })
      .addCase(fetchDashboardMetrics.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = dashboardSlice.actions;
export default dashboardSlice.reducer;
