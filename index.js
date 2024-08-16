const express = require("express");
const app = express();
const handleSave = require("./apiSaveMessage"); // เปลี่ยนชื่อไฟล์เป็น apiSaveMessage.js
const cors = require("cors");
app.use(cors());

app.use(express.json()); // เพื่อให้สามารถ parse JSON ใน body ของ request ได้

app.post("/api/saveMessage", (req, res) => {
  handleSave(req, res);
});

app.listen(8888, () => {
  console.log("Server is running on port 8888");
});
