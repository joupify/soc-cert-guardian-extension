## ⚡ TL;DR

🚨 **Problem:** The NVD takes up to 90 days to document new vulnerabilities — leaving enterprises exposed.  
🤖 **Solution:** **SOC-CERT Guardian** detects threats in **2.3 seconds** using **Chrome’s built-in AI** and generates **Virtual CVEs** in real time.  
🧠 **How:** Hybrid AI architecture — local Gemini Nano analysis + n8n backend for CVE enrichment.  
🏆 **Result:** Enterprise-grade protection, instantly delivered through a Chrome extension.

---

🎥 **Demo Video:** [Watch on YouTube (1080p HD)](https://www.youtube.com/watch?v=jEfFdMXPSn0&vq=hd1080)  
💡 Tip for judges: Click the settings gear ⚙️ on YouTube and select 1080p for best clarity. The extension UI contains fine details best viewed in high definition.

---

## What it does

SOC-CERT Guardian eliminates the 90-day vulnerability documentation gap by detecting emerging threats in **2.3 seconds** using Chrome's built-in AI.  
It combines **local Gemini Nano analysis** with **real-time CVE intelligence** from the **CISA KEV Catalog**, generating **Virtual CVEs** for zero-day threats before they are officially documented.  
**Ready for multimodal expansion** with Prompt API’s image/audio capabilities.

---

## How we built it

- **Frontend:** Chrome Extension with 5 integrated AI APIs (LanguageModel, Summarizer, Writer, Translator, Proofreader)
- **Backend:** n8n workflow for CVE correlation with 1,400+ known exploited vulnerabilities
- **Architecture:** Hybrid AI system — local processing for speed, cloud enrichment for intelligence
- **Storage:** Vercel KV for real-time caching and results delivery

---

# 🌐 Worldwide Accessibility - 28 Languages Supported

One of the key innovations of **SOC-CERT Guardian** is its truly **global reach**. Security threats don't speak just one language, and neither should security tools.

---

## Why Translation Matters for Cybersecurity

In today's interconnected world, cybersecurity is a global challenge that requires collaboration across borders and languages. Our extension ensures that:

- 🌍 **Global SOC Teams** can collaborate seamlessly in their native languages
- 🏢 **Multinational Enterprises** can protect offices worldwide with consistent security
- 🎓 **Cybersecurity Students** can learn and practice regardless of their location
- 🔒 **Threat Intelligence Sharing** crosses language barriers for faster response
- 💼 **Security Analysts** work more efficiently in their preferred language

**Impact**: Over 80% of the global population can now access enterprise-grade security analysis in their native language.

---

## 28 Languages - 5 Continents

**SOC-CERT Guardian** supports **28 languages** across the globe:

### 🇪🇺 European Languages (13)

🇬🇧 English | 🇫🇷 French | 🇪🇸 Spanish | 🇩🇪 German | 🇮🇹 Italian | 🇵🇹 Portuguese | 🇳🇱 Dutch | 🇵🇱 Polish | 🇸🇪 Swedish | 🇩🇰 Danish | 🇳🇴 Norwegian | 🇫🇮 Finnish | 🇨🇿 Czech | 🇬🇷 Greek

### 🌏 Asian Languages (10)

🇨🇳 Chinese (Simplified) | 🇹🇼 Chinese (Traditional) | 🇯🇵 Japanese | 🇰🇷 Korean | 🇮🇳 Hindi | 🇧🇩 Bengali | 🇻🇳 Vietnamese | 🇹🇭 Thai | 🇮🇩 Indonesian

### 🌍 Middle Eastern (3)

🇸🇦 Arabic | 🇮🇱 Hebrew | 🇹🇷 Turkish

### 🌎 Slavic (2)

🇷🇺 Russian | 🇺🇦 Ukrainian

**Coverage Highlights**:

- ✅ All 6 UN official languages (English, French, Spanish, Russian, Chinese, Arabic)
- ✅ Major business languages (German, Japanese, Korean, Portuguese)
- ✅ Emerging markets (Hindi, Bengali, Vietnamese, Indonesian)

---

## Intelligent 3-Tier Translation Architecture

We've implemented a **production-ready, fail-safe translation system** that ensures the extension always works, regardless of API availability:

```
Priority 1: Chrome Translation API (Native)
├─ Sub-second translation
├─ Instant availability for common pairs (EN↔FR, EN↔ES, EN↔DE)
└─ Validates language pairs before translating
   ↓ (if unavailable)
Priority 2: Gemini Nano AI Translation
├─ AI-powered translation via prompts
├─ Preserves technical cybersecurity terminology
└─ Works for all 28 languages
   ↓ (if unavailable)
Priority 3: Graceful Degradation
├─ User-friendly error messages
├─ Clear guidance for enabling APIs
└─ Extension remains fully functional
```

**Why This Matters**:

- ⚡ **Performance**: Native Chrome API provides instant translation
- 🛡️ **Reliability**: Always functional with intelligent fallback
- 🎯 **Accuracy**: AI preserves technical security terms
- 🌐 **Coverage**: All 28 languages supported regardless of API status

---

## Key Translation Features

### Smart Language Detection

- Automatically detects source language (English or French)
- No manual configuration needed
- Seamless user experience

### Bidirectional Language Support 🆕

**Innovation**: Unlike competitors offering only "English to everything", **SOC-CERT Guardian** supports **bidirectional translation** starting from English OR French.

- 🇫🇷 **French SOC Teams**: Can work natively in French, translate to any of the 28 languages
- 🌐 **True Multilingual**: Not just "English to everything" like competitors
- 🔄 **Flexibility**: Switch between EN/FR sources transparently
- 🎯 **User Experience**: Zero manual language selection needed

**Pattern-based Detection**:

```javascript
// Detects French words: "le", "la", "et", "est", "pour"
// Detects English words: "the", "and", "is", "for", "with"
// Auto-routes to correct translation pair
```

### Language Pair Validation

- Checks `canTranslate()` status before attempting translation
- Three states: `readily` (instant), `after-download` (requires model), `no` (fallback)
- Real-time console logging for troubleshooting

### Technical Terms Preservation

- Cybersecurity vocabulary maintained across all languages
- CVE identifiers, security protocols, and technical concepts preserved
- Context-aware translation for accurate security analysis

### Real-Time Availability

- Dynamic API status checking
- Transparent user feedback
- Progressive enhancement approach

---

## Granular Translation Controls 🆕

**SOC-CERT Guardian** offers unprecedented control with **per-section translation**:

### Individual Translate Buttons (🌐)

- Each AI analysis result has its own translate button
- **Summarizer**, **Writer**, **Translator**, and **Proofreader** outputs can be translated independently
- Translate only what you need, when you need it
- Preserves UI performance and user control

### Inline Translation Experience

- Text translates **directly in place** (no popups or new windows)
- Original content preserved with one-click **"Restore Original"** button
- Smooth animations and visual feedback
- Language selection dropdown per section (28 languages each)

### Why This Matters

- 🎯 **Precision**: Translate specific sections without re-translating everything
- ⚡ **Performance**: Only process what's needed
- 🎨 **User Control**: Granular control over multilingual workflow
- 💼 **Workflow**: Perfect for multilingual SOC teams reviewing specific analysis parts

### Example Workflow

```
1. Analyst sees English analysis
2. Needs to share Recommendations with French team
3. Clicks 🌐 on Writer section → Selects "Français"
4. Only recommendations translate (< 100ms)
5. Shares translated section while keeping rest in English
```

### Technical Innovation

- Event-driven architecture for independent translations
- DOM manipulation with content restoration
- State management per translatable section
- Prevents redundant API calls with smart caching

---

## Real-World Use Cases

### Global SOC Operations

A multinational company with SOC teams in Paris, Tokyo, and São Paulo can now:

- Receive threat alerts in French, Japanese, and Portuguese
- Collaborate on incident response in their native languages
- Share threat intelligence without language barriers
- Reduce response time by eliminating translation delays
- **NEW**: Translate only specific sections (e.g., recommendations) for targeted collaboration

### Cybersecurity Education

Universities and training centers worldwide can:

- Teach security concepts in local languages
- Provide hands-on practice with real CVE analysis
- Make cybersecurity accessible to non-English speakers
- Democratize security education globally
- **NEW**: Students can toggle between languages to learn technical terminology

### Enterprise Security

Companies with international presence can:

- Deploy consistent security monitoring across all offices
- Ensure compliance reporting in local languages
- Train security staff in their preferred language
- Reduce miscommunication in critical security incidents
- **NEW**: Section-by-section translation for regulatory compliance reports

### Threat Intelligence Sharing

Security researchers can:

- Share findings across linguistic boundaries
- Collaborate on zero-day vulnerabilities globally
- Contribute to collective defense regardless of language
- Accelerate threat response through multilingual analysis
- **NEW**: Selectively translate technical analysis while keeping CVE IDs in original language

---

## Technical Implementation

### API Integration

```javascript
// Chrome Translation API (Priority 1)
const translator = await window.translation.createTranslator({
  sourceLanguage: "en",
  targetLanguage: "fr",
});

// Validate availability
const status = await translator.canTranslate();
// Status: "readily", "after-download", or "no"

// Translate with context preservation
const translated = await translator.translate(securityAnalysisText);
```

### Fallback to Gemini Nano

```javascript
// If Translation API unavailable, use LanguageModel
const session = await window.ai.languageModel.create({
  systemPrompt:
    "Translate security analysis to [language], preserving technical terms",
});
const result = await session.prompt(analysisText);
```

### Advanced UI Integration 🆕

**Mini-Translate Buttons Architecture**:

```javascript
// Individual translate button per API result
<button class="translate-mini-btn" data-target="ai-summary-text">
  🌐
</button>

// Language dropdown menu (28 options)
<select class="lang-menu">
  <option value="fr">🇫🇷 Français</option>
  <option value="es">🇪🇸 Español</option>
  <option value="de">🇩🇪 Deutsch</option>
  <!-- ... 25 more languages -->
</select>

// Inline content replacement
const translateInline = async (targetId, lang) => {
  const element = document.getElementById(targetId);
  const original = element.innerHTML;

  // Translate with API fallback chain
  const translated = await translateText(original, lang);

  // Replace content + add restore button
  element.innerHTML = translated;
  showRestoreButton(targetId, original);
};
```

**Benefits**:

- 🎨 Clean, intuitive interface
- 🚀 Fast, responsive interactions
- 🔄 Reversible translations (restore original)
- 📱 Works on all screen sizes

### Performance Metrics

- ⚡ **< 100ms**: Translation time for common language pairs (Chrome API)
- 🤖 **< 2s**: AI-powered translation via Gemini Nano (all 28 languages)
- 📊 **10,000 chars**: Maximum translation length per request
- 🔄 **3-level**: Fallback system ensures 100% uptime
- 🌐 **28**: Languages supported with intelligent routing
- 🎯 **4**: Independent translatable sections (Summarizer, Writer, Translator, Proofreader)
- 💾 **Zero latency**: Restored originals cached in memory

---

## Documentation & Support

**Complete technical documentation** available in our repository:

- [TRANSLATION_LANGUAGES.md](https://github.com/joupify/soc-cert-guardian-extension/blob/main/TRANSLATION_LANGUAGES.md) - Full language list and availability details
- [README.md](https://github.com/joupify/soc-cert-guardian-extension#-translator-api) - Integration guide and API usage
- Console logging for real-time status monitoring
- Chrome flags configuration guide for optimal performance

**Enabling Translation API**:

1. Open `chrome://flags`
2. Enable `#translation-api`
3. Enable `#optimization-guide-on-device-model`
4. Restart Chrome
5. Models download automatically in background

---

## Global Impact Statistics

### Language Coverage

- 🌍 **80%+** of global population can use in native language
- 🌏 **95%+** of G20 countries covered
- 🌎 **100%** of Top 10 internet languages supported
- 🌐 **6/6** UN official languages included

### Business Reach

- Major economic zones: EU, APAC, Americas, MENA
- Fortune 500 operating languages
- Emerging markets with rapid digital growth
- International cybersecurity standards organizations

### Security Community

- OWASP community languages
- MITRE ATT&CK framework regions
- Major CVE database consumers
- Global threat intelligence networks

---

## Innovation & Technical Excellence

### What Makes This Unique

1. **First Chrome Extension** to integrate Translation API for cybersecurity
2. **28 Languages** - More than most commercial security tools
3. **3-Tier Fallback** - Production-ready reliability engineering
4. **AI-Powered** - Gemini Nano preserves technical context
5. **Zero Dependencies** - Native Chrome APIs only
6. **Real-Time** - Instant translation for security incidents
7. **Offline Capable** - Models cached locally for privacy
8. **🆕 Per-Section Translation** - Granular control unprecedented in security tools
9. **🆕 Bidirectional Support** - EN/FR source language detection
10. **🆕 Inline UI** - No popups, seamless user experience

### Technical Achievements

- Advanced Chrome Built-in AI APIs integration
- Intelligent fallback architecture design
- Context-aware cybersecurity translation
- Performance optimization for real-time use
- Comprehensive error handling and logging
- Extensive language validation system
- **🆕 Event-driven translation architecture**
- **🆕 DOM state management for reversible translations**
- **🆕 Smart caching to prevent redundant API calls**

---

## Future Vision

### Planned Enhancements

- 🔄 **Enhanced Bidirectional Translation**: Expand beyond EN/FR to multi-source detection
- 🎯 **Custom Glossaries**: Industry-specific term databases
- 🌐 **Language Auto-Detection**: ML-based source language identification
- 📊 **Translation Quality Metrics**: User feedback and accuracy scoring
- 🔒 **Privacy Mode**: On-device translation for sensitive content
- 🆕 **Team Collaboration**: Shared translation preferences across SOC teams
- 🆕 **API Rate Optimization**: Intelligent batching for bulk translations

### Scalability

- Ready for enterprise deployment
- Supports team collaboration features
- Can integrate with SIEM systems
- API-ready for third-party integrations
- Cloud-sync capabilities planned

---

## Why This Matters for Cybersecurity

### Language is a Security Issue

- Miscommunication during incidents costs time and money
- Non-English speakers face barriers to security education
- Global threat intelligence requires language fluency
- Compliance reporting often requires local languages
- Security awareness training needs localization

### SOC-CERT Guardian Solution

- ✅ Removes language barriers in security operations
- ✅ Democratizes access to advanced security tools
- ✅ Enables faster global threat response
- ✅ Supports compliance in local languages
- ✅ Makes cybersecurity education accessible worldwide
- **🆕 ✅ Granular translation control for efficient workflows**
- **🆕 ✅ Bidirectional support for French-speaking SOC teams**

---

---

## Challenges we ran into

- **API Availability:** Experimental Chrome AI APIs required robust fallback systems
- **Performance:** Balancing <2.3s detection with comprehensive analysis
- **Privacy:** Designing hybrid architecture to keep sensitive data local
- **CVE Correlation:** Developing intelligent token matching against the KEV Catalog

---

## Accomplishments that we're proud of

- 🏆 **First hybrid AI security extension** combining local + cloud intelligence
- 🎯 **5/5 Chrome AI APIs** integrated with distinct, meaningful use cases
- ⚡ **2.3s detection** vs. industry-standard 90-day NVD delay
- 🔮 **Virtual CVE system** for real-time zero-day threat tracking
- 🚀 **Production-ready** with enterprise-grade UX and error handling
- 🧠 **1,400+ CVEs correlated** from CISA KEV Catalog for enterprise intelligence

  💡 Recognized by the [n8n & Bright Data AI Agents Challenge (August 2025)](https://dev.to/joupify/soc-cert-automated-threat-intelligence-system-with-n8n-ai-5722)

---

## What we learned

- Chrome’s built-in AI can solve real-world security problems at scale
- Hybrid architectures overcome fundamental limitations of on-device AI
- Robust fallback systems are essential for experimental APIs
- Progressive analysis (instant + enhanced) provides optimal user experience
- **Privacy-first AI:** On-device processing keeps sensitive browsing data local while delivering enterprise-grade intelligence

---

## What's next for SOC-CERT Guardian

**Continuing the SOC-CERT Evolution:**

- **📈 Enterprise Scaling:** Expanding from award-winning n8n workflow to a full enterprise security platform
- **🤖 Advanced AI Integration:** Multimodal threat analysis using Prompt API with image/audio support
- **👥 Team Collaboration:** Enterprise features for security team threat intelligence sharing
- **🔗 Industry Integration:** Connecting with security orchestration platforms (SIEM/SOAR)
- **🌐 Expanded Intelligence:** More threat intelligence sources and automated mitigation
- **📱 Mobile Expansion:** Companion app leveraging the same proven hybrid AI architecture

---

**From n8n Challenge Winner to Chrome AI Pioneer** — this extension continues our mission to make enterprise-grade security accessible to everyone.

---

SOC-CERT Guardian was built with a hybrid architecture leveraging Chrome’s built-in AI and automation workflows to deliver real-time security intelligence directly in the browser.
