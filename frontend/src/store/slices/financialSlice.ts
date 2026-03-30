import { createSlice } from '@reduxjs/toolkit';
import { mockFinancialData } from '../../mocks/data';

export interface FinancialRow {
  id: string;
  description: string;
  stockDepart: number;
  totalLivraison: number;
  totalVersement: number;
  stockJour: number;
}

interface FinancialState {
  rows: FinancialRow[];
  isLoading: boolean;
  error: string | null;
}

const initialState: FinancialState = {
  rows: mockFinancialData,
  isLoading: false,
  error: null,
};

const financialSlice = createSlice({
  name: 'financial',
  initialState,
  reducers: {
    setFinancialData: (state, action) => {
      state.rows = action.payload;
    },
    addFinancialRow: (state, action) => {
      state.rows.push(action.payload);
    },
    updateFinancialRow: (state, action) => {
      const index = state.rows.findIndex((row) => row.id === action.payload.id);
      if (index !== -1) {
        state.rows[index] = action.payload;
      }
    },
    deleteFinancialRow: (state, action) => {
      state.rows = state.rows.filter((row) => row.id !== action.payload);
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const {
  setFinancialData,
  addFinancialRow,
  updateFinancialRow,
  deleteFinancialRow,
  setLoading,
  setError,
} = financialSlice.actions;

export default financialSlice.reducer;
