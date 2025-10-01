// popup.js - Version corrigée
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

function displayFallbackAnalysis(tab) {
  const content = document.getElementById("analysis-content");
  content.innerHTML = `
    <div style="background: rgba(255,255,255,0.1); padding: 15px; border-radius: 10px; margin-bottom: 15px; text-align: center;">
      <div style="font-size: 32px; font-weight: bold; color: #00fff7;">--/100</div>
      <div>Security Score</div>
    </div>
    
    <div style="background: rgba(255,255,255,0.05); padding: 15px; border-radius: 8px; margin-bottom: 10px;">
      <h4>📊 Page Info</h4>
      <div>URL: ${tab.url}</div>
      <div>HTTPS: ${tab.url.startsWith("https://") ? "✅" : "❌"}</div>
    </div>
    
    <div style="background: rgba(255,255,255,0.05); padding: 15px; border-radius: 8px;">
      <h4>⚠️ Analysis Limited</h4>
      <div>AI analysis temporarily unavailable. Basic security info shown.</div>
    </div>
  `;
}

// Debug helper
console.log("📄 popup.js loaded - waiting for DOMContentLoaded");

// popup.js - Dashboard KendoReact pour afficher les alertes

class SOCCERTDashboard {
  constructor() {
    this.apiUrl = "https://soc-cert-extension.vercel.app/api";
    this.alerts = [];
    this.isPolling = false;
  }

  // 🚀 Initialiser le dashboard
  async init() {
    console.log("🚀 Initialisation SOC-CERT Dashboard...");

    // Demander permission notifications
    if (Notification.permission === "default") {
      await Notification.requestPermission();
    }

    // Charger les alertes existantes
    await this.loadAlerts();

    // Démarrer le polling
    this.startPolling();

    // Render interface
    this.render();
  }

  // 📥 Charger les alertes
  async loadAlerts() {
    try {
      const response = await fetch(`${this.apiUrl}/extension-status`);
      const data = await response.json();

      console.log("📊 Status API:", data);

      // Récupérer toutes les alertes de toutes les extensions
      for (const [extId, info] of Object.entries(
        data.cveResults.extensions || {}
      )) {
        const alertsResponse = await fetch(
          `${this.apiUrl}/extension-result?extensionId=${extId}&format=cve`
        );
        const alertsData = await alertsResponse.json();

        if (alertsData.success && alertsData.results) {
          this.alerts.push(...alertsData.results);
        }
      }

      console.log(`✅ Chargé ${this.alerts.length} alertes`);
    } catch (error) {
      console.error("❌ Erreur chargement alertes:", error);
    }
  }

  // 🔄 Polling automatique (toutes les 30 secondes)
  startPolling() {
    if (this.isPolling) return;

    this.isPolling = true;

    setInterval(async () => {
      console.log("🔄 Polling nouvelles alertes...");
      await this.loadAlerts();
      this.render();
    }, 30000);
  }

  // 🎨 Render dashboard
  render() {
    const container = document.getElementById("dashboard-container");

    if (!container) {
      console.error("❌ Container #dashboard-container non trouvé");
      return;
    }

    // Trier par sévérité puis date
    const sortedAlerts = this.alerts.sort((a, b) => {
      const severityOrder = { Critical: 4, High: 3, Medium: 2, Low: 1 };
      const severityDiff =
        (severityOrder[b.severity] || 0) - (severityOrder[a.severity] || 0);

      if (severityDiff !== 0) return severityDiff;

      return (
        new Date(b.receivedAt || b.published) -
        new Date(a.receivedAt || a.published)
      );
    });

    container.innerHTML = `
      <div class="soc-cert-dashboard">
        <header class="dashboard-header">
          <h1>🔒 SOC-CERT Dashboard</h1>
          <div class="stats">
            <span class="stat-badge critical">${this.countBySeverity(
              "Critical"
            )} Critical</span>
            <span class="stat-badge high">${this.countBySeverity(
              "High"
            )} High</span>
            <span class="stat-badge medium">${this.countBySeverity(
              "Medium"
            )} Medium</span>
            <span class="stat-badge low">${this.countBySeverity(
              "Low"
            )} Low</span>
          </div>
        </header>
        
        <div class="alerts-container">
          ${
            sortedAlerts.length === 0
              ? '<p class="no-alerts">✅ Aucune alerte CVE</p>'
              : sortedAlerts
                  .map((alert) => this.createAlertCard(alert))
                  .join("")
          }
        </div>
      </div>
    `;

    // Attacher les event listeners
    this.attachEventListeners();
  }

  // 🎴 Créer carte d'alerte
  createAlertCard(alert) {
    return `
      <div class="alert-card severity-${alert.severity.toLowerCase()}" data-cve="${
      alert.cve_id
    }">
        <div class="alert-header">
          <span class="severity-badge ${alert.severity.toLowerCase()}">${
      alert.severity
    }</span>
          <span class="cve-id">${alert.cve_id}</span>
          <span class="score">Score: ${alert.score}</span>
        </div>
        
        <div class="alert-body">
          <h3 class="alert-title">${alert.title}</h3>
          
          ${
            alert.shortDescription
              ? `
            <p class="alert-description">${alert.shortDescription.substring(
              0,
              150
            )}...</p>
          `
              : ""
          }
          
          <div class="alert-meta">
            <span>📅 ${new Date(alert.published).toLocaleDateString(
              "fr-FR"
            )}</span>
            <span>📍 ${alert.source || "Extension"}</span>
            ${
              alert.knownRansomwareCampaignUse === "Known"
                ? '<span class="ransomware-badge">⚠️ Ransomware</span>'
                : ""
            }
          </div>
          
          ${
            alert.enrichment
              ? `
            <div class="enrichment">
              ${
                alert.enrichment.cisa_kev
                  ? '<span class="badge-kev">🔴 CISA KEV</span>'
                  : ""
              }
              ${
                alert.enrichment.otx
                  ? `<span class="badge-otx">OTX: ${alert.enrichment.otx.pulse_count} pulses</span>`
                  : ""
              }
              ${
                alert.enrichment.shodan
                  ? `<span class="badge-shodan">Shodan: ${alert.enrichment.shodan.total} résultats</span>`
                  : ""
              }
            </div>
          `
              : ""
          }
        </div>
        
        <div class="alert-actions">
          <button class="btn-action btn-investigate" data-cve="${alert.cve_id}">
            🔍 Investiguer
          </button>
          <button class="btn-action btn-acknowledge" data-cve="${alert.cve_id}">
            ✓ Marquer lu
          </button>
          <a href="${alert.link}" target="_blank" class="btn-action btn-nvd">
            🔗 NVD
          </a>
        </div>
      </div>
    `;
  }

  // 🔢 Compter par sévérité
  countBySeverity(severity) {
    return this.alerts.filter((a) => a.severity === severity).length;
  }

  // 🎯 Attacher event listeners
  attachEventListeners() {
    // Bouton Investiguer
    document.querySelectorAll(".btn-investigate").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const cveId = e.target.dataset.cve;
        this.investigateAlert(cveId);
      });
    });

    // Bouton Marquer lu
    document.querySelectorAll(".btn-acknowledge").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const cveId = e.target.dataset.cve;
        this.acknowledgeAlert(cveId);
      });
    });
  }

  // 🔍 Investiguer alerte
  investigateAlert(cveId) {
    const alert = this.alerts.find((a) => a.cve_id === cveId);

    if (!alert) return;

    console.log("🔍 Investigation:", alert);

    // Ouvrir plusieurs sources
    window.open(alert.link, "_blank"); // NVD
    window.open(`https://www.cvedetails.com/cve/${cveId}`, "_blank"); // CVE Details
    window.open(`https://www.exploit-db.com/search?cve=${cveId}`, "_blank"); // Exploit-DB
  }

  // ✓ Marquer comme lu
  acknowledgeAlert(cveId) {
    this.alerts = this.alerts.filter((a) => a.cve_id !== cveId);
    this.render();
    console.log(`✓ Alerte ${cveId} marquée comme lue`);
  }
}

// 🚀 Initialiser au chargement
document.addEventListener("DOMContentLoaded", () => {
  const dashboard = new SOCCERTDashboard();
  dashboard.init();
});

// Dans content-script.js ou popup.js (selon ton système)
async function pollForResult(extensionId) {
  let attempts = 0;
  const maxAttempts = 15;

  const poll = async () => {
    const url = `https://soc-cert-extension.vercel.app/api/extension-result?extensionId=${extensionId}&format=cve`;
    try {
      const response = await fetch(url);
      const result = await response.json();

      if (result.success && result.results && result.results.length > 0) {
        console.log("✅ Résultat complet reçu !", result.results);
        // Affiche "analyse complète" dans UI ici
        displayCVEAlerts(result.results);
        return;
      } else {
        attempts++;
        if (attempts >= maxAttempts) {
          console.warn("⏱ Timeout polling extension-result");
          showStatusMessage(
            "⚠️ Analyse approfondie temporairement indisponible"
          );
          return;
        } else {
          setTimeout(poll, 3000);
        }
      }
    } catch (e) {
      console.error("❌ Erreur polling extension-result", e);
      if (attempts < maxAttempts) setTimeout(poll, 3000);
    }
  };

  poll();
}

// Exemple d’affichage simple dans UI
function displayCVEAlerts(alerts) {
  const container = document.getElementById("alerts-container");
  container.innerHTML = alerts
    .map(
      (cve) => `<div class="alert-card">
    <div><strong>${cve.cve_id}</strong> - ${cve.title}</div>
    <div>Score: ${cve.score}/100 - Sévérité: ${cve.severity}</div>
    <div>Recommandations: ${
      cve.cohere_recommendations || cve.recommendations.join(", ")
    }</div>
  </div>`
    )
    .join("");
}
