# CH1 MAP KIT — Option B (타일 + 소품)

> 2026-08-19 | **DECISION LOCK: OPTION B**  
> v2 (`CH1_MASTER_16x9_v2.jpg`) = **ART DIRECTION / COMPOSITION REFERENCE**. FINAL 맵이 아님.  
> 본편 = 기존 **200×200 field** + `ground` 타일 + `_CH_DECO` / `_MAP_COMPOSE` 소품.  
> 이 문서는 감사 + 키트 설계. **에셋 생성·game.html 수정·v2 재생성·4K 없음.**

v2에서 CH1 visual SSOT로 가져가는 것:

| LOCK | 값 |
|---|---|
| 걸을 흙 | 약 70% (화면/필드 기준, 중앙 비움) |
| 형태 | 넓은 자연형 combat clearing, 넓은 통로 |
| 바닥 | brown / charcoal |
| 늪 | muted toxic green, 가장자리만 |
| 경계 | black corrupted roots |
| 악센트 | sparse red infernal, 외곽만 |
| 디테일 | 중앙 LOW / 외곽 HIGH |
| 비네팅 | 없음 (엔진 비네팅은 별개) |
| 카메라 | ARPG top-down / 3/4 가독 |

SSOT와 같음: 통이미지 한 장을 8000×8000에 늘리지 않는다.

---

## CURRENT MAP SYSTEM

### 1. Ground / tile

| 항목 | 코드·파일 | 실측 |
|---|---|---|
| 장 바닥 | `_gtFloorImg(0)` → `assets/map/ch1/ground_dark_soil.png` | **1024×1024** 반복 |
| 타일 피치 | `_gtTileSz` | 이미지 폭 128~1024면 그 값, 아니면 256 |
| 보조 흙 | `ground_tile_03.png` | 1024×1024. `_GT_FILES.gt_03` 등록, hell 0 기본은 soil |
| 전이 타일 | 없음 | 늪·균열·그을음 오토타일 없음 |
| 바닥 마크 | `_paintHellFloorMarks` | `hell<=0`이면 return. CH1 데칼 안 그림 |
| 벌레 데칼 팩 | `_TILE_DECAL_SRC` | **로드 주석 처리.** 미사용 |

바닥은 **흙 한 장 타일링**이다. v2의 금 간 돌+독늪 베이는 타일이 아니라 그림이었다.

### 2. 200×200 월드

| 항목 | 값 |
|---|---|
| 생성 | `genFromTemplate` ← `_cloneField11` ← `FIXED_MAPS[0]` |
| 크기 | `mw=mh=200`, `T=40` → **8000×8000 px** |
| 시작 / 문 | 6시 / 12시 (맵 규칙) |
| 워크메쉬 | 기본 전 타일 바닥 `[1,40000]` 반전 아님. `basin`이면 `_buildBasinRLE`, `path`면 길 RLE |
| 배치 | `_MAP_COMPOSE[si]` + `initMapObjects()` + `_CH_DECO` |
| `hand:1` | 통바닥 + compose에 적은 커스텀만. 자동 살포 끔 |
| 1-1 compose | `{hand:1, dense:1, lm:[], mega:[], forestBoundary:1, handProps:63개}` — structural module 0, outer-enabled wall fallback 0 |
| 1-1 우중 고지대 | `(147,98)`, `rx18/ry9`, west ramp `x125→135`; 기존 `m_c1gedge` 재사용, `MAP_OBJS` 추가 0 |
| 스트리밍 | `_STREAM_CHUNK` 200×200에서 **64타일 (2560px)** |

본편 1-1은 이미 이 골격이다. Option B는 여기를 비우고 림에 키트를 올리는 것.

### 3. 타일 크기 / 텍스처 크기

| | px |
|---|---|
| 월드 타일 `T` | **40** |
| 흙 텍스처 | 1024 (한 텍셀이 월드 약 0.039 타일. 화면에는 1024px 패턴이 반복) |
| 해골 벽 타일 | 256 (`ch2/skull_wall_tile.png`) |
| 벽 엣지 | `wall_edge_tile.png`, 그릴 때 폭 `T×3` |
| 스트리밍 청크 | 64×64 타일 = 2560×2560 px 캔버스 |

### 4. Static map object

`MAP_OBJS[]`. 소스:

- `_CH_DECO[0]` 자동 살포 (large / scatter / 소형). `_testbed`면 살포 안 함
- `_MAP_COMPOSE`의 `empty` / `handProps` (CH1-1 현행 63개) / `forestBoundary:1`. `mega` / `lm` / `uni`는 현행 CH1-1에서 비활성
- 용해골: legacy `keepDragon` 자동분기와 과거 `mega` 용 2종 모두 현행 reference miniature 배치에서 off

메타: `_OBJ_META` + `_CH_DECO` 필드 (`sz`, `col`/`collision`, `colSz`/`colW`/`colH`/`colOy`, `keepAR`, `large`, `mega`, `flip`, `light`, `touchAnim`).

렌더: `MAP_OBJS`를 **배열 순서로 한 번에** 그림. 플레이어와 **Y소트 없음.**

### 5. Collision

`isW(px,py)`:

1. 맵 밖 = 벽  
2. `G.map[ty][tx]===1` = 벽  
3. 오브젝트 `col` 또는 `collision`: 원(`colSz` 또는 `sz×0.4`) 또는 타원(`colW`/`colH` + `colOy`)

폴리곤 충돌 없음. 이미지 알파로 콜라이더를 굽지 않음 (SSOT와 동일).

### 6. Foreground / occluder

| | 상태 |
|---|---|
| SSOT 레이어 | 계획만. “Y소트 스프라이트” |
| 런타임 Y소트 | **없음.** 오브젝트 패스 후 플레이어가 따로 그려짐 → 큰 나무는 항상 캐릭터 뒤 |
| `keepAR` | 비율 유지. 가림 아님 |
| `anchorBottom` | 고어 몇 개만. 발밑 정렬 |

키트 FOREGROUND(캐노피/아치)는 **코드가 하나 더 필요**하다. 지금은 에셋만 넣어도 캐릭터 위를 가리지 않음.

### 7. Decal

| 시스템 | 상태 |
|---|---|
| insect `_TILE_DECAL` | 코드만, 로드 OFF |
| `_paintHellFloorMarks` | CH1 스킵 |
| 웅덩이/뼈 | **소품**으로 바닥에 올림 (타일 데칼 아님) |

금 간 흙·피·재는 새 타일 또는 소형 소품. 전용 데칼 레이어는 꺼져 있다.

### 8. Animated env / VFX

| 시스템 | 기본 | 비고 |
|---|---|---|
| `OPT.fog` 스모그 | on | hell 0은 녹빛. 독안개로 재사용 가능 |
| `OPT.ambPart` | **off** (울트라만 on) | 부유 입자. 불씨로 재사용 가능 |
| `initTorchLights` | `return` | 꺼짐 |
| `initGlowObjects` | `return` | 꺼짐 |
| `initSwayObjects` | `return` | 꺼짐 |
| `_buildDecorList` / `MAP_DECOR_DEFS` | `return` | 리스트는 남아 있음. 런타임 미사용 |
| `touchAnim` 나무 | on | `anim_tree_01` 2프레임 |
| `trackEye` | 메타 있음 | 눈 나무 |
| pit_blood 함정 | 주석 처리 | 제거됨 |
| 늪 거품 / 작은 지옥불 | **없음** | |

### 9. FIELD_ONE.png 역할

| | |
|---|---|
| 경로 | `assets/map/ch1/master/CH1_FIELD_ONE.png` 1448×1086 |
| 역할 | `?stage=0&plate=fieldone` 키트 테스트. **36×27** 통그림 |
| 본편 | 아님. 200×200이 아님 |
| 지금 `?stage=0` | PROD 2176×1224 구도 QA (임시) |

Option B 본편은 FIELD_ONE/PROD를 디퓨즈로 쓰지 않는다.

### 10. CH1 환경 인벤토리 (디스크 + 코드)

**바닥:** `ground_dark_soil.png` 1024, `ground_tile_03.png` 1024.  
**벽:** 해골 패턴(ch2) + `wall_edge`. 뿌리 벽 타일 없음.  
**collision/ (주요):** 저주나무 01–12 (512), hang_cage, cage_gate, skull_altar, bone_arch, eye_tree, rotten_tree(**64×64 자리표시**), vine_pillar(48×80), mega_ribs/head/statue/chapel, boss_gate, pit_poison, 폐기 대기 prop_*.  
**floor_objects/:** tree_dead 01–03 (64), bones, deco_bones, corpse, poison_pool/puddle, acid_pool, vine_roots, meat_stake, flesh_pile, 꽃, 눈알, 살점 스캐터 등 53파일.

---

## REUSABLE ASSETS

v2 룩(갈흑 흙, 독녹 늪, 검은 뿌리, 외곽 철창/제단)에 **거의 그대로** 쓸 수 있는 것.

| id / 파일 | 그룹 | 이유 |
|---|---|---|
| `ground_dark_soil.png` | GROUND | 본편 흙. 색이 v2 charcoal에 가장 가까움 |
| `m_ctree1`~`12` | PROP / EDGE | 저주나무 512. 림 프레임 |
| `m_rotten_tree` | PROP | 메타만 있음. **파일 64px → modify** |
| `m_hang_cage` | PROP / LANDMARK | 교수대+새장. v2 철창 |
| `m_cage_gate` | PROP | 철창 문 |
| `m_skull_altar` | LANDMARK | 폐허 제단 |
| `m_bone_arch` | LANDMARK / FOREGROUND | 뼈 문. Y소트 전엔 랜드마크만 |
| `m_obelisk` `m_skull_totem` | PROP | 작은 지옥 구조 |
| `bones` `deco_bones_*` `m_fbones` | PROP | 뼈더미 |
| `corpse` | PROP | 시체 |
| `meat_stake` | PROP | 말뚝 |
| `poison_puddle` `poison_pool` `m_acid` | GROUND/EDGE | 독늪 소품 (타일 아님) |
| `pit_poison` | EDGE | 밟으면 벽. 큰 독웅덩이 |
| `vine_roots` `m_vine_pillar` | EDGE | 뿌리. pillar 소스는 48px → modify |
| `m_mega_ribs` | LEGACY LANDMARK | 현행 1-1 reference compose에서는 미사용 |
| `boss_gate` | LANDMARK | 12시 문 |
| `OPT.fog` | VFX | 녹 안개 재튜닝 |
| `OPT.ambPart` | VFX | 불씨. 기본 off |
| `empty` / `rim` / `hand` in compose | 시스템 | 중앙 비움·림 밀기 **코드 이미 있음** |

---

## MISSING ASSETS

| 구멍 | 왜 필요한지 |
|---|---|
| 금 간 흙 / 그을음 흙 타일 | v2 중앙은 돌 균열. 지금 흙 한 장 |
| 늪 전이 타일 (흙↔독물) | 소품 웅덩이만 있음. 가장자리 70% 흙을 타일로 못 그림 |
| 뿌리 벽 타일 또는 뿌리 벽 소품 키트 | 벽이 해골 타일. v2 경계는 검은 뿌리 |
| 깨진 지면 엣지 | 없음 |
| 쓸 만한 dead tree (64px 아닌) | `tree_dead_*` `rotten_tree`가 64px |
| 거대 썩은 나무 (mega) | mega는 석상/뼈/예배당. 거목 없음 |
| 지옥불 작은 VFX | 토치/글로우 꺼짐. 구이에 안 굽기로 SSOT |
| 늪 거품 | 없음 |
| 캐노피/아치 전경 | 에셋+ **Y소트 코드** 둘 다 없음 |
| 울타리 소품 | hang_cage만. 짧은 뿌리·고철 울타리 없음 |

살점 스캐터·종양·눈버섯(`prop_mush` 등)은 디스크에 있으나 **v2 SSOT와 안 맞음.** 1-3 버섯 구역용이면 따로. 1-1 키트에 넣지 않음.

---

## CH1 MAP KIT SPEC

권장 픽셀: 엔진 `sz`는 월드 px. 소스는 그 2~3배(레티나). 타일은 512 또는 1024 심리스 (`_gtTileSz` 범위).

범례: E=existing / R=reusable / M=modify / N=new

### GROUND

| 키트 id | 설명 | 상태 | 소스 px | 충돌 | FG | 애니 |
|---|---|---|---|---|---|---|
| `g_dirt` | charcoal 흙 베이스 | E / R | 1024 (`ground_dark_soil`) | 타일 0 | — | — |
| `g_dirt_b` | 흙 변형 (타일 반복 깨기) | M | `ground_tile_03` 재색 또는 1024 신규 | 타일 0 | — | — |
| `g_crack` | 금 간 흙/돌. 중앙 LOW | N | 512~1024 심리스 | 타일 0 | — | — |
| `g_burn` | 그을음. 림 근처만 | N | 512~1024 | 타일 0 | — | — |
| `g_swamp` | 독녹 얕은 물 채움 | N | 512 심리스 | 타일 1 또는 pit | — | 선택(물결) |
| `g_swamp_x` | 흙↔늪 전이 | N | 256 엣지 세트 또는 3×3 | 가장자리만 | — | — |

1단계는 `g_dirt`만으로 200×200을 깔고, `g_crack`/`g_swamp_x`는 2단계. 전이는 오토타일이 없으면 **소품 웅덩이+벽**으로 흉내 가능.

### EDGE

| 키트 id | 설명 | 상태 | 소스 px | 충돌 | FG | 애니 |
|---|---|---|---|---|---|---|
| `e_swamp_rim` | 독늪 물가 | M | puddle/pool/pit_poison | pit만 col | — | 거품은 VFX |
| `e_root_wall` | 검은 뿌리 벽 | N (+ 해골벽은 폴백) | 타일 256 또는 소품 512 | 타일 1 또는 col | — | — |
| `e_root_prop` | 뿌리 덩어리 | M | `vine_roots` / vine_pillar 재작업 | col 약 | — | — |
| `e_break` | 깨진 지면 턱 | N | 256~512 | 선택 | — | — |
| `e_fence` | 짧은 뿌리·고철 울타리 | N | 256×128, sz 160 | col 얇게 | — | — |

### PROP

| 키트 id | 설명 | 상태 | sz / 소스 | 충돌 | FG | 애니 |
|---|---|---|---|---|---|---|
| dead tree | 죽은 나무 | M | sz 280~400 / 소스 **512** (`tree_dead` 64는 교체) | col | 나중 FG | — |
| cursed tree | 저주나무 12 | R | sz 400 / 512 | colSz 60 | — | 일부 eye |
| anim tree | 접촉 2프레임 | R | 400 / 1536×1024 | col | — | touchAnim |
| cage | 매달린 철창 | R | hang_cage sz 280 / 188×350 | col | — | — |
| cage_gate | 철창 문 | R | 300 / 248×324 | col | — | — |
| bone pile | 뼈 | R | 32~64 / floor bones | 없음 | — | — |
| fence | 울타리 | N | 위 e_fence | col | — | — |
| shrine small | 작은 폐허 | R | skull_altar 300, totem 240 | col | — | — |
| stake | 말뚝 | R | meat_stake 64 | 없음 | — | — |
| corpse | 시체 | R | corpse 40 | 없음 | — | — |
| small hell | 오벨리스크 등 | R | obelisk 300 | col | — | — |

### LANDMARK (구역당 0~1. compose로 좌표 고정)

| 키트 id | 설명 | 상태 | sz | 충돌 | FG | 애니 |
|---|---|---|---|---|---|---|
| giant rotten tree | 거대 썩은 나무 | N | 800~1100 / 소스 1024+ | col 타원 | 선택 | — |
| gallows | 교수대 | R | hang_cage 키우기 또는 N 512 | col | — | — |
| corrupted altar | 오염 제단 | R | skull_altar / penta 350 | col | — | — |
| ruined gate | 폐허 문 | R | bone_arch 300, boss_gate, mega_chapel | col | 문만 FG 후보 | — |
| mega ribs | 거대 뼈 | R | 1-1 림. **sz 900, QA≤1000** (1100/1400 금지) | colW380 | — | — |

용해골 legacy 중앙 자동분기는 `keepDragon` OFF로 0개다. 2026-08-28 reference compose의 `mega:[]`도 비어 있으므로 si0 mega는 총 0개다.

### FOREGROUND

| 키트 id | 설명 | 상태 | 소스 | 충돌 | FG | 애니 |
|---|---|---|---|---|---|---|
| canopy / 큰 뿌리 | 캐릭터 앞을 가림 | N + **코드** | 1024 세로 | 줄기는 col | **Y소트 필요** | sway 나중 |
| arch / gate | 통과 아치 | M bone_arch | 512+ | 기둥만 col | Y소트 | — |
| tall structure | 키 큰 폐허 | M mega_statue 등 | 기존 | col 발 | Y소트 | — |

에셋만 넣고 코드 없으면 캐릭터가 항상 앞에 그려진다. **1차 구현에서 FG는 빼는 것을 권장.**

### VFX (이미지에 굽지 않음 — SSOT)

| 키트 id | 설명 | 상태 | 비고 |
|---|---|---|---|
| toxic mist | 독 안개 | R | `OPT.fog` hell0 색 재튜닝 |
| small hellfire | 작은 지옥불 | N 또는 torch 재활성 | 림 뿌리만. `light:1` 소품 |
| embers | 불씨 | R | `OPT.ambPart` CH1만 약하게 |
| swamp bubbles | 늪 거품 | N | 파티클 또는 puddle 시트 |

---

## IMPLEMENTATION ORDER

2026-08-24 기준 2~5단계의 기존 에셋 손 배치가 구현됐다. 신규 에셋·GROUND 전이타일·FG Y소트는 여전히 후속 범위다.

1. **docs LOCK** — 이 문서 + SSOT에 Option B 한 줄 (이번 단계).  
2. **1-1 compose만** — `hand`에 가깝게. 중앙 `empty` 크게, 림에 나무+제단+철창 소수. 새 그림 없이 기존 에셋.  
3. **GROUND** — soil 유지. 필요하면 `g_crack` 한 장만 추가.  
4. **EDGE** — pit_poison + puddle을 림에만. 뿌리 벽은 소품으로 먼저 (타일 세트는 나중).  
5. **LANDMARK 1개/구역** — compose 좌표.  
6. **VFX** — fog 색, 불씨.  
7. **FG Y소트** — 코드 작업. 그 전엔 캐노피 금지.  
8. FIELD_ONE / PROD `?stage=0`은 룩 레퍼런스 URL로만 남김.

---

## RISKS

| 위험 | 내용 |
|---|---|
| 통그림 유혹 | PROD를 200×200에 늘리면 QA에서 본 우표 맵 + 흐린 크랙이 재현됨 |
| 살점 스캐터 | `_CH_DECO` 기본 살포가 v2 숲을 1-3/6장처럼 만듦. 1-1은 `hand` 또는 풀 축소 |
| 64px 나무 | `tree_dead`/`rotten_tree`를 sz 400으로 늘리면 깨짐 |
| FG 없음 | 큰 나무를 중앙 근처에 두면 항상 캐릭터 뒤 |
| 해골 벽 | v2 경계는 뿌리. 해골 벽을 전면에 쓰면 룩이 갈라짐 |
| `?stage=0` PROD | 본편과 테스트베드가 다름. 헷갈리면 `plate=fieldone`으로 복구 |

---

## CURRENT / NEXT

- **현행 2026-08-30:** reference landmark 관계를 기존 CH1 에셋 `handProps` 63개로 유지하고, structural module 59개는 baked-aligned canonical forest tile boundary로 교체했다. mega/자동 filler는 0개다.
- **후속:** `g_crack`/뿌리 엣지 소품, 늪 전이타일, FG Y소트는 아직 미구현이며 별도 승인 범위다.
- `?stage=0` PROD/FIELD_ONE 테스트 경로는 이번 변경에서 건드리지 않았다.
