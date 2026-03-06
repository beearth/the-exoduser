const fs = require('fs');
const path = './tilemap-editor-src.html';
const src = fs.readFileSync(path, 'utf8');
const start = src.indexOf('function _tCarveCross');
const end = src.indexOf('function _tCarveCorridor');
if (start < 0 || end < 0 || end <= start) {
  throw new Error('Could not locate _tCarveCross');
}
const fnCode = src.slice(start, end);
// eslint-disable-next-line no-eval
eval(fnCode);

const mw = 41, mh = 41;
const map = Array.from({length: mh}, () => Array.from({length: mw}, () => 1));
const cx = 20, cy = 20, rx = 10, ry = 8, armW = 3, armH = 2;
_tCarveCross(map, mw, mh, cx, cy, rx, ry, armW, armH);

const top = map[cy - ry][cx];
const bottom = map[cy + ry][cx];
const left = map[cy][cx - rx];
const right = map[cy][cx + rx];

if (left !== 0 || right !== 0) {
  throw new Error('Horizontal arm not carved');
}
if (top !== 0 || bottom !== 0) {
  throw new Error('Vertical arm not carved (bug reproduced)');
}
console.log('PASS');

