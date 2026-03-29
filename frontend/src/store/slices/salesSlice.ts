import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { salesAPI } from '../../services/api';
import { mockRecentSales } from '../../mocks/data';

interface SaleItem {
  id: string;
  saleId: string;
  itemId: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  fuelGrade?: string;
}

interface Sale {
  id: string;
  stationId: string;
  employeeId: string;
  saleDate: string;
  totalAmount: number;
  paymentMethod: 'CASH' | 'CARD' | 'CHECK' | 'OTHER';
  isFinalized: boolean;
  items?: SaleItem[];
}

interface SalesState {
  items: Sale[];
  currentSale: Sale | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  total: number;
  page: number;
  limit: number;
}

const initialState: SalesState = {
  items: mockRecentSales as any,
  currentSale: null,
  isLoading: false,
  isSaving: false,
  error: null,
  total: mockRecentSales.length,
  page: 1,
  limit: 20,
};

export const fetchSales = createAsyncThunk(
  'sales/fetchSales',
  async (
    { stationId, page = 1, limit = 20 }: any,
    { rejectWithValue }
  ) => {
    try {
      const response = await salesAPI.list({ stationId, page, limit });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch sales');
    }
  }
);

export const fetchSale = createAsyncThunk(
  'sales/fetchSale',
  async (saleId: string, { rejectWithValue }) => {
    try {
      const response = await salesAPI.get(saleId);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch sale');
    }
  }
);

export const createSale = createAsyncThunk(
  'sales/createSale',
  async (saleData: any, { rejectWithValue }) => {
    try {
      const response = await salesAPI.create(saleData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create sale');
    }
  }
);

export const finalizeSale = createAsyncThunk(
  'sales/finalizeSale',
  async (saleId: string, { rejectWithValue }) => {
    try {
      const response = await salesAPI.finalize(saleId);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to finalize sale');
    }
  }
);

const salesSlice = createSlice({
  name: 'sales',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentSale: (state, action) => {
      state.currentSale = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSales.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSales.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload.items;
        state.total = action.payload.total;
      })
      .addCase(fetchSales.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchSale.fulfilled, (state, action) => {
        state.currentSale = action.payload;
      })
      .addCase(createSale.pending, (state) => {
        state.isSaving = true;
        state.error = null;
      })
      .addCase(createSale.fulfilled, (state, action) => {
        state.isSaving = false;
        state.currentSale = action.payload;
        state.items.unshift(action.payload);
      })
      .addCase(createSale.rejected, (state, action) => {
        state.isSaving = false;
        state.error = action.payload as string;
      })
      .addCase(finalizeSale.fulfilled, (state, action) => {
        state.currentSale = action.payload;
        const index = state.items.findIndex((s) => s.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      });
  },
});

export const { clearError, setCurrentSale } = salesSlice.actions;
export default salesSlice.reducer;
