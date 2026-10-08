import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { bumpVersion, generatedJs, patchPackageJsonVersion, writeAll, checkSync, readRelease } from '../tools/release-version.mjs';
import { parseNoteFile, buildPatchNotesJs, classifySubject, draftFromSubjects, compareVersionDesc } from '../tools/patch-notes.mjs';

test('bumpVersion patch/minor', () => {
  assert.equal(bumpVersion('0.7.0', 'patch'), '0.7.1');
  assert.equal(bumpVersion('0.7.9', 'patch'), '0.7.10');
  assert.equal(bumpVersion('0.7.5', 'minor'), '0.8.0');
  assert.throws(() => bumpVersion('0.7.0', 'major'));
});

test('generatedJs shape', () => {
  assert.equal(generatedJs({ version: '0.7.1', date: '2026-10-10' }),
    'window.EXODUSER_RELEASE={version:"0.7.1",date:"2026-10-10"};\n');
});

test('patchPackageJsonVersion preserves formatting, changes only the version value', () => {
  const src = '{\n  "name": "x",\n  "version": "1.0.0",\n  "scripts": { "v": "echo version 1.0.0" }\n}\n';
  const out = patchPackageJsonVersion(src, '0.7.1');
  assert.match(out, /"version": "0\.7\.1"/);
  assert.ok(out.includes('"echo version 1.0.0"'), 'only the version field value changes');
  assert.equal(JSON.parse(out).version, '0.7.1');
});

test('writeAll + checkSync detect sync and desync', () => {
  const root = mkdtempSync(join(tmpdir(), 'relver-'));
  writeFileSync(join(root, 'package.json'), '{\n  "name": "t",\n  "version": "0.0.0"\n}\n');
  writeFileSync(join(root, 'release-version.json'), JSON.stringify({ version: '0.7.0', date: '2026-10-09', channel: 'ea-full' }));
  writeAll(readRelease(root), root);
  assert.deepEqual(checkSync(root).problems, []);
  assert.equal(JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')).version, '0.7.0');
  writeFileSync(join(root, 'release-version.js'), 'window.EXODUSER_RELEASE={version:"9.9.9",date:"2026-01-01"};\n');
  assert.ok(checkSync(root).problems.some(p => /out of sync/.test(p)));
});

test('parseNoteFile extracts frontmatter and KO/EN sections', () => {
  const md = ['---', 'version: 0.7.0', 'date: 2026-10-09', 'status: final', '---', '',
    '## KO', '', '### 새 기능', '- 가 추가', '- 나 추가', '', '### 버그 수정', '- 다 수정', '',
    '## EN', '', '### New', '- added A', '', '### Fixed', '- fixed B', ''].join('\n');
  const n = parseNoteFile(md);
  assert.equal(n.version, '0.7.0');
  assert.equal(n.status, 'final');
  assert.deepEqual(n.ko.sections.map(s => s.title), ['새 기능', '버그 수정']);
  assert.deepEqual(n.ko.sections[0].items, ['가 추가', '나 추가']);
  assert.deepEqual(n.en.sections[1].items, ['fixed B']);
  assert.throws(() => parseNoteFile(md.replace('status: final', 'status: wip')));
  assert.throws(() => parseNoteFile(md.replace('## EN', '## XX')), /KO.*EN|EN/);
});

test('buildPatchNotesJs sorts latest first and keeps at most 5', () => {
  const mk = v => ({ version: v, date: '2026-10-09', status: 'final', ko: { sections: [] }, en: { sections: [] } });
  const js = buildPatchNotesJs(['0.7.0', '0.7.2', '0.6.9', '0.7.10', '0.7.3', '0.7.1'].map(mk));
  assert.ok(js.startsWith('window.EXODUSER_PATCH_NOTES=['));
  const arr = JSON.parse(js.slice(js.indexOf('=') + 1, -2));
  assert.equal(arr.length, 5);
  assert.deepEqual(arr.map(e => e.version), ['0.7.10', '0.7.3', '0.7.2', '0.7.1', '0.7.0']);
  assert.ok(!('status' in arr[0]), 'status is not shipped');
  assert.equal(compareVersionDesc('0.7.2', '0.7.10'), 8);
});

test('classifySubject filters internal commits and buckets player-facing ones', () => {
  assert.equal(classifySubject('docs(release): 규칙'), null);
  assert.equal(classifySubject('chore(guard): baseline 갱신'), null);
  assert.equal(classifySubject('test(enemy): F06 하니스'), null);
  assert.equal(classifySubject('refactor(map-editor): internal'), null);
  assert.equal(classifySubject('chore: 세션 작업분 일괄 반영'), null);
  assert.equal(classifySubject('feat(item): 소켓 시스템').bucket, 0);
  assert.equal(classifySubject('fix(respawn): DOT 잔존 수정').bucket, 2);
  assert.equal(classifySubject('art(story): 몽타주').bucket, 1);
  const c = classifySubject('fix(map): 충돌 수정 a1b2c3d4e (MAP-019)');
  assert.ok(!/a1b2c3d4e|MAP-019/.test(c.line), 'hashes and tracker ids stripped');
});

test('draftFromSubjects produces a parseable draft', () => {
  const md = draftFromSubjects(['feat(a): 새 기능 하나', 'fix(b): 버그 하나', 'docs: 제외'], '0.7.1', '2026-10-10');
  const n = parseNoteFile(md);
  assert.equal(n.status, 'draft');
  assert.equal(n.version, '0.7.1');
  assert.ok(n.ko.sections.some(s => s.title === '새 기능' && s.items.includes('새 기능 하나')));
  assert.ok(!md.includes('제외'));
});
