# 맵 오브젝트 생성 — Seedream 5.0 Pro 파이프라인 (2026-09-30 사용자 승인)

사용자 판정: "이미지 나쁘지 않네, 맵 제작에 저거 써도 되겠다." 시험 결과물: `output/mapobj_seedream_test_20260930/` (CH1 썩은 숲 단독 나무, 원본 + 투명 컷아웃).

## 절차

| 단계 | 내용 |
|---|---|
| 1. 스타일 레퍼런스 | 같은 챕터의 기존 확정 오브젝트(예: `assets/map/ch1/production_finish/outer90_sources/rotforest_mass_01.png`)를 회색(128) 배경에 합성해 1024×576으로 첨부 (Image 1) |
| 2. 도구·모델 | **1순위 MagicLight Toolbox Image → Seedream 5.0 Pro**, 16:9, 1장 100포인트, 결과 2560×1440 (2026-09-30 최신 사용자 지시 — CLAUDE.md 퀄리티 9항, [IMAGE_PROVIDER_PRIORITY](../10ai에셋프롬프트모음/IMAGE_PROVIDER_PRIORITY_20260925.md)). MagicLight 포인트 소진·부족 확인 시 연결된 Higgsfield `seedream_v5_pro`(2K, 2.5크레딧/장, `image_references` 스타일 레퍼런스, `remove_bg`·`is_inpaint` 옵션)로 전환 |
| 3. 프롬프트 골격 | `2D ARPG map object: one single <대상> in the exact art style and colors of image 1 (<특징>). Isolated, whole object fully visible and centered, slight top-down 3/4 view, on a perfectly flat plain mid-gray background, no ground, no shadow, no other objects. Painterly, clean render, no speckles, no dots, no text.` (500자 이하) |
| 4. 배경 제거 | 네 모서리 평균색을 배경으로 보고 색거리 기반 알파(거리-18)×12 → bbox 크롭 → RGBA PNG |
| 5. 검수 | 어두운 바닥색 위에 합성해 가장자리 회색 테두리·잔점 확인(1x 확대). 점 금지 규칙(CLAUDE.md 작업물 퀄리티 8항) 적용 |
| 6. 배치 | 맵 담당 작업에서 placements/아틀라스에 반영 (생성 세션이 임의 배치하지 않음) |

## 모델 선택 기준

| 모델 | 용도 |
|---|---|
| Seedream 5.0 Pro (100) | 맵 오브젝트·배경·인물이 작은 풍경. 고해상도·저렴. 소품 세부 일관성은 약함 |
| GPT Image 2.5 sunburst (200) | 디자인 고정 캐릭터(네메시아·전사·킬루·디로이·핵터)·스토리 소품 |

## 주의

- 같은 세트는 같은 스타일 레퍼런스·같은 프롬프트 골격으로 뽑아 톤을 맞춘다.
- 회색 배경 키잉은 오브젝트에 회색 영역이 크면 구멍이 날 수 있다 → 그 경우 배경색을 오브젝트에 없는 색(예: 순녹색)으로 지정.
