// config/gemini.js
const { GoogleGenAI } = require("@google/genai");
require("dotenv").config();

// Inisialisasi client Google Gen AI
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const MODEL_NAME = "gemini-3.5-flash-lite";

module.exports = {
  ai,
  MODEL_NAME,
};
