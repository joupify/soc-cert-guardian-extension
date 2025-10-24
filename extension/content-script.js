// content-script.js - Analyzes web pages for SOC-CERT
console.log("🔍 SOC-CERT Content Script loaded on:", window.location.href);

// Analysis state
let pageAnalysis = null;
let aiAnalysisTriggered = false;

// 🆕 CONNECTION TO AI SYSTEM
async function initializeAIConnection() {
  try {
    // Wait for ai-helper to be loaded
    let attempts = 0;
    while (!window.socAI && attempts < 20) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      attempts++;
    }

    if (window.socAI) {
      console.log("✅ AI Helper connected to content script");
      await window.socAI.initialize();

      // 🎯 AUTOMATIC ANALYSIS TRIGGER
      if (!aiAnalysisTriggered && shouldAnalyzePage()) {
        console.log("🚀 Auto-triggering page analysis...");
        aiAnalysisTriggered = true;
        await triggerAutoAnalysis();
      }
    } else {
      console.log("⚠️ AI Helper not available in content script");
    }
  } catch (error) {
    console.log("❌ Error initializing AI connection:", error);
  }
}

// 🆕 CHECK IF PAGE SHOULD BE ANALYZED
function shouldAnalyzePage() {
  const url = window.location.href;

  // Do not analyze extension or system pages
  if (url.startsWith("chrome://") || url.startsWith("chrome-extension://")) {
    return false;
  }

  // Do not analyze local development pages
  if (url.includes("localhost") || url.includes("127.0.0.1")) {
    return false;
  }

  // Analyse all urls HTTPS
  return url.startsWith("https://");
}

// 🆕 AUTOMATIC REAL ANALYSIS TRIGGER
async function triggerAutoAnalysis() {
  try {
    const url = window.location.href;

    console.log("🔍 Starting security analysis for:", url);

    // ✅ Step 1: Analyse Gemini Nano FIRST
    const geminiAnalysis = await window.socAI?.analyzeURL?.(url);

    if (!geminiAnalysis) {
      console.log("⚠️ Gemini analysis not available");
      return;
    }

    console.log("📊 Gemini Analysis Result:", {
      isSafe: geminiAnalysis.isSafe,
      riskScore: geminiAnalysis.riskScore,
      threatType: geminiAnalysis.threatType,
    });

    // ✅ Step  2: CHECK is this SAFE / Gemini
    if (geminiAnalysis.riskScore < 40) {
      console.log(
        `✅ Site marked as SAFE by Gemini (risk: ${geminiAnalysis.riskScore}/100) - SKIP n8n`
      );
      return; // ❌ STOP - Not send to  n8n
    }

    // ✅ Step  3:  site - Detecte real alerts
    console.log("⚠️ Suspicious site detected - Running security checks...");
    const realSecurityAlerts = detectRealSecurityAlerts();

    if (realSecurityAlerts.length > 0) {
      console.log(
        `🚨 ${realSecurityAlerts.length} SECURITY ALERTS DETECTED:`,
        realSecurityAlerts
      );

      // ✅ Step 4: Send n8n only real threats
      console.log("📡 Sending to n8n for KEV correlation...");
      await sendRealAlertsToN8N(url, realSecurityAlerts);
    } else {
      console.log("⚠️ Suspicious but no specific alerts detected");
    }
  } catch (error) {
    console.error("❌ Security analysis error:", error);
  }
}

// 🚨 DETECT REAL SECURITY ALERTS ON PAGE
function detectRealSecurityAlerts() {
  const alerts = [];

  // 🔍 1. DETECTION OF UNSECURE FORMS
  const unsecureFormElements = document.querySelectorAll(
    'form:not([action^="https://"])'
  );
  if (unsecureFormElements.length > 0) {
    alerts.push({
      type: "insecure_form",
      severity: "HIGH",
      description: `${unsecureFormElements.length} form(s) submitting to non-HTTPS endpoints`,
      elements: Array.from(unsecureFormElements).map((form) => ({
        action: form.action || "no action specified",
        method: form.method || "GET",
        hasPasswordFields:
          form.querySelectorAll('input[type="password"]').length > 0,
      })),
    });
  }

  // 🔍 2. DETECTION OF SUSPICIOUS EXTERNAL SCRIPTS
  const externalScripts = document.querySelectorAll("script[src]");
  const suspiciousScripts = Array.from(externalScripts).filter((script) => {
    const src = script.src.toLowerCase();
    return (
      src.includes("eval") ||
      src.includes("obfuscat") ||
      src.match(/[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}/) || // IP addresses
      src.includes("bit.ly") ||
      src.includes("tinyurl") || // URL shorteners
      !src.startsWith("https://")
    );
  });

  if (suspiciousScripts.length > 0) {
    alerts.push({
      type: "suspicious_scripts",
      severity: "MEDIUM",
      description: `${suspiciousScripts.length} suspicious external script(s) detected`,
      scripts: suspiciousScripts.map((script) => script.src),
    });
  }

  // 🔍 3. DETECTION OF MIXED CONTENT (HTTP on HTTPS)
  if (window.location.protocol === "https:") {
    const mixedContent = document.querySelectorAll(
      'img[src^="http:"], iframe[src^="http:"], script[src^="http:"]'
    );
    if (mixedContent.length > 0) {
      alerts.push({
        type: "mixed_content",
        severity: "MEDIUM",
        description: `${mixedContent.length} insecure resource(s) loaded over HTTP on HTTPS page`,
        resources: Array.from(mixedContent).map((el) => ({
          type: el.tagName.toLowerCase(),
          src: el.src,
        })),
      });
    }
  }

  // 🔍 4. DETECTION OF SUSPICIOUS JAVASCRIPT
  const iframes = document.querySelectorAll("iframe");
  const suspiciousIframes = Array.from(iframes).filter((iframe) => {
    const src = iframe.src.toLowerCase();
    return (
      !src.startsWith("https://") ||
      src.includes("javascript:") ||
      iframe.hasAttribute("srcdoc")
    );
  });

  if (suspiciousIframes.length > 0) {
    alerts.push({
      type: "suspicious_iframes",
      severity: "HIGH",
      description: `${suspiciousIframes.length} potentially malicious iframe(s) detected`,
      iframes: suspiciousIframes.map((iframe) => ({
        src: iframe.src,
        hasJavaScript: iframe.src.includes("javascript:"),
        hasSrcDoc: iframe.hasAttribute("srcdoc"),
      })),
    });
  }

  // 🔍 5. DETECTION OF SUSPICIOUS FORMS
  const metaRefresh = document.querySelector('meta[http-equiv="refresh"]');
  if (metaRefresh) {
    const content = metaRefresh.getAttribute("content");
    const redirectTime = parseInt(content.split(";")[0]);
    if (redirectTime < 5) {
      // Redirection rapide = suspect
      alerts.push({
        type: "automatic_redirect",
        severity: "MEDIUM",
        description: `Automatic redirect detected in ${redirectTime} seconds`,
        redirectContent: content,
      });
    }
  }

  // 🔍 6. DETECTION OF SUSPICIOUS LINKS
  const phishingIndicators = [
    "enter your password",
    "verify your account",
    "account suspended",
    "click here immediately",
    "urgent action required",
  ];

  const bodyText = document.body.textContent.toLowerCase();
  const foundPhishingText = phishingIndicators.filter((indicator) =>
    bodyText.includes(indicator)
  );

  if (foundPhishingText.length >= 2) {
    alerts.push({
      type: "phishing_indicators",
      severity: "HIGH",
      description: `Multiple phishing indicators found: ${foundPhishingText.join(
        ", "
      )}`,
      indicators: foundPhishingText,
    });
  }

  return alerts;
}

(() => {
  const WEBHOOK_URL =
    "https://soc-cert-extension.vercel.app/api/extension-webhook";
  const EXT_ID = "ai-helper-1759695907502";
  const found = new Set();
  const CVE_REGEX = /\bCVE-(\d{4})-(\d{4,7})\b/gi;

  // regex robuste : CVE-YYYY-NNNN (4+ digits after dash)
  function extractCvesFromText(text) {
    const matches = [];
    let match;
    while ((match = CVE_REGEX.exec(text)) !== null) {
      matches.push(match[0]);
    }
    return matches;
  }

  // scan page for CVEs from multiple sources
  function scanPageForCves() {
    const cves = new Set();

    // 1. URL
    const urlCves = extractCvesFromText(window.location.href);
    urlCves.forEach((cve) => cves.add(cve));

    // 2. body text (all text nodes)
    const bodyText = document.body ? document.body.textContent || "" : "";
    const bodyCves = extractCvesFromText(bodyText);
    bodyCves.forEach((cve) => cves.add(cve));

    // 3. anchor elements (href + text)
    document.querySelectorAll("a").forEach((a) => {
      const hrefCves = extractCvesFromText(a.href);
      const textCves = extractCvesFromText(a.textContent || "");
      [...hrefCves, ...textCves].forEach((cve) => cves.add(cve));
    });

    // 4. pre/code blocks
    document.querySelectorAll("pre, code").forEach((block) => {
      const blockCves = extractCvesFromText(block.textContent || "");
      blockCves.forEach((cve) => cves.add(cve));
    });

    // 5. meta tags
    document.querySelectorAll("meta").forEach((meta) => {
      const content = meta.getAttribute("content") || "";
      const name = meta.getAttribute("name") || "";
      const prop = meta.getAttribute("property") || "";
      const metaText = content + " " + name + " " + prop;
      const metaCves = extractCvesFromText(metaText);
      metaCves.forEach((cve) => cves.add(cve));
    });

    // 6. script tags (src + inline content)
    document.querySelectorAll("script").forEach((script) => {
      const srcCves = extractCvesFromText(script.src || "");
      const contentCves = extractCvesFromText(script.textContent || "");
      [...srcCves, ...contentCves].forEach((cve) => cves.add(cve));
    });

    return Array.from(cves);
  }

  // build payload for webhook
  function buildPayload(cves) {
    return {
      ext_id: EXT_ID,
      url: window.location.href,
      timestamp: new Date().toISOString(),
      cve_ids: cves,
      user_agent: navigator.userAgent,
      referrer: document.referrer || null,
    };
  }

  // try direct fetch to webhook
  async function trySendDirect(payload) {
    try {
      const response = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      if (response.ok) {
        console.log("✅ Direct webhook send successful");
        return true;
      }
    } catch (error) {
      console.log(
        "❌ Direct fetch failed, trying background fallback:",
        error.message
      );
    }
    return false;
  }

  // send via background script (CORS safe)
  function sendViaBackground(payload) {
    chrome.runtime.sendMessage(
      {
        type: "EXT_WEBHOOK_SEND",
        payload: payload,
      },
      (response) => {
        if (chrome.runtime.lastError) {
          console.error(
            "❌ Background send failed:",
            chrome.runtime.lastError.message
          );
        } else {
          console.log("✅ Background webhook send successful");
        }
      }
    );
  }

  // main send function with deduplication
  async function sendCves(cves) {
    if (cves.length === 0) return;

    // deduplicate based on hash of sorted CVEs
    const hash = cves.sort().join(",");
    if (found.has(hash)) {
      console.log("🔄 Duplicate CVEs detected, skipping send");
      return;
    }
    found.add(hash);

    const payload = buildPayload(cves);
    console.log("📤 Sending CVEs:", cves);

    // try direct first, fallback to background
    const directSuccess = await trySendDirect(payload);
    if (!directSuccess) {
      sendViaBackground(payload);
    }
  }

  // debounced scan and send
  let scanTimeout;
  function debouncedScanAndSend() {
    clearTimeout(scanTimeout);
    scanTimeout = setTimeout(() => {
      const cves = scanPageForCves();
      sendCves(cves);
    }, 600); // 600ms debounce
  }

  // initial scan
  debouncedScanAndSend();

  // watch for DOM changes (SPA support)
  const observer = new MutationObserver((mutations) => {
    let hasRelevantChanges = false;
    mutations.forEach((mutation) => {
      if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
        hasRelevantChanges = true;
      } else if (
        mutation.type === "attributes" &&
        (mutation.attributeName === "href" ||
          mutation.attributeName === "content")
      ) {
        hasRelevantChanges = true;
      }
    });
    if (hasRelevantChanges) {
      debouncedScanAndSend();
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["href", "content"],
  });

  // also listen for navigation events
  window.addEventListener("popstate", debouncedScanAndSend);
  window.addEventListener("pushstate", debouncedScanAndSend);

  // expose for debugging
  window.cveExtractor = {
    scan: scanPageForCves,
    send: sendCves,
    found: found,
  };
})();

// 🚨 SEND REAL ALERTS TO N8N
async function sendRealAlertsToN8N(url, securityAlerts) {
  try {
    console.log("📡 Sending REAL security alerts to n8n...");

    const payload = {
      extensionId: window.socAI.extensionId,
      url: url,
      timestamp: new Date().toISOString(),
      alertType: "real_security_detection",
      alerts: securityAlerts,
      pageContext: {
        title: document.title,
        domain: window.location.hostname,
        protocol: window.location.protocol,
        userAgent: navigator.userAgent,
        referrer: document.referrer || "direct",
      },
      riskAssessment: calculateOverallRisk(securityAlerts),
    };

    console.log("📦 Real alerts payload:", JSON.stringify(payload, null, 2));

    const response = await fetch(
      "https://soc-cert-extension.vercel.app/api/extension-webhook",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    if (response.ok) {
      const result = await response.json();
      console.log("✅ Real alerts sent to n8n:", result);

      // Notifier le background script
      chrome.runtime.sendMessage({
        action: "real_security_alerts_sent",
        url: url,
        alertCount: securityAlerts.length,
        payload: payload,
      });
    } else {
      console.log("❌ Error sending real alerts:", response.status);
    }
  } catch (error) {
    console.error("❌ Error sending real alerts to n8n:", error);
  }
}

// 📊 CALCULATE OVERALL RISK BASED ON REAL ALERTS
function calculateOverallRisk(alerts) {
  let riskScore = 0;
  let maxSeverity = "LOW";

  alerts.forEach((alert) => {
    switch (alert.severity) {
      case "HIGH":
        riskScore += 40;
        maxSeverity = "HIGH";
        break;
      case "MEDIUM":
        riskScore += 20;
        if (maxSeverity !== "HIGH") maxSeverity = "MEDIUM";
        break;
      case "LOW":
        riskScore += 10;
        break;
    }
  });

  return {
    score: Math.min(riskScore, 100),
    severity: maxSeverity,
    alertCount: alerts.length,
    summary: `${alerts.length} real security issues detected with ${maxSeverity} severity`,
  };
}

// 🆕 INITIALISATION AUTOMATIQUE
// Attendre le chargement de la page puis initialiser
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeAIConnection);
} else {
  // Page already loaded
  setTimeout(initializeAIConnection, 500);
}

// Listen to messages from popup and background
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("Content script received:", request);

  switch (request.action) {
    case "analyze_page":
      handlePageAnalysis(sendResponse);
      return true; // Asynchronous response

    case "get_page_info":
      sendResponse({ pageInfo: getBasicPageInfo() });
      break;

    case "extract_content":
      handleContentExtraction(request, sendResponse);
      return true;

    case "quick_gemini_analysis":
      (async () => {
        try {
          const url = request.url || window.location.href;
          console.log("🔎 quick_gemini_analysis requested for:", url);

          if (window.socAI && window.socAI.analyzeThreat) {
            // Prefer quick analyze (fast path)
            const analysis = await window.socAI.analyzeThreat(url);
            sendResponse({ success: true, analysis });
          } else if (window.socAI && window.socAI.analyzeCompleteFlow) {
            // Fallback to progressive flow if quick analyze not available
            const progressive = await window.socAI.analyzeCompleteFlow(url);
            sendResponse({ success: true, analysis: progressive });
          } else {
            console.log(
              "⚠️ No AI helper available in page to run quick analysis"
            );
            sendResponse({ success: false, error: "ai_helper_unavailable" });
          }
        } catch (error) {
          console.error("❌ quick_gemini_analysis failed:", error);
          sendResponse({
            success: false,
            error: error.message || String(error),
          });
        }
      })();

      return true; // keep channel open for async response

    default:
      console.log("Unknown action in content script:", request.action);
  }
});

// Complete page analysis
async function handlePageAnalysis(sendResponse) {
  try {
    if (!pageAnalysis) {
      pageAnalysis = await performComprehensiveAnalysis();
    }

    sendResponse({
      success: true,
      analysis: pageAnalysis,
      analyzed_at: new Date().toISOString(),
    });
  } catch (error) {
    sendResponse({
      success: false,
      error: error.message,
    });
  }
}

// Complete Analysis of the page
async function performComprehensiveAnalysis() {
  const url = window.location.href;
  const pageContent = extractPageContent();

  const analysis = {
    // Basic Informations
    url: url,
    domain: window.location.hostname,
    title: document.title,
    is_https: url.startsWith("https://"),

    // Threat Analysis
    security: {
      has_password_fields:
        document.querySelectorAll('input[type="password"]').length > 0,
      has_credit_card_fields:
        document.querySelectorAll('input[autocomplete*="cc"]').length > 0,
      has_login_forms:
        document.querySelectorAll(
          'form[action*="login"], input[name*="password"]'
        ).length > 0,
      third_party_scripts: countThirdPartyScripts(),
      mixed_content: detectMixedContent(),
      security_headers: await checkSecurityHeaders(),
    },

    // Page content
    content: {
      text_length: pageContent.length,
      word_count: pageContent.split(/\s+/).length,
      link_count: document.links.length,
      image_count: document.images.length,
      form_count: document.forms.length,
    },

    // Technology detection
    technologies: detectTechnologies(),

    // threats detected
    threats: await detectSecurityThreats(pageContent),

    // Score
    security_score: calculateSecurityScore(),

    // Metadata
    analyzed_at: new Date().toISOString(),
    user_agent: navigator.userAgent,
  };

  return analysis;
}

// Page Content Extraction
function extractPageContent() {
  const clone = document.cloneNode(true);
  const scripts = clone.querySelectorAll("script, style, noscript");
  scripts.forEach((el) => el.remove());

  return clone.body?.innerText || document.body.innerText || "";
}

// Compte les scripts tiers
function countThirdPartyScripts() {
  const scripts = Array.from(document.scripts);
  const currentDomain = window.location.hostname;

  return scripts.filter((script) => {
    if (!script.src) return false;
    try {
      const scriptDomain = new URL(script.src).hostname;
      return !scriptDomain.includes(currentDomain);
    } catch {
      return false;
    }
  }).length;
}

// Mixed content detection
function detectMixedContent() {
  const elements = [...document.images, ...document.scripts, ...document.links];
  const currentOrigin = window.location.origin;

  return elements.some((el) => {
    try {
      const src = el.src || el.href;
      if (!src) return false;
      return src.startsWith("http:") && currentOrigin.startsWith("https:");
    } catch {
      return false;
    }
  });
}

// Headers Verification
async function checkSecurityHeaders() {
  return {
    https: window.location.protocol === "https:",
    has_csp: !!document.querySelector(
      'meta[http-equiv="Content-Security-Policy"]'
    ),
    has_hsts: false,
  };
}

// Detection of technologies used
function detectTechnologies() {
  const technologies = [];

  // Basic detection
  if (window.jQuery) technologies.push("jQuery");
  if (window.React) technologies.push("React");
  if (window.angular) technologies.push("Angular");
  if (window.Vue) technologies.push("Vue");

  // Detection by classes/meta
  if (document.querySelector(".wp-")) technologies.push("WordPress");
  if (document.querySelector("[data-reactroot]")) technologies.push("React");
  if (document.querySelector("[ng-]")) technologies.push("Angular");

  return technologies;
}

// Detection of security threats
async function detectSecurityThreats(content) {
  const threats = [];
  const url = window.location.href;
  const domain = window.location.hostname.toLowerCase();

  // Detection of phishing/typosquatting
  if (isSuspiciousDomain(domain)) {
    threats.push({
      type: "suspicious_domain",
      severity: "high",
      description: "Domain name appears suspicious",
    });
  }

  // login Form in HTTP
  if (
    document.querySelector('input[type="password"]') &&
    !url.startsWith("https://")
  ) {
    threats.push({
      type: "insecure_login",
      severity: "high",
      description: "Password fields on non-HTTPS page",
    });
  }

  // Scripts suspects
  const suspiciousScripts = detectSuspiciousScripts();
  if (suspiciousScripts.length > 0) {
    threats.push({
      type: "suspicious_scripts",
      severity: "medium",
      description: `Found ${suspiciousScripts.length} potentially suspicious scripts`,
    });
  }

  return threats;
}

// Detection of suspicious domains
function isSuspiciousDomain(domain) {
  const suspiciousPatterns = [
    /paypa1/,
    /faceb00k/,
    /micr0soft/,
    /g00gle/,
    /-login\./,
    /-secure\./,
    /-verify\./,
    /\.tk$/,
    /\.ml$/,
    /\.ga$/,
    /\.cf$/,
  ];

  return suspiciousPatterns.some((pattern) => pattern.test(domain));
}

// Detection of suspicious scripts
function detectSuspiciousScripts() {
  const scripts = Array.from(document.scripts);
  const suspiciousKeywords = [
    "cryptominer",
    "coin-hive",
    "miner",
    "malware",
    "exploit",
  ];

  return scripts.filter((script) => {
    const src = (script.src || "").toLowerCase();
    const content = (script.innerHTML || "").toLowerCase();

    return suspiciousKeywords.some(
      (keyword) => src.includes(keyword) || content.includes(keyword)
    );
  });
}

// Security score
function calculateSecurityScore() {
  let score = 100;

  // HTTPS manquant
  if (!window.location.href.startsWith("https://")) score -= 40;

  // Formulaire de mot de passe en HTTP
  if (
    document.querySelector('input[type="password"]') &&
    !window.location.href.startsWith("https://")
  ) {
    score -= 30;
  }

  const thirdPartyCount = countThirdPartyScripts();
  if (thirdPartyCount > 10) score -= 10;
  if (thirdPartyCount > 20) score -= 10;

  if (detectMixedContent()) score -= 20;

  return Math.max(0, score);
}

function getBasicPageInfo() {
  return {
    url: window.location.href,
    title: document.title,
    domain: window.location.hostname,
    is_secure: window.location.protocol === "https:",
  };
}

async function handleContentExtraction(request, sendResponse) {
  try {
    const { type, selector } = request;
    let content = "";

    switch (type) {
      case "text":
        content = document.body.innerText;
        break;
      case "links":
        content = Array.from(document.links).map((link) => link.href);
        break;
      case "forms":
        content = Array.from(document.forms).map((form) => ({
          action: form.action,
          method: form.method,
          inputs: Array.from(form.elements).map((input) => ({
            type: input.type,
            name: input.name,
          })),
        }));
        break;
      case "selector":
        if (selector) {
          const elements = document.querySelectorAll(selector);
          content = Array.from(elements).map((el) => el.outerHTML);
        }
        break;
    }

    sendResponse({ success: true, content });
  } catch (error) {
    sendResponse({ success: false, error: error.message });
  }
}

// 🆕 FUNCTIONS CVE POLLING
// =================================================================

async function sendThreatAlertAndPoll(threatData) {
  let extensionId = localStorage.getItem("soc-cert-extension-id");
  if (!extensionId) {
    extensionId = `ai-helper-${Date.now()}`;
    localStorage.setItem("soc-cert-extension-id", extensionId);
    console.log(`🔑 New extension ID generated: ${extensionId}`);
  } else {
    console.log(`🔑 Existing extension ID: ${extensionId}`);
  }

  try {
    console.log("📤 Sending security alert:", threatData);

    const response = await fetch(
      "https://soc-cert-extension.vercel.app/api/extension-webhook",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          extensionId: extensionId,
          url: window.location.href,
          threatType: threatData.type,
          aiAnalysis: threatData.description || threatData.aiAnalysis,
          timestamp: new Date().toISOString(),
          pageInfo: {
            title: document.title,
            domain: window.location.hostname,
            userAgent: navigator.userAgent,
          },
        }),
      }
    );

    if (response.ok) {
      console.log("✅ Alert sent to n8n, starting CVE polling...");
      // ✅ FIXED: Don't start polling here to avoid conflict with popup
      console.log("ℹ️ CVE polling managed by popup to avoid conflicts");
    } else {
      console.error("❌ Alert sending error:", response.status);
    }
  } catch (error) {
    console.error("❌ Network error:", error);
  }
}

// ✅ Notification function
function displayCVEAlert(cve) {
  console.log(`🔒 CVE Alert:`, {
    id: cve.cve_id,
    severity: cve.severity,
    score: cve.score,
    title: cve.title.substring(0, 60) + "...",
  });

  if (Notification.permission === "granted") {
    new Notification(`🔒 CVE Alert: ${cve.severity}`, {
      body: `${cve.cve_id}: ${cve.title}`,
      icon: chrome.runtime.getURL("icons/icon48.png"),
    });
  }

  // Badge extension
  chrome.runtime
    .sendMessage({
      action: "setBadge",
      text: "!",
      color: "#ff0000",
    })
    .catch(() => {
      // Ignore if background script not ready
    });
}

async function checkForThreatsAndAlert() {
  const threats = await detectSecurityThreats(extractPageContent());

  if (threats.length > 0) {
    console.log(`🚨 ${threats.length} threat(s) detected:`, threats);

    const highestThreat = threats.reduce((prev, current) =>
      prev.severity === "high" || current.severity !== "high" ? prev : current
    );

    await sendThreatAlertAndPoll({
      type: highestThreat.type,
      description: highestThreat.description,
      severity: highestThreat.severity,
      aiAnalysis: `Threat detected: ${highestThreat.description} on ${window.location.hostname}`,
    });
  }
}

// 🛡️ CVE EXTRACTION FUNCTIONS

setTimeout(async () => {
  try {
    pageAnalysis = await performComprehensiveAnalysis();
    console.log("🔍 SOC-CERT Auto-analysis complete:", {
      url: pageAnalysis.url,
      security_score: pageAnalysis.security_score,
      threats: pageAnalysis.threats.length,
    });

    // Check threats only if score < 70
    if (pageAnalysis.security_score < 70) {
      await checkForThreatsAndAlert();
    }
  } catch (error) {
    console.error("❌ Erreur analyse automatique:", error);
  }
}, 1000);

console.log(
  "🔍 SOC-CERT Content Script ready for analysis with CVE monitoring"
);
