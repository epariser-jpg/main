# Meet Performance Reviewer

Automated weekly Google Meet performance analysis using Claude AI. This tool analyzes your meeting transcripts, identifies where you engaged skillfully, and provides 1-3 specific areas for improvement with concrete examples.

## Features

- 🎯 **Automated weekly reviews** of all Google Meet recordings
- 💡 **AI-powered analysis** using Claude Sonnet 4.5
- 📧 **Email summaries** delivered directly to your inbox
- 🎓 **Actionable feedback** with specific examples and alternatives
- 💰 **Cost-effective** - uses existing Google Meet transcripts (no transcription costs)

## Prerequisites

- Node.js 16+ installed
- Google Workspace account with Meet recordings enabled
- Claude API key from Anthropic
- Google Cloud project with Drive and Gmail APIs enabled

## Quick Start

### 1. Install Dependencies

```bash
cd meet-performance-reviewer
npm install
```

### 2. Configure Environment

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` with your details:

```env
ANTHROPIC_API_KEY=your_claude_api_key_here
EMAIL_TO=your.email@newpublic.org
EMAIL_FROM=your.email@newpublic.org
YOUR_EMAIL=your.email@newpublic.org

# Optional: Customize schedule (default: Monday 9 AM)
SCHEDULE_CRON=0 9 * * 1

# Optional: Review period (default: 7 days)
REVIEW_PERIOD_DAYS=7
```

### 3. Get Claude API Key

1. Go to https://console.anthropic.com/
2. Sign up or log in
3. Navigate to API Keys
4. Create a new key
5. Add it to your `.env` file

### 4. Set Up Google OAuth

#### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - **Google Drive API**
   - **Gmail API**

#### Step 2: Create OAuth Credentials

1. Go to **APIs & Services > Credentials**
2. Click **Create Credentials > OAuth client ID**
3. Choose **Desktop app** as the application type
4. Name it (e.g., "Meet Performance Reviewer")
5. Click **Create**

#### Step 3: Download Credentials

1. Click the download button (⬇️) next to your newly created OAuth client
2. Save the file as `credentials.json` in the `meet-performance-reviewer` directory

#### Step 4: Authorize the App

Run the setup script:

```bash
npm run setup
```

This will:
- Open a browser for Google OAuth authorization
- Prompt you to authorize Drive and Gmail access
- Save your access token locally

## Usage

### Run a Review Now (Manual)

To test the system or run an immediate review:

```bash
npm run review
```

This will:
1. Fetch all meeting transcripts from the last 7 days (or configured period)
2. Analyze them with Claude AI
3. Send/display an email summary with feedback

### Start Scheduled Reviews

To run automatic weekly reviews:

```bash
npm start
```

This will:
- Start the scheduler (default: every Monday at 9 AM)
- Keep running in the background
- Automatically run reviews on schedule
- Press `Ctrl+C` to stop

### Run as Background Service (Production)

For continuous operation, use a process manager like PM2:

```bash
# Install PM2 globally
npm install -g pm2

# Start the reviewer
pm2 start index.js --name meet-reviewer

# View logs
pm2 logs meet-reviewer

# Stop the reviewer
pm2 stop meet-reviewer

# Set to auto-start on system boot
pm2 startup
pm2 save
```

## How It Works

### 1. Transcript Discovery

The system searches your Google Drive for files that:
- Contain "transcript" in the filename
- Have `.vtt`, `.srt`, or `.txt` extensions
- Are Google Docs (transcript documents)
- Were modified within the review period (default: last 7 days)

### 2. AI Analysis

Claude AI analyzes your communication patterns across all meetings, focusing on:

**Skillful Engagement (2-4 strengths):**
- Active listening
- Clear communication
- Effective questioning
- Facilitation skills
- Empathy and emotional intelligence

**Areas for Improvement (1-3 areas):**
- Specific examples of what you did
- Why it could be improved
- Concrete alternative approaches

### 3. Report Delivery

You receive a beautifully formatted email with:
- Summary of meetings analyzed
- Your strengths with specific examples
- Areas for improvement with actionable advice

## Configuration

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `ANTHROPIC_API_KEY` | Yes | - | Your Claude API key |
| `EMAIL_TO` | Yes | - | Email to receive reports |
| `EMAIL_FROM` | Yes | - | Email to send from (usually same) |
| `YOUR_EMAIL` | No | - | Filter meetings by your email |
| `SCHEDULE_CRON` | No | `0 9 * * 1` | Cron schedule (Monday 9 AM) |
| `REVIEW_PERIOD_DAYS` | No | `7` | Days to look back for transcripts |

### Cron Schedule Format

The `SCHEDULE_CRON` uses standard cron syntax:

```
┌───────────── minute (0 - 59)
│ ┌───────────── hour (0 - 23)
│ │ ┌───────────── day of month (1 - 31)
│ │ │ ┌───────────── month (1 - 12)
│ │ │ │ ┌───────────── day of week (0 - 6) (Sunday - Saturday)
│ │ │ │ │
* * * * *
```

Examples:
- `0 9 * * 1` - Every Monday at 9:00 AM
- `0 18 * * 5` - Every Friday at 6:00 PM
- `0 9 1 * *` - First day of every month at 9:00 AM
- `0 9 * * 1,3,5` - Monday, Wednesday, Friday at 9:00 AM

## Troubleshooting

### No Transcripts Found

**Problem:** "Found 0 potential transcript files"

**Solutions:**
1. Verify transcripts are enabled in Google Meet settings
2. Check that recordings are saved to Google Drive
3. Ensure transcript files contain "transcript" in the name
4. Try increasing `REVIEW_PERIOD_DAYS` to look further back

### Authentication Errors

**Problem:** "credentials.json not found" or "Authorization required"

**Solutions:**
1. Ensure `credentials.json` is in the project directory
2. Run `npm run setup` to authorize
3. Check that Drive and Gmail APIs are enabled in Google Cloud Console
4. Delete `token.json` and re-run `npm run setup` if token is invalid

### Email Not Sending

**Problem:** Email not received

**Solutions:**
1. Check spam folder
2. Verify `EMAIL_TO` and `EMAIL_FROM` in `.env`
3. Ensure Gmail API is enabled and authorized
4. Check console output - if OAuth isn't configured, email content will print to console

### Claude API Errors

**Problem:** Analysis fails with API error

**Solutions:**
1. Verify `ANTHROPIC_API_KEY` is correct
2. Check your API quota/credits at console.anthropic.com
3. Ensure you're using a valid API key (not a web app key)

## Cost Estimate

- **Google Drive API:** Free (within quota)
- **Gmail API:** Free (within quota)
- **Claude API:** ~$0.50-2.00 per review depending on transcript length
  - Typical meeting: 2000-5000 tokens
  - Claude Sonnet 4.5: $3/MTok input, $15/MTok output
  - Weekly cost: ~$2-8/month for 5-10 meetings/week

## Privacy & Security

- **Local storage:** OAuth tokens stored locally in `token.json`
- **API keys:** Stored in `.env` (gitignored)
- **Data processing:** Transcripts sent to Claude API for analysis
- **Email:** Sent via your own Gmail account
- **No external storage:** No data stored on third-party servers

## Development

### Project Structure

```
meet-performance-reviewer/
├── lib/
│   ├── google-drive.js      # Google Drive integration
│   ├── performance-analyzer.js  # Claude AI analysis
│   └── email-sender.js      # Email delivery
├── index.js                 # Main scheduler app
├── review-now.js           # Manual review script
├── setup.js                # OAuth setup script
├── package.json
├── .env.example
└── README.md
```

### Testing

Run a manual review to test:

```bash
npm run review
```

This will execute immediately without waiting for the schedule.

## License

MIT

## Support

For issues or questions:
1. Check the Troubleshooting section above
2. Review Google Meet and Drive settings
3. Verify API credentials and quotas
4. Check console logs for detailed error messages

---

Built with ❤️ for better communication skills
