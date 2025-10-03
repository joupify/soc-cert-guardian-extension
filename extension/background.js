// background.js - Service Worker pour SOC-CERT Extension
console.log("🔒 SOC-CERT Background Service Worker started");

// Écoute l'installation de l'extension
chrome.runtime.onInstalled.addListener(() => {
  console.log("SOC-CERT Extension installed successfully");
  initializeExtension();
});

// Écoute les messages des autres composants
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("Background received message:", request);

  switch (request.action) {
    case "get_security_data":
      handleSecurityDataRequest(request, sendResponse);
      return true; // Indique réponse asynchrone

    case "analyze_url":
      handleURLAnalysis(request.url, sendResponse);
      return true;

    case "log_security_event":
      handleSecurityEvent(request.event);
      break;

    default:
      console.log("Unknown action:", request.action);
  }
});

// Écoute les changements d'onglets pour analyse automatique
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.url) {
    // Analyse automatique en arrière-plan
    performBackgroundAnalysis(tab);
  }
});

// Initialisation de l'extension
async function initializeExtension() {
  console.log("Initializing SOC-CERT extension...");

  // Stocke les données d'initialisation
  await chrome.storage.local.set({
    installed_at: new Date().toISOString(),
    version: "1.0",
    analysis_count: 0,
    epp_status: "pending",
  });

  console.log("SOC-CERT initialization complete");
}

// Gestion des requêtes de données de sécurité
async function handleSecurityDataRequest(request, sendResponse) {
  try {
    // Récupère les données stockées
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

console.log("🔒 SOC-CERT Background Service Worker ready");
