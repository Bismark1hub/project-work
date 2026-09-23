import { Router } from 'express';
import { TaskController } from '../controllers/task.controller';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);

router.get('/', TaskController.getAll);
router.post('/', TaskController.create);
router.patch('/:id/status', TaskController.updateStatus);
router.patch('/:id', TaskController.update);
router.delete('/:id', TaskController.delete);

export default router;