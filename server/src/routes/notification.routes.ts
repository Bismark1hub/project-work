import { Router } from 'express';
import { NotificationController } from '../controllers/notification.controller';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);

router.get('/', NotificationController.getAll);
router.get('/unread', NotificationController.getUnread);
router.patch('/read-all', NotificationController.markAllRead);

export default router;