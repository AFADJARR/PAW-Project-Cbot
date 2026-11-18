// utils/AppError.js
// Error yang "aman ditampilkan" ke pengguna (pesan sudah ramah, tanpa detail teknis).
class AppError extends Error {
  constructor(message, statusCode = 500, code = "APP_ERROR") {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.code = code;
  }
}

module.exports = AppError;
