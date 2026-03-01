# GenSpark 스프라이트 주문서 — 적 10종 스프라이트시트

## 공통 사양

| 항목 | 값 |
|------|-----|
| 크기 | 32×32 px per frame |
| 프레임 | 4프레임 (idle animation) |
| 레이아웃 | 가로 배치 (128×32 px 스프라이트시트) |
| 배경 | 투명 (transparent / alpha) |
| 스타일 | 2D top-down, dark fantasy, Diablo 2 aesthetic |
| 용도 | Canvas 2D 게임 (지옥의 길) |

---

## etype 0 — 해골 보병 (Skeleton Soldier)

> **게임 내 특징**: 근접 공격, HP 32, ATK 12, 직립 자세, 칼 소지, 각진 어깨

```
2D top-down pixel art spritesheet, 128x32 pixels, 4 frames horizontal layout,
dark fantasy skeleton soldier, idle animation.
Upright humanoid skeleton holding a rusted sword in right hand,
angular bony shoulders with tattered armor fragments,
glowing red eye sockets, ribcage visible through torn cloth,
Diablo 2 aesthetic, muted bone-white and dark red palette,
transparent background, 32x32 per frame, no outline glow.
```

---

## etype 1 — 백골 궁수 (Skeletal Archer)

> **게임 내 특징**: 원거리 투사체, HP 24, ATK 8, 날렵한 몸, 활+화살통, 후드

```
2D top-down pixel art spritesheet, 128x32 pixels, 4 frames horizontal layout,
dark fantasy skeletal archer, idle animation.
Slim skeletal figure wearing a dark hood, holding a short bow,
quiver of arrows visible on back, lean and agile posture,
one glowing green eye under the hood, light leather armor remnants,
Diablo 2 aesthetic, dark brown and pale bone color palette,
transparent background, 32x32 per frame, no outline glow.
```

---

## etype 2 — 해골 돌격병 (Skeleton Charger)

> **게임 내 특징**: 돌진 공격, HP 22, ATK 14, SPD 0.6, 넓은 몸통, 뿔 투구, 두꺼운 다리

```
2D top-down pixel art spritesheet, 128x32 pixels, 4 frames horizontal layout,
dark fantasy skeleton charger, idle animation with aggressive stance.
Wide-bodied armored skeleton with two curved golden horns on helmet,
thick sturdy legs, hunched forward posture ready to charge,
heavy bone plating on shoulders, glowing red eyes,
Diablo 2 aesthetic, orange-brown and dark iron color palette,
transparent background, 32x32 per frame, no outline glow.
```

---

## etype 3 — 떼거리 임프 (Swarm Imp)

> **게임 내 특징**: 다수 출현, HP 10, SPD 0.75 (최고속), 작고 날렵, 꼬리, 큰 눈 1개

```
2D top-down pixel art spritesheet, 128x32 pixels, 4 frames horizontal layout,
dark fantasy tiny imp creature, idle animation.
Very small crouching demon imp, single large yellow eye,
thin whip-like tail curling behind, three spindly insect-like legs,
teardrop-shaped body, dark green skin with lighter belly,
mischievous and quick appearance,
Diablo 2 aesthetic, sickly green and yellow color palette,
transparent background, 32x32 per frame, creature should be small within frame.
```

---

## etype 4 — 해골 장군 (Skeleton General / Tanker)

> **게임 내 특징**: 탱커, HP 60 (최고), ATK 20, 포이즈 35, 사각 갑옷, 육중한 체격

```
2D top-down pixel art spritesheet, 128x32 pixels, 4 frames horizontal layout,
dark fantasy skeleton general, idle animation with imposing stance.
Massive heavily-armored undead warrior, rectangular stone-like armor plating,
broad squared shoulders filling most of the frame,
thick short legs, slow and imposing posture,
small glowing crimson eyes behind visor slit,
Diablo 2 aesthetic, gunmetal grey and dark steel color palette,
transparent background, 32x32 per frame, large figure filling frame.
```

---

## etype 5 — 자폭 임프 (Suicide Bomber Imp)

> **게임 내 특징**: 자폭 공격, HP 16, ATK 22 (고공격), SPD 0.5, 불안정 구체, 균열빛

```
2D top-down pixel art spritesheet, 128x32 pixels, 4 frames horizontal layout,
dark fantasy self-destructing demon, idle animation with pulsing glow.
Unstable spherical creature with cracked skin,
orange-yellow light seeping through body cracks in cross pattern,
four short spidery legs splayed outward, wobbling unstable posture,
body appears about to burst, glowing fissures across surface,
Diablo 2 aesthetic, deep orange and fiery red color palette,
transparent background, 32x32 per frame, pulsing light effect across frames.
```

---

## etype 6 — 방패기사 (Shield Knight)

> **게임 내 특징**: 방패 방어+돌진, HP 45, 포이즈 28, 항상 쉴드, 넓은 어깨, 대형 방패

```
2D top-down pixel art spritesheet, 128x32 pixels, 4 frames horizontal layout,
dark fantasy undead shield knight, idle animation in defensive stance.
Broad-shouldered armored skeleton holding large tower shield on left side,
shield covers half the body with blue energy glow on surface,
one-handed weapon barely visible behind shield,
glowing blue eye, heavy plate armor with dark metal finish,
Diablo 2 aesthetic, dark blue and steel grey color palette,
transparent background, 32x32 per frame, shield prominently visible from top-down view.
```

---

## etype 7 — 리치 (Lich)

> **게임 내 특징**: 소환+텔레포트, HP 18, SPD 0.15 (최저속), 부유, 너덜 로브, 마법 오브

```
2D top-down pixel art spritesheet, 128x32 pixels, 4 frames horizontal layout,
dark fantasy floating lich, idle animation with hovering bob.
Ethereal undead sorcerer floating above ground, no visible legs,
long tattered dark purple robe trailing below,
pointed hood or cowl casting shadow over face,
two small magical orbs orbiting the body,
glowing pink-purple eyes, skeletal hands peeking from sleeves,
Diablo 2 aesthetic, deep purple and dark violet color palette,
transparent background, 32x32 per frame, floating shadow beneath figure.
```

---

## etype 8 — 화약병 (Bombardier)

> **게임 내 특징**: 폭탄 투척, HP 20, ATK 18, 둥근 몸, 등에 폭탄통, 도화선+불꽃

```
2D top-down pixel art spritesheet, 128x32 pixels, 4 frames horizontal layout,
dark fantasy goblin bombardier, idle animation with flickering fuse.
Round-bodied small creature carrying barrel-shaped bomb pack on back,
lit fuse extending upward from the pack with spark at tip,
two short legs, hunched posture leaning forward from weight,
crazed expression, dark leather harness holding explosives,
Diablo 2 aesthetic, dark brown and amber-orange color palette,
transparent background, 32x32 per frame, fuse spark flickering across frames.
```

---

## etype 9 — 주술사 (Shaman)

> **게임 내 특징**: 부활 능력, HP 14, 가는 몸, 지팡이, 보라 에너지 파동

```
2D top-down pixel art spritesheet, 128x32 pixels, 4 frames horizontal layout,
dark fantasy undead shaman, idle animation with channeling pose.
Thin gaunt figure in long narrow robe, holding twisted wooden staff,
glowing magical orb at staff tip emitting purple energy,
slight hovering bob, two small glowing purple eyes,
bone trinkets and charms hanging from robe and staff,
Diablo 2 aesthetic, dark purple and ghostly violet color palette,
transparent background, 32x32 per frame, energy glow varying across frames.
```

---

## 사용 가이드

### GenSpark / AI 이미지 생성기 설정
- **모델**: Pixel art 특화 모델 권장 (Stable Diffusion + pixel art LoRA 등)
- **해상도**: 128×32 px 출력 → 필요시 4x 업스케일 후 다운샘플
- **후처리**: 배경 투명화 확인, 프레임 간격 정확히 32px 단위 확인

### 코드 적용 방법
```javascript
// 스프라이트시트 로드
const sprE0 = new Image();
sprE0.src = 'sprites/etype0_skeleton_soldier.png'; // 128×32

// drawEnBody() 내에서 스프라이트 사용
const frame = Math.floor((_now * 0.005) % 4);
ctx.drawImage(sprE0, frame * 32, 0, 32, 32, e.x - 16, e.y - 16, 32, 32);
```

### 파일 명명 규칙
```
sprites/
  etype0_skeleton_soldier.png    (128×32)
  etype1_skeletal_archer.png     (128×32)
  etype2_skeleton_charger.png    (128×32)
  etype3_swarm_imp.png           (128×32)
  etype4_skeleton_general.png    (128×32)
  etype5_suicide_bomber.png      (128×32)
  etype6_shield_knight.png       (128×32)
  etype7_lich.png                (128×32)
  etype8_bombardier.png          (128×32)
  etype9_shaman.png              (128×32)
```

### 속성 틴팅 (코드에서 자동 처리)
스프라이트는 **기본 색상(회색/뼈색)** 으로 제작. 속성별 색조는 코드에서 `globalCompositeOperation` + `fillStyle`로 오버레이:
- 물리(0): 원본 유지
- 화염(1): 붉은 틴트
- 빙결(2): 파란 틴트
- 암흑(3): 보라 틴트
- 뇌전(4): 노란 틴트
