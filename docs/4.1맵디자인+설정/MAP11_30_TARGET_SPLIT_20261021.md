# MAP11-30 — 보스룸 목표 장면 분해 첫 시제품

기준 `origin/codex/boss11-03-20261021` = `8e45a9bca55adc3902c6ca6ba0a4a1e763676233`.
`c0618459`는 ours merge로 기존 코드를 보존하고 해당 커밋의 목표 문서·원화 3파일만 취했다(merge `62038597`). main의 다른 PC/audio 변경은 가져오지 않았다. branch `codex/map11-30-20261021`, worktree `~/exoduser-wt/MAP11-30`. R 읽기만, main/PC 배포 없음.

## 장면 / 공간 계획

목표 1장 → 외곽 연속 질량 → 나무·뿌리 연결 → 살 바닥 → 기존 넓은 전투 공간 → 보스 실루엣 → 입장 카메라 비교 순서다. START 남쪽, EXIT 북쪽, 중심 보스/전투 void, 양옆 경계 threat mass. 별도 필드/side pocket/route 제작은 범위 밖이다. 원형 R1700과 기존 provider·바깥 소품 충돌 원은 보존한다. 목표 타원 구도와 실제 원형 이동면 사이의 투영 차이는 시각 잔여 사항이며 충돌을 바꿔 숨기지 않는다.

## 룩 고정값 — `target30_look.gd` 한 곳

| 항목 | 값 / 적용 |
|---|---|
| 빛 방향 | 화면 좌상단 확산광 (-.45,-.89), 원화에 이미 그려진 빛을 유지. 새 3D/light rig 없음 |
| 살 / 핏줄 | #694044 / #351b26 |
| 보라 맥 발광 | #985caa; 바닥 최대 .065 / pod 최대 .055 additive |
| 회색 안개 | #69636b, alpha .12~.26; world R1450→2100 진입, R2400→2850 소멸 |
| 맥박 | .16Hz (6.25초), 셰이더 TIME. pod X ±1.2%, Y ∓.54%; 발 원점 고정 |
| 시차 | 카메라 이동 반대 방향 .08, 화면에서는 정적 world보다 1.08배 이동 |
| 보정 커브 | `target30/legacy_to_target_curve.png`, 256×1 RGB curve. 변경 전 Main 캡처 ROI (650,400,600,300)와 목표 ROI (650,400,700,300)의 채널별 10/30/50/70/90 percentile 매핑. 중복 입력은 출력 평균 |
| R curve | 입력 0/46/48/49/50/52/255 → 출력 0/68/91/105/118/137/255 |
| G curve | 입력 0/25/27/28/29/255 → 출력 0/28/53.5/72/89/255 |
| B curve | 입력 0/25/26/27/28/29/255 → 출력 0/29/46/58/69/86/255 |
| 실제 적용 구분 | 목표 원화 층은 **identity**, unshaded로 기존 어두운 CanvasModulate 재곱을 피한다. 현재→목표 보정 커브는 보관·shader `grade_legacy` 지원만, 숨긴 구형 소품에 활성 적용하지 않는다. 전역 LUT 적용 완료 아님 |
| 기존 효과 | 의식 링·기존 숲/7종 finale 표현 숨김. 기존 arena 청색 화면안개 depth=0, 목표 둘레 안개가 대신함. 기존 field 안개/카메라/보스 예고 유지 |

## 원화 분해 / 리소스

원본 PNG 2000×1125 SHA256 `705d98bb20c0ed78e29158e8b427171e50d7488110afef9972bb065f37d473ac`. docs의 target WEBP를 decode한 RGB와 공급 PNG의 RGB **동일** 확인. 새 생성·모델 inpaint·점/노이즈/디더링 없음. Pillow cubic/Lanczos와 OpenCV cubic만 사용한다.

| 층 | 리소스 / 배치 / 처리 |
|---|---|
| 바닥판 | `target30/floor.png` 4096² RGBA, world4800². source 중심(1000,550), 타원 반경(820,350)을 world 원 R1700에 역투영. 세로 구조물 마스크 밖은 원본 인접 바닥 crop(530,330)-(1470,820)의 확대 clone으로 채움. 픽셀 반복 타일 없음 |
| 바닥 alpha | world R1750~2050 smoothstep fade; source 밖 sample은 BORDER_REFLECT_101. 이 외곽 반사와 확대 해상도는 1x에서 확인할 차이 |
| BACK mass | `backmass.png` 2000×1125 원화의 원형 world R1650~2000 외측 alpha, scale2.9, RGB(.70,.70,.74). 플레이 바닥을 대체하지 않고 둘레의 빈 검정 구멍을 연결 |
| Y 정렬 MID/FRONT | west_mouth / north_west / north_heart / north_east / east_mouth / south_west / south_east 7구간. 원본 polygon alpha, 안쪽48px smoothstep, 아래65px 접합 감쇠. 각 발 R1755, scale2.25. world foot y/4 절대 z (기존 actor 계약) |
| 접지 | 구간마다 `_shadow.png` + `_root.png`, 원화의 발 아래100px apron 추출, shadow Gaussian sigma12. 지면 z=-448/-447; 본체와 독립하여 가림 alpha 중에도 유지 |
| 앞 가지 | `foreground.png` 2000×305, 원화 하단 y820~1125 마스크, scale2.8, 초기 world(0,1180), 절대 z3490 |
| 맥 / 알주머니 | `veins.png` 4096² R8 chroma mask + 공유 `target30_surface.gdshader`. 두 material(바닥/경계), tick uniform 업로드/리소스 로드 없음. **pod만의 국소 변형이 아니라 경계 덩어리 전체의 약한 호흡** |
| 안개 | 원화 회색 부분 crop(1440,30,1696,286), 256², blur14. 둘레 polygon128점 + `target30_atmosphere.gdshader`, TIME UV 이동(.004,-.002). 총 신규 shader 2개 |
| 입 벌림 | 이번 첫 시제품 미구현. 정적 원화의 입과 호흡만. 별도 2프레임 완료 주장 없음 |
| 원본 보존/폴백 | 기존 `product_arena_view.gd`를 `arena_legacy_view.gd`로 동일 byte 보존. 기존 노드/충돌 생성 후 시각만 hide. 필수 target preload 실패는 현재 시작 오류가 되며 자동 런타임 fallback 미구현 |

발 위치와 source polygon/crop/offset은 `target30/split.json` 및 `tools/map11_30_split.py`가 재현 원본이다. 실행: `python map11_30_split.py target.png output_dir before_entry.png`. 기존 floor/prop/shader 원본은 삭제하지 않았다. 전투/판정/저장/번역 목록 변경0. 런타임3D0, 신규 tick 목록API/ResourceLoader0. geometry/collision owner 변경0.

## 게임 장면 판정 / 검수

외부 `~/exoduser-wt/_out/MAP11-30/captures/`:
`before_entry.png`, 최종 `game_entry.png` (1920×1080), `game_entry_1x.png` (800×700 무확대 crop, xy560,170), `compare_target_vs_game.png` (목표/실제 좌우).
실제 Main + 기존 HUD + 기존 Player, 입장 player(0,800), 제품 카메라 local(0,120)/offset(0,-180)/zoom .36. 보스는 기존 source idle 원화 fixture(0,-180)이며 자연 전투·gate·HP·23패턴 실행 검수가 아니다.

검사·성능·최종 차이는 아래 결과 절과 목표 원칙 문서 하단 표에 기록한다. 초기 shader int×float 오류는 수정 후 캡처 재검수하며 오류 로그도 외부 보존. 성능 재측정으로 통과값을 고르지 않는다.

## 단회 결과 / 남은 차이

| 검사 | 결과 / 경계 |
|---|---|
| map11 arena_preview | 35 checks, 실패0, 1회 |
| BOSS11-03 시각 | 18 checks, 실패0, 1회 |
| BC01 | 681 assertions, 실패0 |
| BC02~09 | 각1회, 각1실패. 하니스가 `--source-game` 인수를 빠뜨려 독립 fixture hash 확인 실패. 내부 수치 assertion은 로그상 실패0이나 전체 suite PASS로 취급하지 않음 |
| BC10 | 1회 호출, source hash/node 경로 인수 없음으로 초기3검사 중2실패; 본 검사0. 재실행0 |
| 전체 호출 집계 | 12 tests, 188375 assertions/checks, 10 failures. 제품 보스 회귀 전체 통과 주장 없음 |
| 성능 | **p95 7.747ms / p99 9.534ms**, focus_lost0, 유효. 8.33ms 목표 PASS. 실제 입력4방향×150틱, 관측610틱, 보행1604.483px, 1763 render frames, 평균173.411FPS, draw116 / objects225 |
| 환경 | Godot4.7.2 GL Compatibility / Apple M5 Pro, GUI1920×1080, vsync off/max240, 격리 `EXODUSER-MAP11-30-Isolated`. 1회/재측정0; PID81277 유지/우리 Godot 순차1개 |
| 성능 범위 | presentation은 arena, authoritative product_space는 field. **명목 arena**이며 자연 gate/보스전/PC/밀집 전투 성능 검수 아님. 이전 커밋과 동일시점 전후 비교 없음 |
| 캡처 오류 | 최종 capture-accepted.log 및 performance.log shader/script ERROR0. 초기 셰이더 int×float 오류는 float 캐스트로 수정, 로그 보존 |
| 1x | 무확대800×700에서 별도 점/디더링 추가 없음 확인. 확대에 따른 결 늘어남·clone 블러가 명확히 남음 |

| 날짜 | 장면 | 비교 캡처 | 남은 차이 | 판정 |
|---|---|---|---|---|
| 2026-10-21 | 보스룸 중앙→북 경계 입장 | `_out/MAP11-30/captures/compare_target_vs_game.png` | 원화 타원 공간이 원형 plane 역투영으로 세로로 늘어남. 북쪽 나무가 카메라 위로 잘리고 옆 mouth 위치도 원화와 다름. 경계 source frame의 일부 직선/crop 흔적, BACK/front 중복 실루엣, 주변 바닥의 확대·clone·반사 흔적. 목표보다 바닥 대비/크기 큼 | **FAIL — 같은 장면 아님** |
| 2026-10-21 | 같은 장면 효과/접합 | `compare_1x.png`, `game_entry_1x.png` | 뿌리/접지는 추가했으나 부드러운 구간 접합 미달. pod 국소 마스크 대신 전체 덩어리 호흡, 입 2프레임 미구현, foreground가 남쪽 공간을 크게 가림. 안개와 보라 맥은 source palette지만 더 다듬어야 함 | FAIL / 첫 시제품 보존 |

다음 pass는 부품을 더 만들지 않고 source floor 범위/clone 패치의 확대율과 source→world 발 대응부터 다시 맞춰 같은 구도의 차이를 줄여야 한다. **이번 결과는 시제품 인계이며 장면 완성/AAA/PASS 선언이 아니다.**

## MAP PRODUCTION REPORT

STAGE: CH1-1 보스룸 첫 시제품.
MASTER: 기존 R1700 원형 silhouette, 남 START→중앙 combat void→북 EXIT, 기존 side/travel 경로 보존.
OUTER MASS: LEFT/RIGHT 입 달린 나무, TOP 생체 고목·pod, SOUTH 전경 가지; 검정 hole은 source BACK mass로 연결했으나 source 중복·크롭 차이 잔여.
LARGE: 목표 원화 1장, 7구간+BACK/전경, source alpha overlap; 일부 mouth 중복 실루엣 잔여.
MEDIUM: 원본 뿌리 apron7개; 컷/접합 잔여.
GROUND: 4096² 단일판, 뿌리7/AO7, source clone; 확대·반사 품질 미달.
PLAYABLE: 기존 main arena/travel/breathing/threat 공간과 collision 보존; 실제 보행 확인, dense combat/탄막 가독성 미검수.
LANDMARK: 기존 boss source idle fixture primary, 양옆 mouth secondary, teeth tertiary.
CAMERA QA: START/ARENA 입장1구도1920×1080 및1x; SIDE L/R/EXIT/EARLY/LATE 별도판 미실시(첫 시제품 범위). 목표/실제 same-scene FAIL.
TECH QA: 관련 preview35/visual18/BC01 통과; BC02~10 하니스 인수 실패 잔여. route/원형 충돌 원본 보존; native pageerror/404 N/A; 새 texture seam은 시각 잔여; final load/shader ERROR0. 성능 단회7.747ms 유효 PASS.
FILES: stage-owned 새 target30 assets/2shaders/look/split/capture/legacy adapter, product_arena_view/detail/lighting와 관련 docs. concurrent/unrelated tracked edits0; 임시 project 설정 byte 복원. 번역CRLF 변경0.
GIT: merge62038597 + 자기 변경 코드/docs 경로 staging, 정상 hook/비강제 자기branch push. main push/deploy0. 최종 SHA/원격검증은 외부 DONE.txt.
VISUAL VERDICT: **FAIL**.
NEXT PASS: 카메라 보존 조건 안에서 source 발/층 투영 대응 재설계, floor clone 확대 흔적 제거, 북 경계 노출·중복 silhouette·국소 pod와 입 동작.

운영 예외: 최초 fetch를 R cwd에서 실행하여 R read-only 지시를 엄격히 지키지 못했다. tracked INDEX/WORK/HEAD/branch 수정0이나 공용 remote refs/FETCH_HEAD는 갱신 가능. 이후 모든 수정/실행/정리는 별도 WT cwd에서 수행. 테스트 source 인수 누락도 위 결과에 숨김 없이 기록했다.


## MAP11-30p 성능 후속 (2026-10-21)

위 수치·리소스 설명은 해당 제작차수 이력이다. 장면/충돌을 유지한 정적합성·바닥패스통합·안개zero-alpha영역제거·미사용15texture preload 제거의 현행 후보는 [MAP11-30p](MAP11_30P_PERFORMANCE_20261021.md)를 따른다. 시각유지 PASS, 유효p95 **8.558ms**/focus_lost0/104draw로 **8.33ms 성능예산 FAIL**. 원본 floor/veins와 소품 source는 보존한다.


> 2026-10-22 MAP11-33 후속: 이 문서의 과거 자산·메모리·북접합 수치는 당시 이력이다. 현행은 [목표화면 MAP11-33](MAP11_TARGET_FRAMES_20261021.md#map11-33--고해상도-마감-리터치맵-텍스처-예산-2026-10-22). legacy아레나제품로드 제거/field bake 무손실trim·RGB/국소리터치, 1-1보수GPU988,351,648bytes. 182검사0fail, 성능은포커스미확보로p95 N/A(유효0).
