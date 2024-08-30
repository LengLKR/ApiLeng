const {
  collection,
  getDocs,
  query,
  where,
  orderBy,
} = require("firebase/firestore");
const { db } = require("./firebaseconfig");

module.exports = async function handleGetMessages(req, res) {
  if (req.method === "GET") {
    try {
      // สร้าง query เพื่อดึงข้อมูลจากคอลเล็กชัน 'messages' พร้อมกับเงื่อนไขและการจัดเรียง
      const q = query(
        collection(db, "messages"),
        orderBy("createdAt", "desc") // จัดเรียงตาม createdAt จากมากไปน้อย
      );

      const querySnapshot = await getDocs(q);
      const messages = [];
      querySnapshot.forEach((doc) => {
        messages.push({ id: doc.id, ...doc.data() });
      });

      // ส่งข้อมูลกลับเป็น JSON
      res.status(200).json(messages);
    } catch (e) {
      console.error("Error getting documents: ", e);
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  } else {
    // Method Not Allowed สำหรับ method อื่นๆ
    res.status(405).end();
  }
};
