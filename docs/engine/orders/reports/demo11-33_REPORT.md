# DEMO11-33 — 1-1 곰치 family 실제 tick·탄·물기/사망·aggro 인계

기준 `origin/main 0138c5bb9188d27cee10cb1a901d075092ddb88f` + DEMO11-31 `76bcae8d216d2242984c70a3b4fad45ae3e8a3b4` 정상 merge `50f31d373a1a9d7d76cec7fb798252829e44366e`. 문서 충돌은 UI_FOUNDATION/WORK_BOARD 양쪽 내용을 보존했다. 32 작업창 파일은 읽기만 했고 merge/수정하지 않았다. 원본 game.html SHA256 `4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4` 불변. 아래 변경 줄은 의존 merge 이후 자기 구현 diff 기준이다.

| 공개 계약·근거·검증 | 구현·인수 경계 |
|---|---|
| `Main.bind_native_demo_worms(provider:Node2D,markers:Array)->bool` | 실제 World 하위 provider와 고유 Marker2D **4개** 최초1회. Marker global_position으로 x/y/home/tp 초기화. 원본 `_WM_SITES` 좌표·맵 지형 복제0. 실제 MAP11 Marker 배치/호출은 후행. Main은 설치하지만 provider 없이는 dormant. |
| `Main.native_demo_worms.read_targets()->Array`, `snapshot()->Dictionary` | 같은 실제 State G._worms의 4슬롯·기존 World native phase/공유 RNG. 원본 G61203–61328: HP~~(150+lv×45), ATK~~((16+lv×2.5)×1.2), r56·기상≤1000·emerge/retreat7·shoot36·2발·hide108/54·RNG2×최대28. null 슬롯 유지·빈 배열 재생성 금지·stage0 arena에서 탄/개체 회수. 웹 전체 update 순서 동치 주장0. |
| `registry.bind_field_auxiliary(owner,reader,aggro=Callable())->bool` | 31의 동일 registry/pool/출생식/탄 owner 재사용. 실제 field owner를 entry별 보존하며 공통 native serial/sp 다르면 거부. 31 기본 owner 경로 유지·두 번째 registry0. G61214–61219 raw는 F1/#ff2233·8·~~atk1.5·life240·sz6.4/r12·titanEye/_typed. 실제 BC09 출생 뒤 physical/E 분류·속도5(300px/s)·homing/drop 면제. **60f warning 없이 즉시 출생**, 화면 밖은 발사만 억제하고 shots++/AI는 원문대로 진행. |
| `family.bind_aggro_reader(owner,handler)->bool` → handler `(origin:Vector2)->{ready:bool,active:bool,target:Node2D}` | G16886–16900의 실제 PC aggro owner를 매 탄 출생 위치/이동 전 위치로 조회. active이면 Main 하위 실제 target Node2D만 허용. WM AI/잠복 목적지는 실제 Player 기준 유지. known scarecrow 활성인데 reader가 없거나 소실되면 fail-closed. target 선택식/가짜 Node 복제0. |
| `family.bind_protected_contact(owner,handler)->bool` → handler `(request:Dictionary)->{ack:true,committed:bool,player_after:Dictionary}` | G61244–61259: `{kind:worm_bite,enemy,player,scale,damage,context,source_lines}`. pop .45/contact .5, 원문 contactCd60. **PC가** 나머지 생존/dash/io/gw guard·hurtP·swept4px 밀기·KB28를 집행. 실제 Player x/y/r/iframes/s/hp readback 일치 필요. 미바인딩은 actor 상태 commit 전 보류, 잘못된 receipt는 해당 actor 격리/재생 금지. Mac 피해/이동/패링 writer0. 테스트 bridge가 기존 Player.receive_damage를 실제 호출해 HP 감소 검증했으며 자연 전투 PC producer는 후행. |
| `family.bind_hit_owner(owner)->bool`; `apply_hit(owner,index,damage)->{accepted,hp,dead,rewards_written:false}`; `hurt_at(owner,center,radius,damage,hit_set,parry_shot=false)->int` | G18628–18757: hideT>54 면역·HP>0, max(1,ToInt32(damage))·hitCd8·HP≤0 슬롯null. hitSet 선등록 후 CD 검사, 같은 공격 재시도0·parry 표시는 FX/count만. 기존31 `i32` 재사용. `_fbDone`/일반 XP·loot·지역 kill 기록0. PC 공격/패링 producer가 실제 허가 owner로 호출할 인터페이스만 제공하며 보호 경로 변경0. |
| 시각·연출 | 원본 worm_burrow1/2 PNG byte 그대로 복사. G61330–61360: **face별 시트**·4×3·150px·원점(-75,-120), asleep/hide>54 숨김. 전용 잠복 예고 ring/E문구·HP바·TP/피격/사망 FX·SFX는 presentation_requested consumer 후행이며 화면 마감 미인수. |
| 공용 변경 범위 | Main **+6/−0**:123·358·3098–3101. 기존31 registry **+45/−12**:10·60–79·81–85·87·157·183–193·217–219·226–228. State/World/Player/PC 피해·Q/E·2_3/저장/맵/32 파일 **0줄**. 새 모델/collection/view·새 테스트/원문 시트만 추가. tick 경로 get_method_list/get_property_list/get_signal_list **0**. |
| 원문·실제 신규 | **7,874/0**, ERROR0·skip0. 원문10함수/2,634 fixture의 초기·상태·RNG·실제 raw탄·HP/CD와 실제 registry Node/실제 aggro 이동·Main/World tick·기존 PC receive_damage 호출·HP 감소·쿨다운·실제 사망 슬롯을 검증. 원문/제품 양쪽 **동일 JSON 정규화** 후 비교(한쪽만 재직렬화하면 sin(π) 미소수의 마지막 비트가 달라짐), 임의 epsilon 추가0. |
| 관련 기존 회귀 | 파일 byte 무수정·각1회 **1,465/0**:31=1,402·31 PC경계11·35탄29·자동tick14·P3 실제9. 기능 합 **9,339/0**. 최종 ERROR0·skip0. Main 포함 3suite 기존 Camera2D interpolation WARNING 원문 보존. |
| 120fps 예산1회 | **265/0 clean PASS**, ERROR/WARNING/skip0. 실제 WM4개체+실탄256으로 시작, AI가8발 추가해264개·motion70,544회. warmup30+물리240틱/120Hz, 단조 벽시계 mean **1.633533ms**·p95 **1.891ms**·max **2.460ms<8.333333ms**, wall1995.680ms. open-wall/state fixture, AI/aggro/registry 실제 서비스 비용이며 **실제 새 맵·PC 접촉·전체 Main/렌더 FPS 미측정**. 재벤치0. |

31·32·33의 공통 helper는 **세 브랜치 병합 후 별도 단위**로 아래에 모으는 것을 제안한다. 이번 제품은 31 i32/World/registry를 직접 재사용하며 32 WIP를 건드리거나 별도 공통 계층을 신설하지 않았다.

| 통합 후보·모을 파일(후행 제안) | 31·32·33 공통점·보존할 차이 |
|---|---|
| `native_fieldboss_source_math.gd` | 31 angler_model.i32를 현재33도 사용. 32 fire_devil_tick의 같은 ToInt32만 이 파일로 이동 후보. 장별 공격/HP/성급 식은 합치지 않음. |
| `native_fieldboss_provider.gd` | Main/World liveness·Marker 고유성·4슬롯/원본좌표 금지·단일 바인딩 검사. family별 Marker 수/이름·초기 레코드/배열 생존 정책은 각 actor 유지. |
| 기존 `native_demo11_boss_projectiles.gd`의 공개 field facade → `native_fieldboss_projectiles.gd` | registry는 계속 하나. 31 field owner +33 보조owner/실제 origin별 PC aggro를 공통 공개 접점으로 정리하고32 private birth 호출을 이관 후보. WM 즉시탄과31/32 warning/energy·속성/수명/전용 carrier를 평탄화하지 않음. |
| `native_fieldboss_contact_bridge.gd` | 실제 owner/callable·PC receipt·Player readback 검증만 공통화. 31 몸/TP강타,32 착지,33 pop/contactCd60의 전용 요청/guard 유지. Player 피해/패링/KB 집행은 PC 소유. |
| `native_fieldboss_hit_collection.gd` | 허가 owner·hitSet/CD8·슬롯null/target 조회 검사 후보. 31은 **PC HP/final readback 전용**이므로32/33 HP writer로 자동 통일 금지. family별 면역·fbDone·보상 차이는 별도 정책. |
| `native_fieldboss_clock_adapter.gd` | 31/33 native World phase와32 source-frame continuation의 단일 권위·pending/중복serial 검사 정리 후보. 원문 prefix/ack 순서·32 pump와33 invalid receipt 격리 보존. 먼저 실제 통합 clock 계약을 확정해야 하며 현재 동치 인수 아님. |

실패 기록을 지우지 않았다. new-01은 oracle EL 상수 누락과 aggro 방향 기대값 오류로3실패/28건, new-retry-02와 diagnostic-03은 한쪽 JSON 정규화로702실패/7,874건. 제품 상태의 첫 차이를 JSON으로 출력해 동일 미소수임을 확인한 뒤 양쪽 동일 정규화로 **실패 신규 suite만** 재실행했다. 이후 기존 회귀/벤치는 각각1회이며 검사 삭제/허용오차/예외를 PASS로 계산하지 않았다. 자산 import1회 exit0/ERROR0. 실행 전 매번 exact pgrep count≥2면30초 대기, Node 명시 --node-bin/--source-game·OS.execute UTF-8 chunk join 사용.

최종 인수 경계: 실제 맵 Marker 설치·PC 공격/접촉/aggro producer 연결, 플레이어 피해/패링의 자연 전투·전용 연출/사운드/전체 게임120fps·Windows 인수는 후행/미확인. 곰치는 앵글러 fbDone/gate를 대신 완료하지 않는다. 원로그 `~/exoduser-wt/_out/demo11-33/`, 자기 branch 일반 push/원격 SHA 확인·DONE·worktree/cache 제거·R 불변은 final-receipt.json에 기록한다.
