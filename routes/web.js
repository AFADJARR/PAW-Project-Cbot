// routes/web.js  (halaman pelanggan)
const express = require("express");
const rateLimit = require("../middlewares/rateLimit");
const config = require("../config/app");
const homeController = require("../controllers/homeController");
const pesananController = require("../controllers/pesananController");
const uploadBukti = require("../middlewares/uploadBukti");

const router = express.Router();

const batasPesan = rateLimit({
  ...config.rate.pesan,
  message:
    "Terlalu banyak pesanan dari perangkat ini. Coba lagi beberapa menit lagi.",
});

router.get("/", homeController.index);
router.get("/pesan", pesananController.form);
router.post("/pesan", batasPesan, pesananController.simpan);
router.get("/status", pesananController.status);
router.post(
  "/status/bukti",
  batasPesan,
  uploadBukti,
  pesananController.uploadBukti,
);

module.exports = router;
