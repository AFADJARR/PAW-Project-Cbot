// models/pesananModel.js
// Model pesanan (tabel `pesanan`, digabung dengan `produk` untuk nama bahan/varian).
const crypto = require("crypto");
const pool = require("../config/db");

const STATUS = ["Diterima", "Diproses", "Selesai", "Siap Diambil"];

// Kode pesanan acak, tanpa huruf/angka yang mirip (I, O, 0, 1) agar mudah dibaca.
const ALFABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
function buatKode() {
  let s = "";
  for (let i = 0; i < 6; i++) s += ALFABET[crypto.randomInt(ALFABET.length)];
  return "PLT-" + s;
}

const SELECT = `SELECT p.id, p.kode, p.nama, p.no_hp AS noHp, p.teks_plat AS teksPlat, p.warna, p.jumlah,
  p.harga_satuan AS hargaSatuan, p.total, p.status, p.created_at AS createdAt,
  pr.jenis_kendaraan AS jenisKendaraan, pr.bahan, pr.varian
  FROM pesanan p JOIN produk pr ON pr.id = p.produk_id`;

function rapikan(r) {
  return {
    ...r,
    jumlah: Number(r.jumlah),
    hargaSatuan: Number(r.hargaSatuan),
    total: Number(r.total),
  };
}

function hariBerikutnya(tgl) {
  const d = new Date(tgl + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}

// Susun WHERE dari filter (semua nilai lewat parameter `?`, tidak ada string user di dalam SQL).
function susunWhere(f = {}) {
  const w = [];
  const params = [];
  if (f.status && STATUS.includes(f.status)) {
    w.push("p.status = ?");
    params.push(f.status);
  }
  if (f.dari) {
    w.push("p.created_at >= ?");
    params.push(f.dari + " 00:00:00");
  }
  if (f.sampai) {
    w.push("p.created_at < ?");
    params.push(hariBerikutnya(f.sampai) + " 00:00:00");
  }
  if (f.q) {
    w.push("p.kode LIKE ?");
    params.push(f.q + "%");
  }
  return { where: w.length ? " WHERE " + w.join(" AND ") : "", params };
}

// Simpan pesanan baru. Harga satuan dan total diambil dari database (bukan dari input pelanggan).
async function create({ nama, noHp, teksPlat, warna, jumlah, produk }) {
  const total = produk.harga * jumlah;
  for (let percobaan = 0; ; percobaan++) {
    const kode = buatKode();
    try {
      await pool.query(
        `INSERT INTO pesanan (kode, nama, no_hp, teks_plat, warna, jumlah, produk_id, harga_satuan, total, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          kode,
          nama,
          noHp,
          teksPlat,
          warna,
          jumlah,
          produk.id,
          produk.harga,
          total,
          STATUS[0],
        ],
      );
      return kode;
    } catch (err) {
      // kode kebetulan sudah ada -> buat kode lain
      if (err.code === "ER_DUP_ENTRY" && percobaan < 4) continue;
      throw err;
    }
  }
}

async function findByKode(kode) {
  const [rows] = await pool.query(SELECT + " WHERE p.kode = ? LIMIT 1", [kode]);
  return rows[0] ? rapikan(rows[0]) : null;
}

async function list(filter, batas = 200) {
  const { where, params } = susunWhere(filter);
  const [rows] = await pool.query(
    SELECT + where + " ORDER BY p.id DESC LIMIT ?",
    [...params, Number(batas)],
  );
  return rows.map(rapikan);
}

async function updateStatus(id, status) {
  if (!STATUS.includes(status)) return 0;
  const [hasil] = await pool.query(
    "UPDATE pesanan SET status = ? WHERE id = ?",
    [status, id],
  );
  return hasil.affectedRows;
}

// Rekap: jumlah & nilai per status untuk filter tertentu
async function rekap(filter) {
  const { where, params } = susunWhere(filter);
  const [rows] = await pool.query(
    "SELECT p.status AS status, COUNT(*) AS jumlah, COALESCE(SUM(p.total), 0) AS nilai FROM pesanan p" +
      where +
      " GROUP BY p.status",
    params,
  );
  const perStatus = STATUS.map((s) => {
    const r = rows.find((x) => x.status === s);
    return {
      status: s,
      jumlah: r ? Number(r.jumlah) : 0,
      nilai: r ? Number(r.nilai) : 0,
    };
  });
  return {
    perStatus,
    jumlah: perStatus.reduce((a, r) => a + r.jumlah, 0),
    nilai: perStatus.reduce((a, r) => a + r.nilai, 0),
  };
}

module.exports = { STATUS, create, findByKode, list, updateStatus, rekap };
