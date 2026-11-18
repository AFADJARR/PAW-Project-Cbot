// utils/guardrail.js
// Lapisan pengaman di BACKEND, dijalankan sebelum pesan dikirim ke Gemini.
// System Instruction saja tidak cukup: pesan yang jelas-jelas mencoba prompt injection
// atau meminta hal di luar domain langsung ditolak di sini (hemat kuota, lebih aman).
// Ini lapisan tambahan, bukan pengganti System Instruction.

// Rapikan teks agar trik sederhana (spasi ganda, karakter tak terlihat, huruf "fullwidth") tidak lolos.
function normalisasi(teks) {
  return teks
    .normalize("NFKC")
    .replace(/[​-‍﻿]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

// Upaya mengubah peran / mengabaikan aturan / membocorkan instruksi (prompt injection).
const POLA_INJECTION = [
  /\b(abaikan|lupakan|hiraukan|kesampingkan|langgar)\b.{0,30}\b(instruksi|perintah|aturan|batasan|prompt)/i,
  /\b(ignore|disregard|forget|override|bypass)\b.{0,30}\b(instructions?|rules?|prompts?|restrictions?|guidelines?)/i,
  /\b(system|developer|sistem)\s*(prompt|instruction|message|instruksi|pesan)/i,
  /\b(tampilkan|tunjukkan|bocorkan|ungkapkan|sebutkan|tulis ulang|reveal|show|print|repeat)\b.{0,40}\b(prompt|instruksi (awal|sistem)|aturan (awal|sistem)|api ?key)/i,
  /\b(mulai sekarang|sekarang)\b.{0,15}\b(kamu|anda)\b.{0,15}\b(adalah|berperan|menjadi|jadi)\b/i,
  /\b(berpura-?pura|pura-?pura|bertindaklah sebagai|act as|pretend|role-?play|you are now)\b/i,
  /\b(jailbreak|dan mode|developer mode|mode developer|mode bebas)\b/i,
];

// Permintaan yang jelas di luar domain aplikasi (produk plat nomor).
const POLA_DI_LUAR_KONTEKS = [
  /\b(buat(kan|in)?|tulis(kan)?|bikin(kan|in)?|generate|write|create|coding)\b.{0,40}\b(kode|code|program|script|game|puisi|cerpen|cerita|lagu|esai|essay|resep|skripsi|makalah|html|python|javascript)\b/i,
  /\b(kerjakan|selesaikan|jawab(kan)?)\b.{0,30}\b(pr|tugas|soal|ujian|kuis)\b/i,
  /\b(terjemahkan|translate)\b/i,
];

const BALASAN = {
  injection:
    "Maaf, saya tidak dapat mengubah peran atau aturan saya. Saya hanya bisa membantu informasi produk plat nomor di Cbot Plat, seperti jenis kendaraan, bahan, varian, harga, dan ketersediaan.",
  off_topic:
    'Maaf, kemampuan saya terbatas pada informasi produk plat nomor di Cbot Plat (jenis kendaraan, bahan, varian, harga, dan ketersediaan). Silakan tanyakan hal tersebut, misalnya "Apa saja produk yang tersedia?"',
};

// Mengembalikan { allowed: true } atau { allowed: false, reason, reply }
function checkMessage(message) {
  const teks = normalisasi(message);

  if (POLA_INJECTION.some((p) => p.test(teks))) {
    return { allowed: false, reason: "injection", reply: BALASAN.injection };
  }
  if (POLA_DI_LUAR_KONTEKS.some((p) => p.test(teks))) {
    return { allowed: false, reason: "off_topic", reply: BALASAN.off_topic };
  }
  return { allowed: true };
}

module.exports = { checkMessage };
