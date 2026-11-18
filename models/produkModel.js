// models/produkModel.js
// Model produk (tabel `produk`). Sesuaikan nama tabel/kolom bila database Anda berbeda.
const pool = require("../config/db");

const KOLOM =
  "id, jenis_kendaraan AS jenisKendaraan, bahan, varian, harga, tersedia";

function rapikan(row) {
  return { ...row, harga: Number(row.harga), tersedia: Boolean(row.tersedia) };
}

// Semua produk, opsional difilter jenis kendaraan (Mobil/Motor).
async function getAll(jenis) {
  const [rows] = jenis
    ? await pool.query(
        `SELECT ${KOLOM} FROM produk WHERE jenis_kendaraan = ? ORDER BY id`,
        [jenis],
      )
    : await pool.query(`SELECT ${KOLOM} FROM produk ORDER BY id`);
  return rows.map(rapikan);
}

// Hanya produk yang tersedia (halaman pelanggan).
async function getTersedia(jenis) {
  const semua = await getAll(jenis);
  return semua.filter((p) => p.tersedia);
}

async function getById(id) {
  const [rows] = await pool.query(
    `SELECT ${KOLOM} FROM produk WHERE id = ? LIMIT 1`,
    [id],
  );
  return rows[0] ? rapikan(rows[0]) : null;
}

async function create(d) {
  const [hasil] = await pool.query(
    "INSERT INTO produk (jenis_kendaraan, bahan, varian, harga, tersedia) VALUES (?, ?, ?, ?, ?)",
    [d.jenisKendaraan, d.bahan, d.varian, d.harga, d.tersedia ? 1 : 0],
  );
  return hasil.insertId;
}

async function update(id, d) {
  const [hasil] = await pool.query(
    "UPDATE produk SET jenis_kendaraan = ?, bahan = ?, varian = ?, harga = ?, tersedia = ? WHERE id = ?",
    [d.jenisKendaraan, d.bahan, d.varian, d.harga, d.tersedia ? 1 : 0, id],
  );
  return hasil.affectedRows;
}

async function setTersedia(id, tersedia) {
  const [hasil] = await pool.query(
    "UPDATE produk SET tersedia = ? WHERE id = ?",
    [tersedia ? 1 : 0, id],
  );
  return hasil.affectedRows;
}

// Ringkasan untuk dashboard admin
async function hitung() {
  const [rows] = await pool.query(
    "SELECT COUNT(*) AS total, COALESCE(SUM(tersedia), 0) AS tersedia FROM produk",
  );
  return { total: Number(rows[0].total), tersedia: Number(rows[0].tersedia) };
}

module.exports = {
  getAll,
  getTersedia,
  getById,
  create,
  update,
  setTersedia,
  hitung,
};
