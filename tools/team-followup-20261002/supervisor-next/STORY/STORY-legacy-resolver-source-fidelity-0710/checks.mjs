// STORY-legacy-resolver-source-fidelity-0710 — 보존 legacy resolver의 "실제 원문 추출" 경계 검증
//
// 0553의 7 assertion은 손으로 복사한 식/데이터 메모리 검사였다. 이번에는 실제 파일에서
// (1) showLine의 _cinTxt resolver 식, (2) CIN_LINES 배열 리터럴, (3) _CIN_I18N 보충 데이터를
// '검증 가능한 원문 범위(라인 슬라이스 + 마커 단언)'로 추출해 VM에서 순수 식/데이터만 실행한다.
// DOM/movie/player/getCurrentLanguage/boot/timer는 실행하지 않는다. _cLang/idx는 SYNTH 입력.
// productionApplied=false. runtime/native/실영화 QA 아님.
//
// 실행: /Users/fordeargamers/.local/node-runtime/node-v24.15.0-darwin-arm64/bin/node checks.mjs
//
// 추출 원문 위치(이번 Read 시점 현재 source):
//   index.html:2200-2221  const CIN_LINES=[ ... ];
//   index.html:2317        const _cinTxt=_cLang==='ko'?line.text:( ... );   (showLine 내 resolver)
//   lobby_i18n.js:1327-1880 const _CIN_I18N = { ... };

import fs from 'node:fs';
import crypto from 'node:crypto';
import vm from 'node:vm';

const ROOT = '/Users/fordeargamers/Projects/exoduser-migration-20261001';
const sha = s => crypto.createHash('sha256').update(s).digest('hex');
const readLines = p => fs.readFileSync(p, 'utf8').split('\n'); // 1-indexed via [n-1]

function sliceByLines(lines, from, to){ return lines.slice(from-1, to).join('\n'); }

// ── (1) 실제 파일 읽기 ──
const idxPath = ROOT + '/index.html';
const i18nPath = ROOT + '/lobby_i18n.js';
const idxLines = readLines(idxPath);
const i18nLines = readLines(i18nPath);

// ── (2) 원문 범위 추출 + 마커 단언 (손복사 아님) ──
const cinRaw = sliceByLines(idxLines, 2200, 2221);
if(!cinRaw.startsWith('const CIN_LINES=[') || !cinRaw.trimEnd().endsWith('];'))
  throw new Error('CIN_LINES 마커 불일치 — 추출 경계 변동, 억지 PASS 금지');
const cinLiteral = cinRaw.replace(/^const CIN_LINES=/, '').replace(/;\s*$/, ''); // [ ... ]

const i18nRaw = sliceByLines(i18nLines, 1327, 1880);
if(!i18nRaw.startsWith('const _CIN_I18N = {') || !i18nRaw.trimEnd().endsWith('};'))
  throw new Error('_CIN_I18N 마커 불일치 — 추출 경계 변동, 억지 PASS 금지');
const i18nLiteral = i18nRaw.replace(/^const _CIN_I18N = /, '').replace(/;\s*$/, ''); // { ... }

const resolverLine = idxLines[2317-1]; // line 2317
const m = resolverLine.match(/^\s*const _cinTxt=(.*);\s*$/);
if(!m) throw new Error('resolver(_cinTxt) 마커 불일치 — 추출 실패, 억지 PASS 금지');
const resolverRHS = m[1]; // 원문 식 (verbatim)

// ── (3) 순수 데이터/식을 VM에서 평가 (DOM/boot 없음) ──
const sandbox = {};
vm.createContext(sandbox);
const CIN = vm.runInContext('(' + cinLiteral + ')', sandbox, {filename:'extracted-CIN_LINES'});
const I18N = vm.runInContext('(' + i18nLiteral + ')', sandbox, {filename:'extracted-_CIN_I18N'});

// 현재 resolver: 원문 RHS 그대로 함수화 (line,_cLang,idx,_CIN_I18N 순수 입력)
const currentResolver = vm.runInContext(
  `(function(line,_cLang,idx,_CIN_I18N){ return (${resolverRHS}); })`,
  sandbox, {filename:'extracted-resolver-current'});

// 후보: 원문 RHS의 non-KO 접점만 최소 수정(명시적 빈 문자열 존중). fallback 텍스트는 원문 재사용.
const KO_PREFIX = "_cLang==='ko'?line.text:(";
if(!resolverRHS.startsWith(KO_PREFIX) || !resolverRHS.endsWith(')'))
  throw new Error('resolver 구조(KO 삼항) 예상과 다름 — 후보 diff 중단');
const nonKo = resolverRHS.slice(KO_PREFIX.length, -1); // line[_cLang]|| ... ||line.text
const LEAD = 'line[_cLang]||';
if(!nonKo.startsWith(LEAD)) throw new Error('non-KO 선두 접점 불일치 — 후보 diff 중단');
const fallbackText = nonKo.slice(LEAD.length); // (typeof _CIN_I18N...)||line.en||line.text  (원문 재사용)
const candidateNonKo = `(typeof line[_cLang]==='string'?line[_cLang]:(${fallbackText}))`;
const candidateRHS = `${KO_PREFIX}${candidateNonKo})`;
const candidateResolver = vm.runInContext(
  `(function(line,_cLang,idx,_CIN_I18N){ return (${candidateRHS}); })`,
  sandbox, {filename:'candidate-resolver'});

// ── 프래그먼트/전체 SHA ──
console.log('== 원문 추출 근거 ==');
console.log('index.html  whole SHA256   :', sha(fs.readFileSync(idxPath)));
console.log('lobby_i18n.js whole SHA256 :', sha(fs.readFileSync(i18nPath)));
console.log('CIN_LINES fragment SHA256  :', sha(cinRaw), '(index.html:2200-2221)');
console.log('_CIN_I18N fragment SHA256  :', sha(i18nRaw), '(lobby_i18n.js:1327-1880)');
console.log('resolver line SHA256       :', sha(resolverLine), '(index.html:2317)');
console.log('CIN_LINES length           :', CIN.length, '/ _CIN_I18N langs:', Object.keys(I18N).length);
console.log('resolver RHS (원문)        :', resolverRHS);
console.log('candidate RHS (후보)       :', candidateRHS);

// ── SYNTH 입력 (작게 고정) ──
const synth = [
  {label:'cue13 / de (명시적 빈 non-KO)', idx:13, lang:'de'},
  {label:'cue18 / de (명시적 빈 non-KO)', idx:18, lang:'de'},
  {label:'cue0  / de (실제 비어있지 않은)', idx:0,  lang:'de'},
  {label:'cue13 / ko (KO 실제 빈 cue)',    idx:13, lang:'ko'},
  {label:'cue0  / ms (inline key 없는 언어)', idx:0, lang:'ms'},
];

// 실제 데이터 상태 프로브 (inline key 존재/빈/부재, _CIN_I18N 보유 여부) — 원문 기준
function probe(idx, lang){
  const line = CIN[idx];
  const has = Object.prototype.hasOwnProperty.call(line, lang);
  const val = line[lang];
  const i18nHas = I18N[lang] && Object.prototype.hasOwnProperty.call(I18N[lang], idx);
  return {has, typeofVal: typeof val, isEmpty: val==='', i18nHas, i18nVal: i18nHas? I18N[lang][idx] : undefined};
}

let pass=0, fail=0;
const check=(name,got,want)=>{const ok=Object.is(got,want);console.log(`${ok?'PASS':'FAIL'} | ${name} | got=${JSON.stringify(got)} want=${JSON.stringify(want)}`);ok?pass++:fail++;};

console.log('\n== SYNTH 입력 × 현재식/후보식 (원문 데이터) ==');
for(const s of synth){
  const line = CIN[s.idx];
  if(!line){ console.log(`SKIP  | ${s.label} | cue ${s.idx} 원문에 없음 → UNKNOWN(실행 안 함)`); continue; }
  const pr = probe(s.idx, s.lang);
  const cur = currentResolver(line, s.lang, s.idx, I18N);
  const cand = candidateResolver(line, s.lang, s.idx, I18N);
  const src = s.lang==='ko' ? 'line.text(KO분기)'
    : (pr.has && pr.typeofVal==='string' && !pr.isEmpty) ? 'inline line[lang]'
    : (pr.has && pr.isEmpty && pr.i18nHas) ? '_CIN_I18N[lang][idx] (빈 inline이 falsy라 fallback)'
    : (pr.has && pr.isEmpty && !pr.i18nHas) ? 'line.en/line.text (빈 inline, _CIN_I18N 없음)'
    : (!pr.has && pr.i18nHas) ? '_CIN_I18N[lang][idx] (inline key 부재)'
    : (!pr.has && !pr.i18nHas) ? 'line.en/line.text (inline key 부재, _CIN_I18N 없음)'
    : '기타';
  console.log(`\n[${s.label}]`);
  console.log(`  probe: inlineKey=${pr.has} typeof=${pr.typeofVal} empty=${pr.isEmpty} _CIN_I18N[idx]=${pr.i18nHas}${pr.i18nHas?(' ('+JSON.stringify(pr.i18nVal)+')'):''}`);
  console.log(`  현재식 → ${JSON.stringify(cur)}  [empty=${cur===''}]  선택출처=${src}`);
  console.log(`  후보식 → ${JSON.stringify(cand)}  [empty=${cand===''}]`);
}

// ── 유의미 assertion (원문 데이터·원문 현재식 기반) ──
console.log('\n== assertions ==');
{
  const line13 = CIN[13];
  // 현재식: cue13/de 명시적 빈 inline이 falsy → _CIN_I18N.de[13] 반환(비어있지 않음)
  check('현재식 cue13/de 는 비어있지 않다(legacy 치환)', currentResolver(line13,'de',13,I18N)!=='', true);
  check('현재식 cue13/de == _CIN_I18N.de[13] (원문 fallback 사용)',
    currentResolver(line13,'de',13,I18N), I18N.de && I18N.de[13]);
  // 후보식: 동일 입력에서 명시적 빈 문자열 존중 → ''
  check('후보식 cue13/de 는 빈 문자열 존중', candidateResolver(line13,'de',13,I18N), '');
  // KO 빈 cue: 현재/후보 모두 ''
  check('현재식 cue13/ko == ""', currentResolver(line13,'ko',13,I18N), '');
  check('후보식 cue13/ko == ""', candidateResolver(line13,'ko',13,I18N), '');
  // 실제 비어있지 않은 inline(cue0/de): 현재=후보 동일, 변경 없음
  const line0 = CIN[0];
  check('cue0/de 현재식==후보식 (비어있지 않은 inline 불변)',
    currentResolver(line0,'de',0,I18N), candidateResolver(line0,'de',0,I18N));
  check('cue0/de 현재식 == line0.de (inline 우선)', currentResolver(line0,'de',0,I18N), line0.de);
  // inline key 부재(ms): 실제 데이터에 ms 키 없으면 fallback 경로 — 현재=후보 동일
  const p = probe(0,'ms');
  if(!p.has){
    check('cue0/ms inline key 부재 → 현재식==후보식 (fallback 불변)',
      currentResolver(line0,'ms',0,I18N), candidateResolver(line0,'ms',0,I18N));
  } else {
    console.log('NOTE | cue0 에 ms inline key 존재 → ms 부재 케이스 미실행(UNKNOWN)');
  }
}

console.log(`\n== ${pass} PASS / ${fail} FAIL ==`);
console.log('SYNTH=_cLang/idx만 합성. 데이터/식은 원문 추출. null/undefined/비문자열 정책은 현재 자료에 해당 값 없어 미검수.');
console.log('productionApplied=false · 보존 legacy 식 결함 근거 ≠ 현행 영화 정상경로 미사용 · runtime/native/실영화 QA 아님');
process.exit(fail?1:0);
