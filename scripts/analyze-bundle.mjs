import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const STATS_FILE = path.join(rootDir, 'dist', 'ng-firebase-image-analyzer', 'browser-stats.json');
const SRC_DIR = path.join(rootDir, 'src');

/**
 * Checks if any file in src/ has an mtimeMs greater than the given timestamp.
 */
function isStatsStale(statsMtimeMs) {
  if (!fs.existsSync(SRC_DIR)) {
    return false;
  }

  const entries = fs.readdirSync(SRC_DIR, {
    recursive: true,
    withFileTypes: true,
  });

  for (const entry of entries) {
    if (entry.isFile()) {
      const parent = entry.parentPath || entry.path;
      const fullPath = path.join(parent, entry.name);
      try {
        const fileStat = fs.statSync(fullPath);
        if (fileStat.mtimeMs > statsMtimeMs) {
          return true;
        }
      } catch {
        // Ignore unreadable or transient files
      }
    }
  }

  return false;
}

/**
 * Formats bytes into a human-readable KB or B string.
 */
function formatBytes(bytes) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  return `${(bytes / 1024).toFixed(2)} KB`;
}

/**
 * Categorizes dependencies located inside node_modules/.
 */
function categorizeNodeModule(inputPath) {
  if (inputPath.includes('@angular/')) {
    const match = inputPath.match(/@angular\/([^/]+)/);
    return match ? `@angular/${match[1]}` : '@angular/core';
  }
  if (inputPath.includes('firebase') || inputPath.includes('remote-config')) {
    return 'firebase';
  }
  if (inputPath.includes('rxjs')) {
    return 'rxjs';
  }
  if (inputPath.includes('tslib')) {
    return 'tslib';
  }
  const match = inputPath.match(/node_modules\/((?:@[^/]+\/)?[^/]+)/);
  return match ? match[1] : 'other/node_modules';
}

/**
 * Categorizes an input path into a high-level group.
 */
function categorizeInput(inputPath) {
  if (inputPath.startsWith('node_modules/')) {
    return categorizeNodeModule(inputPath);
  }
  if (inputPath.includes('firebase.config') || inputPath.includes('remote-config')) {
    return 'firebase';
  }
  const appFolderMatch = inputPath.match(/^src\/app\/([^/]+)\//);
  if (appFolderMatch) {
    return `app/${appFolderMatch[1]}`;
  }
  if (inputPath.startsWith('src/app/')) {
    return 'app/root';
  }
  if (inputPath.startsWith('src/')) {
    return 'app/main';
  }
  return 'other';
}

/**
 * Ensures browser-stats.json is available and fresh.
 * Triggers npm run build if missing, stale, or forced via --rebuild.
 */
function ensureFreshStats(forceRebuild) {
  let shouldBuild = forceRebuild;
  let reason = 'Forced rebuild requested (--rebuild).';

  if (!shouldBuild) {
    if (!fs.existsSync(STATS_FILE)) {
      shouldBuild = true;
      reason = 'browser-stats.json is missing.';
    } else {
      const statsMtime = fs.statSync(STATS_FILE).mtimeMs;
      if (isStatsStale(statsMtime)) {
        shouldBuild = true;
        reason = 'Source files in src/ are newer than browser-stats.json.';
      }
    }
  }

  if (shouldBuild) {
    console.log(`\n[analyze-bundle] ${reason}`);
    console.log('[analyze-bundle] Executing "npm run build:stats" to generate fresh stats...\n');
    try {
      execSync('npm run build:stats', {
        cwd: rootDir,
        stdio: 'inherit',
        env: process.env,
      });
    } catch (error) {
      console.error('\n[analyze-bundle] Build failed:', error.message);
      process.exit(1);
    }
  }
}

function loadStats() {
  if (!fs.existsSync(STATS_FILE)) {
    console.error(`\n[analyze-bundle] Error: Stats file not found at ${STATS_FILE}`);
    process.exit(1);
  }

  try {
    const raw = fs.readFileSync(STATS_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (error) {
    console.error('\n[analyze-bundle] Error parsing stats JSON:', error.message);
    process.exit(1);
  }
}

const CHUNK_DISPLAY_LIMIT = 8;
const defaultGetBytes = ([, val]) => (typeof val === 'number' ? val : (val.bytes ?? val.bytesInOutput));

/**
 * Generic helper to print top items with a remainder summary.
 */
function printLimitedList({ items, label, getBytes = defaultGetBytes, formatRow, unitName = 'chunks' }) {
  if (items.length === 0) {
    return;
  }

  if (label) {
    console.log(`\n[${label}]`);
  }

  const totalBytes = items.reduce((sum, item) => sum + getBytes(item), 0);
  const topItems = items.slice(0, CHUNK_DISPLAY_LIMIT);

  for (const item of topItems) {
    const bytes = getBytes(item);
    console.log(formatRow(item, bytes, totalBytes));
  }

  if (items.length > CHUNK_DISPLAY_LIMIT) {
    const remaining = items.slice(CHUNK_DISPLAY_LIMIT);
    const remBytes = remaining.reduce((sum, item) => sum + getBytes(item), 0);
    console.log(`  ... and ${remaining.length} smaller ${unitName} (${formatBytes(remBytes)} total)`);
  }
}

function printChunkList(chunks, label) {
  printLimitedList({
    items: chunks,
    label,
    formatRow: ([name], bytes) => {
      const sizeStr = formatBytes(bytes).padStart(10);
      const rawStr = `(${bytes.toLocaleString()} bytes)`.padStart(18);
      return `  ${sizeStr}  ${rawStr}  ${name}`;
    },
  });
}

function printOutputChunks(outputEntries) {
  console.log('\n======================================================');
  console.log('               BUNDLE ANALYSIS REPORT                 ');
  console.log('======================================================\n');
  console.log('--- Output Chunks (Sorted by Size) ---');

  const sortedOutputs = [...outputEntries].sort((a, b) => b[1].bytes - a[1].bytes);
  const jsChunks = sortedOutputs.filter(([name]) => name.endsWith('.js'));
  const cssChunks = sortedOutputs.filter(([name]) => name.endsWith('.css'));

  printChunkList(jsChunks, 'JavaScript Chunks');
  printChunkList(cssChunks, 'CSS Chunks');
}

function formatPercentageRow([name], bytes, total) {
  const sizeStr = formatBytes(bytes).padStart(10);
  const pct = ((bytes / total) * 100).toFixed(1).padStart(5);
  return `  ${sizeStr}  (${pct}%)  ${name}`;
}

function printMainTopInputs(mainName, mainBytes, sortedInputs) {
  console.log('\n------------------------------------------------------');
  console.log(`Main Bundle Breakdown: ${mainName} (${formatBytes(mainBytes)} / ${mainBytes.toLocaleString()} bytes)`);
  console.log('------------------------------------------------------');

  printLimitedList({
    items: sortedInputs,
    label: 'Top Input Contributors in Main',
    unitName: 'inputs',
    formatRow: formatPercentageRow,
  });
}

function printGroupedBreakdown(sortedInputs) {
  const groups = new Map();
  for (const [inputPath, val] of sortedInputs) {
    const groupName = categorizeInput(inputPath);
    const current = groups.get(groupName) || 0;
    groups.set(groupName, current + val.bytesInOutput);
  }

  const sortedGroups = [...groups.entries()].sort((a, b) => b[1] - a[1]);

  printLimitedList({
    items: sortedGroups,
    label: 'Grouped Package Breakdown in Main',
    unitName: 'packages',
    formatRow: formatPercentageRow,
  });
}

const LEAK_RULES = [
  {
    pattern: '@firebase/ai',
    type: 'Firebase AI SDK (@firebase/ai)',
    advice: 'Move inference logic behind lazy-loaded feature boundaries or defer loading.',
  },
  {
    pattern: 'jsonrepair',
    type: 'JSON Repair Utility (jsonrepair)',
    advice: 'Ensure jsonrepair is only imported in features/services that parse AI outputs.',
  },
  {
    pattern: 'snarkdown',
    type: 'Snarkdown',
    advice: 'Ensure snarkdown is only imported in features/services that generates markdown output.',
  },
  {
    pattern: 'dompurify',
    type: 'DOM Purify Utility (dompurify)',
    advice: 'Ensure dompurify is only imported in features/services that generate markdown output.',
  },
  {
    type: 'Feature Component in Main',
    matcher: (path) => path.includes('src/app/features/') && !path.includes('src/app/features/home/'),
    advice: 'Secondary feature components should be lazy loaded via loadComponent: () => import(...) in app.routes.ts.',
  },
];

function detectLeakedDependencies(inputEntries) {
  const leakedDependencies = [];

  for (const [inputPath, val] of inputEntries) {
    if (val.bytesInOutput <= 0) {
      continue;
    }

    const matchedRule = LEAK_RULES.find((rule) =>
      rule.matcher ? rule.matcher(inputPath) : inputPath.includes(rule.pattern),
    );

    if (matchedRule) {
      leakedDependencies.push({
        type: matchedRule.type,
        path: inputPath,
        bytes: val.bytesInOutput,
        advice: matchedRule.advice,
      });
    }
  }

  return leakedDependencies;
}

function printLeakAudit(inputEntries) {
  console.log('\n------------------------------------------------------');
  console.log('Leak Detection Audit (Informative)');
  console.log('------------------------------------------------------');

  const leakedDependencies = detectLeakedDependencies(inputEntries);

  if (leakedDependencies.length === 0) {
    console.log('  No leaked heavy dependencies or feature modules detected in main chunk.');
  } else {
    console.log('  [!] Potential barrel or feature leak detected in main bundle:');
    for (const leak of leakedDependencies) {
      console.log(`\n  * ${leak.type}:`);
      console.log(`    File:   ${leak.path} (${formatBytes(leak.bytes)})`);
      console.log(`    Advice: ${leak.advice}`);
    }
    console.log('\n  Note: These warnings are informative and do not fail the build.');
  }

  console.log('\n======================================================\n');
}

function analyze() {
  const args = process.argv.slice(2);
  const forceRebuild = args.includes('--rebuild') || args.includes('-r');

  ensureFreshStats(forceRebuild);

  const stats = loadStats();
  const outputEntries = Object.entries(stats.outputs || {});

  printOutputChunks(outputEntries);

  const mainEntry = outputEntries.find(([name]) => name.startsWith('main-') && name.endsWith('.js'));
  if (!mainEntry) {
    console.log('\n[analyze-bundle] Notice: No main-*.js bundle found in outputs.');
    return;
  }

  const [mainName, mainData] = mainEntry;
  const inputEntries = Object.entries(mainData.inputs || {});
  const sortedInputs = inputEntries
    .filter(([, val]) => val.bytesInOutput > 0)
    .sort((a, b) => b[1].bytesInOutput - a[1].bytesInOutput);

  printMainTopInputs(mainName, mainData.bytes, sortedInputs);
  printGroupedBreakdown(sortedInputs);
  printLeakAudit(inputEntries);
}

analyze();
