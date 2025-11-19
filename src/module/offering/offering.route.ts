import { Router } from 'express';
import { OfferingController } from './offering.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validation.middleware';
import {
  createOfferingValidation,
  updateOfferingValidation
} from '../../validations/offering.validation';

const router = Router();
const offeringController = new OfferingController();

// Public routes
router.get('/', offeringController.getOfferings.bind(offeringController));

// Protected routes (require authentication)
router.get('/my/offerings', authenticate, offeringController.getMyOfferings.bind(offeringController));
router.post('/', authenticate, validate(createOfferingValidation), offeringController.createOffering.bind(offeringController));
router.put('/:id', authenticate, validate(updateOfferingValidation), offeringController.updateOffering.bind(offeringController));
router.delete('/:id', authenticate, offeringController.deleteOffering.bind(offeringController));
router.get('/:id', offeringController.getOfferingById.bind(offeringController));

export default router;

