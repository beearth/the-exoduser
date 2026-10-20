# CH1-02 — 승인된 정적 환경 동기화 구현·검수

**승인 범위의 정적 환경 동기화는 완료했다.** 파이프라인으로 map의 나무 texture/file8필드와 별도 범위 출처만 갱신하고, 원본 byte 그대로 청크42개·나무4개를 반영했다. 지형·배치·충돌 변경0이다. **추가 공용 접점인 World 원본 이미지 등록표4건은 BLOCKED/미변경**이다. 아래 실제 Sprite 소비 성공과 전체 source-image 등록 준비 상태를 구분한다. 전체 스테이지·전투 완성 보고가 아니다.

## 승인과 기준

맥북총괄의 이번 지시: **“godot/data/map.json의 나무 texture·file 8필드와 범위 출처 수정을 … 허용”**. 조건은 손 편집 금지·원본 근거의 파이프라인 재추출·다른 지형/배치/충돌0·원본 자산 byte 참조·지정 회귀·공용/타 담당0줄이다. 이 승인이 이전 BLOCKED 보고 커밋 `c8d5b8a402c811f4acf41172e2f94d8723a70a0d`의 map 수정 금지를 해소했다. 이전 보고서 사본은 L/approved-before/report.md에 보존했다.

| 항목 | 실제 값 |
|---|---|
| 작업 / branch / WT | ch1-02 / `codex/ch1-02-20261020` / `/Users/fordeargamers/exoduser-wt/ch1-02` |
| 최신 main | fetch 및 원격 ref 재확인 `284d7faf49295b2f5061937a47ce96038032ed3c` |
| 의존 / 이어가기 | CH1-01 `677b86fa2e4afcfd7ee6e3d4ef4d7f18e7834152`가 main에 없어 그 끝에서 분기한 기존 브랜치를 그대로 재개. main 병합/강제 이력 변경 없음 |
| 지시서 | main에 추적 문서 부재. `codex/trace-maps-ch1-20261020:docs/engine/FDG_SOURCE_TRACE_MAPS_CH1_20261020.md` §4.2·§4.8. L/trace-order-reference.md |
| 최신 main 원본 game SHA256 | `4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4` |
| R | `/Users/fordeargamers/Projects/exoduser-migration-20261001`, HEAD `dd49171c5b88e211575a41f185395d6c0a14b184`. branch·tracked INDEX/WORK 보존, 작업 파일 쓰기0 |
| L | `/Users/fordeargamers/exoduser-wt/_out/ch1-02/` |

AGENTS.md·공통 맵 제작 가이드 전체·SSOT index·원본 계약을 앞선 동일 작업에서 확인했다. docs 전체 관련 검색은 L/approved-docs-search.log에 보존했다. 과거 제작 이력/다른 담당 추적 문서를 이번 구현 완료로 소급 변경하지 않았다.

## 재추출 파이프라인과 변경 제한

기존 `godot/tools/export_world.mjs`는 최신 원본을 이미 올바르게 읽어 나무8필드를 생성한다. 잘못된 것은 과거 map snapshot이다. 기존 exporter를 고치거나 원본 HTML/에셋 입력값을 임의로 바꿀 이유가 없어 **기존 exporter·adapter는0줄**을 유지했다.

대신 새 `godot/tools/sync_ch1_stage0_assets.mjs`에 승인 범위의 재추출/반영 계약을 구현했다. 명시 WT와 외부 evidence 경로만 받으며 stage0만 지원한다. 기존 exporter를 evidence 아래에 byte동일 복사해 실행한다. 최신 main 원본 pin·CH1-01 raw deco를 대조하고, 전체 재출력 map을 기존 map과 깊게 비교하여 나무8필드 외 제품 필드 차이가 있으면 **쓰기 전에 거부**한다. PNG92개의 source→재추출 byte/hash도 검증한다.

생성 결과에서8필드만 기존 map에 반영하고 `/source/asset_updates`에 CH1-02의 main/source/exporter SHA·원본 행·92PNG 전후 SHA·범위를 추가한다. 나머지는 기존 JSON을 보존한다. `--apply`에서만 map과 차이 PNG를 쓰고, 변경 전 map/42PNG를 L로 백업한다. 기본 실행은 검토용 출력뿐이다. symlink·원본 내부 evidence·기존과 다른 before-map evidence 재사용도 거부한다. 코드의 파일명 값은 원 exporter 산출에서 가져오며 map.json 손 편집은 없다.

```sh
cd /Users/fordeargamers/exoduser-wt/ch1-02
node godot/tools/sync_ch1_stage0_assets.mjs "$PWD" \
  /Users/fordeargamers/exoduser-wt/_out/ch1-02/approved-extraction --apply
```

의존 acorn은 이 WT의 ignored node_modules/acorn 링크로 R의 기존 설치본을 읽기만 했다. 설치·R node_modules 수정0이다. 생성 map·enemy·92PNG 전체 재출력은 L 내부다. 제품에 전체 재출력본을 덮어쓰지 않았고 제품 enemy.json도0줄이다. 재실행 검토 모드는 **추가 변경 PNG0·동일 map 산출**로 검증했다.

## map.json의 정확한 diff

minified `godot/data/map.json:1`에서 아래8필드와 범위 출처1항목만 달라졌다. 기하·소품 크기·pivot·충돌 등 다른 값은 깊은 비교로 같다.

| ID / prefix | 필드 | 기존 → 실제 원본 산출값 | game.html 근거 |
|---|---|---|---|
| m_ctree17 / `/props/4` | texture / metadata.file | 03 → **rotforest_tree_05.png** | 17551 |
| m_ctree18 / `/props/5` | texture / metadata.file | 04 → **rotforest_tree_11.png** | 17552 |
| m_ctree19 / `/props/6` | texture / metadata.file | 02 → **rotforest_tree_06.png** | 17553 |
| m_ctree20 / `/props/7` | texture / metadata.file | 01 → **rotforest_tree_07.png** | 17554 |

texture는 `res://assets/map/props/<파일명>`, metadata.file은 파일명이다. 배치/scale은 game.html:18138, rotTree 원본 연결은18500, baked 경로/cache 근거는11615–11616이다. 새 receipt는 원본 근거를 나타내며 동적 rotTree 모듈을 이식했다는 주장이 아니다.

| 보존 항목 | 실제 대조 |
|---|---|
| source 원래 출처 | 기존 `/source/root`, `/source/game_sha256=5212e3…` 유지. 최신4d91…는 새 범위 출처에만 기록 |
| P3-001 | `/source/collider_updates` 전체 보존. 원 exporter의 전체 재출력에서 이 기록이 빠지는 차이는 채택하지 않음 |
| tiles | 40000 / SHA `655b5c872be2c42c1f202d14728b1c9ee8741eff5bf1a6655461d113564fc0aa` 전체 동일 |
| counts | wall292 / prop collider19 / props36 / chunks64 유지 |
| 전체 깊은 일치 | collision_rects, prop_colliders, hill, rooms, exits, boss_gate, boundary, regions, START/EXIT |
| 소품 | 승인된8필드를 제외한 position/authored_tile/draw_size/pivot/rotation/alpha/metadata 전부 동일 |
| pit_poison | world6500/5580, collider6500/5587·radii80/58 유지. 원본18407·31686–31712 |

L/approved-map-diff.json 및 approved-preservation.json이 JSON pointer별 차이를 기록한다. 기준은 승인 전 `c8d5b8a4`의 제품이며 Node 검증은 동일 map을 가진 독립 CH1-01 Git 객체 `677b86fa:godot/data/map.json`과도 대조한다.

## PNG·산출 파일

전체 원본→제품92PNG bytes/hash 일치, 초기 차이46개만 반영했다. 원본 PNG 생성·편집·재인코딩0이다. 기존 원본 `assets/` 파일은0줄이며 제품 `godot/assets/`에 동일 byte를 복사했다.

| 대상 | 구현 |
|---|---|
| 청크42 | `assets/map/ch1/production_finish/chunk_x_y.png` → `godot/assets/map/production_finish/` 동일 파일명 |
| 나무4 | `assets/map/ch1/collision/rotforest_tree_{05,11,06,07}.png` → `godot/assets/map/props/` 동일 파일명 |
| 나머지 PNG46 | 변경0. 기존 다른 나무/prop/적 이미지 삭제·교체0 |
| import/UID | 새 나무4개의 Godot 생성 .import와 신규 Godot 테스트 UID만 포함. 소유권 밖 재생성 sidecar111개는 L/approved-generated-sidecars/로 보존 이동, 제출 제외 |
| 새 코드/테스트 | sync_ch1_stage0_assets.mjs, fdgCh1Stage0AssetSnapshot.test.mjs, test_p3004b_ch1_stage0_environment.gd |
| 동일 담당 CH1-01 테스트 | test_p3004a의 현행 map 비교를0차이로 갱신하고 **옛4파일 fixture의4차이 검출도 유지**. 검사를 줄이지 않고62→63단정. CH1-01 producer/data/Node 테스트0줄 |

청크 y별 변경 x는 다음42개다.

| y | x |
|---|---|
| 0 | 1,2,3,4,5,6 |
| 1 | 0,1,2,3,6,7 |
| 2 | 0,1,5,6,7 |
| 3 | 0,1,5,6,7 |
| 4 | 0,1,2,5,6,7 |
| 5 | 0,1,2,7 |
| 6 | 1,2,5,6,7 |
| 7 | 2,3,4,5,6 |

정확한92개 경로·전후 SHA/byte는 map.source.asset_updates[0].assets 및 L/approved-extraction/scoped-plan.json이다. source PNG bytes와 제품의 일치를 새 Node 테스트가 모두 검사한다.

## 실제 검수·회귀

Godot `4.7.2.stable.official.ed1daf0bf`만 사용했다. 매 실행 전 `pgrep -f "Godot.app/Contents/MacOS/Godot" | wc -l`을 확인하고2 이상이면30초씩 대기했다. 소유 프로세스는 순차 실행했고 사용자/타 담당 Godot를 종료하지 않았다. suite별 격리 override를 쓴 뒤 매번 finally0byte, 커밋 제외다. 로그에 argv/HEAD/exit/시간/격리명/stdout/stderr를 보존했다.

| 원로그 prefix | 실제 최종 수치 | exit / 시간 |
|---|---|---|
| approved-node-new-final | 신규6통과/0실패/0SKIP | 0 / 0.928초 |
| approved-node-ch1-01 | 9통과/0실패/0SKIP | 0 / 2.192초 |
| approved-node-p3001 | 기존 pit source·hand collider delta6통과/0실패 | 0 / 3.572초 |
| approved-map-node | **28통과/9실패**, 기준37개·실패 이름9개 동일·새 실패0 | 1 / 0.150초 |
| approved-import | 변경 PNG import | 0 / 3.330초 |
| approved-godot-new-fixed | 신규 실제 World189단정/0실패 | 0 / 2.558초 |
| approved-godot-ch1-01 | 63단정/0실패, 현재 차이0·옛 fixture차이4 | 0 / 0.362초 |
| approved-contracts | 전체5그룹/실패단정0 | 0 / 2.189초 |
| approved-p3002-gui | 전체6그룹·298단정/0실패/0SKIP | 0 / 9.408초 |
| approved-p3003 | core/display/actual43단정/0실패 | 0 / 7.824초 |
| approved-encounter | 전체3그룹/실패단정0 | 0 / 3.170초 |
| approved-camera8 | 실제 GPU8카메라 전후16PNG·445단정/0실패 | 0 / 15.766초 |

새 테스트/기본 contracts/encounter는 `EXODUSER-ch1-02-Isolated-20261020`을 사용한다. 기존 CH1-01은 `EXODUSER-ch1-01-Isolated-20261020`, P3002/P3003는 각 기존 파일의 USERDIR 상수를 그대로 사용했다.

신규 Godot는 실제 World를 생성해36개 prop load 성공·최신4개 texture 경로·원본 metadata.file·실제 Sprite scale/pivot/anchor를 확인한다.64개 chunk Texture1026², coreRect1/1/1024/1024, world1000 및 실제 admitted Sprite crop/scale도 검증한다. Main은 생성하지 않고 시뮬레이션0틱·사용자 save I/O0이다. Main 전용 publication guard는 NOT_READY를 유지하는지 확인하며 단독 World를 Main으로 위장하지 않는다.

기존 P3002는14굴/분모168/HUD0/32·실제 actor10/미이식158을 유지했다. P3003 actual은23/60/53/32·full_fieldboss_combat=false다. 미이식 전투를 완료로 세지 않는다. 맵 Node 실패9개는 기존 culling fixture1·adapter pending2·지역 VM Image 미정의6이며 테스트를 제외하거나 고치지 않았다.

**실패·경고를 보존했다.** 최초 신규 Godot는 Main 전용 publication API의 guard를 단독 World에서 성공으로 기대한 검사 오류로158단정/1실패였다. 제품 guard는 유지하고 직접 실제 청크 Sprite/crop/scale을 검증하도록 테스트를 수정한 뒤189/0이다. 최초 P3002 headless는298/0이어도 dummy renderer의 `Parameter "t" is null` ERROR1(hud.gd:256)이 있어 깨끗한 통과로 포장하지 않았다. 실제 렌더러 실창으로 영향 suite만 재검증하여298/0·stderr ERROR0을 확인했다. headless 오류 원인을 이번 자산 변경 또는 해결 완료로 단정하지 않는다.

최종 신규/CH1-01/contracts/P3003/encounter/실창 P3002·camera는 stderr ERROR0이다. P3002의 기존 ObjectDB8누수 경고와 Camera2D 경고, P3003/camera의 Camera2D 경고는 미해결이다. import의 소유권 밖 UID 재생성 경고도 보존했다. 이전 BLOCKED 조사 시 import -11/미완성 캐시 실행 기록은 기존 원로그에 별도 남아 있으며 이번 최종 수치에 합산하지 않았다.

## 8카메라·시각 판정

Apple M5 Pro, OpenGL3/gl_compatibility 실제 창1920×1080·zoom1에서 캡처했다. 실제 World를 정지하고 적을 숨긴 환경 비교다. 승인 전 map/PNG 백업을 **이 격리 World의 Sprite texture에만 일시 대입**한 BEFORE와, 원래 실제 최신 texture를 복원한 AFTER를 같은 focus에서 비교했다. 제품 파일/맵 데이터/충돌 교체0이며 이전 Main 전체 게임을 재생한 영상이 아니다.

| 카메라 | world focus | 전후 차이 px / 2073600 |
|---|---|---|
| START | 4020,7420 | 384144 |
| EARLY | 4020,6060 | 37350 |
| ARENA | 3340,5020 | 0 |
| SIDE L | 1820,4020 | 193215 |
| SIDE R | 7060,3860 | 1021687 |
| LANDMARK | 4100,3620 | 0 |
| LATE | 4020,2100 | 0 |
| EXIT | 4020,900 | 339064 |

L/camera8/의 각 `<CAMERA>_before.png`, `_after.png`가 원1920×1080 증거다. contact_before.jpg/contact_after.jpg는 읽기용 축소판이다. SOURCE byte·geometry 대조와 실제16캡처를 함께 사용한다. px차이는 정지 환경 비교값이며 성능/FPS 수치가 아니다.

8카메라 전후 및 SIDE R/EXIT 원해상도 화면을 확인했다. 변경 구역의 과거 baked 대형 수목이 최신 원본처럼 제거되고 최신 정적 나무가 소비된다. 뿌리/바닥과 외곽 지형 연결은 보존되며 이8화면에서 새 청크 경계선은 관측하지 않았다. ARENA/LANDMARK/LATE는 전후 픽셀까지 같다. **VISUAL VERDICT: RETOUCH** — 동적 living/rotTree·그림자/접지·전체 환경 mass·전투 가독성 완성은 이번 정적 동기화로 인수하지 않는다. 원본 byte 참조 조건 때문에 시각 부족을 새 이미지 편집으로 덮지 않았다.

## 추가 공용 접점 — BLOCKED, 변경0줄

실제 Sprite4개는 최신 texture로 정상 로드/렌더되지만 `get_native_source_object_entry()`는4개 모두 `SOURCE_OBJECT_NATIVE_ENTRY_UNBOUND:<id>` / NOT_READY다. `world.gd`의 별도 원본 Image 등록표가 과거 경로를 고정하며2386–2388의 동일 경로 검사에서 등록되지 않는다. 관측을 READY로 바꾸거나 테스트 fixture로 이 API를 위조하지 않았다.

| 공용 파일·줄 | 필요한 후속 변경 | 최신 원본 행 |
|---|---|---|
| world.gd:471 /703 | m_ctree17 canonical src와 native 경로03→05, source 행 출처 갱신 | game.html17551 |
| world.gd:472 /704 | m_ctree18 src/native04→11, source 행 출처 갱신 | 17552 |
| world.gd:473 /705 | m_ctree19 src/native02→06, source 행 출처 갱신 | 17553 |
| world.gd:474 /706 | m_ctree20 src/native01→07, source 행 출처 갱신 | 17554 |

이 공용 등록표 변경은 이번 map8필드/정적 PNG 승인에 포함되지 않아 수행하지 않는다. **등록표 동기화와 전체 source-image wait 연결은 BLOCKED이며 후속 공용 소유 작업이 필요하다.** 정적 Sprite 소비 검수의 통과를 원본 Image 등록·전체 source wait·full_stage_ready로 승격하지 않는다. 결과 JSON도 full_source_mapping_ready=false를 보존한다.

## 보존·제출

공용6개(main/hud/world/player/native_normal_enemy_hurte/native_source_new_run_state)·기존 adapter/export_world·타 담당 제품0줄이다. 보호 baseline240개 중 승인된 map1개만 바뀌고 나머지239개는 SHA 동일하다. 변경 PNG42개/신규4개는 별도로 원본92개 hash/byte 검증을 통과했다. R·원본 HTML/JS/PNG·Q/E·세이브·docs/2_3·기존 untracked를 보존했다. 신규 node_modules 링크는 ignored·커밋 제외다.

정확한 제출 파일은 자기 범위만 경로 지정 stage한다. 정상 pre-commit docs 훅을 사용하고 자기 브랜치만 push한다. main push/force/git add -A/배포0. 최종 SHA·원격 ref 대조·수치·추가 BLOCKED는 L/DONE.txt 및 final-receipt.json에 기록한다. PC 실행/병합 인수는 미확인이다.

## MAP PRODUCTION REPORT (§23)

```text
STAGE: si0 / CH1-02 approved static asset scope DONE
MASTER: 53점 silhouette·8구역·main route·side spaces·START/EXIT 보존
OUTER MASS: LEFT/RIGHT/TOP/SOUTH 최신 source PNG42차이 동기화; 새 mass 설계0
LARGE: 원본 byte 참조; 기존 baked 중복 수목 제거 반영, 새 composite/overlap 설계0
MEDIUM: connections/remaining holes — 원본 동기화만, 신규 제작0
GROUND: shadow/contamination/structure integration — 원본 bytes 그대로, 새 편집0
PLAYABLE: arena/travel/breathing/threat geometry·collision 불변; 전투 가독성 인수 아님
LANDMARK: primary/secondary/tertiary 배치 보존; tree4의 원본 file/texture만 갱신
CAMERA QA: START/EARLY/ARENA/SIDE L/SIDE R/LANDMARK/LATE/EXIT 실제 GPU1x 전후 확인
TECH QA: JSON8+scope receipt·PNG92 bytes·실제 World texture/crop/pivot/scale 및 지정 회귀
         route/collision 전체 자연 종주·pageerror/404/performance 새 실플레이 측정 미실행
FILES: approved map/46PNG/해당5sidecar·새 scoped tool/테스트·동일 담당 CH1-01 테스트·docs
       concurrent/unrelated 제품0줄, 공용8스크립트0줄
GIT: 자기 변경만 정상 commit/push, deploy0; 정확 SHA는 L/DONE.txt
VISUAL VERDICT: RETOUCH — 정적 동기화 확인, 전체 환경/전투/동적 모듈 완성 인수 아님
NEXT PASS: World source-image 등록표4건 공용 소유 갱신 BLOCKED; 후속 승인/배정 범위
```
