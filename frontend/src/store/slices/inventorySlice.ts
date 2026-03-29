import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { inventoryAPI } from '../../services/api';
import { mockInventoryItems } from '../../mocks/data';

interface InventoryItem {
  id: string;
  stationId: string;
  itemName: string;
  itemType: 'FUEL' | 'CONVENIENCE';
  sku: string;
  currentQuantity: number;
  reorderLevel: number;
  fuelGrade?: string;
}

interface InventoryState {
  items: InventoryItem[];
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  total: number;
}

const initialState: InventoryState = {
  items: mockInventoryItems as any,
  isLoading: false,
  isSaving: false,
  error: null,
  total: mockInventoryItems.length,
};

export const fetchInventory = createAsyncThunk(
  'inventory/fetchInventory',
  async ({ stationId }: any, { rejectWithValue }) => {
    try {
      const response = await inventoryAPI.list({ stationId });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch inventory');
    }
  }
);

export const updateInventoryItem = createAsyncThunk(
  'inventory/updateInventoryItem',
  async ({ id, data }: any, { rejectWithValue }) => {
    try {
      const response = await inventoryAPI.update(id, data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update item');
    }
  }
);

const inventorySlice = createSlice({
  name: 'inventory',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchInventory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchInventory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload.items;
        state.total = action.payload.total;
      })
      .addCase(fetchInventory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(updateInventoryItem.pending, (state) => {
        state.isSaving = true;
        state.error = null;
      })
      .addCase(updateInventoryItem.fulfilled, (state, action) => {
        state.isSaving = false;
        const index = state.items.findIndex((i) => i.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(updateInventoryItem.rejected, (state, action) => {
        state.isSaving = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = inventorySlice.actions;
export default inventorySlice.reducer;
