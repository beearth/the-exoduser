# UNITY-FIELD-VERIFY-01 — Unity 1-1 조명·해자·펫 실제 통합 검수

> **IMPLEMENTED_UNVERIFIED / VISUAL VERDICT: RETOUCH.** 02에서 독립 바닥빛의 실제 ARM64 렌더·54tick·900프레임·HUD55/practice5를 인수했다. 첫 가산 과다를 원본 GPU normal alpha/linear로 교정하고 해당 시작장면만1회 재촬영했지만 r40=71.135259 대60.631586(+10.503673)가 남아 VERIFIED 아님. 성능8.640282/p95 9.303167/p99 11.413166ms는 합성 교정 전02 빌드의1회 측정이며 최종 합성 뒤 재측정0. worktree 보존. [Latest result](UNITY_START_PARITY_02_20261026.md).

> 2026-10-26 후속 시작 후보 [UNITY-START-PARITY-01](UNITY_START_PARITY_01_20261026.md): 이전 웹 중앙 겹침은 무개입 첫 진입이 아닌 통제된 뒤쪽 프레임. 새 후보는 Curtain 갱신/링 구출/생성 RNG·fade를 교정하며 아래 r20/성능/PNG를 새 결과로 전용하지 않는다. **IMPLEMENTED_UNVERIFIED — GPU 대기**. 원본 광원값 변경0.

상태: **RUNTIME_REVIEWED_RETOUCH**. **VISUAL VERDICT: RETOUCH**. 최종 원격 SHA·정리 영수증은 `~/exoduser-wt/_out/UNITY-FIELD-VERIFY-01/DONE.txt`와 본 문서 최종 표에 기록한다.

기준 tip `0250d967ea4965289f53d58679a0a25d756d691a`, 부모 계보 lighting8fb4072db → moat66d4fd860 → pet0250d967. 지정된 `UNITY-PET-01`만 사용하며 main·PC·기존 사용자 Player 배포는 하지 않는다. 원본 snapshot SHA256 `dee094fd165e9b2fb3fbf0eb9cacc3bc3eddeb2c8eeea9c4772ba6cbc1f05209`.

## 구현 교정과 검수 계약

| 경로 / id | 변경·수치·적용 위치 |
|---|---|
| NativeGame.WorldLighting.cs / QA_SCENE | 기존 명시적 `--unity-field-lighting-smoke -lightingMode after -lightingScene start 또는 altar -output 절대경로` 재사용. 선택 장면만 촬영·측정, 시작(4020,7420)/제단(5900,4060). 별도 진단 테스트 파일 없음 |
| QA_PETS | 기존 practiceScripted가 FixedUpdate 전체를 막아 펫까지 멈추던 검수 경로를 교정. 전투는 정지하고 source60Hz 누적 시간으로 TickPets·RenderPets만 진행. 장면 진입시 원본 생성상태로 reset(catPhase0). 자연 대사·포즈 캡처 외에는 임의 대사 강제 발화 없음 |
| QA_CAPTURE | 180 렌더프레임 준비 후 primary; 30 렌더프레임 후 animation; 자연 crow→cat 응답(300틱/5초, 제한660틱) 후 cat 대사. 기존 SkillCapture의0.15초 캡처 대기에는 cosmetic틱 정지. pose receipt의 crow/cat/xbow/iris 각 X,Y,T12값 보존 |
| QA_PERF | 별도 장면별900 프레임, cap120/vsync0, nearest-rank p95/p99. 02와 같은 고정 전투이나 펫60Hz 추가 및 대사 캡처 warmup 차이를 명시. 같은 성능 시험 추가 반복 없음. 필터 교정 후 시작은 `--lighting-capture-only`로900프레임 측정을 생략하고 해당 캡처만1회 보완하며, 최초 시작 성능의 빌드 경계를 명시 |
| NativePetView.cs / PET_FILTER | 새 import의 공용 SourceTextureImporter가 기존 meta Point0을 Bilinear1로 덮는 실제 결과 확인. 최초44PNG 로드시 world 몸/불꽃 Point, `/portrait`만 Bilinear를 명시. 프레임별 할당·Resources.Load 추가0. `SourceFiltering`은 crow/cat/idle/flame Point 및 두 초상 Bilinear를 실제 texture property로 관측하고 pose receipt에 기록한다. 크기24/불꽃36/halo150/광원250/등불470/alpha/원본 PNG 변경0 |
| NativeGame.cs | 이번 추가 hunk0. 기존 팻·해자·조명 hook 보존 |

초기 빌드: 새 `project`에 Assets/Packages/ProjectSettings/Tools만 복사, 전체 Assets 사전byte대조, Library복사0. Git MediaRecovery의 정본 world·warrior 동영상만 동일byte로 복원. 기존 PortVerification.Build가 ARM64 Release·Settings QA 고유 identity로 import/셰이더/빌드를 수행한다. 최초 빌드 성공 뒤 실제 importer 문제를 교정하므로 교정 빌드는 별도 이력으로 구분한다. 실패 빌드의 무수정 재실행은 없다.

## 실행 보호

시작에는 타 Unity Editor/QA Player가 없고 사용자38141/48476/52157만 존재했다. 최초 시작 측정 뒤 다른 QA Player90501(`UNITY-MAC-LOCALE-20261026`, frontend-review)이 등장하여 다음 GPU 작업을 중지하고 CPU 작업만 진행했다. 해당 프로세스를 종료·변경하지 않는다. 이어진 QA91013/91198도 보존하며 종료까지 대기했다. `gpu-gate.json`에 실제 대기·해제 이력을 기록했고, 이후 보완빌드/시작재촬영/제단/HUD/실습 각각 실행 전10초 연속 비점유를 확인했다. 일반 저장 경로를 쓰지 않는 Settings QA identity, 필드/HUD storage미초기화·practice 명시적 output roster를 사용한다.

## 실제 결과



| 항목 | 실제 결과·근거 |
|---|---|
| 입력 | Assets838파일 사전 SHA256 일치, Library복사0·fresh import. build-input.json/corrected.json. 생성scene와 importer가 고친meta는 격리project에만 남기고 원본 worktree로 역복사0 |
| 최초 빌드 | Unity6000.6.7f1 / StandaloneOSX ARM64 Release / Succeeded / errors0 / bytes2008849766. Field shader import PASS. build.json/log |
| 보완 빌드 | 실제 Point 필터 결함 교정 후1회, Succeeded / errors0 / bytes2008850278. build-corrected.json/log. 실패빌드0·무수정 재실행0. 최초1회+교정1회이며 단1회 빌드였다고 보고하지 않음 |
| 최종 앱 | `_out/UNITY-FIELD-VERIFY-01/build-corrected/EXODUSER-Unity.app`, product EXODUSER Settings QA, identifier com.fordeargamers.exoduser.settingsqa. 배포·사용자 실행창 교체0 |
| 시작 | (4020,7420), 첫 캡처 후 Point 수정에 따른 해당 장면 재촬영1회. sourcePetFiltering=true. `start-corrected/field-start-after.png` 및 natural cat/animation. **RETOUCH**: 웹과 적 배치·이리스 위치·중앙 밝기·전경 차이 |
| 제단 | (5900,4060), 최종 앱1회. 해자 전체 타원·서쪽 다리 끊김·올리브/초록 액체·내외측 둑·거품·언덕/props/actors/조명 층 실제 관찰. 북쪽·서쪽·남쪽crop에서 원본 구조 일치. **구조/색계열/층 순서 PASS**, 전체화면은 아래 차이로 **RETOUCH** |
| 펫4종 | crow/cat24px, xbow 원본12×5 vector, iris36px(기본sz20)와halo150/광원250 실제 렌더. start/altar 각각 primary와30렌더프레임 뒤 다른pose, 자연 crow→cat300틱/5초 응답 관찰. crow는 원본 미등록fly를 발명하지 않고8방향 정적+bob. 모든언어/Y토글/전체171event 실화면 인수 아님 |
| 대사 | KO 원문·초상 좌/우·줄바꿈·5초 응답 실제캡처. crow 원문의 마지막 음절이 다음줄로 나뉘는 현재 native font/행폭 차이, CSS blur/drop-shadow 미등가를 남김. 원본 초상720×480와alpha공식은 임의 축소/변경0 |
| HUD | --unity-hud-blend-smoke1회, exit0, passed=true,55checks/0failures,720p/1080p4PNG. 직접callback fixture이며 OS입력 검수 아님 |
| practice | --unity-first-practice-capture1회, exit0, passed=true,5checks/0failures,11kills. Player/Config/resources/RNG/clock/actors 원본복원 전부true. first2conditions만; 자연startup/전체레슨/badge 검수 아님 |
| 로그 | 두빌드 report오류0, Player의 exception/shader error 미관측. Editor licensing access-token refresh 경고와 AVFoundation primaries fallback/종료 thread-finalized 문구는 원로그 보존; 게임 오류0과 분리 |

## 1x 화면·확대와 방사 프로필

`captures/start_compare_1x.png`, `captures/altar_compare_1x.png`는 각 **3840×1080**, 왼쪽 Unity 최종 통합/오른쪽 기존02 웹1920×1080를 리샘플링 없이 나란히 결합했다. `manifest.json`에 source·규격·SHA·crop·배율을 기록했다. 실제 원본 화면과1x비교/각 확대crop을 열어 검수했다. player-pets4x, moat north/south2x 및 west bridge2x는 nearest로 확대하며1x와 명시적으로 구분한다. west bridge는 자연 cat응답 프레임으로 왼쪽 crow초상 가림을 피했으며 같은 정지 카메라/다른 애니위상임을 기록했다. Unity는 IMGUI HUD/초상을 포함하고 재사용 웹은 world canvas이므로 UI 픽셀은 동등 비교 대상이 아니다.

LIGHT03 방법: 중심(960,534), 반경0..600/20px, 각1440균등각, 양수좌표Math.round= floor(v+.5). 공통0≤x<1920,60≤y<840, 원밖각clip. encoded sRGB Rec709 Yprime=.2126R+.7152G+.0722B,0..255이며 물리 휘도나선형값이 아니다. actor mask없고 외측ring에는 초상/배경 차이가 포함될 수 있다. 반경0은 같은pixel1440번이다. CSV는 `radial-start.csv`, `radial-{start,altar}-integrated-web.csv`; 최초/수정캡처를 구분한다.

| r px | 시작 Unity | 시작 웹 | ΔU−W | 제단 Unity | 제단 웹 | ΔU−W | sample |
|---:|---:|---:|---:|---:|---:|---:|---:|
| 0 | 196.309 | 113.923 | 82.387 | 200.156 | 105.122 | 95.034 | 1440 |
| 20 | 43.921 | 83.947 | -40.025 | 56.278 | 43.582 | 12.695 | 1440 |
| 40 | 46.917 | 90.992 | -44.075 | 63.784 | 45.252 | 18.532 | 1440 |
| 60 | 45.786 | 69.667 | -23.881 | 55.514 | 37.329 | 18.184 | 1440 |
| 80 | 43.181 | 61.527 | -18.346 | 51.363 | 37.154 | 14.209 | 1440 |
| 100 | 42.837 | 55.898 | -13.061 | 47.174 | 35.333 | 11.841 | 1440 |
| 120 | 43.449 | 50.888 | -7.439 | 51.736 | 40.879 | 10.857 | 1440 |
| 140 | 41.747 | 45.533 | -3.786 | 48.573 | 39.677 | 8.896 | 1440 |
| 160 | 41.371 | 42.732 | -1.361 | 47.976 | 39.683 | 8.293 | 1440 |
| 180 | 41.540 | 40.567 | 0.973 | 48.896 | 40.667 | 8.229 | 1440 |
| 200 | 40.954 | 38.400 | 2.554 | 51.825 | 43.398 | 8.427 | 1440 |
| 220 | 40.150 | 36.767 | 3.383 | 52.515 | 43.878 | 8.637 | 1440 |
| 240 | 38.652 | 34.780 | 3.873 | 52.631 | 43.828 | 8.804 | 1440 |
| 260 | 38.537 | 34.421 | 4.116 | 44.929 | 37.723 | 7.206 | 1440 |
| 280 | 37.912 | 33.633 | 4.279 | 42.499 | 35.592 | 6.907 | 1440 |
| 300 | 37.480 | 33.305 | 4.174 | 42.608 | 35.274 | 7.334 | 1440 |
| 320 | 37.315 | 33.633 | 3.682 | 42.271 | 35.523 | 6.748 | 1301 |
| 340 | 36.596 | 32.975 | 3.622 | 38.108 | 31.904 | 6.204 | 1231 |
| 360 | 36.295 | 32.679 | 3.617 | 36.441 | 30.002 | 6.439 | 1185 |
| 380 | 35.414 | 32.354 | 3.060 | 34.676 | 29.069 | 5.608 | 1149 |
| 400 | 35.744 | 32.533 | 3.211 | 34.393 | 29.542 | 4.851 | 1119 |
| 420 | 35.349 | 32.163 | 3.186 | 35.060 | 29.998 | 5.062 | 1093 |
| 440 | 34.591 | 31.685 | 2.905 | 36.077 | 30.767 | 5.310 | 1071 |
| 460 | 34.512 | 31.328 | 3.184 | 38.762 | 32.620 | 6.142 | 1053 |
| 480 | 34.080 | 30.836 | 3.244 | 39.115 | 33.129 | 5.987 | 968 |
| 500 | 34.281 | 30.702 | 3.579 | 39.332 | 33.196 | 6.136 | 874 |
| 520 | 33.535 | 30.211 | 3.324 | 38.881 | 32.818 | 6.062 | 814 |
| 540 | 33.143 | 29.960 | 3.183 | 38.904 | 32.989 | 5.915 | 766 |
| 560 | 33.740 | 30.329 | 3.411 | 42.317 | 35.896 | 6.421 | 728 |
| 580 | 33.557 | 30.657 | 2.900 | 44.785 | 38.156 | 6.629 | 694 |
| 600 | 33.285 | 30.945 | 2.340 | 44.379 | 39.092 | 5.286 | 664 |

시작20px는 Unity43.921 / 웹83.947로 같지 않다. 실제 이리스는 native 적 타깃을 추적해 primary에서 world(3682.413,7784.495), 화면 약(622.413,901.404)에 있으며 왼쪽 HUD부근이다. 기존 웹은 적들이 플레이어에 겹친 통제프레임이고 이리스가 중앙에 있다. 따라서 이 차이를 플레이어 r470 결함이나 펫 빛 자체 부재로 단정하지 않는다. 제단에는 이리스가 플레이어 주변을 선회하며 따뜻한 색광/푸른 halo/불꽃이 실제 보인다. 등불470/기존 alpha·gradient·이리스250 등 원본 수치 위반은 발견하지 못해 밝기보정값을 새로 발명하지 않았다. **동일 actor/iris/렌더위상으로 통제한 새 웹 비교는 미실시이므로 플레이어 주변 밝기 동등성은 미인수**다.

## 성능

| 조건·실행 횟수 | 평균 ms | p95 ms | p99 ms | 평균 Δ vs02 |
|---|---:|---:|---:|---:|
| 조명02 기존 시작 reference | 8.361290 | 8.487210 | 8.902835 | — |
| 통합 시작 최초빌드1회 | 8.370909 | 8.553005 | 8.992624 | +0.009619 |
| 통합 제단 최종보완빌드1회 | 8.370717 | 8.495579 | 8.994756 | +0.009427 |

각180렌더프레임+pose/대사 준비 뒤900프레임, cap120/vsync0, user Player3개 보존 조건이다. 두측정 모두 Running/Focus900/900, lighting render900/cache300, targetRecreates0. 전투/적AI는정지하고 펫은60Hz, 원본02는 펫부재라부하가완전히같지않다. 시작은 Point교정 **이전** 빌드의 측정이며 최종Point빌드의 시작 성능으로 격상하지 않는다. 사용자의 장면별1회 원칙에 따라 시작재촬영은capture-only,900프레임 반복0. cap과공유GPU 때문에 순수GPU비용·성능향상·전투밀집부하 인증은아니다. raw managed delta0이나 Release ProfilerRecorder invalid이므로 전프레임/새뷰GC0 실측인증은 하지 않는다. production 새 코드의 per-frame 할당/리소스로드 추가0은 소스검토 근거다.

## 남은 차이·보호·Git

전체판정 **RETOUCH**. 재사용웹과 다른 적·이리스 상태의 중앙밝기, 하단/외곽의 기존 동적 생체/전경 차이, 원본 DOM 대비native 대사 font/음절줄바꿈/blur,171중107데이터전용 이벤트와 Y/설정UI/전체언어 실검수 미실시를 남긴다. 이107건은 이번에 새로 발생한 회귀가 아닌 기존이식범위다. 자연 보행/밀집전투/전체8camera/GC유효양성대조도 미실시. 기술PASS를 맵 전체시각PASS로 대체하지 않는다.

NativeGame.cs 추가hunk0, NativeLobby.cs/NativeLobbyVideo.cs/intro-silence fixture는 기준tip과 동일byte(`protection-audit.json`). 오디오/UNITY-MAC-20261024 WIP/실제사용자저장 변경0. 자기 Editor2개와Player5개(최초시작/수정시작/제단/HUD/practice)는 정상exit0. 새Chrome/node0, CUA는inventory조회만1회. 타 QA90501/91013/91198은 종료하지 않고자연종료까지대기. 사용자38141/48476/52157보존. 소스수정2경로+관련docs만명시stage,hook유지,main push/force/reset/rebase/-A0. remote expected0250d967을보존하고같은branch비강제push후직접SHA대조한다. PC동기화미확인. 완료후PET/MOAT clean확인과정상worktree제거는외부DONE영수증으로확정한다.

## MAP PRODUCTION REPORT (§23)

| 항목 | 결과 |
|---|---|
| STAGE | CH1-1, 기존LOCK과source snapshot 유지. 이번camera/tech검수,새맵제작0 |
| MASTER | silhouette/regions/main route/side spaces 재배치0. source geometry/남→북 진행 보존 |
| OUTER MASS | LEFT/RIGHT/TOP/SOUTH 재제작0. 원본과외곽/동적전경차이잔존,전체맵major holes전수검수아님 |
| LARGE | source assets 기존PNG동일byte유지,composites/overlap/repeated silhouette 신규수정0 |
| MEDIUM | 기존해자둑·서쪽다리접합실화면관찰,다른remaining holes전수검수미실시 |
| GROUND | 언덕shadow/초록액체contamination/내외측둑integration/조명층실동작.수치보상0 |
| PLAYABLE | main arenas/travel/breathing/threat 공간·충돌변경0. stationary플레이어읽힘/실습이동·공격PASS,swarm부하미실시 |
| LANDMARK | primary제단/secondary서쪽불/tertiary녹색10광원및이리스추가실제렌더 |
| CAMERA QA | START=RETOUCH; LANDMARK=구조PASS/전체RETOUCH; EARLY/ARENA/SIDE L/SIDE R/LATE/EXIT미실시 |
| TECH QA | route실플레이전수미실시;collision변경0/기존실습PASS;pageerror/404는브라우저신규실행0;seam전수미실시;loading/import/build오류0;성능위표 |
| FILES | stage-owned NativePetView/기존WorldLighting QA2; concurrent NativeGame0; unrelated0 |
| GIT | 자기지정경로commit/targetbranch비강제push; main/deploy0;최종SHA와clean제거는DONE |
| VISUAL VERDICT | **RETOUCH — VERIFIED 아님** |
| NEXT PASS | 동일actor/iris/phase의웹통제비교,전경/DOM대사포트차이,전체진행·밀집부하·유효GC검수는별도잔여 |
