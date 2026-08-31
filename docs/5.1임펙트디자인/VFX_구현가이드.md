# VFX 구현 가이드

## 물리탄 유기 이빨입 (`proj_phys_mouth`)

| 항목 | 값 |
|---|---|
| 파일 | `img/proj_phys_mouth.png` |
| 시트 | 6144×1152 RGBA, 셀 768×384 |
| 행0 | 8프레임 수평 비행 (redBean·일반물리 주 애니) |
| 행1 | 6프레임 개구 |
| 행2 | 6프레임 곡선 |
| 로더 | `_physMouthImg` / `_drawPhysMouth` |
| 회전 | 우향, `rotate(ang)` (머리=셀 중심) |
| 적용 | redBean, fast/일반 `el===EL.P` |
| 폴백 | `_drawEyeBullet` row4 → 바버폴 |
| 원본 | 유저 제공 ChatGPT 시트 3장 (2026-08-23 12:02) |

## 원소 일반탄 (`proj_elem_orb`)

| 항목 | 값 |
|---|---|
| 파일 | `img/proj_elem_orb.png` |
| 시트 | 3072×1536 RGBA, 셀 512×256 |
| 격자 | 6행 × 6프레임 |
| 행 | 0불 / 1어둠 / 2얼음 / 3번개 / 4대지 / 5신성 |
| 맵 | `_ELEM_ORB_ROW=[-1,0,2,1,3,5,4]` EL P,F,I,D,L,H,E |
| 로더 | `_elemOrbImg` / `_drawElemOrb` |
| 회전 | 우향, `rotate(ang)` (코어=셀 중심) |
| 적용 | 일반·빠른탄 `el!==EL.P` |
| 원본 | 유저 제공 ChatGPT 2026-08-23 13:12 |

## 마법탄 (최초 무지개탄)

마법탄은 `_drawClassicRainbow` — blackBean / blueBean / gbBean만. 이 원소 시트 미사용. **화이트볼(bwBean) 제거(2026-08-23)**. **물리탄 공통=빨콩 베이스**(homing, 선회 .005, E패링, 체감 ×0.7). 이빨=입 시트, **titanEye=혈안 눈깔** `proj_titan_eye.png` 시각 `21.7×_sSc`(성격은 빨콩, 그림만 눈깔).

## 폭발 임팩트 (`_addBoom`) 총정리

### 지속시간
- **최소 66프레임 (1.1초) 보장** — `_addBoom` 함수에서 `Math.max(66, dur)` 적용
- 기존 14~28이었던 fire/ice/dark 등 → 66으로 상향
- 빨콩/무지개(72)는 기존값 유지 (66보다 크므로)

### 타입별 스프라이트 프레임 수

| 타입 | 지속시간 | 애니 프레임 수 | 시트 | 성능 영향 |
|------|---------|-------------|------|----------|
| fire | 66 (1.1초) | 16 | Fire_FBF_4x4 | 낮음 (drawImage 1회/프레임) |
| black(폭독혈) | 66 (1.1초) | 16 | Dark_DarkSmoke_FBF_4x4 | 낮음 |
| redbean(빨콩) | 72 (1.2초) | 16 | Fire_FBF_4x4 | 낮음 |
| rainbow_light(무지개 적중) | 72 (1.2초) | 16×4 (4레이어) | Fire_FBF + Poison_Medium + Dark_DarkSmoke + Light_Impact (각 90° 회전+시차+lighter 합성, 알록달록) | 중간 (drawImage 4회/프레임) |
| rainbow(무지개 소멸) | 72 (1.2초) | 16+36+9 (3레이어) | Dark_DarkSmoke_FBF + Dark_Smoke_6x6 + Dark_BasicImpact | 중간 |
| dark02(패링) | 72 (1.2초) | 16 | Dark_MediumImpact | 낮음 |
| fire_medium | 66 (1.1초, min보정) | 16 (4×4) | Fire_MediumImpact | 낮음 — 빨콩 패링 적중, 보호막 흡수, **동물형 돌진(22/30/43) 적중 임팩트** (`_addBoom 80,48`, 2026-06-28) |
| explosion | 66 (1.1초) | 프로시저럴 | arms 기반 렌더 | 낮음 |
| ice/lightning/dark | 66 (1.1초) | 프로시저럴 | 원+링 렌더 | 낮음 |

### 성능 영향
- 풀당 최대 12개(`_BOOM_MAX=12`), 뷰포트 컬링 적용 → **FPS 영향 거의 없음**
- 3레이어(rainbow 계열)도 drawImage 3회 수준이라 부담 미미
- 지속시간 66→72 상향은 동시 활성 boom 수가 약간 늘 수 있으나 12개 캡으로 제한됨

## 핵심 원칙

### 빛 표현 (레이저/빔/글로우)
1. **검정 절대 금지** — 빛은 안쪽이 가장 얇고 밝고, 바깥으로 갈수록 두껍고 어두움
2. **`lighter` 합성 모드 사용** — `globalCompositeOperation='lighter'` → 검정(0,0,0)은 투명 처리됨
3. **두꺼운 lineWidth로 글로우 만들지 않기** — lineWidth 32+ 라인은 검은 막대로 보임
4. **shadowBlur로 빛 번짐** — 라인은 얇게(2~3px), shadowBlur(20~40)로 글로우 표현

## 실버테일 보라 비행 검기 6프레임 VFX

좌클릭 캐릭터 주변 검호는 제거했다. 주 연출은 좌클릭 기검참의 비행 경로에서만 쓰는 6프레임 보라 시트 `img/vfx/silvertail_violet_arc_anim_api_v2.png`와 KeyE 칼등 처내기의 소형 진홍 검호 v3다.

| 항목 | 코드값 | 적용 위치 | 설명 |
|---|---:|---|---|
| 좌클릭 원본 | 2152×731 RGBA PNG, 가로 6프레임(전체 폭 6등분) | `img/vfx/silvertail_violet_arc_anim_api_v2.png` | 발동선·이중 리본 호·백색 칼날 코어·선단 폭발·크리스털 파편·필라멘트 잔광이 같은 동선으로 이어지는 전용 시트 |
| 로더 | `_silvArcAnimImg` | `game.html` | `?v=20260810-silvertail-arc-anim-v2` 캐시 버스팅 |
| 프레임 | `~~((c.ml-c.life)/2)%6` | `_crescents[].silvArc` | 비행 중 2틱(약 33ms)마다 6프레임 순환 |
| 크기 | 1·2타 104px, 3타 126px 폭 | 동일 | 패널 원본 비율 유지 |
| 3패스 합성 | 1.12배 `lighter` 글로우 → 1.0배 `source-over` 본체 → 0.86배 `lighter` 코어 | 동일 | 스킬 VFX처럼 본체 경계가 먼저 읽히고 글로우는 보조로만 남김 |
| 색·불투명도 | `saturate(1.55) contrast(1.22) brightness(1.32)`, `max(.82, alpha)` | 동일 | 수명 페이드 중에도 검기 본체는 최소 82% 불투명도 유지 |
| 게임 수치 | 변경 없음 | 좌클릭 기검참 | 피해·범위·자원·히트스톱·키바인딩 불변 |

### 실버테일 비행 검기 분리

| 입력 | 전용 플래그·에셋 | 프레임·색 | 판정 영향 |
|---|---|---|---|
| 좌클릭 기검참 | `_crescents[].silvArc`, `silvertail_violet_arc_anim_api_v2.png` (2152×731 RGBA, 폭 6등분) | `~~((ml-life)/2)%6`: 2틱(약 33ms)마다 보라 v2 6프레임 순환. 1·2타 폭 104px, 3타 폭 126px. `saturate(1.55) contrast(1.22) brightness(1.32)`, `min(1, max(.82, alpha)×1.28)` — 공용 수명 페이드가 0.15까지 내려가도 검기 본체는 0.82 미만으로 투명해지지 않음 | 기존 3단 콤보 피해·사거리·히트 범위 그대로 |
| KeyE 칼등 처내기 | `_drawSilvertailEArc(ctx, pose)`, `silvertail_violet_arc_anim_api_v3.png` (2132×738 RGBA, 폭 6등분) | `pose.kind==='shield'`에서만 `floor(spinProgress×6)`으로 재생. `hue-rotate(-28deg) saturate(2.05) contrast(1.28) brightness(1.28)`, 폭 200→230px — 이전 286→328px 대비 30% 축소 | 기존 칼등 처내기 피해·반사·자원·입력 그대로. 좌클릭·우클릭 악의구에는 적용하지 않음 |

### 스프라이트 시트 VFX
1. **배경은 반드시 투명(alpha=0)** — JPEG 금지, PNG 사용
2. **회색/검정 배경 제거**: 채도(saturation) 기반 제거가 정확 (luminance만으로는 부족)
3. **원본 비율 유지** — `al.range`로 가로만 늘리면 찌그러짐 → `drawH × (FW/FH)` 비율 계산
4. **프레임 애니메이션** — GIF에서 각 프레임 추출 → 세로 배열 스프라이트 시트

## 얼음송곳 (arcLaser) 구현 상세

### 에셋
| 항목 | 값 |
|---|---|
| 파일 | `assets/vfx/arc_laser/laser_sheet.png` |
| 시트 크기 | 870×2720 |
| 프레임 수 | 16 |
| 프레임 크기 | 870×170 (FW×FH) |
| 배열 | 세로 (위→아래) |
| 배경 | 투명 (alpha=0) |
| 원본 | `beam_source.gif` (1024×512 GIF, 16프레임) |

### 배경 제거 알고리즘
```javascript
// 채도 + 밝기 기반 배경 제거
const mx = Math.max(r, g, b);
const sat = mx > 0 ? (mx - Math.min(r, g, b)) / mx : 0;
const lum = r * 0.3 + g * 0.6 + b * 0.1;
if (sat < 0.15 && lum < 90) alpha = 0;         // 무채색+어두움 → 완전 투명
else if (sat < 0.15 && lum < 120) alpha = fade; // 중간 → 페이드
```

### 렌더링 코드
```javascript
const drawH = _AL_DRAW_H * flk;           // 170 × 플리커
const drawW = drawH * (_AL_FW / _AL_FH);  // 비율 유지
const frame = ~~(t / 3) % _AL_FRAMES;     // 3틱/프레임 (초당 ~20fps)

X.save();
X.translate(al.x, al.y);
X.rotate(al.ang);
X.globalCompositeOperation = 'lighter';
X.globalAlpha = flk;
X.drawImage(_AL_IMG, 0, frame * _AL_FH, _AL_FW, _AL_FH,
            -20, -drawH/2, drawW, drawH);  // -20: 캐릭터 밀착
X.restore();
```

### 상수
| 상수 | 값 | 설명 |
|---|---|---|
| `_AL_DRAW_H` | 178 | 시각 두께 (px) |
| `_AL_FRAMES` | 16 | 총 프레임 수 |
| `_AL_FW` | 870 | 스프라이트 프레임 폭 |
| `_AL_FH` | 170 | 스프라이트 프레임 높이 |

### GIF → 스프라이트 시트 파이프라인
1. `omggif`로 GIF 전 프레임 디코드
2. 밝은 픽셀로 빔 각도 측정 → 수평 회전
3. 빔 중심 기준으로 캔버스 배치 (잘림 방지)
4. 채도+밝기 기반 배경 제거 (alpha=0)
5. 여백 트림 (content bounds 측정 후 crop)
6. 세로 배열 PNG 저장

### API 이미지 생성 (Grok)
```javascript
// XAI API (grok-imagine-image)
model: 'grok-imagine-image'
hostname: 'api.x.ai'
path: '/v1/images/generations'
// 키: .env의 XAI_API_KEY
```

## 보스 레이저 (bossLaser) VFX
- `lighter` 합성 4겹 레이어 (외곽→코어)
- 붉은 톤: `rgba(255,80,80)` → `rgba(255,245,240)`
- shadowBlur: 16 → 8 → 4 → 2
- lineWidth: 28 → 14 → 6 → 2

## 보라색 버스트 (teleport_burst) VFX

| 항목 | 내용 |
|------|------|
| 에셋 | `assets/vfx/teleport_burst.png` (576×64, 9프레임 9×1) |
| 등록 | `registerVFX('teleport_burst', ..., 64, 64, 9, 9)` |
| 사용처 | `teleportE()` 도착지 + `activateTimeWarp()` 시간왜곡 발동. **필드보스 착지는 `kraken_tp`로 이관** |
| 스케일 | 텔레포트: `isBig?r/8:r/12`, 시간왜곡: 고정 4 |

## 크라켄 순간이동 임펙트 (kraken_tp)

| 항목 | 내용 |
|------|------|
| 에셋 | `img/vfx/kraken_tp.png` (2048×1024, 4×2, 셀 512, 8프레임) |
| 원본 | `Downloads/ChatGPT Image 2026년 8월 23일 오전 11_19_09.png` (1254×1254 RGBA). 불균일 8장을 alpha bbox로 추출·512셀 센터링 |
| 등록 | `registerVFX('kraken_tp', ..., 512, 512, 8, 4, 'lighter')` |
| 사용처 | 필드보스 `_fbTick` 순간이동 **도착** + **첫 출현 착지**. scale 1.45 (`isSkill:true`) |
| 재생 | frameTime 4 → 8×4=32틱 ≈ 0.53초 (60fps) |
| 모션 | 포탈 개화 → 촉수/참격 → 피크 섬광 → 물보라 붕괴 → 소용돌이 → 잔광 소멸 |

## 크라켄 소멸 (kraken_vanish)

| 항목 | 내용 |
|------|------|
| 에셋 | `img/vfx/kraken_vanish.png` (2048×1024, 4×2, 셀 512, 8프레임) |
| 원본 | `Downloads/ChatGPT Image 2026년 8월 23일 오전 11_33_41.png` (1774×887 RGBA). 8장을 alpha bbox로 추출·512셀 센터링 |
| 등록 | `registerVFX('kraken_vanish', ..., 512, 512, 8, 4, 'lighter')` |
| 사용처 | 필드보스 순간이동 **출발(정방향)** + **도착 꿈틀 상승(역재생 7→0)** + **첫 출현 상승(역재생만, spawnIn)**. `_fbDrawVanishFrame` / `_kvImg` |
| 재생 | 예고 54틱 동안 도착지 역재생. 옛자리는 정방향 32틱. 첫 출현은 옛자리 스킵 |
| 모션 | 정방향: 본체→포탈 소멸. 역방향: 수면 포탈→촉수 분출→본체로 꿈틀 상승 |

## 순간이동 전조 (텔레그래프) 시스템

일반 몬스터 순간이동은 즉발이 아니라 **전조 원이 차오른 뒤 발동**한다. `_tpWarnT`(남은 프레임) / `_tpWarnMax`(총 프레임)로 충전 진행도를 계산하고, 본체에 채워지는 호 + 도착지 조준 에임을 그린다. 렌더: `draw()` 내 `if(e._tpWarnT>0)` 블록.

### 전조 시간 (60틱=1초 기준, 전 텔포 몹 공용)
| 몹 | 변수/위치 | 전조 시간 |
|---|---|---|
| 그림자 쌍둥이 (etype47) | `_stTpCd` | **120f (2초)** |
| 리치 (etype7) | `teleportT` | **120f (2초)** |
| M13 텔레포트 모디파이어 | `modT.tp` | **120f (2초)** |
| 시간 사도 (etype95) | `_tsTpCd` | **120f (2초)** |
| 차원몹 (drTp) | `_drTpCd` | **120f (2초)** |

> 2026-06-29: 전 텔포 몹 전조 0.67~0.8초 → **2초(120f)로 통일**. 차오르는 원이 부드럽게 완성되도록 가독성 강화.

### 전조 렌더 구성
| 요소 | 값 |
|---|---|
| 본체 가이드 풀원 | `arc(e.x,e.y,e.r+7)` alpha 0.18 |
| 본체 충전 호 | `-π/2` 시작, `2π×_twP` 만큼 시계방향 채움 |
| 본체 글로우 펄스 | `e.r+2`, 충전될수록 밝게 (0.2→0.6) |
| 완성 임박(70%↑) 백색 깜박임 | `sin(_now*.05)` |
| **도착지 조준 에임** | 반경 `_tr=(e.r+10)*2` (2배 확대) + 점선 링 (십자 제거) |

> 2026-06-29: 도착지 조준 에임 반경 `e.r+10` → `(e.r+10)*2`로 **2배 확대**. 십자(+)는 "짜친다" 피드백으로 **제거**, 점선 원만 유지.

### 도착 충격범위 (2배 확대, 2026-06-29)
| 요소 | 이전 | 현재 |
|---|---|---|
| `teleportE()` 충격파 링 `ringR` | `isBig?r*3:r*2.2` | `isBig?r*6:r*4.4` |
| 방사 파티클 속도 | `5+rnd*6` | `10+rnd*12` |
| 바닥 균열 사거리 `cd` | `r*.8*j` | `r*1.6*j` |
| 광원 폭발 `_addBlastLight` | `isBig?r*5:r*4` | `isBig?r*10:r*8` |
| `_tpFlashT` 도착 충격파 `_ir` | `e.r*3.5` | `e.r*7` |

### 착지 강타 데미지 (2026-06-29 추가)
`teleportE()` 도착 시, 조준 범위 내 플레이어를 타격한다. **돌진 충돌 `e.atk*30` 대비 70% = `e.atk*21`** (×`elMul(e.el, ar().el)`).
| 항목 | 값 |
|---|---|
| 데미지 | `~~(e.atk*21*elMul(...))` |
| 판정 반경 | `_landR=(r+10)*2` + `P.r` (조준 에임과 동일) |
| 조건 | `!e.ib`(비보스) + `P.iframes<=0` + `P.s!=='charge'`(돌진 무적 회피 가능) |
| 넉백 | 방사 방향 60 |
| 표시 | `_T('충격파!')` (기존 번역어 재사용, 신규 번역 없음) |
| 회피법 | 2초 전조 동안 조준 원 밖으로 이동 |
> 보스/부활 텔포는 자체 패턴 유지 위해 `!e.ib` 가드로 착지 강타 제외.

## 순간이동 연기 (TP-SMOKE) VFX

### 개요
몬스터 순간이동(`teleportE()`) 시 출발지/도착지에 보라빛 연기 스프라이트를 오버레이.
기존 파티클+충격파+번개 이펙트 위에 추가 레이어로 동작.

### 에셋
| 항목 | 값 |
|---|---|
| 출발 연기 | `img/vfx/teleport_out.png` |
| 도착 연기 | `img/vfx/teleport_in.png` |
| 크기 | 64×64px, RGBA PNG |
| 색상 | 어두운 보라빛 (dark purple) |
| 생성 도구 | PixelLab (create_object) |
| PixelLab ID (출발) | `02f68009-b40d-45bc-9967-6b1910099ca5` |
| PixelLab ID (도착) | `c2d715e3-8f0e-412a-a7b1-03d8f63ff3ee` |

### 풀 시스템
| 상수 | 값 | 설명 |
|---|---|---|
| `_TP_SMOKE_MAX` | 10 | 최대 동시 연기 수 |
| `type=0` | 출발(out) | 퍼지며 사라짐 |
| `type=1` | 도착(in) | 응축되며 나타남 |

### 연출 상세
| 항목 | 출발 (type=0) | 도착 (type=1) |
|---|---|---|
| 지속시간 | 18프레임 | 22프레임 |
| 크기변화 | 1.0→2.8배 확대 | 2.2→0.6배 축소 |
| 투명도 | `(1-p²)×0.85` 페이드아웃 | 0→1→0 (0.4 피크) |
| 회전 | +1.5rad 시계방향 | -1.2rad 반시계방향 |
| 합성모드 | `lighter` | `lighter` |
| 크기 기준 | `e.r × 4` | 대형: `e.r × 5`, 일반: `e.r × 4` |

### 호출 위치 (총 7곳)
| 위치 | 출발 연기 | 도착 연기 | 비고 |
|---|---|---|---|
| `teleportE()` (일반 몬스터+보스 공용) | `r*4, 18f` | `isBig?r*5:r*4, 22f` + `teleport_burst` VFX (보라색 9프레임) | 범용 순간이동 |
| 보스 Phase5 텔포 (26177) | `_phR*4, 18f` | `_phR*5, 22f` | 보스 페이즈 전환 |
| 시간왜곡 텔포 (28096) | `_r95*4, 18f` | `_r95*5, 22f` | 시간왜곡 몬스터 |
| 보스 텔레포트 준비 (28765) | `_br*4, 18f` | `_br*5, 22f` | 보스 공중 텔포 |
| 부활 순간이동 (30082) | `_rvR*4, 18f` | `_rvR*5, 22f` | 보스 부활 후 재배치 |
| 필드보스 심연의 앵글러 `_fbTick` TP (2026-08-23) | `kraken_vanish` 정방향 옛자리 | 도착지 `kraken_vanish` 역재생 꿈틀 상승 + `kraken_tp` 착지 | 빨간 장판만 나오던 문제 수정. 예고=상승 연출 |
| 필드보스 심연의 앵글러 첫 출현 (2026-08-23) | 없음(옛자리 없음, `spawnIn`) | 도착지 `kraken_vanish` 역재생 54틱 + `kraken_tp` 착지 | 구 구현은 `hid:0` 본체 즉시 표시. 착지 강타 데미지 없음 |
| 지상뱀장어 `_wmVanish/_wmAppear` (2026-08-23) | `r*3, 18f` + 흙 파티클 | `r*2.2, 16f` + `_addTpImpact(r*2.2)` | hide 54f 동안 도착지에 프레임0→1 엿보기. `!` 원 제거. 보이면 도망. |

## 독립 필드몹 사망 VFX (`_fmDeathFx`, 2026-08-23)

`ens`/`hurtE` 바깥의 심연의 앵글러·지상뱀장어는 기존에 `_spawnLargeMonsterDeathFx` 파티클만 나와 시체가 안 날아갔다. 공용 `hurtE` 사망 키트를 `_fmDeathFx`로 묶고, 시체 스프라이트만 전용 시트에서 캡처한다. `_deathFxDone`으로 `_fmApply` / `_fbTick` / `_wmTick` 이중 발동을 막는다.

| 단계 | 함수 | 앵글러 (필드보스, r=120, ib 취급) | 지상뱀장어 (r=56) |
|---|---|---|---|
| 사망음+혈흔 VFX | `deathFX` | `isBoss` → `death_boss`. `death_blood` scale `clamp(0.35+r×0.075,0.8,4.8)` = **4.8** | et 50 → `death_demon`. 같은 공식 = **4.55** |
| 대형 파티클 | `_spawnLargeMonsterDeathFx` | 26발 `#ff5577/#ffccdd` (ib) | 16발 `#ffaa66/#ffd9aa` (`r>=18` 또는 `mhp>=220`로 발동) |
| 시체 래그돌 | `_addCorpse` | `_fbSheet` 8방향 현재 프레임 → 128×128. sz=`max(80,r*2.5)`=**300**. 수명 600. 파워 `max(5, dmg/mhp*20)` cap 8 → 비행 spd max 5 | `_wmSheet[face]` 현재 프레임. sz=`min(200,r*2.2)`≈**123**. 수명 420. 파워 min 2 |
| 바닥 잔류 | `_addFloorTrace` | 핏자국 **56** + 살점 1. 시체 팬케이크 sz **66** (구 300). 맵 전환까지 | 핏자국 **36** + 살점 1. 시체 sz **42** |
| 고어 파편 | `_addGorePiece` | 5개 (flesh/blood/내장 + skull/heart). 30% `camFling` | 2개 (공통 1 + 내장/장기 1) |
| 혈흔 폭발 | `_addDeathImpact` | `maxSz=clamp(r×3,24,240)`=**240**. `blood_impact_2/3/4` 랜덤 | 같은 공식 = **168** |
| 카메라 | `shake` + 플래시 | shake 18, `_flashT=4` `#66ddff`, `_chromaT=3` | shake 8 |
| 캡처 | `_fmDrawSpriteTo` | `_fbSheet` 셀 300, frame%8 | `_wmSheet` 셀 150, frame%12. face 0=우 1=좌 |

호출: `_fmApply` HP≤0 (실피격). 백업 `_fbTick`/`_wmTick` HP≤0. `OPT.deathFx=false`면 시체/고어/임팩트만 생략, `deathFX` 혈흔 스프라이트는 유지 (`hurtE`와 동일).

### PixelLab 애니메이션 (미다운로드)
PixelLab에서 8프레임 애니메이션도 생성 완료했으나, MCP API로 애니메이션 스프라이트시트
다운로드 불가. 현재는 정적 이미지 + 코드 애니메이션(스케일/회전/투명도)으로 대체.
향후 PixelLab 웹에서 수동 다운로드하여 스프라이트시트로 교체 가능.
- teleport_out 애니메이션 ID: `cba87a95-a936-4d6d-aac4-eabaf2c98cdc`
- teleport_in 애니메이션 ID: `8afdbb2d-0de9-4daf-bcbe-c4dcaf533575`

## 장판 VFX (fz.type별)

### 악의폭풍 (storm) — 이오닉 스톰
- **구성**: 바닥격자번개 + 밀집 번개 스프라이트 3장(`_msStormImg1/2/3`) + 외곽전기아크
- **색상**: 격자 `#6644cc`, 아크 `#8866ff`, screen 블렌드
- **스프라이트 수**: 12~16개 랜덤 배치, 30프레임마다 위치 셔플

### 해골번개 (boneStorm) — 이오닉 스톰 + 뼈/암흑 오버레이
- **기반**: 악의폭풍과 동일한 이오닉 스톰 VFX 공유 (2026-06-08 통합)
- **색상 차이**: 격자 `#446622`(녹색), 아크 `#55cc44`(녹색)
- **추가 레이어**: 뼈 파편 직사각형(10개, `#ccbb99`/`#bbaa77`) + 암흑 스파크(`#6644aa`/`#55cc77`)
- **이전**: 뼈 파편+스파크만 있어서 임팩트 부재 → 이오닉 스톰 기반으로 통합

### 회복의 영역 (holyDome) — 라임 치유 글로우 장판
- **기본 색상·가독성**: 색상 기준은 사용자가 지정한 밝은 라임 `#b6ff54`다. 딥포레스트/이끼색 코어는 사용하지 않는다. 투명화한 원본 문양은 `#b6ff54` 한 겹만 `lighter`로 합성하며, 알파는 `0.40–0.64`로 유지한다. 문양 선에만 같은 색 `shadowBlur:18px`의 작은 글로우를 더한다. 반경 전체를 채우는 방사형 오라·색상 필터는 사용하지 않으며, 3px 고명도 라임 경계 링 `#d5ff72`(알파 `0.64–0.82`)으로 범위만 판독한다. 수증기 하이라이트는 `#e4ffb0`.
- **마법진**: 기존 `sprites/holy_dome.png`를 오프스크린 캔버스에서 녹색 틴트해 사용한다. 노란 원본 장판은 일반 회복 영역에 표시하지 않는다.
- **원본 전처리·후처리 격리**: `holy_dome.png`는 검은 배경이 불투명한 원본이므로 `source-atop` 틴트를 사용하지 않는다. 최초 로드 시 픽셀 휘도 `max(R,G,B)`를 알파로 변환해 검은 픽셀을 완전 투명화한 뒤 라임 `(182,255,84)` 문양만 캐시한다. 토치 후처리의 중립 횃불 컷아웃은 holyDome에 적용하지 않는다. 따라서 전체 반경의 회색·황갈색 원 없이 라임 문양의 작은 글로우, 링, 수증기만 남는다.
- **울렁임**: 반경의 62~90% 구간에 이중 원형 파동 2개를 느린 사인파로 확장·수축시킨다. 선폭은 3px, 새싹 글로우가 읽히도록 알파는 `0.64–0.82`로 유지한다.
- **수증기**: 영역당 9개의 저밀도 입자가 반경 16~82%에서 위로 최대 반경의 14%만 이동한다. `lighter` 합성, 최대 알파 `0.32`로 시야를 가리지 않으면서 치유감을 낸다.
- **범위**: 시각 효과만 변경한다. 리젠, 회복 배율, 쿨다운 가속, 범위, 지속시간 수치는 변경하지 않는다.

## 주의사항
- **JPEG 사용 금지** — 압축 아티팩트로 near-black 픽셀 생김 → lighter에서 회색 보임
- **캐시 버스팅** — 스프라이트 교체 시 `?v=날짜` 쿼리 필수
- **GIF 1프레임만 쓰지 않기** — 반드시 전 프레임 추출해서 애니메이션 시트 구성
- **drawImage 비율** — `al.range`로 강제 스트레칭하면 찌그러짐, `drawH * (FW/FH)`로 비율 유지

---

## ATMOS 후처리 레이어 (Ori 분위기) — 2026-08-22 신설

`game.html` 3패스 스크린공간 후처리. **OPT.atmos** 3단(0=끔/1=간략/2=전체), 기본 2(구저장본 호환 `if(OPT.atmos===undefined)OPT.atmos=2`). 티어 프리셋 S/A=2, B=1, 기타=0. 합성은 source-over·lighter만(GL 프록시 미지원 screen/overlay 회피).

### 캔버스 6장 (부팅 1회 `_atmBuild()`, draw 진입부 lazy guard)
| 캔버스 | 크기 | 내용 |
|---|---|---|
| _atmFogA | 512² | radial arc 40개 rgba(120,150,190,.05) r60-180, wrap 이음매 제거(9-offset) |
| _atmFogB | 512² | rgba(90,120,160,.07) r30-90 (시드 다름) |
| _atmRay | 1024×512 | 사선 -22° 스트라이프 7개, rgba(255,238,200,0→.10→0) 폭40-110 |
| _atmVig | C.width×C.height | radial 중심투명, .55~1 rgba(0,0,0,.62). **리사이즈 재생성 + `_glVer++` 필수**(GL 텍스처 캐시 고정 방지) |
| _atmGradeHi | 1×256 | 상단 rgb(70,110,140)→검정 (lighter .09) |
| _atmGradeLo | 1×256 | 검정→하단 rgb(60,20,45) (source-over .10) |
| _atmMote | Float32Array(82×8) | **[x,y,size,alpha,phase,parallax,driftAmp,riseSpd]** — 3뎁스 패럴랙스 부유입자 (2026-08-23 PHASE2, 구 96×5 x,y,vx,vy,phase) |

### 3패스 (draw 내, screen-space)
- **3-1 DEPTH HAZE** (맵/데코 후·엔티티 전, atmos≥2): #121a2a .22 + FogA lighter **.05** 파랄럭스(cam×.15) 커버타일 (2026-08-23 반감, 구 .10). 중앙은 토치 홀펀치 대신 방사 그라데이션으로 50%만 걷음.
- **3-2 RAY+FOG+MOTE** (엔티티 후·토치 전, atmos≥2): 갓레이 2패스(.11 cam×.05+sin흔들 / .06 cam×.09 ×1.4확대) + FogB 근경 **.06** cam×.45 (2026-08-23 반감, 구 .12) + **부유입자 82개 3뎁스 패럴랙스**(아래 PHASE2 상세)

#### ATMOS 재설계 — 흐림필터 폐기 → 사이드 입자 안개 (2026-08-23)
화면 전체 반투명 회색 덮기(farFog/nearFog/veil/`_atmCut`)=검정 들어올림·저대비 원인 → `_ATMDBG` 플래그로 **전부 영구 OFF**(코드 삭제 아님, F9로 개별 재활성 가능). 대체: **사이드 입자 안개**(`_sideFog=Float32Array(44×8)`, `_ATMDBG.sidefog=1`).
- 필드 `[bx,y,sizeN,alpha,swayPhase,vy,side,stamp]`. 3뎁스 **16/16/12=44개**(A 느림/작음/옅음 → C 빠름/큼/진함). blend=**lighter 고정**(source-over 회색덮기 0). 검정은 검정 유지.
- **모션(2026-08-23 재튜닝, "막 변함" 수정)**: 초기 카메라 패럴랙스 mod-wrap이 좁은 밴드서 큰 구름을 튀게 함 → **폐기**. 대체=느린 수직 상승(vy 0.05~0.20)+화면밖 seamless wrap(`y<-sz → C.height+sz`, 팝 은폐)+미세 sway(`sin(_atmT*.005+phase)*7px`). 카메라 비결합 → 안정적.
- 배치: 좌 0~22% / 우 78~100% 밴드에만. 중앙 22~78% 스폰·wrap 양쪽 배제(밴드폭 `C.width*0.22` mod wrap → 중심점 절대 미진입). 크기=`sizeN×C.height`(**14~34%**), 알파 **0.12~0.24**(가시성 튜닝, 구 0.05~0.11 과소). 색=`bright×0.75+흰×0.25`, 스탬프 3종 boot 베이크·챕터전환시 recolor. 울트라와이드=비율기준 자동대응.
- **중앙글로우 OFF (2026-08-23, `_CENTER_GLOW=false`)**: 플레이어 등불(preset6) 컬러 발광을 `_renderLighting` 컬러패스에서 `(cl.ci===6)continue`로 제외. 어둠홀(destination-out)은 유지 → 캐릭터 가시성 보존, 중앙 warm bloom만 제거. `true`로 복구.
- 렌더=3-2 블록 내(기존 save+lighter 재사용), for 인덱스+drawImage만(arc/fill/shadowBlur 0). perf 저하 시 36→24.

#### ATMOS PHASE 3 — 전경 실루엣 기본 비활성화 (2026-08-24)

| 키 | 기본값 | 생성 수치 | 렌더 수치 | 적용 위치 | 결정 |
|---|---:|---|---|---|---|
| `_ATMO_FG` | `false` | 오프스크린 4장 `256×1024`, 기둥 폭 `28~74px`, y `-40~1064` | 좌 `0~22%` / 우 `78~100%`, NEAR alpha `0.90`, FAR alpha `0.52` | `_atmoFgDraw()` | 전 화면 높이의 절차형 기둥이 울트라와이드에서 검은 세로 줄로 판독되므로 기본 렌더를 끈다. 콘솔에서 `window._ATMO_FG=true`로 명시한 경우에만 표시한다. |

사이드 입자 안개(`_ATMDBG.sidefog=1`)는 유지한다. 이번 비활성화 대상은 `FG_L_NEAR/FG_L_FAR/FG_R_NEAR/FG_R_FAR` 네 장을 그리는 전경 실루엣 패스뿐이다.

#### ATMOS PHASE 2 — 부유입자 3뎁스 패럴랙스 (2026-08-23)
Ori 수준 대기 깊이감. 광원 근처에서 존재감 나는 미세 입자. `_atmMote=Float32Array(82×8)` 재배치(신규 풀 아님, 기존 96×5 재사용). 렌더=3-2 블록 `lighter`, 갓레이 뒤·토치 앞. blend 전환 없음, save/restore 블록당 1회.

| 뎁스 | 인덱스 | 개수 | parallax | size(px) | riseSpd | driftAmp | shape(α) | 실효 alpha* |
|---|---|---|---|---|---|---|---|---|
| A 원경 | 0~39 | 40 | 0.25 | 1.0~1.6 | 0.08 | 6~9 | 0.28 | ≈.13~.18 |
| B 중경 | 40~67 | 28 | 0.55 | 1.6~2.6 | 0.14 | 8~11 | 0.44 | ≈.21~.28 |
| C 근경 | 68~81 | 14 | 0.90 | 2.4~4.0 | 0.22 | 11~14 | 0.58 | ≈.27~.37 |

\* 실효 alpha = **shape × 고정지터(0.85~1.15, boot 1회) × `_ATM_A[5]`(=.55 마스터)**. 뎁스 알파 리터럴 없음 — `_ATM_A` 슬롯 증설 대신 shape를 파티클 alpha 필드에 boot 베이크(매프레임 분기·리터럴 0). `_ATM_A` 미접촉.

- **거동**: y 상승(`-=riseSpd`) → 상단 이탈 시 y만 `C.height`로 리셋(좌표 재사용, 재생성 없음). 좌우 = `sin(_atmT*.02 + phase)*driftAmp`. 시간=기존 `_atmT` 재사용(신규 타이머·`Date.now` 없음).
- **패럴랙스**: 스크린좌표에서 `-G.cam.x*parallax` / `-G.cam.y*parallax` 역보정 후 `((v%C.w)+C.w)%C.w` screen-space wrap(좌우·상하). 원경(0.25)<근경(0.90) 이동차로 깊이감.
- **색**: `HELL_PALETTES[hell].bright × 0.6 + 흰255 × 0.4(=+102)` rgb 문자열. **hell 인덱스 변화시에만** `_atmMoteColStr` 재계산(`_atmMoteColHell` 감지), 매프레임 파싱·계산 없음. PP_TONE 문자열 파싱은 핫패스 회피로 미채택.
- **렌더 제약 준수**: for 인덱스 단일 루프, `fillRect`만(arc/fill 0), new/splice/filter/forEach 0. 드로우콜 = 82×(globalAlpha+fillRect), 구 96×2대비 감소.
- **변경이력**: 2026-08-23 STEP2 — 96×5(screen wrap·패럴랙스 없음·단일 alpha shimmer) → 82×8 3뎁스 패럴랙스. decl(_atmMote+색캐시 2변수)/`_atmBuild` init/3-2 draw 3곳. `_ATM_A`·`drawAtmosphere`(PP grade)·`_oriFireflies`/`_oriSmoke` 미접촉. perf 수치측정은 스트리밍 STEP2 미완이라 보류(육안 체감만).
- **3-3 VIGNETTE+GRADE** (토치 후·UI 전, atmos≥1): GradeHi lighter .09 + GradeLo source-over .10 + Vignette

### 성능 자동 강등 (전역 var 2개 _atmLoF/_atmHiF)
55fps<180f → atmos 2→1 / 70fps>300f → 1→2. loop fps 히스테리시스 직후.

### 구현 메모/적응
- **2x2 타일 → 커버-타일링**: SSAA로 C.width가 커서(백킹픽셀) 2x2(1024px)론 대화면 미커버 → `for` wrap 커버타일로 보정.
- **G.chapter 부재** → `SI_TO_HELL[G.stage||0]`로 챕터 산출.
- **BOOTH 공존**: `_boothDraw()`는 별도 DOM 오버레이 캔버스(z9999) → ATMOS(메인 캔버스)와 합성 무충돌. 순서=ATMOS 3-3→UI→booth.
- **동시세션 주의**: 저쪽 조명 시스템(_litColCvs/_COL_PRESET/_initColStamps, 챕터 틴트)과 도메인 인접 — ATMOS는 독립 후처리 패스라 공존하나, 렌더순서/이중틴트 과다 시 조율 필요.
- **정지 hitch (2026-08-23)**: `_atmCut`는 카메라·플레이어·관련 `_ATM_A` 픽셀키가 바뀔 때만 재빌드하고 `_glVer++`. 매 프레임 버전 범프는 WebGL `_getTex`가 전체화면 텍스처를 새로 만들게 해 3~4초 GPU GC hitch가 났다. 비-map 동적 캔버스는 같은 크기면 GPU 텍스처를 재사용한다(map `_mapTex` Track D 경로는 불변). 상세: `docs/12퍼포먼스·최적화/12퍼포먼스·최적화.md` §ATMOS 정지 hitch.
- **안개 반감 (2026-08-23)**: FogA `.10→.05`, FogB `.12→.06`. 같은 날 Three.js `fog*0.82→0.41`, 가장자리 `_fogPulse` `.55±.15→.28±.08`.
- **중앙 그라데이션 (2026-08-23)**: `_atmCut` destination-out 방사 그라데이션으로 플레이어 중심 안개 제거. stop `0→α1(완전제거) / 0.30→0.60 / 0.60→0.22 / 1→0`(긴 감쇠, 원형 경계 방지). 반경 `max(W,H)×(0.72+_ATM_A[8]×0.50)`. 가시성 이력: clear 반경 계수 `0.40→0.50→0.72`, 중앙 stop `0.50→α1(완전제거)`로 강화(캐릭터 근처 대비 확보). `_ATM_A[8]` 불변. Three.js는 `smoothstep(0.12,0.45,d)` 구멍 대신 `mix(0.50,1.0,smoothstep(0.0,0.62,d))`.
- **PP L3 비네트 중앙 클리어 확장 (2026-08-23 ATMOS 가시성)**: `drawAtmosphere` L3(`PP_GRAD_VIG`, `globalAlpha=PP_A_VIG=.55` **불변**). 프리셋6 플레이어 등불이 중앙집중인데 비네트가 중앙까지 눌러 "캐릭터가 배경에 먹힘" → 그라데이션 shape로만 해결(알파 마스터 불변).
  - 반경: 내(투명)`min×0.34→0.42→0.50`(2차 D 확대) / 외(검정)`max×0.72→0.57` **당김**. plateau stop `0.30→0.42`(중앙 클리어 영역 추가 확대). 0.80 α0.70·1 검정·_pr1 불변. 이유: 16:9서 `0.72×max`는 화면 대각 반경(≈`0.57×max`)보다 커서, 코너·사이드가 램프 초반에 매핑돼 어둠 소멸 → 외반경을 코너 거리로 당겨야 "중앙 클리어 + 사이드 어둠 유지"가 성립.
  - stop: 2-stop 선형(`0→투명 / 1→검정`) → **`0:투명 / 0.30:투명(plateau) / 0.80:α0.70 / 1:검정`**. 중앙 plateau로 코어 완전 클리어, 사이드(반경 중간) 어둠 유지, 코너 최대어둠(α1, 값 불변). 실효 예(1920×1080): 코너≈0.55(구 0.40, "더 강하게"), 사이드중앙≈0.38(구 0.32 유지), 상하중앙·중앙 코어=투명.
  - **불변**: `PP_A_VIG/PP_A_GRADE/PP_A_LIFT` 수치·프리셋0~6 falloff·`_atmMote`·`_ATM_A` 값 전부 미접촉. 편집=L3 그라데이션 4→6줄 + `_atmCut _fallR` 계수 2곳.
- **컬러조명 스탬프 falloff (`_initColStamps`, game.html:~4035)**: 프리셋 `_COL_PRESET`별 256×256 방사 그라데이션 스탬프를 프리베이크(boot 1회, `if(_colStamps)return` 가드) → `_litColCvs`에 `lighter`(가산)로 덧입힘. 최종 합성은 `X.globalAlpha=LIT_COL_MIX(=.62)` **스칼라** 균일 알파(game.html:47034) — 프리셋별 MIX 배열은 **없음**(프리셋별 강도는 스탬프 알파 + per-light `cl.a*.85`가 담당).
  - **프리셋 라우팅** (`_colIdx`, game.html:4054): 광원 RGB → 프리셋번호. **0=주황`[255,172,72]`(catch-all 기본 포함) / 1=하늘 / 2=보라 / 3=적 / 4=녹 / 5=warm-white / 6=플레이어 등불 전용`[255,214,158]`(2026-08-23 신설)**.
  - 표준(0~5번 프리셋) stop: `0:.95 / .28:.52 / .58:.20 / .82:.05 / 1:0`.
  - **프리셋6 전용 slot (플레이어 등불, 중앙 선명·외곽 급감)** stop: `0:.95 / .28:.40 / .58:.08 / .82:0 / 1:0`. 중앙 코어(.95) 동일=펀치 유지, 외곽 haze만 제거. 반경 `LIT_PLAYER_R=470` 불변.
  - **주황 프리셋0 공유 사용처(참고)**: 플레이어 등불 외 — bonfire(모닥불), m_fyellow 정적장식, fireZone(화염장판), 유령불꽃 펫(iris), 물리/뇌전 보스광원. 프리셋0은 catch-all이기도 함.
  - **변경이력**:
    - 2026-08-23 ①(탁함 1차): 프리셋0만 falloff 완화(`.28→.40 / .58→.08 / .82→0`) — **but 프리셋0이 모닥불/화염/펫/보스와 공유라 warm 광원 전반이 함께 흐려짐**(부작용).
    - 2026-08-23 ②(전용 슬롯 분리, PHASE2): 프리셋0 falloff **표준값으로 원복**(모닥불/화염장판/보스/펫 haze 복구) + **프리셋6 신설**(RGB 255,214,158, 튜닝 falloff 이관) + `_colIdx` 최상단 정확매칭 `if(r===255&&g===214&&b===158)return 6` 라우팅. 루프 `i<6→i<7`. 프리셋1~5 및 색상값·`LIT_COL_MIX`·반경 전부 불변.

### ATMOS 알파 상수화 + 튜닝 HUD + 자동승격 차단 (2026-08-22)
- **알파 상수화**: 3패스 하드코딩 알파 8개 → `_ATM_A=new Float32Array([.22,.05,.11,.06,.06,.55,.045,.05,.45,.55])` (0헤이즈틴트/1원경안개A **.05**/2갓레이1/3갓레이2/4근경안개B **.06**/5부유입자/6그레이드Hi/7그레이드Lo/8cutR/9cutSoft). `_ATM_A_DEF`=R복원용. FogA/B는 2026-08-23 반감(.10→.05, .12→.06). 갓레이·모트·그레이드·홀펀치는 유지.
- **A1 이중틴트 완화**: 그레이드Hi .09→**.045**, Lo .10→**.05** (타세션 컬러조명과 색영역 중복 → 색은 조명 소유, ATMOS는 깊이 담당). 조명 합성지점: game.html 라이트패스 `X.globalAlpha=LIT_COL_MIX` lighter.
- **A2 자동승격 차단**: `_atmUserSet`(사용자 atmos 수동변경 시 1). STEP5 복구조건 `else if(OPT.atmos===1&&!_atmUserSet)`. 자동강등(부스 안전장치)은 유지.
- **튜닝 HUD**(디버그 전용): `_ATM_TUNE=false`(소스 마스터, false시 100% 무영향)·`_atmHudOn`(F9 가시성 토글)·`_atmSel`. 키(게임 keydown 분기, 새 리스너 없음): F9 토글 / ↑↓ 선택 / ←→ ±.005 / PgUp·Dn ±.05(0~1 클램프) / C 배열 console 출력(`.220` 붙여넣기형) / R 초기값. 전용 DOM 오버레이 캔버스(z100000, booth와 분리해 clearRect 충돌 방지). 영문 고정(번역 제외).
