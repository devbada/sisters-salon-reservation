var express = require('express');
var router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../db/database');
const authenticateToken = require('../middleware/auth');

// Prepared statements for better performance
const getAllDesigners = db.prepare('SELECT * FROM hair_designers WHERE deleted = 0 ORDER BY name');
const getDesignerById = db.prepare('SELECT * FROM hair_designers WHERE _id = ? AND deleted = 0');
const getDesignerByIdIncludeDeleted = db.prepare('SELECT * FROM hair_designers WHERE _id = ?');
const insertDesigner = db.prepare(`
  INSERT INTO hair_designers (_id, name, specialization, phone, email, experience_years, profile_image, bio, is_active, created_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);
const updateDesigner = db.prepare(`
  UPDATE hair_designers 
  SET name = ?, specialization = ?, phone = ?, email = ?, experience_years = ?, profile_image = ?, bio = ?, is_active = ?, updated_at = ?
  WHERE _id = ? AND deleted = 0
`);
const logicalDeleteDesigner = db.prepare(`
  UPDATE hair_designers 
  SET deleted = 1, is_active = 0, updated_at = ?
  WHERE _id = ? AND deleted = 0
`);
const restoreDesigner = db.prepare(`
  UPDATE hair_designers 
  SET deleted = 0, updated_at = ?
  WHERE _id = ?
`);
const checkNameConflict = db.prepare(`
  SELECT COUNT(*) as count 
  FROM hair_designers 
  WHERE name = ? AND _id != ? AND deleted = 0
`);

// Validation helper functions
function validateDesignerData(data) {
  const errors = [];
  
  // Name validation
  if (!data.name || typeof data.name !== 'string') {
    errors.push('디자이너 이름이 필요합니다.');
  } else if (data.name.trim().length < 2) {
    errors.push('디자이너 이름은 2글자 이상이어야 합니다.');
  } else if (data.name.trim().length > 30) {
    errors.push('디자이너 이름은 30글자 이하여야 합니다.');
  }
  
  // Specialization validation (optional)
  if (data.specialization && typeof data.specialization !== 'string') {
    errors.push('전문분야는 문자열이어야 합니다.');
  } else if (data.specialization && data.specialization.length > 100) {
    errors.push('전문분야는 100글자 이하여야 합니다.');
  }
  
  // Phone validation (optional)
  if (data.phone && typeof data.phone !== 'string') {
    errors.push('전화번호는 문자열이어야 합니다.');
  } else if (data.phone) {
    const phoneRegex = /^\d{3}-\d{3,4}-\d{4}$/;
    if (!phoneRegex.test(data.phone)) {
      errors.push('전화번호 형식이 올바르지 않습니다 (예: 010-1234-5678).');
    }
  }
  
  // Email validation (optional)
  if (data.email && typeof data.email !== 'string') {
    errors.push('이메일은 문자열이어야 합니다.');
  } else if (data.email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      errors.push('올바른 이메일 형식이 아닙니다.');
    }
  }
  
  // Experience years validation (optional)
  if (data.experience_years !== undefined) {
    if (!Number.isInteger(data.experience_years) || data.experience_years < 0) {
      errors.push('경력은 0 이상의 정수여야 합니다.');
    } else if (data.experience_years > 50) {
      errors.push('경력은 50년 이하여야 합니다.');
    }
  }
  
  // Bio validation (optional)
  if (data.bio && typeof data.bio !== 'string') {
    errors.push('소개는 문자열이어야 합니다.');
  } else if (data.bio && data.bio.length > 500) {
    errors.push('소개는 500글자 이하여야 합니다.');
  }
  
  // Active status validation (optional)
  if (data.is_active !== undefined && typeof data.is_active !== 'boolean') {
    errors.push('활성화 상태는 boolean이어야 합니다.');
  }
  
  return errors;
}

// GET all active designers
router.get('/', authenticateToken, function(req, res) {
  try {
    const designers = getAllDesigners.all();
    res.json(designers);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Database error occurred' });
  }
});

// GET a specific designer by ID
router.get('/:id', authenticateToken, function(req, res) {
  try {
    const id = req.params.id;
    const designer = getDesignerById.get(id);
    
    if (!designer) {
      return res.status(404).json({ error: 'Designer not found' });
    }
    
    res.json(designer);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Database error occurred' });
  }
});

// POST a new designer
router.post('/', authenticateToken, function(req, res) {
  const { 
    name, 
    specialization = null, 
    phone = null, 
    email = null, 
    experience_years = 0, 
    profile_image = null, 
    bio = null, 
    is_active = true 
  } = req.body;
  
  // Validate required fields
  if (!name) {
    return res.status(400).json({ error: 'Designer name is required' });
  }
  
  // Advanced validation
  const validationErrors = validateDesignerData(req.body);
  if (validationErrors.length > 0) {
    return res.status(400).json({ 
      error: 'Validation failed', 
      details: validationErrors 
    });
  }
  
  try {
    // Check for name conflicts
    const nameConflict = checkNameConflict.get(name.trim(), '');
    
    if (nameConflict && nameConflict.count > 0) {
      return res.status(409).json({ 
        error: `${name} 이름의 디자이너가 이미 존재합니다.` 
      });
    }
    
    const _id = uuidv4();
    const created_at = new Date().toISOString();
    
    insertDesigner.run(
      _id, 
      name.trim(), 
      specialization, 
      phone, 
      email, 
      experience_years, 
      profile_image, 
      bio, 
      is_active ? 1 : 0,
      created_at
    );
    
    const newDesigner = getDesignerById.get(_id);
    res.status(201).json(newDesigner);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Database error occurred' });
  }
});

// PUT (update) an existing designer
router.put('/:id', authenticateToken, function(req, res) {
  const id = req.params.id;
  
  try {
    // Check if designer exists and is not deleted
    const existingDesigner = getDesignerById.get(id);
    if (!existingDesigner) {
      return res.status(404).json({ error: 'Designer not found' });
    }
    
    const { 
      name, 
      specialization = null, 
      phone = null, 
      email = null, 
      experience_years = 0, 
      profile_image = null, 
      bio = null, 
      is_active = true 
    } = req.body;
    
    // Validate required fields
    if (!name) {
      return res.status(400).json({ error: 'Designer name is required' });
    }
    
    // Advanced validation
    const validationErrors = validateDesignerData(req.body);
    if (validationErrors.length > 0) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: validationErrors 
      });
    }
    
    // Check for name conflicts (excluding current designer)
    const nameConflict = checkNameConflict.get(name.trim(), id);
    
    if (nameConflict && nameConflict.count > 0) {
      return res.status(409).json({ 
        error: `${name} 이름의 디자이너가 이미 존재합니다.` 
      });
    }
    
    const updated_at = new Date().toISOString();
    updateDesigner.run(
      name.trim(), 
      specialization, 
      phone, 
      email, 
      experience_years, 
      profile_image, 
      bio, 
      is_active ? 1 : 0,
      updated_at, 
      id
    );
    
    const updatedDesigner = getDesignerById.get(id);
    res.json(updatedDesigner);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Database error occurred' });
  }
});

// DELETE (logical delete) a designer
router.delete('/:id', authenticateToken, function(req, res) {
  try {
    const id = req.params.id;
    
    // Check if designer exists and is not already deleted
    const designer = getDesignerById.get(id);
    if (!designer) {
      return res.status(404).json({ error: 'Designer not found' });
    }
    
    const updated_at = new Date().toISOString();
    logicalDeleteDesigner.run(updated_at, id);
    
    // Return the designer data before deletion for confirmation
    res.json({ 
      message: `${designer.name} 디자이너가 삭제되었습니다.`,
      designer: designer 
    });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Database error occurred' });
  }
});

// POST restore a logically deleted designer (admin feature)
router.post('/:id/restore', authenticateToken, function(req, res) {
  try {
    const id = req.params.id;
    
    // Check if designer exists (including deleted ones)
    const designer = getDesignerByIdIncludeDeleted.get(id);
    if (!designer) {
      return res.status(404).json({ error: 'Designer not found' });
    }
    
    if (!designer.deleted) {
      return res.status(400).json({ error: 'Designer is not deleted' });
    }
    
    const updated_at = new Date().toISOString();
    restoreDesigner.run(updated_at, id);
    
    const restoredDesigner = getDesignerById.get(id);
    res.json({ 
      message: `${restoredDesigner.name} 디자이너가 복구되었습니다.`,
      designer: restoredDesigner 
    });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Database error occurred' });
  }
});

module.exports = router;