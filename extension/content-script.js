// content_script.js
// 🛡️ CVE EXTRACTION FUNCTIONS

// Robust CVE extractor + sender for exploit-db pages (and generic pages).

// - scans links, text nodes, pre/code blocks and common attributes
// - uses MutationObserver to catch SPA / dynamic content
// - attempts direct fetch to webhook, falls back to chrome.runtime messaging for background fetch (CORS safe)

(() => {
  const WEBHOOK_URL = 'https://soc-cert-extension.vercel.app/api/extension-webhook';
  const EXT_ID = 'ai-helper-1759695907502';
  const found = new Set();
  const CVE_REGEX = /\bCVE-(\d{4})-(\d{4,7})\b/ig;

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
    urlCves.forEach(cve => cves.add(cve));

    // 2. body text (all text nodes)
    const bodyText = document.body ? document.body.textContent || '' : '';
    const bodyCves = extractCvesFromText(bodyText);
    bodyCves.forEach(cve => cves.add(cve));

    // 3. anchor elements (href + text)
    document.querySelectorAll('a').forEach(a => {
      const hrefCves = extractCvesFromText(a.href);
      const textCves = extractCvesFromText(a.textContent || '');
      [...hrefCves, ...textCves].forEach(cve => cves.add(cve));
    });

    // 4. pre/code blocks
    document.querySelectorAll('pre, code').forEach(block => {
      const blockCves = extractCvesFromText(block.textContent || '');
      blockCves.forEach(cve => cves.add(cve));
    });

    // 5. meta tags
    document.querySelectorAll('meta').forEach(meta => {
      const content = meta.getAttribute('content') || '';
      const name = meta.getAttribute('name') || '';
      const prop = meta.getAttribute('property') || '';
      const metaText = content + ' ' + name + ' ' + prop;
      const metaCves = extractCvesFromText(metaText);
      metaCves.forEach(cve => cves.add(cve));
    });

    // 6. script tags (src + inline content)
    document.querySelectorAll('script').forEach(script => {
      const srcCves = extractCvesFromText(script.src || '');
      const contentCves = extractCvesFromText(script.textContent || '');
      [...srcCves, ...contentCves].forEach(cve => cves.add(cve));
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
      referrer: document.referrer || null
    };
  }

  // try direct fetch to webhook
  async function trySendDirect(payload) {
    try {
      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });
      if (response.ok) {
        console.log('✅ Direct webhook send successful');
        return true;
      }
    } catch (error) {
      console.log('❌ Direct fetch failed, trying background fallback:', error.message);
    }
    return false;
  }

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
