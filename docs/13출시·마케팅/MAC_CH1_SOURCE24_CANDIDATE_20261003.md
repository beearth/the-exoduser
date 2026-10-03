# CH1-1 source24 Mac 통합 후보 — 패키지·타이틀 확인

> 실제 코드 checkpoint `9f9adc11ed36330cca8fc750ab94300a6f084054`. 이 문서는 포장·타이틀·HTTP 검수 계약이며 동일 후보의 CH1-1 플레이 전체 완료 선언이 아니다.

| 항목 | 정확 값 |
|---|---|
| job / port | `ecc7b214-401e-4dfe-b310-090d30a03e50` / `3399` |
| app | `/Users/fordeargamers/Projects/exoduser-migration-20261001/outputs/mac-package-ready/mac-packager-ecc7b214-401e-4dfe-b310-090d30a03e50/package/EXODUSER-ecc7b214-401e-4dfe-b310-090d30a03e50.app` |
| bundle | `com.exoduser.mac.ecc7b214-401e-4dfe-b310-090d30a03e50` |
| profile | `/Users/fordeargamers/Projects/exoduser-migration-20261001/outputs/mac-package-ready/mac-packager-ecc7b214-401e-4dfe-b310-090d30a03e50/user-state/profile` |
| saveRoot | `/Users/fordeargamers/Projects/exoduser-migration-20261001/outputs/mac-package-ready/mac-packager-ecc7b214-401e-4dfe-b310-090d30a03e50/user-state/saves` |
| lobby | `http://127.0.0.1:3399/index.html?demo=1` |
| runtime | NW.js0.111.2 / arm64 / Chromium148.0.7778.97 / embedded Node26.0.0 |
| 输入/포장 | selector7918(파생bootstrap2 포함), 기존runtime340. 승인된 무cleanup adapter execute1회·새plan/설치/다운로드0 |
| 원본 보존 | `node-main.js`/`package.json` 원본 불변. 파생 서버는 port3333→3399와 자체saveRoot만 치환/역치환원본exact. 파생package는 자체main/node-remote/profile 인자와 product_string만 적용 |

## 실제 코드·에셋 검증

| 파일 | bytes | SHA256 | 범위 |
|---|---|---|---|
| `game.html` | 4033818 | `17446b71830776091daf722b932e1fb6f47ac9c38f5383b78592ed267ad86a73` | source/stage/app/실제HTTP byte-exact |
| `game-easy-test.html` | 3911487 | `87f209ec34eb0fbf10ea39bb03a7f416f1e8d83759d28674af28c7c892c36d4f` | source/stage/app/실제HTTP byte-exact |
| `index.html` | 342119 | `1dd28cab162a4384ad84a356eb2c719940782005d20da1312d2857bc649615a7` | source/stage/app/실제HTTP byte-exact |


| 검증 | 현행 결과 |
|---|---|
| 실제 복사 | payload7916개를 stage/app 각각1회 SHA 대조. 각6645489253B, 전체 coverage/config정확. 예전 앱전체 재검사·원본7918재인벤토리0 |
| 실행파일 | main+helper4=5 MachOarm64·실행권한·runtime원SHA·plist executable/bundle ID 대조 |
| 콤보 수정 | source24는 본편/Easy 각+112B, `_sStats.comboMax` 초기0/기존처치 최대값갱신·클리어소비. 저장최고G.comboMax/HUD/사망화면과기존best기록 보존. source단계 신규10+기존점수6+fieldrestore34=50PASS; 이번 포장 단계 test반복0 |
| 복귀 계약 | capture/restore46 key와 현재_sStats/stageTime 유지. 현재stage콤보·사망누적을 진입전으로 되돌리지 않음. 보스사망 후 필드/열린게이트/몹진행을 보존하는 이전수정 포함 |
| 포함 이전 수정 | source23 jump 반경300/fan실제각, source22 조작안내/언어페이드, source21 미개봉상자 축출, source20 뇌전창MP50재검증, source19 CP preview복원, source18 projectilekbMult초기화 포함 |

## 실제 Mac 기동 근거와 미완 경계

| 단계 | 이번같은후보 증거 |
|---|---|
| 타이틀 | 새앱 최초 background기동1회. AX에서3399 lobby와 `아무 키나 눌러 계속`; JPEG2704×1696 실제육안확인 |
| HTTP | index/game/Easy/api슬롯 각200. 정적3응답 현재24원문exact. `api/slots={ok:true,slots:[]}`는 새서버파일슬롯목록이며 demo localStorage 저장검증이 아님 |
| 정상 시작·전투/루팅/장착 | 이번캐릭터0·GUIinput0, 미인수 |
| 4지역/보스문 | 미인수 |
| 보스 사망·부활·재도전 | 미인수 |
| 실제 저장/재로드·청취·CP화면 | 미인수 |
| 입력 대기 | 새 잠금해제 사용자회신 대기. AX focus/타이틀만으로 잠금해제·키보드전달 성공을 추정하지 않음. 입력·우회·P/G/저장주입0 |

실제 같은후보 요구사항은 [CH1-1 시연 마일스톤](../0마스터플랜/mac-resume-20261001/vscode-dispatch/MILESTONE-CH1-1-PLAYABLE-20261002.md), 콤보 공식은 [클리어 결과 source24 정본](../2게임디자인레벨디자인/클리어결과_점수랭크_20260930.md)을 따른다. source23 전조의 벽막힘 목표/실착지 괴리는 미해결이며 이번 콤보/패키지 작업으로 고쳤다고 주장하지 않는다. CH1 전체 기존 VISUAL RETOUCH와 이번native미인수를 유지한다. source50PASS/파일복사PASS/타이틀은 정상플레이·시각·청취 인수의 대체물이 아니다.

## 기존 실행본·사용자 상태 보존

| 실행본 | port | 이번 확인 |
|---|---|---|
| source11 | 3390 | 앱 존재/Info.plist ID/profile·save 메타, 원내용해시/내용읽기/입력0 |
| source15 | 3391 | 앱 존재/Info.plist ID/profile·save 메타, 원내용해시/내용읽기/입력0 |
| source16 | 3392 | 앱 존재/Info.plist ID/profile·save 메타, 원내용해시/내용읽기/입력0 |
| source17 | 3393 | 앱 존재/Info.plist ID/profile·save 메타, 원내용해시/내용읽기/입력0 |
| source19 | 3394 | 앱 존재/Info.plist ID/profile·save 메타, 원내용해시/내용읽기/입력0 |
| source20 | 3395 | 앱 존재/Info.plist ID/profile·save 메타, 원내용해시/내용읽기/입력0 |
| source21 | 3396 | 앱 존재/Info.plist ID/profile·save 메타, 원내용해시/내용읽기/입력0 |
| source22 | 3397 | 앱 존재/Info.plist ID/profile·save 메타, 원내용해시/내용읽기/입력0 |
| source23 | 3398 | 앱 존재/Info.plist ID/profile·save 메타, 원내용해시/내용읽기/입력0 |


정확한 옛 사용자 앱59376baf/08cac1ce 경로는 미확인(UNKNOWN)이며 추측경로조작이나전체스캔을하지 않았다. 보호67/manager4/사용자23WIP와 기존게임·세이브를 유지하고 새 job 아래profile/save만 앱이 생성했다. 서버·프로필 분리와 물리복사검증을 기존세이브 재로드성공으로 확대하지 않는다.

## 소유 영수증

| 원자료 | bytes / SHA256 |
|---|---|
| physical `/Users/fordeargamers/Projects/exoduser-migration-20261001/tmp/mac-migration-runtime/continued-review-20261003/ch1-source24-build/physical-receipt.json` | 28467 / `25285f0bdd1317a7c38b8646436b06a8ad2549bdfd7f34422cc65a2761a94441` |
| startup `/Users/fordeargamers/Projects/exoduser-migration-20261001/tmp/mac-migration-runtime/continued-review-20261003/source24-native-play/startup-receipt.json` | 3424 / `7c4f8f7109e6b4d19a72d2a5e9077eb26708ab64213638a7ff8e6c31bf8ca355` |
| 실제화면 `/Users/fordeargamers/Projects/exoduser-migration-20261001/tmp/mac-migration-runtime/continued-review-20261003/source24-native-play/01-title.jpg` | 818175 / `c5d82b5e8f8d4ba7c769eb7a9046a40d17713f18e26a0bb20751023f8d9583c2` |
| AX `/Users/fordeargamers/Projects/exoduser-migration-20261001/tmp/mac-migration-runtime/continued-review-20261003/source24-native-play/01-title-ax.txt` | 862 / `34f29fd8c2c8fcc2f7e9790858f8de230e3df56bafa9c068af1d0940345816ec` |

패키지 source는9f9adc11 code+test+docs checkpoint에 고정한다. 이 포장/기동 동기화 docs12는 원총괄 별도 한정commit/push/정확원격 SHA 영수증으로 보존한다. 삭제·cleanup·새팀·권한·인증·결제·게시0. 전문15팀의 후보/검사보고는 제품 완료 건수로 계산하지 않는다.
