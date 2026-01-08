require('dotenv').config();
const cron = require('node-cron');
const GoogleDriveService = require('./lib/google-drive');
const PerformanceAnalyzer = require('./lib/performance-analyzer');
const EmailSender = require('./lib/email-sender');

class MeetPerformanceReviewer {
  constructor() {
    this.validateConfig();

    this.driveService = new GoogleDriveService();
    this.analyzer = new PerformanceAnalyzer(process.env.ANTHROPIC_API_KEY);
    this.emailSender = new EmailSender(
      process.env.EMAIL_FROM,
      process.env.EMAIL_TO
    );

    this.reviewPeriodDays = parseInt(process.env.REVIEW_PERIOD_DAYS) || 7;
    this.userEmail = process.env.YOUR_EMAIL;
    this.scheduleCron = process.env.SCHEDULE_CRON || '0 9 * * 1'; // Default: Monday 9 AM
  }

  validateConfig() {
    const required = ['ANTHROPIC_API_KEY', 'EMAIL_TO', 'EMAIL_FROM'];
    const missing = required.filter(key => !process.env[key]);

    if (missing.length > 0) {
      console.error('Missing required environment variables:');
      missing.forEach(key => console.error(`  - ${key}`));
      console.error('\nPlease copy .env.example to .env and fill in the values.');
      process.exit(1);
    }
  }

  async runReview() {
    console.log('\n' + '='.repeat(80));
    console.log('MEET PERFORMANCE REVIEWER');
    console.log('='.repeat(80));
    console.log(`Started at: ${new Date().toLocaleString()}`);
    console.log(`Review period: Last ${this.reviewPeriodDays} days`);
    console.log('='.repeat(80) + '\n');

    try {
      // Step 1: Authenticate with Google Drive
      console.log('Step 1: Authenticating with Google Drive...');
      await this.driveService.authenticate();
      console.log('✓ Authenticated\n');

      // Step 2: Fetch meeting transcripts
      console.log('Step 2: Fetching meeting transcripts...');
      const transcripts = await this.driveService.getMeetingTranscripts(
        this.reviewPeriodDays,
        this.userEmail
      );
      console.log(`✓ Found ${transcripts.length} transcripts\n`);

      if (transcripts.length === 0) {
        console.log('No transcripts found. Make sure:');
        console.log('  - Google Meet recordings are being saved to Drive');
        console.log('  - Transcripts are enabled for your meetings');
        console.log('  - Files contain "transcript" in the name or are .vtt/.srt files');
        return;
      }

      // Step 3: Analyze with Claude
      console.log('Step 3: Analyzing meetings with Claude AI...');
      const analysis = await this.analyzer.analyzeMeetings(transcripts, this.userEmail);
      console.log('✓ Analysis complete\n');

      // Step 4: Initialize email sender
      console.log('Step 4: Preparing email report...');
      await this.emailSender.initialize();
      console.log('✓ Email sender ready\n');

      // Step 5: Send report
      console.log('Step 5: Sending report...');
      await this.emailSender.sendReport(analysis);
      console.log('✓ Report sent\n');

      console.log('='.repeat(80));
      console.log('Review completed successfully!');
      console.log('='.repeat(80) + '\n');

    } catch (err) {
      console.error('\n❌ Error during review:');
      console.error(err.message);

      if (err.message.includes('credentials.json')) {
        console.error('\nSetup instructions:');
        console.error('1. Go to https://console.cloud.google.com/apis/credentials');
        console.error('2. Create a new OAuth 2.0 Client ID');
        console.error('3. Download the credentials.json file');
        console.error('4. Place it in the meet-performance-reviewer directory');
        console.error('5. Run: npm run setup');
      }

      if (err.message.includes('Authorization required')) {
        console.error('\nRun: npm run setup');
      }

      throw err;
    }
  }

  start() {
    console.log('Meet Performance Reviewer - Scheduler Started');
    console.log(`Schedule: ${this.scheduleCron}`);
    console.log(`Next run: ${this.getNextRunTime()}\n`);
    console.log('Press Ctrl+C to stop\n');

    // Run immediately on startup (optional - comment out if not desired)
    // this.runReview().catch(console.error);

    // Schedule weekly reviews
    cron.schedule(this.scheduleCron, () => {
      console.log('\n⏰ Scheduled review triggered');
      this.runReview().catch(err => {
        console.error('Scheduled review failed:', err);
      });
    });

    // Keep the process running
    process.on('SIGINT', () => {
      console.log('\nShutting down gracefully...');
      process.exit(0);
    });
  }

  getNextRunTime() {
    // Simple approximation - for exact calculation would need cron-parser
    const parts = this.scheduleCron.split(' ');
    const hour = parts[1];
    const dayOfWeek = parts[4];
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    if (dayOfWeek !== '*') {
      return `Every ${days[dayOfWeek]} at ${hour}:00`;
    }
    return `Daily at ${hour}:00`;
  }
}

// Start the scheduler if run directly
if (require.main === module) {
  const reviewer = new MeetPerformanceReviewer();
  reviewer.start();
}

module.exports = MeetPerformanceReviewer;
