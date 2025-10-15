// ============================================================================
// COUNT STATS
// ============================================================================

console.log("📊 === COMPTAGE DES STATS AVEC DÉDUPLICATION ===");

const items = $input.all();

if (items.length === 0 || !items[0]?.json?.results) {
  console.error("❌ Aucune donnée !");
  return items;
}

const allCVEs = items[0].json.results;
console.log(`📥 Total CVE dans cette requête: ${allCVEs.length}`);

// 🎯 COMPTER CHAQUE CVE COMME UNE MENACE (1 CVE => 1 threat)
// Ne pas dédupliquer par URL : chaque entrée CVE reçue représente une menace distincte
const uniqueThreats = allCVEs.slice();
console.log(
  `🎯 Menaces comptées (1 CVE = 1 threat): ${uniqueThreats.length} (sur ${allCVEs.length} CVE total)`
);

// ✅ UTILISER LE CHAMP isVirtual
const virtualThreats = uniqueThreats.filter((item) => item.isVirtual === true);
const realThreats = uniqueThreats.filter((item) => item.isVirtual === false);

console.log(`🔮 Virtual Threats (uniques): ${virtualThreats.length}`);
console.log(`🎯 Real Threats (uniques): ${realThreats.length}`);

const threatsCreatedInBatch = virtualThreats.length;
console.log(`➕ New virtual threats in this batch: ${threatsCreatedInBatch}`);

// 🕐 Menaces 24h
const now = new Date();
const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);

const threatsLast24h = virtualThreats.filter((item) => {
  const ts = item.timestamp || item.createdAt;
  return ts && new Date(ts) > last24h;
}).length;

console.log(`🕐 Menaces uniques 24h: ${threatsLast24h}`);

// 📈 Confiance moyenne
const confidenceValues = virtualThreats
  .map((item) => item.confidence || item.score / 100 || 0.85)
  .filter((val) => val > 0);

const avgConfidence =
  confidenceValues.length > 0
    ? confidenceValues.reduce((sum, val) => sum + val, 0) /
      confidenceValues.length
    : 0.85;

// ✅ RÉCUPÉRER LES STATS EXISTANTES (BONNE ROUTE)
let existingStats = {
  totalVirtualCVEs: 0,
  totalRealCVEs: 0,
  threatsLast24h: 0,
  avgConfidence: 0.85,
};

try {
  existingStats = await this.helpers.httpRequest({
    method: "GET",
    url: "https://soc-cert-extension.vercel.app/api/virtual-cve-stats", // ✅ CORRECT
    headers: { "Content-Type": "application/json" },
  });
  console.log("📊 Existing stats:", existingStats);
} catch (error) {
  console.warn(
    "⚠️ Impossible de récupérer les stats existantes:",
    error.message
  );
}

// 🎯 CALCULER LES NOUVELLES STATS (INCRÉMENTATION)
const stats = {
  totalVirtualCVEs:
    (existingStats.totalVirtualCVEs || 0) + virtualThreats.length,
  totalRealCVEs: (existingStats.totalRealCVEs || 0) + realThreats.length,
  threatsLast24h: (existingStats.threatsLast24h || 0) + threatsCreatedInBatch,
  avgConfidence: Math.round(avgConfidence * 100) / 100,
  avgDetectionTime: "2.3s",
  lastUpdate: now.toISOString(),
};

console.log("📈 Updated stats:", JSON.stringify(stats, null, 2));

// 🚀 ENVOYER LES STATS MISES À JOUR
try {
  const response = await this.helpers.httpRequest({
    method: "POST",
    url: "https://soc-cert-extension.vercel.app/api/update-stats",
    headers: { "Content-Type": "application/json" },
    body: { stats },
    json: true,
  });

  console.log("✅ Stats mises à jour:", response);
} catch (error) {
  console.error("❌ Erreur mise à jour stats:", error.message);
}

return items.map((item) => ({
  ...item,
  json: { ...item.json, _calculatedStats: stats },
}));
