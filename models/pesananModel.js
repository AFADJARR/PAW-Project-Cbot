// models/pesananModel.js
// Model pesanan (tabel `pesanan`, digabung dengan `produk` untuk nama bahan/varian).
const crypto = require("crypto");
const pool = require("../config/db");

// Alur pesanan: Diterima -> Diproses (plat dicetak) -> Siap Diambil (plat jadi, menunggu pelanggan) -> Sudah Diambil
const STATUS = ["Diterima", "Diproses", "Siap Diambil", "Sudah Diambil"];
// Pembayaran dicatat terpisah dari status pesanan
const METODE = ["Tunai", "QRIS/Transfer"];
// Belum Dibayar -> (pelanggan unggah bukti) Menunggu Verifikasi -> (admin setujui) Sudah Dibayar
const BAYAR = ["Belum Dibayar", "Menunggu Verifikasi", "Sudah Dibayar"];

// Kode pesanan acak, tanpa huruf/angka yang mirip (I, O, 0, 1) agar mudah dibaca.
const ALFABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
function buatKode() {
  let s = "";
  for (let i = 0; i < 6; i++) s += ALFABET[crypto.randomInt(ALFABET.length)];
  return "PLT-" + s;
}

const SELECT = `SELECT p.id, p.kode, p.nama, p.no_hp AS noHp, p.teks_plat AS teksPlat, p.warna, p.jumlah,
  p.harga_satuan AS hargaSatuan, p.total, p.metode_bayar AS metodeBayar, p.status_bayar AS statusBayar, p.bukti_bayar AS buktiBayar,
  p.status, p.created_at AS createdAt,
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
  if (f.bayar && BAYAR.includes(f.bayar)) {
    w.push("p.status_bayar = ?");
    params.push(f.bayar);
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
async function create({
  nama,
  noHp,
  teksPlat,
  warna,
  jumlah,
  metodeBayar,
  produk,
}) {
  const total = produk.harga * jumlah;
  for (let percobaan = 0; ; percobaan++) {
    const kode = buatKode();
    try {
      await pool.query(
        `INSERT INTO pesanan (kode, nama, no_hp, teks_plat, warna, jumlah, produk_id, harga_satuan, total, metode_bayar, status_bayar, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
          metodeBayar,
          BAYAR[0],
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

// Dipakai admin: hanya Belum Dibayar (tolak/batalkan, bukti dihapus) atau Sudah Dibayar (setujui/lunas).
async function updateBayar(id, statusBayar) {
  if (statusBayar === "Belum Dibayar") {
    const [h] = await pool.query(
      "UPDATE pesanan SET status_bayar = ?, bukti_bayar = NULL WHERE id = ?",
      [statusBayar, id],
    );
    return h.affectedRows;
  }
  if (statusBayar === "Sudah Dibayar") {
    const [h] = await pool.query(
      "UPDATE pesanan SET status_bayar = ? WHERE id = ?",
      [statusBayar, id],
    );
    return h.affectedRows;
  }
  return 0;
}

// Dipakai pelanggan: simpan bukti (hanya metode QRIS/Transfer dan belum lunas).
async function setBukti(id, namaFile) {
  const [h] = await pool.query(
    "UPDATE pesanan SET bukti_bayar = ?, status_bayar = 'Menunggu Verifikasi' " +
      "WHERE id = ? AND metode_bayar = 'QRIS/Transfer' AND status_bayar <> 'Sudah Dibayar'",
    [namaFile, id],
  );
  return h.affectedRows;
}

async function hitungBayar(statusBayar) {
  const [rows] = await pool.query(
    "SELECT COUNT(*) AS n FROM pesanan WHERE status_bayar = ?",
    [statusBayar],
  );
  return Number(rows[0].n);
}

async function findById(id) {
  const [rows] = await pool.query(SELECT + " WHERE p.id = ? LIMIT 1", [id]);
  return rows[0] ? rapikan(rows[0]) : null;
}

// Rekap: jumlah & nilai per status untuk filter tertentu
async function rekap(filter) {
  const { where, params } = susunWhere(filter);
  const [rows] = await pool.query(
    "SELECT p.status AS status, COUNT(*) AS jumlah, COALESCE(SUM(p.total), 0) AS nilai, " +
      "COALESCE(SUM(CASE WHEN p.status_bayar = 'Sudah Dibayar' THEN p.total ELSE 0 END), 0) AS terbayar FROM pesanan p" +
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
      terbayar: r ? Number(r.terbayar) : 0,
    };
  });
  const nilai = perStatus.reduce((a, r) => a + r.nilai, 0);
  const terbayar = perStatus.reduce((a, r) => a + r.terbayar, 0);
  return {
    perStatus,
    jumlah: perStatus.reduce((a, r) => a + r.jumlah, 0),
    nilai,
    terbayar,
    belumDibayar: nilai - terbayar,
  };
}

module.exports = {
  STATUS,
  METODE,
  BAYAR,
  create,
  findByKode,
  findById,
  list,
  updateStatus,
  updateBayar,
  setBukti,
  hitungBayar,
  rekap,
};
