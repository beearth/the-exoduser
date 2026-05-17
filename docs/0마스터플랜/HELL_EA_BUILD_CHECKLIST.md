# HELL: EXODUSER - 얼리액세스 빌드 구축 마스터 체크리스트

작성일: 2026.05.16 | 최종수정: 2026.05.17
대상 폴더: G:\hell-ea\ (생성 완료 — PHASE 1 완료)
참조 소스: G:\hell-DEMO\ (데모, 현재 v0.1.0-demo)
런타임: NW.js (Electron 폐기 완료)
OAuth 참조 패턴: G:\pentafall\ (DIROI 완성 빌드)
전략 문서: docs/13출시·마케팅/HELL_DIROI_종합확장전략기획서_v2_0.md

---

## 현재 상태 스냅샷 (2026.05.15 기준)

| 항목 | 상태 |
|---|---|
| G:\hell-DEMO\ | 존재 — v0.1.0-demo, LV캡100, 스테이지 1-1만 |
| G:\hell-ea\ | **구축 완료** — PHASE 1+2 완료, PHASE 3 진행 중 |
| G:\hell-ea\node-main.js | 존재 — 포트 3333, OAuth + 세이브 API 완비 |
| G:\hell-ea\build-nwjs.mjs | 존재 — nwbuild 스크립트 |
| butler CLI | v15.27.0 설치됨, API 키 저장 완료 |
| itch.io 계정 | beearth.itch.io — 개발자 계정 활성, butler 연결 완료 |
| Steam Direct | 미결제 ($100 필요) — 신청 후 대기 중 |
| Supabase | tevlznuhjqcnzgewlswx 활성, Redirect URL 6개 등록 완료 |
| npm run build:nwjs | **미실행** — NW.js 0.111.2 첫 다운로드 필요 |

---

## 빌드 정의 요약

| 항목 | 데모 | 얼리액세스 | 1.0 정식 |
|---|---|---|---|
| 폴더 | G:\hell-DEMO\ | G:\hell-ea\ | G:\hell-release\ (추후) |
| 가격 | 무료 | $14.99 | $19.99 |
| 스테이지 | 1-1 | 1-1 ~ 1-4 (1챕터) | 35+ (7챕터) |
| 레벨 캡 | 100 | 500 | 무제한 |
| 로그인 | 없음 | Supabase Google + 게스트 | + Steam + EOS |
| 플레이 타임 | 1~2h | 8~15h | 30~80h |
| 배포 플랫폼 | itch.io | itch.io + Steam EA | Steam 1.0 + 멀티스토어 |

---

## 진행 원칙

- 한 PHASE 끝나면 도진님에게 보고 후 다음 PHASE 진행
- 각 STEP 완료 시 체크박스 [x] 표시
- 문제 발생 시 즉시 STOP 후 보고
- 데모(G:\hell-DEMO\) 수정 시 **BIC 제출용 ZIP은 별도 보존** — itch.io 데모용 재빌드 목적으로만 수정
- 코드 수정은 str_replace 사용, 파일 전체 재작성 금지
- 게임루프 내 new/splice/filter/forEach/Date.now() 사용 금지 (오브젝트 풀링 유지)
- 절대 수정 금지 항목: ELC[], ETYPE_COL[], _tseed(), StageSeeder, CIN_LINES, _INTRO_LINES, boss combo idx(0-48), 강화 확률 공식, ProxyX 배칭 시스템
- **HELL NW.js OAuth 서버 포트: 3333** (DIROI=14267과 다름 — 혼동 금지)

---

## 선행 작업 (PHASE 0 이전)

### itch.io 계정 설정 (5분)
- [ ] https://itch.io/user/settings 접속
- [ ] **"계정 유형" → "게임 개발 및 업로드" 체크** (현재 미체크 — 업로드 권한 없음)
- [ ] 저장 후 Dashboard에 "Create new project" 버튼 생기는지 확인

---

## PHASE 0 - 환경 분석 (예상 시간: 10분)

### STEP 0.1: 데모 빌드 폴더 트리 분석
- [x] G:\hell-DEMO\ 전체 구조 파악 완료 (2026.05.16)
- [x] 명령: `dir G:\hell-DEMO /B` — 폴더 구조 확인 완료
- [x] 확장자별 사이즈 분포 확인 완료 (HTML/JS/PNG/SFX 등)

### STEP 0.2: 데모 진입 파일 확인
- [x] package.json 확인 완료 (2026.05.16)
  - name=`exoduser-hell-lord`, v`0.1.0-demo`, main=`indexdemo.html`
  - chromium-args: `--disable-web-security --autoplay-policy=no-user-gesture-required --enable-features=SharedArrayBuffer`
  - → EA용 DIROI 패턴 확장 → PHASE 1.3 완료
- [x] node-main.js 미존재 확인 (데모에는 없음, EA에서 신규 생성)
- [x] 빌드 스크립트: build-nwjs.mjs 데모에 없음 → EA에서 신규 생성

### STEP 0.3: 데모 제한 코드 위치 파악
- [x] 레벨 100 캡: `_DEMO_LV_CAP=100`, `_DEMO_MODE=true` 조건 확인 완료
- [x] 스테이지 잠금: `_DEMO_LAST_STAGE=0` (1-1만), demoEnd 화면 확인 완료
- [x] 합체/어픽스 밴: `_DEMO_FUSE_ALLOWED`, `_DEMO_AFFIX_BANNED` 위치 확인 완료

### STEP 0.4: G:\hell-ea\ 폴더 존재 확인
- [x] `dir G:\hell-ea` 실행 → **미존재 확인 완료** (2026.05.16)
- [x] PHASE 1에서 신규 생성 완료

### STEP 0.5: butler CLI 확인
- [x] `butler version` → v15.27.0 설치 확인 완료
- [x] `butler login` — beearth 계정 로그인 완료

### PHASE 0 완료 보고
- [x] 분석 결과 종합 보고 완료 (2026.05.16)
- [x] PHASE 1 진행 승인 완료

---

## PHASE 1 - EA 빌드 폴더 생성 (예상 시간: 20-30분)

### STEP 1.1: 디렉토리 생성 ✅
- [x] `mkdir G:\hell-ea`
- [x] `mkdir G:\hell-ea\docs`
- [x] `mkdir G:\hell-ea\saves` (게스트 로컬 세이브용)

### STEP 1.2: 데모 파일 EA로 복사 ✅
- [x] 핵심 HTML: `indexdemo.html` → `index.html`, `gamedemo.html` → `game.html`
- [x] assets 폴더 통째로 복사
- [x] 언어 파일 복사 (lang_*.js 26개)
- [x] maps_data.js, lobby_i18n.js, GLTFLoader.js, three.min.js 복사
- [x] 아틀라스 파일 복사 (atlas_*.json, atlas_*.png)
- [x] BGM 폴더 복사
- [x] package.json 복사 후 수정 준비
- [x] NW.js 런타임 파일도 포함 복사됨 (EXODUSER.exe, DLL 등 — 즉시 실행 가능 상태)

### STEP 1.2.5: build-nwjs.mjs 이식 ★ ✅
- [x] G:\hell-ea\build-nwjs.mjs 신규 작성 (pentafall 패턴 기반, Vite 없이 flat HTML 구조로 변경)
  - 소스 파일 → dist/ 스테이징 → nwbuild → out/EXODUSER-EA-win64/
  - app.name: 'EXODUSER-EA', version: '0.5.0'
- [x] G:\hell-ea\package.json에 `"scripts": {"build:nwjs": "node build-nwjs.mjs"}` 추가
- [x] `cd G:\hell-ea && npm install nw-builder` 완료 (nw-builder@4.17.10, 123 packages)

### STEP 1.3: package.json 수정 (EA 정체성) ✅
- [x] name: "hell-exoduser-ea", version: "0.5.0-ea"
- [x] main: "index.html" (loader.html → index.html 수정 — loader.html은 PHASE 4에서 추가)
- [x] window.title: "EXODUSER: HELL LORD (Early Access)"
- [x] chromium-args: DIROI 패턴 전체 적용
- [x] node-main: "node-main.js", node-remote 설정 완료
- [x] toolbar: true (개발 중), scripts: build:nwjs 추가

### STEP 1.4: 게임 내 버전 표시 ✅
- [x] index.html: "DEMO BUILD" → "EARLY ACCESS", "v0.1-demo · ACT 1~4" → "v0.5.0-ea · ACT 1 (1-1~1-4)"

### STEP 1.4.5: 데모(G:\hell-DEMO\) 축소 작업 ★ ✅
> 합체/어픽스 현재 상태 유지 확정 (도진님: "다 가능하게해도 돼, 추후 업데이트")
- [x] gamedemo.html: `_DEMO_LV_CAP` 500 → 100, `_DEMO_LAST_STAGE` 3 → 0
- [x] indexdemo.html: `startBtn500` `display:none` 처리, 배지 "v0.1-demo · ACT 1-1"
- [ ] 검증: 1-2 진입 시 demoEnd 화면 표시 확인 (실행 테스트 필요)
- [ ] 검증: 레벨 100 초과 시 경험치 정지 확인 (실행 테스트 필요)

### STEP 1.4.6: 데모 풀 로비 + 3슬롯 세이브 ✅
- [x] indexdemo.html: 버튼 카드 → 풀 캐릭터 로비 (슬롯 3개, 생성/삭제/선택)
- [x] 저장 키: `hellsave_demo_0~2` (localStorage, 3슬롯 확정)
- [x] gamedemo.html: `?slot=N&new=1&name=...&cidx=N` URL 파라미터 지원, `name` 필드 세이브에 추가
- [x] 구버전 `hellsave_demo` → `hellsave_demo_0` 자동 마이그레이션 (0번 슬롯 없을 때만, IIFE 1회 실행)
- [x] docs/15 세이브+데이터구조 갱신

### STEP 1.5: EA 빌드 검증
- [x] `npm install` 완료 (nw-builder@4.17.10)
- [-] `npm run build:nwjs` — **미실행** (사유: 본섭 localhost:3333 HTML 직접 실행 흐름으로 결정. 빌드 패키징은 PHASE 7 QA 단계에서 일괄 처리)
- [-] out/EXODUSER-EA-win64/EXODUSER-EA.exe 실행 확인 — PHASE 7로 이관
- [-] "EARLY ACCESS" + "v0.5.0-ea" 표시 확인 — PHASE 7로 이관

### PHASE 1 완료 보고 ✅
- [x] G:\hell-ea\ 폴더 정상 구축 및 빌드 준비 완료
- [x] PHASE 2 완료 → PHASE 3 진행 중

---

## PHASE 2 - EA 데모 제한 해제 ✅ 완료

> **실제 구현 방식**: `_DEMO_MODE=false` 대신 `_BUILD_TIER='ea'` 상수를 추가하여 모든 제한을 티어별로 분기.
> `_DEMO_MODE=true`는 레거시 호환 유지용으로 남김. 실제 분기는 `_BUILD_TIER==='demo'` 조건.
> 참조: `G:\hell-ea\docs\BUILD_TIER_SYSTEM.md`

### STEP 2.1: `_BUILD_TIER='ea'` 상수 추가 ✅
- [x] game.html line 11977: `const _BUILD_TIER='ea';` 추가
- [x] game.html line 11978: `const _DEMO_MODE=true;` 유지 (레거시 호환)
- [x] 효과: 모든 `&&_BUILD_TIER==='demo'` 조건이 false → 레벨 캡/합체/어픽스/스테이지 제한 전부 비활성
- [x] 강화 확률 공식 **수정 없음** ✓

### STEP 2.2: 레벨 캡 처리 ✅
- [x] `_DEMO_LV_CAP=500` 유지, `&&_BUILD_TIER==='demo'` 조건으로 EA에서 무력화
- [x] line 33254: `if(_DEMO_MODE&&_BUILD_TIER==='demo'&&P.lv>=_DEMO_LV_CAP)` → EA 미적용
- [x] line 33265: 루프 내 레벨캡도 동일 조건 → EA 미적용
- [x] EA에서는 레벨 500까지 정상 레벨업 (캡 없음, 실질적으로 500이 최대인 이유는 현재 콘텐츠)

### STEP 2.3: 스테이지 경계 설정 ✅
- [x] `_DEMO_LAST_STAGE=3` 유지, `&&_BUILD_TIER==='demo'` 조건으로 EA에서 무력화
- [x] line 33790: demoEnd 화면 `&&_BUILD_TIER==='demo'` 조건 → EA에서 미표시
- [x] EA는 1챕터(stage 0~3) 전부 플레이 가능, 이후 자연스럽게 2챕터로 넘어감 (콘텐츠 미구현)

### STEP 2.4: 합체/어픽스 전체 허용 ✅
- [x] line 34289: `&&_BUILD_TIER==='demo'` 조건으로 `_DEMO_FUSE_ALLOWED` 체크 EA에서 비활성
- [x] line 11127: `&&_BUILD_TIER==='demo'` 조건으로 `_DEMO_AFFIX_BANNED` 체크 EA에서 비활성
- [x] EA에서 합체 전체 30종, 어픽스 전체 허용

### STEP 2.5: 스킬/슬롯 확인 ✅
- [x] grep 검증 완료: 스킬/아키타입/슬롯 관련 `_DEMO_MODE`/`_BUILD_TIER` 분기 없음
- [x] EA에서 모든 스킬, 아키타입, 슬롯 기본 노출 상태

### STEP 2.6: 워리어 1종 유지 (도진님 확정)
- [x] 현재 활성 아키타입: 워리어 1종 — EA에서도 동일 유지

### STEP 2.7: 로비 리다이렉트 설정 ✅
- [x] line 48771: `_BUILD_TIER==='ea'` → `http://localhost:3333/index.html`
- [x] line 48879: 자동 데모 시작 `&&_BUILD_TIER==='demo'` 조건 → EA에서 미실행

### PHASE 2 완료 확인 ✅
- [x] _BUILD_TIER 시스템으로 EA 제한 전면 해제
- [x] `G:\hell-ea\docs\BUILD_TIER_SYSTEM.md` 상세 문서화 완료
- [x] 도진님 승인 완료 → PHASE 3 진행

---

## 체크리스트 외 추가 작업

> 체크리스트 PHASE 흐름과 병행하여 진행된 작업들. PHASE에 귀속되지 않지만 빌드에 반영됨.

### [2026.05.16] 데모 풀 로비 + 3슬롯 세이브 시스템
- 대상: `G:\hell-DEMO\indexdemo.html`, `G:\hell-DEMO\gamedemo.html`
- `indexdemo.html`: 버튼 카드 → 풀 캐릭터 로비 (슬롯 3개, 생성/삭제/선택, CHAR_VISUALS 3종)
- `gamedemo.html`: `?slot=N&new=1&name=...&cidx=N` URL 파라미터 지원, 슬롯별 저장 키 `hellsave_demo_N`
- 구버전 마이그레이션: `hellsave_demo` → `hellsave_demo_0` (IIFE, 0번 슬롯 없을 때만 1회 실행)
- 저장 필드: `name` 추가 (캐릭터 이름 표시용)

### [2026.05.16] 장판 데미지 밸런스 패치 + shockField VFX + eShield
- 대상: `game.html`, `G:\hell-DEMO\gamedemo.html`, `G:\hell-ea\game.html` (3개 동시 적용)
- **전격이동(shockField)**: 데미지 `(1+(lv-1)×0.20)` → `(0.3+(lv-1)×0.06)` (70% 감소)
- **악의폭풍(maliceStorm)**: `_skMul('maliceStorm')` (b:12 과다) → `(5+(lv-1))` flat (Lv1 2.4배 감소)
- **가시덫(spikeTrap)**: `(3+(lv-1))` → `(2+(lv-1)×0.5)` (약 50% 감소)
- **shockField eShield**: `{dot:true}` 에 `shieldHit:true` 추가 → 마법 기반 장판이 적 에너지쉴드 정상 차감
- **shockField VFX**: 중심 방사 아크(반짝이 느낌) → 장판 내 랜덤 위치 간 지그재그 번개선 8개 (4프레임 갱신)

---

## PHASE 3 - Supabase 인증 활성화 ✅ 완료

> index.html 분석 결과 PHASE 1.2 복사 시 이미 전체 구현됨. 코드 확인 + 1개 버그 수정으로 완료.

### STEP 3.1: Supabase SDK 로드 확인 ✅
- [x] index.html L491: `<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js">` 로드 확인
- [x] localhost:3333 환경이므로 CDN 정상 작동 (file:// 아님)

### STEP 3.2: Supabase 설정 확인 ✅
- [x] SUPABASE_URL: `https://tevlznuhjqcnzgewlswx.supabase.co` (L574)
- [x] SUPABASE_KEY: `sb_publishable_chAwadci1zVQNEKPC__s_w_7K3Oz_WP` (L575)
- [x] `sb=supabase.createClient(...)` 초기화 완료 (L576)
- [x] Redirect URLs: node-main.js `/oauth-callback` + Supabase 대시보드 6개 등록 완료

### STEP 3.3: 로그인 UI ✅
- [x] `#loginSection` (display:none 기본) — L426
- [x] `#googleBtn` (Google 로그인, 다크 골드 톤) — L428
- [x] `#guestBtn` (게스트 플레이, 다크 버튼) — L432
- [x] HELL 빨강+검정+황금 디자인 CSS 완비 (`.card`, `.google-btn`, `.login-section`)

### STEP 3.4: 세션 확인 로직 ✅
- [x] L1788: `sb.auth.getSession()` → `currentUser` 설정
- [x] 세션 있으면 → `showLobby()` (캐릭터 선택 화면)
- [x] 세션 없으면 → 시네마틱 → `finishCin()` → `#loginSection` 표시
- [x] `sb.auth.onAuthStateChange()` 핸들러 등록 (SIGNED_IN/SIGNED_OUT 처리)

### STEP 3.5: 게스트 모드 처리 ✅
- [x] `$('guestBtn').onclick` → `_guestMode=true` → `loadLocalCharacters()` (L1846)
- [x] 세이브: `G:\hell-ea\saves\` JSON (node-main.js `/api/slots`, `/api/save`) — localStorage 아닌 서버 파일 방식 (docs 기준 정확)
- [x] 게임 진입: `game.html?test=1&slot=<charName>` → game.html 로컬 서버 세이브 경로 사용
- [x] lobbyMode 표시: 'GUEST' 텍스트 설정

### PHASE 3 완료 보고 ✅
- [x] 로그인 UI 정상 표시, 게스트 모드 진입 가능
- [x] 버그 수정: `createBtn.onclick` → `doCreateChar(name,0)` 직접 호출 → `openVisualSelect(name)` 로 수정 (외형 선택 팝업 활성화)
- [x] PHASE 4 진행 가능

---

## PHASE 4 - NW.js OAuth 정공법 이식 ✅ 완료

> index.html 분석 결과 PHASE 1.2 복사 시 이미 전체 구현됨.

### STEP 4.1: node-main.js ✅ (선행 완료)
- [x] G:\hell-ea\node-main.js 생성
- [x] HTTP 서버 (port 3333, 127.0.0.1)
- [x] 라우트: `/oauth-callback`, `/oauth-deposit` (POST), `/oauth-poll` (GET)
- [x] 세이브 API: `/api/slots`, `/api/save`, `/api/load/:slot`, `DELETE /api/save/:slot`
- [x] 정적 파일 서빙 (game assets)

### STEP 4.2: index.html OAuth 분기 코드 ✅
- [x] `$('googleBtn').onclick` → `sb.auth.signInWithOAuth({skipBrowserRedirect:true})` → URL 획득
- [x] `window.nw.Shell.openExternal(data.url)` → 외부 브라우저 열기
- [x] 폴링: `GET /oauth-poll` 500ms 간격, 최대 5분 (600회)
- [x] 토큰 수신 시 `sb.auth.setSession({access_token, refresh_token})` 호출 → `showLobby()`

### STEP 4.3: 로그아웃 ✅
- [x] `$('logoutBtn').onclick` → `sb.auth.signOut()` (L1858)
- [x] `onAuthStateChange SIGNED_OUT` → loginSection 표시 (L1809)

### STEP 4.4: 빌드 + 테스트
- [-] 게스트 → 게임 진입 확인 — PHASE 7 QA에서 일괄 테스트
- [-] Google → 외부 브라우저 OAuth → 자동 진입 확인 — PHASE 7
- [-] 로그아웃 → 앱 재시작 확인 — PHASE 7

### PHASE 4 완료 보고 ✅
- [x] OAuth 정공법 정상 구현 (DIROI와 동일 흐름)
- [x] 다음 PHASE 5 (캐릭터 + 클라우드 세이브) 진행 가능

---

## PHASE 5 - 캐릭터 시스템 + 클라우드 세이브 (예상 시간: 1.5-2시간)

### STEP 5.1: Supabase characters 테이블 확인
- [ ] 스키마: id, user_id, name, data, created_at, updated_at
- [ ] RLS 정책 확인

### STEP 5.2: 캐릭터 12 슬롯 UI
- [ ] 슬롯 12개 표시 (이름, 레벨, 플레이 시간)
- [ ] 생성/삭제/선택 버튼

### STEP 5.3: 캐릭터 CRUD 함수
- [ ] dbInsertCharacter / dbLoadCharacter / dbUpdateCharacter / dbDeleteCharacter
- [ ] 모든 함수에 `if (!sb) return;` 가드 (게스트 모드 대비)

### STEP 5.4: 게스트 로컬 세이브
- [ ] G:\hell-ea\saves\ JSON 저장
- [ ] 로그인 시 로컬→클라우드 마이그레이션 옵션

### STEP 5.5: 자동 저장
- [ ] 스테이지 클리어 / 메뉴 열 때 / 게임 종료 시 자동 저장
- [ ] **게임루프 내 호출 절대 금지**

### PHASE 5 완료 보고
- [ ] 캐릭터 CRUD + 클라우드/로컬 양방 확인
- [ ] 다음 PHASE 6 (Steamworks) 진행 가능

---

## PHASE 6 - Steamworks 통합 (예상 시간: 1-2시간)

> 선행 조건: Steam Direct $100 결제 + 앱 ID 발급 완료

### STEP 6.1: steamworks.js SDK 추가
- [ ] `npm install steamworks.js`
- [ ] steam_appid.txt 생성

### STEP 6.2: Steam 초기화 + SteamID 인증
- [ ] node-main.js에 Steam 초기화 코드
- [ ] Steam 사용자 이름 표시, Google 로그인 스킵 옵션

### STEP 6.3: Steam Cloud 세이브
- [ ] Supabase + Steam Cloud 이중 백업

### STEP 6.4: 도전과제 (1챕터 기준)
- [ ] 1챕터 클리어 / 첫 보스 격파 / 매스 러시 100킬 / 레벨 500 / 패링 100회

### STEP 6.5: Rich Presence
- [ ] "Chapter 1 - 1-1 진행 중" 등 상태 표시

### PHASE 6 완료 보고
- [ ] Steam SDK + 도전과제 + Cloud 세이브 확인
- [ ] 다음 PHASE 7 (QA) 진행 가능

---

## PHASE 7 - QA + 최종 빌드 (예상 시간: 1-2시간)

### STEP 7.1: 회귀 테스트
- [ ] 로그인 → 캐릭터 생성 → 1-1 진입 → 클리어 → 저장 → 재로그인 → 로드
- [ ] 게스트 모드 동일 흐름
- [ ] 로그아웃 → 자동 재시작 → 재진입

### STEP 7.2: 성능 검증
- [ ] 1시간 연속 플레이 메모리 누수 없음
- [ ] 30FPS 이하 구간 없음
- [ ] S7 펫 picker 18ms 병목 확인
- [ ] S3 투사체 14ms 병목 확인

### STEP 7.3: 데모-EA 동시 실행 테스트
- [ ] hell-DEMO + hell-ea 동시 실행 충돌 없음
- [ ] 세이브 데이터 충돌 없음 (폴더 분리 확인)

### STEP 7.4: 최종 빌드 패키징
- [ ] `npm run build:nwjs` — 빌드 사이즈 1.5GB 이하 목표
- [ ] EXODUSER.exe 최종 검증

### STEP 7.5: 출시 빌드 설정
- [ ] `"toolbar": false` (F12 비활성)
- [ ] 디버그 로그 출력 비활성

### PHASE 7 완료 보고
- [ ] QA 통과
- [ ] 다음 PHASE 8A (itch.io) / PHASE 8B (Steam) 진행 가능

---

## PHASE 8A - itch.io 배포 (예상 시간: 30분)

> Steam 이전에 올릴 수 있음. 무료 데모 + 유료 EA 동시 운영.
> 계정: beearth.itch.io | game slug: `exoduser` | 기존 채널: `windows-demo`

### STEP 8A.1: 계정 설정 확인
- [ ] "게임 개발 및 업로드" 체크 완료 확인 (선행 작업)

### STEP 8A.2: 게임 페이지 업데이트
- [ ] Release status: **In Development (Early Access)**
- [ ] 가격: **$14.99**
- [ ] 스크린샷 5장 이상 (1920×1080)
- [ ] 커버 이미지 (315×250px 이상)
- [ ] 짧은 설명 한/영

### STEP 8A.3: EA 빌드 ZIP 준비
- [ ] 빌드 출력 폴더 ZIP 압축
  - 파일명: `HELL_EXODUSER_EA_v0.5.0_windows.zip`
- [ ] ZIP 내 EXODUSER.exe 진입점 확인

### STEP 8A.4: butler 업로드
```bat
:: 데모 채널 유지
butler push "G:\hell-DEMO" beearth/exoduser:windows-demo --userversion 0.1.0

:: EA 채널 신규
butler push "G:\hell-ea\out\HELL-EXODUSER-EA" beearth/exoduser:windows-ea --userversion 0.5.0
```
- [ ] butler login (beearth) 확인
- [ ] EA 채널 업로드 완료
- [ ] Dashboard에서 빌드 확인

### STEP 8A.5: 가격 + 접근 설정
- [ ] EA 채널: $14.99 유료
- [ ] 데모 채널: 무료 유지

### PHASE 8A 완료 보고
- [ ] itch.io EA 빌드 활성 — https://beearth.itch.io/exoduser
- [ ] 데모 + EA 동시 운영 확인

---

## PHASE 8B - Steam 배포 (예상 시간: 1-2시간 + 검수 3-5일)

> 선행 조건: Steam Direct $100 결제 + 앱 ID 발급

### STEP 8B.1: Steam Direct 결제
- [ ] HELL용 $100 결제 + 앱 ID 확인
- [ ] 데모용 앱 ID 별도 발급 (본 게임에 attach)

### STEP 8B.2: 스토어 페이지 자산
- [ ] Header Capsule (460×215)
- [ ] Main Capsule (616×353)
- [ ] Library Capsule (600×900)
- [ ] Library Hero (3840×1240)
- [ ] 스크린샷 5장 이상 (1920×1080)
- [ ] 트레일러 1-2분 (MP4, H.264, 1080p)
- [ ] 짧은 설명 한/영 + About This Game 한/영

### STEP 8B.3: Steamworks 빌드 업로드
- [ ] steamcmd로 빌드 업로드
- [ ] 데모 빌드 review 신청 (3-5 영업일)
- [ ] 스토어 페이지 review 신청
- [ ] Steam Next Fest 6월/10월 opt-in 검토

### STEP 8B.4: 출시 전략
- [ ] itch.io 데모 유입 사용자에게 Steam 위시리스트 유도
- [ ] 위시리스트 4주 이상 누적 후 출시일 발표

### PHASE 8B 완료 보고
- [ ] Steam EA 배포 완료
- [ ] 스토어 페이지 활성

---

## 작업 후 정리

### 메모리 업데이트 항목
- [ ] HELL EA 빌드 완성 (G:\hell-ea\ 활성)
- [ ] OAuth 정공법 HELL 적용 완료
- [ ] itch.io EA 배포 완료 (beearth/exoduser:windows-ea)

### 다음 단계 (1.0 정식 빌드)
- 이 체크리스트 구조로 G:\hell-release\ 작성
- 7챕터 전체 콘텐츠 활성화
- EOS 크로스플랫폼 통합
- 콘솔 이식 (Switch, Xbox, PS5)
- 멀티스토어 확장: 스토브 + Epic + GOG

---

## 트러블슈팅 메모

### OAuth 정공법 실패 시
- F12 콘솔 에러 확인 (toolbar: true 필요)
- oauth-debug.log 확인
- Supabase Redirect URLs 등록 확인
- `curl http://localhost:3333/oauth-poll` 서버 응답 확인

### NW.js 빌드 실패 시
- nw-builder 캐시 삭제: `C:\Users\심도진\.cache\nw-builder\`
- node_modules 삭제 후 `npm install` 재실행
- DIROI 빌드 성공 버전과 맞추기

### 게임 진입 실패 (흰 화면)
- F12 콘솔 빨간 에러 확인
- chromium-args `--disable-features=CrossOriginOpenerPolicy` 확인
- `toolbar: true` 일시 활성화

### butler 업로드 실패 시
- `butler status beearth/exoduser` 로 슬러그 확인
- ZIP 내 EXE 경로 확인
- `butler login` 재로그인

---

문서 끝. 작성: 2026.05.16. 최종수정: 2026.05.16. FDG (FOR DEAR GAMERS).
