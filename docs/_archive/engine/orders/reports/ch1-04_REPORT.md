# CH1-04 — si1 standalone World·리소스 소비자

**DONE: si1 원본 데이터·배치·충돌을 소비하는 독립 Godot 장면을 구현하고 실 GPU 8카메라/fixture 왕복 종주를 검증했다.** 제품 Main/World/P·지역 진행·소환굴 생성·적/보스·전환은 미연결이다. 시각 판정은 **RETOUCH**이며 완성 게임·PoE2/No Rest 수준의 룩 인수로 보고하지 않는다.

## 기준·의존·보존

| 항목 | 실제 값 / 범위 |
|---|---|
| 작업 / branch | `ch1-04` / `codex/ch1-04-20261020` |
| fetch 최신 main | `e556b617190c325ca39f5add04357f5dea5ca87e` |
| 의존 / 분기 | CH1-03 `aada9b28b066cfb1c23487c6c0a8036e18fba3f7`가 main에 없어 사용자 지시대로 그 끝에서 분기. CH1-01/02 포함 계보 |
| 원본 HTML | 최신 main과 WT의 game.html byte 동일. SHA256 `4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4` |
| 지시서 | `codex/trace-maps-ch1-20261020:docs/engine/FDG_SOURCE_TRACE_MAPS_CH1_20261020.md` §4.4/4.8. L/trace-order-reference.md |
| 최신 표현 정책 | main e556b617 전략 §8을 Git 원문으로 읽음(L/latest-main-strategy.md). 맵 그림·조명·생동감은 Godot 직접 제작, 충돌·동선·스폰·지역은 원본 계약 유지. 이번은 격리 소비자·기술 검수 단계 |
| WT / L | `~/exoduser-wt/ch1-04` / `/Users/fordeargamers/exoduser-wt/_out/ch1-04/` |
| 작은 checkout | `worktree add --no-checkout -b ... <aada9b28>` → `sparse-checkout set --no-cone --stdin` → 새 빈 index만 `read-tree -mu HEAD`. 필수 코드/docs/Godot 및 회귀 원본92PNG·si1 vista/soil 2파일만 선택, 웹 assets 전체 checkout0. 패턴109개. import 후 WT 약1.4GiB |
| R 보존 | `/Users/fordeargamers/Projects/exoduser-migration-20261001`, HEAD `dd49171c5b88e211575a41f185395d6c0a14b184`, branch `codex/mac-live-play-time-main-20261017`; tracked INDEX/WORK clean 시작·종료 동일 |
| 보호 | 기존 선택 tracked 파일1371개 SHA 동일. 원본 HTML/JS/에셋·map.json·adapter/export_world·si0/si1 snapshot·stage0/1 pure contract·공용6·P3 소유 파일0줄 |

CH1-04에서 공유 맵 변경이 필요하면 CH1-02 조건의 파이프라인 재추출·대상 필드 한정 변경을 허용받았다. 실제로는 **공유 맵 변경0**이다. 새 si1 리소스 전용 파이프라인과 자기 디렉터리만 추가했다. 타 담당 코드·공용 코드를 수정할 필요가 없어 이 단위의 BLOCKED는 없다. 순서안은 CH1-05~07이 남아 있으며 이번 배정 밖 작업은 착수하지 않았다.

## 산출물·실제 소비

| 파일 | 구현 / 실제 적용 |
|---|---|
| `godot/tools/export_ch1_area_resources.mjs` | 기존 CH1-03 `buildAreaSnapshot(stage1,seed20261020)` 재사용. 최신 main HTML byte 확인 후 **원문 전체 initMapObjects**, in-place metadata merge/occ-foot 후처리, collision prefilter/isW/canMv/hasLOS/soilEdgeA를 격리 VM 실행. 원본 소스 치환·가짜 반환 함수0. stage1 init의 전역 Math.random은 호출되면 실패; 실제 호출0, 로컬 원본 _tseed 사용 |
| `godot/data/ch1_map_source/si1_resources.json` | 새 schema `exoduser.ch1-area-resources.v1`, 123158byte. 출처 함수 행/SHA·init 로그·13objects·5colliders·313wall rects·40000개 바닥 mask·10asset byte/hash 명세. undefined 메타 필드는 null carrier와 `scope.metadata_undefined_paths`를 함께 기록 |
| `godot/assets/map/ch1_si1/*` | 최신 원본10파일 **8683434byte**의 byte동일 복사 + Godot 생성 import10. 기존 props/chunks 자산 파일0변경. 새 이미지 생성·원본 리사이즈/필터 저장0 |
| `godot/scripts/native_ch1_area_resources.gd` | CH1-03 순수 계약을 먼저 검사하고 stage1/source pin·asset 디렉터리 범위·실파일 SHA·Texture2D·mask SHA를 확인. 누락/오염은 ready=false/errors. 기존 map_resource stage0 guard 우회0 |
| `godot/scripts/native_ch1_area_world.gd` | `extends Node2D`, 기존 world.gd 상속/호출0. si1 tiles/raw metadata를 읽어 실제 바닥 mesh·vista·Sprite2D12·lore marker1·tile1 StaticBody2D 설치. float64 `is_wall_xy`/`can_move_xy`/`has_los_xy`, BFS·swept fixture 이동 API |
| `godot/scenes/ch1_area_preview.tscn` | 신규 World를 실제 인스턴스화하는 독립 장면. 격리명 필수. 제품 실행 진입점 변경0. 실제 P 리소스 없이 다이아몬드 fixture actor + Camera2D 설치, WASD/화살표 이동 |
| `test/fdgCh1Stage1World.test.mjs` | Node5건: 최신 원문 실행/산출물 대조, actual hand12와 원본 byte/중심 pivot, 전수 tile1 union, 원본 collider5/범위, 원문 질의·IEEE754 carrier 무손실 대조 |
| `godot/tests/test_p3004d_ch1_stage1_world.gd` | 실제 PackedScene을 부팅해 실제 sprite·shape·physics·원문 질의·BFS/fixture 이동·negative resource guards를 검사. GPU 옵션은8화면과 왕복314 fixture 이동/80렌더프레임을 추가 검증 |
| UID3 / docs | 신규 script2/test1 UID만 포함. 보고서와 CHANGELOG_SYNC 최상단 절 추가 |

원본 selector의 기본 템플릿 editor input은 player_start marker1뿐임을 실행으로 확인했고 genFromTemplate에서 제외되는 marker이므로 fresh init의 이전 editor objects는0이다. 전체 `initMapObjects()` 결과는 **13개**: hand12 + lore1, breakable0. lore는 원본 위치(5420,1740)/textIdx3 데이터를 보존하되 별도 native marker로만 표시하고 상호작용은 연결하지 않았다. 손배치 12개만 전체 MAP_OBJS라고 주장하지 않는다.

`si1.json`은 L/si1.reextracted.json으로 재추출했다. 실제 extraction_head(aada9b28 대 이전 d0f7eaf4) 외 데이터/출처는 기존 CH1-03 artifact와 동일이며 제품 snapshot을 덮어쓰지 않았다. 새 resources JSON은 **si1이 이미 관측하지 않았다고 선언한 최종 object 결과를 별도 schema에 기록**하므로 이전 snapshot의 source-only 계약/시각 미검증 표기는 그대로다.

## 최신 원본 행·정확 값

| 원본 위치 | 구현이 소비한 값 |
|---|---|
| game17972–17987 /18172–18177 | `_CH1S1`12개, hand/vista/dense=1, 자동 scatter 차단. LANDMARK5/GAMEPLAY7, role/region 보존 |
| game25735–26472 | 전체 initMapObjects: _nearFloor는0/4, r1..9의 dy→dx 순서. hand 유효 world=(tile+.5)×40. si1 scale 전달 없음→1, 최종 layer→y 정렬 |
| game18486 /18501–18504 | 원문 Object.assign in-place merge, 기존 dict 보존·undefined/falsy 규칙. occ/foot 후처리도 기록. stage0 전용 tree*.72/pivot.72 분기는 **si1에 적용하지 않음** |
| game31711/31712 /31672–31681 | tile1/bounds + 원형 strict 거리²<r² / 타원 strict 정규화<1. canMv 네 모서리, LOS16px 단계의 중간점만 검사. stage0 hill 함수는 원문 stage!==0 guard로false |
| game11204/11226–11234 | vista source `assets/map/ch1/void_vista.jpg`(쿼리 제거 byte), non-plate padding=max(8000,8000)×.4. world center4000/4000, 14400² cover 비율 |
| game26517–26528/26545–26560 /11265–11287 | gt_soil=`assets/map/ch1/ground_dark_soil.png`1024², world-space 반복. 원본 _soilEdgeA를 L8 40000mask로 양자화해 native shader의 선형 보간 alpha로 사용. 원본 canvas blur/후처리 전체 화면 일치 주장은 하지 않음 |
| game30042–30085/30218–30694/31564–31566 | si1 최종 tile40000 SHA `c7994170661e29348e27bdad098020edcb761a11943e68bdea60f9d744236dc1`,0/1/2/3/4=13588/25590/3/0/819. START4020/7420, gate metadata y31 / exits y33. 실제 tile3은0, 별도 봉쇄 collider를 위조하지 않음 |
| 원본 P3 데이터 | holes13/total1000·NW/NE/SW/SE250/300/250/200. 읽기만 하며 P3 stage0 owner/상수·현재 제품14/168·HUD0/32 보존 |

| hand id | tile | 실제 world | role / region | 원문 collision |
|---|---|---|---|---|
| m_c1tree |83/80|3340/3220|LANDMARK/tree|ellipse380/230|
| m_c1camp |49/122|1980/4900|LANDMARK/central|ellipse130/80|
| m_c1altar |151/91|6060/3660|LANDMARK/tree|circle95|
| m_c1pool |49/151|1980/6060|LANDMARK/toxic|circle85|
| m_c1cocoon |151/136|6060/5460|LANDMARK/cocoon|circle80|
| m_c1sroot |91/180|3660/7220|GAMEPLAY/start|없음|
| m_c1sbone |85/162|3420/6500|GAMEPLAY/south|없음|
| m_c1spod |138/158|5540/6340|GAMEPLAY/south|없음|
| m_c1sroot |129/128|5180/5140|GAMEPLAY/cocoon|없음|
| m_c1sbone |79/109|3180/4380|GAMEPLAY/central|없음|
| m_c1spod |128/83|5140/3340|GAMEPLAY/tree|없음|
| m_c1sbone |116/43|4660/1740|GAMEPLAY/north|없음|

nearFloor 실효 보정은12개 모두0. 8종 current texture=corpsetree/camp/altar/pool/cocoon/s_root/s_bone/s_pod 원본이며 draw size는 sz×scale의 keepAR fit, pivot(.5,.5), layer0에서 y sort다. 실제 Sprite2D12의 path/position/scale×texture size/offset/parent layer를 검사했다. native lore/fixture/출구 표시는 QA용 절차적 marker이고 원본 PNG로 위장하지 않는다.

물리 tile1은 **313개 RectangleShape2D로 25590셀 exact union**(중복0/누락0)이다. 40000 tile center를 실제 PhysicsDirectSpaceState2D로도 전수 조회해 오차0. 소품5개는 polygon 근사를 만들지 않고 원본의 analytic circle/ellipse를 fixture query가 직접 소비한다. **Physics2D prop shape는 설치하지 않았으므로 실제 CharacterBody2D/적의 통합 물리와 동등하다고 주장하지 않는다.** 현재 fixture는 swept4px 표본의 canMv 네 모서리를 따르며 각 BFS edge40px를4px 간격으로 검증한다.

## 실행·회귀 결과

모든 Godot 실행 전 지정 `pgrep -f "Godot.app/Contents/MacOS/Godot" | wc -l`을 검사했다. 2개일 때30초씩 대기한 실제 기록은 L/godot-capacity.log에 있다. 타인 Godot 종료0, 자기 suite는 순차 실행. 실행마다 override에 해당 suite 상수를 쓰고 finally에서0byte로 비웠다. 경로/HEAD/main/argv/exit/seconds/userdir/stdout/stderr는 각 result/log에 남겼다.

| 실제 suite | 결과 |
|---|---|
| 신규 Node 최종 |5통과/0실패, L/new-node-final.stdout.log(보고 duration2203.976625ms). source carrier 추가 검증 전 fixed run도5/0(result JSON 있음)|
| 신규 Godot headless 최종 |88단정/0실패, L/new-godot-fixed.*,1.346s |
| 신규 GPU 최종 |410단정/0실패,8PNG1920×1080,Apple M5 Pro/opengl3/gl_compatibility,6.513s. L/camera8-final.* |
| CH1-01 Node / Godot |9/0 /63/0 |
| CH1-02 Node / Godot |6/0 /189/0 |
| CH1-03 Node / Godot |9/0 /75/0 |
| P3001 관련 Node(source pit+hand collider delta) |6/0 |
| test_contracts 전체 |5그룹/단정 실패0 |
| p3002_spawn_holes |298/0,6그룹,SKIP0 |
| p3003_regions |43/0 |
| encounter_factory 전체 |3그룹/단정 실패0 |
| 맵 Node 기존5파일 |37중28통과/9실패, CH1-03 baseline 실패명과동일·새 실패0 |

신규 독립 장면: Main0/제품World0/실P0/user save I/O0, World preview1, texture10 loaded/errors0. isW6966/canMv6966/LOS400은 원문 함수 oracle과 **모두 mismatch0**. START→EXIT BFS157지점의 실제 fixture 종주 성공, 벽 가로지르는 teleport 거부. GPU에서는 같은 경로 왕복314회 이동 성공·80렌더프레임/1302.098ms를 관측했다. 호출 argv의 `--max-fps 60` 아래 짧은 fixture sweep이며 전투 FPS 평균/최저·장시간 성능 인수가 아니다.

### 실패 보존·미완성 상태

- 첫 Node4/1: VM에서 온 alpha Array의 prototype과 로컬 JSON Array가 deepStrictEqual에서 달랐다. exporter의 JSON 경계에서 기존 captureJSON으로 평탄화하고 값은 그대로 유지해5/0. L/new-node.* 원문 보존.
- 첫 Godot88단정/1실패: 일반 JSON 숫자 carrier로 전달한 strict boundary isW12건 차이. 실수 입력849건에서 Godot JSON 파싱 값이 JS 입력 bit와 달랐다. 원본 x/y/r·LOS 입력을 **IEEE754 LE bytes/base64**로도 기록하고 Godot decode_double로 무손실 전달해 해결했다. Node가 모든 carrier를 원본 double과 대조, 원문 oracle/판정식/기대 bool은 수정하지 않았다. canMv/LOS 최초에도0차이였고 최종3종 모두0. L/new-godot.*와fixed.* 원문 보존.
- 새 suite/GPU 및 모든 Godot 회귀에서 ERROR/SCRIPT ERROR0. Camera2D physics interpolation 경고는 새 장면과 기존 Main suite에 남음. P3002 ObjectDB8 누수 경고도 기존 상태대로 기록했다.
- CH1-02 제품 source-image registry4개 NOT_READY는 이전 인수 범위의 잔여 상태이며 본 작업으로 바꾸지 않았다. 실제 제품 P3002 unported_spawns158, P3003 full_fieldboss_combat=false/C_kill_hook_bound=false 등 관측도 완성으로 승격하지 않았다.
- 사용자 제공 선재 결함 원문: **“알려진 선재 결함: 로비 전체 회귀 8실패(main에서도 동일, QA-005 진단 중)는 원문만 기록.”** 이번 로비 전체 회귀를 새 실행하거나 수정하지 않았다.

## 독립8카메라·시각 관측

실제 GPU 이미지8개를 view_image로 각각 열어 확인했다. 최초8화면은 L/camera8/, 최종 같은 카메라는 L/camera8-final/에 보존했다. 합성 이미지를 실제 게임 화면으로 대체하지 않았다.

| 카메라 | world center | 실제 관측 / 잔여 |
|---|---|---|
| START |4020/7420|하부 threshold와 좌측 root, 외곽의 확대 vista 흐림 |
| EARLY |4500/6940|진입로 확장과 바닥 UV 연속, 반복감 뚜렷 |
| ARENA |4620/6340|넓은 남부 전투공간, 오른쪽 pod, 빈 공간 충분하나 조명/접지 미완 |
| SIDE L |1980/6060|독액 pool과 side pocket의 보행 경계, 주변 vista 픽셀화 |
| SIDE R |6060/5460|cocoon과 bend, 소품 접지 보강 필요 |
| LANDMARK |3340/3220|원본1450 크기의 tree, 1x 화면 상하 crop. source pivot/size 임의 축소0 |
| LATE |4420/1820|북부 funnel와 bone cue, 출구 목적지 표시. 실제 gate progression 아님 |
| EXIT |4020/1340|목적지3tile·fixture 도달, stage-cleared/next-stage 발생0 |

8개 정지 화면에서 리소스 누락·빈 타일·별도 청크 경계의 직선 틈은 관측되지 않았다. 바닥은 청크 교체가 없는 하나의 world-space tiled mesh다. **흙 패턴의 반복 seam/반복감, 확대 vista의 픽셀화, 접지·광원·생동감은 RETOUCH**다. 80프레임 sweep는 실제 렌더 호출/이동 성공 기록이며 전 프레임 영상 수작업 검수나 원본 브라우저 화면 픽셀 parity를 주장하지 않는다. 부분 광원/3D 강화/동적 living과 전투 가독성 검수는 후속 시각 담당 범위다.

## 재현 명령·종료 절차

```sh
# 자기 sparse WT에서. acorn은 기존 R의 설치본을 ignored 링크로 읽기만 함.
node godot/tools/export_ch1_area_source.mjs "$WT" "$L/si1.reextracted.json" --stage 1 --seed 20261020
node godot/tools/export_ch1_area_resources.mjs "$WT" "$L/source-queries.json"
node --test test/fdgCh1Stage1World.test.mjs
# 매 Godot 전 capacity 검사 후 override의 실제 격리명 설정, 종료 finally에서 비움.
"$GODOT_BIN" --headless --path "$WT/godot" --script res://tests/test_p3004d_ch1_stage1_world.gd -- --oracle="$L/source-queries.json"
"$GODOT_BIN" --path "$WT/godot" --rendering-method gl_compatibility --resolution 1920x1080 --max-fps 60 --script res://tests/test_p3004d_ch1_stage1_world.gd -- --oracle="$L/source-queries.json" --capture="$L/camera8-final"
# 수동 독립 장면도 동일 격리 override에서:
"$GODOT_BIN" --path "$WT/godot" res://scenes/ch1_area_preview.tscn
```

WT=/Users/fordeargamers/exoduser-wt/ch1-04, L=/Users/fordeargamers/exoduser-wt/_out/ch1-04, GODOT_BIN=/Users/fordeargamers/.codex/tools/godot-4.7.2/Godot.app/Contents/MacOS/Godot. 신규 격리명은 `EXODUSER-ch1-04-Isolated-20261020`; 기존 CH1/P3는 각 테스트 상수 격리명을 그대로 사용한다.

정확 경로만 stage하고 정상 pre-commit docs-sync hook을 통과한 뒤 **자기 branch만 비강제 push → ls-remote SHA 일치 → L/DONE.txt 작성 → 자기 WT만 worktree remove --force** 순서로 종료한다. branch·원로그·보고서 사본은 남긴다. 실제 SHA·tracked clean/R 보존·삭제 여부는 L/final-receipt.json,cleanup.json,DONE.txt에서 확인한다. main push/merge·force push·git add -A·원본/보호 파일 편집·배포0.

## MAP PRODUCTION REPORT — §23

| 필수 항목 | 이번 결과 |
|---|---|
| STAGE | CH1 si1 standalone 소비자/fixture QA. 제품 부팅·진행 전 단계 |
| MASTER | source7region·비대칭 실루엣·SOUTH→NORTH route·toxic/camp/altar/cocoon side spaces 보존. 저작 geometry0 |
| OUTER MASS | LEFT/RIGHT/TOP/SOUTH와 major holes는 source wall tile25590 exact union313rect가 경계. stage0 hill/64baked chunks 복제0. 새 외곽 아트 제작0 |
| LARGE | source assets10byte copies, composite0, overlap은 원본 dense hand12 보존. tree1450 currentTexture·원 pivot/scale. 반복 바닥/vista 품질은 RETOUCH |
| MEDIUM | 연결/잔여 공간은 source tiles·원 prop colliders 보존. 새 장애물/POI 보충0 |
| GROUND | native tiled soil+원 alpha source mask, one mesh. shadow/contamination/structure integration은 최소 정적 소비만·접지/광원 후속 보강 필요 |
| PLAYABLE | fixture START→EXIT157/BFS/swept 성공. 원 arenas/travel/breathing geometry 보존. threat/combat actors0·실전투 가독성 미검증 |
| LANDMARK | primary tree, secondary camp/altar, tertiary pool/cocoon 실제 Sprite2D. 새 랜드마크 저작0 |
| CAMERA QA | START/EARLY/ARENA/SIDE L/SIDE R/LANDMARK/LATE/EXIT 실GPU8개1920×1080 각각 열어 검토. 최종 L/camera8-final/ |
| TECH QA | route157; tile40000센터 physics/union0오차; source isW6966/canMv6966/LOS400 오차0. pageerror대응 Godot ERROR0, texturemissing/resourceerror0. seam은 반복감/외곽 흐림 RETOUCH. load10정상, fixture sweep80프레임1302.098ms(60cap); 성능 인수 아님 |
| FILES | 자기 신규 consumer/resources/scene/tool/data/test/assets만 +허용 CHANGELOG/report. concurrent/unrelated/common0줄 |
| GIT | 정확 파일 stage/정상 hook/자기 branch push·remote SHA·DONE은 최종 receipt. main/force/deploy0 |
| VISUAL VERDICT | **RETOUCH** — standalone 기능 검증 완료. 확대 vista·바닥 반복·접지·조명/생동감·실전투 검수가 남음 |
| NEXT PASS | 순서안의 CH1-05는 다음 별도 배정. 제품 공용 연결은 CH1-07 소유 조율/선행 충족 뒤이며 이번 수정0 |
