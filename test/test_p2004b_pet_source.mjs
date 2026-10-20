import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

// Independent oracle: re-read original call expressions, not the generator/module.
function split(source, separator = ',') {
  const out = []; let start = 0, depth = 0, quote = '', escaped = false;
  for (let i = 0; i < source.length; i++) {
    const c = source[i];
    if (quote) { if (escaped) escaped = false; else if (c === '\\') escaped = true; else if (c === quote) quote = ''; continue; }
    if (c === '"' || c === "'") { quote = c; continue; }
    if ('([{'.includes(c)) depth++;
    else if (')]}'.includes(c)) depth--;
    else if (c === separator && depth === 0) { out.push(source.slice(start, i).trim()); start = i + 1; }
  }
  out.push(source.slice(start).trim()); return out;
}
function callArgs(line, index) {
  let end = index, depth = 1, quote = '', escaped = false;
  for (; end < line.length; end++) {
    const c = line[end];
    if (quote) { if (escaped) escaped = false; else if (c === '\\') escaped = true; else if (c === quote) quote = ''; continue; }
    if (c === '"' || c === "'") quote = c;
    else if (c === '(') depth++;
    else if (c === ')' && --depth === 0) break;
  }
  return split(line.slice(index, end));
}
function literal(expr) {
  if (/^'(?:[^'\\]|\\.)*'$/.test(expr) || /^-?\d+(?:\.\d+)?$/.test(expr)) return vm.runInNewContext(expr);
  return null;
}
function sourceOracle(source) {
  const lines = source.split(/\r?\n/), expected = {};
  const modes = { Say: 'say', SayCD: 'cd', BidCD: 'bid', SayUrgent: 'urgent' };
  for (let n = 0; n < lines.length; n++) {
    for (const call of lines[n].matchAll(/_pet(SayCD|SayUrgent|BidCD|Say)\(/g)) {
      const a = callArgs(lines[n], call.index + call[0].length);
      if (!/^'(?:[^'\\]|\\.)*'$/.test(a[0])) continue;
      const id = literal(a[0]);
      const offset = call[1] === 'Say' ? 4 : 5;
      const row = { who: literal(a[1]), txt: literal(a[2]), dur: literal(a[3]), cd: offset === 4 ? null : literal(a[4]),
        pw: a[offset] ? literal(a[offset]) : null, pt: a[offset + 1] ? literal(a[offset + 1]) : null,
        pd: a[offset + 2] ? literal(a[offset + 2]) : 0, mode: modes[call[1]], source_line: n + 1 };
      if (id === 'stun_warn') { row.txt_expression = a[2]; row.pt_expression = a[offset + 1]; }
      if (id === 'rage_half') row.pt_expression = a[offset + 1];
      if (expected[id]) assert.deepEqual({ ...row, source_line: expected[id].source_line }, expected[id], 'duplicate source ID differs: ' + id);
      else expected[id] = row;
    }
  }
  const poolDefs = [
    ['_nags', 'idle_nag', 'crow', 4, 30, 4], ['_tips', 'idle_tip', 'crow', 5, 30, 5],
    ['_pt', 'petTalk_', null, null, 600, null], ['_chDlg', 'chapter_', null, null, 99999, 0],
    ['_envDlg', 'env_ch', null, null, 99999, null], ['_bi', 'boss_intro_ch', null, null, 99999, null],
    ['_cc', 'chapter_clear_', null, null, 9999, null]
  ];
  for (const [variable, prefix, who, dur, cd, pd] of poolDefs) {
    const begin = source.indexOf('const ' + variable + '=') + ('const ' + variable + '=').length;
    assert(begin > 0, 'source array missing ' + variable);
    let end = begin, depth = 0, quote = '', escaped = false;
    do { const c = source[end++]; if (quote) { if (escaped) escaped = false; else if (c === '\\') escaped = true; else if (c === quote) quote = ''; }
      else if (c === '"' || c === "'") quote = c; else if (c === '[') depth++; else if (c === ']') depth--; } while (depth || quote);
    const pool = vm.runInNewContext('(' + source.slice(begin, end) + ')');
    const callLine = lines.findIndex(line => line.includes("'" + prefix + "'+")) + 1;
    pool.forEach((item, i) => { expected[prefix + i] = { who: who ?? item[0], txt: who ? item[0] : item[1], dur: dur ?? item[2], cd,
      pw: who ? 'cat' : item[3] ?? null, pt: who ? item[1] : item[4] ?? null, pd: pd ?? item[5] ?? 0,
      mode: prefix === 'chapter_clear_' ? 'cd' : 'bid', source_line: callLine }; });
  }
  return expected;
}
function readCatalog(text) {
  const begin = text.indexOf('const ENTRIES := ') + 'const ENTRIES := '.length;
  const end = text.indexOf('\n\nstatic func', begin);
  assert(begin >= 'const ENTRIES := '.length, 'ENTRIES block absent');
  return JSON.parse(text.slice(begin, end).trim());
}
function compare(expected, actual) {
  assert.equal(Object.keys(actual).length, 171, 'exact original gameplay ID count');
  assert.deepEqual(Object.keys(actual).sort(), Object.keys(expected).sort(), 'source ID coverage');
  for (const [id, row] of Object.entries(expected)) {
    for (const [key, value] of Object.entries(row)) assert.deepEqual(actual[id][key], value, id + '.' + key);
    assert.equal(typeof actual[id].connected, 'boolean', id + '.connected');
    assert.equal(typeof actual[id].category, 'number', id + '.category');
  }
}
function tierInterpreter(gd) {
  const body = gd.slice(gd.indexOf('static func tier_of('));
  let js = 'function tier(id){';
  const lines = body.split(/\r?\n/);
  for (let i = 1; i < lines.length; i++) {
    const s = lines[i].trim();
    if (s.startsWith('if ')) { const cond = s.slice(3, -1).replaceAll(' or ', ' || ').replaceAll('.begins_with(', '.startsWith(');
      const next = lines[++i].trim(); assert.match(next, /^return [0-9]+$/); js += 'if(' + cond + '){' + next + ';}'; }
    else if (/^return [0-9]+$/.test(s)) js += s + ';';
  }
  return vm.runInNewContext('(' + js + '})');
}
export async function run({ root = new URL('../', import.meta.url), catalog = new URL('godot/scripts/native_pet_dialogue_catalog.gd', root), write = console.log } = {}) {
  let gd;
  try { gd = await readFile(catalog, 'utf8'); }
  catch (error) { assert.fail('generated 171-ID catalogue must exist: ' + error.code); }
  const source = await readFile(new URL('game.html', root), 'utf8');
  const expected = sourceOracle(source), actual = readCatalog(gd);
  compare(expected, actual);
  assert.equal(Object.values(actual).filter(e => e.connected).length, 60, 'declared consumer connections');
  assert.equal(actual.multi_kill.connected, false, 'original multi-kill callback has no caller');
  assert.equal(actual.shift_hint.connected, false, 'unported chain-use event');
  assert.equal(actual.enemy_ice.connected, true, 'native frozen-state consumer');
  const tierStart = source.indexOf('function _petTierOf(id){'), tierEnd = source.indexOf('\n}', tierStart) + 2;
  const sourceTier = vm.runInNewContext('(' + source.slice(tierStart, tierEnd) + ')'), portTier = tierInterpreter(gd);
  for (const id of Object.keys(actual)) { assert.equal(portTier(id), sourceTier(id), 'tier ' + id); assert.equal(actual[id].tier, sourceTier(id), 'metadata tier ' + id); }
  const changedText = structuredClone(actual); changedText.tut_start.txt += '!';
  assert.throws(() => compare(expected, changedText), /tut_start.txt/);
  const changedNumber = structuredClone(actual); changedNumber.warn_hp50.cd++;
  assert.throws(() => compare(expected, changedNumber), /warn_hp50.cd/);
  const changedPair = structuredClone(actual); changedPair.idle_tip0.pt += '!';
  assert.throws(() => compare(expected, changedPair), /idle_tip0.pt/);
  const result = { passed: 171, failed: 0, tier_checks: 342, mutation_checks: 3, mode: 'source-parity (not Godot/runtime)', catalog: String(catalog) };
  write(JSON.stringify(result)); return result;
}
if (typeof process !== 'undefined' && import.meta.url === 'file:///' + process.argv[1]?.replaceAll('\\', '/')) await run();
