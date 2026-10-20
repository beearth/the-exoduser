# CH1-06 REPORT — si3 공통필드·둥지 compose

상태: **CH1-06 독립 구현·승인 후속 검증 확보 — 기술 BLOCKED 해소**. CH1·CH2 이식 전용 전체 회귀 실패0. 시각 판정 **FAIL**, Main 제품·실제 전투 미연결 범위는 유지한다.

## 기준·의존·소유권

| 항목 | 고정 근거 |
|---|---|
| 작업/브랜치 | ch1-06 / codex/ch1-06-20261020 |
| fetch 기준 | origin/main **26c050a99a711e793a6c2413395acda09b0c1614**, 요구된26c050a99 이상 |
| CH1-05 의존 | 승인 c13802c080b2aaef2f9885438ae88e214a84de27가 main에 없었다. 최신 main에서 --no-checkout·sparse worktree 생성 후 CH1-05를 정상 병합한 체크포인트 **908a79d5** 위에서 구현. 두 부모의 코드·기록을 보존하며 main에 push/merge하지 않음 |
| 최초 병합 조정 | 공통 추출기의 기존 CH2_SCHEMA·stage4·observeNative·장별 출력 검사 유지, CH1 stage2 확장 합침. 최초 a68294a5까지 CH2 제품 파일·테스트 변경0. 이번 후속 수정은 아래 명시 승인된 CH2 소유 테스트 1파일, 자기 독립 CH1 소비자의 상속 호환 1줄, 보고서·CHANGELOG |
| 승인 후속 기준 | git fetch 후 origin/main **6d987cb8a31d0aadd2b6a8cf1e9a781d1fb76d4d** 조회. 사용자 지시대로 같은 codex/ch1-06-20261020의 a68294a5에서 재개; main 추가 병합 없이 최신 game.html과 checkout 원문 SHA 동일 검증 |
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

## 최초 제출 검증 영수증 (a68294a5, 승인 전 이력)

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

## 사용자 승인·전후 단정·거부 검사 보존

2026-10-20 맥북총괄의 **“CH2 회귀의 stage2/3 거부 단정 두 줄 갱신을 승인합니다”** 판정에 따라 같은 브랜치 a68294a5에서 이어서 적용했다. 사용자가 CH2 테스트를 Mac Codex 소유로 확인했으며, 새로 실제 지원한 1장 stage2/3의 낡은 기대값 정정 범위다. Main·공용6·CH2 제품·맵·자산 변경을 추가하지 않았다. 전체 회귀 중 발견한 자기 CH1 독립 소비자 상속 호환 회귀는 아래 별도 1줄로 복구했다.

| 단정 / 파일 | 승인 전(a68294a5) | 승인 후 / 보존 증거 |
|---|---|---|
| test/fdgCh2Stage4Source.test.mjs CLI 미지원 stage | `['-1','2','3','5','6','7','8','9','04','4x']` 10건 | `['-1','5','6','7','8','9','10','35','04','4x']` 10건. 새 지원2/3만 허용으로 옮기고 미지원10/35 추가. 기존 나머지 값 거부·출력 byte 보존 동일 |
| 같은 파일 API 미지원 stage | `[-1,2,3,5,6,7,8,9,'4',4.1]` 10건 | `[-1,5,6,7,8,9,10,35,'4',4.1]` 10건. 음수·미지원5..9·문자열'4'·소수4.1 그대로 거부 |
| 새 허용 양성 계약 | stage2/3을 실제 지원해도 위 두 루프가 거부 기대 | stage2/3 API 및 CLI 출력 성공·동일 JSON, 독립 AST로 추출한 최신 원문 compose 전체·행·SHA256 일치, 타일/START/P3 값 검증 |
| 원본 stage2 근거 | 최신 main game.html **18178–18186** | penta_circle/eye_tree/flesh_ball·mega1, 200²/T40·최종 타일 SHA5b40eb67…·START4020/7420, holes13·총1000·분면250/300/250/200 |
| 원본 stage3 근거 | 최신 main game.html **18187–18195** | throne/bone_arch/flesh_maw·mega0, 동일 실제 타일 SHA·START, holes14·총1100·분면250/400/250/200. 최신 origin/main:game.html SHA4d911cdd…와 checkout 일치 단정 포함 |
| 추가 음성 계약 | 기존 CH2 출력 보호 유지 | stage2/3 각각 실제 CH2 si4 JSON 복사본 덮어쓰기 거부2건·byte 유지, stage0 전용 API가2/3 거부2건 추가 |
| 거부 검사 수 | 주요 stage 루프 CLI10+API10=**20건** | 주요 루프 **20건 유지** + 위 추가 음성4건 = 이 범위 **24건**. 기존 잘못된 seed5·보호 경로5·wrong-stage·외부schema·symlink 거부 모두 동일; skip/선별/우회0 |
| 차이 검증 | 156/158 두 줄이 최초 BLOCKED 원인 | 기존 CLI 테스트 본문은 두 목록 치환 외 byte 동일함을 자동 확인. 테스트 1케이스 추가, 최종 diff +31/-2. `approval-followup/rejection-audit.json`, `approved-test.diff` |

최초 BLOCKED 제출의 Node CH2 **17/1**·제안 patch·a68294a5 영수증은 이력으로 보존했다. 이 후속 승인이 해소하는 것은 소유 테스트 계약 충돌이며, 시각 FAIL·Main/World/HUD 제품 연결·CH1-07 미실행 범위는 바뀌지 않는다. 실행별 최신 수치는 아래 후속 검증 표에 기록한다.

## 전체 회귀에서 발견한 자기 CH1 소비자 상속 호환 복구

첫 후속 Godot 전체 실행에서 CH2-02는 **894단정/3실패**, isW/canMv/LOS 차이 **1976/3744/5**였다. 원본 oracle 생성기·stage4 JSON·CH2 소비자는 정상이며, CH1-05에서 자기 `native_ch1_area_world.gd`가 도입한 `_analytic_colliders` 캐시를 부모 `_ready()`에서만 초기화한 것이 원인이었다. CH2 독립 소비자는 이 클래스를 상속하되 `_ready()`를 자체 구현하므로 캐시가 빈 상태였다. 최초 실패를 `approval-followup/first-full-godot/ch2-02.*`에 보존했다.

| 자기 파일·위치 | 수정 전 → 후 / 근거 |
|---|---|
| godot/scripts/native_ch1_area_world.gd:is_wall_xy | `for c in _analytic_colliders:` → `for c in (_analytic_colliders if area_stage in [2,3] else bundle.colliders):` **1줄**. si2/3만 원본 double 복원 캐시 사용, si1·기존 상속 소비자는 CH1-04의 원래 bundle 직접 조회 계약 유지 |
| 원본 game.html31711 | isW는 타일뿐 아니라 실제 `_colObjs`의 circle/ellipse/rect를 검사한다. CH2의 원본52원 충돌을 생략해서는 안 됨. 기존894단정과10998/10998/400 질의 그대로 검증하며 음성 단정·허용 오차 수정0 |
| 경계 | 자기 독립 CH1 소비자만 수정. Main·공용6파일·CH2-02 소비자/테스트·공유 맵·원본 수정0. CH2 기대값 추가 조정0·비어 있는 캐시를 fixture에서 주입하는 우회0 |

기존 CH2-02 회귀가 실제 누락을 검출했고, 같은 검사를 통과시켜 복구를 검증한다. `collider-cache-diagnosis.json`·`standalone-compatibility-fix.diff`에 원인과 정확 diff를 남겼다.

## 승인 후속 전체 검증

후속 원로그: `/Users/fordeargamers/exoduser-wt/_out/ch1-06/approval-followup/`. `verification-summary.json`에 실행 argv·격리 디렉터리·종료값·단정 수·차이 수를 연결했고, stdout/stderr/engine 로그를 UTF-8로 보존했다. 아래 전체는 CH1·CH2 **이식 전용 회귀** 범위이며 웹 맵의 기존9실패·로비 QA-005 기존8실패와 구분한다.

| 후속 실행 | 실제 결과 |
|---|---|
| Node 전체 | **64/0**, skip0, CH1 6파일45케이스 + CH2 2파일19케이스. 승인 전 CH2 17/1 → 새 양성 케이스 포함19/0 |
| Godot CH1-01 | **63/0**, 격리 상수 디렉터리·skip0·실창 OpenGL Compatibility/Apple M5 Pro |
| Godot CH1-02 | **189/0**, 격리 상수 디렉터리·skip0·실창 OpenGL Compatibility/Apple M5 Pro |
| Godot CH1-03 | **75/0**, 격리 상수 디렉터리·skip0·실창 OpenGL Compatibility/Apple M5 Pro |
| Godot CH1-04 | **410/0**, 격리 상수 디렉터리·skip0·실창 OpenGL Compatibility/Apple M5 Pro |
| Godot CH1-05 | **1243/0**, 격리 상수 디렉터리·skip0·실창 OpenGL Compatibility/Apple M5 Pro |
| Godot CH1-06 | **1622/0**, 격리 상수 디렉터리·skip0·실창 OpenGL Compatibility/Apple M5 Pro |
| Godot CH2-01 | **362/0**, 격리 상수 디렉터리·skip0·실창 OpenGL Compatibility/Apple M5 Pro |
| Godot CH2-02 | **894/0**, 격리 상수 디렉터리·skip0·실창 OpenGL Compatibility/Apple M5 Pro |
| Godot EC2-01 CH2 소환 정책 | **7483/0**, 격리 상수 디렉터리·skip0·실창 OpenGL Compatibility/Apple M5 Pro |
| Godot EC2-02 CH2 생성자 정책 | **159902/0**, 격리 상수 디렉터리·skip0·실창 OpenGL Compatibility/Apple M5 Pro |
| Godot CH1·CH2 합계 | **172243/0** 단정, CH1 3602 + CH2/EC2 168641, 전10파일·종료0·ERROR0. 선택 실행0 |
| contracts / encounter | **5그룹/0**, **3그룹/0**, only[]·실패 단정0. contracts의 기본240FPS 설정 유지 |
| P3002 / P3003 | **298/0**, **43/0**, 기존 분모·거부 단정·skip0 유지 |
| 맵 Node 기존 기준 | **37개 / 28통과·9실패**, exit1 원문 유지. 이전 a68294a5 회귀와 실패 제목 동일, 새 실패0 (`map-baseline-comparison.json`) |
| 원본 질의·물리 | si1/2/3/4 원본 VM oracle 새 생성(6966/8262/8502/10998 질의와 각 LOS400), Godot isW/canMv/LOS·40000셀 physics/union 차이 모두0 |
| 실창 화면 유지 | si1·si3 각각1920×1080 8장, `approval-followup/si1-visual/`·`si3-visual/`. 최초 제출 동명16장과 SHA256 byte 동일. 시각 FAIL 유지·이번 승인으로 미술 변경0 |
| 보호·실행 | a68294a5 대비 Main·공용6·CH2 제품·공유 맵·원본 추가 변경0. CH2 테스트·자기 독립 CH1 소비자1줄·보고서·CHANGELOG 4파일만 수정. 매 Godot 실행 전 pgrep 기록, 2이상30초 대기; 매 override finally0byte, 노드 경로 명시 인자/UTF-8 파일 수집 |
| 진단 이력 | 최초 headless shader ERROR2는 미수정 이력으로 보존; 이번 전체는 실창 ERROR0. 기존 Camera2D interpolation·P3002 ObjectDB8 경고 보존. 로비 전체8실패는 사용자 고지 선재 결함·이번 미실행 |

`rejection-audit.json`으로 기존 CLI 테스트의 두 목록 외 본문 동일을 증명했다. `protected-followup.json`과 최종 diff는 CH2 테스트·자기 CH1 독립 소비자·문서의 네 파일만 변경됐음을 확인한다. 최초 BLOCKED 로그/영수증은 덮어 버리지 않고 `previous-*`로 보존했다.

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
| CAMERA QA | START/EARLY/ARENA/SIDE_L/SIDE_R/LANDMARK/LATE/EXIT 실창1920×1080·zoom1 PNG 각1장, visual/ 아래. 최초 작업자 전체8장 직접 검토; 후속 si1/si3 16장 byte 동일 확인 |
| TECH QA | route189·query/physics 차이0; 웹 pageerror/404 미실행. 실창 resource_errors[]/ERROR0, floor 단일mesh. fixture sweep96frames/1.569s는60FPS 제한 정지 검수이며 전투 FPS 아님 |
| FILES | 자기 stage3 tool/data/module/scene/test/53 byte 자산 + 기존 자기 standaloneconsumer/CH1 source 테스트만. CH1-05 선행 병합과 CH1-06 신규 diff를 구분. 공용6개·맵공유·CH2 제품0줄. 승인 후속에서 CH2 테스트 1파일만 +31/-2 |
| GIT | 정확 경로 stage·정상 pre-commit·자기 브랜치 push/remote SHA 확인 후 DONE.txt·자기 worktree 제거. 원로그·최초 제안 patch·후속 실제 diff 보존, main push/force/git add -A0 |
| VISUAL VERDICT | **FAIL** — 반복 패치·보라색 rim·넓고 빈 지면/바깥 검정, 조명/접지 그림자/전투 생동감 미연결. 원본 byte 참조 포트와 새 맵 룩 완성을 구분 |

최종 SHA·원격 일치·후속 검증 수치·worktree 제거 영수증은 원로그 DONE.txt/final-receipt.json이 기준이다. 최초 BLOCKED 영수증은 approval-followup/previous-DONE.txt·previous-final-receipt.json에 보존한다.
