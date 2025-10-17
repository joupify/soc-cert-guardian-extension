// content_script.js - CVE Extraction Script
(() => {
  const WEBHOOK_URL = 'https://soc-cert-extension.vercel.app/api/extension-webhook';
  const EXT_ID = 'ai-helper-1759695907502';
  const CVE_REGEX = /\bCVE-(\d{4})-(\d{4,7})\b/ig;
  const found = new Set();

  function extractCvesFromText(text) {
    const matches = [];
    let match;
    while ((match = CVE_REGEX.exec(text)) !== null) {
      matches.push(match[0]);
    }
    return matches;
  }

  function scanPageForCves() {
    const cves = new Set();
    // URL
    const urlCves = extractCvesFromText(window.location.href);
    urlCves.forEach(cve => cves.add(cve));
    // Body text
    const bodyText = document.body?.textContent || '';
    const bodyCves = extractCvesFromText(bodyText);
    bodyCves.forEach(cve => cves.add(cve));
    // Links
    document.querySelectorAll('a').forEach(a => {
      const hrefCves = extractCvesFromText(a.href);
      const textCves = extractCvesFromText(a.textContent || '');
      [...hrefCves, ...textCves].forEach(cve => cves.add(cve));
    });
    return Array.from(cves);
  }

  function buildPayload(cves) {
    return {
      ext_id: EXT_ID,
      url: window.location.href,
      timestamp: new Date().toISOString(),
      cve_ids: cves,
      user_agent: navigator.userAgent,
      referrer: document.referrer || null
    };
  }

  async function trySendDirect(payload) {
    try {
      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (response.ok) {
        console.log('✅ Direct webhook send successful');
        return true;
      }
    } catch (error) {
      console.log('❌ Direct fetch failed:', error.message);
    }
    return false;
  }

  function sendViaBackground(payload) {
    chrome.runtime.sendMessage({
      type: 'EXT_WEBHOOK_SEND',
      payload: payload
    }, (response) => {
      if (chrome.runtime.lastError) {
        console.error('❌ Background send failed:', chrome.runtime.lastError.message);
      } else {
        console.log('✅ Background webhook send successful');
      }
    });
  }

  async function sendCves(cves) {
    if (cves.length === 0) return;
    const hash = cves.sort().join(',');
    if (found.has(hash)) {
      console.log('🔄 Duplicate CVEs detected, skipping send');
      return;
    }
    found.add(hash);
    const payload = buildPayload(cves);
    console.log('📤 Sending CVEs:', cves);
    const directSuccess = await trySendDirect(payload);
    if (!directSuccess) {
      sendViaBackground(payload);
    }
  }

  // Initial scan
  const cves = scanPageForCves();
  sendCves(cves);

  // Expose for debugging
  window.cveExtractor = {
    scan: scanPageForCves,
    send: sendCves,
    found: found
  };
})();