import { Router } from 'express';
import { getAnalyticsHandler } from '../controllers/analyticsController.js';

const router = Router();

// Retrieve aggregate inventory analytics and KPI metrics
router.get('/', getAnalyticsHandler);

export default router;
