// STORY-empty-only-type-preservation-0733 — empty-only 후보가 기존 truthy 값을 보존하는지 경계 검증
//
// 0710 후보(typeof line[_cLang]==='string' guard)는 명시적 빈 문자열뿐 아니라 "원문 OR가 반환하는
// truthy 비문자열"까지 fallback으로 보낸다(over-reach). 이번에는:
//   (1) index.html의 실제 _cinTxt resolver 식을 다시 검증 가능하게 추출(원문),
//   (2) SYNTH non-KO line/lang/idx + distinct fallback SENTINEL로,
//   (3) 원문식 / 0710 string-guard 후보 / 새 empty-only 후보 세 식을 비교한다.
// KO 경로 미변경. 실제 cue0/13/18·KO·ms 재실행 0. null/undefined normalization 추가 0.
// plain object fixture 범위 한정 — getter/Proxy/side-effect property reads·전체 호출순서 동등 미검수.
// 실제 source 데이터는 string 중심이므로 이 SYNTH 입력은 실제 movie cue/신규 제품 장애가 아니다.
// productionApplied=false.
//
// 실행: /Users/fordeargamers/.local/node-runtime/node-v24.15.0-darwin-arm64/bin/node checks.mjs

import fs from 'node:fs';
import crypto from 'node:crypto';
import vm from 'node:vm';

const ROOT = '/Users/fordeargamers/Projects/exoduser-migration-20261001';
const sha = s => crypto.createHash('sha256').update(s).digest('hex');
const idxPath = ROOT + '/index.html';
const idxText = fs.readFileSync(idxPath, 'utf8');
const idxLines = idxText.split('\n');

// ── 원문 resolver 식 재추출 (라인 2317 + 마커 단언) ──
const resolverLine = idxLines[2317 - 1];
const m = resolverLine.match(/^\s*const _cinTxt=(.*);\s*$/);
if (!m) throw new Error('resolver(_cinTxt) 마커 불일치 — 추출 실패, 억지 PASS 금지');
const resolverRHS = m[1]; // 원문 verbatim

const KO_PREFIX = "_cLang==='ko'?line.text:(";
if (!resolverRHS.startsWith(KO_PREFIX) || !resolverRHS.endsWith(')'))
  throw new Error('resolver 구조(KO 삼항) 예상과 다름 — 중단');
const ORIGINAL_NONKO = resolverRHS.slice(KO_PREFIX.length, -1); // line[_cLang]|| ... ||line.text

// 세 식 (원문/0710 string-guard/새 empty-only). non-KO 접점만 차이.
const rhsOriginal = resolverRHS; // 원문 verbatim
const LEAD = 'line[_cLang]||';
const fallbackText = ORIGINAL_NONKO.slice(LEAD.length); // (typeof _CIN_I18N...)||line.en||line.text
const rhsStringGuard = `${KO_PREFIX}(typeof line[_cLang]==='string'?line[_cLang]:(${fallbackText})))`;        // 0710 후보
const rhsEmptyOnly  = `${KO_PREFIX}line[_cLang]===''?'':(${ORIGINAL_NONKO}))`;                                 // 새 empty-only (원문 non-KO 재사용)

const sandbox = {}; vm.createContext(sandbox);
const mk = rhs => vm.runInContext(`(function(line,_cLang,idx,_CIN_I18N){ return (${rhs}); })`, sandbox);
const fOriginal = mk(rhsOriginal), fStringGuard = mk(rhsStringGuard), fEmptyOnly = mk(rhsEmptyOnly);

console.log('== 원문 추출 근거 ==');
console.log('index.html whole SHA256 :', sha(idxText));
console.log('resolver line SHA256     :', sha(resolverLine), '(index.html:2317)');
console.log('원문 RHS       :', rhsOriginal);
console.log('0710 string-guard RHS :', rhsStringGuard);
console.log('empty-only RHS :', rhsEmptyOnly);

// ── SYNTH 입력 (plain object fixture, distinct fallback SENTINEL) ──
const SENTINEL = '<<FALLBACK-SENTINEL>>';
const OBJ = { marker: 'same-ref-object' };
const mkLine = v => ({ de: v, en: SENTINEL, text: SENTINEL }); // _CIN_I18N={} → en 이 fallback
const I18N_EMPTY = {}; // _CIN_I18N 분기 falsy 고정
const LANG = 'de', IDX = 0;

const cases = [
  { label: "빈 문자열 ''",        val: '' },
  { label: 'truthy 숫자 1',       val: 1 },
  { label: 'boolean true',        val: true },
  { label: '동일 참조 object',    val: OBJ },
  { label: 'falsy 0',             val: 0 },
];

console.log('\n== SYNTH non-KO (lang=de, idx=0, _CIN_I18N={}) · 원문 vs string-guard vs empty-only ==');
for (const c of cases) {
  const line = mkLine(c.val);
  const o = fOriginal(line, LANG, IDX, I18N_EMPTY);
  const s = fStringGuard(line, LANG, IDX, I18N_EMPTY);
  const e = fEmptyOnly(line, LANG, IDX, I18N_EMPTY);
  const fmt = x => x === OBJ ? 'OBJ(same-ref)' : JSON.stringify(x);
  console.log(`\n[${c.label}] line.de=${fmt(c.val)}`);
  console.log(`  원문       → ${fmt(o)}`);
  console.log(`  string-guard→ ${fmt(s)}  ${s===o?'(원문과 동일)':'(원문과 다름 ← over-reach 여부)'}`);
  console.log(`  empty-only → ${fmt(e)}  ${e===o?'(원문과 동일)':'(원문과 다름 ← 의도된 '+(c.val===''?"빈 정정":"?")+')'}`);
}

// ── assertions ──
let pass=0, fail=0;
const check=(n,got,want)=>{const ok=Object.is(got,want);console.log(`${ok?'PASS':'FAIL'} | ${n} | got=${got===OBJ?'OBJ':JSON.stringify(got)} want=${want===OBJ?'OBJ':JSON.stringify(want)}`);ok?pass++:fail++;};

console.log('\n== assertions (SENTINEL='+JSON.stringify(SENTINEL)+') ==');
// 원문: truthy 비문자열/object는 그대로 반환, ''·0 은 fallback
check('원문 1 → 1 (truthy 비문자열 보존)', fOriginal(mkLine(1),LANG,IDX,I18N_EMPTY), 1);
check('원문 true → true', fOriginal(mkLine(true),LANG,IDX,I18N_EMPTY), true);
check('원문 OBJ → 동일 참조', fOriginal(mkLine(OBJ),LANG,IDX,I18N_EMPTY), OBJ);
check('원문 "" → SENTINEL (빈은 falsy→fallback, 결함)', fOriginal(mkLine(''),LANG,IDX,I18N_EMPTY), SENTINEL);
check('원문 0 → SENTINEL', fOriginal(mkLine(0),LANG,IDX,I18N_EMPTY), SENTINEL);
// string-guard(0710): 비문자열 truthy를 fallback으로 보냄 = over-reach
check('string-guard 1 → SENTINEL (over-reach: 원문 1 파괴)', fStringGuard(mkLine(1),LANG,IDX,I18N_EMPTY), SENTINEL);
check('string-guard OBJ → SENTINEL (object identity 상실)', fStringGuard(mkLine(OBJ),LANG,IDX,I18N_EMPTY), SENTINEL);
check('string-guard "" → "" (빈 정정은 됨)', fStringGuard(mkLine(''),LANG,IDX,I18N_EMPTY), '');
// empty-only(새): '' 만 '' 로, 그 외 원문과 동일 (truthy 비문자열/object/0 보존)
check('empty-only "" → "" (빈만 정정)', fEmptyOnly(mkLine(''),LANG,IDX,I18N_EMPTY), '');
check('empty-only 1 → 1 (truthy 비문자열 보존)', fEmptyOnly(mkLine(1),LANG,IDX,I18N_EMPTY), 1);
check('empty-only true → true', fEmptyOnly(mkLine(true),LANG,IDX,I18N_EMPTY), true);
check('empty-only OBJ → 동일 참조 보존', fEmptyOnly(mkLine(OBJ),LANG,IDX,I18N_EMPTY), OBJ);
check('empty-only 0 → SENTINEL (기존 fallback 유지)', fEmptyOnly(mkLine(0),LANG,IDX,I18N_EMPTY), SENTINEL);

console.log(`\n== ${pass} PASS / ${fail} FAIL ==`);
console.log('원문식=추출 verbatim. string-guard/empty-only=후보(최소 transform, 원문 non-KO 재사용). SYNTH=plain object fixture.');
console.log('null/undefined/getter/Proxy/side-effect/call-order·실제 data 비문자열 정책 미검수. productionApplied=false.');
process.exit(fail?1:0);
