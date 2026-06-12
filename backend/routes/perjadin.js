const express = require('express');
const router = express.Router();
const db = require('../database');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

// GET /api/perjadin
router.get('/', (req, res) => {
  const { search, date_from, date_to } = req.query;

  let query = 'SELECT * FROM perjadin WHERE 1=1';
  const params = [];

  if (search) {
    query += ' AND (nama_kegiatan LIKE ? OR nomor_sp LIKE ? OR kota_tujuan LIKE ? OR pelaksana_kegiatan LIKE ?)';
    params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
  }

  if (date_from) {
    query += ' AND tanggal_mulai >= ?';
    params.push(date_from);
  }

  if (date_to) {
    query += ' AND tanggal_mulai <= ?';
    params.push(date_to);
  }

  query += ' ORDER BY created_at DESC';

  const rows = db.prepare(query).all(...params);
  res.json({ data: rows, total: rows.length });
});

// GET /api/perjadin/:id
router.get('/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM perjadin WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Data tidak ditemukan' });
  res.json(row);
});

// POST /api/perjadin
router.post('/', (req, res) => {
  const { nama_kegiatan, nomor_sp, kota_tujuan, tanggal_mulai, tanggal_selesai, pelaksana_kegiatan } = req.body;

  if (!nama_kegiatan || !nomor_sp || !kota_tujuan || !tanggal_mulai || !tanggal_selesai || !pelaksana_kegiatan) {
    return res.status(400).json({ error: 'Semua field wajib diisi' });
  }

  const result = db.prepare(
    'INSERT INTO perjadin (nama_kegiatan, nomor_sp, kota_tujuan, tanggal_mulai, tanggal_selesai, pelaksana_kegiatan) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(nama_kegiatan, nomor_sp, kota_tujuan, tanggal_mulai, tanggal_selesai, pelaksana_kegiatan);

  const newRow = db.prepare('SELECT * FROM perjadin WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(newRow);
});

// PUT /api/perjadin/:id
router.put('/:id', (req, res) => {
  const { nama_kegiatan, nomor_sp, kota_tujuan, tanggal_mulai, tanggal_selesai, pelaksana_kegiatan } = req.body;

  const existing = db.prepare('SELECT id FROM perjadin WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Data tidak ditemukan' });

  if (!nama_kegiatan || !nomor_sp || !kota_tujuan || !tanggal_mulai || !tanggal_selesai || !pelaksana_kegiatan) {
    return res.status(400).json({ error: 'Semua field wajib diisi' });
  }

  db.prepare(
    'UPDATE perjadin SET nama_kegiatan=?, nomor_sp=?, kota_tujuan=?, tanggal_mulai=?, tanggal_selesai=?, pelaksana_kegiatan=?, updated_at=CURRENT_TIMESTAMP WHERE id=?'
  ).run(nama_kegiatan, nomor_sp, kota_tujuan, tanggal_mulai, tanggal_selesai, pelaksana_kegiatan, req.params.id);

  const updated = db.prepare('SELECT * FROM perjadin WHERE id = ?').get(req.params.id);
  res.json(updated);
});

// DELETE /api/perjadin/:id
router.delete('/:id', (req, res) => {
  const existing = db.prepare('SELECT id FROM perjadin WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Data tidak ditemukan' });

  db.prepare('DELETE FROM perjadin WHERE id = ?').run(req.params.id);
  res.json({ message: 'Data berhasil dihapus' });
});

module.exports = router;
