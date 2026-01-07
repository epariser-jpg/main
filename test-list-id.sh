#!/bin/bash

# Test script to verify your Slack List ID
# Usage: ./test-list-id.sh YOUR_OAUTH_TOKEN

TOKEN=$1
LIST_ID="1370f3d5-1767796454.886"

if [ -z "$TOKEN" ]; then
    echo "Usage: ./test-list-id.sh YOUR_OAUTH_TOKEN"
    echo ""
    echo "Get your token from: https://api.slack.com/apps"
    echo "OAuth & Permissions → Bot User OAuth Token (starts with xoxb-)"
    exit 1
fi

echo "Testing List ID: $LIST_ID"
echo ""

# Try to get list details
echo "Fetching list details..."
curl -X GET "https://slack.com/api/lists.info?list_id=$LIST_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  | jq '.'

echo ""
echo "---"
echo ""
echo "If you see 'ok: true' above, the List ID is correct!"
echo "If you see an error, try fetching all your lists:"
echo ""
echo "curl -X GET 'https://slack.com/api/lists.list' \\"
echo "  -H 'Authorization: Bearer $TOKEN' | jq '.'"
