// index.js
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const axios = require("axios");
const mongoose = require("mongoose");
const Message = require("./models/Message");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public")); // optional if you have frontend in public folder

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected ✅"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Chat route
app.post("/chat", async (req, res) => {
  try {
    const messages = req.body.messages;
    const userMessage = messages[messages.length - 1].content;

    // Call OpenRouter AI API
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "mistralai/mistral-7b-instruct",
        messages: messages,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const botReply = response.data.choices[0].message.content;

    // Save messages to MongoDB
    await Message.create({ role: "user", content: userMessage });
    await Message.create({ role: "assistant", content: botReply });

    res.json({ reply: botReply });

  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ reply: "Error generating AI response" });
  }
});

// Route to view all messages
app.get("/all-messages", async (req, res) => {
  try {
    const allMessages = await Message.find().sort({ timestamp: 1 });
    res.json(allMessages);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching messages");
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
