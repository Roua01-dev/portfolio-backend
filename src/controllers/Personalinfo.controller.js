const PersonalInfo = require('../models/PersonalInf.js');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configuration Multer pour stocker les images
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/profile';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `profile-${Date.now()}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

const upload = multer({ storage, fileFilter });
exports.uploadMiddleware = upload.single('profileImage');

exports.getPersonalInfo = async (req, res, next) => {
  try {
    const info = await PersonalInfo.getInfo();
    res.json({ success: true, data: info });
  } catch (error) {
    next(error);
  }
};

exports.updatePersonalInfo = async (req, res, next) => {
  try {
    let info = await PersonalInfo.findOne();
    if (!info) {
      info = new PersonalInfo(req.body);
    } else {
      Object.assign(info, req.body);
    }
    await info.save();
    res.json({
      success: true,
      message: 'Personal information updated successfully',
      data: info,
    });
  } catch (error) {
    next(error);
  }
};

exports.updateProfileImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided',
      });
    }

    const profileImageUrl = `/uploads/profile/${req.file.filename}`;

    const existing = await PersonalInfo.findOne();
    if (existing?.profileImageUrl) {
      const oldPath = path.join(__dirname, '..', existing.profileImageUrl);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    const info = await PersonalInfo.findOneAndUpdate(
      {},
      { profileImageUrl },
      { new: true, upsert: true }
    );

    res.json({
      success: true,
      message: 'Profile image updated successfully',
      data: info,
    });
  } catch (error) {
    next(error);
  }
};

exports.updateResume = async (req, res, next) => {
  try {
    const { resumeUrl } = req.body;
    const info = await PersonalInfo.findOneAndUpdate(
      {},
      { resumeUrl },
      { new: true, upsert: true }
    );
    res.json({ success: true, message: 'Resume updated successfully', data: info });
  } catch (error) {
    next(error);
  }
};

exports.updateAvailability = async (req, res, next) => {
  try {
    const { availability } = req.body;
    if (!['available', 'busy', 'not_available'].includes(availability)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid availability status',
      });
    }
    const info = await PersonalInfo.findOneAndUpdate(
      {},
      { availability },
      { new: true, upsert: true }
    );
    res.json({
      success: true,
      message: 'Availability updated successfully',
      data: info,
    });
  } catch (error) {
    next(error);
  }
};