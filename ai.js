const express = require("express");
const axios = require("axios");
const router = express.Router();

// ✅ POST route to handle AI assistance requests
router.post("/", async (req, res) => {
  try {
    const { query, language } = req.body;

    if (!query) {
      return res.status(400).json({ error: "Query is required" });
    }

    const prompt = `
You are a multilingual AI farming assistant.
Provide concise suggestions in ${language || "English"} for farmers based on this query:
"${query}"
Topics can include seasonal crops, fertilizers, pest control, soil care, etc.
    `;

    // ✅ Make a request to OpenAI API
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are an expert AI agriculture assistant." },
          { role: "user", content: prompt }
        ],
      },
      {
        headers: {
          "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const aiMessage = response.data.choices[0].message.content;
    res.json({ reply: aiMessage });
  } catch (err) {
    console.error("AI Assistant Error:", err.response?.data || err.message);
    res.status(500).json({ error: "AI service failed", details: err.message });
  }
});

// ✅ Export router correctly (this was missing before!)
module.exports = router;
