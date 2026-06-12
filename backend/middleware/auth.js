const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'government-app-secret-key-2024';

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token tidak ditemukan' });
  }

  const token = authHeader.substring(7);

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token telah kedaluwarsa' });
    }
    return res.status(401).json({ error: 'Token tidak valid' });
  }
}

module.exports = { authMiddleware, JWT_SECRET };
