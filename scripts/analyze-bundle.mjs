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
  const isPostbuild = process.env.npm_lifecycle_event === 'postbuild';
  const isAnalyzing = process.env.ANALYZING_BUNDLE === '1';

  // In postbuild or recursive analysis, skip rebuild checks to prevent infinite loops
  if (isPostbuild || isAnalyzing) {
    return;
  }

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
    console.log('[analyze-bundle] Executing "npm run build" to generate fresh stats...\n');
    try {
      execSync('npm run build', {
        cwd: rootDir,
        stdio: 'inherit',
        env: {
          ...process.env,
          ANALYZING_BUNDLE: '1',
        },
      });
      // The child 'npm run build' will invoke the 'postbuild' lifecycle hook which
      // automatically runs this script. We can terminate cleanly here.
      process.exit(0);
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

function printChunkList(chunks, label, nameWidth) {
  if (chunks.length === 0) {
    return;
  }

  console.log(`\n[${label}]`);
  const topChunks = chunks.slice(0, CHUNK_DISPLAY_LIMIT);
  for (const [name, data] of topChunks) {
    const sizeStr = formatBytes(data.bytes).padStart(10);
    const rawStr = `(${data.bytes.toLocaleString()} bytes)`.padStart(18);
    console.log(`  ${name.padEnd(nameWidth)} ${sizeStr} ${rawStr}`);
  }

  if (chunks.length > CHUNK_DISPLAY_LIMIT) {
    const remaining = chunks.slice(CHUNK_DISPLAY_LIMIT);
    const remainingBytes = remaining.reduce((sum, [, d]) => sum + d.bytes, 0);
    const count = remaining.length;
    console.log(`  ... and ${count} smaller chunks (${formatBytes(remainingBytes)} total)`);
  }
}

function printOutputChunks(outputEntries) {
  console.log('\n======================================================');
  console.log('               BUNDLE ANALYSIS REPORT                 ');
  console.log('======================================================\n');
  console.log('--- Output Chunks (Sorted by Size) ---');

  const sortedOutputs = [...outputEntries].sort((a, b) => b[1].bytes - a[1].bytes);
  const jsChunks = sortedOutputs.filter(([name]) => name.endsWith('.js'));
  const cssChunks = sortedOutputs.filter(([name]) => name.endsWith('.css'));

  printChunkList(jsChunks, 'JavaScript Chunks', 30);
  printChunkList(cssChunks, 'CSS Chunks', 45);
}

function printMainTopInputs(mainName, mainBytes, sortedInputs) {
  console.log('\n------------------------------------------------------');
  console.log(`Main Bundle Breakdown: ${mainName} (${formatBytes(mainBytes)} / ${mainBytes.toLocaleString()} bytes)`);
  console.log('------------------------------------------------------');

  console.log('\n[Top Input Contributors in Main]');
  const topChunks = sortedInputs.slice(0, CHUNK_DISPLAY_LIMIT);
  for (const [inputPath, val] of topChunks) {
    const bytes = val.bytesInOutput;
    const pct = ((bytes / mainBytes) * 100).toFixed(1);
    const sizeStr = formatBytes(bytes).padStart(10);
    console.log(`  ${sizeStr} (${pct.padStart(4)}%)  ${inputPath}`);
  }

  if (sortedInputs.length > CHUNK_DISPLAY_LIMIT) {
    const remaining = sortedInputs.slice(CHUNK_DISPLAY_LIMIT);
    const remainingBytes = remaining.reduce((sum, [, d]) => sum + d.bytesInOutput, 0);
    const count = remaining.length;
    console.log(`  ... and ${count} smaller chunks (${formatBytes(remainingBytes)} total)`);
  }
}

function printGroupedBreakdown(mainBytes, sortedInputs) {
  console.log('\n[Grouped Package Breakdown in Main]');
  const groups = new Map();
  for (const [inputPath, val] of sortedInputs) {
    const groupName = categorizeInput(inputPath);
    const current = groups.get(groupName) || 0;
    groups.set(groupName, current + val.bytesInOutput);
  }

  const sortedGroups = [...groups.entries()].sort((a, b) => b[1] - a[1]);
  const topChunks = sortedGroups.slice(0, CHUNK_DISPLAY_LIMIT);
  for (const [groupName, groupBytes] of topChunks) {
    const pct = ((groupBytes / mainBytes) * 100).toFixed(1);
    const sizeStr = formatBytes(groupBytes).padStart(10);
    console.log(`  ${groupName.padEnd(25)} ${sizeStr} (${pct.padStart(4)}%)`);
  }

  if (sortedGroups.length > CHUNK_DISPLAY_LIMIT) {
    const remaining = sortedGroups.slice(CHUNK_DISPLAY_LIMIT);
    const remainingBytes = remaining.reduce((sum, [, groupBytes]) => sum + groupBytes, 0);
    const count = remaining.length;
    console.log(`  ... and ${count} smaller chunks (${formatBytes(remainingBytes)} total)`);
  }
}

function detectLeakedDependencies(inputEntries) {
  const leakedDependencies = [];

  for (const [inputPath, val] of inputEntries) {
    if (val.bytesInOutput <= 0) {
      continue;
    }

    if (inputPath.includes('@firebase/ai')) {
      leakedDependencies.push({
        type: 'Firebase AI SDK (@firebase/ai)',
        path: inputPath,
        bytes: val.bytesInOutput,
        advice: 'Move inference logic behind lazy-loaded feature boundaries or defer loading.',
      });
    } else if (inputPath.includes('jsonrepair')) {
      leakedDependencies.push({
        type: 'JSON Repair Utility (jsonrepair)',
        path: inputPath,
        bytes: val.bytesInOutput,
        advice: 'Ensure jsonrepair is only imported in features/services that parse AI outputs.',
      });
    } else if (inputPath.includes('src/app/features/') && !inputPath.includes('src/app/features/home/')) {
      leakedDependencies.push({
        type: 'Feature Component in Main',
        path: inputPath,
        bytes: val.bytesInOutput,
        advice:
          'Secondary feature components should be lazy loaded via loadComponent: () => import(...) in app.routes.ts.',
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
  printGroupedBreakdown(mainData.bytes, sortedInputs);
  printLeakAudit(inputEntries);
}

analyze();
