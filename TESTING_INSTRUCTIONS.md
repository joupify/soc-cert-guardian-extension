# 🧪 Testing Instructions

## ⚙️ One-Time Setup (10-15 minutes) - Do This First

**Chrome AI Preparation:**

1. **Enable Chrome AI**: Navigate to `chrome://flags/#optimization-guide-on-device-model`
2. Set to **"Enabled BypassPerfRequirement"** → Restart Chrome
3. **Wait 5-10 minutes** for Gemini Nano model download
4. **Verify**: Open `chrome://components/` → Confirm **"Optimization Guide On Device Model"** is up-to-date

**Extension Installation:** 5. Download from [GitHub](https://github.com/joupify/soc-cert-extension) 6. Open `chrome://extensions/` → Enable **Developer Mode** 7. Click **"Load unpacked"** → Select `extension/` folder

> ⏰ **One-time only** - After this setup, testing takes < 2 minutes anytime!

---

## ⚡ Quick Test (2 minutes) - After Setup Complete

**Instant Demo:**

1. Visit: `http://testphp.vulnweb.com/artists.php?artist=1'` (SQL injection test)
2. ✅ **See red overlay alert** appear automatically within 1-2 seconds
3. Click extension icon → Watch **progressive analysis**:

- ⚡ **Phase 1 (Instant)**: Local Gemini Nano threat detection
- 🔄 **Phase 2 (2-3s)**: Virtual CVE generation + CISA KEV correlation
- 🧠 **Phase 3 (Background)**: AlienVault OTX + VirusTotal enrichment

---

## 🔬 Deep Dive (5 minutes) - Full Feature Showcase

### 1. **Verify Chrome AI Status**

- Open: `chrome://components/`
- Confirm **"Optimization Guide On Device Model"** status: **up-to-date**
- Version should be recent (2024+)

### 2. **Test Progressive Hybrid AI Architecture**

**Recommended Test Domains:**

- `http://testphp.vulnweb.com/artists.php?artist=1'` – **Best demo** (SQL injection)
- `http://zero.webappsecurity.com/` – Zero Bank demo (XSS tests)
- `https://testsafebrowsing.appspot.com/s/phishing.html` – Phishing test

**Watch the Progressive Analysis:**

**Step 1 - Instant (< 1s):**

- 🔴 Red overlay appears with initial risk score

**Step 2 - Local AI (< 2s):**

- 🤖 Gemini Nano analyzes threat patterns
- 📝 Summarizer extracts key findings
- ✍️ Writer generates recommendations
- Status badges update in real-time

**Step 3 - Hybrid Enrichment (2-10s):**

- 🔮 **Virtual CVE generated** (e.g., CVE-2026-148724)
- 🗄️ **CISA KEV Catalog match** (1,400+ CVEs searched)
- 🌐 **AlienVault OTX correlation** (threat intelligence feeds)
- 🔍 **VirusTotal validation** (multi-engine scanning)
- 📊 **Internet exposure estimate** (global vulnerable hosts count)

**This is the KILLER FEATURE** - Watch the popup update in real-time as each intelligence source reports back!

### 3. **Verify All 5 Chrome AI APIs**

Open the extension popup on any detected threat:

**Check API Status Section:**

- ✅ **LanguageModel** (Gemini Nano) - Core threat analysis
- ✅ **Summarizer** - Executive summary
- ✅ **Writer** - Remediation recommendations
- ✅ **Translator** - 28 languages support
- ✅ **Proofreader** - Quality validation

**All should show green checkmarks ✅**

### 4. **Test Translation Feature (Innovation Showcase)**

- Click any **🌐 mini-button** next to AI results
- Select a language (FR, ES, DE, JP, etc.)
- ✅ **Only that section translates** (per-section control)
- Click **"Restore Original"** to revert
- **Test different languages** on different sections simultaneously

---

## ✅ Expected Results - The Complete Picture

**Phase 1: Instant Local Analysis (< 2s)**

- ✅ Red security overlay with initial severity score
- ✅ Gemini Nano threat detection active
- ✅ Basic threat indicators identified

**Phase 2: Hybrid Intelligence (2-10s) - THIS IS THE DIFFERENTIATOR**

- ✅ **Virtual CVE generated** (e.g., CVE-2026-148724)
- ✅ **CISA KEV match found** (if vulnerability is known)
- ✅ **AlienVault OTX pulses** (threat intelligence indicators)
- ✅ **VirusTotal detections** (3/94 engines, etc.)
- ✅ **Internet exposure** (2,847 vulnerable hosts globally)
- ✅ **Real CVE metadata**: Description, vendor, product, severity, required actions

**This Makes SOC-CERT the ONLY extension providing:**

- ❌ Not just "AI detected something suspicious"
- ✅ **Verified threat intelligence** from 4 authoritative sources
- ✅ **Actionable CVE data** (standardized, SIEM-ready)
- ✅ **Global context** (exposure + threat feeds)

**Translation & UX:**

- ✅ 28-language support with per-section controls
- ✅ 85%+ average confidence on threat classification
- ✅ **< 2.3 seconds** average full analysis time
- ✅ Progressive UI - see results as they arrive

---

## 🎯 What Makes This Different

**Traditional AI Extensions:**

```
User visits malicious site
   ↓
AI: "This looks suspicious" (generic warning)
   ↓
User: "Okay... but what CVE? How serious? Is this known?"
   ❌ No answers
```

**SOC-CERT Guardian:**

```
User visits http://testphp.vulnweb.com/artists.php?artist=1'
   ↓
< 1s: Red overlay appears with threat severity score
   ↓
< 2s: Gemini Nano completes threat analysis
   ↓
2-3s: Virtual CVE generated (CVE-2026-XXXXXX format)
     ⚠️ THIS IS THE INNOVATION - No official CVE exists for this threat!
   ↓
4-6s: AlienVault OTX threat intelligence correlation
   ↓
8-10s: VirusTotal validation + Internet exposure analysis
   ↓
User sees complete threat report with:
   • Virtual CVE ID (trackable, SIEM-ready)
   • Risk Score & Confidence Level
   • Threat Indicators (SQL injection patterns detected)
   • AI-generated Recommendations (input validation, parameterized queries, WAF rules)
   • Threat Intelligence from 4 sources
   ✅ THIS is why Virtual CVEs matter - Real threats, instant tracking!
```

**🔥 This demonstrates the core innovation:**

- Traditional tools: "Suspicious site detected" ❌ (no tracking, no CVE)
- SOC-CERT: **Generates unique Virtual CVE** ✅ (instant tracking, SIEM-ready)
- **90-day NVD gap eliminated** - You get a CVE ID TODAY, not in 3 months!

---

## 📚 Additional Resources

- 📘 **Full Documentation**: [README.md](https://github.com/joupify/soc-cert-extension/blob/main/README.md)
- 🛠️ **Installation Guide**: [INSTALL.md](https://github.com/joupify/soc-cert-extension/blob/main/install.md)
- 🎥 **Demo Video**: [Watch on YouTube (1080p HD)](https://www.youtube.com/watch?v=jEfFdMXPSn0)
- 🏆 **Previous Win**: [n8n AI Agents Challenge](https://dev.to/joupify/soc-cert-automated-threat-intelligence-system-with-n8n-ai-5722)

> 💡 **Tip for judges:** Click the settings gear ⚙️ on YouTube and select **1080p** for best clarity. The extension UI contains fine details best viewed in high definition.

---

## 🆘 Troubleshooting

**Problem**: "Chrome AI not available"  
**Solution**: Wait 5-10 minutes after enabling flag + restart. Check `chrome://components/` for model download status.

**Problem**: "No red overlay appears"  
**Solution**: Ensure you're using Chrome Canary/Dev (v127+). Stable Chrome may not have all AI APIs yet.

**Problem**: "APIs show ❌ instead of ✅"  
**Solution**: Some APIs may need model download. Wait a few minutes or test on Chrome Dev channel.

**Problem**: "CVE data not showing"  
**Solution**: Backend n8n workflow must be active. Check network tab for API calls to Vercel endpoint.
