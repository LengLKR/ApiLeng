const express = require("express");
const axios = require("axios");
const app = express();
app.use(express.json());

const LINE_CHANNEL_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN;
app.post("/api/sendLineMessage", async (req, res) => {
  const { message, userId } = req.body; // รับ userId จาก body ของ request

  if (!message || !userId) {
    // ตรวจสอบว่ามี message และ userId หรือไม่
    return res
      .status(400)
      .send("Missing 'message' or 'userId' in request body.");
  }

  try {
    const response = await axios.post(
      "https://api.line.me/v2/bot/message/push",
      {
        to: userId, // ใช้ userId ที่ได้รับจาก body ของ request
        messages: [
          {
            type: "text",
            text: message, // ข้อความที่ได้รับจากฟรอนต์เอนด์
          },
        ],
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
        },
      }
    );
    res.status(200).send("Message sent via Line Chatbot successfully.");
    console.log("Response from Line API:", response.data);
  } catch (error) {
    console.error(
      "Error sending message via Line Chatbot: ",
      error.response ? error.response.data : error.message
    );
    res.status(500).send("Failed to send message via Line Chatbot.");
  }
});

const PORT = process.env.PORT || 8888;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
