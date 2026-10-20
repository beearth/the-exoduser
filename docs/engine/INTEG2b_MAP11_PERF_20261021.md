# INTEG-2b MAP11 벤치 전환 진단

기준 f391efce5d2f3366f0de0e4079ca01bafd36d9c0, codex/demo11-integ2-20261021. 제품 회귀를 입증하지 못했으며 arena 전환 해결·성능 PASS는 미완료다.

원인: 이전 벤치는 Main 직접 부팅 후 G.on을 쓰고 Gate 위치로 이동하면 transport가 된다고 가정했다. 통합된 47j/47k는 native_demo_encounter를 gate owner로 위임하고 실제 OPT.diff, 지역80%/필드보스 완료를 요구한다.
현재 PC fieldboss HP/final owner 미인수로 정당한 gate 완료가 불가능하다(47k 보고서 참조). 기존 benchmark 전용 격리 arena 진입 경로 없음. 실제 실행 receipt는 NOT_READY / gate_or_provider이며 제품 gate를 완화하지 않았다.

| 항목 | 변경·실측 |
|---|---|
| 하네스 | current_scene 지정, 실제 guide 완료→lesson 활성 대기(최대10000ms)→기존 skip_all 사용; G.on 직접쓰기 제거 |
| 전환 | 실제 request_native_map11_transition("enter") 사용, receipt 즉시 출력. arena readback 실패 시 기존 exit4 유지·field samples 포함 JSON 출력·해제 |
| 행 출력 | field/arena 각각 완료 즉시 MAP11_PROD_BENCH_ROW JSON. 최종 MAP11_PROD_BENCH 계약 유지 |
| 표본 | 120Hz, 준비120틱/각 공간 warmup30틱/측정600틱; 매 physics_frame 사이 벽시계 usec 저장·정렬, nearest-rank p95=정렬[569]/1000 |
| field 1회 | actor_count5,600틱,wall5003307us,mean8.338845ms,p95_wall_ms15.391,8.333333ms 예산 미달 |
| arena | gate_or_provider, NOT_READY, 미측정. flags/HP/final 주입 및 gate 우회0 |
| 의미 | headless physics-frame 벽시계 간격(스케줄링·대기 포함). CPU callback 비용/GPU/실창/Windows FPS 수치 아님. 과거7.86/7.58은 mean으로 p95와 동일 지표 아님 |

원로그: ~/exoduser-wt/_out/INTEG-2b/. 벤치 정확히1회, import1회, 관련 suite 각1회. 매 실행 격리 userdir/override 종료0byte, 벤치 직전 pgrep 실제 Godot0. 제품/전투 core/player/docs2_3/맵 비주얼/번역 수정0. 성능 미달을 줄이기 위한 추가 벤치 또는 변경0.

MAP PRODUCTION REPORT: TECH QA 진단만. MASTER/OUTER MASS/MEDIUM/GROUND/PLAYABLE/LANDMARK 저작 변경0. CAMERA QA 미수행. loading import PASS, performance field p95 미달/arena 미측정. route/collision 관련 suite 결과는 DONE 참조. VISUAL VERDICT: RETOUCH (화면 미검수). NEXT PASS: PC fieldboss HP/final 연결 인수 후 실제 gate 완료→arena 1회 측정. 이번 범위에서 우회하여 해소할 수 없음.

## 관련 스위트 최종 결과

| 스위트 | 결과(각1회) |
|---|---|
| map11_field_runtime |49/0, exit0/ERROR0|
| map11_stage_provider |54/0, exit0/ERROR0|
| map11_product_intro |15/0, exit0/ERROR0|
| demo11_47k_mac |10/0, exit0/ERROR0, 실제 locked gate 거절 확인|
| demo11_anglers |33단정/1실패, exit1. 실행 하니스가 --node-bin/--source-game 인수를 누락해 원본 oracle 실행 실패·JSON ERROR. 제품 결함 판정 불가/검증 미완료. 1회 제한으로 재실행0|

외부 runner는 47k의 비JSON `checks=10 failures=0` 결과를 JSON으로 읽다가 예외 종료했으나, 47k 원로그·evidence JSON은 보존되었고 Godot 실행은 exit0이다. 자동 runner의 PASS 요약을 성공 증거로 대신하지 않았다.
