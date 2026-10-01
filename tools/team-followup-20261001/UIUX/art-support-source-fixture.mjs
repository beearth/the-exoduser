import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { parseExpressionAt } from 'acorn';

export const source = fs.readFileSync(new URL('../../../game.html', import.meta.url), 'utf8');
export const hash = value => createHash('sha256').update(value).digest('hex');
function expressionAfter(anchor) {
  const start = source.indexOf(anchor);
  assert.ok(start >= 0, anchor);
  const offset = start + anchor.length;
  return source.slice(offset, parseExpressionAt(source, offset, { ecmaVersion: 'latest' }).end);
}
const lineOffset = source.indexOf("{id:'wa24'");
assert.ok(lineOffset >= 0);
const parsedLine = parseExpressionAt(source, lineOffset, { ecmaVersion: 'latest' });
const lineNode = parsedLine.type === 'SequenceExpression' ? parsedLine.expressions[0] : parsedLine;
assert.equal(lineNode.type, 'ObjectExpression');
export const lineSource = source.slice(lineOffset, lineNode.end);
export const line = vm.runInNewContext(`(${lineSource})`);
const shakeOffset = source.indexOf('function _cutShake(');
assert.ok(shakeOffset >= 0);
const shakeSource = source.slice(shakeOffset, parseExpressionAt(source, shakeOffset, { ecmaVersion: 'latest' }).end);
const letterboxOffset = source.indexOf('  const _maxAR=16/9;');
const letterboxEnd = source.indexOf('  // 검은 배경', letterboxOffset);
assert.ok(letterboxOffset >= 0 && letterboxEnd > letterboxOffset);
const letterboxSource = source.slice(letterboxOffset, letterboxEnd);
const clipSource = 'cx.save();cx.beginPath();cx.rect(_lbX,_lbY,cw,ch);cx.clip();cx.translate(_lbX,_lbY);';
assert.ok(source.includes(clipSource));
const drawOffset = source.indexOf('      // 카메라 트랜스폼');
const drawEnd = source.indexOf('      cx.restore();', drawOffset);
assert.ok(drawOffset >= 0 && drawEnd > drawOffset);
export const drawSource = source.slice(drawOffset, drawEnd);
const vmSource = `const _ease=${expressionAfter('const _ease=')};\n${shakeSource}\nconst ln=${lineSource};\n${letterboxSource}\n${clipSource}\n${drawSource}`;
export const sourceEvidence = {
  sourceSha256: hash(source), drawSha256: hash(drawSource), executableSha256: hash(vmSource),
  lineSource, letterboxSource, clipSource, drawSource, shakeSource,
  easeSource: expressionAfter('const _ease='),
  drawStartLine: source.slice(0, drawOffset).split('\n').length
};

export function actualDraw(fullW, fullH, lineElapsed, now = lineElapsed) {
  let matrix = [1, 0, 0, 1, 0, 0];
  let path, clip, drawRect;
  const operations = [];
  const cx = {
    save() { operations.push('save'); },
    beginPath() { operations.push('beginPath'); },
    rect(x, y, w, h) { path = { x, y, w, h }; operations.push('rect'); },
    clip() { clip = { ...path }; operations.push('clip'); },
    translate(x, y) {
      const [scaleX, skewY, skewX, scaleY, translateX, translateY] = matrix;
      matrix = [scaleX, skewY, skewX, scaleY, translateX + scaleX * x + skewX * y, translateY + skewY * x + scaleY * y];
      operations.push('translate');
    },
    scale(x, y) {
      matrix = [matrix[0] * x, matrix[1] * x, matrix[2] * y, matrix[3] * y, matrix[4], matrix[5]];
      operations.push('scale');
    },
    drawImage(img, x, y, w, h) {
      drawRect = { x: matrix[4] + matrix[0] * x, y: matrix[5] + matrix[3] * y, w: matrix[0] * w, h: matrix[3] * h };
      operations.push('drawImage');
    }
  };
  vm.runInNewContext(vmSource, { cx, _fullW: fullW, _fullH: fullH, lineElapsed, now, img: { naturalWidth: 2560, naturalHeight: 1440 } });
  const fractions = {
    left: Math.max(0, clip.x - drawRect.x) / drawRect.w,
    right: Math.max(0, drawRect.x + drawRect.w - clip.x - clip.w) / drawRect.w,
    top: Math.max(0, clip.y - drawRect.y) / drawRect.h,
    bottom: Math.max(0, drawRect.y + drawRect.h - clip.y - clip.h) / drawRect.h
  };
  return { matrix, clip, drawRect, fractions, operations };
}
