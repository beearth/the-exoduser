# CH2-05 — si7 / 2-4 원본·독립 소비자

2026-10-20 / `codex/ch2-05-20261020` / L=`~/exoduser-wt/_out/ch2-05/`. **데이터 정합·독립 소비자 기능 검증, 화면 RETOUCH.** 깊이·조명 개선은 사용자 지시대로 MAPLOOK 과제이며 이번 단위에서 시각 완성으로 주장하지 않는다.

## 기준·의존·범위

fetch 최신 main=`2c3c211ff3c9e2be4e2754d608f9f0ea963588b2`. CH2-04가 아직 없어서 **`d4298e89dd4f1432a5fca94defd391f8ec075b2d` 끝에서 분기**했다(start.json). trace §4.5의 si7/2-4만 구현하며 si6 작업을 대신하거나 시작하지 않는다. CH2-04→03→02 및 CH1 파이프라인을 그대로 인수한다. 원격 ref 경합으로 최초 fetch1회가 실패했으나 정상 fetch 재시도 성공 후 기준을 확정했으며 reset/force는 없다.

worktree는 --no-checkout+sparse-checkout, 빈 index를 자기 HEAD로 read-tree -mu하여 필요한 경로만 받았다. R의 HEAD/branch/INDEX/WORK 및 타인 untracked는 보존한다. Main·공용 런타임·P2-006a·P3 owner·기존 source snapshot/asset/제품 map.json·원본 HTML/JS/PNG는0줄이다. map 공유 허용 변경은 두 추출기의 si7 지원과 기존 미지원 검사2행뿐이다. CH1-02 조건대로 원문 재추출·대상 한정·맵/지역/소환굴 회귀를 적용한다.

## 산출물·계약

| 파일 | 정확 범위 |
| --- | --- |
| godot/tools/export_ch1_area_source.mjs | 지원0/1/4/5에7만 추가. compose 부재·STG 선택을5/7에 한정, 원 함수/분기/값 수정0. si6/8/9는 미지원 유지 |
| godot/tools/export_ch2_area_resources.mjs | 지원4/5에7 추가. 기존 자동 배치·원 metadata/renderer·query 파이프라인 재사용, 기본4 CLI/출력 유지 |
| test/fdgCh2Stage4Source.test.mjs | 기존 미지원7 두 항목을 미지원11로 교체. 검사 개수·거부 조건·기존 기대 데이터 수정0. 신규 검사에 si7→si5 교차 덮어쓰기 거부 포함 |
| godot/data/ch2_map_source/si7.json | source schema v1/stage7,111872byte, SHA256 `048815d17a400309c4cfdab5b7f420b13c58c88fbb72738c9ed21a96a9d29ec4` |
| godot/data/ch2_map_source/si7_resources.json | resource schema v1/stage7,182350byte, SHA256 `042def098d26d9fd596b24b2c57f97118ad383113ea3b8863a62880f95612027` |
| godot/port_modules/ch2_map_source/stage7_contract.gd | 순수 read_area/validate_area. CH1 scalar/hash·CH2 공통 catalog/asset/rooms 재사용, si7 원문/굴/분모/RNG/부재 pin 검증. IO/Node/RNG 소비 없음 |
| godot/scripts/native_ch2_stage7_area_resources.gd | 기존 CH2 reader의 deep 비교 사용, stage7 계약+manifest SHA·이미지 byte/size 검증. ready scope si7_standalone_only |
| godot/scripts/native_ch2_stage7_area_world.gd | CH2-04 World subclass. 자기 stage7 reader/격리 _ready만 변경, 기존 바닥/props/light 수명·CH1 tile 물리·float64 query/swept fixture/BFS 재사용 |
| godot/scenes/ch2_stage7_area_preview.tscn | 독립 fixture scene. 실 Player·Main·진행 연결0 |
| test/fdgCh2Stage7World.test.mjs | 신규10건: source/native RNG·독립 AST/hash·CLI 거부·이전 source0/1/4/5와 resource4/5 전체 비교·원화byte·실효배치/렌더/충돌/IEEE754 |
| godot/tests/test_ch2_05_stage7_source.gd / test_ch2_05_stage7_world.gd | 순수 계약 음성검사365단정, 실제 GUI 독립 World2465단정. 자기 엔진 생성 UID5만 포함 |

새 원화/복사/재인코딩/AI bitmap0. 원문 asset byte만 참조한다. source CLI는 `<node-bin> godot/tools/export_ch1_area_source.mjs <root> <si7-output.json> --stage 7 --seed 20261020`, resource CLI는 `<node-bin> godot/tools/export_ch2_area_resources.mjs <root> <external-oracle.json> --stage 7`. 일치하는 stage 경로/schema만 쓰며 내부 evidence·symlink 조상·다른 stage/foreign schema를 쓰기 전에 거부한다.

변경 전 d4298e89 도구를 임시 UTF-8 module로 읽어 source0/1/4/5 및 resource4/5의 **bundle/raw/query/LOS 전체 깊은 비교 차이0**을 확인했다. 기존 artifact provenance를 다시 쓰지 않는다. 비교시 기록된 main/extraction 커밋들의 game byte가 동일한지 먼저 증명하고 그 provenance 필드만 정규화한다. 원래 없는 extraction_head를 만들지 않는다.

## 최신 원문·관측

최신 main game.html SHA256=`4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4`/65692행으로 CH2-04와 같다. source-summary.json 및 두 artifact에 모든 사용 symbol의 정확 line/end/SHA가 있다.

| 원문 행 | 관측·소비 |
| --- | --- |
| 14333,16633–16713 | 원 STG construction. 벌레굴 4구역/WORM NEST, 거대 알주머니, hell1/hellFloor3/chapter1/monLv200/isHellBoss=false. 보스 actor 구현 증거 아님 |
| 18118–18207,29556–29559,30042–30085 | compose key7·hand/path/empty가 원래 없음. null carrier+4개 undefined 경로 mask 유지. 초기 floorRLE[1,40000], 원 mkRng 지터/clamp 사용. si4 path·si6/5 굴 좌표 복사0 |
| 30218–30694,31564–31566 | 200²/T40/40000타일. 0/1/2/3/4=38986/36/3/0/975, SHA5b40eb67… 유지. START4020/7420, gate metadata x99..101/y5, exit3개/y7·center4020/300. code3타일0을 임의로 칠하지 않음 |
| 30486–30626,31029–31030,60697–60718 | 최종굴14/총1100, NW250/NE300/SW350/SE200. 원 seeded RNG14회/final3323445034, 최종 timer가 draw1..14를 순서대로 사용. 자연 브라우저 timer 아님 |
| 25733–26472,18486,18501–18504 | 원 initMapObjects/자동 배치 helper/metadata 후처리. 초기 gate4020/160 하나, 최종272=CH2 sprite271+보이지 않는 gate1. lore/breakable/altar/벽눈 최종0. m_c2eye20은 정적 눈 버섯이며 m_eye 벽눈과 다름 |
| 25873–25874 | generator14회 뒤 원 init의 Math.random 추가2회. altar 확률/방 선택 분기에 해당하며 최종 altar0. 실제 선택/배치 결과를0 그대로 보존 |
| 52385–52453 | 원 scale·중심 pivot·flip15·alpha·y순서. 정사각형235/keepAR36, light156의 radius80/색255·180·80/alpha=.3*(.15+sin(now/800+x)*.05)는 기존 CH2-04 소비자 그대로. 이 overlay는 MAPLOOK 광원/그림자/깊이 구현이 아님 |
| 31685–31687,31711–31712,31672–31681 | 원 analytic 원42개(gate중심4020/160·r100 포함), ellipse/rect prop0. isW/canMv4모서리/LOS16px sample·strict<·JS truncation 보존 |

14굴의 원 순서는 x/y:size/room/count로 `[3260/6740:.5/1/100,5900/7020:.3/1/50,2660/4940:.5/1/100,5020/5580:.3/1/50,3260/4900:.5/1/100,5900/3700:.5/1/100,1820/2940:.3/1/50,6220/1980:.5/1/100,3860/1500:.8/1/100,3780/6220:.3/1/50,3060/3420:.55/1/100,4820/1900:.8/1/100,4020/5540:.3/-1/50,4020/4140:.3/-1/50]`다. source-hole-timer-index.json에 원 timer index도 기록했다. 각 굴 alive0·timer·원 배열순·count/room/좌표를 순수 계약이 검사한다.

실효 type은 mush141/eye20/mini19/larva18/chitin17/glow15/p1 6/edgeSf5/pit5/edgeL4/p2 3/edgeLf3/p1b3/hive3/webp2/edge2/edgef2/webpf2/edgeS1/gate1(모두 원 m_c2 접두어, gate는 boss_gate_col)이다. 실제 쓰는 기존 CH2 이미지13개는 ground/minibug/mushroom_glow_01/toxic_mushroom/prop_webp/eye_mushroom/chitin_debris/prop_b/larva/prop_a/wall_edge_tile/pit_bugs/prop_hive다. 원본/Godot byte·SHA·size 일치, image_keying 전부 none. raw catalog47/meta77/asset 참조47은 최종 sprite 수와 구분한다.

tile1 36칸은 겹치지 않는4 RectangleShape2D로 덮고 실제 PhysicsPointQuery40000센터를 대조했다. prop 원42개는 **원 산술 질의**이며 Physics 원 노드 설치가 아니다(physical_prop_shapes=false). isW/canMv 각각10038=무작위6000+42원경계4032+특수6, LOS400. JSON 숫자 재해석에서1172입력이 round되므로 IEEE754 LE base64의 원 double을 사용했다. epsilon 조정 없이 세 query·tile union·실제 Physics 센터의 불일치 모두0이다.

## 실제 검사·운영

최종 Node 하니스는 `--node-bin`을 필수 인자로 받는다. 신규 World Godot 검사도 `--node-bin` 인자를 받아 **OS.execute argv로 실제 Node 원 VM을 실행**하고 그 결과를 외부 UTF-8 oracle에 쓴다. stdout/stderr Array를 `"\n".join`하여 oracle의 .node.log에 기록한다. 문자열 Array를 str()로 비교하거나 고정 OS node 경로를 제품/검사 코드에 넣지 않았다. 기존 manifest 재출력 없이 생성한 원 VM query만 GPU 검사의 oracle로 사용한다(node_oracle_exit_code=0).

Godot 매 실행 직전 지정 pgrep/wc, 2이상이면30초 대기/재검사. process-gate.jsonl에 실제 여러 대기와 count1 실행을 기록했다. 타인 프로세스 종료0·자기 실행 순차. 새 userdir EXODUSER-ch2-05-Isolated-20261020, 기존은 파일 상수(상수 없는 contracts는 신규 격리)다. override 매회 작성/finally0byte. 이전 IT-05 cache의 새 APFS clone만 써서 원 cache 쓰기0이다.

| L prefix | 실제 결과 |
| --- | --- |
| extract-source / extract-resources | 각exit0, 위 source/resource SHA·수치 |
| new-node-verified | 10/0·SKIP0, source/consumer·독립 원문 AST·보호/출력 거부·이전 전체 pipeline 비교 |
| new-source-godot | 365/0, 순수 API/동일raw참조/반복/입력불변·모든 hole/출처/asset 오염 음성·global RNG 소비0, Main0/World0/save0 |
| new-world-godot | 2465/0·exit0, 실제 GUI Apple M5 Pro/OpenGL, Node 원 VM exit0·원 query/물리 불일치0·BFS185·8뷰·왕복370점 |
| source-node / worlds-node | 39/0·14/0, 기존 CH1 source/CH2-01·03 source/CH2-02·04 consumer |
| asset-node / pit-node | 각6/0, 기존92이미지/8필드·pit/hand collider delta |
| map-node | 37건 중28통과/9실패·exit1. CH2-04의9개 전체 이름·순서 동일(map-failure-comparison.json). culling1·adapter pending2·Image없는 region VM6, 새실패0 |
| 기존 Godot | 각exit0. CH2-03 source344/0·CH2-01 source362/0·CH1 source63/0·75/0·정적World189/0·si4World894/0·si5World2086/0·contracts5그룹/실패단정0·굴298/0(SKIP0)·지역43/0. 기존 World query/LOS/물리 차이0 |

신규 검사는 최초 Node10/0·순수 Godot365/0·GUI2465/0으로 통과했다. 이후 커밋 뒤 source provenance를 재검사할 때도 extraction_head의 game byte 증명 후 provenance만 정규화하도록 신규 Node helper를 보강하고10/0 재확인했다. 원문 기대값/생성 결과를 통과용으로 수정하지 않았다. 최초 fetch ref 경합은 재시도했고 초기 no-checkout 상태의 파일 수0을 확인한 뒤, 편집 전에 sparse 파일을 채워3166개 보호 baseline을 다시 확보했다. Godot13실행 모두 SCRIPT ERROR/ERROR0이며 Camera2D interpolation/P3002 ObjectDB8 경고는 원 stderr에 남겼다. 알려진 실패·경고 원문은 삭제하지 않는다. 사용자 전달 “로비 전체 회귀 8실패(main에서도 동일, QA-005 진단 중)”는 이번 실행/수정 없이 기록한다.

## 화면·경계

L/captures/START,EARLY,ARENA,SIDE_L,SIDE_R,LANDMARK,LATE,EXIT.png가 각1920×1080 실창 viewport다. 중심 좌표는 CH2-04와 동일한4020/7420,3820/6220,4020/4820,2260/3420,5860/2980,4020/4020,4820/2020,4020/300이다. 카메라 명칭을 source 구역 데이터로 추가하지 않았다. START-1x(320²)/LANDMARK-1x(400×440)/EXIT-1x(400×320)는 sips로 원 pixel 크롭만 했고 원 screenshot SHA·좌표/명령은 capture-crops.json에 있다. 원 에셋은 읽기만 했고 screenshot은 Git에 넣지 않는다.

8뷰와3크롭을 직접 확인했다. 단일 반복 바닥·작은 장식의 성긴 배치·약한 공간 위계·접지감 부족은 남아 있다. LANDMARK 중앙 원화 실루엣/pivot는 보존됐으나 배경과의 깊이·광원 방향성은 없다. 원 수식의 반투명 원형 오버레이는 경계가 보이며 실제 부분 광원/접지 그림자가 아니다. SIDE/후반은 원 p1/p2/pit/web/hive가 원 위치에 있고, EXIT는 맵 바깥 공백과 임시3칸 목적지/diamond fixture가 보인다. **시각 판정 RETOUCH.** 원 데이터를 수리하거나 그림자/광원을 별도 중복 설치하지 않았다.

단일 continuous mesh 바닥은 기존 CH2-04 Godot 표현(modulate.82)이며 native pixel 동일성 false다. authored path 부재를 유지하고 si4 path/CH1 hill/64chunk를 복사하지 않는다. fixture는4px swept sample·반경12, BFS185점을 실제 통과하고 왕복370점 중94프레임(1535.442ms)을 렌더했다. tile 경계 왕복·재진입은 확인했지만 전투 FPS/streaming/60fps 안정성 측정은 아니다.

READY는 si7_standalone_only이며 Main/실P/적·보스/소환굴/지역진행/전환/full_stage_ready=false다. 알 파괴·구더기2~3 스폰 writer는 미인수/미확인이고 구현하지 않았다. 자연 브라우저 부트/pageerror/404·오디오·전체 환경/전투·PC 동등성도 미확인이다. 공용 연결을 요구하면 권위·입력 수명/진행/전환 접점만 보고하고 멈춰야 하며 이번에는 연결이 필요하지 않았다.

## MAP PRODUCTION REPORT — §23

```text
STAGE: CH2-05 / si7 source + standalone consumer, 데이터 정합 검증
MASTER: 원200²/T40·14굴/1100·분면250/300/350/200·STG7 거대 알주머니
OUTER MASS: exact tile1 36cell/4rect. CH1 hill/임의외곽/지형 새 제작0
LARGE: 원 CH2 p1/p2/pit/web/hive byte 참조13texture, 에셋 변경0
MEDIUM: 원271sprite/235square·36keepAR·flip15·중심pivot/scale/alpha/y-sort
GROUND: 기존 continuous repeat mesh, authored compose/path/hand 부재 보존
PLAYABLE: fixture BFS185/왕복370. Main/실P/적·보스/굴/지역/전환 미연결
LANDMARK: 중앙 원화·원 light156 overlay만. 새 깊이/부분광원 MAPLOOK 소관
CAMERA QA: 실창1920x1080 8뷰+1x crop3 직접검수, 반복바닥/성긴배치 RETOUCH
TECH QA: Node10/0·source365/0·GUI2465/0, query/LOS/40000물리 차이0
         기존 source39/0·consumer14/0·asset/pit각6/0·맵9선재동일
FILES: map 도구2파일과 기존 미지원 검사2행, 신규source/contract/consumer/tests
       자기UID5/docs2. Main·공용runtime/P2-006a/P3/기존snapshot/원본PNG0줄
GIT: 자기branch만 정상commit/push·원격일치/DONE 뒤 자기WT/cache 제거
VISUAL VERDICT: RETOUCH — 데이터 정합 단위, 시각 완성/제품 진행 승인 아님
NEXT PASS: 총괄 별도 배정. Main·공용 연결 요구 시 접점 보고 후 중단
```

기존 보호 baseline3166파일 중 허용된 기존 검사1파일(2행)만 변경, 나머지3165는 SHA 동일성을 확인한다. 유일한 기존 코드 변경은 허용한 map 도구2개다. 정상 훅·경로별 stage·자기 branch push/원격 SHA 일치 뒤 L/DONE.txt·submission-receipt.json을 쓰고 자기 sparse worktree/cache만 제거한다. branch·원로그·L/review 사본을 남기며 R 보존/제거 결과는 cleanup-receipt.json에 기록한다. main push/force/reset/git add -A/hook 우회0이다.
