const express = require('express');
const { getDb } = require('../config/database');
const router = express.Router();

function parseRows(r) { if(!r.length)return[]; const c=r[0].columns; return r[0].values.map(row=>{const o={};c.forEach((k,i)=>o[k]=row[i]);return o;}); }

// GET /api/v1/search?q=term
router.get('/', async (req, res, next) => {
  try {
    const { q, page=1, limit=20 } = req.query;
    if (!q || q.length < 2) return res.json({ results: [], total: 0 });
    const db = await getDb();
    const term = `%${q}%`;
    
    // Search across all content types
    const expeditions = parseRows(db.exec("SELECT id, title, slug, summary, 'expedition' as content_type, region as meta FROM expeditions WHERE status='PUBLISHED' AND (title LIKE ? OR summary LIKE ? OR description LIKE ?) LIMIT 10", [term,term,term]));
    const datasets = parseRows(db.exec("SELECT id, title, slug, description as summary, 'dataset' as content_type, discipline as meta FROM datasets WHERE status='PUBLISHED' AND (title LIKE ? OR description LIKE ? OR parameters LIKE ?) LIMIT 10", [term,term,term]));
    const publications = parseRows(db.exec("SELECT id, title, slug, abstract as summary, 'publication' as content_type, pub_type as meta FROM publications WHERE status='PUBLISHED' AND (title LIKE ? OR abstract LIKE ? OR authors LIKE ? OR keywords LIKE ?) LIMIT 10", [term,term,term,term]));
    const media = parseRows(db.exec("SELECT id, title, slug, description as summary, 'media' as content_type, media_type as meta FROM media_items WHERE status='PUBLISHED' AND (title LIKE ? OR description LIKE ? OR credit LIKE ?) LIMIT 10", [term,term,term]));
    const news = parseRows(db.exec("SELECT id, title, slug, summary, 'news' as content_type, publish_date as meta FROM news_articles WHERE status='PUBLISHED' AND (title LIKE ? OR summary LIKE ? OR body LIKE ?) LIMIT 10", [term,term,term]));
    const glossary = parseRows(db.exec("SELECT id, term as title, '' as slug, definition as summary, 'glossary' as content_type, category as meta FROM glossary_terms WHERE term LIKE ? OR definition LIKE ? LIMIT 10", [term,term]));
    
    const results = { expeditions, datasets, publications, media, news, glossary };
    const total = expeditions.length + datasets.length + publications.length + media.length + news.length + glossary.length;
    
    res.json({ results, total, query: q });
  } catch (err) { next(err); }
});

module.exports = router;
