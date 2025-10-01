// popup.js - Version corrigée et simplifiée
document.addEventListener("DOMContentLoaded", function () {
  console.log("🔒 SOC-CERT Extension loaded - DOM ready");

  // Attendre que tous les scripts soient chargés
  setTimeout(initializePopup, 100);
});

async function initializePopup() {
  try {
    // Vérifier que aiHelper est disponible
    if (typeof aiHelper === "undefined") {
      console.log("⏳ Waiting for AI Helper to load...");
      setTimeout(initializePopup, 100);
      return;
    }

    console.log("✅ AI Helper ready:", aiHelper.hasNativeAI);

    // Affiche le statut EPP
    const statusElement = document.getElementById("status");
    statusElement.innerHTML = aiHelper.hasNativeAI
      ? "✅ Chrome AI APIs Enabled"
      : "🔄 Using Mock AI (EPP Pending)";

    // Analyse la page actuelle
    await analyzeCurrentPage();

    // 🆕 Démarrer le polling CVE
    await startCVEPolling();
  } catch (error) {
    console.error("Initialization error:", error);
    document.getElementById("status").textContent = "❌ Initialization failed";
  }
}

// Version debug de analyzeCurrentPage
async function analyzeCurrentPage() {
  try {
    console.log("=== 🧪 DEBUG ANALYSIS ===");

    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });

    console.log("📋 Tab info:", {
      url: tab?.url,
      title: tab?.title,
      id: tab?.id,
    });

    if (tab && tab.url) {
      console.log("🎯 Analyzing URL:", tab.url);

      const threatAnalysis = await aiHelper.analyzeThreat(
        tab.url,
        `Analyzing: ${tab.title}`
      );

      console.log("📊 Analysis result:", threatAnalysis);
      displayThreatAnalysis(threatAnalysis);
    } else {
      console.log("❌ No valid tab found");
      document.getElementById("analysis-content").innerHTML = `
        <div style="background: rgba(255,0,0,0.1); padding: 15px; border-radius: 10px; text-align: center;">
          <h3>❌ No Active Tab</h3>
          <p>Please open a webpage to analyze its security.</p>
        </div>
      `;
    }
  } catch (error) {
    console.error("Analysis error:", error);
    document.getElementById("analysis-content").innerHTML = `
      <div style="background: rgba(255,0,0,0.1); padding: 15px; border-radius: 10px;">
        <h3>❌ Analysis Error</h3>
        <p>${error.message}</p>
      </div>
    `;
  }
}

function displayThreatAnalysis(analysis) {
  const riskConfig = {
    safe: {
      color: "#00ff00",
      icon: "✅",
      label: "Sécurisé",
      bg: "rgba(0,255,0,0.1)",
    },
    suspicious: {
      color: "#ffff00",
      icon: "⚠️",
      label: "Suspect",
      bg: "rgba(255,255,0,0.1)",
    },
    phishing: {
      color: "#ff9900",
      icon: "🎣",
      label: "Phishing",
      bg: "rgba(255,153,0,0.1)",
    },
    "high-risk": {
      color: "#ff5500",
      icon: "🔍",
      label: "Risque Élevé",
      bg: "rgba(255,85,0,0.1)",
    },
    malicious: {
      color: "#ff0000",
      icon: "🚨",
      label: "Malveillant",
      bg: "rgba(255,0,0,0.1)",
    },
  };

  const config = riskConfig[analysis.threatType] || riskConfig.safe;

  const content = document.getElementById("analysis-content");
  content.innerHTML = `
    <div style="background: ${
      config.bg
    }; padding: 15px; border-radius: 10px; margin-bottom: 15px; border-left: 4px solid ${
    config.color
  }">
      <!-- URL analysée -->
      <div style="margin-bottom: 15px; padding: 8px; background: rgba(0,0,0,0.2); border-radius: 5px; font-size: 12px; word-break: break-all;">
        <strong>🌐 URL analysée:</strong><br>${analysis.analyzedUrl}
      </div>

      <!-- En-tête risque -->
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 15px;">
        <div style="display: flex; align-items: center;">
          <span style="font-size: 24px; margin-right: 10px;">${
            config.icon
          }</span>
          <div>
            <div style="font-size: 18px; font-weight: bold;">${
              config.label
            }</div>
            <div style="font-size: 12px; opacity: 0.8;">Confiance: ${(
              analysis.confidence * 100
            ).toFixed(0)}%</div>
          </div>
        </div>
        <div style="text-align: right;">
          <div style="font-size: 28px; font-weight: bold; color: ${
            config.color
          }">${analysis.riskScore}%</div>
          <div style="font-size: 10px; opacity: 0.7;">Score de risque</div>
        </div>
      </div>

      <!-- Indicateurs -->
      ${
        analysis.indicators && analysis.indicators.length > 0
          ? `
        <div style="margin-bottom: 15px;">
          <div style="font-weight: bold; margin-bottom: 8px; display: flex; align-items: center;">
            <span style="margin-right: 5px;">🚨</span> Indicateurs de menace (${
              analysis.indicators.length
            })
          </div>
          <div style="font-size: 12px; background: rgba(0,0,0,0.2); padding: 8px; border-radius: 5px;">
            ${analysis.indicators.map((ind) => `• ${ind}`).join("<br>")}
          </div>
        </div>
      `
          : '<div style="margin-bottom: 15px;">✅ Aucun indicateur suspect détecté</div>'
      }

      <!-- Recommandations -->
      <div>
        <div style="font-weight: bold; margin-bottom: 8px; display: flex; align-items: center;">
          <span style="margin-right: 5px;">💡</span> Recommandations SOC-CERT
        </div>
        <div style="font-size: 12px;">
          ${analysis.recommendations
            .map(
              (rec) => `
            <div style="padding: 5px 0; border-bottom: 1px solid rgba(255,255,255,0.1);">
              ${rec}
            </div>
          `
            )
            .join("")}
        </div>
      </div>

      <!-- Métadonnées -->
      <div style="margin-top: 15px; padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.2); font-size: 10px; opacity: 0.6;">
        <div>⏱️ ${analysis.processingTime} • ${new Date(
    analysis.timestamp
  ).toLocaleTimeString()}</div>
        <div>${analysis.mockNote}</div>
      </div>
    </div>

    <!-- Info AI Status -->
    <div style="background: rgba(255,255,255,0.05); padding: 10px; border-radius: 8px; font-size: 11px; text-align: center;">
      🤖 Powered by SOC-CERT AI ${
        aiHelper.hasNativeAI ? "(Chrome AI)" : "(Mock - EPP Pending)"
      }
    </div>
  `;
}

// 🆕 POLLING CVE SIMPLIFIÉ
async function startCVEPolling() {
  console.log("🔄 Démarrage polling CVE...");

  // Créer container si pas exist
  let container = document.getElementById("alerts-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "alerts-container";
    container.style.cssText =
      "margin-top: 20px; padding: 10px; background: rgba(255,255,255,0.05); border-radius: 8px;";
    document.body.appendChild(container);
  }

  try {
    const url =
      "https://soc-cert-extension.vercel.app/api/extension-result?extensionId=mapped&format=cve";
    console.log("🌐 Fetching CVE data from:", url);

    const response = await fetch(url);
    console.log("📡 Response status:", response.status, response.statusText);

    const data = await response.json();
    console.log("📊 CVE Response:", JSON.stringify(data, null, 2));

    if (data.success && data.results && data.results.length > 0) {
      console.log("✅ CVE Alerts trouvées:", data.results.length);
      displayCVEAlerts(data.results);
    } else {
      console.log("ℹ️ Pas d'alertes CVE disponibles");
      console.log("🔍 Debug info:", {
        success: data.success,
        resultsExist: !!data.results,
        resultsLength: data.results ? data.results.length : "undefined",
        debug: data.debug,
      });

      container.innerHTML = `
        <div style="text-align: center; padding: 20px; color: #888;">
          <h3>🔍 Surveillance CVE Active</h3>
          <p>Aucune nouvelle alerte de sécurité</p>
          <div style="font-size: 12px; margin-top: 10px;">
            Dernière vérification: ${new Date().toLocaleTimeString()}
          </div>
        </div>
      `;
    }
  } catch (error) {
    console.error("❌ Erreur polling CVE:", error);
    container.innerHTML = `
      <div style="background: rgba(255,0,0,0.1); padding: 15px; border-radius: 8px; text-align: center;">
        <h3>⚠️ Erreur Surveillance CVE</h3>
        <p>Impossible de récupérer les alertes</p>
      </div>
    `;
  }
}

// 📱 AFFICHAGE CVE ALERTS - CORRIGÉ
function displayCVEAlerts(alerts) {
  const container = document.getElementById("alerts-container");

  const alertsHTML = alerts
    .map(
      (alert) => `
    <div style="background: rgba(255,255,255,0.9); color: #333; padding: 12px; border-radius: 8px; margin-bottom: 10px; border-left: 4px solid #ff0000;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
        <strong style="color: #cc0000;">${
          alert.cve_id || "EXTENSION-ALERT"
        }</strong>
        <span style="background: #cc0000; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px;">
          ${alert.severity || "Critical"}
        </span>
      </div>
      
      <div style="font-size: 14px; font-weight: bold; margin-bottom: 5px;">
        ${alert.title || "Chrome Extension Security Alert"}
      </div>
      
      <div style="font-size: 12px; color: #666; margin-bottom: 8px;">
        Score: ${alert.score || 100}/100 | Source: ${
        alert.source || "Extension"
      }
      </div>
      
      <div style="font-size: 11px; color: #888;">
        Détecté: ${new Date(
          alert.receivedAt || alert.timestamp
        ).toLocaleString()}
      </div>
      
      ${
        alert.link
          ? `
        <div style="margin-top: 8px;">
          <a href="${alert.link}" target="_blank" style="color: #0066cc; font-size: 11px; text-decoration: none;">
            🔗 Voir détails NVD →
          </a>
        </div>
      `
          : ""
      }
    </div>
  `
    )
    .join("");

  container.innerHTML = `
    <div style="background: linear-gradient(135deg, #ff4444, #cc0000); padding: 15px; border-radius: 10px; margin-bottom: 15px;">
      <h3 style="margin: 0 0 15px 0; color: white; text-align: center;">
        🚨 ALERTES CVE CRITIQUES (${alerts.length})
      </h3>
      
      ${alertsHTML}
      
      <div style="text-align: center; margin-top: 15px;">
        <button onclick="startCVEPolling()" style="background: rgba(255,255,255,0.2); color: white; border: 1px solid rgba(255,255,255,0.3); padding: 8px 16px; border-radius: 5px; cursor: pointer; font-size: 12px;">
          🔄 Actualiser
        </button>
      </div>
    </div>
  `;
}

// Debug helper
console.log("📄 popup.js loaded - waiting for DOMContentLoaded");
