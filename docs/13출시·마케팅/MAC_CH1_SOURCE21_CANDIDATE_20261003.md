# EXODUSER source21 Mac 검수 후보 — 실제 타이틀 기동 확인

source21 미개봉 상자 축출 수정, source20 뇌전창 MP 확정·focus 취소·장면 정리, source19 장비 CP 미리보기 및 source18 투사체 넉백 회수 수정을 포함한 별도 실행본이다. 코드와 docs 원격 복구점은 `97d5079b513bebce747899c734dadafd607af95e`. 기존 source17의 부분 플레이를 이 후보의 전체 검수로 합산하지 않는다.

| 항목 | 실제 확인값 / 인수 경계 |
|---|---|
| 고유 앱 | `/Users/fordeargamers/Projects/exoduser-migration-20261001/outputs/mac-package-ready/mac-packager-b4a3cf03-34d2-45ea-b2a7-a08bf94ca7d2/package/EXODUSER-b4a3cf03-34d2-45ea-b2a7-a08bf94ca7d2.app` |
| 식별·격리 | job `b4a3cf03-34d2-45ea-b2a7-a08bf94ca7d2`, bundle `com.exoduser.mac.b4a3cf03-34d2-45ea-b2a7-a08bf94ca7d2`, port3396. 전용 profile `/Users/fordeargamers/Projects/exoduser-migration-20261001/outputs/mac-package-ready/mac-packager-b4a3cf03-34d2-45ea-b2a7-a08bf94ca7d2/user-state/profile` 및 saves `/Users/fordeargamers/Projects/exoduser-migration-20261001/outputs/mac-package-ready/mac-packager-b4a3cf03-34d2-45ea-b2a7-a08bf94ca7d2/user-state/saves`. source20/3395·source19/3394와 source17/3393 포함 기존6검수 앱의 존재·plist ID·저장 디렉터리 metadata만 대조 |
| 코드3 | game.html: 4031787B / SHA256 72ff94e5ac078aaf336add39d01d6b2f78dd53ad685c9e25bce33435219f6ac9<br>game-easy-test.html: 3909066B / SHA256 65f97910a1f1e28d226c14d9f19963ea22766f0ae2ce8d3265ca08123702571f<br>index.html: 342119B / SHA256 1dd28cab162a4384ad84a356eb2c719940782005d20da1312d2857bc649615a7 |
| 입력·물리 복사 | frozen7918 입력과340 런타임을 기존 no-cleanup adapter execute1회로 검증. 파생 bootstrap2 제외7916 payload 파일을 stage/app에서 각각 SHA 전수대조1회, 각 사본 6645484801B. source→stage→app 코드3 byte-exact |
| 파생 bootstrap | 원본 node-main.js의 PORT3333→3396와 SAVE_DIR만 고유 job 저장경로로 변경, 전체 역변환 byte-exact. package main=`http://127.0.0.1:3396/index.html?demo=1`, node-remote loopback3396 두 주소, 고유 user-data-dir. 원본 package.json/node-main.js 변경0 |
| 런타임 | 기존 NW.js0.111.2 arm64/Chromium148.0.7778.97/Node26.0.0. main+helper4의 runtime SHA, Mach-O arm64, 실행mode와 plist ID5개 확인. 설치·다운로드0 |
| 실제 정상 기동 | 공식 cua.getApp(정확한 위 앱경로) 최초 background 기동 후 `127.0.0.1:3396/index.html?demo=1` 타이틀과 ‘아무 키나 눌러 계속’을 실제 AX/JPEG로 확인. JPEG2704×1696. GUI 키·클릭0, 캐릭터 생성0 |
| 전용 서버 | index.html?demo=1·game.html·game-easy-test.html·/api/slots 각각 HTTP200. 게임·index 응답3은 현재 source byte-exact. 최초 관측 2026-10-03T02:21:57.794391+00:00 |
| 저장 경계 | 고유 profile/saves 디렉터리 생성만 확인, 내용 읽기/변경0. 신규 /api/slots={"ok":true,"slots":[]}는 빈 서버파일 슬롯이며 별도 demo localStorage 저장 성공/실패 근거가 아님 |
| 기존 source 회귀 | source21 상자10PASS/원본6PASS4FAIL·boss34PASS, 양판AST JS12/JSON2·별도본편syntax1PASS. source20 뇌전창12/focus20·source19 CP14/source18 넉백8도 각각 당시 checkpoint 근거. 포장·기동에서 기존 검사를 반복하거나 native PASS로 계산0 |
| 미완 GATE | Mac 잠금해제 확인 대기. 정상 캐릭터 시작→전투·획득·장착→4지역/보스문 개방→보스 사망·부활→재도전, CP 실제 화면·저장 재개·청취/시각은 아직 미완. 잠금 우회·동일 입력 재시도0 |
| 보호·한계 | 보호67 hash 및 관리자 STATE/LOG4 보존. source17 paused 게임/source19 타이틀 앱·기존 사용자 게임/세이브 조작0. 과거 사용자 앱 UUID59376baf/08cac1ce의 정확 경로는 UNKNOWN이며 추측/검색으로 사용자 앱을 조작하지 않음 |
| physical 증거 | `tmp/mac-migration-runtime/continued-review-20261003/ch1-source21-build/physical-receipt.json`: 25173B / SHA256 77ebec96a8ad69f3624a5986a60c909c9216db4036b60f1e27b04794a78a7092 |
| 기동 증거 | `tmp/mac-migration-runtime/continued-review-20261003/source21-native-play/startup-receipt.json`, `01-title-ax.txt`, `01-title.jpg`. AX SHA256 351d65dfc6a5b4e51d82a1143dd6214ab84c3795edb5ee282f5febb591528f8e, JPEG SHA256 b521b4ca781d6c36e6e111bbceb4cba83f20187a4c1d0090fcda853e334ccb9c |

미개봉 상자를 마지막 축출 우선순위로 두는 수정이 소스 및 별도 Mac 실행본에 포함됐음을 확인한 상태다. 20상한 및 개봉보상의 기존 rarity축출은 유지하며 모두미개봉상자일 때 첫인덱스fallback으로20수렴한다. 실제 플레이 검수가 끝났다는 선언은 아니다. SKILL_LIST의600px/10초 설명 잔류는 별도 UI·번역 후속으로 유지한다.
