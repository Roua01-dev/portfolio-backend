const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/Upload.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// ============================================================
// ROUTES D'UPLOAD (ADMIN UNIQUEMENT)
// ============================================================

// Toutes les routes nécessitent une authentification admin
router.use(authMiddleware.authenticate, authMiddleware.authorize('admin'));

// ✅ Upload profile image - CORRIGÉ
router.post('/profile-image', uploadController.uploadProfileImage);

// Upload resume/CV
router.post('/resume', uploadController.uploadResume);

// Delete file
router.delete('/:filename', uploadController.deleteFile);

module.exports = router;