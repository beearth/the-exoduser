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

## PC 추가 지시 — 정적 bake만 / 실시간 2시점 검수

베이크 입력을 shadow 7 + root 7 + 정지 BACK 1 = **15개 허용목록**으로 고정했다. `map11_30p_bake.py`는 목록 밖 입력을 거부하고 `static_underlay_manifest.json`에 입력 SHA256과 제외목록을 기록한다. 재생성한 PNG는 `7504d2c9`와 동일 byte다. 제품 런타임 스크립트·셰이더·기존 텍스처 변경 0, 성능 재측정 0. 기존 p95 8.558ms 예산 FAIL은 유지한다.

| 층 | bake 경계 / 살아 있는 런타임 경로 |
|---|---|
| 바닥판·클론 | 기존 floor.png 정적 바탕 유지. 펄스는 별도 마스크로 실시간 합성 |
| 접지·뿌리·정지 BACK | 허용된 15개 입력만 static_underlay.png에 합성. BACK의 정지 참조 원화와 동작용 별도 소품층을 구분 |
| 국소 알주머니 | 동작용 소품 7개 PNG 제외. target30_surface의 TIME × .16Hz, UV .006, glow .055 유지 |
| 핏줄 펄스 | veins.png 제외. target30_ground가 TIME × .16Hz / 강도 .065로 합성 |
| 둘레 안개 | fog.png 제외. target30_atmosphere의 UV += TIME × (.004, −.002) 유지 |
| 입 2자세 | 동작용 소품 7개 PNG 제외. step(.72, sin(TIME × .55 × 2π)) / UV .018 유지 |
| 시차 전경 | foreground.png 제외. 기존 카메라 변위 × .08 유지 |

제외목록은 **소품 7개 + veins.png + fog.png + foreground.png = 10파일**이다. 시간에 따른 UV·발광·입 자세·안개 흐름·전경 변위를 굽지 않는다.

### 실제 시간 검수

`capture_map11_30p_motion.gd`로 실제 Main / 기존 boss idle fixture를 촬영했다. 1920×1080, zoom .36, canvas O=(960,497.1943). 관측 0초 → **실제 +2.004490초**, Engine.time_scale=1, paused=false, **shader TIME override 없음**. 배우·HUD·구도만 고정하고, 기존 조명·가림 코드가 참조하는 카메라는 활성 유지한다.

| 검사 | 결과 |
|---|---|
| 국소 맥박·입 실제 material, 512² probe | 0/2초 RGBA 변경 8526픽셀, 최대 차이 104 |
| 핏줄 실제 material, 512² probe | 변경 48521픽셀, 최대 차이 3 |
| 안개 실제 material, 512² probe | 변경 7843픽셀, 최대 RGBA 차이 1. 주로 alpha의 미세한 기존 흐름이며 속도 강화 없음 |
| 입 전용 50² ROI | .16초 간격 13표본에서 **정확히 2자세**, 변경 2498/2500픽셀, 최대 차이 164. ROI는 pod ellipse 밖이므로 입 UV 변화를 분리 검증 |
| 시차·시계 assert | 2 checks / 0 fail. 카메라 +100 world px → 전경 local x −8 (화면 −2.88px) |
| 최종 엔진 로그 | script/shader ERROR 0 |

추가 캡처 한 장: `~/exoduser-wt/_out/MAP11-30p/captures/compare_motion_0s_2s.png`. 위쪽은 실제 Main 0/2초 원본 2열, 아래쪽은 실제 material의 독립 512² probe 0/2초와 **차이 ×64 진단도**다. 원본 PNG·receipt·motion_metrics는 외부 `motion/`에 보존했다. 고정 카메라에서는 전경이 같은 위치인 것이 정상이며, 별도 카메라 이동으로 시차를 검증했다.

하니스 이력: 첫 실행은 촬영용 Camera 비활성화로 기존 조명·가림 참조 오류와 시차 검사가 실패하여 불채택. 다음 촬영은 오류 0이지만 canvas y561.6으로 기존 구도와 달라 최종 이미지에서 제외. 최종은 frame_pre_draw에서 기존 구도만 고정하고 모든 dynamic shader TIME은 계속 진행한다. 불채택 실행도 외부 보존했으며 제품 오류 수정으로 보고하지 않는다.

### MAP PRODUCTION REPORT — motion 추가 검수

STAGE: MAP11-30p 정적 bake 경계·시간 변화 검수.
MASTER / OUTER MASS / LARGE / MEDIUM / GROUND: 기존 장면·source·geometry·R1700 보존, 정적 bake 동일 byte.
PLAYABLE: 기존 배우 정지 fixture, 새 전투 검수 아님.
LANDMARK: 기존 boss / mouth / pod 유지.
CAMERA QA: 기존 입장 ARENA 0/2초 및 material 분리 probe. 다른 이동 camera 검수 없음.
TECH QA: clock/parallax 2 PASS, 세 material 시간 변화 검출, 입 정확히 2자세, ERROR 0, 새 성능 측정 없음.
FILES: bake tool 허용목록·manifest·추가 capture harness·관련 docs. 제품 런타임 변경 0.
GIT: 자기 branch 정상 hook·비강제 push·원격 SHA·WT 제거는 외부 DONE.
VISUAL VERDICT: **동작 보존 PASS**, 전체 맵 기존 잔여 RETOUCH / 성능 예산 FAIL 유지.
NEXT PASS: 8.33ms 예산 복구는 별도 미완료.
