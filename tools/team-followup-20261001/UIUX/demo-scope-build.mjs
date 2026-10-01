import fs from 'node:fs';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { parse } from 'acorn';

const folder = 'tools/team-followup-20261001/UIUX';
const original = fs.readFileSync('test/demoScope.test.js', 'utf8');
const index = fs.readFileSync('index.html', 'utf8');
const protectedFiles = ['index.html', 'game.html', 'game-easy-test.html', 'test/demoScope.test.js', 'test/demoSaveRoute.test.js', 'test/lobbyCardLanguage.test.js', 'docs/0마스터플랜/DEMO/HELL_DEMO_BUILD_NOTES.md'];
const hashFile = filename => crypto.createHash('sha256').update(fs.readFileSync(filename)).digest('hex');
const inputHashes = Object.fromEntries(protectedFiles.map(filename => [filename, hashFile(filename)]));
const oldAssertion = '  assert.match(lobby, /DEMO CHARACTER[\\s\\S]*Lv\\.1 START · Stage 1-1 · Lv\\.100 Cap/);';
assert.equal(original.split(oldAssertion).length - 1, 1);
const newAssertion = `  const names = ['_lobbyCardLeaf', '_lobbyDemoCardLabel', '_lobbyDemoCharacterName', '_lobbyLang', '_TL'];
  const functions = new Map();
  let englishTable;
  for (const script of lobby.matchAll(/<script\\b[^>]*>([\\s\\S]*?)<\\/script>/g)) {
    for (const node of parse(script[1], { ecmaVersion: 'latest' }).body) {
      if (node.type === 'FunctionDeclaration' && names.includes(node.id.name)) functions.set(node.id.name, script[1].slice(node.start, node.end));
      if (node.type === 'VariableDeclaration') {
        for (const declaration of node.declarations) {
          if (declaration.id.name === '_LOBBY_EN') englishTable = script[1].slice(declaration.init.start, declaration.init.end);
        }
      }
    }
  }
  assert.ok(englishTable);
  for (const name of names) assert.ok(functions.has(name), name);
  for (const language of ['ko', 'en']) {
    const context = vm.createContext({ getCurrentLanguage: () => language });
    vm.runInContext('const _LOBBY_EN=' + englishTable + ';const _LOBBY_TABLES={en:_LOBBY_EN};' + names.map(name => functions.get(name)).join('\\n'), context);
    for (const progress of [null, Object.freeze({ lv: 46, kills: 1795 }), Object.freeze({ lv: 100, kills: 0 })]) {
      const leaves = { '.char-name': { children: [], textContent: '' }, '.char-info': { children: [], textContent: '' } };
      const card = { querySelector: selector => leaves[selector] };
      const before = JSON.stringify(progress);
      const expectedName = language === 'ko' ? '대검전사' : 'Greatsword Warrior';
      assert.equal(context._lobbyDemoCardLabel(card, progress), expectedName);
      assert.equal(leaves['.char-name'].textContent, expectedName);
      if (progress) {
        const expectedInfo = 'Lv.' + progress.lv + ' · Stage 1-1 · ' + (language === 'ko' ? '처치' : 'Kills') + ' ' + progress.kills.toLocaleString() + ' · ' + (language === 'ko' ? '브라우저 저장' : 'Saved in this browser');
        assert.equal(leaves['.char-info'].textContent, expectedInfo);
        assert.doesNotMatch(leaves['.char-info'].textContent, /Lv\\.1 START|Lv\\.100 Cap/);
      } else assert.equal(leaves['.char-info'].textContent, 'Lv.1 START · Stage 1-1 · Lv.100 Cap');
      assert.equal(JSON.stringify(progress), before);
    }
  }`;
const candidate = original.replace("import { readFile } from 'node:fs/promises';", "import { readFile } from 'node:fs/promises';\nimport vm from 'node:vm';\nimport { parse } from 'acorn';").replace(oldAssertion, newAssertion);
parse(candidate, { ecmaVersion: 'latest', sourceType: 'module' });
const candidatePath = `${folder}/demo-scope-candidate.test.mjs`;
const relocate = text => text.replaceAll("new URL('../", "new URL('../../../");
fs.writeFileSync(`${folder}/demo-scope-original.test.mjs`, relocate(original));
fs.writeFileSync(candidatePath, relocate(candidate));
const rawCandidate = `${folder}/demo-scope-unapplied.test.js`;
fs.writeFileSync(rawCandidate, candidate);
let patch;
try { patch = execFileSync('diff', ['-u', '--label', 'a/test/demoScope.test.js', '--label', 'b/test/demoScope.test.js', 'test/demoScope.test.js', rawCandidate], { encoding: 'utf8' }); }
catch (error) { if (error.status !== 1) throw error; patch = error.stdout; }
fs.writeFileSync(`${folder}/demo-scope.with-context.diff`, patch);
const replayLines = original.split('\n');
const patchLines = patch.split('\n');
const hunks = [];
for (let index = 2; index < patchLines.length; index++) {
  const header = /^@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@/.exec(patchLines[index]);
  if (!header) continue;
  const before = [], after = [];
  for (index++; index < patchLines.length && !patchLines[index].startsWith('@@'); index++) {
    const line = patchLines[index];
    if (line.startsWith(' ') || line.startsWith('-')) before.push(line.slice(1));
    if (line.startsWith(' ') || line.startsWith('+')) after.push(line.slice(1));
  }
  index--; assert.equal(before.length, Number(header[2] || 1)); assert.equal(after.length, Number(header[4] || 1));
  hunks.push({ line: Number(header[1]), before, after });
}
for (const hunk of [...hunks].reverse()) {
  assert.deepEqual(replayLines.slice(hunk.line - 1, hunk.line - 1 + hunk.before.length), hunk.before);
  replayLines.splice(hunk.line - 1, hunk.before.length, ...hunk.after);
}
assert.equal(replayLines.join('\n'), candidate);
function run(name, files, expectedPass, expectedFail) {
  const result = spawnSync(process.execPath, ['--test', '--test-reporter=tap', ...files], { encoding: 'utf8', timeout: 30000, maxBuffer: 16 * 1024 * 1024 });
  if (result.error) throw result.error;
  fs.writeFileSync(`${folder}/demo-scope-${name}.log`, result.stdout + result.stderr);
  const passes = Number(/^# pass (\d+)$/m.exec(result.stdout)?.[1]);
  const failures = Number(/^# fail (\d+)$/m.exec(result.stdout)?.[1]);
  assert.equal(passes, expectedPass, name); assert.equal(failures, expectedFail, name); assert.equal(result.status, expectedFail ? 1 : 0, name);
  return { name, passes, failures, exit: result.status, command: [process.execPath, '--test', '--test-reporter=tap', ...files] };
}
const runs = [
  run('before', [`${folder}/demo-scope-original.test.mjs`, 'test/demoSaveRoute.test.js'], 10, 1),
  run('after', [candidatePath, 'test/demoSaveRoute.test.js'], 11, 0)
];
const beforeLog = fs.readFileSync(`${folder}/demo-scope-before.log`, 'utf8');
assert.match(beforeLog, /not ok \d+ - the lobby and demo build notes describe the same 1-1 level 100 scope/);
assert.doesNotMatch(beforeLog, /_demoActivateSlot is not defined/);
const languageRun = spawnSync(process.execPath, ['--test', '--test-reporter=tap', 'test/lobbyCardLanguage.test.js'], { encoding: 'utf8', timeout: 30000, maxBuffer: 1024 * 1024 });
if (languageRun.error) throw languageRun.error;
fs.writeFileSync(`${folder}/demo-scope-language.log`, languageRun.stdout + languageRun.stderr);
assert.equal(languageRun.status, 0);
runs.push({ name: 'lobbyCardLanguage', passes: Number(/^# pass (\d+)$/m.exec(languageRun.stdout)?.[1]), failures: Number(/^# fail (\d+)$/m.exec(languageRun.stdout)?.[1]), exit: languageRun.status });
const negativeControls = [];
for (const [name, before, after] of [
  ['new-level', "'Lv.1 START · Stage 1-1 · Lv.100 Cap'", "'Lv.2 START · Stage 1-1 · Lv.100 Cap'"],
  ['saved-progress', "'Lv.'+progress.lv", "'Lv.1'"],
  ['english-translation', "'처치':'Kills'", "'처치':'Wrong label'"]
]) {
  assert.equal(index.split(before).length - 1, 1, name);
  const mutantLobbyPath = `${folder}/demo-scope-${name}-index.html`;
  fs.writeFileSync(mutantLobbyPath, index.replace(before, after));
  const mutantTestPath = `${folder}/demo-scope-${name}.test.mjs`;
  fs.writeFileSync(mutantTestPath, relocate(candidate).replace("new URL('../../../index.html', import.meta.url)", `new URL('./demo-scope-${name}-index.html', import.meta.url)`));
  negativeControls.push(run(name, [mutantTestPath], 2, 1));
}
for (const filename of protectedFiles) assert.equal(hashFile(filename), inputHashes[filename], filename);
const functions = [];
for (const script of index.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)) for (const node of parse(script[1], { ecmaVersion: 'latest' }).body) {
  if (node.type === 'FunctionDeclaration' && ['_lobbyDemoCardLabel', '_lobbyDemoCharacterName', '_lobbyCardLeaf', '_TL', '_lobbyLang'].includes(node.id.name)) {
    const text = script[1].slice(node.start, node.end);
    functions.push({ name: node.id.name, text, line: index.slice(0, script.index + script[0].indexOf(script[1]) + node.start).split('\n').length, sha256: crypto.createHash('sha256').update(text).digest('hex') });
  }
}
fs.writeFileSync(`${folder}/demo-scope-validation.json`, JSON.stringify({ observedAt: new Date().toISOString(), inputHashes, candidateTestSha256: crypto.createHash('sha256').update(candidate).digest('hex'), contextHunks: hunks.length, patchReplay: 'PASS', runs, negativeControls, functions, productionApplied: false, sharedTestsModified: false, visualVerdict: 'UNKNOWN' }, null, 2) + '\n');
console.log(JSON.stringify(runs));
