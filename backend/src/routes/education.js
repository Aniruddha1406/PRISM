const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { getDb, saveDb } = require('../config/database');
const { authenticate, authorize } = require('../middleware/auth');
const router = express.Router();

function parseRows(r) { if(!r.length)return[]; const c=r[0].columns; return r[0].values.map(row=>{const o={};c.forEach((k,i)=>o[k]=row[i]);return o;}); }

// GET /api/v1/education — list resources
router.get('/', async (req, res, next) => {
  try {
    const db = await getDb();
    const { resource_type } = req.query;
    let sql = "SELECT * FROM education_resources WHERE status='PUBLISHED'";
    let params = [];
    if (resource_type) { sql += ' AND resource_type=?'; params.push(resource_type); }
    sql += ' ORDER BY created_at DESC';
    const rows = db.exec(sql, params);
    res.json({ resources: parseRows(rows) });
  } catch (err) { next(err); }
});

// GET /api/v1/education/glossary
router.get('/glossary', async (req, res, next) => {
  try {
    const db = await getDb();
    const { category } = req.query;
    let sql = 'SELECT * FROM glossary_terms';
    let params = [];
    if (category) { sql += ' WHERE category=?'; params.push(category); }
    sql += ' ORDER BY term';
    const rows = db.exec(sql, params);
    res.json({ terms: parseRows(rows) });
  } catch (err) { next(err); }
});

// POST /api/v1/education/questions — submit question (rate limited)
router.post('/questions', async (req, res, next) => {
  try {
    const db = await getDb();
    const { name, email, question } = req.body;
    if (!name || !email || !question) return res.status(400).json({ error: { code:'BAD_REQUEST', message:'Name, email and question are required.' } });
    const id = uuidv4();
    db.run('INSERT INTO question_submissions (id,name,email,question) VALUES (?,?,?,?)', [id,name,email,question]);
    saveDb();
    res.status(201).json({ message: 'Question submitted for moderation.' });
  } catch (err) { next(err); }
});

// GET /api/v1/education/questions — admin list
router.get('/questions/all', authenticate, authorize('ADMIN','EDITOR'), async (req, res, next) => {
  try {
    const db = await getDb();
    const rows = db.exec('SELECT * FROM question_submissions ORDER BY created_at DESC');
    res.json({ questions: parseRows(rows) });
  } catch (err) { next(err); }
});

// POST /api/v1/education
router.post('/', authenticate, authorize('ADMIN','EDITOR'), async (req, res, next) => {
  try {
    const db = await getDb(); const b=req.body; const id=uuidv4();
    const slug = (b.title||'resource').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');

    if (req.user.role === 'EDITOR') {
      const pendingId = uuidv4();
      const payload = JSON.stringify({ ...b, slug });
      db.run('INSERT INTO pending_changes (id, entity_type, entity_id, action, payload, status, submitted_by) VALUES (?,?,?,?,?,?,?)',
        [pendingId, 'education', null, 'CREATE', payload, 'PENDING', req.user.id]);
      saveDb();
      return res.status(201).json({ pending_id: pendingId, message: 'Submitted for admin approval.' });
    }

    db.run(`INSERT INTO education_resources (id,title,title_hi,slug,description,description_hi,resource_type,file_path,target_audience,status,created_by) VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
      [id,b.title,b.title_hi||null,slug,b.description||null,b.description_hi||null,b.resource_type||'TEACHING_KIT',b.file_path||null,b.target_audience||null,'DRAFT',req.user.id]);
    saveDb(); res.status(201).json({ id, slug });
  } catch (err) { next(err); }
});

module.exports = router;
