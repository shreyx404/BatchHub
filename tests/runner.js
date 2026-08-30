import { run } from 'node:test';
import { spec } from 'node:test/reporters';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('====================================================');
console.log('🚀 Running BatchHub Comprehensive Automated Test Suite');
console.log('====================================================\n');

const testFiles = [
  path.join(__dirname, 'unit/fingerprint.test.js'),
  path.join(__dirname, 'unit/api.test.js'),
  path.join(__dirname, 'security/admin-api.test.js'),
  path.join(__dirname, 'security/cron-auto-archive.test.js'),
  path.join(__dirname, 'security/discord.test.js'),
];

const stream = run({
  files: testFiles,
  concurrency: 1,
});

stream.compose(new spec()).pipe(process.stdout);

stream.on('test:fail', () => {
  process.exitCode = 1;
});
