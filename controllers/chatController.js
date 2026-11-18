// controllers/chatController.js
// Tugas controller: menerima request, memanggil model/service, mengembalikan response.
const produkModel = require("../models/produkModel");
const geminiService = require("../services/geminiService");
const { checkMessage } = require("../utils/guardrail");
const AppError = require("../utils/AppError");

// POST /api/chat   body: { "message": "..." }
async function chat(req, res, next) {
  try {
    const message = req.chatMessage; // sudah divalidasi middleware validateChatInput

    // Lapisan pengaman backend sebelum menyentuh Gemini
    const cek = checkMessage(message);
    if (!cek.allowed) {
      console.warn(`[guardrail] pesan ditolak di backend (${cek.reason})`);
      return res.json({ success: true, data: { reply: cek.reply } });
    }

    // Context AI diambil dari database pada setiap permintaan (selalu terbaru)
    let produk;
    try {
      produk = await produkModel.getAll();
    } catch (err) {
      console.error("[db]", err.message);
      throw new AppError(
        "Data produk tidak dapat dimuat saat ini.",
        500,
        "DB_ERROR",
      );
    }

    const reply = await geminiService.generateReply(message, produk);
    res.json({ success: true, data: { reply } });
  } catch (err) {
    next(err);
  }
}

module.exports = { chat };
