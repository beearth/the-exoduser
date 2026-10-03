# CH1-1 source26 Mac 후보 — 재도전 음악 실패에도 진행

코드 `d7cff1fb9ef030acfc837041f0ccea93756b4b54`가포함된 별도Mac앱을 만들고 타이틀·HTTP·첫정상입력 전달을확인했다. 정상플레이·보스 사망/부활/재도전 인수는 미완이다.

| 항목 | 정확 값 |
|---|---|
| job / port | `c3902d79-03c0-4c25-9e66-a43226d10288` / `3401` |
| app | `/Users/fordeargamers/Projects/exoduser-migration-20261001/outputs/mac-package-ready/mac-packager-c3902d79-03c0-4c25-9e66-a43226d10288/package/EXODUSER-c3902d79-03c0-4c25-9e66-a43226d10288.app` |
| bundle | `com.exoduser.mac.c3902d79-03c0-4c25-9e66-a43226d10288` |
| profile | `/Users/fordeargamers/Projects/exoduser-migration-20261001/outputs/mac-package-ready/mac-packager-c3902d79-03c0-4c25-9e66-a43226d10288/user-state/profile` |
| saveRoot | `/Users/fordeargamers/Projects/exoduser-migration-20261001/outputs/mac-package-ready/mac-packager-c3902d79-03c0-4c25-9e66-a43226d10288/user-state/saves` |
| entry | `http://127.0.0.1:3401/index.html?demo=1` |
| runtime | NW.js0.111.2 / arm64 / Chromium148.0.7778.97 / embeddedNode26.0.0 |
| 입력/포장 | 기존7918 selector·runtime340 유지, source2 inputhash 갱신. 승인된no-cleanup adapter execute1회. standaloneplan/설치/다운로드0 |
| API metadata | 이전preflight의source17 futureExecute 참조를이번own execute-source26.mjs pin/command로정확교정. 불필요한config추가flag는첫execute전제거. source/bootstrap변경0 |
| bootstrap | source node-main/package원문불변. 파생port3333→3401·ownsaveRoot, entry/node-remote/profile인자·app product_string만변경. 서버역치환원본전체exact |

## 원문·파일 검수

| 파일 | bytes | SHA256 |
|---|---|---|
| `game.html` | 4034780 | `d35fed910223e1e43ee9a9d0457fb01ad1134582f62df846f0270d35b9a9830b` |
| `game-easy-test.html` | 3912449 | `7f0b324e4187f9b2633103de3919772526d57d1f4a9bba3fbd78a5b6be0d6e12` |
| `index.html` | 342119 | `1dd28cab162a4384ad84a356eb2c719940782005d20da1312d2857bc649615a7` |

| 검증 | 이번근거 / 경계 |
|---|---|
| actualfiles | payload7916 stage/app각1회SHA/coverageexact. 복사당6645491177B. source3exact, bootstrap2exact, runtimeexe5arm64/실행권한/plistID/runtimeSHA |
| 수정 | source26양판각2caller/+104B. initStage마지막BGM와field/arena retry BGM만동기catch. 전역BGM/stop/Promise/backend·곡선택/RNG/자원·Q/E·2_3·저장builder/schema/capture46 불변 |
| source근거 | 신규16원본4PASS12FAIL→후보50PASS→생산retry50+deathAudio36=86PASS. whole actualretry/capture·restore, generalinitStage생성대역뒤실제terminalBGMAST. fullinitStage/native아님. 포장test반복0 |
| 이전포함 | source25사망/부활·deathFX/loop음향오류격리, source24stage최대콤보, source23jump300/fan실제각, source22조작안내, source21미개봉상자축출, source20MP50, source19CPpreview, source18kbMult초기화 |

## 같은후보 Mac 기동·입력

| 단계 | 이번 실제 증거 |
|---|---|
| 타이틀 | own새앱background기동1회. AXown3401/아무키계속, JPEG2704×1696 육안확인 |
| HTTP | index/main/Easy/api slots 각200, 정적3현재sourcebyteexact. slots[]는서버파일저장소이며DEMO localStorage/실player저장 성공아님 |
| 잠금변화 | 처음CGSSessionScreenIsLocked=true. 이후flag없음과onConsole/loginDone=true를readonly확인. 첫strictlock검사assert는HTTP/receipt쓰기전중단, 외부상태변화를기록 |
| 정상입력 | own타이틀Return1→World intro 실제AX/이미지. 옛9buttonclick는동적노드stale로미전달, freshAX로교정. 인증입력/잠금우회0 |
| 현재미인수 | 캐릭터/CH1정상시작·전투/획득/장착·4지역/보스문·사망/부활/재도전·저장재로드·CP화면·청취/visual 완주 |

별도실제플레이기록은 [마일스톤](../0마스터플랜/mac-resume-20261001/vscode-dispatch/MILESTONE-CH1-1-PLAYABLE-20261002.md), 현행소스계약은 [재도전음향](../6사운드디자인/SOUND_RETRY_PROGRESS_20261003.md)을따른다. source23 벽전조/착지괴리·기존CH1 VISUAL RETOUCH는미해결이다. source검사·포장·인트로를보스완주로바꾸지않는다.

## 이전11실행본 보존

| source | port | 대조범위 |
|---|---|---|
| source11 | 3390 | 존재/Info.plist ID·profile/save 메타 대조. 내용해시·입력0 |
| source15 | 3391 | 존재/Info.plist ID·profile/save 메타 대조. 내용해시·입력0 |
| source16 | 3392 | 존재/Info.plist ID·profile/save 메타 대조. 내용해시·입력0 |
| source17 | 3393 | 존재/Info.plist ID·profile/save 메타 대조. 내용해시·입력0 |
| source19 | 3394 | 존재/Info.plist ID·profile/save 메타 대조. 내용해시·입력0 |
| source20 | 3395 | 존재/Info.plist ID·profile/save 메타 대조. 내용해시·입력0 |
| source21 | 3396 | 존재/Info.plist ID·profile/save 메타 대조. 내용해시·입력0 |
| source22 | 3397 | 존재/Info.plist ID·profile/save 메타 대조. 내용해시·입력0 |
| source23 | 3398 | 존재/Info.plist ID·profile/save 메타 대조. 내용해시·입력0 |
| source24 | 3399 | 존재/Info.plist ID·profile/save 메타 대조. 내용해시·입력0 |
| source25 | 3400 | 존재/Info.plist ID·profile/save 메타 대조. 내용해시·입력0 |

원사용자앱59376baf/08cac1ce 정확경로는UNKNOWN이며추측제어0. 타인67·manager4·사용자23WIP·기존게임/세이브보존, 새job ownprofile/save만앱이생성했다. 옛save전체읽기/hash/injection/cleanup0.

## 증거 영수증

| 증거 | bytes / SHA256 |
|---|---|
| physical `/Users/fordeargamers/Projects/exoduser-migration-20261001/tmp/mac-migration-runtime/continued-review-20261003/ch1-source26-build/physical-receipt.json` | 30663 / `e238f1f3a99454c785c7a267817aacf6465ac8e9f57c24dad06a11c1df727c92` |
| startup `/Users/fordeargamers/Projects/exoduser-migration-20261001/tmp/mac-migration-runtime/continued-review-20261003/source26-native-play/startup-receipt.json` | 3854 / `846eeb328d1158f6e8c85ba740c82bef7bebfaf8efcaae83d91612eb3e2937a0` |
| title `/Users/fordeargamers/Projects/exoduser-migration-20261001/tmp/mac-migration-runtime/continued-review-20261003/source26-native-play/01-title.jpg` | 802945 / `adf8a18bf4512064d420e4a8ef1fffd1633460c6802110da72633571f1fd0870` |
| AX `/Users/fordeargamers/Projects/exoduser-migration-20261001/tmp/mac-migration-runtime/continued-review-20261003/source26-native-play/01-title-ax.txt` | 346 / `8f14a06ddb7fec9e966c06b72b316c8d47fd6ddfa7f8ec163649d0dba4e891d1` |
| firstinput `/Users/fordeargamers/Projects/exoduser-migration-20261001/tmp/mac-migration-runtime/continued-review-20261003/source26-native-play/02-input-delivery.json` | 576 / `752e1a3a8c808cac2b54c8682c6eeb3a277494b3005b906e0459d1eb2f731fcc` |

시스템Python에PIL이없어첫준비가import단계에서중단됐으며설치하지않고기존macOS sips로이미지크기만읽었다. 실제앱실패와준비도구실패를구분한다. package docs15 exactscope·commit/push/remoteSHA영수증은별도보존한다. 삭제·cleanup·새팀·권한·인증·설치·결제·게시0. 전문팀원자료/검사수를제품완료건수로계산하지않는다.
