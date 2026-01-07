# 🔍 Quick Reference: Finding Slack IDs

## Get Your Channel ID

**Method 1 - From Slack Desktop:**
1. Open the channel in Slack
2. Click the channel name at the top
3. Scroll down in the info panel
4. Copy the Channel ID (looks like `C1234567890`)

**Method 2 - From a Message:**
1. Right-click any message in the channel
2. Click "Copy link"
3. The link is: `https://workspace.slack.com/archives/C1234567890/p...`
4. Extract the `C1234567890` part

---

## Get Your List ID

**Method 1 - Using the API:**
```bash
curl -X GET 'https://slack.com/api/lists.list' \
  -H 'Authorization: Bearer xoxb-YOUR-TOKEN-HERE'
```

This returns all your lists with their IDs.

**Method 2 - From Browser DevTools:**
1. Open Slack in Chrome/Firefox
2. Press F12 to open DevTools
3. Go to Network tab
4. Open your list in Slack
5. Look for `lists.*` API calls
6. Find the `list_id` in the response

**Method 3 - Check List Settings:**
1. Open your list in Slack
2. Click the list name or ⋮ menu
3. Look for "List Details" or "Settings"
4. The List ID might be shown there

---

## Get Your OAuth Token

1. Go to https://api.slack.com/apps
2. Select your app (or create one)
3. Go to **OAuth & Permissions**
4. Make sure you have these **Bot Token Scopes**:
   - `chat:write`
   - `chat:write.public`
   - `lists:write`
5. Install (or reinstall) the app to your workspace
6. Copy the **Bot User OAuth Token** (starts with `xoxb-`)

---

## Test Your Setup

Test if everything works with this curl command:

```bash
# Test posting a message
curl -X POST 'https://slack.com/api/chat.postMessage' \
  -H 'Authorization: Bearer xoxb-YOUR-TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "channel": "C1234567890",
    "text": "Test message"
  }'

# Test adding to list (requires message timestamp from above)
curl -X POST 'https://slack.com/api/lists.add' \
  -H 'Authorization: Bearer xoxb-YOUR-TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "list_id": "L1234567890",
    "channel_id": "C1234567890",
    "message_ts": "1234567890.123456"
  }'
```

If these work, your app will work!

---

## Common Issues

**"channel_not_found"**
→ Invite your bot to the channel: `/invite @YourBotName`

**"missing_scope"**
→ Add the scope in OAuth & Permissions, then **reinstall** the app

**"invalid_auth"**
→ Make sure you're using the **Bot User OAuth Token** (xoxb-), not User token (xoxp-)

---

See **SLACK_LISTS_SETUP.md** for the complete setup guide!
