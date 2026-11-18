// controllers/authController.js
// Login/logout admin (F-05).
const bcrypt = require("bcryptjs");
const adminModel = require("../models/adminModel");
const { teks } = require("../utils/validators");

// Hash palsu: dipakai agar waktu respons sama baik username ada maupun tidak
// (supaya penyerang tidak bisa menebak username yang valid dari kecepatan respons).
const HASH_PALSU = bcrypt.hashSync("bukan-kata-sandi-sungguhan", 10);

// GET /admin/login
function showLogin(req, res) {
  if (req.session.admin) return res.redirect("/admin");
  res.render("admin/login", {
    judul: "Login Admin",
    error: null,
    username: "",
  });
}

// POST /admin/login
async function login(req, res, next) {
  try {
    const username = teks((req.body || {}).username).slice(0, 50);
    const password =
      typeof (req.body || {}).password === "string" ? req.body.password : "";

    const admin = username ? await adminModel.findByUsername(username) : null;
    const cocok = await bcrypt.compare(
      password.slice(0, 72),
      admin ? admin.passwordHash : HASH_PALSU,
    );

    if (!admin || !cocok) {
      return res
        .status(401)
        .render("admin/login", {
          judul: "Login Admin",
          error: "Username atau kata sandi salah.",
          username,
        });
    }

    // Buat session baru setelah login (mencegah session fixation)
    req.session.regenerate((err) => {
      if (err) return next(err);
      req.session.admin = { id: admin.id, username: admin.username };
      req.session.save((err2) => {
        if (err2) return next(err2);
        res.redirect("/admin");
      });
    });
  } catch (err) {
    next(err);
  }
}

// POST /admin/logout
function logout(req, res, next) {
  req.session.destroy((err) => {
    if (err) return next(err);
    res.clearCookie("cbot.sid");
    res.redirect("/admin/login");
  });
}

module.exports = { showLogin, login, logout };
