import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const rootDir = path.resolve(import.meta.dirname, '../..');

export function fetchRemoteConfigDefaults() {
  // Fetch remote config as JSON
  const output = execSync('npx firebase remoteconfig:get --json --project default', {
    encoding: 'utf-8',
    cwd: rootDir,
  });
  const config = JSON.parse(output);
  const parameters = config?.result?.parameters;

  // Extract default values from parameters
  const defaults = {};
  if (parameters) {
    for (const [key, paramObj] of Object.entries(parameters)) {
      if (paramObj.defaultValue && paramObj.defaultValue.value !== undefined) {
        defaults[key] = paramObj.defaultValue.value;
      }
    }
  }

  // Write to JSON file
  const outputPath = path.join(rootDir, 'public', 'remote-config-defaults.json');
  fs.writeFileSync(outputPath, `${JSON.stringify(defaults, null, 2)}\n`, 'utf-8');
  console.log(`Successfully wrote ${outputPath}`);
}

if (process.argv[1] === import.meta.filename) {
  try {
    fetchRemoteConfigDefaults();
  } catch (error) {
    console.error('Error fetching or parsing remote config:', error.message);
    process.exit(1);
  }
}
