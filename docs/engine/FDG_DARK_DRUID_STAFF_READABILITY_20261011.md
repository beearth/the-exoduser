# 다크드루이드 지팡이 타격 가독성 — staff-readability-r2

2026-10-11. r1 저작 타격에서 준비한 지팡이가 다시 올라오는 인상을 고쳤다. 준비는 뒤·위, 타격은 앞·아래로 진행하며 몸통→흉곽→팔의 힘 전달, 짧은 잔여 하강과 회복을 기존 CPU LBS 장면에서 제작했다. 이 문서는 r2 현재 배송 계약이다. [r1 본체 인수 기록](FDG_DARK_DRUID_BODY_20261011.md)은 이전 시점의 수치와 실제 증거를 보존한 이력이다.

## 공개 사용과 보존 계약

| 항목 | 현재 값 / 적용 위치 |
|---|---|
| 진입 URL | `http://127.0.0.1:3333/tools/fdg-studio/index.html?authoring=dark-druid-body-r1&v=dark-druid-body-r1` |
| 사용 | `테스트 실행` → 동작 `준비 → 지팡이 타격 → 회복 · 단발` → 대기 자동 복귀. 초기 저작 장면은 `새 데모 장면`, 재생 정지와 `저장`은 기존 공개 버튼 |
| 프로젝트 / 리그 / resource / node | `dark-druid-normal-body-scene-r1` / `dark-druid-normal-body-r1` / `dark-druid-body` / `dark-druid-body-node` |
| 저장 키 | `fdg.studio.dark-druid.body.r1` |
| 캐시 | `studio.js?v=staff-readability-r2-crown`; Druid scene fixture `?v=staff-readability-r2-crown-fixture`; rig-scene-panel의 r1 토큰 유지 |
| 실제 장면 조건 | 위치 `[4150,7360,0]`, scale `80`; 카메라 `[4150,7216]`, yaw/pitch `0/0` |
| 기존 본체 | 19본 / 3289정점 / 4644삼각형 / 원래 UV / 1재질 / 2클립. skeleton·mesh(가중치 포함)·material·idle는 r1 백업 JSON과 exact |
| 접합 / 발 | staff는 leftHand의 T/R0 자식, 독립 staff track0. 장화는 root 자식; 115개 boot 정점의 새 동작17포즈 drift0, hand/staff skin·weld drift0 |
| 저작 범위 | `ENGINE_AUTHORING`, 보이는 원화 표면의 2.5D 본체. original PNG·RGB·UV·mesh·bone hierarchy·weights 쓰기0 |
| 시간 | attack `2.4s`, `24FPS`, nonloop. 준비 `0..0.9`, 타격 `0.9..1.25`, 회복 `1.25..2.4s` |
| 전환 / 종료 | 기존 entry `.25s`, `returnTo: dark-druid-idle / .35s`; 소유 장면 fixed `1/60s`, FX0, sequence unavailable |
| 대기 | `dark-druid-idle`: `2s`, `24FPS`, loop, 10트랙×9키 그대로 |

## 트랙과 가독성 수치

`buildDarkDruidStaffStrikeClip()`이 기존 attack만 생성한다. attack은 12트랙×10키다. `DRUID_STAFF_READABILITY`는 revision `r2`, authority `ENGINE_AUTHORING`, tipProbeSourcePx `[75,82]`, screenForward `+X`, screenDown `+Y`, driveTime `1.04`, overtravelTime `1.1`, settleTime `1.25`, geometryChanged `false`, weightsChanged `false`, staffIndependentTrack `false`, forceTransfer `spine-chest-arms`, headStaffSkinMatchedAtKeys `true`이다.

좌표는 `[(sourceX−221)/150, (526−sourceY)/150, authoredZ]`. 머리와 지팡이의 기존 skin 회전이 각 키에서 같도록 head Rz를 leftUpperArm+leftForearm+leftHand의 local Rz 합으로 맞췄다. head local 이동은 `Tnew = Told + transpose(neck.worldRotation) × (staff.skinTranslation − head.skinTranslation)`을 저작 키에 적용한 값이다. 키 사이 보간이나 body/neck 혼합 fringe 전체의 완전 rigid를 뜻하지 않는다.

| 본 / local Rz(rad) | 0 | 0.25 | 0.65 | 0.9 | 1.04 | 1.1 | 1.25 | 1.65 | 2 | 2.4 |
|---|---|---|---|---|---|---|---|---|---|---|
| `spine` | 0 | 0.003 | 0.006 | 0.008 | -0.012 | -0.015 | -0.012 | 0.005 | 0.002 | 0 |
| `chest` | 0 | 0.002 | 0.004 | 0.006 | -0.011 | -0.015 | -0.012 | 0.003 | 0.001 | 0 |
| `head` | 0 | 0.006 | 0.015 | 0.023 | -0.016 | -0.02 | -0.018 | 0.008 | 0.003 | 0 |
| `leftUpperArm` | 0 | 0.003 | 0.006 | 0.009 | -0.01 | -0.012 | -0.011 | 0.004 | 0.001 | 0 |
| `leftForearm` | 0 | 0.003 | 0.007 | 0.012 | -0.006 | -0.008 | -0.007 | 0.004 | 0.002 | 0 |
| `leftHand` | 0 | 0 | 0.002 | 0.002 | 0 | 0 | 0 | 0 | 0 | 0 |
| `rightUpperArm` | 0 | -0.008 | -0.016 | -0.02 | 0.026 | 0.035 | 0.022 | -0.006 | -0.002 | 0 |
| `rightForearm` | 0 | 0.005 | 0.012 | 0.015 | -0.016 | -0.022 | -0.012 | 0.004 | 0.001 | 0 |
| `coatLeft` | 0 | 0.002 | 0.004 | 0.005 | -0.008 | -0.014 | -0.023 | 0.009 | 0.002 | 0 |
| `coatRight` | 0 | -0.002 | -0.003 | -0.004 | 0.007 | 0.013 | 0.021 | -0.008 | -0.001 | 0 |
| `coatFront` | 0 | 0.001 | 0.002 | 0.003 | -0.004 | -0.007 | -0.012 | 0.004 | 0.001 | 0 |
| `coatBack` | 0 | 0.001 | 0.003 | 0.004 | -0.005 | -0.01 | -0.017 | 0.006 | 0.001 | 0 |

모든 Rx/Ry와 아래 표 밖 local translation은 각 키에서0이다. local Tz도0이다.

| 본 | time(s) | Tx(model) | Ty(model) | Tz(model) |
|---|---|---|---|---|
| `spine` | 0 | 0 | 0 | 0 |
| `spine` | 0.25 | -0.003 | 0.009 | 0 |
| `spine` | 0.65 | -0.012 | 0.033 | 0 |
| `spine` | 0.9 | -0.025 | 0.055 | 0 |
| `spine` | 1.04 | 0.115 | -0.165 | 0 |
| `spine` | 1.1 | 0.135 | -0.195 | 0 |
| `spine` | 1.25 | 0.13 | -0.22 | 0 |
| `spine` | 1.65 | 0.015 | -0.03 | 0 |
| `spine` | 2 | 0.003 | -0.008 | 0 |
| `spine` | 2.4 | 0 | 0 | 0 |
| `head` | 0 | 0 | 0 | 0 |
| `head` | 0.25 | -0.003931012304501683 | 0.0033068368825681753 | 0 |
| `head` | 0.65 | -0.01045937383213985 | 0.009172662735365178 | 0 |
| `head` | 0.9 | -0.016093273606415083 | 0.013721611362594194 | 0 |
| `head` | 1.04 | 0.023765315505426748 | -0.02046083160185281 | 0 |
| `head` | 1.1 | 0.03033496373345614 | -0.02872508624693237 | 0 |
| `head` | 1.25 | 0.02605139342656476 | -0.02959152209570428 | 0 |
| `head` | 1.65 | -0.0012462276567512887 | 0.002403251903470841 | 0 |
| `head` | 2 | -0.002116239752183652 | 0.001776520346043947 | 0 |
| `head` | 2.4 | 0 | 0 | 0 |
| `leftUpperArm` | 0 | 0 | 0 | 0 |
| `leftUpperArm` | 0.25 | 0 | 0 | 0 |
| `leftUpperArm` | 0.65 | 0 | 0 | 0 |
| `leftUpperArm` | 0.9 | 0 | 0 | 0 |
| `leftUpperArm` | 1.04 | 0.014 | -0.012 | 0 |
| `leftUpperArm` | 1.1 | 0.018 | -0.018 | 0 |
| `leftUpperArm` | 1.25 | 0.015 | -0.02 | 0 |
| `leftUpperArm` | 1.65 | 0.004 | -0.002 | 0 |
| `leftUpperArm` | 2 | 0 | 0 | 0 |
| `leftUpperArm` | 2.4 | 0 | 0 | 0 |

| time(s) | staff-head source-equivalent X(px) | Y(px, 아래+) |
|---|---|---|
| 0 | 75 | 82 |
| 0.733 | 68.85365403423486 | 78.67025535273564 |
| 0.9 | 66.54301388253896 | 77.21874976139787 |
| 1.04 | 99.03741974815254 | 104.18573968018922 |
| 1.1 | 103.94808931697101 | 108.38274919430683 |
| 1.15 | 103.21964217276434 | 110.04610731567641 |
| 1.25 | 101.76612237691475 | 113.37718200496482 |
| 1.45 | 88.79865705899738 | 100.87852025452725 |
| 1.65 | 75.8621529361503 | 88.50836855704307 |
| 2 | 74.67242995268117 | 83.82038812334741 |
| 2.4 | 75 | 82 |

준비0.9→peak1.1 이동은 `[+37.40507543443205,+31.163999432908952]` source-equivalent px이며 scale80의 정면 장면에서는 `[+19.949373565030424,+16.62079969755144]` px다. 준비 방향과 반대(dot `−465.3370833959674`)이며 peak→1.25는 추가 하강 `+4.994432810657997px` 뒤 회복한다. 1.65 잔여거리 `6.565224212440842px`, 2.4 bind offset0이다.

큰 팔 회전과 손 이동 후보는 외투·장식 공유 띠를 늘려 RETOUCH로 제외했다. x/y hard gate와 soft weight 후보도 새로운 seam을 만들어 적용하지 않았다. 승인 원화 alpha를 새 연결 문제 진단에1회 읽었고 쓰기0이었다. 생산 fixture 재생성은 r2의 r1 백업 JSON+새 clip helper만 사용하여 PNG 읽기0이다. 추측 weight 변경 대신 common spine 이동과 head 키 보상으로 기존 본체를 유지했다. r1 원화·전체5검사·재질·route·전체Git 감사는 재수행0이다.

## 실제 검수와 인수

증거 폴더 `E = /Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/fdg-dark-druid-first-slice-20261011/engine-dark-druid-staff-readability-r2/`.

| 검수 | 결과 / 실제 증거 |
|---|---|
| 정확한 공개 정지 포즈 | `prepare.png` `.733s`, `peak.png` `1.1s`, `recovery.png` `1.65s`; `phase-proof.json`의 실제 clip/time, transition null, FX[], 같은 정면 카메라·크기 |
| 정상 속도 공개 재생 | `public-playback.json`: idle0·transition null → 실제 Play → 공개 attack 선택·실제 attack 관측 → `.35s` 대기 복귀 → pause. 포즈 합성0, 모든 FX0 |
| 실제 GIF | `dark-druid-staff-readability-public-playback.gif`: 48 CDP JPEG / 960×540 / 4210ms / 8120063B / SHA256 `0664df8dc5809eb58816038bba5c331b7a2ec3d661959ef38ce40292fbf1fd81`; 실제 frame timestamp 간격. `gif-receipt.json`, `normal-playback-contact.png` |
| 실제 save / reopen | 공개 save1·own reload1·export2. attack1.1s·transition null, project·node·posed vertices·bone positions exact, 저장 키 동일, clock `5.966666666666651→0`, FX0·sequence unavailable. `save-reopen-receipt.json`, `save-before.json`, `save-after.json`, `save-reopened.png` |
| 실제 export pair | `export-before.fdg.json` / `export-after.fdg.json`: 각각 2771920B / SHA256 `d1a4217f8fc2530e9e0740efd9abf0de36be231672df19d51aa1e508a17d0efc`, byte exact와 full parsed JSON exact. export 재시도0 |
| 새 두 검사 | `test/fdgDarkDruidStaffReadability.test.mjs` 최초2/2 PASS, fail/cancel/skip0, 948.8295ms, 재실행0, 기존 suite0. `new-tests.json`, `first-tests-dark-druid-staff.log`, `targeted-dark-druid-staff-metrics.json` |
| 새 동작 수치 회귀 | 17포즈115boot drift0, hand/staff drift0; authored10key head/staff skin max오차 `2.220446049250313e−16`. peak tri177/351 6edge factor `0.9999999999999997..1.0000000000000306` |
| capture 경로의 새 단위 검사 | public setRigClip→capture→JSON setProject: attack.1s/entry elapsed.1, clip/transition/pose/bones exact; clock0/sequence unavailable/FX0. 나머지 attack138틱→idle return21틱(.35s), 복귀 시작 drift `2.220446049250313e−16` |
| 새 문법 | builder/studio 각1회 PASS, `new-syntax.json` |

중간 `strong-candidate-retouch/`, `candidate-c-retouch/`, `candidate-d-before-common-drive/`는 배송 검수에 사용하지 않는다. `capture-stopped-before-attack/`의9프레임은 관측 코드가 clip 선택 이전 idle snapshot을 복귀로 센 중간 실패다. 실제 attack 관측 후에만 return을 인정하도록 고쳤으며 최종48프레임 기록에서 전체 attack/return을 확인했다. recording harness 문제로 production fault0, 이전 suite 재실행0이다. 최초 native range 입력 `.001`은 형식상 거절되었고 `0.001`로 공개 input을 적용했다.

**VISUAL VERDICT: PASS — 현재 크기 정면 noFX 공개 재생에서 준비와 반대 방향의 전진/하강, 몸통·팔 힘 전달, 짧은 잔여 하강, 회복과 idle 복귀가 보이는 2.5D 저작 범위.** 원화 실루엣, 손·지팡이 접합, 외투 층, 장화 고정을 실제 포즈와 재생에서 확인했다.

**정확히1개 잔여: `SOURCE_GAP: 원화 없는 뒤쪽·겨드랑이·옷 속 정본 표면/텍스처 미확보`.** 이 범위의 자료와 전방위3D/native 본편 보스 적용은 후속 제작 상태다. 저작 clip 시간은 native combat 수치가 아니다.

실제 새 검사 명령:

```sh
FDG_DRUID_STAFF_TEST_EVIDENCE=/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/fdg-dark-druid-first-slice-20261011/engine-dark-druid-staff-readability-r2 /Users/fordeargamers/.local/node-runtime/node-v24.15.0-darwin-arm64/bin/node --test test/fdgDarkDruidStaffReadability.test.mjs
```

## 현재 배송

| 파일 | bytes | SHA256 |
|---|---|---|
| `tools/fdg-studio/fixtures/dark-druid-normal-body.fdg.json` | 809359 | `b394754856e1f349986f175fde1c547093ebe04d1e17f743a8905f4c59e83243` |
| `tools/fdg-studio/fixtures/dark-druid-normal-body.rig.json` | 703113 | `7fd0f72400035b65cf1c3a90f02a3755725548e5a2cb28be2a8cc727b3be3784` |

코드5파일(builder·studio·HTML·fixture2), 새 test1파일, 현재 계약18문서와 이 r2 정본1문서를 소유 변경으로 동기화한다. docs 전체 관련 키워드 rg 및 literal grep 로그·동기화 receipt는 E에 보존한다. 하나의 소유 정상 checkpoint에 코드와 docs를 함께 포함하며 기존 r1 인수 자료와 다른 작업의 WIP를 보존한다.
