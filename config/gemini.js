// config/gemini.js
// Konfigurasi Gemini. API key HANYA dibaca dari environment variable (.env) di server.
// Nilai ini tidak pernah dikirim ke frontend.
module.exports = {
  apiKey: process.env.GEMINI_API_KEY || "",
  // Cek kode model yang tersedia untuk akun Anda di https://aistudio.google.com
  model: process.env.GEMINI_MODEL || "gemini-3.8-flash",

  // Batas panjang pesan pengguna (karakter), dipakai middleware validateChatInput
  maxMessageLength: Number(process.env.CHAT_MAX_LENGTH) || 300,

  // Pengaturan generasi jawaban
  temperature: 0.2, // rendah = jawaban lebih konsisten dan tidak "kreatif"
  maxOutputTokens: 2048, // longgar, karena model "thinking" memakai token ini juga
  timeoutMs: Number(process.env.GEMINI_TIMEOUT_MS) || 45000, // batas waktu menunggu Gemini (ms)
  maxRetry: 1, // ulangi sekali jika Gemini sedang sibuk (503)
};
