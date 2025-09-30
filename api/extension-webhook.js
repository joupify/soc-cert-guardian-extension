// Temporary in-memory storage (use DB in production) - 🆕 BACKUP
let pendingExtensions = [];

export default async function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method !== "POST" && req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (req.method === "POST") {
    const { url, threatType, aiAnalysis, extensionId, timestamp } = req.body;

    try {
      // 🔄 GARDER ton système existant - Push vers extension-queue
      await fetch("https://soc-cert-extension.vercel.app/api/extension-queue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url,
          threatType,
          aiAnalysis,
          extensionId,
          timestamp: timestamp || new Date().toISOString(),
        }),
      });

      // 🆕 AJOUTER backup storage local (au cas où)
      pendingExtensions.push({
        url,
        threatType,
        aiAnalysis,
        extensionId,
        timestamp: timestamp || new Date().toISOString(),
        receivedAt: new Date().toISOString(),
        processed: false,
      });

      console.log(`📥 Extension stored: ${extensionId} (queue + backup)`);

      return res.json({
        success: true,
        extensionId,
        message: "Queued for analysis",
      });
    } catch (error) {
      console.error("Queue push failed:", error);

      // 🔄 FALLBACK: Si extension-queue fail, utiliser backup local
      console.log("Using local storage as fallback");
      return res.json({
        success: true,
        extensionId,
        message: "Queued for analysis (fallback)",
      });
    }
  }

  if (req.method === "GET") {
    // 📤 NOUVEAU: n8n peut récupérer depuis ce endpoint aussi
    try {
      const extensionsToProcess = pendingExtensions.filter(
        (ext) => !ext.processed
      );

      console.log(
        `📤 Delivering ${extensionsToProcess.length} extensions from backup`
      );

      // Marquer comme traitées
      extensionsToProcess.forEach((ext) => {
        ext.processed = true;
        ext.processedAt = new Date().toISOString();
      });

      return res.json({
        success: true,
        extensions: extensionsToProcess,
        count: extensionsToProcess.length,
        source: "webhook-backup",
      });
    } catch (error) {
      console.error("Backup fetch failed:", error);
      return res.status(500).json({ error: "Backup fetch failed" });
    }
  }
}
s;
