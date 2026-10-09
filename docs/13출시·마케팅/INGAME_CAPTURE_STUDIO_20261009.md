# 신버전 수동 촬영 스튜디오 — 2026-10-09

최신 승인 소스의 실제 수동 플레이를 녹화하는 독립 운영자 UI다. 구버전 영상 재사용을 막기 위해 소스 검증을 부팅과 녹화 전후에 수행한다. 게임·서버·세이브·기존 20261008 촬영 도구를 수정하거나 실행하지 않는다. 이 문서와 새 HTML/JS 두 파일만 이번 담당 범위다.

| 항목 | 계약 |
|---|---|
| UI | `tools/marketing_capture_studio_20261009.html` |
| JS | `tools/marketing_capture_studio_20261009.js` |
| 진입 출처 | 기존 `http://127.0.0.1:3387` 또는 `http://localhost:3387` 서버만 허용. 다른 포트·프로토콜·호스트는 부팅 거절 |
| 서버 선행 검수 | 운영자가 migration 체크아웃, 기존 3387 서버, 독립 SAVE_DIR를 확인. 도구는 서버 실행·설정·재시작을 하지 않음 |
| 필수 해시 | 승인한 `game.html`, `tools/2_5d/ch1-field-terrain.mjs`, `tools/2_5d/ch1-player-rig.mjs`의 SHA256 64자리 3개. 독립 파일 확인에서 얻은 expected 값을 수동 입력 |
| 부팅 gate | 현재 game 원문 바이트 SHA를 먼저 확인. 원문의 두 dynamic import URL과 v query를 보존하면서 `__captureSession`·`__captureSha256`를 추가한 고유 URL로 검증 fetch 및 실제 import를 통일. rig의 플레이어·드루이드 두 import 모두 계측. 하나라도 불일치/누락/읽기 실패면 game 파싱 전 중단 |
| 실제 게임 URL | `/game.html?demo=1&slot=marketing_manual_<timestamp>_<random>&ch1Three=1&ch1Rig=1` |
| renderer 선택 | 기본 Auto는 기존 게임 정책 유지. 운영자가 GL을 명시 선택하면 기존 `_bootRenderer()` query 계약인 `webgpu=0`만 게임 URL에 추가. 저장 설정·런타임 renderer 변수 변경 없음. 실제 `_useGPU/_useGL`을 읽은 `renderBackend`, 선택값·source URL/query를 JSON에 기록. renderer 간 시각 동등성 미검증 |
| 소스 실행 | 검증된 game 원문에 navigation 차단·module 고유 URL·base/CSP·관측 브리지만 메모리에서 추가. `document.open()` 뒤 저장격리 설치가 성공한 경우에만 계측 HTML `document.write()` 수행. 격리 설치 예외가 나면 게임 태그를 파싱하지 않음 |
| 캐릭터 | 운영자가 0 warrior / 1 silvertail 선택. 격리 Storage `_charIdx`만 기록. 기존 캐릭터 데이터 신규 생성·성장 조작 없음 |
| 수동 입력 | W/A/S/D·LMB·Q·E 유지/해제; Q/E/Shift/Space/Ctrl/1~5 100ms pulse; 8방향 aim. Q/E/3타 LMB의 실제 홀딩 차징·해제 타이밍은 운영자가 유지/해제 버튼으로 직접 조절. 스케줄/자동전투 없음. `KeyboardEvent`, 기존 K/MB/MBjust/mouse 입력만 사용. 조준 거리는 화면 중심 기준 VW×0.22 및 VH×0.22의 8방향 성분 |
| 허용 보조 | 기존 `_cutsceneEnd()`·`_finishIntroGuide()`의 정상 활성 상태 skip만 명시 버튼으로 호출. 녹화 중 skip/일시정지 전환 금지 |
| 정상 연습 skip | 별도 `Use normal practice skip` 버튼은 활성 `_parryLesson.panel`의 실제 `button.lesson-skip`을 클릭. 기존 게임 `skipAll()` 흐름에 따른 연습 상태 복원·종료이며 촬영 도구가 수치를 따로 설정하지 않음. 녹화 중 금지 |
| 운영자 버튼 포커스 | 부모 버튼 mousedown의 기본 포커스 이동 방지 → iframe focus → 입력 순서. 방향/공격/Q/E 유지 의도는 부모 Set에 기록하고 다음 명시적인 운영자 버튼 조작 때만 실제 KH/MB에서 사라진 조합을 재입력. 자동 재주입 루프 없음. 기존 game blur `_clearHeldInput()`은 보존 |
| 포커스 이탈 해제 | 부모와 iframe 문서 모두 focus를 잃거나 탭이 숨겨지면 운영자 유지 Set 및 실제 입력 해제. iframe.focus 자체를 외부창 이탈로 오인하지 않음. pause/boot/skip/녹화 종료에서도 Set 해제 |
| 기본 운영 화면 | 폭 1000px 이상에서 340px 조작 사이드바와 실제 게임 viewport를 나란히 표시. Source verification/boot는 접이식 setup, QA/미리보기도 접이식. iframe 내부 1920×1080 유지; CSS 표시 폭만 축소 |
| 조작 제한 | 적 스폰·자동추적·자동패링·텔레포트·Lv500·HP/MP/ST·무적·스킬·장비·build target 변경 없음. 코드 입력/실행 박스 없음 |
| 녹화 | 1920×1080 원본 Canvas, `captureStream(30)` 기본·60 선택 가능. 수동 길이 20~60초, 기본 30초. 실제 `MediaRecorder.isTypeSupported` 결과를 UI에 표시. 지원 H.264/AAC MP4 level4.2→level4.0→baseline→compatible→main→H.264/Opus WebM 순으로 기본 선택, 모두 불가면 VP9/Opus WebM fallback. 운영자가 지원 코덱 중 직접 선택. 요청 영상 28,000,000bps·음성 256,000bps |
| 합성 레이어 | `c → fogGL → burstCvs → ct → vfx3dCvs → boss3dCvs`. 기존 `_drawBurst` 완료 직후 실제 여섯 Canvas 합성. HTML HUD/메뉴는 미포함 |
| 실제 FPS | 위 실제 합성 시각에서 `(frames−1)/(마지막−첫 시각)` 산출. 요청 30/60fps·인코딩 프레임률·동일프레임 여부와 별개. 게임 루프/렌더 속도·장면·전투값을 변경하지 않음 |
| 실제 오디오 | `actx()/mbus()/_comp` 출력 tap. 이후 생성되는 실제 compressor 우회 voice 출력도 캡처 목적지에 추가 연결. 생성 음악·음성 대체 없음. 청취 확인 필요 |
| 종료 | 입력 해제 후 disposable iframe만 `G.paused=true`. game 파일·다른 탭 상태는 변경하지 않음. 전경 탭이 숨겨지면 오류 기록 후 녹화 중지 |
| 출력 | 실제 recorder MIME에 맞는 MP4 또는 WebM/JSON/PNG 다운로드, 녹화 Blob 실제 video 미리보기. 서버 POST·업로드·자동 게시 없음 |
| 최종 소스 gate | 녹화 직전 및 종료 직후 동일 expected 3개 재검증. 바이트 불일치/읽기 실패/프레임0/관측 오류면 `REJECTED`, 그 외 `REVIEW_REQUIRED`. `publicationApproved=false` |

## 저장격리와 공유 API

3387 서버의 SAVE_DIR가 분리되어도 `/api/mats` 및 브라우저 공유 재화/창고는 슬롯 번호만으로 분리되지 않는다. 따라서 게임 파싱 전 다음을 적용한다.

| 경로 | 처리 |
|---|---|
| localStorage / sessionStorage | iframe Storage get/set/remove/clear를 `capture_studio_20261009:<session>:` prefix에 한정. `Storage.key()`도 전용 prefix 키 이름만 반환. 일반 저장 키는 읽거나 덮어쓰거나 clear하지 않음 |
| API fetch 읽기 | `/api/slots`→빈 목록, `/api/mats`→0, 나머지 `/api/*`→null data. HEAD는 빈 body. 실제 API에 전달하지 않음 |
| fetch 쓰기 | GET/HEAD 외 메서드는 로그와 403 가짜 응답으로 차단. recording 저장 POST도 도구에 없음 |
| 외부 fetch | 같은 출처가 아닌 읽기 fetch도 차단 |
| XHR | API 읽기·쓰기·외부 출처는 send 단계에서 예외로 차단. 같은 출처 비API GET/HEAD만 허용 |
| 기타 공유 저장 경로 | sendBeacon, WebSocket, EventSource, SharedWorker, IndexedDB open/delete, CacheStorage open/match/delete/keys, service worker register 차단. 기존 active service worker controller가 있으면 부팅 거절 |
| 문서 이동 | 번들 Acorn AST로 실제 game script의 location assignment·assign/replace/reload·window open/close를 차단 호출로 치환. 현재 inline 7곳 exact count gate, 생성 boss-test onclick 2곳 exact 원문/count gate. 외부 script 및 재귀 소비 module의 navigation·미승인 location/window alias·동적 import 표현식·동적 Function/미승인 eval은 부팅 거절. 원문 SHA, 계측 SHA, 변경 사이트·import URL, 의존 파일 SHA를 audit 기록 |
| 추가 navigation backstop | iframe sandbox는 scripts/same-origin만 허용. 게임 내부 anchor click·form submit/requestSubmit·window.open 차단. location 읽기 유지. iframe load 후 재설치 방식에 의존하지 않음 |
| 중첩 iframe | game realm `document.createElement('iframe')` 거절. CSP `frame-src 'none'`, `object-src 'none'`, `form-action 'none'`으로 문자열 DOM 등 중첩 문서도 로드하지 않음. main-rift-host가 새 iframe을 만드는 경로도 이번 수동촬영에서 허용하지 않음. Blob 계산 Worker는 별도 `worker-src 'self' blob:` 유지 |
| 게임 save guard | `_dbReady=false`, `_charId=null`, `_autoSaveTimer` 해제, `dbSave/dbSaveNow/dbSaveForce/startAutoSave/_saveSharedMatsToServer` no-op. 후속 게임 부팅 재설정에 대비해 100ms마다 재적용 |
| 기존 Worker | 현재 game의 Blob flowfield·충돌 계산 Worker 2개는 계산 전용이며 저장/네트워크 경로가 없어 유지. 이들을 차단해 게임 동작·성능을 바꾸지 않음 |
| 오류 관측 | window error / unhandledrejection 및 원래 동작을 유지한 console.error 관측. 게임 loop catch의 오류도 감사에 포함 |

Storage는 현재 game 및 직결 script의 실제 `getItem/setItem` 경로에 맞췄다. 일반 localStorage 값·키를 캡처 JSON에 수집하지 않는다. 촬영 prefix 데이터는 브라우저에 남을 수 있으며 매 boot 새 prefix를 사용한다. 기존 save 전체 삭제는 하지 않는다.

## 읽기 전용 런타임 QA 및 감사

현재 game의 정확한 전역 이름은 `__ch1FieldTerrainQA`, `__ch1PlayerRigQA`, `__ch1DruidRigQA`다. 이를 호출해 읽은 snapshot을 UI와 JSON에 표시한다. 쓰기 setter/애니메이션 강제/모델 변경을 수행하지 않는다. 녹화 진입은 실제 플레이 G.on, HP>0, 최근 실제 합성 프레임, save guard, terrain.ready, rig requested/scope/adapter.ready, import 실패 없음과 unpaused 상태를 요구한다.

JSON은 initial/final player·skills·runtime snapshot, source URL/query, 초기 좌표, 100ms HP/상태/킬·QA 샘플, 실제 `_addSkProf`/`doParry`, 운영자 입력, 실제 AudioBufferSourceNode 시작, 실제 합성 프레임 시각/간격, AudioContext/트랙, 요청 및 recorder 실측 bitrate, video track settings, 오류·차단 요청, 부팅/녹화 전후 소스 SHA를 담는다. 소스 commit 입력은 운영자 진술로 기록하며 game SHA 대용으로 취급하지 않는다.

코덱 선택 감사: `selectedMimeType`, 실제 `mimeType`, 선택 `requestedFps`, 전체 `codecSupport`, video track settings를 함께 기록한다. H.264 선택·isTypeSupported true는 하드웨어 인코더 사용이나 실제 목표 프레임률 달성 보증이 아니며 `hardwareAcceleration='unverified'`다. 1280 영상을 확대하지 않고 1920×1080 실제 Canvas를 계속 캡처한다. 기본 30fps는 인코딩 부담을 줄이기 위한 요청값이며 실제 게임/영상 성능은 팀장의 후속 테이크 검사로 판단한다.

추가 구문·선택 로직 검증: 지원 H.264 우선 및 H.264 미지원시 VP9 fallback을 VM에서 확인했다. default 30fps, GL 선택에서만 `webgpu=0`을 추가하는 query 계약도 확인했다. 실제 브라우저 지원 결과는 UI의 `Actual browser codec support`와 codec select에서 팀장이 직접 확인하며 encoder 성공·성능은 후속 촬영 검수 대상이다.

expected 해시 gate 범위는 game 원문과 직결 두 모듈이다. 두 모듈은 오래된 module cache를 피하는 고유 session/SHA URL을 실제 실행에 사용한다. 그 밖의 재귀 의존 모듈·외부 script는 부팅 전 navigation AST 및 바이트 SHA를 감사하지만 이미지/사운드까지 바이트를 고정하지 않으며 검증 사이에 잠시 바뀌었다가 복구되는 서버 변경도 검출 보증이 없다. 실제 실행 및 촬영 동안 소스·에셋 수정이 없는 승인 snapshot을 유지해야 한다. Three preview 활성 여부는 shipping Steam 데모 동등성이나 시각 PASS를 뜻하지 않는다.

## 제작 검증과 남은 검수

게임을 실행하지 않은 Node VM 검증을 수행했다. 정확한 실제 파일 바이트 3개와 authored import query 통과, 잘못된 game SHA·변경 terrain·누락 SHA·잘못된 포트 거절을 확인했다. 격리 VM에서는 일반 save/mats 읽기 차단, prefix 쓰기, 전용 clear 후 일반 값 보존, API 읽기 가짜 응답, fetch POST 403, XHR API·IndexedDB·WebSocket 차단을 확인했다. `node --check` 통과. 이는 실제 부팅·녹화·오디오·다운로드 또는 시각 PASS를 대신하지 않는다. 해당 CUA 검수는 팀장 담당이다.

추가 navigation 검증: 실제 현재 HTML의 9개 문서 이동 사이트(7 AST + 2 생성 handler) 차단 및 외부/재귀 의존 67개 navigation 감사를 통과했다. assignment/assign/replace/reload/open fixture 실행은 모두 차단 함수만 호출했고 alias·외부 navigation은 거절했다. location.search 읽기를 보존했다. session/SHA query 및 rig 두 import 계측을 확인했다. 중첩 iframe 생성은 별도 격리 VM에서 거절을 확인했다. parser는 기존 migration 의존성 Acorn을 새 도구 JS 내부에 번들했으며 MIT 저작권·라이선스 전문과 vendor 경계 주석을 함께 포함했다. 새 runtime 의존 파일은 없다.

운영자 입력 보정: 실제 게임 `_clearHeldInput()`이 iframe blur 때 K/KH/MB를 해제하는 것을 확인했다. 이전 focus-after-dispatch와 실제 입력 상태 기준 toggle은 W 유지 후 다른 부모 버튼을 누를 때 해제/토글 오류를 만들 수 있었다. 버튼 유지 의도를 별도로 기록하고 focus-before-dispatch 및 명시 조작 시에만 빠진 held 조합을 복원한다. VM 조작 테스트로 W 유지→Attack 유지→aim→W 해제 순서와 외부 이탈 해제를 확인한다. 실제 CUA 입력·구도·오디오 검수는 팀장이 수행한다.

작성 후 docs/ 전체에서 `captureStream|MediaRecorder|저장격리|촬영|ch1Three|ch1Rig|트레일러`를 rg 검색했다. 20261008 촬영도구·manifest, 기존 V2/V22/V25 기록 및 PM 회의는 당시 이력으로 보존한다. 이번 새 도구의 모든 값·제약·미검증 사항은 이 문서에 기록한다. 게임·맵 제작 변경은 없다. 커밋은 팀장이 세 파일을 함께 수행한다.
