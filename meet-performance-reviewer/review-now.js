#!/usr/bin/env node

/**
 * Manual review script - runs a review immediately without waiting for schedule
 * Usage: npm run review
 */

require('dotenv').config();
const MeetPerformanceReviewer = require('./index');

async function main() {
  const reviewer = new MeetPerformanceReviewer();

  try {
    await reviewer.runReview();
  } catch (err) {
    console.error('\nReview failed:', err.message);
    process.exit(1);
  }
}

main();
