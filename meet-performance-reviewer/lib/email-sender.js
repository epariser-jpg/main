const nodemailer = require('nodemailer');
const { google } = require('googleapis');
const fs = require('fs').promises;
const path = require('path');

class EmailSender {
  constructor(fromEmail, toEmail) {
    this.fromEmail = fromEmail;
    this.toEmail = toEmail;
    this.transporter = null;
  }

  async initialize() {
    // Try to use Gmail API if we have OAuth credentials
    const TOKEN_PATH = path.join(__dirname, '../token.json');
    const CREDENTIALS_PATH = path.join(__dirname, '../credentials.json');

    try {
      const credentials = JSON.parse(await fs.readFile(CREDENTIALS_PATH, 'utf8'));
      const token = JSON.parse(await fs.readFile(TOKEN_PATH, 'utf8'));

      const { client_secret, client_id } = credentials.installed || credentials.web;

      const oAuth2Client = new google.auth.OAuth2(
        client_id,
        client_secret,
        'http://localhost'
      );

      oAuth2Client.setCredentials(token);

      // Create transporter using OAuth2
      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          type: 'OAuth2',
          user: this.fromEmail,
          clientId: client_id,
          clientSecret: client_secret,
          refreshToken: token.refresh_token,
          accessToken: token.access_token,
        },
      });

      console.log('Email sender initialized with Gmail OAuth');
    } catch (err) {
      console.log('Gmail OAuth not available, email will need manual sending');
      console.log('Analysis will be printed to console');
    }
  }

  async sendReport(analysis) {
    const emailBody = this.formatEmailBody(analysis);
    const subject = `Weekly Meeting Performance Review - ${new Date().toLocaleDateString()}`;

    if (!this.transporter) {
      console.log('\n' + '='.repeat(80));
      console.log('EMAIL WOULD BE SENT:');
      console.log('='.repeat(80));
      console.log(`To: ${this.toEmail}`);
      console.log(`From: ${this.fromEmail}`);
      console.log(`Subject: ${subject}`);
      console.log('='.repeat(80));
      console.log(emailBody);
      console.log('='.repeat(80));
      console.log('\nNote: Configure Gmail OAuth to send emails automatically');
      return;
    }

    const mailOptions = {
      from: this.fromEmail,
      to: this.toEmail,
      subject: subject,
      html: this.formatEmailHTML(analysis),
      text: emailBody,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', info.messageId);
    } catch (err) {
      console.error('Failed to send email:', err.message);
      console.log('\nEmail content:\n');
      console.log(emailBody);
    }
  }

  formatEmailBody(analysis) {
    const { meetingCount, strengths, improvements } = analysis;

    let body = `Weekly Meeting Performance Review\n`;
    body += `Date: ${new Date().toLocaleDateString()}\n`;
    body += `Meetings Analyzed: ${meetingCount}\n`;
    body += `\n${'='.repeat(60)}\n\n`;

    if (meetingCount === 0) {
      body += 'No meetings found in the past week.\n';
      return body;
    }

    // Strengths
    body += `SKILLFUL ENGAGEMENT\n\n`;
    strengths.forEach((strength, i) => {
      body += `${i + 1}. ${strength.title}\n`;
      body += `${strength.description}\n\n`;
    });

    body += `\n${'='.repeat(60)}\n\n`;

    // Areas for improvement
    body += `AREAS FOR IMPROVEMENT\n\n`;
    improvements.forEach((improvement, i) => {
      body += `${i + 1}. ${improvement.title}\n\n`;
      body += `What happened:\n${improvement.whatHappened}\n\n`;
      body += `Why improve:\n${improvement.whyImprove}\n\n`;
      body += `Try instead:\n${improvement.tryInstead}\n\n`;
      body += `${'-'.repeat(40)}\n\n`;
    });

    body += `\nKeep growing! 🌱\n`;

    return body;
  }

  formatEmailHTML(analysis) {
    const { meetingCount, strengths, improvements } = analysis;

    let html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 700px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px;
      border-radius: 8px;
      margin-bottom: 30px;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
    }
    .meta {
      margin-top: 10px;
      opacity: 0.9;
      font-size: 14px;
    }
    .section {
      margin-bottom: 40px;
    }
    .section-title {
      font-size: 20px;
      font-weight: 600;
      color: #667eea;
      margin-bottom: 20px;
      padding-bottom: 10px;
      border-bottom: 2px solid #667eea;
    }
    .strength, .improvement {
      background: #f8f9fa;
      padding: 20px;
      border-radius: 6px;
      margin-bottom: 15px;
      border-left: 4px solid #667eea;
    }
    .improvement {
      border-left-color: #f59e0b;
    }
    .item-title {
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 10px;
      color: #1f2937;
    }
    .label {
      font-weight: 600;
      color: #6b7280;
      margin-top: 12px;
      margin-bottom: 4px;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      text-align: center;
      color: #6b7280;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Weekly Meeting Performance Review</h1>
    <div class="meta">
      ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
      <br>
      ${meetingCount} meeting${meetingCount !== 1 ? 's' : ''} analyzed
    </div>
  </div>
`;

    if (meetingCount === 0) {
      html += '<p>No meetings found in the past week.</p>';
    } else {
      // Strengths section
      html += `
  <div class="section">
    <h2 class="section-title">✨ Skillful Engagement</h2>
`;
      strengths.forEach(strength => {
        html += `
    <div class="strength">
      <div class="item-title">${this.escapeHtml(strength.title)}</div>
      <div>${this.escapeHtml(strength.description).replace(/\n/g, '<br>')}</div>
    </div>
`;
      });
      html += `  </div>\n`;

      // Improvements section
      html += `
  <div class="section">
    <h2 class="section-title">🎯 Areas for Improvement</h2>
`;
      improvements.forEach(improvement => {
        html += `
    <div class="improvement">
      <div class="item-title">${this.escapeHtml(improvement.title)}</div>
      <div class="label">What happened:</div>
      <div>${this.escapeHtml(improvement.whatHappened).replace(/\n/g, '<br>')}</div>
      <div class="label">Why improve:</div>
      <div>${this.escapeHtml(improvement.whyImprove).replace(/\n/g, '<br>')}</div>
      <div class="label">Try instead:</div>
      <div>${this.escapeHtml(improvement.tryInstead).replace(/\n/g, '<br>')}</div>
    </div>
`;
      });
      html += `  </div>\n`;
    }

    html += `
  <div class="footer">
    Keep growing! 🌱
  </div>
</body>
</html>
`;

    return html;
  }

  escapeHtml(text) {
    if (!text) return '';
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}

module.exports = EmailSender;
