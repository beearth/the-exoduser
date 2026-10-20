# DEMO11-43 — StageProvider 소환·지역 공통 접점 v1

기준 main `969c194e6e912128f29b3058982c113c5feecccf`. MAP11-01 원격 tip `3c2b1ea45bd103564f03898c5000b4f78b87844d`은 아레나 프리뷰만 포함한다. 지시의 StageProvider 설계서는 `codex/map11-plan-20261021 b085407d474605141d3c039330489ad414efdfde`의 `MAP11_NEW_MAP_LOGIC_PLAN_20261021.md` **현재 §7**에서 확인했다(§6은 에셋 목록). 이 브랜치는 읽기 참조만 하며 merge하지 않았다. 아래 반환형은 그 제안의 **소비자 ABI v1**이며 MAP11 제품 provider 구현·서명 완료를 주장하지 않는다.

공통 adapter는 맵 제작·etype 생성·적 registry·피해를 소유하지 않는다. P3-002의 count/State writer와 P3-003의 region writer·80%/FB/문지기 보너스 정책을 그대로 재사용한다. 기존 Main 부팅은 그대로이며 MAP11 owner가 준비된 provider를 명시적으로 `Main.bind_native_spawn_stage_provider(provider)`에 제공해야 한다. 성공 시 `Main.native_stage_spawn_adapter`가 후행 consumer용 handle이다. 소환 시작 전 1회만 bind하며 재바인딩은 거절한다.

| API/데이터 | 소비자 ABI v1·실패 경계 |
|---|---|
| provider | 실제 World의 자손 Node2D. 최초 한 번 describe/anchors/region_sites/spawn_budget_manifest/spawn_sites/region_at 메서드를 검사. tick/요청/킬 경로 목록 생성 API 없음 |
| describe() | `{content_valid:true,runtime_ready:true,stage_id:String,map_instance_id:String,revision:String,stage_index:0}`. 문자열 비어 있음·다른 stage·stale instance/revision·provider 해제는 NOT_READY. content 검증과 runtime 연결 상태를 별도로 요구 |
| anchors("hole") | Array of `{id:String,marker:Marker2D,region_id:int,size:number>0,room:int}`. 살아있는 provider 자손 Marker만 허용, Vector2 대체 금지. region_at(marker.global_position)와 명시 region_id 일치 필요. 좌표/T40/맵 중점으로 ID를 추론하지 않음 |
| region_sites() | `{regions:[{id:int,name_ko:String,name_en:String,fb_index:int}×4],gate_region_id:int}`. 지역 ID와 fb_index 각각 0..3의 유일 집합. 명칭/담당 FB/문지기 지역은 MAP11가 명시하며 좌표 fallback 없음 |
| spawn_budget_manifest() | `{revision:String,groups:[{hole_id:String,spawn_group_id:String,region_id:int,total:int}]}`. hole별 정확히 1그룹·중복 ID 금지·미귀속 hole 금지. total은 P3-002 `spawn_hole_count(size,0)`와 일치해야 함. S8/M15/L15는 G31030의 중첩 ceil 그대로. 기존14굴/168·좌표를 새 맵 요구로 강제하지 않음 |
| commit | 사전검증 후 P3-002가 실제 State writer로 G.spawnHoles/총량을 1회 기록, P3-003이 같은 G의 지역 total을 region_id로 배분. 이 제품 adapter가 설치한 holes는 Marker에서 해석한 값뿐. legacy 템플릿 재배치·advance_native 우회는 차단. 실제 etype 소비자 후행이므로 scheduler 휴면·actor 생성0·RNG소비0 |
| request_spawn(group_id,request) | 요청 `{etype:int,radius:finite>0,...owner 입력}`을 복사하고 hole/group/region/revision을 붙여 provider.spawn_sites("hole",query)에 전달. provider는 `{ready:true,position:Vector2,site_id:hole_id,region_id:int,revision:String}`를 반환. provider가 해당 반경의 geometry 적법성을 소유. 누락·잘못된 receipt·stale Marker에 원점/최근접/옛 좌표 fallback 없음. etype/RNG 선택·실제 factory/등록은 여기서 실행하지 않음 |
| register_actor_origin(actor,group_id) | 이미 World registry에 등록된 살아있는 actor만 허용. actor 생성을 대신하지 않음. weakref+instance ID로 origin group/region을 고정, 재귀속 거절. 현재 제품에서 자동 호출 없음: 실제 etype 등록 후행 owner가 1회 호출 |
| record_actor_kill(actor) | 기존 PC kill caller→NativeRegions.record_actor_kill이 adapter로 전달. 같은 World에 등록된 alive=false/hp≤0·비보스·origin이 있는 actor만 지역 kills+1. 중복 death 거절, 이동/사망좌표와 관계없이 origin ID 귀속. G.kills/HP/보상/피해에는 쓰지 않음. prefix를 rollback·재처치하지 않음 |
| 지역 진행/표시 | provider region_at으로 입장 ID를 받고 기존15프레임·80%−epsilon·FB 미스폰 생존·gate 보너스 정책 재사용. legacy T40/180타일 enable·분면 귀속을 새 provider에 적용하지 않음. 옛 분면/사이트 미니맵 overlay는 provider bind 후 그리지 않음. MAP11 polygon overlay는 후행, 신규 화면·문자열 추가0 |

G60709–60710의 분모는 **예정 소환 수**이며 actor 등록/요청/처치마다 바꾸지 않는다. G60728–60732의 home 귀속은 새 맵에서 immutable origin region ID로 표현한다. 원본 좌표를 바꾼 것이 아니라 새 저작 지도에 적용할 귀속 접점을 추가한 것이다. 기존 P3-002/003 legacy 경로는 provider bind 전 회귀 계약을 유지한다.

실제 MAP11 provider/geometry 승인, etype 선택→constructor→registry→origin 등록, 기존 source tick 순서로 scheduler 재개, 동적 그룹 추가/취소 receipt(이번에는 거절/미지원), 새 polygon 미니맵은 후행이다. 현재 `request_spawn` 성공은 **합법 후보를 provider에서 받았다는 접점 receipt**이며 적 생성 성공·자연 전투·전체 맵 완료를 뜻하지 않는다. provider 자체 geometry 검증은 MAP11 소유이며 이번 fixture 테스트로 실맵 적법성을 증명하지 않는다.

검증·성능 결과와 공용 변경 범위: [DEMO11-43 보고서](orders/reports/demo11-43_REPORT.md). 제품 화면/폰트/번역/에셋/저장 형식/전투 핵심 변경0.

## 2026-10-21 DEMO11-47j 제품 부팅 연결

기존 위 ABI 설명의 당시 미연결 이력과 구분한다. 현재 Main의 MAP11 제품 설치 직후 `NativeSpawnHoleSystem.configure`만 실행하고 legacy `install_placement`는 호출하지 않는다. `NativeRegions` 구성 → 실제 `world.map11_provider`로 adapter 예산 설치 → encounter.configure → transport.bind_gate_owner → 기존 natural base scheduler 활성 순서다. 실패한 선행 단계 뒤의 설치를 진행하지 않는다. 난수 재추첨·좌표 생성·HP writer 추가는 없다.

| 선택된 etype | 현재 source scheduler의 인계 |
|---|---|
| 0 | 기존 natural base `spawn_selected` 경로 |
| 1, 4, 5, 6 | 기존 `Main.request_native_etype_a_spawn`에 같은 source RNG/literal/spawn_n/group 전달. `register_actor_origin`은 기존 실제 admission이 담당 |
| 나머지 | 기존 NOT_READY/HOLD 계약 유지. 전체 29종 자연 스케줄러 완성으로 주장하지 않음 |

실제 처치 및 gate 개방 여부는 [47j 보고서](orders/reports/demo11-47j_REPORT.md)의 E2E와 집중 검증을 구분해 확인한다. provider/region binding만으로 `_fbDone`·region clears·보스 사망을 참으로 만들지 않는다.
