// middlewares/flash.js
// Pesan sekali tampil (mis. "Produk disimpan") yang bertahan melewati redirect.
function flash(req, res, next) {
  req.flash = (type, msg) => {
    if (!req.session.flash) req.session.flash = [];
    req.session.flash.push({ type, msg });
  };
  res.locals.flash = (req.session && req.session.flash) || [];
  if (req.session && req.session.flash) delete req.session.flash;
  next();
}

module.exports = flash;
