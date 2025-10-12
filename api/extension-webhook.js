export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  // Manual JSON parsing for POST requests
  if (req.method === "POST") {
    if (!req.body || typeof req.body === "string") {
      const chunks = [];
      for await (const chunk of req) {
        chunks.push(chunk);
      }
      const bodyString = Buffer.concat(chunks).toString();
      try {
        req.body = JSON.parse(bodyString);
        console.log(
          "📥 Manually parsed body:",
          JSON.stringify(req.body, null, 2)
        );
      } catch (e) {
        console.log(
          "❌ Failed to parse body:",
          e.message,
          "Body string:",
          bodyString
        );
        req.body = {};
      }
    }
  }

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
    console.log(
      "📥 WEBHOOK RECEIVED RAW BODY:",
      JSON.stringify(req.body, null, 2)
    );
    console.log("📥 req.body type:", typeof req.body);

    let parsedBody = req.body;
    if (typeof req.body === "string") {
      try {
        parsedBody = JSON.parse(req.body);
        console.log(
          "📥 Parsed req.body from string:",
          JSON.stringify(parsedBody, null, 2)
        );
      } catch (e) {
        console.log("❌ Failed to parse req.body string:", e.message);
      }
    }

    const {
      url,
      threatType,
      analysis,
      aiAnalysis,
      extensionId,
      timestamp,
      summary,
      indicators,
      riskScore,
      confidence,
    } = parsedBody || {};
    const finalAnalysis = summary || analysis || aiAnalysis;

    console.log("📥 WEBHOOK EXTRACTED VALUES:");
    console.log("  - extensionId:", extensionId);
    console.log("  - url:", url);
    console.log("  - threatType:", threatType);
    console.log("  - summary:", summary);
    console.log("  - indicators:", JSON.stringify(indicators));
    console.log("  - riskScore:", riskScore);
    console.log("  - confidence:", confidence);

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
            indicators: indicators || [],
            riskScore: riskScore || 0,
            confidence: confidence || 0,
            timestamp: timestamp || new Date().toISOString(),
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`extension-queue returned ${response.status}`);
      }

      console.log(`📥 Extension stored: ${extensionId}`);
      console.log(`  - indicators: ${JSON.stringify(indicators)}`);
      console.log(`  - riskScore: ${riskScore}`);
      console.log(`  - confidence: ${confidence}`);

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
