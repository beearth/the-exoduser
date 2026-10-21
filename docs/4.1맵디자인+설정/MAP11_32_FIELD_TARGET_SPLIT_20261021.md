> 2026-10-21 MAP11-32b 후속 후보: [북접합·정적 bake·최종 단회 검수](MAP11_32B_FIELD_BAKE_20261021.md). 기존 바닥/reflected apron/전경/고목 shader 계약은 아래 MAP11-32 제작 이력이다. 현행 후보는 zoom.70 유지, 비대칭 무반사 북접합·지면22tile·전경trim. p95 **11.806ms**,124draw/225objects, **성능 FAIL / VISUAL RETOUCH**. 해소 완료 아님.

# MAP11-32 — 시작 필드 목표 장면 분해

기준 `origin/codex/map11-30c-20261021`, `0f0a2888`. 별도 `codex/map11-32-20261021` 검토 후보이며 main·PC·실행 중인 다른 게임에는 적용하지 않는다. R의 HEAD/branch/tracked INDEX/WORK는 보존했다. 최초 fetch와 worktree 등록은 R cwd에서 실행되어 공용 Git refs/FETCH_HEAD/metadata는 갱신되었다. 이후 파일 변경·실행·커밋은 지정 WT cwd에서만 수행한다.

## 선택 구역 / 장면 계획

| 항목 | 계약 |
|---|---|
| 범위 | START `(0,3700)` → EARLY `(-500,2550)` 중 숲 입구와 첫 통로 한 곳. 북쪽 기존 MAIN `(0,1300)`, 좌우 순환·gate·arena 유지 |
| 역할 | 남쪽 START/breathing → 중앙 넓은 travel/threat → 흰 나무 landmark → 북쪽 첫 전투장. 좌우는 비대칭 죽은 고목 mass, 낮은 뿌리/이끼가 접합 |
| 외곽 | 기존 22점 outer·14 anchor·15 route·4 region·4 hole·fieldboss sites 불변. 새 통로/스폰/전투 코어 없음 |
| 카메라 | 기존 줌 `.70`, offset `(0,-180)`, START 화면 중심 `(0,3520)`. 원화 2000×1125 → 실제 1920×1080, source scale `(1920/2000)/.70 = 1.3714285714` |
| 세로 투영 | 논리 Y를 `.6`으로 역산하고 `.6`으로 재투영. 원화 픽셀은 X/Y 균일 배율, 타원/나무를 늘리지 않는다 |
| actor | 30c의 player sprite `(2,2)` 및 boss·collision·reach·speed 그대로. 공유 `actor_rim.gdshader` / `target30/actor_contact.png` 유지 |
| 경로 안전 | 새 3개 원형 foot는 provider와 runtime physics가 같은 `target32_layout.solids()`를 소비. 기존 주 전투장 중심 `(0,1300)`의 1600 여유 반경·96 route clearance 유지 여부는 단회 관련 검사로 판정 |

## 룩 고정값 — 필드 공용 `target32_layout.gd`

| id | 정확 값 / 적용 |
|---|---|
| LIGHT | 화면 NW 확산광 `(-.45,-.89)`. 원화 baked 방향, 새 광원 rig 0 |
| PALETTE | 회보라 ground `#55515e`, 검붉은 vein `#351f29`, 이끼 `#454b40`, 안개 `#787482`, 흰 나무 `#b9b5c4` |
| LUT | `identity_lut.png` 256×1 RGB. 원화 자체는 offline identity·unshaded(프래그먼트 LUT lookup0), 기존 ambient 중복 곱 금지. 필드 전체 구형 자산을 이 LUT로 자동 보정한 것이 아님 |
| 안개 | 원화 회색 ROI `(800,190)-(1200,390)` → 400×200 L/blur18. world 중심 `(0,3350)`·scale `(5.8,2.2)`, alpha 최대 `.035`, UV X `.004/sec`, 양끝·높이 sine 감쇠 |
| 핏줄 | source 기존 붉고 어두운 균열 chroma mask만. `.16Hz`, 강도 `.012`, RGB `(.38,.06,.10)` additive. 점/디더링/무작위 무늬 없음 |
| 흰 나무 | 원화 luminance `.32~.65` 마스크에 RGB `(.65,.63,.75)` × `(.012+.008*sin(TIME*.75))`. 정적 빛은 원화 baked, 추가 효과만 미약한 호흡 |
| 가지 | UV X `sin(TIME*.72+UV.y*3)*.00065*(1-UV.y)^2`, 발 고정. 캐릭터/보스 변형 없음 |
| 시차 | 하단 원화 가지 별도층, 카메라 중심 이동의 반대 `.025` |
| 판정 | 목표/실제 나란히 1920×1080 및 무확대 800×700 crop `(560,170)`; 같은 장면 여부만 시각 판정. 자동 검사를 시각 PASS로 대체하지 않음 |

## 층 / 발 SSOT

입력은 공급 PNG `~/exoduser-wt/_out/MAP11-30/ch1_field_corridor_target.png`. `godot/tools/map11_32_split.py`가 원화 source polygon·clone·미러·apron 감쇠와 `target32/split.json`을 재현한다. 새 생성·모델 inpaint·runtime 3D 없음.

| 층 | 리소스·배치·합성 |
|---|---|
| 바닥판 | `target32/floor.png` 3200×2325 RGBA. 원화 수직 고목을 mask로 분리, 인접 중앙 바닥 x700~1300/y500~1050을 **원래 픽셀 크기 그대로** reflected clone하여 빈 영역 채움. 점·디더링·늘린 바닥 crop 없음 |
| 접합 | source 바깥 600px apron, 중앙 바닥 clone만 연장(수직 나무를 바닥판에 미러하지 않음). 바깥 alpha `f=(1-clamp(distance/600,0,1))^(1.5+1.1*sin(x/173)*sin(y/149+x/311))` 후 smoothstep. source 안쪽도 `95+35*sin(x/139)+25*sin(y/137+x/199)`px 폭으로 중앙 clone과 혼합. 직사각 cutoff 대신 유기적 feather |
| 뿌리/AO | 원화의 발 주변 뿌리·접지 그림자를 바닥과 trunk apron으로 유지. 추출 검토용 `root_aprons.png`; 정적 접합은 floor에 귀속, 매틱 새 AO/ellipse 생성 없음 |
| Y 고목 | left_near/left_mid/right_mid/right_near/white_tree 5구간. source frame 좌우 바깥 300px는 같은 원화 미러·불규칙 alpha로 연장. 북쪽은 뒤집힌 가지를 만들지 않고 source y0~65px에서 감쇠한다. 원본 source 좌표에 배치, 발 Y/4 절대 z. 앞에서 가림 시 alpha `.20`로 초당8 복귀 |
| 전경 | 원화 하단 가지 polygon 2개, 2000×1125 RGBA. 별도 시차, z3490 |
| 동적 | 안개/가지/흰 나무/핏줄은 셰이더 TIME. 정적 원화와 효과 분리, 틱 경로 resource load/목록 API/새 material 할당 없음 |
| 기존 소품 | TOUR scene0 입구 4개와 그 원형 충돌·주황 torch/light만 제외. 나머지 13개/5장면 유지. 기존 숲·데칼 중 y>2550, abs(x)<2200인 입구 그림만 retire. 다른 구역은 유지 |
| 폴백 | 기존 필드 바닥은 alpha 바깥에 계속 보임. target 리소스는 setup preload; 리소스 누락 시 엔진 오류이며 자동 로딩 실패 폴백은 없음 |

| id | source foot | 실제 world foot | radius / 권위 |
|---|---|---|---|
| left_near | (255,880) | (-1021.7143,3955.4286) | 기존 outer 바깥, 별도 circle0 |
| left_mid | (610,365) | (-534.8571,3249.1429) | 80 / provider+physics 동일 |
| right_mid | (1410,410) | (562.2857,3310.8571) | 90 / provider+physics 동일 |
| right_near | (1810,980) | (1110.8571,4092.5714) | 기존 outer 바깥, 별도 circle0 |
| white_tree | (1000,160) | (0,2968) | 48 / provider+physics 동일 |

field recipe revision1 및 runtime `map11.field+arena.v1` schema 계약 유지, geometry content_hash는 새 solids로 달라진다. provider/flow/physics 기존 구현을 재사용하며 전투·save는 변경0.

## 검수·차이표

외부 `~/exoduser-wt/_out/MAP11-32/`의 최종 단회 시험·측정 결과를 아래 누적한다. 초기 capture 부팅에서 임시 recipe revision2가 runtime의 revision1과 충돌하여 provider_not_ready가 발생했다. 자기 revision 변경을 제거한 뒤 정상 부팅 확인. 이는 성능 측정이 아니며 관련 테스트는 그 후 1회만 실행한다.

| 관측 | 결과 |
|---|---|
| 첫 입장 | 실제 Main START 캡처에서 카메라 중심 `(0,3520)`, zoom`.7`, actor scale2 확인. 목표 양옆 고목·회보라 바닥·흰 나무 구도 대응 |
| 첫 북 이동 | source 상단 직선 컷/바닥에 수직 나무가 미러되는 오류 발견. 원화 frame 밖 고목층을 별도 미러 연장하고 floor apron은 중앙 바닥만 clone하도록 수정 |

## MAP PRODUCTION REPORT

STAGE: CH1-1 첫 입구~첫 통로 한 구역.
MASTER: 남 START→북 EARLY→기존 MAIN/좌우 순환/북 gate. travel·breathing·threat 중앙, nonwalkable 고목 외곽.
OUTER MASS: LEFT/RIGHT source 고목5구간의 비대칭 액자; TOP 흰 나무; SOUTH 낮은 가지/뿌리. 기존 외곽 polygon 보존.
LARGE: 승인 원화1장 source polygon 분해, 미러 apron; 새 이미지 생성0, 전체 실루엣 재사용 중복 소품0.
MEDIUM: 원화 뿌리/이끼/접지와 feather 연결. clone 반복·기존 필드 색차는 실제 경계 캡처로 판정.
GROUND: 회보라 연속 원화판, source clone, 검붉은 균열. 정적 roots/AO 유지, 점·디더링0.
PLAYABLE: 주 arena R1600와 routes/스폰 보존 검사, 첫 구역 실제 입력 성능; 밀집전투/탄막 검수 아님.
LANDMARK: 이 구역 primary 흰 핏줄 나무, secondary 양옆 고목, tertiary 낮은 이끼/뿌리. 전체 맵 primary 기존 landmark 유지.
CAMERA QA: START/EARLY/좌·우 뿌리 실제 Main 1920×1080/1x. ARENA/LATE/EXIT 기존 화면은 이번 목표 범위 밖.
TECH QA: 아래 단회 결과와 로그 참조. runtime3D0, 신규 tick 목록 API/ResourceLoader/material 할당0, 격리 user dir, PID81277 보존.
FILES: target32 assets/look/shaders/split/capture + product_field_view/product_detail/field_recipe + 관련 docs. 타 팀 파일 수정0.
GIT: 지정 branch 정상 hook·경로 add·비강제 push 후 원격 SHA 확인. main push·PC sync·배포0. 외부 DONE에 SHA/정리 기록.
VISUAL VERDICT: 검수 후 아래 확정.
NEXT PASS: 실제 최종 비교의 남은 차이만 아래 기록.


## 최종 단회 결과 / 누적 차이

| 검사 | 결과 / 경계 |
|---|---|
| field / field_runtime / field_walk | 각각 **41/49/49 checks, 실패0**, 각1회. walk는 CharacterBody 12003 motion steps·4region 방문·31178.31world replay이며 실시간 자연 플레이 시간 아님 |
| stage_provider / seam / outer | 각각 **54/18/26 checks, 실패0**, 각1회. 전체 **237 checks / 0fail**. seam/outer는 기존 독립 preview 계약이며 신규 source 접합의 시각 PASS를 뜻하지 않음 |
| 최종 화면 | 실제 Main START/EARLY/LEFT_ROOT/RIGHT_ROOT·각1920×1080 및1x800×700. `captures/compare_target_vs_game.png`, `compare_1x.png`, `game_entry.png`, `early_boundary.png`, `left_roots.png`, `right_roots.png`, `motion_2s.png` |
| 성능 유효1회 | **p95 11.676ms / p99 13.226ms / focus_lost0**, 평균118.967FPS·118draw/219objects. **예산FAIL** (8.33ms보다3.346ms 초과). 유효 느린 표본 재측정0 |
| 입력 | 실제 Player 4방향×150틱, 관측616틱/1221renderframe·accepted true·139.228world 이동. 전투/충돌/CC 중 움직임 제한이 포함돼 자유 보행이나 밀집전투 측정으로 일반화하지 않음 |
| 무효 선행 시도 | background focus_lost1666·이동0·관측p95 7.942ms. **전부 무효, PASS값으로 사용0**. 포커스 확보 후 유효1회만 받음. `performance-invalid-focus.json` 보존 |
| 실행 환경 | Godot4.7.2 GL Compatibility / Apple M5 Pro, 1920×1080, max240/vsync off, `EXODUSER-MAP11-32-Isolated`. 공식 Godot 실행 사본으로 창 구분, CUA로 자체 게임 창 Raise. PID81277 종료/재시작/입력0. 두프로세스 한도 감시 |
| 측정 버전 | **최종 source seam rebake·inner feather와 동일 바이트 리소스를 유효 측정**. 원본/final asset SHA 외부 보존. 첫 무효 시도 뒤 floor pixels를 보정했고 유효 측정 이후 제품 코드·assets 변경0 |
| UI / 범위 | 제품 게임 HUD 유지, 새 개발 상태 문구0. actor scale 변경0, PC코어/save/실제 저장폴더 접근0. 새 source PNG와 docs WEBP decode RGB 동일 확인 |
| 로그 | 최종 capture/runtime shader/script ERROR0. 기존 Camera2D interpolation physics mode WARNING은 유지. 원래 R/PC 창·서버 자동 재시작0 |

| 날짜 | 장면 / 비교 경로 | 남은 차이 | 판정 |
|---|---|---|---|
| 2026-10-21 | START `~/exoduser-wt/_out/MAP11-32/captures/compare_target_vs_game.png` | 양옆 고목·회보라 길·흰 나무 위치는 같은 장면 구도로 대응. source 상단65px fade로 최상단 가지/흰 나무가 목표보다 약함. 런타임 actor/HUD가 포함되며 actor 배율은 사용자 결정 대기로 그대로 | RETOUCH |
| 2026-10-21 | 무확대 `captures/compare_1x.png` | 부품별 다른 그림체/배율 차이는 줄었으나 mask 가장자리의 국소 softening·clone 바닥 반복이 남음. 추가 점/디더링0 | RETOUCH |
| 2026-10-21 | 북 이동 `captures/early_boundary.png` | source 외곽 직사각 RGB 점프는 inner 불규칙 feather로 완화, 뒤집힌 상단 가지 연장 제거. 넓힌600px 접합에서 중앙 바닥 미러 무늬와 기존 어두운 필드 색차·북쪽 mass 밀도 차이가 명확히 남음 | RETOUCH, 전체 필드 완성 아님 |
| 2026-10-21 | `captures/left_roots.png`, `right_roots.png` | source 발 위치와 provider circles 일치. source 밖 near trunk는 기존 outer로 막힘. 중앙 collision replay 통과와 별개로 root 끝·보행 경계의 모든 시각 접촉은 완전 검수 아님 | RETOUCH |
| 2026-10-21 | `performance.json` | 유효 p95 11.676ms, 8.33ms 초과. 전후 통제 비교가 없어 증가 원인을 새 map만으로 특정하지 않는다 | 성능 FAIL |

MAP PRODUCTION REPORT 최종 갱신: TECH QA는 위237/0·실제Main capture ERROR0, 신규 접합 시각은 RETOUCH. START 구도 대응, EARLY clone/색차 잔여; SIDE L/R source발 확인, 다른8board 전체맵 시각 승인은 아님. **VISUAL VERDICT: RETOUCH / PERFORMANCE: FAIL**. 새 필드1구역 구현·검토 후보의 보존이며 AAA/완성/120fps달성 선언0.

NEXT PASS: source 밖 바닥을 넓은 비반복 clone 패치들로 연결하고 기존 필드의 국소 palette transition·북 mass를 같은 룩에 맞출 것. 유효성능의 map/actor/시스템 비용 분리는 별도 승인 작업으로 남긴다. 이번 지시의 유효 성능1회 제한으로 재측정하지 않았다. 코드/리소스/관련docs를 정상 hook commit·비강제 자기branch push, 원격 SHA와 clean WT 제거 여부는 외부 DONE.
