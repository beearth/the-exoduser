# BUILD — UI03 병행 후속 원문

> 읽기 전용 분석/후보 코드. 총괄의 별도 적용·검사 전에는 실행/채택 완료가 아니다. 후속 정정이 앞선 문구보다 우선한다.

## 2026-10-01T06:08:55.158Z

UI03 독립 정적 인수 도구(후보)를 완성했습니다. 아래 검증값은 현재 Mac 소스를 Read/Glob/Grep으로 직접 대조해 박았습니다 — game.html:2544·game-easy-test.html:2327 `ui-refinement.css?v=20261001-combat-status21`, build-nwjs.mjs FILES(L35–73)·`platform:'win',arch:'x64'`(L171–172)·통합격리(L96–104,121–128), server.cjs PORT/HOST/EXODUSER_SAVE_DIR(L37–48), ch1-boundary-edge easy no-op(game.html 태그+호출 / easy 호출만).

```javascript
// tools/ui03-static-audit.cjs  — [후보/미적용] 20261001-UI03 BUILD 독립 정적 인수 도구
// 소유: BUILD 분석/검수 도구. 읽기 전용(fs.readFileSync + sha256). 빌드/복사/파일변경 없음.
// 실행: node tools/ui03-static-audit.cjs   (이 세션은 읽기 도구만 보유 → 실행 금지, 적용 전 후보)
// 플랫폼: 이 도구는 Mac 개발 체크아웃에서 도는 정적 검사다. 패키지 산출 대상은 Windows NW.js(win/x64)로 별개다.
'use strict';
const fs = require('fs'), path = require('path'), crypto = require('crypto');
const ROOT = path.resolve(__dirname, '..');   // tools/ 상위 = 프로젝트 루트
const R = p => fs.readFileSync(path.join(ROOT, p), 'utf8');
const EXIST = p => fs.existsSync(path.join(ROOT, p));
const SHA = p => crypto.createHash('sha256').update(fs.readFileSync(path.join(ROOT, p))).digest('hex');

const EXPECT = {
  uiCacheKey: '20261001-combat-status21',          // UI03 ui-refinement.css ?v= (두 게임 HTML 공통)
  buildPlatform: "platform: 'win'", buildArch: "arch: 'x64'",
  devPortDefault: 3333, devPortMacConv: 3340,      // server.cjs 기본 3333, Mac 개발은 PORT env로 3340
  pkgPort: 3347,                                    // 통합 패키지(node-main.js 패치)
};
const GAME_HTMLS = ['game.html', 'game-easy-test.html'];
// easy no-op 계약: 모듈별 [게임HTML에 script 태그 필수?, easy에서는 호출만(태그 없음)?]
const EASY_NOOP = { file: 'ch1-boundary-edge.js', call: 'Ch1BoundaryEdge.draw(' };
const AUDIT_INPUTS = ['build-nwjs.mjs','server.cjs','node-main.js','game.html',
  'game-easy-test.html','ui-refinement.css','ch1-boundary-edge.js'];

const results = [];
const ok  = (n,d='') => results.push({ s:'PASS', n, d });
const bad = (n,d='') => results.push({ s:'FAIL', n, d });
const warn= (n,d='') => results.push({ s:'WARN', n, d });

// ── 1. build-nwjs.mjs FILES: 필수 로컬 참조가 디스크에 실존하는가 (누락=런타임 깨짐) ──
try {
  const b = R('build-nwjs.mjs');
  const filesBlock = /const FILES = \[([\s\S]*?)\];/.exec(b);
  const optBlock = /OPTIONAL_FILES = new Set\(\[([\s\S]*?)\]\)/.exec(b);
  if (!filesBlock) throw new Error('FILES 배열 파싱 실패');
  const optional = new Set((optBlock ? optBlock[1] : '').match(/'([^']+)'/g)?.map(s=>s.slice(1,-1)) || []);
  const files = (filesBlock[1].match(/'([^']+)'/g) || []).map(s => s.slice(1,-1));
  const missReq = files.filter(f => !EXIST(f) && !optional.has(f));
  const missOpt = files.filter(f => !EXIST(f) && optional.has(f));
  missReq.length ? bad('build FILES 필수 누락(통합빌드 throw 대상)', missReq.join(', '))
                 : ok('build FILES 필수 전부 실존', `${files.length}개(옵션 ${optional.size})`);
  if (missOpt.length) warn('build FILES 옵션 누락(건너뜀 허용)', missOpt.join(', '));
  for (const need of ['game.html','game-easy-test.html','ch1-boundary-edge.js','ui-refinement.css'])
    files.includes(need) ? ok(`build FILES 포함: ${need}`) : bad(`build FILES 미포함: ${need}`);
  b.includes(EXPECT.buildPlatform) && b.includes(EXPECT.buildArch)
    ? ok('build 대상 = Windows NW.js (win/x64)') : bad('build 플랫폼 계약 불일치');
} catch (e) { bad('build-nwjs.mjs 분석 예외', e.message); }

// ── 2. 두 게임 HTML의 로컬 script/link 참조가 디스크에 실존하는가 ──
for (const html of GAME_HTMLS) {
  try {
    const src = R(html);
    const refs = [...src.matchAll(/(?:src|href)="([^"]+)"/g)].map(m => m[1])
      .filter(u => !/^(https?:|data:|#|\/\/)/.test(u))
      .map(u => u.split(/[?#]/)[0]).filter(Boolean);
    const uniq = [...new Set(refs)];
    const miss = uniq.filter(u => !EXIST(u));
    miss.length ? bad(`${html} 런타임 필수 로컬 참조 누락`, miss.join(', '))
               : ok(`${html} 로컬 참조 전부 실존`, `${uniq.length}개`);
  } catch (e) { bad(`${html} 참조 분석 예외`, e.message); }
}

// ── 3. UI03 ui-refinement.css cache21: 두 게임 HTML 동일 캐시키인가 ──
for (const html of GAME_HTMLS) {
  const m = new RegExp(`ui-refinement\\.css\\?v=([^"']+)`).exec(R(html));
  if (!m) bad(`${html} ui-refinement.css 링크 없음`);
  else m[1] === EXPECT.uiCacheKey ? ok(`${html} UI03 캐시키 일치`, m[1])
                                  : bad(`${html} UI03 캐시키 불일치`, `${m[1]} ≠ ${EXPECT.uiCacheKey}`);
}

// ── 4. 누락 vs easy no-op 구별: boundary-edge는 game.html만 로드, easy는 호출만(의도된 no-op) ──
{
  const g = R('game.html'), e = R('game-easy-test.html');
  const tag = s => new RegExp(`<script src="${EASY_NOOP.file.replace('.','\\.')}`).test(s);
  const call = s => s.includes(EASY_NOOP.call);
  (tag(g) && call(g)) ? ok('game.html: boundary-edge 태그+호출 (정상 활성)')
                      : bad('game.html: boundary-edge 태그 또는 호출 누락 (런타임 깨짐)');
  (!tag(e) && call(e)) ? ok('game-easy-test: 태그없음+호출 → 가드 no-op (의도된 제약, 누락 아님)')
    : tag(e) ? warn('game-easy-test: 예기치 않게 태그 로드됨(계약과 다름)')
             : bad('game-easy-test: 호출조차 없음(계약 불일치)');
}

// ── 5. server.cjs 개발 포트/저장 격리 계약 (Mac 개발: PORT env=3340, 저장 env override) ──
try {
  const s = R('server.cjs');
  /Number\(process\.env\.PORT\s*\|\|\s*3333\)/.test(s) ? ok('server 개발포트 env override(기본3333)',
    `Mac 개발 관례 PORT=${EXPECT.devPortMacConv}`) : bad('server PORT env 계약 누락');
  /PORT < 1 \|\| PORT > 65535/.test(s) ? ok('server PORT 범위검증(1–65535)') : bad('server PORT 범위검증 누락');
  /process\.env\.HOST/.test(s) ? ok('server HOST 선택 지원') : warn('server HOST 지원 미확인');
  /process\.env\.EXODUSER_SAVE_DIR/.test(s) && /path\.resolve/.test(s)
    ? ok('server 저장 격리 EXODUSER_SAVE_DIR(절대경로)') : bad('server 저장 격리 계약 누락');
} catch (e) { bad('server.cjs 분석 예외', e.message); }

// ── 6. 패키지(node-main.js + build 통합패치) 포트/저장 격리 — 개발3340과 구분, 패키지3347 ──
try {
  const nm = R('node-main.js'), b = R('build-nwjs.mjs');
  /const PORT = 3333;/.test(nm) ? ok('node-main 기본 PORT 3333(패키지 내장서버)') : bad('node-main 기본 포트 계약 변경');
  b.includes("'localhost:3333'") && b.includes(`localhost:${EXPECT.pkgPort}`)
    ? ok(`build 통합패치 포트 3333→${EXPECT.pkgPort}`) : bad('build 통합 포트패치 계약 누락');
  /userdata-integration-\$\{integrationId\}/.test(b) ? ok('build 통합 user-data-dir 격리') : bad('build userdata 격리 누락');
  /EXODUSER-INTEGRATION-\$\{integrationId\}/.test(b) ? ok('build 통합 saves 경로 격리') : bad('build saves 격리 누락');
  warn('격리 구분 요약', `개발=server.cjs(Mac,PORT=${EXPECT.devPortMacConv}) / 패키지=node-main(Win,3333→${EXPECT.pkgPort})`);
} catch (e) { bad('패키지 격리 분석 예외', e.message); }

// ── 출력: 결과 + 입력 SHA 매니페스트(QA 인수표 입력 SHA) ──
console.log('=== UI03 정적 인수 결과 (Mac 개발 체크아웃) ===');
for (const r of results) console.log(`[${r.s}] ${r.n}${r.d ? ' — ' + r.d : ''}`);
console.log('\n=== 입력 SHA256 매니페스트 ===');
const manifest = {};
for (const f of AUDIT_INPUTS) { try { manifest[f] = SHA(f); } catch { manifest[f] = 'MISSING'; } }
for (const [f, h] of Object.entries(manifest)) console.log(`${h}  ${f}`);
const fail = results.filter(r => r.s === 'FAIL').length;
console.log(`\n요약: PASS ${results.filter(r=>r.s==='PASS').length} / WARN ${results.filter(r=>r.s==='WARN').length} / FAIL ${fail}`);
process.exitCode = fail ? 1 : 0;   // 비영(非零) 종료로 CI/QA 게이트 연동
```

**도구 설계 요지 (한국어)**
- **FILES 실존 검사(§1)**: `build-nwjs.mjs`의 `FILES`/`OPTIONAL_FILES`를 파싱해, 필수 항목이 디스크에 없으면 `FAIL`(통합빌드가 L80에서 throw하는 바로 그 조건). `credits.html` 등 옵션 누락은 `WARN`. game.html·game-easy-test.html·ch1-boundary-edge.js·ui-refinement.css 포함 여부와 `win/x64` 대상을 별도 검증.
- **HTML 로컬 참조 누락(§2)**: 두 게임 HTML의 `src/href` 중 `http(s)/data/#` 제외 로컬 참조를 `?v=` 떼고 실존 확인 → 없으면 **런타임 필수 참조 누락**으로 분류.
- **UI03 cache21(§3)**: 두 게임 HTML이 동일하게 `?v=20261001-combat-status21`인지 대조(불일치 시 FAIL). index.html은 로비라 대상 제외.
- **누락 vs easy no-op 구별(§4)**: `game.html`은 boundary-edge **태그+호출** 둘 다 있어야 정상, `game-easy-test.html`은 **호출만·태그 없음**이 정상(가드 `if(globalThis.Ch1BoundaryEdge)`로 no-op). 역전 시(game.html 태그 누락=진짜 깨짐 / easy 태그 로드=계약 위반)를 각각 FAIL/WARN으로 분리.
- **격리·플랫폼 구분(§5·§6)**: 개발 서버는 `server.cjs`의 `PORT`(기본 3333, Mac 개발 관례 **3340**)·`EXODUSER_SAVE_DIR` env 격리, 패키지는 `node-main.js` 고정 3333을 통합패치로 **3347**·`userdata-integration`·`EXODUSER-INTEGRATION/saves`로 격리. 도구는 Mac 정적 검사이고 산출 대상은 Windows NW.js임을 명시 출력.
- **입력 SHA 출력**: 감사 대상 7파일의 sha256 매니페스트를 찍어 QA 인수표의 **입력 SHA**로 그대로 제출. FAIL 시 비영 종료코드로 게이트.

**미실행 제약**: 이 세션은 읽기 도구만 보유 → 위 코드는 **적용 전 후보**로만 제시하며 실행/파일 기록(`tools/ui03-static-audit.cjs` 생성)·빌드·대형 복사를 수행하지 않았습니다. 디스크 SHA 출력값은 도구를 실제 실행해야 확정되므로, 총괄의 쓰기 세션이 파일 반영 후 `node tools/ui03-static-audit.cjs`로 1회 구동해 입력 SHA를 확정해야 합니다. 새 팀·PC 접속·보안/신뢰 변경 없음. 완료 후 종료합니다.

## 2026-10-01T06:11:20.167Z

현재 소스 확인: game.html:2544·game-easy-test.html:2327 모두 `ui-refinement.css?v=20261001-combat-status22`로 갱신됨(cache21→22). 기존 후보의 §3 하드코딩(`uiCacheKey:'20261001-combat-status21'`)은 이번 패스부터 false FAIL을 냅니다. **상호 비교(두 게임 HTML이 서로 같은가)** 방식으로 정정합니다 — 다음 캐시 범프마다 자동 추종.

**정정 1 — `EXPECT`에서 `uiCacheKey` 라인 삭제** (하드코딩 제거):
```javascript
const EXPECT = {
  // uiCacheKey 삭제 — current HTML link 상호 비교로 대체(§3)
  buildPlatform: "platform: 'win'", buildArch: "arch: 'x64'",
  devPortDefault: 3333, devPortMacConv: 3340,      // server.cjs 기본 3333, Mac 개발은 PORT env로 3340
  pkgPort: 3347,                                    // 통합 패키지(node-main.js 패치)
};
```

**정정 2 — §3 블록 전체 교체** (고정키 대조 → 현재 링크 상호 일치 검사):
```javascript
// ── 3. UI03 ui-refinement.css cache: 두 게임 HTML이 "서로" 동일 캐시키인가 (하드코딩 없음) ──
{
  const keys = {};
  for (const html of GAME_HTMLS) {
    const m = /ui-refinement\.css\?v=([^"']+)/.exec(R(html));
    if (!m) { bad(`${html} ui-refinement.css 링크 없음`); keys[html] = null; }
    else {
      keys[html] = m[1];
      /^\d{8}-/.test(m[1]) ? ok(`${html} UI03 캐시키 형식 정상`, m[1])
                           : warn(`${html} UI03 캐시키 형식 비표준`, m[1]);
    }
  }
  const vals = GAME_HTMLS.map(h => keys[h]);
  (vals.every(Boolean) && new Set(vals).size === 1)
    ? ok('UI03 캐시키 두 게임 HTML 상호 일치', vals[0])
    : bad('UI03 캐시키 두 게임 HTML 불일치', GAME_HTMLS.map(h => `${h}=${keys[h]}`).join(' / '));
}
```

**정정 결과**
- 이제 §3은 고정값 대신 **game.html ↔ game-easy-test.html 상호 일치**만 검증 → cache22(및 이후 범프)에서도 두 HTML만 동기화돼 있으면 PASS. 두 파일이 어긋날 때만 FAIL(동기화 누락 탐지 유지).
- 형식 검사는 `^\d{8}-`(날짜 프리픽스)만 WARN 수준으로 유지, 특정 키 강제 아님.
- SHA 매니페스트(§7)는 `ui-refinement.css`를 그대로 해시하므로 top32→48 간격 추가분이 입력 SHA에 자동 반영 — 별도 수정 불필요.
- 나머지 §1·§2·§4·§5·§6과 입력 SHA 출력은 그대로 유효.

읽기 도구로 현재 소스만 확인했고, 파일/Git/빌드/복사 변경 없이 **후보 정정만** 보고합니다. 도구는 여전히 적용 전 후보이며 이 세션에서 실행하지 않았습니다. 완료 후 종료합니다.
