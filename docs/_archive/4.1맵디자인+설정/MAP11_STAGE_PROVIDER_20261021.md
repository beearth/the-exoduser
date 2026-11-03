# MAP11-02 — arena 우선 StageRecipe/provider 계약·검수

STATUS=REVIEW_PENDING. 기준 main `45be76e49d0090316b91a6b7b383d81835e29192` + 인수된 MAP11-01b `b12bf9a135bdd7aa6812a9c72dddbdf9af1a81b8` 정상 merge `048c5201aca6843cf80002ed186b91e55c53051e`. 원격 DEMO11-37/43 head는 작업 시작 조회에서 없었으며, 진행 중인 로컬 담당 파일은 반입하지 않았다. 아래는 **소비자 인계용 ABI**이고 DEMO11-37·43 제품 연결 완료 주장이 아니다. 맵 아트/Main/카메라는 변경0. MAP11-03은 PC 담당으로 유지한다.

| DEMO11-37·43 이름 계약 | Marker / role | local 위치·지역·의미 |
|---|---|---|
| `map11.arena.entry` | `Markers/Entry` / `arena_entry` | (0,800), region_id=0. 아레나 입장 위치. gate 개폐·입장 trigger writer/형상은 소비자 소유이며 위치로 자동 생성0 |
| `map11.arena.boss` | `Markers/Boss` / `boss_center` | (0,0), region_id=0. 정상1-1 si0 boss 기준점. 원점은 이 유효 anchor의 실제 값이며 누락 fallback 아님 |
| `map11.arena.exit` | `Markers/Exit` / `arena_exit` | (0,−1420), region_id=0. 클리어 후 목적점. 처치·stageClear·demoEnd 정책 제공0 |
| `map11.arena.return` | `Markers/Return` / `arena_return` | (0,1320), region_id=0. 아레나 내부 안전 복귀 위치. **필드 복귀 anchor는 아님**: 필드 context는 DEMO11-37이 별도 보존, 이 좌표로 덮어쓰기0 |
| `map11.arena.region` | region_id **0**, namespace `map11.arena` | R1700 원 내부·경계 포함. 필드 NW/NE/SW/SE의 네 지역 분모/kill ledger와 별개. DEMO11-43은 `(map_instance_id,revision,region_id)`로 구별하고 필드0에 합산하지 않음 |
| identity/geometry | instance `map11.arena`, revision **1**, stage_id=0 | Y아래+/각도rad/단위world unit, local 원점=(0,0). 원 R1700/내부 solid0/clearance44, content hash 포함. 4Marker는 기존 preview 선언과 검사로 대조. 현재 preview는256분절 rim, provider는 analytic 원: 내접 근사의 최대차 약0.128unit이며 실제 제품 collider 정합은 소비자 연결 검수 대상 |

`res://scripts/maps/map11/arena_recipe.tres`가 `stage_recipe.gd` Resource schema를 사용한다. 필수 필드: schema_version=1/stage_id/instance/revision/radius/effect_extent, anchors(id·marker·role·position·facing·region_id·clearance), regions(id·key·center·radius), solids(id·center·radius·blocks_move·blocks_los), bidirectional routes(from·to·clearance). 현재 arena region은 하나만 허용한다. 범용 polygon/필드4지역/스폰/flow는 capability=false 또는 서비스 미제공이며 존재하는 척 READY로 만들지 않는다. 장식 알파로 충돌을 만들거나 적·보상·registry를 소유하지 않는다.

사용 순서는 `Provider.new().compile(recipe)` 후 `Adapter.new().bind_context(provider, owner_node, "map11.arena", 1, owner_current_guard, world_transform)`이다. owner는 실제 tree 안 Node, guard는 그 owner의 `(instance_id:String, revision:int)->bool` **읽기 전용** Callable이어야 한다. transform은 평행이동+회전만 허용하고 scale/반사/NaN은 거부한다. 준비·교체는 tick 사이에 수행하고 owner는 현재 instance/revision을 실제 context와 대조해야 한다. 새 recipe는 새 provider/revision으로 compile하며 이전 provider를 `retire()`하고 adapter를 `unbind()`한다. 재compile 금지·해제/교체된 owner/guard false/retired·revision mismatch는 NOT_READY. metadata `describe()`는 content_valid/runtime_ready/hash/범위/capability를 구분하며 매 tick 열람용이 아니다.

핫 질의는 adapter `can_move(point,r)->bool`, `is_blocked(point,r)->bool`, `line_of_sight(a,b)->bool`, `region_at(point)->int`이다. NOT_READY에서는 can_move/LOS=false, is_blocked=true, region=−1로 닫히며 `status()`로 NOT_READY를 확인한다. 이동과 LOS blocker를 각각 판정하고 미지원 hazard mask를 무시하는 인자는 제공하지 않는다. `sweep_circle(a,b,r,out_dictionary)->bool`은 실행 성공 여부를 반환한다. 성공 out에는 status=OK/hit/fraction(정규화0..1)/position(접촉점보다0.001unit 앞 안전 위치)/normal/revision, 준비 실패는 NOT_READY, 불법 시작·NaN은 INVALID_QUERY다. `out`은 caller가 재사용한다. `hit=false`와 query 실패를 혼동하지 않는다. 원 경계 접촉은 허용하고 solid 접촉은 막는다.

`anchor(id,role)`는 OK+복사한 anchor/world 위치·회전각/identity 또는 NOT_FOUND/NOT_READY를 반환한다. 없는 이름·잘못된 role은 임의 원점/최근접 대체0. anchor metadata와 `describe()`는 초기 배치·context 준비용이며 tick 경로에서 목록을 열거하지 않는다. snapshot은 author Resource와 반환 metadata의 변경으로부터 분리한다. 월드 transform 전·후 반경은 동일하다.

`legacy_boss_metrics(out)`가 명시적으로 `mw=128,mh=108,T=40`과 identity를 제공한다. 이 값은 geometry/render bounds가 아닌 **gameplay effect metric**이다. 이번 main `game.html` G16631(T40), G30697–30700(genBossArena128×108), G37938–37942의 `~~(max(mw,mh)*T*.45)`와 `min(750,maxLen*.3)`을 적용하면 fissure **2304 / 691.2**, 원본 extent=(5120,4320)다. geometry지름3400을 mw/mh에 대입0. tide maxR1750(G37949–37958)도 그대로다. 반환값을 기존 기술식 consumer에 실제 연결하는 일은 보스/DEMO 담당의 다음 통합이며 G.mw/G.mh를 이 단위에서 쓰지 않는다.

| 구현·검수 | 근거·결과·한계 |
|---|---|
| geometry/내용 검증 | 원 경계/원형 solid 연속교차식·LOS 별도 flag. 필수 anchor·고유 ID/Marker·region coverage·외부/피격반경·route 참조·중복·swept clearance를 compile 시 검사. 실제 검증된 bidirectional 저작 route 그래프에서 Entry로부터 모든 anchor 도달 여부를 BFS 검사. **자유공간의 일반 최단경로/flow 판정이 아니라 저작 루트 도달성**이며 우회가 있어도 선언 route가 막히면 오류로 고치도록 요구 |
| 직접 검사 | 신규 **54/0**, 기존4Marker 선언 대조5개 포함. 핵심 결함5종: duplicate/outside/양끝 합법 중간 sweep 충돌/끊긴 도달경로/원본 extent 변조. 잘못된 schema ID 타입에서 계속 진행할 수 있는 경로는 별도 정적 점검 후 early reject로 보강, 집중검사 **3/0**, 별도1회. 최종 ERROR/WARNING0. 첫 하니스 typed Array 대입 SCRIPT ERROR1은 원문 test-01에 보존, 해당 하니스만 수정 후 test-02; 통과 suite 반복0 |
| 120fps 질의 예산 | 기본 solid0·명시 owner callback을 거치는 adapter에서 고정10000묶음/30000질의 CPU 벽시계 **37.282ms**, 이동+LOS+sweep 묶음 평균**3.7282µs**, 정상결과30000. 균등한 혼합140질의 단순 환산 약**0.174ms**(실제 게임 부하/최악값 보장 아님), 목표 프레임8.33ms·맵 CPU1.25ms 내의 참고값. 실제 프레임/GPU·많은 solid·복잡한 guard·Main 연결 성능은 미측정. 벤치1회/로그 파일 리다이렉트 |
| 공용·성능 안전 | Main/State/World/factory/Player/카메라/전투·저장·아트·preview 변경 **0줄**, 공용 파일별 변경 범위 없음. 공용 recipe/기존 provider 수정0. 목록·그래프·hash·metadata 복사는 compile/명시 준비 API에만, scalar 질의에 get_method_list/get_script_method_list/get_children/keys/search_all/경로목록 생성0. geometry snapshot·역transform 캐시, mutable out 재사용 |
| 실행·인계 | 신규 테스트·집중검사·벤치 모두 EXODUSER-map11-02-Isolated-20261021. 매Godot pgrep≥2이면30초 대기, override 매실행 설정 후0byte. 실제 사용자 저장 접근0. 원로그 `_out/map11-02/`; 자기branch 정상push/remote SHA/DONE 뒤 자기WT제거. R tracked HEAD/INDEX/WORK 불변. 소비자 bind·자연보스전·필드 region ledger·카메라 인수는 아직 미연결 |

```text
================= MAP PRODUCTION REPORT (§23) =================
STAGE: CH1-1 arena provider (코드만, MAP11-02)
MASTER: silhouette=사용자D05 원형R1700; regions=arena0;
        main route=Entry↔Boss↔Exit / Entry↔Return; side spaces=별도 추가0
OUTER MASS: LEFT/RIGHT/TOP/SOUTH/major holes=1b 시각물 변경0·이번 검수 범위 밖
LARGE: source assets/composites/overlap/repetition=1b 변경0
MEDIUM: connections/remaining holes=이번 아트 작업0
GROUND: shadow/contamination/integration=이번 아트 작업0
PLAYABLE: arena=R1700·solid0; travel=4Marker 저작루트;
          breathing/threat/combat readability=자연 전투 미검수
LANDMARK: primary/secondary/tertiary=기존1b 변경0
CAMERA QA: START/EARLY/ARENA/SIDE L/SIDE R/LANDMARK/LATE/EXIT=
           이번 카메라/화면 변경0, 시각 PASS 주장0
TECH QA: route=저작그래프 도달성; collision=analytic circle/sweep/LOS;
         pageerror/404/seam=웹·아트 없음; loading=Resource 실제load;
         performance=위 CPU 질의벤치1회, 전체데모 FPS 미측정
FILES: stage-owned=maps/map11 신규4개·직접테스트3개·관련문서/CHANGELOG;
       concurrent touched=0; unrelated touched=0 (인수된dependency merge 별도)
GIT: staged=경로지정; commit=정상훅; push=자기branch/remoteSHA;
     deploy=0; DONE 뒤 자기WT 제거
VISUAL VERDICT: RETOUCH — 1b 시각 인수 대기 유지, provider 기술 검사를
                맵 아트 PASS로 승격하지 않음
NEXT PASS: DEMO11-37 identity/Marker/local↔world·NOT_READY/lifecycle 인수,
           DEMO11-43 별도 arena region namespace 인수; MAP11-03 카메라 PC 소유.
           필드 StageRecipe·네 지역·일반 nav는 별도 범위.
```

## 2026-10-22 PARITY-BOSS-01 분기

기존 R1700 stage_recipe/stage_provider는 레거시 프리뷰·독립 테스트용으로 보존한다. 제품 field_runtime은 web_arena 하위 공급자로 사각124×104·40px·entry1960을 사용한다. Markers/Entry·Boss·Exit·Return은 PC encounter가 읽는 동일 node 경로다. 상세 경계·수치·원본차이·검수는 [대응표](../engine/PARITY_BOSS_01_20261022.md)를 따른다.
