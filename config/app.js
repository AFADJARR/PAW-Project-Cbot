// config/app.js
// Konfigurasi umum aplikasi (session, batas permintaan). Nilai bisa diubah lewat .env.
const num = (nilai, bawaan) => (Number(nilai) > 0 ? Number(nilai) : bawaan);

module.exports = {
  appName: "Cbot Plat",
  isProd: process.env.NODE_ENV === "production",
  sessionSecret:
    process.env.SESSION_SECRET || "ganti-secret-ini-lewat-file-env",
  sessionMaxAgeMs: 2 * 60 * 60 * 1000, // sesi admin berlaku 2 jam

  // Pembatas permintaan per IP (melindungi login, form pesanan, dan kuota Gemini)
  rate: {
    login: {
      max: num(process.env.RATE_LOGIN_MAX, 5),
      windowMs: 15 * 60 * 1000,
    },
    pesan: {
      max: num(process.env.RATE_PESAN_MAX, 10),
      windowMs: 10 * 60 * 1000,
    },
    chat: { max: num(process.env.RATE_CHAT_MAX, 20), windowMs: 60 * 1000 },
  },
};
