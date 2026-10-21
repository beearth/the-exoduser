# MAP11-30p — 장면 유지 성능 예산 복구 검수

기준 `efabcae5511ae0041dbda34f46cb9a176f413ed2`, 비교1차 `38d8b0bd89d3b4311815f8e83fa899b70e91ff19`.
자기 branch `codex/map11-30p-20261021`. 기존 장면/소품 위치·축척/actor·R1700 계약 보존.

## 구현 계약

| 층 | 변경과 정확한 계약 |
|---|---|
| 원본/클론 바닥 | 기존4096²·world10922.6667²·SOURCE_SCALE2.6666666667 유지. 미러클론은 원래부터 floor.png에 bake되어 있음; 새 이미지 생성0 |
| 정적 접지/뿌리/BACK | 기존7 shadow→7 root→BACK 순서로 2000×1125 RGBA `static_underlay.png` 1장에 오프라인 합성. 원본PNG 보존, Pillow `map11_30p_bake.py` 재현. 셀 좌표=split.json source box |
| 바닥 패스 | 전용 `target30_ground.gdshader`: 기존 R8 맥박 .065/.16Hz/색 유지. 정적합성층을 UV=(floorUV−.5)×(4096/2000,4096/1125)+.5로 같은 source 위치에 source-over 합성. 일반 straight-alpha 출력 유지. premultiplied-alpha 후보는 예산 개선 실패로 미채택. 범위 밖 alpha0; 기존 BACK 식별노드는 숨김. 별도 재표본화/해상도 축소0. 최종 후보는 직접 floor bake를 채택하지 않음(외부 tar로 보존) |
| 조직 소품 | source ellipses/입2자세의 수치 유지. crop에 걸치는 pod/mouth만 uniform 지정, 정적3crop은 조직 연산 건너뜀. 서측 pod의 south_west feather overlap도 유지. 기존 COLOR 출력·depth·가림·rect culling 계약 유지 |
| 안개 | 색/alpha .12..26/1450..2100/2400..2850/시간흐름 유지. 기존128각형 외곽2820 그대로, alpha0인 내측1450의 내접128각형만 렌더영역에서 제외. 128 ring quad/256vertex, 같은 UV. 내접 다각형 내부는 수학적으로 항상 alpha0 |
| 전경 | 기존texture/scale/parallax.08 유지. 시각손실을 피하려고 반해상도화 미적용 |
| preload | 미사용 BACKMASS와 7crop의 root/shadow 총15텍스처 preload 제거. 렌더는 기존7개 prop texture와 static underlay만 사용; 원본파일 삭제0 |
| 틱 | 신규 목록API/ResourceLoader/매틱 할당/3D 로딩0. 신규 mask/geometry/material은 setup만 |

## 동일 조건 A/B와 층별 OFF 진단

Apple M5 Pro/Godot4.7.2 GL Compatibility/1920×1080/vsync off/max240, PID81277 보존.
실제 Player 입력600틱, nominal arena이나 authoritative product_space=field; 자연보스전/PC전투 성능 아님.
A/B 유효 각1회. 첫 A 포커스 이탈은 무효로 보존. 유효 A 뒤의 중복 실행 착오는 측정 전 자기 프로세스만 중단.
이번 A/B에서 2차 비용 증가 재현 안 됨(A9.534→B9.071,−.463ms). 과거7.747→8.734 차이를 순수 수정비용으로 단정하지 않음.
여섯층 각각OFF 진단1회. 바닥OFF만 명확히 낮았고 나머지는 변동보다 작은 효과/역방향으로 비용의 정확한 인과 추정 불가.

| 표본 | p95 ms | focus_lost | draw | valid |
|---|---|---|---|---|
| A | 9.534 | 0 | 116 | True |
| B | 9.071 | 0 | 119 | True |
| no-floor | 8.367 | 0 | 118 | True |
| no-props | 9.624 | 0 | 112 | True |
| no-pod | 9.603 | 0 | 119 | True |
| no-mouth | 9.644 | 0 | 119 | True |
| no-fog | 9.729 | 0 | 118 | True |
| no-foreground | 9.546 | 0 | 119 | True |
| optimized1-budget-fail | 9.110 | 0 | 105 | True |
| optimized2-budget-fail | 8.571 | 0 | 104 | True |
| optimized3-budget-fail | 8.974 | 0 | 104 | True |
| optimized4-budget-fail | 8.558 | 0 | 104 | True |
| optimized5-budget-fail | 9.903 | 0 | 104 | True |
| final | 8.558 | 0 | 104 | True |

## 시각 검수

`~/exoduser-wt/_out/MAP11-30p/captures/compare_target_vs_game.png`: 목표|before efabcae5|after 3열, 각1920×1080.
`compare_1x.png`: 무확대800×700 crop(560,170), 같은3열.
캡처 전용 RNG seed30, canvas origin(960,497.1943)/zoom.36, 맵 셰이더 TIME5초 고정. actor/main은 캡처에서만 정지한 기존idle fixture.
카메라 보간3px 차이로 생긴 최초 비교는 불채택. 실제 성능/제품에는 고정 행렬·시간·seed를 적용하지 않고 원본 capture harness 복원.
전체·1x 눈검수에서 장면 변화 없음. 원본 목표와의 기존 feather/clone/표시foot 대 collisionfoot 차이는 이번 성능작업의 시각회귀와 구분.
정량 차이는 외부 pixel-diff.json. 관련 검사 `test_map11_30b.gd` 요청대로1회34/34 PASS(패스 통합 추가 전); 이후 재실행0. 추가 통합은 실제Main 캡처·shader 로딩과 픽셀 비교로 검증.

## 운영 경계

실제 저장 폴더 `EXODUSER-Godot-Native-First` 접근0. 기존 격리 `EXODUSER-MAP11-30b-Isolated`만 사용. project.godot 최종byte복원.
시작 시 실수로 R에서 fetch, 상대 worktree 경로가 R하위에 생긴 뒤 지정경로로 즉시 move: R tracked/INDEX/HEAD/branch 변경0이나 refs/FETCH_HEAD/WT 관리 메타데이터 쓰기 있었음. read-only 지시 완전준수 주장0.
import 중 타팀 실행이 시작되어 일시3개 관측, 자기import 종료 후 다음 실행 대기. 이후 각 실행직전 PID81277만 조건; 후반에는 0.5초 process inventory 감시로 타팀 진입시 자기실행 중단/무효 처리. 초기 감시가 Python 래퍼 인수까지 오인해 캡처2건 중단: 실제 실행파일 정규식으로 수정 후 유효 캡처/성능만 채택. 타팀/81277 종료0.
PCIA-WIRE도 별도Godot 실행 중임을 후반 확인; 이를 INTEG로 오인한 중간보고 정정. 타팀 프로세스 조작0.
정상hook/경로지정stage/비강제 자기branch push만. main/Steam배포0. SHA/원격대조·cleanup은 외부DONE.txt.

## MAP PRODUCTION REPORT

STAGE: CH1-1 MAP11-30p 성능 복구.
MASTER: 남START→넓은R1700 combat void→북EXIT/기존region·side·route 보존.
OUTER MASS: LEFT/RIGHT mouth,TOP 고목·pod,SOUTH전경/큰hole·silhouette 변경0.
LARGE: 기존원화·7crop/새생성0,정적15층offline합성.
MEDIUM: root/contact 위치·alpha보존/새소품0.
GROUND: 기존floor/clone·맥박보존,같은UV패스통합.
PLAYABLE: provider·geometry·충돌·PC전투코어변경0. 기존보행600입력틱 검수,밀집전투/실제접촉미검수.
LANDMARK: 기존boss idle fixture/양옆입나무/teeth 유지.
CAMERA QA: START/ARENA 같은입장구도1920×1080+1x 비교,LANDMARK같은화면 확인. EARLY/SIDE L/R/LATE/EXIT 신규이동검수미실시(그림·위치변경0).
TECH QA: 단회34/34,실제Main캡처/셰이더로딩·성능·픽셀비교. native pageerror/404 N/A. 별도맵seam/자연gate/보스AI 검수아님.
FILES: product_arena_view/target30_look/target30_surface/ground/static_underlay/bake tool/관련docs;타팀·PCcore변경0.
GIT: 외부DONE.txt의SHA·원격읽기대조·worktree제거결과 참조.
VISUAL VERDICT: 외부DONE.txt와하단최종행참조(전체맵기존잔여RETOUCH와이번시각유지판정분리).
NEXT PASS: 성능예산결과및기존feather/clone/표시충돌접촉잔여를구분해인수.

## 최종 채택 결과

| 항목 | 결과 |
|---|---|
| 성능 예산 | **FAIL: p95 8.558ms > 8.33ms**, 초과 0.228ms. B9.071 대비 −.513ms이나 단회 변동이 있어 순수개선량 단정0 |
| 최종 코드/표본 | 4차(패스통합+미사용15텍스처 preload제거) 코드. 해당 코드 유효성능1회만 채택, final.json=optimized4-budget-fail.json 동일byte. 5차 premultiplied는9.903으로미채택,3차직접floor bake는8.974로미채택 |
| 관측 | p99 10.721ms/focus_lost0/입력600틱·관측611틱/보행1629.153px/104draw·213objects |
| 시각 유지 | **PASS**, 평균RGB차0.008996/255,95%채널차0. 전체·원본800×700각1x눈검수. 새불일치지각없음. 전체맵은기존clone/feather잔여때문에RETOUCH유지 |
| 검수 제약 | 관련검사34/34는초기정적합성버전에서1회. 이후패스통합/15preload정리는실제Main캡처·shader/script ERROR0·픽셀비교로확인;동일테스트재실행0. pod/mouth OFF가GPU ALU를얼마나제거했는지컴파일러검증없음 |

**VISUAL VERDICT: RETOUCH (기존잔여 유지), 이번화면보존 PASS / 성능예산 FAIL. 요청된 예산복구 완료가 아니다.**
