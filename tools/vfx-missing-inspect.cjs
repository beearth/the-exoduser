const fs = require('node:fs');
for (const arg of process.argv.slice(2)) {
  const [path, start, end] = arg.split('@');
  try {
    const lines = fs.readFileSync(path, 'utf8').split(/\r?\n/);
    const a = start ? Number(start) : 1, b = end ? Number(end) : lines.length;
    console.log(`FILE ${path} (${a}-${Math.min(b,lines.length)})`);
    console.log(lines.slice(a-1,b).map((s,i)=>`${a+i}: ${s}`).join('\n'));
  } catch(e) { console.log(`${path}: ${e.message}`); }
}
