const express = require("express");
const axios = require("axios");
const app = express();
const handleSave = require("./apiSaveMessage"); // เปลี่ยนชื่อไฟล์เป็น apiSaveMessage.js
const cors = require("cors");
const LINE_CHANNEL_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN;

app.use(cors());

app.use(express.json()); // เพื่อให้สามารถ parse JSON ใน body ของ request ได้

app.post("/api/saveMessage", (req, res) => {
  handleSave(req, res);
});
app.post("/api/sendLineMessage", async (req, res) => {
  const { message, userId } = req.body; // รับ userId จาก body ของ request
  console.log("Request Body:", req.body);
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
          Authorization: `Bearer pGJXMK92+YhNxQ1pBFpk+RBwMAa4voF30YPb0NBST+hsu503dvNLLzkfRKLcG7gdFkbhLR2fqKX8q3WGX3nsbmVRTtgmPpRM1LqQk3n7R2+6WHO10oTbP65woC0oEEiUJpsMM6nQQG7Jou9FeIgr6wdB04t89/1O/w1cDnyilFU=`,
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

app.listen(8888, () => {
  console.log("Server is running on port 8888");
});
