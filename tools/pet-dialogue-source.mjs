import { readFile, writeFile } from 'node:fs/promises';
import vm from 'node:vm';

// Literal-only extraction. Nothing from the gameplay source is executed wholesale.
const CONNECTIONS = new Set(('tut_start tut_atk3 tut_charge tut_1sthit tut_hit2 tut_parry tut_1stkill tut_bow tut_firstItem '
  + 'warn_hp50 crisis_hp30 hp_critical burn_warn hp_oneshot low_st enemy_ice '
  + 'melee_trap_yes melee_trap_no melee_slam_yes melee_slam_no '
  + 'resource_half_dome resource_parry resource_low_yes resource_low_no idle_noE chapter_0 env_ch0 '
  + 'stage_clear combo_50 combo_100 low_hp_kill').split(' '));
for (const [prefix, size] of [['idle_nag', 6], ['idle_tip', 18], ['petTalk_', 5]])
  for (let i = 0; i < size; i++) CONNECTIONS.add(prefix + i);
const POOLS = [
  { variable: '_nags', prefix: 'idle_nag', who: 'crow', dur: 4, cd: 30, pd: 4, category: 7 },
  { variable: '_tips', prefix: 'idle_tip', who: 'crow', dur: 5, cd: 30, pd: 5, category: 7 },
  { variable: '_pt', prefix: 'petTalk_', cd: 600, category: 22 },
  { variable: '_chDlg', prefix: 'chapter_', cd: 99999, category: 8 },
  { variable: '_envDlg', prefix: 'env_ch', cd: 99999, category: 9 },
  { variable: '_bi', prefix: 'boss_intro_ch', cd: 99999, category: 23 },
  { variable: '_cc', prefix: 'chapter_clear_', cd: 9999, category: 13 }
];
export function tierOf(id) { // game.html 9414~9423, original ordering is intentional.
  if (id === 'enh_hint') return 1;
  if (id.startsWith('bl_') || id.startsWith('cd_') || id.startsWith('combo_') || id === 'multi_kill' || id === 'low_hp_kill' || id === 'stage_clear' || id.startsWith('chapter_clear_') || id.startsWith('trophy_') || id.startsWith('enh_') || id === 'first_legend' || id.startsWith('speed_') || id === 'elite_kill' || id === 'miniboss_kill' || id.startsWith('build_') || id.startsWith('diff_') || id.startsWith('syn_')) return 2;
  if (id === 'boss_elem') return 3;
  if (id.startsWith('boss_') || id === 'near_boss' || id === 'elite_first' || id === 'miniboss_appear') return 4;
  if (id.startsWith('melee_') || id.startsWith('resource_') || id === 'enemy_ice' || id === 'rage_full2' || id === 'mp_warn' || id === 'low_st') return 3;
  if (id.startsWith('tut_') || id.startsWith('parry_') || id.startsWith('sp_') || id.startsWith('has_') || id === 'bag_full' || id === 'low_mats' || id === 'shift_hint') return 1;
  if (id.startsWith('idle_') || id.startsWith('env_') || id.startsWith('chapter_') || id.startsWith('petTalk')) return 0;
  return 2;
}
function literal(expression) {
  if (/^'(?:[^'\\]|\\.)*'$/.test(expression) || /^-?\d+(?:\.\d+)?$/.test(expression))
    return vm.runInNewContext(expression);
  return null;
}
function segment(text, start, open, close) {
  let depth = 1, quote = '', escape = false;
  for (let i = start; i < text.length; i++) {
    const c = text[i];
    if (quote) { if (escape) escape = false; else if (c === '\\') escape = true; else if (c === quote) quote = ''; continue; }
    if (c === "'" || c === '"') { quote = c; continue; }
    if (c === open) depth++;
    else if (c === close && --depth === 0) return { value: text.slice(start, i), end: i };
  }
  throw new Error('Unclosed source expression at ' + start);
}
function argumentsOf(text) {
  const out = []; let start = 0, depth = 0, quote = '', escape = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quote) { if (escape) escape = false; else if (c === '\\') escape = true; else if (c === quote) quote = ''; continue; }
    if (c === "'" || c === '"') quote = c;
    else if ('([{'.includes(c)) depth++;
    else if (')]}'.includes(c)) depth--;
    else if (c === ',' && depth === 0) { out.push(text.slice(start, i).trim()); start = i + 1; }
  }
  out.push(text.slice(start).trim()); return out;
}
function stringsIn(expression) {
  return [...expression.matchAll(/'(?:[^'\\]|\\.)*'/g)].map(m => literal(m[0]));
}
function category(id) {
  if (id.startsWith('tut_key')) return 2;
  if (id.startsWith('tut_') && id !== 'tut_gate_locked') return 1;
  if (['warn_hp50', 'crisis_hp30', 'hp_critical', 'burn_warn', 'hp_oneshot', 'stun_warn', 'boss_exec', 'boss_groggy', 'boss_grab_warn', 'boss_aoe_warn'].includes(id)) return 3;
  if (['mp_warn', 'low_st', 'shift_hint', 'sp_hint', 'has_sp', 'has_ap', 'bag_full', 'low_mats', 'enh_hint'].includes(id) || id.startsWith('resource_')) return 5;
  if (['parry_low', 'parry_mid', 'idle_noE'].includes(id)) return 6;
  if (['boss_elem', 'boss_summon', 'enemy_ice', 'near_boss', 'rage_full2'].includes(id) || id.startsWith('melee_')) return 4;
  if (['boss_p2', 'boss_p3', 'boss_p4', 'boss_kill', 'stage_clear', 'boss_gate_open', 'tut_gate_locked', 'region_clear'].includes(id)) return 16;
  if (id.startsWith('bl_')) return 10;
  if (id.startsWith('cd_')) return 11;
  if (id.startsWith('elite_') || id.startsWith('miniboss_')) return 12;
  if (id.startsWith('build_')) return 15;
  if (id.startsWith('combo_') || id === 'low_hp_kill' || id === 'multi_kill') return 17;
  if (id.startsWith('enh_') || id === 'first_legend') return 18;
  if (['first_death', 'death_repeat', 'boss_retry5'].includes(id)) return 19;
  if (id.startsWith('trophy_')) return 20;
  if (id.startsWith('speed_')) return 21;
  if (id.startsWith('diff_')) return 27;
  return 0; // External item/rage/revive callbacks; source does not assign a numbered category.
}
export function extract(source) {
  const entries = {}, modeMap = { Say: 'say', SayCD: 'cd', SayUrgent: 'urgent', BidCD: 'bid' };
  const lineOf = index => source.slice(0, index).split(/\r?\n/).length;
  for (const m of source.matchAll(/_pet(SayCD|SayUrgent|BidCD|Say)\(/g)) {
    const a = argumentsOf(segment(source, m.index + m[0].length, '(', ')').value);
    if (!/^'(?:[^'\\]|\\.)*'$/.test(a[0])) continue;
    const id = literal(a[0]), pair = m[1] === 'Say' ? 4 : 5;
    const row = { who: literal(a[1]), txt: literal(a[2]), dur: literal(a[3]), cd: pair === 4 ? null : literal(a[4]),
      pw: a[pair] ? literal(a[pair]) : null, pt: a[pair + 1] ? literal(a[pair + 1]) : null,
      pd: a[pair + 2] ? literal(a[pair + 2]) : 0, mode: modeMap[m[1]], source_line: lineOf(m.index),
      category: category(id), connected: CONNECTIONS.has(id), tier: tierOf(id) };
    if (id === 'stun_warn') {
      row.txt_expression = a[2]; row.pt_expression = a[pair + 1];
      row.txt_context = source.split(/\r?\n/).slice(9527, 9531).map(s => s.trim());
      row.txt_components = stringsIn(row.txt_context.join('\n')).concat(stringsIn(row.txt_expression));
      row.pt_components = stringsIn(row.pt_expression);
    }
    if (id === 'rage_half') { row.pt_expression = a[pair + 1]; row.pt_components = stringsIn(row.pt_expression); }
    if (id === 'multi_kill') row.unconnected_reason = 'game.html 9781: definition only; no _petCheckMultiKill() call site in original source';
    if (!entries[id]) entries[id] = row;
  }
  for (const pool of POOLS) {
    const marker = 'const ' + pool.variable + '=';
    const start = source.indexOf(marker) + marker.length;
    if (start < marker.length || source[start] !== '[') throw new Error('Source pool missing: ' + pool.variable);
    const raw = segment(source, start + 1, '[', ']').value;
    const items = vm.runInNewContext('[' + raw + ']');
    const call = source.indexOf("'" + pool.prefix + "'+");
    for (const [i, item] of items.entries()) {
      const id = pool.prefix + i;
      entries[id] = { who: pool.who ?? item[0], txt: pool.who ? item[0] : item[1], dur: pool.dur ?? item[2], cd: pool.cd,
        pw: pool.who ? 'cat' : item[3] ?? null, pt: pool.who ? item[1] : item[4] ?? null, pd: pool.pd ?? item[5] ?? 0,
        mode: pool.prefix === 'chapter_clear_' ? 'cd' : 'bid', source_line: lineOf(call), category: pool.category,
        connected: CONNECTIONS.has(id), tier: tierOf(id), pool_source_line: lineOf(start) };
    }
  }
  if (Object.keys(entries).length !== 171) throw new Error('Expected 171 original gameplay IDs, got ' + Object.keys(entries).length);
  return entries;
}
const TIER_GD = String.raw`static func tier_of(id: String) -> int:
\t# game.html 9414~9423: urgent tier5 is assigned by dispatcher, not this classifier.
\tif id == "enh_hint":
\t\treturn 1
\tif id.begins_with("bl_") or id.begins_with("cd_") or id.begins_with("combo_") or id == "multi_kill" or id == "low_hp_kill" or id == "stage_clear" or id.begins_with("chapter_clear_") or id.begins_with("trophy_") or id.begins_with("enh_") or id == "first_legend" or id.begins_with("speed_") or id == "elite_kill" or id == "miniboss_kill" or id.begins_with("build_") or id.begins_with("diff_") or id.begins_with("syn_"):
\t\treturn 2
\tif id == "boss_elem":
\t\treturn 3
\tif id.begins_with("boss_") or id == "near_boss" or id == "elite_first" or id == "miniboss_appear":
\t\treturn 4
\tif id.begins_with("melee_") or id.begins_with("resource_") or id == "enemy_ice" or id == "rage_full2" or id == "mp_warn" or id == "low_st":
\t\treturn 3
\tif id.begins_with("tut_") or id.begins_with("parry_") or id.begins_with("sp_") or id.begins_with("has_") or id == "bag_full" or id == "low_mats" or id == "shift_hint":
\t\treturn 1
\tif id.begins_with("idle_") or id.begins_with("env_") or id.begins_with("chapter_") or id.begins_with("petTalk"):
\t\treturn 0
\treturn 2
`;
export function render(entries) {
  return 'extends RefCounted\n## P2-004B: generated original gameplay dialogue catalogue (171 IDs).\n'
    + '## Source: game.html 9516~9814 and external callbacks 16420~60775.\n'
    + '## Each source_line is the original call site; pool_source_line identifies its literal data.\n'
    + '## connected is a consumer wiring declaration; data presence never proves a runtime trigger.\n'
    + '## Dynamic stun_warn/rage_half are preserved as source expressions, never sampled/fabricated.\n'
    + '## Regenerate: node tools/pet-dialogue-source.mjs (from this worktree only).\n\n'
    + 'const ENTRIES := ' + JSON.stringify(entries, null, 2) + '\n\n'
    + 'static func get_entry(id: String) -> Dictionary:\n\treturn ENTRIES.get(id, {}).duplicate(true)\n\n'
    + TIER_GD.replaceAll('\\t', '\t');
}
export async function generate({ root = new URL('../', import.meta.url) } = {}) {
  const source = await readFile(new URL('game.html', root), 'utf8');
  const entries = extract(source);
  // Godot 전용 생성기: godot/main 브랜치에서만 실행
  await writeFile(new URL('godot/scripts/native_pet_dialogue_catalog.gd', root), render(entries), 'utf8');
  return { total: Object.keys(entries).length, connected: Object.values(entries).filter(e => e.connected).length };
}
if (typeof process !== 'undefined' && import.meta.url === 'file:///' + process.argv[1]?.replaceAll('\\', '/')) console.log(await generate());
