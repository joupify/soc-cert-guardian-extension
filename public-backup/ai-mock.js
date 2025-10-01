// ai-mock.js - Mock des APIs Chrome AI en attendant EPP
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
};

// Export pour usage global
window.mockAI = mockAI;
console.log("🔄 AI Mock system loaded - Ready for EPP");
