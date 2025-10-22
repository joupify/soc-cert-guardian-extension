const mockAI = {
  summarizer: {
    summarize: async ({ text, maxOutputTokens = 100 }) => {
      const wordCount = text.split(" ").length;
      const charCount = text.length;

      return (
        `🔒 SECURITY SUMMARY: Page contains ${wordCount} words, ${charCount} characters. ` +
        `Analyzed for potential security risks. [MOCK - EPP PENDING]`
      );
    },
  },

  translator: {
    translate: async ({ text, targetLanguage = "en" }) => {
      const sample = text.substring(0, 100);
      return `🌐 TRANSLATED (${targetLanguage}): "${sample}..." [MOCK TRANSLATION]`;
    },
  },

  writer: {
    write: async ({ prompt, maxOutputTokens = 150 }) => {
      if (prompt.includes("security") || prompt.includes("recommendation")) {
        return (
          `💡 SECURITY RECOMMENDATIONS:\n` +
          `1. Enable HTTPS encryption\n` +
          `2. Update software regularly\n` +
          `3. Use strong passwords\n` +
          `4. Monitor for suspicious activity\n` +
          `[MOCK - Real AI analysis pending EPP approval]`
        );
      }
      return `Generated content based on: ${prompt.substring(0, 50)}... [MOCK]`;
    },
  },

  proofreader: {
    fix: async ({ text, language = "en" }) => {
      return `✏️ PROOFREAD TEXT: ${text} [GRAMMAR CORRECTED - MOCK]`;
    },
  },

  analyzeThreat: async ({ url, context = "" }) => {
    console.log(`🤖 Mock SOC-CERT analyzing: ${url}`);

    let riskScore = 15;
    let threatType = "safe";
    let indicators = [];
    let recommendations = ["Continue normal monitoring"];

    const urlLower = url.toLowerCase();

    // 🚨 Phishing detection
    const phishingBrands = [
      "paypal",
      "amazon",
      "microsoft",
      "apple",
      "netflix",
      "facebook",
    ];
    phishingBrands.forEach((brand) => {
      if (
        urlLower.includes(brand) &&
        !urlLower.includes(`${brand}.com`) &&
        !urlLower.includes(`${brand}.fr`)
      ) {
        riskScore += 35;
        indicators.push(`🎣 Brand impersonation: ${brand}`);
        threatType = "phishing";
      }
    });

    // 🔗 Suspicious shortened URLs
    const shorteners = ["bit.ly", "tinyurl", "t.co", "goo.gl", "ow.ly"];
    shorteners.forEach((shortener) => {
      if (urlLower.includes(shortener)) {
        riskScore += 25;
        indicators.push(`🔗 Shortened URL service: ${shortener}`);
        threatType = threatType === "safe" ? "suspicious" : threatType;
      }
    });

    // 🌐 Direct IP access instead of domain
    if (/\d+\.\d+\.\d+\.\d+/.test(url)) {
      riskScore += 45;
      indicators.push("🌐 Direct IP access (suspicious)");
      threatType = "malicious";
    }

    // ⚠️ Suspicious keywords
    const suspiciousKeywords = [
      "verify",
      "urgent",
      "suspend",
      "update-required",
      "security-alert",
    ];
    suspiciousKeywords.forEach((keyword) => {
      if (urlLower.includes(keyword)) {
        riskScore += 20;
        indicators.push(`⚠️ Suspicious keyword: ${keyword}`);
        threatType = threatType === "safe" ? "suspicious" : threatType;
      }
    });

    // 📏 Unusually long URL
    if (url.length > 100) {
      riskScore += 15;
      indicators.push("📏 Unusually long URL");
    }

    // 🔢 Too many subdomains
    const subdomainCount = (url.match(/\./g) || []).length;
    if (subdomainCount > 4) {
      riskScore += 20;
      indicators.push(`🔢 Multiple subdomains (${subdomainCount})`);
    }

    // Limit the score
    riskScore = Math.min(riskScore, 100);

    // Generate recommendations based on risk
    if (riskScore >= 80) {
      recommendations = [
        "🚫 BLOCK IMMEDIATELY",
        "📧 Alert security team",
        "📋 Add to threat intelligence",
        "👥 Notify affected users",
      ];
      threatType = "critical";
    } else if (riskScore >= 60) {
      recommendations = [
        "🔍 Investigate immediately",
        "⏰ Temporary monitoring",
        "🛡️ Consider blocking",
      ];
      threatType = "high-risk";
    } else if (riskScore >= 40) {
      recommendations = ["👀 Enhanced monitoring", "📢 User awareness alert"];
    }

    // Simulation delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    return {
      riskScore,
      threatType,
      indicators,
      confidence: Math.min(0.95, (riskScore + 20) / 100),
      recommendations,
      method: "mock-soc-analysis",
      timestamp: new Date().toISOString(),
      analyzedUrl: url,
      context: context,
      processingTime: "0.8s",
      mockNote: "🔄 Chrome AI analysis will replace this when EPP activates",
    };
  },

  // 🆕 Improved language detector
  languageDetector: {
    detect: async ({ text }) => {
      console.log("🌍 Mock language detection...");

      const patterns = {
        fr: ["le", "la", "de", "et", "à", "un", "ce", "que", "avec", "dans"],
        en: ["the", "and", "of", "to", "a", "in", "that", "is", "for", "with"],
        es: ["el", "la", "de", "y", "en", "un", "que", "con", "por", "para"],
        ru: ["и", "в", "не", "на", "с", "что", "как", "по", "из", "за"],
        zh: ["的", "是", "在", "了", "和", "有", "个", "人", "这", "中"],
      };

      const words = text.toLowerCase().split(/\s+/);
      const scores = {};

      Object.keys(patterns).forEach((lang) => {
        scores[lang] = 0;
        patterns[lang].forEach((word) => {
          if (words.includes(word)) scores[lang]++;
        });
      });

      const detected = Object.keys(scores).reduce((a, b) =>
        scores[a] > scores[b] ? a : b
      );

      await new Promise((resolve) => setTimeout(resolve, 300));

      return [
        {
          detectedLanguage: detected,
          confidence: Math.min(0.9, scores[detected] / 10),
        },
      ];
    },
  },
};

// Export for global usage
window.mockAI = mockAI;
console.log("🔄 AI Mock system loaded - Ready for EPP");
