import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from './hooks/useRedux';
import { checkAuth } from './store/slices/authSlice';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Sales from './pages/Sales';
import Inventory from './pages/Inventory';
import Shifts from './pages/Shifts';
import Reports from './pages/Reports';
import Stations from './pages/Stations';
import Settings from './pages/Settings';

function App() {
  const dispatch = useAppDispatch();
  const { isAuthenticated, isLoading } = useAppSelector((state) => state.auth);

  useEffect(() => {
    // Check if user is already logged in (restore session from localStorage)
    dispatch(checkAuth());
    
    // Safety timeout: if loading takes more than 3 seconds, something is wrong
    const timeout = setTimeout(() => {
      console.warn('Auth check timeout - showing login page');
    }, 3000);
    
    return () => clearTimeout(timeout);
  }, [dispatch]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <PrivateRoute isAuthenticated={isAuthenticated}>
            <Dashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/sales"
        element={
          <PrivateRoute isAuthenticated={isAuthenticated}>
            <Sales />
          </PrivateRoute>
        }
      />
      <Route
        path="/inventory"
        element={
          <PrivateRoute isAuthenticated={isAuthenticated}>
            <Inventory />
          </PrivateRoute>
        }
      />
      <Route
        path="/shifts"
        element={
          <PrivateRoute isAuthenticated={isAuthenticated}>
            <Shifts />
          </PrivateRoute>
        }
      />
      <Route
        path="/reports"
        element={
          <PrivateRoute isAuthenticated={isAuthenticated}>
            <Reports />
          </PrivateRoute>
        }
      />
      <Route
        path="/stations"
        element={
          <PrivateRoute isAuthenticated={isAuthenticated}>
            <Stations />
          </PrivateRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <PrivateRoute isAuthenticated={isAuthenticated}>
            <Settings />
          </PrivateRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
