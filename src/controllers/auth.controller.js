const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const EmailService = require('../services/email.service');
const generateTokens = require('../utils/generateTokens');

/**
 * LOGIN
 * email + password → envoie code 2FA par email
 */
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Account disabled' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      await user.incrementLoginAttempts();
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const emailCode = user.generateEmail2FACode();
    await user.save({ validateBeforeSave: false });

    await EmailService.sendLogin2FACode(user.email, emailCode);

    const tempToken = jwt.sign(
      { userId: user._id, step: 'email-2fa' },
      process.env.JWT_SECRET,
      { expiresIn: '10m' }
    );

    return res.status(200).json({
      success: true,
      requires2FA: true,
      message: 'Verification code sent to your email',
      tempToken,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * VERIFY EMAIL 2FA
 */
exports.verifyEmail2FA = async (req, res, next) => {
  try {
    const { code, tempToken } = req.body;

    const decoded = jwt.verify(tempToken, process.env.JWT_SECRET);

    if (decoded.step !== 'email-2fa') {
      return res.status(401).json({ success: false, message: 'Invalid step' });
    }

    const hashedCode = crypto.createHash('sha256').update(code).digest('hex');

    const user = await User.findOne({
      _id: decoded.userId,
      email2FACode: hashedCode,
      email2FAExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid or expired code' });
    }

    user.email2FACode = undefined;
    user.email2FAExpire = undefined;
    user.lastLogin = Date.now();

    const accessToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { id: user._id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    console.log(`✅ User logged in: ${user.email}`);

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        accessToken,
        refreshToken,
        user: { id: user._id, email: user.email, role: user.role },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * RESEND 2FA CODE
 * Vérifie le tempToken, génère un nouveau code et le renvoie par email.
 * Rate-limit natif : le tempToken JWT expire dans 10 min depuis le login,
 * donc si quelqu'un tente de spammer après expiration il reçoit une 401.
 */
exports.resend2FA = async (req, res, next) => {
  try {
    const { tempToken } = req.body;

    if (!tempToken) {
      return res.status(400).json({ success: false, message: 'tempToken required' });
    }

    // Vérifier que le token est encore valide
    let decoded;
    try {
      decoded = jwt.verify(tempToken, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: 'Session expired. Please log in again.',
      });
    }

    if (decoded.step !== 'email-2fa') {
      return res.status(401).json({ success: false, message: 'Invalid step' });
    }

    const user = await User.findById(decoded.userId);
    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, message: 'User not found or inactive' });
    }

    // Vérifier que le dernier code a été émis il y a au moins 60 secondes
    // (email2FAExpire est réglé à +10 min lors de generateEmail2FACode)
    if (user.email2FAExpire) {
      const issuedAt = new Date(user.email2FAExpire.getTime() - 10 * 60 * 1000);
      const secondsSinceIssue = (Date.now() - issuedAt.getTime()) / 1000;
      if (secondsSinceIssue < 60) {
        const waitSeconds = Math.ceil(60 - secondsSinceIssue);
        return res.status(429).json({
          success: false,
          message: `Please wait ${waitSeconds} seconds before requesting a new code.`,
        });
      }
    }

    // Générer et envoyer un nouveau code
    const emailCode = user.generateEmail2FACode();
    await user.save({ validateBeforeSave: false });
    await EmailService.sendLogin2FACode(user.email, emailCode);

    console.log(`📧 2FA code resent to: ${user.email}`);

    return res.status(200).json({
      success: true,
      message: 'A new verification code has been sent to your email.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * REFRESH TOKEN
 */
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ success: false, message: 'Refresh token required' });
    }

    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    } catch (err) {
      return res.status(401).json({ success: false, message: 'Invalid or expired refresh token' });
    }

    const user = await User.findOne({ _id: decoded.id, refreshToken });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Refresh token invalid or revoked' });
    }

    if (!user.isActive) {
      return res.status(401).json({ success: false, message: 'User account is inactive' });
    }

    const newAccessToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    console.log(`🔄 Token refreshed for user: ${user.email}`);

    res.json({
      success: true,
      accessToken: newAccessToken,
      refreshToken, // pas de rotation, on retourne le même
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({ success: false, message: 'Server error during token refresh' });
  }
};

/**
 * LOGOUT
 */
exports.logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      await User.findOneAndUpdate(
        { refreshToken },
        { $unset: { refreshToken: 1 } }
      );
      console.log(`🚪 User logged out, token revoked`);
    }

    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ success: false, message: 'Server error during logout' });
  }
};