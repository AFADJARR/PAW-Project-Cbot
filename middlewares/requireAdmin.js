// middlewares/requireAdmin.js
// Halaman admin hanya boleh dibuka setelah login. Dipasang di setiap route admin (selain login).
function requireAdmin(req, res, next) {
  if (req.session && req.session.admin) {
    res.locals.admin = req.session.admin;
    return next();
  }
  res.redirect("/admin/login");
}

module.exports = requireAdmin;
