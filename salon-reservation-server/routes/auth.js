const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db/database');

const router = express.Router();

// JWT Secret (should be in environment variables)
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

// Prepared statements for better performance
const getAdminByUsername = db.prepare('SELECT * FROM administrators WHERE username = ?');
const insertAdmin = db.prepare('INSERT INTO administrators (username, password_hash) VALUES (?, ?)');
const countAdmins = db.prepare('SELECT COUNT(*) as count FROM administrators');

// Check if any administrator exists
router.get('/check-admin', (req, res) => {
  try {
    const result = countAdmins.get();
    const hasAdmin = result.count > 0;
    res.json({ hasAdmin });
  } catch (error) {
    console.error('Error checking admin:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Register first administrator (only when no admin exists)
router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Validation
    if (!username || !password) {
      return res.status(400).json({ error: '사용자명과 비밀번호는 필수입니다.' });
    }
    
    if (username.length < 3) {
      return res.status(400).json({ error: '사용자명은 3자 이상이어야 합니다.' });
    }
    
    if (password.length < 8) {
      return res.status(400).json({ error: '비밀번호는 8자 이상이어야 합니다.' });
    }
    
    // Password strength validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({ 
        error: '비밀번호는 대소문자, 숫자, 특수문자(@$!%*?&)를 각각 최소 1개씩 포함해야 합니다.' 
      });
    }
    
    // Check if any admin already exists
    const adminCount = countAdmins.get();
    if (adminCount.count > 0) {
      return res.status(403).json({ error: '관리자가 이미 등록되어 있습니다.' });
    }
    
    // Check if username already exists (shouldn't happen but safety check)
    const existingAdmin = getAdminByUsername.get(username);
    if (existingAdmin) {
      return res.status(409).json({ error: '이미 사용 중인 사용자명입니다.' });
    }
    
    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    
    // Insert admin
    const result = insertAdmin.run(username, passwordHash);
    
    res.status(201).json({ 
      message: '관리자 계정이 성공적으로 생성되었습니다.',
      adminId: result.lastInsertRowid
    });
  } catch (error) {
    console.error('Error registering admin:', error);
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      res.status(409).json({ error: '이미 사용 중인 사용자명입니다.' });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

// Administrator login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Validation
    if (!username || !password) {
      return res.status(400).json({ error: '사용자명과 비밀번호를 입력해주세요.' });
    }
    
    // Find admin
    const admin = getAdminByUsername.get(username);
    if (!admin) {
      return res.status(401).json({ error: '잘못된 사용자명 또는 비밀번호입니다.' });
    }
    
    // Verify password
    const passwordMatch = await bcrypt.compare(password, admin.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({ error: '잘못된 사용자명 또는 비밀번호입니다.' });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { 
        adminId: admin.id,
        username: admin.username
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
    
    res.json({
      message: '로그인 성공',
      token,
      admin: {
        id: admin.id,
        username: admin.username
      }
    });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Token verification endpoint
router.get('/verify', (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }
    
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(403).json({ error: 'Invalid or expired token' });
      }
      
      res.json({
        valid: true,
        admin: {
          id: decoded.adminId,
          username: decoded.username
        }
      });
    });
  } catch (error) {
    console.error('Error verifying token:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;