import { kv } from "@vercel/kv";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method === "POST") {
    try {
      const { stats } = req.body;

      if (!stats) {
        return res.status(400).json({ error: "Missing stats data" });
      }

      const updatedStats = {
        ...stats,
        receivedAt: new Date().toISOString(),
      };

      // ✅ Store in Redis KV (key: 'virtual-cve-stats')
      await kv.set("virtual-cve-stats", updatedStats);

      console.log("✅ Stats updated in Redis KV:", updatedStats);

      return res.status(200).json({
        success: true,
        message: "Stats updated successfully",
        stats: updatedStats,
      });
    } catch (error) {
      console.error("❌ Error updating stats:", error);
      return res.status(500).json({
        error: "Failed to update stats",
        details: error.message,
      });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
