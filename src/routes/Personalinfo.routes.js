const express = require('express');
const router = express.Router();
const personalInfoController = require('../controllers/Personalinfo.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// ✅ Route publique
router.get('/', personalInfoController.getPersonalInfo);

// ✅ Routes protégées admin
router.use(authMiddleware.authenticate, authMiddleware.authorize('admin'));

router.put('/', personalInfoController.updatePersonalInfo);

// ✅ Upload image : multer middleware AVANT le controller
router.patch(
  '/profile-image',
  personalInfoController.uploadMiddleware,  // ← multer traite le fichier
  personalInfoController.updateProfileImage
);

router.patch('/resume', personalInfoController.updateResume);
router.patch('/availability', personalInfoController.updateAvailability);

module.exports = router;