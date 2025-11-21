import { Router } from 'express';
import { ReviewController } from './review.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validation.middleware';
import {
  createReviewValidation,
  updateReviewValidation
} from '../../validations/review.validation';

const router = Router();
const reviewController = new ReviewController();

// Public routes
router.get('/', reviewController.getReviews.bind(reviewController));
router.get('/profile/:profileId', reviewController.getReviewsByProfile.bind(reviewController));
router.get('/:id', reviewController.getReviewById.bind(reviewController));

// Protected routes (require authentication)
router.post('/', authenticate, validate(createReviewValidation), reviewController.createReview.bind(reviewController));
router.get('/my/reviews', authenticate, reviewController.getMyReviews.bind(reviewController));
router.put('/:id', authenticate, validate(updateReviewValidation), reviewController.updateReview.bind(reviewController));
router.delete('/:id', authenticate, reviewController.deleteReview.bind(reviewController));

export default router;

