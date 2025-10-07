// === 🔧 GET EXTENSION QUEUE - BATCH MODE ===
console.log("=== 🔧 BATCH QUEUE READER - DÉMARRAGE ===");
console.log("🔧 CHECKPOINT 0: Script initialisé, début d'exécution...");
console.log("🔧 Timestamp début:", new Date().toISOString());

// Utiliser this.helpers.httpRequest (méthode universelle n8n)
try {
  console.log("📡 Envoi requête vers extension-queue API...");

  const requestOptions = {
    method: "GET",
    url: "https://soc-cert-extension.vercel.app/api/extension-queue",
    headers: {
      "Content-Type": "application/json",
    },
    json: true,
  };

  console.log("� Options requête:", JSON.stringify(requestOptions, null, 2));

  const response = await this.helpers.httpRequest(requestOptions);

  console.log(`📥 Response reçue:`, typeof response);
  console.log(`📥 Response data:`, JSON.stringify(response, null, 2));

  // La réponse est directement l'objet JSON
  const queueData = response;
  console.log(`📥 Queue success:`, queueData.success);
  console.log(
    `📥 Queue extensions:`,
    queueData.extensions ? "PRESENT" : "MISSING"
  );

  if (!queueData.success || !queueData.extensions) {
    console.log("❌ Format de queue invalide");
    console.log("❌ queueData.success:", queueData.success);
    console.log("❌ queueData.extensions:", queueData.extensions);
    return [{ error: "Invalid queue format", data: queueData }];
  }

  const extensions = queueData.extensions;
  console.log(`📊 Total extensions dans la queue: ${extensions.length}`);

  // 🔍 DEBUG - Lister TOUS les IDs de la queue
  console.log("🔍 DEBUG - TOUS les extensionIds dans la queue:");
  extensions.forEach((ext, idx) => {
    console.log(
      `  ${idx + 1}. ${ext.extensionId} (processed: ${ext.processed})`
    );
  });

  if (extensions.length === 0) {
    console.log("✅ Queue vide - aucun traitement nécessaire");
    return [{ message: "Queue is empty", count: 0 }];
  }

  // Filtrer les éléments non traités
  const unprocessedExtensions = extensions.filter((ext) => !ext.processed);
  console.log(`🔍 Extensions non traitées: ${unprocessedExtensions.length}`);

  if (unprocessedExtensions.length === 0) {
    console.log("✅ Tous les éléments sont déjà traités");
    return [{ message: "All items processed", total: extensions.length }];
  }

  // Prendre les 5 premiers pour éviter la surcharge
  const batchSize = Math.min(5, unprocessedExtensions.length);
  const batchToProcess = unprocessedExtensions.slice(0, batchSize);

  console.log(`🎯 Traitement en batch de ${batchSize} éléments:`);
  batchToProcess.forEach((ext, idx) => {
    console.log(`  ${idx + 1}. extensionId: ${ext.extensionId}`);
    console.log(`     url: ${ext.url}`);
    console.log(`     threatType: ${ext.threatType}`);
    console.log(`     aiAnalysis: ${ext.aiAnalysis ? "PRESENT" : "MISSING"}`); // ✅ Debug aiAnalysis
  });

  console.log("🔧 CHECKPOINT 1: Début de construction du résultat...");

  // Retourner le format attendu par le workflow avec TOUTES les données
  let result;
  try {
    console.log("🔧 CHECKPOINT 2: Mapping des extensions...");
    const mappedExtensions = batchToProcess.map((ext, idx) => {
      console.log(
        `  📝 Mapping extension ${idx + 1}/${batchToProcess.length}: ${
          ext.extensionId
        }`
      );
      const mapped = {
        extensionId: ext.extensionId,
        url: ext.url,
        threatType: ext.threatType,
        aiAnalysis: ext.aiAnalysis, // ✅ Préserver l'aiAnalysis !
        timestamp: ext.timestamp,
        addedAt: ext.addedAt,
        processed: ext.processed,
      };
      console.log(
        `  ✅ Extension ${idx + 1} mappée avec aiAnalysis: ${
          mapped.aiAnalysis ? "PRESENT" : "MISSING"
        }`
      );
      return mapped;
    });

    console.log("🔧 CHECKPOINT 3: Construction de l'objet result...");
    result = {
      success: true,
      extensions: mappedExtensions,
      count: batchToProcess.length,
      source: "batch-queue-reader",
      processedAt: new Date().toISOString(),
    };

    console.log("🔧 CHECKPOINT 4: Result construit avec succès");
    console.log(`  📊 Result keys: ${Object.keys(result).join(", ")}`);
    console.log(`  📊 Extensions count: ${result.extensions.length}`);
    console.log(
      `  📊 Tous les aiAnalysis préservés: ${
        result.extensions.every((ext) => ext.aiAnalysis) ? "OUI" : "NON"
      }`
    );
  } catch (mappingError) {
    console.log("❌ ERREUR durant le mapping:", mappingError.message);
    console.log("❌ Stack trace mapping:", mappingError.stack);
    throw mappingError;
  }

  console.log("✅ Batch prêt pour traitement");
  console.log("🔍 DEBUG - Result final:", JSON.stringify(result, null, 2));

  console.log("🔧 CHECKPOINT 5: Tentative de retour du résultat...");
  return [result];
} catch (error) {
  console.log("❌ Erreur lors de la lecture de la queue:", error.message);
  console.log("❌ Stack trace complète:", error.stack);
  console.log("❌ Type d'erreur:", error.name);
  console.log("❌ Timestamp erreur:", new Date().toISOString());

  const errorResult = {
    error: "Queue read failed",
    message: error.message,
    stack: error.stack,
    name: error.name,
    timestamp: new Date().toISOString(),
  };

  console.log("🔧 CHECKPOINT ERROR: Retour d'erreur structurée...");
  console.log("🔧 Error result:", JSON.stringify(errorResult, null, 2));
  return [errorResult];
}
