# 지옥의 길 UI 아이콘 GPT 생성 프롬프트팩

## 기본 생성 설정
- 스타일: Dark Fantasy UI, infernal metal, ember glow, arcane purple accent
- 출력: PNG, **투명 배경**
- 권장 사이즈: `128x128` 생성 후 게임 적용 시 `32x32` / `48x48` 다운스케일
- 공통 조건:
  - centered single icon
  - high contrast silhouette
  - crisp edge, no text, no watermark, no frame
  - game HUD icon readability at small size

## 글로벌 베이스 프롬프트
```text
Create a single game UI icon for a dark fantasy hack-and-slash interface.
Style: infernal metal + ember orange glow + subtle arcane purple accent.
Centered composition, transparent background, no text, no border frame.
High readability at 32x32, strong silhouette, clean edge, polished game-ready icon.
```

## 네거티브 프롬프트
```text
blurry, low contrast, noisy background, multiple objects, realistic photo, text, letters, logo, watermark, frame, clutter, pastel, cute cartoon
```

## 아이콘 개별 프롬프트

### 1) 스탯 5종

#### STR (힘)
```text
[BASE]
Icon subject: a brutal flexed arm gauntlet with heated cracks and ember sparks.
Color focus: molten orange, dark iron.
```

#### DEX (민첩)
```text
[BASE]
Icon subject: a compact crossbow with razor limbs and swift motion arc.
Color focus: acid green + steel.
```

#### INT (지능)
```text
[BASE]
Icon subject: arcane orb with runic halo and controlled energy swirl.
Color focus: sapphire blue + violet.
```

#### LCK (행운)
```text
[BASE]
Icon subject: cursed lucky clover made of glowing shards.
Color focus: neon violet + emerald accent.
```

#### GRIT (근성)
```text
[BASE]
Icon subject: clenched armored fist with cracked stone aura.
Color focus: amber gold + dark bronze.
```

### 2) 패널/메뉴 아이콘

#### 인벤토리
```text
[BASE]
Icon subject: reinforced leather backpack with metal lock and ember seams.
```

#### 대장간
```text
[BASE]
Icon subject: infernal anvil with a short hammer and hot sparks.
```

#### 설정
```text
[BASE]
Icon subject: heavy mechanical gear engraved with occult runes.
```

#### 능력치
```text
[BASE]
Icon subject: rising bar sigil inside a runic medallion.
```

#### 스킬
```text
[BASE]
Icon subject: crossed blade and spell sigil merged into one emblem.
```

### 3) 속성 아이콘

#### 화염 / 냉기 / 번개 / 암흑 / 신성
```text
[BASE]
Icon subject: elemental emblem for [FIRE/ICE/LIGHTNING/DARK/HOLY].
Keep same shape language across the whole set, only element motif and color changes.
```

## 일괄 생성용 템플릿
```text
Create 1 icon only.
Theme: Hell Road dark fantasy HUD icon set.
Transparent background PNG.
Centered, high contrast silhouette, readable at 32x32.
Infernal metal material, ember orange rim light, subtle purple arcane accent.
No text, no watermark, no frame.
Subject: [아이콘 주제]
Primary color: [주색]
Secondary color: [보조색]
```

## 파일명 규칙 (권장)
- `ui_stat_str.png`
- `ui_stat_dex.png`
- `ui_stat_int.png`
- `ui_stat_lck.png`
- `ui_stat_grit.png`
- `ui_panel_inventory.png`
- `ui_panel_forge.png`
- `ui_panel_settings.png`
- `ui_panel_stats.png`
- `ui_panel_skill.png`
- `ui_el_fire.png`
- `ui_el_ice.png`
- `ui_el_lightning.png`
- `ui_el_dark.png`
- `ui_el_holy.png`

## 적용 체크
- 실사용 크기(32/48px)에서 윤곽이 무너지면 대비를 올리고 디테일을 줄여 재생성
- 세트 내 광원 방향과 외곽선 두께 통일
- 같은 카테고리(스탯/패널/속성)는 동일 재질감 유지
