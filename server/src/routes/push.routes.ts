import { Router } from 'express';
import { PushController } from '../controllers/push.controller';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);

router.post('/subscribe', PushController.saveSubscription);
router.post('/unsubscribe', PushController.deleteSubscription);
router.post('/test', PushController.sendTest);

export default router;