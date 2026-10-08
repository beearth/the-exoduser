# 로컬 실제 게임 촬영 스튜디오 — 2026-10-08

## 목적과 파일 소유권

실제 현재 `game.html`의 Canvas/WebAudio를 CUA에서 버튼으로 녹화하는 독립 촬영 페이지다. 새 HTML/JS/이 문서만 추가하며 `game.html`, `server.cjs`, 기존 촬영 도구, 게임 에셋·맵·밸런스 파일을 변경하지 않는다. 외부 Playwright/CDP 실행·업로드·외부 계정 조작은 이 도구에 없다. 촬영은 로컬에서 CUA의 조작 버튼을 통해 팀장이 직접 시작한다.

| 항목 | 계약 |
|---|---|
| UI | `tools/marketing_capture_studio_20261008.html` |
| 런타임 제어 | `tools/marketing_capture_studio_20261008.js` |
| 진입 | 기존 서버의 `/tools/marketing_capture_studio_20261008.html` — 예: `http://127.0.0.1:3333/tools/marketing_capture_studio_20261008.html`; 별도 격리 서버 3338에서도 동일 경로 |
| 실제 게임 viewport | iframe 1920×1080; 바깥 페이지 폭에 따라 CSS 표시만 축소 |
| 소스 로딩 | 같은 출처의 현재 `/game.html` 원문을 fetch; 파싱 전 저장격리 bootstrap, 파싱 후 전역 lexical P/G 접근용 촬영 브리지 삽입. 원본 파일은 보존 |
| 소스 확인 | fetch 원문 바이트 SHA256 자동 계산; `Source git` 입력란에 팀장이 실제 구동 체크아웃 commit을 입력. 해시가 없는 경우 null이며 확정값을 추측하지 않음 |
| 녹화 | `1920×1080`, `captureStream(60)` 요청, VP9+Opus WebM, 영상 28,000,000bps·음성 256,000bps 요청 |
| 실제 FPS | 게임 `_drawBurst` 직후 합성한 프레임 시각으로 측정. 요청 60fps는 달성 보증이 아니며 미디어 파일의 인코딩 FPS/중복프레임 분석과 별도 |
| 영상 레이어 | `c → fogGL → burstCvs → ct → vfx3dCvs → boss3dCvs` 실제 Canvas. DOM HUD·메뉴·인트로 HTML은 영상에 포함되지 않을 수 있음 |
| 오디오 | 실제 `actx()/mbus()/_comp` 출력; 이후 생성되는 compressor 우회 voice 노드도 실제 AudioContext 목적지 연결 시 캡처 목적지에 추가 연결. 합성음·추가 BGM 없음 |
| 출력 | stop 후 WebM Blob의 anchor 다운로드(자동 기본 ON), 재다운로드 버튼, JSON 로그, 실제 합성화면 PNG, 비디오 미리보기 |
| 검수 상태 | 제작 시 syntax 확인만 수행. 실제 브라우저 부팅·스킬·영상·오디오·다운로드는 팀장 CUA 검수 필요. Steam 데모 바이너리 동일성 미검증 |

## 두 가지 촬영 모드

| 모드 | 게임 경로와 변경 범위 |
|---|---|
| STAGED Lv500 showcase | `/game.html?test=1&slot=marketing_capture_…&testchar=1`. `demo` 동시 사용 금지. 최신 `build-target.js` 기본 demo 분기를 피하기 위해 이 iframe에서만 `EXODUSER_BUILD_TARGET='full'` getter 고정. `G.on && P.lv===500` 대기 후 일시정지. 실제 데모 레벨/정규 난이도 증빙으로 사용 금지 |
| MANUAL DEMO | `/game.html?test=1&slot=marketing_capture_…&demo=1`. build target 기본값 유지. 인위적 적·레벨·HP·MP/ST·무적·장비·스킬슬롯 변경 없음. 실제 입력으로 8~20초(기본 12초) 녹화 |

양쪽 모두 기존 실제 아트·스킬 함수·피해 표시·현재 게임 루프를 사용한다. 새 에셋, 촬영용 슬로모션, 프레임 보간을 추가하지 않는다. 게임 자체의 기존 보간/히트스톱/스킬 연출은 그대로 렌더된다. `English UI + 60 FPS cap`은 설정만 명시적으로 적용하며 촬영 전 설정을 확인한다. 초기 저장격리 언어는 `hellLang='en'`이다.

일반 데모의 `Skip current intro / guide`는 현재 활성 상태일 때 기존 `_cutsceneEnd()`·`_finishIntroGuide()`만 호출한다. 인트로의 다음 단계로 넘어가면 다시 누를 수 있다. 전투 중에는 skip 호출하지 않는다. 캐릭터 선택 번호는 boot 전에 0/1을 명시적으로 고르며 실제 게임 선택 흐름을 우회하는 신규 캐릭터 데이터를 만들지 않는다.

일반 데모는 iframe 직접 입력을 우선한다. UI의 W/A/S/D·공격 유지/해제, Q/E/Shift/Space/Ctrl/1 단발 버튼은 실제 게임 K/MB/KeyboardEvent 입력만 사용한다. 사용한 버튼과 실제 시간은 `operatorControls`에 남긴다. 보호·수치 변경은 없다. 단발 keydown은 100ms 후 keyup이며, 촬영 전에 `Release all inputs`로 유지 입력을 해제할 수 있다. 무지개탄 Q 전용 규칙을 변경하지 않으며 E로 마법 패링을 대체하지 않는다.

## 저장격리

| 항목 | 처리 |
|---|---|
| 로컬 저장 | 게임 script 실행 전 iframe realm의 Storage get/set/remove/clear를 `capture_studio_20261008:<session>:` prefix로 격리; localStorage와 sessionStorage 모두 적용 |
| 캐릭터 선택 | 격리 prefix에만 `_charIdx='0'` 또는 `'1'` 저장. 일반 사용자 `_charIdx`·기존 세이브·공유재화·창고는 읽거나 덮어쓰지 않음 |
| 저장 슬롯 | boot마다 `marketing_capture_<timestamp>_<random>` 새 슬롯 |
| API 읽기 | iframe fetch `/api/slots`는 빈 목록, `/api/mats`는 0, 기타 `/api/*`는 null data 응답. 실제 사용자 저장 로드/공유재화 유입 방지 |
| API/외부 쓰기 | iframe fetch의 GET/HEAD 외 모든 요청 차단·로그. XHR 쓰기·sendBeacon도 차단. 게임 밖 부모 페이지의 일반 기능은 변경하지 않음 |
| 런타임 save guard | `dbSave`, `dbSaveNow`, `dbSaveForce`, `startAutoSave`, `_saveSharedMatsToServer` no-op; `_dbReady=false`, `_charId=null`, `_autoSaveTimer` 해제. async boot 재설정을 대비해 100ms마다 재적용 |
| 잔여 데이터 | 촬영 전용 prefix는 브라우저에 남을 수 있음. 일반 저장과 별개이며 매 boot 새 prefix 사용. 도구는 일반 저장 전체 삭제를 하지 않음 |

이 방식은 촬영 HTML을 메모리에서 보강한다. API 쓰기 차단이 제공되는 별도 로컬 격리 서버가 있으면 함께 사용할 수 있다. 도구 자체는 서버를 새로 실행하거나 기존 서버를 수정하지 않는다.

## 여섯 staged take

Prepare는 현재 P 좌표를 기본 anchor로 유지한다. `Restore initial spawn coordinates`를 선택하면 최초 G.on 시점 좌표로만 복귀한다. 구버전 고정 `(4000,5840)`·`(3740,6900)` 좌표는 사용하지 않는다. 실제 `isW`로 플레이어 anchor 및 적 후보 중심/상하좌우 18px를 검사하고 후보당 최대 24회 재시도한다. 요청·실제 배치·벽 때문에 생략한 수를 기록한다. 실제 이동 경로/전체 지형 시각 QA를 보증하지 않는다. 적을 하나도 배치하지 못하면 명시적으로 중단한다.

| take ID | 길이 | 요청 적 수 | 임시 생성 Lv | 기본 반경(px) | 동작 |
|---|---:|---:|---:|---:|---|
| parry | 10초 | 24 | 35 | 380 | 0.3/4.8초 실제 적 마법 투사체 windup; 접근 탄 도달 예측으로 Q 입력(아래 추가절) |
| rage_slam | 8초 | 256 | 35 | 220 | 초기 분노 최대; 3.8초 giantSlam 디스패치 |
| fire | 11초 | 128 | 75 | 420 | 1~6초 좌우 aim + Shift/RMB 6회; 7.5초 기존 `_detonateAssaultFlames()` |
| ice_orb | 8초 | 72 | 35 | 400 | 1.5초 iceOrb 디스패치 |
| ancestor | 8초 | 72 | 120 | 430 | 1초 ancestorSummon 디스패치; 현행 장비/도감 조건 때문에 발동 실패 가능, 성공은 검수 전 미확인 |
| blackhole | 10초 | 120 | 80 | 390 | 0.2/2/3.8초 실제 적 windup; 1초 lavaSummon 디스패치 |

staged에서만 적·투사체·전리품·잔여 일부 VFX를 제거하고 현재 맵에 `mkEn`으로 시연 적을 배치한다. 생성 때만 임시 P.lv를 표 값으로 바꾸고 finally에서 500으로 복구한다. 피해/AI/투사체 분류 공식은 변경하지 않는다. 스킬의 실제 `_dispatchSkillSlot` 반환값과 `_addSkProf`, doParry 호출을 로그로 확인한다. 디스패치 true만으로 최종 화면 성공을 확정하지 않는다.

| staged 메모리 변경 | 값/이유 |
|---|---|
| 플레이어 HP | 시작 mhp/hp 100,000,000. 녹화 중 HP 회복·무적 강제 유지 없음; 실제 HP 감소·피격·상태 그대로 기록 |
| MP/ST | 시작 최대; 녹화 중 100ms마다 최대 보충 |
| 합체/상시 스킬 | `_fused={}`, guardian/fireAura/holyDome=0, holyDome cooldown 999999; 시연 동작 구분용 |
| 바인딩/활성 스킬 | charge=ShiftLeft, beam=mouse2, weapon=mouse0, parry=KeyQ; charge/iceOrb/detonate/fireball 활성 세팅 |
| 장비 | 기존 랜덤 testchar 장비에서만 onCritExplode/onCritChain affix 제외; 재귀 크리티컬 오류 관찰에 따른 메모리 한정 조치. 제거 슬롯·id·value 기록 |
| 기타 | 일부 시연 스킬 cooldown/상태 초기화, 초기 shake/hitStop/slowMo=0. 이후 실제 게임 효과 그대로 |

## 실행 순서와 검수 로그

1. 정확한 최신 게임 checkout에서 실행 중인 로컬 서버로 페이지를 연다. source commit을 입력하고 Character 0/1을 고른다.
2. `Boot actual demo` 또는 `Boot Lv500 showcase`를 선택한다. 일반 데모는 정상 시작/인트로를 완료하거나 기존 skip 버튼을 사용한다.
3. `Enable real audio`를 직접 누르고 running 상태를 확인한다. 필요 시 English/60fps 설정 버튼을 누른다.
4. staged는 take Prepare → Record, 일반 데모는 Manual duration 8~20 → Record manual demo → 실제 입력. 탭을 전경에 유지한다.
5. stop 후 3338 기존 서버의 `/__recording`에 WebM과 JSON 자동 저장 성공을 확인한다. 브라우저 다운로드 버튼도 유지하며 CUA waitDownload는 이 IAB에서 시간초과가 있어 사용하지 않는다. JSON·PNG도 필요한 경우 받는다. 미리보기의 실제 영상/피해 숫자/스킬·오디오를 검수한다.

JSON은 staged 구분, 실제 게임 URL, 원문 SHA256, 수동 sourceGit, 선택 번호·촬영 슬롯, 강제 build target, 인위적 변경, 초기/종료 P, 스폰 수, 계획/실행 입력, 실제 스킬/패링, 100ms HP 샘플, Canvas 프레임 시각·간격·측정 FPS, 피해 숫자 호출 수, 실제 AudioBufferSourceNode start, AudioContext/트랙 상태, 오류·차단 요청을 포함한다. 음성 node start는 실제 소리가 들렸다는 보증이 아니며 청취 검수가 필요하다. 원본 Canvas와 CSS 보이는 프레임도 서로 다를 수 있으므로 PNG/영상 미리보기로 합성을 확인한다.

## 기존 도구와 차이 및 동기화

참고한 기존 `trailer_realtime_20260909.mjs`, `trailer_scenes_20260909.mjs`, `recapture_trailer_combat_v22_20260909.py`, `recapture_trailer_damage_v25_20260910.py`의 실제 레이어 합성·WebAudio·mkEn·스킬/입력 호출 구조를 재작성했다. 원본 파일을 import/실행하거나 CDP로 제어하지 않는다. 구버전 CDP 바이트 추출은 Blob 다운로드로 대체했고, 피해 숫자 숨김/피격 깜박임 제거는 재사용하지 않는다. 이전 고정 좌표를 제거하고 현재/최초 P anchor와 충돌 검사를 추가했다. ice/ancestor는 요청에 맞춰 각각 8초로 조정했다. 최신 `expo_current_recorder.js`의 HP 매 프레임 회복·고정 좌표·30fps 요청은 가져오지 않았다.

코드 작성 후 docs/ 전역에서 `captureStream|MediaRecorder|testchar|Lv500|trailer_realtime|SKILL_TRAILER_V25|_cutsceneEnd|_finishIntroGuide`를 rg 검색했다. 관련 V2/V22/V25, `ON_CRIT_RECURSION_OBSERVATION_20260910.md`, `TRAILER_CHARACTER_VOICE_FIX_20260909.md`, `COMBAT_PRESENTATION_20260909.md`는 당시 결과의 기록이며 값/결과를 소급 변경하지 않는다. 이번 신규 도구의 계약과 변경은 이 문서가 기록한다. 부모가 복사할 최신 worktree의 game source와 동작은 별도 CUA 검수 대상이다.

검증: JS `node --check` 수행. 브라우저/녹화/실제 스킬 검수는 수행하지 않았으므로 visual PASS 판정 없음. 게임/맵 제작 변경은 없음.

## 2026-10-08 패링 테이크 실제 투사체 감지 보정

첫 8초 테이크 감사에서는 Q 숙련 로그와 `sBlock` 상태가 있었지만 실제 `doParry` 호출은 0이었다. 최신 게임의 적 차징 60틱에 탄 이동 시간이 더해지므로 고정 Q 1.25~1.65초 / 4.25~4.65초를 성공 증거로 사용할 수 없다. 게임 코드·HP 보호·패링 수치·쿨다운은 변경하지 않고 촬영 브리지의 입력 시점만 보정한다.

| 항목 | 현행 값·조건 |
|---|---|
| 길이 / wave | 10초 / 0.3초·4.8초에 기존 적 windup 사용 |
| parry 전용 탄종 | black·fire·water·dark 순환. 물리 red 탄을 Q 전용 시연에서 제외. 무지개 blackBean은 Q만 사용 |
| 감지 대상 | 실제 `projs`의 살아 있는 비우호·패링 가능 마법탄. blackBean 또는 게임 `_projectileParryClass(p)==='magic'` |
| 스캔 / 접근 | 플레이어 200px 안, 플레이어 쪽 방사 속도 >0. 접근 탄이 관찰된 렌더 프레임 수를 `nearMagicFrames`로 기록 |
| 도달 예측 | `max(0,(거리−100)/접근속도) <= 12틱`이면 Q 입력 후보. 속도는 실제 탄의 px/틱 값이며 게임 60Hz의 20틱 눌림 패링 안에 100px 띠에 도달하도록 여유를 둠 |
| 입력 가능 상태 | idle / wRecover / magicRecover, 실제 Q 쿨다운 <=0, MP>=10, 얼음보주 비활성. MP·쿨다운을 감지기가 강제 수정하지 않음 |
| Q 해제 / 재입력 | 눌림 0.18초 후 실제 keyup, 해제 후 최소 0.10초 및 게임 자체 쿨다운 종료를 모두 기다림 |
| 입력 감사 | `detected Q down/up`, 감지 거리·접근속도·예측틱·무지개탄 여부. 실제 패링 이벤트에 `qWindow`를 기록하여 idle 상태의 해제 패링도 집계 |
| 합격 조건 | `nearMagicFrames>0`이며 실제 `doParry`의 Q 호출 수 `actualQParries>0`. `parryVerification.status=PASS/FAIL`·실제 전체/ Q 패링 수·입력 횟수·근거를 JSON과 화면 감사 영역에 표시 |
| 실패 | 접근 마법탄 없음 / 실제 Q 패링 0이면 오류 로그와 FAIL. 빈 영상·입력 실행만으로 성공 처리하지 않음. 열린 바닥에서 실제 탄 도달 경로를 확인하고 재촬영 |

이 변경은 staged parry만 적용한다. 일반 데모 입력과 다른 테이크·서버 저장 완료 처리는 보존한다. docs/ 전체 `rg` 검색에서 이 신규 도구 계약을 직접 기록하는 문서는 현재 문서이며, 기존 9월 촬영 문서는 당시 이력으로 유지한다. 문법·격리 모의 입력 검증과 실제 브라우저 성공 판정은 구별하며, 실제 PASS는 새 촬영 감사로 확인한다.

## 2026-10-08 실제 촬영 검수 보완

| 항목 | 검증 결과 |
|---|---|
| 현재 소스 | origin/main `2f5aa0e88e32ff2d82a93f9c6098643d8d1f6427` 별도 체크아웃, game.html SHA256 `bf38f6668d93cdc3bffa909250656d56675b734b27971a5103b3730edb3d1b3e` |
| 정상 맵 | showcase URL의 stage 인자를 생략. 명시적 stage=0은 별도 원형 plate-test arena를 켜므로 초기 실험 원본을 최종 편집에서 제외. 재촬영 시작 anchor (4020,7420), 실제 CH1 Rotten Forest |
| 출력 보완 | recorder stop에서 WebM+JSON을 기존 capture server `/__recording?name=…`에 순차 POST. 서버 성공 응답 후 Server save 표시. 저장 실패는 로그 표시, 기존 다운로드 유지 |
| Q 실제 검증 | 새로운 정상맵 parry take에서 actualQParries=22, nearMagicFrames=94, inputPulses=3, errors=0. Q 해제 패링 포함이며 E로 blackBean 반사하지 않음 |
| 정상맵 테이크 | parry 10초, rage_slam 8초, fire 11초, ice_orb 8초, blackhole 10초. 개별 실제 FPS·파일 해시·발동근거는 FRESH_CAPTURE_MANIFEST_20261008.md 참조 |
| 블랙홀 의미 | lavaSummon은 5초 탄 흡수 후 범위 폭발 및 흡수 탄 수 2배를 360도 재방출. 적 끌어당김으로 홍보하지 않음. 실제 흡수/폭발 픽셀은 최종 영상 검수 대상 |
| 제외 원본 | ancestor는 요청 dispatch true만으로 실제 발동 보증 안 됨. 장비/도감 조건 미충족으로 최종 제외. 일반 데모 원본도 튜토리얼 경고·피격이 많아 최종 광고 제외, 로컬 보존 |
| 저장 안전 | 격리 origin3338·임시 slot·bootstrap save guard. 기존3333 서버와 사용자 일반 세이브 미변경 |
| Steam 비교 | 현재 GitHub 개발 런타임 촬영이며 공개 Steam Windows 바이너리 동일성은 미검증. staged label과 개발빌드 설명을 유지 |
