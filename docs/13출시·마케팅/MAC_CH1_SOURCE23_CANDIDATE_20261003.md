# EXODUSER source23 Mac 검수 후보 — 보스 전조 수정 포함

점프 착지 경고를 비행 전구간300px로 표시하고 fan 경고를 실제 발사각 `π×(.7+phase×.06)`에 맞춘 실행본이다. 이전 source22의 펫 조작 안내·상자 보존·CP·뇌전창·필드 사망복귀 수정을 포함한다. 코드·docs 원격 복구점 `216035ab68a86f673f63560112d6b683f1695104`. 다른 앱의 부분 플레이를 이 후보의 실제 전체 검수로 합산하지 않는다.

| 항목 | 실제 확인값 / 인수 경계 |
|---|---|
| 실행본 | `/Users/fordeargamers/Projects/exoduser-migration-20261001/outputs/mac-package-ready/mac-packager-f70852a9-594f-4de4-9313-bd28af78f80e/package/EXODUSER-f70852a9-594f-4de4-9313-bd28af78f80e.app` |
| 식별·격리 | job `f70852a9-594f-4de4-9313-bd28af78f80e` / bundle `com.exoduser.mac.f70852a9-594f-4de4-9313-bd28af78f80e` / port3398. profile `/Users/fordeargamers/Projects/exoduser-migration-20261001/outputs/mac-package-ready/mac-packager-f70852a9-594f-4de4-9313-bd28af78f80e/user-state/profile`, saves `/Users/fordeargamers/Projects/exoduser-migration-20261001/outputs/mac-package-ready/mac-packager-f70852a9-594f-4de4-9313-bd28af78f80e/user-state/saves` |
| 코드3 | index.html?demo=1: 342119B / SHA256 1dd28cab162a4384ad84a356eb2c719940782005d20da1312d2857bc649615a7<br>game.html: 4033706B / SHA256 82e87076d5c4e0045380d2a68b2a7305931b4b9f551151d75dd018f47179a468<br>game-easy-test.html: 3911375B / SHA256 fd01916afa9c2b9d1178cd3c4543d6ce39a23879485f54b42f03106c8410b110 |
| 입력·복사 | frozen7918 selector와 기존340 runtime 재사용, 변경 입력은 main/Easy2만. 승인 no-cleanup adapter execute1회. 파생bootstrap2 제외 payload7916을 stage/app에서 각각SHA 전수대조1회; 각 사본 6645489029B. source→stage→app 코드3 byte-exact |
| 파생 bootstrap | 원본 node-main.js PORT3333→3398 및 고유 saveRoot만 파생, 전체 역변환 원본byte-exact. package main=`http://127.0.0.1:3398/index.html?demo=1`, node-remote loopback3398 두 주소 및 고유 user-data-dir. 원본 package.json/node-main.js 변경0 |
| 런타임 | 기존 NW.js0.111.2 arm64 / Chromium148.0.7778.97 / Node26.0.0. main+helper4의 runtime SHA·Mach-O arm64·실행mode·plist ID5 대조. 설치/다운로드0 |
| 정상 기동 | 공식 cua.getApp(위 정확 앱 경로) background 최초 기동. 실제AX `127.0.0.1:3398/index.html?demo=1`·‘아무 키나 눌러 계속’ 및 JPEG2704×1696 타이틀 확인. 키/클릭0·캐릭터 생성0 |
| 전용 서버 | 최초 관측 2026-10-03T03:09:11.322896+00:00. index.html?demo=1/game.html/game-easy-test.html/api/slots HTTP200 각각 확인. 정적 응답3은 현재source byte-exact |
| 저장 경계 | 새 profile/saves 생성metadata 확인. 서버 최초 슬롯 `{"ok":true,"slots":[]}`는 빈 서버파일 슬롯이며 별도 demo localStorage의 저장 성공/실패 근거가 아님. 기존 저장 내용 읽기·쓰기0 |
| source 검수 | source23 실제분기 신규8 PASS(원본4 PASS/4 FAIL), 기존 관련4 포함12 PASS. 양판합산JS12(모듈4)·importmapJSON2 구문확인. 포장 시 기존검사 재실행0 |
| source 한계 | canMv 거부 시 jump 실제착지 e.x/y와 목표 jumpX/Y 중심괴리는 기존미완. fan120+stage×3 표식은 방향이며 전체탄 사거리 표시가 아님. 피해·수치·패링·좌표·타이밍·RNG·alpha 불변 |
| 실제 플레이 미완 | 잠금해제 확인 새답변 대기. 정상 캐릭터 시작→전투/획득/장착→4지역·보스문→보스 사망/부활→재도전의 동일후보 native 검수, CP 실화면·저장재개·청취·전투 가독성/성능 미완. 타이틀을 unlock/전체플레이 증거로 재사용0 |
| 기존 앱 보존 | source11/3390·15/3391·16/3392·17/3393·19/3394·20/3395·21/3396·22/3397 기존8검수 앱 존재·plist ID·profile/saves metadata 확인. 기존사용자게임/세이브 input0. 원사용자앱 UUID59376baf/08cac1ce 정확경로는 UNKNOWN; 추측조작0 |
| preflight 표기 | execute 전 draft의 source 숫자22를23으로 정정, 정정 전 원문은 preflight-label-before.json 보존. sourceCommit·code/asset pins·id/port는 동일, prepare 재실행0 |
| physical 증거 | `tmp/mac-migration-runtime/continued-review-20261003/ch1-source23-build/physical-receipt.json`: 27369B / SHA256 4a6a935cd01663bc3dffa6a44fa6fc58fe9c588dca9b425f8ca86018c2bc9abf |
| 기동 증거 | `tmp/mac-migration-runtime/continued-review-20261003/source23-native-play/startup-receipt.json`: 3424B / SHA256 6251725040fc838445cf4baefa6c7ee87fbc1b6b3109e0d6d0ff8285f1af5caf. AX SHA256 a2d433afb6c9f36b02e1aa943688c50a7323c6aed281ff4f76236713d3304546, JPEG SHA256 86fe65747d9b778803c4e24335b39fd08d03a7080a4613967d9400f371bb2dac |
| Git·보호 | 코드216035ab 복구점에서 docs15 완료 소유만checkpoint/push·원격 exactSHA 기록. 보호67 및 관리자STATE/LOG4 제외. 실제71+docs15+외부8max94, 소비된 수정항목 중복가산0 |

source23의 물리 패키지와 정상 타이틀 기동까지 확인한 상태다. 전체 CH1-1 시연 완료가 아니다. [전조 source 계약·§23 MAP PRODUCTION REPORT](../5.1임펙트디자인/CH1_BOSS_LANDING_FAN_TELEGRAPH_20261003.md)의 VISUAL VERDICT: RETOUCH를 유지하며 이번 포장으로 시각PASS 승격하지 않는다.
