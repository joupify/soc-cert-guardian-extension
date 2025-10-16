// content-alert.js - SOC-CERT Threat Alert Overlay (COMPACT & ÉLÉGANT)
console.log("🚨 SOC-CERT Content Alert Script loaded");

// Écoute les messages du background
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("📨 Message reçu:", message);

  if (message.action === "showThreatAlert") {
    console.log("🚨 THREAT DETECTED - Showing overlay", message.data);
    showThreatOverlay(message.data);
    sendResponse({ success: true });
    return true;
  }
});

function showThreatOverlay(data) {
  // Vérifie si overlay existe déjà
  if (document.getElementById("soc-cert-threat-overlay")) {
    console.log("⚠️ Overlay already exists");
    return;
  }

  console.log("✅ Creating threat overlay with data:", data);

  const overlay = document.createElement("div");
  overlay.id = "soc-cert-threat-overlay";
  overlay.innerHTML = `
    <style>
      @keyframes slideDown {
        from { transform: translateY(-100%); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
      @keyframes slideUp {
        from {
          transform: translateY(0);
          opacity: 1;
        }
        to {
          transform: translateY(-100%);
          opacity: 0;
        }
      }
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.8; }
      }
      #soc-cert-threat-overlay * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
      }
    </style>
    
    <div style="
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      color: white;
      padding: 12px 16px;
      z-index: 2147483647;
      box-shadow: 0 2px 12px rgba(255, 0, 0, 0.4);
      border-bottom: 2px solid #ff4444;
      font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
      font-size: 13px;
      line-height: 1.4;
      animation: slideDown 0.4s ease-out;
    ">
      <div style="display: flex; align-items: center; justify-content: space-between; max-width: 1000px; margin: 0 auto;">
        <!-- Section principale -->
        <div style="flex: 1; display: flex; align-items: center; gap: 12px;">
          <!-- Icône -->
          <div style="font-size: 20px; animation: pulse 2s infinite;">🚨</div>
          
          <!-- Contenu principal -->
          <div style="flex: 1;">
            <!-- En-tête -->
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
              <strong style="color: #ff6b6b; font-size: 13px;">
                SECURITY ALERT
              </strong>
              <div style="
                background: ${
                  data.riskScore > 70
                    ? "#ff4444"
                    : data.riskScore > 40
                    ? "#ffa726"
                    : "#4caf50"
                };
                color: white;
                padding: 2px 8px;
                border-radius: 12px;
                font-size: 11px;
                font-weight: bold;
              ">
                ${data.riskScore || "N/A"}/100
              </div>
            </div>
            
            
            <div style="display: flex; flex-wrap: wrap; gap: 12px; align-items: center; font-size: 12px;">
              <span style="opacity: 0.9;">
                <strong style="color: #ffa726;">Type:</strong> ${
                  data.threatType || "Suspicious"
                }
              </span>
              
              ${
                data.cve_id
                  ? `
                <span style="opacity: 0.9;">
                  <strong style="color: #ff6b6b;">CVE:</strong> 
                  <code style="background: rgba(255,0,0,0.2); padding: 1px 6px; border-radius: 3px; font-size: 11px;">
                    ${data.cve_id}
                  </code>
                </span>
              `
                  : ""
              }
              
              ${
                data.url
                  ? `
                <span style="opacity: 0.7; font-size: 11px;">
                  <strong>URL:</strong> ${data.url
                    .replace(/^https?:\/\//, "")
                    .substring(0, 30)}...
                </span>
              `
                  : ""
              }
            </div>
          </div>
        </div>
        
        <!-- Actions -->
        <div style="display: flex; gap: 8px; margin-left: 16px;">
          <button id="soc-cert-view-details" style="
            background: #4dabf7;
            color: white;
            border: none;
            padding: 6px 12px;
            border-radius: 4px;
            cursor: pointer;
            font-weight: 600;
            font-size: 11px;
            transition: all 0.2s;
            white-space: nowrap;
          ">
            📋 Details
          </button>
          
          <button id="soc-cert-dismiss" style="
            background: rgba(255,255,255,0.15);
            color: white;
            border: 1px solid rgba(255,255,255,0.25);
            padding: 6px 12px;
            border-radius: 4px;
            cursor: pointer;
            font-weight: 600;
            font-size: 11px;
            transition: all 0.2s;
            white-space: nowrap;
          ">
            ✕ Dismiss
          </button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);
  console.log("✅ Overlay added to DOM");

  // Event listeners
  const viewBtn = document.getElementById("soc-cert-view-details");
  const dismissBtn = document.getElementById("soc-cert-dismiss");

  if (viewBtn) {
    viewBtn.addEventListener("click", () => {
      console.log("📋 View Details clicked");
      // Open extension directly on this  page
      chrome.runtime.sendMessage({
        action: "showExtensionOnCurrentPage",
      });
      dismissOverlay();
    });

    viewBtn.addEventListener("mouseover", () => {
      viewBtn.style.background = "#339af0";
      viewBtn.style.transform = "translateY(-1px)";
    });
    viewBtn.addEventListener("mouseout", () => {
      viewBtn.style.background = "#4dabf7";
      viewBtn.style.transform = "translateY(0)";
    });
  }

  if (dismissBtn) {
    dismissBtn.addEventListener("click", () => {
      console.log("✖️ Dismiss clicked");
      dismissOverlay();
    });

    dismissBtn.addEventListener("mouseover", () => {
      dismissBtn.style.background = "rgba(255,255,255,0.25)";
      dismissBtn.style.transform = "translateY(-1px)";
    });
    dismissBtn.addEventListener("mouseout", () => {
      dismissBtn.style.background = "rgba(255,255,255,0.15)";
      dismissBtn.style.transform = "translateY(0)";
    });
  }

  // Auto-dismiss after 12 seconds
  setTimeout(() => {
    if (document.getElementById("soc-cert-threat-overlay")) {
      console.log("⏱️ Auto-dismiss timeout");
      dismissOverlay();
    }
  }, 12000);
}

function dismissOverlay() {
  const overlay = document.getElementById("soc-cert-threat-overlay");
  if (overlay) {
    overlay.style.animation = "slideUp 0.3s ease-out forwards";
    setTimeout(() => {
      overlay.remove();
      console.log("✅ Overlay removed");
    }, 300);
  }
}

// Test initial
console.log("✅ Content alert script ready");
