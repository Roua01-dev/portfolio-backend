const jwt = require('jsonwebtoken');

module.exports = (user) => {
  const accessToken = jwt.sign(
    { userId: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );

  const refreshToken = jwt.sign(
    { userId: user._id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );

  user.refreshToken = refreshToken;
  user.refreshTokenExpiry = Date.now() + 7 * 24 * 60 * 60 * 1000;
  user.save({ validateBeforeSave: false });

  return { accessToken, refreshToken };
};
