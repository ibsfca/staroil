import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import 'express-async-errors';
import * as dotenv from 'dotenv';
import logger from './utils/logger';

// Load environment variables
dotenv.config();

// Import routes
import authRoutes from './routes/auth';
import salesRoutes from './routes/sales';
import inventoryRoutes from './routes/inventory';
import shiftsRoutes from './routes/shifts';
import employeesRoutes from './routes/employees';
import dashboardRoutes from './routes/dashboard';
import stationsRoutes from './routes/stations';

// Import middleware
import { authenticateToken } from './middleware/auth';

const app: Express = express();

// Middleware
app.use(cors({
  origin: (process.env.CORS_ORIGINS || 'http://localhost:5173').split(','),
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Request logging middleware
app.use((req: Request, _res: Response, next: NextFunction) => {
  logger.info(`${req.method} ${req.path}`, {
    method: req.method,
    path: req.path,
    ip: req.ip,
  });
  next();
});

// Health check endpoint (no auth required)
app.get('/api/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    uptime: process.uptime(),
  });
});

// API Routes
// Auth routes (no authentication required)
app.use('/api/auth', authRoutes);

// Protected routes (authentication required)
app.use('/api/sales', authenticateToken, salesRoutes);
app.use('/api/inventory', authenticateToken, inventoryRoutes);
app.use('/api/stations', stationsRoutes); // Has its own auth check
app.use('/api/shifts', shiftsRoutes); // Has its own auth check
app.use('/api/employees', employeesRoutes); // Has its own auth check
app.use('/api/dashboard', dashboardRoutes); // Has its own auth check

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`,
  });
});

// Error handling middleware
app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';

  logger.error(`Error: ${message}`, {
    status,
    method: req.method,
    path: req.path,
    error: err,
  });

  res.status(status).json({
    error: message,
    status,
    timestamp: new Date().toISOString(),
  });
});

export default app;
