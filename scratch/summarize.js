import fs from 'fs';

const raw = fs.readFileSync('frontend_findings_current.json');
let content = '';
if (raw[0] === 0xff && raw[1] === 0xfe) {
  content = raw.toString('utf16le');
} else if (raw[0] === 0xef && raw[1] === 0xbb && raw[2] === 0xbf) {
  content = raw.toString('utf8').slice(1);
} else {
  content = raw.toString('utf8');
}
content = content.trim().replace(/^\uFEFF/, '').replace(/^\uFFFE/, '');

const data = JSON.parse(content);
const activeData = data.filter(item => !item.file.endsWith('index.css'));

console.log('ACTIVE FINDINGS COUNT:', activeData.length);

const antipatterns = {};
const severity = {};
const fileCounts = {};

activeData.forEach(item => {
  antipatterns[item.antipattern] = (antipatterns[item.antipattern] || 0) + 1;
  severity[item.severity] = (severity[item.severity] || 0) + 1;
  const shortPath = item.file.replace(/.*NEETBANBV2[\\/]/, '');
  fileCounts[shortPath] = (fileCounts[shortPath] || 0) + 1;
});

console.log('\n--- ACTIVE BY ANTIPATTERN ---');
console.log(JSON.stringify(antipatterns, null, 2));

console.log('\n--- ACTIVE BY SEVERITY ---');
console.log(JSON.stringify(severity, null, 2));

console.log('\n--- ACTIVE BY FILE ---');
console.log(JSON.stringify(fileCounts, null, 2));

console.log('\n--- ALL ACTIVE WARNINGS ---');
activeData.filter(d => d.severity === 'warning').forEach((w, i) => {
  const shortPath = w.file.replace(/.*NEETBANBV2[\\/]/, '');
  console.log(`[${i+1}] ${w.antipattern} (${w.severity}) in ${shortPath}:${w.line}`);
  console.log(`    Name: ${w.name}`);
  console.log(`    Snippet: ${w.snippet}`);
  console.log(`    Description: ${w.description}`);
});

console.log('\n--- SAMPLE ACTIVE ADVISORIES ---');
activeData.filter(d => d.severity === 'advisory').slice(0, 10).forEach((w, i) => {
  const shortPath = w.file.replace(/.*NEETBANBV2[\\/]/, '');
  console.log(`[${i+1}] ${w.antipattern} in ${shortPath}:${w.line}`);
  console.log(`    Snippet: ${w.snippet}`);
});
