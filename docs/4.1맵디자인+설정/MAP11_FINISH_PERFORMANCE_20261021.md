> **2026-10-21 MAP11-PERF2:** [설계서 §27](MAP11_NEW_MAP_LOGIC_PLAN_20261021.md#27-map11-perf2--보스룸-성능-회귀-분리부분-복구). 첫 arena 회귀22c; 4커밋 동일공존 비교·요소분리·floor bake/ring annulus/cull. 복구field9.313/arena9.108ms, 8.33ms 목표FAIL. 아래는 이전 이력.

> **2026-10-21 MAP11-22e:** [설계서 §26](MAP11_NEW_MAP_LOGIC_PLAN_20261021.md#26-map11-22e--보스룸-진홍-링죄수-석주-마감). 링 밝기·채도 각18% 감소, 보스룸 전용 죄수 정면 PNG3방향. PID81277 공존 측정·포커스 유효성은 §26 최종 기록 참조. 아래 22d 이하 이력.

> **2026-10-21 MAP11-22d 현행:** [설계서 §25](MAP11_NEW_MAP_LOGIC_PLAN_20261021.md#25-map11-22d--입장에서-읽히는-붉은-의식의-원-4차). 기존 crack36+가지7 bake2048²/16MiB환산·1draw추가, 명시 glow .10, 관련308/0. PID81277 보존 조건으로 성능 표본0/p95 N/A/유효 false(미측정), 전체 RETOUCH. 아래22c·15차 결과는 이력.

> 2026-10-21 MAP11-22c: 제품 바닥 의식의 원·TIME 맥동의 현행 수치와 단회 측정은 [설계서 §24](MAP11_NEW_MAP_LOGIC_PLAN_20261021.md#24-map11-22c--전투-바닥-의식의-원-3차) 참조. 아래15차 측정은 당시 이력이다.

> 2026-10-21 **MAP11-17 조명 현행**: [설계서 §14](MAP11_NEW_MAP_LOGIC_PLAN_20261021.md#14-map11-17--조명-룩-패스-2026-10-21). 기준 MAP11-15 `1f797a8b`, MAP11-16/16b 미사용. MAP11 전용 CanvasModulate/광원·접지·외곽 안개가 현행이며 아래 MAP11-15의 전면 안개·광원 수치는 당시 이력이다. 1080p p95 필드7.857ms/아레나7.580ms, **VISUAL VERDICT: RETOUCH**. 독립 프리뷰와 웹 본편은 제품과 구분한다.

# MAP11-15 — 보스룸 벽가 마감·맵 렌더 비용

기반 `db9219b46644219f6327fd57c0f2bc3762d82cc2`, 소유 branch `codex/map11-15-20261021`. 맥북총괄의 MAP11-14 판정은 랜드마크 PASS / 보스룸 경계 RETOUCH. 제품 Main의 표시만 수정한다. provider/recipe/Marker/충돌 R1700/region/적/피해/Q·E/저장 writer 변경0. 공통 NativeScreenLighting 소스와 독립 arena/field 프리뷰는 변경0.

## 현행 계약·비용 진단

| 대상 | 기반 비용 / 현행 계약 | 근거·제약 |
|---|---|---|
| 보스룸 검은 호 | SkinFloor의 시각 반경1700 절단 → 제품만 mesh R2480/192점, 원 UV/texture_scale1.2 보존 | `arena_shoulder.gdshader`: angle=atan(y,x), edge=2090+95sin(7a+.4)+65sin(13a−1.2)+35sin(23a), alpha=source.a×(1−smoothstep(edge−420,edge+180,length(point))). 충돌/중앙 바닥/회피 공간 보존 |
| 외곽 BACK/MEDIUM | BACK forest32 + root shoulder32, 기존 front tree/시체나무/고치/문 보존 | BACK: a=TAU(i+.37)/32, r=2220+(i%3)90, 키1000+(i%4)95, 기존 tree[4,7,2,11,5,1,6,3], tint(.47,.48,.49), z−430, 새 collider0. root: a=TAUi/32, r1800+(i%3)65, 크기(740+(i%4)70,430+(i%3)55), 회전a+π/2+(i%3−1).13, z−410, 기존 field_decal 재질 |
| 필드 shoulder/decal | 승인 원본의 shoulder_count 카운터53 + 별도 D01 root stamp1 = root stamp54(요청의60은 추정), fissure30 | 위치/texture/alpha/순서 유지. 회전 decal은 반대각 길이 AABB로 화면 밖 제외; mass/forest는 캐시 rect+200. 가림 계산도 비가시 row는 생략. 동적 subtree 목록/reflect 생성0 |
| 필드 정적 필터 베이크 | 3회전·3스케일×5 texture lookup=15 → 베이크 texture3 lookup | 기존 ground_dark_soil의 .006 offset 5tap/가중합6을 1024² PNG에1회 굽기. runtime 제품 재질 `product_surface.gdshader`만 교체, world 좌표/회전/혼합/혈색/동측 damp 동일. 4MiB RGBA, lossless/linear/repeat, 원본 불변. 전체 숲/그림자/전체 맵 chunk 베이크 주장은 하지 않음 |
| 안개 투명 패스 | 기존 단일1920×1080 pass 유지. 매 화소3FBM×5octave(60hash/sin) → 정적 FBM cache3 lookup | `fog_pass.gd`가 원 shader의 fbm 함수만 cache sampling으로 대체. 원 UV/TIME/u_col/u_res/3층 가중치·smoothstep·alpha.41·합성 순서 유지, 원 material 종료 시 복원. 2048² lossless cache/16MiB RGBA, base domain[−64,64]/주기128, 5octave 가중치(.5,.25,.125,.0625,.03125), octave별 lattice period128×2^i로 seam 연속. 8bit/선형 필터 근사이며 원 함수와 pixel-identical 주장은 하지 않음. 반해상도 별도viewport 방식은 실제 걷기에서 목표 초과해 최종에서 제거 |
| 기타 화면 패스 | 원 lightmap·Fog2D·환경색·vignette·color filter 유지 | 이 변경은 GPU timer/패스별 ms를 측정하지 않음. draw call은 Main 전체, 투명 sprite AABB coverage는 실제 alpha/fragment 계측이 아닌 상한 참고치 |

PNG 재현은 `godot/tests/bake_map11_surface.gd`를 사용한다. 안개 캐시는 `godot/tests/bake_map11_fog.gd`로 재현한다. 새 이미지 생성 모델/지출0, 기존 바닥 필터와 기존 안개 정적5octave를 GPU로 구운 파생물2장이다. 원본 룩을 유지하기 위해 BACK/MID/FRONT의 동적 가림·원 아트는 통째로 합치지 않았다.

## 실창 전후 검증

안개 캐시 동일 TIME=12/1920×1080 straight RGBA 비교: RGB MAE=(.0943,.1670,.0750)/255, 최대=(1,2,1)/255; alpha MAE=.4804/255, 최대4/255. 이 근사 오차 범위에서 룩 유지 판정하며 수학적 동일 함수라고 보고하지 않는다. 기준 실제 걷기 표본은 필드 평균170.78fps/p95 7.563ms, arena 평균159.59fps/p95 9.728ms다. 각600틱/약10초, 실제 속도166.0152units/s, 코너 이동415.04units를 기록했다. 같은 기반이어도 좌표 구동/시점·배경 부하에 따라 앞선146fps 표본과 값이 다르므로 최종 고정 걷기끼리 비교한다. `~/exoduser-wt/_out/map11-15/`의 raw JSON/log가 근거다. 중간 타원 좌표 구동 표본과 실패한 중복 안개 표본을 최종 걷기 수치에 합산하지 않는다.

| 실제 걷기 600틱 | 기반 평균fps / p95 ms | 수정 평균fps / p95 ms / p99 ms |
|---|---|---|
| field | 170.78 / 7.563 | 189.38 / **6.987** / 7.554 |
| arena | 159.59 / 9.728 | 188.81 / **6.741** / 7.191 |

최종 실제 걷기 **24 checks / 0 failures**, 정상 HUD 캡처 별도22 checks / 0 failures(벤치 반복0), Godot ERROR0 / 기존 Camera2D interpolation WARNING1. 둘 다 p95≤8.33ms인 이번 표본만 PASS. native intro actor5, GPU timer/밀집 전투/장시간 최저FPS 인수 아님. cap240/physics60Hz는 최종 JSON에도 기록했다. 기반 실제 속도166.0152, 수정165.2352units/s로 코너 이동은415.04→413.09units다. 같은 입력150틱씩의 사각 경로이며 초기 캐릭터 무작위 스탯 차이를 제거한 완전 동일 fixture 성능비라고 주장하지 않는다.

비용 snapshot: 필드 Sprite467 중 화면 AABB33, shader sprite15, 투명 AABB coverage 약1.420×(전후동일). arena Sprite70→134/화면19→32/shader8→15, AABB coverage1.864→3.669×. 숲으로 경계를 덮어 arena overdraw/자산 수는 증가했지만 정적 shader cache로 표본 프레임 목표를 충족했다. AABB 상한은 실제 alpha fragment/GPU cost가 아니다. 걷기 끝 Main draw calls는 field128→128, arena116→123; objects238→238/225→238이다.

고정 경로는 실제 Player의 `handle_native_input_event(InputEventAction)` → 기존 `_native_input_held` → 실제 `_physics_process/move_and_slide`로 LEFT/DOWN/RIGHT/UP 각150틱, 합600틱/공간이다. 기본60Hz를 바꾸지 않는다. 위치 fixture는 측정 시작 전만 설정한다. 원점 field(−850,−2400), arena offset+(1250,80). native input 수락과 첫 변 실제 이동>200을 검사하고 각 코너·실제 속도·physics tick/벽시계/렌더 frame 간격을 기록한다. 수동 자연 종주/밀집 전투 완료와 구분한다.

1920×1080 실창, macOS / Apple M5 Pro / Godot4.7.2 Compatibility, vsync off/Main 원래240fps cap (`main.gd:147`이 시작 시 적용; pre-Main의0을 uncapped 근거로 사용하지 않음). 실제 Main intro 완료→lesson skip→랜드마크→기존 Gate 접촉→arena→벽가. 검수 창 grab_focus/입력 hold 재공급으로 focus-out의 키 해제에 대응한다. benchmark 밖 캡처는 foreground에서 frame_post_draw 후 GPU image readback한다. force_draw(false) 중복 렌더 캡처는 HUD가 빠지는 증거 오류가 있어 기각하고 원 정상 캡처만 다시 회수했다(성능 재측정0). 검수 캡처만 기존 큰 펫 자막 hide, 제품 UI 변경0. 격리 user dir는 **EXODUSER-map11-15-Isolated-20261021**. editor import 전부터 project.godot의 user dir만 임시 교체하고 마지막에 원 byte로 복원한다. 실제 사용자 저장 폴더 접근0. 매 실행 직전 요구한 pgrep 카운트는 로그로 보존하며 2이상일 때30초 대기한다. 자기 실행 외 종료0.

## MAP PRODUCTION REPORT

- STAGE: Godot CH1-1 MAP11-15. MASTER: 기존 남시작→북관문·필드 두 고리/4지역/arena R1700 그대로. side spaces/주동선 재설계0.
- OUTER MASS: LEFT/RIGHT/TOP/SOUTH arena 전 둘레에 BACK 숲과 root shoulder 연결. 큰 검은 원호는 시각 바닥 확장·감쇠로 제거. 필드 외곽 그대로.
- LARGE: 기존 rotforest8종, 겹치는 후경32. 기존 front 실루엣/투명 가림 보존. 원형 tree 정렬 자체의 전체맵 완성 인수는 아님.
- MEDIUM: root32가 forest의 발/바닥 전이 연결. foreground 대형 기둥/새 interior obstruction0.
- GROUND: 기존 피부 중심/불규칙 균열15 보존; R1700의 날카로운 절단을 불규칙 감쇠로 교체. 필드 정적 필터만 베이크, 전체 바닥 shadow/decal 병합 아님.
- PLAYABLE: 기존 넓은 전투/회피면/여행·호흡·위협 공간 보존. 실제 걷기/벽가 플레이어 가림 검수. 밀집 적·탄·Q/E·loot 중첩 미측정.
- LANDMARK: primary 시체나무+낮은 심장제단, secondary 관문, tertiary 고치/뿌리 유지.
- CAMERA QA: LANDMARK/ARENA WALL 전후 각각1920×1080+get_region(640,180,640,720) 원픽셀 crop. ENTRY/GATE는 같은 하니스에서 추가 검증. START/EARLY/SIDE L/SIDE R/LATE 8board 신규 인수 없음.
- TECH QA: route/physics R1700/Marker/provider 소스 불변. 관련 Main 렌더·전환 검사와 걷기 표본만. 웹 pageerror/404 N/A. Windows/PC 동기화·자연 보스전·클리어·재시도·저장호환 추가 검수 주장0.
- FILES: product_arena_view/product_field_view/product_scene, arena_shoulder/product_surface/fog_pass, bake/capture 하니스, baked PNG와 관련 docs. 공통 Main/World/Player/State/NativeScreenLighting 변경0, 타인 WIP0.
- GIT: 경로 지정stage·자기 branch 정상push/remote SHA대조 후DONE·자기worktree제거. rebase/force/main push/deploy0. 기준 원격 main은 관측만 하며 지정 기반에 임의 최신 내용 혼합0.
- VISUAL VERDICT: **PASS — 이번 LANDMARK/WALL 2시점 마감 범위**. 큰 검은 원호 제거, 불규칙 뿌리·후경 숲과 바닥의 연결/벽가 플레이어 가림/랜드마크 보존을 원본과1x로 직접 확인. 전체 CH1-1/밀집 전투/양플랫폼/AAA 완성 선언 아님.
- NEXT PASS: 밀집 전투/전체 카메라·장시간 최저60·Windows 검수는 별도 범위.
