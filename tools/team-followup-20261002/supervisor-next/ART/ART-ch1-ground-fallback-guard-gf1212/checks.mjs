// ART-ch1-ground-fallback-guard-gf1212  (epoch capacity-after-6a39b828-1212)
// 목표: MILESTONE-CH1-1-PLAYABLE 3행(ART) — CH1-1 길 가독성.
// 경계: buildMapCache 지면 소비자(Pass 0.4 / Pass 0.5)가 _FB64(1x1 투명) 404-fallback을
//       naturalWidth>0 가드로 통과시켜 (a) 투명 지면=길 가독성 상실 (b) spacing='native'→step=1px
//       → drawImage O(맵픽셀²) 폭주=맵 캐시 빌드 행. _gtFloorImg는 이미 >1로 올바로 거른다.
// 성격: 읽기 전용 source 분석 + 메모리 대조. game.html 미수정(production=root 소유). 에셋/geometry/LOCK 변경 0.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';

const ROOT = '/Users/fordeargamers/Projects/exoduser-migration-20261001';
const sha = b => crypto.createHash('sha256').update(b).digest('hex');
const readB = p => fs.readFileSync(path.join(ROOT, p));
const exists = p => fs.existsSync(path.join(ROOT, p));

const src = readB('game.html').toString('utf8');
const gameSha = sha(Buffer.from(src));
const lines = src.split('\n');
function anchor(needle) {
  const i = lines.findIndex(l => l.includes(needle));
  assert.ok(i >= 0, 'anchor not found (source may have shifted): ' + needle);
  return { line: i + 1, text: lines[i].trim() };
}

// ── 실제 소스 앵커(라인번호 아닌 내용으로 고정; root WIP로 라인 이동해도 추적) ──
const A = {
  pass04_guard: anchor('const allReady=tiles.every(tid=>_GROUND_TILES[tid]&&_GROUND_TILES[tid].complete&&_GROUND_TILES[tid].naturalWidth>0)'),
  pass04_spacing: anchor("gtDef.spacingPx==='native'?src.naturalWidth:gtDef.spacingPx"),
  pass05_guard: anchor('if(_mapTexImgs[G.stage]&&_mapTexImgs[G.stage].complete&&!_useSoftFloorEdge())'),
  gtfloor_precedent: anchor('if(im&&im.complete&&im.naturalWidth>1)return im'),
  fb64_def: anchor("const _FB64='data:image/png;base64,iVBORw0KGgo"),
  maptex_loader: anchor("[MAP-TEX] stage '+sid+' 404→fallback"),
  gt_loader: anchor("[GT] '+id+' 404→fallback"),
  gt_stage_map: anchor("0:{tiles:['gt_03'],spacingPx:'native'}"),
  gt03_file: anchor("'gt_03':'assets/map/ch1/ground_tile_03.png'"),
  maptex_empty: anchor('const _MAP_TEX_FILES={}'),
};

// ── 실파일 상태(결함이 현재 활성인지 잠재인지) ──
const gt03Path = 'assets/map/ch1/ground_tile_03.png';
const gt03 = exists(gt03Path) ? { exists: true, bytes: readB(gt03Path).length } : { exists: false };
const mapTexEmpty = /const _MAP_TEX_FILES=\{\}/.test(src);

// ── 메모리 대조 하니스: healthy vs _FB64, 현재가드(>0) vs 제안가드(>1) ──
const T = 40; // game.html 타일 px
function simulatePass04(naturalWidth, mw, mh) {
  const ready_cur = naturalWidth > 0;         // 현재 25727
  const ready_new = naturalWidth > 1;         // 제안
  const spPx = naturalWidth;                   // spacingPx:'native' → src.naturalWidth
  const drawCalls_current = (ready_cur && spPx > 0) ? Math.ceil(mw * T / spPx) * Math.ceil(mh * T / spPx) : 0;
  const drawCalls_proposed = ready_new ? Math.ceil(mw * T / spPx) * Math.ceil(mh * T / spPx) : 0; // skip→0, 소일 폴백으로
  return { naturalWidth, ready_cur, ready_new, spPx, drawCalls_current, drawCalls_proposed };
}
const MW = 120, MH = 120; // 대표 CH1-1 맵(타일)
const healthy = simulatePass04(1024, MW, MH); // gt_03 정상
const fb64 = simulatePass04(1, MW, MH);       // 404→_FB64

const checks = []; const ck = (id, fn) => { try { fn(); checks.push({ id, status: 'PASS' }); } catch (e) { checks.push({ id, status: 'FAIL', error: e.message }); } };

// 결함 실증: 현재 가드는 _FB64를 통과시키고 폭주/투명을 만든다
ck('defect-current-guard-accepts-FB64', () => assert.equal(fb64.ready_cur, true));
ck('defect-current-FB64-draw-explosion', () => assert.ok(fb64.drawCalls_current > 1e7, 'expected >10M, got ' + fb64.drawCalls_current));
// 제안 가드: _FB64 거부(→skip→소일 폴백), healthy는 변화 없음
ck('fix-proposed-guard-rejects-FB64', () => assert.equal(fb64.ready_new, false));
ck('fix-proposed-skips-explosion', () => assert.equal(fb64.drawCalls_proposed, 0));
ck('fix-healthy-noop', () => assert.ok(healthy.ready_cur === true && healthy.ready_new === true && healthy.drawCalls_current === healthy.drawCalls_proposed));
// 선례: _gtFloorImg는 이미 >1로 _FB64를 올바로 거른다(일관성 근거)
ck('precedent-gtFloorImg-uses->1', () => assert.ok(A.gtfloor_precedent.text.includes('naturalWidth>1')));
// 현재 활성/잠재 판정
ck('gt03-exists-so-latent', () => assert.equal(gt03.exists, true)); // 실존 → 결함은 잠재(404시 활성)
ck('pass05-dormant-maptex-empty', () => assert.equal(mapTexEmpty, true)); // _MAP_TEX_FILES={} → Pass0.5 현재 비활성

const fail = checks.filter(c => c.status === 'FAIL').length;
const report = {
  task: 'ART-ch1-ground-fallback-guard-gf1212',
  milestone: 'MILESTONE-CH1-1-PLAYABLE-20261002 (ART 3행: 길/적/전조 가독성)',
  epoch: 'capacity-after-6a39b828-1212',
  executedAtUTC: new Date().toISOString(), node: process.version,
  verificationKind: 'SOURCE-ANCHOR + MEMORY-CONTROL. 실게임/카메라 visual PASS 아님(QA 인계)',
  gameHtmlSha256: gameSha,
  anchors: A,
  realFileState: { gt03: { path: gt03Path, ...gt03, status: '실존 → 결함 잠재(404/드롭/부분동기화 시 활성)' }, mapTexFiles: mapTexEmpty ? '{} (Pass 0.5 현재 비활성)' : '정의됨' },
  memoryControl: { map: `${MW}x${MH} tiles, T=${T}`, healthy, fb64 },
  proposedPatch: {
    'Pass 0.4 (25727 근방)': "naturalWidth>0  →  naturalWidth>1",
    'Pass 0.5 (25773 근방)': "...&&.complete  →  ...&&.complete&&_mapTexImgs[G.stage].naturalWidth>1",
    effect: 'healthy=no-op / 404→_FB64(nw=1)=가드 실패→Pass skip→_gtFloorImg 소일+절차적 지면 폴백(길 가독 유지, 빌드 행 방지)',
    scope: 'geometry·LOCK·에셋·캐릭터 변경 0. 기존 _gtFloorImg(>1)과 임계 일관화',
  },
  checks, checkPass: checks.length - fail, checkFail: fail,
  verdict: fail ? 'CHECK FAIL' : 'LATENT DEFECT CONFIRMED — 최소 가드 patch 후보 제시(실게임 카메라 인수는 QA/MAP 의존)',
};
console.log(JSON.stringify(report, null, 2));
process.exitCode = fail ? 1 : 0;
