const express = require("express");
const axios = require("axios");
const cors = require("cors");
const cron = require("node-cron");
const {
  getDocs,
  query,
  orderBy,
  collection,
  where,
} = require("firebase/firestore");
const { db } = require("./firebaseconfig");

const app = express();
app.use(cors());
app.use(express.json());

const LINE_CHANNEL_ACCESS_TOKEN =
  "pGJXMK92+YhNxQ1pBFpk+RBwMAa4voF30YPb0NBST+hsu503dvNLLzkfRKLcG7gdFkbhLR2fqKX8q3WGX3nsbmVRTtgmPpRM1LqQk3n7R2+6WHO10oTbP65woC0oEEiUJpsMM6nQQG7Jou9FeIgr6wdB04t89/1O/w1cDnyilFU=";

const handleSave = require("./apiSaveMessage");

function getRandomMessage(messages) {
  const randomIndex = Math.floor(Math.random() * messages.length);
  return messages[randomIndex];
}

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
    "ขว$ย",
    "vตวu[[y6i",
    "xีสั$",
    "ค*ย",
    "hี",
    "ืเu",
    "ควาi",
    "l]งซวย",
    "อีต@แหล",
    "ไอระยำ",
    "aัส",
    "xัส",
    "vtwic",
    "ก$ย",
    "คsย",
    "ฆวย",
    "คๅย",
    "คุวย",
    "อีแก่",
    "อีบ้า",
    "อีโง่",
    "ไอ้ขี้เมา",
    "ไอ้หน้าแหก",
    "ไอ้ตอแหล",
    "อีชั่ว",
    "อีอ้วน",
    "อีบัดซบ",
    "ไอ้ถ่อย",
    "อีสันดาน",
    "ไอ้หัวขวด",
    "อีปอบ",
    "ไอ้จังไร",
    "อีชิงหมาเกิด",
    "ไอ้ขี้โกง",
    "ไอ้ขี้ขโมย",
    "ขวาย",
    "สันขวาน",
    "xี",
    "มึง",
    "กู",
    "ไอกาก",
    "fuck",
    "shit",
    "bitch",
    "asshole",
    "bastard",
    "damn",
    "cunt",
    "dick",
    "piss",
    "whore",
    "slut",
    "fag",
    "nigger",
    "motherfucker",
    "cock",
    "pussy",
    "wanker",
    "jerk",
    "douchebag",
    "twat",
    "prick",
    "bollocks",
    "bugger",
    "arse",
    "tosser",
    "skank",
    "scumbag",
    "dickhead",
    "shithead",
    "fucker",
    "cocksucker",
    "twathead",
    "asswipe",
    "crap",
    "hell",
    "bloody",
    "blowjob",
    "sod",
    "son of a bitch",
    "ๆอสัส",
    "แม่เยต",
    "แม่เยส",
    "ฆวย",
    "ฃวย",
    "ไอัสส",
  ];

  return profanityList.some((word) => text.includes(word));
}

app.post("/api/messages", async (req, res) => {
  const { email } = req.body;
  try {
    if (!email) {
      return res.status(400).send("Email is required.");
    }

    const q = query(
      collection(db, "messages"),
      where("email", "==", email),
      orderBy("createdAt", "desc")
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

app.post("/api/saveMessage", handleSave);

app.get("/api/sendtoline", async (req, res) => {
  try {
    const q = query(collection(db, "messages"), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    const messages = [];
    querySnapshot.forEach((doc) => {
      messages.push({ id: doc.id, ...doc.data() });
    });

    if (!messages || messages.length === 0) {
      return res.status(404).send("No messages found.");
    }

    const randomMessage = getRandomMessage(messages);

    if (containsProfanity(randomMessage.text)) {
      return res
        .status(400)
        .send("Message contains profanity and cannot be sent.");
    }

    const lineMessages = [
      {
        type: "text",
        text: `✏${randomMessage.nickName} \n${randomMessage.text}`,
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

cron.schedule(
  "0 7 * * *",
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
// const intervalInSeconds = 10;

// setInterval(async () => {
//   try {
//     const response = await axios.get("http://localhost:8888/api/sendtoline");
//     console.log("Scheduled task: Message sent");
//   } catch (error) {
//     console.error("Scheduled task failed:", error);
//   }
// }, intervalInSeconds * 500);
// //เริ่มเซิร์ฟเวอร์
app.listen(8888, () => {
  console.log("Server is running on port 8888");
});
