// utils/bukti.js
// Penyimpanan bukti pembayaran. File disimpan di folder `uploads/bukti` (BUKAN di public),
// dengan nama acak, dan hanya bisa dilihat admin lewat rute yang dilindungi login.
const fs = require("fs/promises");
const path = require("path");
const crypto = require("crypto");

const DIR = path.join(__dirname, "..", "uploads", "bukti");
const MAX_BYTES = 2 * 1024 * 1024; // 2 MB
const NAMA_VALID = /^[a-f0-9]{32}\.(jpg|png|webp)$/;
const MIME = { jpg: "image/jpeg", png: "image/png", webp: "image/webp" };

// Tentukan jenis gambar dari isi file (bukan dari nama/Content-Type kiriman user, karena bisa dipalsukan).
function deteksiTipe(buf) {
  if (!Buffer.isBuffer(buf) || buf.length < 12) return null;
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "jpg";
  if (
    buf
      .subarray(0, 8)
      .equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
  )
    return "png";
  if (
    buf.subarray(0, 4).toString("latin1") === "RIFF" &&
    buf.subarray(8, 12).toString("latin1") === "WEBP"
  )
    return "webp";
  return null;
}

async function simpan(buf, ext) {
  await fs.mkdir(DIR, { recursive: true });
  const nama = crypto.randomBytes(16).toString("hex") + "." + ext;
  await fs.writeFile(path.join(DIR, nama), buf, { flag: "wx" });
  return nama;
}

async function hapus(nama) {
  if (!NAMA_VALID.test(nama || "")) return;
  try {
    await fs.unlink(path.join(DIR, nama));
  } catch {
    /* file sudah tidak ada: abaikan */
  }
}

// Path absolut file bukti, atau null bila nama tidak valid (mencegah path traversal).
function lokasi(nama) {
  return NAMA_VALID.test(nama || "") ? path.join(DIR, nama) : null;
}

function mimeDari(nama) {
  return MIME[(nama || "").split(".").pop()] || "application/octet-stream";
}

module.exports = { MAX_BYTES, deteksiTipe, simpan, hapus, lokasi, mimeDari };
