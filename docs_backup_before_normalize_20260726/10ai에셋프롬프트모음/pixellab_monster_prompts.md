# HELL: EXODUSER — PixelLab 몬스터 프롬프트 마스터

---

## 🔥 1. 1장 전용 베르세르크 스타일 톤

```
dark fantasy grotesque monster inspired by Berserk manga atmosphere,
brutal, organic, disturbing design with flesh and bone fusion,
exposed muscle, scars, torn skin, unnatural anatomy.
low body close to ground, heavy and oppressive presence.
deep shadows, strong highlights, subtle blood red accents.
```

---

## 🔥 2. 공통 BASE (무조건 붙여라) [base100]

```
STRICT top-down 90 degree view, no perspective, no angle,
pure bird's-eye view, designed for gameplay readability, not illustration.

consistent design across 8 directions,
same proportions, same silhouette, same colors in all rotations.

clear silhouette from above,
feet grounded for map placement.

limited color palette (4~6 tones),
high contrast edges for visibility.

no background, transparent,
no outline glow, no background halo, clean cut edges,
no UI, no extra elements
```

---

## 🔥 3. BODY 타입 (10개)

| # | BODY |
|---|------|
| 1 | grotesque flesh beast, bloated body, bone spikes |
| 2 | corrupted wolf-like creature, lean and aggressive |
| 3 | crawling insect monster, multiple legs |
| 4 | humanoid corrupted knight, heavy armor fused with flesh |
| 5 | tentacle mass creature, no clear limbs |
| 6 | skeletal beast, exposed bones and joints |
| 7 | slug-like slime horror, melting body |
| 8 | armored shell creature, thick plates |
| 9 | floating ghost entity, no legs |
| 10 | parasite-infested creature, swollen body parts |

---

## 🔥 4. TRAIT 변이 (15개)

| # | TRAIT |
|---|-------|
| 1 | glowing red veins |
| 2 | multiple eyes across body |
| 3 | oversized jaw with sharp teeth |
| 4 | broken limbs but still moving |
| 5 | spikes growing randomly |
| 6 | pulsating flesh core |
| 7 | stitched body parts |
| 8 | leaking black fluid |
| 9 | exposed ribs and organs |
| 10 | elongated arms dragging ground |
| 11 | split face mutation |
| 12 | bone armor covering torso |
| 13 | parasite clusters moving under skin |
| 14 | asymmetrical body growth |
| 15 | twisted spine deformation |

---

## 🔥 5. ATTACK 스타일 (10개)

| # | ATTACK |
|---|--------|
| 1 | lunging forward predator |
| 2 | slow heavy stomp attacker |
| 3 | fast crawling ambusher |
| 4 | ranged spitting creature |
| 5 | tentacle grabbing type |
| 6 | explosive suicide monster |
| 7 | charging beast |
| 8 | summoner type creature |
| 9 | swarm leader |
| 10 | teleporting entity |

---

## 🔥 6. COLOR (5개)

| # | COLOR |
|---|-------|
| 1 | dark with blood red accents |
| 2 | dark with sick green poison glow |
| 3 | dark with purple cursed energy |
| 4 | desaturated bone white + black |
| 5 | black + subtle blue ghost glow |

---

## 🔥 7. 실제 프롬프트 생성법

`[base100]` 자리에 공통 BASE 전문을 붙이고, BODY + TRAIT + ATTACK + COLOR 조합:

```
[base100]

{BODY},
{TRAIT},
{ATTACK},

{COLOR}
```

---

## 🔥 8. 예시 5개 (완성형)

### 예시 1 — 늑대형 돌진

```
[base100]

corrupted wolf-like creature, lean and aggressive,
elongated arms dragging ground,
charging beast,

dark with blood red accents
```

### 예시 2 — 벌레형 매복

```
[base100]

crawling insect monster, multiple legs,
spikes growing randomly,
fast crawling ambusher,

dark with sick green poison glow
```

### 예시 3 — 기사형 스톰퍼

```
[base100]

humanoid corrupted knight, heavy armor fused with flesh,
broken limbs but still moving,
slow heavy stomp attacker,

desaturated bone white + black
```

### 예시 4 — 촉수형 그래버

```
[base100]

tentacle mass creature, no clear limbs,
pulsating flesh core,
tentacle grabbing type,

dark with purple cursed energy
```

### 예시 5 — 유령형 텔레포터

```
[base100]

floating ghost entity, no legs,
split face mutation,
teleporting entity,

black + subtle blue ghost glow
```

---

## 🔥 9. 레퍼런스 방향

- ❌ 포스터처럼 만들지 말 것
- ✅ **한 마리 집중**으로 만들어라

---

## 🔥 10. 전략

- BODY: 10개
- TRAIT: 15개
- ATTACK: 10개
- COLOR: 5개
- **조합 = 10 × 15 × 10 × 5 = 7,500개 가능**

---

## PixelLab 호출 설정

- 일반몹: `size: 64`, `n_directions: 8`
- 보스: `size: 128`, `n_directions: 8`
- `body_type: "quadruped"` (짐승) / `"humanoid"` (기사) / `"custom"` (촉수/유령)
- `outline: "single color black outline"`
- `shading: "detailed shading"`
- `detail: "high detail"`
- `ai_freedom: 600`
