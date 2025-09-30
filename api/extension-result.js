// Temporary in-memory storage (use DB in production)
const extensionResults = new Map();
const cveResults = new Map(); // 🆕 NOUVEAU: Pour les CVE

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  const { extensionId } = req.query;

  if (req.method === "POST") {
    // 🆕 NOUVEAU: Détecter le format CVE depuis n8n
    if (req.body.results && Array.isArray(req.body.results)) {
      console.log(
        `📨 Received ${req.body.results.length} CVE results from n8n`
      );

      req.body.results.forEach((result) => {
        const extId =
          result.extensionId ||
          result.original_data?.extensionId ||
          (result.title && result.title.includes("https://")
            ? result.title.match(/demo-[\w-]+/)?.[0] || "mapped"
            : "mapped");

        if (!cveResults.has(extId)) {
          cveResults.set(extId, []);
        }

        const enrichedResult = {
          ...result,
          receivedAt: new Date().toISOString(),
          processedBy: "n8n-pipeline",
        };

        cveResults.get(extId).push(enrichedResult);
        console.log(
          `💾 Stored CVE result for ${extId}: ${result.cve_id} (${result.severity})`
        );
      });

      const storedExtensions = [
        ...new Set(
          req.body.results.map(
            (r) => r.extensionId || r.original_data?.extensionId || "mapped"
          )
        ),
      ];

      return res.json({
        success: true,
        stored: req.body.results.length,
        type: "cve_results",
        extensions: storedExtensions,
      });
    }

    // 🔄 ANCIEN SYSTÈME (garde pour compatibilité)
    if (req.body.finalScore || req.body.analysis) {
      const { finalScore, analysis, recommendations, severity } = req.body;

      extensionResults.set(extensionId, {
        finalScore,
        analysis,
        recommendations,
        severity,
        timestamp: new Date().toISOString(),
        processed: true,
      });

      console.log("Legacy result stored for extension:", extensionId);
      return res.json({
        success: true,
        type: "legacy_result",
      });
    }

    // Format non reconnu
    return res.status(400).json({
      success: false,
      error: "Invalid request format",
    });
  }

  if (req.method === "GET") {
    const { format } = req.query; // ?format=cve ou pas de format

    if (format === "cve") {
      // 🆕 NOUVEAU: Retourner les résultats CVE
      const results = cveResults.get(extensionId) || [];

      console.log(
        `📊 Extension ${extensionId} polling CVE: ${results.length} results available`
      );

      if (results.length > 0) {
        cveResults.delete(extensionId); // Clear after read
        console.log(
          `✅ Delivered ${results.length} CVE results to ${extensionId}`
        );
      }

      return res.json({
        success: true,
        extensionId,
        results,
        count: results.length,
        timestamp: new Date().toISOString(),
        hasMore: results.length > 0,
      });
    } else {
      // 🔄 ANCIEN SYSTÈME: Extension polls for result
      const result = extensionResults.get(extensionId);
      console.log(
        `📊 Extension ${extensionId} polling legacy: ${
          result ? "found" : "none"
        }`
      );
      return res.json({ result: result || null });
    }
  }

  res.status(405).json({ error: "Method not allowed" });
}
