const express = require('express');
const router = express.Router();
const experienceController = require('../controllers/experience.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// Public routes (GET)
router.get('/', authMiddleware.optionalAuth, experienceController.getAllExperiences);
router.get('/:id', experienceController.getExperienceById);

// Protected routes (Admin only)
router.use(authMiddleware.authenticate, authMiddleware.authorize('admin'));

router.post('/', experienceController.createExperience);
router.put('/:id', experienceController.updateExperience);
router.delete('/:id', experienceController.deleteExperience);
router.patch('/:id/order', experienceController.updateOrder);
//router.patch('/:id/toggle-visibility', experienceController.toggleVisibility);

module.exports = router;