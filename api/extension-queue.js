// Queue en mémoire pour les événements extension
let alertQueue = [];

export default async function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method === "POST") {
    alertQueue.push(req.body);
    return res.json({ success: true, queued: alertQueue.length });
  }

  if (req.method === "GET") {
    const pending = [...alertQueue];
    alertQueue = []; // vider après lecture
    return res.json(pending);
  }

  res.status(405).json({ error: "Method not allowed" });
}
