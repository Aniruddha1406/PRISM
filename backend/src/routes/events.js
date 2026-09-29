const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { getDb, saveDb } = require('../config/database');
const { authenticate, authorize } = require('../middleware/auth');
const router = express.Router();

function parseRows(r) { if(!r.length)return[]; const c=r[0].columns; return r[0].values.map(row=>{const o={};c.forEach((k,i)=>o[k]=row[i]);return o;}); }

// GET /api/v1/events
router.get('/', async (req, res, next) => {
  try {
    const db = await getDb();
    const rows = db.exec("SELECT * FROM events WHERE status='PUBLISHED' ORDER BY start_date DESC");
    res.json({ events: parseRows(rows) });
  } catch (err) { next(err); }
});

// GET /api/v1/events/:slug
router.get('/:slug', async (req, res, next) => {
  try {
    const db = await getDb();
    const rows = db.exec("SELECT * FROM events WHERE slug=? AND status='PUBLISHED'", [req.params.slug]);
    if(!rows.length||!rows[0].values.length) return res.status(404).json({error:{code:'NOT_FOUND'}});
    res.json({ event: parseRows(rows)[0] });
  } catch (err) { next(err); }
});

// GET /api/v1/events/export/ical — iCal export
router.get('/export/ical', async (req, res, next) => {
  try {
    const db = await getDb();
    const rows = db.exec("SELECT * FROM events WHERE status='PUBLISHED' ORDER BY start_date");
    const events = parseRows(rows);
    let ical = 'BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//NCPOR//Events//EN\n';
    events.forEach(e => {
      const start = (e.start_date||'').replace(/-/g,'');
      const end = (e.end_date||e.start_date||'').replace(/-/g,'');
      ical += `BEGIN:VEVENT\nDTSTART:${start}\nDTEND:${end}\nSUMMARY:${e.title}\nDESCRIPTION:${(e.description||'').replace(/\n/g,'\\n')}\nLOCATION:${e.location||''}\nEND:VEVENT\n`;
    });
    ical += 'END:VCALENDAR';
    res.setHeader('Content-Type','text/calendar');
    res.setHeader('Content-Disposition','attachment; filename="ncpor-events.ics"');
    res.send(ical);
  } catch (err) { next(err); }
});

// POST /api/v1/events
router.post('/', authenticate, authorize('SUPER_ADMIN','EDITOR','OUTREACH_MANAGER'), async (req, res, next) => {
  try {
    const db = await getDb(); const b=req.body; const id=uuidv4();
    const slug = (b.title||'event').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');
    db.run(`INSERT INTO events (id,title,title_hi,slug,description,description_hi,location,start_date,end_date,event_type,status,created_by) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
      [id,b.title,b.title_hi||null,slug,b.description||null,b.description_hi||null,b.location||null,b.start_date||null,b.end_date||null,b.event_type||null,'DRAFT',req.user.id]);
    saveDb(); res.status(201).json({ id, slug });
  } catch (err) { next(err); }
});

module.exports = router;
