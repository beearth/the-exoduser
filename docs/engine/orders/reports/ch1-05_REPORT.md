# CH1-05 — si2 공통필드·군락 source composition

**DONE — 원본 조립·독립 소비자 기술 범위.** 원본 `initMapObjects`의 si2 최종 결과를 새로 관측해 snapshot/리소스/순수 composition과 standalone scene에 연결했다. **완성 맵 시각 인수는 FAIL**이다. 제품 Main/World·실P·P3 소환굴/지역 진행·적/보스·전환은 미연결이며 `full_stage_ready=false`다.

## 기준·소유 경계

| 항목 | 실제 값 |
|---|---|
| 작업 / branch | `ch1-05` / `codex/ch1-05-20261020` |
| 시작 fetch main | `e556b617190c325ca39f5add04357f5dea5ca87e` |
| 기준 / 의존 | CH1-04 `5487245c3d857927cf8c0634d0ea5edb05650340`가 main에 없어 사용자 지시대로 그 끝에서 분기. CH1-01~04 계보 의존 |
| 진행 중 공용 ref 변동 | 다른 동시 작업이 공유 origin/main을 `8524bbbb444fe2e57ce25d773fae24b890747f4a`로 전진시킴. 시작 대비45경로 변경 중 game.html/maps_data.js/assets/map/CH1 외부JS 변경0. L/main-ref-advance*.json |
| 원본 HTML | 시작/후속 main/WT byte 동일, SHA256 `4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4`. 아래 행은 이 원문 그대로 |
| 추적 지시서 | `codex/trace-maps-ch1-20261020:docs/engine/FDG_SOURCE_TRACE_MAPS_CH1_20261020.md` §4.5/4.8, L/trace-order-reference.md |
| 최신 시각 정책 | main 전략 §8(L/latest-main-strategy.md): 맵 그림·조명·생동감은 Godot 직접 제작, 게임플레이 충돌/동선/스폰/지역은 원본 유지. 이 배정은 원본 조립 기술 단위이며 native 아트 완성은 별도 |
| WT / 로그 L | `~/exoduser-wt/ch1-05` / `/Users/fordeargamers/exoduser-wt/_out/ch1-05/` |
| sparse | `worktree add --no-checkout -b ... <5487245c>` → `sparse-checkout set --no-cone --stdin` → 새 빈 index만 `read-tree -mu HEAD`. 기존 선택109패턴+필요한 원본42경로만 추가=151패턴. assets 전체 checkout0, import 후 WT약1.5GiB |
| R | `/Users/fordeargamers/Projects/exoduser-migration-20261001`, HEAD `dd49171c5b88e211575a41f185395d6c0a14b184`, branch `codex/mac-live-play-time-main-20261017`; 시작 tracked INDEX/WORK clean. 최종 같은 상태 확인 |
| 보호 | 기존 선택 tracked1394파일 SHA 동일. 원본 HTML/JS/PNG, map.json, adapter/export_world, 기존 si0/si1 JSON·순수 contract·제품 공용6/P3 owner/적 factory0줄 |

CH1-02 조건의 공유 맵 변경 허용은 받았으나 **실제 공유 맵 변경0**이다. 자기 stage2 데이터·자산·신규 모듈/테스트와 CH1-04 standalone consumer의 명시 stage2 분기만 구현했다. 공용 연결이 필요하지 않아 이 기술 단위는 BLOCKED가 아니다. 순서안에는 CH1-06/07이 남아 있으며 다음 단위를 자동 착수하지 않았다.

## 구현·재추출 경로

| 파일 | 실제 구현 |
|---|---|
| `godot/tools/export_ch1_area_source.mjs` | 지원0/1→0/1/2, CLI `--stage 2 --seed 20261020`. stage2만 composition_raw/template RLE/source_state 추가. 원 selector→clone→generator→START→regionInit 원문 실행. 기존 stage0 wrapper는0전용, stage3거부/출력 경로·symlink 방어 유지 |
| `godot/data/ch1_map_source/si2.json` | 108195byte, schema ch1-area-source.v1/stage2. 원본 함수 행/SHA·40000tiles·rooms6·holes13/1000·4분면·compose·초기 generator object/state 기록. hand 미존재는 null carrier+undefined_paths=[/hand_props_raw]로 보존 |
| `godot/tools/export_ch1_stage2_resources.mjs` | 새 stage2 전용 파이프라인. 전체 원문 initMapObjects·metadata in-place merge/후처리·collision/isW/canMv/LOS/soilEdgeA 및 의존 _nearbyTypeCount/_SAME_TYPE_DIST/_tseed 실행. 원문 함수 body 치환0·전역 Math.random 호출 시 실패. 실제 init에서 전역 호출0, 원 _tseed 사용 |
| `godot/data/ch1_map_source/si2_resources.json` | 500553byte. 최종 objects292/payload/SHA, 원 삽입8패스/최종 정렬, retired34, props292, collider47·IEEE754 carrier, tile1rect4, 바닥mask40000, 자산51 원본 path/bytes/SHA/실 texture·표시분기 |
| `godot/port_modules/ch1_map_source/stage2_composition.gd` | 순수 validate/assemble/is_retired. source pin·grid/타일/START/게이트·holes/분모·compose·object payload hash·패스순서·retired·owner 미연결 검사. 패스별 원 삽입 데이터를 모아 layer/y/삽입 ordinal 안정 정렬로 최종 원본 순서를 재조립 |
| `native_ch1_area_resources.gd` | stage2 입력에만 새 composition 검증·51개 원본 byte/hash·실 Texture2D 읽기. stage1 경로·10자산 계약 유지 |
| `native_ch1_area_world.gd` | stage1/2 명시 분기, 다른 stage는 오류 반환하며 si1로 조용히 폴백하지 않음. stage2 Sprite2D291·초기 boss_gate_col을 포함한 analytic47·tile1 shape4 설치. 기존공용world 상속/호출0 |
| `godot/scenes/ch1_stage2_preview.tscn` | 자기 소비자 area_stage=2 명시 독립 장면. 실P 없이 fixture actor+카메라, WASD/화살표. 새 격리명 필수 |
| `godot/assets/map/ch1_si2/` | 최신 원본 **51PNG/34729509byte** 동일 복사, Godot 생성 import51. 새 그림·원본/복사 PNG의 픽셀 편집0. 후처리는 runtime 표시 셰이더만 |
| 신규 tests / UID | `test/fdgCh1Stage2Source.test.mjs`, `godot/tests/test_p3004e_ch1_stage2_world.gd`; 새 composition/test UID2만 포함 |
| 기존 자기 Node tests | CH1-01/03의 이제 지원되는stage2 음성 항목만 제거; stage2 양성/공유출력거부는 새 test에서 검증. CH1-04 archive 비교는 game byte 동일 확인 뒤 provenance main_sha만 분리. 게임 데이터·함수·자산 비교 삭제0 |

새 snapshot/resources의 source.main_sha=e556b617은 실제 첫 추출 시점 값이고 extraction_head=5487245c다. 후속 main ref의 이동을 감추려고 artifact 출처를 손 편집하지 않았다. 재실행 비교는 최신 main HTML byte와 보관 artifact game hash를 먼저 대조하고, 역사적 main_sha/extraction_head만 구분한다. 실제 데이터/함수·자산 hash 비교는 그대로다.

전체 `initMapObjects` 관측을 먼저 L/observe2.mjs와 source-init2-observation.json에 보존했다. VM Array.prototype.push의 반환/원 배열 연산을 유지하는 observer가 source caller line/순서를 기록하고 즉시 원형을 복원한다. observer 없는 별도 실행과 최종 object/payload/hash/collider가 동일함을 Node로 확인했다. 브라우저 전체 부팅·DOM·적 factory·저장 실행은 없다.

**G._isTileRLE=true, SI_TO_FLOOR[2]=2, generator의 초기 MAP_OBJS=[boss_gate_col(4020,160)]를 원 관측값으로 전달했다.** 이 상태는 자동 배치 밀도·editor 복원에 영향을 주므로 stage1 도구의 fresh MAP_OBJS=[] 가정을 si2에 재사용하지 않았다. 기존 CH1-04의 승인 snapshot/관측 범위는 바꾸지 않았다.

GDScript는 VM 관측 배치의8패스와 최종 publication을 소비한다. 배치용 RNG 알고리즘을 임의 재작성하지 않았고 **새 실시간 random placement 구현을 완료했다고 주장하지 않는다**. 원본 전체 배치 함수가 추출 파이프라인에서 실제 실행돼 고정 입력 결과를 생성한다. 순수 GDScript 조립은 RNG·IO·Node·상태 쓰기0이다.

## 최신 원본 값·순서

| 근거 행 / 항목 | 정확 값 |
|---|---|
| game30042–30085 /30135–30147 | FIXED_MAPS[0] clone, si2 template RLE=[1,40000]. legacy FIXED_MAPS[2] 복사나 버섯미로 새 설계0 |
| game30218–30694 | 최종200×200/T40, tile0/1/2/3/4=38986/36/3/0/975. SHA `5b40eb67c1aa3fd6ad407f9af06db91f549456bcd9c7d91ed31265c5a3a3b87e` |
| game31564–31566 /30335–30442 | START tile100/185→4020/7420. gate metadata99..101/y5, exit99..101/y7→중심4020/300. 실제 tile3은0, 강제 봉쇄/clear 위조0 |
| game30486–30626 /31030 | holes13/total1000, NW/NE/SW/SE=250/300/250/200. global seed20261020/14draws/final3323445034(timer 관측만) |
| game18178–18186 | lm3: penta(.72,.38,400), eye_tree(.74,.42,380), flesh_ball(.50,.62,520); mega1: head(.28,.35,980) |
| 같은 compose | groves(.28,.35,r900),(.72,.38,r900),(.50,.62,r800). empty(.50,.88,r420),(.50,.14,r380),(.50,.48,r700). lgMul1/lgDist720/scMul1 |
| 같은 compose | largeBias=m_ctree,m_flesh,m_penta,m_eye_tree; uni=flesh_ball,penta_circle,flesh_maw,eye_tree,skull_altar. 원 ID·순서 보존 |
| game17487 /31686 | retired Set34 정확 유지. prefix 필터 금지: m_flesh는 퇴역, m_flesh_ball/벽 변종은 별개. 실제292개 중 retired0, collision prefilter 원 함수로47개 |
| game25733–25734 /25735–26472 | 동일 타입 거리1200/nearbyTypeCount, spatial grid200, 원 floor/empty/grove/clearance·_nearFloor·scale 계산·최종 layer/y 정렬 순서 그대로 실행 |
| game18486 /18501–18504 | 원문 in-place merge/occ-foot 후처리. null carrier와 metadata_undefined_paths 함께 보존; 단순 object spread로 대체0 |
| game31685–31712 /31672–31681 | 원 collision prefilter/strict circle·ellipse/네 모서리 canMv/16px LOS. 소품 계수·쿼리 double은 IEEE754 LE base64로 전달해 JSON 실수 반올림 회피 |

| 원 삽입 패스 | source push 행 | 실제 개수 |
|---|---:|---:|
| large |25999|37|
| landmark |26032|3|
| mega |26055|1|
| unique |26151|5|
| provided floor |26188|16|
| scatter |26323|89|
| normal |26364|140|
| editor 복원 |26450|1|

합계 **292**. 최종 원문 MAP_OBJS JSON payload SHA256은 **`6a65accc4f2a42fa2bd55ed7844a61f497b360ca16dc69f453a4e832a9be4278`**다. 개수를 먼저 정해 맞춘 결과가 아니다. 삽입 순서와 최종 layer/y 안정 정렬을 분리해 기록·재조립했다. 최종 첫 object는 y160의 보이지 않는 boss_gate_col이며 나머지291개를 실제 Sprite2D로 표시했다. lore/breakable은 이번 결과0이다.

| 소환굴 순서 | x/y | size / room / count |
|---:|---|---|
|0|3300/7260|.5/1/100|
|1|5500/6500|.3/1/50|
|2|1620/5100|.5/1/100|
|3|6020/5300|.3/1/50|
|4|2860/3900|.5/1/100|
|5|5140/3700|.5/1/100|
|6|1740/2340|.3/1/50|
|7|6180/2180|.5/1/100|
|8|3780/6220|.3/1/50|
|9|3060/3420|.55/1/100|
|10|4820/1900|.8/1/100|
|11|4020/5540|.3/-1/50|
|12|4020/4140|.3/-1/50|

### 실제 표시·충돌 소비

source renderer의 분기 순서를 따랐다(game52392–52449). non-keepAR flip→meta rotation→eye atlas→keepAR 순이며, **회전이 keepAR보다 먼저**라 grootr는600²/-7°, gbattler는640²/+9°다. 실제 flip68/rotation7/anchorBottom15/eye atlas13/hardAlpha25/mega magenta-key1을 검사했다. default pivot(.5,.5), 원 source size/scale·하단 앵커를 소비하며 stage0 tree .72/pivot.72 분기를 si2로 복제하지 않았다.

눈3종의 현재 texture는 등록 PNG 대신 원 `_floorEyeImg.src`(game11963)의 `assets/map/eye_bloodshot_8dir.png`40²×9 atlas다. frame map=[3,4,5,6,7,8,1,2],1600거리² 기준을 fixture 위치로 소비한다. 원본 `_hardAlphaSpr`/`_keyMagentaSpr`(18427–18445)는 **픽셀 처리→native 선형 보간** 순서의 texelFetch 셰이더로 구현했다. PNG 저장/가공0. 실제 view material을 별도2×1 메모리 fixture로 검사한 readback은 hard/key 모두 RGBA≈(.5137255,0,0,.5137255)다. 이 fixture는 실제 게임 스크린샷8장과 별개다.

벽은 최종 tile1의36셀을4개 RectangleShape2D([90,13,3,3],[110,13,3,3],[90,23,3,3],[110,23,3,3])로 exact union한다. 40000센터의 실제 Physics2D 조회 오차0. 소품47은 원 analytic query만 소비하고 **Physics2D prop shape를 설치하지 않았다**. 따라서 CharacterBody2D/적 전체 물리 통합과 같다고 주장하지 않는다. fixture는 swept4px/반경12 네 모서리 canMv를 쓰며 START→EXIT BFS edge도4px 간격으로 검사한다. stage0 hill/64청크·si1 vista 복제0이다.

## 실행 결과·회귀

매 Godot 실행 전 지정 pgrep/wc를 확인했고2개 이상이면30초씩 대기했다(L/godot-capacity.log). 자기 작업 외 프로세스 종료0. suite별 실제 상수 격리명을 override에 매번 쓰고 finally0byte로 비웠다. argv/실행경로/HEAD/main/격리명/exit/seconds/stdout/stderr는 L의 각 result/log에 보존했다.

| suite | 실제 최종 결과 |
|---|---|
| 신규 Node |8/0, new-node-final.*,14.123s |
| 신규 Godot headless |1243/0, new-godot-complete.*,18.542s |
| 신규 최종 GPU |**1635/0**, camera8-alpha-final.*,Apple M5 Pro/OpenGL3/Compatibility,23.589s. headless 공통 검사+8화면+왕복 이동+alpha 순서 pixel probe2 포함 |
| CH1-01 Node / Godot |9/0 /63/0 |
| CH1-02 Node / Godot |6/0 /189/0 |
| CH1-03 Node / Godot |9/0 /75/0 |
| CH1-04 Node / Godot GPU |5/0 /410/0.8PNG 모두 이전 CH1-04 최종본과 byte/hash 일치(L/stage1-visual-regression.json) |
| P3001 관련 Node |source pit+hand collider delta6/0 |
| test_contracts 전체 |5그룹/단정 실패0 |
| p3002_spawn_holes |298/0,SKIP0,6그룹 |
| p3003_regions |43/0 |
| encounter_factory 전체 |3그룹/단정 실패0 |
| 맵 Node 기존5파일 |37중28통과/9실패. 기준과 실패명 동일·새 실패0 |
| 최종 import |exit0/ERROR0, import-final.*,2.303s. 신규 test UID 실제 생성 |

원본 isW8262/canMv8262/LOS400 모두 **불일치0**. START4020/7420→EXIT4020/300의 BFS191지점 실제 fixture 종주 성공, generator boss_gate_col 중심 진입 거부. 최종 GPU에서 왕복382회 이동·96렌더프레임/1570.144ms를 관측했다. `--max-fps 60` 아래 짧은 fixture sweep이며 전투 FPS 평균/최저·장시간 성능 인수가 아니다.

최종 Godot/GPU/회귀 로그에서 ERROR/SCRIPT ERROR0, resource_errors=[]/texturemissing0/51texture loaded. Camera2D physics interpolation 경고와 기존 P3002 ObjectDB8 누수 경고는 남는다. P3002의 unported_spawns158, P3003 full_fieldboss_combat=false, CH1-02 source registry4 NOT_READY도 완성으로 바꾸지 않았다. P3-002 STAGE 상수(파일37행)=0 유지: si2 소환굴·적 factory 지원/실행은 이번에 연결하지 않았으므로 **NOT_READY(owner_unbound)** 범위다. 기존 제품14/168·시작HUD0/32 보존.

### 실패·수정 원문 보존

- 신규 Node 최초7/1: macOS 임시경로의 /var symlink를 기존 CLI 방어가 거부. 테스트가 실제 임시경로를 realpath로 지정하도록 수정, symlink 방어 유지. 이후8/0.
- CH1-04 Node 최초4/1: 공용 origin/main이 진행 중 전진해 archive의 source.main_sha만 다름. game byte·실제 값 동일을 확인하고 출처 ref만 분리한 뒤5/0. 변경 값 비교를 제거하지 않았다.
- Godot 첫 계약 거부 뒤 테스트가 props를 읽어 SCRIPT ERROR/종료 누락. 자기 new-godot PID80536만 SIGTERM(-15/69.345s)으로 정리하고 fail-fast 추가. 다음 guard run이 source_grid 거부를 출력. JSON 숫자 float와 Dictionary int literal의 비교 문제를, **epsilon 없이 숫자 값/엄격한 bool·문자열·키를 재귀 비교**하도록 수정했다.
- 중간 Godot1242단정/0실패였으나 잘못된 base64 음성 입력에서 엔진 ERROR1. 이것을 전체 PASS로 인정하지 않았다. 길이64/허용문자를 먼저 검사하도록 고쳐 최종 headless1243/0·ERROR0.
- 최초 표시 셰이더의 key-after-filter 순서를 검토 중 발견해 source key-before-filter로 고침. 최종GPU1635에 실제 material pixel 검사2 추가. 원본 PNG alpha 관측도 L/source-hardalpha-inspection.json에 보존. source byte/기하/배치 변경0.

이전 사용자 제공 선재 결함 원문: **“알려진 선재 결함: 로비 전체 회귀 8실패(main에서도 동일, QA-005 진단 중)는 원문만 기록.”** 이번 로비 전체 회귀 새 실행/수정0. 실패 초기 stdout/stderr와 후속 성공 로그를 모두 남겼다.

## 8카메라·시각 판정

최종 L/camera8-alpha-final의 실제 GPU PNG8개를 각각 열어 확인했다. fixture pixel probe는 이8장으로 세지 않는다.

| 카메라 | world center | 관측 |
|---|---|---|
| START |4020/7420|하부 빈 공간, 반복되는 큰 ground decal과 보라색 가장자리 |
| EARLY |4020/6340|기본 개활 필드, 겹친 ground/scatter 접지와 반복 패턴 노출 |
| ARENA |4020/4980|flesh_ball 중심과 넓은 원본 전투공간, billboard 간 스타일/접지 불일치 |
| SIDE L |2260/2820|원 mega head980과 grove 중심, 소품 주변 조명·접지 부족 |
| SIDE R |5780/3060|penta landmark400, 반복 바닥 패치·외곽 경계색 |
| LANDMARK |5940/3380|eye_tree380, 시각적 우선순위·작은 부유 소품 가독성 부족 |
| LATE |4020/1820|반복된 patch/skeleton류, 단조로운 개활 silhouette |
| EXIT |4020/300|원본 상단 지도 경계/바닥 fade, 목적지3tile·fixture 도달. transition/clear 발생0 |

**VISUAL VERDICT: FAIL — 완성 맵 아트 인수 기준.** 가이드 §22의 반복 asset·빈 외곽·단조로운 geometry/스티커 구조 문제가 보인다. 원본 배치/타일/부딪힘을 바꿔 수치를 맞추거나 원본 PNG를 재가공하지 않았다. 이 기술 단위의 source contract/standalone 소비 완료와 완성 맵 인수는 다르다. PoE2/No Rest 목표의 native 외곽 mass·지면 통합·조명/생동감·전투 가독성은 시각 담당 후속 제작이 필요하다. 살아 있는 적처럼 보이는 작은 그림도 여기서는 원본 장식 Sprite이며 AI actor가 아니다.

기술 seam은 한 world-space floor mesh라 청크 교체/틈이 없고 실제8화면에서 resource 누락/빈 타일은 없었다. **타일/데칼의 반복 seam·보라색 alpha 경계·패치 접합은 그대로 남는 시각 결함**이다. 96프레임 sweep 전수 영상을 수작업 인수하거나 전체 브라우저 living/postprocess 픽셀 parity를 검수한 것은 아니다.

## 재현·종료

```sh
node godot/tools/export_ch1_area_source.mjs "$WT" "$WT/godot/data/ch1_map_source/si2.json" --stage 2 --seed 20261020
node godot/tools/export_ch1_stage2_resources.mjs "$WT" "$L/source-queries.json"
node --test test/fdgCh1Stage2Source.test.mjs
# 매 Godot 전 capacity 확인 + 해당 suite override, 종료 finally에서 비움.
"$GODOT_BIN" --headless --path "$WT/godot" --script res://tests/test_p3004e_ch1_stage2_world.gd -- --oracle="$L/source-queries.json"
"$GODOT_BIN" --path "$WT/godot" --rendering-method gl_compatibility --resolution 1920x1080 --max-fps 60 --script res://tests/test_p3004e_ch1_stage2_world.gd -- --oracle="$L/source-queries.json" --capture="$L/camera8-alpha-final"
# 동일 격리 override에서 수동 scene:
"$GODOT_BIN" --path "$WT/godot" res://scenes/ch1_stage2_preview.tscn
```

WT=/Users/fordeargamers/exoduser-wt/ch1-05, L=/Users/fordeargamers/exoduser-wt/_out/ch1-05, GODOT_BIN=/Users/fordeargamers/.codex/tools/godot-4.7.2/Godot.app/Contents/MacOS/Godot. 신규 격리명 EXODUSER-ch1-05-Isolated-20261020, 기존 suite는 각 실제 상수 이름 사용. acorn은 기존 R 설치본의 ignored 링크로 read-only 참조.

정확 경로 stage→정상 pre-commit docs-sync hook→자기 branch 비강제 push→원격 SHA 일치→L/DONE.txt 작성→자기 WT만 worktree remove --force. branch·원로그·보고서 사본 유지. 실제 SHA/원격·R/INDEX/WORK 보존·삭제 확인은 L/final-receipt.json/cleanup.json/DONE.txt에 기록한다. main push/merge·force·git add -A·배포0.

## MAP PRODUCTION REPORT — §23

| 항목 | 이번 결과 |
|---|---|
| STAGE | CH1 si2 원본 공통필드·군락 composition/독립 소비자 기술 단위. 제품 진입·진행 전 단계 |
| MASTER | 원본200² 공통 필드·rooms6·START→EXIT·groves3/empty3 보존. 새 미로·geometry 설계0 |
| OUTER MASS | LEFT/RIGHT/TOP/SOUTH의 원본 경계/상단 pillar36셀만 유지. 빈 외곽 native 아트 미제작, major holes 임의 보충0 |
| LARGE | 원본 asset51·실제원본object292/Sprite291, lm3/mega1. source scale/overlap 보존. 반복 실루엣/스티커 구조가 시각 FAIL |
| MEDIUM | 원문 empty/grove/clearance·원 삽입8패스/최종정렬 유지. 접지/연결 미술 미완 |
| GROUND | soil world-space mesh·source alpha mask, hard/key 픽셀 처리 후 native 보간. 반복 decal/보라색 경계·shadow/contamination 통합 미완 |
| PLAYABLE | source circle/ellipse47·tile1 exact union4rect, fixture BFS191/왕복382 성공. arenas/travel/breathing 원값. threat/AI0·실전투 가독성 미검증 |
| LANDMARK | penta/eye_tree/flesh_ball3·mega head1 원좌표/size. 추가 hierarchy 미술 저작0 |
| CAMERA QA | START/EARLY/ARENA/SIDE L/SIDE R/LANDMARK/LATE/EXIT 최종8PNG1920×1080 각각 검토. L/camera8-alpha-final/ |
| TECH QA | source isW8262/canMv8262/LOS400 불일치0;40000센터 physics/union 오차0;resourceerror/texturemissing/최종GodotERROR0. seam은 시각 결함 잔여. 51texture load·96fixture렌더프레임1570.144ms(60cap), 전투 성능 인수 아님 |
| FILES | 자기 stage2/source/consumer/tests/assets+허용CHANGELOG/report. 공용6/타인/P3/factory/공유map0줄 |
| GIT | 정확 파일 stage/정상 hook/자기 branch push·SHA·DONE·cleanup은 receipt. main/force/deploy0 |
| VISUAL VERDICT | **FAIL** — 기술 범위 DONE과 별개. 반복 patch·외곽·접지·광원·생동감·전투 검수 미완 |
| NEXT PASS | 다음 별도 배정은 CH1-06. Main/공용 연결 요구 시 위치·근거만 보고하고 중단하는 사용자 규칙 유지. 본 작업 연결0 |
