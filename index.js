const express = require("express");
const axios = require("axios");
const cors = require("cors");
const cron = require("node-cron");
const { getDocs, query, orderBy, collection } = require("firebase/firestore");
const { db } = require("./firebaseconfig");

// ตั้งค่าเซิร์ฟเวอร์
const app = express();
app.use(cors());
app.use(express.json());

// ตั้งค่า LINE CHANNEL ACCESS TOKEN
const LINE_CHANNEL_ACCESS_TOKEN =
  "pGJXMK92+YhNxQ1pBFpk+RBwMAa4voF30YPb0NBST+hsu503dvNLLzkfRKLcG7gdFkbhLR2fqKX8q3WGX3nsbmVRTtgmPpRM1LqQk3n7R2+6WHO10oTbP65woC0oEEiUJpsMM6nQQG7Jou9FeIgr6wdB04t89/1O/w1cDnyilFU=";

//ฟังก์ชัน handleSave จาก apiSaveMessage.js
const handleSave = require("./apiSaveMessage");

// ฟังก์ชันสุ่มข้อความ
function getRandomMessage(messages) {
  const randomIndex = Math.floor(Math.random() * messages.length);
  return messages[randomIndex];
}

//ฟังก์ชั่นตรวจสอบคำหยาบ
function containsProfanity(text) {
  const profanityList = [
    "ควย",
    "หี",
    "ไอเหี้ย",
    "ไอสัตว์",
    "ไอสัส",
    "ควาย",
    "เฮงซวย",
    "อีตอแหล",
    "ไอ้ระยำ",
    "ไอ้ตัวแสบ",
    "ผู้หญิงต่ำๆ",
    "พระหน้าผี",
    "อีดอก",
    "อีดอกทอง",
    "หมา",
    "ไอเวร",
    "มารศาสนา",
    "ไอ้หน้าโง่",
    "กระโหลก",
    "อีสัส",
  ];

  return profanityList.some((word) => text.includes(word));
}

// API ดึงข้อมูลจาก firebase และกรองคำหยาบ
app.get("/api/messages", async (req, res) => {
  try {
    const q = query(
      collection(db, "messages"),
      orderBy("createdAt", "desc") // จัดเรียงตาม createdAt จากมากไปน้อย
    );
    const querySnapshot = await getDocs(q);
    const filteredMessages = [];

    querySnapshot.forEach((doc) => {
      const message = doc.data().text;
      if (!containsProfanity(message)) {
        filteredMessages.push({ id: doc.id, text: message });
      }
    });

    if (filteredMessages.length === 0) {
      return res.status(404).send("No appropriate messages found.");
    }

    res.json(filteredMessages);
  } catch (error) {
    console.error("Error fetching messages from Firebase: ", error);
    res.status(500).send("Failed to fetch messages.");
  }
});

// Endpoint สำหรับการบันทึกข้อความ
app.post("/api/saveMessage", handleSave);

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

    //ตรวจสอบคำหยาบในข้อความที่สุ่มเลือกมา
    if (containsProfanity(randomMessage.text)) {
      return res
        .status(400)
        .send("Message contains profanity and cannot be sent.");
    }

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

// ตั้งเวลาส่งข้อความทุกๆ 7 โมงเช้าเวลาไทย
cron.schedule(
  "21 17 * * *",
  async () => {
    try {
      const response = await axios.get("http://localhost:8888/api/sendtoline");
      console.log("Scheduled task: Message sent at 7:00 AM");
    } catch (error) {
      console.error("Scheduled task failed:", error);
    }
  },
  {
    timezone: "Asia/Bangkok",
  }
);

// เริ่มเซิร์ฟเวอร์
app.listen(8888, () => {
  console.log("Server is running on port 8888");
});
