# 맵 오브젝트 생성 — Seedream 5.0 Pro 파이프라인 (2026-09-30 사용자 승인)

> **2026-11-03 대체:** 2단계의 09-30 "MagicLight 우선, 소진 시 Higgsfield 전환" 문구를 현행 규칙(도구와 예산은 API연결_가이드, 유료 생성은 승인 후, SPEND_LOG 기록)으로 바꿨다. 나머지 절차·프롬프트 골격·검수는 그대로다.

사용자 판정: "이미지 나쁘지 않네, 맵 제작에 저거 써도 되겠다." 시험 결과물: `output/mapobj_seedream_test_20260930/` (CH1 썩은 숲 단독 나무, 원본 + 투명 컷아웃).

## 절차

| 단계 | 내용 |
|---|---|
| 1. 스타일 레퍼런스 | 같은 챕터의 기존 확정 오브젝트(예: `assets/map/ch1/production_finish/outer90_sources/rotforest_mass_01.png`)를 회색(128) 배경에 합성해 1024×576으로 첨부 (Image 1) |
| 2. 도구·모델 | 도구와 예산은 [MCP·API 공통 목록](../API연결_가이드.md)을 따르고, Seedream 5.0 Pro를 제공하는 가용 도구로 16:9 생성한다(예: 연결된 Higgsfield `seedream_v5_pro` — `image_references` 스타일 레퍼런스, `remove_bg`·`is_inpaint` 옵션). 유료 생성은 사용자 승인 범위 안에서만 하고, 예약과 실제 차감을 `I:/EXODUSER-Storage/codex-takeover/SPEND_LOG.md`에 적는다. 잔액이 부족해도 다른 유료 서비스로 자동 전환하지 않는다. MagicLight는 2026-10-24 VIP 만료로 쓰지 않는다([IMAGE_PROVIDER_PRIORITY](../10ai에셋프롬프트모음/IMAGE_PROVIDER_PRIORITY_20260925.md)) |
| 3. 프롬프트 골격 | `2D ARPG map object: one single <대상> in the exact art style and colors of image 1 (<특징>). Isolated, whole object fully visible and centered, slight top-down 3/4 view, on a perfectly flat plain mid-gray background, no ground, no shadow, no other objects. Painterly, clean render, no speckles, no dots, no text.` (500자 이하) |
| 4. 배경 제거 | 네 모서리 평균색을 배경으로 보고 색거리 기반 알파(거리-18)×12 → bbox 크롭 → RGBA PNG |
| 5. 검수 | 어두운 바닥색 위에 합성해 가장자리 회색 테두리 확인. 점 금지(CLAUDE.md 4.2-7): 3x 크롭에서 점 0개 |
| 6. 배치 | 맵 담당 작업에서 placements/아틀라스에 반영 (생성 세션이 임의 배치하지 않음) |

## 모델 선택 기준

| 모델 | 용도 |
|---|---|
| Seedream 5.0 Pro (100) | 맵 오브젝트·배경·인물이 작은 풍경. 고해상도·저렴. 소품 세부 일관성은 약함 |
| GPT Image 2.5 sunburst (200) | 디자인 고정 캐릭터(네메시아·전사·킬루·디로이·핵터)·스토리 소품 |

## 주의

- 같은 세트는 같은 스타일 레퍼런스·같은 프롬프트 골격으로 뽑아 톤을 맞춘다.
- 회색 배경 키잉은 오브젝트에 회색 영역이 크면 구멍이 날 수 있다 → 그 경우 배경색을 오브젝트에 없는 색(예: 순녹색)으로 지정.
