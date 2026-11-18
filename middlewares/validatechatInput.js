// middlewares/validateChatInput.js
// Validasi input untuk POST /api/chat: harus string, tidak kosong, dan tidak terlalu panjang.
const gemini = require("../config/gemini");
const AppError = require("../utils/AppError");

function validateChatInput(req, res, next) {
  const message = req.body && req.body.message;

  if (typeof message !== "string") {
    return next(
      new AppError('Field "message" wajib berupa teks.', 400, "INVALID_INPUT"),
    );
  }

  // Buang karakter kontrol (kecuali baris baru) lalu rapikan spasi di tepi.
  const bersih = message
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .trim();

  if (bersih.length === 0) {
    return next(
      new AppError("Pesan tidak boleh kosong.", 400, "EMPTY_MESSAGE"),
    );
  }
  if (bersih.length > gemini.maxMessageLength) {
    return next(
      new AppError(
        `Pesan terlalu panjang. Maksimal ${gemini.maxMessageLength} karakter.`,
        400,
        "MESSAGE_TOO_LONG",
      ),
    );
  }

  req.chatMessage = bersih; // dipakai controller
  next();
}

module.exports = validateChatInput;
