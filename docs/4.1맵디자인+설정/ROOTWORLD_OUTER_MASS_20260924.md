# Rootworld outer mass — 2026-09-24

> **최신 QA 적용:** [Rootworld blockout2](ROOTWORLD_BLOCKOUT_20260924.md). `20260924-blockout-2`는 stage0 QA 전용 34점 외곽/12점 중앙 질량과 서·동 양방향 동선을 사용한다. 템플릿 통행 13396칸, 나무 `(102.5,112.5)`, 북측 gate y5/exit y7, 시각 gate clearance x88~112/y2~35. 아래 이전 수치·미적용 설명은 당시 이력이며 본편 LOCK은 변경하지 않는다.

| 항목 | 상태 |
|---|---|
| STAGE | CH1-1 field rebuild QA |
| MASTER | `assets/map/ch1/rottenwood_field_rootworld_master_v2.png`, 4096×4096 concept |
| OUTER MASS | GATE 2 첫 적용; 좌/우/북/남 authored shoulder 21개 합성 |
| LARGE / MEDIUM / GROUND | 대형 원화 crop 4종; 중형 접합/반복 silhouette 리터치 필요 |
| PLAYABLE | 기존 `genFromTemplate` / 200×200 QA NAV 유지 |
| LANDMARK | 기존 시체나무 유지 |
| CAMERA QA | 1280×720, DPR 1의 8지점 실제 화면 촬영/검토 완료; 시각 RETOUCH |
| TECH QA | 자동검증 17개 PASS; 8화면 청크 draw 확인, pageerror/HTTP error/청크 오류0 |
| FILES | game.html 배경 선택/월드 배율 5줄; 전용 builder, QA script, tests, rootworld_outer assets, 관련 docs |
| GIT | 미커밋 |
| VISUAL VERDICT | RETOUCH |
| NEXT PASS | 카메라 검증 → 반복 silhouette/바닥 접합 리터치 → 전투·종주 검증 |

## 현행 런타임 계약

| id | 값 | 적용 위치 |
|---|---|---|
| 활성화 | `_DIABLO_FIELD_QA` / `mapqa=1&fieldrebuild=1&stage=0` | 기존 CH1 외곽 스트리머 |
| root/cache | `assets/map/ch1/rootworld_outer` / `20260924-rootworld-1` | `_CH1_START_ROOT` / chunk URL |
| master/world | 8192² RGBA / 8000² world px | 200×200 tiles, T=40 |
| chunks | 8×8=64, core1024 + copy bleed1, 파일1026² | visible+neighbor request, decode/GPU warm 재사용 |
| world 정렬 | core1024 → world1000, X hug1 | preload/draw 모두 동일 |
| NAV | `_buildDiabloField(0,200,200)` tileRLE | 생성 당시 hash는 composition.json |
| floor mask | 1tile dilate → scale4(800²) → blur5 → 8192² | alpha만 조정; NAV 변경 없음 |
| gate 여유 | x90~110, y0~15, 시각 마스크 전용 | engine 북측 출구 가림 방지 |
| 대형 합성 | crown/west/east/south crop4종, authored21배치, 최대 확대1.15 | crop·배치·스케일은 composition.json 전체 목록 |
| 원경 | 원화2배, brightness0.4, saturation0.65 | 저대비 BACK |
| shoulder | brightness0.92, saturation0.86, edge feather15% smoothstep | RGB blur 없음 |
| scatter | 0 | 고정 배치만 사용 |
| production | 기본 production_finish / 비교 baked_start_outer | 기존 URL 선택 유지 |

## MAP PRODUCTION REPORT

- STAGE: CH1-1 field QA, GATE 2 첫 패스.
- MASTER: 기존 남→북 6region, 서측 combat basin/동측 pocket; NAV와 진행 계약 유지.
- OUTER MASS: LEFT/RIGHT/TOP/SOUTH 고정 shoulder 연결. BACK은 한 장 원화로 깊은 틈을 채움. 큰 hole과 반복 노출은 camera QA로 판정 예정.
- LARGE: 원화 crop4종/21composites. 서로 겹치며 alpha15% 가장자리 연결. 반복 silhouette는 잔여 리터치 항목.
- MEDIUM: 추가 없음. 어두운 접합 및 반복 면은 다음 패스 대상.
- GROUND: 보행 mask를 dilate/blur한 alpha로 접합. 바닥 기존 균열/오염 유지. 별도 shadow/story detail 미추가.
- PLAYABLE: 기존 arenas/travel/breathing/threat space 보존. 자동검증은 주요 중심 alpha0 확인; 실제 전투 가독성 미확정.
- LANDMARK: 기존 primary 시체나무/횃불 유지. 신규 secondary/tertiary 없음.
- CAMERA QA: 8화면 촬영/검토 완료. START/EARLY/ARENA/LATE는 중앙 반복 바닥이 화면을 지배하며 외곽 존재감 부족. SIDE L/R은 새 외곽이 표시되지만 바닥 접합과 원화 crop 반복 리터치 필요. LANDMARK는 기존 대형 시체나무가 읽힘. EXIT는 기존 gate가 읽히지만 주변 연출 미완료. 모든 화면은 보행 타일0에서 촬영했다.
- TECH QA: 기존 geometry, 64청크 규격, 표본 가로/세로 bleed, 주요 중심 alpha0 검사 PASS. pageerror/HTTP error/청크 오류0. 화면별 draw4~10청크, 마지막 loaded50청크, 최대 draw 약0.2ms, GPU warm 약31.1ms(헤드리스 환경 측정). 실제 FPS/장거리 이동 hitch/메모리 budget/전체 종주/전투 가독성은 미검증이다. 카메라 순간이동은 종주 검증이 아니다.
- FILES: stage-owned 파일은 위 표 참조. 동시 작업 중 game.html과 docs 변경 존재; 다른 시스템 수정은 이 작업 범위 밖.
- GIT: stage-owned 코드/에셋/docs만 선택 커밋 대상. game.html 동시 작업 hunk는 제외. push/deploy 없음.
- VISUAL VERDICT: RETOUCH. 기술 PASS는 시각 승인 아님.
- NEXT PASS: camera 결과에 따라 접합/반복을 수정하고 실제 전투 및 종주를 검증.

증거: `captures/rootworld_outer_20260924/01_START.png`부터 `08_EXIT.png`, `runtime.json`(로컬 캡처). 초기 자동화는 첫 실행 프롤로그/네메시아/키 안내에서 대기했다. 실제 ESC 및 안내 건너뛰기 입력을 처리한 뒤 8카메라 검증이 완료됐다.
