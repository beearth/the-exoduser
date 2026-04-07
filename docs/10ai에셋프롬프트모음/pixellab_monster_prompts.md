# HELL: EXODUSER — PixelLab 몬스터 프롬프트 마스터

## 공통 접미사 (모든 몬스터에 붙일 것)

```
STRICT top-down 90 degree view, no perspective, no angle,
pure bird's-eye view, designed for gameplay readability, not illustration.
consistent design across 8 directions,
same proportions, same silhouette, same colors in all rotations,
no distortion between directions.
clear silhouette from distance,
feet grounded for map placement,
centered body mass, stable structure.
limited color palette (4~6 tones),
high contrast edges for visibility.
no background, transparent,
no outline glow, no background halo, clean cut edges,
no UI, no extra elements
```

## 색감 접미사 (선택)

```
dark palette with subtle red glowing veins,
occasional sick green or purple accents
```

---

## 1. 살덩이 괴물 (기본몹)

```
Grotesque quadruped flesh beast,
bloated body, exposed muscle and veins,
bone spikes growing irregularly from back,
slow heavy creature, wide stance,
low body close to ground.
```

## 2. 기어다니는 벌레형 (빠른몹)

```
Crawling insect-like horror creature,
multiple thin legs, low crawling posture,
elongated body, twitchy and aggressive,
sharp mandibles, unnatural movement feel.
```

## 3. 뒤틀린 짐승형 (밸런스몹)

```
Corrupted wolf-like beast,
lean muscular body, fast and aggressive,
spine twisted with bone protrusions,
glowing eyes, hunting posture.
```

## 4. 뼈 스파이크 괴물 (딜러몹)

```
Bone-armored creature,
body covered in sharp spikes and plates,
jagged silhouette, dangerous appearance,
thin but deadly structure.
```

## 5. 눈 + 촉수 괴물 (특수몹)

```
Amorphous flesh mass with multiple eyes,
tentacles spreading outward,
irregular organic shape,
central glowing eye, disturbing presence.
```

## 6. 기사형 몬스터 (엘리트몹 / 보스)

```
Corrupted armored knight,
humanoid shape, wearing broken dark armor,
flesh growing through armor gaps,
large weapon, heavy presence,
intimidating silhouette.
```

---

## 사용법

1. 몬스터 프롬프트 선택
2. 뒤에 **공통 접미사** 붙이기
3. 필요시 **색감 접미사** 추가
4. PixelLab create_character 호출 시 description에 합쳐서 입력
5. n_directions: 8, size: 64 (일반몹) / 128 (보스)
