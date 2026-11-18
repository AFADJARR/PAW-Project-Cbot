// controllers/adminController.js
// Sisi pemilik toko: dashboard, kelola produk (F-01), kelola pesanan (F-05), rekap (F-06).
const produkModel = require("../models/produkModel");
const pesananModel = require("../models/pesananModel");
const AppError = require("../utils/AppError");
const { validasiProduk, JENIS, tanggal, teks } = require("../utils/validators");

// ---------- Dashboard ----------
async function dashboard(req, res, next) {
  try {
    const [rekap, terbaru, produk] = await Promise.all([
      pesananModel.rekap({}),
      pesananModel.list({}, 5),
      produkModel.hitung(),
    ]);
    res.render("admin/dashboard", {
      judul: "Dashboard Admin",
      rekap,
      terbaru,
      produk,
    });
  } catch (err) {
    next(err);
  }
}

// ---------- Produk ----------
async function produkIndex(req, res, next) {
  try {
    res.render("admin/produk", {
      judul: "Kelola Produk",
      produk: await produkModel.getAll(),
    });
  } catch (err) {
    next(err);
  }
}

function produkBaru(req, res) {
  res.render("admin/produk-form", {
    judul: "Tambah Produk",
    produkId: null,
    values: { jenisKendaraan: "Mobil", tersedia: true },
    errors: {},
    JENIS,
  });
}

async function produkEdit(req, res, next) {
  try {
    const produk = await produkModel.getById(Number(req.params.id));
    if (!produk)
      throw new AppError("Produk tidak ditemukan.", 404, "NOT_FOUND");
    res.render("admin/produk-form", {
      judul: "Ubah Produk",
      produkId: produk.id,
      values: produk,
      errors: {},
      JENIS,
    });
  } catch (err) {
    next(err);
  }
}

// POST /admin/produk  dan  POST /admin/produk/:id
async function produkSimpan(req, res, next) {
  const id = req.params.id ? Number(req.params.id) : null;
  try {
    const { errors, values, data } = validasiProduk(req.body);
    const tampilkanForm = (kode, err) =>
      res.status(kode).render("admin/produk-form", {
        judul: id ? "Ubah Produk" : "Tambah Produk",
        produkId: id,
        values,
        errors: err,
        JENIS,
      });

    if (Object.keys(errors).length) return tampilkanForm(422, errors);

    try {
      if (id) {
        const berubah = await produkModel.update(id, data);
        if (!berubah && !(await produkModel.getById(id)))
          throw new AppError("Produk tidak ditemukan.", 404, "NOT_FOUND");
        req.flash("success", "Produk berhasil diperbarui.");
      } else {
        await produkModel.create(data);
        req.flash("success", "Produk berhasil ditambahkan.");
      }
    } catch (err) {
      if (err.code === "ER_DUP_ENTRY")
        return tampilkanForm(422, {
          varian: "Kombinasi jenis, bahan, dan varian ini sudah ada.",
        });
      throw err;
    }
    res.redirect("/admin/produk");
  } catch (err) {
    next(err);
  }
}

// POST /admin/produk/:id/toggle  -> ubah Tersedia/Habis
async function produkToggle(req, res, next) {
  try {
    const produk = await produkModel.getById(Number(req.params.id));
    if (!produk)
      throw new AppError("Produk tidak ditemukan.", 404, "NOT_FOUND");
    await produkModel.setTersedia(produk.id, !produk.tersedia);
    req.flash(
      "success",
      `Status "${produk.bahan} ${produk.varian}" diubah menjadi ${produk.tersedia ? "Habis" : "Tersedia"}.`,
    );
    res.redirect("/admin/produk");
  } catch (err) {
    next(err);
  }
}

// ---------- Pesanan ----------
function bacaFilter(query) {
  const status = pesananModel.STATUS.includes(query.status) ? query.status : "";
  const dari = tanggal(query.dari) || "";
  const sampai = tanggal(query.sampai) || "";
  const q = teks(query.q)
    .toUpperCase()
    .replace(/[^A-Z0-9-]/g, "")
    .slice(0, 12);
  return { status, dari, sampai, q };
}

async function pesananIndex(req, res, next) {
  try {
    const filter = bacaFilter(req.query);
    res.render("admin/pesanan", {
      judul: "Kelola Pesanan",
      pesanan: await pesananModel.list(filter),
      filter,
      STATUS: pesananModel.STATUS,
      kembali: req.originalUrl,
    });
  } catch (err) {
    next(err);
  }
}

// POST /admin/pesanan/:id/status
async function pesananStatus(req, res, next) {
  try {
    const status = teks((req.body || {}).status);
    if (!pesananModel.STATUS.includes(status))
      throw new AppError("Status tidak valid.", 400, "INVALID_STATUS");

    const berubah = await pesananModel.updateStatus(
      Number(req.params.id),
      status,
    );
    if (!berubah)
      throw new AppError("Pesanan tidak ditemukan.", 404, "NOT_FOUND");

    req.flash("success", `Status pesanan diubah menjadi "${status}".`);
    // hanya izinkan redirect ke halaman admin (mencegah open redirect)
    const next_ = (req.body || {}).kembali;
    res.redirect(
      typeof next_ === "string" && /^\/admin\/[a-z]/.test(next_)
        ? next_
        : "/admin/pesanan",
    );
  } catch (err) {
    next(err);
  }
}

// ---------- Rekap ----------
async function rekap(req, res, next) {
  try {
    const filter = bacaFilter(req.query);
    const [ringkasan, daftar] = await Promise.all([
      pesananModel.rekap(filter),
      pesananModel.list(filter),
    ]);
    res.render("admin/rekap", {
      judul: "Rekap Pesanan",
      filter,
      ringkasan,
      pesanan: daftar,
      STATUS: pesananModel.STATUS,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  dashboard,
  produkIndex,
  produkBaru,
  produkEdit,
  produkSimpan,
  produkToggle,
  pesananIndex,
  pesananStatus,
  rekap,
};
