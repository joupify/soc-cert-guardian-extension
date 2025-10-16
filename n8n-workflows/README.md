# � SOC-CERT n8n Workflows

## 📋 Included Workflows

### Complete Workflow (`soc-cert.json`)

The complete SOC-CERT workflow file containing all necessary nodes for full extension functionality.

**Important**: Only the nodes required for the extension to function are activated. Communication nodes (Gmail, Slack, Google services) are disabled as they're not essential for core extension operation.

### 1. Main Workflow (`soc-cert-main-flow.json`)

- Receives extension alerts
- Real-time Gemini analysis
- Virtual CVE generation
- Redis storage

### 2. CVE Correlation (`cve-correlation-flow.json`)

- Threat enrichment with CVE data
- Intelligence threat mapping
- Virtual CVE generation

### 3. Statistics Processing (`stats-processing-flow.json`)

- Metrics aggregation
- Virtual CVE dashboard
- Real-time analytics

## 🚀 Quick Installation

### Prerequisites

- n8n instance (local or cloud)
- Redis database
- Vercel deployment (optional)

### Steps

1. **Import workflows** into n8n
2. **Configure environment variables**
3. **Activate webhooks**
4. **Test with provided examples**

## � Configuration

### Environment Variables

```env
REDIS_URL=your_redis_connection
VERCEL_URL=your_vercel_app_url
API_SECRET=your_optional_secret
```

### Main Webhooks

- POST /api/extension-webhook - Extension alerts
- GET /api/extension-result - Analysis results
- POST /api/update-stats - Stats updates

## 🧪 Testing

Use examples in test-examples/:

```bash
# Test main workflow
curl -X POST $VERCEL_URL/api/extension-webhook \
  -H "Content-Type: application/json" \
  -d @test-examples/sample-request.json
```

## 📊 Architecture

```
Extension → n8n Webhook → Gemini Analysis → CVE Correlation → Redis → API Response
```

## 🆘 Troubleshooting

- Webhook not received: Check URLs in n8n
- Redis errors: Verify Redis connection
- Gemini timeout: Adjust n8n timeouts
