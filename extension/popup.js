// popup.js - Corrected and simplified version
document.addEventListener("DOMContentLoaded", function () {
  console.log("🔒 SOC-CERT Extension loaded - DOM ready");

  // Wait for all scripts to load
  setTimeout(initializePopup, 100);
});

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
        🔄 Chrome AI Available - 
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

    // ❌ DISABLED API TEST SECTION - Redundant now that everything works automatically
    // await addAITestButtons();

    // ❌ DISABLED CVE POLLING - ai-helper handles it
    // await startCVEPolling();
  } catch (error) {
    console.error("Initialization error:", error);
    document.getElementById("status").textContent = "❌ Initialization failed";
  }
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
    <h4 style="margin: 0 0 10px 0; font-size: 14px; color: #fff;">🤖 Chrome AI APIs</h4>
    
    <!-- Automatic download button -->
    <button id="download-all-ai" style="width: 100%; padding: 8px; border: none; border-radius: 4px; background: #4285f4; color: white; font-size: 12px; cursor: pointer; margin-bottom: 10px;">
      📥 Download all APIs
    </button>
    
    <!-- API status -->
    <div id="ai-status" style="margin-bottom: 10px; padding: 6px; background: rgba(0,0,0,0.3); border-radius: 4px; font-size: 10px; color: #ccc;">
      Checking status...
    </div>
    
    <!-- Test buttons -->
    <div style="display: flex; flex-wrap: wrap; gap: 5px;">
      <button id="test-summarizer" style="flex: 1; padding: 5px; border: none; border-radius: 4px; background: #0066cc; color: white; font-size: 10px; cursor: pointer;">
        📝 Summarizer
      </button>
      <button id="test-writer" style="flex: 1; padding: 5px; border: none; border-radius: 4px; background: #4CAF50; color: white; font-size: 10px; cursor: pointer;">
        ✍️ Writer
      </button>
      <button id="test-translator" style="flex: 1; padding: 5px; border: none; border-radius: 4px; background: #FF9800; color: white; font-size: 10px; cursor: pointer;">
        🌐 Translator
      </button>
    </div>
    <div id="ai-test-results" style="margin-top: 10px; font-size: 11px; max-height: 100px; overflow-y: auto; background: rgba(0,0,0,0.2); padding: 5px; border-radius: 4px; display: none;">
    </div>
  `;

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

// Debug version of analyzeCurrentPage
async function analyzeCurrentPage() {
  try {
    console.log("=== 🧪 DEBUG ANALYSIS PROGRESSIVE ===");

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
      console.log("🎯 Starting progressive analysis for:", tab.url);

      // 🆕 UTILISER LE FLOW COMPLET
      const progressiveAnalysis = await aiHelper.analyzeCompleteFlow(
        tab.url,
        `Analyzing: ${tab.title}`
      );

      console.log("📊 Progressive analysis started:", progressiveAnalysis);

      // Display quick analysis immediately
      displayThreatAnalysis(progressiveAnalysis);

      // 🆕 LISTEN FOR DEEP ANALYSIS UPDATES
      window.addEventListener("deepAnalysisUpdate", (event) => {
        console.log("🔄 Deep analysis update received:", event.detail);
        updateWithDeepResults(event.detail);
      });
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

// 🆕 UPDATE WITH DEEP ANALYSIS RESULTS
function updateWithDeepResults(deepData) {
  console.log("🔄 Updating display with deep analysis...");

  // 🎯 UPDATE the "running" status in the metadata section
  const progressiveIndicator = document.getElementById("deep-analysis-status");
  if (progressiveIndicator) {
    progressiveIndicator.style.color = "#00ff00";
    progressiveIndicator.innerHTML = "✅ Deep analysis completed";
    console.log("✅ Updated deep analysis status to completed");
  } else {
    console.log("❌ Could not find deep-analysis-status element");
  }

  // 🎯 UPDATE the status in the AI Status section
  const aiStatusSection = document.getElementById("ai-status-progress");
  if (aiStatusSection) {
    aiStatusSection.style.color = "#00ff00";
    aiStatusSection.innerHTML =
      "⚡ Quick analysis • ✅ Deep analysis completed";
    console.log("✅ Updated AI status progress to completed");
  } else {
    console.log("❌ Could not find ai-status-progress element");
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


    
    <div style="margin-bottom: 10px;">
  <strong>🚨 CVE Correlation:</strong>
  <div style="background: rgba(0,0,0,0.2); padding: 8px; border-radius: 5px; margin-top: 5px; font-size: 12px;">
    ${(() => {
      console.log("🔍 DEBUG CVE Display:", deepData.deepResults);

      // ✅ CAS 1 : CVE direct dans deepResults
      if (deepData.deepResults?.cve_id) {
        console.log("✅ CVE found:", deepData.deepResults.cve_id);
        return `
          <div class="cve-item">
            <strong>${deepData.deepResults.cve_id}</strong> 
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
            ${
              deepData.deepResults.link
                ? `<br><a href="${deepData.deepResults.link}" target="_blank" style="color: #00aaff; font-size: 11px;">View Details →</a>`
                : ""
            }
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
              <strong>${cve.cve_id}</strong> 
              <span class="badge badge-${
                cve.severity?.toLowerCase() || "unknown"
              }">
                ${cve.severity || "Unknown"}
              </span>
              <br>
              <span class="cve-score">Score: ${cve.score || "N/A"}</span>
              ${
                cve.link
                  ? `<br><a href="${cve.link}" target="_blank">View Details →</a>`
                  : ""
              }
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
</div>





    ${
      deepData.deepResults?.aiSummary ||
      deepData.deepResults?.enhancedRecommendations ||
      deepData.deepResults?.translatedAnalysis ||
      deepData.deepResults?.proofreadAnalysis
        ? `
      <div style="margin-bottom: 10px;">
        <strong>🤖 Specialized AI Analysis:</strong>
        
        ${
          deepData.deepResults?.aiSummary
            ? `
          <div style="margin: 5px 0;">
            <div style="font-size: 11px; font-weight: bold; margin-bottom: 3px;">📝 Summarizer:</div>
            <div style="font-size: 12px; background: rgba(0,0,0,0.2); padding: 6px; border-radius: 4px;">
              ${deepData.deepResults.aiSummary}
            </div>
          </div>
        `
            : ""
        }
        
        ${
          deepData.deepResults?.enhancedRecommendations
            ? `
          <div style="margin: 5px 0;">
            <div style="font-size: 11px; font-weight: bold; margin-bottom: 3px;">✍️ Writer:</div>
            <div style="font-size: 12px; background: rgba(0,0,0,0.2); padding: 6px; border-radius: 4px;">
              ${
                Array.isArray(deepData.deepResults.enhancedRecommendations)
                  ? deepData.deepResults.enhancedRecommendations.join("<br>")
                  : deepData.deepResults.enhancedRecommendations
              }
            </div>
          </div>
        `
            : ""
        }
        
        ${
          deepData.deepResults?.translatedAnalysis
            ? `
          <div style="margin: 5px 0;">
            <div style="font-size: 11px; font-weight: bold; margin-bottom: 3px;">🌐 Translator:</div>
            <div style="font-size: 12px; background: rgba(0,0,0,0.2); padding: 6px; border-radius: 4px; font-style: italic;">
              ${deepData.deepResults.translatedAnalysis}
            </div>
          </div>
        `
            : ""
        }
        
        ${
          deepData.deepResults?.proofreadAnalysis
            ? `
          <div style="margin: 5px 0;">
            <div style="font-size: 11px; font-weight: bold; margin-bottom: 3px;">📝 Proofreader:</div>
            <div style="font-size: 12px; background: rgba(0,0,0,0.2); padding: 6px; border-radius: 4px;">
              ${deepData.deepResults.proofreadAnalysis}
            </div>
          </div>
        `
            : ""
        }
      </div>
    `
        : ""
    }
    
    <div style="margin-bottom: 10px;">
      <strong>💡 Enhanced Recommendations:</strong>
      ${
        deepData.deepResults?.recommendationsSource
          ? `<div style="font-size: 10px; color: #888; margin: 2px 0;">${deepData.deepResults.recommendationsSource}</div>`
          : ""
      }
      <ul style="margin: 5px 0; padding-left: 20px; font-size: 12px;">
        ${(
          deepData.deepResults?.recommendations || [
            "Enable real-time monitoring",
            "Update security policies",
            "Review access controls",
          ]
        )
          .map((rec) => `<li>${rec}</li>`)
          .join("")}
      </ul>
    </div>
    
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

  console.log("✅ Deep analysis section updated");
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
  <!-- Analyzed URL -->
      <div style="margin-bottom: 15px; padding: 8px; background: rgba(0,0,0,0.2); border-radius: 5px; font-size: 12px; word-break: break-all;">
        <strong>🌐 URL analysée:</strong><br>${analysis.analyzedUrl}
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

  <!-- Indicators -->
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

  <!-- Recommendations -->
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
                ${analysis.enhancedRecommendations.join("<br>")}
              </div>
            </div>
          `
              : ""
          }
          
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
            ? '<div id="deep-analysis-status" style="color: #00ffff;">🔄 Deep analysis running via n8n...</div>'
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
        <div style="text-align: center; padding: 20px; color: #888;">
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

// 📱 CVE ALERTS DISPLAY - FIXED
function displayCVEAlerts(alerts) {
  const container = document.getElementById("alerts-container");

  console.log("🎨 DISPLAY CVE ALERTS DEBUG:");
  console.log("  Container found:", !!container);
  console.log("  Container ID:", container?.id);
  console.log("  Alerts count:", alerts.length);

  // 🔍 DEBUG: Log each received alert
  console.log("🔍 ALERTS RECEIVED:", alerts);
  alerts.forEach((alert, index) => {
    console.log(`Alert ${index}:`, {
      cve_id: alert.cve_id,
      title: alert.title,
      severity: alert.severity,
      fullAlert: alert,
    });
  });

  const alertsHTML = alerts
    .map(
      (alert) => `
    <div style="background: rgba(255,255,255,0.9); color: #333; padding: 12px; border-radius: 8px; margin-bottom: 10px; border-left: 4px solid #ff0000;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
        <strong style="color: #cc0000;">${alert.cve_id}</strong>
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
        <button id="refresh-cve-btn" style="background: rgba(255,255,255,0.2); color: white; border: 1px solid rgba(255,255,255,0.3); padding: 8px 16px; border-radius: 5px; cursor: pointer; font-size: 12px;">
          🔄 Actualiser
        </button>
      </div>
    </div>
  `;

  console.log(
    "🎨 HTML INJECTED - Container innerHTML length:",
    container.innerHTML.length
  );
  console.log("🎨 Container style:", container.style.cssText);
  console.log("🎨 Container parent:", container.parentElement?.tagName);

  // Add the event listener for the button after creating it
  setTimeout(() => {
    const refreshBtn = document.getElementById("refresh-cve-btn");
    if (refreshBtn) {
      refreshBtn.addEventListener("click", startCVEPolling);
    }
  }, 100);
}

// Debug helper
console.log("📄 popup.js loaded - waiting for DOMContentLoaded");
