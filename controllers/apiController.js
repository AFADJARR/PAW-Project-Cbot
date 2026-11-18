// controllers/apiController.js
const produkModel = require("../models/produkModel");

// GET /api/status
function status(req, res) {
  res.json({
    status: "ok",
    aplikasi: "Cbot Plat",
    waktu: new Date().toISOString(),
    uptimeDetik: Math.round(process.uptime()),
    aiTerkonfigurasi: Boolean(process.env.GEMINI_API_KEY), // hanya true/false, key tidak ditampilkan
  });
}

// GET /api/produk  (opsional ?jenis=Mobil|Motor)
async function produk(req, res, next) {
  try {
    res.json(await produkModel.getAll(req.query.jenis));
  } catch (err) {
    next(err);
  }
}

module.exports = { status, produk };
