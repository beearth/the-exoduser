# CH1-06 REPORT — si3 공통필드·둥지 compose

상태: **독립 구현·검수 확보 / BLOCKED — CH2 소유 테스트 계약 갱신 승인 대기**. 시각 판정은 별도로 **FAIL**이다. 전체 회귀 PASS·Main 제품 연결·1장 완성으로 보고하지 않는다.

## 기준·의존·소유권

| 항목 | 고정 근거 |
|---|---|
| 작업/브랜치 | ch1-06 / codex/ch1-06-20261020 |
| fetch 기준 | origin/main **26c050a99a711e793a6c2413395acda09b0c1614**, 요구된26c050a99 이상 |
| CH1-05 의존 | 승인 c13802c080b2aaef2f9885438ae88e214a84de27가 main에 없었다. 최신 main에서 --no-checkout·sparse worktree 생성 후 CH1-05를 정상 병합한 체크포인트 **908a79d5** 위에서 구현. 두 부모의 코드·기록을 보존하며 main에 push/merge하지 않음 |
| 병합 조정 | 공통 추출기의 기존 CH2_SCHEMA·stage4·observeNative·장별 출력 검사 유지, CH1 stage2 확장 합침. CHANGELOG는 최신 main 원문 뒤를 유지하고 선행 의존/CH1-05 새 절만 앞에 추가. CH2 제품 파일·테스트 변경0 |
| 지시서 | FDG_SOURCE_TRACE_MAPS_CH1_20261020.md:583–590. 다음 CH1-07은 Main/World/HUD 연결이므로 이 단위에 반입하지 않음 |
| 원본 | 최신 main game.html SHA256 **4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4**, 원본 함수 본문 수정/값 치환0 |
| 보호 | main/hud/world/player/native_normal_enemy_hurte/native_source_new_run_state 6개, map-source-adapter/export_world/map.json, game.html 등 기준 main과 동일. 공유 맵 재추출/변경0. Q/E·세이브/progress·적/보스/로비 owner 수정0 |
| 원로그 | /Users/fordeargamers/exoduser-wt/_out/ch1-06/ |

## 실제 원본 관측과 구현

| 필드 | 최신 원본 행 / 관측값 |
|---|---|
| compose | game.html18187–18195: lm throne(.50,.30,400), bone_arch(.22,.32,360), flesh_maw(.78,.32,320); mega[]; lgMul1.25/lgDist640/scMul.90/rim.22 |
| 공간 | empty(.50,.52,1200),(.50,.88,400),(.50,.12,400). groves 키 없음. 별도 미로·둥지 지형을 창작하지 않음 |
| selector/최종 타일 | 30042–30085·30218–30694 원문 실행. template RLE[1,40000]과 최종 G.map 구분. 200×200/T40; 0:38986,1:36,2:3,3:0,4:975 |
| 타일 SHA | 5b40eb67c1aa3fd6ad407f9af06db91f549456bcd9c7d91ed31265c5a3a3b87e |
| START/게이트/출구 | [4020,7420]; gate x99..101/y5, exit x99..101/y7. boss_gate_col [4020,160]을 원본 generator 결과에서 넘김 |
| P3 읽기 전용 값 | 14개 최종 hole, 총1100, NW/NE/SW/SE=250/400/250/200. source timer RNG14회(격리VM seed20261020), stage2/3 별도 context |
| initMapObjects | 25735–26471 실제 원함수 실행·메타 merge/occ 후처리·퇴역34개 exact Set 유지. 원함수에 phase 계측을 켠/끈 두 실행의 최종 오브젝트·충돌 동일 |
| 최종 오브젝트 | **288개**, SHA256 **bd2e323066c6020cba54960d71554c29c1d9f168dbf589e23599bddaeb1312f3**. source insertion→renderLayer/y stable sort까지 보존. gate는 최종 index2이며 앞의 두 원본 소품을 밀어내지 않음 |
| 실제 pass | large46 / landmark3 / mega0 / unique2 / provided_floor16 / scatter80 / normal140 / editor1. pure publication은8개 pass(mega 빈 배열 포함) |
| 현재 리소스 | 원본 PNG53개·35,635,014bytes를 ch1_si3 아래 그대로 복사. source/target SHA256·크기 동일. Sprite287, 숨은 시스템 collider1; floor-eye atlas12, hardAlpha34, magenta-key0, anchorBottom10, rotation13, flip55 |
| 충돌/질의 | 원본 analytic collider52(IEEE754 double 운반), tile1 exact rectangle4개/36셀. isW8502·canMv8502·LOS400 원본→Godot 차이 각각0. 40000셀 실제 physics center/union 차이0 |
| 독립 종주 | 반경12 fixture actor START→EXIT **189지점**, 실창 왕복378이동 검사. Main·실제 Player·소환굴·지역진행·적·보스·전환 연결0 |

새 stage3 extractor/자원 도구·si3 JSON 2개·stage3_composition·전용 preview scene·Node/Godot 테스트를 추가했다. 기존 독립 Resources/World는 명시 stage3 분기만 확장하며 기본 si1과 기존 si2 실행은 유지한다. 앞 CH1 소유 테스트의 미지원 인덱스는 지원 범위 바깥5로 옮기되 거부 검사를 삭제/skip하지 않았다.

## 검증 영수증

| 실행 | 결과와 한계 |
|---|---|
| 신규 Node | **8/0**, node-si3-cross-schema-final. 원본 재추출·순서/byte·determinism·IEEE754·장별 schema 출력 거부. 기존 CH2 si4 snapshot을 복사한 음성 fixture에 stage2/3 출력 시도→거부/원문 byte 보존까지 추가 |
| 신규 실창 Godot | **1622/0**, ERROR0, OpenGL Compatibility/Apple M5 Pro. 실제 Texture2D53개·SourceFloor/벽/props·질의·종주·8카메라·실제 hardAlpha shader 2×1 GPU probe |
| 예비 headless | **1235/0 단정**, shader_compiler.cpp:1329 custom_samplers ERROR2 발생 원문 보존. 렌더링 PASS로 세지 않음. 같은 실제 재질은 실창 shader probe/8화면에서 ERROR0 검증 |
| 앞 단위 Node | **31/0**: CH1-01·03·04·05 source/World. Node 신규 첫 초안6/2는 si2에서 남은 gate순서·mega 기대값을 실제 si3 원본 관측에 맞춰 교정했으며 로그 보존 |
| 맵 Node 기준 | **28통과/9실패/skip0**, 전체37·exit1. 기존 _moCull1/Image6/pending2 실패이며 수정/약화/임시 전역 주입0 |
| contracts / encounter | **5그룹/0**, **3그룹/0** |
| P3002 / P3003 | **298/0**, **43/0**, SKIP0; stage0 기존 owner·분모 유지 |
| CH1-01 / CH1-02 / CH1-03 | **63/0**, **189/0**, **75/0**. CH1-02 기존 canonical 이미지 등록4개 NOT_READY 원문 유지, 정적 byte 검증과 구분 |
| CH1-04 / CH1-05 | **410/0**(카메라8 포함), **1243/0**. si1 캡처8장 이전 CH1-04/05와 byte 동일. source oracle은 이번 최신 원본 실행으로 새로 생성 |
| CH2 추가 회귀 | **17통과/1실패**, node-ch2-02, skip0. stage4 데이터/byte/World/observeNative/기존0·1 출력 등 통과. 실패1케이스는 아래 두 줄의 stage2/3 거부 기대와 새 지원의 충돌 |
| 실행 규칙 | 하니스 --node 절대경로 필수 인자. stdout/stderr는 임시 UTF-8 파일로 수집하고 문자열 join으로 출력. Godot 실행 전 지정 pgrep/wc 기록·2이상30초 대기, 매회 격리 override 생성/finally0byte. 회귀별 파일 상수 userdir, 신규 EXODUSER-ch1-06-Isolated-20261020 |
| 기존 경고 | Camera2D interpolation·P3002 ObjectDB8 원문 유지. 최종 실창/기존 회귀 ERROR0. 사용자 고지 로비 전체8실패(QA-005)는 이번 미실행/수정0 |

원본 asset 90개 등록 후보 + 회귀가 실제 읽는 소수 원본 경로만 sparse로 받았다. Godot .godot cache/override·node_modules 원본 설치본 읽기용 symlink는 커밋하지 않는다. 원본 PNG/HTML/JS 바이트 수정0이다.

## BLOCKED — CH2 담당 계약 두 줄

Main/공용 runtime 연결은 필요하지 않았으나 공유 추출기 지원 목록과 다른 담당 테스트의 고정 거부 목록이 충돌한다. 이전 공통 지시의 **“공용 파일·다른 담당 소유 파일은 0줄”**을 따라 해당 파일은 바꾸지 않았다. 두 줄 갱신 여부만 사용자에게 확인 요청했고 승인 전에는 적용/전체 PASS 판정을 하지 않는다.

| 파일·줄 | 현행 / 필요한 변경 | 원본 근거·보존 |
|---|---|---|
| test/fdgCh2Stage4Source.test.mjs:156 | CLI unsupported 목록의 '2','3'을 제외. -1/5..9/04/4x 거부는 유지 | CH1 추적 문서§4.5/4.6이 stage2/3 새 CLI를 배정. 최신 game18178–18195 compose를 각각 실제 실행 |
| 같은 파일:158 | buildAreaSnapshot unsupported 목록의2,3만 제외. 나머지 타입/인덱스 거부 유지 | CH2 stage4 schema·자산·selector·observeNative·장별 출력 보호는 그대로. 신규 CH1 테스트에서 CH2 si4 파일로의 stage2/3 덮어쓰기 거부를 별도 확인 |

제안 diff만 원로그 `proposed-CH2-contract-update.patch`에 보존했다. 실제 CH2 파일 바이트는 main과 동일하다. 임시 호환 layer·테스트 선별을 전체 PASS로 포장하거나 지원을 숨기는 우회는 하지 않았다. 승인 없는 CH1-07 Main/World/HUD 연결도 진행하지 않는다.

## MAP PRODUCTION REPORT (§23)

| 항목 | 실제 관측 |
|---|---|
| STAGE / MASTER | CH1 si3 원본 공통필드·둥지 compose 독립 이식. 원본 silhouette·regions·main route·side spaces 변경0 |
| OUTER MASS | LEFT/RIGHT/TOP/SOUTH/major holes는 원본 그대로. 북쪽 화면의 빈 검정 바깥과 전경 질량 부족이 남음 |
| LARGE | 원본53PNG byte 참조. lm3/mega0/large46 실제 입력. 반복 지면 패치가 큰 덩어리로 읽힘 |
| MEDIUM | 원본 connections 유지, 별도 새 연결/접합 편집0. 지면 패치 가장자리 접합 미흡 |
| GROUND | 원본 soil+_soilEdgeA world mesh. chunk seam 생성0; 원화의 보라색 가장자리·규칙적인 지면 반복이 보임 |
| PLAYABLE | 원본 충돌·START→EXIT fixture 종주만 확보. arenas/travel/breathing/threat 배치 원본값 보존. 실제 적·보스·전투 가독성 미검수 |
| LANDMARK | primary throne(4020,2420), side bone_arch(1780,2580), flesh_maw(6260,2580) 실제 렌더. 원본 source nearFloor 결과이며 새 저작 배치 아님 |
| CAMERA QA | START/EARLY/ARENA/SIDE_L/SIDE_R/LANDMARK/LATE/EXIT 실창1920×1080·zoom1 PNG 각1장, visual/ 아래. 작업자 전체8장 직접 검토 |
| TECH QA | route189·query/physics 차이0; 웹 pageerror/404 미실행. 실창 resource_errors[]/ERROR0, floor 단일mesh. fixture sweep96frames/1.569s는60FPS 제한 정지 검수이며 전투 FPS 아님 |
| FILES | 자기 stage3 tool/data/module/scene/test/53 byte 자산 + 기존 자기 standaloneconsumer/CH1 source 테스트만. CH1-05 선행 병합과 CH1-06 신규 diff를 구분. 공용6개·맵공유·CH2 owner0줄 |
| GIT | 정확 경로 stage·정상 pre-commit·자기 브랜치 push/remote SHA 확인 후 DONE.txt·자기 worktree 제거. 원로그와 제안 patch 보존, main push/force/git add -A0 |
| VISUAL VERDICT | **FAIL** — 반복 패치·보라색 rim·넓고 빈 지면/바깥 검정, 조명/접지 그림자/전투 생동감 미연결. 원본 byte 참조 포트와 새 맵 룩 완성을 구분 |

최종 SHA·원격 일치·상태 BLOCKED·수치·worktree 제거 영수증은 원로그 DONE.txt/final-receipt.json이 기준이다.
