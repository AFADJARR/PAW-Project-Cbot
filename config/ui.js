// config/ui.js
// Kumpulan class Tailwind yang dipakai berulang di banyak view (tersedia sebagai variabel `ui` di EJS).
module.exports = {
  card: "bg-white rounded-2xl shadow-sm border border-slate-200",
  input:
    "w-full rounded-xl border border-slate-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-900",
  label: "block text-sm font-medium mb-1",
  error: "text-xs text-red-600 mt-1",
  btn: "inline-flex items-center justify-center px-4 py-2 rounded-xl bg-slate-900 text-white text-sm font-medium hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed",
  btnGhost:
    "inline-flex items-center justify-center px-4 py-2 rounded-xl border border-slate-300 text-sm font-medium hover:border-slate-900",
  btnSm:
    "inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium border border-slate-300 hover:border-slate-900 bg-white",
  th: "text-left text-xs font-semibold uppercase tracking-wide text-slate-500 px-3 py-2 whitespace-nowrap",
  td: "px-3 py-2 text-sm align-top",
  status: {
    Diterima: "bg-blue-100 text-blue-800",
    Diproses: "bg-amber-100 text-amber-800",
    Selesai: "bg-green-100 text-green-800",
    "Siap Diambil": "bg-emerald-100 text-emerald-800",
  },
};
                                                                                            