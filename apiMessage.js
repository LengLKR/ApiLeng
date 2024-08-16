export default async function handler(req, res) {
  if (req.method === "GET") {
    //logic สำหรับดึงข้อความที่บันทึกไว้จากฐานข้อมูลหรือแหล่งข้อมูลอื่น
    const messages = [
      { id: 1, text: "Message 1" },
      { id: 2, text: "Message 2" },
    ]; // สมมุติว่าเป็นข้อมูลจากฐานข้อมูล
    res.status(200).json(messages0);
  } else {
    res.status(405).end();
  }
}
