import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import salesReducer from './slices/salesSlice';
import inventoryReducer from './slices/inventorySlice';
import shiftsReducer from './slices/shiftsSlice';
import dashboardReducer from './slices/dashboardSlice';
import stationsReducer from './slices/stationsSlice';
import financialReducer from './slices/financialSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    sales: salesReducer,
    inventory: inventoryReducer,
    shifts: shiftsReducer,
    dashboard: dashboardReducer,
    stations: stationsReducer,
    financial: financialReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
