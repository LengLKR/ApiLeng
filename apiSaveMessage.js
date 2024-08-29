const { db } = require('./firebaseconfig'); // นำเข้า Firebase Firestore ที่ตั้งค่าไว้
const { collection, addDoc } = require('firebase/firestore');

module.exports = async function handleSave(req, res) {
  if (req.method === "POST") {
    const { message } = req.body;

    if (!message) {
      res.status(400).json({ error: "Message is required" });
      return;
    }

    try {
      // Logic สำหรับบันทึกข้อความไปยัง Firestore
      const docRef = await addDoc(collection(db, "messages"), {
        text: message,
        createdAt: new Date(),
      });

      console.log("Document written with ID: ", docRef.id);

      res.status(200).json({ success: true, id: docRef.id });
    } catch (e) {
      console.error("Error adding document: ", e);
      res.status(500).json({ error: "Failed to save message" });
    }
  } else {
    res.status(405).end(); // Method Not Allowed
  }
};
