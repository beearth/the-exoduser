# Mac CH1 최신 source8 후보 — 물리 포장과 정상 기동의 분리

source7 레벨업 자원 보존과 source8 특수 탄막 스턴·빙결 취소를 포함한 새 고유 앱을 생성했다. 포장 결과는 **PACKAGED_NOT_RUNTIME_ACCEPTED**다. 이후 root가 기존 source6를 정상 Quit하고 source8를 정상 기동하여 초기 HTTP와 도입 화면 진행을 관측했다. 이 부분 관측을 CH1 연결 6단계·청취·저장 재실행 완료로 계산하지 않는다. 문서의 native 진행은 root 전달 및 아래 시점 증거이며 문서 담당의 새 GUI 검수가 아니다.

| 항목 | 정확 값·검수 경계 |
|---|---|
| source checkpoint / 원격 | `2e3edc320fa38562c0d65b52cdec825b63981a40`, `refs/heads/codex/mac-environment-20261001`; root commit/push/exact 원격 대조 근거를 재사용. 문서 담당 새 Git 조회·쓰기 0 |
| 새 job / 포트 | `96bf549c-5f0e-445b-84b4-a2a461a0747b` / loopback **3388** |
| 실제 앱 | `outputs/mac-package-ready/mac-packager-96bf549c-5f0e-445b-84b4-a2a461a0747b/package/EXODUSER-96bf549c-5f0e-445b-84b4-a2a461a0747b.app` |
| 생성 | fresh plan1 READY → 실제 default `execute(config,{approved:true})`1 → 내부 `verifyOutput`1, exit0 / `fixtureOnly:false` / `packageCreated:true`. 시작 UTC `2026-10-02T18:50:39.647310+00:00`, 종료 `2026-10-02T18:51:19.700530+00:00`; 재빌드0 |
| 입력 / runtime | 승인된 원 selector **7918** 입력, runtime **340**. 기존 `nw-builder4.17.10` / 공식 `NW.js0.111.2 osx-arm64` cache와 release pin 재사용. 공식 plan/execute 내부 SHA·coverage 검사에서 원 cache 핀 동일; 별도 cache 재해시0 |
| 물리 인벤토리 | **8253 regular +5 symlink / 7043804133 regular bytes**, 포장 당시 snapshot. stage/app 입력 경로7918과 runtime 이름변환340 metadata coverage exact; os.walk는 종류·크기·mode·링크target만 전수 |
| 좁은 핵심 검수 | source3/stage3/app3 exact, 파생 node/package fresh plan exact, main+helper4 Mach-O arm64/실행비트/plist identity. 추가7918 full SHA sweep0; 공식 내부 전수검사 재사용 |
| 보존 | source4/source6 core/config·두 ownMats를 포함한 `protectedCoreAndOwnSave` **15 pin exact**. source6 `_sharedMats.json` **33B** 보존. 전체 사용자 세이브·profile 내용 전수검사와 구분; 삭제·초기화·스키마변경0 |
| cache / 권한 | 새 download/install/sign/permission/auth 변경0. payload 원 pin 일치와 arm64 실행권한 관측은 서명·공증·quarantine·코덱 인수가 아님 |
| 소스 회귀 | source7 기존17/17, source8 기존22/22 PASS 근거 재사용. 이번 재실행0; 과거 보고서·원자료를 새검사/native 제품 건수로 중복 계산0 |
| freeze | 물리 원문·stage·app3 exact 확인으로 포장용 source freeze 해제. 소스변경0 |

## source3 고정 입력

| 파일 | bytes | SHA-256 full64 | 현재 대조 |
|---|---:|---|---|
| `game.html` | 4029496 | `794d29274331d6c2fca1d213e27ccc6e7fe0f7e5ebd2f5edfdb63540b9572842` | 원문·stage·앱 바이트/SHA 동일 |
| `game-easy-test.html` | 3906763 | `2ee66501acee9c4822152987c4904a17d84f742833458381aa234db92212c03d` | 원문·stage·앱 바이트/SHA 동일 |
| `index.html` | 342119 | `1dd28cab162a4384ad84a356eb2c719940782005d20da1312d2857bc649615a7` | 원문·stage·앱 바이트/SHA 동일 |

## 파생 메타데이터와 런타임 핵심

| 파일 | bytes | SHA-256 full64 |
|---|---:|---|
| stage package.json | 985 | `1ac95f654107827521dd3e466a2b5a1d78b50711b92fa9023219b075886d5329` |
| app package.json | 1054 | `aaa04c1d16766f2275210240929a6991080db089aae120b3c2894dd76d1bed93` |
| stage node-main.js | 10537 | `8106d24ae233c5efa807c93d50b36b0cc67eaf8336b4785ce30ebd38fbb9c5f4` |
| app node-main.js | 10537 | `8106d24ae233c5efa807c93d50b36b0cc67eaf8336b4785ce30ebd38fbb9c5f4` |

파생 node는 원 `node-main.js`에서 `PORT=3388`과 새 saveRoot만 바뀌며 역치환 원문 바이트 exact다. stage package는 fresh plan과 구조 동일하고 app package에 공식 builder의 `product_string`만 추가된다. entry는 `http://127.0.0.1:3388/index.html?demo=1`, node-remote는 `http://127.0.0.1:3388`과 `http://localhost:3388` 두 값이다. bundleID는 `com.exoduser.mac.96bf549c-5f0e-445b-84b4-a2a461a0747b`다. profile/save는 job의 고유 절대 `user-state/profile` / `user-state/saves`이며 앱을 이동하면 파생 경로 계약을 다시 검토한다.

| 실행 payload | bytes | SHA-256 full64 | 관측 |
|---|---:|---|---|
| main | 56592 | `32cca77273cc1cc41c21c26a6ae9bd7a31587229ba44db31d80f5e13287f1170` | arm64 / `0755` / 실행명·bundleID 일치 |
| helper 기본 | 75632 | `544c9e579c914be565a416ca50c01bf8a259a8bd489fe91aff340bfe1087bedc` | arm64 / `0755` / 실행명·bundleID 일치 |
| helper (Alerts) | 75648 | `601cafa38b6cb4be5fb9026489a717d3abe0320cb31ab473c8b44e0418b92eab` | arm64 / `0755` / 실행명·bundleID 일치 |
| helper (GPU) | 75648 | `abc0a72d988ba5b33cfa638c05352f1a7be975c22d1f4ee379f25e7f0f4f289e` | arm64 / `0755` / 실행명·bundleID 일치 |
| helper (Renderer) | 75648 | `1706b0cdbeec3bfe73a5dec8e42ed4b1c634a7c44c25216de1c60ae804822777` | arm64 / `0755` / 실행명·bundleID 일치 |

Mach-O magic `0xfeedfacf`, CPU `0x0100000c`; main와 helper4 원 runtime payload pin 동일. main `CFBundleExecutable`은 `EXODUSER-96bf549c-5f0e-445b-84b4-a2a461a0747b`, helper는 이 이름 뒤 ` Helper` 및 기본/Alerts/GPU/Renderer suffix를 사용한다. helper bundleID는 같은 job ID 뒤 `.helper`, `.helper.alert`, `.helper.gpu`, `.helper.renderer`다. 최초 자체 물리검사에서 PID88947을 main으로 가정한 assertion은 증거 작성 전에 중단됐다. 실제 source6 Renderer helper/3387 listener로 교정했으며 제품 빌드 실패·재시도가 아니다.

## 물리 영수증

아래5개는 ignored `tmp/mac-migration-runtime/continued-review-20261003/ch1-source8-build/`에 있다. 전수 source SHA 검사와 별도 물리 검사의 범위를 영수증에서 구분한다.

| 증거 | bytes | SHA-256 full64 |
|---|---:|---|
| `build-config.json` | 3428578 | `a6751323e0fe04736fef46eefbd21bbd1cc5c91d2aaaf0a1fc2cb941e3382fa0` |
| `plan.json` | 2903547 | `88ea679f5a0daf603d3c616572df5df223f44eb1da5c6718757e060347ea8273` |
| `execute-result.json` | 7564 | `66761ad924a4ae9f16964d1a4f0baf377b1a706653e43ada8d5fb10711b7de51` |
| `artifact-manifest.json` | 2967560 | `6942ddaf8e91550e678b90d10f25a663f8d343c09ee7b1c32044ba16de6b7198` |
| `final-build-receipt.json` | 10514 | `7e5248a4425d7b1e24e215faf8a2c5e3085e5bf08dd9f7514cf384841a83c602` |

## 정상 Quit·source8 기동 부분 관측

| 시점·대상 | 실제 관측 | 남은 경계 |
|---|---|---|
| source6 부활 입력 | 부활버튼 입력 후 반영을 확인하지 못했으며 좌표입력 `noWindowsAvailable` 관측. 메뉴 클릭은 실제 메뉴 열림 확인 | 원인 UNKNOWN; 정적 버튼 결함 확정0. 옛18:25 Mac locked 관측과 현재 입력 원인을 구분하고 기존 unlock 질문 재질문0 |
| 정상 Quit 2회 | 첫 menu Quit 뒤 `getAX` 관측 시 옛 앱이 새 source6 Renderer6276/3387 로비로 다시 관측됐다. 내부 자동기동·재활성화의 이유와 인과는 직접 검증하지 않았다. 두 번째 정상 Quit 후 UTC `2026-10-02T19:03:42.338011+00:00` old88947 gone /3387 noListener /protected15 exact /새 user-state 부재 | 강제종료0; Quit 호출2를 신규 앱 기동2로 계산하지 않음 |
| 생성 시점과 기동 시점 | 물리 검증 UTC `2026-10-02T19:00:08.238002+00:00` 및 정상 Quit 후 snapshot에서 새 `user-state` 부재. 이후 source8 정상 기동으로 해당 격리 상태 생성 | 생성 당시 부재와 launch 후 생성을 같은 시점 사실로 혼용하지 않음 |
| source8 정상 기동1 | CUA exact 새 app 기동1. UTC `2026-10-02T19:04:26.329567+00:00` Renderer7154의 `127.0.0.1:3388` LISTEN /GET `/api/slots` `{ok:true,slots:[]}`. index demo 정상 입장 버튼·audio title 변경·anykey를 거쳐 월드 인트로 화면 진행(root 전달) | 초기 HTTP와 화면 진행 부분 관측. 실제 음향 청취0, native6 완료0 |
| 실플레이 미완 | 보스방·보스사망·부활·재도전·획득/장착·player 저장→종료→재실행·8카메라0 | 정상 source8에서 순차 실입력 검수 필요. 포장·메모리회귀를 visual/play/audio/storage PASS로 확대0 |

| native 근거 | bytes | SHA-256 full64 |
|---|---:|---|
| `normal-quit-source6.json` | 277 | `2b854bf6eb21d3666440e17b9ef264574c3abdf4a54084fafcef67f8417e321d` |
| `initial-runtime.json` | 529 | `60f70aa38733e87a986bbe199e34cb22e8181f461849dfbf31671f02e6b5e9df` |
| `01-normal-opening.png` | 542946 | `ea380d6d1132a4a5a46d98d620b29a05d938eb5d726353e7c7f4bc38c1af507d` |

`normal-quit-source6.json`의 기존 root 추정 필드는 원문 보존하며, 본문은 관측된 새 PID/로비와 미확정 인과를 구분한다. `normal-quit-source6.json`, `initial-runtime.json`은 같은 build 증거 폴더, `01-normal-opening.png`는 `tmp/mac-migration-runtime/continued-review-20261003/source8-native-play/`에 있다. native 부분기동 이후에도 포장 영수증의 **PACKAGED_NOT_RUNTIME_ACCEPTED**와 미완 gate는 유지한다. 실제 맵카메라 QA8·전투 visual 판정·청취·저장영속 인수는 완료되지 않았다. source4/source6의 과거 부분 플레이를 이번 source8 관측으로 다시 계산하지 않는다.

## 팀 운영과 문서 범위

- Claude3 기존 실제 작업 확인과 idle4 원총괄 목표 확정을 구분한다. 정식 과제 전달과 actual source 읽기·작업 확인은 서로 다른 상태다.
- idle4는 기존 BOSS summon finally70f, ENEMY/ANIM 표시전용 기존 wind timer/helper, MAP 로드 실패1회 재시도 범위다. 모두 메모리 후보·production 미적용·신규 file credit0이며 과거 후보를 새 구현 완료로 계산하지 않는다.
- ART local human/기존3 deny 목적 hold·우회0, 역할18 유지. root 문서 예약 정확6만 소비하여 root 제공 actual71→예상77, root remaining0, worst85 basis 유지; 소비6을 다시 예약에 더하지 않는다. WIP67·공유 인덱스·운영 STATE/LOG는 root 담당이며 문서 담당 변경0.

관련 전체 rg는 root `docs-keyword-search.txt` **51 rows /23 files**, 20651B/SHA `f65ca90f9b83640156213edf112f6614b139db0275dca7977fc831338aec8d18`를 재사용한다. 다른 시스템·과거 기록·운영 로그의 원문은 보존하고 root 예약6 docs만 동기화한다. 기존5 원문/EOL은 ignored `ch1-source8-build/docs-backup/`에 먼저 보존하고 append만 적용한다. `docs-scope.json` / `docs-applied.json`은 예약 범위·prefix byte 보존·핀의 로컬 근거다. 소스·하니스·기존 원자료 수정0, Git/GUI/운영 STATE·LOG 쓰기0; docs scope의 commit/push·원격 exact 확인은 root가 별도 수행한다.

[source7 자원 계약](../14밸런스+수치테이블/LEVEL_UP_RESOURCE_REFRESH_20261003.md), [source8 특수 탄막 계약](../9적ai패턴디자인/SPECIAL_SHOT_CANCELLATION_20261003.md), [source6 이전 물리 후보](MAC_CH1_SOURCE6_CANDIDATE_20261003.md).

## 2026-10-03 source8 후속 정상 캐릭터·전사 이야기 부분 관측

root의 후속 실제 입력에서 월드 인트로 자연종료→DEMO 환영/입장→정상 전사 선택→이름 `맥검수8` 생성 UI→전사 이야기의 실제 자막·영상 재생을 관측했다. 개별 char-preview AX의 `미디어를 재생할 수 없습니다.`와 전사 story 영상의 실제 재생을 구분하며 전체 codec 불가로 확대하지 않는다. `02-warrior-story.png`는 589090B/SHA `6d2922a79c7a12256d94c7e853805ed21e22e1a50b133431358ddeaaf206604a`이며 ignored `tmp/mac-migration-runtime/continued-review-20261003/source8-native-play/`에 있다.

이야기 다음 버튼50이 자연 전환 중 사라져 stale 오류1이 발생했고 root가 새 AX를 취득해 정정했다. 게임 코드 오류 확정0이며 이야기 A 단축키1 뒤 AX 변화0, 그 이후 입장은 아직 인수하지 않았다. 실제 음향 청취0/보스방·사망·부활·재도전·장착·player 저장재실행·8카메라0/연결6단계 미완을 유지한다. 포장 상태 **PACKAGED_NOT_RUNTIME_ACCEPTED**와 [정확 물리·부분 native 보고](MAC_CH1_SOURCE8_CANDIDATE_20261003.md)를 유지하며 이 후속 관측은 문서 담당의 새 GUI 검사가 아니다. root예약6 범위·71→77예상/rootremaining0/worst85 basis는 변하지 않는다.

## root 후속 정상 게임 도입 관측

정상 캐릭터 생성/전사 이야기 자연 종료 뒤 고유3388의 `game.html?test=1&slot=demo&demo=1&story=warrior-v21`로 이동했고 네메시아 도입 대사를 실제 화면에서 관측했다(`03-game-entry.png`). 이 URL은 정상 UI 흐름의 결과이며 수동 stage/map/P/G 주입0이다. 도입 중 HUD의 0/0 placeholder와 AX의 숨은 사망 문구를 실제 사망으로 계산하지 않는다. Return 입력 뒤 AX 변화는 없었으며 아직 필드 전투·보스 사망/부활 인수는 아니다. 고정 source8와 자기 격리 profile만 사용한다.
