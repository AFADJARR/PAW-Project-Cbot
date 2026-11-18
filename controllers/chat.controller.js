// controllers/chat.controller.js
const { generateChatResponse } = require("../services/gemini.service.js");

const chatController = {
  handleChat: async (req, res) => {
    try {
      const { message } = req.body;

      // Panggil service Gemini
      const reply = await generateChatResponse(message);

      return res.status(200).json({
        success: true,
        data: {
          reply: reply,
        },
      });
    } catch (error) {
      console.error("Chat Controller Error:", error);
      return res.status(500).json({
        success: false,
        message: error.message || "Terjadi kesalahan pada server AI.",
      });
    }
  },
};

module.exports = chatController;
