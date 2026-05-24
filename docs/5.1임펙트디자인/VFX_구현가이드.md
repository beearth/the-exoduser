# VFX 구현 가이드

## 폭발 임팩트 (`_addBoom`) 지속시간
- **최소 66프레임 (1.1초) 보장** — `_addBoom` 함수에서 `Math.max(66, dur)` 적용
- 기존 14~28이었던 fire/ice/dark 등 → 66으로 상향
- 빨콩/무지개(72)는 기존값 유지 (66보다 크므로)

## 핵심 원칙

### 빛 표현 (레이저/빔/글로우)
1. **검정 절대 금지** — 빛은 안쪽이 가장 얇고 밝고, 바깥으로 갈수록 두껍고 어두움
2. **`lighter` 합성 모드 사용** — `globalCompositeOperation='lighter'` → 검정(0,0,0)은 투명 처리됨
3. **두꺼운 lineWidth로 글로우 만들지 않기** — lineWidth 32+ 라인은 검은 막대로 보임
4. **shadowBlur로 빛 번짐** — 라인은 얇게(2~3px), shadowBlur(20~40)로 글로우 표현

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
| 사용처 | `teleportE()` 도착지 + `activateTimeWarp()` 시간왜곡 발동 |
| 스케일 | 텔레포트: `isBig?r/8:r/12`, 시간왜곡: 고정 4 |

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

### 호출 위치 (총 5곳)
| 위치 | 출발 연기 | 도착 연기 | 비고 |
|---|---|---|---|
| `teleportE()` (일반 몬스터+보스 공용) | `r*4, 18f` | `isBig?r*5:r*4, 22f` + `teleport_burst` VFX (보라색 9프레임) | 범용 순간이동 |
| 보스 Phase5 텔포 (26177) | `_phR*4, 18f` | `_phR*5, 22f` | 보스 페이즈 전환 |
| 시간왜곡 텔포 (28096) | `_r95*4, 18f` | `_r95*5, 22f` | 시간왜곡 몬스터 |
| 보스 텔레포트 준비 (28765) | `_br*4, 18f` | `_br*5, 22f` | 보스 공중 텔포 |
| 부활 순간이동 (30082) | `_rvR*4, 18f` | `_rvR*5, 22f` | 보스 부활 후 재배치 |

### PixelLab 애니메이션 (미다운로드)
PixelLab에서 8프레임 애니메이션도 생성 완료했으나, MCP API로 애니메이션 스프라이트시트
다운로드 불가. 현재는 정적 이미지 + 코드 애니메이션(스케일/회전/투명도)으로 대체.
향후 PixelLab 웹에서 수동 다운로드하여 스프라이트시트로 교체 가능.
- teleport_out 애니메이션 ID: `cba87a95-a936-4d6d-aac4-eabaf2c98cdc`
- teleport_in 애니메이션 ID: `8afdbb2d-0de9-4daf-bcbe-c4dcaf533575`

## 주의사항
- **JPEG 사용 금지** — 압축 아티팩트로 near-black 픽셀 생김 → lighter에서 회색 보임
- **캐시 버스팅** — 스프라이트 교체 시 `?v=날짜` 쿼리 필수
- **GIF 1프레임만 쓰지 않기** — 반드시 전 프레임 추출해서 애니메이션 시트 구성
- **drawImage 비율** — `al.range`로 강제 스트레칭하면 찌그러짐, `drawH * (FW/FH)`로 비율 유지
