import process from 'node:process';
import { generateFirebaseConfig } from './generate-firebase-config.mjs';
import { fetchRemoteConfigDefaults } from './get-firebase-remote-config.mjs';

try {
  console.log('Starting prebuild pipeline...');

  // 1. Run the first program
  console.log('Fetching Remote Config...');
  fetchRemoteConfigDefaults();

  // 2. Run the second program
  console.log('Generating Firebase App Config...');
  generateFirebaseConfig();

  console.log('All prebuild tasks completed.');
} catch (error) {
  console.error('Prebuild failed during execution.', error);
  // Exit with status 1 to tell Firebase App Hosting that the build failed
  process.exit(1);
}
