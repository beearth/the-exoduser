# CH1-1 source25 Mac 후보 — 사망·부활 음향 오류 격리 포함

실제 코드 `b9c1a2e6559fd907c6ba0b72b8a5f6d19b9f88b5`를 포장하고 타이틀·HTTP를 확인했다. 같은 후보의 정상 플레이·보스 사망/부활/재도전 완료 선언은 아니다.

| 항목 | 정확 값 |
|---|---|
| job / port | `a05224ef-0b57-4b87-ab0a-fba20aeb2a45` / `3400` |
| app | `/Users/fordeargamers/Projects/exoduser-migration-20261001/outputs/mac-package-ready/mac-packager-a05224ef-0b57-4b87-ab0a-fba20aeb2a45/package/EXODUSER-a05224ef-0b57-4b87-ab0a-fba20aeb2a45.app` |
| bundle | `com.exoduser.mac.a05224ef-0b57-4b87-ab0a-fba20aeb2a45` |
| profile | `/Users/fordeargamers/Projects/exoduser-migration-20261001/outputs/mac-package-ready/mac-packager-a05224ef-0b57-4b87-ab0a-fba20aeb2a45/user-state/profile` |
| saveRoot | `/Users/fordeargamers/Projects/exoduser-migration-20261001/outputs/mac-package-ready/mac-packager-a05224ef-0b57-4b87-ab0a-fba20aeb2a45/user-state/saves` |
| entry | `http://127.0.0.1:3400/index.html?demo=1` |
| runtime | NW.js0.111.2 / arm64 / Chromium148.0.7778.97 / embeddedNode26.0.0 |
| 入力/포장 | 기존7918 selector·runtime340 유지, main/Easy2 입력hash갱신. 승인된 무cleanup adapter execute1회·새plan/설치/다운로드0 |
| 파생bootstrap | 원본node-main/package 불변. port3333→3400·자체saveRoot; main/node-remote/profile 인자·product_string만 변경. 서버전체역치환원본exact |

## source·에셋 검수

| 파일 | bytes | SHA256 |
|---|---|---|
| `game.html` | 4034676 | `78f37f3b22b1c2584c43d2b7d89e05b549fdb3b9c6a3a77a8a6e740ed3dce05b` |
| `game-easy-test.html` | 3912345 | `87c00f2d24405274b50f4f5bce52917ae35de0f0803dddd855e676d6c3fe2470` |
| `index.html` | 342119 | `1dd28cab162a4384ad84a356eb2c719940782005d20da1312d2857bc649615a7` |


| 검증 | 결과 / 경계 |
|---|---|
| 실제파일 | payload7916개 stage/app각1회SHA/coverage exact. 복사당6645490969B. source3·파생bootstrap2·arm64/exemode/runtimeSHA/plist ID5 대조. 원본7918·옛앱전체재인벤토리0 |
| 새 수정 | 양판 source25각12치환/+858B. die/_fallenResolve/일반boss180f음향·deathFX직접음향·loop첫flush 소비자catch. backend동일Error전파/dispatcherfinally·수치·정상RNG·저장/QE/2_3 보존 |
| source근거 | 원본공통36중2PASS34FAIL→후보38PASS(정상동등2추가)→생산38+기존필드복귀34=72PASS. 실제loop185콜백/184물리틱은clock/RAF/update/audio 대역. 이번포장test반복0 |
| 이전포함 | source24stage최대콤보, source23jump300/fan실제각, source22조작안내, source21미개봉상자축출, source20MP50재검증, source19CPpreview, source18kbMult 초기화 |
| 필드복귀 | capture/restore46key·현재스테이지통계/시간 유지. 열린보스문/필드몹진행 보존을 위한 이전source 포함. 이것만으로실제CH1사망재도전완료를판정하지않음 |

## 실제 Mac 기동과 남은 Gate

| 단계 | 같은후보 이번 증거 |
|---|---|
| 타이틀 | 새앱background기동1회. 실제AX에서3400 entry와아무키계속, JPEG2704×1696 육안확인 |
| HTTP | index/main/Easy/api슬롯 각200, 정적3응답현재source25byte-exact. `{ok:true,slots:[]}`는서버파일슬롯이며별도demo localStorage저장검증아님 |
| 입력 | macOS `CGSSessionScreenIsLocked=true` 읽기확인. GUIinput0/캐릭터0, 잠금해제 새회신 대기. 타이틀/focus로입력전달성공을추정하지않음 |
| CH1 실제플레이 | 시작→전투/획득/장착→4지역/보스문→사망/부활/재도전·저장재로드·CP화면·청취/visual 모두미인수 |
| QA 잔여후보 | retry-tail BGM.play throw의후속복원중단은QA좁은source후보인계이며root actual전체handler 검수/채택대기. source25 수정으로해결했다고주장0 |

새 native검수는 [시연 마일스톤](../0마스터플랜/mac-resume-20261001/vscode-dispatch/MILESTONE-CH1-1-PLAYABLE-20261002.md), 음향계약은 [source25 정본](../6사운드디자인/SOUND_DEATH_REVIVE_PROGRESS_20261003.md)을 따른다. source23 벽막힘전조/실착지 괴리는미해결. 기존CH1 VISUAL RETOUCH/현재native미인수 유지. source72PASS/포장/타이틀을 정상플레이·청취완료로 바꾸지 않는다.

## 이전 실행본 보존

| source | port | 대조 범위 |
|---|---|---|
| source11 | 3390 | 앱존재/plistID/profile·save메타. 전체내용해시·profile/save내용읽기·입력0 |
| source15 | 3391 | 앱존재/plistID/profile·save메타. 전체내용해시·profile/save내용읽기·입력0 |
| source16 | 3392 | 앱존재/plistID/profile·save메타. 전체내용해시·profile/save내용읽기·입력0 |
| source17 | 3393 | 앱존재/plistID/profile·save메타. 전체내용해시·profile/save내용읽기·입력0 |
| source19 | 3394 | 앱존재/plistID/profile·save메타. 전체내용해시·profile/save내용읽기·입력0 |
| source20 | 3395 | 앱존재/plistID/profile·save메타. 전체내용해시·profile/save내용읽기·입력0 |
| source21 | 3396 | 앱존재/plistID/profile·save메타. 전체내용해시·profile/save내용읽기·입력0 |
| source22 | 3397 | 앱존재/plistID/profile·save메타. 전체내용해시·profile/save내용읽기·입력0 |
| source23 | 3398 | 앱존재/plistID/profile·save메타. 전체내용해시·profile/save내용읽기·입력0 |
| source24 | 3399 | 앱존재/plistID/profile·save메타. 전체내용해시·profile/save내용읽기·입력0 |


원사용자앱59376baf/08cac1ce 경로는UNKNOWN으로보존하며추측제어/전체스캔0. 사용자23WIP/타인WIP/보호67/manager4/기존게임·세이브를유지했다. 새job 아래profile/save만앱이생성했다. 격리서버와복사검증을 기존save재로드 성공으로확대하지않는다.

## 증거 영수증

| 증거 | bytes / SHA256 |
|---|---|
| physical `/Users/fordeargamers/Projects/exoduser-migration-20261001/tmp/mac-migration-runtime/continued-review-20261003/ch1-source25-build/physical-receipt.json` | 29565 / `bfa9e4e214c8b0708b00fa5ad653ea1af516466332e1d5ba2a7ef706ac6ad801` |
| startup `/Users/fordeargamers/Projects/exoduser-migration-20261001/tmp/mac-migration-runtime/continued-review-20261003/source25-native-play/startup-receipt.json` | 3841 / `d004100c6263103d6f22213f62ede4be2aa2f9ccf445e86ffe1139634b4b1169` |
| title `/Users/fordeargamers/Projects/exoduser-migration-20261001/tmp/mac-migration-runtime/continued-review-20261003/source25-native-play/01-title.jpg` | 804984 / `f7217af8a62033ce2b3eff48a22bd03286b60014ed18e0251833ef674ef04eaf` |
| AX `/Users/fordeargamers/Projects/exoduser-migration-20261001/tmp/mac-migration-runtime/continued-review-20261003/source25-native-play/01-title-ax.txt` | 487 / `2bbf12b6f0ec58ad97fddac3ed8269d574ccba76d708d36d319dbc68068c9684` |
| lock `/Users/fordeargamers/Projects/exoduser-migration-20261001/tmp/mac-migration-runtime/continued-review-20261003/ch1-source25-build/current-input-blocker.json` | 380 / `7c6c5fdc951ecdb30a8647eba4f3b576a6af109a525c0ff7fa70473f0f90312a` |

code b9c1a2e/source25와별도 docs17 exactscope commit/push/remote SHA 영수증을보존한다. 삭제·cleanup·새팀·권한·인증·설치·결제·게시0. 팀검사/원자료를제품완료건수로계산하지않는다.
