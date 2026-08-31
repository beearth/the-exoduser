# EXODUSER 맵 제작·최적화 SSOT

> 2026-08-17 | STATUS: **METHOD LOCK** (픽셀 크기·청크 px는 OPEN)  
> 2026-08-19 | CH1 본편: **OPTION B LOCK** — v2는 룩 레퍼런스. 200×200 = 타일+소품. 키트: `CH1_MAP_KIT_OptionB.md`
> 원안: 사용자 초안. 엔진 수치는 `game.html` / `맵유형_확장기획.md`와 동기화.
> 이미지 제작은 이 문서만 본다. 통이미지 스탬프·페인트맵 전맵 스트레치는 폐기.

---

## 0. 한줄

맵은 **고밀도 지옥 환경**과 **읽히는 핵슬래시 전투 공간**을 동시에 만족해야 한다.  
대표 전체맵 1장으로 구조를 잡고, 12 MASTER PLATE로 만들고, 런타임은 레이어+청크로 쪼갠다.

통이미지 한 장을 8000×8000에 늘려 밟게 하지 않는다.

**타게임 전수조사 (제작 방법):** `맵제작_타게임전수조사.md`  
출시작 전부 바닥=재료, 장소=키트+소품, 충돌=별도. 플레이트는 설계도이지 런타임 디퓨즈가 아니다.

---

## 1. 목표

각 장(챕터)의 대표맵에서 다음을 만든다.

| 결과물 | 역할 | 누가 |
|--------|------|------|
| MASTER MAP CONCEPT 1장 | 전체 구조·장소성 설계도 | 이미지 제작 |
| MASTER PLATE 12장 (4×3) | 고해상도 제작 단위 | 이미지 제작 |
| Ground Bake | 바닥 정적 디테일 | 이미지 → 엔진 Ground |
| Static Props | 옮길 수 있는 큰 소품 | 이미지 → `_CH_DECO` / compose |
| Foreground Occluder | 캐릭터 앞을 가리는 것 | 이미지 → Y소트 스프라이트 |
| Collision | 사각형/원/폴리 | 엔진 (이미지에서 계산 금지) |
| Runtime Chunk | 주변만 GPU에 유지 | 엔진 (이미 스트리밍 있음) |
| VFX | 불·독·안개 등 | 이미지에 굽지 않음 |

---

## 2. 엔진 LOCK (코드와 같음)

| 항목 | 값 | 코드 |
|------|----|------|
| 대표/일반 맵 타입 | field 200×200 | `_cloneField11`, `T=40` → **8000×8000px** |
| 시작 / 출구 | 6시 시작, 12시 보스문 | 맵 규칙 |
| 생성 | `genFromTemplate` only | `genGauntlet` 폴백 |
| 스트리밍 | 있음. 청크 32~64타일 (1280~2560px) | `_STREAM_CHUNK` |
| 바닥 타일 | 장별 `_gtFloorImg` | ch1 `ground_dark_soil.png` |
| 배치 | `_MAP_COMPOSE` + `_CH_DECO` | hand=커스텀만 |
| 특별 던전 | si 11, 16, 33 `ready:false` | 아직 필드 |
| 제작 단위 | 지옥 한 장 | `맵구성_1장.md` |

픽셀 미LOCK: MASTER plate 정확한 px, overlap %, VRAM, 동시 청크 수.

### 2.1 맵 경계 렌더·카메라 (코드와 같음, 2026-08-23)

맵 렉트(walkable) 밖 void 처리와 카메라 경계 동작. 배경: 카메라가 맵 코너(예: 좌하단)에 붙으면 바닥 레이어는 맵 렉트로 클리핑돼 밖이 안 그려지는데 라이팅(어둠)은 뷰포트 전체에 그려져, 코너에 **검은 빈 영역**이 남던 버그를 수정.

| 항목 | 동작 | 코드 |
|------|------|------|
| 카메라 클램프 | 카메라를 맵 bounds 안으로 클램프 → 코너에서 맵 밖 void 미노출. 보스전 줌아웃(`_camZoom` 0.80) 반영해 가시 반경 확장. 에디터 모드 제외 | `update()` 카메라 추적 직후 `[CAM-CLAMP]` |
| void 바닥 타일링 | `_fillVoidWithFloor` 타일링 범위 = **카메라 뷰포트 렉트(줌 반영)+1타일 마진**. 맵 렉트 기준 아님 | `_fillVoidWithFloor` `[VOID-VP]` |
| 경계 페이드 | 맵 rect 경계에서 floor→어둠 **알파 페이드**(하드 밴드 대신). 4방향 그라데이션 | `_fillVoidWithFloor` `[EDGE-FADE]` |
| 어둠 밝기 | **불변** — `_HELL_AMBIENT`, ATMOS, 밴드 색·최대알파(`#050507`/`.82`) 무수정 | — |

> 미확인(2026-08-23): "발밑 가로선 추종 여부", "보스전 줌아웃 코너"는 시각 검증 전 — 확정 시 갱신.

**LOCK 후보 (테스트 전 권장):**

| 항목 | 권장 | 이유 |
|------|------|------|
| MASTER 전체 | 8192×6144 (4:3) | 4×3 = 플레이트당 **2048×2048** |
| Plate overlap | 12% (~246px @2048) | 길·조명 이음 |
| Runtime chunk | 엔진 기존 타일 청크 유지 | 새 텍스처 청크는 plate bake 후 |
| 플레이 면적 | 화면의 60~70% | 핵슬래시 |

---

## 3. 7장 테마 (얼굴)

지옥 한 하강. 색만 바꾸지 않는다. 문장: `맵구성_지옥전체.md`.

| 장 | Theme | 반드시 보일 것 | 하지 말 것 |
|----|-------|----------------|------------|
| 1 썩은 숲 | Rotten Forest | 죽은 거목, 독늪, 교수대/철창, 뼈, 폐허, 지옥 불씨. **지옥 안의 숲** | 노란 키틴, 만화 버섯, 형광 연두 |
| 2 벌레굴 | Worm Cave | 거대 벌레 굴, 알집, 고치, 키틴, 산성, **번식장** | 노란 키틴 바닥, 눈버섯 |
| 3 얼음동굴 | Frozen Hell | 검은 얼음, 수정, 봉인, 푸른 불 + 심연의 **붉은 지옥광** | 예쁜 빙하 관광지 |
| 4 화염지대 | Hell Fire | 용암, 현무암, 화로, 불타는 성채. 규모가 열린다 | 주황 필터만 씌운 1장 |
| 5 지옥 군단 | Hell Legion | 병영, 공성, 깃발, 처형장. **문명·군사** | 자연 지형만 |
| 6 사도 마굴 | Apostle Den | 신전, 제단, 살점 구조, 거대 고치. **엘리트 성역** | 아무 살점 동굴 |
| 7 지옥성 | Hell Castle | 수도, 대성당, 해자, 진입로, 최종 성문. 1~6 언어 집약 | 작은 성 한 채 |

---

## 4. 대표맵 카메라

MASTER MAP은 인게임보다 넓은 영역을 내려다본 **환경 설계도**다. 콘셉트 일러스트가 아니다.

| 할 것 | 하지 말 것 |
|-------|------------|
| Elevated top-down / Quarter view | 강한 소실점 투시 (성으로 빨려 들어가는 원근) |
| ARPG 시점, 인게임 카메라와 같은 방향 | 플레이어·UI·글자 |
| 길·절벽·랜드마크가 미니맵처럼 읽힘 | 화면 전체를 같은 바닥 텍스처로 채움 |

공통 프롬프트 머리:

```
Elevated top-down ARPG map, quarter view, same camera as Diablo-like overhead, no strong vanishing-point perspective, no player, no UI, no text, gothic painterly hell.
```

---

## 5. MASTER 격자 — 4×3 = 12 PLATE

하나의 맵을 만들기 위한 **12개 연결된 고해상도 영역**. 맵 12개가 아니다.

```
        12시 보스문 / 북쪽
A1    A2    A3    A4
B1    B2    B3    B4
C1    C2    C3    C4
        6시 시작 / 남쪽
```

| 행 | 역할 |
|----|------|
| A | 북쪽. 게이트, 원경, 거대 실루엣 |
| B | 중부. 전투 공간 + 랜드마크 |
| C | 남쪽. 시작, 진입, 근경 프레임 |

플레이어는 대략 C2–C3에서 시작해 B를 지나 A2–A3 게이트로 간다.

파일:

```
assets/map/ch{N}/master/CH{N}_MASTER.png
assets/map/ch{N}/master/CH{N}_A1.png … CH{N}_C4.png
```

---

## 6. 플레이트 생성 순서

각 Plate를 독립 그림으로 뽑지 않는다.

```
MASTER MAP
  → A1
  → A2 (A1을 레퍼런스)
  → A3 (A2 레퍼런스)
  → A4
  → B1 …
```

인접 Plate는 **10~20% overlap**. 유지할 것: 길, 높이, 절벽, 거대 오브젝트, 빛 방향, 색, 밀도.

---

## 7. PLAYABLE ROAD (최우선)

디테일이 전투를 먹으면 실패.

| 영역 | 화면 비율 | 하는 일 | 규칙 |
|------|-----------|---------|------|
| PLAY AREA | 60~70% | 이동, 전투, 몹, 투사체, 드랍 | 텍스처 노이즈↓, 큰 오브젝트↓, 명암 과함↓, 경계 명확, 캐릭터 실루엣 |
| ENVIRONMENT | 30~40% | 장소성 | 절벽, 거목, 성벽, 거대 뼈, 조각상, 심연, 건축, 용암 |

1-1 현행(2026-08-28): `m_c1tree`(102,90) 하나가 중앙 HERO이며 START→EXIT 축은 negative space다. cocoon/camp/bone arch/altar/pool/poison pit가 좌우 side POI를 만든다. legacy keepDragon과 `mega`/`lm`/자동 filler는 모두 OFF다.

---

## 8. 인게임 레이어 (통이미지 금지)

```
BACKGROUND
  GROUND
    GROUND DECAL
      STATIC PROP
        GAME OBJECT
          CHARACTER / ENEMY
            FOREGROUND OCCLUDER
              VFX
                UI
```

MASTER 한 장을 GPU에 통째로 올리지 않는다. 런타임은 레이어 + 기존 타일 스트리밍.

---

## 9. GROUND — 굽는 것

바닥에 고정된 작은 것은 Bake.

흙, 균열, 작은 돌, 작은 뼈, 핏자국, 잔해, 바닥 문양.

별도 객체 만들지 않음. 엔진: `_gtFloorImg` + (선택) ground decal 텍스처.

---

## 10. STATIC PROP — 분리하는 것

옮기거나 반복할 큰 것.

바위, 기둥, 나무, 제단, 감옥, 철창, 시체 더미, 조각상, 큰 뼈.

엔진: PNG 개별 + `_CH_DECO` / `_MAP_COMPOSE.lm|mega`. 충돌은 col 박스/원.

---

## 11. FOREGROUND OCCLUDER

캐릭터보다 앞에 나와야 하는 것.

거목 수관, 아치, 지붕, 거대 뿌리, 절벽 턱, 문.

Y소트. 필요 시 fade / cutaway. 이미지에 캐릭터를 굽지 않음.

---

## 12. VFX — 굽지 않는 것

불, 연기, 용암 흐름, 독 연기, 안개, 재, 눈, 빛, 영혼, 피, 마법.

정적인 Ground 위에 동적으로 올린다.

---

## 13. Collision

이미지 실루엣에서 계산하지 않는다.

Rectangle / Circle / Polygon만. 복잡한 나무 모양 ≠ 충돌 모양.

엔진: 타일(분지/필드) + `_OBJ_META.col`.

---

## 14–15. Runtime Chunk / 메모리

12 PLATE = **제작 단위**. 게임 청크가 아니다.

엔진은 이미 타일 청크 스트리밍 (`_STREAM_CHUNK` 32~64).  
후에 Ground bake를 청크 텍스처로 바꾸면 그때 px를 LOCK.

VRAM: `width × height × 4`. 8000×8000 RGBA ≈ 256MB — 통이미지 상시 로드 금지.

---

## 16. 반복 요소

돌, 뼈, 나무, 철창, 제단, 기둥, 조각, 용암 균열, 시체, 깃발은 **에셋화**해서 재사용.

MASTER Plate는 **그 장만의 구조와 원경**.

---

## 17. 랜드마크

구역마다 식별 가능한 것 최소 1.

1장 용해골, 2장 여왕/알, 3장 봉인제단, 4장 화로, 5장 공성탑, 6장 거대 눈, 7장 검은 성.

---

## 18. 리듬

```
ROAD → COMBAT → NARROW → LANDMARK → COMBAT → TRANSITION
```

전투 광장만 이어지는 평평한 맵 금지. 시작 6시·출구 12시는 유지.

---

## 19. Height Illusion

2D여도 절벽, 심연, 계단, 다리, overhang, foreground로 **높이가 있는 세계**처럼.

2026-08-29 CH1-1 실증은 illusion만이 아니라 실제 stage-local collision/height를 갖는다.

| 항목 | CH1-1 우중 제단 값 |
|---|---|
| 정상 | 중심 `(147,98)`, `rx18/ry9`, height 1 |
| 절벽 | `.84≤정규화 타원거리≤1.04`, `isW` 차단 |
| ramp | 서쪽 `x125→135,y98`, 반폭 `1.8→3`, smoothstep 0→1 |
| 시각 | 기존 `m_c1gedge` 기반 뿌리 단구, 신규 에셋 없음 |
| 금지 | 전 stage 자동 확산, 메인 진행축 고저 강제, `heightRle` 전역 구현으로 오기 |

---

## 20. 화면 밀도

| 층 | 어디 | 디테일 |
|----|------|--------|
| LOW | 실제 플레이 면 | 낮음. 캐릭터·적·스킬이 읽힘 |
| MEDIUM | 길 가장자리 | 중간 |
| HIGH | 배경 / 절벽 / 랜드마크 | 높음 |

화면 전체가 같은 바닥 타일로만 채워지면 실패.

---

## 21. 장 간 발전

```
CH1 야생 지옥 → CH2 생태계 → CH3 고대 → CH4 재해
 → CH5 군사 문명 → CH6 종교/지배 → CH7 수도
```

숲에서 시작해 하나의 지옥 세계를 통과한 느낌이 나야 한다.

---

## 22. 파이프라인

```
01 Chapter Theme
02 Representative Map Concept     ← 지금 이미지 작업은 여기부터
03 Gameplay Route Blockout        (6시→전투→랜드마크→12시)
04 4×3 MASTER GRID
05 12 MASTER PLATE (인접 레퍼런스)
06 Seam Correction
07 Ground Bake
08 Props 분리
09 Foreground/Occluder 분리
10 Runtime Chunk (엔진 연동)
11 Collision
12 VFX
13 In-game Integration
14 Performance Test
```

한 장을 이 파이프라인으로 끝낸 뒤 다음 장.

---

## 23. 품질 GATE

### VISUAL
- [ ] 장 특징이 한눈에
- [ ] 지옥으로 읽힘
- [ ] 다른 장과 실루엣이 다름
- [ ] 랜드마크 있음
- [ ] 깊이 있음

### GAMEPLAY
- [ ] 캐릭터 위치가 즉시 보임
- [ ] 적·투사체가 바닥과 구분
- [ ] 이동 가능 영역이 읽힘
- [ ] 전투 공간 충분 (플레이 면 60%+)
- [ ] 거대 장식이 전투를 안 막음

### TECH
- [ ] 통이미지 상시 VRAM 없음
- [ ] Collision 분리
- [ ] VFX만 동적
- [ ] 청크 로딩 가능
- [ ] 반복 에셋 재사용
- [ ] FPS 실측

---

## 24. LOCK / OPEN

**LOCK**
- 7장 테마, 장당 대표맵 1, 대표맵=설계도
- 4×3 = 12 MASTER PLATE, Plate ≠ Runtime Chunk
- Ground Bake / Prop / Occluder / Collision / VFX 분리
- 플레이 면 60~70%, 주변 청크만 활성 (엔진 기존)
- 강한 투시 통이미지로 밟기 금지

**OPEN (실측 후)**
- Plate 정확한 px (권장 2048)
- Overlap %
- 텍스처 포맷
- VRAM budget
- Occluder 페이드 방식

---

## 25. 지금 만들 것 — CH1 이미지 팩

1장만. 나머지 장은 1장 GATE 통과 후.

**스타일 LOCK (2026-08-17)**

| 파일 | 역할 |
|------|------|
| `assets/map/ch1/master/CH1_STYLE_VISTA.jpg` | 1장 장소성. 독늪·철창·거목·북쪽 지옥성 |
| `assets/map/ch1/master/HELL_DESCENT_STRIP.jpg` | 카메라. 고각 쿼터뷰, 절벽 위 길. 7장 하강 |
| `assets/map/ch1/master/CH1_MASTER_16x9.jpg` | v1 구도 레퍼런스. 원형 분지. 런타임 금지. 폐기 아님 |
| `assets/map/ch1/master/CH1_MASTER_16x9_v2.jpg` | **COMPOSITION SSOT LOCK**. 1280×720. 구도 재생성 금지 |
| `assets/map/ch1/master/CH1_MASTER_16x9_v2_PROD.jpg` | v2 고해상 조립 2176×1224. 4플레이트 18% overlap 블렌드. 4K native 불가 |

12장 드롭: `assets/map/ch1/master/plates/CH1_A1.png` … `CH1_C4.png`  
미리보기: `http://localhost:3333/assets/map/ch1/master/index.html`

**키트 필드 테스트:** `http://localhost:3333/game.html?stage=0` → 기본 `CH1_MASTER_16x9_v2_PROD.jpg` (native 1:1, 55×31).  
복구: `?stage=0&plate=fieldone` → `CH1_FIELD_ONE.png` 36×27. `?classic=1`이면 본편 1-1.  
**35맵 본편 QA 허브:** `npm run serve:map` → `http://127.0.0.1:3334/`. 모든 맵에 `classic=1&mapqa=1`을 강제하며 `si 0~34`를 무전투 상태로 선택·새로고침·새 창·에디터로 열 수 있다. 세부 계약은 `MAP_TEST_SERVER.md`.
인게임 구도 QA: `qa_ch1_master_16x9/QA_REPORT_INGAME.md` (**NEEDS_REVISION**, 한 화면≈맵).

둘째 장(스트립)이 **카메라 정답**. 첫째 장은 **1장 소품·색**. 플레이트는 스트립처럼 길을 위에서 그리고, 비스타의 독녹·철창·성을 넣는다. 강한 소실점 한 장으로 밟지 않는다.

### 25.1 제출 목록

| # | 파일 | 내용 |
|---|------|------|
| 0 | `CH1_MASTER.png` | 4×3가 한눈에 들어오는 전체. 8192×6144 권장. 6시 시작·12시 문 |
| 0b | `CH1_MASTER_16x9.jpg` | v1 레퍼런스. 원형 분지. 쓰지 말 것 |
| 0c | `CH1_MASTER_16x9_v2.jpg` | COMPOSITION LOCK. 1280×720. 재생성 금지 |
| 0d | `CH1_MASTER_16x9_v2_PROD.jpg` | 2176×1224 조립. `?stage=0` 구도 QA용. FINAL 아님. 보고: `qa_ch1_master_16x9/QA_REPORT_INGAME.md` |
| 1–12 | `CH1_A1.png` … `CH1_C4.png` | 각 2048×2048, 인접 12% 겹침, MASTER와 같은 카메라 |
| G | `CH1_ground.png` | 이음매 없는 흙 타일 512 또는 1024. 작은 뼈·균열 bake |
| P | props 폴더 | 거목, 철창, 교수대, 폐허 아치 등 **배경에서 뺀** 개별 PNG, 배경 투명 |

### 25.2 플레이트별 장면 (CH1)

| ID | 장면 |
|----|------|
| C2 | 시작. 빈 흙. 근경 뿌리만 프레임 |
| C3 | 시작 동쪽. 철창·뼈. 길은 C2에서 이어짐 |
| C1 / C4 | 남측 환경. 거목·심연. 플레이 면 적음 |
| B2 | 주 전투 분지. 비움. 디테일 LOW |
| B3 | 전투 + 작은 랜드마크(폐허/제단) |
| B1 / B4 | 길 가장자리 HIGH. 거목, 교수대 |
| A2 | 12시 접근. 게이트가 보여야 함 |
| A3 | 게이트 옆. 원경 지옥 하늘 |
| A1 / A4 | 북측 원경. 절벽·심연·실루엣 |

가운데 B2–B3가 PLAY AREA. A·C 가장자리가 ENVIRONMENT.

### 25.3 플레이트 프롬프트 (CH1, 공통 뒤에 붙임)

공통:

```
Elevated top-down ARPG map plate, quarter view, rotten hell forest, cracked black-brown soil, sick green fog, no player, no UI, no text, no neon, gothic painterly, seamless continuation of adjacent plate.
```

예 — B2 (전투 분지):

```
Center combat basin of rotten hell forest, mostly empty cracked dirt, very few props, readable ground, cursed trees only at the far rim, playable 70 percent of the frame, overhead quarter view.
```

예 — A2 (게이트):

```
North of the rotten forest, hell gate or ruined chapel silhouette on the horizon, empty dirt road leading up, cliffs and dead canopy at the sides, same lighting from the west-red hell glow.
```

### 25.4 받는 즉시 엔진에 넣는 순서

1. `CH1_ground.png` → `assets/map/ch1/ground_dark_soil.png` (타일)
2. Props → `assets/map/ch1/collision/` + `_MAP_COMPOSE` 좌표 한 줄씩
3. MASTER/Plate는 설계도. 통째로 맵에 스트레치하지 않음
4. Occluder는 Y소트 가능한 투명 PNG만

---

## 26. 관련 문서

| 문서 | 역할 |
|------|------|
| 이 파일 | 제작·최적화 **SSOT** |
| `맵구성_지옥전체.md` | 7장 한 줄 얼굴 |
| `맵구성_1장.md` | 1장 구역 좌표 |
| `맵유형_확장기획.md` | 35맵 field 골격 |
| `장별_특징_GPT프롬프트.md` | 장 얼굴 한 장 프롬프트 |
| `맵오브젝트_에셋목록.md` | 기존 prop id |
| `맵베이스세팅.md` | 런타임 폴백 |
