# HELL: EXODUSER - 얼리액세스 빌드 구축 마스터 체크리스트

작성일: 2026.05.16 | 최종수정: 2026.05.16
대상 폴더: G:\hell-ea\ (미생성 — PHASE 1에서 신규 생성)
참조 소스: G:\hell-build\ (데모, 현재 v0.1.0-demo)
런타임: NW.js (Electron 폐기 완료)
OAuth 참조 패턴: G:\pentafall\ (DIROI 완성 빌드)
전략 문서: docs/13출시·마케팅/HELL_DIROI_종합확장전략기획서_v2_0.md

---

## 현재 상태 스냅샷 (2026.05.16 기준)

| 항목 | 상태 |
|---|---|
| G:\hell-build\ | 존재 — v0.1.0-demo, BIC 데모 빌드 |
| G:\hell-ea\ | **미생성** — PHASE 1에서 생성 |
| butler CLI | hell-build\_itch_push.bat에 존재, 설치 확인 필요 |
| itch.io 계정 | beearth.itch.io — **"게임 개발 및 업로드" 미체크 (선행 필수)** |
| Steam Direct | 미결제 ($100 필요) |
| Supabase | tevlznuhjqcnzgewlswx 활성 중 |

---

## 빌드 정의 요약

| 항목 | 데모 | 얼리액세스 | 1.0 정식 |
|---|---|---|---|
| 폴더 | G:\hell-build\ | G:\hell-ea\ | G:\hell-release\ (추후) |
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
- 데모(G:\hell-build\) 수정 시 **BIC 제출용 ZIP은 별도 보존** — itch.io 데모용 재빌드 목적으로만 수정
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
- [ ] G:\hell-build\ 전체 구조 파악
- [ ] 명령: `dir G:\hell-build /B`
- [ ] 확장자별 사이즈 분포 확인:
  ```
  powershell -command "Get-ChildItem G:\hell-build -Recurse -File | Where-Object {$_.FullName -notlike '*node_modules*'} | Group-Object Extension | Select-Object @{n='Ext';e={$_.Name}}, @{n='Count';e={$_.Count}}, @{n='SizeMB';e={[math]::Round(($_.Group | Measure-Object Length -Sum).Sum / 1MB, 2)}} | Sort-Object SizeMB -Descending | Format-Table -AutoSize"
  ```

### STEP 0.2: 데모 진입 파일 확인
- [ ] package.json 내용 확인
  - 현재: name=`exoduser-hell-lord`, v`0.1.0-demo`, main=`indexdemo.html`
  - 현재 chromium-args: `--disable-web-security --autoplay-policy=no-user-gesture-required --enable-features=SharedArrayBuffer`
  - → EA용으로 DIROI 패턴 확장 필요 (PHASE 1.3)
- [ ] node-main.js 존재 여부 확인
- [ ] 빌드 스크립트 위치 확인 (build-nwjs.mjs 등)

### STEP 0.3: 데모 제한 코드 위치 파악
- [ ] 레벨 100 캡: `findstr /S /I /N "MAX_LEVEL\|LEVEL_CAP\|_DEMO_MODE" G:\hell-build\*.html`
- [ ] 스테이지 잠금: `findstr /S /I /N "stage.*lock\|DEMO_LIMIT" G:\hell-build\*.html`
- [ ] 합체/어픽스 밴 코드 위치 확인

### STEP 0.4: G:\hell-ea\ 폴더 존재 확인
- [x] `dir G:\hell-ea` 실행 → **미존재 확인 완료** (2026.05.16)
- [ ] PHASE 1에서 신규 생성

### STEP 0.5: butler CLI 확인
- [ ] `butler version` 실행 — 설치 확인
  - 미설치 시: https://itchio.itch.io/butler 다운로드 후 PATH 등록
- [ ] `butler login` — beearth 계정으로 로그인

### PHASE 0 완료 보고
- [ ] 분석 결과 종합 보고
- [ ] PHASE 1 진행 가능 여부 확인
- [ ] 도진님 승인 후 PHASE 1 진행

---

## PHASE 1 - EA 빌드 폴더 생성 (예상 시간: 20-30분)

### STEP 1.1: 디렉토리 생성
- [ ] `mkdir G:\hell-ea`
- [ ] `mkdir G:\hell-ea\docs`
- [ ] `mkdir G:\hell-ea\saves` (게스트 로컬 세이브용)

### STEP 1.2: 데모 파일 EA로 복사
- [ ] 핵심 HTML: `indexdemo.html` → `index.html`, `gamedemo.html` → `game.html`
- [ ] assets 폴더 통째로 복사
- [ ] 언어 파일 복사 (lang_*.js 26개)
- [ ] maps_data.js, lobby_i18n.js, GLTFLoader.js, three.min.js 복사
- [ ] 아틀라스 파일 복사 (atlas_*.json, atlas_*.png)
- [ ] BGM 폴더 복사
- [ ] package.json 복사 후 수정 준비
- [ ] 제외 항목: node_modules, out, cache, _itch_*, EXODUSER.exe, DLL/PAK/EXE 런타임 파일

### STEP 1.2.5: build-nwjs.mjs 이식 ★ (신규)
- [ ] G:\pentafall\build-nwjs.mjs → G:\hell-ea\build-nwjs.mjs 복사
- [ ] hell-ea 구조에 맞게 수정:
  - `app.name`: 'EXODUSER-EA'
  - `app.version`: '0.5.0'
  - icon 경로 (hell-ea 아이콘)
  - PORT 참조가 있으면 14267 → 3333으로 수정
- [ ] G:\hell-ea\package.json에 `"scripts": {"build:nwjs": "node build-nwjs.mjs"}` 추가
- [ ] `cd G:\hell-ea && npm install nw-builder`

### STEP 1.3: package.json 수정 (EA 정체성)
- [ ] `"name": "hell-exoduser-ea"`
- [ ] `"version": "0.5.0-ea"`
- [ ] `"main": "index.html"`
- [ ] `"window.title": "HELL: EXODUSER (Early Access)"`
- [ ] chromium-args 확장 (DIROI 패턴 적용):
  ```
  --disable-features=CrossOriginOpenerPolicy,CrossOriginEmbedderPolicy,IsolateOrigins,SitePerProcess
  --disable-site-isolation-trials --disable-web-security --no-sandbox
  --allow-running-insecure-content --user-data-dir=./userdata
  --autoplay-policy=no-user-gesture-required --enable-features=SharedArrayBuffer
  ```
- [ ] `"node-main": "node-main.js"` 추가
- [ ] `"node-remote": ["http://127.0.0.1:3333", "http://localhost:3333"]` 추가
- [ ] `"toolbar": true` (개발 중)

### STEP 1.4: 게임 내 버전 표시
- [ ] 메인 메뉴 하단에 "v0.5.0-ea Early Access" 표시
- [ ] 데모 텍스트 제거 ("DEMO", "FREE DEMO" 등)

### STEP 1.4.5: 데모(G:\hell-build\) 축소 작업 ★
> itch.io 데모용. BIC 제출 ZIP은 별도 보존 필수. 레벨/스테이지만 축소. 합체/어픽스는 현재 상태 유지.
- [ ] BIC ZIP 백업 확인 후 진행
- [ ] gamedemo.html str_replace:
  - `_DEMO_LV_CAP`: 500 → 100
  - `_DEMO_LAST_STAGE`: 3 → 0
- [ ] indexdemo.html: `startBtn500` ("▶ 500랩 체험") 버튼 `display:none` 처리
- [ ] 검증: 1-2 진입 시 demoEnd 화면 표시 확인
- [ ] 검증: 레벨 100 초과 시 경험치 정지 확인

### STEP 1.5: EA 빌드 검증
- [ ] `cd G:\hell-ea && npm install`
- [ ] `npm run build:nwjs`
- [ ] EXODUSER.exe 실행 → 메인 메뉴 진입 확인

### PHASE 1 완료 보고
- [ ] G:\hell-ea\ 폴더 정상 구축 및 빌드 가능
- [ ] 다음 PHASE 2 (데모 제한 해제) 진행 가능

---

## PHASE 2 - EA 데모 제한 해제 (예상 시간: 30분)

> **실제 상황**: game.html(EA)의 현재 코드는 이미 대부분 EA 목표값.
> `_DEMO_MODE=false`로 변경하면 레벨/스테이지/합체/어픽스 제한이 전부 해제됨.
> 합체/어픽스는 전체 허용 (도진님 확정).

### STEP 2.1: `_DEMO_MODE` 해제 (핵심)
- [ ] game.html: `const _DEMO_MODE=true;` → `const _DEMO_MODE=false;`
- [ ] 효과: 레벨 캡 해제, 합체 전체 허용, 어픽스 밴 해제, 스테이지 전부 개방
- [ ] 단, EA 종료 경계는 별도 로직으로 처리 (STEP 2.2)
- [ ] 강화 확률 공식 (99 × 0.99^n %) **절대 수정 금지**

### STEP 2.2: EA 레벨 캡 500 적용
- [ ] `_DEMO_MODE=false` 시 레벨 캡 로직이 사라짐 → EA전용 캡 상수 추가
  - `const _EA_LV_CAP = 500;` 추가
  - 레벨 업 로직에서 `_DEMO_MODE` 조건을 `_EA_LV_CAP` 조건으로 교체
- [ ] 검증: 레벨 500 초과 시 경험치 정지, 499까지 정상 레벨업

### STEP 2.3: EA 스테이지 경계 설정
- [ ] EA는 1챕터(hell:0, stage 0~3) 이후 "챕터 1 완료" 화면 표시
- [ ] `_DEMO_LAST_STAGE` 제거 후 `_EA_LAST_STAGE = 3` 상수로 교체
- [ ] demoEnd 화면 문구 EA용으로 교체:
  - "데모 종료" → "챕터 1 클리어"
  - "여기까지 데모입니다" → "챕터 2는 정식 출시에서 계속됩니다"

### STEP 2.4: 합체/어픽스 전체 허용 확인
- [ ] `_DEMO_MODE=false`로 `_DEMO_FUSE_ALLOWED` 체크 로직 비활성 확인
- [ ] `_DEMO_AFFIX_BANNED` 체크 로직 비활성 확인
- [ ] 전체 합체 목록 게임 내 노출 확인

### STEP 2.5: 스킬/아키타입/슬롯 확인
- [ ] 현재 코드 기준 스킬 풀 수량 확인 — 추가 활성화 필요 여부 도진님 결정
- [ ] 아키타입 현재 활성 종류 확인
- [ ] 아이템 슬롯 수량 확인 (공격/방어/악세)

### STEP 2.6: EA 빌드 검증
- [ ] 빌드 후 1-1 ~ 1-4 전 스테이지 진입 확인
- [ ] 1-4 클리어 → "챕터 1 클리어" 화면 표시 확인
- [ ] 레벨 500 캡 작동 확인
- [ ] 합체 전체 / 어픽스 전체 노출 확인

### PHASE 2 완료 보고
- [ ] EA 제한 해제 완료, 전체 콘텐츠 정상 노출
- [ ] 도진님 승인 후 PHASE 3 (Supabase 인증) 진행

---

## PHASE 3 - Supabase 인증 활성화 (예상 시간: 1시간)

### STEP 3.1: Supabase SDK 로드 확인
- [ ] index.html에 Supabase 로드 코드 활성화
- [ ] NW.js 환경 분기 추가 (file:// 차단 대비)

### STEP 3.2: Supabase 설정 확인
- [ ] SUPABASE_URL: `https://tevlznuhjqcnzgewlswx.supabase.co`
- [ ] SUPABASE_KEY: `sb_publishable_chAwadci1zVQNEKPC__s_w_7K3Oz_WP`
- [ ] Redirect URLs 등록 확인:
  - `http://localhost:3333`, `http://localhost:3333/`, `http://localhost:3333/**`
  - `http://127.0.0.1:3333`, `http://127.0.0.1:3333/**`

### STEP 3.3: 로그인 UI 추가
- [ ] #loginSection (display:none 기본)
- [ ] #googleBtn (Google 로그인)
- [ ] #guestBtn (게스트 시작)
- [ ] HELL 다크 톤 디자인

### STEP 3.4: 세션 확인 로직
- [ ] `sb.auth.getSession()` 호출
- [ ] 세션 있으면 → 캐릭터 선택 / 없으면 → #loginSection 표시

### STEP 3.5: 게스트 모드 처리
- [ ] G:\hell-ea\saves\ 폴더에 JSON 저장
- [ ] 클라우드 세이브 비활성

### PHASE 3 완료 보고
- [ ] 로그인 UI 정상 표시, 게스트 모드 진입 가능
- [ ] 다음 PHASE 4 (OAuth 정공법) 진행 가능

---

## PHASE 4 - NW.js OAuth 정공법 이식 (예상 시간: 1-1.5시간)

참조: G:\pentafall\nwjs\node-main.js + G:\pentafall\src\auth\auth.js

### STEP 4.1: node-main.js 신설
- [ ] G:\hell-ea\node-main.js 생성
- [ ] HTTP 서버 (port 3333)
- [ ] 라우트: `/oauth-callback`, `/oauth-deposit` (POST), `/oauth-poll` (GET)

### STEP 4.2: index.html OAuth 분기 코드
- [ ] isNWJS 환경 감지 함수
- [ ] signInWithGoogle:
  - 웹: `sb.auth.signInWithOAuth({provider:'google'})`
  - NW.js: `window.nw.Shell.openExternal(oauthUrl)` + 폴링
- [ ] 토큰 수신 시 `sb.auth.setSession()` 호출

### STEP 4.3: 로그아웃
- [ ] `sb.auth.signOut()`
- [ ] NW.js: `nw.App.restart()` / 웹: 페이지 새로고침

### STEP 4.4: 빌드 + 테스트
- [ ] 게스트 → 게임 진입 확인
- [ ] Google → 외부 브라우저 OAuth → 자동 진입 확인
- [ ] 로그아웃 → 앱 재시작 확인

### PHASE 4 완료 보고
- [ ] OAuth 정공법 정상 작동 (DIROI와 동일 흐름)
- [ ] 다음 PHASE 5 (캐릭터 + 클라우드 세이브) 진행 가능

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
- [ ] hell-build + hell-ea 동시 실행 충돌 없음
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
butler push "G:\hell-build" beearth/exoduser:windows-demo --userversion 0.1.0

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
