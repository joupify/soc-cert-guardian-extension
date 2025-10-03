// content-script.js - Analyse les pages web pour SOC-CERT
console.log("🔍 SOC-CERT Content Script loaded on:", window.location.href);

// État de l'analyse
let pageAnalysis = null;

// Écoute les messages du popup et background
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("Content script received:", request);

  switch (request.action) {
    case "analyze_page":
      handlePageAnalysis(sendResponse);
      return true; // Réponse asynchrone

    case "get_page_info":
      sendResponse({ pageInfo: getBasicPageInfo() });
      break;

    case "extract_content":
      handleContentExtraction(request, sendResponse);
      return true;

    default:
      console.log("Unknown action in content script:", request.action);
  }
});

// Analyse complète de la page
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

// Analyse complète de la page
async function performComprehensiveAnalysis() {
  const url = window.location.href;
  const pageContent = extractPageContent();

  const analysis = {
    // Informations de base
    url: url,
    domain: window.location.hostname,
    title: document.title,
    is_https: url.startsWith("https://"),

    // Analyse de sécurité
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

    // Contenu de la page
    content: {
      text_length: pageContent.length,
      word_count: pageContent.split(/\s+/).length,
      link_count: document.links.length,
      image_count: document.images.length,
      form_count: document.forms.length,
    },

    // Détection de technologies
    technologies: detectTechnologies(),

    // Menaces détectées
    threats: await detectSecurityThreats(pageContent),

    // Score de sécurité
    security_score: calculateSecurityScore(),

    // Métadonnées
    analyzed_at: new Date().toISOString(),
    user_agent: navigator.userAgent,
  };

  return analysis;
}

// Extraction du contenu de la page
function extractPageContent() {
  // Supprime les scripts et styles pour le contenu textuel
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

// Détection de contenu mixte
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

// Vérification des en-têtes de sécurité (basique)
async function checkSecurityHeaders() {
  return {
    https: window.location.protocol === "https:",
    has_csp: !!document.querySelector(
      'meta[http-equiv="Content-Security-Policy"]'
    ),
    has_hsts: false,
  };
}

// Détection des technologies utilisées
function detectTechnologies() {
  const technologies = [];

  // Détection basique
  if (window.jQuery) technologies.push("jQuery");
  if (window.React) technologies.push("React");
  if (window.angular) technologies.push("Angular");
  if (window.Vue) technologies.push("Vue");

  // Détection par classes/meta
  if (document.querySelector(".wp-")) technologies.push("WordPress");
  if (document.querySelector("[data-reactroot]")) technologies.push("React");
  if (document.querySelector("[ng-]")) technologies.push("Angular");

  return technologies;
}

// Détection des menaces de sécurité
async function detectSecurityThreats(content) {
  const threats = [];
  const url = window.location.href;
  const domain = window.location.hostname.toLowerCase();

  // Détection de phishing/tysquatting
  if (isSuspiciousDomain(domain)) {
    threats.push({
      type: "suspicious_domain",
      severity: "high",
      description: "Domain name appears suspicious",
    });
  }

  // Formulaire de login en HTTP
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

// Détection de domaines suspects
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

// Détection de scripts suspects
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

// Calcul du score de sécurité
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

  // Nombre élevé de scripts tiers
  const thirdPartyCount = countThirdPartyScripts();
  if (thirdPartyCount > 10) score -= 10;
  if (thirdPartyCount > 20) score -= 10;

  // Contenu mixte
  if (detectMixedContent()) score -= 20;

  return Math.max(0, score);
}

// Informations basiques de la page
function getBasicPageInfo() {
  return {
    url: window.location.href,
    title: document.title,
    domain: window.location.hostname,
    is_secure: window.location.protocol === "https:",
  };
}

// Extraction de contenu spécifique
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

// 🆕 FONCTIONS CVE POLLING - VERSION CORRIGÉE
// =================================================================

// ✅ CORRIGÉ : Utilise extensionId fixe "mapped" au lieu de dynamique
async function sendThreatAlertAndPoll(threatData) {
  const extensionId = "mapped"; // ← FIXÉ : même ID que n8n utilise

  try {
    console.log("📤 Envoi alerte de sécurité:", threatData);

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
      console.log("✅ Alerte envoyée vers n8n, démarrage polling CVE...");
      // ✅ CORRIGÉ : Ne pas démarrer polling ici pour éviter conflit avec popup
      console.log("ℹ️ Polling CVE géré par le popup pour éviter les conflits");
    } else {
      console.error("❌ Erreur envoi alerte:", response.status);
    }
  } catch (error) {
    console.error("❌ Erreur réseau:", error);
  }
}

// ✅ CORRIGÉ : Fonction simplifiée pour afficher notification seulement
function displayCVEAlert(cve) {
  console.log(`🔒 CVE Alert:`, {
    id: cve.cve_id,
    severity: cve.severity,
    score: cve.score,
    title: cve.title.substring(0, 60) + "...",
  });

  // Notification navigateur seulement
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
      // Ignore si background script pas prêt
    });
}

// ✅ CORRIGÉ : Détection simplifiée sans auto-polling
async function checkForThreatsAndAlert() {
  const threats = await detectSecurityThreats(extractPageContent());

  if (threats.length > 0) {
    console.log(`🚨 ${threats.length} menace(s) détectée(s):`, threats);

    // Envoyer seulement, pas de polling
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

// ✅ CORRIGÉ : Analyse automatique simplifiée
setTimeout(async () => {
  try {
    pageAnalysis = await performComprehensiveAnalysis();
    console.log("🔍 SOC-CERT Auto-analysis complete:", {
      url: pageAnalysis.url,
      security_score: pageAnalysis.security_score,
      threats: pageAnalysis.threats.length,
    });

    // Vérifier menaces seulement si score < 70
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
