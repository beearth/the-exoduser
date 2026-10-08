# 최신 정상 1장 맵 촬영 manifest — 2026-10-08

staged 감사 시각: **2026-10-08 11:08:44 KST / 02:08:44 UTC**. manual 최종 감사: **11:10:41 KST / 02:10:41 UTC**. 총괄이 CUA로 재촬영한 산출물의 JSON·파일 존재·바이트 수·SHA256을 읽기 전용으로 확인했다. 실제 스킬 이벤트가 확인된 다섯 staged take만 최종 광고 편집에 사용한다. 수동 일반 데모는 감사 기록과 원본을 로컬 보존하며 광고에서 제외한다. ancestor와 과거 stage=0 실험 맵 촬영도 제외한다. 이 문서 작성자의 JSON 감사가 영상 재생·프레임 육안·청취 검수와 최종 인코딩 검증까지 대신한다는 의미는 아니다.

## 위치와 출처

| 항목 | 확인값 |
|---|---|
| 실제 촬영 checkout | `/Users/fordeargamers/.codex/worktrees/marketing-gameplay-20261008/the-exoduser` |
| 산출물 디렉터리 | `/Users/fordeargamers/.codex/worktrees/marketing-gameplay-20261008/the-exoduser/output/indie-live-expo-20261201/current-20260928/` |
| 디렉터리 날짜 주의 | `current-20260928`은 저장 경로 이름이다. 이번 산출물은 2026-10-08 신규 촬영이며 폴더명으로 촬영 날짜를 판단하지 않는다 |
| JSON sourceGit | `2f5aa0e88e32ff2d82a93f9c6098643d8d1f6427` — 실제 checkout HEAD와 일치 |
| JSON gameSha256 | `bf38f6668d93cdc3bffa909250656d56675b734b27971a5103b3730edb3d1b3e` — 실제 checkout `game.html` 파일 SHA256과 일치 |
| staged source URL | `http://127.0.0.1:3338/game.html?test=1&slot=marketing_capture_1791424849962_i3hvht&testchar=1` |
| manual source URL | `http://127.0.0.1:3338/game.html?test=1&slot=marketing_capture_1791425316078_iwlx2y&demo=1` — testchar 동시 사용 없음 |
| 정상 맵 구별 | 위 URL에는 **stage=0 파라미터가 없다**. 총괄이 정상 1장 맵으로 재촬영한 세션이다. JSON 최초 bootAnchor `(4020,7420)`; 이후 take는 현재 플레이어 좌표를 유지하므로 최초 좌표와 다를 수 있음 |
| Steam 빌드 | 모든 JSON `steamBuildEquivalence='unverified'`. Steam 배포 데모 바이너리·전체 에셋과 동일성은 미확인 |

`sourceGit`는 촬영 UI 입력값이며 이것만으로 무수정 checkout이나 전체 에셋 일치를 증명하지 않는다. 감사 시점 `game.html`·`build-target.js`는 Git 변경 표시가 없었고, game 원문 SHA256은 일치했다. 캡처 브리지·모든 에셋·Steam 빌드 전체의 provenance는 별도다. 캡처 도구는 원문 game HTML에 저장격리/계측 코드를 메모리 삽입하므로 원문 해시와 계측 후 실행 HTML은 구분한다.

## 결과 목록

아래 실제초는 JSON `durationSeconds`, FPS는 `_drawBurst` 이후 실제 합성 프레임 시각으로 구한 `measuredRenderFps`다. 인코딩 컨테이너 FPS·중복프레임·최종 MP4 길이 검증은 별도이며, 60fps 요청을 60fps 달성으로 표기하지 않는다. 원본은 모두 1920×1080, VP9+Opus WebM이다.

| take / 파일 basename | 실제초 | recorder초 | 합성 프레임 | 측정 FPS | JSON 오류 | 실동작 증거 / 상태 |
|---|---:|---:|---:|---:|---:|---|
| parry / `staged_parry_1791424905846` | 10.0015 | 10.0025 | 563 | 56.3567 | 0 | 실제 Q 패링 **22회**, 접근 마법탄 프레임94·입력3회. `parryVerification.status=PASS`는 패링 이벤트 판정 |
| rage_slam / `staged_rage_slam_1791425003827` | 8.0007 | 8.0014 | 443 | 55.4997 | 0 | 3.8165초 `giantSlam`, slot4, `dispatch.ok=true`; 실제 숙련 로그2회 |
| fire / `staged_fire_1791425248227` | 11.0017 | 11.0027 | 652 | 59.2696 | 0 | 실제 `chainAssault` 숙련2회, chargeBoost6·chainSlash6·fireball6회. Shift/RMB 입력6회와 스킬 성공 횟수는 다름 |
| ice_orb / `staged_ice_orb_1791425276633` | 8.0009 | 8.0016 | 477 | 59.5730 | 0 | 1.5018초 `iceOrb`, slot0, `dispatch.ok=true`; 실제 숙련1회 |
| blackhole / `staged_blackhole_1791425306058` | 10.0005 | 10.0013 | 595 | 59.4541 | 0 | 1.0018초 `lavaSummon`, ult slot−1, `dispatch.ok=true`; 실제 숙련1회 |
| manual demo / `demo_manual_1791425349511` | 20.0008 | 20.0016 | 1,247 | 62.3524 | 0 | **LOCAL AUDIT ONLY / AD EXCLUDED** — 실제 Lv1·HP617→0·fallen 확인. 총괄 화면 검수의 튜토리얼 경고·피격 구도 품질 문제로 광고에서 제외 |
| ancestor | — | — | — | — | — | **EXCLUDED** — 이번 공개 편집 대상에서 제외. 현행 장비·도감 선행 조건이 있어 testchar 슬롯/명령 실행만으로 발동 성공을 확인할 수 없음. 이번 디렉터리에 신규 성공 산출물 없음 |

다섯 take 모두 실제 배경 `needleShot` 숙련 호출이 함께 있다. 각각의 대표 스킬만 존재하는 독립 플레이나 일반 데모 무편집 플레이로 설명하지 않는다. `dispatch.ok=true`·숙련 로그는 실제 런타임 발동 증거이며, 최종 장면의 가독성·완결성·스킬 효과 전체가 잘 보이는지는 영상 검수가 필요하다.

수동 데모의 62.3524는 합성 hook 호출 간격으로 계산한 측정값이다. `captureStream(60)` 요청이나 최종 인코딩 프레임 수를 초과 달성했다는 주장으로 사용하지 않는다. 원본별 컨테이너 타임스탬프·중복 프레임 검증은 별도다.

## staging·피해·오디오

다섯 take의 `staged=true`, showcase Lv500, `forcedBuildTarget='full'`, 시작 mhp/hp=100,000,000, 인위적 적 배치, MP/ST 100ms마다 보충을 JSON이 명시한다. 합체 해금 상태를 비우고 guardian/fireAura/holyDome를 끄는 촬영 메모리 조정도 포함된다. 이번 세션의 `randomGearCritAffixesRemoved=[]`이며, 새 장비를 조작하지 않았다는 포괄적 증명으로 확대하지 않는다. 일반 데모 난이도·성장 수치의 증거로 사용할 수 없다.

| take | 적 실제/요청 | 생성 Lv / 반경px | 종료 HP | 관찰 최소 HP | 실제 피해 숫자 draw calls | 실제 audio node start |
|---|---:|---|---:|---:|---:|---:|
| parry | 24/24 | 35 / 380 | 96,016,921.25 | 96,016,918.89 | 2,133 | 150 |
| rage_slam | 256/256 | 35 / 220 | 65,001,374.91 | 65,001,373.43 | 3,480 | 116 |
| fire | 128/128 | 75 / 420 | 90,501,510.80 | 90,501,508.87 | 2,097 | 222 |
| ice_orb | 72/72 | 35 / 400 | 91,500,557.93 | 91,500,557.84 | 6,078 | 129 |
| blackhole | 120/120 | 80 / 390 | 71,500,483.70 | 71,500,483.18 | 7,395 | 78 |

HP 로그에서 실제 감소와 피격 상태가 관찰된다. 촬영 시작 HP 증폭을 없었던 것으로 설명해서는 안 된다. 캡처 도구가 매 프레임 HP를 최대값으로 회복시키는 구형 expo recorder 방식은 이 JSON의 조작 계약에 없다. 스킬 자체 무적·재생은 게임 런타임대로 남으므로 모든 프레임 iframes=0 또는 HP 단조 감소를 주장하지 않는다.

모두 `damageNumbers.enabled=true`, AudioContext running/44,100Hz/오디오트랙1, `isolation.installedBeforeGameScripts=true`, localStorage prefix 저장격리, `isolation.errors=[]`, 차단 write 요청 목록은 비어 있었다. 실제 audio node 시작 수는 무음·클리핑·동기·정상 청취까지 증명하지 않는다. Canvas 6층만 캡처하며 HTML HUD는 포함하지 않는다. 새 에셋·생성형 대체 영상·촬영용 슬로모션을 이 결과에 사용한 것으로 기록하지 않는다.

## 일반 데모 수동 원본 — 로컬 감사 전용

| 항목 | 확인값 |
|---|---|
| 파일 | `demo_manual_1791425349511.json` / `.webm` — 위 산출물 디렉터리에 존재 |
| 실행 구분 | `mode='demo'`, `staged=false`, `forcedBuildTarget=null`, Lv1, spawn=null, plannedActions=[] |
| 조작 계약 | `combatValuesChanged=false`, `scriptedTake=false`, `spawnedEnemies=false`; UI 운영자의 실제 입력 버튼 사용은 별도 기록 |
| 실제 입력 | 0.2695초 W down, 0.5304초 LMB down. `operatorButtonInputs=true`이며 키보드 직접 입력만으로 촬영됐다고 설명하지 않음 |
| 실전 기록 | HP 샘플183개, 시작 HP/mhp617, 최저/종료 HP0, 종료 state=`fallen`, `dead=false`. HP0의 쓰러짐/사망 단계까지 촬영되었으며 완전 종료 dead 플래그와 구분 |
| 기존 무적 상태 | 시작 iframes514, 종료9956. 자연적인 시작/쓰러짐 상태의 런타임 값이 남으므로 전 구간 iframes0이라고 표현하지 않음 |
| 스킬 / 피해 / 오디오 | 실제 kiSlash 숙련4회, 피해 숫자 draw884회, 실제 audio node start111개; running/44,100Hz/트랙1 |
| 오류 / 격리 | JSON errors=[], isolation.errors=[], 저장격리 파싱 전 설치, forced build target 없음 |
| provenance | sourceGit·gameSha256은 위 staged 출처와 일치. source URL에는 stage=0 없음; Steam 배포 바이너리 동일성은 여전히 미확인 |
| 제외 결정 | 총괄 화면 검수: 튜토리얼 경고·피격/쓰러짐 구도 때문에 광고 품질 미달. 파일은 삭제하지 않고 로컬 감사 원본으로 보존 |
| 외부 백업 | GitHub raw 원본 백업 대상에서 제외. 공개 광고·Steam37초·Shorts16/26초에 넣지 않음 |

수동 데모는 인위적 HP 증폭·자원 보충·적 배치가 없는 실제 데모 경로의 감사 기록이다. 정상맵 staged 시연과 역할이 다르며, 이 파일이 광고 제외됐다는 결정이 staged 다섯 원본을 일반 데모 무편집 플레이로 바꾸지는 않는다.

## 파일 무결성

각 WebM은 존재하며 실제 파일 크기가 JSON `bytes`와 일치했다. 아래는 **감사 시점 읽은 파일의 SHA256**이다. 추후 파일 변경·재다운로드·트랜스코드가 있으면 새 파일을 별도로 기록한다.

| basename | WebM bytes | WebM SHA256 | JSON SHA256 |
|---|---:|---|---|
| `staged_parry_1791424905846` | 35,698,510 | `847e3be17fede10a9a4b76a861ea4a5d8815b447b6bcc1633a943e182d956a84` | `5fca70099a01b35215555f69b6feca3314628419e9b64ad91fd8ea8031381ecc` |
| `staged_rage_slam_1791425003827` | 25,858,528 | `3cb14ee05252d3e1fb9b7f0feabbe49ebe2a2e78f8664590ca43f862682b0f08` | `d5a8a54086026d25ad585b7acf8dc61f2a88945016cdff4e79b3dcf12ca2932b` |
| `staged_fire_1791425248227` | 38,631,830 | `c40f5fce3bc0027068b4151f62781f96630f9eda7929a402ced09292d3cf1a2e` | `fbba9abe8b1e54208b5c845913d927b963bdaea8f659701e6c9c4d7e4cd85672` |
| `staged_ice_orb_1791425276633` | 27,042,054 | `e4098250336cf27fe6661dd51293c6fb9b66c8d8dd8a2c7324c81b08f2621472` | `b0c72e68bffcf95cc06d1763900c4ddfb2b092a7166f5fe74b7d0ea4c584b4ec` |
| `staged_blackhole_1791425306058` | 32,753,367 | `5bfc0f093aa68e7c1aa83f5866eb26359622c04cd33a6c3c16a16122eeb4a552` | `0539a3f867aa0379384f582519c342c2a4de248aa25d026a3b921151d4777f95` |
| `demo_manual_1791425349511` — 로컬만 | 72,924,302 | `4f026e1a620ed75238de627c0aa1e6ee9ebbc92eaf8433d34f6db482952e9491` | `7a96774933e137fab8f6af0d65fd037df49c87574b8de6b852c3bc381b246b6c` |

## 최종 편집·외부 백업 범위

총괄 최종 지시 기준이며, 최종 MP4의 바이트·길이·해시·업로드 성공을 이 원본 manifest에서 미리 확정하지 않는다.

| 용도 | 범위 |
|---|---|
| Steam 트레일러 37초 | parry / rage_slam / fire / ice_orb / blackhole 다섯 staged 원본만 활용 |
| Shorts 16초 / 26초 | 동일한 다섯 staged 원본 범위에서 편집 |
| GitHub raw 원본 백업 | 위 다섯 staged WebM/JSON만 백업 대상으로 지정. 실제 업로드 완료·원격 SHA 검증은 총괄 별도 기록 |
| 로컬 감사 보존 | manual20초 JSON/WebM 유지; 공개 광고·GitHub raw 백업에서 제외 |
| 사용 제외 | ancestor, 과거 stage=0 실험 촬영, 일반 데모 manual 원본 |

## 인계·후속 조건

1. 정상 맵 source URL·원문 game hash·실제 이벤트가 모두 연결되는 위 다섯 staged take만 최종 광고 편집·GitHub raw 원본 백업에 사용한다. ancestor와 이전 stage=0 촬영 파일은 편입하지 않는다.
2. 일반 데모 manual은 `staged=false`, 전투값 변경·적 배치·자원 보호 없음과 실제 source URL·Lv1·HP0/쓰러짐·운영자 입력을 감사 완료했다. 광고 품질 미달로 로컬 보존하며 최종 광고와 GitHub raw 백업에서 제외한다.
3. 편집팀은 원본 길이와 실제 FPS를 기준으로 사용 가능한 구간을 선정하고, 재생·음성·스킬 시각 검수 후 승인한다. 1080p60 출력으로 트랜스코드해도 원본의 측정 FPS가 소급 상승하지 않는다.
4. 공개 설명에는 개발 런타임의 staged 스킬 시연이라는 사실과 Steam 데모와 차이가 있을 수 있음을 유지한다. Steam 배포 빌드와 동일하다고 표기하려면 별도 배포 provenance 증거가 필요하다.

이 작업은 신규 manifest만 작성했다. 게임 코드·촬영 도구·기존 문서·산출물·서버는 수정하지 않았고 게시·커밋하지 않았다. 관련 계약은 [촬영 스튜디오 문서](INGAME_CAPTURE_STUDIO_20261008.md)를 참고한다. 도구의 이전 stage=0 기본 설명보다 이번 실제 JSON source URL을 우선하여 정상 맵 재촬영 범위를 식별한다.
