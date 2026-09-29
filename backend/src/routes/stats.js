const express = require('express');
const { getDb } = require('../config/database');
const { authenticate, authorize } = require('../middleware/auth');
const router = express.Router();

function parseRows(r) { if(!r.length)return[]; const c=r[0].columns; return r[0].values.map(row=>{const o={};c.forEach((k,i)=>o[k]=row[i]);return o;}); }

// GET /api/v1/stats — public counts
router.get('/', async (req, res, next) => {
  try {
    const db = await getDb();
    const exp = db.exec("SELECT COUNT(*) FROM expeditions WHERE status='PUBLISHED'");
    const ds = db.exec("SELECT COUNT(*) FROM datasets WHERE status='PUBLISHED'");
    const pub = db.exec("SELECT COUNT(*) FROM publications WHERE status='PUBLISHED'");
    const media = db.exec("SELECT COUNT(*) FROM media_items WHERE status='PUBLISHED'");
    res.json({
      expeditions: exp.length ? exp[0].values[0][0] : 0,
      datasets: ds.length ? ds[0].values[0][0] : 0,
      publications: pub.length ? pub[0].values[0][0] : 0,
      media: media.length ? media[0].values[0][0] : 0,
    });
  } catch (err) { next(err); }
});

// GET /api/v1/stats/admin — admin analytics
router.get('/admin', authenticate, authorize('ADMIN','EDITOR'), async (req, res, next) => {
  try {
    const db = await getDb();
    // Content by status
    const expByStatus = parseRows(db.exec('SELECT status, COUNT(*) as count FROM expeditions GROUP BY status'));
    const dsByStatus = parseRows(db.exec('SELECT status, COUNT(*) as count FROM datasets GROUP BY status'));
    const pubByStatus = parseRows(db.exec('SELECT status, COUNT(*) as count FROM publications GROUP BY status'));
    const mediaByStatus = parseRows(db.exec('SELECT status, COUNT(*) as count FROM media_items GROUP BY status'));
    const newsByStatus = parseRows(db.exec('SELECT status, COUNT(*) as count FROM news_articles GROUP BY status'));

    // Expeditions by region
    const expByRegion = parseRows(db.exec('SELECT region, COUNT(*) as count FROM expeditions GROUP BY region'));

    // Media by type
    const mediaByType = parseRows(db.exec('SELECT media_type, COUNT(*) as count FROM media_items GROUP BY media_type'));

    // Publications by type
    const pubByType = parseRows(db.exec('SELECT pub_type, COUNT(*) as count FROM publications GROUP BY pub_type'));

    // Downloads
    const downloads = db.exec('SELECT COUNT(*) FROM dataset_download_log');
    const totalDownloads = downloads.length ? downloads[0].values[0][0] : 0;

    // Recent audit log
    const recentAudit = parseRows(db.exec('SELECT al.*, u.name as user_name FROM audit_log al LEFT JOIN users u ON al.user_id = u.id ORDER BY al.created_at DESC LIMIT 20'));

    // Users by role
    const usersByRole = parseRows(db.exec('SELECT role, COUNT(*) as count FROM users GROUP BY role'));

    // Generated content stats
    const studioByStatus = parseRows(db.exec('SELECT status, COUNT(*) as count FROM generated_content GROUP BY status'));

    // Pending approvals count
    const pendingCount = db.exec("SELECT COUNT(*) FROM pending_changes WHERE status='PENDING'");
    const totalPending = pendingCount.length ? pendingCount[0].values[0][0] : 0;

    res.json({
      contentByStatus: { expeditions: expByStatus, datasets: dsByStatus, publications: pubByStatus, media: mediaByStatus, news: newsByStatus },
      expeditionsByRegion: expByRegion,
      mediaByType,
      publicationsByType: pubByType,
      totalDownloads,
      recentAudit,
      usersByRole,
      studioByStatus,
      totalPending,
    });
  } catch (err) { next(err); }
});

module.exports = router;
