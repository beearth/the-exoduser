# MAP11-30b — 보스룸 화면 배율·투영 2차

기준 `38d8b0bd89d3b4311815f8e83fa899b70e91ff19` / `origin/codex/map11-30-20261021`. 자기 branch `codex/map11-30b-20261021`, 격리 WT `~/exoduser-wt/MAP11-30b`. MAP11-30 문서의 수치는 1차 이력이며, 아래 표가 2차 변경값이다. 목표 1장→기존 큰 질량/바닥 연결→원래 전투 원 보존→같은 카메라 검수 순서. 새 이미지 생성·inpaint·부품 추가 없음.

## 현재 코드·오프라인 투영 계약

| 항목 | 2차 값·공식 / 위치 |
|---|---|
| source→world | `SOURCE_SCALE=(1920/2000)/.36=2.6666666667`; 화면 source 1px→.96px. 1차처럼 원화 타원을 원형 R1700에 늘리지 않음 |
| 화면 배율 | 카메라 zoom(.36,.36), 목표2000×1125→1920×1080. 바닥/나무/뿌리/BACK/전경 모두 균일2.6666666667 |
| 바닥 투영 | 오프라인 logical_y=render_y/.6, sample_y=562.5+logical_y×.6/SOURCE_SCALE. 역투영과 재투영을 짝지어 그림의 타원 비율을 보존. Camera2D/actor/전투 물리 자체를 .6으로 변경한 것은 아님 |
| 바닥 크기 | 4096²RGBA 유지 / world10922.6667². 반경4600→5400 smoothstep alpha. source 중심(1000,562.5), `SCREEN_CENTER=(0,120)`: 실제 canvas O=(960,497.1943), .36 기준 camera center local y118.9053에 맞춘 보정 |
| 클론 | source(650..1350,350..780) 좌표를 같은 픽셀 크기로 미러 반복. Gaussian20 마스크로 기존 floor polygon 밖만 클론. 전체 원화로 crop 확대하는 1차 처리 제거. sample은 cubic/BORDER_REFLECT_101. 1x에서 원화와 같은 샘플 배율, 추가 선명화/노이즈/디더0 |
| 바닥 맥 | 기존 chroma 기반4096²R8, additive최대.065/.16Hz 유지 |
| BACK | 기존2000×1125 원화, floor mask의 역마스크 / z=-446 / identity RGB. 구형 원형 cut mask·.70 tint 제거; floor 위, 독립 소품 아래에서 source 접합 유지 |
| 소품 | 기존7구간·동일polygon/crop/48px feather/65px bottom fade. source foot→같은 화면 좌표. scale2.6666666667; source_box를 구간별 material에 setup 1회 지정 |
| 충돌 | 숨긴 구형 Finale 외곽19원 대신 현재 구간7원의 unprojected source foot. 반경90; foot 길이<1840이면1840으로 올림. 각 원의 가장 안쪽>1700. 기존 provider/전투 경계 R1700·PC core 변경0 |
| 충돌 한계 | 그림은 .6 지면 투영에 맞춘 화면 표시이고 actor/물리는 기존 평면이다. 화면 표시 foot와 unprojected collision foot는 서로 다른 좌표다. 같은 화면에 맞춘 것만으로 실제 actor 접촉까지 일치했다고 주장하지 않음 |
| pod | vertex 전체 변형 제거. source 중심(215,298)/반경(65,85), (1268,78)/(55,70), (1820,502)/(70,80) ellipse 안만 fragment UV.y ±.006, .16Hz. 목질/뿌리/외곽선 고정. 보라 발광도 해당 마스크에 제한 |
| 입 | source 중심(310,215)/반경(70,95), (1785,363)/(110,85)만 UV.y .018 변위. sin(TIME×.55×2π)≥.72이면 열린 자세, 나머지 정지 자세. 기존 원화 재표본화 2자세이며 새로 그린 입속 프레임 아님 |
| 기타 | 기존안개(.12..26,1450..2100/2400..2850),6.25초 맥박, 전경시차.08 유지. `POD_SCALE=.012`은 1차 보관 uniform이며 vertex에서 사용하지 않음 |
| 리소스·API | setup preload만. 신규 tick 목록API/ResourceLoader/3D 로딩0. 실제 저장 폴더 접근0, 격리 `EXODUSER-MAP11-30b-Isolated`. project.godot 임시값은 복원 |

재현: `godot/tools/map11_30_split.py target.png`. 원본/변경 전은 외부 `before.tar.gz`; 동일 source SHA는 split.json에 보존. 목표는 1차 원본 PNG와 같음.

## 검수

외부 `~/exoduser-wt/_out/MAP11-30b/`에 캡처·로그·단회 검수·성능·SHA를 보존한다. 관련 검사는 `test_map11_30b.gd` 1회. 실제 Main/HUD/Player, 기존 보스 idle fixture이며 자연 gate/보스 AI/밀집 전투 검수가 아니다. 캡처는 원래 player(0,800)/camera local(0,120)/offset(0,-180)/zoom.36 입장 상태.

운영: 최초 fetch는 R에서 실행하여 read-only 지시를 엄격히 준수하지 못했다. tracked INDEX/WORK/HEAD/branch 변경0이나 refs/FETCH_HEAD 갱신 가능. 이후 R 쓰기0. INTEG-5 headless와 캡처가 잠깐 겹친 것을 확인하여 자기 캡처만 중단(성능 측정 전). PID81277·INTEG 프로세스 조작0. 이후 실행 직전 Godot 수≤1 조건으로 자기 Godot를 순차 실행한다.

검수 결과·누적 차이표·MAP PRODUCTION REPORT는 아래 최종 결과 절을 따른다.

## 최종 결과 / 차이표

| 대상 | 결과 | 남은 차이·경계 |
|---|---|---|
| 축척·투영 | source2000→화면1920,균일world2.6667 / logical Y .6 쌍변환 | 1x 바닥 결 크기와 source 위치가 대응. 원형에 맞춘 세로 늘림 제거. 전체 actor/물리 .6 투영은 범위 밖 |
| 구도 | 실제Main1920×1080 및 무확대800×700 crop(560,170) | 북쪽이 source에 없는 만큼 잘리던 문제 감소, 양옆 입 나무 source 대응. 경계 feather·안개/clone 일부 차이 남음 |
| 효과 | 전체 vertex 호흡0, pod3영역국소UV, 입2영역/2자세 | 새 입속 원화/독립 새 프레임 생성 없음. 정지 비교는 효과 전 주기 검수 대체 아님 |
| 충돌 | 새7원 모두 min radius>1700 / 이전19원 교체 | 기존 provider R1700 유지. 실제 actor 접촉과 표시 ground foot 일치는 미검수, 별도 전투 검수 필요 |
| 관련검사1회 | 34 checks,33PASS/1FAIL | 마지막 preview전용 노드 존재 가정이 제품 뷰에서 실패. 제품 코드 오류와 구분. 마지막 assertion을 recipe radius1700 확인으로 고쳤으나 사용자1회규칙에 따라 재실행0. 최종 테스트전체PASS 주장0 |
| 실제게임캡처 | 최종capture-final.log script/shader ERROR0 | 보스는 idle fixture. 자연gate/AI/HP/패턴/밀집전투 미검수 |
| 단회성능 | **p95=8.734ms / p99=9.768ms**,focus_lost0,valid=true | **8.33ms 예산 FAIL**, 재측정0. 1차7.747과 차이+.987ms이나 동일시점A/B가 아니므로 순수수정비용으로 단정0 |
| 성능범위 | Apple M5 Pro/Godot4.7.2 GL Compatibility,1920×1080,vsync off/max240 | 실제입력600틱/관측610틱,보행1633.759px,1667 render frames/평균163.982FPS,119draw/228objects. presentation arena/authoritative product_space field. 자연보스전·PC 성능 아님 |

외부 캡처: `~/exoduser-wt/_out/MAP11-30b/captures/game_entry.png`, `game_entry_1x.png`, `compare_target_vs_game.png`, `compare_1x.png`. 목표 비교 문서 하단에도 같은 차이표 행을 누적했다.

## MAP PRODUCTION REPORT

STAGE: CH1-1 보스룸 MAP11-30b.
MASTER: 기존 R1700 원형 combat void, 남START→중앙→북EXIT. side/travel geometry 보존.
OUTER MASS: LEFT/RIGHT 입 나무,TOP 고목·알주머니,SOUTH 기존전경. source 화면 좌표로 기존질량 재배치; 큰 검정hole 없음.
LARGE: 원본2000×1125 한장/기존7구간+BACK/전경. 동일scale2.6667, BACK 역floor mask로 연속. 일부 feather 반복/중복 잔여.
MEDIUM: 기존7root/7AO 재사용. 새 소품0; 접합부는 같은 화면 위치로 이동.
GROUND: 기존4096²를 같은 source 크기 미러clone으로 재표본화, world10922.667²,맥R8재계산. 원화주름선명도/화면비율 회복. 바깥arena 전체 이동 seam은 미검수.
PLAYABLE: R1700과 route/전투코어 유지,7외곽원최내측>1700. travel/breathing/threat 공간 기존. 실제보행 검수, actor접촉/밀집전투가독성 미검수.
LANDMARK: 기존boss idle fixture primary/양옆mouth secondary/기존teeth tertiary. 새landmark0.
CAMERA QA: START/ARENA 입장1920×1080+1x나란히검수. SIDE L/R/LATE/EXIT/EARLY 이동camera별 별도검수 미실시. LANDMARK는 같은입장화면에서 확인.
TECH QA: 위33/34검사·1하니스가정실패, 최종게임로딩/script/shader오류0. route/provider유지,collision외곽7원PASS/접촉미검수. native pageerror/404 N/A. seam/clone은시각잔여. p95단회8.734/focus_lost0/예산FAIL.
FILES: stage-owned target30 floor/backmass/veins/split, product_arena_view/look/shader,split tool,capture/test,관련docs. concurrent/unrelated tracked변경0. project byte복원,번역목록CRLF변경0.
GIT: 자기경로만stage/정상hook/자기branch비강제push. 원격SHA검증·WT제거결과는외부DONE.txt. main/PC/Steam배포0.
VISUAL VERDICT: **RETOUCH**.
NEXT PASS: 실제 actor/충돌접촉과 .6 표시의 계약 통합,경계feather/안개/바깥clone이음,성능예산초과 원인분리. 새부품 추가로 덮지 않음.


## MAP11-30p 성능 후속 (2026-10-21)

위 수치·리소스 설명은 해당 제작차수 이력이다. 장면/충돌을 유지한 정적합성·바닥패스통합·안개zero-alpha영역제거·미사용15texture preload 제거의 현행 후보는 [MAP11-30p](MAP11_30P_PERFORMANCE_20261021.md)를 따른다. 시각유지 PASS, 유효p95 **8.558ms**/focus_lost0/104draw로 **8.33ms 성능예산 FAIL**. 원본 floor/veins와 소품 source는 보존한다.


## MAP11-30c 후속 후보

> 2026-10-21 MAP11-30c 현행 후보: [축척·캐릭터 접지·정적 바닥 디테일/검수](MAP11_30C_SCALE_INTEGRATION_20261021.md). 웹 정면 근접48:473.105:1080 대응, 카메라 .563700169(입장)/최대.8, R1700·PC core 보존. 유효 성능1회p95 **7.738ms**/focus_lost0; 일부 후검토 보정은 해당 보고서의 측정 경계 참조. **VISUAL RETOUCH**, 실제Main live0/2초 캡처 포함. 아래 차수는 제작 이력.
