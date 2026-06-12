const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

const dbDir = path.join(__dirname, 'db');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(path.join(dbDir, 'database.sqlite'));

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

function initializeDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS rapat (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nama_kegiatan TEXT NOT NULL,
      pelaksana_kegiatan TEXT NOT NULL,
      tanggal_diajukan DATE NOT NULL,
      nominal REAL NOT NULL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS karangan_bunga (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      text_ucapan TEXT NOT NULL,
      pengirim TEXT NOT NULL,
      tanggal_diajukan DATE NOT NULL,
      nominal REAL NOT NULL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS keperluan_pendukung (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nama_kegiatan TEXT NOT NULL,
      pelaksana_kegiatan TEXT NOT NULL,
      tanggal_diajukan DATE NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS perjadin (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nama_kegiatan TEXT NOT NULL,
      nomor_sp TEXT NOT NULL,
      kota_tujuan TEXT NOT NULL,
      tanggal_mulai DATE NOT NULL,
      tanggal_selesai DATE NOT NULL,
      pelaksana_kegiatan TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Seed default admin user
  const existingAdmin = db.prepare('SELECT id FROM users WHERE username = ?').get('admin');
  if (!existingAdmin) {
    const hashedPassword = bcrypt.hashSync('admin123', 10);
    db.prepare('INSERT INTO users (username, password) VALUES (?, ?)').run('admin', hashedPassword);
    console.log('Default admin user created: admin / admin123');
  }

  console.log('Database initialized successfully');
}

initializeDatabase();

module.exports = db;
