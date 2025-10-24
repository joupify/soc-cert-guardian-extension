document.addEventListener("DOMContentLoaded", function () {
  console.log("🔒 SOC-CERT Extension loaded - DOM ready");

  // Wait for all scripts to load
  setTimeout(initializePopup, 100);
});

// ============================================
// VIRTUAL CVE STATISTICS
// ============================================

async function loadVirtualCVEStats() {
  const API_BASE_URL = "https://soc-cert-extension.vercel.app";
  console.log("📊 Loading Virtual CVE stats...");

  try {
    // ✅ Cache-busting with timestamp
    const response = await fetch(
      `${API_BASE_URL}/api/virtual-cve-stats?t=${Date.now()}`,
      {
        cache: "no-cache", // ✅ Force refresh
        headers: {
          "Cache-Control": "no-cache",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const stats = await response.json();

    console.log("✅ Stats loaded:", stats);

    // Update the UI
    document.getElementById("total-virtual-cves").textContent =
      stats.totalVirtualCVEs || 0;
    document.getElementById("threats-24h").textContent =
      stats.threatsLast24h || 0;
    document.getElementById("avg-confidence").textContent = stats.avgConfidence
      ? `${Math.round(stats.avgConfidence * 100)}%`
      : "-";

    // Optional: animation count
    if (typeof animateCounter === "function") {
      animateCounter(
        "total-virtual-cves",
        0,
        stats.totalVirtualCVEs || 0,
        1000
      );
      animateCounter("threats-24h", 0, stats.threatsLast24h || 0, 800);
    }
  } catch (error) {
    console.error("❌ Failed to load Virtual CVE stats:", error);

    // Fallback: display 0
    document.getElementById("total-virtual-cves").textContent = "0";
    document.getElementById("threats-24h").textContent = "0";
    document.getElementById("avg-confidence").textContent = "-";
  }
}

// ✅ Load immediately at startup
loadVirtualCVEStats();

function animateCounter(elementId, start, end, duration) {
  const element = document.getElementById(elementId);
  if (!element) return;

  const range = end - start;
  const increment = range / (duration / 16); // 60 FPS
  let current = start;

  const timer = setInterval(() => {
    current += increment;
    if (
      (increment > 0 && current >= end) ||
      (increment < 0 && current <= end)
    ) {
      current = end;
      clearInterval(timer);
    }
    element.textContent = Math.round(current).toLocaleString();
  }, 16);
}

// ✅ Call popup on reload
document.addEventListener("DOMContentLoaded", async () => {
  console.log("🚀 Popup loaded, loading stats...");
  await loadVirtualCVEStats();
});

// ============================================
// END VIRTUAL CVE STATISTICS
// ============================================

async function initializePopup() {
  try {
    // Check if aiHelper is available
    if (typeof aiHelper === "undefined") {
      console.log("⏳ Waiting for AI Helper to load...");
      setTimeout(initializePopup, 100);
      return;
    }

    // Initialize AI Helper manually
    await aiHelper.initialize();
    console.log("✅ AI Helper ready:", aiHelper.hasNativeAI);

    // Display EPP status
    const statusElement = document.getElementById("status");
    if (aiHelper.hasNativeAI) {
      statusElement.innerHTML = "✅ Chrome AI APIs Enabled";
    } else if (aiHelper.needsDownload) {
      statusElement.innerHTML = `
        Chrome AI Available - 
        <button id="download-ai-btn" style="background: #0066cc; color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 11px;">
          📥 Download Gemini Nano
        </button>
      `;

      // Add event listener for download
      setTimeout(() => {
        const downloadBtn = document.getElementById("download-ai-btn");
        if (downloadBtn) {
          downloadBtn.addEventListener("click", async () => {
            downloadBtn.textContent = "⬇️ Downloading...";
            downloadBtn.disabled = true;

            const success = await aiHelper.downloadGeminiNano();
            if (success) {
              statusElement.innerHTML = "✅ Chrome AI APIs Enabled";
            } else {
              downloadBtn.textContent = "❌ Download Failed";
            }
          });
        }
      }, 100);
    } else {
      statusElement.innerHTML = "🔄 Using Mock AI (EPP Pending)";
    }

    // Analyze current page
    await analyzeCurrentPage();

    // ✅ API TEST SECTION RESTORED - Shows Chrome AI APIs status
    await addAITestButtons();
    console.debug("✅ API test section restored and rendered");

    // ❌ DISABLED CVE POLLING - ai-helper handles it
    // await startCVEPolling();
  } catch (error) {
    console.error("Initialization error:", error);
    document.getElementById("status").textContent = "❌ Initialization failed";
  }
}

// ============================================
// SECURITY RESOURCES GENERATOR
// ============================================

class SecurityResourcesGenerator {
  constructor() {
    this.resourceDatabase = {
      "SQL injection": {
        cwe: "89",
        cweUrl: "https://cwe.mitre.org/data/definitions/89.html",
        guides: [
          {
            title: "OWASP SQL Injection Prevention Cheat Sheet",
            url: "https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html",
            description:
              "Comprehensive guide to preventing SQL injection attacks",
          },
          {
            title: "NIST Secure Coding Guidelines",
            url: "https://www.nist.gov/itl/ssd/software-quality-group/secure-coding",
            description: "Official NIST recommendations for secure development",
          },
          {
            title: "OWASP Testing Guide - SQL Injection",
            url: "https://owasp.org/www-project-web-security-testing-guide/latest/4-Web_Application_Security_Testing/07-Input_Validation_Testing/05-Testing_for_SQL_Injection",
            description: "How to test for SQL injection vulnerabilities",
          },
        ],
        labs: [
          {
            title: "PortSwigger SQL Injection Lab",
            url: "https://portswigger.net/web-security/sql-injection",
            description: "Interactive hands-on SQL injection training",
          },
          {
            title: "OWASP WebGoat SQL Injection Lessons",
            url: "https://owasp.org/www-project-webgoat/",
            description: "Practice SQL injection in a safe environment",
          },
        ],
      },
      XSS: {
        cwe: "79",
        cweUrl: "https://cwe.mitre.org/data/definitions/79.html",
        guides: [
          {
            title: "OWASP XSS Prevention Cheat Sheet",
            url: "https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html",
            description: "Best practices for preventing XSS attacks",
          },
          {
            title: "OWASP DOM-based XSS Prevention",
            url: "https://cheatsheetseries.owasp.org/cheatsheets/DOM_based_XSS_Prevention_Cheat_Sheet.html",
            description: "Specific guidance for DOM-based XSS",
          },
        ],
        labs: [
          {
            title: "PortSwigger XSS Labs",
            url: "https://portswigger.net/web-security/cross-site-scripting",
            description: "Interactive XSS training with various scenarios",
          },
        ],
      },
      CSRF: {
        cwe: "352",
        cweUrl: "https://cwe.mitre.org/data/definitions/352.html",
        guides: [
          {
            title: "OWASP CSRF Prevention Cheat Sheet",
            url: "https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html",
            description: "Comprehensive CSRF prevention strategies",
          },
        ],
        labs: [
          {
            title: "PortSwigger CSRF Lab",
            url: "https://portswigger.net/web-security/csrf",
            description: "Practice CSRF attack and defense techniques",
          },
        ],
      },
      "Command Injection": {
        cwe: "78",
        cweUrl: "https://cwe.mitre.org/data/definitions/78.html",
        guides: [
          {
            title: "OWASP Command Injection",
            url: "https://owasp.org/www-community/attacks/Command_Injection",
            description: "Understanding and preventing command injection",
          },
        ],
        labs: [
          {
            title: "PortSwigger OS Command Injection Lab",
            url: "https://portswigger.net/web-security/os-command-injection",
            description: "Interactive command injection exercises",
          },
        ],
      },
    };

    // Default resources if no type is detected
    this.defaultResources = {
      cwe: "Unknown",
      cweUrl: "https://cwe.mitre.org/",
      guides: [
        {
          title: "OWASP Top 10",
          url: "https://owasp.org/www-project-top-ten/",
          description: "Critical security risks for web applications",
        },
        {
          title: "NIST Cybersecurity Framework",
          url: "https://www.nist.gov/cyberframework",
          description:
            "Framework for improving critical infrastructure cybersecurity",
        },
      ],
      labs: [
        {
          title: "OWASP WebGoat",
          url: "https://owasp.org/www-project-webgoat/",
          description: "General web security training platform",
        },
      ],
    };
  }

  // Detect vulnerability type from indicators
  detectVulnerabilityType(indicators) {
    if (!indicators || indicators.length === 0) return null;

    for (const indicator of indicators) {
      const indicatorLower = indicator.toLowerCase();

      for (const [vulnType, resources] of Object.entries(
        this.resourceDatabase
      )) {
        if (indicatorLower.includes(vulnType.toLowerCase().replace(" ", ""))) {
          return { type: vulnType, ...resources };
        }
      }
    }

    return null;
  }

  // Generate complete HTML for resources
  generateResourcesHTML(indicators) {
    const detected = this.detectVulnerabilityType(indicators);
    const resources = detected || {
      type: "General Web Security",
      ...this.defaultResources,
    };

    return `
      <div class="security-resources-section">
        <div class="resources-header">
          // <h3>📚 Learn More About This Threat</h3>
          <p class="resources-subtitle">Educational resources and hands-on practice</p>
        </div>

        <!-- Vulnerability Classification -->
        <div class="resource-category">
          <div class="category-header">
            <span class="category-icon">🔍</span>
            <h4>Vulnerability Classification</h4>
          </div>
          <div class="resource-content">
            <div class="classification-item">
              <span class="classification-label">Type:</span>
              <span class="classification-value">${resources.type}</span>
            </div>
            <div class="classification-item">
              <span class="classification-label">CWE Reference:</span>
              <a href="${
                resources.cweUrl
              }" target="_blank" class="classification-link">
                CWE-${resources.cwe}: ${resources.type}
                <span class="link-icon">↗</span>
              </a>
            </div>
          </div>
        </div>

        <!-- Prevention Guides -->
        <div class="resource-category">
          <div class="category-header">
            <span class="category-icon">📖</span>
            <h4>Prevention Guides</h4>
          </div>
          <div class="resource-content">
            ${resources.guides
              .map(
                (guide) => `
              <div class="resource-link-card">
                <a href="${guide.url}" target="_blank" class="resource-link">
                  <div class="resource-link-title">${guide.title}</div>
                  <div class="resource-link-desc">${guide.description}</div>
                  <span class="link-icon-inline">→</span>
                </a>
              </div>
            `
              )
              .join("")}
          </div>
        </div>

        <!-- Hands-On Practice -->
        <div class="resource-category">
          <div class="category-header">
            <span class="category-icon">🧪</span>
            <h4>Hands-On Practice</h4>
          </div>
          <div class="resource-content">
            ${resources.labs
              .map(
                (lab) => `
              <div class="resource-link-card">
                <a href="${lab.url}" target="_blank" class="resource-link">
                  <div class="resource-link-title">${lab.title}</div>
                  <div class="resource-link-desc">${lab.description}</div>
                  <span class="link-icon-inline">→</span>
                </a>
              </div>
            `
              )
              .join("")}
          </div>
        </div>
      </div>
    `;
  }
}

// ✅ Initialize the generator
const resourcesGenerator = new SecurityResourcesGenerator();

// Helper to show/hide a deep analysis spinner inside #analysis-content
function showDeepSpinner() {
  const container = document.getElementById("analysis-content");
  if (!container) return;
  // If spinner already present, don't duplicate
  if (document.getElementById("deep-analysis-spinner")) return;

  const spinner = document.createElement("div");
  spinner.id = "deep-analysis-spinner";
  spinner.style.cssText = `
    display:flex; align-items:center; justify-content:center; flex-direction:column;
    margin-top:20px; padding:10px; background: rgba(0,0,0,0.05); border-radius:8px;
  `;
  spinner.innerHTML = `
    <div style="font-size:18px; color:#4fc3f7; margin-bottom:6px;">Deep analysis in progress...</div>
    <div class="popup-spinner" style="width:32px; height:32px; border:4px solid rgba(255,255,255,0.1); border-top-color:#4fc3f7; border-radius:50%; animation:spin 1s linear infinite;"></div>
  `;

  container.appendChild(spinner);
}

function hideDeepSpinner() {
  // Remove the deep analysis spinner
  const spinner = document.getElementById("deep-analysis-spinner");
  if (spinner && spinner.parentNode) spinner.parentNode.removeChild(spinner);

  // Update n8n badge to completed state
  const n8nBadge = document.querySelector(
    '[data-api-key="n8n"] .api-badge-status'
  );
  if (n8nBadge) {
    n8nBadge.textContent = "✅ Analysis completed";
  }

  // Update progress indicator
  const progressiveIndicator = document.getElementById("deep-analysis-status");
  if (progressiveIndicator) {
    progressiveIndicator.innerHTML = "✅ Analysis completed";
  }

  // Update AI status section
  const aiStatusSection = document.getElementById("ai-status-progress");
  if (aiStatusSection) {
    aiStatusSection.innerHTML = "⚡ Quick analysis • ✅ Complete";
  }
}

// Ensure the deep-analysis-status element reflects a running state (spinner + text)
function setDeepAnalysisStatusRunning() {
  try {
    const el = document.getElementById("deep-analysis-status");
    if (el) {
      el.style.color = "#00ffff";
      el.innerHTML = `<div style="display:flex; align-items:center; gap:8px;"><span style=\"width:14px; height:14px; border:3px solid rgba(255,255,255,0.08); border-top-color:#00ffff; border-radius:50%; display:inline-block; animation:spin 1s linear infinite;\"></span><span>Deep analysis n8n running...</span></div>`;
    }
  } catch (e) {
    console.log("⚠️ setDeepAnalysisStatusRunning failed:", e.message || e);
  }
}

// Ensure the AI status progress indicator shows running for new progressive analyses
function setAIStatusRunning() {
  try {
    const aiStatusSection = document.getElementById("ai-status-progress");
    if (aiStatusSection) {
      aiStatusSection.style.color = "#00ffff";
      aiStatusSection.innerHTML =
        "⚡ Quick analysis • 🔬 Deep analysis running...";
    }
  } catch (e) {
    console.log("⚠️ setAIStatusRunning failed:", e.message || e);
  }
}

// Small helper to escape HTML when inserting dynamic content
function escapeHTML(str) {
  if (typeof str !== "string") return str;
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Render an array of recommendations as a UL. Supports strings or objects {title, description}
function renderRecommendationsList(items) {
  if (!items || !Array.isArray(items) || items.length === 0)
    return "<div>No recommendations available</div>";

  return `
    <ul style="margin: 5px 0; padding-left: 20px; font-size: 12px;">
      ${items
        .map((rec) => {
          if (!rec) return "";

          // helper to choose icon by content
          const chooseIcon = (text) => {
            if (!text) return "";
            const t = String(text).toLowerCase();
            if (
              t.includes("sanitize") ||
              t.includes("validation") ||
              t.includes("parameter")
            )
              return "🔧";
            if (
              t.includes("update") ||
              t.includes("patch") ||
              t.includes("upgrade")
            )
              return "🆙";
            if (
              t.includes("security header") ||
              t.includes("headers") ||
              t.includes("enable") ||
              t.includes("configure")
            )
              return "🛡️";
            if (
              t.includes("waf") ||
              t.includes("firewall") ||
              t.includes("web application firewall")
            )
              return "🔥";
            if (
              t.includes("encode") ||
              t.includes("encoding") ||
              t.includes("output encoding") ||
              t.includes("output-encoding")
            )
              return "🔒";
            // Default icon when no keyword matched
            return "💡";
          };

          if (typeof rec === "string") {
            const icon = chooseIcon(rec);
            return `<li style="display: flex; align-items: flex-start;">
              ${
                icon
                  ? `<span style="display: inline; margin-right: 6px; flex-shrink: 0;">${icon}</span>`
                  : ""
              }
              <span style="display: inline; flex: 1;">${escapeHTML(rec)}</span>
            </li>`;
          }

          // object case
          const title = rec.title
            ? `<strong>${escapeHTML(rec.title)}</strong>`
            : "";
          const desc = rec.description
            ? `<div style="font-size:11px;margin-top:6px;line-height:1.6; color:#ddd; margin-top:4px;">${escapeHTML(
                rec.description
              )}</div>`
            : "";
          const icon = chooseIcon(rec.title || rec.description || "");

          return `<li style="margin-bottom: 8px; display: flex; align-items: flex-start;">
            ${
              icon
                ? `<span style="display: inline; margin-right: 6px; flex-shrink: 0;">${icon}</span>`
                : ""
            }
            <div style="flex: 1;">${title}${desc}</div>
          </li>`;
        })
        .join("")}
    </ul>
  `;
}

// Inline renderer for small blocks (used in specialized AI Analysis simple display)
function renderRecommendationsInline(items) {
  if (!items) return "";
  if (Array.isArray(items)) {
    // If objects, render title and description
    if (typeof items[0] === "object") {
      const chooseIcon = (text) => {
        if (!text) return "";
        const t = String(text).toLowerCase();
        if (
          t.includes("sanitize") ||
          t.includes("validation") ||
          t.includes("parameter")
        )
          return "🔧";
        if (
          t.includes("update") ||
          t.includes("patch") ||
          t.includes("upgrade")
        )
          return "🆙";
        if (
          t.includes("security header") ||
          t.includes("headers") ||
          t.includes("enable") ||
          t.includes("configure")
        )
          return "🛡️";
        if (
          t.includes("waf") ||
          t.includes("firewall") ||
          t.includes("web application firewall")
        )
          return "🔥";
        if (
          t.includes("encode") ||
          t.includes("encoding") ||
          t.includes("output encoding") ||
          t.includes("output-encoding")
        )
          return "🔒";
        // Default icon when no keyword matched
        return "💡";
      };
      return items
        .map((rec) => {
          if (!rec) return "";
          const title = rec.title
            ? `<strong>${escapeHTML(rec.title)}</strong>`
            : "";
          const desc = rec.description
            ? `<div style="font-size:11px;color:#ddd;">${escapeHTML(
                rec.description
              )}</div>`
            : "";
          const icon = chooseIcon(rec.title || rec.description || "");
          return `<div style="margin-bottom:8px;">${
            icon ? `<span style="margin-right:6px;">${icon}</span>` : ""
          }${title}${desc}</div>`;
        })
        .join("");
    }

    return items.map((s) => escapeHTML(String(s))).join("<br>");
  }

  return escapeHTML(String(items));
}

// == ADD THESE FUNCTIONS AFTER initializePopup() ==

function showRealTimeAnalysis(tab) {
  console.log("🚀 Starting real-time analysis UI");

  // Display real-time analysis section
  document.getElementById("analysis-status").style.display = "block";
  document.getElementById("status").style.display = "none";
  document.getElementById("analysis-content").style.display = "none";

  // Update the URL
  const displayUrl =
    tab.url.length > 45 ? tab.url.substring(0, 45) + "..." : tab.url;
  document.getElementById("analyzing-url").textContent = displayUrl;

  // Start API animation
  startAPIAnalysisAnimation();

  // Retourner une promesse pour savoir quand l'animation est finie
  return new Promise((resolve) => {
    setTimeout(resolve, 8000); // 8s pour toute l'animation
  });
}

function startAPIAnalysisAnimation() {
  console.log("🎬 Starting API analysis animation");

  const apis = [
    { id: "api-gemini", name: "Gemini Nano", delay: 1000, duration: 2000 },
    { id: "api-summarizer", name: "Summarizer", delay: 2500, duration: 1500 },
    { id: "api-writer", name: "Writer", delay: 4000, duration: 1200 },
    { id: "api-translator", name: "Translator", delay: 5200, duration: 1000 },
    { id: "api-proofreader", name: "Proofreader", delay: 6200, duration: 800 },
  ];

  let completed = 0;

  apis.forEach((api) => {
    setTimeout(() => {
      const element = document.getElementById(api.id);
      if (!element) {
        console.warn(`⚠️ Element ${api.id} not found, skipping animation`);
        return;
      }

      element.classList.add("active");

      const statusElement = element.querySelector(".api-status");
      statusElement.innerHTML =
        'Analyzing... <span class="popup-spinner">⏳</span>';
      console.log(`🔧 ${api.name} started analysis`);

      setTimeout(() => {
        element.classList.remove("active");
        element.classList.add("completed");

        // ✨ SIMPLIFIED: Simple checkmark
        statusElement.textContent = "Completed ✅";

        console.log(`✅ ${api.name} analysis completed`);

        completed++;
        const progress = (completed / apis.length) * 100;
        document.getElementById("progress-fill").style.width = progress + "%";
        document.getElementById("progress-percent").textContent =
          Math.round(progress) + "%";

        if (completed === apis.length) {
          // Don't show time indicator here - it will be shown after real analysis
          console.log("🎉 All API animations completed");
        }
      }, api.duration);
    }, api.delay);
  });
}

// 🆕 TEST BUTTONS FOR PRIORITY APIs
async function addAITestButtons() {
  const container = document.getElementById("analysis-content");

  const testSection = document.createElement("div");
  testSection.id = "ai-test-section";
  testSection.style.cssText = `
    margin-top: 15px; 
    padding: 10px; 
    background: rgba(255,255,255,0.05); 
    border-radius: 8px;
    border-top: 2px solid rgba(255,255,255,0.2);
  `;

  testSection.innerHTML = `
  <!-- h4 style="margin: 0 0 10px 0; font-size: 14px; color: #fff;">🤖 Chrome AI APIs</h4>
  
  <-- Automatic download button -->
  <!-- button id="download-all-ai" style="width: 100%; padding: 8px; border: none; border-radius: 4px; background: #4285f4; color: white; font-size: 12px; cursor: pointer; margin-bottom: 10px;">
    📥 Download all APIs
  </button -->
  
  <!-- API status 
  <div id="ai-status" style="margin-bottom: 10px; padding: 6px; background: rgba(0,0,0,0.3); border-radius: 4px; font-size: 10px; color: #ccc;">
    Checking status...
  </div>
  -->
  
  <!-- Test buttons 
  <div style="display: flex; flex-wrap: wrap; gap: 5px;">
    <button id="test-summarizer" style="flex: 1; padding: 5px; border: none; border-radius: 4px; background: #0066cc; color: white; font-size: 10px; cursor: pointer;">
      📝 Summarizer
    </button>
    <button id="test-writer" style="flex: 1; padding: 5px; border: none; border-radius: 4px; background: #024a04ff; color: white; font-size: 10px; cursor: pointer;">
      ✍️ Writer
    </button>
    <button id="test-translator" style="flex: 1; padding: 5px; border: none; border-radius: 4px; background: #FF9800; color: white; font-size: 10px; cursor: pointer;">
      🌐 Translator
    </button>
  </div>
  -->
  
  <!-- AI Results with inline translate buttons -->
  <div id="ai-test-results" style="margin-top: 10px; font-size: 11px; max-height: 200px; overflow-y: auto; background: rgba(0,0,0,0.2); padding: 5px; border-radius: 4px; display: none;">
  </div>
`;

  // ✅ ADD CODE TO DISPLAY RESULTS WITH TRANSLATE BUTTONS
  function displayAIResult(title, content, containerId = "ai-test-results") {
    const container = document.getElementById(containerId);
    if (!container) return;

    const resultId = `ai-result-${Date.now()}`;

    const resultDiv = document.createElement("div");
    resultDiv.style.cssText =
      "margin-bottom: 10px; padding: 8px; background: rgba(102, 126, 234, 0.1); border-radius: 4px; border-left: 3px solid #667eea;";

    resultDiv.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
      <strong style="color: #667eea; font-size: 11px;">${title}</strong>
      <button class="translate-mini-btn" data-target="${resultId}">
        🌐
      </button>
    </div>
    <div id="${resultId}" style="color: #ccc; font-size: 10px; line-height: 1.4;">
      ${content}
    </div>
  `;

    container.appendChild(resultDiv);
    container.style.display = "block";
  }

  // ✅ UTILISE displayAIResult DANS TES TESTS
  document
    .getElementById("test-summarizer")
    ?.addEventListener("click", async () => {
      // ... ton code de test ...
      displayAIResult("📝 Summarizer Result", "Your summary text here");
    });

  document
    .getElementById("test-writer")
    ?.addEventListener("click", async () => {
      // ... ton code de test ...
      displayAIResult("✍️ Writer Result", "Your writer output here");
    });

  container.appendChild(testSection);

  // 🆕 Event listener for automatic download
  document
    .getElementById("download-all-ai")
    .addEventListener("click", async () => {
      const statusDiv = document.getElementById("ai-status");
      statusDiv.innerHTML = "⬇️ Downloading...";

      try {
        const result = await aiHelper.downloadGeminiNano();
        if (result) {
          statusDiv.innerHTML = "✅ All APIs downloaded!";
          await updateAIStatus(); // Update status
        } else {
          statusDiv.innerHTML = "❌ Download failed";
        }
      } catch (error) {
        statusDiv.innerHTML = `❌ Error: ${error.message}`;
      }
    });

  // Event listeners for tests
  document
    .getElementById("test-summarizer")
    .addEventListener("click", testSummarizer);
  document.getElementById("test-writer").addEventListener("click", testWriter);
  document
    .getElementById("test-translator")
    .addEventListener("click", testTranslator);

  // Update initial status
  await updateAIStatus();
}

// 🆕 Function to update API status
async function updateAIStatus() {
  const statusDiv = document.getElementById("ai-status");
  if (!statusDiv) return;

  try {
    // Test availability of each API
    const status = await aiHelper.testSpecializedAPIs();

    let statusHTML = [];

    // LanguageModel (Gemini Nano)
    if (status.languageModel) {
      statusHTML.push(
        `🧠 Gemini: ${
          status.languageModel === "ready"
            ? "✅"
            : status.languageModel === "downloadable"
            ? "⬇️"
            : "❌"
        }`
      );
    }

    // Summarizer
    if (status.summarizer) {
      statusHTML.push(
        `📝 Summarizer: ${
          status.summarizer === "ready"
            ? "✅"
            : status.summarizer === "downloadable"
            ? "⬇️"
            : "❌"
        }`
      );
    }

    // Writer
    if (status.writer) {
      statusHTML.push(
        `✍️ Writer: ${
          status.writer === "ready"
            ? "✅"
            : status.writer === "downloadable"
            ? "⬇️"
            : "❌"
        }`
      );
    }

    // Translator
    if (status.translator) {
      statusHTML.push(
        `🌐 Translator: ${
          status.translator === "ready"
            ? "✅"
            : status.translator === "downloadable"
            ? "⬇️"
            : "❌"
        }`
      );
    }

    // Proofreader
    if (status.proofreader) {
      statusHTML.push(
        `📝 Proofreader: ${
          status.proofreader === "ready"
            ? "✅"
            : status.proofreader === "downloadable"
            ? "⬇️"
            : "❌"
        }`
      );
    }

    statusDiv.innerHTML = statusHTML.join(" | ");
  } catch (error) {
    statusDiv.innerHTML = `❌ Error: ${error.message}`;
  }
}

// Build categorized API badges HTML (initial render)
function buildAPIBadgesHtml() {
  try {
    const local = [];
    const specialized = [];
    const backend = [];

    if (aiHelper && aiHelper.hasNativeAI) {
      local.push({ key: "languageModel", label: "🧠 Gemini / LanguageModel" });
    } else {
      // still show Gemini as possible
      local.push({ key: "languageModel", label: "🧠 Gemini / LanguageModel" });
    }

    // Summarizer and Writer are considered local AI specialized helpers
    local.push({ key: "summarizer", label: "📝 Summarizer" });
    local.push({ key: "writer", label: "✍️ Writer" });

    // Specialized category
    specialized.push({ key: "translator", label: "🌐 Translator" });
    specialized.push({ key: "proofreader", label: "📋 Proofreader" });

    // Backend
    backend.push({ key: "n8n", label: "🔬 n8n (deep analysis)" });

    const mk = (item, cls) => {
      return `<div class="api-badge ${cls}" data-api-key="${item.key}" style="display:inline-block; margin-right:6px; margin-bottom:6px;">
      <span style="font-weight:600; margin-right:4px;">${item.label}</span>
      <span class="api-badge-status" style="margin-left:4px; color:#aaf; font-size:12px;">⏳</span>
    </div>`;
    };

    return `
  <div id="apis-categories" style="margin-top:10px; font-size:12px; color:#ccc;">
    
    <!-- Local AI sur sa propre ligne -->
    <div style="margin-bottom:8px;">
      <strong>Local AI:</strong> <span style="color:#7CFC00;">🟢</span>
    </div>
    <div style="margin-bottom:8px; margin-left:16px;">
      ${local.map((i) => mk(i, "local")).join("")}
    </div>
    
    <!-- Specialized -->
    <div style="margin-bottom:8px;">
      <strong>Specialized:</strong> <span style="color:#1E90FF;">🔵</span> 
    </div>
    <div>
      <span style="display:inline-flex; gap:6px; align-items:center;">
        ${specialized.map((i) => mk(i, "specialized")).join("")}
      </span>
    </div>
    
    <!-- Backend -->
    <div style="margin-bottom:6px;">
      <strong>Backend:</strong> <span style="color:#8A2BE2;">🟣</span> 
      ${backend.map((i) => mk(i, "backend")).join("")}
    </div>
  </div>
`;
  } catch (e) {
    console.log("⚠️ buildAPIBadgesHtml failed", e);
    return "";
  }
}

// Update API badge statuses by querying aiHelper.testSpecializedAPIs()
async function updateAPIBadgesStatus(
  deepCompleted = false,
  deepResults = null
) {
  try {
    // Handle custom status object format
    if (typeof deepCompleted === "object" && deepCompleted !== null) {
      const customStatuses = deepCompleted;
      Object.keys(customStatuses).forEach((key) => {
        const statusInfo = customStatuses[key];
        const el = document.querySelector(
          `[data-api-key="${key}"] .api-badge-status`
        );
        if (el) {
          el.textContent = statusInfo.label || statusInfo.status || "❓";
        }
      });
      return;
    }

    const status = await (aiHelper.testSpecializedAPIs
      ? aiHelper.testSpecializedAPIs()
      : Promise.resolve({}));

    const setStatus = (key, text) => {
      const el = document.querySelector(
        `[data-api-key="${key}"] .api-badge-status`
      );
      if (el) el.textContent = text;
    };

    // languageModel - prefer usedAPIs if available
    if (aiHelper && aiHelper.usedAPIs && aiHelper.usedAPIs.languageModel)
      setStatus("languageModel", "✅");
    else if (aiHelper.hasNativeAI || status.languageModel === "available")
      setStatus("languageModel", "✅");
    else setStatus("languageModel", "⏳");

    // summarizer
    if (aiHelper && aiHelper.usedAPIs && aiHelper.usedAPIs.summarizer)
      setStatus("summarizer", "✅");
    else if (status.summarizer === "available") setStatus("summarizer", "✅");
    else setStatus("summarizer", "⏳");

    // writer
    if (aiHelper && aiHelper.usedAPIs && aiHelper.usedAPIs.writer)
      setStatus("writer", "✅");
    else if (status.writer === "available") setStatus("writer", "✅");
    else setStatus("writer", "⏳");

    // translator
    if (aiHelper && aiHelper.usedAPIs && aiHelper.usedAPIs.translator)
      setStatus("translator", "✅");
    else if (status.translator === "available") setStatus("translator", "✅");
    else setStatus("translator", "⏳");

    // proofreader
    if (aiHelper && aiHelper.usedAPIs && aiHelper.usedAPIs.proofreader)
      setStatus("proofreader", "✅");
    else if (status.proofreader === "available") setStatus("proofreader", "✅");
    else setStatus("proofreader", "⏳");

    // Mark which APIs contributed based on deepResults (if provided)
    try {
      if (deepResults) {
        if (deepResults.aiSummary) setStatus("summarizer", "✅");
        if (deepResults.enhancedRecommendations) setStatus("writer", "✅");
        if (deepResults.translatedAnalysis) setStatus("translator", "✅");
        if (deepResults.proofreadAnalysis) setStatus("proofreader", "✅");
      }
    } catch (e) {
      /* ignore */
    }

    // n8n
    const n8nEl = document.querySelector(
      `[data-api-key="n8n"] .api-badge-status`
    );
    if (n8nEl) n8nEl.textContent = deepCompleted ? "✅" : "⏳";
  } catch (e) {
    console.log("⚠️ updateAPIBadgesStatus failed", e);
  }
}

// Tests of priority APIs
async function testSummarizer() {
  const resultsDiv = document.getElementById("ai-test-results");
  resultsDiv.style.display = "block";
  resultsDiv.innerHTML = "📝 Testing Summarizer API...";

  const testText =
    "SOC-CERT is a security operations center platform that provides real-time threat analysis, vulnerability management, and incident response capabilities. It uses advanced AI to detect and analyze security threats across multiple vectors including network traffic, endpoint activities, and cloud infrastructure. The platform integrates with various security tools and provides automated response capabilities.";

  try {
    const summary = await aiHelper.summarizeText(testText, {
      length: "short",
      type: "key-points",
    });
    resultsDiv.innerHTML = `✅ <strong>Summarizer Test:</strong><br>${summary.replace(
      /\n/g,
      "<br>"
    )}`;
  } catch (error) {
    resultsDiv.innerHTML = `❌ Summarizer Error: ${error.message}`;
  }
}

async function testWriter() {
  const resultsDiv = document.getElementById("ai-test-results");
  resultsDiv.style.display = "block";
  resultsDiv.innerHTML = "✍️ Testing Writer API...";

  try {
    const content = await aiHelper.writeContent(
      "Write a security incident response plan for a SOC team",
      { tone: "professional", format: "security" }
    );
    resultsDiv.innerHTML = `✅ <strong>Writer Test:</strong><br>${content.replace(
      /\n/g,
      "<br>"
    )}`;
  } catch (error) {
    resultsDiv.innerHTML = `❌ Writer Error: ${error.message}`;
  }
}

async function testTranslator() {
  const resultsDiv = document.getElementById("ai-test-results");
  resultsDiv.style.display = "block";
  resultsDiv.innerHTML = "🌐 Testing Translator API...";

  try {
    const translation = await aiHelper.translateText(
      "Alerte de sécurité: Activité suspecte détectée",
      "en"
    );
    resultsDiv.innerHTML = `✅ <strong>Translator Test:</strong><br>${translation.replace(
      /\n/g,
      "<br>"
    )}`;
  } catch (error) {
    resultsDiv.innerHTML = `❌ Translator Error: ${error.message}`;
  }
}

// === DISPLAY THREAT ANALYSIS ===
async function displayThreatAnalysis(analysis, siteUrl) {
  window.currentAnalysis = analysis;

  // 🛡️ SPECIAL HANDLING FOR SAFE URLs
  if (analysis.isSafeUrl) {
    console.log("🛡️ Displaying safe URL message");
    const content = document.getElementById("analysis-content");
    content.innerHTML = `
      <div style="background: rgba(0,255,0,0.1); padding: 20px; border-radius: 10px; margin-bottom: 15px; border-left: 4px solid #00ff00;">
        <!-- Analyzed URL -->
        <div style="margin-bottom: 15px; padding: 8px; background: rgba(0,0,0,0.2); border-radius: 5px; font-size: 12px; word-break: break-all;">
          <strong>🌐 Analyzed URL:</strong><br>
          <a href="${siteUrl}" target="_blank" style="color:#00aaff;">${siteUrl}</a>
        </div>

        <!-- Safe URL header -->
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 15px;">
          <div style="display: flex; align-items: center;">
            <span style="font-size: 24px; margin-right: 10px;">✅</span>
            <div>
              <div style="font-size: 18px; font-weight: bold;">Safe URL</div>
              <div style="font-size: 12px; opacity: 0.8;">No deep analysis needed</div>
            </div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 28px; font-weight: bold; color: #00ff00">${
              analysis.riskScore
            }%</div>
            <div style="font-size: 10px; opacity: 0.7;">Risk score</div>
          </div>
        </div>

        <!-- Safe message -->
        <div style="background: rgba(0,255,0,0.05); padding: 15px; border-radius: 8px; border: 1px solid rgba(0,255,0,0.2);">
          <div style="display: flex; align-items: center; gap: 10px;">
            <span style="font-size: 20px;">🛡️</span>
            <div>
              <div style="font-weight: bold; color: #00ff00; margin-bottom: 5px;">URL Considered Safe</div>
              <div style="font-size: 14px; color: #cccccc;">${
                analysis.safeReason ||
                "This URL has been analyzed and determined to be safe. No further analysis required."
              }</div>
            </div>
          </div>
        </div>
      </div>
    `;

    // Update API badges to show safe status
    updateAPIBadgesStatus({
      gemini: { status: "completed", label: "✅ Gemini (safe)" },
      n8n: { status: "skipped", label: "⏭️ n8n (not needed)" },
    });

    return;
  }

  const riskConfig = {
    safe: {
      color: "#00ff00",
      icon: "✅",
      label: "Safe",
      bg: "rgba(0,255,0,0.1)",
    },
    suspicious: {
      color: "#ffff00",
      icon: "⚠️",
      label: "Suspicious",
      // bg: "rgba(255,255,0,0.1)",
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
      label: "High Risk",
      bg: "rgba(255,85,0,0.1)",
    },
    malicious: {
      color: "#ff0000",
      icon: "🚨",
      label: "Malicious",
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
      <!-- Analyzed URL -->
      <div style="margin-bottom: 15px; padding: 8px; background: rgba(0,0,0,0.2); border-radius: 5px; font-size: 12px; word-break: break-all;">
        <strong>🌐 Analyzed URL:</strong><br>
        <a href="${siteUrl}" target="_blank" style="color:#00aaff;">${siteUrl}</a>
      </div>

      <!-- Risk header -->
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 15px;">
        <div style="display: flex; align-items: center;">
          <span style="font-size: 24px; margin-right: 10px;">${
            config.icon
          }</span>
          <div>
            <div style="font-size: 18px; font-weight: bold;">${
              config.label
            }</div>
            <div style="font-size: 12px; opacity: 0.8;">Confidence: ${(
              analysis.confidence * 100
            ).toFixed(0)}%</div>
          </div>
        </div>
        <div style="text-align: right;">
          <div style="font-size: 28px; font-weight: bold; color: ${
            config.color
          }">${analysis.riskScore}%</div>
          <div style="font-size: 10px; opacity: 0.7;">Risk score</div>
        </div>
      </div>

      <!-- Indicators -->
      ${
        analysis.indicators && analysis.indicators.length > 0
          ? `
        <div style="margin-bottom: 15px;">
          <div style="font-weight: bold; margin-bottom: 8px; display: flex; align-items: center; gap: 8px;">
            <span style="margin-right: 5px;">🚨</span> 
            Threat Indicators (${analysis.indicators.length})
            <!-- 💡 INFOBULLE EXPLICATIVE -->
            <span class="info-tooltip-trigger">i
              <span class="info-tooltip-content">
                <div class="tooltip-header">
                  <span class="tooltip-icon">🎯</span>
                  <div>
                    <strong class="tooltip-title">Threat Indicators</strong>
                    <span class="tooltip-subtitle">Types of Threats detected</span>
                  </div>
                </div>
                <div class="tooltip-divider">
                  <span class="tooltip-description">
                    Describes the type of vulnerability detected<br/>
                    by our AI security analysis engine
                  </span>
                </div>
                <span class="tooltip-arrow"></span>
              </span>
            </span>
          </div>
          <div style="font-size: 12px; background: rgba(0,0,0,0.2); padding: 8px; border-radius: 5px;">
            ${analysis.indicators.map((ind) => `• ${ind}`).join("<br>")}
          </div>
        </div>
      `
          : '<div style="margin-bottom: 15px;">✅ Aucun indicateur suspect détecté</div>'
      }

      <!-- Specialized APIs Results -->
      ${
        analysis.aiSummary ||
        analysis.enhancedRecommendations ||
        analysis.translatedAnalysis ||
        analysis.proofreadAnalysis
          ? `
        <div style="margin-top: 15px; padding: 10px; background: rgba(0,255,255,0.1); border-radius: 8px; border-left: 3px solid #00ffff;">
          <div style="font-weight: bold; margin-bottom: 8px; color: #00ffff;">
            🤖 Enhanced AI Analysis Results
          </div>
          
          ${
            analysis.aiSummary
              ? `
  <div style="margin-bottom: 10px;">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 3px;">
      <div style="font-size: 11px; font-weight: bold;">📝 Summarizer:</div>
      <button class="translate-mini-btn" data-target="ai-summary-text">
        🌐
      </button>
    </div>
    <div id="ai-summary-text" style="font-size: 12px; background: rgba(0,0,0,0.2); padding: 6px; border-radius: 4px; color: #ccc;">
      ${analysis.aiSummary}
    </div>
  </div>
`
              : ""
          }

${
  analysis.enhancedRecommendations
    ? `
  <div style="margin-bottom: 10px;">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 3px;">
      <div style="font-size: 11px; font-weight: bold;">✍️ Writer:</div>
      <button class="translate-mini-btn" data-target="ai-writer-text">
        🌐
      </button>
    </div>
    <div id="ai-writer-text" style="font-size: 12px; background: rgba(0,0,0,0.2); padding: 6px; border-radius: 4px; color: #ccc;">
      ${renderRecommendationsInline(analysis.enhancedRecommendations)}
    </div>
  </div>
`
    : ""
}

<!-- APIs used summary -->
${buildAPIBadgesHtml()}

${
  analysis.translatedAnalysis
    ? `
  <div style="margin-bottom: 10px;">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 3px;">
      <div style="font-size: 11px; font-weight: bold;">🌐 Translator:</div>
      <button class="translate-mini-btn" data-target="ai-translator-text">
        🌐
      </button>
    </div>
    <div id="ai-translator-text" style="font-size: 12px; background: rgba(0,0,0,0.2); padding: 6px; border-radius: 4px; font-style: italic; color: #ccc;">
      ${analysis.translatedAnalysis}
    </div>
  </div>
`
    : ""
}

${
  analysis.proofreadAnalysis
    ? `
  <div style="margin-bottom: 10px;">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 3px;">
      <div style="font-size: 11px; font-weight: bold;">📝 Proofreader:</div>
      <button class="translate-mini-btn" data-target="ai-proofreader-text">
        🌐
      </button>
    </div>
    <div id="ai-proofreader-text" style="font-size: 12px; background: rgba(0,0,0,0.2); padding: 6px; border-radius: 4px; color: #ccc;">
      ${analysis.proofreadAnalysis}
    </div>
  </div>
`
    : ""
}

        </div>
      `
          : ""
      }

      <!-- Metadata with progressive indicator -->
      <div style="margin-top: 15px; padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.2); font-size: 10px; opacity: 0.6;">
        <div>⏱️ ${analysis.processingTime || "2.3s"} • ${
    analysis.timestamp
      ? new Date(analysis.timestamp).toLocaleTimeString()
      : new Date().toLocaleTimeString()
  }</div>
        ${
          analysis.isProgressive
            ? `<div id="deep-analysis-status" style="color: #00ffff; display:flex; align-items:center; gap:8px;">
               <span style="width:14px; height:14px; border:3px solid rgba(255,255,255,0.08); border-top-color:#00ffff; border-radius:50%; display:inline-block; animation:spin 1s linear infinite;"></span>
               <span>Deep analysis n8n running...</span>
             </div>`
            : `<div>${analysis.mockNote || ""}</div>`
        }
      </div>
    </div>

    <!-- Info AI Status avec indicateur progressif -->
    <div style="background: rgba(255,255,255,0.05); padding: 10px; border-radius: 8px; font-size: 11px; text-align: center;">
      🤖 Powered by SOC-CERT AI ${
        aiHelper.hasNativeAI ? "(Gemini Nano)" : "(Mock - EPP Pending)"
      }
      ${
        analysis.isProgressive
          ? '<br><span id="ai-status-progress" style="color: #00ffff;">⚡ Quick analysis • 🔬 Deep analysis running...</span>'
          : ""
      }
    </div>
  `;

  // Refresh API badge statuses right after rendering
  try {
    updateAPIBadgesStatus(false, analysis);
  } catch (e) {
    console.log(
      "⚠️ updateAPIBadgesStatus failed after displayThreatAnalysis",
      e
    );
  }

  // ✅ ADD THESE LINES HERE (AT THE END, BEFORE THE })
  await chrome.storage.local.set({
    lastAnalysis: {
      threatLevel: analysis.threatLevel,
      riskScore: analysis.riskScore,
      description: analysis.description || analysis.summary,
      indicators: analysis.indicators || [],
      recommendations: analysis.recommendations || [],
    },
  });
  console.log("✅ Analysis saved for translation");
  const translateSection = document.getElementById("translate-section");
  if (translateSection) {
    translateSection.style.display = "block";
  }
}

// Debug version of analyzeCurrentPage - WITH REAL-TIME INTERFACE
async function analyzeCurrentPage() {
  try {
    console.log(
      "== 🚀 DEBUG ANALYSIS WITH REAL-TIME UI ===",
      new Date().toISOString()
    );
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });

    console.log("📊 Tab info:", {
      url: tab && tab.url,
      title: tab && tab.title,
      id: tab && tab.id,
    });

    if (tab && tab.url) {
      console.log(
        "🎯 Starting progressive analysis for:",
        tab.url,
        new Date().toISOString()
      );

      // 1. DISPLAY REAL-TIME INTERFACE
      await showRealTimeAnalysis(tab);
      console.log("📌 After showRealTimeAnalysis", new Date().toISOString());

      // 2. Pause for demo (optional - to see animation clearly)
      await new Promise((resolve) => setTimeout(resolve, 500));

      console.log("📊 Showing analysis results");

      // 3. Hide real-time analysis and show results
      document.getElementById("analysis-status").style.display = "none";
      document.getElementById("analysis-content").style.display = "block";

      document.getElementById("analysis-content").innerHTML = `
        <div style="text-align:center; margin-top:40px;">
          Analyzing... <span class="popup-spinner">⏳</span>
          <div style="margin-top:10px; color:#4fc3f7; font-weight:bold;"></div>
        </div>
      `;

      // 🔄 Check for stored background analysis first
      const storageKey = `analysis_${tab.url}`;
      const stored = await chrome.storage.local.get([storageKey]);
      let progressiveAnalysis;
      let usedStoredAnalysis = false;

      if (
        stored[storageKey] &&
        Date.now() - stored[storageKey].timestamp < 5 * 60 * 1000
      ) {
        // 5 minutes
        console.log("🔄 Using stored background analysis for:", tab.url);
        usedStoredAnalysis = true;
        const bgAnalysis = stored[storageKey].analysis;
        progressiveAnalysis = {
          ...bgAnalysis,
          isProgressive: true,
          currentStep: "quick-analysis",
          steps: {
            quickAnalysis: { status: "completed", data: bgAnalysis },
            deepAnalysis: { status: "pending", data: null },
            cveEnrichment: { status: "pending", data: null },
            finalRecommendations: { status: "pending", data: null },
          },
        };

        // 🛡️ Check if safe URL
        if (bgAnalysis.threatType && bgAnalysis.threatType.includes("safe")) {
          progressiveAnalysis.isSafeUrl = true;
          progressiveAnalysis.safeReason = `Threat type: ${bgAnalysis.threatType} - No deep analysis needed`;
        }
      } else {
        // 🔄 Wait a bit for background analysis to complete
        console.log("⏳ Waiting for background analysis to complete...");
        await new Promise((resolve) => setTimeout(resolve, 3000));

        // Check again for stored analysis
        const storedAgain = await chrome.storage.local.get([storageKey]);
        if (
          storedAgain[storageKey] &&
          Date.now() - storedAgain[storageKey].timestamp < 5 * 60 * 1000
        ) {
          console.log(
            "🔄 Using stored background analysis (after wait) for:",
            tab.url
          );
          usedStoredAnalysis = true;
          const bgAnalysis = storedAgain[storageKey].analysis;
          progressiveAnalysis = {
            ...bgAnalysis,
            isProgressive: true,
            currentStep: "quick-analysis",
            steps: {
              quickAnalysis: { status: "completed", data: bgAnalysis },
              deepAnalysis: { status: "pending", data: null },
              cveEnrichment: { status: "pending", data: null },
              finalRecommendations: { status: "pending", data: null },
            },
          };

          // 🛡️ Check if safe URL
          if (bgAnalysis.threatType && bgAnalysis.threatType.includes("safe")) {
            progressiveAnalysis.isSafeUrl = true;
            progressiveAnalysis.safeReason = `Threat type: ${bgAnalysis.threatType} - No deep analysis needed`;
          }
        } else {
          console.log("🆕 Running new analysis for:", tab.url);
          progressiveAnalysis = await aiHelper.analyzeCompleteFlow(
            tab.url,
            `Analyzing: ${tab.title}`
          );
        }
      }

      console.log("📈 Progressive analysis started:", progressiveAnalysis);

      // 🔄 If using stored analysis and not safe, trigger deep analysis
      if (usedStoredAnalysis && !progressiveAnalysis.isSafeUrl) {
        console.log("🔄 Triggering deep analysis for stored non-safe URL");
        setTimeout(async () => {
          try {
            await aiHelper.triggerDeepAnalysis(
              tab.url,
              `Analyzing: ${tab.title}`,
              progressiveAnalysis
            );
          } catch (error) {
            console.error("❌ Error triggering deep analysis:", error);
          }
        }, 100);
      }

      // Display quick analysis immediately
      console.log(
        "📌 About to call displayThreatAnalysis (isProgressive=)",
        progressiveAnalysis.isProgressive,
        new Date().toISOString()
      );
      displayThreatAnalysis(progressiveAnalysis, tab.url);
      console.log("📌 After displayThreatAnalysis", new Date().toISOString());

      // Only start deep analysis spinner if NOT a safe URL
      if (!progressiveAnalysis.isSafeUrl) {
        // Ensure deep analysis status shows running state for new analysis
        setDeepAnalysisStatusRunning();
        console.log(
          "📌 After setDeepAnalysisStatusRunning",
          new Date().toISOString()
        );
        // Ensure AI status shows running state too
        setAIStatusRunning();
        console.log("📌 After setAIStatusRunning", new Date().toISOString());

        // Show spinner while deep analysis / polling is running
        console.log(
          "📌 About to showDeepSpinner and attach deepAnalysisUpdate listener",
          new Date().toISOString()
        );
        showDeepSpinner();

        // Initialize with starting state
        updateWithDeepResults({ stage: "starting" });

        window.addEventListener("deepAnalysisUpdate", (event) => {
          console.log(
            "🔍 Deep analysis update received:",
            event.detail,
            new Date().toISOString()
          );

          // Determine current stage based on event.detail
          let stage = "starting";
          if (event.detail.dataReceived) {
            stage = "data-received";
          } else if (event.detail.enhancing) {
            stage = "enhancing";
          } else if (event.detail.completed) {
            stage = "completed";
          }

          // Update interface with current stage
          updateWithDeepResults({ ...event.detail, stage });
        });
        console.log(
          "📌 deepAnalysisUpdate listener attached",
          new Date().toISOString()
        );
      } else {
        console.log("🛡️ Safe URL detected - skipping deep analysis spinner");
        // For safe URLs, mark deep analysis as completed/skipped
        updateAPIBadgesStatus({
          gemini: { status: "completed", label: "✅ Gemini (safe)" },
          n8n: { status: "skipped", label: "⏭️ n8n (not needed)" },
        });
      }
    } else {
      console.log("❌ No valid tab found");
      document.getElementById("analysis-content").innerHTML = `
                <div style="background: rgba(255,0,0,0.1); padding: 15px; border-radius: 10px; text-align: center;">
                    <h3>No Active Tab</h3>
                    <p>Please open a webpage to analyze its security.</p>
                </div>
            `;
    }
  } catch (error) {
    console.error("❌ Analysis error:", error);
    document.getElementById("analysis-content").innerHTML = `
            <div style="background: rgba(255,0,0,0.1); padding: 15px; border-radius: 10px;">
                <h3>Analysis Error</h3>
                <p>${error.message}</p>
            </div>
        `;
  }
}

// ============================================
// GLOBAL STATE FOR DEEP ANALYSIS
// ============================================
let deepAnalysisState = {
  stage: null,
  timestamp: null,
  timeout: null,
};

// ============================================
// UPDATE WITH DEEP RESULTS (CORRECTED)
// ============================================
async function updateWithDeepResults(deepData) {
  console.log("🔄 updateWithDeepResults called with:", deepData);

  // 🎯 UPDATE the status in n8n badge
  let statusText = "n8n running";
  let showSpinner = true;

  if (deepData && deepData.stage) {
    switch (deepData.stage) {
      case "starting":
        statusText = "n8n running";
        break;
      case "data-received":
        statusText = "📥 Data received";
        // Schedule transition to "enhancing" after 2 seconds
        break;
      case "enhancing":
        statusText = "🔄 Enhancement recommendations";
        // Schedule transition to "completed" after 3 seconds

        break;
      case "completed":
        statusText = "✅ Analysis completed";
        showSpinner = false;
        break;
      default:
        statusText = "n8n running";
    }
  }

  // Update n8n badge
  const n8nBadge = document.querySelector(
    '[data-api-key="n8n"] .api-badge-status'
  );
  if (n8nBadge) {
    if (showSpinner) {
      n8nBadge.innerHTML = `<div style="display:flex; align-items:center; gap:4px;"><span style="width:10px; height:10px; border:2px solid rgba(255,255,255,0.1); border-top-color:#4fc3f7; border-radius:50%; display:inline-block; animation:spin 1s linear infinite;"></span><span>${statusText}</span></div>`;
    } else {
      n8nBadge.textContent = statusText;
    }
  }

  // 🎯 UPDATE the progress indicator
  const progressiveIndicator = document.getElementById("deep-analysis-status");
  if (progressiveIndicator) {
    progressiveIndicator.style.color = "#00ffff";
    progressiveIndicator.innerHTML = `<div style="display:flex; align-items:center; gap:8px;">${
      showSpinner
        ? '<span style="width:14px; height:14px; border:3px solid rgba(255,255,255,0.08); border-top-color:#00ffff; border-radius:50%; display:inline-block; animation:spin 1s linear infinite;"></span>'
        : ""
    }<span>${statusText}</span></div>`;
  }

  // 🎯 UPDATE the AI Status section
  const aiStatusSection = document.getElementById("ai-status-progress");
  if (aiStatusSection) {
    aiStatusSection.style.color = "#00ffff";
    aiStatusSection.innerHTML = showSpinner
      ? "⚡ Quick analysis • 🔄 Processing..."
      : "⚡ Quick analysis • ✅ Complete";

    // Mark n8n as used (deep analysis source)
    try {
      if (aiHelper) aiHelper.usedAPIs = aiHelper.usedAPIs || {};
      if (aiHelper) aiHelper.usedAPIs.n8n = true;
    } catch (e) {
      console.log("⚠️ Failed to mark n8n used on aiHelper", e);
    }

    // Add a deep analysis section
    const analysisContent = document.getElementById("analysis-content");

    // Find or create the deep analysis section
    let deepSection = document.getElementById("deep-analysis-section");
    if (!deepSection) {
      deepSection = document.createElement("div");
      deepSection.id = "deep-analysis-section";
      deepSection.style.cssText = `
      margin-top: 15px;
      padding: 15px;
      background: rgba(0,255,255,0.1);
      border-radius: 10px;
      border-left: 4px solid #00ffff;
    `;
      analysisContent.appendChild(deepSection);
    }

    // === 🎯 TENTATIVE GEMINI ENHANCED ANALYSIS ===
    console.log("🎯 Attempting to call generateEnhancedAnalysis...");

    let enhancedRecommendations = [
      "Enable real-time monitoring",
      "Update security policies",
      "Review access controls",
    ];

    try {
      // Check if function exists AND if currentAnalysis is defined
      if (
        aiHelper &&
        typeof aiHelper.generateEnhancedAnalysis === "function" &&
        window.currentAnalysis
      ) {
        console.log("✅ AI: generateEnhancedAnalysis will be called");

        // Call the enriched generation function (Gemini)
        enhancedRecommendations = await aiHelper.generateEnhancedAnalysis(
          window.currentAnalysis,
          deepData.deepResults
        );
        console.log("✅ Enhanced recommendations:", enhancedRecommendations);

        // Now that enhanced analysis finished, mark deep analysis as completed and hide spinner
        try {
          if (progressiveIndicator) {
            progressiveIndicator.style.color = "#00ff00";
            progressiveIndicator.innerHTML = `<div style="display:flex; align-items:center; gap:8px;"><span style=\"font-size:14px;\">✅</span><span>Deep analysis completed</span></div>`;
            console.log(
              "✅ Updated deep analysis status to completed (post-enhanced)"
            );
          }
          if (aiStatusSection) {
            aiStatusSection.style.color = "#00ff00";
            aiStatusSection.innerHTML =
              "⚡ Quick analysis • ✅ Deep analysis completed";
            console.log(
              "✅ Updated AI status progress to completed (post-enhanced)"
            );
          }
        } catch (e) {
          console.log("⚠️ Error updating status to completed:", e.message || e);
        }

        // Hide spinner now that everything is done
        hideDeepSpinner();
        // Update API badges statuses now that deep analysis finished
        try {
          updateAPIBadgesStatus(true);
        } catch (e) {
          console.log(
            "⚠️ updateAPIBadgesStatus failed in updateWithDeepResults",
            e
          );
        }
      } else {
        console.log(
          "❌ AI: generateEnhancedAnalysis not available or missing data"
        );
      }
    } catch (error) {
      console.log("⚠️ Enhanced analysis skipped:", error.message);
    }
    // Compute relevance score if provided by aiHelper
    const relevanceScore = aiHelper?.lastEnhancedValidation?.score ?? null;
    const relevanceHtml =
      relevanceScore !== null
        ? `<span style="font-size:11px; color:#aaf; margin-left:8px;">Relevance: ${relevanceScore}%</span>`
        : "";

    deepSection.innerHTML = `
    <div style="display: flex; align-items: center; margin-bottom: 10px;">
      <span style="font-size: 20px; margin-right: 10px;">🔬</span>
      <h3 style="margin: 0; color: #00ffff;">Deep Analysis Results By Gemini Nano</h3>
    </div>
    
    <div style="margin-bottom: 10px;">
      <strong>🧠 Enhanced AI Analysis:</strong>
      <div style="background: rgba(0,0,0,0.2); padding: 8px; border-radius: 5px; margin-top: 5px; font-size: 12px;">
        ${
          deepData.deepResults?.aiAnalysis ||
          "Advanced threat correlation completed"
        }
      </div>
    </div>

    <div style="margin: 12px 0; text-align:center; color:#eee;">━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</div>

    <div style="margin-bottom: 10px;">
  <strong class="cve-correlation-header">

  🚨 CVE Correlation
  
  <!-- 💡 INFOBULLE EXPLICATIVE -->
  <span class="info-tooltip-trigger">i
    <span class="info-tooltip-content">
      <div class="tooltip-header">
        <span class="tooltip-icon">🔮</span>
        <div>
          <strong class="tooltip-title">VIRTUAL CVE(AI-Generated CVE)</strong>
                    <span class="tooltip-subtitle">Threat detected in real time by Gemini Nano AI</span>
        </div>
      </div>
      <div class="tooltip-divider">
              <span class="tooltip-label">✨ <strong>Our advantage:</strong></span>
              <span class="tooltip-description">
                Instant detection of emerging threats by SOC-CERT<br/>
                not yet listed in the official NVD database.<br/
                Official NVD CVEs are published with a delay of several weeks or months.<br/
                This early detection allows you to take action before public disclosure.
              </span>
            </div>
      <span class="tooltip-arrow"></span>
    </span>
  </span>
</strong>

<div class="cve-container">
  ${(() => {
    console.log("🔍 DEBUG CVE Display:", deepData.deepResults);

    // ✅ CAS 1 : CVE direct dans deepResults
    if (deepData.deepResults?.cve_id) {
      console.log("✅ CVE found:", deepData.deepResults.cve_id);
      return `
        <div class="cve-item">
          <div class="cve-header">
            <span class="cve-id">${deepData.deepResults.cve_id}</span>
            
            <span class="cve-badge ${
              deepData.deepResults.isVirtual ||
              (deepData.deepResults.cve_id &&
                deepData.deepResults.cve_id.startsWith("CVE-2026"))
                ? "emerging-threat"
                : "official-cve"
            }">
              <span class="badge-icon">${
                deepData.deepResults.isVirtual ||
                (deepData.deepResults.cve_id &&
                  deepData.deepResults.cve_id.startsWith("CVE-2026"))
                  ? "🔮"
                  : "✅"
              }</span>
              <span class="badge-text">${
                deepData.deepResults.isVirtual ||
                (deepData.deepResults.cve_id &&
                  deepData.deepResults.cve_id.startsWith("CVE-2026"))
                  ? "EMERGING THREAT"
                  : "Official CVE"
              }</span>
              <span class="badge-tooltip">${
                deepData.deepResults.isVirtual ||
                (deepData.deepResults.cve_id &&
                  deepData.deepResults.cve_id.startsWith("CVE-2026"))
                  ? "🚀 Threat detected in real time by our AI - Not yet listed in NVD"
                  : "Verified CVE from official database"
              }</span>
            </span>
            
            <span class="severity ${deepData.deepResults.severity?.toLowerCase()}">${
        deepData.deepResults.severity
      }</span>
          </div>
          <span class="badge badge-${
            deepData.deepResults.severity?.toLowerCase() || "critical"
          }" style="
            background: ${
              deepData.deepResults.severity === "Critical"
                ? "#ff0000"
                : "#ff9900"
            };
            color: white;
            padding: 3px 8px;
            border-radius: 3px;
            font-size: 10px;
            font-weight: bold;
            margin-left: 8px;
          ">
            ${deepData.deepResults.severity || "Critical"}
          </span>
          <br>
          <span class="cve-score" style="font-size: 11px; color: #aaa;">Score: ${
            deepData.deepResults.score || "N/A"
          }</span>
          ${(() => {
            const item = deepData.deepResults;
            if (!item) return "";

            const isVirtual =
              item.isVirtual ||
              (item.cve_id && item.cve_id.startsWith("CVE-2026"));
            let nvdLink;
            let nvdLinkText;

            if (isVirtual) {
              const searchQuery =
                (item.indicators && item.indicators.join(" ")) ||
                item.threatType ||
                "web vulnerability";
              nvdLink = `https://nvd.nist.gov/vuln/search/results?query=${encodeURIComponent(
                searchQuery
              )}`;
              nvdLinkText = `🔍 Search NVD for ${
                (item.indicators && item.indicators[0]) ||
                item.threatType ||
                "vulnerabilities"
              }`;
            } else if (item.cve_id) {
              nvdLink = `https://nvd.nist.gov/vuln/detail/${item.cve_id}`;
              nvdLinkText = "View on NVD";
            } else if (item.link) {
              nvdLink = item.link;
              nvdLinkText = "View Details";
            } else {
              return "";
            }

            return `\n              <br><a href="${nvdLink}" target="_blank" style="color: #00aaff; font-size: 11px;" title="${
              isVirtual
                ? "Search for similar vulnerabilities in NVD"
                : "View official CVE details"
            }">${nvdLinkText} →</a>`;
          })()}
        </div>
      `;
    }

    // ✅ CAS 2 : Array de results
    if (deepData.deepResults?.results?.length > 0) {
      console.log(
        "✅ CVE results array found:",
        deepData.deepResults.results.length
      );
      return deepData.deepResults.results
        .map(
          (cve) => `
          <div class="cve-item">
            <div class="cve-header">
              <span class="cve-id">${cve.cve_id}</span>
              
              <span class="cve-badge ${
                cve.isVirtual ||
                (cve.cve_id && cve.cve_id.startsWith("CVE-2026"))
                  ? "emerging-threat"
                  : "official-cve"
              }">
                <span class="badge-icon">${
                  cve.isVirtual ||
                  (cve.cve_id && cve.cve_id.startsWith("CVE-2026"))
                    ? "🔮"
                    : "✅"
                }</span>
                <span class="badge-text">${
                  cve.isVirtual ||
                  (cve.cve_id && cve.cve_id.startsWith("CVE-2026"))
                    ? "Virtual CVE"
                    : "Official CVE"
                }</span>
                <span class="badge-tooltip">${
                  cve.isVirtual ||
                  (cve.cve_id && cve.cve_id.startsWith("CVE-2026"))
                    ? "🚀 Menace détectée en temps réel par notre IA"
                    : "Verified CVE from official database"
                }</span>
              </span>
              
              <span class="severity ${cve.severity?.toLowerCase()}">${
            cve.severity
          }</span>
            </div>
            <span class="badge badge-${
              cve.severity?.toLowerCase() || "unknown"
            }">
              ${cve.severity || "Unknown"}
            </span>
            <br>
            <span class="cve-score">Score: ${cve.score || "N/A"}</span>
          </div>
        `
        )
        .join("<br>");
    }

    // ✅ CAS 3 : Array de cveResults
    if (deepData.deepResults?.cveResults?.length > 0) {
      console.log(
        "✅ CVE cveResults array found:",
        deepData.deepResults.cveResults.length
      );
      return deepData.deepResults.cveResults
        .map((cve) => `${cve.id} (${cve.severity}) - ${cve.description}`)
        .join("<br>");
    }

    console.log("❌ No CVE data found in deepResults");
    return "⏳ Waiting for CVE data...";
  })()}
</div>

<!-- NVD link now generated per-item above -->

</div>

    ${""}
    
      <div style="margin-bottom: 10px; margin-top: 15px:flex; align-items:center; justify-content:space-between;">
  <div>
    <strong>💡 AI-Enhanced Recommendations:</strong>
    <span class="badge-new orange">NEW</span>
    <div style="font-size: 10px; color: #eee; margin: 2px 0;">Generated with Gemini Nano + CVE Intelligence</div>
  </div>
  <div style="display: flex; align-items: center; gap: 8px;">
    <button class="translate-mini-btn" data-target="ai-recommendations-list">
  🌐
</button>

    <div style="text-align:right;">${relevanceHtml}</div>
  </div>
</div>
<div id="ai-recommendations-list">
  ${renderRecommendationsList(enhancedRecommendations)}
</div>


    <!-- 🎯 POINT 2: Educational Resources Section -->
    ${(() => {
      // Extract indicators from deepData for resource generation
      let indicators = [];

      if (deepData.deepResults?.indicators) {
        indicators = deepData.deepResults.indicators;
      } else if (deepData.deepResults?.results?.length > 0) {
        // Extract indicators from results array
        indicators = deepData.deepResults.results
          .filter((result) => result.indicators)
          .flatMap((result) => result.indicators);
      }

      console.log("🔍 DEBUG: Indicators for resources:", indicators);
      console.log("🔍 DEBUG: deepData.deepResults:", deepData.deepResults);

      // Always show educational resources section (use default if no specific indicators)
      const detected = resourcesGenerator.detectVulnerabilityType(indicators);
      const resources = detected || {
        type: "General Web Security",
        ...resourcesGenerator.defaultResources,
      };

      return `
          <div style="margin: 20px 0; padding: 15px; background: rgba(0,255,255,0.05); border-radius: 10px; border-left: 3px solid #00ffff;">
            <div style="margin-bottom: 20px;">
              <button class="learn-more-btn">
                📚 Learn More About This Threat
              </button>
              <p style="margin: 8px 0 0 0; font-size: 12px; color: #aaa;">
                Educational resources and hands-on practice
              </p>
            </div>

            <!-- Vulnerability Classification -->
            <div style="margin-bottom: 15px;">
              <div style="display: flex; align-items: center; margin-bottom: 8px;">
                <span style="font-size: 16px; margin-right: 8px;">🔍</span>
                <h4 style="margin: 0; font-size: 14px; color: #fff;">Vulnerability Classification</h4>
              </div>
              <div style="background: rgba(0,0,0,0.2); padding: 10px; border-radius: 6px; font-size: 12px;">
                <div style="margin-bottom: 6px;"><strong>Type:</strong> ${
                  resources.type
                }</div>
                <div><strong>CWE Reference:</strong> <a href="${
                  resources.cweUrl
                }" target="_blank" style="color: #00aaff;">CWE-${
        resources.cwe
      }: ${resources.type} ↗</a></div>
              </div>
            </div>

            <!-- Prevention Guides -->
            <div style="margin-bottom: 15px;">
              <div style="display: flex; align-items: center; margin-bottom: 8px;">
                <span style="font-size: 16px; margin-right: 8px;">📖</span>
                <h4 style="margin: 0; font-size: 14px; color: #fff;">Prevention Guides</h4>
              </div>
              <div style="background: rgba(0,0,0,0.2); padding: 10px; border-radius: 6px;">
                ${resources.guides
                  .map(
                    (guide) => `
                  <div style="margin-bottom: 6px; padding: 8px; background: rgba(255,255,255,0.05); border-radius: 4px;">
                    <a href="${guide.url}" target="_blank" style="color: #00aaff; text-decoration: none; display: block;">
                      <div style="font-weight: bold; margin-bottom: 3px;">${guide.title}</div>
                      <div style="font-size: 11px; color: #ccc; margin-bottom: 3px;">${guide.description}</div>
                      <span style="font-size: 12px;">→</span>
                    </a>
                  </div>
                `
                  )
                  .join("")}
              </div>
            </div>

            <!-- Hands-On Practice -->
            <div>
              <div style="display: flex; align-items: center; margin-bottom: 8px;">
                <span style="font-size: 16px; margin-right: 8px;">🧪</span>
                <h4 style="margin: 0; font-size: 14px; color: #fff;">Hands-On Practice</h4>
              </div>
              <div style="background: rgba(0,0,0,0.2); padding: 10px; border-radius: 6px;">
                ${resources.labs
                  .map(
                    (lab) => `
                  <div style="margin-bottom: 6px; padding: 8px; background: rgba(255,255,255,0.05); border-radius: 4px;">
                    <a href="${lab.url}" target="_blank" style="color: #00aaff; text-decoration: none; display: block;">
                      <div style="font-weight: bold; margin-bottom: 3px;">${lab.title}</div>
                      <div style="font-size: 11px; color: #ccc; margin-bottom: 3px;">${lab.description}</div>
                      <span style="font-size: 12px;">→</span>
                    </a>
                  </div>
                `
                  )
                  .join("")}
              </div>
            </div>
          </div>
        `;
    })()}

      <div style="font-size: 11px; color: #aaa; text-align: right;">
        🔬 Deep analysis completed in ${deepData.attempt * 3}s
      ${
        deepData.deepResults?.correlationWithQuickAnalysis
          ? "<br>✅ " +
            deepData.deepResults.correlationWithQuickAnalysis.consistencyCheck
          : ""
      }
    </div>
  `;

    // (no dynamic source label used)
    console.log("✅ Deep analysis section updated");
  }
  function displayThreatAnalysis(analysis, siteUrl) {
    window.currentAnalysis = analysis;

    // 🛡️ SPECIAL HANDLING FOR SAFE URLs
    if (analysis.isSafeUrl) {
      console.log("🛡️ Displaying safe URL message");
      const content = document.getElementById("analysis-content");
      content.innerHTML = `
      <div style="background: rgba(0,255,0,0.1); padding: 20px; border-radius: 10px; margin-bottom: 15px; border-left: 4px solid #00ff00;">
        <!-- Analyzed URL -->
        <div style="margin-bottom: 15px; padding: 8px; background: rgba(0,0,0,0.2); border-radius: 5px; font-size: 12px; word-break: break-all;">
          <strong>🌐 Analyzed URL:</strong><br>
          <a href="${siteUrl}" target="_blank" style="color:#00aaff;">${siteUrl}</a>
        </div>

        <!-- Safe URL header -->
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 15px;">
          <div style="display: flex; align-items: center;">
            <span style="font-size: 24px; margin-right: 10px;">✅</span>
            <div>
              <div style="font-size: 18px; font-weight: bold;">Safe URL</div>
              <div style="font-size: 12px; opacity: 0.8;">No deep analysis needed</div>
            </div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 28px; font-weight: bold; color: #00ff00">${
              analysis.riskScore
            }%</div>
            <div style="font-size: 10px; opacity: 0.7;">Risk score</div>
          </div>
        </div>

        <!-- Safe message -->
        <div style="background: rgba(0,255,0,0.05); padding: 15px; border-radius: 8px; border: 1px solid rgba(0,255,0,0.2);">
          <div style="display: flex; align-items: center; gap: 10px;">
            <span style="font-size: 20px;">🛡️</span>
            <div>
              <div style="font-weight: bold; color: #00ff00; margin-bottom: 5px;">URL Considered Safe</div>
              <div style="font-size: 14px; color: #cccccc;">${
                analysis.safeReason ||
                "This URL has been analyzed and determined to be safe. No further analysis required."
              }</div>
            </div>
          </div>
        </div>
      </div>
    `;

      // Update API badges to show safe status
      updateAPIBadgesStatus({
        gemini: { status: "completed", label: "✅ Gemini (safe)" },
        n8n: { status: "skipped", label: "⏭️ n8n (not needed)" },
      });

      return;
    }

    const riskConfig = {
      safe: {
        color: "#00ff00",
        icon: "✅",
        label: "Safe",
        bg: "rgba(0,255,0,0.1)",
      },
      suspicious: {
        color: "#ffff00",
        icon: "⚠️",
        label: "Suspicious",
        // bg: "rgba(255,255,0,0.1)",
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
        label: "High Risk",
        bg: "rgba(255,85,0,0.1)",
      },
      malicious: {
        color: "#ff0000",
        icon: "🚨",
        label: "Malicious",
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
  <!-- Analyzed URL -->
  <div style="margin-bottom: 15px; padding: 8px; background: rgba(0,0,0,0.2); border-radius: 5px; font-size: 12px; word-break: break-all;">
    <strong>🌐 Analyzed URL:</strong><br>
    <a href="${siteUrl}" target="_blank" style="color:#00aaff;">${siteUrl}</a>
  </div>

  <!-- Risk header -->
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 15px;">
        <div style="display: flex; align-items: center;">
          <span style="font-size: 24px; margin-right: 10px;">${
            config.icon
          }</span>
          <div>
            <div style="font-size: 18px; font-weight: bold;">${
              config.label
            }</div>
            <div style="font-size: 12px; opacity: 0.8;">Confidence: ${(
              analysis.confidence * 100
            ).toFixed(0)}%</div>
          </div>
        </div>
        <div style="text-align: right;">
          <div style="font-size: 28px; font-weight: bold; color: ${
            config.color
          }">${analysis.riskScore}%</div>
          <div style="font-size: 10px; opacity: 0.7;">Risk score</div>
        </div>
      </div>

  <!-- Indicators -->
      ${
        analysis.indicators && analysis.indicators.length > 0
          ? `
        <div style="margin-bottom: 15px;">
          <div style="font-weight: bold; margin-bottom: 8px; display: flex; align-items: center; gap: 8px;">
  <span style="margin-right: 5px;">🚨</span> 
  Threat Indicators (${analysis.indicators.length})
  
  <!-- 💡 INFOBULLE EXPLICATIVE -->
  <span class="info-tooltip-trigger">i
    <span class="info-tooltip-content">
      <div class="tooltip-header">
        <span class="tooltip-icon">🎯</span>
        <div>
          <strong class="tooltip-title">Threat Indicators</strong>
          <span class="tooltip-subtitle">Types of Threats detected</span>
        </div>
      </div>
      <div class="tooltip-divider">
        <span class="tooltip-description">
          Describes the type of vulnerability detected<br/>
          by our AI security analysis engine
        </span>
      </div>
      <span class="tooltip-arrow"></span>
    </span>
  </span>
</div>

          <div style="font-size: 12px; background: rgba(0,0,0,0.2); padding: 8px; border-radius: 5px;">
            ${analysis.indicators.map((ind) => `• ${ind}`).join("<br>")}
          </div>
        </div>
      `
          : '<div style="margin-bottom: 15px;">✅ Aucun indicateur suspect détecté</div>'
      }

  <!-- (SOC-CERT Recommendations removed - redundant with enhanced recommendations) -->

  <!-- Specialized APIs Results -->
      ${
        analysis.aiSummary ||
        analysis.enhancedRecommendations ||
        analysis.translatedAnalysis ||
        analysis.proofreadAnalysis
          ? `
        <div style="margin-top: 15px; padding: 10px; background: rgba(0,255,255,0.1); border-radius: 8px; border-left: 3px solid #00ffff;">
          <div style="font-weight: bold; margin-bottom: 8px; color: #00ffff;">
            🤖 Enhanced AI Analysis Results
          </div>
          
          ${
            analysis.aiSummary
              ? `
            <div style="margin-bottom: 10px;">
              <div style="font-size: 11px; font-weight: bold; margin-bottom: 3px;">📝 Summarizer:</div>
              <div style="font-size: 12px; background: rgba(0,0,0,0.2); padding: 6px; border-radius: 4px;">
                ${analysis.aiSummary}
              </div>
            </div>
          `
              : ""
          }
          
          ${
            analysis.enhancedRecommendations
              ? `
            <div style="margin-bottom: 10px;">
              <div style="font-size: 11px; font-weight: bold; margin-bottom: 3px;">✍️ Writer:</div>
              <div style="font-size: 12px; background: rgba(0,0,0,0.2); padding: 6px; border-radius: 4px;">
                ${renderRecommendationsInline(analysis.enhancedRecommendations)}
              </div>
            </div>
          `
              : ""
          }

          <!-- APIs used summary -->
          ${buildAPIBadgesHtml()}
          
          ${
            analysis.translatedAnalysis
              ? `
            <div style="margin-bottom: 10px;">
              <div style="font-size: 11px; font-weight: bold; margin-bottom: 3px;">🌐 Translator:</div>
              <div style="font-size: 12px; background: rgba(0,0,0,0.2); padding: 6px; border-radius: 4px; font-style: italic;">
                ${analysis.translatedAnalysis}
              </div>
            </div>
          `
              : ""
          }
          
          ${
            analysis.proofreadAnalysis
              ? `
            <div style="margin-bottom: 10px;">
              <div style="font-size: 11px; font-weight: bold; margin-bottom: 3px;">📝 Proofreader:</div>
              <div style="font-size: 12px; background: rgba(0,0,0,0.2); padding: 6px; border-radius: 4px;">
                ${analysis.proofreadAnalysis}
              </div>
            </div>
          `
              : ""
          }
        </div>
      `
          : ""
      }

  <!-- Metadata with progressive indicator -->
      <div style="margin-top: 15px; padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.2); font-size: 10px; opacity: 0.6;">
        <div>⏱️ ${analysis.processingTime || "2.3s"} • ${
      analysis.timestamp
        ? new Date(analysis.timestamp).toLocaleTimeString()
        : new Date().toLocaleTimeString()
    }</div>
        ${
          analysis.isProgressive
            ? `<div id="deep-analysis-status" style="color: #00ffff; display:flex; align-items:center; gap:8px;">
                 <span style="width:14px; height:14px; border:3px solid rgba(255,255,255,0.08); border-top-color:#00ffff; border-radius:50%; display:inline-block; animation:spin 1s linear infinite;"></span>
                 <span>Deep analysis n8n running...</span>
               </div>`
            : `<div>${analysis.mockNote || ""}</div>`
        }
      </div>
    </div>

    <!-- Info AI Status avec indicateur progressif -->
    <div style="background: rgba(255,255,255,0.05); padding: 10px; border-radius: 8px; font-size: 11px; text-align: center;">
      🤖 Powered by SOC-CERT AI ${
        aiHelper.hasNativeAI ? "(Gemini Nano)" : "(Mock - EPP Pending)"
      }
      ${
        analysis.isProgressive
          ? '<br><span id="ai-status-progress" style="color: #00ffff;">⚡ Quick analysis • 🔬 Deep analysis running...</span>'
          : ""
      }
    </div>
  `;
    // Refresh API badge statuses right after rendering
    try {
      updateAPIBadgesStatus(false, analysis);
    } catch (e) {
      console.log(
        "⚠️ updateAPIBadgesStatus failed after displayThreatAnalysis",
        e
      );
    }

    // Initialize API badges statuses after DOM insertion
    try {
      updateAPIBadgesStatus(false);
    } catch (e) {
      console.log("⚠️ updateAPIBadgesStatus init failed", e);
    }
  }

  // 🆕 SIMPLIFIED CVE POLLING
  async function startCVEPolling() {
    console.log("🔄 Démarrage polling CVE...");

    // Create container if it doesn't exist
    let container = document.getElementById("alerts-container");
    if (!container) {
      container = document.createElement("div");
      container.id = "alerts-container";
      container.style.cssText =
        "margin-top: 20px; padding: 10px; background: rgba(255,255,255,0.05); border-radius: 8px;";
      document.body.appendChild(container);
    }

    try {
      const extensionId = chrome.runtime.id;
      const url = `https://soc-cert-extension.vercel.app/api/extension-result?extensionId=${extensionId}&format=cve`;
      console.log("🌐 Fetching CVE data from:", url);

      const response = await fetch(url);
      console.log("📡 Response status:", response.status, response.statusText);

      const data = await response.json();
      console.log("📊 CVE Response:", JSON.stringify(data, null, 2));

      // ✅ Handle both old and new formats
      let cveData = null;
      let hasData = false;

      // Old format : {success: true, results: [...]}
      if (data.success && data.results && data.results.length > 0) {
        console.log(
          "✅ CVE Alerts trouvées (format ancien):",
          data.results.length
        );
        cveData = data.results;
        hasData = true;
      }
      // New format : {result: {...}} ou {result: [...]}
      else if (data.result && data.result !== null) {
        console.log("✅ CVE Alerts trouvées (format nouveau):", data.result);
        // new array of results
        if (Array.isArray(data.result)) {
          cveData = data.result;
          hasData = data.result.length > 0;
        }
        // If it's a single object, wrap it into an array
        else {
          cveData = [data.result];
          hasData = true;
        }
      }

      if (hasData && cveData && cveData.length > 0) {
        console.log("🎉 Affichage des CVE:", cveData.length);
        displayCVEAlerts(cveData);
      } else {
        console.log("ℹ️ Pas d'alertes CVE disponibles");
        console.log("🔍 Debug info:", {
          success: data.success,
          resultsExist: !!data.results,
          resultsLength: data.results ? data.results.length : "undefined",
          resultExist: !!data.result,
          resultType: typeof data.result,
          debug: data.debug,
        });

        container.innerHTML = `
        <div style="text-align: center; padding: 20px; color: #eee;">
          <h3>🔍 Active CVE Monitoring</h3>
          <p>No new security alerts</p>
          <div style="font-size: 12px; margin-top: 10px;">
            Last check: ${new Date().toLocaleTimeString()}
          </div>
        </div>
      `;
      }
    } catch (error) {
      console.error("❌ CVE polling error:", error);
      container.innerHTML = `
      <div style="background: rgba(255,0,0,0.1); padding: 15px; border-radius: 8px; text-align: center;">
        <h3>⚠️ CVE Monitoring Error</h3>
        <p>Unable to retrieve alerts</p>
      </div>
    `;
    }
  }

  // Debug helper
  console.log("📄 popup.js loaded - waiting for DOMContentLoaded");
} // End of last missing brace

// 🌐 TRADUCTION - Chrome Translator API (OBLIGATOIRE pour le challenge)
// Populate language selector with Chrome Translator supported languages
(async function populateLanguageSelector() {
  // Chrome Translator API officially supported languages (as of 2024-2025)
  // Only include pairs that are widely supported
  const langs = [
    { code: "en", label: "English" },
    { code: "fr", label: "Français" },
    { code: "es", label: "Español" },
    { code: "de", label: "Deutsch" },
    { code: "it", label: "Italiano" },
    { code: "pt", label: "Português" },
    { code: "ja", label: "日本語" },
    { code: "ko", label: "한국어" },
    { code: "zh", label: "中文" },
    { code: "hi", label: "हिन्दी" },
    { code: "bn", label: "বাংলা" },
    { code: "tr", label: "Türkçe" },
    { code: "ru", label: "Русский" },
    { code: "ar", label: "العربية" },
  ];

  const sel = document.getElementById("lang-select");
  if (!sel) return;
  if (sel.dataset.populated === "1") return;

  sel.innerHTML = langs
    .map((l) => `<option value="${l.code}">${l.label}</option>`)
    .join("");

  // Set default to French (translate English content to French - most visible)
  sel.value = "fr";
  sel.dataset.populated = "1";
  console.log(
    "✅ Language selector populated with Chrome Translator supported languages, default: fr (EN→FR)"
  );

  // Add change listener to log selection
  sel.addEventListener("change", () => {
    console.log(`🌐 Language changed to: ${sel.value}`);
  });

  // Log Chrome Translator API availability
  if (window.Translator) {
    console.log("✅ Chrome Translator API detected and ready");
  } else {
    console.warn(
      "⚠️ Chrome Translator API not available - will use LanguageModel fallback"
    );
  }
})();

// Unified translator using Chrome AI (aiHelper.translateText)
async function translateWithChromeAI(text, targetLang, sourceLang = "auto") {
  console.log(
    `🌐 translateWithChromeAI called: target=${targetLang}, source=${sourceLang}, textLength=${text?.length}`
  );

  if (!text || !targetLang) throw new Error("Missing text or target language");

  if (
    typeof aiHelper !== "undefined" &&
    typeof aiHelper.translateText === "function"
  ) {
    try {
      console.log(
        `✅ Calling aiHelper.translateText(text, "${targetLang}", "${sourceLang}")`
      );
      const res = await aiHelper.translateText(text, targetLang, sourceLang);
      console.log(
        `✅ aiHelper.translateText returned: ${typeof res}, length=${
          res?.length || 0
        }`
      );
      if (typeof res === "string") return res;
      if (res && typeof res.text === "string") return res.text;
      // If aiHelper returns other structure, try JSON stringify fallback
      return String(res);
    } catch (e) {
      console.warn("❌ aiHelper.translateText failed:", e);
      throw e;
    }
  }

  // If aiHelper not available, throw so caller can show UI guidance
  console.error("❌ aiHelper or aiHelper.translateText not available");
  throw new Error("Chrome Translator AI not available");
}

// Full analysis translation button - uses Chrome AI only
document
  .getElementById("translate-btn")
  ?.addEventListener("click", async () => {
    const btn = document.getElementById("translate-btn");
    const result = document.getElementById("translated-result");
    const sel = document.getElementById("lang-select");
    const lang = sel ? sel.value : "en";

    console.log(`🔵 Translate button clicked! Selected language: ${lang}`);

    if (btn) {
      btn.disabled = true;
      btn.dataset.prevText = btn.textContent;
      btn.textContent = "Translating...";
    }

    try {
      const contentDiv = document.getElementById("analysis-content");
      const text = (contentDiv?.innerText || "").trim();

      console.log(
        `📄 Content to translate: ${text.substring(0, 100)}... (${
          text.length
        } chars)`
      );

      if (!text || text.length < 10)
        throw new Error("No analysis text found. Run an analysis first!");

      const toTranslate = text.length > 10000 ? text.substring(0, 10000) : text;

      console.log(
        `🌐 Calling translateWithChromeAI with target language: ${lang}`
      );
      const translated = await translateWithChromeAI(toTranslate, lang, "auto");
      console.log(
        `✅ Received translation: ${translated.substring(0, 100)}...`
      );

      if (result) {
        result.textContent = translated;
        result.style.display = "block";
      }
      if (btn) btn.textContent = `✅ Translated to ${lang.toUpperCase()}`;
      console.log("✅ Translation completed (Chrome AI)", lang);
    } catch (e) {
      console.error("❌ Translation error:", e);
      // If Chrome AI missing, provide actionable UI
      if (e && /not available/i.test(e.message || "")) {
        if (result)
          result.textContent =
            "⚠️ Chrome Translator AI not available. Please download Gemini Nano or enable Chrome AI in settings.";
      } else {
        if (result)
          result.textContent = "❌ Translation failed: " + (e.message || e);
      }
      if (result) result.style.display = "block";
      if (btn) btn.textContent = "Translate";
    } finally {
      if (btn) {
        setTimeout(() => {
          btn.disabled = false;
          btn.textContent = btn.dataset.prevText || "Translate";
        }, 1500);
      }
    }
  });

// Inline mini-translate buttons - use Chrome AI only
document.addEventListener("click", async (e) => {
  if (!e.target.classList.contains("translate-mini-btn")) return;

  const btn = e.target;
  const targetId = btn.dataset.target;
  const targetDiv = document.getElementById(targetId);
  if (!targetDiv) return;

  const sel = document.getElementById("lang-select");
  const lang = btn.dataset.lang || (sel ? sel.value : null) || "fr";

  console.log(
    `🌐 Inline translate clicked -> target: ${targetId}, lang: ${lang}`
  );

  try {
    btn.disabled = true;
    const prev = btn.textContent;
    btn.textContent = "⏳";

    // Toggle restore
    if (btn.dataset.original) {
      targetDiv.innerHTML = btn.dataset.original;
      delete btn.dataset.original;
      btn.textContent = "🌐";
      btn.disabled = false;
      console.log(`✅ Restored original content for ${targetId}`);
      return;
    }

    const originalHTML = targetDiv.innerHTML;
    const text = targetDiv.innerText || "";
    if (!text || text.trim().length < 3)
      throw new Error("No content to translate");

    console.log(`📝 Translating ${text.length} chars to ${lang}...`);

    // Clone the target div to manipulate DOM
    const clone = targetDiv.cloneNode(true);

    // Get all text nodes from the clone
    const walker = document.createTreeWalker(
      clone,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );
    const textNodes = [];
    while (walker.nextNode()) {
      const node = walker.currentNode;
      if (node.nodeValue && node.nodeValue.trim().length > 0) {
        textNodes.push(node);
      }
    }

    console.log(`🔍 Found ${textNodes.length} text nodes to translate`);

    // Translate each text node separately to preserve structure
    for (let i = 0; i < textNodes.length; i++) {
      const node = textNodes[i];
      const originalText = node.nodeValue.trim();

      if (originalText.length > 2) {
        console.log(
          `� Translating node ${i}: "${originalText.substring(0, 50)}..."`
        );
        const translatedLine = await translateWithChromeAI(
          originalText,
          lang,
          "auto"
        );

        // Preserve leading/trailing whitespace
        const leadingSpace = node.nodeValue.match(/^\s*/)[0];
        const trailingSpace = node.nodeValue.match(/\s*$/)[0];
        node.nodeValue = leadingSpace + translatedLine.trim() + trailingSpace;

        console.log(
          `✅ Translated to: "${translatedLine.substring(0, 50)}..."`
        );
      }
    }

    const translatedHTML = clone.innerHTML;
    console.log(
      `✅ Generated translated HTML with ${textNodes.length} translated nodes`
    );

    const languageNames = {
      en: "English",
      fr: "Français",
      es: "Español",
      de: "Deutsch",
      it: "Italiano",
      pt: "Português",
      nl: "Nederlands",
      ru: "Русский",
      "zh-CN": "简体中文",
      "zh-TW": "繁體中文",
      ja: "日本語",
      ko: "한국어",
      ar: "العربية",
      tr: "Türkçe",
    };

    const langName = languageNames[lang] || lang.toUpperCase();

    btn.dataset.original = originalHTML;

    // Show translation with preserved HTML structure ABOVE original
    targetDiv.innerHTML = `
      <div class="translation-box" style="background: rgba(99, 102, 241, 0.1); border-left: 3px solid #6366f1; padding: 12px; margin-bottom: 12px; border-radius: 6px;">
        <div class="translation-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 8px; padding-bottom: 6px; border-bottom: 1px solid rgba(255,255,255,0.1);">
          <span class="translation-title" style="font-weight: 600; color: #a5b4fc;">🌐 ${langName}</span>
          <button class="restore-btn" data-restore-target="${targetId}" style="background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); color: #e0e7ff; padding: 4px 10px; border-radius: 4px; cursor: pointer; font-size: 12px;">↺ Original</button>
        </div>
        <div class="translation-content" style="line-height: 1.7; color: #e0e7ff;">${translatedHTML}</div>
      </div>
      <div style="opacity: 0.5; padding: 12px; background: rgba(0,0,0,0.2); border-radius: 6px;">
        <div style="font-size: 11px; color: #94a3b8; margin-bottom: 6px;">📄 Original (English):</div>
        ${originalHTML}
      </div>
    `;

    // Add event listener to restore button (CSP compliant)
    const restoreBtn = targetDiv.querySelector(".restore-btn");
    if (restoreBtn) {
      restoreBtn.addEventListener("click", () => {
        if (btn.dataset.original) {
          targetDiv.innerHTML = btn.dataset.original;
          btn.textContent = "🌐";
          btn.disabled = false;
          delete btn.dataset.original;
          console.log(`✅ Restored original content for ${targetId}`);
        }
      });
    }

    btn.textContent = "🔄";
  } catch (err) {
    console.error("Inline translation failed:", err);
    if (/not available/i.test(err.message || "")) {
      alert(
        "Chrome Translator AI not available. Please download Gemini Nano or enable Chrome AI in your browser."
      );
    } else {
      alert("Translation failed: " + (err.message || err));
    }
    btn.textContent = "🌐";
  } finally {
    btn.disabled = false;
  }
});

// Restore original content when user clicks 'Original'
document.addEventListener("click", (e) => {
  if (!e.target.classList.contains("restore-btn")) return;
  const targetId = e.target.dataset.target;
  const btn = document.querySelector(
    `.translate-mini-btn[data-target="${targetId}"]`
  );
  if (btn) btn.click();
});
