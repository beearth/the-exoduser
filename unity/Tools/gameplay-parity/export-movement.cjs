// 현재 웹 원문에 있는 이동 식을 실행한다. 기대 이동량을 별도로 옮겨 적지 않는다.
const fs = require('node:fs');
const vm = require('node:vm');
const crypto = require('node:crypto');
const arg = key => { const i = process.argv.indexOf(key); if (i < 0 || !process.argv[i + 1]) throw Error(key + ' 인자가 필요합니다.'); return process.argv[i + 1]; };
const source = fs.readFileSync(arg('--source'), 'utf8');
function expression(pattern) {
  const match = source.match(pattern);
  if (!match) throw Error('원본 이동 식을 찾을 수 없습니다: ' + pattern);
  return match[0];
}
const walking = expression(/const ms=\(P\.speed\+\(bt\(\)\.spd\|\|0\)\)\*sp\*_webMul\*_seaMul;/);
const attacking = expression(/const ams=\(P\.speed\+\(bt\(\)\.spd\|\|0\)\)\*sp\*\.8;/);
const states = [
  ['idle', walking, 'ms'],
  ...['wRecover', 'sBash', 'sRecover', 'magicCast'].map(state => [state, attacking, 'ams']),
  ['sBlock', expression(/const ms=P\.speed\*\(1\+_oocBonus\)\*\.35\*sp;/), 'ms'],
  ['sDraw', expression(/const _sdms=P\.speed\*\.5\*sp;/), '_sdms'],
  ['kiGather', expression(/const _kgms=P\.speed\*\.18\*sp;/), '_kgms'],
  ['gSlamWindup', expression(/const gsMs=\(P\.speed\+\(bt\(\)\.spd\|\|0\)\)\*sp\*\.35;/), 'gsMs']
];
const cases = [];
for (const [state, statement, value] of states) for (const boots of [0, .08, .64]) for (const slow of [false, true]) {
  const speed = 2.7196;
  const expected = vm.runInNewContext(statement + value, { P: { speed }, bt: () => ({ spd: boots }), sp: 1, _webMul: slow ? .5 : 1, _seaMul: 1, _oocBonus: 0 });
  cases.push({ state, boots, slow, speed, expected, source: statement });
}
fs.writeFileSync(arg('--out'), JSON.stringify({ scope: '현재 웹 원문 이동 식의 실행값', sha256: crypto.createHash('sha256').update(source).digest('hex'), cases }, null, 2));
console.log('원본 이동 조건 ' + cases.length + '개 추출');
