# CH2-04 — si5 독립 소비자 기능 검증·화면 비교 자료

2026-10-20 / 작업ID ch2-04 / branch `codex/ch2-04-20261020`. 원로그 L=`~/exoduser-wt/_out/ch2-04/`. **독립 소비자 기능 검증 통과, 시각 판정 RETOUCH. 제품 Main·실제 전투·진행 연결 및 전체 에리어 완성의 증거가 아니다.**

## 기준·의존·범위

fetch 시 최신 origin/main은 `6d987cb8a31d0aadd2b6a8cf1e9a781d1fb76d4d`였다. 선행 CH2-03 `f918b9a93101d7d0e2100c9745abbb59d4da5d64`가 여기에 없어서 그 끝에서 분기했다(start.json). CH1-01~04와 CH2-01~03 파이프라인은 이 부모에 인수돼 있으며 별도 merge는 없다. 이번 번호는 사용자 최신 배정 “CH2-04, 예: si5 독립 소비자”를 따른다. 추적 문서 §4.3의 두 번째 작업이며 옛 §4.4의 si6 source 작업이 아니다. si6 이후에는 착수하지 않는다.

R=`/Users/fordeargamers/Projects/exoduser-migration-20261001`의 HEAD/branch/INDEX/WORK는 보존한다. --no-checkout + sparse-checkout으로 필요한 코드/docs/원문/기존 에셋 경로만 받았다. 공유 허용 변경은 CH2 resource exporter의 stage5 확장뿐이다. CH1-02 조건대로 파이프라인 재추출·기존 stage4 전체 비교·맵/지역/소환굴 회귀를 수행했다. Main/world/player/hud/native_normal_enemy_hurte/native_source_new_run_state·P2-006a·P3 owner·제품 map.json·기존 CH1/CH2 runtime/source snapshot·원본 HTML/JS/PNG는 0줄이다. 새 bitmap·에셋 재복사·재인코딩 0이다.

## 파일·파이프라인

| 파일 | 역할·경계 |
| --- | --- |
| godot/tools/export_ch2_area_resources.mjs | buildResources/writeResources에 stage4 기본값 보존, stage5만 추가. 동일 private native generator 후 원 initMapObjects/충돌 함수를 실행. 원 _SAME_TYPE_DIST/_nearbyTypeCount 사용, stub·원 함수 수정 없음 |
| godot/data/ch2_map_source/si5_resources.json | schema exoduser.ch2-area-resources.v1/stage5, 181872byte, SHA256 `6f969f193ac32c088682c014c17d0864805407aa6cc4d969f069c31b8dd9d7a1`. source/symbol 행·SHA·최종 배열/메타·실효 collider·byte 참조·정확 tile1 직사각형 |
| godot/scripts/native_ch2_stage5_area_resources.gd | 기존 CH2 readonly reader의 deep scalar 비교 재사용. stage5 순수 계약·자기 manifest SHA·12 texture byte/size pin 검사. 손상은 ready=false |
| godot/scripts/native_ch2_stage5_area_world.gd | CH2 소비자 subclass. CH1 타일 물리/float64 query/swept fixture/BFS, CH2 props/texture 수명 재사용. stage5 _ready/바닥/원 light 오버레이만 독립 구현 |
| godot/scenes/ch2_stage5_area_preview.tscn | 격리 userdir에서만 독립 preview, fixture는 실 Player가 아님. 신규 reader/world/검사 엔진 UID3 포함 |
| test/fdgCh2Stage5World.test.mjs | 원 VM 전체 재추출/기존 stage4 전후 전체 동등성/원화 byte/렌더 분기/정확 충돌/IEEE754/출력 guard |
| godot/tests/test_ch2_04_stage5_world.gd | 실제 scene/271 sprite/156 overlay·40000 물리 센터/원 VM 차등·BFS/fixture 왕복·reader 음성·8 GPU 뷰 |

CLI는 `<node-path> godot/tools/export_ch2_area_resources.mjs <root> <external-oracle-json> --stage 5`다. 기존 4인자 CLI와 기본 stage4 의미는 그대로다. 출력은 지정 si5_resources.json과 외부 oracle JSON뿐이며 root 내부 evidence·symlink 조상·다른 stage/foreign schema·미지원 stage를 쓰기 전에 거부한다. hand가 undefined인 원 snapshot은 수정하지 않고 실제 hand 보정 결과만 빈 배열이다.

신규 Node는 변경 전 `f918b9a9:godot/tools/export_ch2_area_resources.mjs`를 임시 UTF-8 module로 읽어 **stage4 bundle/queries/LOS/raw 전체를 깊은 비교, 차이0**을 확인한다. 기존 si4 manifest/source snapshot은 바꾸지 않았다. artifact provenance 비교 시 두 기록 커밋의 game SHA 동일성을 먼저 증명하고 main_sha만 정규화한다.

## 최신 원문 행·실제 관측

game.html은 최신 main과 같은 SHA256 `4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4`, 65692행이다. CH2-03 si5.json SHA `18bdcdbbe1ec4060fcdb10c00e7c0c9c95c2a2f5e78564efb67456145e6af246`도 그대로다.

| game.html 행·원문 | 실제 결과·처리 |
| --- | --- |
| 25733–25734 | 원 _SAME_TYPE_DIST와 _nearbyTypeCount. si4 hand 특례로 생략됐던 자동 배치 helper를 stage5에서 실행 |
| 25735–26472 | 원 initMapObjects 전체. 초기 MAP_OBJS=[boss_gate_col x4020/y160], 최종272개=CH2 sprite271+보이지 않는 gate1. hand0, source의 undefined/null 구분 유지 |
| 18486,18501–18504 | 원 CH2 metadata merge/occ-foot 후처리. 레이어 미정의는 undefined mask·원 기본0으로 소비. 임의 depth/충돌값 추가 없음 |
| 52385–52451 | sz=(meta.sz 또는32)*(mo.scale 또는1). keepAR 없는234개는 정사각형, keepAR37개는 이미지 비율. flip15개·중심 pivot·원 alpha/scale 유지. 이 seed에 sheet/trackEye/anim/filter/srcRect/rotation 특수 분기 없음 |
| 52453 | light156개: radius80, 색255/180/80, 실효 alpha=.3*(.15+sin(now/800+x)*.05). 자식 노드에서 원 수식 사용, sprite scale 역수로80 world px 유지. 엔진 clock·공유 RNG0, 브라우저 시계 위상/전체 광원 pixel 동일성 주장 없음 |
| 31685–31687,31711–31712,31672–31681 | 원 collider/isW/canMv/LOS 실행. analytic 원42개, ellipse/rect prop0. gate 원 중심4020/160·반경100 포함. strict <·JS truncation·4모서리/LOS16px step 보존 |
| 26517–26528 / CH2 catalog | 원 gt_ch2 및 실제 사용 이미지12개가 source/Godot PNG byte·SHA·size 일치. image_keying 모두 none, 메모리 원화 수정도 없음 |
| 30042–30694,31564–31566,60697–60718 | 원200²/T40·40000tile·START4020/7420·exit center4020/300. counts0/1/2/3/4=38986/36/3/0/975, tileSHA5b40eb67… 유지. 11굴/900·NW250/NE300/SW250/SE100는 데이터만 보존, 실제 owner 미설치 |

최종 type 수는 m_c2mush141, m_c2chitin21, m_c2eye20, m_c2larva19, m_c2glow15, m_c2mini14, m_c2p2 6, m_c2webp5, m_c2edgeSf4, m_c2p1 4, m_c2pit4, m_c2edge3, m_c2edgeL3, m_c2edgef3, m_c2p1b3, m_c2webpf3, m_c2edgeLf2, m_c2edgeS1, boss_gate_col1이다. m_c2eye는 정적 CH2 눈 버섯 장식이며 m_eye 계열 벽눈이 아니다. seed20261020에서 **lore/breakable/altar/벽눈은 최종0**이다. 가능한 분기를 실제 배치로 만들지 않았다. generator RNG12회 뒤 initMapObjects Math.random이1회 더 소비됐고 altar 후보는 거절됐다. private 원 RNG 관측이며 자연 부트 실측으로 확대하지 않는다.

36개 tile1은 겹치지 않는4 RectangleShape2D로 정확히 덮는다. Prop42원은 원 산술 query로 충돌하며 Physics2D 원 노드를 설치한 것이 아니다(physical_prop_shapes=false). PhysicsPointQuery40000개는 tile1 벽만 대상으로 했다. isW/canMv는 각각10038(무작위6000+원경계4032+특수6), LOS400을 원 VM과 비교했다. JSON decimal 재파싱 시1264개 입력이 round되므로 f64 base64 LE 입력으로 **원 좌표를 그대로** 전달하며 epsilon을 늘리지 않았다. 세 차등 불일치와 타일 union/실제 Physics 센터 불일치는 모두0이다.

si5에는 authored compose/path/hand가 없다. si4 path22나 CH1 polygon/hill/chunk를 복사하지 않는다. 바닥은 기존 CH2 texture를 한 world-space mesh에 repeat한 **별도 Godot preview 표현**(modulate.82)이다. 원 타일 code4·출구·게임플레이 데이터는 그대로고 pixel 동일성은 false다. gate는 보이지 않는 원 충돌 그대로다. 출구3칸 표시는 fixture 목적지 보조 표현이며 stage-cleared/전환/게이트 해제 writer가 아니다.

## 실제 검사·원로그

Node 실행 경로는 L/run_node.py의 외부 인자로 받는다. argv 배열/UTF-8 임시 stdout·stderr와 join/문자열 출력을 사용했다. Godot은 L/run.py로만 순차 실행했다. **매번 지정 pgrep/wc를 기록했고 count2를 관측한1회는30초 기다려 count1 확인 후 실행**했다(process-gate.jsonl). 타 프로세스 종료0. 신규 격리는 EXODUSER-ch2-04-Isolated-20261020, 기존 검사는 파일 상수(상수 없는 test_contracts는 신규 격리)다. override를 매회 쓰고 finally0byte로 비웠다. IT-05 cache의 새 APFS clone만 사용해 원 cache 쓰기0이다.

| L prefix | 실제 최종 결과 | 범위 |
| --- | --- | --- |
| extract-light | exit0 | 최종 manifest/oracle272개/42원/12texture/4직사각형 |
| new-node-verified | 7통과/0실패/0SKIP·exit0 | 원 VM/전체 재추출·render/light·기존si4 전체 깊은 비교·byte·출력 거부 |
| new-godot-verified | **2464단정/0실패**·exit0·SCRIPT ERROR0/ERROR0 | 실제 GUI Apple M5 Pro/OpenGL·12texture·sprite271/overlay156·차등/물리·BFS185·8뷰·왕복370점 |
| source-node + ch1-source-node | 30/0 +9/0 | CH2-01 11/CH2-03 10/CH1-03 9 + CH1-01 9. 첫 호출의 존재하지 않는 Stage0Source 경로는 집계되지 않아 실제 AreaSource9를 별도 실행,39건만 셈 |
| ch2-world-node | 7/0 | 기존 CH2-02 전체 자원/충돌/observer·원화 byte |
| asset-node / pit-node-final | 각6/0 | 기존92원화/8필드·기하·pit/hand collider delta. 최초 pit 단독2/0 중복 합산 없음 |
| map-node-final | **37건 중28통과/9실패**·exit1 | CH2-03 raw stdout의 실패9개 이름·순서 동일(map-failure-comparison.json). culling1·adapter pending2·Image 없는 region VM6. 새 실패0 |
| ch2-stage5-source-godot / ch2-source-godot | 344/0·362/0 | CH2-03/01 순수 계약 |
| ch1-source-godot / ch1-stage1-godot / ch1-environment-godot | 63/0·75/0·189/0 | CH1 순수/정적 World |
| ch2-world-godot | 894/0 | 기존si4, isW/canMv10998각/LOS400·40000 Physics/union 차이0 |
| contracts-godot | 5그룹/실패단정0 | 기존 전체 계약, 기본 실행상한 |
| spawn-godot / regions-godot | 298/0(SKIP0)·43/0 | 실제 GUI의 기존 P3-002/003 |

Godot 전 실행의 SCRIPT ERROR/ERROR는0이다. Camera2D interpolation·P3002 ObjectDB8 경고는 stderr에 보존했다. P3002 actor10/미이식158·P3003 full_fieldboss_combat=false 등의 범위는 그대로다. 사용자 전달 선재 원문 “로비 전체 회귀 8실패(main에서도 동일, QA-005 진단 중)”는 이번 재실행/수정 없이 기록한다.

초기 개발 이력도 남겼다. probe는 _nearbyTypeCount 의존 누락으로1회 실패 후 원 helper를 읽었다. 초기 자동 장식 AR 처리는 원 render branch에 맞게234 square/37 keepAR로 교정했다. 최초 Node6/1은 비격자 배치 가정이 실제 중심격자 관측과 달라 수정했다. 최초 Godot1929/1은 복사한 검사 숫자276의 중첩 치환으로126이 된 harness 오류였고 실제벽은4개/40000물리 차이0이었다. 검사만4로 교정한 GUI2307/0 뒤 원 light156개 누락을 전용 노드에 반영해 최종2464/0을 얻었다. 이전8뷰는 L/captures-sprite-only에 보존한다. 처음 선택한 별도 map-node 묶음의 실패도 남겼고, 비교용은 이전과 같은5파일 map-node-final37/9다. Pillow 부재는 sips로 대체해 screenshot만 원 해상도로 잘랐다. 문서 작성 stdin 인코딩 오류는 쓰기 전 종료했으며 doc-edit-01.stderr.log에 보존 후 apply_patch로 작성했다. 실패를 PASS로 바꾸거나 원본 값을 통과용으로 수정하지 않았다.

## 화면 검수·남은 것

L/captures/에 **START/EARLY/ARENA/SIDE_L/SIDE_R/LANDMARK/LATE/EXIT.png** 각1920×1080을 저장했다. START-1x.png(320²), LANDMARK-1x.png(400×440), EXIT-1x.png(400×320)는 리사이즈하지 않은 screenshot 크롭이고 좌표/원 캡처 SHA는 capture-crops.json에 있다. PNG는 Git에 넣지 않는다. 8뷰 중심은 차례로4020/7420,3820/6220,4020/4820,2260/3420,5860/2980,4020/4020,4820/2020,4020/300이다. EARLY/ARENA 등은 카메라 명칭이며 source 지명/구역을 추가한 것이 아니다.

| 화면 | 직접 확인·판정 |
| --- | --- |
| START/EARLY/ARENA | 원 장식/glow가 보이지만 동일 바닥 반복과 성긴 작은 sprite로 전진 방향·공간 위계가 약함 |
| SIDE_L/SIDE_R/LATE | 원 알/거미줄 prop가 있음. 표면 반복·공간 밀도·접지감 부족은 남음 |
| LANDMARK +1x | 중앙 skull/chitin 원화 실루엣·중심 pivot 확인. 큰 web 표면의 해상도 차이·접합·톤 통일은 RETOUCH |
| EXIT +1x | 맵 상단 밖 어두운 공백과 임시3칸 목적지/diamond fixture. 제품 portal·전환 연출 완료 아님 |

BFS185점을 fixture로 실제 통과했고 GUI 왕복370점 중94프레임을 렌더했다(최종1533.436ms). 한 continuous mesh라 chunk 교체가 없고 tile 경계를 지나 왕복·재진입했으나 짧은 fixture sweep은 전투 FPS·전체 streaming·60fps 안정성 증거가 아니다. 자연 브라우저 부트/pageerror/404·PC 화면 동등성·전체 애니메이션/후처리/오디오·실제 보스/스폰/굴/지역/저장/전환은 미확인 또는 미연결이다.

READY는 **si5_standalone_only**, main_bound/real_player_bound/spawn_holes_bound/region_progress_bound/transition_bound/full_stage_ready=false다. Main·공용 연결은 이번 구현에 필요하지 않아 하지 않았다. 후속 제품 연결을 요구하면 입력 수명/진행/전환 권위 인수가 필요하다는 사실만 보고하고 멈춰야 한다. 이 독립 소비자 PASS로 그 접점 인수를 대신하지 않는다.

## MAP PRODUCTION REPORT — §23

```text
STAGE: CH2-04 / si5 standalone consumer, 기능 검증·화면 비교 자료 준비
MASTER: defaultfloor/START4020·7420/EXIT4020·300/원272객체·42충돌 보존
OUTER MASS: 원 tile1 36cell=exact4rect, 임의 CH1 hill/바깥경계 추가0
LARGE: 원 CH2 p1/p2/pit/web byte 참조. 신규bitmap·위치/충돌 수리0
MEDIUM: sprite271·234square/37keepAR·원scale/pivot/flip/alpha/y-sort
GROUND: 단일8k repeat mesh, authored path 부재 유지; pixel 동일성 false
PLAYABLE: fixture BFS185/왕복370, 실P·Main·적/보스/굴/지역/전환 미연결
LANDMARK: 원 배치만. lore/breakable/altar/벽눈0, 원 light156 수식
CAMERA QA: 1920x1080 8뷰+1x crop3, 반복바닥·성긴배치·임시출구 RETOUCH
TECH QA: Node7/0·Godot2464/0. query10038각/LOS400/물리40000 차이0
         기존si4 전체차이0·맵9선재실패동일·지역43/0·굴298/0
FILES: shared CH2 resource exporter stage5, 신규data/reader/world/scene/tests
       자기UID3/docs2. 공용6/P2-006a/P3/기존snapshot/제품map/PNG0줄
GIT: 자기branch만 정상commit/push·원격일치/DONE 뒤 자기WT/cache 제거
VISUAL VERDICT: RETOUCH — 시각 완성·제품 플레이 가능 승인 아님
NEXT PASS: 총괄 별도 배정/화면 판정. Main·공용 연결 요구 시 구현 중단
```

실제 branch/SHA·원격 일치·수치는 L/DONE.txt와 submission-receipt.json, 제거/R 보존은 cleanup-receipt.json에 남긴다. 기존 보호3155파일 SHA를 대조하며 유일한 기존 코드 변경은 허용된 CH2 resource exporter다. 자기 worktree/cache만 제거하고 branch·원로그·최종 파일 사본 L/review를 남긴다. main push/force/git add -A/hook 우회0이다.
