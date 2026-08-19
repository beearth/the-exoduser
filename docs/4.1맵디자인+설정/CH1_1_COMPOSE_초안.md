# CH1-1 Compose 초안 (200×200)

> 2026-08-19 | **설계만. 코드·에셋 없음.** 승인 후에만 `game.html` / `_MAP_COMPOSE[0]`으로 옮긴다.  
> Option B LOCK. v2는 룩 레퍼런스. 월드 = `FIXED_MAPS[0]` 200×200, `T=40`, `tileRLE [1,40000]` 통바닥.  
> `_CH_DECO` 살포 금지, 살점 scatter 금지, `hand` 배치.

좌표는 **타일**. 픽셀 안 씀. (월드 px = 타일×40. `empty.r`만 엔진이 px라서 옆에 환산.)

숫자를 LOCK하지 않음. `FIXED_MAPS[0]` 방·복도·소환굴과 겹치게 맞춘 **제안**.

---

## CH1-1 COMPOSE INTENT

문장: **남에서 북으로, 어긋난 흙 분지 세 개가 이어진 썩은 숲. 가운데는 비고, 기억할 뼈는 1~2시에 있다.**

원형 아레나 아님. 직선 복도 아님.  
`FIXED_MAPS[0]`이 이미 그 골격이다.

| 방 (데이터) | cx,cy | 이 초안에서의 역할 |
|---|---|---|
| start `s` | 100, 185 rx14 ry6 | START |
| combat `r1` | 100, 155 | LOWER |
| forge `f` | 100, 120 | CENTRAL 안 게임플레이. 랜드마크 아님 |
| combat `r2` | **80**, 85 | CENTRAL 서쪽 어긋남 |
| combat `r3` | **120**, 50 | UPPER 동쪽 어긋남 |
| boss `b` | 100, 18 rx20 ry12 | EXIT APPROACH (아레나 아님, 문 앞) |
| alcove | 35,140 / 165,110 / 50,65 | 서·동 포켓 씨앗 |
| 복도 폭 | 9~10타일 | 유지. 더 줄이지 않음 |

통바닥이라 복도는 벽이 아니다. “길”은 **empty + 림 소품이 비워 둔 띠**.

`keepDragon:1`은 이 초안에서 **끈다.** 중앙 3D 용해골(sz 3000)이 주 전투공간을 먹는다. 랜드마크는 아래 1개만.

---

## TILE COORDINATE PLAN

제안 박스. 기존 방 타원을 **포함**하고, 후보는 살짝 키워서 자연 경계.

| 구역 | 제안 타일 (x0–x1, y0–y1) | 기존 데이터와의 관계 |
|---|---|---|
| START | 86–114, 170–194 | start 타원 (86–114, 179–191) + SSOT 시작원 `(0.50,0.88)` r480px≈12타일 |
| LOWER | 54–136, 124–176 | r1 (82–118, 145–165) + 서쪽 치우침. 후보 60–140,130–180에서 서쪽·남쪽만 다듬음 |
| CENTRAL | 46–158, 62–146 | forge (92–108, 115–125) + r2 동쪽 가장자리. 완전 원 아님 (가로가 김) |
| UPPER | 56–140, 22–82 | r3 (104–136, 41–59)을 동쪽 덩어리로 품음. 후보는 60–145,25–85 |
| EXIT | 80–120, 4–36 | boss 방 (80–120, 6–30) + SSOT 게이트원 `(0.50,0.14)` r400px≈10타일 |
| WEST POCKET | 18–52, 88–136 | alcove (35,140)에서 남으로 내림. CENTRAL에 폭 10+로 붙음 |
| EAST POCKET | 156–188, 74–124 | alcove (165,110) |

남북 진행축은 유지하되 중심선 x=100을 LOWER→CENTRAL→UPPER에서 **서(88) → 동(118) → 서(92)** 로 꺾는다. 데이터상 r2=80, r3=120과 같음.

주요 연결 최소 폭: **10타일** (기존 corridor width). 줄이면 안 됨.

---

## EMPTY / COMBAT ZONES

엔진 `empty`는 `{x,y 정규화, r 픽셀}` **원**이다. 자연 지형은 **겹치는 원 여러 개**로 근사. 원 하나 r=1400은 아레나가 된다.

제안 `empty` (아직 코드에 안 넣음):

| id | x | y | r(px) | r(타일) | 역할 |
|---|---|---|---|---|---|
| start | 0.50 | 0.88 | 480 | 12 | SSOT 시작원. 대형 금지 |
| exit | 0.50 | 0.14 | 400 | 10 | SSOT 게이트원 |
| lower | 0.46 | 0.75 | 880 | 22 | 서쪽 치우친 하단 분지 |
| central | 0.54 | 0.51 | 1080 | 27 | 동쪽 치우침. 지름≈54타일, 원 하나가 맵을 먹지 않음 |
| upper | 0.48 | 0.26 | 820 | 20.5 | 서쪽 치우친 상단 |
| west | 0.17 | 0.55 | 500 | 12.5 | 서 포켓 |
| east | 0.85 | 0.49 | 460 | 11.5 | 동 포켓 |

`hand:1`이면 살포가 꺼지므로 empty는 **안전망 + 문서**. 손으로 올린 대형만 empty 밖·림에 둔다.

START 여유: 시작원 r480 안에 충돌 대형 없음. 소환굴도 원 밖 (기존 홀 `70,170` 등은 원 가장자리 — 구현 시 시작원 밖으로 밀지 검토).

---

## MAIN ROUTE

```
START (100,185)
  → 북서 띠 폭≥10  (x 88~110, y 170→150)
LOWER (중심 ~88, 150)
  → 북동으로 꺾임   (x 88→118, y 150→110)
CENTRAL (중심 ~118, 105)  ※ forge 100,120은 서쪽에 스침
  → 북서           (x 118→92, y 105→55)
UPPER (중심 ~92, 52)
  → 북, 문으로     (x 92→100, y 52→18)
EXIT GATE (100, 18)
```

직선 x=100 복도 금지. 데이터 복도 `s-r1-f-r2-r3-b`가 이미 꺾인다. 시각 림이 그 꺾임을 따라가면 됨.

---

## SIDE POCKETS

| | 타일 | 연결 |
|---|---|---|
| WEST | 18–52, 88–136 | CENTRAL 서벽 x46–52, y100–130, 폭≥10 |
| EAST | 156–188, 74–124 | CENTRAL 동벽 x156–162, y88–118, 폭≥10 |

둘 다 전투 가능. 막다른 골목 아님. 좌우 대칭 아님 (서는 더 남쪽, 동은 더 북쪽).

---

## RIM ZONES

밀도는 외곽 12타일 + 분지와 맵 끝 사이. 전투 박스·통로 폭 안으로 대형 금지.

| 림 | 대략 | 밀도 |
|---|---|---|
| 남 프레임 | y 194–199, x 전 | 낮음. START 비움 |
| 남서 | x 2–24, y 150–199 | 나무·시체·puddle |
| 남동 | x 176–198, y 150–199 | 나무·뼈·cage_gate |
| 서 프레임 | x 2–16, y 40–150 | 저주나무 열, 간격 ≥20타일(800px) |
| 동 프레임 | x 184–198, y 40–150 | 나무·말뚝. 랜드마크와 띄움 |
| 북서 | x 2–40, y 2–24 | 뿌리·hang_cage |
| 북 | y 0–8, EXIT empty 밖 | 문만. 대형 없음 (게이트 원) |
| 북동 | x 160–198, y 8–40 | **랜드마크 + 나무 소수** |

같은 에셋이 한 화면에 두 개 나란히 안 보이게. 대형 간격 ≥20타일.

---

## LANDMARK CHOICE + POSITION

**선택: `m_mega_ribs` (뿔난 거대뼈)**

| 후보 | 기각/채택 |
|---|---|
| mega_ribs | **채택.** 이미 `_MAP_COMPOSE[0].mega`. 멀리서 읽힘. 납작해서 12시 문을 가리지 않음. col 타원(가로로 김) → 림에 붙이기 좋음 |
| bone_arch | 기각. 문으로 읽혀 보스문과 싸움 |
| skull_altar | 기각(랜드마크로서). 작음. 림 **소품**으로는 남쪽/서쪽에 1개 가능 |

위치: **1~2시**, 타일 **(170, 34)** 부근. 정규화 ≈ `(0.85, 0.17)`.

- UPPER 박스(56–140, 22–82) **밖** 동쪽  
- EXIT empty (100,18) r10타일과 **30타일+** 떨어짐  
- 소환굴 `(140,45)`와 ~32타일  
- 현재 코드 `(0.84, 0.22)`=(168,44)와 가깝고, 전투분지에서 한 줄 북동으로만 밀어 림에 앉힘  

sz는 지금 1400이 큼. 초안은 **900~1100** 권장 (메타 기본 900에 가깝게). 구현 때 숫자 확정.

중앙·LOWER·START에 안 둔다. “뼈가 있는 북동”이 방향 기억.

---

## RESERVED SWAMP ZONES

신규 전이 타일 없음. **자리만.** 지금 걸음은 통바닥 유지. 구현해도 통로를 줄이지 않음.

| id | 타일 | 지금 올려도 되는 것 | 나중 |
|---|---|---|---|
| SW | 2–30, 168–198 | puddle 2~3, pit_poison **최대 1** | swamp tile |
| SE | 170–198, 158–198 | puddle, pit_poison 최대 1 | swamp tile |
| NW | 2–28, 2–32 | puddle만 (pit는 시작 동선과  divers) | swamp tile |
| NE | 178–198, 2–22 | 랜드마크(170,34)와 겹치지 않게 더 구석 | swamp tile |

거대한 초록 바다 없음. 코너 4곳, 깊이 6~12타일.

---

## EXISTING ASSET PLACEMENT LIST

손 배치만. `_CH_DECO` 자동·살점 scatter 없음. 신규 거목 없음.

| 에셋 | 개수(제안) | 어디 | col |
|---|---|---|---|
| m_mega_ribs | 1 | (170, 34) 1~2시 림 | 타원 |
| m_ctree 01–12 중 **서로 다른** | 8~12 | 서·동·남서 림. 간격≥20타일 | col |
| m_hang_cage | 1 | 북서 림 (x 20–36, y 12–28) | col |
| m_cage_gate | 1 | 남동 림 (x 178–190, y 168–184) | col |
| m_skull_altar | 1 | 서 림, WEST POCKET **밖** (x 14–28, y 70–88) | col |
| m_bone_arch | 0 | 랜드마크 아님. 이번 1-1 안 씀 (문 혼선) | — |
| bones / deco_bones | 6~10 | 림만. 통로·empty 원 안 금지 | 무 |
| corpse | 3~5 | 림 | 무 |
| meat_stake | 3~4 | 동 림 | 무 |
| poison_puddle / pool | 4~8 | swamp reserved만 | 무 |
| pit_poison | 0~2 | SW/SE reserved만. 통로 금지 | col |
| m_dragon_* | **0** | keepDragon 끔 | — |
| flesh / tumor scatter | **0** | 금지 | — |

소환굴 9개는 데이터 좌표를 유지하되, 구현 시 START/EXIT empty·랜드마크 visR과 겹치면 분지 쪽으로만 1~2칸 이동.

---

## ESTIMATED OPEN-GROUND %

통바닥이면 타일 기준 걸음=100%. 여기서 %는 **전투에 쓰는 열린 흙**(empty 합 ∪ 분지) vs 림·예약 늪.

대략 합(겹침 감안):

| | 타일 | % /40000 |
|---|---|---|
| START+LOWER+CENTRAL+UPPER+EXIT ∪ 포켓 | ≈ 27000~29000 | **67~72%** |
| 림+예약 늪 | ≈ 11000~13000 | 28~33% |

목표 65~72% 안. 림 소품을 과하게 넣으면 72%를 뚫고 내려감 → 대형 8~12그루에서 멈춤.

---

## RISKS

| | |
|---|---|
| keepDragon | 안 끄면 중앙 용해골이 이 설계를 박살냄 |
| mega_ribs sz 1400 | UPPER/EAST를 먹음. 900~1100로 |
| empty가 원 | 너무 큰 원 하나 = 아레나. 겹원 유지 |
| 통바닥+손 배치 | 림이 약하면 공허. 너무 촘촘하면 통로 잠식 |
| `hand:1` 미설정 | `_CH_DECO`가 살점 스캐터를 뿌림 |
| forge (100,120) | CENTRAL 한복판 게임플레이. 시각 랜드마크로 키우지 말 것 |
| `?stage=0` PROD | 본편 200×200과 다른 맵. 이 초안은 **본편 si0** |

---

## ASCII 200×200 BLOCKOUT

1셀 ≈ 10×10타일. 위=북(y=0), 아래=남(y=199).

```
        x0        50        100       150       199
        |         |          |          |         |
 y0  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~N~~~~~~~     ~ swamp reserved
     ~~RRRRRRRRRR   XXXXXXX   RRR  M  ~~          X EXIT  M landmark (ribs)
     ~~RR    UUUUUUUUUUUU    RRRRRR~~             U UPPER
     RRR    UUUUUUUUUUUUUU     RRRR
     RR    UUUUU====UUUUUU      RR                = main route
     R    WWW   ====  CCCCCCC   EE                W west pocket
     R   WWWWW  ====CCCCCCCCCC EEEE               E east pocket
     R   WWWWW====CCCCCCCCCCCCCC EE               C CENTRAL
     R    WW   ====CCCCCCCCCCCC  EE
     RR      LLLLLL====CCCCCC    RR               L LOWER
     RRR   LLLLLLLLLL====        RRR
     ~~RR LLLLLLLLLLLLL   SSSS  RR~~              S START
     ~~RRRR  LLLLLL   SSSSSSSS RRRR~~
     ~~~~~~RRRRRRRR SSSSSSS RRRR~~~~~~
 y199
```

범례: `S` START  `X` EXIT  `=` ROUTE  `C/L/U` CLEARINGS  `W/E` POCKETS  `M` RIBS  `R` RIM  `~` SWAMP RESERVED

---

## FINAL VERDICT

**DRAFT — 승인 대기.**

`FIXED_MAPS[0]`의 꺾인 방 배치·10타일 복도·alcove와 충돌 없음.  
시각만 손 배치 + empty 겹원 + 랜드마크 1개(`mega_ribs` 1~2시).  
구현 시 필수 플래그: `hand:1`, `keepDragon` 제거, `_CH_DECO` 살포 없음.

승인 전 코드 금지.
