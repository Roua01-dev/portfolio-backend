const { body, param, query, validationResult } = require('express-validator');

// ============================================================
// MIDDLEWARE DE VALIDATION
// ============================================================

/**
 * Middleware pour gérer les erreurs de validation
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors: errors.array().map(err => ({
        field: err.param,
        message: err.msg
      }))
    });
  }
  
  next();
};

// ============================================================
// VALIDATION RULES
// ============================================================

/**
 * AUTH - Login
 */
exports.validateLogin = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Must be a valid email address')
    .normalizeEmail(),
  
  body('password')
    .trim()
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  
  validate
];

/**
 * AUTH - Verify 2FA
 */
exports.validateVerify2FA = [
  body('code')
    .trim()
    .notEmpty().withMessage('2FA code is required')
    .isLength({ min: 6, max: 6 }).withMessage('Code must be exactly 6 digits')
    .isNumeric().withMessage('Code must contain only numbers'),
  
  body('tempToken')
    .trim()
    .notEmpty().withMessage('Temporary token is required'),
  
  validate
];

/**
 * AUTH - Refresh Token
 */
exports.validateRefreshToken = [
  body('refreshToken')
    .trim()
    .notEmpty().withMessage('Refresh token is required'),
  
  validate
];

/**
 * PROJECT - Create/Update
 */
exports.validateProject = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ min: 3, max: 100 }).withMessage('Title must be between 3 and 100 characters'),
  
  body('description')
    .trim()
    .notEmpty().withMessage('Description is required')
    .isLength({ min: 10, max: 500 }).withMessage('Description must be between 10 and 500 characters'),
  
  body('technologies')
    .isArray({ min: 1 }).withMessage('At least one technology is required')
    .custom((technologies) => {
      if (!technologies.every(tech => typeof tech === 'string' && tech.trim().length > 0)) {
        throw new Error('All technologies must be non-empty strings');
      }
      return true;
    }),
  
  body('category')
    .trim()
    .notEmpty().withMessage('Category is required')
    .isIn(['web', 'mobile', 'desktop', 'other']).withMessage('Invalid category'),
  
  body('imageUrl')
    .optional()
    .trim()
    .isURL().withMessage('Must be a valid URL'),
  
  body('githubUrl')
    .optional()
    .trim()
    .isURL().withMessage('Must be a valid URL'),
  
  body('liveUrl')
    .optional()
    .trim()
    .isURL().withMessage('Must be a valid URL'),
  
  body('isFeatured')
    .optional()
    .isBoolean().withMessage('Must be a boolean'),
  
  body('order')
    .optional()
    .isInt({ min: 0 }).withMessage('Order must be a positive integer'),
  
  validate
];

/**
 * PROJECT - ID Validation
 */
exports.validateProjectId = [
  param('id')
    .trim()
    .notEmpty().withMessage('Project ID is required')
    .isMongoId().withMessage('Invalid project ID'),
  
  validate
];

/**
 * EXPERIENCE - Create/Update
 */
exports.validateExperience = [
  body('company')
    .trim()
    .notEmpty().withMessage('Company name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Company name must be between 2 and 100 characters'),
  
  body('position')
    .trim()
    .notEmpty().withMessage('Position is required')
    .isLength({ min: 2, max: 100 }).withMessage('Position must be between 2 and 100 characters'),
  
  body('project')
    .trim()
    .notEmpty().withMessage('Project name is required')
    .isLength({ min: 2, max: 200 }).withMessage('Project name must be between 2 and 200 characters'),
  
  body('duration')
    .trim()
    .notEmpty().withMessage('Duration is required'),
  
  body('location')
    .trim()
    .notEmpty().withMessage('Location is required'),
  
  body('skills')
    .isArray({ min: 1 }).withMessage('At least one skill is required')
    .custom((skills) => {
      if (!skills.every(skill => typeof skill === 'string' && skill.trim().length > 0)) {
        throw new Error('All skills must be non-empty strings');
      }
      return true;
    }),
  
  body('isActive')
    .optional()
    .isBoolean().withMessage('isActive must be a boolean'),
  
  body('order')

  
    .optional()
    .isInt({ min: 0 }).withMessage('Order must be a positive integer'),
  
  validate
];

/**
 * EXPERIENCE - ID Validation
 */
exports.validateExperienceId = [
  param('id')
    .trim()
    .notEmpty().withMessage('Experience ID is required')
    .isMongoId().withMessage('Invalid experience ID'),
  
  validate
];

/**
 * MESSAGE - Create
 */
exports.validateMessage = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters')
    .matches(/^[a-zA-ZÀ-ÿ\s'-]+$/).withMessage('Name can only contain letters, spaces, hyphens and apostrophes'),
  
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Must be a valid email address')
    .normalizeEmail(),
  
  body('subject')
    .trim()
    .notEmpty().withMessage('Subject is required')
    .isLength({ min: 5, max: 150 }).withMessage('Subject must be between 5 and 150 characters'),
  
  body('message')
    .trim()
    .notEmpty().withMessage('Message is required')
    .isLength({ min: 10, max: 2000 }).withMessage('Message must be between 10 and 2000 characters'),
  
  validate
];

/**
 * MESSAGE - ID Validation
 */
exports.validateMessageId = [
  param('id')
    .trim()
    .notEmpty().withMessage('Message ID is required')
    .isMongoId().withMessage('Invalid message ID'),
  
  validate
];

/**
 * PERSONAL INFO - Update
 */
exports.validatePersonalInfo = [
  body('firstName')
    .trim()
    .notEmpty().withMessage('First name is required')
    .isLength({ min: 2, max: 50 }).withMessage('First name must be between 2 and 50 characters')
    .matches(/^[a-zA-ZÀ-ÿ\s'-]+$/).withMessage('First name can only contain letters'),
  
  body('lastName')
    .trim()
    .notEmpty().withMessage('Last name is required')
    .isLength({ min: 2, max: 50 }).withMessage('Last name must be between 2 and 50 characters')
    .matches(/^[a-zA-ZÀ-ÿ\s'-]+$/).withMessage('Last name can only contain letters'),
  
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Must be a valid email address')
    .normalizeEmail(),
  
  body('phone')
    .optional()
    .trim()
    .matches(/^[\d\s\-\+\(\)]+$/).withMessage('Invalid phone number format'),
  
  body('location')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Location must be less than 100 characters'),
  
  body('title')
    .trim()
    .notEmpty().withMessage('Professional title is required')
    .isLength({ min: 5, max: 100 }).withMessage('Title must be between 5 and 100 characters'),
  
  body('bio')
    .trim()
    .notEmpty().withMessage('Bio is required')
    .isLength({ min: 50, max: 1000 }).withMessage('Bio must be between 50 and 1000 characters'),
  
  body('githubUrl')
    .optional()
    .trim()
    .isURL().withMessage('Must be a valid URL'),
  
  body('linkedinUrl')
    .optional()
    .trim()
    .isURL().withMessage('Must be a valid URL'),
  
  body('twitterUrl')
    .optional()
    .trim()
    .isURL().withMessage('Must be a valid URL'),
  
  body('websiteUrl')
    .optional()
    .trim()
    .isURL().withMessage('Must be a valid URL'),
  
  body('profileImageUrl')
    .optional()
    .trim()
    .isURL().withMessage('Must be a valid URL'),
  
  body('resumeUrl')
    .optional()
    .trim()
    .isURL().withMessage('Must be a valid URL'),
  
  body('skills')
    .optional()
    .isArray().withMessage('Skills must be an array')
    .custom((skills) => {
      if (!skills.every(skill => typeof skill === 'string' && skill.trim().length > 0)) {
        throw new Error('All skills must be non-empty strings');
      }
      return true;
    }),
  
  body('languages')
    .optional()
    .isArray().withMessage('Languages must be an array')
    .custom((languages) => {
      const validProficiencies = ['beginner', 'intermediate', 'advanced', 'native'];
      
      if (!languages.every(lang => 
        lang.language && 
        typeof lang.language === 'string' && 
        lang.proficiency && 
        validProficiencies.includes(lang.proficiency)
      )) {
        throw new Error('Invalid language format');
      }
      return true;
    }),
  
  body('availability')
    .optional()
    .isIn(['available', 'busy', 'not_available']).withMessage('Invalid availability status'),
  
  validate
];

/**
 * PERSONAL INFO - Update Availability
 */
exports.validateAvailability = [
  body('availability')
    .trim()
    .notEmpty().withMessage('Availability status is required')
    .isIn(['available', 'busy', 'not_available']).withMessage('Invalid availability status'),
  
  validate
];

/**
 * QUERY PARAMS - Projects Filter
 */
exports.validateProjectsQuery = [
  query('category')
    .optional()
    .trim()
    .isIn(['web', 'mobile', 'desktop', 'other', 'all']).withMessage('Invalid category'),
  
  query('isFeatured')
    .optional()
    .isIn(['true', 'false']).withMessage('isFeatured must be true or false'),
  
  validate
];

/**
 * QUERY PARAMS - Messages Filter
 */
exports.validateMessagesQuery = [
  query('isRead')
    .optional()
    .isIn(['true', 'false']).withMessage('isRead must be true or false'),
  
  validate
];

// ============================================================
// CUSTOM VALIDATORS
// ============================================================

/**
 * Vérifier si une URL est valide et accessible
 */
exports.isValidAccessibleUrl = async (url) => {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    return false;
  }
};

/**
 * Sanitize HTML (pour éviter XSS)
 */
exports.sanitizeHtml = (html) => {
  return html.replace(/<[^>]*>?/gm, '');
};