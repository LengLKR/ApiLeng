const express = require("express");
const axios = require("axios");
const cors = require("cors");

// ตั้งค่าเซิร์ฟเวอร์
const app = express();
app.use(cors());
app.use(express.json()); // เพื่อให้สามารถ parse JSON ใน body ของ request ได้

// ตั้งค่า LINE CHANNEL ACCESS TOKEN
const LINE_CHANNEL_ACCESS_TOKEN =
  "pGJXMK92+YhNxQ1pBFpk+RBwMAa4voF30YPb0NBST+hsu503dvNLLzkfRKLcG7gdFkbhLR2fqKX8q3WGX3nsbmVRTtgmPpRM1LqQk3n7R2+6WHO10oTbP65woC0oEEiUJpsMM6nQQG7Jou9FeIgr6wdB04t89/1O/w1cDnyilFU=";

// ฟังก์ชันการจัดการเพื่อบันทึกข้อความ
const handleSave = require("./apiSaveMessage"); // ต้องมีการสร้างไฟล์ apiSaveMessage.js เพื่อบันทึกข้อความ

// ฟังก์ชันการจัดการเพื่อดึงข้อความที่บันทึกไว้
const handleGetMessages = require("./showmessage"); // ต้องมีการสร้างไฟล์ showmessage.js เพื่อดึงข้อความที่บันทึกไว้
const { getDocs, query, orderBy, collection } = require("firebase/firestore");
const { db } = require("./firebaseconfig");

// ฟังก์ชันสุ่มข้อความ
function getRandomMessage(messages) {
  const randomIndex = Math.floor(Math.random() * messages.length);
  return messages[randomIndex];
}

// Endpoint สำหรับบันทึกข้อความ
app.post("/api/saveMessage", (req, res) => {
  handleSave(req, res);
});
app.get("/api/messages", (req, res) => {
  handleGetMessages(req, res);
});

// Endpoint สำหรับดึงข้อความที่บันทึกไว้และส่งไปยัง LINE
app.get("/api/sendtoline", async (req, res) => {
  try {
    // ดึงข้อความที่บันทึกไว้จาก Firestore
    const q = query(
      collection(db, "messages"),
      orderBy("createdAt", "desc") // จัดเรียงตาม createdAt จากมากไปน้อย
    );
    const querySnapshot = await getDocs(q);
    const messages = [];
    querySnapshot.forEach((doc) => {
      messages.push({ id: doc.id, ...doc.data() });
    });

    if (!messages || messages.length === 0) {
      return res.status(404).send("No messages found.");
    }

    // สุ่มเลือกข้อความจาก array messages
    const randomMessage = getRandomMessage(messages);

    // ส่งข้อความที่ดึงมาไปยังผู้ใช้ทุกคนที่เป็นเพื่อนกับบอท LINE
    const lineMessages = [
      {
        type: "text",
        text: randomMessage.text, // ส่งข้อความที่สุ่มเลือกไปยัง LINE
      },
    ];

    const response = await axios.post(
      "https://api.line.me/v2/bot/message/broadcast",
      {
        messages: lineMessages,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
        },
      }
    );

    res
      .status(200)
      .send("Random message broadcasted via Line Chatbot successfully.");
    console.log("Response from Line API:", response.data);
  } catch (error) {
    console.error(
      "Error broadcasting messages via Line Chatbot: ",
      error.response ? error.response.data : error.message
    );
    res
      .status(500)
      .send("Failed to broadcast random message via Line Chatbot.");
  }
});

// เริ่มเซิร์ฟเวอร์
app.listen(8888, () => {
  console.log("Server is running on port 8888");
});
