// ai-helper.js - Version corrigée
class AIHelper {
  constructor() {
    this.hasNativeAI = false;
    this.nativeAI = null;
    this.initialize();
  }

  async initialize() {
    console.log("🚀 SOC-CERT AI initializing...");

    if (typeof window !== "undefined" && window.ai) {
      this.hasNativeAI = true;
      this.nativeAI = window.ai;
      console.log("✅ Chrome Built-in AI detected");
      this.logAvailableAPIs();
    } else {
      console.log("🔄 Chrome AI not available - using mock system");
    }
  }

  logAvailableAPIs() {
    const available = [];
    if (this.nativeAI.summarizer) available.push("summarizer");
    if (this.nativeAI.translator) available.push("translator");
    if (this.nativeAI.writer) available.push("writer");
    if (this.nativeAI.rewriter) available.push("rewriter");
    if (this.nativeAI.proofreader) available.push("proofreader");

    console.log("📋 Available Chrome AI APIs:", available);
  }

  // 🆕 Analyse de sécurité (version corrigée)
  async analyzeThreat(url, context = "") {
    const prompt = `
    SOC-CERT Threat Analysis:
    URL: ${url}
    Context: ${context}
    
    Analyze for security risks and provide:
    - Risk level (Low/Medium/High/Critical)
    - Main security concerns
    - 3 actionable recommendations
    `;

    try {
      if (this.hasNativeAI && this.nativeAI?.writer) {
        console.log("🤖 Using Chrome AI for threat analysis");
        const result = await this.nativeAI.writer.write({
          prompt: prompt,
          maxOutputTokens: 200,
        });
        return this.parseAIResponse(result);
      } else {
        console.log("📡 Using mock threat analysis");
        return await mockAI.analyzeThreat({ url, context });
      }
    } catch (error) {
      console.error("Threat analysis error:", error);
      return {
        riskScore: 50,
        threatType: "unknown",
        indicators: ["Analysis failed"],
        confidence: 0,
        recommendations: ["Manual review required"],
      };
    }
  }

  // 🆕 Résumer CVE (version corrigée)
  async summarizeCVE(cveData) {
    const text = `
    CVE ID: ${cveData.id}
    Description: ${cveData.description}
    Severity: ${cveData.severity}
    CVSS: ${cveData.cvss}
    Affected Products: ${cveData.products?.join(", ") || "Unknown"}
    `;

    try {
      if (this.hasNativeAI && this.nativeAI?.summarizer) {
        console.log("📝 Using Chrome AI Summarizer for CVE");
        const summary = await this.nativeAI.summarizer.summarize({
          text: text,
          maxOutputTokens: 100,
        });

        return {
          original: text,
          summary: summary,
          method: "chrome-ai",
        };
      } else {
        return await mockAI.summarizer.summarize({ text });
      }
    } catch (error) {
      console.error("CVE summarization error:", error);
      return {
        original: text,
        summary: text.substring(0, 200) + "...",
        method: "fallback",
      };
    }
  }

  // 🆕 Détecter langue (version corrigée)
  async detectLanguage(text) {
    try {
      if (this.hasNativeAI && this.nativeAI?.languageDetector) {
        const result = await this.nativeAI.languageDetector.detect({
          text: text,
        });
        console.log(`🌍 Detected language: ${result[0]?.detectedLanguage}`);
        return result;
      } else {
        return await mockAI.languageDetector.detect({ text });
      }
    } catch (error) {
      return [{ detectedLanguage: "en", confidence: 0.5 }];
    }
  }

  // 🆕 Générer recommandations SOC (version corrigée)
  async generateSOCRecommendations(threatContext) {
    const prompt = `
    Generate SOC response recommendations:
    Threat Type: ${threatContext.threatType}
    Risk Score: ${threatContext.riskScore}
    Indicators: ${threatContext.indicators?.join(", ")}
    `;

    try {
      if (this.hasNativeAI && this.nativeAI?.writer) {
        console.log("📋 Generating SOC recommendations with Chrome AI");
        return await this.nativeAI.writer.write({
          prompt: prompt,
          maxOutputTokens: 150,
        });
      } else {
        return await mockAI.writer.write({ prompt });
      }
    } catch (error) {
      return "Recommendations unavailable - manual analysis required";
    }
  }

  // Helper pour parser les réponses AI
  parseAIResponse(response) {
    try {
      return JSON.parse(response);
    } catch {
      return {
        riskScore: 75,
        threatType: "suspicious",
        indicators: [response.substring(0, 100)],
        confidence: 0.7,
        recommendations: ["Further analysis needed"],
      };
    }
  }

  // 🆕 Status des APIs
  getAPIStatus() {
    return {
      hasNativeAI: this.hasNativeAI,
      timestamp: new Date().toISOString(),
      availableAPIs: this.nativeAI
        ? Object.keys(this.nativeAI).filter((key) => this.nativeAI[key])
        : [],
    };
  }

  // Méthodes principales CORRIGÉES
  async summarize(text, options = {}) {
    try {
      if (this.hasNativeAI && this.nativeAI?.summarizer) {
        console.log("📝 Using native Chrome summarizer");
        return await this.nativeAI.summarizer.summarize({
          text: text,
          maxOutputTokens: options.maxOutputTokens || 100,
        });
      } else {
        console.log("📝 Using mock summarizer");
        return await mockAI.summarizer.summarize({ text, ...options });
      }
    } catch (error) {
      console.error("Summarizer error:", error);
      return `Summary unavailable: ${error.message}`;
    }
  }

  async translate(text, targetLanguage = "en") {
    try {
      if (this.hasNativeAI && this.nativeAI?.translator) {
        return await this.nativeAI.translator.translate({
          text: text,
          targetLanguage: targetLanguage,
        });
      } else {
        return await mockAI.translator.translate({ text, targetLanguage });
      }
    } catch (error) {
      return `Translation unavailable: ${error.message}`;
    }
  }

  async generateRecommendations(context) {
    const prompt = `Generate 3 security recommendations for: ${JSON.stringify(
      context
    )}`;

    try {
      if (this.hasNativeAI && this.nativeAI?.writer) {
        return await this.nativeAI.writer.write({
          prompt: prompt,
          maxOutputTokens: 150,
        });
      } else {
        return await mockAI.writer.write({ prompt });
      }
    } catch (error) {
      return `Recommendations unavailable: ${error.message}`;
    }
  }
}

// Instance globale
const aiHelper = new AIHelper();
window.socAI = aiHelper;
