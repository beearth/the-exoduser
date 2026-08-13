# SILVERTAIL / BLADE DANCER — LOCKED VISUAL & EQUIPMENT SPEC v1.2

EXODUSER: HELL LORD / FDG
스코프: **Blade Tail ↔ 쌍단검 설계 충돌 종결 + 스프라이트 제작용 LOCKED SPEC.**
근거: `SILVERTAIL_ARCHETYPE_v1.md` / `_v1_1.md`(기구·스킬), `PIXELLAB_PROMPT.md`, `refs/` MASTER TURNAROUND(09_41_58)·WEAPON BIBLE(10_20_48).
성격: 아래 [A]~[I]는 **LOCKED**. 재질문 없이 이 값으로 스프라이트/아트 제작 진입 가능. 스킬·수치는 v1_1 유지(무변경).

---

## [핵심 판정] 요소별 KEEP / MODIFY / REMOVE

| # | 요소 | 판정 | 근거 |
|---|---|---|---|
| 1 | Rotary Blade (Blade Tail, 단일 회전대검) | **KEEP** | 정체성 "ONE BLADE. ONE DANCE." · v1_1 전 스킬(무영선/은무/은섬참/회광/삼섬)이 이 검만 사용 |
| 2 | Neck Rotary Hub (목뒤 회전 허브) | **KEEP** | 캐논 확정(MASTER TURNAROUND DETAIL). Blade Tail origin |
| 3 | Folded Blade 접힘(IDLE, 척추, tip 허벅지) | **KEEP** + 측면오프셋 MODIFY | 접힘 기구 유지, 단 정면규칙 위해 한쪽 hip으로 오프셋(아래 [D]) |
| 4 | **단검 개수** | **MODIFY 2 → 1** | v3 ACTION은 이미 단검 1자루만 draw. "휴대 2·사용 1" 불일치 해소 + "ONE BLADE" 정체성 + 48px 다운스케일 가독 |
| 5 | **허벅지 sheath (BOTH SIDES)** | **MODIFY → 단측(Blade Tail 반대쪽 1개)** | 양측 유지 시 Blade Tail hip-오프셋 쪽과 물리 충돌. 반대 허벅지 단일화로 충돌 제거 |
| 6 | Off-hand ACTION 단검(좌수 1자루) | **KEEP** | v3 ACTION 캐논 그대로(대검=우수, 단검=좌수). 이제 휴대 1과 정합 |
| 7 | Empty hands (IDLE) | **KEEP** | v3 캐논. v2 "IDLE 양손 쌍단검"은 이미 폐기(액션배치 오적용) — REMOVE 확정 |
| 8 | 칼날개(찢긴 검정 스커트→날개), 은발 포니테일, 흑철갑주, 힐부츠 | **KEEP** | 정체성·연무 게이지 UI. 무변경 |
| 9 | 신규 무기/장비 | **없음(추가 금지)** | 충돌 해결만 — 신규 도입 0 |

> **쌍단검 충돌의 본질**: 무기 정보 패널 `DAGGER(2)` + `THIGH DAGGER(BOTH SIDES)`는 (a) "ONE BLADE" 정체성과, (b) v3 ACTION의 단검 1자루 사용과, (c) 한쪽 hip으로 오프셋되는 Blade Tail 접힘 위치와 상충. **해소 = 단검 2→1(휴대·사용 모두 1), 반대 허벅지 단측 수납, 대검은 언제나 유일 주무기.** 단검은 **secondary/utility blade — 독립 스킬/메커니즘 없음(no independent skill/mechanic)** — v1_1 전 검-스킬 세트와 무충돌.

> **⚠ WEAPON BIBLE §07 "COMBINATION - TWIN DAGGERS" = PRE-v1.2 DEPRECATED CONCEPT.** 웨폰바이블(refs/10_20_48) §07의 단검 콤보(단검 접근→회전 AoE→단검 처형)는 **v1.2에서 폐기**된다. v1_1 스킬셋에 단검 스킬이 0이므로 §07은 미구현 컨셉일 뿐이며, v1.2 확정: **단검 = single secondary/utility dagger, no independent skill/mechanic** / **Blade Tail = sole primary weapon / core combat mechanic.** §07의 "twin daggers 전투 콤보"는 아트/스펙 진실공급원에서 무효(참조 시 이 LOCK이 우선).

---

## [A] FINAL EQUIPMENT COUNT (LOCKED)

- **주무기 1: Rotary Blade ×1** — 목뒤 회전 허브 연결 단일 회전대검(총길이 1830mm). = Blade Tail. **sole primary weapon / core combat mechanic — 정체성·전 스킬(무영선/은무/은섬참/회광/삼섬)의 유일 무기.**
- **부무기 1: Curved Dagger ×1** — secondary/utility blade, **독립 스킬/메커니즘 없음(no independent skill/mechanic)**. ASSASSIN/DUELIST 플레이버 보조날 — Blade Tail의 primary/mechanic 역할을 대체하지 않음.
- **합계 = 검 1 + 단검 1.** (구 `DAGGER(2)` → `DAGGER(1)`로 확정. "쌍단검"은 폐기.)
- 정체성 문구 불변: **ONE BLADE. ONE DANCE. ONLY DESTRUCTION.** (단검은 주무기 아님 — "one blade" 위배 아님.)

## [B] BLADE TAIL MOUNT / POSE (LOCKED)

- **마운트**: 목뒤/상부 등의 **원형 기계식 회전 허브(rotary hub)**. 등에 매는 검집(back-slung sword) 아님 — 축 연결.
- **IDLE**: 직선 양날 블레이드가 **접혀** 척추를 따라 수직 하강, **tip은 최소 종아리(캐논 기준 mid-thigh~calf)**. 대각선 ✗, 머리 위 솟음 ✗.
- **접힘 구조**: 후면에서 **ㄱ자형(right-angle) 접힘** — 허브(상단 중앙)에서 하강 후 한쪽 hip으로 라우팅.
- **ACTION(공격/스프린트/회전)**: 원심력으로 **직선 전개** → 대검을 **우수에 draw**, 몸 회전으로 회전 참격.
- origin(허브)은 상부 척추 중앙(후면 가시), 접힌 날은 [D] 정면규칙 위해 한쪽 hip으로 오프셋.

## [C] DAGGER / SHEATH POSITION (LOCKED)

- **단검 1자루**, **캐릭터 LEFT 바깥 허벅지 홀스터**(= Blade Tail tip 오프셋의 **반대쪽**).
- 힐트가 pelvis 정중선을 넘지 않도록 살짝 후방·외측 각도. 다리 사이 ✗, 골반 앞 교차 ✗.
- **ACTION**: 좌수로 draw(대검=우수, 단검=좌수 — v3 ACTION 캐논 동일). 동측 draw라 크로스드로 불필요.
- Blade Tail tip = RIGHT hip / Dagger = LEFT thigh → **좌우 분리로 물리·실루엣 충돌 0.**

## [D] FRONT VIEW RULE (LOCKED — 사용자 지정 규칙, 반드시 유지)

- Blade Tail **본체는 torso 뒤에 완전히 가려짐**(origin은 front camera에서 torso가 완전 차폐).
- **바깥 허벅지(RIGHT) 한쪽 옆으로 outermost curved tip만 일부 노출 가능.**
- pelvis 앞 ✗ · 다리 사이 ✗ · body centerline ✗ · 한쪽 hip 바깥으로 자연스럽게 offset(RIGHT).
- 단검(LEFT 허벅지)은 힐트만 소폭 노출 — pelvis 앞 교차 금지. **정면 = 좌(단검 힐트)·우(테일 tip) 대칭적 소량 노출, 중앙 깨끗.**

## [E] REAR 45 VIEW RULE (LOCKED)

- **구조가 명확해야 함**: 상단 **원형 회전 허브 디스크**(브라스 스터드) → 그 아래 **직선 블레이드가 척추 정중앙~한쪽 hip으로 ㄱ자 하강**, tip ~종아리.
- 은발 포니테일이 블레이드 상단을 부분적으로만 덮음(구조 가림 금지).
- 대검 머리 위 세움 ✗ · 대각선 ✗. 반대쪽(LEFT) 허벅지 단검 힐트 1개 가시.
- 후면/후면45에서 **허브+ㄱ자 접힘+tip** 3요소가 읽혀야 함.

## [F] SIDE VIEW RULE (LOCKED)

- 측면: 접힌 블레이드 tip이 등~엉덩이 라인 뒤로 실루엣 형성(종아리까지). 허브는 목뒤 볼륨.
- 근측 허벅지 단검(해당 측일 때만) 힐트 노출, 원측이면 미노출.
- 포니테일이 측면 실루엣의 주 곡선. 스커트 셰드가 하단 실루엣.

## [G] SPRITE PRODUCTION RULE (LOCKED)

- 파이프라인: **PixelLab** `mannequin`, 8-dir, `low top-down`, 224×224 → 인게임 **48×48** 다운스케일.
- 인게임 프레임: 전사와 동일 **idle 2 + walk 8**(현행 적용분). 추가 상태(attack-deploy/whirl/throw/dash)는 생성 시 방향·프레임수를 `game.html` + `PIXELLAB_PROMPT.md`에 동시 반영.
- 파일명 시방향: `12,1,3,5,6,7,9,11`. rotations 좌 2프레임(방향 혼재) 제외, idle 2프레임=walk `frame_000` 복제.
- 224→48 다운스케일 시 **단검은 1~2px** — 식별 실루엣은 **포니테일 + 척추 블레이드 + 찢긴 스커트-날개**가 담당. 단검은 노이즈화되므로 **단측 1개로 최소화(가독 우선)**.
- 검정 무투명 배경 프레임별 투명화 후 `contain`, 빈 영역 `RGBA 0,0,0,0`.
- **PixelLab 생성/대량 이미지 제작은 본 LOCK 확정 후 별도 단계** — 본 문서는 생성 전 SPEC LOCK만.

## [H] 실제 CONFLICT 해결 내용 (7 검토항목 대응)

| # | 검토 | 충돌 전 | 해결 |
|---|---|---|---|
| 1 | 단검 개수 | DAGGER(2), 그러나 ACTION 사용 1 | **1로 확정**(휴대·사용 일치). 정체성/가독 정합 |
| 2 | 허벅지 sheath 위치 | BOTH SIDES | **LEFT 단측**(Blade Tail 오프셋 반대) |
| 3 | Blade Tail 접힘 물리 충돌 | 중앙척추 + 양측 단검 | 테일 tip=RIGHT hip / 단검=LEFT → **분리, 충돌 0** |
| 4 | 후면45 실루엣 | 허브+블레이드+양측단검+스커트 과밀 | 단검 1개化 → 허브+ㄱ자+tip+단측단검, **판독 가능** |
| 5 | 정면 노출량 | 양 단검 골반 앞 교차(클러터) | 중앙 클린 + 좌힐트/우tip 소량 대칭 |
| 6 | 달리기/회전 간섭 | 회전면상 양측 단검 클리핑 | 단측·후외측 각도 → 전개 블레이드 회전면과 비간섭 |
| 7 | 선택화면 vs 48px sprite 식별성 | 단검 2 = 다운스케일 노이즈 | 실루엣축=포니테일+척추블레이드+스커트, 단검 1로 노이즈 저감 |

## [I] 다음 이미지 생성용 LOCKED PROMPT

**IDLE (canon, v1.2):**
```
silver-haired female blade dancer, very long high silver ponytail, blackened iron plate
armor over sheer black mesh midriff, black plate bustier, long tattered ragged feathered
black skirt splitting into thin blade-like shreds (Berserk style), thigh-high black armored
high-heeled boots, a single folded straight double-edged blade sheathed flat and vertical
down the spine, angled/offset toward her RIGHT hip in a right-angle fold, connected to a round
mechanical rotary hub at the back of the neck, blade tip reaching mid-thigh/calf, ONE curved
dagger holstered on her LEFT outer thigh only, empty hands, gritty dark fantasy, Berserk +
FromSoftware art language, high contrast, muted black palette (#0E0E10 / #1A1A1D / #2B2B2F,
ash-white hair #C7C7C7)
```

**ACTION (attack/whirl/sprint):**
```
...(동일 캐릭터)... rotary blade DEPLOYED and gripped in the RIGHT hand as an oversized
greatsword, the single curved dagger drawn in the LEFT hand, ragged skirt shreds trailing in motion
```

**FRONT-VIEW 강제 제약(생성/편집 공통):** Blade Tail 본체 torso 완전 차폐 · RIGHT 바깥 허벅지로 tip만 소량 노출 · pelvis 앞/다리 사이/centerline 금지 · LEFT 허벅지 단검 힐트만 소량 · 중앙 클린.
**REAR/REAR45 강제:** 회전 허브 디스크 + 척추→RIGHT hip ㄱ자 접힘 + tip~종아리 판독 · 대검 머리위/대각선 금지 · 단검 1개(LEFT).

---

## 미해결(별도 트랙 — 본 LOCK 범위 밖)

- v1_1 [9] 미결(밸런스/판정 비용 등)은 기구 트랙 유지. 본 문서는 **비주얼/장비 LOCK만**.
- attack-deploy/whirl/throw/dash 스프라이트 상태 실제 생성은 LOCK 확정 후 진행(PixelLab 단계).

FDG / EXODUSER: HELL LORD / (c) 2026 SIM DOJIN
