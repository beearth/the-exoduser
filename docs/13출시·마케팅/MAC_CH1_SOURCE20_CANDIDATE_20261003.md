# EXODUSER source20 Mac 검수 후보 — 실제 타이틀 기동 확인

source20 뇌전창 MP 확정 검사·focus 취소·장면 정리 수정, source19 장비 CP 미리보기 및 source18 투사체 넉백 회수 수정을 포함한 별도 실행본이다. 코드와 docs 원격 복구점은 `7d8b6b0236cdb504d90924dab4b30f9401dbb0ed`. 기존 source17의 부분 플레이를 이 후보의 전체 검수로 합산하지 않는다.

| 항목 | 실제 확인값 / 인수 경계 |
|---|---|
| 고유 앱 | `/Users/fordeargamers/Projects/exoduser-migration-20261001/outputs/mac-package-ready/mac-packager-63a5fffc-613c-4e30-a7c7-5ead3506e3b9/package/EXODUSER-63a5fffc-613c-4e30-a7c7-5ead3506e3b9.app` |
| 식별·격리 | job `63a5fffc-613c-4e30-a7c7-5ead3506e3b9`, bundle `com.exoduser.mac.63a5fffc-613c-4e30-a7c7-5ead3506e3b9`, port3395. 전용 profile `/Users/fordeargamers/Projects/exoduser-migration-20261001/outputs/mac-package-ready/mac-packager-63a5fffc-613c-4e30-a7c7-5ead3506e3b9/user-state/profile` 및 saves `/Users/fordeargamers/Projects/exoduser-migration-20261001/outputs/mac-package-ready/mac-packager-63a5fffc-613c-4e30-a7c7-5ead3506e3b9/user-state/saves`. source19/3394와 source17/3393 포함 기존5검수 앱의 존재·plist ID·저장 디렉터리 metadata만 대조 |
| 코드3 | game.html: 4031619B / SHA256 b30d400f9d85972ca5eb383097d52cb6fbd892ca0e4378982c4ef571f7f9bc99<br>game-easy-test.html: 3908898B / SHA256 8045309ba2c4985832cf1be579dea4d451fb0b207d598f9d3f0ec2b14df3b09d<br>index.html: 342119B / SHA256 1dd28cab162a4384ad84a356eb2c719940782005d20da1312d2857bc649615a7 |
| 입력·물리 복사 | frozen7918 입력과340 런타임을 기존 no-cleanup adapter execute1회로 검증. 파생 bootstrap2 제외7916 payload 파일을 stage/app에서 각각 SHA 전수대조1회, 각 사본 6645484465B. source→stage→app 코드3 byte-exact |
| 파생 bootstrap | 원본 node-main.js의 PORT3333→3395와 SAVE_DIR만 고유 job 저장경로로 변경, 전체 역변환 byte-exact. package main=`http://127.0.0.1:3395/index.html?demo=1`, node-remote loopback3395 두 주소, 고유 user-data-dir. 원본 package.json/node-main.js 변경0 |
| 런타임 | 기존 NW.js0.111.2 arm64/Chromium148.0.7778.97/Node26.0.0. main+helper4의 runtime SHA, Mach-O arm64, 실행mode와 plist ID5개 확인. 설치·다운로드0 |
| 실제 정상 기동 | 공식 cua.getApp(정확한 위 앱경로) 최초 background 기동 후 `127.0.0.1:3395/index.html?demo=1` 타이틀과 ‘아무 키나 눌러 계속’을 실제 AX/JPEG로 확인. JPEG2704×1696. GUI 키·클릭0, 캐릭터 생성0 |
| 전용 서버 | index.html?demo=1·game.html·game-easy-test.html·/api/slots 각각 HTTP200. 게임·index 응답3은 현재 source byte-exact. 최초 관측 2026-10-03T02:06:35.113400+00:00 |
| 저장 경계 | 고유 profile/saves 디렉터리 생성만 확인, 내용 읽기/변경0. 신규 /api/slots={"ok":true,"slots":[]}는 빈 서버파일 슬롯이며 별도 demo localStorage 저장 성공/실패 근거가 아님 |
| 기존 source 회귀 | source20 신규12PASS/원본4PASS8FAIL·focus20PASS·boss34PASS(새4/기존30), 양판JS12/JSON2. source19 CP14PASS/source18 넉백8검사도 각각 당시 checkpoint 근거. 포장·기동에서 기존 검사를 반복하거나 native PASS로 계산0 |
| 미완 GATE | Mac 잠금해제 확인 대기. 정상 캐릭터 시작→전투·획득·장착→4지역/보스문 개방→보스 사망·부활→재도전, CP 실제 화면·저장 재개·청취/시각은 아직 미완. 잠금 우회·동일 입력 재시도0 |
| 보호·한계 | 보호67 hash 및 관리자 STATE/LOG4 보존. source17 paused 게임/source19 타이틀 앱·기존 사용자 게임/세이브 조작0. 과거 사용자 앱 UUID59376baf/08cac1ce의 정확 경로는 UNKNOWN이며 추측/검색으로 사용자 앱을 조작하지 않음 |
| physical 증거 | `tmp/mac-migration-runtime/continued-review-20261003/ch1-source20-build/physical-receipt.json`: 24075B / SHA256 80b890c9e9be538f0afd070eb67bee1a107261d4f365649c8c733af9909b84a7 |
| 기동 증거 | `tmp/mac-migration-runtime/continued-review-20261003/source20-native-play/startup-receipt.json`, `01-title-ax.txt`, `01-title.jpg`. AX SHA256 f8d7732b0830ddc2f1b6e751085dd3575a5edaf45fb6840703d2dec516ffcff6, JPEG SHA256 06e574b29213cc46c3cae865a1c5a751c0a51621ed04e53d037e9ac23df850ae |

뇌전창의 확정·정리 동작이 소스 및 별도 Mac 실행본에 포함됐음을 확인한 상태다. 실제 플레이 검수가 끝났다는 선언은 아니다. SKILL_LIST의600px/10초 설명 잔류는 별도 UI·번역 후속으로 유지한다.
