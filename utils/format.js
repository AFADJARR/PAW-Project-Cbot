// utils/format.js
// 150000 -> "Rp150.000"
function formatRupiah(angka) {
  return "Rp" + Number(angka).toLocaleString("id-ID");
}

// Date (dari mysql2) atau teks "YYYY-MM-DD HH:MM:SS" -> "17 Nov 2026 18:42" (WIB)
function formatTanggal(nilai) {
  if (!nilai) return "-";
  const d =
    nilai instanceof Date
      ? nilai
      : new Date(String(nilai).replace(" ", "T") + "Z");
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Jakarta",
  });
}

module.exports = { formatRupiah, formatTanggal };
