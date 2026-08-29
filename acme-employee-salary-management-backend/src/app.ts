import express from 'express';
import cors from 'cors';
import employeeRoutes from '@/routes/employee.routes';
import analyticsRoutes from '@/routes/analytics.routes';
import referenceRoutes from '@/routes/reference.routes';
import healthRoutes from '@/routes/health.routes';
import { errorHandler } from '@/middleware/error-handler';

/**
 * Creates and configures the Express application.
 * Exported as a factory so tests can spin up isolated instances.
 */
export default function createApp() {
  const app = express();

  // ── Middleware ──────────────────────────────────────────────
  app.use(cors());
  app.use(express.json());

  // ── Routes ──────────────────────────────────────────────────
  app.use('/health', healthRoutes);
  app.use('/api/health', healthRoutes);
  app.use('/api/employees', employeeRoutes);
  app.use('/api/analytics', analyticsRoutes);
  app.use('/api', referenceRoutes);

  // ── 404 handler ─────────────────────────────────────────────
  app.use((_req, res) => {
    res.status(404).json({
      status: 'error',
      code: 'NOT_FOUND',
      message: 'Route not found',
      data: null,
    });
  });

  // ── Centralised error handler (must be last) ─────────────────
  app.use(errorHandler);

  return app;
}
