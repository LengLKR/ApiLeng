module.exports = async function handleSave(req, res) {
  if (req.method === "POST") {
    const { message } = req.body;
    if (!message) {
      res.status(400).json({ error: "Message is required" });
      return;
    }

    // Logic สำหรับบันทึกข้อความไปยังฐานข้อมูลหรือแหล่งข้อมูลอื่น
    console.log("Message to save:", message);

    res.status(200).json({ success: true });
  } else {
    res.status(405).end(); // Method Not Allowed
  }
};
