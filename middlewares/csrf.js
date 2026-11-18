// middlewares/csrf.js
// Perlindungan CSRF untuk form admin: setiap form membawa token rahasia yang tersimpan di session.
const crypto = require("crypto");
const AppError = require("../utils/AppError");

function csrfToken(req, res, next) {
  if (!req.session.csrfToken)
    req.session.csrfToken = crypto.randomBytes(24).toString("hex");
  res.locals.csrfToken = req.session.csrfToken;
  next();
}

function verifyCsrf(req, res, next) {
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) return next();
  const kirim = req.body && req.body._csrf;
  const asli = req.session && req.session.csrfToken;
  const sah =
    typeof kirim === "string" &&
    typeof asli === "string" &&
    kirim.length === asli.length &&
    crypto.timingSafeEqual(Buffer.from(kirim), Buffer.from(asli));
  if (!sah) {
    return next(
      new AppError(
        "Sesi formulir tidak valid. Muat ulang halaman lalu coba lagi.",
        403,
        "CSRF",
      ),
    );
  }
  next();
}

module.exports = { csrfToken, verifyCsrf };
