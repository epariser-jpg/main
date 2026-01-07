# Quick Task to Slack - Setup Guide

This is your simple, two-tap solution for adding tasks to Slack from your phone!

## 🚀 Quick Start

### Step 1: Set up Slack Incoming Webhook

1. Go to https://api.slack.com/apps
2. Click **"Create New App"** → **"From scratch"**
3. Name it "Quick Task" and select your workspace
4. In the left sidebar, click **"Incoming Webhooks"**
5. Toggle **"Activate Incoming Webhooks"** to ON
6. Click **"Add New Webhook to Workspace"**
7. Select the channel where you want tasks to appear (you can create a dedicated `#tasks` channel)
8. Click **"Allow"**
9. **Copy the Webhook URL** (looks like `https://hooks.slack.com/services/T00000000/B00000000/XXXX`)

### Step 2: Host the App on Netlify (Recommended)

**Important:** This app needs a backend function to avoid CORS issues with Slack. Netlify is the easiest option!

#### Method 1: Netlify Drop (Easiest - 2 minutes)
1. Go to https://app.netlify.com/drop
2. Drag and drop **ALL these files** from your computer:
   - `quick-task.html`
   - `manifest.json`
   - `netlify.toml`
   - The entire `netlify` folder (contains the backend function)
3. Netlify will give you a URL like `https://random-name-123.netlify.app`
4. Done! Your app is live.

#### Method 2: Netlify GitHub Deploy (Best for updates)
1. Push these files to a GitHub repository
2. Go to https://app.netlify.com
3. Click "Add new site" → "Import an existing project"
4. Connect your GitHub repo
5. Netlify auto-detects settings from `netlify.toml`
6. Click "Deploy site"

#### Method 3: Netlify CLI
```bash
npm install -g netlify-cli
netlify deploy --prod
```

**Note:** Other hosting options (GitHub Pages, Vercel, etc.) will also work but require similar backend setup.

### Step 3: Add to Phone Home Screen

#### iPhone:
1. Open the hosted URL in Safari
2. Tap the **Share** button (square with arrow)
3. Scroll down and tap **"Add to Home Screen"**
4. Tap **"Add"**

#### Android:
1. Open the hosted URL in Chrome
2. Tap the **menu** (three dots)
3. Tap **"Add to Home Screen"** or **"Install app"**
4. Tap **"Add"**

### Step 4: Configure on First Use

1. Tap the new app icon on your home screen
2. When you first try to send a task, it will ask for your Slack webhook URL
3. Paste the webhook URL from Step 1
4. You're all set! 🎉

## 📱 How to Use

1. **Tap** the app icon on your home screen
2. **Either:**
   - Tap 🎤 and speak your task
   - Type your task
3. **Tap** 📤 Send

That's it! Two taps and you're done.

## ⚙️ Features

- **Voice Input**: Tap the microphone and speak
- **Text Input**: Type if you prefer
- **Priority Selection**: Choose 1-Today, 2-Today, or 3-Week
- **Offline Ready**: Works as a PWA
- **Fast**: Minimal interface, maximum speed

## 🔧 Advanced Configuration

### Change Webhook URL
Double-tap the background of the app to reset the webhook URL.

### Customize for Slack Tasks Integration

If you want this to create actual Slack tasks (not just messages), you'll need to:

1. Create a Slack app with `chat:write` and `tasks:write` scopes
2. Get an OAuth token
3. Modify the `sendToSlack` function to use the Slack API instead of webhooks

Here's a modified version for Slack API:

```javascript
async function sendToSlack(task, priority) {
    const token = localStorage.getItem('slackToken');

    const response = await fetch('https://slack.com/api/tasks.create', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            title: task,
            priority: priority,
            status: 'Now'
        })
    });

    const data = await response.json();
    if (!data.ok) {
        throw new Error(data.error);
    }
}
```

## 🐛 Troubleshooting

**"Failed to fetch" error when sending tasks:**
- This happens when the backend function isn't deployed properly
- **Solution:** Make sure you deployed the `netlify` folder with the function
- Re-deploy on Netlify and ensure `netlify/functions/send-task.js` is included
- Check Netlify's function logs: Site → Functions → send-task

**Voice input doesn't work:**
- Voice input only works on HTTPS (not HTTP)
- Make sure you've granted microphone permissions
- Voice recognition works best in Safari (iOS) and Chrome (Android)

**Tasks not appearing in Slack:**
- Check your webhook URL is correct (starts with `https://hooks.slack.com/services/`)
- Make sure the Slack app is installed in your workspace
- Check the channel you selected when creating the webhook
- Look at Netlify function logs for error details

**Can't add to home screen:**
- Make sure you're using Safari (iOS) or Chrome (Android)
- The app must be served over HTTPS for full PWA features

## 💡 Tips

- Use **Cmd/Ctrl + Enter** to send from keyboard
- The app remembers your last priority selection
- Works offline once installed (sends when back online)
- You can have multiple copies with different webhook URLs for different purposes

## 🔐 Privacy

All data stays on your device. The webhook URL is stored in your browser's localStorage. No data is sent anywhere except directly to your Slack webhook.

---

Enjoy your super-fast task capture! 🚀
