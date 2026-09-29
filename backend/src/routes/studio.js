const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { getDb, saveDb } = require('../config/database');
const { authenticate, authorize } = require('../middleware/auth');
const router = express.Router();

function parseRows(r) { if(!r.length)return[]; const c=r[0].columns; return r[0].values.map(row=>{const o={};c.forEach((k,i)=>o[k]=row[i]);return o;}); }

// Template-based content generation (no API key needed)
function generateFromTemplate(source, platform, language) {
  const title = source.title || 'Untitled';
  const summary = source.summary || source.description || source.abstract || '';
  const region = source.region || '';
  const year = source.year || '';

  const templates = {
    website_article: {
      en: `${title}\n\n${summary}\n\nThis ${region ? region.toLowerCase() + ' ' : ''}research programme${year ? ' (' + year + ')' : ''} contributes to India's ongoing commitment to polar and ocean science under the National Centre for Polar and Ocean Research (NCPOR), Ministry of Earth Sciences.`,
      hi: `${source.title_hi || title}\n\n${source.summary_hi || summary}\n\nयह अनुसंधान कार्यक्रम भारत की ध्रुवीय और महासागर विज्ञान के प्रति प्रतिबद्धता में योगदान देता है।`
    },
    press_release: {
      en: `PRESS RELEASE\n\nNational Centre for Polar and Ocean Research (NCPOR)\nMinistry of Earth Sciences, Government of India\n\n${title}\n\n${summary}\n\nFor media enquiries, contact: media@ncpor.gov.in`,
      hi: `प्रेस विज्ञप्ति\n\nराष्ट्रीय ध्रुवीय एवं महासागर अनुसंधान केंद्र (NCPOR)\n\n${source.title_hi || title}\n\n${source.summary_hi || summary}`
    },
    facebook: {
      en: `${title}\n\n${summary.slice(0, 300)}${summary.length > 300 ? '...' : ''}\n\nLearn more at ncpor.res.in\n\n#NCPOR #PolarScience #IndianResearch${region ? ' #' + region : ''}`,
      hi: `${source.title_hi || title}\n\n${(source.summary_hi || summary).slice(0, 300)}\n\n#NCPOR #ध्रुवीयविज्ञान`
    },
    twitter: {
      en: `${title.slice(0, 200)} — ${summary.slice(0, 60)}... #NCPOR #PolarScience${region ? ' #' + region : ''}`,
      hi: `${(source.title_hi || title).slice(0, 200)} #NCPOR #ध्रुवीयविज्ञान`
    },
    instagram: {
      en: `${title}\n\n${summary.slice(0, 400)}\n\n.\n.\n.\n#NCPOR #PolarResearch #IndianScience #MoES${region ? ' #' + region + 'Research' : ''} #Expedition #Science #India #Research`,
      hi: `${source.title_hi || title}\n\n${(source.summary_hi || summary).slice(0, 400)}\n\n#NCPOR #भारतीयविज्ञान`
    },
    linkedin: {
      en: `${title}\n\n${summary}\n\nThis work is part of India's sustained commitment to understanding polar and oceanic processes through scientific research programmes conducted by NCPOR under the Ministry of Earth Sciences.\n\n#PolarScience #Research #India #NCPOR`,
      hi: `${source.title_hi || title}\n\n${source.summary_hi || summary}\n\n#NCPOR #अनुसंधान`
    },
    youtube: {
      en: `${title}\n\n${summary}\n\nAbout NCPOR:\nThe National Centre for Polar and Ocean Research (NCPOR) is an autonomous institution under the Ministry of Earth Sciences, Government of India, responsible for India's polar and ocean research programmes.\n\nWebsite: ncpor.res.in`,
      hi: `${source.title_hi || title}\n\n${source.summary_hi || summary}`
    },
    newsletter: {
      en: `FEATURED: ${title}\n\n${summary}\n\nRead the full report on the NCPOR portal.`,
      hi: `विशेष: ${source.title_hi || title}\n\n${source.summary_hi || summary}`
    }
  };

  const tmpl = templates[platform] || templates.website_article;
  return (tmpl[language] || tmpl.en);
}

// Fact annotation: highlight numbers and dates with source fields
function annotateFactsFromSource(text, source) {
  const annotations = [];
  // Find numbers
  const numberRegex = /\b\d{1,4}(?:\.\d+)?\b/g;
  let match;
  while ((match = numberRegex.exec(text)) !== null) {
    // Try to trace to source fields
    for (const [key, value] of Object.entries(source)) {
      if (value && String(value).includes(match[0])) {
        annotations.push({ text: match[0], index: match.index, sourceField: key, sourceValue: value });
        break;
      }
    }
  }
  // Find dates (YYYY-MM-DD or YYYY)
  const dateRegex = /\b(20\d{2}(?:-\d{2}(?:-\d{2})?)?)\b/g;
  while ((match = dateRegex.exec(text)) !== null) {
    for (const [key, value] of Object.entries(source)) {
      if (value && String(value).includes(match[0])) {
        annotations.push({ text: match[0], index: match.index, sourceField: key, sourceValue: value });
        break;
      }
    }
  }
  return annotations;
}

// POST /api/v1/studio/generate — generate content drafts
router.post('/generate', authenticate, authorize('ADMIN','EDITOR'), async (req, res, next) => {
  try {
    const db = await getDb();
    const { source_type, source_id, platforms } = req.body;
    
    // Fetch source record
    const tableMap = { expedition: 'expeditions', dataset: 'datasets', publication: 'publications', news: 'news_articles', event: 'events', media: 'media_items' };
    const table = tableMap[source_type];
    if (!table) return res.status(400).json({ error: { code:'BAD_REQUEST', message:'Invalid source_type.' } });
    
    const rows = db.exec(`SELECT * FROM ${table} WHERE id = ?`, [source_id]);
    if (!rows.length||!rows[0].values.length) return res.status(404).json({ error: { code:'NOT_FOUND', message:'Source record not found.' } });
    const cols = rows[0].columns;
    const source = {};
    cols.forEach((c,i) => source[c] = rows[0].values[0][i]);

    const platformList = platforms || ['website_article','press_release','facebook','twitter','instagram','linkedin','youtube','newsletter'];
    const generated = [];

    for (const platform of platformList) {
      for (const lang of ['en', 'hi']) {
        const content = generateFromTemplate(source, platform, lang);
        const annotations = annotateFactsFromSource(content, source);
        const id = uuidv4();
        db.run(`INSERT INTO generated_content (id,source_type,source_id,platform,language,content,fact_annotations,status,created_by) VALUES (?,?,?,?,?,?,?,?,?)`,
          [id, source_type, source_id, platform, lang, content, JSON.stringify(annotations), 'DRAFT', req.user.id]);
        generated.push({ id, platform, language: lang, content, fact_annotations: annotations, status: 'DRAFT' });
      }
    }
    saveDb();
    res.json({ generated, message: 'Draft: needs human review' });
  } catch (err) { next(err); }
});

// GET /api/v1/studio/content — list generated content
router.get('/content', authenticate, authorize('ADMIN','EDITOR'), async (req, res, next) => {
  try {
    const db = await getDb();
    const { source_type, source_id, status } = req.query;
    let sql = 'SELECT * FROM generated_content';
    let where = []; let params = [];
    if (source_type) { where.push('source_type=?'); params.push(source_type); }
    if (source_id) { where.push('source_id=?'); params.push(source_id); }
    if (status) { where.push('status=?'); params.push(status); }
    if (where.length) sql += ' WHERE ' + where.join(' AND ');
    sql += ' ORDER BY created_at DESC';
    res.json({ content: parseRows(db.exec(sql, params)) });
  } catch (err) { next(err); }
});

// PUT /api/v1/studio/content/:id/approve
router.put('/content/:id/approve', authenticate, authorize('ADMIN'), async (req, res, next) => {
  try {
    const db = await getDb();
    db.run("UPDATE generated_content SET status='APPROVED', approved_by=?, updated_at=datetime('now') WHERE id=?", [req.user.id, req.params.id]);
    saveDb(); res.json({ message: 'Content approved.' });
  } catch (err) { next(err); }
});

// PUT /api/v1/studio/content/:id/reject
router.put('/content/:id/reject', authenticate, authorize('ADMIN'), async (req, res, next) => {
  try {
    const db = await getDb();
    db.run("UPDATE generated_content SET status='REJECTED', updated_at=datetime('now') WHERE id=?", [req.params.id]);
    saveDb(); res.json({ message: 'Content rejected.' });
  } catch (err) { next(err); }
});

// POST /api/v1/studio/schedule
router.post('/schedule', authenticate, authorize('ADMIN'), async (req, res, next) => {
  try {
    const db = await getDb();
    const { generated_content_id, platform, scheduled_date } = req.body;
    const id = uuidv4();
    db.run('INSERT INTO scheduled_posts (id,generated_content_id,platform,scheduled_date,created_by) VALUES (?,?,?,?,?)',
      [id, generated_content_id, platform, scheduled_date, req.user.id]);
    saveDb(); res.status(201).json({ id, message: 'Post scheduled.' });
  } catch (err) { next(err); }
});

// GET /api/v1/studio/schedule
router.get('/schedule', authenticate, authorize('ADMIN','EDITOR'), async (req, res, next) => {
  try {
    const db = await getDb();
    const rows = db.exec('SELECT sp.*, gc.content, gc.platform as content_platform, gc.language FROM scheduled_posts sp LEFT JOIN generated_content gc ON sp.generated_content_id = gc.id ORDER BY sp.scheduled_date');
    res.json({ posts: parseRows(rows) });
  } catch (err) { next(err); }
});

module.exports = router;
