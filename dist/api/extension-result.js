// Temporary in-memory storage (use DB in production)
const extensionResults = new Map();

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  const { extensionId } = req.query;

  if (req.method === "POST") {
    // N8N stores analysis result
    const { finalScore, analysis, recommendations, severity } = req.body;

    extensionResults.set(extensionId, {
      finalScore,
      analysis,
      recommendations,
      severity,
      timestamp: new Date().toISOString(),
      processed: true,
    });

    console.log("Result stored for extension:", extensionId);
    return res.json({ success: true });
  }

  if (req.method === "GET") {
    // Extension polls for result
    const result = extensionResults.get(extensionId);
    return res.json({ result: result || null });
  }

  res.status(405).json({ error: "Method not allowed" });
}
