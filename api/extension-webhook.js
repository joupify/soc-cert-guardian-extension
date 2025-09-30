export default async function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  const { url, threatType, aiAnalysis, extensionId, timestamp } = req.body;

  try {
    // PUSH dans la queue pour n8n (PULL ensuite)
    await fetch("https://soc-cert-extension.vercel.app/api/extension-queue", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url,
        threatType,
        aiAnalysis,
        extensionId,
        timestamp: timestamp || new Date().toISOString(),
      }),
    });

    res.json({ success: true, extensionId, message: "Queued for analysis" });
  } catch (error) {
    console.error("Queue push failed:", error);
    res.status(500).json({ error: "Queue push failed" });
  }
}
