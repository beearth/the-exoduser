# CH1 v2 HIGH-RES PRODUCTION QA — 2026-08-18

## LOCKED MASTER
`assets/map/ch1/master/CH1_MASTER_16x9_v2.jpg` 1280×720. 구도 SSOT. 재생성 안 함.

## PRODUCTION REGION PLAN
시계방향, overlap 18% (ox=115, oy=65 src px).

| ID | 영역 | src box | plate |
|----|------|---------|-------|
| Q1 | TOP LEFT | (0,0)–(755,425) | production/Q1_TL_hires.jpg 1280×720 |
| Q2 | TOP RIGHT | (525,0)–(1280,425) | production/Q2_TR_hires.jpg |
| Q3 | BOTTOM RIGHT | (525,295)–(1280,720) | production/Q3_BR_hires.jpg |
| Q4 | BOTTOM LEFT | (0,295)–(755,720) | production/Q4_BL_hires.jpg |

Imagine `image_edit`는 입력이 2265×1275여도 **항상 1280×720**으로 내린다. 4K native 불가. 단순 업스케일 안 함.

## OUTPUT RESOLUTION
`CH1_MASTER_16x9_v2_PROD.jpg` **2176×1224**. 16:9 정확 (1.7× v2). 3840×2160 미달.

## SEAM QA
세로/가로 중앙선 점프 1.11 / 1.61. 일반 이웃 1.91 / 3.16보다 낮음. hard cut 없음.

## VISUAL CONSISTENCY QA
v2 대비 mean abs 4.0. 길·늪·4출구 유지. Q2 평균 밝기 35.7 vs 나머지 ~30 (하늘+흙 약간 따뜻). 새 랜드마크 없음.

## FINAL VERDICT
**PASS** (구도·시임·16:9). 해상도는 생성기 상한으로 2176×1224.

## NEXT ACTION
인게임 적용은 사용자 지시 후. 4K가 필요하면 16타일 재분할 또는 외부 업스케일(이 파이프라인 밖).
