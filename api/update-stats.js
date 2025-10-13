// api/update-stats.js
// Route pour RECEVOIR les stats depuis n8n (POST)

let cachedStats = null; // Stockage en mémoire

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

      // 💾 Stocker les stats
      cachedStats = {
        ...stats,
        receivedAt: new Date().toISOString(),
      };

      console.log("✅ Stats updated:", cachedStats);

      return res.status(200).json({
        success: true,
        message: "Stats updated successfully",
        stats: cachedStats,
      });
    } catch (error) {
      console.error("❌ Error updating stats:", error);
      return res.status(500).json({ error: "Failed to update stats" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}

// Export pour le GET endpoint
export { cachedStats };
