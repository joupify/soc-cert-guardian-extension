// content_script.js - CVE Extraction Script// content_script.js

(() => {// 🛡️ CVE EXTRACTION FUNCTIONS

  const WEBHOOK_URL = 'https://soc-cert-extension.vercel.app/api/extension-webhook';

  const EXT_ID = 'ai-helper-1759695907502';// Robust CVE extractor + sender for exploit-db pages (and generic pages).

  const CVE_REGEX = /\bCVE-(\d{4})-(\d{4,7})\b/ig;

  const found = new Set();// - scans links, text nodes, pre/code blocks and common attributes

// - uses MutationObserver to catch SPA / dynamic content

  function extractCvesFromText(text) {// - attempts direct fetch to webhook, falls back to chrome.runtime messaging for background fetch (CORS safe)

    const matches = [];

    let match;(() => {

    while ((match = CVE_REGEX.exec(text)) !== null) {  const WEBHOOK_URL = 'https://soc-cert-extension.vercel.app/api/extension-webhook';

      matches.push(match[0]);  const EXT_ID = 'ai-helper-1759695907502';

    }  const found = new Set();

    return matches;  const CVE_REGEX = /\bCVE-(\d{4})-(\d{4,7})\b/ig;

  }

  // regex robuste : CVE-YYYY-NNNN (4+ digits after dash)

  function scanPageForCves() {  function extractCvesFromText(text) {

    const cves = new Set();    const matches = [];

    // URL    let match;

    const urlCves = extractCvesFromText(window.location.href);    while ((match = CVE_REGEX.exec(text)) !== null) {

    urlCves.forEach(cve => cves.add(cve));      matches.push(match[0]);

    // Body text    }

    const bodyText = document.body?.textContent || '';    return matches;

    const bodyCves = extractCvesFromText(bodyText);  }

    bodyCves.forEach(cve => cves.add(cve));

    // Links  // scan page for CVEs from multiple sources

    document.querySelectorAll('a').forEach(a => {  function scanPageForCves() {

      const hrefCves = extractCvesFromText(a.href);    const cves = new Set();

      const textCves = extractCvesFromText(a.textContent || '');

      [...hrefCves, ...textCves].forEach(cve => cves.add(cve));    // 1. URL

    });    const urlCves = extractCvesFromText(window.location.href);

    return Array.from(cves);    urlCves.forEach(cve => cves.add(cve));

  }

    // 2. body text (all text nodes)

  function buildPayload(cves) {    const bodyText = document.body ? document.body.textContent || '' : '';

    return {    const bodyCves = extractCvesFromText(bodyText);

      ext_id: EXT_ID,    bodyCves.forEach(cve => cves.add(cve));

      url: window.location.href,

      timestamp: new Date().toISOString(),    // 3. anchor elements (href + text)

      cve_ids: cves,    document.querySelectorAll('a').forEach(a => {

      user_agent: navigator.userAgent,      const hrefCves = extractCvesFromText(a.href);

      referrer: document.referrer || null      const textCves = extractCvesFromText(a.textContent || '');

    };      [...hrefCves, ...textCves].forEach(cve => cves.add(cve));

  }    });



  async function trySendDirect(payload) {    // 4. pre/code blocks

    try {    document.querySelectorAll('pre, code').forEach(block => {

      const response = await fetch(WEBHOOK_URL, {      const blockCves = extractCvesFromText(block.textContent || '');

        method: 'POST',      blockCves.forEach(cve => cves.add(cve));

        headers: { 'Content-Type': 'application/json' },    });

        body: JSON.stringify(payload)

      });    // 5. meta tags

      if (response.ok) {    document.querySelectorAll('meta').forEach(meta => {

        console.log('✅ Direct webhook send successful');      const content = meta.getAttribute('content') || '';

        return true;      const name = meta.getAttribute('name') || '';

      }      const prop = meta.getAttribute('property') || '';

    } catch (error) {      const metaText = content + ' ' + name + ' ' + prop;

      console.log('❌ Direct fetch failed:', error.message);      const metaCves = extractCvesFromText(metaText);

    }      metaCves.forEach(cve => cves.add(cve));

    return false;    });

  }

    // 6. script tags (src + inline content)

  function sendViaBackground(payload) {    document.querySelectorAll('script').forEach(script => {

    chrome.runtime.sendMessage({      const srcCves = extractCvesFromText(script.src || '');

      type: 'EXT_WEBHOOK_SEND',      const contentCves = extractCvesFromText(script.textContent || '');

      payload: payload      [...srcCves, ...contentCves].forEach(cve => cves.add(cve));

    }, (response) => {    });

      if (chrome.runtime.lastError) {

        console.error('❌ Background send failed:', chrome.runtime.lastError.message);    return Array.from(cves);

      } else {  }

        console.log('✅ Background webhook send successful');

      }  // build payload for webhook

    });  function buildPayload(cves) {

  }    return {

      ext_id: EXT_ID,

  async function sendCves(cves) {      url: window.location.href,

    if (cves.length === 0) return;      timestamp: new Date().toISOString(),

    const hash = cves.sort().join(',');      cve_ids: cves,

    if (found.has(hash)) {      user_agent: navigator.userAgent,

      console.log('🔄 Duplicate CVEs detected, skipping send');      referrer: document.referrer || null

      return;    };

    }  }

    found.add(hash);

    const payload = buildPayload(cves);  // try direct fetch to webhook

    console.log('📤 Sending CVEs:', cves);  async function trySendDirect(payload) {

    const directSuccess = await trySendDirect(payload);    try {

    if (!directSuccess) {      const response = await fetch(WEBHOOK_URL, {

      sendViaBackground(payload);        method: 'POST',

    }        headers: {

  }          'Content-Type': 'application/json',

        },

  // Initial scan        body: JSON.stringify(payload)

  const cves = scanPageForCves();      });

  sendCves(cves);      if (response.ok) {

        console.log('✅ Direct webhook send successful');

  // Expose for debugging        return true;

  window.cveExtractor = {      }

    scan: scanPageForCves,    } catch (error) {

    send: sendCves,      console.log('❌ Direct fetch failed, trying background fallback:', error.message);

    found: found    }

  };    return false;

})();  }

  // send via background script (CORS safe)
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

  // main send function with deduplication
  async function sendCves(cves) {
    if (cves.length === 0) return;

    // deduplicate based on hash of sorted CVEs
    const hash = cves.sort().join(',');
    if (found.has(hash)) {
      console.log('🔄 Duplicate CVEs detected, skipping send');
      return;
    }
    found.add(hash);

    const payload = buildPayload(cves);
    console.log('📤 Sending CVEs:', cves);

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
    mutations.forEach(mutation => {
      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        hasRelevantChanges = true;
      } else if (mutation.type === 'attributes' && (mutation.attributeName === 'href' || mutation.attributeName === 'content')) {
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
    attributeFilter: ['href', 'content']
  });

  // also listen for navigation events
  window.addEventListener('popstate', debouncedScanAndSend);
  window.addEventListener('pushstate', debouncedScanAndSend);

  // expose for debugging
  window.cveExtractor = {
    scan: scanPageForCves,
    send: sendCves,
    found: found
  };

})();