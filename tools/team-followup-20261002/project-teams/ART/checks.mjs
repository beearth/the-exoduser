// emg1-lock-review: 기존 파일 정체·규격·현재 연결만 검증. 이미지 변환/게임 실행/쓰기 없음.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = '/Users/fordeargamers/Projects/exoduser-migration-20261001';
const owner = path.dirname(fileURLToPath(import.meta.url));
const sha = b => crypto.createHash('sha256').update(b).digest('hex');
const read = p => fs.readFileSync(path.join(root, p));
const images = [
  ['original', 'assets/cutscene/warintro/emg1.jpg', 1536, 1024, 'no', 527153, '96e5e41900c60292488bb4cd3a2becf2e98297e522143177143f0be3b31fabf1'],
  ['candidate1_rejected', 'output/cutscene_remaster_20260930/warintro_candidates_unreviewed/emg1_candidate1_rejected.jpg', 2048, 1152, 'no', 579635, '1b01d8b5a22d0e56f3b664922d00c71880daba8b38df4603124bcc96cbf628f3'],
  ['candidate2_reviewed', 'output/cutscene_remaster_20260930/warintro_candidates_unreviewed/emg1_candidate2_retry.jpg', 2048, 1152, 'no', 612213, 'ca3802be4bab276452395427eb03ca3ff422d9c478fbc5b50f4dec1fdab49ae2'],
  ['identity_lock', 'docs/11내러티브·로어디자인/assets/warrior_identity_ref.png', 940, 544, 'no', 325568, '3bbde9d07e9a88d0b849ef6913a3f2c78ccca57e412461f206864c788c5c7868'],
  ['face_lock', 'docs/11내러티브·로어디자인/assets/warrior_face_ref.png', 410, 484, 'no', 229493, 'b8aae22efd571298731ebee12061ef9b76ce4542e3c816af97a99d15347f0648'],
  ['main_lock', 'assets/charselect/warrior_cut.png', 1223, 986, 'yes', 1670346, '58e68f5f996c31966e9109c2de421185d93d138cec4fd5600da0ca1b58debfd4'],
];
const results = [], metadata = [], sourceContracts = [];
function check(id, fn) {
  try { fn(); results.push({ id, status: 'PASS' }); }
  catch (error) { results.push({ id, status: 'FAIL', error: error.message }); }
}
for (const [id, p, w, h, alpha, bytes, expectedSha] of images) {
  check(`asset-${id}`, () => {
    const b = read(p);
    const info = execFileSync('/usr/bin/sips', ['-g', 'pixelWidth', '-g', 'pixelHeight', '-g', 'hasAlpha', path.join(root, p)], { encoding: 'utf8' });
    const width = Number(info.match(/pixelWidth: (\d+)/)?.[1]);
    const height = Number(info.match(/pixelHeight: (\d+)/)?.[1]);
    const hasAlpha = info.match(/hasAlpha: (\w+)/)?.[1];
    const row = { id, path: path.join(root, p), sha256: sha(b), bytes: b.length, width, height, aspectRatio: width / height, hasAlpha, alphaMethod: 'sips hasAlpha; 알파 픽셀 분포/부분투명 경계 미측정' };
    metadata.push(row);
    assert.deepEqual([width, height, hasAlpha, b.length, sha(b)], [w, h, alpha, bytes, expectedSha]);
  });
}
for (const p of ['game.html', 'game-easy-test.html']) {
  const b = read(p), source = b.toString('utf8');
  const entries = source.split('\n').map((text, index) => ({ text, line: index + 1 })).filter(r => /id:'wa2[67]',img:'warintro\/emg1\.jpg'/.test(r.text));
  sourceContracts.push({ path: path.join(root, p), wholeSha256: sha(b), entries, entriesSha256: sha(Buffer.from(entries.map(r => r.text).join('\n'))), loaderLine: source.split('\n').findIndex(s => s.includes("+'?v=20261001-warstills2'")) + 1 });
  check(`${p}-wa26-contract`, () => {
    const rows = entries.filter(r => r.text.includes("id:'wa26'"));
    assert.equal(rows.length, 4);
    for (const { text } of rows) for (const token of ['t:78900,dur:3600', "col:'#ddc8a0'", "cam:{zs:1.08,ze:1.04,ease:'out'}", "fade:{type:'cross',in:600}"]) assert.ok(text.includes(token), token);
  });
  check(`${p}-wa27-contract`, () => {
    const rows = entries.filter(r => r.text.includes("id:'wa27'"));
    assert.equal(rows.length, 4);
    for (const { text } of rows) for (const token of ["t:82500,dur:2300", "text:''", 'cam:{zs:1.04,ze:1.04}', "fade:{type:'cross',in:1}"]) assert.ok(text.includes(token), token);
  });
  check(`${p}-current-loader`, () => assert.ok(source.includes("'assets/cutscene/'+filename+'?v=20261001-warstills2'")));
  check(`${p}-candidates-unconnected`, () => assert.ok(!/emg1_candidate[12]/.test(source)));
}
const protectedFiles = [
  ['docs/17게임아트팀/ART_TEAM_MASTER.md', '631c25b0b0efeae1968cf90154677606d142d2654af3c3ec1ba87c36d5a61aad'],
  ['docs/11내러티브·로어디자인/WARRIOR_DESIGN_LOCK.md', 'ce40b9dec2f7ee670ec3798d614561cbdaedd71fd8a51238d15fb4b56365ea58'],
  ['docs/cinematic/WARINTRO_STILLS_AUDIT_20261001.md', '10aa9d3172b21eeaeab594af79d5fd5abf5e65d0733bebfaf12704e3e348f452'],
  ['tools/team-followup-20261002/project-teams/ART/task.md', '9c89892ee653f8e7643798a11b3544a8c82ac4b02a1e04943a866db062af42b9'],
];
for (const [p, expected] of protectedFiles) check(`unchanged-${p}`, () => assert.equal(sha(read(p)), expected));
check('owner-output-limit', () => assert.ok(fs.readdirSync(owner).filter(p => p !== 'task.md').length <= 3));
const failureCount = results.filter(r => r.status === 'FAIL').length;
console.log(JSON.stringify({ task: 'emg1-lock-review', executedAtUTC: new Date().toISOString(), verificationKind: 'READ_ONLY_METADATA_AND_SOURCE_CONTRACT; visual PASS 아님', assertionGroups: results.length, pass: results.length - failureCount, fail: failureCount, results, metadata, sourceContracts }, null, 2));
process.exitCode = failureCount ? 1 : 0;
