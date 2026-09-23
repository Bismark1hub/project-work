import { Router } from 'express';
import { AnalyticsController } from '../controllers/analytics.controller';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);

router.get('/summary', AnalyticsController.getSummary);
router.get('/consistency', AnalyticsController.getConsistency);
router.get('/subjects', AnalyticsController.getSubjectAllocation);
router.get('/heatmap', AnalyticsController.getHeatmap);
router.get('/focus-trend', AnalyticsController.getFocusTrend);

export default router;