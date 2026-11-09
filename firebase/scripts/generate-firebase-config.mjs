import { exec } from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

const execAsync = promisify(exec);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const firebaseDir = path.resolve(__dirname, '..');
const projectRootDir = path.resolve(firebaseDir, '..');
const envPath = path.resolve(firebaseDir, '.env');
const outputPath = path.resolve(__dirname, '../../public/firebase.config.json');

/**
 * Fetches Firebase Web App SDK configuration dynamically using Firebase CLI.
 */
async function fetchSdkConfigViaCli(webAppName) {
  console.log(`Querying Firebase CLI for web app: "${webAppName}"...`);

  // List web apps to locate matching appId
  const { stdout: listStdout } = await execAsync('npx firebase apps:list WEB --json --project default', {
    cwd: projectRootDir,
  });

  const listResponse = JSON.parse(listStdout);
  const apps = listResponse?.result || [];
  const targetApp = apps.find((app) => app.displayName === webAppName);

  if (!targetApp) {
    const availableNames = apps.map((app) => `"${app.displayName}"`).join(', ');
    throw new Error(
      `Web app with displayName "${webAppName}" not found in project. Available web apps: [${availableNames || 'none'}]`,
    );
  }

  const { appId } = targetApp;
  console.log(`Found Web App "${webAppName}" with appId: ${appId}. Fetching SDK configuration...`);

  const { stdout: sdkStdout } = await execAsync(`npx firebase apps:sdkconfig WEB ${appId} --json --project default`, {
    cwd: projectRootDir,
  });

  const sdkResponse = JSON.parse(sdkStdout);
  const sdkConfig = sdkResponse?.result?.sdkConfig;

  if (!sdkConfig) {
    throw new Error(`Failed to retrieve SDK configuration for appId: ${appId}`);
  }

  return {
    apiKey: sdkConfig.apiKey,
    authDomain: sdkConfig.authDomain,
    projectId: sdkConfig.projectId,
    storageBucket: sdkConfig.storageBucket,
    messagingSenderId: sdkConfig.messagingSenderId,
    appId: sdkConfig.appId,
  };
}

try {
  let app;
  let recaptchaEnterpriseKey;
  let appCheckDebugToken = '';

  if (fs.existsSync(envPath)) {
    // 1. If .env exists: load it and use Firebase CLI
    process.loadEnvFile(envPath);
    console.log('Success: Loaded .env file');

    const webAppName = process.env.APP_FIREBASE_WEB_APP_NAME;
    if (!webAppName || webAppName.trim() === '' || webAppName.startsWith('<')) {
      throw new Error('Missing or placeholder value for APP_FIREBASE_WEB_APP_NAME in .env');
    }

    recaptchaEnterpriseKey = process.env.APP_FIREBASE_RECAPTCHA_ENTERPRISE_KEY;
    if (!recaptchaEnterpriseKey || recaptchaEnterpriseKey.trim() === '' || recaptchaEnterpriseKey.startsWith('<')) {
      throw new Error('Missing or placeholder value for APP_FIREBASE_RECAPTCHA_ENTERPRISE_KEY in .env');
    }

    appCheckDebugToken = process.env.APP_FIREBASE_APPCHECK_DEBUG_TOKEN || '';
    app = await fetchSdkConfigViaCli(webAppName);
  } else {
    // 2. Otherwise: read process.env variables configured in App Hosting
    console.log('Warning: .env file does not exist. Use process.env fallback');

    app = {
      apiKey: process.env.FIREBASE_API_KEY,
      authDomain: process.env.FIREBASE_AUTH_DOMAIN,
      projectId: process.env.FIREBASE_PROJECT_ID,
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.FIREBASE_APP_ID,
    };

    const missing = Object.entries(app)
      .filter((data) => !data[1] || data[1].startsWith('<'))
      .map(([key]) => key);

    if (missing.length > 0) {
      console.warn(`Warning: The following keys are missing or contain placeholder values: ${missing.join(', ')}`);
    }

    recaptchaEnterpriseKey =
      process.env.FIREBASE_RECAPTCHA_ENTERPRISE_KEY || process.env.APP_FIREBASE_RECAPTCHA_ENTERPRISE_KEY;
    if (!recaptchaEnterpriseKey) {
      console.warn('Warning: Recaptcha Enterprise key is missing');
    }

    appCheckDebugToken =
      process.env.FIREBASE_APPCHECK_DEBUG_TOKEN || process.env.APP_FIREBASE_APPCHECK_DEBUG_TOKEN || '';
  }

  const config = {
    app,
    recaptchaEnterpriseKey,
    appCheckDebugToken,
  };

  fs.writeFileSync(outputPath, `${JSON.stringify(config, null, 2)}\n`, 'utf-8');
  console.log(`Successfully generated ${outputPath}`);
} catch (error) {
  console.error('Error generating firebase.config.json:', error.message);
  process.exit(1);
}
