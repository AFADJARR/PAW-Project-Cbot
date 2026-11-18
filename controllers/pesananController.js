// controllers/pesananController.js
// Sisi pelanggan: form pesanan (F-03) dan cek status (F-04).
const produkModel = require("../models/produkModel");
const pesananModel = require("../models/pesananModel");
const {
  validasiPesanan,
  kodePesanan,
  WARNA,
  teks,
} = require("../utils/validators");

// GET /pesan
async function form(req, res, next) {
  try {
    res.render("pesan", {
      judul: "Pesan Plat",
      produk: await produkModel.getTersedia(),
      warna: WARNA,
      values: { jumlah: 1 },
      errors: {},
    });
  } catch (err) {
    next(err);
  }
}

// POST /pesan
async function simpan(req, res, next) {
  try {
    const produk = await produkModel.getTersedia();
    const { errors, values, data, pilihan } = validasiPesanan(req.body, produk);

    if (Object.keys(errors).length) {
      return res.status(422).render("pesan", {
        judul: "Pesan Plat",
        produk,
        warna: WARNA,
        values,
        errors,
      });
    }

    const kode = await pesananModel.create({ ...data, produk: pilihan });
    req.flash(
      "success",
      "Pesanan berhasil dibuat. Simpan kode pesanan Anda untuk mengecek status.",
    );
    res.redirect("/status?kode=" + kode);
  } catch (err) {
    next(err);
  }
}

// Data pesanan yang boleh dilihat publik (tanpa nama dan nomor HP pelanggan).
function dataPublik(p) {
  return {
    kode: p.kode,
    status: p.status,
    jenisKendaraan: p.jenisKendaraan,
    bahan: p.bahan,
    varian: p.varian,
    warna: p.warna,
    teksPlat: p.teksPlat,
    jumlah: p.jumlah,
    total: p.total,
    createdAt: p.createdAt,
  };
}

// GET /status?kode=PLT-XXXXXX
async function status(req, res, next) {
  try {
    const mentah = teks(req.query.kode);
    if (!mentah) {
      return res.render("status", {
        judul: "Cek Status",
        kode: "",
        pesanan: null,
        notFound: false,
        STATUS: pesananModel.STATUS,
      });
    }
    const kode = kodePesanan(mentah);
    const pesanan = kode ? await pesananModel.findByKode(kode) : null;
    res.status(pesanan ? 200 : 404).render("status", {
      judul: "Cek Status",
      kode: mentah.slice(0, 20),
      pesanan: pesanan ? dataPublik(pesanan) : null,
      notFound: !pesanan,
      STATUS: pesananModel.STATUS,
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/pesanan/:kode
async function apiStatus(req, res, next) {
  try {
    const kode = kodePesanan(req.params.kode);
    const pesanan = kode ? await pesananModel.findByKode(kode) : null;
    if (!pesanan) {
      return res
        .status(404)
        .json({
          success: false,
          error: { message: "Kode pesanan tidak ditemukan." },
        });
    }
    res.json({ success: true, data: dataPublik(pesanan) });
  } catch (err) {
    next(err);
  }
}

module.exports = { form, simpan, status, apiStatus };
