# CH1-1 source27 Mac 후보 — 드루이드 공격 상태 초기화 포함

같은 source27 원문을 가진 별도 Mac 앱을 만들고 파일 내용을 검수했다. **실제 앱 기동과 CH1 플레이 인수는 아직 미실시**다. 현재 Mac 잠금 해제 질문이 pending이며, 기존 사용자 게임·세이브를 건드리지 않았다.

| 항목 | 정확 값 |
|---|---|
| source code | `3c7dc6ab1cb0bc68cc3b969e27d06204fbe0f97f` |
| job / port | `953a5489-91eb-4d43-9c18-f05454ad27a7` / `3402` |
| app | `/Users/fordeargamers/Projects/exoduser-migration-20261001/outputs/mac-package-ready/mac-packager-953a5489-91eb-4d43-9c18-f05454ad27a7/package/EXODUSER-953a5489-91eb-4d43-9c18-f05454ad27a7.app` |
| bundle | `com.exoduser.mac.953a5489-91eb-4d43-9c18-f05454ad27a7` |
| profile | `/Users/fordeargamers/Projects/exoduser-migration-20261001/outputs/mac-package-ready/mac-packager-953a5489-91eb-4d43-9c18-f05454ad27a7/user-state/profile` |
| saveRoot | `/Users/fordeargamers/Projects/exoduser-migration-20261001/outputs/mac-package-ready/mac-packager-953a5489-91eb-4d43-9c18-f05454ad27a7/user-state/saves` |
| entry | `http://127.0.0.1:3402/index.html?demo=1` |
| runtime | NW.js0.111.2 arm64 / Chromium148.0.7778.97 / embedded Node26.0.0 |
| prepare / execute / verify | old7918 selector/runtime340 재사용, main/Easy2 hash만 갱신. 새job execute1/새payload physical1. 기존 소스검사 재실행0·oldpayload 재해시0 |

## 원문 핀

| 파일 | bytes | SHA256 |
|---|---|---|
| `game.html` | 4034850 | `d91c1d9489749fc6cbe410293fa2288d487a7c9c7bb28567233a0af92c6ffc2a` |
| `game-easy-test.html` | 3912519 | `1360a1c0185f549f34f204f946b5c808529ffde86e919214f92aa679960865d6` |
| `index.html` | 342119 | `1dd28cab162a4384ad84a356eb2c719940782005d20da1312d2857bc649615a7` |

## 포장과 검수

| 검증 | 실제 범위 |
|---|---|
| payload | stage/app 각각7916 파일 전체SHA가 config와 일치. coverage7918/7918, 파생bootstrap2 제외. 복사당6645491317B |
| bootstrap | 원본 node-main/package 불변. 파생PORT3333→3402/own saveRoot, entry/node-remote/profile 및 app product_string만 변경. 서버 전체 역치환 exact, package 객체/바이트 exact |
| runtime | main/helper4 실행파일SHA와 runtime pin 동일, Mach-O arm64/실행권한/plist ID·실행파일명 일치 |
| source27 수정 | 일반 initStage 패턴 정리에 `_druidOrbs=[]`와 `_druidOrbT/_druidParryT/_druidParryVolley=0` 양판각70B. 기존 아레나/복귀 정리와 동일. source26 역치환 전체 exact |
| 실제 source 근거 | 신규16원본4PASS12FAIL→후보18PASS→생산18+field50+deathAudio36=104PASS. 전체initStage/ORB block 원문 실행, 맵/적생성·render/audio대역. 자연누출/native/전체맵/청취 검수 아님 |
| 기동 미실시 | 앱 실행0·HTTP0·GUI입력0. ownprofile/ownsave 존재0을 physical시점 확인. 이 파일 검수를 타이틀/정상기동/저장 성공으로 계산하지 않음 |
| 다음 같은후보 목표 | 정상 CH1 시작→전투·획득·장착→4지역/보스방 개방→보스 사망·부활→재도전의 맵/몬스터 진행 보존, 저장재로드·청취·시각 |

기존 source26 Mac 숲1 진입·일반 사망retry·inventory와 source17 과거 플레이는 별도 후보의 이력이다. source27의 완료 근거로 합산하지 않는다. 기존 MAP-020 VISUAL RETOUCH 유지. 보스 사망 대기 중 공격 수명 정책·HP50%/180f·si3·Q/E·snapshot46key/저장 불변. 상세 정본은 `docs/8.1보스디자인바이블/DRUID_STAGE_TRANSIENT_LIFETIME_20261003.md`다.

## 이전 실행본 보존

| source | port | 확인 범위 |
|---|---|---|
| source11 | 3390 | 존재/Info.plist ID·profile/save metadata. 전체hash/내용읽기·입력0 |
| source15 | 3391 | 존재/Info.plist ID·profile/save metadata. 전체hash/내용읽기·입력0 |
| source16 | 3392 | 존재/Info.plist ID·profile/save metadata. 전체hash/내용읽기·입력0 |
| source17 | 3393 | 존재/Info.plist ID·profile/save metadata. 전체hash/내용읽기·입력0 |
| source19 | 3394 | 존재/Info.plist ID·profile/save metadata. 전체hash/내용읽기·입력0 |
| source20 | 3395 | 존재/Info.plist ID·profile/save metadata. 전체hash/내용읽기·입력0 |
| source21 | 3396 | 존재/Info.plist ID·profile/save metadata. 전체hash/내용읽기·입력0 |
| source22 | 3397 | 존재/Info.plist ID·profile/save metadata. 전체hash/내용읽기·입력0 |
| source23 | 3398 | 존재/Info.plist ID·profile/save metadata. 전체hash/내용읽기·입력0 |
| source24 | 3399 | 존재/Info.plist ID·profile/save metadata. 전체hash/내용읽기·입력0 |
| source25 | 3400 | 존재/Info.plist ID·profile/save metadata. 전체hash/내용읽기·입력0 |
| source26 | 3401 | 존재/Info.plist ID·profile/save metadata. 전체hash/내용읽기·입력0 |

원사용자앱59376baf/08cac1ce 정확경로UNKNOWN. 추측제어0. 기존67WIP/manager4/사용자23변경·oldgame/save 보존. 새팀/새채팅·삭제/cleanup·권한/인증/설치/결제/게시0.

## 증거 영수증

| 파일 | bytes | SHA256 |
|---|---|---|
| `/Users/fordeargamers/Projects/exoduser-migration-20261001/tmp/mac-migration-runtime/continued-review-20261003/ch1-source27-build/preflight.json` | 5025 | `9478badaff33702e1882ccc3a8b32081744c34b8fd57e9d3f40c3c26363f5b76` |
| `/Users/fordeargamers/Projects/exoduser-migration-20261001/tmp/mac-migration-runtime/continued-review-20261003/ch1-source27-build/execute-result.json` | 1240 | `308cb1b22855bfd5bf60cd9af74744e351a5b8086b28212b37ad67f8d7f19e23` |
| `/Users/fordeargamers/Projects/exoduser-migration-20261001/tmp/mac-migration-runtime/continued-review-20261003/ch1-source27-build/physical-receipt.json` | 31761 | `94bcf7fe6ba1af2b39476511bc691b06b54c920ac636c8216f053ea638da385e` |

root 관련문서19 exactscope checkpoint/원격 정확SHA는 이 증거 루트의 후속 `checkpoint-receipt.json`을 따른다. 소스104PASS·후보보고·포장을 완제품 건수로 합산하지 않는다.


## 2026-10-03 source28 Mac 파일 후보 / source27 실제 플레이 후속

이 절은 이전 포장·잠금 대기 이후의 상태다. 이전 날짜별 기록은 당시 이력으로 보존한다.

| 항목 | 확인한 상태와 남은 검수 |
|---|---|
| 최신 파일 후보 | source28 / job `2242869e-903a-4917-a38c-e0f6c02ff47c` / port3403 / 입력 커밋 `f376e3ce9c3524fa7874078c6738e1e5ab8a1e5b` / **PACKAGED_NOT_RUNTIME_ACCEPTED** |
| 포함 코드 | field 복귀의 `P.poison=0;P._rbPoison=[];P._rbBurn=[];` 양판 각44B 및 이전 initStage 드루이드 초기화. 생산89PASS는 경계 대역 포함 코드 검수 이력이며 실제 앱 완주 증거가 아님 |
| 실제 파일 검수 | frozen7918 입력 중 bootstrap2 파생. stage/app payload7916 각각 전체SHA 일치, source3 exact, bootstrap2 전체 역치환 exact, arm64 실행파일5와 plist ID 확인. 재빌드·검사 반복0 |
| source28 실제 플레이 | launch0/native입력0. 물리 검수 시 새 profile/saveRoot 미생성. 전투·보스 사망/부활·열린 문/몬스터 보존·실저장·청취·카메라 인수 미완료 |
| source27 실제 장착/일반retry | 정상 전사 시작→연습 건너뛰기→CH1 첫 필드. 장착4건 후 CP1857. 일반 사망→다시 일어서라로 HP549/549 MP376/376 SP279/279 및 장비 유지 확인 |
| source27 마지막 관찰 | 첫 처치1/32, EXP2/15, 악의997, 시간55초, HP0. Controls 설정 화면에서 대기. 앞선 완충 관찰을 현재 생존으로 계산하지 않음. 아이템 줍기·4지역·보스 해금/사망 미인수 |
| 보존 | source27 포함 기존13 검수앱 존재/Info.plist ID 확인. 기존 profile/save 내용 변경0. 원사용자 앱 정확 위치 UNKNOWN; 전체 원본hash 보존 검증으로 확대0 |
| 물리 영수증 | `tmp/mac-migration-runtime/continued-review-20261003/ch1-source28-build/physical-receipt.json` 32859B / SHA256 `2b677de448db516036e2d32069f5b326e5aec535104f7db0072c57b5d21e5bda` |

파생 port3403·격리 user-state는 원본 서버3333·저장 schema 변경이 아니다. source27 부분 플레이를 source28 제품 인수로 합산하지 않는다. 상세 successor 경로·SHA·장착 표는 `docs/13출시·마케팅/MAC_CH1_SOURCE27_CANDIDATE_20261003.md`의 후속 기록을 따른다.

### source28 successor 경로와 입력 SHA

| 파일 / 위치 | 값 |
|---|---|
| 새 앱 | `/Users/fordeargamers/Projects/exoduser-migration-20261001/outputs/mac-package-ready/mac-packager-2242869e-903a-4917-a38c-e0f6c02ff47c/package/EXODUSER-2242869e-903a-4917-a38c-e0f6c02ff47c.app` |
| Bundle ID | `com.exoduser.mac.2242869e-903a-4917-a38c-e0f6c02ff47c` |
| `game.html` / source·stage·app | 4034894B / `e3d1e4f3cd5f5e27ec841ea3fcfdf01126a40c0f80f434053289faf8ea07d00c` |
| `game-easy-test.html` / source·stage·app | 3912563B / `ff35d58070dc4b55f9b530c9f302212711296db04ad10b45ac83ab7ef8fae9bf` |
| `index.html` / source·stage·app | 342119B / `1dd28cab162a4384ad84a356eb2c719940782005d20da1312d2857bc649615a7` |
| 새 profile | `/Users/fordeargamers/Projects/exoduser-migration-20261001/outputs/mac-package-ready/mac-packager-2242869e-903a-4917-a38c-e0f6c02ff47c/user-state/profile` / 포장 검수 시 미생성 |
| 새 saveRoot | `/Users/fordeargamers/Projects/exoduser-migration-20261001/outputs/mac-package-ready/mac-packager-2242869e-903a-4917-a38c-e0f6c02ff47c/user-state/saves` / 포장 검수 시 미생성 |

### source27 정상 장착과 전투 (source28과 별도)

| 장착 / 입력 | 관찰 |
|---|---|
| 불꽃 석궁 | CP1682→1691. ATK4/DPS7.8 vs 기존10/19.4. CP 증가를 피해 증가로 계산하지 않음 |
| 녹슨 도끼 | CP1691→1768. ATK41/DPS35.8 vs 기존6/5.2 |
| 불꽃 갑옷 | CP1768→1760. 정상 장착; 개별 어픽스의 실제 기여량 미확정 |
| 그림자 머리띠 | CP1760→1857. 정상 장착. 나무견갑은 비교만 하고 미장착 |
| 일반 retry | HP549/549 MP376/376 SP279/279 CP1857. 장비 유지. 보스 사망 경로 아님 |
| 최신 전투 이미지 | `tmp/mac-migration-runtime/continued-review-20261003/source27-native-play/05-general-retry-hud.jpg`. 파일명은 이력이며 실제 내용은 첫 처치1/32 뒤 HP0/55초 fallen 화면 |
| 미완 | 아이템 획득·4지역·보스문·보스 사망/부활/재입장·몬스터 보존·저장 재실행·청취·완주. source28은 아직 미기동 |

### source28 MAP PRODUCTION REPORT

| 항목 | 현재 판정 |
|---|---|
| STAGE / MASTER PLAN | CH1-1 열린 보스문·필드 몬스터 진행 보존의 같은 후보 실제 검수 목표 유지 |
| LARGE OUTER MASS / MEDIUM CONNECTION / GROUND CONNECTION | 지형·통로·충돌·좌표 변경0 |
| PLAYABLE/COMBAT | source27 첫 처치/일반retry 부분 관찰. source28 실제 플레이 미실시 |
| LANDMARK/CENTER / SMALL DETAIL | 기존 에셋 유지, 새 생성/배치0 |
| CAMERA QA | source28 실제 카메라 검수 미실시 |
| TECH QA | 파일 SHA 일치. 생산89PASS는 경계 대역 포함 소스 실행이며 native 인수 아님 |
| VISUAL VERDICT | RETOUCH — 같은 source28 실제 보스 사망/부활/재입장 미인수 |


## 2026-10-03 source29 Mac — 최신 파일 후보, native 입력 대기

이 절은 이전 source28 포장 기록 이후의 현재 파일 인계다. 최신 앱 후보는 **source29 / PACKAGED_NOT_RUNTIME_ACCEPTED**이며, 이전 후보의 실제 플레이를 새 후보의 인수로 합산하지 않는다.

| 항목 | 이번 실제 근거와 남은 검수 |
|---|---|
| 입력 / job / port | `3948b102db4c353822e6a706067224f72df36c48` / `e771c364-291e-4c7a-b983-1a7496d505aa` / 3404 |
| 포함 수정 | 스킬 미니바 칼등·마법 키를 현재 BINDS.shield/beam에서 읽음, 기본 마법3종 KO/EN의 구 E 설명 교정. 본편/Easy 각+76B. 기존 source28 DOT 초기화·source27 드루이드 초기화 포함 |
| 실제 파일 검수 | frozen7918 입력/runtime340 재사용, 새 job execute1회. stage/app payload7916 각각 전체SHA 일치, source3 exact, bootstrap2 전체 역치환 exact. arm64 실행파일5·plist 확인. 이번 소스 검증/포장을 native PASS로 승격하지 않음 |
| 물리 영수증 | `tmp/mac-migration-runtime/continued-review-20261003/ch1-source29-build/physical-receipt.json` 33957B / SHA256 `0fff1798d98fb924110dfe7000df48d5919c6d0de19d9f6c630bd7e48522d589` |
| source29 실제 기동 | launch0/native입력0. 새 전용 profile/saveRoot는 아직 미생성. 정상 플레이·보스 사망/부활·열린 보스문/몬스터 보존·획득·저장 재실행·청취·카메라 인수 미완료 |
| source28 기동 후속 | CUA getApp1회로 실제 main PID44852 실행. HTTP index/game/Easy3가 포장 source3와 exact, api/slots200 빈 목록. 창 관측은 Mac 잠금으로 실패했고 재실행0/native입력0. 이 상태는 이전 launch0 표 이후의 후속이며 파일 포장·실기 검수와 구분 |
| 기존 실행본 보존 | 이전14 검수앱의 존재/plist ID·profile/save metadata 확인, 내용 hash/수정0. 원사용자 앱 정확 경로 UNKNOWN 유지. source27 장착4/일반retry/첫처치1의 부분 플레이는 과거 관찰로 보존 |

source29 원문 검수는 실제 keyName·미니바 원문 블록을 DOM/popup/localization 경계 대역으로 실행한 12조건이다. 13슬롯과 모든 선택 callback 동등, 양판8치환 전체 역복원 exact, inline script/importmap 구문 통과. 숫자·전투·진행·세이브·input dispatch 변경0. Mac 잠금 해제 질문은 대기 중이며, 동일 최신 후보에서 실제 CH1-1 시작→전투/획득→4지역/보스문→보스 사망/부활→재입장·진행 보존을 검수하는 목표는 계속 미완료다.

### source29 successor 정확 경로·소스

| 파일 / 위치 | 값 |
|---|---|
| 새 앱 | `/Users/fordeargamers/Projects/exoduser-migration-20261001/outputs/mac-package-ready/mac-packager-e771c364-291e-4c7a-b983-1a7496d505aa/package/EXODUSER-e771c364-291e-4c7a-b983-1a7496d505aa.app` |
| Bundle ID | `com.exoduser.mac.e771c364-291e-4c7a-b983-1a7496d505aa` |
| `game.html` / source·stage·app | 4034970B / `04f47273bc2e8d4d4d1694108d7cd5ee838e14621d3088de41dd132dd66a830e` |
| `game-easy-test.html` / source·stage·app | 3912639B / `e93e66c18bdcd68ae855c431582a61b69f35dec09dea07b0e7d673883f5b7d37` |
| `index.html` / source·stage·app | 342119B / `1dd28cab162a4384ad84a356eb2c719940782005d20da1312d2857bc649615a7` |
| 새 profile | `/Users/fordeargamers/Projects/exoduser-migration-20261001/outputs/mac-package-ready/mac-packager-e771c364-291e-4c7a-b983-1a7496d505aa/user-state/profile` / 미생성 |
| 새 saveRoot | `/Users/fordeargamers/Projects/exoduser-migration-20261001/outputs/mac-package-ready/mac-packager-e771c364-291e-4c7a-b983-1a7496d505aa/user-state/saves` / 미생성 |

**VISUAL VERDICT: RETOUCH** — 지형·좌표·충돌·배치 수정0, 같은source29 실제 카메라/보스 사망·부활·재입장·열린 문/몬스터 보존 미인수. 파일 SHA 검수를 visual PASS로 대신하지 않음.
