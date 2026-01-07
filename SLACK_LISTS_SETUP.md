# 🚀 Quick Task for Slack Lists - Complete Setup Guide

This guide will help you set up the Quick Task app to add items directly to your Slack Lists.

## Part 1: Create a Slack App with OAuth

### Step 1: Create the Slack App

1. Go to https://api.slack.com/apps
2. Click **"Create New App"**
3. Choose **"From scratch"**
4. Name it "Quick Task" and select your workspace
5. Click **"Create App"**

### Step 2: Add Bot Permissions

1. In the left sidebar, click **"OAuth & Permissions"**
2. Scroll down to **"Scopes"** → **"Bot Token Scopes"**
3. Click **"Add an OAuth Scope"** and add these:
   - `chat:write` (to post messages)
   - `chat:write.public` (to post to public channels)
   - `lists:write` (to add items to lists)
   - `lists:read` (optional, to read lists)

### Step 3: Install the App to Your Workspace

1. Scroll back up to the top of the **"OAuth & Permissions"** page
2. Click **"Install to Workspace"**
3. Review the permissions and click **"Allow"**
4. **Copy the "Bot User OAuth Token"** - it starts with `xoxb-`
   - ⚠️ Keep this secret! Don't share it publicly
   - Save it somewhere secure - you'll need it later

## Part 2: Get Your Channel ID

You need the ID of the channel where your Slack List lives.

### Method 1: From Slack Desktop/Web
1. Open Slack and go to the channel with your list
2. Click the channel name at the top
3. Scroll down in the info panel
4. You'll see the **Channel ID** (looks like `C1234567890`)
5. Copy it!

### Method 2: From a Message Link
1. Right-click any message in the channel
2. Click **"Copy link"**
3. The link looks like: `https://yourworkspace.slack.com/archives/C1234567890/p123...`
4. The Channel ID is the part after `/archives/` (before the next `/`)

## Part 3: Get Your List ID

This is trickier. Here are a few methods:

### Method 1: From Slack's UI (Easiest)
1. Open your Slack List in Slack
2. Click the list name or info icon
3. Look for a "List ID" field in the details

**Note:** If you can't find the List ID easily, you might need to use the Slack API to query your lists. I can help you set up a simple script for this if needed.

### Method 2: Using Browser DevTools (Advanced)
1. Open Slack in a web browser
2. Open Developer Tools (F12)
3. Go to the **Network** tab
4. Navigate to your list
5. Look for API calls to `lists.*` endpoints
6. The list ID should be in the request/response

### Method 3: API Query (Most Reliable)
Use this curl command with your OAuth token:

```bash
curl -X GET \
  'https://slack.com/api/lists.list' \
  -H 'Authorization: Bearer xoxb-YOUR-TOKEN-HERE'
```

This will return all your lists with their IDs.

## Part 4: Deploy the App to Netlify

1. Go to https://app.netlify.com/drop
2. Drag and drop these files:
   - `quick-task.html`
   - `manifest.json`
   - `netlify.toml`
   - The entire `netlify/` folder
3. Wait for deployment
4. Copy your site URL (e.g., `https://random-name-123.netlify.app`)

## Part 5: Configure the App

1. Open your Netlify app URL on your phone or computer
2. Try to send a test task
3. When prompted, enter:
   - **OAuth Token**: Your `xoxb-...` token from Step 3
   - **Channel ID**: Your `C123...` ID from Part 2
   - **List ID** (optional): Your `L123...` ID from Part 3
     - If you skip this, tasks will just post as messages (not added to the list)

## Part 6: Add to Phone Home Screen

### iPhone:
1. Open the app in Safari
2. Tap the Share button
3. Scroll and tap **"Add to Home Screen"**
4. Tap **"Add"**

### Android:
1. Open the app in Chrome
2. Tap the menu (three dots)
3. Tap **"Add to Home Screen"** or **"Install app"**
4. Tap **"Add"**

## 🎉 You're Done!

Now you can:
1. Tap the app icon
2. Speak or type your task
3. Tap Send
4. Your task is added to your Slack List!

---

## 🐛 Troubleshooting

### "Missing scopes" error
- Go back to your Slack app settings
- Add the missing scope to Bot Token Scopes
- **Reinstall the app** to your workspace (important!)
- Get the new OAuth token

### "Channel not found" error
- Double-check your channel ID
- Make sure the bot is invited to the channel
  - In Slack, go to the channel and type: `/invite @Quick Task`

### "Invalid authentication" error
- Your OAuth token might be wrong
- Make sure you copied the **Bot User OAuth Token** (starts with `xoxb-`)
- Not the "User OAuth Token"

### Tasks post but don't add to list
- You might be missing the `lists:write` scope
- Or the List ID might be incorrect
- Check Netlify function logs: Site → Functions → send-task

### "Failed to add to list" error
- Verify your List ID is correct
- Make sure the list exists in the same channel
- Check that your bot has `lists:write` permission

---

## 🔐 Security Notes

Your OAuth token gives access to your Slack workspace. Keep it secure:
- It's stored in your browser's localStorage (device only)
- Never share your token publicly
- You can revoke it anytime from https://api.slack.com/apps → Your App → OAuth & Permissions → Revoke

To reset configuration:
- Double-tap the background of the app
- Confirm to clear all stored credentials

---

## ⚙️ Advanced: Environment Variables (Optional)

For better security, you can store credentials as Netlify environment variables instead of in the browser:

1. Go to your Netlify site dashboard
2. Click **Site settings** → **Environment variables**
3. Add these:
   - `SLACK_TOKEN`: Your OAuth token
   - `SLACK_LIST_ID`: Your list ID
   - `SLACK_CHANNEL_ID`: Your channel ID (if you want to hardcode it)
4. Redeploy your site

If set, these will be used automatically instead of prompting.

---

**Need help?** Feel free to check the Slack API docs or open an issue!
