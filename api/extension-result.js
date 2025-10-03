import { kv } from "@vercel/kv";

const RESULTS_PREFIX = "extension-results:";
const RESULTS_TTL = 300; // 5 minutes TTL

export default async function handler(req, res) {
  const timestamp = new Date().toISOString();
  console.log(`=== API REQUEST ${timestamp} ===`);
  console.log("Method:", req.method);
  console.log("URL:", req.url);
  console.log("Query:", JSON.stringify(req.query, null, 2));

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  const { extensionId = "mapped" } = req.query;

  try {
    if (req.method === "POST") {
      console.log("🔍 POST REQUEST - DETECTING FORMAT...");

      // Format: {results: [{cve_id, title, ...}]} ou single result
      let results = [];

      if (req.body?.results && Array.isArray(req.body.results)) {
        results = req.body.results;
        console.log(`✅ ARRAY FORMAT: ${results.length} CVE results`);
      } else if (req.body?.cve_id || req.body?.title) {
        // Single result
        results = [req.body];
        console.log("✅ SINGLE RESULT FORMAT");
      }

      if (results.length === 0) {
        return res.status(400).json({
          error: "No valid results",
          received: req.body,
        });
      }

      // Stockage dans KV par extensionId
      const storedExtensions = new Set();

      for (const result of results) {
        const targetId =
          result.extensionId ||
          result.original_data?.extensionId ||
          extensionId;

        const enrichedResult = {
          ...result,
          receivedAt: timestamp,
          processedBy: "api-storage",
        };

        // Récupère les résultats existants
        const key = `${RESULTS_PREFIX}${targetId}`;
        let existing = (await kv.get(key)) || [];

        // Ajoute le nouveau
        existing.push(enrichedResult);

        // Sauvegarde avec TTL
        await kv.set(key, existing, { ex: RESULTS_TTL });

        storedExtensions.add(targetId);
        console.log(`📥 CVE stocké pour ${targetId}: ${enrichedResult.cve_id}`);
      }

      return res.json({
        success: true,
        stored: results.length,
        type: "cve_results",
        extensions: [...storedExtensions],
      });
    }

    if (req.method === "GET") {
      const { format } = req.query;

      if (format === "cve") {
        const key = `${RESULTS_PREFIX}${extensionId}`;
        const results = (await kv.get(key)) || [];

        console.log(
          `📊 Extension ${extensionId} polling CVE: ${results.length} results`
        );

        if (results.length > 0) {
          console.log("✅ Results found:", JSON.stringify(results, null, 2));
        }

        // 🔧 Debug: Liste toutes les clés
        const allKeys = await kv.keys(`${RESULTS_PREFIX}*`);
        console.log("🔍 All stored keys:", allKeys);

        return res.json({
          success: true,
          extensionId,
          results,
          count: results.length,
          timestamp,
          hasMore: results.length > 0,
          debug: {
            allStoredExtensions: allKeys.map((k) =>
              k.replace(RESULTS_PREFIX, "")
            ),
            totalStoredResults: results.length,
          },
        });
      }

      return res.status(400).json({ error: "format=cve required" });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("API Error:", error);
    return res.status(500).json({
      error: "Internal server error",
      details: error.message,
      timestamp,
    });
  }
}
