import { Router } from 'express';
import { CourseController } from '../controllers/course.controller';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);

router.get('/', CourseController.getAll);
router.post('/', CourseController.create);
router.patch('/:id', CourseController.update);
router.delete('/:id', CourseController.delete);

export default router;