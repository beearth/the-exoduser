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
