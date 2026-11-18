require("dotenv").config({ quiet: true });
const bcrypt = require("bcryptjs");
const pool = require("../config/db");

async function main() {
  const username = (process.env.ADMIN_USERNAME || "").trim();
  const password = process.env.ADMIN_PASSWORD || "";

  if (!username || password.length < 6) {
    console.error(
      "Isi ADMIN_USERNAME dan ADMIN_PASSWORD (minimal 6 karakter) di file .env dulu.",
    );
    process.exitCode = 1;
    return;
  }

  const hash = await bcrypt.hash(password, 10);
  const [rows] = await pool.query(
    "SELECT id FROM admin WHERE username = ? LIMIT 1",
    [username],
  );

  if (rows.length) {
    await pool.query("UPDATE admin SET password_hash = ? WHERE id = ?", [
      hash,
      rows[0].id,
    ]);
    console.log(`Kata sandi admin "${username}" diperbarui.`);
  } else {
    await pool.query(
      "INSERT INTO admin (username, password_hash) VALUES (?, ?)",
      [username, hash],
    );
    console.log(`Admin "${username}" dibuat.`);
  }
}

main()
  .catch((err) => {
    console.error("Gagal membuat admin:", err.message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
