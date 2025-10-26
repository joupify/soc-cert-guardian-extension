#!/bin/bash

echo "🧪 Testing SOC-CERT Backend Vercel..."
echo ""

echo "📡 Test 1: Check if webhook endpoint is accessible"
echo "URL: https://soc-cert-extension.vercel.app/api/extension-webhook"
curl -I https://soc-cert-extension.vercel.app/api/extension-webhook 2>&1 | grep -E "HTTP|server|access-control"
echo ""

echo "📤 Test 2: Send test POST request"
response=$(curl -s -X POST 'https://soc-cert-extension.vercel.app/api/extension-webhook' \
  -H 'Content-Type: application/json' \
  -d '{"extensionId":"test-judge-123","url":"http://test.com","threatType":"test","riskScore":75}')
echo "Response: $response"
echo ""

echo "📥 Test 3: Check queue endpoint"
queue_response=$(curl -s 'https://soc-cert-extension.vercel.app/api/extension-queue')
echo "Queue response: $queue_response"
echo ""

echo "✅ Test complete!"
echo ""
echo "Expected results:"
echo "  ✅ Test 1: Should show 'HTTP/2 405' and 'server: Vercel'"
echo "  ✅ Test 2: Should return success:true with queued data"
echo "  ✅ Test 3: Should return queue items or empty array"
