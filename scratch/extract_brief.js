const fs = require('fs');
const path = require('path');

const planFile = process.argv[2];
const taskNum = process.argv[3];
const outFile = process.argv[4] || path.join(process.cwd(), `.superpowers/sdd/task-${taskNum}-brief.md`);

if (!planFile || !taskNum) {
  console.error("Usage: node extract_brief.js <plan_file> <task_num> [out_file]");
  process.exit(1);
}

try {
  const content = fs.readFileSync(planFile, 'utf8');
  const lines = content.split(/\r?\n/);
  let inTask = false;
  let taskLines = [];
  let infence = false;

  for (const line of lines) {
    if (line.startsWith('```')) {
      infence = !infence;
    }
    if (!infence && /^#+[ \t]+Task[ \t]+[0-9]+/i.test(line)) {
      const match = line.match(/^#+[ \t]+Task[ \t]+([0-9]+)/i);
      if (match && match[1] === taskNum) {
        inTask = true;
      } else {
        inTask = false;
      }
    }
    if (inTask) {
      taskLines.push(line);
    }
  }

  if (taskLines.length === 0) {
    console.error(`Task ${taskNum} not found in ${planFile}`);
    process.exit(1);
  }

  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, taskLines.join('\n'), 'utf8');
  console.log(`Wrote task ${taskNum} brief to ${outFile}`);
} catch (err) {
  console.error("Error reading/writing files:", err);
  process.exit(1);
}
