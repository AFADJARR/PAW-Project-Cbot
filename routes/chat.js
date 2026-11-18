// routes/chat.js  (dipasang di /api/chat oleh routes/api.js)
const express = require("express");
const rateLimit = require("../middlewares/rateLimit");
const validateChatInput = require("../middlewares/validateChatInput");
const chatController = require("../controllers/chatController");
const config = require("../config/app");

const router = express.Router();

// Batasi jumlah pertanyaan per IP supaya kuota Gemini tidak habis
const batasChat = rateLimit({
  ...config.rate.chat,
  message:
    "Terlalu banyak pertanyaan dalam waktu singkat. Tunggu sebentar lalu coba lagi.",
});

router.post("/", batasChat, validateChatInput, chatController.chat);

module.exports = router;
