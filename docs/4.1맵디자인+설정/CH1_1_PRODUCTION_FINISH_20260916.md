# EXODUSER CH1-1 PRODUCTION FINISH — 2026-09-16

상태: **제작 진행 중 / 완료 판정 전**. 기존 연구의 시범 구역·랜덤 생성기 제안 대신 사용자 최신 지시에 따라 실제 본편 1-1 전체를 고정 수작업 제작한다.

## 기준 상태

| 항목 | 변경 전 확인 |
|---|---|
| 실제 대상 | `STAGES[0]={id:0,hell:0,floor:1,mw:200,mh:200,type:'field',face:true}` |
| 표시 | 실제 게임 `제1구역 · 썩은 숲 1구역 / THE ROTTEN FOREST` |
| 연결 | `_MAP_COMPOSE[0].handProps` 직접 배열. `_CH1S1`은 `_MAP_COMPOSE[1]`, 즉 다른 스테이지 |
| authored/runtime | 62/63. 추가 1개는 시스템 gate. `hand:1,dense:1,lm:[],mega:[]` |
| 자동 중복 | hand 모드에서 큰 자동 장식·20×20 floor carpet 차단. stage0 baked에서 wall-edge/pillar 차단 |
| 시작점 | `(100.5,185.5)` |
| 북쪽 | gate y5, exits x99..101/y7, 북쪽 접근 x88..112/y2..35 |
| 배경 | smoothing master 8192², 64 chunks |
| 남쪽 철창 | 9월 12일 제거 상태. 이번 변경은 이동을 막는 철창 재설치를 전제로 하지 않음 |
| 변경 전 증거 | `captures/ch1_1_production_finish_20260916/before/` 6개 런타임 PNG, runtime.json, performance.json |
| 백업 | `tmp/ch1_1_production_finish_20260916/backup/game.html` 및 smoothing-composition.json |

변경 전 카메라 비교는 장면 좌표를 설정한 **정지 시각 관찰**이다. 입력 종주 검증으로 집계하지 않는다. 실제 입력 종주/전투 영상은 별도 기록한다.

## MASTER PLAN

200×200과 남→북 진행, 시체나무 `(102,90)`, camp `(45,100)`, altar `(147,97)`, cocoon `(47,50)`, pool `(167,43)`, pit `(162,139)`를 유지한다. 외곽을 1-1 전용 고정 polygon으로 재설계하며 각 구역은 사각형 방으로 분리하지 않는다.

| 구역 | 역할 | 지면/외곽 | 연결 |
|---|---|---|---|
| 남측 진입 | 숲으로 들어가는 문턱 | 닳은 흙, 양쪽 뿌리 mass | 북쪽으로 벌어짐 |
| 첫 공터 | 초기 다수 적 전투 | 건조한 흙, 서쪽 뿌리와 동쪽 습지 | 폭 변화 후 숲길 |
| 뿌리 어깨 숲길 | 이동/갈림 | 안쪽으로 뻗은 서쪽 숲, 낙엽·흙 | 야영지와 나무 공터 |
| 서쪽 야영지 | 선택 전투/사건 | 밟힌 흙과 낮은 뿌리 | 중앙·남쪽으로 연결 |
| 시체나무 분지 | 주 랜드마크/전투 | 뿌리·부식토, 양쪽 우회 | 북쪽 갈림 |
| 동쪽 단구 | 기존 선택 고지대 | 젖은 흙, 기존 서쪽 ramp | 기존 높이/충돌 유지 |
| 북쪽 갈림 | 후반 전투/조망 | 고치 숲과 부패한 물가 | 북쪽으로 수렴 |
| 출구 접근 | 마무리 | 드러난 흙과 비대칭 숲 경계 | 기존 gate/exit |

## 적용 중인 계약

- `assets/map/ch1/production_finish/layout.js`: 고정 경계/8구역/200×200 RLE. 무작위 seed나 범용 편집기 없음.
- `_buildCh1StartForestRLE`에서 고정 layout을 사용하고 기존 `genFromTemplate` 및 북쪽 gate override를 유지한다.
- 기본 smoothing phase의 배경 경로만 `assets/map/ch1/production_finish`로 연결한다. 기존 outer query는 과거 시각 비교용이며 새 geometry와 동일한 배경은 아니다.
- production master는 8192²/64청크/1024core/1px bleed. 전용 배경 x scale=1, 과거 outer는 `.965` 유지.
- Dimraeth의 분리 레이어/역할 구역/PLAY와 vista 분리를 참고했다. 원작 자동 생성 알고리즘을 사용하거나 추출 아트를 반입하지 않는다.
- 정적 재질/그림자/숲 접합은 빌드 시 합성한다. 프레임마다 지형/이미지 합성을 추가하지 않는다.

## 검증 진행

- 신규 경계의 필수 지점 도달·고립 바닥·맵 크기·stage0 연결 테스트: 구현 전 실패 확인 후 3/3 통과.
- 변경 전 동일 조건 성능 기록: `before/performance.json` (실측 표는 최종 검증 후 보충).
- 실제 적용 후 전 구간 이동/전투/출구 진행: **미실행**.
- 최종 카메라 QA 및 리터치: **진행 전**.

**VISUAL VERDICT: RETOUCH — 제작/실행 검증 진행 중.**
