const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const base = process.argv[2];
const head = process.argv[3];
const outFile = process.argv[4] || path.join(process.cwd(), `.superpowers/sdd/review-${base}..${head}.diff`);

if (!base || !head) {
  console.error("Usage: node generate_diff.js <base> <head> [out_file]");
  process.exit(1);
}

try {
  const commits = execSync(`git log --oneline ${base}..${head}`).toString();
  const stat = execSync(`git diff --stat ${base}..${head}`).toString();
  const diff = execSync(`git diff -U10 ${base}..${head}`).toString();

  const content = [
    `# Review package: ${base}..${head}`,
    '',
    '## Commits',
    commits,
    '',
    '## Files changed',
    stat,
    '',
    '## Diff',
    diff
  ].join('\n');

  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, content, 'utf8');
  console.log(`Wrote review package to ${outFile}`);
} catch (err) {
  console.error("Failed to generate diff:", err);
  process.exit(1);
}
