import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { mockStations } from '../../mocks/data';

const API_URL = ((import.meta as any).env.VITE_API_URL as string) || 'http://localhost:3000/api';

interface Manager {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

interface Employee {
  id: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
  isActive: boolean;
  lastLogin?: string;
}

interface InventoryItem {
  id: string;
  name: string;
  type: 'FUEL' | 'CONVENIENCE';
  sku?: string;
  quantity: number;
  unitPrice: number;
  reorderLevel: number;
  lastCountDate?: string;
}

interface RecentSale {
  id: string;
  totalAmount: number;
  paymentMethod: string;
  createdAt: string;
  employee?: {
    id: string;
    name: string;
  };
}

interface StationStats {
  totalEmployees: number;
  activeEmployees: number;
  fuelTypesCount: number;
  convenienceItemsCount: number;
  totalInventoryValue: number;
  lowStockItemsCount: number;
  recentSalesCount: number;
  recentSalesTotal: number;
}

interface Station {
  id: string;
  name: string;
  address: string;
  phone?: string;
  managerId?: string;
  manager?: Manager;
  users: Employee[];
  inventoryItems: InventoryItem[];
  sales: RecentSale[];
  stats?: StationStats;
}

interface StationsState {
  stations: Station[];
  currentStation: Station | null;
  isLoading: boolean;
  isLoadingDetails: boolean;
  error: string | null;
  total: number;
}

const initialState: StationsState = {
  stations: mockStations as any,
  currentStation: null,
  isLoading: false,
  isLoadingDetails: false,
  error: null,
  total: mockStations.length,
};

export const fetchStations = createAsyncThunk(
  'stations/fetchStations',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/stations`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch stations'
      );
    }
  }
);

export const fetchStationDetails = createAsyncThunk(
  'stations/fetchStationDetails',
  async (stationId: string, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/stations/${stationId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch station details'
      );
    }
  }
);

export const fetchStationSummary = createAsyncThunk(
  'stations/fetchStationSummary',
  async (stationId: string, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_URL}/stations/${stationId}/summary`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        }
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch station summary'
      );
    }
  }
);

export const fetchFuelInventory = createAsyncThunk(
  'stations/fetchFuelInventory',
  async (stationId: string, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_URL}/stations/${stationId}/fuel-inventory`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        }
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch fuel inventory'
      );
    }
  }
);

const stationsSlice = createSlice({
  name: 'stations',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentStation: (state, action) => {
      state.currentStation = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch stations
      .addCase(fetchStations.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchStations.fulfilled, (state, action) => {
        state.isLoading = false;
        state.stations = action.payload.data;
        state.total = action.payload.total;
      })
      .addCase(fetchStations.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Fetch station details
      .addCase(fetchStationDetails.pending, (state) => {
        state.isLoadingDetails = true;
        state.error = null;
      })
      .addCase(fetchStationDetails.fulfilled, (state, action) => {
        state.isLoadingDetails = false;
        state.currentStation = action.payload.data;
      })
      .addCase(fetchStationDetails.rejected, (state, action) => {
        state.isLoadingDetails = false;
        state.error = action.payload as string;
      })

      // Fetch station summary
      .addCase(fetchStationSummary.pending, (state) => {
        state.isLoadingDetails = true;
        state.error = null;
      })
      .addCase(fetchStationSummary.fulfilled, (state, _action) => {
        state.isLoadingDetails = false;
      })
      .addCase(fetchStationSummary.rejected, (state, action) => {
        state.isLoadingDetails = false;
        state.error = action.payload as string;
      })

      // Fetch fuel inventory
      .addCase(fetchFuelInventory.pending, (state) => {
        state.isLoadingDetails = true;
        state.error = null;
      })
      .addCase(fetchFuelInventory.fulfilled, (state, _action) => {
        state.isLoadingDetails = false;
      })
      .addCase(fetchFuelInventory.rejected, (state, action) => {
        state.isLoadingDetails = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setCurrentStation } = stationsSlice.actions;
export default stationsSlice.reducer;
