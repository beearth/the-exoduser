import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { parseExpressionAt } from 'acorn';

export const files = ['game.html', 'game-easy-test.html'];
export const sources = Object.fromEntries(files.map(file => [file, readFileSync(new URL('../../../' + file, import.meta.url), 'utf8')]));
export const sha = text => createHash('sha256').update(text).digest('hex');
export function between(source, start, end, label = start) {
  const a = source.indexOf(start), b = source.indexOf(end, a + start.length);
  assert.ok(a >= 0 && b > a, `ANCHOR_FAIL ${label}`);
  return source.slice(a, b);
}
export function expression(source, anchor) {
  const start = source.indexOf(anchor);
  assert.ok(start >= 0, `ANCHOR_FAIL ${anchor}`);
  const node = parseExpressionAt(source, start, { ecmaVersion: 'latest' });
  return { code: source.slice(node.start, node.end), node,
    line: source.slice(0, start).split('\n').length };
}
export function functionSource(source, name) { return expression(source, `function ${name}(`).code; }
export function evaluate(code, bindings) { return new Function(...Object.keys(bindings), code)(...Object.values(bindings)); }
export const noop = () => {};
export const dst = (x, y, x2, y2) => Math.hypot(x2 - x, y2 - y);
