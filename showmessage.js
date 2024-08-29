// pages/api/messages.js
const { db } = require('./firebaseconfig'); 
const { collection, getDocs } = require('firebase/firestore');

export default async function handleGetMessages(req, res) {
  if (req.method === 'GET') {
    try {
      // ดึงข้อมูลจากคอลเล็กชัน 'messages'
      const querySnapshot = await getDocs(collection(db, 'messages'));
      const messages = [];
      querySnapshot.forEach((doc) => {
        messages.push({ id: doc.id, ...doc.data() });
      });

      // ส่งข้อมูลกลับเป็น JSON
      res.status(200).json(messages);
    } catch (e) {
      console.error('Error getting documents: ', e);
      res.status(500).json({ error: 'Failed to fetch messages' });
    }
  } else {
    // Method Not Allowed
    res.status(405).end();
  }
}
