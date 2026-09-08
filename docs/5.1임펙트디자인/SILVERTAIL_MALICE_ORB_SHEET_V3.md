# 실버테일 악의구 — 6프레임 스프라이트 v3

2026-09-08. 사용자 요청: 악의구 탄막에 스프라이트 제작. v2 원화를 기준으로 내장 `image_gen`에서 6프레임 시트를 생성하고 게임 로더·렌더에 연결했다.

| 항목 | 현재 런타임 계약 |
|---|---|
| id / 입력 / 캐릭터 | `fireball` / 우클릭 / 실버테일 `_charIdx===1` |
| 에셋 | `img/vfx/silvertail_malice_orb_sheet_v3.png` |
| 크기 / 배경 | 1536×1024 RGB PNG, 녹색 크로마 |
| 원본 배열 | 3열×2행, 각 명목 셀 512×512, 고유 프레임 6개 |
| 실제 소스 크기 | `_SILV_MALICE_ORB_FRAME_SIZE=432`, 각 소스 사각형 432×432 |
| 중심 정렬 | 프레임별 검은 핵의 최대 연결 영역(`max(R,G,B)<30`, 명목 셀의 중앙 256×256 탐색) 무게중심을 반올림해 공통 소스 중심 `(216,216)`에 배치. 프레임별 확대·축소 없음 |
| 프레임 간격 | `_SILV_MALICE_ORB_FRAME_MS=80`ms, 초당 12.5회 전환 |
| 순서 | `0,1,2,3,4,5,4,3,2,1`, 10단계·800ms 반복 |
| 선택 공식 | `_smStep=floor(_now/80)%10`, `_smFrame=_smStep<6?_smStep:10-_smStep` |
| 시간 기준 | `_now`만 사용. 투사체 이동 좌표는 프레임 선택에 관여하지 않음 |
| 표시 지름 | 기존 `p.r×6.2×(1+sin(_now×.014+p.x×.025)×.035)` |
| 회전 | 기존 `_now×.0012+p.x×.002` |
| 합성 | 본체 alpha `fa`, `lighter` 보조광 1.08배·alpha `fa×.18`, 프레임당 2 drawImage |
| 로드 처리 | 원본 1536×1024 확인 후 `_makeGreenChromaCutout` 1회 캐시. 크기가 다르면 ready=false를 유지해 공용 폴백으로 진행 |
| 폴백 | 기존 공용 7×3/20프레임 오브, 최종 보라 원형 |
| 변경 범위 | 실버테일 악의구 비행 외형만. 피해·속도·거리·성장·폭발·중독·MP, 다른 캐릭터·좌클릭·KeyE는 기존 경로 유지 |
| 이전 에셋 | `silvertail_malice_orb_realistic.png`, `silvertail_malice_orb_moonblade_v2.png`는 보존 원화, 현재 로더에서 미사용 |

원본 시트는 생성 결과에 약간의 위치 편차가 있어 512×512 등분을 그대로 그리지 않는다. 아래 고정 소스 좌표로 핵의 중심을 맞추고 동일한 432×432 소스를 사용한다. 셀 경계를 일부 넘는 소스 사각형도 빈 녹색 여백만 포함하며 다른 프레임의 내용은 포함하지 않는다.

| 프레임 | 핵 중심 X | 핵 중심 Y | 소스 X | 소스 Y | 소스 W×H |
|---|---:|---:|---:|---:|---|
| 0 | 294 | 283 | 78 | 67 | 432×432 |
| 1 | 755 | 284 | 539 | 68 | 432×432 |
| 2 | 1221 | 282 | 1005 | 66 | 432×432 |
| 3 | 281 | 752 | 65 | 536 | 432×432 |
| 4 | 742 | 750 | 526 | 534 | 432×432 |
| 5 | 1213 | 752 | 997 | 536 | 432×432 |

## 검증

| 항목 | 결과 |
|---|---|
| 기존 공격 모션 테스트 | 5개 통과 |
| 시트 동작 테스트 | `test/silvertailMaliceOrbSheet.test.js` 3개 통과: 6프레임·역순 반복, 이동 중 프레임 안정성, 잘못된 크기 폴백 |
| 문법 | game.html 인라인 JS 6개 파싱 통과 |
| 커밋 가드 | `tools/guard.baseline.json`의 `lines`를 자동 검사 결과 59785로 동기화 (이전 59781, +4행) |
| 실제 렌더 검증 | 게임의 크로마 함수·투사체 렌더 분기를 별도 Canvas에서 실행. 6프레임 모두 핵 alpha>240, 소스 경계 2px 안쪽에서 alpha>32 픽셀 0, alpha≥64에서 녹색 초과분>18 픽셀 0 |
| 시각 확인 | 밝고 어두운 바탕에 6프레임 표시. 은빛 칼날·검은 핵 구분, 프레임 잘림 없음 |
| 미리보기 | `output/imagegen/silvertail_malice_orb_sheet_v3_preview.gif`, 실제 게임 렌더 분기 4초·100프레임·40ms 캡처. GIF의 끝→처음은 캡처 재시작이며 게임 애니메이션의 루프 경계와 별개 |
| 한계 | 연결 가능한 브라우저가 없어 실제 인게임 조작·전투 중 가시성 미검증 |

## 생성 프롬프트

내장 `image_gen` 사용. 첫 생성본의 여백·중심 편차를 줄이는 편집본을 채택했다. 원본 디자인과 팔레트를 유지했으며, 정밀 중심 정렬은 소스 사각형으로 마무리했다.

### 최초 6프레임 생성

```text
Use case: stylized-concept. Input image: reference for the EXACT shipped Silvertail Malice Orb projectile design, not an extra frame. Create its SIX FRAME seamless looping game VFX SPRITE SHEET. Output landscape 1536x1024, exactly THREE equal columns by TWO equal rows, each cell 512x512. Reading order left-to-right top row then bottom row. SIX sprites only. Imaginary cell centers at (256,256), (768,256), (1280,256), (256,768), (768,768), (1280,768). Every sprite is centered on its cell center at IDENTICAL overall scale with 48px empty margin inside each cell; no grid lines, captions, numbers, borders or separators. Preserve the reference's THREE silver-white curved crescent blades surrounding an OPAQUE BLACK circular void core with luminous violet rim and lavender-blue flowing energy. Frame 1 matches reference orientation; frames 2-6 turn the three-blade rotor CLOCKWISE in regular 20 degree steps: 0,20,40,60,80,100 degrees (threefold symmetry closes at120=0). Lavender energy filaments flow around the core and curl off the tips, changing smoothly frame-to-frame, slight energy brightness pulse with the black center always dark. The orb center, diameter, blade shape, count and palette stay consistent; no shape morphing, no movement across cells. Detailed semi-realistic dark fantasy game art with clean readable metal blades. Flat perfectly solid chroma key GREEN #00ff00 background over the entire sheet and through all open gaps. No transparency checkerboard, no white background, no floor, no shadows, no environment, no character. Keep every tendril inside its own cell. Ready for uniform grid slicing.
```

### 채택한 편집

```text
Edit this six-frame game sprite sheet for PERFECT GRID ALIGNMENT. Keep the exact same six silver three-blade orb designs and purple energy variations. Preserve landscape image 1536x1024 and a 3 columns x 2 rows grid of 512x512 cells. The BLACK CORE center in EACH cell MUST be at exact cell center: (256,256),(768,256),(1280,256),(256,768),(768,768),(1280,768). Reduce ALL six sprites together to the SAME UNIFORM scale: silver blades fit a 320px diameter, ALL energy wisps fit within a 380px diameter. This creates at least 66px pure GREEN padding inside every cell. No part may cross a cell boundary. Keep the outer blade silhouette and BLACK CORE diameter CONSISTENT across frames; only internal purple energy and tiny tip wisps change. Keep blade orientation the SAME in all six frames (the game rotates the sprite at runtime); animate energy flow and subtle glow strength only, last frame naturally looping into first. Dark core remains opaque black, silver blades stay white metallic. Solid pure green #00ff00 background throughout the sheet. No lines, labels, grids, text, checkerboard or shadows.
```
