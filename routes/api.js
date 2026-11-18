// routes/api.js
const express = require("express");
const apiController = require("../controllers/apiController");
const pesananController = require("../controllers/pesananController");

const router = express.Router();

router.get("/status", apiController.status);
router.get("/produk", apiController.produk);
router.get("/pesanan/:kode", pesananController.apiStatus); // status pesanan (tanpa data pribadi)
router.use("/chat", require("./chat")); // POST /api/chat

module.exports = router;
