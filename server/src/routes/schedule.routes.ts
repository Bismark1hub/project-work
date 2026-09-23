import { Router } from 'express';
import { ScheduleController } from '../controllers/schedule.controller';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);

router.get('/', ScheduleController.getSchedule);
router.post('/', ScheduleController.createSession);
router.patch('/:id/status', ScheduleController.updateStatus);
router.delete('/:id', ScheduleController.deleteSession);

export default router;