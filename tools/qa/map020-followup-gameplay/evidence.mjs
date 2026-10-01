import { writeFileSync, mkdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { sources, files, expression, sha } from './source.mjs';

const out = process.argv[2];
if (!out || !path.isAbsolute(out)) throw new Error('Absolute evidence output directory required');
mkdirSync(out, { recursive: true });
const audit = [];
for (const file of files) {
  const source = sources[file], { node } = expression(source, 'function updateE(');
  const windupAssignments = [];
  function walk(n, conditions = [], cases = []) {
    if (!n || typeof n !== 'object') return;
    if (n.type === 'AssignmentExpression' && source.slice(n.left.start, n.left.end) === 'e.s' && n.right.value === 'windup')
      windupAssignments.push({ line: source.slice(0, n.start).split('\n').length,
        assignment: source.slice(n.start, n.end), conditions, cases });
    for (const [key, value] of Object.entries(n)) {
      let next = conditions, nextCases = cases;
      if (n.type === 'IfStatement' && ['consequent', 'alternate'].includes(key))
        next = [...conditions, (key === 'alternate' ? 'NOT ' : '') + source.slice(n.test.start, n.test.end)];
      if (n.type === 'SwitchCase' && key === 'consequent')
        nextCases = [...cases, n.test ? source.slice(n.test.start, n.test.end) : 'default'];
      if (Array.isArray(value)) value.forEach(child => walk(child, next, nextCases));
      else if (value && typeof value === 'object') walk(value, next, nextCases);
    }
  }
  walk(node);
  audit.push({ file, sha256: sha(source), windupAssignments,
    note: 'All updateE windup assignments were walked; conditions are source text, not an exhaustive symbolic path proof.' });
}
writeFileSync(path.join(out, 'enemy-state-paths.json'), JSON.stringify(audit, null, 2) + '\n');
writeFileSync(path.join(out, 'source-manifest.json'), JSON.stringify({
  observedAt: new Date().toISOString(), node: process.version,
  head: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
  sources: Object.fromEntries(files.map(file => [file, sha(sources[file])])),
  productionWrites: 0, browserRuns: 0, newAgents: 0
}, null, 2) + '\n');
console.log(JSON.stringify(audit.map(a => ({ file: a.file, windupAssignments: a.windupAssignments.length,
  paths: a.windupAssignments.map(p => ({ line: p.line, conditions: p.conditions, cases: p.cases })) })), null, 2));
