import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);
router.use(AdminController.checkAdmin);

router.get('/stats', AdminController.getStats);
router.get('/users', AdminController.getUsers);
router.get('/tables', AdminController.getTableCounts);
router.get('/engine', AdminController.checkEngine);
router.patch('/users/:id/role', AdminController.updateUserRole);

export default router;