// PREPARE CVE - Code FINAL avec SCORING INTELLIGENT + CVE VIRTUELS 2026
// Settings: Run Once for All Items = ON

console.log("=== 🔍 PREPARE CVE DEBUG COMPLET ===");

const items = $input.all();
const ext = items.filter(
  (i) => i.json?.extensionId || i.json?._is_extension_data
);
const pool = items.filter(
  (i) => !i.json?.extensionId && !i.json?._is_extension_data
);

console.log(
  `🔍 PREPARE CVE: ${ext.length} extensions, ${pool.length} autres, ${items.length} total`
);

// Debug des extensions détectées
console.log(`🔍 Extensions détectées:`);
ext.forEach((item, i) => {
  console.log(
    `  ${i}: extensionId=${item.json?.extensionId}, _is_extension_data=${item.json?._is_extension_data}`
  );
  console.log(`       url=${item.json?.url}, cve_id=${item.json?.cve_id}`);
});

// Construire une banque de CVE candidats depuis le lot (KEV/NIST/Text)
const cands = [];
const add = (x) => {
  if (x?.id && !cands.some((y) => y.id === x.id)) cands.push(x);
};

console.log(
  `📥 Analyse des ${items.length} items pour extraire les CVE candidats...`
);

for (const it of items) {
  const j = it.json || {};

  // KEV (tableau vulnerabilities)
  if (Array.isArray(j.vulnerabilities)) {
    console.log(`  KEV trouvé avec ${j.vulnerabilities.length} vulnérabilités`);
    for (const v of j.vulnerabilities || []) {
      if (v.cveID) {
        add({
          id: v.cveID,
          title: v.vulnerabilityName || `CVE ${v.cveID}`,
          src: "KEV",
          sev: v.severity || "High",
          score: v.baseScore || 70,
          pub: v.dateAdded,
          raw: v,
        });
      }
    }
  }

  // NIST (structure cve.id)
  if (j.cve?.id) {
    console.log(`  NIST CVE trouvé: ${j.cve.id}`);
    const m =
      j.cve.metrics?.cvssMetricV31?.[0] || j.cve.metrics?.cvssMetricV30?.[0];
    add({
      id: j.cve.id,
      title: j.cve.title?.[0]?.value || `CVE ${j.cve.id}`,
      src: "NVD",
      sev: m?.cvssData?.baseSeverity || "MEDIUM",
      score: Math.round((m?.cvssData?.baseScore || 5) * 10),
      pub: j.cve.published,
      raw: j,
    });
  }

  // Text extract
  const re = /CVE[-_]\d{4}[-_]\d+/gi;
  const s = JSON.stringify(j);
  const textMatches = s.match(re) || [];
  if (textMatches.length > 0) {
    console.log(`  Text extract: ${textMatches.length} CVE trouvés`);
    new Set(textMatches.map((x) => x.replace("_", "-").toUpperCase())).forEach(
      (id) =>
        add({
          id,
          title: `CVE ${id}`,
          src: "TextExtract",
          sev: "Medium",
          score: 50,
          pub: new Date().toISOString(),
          raw: j,
        })
    );
  }
}

console.log(`📋 CVE candidats collectés: ${cands.length}`);
console.log(`📋 Top 10 candidats:`);
cands.slice(0, 10).forEach((c, i) => {
  console.log(`  ${i + 1}. ${c.id} (${c.src}): ${c.title.substring(0, 50)}...`);
});

// 🎯 MOTS-CLÉS CYBER SPÉCIFIQUES
const cyberKeywords = [
  "bash",
  "shellshock",
  "apache",
  "nginx",
  "mysql",
  "postgresql",
  "windows",
  "linux",
  "kernel",
  "openssl",
  "java",
  "python",
  "jenkins",
  "cisco",
  "juniper",
  "fortinet",
  "sudo",
  "curl",
  "chrome",
  "firefox",
  "safari",
  "edge",
  "node",
  "docker",
  "kubernetes",
  "redis",
  "mongodb",
  "elasticsearch",
  "wordpress",
  "joomla",
  "drupal",
  "php",
  "ruby",
  "perl",
  "oracle",
  "samsung",
  "android",
  "ios",
  "microsoft",
  "adobe",
  "vmware",
  "citrix",
  "login",
  "authentication",
  "password",
  "credential",
  "auth",
  "session",
  "cookie",
  "token",
  "oauth",
  "sso",
  "mfa",
  "2fa",
  "phishing",
  "spoofing",
  "impersonation",
  "bruteforce",
  "single-sign-on",
  "multi-factor",
  "biometric",
  "federation",
  "saml",
  "openid",
  "ldap",
  "kerberos",
  "radius",
  "jwt",
];

// 🎯 TOKENS GÉNÉRIQUES À FILTRER
const genericTokens = [
  "security",
  "platform",
  "system",
  "admin",
  "interface",
  "dashboard",
  "exploit",
  "version",
  "custom",
  "proprietary",
  "framework",
  "bypass",
  "targeting",
  "unique",
  "vulnerability",
  "with",
  "vuln",
  "rabilit",
  "detecte",
  "expose",
  "protection",
  "adequate",
  "csrf",
  "2025",
  "2024",
  "application",
  "service",
  "server",
  "client",
  "network",
  "web",
  "injection",
  "command",
  "execution",
  "remote",
  "code",
];

// Fonctions utilitaires
function toks(u) {
  try {
    const h = new URL(u).hostname.replace(/^www\./, "");
    return h.split(".").slice(0, -1).filter(Boolean);
  } catch {
    return [];
  }
}

function low(x) {
  return (x || "").toString().toLowerCase();
}

// Corrélation extension ↔ CVE
const out = [];

console.log(`🎯 Début corrélation pour ${ext.length} extensions...`);

for (const e of ext) {
  const data = e.json;

  console.log(
    `\n🎯 === Traitement extension ${data.extensionId || "UNKNOWN"} ===`
  );

  // ✅ SAUVEGARDE ROBUSTE DE l'extensionId ORIGINAL
  const originalExtensionId =
    data.extensionId ||
    data.original_data?.extensionId ||
    e.json?.extensionId ||
    e.json?.original_data?.extensionId ||
    "mapped";
  console.log(`  📌 extensionId original: "${originalExtensionId}"`);

  // 🎯 SI DÉJÀ UN CVE ATTRIBUÉ, PASS-THROUGH
  if (data.cve_id || data.cveid) {
    console.log(
      `  ✅ CVE déjà attribué: ${data.cve_id || data.cveid} - Pass-through`
    );
    out.push({ json: { ...data, extensionId: originalExtensionId } });
    continue;
  }

  // Extraction des données
  const url = data.url || data.link || data.extensionData?.originalUrl || "";
  const analysis = low(data.aiAnalysis || data.extensionData?.aiAnalysis || "");
  const tech = (data.extensionData?.technologies || [])
    .map((t) => low(t.name))
    .filter(Boolean);

  console.log(`  URL extraite: "${url}"`);
  console.log(`  Analyse extraite: "${analysis.substring(0, 100)}..."`);
  console.log(`  Technologies: [${tech.join(", ")}]`);

  // Tokens
  const urlTokens = toks(url);
  const analysisTokens = analysis.match(/\b\w{4,}\b/g) || [];
  const allTokens = [
    ...new Set([...urlTokens, ...analysisTokens, ...tech]),
  ].filter((t) => t.length >= 4);
  const specificTokens = allTokens.filter(
    (t) =>
      cyberKeywords.includes(t.toLowerCase()) ||
      (!genericTokens.includes(t.toLowerCase()) &&
        !/^\d+$/.test(t) &&
        t.length >= 4)
  );

  console.log(
    `  Tokens bruts (${allTokens.length}): [${allTokens
      .slice(0, 8)
      .join(", ")}]${allTokens.length > 8 ? "..." : ""}`
  );
  console.log(
    `  Tokens spécifiques (${specificTokens.length}): [${specificTokens
      .slice(0, 8)
      .join(", ")}]${specificTokens.length > 8 ? "..." : ""}`
  );

  // 🎯 PRIORITÉ 1 : CVE mentionné
  const mentionedCVE = analysis.match(/cve[-_]?\d{4}[-_]?\d+/i);
  if (mentionedCVE) {
    const cveId = mentionedCVE[0].replace(/[-_]/g, "-").toUpperCase();
    const directMatch = cands.find((c) => c.id === cveId);
    if (directMatch) {
      const enrichedExtension = {
        ...data,
        extensionId: originalExtensionId,
        cve_id: directMatch.id,
        cveid: directMatch.id,
        mappedCVE: true,
        mappingConfidence: 10,
        mappingSource: directMatch.src,
        mappingTitle: directMatch.title,
        matchMethod: "direct_mention",
        specificTokens,
        isVirtual: false,
        _is_extension_data: true,
        original_data: {
          ...data.original_data,
          extensionId: originalExtensionId,
        },
      };
      out.push({ json: enrichedExtension });
      console.log(
        `  ✅ Extension enrichie (direct) avec extensionId="${originalExtensionId}"`
      );
      continue;
    }
  }

  // 🎯 PRIORITÉ 2 : Corrélation tokens avec SCORING INTELLIGENT
  const matches = [];
  if (specificTokens.length > 0) {
    console.log(`  🔍 Test de corrélation avec ${cands.length} candidats...`);

    for (const c of cands) {
      const titleLow = low(c.title);
      const rawLow = low(JSON.stringify(c.raw || {}));
      const matchingTokens = specificTokens.filter(
        (t) => titleLow.includes(t) || rawLow.includes(t)
      );

      if (matchingTokens.length > 0) {
        const kev = c.src === "KEV";

        // 🎯 Calcul âge du CVE depuis le CVE ID
        const cveYearMatch = c.id.match(/CVE-(\d{4})-/);
        const year = cveYearMatch ? parseInt(cveYearMatch[1]) : 2000;
        const age = 2025 - year;

        // Bonus si très récent (< 3 ans)
        const recentBonus = age <= 2 ? 3 : 0;

        // 🎯 PÉNALITÉ PROPORTIONNELLE : -2 points par année au-delà de 5 ans
        const agePenalty = age > 5 ? -(age - 5) * 2 : 0;

        // Score basé sur le nombre de tokens matchés
        const tokenScore = matchingTokens.length;

        // Tokens critiques
        const criticalTokens = [
          "login",
          "authentication",
          "credential",
          "password",
          "session",
          "token",
          "oauth",
          "sso",
        ];
        const criticalMatches = matchingTokens.filter((t) =>
          criticalTokens.includes(t.toLowerCase())
        ).length;

        // Calcul du score de confiance
        const conf =
          tokenScore * 2 +
          criticalMatches * 5 +
          (kev ? 3 : 0) +
          recentBonus +
          agePenalty;

        matches.push({
          conf,
          c,
          matchingTokens,
          year,
          age,
          agePenalty,
          criticalMatches,
        });
        console.log(
          `    ✅ MATCH: ${
            c.id
          } (conf: ${conf}, tokens: ${tokenScore}, critical: ${criticalMatches}, year: ${year}, age: ${age} ans, penalty: ${agePenalty}) - Tokens: [${matchingTokens.join(
            ", "
          )}]`
        );
      }
    }
  }

  console.log(`  📊 Total matches: ${matches.length}`);

  // 🎯 TRI INTELLIGENT avec TIEBREAKER
  matches.sort((a, b) => {
    if (b.conf !== a.conf) return b.conf - a.conf;
    if (b.criticalMatches !== a.criticalMatches)
      return b.criticalMatches - a.criticalMatches;
    return b.year - a.year;
  });

  const bestMatch = matches[0];

  // Afficher le top 3 pour debug
  if (matches.length > 0) {
    console.log(`  🏆 Top 3 matches:`);
    matches.slice(0, 3).forEach((m, i) => {
      console.log(
        `    ${i + 1}. ${m.c.id} (conf: ${m.conf}, critical: ${
          m.criticalMatches
        }, year: ${m.year})`
      );
    });
  }

  // Seuil minimum de confiance = 4
  if (bestMatch && bestMatch.conf >= 4 && specificTokens.length > 0) {
    console.log(
      `  🎯 ✅ CVE ATTRIBUÉ: ${bestMatch.c.id} (confiance: ${bestMatch.conf})`
    );

    const enrichedExtension = {
      ...data,
      extensionId: originalExtensionId,
      cve_id: bestMatch.c.id,
      cveid: bestMatch.c.id,
      mappedCVE: true,
      mappingConfidence: bestMatch.conf,
      mappingSource: bestMatch.c.src,
      mappingTitle: bestMatch.c.title,
      matchMethod: "token_correlation",
      specificTokens,
      matchingTokens: bestMatch.matchingTokens,
      isVirtual: false,
      _is_extension_data: true,
      original_data: {
        ...data.original_data,
        extensionId: originalExtensionId,
      },
    };
    out.push({ json: enrichedExtension });
    console.log(
      `  ✅ Extension enrichie (tokens) avec extensionId="${originalExtensionId}"`
    );
  } else {
    console.log(
      `  🛡️ ❌ AUCUN MATCH suffisant (meilleur score: ${
        bestMatch?.conf || 0
      }) - Génération CVE virtuel 2026`
    );

    // 🎯 GÉNÉRATION CVE VIRTUEL EN 2026
    const timestamp = Date.now().toString().slice(-6);
    const virtualCVE = `CVE-2026-${timestamp}`;

    const enrichedWithVirtual = {
      ...data,
      extensionId: originalExtensionId,
      cve_id: virtualCVE,
      cveid: virtualCVE,
      mappedCVE: false,
      mappingConfidence: 0,
      mappingSource: "virtual",
      mappingTitle: `Virtual CVE for ${data.url || "Unknown URL"}`,
      matchMethod: "no_match_virtual_2026",
      specificTokens: specificTokens,
      isVirtual: true,
      virtualYear: 2026,
      _is_extension_data: true,
      original_data: {
        ...data.original_data,
        extensionId: originalExtensionId,
      },
    };

    out.push({ json: enrichedWithVirtual });
    console.log(
      `  🆕 CVE virtuel 2026 généré: ${virtualCVE} (extensionId: ${originalExtensionId})`
    );
  }
}

console.log(`\n📤 === RÉSULTATS PREPARE CVE ===`);
console.log(`  Extensions en entrée: ${ext.length}`);
console.log(`  Extensions en sortie: ${out.length}`);
console.log(`  Items pool: ${pool.length}`);
console.log(`  Total: ${pool.length + out.length}`);

return [...pool, ...out];
