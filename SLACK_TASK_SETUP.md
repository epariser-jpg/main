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

### Step 2: Host the App

You have several options:

#### Option A: Simple HTTP Server (for testing)
```bash
# In this directory, run:
python3 -m http.server 8000
# Then open http://YOUR_COMPUTER_IP:8000/quick-task.html on your phone
```

#### Option B: GitHub Pages (recommended)
1. Create a new GitHub repository
2. Upload `quick-task.html` and `manifest.json`
3. Go to Settings → Pages
4. Enable GitHub Pages from the `main` branch
5. Access at `https://YOUR_USERNAME.github.io/REPO_NAME/quick-task.html`

#### Option C: Netlify/Vercel (easiest)
1. Drag and drop these files to https://app.netlify.com/drop
2. Get instant hosting with HTTPS

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

**Voice input doesn't work:**
- Voice input only works on HTTPS (not HTTP)
- Make sure you've granted microphone permissions
- Voice recognition works best in Safari (iOS) and Chrome (Android)

**Tasks not appearing in Slack:**
- Check your webhook URL is correct
- Make sure the Slack app is installed in your workspace
- Check the channel you selected when creating the webhook

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
