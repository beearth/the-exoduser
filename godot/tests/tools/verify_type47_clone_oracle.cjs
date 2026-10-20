const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');

const root = path.resolve(__dirname, '../../..');
const source = fs.readFileSync(path.join(root, 'game.html'), 'utf8');
const lines = source.split('\n');
const fixture = JSON.parse(fs.readFileSync(path.join(root, 'godot/tests/fixtures/type47_discarded_clone_oracle.json'), 'utf8'));
assert.equal(crypto.createHash('sha256').update(source).digest('hex'), fixture.source_sha256);
const sourceConstant = name => {
  const start = source.indexOf('const ' + name + '=');
  assert.ok(start >= 0, name);
  return source.slice(start, source.indexOf(';', start) + 1);
};
const definitions = ['DIFF_LV_OFF', 'DIFF_MUL', 'ETYPE_HP', 'ETYPE_ATK', '_ETYPE_SPD_RAW', 'ETYPE_SPD', 'ETYPE_R', 'ETYPE_POISE', 'ETYPE_COL', 'ELITE_TIERS', 'ELITE_PROB', 'MOD_DEFS'].map(sourceConstant).join('\n');
const functions = lines.slice(31118, 31363).join('\n') + '\n' + lines.slice(23293, 23304).join('\n') + '\n' + lines.slice(31062, 31081).join('\n');
let checked = 0;
for (const entry of fixture.cases) {
  let draws = 0;
  const nativeMath = Object.create(Math);
  nativeMath.random = () => {
    const result = draws === 1 && entry.spec.second !== undefined ? entry.spec.second : entry.spec.u;
    draws += 1;
    return result;
  };
  const context = {
    Math: nativeMath, P: { lv: entry.spec.level }, G: { stage: 0, _stageDiffOff: 0 }, OPT: { diff: entry.spec.diff },
    STG: [{ monLv: 100 }], SI_TO_HELL: [0], EL: { P: 0, D: 3 }, ELC: ['#bbbbbb', '', '', '#a44cff'],
    _useGPU: false, _useGL: false, canMv: () => !entry.spec.blocked, safePt: () => entry.spec.safe,
    isRareEtype: () => false, ETYPE_ERES: Array.from({ length: 120 }, () => [0, 0, 0, 0, 0, 0, 0]),
    _MOB8_TOTAL: 40, _MOB8_COLS: 8, _CH1_OPENING_EXCLUDED_ET: new Set([2, 22, 30, 43])
  };
  context.window = context;
  vm.runInNewContext(definitions + '\n' + functions + '\nvar value=mkEn(3969.25,494.75,0,40,false,3,undefined);if(value){value.hp=~~(value.hp*.3);value.mhp=value.hp;value.eShield=0;value.eShieldMax=0;value.atk=~~(value.atk*.5)}', context);
  const actual = context.value ? Object.fromEntries(Object.keys(entry.expected).map(key => [key, context.value[key]])) : null;
  assert.deepEqual(JSON.parse(JSON.stringify(actual)), entry.expected, entry.spec.name);
  assert.equal(draws, entry.draws, entry.spec.name + ' RNG');
  checked += 1;
}
process.stdout.write(JSON.stringify({ cases: checked, failures: 0, source: fixture.source_sha256 }) + '\n');
