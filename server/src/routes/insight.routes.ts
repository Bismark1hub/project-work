import { Router } from 'express';
import { InsightController } from '../controllers/insight.controller';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);

router.get('/', InsightController.getAll);
router.get('/pending', InsightController.getPending);
router.post('/analyze', InsightController.analyze);
router.patch('/:id/accept', InsightController.accept);
router.patch('/:id/dismiss', InsightController.dismiss);

export default router;