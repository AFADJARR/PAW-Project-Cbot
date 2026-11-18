// routes/index.js
const express = require("express");

const router = express.Router();

router.use("/api", require("./api"));
router.use("/admin", require("./admin"));
router.use("/", require("./web"));

module.exports = router;
