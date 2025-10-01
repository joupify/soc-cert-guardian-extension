// ai-helper.js - Gère à la fois mock et vraies APIs
class AIHelper {
  constructor() {
    this.hasNativeAI = false;
    this.nativeAI = null;
    this.initialize();
  }

  initialize() {
    // Vérifie si les vraies APIs sont disponibles
    if (typeof ai !== "undefined") {
      this.hasNativeAI = true;
      this.nativeAI = ai;
      console.log("✅ Native Chrome AI APIs enabled");
    } else {
      console.log("🔄 Using mock AI system (EPP approval pending)");
    }
  }

  async summarize(text, options = {}) {
    try {
      if (this.hasNativeAI && this.nativeAI?.summarizer) {
        console.log("📝 Using native summarizer");
        return await this.nativeAI.summarizer.summarize({
          text,
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
          text,
          targetLanguage,
        });
      } else {
        return await mockAI.translator.translate({ text, targetLanguage });
      }
    } catch (error) {
      return `Translation unavailable: ${error.message}`;
    }
  }

  async generateRecommendations(context) {
    const prompt = `Generate 3 security recommendations for this context: ${JSON.stringify(
      context
    )}`;

    try {
      if (this.hasNativeAI && this.nativeAI?.writer) {
        return await this.nativeAI.writer.write({
          prompt,
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
