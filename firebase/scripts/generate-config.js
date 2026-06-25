const fs = require('fs');
const path = require('path');

try {
  const envPath = path.resolve(__dirname, '../.env');
  process.loadEnvFile(envPath);

  const config = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID,
  };

  // Basic validation to check if all keys are filled
  const missing = Object.entries(config)
    .filter(([_, val]) => !val || val.startsWith('<'))
    .map(([key]) => key);

  if (missing.length > 0) {
    console.warn(`Warning: The following keys are missing or contain placeholder values: ${missing.join(', ')}`);
  }

  const outputPath = path.resolve(__dirname, '../firebase.config.json');
  fs.writeFileSync(outputPath, JSON.stringify(config, null, 2), 'utf-8');
  console.log('Successfully generated firebase.config.json from .env');
} catch (error) {
  console.error('Error generating firebase.config.json:', error.message);
  process.exit(1);
}
