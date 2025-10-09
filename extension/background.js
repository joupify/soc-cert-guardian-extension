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

    case "auto_analysis_complete":
      handleAutoAnalysisComplete(request, sender);
      break;

    case "real_security_alerts_sent":
      handleRealSecurityAlerts(request, sender);
      break;

    // 🆕 NOUVEAU CASE POUR OUVRIR POPUP
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

// 🆕 Gérer les analyses automatiques complétées
function handleAutoAnalysisComplete(request, sender) {
  console.log("✅ Auto-analysis completed for:", request.url);
  console.log("🔍 Analysis result:", request.result);

  // Incrémenter le compteur d'analyses
  chrome.storage.local.get(["analysis_count"], (result) => {
    const newCount = (result.analysis_count || 0) + 1;
    chrome.storage.local.set({ analysis_count: newCount });
    console.log(`📊 Total analyses performed: ${newCount}`);
  });

  // Optionnel: Mettre à jour l'icône si menace détectée
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

// 🚨 Gérer les vraies alertes de sécurité
function handleRealSecurityAlerts(request, sender) {
  console.log("🚨 REAL SECURITY ALERTS received for:", request.url);
  console.log("🔍 Alert count:", request.alertCount);
  console.log("📊 Payload sent to n8n:", request.payload);

  // Incrémenter le compteur d'alertes réelles
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

  // Badge rouge pour alertes réelles
  if (request.alertCount > 0) {
    chrome.action.setBadgeText({
      text: request.alertCount.toString(),
      tabId: sender.tab?.id,
    });
    chrome.action.setBadgeBackgroundColor({
      color: "#cc0000", // Rouge foncé pour alertes réelles
      tabId: sender.tab?.id,
    });

    // Notification système pour alertes critiques
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

// 🆕 Écoute les changements d'onglets pour analyse automatique + overlay
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  console.log("📍 Tab updated:", tab.url, "status:", changeInfo.status); // ← AJOUTE CE LOG

  if (changeInfo.status === "complete" && tab.url) {
    // Analyse automatique en arrière-plan
    performBackgroundAnalysis(tab);

    // 🆕 Vérifie les menaces et affiche overlay
    if (tab.url.startsWith("http")) {
      console.log("🎯 Starting threat check for:", tab.url); // ← AJOUTE CE LOG

      setTimeout(() => {
        checkPageForThreats(tabId, tab.url);
      }, 1500); // Attends 1.5s que le content script soit prêt
    }
  }
});

async function initializeExtension() {
  console.log("Initializing SOC-CERT extension...");

  // Lis l'extensionId existant ou crée-le UNE SEULE FOIS
  const data = await chrome.storage.local.get(["extensionId"]);
  let extensionId = data.extensionId;

  if (!extensionId) {
    extensionId = "ai-helper-1759695907502"; // ou "ai-helper-" + Date.now() pour un ID unique
    await chrome.storage.local.set({ extensionId });
  }

  // Mets à jour les autres données sans écraser extensionId
  await chrome.storage.local.set({
    installed_at: new Date().toISOString(),
    version: "1.0",
    analysis_count: data.analysis_count || 0,
    epp_status: "pending",
    // NE PAS écraser extensionId ici
  });

  console.log("SOC-CERT initialization complete, extensionId:", extensionId);
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

// ========== 🆕 AUTO-ALERT SYSTEM ==========

// Fonction pour vérifier les menaces et afficher l'overlay
async function checkPageForThreats(tabId, url) {
  try {
    console.log("🚨 Checking for threats:", url);

    // Récupère l'analyse depuis Vercel API
    const analysis = await getAnalysisFromAPI(url);

    if (analysis && analysis.riskScore > 60) {
      console.log("🚨 THREAT DETECTED! Showing alert...");

      // 1. Envoie au content script pour afficher overlay
      chrome.tabs.sendMessage(
        tabId,
        {
          action: "showThreatAlert",
          data: {
            threatType: analysis.threatType || "suspicious",
            riskScore: analysis.riskScore || 75,
            cve_id: analysis.cve_id || null,
            url: url,
          },
        },
        (response) => {
          if (chrome.runtime.lastError) {
            console.error(
              "❌ Error sending message:",
              chrome.runtime.lastError.message
            );
          } else {
            console.log("✅ Alert sent successfully:", response);
          }
        }
      );

      // 2. Notification système
      try {
        chrome.notifications.create({
          type: "basic",
          iconUrl: "icons/icon.png",
          title: "🚨 SOC-CERT Threat Alert",
          message: `Risk Score: ${analysis.riskScore}/100 - ${analysis.threatType}`,
          priority: 2,
        });
      } catch (notifError) {
        console.log("⚠️ Notification skipped:", notifError.message);
      }

      // 3. Badge rouge sur l'icône
      chrome.action.setBadgeText({ text: "!", tabId: tabId });
      chrome.action.setBadgeBackgroundColor({ color: "#FF0000", tabId: tabId });
    } else {
      console.log("✅ No threat detected for:", url);
      // Efface le badge si pas de menace
      chrome.action.setBadgeText({ text: "", tabId: tabId });
    }
  } catch (error) {
    console.error("❌ Error checking threats:", error);
  }
}

// Fonction pour récupérer l'analysis depuis l'API Vercel
async function getAnalysisFromAPI(url) {
  try {
    // Récupère l'extensionId
    const data = await chrome.storage.local.get(["extensionId"]);
    const extensionId = data.extensionId;

    console.log("🔑 extensionId:", extensionId); // ← AJOUTE CE LOG

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

console.log("🔒 SOC-CERT Background Service Worker ready");
console.log("✅ Auto-alert system loaded");
