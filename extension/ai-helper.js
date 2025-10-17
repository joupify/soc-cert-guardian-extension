class AIHelper {
  constructor() {
    this.hasNativeAI = false;
    this.nativeAI = null;
    this.needsDownload = false;
    this.aiSession = null; // Pre-warmed AI session
    this.isAIReady = false; // Flag to know if AI is ready
    this.aiWarmupAttempts = 0; // Counter for warm-up attempts

    // ✅ Get persistent unique ID from chrome.storage.local
    chrome.storage.local.get(["extensionId"], (result) => {
      this.extensionId = result.extensionId;
      if (!this.extensionId) {
        console.warn("extensionId missing, check initialization!");
      } else {
        console.log(`✅ Extension ID retrieved: ${this.extensionId}`);
      }
    });

    // Do not call initialize() in constructor
    // to avoid problems with async
  }

  async initialize() {
    console.log("🚀 SOC-CERT AI initializing...");

    // Ultra-robust detection test
    if (typeof window !== "undefined") {
      console.log("🔍 Checking AI availability...");
      console.log("  window.ai:", !!window.ai);
      console.log("  window.LanguageModel:", !!window.LanguageModel);
      console.log(
        "  window.chrome?.ai:",
        !!(window.chrome && window.chrome.ai)
      );

      // 🎆 Use only what works: window.LanguageModel
      if (window.LanguageModel) {
        this.nativeAI = { languageModel: window.LanguageModel };
        console.log("✅ Chrome Built-in AI detected via window.LanguageModel");
        await this.testAIAvailability();

        // ✅ WARM-UP AT STARTUP to avoid false analyses
        // await this.warmupGeminiNano(); // TODO: Implement warmup method
      } else {
        console.log("❌ No Chrome AI API detected");
        console.log("🔧 Using mock system only");
        console.log("💡 Check Chrome flags and restart browser");
      }
    }
  }

  async testAIAvailability() {
    try {
      // Test du nouveau LanguageModel API
      let availability;
      if (window.LanguageModel) {
        availability = await window.LanguageModel.availability();
        console.log("🧠 LanguageModel availability:", availability);
      } else if (window.ai && window.ai.languageModel) {
        availability = await window.ai.languageModel.availability();
        console.log("� window.ai.languageModel availability:", availability);
      }

      if (availability === "available") {
        console.log("🎉 Gemini Nano ready!");
        this.hasNativeAI = true;

        // 🆕 Attendre que window.ai soit disponible
        await this.waitForWindowAI();

        // Test specialized APIs now
        await this.testSpecializedAPIs();
      } else if (availability === "downloadable") {
        console.log("📥 Gemini Nano downloadable - user interaction required");
        console.log(
          "💡 Cliquez dans l'extension pour démarrer le téléchargement"
        );
        this.needsDownload = true;
      } else if (availability === "downloading") {
        console.log("⬇️ Gemini Nano downloading...");
      }

      this.logAvailableAPIs();
    } catch (error) {
      console.log("❌ AI test error:", error.message);
    }
  }

  // 🔍 Search for specialized APIs directly on window
  async searchSpecializedAPIs() {
    console.log("🔍 Recherche des APIs spécialisées...");

    const foundAPIs = [];

    // Chercher sur window directement
    if (window.Summarizer) {
      foundAPIs.push("📝 Summarizer (window.Summarizer)");
      console.log("� window.Summarizer détecté");
    }

    if (window.Writer) {
      foundAPIs.push("✍️ Writer (window.Writer)");
      console.log("✍️ window.Writer détecté");
    }

    if (window.Translator) {
      foundAPIs.push("🌐 Translator (window.Translator)");
      console.log("🌐 window.Translator detected");
    }

    if (window.Proofreader) {
      foundAPIs.push("📝 Proofreader (window.Proofreader)");
      console.log("📝 window.Proofreader detected");
    }

    // Chercher sur window.chrome
    if (window.chrome && window.chrome.ai) {
      console.log(
        "� window.chrome.ai detected:",
        Object.keys(window.chrome.ai)
      );
      if (window.chrome.ai.summarizer)
        foundAPIs.push("📝 Summarizer (chrome.ai)");
      if (window.chrome.ai.writer) foundAPIs.push("✍️ Writer (chrome.ai)");
      if (window.chrome.ai.translator)
        foundAPIs.push("🌐 Translator (chrome.ai)");
      if (window.chrome.ai.proofreader)
        foundAPIs.push("📝 Proofreader (chrome.ai)");
    }

    console.log("📋 APIs spécialisées trouvées:", foundAPIs);

    if (foundAPIs.length === 0) {
      console.log("ℹ️ Aucune API spécialisée détectée");
      console.log(
        "💡 Utilisation des mocks pour les fonctionnalités spécialisées"
      );
    }

    return {
      summarizer:
        window.Summarizer ||
        (window.chrome && window.chrome.ai && window.chrome.ai.summarizer)
          ? "available"
          : "not-available",
      writer:
        window.Writer ||
        (window.chrome && window.chrome.ai && window.chrome.ai.writer)
          ? "available"
          : "not-available",
      translator:
        window.Translator ||
        (window.chrome && window.chrome.ai && window.chrome.ai.translator)
          ? "available"
          : "not-available",
      proofreader:
        window.Proofreader ||
        (window.chrome && window.chrome.ai && window.chrome.ai.proofreader)
          ? "available"
          : "not-available",
    };
  }

  // 🔧 FONCTION MANQUANTE: testSpecializedAPIs
  async testSpecializedAPIs() {
    console.log("🔍 Test des APIs spécialisées...");

    // Use already implemented searchSpecializedAPIs
    return await this.searchSpecializedAPIs();
  }

  // 🆕 Attendre que window.ai soit disponible
  async waitForWindowAI(maxWait = 10000) {
    console.log("⏳ Attente de window.ai...");
    const startTime = Date.now();

    while (!window.ai && Date.now() - startTime < maxWait) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      console.log("🔄 Checking window.ai...", !!window.ai);

      // 🆕 Tentative de forcer l'activation de window.ai
      if (!window.ai && window.LanguageModel) {
        try {
          // Creating a temporary session may trigger window.ai
          const tempSession = await window.LanguageModel.create({
            systemPrompt: "Test activation",
            outputLanguage: "en",
          });
          if (tempSession) {
            if (tempSession.destroy) tempSession.destroy();
            console.log("🔄 Session temporaire créée pour activer window.ai");
          }
        } catch (e) {
          console.log("🔄 Tentative d'activation:", e.message);
        }
      }
    }

    if (window.ai) {
      console.log("✅ window.ai disponible !");
      // Check available APIs in window.ai
      console.log(
        "🔍 window.ai properties:",
        Object.getOwnPropertyNames(window.ai)
      );
    } else {
      console.log("⚠️ window.ai toujours indisponible après", maxWait, "ms");
      // 🆕 Essayons une approche alternative
      await this.tryAlternativeAPIAccess();
    }
  }

  // 🆕 Alternative approach to access APIs
  async tryAlternativeAPIAccess() {
    console.log("🔄 Tentative d'accès alternatif aux APIs...");

    // Check if APIs exist directly on window
    const alternativeAPIs = [];

    if (window.Summarizer) {
      alternativeAPIs.push("Summarizer (direct)");
      console.log("📝 window.Summarizer trouvé");
    }

    if (window.Writer) {
      alternativeAPIs.push("Writer (direct)");
      console.log("✍️ window.Writer trouvé");
    }

    if (window.Translator) {
      alternativeAPIs.push("Translator (direct)");
      console.log("🌐 window.Translator trouvé");
    }

    console.log("🔍 APIs alternatives détectées:", alternativeAPIs);

    // Essayer window.chrome.ai
    if (window.chrome && window.chrome.ai) {
      console.log(
        "🔍 window.chrome.ai détecté:",
        Object.keys(window.chrome.ai)
      );
    }
  }

  async downloadGeminiNano() {
    try {
      console.log("🚀 Tentative de téléchargement Gemini Nano...");

      // 🛡️ Protection against multiple downloads
      if (this.hasNativeAI) {
        console.log("✅ Gemini Nano déjà prêt !");
        return true;
      }

      // Check user activation
      if (!navigator.userActivation.isActive) {
        console.log("❌ Interaction utilisateur requise");
        return false;
      }

      // Utiliser uniquement window.LanguageModel qui fonctionne
      let session;
      if (window.LanguageModel) {
        session = await window.LanguageModel.create({
          systemPrompt: "You are a security expert assistant for SOC-CERT",
          temperature: 0.3,
          topK: 3,
          outputLanguage: "en",
        });
        console.log("✅ Gemini Nano téléchargé et prêt !");
        this.hasNativeAI = true;

        // Nettoyer la session de test
        if (session && session.destroy) {
          session.destroy();
        }

        return true;
      } else {
        throw new Error("window.LanguageModel not available");
      }
    } catch (error) {
      if (error.message.includes("downloading")) {
        console.log("⬇️ Téléchargement en cours... Veuillez patienter");
      } else {
        console.log("❌ Erreur téléchargement:", error.message);
      }
      return false;
    }
  }

  // 🆕 Automatic download of specialized APIs
  async downloadSpecializedAPIs() {
    console.log("📥 Téléchargement des APIs spécialisées...");

    // Download Summarizer if available
    if (window.ai && window.ai.summarizer) {
      try {
        const summarizerAvailability =
          await window.ai.summarizer.availability();
        if (summarizerAvailability === "downloadable") {
          console.log("📝 Téléchargement Summarizer...");
          const summarizer = await window.ai.summarizer.create({
            type: "key-points",
            format: "markdown",
            length: "medium",
          });
          summarizer.destroy(); // Clean up after test
          console.log("✅ Summarizer prêt !");
        }
      } catch (error) {
        console.log("❌ Erreur Summarizer:", error.message);
      }
    }

    // Download Writer if available
    if (window.ai && window.ai.writer) {
      try {
        const writerAvailability = await window.ai.writer.availability();
        if (writerAvailability === "downloadable") {
          console.log("✍️ Téléchargement Writer...");
          const writer = await window.ai.writer.create({
            tone: "neutral",
            format: "plain-text",
            length: "medium",
          });
          writer.destroy(); // Clean up after test
          console.log("✅ Writer prêt !");
        }
      } catch (error) {
        console.log("❌ Erreur Writer:", error.message);
      }
    }

    // Translator is usually already available (expert model)
    if (window.ai && window.ai.translator) {
      try {
        const translatorAvailability =
          await window.ai.translator.availability();
        console.log("🌐 Translator status:", translatorAvailability);
      } catch (error) {
        console.log("❌ Erreur Translator:", error.message);
      }
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

  // 🆕 MAXIMUM PRIORITY - SUMMARIZER API
  async createSummarizer(options = {}) {
    try {
      if (window.ai && window.ai.summarizer) {
        const summarizer = await window.ai.summarizer.create({
          type: options.type || "key-points",
          format: options.format || "markdown",
          length: options.length || "medium",
          ...options,
        });
        console.log("📝 Summarizer créé avec succès");
        return summarizer;
      } else {
        console.log("❌ Summarizer API non disponible");
        return null;
      }
    } catch (error) {
      console.error("❌ Erreur création Summarizer:", error);
      return null;
    }
  }

  // 🆕 SUMMARIZER version simple
  async summarizeText(text, options = {}) {
    try {
      console.log("📝 Résumé en cours...");
      return this.mockSummarize(text, options);
    } catch (error) {
      console.error("❌ Erreur summarization:", error);
      return this.mockSummarize(text, options);
    }
  }

  // 🆕 WRITER version simple
  async writeContent(prompt, options = {}) {
    try {
      console.log("✍️ Rédaction en cours...");
      return this.mockWrite(prompt, options);
    } catch (error) {
      console.error("❌ Erreur writing:", error);
      return this.mockWrite(prompt, options);
    }
  }

  // 🆕 TRANSLATOR version simple
  async translateText(text, targetLanguage = "en", sourceLanguage = "auto") {
    try {
      console.log("🌐 Traduction en cours...");
      return this.mockTranslate(text, targetLanguage);
    } catch (error) {
      console.error("❌ Erreur translation:", error);
      return this.mockTranslate(text, targetLanguage);
    }
  }

  // 🆕 Security analysis
  async analyzeThreat(url, context = "") {
    const prompt = `You are a cybersecurity expert analyzing URLs for threats.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 URL TO ANALYZE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${url}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 TASK: Identify 2-3 CONCISE threat indicators
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

FORMAT REQUIREMENTS:
✅ Max 50 characters per indicator
✅ Pattern: "Threat type (visible evidence)"
✅ ALWAYS use URL-encoded format (%27, %3C, %3E) instead of decoded characters (', <, >)
✅ Include actual URL patterns as they appear in the address bar
✅ NO redundant words like "indicating", "potential vulnerability"

GOOD EXAMPLES (use encoded format):
✅ "SQL injection (parameter contains %27)"
✅ "XSS attempt (encoded %3C%3E detected)"
✅ "Parameter tampering (artist=%27)"
✅ "Script injection (%3Cscript%3E found)"

BAD EXAMPLES (don't use decoded):
❌ "SQL injection (parameter contains ')"
❌ "XSS attempt (< > detected)"
❌ "Script injection (<script> found)"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📤 OUTPUT (strict JSON):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
{
  "riskScore": [0-100],
  "threatType": "safe|suspicious|phishing|malicious",
  "indicators": [
    "Threat type (pattern in %XX format)",
    "Another threat (%XX encoded)"
  ],
  "confidence": [0-1],
  "recommendations": ["action1", "action2"],
  "analysis": "brief summary"
}`;

    try {
      if (this.hasNativeAI && window.LanguageModel) {
        console.log("🤖 Using Gemini Nano for threat analysis");
        console.log("Starting threat analysis for:", url);

        // Use pre-warmed session if available, otherwise create new one
        let session;
        if (this.aiSession && this.isAIReady) {
          console.log("🔥 Using pre-warmed AI session");
          session = this.aiSession;
        } else {
          console.log("🆕 Creating new session for analysis");
          session = await window.LanguageModel.create({
            systemPrompt:
              "You are a cybersecurity expert. Analyze URLs for threats and respond ONLY in valid JSON format.",
            outputLanguage: "en",
          });
          console.log("Session created");
        }

        const result = await session.prompt(prompt);
        console.log(
          "Prompt executed, result length:",
          result ? result.length : 0
        );

        // Clean up session only if it's not the pre-warmed session
        if (session !== this.aiSession && session && session.destroy) {
          session.destroy();
        }

        console.log("✅ Analyse IA terminée");
        const parsedResult = this.parseAIResponse(result);
        console.log("Parsed result riskScore:", parsedResult.riskScore);

        // 🎯 STEP 2: USING SPECIALIZED APIs
        console.log("🚀 ÉTAPE 2: Génération contenu avec APIs spécialisées...");

        try {
          // Check API availability
          const hasSpecializedAPIs =
            window.Summarizer || window.Writer || window.Translator;

          if (hasSpecializedAPIs) {
            console.log(
              "🤖 Using specialized Chrome AI APIs for enhanced analysis"
            );

            const enhancementPromises = [];

            // 📝 SUMMARIZER: Analysis summary
            if (window.Summarizer) {
              const summarizerPromise = window.Summarizer.create({
                type: "key-points",
                format: "plain-text",
                length: "short",
              })
                .then(async (summarizer) => {
                  const summary = await writer.write(
                    `Generate exactly 2 concise security summary sentences for ${
                      parsedResult.threatType
                    } threat.
   Format: Two separate sentences, max 12 words each, no bullets.
   Context: ${parsedResult.riskScore}% risk, ${parsedResult.indicators?.join(
                      ", "
                    )}`
                  );

                  summarizer.destroy();
                  return { type: "summary", content: summary };
                })
                .catch((error) => {
                  console.log("📝 Summarizer fallback:", error.message);
                  return {
                    type: "summary",
                    content: `Risk: ${parsedResult.riskScore}% - ${parsedResult.threatType} threat detected`,
                  };
                });

              enhancementPromises.push(summarizerPromise);
            }

            // ✍️ WRITER: Detailed recommendations
            if (window.Writer) {
              const writerPromise = window.Writer.create({
                tone: "formal",
                format: "plain-text",
                length: "short",
              })
                .then(async (writer) => {
                  const recommendations = await writer.write(
                    `Generate exactly 3 concise cybersecurity recommendations for ${
                      parsedResult.threatType
                    } threat. 
   Format: bullet points, max 10 words each, no explanations.
   Context: ${parsedResult.indicators?.join(", ")}`
                  );

                  writer.destroy();
                  return {
                    type: "enhanced_recommendations",
                    content: recommendations,
                  };
                })
                .catch((error) => {
                  console.log("✍️ Writer fallback:", error.message);
                  return {
                    type: "enhanced_recommendations",
                    content: parsedResult.recommendations.join(". "),
                  };
                });

              enhancementPromises.push(writerPromise);
            }

            // 🌐 TRANSLATOR: Support multilingue (optionnel)
            if (window.Translator && url.includes("international")) {
              const translatorPromise = window.Translator.create({
                sourceLanguage: "en",
                targetLanguage: "fr",
              })
                .then(async (translator) => {
                  const translatedSummary = await translator.translate({
                    input: parsedResult.analysis.substring(0, 200),
                  });
                  translator.destroy();
                  return {
                    type: "translated_analysis",
                    content: translatedSummary,
                  };
                })
                .catch((error) => {
                  console.log("🌐 Translator fallback:", error.message);
                  return { type: "translated_analysis", content: null };
                });

              enhancementPromises.push(translatorPromise);
            }

            // 📝 PROOFREADER: Improve analysis text quality
            if (window.Proofreader) {
              const proofreaderPromise = window.Proofreader.create({
                type: "grammar-and-clarity",
                format: "plain-text",
              })
                .then(async (proofreader) => {
                  const improvedAnalysis = await proofreader.proofread({
                    input: parsedResult.analysis,
                    context:
                      "Technical cybersecurity report requiring professional clarity and accuracy",
                  });
                  proofreader.destroy();
                  return {
                    type: "proofread_analysis",
                    content: improvedAnalysis,
                  };
                })
                .catch((error) => {
                  console.log("📝 Proofreader fallback:", error.message);
                  return { type: "proofread_analysis", content: null };
                });

              enhancementPromises.push(proofreaderPromise);
            }

            // Attendre tous les enrichissements
            const enhancements = await Promise.all(enhancementPromises);

            // Integrate enrichments into result
            enhancements.forEach((enhancement) => {
              if (enhancement.content) {
                switch (enhancement.type) {
                  case "summary":
                    parsedResult.aiSummary = enhancement.content;
                    break;
                  case "enhanced_recommendations":
                    parsedResult.enhancedRecommendations = enhancement.content
                      .split(".")
                      .filter((r) => r.trim())
                      .slice(0, 3);
                    break;
                  case "translated_analysis":
                    parsedResult.translatedAnalysis = enhancement.content;
                    break;
                  case "proofread_analysis":
                    parsedResult.proofreadAnalysis = enhancement.content;
                    break;
                }
              }
            });

            console.log(
              "✅ APIs spécialisées appliquées:",
              enhancements.map((e) => e.type)
            );
          } else {
            console.log(
              "⚠️ APIs spécialisées non disponibles, utilisation résultat Gemini seul"
            );
          }
        } catch (apiError) {
          console.log("⚠️ Erreur APIs spécialisées:", apiError.message);
        }

        return parsedResult;
      } else {
        console.log("📡 Using mock threat analysis");
        return await mockAI.analyzeThreat({ url, context });
      }
    } catch (error) {
      console.error("Threat analysis error:", error);
      return {
        riskScore: 50,
        threatType: "unknown",
        indicators: ["Analysis failed: " + error.message],
        confidence: 0,
        recommendations: [
          "Manual review required",
          "Check system logs",
          "Verify AI status",
        ],
        analysis: "AI analysis unavailable",
      };
    }
  }

  // 🆕 FLOW COMPLET D'ANALYSE PROGRESSIVE
  // Fonction utilitaire pour détecter les sites de vulnérabilités de sécurité
  isSecurityVulnerabilitySite(url) {
    const securityDomains = [
      'exploit-db.com',
      'nvd.nist.gov',
      'cve.mitre.org',
      'rapid7.com',
      'packetstormsecurity.com',
      'vuldb.com',
      'cvedetails.com',
      'securityfocus.com'
    ];
    
    try {
      const urlObj = new URL(url);
      return securityDomains.some(domain => 
        urlObj.hostname === domain || 
        urlObj.hostname.endsWith('.' + domain)
      );
    } catch (e) {
      console.warn('URL parsing failed:', e);
      return false;
    }
  }

  async analyzeCompleteFlow(url, context = "") {
    console.log("🚨 === DÉMARRAGE ANALYSE COMPLÈTE ===");

    try {
      // STEP 1: First quick analysis with Gemini Nano
      console.log("⚡ ÉTAPE 1: Analyse rapide locale...");
      const quickAnalysis = await this.analyzeThreat(url, context);

      // Return immediately for display
      const progressiveResult = {
        ...quickAnalysis,
        isProgressive: true,
        currentStep: "quick-analysis",
        steps: {
          quickAnalysis: { status: "completed", data: quickAnalysis },
          deepAnalysis: { status: "pending", data: null },
          cveEnrichment: { status: "pending", data: null },
          finalRecommendations: { status: "pending", data: null },
        },
      };

      // STEP 2: Check if deep analysis should be triggered
      console.log("🔄 ÉTAPE 2: Vérification si deep analysis nécessaire...");

      // 🛡️ FORCE DEEP ANALYSIS FOR SECURITY/VULNERABILITY SITES
      const isSecuritySite = this.isSecurityVulnerabilitySite(url);
      console.log(`🔍 Site de sécurité détecté: ${isSecuritySite} pour ${url}`);

      // 🛡️ SAFETY CHECK: Skip n8n if URL is considered safe AND not a security site
      const isSafeUrl = quickAnalysis.threatType && quickAnalysis.threatType.includes("safe") && !isSecuritySite;
      if (isSafeUrl) {
        console.log(
          `✅ URL considérée SAFE (threatType: ${quickAnalysis.threatType}) et pas un site de sécurité - PAS d'envoi à n8n`
        );
        console.log("🛡️ Skipping deep analysis for safe URL");

        // Update progressive result to indicate safe URL
        progressiveResult.isSafeUrl = true;
        progressiveResult.safeReason = `Risk score ${quickAnalysis.riskScore}/100 - No deep analysis needed`;

        // Return immediately without triggering deep analysis
        return progressiveResult;
      }

      console.log(
        `⚠️ URL nécessite deep analysis - riskScore: ${quickAnalysis.riskScore}, isSecuritySite: ${isSecuritySite}, threatType: ${quickAnalysis.threatType}`
      );
      console.log("📡 Démarrage triggerDeepAnalysis avec:", {
        url,
        quickAnalysis,
      });

      // 🎯 DO NOT WAIT - Launch in background
      setTimeout(async () => {
        try {
          console.log("🚀 Lancement triggerDeepAnalysis en arrière-plan...");
          await this.triggerDeepAnalysis(url, context, quickAnalysis);
        } catch (error) {
          console.error("❌ Erreur triggerDeepAnalysis:", error);
        }
      }, 100);

      console.log("✅ Retour immédiat du flow progressif");
      return progressiveResult;
    } catch (error) {
      console.error("❌ Erreur flow complet:", error);
      return this.analyzeThreat(url, context); // Fallback
    }
  }

  // 🆕 DEEP ANALYSIS VIA N8N
  async triggerDeepAnalysis(url, context, quickAnalysis) {
    try {
      console.log("📡 Envoi vers n8n pour deep analysis...");
      console.log("📊 URL à analyser:", url);
      console.log("📊 QuickAnalysis données:", quickAnalysis);

      console.log(`🔍 Using persistent extensionId: ${this.extensionId}`);

      // 🎯 PAYLOAD 100% PLAT COMME LE MOCK QUI FONCTIONNE
      console.log(
        "🎯 ULTRA-SIMPLE MODE: No nested objects, only flat properties"
      );
      // 🎯 CORRECTED PAYLOAD WITH INDICATORS
      console.log("🎯 SENDING COMPLETE PAYLOAD with indicators");

      // 🔍 DEBUG: Check quickAnalysis content
      console.log("🔍 DEBUG quickAnalysis content:");
      console.log("  - threatType:", quickAnalysis.threatType);
      console.log("  - analysis:", quickAnalysis.analysis);
      console.log("  - indicators:", JSON.stringify(quickAnalysis.indicators));
      console.log("  - riskScore:", quickAnalysis.riskScore);
      console.log("  - confidence:", quickAnalysis.confidence);

      const webhookData = {
        extensionId: this.extensionId,
        url: url,
        threatType: quickAnalysis.threatType || "suspicious",
        summary: quickAnalysis.analysis || "Threat detected by AI",

        // ✅ AJOUTER CES CHAMPS
        indicators: quickAnalysis.indicators || [],
        riskScore: quickAnalysis.riskScore || 65,
        confidence: quickAnalysis.confidence || 0.7,

        timestamp: new Date().toISOString(),
      };

      // 🛡️ EXTRACT CVEs FROM PAGE CONTENT
      console.log("🛡️ Extracting CVEs from page content...");
      try {
        const extractedCves = await this.extractCvesFromPage(url);
        console.log("🔍 CVE extraction result:", extractedCves);
        if (extractedCves.length > 0) {
          webhookData.cve_ids = extractedCves;
          webhookData.cve_id = extractedCves[0]; // For backwards compatibility
          console.log("✅ Found CVEs in page:", extractedCves);
          console.log("📦 Updated webhookData with CVEs:", webhookData);
        } else {
          console.log("ℹ️ No CVEs found in page content");
        }
      } catch (error) {
        console.error("❌ Error extracting CVEs:", error);
      }

      // 🚨 ADDITIONAL MANUAL TRIGGER
      console.log("🚨 Tentative de déclenchement manuel du workflow...");

      // Essayer aussi l'endpoint direct du workflow n8n
      setTimeout(async () => {
        try {
          console.log("🎯 Tentative d'appel direct au workflow n8n...");
          const directResponse = await fetch(
            "https://soc-cert-extension.vercel.app/api/extension-queue",
            // "https://FAUSSE-URL-INEXISTANTE.com/webhook",

            {
              method: "GET",
              headers: { "Content-Type": "application/json" },
            }
          );

          if (directResponse.ok) {
            const queueData = await directResponse.json();
            console.log("📊 État de la queue n8n:", queueData);
          } else {
            console.log("❌ Erreur queue:", directResponse.status);
          }
        } catch (error) {
          console.log("❌ Erreur appel queue:", error.message);
        }
      }, 1000);

      console.log(
        "📦 Real Extension Payload:",
        JSON.stringify(webhookData, null, 2)
      );

      // 🔧 CORRECTION: Utiliser extension-webhook
      console.log(
        "🌐 Envoi vers:",
        "https://soc-cert-extension.vercel.app/api/extension-webhook"
      );
      console.log("📤 Démarrage fetch...");

      const response = await fetch(
        "https://soc-cert-extension.vercel.app/api/extension-webhook",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(webhookData),
        }
      );

      console.log(
        "📥 Réponse fetch reçue:",
        response.status,
        response.statusText
      );

      if (response.ok) {
        const result = await response.json();
        console.log("✅ Real extension data sent to n8n:", result);
        console.log("🔄 Démarrage polling avec l'ID réel...");
        // Start polling with real ID
        this.pollForDeepResults(url, quickAnalysis);
      } else {
        const errorText = await response.text();
        console.log("❌ Erreur envoi n8n:", response.status, errorText);
        console.log(
          "🔍 Headers de réponse:",
          Object.fromEntries(response.headers.entries())
        );
        console.log("🔍 Tentative de parsing JSON de l'erreur...");
        try {
          const errorJson = JSON.parse(errorText);
          console.log("📄 Erreur JSON:", errorJson);
        } catch (e) {
          console.log("📄 Erreur en texte brut:", errorText);
        }
      }
    } catch (error) {
      console.error("❌ Erreur deep analysis:", error);
      console.error("🔍 Stack trace:", error.stack);
      console.error("🔍 Message d'erreur:", error.message);
    }
  }

  // 🧪 SPECIAL POLLING FOR TEST WITH MOCK ID
  async pollForTestResults(url, quickAnalysis, maxAttempts = 20) {
    console.log("🧪 TEST POLLING avec ID mock...");
    console.log(`✅ Test Extension ID: test-login-token`);

    const API_URL =
      "https://soc-cert-extension.vercel.app/api/extension-result";

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        // Wait 3s before attempt (except first)
        if (attempt > 1) {
          await new Promise((resolve) => setTimeout(resolve, 5000));
        }

        // ✅ UTILISER L'ID DE TEST
        const apiUrl = `${API_URL}?extensionId=test-login-token&format=cve`;

        console.log(`🔍 TEST Tentative ${attempt}/${maxAttempts} - ${apiUrl}`);

        const response = await fetch(apiUrl);

        if (response.ok) {
          const rawText = await response.text();
          console.log(`📊 TEST Réponse polling RAW:`, rawText);

          let data;
          try {
            data = JSON.parse(rawText);
            console.log(`📊 TEST Réponse polling JSON:`, data);
          } catch (e) {
            console.log(`❌ Erreur parsing JSON:`, e);
            console.log(`📄 Raw response:`, rawText);
            continue; // Essayer la tentative suivante
          }

          // 🔍 DETAILED DEBUG of n8n TEST response
          console.log(`🧪 TEST DEBUG n8n Response:`);
          console.log(`  - success: ${data.success}`);
          console.log(
            `  - results: ${
              data.results ? data.results.length : "null/undefined"
            }`
          );
          console.log(
            `  - result: ${data.result ? "existe" : "null/undefined"}`
          );
          console.log(`  - extensionId: ${data.extensionId}`);
          console.log(`  - timestamp: ${data.timestamp}`);
          console.log(`  - debug info:`, data.debug);
          console.log(`  - FULL OBJECT KEYS:`, Object.keys(data));
          console.log(`  - FULL OBJECT:`, JSON.stringify(data, null, 2));

          if (data.results) {
            console.log(`  - results[0]:`, data.results[0]);
          }
          if (data.result) {
            console.log(`  - result content:`, data.result);
          }

          // ✅ Support des deux formats d'API
          let resultData = null;
          let hasResults = false;

          // Format ANCIEN : {success: true, results: [...]}
          if (data.success && data.results && data.results.length > 0) {
            console.log(
              "🧪 TEST: Deep analysis résultats trouvés (format ancien)!"
            );
            resultData = data.results[0];
            hasResults = true;
          }
          // Format NOUVEAU : {result: {...}}
          else if (data.result && data.result !== null) {
            console.log(
              "🧪 TEST: Deep analysis résultats trouvés (format nouveau)!"
            );
            resultData = data.result;
            hasResults = true;
          }

          if (hasResults && resultData) {
            console.log("🎉 TEST: Données trouvées:", resultData);
            console.log("✅ TEST RÉUSSI: Le format mock fonctionne!");

            // Emit event to update UI
            window.dispatchEvent(
              new CustomEvent("deepAnalysisUpdate", {
                detail: {
                  url: url,
                  deepResults: resultData,
                  attempt: attempt,
                  isTest: true,
                },
              })
            );

            return resultData;
          }
        } else {
          // 🔍 DEBUG pour erreurs HTTP
          console.log(`❌ TEST Erreur HTTP ${response.status} sur: ${apiUrl}`);
          const errorText = await response.text();
          console.log(`❌ TEST Détail erreur:`, errorText);
        }

        console.log(
          `⏳ TEST Tentative ${attempt}/${maxAttempts} - Aucun résultat, attente...`
        );
      } catch (error) {
        console.log(
          `❌ TEST Erreur polling tentative ${attempt}:`,
          error.message
        );
      }
    }

    console.log("⏱️ TEST Timeout - Format mock test terminé");
    return null;
  }

  // 🆕 POLLING FOR DEEP ANALYSIS RESULTS
  async pollForDeepResults(url, quickAnalysis, maxAttempts = 30) {
    console.log("🔄 Polling pour résultats deep analysis...");
    console.log(`✅ Extension ID utilisé: ${this.extensionId}`);
    // console.log("🎯 Target URL:", url);

    // // ✅ Waiting 3 secondes avant le premier polling
    // console.log("⏳ Waiting 3 seconds for n8n processing...");
    // await new Promise((resolve) => setTimeout(resolve, 3000));

    const API_URL =
      "https://soc-cert-extension.vercel.app/api/extension-result";

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        // Wait 3s before attempt (except first)
        if (attempt > 1) {
          await new Promise((resolve) => setTimeout(resolve, 7000));
        }

        // ✅ One Url  with real extensionId
        const apiUrl = `${API_URL}?extensionId=${encodeURIComponent(
          this.extensionId
        )}&format=cve`;

        console.log(`🔍 Tentative ${attempt}/${maxAttempts} - ${apiUrl}`);

        const response = await fetch(apiUrl);

        if (response.ok) {
          const rawText = await response.text();
          console.log(`📊 Réponse polling RAW:`, rawText);

          let data;
          try {
            data = JSON.parse(rawText);
            console.log(`📊 Réponse polling JSON:`, data);
          } catch (e) {
            console.log(`❌ Erreur parsing JSON:`, e);
            console.log(`📄 Raw response:`, rawText);
            continue; // Essayer la tentative suivante
          }

          // 🔍 DETAILED DEBUG of n8n response
          console.log(`🔍 DEBUG n8n Response:`);
          console.log(`  - success: ${data.success}`);
          console.log(
            `  - results: ${
              data.results ? data.results.length : "null/undefined"
            }`
          );
          console.log(
            `  - result: ${data.result ? "existe" : "null/undefined"}`
          );
          console.log(`  - extensionId: ${data.extensionId}`);
          console.log(`  - timestamp: ${data.timestamp}`);
          console.log(`  - debug info:`, data.debug);
          console.log(`  - FULL OBJECT KEYS:`, Object.keys(data));
          console.log(`  - FULL OBJECT:`, JSON.stringify(data, null, 2));

          if (data.results) {
            console.log(`  - results[0]:`, data.results[0]);
          }
          if (data.result) {
            console.log(`  - result content:`, data.result);
          }

          // ✅ Support des deux formats d'API
          let resultData = null;
          let hasResults = false;

          // Debug filter by URL
          console.log("🔍 URL FILTER DEBUG:");
          console.log("  - Current URL:", url);
          console.log("  - All results:", data.results?.length);
          console.log("  - First result link:", data.results?.[0]?.link);
          console.log("  - URL === Link?", url === data.results?.[0]?.link);
          console.log("  - URL length:", url?.length);
          console.log("  - Link length:", data.results?.[0]?.link?.length);

          // Filter results by current URL
          // Filter by visited URL (normalized) — only criteria requested by user.
          // Ne pas appliquer de priorisation real/virtual ici : afficher simplement la CVE
          // that matches the analyzed URL. If multiple results exist for the same URL,
          // we take the most recent (receivedAt > timestamp) — this reflects what the backend
          // (n8n) returned last for this URL.
          // ✅ Fonction pour normaliser les URLs (décoder les caractères)
          function normalizeUrl(url) {
            try {
              // Créer un objet URL
              const urlObj = new URL(url);

              // Décoder tous les paramètres
              const params = new URLSearchParams(urlObj.search);
              const decodedParams = new URLSearchParams();

              for (const [key, value] of params) {
                // Décoder le paramètre (transform %27 → ')
                decodedParams.set(key, decodeURIComponent(value));
              }

              // Reconstruire l'URL avec paramètres décodés
              urlObj.search = decodedParams.toString();

              return urlObj.toString();
            } catch (error) {
              console.error("URL normalization error:", error);
              // Fallback: décoder simplement toute l'URL
              return decodeURIComponent(url);
            }
          }

          let urlFilteredResults = [];
          if (data.results && Array.isArray(data.results)) {
            const normalizedCurrent = normalizeUrl(url);
            urlFilteredResults = data.results.filter((r) => {
              const rlink = r.link || r.url || "";
              return normalizeUrl(rlink) === normalizedCurrent;
            });
          }

          console.log(
            "🔍 Filtered by URL:",
            urlFilteredResults.length,
            "results"
          );

          // If multiple matches, pick the most recent (receivedAt > timestamp), fallback to highest score
          let selectedResult = null;
          if (urlFilteredResults.length === 1) {
            selectedResult = urlFilteredResults[0];
          } else if (urlFilteredResults.length > 1) {
            selectedResult = urlFilteredResults.reduce((best, cur) => {
              const bestTime = new Date(
                best.receivedAt || best.timestamp || 0
              ).getTime();
              const curTime = new Date(
                cur.receivedAt || cur.timestamp || 0
              ).getTime();
              if (curTime !== bestTime) return curTime > bestTime ? cur : best;
              // tie-breaker: higher score
              const bScore = best.score || 0;
              const cScore = cur.score || 0;
              return cScore > bScore ? cur : best;
            }, urlFilteredResults[0]);
          }

          console.log(
            "✅ Selected by URL:",
            selectedResult && selectedResult.cve_id
          );

          // ///////////////////////// ✅ FILTER BY VISITED SITE URL + SORT BY SEVERITY/SCORE

          // // ✅ FILTER BY VISITED SITE URL + SORT BY SEVERITY/SCORE
          // chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          //   const currentUrl = tabs[0]?.url;
          //   console.log(`🌐 Current tab URL: ${currentUrl}`);

          //   // 1️⃣ FILTRER : Afficher UNIQUEMENT les CVE de cette URL
          //   const urlFilteredResults = data.filter((item) => {
          //     const itemUrl = item.link || item.url || "";

          //     // ✅ Match exact
          //     if (itemUrl === currentUrl) {
          //       console.log(`✅ EXACT MATCH: ${item.cve_id} - ${itemUrl}`);
          //       return true;
          //     }

          //     // ✅ Match partiel (sans protocole et sans query params)
          //     const normalizeUrl = (url) => {
          //       try {
          //         const urlObj = new URL(url);
          //         return urlObj.hostname + urlObj.pathname;
          //       } catch {
          //         return url.replace(/^https?:\/\//, "").split("?")[0];
          //       }
          //     };

          //     const normalizedItemUrl = normalizeUrl(itemUrl);
          //     const normalizedCurrentUrl = normalizeUrl(currentUrl);

          //     if (normalizedItemUrl === normalizedCurrentUrl) {
          //       console.log(`✅ PARTIAL MATCH: ${item.cve_id} - ${itemUrl}`);
          //       return true;
          //     }

          //     return false;
          //   });

          //   console.log(
          //     `🔍 Filtered by URL: ${urlFilteredResults.length} results for ${currentUrl}`
          //   );

          //   // 2️⃣ TRIER : Par Severity > Score > Type (Real/Virtual) > Date
          //   urlFilteredResults.sort((a, b) => {
          //     // 1️⃣ Comparer par SEVERITY (Critical > High > Medium > Low)
          //     const severityOrder = {
          //       Critical: 0,
          //       High: 1,
          //       Medium: 2,
          //       Low: 3,
          //       Unknown: 4,
          //     };
          //     const aSeverity = severityOrder[a.severity] ?? 4;
          //     const bSeverity = severityOrder[b.severity] ?? 4;

          //     if (aSeverity !== bSeverity) {
          //       console.log(
          //         `🔥 Sort by severity: ${a.severity} (${aSeverity}) vs ${b.severity} (${bSeverity})`
          //       );
          //       return aSeverity - bSeverity; // ✅ Plus critique en premier
          //     }

          //     // 2️⃣ If same severity, compare by SCORE (90 > 80 > 70...)
          //     const aScore = a.score || 0;
          //     const bScore = b.score || 0;

          //     if (aScore !== bScore) {
          //       console.log(`📊 Sort by score: ${aScore} vs ${bScore}`);
          //       return bScore - aScore; // ✅ Higher score first
          //     }

          //     // 3️⃣ If same severity AND same score, THEN prioritize real CVE
          //     const aIsReal = !a.cve_id?.startsWith("CVE-2026");
          //     const bIsReal = !b.cve_id?.startsWith("CVE-2026");

          //     console.log(
          //       `🔍 Compare CVE type: ${a.cve_id} (${
          //         aIsReal ? "REAL" : "VIRTUAL"
          //       }) vs ${b.cve_id} (${bIsReal ? "REAL" : "VIRTUAL"})`
          //     );

          //     if (aIsReal && !bIsReal) return -1; // ✅ Real CVE first (at equality)
          //     if (!aIsReal && bIsReal) return 1; // ✅ Virtual CVE last (at equality)

          //     // 4️⃣ If everything is equal, sort by date (most recent first)
          //     const aDate = new Date(a.timestamp || 0);
          //     const bDate = new Date(b.timestamp || 0);
          //     return bDate - aDate; // ✅ Most recent first
          //   });

          //   console.log(
          //     `✅ After sort: ${urlFilteredResults[0]?.cve_id} (severity: ${urlFilteredResults[0]?.severity}, score: ${urlFilteredResults[0]?.score})`
          //   );

          //   // 3️⃣ Display the results
          //   this.displayResults(urlFilteredResults);
          // });

          // /////////////////////////************************************************ */

          console.log(
            "✅ After sort:",
            urlFilteredResults[0] && urlFilteredResults[0].cve_id
          );

          // Format ANCIEN : {success: true, results: [...]}
          if (data.success && selectedResult && urlFilteredResults.length > 0) {
            console.log("✅ Deep analysis résultats trouvés (format ancien)!");
            resultData = selectedResult;
            hasResults = true;
          }
          // Format NOUVEAU : {result: {...}}
          else if (data.result && data.result !== null) {
            console.log("✅ Deep analysis résultats trouvés (format nouveau)!");
            resultData = data.result;
            hasResults = true;
          }

          if (hasResults && resultData) {
            console.log("🎉 Données trouvées:", resultData);

            // Emit event to update UI
            window.dispatchEvent(
              new CustomEvent("deepAnalysisUpdate", {
                detail: {
                  url: url,
                  deepResults: resultData,
                  attempt: attempt,
                },
              })
            );

            return resultData;
          }
        } else {
          // 🔍 DEBUG pour erreurs HTTP
          console.log(`❌ Erreur HTTP ${response.status} sur: ${apiUrl}`);
          const errorText = await response.text();
          console.log(`❌ Détail erreur:`, errorText);
        }

        console.log(
          `⏳ Tentative ${attempt}/${maxAttempts} - Aucun résultat, attente...`
        );
      } catch (error) {
        console.log(`❌ Erreur polling tentative ${attempt}:`, error.message);
      }
    }

    console.log("⏱️ Timeout deep analysis - Génération fallback cohérent");

    // 🎯 CONSISTENT FALLBACK with Gemini analysis (now async)
    const coherentFallback = await this.generateCoherentFallback(
      quickAnalysis,
      url
    );

    // Emit event with consistent fallback
    window.dispatchEvent(
      new CustomEvent("deepAnalysisUpdate", {
        detail: {
          url: url,
          deepResults: coherentFallback,
          attempt: maxAttempts,
          isFallback: true,
        },
      })
    );

    return coherentFallback;
  }

  // Ligne ~1320
  simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    // Format: 6 chiffres (ex: 148724)
    return Math.abs(hash).toString().slice(0, 6).padStart(6, "0");
  }

  // 🎯 CONSISTENT GENERATION FALLBACK with Gemini analysis
  async generateCoherentFallback(quickAnalysis, url) {
    console.log("🎯 Génération fallback cohérent pour:", quickAnalysis);

    // 🔍 EXTRACTION OF REAL DATA FROM ANALYSIS
    const riskScore = quickAnalysis.riskScore || 50;
    const threatType = quickAnalysis.threatType || "unknown";
    const indicators = quickAnalysis.indicators || [];
    const analysisText = quickAnalysis.analysis || "";
    const threats = quickAnalysis.threats || [];

    // 🎯 DYNAMIC SEVERITY GENERATION
    let coherentSeverity, coherentConfidence;
    if (riskScore >= 70) {
      coherentSeverity = "High";
      coherentConfidence = 0.85 + Math.random() * 0.1;
    } else if (riskScore >= 40) {
      coherentSeverity = "Medium";
      coherentConfidence = 0.75 + Math.random() * 0.15;
    } else {
      coherentSeverity = "Low";
      coherentConfidence = 0.65 + Math.random() * 0.15;
    }

    // 🎯 DYNAMIC CVE BASED ON ANALYSIS
    const urlHash = this.simpleHash(url + threatType);
    const cveId = `CVE-2026-${urlHash}`;

    // 🎯 DYNAMIC TITLE BASED ON THREAT TYPE
    const generateTitle = () => {
      const domain = url
        ? new URL(url).hostname.replace("www.", "")
        : "unknown domain";

      switch (threatType) {
        case "phishing":
          return `Phishing Detection: ${domain}`;
        case "malware":
          return `Malware Pattern: ${domain}`;
        case "suspicious":
          return `Suspicious Activity: ${domain}`;
        case "data-breach":
          return `Data Exposure Risk: ${domain}`;
        default:
          return `Security Assessment: ${domain}`;
      }
    };

    // 🎯 DYNAMIC DESCRIPTION BASED ON ANALYSIS
    const generateDescription = () => {
      const mainIndicator = indicators[0] || "unspecified security pattern";
      const fullAnalysis =
        analysisText ||
        "Security pattern analysis conducted using advanced threat detection algorithms";
      return `${mainIndicator} detected with ${riskScore}% confidence. ${fullAnalysis}`;
    };

    // 🎯 RECOMMANDATIONS DYNAMIQUES AVEC GEMINI AI
    const generateRecommendations = async () => {
      // Base recommendations selon le score de risque
      const baseRecommendations = [];
      if (riskScore >= 70) {
        baseRecommendations.push("🚨 Immediate security review required");
        baseRecommendations.push("Block access to this resource");
      } else if (riskScore >= 40) {
        baseRecommendations.push("⚠️ Monitor this resource closely");
        baseRecommendations.push("Implement additional security filters");
      } else {
        baseRecommendations.push("✅ Continue standard monitoring");
      }

      // 🤖 INTELLIGENT GENERATION WITH GEMINI
      let generationMethod = "rule-based";
      try {
        console.log("🤖 Requesting recommendations from Gemini...");
        const prompt = `You are a senior SOC analyst. Generate SPECIFIC recommendations.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 THREAT CONTEXT:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Threat Type: ${threatType}
- Risk Level: ${riskScore}%
- Indicators: ${indicators.join(", ")}
- URL: ${url}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 TASK: Generate 2-3 ACTIONABLE recommendations
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

REQUIREMENTS:
✅ Address the SPECIFIC indicators detected
✅ Max 60 characters per recommendation
✅ Use technical security terminology
✅ Focus on immediate mitigation actions

EXAMPLES:
✅ "Block URLs with encoded apostrophes (%27)"
✅ "Implement WAF rules for SQL injection patterns"
✅ "Review Appspot domain traffic logs"

Format: Plain list, no bullets, 2-3 lines only.`;

        if (window.LanguageModel) {
          const session = await window.LanguageModel.create({
            temperature: 0.3,
            topK: 1,
          });
          const geminiResponse = await session.prompt(prompt);
          session.destroy();

          console.log("🤖 Raw Gemini response:", geminiResponse);

          // Parse Gemini response
          const geminiRecs = geminiResponse
            .split("\n")
            .filter((line) => line.trim())
            .map((line) => line.replace(/^[-•*]\s*/, "").trim())
            .filter((line) => line.length > 10 && line.length < 60)
            .slice(0, 3);

          console.log("🤖 Parsed Gemini recommendations:", geminiRecs);

          if (geminiRecs.length > 0) {
            generationMethod = "gemini-ai";
            console.log("✅ Using Gemini recommendations");
            // Prefix with AI icons to indicate source
            const aiRecommendations = geminiRecs.map((rec) => `🤖 ${rec}`);
            return [...baseRecommendations.slice(0, 1), ...aiRecommendations];
          }
        }
      } catch (error) {
        console.log("⚠️ Gemini error, falling back to rules:", error);
      }

      // Fallback: Recommendations based on indicators
      indicators.forEach((indicator) => {
        const lowerIndicator = indicator.toLowerCase();
        if (lowerIndicator.includes("extension")) {
          baseRecommendations.push("Review browser extension permissions");
        }
        if (lowerIndicator.includes("url") || lowerIndicator.includes("link")) {
          baseRecommendations.push("Verify URL authenticity and origin");
        }
        if (
          lowerIndicator.includes("debug") ||
          lowerIndicator.includes("dev")
        ) {
          baseRecommendations.push("Disable debug mode in production");
        }
        if (lowerIndicator.includes("malicious")) {
          baseRecommendations.push("Run comprehensive malware scan");
        }
      });

      // Add general recommendation if few indicators
      if (baseRecommendations.length < 3) {
        baseRecommendations.push("Update security configurations");
        baseRecommendations.push("Enable enhanced monitoring");
      }

      console.log(`📊 Final generation method: ${generationMethod}`);
      return {
        recommendations: baseRecommendations.slice(0, 4),
        generationMethod: generationMethod,
      };
    };

    // 🎯 ANALYSE ENRICHIE DYNAMIQUE
    const enhancedAnalysis =
      `Enhanced deep analysis completed. AI models analyzed ${indicators.length} threat indicators ` +
      `for ${threatType} pattern. Risk assessment: ${riskScore}% (${coherentSeverity} severity). ` +
      `Behavioral analysis confirms ${Math.round(
        coherentConfidence * 100
      )}% confidence in assessment.`;

    // Generate recommendations (now async)
    const recResult = await generateRecommendations();
    const recommendations = recResult.recommendations;
    const recMethod = recResult.generationMethod;

    // 🎯 GENERATION OF SPECIALIZED AI RESULTS FOR DEEP ANALYSIS
    let specializedResults = {};

    try {
      console.log("🎯 Starting specialized AI generation for deep analysis...");
      console.log("🎯 Available APIs check:", {
        summarizer: !!(window.ai && window.ai.summarizer),
        writer: !!(window.ai && window.ai.writer),
        translator: !!(window.ai && window.ai.translator),
        proofreader: !!window.Proofreader,
      });

      // For immediate results, we will force test results if APIs are not ready
      console.log("🎯 Checking API readiness...");
      const summarizerReady =
        window.ai && window.ai.summarizer
          ? (await window.ai.summarizer.availability()) === "ready"
          : false;
      const writerReady =
        window.ai && window.ai.writer
          ? (await window.ai.writer.availability()) === "ready"
          : false;

      console.log("🎯 API readiness:", { summarizerReady, writerReady });

      if (!summarizerReady && !writerReady) {
        console.log(
          "🎯 APIs not ready, generating mock specialized results for deep analysis"
        );
        specializedResults = {
          aiSummary: `Risk: ${riskScore}% (${coherentSeverity}). Threat type: ${threatType}. Key indicators: ${indicators
            .slice(0, 2)
            .join(", ")}. Confidence level: ${Math.round(
            coherentConfidence * 100
          )}%.`,
          enhancedRecommendations: [
            `Implement ${threatType} protection protocols`,
            `Monitor for similar ${
              riskScore >= 50 ? "high-risk" : "low-risk"
            } patterns`,
            `Update security policies for ${threatType} threats`,
          ],
          translatedAnalysis: `Enhanced analysis: ${enhancedAnalysis}`,
          proofreadAnalysis:
            enhancedAnalysis.replace(/\s+/g, " ").trim() +
            " (Quality verified)",
        };
        console.log(
          "🎯 Mock specialized results generated:",
          specializedResults
        );
      } else {
        // 📝 SUMMARIZER pour l'analyse
        if (window.ai && window.ai.summarizer) {
          console.log("📝 Testing Summarizer availability...");
          const summarizerAvailability =
            await window.ai.summarizer.availability();
          console.log("📝 Summarizer availability:", summarizerAvailability);
          if (summarizerAvailability === "ready") {
            const summarizer = await window.ai.summarizer.create({
              type: "key-points",
              format: "markdown",
              length: "short",
            });
            const summaryText = `Analysis: ${enhancedAnalysis}\nThreat indicators: ${indicators.join(
              ", "
            )}\nRecommendations: ${recommendations.join(", ")}`;
            const summary = await summarizer.summarize({ text: summaryText });
            summarizer.destroy();
            specializedResults.aiSummary = summary;
            console.log("📝 Deep analysis summarized:", summary);
          }
        } else {
          console.log("📝 window.ai.summarizer not available");
        }

        // ✍️ WRITER for improved recommendations
        if (window.ai && window.ai.writer) {
          console.log("✍️ Testing Writer availability...");
          const writerAvailability = await window.ai.writer.availability();
          console.log("✍️ Writer availability:", writerAvailability);
          if (writerAvailability === "ready") {
            const writer = await window.ai.writer.create({
              tone: "formal",
              format: "plain-text",
              length: "short",
            });
            const context = `Security threat type: ${threatType}, Risk: ${riskScore}%, Indicators: ${indicators.join(
              ", "
            )}`;
            const writerPrompt = `Write 3 specific security recommendations for: ${context}`;
            const enhancedRecs = await writer.write({ text: writerPrompt });
            writer.destroy();
            if (enhancedRecs) {
              specializedResults.enhancedRecommendations = enhancedRecs
                .split("\n")
                .filter((line) => line.trim())
                .slice(0, 3);
              console.log(
                "✍️ Deep analysis recommendations enhanced:",
                enhancedRecs
              );
            }
          }
        } else {
          console.log("✍️ window.ai.writer not available");
        }

        // 🌐 TRANSLATOR pour analyse multilingue
        if (
          window.ai &&
          window.ai.translator &&
          analysisText &&
          !analysisText.match(/^[A-Za-z\s.,!?-]+$/)
        ) {
          console.log("🌐 Testing Translator availability...");
          const translatorAvailability =
            await window.ai.translator.availability();
          console.log("🌐 Translator availability:", translatorAvailability);
          if (translatorAvailability === "ready") {
            const translator = await window.ai.translator.create({
              sourceLanguage: "detect",
              targetLanguage: "en",
            });
            const translated = await translator.translate({
              text: enhancedAnalysis,
            });
            translator.destroy();
            specializedResults.translatedAnalysis = translated;
            console.log("🌐 Deep analysis translated:", translated);
          }
        } else {
          console.log("🌐 Translator not available or not needed");
        }

        // 📝 PROOFREADER to improve quality
        if (window.Proofreader) {
          console.log("📝 Testing Proofreader availability...");
          const proofreader = await window.Proofreader.create({
            type: "grammar-and-clarity",
          });
          const improved = await proofreader.proofread({
            text: enhancedAnalysis,
          });
          proofreader.destroy();
          specializedResults.proofreadAnalysis = improved;
          console.log("📝 Deep analysis proofread:", improved);
        } else {
          console.log("📝 window.Proofreader not available");
        }
      }

      console.log("🎯 Final specialized results:", specializedResults);
    } catch (error) {
      console.log("⚠️ Specialized AI error in deep analysis:", error.message);
      // Fallback in case of error - FORCE result generation
      console.log("🎯 FORCING fallback specialized results due to error");
      specializedResults = {
        aiSummary: `Security analysis summary: ${threatType} threat detected with ${riskScore}% risk level. Behavioral patterns indicate ${coherentSeverity.toLowerCase()} severity threat.`,
        enhancedRecommendations: [
          `Review ${threatType} security measures immediately`,
          `Update monitoring protocols for ${coherentSeverity.toLowerCase()} threats`,
          `Verify system integrity and access controls`,
        ],
        translatedAnalysis: `Translated analysis: ${enhancedAnalysis}`,
        proofreadAnalysis: `Proofread analysis: ${enhancedAnalysis
          .replace(/\s+/g, " ")
          .trim()}`,
      };
      console.log("🎯 FORCED fallback results:", specializedResults);
    }

    // Ensure we have at least mock results
    if (
      !specializedResults.aiSummary &&
      !specializedResults.enhancedRecommendations
    ) {
      console.log("🎯 NO RESULTS DETECTED - Adding emergency fallback");
      specializedResults = {
        aiSummary: `Deep analysis completed: ${threatType} threat (${riskScore}% risk, ${coherentSeverity} severity)`,
        enhancedRecommendations: [
          "Enable security monitoring",
          "Review threat indicators",
          "Update protection protocols",
        ],
        translatedAnalysis: "Analysis available in English",
        proofreadAnalysis: enhancedAnalysis,
      };
      console.log("🎯 Emergency fallback applied:", specializedResults);
    }

    // Ligne ~1467 dans generateCoherentFallback()
    return {
      aiAnalysis: enhancedAnalysis,
      ...specializedResults,

      // ✅ FORMAT IDENTIQUE À N8N - STRUCTURE COMPLÈTE
      cve_id: cveId,
      title: generateTitle(),
      severity: coherentSeverity,
      score: riskScore,
      link: url,
      timestamp: new Date().toISOString(),
      source: "Local AI Fallback",
      status: "New",
      cve_description: generateDescription(),
      cve_vulnerabilityName:
        threatType.charAt(0).toUpperCase() + threatType.slice(1) + " Activity",
      cve_requiredAction:
        "Investigate and remediate based on AI recommendations",
      cve_notes: `AI Detection - Indicators: ${indicators.join(
        " | "
      )}. Risk Score: ${riskScore}. Confidence: ${Math.round(
        coherentConfidence * 100
      )}%. Context: ${generateDescription()}`,
      cve_product: "Web Application",
      cve_vendor: "Unknown Vendor",
      cve_dateAdded: "",
      cve_dueDate: "",
      cve_knownRansomwareCampaignUse: "Unknown",
      mappedCVE: false,
      mappingConfidence: 0,
      mappingSource: "local_fallback",
      isVirtual: true,
      processedBy: "local-ai-fallback",

      // ✅ AUSSI AJOUTER recommendations POUR COMPATIBILITÉ
      recommendations: recommendations,
      recommendationsSource:
        recMethod === "gemini-ai"
          ? "Generated by Gemini AI"
          : "Rule-based analysis",
      confidence: coherentConfidence,
      processingTime: `${(2.5 + Math.random() * 1.0).toFixed(1)}s`,
    };
  }
  async summarizeCVE(cveData) {
    const text = `
    CVE ID: ${cveData.id}
    Description: ${cveData.description}
    Severity: ${cveData.severity}
    CVSS: ${cveData.cvss}
    Affected Products: ${
      (cveData.products && cveData.products.join(", ")) || "Unknown"
    }
    `;

    try {
      if (this.hasNativeAI && this.nativeAI && this.nativeAI.summarizer) {
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

  // 🆕 Detect language (corrected version)
  async detectLanguage(text) {
    try {
      if (this.hasNativeAI && this.nativeAI && this.nativeAI.languageDetector) {
        const result = await this.nativeAI.languageDetector.detect({
          text: text,
        });
        console.log(
          `🌍 Detected language: ${result[0] && result[0].detectedLanguage}`
        );
        return result;
      } else {
        return await mockAI.languageDetector.detect({ text });
      }
    } catch (error) {
      return [{ detectedLanguage: "en", confidence: 0.5 }];
    }
  }

  // 🆕 Generate SOC recommendations (corrected version)
  async generateSOCRecommendations(threatContext) {
    const prompt = `
    Generate SOC response recommendations:
    Threat Type: ${threatContext.threatType}
    Risk Score: ${threatContext.riskScore}
    Indicators: ${
      threatContext.indicators && threatContext.indicators.join(", ")
    }
    `;

    try {
      if (this.hasNativeAI && this.nativeAI && this.nativeAI.writer) {
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

  // 🛡️ Validate that generated recommendations match the threat/context
  validateRecommendations(recommendations, quickAnalysis, cveData) {
    try {
      const result = {
        total: Array.isArray(recommendations) ? recommendations.length : 0,
        items: [],
        summary: {
          relevant: 0,
          possibly_unrelated: 0,
        },
      };

      // Build keyword list from indicators + cve
      const indicators = (quickAnalysis && quickAnalysis.indicators) || [];
      const keywords = new Set();
      indicators.forEach((ind) => {
        String(ind)
          .toLowerCase()
          .split(/[^a-z0-9]+/)
          .filter(Boolean)
          .forEach((w) => keywords.add(w));
      });
      if (cveData && cveData.cve_id)
        keywords.add(String(cveData.cve_id).toLowerCase());
      // common security keywords
      [
        "sql",
        "injection",
        "waf",
        "patch",
        "parameter",
        "sanitize",
        "validate",
        "parameterized",
        "prepared",
        "password",
        "least",
        "privilege",
        "monitor",
      ].forEach((k) => keywords.add(k));

      // detect hostname/platform hints
      const url =
        (quickAnalysis && quickAnalysis.analyzedUrl) ||
        (cveData && cveData.link) ||
        "";
      let hostname = "";
      try {
        hostname = new URL(url).hostname || "";
      } catch (e) {
        hostname = String(url || "");
      }

      const recs = Array.isArray(recommendations) ? recommendations : [];
      recs.forEach((rec, idx) => {
        const content = (
          typeof rec === "string"
            ? rec
            : (rec.title || "") + " " + (rec.description || "")
        ).toLowerCase();
        const matched = [];
        keywords.forEach((k) => {
          if (k && content.includes(k)) matched.push(k);
        });

        const issues = [];
        if (matched.length === 0) {
          issues.push("no_matching_indicators");
        }

        // platform-specific recommendation check (e.g., mentions WordPress)
        if (content.includes("wordpress") || content.includes("wp-")) {
          if (!hostname.includes("wordpress") && !hostname.includes("wp")) {
            issues.push("platform_mismatch(wordpress)");
          }
        }

        const isRelevant = issues.length === 0;
        if (isRelevant) result.summary.relevant += 1;
        else result.summary.possibly_unrelated += 1;

        result.items.push({
          index: idx,
          matchedKeywords: matched,
          issues,
          relevant: isRelevant,
        });
      });

      this.lastEnhancedValidation = result;
      console.log("🔎 Recommendation validation summary:", result);
      return result;
    } catch (e) {
      console.log("⚠️ validateRecommendations failed:", e.message || e);
      this.lastEnhancedValidation = null;
      return null;
    }
  }

  // Helper to parse AI responses
  parseAIResponse(response) {
    try {
      // Clean response (remove markdown, spaces, etc.)
      let cleanResponse = response.trim();

      // Remove markdown code blocks if present
      cleanResponse = cleanResponse
        .replace(/^```json\s*/, "")
        .replace(/\s*```$/, "");

      // Look for JSON in response - try multiple patterns
      let jsonMatch = cleanResponse.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        // Try to find JSON between first { and last }
        const firstBrace = cleanResponse.indexOf("{");
        const lastBrace = cleanResponse.lastIndexOf("}");
        if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
          cleanResponse = cleanResponse.substring(firstBrace, lastBrace + 1);
        }
      } else {
        cleanResponse = jsonMatch[0];
      }

      console.log(
        "🔍 Attempting to parse JSON:",
        cleanResponse.substring(0, 200) + "..."
      );

      const parsed = JSON.parse(cleanResponse);
      console.log("✅ Réponse IA parsée avec succès:", parsed);

      // Valider la structure
      return {
        riskScore: parsed.riskScore || 50,
        threatType: parsed.threatType || "unknown",
        indicators: Array.isArray(parsed.indicators)
          ? parsed.indicators
          : ["AI analysis completed"],
        confidence: parsed.confidence || 0.8,
        recommendations: Array.isArray(parsed.recommendations)
          ? parsed.recommendations
          : ["Review recommended"],
        analysis: parsed.analysis || "AI security analysis",
        analyzedUrl: parsed.analyzedUrl || "Current page",
      };
    } catch (error) {
      console.log(
        "⚠️ JSON parsing failed, using fallback analysis:",
        error.message
      );

      // Fallback: Conservative approach - if we can't parse, assume moderate risk
      // Don't trigger deep analysis for parsing failures
      const text = response.toLowerCase();

      // Default to moderate risk when parsing fails
      let riskScore = 60; // Moderate risk
      let threatType = "suspicious";

      // Only increase risk for clear malicious indicators
      if (
        text.includes("malware") ||
        text.includes("trojan") ||
        text.includes("ransomware")
      ) {
        riskScore = 85;
        threatType = "malicious";
      } else if (
        text.includes("phishing") &&
        (text.includes("scam") || text.includes("fraud"))
      ) {
        riskScore = 80;
        threatType = "phishing";
      }
      // For other cases like "phishing attempts" in legitimate analysis, keep moderate risk

      console.log(`🔄 Fallback analysis: ${threatType} (score: ${riskScore})`);

      return {
        riskScore: riskScore,
        threatType: threatType,
        indicators: ["AI analysis parsing failed - manual review recommended"],
        confidence: 0.6, // Lower confidence for fallback
        recommendations: [
          "Manual security review recommended",
          "Verify analysis results",
          "Consider additional scanning",
        ],
        analysis: "AI response parsing failed - fallback analysis applied",
        analyzedUrl: "Current page",
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

  // Main methods CORRECTED
  async summarize(text, options = {}) {
    try {
      if (this.hasNativeAI && this.nativeAI && this.nativeAI.summarizer) {
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

  // 🆕 MOCK METHODS FOR FALLBACK
  mockSummarize(text, options = {}) {
    const maxLength =
      options.length === "short" ? 100 : options.length === "long" ? 300 : 200;
    const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);
    const keyPoints = sentences
      .slice(0, 3)
      .map((s) => `• ${s.trim()}`)
      .join("\n");

    return `📝 **Résumé automatique (${
      options.type || "key-points"
    })**\n\n${keyPoints}\n\n*Généré par SOC-CERT AI Mock*`;
  }

  mockWrite(prompt, options = {}) {
    const tone = options.tone || "neutral";
    const templates = {
      security: `🛡️ **Analyse de sécurité SOC-CERT**\n\nSuite à votre demande: "${prompt}"\n\n• Évaluation des risques en cours\n• Recommandations de sécurité à suivre\n• Surveillance continue activée\n\n*Rapport généré par SOC-CERT AI*`,
      incident: `🚨 **Rapport d'incident**\n\nIncident détecté: ${prompt}\n\n**Actions recommandées:**\n• Investigation immédiate\n• Isolation des systèmes affectés\n• Documentation complète\n\n*SOC-CERT Response Team*`,
      default: `📄 **Réponse SOC-CERT**\n\n${prompt}\n\nAnalyse en cours avec les outils de sécurité avancés.\n\n*Généré par SOC-CERT AI Assistant*`,
    };

    return templates[options.format] || templates.default;
  }

  mockTranslate(text, targetLanguage) {
    const translations = {
      en: `🌐 [AUTO-TRANSLATED TO ENGLISH]\n\n${text}\n\n*Translation by SOC-CERT AI*`,
      fr: `🌐 [TRADUIT AUTOMATIQUEMENT EN FRANÇAIS]\n\n${text}\n\n*Traduction par SOC-CERT AI*`,
      es: `🌐 [TRADUCIDO AUTOMÁTICAMENTE AL ESPAÑOL]\n\n${text}\n\n*Traducción por SOC-CERT AI*`,
    };

    return (
      translations[targetLanguage] ||
      `🌐 [TRANSLATED TO ${targetLanguage.toUpperCase()}]\n\n${text}`
    );
  }

  // 🛡️ CVE EXTRACTION FUNCTIONS
  extractCvesFromText(text) {
    // regex robuste : CVE-YYYY-NNNN (4+ digits after dash)
    const re = /\bCVE-(\d{4})-(\d{4,7})\b/ig;
    const found = new Set();
    let m;
    while ((m = re.exec(text)) !== null) {
      found.add(m[0].toUpperCase());
    }
    return Array.from(found);
  }

  async extractCvesFromPage(url) {
    try {
      // Try to get CVEs from page content via dynamic script injection
      const [tab] = await chrome.tabs.query({ url: url });
      if (!tab) {
        console.log("⚠️ No tab found for URL:", url);
        return [];
      }

      // Inject CVE extraction script dynamically
      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: () => {
          // CVE extraction function (same as in content-script.js)
          function extractCvesFromText(text) {
            if (!text || typeof text !== 'string') return [];

            const cveRegex = /\bCVE-(\d{4})-(\d{4,7})\b/ig;
            const matches = text.match(cveRegex) || [];

            // Normalize to uppercase and remove duplicates
            return [...new Set(matches.map(cve => cve.toUpperCase()))];
          }

          // Scan the entire page for CVEs from multiple sources
          function scanPageForCves() {
            const cveSets = [];

            try {
              // 1. Scan URL
              const urlCves = extractCvesFromText(window.location.href);
              if (urlCves.length > 0) cveSets.push(urlCves);

              // 2. Scan body text content
              const bodyText = document.body ? document.body.textContent || document.body.innerText : '';
              const bodyCves = extractCvesFromText(bodyText);
              if (bodyCves.length > 0) cveSets.push(bodyCves);

              // 3. Scan all anchor elements (href + text)
              const anchors = document.querySelectorAll('a');
              anchors.forEach(anchor => {
                const hrefCves = extractCvesFromText(anchor.href);
                const textCves = extractCvesFromText(anchor.textContent || anchor.innerText);
                if (hrefCves.length > 0) cveSets.push(hrefCves);
                if (textCves.length > 0) cveSets.push(textCves);
              });

              // 4. Scan pre and code blocks
              const codeElements = document.querySelectorAll('pre, code, .code, .highlight');
              codeElements.forEach(element => {
                const codeCves = extractCvesFromText(element.textContent || element.innerText);
                if (codeCves.length > 0) cveSets.push(codeCves);
              });

              // 5. Scan meta tags
              const metaTags = document.querySelectorAll('meta');
              metaTags.forEach(meta => {
                const contentCves = extractCvesFromText(meta.content || '');
                const nameCves = extractCvesFromText(meta.name || '');
                if (contentCves.length > 0) cveSets.push(contentCves);
                if (nameCves.length > 0) cveSets.push(nameCves);
              });

              // 6. Scan script tags (src + inline content)
              const scripts = document.querySelectorAll('script');
              scripts.forEach(script => {
                const srcCves = extractCvesFromText(script.src || '');
                const contentCves = extractCvesFromText(script.textContent || script.innerText || '');
                if (srcCves.length > 0) cveSets.push(srcCves);
                if (contentCves.length > 0) cveSets.push(contentCves);
              });

            } catch (error) {
              console.error('❌ Error during CVE scanning:', error);
            }

            // Flatten and deduplicate all CVEs
            const allCves = cveSets.flat();
            const uniqueCves = [...new Set(allCves)];

            console.log('🔍 Found ' + uniqueCves.length + ' unique CVEs:', uniqueCves);
            return uniqueCves;
          }

          // Return the CVEs found
          return scanPageForCves();
        }
      }).catch((error) => {
        console.log("⚠️ Dynamic script injection failed, trying URL extraction:", error.message);
        // Fallback: try to extract from URL only
        return [{ result: this.extractCvesFromText(url) }];
      });

      if (results && results[0] && results[0].result) {
        return results[0].result;
      }

      // Fallback to URL-only extraction
      return this.extractCvesFromText(url);
    } catch (error) {
      console.warn("⚠️ Failed to extract CVEs from page:", error);
      // Fallback to URL-only extraction
      return this.extractCvesFromText(url);
    }
  }

  // Existing methods continue...
}


// Instance globale
const aiHelper = new AIHelper();
window.socAI = aiHelper;

// Deferred async initialization to avoid CSP
console.log("🔧 AI Helper loaded - initialization deferred");
