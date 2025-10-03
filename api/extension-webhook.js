export default async function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const {
    url,
    threatType,
    analysis,
    aiAnalysis,
    extensionId,
    timestamp,
    summary,
  } = req.body || {};

  // 🔧 Support both field names
  const finalAnalysis = summary || analysis || aiAnalysis;

  // Validation
  if (!extensionId || !url || !threatType) {
    return res.status(400).json({
      error: "Missing required fields: extensionId, url, threatType",
    });
  }

  try {
    // ✅ FORWARD vers extension-queue (c'est tout !)
    const response = await fetch(
      "https://soc-cert-extension.vercel.app/api/extension-queue",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url,
          threatType,
          aiAnalysis: finalAnalysis,
          extensionId,
          timestamp: timestamp || new Date().toISOString(),
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`extension-queue returned ${response.status}`);
    }

    console.log(`📥 Extension stored: ${extensionId} (queue + backup)`);

    return res.json({
      success: true,
      extensionId,
      message: "Queued for analysis",
    });
  } catch (error) {
    console.error("❌ Queue push failed:", error);
    return res.status(500).json({
      error: "Failed to queue",
      details: error.message,
    });
  }
}
