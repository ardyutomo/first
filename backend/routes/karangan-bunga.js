const express = require('express');
const router = express.Router();
const db = require('../database');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

// GET /api/karangan-bunga
router.get('/', (req, res) => {
  const { search, date_from, date_to } = req.query;

  let query = 'SELECT * FROM karangan_bunga WHERE 1=1';
  const params = [];

  if (search) {
    query += ' AND (text_ucapan LIKE ? OR pengirim LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }

  if (date_from) {
    query += ' AND tanggal_diajukan >= ?';
    params.push(date_from);
  }

  if (date_to) {
    query += ' AND tanggal_diajukan <= ?';
    params.push(date_to);
  }

  query += ' ORDER BY created_at DESC';

  const rows = db.prepare(query).all(...params);
  res.json({ data: rows, total: rows.length });
});

// GET /api/karangan-bunga/:id
router.get('/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM karangan_bunga WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Data tidak ditemukan' });
  res.json(row);
});

// POST /api/karangan-bunga
router.post('/', (req, res) => {
  const { text_ucapan, pengirim, tanggal_diajukan, nominal } = req.body;

  if (!text_ucapan || !pengirim || !tanggal_diajukan) {
    return res.status(400).json({ error: 'Semua field wajib diisi' });
  }

  const result = db.prepare(
    'INSERT INTO karangan_bunga (text_ucapan, pengirim, tanggal_diajukan, nominal) VALUES (?, ?, ?, ?)'
  ).run(text_ucapan, pengirim, tanggal_diajukan, nominal || 0);

  const newRow = db.prepare('SELECT * FROM karangan_bunga WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(newRow);
});

// PUT /api/karangan-bunga/:id
router.put('/:id', (req, res) => {
  const { text_ucapan, pengirim, tanggal_diajukan, nominal } = req.body;

  const existing = db.prepare('SELECT id FROM karangan_bunga WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Data tidak ditemukan' });

  if (!text_ucapan || !pengirim || !tanggal_diajukan) {
    return res.status(400).json({ error: 'Semua field wajib diisi' });
  }

  db.prepare(
    'UPDATE karangan_bunga SET text_ucapan=?, pengirim=?, tanggal_diajukan=?, nominal=?, updated_at=CURRENT_TIMESTAMP WHERE id=?'
  ).run(text_ucapan, pengirim, tanggal_diajukan, nominal || 0, req.params.id);

  const updated = db.prepare('SELECT * FROM karangan_bunga WHERE id = ?').get(req.params.id);
  res.json(updated);
});

// DELETE /api/karangan-bunga/:id
router.delete('/:id', (req, res) => {
  const existing = db.prepare('SELECT id FROM karangan_bunga WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Data tidak ditemukan' });

  db.prepare('DELETE FROM karangan_bunga WHERE id = ?').run(req.params.id);
  res.json({ message: 'Data berhasil dihapus' });
});

module.exports = router;
