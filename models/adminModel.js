// models/adminModel.js
const pool = require("../config/db");

async function findByUsername(username) {
  const [rows] = await pool.query(
    "SELECT id, username, password_hash AS passwordHash FROM admin WHERE username = ? LIMIT 1",
    [username],
  );
  return rows[0] || null;
}

module.exports = { findByUsername };
