// STORY-empty-cue-fallback-0553 — 빈 세계관 cue의 legacy 자막 선택 경계 검증 (source 정적)
//
// 목적: index.html 세계관 프롤로그 자막 resolver가 "의도적으로 빈 cue"와 "번역 키 누락"을
//       구분하는지 실제 resolver 식으로 판정한다. 생산 미반영(productionApplied=false),
//       DOM/타이머/미디어/전체 cinematic/실화면 PASS 아님. node v24.15.0로만 실행.
//
// 실행: /Users/fordeargamers/.local/node-runtime/node-v24.15.0-darwin-arm64/bin/node checks.mjs
//
// ── 실제 source 근거(읽은 시각/값) ──
// resolver (index.html:2316-2317, 비한국어 분기):
//   line[_cLang] || (typeof _CIN_I18N!=='undefined' && _CIN_I18N[_cLang] && _CIN_I18N[_cLang][idx]) || line.en || line.text
//   (ko 분기: _cLang==='ko' ? line.text)
// CIN_LINES cue13 (index.html:2214): 모든 언어 키 '' + text:'' + en:''   (img13, 의도적 빈 전환)
// CIN_LINES cue18 (index.html:2219): 모든 언어 키 '' + text:'' + en:''   (img18=타이틀 로고 컷)
// CIN_LINES cue0  (index.html:2201): de:'Es gibt unzählige Welten', en:'There are countless worlds', ms 키 없음
// _CIN_I18N (lobby_i18n.js:1327~): 16개 언어(zht,ru,de,ptbr,fr,pl,it,uk,tr,vi,th,id,ar,sv,da,no), OLD 전사 cue 색인 키
//   de[13]:'Alle im Hause Killu wussten es.'  de[18]:'Mit der Klinge trennte er Killus Gliedmaßen ab,'  (legacy war wa14/wa19)

// ── 실제 resolver 식 그대로 (현행) ──
function resolveCurrent(line, lang, idx, CIN_I18N){
  if(lang==='ko') return line.text;
  return line[lang] || (typeof CIN_I18N!=='undefined' && CIN_I18N[lang] && CIN_I18N[lang][idx]) || line.en || line.text;
}

// ── 최소 메모리 후보 (인계용, 생산 미반영): 자신의 inline 키가 "존재하고 문자열"이면 빈 문자열도 존중,
//    키 누락 시에만 기존 legacy→en→text 순서 유지 ──
function resolveCandidate(line, lang, idx, CIN_I18N){
  if(lang==='ko') return line.text;
  if(Object.prototype.hasOwnProperty.call(line, lang) && typeof line[lang]==='string') return line[lang];
  return (typeof CIN_I18N!=='undefined' && CIN_I18N[lang] && CIN_I18N[lang][idx]) || line.en || line.text;
}

// ── 실제 값 fixture (위 source 라인에서 발췌) ──
const CIN_I18N = {
  de: { 13:'Alle im Hause Killu wussten es.', 18:'Mit der Klinge trennte er Killus Gliedmaßen ab,' },
  // ms / ja 등은 _CIN_I18N에 블록 없음 (undefined)
};
const cue0  = { text:'우주에는 셀 수 없는 세계가 있다', en:'There are countless worlds', de:'Es gibt unzählige Welten' /* ms 키 없음 */ };
const cue13 = { text:'', en:'', de:'' /* 전 언어 '' */ };

let pass=0, fail=0;
function check(name, got, want){
  const ok = got===want;
  console.log(`${ok?'PASS':'FAIL'} | ${name} | got=${JSON.stringify(got)} want=${JSON.stringify(want)}`);
  ok?pass++:fail++;
}

// (A) 반례: 의도적 빈 cue13을 _CIN_I18N 보유 언어(de)로 — 현행은 legacy Killu 텍스트가 살아남
check('현행 cue13[de] = legacy 부활(반례)',
  resolveCurrent(cue13, 'de', 13, CIN_I18N),
  'Alle im Hause Killu wussten es.');

// (B) 정상 nonempty cue0을 de로 — inline이 항상 우선(_CIN_I18N 미참조=해당 cue에선 dead)
check('현행 cue0[de] = inline 우선',
  resolveCurrent(cue0, 'de', 0, CIN_I18N),
  'Es gibt unzählige Welten');

// (C) 누락 ms 폴백: cue0에 ms 키 없음 → en 폴백
check('현행 cue0[ms] = en 폴백',
  resolveCurrent(cue0, 'ms', 0, CIN_I18N),
  'There are countless worlds');

// (D) ko 특례: cue13[ko] = line.text('') 빈 유지
check('현행 cue13[ko] = 빈 유지',
  resolveCurrent(cue13, 'ko', 13, CIN_I18N), '');

// (E) 후보: cue13[de] = 빈 존중(legacy 부활 차단)
check('후보 cue13[de] = 빈 존중(정정)',
  resolveCandidate(cue13, 'de', 13, CIN_I18N), '');

// (F) 후보: cue0[de] 정상 inline 불변
check('후보 cue0[de] = inline 불변',
  resolveCandidate(cue0, 'de', 0, CIN_I18N), 'Es gibt unzählige Welten');

// (G) 후보: cue0[ms] 누락 → en 폴백 유지
check('후보 cue0[ms] = en 폴백 유지',
  resolveCandidate(cue0, 'ms', 0, CIN_I18N), 'There are countless worlds');

console.log(`\n== ${pass} PASS / ${fail} FAIL ==`);
console.log('productionApplied=false · source 정적 로직 검증 · 실게임/자막 렌더/영상/음향 Gate 미검수');
process.exit(fail? 1 : 0);
