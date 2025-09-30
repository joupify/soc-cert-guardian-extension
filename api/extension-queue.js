// extension-queue.js - TON SYSTÈME PRINCIPAL
let extensionQueue = [];

export default async function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method === "POST") {
    const extensionData = req.body;

    extensionQueue.push({
      ...extensionData,
      addedAt: new Date().toISOString(),
      processed: false,
    });

    console.log(
      `📥 Extension queued: ${extensionData.extensionId} (MAIN QUEUE)`
    );
    console.log(`📊 Queue size: ${extensionQueue.length}`);

    return res.json({
      success: true,
      queued: true,
      queueSize: extensionQueue.length,
    });
  }

  if (req.method === "GET") {
    const pending = extensionQueue.filter((ext) => !ext.processed);

    console.log(`📤 n8n fetching ${pending.length} extensions from MAIN QUEUE`);

    // Marquer comme traitées
    pending.forEach((ext) => {
      ext.processed = true;
      ext.processedAt = new Date().toISOString();
    });

    return res.json({
      success: true,
      extensions: pending,
      count: pending.length,
      source: "main-queue",
    });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
