const express = require("express");
const app = express();
const port = 3000;

//ตัวอย่างข้อความที่เคยส่งของผู้ใช้
let messages = [
  { id: 1, text: "Hello, this is your first message" },
  { id: 2, text: "This is another message you sent earlier." },
];

//API ดึงข้อความ
app.get("/api/messages", (req, res) => {
  res.json(messages);
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
