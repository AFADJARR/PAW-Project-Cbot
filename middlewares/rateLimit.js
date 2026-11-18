// middlewares/rateLimit.js
// Pembatas permintaan sederhana per IP (disimpan di memori server).
const AppError = require("../utils/AppError");

function rateLimit({ max, windowMs, message }) {
  const hits = new Map(); // ip -> { count, reset }

  // bersihkan data kedaluwarsa secara berkala
  const timer = setInterval(() => {
    const now = Date.now();
    for (const [ip, h] of hits) if (h.reset <= now) hits.delete(ip);
  }, windowMs);
  timer.unref();

  return function (req, res, next) {
    const now = Date.now();
    let h = hits.get(req.ip);
    if (!h || h.reset <= now) {
      h = { count: 0, reset: now + windowMs };
      hits.set(req.ip, h);
    }
    h.count++;
    if (h.count > max) {
      res.set("Retry-After", String(Math.ceil((h.reset - now) / 1000)));
      return next(new AppError(message, 429, "RATE_LIMIT"));
    }
    next();
  };
}

module.exports = rateLimit;
