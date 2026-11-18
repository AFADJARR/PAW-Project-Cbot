// services/gemini.service.js
const { ai, MODEL_NAME } = require("../config/gemini");
const Produk = require("../models/produkModel");

async function generateChatResponse(userMessage) {
  try {
    // 1. Ambil data produk dari database Sequelize
    const listProduk = await Produk.findAll();
    const produkContext =
      listProduk.length > 0
        ? listProduk
            .map(
              (p) =>
                `- ${p.name} (Kategori: ${p.category}): Rp ${Number(p.price).toLocaleString("id-ID")}`,
            )
            .join("\n")
        : "Belum ada produk plat nomor yang terdaftar di database.";

    // 2. Susun System Instruction & Guardrail
    const systemInstruction = `
Kamu adalah AI Assistant resmi untuk "Cbot Plat", sebuah aplikasi manajemen dan katalog varian plat kendaraan.
Tugasmu adalah membantu pengguna memahami informasi produk, harga, dan layanan yang tersedia di aplikasi ini.

SUMBER DATA / CONTEXT APLIKASI SAAT INI:
${produkContext}

ATURAN KETAT (GUARDRAIL):
1. Jawablah HANYA berdasarkan daftar produk atau informasi yang tersedia di atas.
2. Jika pengguna bertanya di luar konteks aplikasi (seperti membuat kode game, memasak, politik, dll.), tolaklah secara sopan dan arahkan kembali pengguna ke topik produk plat kendaraan di aplikasi ini.
3. Jangan pernah mengarang atau menebak harga/produk yang tidak ada dalam daftar context di atas.
    `.trim();

    // 3. Kirim permintaan ke Gemini API menggunakan konfigurasi yang terpusat
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: [{ role: "user", parts: [{ text: userMessage }] }],
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.3,
      },
    });

    return response.text;
  } catch (error) {
    console.error("Error Detail Gemini Service:", error);
    throw new Error("Gagal terhubung ke layanan AI Assistant.");
  }
}

module.exports = {
  generateChatResponse,
};
