// routes/chat.routes.js
const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chat.controller.js");
const validateChatInput = require("../middlewares/validateChatInput.js");

router.post("/chat", validateChatInput, chatController.handleChat);

module.exports = router;
