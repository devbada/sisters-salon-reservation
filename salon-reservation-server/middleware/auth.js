const jwt = require('jsonwebtoken');

// JWT Secret with security validation
const JWT_SECRET = process.env.JWT_SECRET;

// Environment variable validation
if (!JWT_SECRET) {
  console.error('🚨 FATAL: JWT_SECRET environment variable is required in middleware');
  process.exit(1);
}

if (JWT_SECRET.length < 32) {
  console.error('🚨 FATAL: JWT_SECRET must be at least 32 characters long in middleware');
  console.error('📋 Current length:', JWT_SECRET.length);
  process.exit(1);
}

// Authentication middleware
const authenticateToken = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: '인증 토큰이 필요합니다.' });
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        if (err.name === 'TokenExpiredError') {
          return res.status(401).json({ error: '토큰이 만료되었습니다. 다시 로그인해주세요.' });
        } else if (err.name === 'JsonWebTokenError') {
          return res.status(403).json({ error: '유효하지 않은 토큰입니다.' });
        } else {
          return res.status(403).json({ error: '토큰 검증에 실패했습니다.' });
        }
      }
      
      // Add admin info to request object
      req.admin = {
        id: decoded.adminId,
        username: decoded.username
      };
      
      next();
    });
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Admin-only middleware (runs after authenticateToken)
const requireAdmin = (req, res, next) => {
  try {
    if (!req.admin || !req.admin.id) {
      return res.status(403).json({ error: '관리자 권한이 필요합니다.' });
    }
    
    next();
  } catch (error) {
    console.error('Admin authorization error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { 
  authenticateToken, 
  requireAdmin 
};