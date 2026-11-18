// utils/validators.js
// Validasi dan normalisasi input form (dipakai di backend, JANGAN hanya mengandalkan validasi browser).

const WARNA = ["Hitam", "Putih", "Merah", "Biru", "Kuning"];
const JENIS = ["Mobil", "Motor"];
const METODE_BAYAR = ["Tunai", "QRIS/Transfer"];

// Buang karakter kontrol, rapikan spasi. Bukan string -> ''.
function teks(v) {
  return typeof v === "string"
    ? v
        .replace(/[\u0000-\u001F\u007F]/g, " ")
        .replace(/\s+/g, " ")
        .trim()
    : "";
}

function normalisasiHp(v) {
  const s = teks(v).replace(/[\s.-]/g, "");
  if (s.startsWith("+62")) return "0" + s.slice(3);
  if (s.startsWith("62")) return "0" + s.slice(2);
  return s;
}

// Validasi form pesanan pelanggan (US-02). produkTersedia = daftar produk berstatus tersedia dari database.
function validasiPesanan(body, produkTersedia) {
  const b = body || {};
  const errors = {};

  const nama = teks(b.nama);
  if (!nama) errors.nama = "Nama wajib diisi.";
  else if (!/^\p{L}[\p{L} .'-]{1,59}$/u.test(nama))
    errors.nama =
      "Nama 2-60 karakter, hanya huruf, spasi, titik, apostrof, atau tanda hubung.";

  const noHp = normalisasiHp(b.noHp);
  if (!noHp) errors.noHp = "Nomor HP wajib diisi.";
  else if (!/^08\d{8,11}$/.test(noHp))
    errors.noHp = "Nomor HP tidak valid. Contoh: 081234567890.";

  const teksPlat = teks(b.teksPlat).toUpperCase();
  const tanpaSpasi = teksPlat.replace(/ /g, "");
  if (!tanpaSpasi) errors.teksPlat = "Teks plat wajib diisi.";
  else if (!/^[A-Z0-9 ]+$/.test(teksPlat))
    errors.teksPlat = "Teks plat hanya boleh huruf dan angka (tanpa simbol).";
  else if (tanpaSpasi.length > 9)
    errors.teksPlat = "Teks plat maksimal 9 karakter (tanpa spasi).";

  const jumlah = Number(b.jumlah);
  if (!Number.isInteger(jumlah) || jumlah < 1 || jumlah > 10)
    errors.jumlah = "Jumlah harus bilangan bulat 1 sampai 10.";

  const produkId = Number(b.produkId);
  const pilihan = produkTersedia.find((p) => p.id === produkId);
  if (!pilihan) errors.produkId = "Pilih varian plat yang tersedia.";

  const metodeBayar = teks(b.metodeBayar);
  if (!METODE_BAYAR.includes(metodeBayar))
    errors.metodeBayar = "Pilih metode pembayaran.";

  // Varian "Standar" selalu hitam; hanya varian "Custom" yang boleh memilih warna.
  let warna = teks(b.warna);
  if (pilihan && !/custom/i.test(pilihan.varian)) warna = "Hitam";
  else if (!WARNA.includes(warna)) errors.warna = "Pilih warna plat.";

  return {
    errors,
    pilihan,
    values: {
      nama,
      noHp,
      teksPlat,
      warna,
      jumlah: b.jumlah,
      produkId: b.produkId,
      metodeBayar,
    },
    data: { nama, noHp, teksPlat, warna, jumlah, metodeBayar },
  };
}

// Validasi form produk admin (US-05).
function validasiProduk(body) {
  const b = body || {};
  const errors = {};

  const jenisKendaraan = teks(b.jenisKendaraan);
  if (!JENIS.includes(jenisKendaraan))
    errors.jenisKendaraan = "Pilih Mobil atau Motor.";

  const bahan = teks(b.bahan);
  if (!/^[\p{L}\p{N} ./-]{2,50}$/u.test(bahan))
    errors.bahan = "Bahan 2-50 karakter (huruf/angka).";

  const varian = teks(b.varian);
  if (!/^[\p{L}\p{N} ./-]{2,80}$/u.test(varian))
    errors.varian = "Varian 2-80 karakter (huruf/angka).";

  const harga = Number(b.harga);
  if (!Number.isInteger(harga) || harga < 1000 || harga > 10000000)
    errors.harga = "Harga harus bilangan bulat antara 1.000 dan 10.000.000.";

  const tersedia = b.tersedia === "1" || b.tersedia === "on";

  return {
    errors,
    values: { jenisKendaraan, bahan, varian, harga: b.harga, tersedia },
    data: { jenisKendaraan, bahan, varian, harga, tersedia },
  };
}

// Tanggal "YYYY-MM-DD" yang valid, selain itu null.
function tanggal(v) {
  const s = teks(v);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return null;
  const d = new Date(s + "T00:00:00Z");
  return Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== s
    ? null
    : s;
}

// Kode pesanan "PLT-XXXXXX" yang valid, selain itu null.
function kodePesanan(v) {
  const s = teks(v).toUpperCase();
  return /^PLT-[A-Z2-9]{6}$/.test(s) ? s : null;
}

module.exports = {
  WARNA,
  JENIS,
  METODE_BAYAR,
  teks,
  validasiPesanan,
  validasiProduk,
  tanggal,
  kodePesanan,
};
