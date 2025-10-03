export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  // ✅ REDIRECT GET vers extension-queue
  if (req.method === "GET") {
    console.log(
      "⚠️ GET on /extension-webhook - Redirecting to /extension-queue"
    );
    return res.json({
      success: true,
      message: "Use /api/extension-queue for GET requests",
      redirect: "/api/extension-queue",
    });
  }

  if (req.method === "POST") {
    const {
      url,
      threatType,
      analysis,
      aiAnalysis,
      extensionId,
      timestamp,
      summary,
    } = req.body || {};
    const finalAnalysis = summary || analysis || aiAnalysis;

    if (!extensionId || !url || !threatType) {
      return res.status(400).json({
        error: "Missing required fields: extensionId, url, threatType",
      });
    }

    try {
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

      console.log(`📥 Extension stored: ${extensionId}`);

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

  return res.status(405).json({ error: "Method not allowed" });
}
