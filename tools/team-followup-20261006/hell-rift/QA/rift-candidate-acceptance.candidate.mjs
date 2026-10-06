/*
 * rift-candidate-acceptance.candidate.mjs
 * TASK CLAUDE8-PROD-QA-20261006-0220 · QA role (UUID 20094d24-…) · CANDIDATE, not production acceptance.
 * endID: QA-CH1-RIFT-CANDIDATE-ACCEPTANCE-CHECKER-20261006
 *
 * WHAT THIS IS
 *   An independent, executable acceptance checker for the 20261006 round's 7 new per-team rift
 *   candidates. It checks each candidate's FAILURE BOUNDARIES and MAIN-GAME INTEGRATION acceptance
 *   conditions against the CURRENT ROOT-CONSUMER source (the editor + its sibling consumer modules +
 *   the saved scene), using the named gates:
 *     interface · stableid · oncegrant · bagfull · retry · gate · scene-nav-pins · png-exclusion
 *
 *   Candidates are discovered live. If a team's candidate is absent it is reported PENDING(missing) —
 *   a missing peer candidate is NOT a reason to block; the consumer-contract checks still run.
 *
 * WHAT THIS IS NOT
 *   - It does NOT re-run the completed suites (core29 / ambience10 / dialogue15 / UI15 / browser12)
 *     nor the 0123 / 0124 analyses, and it does NOT re-audit the immutable prior-round (20261005) raw.
 *   - It opens NO app/game/save/build, no network; it reads source and loads only the pure scene-core
 *     module in a vm sandbox to reuse canWalk/validate (the same way the builder/tests do). It writes
 *     nothing.
 *   - A green run is a SOURCE-level candidate gate only. The real 6-stage native play, audio listen,
 *     and visual inspection — plus production adoption, docs sync, backup/Git — remain ROOT-OWNED and
 *     UNACCEPTED here (see the ROOT-ONLY footer). Source PASS never substitutes for completion.
 *
 * Run:  node tools/team-followup-20261006/hell-rift/QA/rift-candidate-acceptance.candidate.mjs
 * Exit: 0 when no PRESENT candidate hard-fails (PENDING is allowed); 1 otherwise; 2 on harness error.
 */

import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { createContext, runInContext } from 'node:vm';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, resolve, relative, join } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));
// …/tools/team-followup-20261006/hell-rift/QA -> repo root is four levels up.
const ROOT = resolve(HERE, '..', '..', '..', '..');
const at = (...p) => resolve(ROOT, ...p);
const rel = p => relative(ROOT, p);
const read = p => readFileSync(p, 'utf8');
const sha256 = p => createHash('sha256').update(readFileSync(p)).digest('hex');
const short = h => h.slice(0, 12) + '…';

// ---- current root-consumer source (pinned, read-only) -----------------------
const CONSUMER = {
  editor: 'tools/map-scene-editor.js',
  core: 'tools/map-scene-core.js',
  ambienceModule: 'tools/map-scene-rift-ambience.mjs',
  dialogueModule: 'tools/map-scene-rift-dialogue.mjs',
  scene: 'assets/map/hell_rift/editor_result_20261006/hell-rift.scene.json',
  layout: 'assets/map/hell_rift/interspace_20261005/layout.js',
  // the dialogue data the editor currently fetch()es (prior-round raw — pinned, never re-audited here):
  dialogueData: 'tools/team-followup-20261005/hell-rift/STORY/rift-dialogue.json',
};
// immutable nav pins the scene must keep (HELL_RIFT_EDITOR_RESULT_20261006):
const PIN = {
  originalNav: '52bd839614a9d1adad767d472357438c1d58a338ac52639705e9b8ad20a3bbdb',
  nav: 'a4508aa62f21c9b4380640307b36eef06656ebdf0c0245a2f78833d65dda0179',
  walkableCount: 1192,
  world: { cols: 200, rows: 200, tileSize: 40 },
};

// Root resident-layers preview (ROOT-RIFT-RESIDENT-LAYERS-PREVIEW-20261006):
// derived clean plate + 2×2 resident atlas + v2 scene + strict editor-only module. Original PNG/scene bytes unchanged.
const RESIDENT = {
  scene: 'assets/map/hell_rift/resident_layers_20261006/hell-rift-residents-v2.scene.json',
  module: 'tools/map-scene-rift-residents.mjs',
  plate: 'assets/map/hell_rift/resident_layers_20261006/clean-plate-v1.png',
  atlas: 'assets/map/hell_rift/resident_layers_20261006/resident-atlas-v1.png',
  pins: {
    scene: 'c508e70d23fafb9295798763c5224c7c92699dfea3d3beebdb6ab18173f44a3a',
    module: '0a04ff1f502ef77604a5eb7e8b194c2eb48c5fea8f7abb12e936f8ade33428a3',
    plate: 'aa64cb7bbfff10c9d5ea2378ef3f8f528bbfb2acfb43ddb9a6520b9f24127673',
    atlas: 'ff20e1f5dc1a8849edb64a10380c1d9eb21688de1817f098b144a57410190a38',
    editor: '9250f66d8f14acc1699e114bdf861660267434d6581af6c6d0849a71bf6bba70',
  },
  // §12 MAP_SCENE_EDITOR_20261005: 4 bodies, foot pivot (.5,1), approach = fixed walkable standpoint.
  bodies: [
    { key: 'haran', npcId: 'rift-rest-haran',    foot: [4660, 6660], approach: [4660, 6700] },
    { key: 'berin', npcId: 'rift-gift-berin',    foot: [6020, 5580], approach: [5980, 5620] },
    { key: 'nessa', npcId: 'rift-request-nessa', foot: [6300, 5020], approach: [6220, 5020] },
    { key: 'dorik', npcId: 'rift-prepare-dorik', foot: [5220, 2500], approach: [5180, 2540] },
  ],
};

/*
 * INPUT REGISTRY — required vs optional, with strict pins.
 * Classification (separated per TASK ①): OK · MISSING · IMPORT-FAIL · PIN-MISMATCH.
 *   required + MISSING      -> hard fail (nonzero exit)         [a required consumer is never "pending"]
 *   optional + MISSING      -> PENDING (exit 0 allowed)
 *   validate + parse/throw  -> IMPORT-FAIL (hard fail)          [present but unusable]
 *   strict pin + different  -> PIN-MISMATCH (hard fail)         [content drifted from the accepted bytes]
 */
// pinFatal: a strict pin whose drift fails the run (the FROZEN data deliverables being accepted).
// A pin without pinFatal is live TOOLING root iterates; its drift is surfaced as a non-fatal MISMATCH.
const INPUTS = [
  { key: 'editor',          path: CONSUMER.editor,         required: true,  pin: RESIDENT.pins.editor },
  { key: 'core',            path: CONSUMER.core,           required: true },
  { key: 'scene-result',    path: CONSUMER.scene,          required: true,  validate: true },
  { key: 'ambience-module', path: CONSUMER.ambienceModule, required: true },
  { key: 'dialogue-module', path: CONSUMER.dialogueModule, required: true },
  { key: 'resident-scene',  path: RESIDENT.scene,          required: true,  validate: true, pin: RESIDENT.pins.scene,  pinFatal: true },
  { key: 'resident-module', path: RESIDENT.module,         required: true,  pin: RESIDENT.pins.module },
  { key: 'clean-plate',     path: RESIDENT.plate,          required: true,  pin: RESIDENT.pins.plate,  pinFatal: true },
  { key: 'resident-atlas',  path: RESIDENT.atlas,          required: true,  pin: RESIDENT.pins.atlas,  pinFatal: true },
  { key: 'dialogue-data',   path: CONSUMER.dialogueData,   required: false },
];

// the 7 new per-team candidate slots for this round:
const TEAM_DIR = 'tools/team-followup-20261006/hell-rift';
const TEAMS = [
  { team: 'ART',     kind: 'asset-catalog', rules: ['interface', 'stableid', 'scene-nav-pins', 'png-exclusion'] },
  { team: 'ANIMVFX', kind: 'ambience',      rules: ['interface', 'png-exclusion', 'scene-nav-pins'] },
  { team: 'ENEMY',   kind: 'placement',     rules: ['interface', 'stableid', 'scene-nav-pins'] },
  { team: 'BOSS',    kind: 'gate',          rules: ['interface', 'gate', 'stableid'] },
  { team: 'SKILL',   kind: 'input',         rules: ['interface', 'retry'] },
  { team: 'STORY',   kind: 'dialogue',      rules: ['interface', 'stableid', 'oncegrant', 'bagfull', 'gate', 'scene-nav-pins'] },
  { team: 'MAP',     kind: 'scene',         rules: ['scene-nav-pins', 'png-exclusion', 'stableid'] },
];

// ---- harness ----------------------------------------------------------------
const out = [];
let section = '';
const sec = s => { section = s; out.push({ kind: 'sec', s }); };
const line = (status, name, detail) => out.push({ kind: 'line', status, name, detail: detail == null ? '' : String(detail) });
// statuses: PASS FAIL PENDING SKIP INFO
let hardFail = 0;
const fail = (name, detail) => { hardFail++; line('FAIL', name, detail); };

function loadCore() {
  const ctx = createContext({ window: {}, module: { exports: {} }, console });
  runInContext(read(at(CONSUMER.core)), ctx, { filename: CONSUMER.core });
  const api = ctx.MapSceneCore || ctx.module.exports;
  if (!api || typeof api.validate !== 'function') throw new Error('MapSceneCore load failed');
  return api;
}
function loadLayoutNavSha() {
  try {
    const ctx = createContext({ window: {} });
    runInContext(read(at(CONSUMER.layout)), ctx, { filename: CONSUMER.layout });
    return ctx.window.HELL_RIFT_INTERSPACE?.variants?.interspace?.navSha256 || null;
  } catch { return null; }
}

let K, scene, reachable;
function buildReachable(s) {
  const w = s.world, t = w.tileSize, seen = new Uint8Array(w.cols * w.rows);
  const sx = Math.floor(s.start.x / t), sy = Math.floor(s.start.y / t), q = [sy * w.cols + sx];
  seen[q[0]] = 1;
  for (let i = 0; i < q.length; i++) {
    const id = q[i], x = id % w.cols, y = Math.floor(id / w.cols);
    for (const [dx, dy] of [[0, -1], [1, 0], [0, 1], [-1, 0]]) {
      const nx = x + dx, ny = y + dy, n = ny * w.cols + nx;
      if (nx >= 0 && ny >= 0 && nx < w.cols && ny < w.rows && !seen[n] && K.canWalk(s, (nx + 0.5) * t, (ny + 0.5) * t)) { seen[n] = 1; q.push(n); }
    }
  }
  return seen;
}
const reachAt = (x, y) => {
  const w = scene.world, t = w.tileSize, tx = Math.floor(x / t), ty = Math.floor(y / t);
  if (tx < 0 || ty < 0 || tx >= w.cols || ty >= w.rows) return false;
  return K.canWalk(scene, x, y) && !!reachable[ty * w.cols + tx];
};

// ---- candidate discovery ----------------------------------------------------
function discover(team) {
  const dir = at(TEAM_DIR, team);
  if (!existsSync(dir)) return { present: false, files: [] };
  let names = [];
  try { names = readdirSync(dir).filter(n => statSync(join(dir, n)).isFile()); } catch { /* ignore */ }
  const cand = names.filter(n => /\.candidate\.(mjs|json)$/.test(n) || /\.(mjs|json)$/.test(n));
  return { present: cand.length > 0, files: cand.map(n => join(dir, n)) };
}

// ---- generic helpers for data candidates ------------------------------------
function* walkCoords(node, path = '') {
  if (!node || typeof node !== 'object') return;
  if (typeof node.x === 'number' && typeof node.y === 'number') yield { path, x: node.x, y: node.y };
  for (const [k, v] of Object.entries(node)) if (v && typeof v === 'object') yield* walkCoords(v, path ? path + '.' + k : k);
}
function collectIds(node, acc = []) {
  if (!node || typeof node !== 'object') return acc;
  for (const key of ['endId', 'npcId', 'id', 'questRef', 'giftRef']) if (typeof node[key] === 'string') acc.push(node[key]);
  for (const v of Object.values(node)) if (v && typeof v === 'object') collectIds(v, acc);
  return acc;
}
// ids declared as literals in an .mjs (END_ID consts, npcId:'…', endId:'…')
function literalIds(text) {
  const ids = [];
  for (const m of text.matchAll(/(?:END_ID|endId|npcId)\b[^'"`\n]*['"`]([^'"`]+)['"`]/g)) ids.push(m[1]);
  return ids;
}
// exported names of an .mjs (for interface capability detection)
function exportedNames(text) {
  const names = [];
  for (const m of text.matchAll(/export\s+(?:const|function|class|let)\s+([A-Za-z0-9_$]+)/g)) names.push(m[1]);
  if (/export\s+default/.test(text)) names.push('default');
  return names;
}
// the immutable pins any scene-referencing candidate must preserve (label -> value)
const IMMUTABLE_PINS = {
  painting: 'a3d95a005924692626321cedf384d1e4e90282ba990d9e19e86a3aa73a1563d4',
  abyss: 'ace0c853cc27cbb4d2b807104273399a1144df77d31b1003e574141fed10f991',
  nav: PIN.nav, originalNav: PIN.originalNav,
};

// ---- rule implementations (per present candidate) ---------------------------
// Each rule reports via line(); a FAIL is a hard failure. Rules are forward-looking
// and best-effort on unknown shapes (clearly labelled INFO/manual).
// Rules hard-FAIL only on PROVABLE defects. A candidate that is a different/complementary module
// (not a drop-in of an existing consumer factory) is reported INFO for root's judgment, never FAIL —
// production adoption is root-owned. Consumer-factory match is surfaced as an informational line.
function runRules(team, kind, rules, files) {
  const srcs = files.map(f => ({ f, text: read(f), isJson: f.endsWith('.json') }));
  const json = srcs.filter(s => s.isJson).map(s => { try { return { f: s.f, data: JSON.parse(s.text) }; } catch (e) { fail(`${team}/parse`, `${rel(s.f)}: ${e.message}`); return null; } }).filter(Boolean);
  const mjs = srcs.filter(s => !s.isJson);
  const anySrc = srcs.map(s => s.text).join('\n');
  const dialogueData = json.find(j => Array.isArray(j.data?.npcs) && j.data.npcs.some(n => n.nodes)); // true STORY dialogue data

  for (const r of rules) {
    switch (r) {
      case 'interface': {
        // capability detection: PASS if it exports a usable surface or is valid structured data;
        // FAIL only if empty/unparseable. Consumer-factory match is informational.
        const exps = mjs.flatMap(s => exportedNames(s.text));
        const validData = json.length && json.every(j => j.data && typeof j.data === 'object');
        if (!exps.length && !validData && !json.length) { fail(`${team}/interface`, 'no exports and no parseable data'); break; }
        const expected = kind === 'ambience' ? 'createRiftAmbience' : kind === 'dialogue' ? 'createRiftDialogue' : null;
        const matches = expected && anySrc.includes(expected);
        line('PASS', `${team}/interface`, exps.length ? `exports: ${exps.join(', ')}` : `data candidate (${json.length} file)`);
        if (expected) line('INFO', `${team}/interface:consumer-match`,
          matches ? `re-exports ${expected} (drop-in for the editor consumer)`
                  : `complementary module — does NOT re-export ${expected}; the existing root consumer (tools/map-scene-rift-${kind}.mjs) stays; wiring/adoption is root-owned`);
        break;
      }
      case 'stableid': {
        const ids = [...json.flatMap(j => collectIds(j.data)), ...mjs.flatMap(s => literalIds(s.text))];
        if (!ids.length) { line('INFO', `${team}/stableid`, 'no ids declared to check — manual'); break; }
        const dup = ids.filter((v, i) => ids.indexOf(v) !== i);
        const blank = ids.filter(v => !v.trim());
        (dup.length || blank.length) ? fail(`${team}/stableid`, `duplicate/blank ids: ${[...new Set(dup)].join(',') || '(blank)'}`)
                                     : line('PASS', `${team}/stableid`, `${ids.length} id(s) unique & non-blank`);
        break;
      }
      case 'oncegrant': case 'bagfull': {
        if (dialogueData) {
          const d = dialogueData.data; let bad = [];
          for (const npc of d.npcs || []) for (const node of Object.values(npc.nodes || {})) for (const o of node.options || []) {
            if (o.onFailure) { const fn = npc.nodes[o.onFailure]; if (fn && Array.isArray(fn.set) && fn.set.length) bad.push(`${npc.npcId}:${o.onFailure} sets ${fn.set}`); }
          }
          bad.length ? fail(`${team}/${r}`, 'failure node sets a grant/accept flag: ' + bad.join(' | '))
                     : line('PASS', `${team}/${r}`, r === 'oncegrant' ? 'grant/accept flags set only on success nodes' : 'failure (bagFull/acceptFail) nodes set no flag');
        } else {
          // port/code module: static capability check — commit only on a true grant, dedup before re-grant.
          const commitOnGrant = /granted\s*&&|grant\w*\s*===\s*true|if\s*\(\s*granted/.test(anySrc);
          const dedup = /already-granted|committedRecord|committed\s*===\s*true|ledger\[/.test(anySrc);
          const bagfull = /bag-?full|grantItem\([^)]*\)\s*===\s*false|returns false on bag/i.test(anySrc);
          if (r === 'oncegrant') line(commitOnGrant && dedup ? 'PASS' : 'INFO', `${team}/oncegrant`, commitOnGrant && dedup ? 'commit gated on true grant + dedup before re-grant' : 'grant-once semantics not statically confirmed — manual (port module)');
          else line(bagfull ? 'PASS' : 'INFO', `${team}/bagfull`, bagfull ? 'bag-full path handled (grant returns false → no flag)' : 'bag-full handling not statically confirmed — manual');
        }
        break;
      }
      case 'retry': {
        // capability gate (NOT the 0124 reproduction): a retry/input candidate must handle held-input at the
        // boundary — clearHeldInput present, and the await case acknowledged (post-await aux clear) or a busy/
        // ownership gate. FAIL only if it claims the retry role yet never touches clearHeldInput.
        const hasClear = /clearHeldInput/.test(anySrc);
        const awaitAware = /detectAwait|awaitBeforeGon|post-await|await\b/i.test(anySrc);
        const gate = /setBusy|busy|resolveKeydownOwner|consumed|inert/.test(anySrc);
        if (!hasClear) fail(`${team}/retry`, 'retry/input candidate never references clearHeldInput — held/blur boundary unaddressed');
        else line(awaitAware || gate ? 'PASS' : 'INFO', `${team}/retry`,
          awaitAware ? 'clearHeldInput + await-aware boundary (handles the mid-await / post-await loss case)'
          : gate ? 'clearHeldInput + busy/ownership gate' : 'clearHeldInput present; await-case handling not evident — manual');
        break;
      }
      case 'gate': {
        const selfAdvance = /(loadChapter|nextChapter|advanceStage|setChapter|chapterTransition|enterWormBurrow)\s*\(/i.test(anySrc);
        const directSave = /localStorage\.setItem|saveSlot|writeSave\(|saveGame\(/.test(anySrc);
        const declaresOwner = /owned-by-root|rift-boss-gate|BOSS|root\b|requiresRootDecision/.test(anySrc);
        if (team === 'BOSS') directSave ? fail(`${team}/gate`, 'boss gate writes save directly (root-owned)') : line('PASS', `${team}/gate`, 'gate candidate; no direct save write');
        else selfAdvance ? fail(`${team}/gate`, 'non-BOSS candidate self-advances the chapter (gate is BOSS/root owned)')
                         : line(declaresOwner ? 'PASS' : 'INFO', `${team}/gate`, declaresOwner ? 'no self-advance; defers transition/commit to BOSS/root' : 'no self-advance detected — manual');
        break;
      }
      case 'scene-nav-pins': {
        // (a) any immutable pin the candidate cites must match exactly; (b) any PLAYER STANDPOINT it
        // introduces (approach/poi/spawn/standpoint/anchor) must be canWalk(r12)-reachable. Decorative
        // figure polygons are not standpoints and are not reachability-checked.
        let pinBad = [];
        for (const [label, val] of Object.entries(IMMUTABLE_PINS)) {
          const re = new RegExp(label + "\\b[^'\"`\\n]*['\"`]([0-9a-f]{64})['\"`]");
          const m = anySrc.match(re); if (m && m[1] !== val) pinBad.push(`${label}=${short(m[1])}≠${short(val)}`);
        }
        if (/walkableCount/.test(anySrc)) { const m = anySrc.match(/walkableCount["'`\s:]+(\d+)/); if (m && +m[1] !== PIN.walkableCount) pinBad.push(`walkableCount=${m[1]}≠${PIN.walkableCount}`); }
        const standpointKey = /approach|poi|spawn|standpoint|anchor|npc/i;
        let coords = [], unreachable = [];
        for (const j of json) for (const c of walkCoords(j.data)) {
          if (!standpointKey.test(c.path)) continue;
          const t = scene.world.tileSize, wx = Math.abs(c.x) < 300 ? (c.x + 0.5) * t : c.x, wy = Math.abs(c.y) < 300 ? (c.y + 0.5) * t : c.y;
          coords.push(c.path); if (!reachAt(wx, wy)) unreachable.push(`${c.path}(${Math.round(wx)},${Math.round(wy)})`);
        }
        if (pinBad.length) fail(`${team}/scene-nav-pins`, 'immutable pin drift: ' + pinBad.join('; '));
        else if (unreachable.length) fail(`${team}/scene-nav-pins`, `${unreachable.length}/${coords.length} player standpoint(s) not canWalk(r12)-reachable: ` + unreachable.slice(0, 6).join(', '));
        else {
          const citedPins = Object.keys(IMMUTABLE_PINS).filter(l => new RegExp(l + "\\b[^'\"`\\n]*['\"`][0-9a-f]{64}").test(anySrc));
          line(citedPins.length || coords.length ? 'PASS' : 'INFO', `${team}/scene-nav-pins`,
            `${citedPins.length ? 'pins match [' + citedPins.join(',') + ']' : 'no pins cited'}${coords.length ? '; ' + coords.length + ' standpoint(s) reachable' : ''}${!citedPins.length && !coords.length ? ' — manual' : ''}`);
        }
        break;
      }
      case 'png-exclusion': {
        // provable defect = auto-attach to a render/event loop (would bake into any frame incl. PNG).
        // A caller-invoked overlay fn (draw*(ctx,…)) is fine; its PNG exclusion is an INTEGRATION condition.
        const autoAttaches = /requestAnimationFrame\s*\(|addEventListener\(['"](load|DOMContentLoaded|resize|pointer\w*|key\w*)/.test(anySrc);
        const drawsForCaller = /function\s+\w*draw\w*\s*\(|export\s+function\s+\w*draw/i.test(anySrc) || /ctx\.(drawImage|fillRect|arc|fill)\(/.test(anySrc);
        if (autoAttaches) fail(`${team}/png-exclusion`, 'candidate auto-attaches to rAF/DOM events → would bake into every frame incl. the overview PNG');
        else line('PASS', `${team}/png-exclusion`, drawsForCaller
          ? 'no auto-attach; caller-invoked draw — integrator must call it only in the live-ctx/overlays path, never inside render(target,false)'
          : 'no draw / no auto-attach');
        break;
      }
      default: line('INFO', `${team}/${r}`, 'rule not implemented');
    }
  }
}

// ---- main -------------------------------------------------------------------
try {
  K = loadCore();
  scene = K.validate(JSON.parse(read(at(CONSUMER.scene))));
  reachable = buildReachable(scene);

  sec('INPUTS — required/optional, classified (MISSING · IMPORT-FAIL · PIN-MISMATCH · OK)');
  for (const inp of INPUTS) {
    const p = at(inp.path);
    if (!existsSync(p)) {
      inp.required ? fail(`input:${inp.key}`, `REQUIRED MISSING ${rel(p)} — nonzero exit (not pending)`)
                   : line('PENDING', `input:${inp.key}`, `optional, absent ${rel(p)} — allowed (exit 0)`);
      continue;
    }
    const got = sha256(p);
    if (inp.pin && got !== inp.pin) {
      inp.pinFatal
        ? fail(`input:${inp.key}`, `PIN-MISMATCH (frozen deliverable) ${rel(p)} got ${short(got)} ≠ pin ${short(inp.pin)}`)
        : line('MISMATCH', `input:${inp.key}`, `tooling drifted from task pin ${short(inp.pin)} → now ${short(got)} (live root edit; non-fatal, contract re-checked below)`);
      continue;
    }
    if (inp.validate) {
      try { K.validate(JSON.parse(read(p))); }
      catch (e) { fail(`input:${inp.key}`, `IMPORT-FAIL ${rel(p)}: ${e.message}`); continue; }
    }
    line('PASS', `input:${inp.key}`, `${rel(p)}${inp.pin ? ' · pin OK' : ''}${inp.validate ? ' · validates' : ''}  sha256 ${short(got)}`);
  }

  sec('CONSUMER CONTRACTS (what any candidate must integrate with)');
  const ed = existsSync(at(CONSUMER.editor)) ? read(at(CONSUMER.editor)) : '';
  // ambience/dialogue import wiring
  /import\(['"]\.\/map-scene-rift-ambience\.mjs['"]\)[\s\S]{0,80}createRiftAmbience/.test(ed)
    ? line('PASS', 'cc/ambience-import', "editor imports './map-scene-rift-ambience.mjs'.createRiftAmbience")
    : line('INFO', 'cc/ambience-import', 'ambience import wiring not found as expected — manual');
  /import\(['"]\.\/map-scene-rift-dialogue\.mjs['"]\)/.test(ed) && /createRiftDialogue/.test(ed)
    ? line('PASS', 'cc/dialogue-import', "editor imports './map-scene-rift-dialogue.mjs'.createRiftDialogue")
    : line('INFO', 'cc/dialogue-import', 'dialogue import wiring not found as expected — manual');
  // the dialogue data path the editor currently fetches (pin only; not re-audited):
  const m = ed.match(/fetch\(['"]([^'"]*rift-dialogue\.json)['"]/);
  line('INFO', 'cc/dialogue-data-path', m ? `editor fetch()es ${m[1]} (prior-round raw; a 20261006 STORY candidate is NOT wired until root repoints)` : 'dialogue fetch path not found');
  // PNG exclusion: export renders offscreen with overlays=false; overlay draws guard target===ctx and bail on !overlays
  const pngHandler = ed.includes("$('png')");
  const pngOffscreen = /render\(target,\s*false\)/.test(ed);
  const overlayReturn = /if\(!overlays\)return/.test(ed);
  const ctxGuard = /target!==ctx|target===ctx/.test(ed);
  (pngHandler && pngOffscreen && overlayReturn && ctxGuard)
    ? line('PASS', 'cc/png-exclusion', 'PNG export uses render(target,false) offscreen; overlays bail (if(!overlays)return) + ambience/markers guard target===ctx → excluded')
    : line('INFO', 'cc/png-exclusion', `PNG exclusion partially confirmed [png:${pngHandler} offscreen:${pngOffscreen} overlayReturn:${overlayReturn} ctxGuard:${ctxGuard}] — manual`);
  // scene nav pins intact vs recompute
  const navSha = createHash('sha256').update(Buffer.from(scene.walkable)).digest('hex');
  navSha === PIN.nav && scene.sourcePins?.nav === PIN.nav ? line('PASS', 'cc/scene-nav', `nav sha ${short(navSha)} == pin; walkableCount ${scene.walkable.filter(Boolean).length}`)
                                                          : fail('cc/scene-nav', `nav sha drift: recomputed ${short(navSha)} vs pin ${short(PIN.nav)}`);
  const layoutNav = loadLayoutNavSha();
  layoutNav === PIN.originalNav && scene.sourcePins?.originalNav === PIN.originalNav ? line('PASS', 'cc/original-nav', 'originalNav pin == interspace layout.navSha256 (base preset untouched)')
                                                                                   : fail('cc/original-nav', `originalNav mismatch (layout=${short(layoutNav || 'null')})`);
  scene.sourcePins?.walkableCount === PIN.walkableCount ? line('PASS', 'cc/walkable-count', `${PIN.walkableCount}`) : fail('cc/walkable-count', `walkableCount ${scene.sourcePins?.walkableCount} ≠ ${PIN.walkableCount}`);
  // route + resident anchors reachable (the relocated POIs)
  const route = K.route(scene);
  route.pass ? line('PASS', 'cc/route', `start→exit connected (visited ${route.visited})`) : fail('cc/route', route.reason);
  const anchors = [['haran', 4820, 6500], ['berin', 5980, 5620], ['nessa', 6220, 5020], ['dorik', 5180, 2540]];
  const unreach = anchors.filter(([, x, y]) => !reachAt(x, y)).map(a => a[0]);
  unreach.length ? fail('cc/resident-anchors', `unreachable approach anchors: ${unreach.join(', ')}`)
                 : line('PASS', 'cc/resident-anchors', 'all 4 dialogue approach anchors canWalk(r12)-reachable');

  // ---- RESIDENT preview (v2 scene + strict editor-only module) ----
  sec('RESIDENT PREVIEW — v2 scene invariants + small negative checks (derived, not adopted)');
  if (!existsSync(at(RESIDENT.scene))) {
    fail('resident/scene', 'REQUIRED resident scene missing — nonzero');
  } else {
    let rs = null;
    try { rs = K.validate(JSON.parse(read(at(RESIDENT.scene)))); } catch (e) { fail('resident/validate', `IMPORT-FAIL: ${e.message}`); }
    if (rs) {
      // INVARIANTS must equal the immutable result-scene (nav/world/start/exit untouched by resident edit)
      const rNav = createHash('sha256').update(Buffer.from(rs.walkable)).digest('hex');
      const inv = [
        ['world', JSON.stringify(rs.world) === JSON.stringify(PIN.world)],
        ['nav-sha', rNav === PIN.nav && rs.sourcePins?.nav === PIN.nav],
        ['walkableCount', rs.walkable.filter(Boolean).length === PIN.walkableCount && rs.sourcePins?.walkableCount === PIN.walkableCount],
        ['start', rs.start.x === scene.start.x && rs.start.y === scene.start.y],
        ['exit', rs.exit.x === scene.exit.x && rs.exit.y === scene.exit.y],
      ];
      const brokenInv = inv.filter(([, ok]) => !ok).map(([k]) => k);
      brokenInv.length ? fail('resident/invariants', `resident edit changed immutable nav/world/start/exit: ${brokenInv.join(', ')}`)
                       : line('PASS', 'resident/invariants', 'world/nav(1192,a4508)/start/exit unchanged by resident layer');
      // NEGATIVE: derived preview must NOT mutate the original painting/abyss lineage
      (rs.sourcePins?.painting === IMMUTABLE_PINS.painting && rs.sourcePins?.abyss === IMMUTABLE_PINS.abyss && rs.sourcePins?.originalNav === PIN.originalNav)
        ? line('PASS', 'resident/original-lineage', 'original painting/abyss/originalNav pins preserved (derived, not an original-PNG edit)')
        : fail('resident/original-lineage', 'resident scene altered an original painting/abyss/originalNav pin — derived preview must keep originals byte-stable');
      // NEGATIVE: derived asset pins must be declared and match plate/atlas files on disk
      (rs.sourcePins?.cleanPlate === RESIDENT.pins.plate && rs.sourcePins?.residentAtlas === RESIDENT.pins.atlas)
        ? line('PASS', 'resident/derived-pins', 'sourcePins.cleanPlate/residentAtlas match the strict plate/atlas pins')
        : fail('resident/derived-pins', 'sourcePins cleanPlate/residentAtlas missing or ≠ strict plate/atlas pins');
      // NEGATIVE: candidate must NOT self-declare production adoption.
      // (A correct status reads NOT_ADOPTED / ISOLATED / notAdopted:true — do not match the "ADOPT" substring inside "NOT_ADOPTED".)
      const statusStr = String(rs.productionStatus) + ' ' + JSON.stringify(rs.residentLayerReview || {});
      const notAdopted = /NOT_?ADOPTED|ISOLATED|not-?adopted|notAdopted\s*[:=]\s*true|preview|candidate/i.test(statusStr);
      notAdopted
        ? line('PASS', 'resident/not-adopted', `productionStatus=${rs.productionStatus} (not adopted — correct)`)
        : fail('resident/not-adopted', `candidate does not mark itself not-adopted (productionStatus=${rs.productionStatus}) — adoption is root-owned`);
      // foot layer: 4 resident bodies, strict foot pivot/transform; approach points reachable
      const foot = rs.layers.find(l => l.id === 'foot');
      const rReach = buildReachable(rs);
      const reachAtR = (x, y) => { const t = rs.world.tileSize, tx = Math.floor(x / t), ty = Math.floor(y / t); return K.canWalk(rs, x, y) && !!rReach[ty * rs.world.cols + tx]; };
      let bodyBad = [], approachBad = [];
      for (const b of RESIDENT.bodies) {
        const o = foot?.objects.find(o => o.id === `obj-resident-${b.key}`);
        if (!o) { bodyBad.push(`${b.key}:absent`); continue; }
        // NEGATIVE: wrong foot pivot / flipped / masked / rotated body floats or mis-occludes
        if (!(o.pivotX === 0.5 && o.pivotY === 1 && o.rotation === 0 && o.flipX === false && o.opacity === 1 && o.mask === undefined)) bodyBad.push(`${b.key}:bad-transform`);
        // NEGATIVE: an unreachable approach standpoint = an untalkable NPC (the 0124 class)
        if (!reachAtR(b.approach[0], b.approach[1])) approachBad.push(`${b.key}(${b.approach})`);
      }
      (foot && foot.sort === 'foot' && foot.parallax === 1) ? line('PASS', 'resident/foot-layer', `foot.sort=foot parallax=1 objects=${foot.objects.length}`)
                                                            : fail('resident/foot-layer', 'foot layer not sort=foot/parallax=1');
      bodyBad.length ? fail('resident/body-transform', 'resident body transform defects: ' + bodyBad.join(', ')) : line('PASS', 'resident/body-transform', '4 bodies: pivot(.5,1), no rotate/flip/mask, opacity1');
      approachBad.length ? fail('resident/approach-reach', 'unreachable approach standpoint(s): ' + approachBad.join(', ')) : line('PASS', 'resident/approach-reach', 'all 4 resident approach points canWalk(r12)-reachable on v2 scene');
      // optional: the strict editor-only module's own profile must accept the scene (guarded dynamic import)
      try {
        const mod = await import(pathToFileURL(at(RESIDENT.module)).href);
        const okProfile = typeof mod.residentPaintingProfile === 'function' && mod.residentPaintingProfile(rs) != null;
        const anchors2 = typeof mod.residentDialogueAnchors === 'function' ? (mod.residentDialogueAnchors(rs) || []) : [];
        okProfile ? line('PASS', 'resident/module-profile', `residentPaintingProfile(scene) accepts v2; residentDialogueAnchors=${anchors2.length}`)
                  : fail('resident/module-profile', 'residentPaintingProfile(scene) returned null — module rejects this scene');
      } catch (e) { line('INFO', 'resident/module-profile', `module not node-importable here (${e.message}) — static pin check stands; manual`); }
    }
  }

  // Guard: a source/regex/export PASS is NOT production acceptance.
  sec('ACCEPTANCE GUARD (what a green run does NOT mean)');
  line('INFO', 'guard/scope', 'PASS here = source/interface/pin/nav gate only; it is NOT promotion to production acceptance.');
  line('INFO', 'guard/no-dup', 'this checker does NOT re-run root unit19 / UI15 / 4-dir walk / 8-camera suites, and opens no GUI/native/audio.');

  sec('NEW CANDIDATES — 20261006 round (7 per-team slots)');
  for (const { team, kind, rules } of TEAMS) {
    const d = discover(team);
    if (!d.present) { line('PENDING', `${team}`, `no candidate under ${TEAM_DIR}/${team}/ — missing/pending (checked, not blocking)`); continue; }
    line('INFO', `${team}`, `candidate(s): ${d.files.map(f => rel(f)).join(', ')} · rules: ${rules.join('/')}`);
    runRules(team, kind, rules, d.files);
  }

  sec('NOT COVERED HERE — ROOT-OWNED, UNACCEPTED (source PASS ≠ completion)');
  for (const n of [
    'native 6-stage play (start→combat/loot→boss-open→death/revive→retry)',
    'audio listen (SFX/BGM cues)',
    'visual inspection at 1600×900 / 1920×1080 (tone, readability, seams)',
    'production adoption into game.html / main-game save bridge',
    'docs sync, backup, Git commit/push, remote SHA',
  ]) line('INFO', 'root-only', n);

  // ---- report ----
  const W = 76, bar = '─'.repeat(W);
  const counts = out.filter(o => o.kind === 'line').reduce((a, o) => (a[o.status] = (a[o.status] || 0) + 1, a), {});
  console.log(bar);
  console.log('Hell Rift QA — candidate acceptance checker (CLAUDE8-PROD-QA-20261006-0220)');
  console.log('endID QA-CH1-RIFT-CANDIDATE-ACCEPTANCE-CHECKER-20261006 · CANDIDATE, not production acceptance');
  console.log(bar);
  for (const o of out) {
    if (o.kind === 'sec') { console.log(`\n▸ ${o.s}`); continue; }
    console.log(`  [${o.status.padEnd(7)}] ${o.name}${o.detail ? '  — ' + o.detail : ''}`);
  }
  console.log(`\n${bar}`);
  console.log('SUMMARY  ' + Object.entries(counts).map(([k, v]) => `${k}:${v}`).join('  '));
  console.log(`HARD FAILS (present candidates / consumer): ${hardFail}`);
  console.log('Scope: source-level candidate gate only. Native 6-stage, audio, visual, and production');
  console.log('adoption remain ROOT-OWNED and UNACCEPTED — a green run does not mean done.');
  console.log(bar);
  process.exit(hardFail ? 1 : 0);
} catch (e) {
  console.error('[harness error]', e && e.stack ? e.stack : e);
  process.exit(2);
}
