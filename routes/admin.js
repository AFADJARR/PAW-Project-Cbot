// routes/admin.js  (dipasang di /admin)
const express = require("express");
const rateLimit = require("../middlewares/rateLimit");
const { csrfToken, verifyCsrf } = require("../middlewares/csrf");
const requireAdmin = require("../middlewares/requireAdmin");
const config = require("../config/app");
const auth = require("../controllers/authController");
const admin = require("../controllers/adminController");

const router = express.Router();

const batasLogin = rateLimit({
  ...config.rate.login,
  message: "Terlalu banyak percobaan login. Coba lagi beberapa menit lagi.",
});

// Semua form admin dilindungi token CSRF
router.use(csrfToken);
router.use(verifyCsrf);

// Publik (belum login)
router.get("/login", auth.showLogin);
router.post("/login", batasLogin, auth.login);

// Mulai dari sini WAJIB login
router.use(requireAdmin);
router.post("/logout", auth.logout);

router.get("/", admin.dashboard);

router.get("/produk", admin.produkIndex);
router.get("/produk/baru", admin.produkBaru);
router.post("/produk", admin.produkSimpan);
router.get("/produk/:id/ubah", admin.produkEdit);
router.post("/produk/:id", admin.produkSimpan);
router.post("/produk/:id/toggle", admin.produkToggle);

router.get("/pesanan", admin.pesananIndex);
router.post("/pesanan/:id/status", admin.pesananStatus);
router.post("/pesanan/:id/bayar", admin.pesananBayar);
router.get("/pesanan/:id/bukti", admin.buktiFile);

router.get("/rekap", admin.rekap);

module.exports = router;
