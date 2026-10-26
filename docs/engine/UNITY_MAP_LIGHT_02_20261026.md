# UNITY-MAP-LIGHT-02 — 실제 빌드·화면·성능 검수

> 2026-10-26 후속통합검수 [UNITY-FIELD-VERIFY-01](UNITY_FIELD_VERIFY_01_20261026.md): 조명→해자→펫tip0250d967의실제빌드/화면/HUD·실습/성능완료,전체RETOUCH. 이문서의8.361290ms및펫/해자부재는02당시reference이며후속최종값과구분한다.


상태: **IMPLEMENTED_UNVERIFIED**. **VISUAL VERDICT: RETOUCH**.

후속 [UNITY-MOAT-01](UNITY_MOAT_01_20261026.md): 아래8fb4072db 빌드에서 결손이었던 언덕/해자/glow/bubble을 원본4PNG·동일충돌로 연결한 코드 후보. **IMPLEMENTED_UNVERIFIED — GPU 대기**, 새Unity빌드/화면/성능 미실시. 본문 캡처·ms·미이식 관측은02 당시 근거이며 새해자의 검수 증거로 전용하지 않는다.

사용자 2026-10-26 지시를 수행한 후속 검수다. 소스 시작 SHA는 `d3a4a9a3b7aac338d31199842e0edc326658df60`, 기준은 `776ebe77d05450343b1482cca945f184733fd30c`다. 전용 브랜치 `codex/unity-map-light-01-20261026`만 비강제 push하며 main/다른 Unity WIP에 통합하지 않는다. 최종 SHA/원격 대조/정상 worktree 제거 결과는 외부 `DONE.txt`가 정본이다.

## 실제 수행과 입력

| 항목 | 근거·결과 |
|---|---|
| 산출물 루트 | `~/exoduser-wt/_out/UNITY-MAP-LIGHT-02/` |
| Editor | `/Applications/Unity/Hub/Editor/6000.6.7f1/Unity.app` |
| 입력 | 기존 PortVerification.Build/MakeScene 및 HUD/practice fixture 재사용. 별도 `project`에 Assets/Packages/ProjectSettings/Tools 복사, 최초719개 Assets 파일 바이트 대조. Library 복사0, 새 import |
| 미디어 | Git MediaRecovery에서 world102204634bytes/warrior97796468bytes 동일 byte 복원. 오디오/로비/intro-silence 변경0 |
| 첫 빌드 | `build.json` / `build.log`, ARM64 Release, 오류0, bytes1971726198, `UNITY_FIELD_LIGHTING_SHADER_IMPORT_PASS` |
| 측정 경로 교정 빌드 | `build-focus-corrected.json/log`, ARM64 Release, 오류0, bytes1971726710. 첫 빌드 실패로 소급하지 않음. QA focus fence 누락을 고친 보완1회 |
| 격리 identity | `EXODUSER Settings QA` / `com.fordeargamers.exoduser.settingsqa`. 필드/HUD의 settingsDirectory/rosterDirectory는 빈 문자열, practice는 명시적 output/character-roster-v1 |
| 공용 NativeGame.cs | 이번 추가 diff0. 기존 InitializeWorldLighting/DisposeWorldLighting 두 hunk 이외 변경0 |
| 이번 코드 | 기존 NativeGame.WorldLighting.cs에 명시적 `--unity-field-lighting-smoke -lightingMode before/after -output <absolute>` 경로, NativeFieldLighting.cs에 기본OFF 계측 필드, PortVerification.cs에 필드 shader 지원/오류 게이트. 새 진단 테스트 파일0 |
| 정상 게임 | QA flag 없으면 coroutine/프레임 배열/할당 API 호출 없음. 기존 반지름·색·합성·주기·자원 로드 계약 불변 |

## 캡처와 실제 시각 판정

| 파일/장면 | 규격·순서·판정 |
|---|---|
| `captures/field_light_compare_1x.png` | 5760×1080, 각1920×1080를 무리샘플링으로 가로 결합. 왼쪽 Unity 조명 후 / 가운데 같은 앱 조명 component OFF / 오른쪽 웹 |
| `captures/altar_light_compare_1x.png` | 동일 규격·순서, 플레이어·카메라(5900,4060) |
| `captures/player_light_crop_1x.png` | 2880×780, 각 원본 rect(480,60,960,780)의1x crop. 실제 픽셀 확대 리샘플링 없음 |
| `captures/altar_light_crop_1x.png` | 2880×780, 각 원본 rect(480,90,960,780)의1x crop |
| 시작 좌표 | Unity/웹 플레이어·카메라(4020,7420), 웹 신규 Lv1 첫 필드. 전후 fixed simulation 정지, 시야/광원 동일 위치 |
| 웹 | GPU 창 Chrome156, viewport1920×1080/DPR1, headless0, 로컬 node server.cjs, 격리 포트/저장. snapshot SHA256 `dee094fd165e9b2fb3fbf0eb9cacc3bc3eddeb2c8eeea9c4772ba6cbc1f05209` |
| 웹 입력 교정 | 첫54개 JS 중29개가 현장 R/기준776과 달랐음(living-detail1·번역/현지화28). 격리 leaf symlink만 떼고 기준 blob byte로 교정, 최종54개 byte 일치. R/원 번역 목록과 CRLF 변경0. 초기 캡처는 initial-web-dependencies/에 보존, 교정본 캡처만1회 |
| 어둠·등불 | 조명OFF의 균일한 밝기에서 외곽 어둠/중앙 어둠홀로 변함. 원본 r470/alpha.86±.03, CENTER_GLOW=false 확인. UV 뒤집힘/분홍 shader 실패 없음. 웹에는 미이식 펫의 국소 따뜻한 색광원이 있어 중앙색 완전 동등 판정 불가 |
| 정적 색광원 | 제단 적색, 서쪽 황색, 도랑 위치 녹색10개 확인. 실제 웹 static12개 수치와 원본 JSON 일치. Unity는 도랑 원화/액체가 없어 바닥 위 녹색 얼룩처럼 보임. 색 수치를 임의로 증폭해 결손 환경을 가리지 않음 |
| 안개·환경광·비네트 | 월드 청색 환경층과 상하의 낮은 안개·외곽 감쇠는 렌더됨. 원본 .38 어둠/2D안개 pulse .28±.08/환경광 .06/비네트 .2/CSS1.05·.97 유지. Mac DOM fog gate 유지. 추가 환경·전경·펫과 프레임 위상 차이 때문에 전체 density/픽셀 동등성 미인수 |
| 화면 결론 | **RETOUCH**. 조명 구현의 동작은 실제 확인했지만 완성된 웹 조명맵과 같은 화면이라는 판정은 하지 않는다. 원본 값 위반이 확인된 조명 hunk는 없어 광원 수치 변경0. 미이식 도랑/환경·펫 구현은 이번 검수의 공용 파일 금지 경계 밖에 남음 |

웹 교정본은 새 Lv1 자연 진입 뒤 보호 효과를 기다리던 중 원본 전투에서 사망했다. 최종 비교는 격리 메모리에서 HP/MP/ST·idle·G.on·시작 카메라를 복원하고 사망 UI를 숨긴 통제 프레임이다. 첫 저장 PNG가 사망 UI fade를 담아, 해당 DOM display/transition을 고친 뒤 그 시작 캡처만1회 보완했다. **무개입 첫 진입/첫0tick 캡처 조건은 미충족**이며 VERIFIED를 주지 않는 추가 이유다. 이후 제단 이동은 같은 통제 프레임을 사용했다.

웹 카메라 정지/제단 이동은 격리 탭의 런타임 값만 조작했다. 원본 파일을 바꾸지 않았고 탭 종료로 폐기했다. 자연 OS 입력/전체 게임 진행 동등성 검수가 아니다. 관련 의존 스크립트 SHA는 web-dependencies.json, 이미지 SHA는 captures/manifest.json을 따른다. 전체 에셋 저장소의 pinned byte 동등성을 검증한 것은 아니다.

## 성능과 GC

기존 사용자 Player3개는 계속 보존한 조건이다. 자체 실행은 하나씩 직렬. 1920×1080·동일 시작 위치, 워밍업180프레임 뒤900프레임, cap120/vsync0. fixed simulation은 기존 practiceScripted로 멈추되 기존 pauseSmoke focus fence로 gameFocused와 Running을 유지했다. 렌더 clock은 진행한다. p95/p99는 정렬 후 nearest-rank다.

| 조건 | 평균 ms | p95 ms | p99 ms | Running/Focus | 조명 render/cache |
|---|---:|---:|---:|---|---|
| 전(component OFF) | 8.389746 | 8.672584 | 8.990250 | 각각900/900 | 0/0 |
| 후(component ON) | 8.361290 | 8.487210 | 8.902835 | 각각900/900 | 900/300 |

`performance-summary.json`과 `*-focus-corrected/performance-*.json`이 근거다. 120fps 제한과 사용자 Player 공존 조건으로, -0.028456ms를 성능 향상/순수 GPU 비용으로 해석하지 않는다. 별도 GPU ms·전투 밀집·resize 성능은 측정하지 않았다.

**매 프레임 GC 할당0은 확인하지 못했다.** Release의 `GC Allocated In Frame` recorder는 두 실행 모두 유효 표본이 없었다(`profilerGcValid=false`). `GC.GetAllocatedBytesForCurrentThread` raw delta는 모두0이지만 양성 할당 대조가 없으므로 유효한 zero-allocation 증거로 인정하지 않는다. 조명 Update/Render raw0도 같은 한계다. Resource.Load/배열 생성이 없는 조명 hot path는 정적 확인했고 실제 안정 구간 target 재생성0은 확인했으나, 이를 GC 실측으로 바꾸지 않는다.

[Unity profiler counter 공식 표](https://docs.unity.com/en-us/engine/6000.0/manual/analysis/profiler/counters-reference)는 Release의 해당 GC counter를 Unavailable로 명시한다. [Unity UUM-100690](https://issuetracker.unity.com/issues/5660/crash-on-runtimefieldinforesolvetype-with-il2cpp-and-returns-0-with-mono-when-calling-gcgetallocatedbytesforcurrentthread-method)은 과거 Mono의0 반환 사례다. 이 과거 Windows 사례만으로 현재 Mac6000.6의 구현 결함을 확정하지 않고, 이번 측정에 positive control이 없다는 한계를 적용했다. 세 번째 GC/성능 실행이나 추가 Development 빌드로 재시도하지 않았다.

## 실패·교정·회귀 범위

| 항목 | 이력·최종 |
|---|---|
| 첫 frame 표본 | before/after는 포커스/Running 보장이 없어 배제·보존. 실행 경로에 기존 focus fence와900프레임 상태·render/cache 계측을 추가한 뒤 그 측정만1회 보완. 첫 표본과 합산0 |
| GC | 위 raw0/invalid recorder, 인증 실패. 추가 같은 측정0 |
| import 후 전체 입력동일성 검사 | 첫 불일치: MakeScene 생성 FirstPlayable.unity. 생성scene 예외를 기록하도록 검사 코드를 고친1회 보완에서도 ui_globe_mp.png.meta importer 차이. 같은 검사2회 불일치로 중단, 전체 mirror PASS 주장0. 초기 pre-import719파일 일치와 build 성공은 별도 근거 |
| PNG 결합 | 최초 Pillow 미설치로 출력 실패, 격리 image-tools venv에 Pillow11.3 설치 후 결합 성공. 실제 캡처 재실행 아님 |
| HUD | 기존 `--unity-hud-blend-smoke`1회, exit0, passed=true,55 checks/0 failures. KO720/1080 idle·charge 캡처4개. OS 입력/전체 픽셀 일치 검사가 아님 |
| practice | 기존 `--unity-first-practice-capture`1회, exit0, passed=true,5 checks/0 failures,11 kills. original Player/Config/resources/RNG/clock/actors 복원true, reward 누수0. 첫2조건만, badge/자연 startup/OS 입력은 범위 밖 |
| 로그 | Player error/exception/shader error 미관측. 종료 thread-finalized 문구와 AVFoundation primaries fallback 경고는 원 로그 보존 |
| 최종 소스 차이 | 빌드 이후 GC 한계를 설명하는 주석2줄 추가. IL 행동 변경0, 그 주석만으로 재빌드/성공 회귀 재실행0. importer가 생성한 QA project meta를 제품 worktree에 역복사0 |

## 보호·Git 경계

원격 시작 expected ref는 d3a4a9a3b7aac338d31199842e0edc326658df60, fetch 당시 main은 fab7a167c30c6421bda8cf6d4c2ee2e7753e87f3였다. tracked INDEX/WORK를 분리 확인하고 자기 경로만 stage한다. hook `.githooks` 유지, -A/main push/force/reset/rebase0. 최종 push ref SHA를 직접 대조한 뒤 전용 worktree를 force 없이 제거한다. PC 접근/실행/동기화 미확인.

NativeLobby.cs·NativeLobbyVideo.cs·오디오·intro-silence·UNITY-MAC-20261024 WIP 수정/병합0, 일반 저장 IO0. 사용자 PID38141/48476/52157 종료0. 자기 Player6개(최초전후2·교정전후2·HUD1·practice1)는 각 정상 exit0. 자기 node만 종료하고 생성 Chrome 탭만 닫았다. 사용자 Chrome/다른 프로세스 종료0. 원본 번역 목록 변경0.

## MAP PRODUCTION REPORT (§23)

| 항목 | 상태 |
|---|---|
| STAGE/MASTER | CH1-1, 기존 silhouette/regions/main route/side spaces 보존. common guide 전체 읽음; 이번 camera/tech gate 한정 |
| OUTER MASS | LEFT/RIGHT/TOP/SOUTH·major holes 재배치0. 웹/Unity의 기존 전경 차이 잔존 |
| LARGE | 기존 source assets/composites/overlap/repeated silhouette 재제작0 |
| MEDIUM | connections·remaining holes 변경0 |
| GROUND | 원본 shadow/색층/2D fog/환경광/grade 동작 확인. 도랑 바닥/환경 미이식으로 integration RETOUCH |
| PLAYABLE | main arena/travel/breathing/threat 공간과 collision 보존. 시작 player readable, 밀집 combat QA 미실시 |
| LANDMARK | primary 제단/secondary 황색 불/tertiary 녹색10광원 좌표 보존, 원본12개 확인 |
| CAMERA QA | START·LANDMARK 실제1x 비교. EARLY/ARENA/SIDE L/SIDE R/LATE/EXIT 미실시 |
| TECH QA | shader/import/build 오류0; HUD55/practice5 PASS. route/collision는 변경0/전용회귀0, pageerror/404 전체clean 주장0, seam전수0, GC 미인증, frame time 위 표 |
| FILES | stage-owned 기존 lighting2·Editor1, 관련 docs5. concurrent NativeGame.cs 추가0, unrelated0 |
| GIT | 자기 경로 commit/push, SHA 외부DONE, main/deploy0, 정상worktree 제거 결과 외부DONE |
| VISUAL VERDICT | **RETOUCH — IMPLEMENTED_UNVERIFIED** |
| NEXT PASS | 별도 범위로 미이식 도랑/환경·펫 이식 및 유효한 GC 계측이 필요. 이번 같은 테스트 추가 실행0 |
