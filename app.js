// app.js - entry point aplikasi Cbot Plat
require("dotenv").config({ quiet: true }); // harus paling atas agar .env terbaca oleh semua file

const path = require("path");
const express = require("express");
const session = require("express-session");

const config = require("./config/app");
const ui = require("./config/ui");
const { formatRupiah, formatTanggal } = require("./utils/format");
const logger = require("./middlewares/logger");
const securityHeaders = require("./middlewares/securityHeaders");
const flash = require("./middlewares/flash");
const { notFound, errorHandler } = require("./middlewares/errorHandler");
const routes = require("./routes");

const app = express();
const PORT = process.env.PORT || 3000;

app.disable("x-powered-by");
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Variabel yang tersedia di semua view EJS
app.locals.ui = ui;
app.locals.formatRupiah = formatRupiah;
app.locals.formatTanggal = formatTanggal;
app.locals.pembayaran = config.pembayaran;

app.use(logger); // catat semua request
app.use(securityHeaders);
app.use(express.json({ limit: "10kb" })); // body JSON (API)
app.use(express.urlencoded({ extended: false, limit: "10kb" })); // body form HTML
app.use(express.static(path.join(__dirname, "public"))); // /js/*.js

app.use(
  session({
    name: "cbot.sid",
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: config.isProd, // true bila dipasang di HTTPS
      maxAge: config.sessionMaxAgeMs,
    },
  }),
);
app.use(flash);
app.use((req, res, next) => {
  res.locals.currentPath = req.path;
  next();
});

app.use("/", routes);

app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
  if (!process.env.GEMINI_API_KEY) {
    console.warn(
      "PERINGATAN: GEMINI_API_KEY belum diisi di file .env, fitur AI belum aktif.",
    );
  }
  if (!process.env.SESSION_SECRET) {
    console.warn(
      "PERINGATAN: SESSION_SECRET belum diisi di file .env (wajib diganti sebelum dipakai sungguhan).",
    );
  }
});
