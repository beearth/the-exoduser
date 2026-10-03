# EXODUSER source22 Mac 검수 후보 — 포장·타이틀 기동

펫 조작 안내가 현재 입력 모드·패드 Shift/R 재매핑·가시덫 슬롯에 맞춰 갱신되고 언어 변경 시 대사 fade를 보존하는 source22를 포함한 독립 실행본이다. 실제 코드·docs 복구점은 `9cab599f1f297133577b42e45ca001c34c255f96`. source21·source17의 관측을 이 후보의 플레이 완료로 합산하지 않는다.

| 항목 | 실제 확인값 / 남은 검수 |
|---|---|
| 실행본 | `/Users/fordeargamers/Projects/exoduser-migration-20261001/outputs/mac-package-ready/mac-packager-9170d8a4-2ede-48d8-a758-20fc5e8b3193/package/EXODUSER-9170d8a4-2ede-48d8-a758-20fc5e8b3193.app` |
| 격리 | job `9170d8a4-2ede-48d8-a758-20fc5e8b3193`, bundle `com.exoduser.mac.9170d8a4-2ede-48d8-a758-20fc5e8b3193`, port3397. profile `/Users/fordeargamers/Projects/exoduser-migration-20261001/outputs/mac-package-ready/mac-packager-9170d8a4-2ede-48d8-a758-20fc5e8b3193/user-state/profile`, saves `/Users/fordeargamers/Projects/exoduser-migration-20261001/outputs/mac-package-ready/mac-packager-9170d8a4-2ede-48d8-a758-20fc5e8b3193/user-state/saves` |
| 현재 코드 | index.html?demo=1: 342119B / SHA256 1dd28cab162a4384ad84a356eb2c719940782005d20da1312d2857bc649615a7<br>game.html: 4033695B / SHA256 a2ca5a8032717fceb3a1c19365da8596fdd722acd1b8d6cbf604a3f6a3e4597b<br>game-easy-test.html: 3911364B / SHA256 bdbc4d100ab24da792c79c64c1dac2a04bcbd3571f78432733952f4c9384a85e |
| 복사 확인 | frozen 입력7918·기존 런타임340의 승인된 no-cleanup adapter execute1회. 파생 bootstrap2를 제외한 payload7916 파일을 stage/app에서 각각 SHA 전수 대조1회, 각 사본 6645489007B. source→stage→app 코드3 byte-exact |
| bootstrap | node-main.js PORT3333→3397 및 고유 SAVE_DIR만 파생 변경, 전체 역변환 원본 byte-exact. package main=`http://127.0.0.1:3397/index.html?demo=1`, loopback node-remote3397·고유 user-data-dir. 원본 node-main.js/package.json 변경0 |
| 런타임 | 기존 NW.js0.111.2 arm64 / Chromium148.0.7778.97 / Node26.0.0. main+helper4 Mach-O arm64·실행mode·runtimeSHA·plist ID5 대조. 설치·다운로드0 |
| 정상 기동 | 공식 cua.getApp(위 정확한 앱 경로) background 최초 기동. 실제 AX의3397 URL·‘아무 키나 눌러 계속’ 및 JPEG2704×1696 타이틀 확인. 최초 HTTP 관측 2026-10-03T02:48:49.582279+00:00 |
| HTTP | index.html?demo=1·game.html·game-easy-test.html·/api/slots 각각200. 정적 응답3은 현재 source byte-exact |
| 저장 경계 | 고유 profile/saves 디렉터리 생성 metadata만 확인. 서버 신규 슬롯 응답 `{"ok":true,"slots":[]}`; 별도 demo localStorage의 저장 성공/실패를 증명하지 않음. 기존 저장 내용 읽기·수정0 |
| source22 검수 | 새 펫 presentation14 PASS(원본2 PASS/12 FAIL), 기존 대사·구문 포함26 PASS. Easy 기존 first-item 검사 통계 대역 누락만 보충. 양판 JS12/JSON2 구문 확인. 포장 시 기존 검사 재실행0 |
| 구현 한계 | 패드 동적 토큰은 Shift/쉬프트와 R만. KBM BINDS 전체 재매핑 지원으로 확대하지 않음. 가시덫 실슬롯0~3만1~4 또는 LT+A/B/Y/X, 미배치/잘못된 슬롯은 원문 유지. fade·timer·portrait·SFX·자원/전투 수치 보존 |
| 실제 플레이 미완 | GUI 키/클릭0·새 캐릭터0. 잠금해제 확인 답변 대기. 정상 시작→전투/획득/장착→4지역/보스문 개방→보스 사망/부활→재도전, CP 실제 화면·저장재개·시각/청취 전체 인수는 미완료 |
| 기존 앱 보존 | source11/3390·15/3391·16/3392·17/3393·19/3394·20/3395·21/3396 기존7 검수 앱 존재·plist·profile/saves metadata 대조. 사용자 원앱 UUID59376baf/08cac1ce의 정확 경로는 UNKNOWN; 추측 조작0. 기존 사용자 게임/세이브 입력0 |
| physical 근거 | `tmp/mac-migration-runtime/continued-review-20261003/ch1-source22-build/physical-receipt.json`: 26271B / SHA256 eda54d193e54c881174bb19fa326e860958ae690f6b5676d2710eb3dcee72103 |
| 기동 근거 | `tmp/mac-migration-runtime/continued-review-20261003/source22-native-play/startup-receipt.json`: 3571B / SHA256 7af9f575ca2c56c20c5870e43a3d68edf364add3567036d8dcd806a1f8904cd3. AX SHA256 4d616360e7484f215eeccf1332ef21dd70abe101e2708f16e8ddef7485618eee, JPEG SHA256 4f5495265376f25699660fccc15f19eb6e60582c84858a510785eac0dddd87d6 |
| 보존·소유 | 보호67 hash 보존, 관리자 STATE/LOG4는 해당 담당 소유로 root 변경/커밋 제외. 변경71+root docs14+외부8=최대93; root docs14만 완료 checkpoint |

물리 패키지와 타이틀 정상 기동을 확인했으며, 동일 후보의 실제 CH1-1 플레이를 완료했다고 선언하지 않는다. source17의 부분 전투나 다른 앱의 화면을 source22 native 인수 근거로 재사용하지 않는다.
