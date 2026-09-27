import { Router } from 'express';
import { testConnection } from '../db/pool.js';

const router = Router();

router.get('/', async (req, res) => {
  const dbStatus = await testConnection();

  const isHealthy = dbStatus.ok;
  const status = isHealthy ? 'UP' : 'DEGRADED';

  res.status(isHealthy ? 200 : 503).json({
    status,
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    database: {
      type: 'MySQL 8.0',
      connected: dbStatus.ok,
      ...(dbStatus.ok ? {} : { error: dbStatus.error, hint: 'Check DB_PASSWORD in server/.env' }),
    },
    version: '1.0.0',
  });
});

export default router;
