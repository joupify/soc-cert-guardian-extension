export default async function handler(req, res) {
  // Enable CORS for extension
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  const { url, threatType, aiAnalysis, extensionId } = req.body;

  console.log("Extension threat received:", { url, threatType, extensionId });

  try {
    // TODO: Forward to N8N (add ton URL N8N)
    // const n8nResponse = await fetch('https://ton-n8n-url/webhook/extension-alerts', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ url, threatType, aiAnalysis, extensionId, source: 'Chrome Extension' })
    // });

    res.json({
      success: true,
      extensionId,
      message: "Threat received for analysis",
    });
  } catch (error) {
    console.error("Error forwarding to N8N:", error);
    res.status(500).json({ error: "Processing failed" });
  }
}
