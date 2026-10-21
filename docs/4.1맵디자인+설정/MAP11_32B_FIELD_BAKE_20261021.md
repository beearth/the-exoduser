# MAP11-32b — 첫 필드 정적 bake와 북접합 리터치

기준 `d953e3492171a20abe7bc43df50939eca4b04fc0`, 동일 `codex/map11-32-20261021`. START/카메라 zoom `.70`, offset `(0,-180)`, source 균일 배율 `1.3714285714`, actor scale·provider/충돌/경로/스폰/PC 전투 코어는 보존한다. 아래는 측정한 최종 후보 계약이며 검수 결과는 외부 `~/exoduser-wt/_out/MAP11-32b/`와 문서 하단에 기록한다.

| 층 | MAP11-32b 계약 |
|---|---|
| source 바닥·root/AO·북접합 | `target32/floor_32b.png`, 3200×3725 RGBA, source box `[-600,-2000,2600,1725]`. source 안쪽은 기존 START 그림·root/AO 보존. 새 북접합은 원화의 다양한 ground crop을 native1:1·무회전·무반사로 겹친다. seed32021은 배치 재현용이며 점·디더링 없음 |
| 패치 | 중심 간격190px+X±45/Y±45 지터, source 폭360~509/높이330~479, source x735~(1250-width), y260~(1100-height). 불규칙 feather와 겹침 가중 평균. 정확한 source·중심 목록은 `target32/bake_32b.json` |
| 접합 alpha | 좌우/남600px, 북은 y=-850부터-2000까지1150px 전이. `d=max(-x/600,(x-1999)/600,(-y-850)/1150,(y-1124)/600,0)`, `(1-d)^(1.6+.55*sin(x/197)*sin(y/183))` 후 smoothstep. 직선 cutoff 없음 |
| 룩 | ground#55515e / vein#351f29 / moss#454b40 / fog#787482. source 명암을 보존하며 신규 접합만 palette22% 혼합. START source 내부 keep 영역은 기존 픽셀 보존 |
| 기존 필드 정적 바닥 | `target32b/ground_*.png`, product_surface·정적 root/AO·fissure 합성. 2048world core/2px bleed, 최대5×5 후보 중 비어 있지 않은 타일만 저장. 같은 원본 월드 shader 좌표 유지, 런타임 조명은 기존 owner 유지 |
| 고목 | 4개 고목 정적 material, 기존 source PNG/발/Y정렬/가림 복귀 유지. 흰나무만 기존 국소 빛 shader 실시간 |
| 시차 전경 | 기존2개 실루엣을 독립 alpha bbox로 trim, 위치는 원화 source 좌표에서 역산. 시차.025, z3490 유지 |
| 실시간 | 낮은 안개 alpha.035 / 흰나무 빛 / vein.16Hz·strength.012 / 시차 전경. 신규 tick 목록API·ResourceLoader·material 할당 없음 |
| cull | 정적 bake 타일·source floor/fog·고목·전경을 캐시 rect와 camera view로 판정. bake 전 texture/JSON 읽기는 setup 한정 |

`map11_32b_bake.py`는 원화 클론 합성, `map11_32b_ground_bake.gd`는 기존 정적 지면 raster bake다. 새 이미지 생성·모델 inpaint·런타임3D 없음. isolated user dir `EXODUSER-MAP11-32b-Isolated`; 실제 저장 폴더 접근 금지.

## 최종 검수 — 성능 FAIL 유지

| 항목 | 결과 / 한계 |
|---|---|
| 실제Main START | `(0,3700)`, camera center `(-0.000122,3520)`, zoom`.70`, player scale`(2,2)` 유지. `captures/compare_target_vs_game.png`, `compare_1x.png` |
| EARLY 같은 위치 | `(-500,2550)`, `captures/early_boundary.png`, `early_boundary_1x.png`. 북쪽 검은 공백·좌우 미러 만화경·떠 있는 큰 균열은 제거. 바닥만 넓게 이어져 깊이와 국소 결은 다소 부드러움; 전체필드 완성/AAA 판정 아님 |
| source 고목 | static4/white1의 발·원형foot3개·Y정렬 유지. 4개 고목은 actor 앞뒤 가림이 있어 독립sprite 유지, 하나의 평면 bake로 합치지 않았음 |
| 실제 bake | 지면22타일, 각2052×2052/2048world core+2px bleed, nonempty tile만. 기존 clip_children surface와 그 자식 정적 decals를 해제하고 타일 cull. 목표 draw 절감에는 실패 |
| 전경 trim | 2000×1125의 빈 판에서 source bbox `(0,935,155,1125)` 155×190, `(480,950,715,1125)` 235×175 두 장으로 분리. 총70575px, 기존2250000px 대비96.8633% 감소. draw는1개 늘어남 |
| field / field_runtime / field_walk | 각1회 **41/49/49 checks, 실패0**. walk는12003 CharacterBody motion step replay·31178.30957world/4region, 자유보행의 벽시계 검수 아님 |
| stage_provider / seam / outer | 각1회 **54/18/26 checks, 실패0**, 합계 **237/0**. seam/outer는 기존 독립preview 계약, 새 접합 시각 PASS의 대용 아님 |
| 최종 유효 field1회 | **p95 11.806ms / p99 12.905ms / focus_lost0**, mean120.430814FPS. **PERFORMANCE FAIL**:8.33ms보다3.476ms 초과 |
| 전후 | MAP11-32 **118draw/219objects**, MAP11-32b **124draw/225objects**, 각각+6(+5.0847%/+2.7397%). p95 **11.676→11.806ms**, +.130ms. p99 **13.226→12.905ms**. 서로 다른 단회 측정이므로 통제된 A/B 개선율로 해석하지 않음 |
| 실제 입력 | 4방향×150틱, 관측614physics ticks/1232render frames, 이동230.709158world/input accepted. 충돌/CC/전투가 포함되며 밀집 전투·PC 성능 주장은 없음 |
| 공존 | 성능 프로세스54관측 전부 own+81277 이하. 성능 시작 전81277만 존재. focus0이며 무효/재측정0. PID81277 입력·종료·재시작0 |
| 환경 | Godot4.7.2 / GL Compatibility / Apple M5 Pro /1920×1080/max240/vsync off. 게임·bake·시험은 격리 user dir. 초기 editor import만 기본Demo 설정으로 시작한 뒤 발견하여 격리설정으로 수정, gameplay 실행은 전부 격리. 실제 `EXODUSER-Godot-Native-First` 접근0 |
| 리소스 비용 | 신규 runtime PNG26장(ground22+floor/vein/foreground2), 합계77170589bytes on disk. 지면은2048단위 cull하지만 setup에서22texture를 상주시킴; streaming/메모리 절감 구현 아님 |
| 런타임 오류 | 최종 import/bake/Main shader/script ERROR0. 기존 Camera2D physics interpolation WARNING 유지. live0/2초는 실제 actor/HUD 움직임도 포함 |
| 런타임 제한 | 신규 tick 목록API·ResourceLoader·material 할당0, runtime3D/새생성/inpaint0. setup JSON/texture load만. provider/PCcore/save/actor·boss scale/카메라/경로/스폰 변경0 |

성능 단회 결과가 유효하므로 느린 표본을 무효 처리하거나 재측정하지 않았다. 측정 이후 제품 코드·runtime asset 변경0(격리 config는 원본으로 복원하고 docs·증거만 정리). **이 제출은 성능 FAIL 해소 완료가 아니라, 북접합 리터치와 실패한 bake 후보의 보존이다. main/제품 인수 대상이 아니다.**

## MAP PRODUCTION REPORT

STAGE: CH1-1 START→EARLY 첫 구역.
MASTER: silhouette/region/main route/side spaces 기존 계약 보존.
OUTER MASS: LEFT/RIGHT 원화 고목 유지, TOP 바닥 전이 연장으로 검은 hole 제거, SOUTH 전경 trim; 전체 맵 mass 재설계 없음.
LARGE: 승인 원화1장, native patch/정적 합성, 신규 생성0; 고목 whole silhouette 추가 반복0.
MEDIUM: 북접합 mirror clone 제거, 다양한 crop 불규칙 feather; 넓은 지면의 부드러운 결 잔여.
GROUND: 원화 root/AO+접합 floor1장, legacy static ground22tile, foot 통합; 신규 점·디더링0.
PLAYABLE: 주전투장·travel/breathing/threat·동선·스폰·충돌 보존, 기술 replay PASS. 밀집전투/모든 바닥 접촉 시각 검수는 미실시.
LANDMARK: primary 흰나무, secondary 양옆 고목, tertiary 낮은 뿌리 유지.
CAMERA QA: START 구도 유지/북접합 수정 확인, EARLY black gap·mirror 반복 제거. SIDE L/R은 실제 capture 보존. ARENA/LATE/EXIT/전체8board는 범위 밖.
TECH QA: route/collision237checks0fail, Main ERROR0, 기존preview seam/outer PASS. PERFORMANCE FAIL(11.806>8.33ms).
FILES: target32/target32b assets·scene·field ground adapter·bake/capture tools·관련 docs. concurrent/unrelated 코드 변경0.
GIT: 동일branch 정상hook·경로add·비강제push, expected SHA `d953e3492171a20abe7bc43df50939eca4b04fc0`; 최종SHA/원격/clean제거는 외부DONE. main/PC/deploy0.

**VISUAL VERDICT: RETOUCH / PERFORMANCE: FAIL.**

NEXT PASS: source floor 아래 static tile 중복 렌더와 실제 visible draw 비용을 분리 진단하고, 전체 지면 bake의 상주비용·tile 개수를 축소할 후속작업 필요. 이번 유효1회 제한으로 추가 수정/재측정하지 않음.
