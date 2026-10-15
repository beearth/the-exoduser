# 다크드루이드 NORMAL 본체 제작 — dark-druid-body-r1

> **2026-10-12 드루이드 source 현행:** 기본 대기는 `boss_dark_druid_8dir_v3.png`(1656×1240, 4×2 / 셀414×620)의 실제 방향 셀을 비율 보존·source-over1회로 표시한다. 구형 f0 r3/r5 리그는 `fdgDruidSource=legacy-f0` 명시 선택에서만 로드하며 r5는 기존 exact r4 QA active도 필요하다. 아래 f0 제작·PASS·URL 기록은 구형 기술 이력이고 신형 모델 인수가 아니다. 걷기·공격 기존4프레임은 아직 남아 있다. 10/9 검정 SW 후보는 영웅형 외형으로 사용자 거절되어 선택 대기 종료·연결·리깅 재개0. 승인 악마형 NORMAL 본체 자원 없음. [source 정본·API·실제 화면](FDG_CHARACTER_ASSETS.md#dark-druid-source-correction-20261012).

2026-10-11. 승인된 기존 보스 원화의 보이는 표면에 맞춘 메시·뼈대·가중치와 대기/지팡이 타격을 실제 FDG CPU LBS 장면에서 제작했다. 본편 보스 전투 적용 단계와 분리된 `ENGINE_AUTHORING` 산출물이다.

## 실행과 소비 경로

| 항목 | 확정 값 |
|---|---|
| 현재 진입 URL | `http://127.0.0.1:3333/tools/fdg-studio/index.html?authoring=dark-druid-body-r1&v=dark-druid-body-r1` |
| 프로젝트 / 리그 / 노드 | `dark-druid-normal-body-scene-r1` / `dark-druid-normal-body-r1` / `dark-druid-body-node` |
| 전용 저장 키 | `fdg.studio.dark-druid.body.r1` |
| 기본 경로 저장 키 | 기존 `fdg.studio.project.v1`; 새 전용 query에서만 분기 |
| 공개 preset | `dark-druid-body-r1` — 다크드루이드 NORMAL · 본체 제작 · FX 없음 |
| 공개 사용 순서 | 위 URL → `테스트 실행` → 동작 `준비 → 지팡이 타격 → 회복 · 단발` 선택 → 대기로 자동 복귀. 같은 실행 버튼으로 정지, `장면 1틱 · 60Hz`로 한 틱 진행, `저장`으로 전용 저장 |
| 현재 캐시 | `studio.js?v=dark-druid-body-r1`, `rig-scene-panel.js?v=dark-druid-body-r1`, `dark-druid-normal-body.fdg.json?v=dark-druid-body-r1-fixture` |
| 장면 조건 | 노드 `[4150,7360,0]`, scale `80`; 카메라 `[4150,7216]`, 정면 yaw/pitch `0/0` |
| 소비 계약 | 기존 XYZ CPU LBS·텍스처 Canvas·클립 전환·단발 종료 복귀 경로. 소유 장면 fixed `1/60s`; 새 FX·sequence 없음 |

저장본이 있으면 같은 전용 query에서 그 저작 상태를 복원한다. preset 선택 후 `새 데모 장면`으로 초기 원본 프로젝트를 열 수 있다. 별도 서버를 만들지 않고 기존 포트3333을 사용한다.

## 승인 원화와 제작 수치

| 항목 | 값 / 적용 위치 |
|---|---|
| 승인 원화 | `/Users/fordeargamers/Projects/exoduser-migration-20261001/assets/sprites/boss/boss_dark_druid_f0.png` |
| 런타임 원화 | `/assets/sprites/boss/boss_dark_druid_f0.png`; 엔진 체크아웃의 같은 파일 |
| 원화 크기 / 바이트 / SHA256 | `355×541 RGBA` / `479258B` / `74060fc68eb5f6dd76771272e973b2c5038e2939286c411cb2bc9a5bbcf0fa68` — 양 체크아웃 동일, 원화 쓰기0 |
| 제작 builder | `tools/fdg-studio/build-dark-druid-body.mjs`; 승인 원화 알파/UV와 전용 ROI·bone 좌표로 생성 |
| 전체 정점 / 삼각형 / 본 / 재질 / 클립 | `3289 / 4644 / 19 / 1 / 2` |
| 정면 원화 UV 메시 | `3276정점 / 4622삼각형`; 공유 인덱스와 경계 정합으로 part 접합 유지 |
| 알파 저작 기준 | alpha `≥32`, 해당 mask `127418px`; 원본 PNG/RGB 삭제0, 낮은 알파 halo/noise만 메시 영역에서 제외 |
| 메시 샘플링 | macro16px / mixed8px / thin4px / 경계 이분12회 / 원화 좌표 소수4자리 |
| 경계 정합 | 기존 삼각형131개 세분, 기존 경계점166개 삽입; 정합 허용차 `.00005px`, 새 UV 정점 추가0 |
| 작은 단면 | 기존 오른팔 실제 경계11구간, rear 정점13개, flat face22개; rear Z `−.055`, 같은 XY·UV·가중치; front `#28221f`, rear `#1b1715`, drawOrder4 |
| model 좌표 | `[(sourceX−221)/150, (526−sourceY)/150, authoredZ]` |
| 깊이 | body `0.11·exp(−((x−225)/65)²−((y−224)/95)²)+0.035·exp(−((x−134)/35)²−((y−226)/50)²)`; staff/leftHand Z `.035`, boots Z0 — 모두 저작 추정 |
| 손·지팡이 / 장화 | staff는 leftHand의 translation0·rotation0 자식, staff track0; 장화는 root 자식. 검수115개 boot 정점 drift0, hand/staff skin matrix·weld drift0 |
| 가중치 | 각 정점 최대3개, 합1; 원화 part 경계의 실제 vertex 공유, 지팡이·손·장화는 해당 본에1 |

큰 비대칭 가지뿔·깊은 해골·녹색 흉곽·무거운 다층 외투·왼손 지팡이와 뼈 장식·장화를 원화 UV로 보존한다. 타 보스 리그의 이름을 바꿔 복제한 구조가 아니다.

| 클립 id | 저작 재생 | 키·트랙 | 동작 / 종료 |
|---|---|---|---|
| `dark-druid-idle` | `2s`, `24FPS`, loop | 10트랙×9키, `[0,.25,.5,.75,1,1.25,1.5,1.75,2]s` | 몸통 호흡, 팔·지팡이·외투의 작은 무게 움직임; 2s 끝 bind offset0 |
| `dark-druid-staff-strike` | `2.4s`, `24FPS`, nonloop | 12트랙×9키, `[0,.25,.65,.9,1.1,1.25,1.65,2,2.4]s` | 준비0..0.9s → 타격0.9..1.25s → 회복1.25..2.4s; 2.4s 끝 bind offset0 |
| 공개 clip switch | entry `.25s` | 기존 전환 경로 | 60Hz15틱; 별도 순간 포즈 교체 없음 |
| `returnTo` | idle / `.35s` | 기존 단발 종료 경로 | 60Hz21틱 복귀, FX0 |

24FPS는 이 두 저작 클립의 값이다. 보이는 원화1장을 텍스처로 사용하며 새 24장 방향별 스프라이트를 만들었다는 의미는 아니다.

| 배포 파일 | 바이트 / SHA256 |
|---|---|
| `tools/fdg-studio/fixtures/dark-druid-normal-body.fdg.json` | `807893B` / `edc822f14c223e7841595273e5a829fc21907e91618c355a07b343f3f0baaaea` |
| `tools/fdg-studio/fixtures/dark-druid-normal-body.rig.json` | `701679B` / `51efdf004ec43d3f0a2554fbe0bf9acf7fa3c3cd5fb75f267f982671098a6ade` |

## 실제 검수 인수

증거 폴더 `E = /Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/fdg-dark-druid-first-slice-20261011/engine-dark-druid-body-r1/`.

| 검수 | 결과 / 실제 증거 |
|---|---|
| 정면 / 작은 각도 | `front.png`, `right22-pitch6.png`, `left-minus22-pitch6.png`; 실제 camera0/0 및 yaw±22°/pitch6°. 정면texture4622/flat0, 작은 각도texture4622/flat22. 원화 실루엣·접합·발 확인 |
| 실제 공개 재생 | `public-playback.json`; Play→idle→공개 clip 선택→prepare/strike/recovery→idle return→pause. 실제 노드 clip/time/transition/vertices 관측, FX[] |
| 실제 녹화 GIF | `dark-druid-body-public-playback.gif`, CDP JPEG40장/960×540/4290ms/7439434B; SHA256 `b2b8bdc0c84026d08eafdf894205b8b28e9caa3822b9266ee28db81904c51ca1`. 실제 timestamp 간격 사용, 합성 포즈 프레임0 |
| 공개 장면 step | `public-step.json`; 일시정지 상태에서1/60s 진행 |
| 저장 / 재열기 | 공개 save1·reload1·export2, `save-reopen-receipt.json`, `save-reopened.png`; project·mesh·UV·bone·weight·material·clips·returnTo·camera와 posed vertices/bonePositions exact. idle time `1.183333333333334s` 동일, ownerclock `4.466666666666656→0`, FX0, sequence unavailable |
| 실제 export pair | `export-before.fdg.json`, `export-after.fdg.json`; 각각2766448B, SHA256 `e7cc1a34c32963126dfd4be584faa6c1706d26d2693d17ffcf3a645c3ecb7034`, parsed full JSON exact |
| 새 검사 | `test/fdgDarkDruidBody.test.mjs`: geometry·LBS·idle/return·Canvas·capture/reload 총5범위 PASS. 첫3 PASS/2 harness FAIL 후 실패2만 수리·재실행 PASS; 성공3 재실행0, 이전 suite0, production fault0. −0 JSON canonical 비교/누락 ellipse stub만 수리, 최초 로그 보존 |
| 새 문법 확인 | builder/studio/panel3개 PASS, `new-syntax.json` |

입력값 표시만 바뀌고 camera가0인 초기 fill 관측은 `input-not-applied/`에 분리했으며 작은 각도 검수에 사용하지 않았다. 실제 native 입력 변경 후 camera 관측과 screenshot을 대응했다. IAB download event 대기는 timeout이었지만 공개 내보내기 완료 상태와 실제 다운로드2파일을 확인했다. 추가 export 재시도0이다. 이는 제작 데이터/저장 실패가 아니다.

**VISUAL VERDICT: PASS — 승인 원화의 보이는 본체, 정면·작은 각도와 noFX 실제 타격/복귀 저작 범위.** 완전한 전방위3D·본편 적용의 판정은 **RETOUCH**다.

**잔여 SOURCE_GAP: 정확히1개 — 원화에 없는 정식 뒤쪽·겨드랑이·옷 내부 표면/텍스처 자료.** 작은 깊이와22단면은 검수 가능한 저작 추정이며 그 자료를 대신하지 않는다. 현재 본편 보스 전투/native3D 적용은 미완료다. 이 보고서는 신규 FX/GPU/PBR/전투·충돌·맵·Q/E·본편 save를 변경하거나 전체 엔진 완성을 선언하지 않는다.

관련 현재 계약 문서18개를 같은 제작 수치/소스/클립/격리 저장/검수 상태로 동기화했다. 이 보고서까지 현재 기록19개다. 공개 기본 route·저장 키·Hell preset의 새 변경은 별도 읽기 검토 PASS이며 검토자의 추가 코드/테스트/브라우저 실행0이다. 기존 Hell r2..r8 완료 이력, 중단된 r9 준비 산출물, 확정 전투 문서와 마케팅·EA·트레일러 기록은 이번 저작 범위에 포함하지 않는다.
