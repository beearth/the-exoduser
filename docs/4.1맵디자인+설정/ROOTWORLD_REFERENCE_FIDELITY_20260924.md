# CH1-1 모델 이미지 일치 목표 및 중단 지점 — 2026-09-24

> **2026-09-25 현행 기준:** [맵디테일.md](맵디테일.md)의 넓은 전투공간·피부 지면·꿈틀거리는 동맥·부패 생체나무가 우선한다. 아래 원본 동일 구현 및 자연숲 시안 설명은 이전 이력이다. 현재 이미지는 사용자의 최신 콘셉트 승인을 받지 않았다.

> **최신 공간 지시:** 넓은 전투공간 확보를 위해 원본/v1 중앙 뿌리의 좁은 길 구도 보존은 종료한다. [독성 숲 v2](CH1_POISON_ROTTEN_FOREST_ART_20260924.md)는 넓은 중앙 공터·외곽 생체나무·양측 독 구덩이로 재제작한 현행 시안이다. 런타임 미적용/RETOUCH.

> **최신 생성 완료:** 사용자 “힉스필드일단써” 승인으로 [독속성 썩은 숲 원화](CH1_POISON_ROTTEN_FOREST_ART_20260924.md)를 Higgsfield에서 생성했다. 실제2880²/RETOUCH/런타임 미적용. 아래 GPT API 한정·생성 중단은 그 이전 시도 기록이다.

> **후속 사용자 변경:** 구도는 기준으로 삼되 바이옴을 구덩이·썩은 나무·생체나무의 **독속성 썩은 숲**으로 바꾼다. 아래 모든 색·재질 보존 설명보다 [최신 원화 계약](CH1_POISON_ROTTEN_FOREST_ART_20260924.md)이 우선한다. 독성 원화 편집도 API 잔액 부족으로 출력 없이 종료됐다.

사용자 최신 확정: **모델 이미지와 똑같이 구현하는 것이 목표**다. 기준은 `assets/map/ch1/rottenwood_field_rootworld_master_v2.png`다. 전체 실루엣, 거대한 중앙 뿌리의 분기와 비중, 서측 공터, 동측 습지, 관문, 색·재질·명암을 비교한다. 분위기만 비슷한 별도 그림이나 기존 blockout2에 맞춘 원형 우회 구도는 목표 달성이 아니다.

## 오늘 중단 지점과 이번 재개 결과

| 항목 | 확인한 사실 |
|---|---|
| 오늘 작업 | 스마일게이트 제출용 CH1-1 Rootworld QA 맵. 9월 17일 production_finish 리터치와 구분 |
| 적용 지형 | blockout2, 200×200 / world8000², 중앙 비통행 질량·서동 우회. 본편 LOCK 변경 없음 |
| 중단 산출물 | `rootworld_environment_candidate_v1.png`와 `rootworld_candidate/`의 64청크, packer, `fieldart=candidate` 미리보기, QA 스크립트 |
| 생성 이력 | `output/imagegen/rootworld_master_20260924/prompt.md`에 따르면 기존 후보는 파일 참조 실패 후 **이미지 입력 없이 텍스트만으로 생성**됨. 기준 원화를 실제 입력한 편집 결과가 아님 |
| 원본 후보 / 패킹 | 1254² → 2048² resize, core256 / bleed1 / 파일258², 8×8청크 → world8000². 해상도 확대는 새 디테일 생성이 아님 |
| 재개 후 실행 | `python tools/qa_rootworld_blockout.py --candidate` 정상 종료. 1280×720 / DPR1 / 순간이동 8카메라 |
| 런타임 결과 | 중앙(102,112) wall1, 북쪽(100,7) exit2, 8카메라 요청점 floor0. 수집 pageerror0 / HTTP400이상0. 실제 입력 종주·정상 전투·전체 성능 검증은 아님 |
| 증거 | `captures/rootworld_candidate_20260924/runtime.json`, `01_START.png` ~ `08_EXIT.png`, `index.html` 비교 페이지 |
| 실제 시각 열람 | 기준 원화·후보 전체, ARENA·LANDMARK 카메라. 후보 전체의 단순한 중앙 섬과 원형 우회는 원화의 거대 뿌리 분기/비대칭 공간과 다름. 두 실제 카메라에서 흐린 확대 지면과 별도 나무 모델의 분리가 뚜렷함 |
| 후보 판정 | **FAIL — 모델 이미지 일치 및 플레이 화면의 원화 품질 기준 미달.** 기존 composition.json의 UNREVIEWED는 검수 이전 생성 메타데이터; 이 문서가 후속 판정 |
| 신규 편집 시도 | 프로젝트 .env의 기존 인증으로 공식 GPT Image API, gpt-image-2, high, 2816², 기준 원화 이미지 입력. API 응답429 / `credit_balance_exhausted`. 신규 출력 이미지 없음 |
| 프롬프트 | `output/imagegen/rootworld_master_20260924/reference_fidelity_prompt.txt`. 배치·실루엣을 보존하고 표면 세부만 복원하도록 작성. 실행 실패하였으므로 개선 결과로 계산하지 않음 |
| 이번 변경 범위 | 검수 증거·목표/중단 기록만. 게임 코드·geometry·기존 에셋 교체 없음 |

## 후속 제작 계약

1. 원화 자체를 이미지 입력으로 사용한다. 텍스트 설명만으로 만든 후보를 동일 구현으로 채택하지 않는다.
2. 전체 비교에서 원형 고리로 단순화하지 않았는지 먼저 확인한다. 외곽과 중앙 질량이 실제 카메라 안에서도 원화와 같은 비중으로 읽혀야 한다.
3. 원화 전체 파일의 픽셀 수와 실제 디테일을 구분한다. 통이미지를 늘리거나 청크로 잘랐다는 이유로 선명도가 확보됐다고 판단하지 않는다. 파일4096²로 기록된 기준 원화보다 작은 API 출력2816² 요청도 그 자체로 해상도 향상을 보장하지 않으며, 실패한 이번 요청은 재사용 전에 해상도 전략을 재검토한다.
4. 구도와 실제 이동 경계를 함께 맞춘다. 현재 blockout2는 원화 일치 확정안이 아니다. 시작6시/출구12시·상단 통로 계약과 원화의 남서 진입/우상 관문 관계를 정리한 뒤 해당 QA geometry와 문서를 함께 갱신한다.
5. 실제 입력 종주·전투와 8카메라 비교가 남아 있다. 이번 자동 캡처를 플레이 완료나 전체 시각 합격으로 쓰지 않는다.
6. 신규 생성은 GPT Image API만 사용한다. 현재 잔액 부족이 해소될 때까지 신규 생성 단계는 중단 상태다. 기존 원화·후보·다른 작업자의 변경은 보존한다.

## MAP PRODUCTION REPORT

| 항목 | 결과 |
|---|---|
| STAGE | CH1-1 Rootworld QA, 오늘 중단 작업 재개·후보 검수 |
| MASTER silhouette / regions / main route / side spaces | 기준 원화 대비 중앙섬·우회 단순화 확인. 원화와 동일 구현 목표 재확정. 이번 geometry 수정 없음 |
| OUTER LEFT / RIGHT / TOP / SOUTH / major holes | 후보 전체 이미지를 비교. 원화의 외곽·중앙 질량 관계와 다름; 새 합성 없음 |
| LARGE source / composites / overlap / repetition | 기준 원화와 기존 텍스트 생성 후보. 신규 생성 실패, 추가 합성 없음 |
| MEDIUM connections / holes | 현재 모델과 배경의 분리 잔여. 수정 없음 |
| GROUND shadow / contamination / integration | 후보의 흐린 확대 지면과 장소 차이 부족. 원화 일치 미달 |
| PLAYABLE arenas / travel / breathing / threat / readability | 기존 blockout2 유지. 지정점 floor 확인만; 실전 가독성 미검증 |
| LANDMARK primary / secondary / tertiary | 기존 나무/관문/횃불 유지. 기준 원화의 거대 분기 뿌리와 일치하지 않음 |
| CAMERA START / EARLY / ARENA / SIDE L / SIDE R / LANDMARK / LATE / EXIT | 8장 수집. 실제 열람은 ARENA·LANDMARK. 미열람 카메라에 개별 합격 판정 없음 |
| TECH route / collision / pageerror / 404 / seam / loading / performance | 지정점·중앙·출구 확인, 수집 예외0/HTTP오류0. 종주·전체충돌·seam·장시간성능 새 검증 없음 |
| FILES stage-owned / concurrent / unrelated | 이번 검수페이지·문서·편집 프롬프트. 기존 게임/UI/적/후보 WIP와 기타 변경은 직접 수정하지 않음 |
| GIT staged / commit / push / deploy | 이번 문서만 별도 커밋 대상. 게임·후보 WIP 포함하지 않음. push/deploy 없음 |
| VISUAL VERDICT | **FAIL (candidate-v1)**. 기존 QA 전체 작업은 RETOUCH, 제출 목표 ACTIVE |
| NEXT PASS | 기준 원화와 동일한 구도/이동 경계 재정렬 및 실제 카메라 디테일 확보. GPT API 신규 생성은 잔액 부족으로 중단 |
