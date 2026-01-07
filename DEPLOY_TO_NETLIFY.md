# 🚀 Quick Deploy to Netlify

## Files You Need to Upload

When deploying to Netlify Drop or your repo, make sure to include **ALL** of these:

```
✅ quick-task.html          (The main app)
✅ manifest.json            (PWA config)
✅ netlify.toml             (Netlify configuration)
✅ netlify/                 (IMPORTANT: The entire folder!)
   └── functions/
       └── send-task.js     (Backend function - fixes CORS)
```

## Why the netlify folder is critical

The `netlify/functions/send-task.js` file is a serverless backend function that:
- Receives task data from your phone
- Forwards it to Slack's webhook
- **Fixes the "Failed to fetch" CORS error**

Without this folder, the app **will not work**!

## Quick Deployment Steps

### Option 1: Netlify Drop (Fastest)
1. Select ALL files and the netlify folder
2. Drag them to https://app.netlify.com/drop
3. Wait for deployment
4. Use the provided URL

### Option 2: GitHub + Netlify
1. Push all files to GitHub (including netlify folder)
2. Connect repo to Netlify
3. Deploy automatically

## Verify It Worked

After deployment:
1. Go to your Netlify site dashboard
2. Click "Functions" in the top menu
3. You should see `send-task` listed
4. If you don't see it, the folder didn't upload correctly

## Your Slack Webhook URL

You'll need your Slack webhook URL (the one you got from Step 1).

It should look like: `https://hooks.slack.com/services/T.../B.../...`

Keep this handy - the app will ask for it on first use!

---

**Need help?** See SLACK_TASK_SETUP.md for detailed instructions.
