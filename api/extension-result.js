// Temporary in-memory storage (use DB in production)
const extensionResults = new Map();
const cveResults = new Map(); // 🆕 NOUVEAU: Pour les CVE

import { createGunzip } from "zlib";

export default async function handler(req, res) {
  // 🚨 LOG GLOBAL IMMÉDIAT - CAPTURE TOUT
  const globalTimestamp = new Date().toISOString();
  console.log(`🚨 GLOBAL REQUEST INTERCEPTED ${globalTimestamp}`);
  console.log(`🚨 METHOD: ${req.method}, URL: ${req.url}`);
  console.log(`🚨 USER-AGENT: ${req.headers?.["user-agent"] || "N/A"}`);
  console.log(
    `🚨 CONTENT-ENCODING: ${req.headers?.["content-encoding"] || "N/A"}`
  );

  // 🔧 GZIP SUPPORT - Décompresser si nécessaire
  if (req.headers["content-encoding"] === "gzip") {
    console.log("🗜️ GZIP DETECTED - Décompression en cours...");
    // Note: Vercel peut gérer cela automatiquement, mais on log pour debug
  }

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

    if (req.method === "OPTIONS") {
      return res.status(200).end();
    }

    const { extensionId = "mapped" } = req.query;

    if (req.method === "POST") {
      console.log("🔍 POST REQUEST - DETECTING FORMAT...");

      // 🆕 NOUVEAU FORMAT: {results: [{cve_id, title, severity, ...}]}
      if (req.body && req.body.results && Array.isArray(req.body.results)) {
        console.log(
          `✅ NOUVEAU FORMAT DÉTECTÉ: ${req.body.results.length} résultats CVE`
        );
        console.log(
          "📋 CVE Results:",
          JSON.stringify(req.body.results, null, 2)
        );

        // Stocker par extensionId avec fallback
        req.body.results.forEach((result) => {
          const targetId =
            result.extensionId || result.original_data?.extensionId || "mapped";

          if (!cveResults.has(targetId)) {
            cveResults.set(targetId, []);
          }

          // Ajouter timestamp de réception
          const enrichedResult = {
            ...result,
            receivedAt: new Date().toISOString(),
            processedBy: "api-storage",
          };

          cveResults.get(targetId).push(enrichedResult);
          console.log(
            `📥 CVE stocké pour extension ${targetId}:`,
            enrichedResult.cve_id
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

          // Construire un CVE de recovery
          const recoveryData = {
            timestamp: new Date().toISOString(),
            title:
              req.body.title ||
              req.body.summary ||
              "Security Threat: Unknown URL",
            link: req.body.link || "https://extension-alert.local",
            severity: req.body.severity || "High",
            score: req.body.score || 70,
            text:
              req.body.text ||
              "Real-time security analysis by SOC-CERT Chrome Extension",
            status: "New",
            source: req.body.source || "Unknown",
            cve_id:
              req.body.cve_id ||
              `CVE-${new Date().getFullYear()}-${
                Math.floor(Math.random() * 90000) + 10000
              }`,
            receivedAt: new Date().toISOString(),
            processedBy: "n8n-recovery",
            recovered: true,
          };

          // Stockage
          if (!cveResults.has(extensionId)) {
            cveResults.set(extensionId, []);
          }
          cveResults.get(extensionId).push(recoveryData);

          console.log("🔧 RECOVERY SUCCESS - CVE généré:", recoveryData);

          return res.json({
            success: true,
            type: "recovery",
            recovered: recoveryData,
          });
        }
      }

      return res.status(400).json({
        error: "Format non reconnu",
        received: req.body,
        bodyType: typeof req.body,
        bodyKeys: req.body ? Object.keys(req.body) : "null",
      });
    }

    if (req.method === "GET") {
      const { format, clear } = req.query; // Ajouter ?clear=true

      // 🧹 NOUVEAU: Clear cache endpoint
      if (clear === "true") {
        const clearedCVE = cveResults.size;
        const clearedLegacy = extensionResults.size;

        cveResults.clear();
        extensionResults.clear();

        console.log(
          `🧹 CACHE CLEARED: ${clearedCVE} CVE extensions, ${clearedLegacy} legacy extensions`
        );

        return res.json({
          success: true,
          action: "cache_cleared",
          clearedCVE,
          clearedLegacy,
          timestamp: new Date().toISOString(),
        });
      }

      if (format === "cve") {
        // 🆕 NOUVEAU: Retourner les résultats CVE
        const results = cveResults.get(extensionId) || [];

        console.log(
          `📊 Extension ${extensionId} polling CVE: ${results.length} results available`
        );

        if (results.length > 0) {
          // 🔄 GARDER EN CACHE pour 60 secondes au lieu de supprimer
          setTimeout(() => {
            cveResults.delete(extensionId);
            console.log(`🧹 Cache CVE expiré pour ${extensionId} après 60s`);
          }, 60000);

          console.log(
            `✅ Delivered ${results.length} CVE results to ${extensionId} (CACHE GARDÉ 60s)`
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
            allStoredExtensions: [...cveResults.keys()],
            totalStoredResults: [...cveResults.values()].flat().length,
          },
        });
      }

      // 🔄 ANCIEN FORMAT (garde compatibilité)
      const result = extensionResults.get(extensionId);

      if (result) {
        console.log("Legacy result found for extension:", extensionId);
        return res.json({
          success: true,
          result,
        });
      }

      console.log("No results found for extension:", extensionId);
      return res.json({
        success: false,
        error: "No results found",
        extensionId,
        availableExtensions: [...extensionResults.keys()],
        availableCVEExtensions: [...cveResults.keys()],
      });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("API Error:", error);
    return res.status(500).json({
      error: "Internal server error",
      details: error.message,
      timestamp: new Date().toISOString(),
    });
  }
}
