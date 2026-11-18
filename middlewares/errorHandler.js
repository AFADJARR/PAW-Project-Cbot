// middlewares/errorHandler.js
const AppError = require("../utils/AppError");

// Path tidak dikenal
function notFound(req, res) {
  if (req.originalUrl.startsWith("/api")) {
    return res
      .status(404)
      .json({
        success: false,
        error: { message: "Endpoint tidak ditemukan." },
      });
  }
  res.status(404).render("404", { judul: "Tidak ditemukan" });
}

// Semua error berujung di sini. Detail teknis hanya dicetak di console server.
function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);

  let status = 500;
  let message = "Terjadi kesalahan pada server.";

  if (err instanceof AppError) {
    status = err.statusCode;
    message = err.message;
  } else if (err.type === "entity.parse.failed") {
    status = 400;
    message = "Format JSON tidak valid.";
  } else if (err.type === "entity.too.large") {
    status = 413;
    message = "Ukuran request terlalu besar.";
  } else if (err.status >= 400 && err.status < 500 && err.expose) {
    status = err.status;
    message = "Request tidak valid.";
  } else {
    console.error(err);
  }

  if (req.originalUrl.startsWith("/api")) {
    return res.status(status).json({ success: false, error: { message } });
  }
  res
    .status(status)
    .render(
      "error",
      { judul: "Terjadi kesalahan", pesan: message },
      (e, html) => {
        if (e) return res.type("text").send(message);
        res.send(html);
      },
    );
}

module.exports = { notFound, errorHandler };
