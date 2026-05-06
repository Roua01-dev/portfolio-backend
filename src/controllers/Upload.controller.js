const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const PersonalInfo = require('../models/PersonalInf.js');

// ============================================================
// CONFIGURATION CLOUDINARY
// ============================================================
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Storage Cloudinary pour les images de profil
const profileStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'portfolio/profile',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 500, height: 500, crop: 'fill', gravity: 'face' }],
  },
});

// Storage Cloudinary pour les CVs (PDF)
const resumeStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'portfolio/resumes',
    allowed_formats: ['pdf'],
    resource_type: 'raw',
  },
});

const uploadProfileMulter = multer({
  storage: profileStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
});

const uploadResumeMulter = multer({
  storage: resumeStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
});

// ============================================================
// CONTROLLERS
// ============================================================

/**
 * UPLOAD PROFILE IMAGE
 * POST /api/upload/profile-image
 */
exports.uploadProfileImage = [
  uploadProfileMulter.single('profileImage'),
  async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded',
        });
      }

      // Cloudinary retourne l'URL complète dans req.file.path
      const imageUrl = req.file.path; // https://res.cloudinary.com/...

      console.log('✅ Image uploadée sur Cloudinary:', imageUrl);

      // Mettre à jour la base de données
      const info = await PersonalInfo.findOneAndUpdate(
        {},
        { profileImageUrl: imageUrl },
        { upsert: true, new: true }
      );

      res.json({
        success: true,
        message: 'Profile image uploaded successfully',
        data: {
          filename: req.file.filename,
          url: imageUrl,
          profileImageUrl: imageUrl,
          info: info,
        },
      });
    } catch (error) {
      next(error);
    }
  },
];

/**
 * UPLOAD RESUME (CV)
 * POST /api/upload/resume
 */
exports.uploadResume = [
  uploadResumeMulter.single('resume'),
  async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded',
        });
      }

      const resumeUrl = req.file.path; // URL Cloudinary complète

      console.log('✅ CV uploadé sur Cloudinary:', resumeUrl);

      res.json({
        success: true,
        message: 'Resume uploaded successfully',
        data: {
          filename: req.file.filename,
          url: resumeUrl,
          path: resumeUrl,
        },
      });
    } catch (error) {
      next(error);
    }
  },
];

/**
 * DELETE FILE
 * DELETE /api/upload/:filename
 */
exports.deleteFile = async (req, res, next) => {
  try {
    const { filename } = req.params;

    // Supprimer depuis Cloudinary
    // Le public_id Cloudinary est "portfolio/profile/filename" ou "portfolio/resumes/filename"
    const possibleIds = [
      `portfolio/profile/${filename}`,
      `portfolio/resumes/${filename}`,
    ];

    let deleted = false;
    for (const publicId of possibleIds) {
      try {
        const result = await cloudinary.uploader.destroy(publicId);
        if (result.result === 'ok') {
          deleted = true;
          break;
        }
        // Essayer aussi en raw (pour les PDFs)
        const resultRaw = await cloudinary.uploader.destroy(publicId, {
          resource_type: 'raw',
        });
        if (resultRaw.result === 'ok') {
          deleted = true;
          break;
        }
      } catch (_) {}
    }

    res.json({
      success: true,
      message: deleted ? 'File deleted successfully' : 'File not found on Cloudinary',
    });
  } catch (error) {
    next(error);
  }
};

