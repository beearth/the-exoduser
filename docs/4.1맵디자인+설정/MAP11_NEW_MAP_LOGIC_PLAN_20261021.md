# MAP11 — 1-1 새 맵 제작 로직 설계안

> map11-plan · 2026-10-21 · **문서 전용 / REVIEW_PENDING**. 기준 main `0105159934d0c2a8b167bd51518dca1e0fafe50a`. 웹 맵 이식은 종료하고 **1-1의 제작 로직·분위기·테마·전체 디자인을 먼저 완성**한 다음, 승인된 같은 로직으로 1-2 → 1-3을 순서대로 만든다. 이번 작업은 코드·에셋 생성·Godot 실행·화면 캡처 0. 현재 main이나 새 맵의 시각 완성·성능 PASS를 선언하지 않는다.

## 1. 근거와 방침 우선순위

| 확인 자료 | 이번 설계에 적용할 부분 / 충돌 처리 |
|---|---|
| 최신 사용자 방침 | 최상위. 웹 좌표·200×200/T40·tileRLE·베이크64청크·원본 exporter·provenance 재현은 새 맵의 요구사항에서 제외. 기존 웹 파일과 세이브를 삭제한다는 뜻은 아님 |
| [CLAUDE.md](../../CLAUDE.md) 148–163, [UI FOUNDATION](<../3.1 ui hud 디자인/UI_FOUNDATION_20260924.md>) 1–26 | Hell Gothic: 흑철·악마 실루엣·붉은 지옥불·뼈색. 눈 검수/1x 크롭 필수. AI 잔점·점묘·디더링·반짝이 점 금지. MagicLight 우선. 게임 HUD·폰트·Q/E 색은 기존 담당 계약 보존 |
| [1장 MAP BIBLE](<EXODUSER_MAP_BIBLE_v3 (1).md>) 24–48, [맵구성 1장](맵구성_1장.md) 31–58·146–185 | 숲 입구→뒤틀린 숲길→눈달린 버섯 군락의 테마만 계승. 옛 vert/grid·좌표·지형 강제 없음. BIBLE의 기생수 보스 서술은 현재 si0 다크드루이드를 대체하지 않음 |
| [맵디테일](맵디테일.md) 238–264, [SSOT 진입점](_MAP_SSOT_INDEX.md) | 넓은 전투면·피부막·동맥·부패 고목·억제된 국소광. 과거 웹98차/원화 PASS·RETOUCH는 이 새 Godot 맵의 승인 근거가 아님. 옛 START/EXIT 좌표 LOCK은 이식하지 않되 **6시 진입→12시 출구** 방향은 유지 |
| [제작 가이드](EXODUSER_MAP_PRODUCTION_GUIDELINE_v0.9.md) §0–4/7/9–10/13–17/20–23 | MASTER→LARGE OUTER MASS→MEDIUM→GROUND→PLAYABLE→LANDMARK→SMALL→CAMERA→TECH. 4층 외곽·8카메라·전투 가독성·시각/기술 별도 판정. 가이드의 6–10 시각 REGION은 아래 8장면이며 게임 처치 지역4개와 구분 |
| [맵 오브젝트 목록](맵오브젝트_에셋목록.md), [Seedream 경로](MAP_OBJECT_SEEDREAM_PIPELINE_20260930.md) §절차/주의, [폐기 목록](LOW_QUALITY_ASSET_RETIREMENT_20260927.md) | 개별 원화는 품질/폐기 상태 확인 후 재사용 후보. 기존 완성 맵 청크·placements를 재사용하지 않음. 목록에 있다는 이유만으로 승인 에셋으로 취급하지 않음 |
| [그래픽 MASTER](<../1전체그래픽세팅/1전체그래픽세팅_MASTER.md>) 비전/현행 접지 절, [화면효과 조사](<../1전체그래픽세팅/맵_화면효과_전수조사.md>) §1–3/7–9 | 서정적 어둠·실루엣 대비·부분 조명·접지의 목적을 계승. 예전 Ori 방향/그로테스크 금지 문구는 이후 생체지옥 콘셉트와 최신 PoE2·No Rest 깊이 목표에 맞춰 해석: 건강한 숲이나 노골적 고어 전시로 바꾸지 않음. 웹 효과 수치·FPS를 native 실측으로 복사하지 않음 |
| [DEMO11 GAP](https://github.com/beearth/the-exoduser/blob/2299caa53585d937d7d0b025bd5ccc3ec539b0de/docs/engine/DEMO11_COMPLETION_GAP_20261021.md) §1 인터페이스/DEMO11-03/§5 | 원격 `codex/demo11-gap-20261021` `2299caa53585d937d7d0b025bd5ccc3ec539b0de`를 읽기만 함/merge0. anchor·충돌/벽/시야/flow·지역/분모·arena·출구를 제공. 맵 이식은 요구하지 않음. 앵글러 `_fbDone`은 지역 없는 폴백에서도 생략 불가 |

## 2. main에서 재사용할 것과 실제로 빠진 접점

| main의 실재 위치 | 현재 사실 | 새 맵 접점 / 소유 |
|---|---|---|
| `godot/scripts/main.gd:207–218,233–238`, `godot/scenes/main.tscn` | Node2D + Camera2D, 카메라 경계8000 고정. NativeScreenLighting 후 NativeMapLook 설치 | **2D 기반 2.5D 깊이** 유지. 3D 엔진 전환 없음. 카메라 경계는 새 provider bounds에서 받도록 DEMO11-03 통합 요청; 이번 수정0 |
| `native_map_look.gd:62–129,168–200,234–269` | 일반 boot auto 설치/하니스 auto 제외. CanvasModulate·PointLight2D·sway·그림자·근경·빛줄기 있음. `world.map_data.props`, texture 경로, world 직속 Sprite2D/`_chunks`에 결합 | 기존 효과/셰이더를 재사용하되 명시 render handles·semantic anchors·stage look profile adapter 필요. 중첩 씬을 현재 코드가 자동 스타일링한다고 가정하지 않음. **MAP-LOOK 기존 PC Claude 소유**, MAP11에서 중복 커널 제작0 |
| `godot/data/map_look_ch1.json` | ambient [.26,.28,.36], player radius560/energy1.05, camp640/1.55, sway5 world px, fx_light_limit18. 그림자 NW→SE·foreground parallax·지역 환경광·번개·빛줄기 설정 | 이 숫자는 **현 main 관측값**. 시작 룩 비교 기준으로 보존하되 반경·위치는 새 scene scale/anchor로 재조정하는 별도 시각 작업. 기존 props ID/nth/고정 shaft 좌표를 새 맵으로 복사하지 않음 |
| `native_map_look.gd:20–21,547–559` / `scripts/maplook/` | spawn_hole_fx만 main 실재. toxic_surface/actor_contact_shadows/ground_mist는 이름만 있고 없으면 skip | WORK_BOARD MAPLOOK-TOXIC/SHADOW/MIST는 PC Codex 큐 대기. 완성으로 집계0. 기존 담당 제출 회수·인수 후 새 anchor 계약에 연결; 별도 Mac 중복 구현0 |
| `world.gd:954–982,3194–3231,3269,3306` | map.json·start/exit, 8000 경계·200 stride·T40·hill/prop ellipse·16 간격 LOS·4점 can_move·player flow 고정 | 기존 호출부의 **의미**를 보존하는 provider facade가 필요. 새 geometry를 옛 map.json처럼 위장하거나 검사를 삭제하지 않음. 실제 반경/샘플·LOS·sweep 의미는 전투 코드 담당과 확정 |
| `enemy_factory.gd:40–66,168–176`; `native_spawn_hole_system.gd:30 이후`; `native_regions.gd:82–105` | factory는 frozen record/특정 source guard, 굴은 기존 배치 상수, 지역은 T40·맵180 이상·중점 분할/고정 사이트 결합 | DEMO11-03의 spawn/지역/분모 계약으로 분리할 **공용 통합 요청**. source guard 단순 삭제·가짜 record/actor 대체 금지. 기존 전투/RNG/굴·처치 owner 재사용 |

## 3. 1-1의 완성할 화면

**한 문장:** 죽은 숲의 거대한 몸속을 걷는 느낌. 넓고 낮은 피부빛 전투면을 부패한 목질 덩어리가 둘러싸고, 갈라진 틈의 심장빛·독액·불씨만 부분적으로 살아 있다. PoE2·No Rest for the Wicked는 깊이·재질·국소광·생동감의 목표이며 타 작품의 레이아웃/자산 복제나 동급 품질 달성 선언이 아니다.

| 키 | 권장 아트 디렉션 — 신규 제안값이며 승인/눈 검수 전 |
|---|---|
| 기저색 | 피부/지면 `#353032`·`#3d3535` 저채도 회갈색/회자주, 목질 `#17171d`, 뒤 안개 `#20252f`. 완전 검정으로 외곽 접합 결함을 숨기지 않음 |
| 강조색 | 조직 검붉은 `#6b252d`, 심장 균열 `#a33c36`, 독액 탁한 황록 `#7b8146`, 캠프 불빛 `#e28b48`. 초록 네온/주황 용암 숲 금지. HUD 뼈색 `#dfd6c2`·Q/E/적 경고색보다 배경 대비를 낮춤 |
| 키/보조광 | NW 위쪽에서 SE로 약한 차가운 방향감, 밑동 접지+국소 투사 그림자. 플레이어 따뜻한 소범위, 캠프 주황·제단 둔한 적색·독액 낮은 황록. 광원은 주변 재질에 닿는 범위가 읽혀야 하며 화면 전체 glow 금지 |
| 깊이 | BACK(안개 속 암부 mass)→MID(굵기/기울기가 다른 고목)→FRONT(불규칙 뿌리턱)→GROUND(젖은 번짐·접지). 외곽 높은 수관/근경과 낮은 중앙의 대비. 밑동 기준 y정렬, 필요한 수관만 앞뒤 분할/가림 페이드 |
| 생동감 | 밑동 고정 가지, 국소 동맥 맥동, 고치의 작은 호흡, 독액 수면/증기, 드문 불씨. 모든 식생이 한 주기로 흔들리거나 바닥 전체가 출렁이지 않음. 장식 RNG는 전투 RNG와 별도이며 판정·충돌·처치 수를 바꾸지 않음 |
| 중심/고딕 | 주인공 랜드마크 권장안은 **북중부의 갈라진 시체나무와 낮은 심장 제단** 한 묶음. 골재/흑철/악마 문양은 관문·제단에 집중. 중앙에 거대 뿌리 섬을 세우지 않음. 시체나무와 싸움 공간의 폭을 실제 화면으로 먼저 승인 |

### 3.1 레이아웃: 남쪽 기상 → 두 갈래 순환 → 북쪽 보스문

전체 연결 그래프는 `기상터→초기 학습 공터→넓은 중심 전투면↔서측/동측 고리→북중부 랜드마크 앞마당→북쪽 접근/보스문`이다. 좌우 고리는 서로 다시 연결되어 지역 순회/복귀가 가능하다. 남북 방향은 빛·목질 결·랜드마크로 알려주고, 국소 진행은 NW/E/NE/W로 변화한다. 작은 방/좁은 목 반복·단일 S자·완전 좌우대칭을 만들지 않는다.

| 카메라 장면 / 역할 | 공간·외곽·차별 요소 | 게임 지역과의 관계 |
|---|---|---|
| 01 START / 기상터 | 6시, 뒤쪽도 나무 mass와 바닥이 이어짐. 시야 앞은 낮고 넓게, 첫 적/학습 표식 가림0. 캠프 따뜻한 광원 | 남측 지역 내부 안전 anchor. 학습 중 스폰 제한은 코드 owner 정책 |
| 02 EARLY / 부러진 줄기 옆 | 한쪽 큰 누운 고목, 반대쪽은 낮은 피부 지면. 열린 전투면으로 확장 | 남서/남동 간 이동 방향을 자연스럽게 노출 |
| 03 MAIN ARENA / 중앙 전투면 | 가장 넓고 낮은 면. 얕은 동맥·얼룩만, 큰 세로 구조물0. 2방향 이상 회피·재진입 | 4지역 경계가 만나도 카운팅을 중복시키지 않음 |
| 04 SIDE LEFT / 마른 심재 고리 | 높은 갈라진 고목 단면과 건조한 접합, 비스듬한 시선/폭 변화 | 서쪽 2지역을 잇는 고리·필드보스/굴 anchor 후보 |
| 05 SIDE RIGHT / 독액 고리 | 낮은 수면/둔한 황록 반사·앞턱, 서측과 최소 두 요소(높이/색/폭)가 다름 | 동쪽 2지역 고리. 장식 독액과 실제 hazard를 다른 ID로 명시 |
| 06 LANDMARK / 심장 제단 앞 | 주 시체나무 한 덩어리가 중심을 잡되 앞 전투면은 넓음. 재질/빛의 초점 하나 | 북측 지역 landmark, 보스 출현/클리어 수식은 코드 소유 |
| 07 LATE / 북쪽 그늘 | 길 폭·빛 대비를 낮춰 압박 후 다시 확장. 전경 실루엣이 플레이어를 계속 가리지 않음 | 북서↔북동 연결, 막힌 일방향 통로 없음 |
| 08 EXIT / 보스문 | 12시, 재질/문틀·수관으로 프레이밍. 진입·복귀 위치와 보스 아레나 로딩 경계가 명확 | gate와 arena는 별도 역할, 1-1 demo 종료 뒤 1-2 자동 진입0 |

**스케일 제안:** 1920×1080 내부 viewport와 저작 기준 줌에서 보이는 월드 폭/높이를 W/H로 정의한다(창1280×720은 내부 viewport와 구별). W/H는 저작 시 world 단위로 확정·컴파일하며, 창 크기/기기/실행 중 줌 변경으로 geometry·anchor·처치 지역을 다시 생성하지 않는다. 첫 blockout 경계는 약 `4W × 6H`를 상한 가이드로 그리되 고정 직사각 지형으로 채우지 않는다. 일반 전투면의 장애물 없는 단축은 ≥0.9W, 주 전투면 ≥1.2W, 이동 연결의 유효 폭은 ≥0.35W를 시작 목표로 한다. 반드시 실제 가장 큰 적 반경·이동/돌진·회피 궤적의 swept clearance로 재검수하며 기존 플레이어 수치를 공간에 맞춰 바꾸지 않는다. 치수/총 이동시간은 MAP11-02의 플레이 blockout에서 확정(현재 미실측), 8000px나200타일을 맞추기 위해 늘리지 않는다.

## 4. 제작 로직·도구·Godot 구조

**권장 방식은 손설계 그래프 + 모듈 조립 + 바닥 페인팅의 혼합**이다. Godot 2D 에디터에서 전체 silhouette/공간·anchor를 손으로 저작하고, StageRecipe Resource로 검증/컴파일한다. 반복 바닥만 내부 TileMapLayer/mesh를 선택적으로 사용하며, 타일이 디자인을 지배하지 않는다. 매 run 랜덤 방 생성·웹 map exporter 수리는 제외한다. 국소 장식 seed는 기록하고 gameplay anchor/geometry에 무작위 이동을 적용하지 않는다.

| 순서 | 입력→처리→산출 / 저장할 제작 데이터 |
|---|---|
| 저작 | StageRecipe(장면 그래프·폴리곤·모듈transform·명명 anchor·지역4개·look profile·asset IDs) + AssetCatalog(pivot/실크기/콜리전 별도/조명·motion socket/폐기 상태). 월드 좌표는 Godot 2D local→단일 world transform; Y아래+, 각도 rad. 이미지 px/타일/월드 단위 암묵 변환0 |
| geometry 컴파일 | 동일 저작 폴리곤에서 walkable/solid/LOS blocker/trigger 영역과 파생 spatial index·flow grid를 생성. 장식 sprite 알파에서 자동 충돌을 추론하지 않음. 그림과 collider의 밑동을 editor overlay로 비교. grid는 내부 캐시이며 provider에 타일 배치를 요구하지 않음 |
| 환경 조립 | LARGE silhouettes→MEDIUM 연결→GROUND 접합을 한 전체 마스터 좌표계로 편집. Krita 등 레이어 편집기는 권장 도구이며 설치 여부 미확인. 정적인 큰 외곽/오염은 **새 제작물**로 오프라인 합성, Godot는 가시+인접 청크만 로드. 기존 웹 production_finish 청크 반입0 |
| 청크/실시간 분리 | 신규 제안 core1024 + 각 변8px bleed(1040²), 동일 master에서 crop/월드 UV 정렬/경계 seam 확인. 움직이는 가지·독액·수관·trigger·상호작용·문·아레나는 runtime 씬. 불변 그림에 들어간 요소를 runtime에서 중복으로 덧그리지 않음 |
| 검증/배포 | duplicate ID·참조 누락·밖 anchor·끊긴 route·지역 중복/누락·콜리전 침범·예산 초과를 build 오류로 보고. content 검증과 실제 consumer 바인딩 검증을 분리. 실패한 provider를 READY/원점 fallback/가짜 actor로 대체0. 완료한 recipe/asset manifest/파생물 hash를 묶어 stage revision 발행 |

제안 씬 경로는 새 소유 `godot/scenes/maps/map11/`, Resource/컴파일러는 `godot/scripts/maps/`, 데이터는 `godot/data/maps/map11/`, 새 자산은 `godot/assets/maps/map11/`이다. 기존 프로젝트 디렉터리 규칙과 충돌하면 MAP11-01에서 경로만 확정한다. 아래는 설계 구조이며 이미 존재하는 씬이 아니다.

```text
Map11Root (Node2D, scene_id/revision)
  Geometry      (저작 polygons → collider/LOS/nav 파생 캐시)
  Ground        (바닥·접합·가시 정적 청크)
  Environment   (BACK / MID / FRONT / 밑동 기준 Y-sort)
  Anchors       (Marker2D + 안정 ID/역할; physics trigger는 별도)
  Look          (기존 MAP-LOOK adapter / 광원·occluder·motion)
  ArenaRoot     (별도 geometry/anchor context, 필요시 load)
  DebugOverlay  (editor/dev 전용, 제품 기본 OFF)
```

실제 적·플레이어·탄·굴 registry와 처치 writer는 기존 게임 owner가 관리한다. 이 씬은 그 actor를 새로 소유하거나 별도 G/State/세이브를 만들지 않는다. 현재 `_style_props`는 world 직속/texture prefix 검사이므로 이 씬을 추가하는 것만으로 룩이 적용되지 않는다. MAP11-08에서 명시 handles 바인딩을 인수해야 한다.

## 5. 에셋 목록·제작 경로

| 세트 / 첫 필요량(견적용 제안) | 재사용 후보·신규 제작 | 산출/눈 검수 |
|---|---|---|
| 바닥 재질3 + 접합4 | 회자주 피부/젖은 피부/괴사 목질, 뿌리 번짐·독액 얼룩. 기존 native 재질을 먼저 1x 재검수; 부족분만 MagicLight→레이어 편집 | 저대비 타일/패치 RGBA, world scale, 반복/밝기 차/직선 seam0. 옛 master 전체 복사0 |
| 대형 외곽3실루엣 + 중형 연결6 | 굵은 빈 고목·갈라진 경사 줄기·누운 고목, root shoulder/수피 접합. 기존 `godot/assets/map/props/rotforest_tree_01..04.png`는 후보 | 잘린 가장자리/동일 나무 연속 반복/구름 모양 mass 금지. BACK/MID/FRONT 분리, 밑동 pivot·가림·접지/occluder socket |
| 주 랜드마크1묶음 | 실재 `props/prop_corpsetree.png`·`prop_altar.png` 후보, 새 조립 실루엣이 약하면 MagicLight proof 후 교체 | 나무/저단 제단/접합·심장빛을 분리. 해부학적 연결과 목질 섬유가 읽힘. 첫 카메라 승인 전 전체 세트 양산0 |
| 보조 오브젝트3역할 | 실재 `props/prop_camp.png`·`prop_pool.png`·`prop_cocoon.png` 및 관문 후보 확인 | camp/독액/고치 역할·정확한밑동·motion mask. 원화 바닥/구운 그림자 제거, runtime 접지와 이중그림자0 |
| 움직임 mask3종 + 얇은 안개/국소 빛 | 기존 sway/shadow/shaft·spawn_hole_fx 재사용. 독액/캐릭터 그림자/안개는 기존 PC 큐 인수 후 socket 연결 | 가지 밑동 고정, 호흡 국소, 광원과 장식 분리. 잔점으로 생동감 위장0. 입자는 나중 별도 밀도/전투 가독성 검수 |
| gate/arena 연결 자산1세트 | 기존 관문/보스 자산 재사용 후보, 새 gate frame/ground transition만 필요 시 제작 | 통과 가능 폭·trigger/막힘 상태와 시각 일치. 보스 외형·패턴·Q/E 제작으로 범위 확대0 |

**제작 경로:** 확정 스타일 원화 1장→동일 세트 레퍼런스→MagicLight Toolbox Image의 Seedream 우선 proof→무배경/무그림자 단일 오브젝트→배경색 제거/알파·pivot·mask 정리→어두운 실제 바닥+HUD 1x 합성→같은 카메라에서 검수→등록. `MAP_OBJECT_SEEDREAM_PIPELINE`의 모델/해상도/포인트는 2026-09-30 이력이며 실행 시 실제 서비스 표시·비용을 재확인한다. 잔액 부족이 실제 확인된 때만 승인된 Higgsfield 경로로 전환한다. 이번 생성/지출0. 순회색 키잉이 목질을 뚫으면 피사체에 없는 배경색으로 재생성/마스크 보정하고 원본을 보존한다. 점·스펙클·디더·광택 점·회색 halo는 1x와 검정/피부색 배경 모두에서 탈락 기준이다. 원화/정리RGBA/마스크/manifest/프롬프트·도구·시각 판정·hash를 함께 남긴다. 폐기 id tombstone/m_tomb/m_root 계열과 후속 폐기 문서 항목은 새 catalog에서 거부한다.

## 6. 코드에 제공할 StageProvider 계약안

이 표의 API 이름/형식은 **신규 제안**, 현 main에 이미 바인딩된 API가 아니다. DEMO11-03 및 현재 World/factory/P3-002/003·MAP-LOOK 소유자가 소비자와 함께 서명해야 한다. 맵은 장소·질의 서비스를, 게임 코드는 전투·스폰 정책/순서·진행/처치를 소유한다.

| 서비스 | 입력 → 출력/규약 | 실패·소유 경계 |
|---|---|---|
| `describe()` / `bind_context(...)` | stage_id/map_instance_id/revision/world transform/bounds/capabilities/정적 저작 hash. `content_valid`와 실제 owner 참조 연결 후 `runtime_ready`를 별도 반환 | geometry·필수anchor·필수callback·consumer revision 불일치면 NOT_READY + reason. node 해제/arena 교체 후 stale handle 거부. 실제 서비스 없이 READY 금지 |
| `anchor(id, role)` / `anchors(role)` | player_start/recovery/checkpoint/enemy_spawn/hole/interaction/field_boss/gate/arena_entry/arena_return/boss_center 등 안정 ID→world position+facing+region_id+유효영역/태그 | 위치를 enemy 종류로 추정0. 누락은 NOT_FOUND, null/원점/최근접 임의 대체0. 보행 가능한 반경까지 검증. art asset ID와 gameplay ID 분리 |
| `spawn_sites(kind, request)` | 소유 코드가 고른 etype/반경/요청 개수/기존 RNG 또는 명시 샘플을 주면 합법 위치 후보와 provenance/site ID 반환. 굴은 hole_id/size/room/site binding을 제공 | etype/속성/정예 확률·AI·보상·시드 draw 순서/스폰 cap은 기존 owner. 초기16개·원본고정14굴/168을 새 배치 요구로 복사0. 가짜 crawler 대체0. 실제 spawn은 factory가 한 번만 등록 |
| `is_blocked(point, mask)` / `can_move(center,r,mask)` / `sweep_circle(from,to,r,mask)` | solid/이동·벽·hazard 의미를 구분, 동일 저작 geometry revision 사용. 경계밖 blocked. sweep은 hit/정규화시점/법선·최종허용위치 | 현재 4점 canMv 의미·연속 sweep·공격별 path predicate를 전투 owner와 명시 매핑. 자동 물리 sweep으로 기존 공격 수치/판정을 암묵 변경0. 장식 흔들림으로 collider 이동0 |
| `line_of_sight(from,to,mask)` / `flow_direction(pos,target,agent)` | LOS 전용 blocker, agent 반경/geometry+target revision별 파생 flow 캐시. 도달 불가→reachable=false/이유, 방향 없음을 목표 직선 추적으로 위장0 | 기존 World의 LOS/flow 호출과 소비 순서 유지. 이전 맵/이전 target 캐시 재사용0. geometry 변경 commit은 tick 사이 한 번, tick 중 질의는 같은 revision |
| `region_at(point)` / `region_sites()` | **게임 지역4개 ID0..3 유지 권장**. 저작 폴리곤·경계 tie-break(작은ID 우선)·반열림 외곽 규칙으로 유일 귀속. 8시각장면 ID는 별도. NW/NE/SW/SE 명칭과 field_boss/gate 소유 매핑 제공 | 장식 cell 수를 처치 분모로 쓰지 않음. scene 위치/T40/맵180 임계에 지역 enable을 의존시키지 않는 통합 필요. 네 지역 모두 도달 가능, 분모0 처리도 기존 코드 정책 |
| `spawn_budget_manifest()` | owner가 승인한 각 hole/site의 **예정 총량·region_id·spawn_group_id·revision**을 1회 제공. 동적 추가/취소는 owner 이벤트 receipt로 변경. actor→origin spawn_group의 귀속 ID를 유지 | `_totalSpawned`/지역 total/kills·kill ID중복 방지는 P3 owner 단일 writer. 지역 사이 이동해도 카운팅 재귀속0. MAP 쪽에서 G.kills/cleared/_fbDone 쓰기0. 80%/문지기 보너스/앵글러 필수 조건 변경0 |
| `arena_descriptor(id)` / `transition_sites(id)` | 별도 arena bounds/geometry revision/player_entry/boss_center/safe_return/gate_trigger 영역/현재map↔arena context. boss/player 유효반경 포함 | 맵은 좌표와 기하만 제공. gate-open·앵글러 `_fbDone`·보스 죽음/입장/복귀·demo 종료는 게임 owner. 정상1-1은 si0 일반 다크드루이드, si3 피날레/다음stage 자동 생성0. 전환 준비 실패 시 기존 context 유지 |
| `look_bindings()` | 명시 sprite/render handles·foot pivot·motion/occluder sockets·semantic light IDs·환경 profile·camera bounds/안전가림영역 | 기존 `m_c1camp`/nth/고정shafts와직속children 탐색을 consumer adapter에서 치환. 룩이 gameplay bounds/regions/충돌을 쓰거나 변경0. 환경광마스크+CanvasModulate 이중 암전0 |

**필수 인수 사례:** spawn/hole/fieldboss/interaction/출구가 모두 실제 위치에 있고 적 반경으로 합법; 한 stage instance의 region 총량과 spawn 예정/실제/처치 ledger 정합; 동일 kill 이벤트 중복 반영0; 네 지역 순회→기존 앵글러/문지기 조건 충족→gate→arena→결과/복귀가 자연 경로로 성립; arena 실패/재시도 시 원맵 anchor 보존. 원본의 곰치·화마귀 등 정상 데모 도달 전투도 이름이 맵 소품처럼 보인다는 이유로 삭제하지 않는다. room/레어 별도 분기 채택은 DEMO11 정책 결정 뒤 별도 범위로 두며 이 설계에서 활성화0. 전투 수치/원본 정책 검사는 유지하고 옛 **맵 provenance** 기대값만 새 stage 계약 검사로 명시 교체한다(검사 단순 삭제0).

## 7. 재사용과 stage별 차이

| 1-1에서 확정 후 공통으로 동결 | 1-2 / 1-3에서 교체할 StageRecipe 내용 |
|---|---|
| 좌표/scene revision/provider ABI·asset pivot/socket·compiler/검증기·청크 스트리밍·geometry/LOS/flow 캐시·스폰/region ledger adapter·camera/가림·기존 MAP-LOOK 바인딩·성능/눈검수 gate | geometry/공간 그래프·전투 여백·landmark silhouette·모듈transform·light/색/안개 profile·anchor 위치와 합법영역·정책이 승인한 굴/site 구성 |
| 4지역/게임 정책과 시각장면 분리, 한 owner writer, 실패 시 NOT_READY, 같은 gameplay 값과 RNG 순서 | 1-2 권장: 뒤틀린 빈 고목·기울기/깊이 강화, 전투 고리 보존. 1-3 권장: 눈달린 큰 버섯 군락·갓 아래 광원·3개의 구별되는 시각 mass, 사이 전투면 보존. 테마는 BIBLE 참고, 옛 좌표/비스타/분지/배치는 복제0 |

1-1은 테스트용 임시 맵에서 멈추지 않는다. 아래 MAP11-14의 디자인+자연 플레이+양 플랫폼 성능 인수까지 끝나야 MAP12-01(1-2 recipe/장면 master)을 착수하고, 1-2를 같은 gate로 인수한 뒤 MAP13-01(1-3)을 착수한다. 공통 로직 버그는 공통 단일 소유 파일에서 고치고 stage별 복제 패치로 갈라지지 않는다. 게임 콘텐츠/보스 확장은 맵 재사용의 자동 승인 범위가 아니다.

## 8. 성능 예산과 측정 — 모두 목표, 실측 아님

| 항목 | 제안 예산 / 측정 조건 |
|---|---|
| 제품 목표 | 1920×1080 내부 해상도·기준 줌 **60 FPS / 16.67ms**. 창 크기와 render 해상도 기록. Mac/Windows GPU·OS·Godot 버전·renderer·전원 상태를 고정해 따로 측정. 120 FPS는 여유 목표이며 기본 승인 조건으로 확대0. 최소 PC/Mac 사양은 사용자 결정 D04 |
| 프레임 시간 | warm 후 60초 이동 + 60초 실제 밀집 전투의 각 p95≤16.67ms, p99≤25ms 목표. new-map 추가 CPU≤2.5ms/frame, 환경 GPU≤6ms 목표; CPU/GPU 파이프라인 수치를 합산해 가짜 frame time으로 보고하지 않음. cold 첫 로딩/첫광원 업로드 hitch 별도 기록 |
| 광원/그림자 | 카메라+여유영역 기준 환경 PointLight 활성≤8, 그중 shadow≤2(플레이어+주요광원). VFX는 기존 limit18을 상한으로 재사용하되 동시 총량≤24 목표로 우선순위/cull. 모든 나무 eye를 shadow light로 만들지 않음. Low는 환경4/shadow0에서 전투/길찾기 가독성 유지 |
| 텍스처/청크 | 새 맵 환경 resident texture≤256MiB 목표(원본PNG 압축 파일 크기와 구별). core1024/bleed8 청크는 가시+이동방향 선행분을 우선하여≤16상주를 시작 예산으로, 현재 camera/zoom에서 부족하면 zoom아웃·최대가시수부터 재측정. 큰맵 전체 한 장 상주0, runtime 픽셀 readback/매frame 재bake0 |
| motion/투명층 | 카메라 내 활성 motion module≤24, 장식 입자≤96, full-screen 안개 합성≤1층 목표. 보이지 않는 motion/라이트/안개 pause/cull, per-frame 대량 node 생성0. 동일 텍스처/material 공유, 비용 높은 알파 겹침을 profiler에서 측정 |
| 전투 부하 | 기존 정상 소환/밀집 경로를 쓰고 actor/탄/드롭 개수·캐릭터/스킬·seed·위치 기록. 임의100적 fixture를 자연 플레이 성능으로 바꾸어 부르지 않음. 맵low/full A/B 비교는 같은 전투와 동일카메라로 1회씩, 실패/변경 때만 재측정 |
| 초과 시 순서 | 비가시 FX→shadow 수→광원 범위→투명 안개/근경 overdraw→texture LOD/청크; 그 다음 저작 mass 조정. 적/탄/정예/피해/스폰/게임 속도·Q/E를 줄여 예산을 맞추지 않음 |

## 9. 눈 검수와 gate

| Gate | 반드시 제출할 증거 / 탈락 조건 |
|---|---|
| G1 전체 master | 전체 silhouette·주/보조 landmark·주동선/두고리·8카메라·4게임지역/anchor overlay. 인접 장면은 폭/방향/밀도/재질 등 최소2개 차이. 고정 직사각·S길·똑같은방 반복이면 FAIL |
| G2 LARGE→G3 MEDIUM→G4 GROUND | 각 단계 같은8시점 전후. 좌/우/북/남 외곽mass 연속·빈검정hole0·중형 연결·뿌리턱/바닥 오염·접지. 에셋 섬/스티커·같은실루엣 도배·사각 seam이면 RETOUCH/FAIL. 작은 소품으로 가리기 금지 |
| G5 PLAYABLE | 실제 player/다수적/탄/Q/E/VFX/loot/숫자와 최소8시점. 선행조건이 된 실제 공격/기술로 자연 전투; 소비자가 미연결이면 해당 검수 BLOCKED이지 fixture PASS 아님. 전경 가림 시 player/적 윤곽/텔레그래프 복원, 큰 공격 판정과 시각 경계 일치 |
| G6 LANDMARK→G7 DETAIL | primary/secondary/tertiary 차이, 주인공 재질·심장빛 집중, 나머지 화면 호흡. AI 점·halo·임의 scale변형·발광 원판·화면 전체 맥동0. 1x에서 분위기/형태가 읽히지 않으면 원화 생성 수와 무관하게 RETOUCH |
| G8 FINAL CAMERA + TECH | 1600×900 또는1920×1080 실제 게임 전체8장+접합/캐릭터 가림1x 크롭. 짧은 이동·motion 영상, full-map 한장, 실제 gate→arena, p95/p99/메모리/광원수. 정지 원화 합성을 runtime으로 보고0. 경로·충돌·진행/ledger·성능 검사와 시각 판정 모두 필요 |

**최종 인수 질문:** HUD 옆에서 같은 Hell Gothic 게임인가? 살아 있는 썩은 숲이 3초 안에 읽히는가? 피부/죽은 목질/동맥이 연결되는가? 전투 여백과 부분 빛·깊이가 느껴지는가? 캐릭터·적·탄·Q/E·드롭이 각각 읽히는가? 8카메라 중 한 곳이라도 반복/검정공동/접합 실패면 수정한다. 사용자 눈 승인을 받아야 1-1 전체 디자인 완료로 닫는다. 기술 PASS와 VISUAL PASS를 합치지 않는다.

## 10. MAP11 구현 단위 — 배정안이며 자동 착수 지시 아님

크기 S=계약/작은 독립 산출, M=하나의 실제 흐름/한 제작 gate, L=여러 gate/owner를 포함하여 착수 전 M으로 분할해야 하는 작업. 기본 설계는 L 한 덩어리 대신 아래 S/M으로 쪼갠다. Mac/PC는 **기존 담당을 재사용할 제안**, 새 팀 생성·메시지 발송0. 공용 변경은 명시 통합 오더에서만 실행한다.

| ID / 크기 | 담당·소유 / 앞 의존 | 구현 지시·인수할 실제 산출 |
|---|---|---|
| MAP11-01 / S | Mac / 이 설계·DEMO11-03 담당 합의 | 새 `scripts/maps/`·`data/maps/map11/`에 StageRecipe/anchor/region/provider result schema와 validator 최소 leaf. describe/content_valid·NOT_READY 이유·duplicate ID/anchor outside/끊긴route 검증 fixture. ABI/단위/반경·tie-break·소비자목록 확정. 공용/State/save0. preview valid를 runtime_ready로 승격0 |
| MAP11-02 / M | Mac 맵 담당 + 사용자 D01/D02 / 01 | 새 독립 Map11 blockout scene에 전체mass 윤곽·4지역·8시점·명명anchor·두고리 저작. 실제 기본 이동으로 치수/보행 폭 검수, 가짜 전투 완료0. G1 master/스케일/주랜드마크 승인. production 소품/미세 충돌 튜닝0 |
| MAP11-03 / M | 기존 아트 담당(Mac) + 사용자 D03 / 02 | 스타일key/큰외곽3실루엣 중 대표1·바닥접합1 proof. 기존 RGBA 품질/폐기 audit→MagicLight 필요한것만. 어두운 실제 Godot viewport 1x 비교 후 한 세트 style lock. 전체맵 생성/양산0 |
| MAP11-04 / M | Mac 맵 담당 / 02·03 | LEFT/RIGHT/TOP/START의BACK/MID/FRONT 대형 외곽 조립. 모듈/전체마스터로 연속된 숲mass·반복 숨김. G2 8시점 인수, 중앙 소품 먼저0 |
| MAP11-05 / M | Mac 맵·아트 / 04 | 중형 root shoulder/수피→피부 접합·그림자/오염, 새 master crop/bleed streaming content. G3/G4 seam·바닥 가독성 인수, 기존 웹청크 반입0 |
| MAP11-06 / M | Mac 맵 코드 / 01·02의확정geometry | 같은 geometry→static collider/LOS/spatial/flow cache compiler 및 실제 query provider. 반경/sweep/경계·tie-break·불가도달·revision/cancel 검증, 4지역/모든anchor 합법. 실제 노드/질의 결과 제출. 그림 알파로 충돌 생성0 |
| MAP11-07 / M | **DEMO11-03 기존 Mac 통합 담당**, World/factory/P3 owner 공동scope / 06 | 기존 source-frozen 맵 의존을 새 provider facade로 분리. spawn/굴/region 총량·kill 귀속/readback·gate/arena descriptor 연결. 공용 정확경로/줄과 tests 교체사유 선승인, 정직 미지원 유지. 한 M에 범위가 크면 spawn/navigation과region/arena 두M으로 분할. 게임수식/저장0 |
| MAP11-08 / M | **PC Claude MAP-LOOK 기존 담당** / 05·06 | 명시render handles/anchor role로 기존 light/sway/shadow/shaft 소비. camera provider bounds, 이중암전 방지, budget cull·근경가림. current main 숫자 A/B 출발→새스케일 조정, G5/G6 부분광/깊이 실제화면 |
| MAP11-09 / M | **PC Codex MAPLOOK-TOXIC/SHADOW/MIST 기존 담당** / 08·해당큐인수 | 기존3모듈 완료분만 회수·새 anchor/context 연결. 미제출은 미구현으로 유지, 같은 모듈 새Mac 복제0. 국소독액/접지/안개 motion 및 pause/cull 실창 증거 |
| MAP11-10 / M | Mac 맵 담당 + 기존 gate/boss 코드 담당 / 05·07·08 | 낮은 hero 제단/관문·arena 진입/복귀 geometry·상호작용 자리 완성. 기존 자연 앵글러/문지기 조건→gate→일반드루이드 arena/재시도/결과. boss AI·새State·맵발 판정 writer0 |
| MAP11-11 / M | Mac / 07·09·10 | 실제 정상 flow의전투 가독성/경로·처치분모·arena·pause/restart 통합검수, 새asset/streaming 정리. 직접 관련 suite만1회, 출력파일/실패줄·수치보고. 미연결 전투는 BLOCKED 표시. 여기서 G5/6/7 잔여마감 |
| MAP11-12 / M | Mac / 11 | G8 전체8카메라/1x크롭·motion 영상·전체맵, 실제GPU성능·메모리/로드. 하드웨어/조건/샘플/미검수 명시, §23 보고서. RETOUCH 화면만 고치고 통과항목 반복검사0 |
| MAP11-13 / M | 기존 PC 검수 담당 / 12 | 같은commit/recipe/profile/장면/부하로 Windows 시각·60fps/메모리·입력/해상도 교차확인. Mac 수치를 PC PASS로 대체0 |
| MAP11-14 / S | **사용자 최종 디자인 결정 + Mac 인수** / 12·13·D01~04 | 1-1 분위기·테마·전체 디자인·자연진행·양플랫폼 성능 인수. 공통ABI/logic/profile기준 revision 동결·잔여0또는명시보류. 승인 후에만 MAP12-01, 그완료후 MAP13-01. 미검수 상태에서 “로직완성”으로 승격0 |

## 11. 사용자 결정이 필요한 디자인 선택 — 현재 질문/승인 요청 아님

| 결정 ID / 필요한 시점 | 권장안 | 대안·영향 / 결정 전 진행 가능 범위 |
|---|---|---|
| D01 주 랜드마크 / MAP11-02 G1 | 갈라진 시체나무 + 낮은 심장 제단 한묶음, 북중부 | 큰 누운 고목 아치 + 문앞 제단도 가능. 실루엣/새원화/시선축이 달라짐. 결정 전 graph/provider/회색blockout 가능, hero 원화 양산 보류 |
| D02 생체 표현 강도 / MAP11-03 | 피부·동맥은 지면/갈라진틈의낮은대비, 목질이외곽주체·눈/고치는국소 | 더강한노출조직은 horror 인상이강하고재질·가독성검수증가. 현재사용자생체지옥목표는유지, 건강한숲대안은제외. proof 두크롭으로결정 |
| D03 아트 생성 예산/1차세트 / MAP11-03 | 기존RGBA 먼저 재검수→대표외곽/바닥proof만→승인후부족분 제작 | 전부새원화는일관성/비용/정리공수증가. 실제MagicLight잔액·현재장당표시비용·필요장수를담당이확인후총괄에구체견적. 이번생성/비용0 |
| D04 최소 사양/품질 하한 / MAP11-12 전 | Mac/Windows 모두1080p60을기본목표, 낮은설정에서도지역/전투가독성불변 | 최소지원기기/GPU·내부해상도와목표FPS를사용자가정하면성능gate확정. 결정전개발기측정/프로파일링은가능, 최소사양성능보증은미확인 |

## 12. MAP PRODUCTION REPORT — 이번 문서 작업

| 필드 | 상태 |
|---|---|
| STAGE / MASTER | CH1-1 새 제작 로직 설계만. 8시각장면/4게임지역/남북+두고리 제안, 새 geometry/씬 미구현 |
| OUTER MASS / LARGE / MEDIUM | 좌·우·북·남 4층 연속mass/3큰실루엣/접합 세트 계획. 제작·원화·비어있는hole 실측0 |
| GROUND / PLAYABLE | 피부/목질/동맥 전이·접지·전투여백과 provider 규약 제안. 실제충돌/동선/전투 검증 미실시 |
| LANDMARK | 시체나무+심장제단 권장안, 사용자 D01/D02 결정대기 |
| CAMERA QA | START/EARLY/ARENA/SIDE L/SIDE R/LANDMARK/LATE/EXIT 모두 향후 인수조건. 현재 main 캡처0·새맵눈검수 미실시 |
| TECH QA | 문서링크/경로/수치출처·main실재모듈/변경경계 점검만. Godot/성능/자연플레이/에셋생성 실행0; runtime PASS 주장이아님 |
| FILES / GIT | 이 설계서 + CHANGELOG_SYNC 절만 지정staging/정상훅/자기branch push. main/코드/에셋/공용/저장0. 원격SHA/DONE확인뒤 자기worktree제거, deploy0 |
| VISUAL VERDICT / NEXT PASS | **RETOUCH — 설계 단계/실맵 미구현·눈검수 미실시, 현재main을눈으로판정한결과가아님.** 다음은명시배정시MAP11-01, 1-2/1-3 선착수0 |

원로그·근거 발췌·문서 감사·최종 SHA는 `~/exoduser-wt/_out/map11-plan/`와 `DONE.txt`에 보존한다. 구현 승인이나 사용자 디자인 결정은 이 문서의 작성·push만으로 성립하지 않는다.
