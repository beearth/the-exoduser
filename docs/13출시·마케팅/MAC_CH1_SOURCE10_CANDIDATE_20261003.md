# Mac CH1 source10 후보 — 물리 포장·정상 초기 기동, 실게임 인수 대기

source10 고정 소스를 넣은 새 고유 Mac 앱을 공식 경로로 생성했다. root의 default execute는 exit0/`fixtureOnly:false`/`packageCreated:true`이며 상태는 **PACKAGED_NOT_RUNTIME_ACCEPTED**다. root 물리 영수증 UTC `2026-10-02T20:39:22.155422+00:00` 시점에서 source3 원문·stage·app exact, 파생 서버·package 및 arm64 실행 payload를 확인했다. 아래 포장 근거를 정상 실플레이·실청취·저장 재실행·visual 인수로 확대하지 않는다. 문서 담당은 root 증거를 동기화했으며 빌드·GUI·추가 제품검사를 실행하지 않았다.

| 항목 | 정확 결과·검수 경계 |
|---|---|
| 포장 checkpoint / 원격 | `0538cf32b35cbcdae2da7453f27059ae1ea4c411`, `refs/heads/codex/mac-environment-20261001`; source3 freeze/fresh 원격 backup exact는 root 인계. 게임 코드 commit과 후속 원자료·문서 checkpoint를 구분 |
| 새 job / 포트 | `9b0d6558-50e9-4333-a735-eff40ae8fc56` / loopback **3389** |
| 실제 앱 | `outputs/mac-package-ready/mac-packager-9b0d6558-50e9-4333-a735-eff40ae8fc56/package/EXODUSER-9b0d6558-50e9-4333-a735-eff40ae8fc56.app` |
| 공식 생성 | fresh plan1 READY_PLAN_ONLY/exit0 → default `execute(config,{approved:true})`1/exit0 → 공식 내부 output verify. stdout951B/stderr0, 중복 builder·재빌드0 |
| 입력 / runtime | 승인된 기존 selector7918 / runtime340, 기존 `nw-builder4.17.10`·공식 cached `NW.js0.111.2 osx-arm64` 및 release pin 재사용. 공식 내부 coverage/SHA와 별도 audit를 구분; 추가7918 전체 SHA·구8253 재감사0 |
| 물리 인벤토리 | **8253 regular +5 symlink /7043804747 regular bytes**, root 물리 snapshot. 문서 담당 새 전수 해시·인벤토리 재실행0 |
| 검수 | source3/stage3/app3 exact, 서버 PORT3389/saveRoot 외 역치환 exact, stage package plan exact·app package 공식 product_string1개 차이. main+helper4 총5 Mach-O arm64/0755/runtime SHA exact·bundle identity |
| 기동 전 격리 | root 물리 영수증 시점에 새 `user-state` 부재 및3389 portFree. 후속 정상 launch로 상태가 생성되면 이 기동 전 관측과 시점을 분리 |
| 보존 | 기존 source8 profile/save와59376/08cac 원앱 보존(root 인계). 전역 source10 변경0. 보호67/타인WIP·보호2_3·운영STATE/LOG·원후보는 문서 작업에서 쓰기0; 사용자 상태 전수 내용검사를 주장하지 않음 |
| cache·배포 | 기존 cache/공식 로컬 builder 사용, 새 download/install/auth/permission/sign0. 서명·공증·codec·이동/배포 인수는 별도 |
| 제품 Gate | 후속 정상 초기 기동·world intro 영상 재생까지만 부분 관측. 캐릭터 등록·필드·CH1 연결6단계·보스 사망/부활·재도전·장착·실청취·player 저장 종료/재실행·8카메라 미인수. 코드/후보/syntax/포장을 native·visual PASS로 합산0 |

## source3 원문·stage·app 고정 핀

| 파일 | bytes | SHA-256 full64 | 물리 대조 |
|---|---:|---|---|
| `game.html` | 4029803 | `a0eab60f025654636f16668d5a9b0ab93cbe155f7e806a65d79764b1f6be2718` | 원문 = stage = app |
| `game-easy-test.html` | 3907070 | `ebaacc36f22d9ae7b7b57f7537f063783abdb74a66baa8789e32bef726b565a8` | 원문 = stage = app |
| `index.html` | 342119 | `1dd28cab162a4384ad84a356eb2c719940782005d20da1312d2857bc649615a7` | 원문 = stage = app |

source9 helper·보스 소환 예외 회복과 source10 고정 MP100 차감·fog 재bake merged null·bossTeleDrop fallen/dead 상태 보존을 포함한다. 기존 source10 생산28/28 및12JS+2JSON 근거를 재사용하며 이번 포장 문서 준비에서 검사 재실행·중복 성과 계산0이다. 게임 소스·수치·원후보는 변경하지 않는다.

## 파생 서버·package·arm64 payload

| 항목 | root 물리 검증·현재 계약 |
|---|---|
| stage / package | 위 job의 `stage` / `package` |
| profile / save | 실제 checkout의 `outputs/mac-package-ready/mac-packager-9b0d6558-50e9-4333-a735-eff40ae8fc56/user-state/profile` / `user-state/saves` 절대경로 |
| entry / node-remote | `http://127.0.0.1:3389/index.html?demo=1`; node-remote `http://127.0.0.1:3389` 및 `http://localhost:3389` |
| node-main.js | SHA-256 `2794adf2a6249e50c17b25cc14f28bbeb9654ffba12b4f0d91714d0deed1d3d3`; 원 PORT3333/SAVE_DIR에서3389/new saveRoot만 파생, 역치환 exact |
| package.json | stage는 fresh plan exact; app은 공식 builder의 `product_string: EXODUSER-9b0d6558-50e9-4333-a735-eff40ae8fc56` 추가1개 외 exact |
| main / helper4 | 모두 Mach-O arm64/실행 mode0755/runtime binary SHA exact. helper 기본·Alerts·GPU·Renderer는 실제 `Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/` 아래이며 실행명은 같은 job product prefix로 rename |
| bundle identity | `com.exoduser.mac.9b0d6558-50e9-4333-a735-eff40ae8fc56`; 실행명·main/helper plist는 공식 builder/내부 검증 계약 |
| cache / release | 기존 `Projects/exoduser-mac-runtime-root-20261002/cache/nwjs-v0.111.2-osx-arm64`; release SHA `f5b3855b14e24f99ed9bf271a5896cbfe6b8e0fd14a8cef66609221ecef3a626` |
| 이동·배포 | profile/save 절대경로는 고유 job에 귀속. 앱 이동/배포와 서명·공증·codec·실청취 인수는 별도 |

root의 최초 물리 검사 assertion3은 제품 실패·재빌드가 아니다. app object 비교에서 공식 `product_string`을 빠뜨렸고, direct Frameworks helper glob은 실제 versioned framework 경로와 달라0개였으며, cached helper 파일명을 그대로 가정했지만 builder가 product prefix로 rename했다. 기대 객체·실제 경로·원 runtime hash 대조로 정정했고 이력은 root `physical-receipt.json.initialInspectionFailures`에 보존했다.

## 정확 포장 영수증

ignored `tmp/mac-migration-runtime/continued-review-20261003/ch1-source10-build/`의 근거다. 별도 artifact/final receipt가 있다고 추정하지 않고 실제 존재한 다음 파일을 연결한다.

| 파일 | bytes | SHA-256 full64 | 결과 |
|---|---:|---|---|
| `build-config.json` | 3428777 | `0ec9991e3a23781da2fde2497397c6d713ecb05e993d9d2722e9439c6cc4a142` | source3 / fresh backup / 새job·3389 |
| `plan.json` | 2903547 | `846afeba7e4b8214af7f1a7e7ab98b5a2fed43c668f9159dc5fa6561c648d67d` | READY_PLAN_ONLY, exit0 |
| `build.stdout.txt` | 951 | `18af54895348cc97d6e03e22231aa1e51c0d9762ed327d03885cb4451a706798` | 실제 default execute PACKAGED_NOT_RUNTIME_ACCEPTED, fixtureOnly false/packageCreated true |
| `build.stderr.txt` | 0 | `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855` | stderr empty |
| `physical-receipt.json` | 3996 | `440724315b1ce93e0cc8bdf055442a2062a1fb27d389c6ac87358099ff09fe5f` | 원문/stage/app·파생·5 executable·8253+5·기동 전 격리 |

## source10 후속 정상 초기 기동 — root 실제 관측

물리 영수증 뒤 root가 CUA에서 exact 새 앱을 정상 launch1했다. `http://127.0.0.1:3389/index.html?demo=1` 초기 입장→Enter→기존 world intro 영상의 실제 재생과 AX container `World intro`를 관측했다. UTC `2026-10-02T20:40:26Z` Renderer36721의 IPv4 loopback3389 LISTEN 및 GET `/api/slots` `{ok:true,slots:[]}`를 확인했다. 고유 profile/saveRoot가 launch 후 생성됐다. 물리 검증 시점의 `user-state` 부재와 기동 후 생성을 서로 다른 시점으로 기록한다.

이 시점은 world intro 자연 종료를 기다리는 단계다. 실제 음향 청취0, 캐릭터 등록·필드 전투·native 연결6단계·player 저장/재실행·8카메라 미인수이며 초기 영상 재생을 combat·플레이 저장 성공으로 확대하지 않는다. 문서 담당 새 GUI 조작·실청취·상태/세이브 내용 읽기0이다. 정상 초기 기동 후에도 **PACKAGED_NOT_RUNTIME_ACCEPTED**를 유지한다. 근거는 root의 CUA/AX·process/HTTP 직접 관측 인계이며, 추가 native 영수증 파일명·핀을 추정하지 않는다.

## source8 후속 정상 필드·일반 사망·Quit 이력

root가 기존 source8/3388에서 정상 guide→practiceSkip→CH1 Lv1·0/32 표시 필드까지 진행했다. 조사 중 idle 상태에서 일반필드 몬스터 투사체에 사망했으며 처치0이다. **일반필드 사망을 보스 사망으로 계산하지 않는다.** 이후 정상 Cmd-Q, CUA `isRunning:false`, 원 PID7118 gone,3388 noListener를 확인했다. 이 관측은 source8의 후속 상태이며 source10 native 검수가 아니다. 기존 profile/save와 다른59376/08cac 원앱은 보존했다.

근거 `tmp/mac-migration-runtime/continued-review-20261003/source8-native-play/05-general-field-death.png`는 root 제공916050B/SHA `e365220a4b77c423787f5ec74a48fce248a2a81a2ac00d9a3ca177a648a4659c`다. 문서 담당은 기존 화면을 재검수·재해시하지 않았다. 과거 source8/6 보고서의 당시 핀·관측은 그대로 보존한다.

DEMO 게임 저장은 `localStorage.hellsave_demo`이며 로비가 활성 슬롯 `hellsave_demo_i`에 병합하는 기존 계약이다. backend `/api/slots`의 `{ok:true,slots:[]}`만으로 게임 저장 실패를 판정하지 않는다. root 정상 UI 실제 player 저장·종료·재실행은 미인수다. [세이브 구조](../15%20세이브+데이터구조/15%20세이브+데이터구조.md)의 DEMO NW.js 계약을 따른다.

## 문서·실행 범위

root 예약4문서만 사용한다: 이 새 보고서와 기존 PROJECT_MANAGEMENT_MASTER·CHANGELOG_SYNC·MILESTONE-CH1-1-PLAYABLE 최신 절 append. root 제공 actual71/max83 기준에서 예약4 소비를 중복 계산하지 않으며 최종 actual·commit scope는 root가 확정한다. 기존3 prefix/EOL·타인 최신 편집, 보호67/WIP·보호2_3·운영 STATE/LOG·원후보·모든 기존 앱/profile/save를 보존한다. 문서 담당 actual tracked 쓰기·Git/index·앱/서버·새 제품검사0이고 root가 직렬 적용한다.

관련 검색은 준비1회228 text행/56파일(+무관 binary notice1)·354502B/SHA `d0c26fa308f01588b5bef911455cac2111c9e9747406912f821843f628be46dd`이며 supervisor/운영STATE·LOG는 읽지 않았다. 다른 날짜/시스템/증거와 기존 DEMO 저장 계약은 변경하지 않는다. 원 pending recipe는 불변 보존하며 root 후속 정상 GUI 관측은 별도 시점 append로만 추가한다. 포장 상태 **PACKAGED_NOT_RUNTIME_ACCEPTED** 및 제품 coregoal6step/audio/8visual 미인수 경계를 유지한다.

## 총괄 직렬 적용 및 초기 인트로 후속 관측

| 항목 | 직접 관측·범위 |
|---|---|
| source10 인트로 후속 | 총괄 CUA의 새 화면에서 영상이 자연 종료한 뒤 한국어 `데모버전에 오신 것을 환영합니다` / `데모버전 입장하기` 정상 UI를 확인. 아직 캐릭터·필드·보스전 완료0 |
| 초기 기동 영수증 | `boot-observation.json` 836B / SHA `09eab0ea6f75084171c0d030bd5cb42db732581e62644882a2208dbd60d8dba5`; UTC20:40:26Z의 launch·World intro·loopback3389 및 새 job 상태 생성 |
| 후속 화면 | `source10-native-play/02-demo-welcome.png` 584948B / SHA `8d420aff65e2a35b6228c619e44b9651d05ffa3fbae64e2b45b27fa29779142e`; 현재 동일 source10 앱 정상 UI, 실청취 미인수 |
| 문서 적용 시점 | UTC `2026-10-02T20:46:23.274640+00:00`; 직전 NUL `--untracked-files=all` 실제71 + 예약4 + 외부8 = 최대83. 이번4 적용 시 실제75/예약0/최대83, 완료소유4만 별도 checkpoint. protected67 exact·기존3 prefix/EOL 보존 |
| 검수 상태 | **PACKAGED_NOT_RUNTIME_ACCEPTED**. 영상 종료를 native6·combat·장착·보스방 개방·boss death/revive·saveRestart·visual PASS로 확대0 |
