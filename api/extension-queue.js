import { kv } from "@vercel/kv";

const QUEUE_KEY = "extension-queue-main";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method === "POST") {
    const extensionData = req.body;

    try {
      const queueItem = {
        ...extensionData,
        addedAt: new Date().toISOString(),
        processed: false,
      };

      // ✅ KV stocke l'objet directement, PAS de JSON.stringify
      await kv.lpush(QUEUE_KEY, queueItem);
      const queueSize = await kv.llen(QUEUE_KEY);

      console.log(`📥 Extension queued: ${extensionData.extensionId}`);
      console.log(`📊 Queue size: ${queueSize}`);

      return res.json({ success: true, queued: true, queueSize });
    } catch (error) {
      console.error("❌ Queue error:", error);
      return res.status(500).json({ error: "Failed to queue" });
    }
  }

  if (req.method === "GET") {
    try {
      const queueLength = await kv.llen(QUEUE_KEY);
      const extensions = [];

      for (let i = 0; i < Math.min(queueLength, 100); i++) {
        const item = await kv.lindex(QUEUE_KEY, i);
        if (item) {
          // ✅ item est déjà un objet, PAS besoin de JSON.parse
          if (!item.processed) extensions.push(item);
        }
      }

      console.log(`📤 n8n fetching ${extensions.length} extensions`);

      return res.json({
        success: true,
        extensions,
        count: extensions.length,
        source: "main-queue",
      });
    } catch (error) {
      console.error("❌ Queue fetch error:", error);
      return res.status(500).json({ error: "Failed to fetch" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
