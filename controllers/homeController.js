// controllers/homeController.js
const produkModel = require("../models/produkModel");
const { formatRupiah } = require("../utils/format");
const gemini = require("../config/gemini");

// GET /  -> halaman Beranda (pilih Mobil/Motor + AI Assistant)
async function index(req, res, next) {
  try {
    const jenis = ["Mobil", "Motor"].includes(req.query.jenis)
      ? req.query.jenis
      : null;
    res.render("index", {
      judul: "Cbot Plat",
      jenis,
      produk: jenis ? await produkModel.getTersedia(jenis) : [],
      formatRupiah,
      maxPesan: gemini.maxMessageLength,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { index };
