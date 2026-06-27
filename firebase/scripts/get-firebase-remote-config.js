const { execSync } = require('child_process');
const fs = require('fs');

try {
  // Fetch remote config as JSON
  const output = execSync('npx firebase remoteconfig:get --json --project default', { encoding: 'utf-8' });
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
  fs.writeFileSync('remote-config-defaults.json', JSON.stringify(defaults, null, 2), 'utf-8');
  console.log('Successfully wrote remote-config-defaults.json');
} catch (error) {
  console.error('Error fetching or parsing remote config:', error.message);
  process.exit(1);
}
