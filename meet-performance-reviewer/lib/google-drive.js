const { google } = require('googleapis');
const fs = require('fs').promises;
const path = require('path');

class GoogleDriveService {
  constructor() {
    this.auth = null;
    this.drive = null;
  }

  async authenticate() {
    // Check if we have saved credentials
    const TOKEN_PATH = path.join(__dirname, '../token.json');
    const CREDENTIALS_PATH = path.join(__dirname, '../credentials.json');

    try {
      // Try to load credentials from file
      const credentials = JSON.parse(await fs.readFile(CREDENTIALS_PATH, 'utf8'));
      const { client_secret, client_id, redirect_uris } = credentials.installed || credentials.web;

      const oAuth2Client = new google.auth.OAuth2(
        client_id,
        client_secret,
        redirect_uris[0]
      );

      // Try to load token
      try {
        const token = JSON.parse(await fs.readFile(TOKEN_PATH, 'utf8'));
        oAuth2Client.setCredentials(token);
        this.auth = oAuth2Client;
      } catch (err) {
        // No token found, need to authorize
        return await this.getNewToken(oAuth2Client, TOKEN_PATH);
      }
    } catch (err) {
      throw new Error(
        'credentials.json not found. Please download it from Google Cloud Console.\n' +
        'Visit: https://console.cloud.google.com/apis/credentials\n' +
        'Create OAuth 2.0 Client ID and download the JSON file.'
      );
    }

    this.drive = google.drive({ version: 'v3', auth: this.auth });
  }

  async getNewToken(oAuth2Client, tokenPath) {
    const authUrl = oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: [
        'https://www.googleapis.com/auth/drive.readonly',
        'https://www.googleapis.com/auth/gmail.send'
      ],
    });

    console.log('Authorize this app by visiting this url:', authUrl);
    console.log('\nAfter authorization, you will get a code. Run this script again with the code.');

    throw new Error('Authorization required. Please visit the URL above.');
  }

  async saveToken(oAuth2Client, code) {
    const TOKEN_PATH = path.join(__dirname, '../token.json');
    const { tokens } = await oAuth2Client.getToken(code);
    oAuth2Client.setCredentials(tokens);
    await fs.writeFile(TOKEN_PATH, JSON.stringify(tokens));
    console.log('Token stored to', TOKEN_PATH);
    this.auth = oAuth2Client;
    this.drive = google.drive({ version: 'v3', auth: this.auth });
  }

  /**
   * Find Google Meet recordings with transcripts from the last N days
   * @param {number} days - Number of days to look back
   * @param {string} userEmail - Optional: filter by user email
   * @returns {Array} Array of meeting objects with transcript content
   */
  async getMeetingTranscripts(days = 7, userEmail = null) {
    if (!this.drive) {
      await this.authenticate();
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const startDateStr = startDate.toISOString();

    console.log(`Searching for Meet recordings modified since ${startDateStr}...`);

    // Search for Google Meet recordings folder or files
    // Meet recordings are typically stored in "Meet Recordings" folder
    // Transcripts have .vtt or .srt extension or are in a Google Doc

    const query = [
      `(name contains 'transcript' or name contains 'Transcript')`,
      `and modifiedTime > '${startDateStr}'`,
      `and (mimeType='text/vtt' or mimeType='text/srt' or mimeType='text/plain' or mimeType='application/vnd.google-apps.document')`
    ].join(' ');

    try {
      const response = await this.drive.files.list({
        q: query,
        fields: 'files(id, name, mimeType, modifiedTime, webViewLink, parents)',
        orderBy: 'modifiedTime desc',
        pageSize: 50,
      });

      const files = response.data.files || [];
      console.log(`Found ${files.length} potential transcript files`);

      const transcripts = [];

      for (const file of files) {
        try {
          const content = await this.getFileContent(file);

          // Try to extract meeting title from filename
          const meetingTitle = this.extractMeetingTitle(file.name);

          transcripts.push({
            id: file.id,
            name: file.name,
            meetingTitle: meetingTitle,
            modifiedTime: file.modifiedTime,
            webViewLink: file.webViewLink,
            content: content,
            wordCount: content.split(/\s+/).length
          });

          console.log(`✓ Loaded transcript: ${file.name} (${transcripts[transcripts.length - 1].wordCount} words)`);
        } catch (err) {
          console.error(`✗ Failed to load ${file.name}:`, err.message);
        }
      }

      return transcripts;
    } catch (err) {
      console.error('Error searching Drive:', err);
      throw err;
    }
  }

  async getFileContent(file) {
    if (file.mimeType === 'application/vnd.google-apps.document') {
      // Export Google Doc as plain text
      const response = await this.drive.files.export({
        fileId: file.id,
        mimeType: 'text/plain',
      });
      return response.data;
    } else {
      // Download regular file
      const response = await this.drive.files.get({
        fileId: file.id,
        alt: 'media',
      });
      return response.data;
    }
  }

  extractMeetingTitle(filename) {
    // Remove common suffixes and extract meeting title
    // Examples:
    // "Team Standup - transcript.txt" -> "Team Standup"
    // "2024-01-08 All Hands Transcript.vtt" -> "All Hands"

    let title = filename
      .replace(/\.(vtt|srt|txt|doc)$/i, '')
      .replace(/\s*-?\s*transcript\s*/i, '')
      .replace(/^\d{4}-\d{2}-\d{2}\s*/, '') // Remove leading dates
      .trim();

    return title || filename;
  }
}

module.exports = GoogleDriveService;
