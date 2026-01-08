#!/usr/bin/env node

/**
 * Interactive setup script for Google OAuth
 * Usage: npm run setup
 */

require('dotenv').config();
const { google } = require('googleapis');
const fs = require('fs').promises;
const path = require('path');
const readline = require('readline');

const SCOPES = [
  'https://www.googleapis.com/auth/drive.readonly',
  'https://www.googleapis.com/auth/gmail.send'
];
const TOKEN_PATH = path.join(__dirname, 'token.json');
const CREDENTIALS_PATH = path.join(__dirname, 'credentials.json');

async function setup() {
  console.log('='.repeat(60));
  console.log('Meet Performance Reviewer - OAuth Setup');
  console.log('='.repeat(60));
  console.log();

  // Check if credentials.json exists
  try {
    await fs.access(CREDENTIALS_PATH);
  } catch (err) {
    console.error('❌ credentials.json not found!\n');
    console.log('Please follow these steps:\n');
    console.log('1. Go to: https://console.cloud.google.com/apis/credentials');
    console.log('2. Create a new project (or select existing)');
    console.log('3. Enable the following APIs:');
    console.log('   - Google Drive API');
    console.log('   - Gmail API');
    console.log('4. Create OAuth 2.0 Client ID (Desktop app)');
    console.log('5. Download the credentials JSON file');
    console.log('6. Rename it to credentials.json');
    console.log('7. Place it in this directory:');
    console.log(`   ${__dirname}\n`);
    process.exit(1);
  }

  console.log('✓ Found credentials.json\n');

  // Check if token already exists
  try {
    await fs.access(TOKEN_PATH);
    console.log('✓ Token already exists at:', TOKEN_PATH);
    console.log('\nYou are already authenticated!');
    console.log('Delete token.json if you want to re-authenticate.\n');
    process.exit(0);
  } catch (err) {
    // Token doesn't exist, continue with setup
  }

  // Load credentials
  const credentials = JSON.parse(await fs.readFile(CREDENTIALS_PATH, 'utf8'));
  const { client_secret, client_id, redirect_uris } = credentials.installed || credentials.web;

  const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0]
  );

  // Generate auth URL
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });

  console.log('Please authorize this app by visiting this URL:\n');
  console.log(authUrl);
  console.log();

  // Get authorization code from user
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question('Enter the authorization code from the browser: ', async (code) => {
    rl.close();

    try {
      const { tokens } = await oAuth2Client.getToken(code);
      await fs.writeFile(TOKEN_PATH, JSON.stringify(tokens, null, 2));

      console.log('\n✓ Token saved to:', TOKEN_PATH);
      console.log('✓ Setup complete!\n');
      console.log('You can now run:');
      console.log('  - npm run review   (run a review now)');
      console.log('  - npm start        (start scheduled reviews)\n');
    } catch (err) {
      console.error('\n❌ Error retrieving access token:', err.message);
      process.exit(1);
    }
  });
}

setup();
