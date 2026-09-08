# 실버테일 악의구 — 은빛 초승달 v2

2026-09-08. 사용자가 변경 대상을 악의구로 지정했다. 은발 검사에 맞춰 은빛 칼날 실루엣을 중심으로 재디자인했다.

| 항목 | 현재 계약 |
|---|---|
| id / 입력 | `fireball` / 실버테일 우클릭 |
| 적용 조건 | `p.fireball && _charIdx===1 && _silvMaliceOrbReady` |
| 에셋 | `img/vfx/silvertail_malice_orb_moonblade_v2.png` |
| 파일 | 1254×1254 RGB PNG, 녹색 크로마 단일 원화 |
| 형태 | 검은 공허 핵, 은빛 초승달 칼날 3장, 청보라 내부광과 짧은 잔광 |
| 배경 처리 | `_makeGreenChromaCutout(_silvMaliceOrbImg)` 로드 시 1회 캐시 |
| 표시 지름 | `p.r×6.2×(1+sin(now×.014+p.x×.025)×.035)` |
| 회전 | `now×.0012+p.x×.002` |
| 본체 / 보조광 | 본체 alpha `fa`; 1.08배 `lighter` 보조광 alpha `fa×.18` |
| 폴백 | 기존 공용 7×3/20프레임 오브, 최종 보라 원형 |
| 전투 수치 | 기존 피해·속도·거리·폭발·중독·자원 경로 유지 |
| 다른 입력 | 좌클릭 기검참과 KeyE 칼등 처내기는 기존 에셋 유지 |
| 이전 원화 | `img/vfx/silvertail_malice_orb_realistic.png` 보존, 현재 로더에서 사용하지 않음 |
| 검증 | 관련 테스트 5개 및 인라인 JS 6개 문법 파싱 통과. 실제 배경 제거 함수·렌더 분기를 별도 Canvas에서 실행해 반경 12/24/36, 밝고 어두운 바탕 확인. 녹색 모서리 alpha=0, 중심 alpha>240, alpha≥64 픽셀에서 green spill 0 |
| 검증 한계 | 연결 가능한 브라우저 없음. 실제 게임 조작·전투 중 가시성은 미검증 |

## 생성 이력

내장 `image_gen` 사용. 최초 출력은 요청한 alpha 대신 체크무늬가 포함된 RGB라 채택하지 않았다. 두 번째 편집 출력의 녹색 배경을 게임의 기존 크로마 제거 함수로 처리한다. 원본 이미지를 덮어쓰지 않고 v2 파일을 추가했다.

### 최초 생성 프롬프트

```text
Use case: stylized-concept. Asset type: single isolated dark fantasy game projectile sprite, Malice Orb for the silver-haired sword dancer Silvertail. Create a new polished replacement design: a compact pitch-black spherical void core enclosed by three broad razor-sharp SILVER WHITE crescent blades, arranged as a dynamic circular pinwheel, pale lavender-blue energy between the blades, a restrained violet rim around the black core, a few short tapered wisps trailing from the blade tips. Strong readable silhouette at 80 pixels. Silver blade edges must read clearly against both dark and light backgrounds; black core remains dark. Top-down three-quarter game VFX art, detailed semi-realistic metal and magical energy, aggressive elegant moonblade character identity. Center the orb precisely in a SQUARE canvas, circular overall silhouette occupying 80 percent of image width and height, balanced margins, no long comet tail. Genuinely TRANSPARENT alpha background, no ground, no cast shadow, no checkerboard drawn into image, no green chroma, no text, no labels, no characters, no frame. This is one runtime sprite, not an icon button or concept sheet.
```

### 채택한 편집 프롬프트

```text
Edit target: the provided silver three-crescent Malice Orb sprite. Preserve the existing design, black center, silver crescent blades, lavender and purple magic, size, composition, and square framing exactly. Replace ALL white/light gray CHECKERBOARD background, including holes visible between the crescent blades, with perfectly flat solid pure chroma-key GREEN RGB(0,255,0), #00ff00. No checkerboard anywhere. No white backdrop. No green tint on the blades. Keep the dark black center opaque black. Refine the magic outer edges to short clean purple tendrils against the pure green background without broad pale-white fog. One centered sprite on completely flat bright green. This green-background sprite is required for the game's existing chroma cutout pipeline.
```
