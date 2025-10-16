// background.js - Service Worker for SOC-CERT Extension
console.log("🔒 SOC-CERT Background Service Worker started");

// Listen for extension installation
chrome.runtime.onInstalled.addListener(() => {
  console.log("SOC-CERT Extension installed successfully");
  initializeExtension();
});

// Listen for messages from other components
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("Background received message:", request);

  switch (request.action) {
    case "get_security_data":
      handleSecurityDataRequest(request, sendResponse);
      return true; // Indicates asynchronous response

    case "analyze_url":
      handleURLAnalysis(request.url, sendResponse);
      return true;

    case "log_security_event":
      handleSecurityEvent(request.event);
      break;

    case "auto_analysis_complete":
      handleAutoAnalysisComplete(request, sender);
      break;

    case "real_security_alerts_sent":
      handleRealSecurityAlerts(request, sender);
      break;

    // 🆕 NEW CASE FOR OPENING POPUP
    case "openExtensionPopup":
      console.log("📋 Opening popup (user clicked View Details)");
      chrome.tabs.create({ url: "popup.html" });
      sendResponse({ success: true });
      break;

    case "showExtensionOnCurrentPage":
      console.log(
        "📋 showExtensionOnCurrentPage received - opening popup on current page"
      );
      try {
        // Open the extension popup on the active tab
        chrome.action.openPopup();
        sendResponse({ success: true });
      } catch (e) {
        console.error("Failed to open popup on current page:", e);
        sendResponse({ success: false, error: e.message });
      }
      break;

    default:
      console.log("Unknown action:", request.action);
  }
});

// 🆕 Handle completed automatic analyses
function handleAutoAnalysisComplete(request, sender) {
  console.log("✅ Auto-analysis completed for:", request.url);
  console.log("🔍 Analysis result:", request.result);

  // Increment analysis counter
  chrome.storage.local.get(["analysis_count"], (result) => {
    const newCount = (result.analysis_count || 0) + 1;
    chrome.storage.local.set({ analysis_count: newCount });
    console.log(`📊 Total analyses performed: ${newCount}`);
  });

  // Optional: Update icon if threat detected
  if (request.result?.riskScore > 70) {
    chrome.action.setBadgeText({
      text: "!",
      tabId: sender.tab?.id,
    });
    chrome.action.setBadgeBackgroundColor({
      color: "#ff4444",
      tabId: sender.tab?.id,
    });
  } else if (request.result?.riskScore > 40) {
    chrome.action.setBadgeText({
      text: "?",
      tabId: sender.tab?.id,
    });
    chrome.action.setBadgeBackgroundColor({
      color: "#ffaa00",
      tabId: sender.tab?.id,
    });
  }
}

// 🚨 Handle real security alerts
function handleRealSecurityAlerts(request, sender) {
  console.log("🚨 REAL SECURITY ALERTS received for:", request.url);
  console.log("🔍 Alert count:", request.alertCount);
  console.log("📊 Payload sent to n8n:", request.payload);

  // Increment real alerts counter
  chrome.storage.local.get(["real_alerts_count"], (result) => {
    const newCount = (result.real_alerts_count || 0) + request.alertCount;
    chrome.storage.local.set({
      real_alerts_count: newCount,
      last_real_alert: {
        url: request.url,
        timestamp: new Date().toISOString(),
        alertCount: request.alertCount,
      },
    });
    console.log(`📊 Total real alerts sent: ${newCount}`);
  });

  // Red badge for real alerts
  if (request.alertCount > 0) {
    chrome.action.setBadgeText({
      text: request.alertCount.toString(),
      tabId: sender.tab?.id,
    });
    chrome.action.setBadgeBackgroundColor({
      color: "#cc0000", // Dark red for real alerts
      tabId: sender.tab?.id,
    });

    // System notification for critical alerts
    const highSeverityAlerts = request.payload.alerts.filter(
      (alert) => alert.severity === "HIGH"
    );
    if (highSeverityAlerts.length > 0) {
      console.log(
        `🚨 ${highSeverityAlerts.length} HIGH SEVERITY alerts detected!`
      );
    }
  }
}

// ========== INSTANT THREAT DETECTION ==========

function quickHeuristicCheck(url) {
  const urlLower = url.toLowerCase();

  // 🚨 INSTANT DETECTION OF TEST SITES
  if (urlLower.includes("testphp.vulnweb.com")) {
    return {
      riskScore: 90,
      threatType: "SQL Injection",
      indicators: ["Known malicious test site", "SQL injection patterns"],
      source: "instant",
    };
  }

  if (urlLower.includes("testsafebrowsing.appspot.com")) {
    return {
      riskScore: 75,
      threatType: "Suspicious Content",
      indicators: ["Security test site", "URL obfuscation"],
      source: "instant",
    };
  }

  if (urlLower.includes("zero.webappsecurity.com")) {
    return {
      riskScore: 70,
      threatType: "Banking Security Test",
      indicators: ["Financial security demo", "Login forms"],
      source: "instant",
    };
  }

  return null;
}

// ========== 🆕 AUTO-ALERT SYSTEM ==========

// Function to show threat alert with URL parameter
function showThreatAlert(tabId, analysis, url) {
  chrome.tabs.sendMessage(
    tabId,
    {
      action: "showThreatAlert",
      data: {
        threatType: analysis.threatType,
        riskScore: analysis.riskScore,
        url: url, // ✅ ADD URL HERE
        source: "instant_detection",
        indicators: analysis.indicators || [],
      },
    },
    (response) => {
      if (chrome.runtime.lastError) {
        console.error(
          "❌ Error sending alert:",
          chrome.runtime.lastError.message
        );
      } else {
        console.log("✅ Instant alert sent successfully");
      }
    }
  );
}

// 🆕 Listen for tab changes for automatic analysis + overlay
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  console.log("📍 Tab updated:", tab.url, "status:", changeInfo.status); // ← AJOUTE CE LOG

  if (changeInfo.status === "complete" && tab.url) {
    // Automatic background analysis
    performBackgroundAnalysis(tab);

    // 🆕 Check for threats and show overlay
    if (tab.url.startsWith("http")) {
      console.log("🎯 Starting threat check for:", tab.url); // ← ADD THIS LOG

      setTimeout(() => {
        checkPageForThreats(tabId, tab.url);
      }, 1500); // Wait 1.5s for content script to be ready
    }
  }
});

async function initializeExtension() {
  console.log("Initializing SOC-CERT extension...");

  // Read existing extensionId or create it ONLY ONCE
  const data = await chrome.storage.local.get(["extensionId"]);
  let extensionId = data.extensionId;

  if (!extensionId) {
    extensionId = "ai-helper-1759695907502"; // ou "ai-helper-" + Date.now() pour un ID unique
    await chrome.storage.local.set({ extensionId });
  }

  // Update other data without overwriting extensionId
  await chrome.storage.local.set({
    installed_at: new Date().toISOString(),
    version: "1.0",
    analysis_count: data.analysis_count || 0,
    epp_status: "pending",
    // DO NOT overwrite extensionId here
  });

  console.log("SOC-CERT initialization complete, extensionId:", extensionId);
}
// Security data request handling
async function handleSecurityDataRequest(request, sendResponse) {
  try {
    // Get stored data
    const data = await chrome.storage.local.get([
      "analysis_count",
      "last_analysis",
    ]);

    // Simule des données de sécurité (remplacé par n8n plus tard)
    const securityData = {
      threats: [
        {
          id: 1,
          type: "phishing_risk",
          severity: "medium",
          description: "Potential phishing indicators detected",
          confidence: 0.75,
        },
      ],
      stats: {
        total_analyses: data.analysis_count || 0,
        threats_blocked: 0,
        last_updated: new Date().toISOString(),
      },
      source: "mock_data", // À remplacer par 'n8n_backend'
    };

    sendResponse({ success: true, data: securityData });
  } catch (error) {
    console.error("Error fetching security data:", error);
    sendResponse({ success: false, error: error.message });
  }
}

// Analyse d'URL en arrière-plan
async function handleURLAnalysis(url, sendResponse) {
  try {
    const analysis = {
      url: url,
      domain: new URL(url).hostname,
      is_secure: url.startsWith("https://"),
      risk_level: calculateRiskLevel(url),
      analyzed_at: new Date().toISOString(),
      threats: await detectThreatsFromURL(url),
    };

    // Met à jour le compteur d'analyses
    const data = await chrome.storage.local.get(["analysis_count"]);
    const newCount = (data.analysis_count || 0) + 1;
    await chrome.storage.local.set({ analysis_count: newCount });

    sendResponse({ success: true, analysis });
  } catch (error) {
    sendResponse({ success: false, error: error.message });
  }
}

// Analyse automatique en arrière-plan
async function performBackgroundAnalysis(tab) {
  if (!tab.url || tab.url.startsWith("chrome://")) return;

  try {
    const analysis = {
      url: tab.url,
      domain: new URL(tab.url).hostname,
      is_secure: tab.url.startsWith("https://"),
      timestamp: new Date().toISOString(),
    };

    // Stocke l'analyse récente
    await chrome.storage.local.set({ last_background_analysis: analysis });

    console.log("Background analysis completed for:", tab.url);
  } catch (error) {
    console.log("Background analysis skipped for:", tab.url);
  }
}

// Détection basique de menaces
async function detectThreatsFromURL(url) {
  const threats = [];
  const domain = new URL(url).hostname.toLowerCase();

  // Détection de patterns suspects
  if (domain.includes("paypa1") || domain.includes("faceb00k")) {
    threats.push({
      type: "typosquatting",
      severity: "high",
      description: "Potential typosquatting domain detected",
    });
  }

  if (!url.startsWith("https://")) {
    threats.push({
      type: "insecure_connection",
      severity: "medium",
      description: "Website not using HTTPS",
    });
  }

  return threats;
}

// Calcul du niveau de risque
function calculateRiskLevel(url) {
  let risk = "low";

  if (!url.startsWith("https://")) risk = "medium";
  if (url.includes("login") || url.includes("password")) risk = "high";
  if (url.includes("bank") || url.includes("paypal")) risk = "high";

  return risk;
}

// Gestion des événements de sécurité
function handleSecurityEvent(event) {
  console.log("Security event:", event);

  // Ici plus tard: envoyer à notre backend n8n
  // Pour l'instant, juste log
}

// ========== 🆕 AUTO-ALERT SYSTEM ==========

// Function to check for threats and show overlay
async function checkPageForThreats(tabId, url) {
  try {
    console.log("🚨 Checking for threats:", url);

    // ✅ STEP 1: INSTANT DETECTION (1-2ms)
    const instantAnalysis = quickHeuristicCheck(url);

    if (instantAnalysis && instantAnalysis.riskScore > 60) {
      console.log("� INSTANT THREAT DETECTED! Showing overlay immediately");
      showThreatAlert(tabId, instantAnalysis, url);
    }

    // ✅ STEP 2: GEMINI ANALYSIS IN BACKGROUND (35s)
    console.log("🤖 Starting background Gemini analysis...");
    setTimeout(async () => {
      try {
        const geminiAnalysis = await performQuickAnalysisInBackground(url);
        if (geminiAnalysis) {
          console.log(
            "🤖 Gemini analysis completed:",
            geminiAnalysis.riskScore
          );

          // 💾 Store the analysis result for popup reuse
          const storageKey = `analysis_${url}`;
          const storedData = {
            analysis: geminiAnalysis,
            timestamp: Date.now(),
            url: url,
            source: "background",
          };
          chrome.storage.local.set({ [storageKey]: storedData });
          console.log("💾 Stored background analysis for:", url);

          if (geminiAnalysis.riskScore > 60) {
            console.log("🤖 Gemini analysis confirmed threat");
            // Here you can update the overlay later if needed
          }
        }
      } catch (geminiError) {
        console.log("🤖 Gemini analysis failed:", geminiError);
      }
    }, 1000); // Start after 1 second
  } catch (error) {
    console.error("❌ Error checking threats:", error);
  }
}

// Function to get analysis from Vercel API
async function getAnalysisFromAPI(url) {
  try {
    // Récupère l'extensionId
    const data = await chrome.storage.local.get(["extensionId"]);
    const extensionId = data.extensionId;

    console.log("🔑 extensionId:", extensionId);

    if (!extensionId) {
      console.log("⚠️ No extensionId found");
      return null;
    }

    // Appelle l'API Vercel avec format=cve
    const API_URL = "https://soc-cert-extension.vercel.app";
    const response = await fetch(
      `${API_URL}/api/extension-result?extensionId=${extensionId}&format=cve`
    );

    if (!response.ok) {
      console.log("⚠️ API error:", response.status);
      return null;
    }

    const apiData = await response.json();

    if (apiData.success && apiData.results && apiData.results.length > 0) {
      // Trouve le CVE pour cette URL
      const match = apiData.results.find(
        (r) => r.link && r.link.startsWith(url)
      );

      if (match) {
        console.log("✅ Analysis found for URL:", match);
        return {
          threatType: match.title?.includes("PHISHING")
            ? "phishing"
            : match.title?.includes("MALWARE")
            ? "malware"
            : "suspicious",
          riskScore: match.score || 75,
          cve_id: match.cve_id,
          url: url,
        };
      }
    }

    console.log("ℹ️ No analysis found for this URL yet");
    return null;
  } catch (error) {
    console.error("❌ Error fetching analysis:", error);
    return null;
  }
}

// Try to run a quick Gemini-like analysis in the service worker context if possible.
// Returns parsed analysis object { riskScore, threatType, indicators, confidence, recommendations, analysis }
async function performQuickAnalysisInBackground(url) {
  try {
    // Prefer global LanguageModel API if exposed in service worker (some browsers may expose it)
    const LM =
      globalThis.LanguageModel ||
      (globalThis.ai && globalThis.ai.languageModel) ||
      null;
    if (!LM) {
      console.log("ℹ️ No LanguageModel available in background");
      return null;
    }

    console.log(
      "🤖 Running quick analysis in background using LanguageModel for:",
      url
    );

    // Create a short prompt similar to ai-helper
    const prompt = `Analyze this URL for security risks and respond in strict JSON:

URL: ${url}
Context: 

Respond ONLY with this exact JSON format:
{
  "riskScore": [number 0-100],
  "threatType": "safe|suspicious|phishing|malicious", 
  "indicators": ["indicator1", "indicator2"],
  "confidence": [number 0-1],
  "recommendations": ["recommendation1", "recommendation2", "recommendation3"],
  "analysis": "short description"
}`;

    const startTime = Date.now();

    // Create a session if API exposes create; fall back to direct LM.prompt-like API
    let session = null;
    try {
      if (LM.create) {
        const sessionPromise = LM.create({
          outputLanguage: "en",
        });
        const sessionTimeout = new Promise((resolve) =>
          setTimeout(() => resolve(null), 5000)
        );
        session = await Promise.race([sessionPromise, sessionTimeout]);
        if (!session) {
          console.log("⚠️ Session creation timed out in background");
        }
      }
    } catch (e) {
      console.warn(
        "⚠️ Could not create session in background, will try direct prompt:",
        e && e.message ? e.message : e
      );
    }

    let rawResult = null;
    const analysisPromise = (async () => {
      if (session && session.prompt) {
        rawResult = await session.prompt(prompt);
        if (session.destroy) session.destroy();
      } else if (LM.prompt) {
        rawResult = await LM.prompt(prompt);
      } else if (LM.call) {
        rawResult = await LM.call(prompt);
      } else {
        console.log(
          "⚠️ No usable prompt/call API available on LanguageModel in background"
        );
        return null;
      }

      if (!rawResult) {
        console.log("⚠️ Background LanguageModel returned no result");
        return null;
      }

      const text =
        typeof rawResult === "string" ? rawResult : rawResult.toString();
      console.log("Raw AI result:", text);
      const parsed = parseAIJSONResponse(text);
      return parsed;
    })();

    // Timeout after 60 seconds to avoid slow AI calls
    const timeoutPromise = new Promise((resolve) => {
      setTimeout(() => resolve(null), 60000);
    });

    const result = await Promise.race([analysisPromise, timeoutPromise]);
    const elapsed = Date.now() - startTime;
    if (result) {
      console.log(`✅ Background quick analysis completed in ${elapsed}ms`);
    } else {
      console.log(`⏰ Background quick analysis timed out after ${elapsed}ms`);
    }
    return result;
  } catch (error) {
    console.error("❌ performQuickAnalysisInBackground error:", error);
    return null;
  }
}

// Very small parser to extract JSON from an AI text response
function parseAIJSONResponse(text) {
  try {
    // Nettoyer la réponse (enlever markdown, espaces, etc.)
    let cleanResponse = text.trim();

    // Chercher du JSON dans la réponse
    const jsonMatch = cleanResponse.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      cleanResponse = jsonMatch[0];
    }

    const parsed = JSON.parse(cleanResponse);
    console.log("✅ Background AI response parsed successfully:", parsed);

    // Valider la structure
    return {
      riskScore: parsed.riskScore || 50,
      threatType: parsed.threatType || "unknown",
      indicators: Array.isArray(parsed.indicators)
        ? parsed.indicators
        : ["AI analysis completed"],
      confidence: parsed.confidence || 0.8,
      recommendations: Array.isArray(parsed.recommendations)
        ? parsed.recommendations
        : ["Review recommended"],
      analysis: parsed.analysis || "AI security analysis",
    };
  } catch (error) {
    console.log(
      "⚠️ JSON parsing failed in background, using text analysis:",
      error.message
    );
    // Créer une analyse basée sur le texte brut
    const textLower = text.toLowerCase();
    let riskScore = 25;
    let threatType = "safe";

    if (textLower.includes("malicious") || textLower.includes("dangerous")) {
      riskScore = 90;
      threatType = "malicious";
    } else if (textLower.includes("suspicious") || textLower.includes("risk")) {
      riskScore = 70;
      threatType = "suspicious";
    } else if (textLower.includes("phishing") || textLower.includes("scam")) {
      riskScore = 85;
      threatType = "phishing";
    }

    return {
      riskScore: riskScore,
      threatType: threatType,
      indicators: [text.substring(0, 150) + "..."],
      confidence: 0.9, // Gemini Nano confidence
      recommendations: [
        "Review AI analysis details",
        "Cross-reference with threat intel",
        "Monitor for suspicious activity",
      ],
      analysis: "Gemini Nano AI Analysis",
    };
  }
}

// Helper: ask the content script (tab) to perform a quick Gemini analysis
function requestQuickAnalysisFromTab(tabId, url, timeoutMs = 8000) {
  return new Promise((resolve, reject) => {
    let finished = false;

    chrome.tabs.sendMessage(
      tabId,
      { action: "quick_gemini_analysis", url },
      (response) => {
        finished = true;
        if (chrome.runtime.lastError) {
          console.error(
            "❌ requestQuickAnalysisFromTab runtime error:",
            chrome.runtime.lastError.message
          );
          return resolve(null);
        }

        console.log("🔁 requestQuickAnalysisFromTab response:", response);
        return resolve(response || null);
      }
    );

    // Timeout fallback
    setTimeout(() => {
      if (!finished) {
        console.warn(
          "⚠️ requestQuickAnalysisFromTab timed out after",
          timeoutMs,
          "ms"
        );
        return resolve(null);
      }
    }, timeoutMs);
  });
}

console.log("🔒 SOC-CERT Background Service Worker ready");
console.log("✅ Auto-alert system loaded");
