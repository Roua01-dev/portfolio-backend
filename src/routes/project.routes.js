const express = require('express');
const router = express.Router();
const projectController = require('../controllers/project.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// Public routes (GET) — optionalAuth so req.user is set for admins
router.get('/', authMiddleware.optionalAuth, projectController.getAllProjects);
router.get('/:id', projectController.getProjectById);

// Protected routes (Admin only)
router.use(authMiddleware.authenticate, authMiddleware.authorize('admin'));

router.post('/', projectController.createProject);
router.put('/:id', projectController.updateProject);
router.delete('/:id', projectController.deleteProject);
router.patch('/:id/order', projectController.updateOrder);
router.patch('/:id/toggle-featured', projectController.toggleFeatured);
router.patch('/:id/toggle-active', projectController.toggleActive);
module.exports = router;