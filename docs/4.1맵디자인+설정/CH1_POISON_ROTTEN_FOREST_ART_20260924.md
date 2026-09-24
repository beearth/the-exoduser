# CH1-1 독속성 썩은 숲 원화 — 2026-09-24

사용자 확정: 독속성 썩은 숲을 구덩이·썩은 나무·생체나무 특유의 분위기로 표현한다. 기존 모델의 거대 뿌리 구도는 참조하되, 불탄 숲의 재질과 주황 균열은 교체한다. 이전의 모든 색·재질 보존 지시보다 이 최신 바이옴 변경이 우선한다.

| 요소 | 제작 방향 |
|---|---|
| 전체 구도 | 기준 `assets/map/ch1/rottenwood_field_rootworld_master_v2.png`의 비대칭 거대 뿌리, 서측 공터, 동측 습지, 중앙 랜드마크 관계 유지 |
| 구덩이 | 불규칙한 지반 붕괴, 노출된 진흙층과 뿌리, 탁한 누런 올리브 독액·침전물, 국소적인 낮은 독무. 동일 원형 웅덩이 반복 금지 |
| 썩은 나무 | 속 빈 거대 줄기, 벗겨진 젖은 껍질, 부서지는 섬유질 목질, 접합부 이끼·절제된 균류. 외곽은 연속된 숲 질량 |
| 중앙 생체나무 | 나무 형태 유지, 갈라진 껍질 안쪽 힘줄·혈관형 능선·독낭·병든 목질. 뿌리가 주변 동선과 접지 형성. 눈·큰 입·만화 얼굴 추가 없음 |
| 바닥 | 젖은 흙, 눌린 썩은 낙엽, 부패 목질과 고인 물. 전투공간은 낮고 읽히는 재질 |
| 색·광원 | 흑갈색·회녹색·올리브 중심, 독낭/구덩이에만 제한된 황록 발광. 화염·용암·주황 균열·맵 전체 네온 테두리 제거 |
| 생성 입력 | 기준 원화 실제 이미지 1장 + `output/imagegen/rootworld_master_20260924/poison_rotten_forest_prompt_v1.txt` |
| 호출 | 공식 GPT Image API edit, gpt-image-2, 2048×2048, high, 원본 별도 보존 |
| 실제 결과 | HTTP429, `insufficient_quota` / `credit_balance_exhausted`. 신규 이미지 생성 실패 |
| 예정 출력 | `assets/map/ch1/rottenwood_poison_master_v1.png` — 호출 실패로 이번 생성 파일 없음 |
| 적용 상태 | 컨셉 제작 대기. 게임/geometry/충돌/기존 에셋 변경 없음. 시각 평가할 새 결과 없음 |

## MAP PRODUCTION REPORT

STAGE: CH1-1 원화 컨셉. MASTER/OUTER MASS/LARGE/MEDIUM/GROUND/PLAYABLE/LANDMARK: 위 새 바이옴 설계만 기록, 런타임 제작 없음. CAMERA QA: 미실시(새 원화 없음). TECH QA: API 실패 확인; 게임 검증 해당 없음. FILES: 본 문서·관련 목표/인계 문서·프롬프트. GIT: 이번 문서만 커밋 대상, push/deploy 없음.

**VISUAL VERDICT: RETOUCH — 기존 맵 기준 유지; 새 원화는 미생성으로 판정 불가.**

NEXT PASS: API 잔액 확보 후 저장된 편집 요청 실행 → 실제 원화에서 구도/독성 바이옴 확인 → 그 후 런타임 적용. 다른 모델·세션 대체 도구로 전환하지 않는다.
