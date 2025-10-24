import { kv } from "@vercel/kv";

const QUEUE_KEY = "extension-queue-main";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  // ========================================
  // POST: Add an item to the queue
  // ========================================
  if (req.method === "POST") {
    const extensionData = req.body;

    try {
      const queueItem = {
        ...extensionData,
        addedAt: new Date().toISOString(),
        processed: false,
      };

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

  // ========================================
  // GET: Read unprocessed items (batch)
  // ========================================
  if (req.method === "GET") {
    const batchSize = parseInt(req.query.batch) || 10; // Batch of 10 by default

    try {
      const queueLength = await kv.llen(QUEUE_KEY);
      const limit = Math.min(queueLength, batchSize);
      const extensions = [];

      for (let i = 0; i < limit; i++) {
        const item = await kv.lindex(QUEUE_KEY, i);
        if (item && !item.processed) {
          extensions.push(item);
        }
      }

      console.log(
        `📤 n8n fetching batch: ${extensions.length}/${queueLength} extensions`
      );

      return res.json({
        success: true,
        extensions,
        count: extensions.length,
        queueLength,
        source: "main-queue",
      });
    } catch (error) {
      console.error("❌ Queue fetch error:", error);
      return res.status(500).json({ error: "Failed to fetch" });
    }
  }

  // ========================================
  // DELETE: Remove N processed items
  // ========================================
  if (req.method === "DELETE") {
    const count = parseInt(req.body?.count) || parseInt(req.query.count) || 1;

    try {
      const beforeLen = await kv.llen(QUEUE_KEY);

      // ✅ Remove the first N items (those just processed)
      if (count >= beforeLen) {
        // If count >= length, empty completely
        await kv.del(QUEUE_KEY);
        console.log(`🗑️ Queue vidée complètement (${beforeLen} items)`);
        return res.json({ success: true, deleted: beforeLen, remaining: 0 });
      } else {
        // Otherwise, trim to keep only [count, -1]
        await kv.ltrim(QUEUE_KEY, count, -1);
        const afterLen = await kv.llen(QUEUE_KEY);
        console.log(`🗑️ Supprimés: ${count}, Restants: ${afterLen}`);
        return res.json({ success: true, deleted: count, remaining: afterLen });
      }
    } catch (error) {
      console.error("❌ Queue delete error:", error);
      return res.status(500).json({ error: "Failed to delete" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
