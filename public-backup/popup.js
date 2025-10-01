// popup.js - À créer maintenant
document.addEventListener("DOMContentLoaded", async function () {
  console.log("🔒 SOC-CERT Extension loaded");

  // Affiche le statut EPP
  const statusElement = document.getElementById("status");
  statusElement.innerHTML = aiHelper.hasNativeAI
    ? "✅ Chrome AI APIs Enabled"
    : "🔄 Using Mock AI (EPP Pending)";

  // Analyse la page actuelle
  await analyzeCurrentPage();
});

async function analyzeCurrentPage() {
  try {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });

    if (tab) {
      // Simulation d'analyse en attendant le content script
      const mockAnalysis = {
        score: 85,
        url: tab.url,
        isSecure: tab.url.startsWith("https://"),
        threats: ["Basic analysis ready"],
        recommendations: ["Full analysis after EPP approval"],
      };

      displayAnalysis(mockAnalysis);
    }
  } catch (error) {
    console.error("Analysis error:", error);
  }
}

function displayAnalysis(analysis) {
  const content = document.getElementById("analysis-content");
  content.innerHTML = `
        <div style="background: rgba(255,255,255,0.1); padding: 15px; border-radius: 10px; margin-bottom: 15px; text-align: center;">
            <div style="font-size: 32px; font-weight: bold; color: #00fff7;">${
              analysis.score
            }/100</div>
            <div>Security Score</div>
        </div>
        
        <div style="background: rgba(255,255,255,0.05); padding: 15px; border-radius: 8px; margin-bottom: 10px;">
            <h4>📊 Page Analysis</h4>
            <div>URL: ${analysis.url}</div>
            <div>HTTPS: ${analysis.isSecure ? "✅" : "❌"}</div>
        </div>
        
        <div style="background: rgba(255,255,255,0.05); padding: 15px; border-radius: 8px;">
            <h4>💡 Ready for EPP</h4>
            <div>Extension structure complete. Waiting for AI API access to enable full security analysis.</div>
        </div>
    `;
}
