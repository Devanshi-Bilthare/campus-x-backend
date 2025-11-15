import { Router } from 'express';
import { UploadController } from './upload.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { uploadSingle, uploadMultiple } from '../../middleware/upload.middleware';

const router = Router();
const uploadController = new UploadController();

// Upload routes (protected - require authentication)
router.post('/single', authenticate, uploadSingle, uploadController.uploadFile.bind(uploadController));
router.post('/multiple', authenticate, uploadMultiple, uploadController.uploadFiles.bind(uploadController));
router.delete('/', authenticate, uploadController.deleteFile.bind(uploadController));

export default router;

