const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const PersonalInfo = require('../models/PersonalInf.js');

// ============================================================
// CONFIGURATION MULTER
// ============================================================

const uploadsDir = path.join(__dirname, '../uploads');
const profileDir = path.join(uploadsDir, 'profile');
const resumesDir = path.join(uploadsDir, 'resumes');

// Créer les dossiers s'ils n'existent pas
[uploadsDir, profileDir, resumesDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Configuration du stockage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folder = profileDir;
    
    if (file.fieldname === 'profileImage') {
      folder = profileDir;
    } else if (file.fieldname === 'resume') {
      folder = resumesDir;
    }
    
    cb(null, folder);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `profile-${Date.now()}${ext}`);
  }
});

// Filtre pour valider les fichiers
const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'profileImage') {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      return cb(new Error('Only image files (jpeg, jpg, png, webp) are allowed!'));
    }
  }
  
  if (file.fieldname === 'resume') {
    const allowedTypes = /pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      return cb(new Error('Only PDF files are allowed for resume!'));
    }
  }
  
  cb(new Error('Unknown field'));
};

// Middleware multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: fileFilter
});

// ============================================================
// CONTROLLERS
// ============================================================

/**
 * UPLOAD PROFILE IMAGE
 * POST /api/upload/profile-image
 */
exports.uploadProfileImage = [
  upload.single('profileImage'),
  async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }
      
      // Optimiser l'image avec Sharp
      const optimizedPath = path.join(
        profileDir,
        'optimized-' + req.file.filename
      );
      
      await sharp(req.file.path)
        .resize(800, 800, {
          fit: 'cover',
          position: 'center'
        })
        .jpeg({ quality: 85 })
        .toFile(optimizedPath);
      
      // Supprimer l'image originale
      fs.unlinkSync(req.file.path);
      
      // Renommer l'image optimisée
      fs.renameSync(optimizedPath, req.file.path);
      
      // URL publique
      const imageUrl = `/uploads/profile/${req.file.filename}`;
      
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
          info: info
        }
      });
      
    } catch (error) {
      next(error);
    }
  }
];

/**
 * UPLOAD RESUME (CV)
 * POST /api/upload/resume
 */
exports.uploadResume = [
  upload.single('resume'),
  async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }
      
      const resumeUrl = `/uploads/resumes/${req.file.filename}`;
      
      res.json({
        success: true,
        message: 'Resume uploaded successfully',
        data: {
          filename: req.file.filename,
          url: resumeUrl,
          path: req.file.path
        }
      });
      
    } catch (error) {
      next(error);
    }
  }
];

/**
 * DELETE FILE
 * DELETE /api/upload/:filename
 */
exports.deleteFile = async (req, res, next) => {
  try {
    const { filename } = req.params;
    
    const possiblePaths = [
      path.join(profileDir, filename),
      path.join(resumesDir, filename)
    ];
    
    let fileFound = false;
    
    for (const filePath of possiblePaths) {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        fileFound = true;
        break;
      }
    }
    
    if (!fileFound) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }
    
    res.json({
      success: true,
      message: 'File deleted successfully'
    });
    
  } catch (error) {
    next(error);
  }
};

module.exports.upload = upload;