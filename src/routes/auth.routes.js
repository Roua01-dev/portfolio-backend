const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// =========================
// Public routes
// =========================

// Login → envoie code 2FA par email
router.post('/login', authController.login);

// Vérification code email 2FA
router.post('/verify-email-2fa', authController.verifyEmail2FA);

// Renvoi du code 2FA
router.post('/resend-2fa', authController.resend2FA);

// Refresh JWT
router.post('/refresh-token', authController.refreshToken);

// =========================
// Protected routes
// =========================
router.use(authMiddleware.authenticate);

// Logout
// router.post('/logout', authController.logout);

module.exports = router;