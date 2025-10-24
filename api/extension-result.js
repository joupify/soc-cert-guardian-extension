import { kv } from "@vercel/kv";

const RESULTS_PREFIX = "extension-results:";
const RESULTS_TTL = 3600; // 1 hour

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

        // Retrieve existing results
        const key = `${RESULTS_PREFIX}${targetId}`;
        let existing = (await kv.get(key)) || [];

        // Add the new result
        existing.push(enrichedResult);

        // ✅ SORT BY TIMESTAMP (MOST RECENT FIRST) + LIMIT TO 10
        const sorted = existing
          .sort((a, b) => {
            const timeA = new Date(a.timestamp || a.receivedAt || 0).getTime();
            const timeB = new Date(b.timestamp || b.receivedAt || 0).getTime();
            return timeB - timeA; // Most recent first
          })
          .slice(0, 10); // Keep the 10 most recent

        // Save back to KV with TTL
        await kv.set(key, sorted, { ex: RESULTS_TTL });

        storedExtensions.add(targetId);
        console.log(`📥 CVE stocké pour ${targetId}: ${enrichedResult.cve_id}`);
        console.log(
          `   Total résultats: ${sorted.length}, Plus récent: ${
            sorted[0].link || sorted[0].url
          }`
        );
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
        let results = (await kv.get(key)) || [];

        console.log(
          `📊 Extension ${extensionId} polling CVE: ${results.length} results`
        );

        // ✅ SORT BY TIMESTAMP (MOST RECENT FIRST)
        const sortedResults = results.sort((a, b) => {
          const timeA = new Date(a.timestamp || a.receivedAt || 0).getTime();
          const timeB = new Date(b.timestamp || b.receivedAt || 0).getTime();
          return timeB - timeA;
        });

        if (sortedResults.length > 0) {
          console.log("✅ Results found (sorted by most recent first):");
          sortedResults.forEach((r, i) => {
            console.log(
              `  ${i}: ${r.link || r.url} - ${r.timestamp || r.receivedAt}`
            );
          });
        }

        // 🔧 Debug: List all keys
        const allKeys = await kv.keys(`${RESULTS_PREFIX}*`);
        console.log("🔍 All stored keys:", allKeys);

        return res.json({
          success: true,
          extensionId,
          results: sortedResults, // ✅ Sorted by timestamp
          latestResult: sortedResults[0] || null, // ✅ Most recent
          count: sortedResults.length,
          timestamp,
          hasMore: sortedResults.length > 1,
          debug: {
            allStoredExtensions: allKeys.map((k) =>
              k.replace(RESULTS_PREFIX, "")
            ),
            totalStoredResults: sortedResults.length,
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
