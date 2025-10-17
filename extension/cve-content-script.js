// 🛡️ SOC-CERT EXTENSION - CONTENT SCRIPT
// Comprehensive CVE extraction from multiple DOM sources with webhook delivery

// 🛡️ CVE EXTRACTION FUNCTIONS

/**
 * Extracts CVE IDs from text using robust regex pattern
 * @param {string} text - Text to scan for CVEs
 * @returns {string[]} Array of unique CVE IDs found
 */
function extractCvesFromText(text) {
  if (!text || typeof text !== 'string') return [];

  const cveRegex = /\bCVE-(\d{4})-(\d{4,7})\b/ig;
  const matches = text.match(cveRegex) || [];

  // Normalize to uppercase and remove duplicates
  return [...new Set(matches.map(cve => cve.toUpperCase()))];
}

/**
 * Scans the entire page for CVEs from multiple sources
 * @returns {string[]} Array of unique CVE IDs found across all sources
 */
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

// 🛡️ WEBHOOK DELIVERY FUNCTIONS

/**
 * Builds the payload for webhook delivery
 * @param {string[]} cves - Array of CVE IDs
 * @returns {object} Payload object for webhook
 */
function buildPayload(cves) {
  return {
    ext_id: 'soc-cert-extension',
    url: window.location.href,
    timestamp: new Date().toISOString(),
    cve_ids: cves,
    user_agent: navigator.userAgent,
    referrer: document.referrer || null
  };
}

/**
 * Attempts to send CVEs directly via fetch (may fail due to CORS)
 * @param {object} payload - Payload to send
 * @returns {boolean} Success status
 */
async function trySendDirect(payload) {
  try {
    const response = await fetch('https://soc-cert-extension.vercel.app/api/extension-webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      console.log('✅ CVEs sent directly via webhook');
      return true;
    } else {
      console.warn('⚠️ Direct webhook failed with status:', response.status);
      return false;
    }
  } catch (error) {
    console.warn('⚠️ Direct webhook failed (likely CORS):', error.message);
    return false;
  }
}

/**
 * Sends CVEs via background script (CORS-safe fallback)
 * @param {object} payload - Payload to send
 */
function sendViaBackground(payload) {
  try {
    chrome.runtime.sendMessage({
      type: 'EXT_WEBHOOK_SEND',
      payload: payload
    }, (response) => {
      if (chrome.runtime.lastError) {
        console.error('❌ Background message failed:', chrome.runtime.lastError);
      } else if (response && response.success) {
        console.log('✅ CVEs sent via background script');
      } else {
        console.warn('⚠️ Background script failed to send CVEs');
      }
    });
  } catch (error) {
    console.error('❌ Error sending via background:', error);
  }
}

/**
 * Main function to scan for CVEs and send them
 */
async function sendCves() {
  const cves = scanPageForCves();

  if (cves.length === 0) {
    console.log('ℹ️ No CVEs found on this page');
    return;
  }

  const payload = buildPayload(cves);

  // Try direct send first, fallback to background if it fails
  const directSuccess = await trySendDirect(payload);
  if (!directSuccess) {
    sendViaBackground(payload);
  }
}

// 🛡️ DYNAMIC CONTENT MONITORING

// Debounced version of scan and send to prevent spam
let scanTimeout;
function debouncedScanAndSend() {
  clearTimeout(scanTimeout);
  scanTimeout = setTimeout(() => {
    console.log('🔄 Scanning for CVEs due to page changes...');
    sendCves();
  }, 600); // 600ms debounce
}

// Monitor for dynamic content changes (SPAs, AJAX updates)
function setupMutationObserver() {
  const observer = new MutationObserver((mutations) => {
    let hasSignificantChange = false;

    mutations.forEach(mutation => {
      // Check for added/removed nodes that might contain CVEs
      if (mutation.type === 'childList' &&
          (mutation.addedNodes.length > 0 || mutation.removedNodes.length > 0)) {
        hasSignificantChange = true;
      }
      // Check for attribute changes that might affect content
      else if (mutation.type === 'attributes' &&
               (mutation.attributeName === 'href' || mutation.attributeName === 'src')) {
        hasSignificantChange = true;
      }
    });

    if (hasSignificantChange) {
      debouncedScanAndSend();
    }
  });

  // Start observing
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['href', 'src']
  });

  console.log('👀 MutationObserver set up for dynamic content monitoring');
}

// 🛡️ INITIALIZATION

// Run initial scan when page loads
console.log('🚀 SOC-CERT Content Script initializing...');

// Wait for DOM to be ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    sendCves();
    setupMutationObserver();
  });
} else {
  // DOM already loaded
  sendCves();
  setupMutationObserver();
}

// Also listen for page navigation (for SPAs)
window.addEventListener('popstate', debouncedScanAndSend);
window.addEventListener('pushstate', debouncedScanAndSend);

// Override history methods to catch programmatic navigation
const originalPushState = history.pushState;
const originalReplaceState = history.replaceState;

history.pushState = function(...args) {
  originalPushState.apply(this, args);
  debouncedScanAndSend();
};

history.replaceState = function(...args) {
  originalReplaceState.apply(this, args);
  debouncedScanAndSend();
};

console.log('🔍 SOC-CERT Content Script ready for CVE monitoring');