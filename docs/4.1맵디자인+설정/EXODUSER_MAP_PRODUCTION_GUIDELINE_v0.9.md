# EXODUSER MAP PRODUCTION GUIDELINE v0.9

> Status: FIELD TEST  
> Scope: EXODUSER 전체 챕터/스테이지 맵 제작 공통 가이드  
> 목적: 맵 제작 순서를 표준화하고, 반복되는 시행착오를 줄이며, 시각 완성도·전투 가독성·런타임 안정성을 동시에 확보한다.

---

## 0. 핵심 원칙

EXODUSER의 맵은 **오브젝트를 좌표에 배치해서 만드는 것이 아니라, 전체 환경을 먼저 설계한 뒤 오브젝트를 재료로 사용해 완성한다.**

제작 우선순위는 다음 순서를 고정한다.

1. 전체맵 구성
2. 대형 외곽 질량(OUTER MASS)
3. 중형 연결 구조
4. 바닥 통합
5. 플레이 공간
6. 랜드마크
7. 소형 디테일
8. 카메라 단위 시각 QA
9. 기술 QA

**CENTER LATER. OUTER MASS FIRST.**

자동 테스트가 PASS여도 화면이 완성된 환경처럼 보이지 않으면 맵은 PASS가 아니다.

---

# 1. 전체맵 MASTER PLAN

모든 스테이지는 구현 전에 전체 월드 기준 MASTER PLAN을 먼저 만든다.

반드시 정의해야 하는 항목:

- START
- EXIT / BOSS
- PRIMARY LANDMARK
- SECONDARY LANDMARK
- 주요 전투공간
- SIDE POCKET
- TRAVEL SPACE
- BREATHING SPACE
- THREAT SPACE
- NON-WALKABLE ENVIRONMENT MASS

맵에 존재하는 모든 큰 공간은 역할을 가져야 한다.

아무 목적 없이 남은 공간은 제거하거나 environment mass로 흡수한다.

### 금지

- 사각형 전체 필드 후 prop scatter
- S자 한 줄 진행
- 방 → 좁은 복도 → 방 반복
- 동일 폭 통로 반복
- 동일 크기 arena 반복
- 좌우 완전 대칭
- object count를 목표로 설계
- walkable %를 목표값처럼 맞추기

walkable %는 검증 참고값일 뿐 디자인 목표가 아니다.

---

# 2. REGION 설계

맵 전체를 보통 6~10개 REGION으로 나눈다.

각 REGION은 아래 항목을 가진다.

```text
REGION NAME

Role:
Shape:
Size:
Density:
Main Direction:
Combat Function:
Landmark:
Side Mass:
Ground Identity:
Transition In:
Transition Out:
```

인접 REGION은 최소 2개 이상의 요소가 달라야 한다.

변화 요소:

- 공간 폭
- 진행 방향
- 밀도
- 외곽 silhouette
- landmark
- ground texture / contamination
- openness
- vertical visual density

### 3-SECOND RULE

플레이어가 새로운 REGION에 진입했을 때 약 3초 안에  
“방금 전 장소와 다르다”는 인상을 받을 수 있어야 한다.

---

# 3. OUTER MASS FIRST

EXODUSER 맵의 시각 제작은 중앙이 아니라 **외곽 환경 질량부터** 시작한다.

전체 외곽을 다음 구역으로 나누어 본다.

- LEFT
- RIGHT
- NORTH / TOP
- SOUTH / START

외곽은 개별 prop의 집합이 아니라 하나의 환경 mass로 보여야 한다.

예:

- 썩은 숲
- 거대 뿌리
- 시체/뼈 벽
- 곤충 갑각
- 얼음 절벽
- 용암 암벽
- 악마 구조물

각 biome의 표현은 달라도 제작 grammar는 동일하다.

---

# 4. OUTER MASS 4-LAYER 구조

## BACK

가장 뒤쪽 질량.

역할:

- 깊이
- biome background
- 검은 빈 공간을 의도된 recess로 전환

예:

- dark forest
- root mass
- cave depth
- fog
- shadow
- background vegetation

개별 에셋의 형태가 강하게 읽히지 않아야 한다.

---

## MID

외곽의 주 silhouette를 만드는 대형 구조물 계층.

역할:

- 전체 외곽 형태
- biome identity
- 큰 환경 덩어리

---

## FRONT

플레이 공간과 맞닿는 불규칙한 edge.

예:

- 튀어나온 뿌리
- 깨진 갑각
- 나무 몸통
- 돌출된 뼈
- 암석
- foreground organic edge

직선 wall처럼 만들지 않는다.

---

## GROUND TRANSITION

구조물과 바닥 사이를 연결한다.

예:

- 뿌리 번짐
- 균열
- 시체 오염
- 독성 얼룩
- 그림자
- 진흙
- 피
- 얼음 파편
- 용암 열변색

구조물이 바닥 위에 sticker처럼 떠 보이면 FAIL.

---

# 5. LARGE → MEDIUM → SMALL

## LARGE

항상 대형 구조물부터 작업한다.

역할:

- 전체 silhouette
- 외곽 밀도
- biome identity

대형 asset은 독립적으로 세우지 않는다.

기본적으로 서로 겹쳐 새로운 composite silhouette를 만든다.

권장 overlap 참고값:

- 약 30~50%
- 필요하면 그 이상 허용

숫자는 규칙이 아니라 시각 가이드다.

### FAIL

완성 화면에서 대형 asset 개수를 쉽게 셀 수 있다면 composite가 부족하다.

---

## MEDIUM

대형 mass가 완성된 이후에만 사용한다.

역할:

- 대형 구조물 접합부 숨김
- 큰 hole 제거
- silhouette 연결
- ground와 structure 연결
- 반복 asset의 형태 깨기

중형 asset이 독립된 새 landmark가 되면 안 된다.

---

## SMALL

마지막 단계.

역할:

- 작은 접합부
- 모서리
- 국소적 story detail
- local density
- edge breakup

### 금지

“빈 곳이 있으니 small prop을 뿌린다.”

이 방식은 맵을 빠르게 지저분하게 만들고 전체 형태를 약하게 한다.

---

# 6. SIDE FILL 규칙

사이드가 풍성하다는 것은 “오브젝트 수가 많다”는 뜻이 아니다.

**환경이 연속적으로 꽉 차 보이는가**가 기준이다.

### 나쁜 예

```text
STRUCTURE

        STRUCTURE

                    STRUCTURE
```

### 좋은 개념

```text
DARK BACK MASS
██████████████████████

 LARGE ███████
      █████████ LARGE
  MEDIUM ███████████
██████████████████████

------ IRREGULAR PLAYABLE EDGE ------
```

구조물 사이의 검정 공간도 다음처럼 읽혀야 한다.

- forest interior
- cave depth
- shadow recess
- chasm
- fog
- unseen depth

“에셋을 배치하지 않아서 비어 있는 곳”으로 보이면 실패.

---

# 7. PLAYABLE SPACE

외곽을 꽉 채운다고 중앙 전투공간까지 채우지 않는다.

EXODUSER의 주요 전투 화면에서는 동시에 다음이 발생할 수 있다.

- player
- 다수 enemy
- projectile
- parry effect
- skill VFX
- loot
- damage numbers

따라서 주요 arena 내부에서는 큰 세로 장애물을 최소화한다.

중앙 디테일의 상당 부분은:

- ground painting
- low silhouette
- stain
- crack
- debris

등으로 해결한다.

---

# 8. EMPTY SPACE도 디자인한다

빈 공간은 실패가 아니다.

**의도 없는 빈 공간만 실패다.**

큰 empty area는 반드시 다음 중 하나로 분류한다.

### COMBAT VOID
대규모 전투를 위한 의도적 빈 공간.

### BREATHING SPACE
복잡한 구역 이후 시야를 쉬게 하는 공간.

### LANDMARK FOREGROUND
PRIMARY landmark가 잘 읽히도록 비워두는 공간.

### TRAVEL SPACE
다음 구역으로 자연스럽게 이동시키는 공간.

### THREAT SPACE
비어 있지만 위험·불안감을 주는 바닥 공간.

어느 역할에도 해당하지 않는 넓은 빈 공간은 environment mass로 흡수한다.

---

# 9. 공간 RHYTHM

맵 전체가 같은 폭과 같은 밀도를 가지면 안 된다.

예시:

```text
START             MEDIUM
EARLY             MEDIUM
MAIN ARENA        VERY WIDE
TRANSITION        MEDIUM
SIDE REGION       OFFSET
PRIMARY LANDMARK  VERY WIDE / ASYMMETRIC
LATE              MEDIUM
BOSS APPROACH     COMPRESSED
```

핵심은:

**compression → release → variation**

이다.

다만 너무 규칙적인:

```text
방 → 좁은 목 → 방 → 좁은 목 → 방
```

형태 역시 금지한다.

---

# 10. GLOBAL ROUTE와 LOCAL DIRECTION

전체 진행 방향은 명확해야 한다.

예:

- SOUTH → NORTH
- WEST → EAST

하지만 local movement는 계속 변화할 수 있다.

예:

```text
north
→ north-west
→ east
→ north-east
→ west
→ north
```

GLOBAL 방향은 유지하면서 LOCAL 방향을 변화시킨다.

### 금지

START와 EXIT가 같은 x축에 있다는 이유로 모든 region을 같은 x축에 정렬하지 않는다.

---

# 11. LANDMARK HIERARCHY

모든 주요 구조물이 같은 중요도로 보이면 안 된다.

권장 hierarchy:

### PRIMARY
맵당 1개 권장.

### SECONDARY
2~4개.

### TERTIARY
필요한 만큼.

PRIMARY landmark는 단순히 큰 sprite가 아니다.

PRIMARY 때문에 다음이 바뀌어야 한다.

- 주변 ground
- path
- negative space
- boundary
- density
- camera composition

즉 landmark가 **공간 자체를 바꿔야 한다.**

---

# 12. BIOME TRANSLATION

공통 제작 grammar를 각 biome에 번역한다.

## CH1 — Rotten Forest

### LARGE
- dead tree
- corpse-root mass
- organic wall
- giant rotten vegetation

### MEDIUM
- root
- corpse mass
- vegetation
- broken organic structure

### SMALL
- bone
- pod
- small root
- debris

### GROUND
- dark soil
- corpse stain
- toxic contamination
- root spread
- cracks

---

## CH2 — Insect / Carapace

### LARGE
- giant shell
- hive
- rib
- carcass
- giant mandible/chitin structure

### MEDIUM
- shell fragment
- organic pillar
- hive connective tissue

### SMALL
- egg
- pod
- debris
- larval remains

### GROUND
- hive contamination
- slime
- chitin fragments
- organic stains

---

## 이후 CHAPTER

각 biome은 반드시 다음 4계층으로 정의한다.

```text
LARGE
MEDIUM
SMALL
GROUND
```

---

# 13. PAINTED / BAKED ENVIRONMENT

시각 전용 환경 요소는 가능한 경우 baked layer로 흡수한다.

## Runtime에 남길 것

- gameplay object
- collision object
- interactable
- destructible
- foreground occluder
- hazard
- trigger
- boss gate
- major landmark

## Baked에 넣을 것

- background vegetation
- visual-only roots
- corpse stain
- floor contamination
- environmental shadow
- non-interactive debris
- 반복을 숨기기 위한 environment composite

### 원칙

**Visual과 Collision은 가능한 범위에서 분리한다.**

보이는 나무 하나하나가 wall이 되는 구조보다:

```text
MAP GEOMETRY / COLLISION
        +
BAKED ENVIRONMENT
        +
GAMEPLAY OBJECT
```

구조를 우선한다.

---

# 14. BAKED CHUNK 제작 원칙

큰 world는 단일 거대 이미지로 상주시키지 않는다.

권장 방식:

- 전체 master를 하나의 그림처럼 제작
- master에서 chunk crop
- runtime은 visible + neighbor chunk만 로드
- chunk별 개별 합성 금지

예:

```text
FULL ENVIRONMENT MASTER
        ↓
1024×1024 CHUNK CROP
        ↓
VISIBLE CHUNK RENDER
```

### Seam 방지

- 동일 master에서 crop
- bleed 사용
- world coordinate 정렬
- camera 이동 QA
- horizontal / vertical seam 검사

---

# 15. CAMERA-FIRST QA

전체맵이 좋아 보여도 실제 플레이 화면이 별로면 FAIL.

모든 stage는 최소 다음 camera board를 만든다.

```text
01 START
02 EARLY
03 MAIN ARENA
04 SIDE LEFT
05 SIDE RIGHT
06 PRIMARY LANDMARK
07 LATE
08 EXIT / BOSS
```

각 화면에서 확인:

- 좌우 side mass가 충분한가
- 큰 빈 hole이 있는가
- 동일 asset 반복이 보이는가
- 전투 공간이 충분한가
- 이전 camera와 구성이 다른가
- landmark hierarchy가 읽히는가
- ground가 너무 복잡하지 않은가
- 플레이어/VFX 가독성이 유지되는가

---

# 16. 전투 가독성 QA

아트만 보고 최종 승인하지 않는다.

실제 게임 상태에서 확인:

- player silhouette
- enemy readability
- projectile readability
- parry color
- skill VFX
- loot readability

배경이 아름답더라도 전투 가독성을 해치면 RETOUCH 또는 FAIL.

---

# 17. TECH QA와 VISUAL QA 분리

자동 테스트는 기술 검증이다.

예:

- collision
- route
- pageerror
- 404
- seam
- loading
- GPU warm
- performance

이것이 전부 PASS여도 시각적으로 완성되지 않았다면 맵은 PASS가 아니다.

최종 시각 질문:

> **Does this look like a finished game environment?**

NO면 RETOUCH 또는 FAIL.

---

# 18. 제작 GATE

## GATE 1 — MASTER PLAN

확정:

- 전체 silhouette
- region
- major route
- side route
- landmark hierarchy
- empty-space role

PASS 전 production object placement 금지.

---

## GATE 2 — LARGE OUTER MASS

확정:

- LEFT mass
- RIGHT mass
- TOP/NORTH mass
- SOUTH/START mass
- 큰 hole 제거
- biome identity

중앙은 아직 비어 있어도 된다.

PASS 전 small prop 작업 금지.

---

## GATE 3 — MEDIUM CONNECTION

확정:

- large composite 접합
- isolated structure 제거
- major hole 제거
- depth 확보

---

## GATE 4 — GROUND CONNECTION

확정:

- structure가 바닥에 붙음
- stain/root/shadow continuity
- sticker feeling 제거

---

## GATE 5 — PLAYABLE / COMBAT

확정:

- 실제 이동
- dodge 공간
- projectile 공간
- enemy swarm
- side pocket
- landmark navigation

---

## GATE 6 — LANDMARK / CENTER

이 단계에서 비로소:

- PRIMARY landmark
- secondary POI
- central combat detail
- negative-space fine tuning

작업.

---

## GATE 7 — SMALL DETAIL / STORY

마지막 단계.

- bone
- corpse
- pod
- debris
- small root
- environmental storytelling

---

## GATE 8 — FINAL CAMERA QA

스토어 스크린샷으로 사용할 수 있는 장면이 나오는지까지 확인.

---

# 19. 절대 금지 제작 패턴

## FAIL 01 — SMALL PROPS FIRST
작은 prop부터 뿌리는 방식.

## FAIL 02 — REPEATED PILLARS
동일한 세로 구조물 반복.

## FAIL 03 — ASSET ISLAND
큰 structure가 각각 떨어져 독립 섬처럼 보임.

## FAIL 04 — EMPTY BLACK HOLE
asset 사이에 의도 없는 검정 구멍이 남음.

## FAIL 05 — PERFECT SYMMETRY
좌우 완전 대칭.

## FAIL 06 — ROOM/CORRIDOR LOOP
방-복도-방 반복.

## FAIL 07 — SINGLE S ROUTE
전체맵이 하나의 S자 spine으로 요약됨.

## FAIL 08 — OBJECT COUNT DESIGN
“몇 개 배치했는가”가 품질 기준이 됨.

## FAIL 09 — WALKABLE % DESIGN
walkable 비율을 맞추기 위해 공간 형태를 희생.

## FAIL 10 — AUTOMATED PASS = VISUAL PASS
테스트 PASS를 시각 승인으로 간주.

## FAIL 11 — RANDOM SCATTER DETAIL
랜덤 scatter로 완성도를 만들려고 함.

## FAIL 12 — CENTER FIRST
외곽 silhouette가 안 잡힌 상태에서 중앙부터 꾸밈.

## FAIL 13 — IDENTICAL ASSET SILHOUETTE
같은 대형 asset 전체 외곽선이 반복 노출.

## FAIL 14 — STICKER STRUCTURE
structure와 ground가 연결되지 않음.

---

# 20. FULL-MAP QA

전체맵 축소 이미지에서 확인한다.

- 전체 silhouette가 자연스러운가
- 외곽 mass가 이어지는가
- 사이드가 비어 있지 않은가
- PRIMARY landmark가 읽히는가
- 큰 공간/작은 공간 변화가 있는가
- 반복 구조가 한눈에 보이지 않는가
- 맵 전체가 S/8/사각형/타원 하나로 쉽게 요약되지 않는가

---

# 21. CAMERA QA

카메라별로 다음 질문에 YES/NO 판정.

1. 외곽이 화면 끝까지 자연스럽게 이어지는가?
2. isolated structure가 보이는가?
3. 큰 empty hole이 보이는가?
4. 같은 asset이 즉시 반복되어 보이는가?
5. 중앙 전투공간이 충분한가?
6. 이전 화면과 다른 composition인가?
7. landmark가 적절한 hierarchy로 읽히는가?
8. environment가 한 장의 그림처럼 연결되는가?

---

# 22. 최종 VISUAL VERDICT

## PASS
- 전체 환경이 완성된 게임 맵처럼 보임
- 외곽 mass 연속
- 전투 가독성 유지
- region variation 충분
- 반복 asset 노출 최소
- 기술 QA PASS

## RETOUCH
- 구조는 맞지만 일부 hole/접합/반복/ground 연결 문제 존재

## FAIL
- 블록 배치 느낌
- 빈 외곽
- 반복 asset
- 단조로운 geometry
- 전투 가독성 붕괴
- 기술 회귀

---

# 23. MAP PRODUCTION REPORT 표준

모든 맵 제작 세션은 아래 형식으로 보고한다.

```text
================= MAP PRODUCTION REPORT =================

STAGE:

MASTER
- silhouette:
- regions:
- main route:
- side spaces:

OUTER MASS
- LEFT:
- RIGHT:
- TOP:
- SOUTH:
- major holes:

LARGE
- source assets:
- composites:
- overlap:
- repeated silhouette:

MEDIUM
- connections:
- remaining holes:

GROUND
- shadow:
- contamination:
- structure integration:

PLAYABLE
- main arenas:
- travel space:
- breathing space:
- threat space:
- combat readability:

LANDMARK
- primary:
- secondary:
- tertiary:

CAMERA QA
- START:
- EARLY:
- ARENA:
- SIDE L:
- SIDE R:
- LANDMARK:
- LATE:
- EXIT:

TECH QA
- route:
- collision:
- pageerror:
- 404:
- seam:
- loading:
- performance:

FILES
- stage-owned:
- concurrent touched:
- unrelated touched:

GIT
- staged:
- commit:
- push:
- deploy:

VISUAL VERDICT:
PASS / RETOUCH / FAIL

NEXT PASS:
```

---

# 24. 작업 단계별 금지사항

## MASTER 단계
금지:
- production prop placement
- small detail
- collision fine tuning

## LARGE MASS 단계
금지:
- center decoration
- small scatter
- story detail

## MEDIUM 단계
금지:
- random filler
- new landmark creation

## PLAYABLE 단계
금지:
- visual 문제를 collision로 해결
- corridor 남발

## DETAIL 단계
금지:
- 전체 silhouette 변경
- large mass 재설계
- gameplay route 변경

후반 단계에서 앞 단계 문제를 발견하면 억지로 덮지 말고 해당 GATE로 돌아간다.

---

# 25. MAP 제작 철학 요약

EXODUSER의 맵 제작은 다음 문장으로 요약한다.

> **먼저 전체 장소를 만든다.  
> 그다음 외곽의 거대한 환경 질량을 만든다.  
> 큰 구조물을 서로 연결한다.  
> 바닥과 구조물을 하나로 녹인다.  
> 그 뒤에야 플레이 공간과 랜드마크를 구체화한다.  
> 작은 디테일은 가장 마지막에 넣는다.**

오브젝트의 개수가 맵을 완성하지 않는다.

**실루엣, 질량, 공간, 연결, 밀도, 전투 가독성**이 맵을 완성한다.

---

# 26. VERSION POLICY

현재 문서는:

**v0.9 — FIELD TEST**

로 운용한다.

CH1과 CH2에서 실제 제작 과정을 통해 규칙을 검증하고,
성공 패턴과 실패 패턴을 추가한다.

다음 조건 충족 시:

**v1.0 — PRODUCTION LOCK**

으로 승격한다.

- CH1 최종 완성
- CH2 최종 완성
- 두 biome에서 동일 제작 grammar 재현 성공
- CAMERA QA 기준 검증
- runtime/performance 문제 없음

v1.0 이후 신규 챕터는 본 가이드라인을 기본 제작 SSOT로 사용한다.
