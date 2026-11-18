// middlewares/logger.js
// Mencatat: timestamp, metode HTTP, path, status response, durasi.
// Ditulis ke console dan ke file logs/access.log. Isi pesan chat TIDAK dicatat.
const fs = require("fs");
const path = require("path");

const logDir = path.join(__dirname, "..", "logs");
fs.mkdirSync(logDir, { recursive: true });
const fileLog = fs.createWriteStream(path.join(logDir, "access.log"), {
  flags: "a",
});

function logger(req, res, next) {
  const mulai = Date.now();

  res.on("finish", () => {
    const baris = `[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ${res.statusCode} ${
      Date.now() - mulai
    }ms`;
    console.log(baris);
    fileLog.write(baris + "\n");
  });

  next();
}

module.exports = logger;
