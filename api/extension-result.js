// Temporary in-memory storage (use DB in production)
const extensionResults = new Map();
const cveResults = new Map(); // 🆕 NOUVEAU: Pour les CVE

export default async function handler(req, res) {
  try {
    // Debug complet avec timestamp
    const timestamp = new Date().toISOString();
    console.log(`=== API DEBUG ${timestamp} ===`);
    console.log("Method:", req.method);
    console.log("URL:", req.url);
    console.log("Query:", JSON.stringify(req.query, null, 2));
    console.log("Headers:", JSON.stringify(req.headers, null, 2));
    console.log("Body:", JSON.stringify(req.body, null, 2));

    // 🆕 STATS de stockage
    console.log("🗄️ STORAGE STATS:");
    console.log("  - CVE Results:", cveResults.size, "extensions stored");
    console.log(
      "  - Legacy Results:",
      extensionResults.size,
      "extensions stored"
    );

    for (const [extId, results] of cveResults.entries()) {
      console.log(`    ${extId}: ${results.length} CVE results`);
    }
    console.log("================");

    // Enable CORS
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") return res.status(200).end();

    const { extensionId } = req.query;

    if (req.method === "POST") {
      // 🆕 NOUVEAU: Détecter le format CVE depuis n8n
      if (req.body && req.body.results && Array.isArray(req.body.results)) {
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
      if (req.body && (req.body.finalScore || req.body.analysis)) {
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

      // 🔧 RECOVERY SYSTEM pour les formats non reconnus
      console.log("❌ FORMAT NON RECONNU - Tentative de recovery...");

      if (req.body && typeof req.body === "object") {
        // Si le body contient des données CVE quelconques
        if (
          req.body.summary ||
          req.body.cve_id ||
          req.body.title ||
          req.body.extensionId
        ) {
          console.log("🔧 TENTATIVE RECOVERY du payload n8n");

          // Créer un faux array results si inexistant
          const results = req.body.results || [req.body];
          let recoveredCount = 0;

          results.forEach((result, index) => {
            if (result && typeof result === "object") {
              const extId = result.extensionId || "mapped";

              if (!cveResults.has(extId)) {
                cveResults.set(extId, []);
              }

              const recoveredResult = {
                ...result,
                receivedAt: new Date().toISOString(),
                processedBy: "n8n-recovery",
                recovered: true,
              };

              cveResults.get(extId).push(recoveredResult);
              recoveredCount++;

              console.log(
                `🔧 RECOVERY: Stored ${
                  result.cve_id || result.title || "UNKNOWN"
                } for ${extId}`
              );
            }
          });

          if (recoveredCount > 0) {
            return res.json({
              success: true,
              recovered: true,
              stored: recoveredCount,
              type: "recovery_mode",
              originalBody: req.body,
            });
          }
        }
      }

      // Dernière chance - log tout et retourner erreur
      console.log("❌ IMPOSSIBLE DE TRAITER CE PAYLOAD");
      return res.status(400).json({
        success: false,
        error: "Invalid request format",
        receivedMethod: req.method,
        receivedBody: req.body,
        bodyType: typeof req.body,
        bodyKeys: req.body ? Object.keys(req.body) : "null",
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
          // 🔧 NE PAS SUPPRIMER pour debug: cveResults.delete(extensionId);
          console.log(
            `✅ Delivered ${results.length} CVE results to ${extensionId} (KEPT FOR DEBUG)`
          );
          console.log(
            "📋 Results delivered:",
            JSON.stringify(results, null, 2)
          );
        }

        return res.json({
          success: true,
          extensionId,
          results,
          count: results.length,
          timestamp: new Date().toISOString(),
          hasMore: results.length > 0,
          debug: {
            allStoredExtensions: Array.from(cveResults.keys()),
            totalStoredResults: Array.from(cveResults.values()).reduce(
              (total, arr) => total + arr.length,
              0
            ),
          },
        });
      } else {
        // 🔄 ANCIEN SYSTÈME: Extension polls for result
        const result = extensionResults.get(extensionId);
        console.log(
          `📊 Extension ${extensionId} polling legacy: ${
            result ? "found" : "none"
          }`
        );
        return res.json({
          result: result || null,
          debug: {
            legacyExtensions: Array.from(extensionResults.keys()),
          },
        });
      }
    }

    res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("❌ API CRITICAL ERROR:", error);
    console.error("Error stack:", error.stack);

    return res.status(500).json({
      success: false,
      error: "Internal server error",
      message: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
}
