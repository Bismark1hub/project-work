import { Router } from 'express';
import { SettingsController } from '../controllers/settings.controller';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);

router.get('/profile', SettingsController.getProfile);
router.patch('/profile', SettingsController.updateProfile);
router.post('/change-password', SettingsController.changePassword);
router.get('/', SettingsController.getSettings);
router.patch('/', SettingsController.updateSettings);
router.delete('/account', SettingsController.deleteAccount);

export default router;