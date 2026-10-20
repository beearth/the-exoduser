# 1-1 데모 코드 완성 잔여 목록 — demo11-gap

> 2026-10-21 정정: 기존 물약 모듈은 **QS-01뿐**이며 QS-02/03은 존재하지 않는다. 자동 HP는 **DEMO11-25b**가 구현했다. 수동 포션 퀵슬롯은 [2_8 현행 첫 정책 절](../2_8%20퀵슬롯+물약시스템/2_8%20퀵슬롯+물약시스템.md)의 2026-10-10 사용자 지시로 폐지되어 **DEMO11-26 실행 단위를 삭제**했다(번호 재사용0, 구세이브 호환 QSLOTS/qsAuto 삭제 지시 아님). 아래 원본 추적·당시 스냅샷을 보존하며 최신 진행 상태는 [현황판](DEMO11_STATUS_20261021.md)을 따른다.


## 0. 기준과 판정

| 항목 | 기준 |
|---|---|
| 사용자 새 방침 | **2026-10-21: 1-1 데모 코드 우선, 맵 지형은 새로 제작. main의 기존 맵 룩(광원·그림자·흔들림)은 유지·재사용**. 웹 맵 추가 이식·룩 재제작은 잔여 코드 작업에서 제외 |
| 고정 소스 | fetch 후 origin/main `0105159934d0c2a8b167bd51518dca1e0fafe50a`. G=`game.html`, I=`index.html`, 아래 행은 이 commit의 1-based 행. R의 HTML이나 미병합 브랜치를 main으로 세지 않음 |
| 원문 동일성 | G SHA256 `4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4`; I `36008f72723dbcbf1ae7b6af6b08dfe6299962e2445261139b6237082a24cf12` |
| 선행 읽기 | WORK_BOARD 역할/진행/보존·공용 접점, FEATURE_INVENTORY 기준·1061행 taxonomy, 기존 SOURCE_TRACE의 원본/현재 Godot/후속 단위 절. 상세 수식·데이터는 아래 기존 추적을 참조하고 재전사하지 않음 |
| 최신성 | FEATURE_INVENTORY는 `2845f96e` snapshot이고 진척률을 재사용하지 않음. WORK_BOARD의 “병합” 문구도 실제 main 파일·호출 경로와 별개. 현재 제품 연결을 먼저 확인 |
| 이번 작업 | 정적 추적·문서만. **Godot 실행·테스트·실창·청취 0**. 이번에 새로 얻은 실행 PASS 없음. 미확인인 실제 플레이/PC 빌드 상태를 완료로 승격하지 않음 |
| 소유·보호 | 코드·테스트·Main/State·저장·설계/LOCK 수정0. Q/E·2_3·저장 형식 변경을 승인하는 문서가 아님. 후속 공용 연결은 담당과 정확 범위를 총괄이 배정해야 함 |

| 상태 | 이 문서의 엄격한 의미 |
|---|---|
| 완료(Main에 연결) | **행에 적힌 좁은 경계**의 실제 Main/World/Player 경로를 정적으로 확인. 시스템 전체 동치·시각 품질·실플레이 완료 뜻 아님 |
| 독립 모듈만(Main 미연결) | 계산/producer/restore/backend가 존재하지만 해당 사용자 기능의 자연 호출·writer·화면이 없음. 데이터·fixture·모듈끼리 호출은 Main 연결이 아님 |
| 미착수 | 그 경계의 실행 소비자를 현재 main에서 찾지 못함. 일부 인접 모듈·카탈로그 존재는 별도 표기 |
| 통합 결정 대기 | 수락/진행 브랜치와 main 불일치, 보호 owner/새 맵과의 계약 등 선결 결정이 있음. **구현 완료라는 뜻도, 새 중복 구현 배정이라는 뜻도 아님** |

## 1. 원본 데모 범위와 제외

| 경로/조건 | 원본 행·실제 계약 | 데모 처리 |
|---|---|---|
| 빌드 판정 | I1258·1271 `_LOBBY_BUILD=...||'demo'`, G16645–16650 `_BIC`/`_DEMO_MODE`/상한100/마지막stage0 | 쿼리 bic 자체가 full/demo 빌드를 바꾸지 않음. 정상 신규 Lv1·stage0, 1-1 종료 |
| 로컬 입장 | I2818–2822·2864·2916–2931·3486–3557 | demo는 로그인 세션이 있어도 브라우저 로컬 최대5슬롯·active 교환. 온라인 로그인/API를 데모 필수로 새로 만들지 않음 |
| 캐릭터 | I3194–3250 CHAR_VISUALS·comingSoon, G62176–62193 신규 장비/스킬 | 정상 신규 전사는 char0. 실버테일 등 잠금 외형을 모두 플레이 가능하게 만드는 작업은 제외. 기존 슬롯 charIdx 복원은 SAVE 계약에 따라 별도 확인 |
| 신규/이어하기 | G62111–62213 `_startDemoNew`: 초기값→local dbSave override→dbRestore→미로드만 시작 지급→initStage→인트로/이어하기→자동저장 | 단순 fresh constructor를 demo 저장 로드로 간주하지 않음. 이미 존재하는 신규 초기화는 재작성하지 않음. 공유창고는 G48537–48551 local 공유 저장 별도 경로 |
| 정상/개발 분기 | G61936–62110 `_startDemoTest`, 62216 이후 forge lab, 63884–63892 `_dLv500`만 시험 캐릭터/BIC는 정상 신규 | `_dLv500`·만렙 랩·bosstest·MAP_QA·강제 컷신·개발 재화는 정상 데모 필수에서 제외. 개발용 슬롯을 일반 저장으로 섞지 않음 |
| 레벨·성장 | G43128–43174: 데모 entry/loop cap100, XP 1/3·bonus, SP+3/짝수AP+1·20%회복·예약 패시브·저장 | Lv99→100과 이미100에서 추가XP를 각각 검수. Native 현재 1000 gate로 대체 불가 |
| 스킬·합체 | G44161–44224 55등록, reqLv>100 4종; G16649/44608–44629 demo 허용 합체22키, G47274–47326·47678 이후 학습/강화 | 51개는 **레벨 조건을 통과하는 후보**일 뿐: hidden/requires/흡수/해금·재화까지 도달성 확인 후 조건부 단위 활성화. 시작4종만으로 전체 데모 스킬 완료 아님 |
| 적 생성 | G30969–31025 HELL_SPAWN[0] 31항목, opening 제외[2,22,30,43] 후 **29 etype**; G35648–35688 소환굴 실제 rollEtype | 다른 장 이름/스킨의 etype47도 hell0 풀에 있으므로 장 번호 추정으로 제외 금지. 초기 고정16은 검증 표본이지 데모 전투 분모 아님 |
| 정예 | G31033–31097: hell0 자연 magic3%/rare0/champion0, tier1은 공격접사 우선1개→M29/M30. G31620–31636 문지기/호위 후대입 | 자연 정예의 M31/M32·후속장 오라까지 일괄 구현하지 않음. 강제 elite3 문지기를 RARE_ETYPE90..99로 바꾸지 않음 |
| 조건부 레어 | G31424–31429·31471–31475의 99/90..98 추첨은 room/별도 field 스폰 경로. G31574–31577은 tileRLE일 때 room/corridor 스폰을 생략 | 현재 기본 소환굴 경로에 레어10종을 무조건 추가하지 않음. **새 맵의 스폰 코드 계약에서 room 분기를 채택할 경우만** 별도 범위 결정. 레어=후속장이라는 이유로 무조건 삭제도 금지 |
| 필드 전투→보스 | G60973–61067 앵글러, 61237–61442 곰치, 61443–61779 화마귀. G41869–41916 지역4개+`_fbDone`→문/arena | 앵글러는 클리어 진행 필수 조건. 곰치/화마귀도 stage0 자연 전투 코드이므로 맵 장식으로 버리지 않음. 고정 사이트 좌표는 이식 대상 아님 |
| 보스·종료 | G30749–30790 arena·37701–38442 AI/start·40445–41183 상태, G41921–42022 클리어·42024 이후 결과, G43896·63663 데모 종료 | si0 일반 다크드루이드만. si3 피날레·1-2~1-4 보스·다음 장 로더는 제외. 첫 클리어 뒤 stage1을 생성하지 않음 |
| 도달 불가 잔존 | G9390·17055·17120은 stage3와 LAST_STAGE=0을 동시에 요구 | 현재 정상 demo의 필수 동작으로 확대하지 않음. 원본 버그 추정 수리도 이번 범위 아님 |

**맵이 코드에 제공할 인터페이스 한 줄:** 플레이어/적·굴·상호작용의 스폰 anchor와 식별자, 경계·원형 충돌/벽·시야·flow 질의, 지역ID/처치분모, 보스 arena 진입/복귀 anchor와 출구 trigger를 제공하며 크기·타일·좌표·지형·룩·원본 배치·맵 exporter/에셋 이식은 요구하지 않는다.

| 확실한 제외 | 근거·주의 |
|---|---|
| stage1..34 (1-2 이후 전부)·2장 이후 catalog/적/보스 확장·챕터전환·NG+·전체35맵 | G16648 LAST_STAGE0·43896. 이미 있는 공용 함수는 재사용해도 후속장 기능 제작은 후순위 |
| Lv101 이상 성장/초월·일일 초월 gate·300/500/700 자동 해금 | G43137/43148·43169–43171. high-level 저장·개발 캐릭터 이관 정책은 보호 SAVE 담당 판단 |
| blueShot(300), burstLoop(700), ghostXbowTurret(500), timeWarp(500) 정상 학습/발동 | G44216·44217·44221·44222 reqLv. **voidScarecrow는 자동해금700이 있어도 등록 reqLv가 없으므로 이를 근거로 제외 금지** |
| demo 금지 합체10키·금지어픽스7종의 정상 신규 생성 | G16649–16650·15137·44610. 금지7=`sharpAtk,brutalAtk,ruinAtk,overkilDmg,staggerExplosion,parryExplosion,elemConvert`. 장비 rarity가 높다는 이유만으로 다른 효과를 모두 제외하지 않음 |
| 신규 온라인 계정·Google 인증·서버5슬롯/API·Steam 실제 배포/앱등록 | I2916–2917 로컬 demo gate. G63669–63672 위시리스트 URL은 현재 Steam 홈 TODO: 원문 연결과 실제 상점 URL 결정은 별개 |
| 맵 이식·베이크·원본 배치·후속장 맵 provenance 수리 | 새 방침으로 제외. CH-MAP-PIN/CH1~CH4 맵 이식 큐를 데모 코드 잔여에 더하지 않음. 이미 쓰는 충돌/스폰 서비스의 코드 분리는 남음 |

## 2. 사용자 흐름별 원본·main 상태

아래 N 경로는 `godot/` 상대. 세분화한 완료 행과 그 옆의 잔여 행을 합쳐 시스템 전체 완료로 계산하지 않는다. 이번 실행 PASS 수·완료율은 산출하지 않는다.

| ID | 코드 경계 | 원본 행 | main 상태 | 실제 근거·남은 것 / 재사용 작업 |
|---|---|---|---|---|
| D01 | 데모 빌드·stage0·cap·제외 gate의 단일 실행 권위 | G16645–16650·43137/43148·43896; I1258 | 통합 결정 대기 | `project.godot:7`은 main 직행. State:523–557에1000 gate만; META-06 cap policy는 독립. DEMO11-01/20 |
| D02 | 로비/타이틀·오프라인 진입·신규/이어하기 | I578–737·2818–2965·3522–3619·4346–4348 | 미착수 | native lobby scene 없음. 간이 OptionButton은 원본 로비가 아님. LOBBY·SV-LOBBY-VIEW 참조 |
| D03 | 5슬롯·active 교환·삭제·저장실패/이름 UI | I3486–3557·3598 이후; G62111–62173 | 독립 모듈만(Main 미연결) | `port_modules/save_adapter/source_slot_reader.gd`·collector/primitive/restore 존재. Main 소비/제품 IO 없음; 저장 형식 새 설계 금지 |
| D04 | 신규 실제 P/G/INV·시작 장비/스킬·자원 구성 | G29016·62112–62197 | 완료(Main에 연결) | `scripts/main.gd:137–183,246–249`→State/initialization/resource. 시작 지급·캐릭터0 초기화의 좁은 경계. 저장 복원 아님 |
| D05 | 생성 char0/comingSoon·이름 저장·스토리 인계 | I3194–3250·3402–3424·4346–4348 | 미착수 | main:1536–1602의0/1 간이선택은 생성/저장 UI 아님. 온라인·잠긴 캐릭터 제작 제외 |
| D06 | 로비 세계관/전사 영상·게임 INTRO·자막/skip 상태 | I2354–2701·3402–3424; G62588–63204 | 미착수 | 원본 LOBBY 층 구분 그대로. 네메시아/디로이/핵터 대사→기상 연결·cutsceneDone 미완. 네이티브 영상 방식/자산은 총괄 결정 필요 |
| D07 | 기상4컷·키가이드→커튼→첫 전투 | G63209–63440 | 완료(Main에 연결) | main:281→`native_intro_curtain_sequence.gd:164–252`, `native_intro_key_guide_panel.gd`. P2-001i/P2-007a 의존. 앞단 영화 전체와 구분 |
| D08 | 레슨 기본공격·Q step0·가시덫 step8 | G63209–63440; 기존 parry-lesson source 참조 | 완료(Main에 연결) | `native_parry_lesson_flow.gd:171,221–257,356–400`; 나머지는 아래 D09. snapshot의 옛 unported 문자열만으로 이미 구현된 step0/8을 재배정하지 않음 |
| D09 | 레슨 E/다종탄·사슬·전격이동·분노1..7 | G14 parry-lesson.js 로드·G38470·12881 이후 | 통합 결정 대기 | `native_parry_lesson_flow.gd:38–45 STEP_HALTS`에실제정지. allows owner/입력 보호. P2-001l 유지·해당 전투 소비자 먼저 필요 |
| D10 | 이동·일반 충돌·기본 LMB/기검참·fireball 일부 | G6254·12028·32200–32985 | 완료(Main에 연결) | `player.gd` tick/공격→main:1456–1510·fireball phase/World consumer. 실제 현재 무기 reader 존재. 모든 무기/상태 동치 아님 |
| D11 | 사슬/돌진·전격이동·분노 발동 | G12881·45418 이후·레슨 조건 | 미착수 | Main input snapshot:1689의미지원; skill slots:827 Shift 미보유. 단순 이동/Space giantSlam과 원본 이동/분노 키 우선순위 구분 |
| D12 | Q/E 현재 허용 carrier 반사·자원 일부 | G38470·Q/E 원본 보호 | 완료(Main에 연결) | main:1187–1327·1692–1846, Q adapter/Player. “full_doparry:false/full_e_parity:false”; 아래 D13의 전체판정과 구분 |
| D13 | Q 홀딩/블랙 자연입장·E 물리5종·방패충전·기폭/평화·보스 접촉 | G16911·38470·43415 | 통합 결정 대기 | main:1221·1689·1846에서 남은 경계 명시. 보호 owner 승인·같은 writer 재사용, E에 blackBean 패링 부여 금지 |
| D14 | 시작4종 자연 발동·리젠 | G62185–62193·35912–36715 | 완료(Main에 연결) | `native_skill_slots.gd:146–159,212,303,345,511,826` giantSlam/spikeTrap/holyDome/iceOrb; main:766 이후 리젠. 고정키 4cast이지 일반 슬롯 dispatcher 아님 |
| D15 | K/L 학습·강화·슬롯·추천·합체 UI/효과 | G3913·44161–48193,44608–44629 | 통합 결정 대기 | **[1-1 필수 연결] PC/Mac 집행 권한 사용자 결정 없음.** `skill_management_source/{catalog,slot_rules,learn,upgrade,refund,batch_recommend,fusion_rules,fuse_commit}`·cost는 존재. Main/HUD 호출0; 51후보/22합체의 실제 도달성+각 효과 필요 웹 전투 스킬 창은 PC 개편 중; Godot UI는 새 레이아웃 확정/인수에 의존(개편 branch·SHA 미확인). |
| D16 | 처치 XP·악의·기본 레벨 증가·SP/AP·HP/ST/MP회복 | G43103–43174 | 완료(Main에 연결) | hurte→State:523–557·resource level heal·HUD. cap100/큐/연출/저장은 아래 D17·D30; 초월 구현을 요구하지 않음 |
| D17 | demo XP cap100·스탯/AP 투자·예약 패시브·성장 연출 | G43137–43174·51219–51260 | 통합 결정 대기 | **[1-1 필수 연결] PC/Mac 집행 권한 사용자 결정 없음.** `native_meta_exp_gate_policy.gd:7,28–49`·point/passive_queue 존재. State는1000만검사·큐와levelSFX/save 미이식 표기. 정책 재작성 없이 실제 owner 연결 |
| D18 | 초기 허용 적·일반 hurtE·피격·일부 탄 | G31120·42110·43415 | 완료(Main에 연결) | World:3037–3057→factory:151–179, Player:1031–1045. 초기 정확 profile 일부만. 새 맵의 임의 동등 actor admission·모든 상태/속성 완료 아님 |
| D19 | 소환굴29타입·초기 미지원·동적spawn 정상 전투 | G30969–31025·31608–31655·35648–35688 | 통합 결정 대기 | **P2-008b `codex/p2-008b-ch1-enemies-pc-20261020` 최신 `b406e4bc`: order11·order9 등록, 미검수·미병합(PC 제공). 초기16 지원9→11은 후보이며 완료 아님.** factory exact record 가드와 World:2941의 type7 late 설치 API는 범용 생성기 아님. 기존 actor 통합은 대기, 범용 admission은 미착수. §4 id별 검증 후 재사용 |
| D20 | 현재 etype0 소환굴·지역귀속/분모·정화 배너의 연결 경계 | G35648–35694·60697–60968 | 완료(Main에 연결) | main:267·269–275→`native_spawn_hole_system.gd`/`native_regions.gd:42,106,118,143`. 현재 소환굴 runtime etype0 제한 등 원문전체 동치와 새 맵 분리 작업은 남음 |
| D21 | hell0 정예M29/M30·강제 문지기/호위 전투 | G31033–31167·31620–31636 | 독립 모듈만(Main 미연결) | `enemy_mod_m29.gd`·`native_m30_modifier.gd`·type3/type7조립 일부. 전체 natural actor pipeline·같은tick lock·Q/E actual서비스 연결 미완; EL 추적 재사용 |
| D22 | 앵글러/화마귀/곰치 전투·필드탄·처치/기상 | G18628–18755·60969–61779 | 미착수 | FIELDBOSS 추적 존재, 해당 제품 전투 owner 없음. `_fbDone`와 보스 개방을 생략해 “완료” 처리 금지 |
| D23 | stage0 보스 catalog/선택·phase/start/근접/control | G9820·16688·37701–38442·40837–41183 | 독립 모듈만(Main 미연결) | `native_ch1_boss_{catalog,spawn_contract,utility,selector,phase,pattern_start,melee_states,control_states}.gd`. primitive→actor/실제 피해/queue·일반보스 부활 통합 없음 |
| D24 | BC08/09 이동·탄 producer 및 정정 체인 | G38315–38371·40562–40569·40646–40662·41185–41205·37080–37126 | 통합 결정 대기 | main에movement_states/projectile_patterns 없음. 수락된BC08 `66ff67a0`→BC09 `2c29b697`→BC-INTEG `adc90ec7`에존재. 중복 작성 금지; 3장 facade는 데모 불필요 |
| D25 | 보스 실제 actor·탄 등록·피해/패링·사망/arena완료 | G30749–30790·37701 이후·42110·41921 | 통합 결정 대기 | BC packet은 `full_tick_complete:false`/보호 요청. Main/World 실제 실행·boss HP/poise owner가 있어야 함. 과거 독립 assertion 수는 실전 인수 아님 |
| D26 | 드랍 roll·보상 journal | G32002–32034·43103–43116 | 완료(Main에 연결) | hurte:691–760·kill_reward/drop_item_source·State drop bags. 바닥 표시/줍기는 아래 D27 |
| D27 | 바닥 표시·거리/필터·줍기·INV반입·아이템 음 | G32002·41449·16398 | 통합 결정 대기 | WORK_BOARD P2-006a main병합 표기와달리 현재main native_world_drops·pickup제품파일/소비자미발견; hurte:734에floor_item_render_pickup unported. P2-006b 진행분 먼저 회수/확인 |
| D28 | INV 가방·장비UI·장착/해제·재계산/비교·효과 | G16273·16293·16398·49470·49608–49755·50151 | 독립 모듈만(Main 미연결) | `native_inventory_contract.gd`·layout(TI00/01), item/table/affix/currentINV reader존재. 초기 장착과 일반 equip transaction/UI는 별개 |
| D29 | 자동HP 물약·장비 물약효과(수동 포션QS 폐지) | G27677–27684·28071–28084·28202–28267·35893–35910 | 완료(Main 자동HP 연결; 부가효과 후행) | **[1-1 필수 연결] 자동HP는25b로 구현·main 병합.** QS-01 `potion_recovery_source/producer.gd`만 기존 구현. 자동 CD/HP/악의·자연update는 DEMO11-25b a03a0cbc로 구현·main 병합. 수동 포션QS는 2026-10-10 폐지이므로 미구현 갭으로 세지 않음. SFX/벨트 효과 잔여는 현황판 참조; MP/ST 물약 발명0 |
| D30 | demo 저장IO·load 실제 자원/INV/skills·자동저장/복귀 | G3603–3938·62127–62213·63674–63681; I3486–3520 | 통합 결정 대기 | **[1-1 필수 연결] PC/Mac 집행 권한 사용자 결정 없음.** save_adapter 9파일과 SV-CONTRACT 존재. Main은 fresh; `source_save_lifecycle_owner` 등 자연호출0. QA session 파일은 제품 save 아님 |
| D31 | 사망→쓰러짐/확률부활·사망UI·재시작/로비 | G43721–43865·63674–63681 | 통합 결정 대기 | Player:1031–1045는 hp0 terminal dead. REVIVE_SHIELD 파생수식이 자연 revival/UI는 아님. Lv100 이하 자연부활도 존재하므로 제외 불가 |
| D32 | 클리어집계·랭크·stageClear→demoEnd·재진입 | G41921–42124·43896·63659–63681 | 미착수 | `world.get_exit_position:980`은 좌표reader일뿐 보스조건/종료state machine 아님. demoEnd/lobby제품 UI 없음 |
| D33 | 기본 HUD·Lv/XP/SP/AP·자원·킬/악의·시작아이콘·pause | G HUD/updateQS/입력; G28267 이후 | 완료(Main에 연결) | hud:88–118·804–870·1089–1149, main 실제 binding. D34와 구분 |
| D34 | 새 선택스킬/물약/보스HP·전투표시·인벤/성장창·입력설정 | G28267–28675·44050·32108 이후 | 통합 결정 대기 | P2-009a(native_skill_slots 등) 진행중, SETTINGS-S01 read view만. HUD 기존부분유지하고 새상태를 실제owner에서 읽어야함 |
| D35 | 현재 공격·사망·시작4스킬 일부 사운드 | G12341–12904·각cast | 완료(Main에 연결) | main:1898–2177·2385–2436·skill_slots 실제 AudioStream 호출. 전체 사운드/OPT 믹스/청감완료 아님 |
| D36 | 공통 SFX backend/mix·BGM/영상·음성·정지/복귀 | G12341–12904·62199·63209–63440; I2249–2320 | 통합 결정 대기 | **[1-1 필수 연결] PC/Mac 집행 권한 사용자 결정 없음.** `native_sound_backend.gd:2` 연결0 명시, sound_source/{bgm_catalog,bgm_selection,bgm_lifecycle,...} 존재. Main:474–477 BGM callback도미공급. SND01~08 재사용 |
| D37 | 펫/아이리스·대사 반응·코드 상호작용 | G9390·9777–9810·31652·44050·60697–60968 | 통합 결정 대기 | main:240–243→native_pets는실제연결, P2-004b 대사있음. 인벤/보스/레슨/상호작용 trigger 전체는 각새owner통합후확인. 새 맵 배치 제작은제외 |
| D38 | 기본 자동석궁·일반볼트/장비활 선택·피해/관통 | G17446–17460·28703–28765·35139–35629 | 독립 모듈만(Main 미연결) | W01 `port_modules/auto_bow_spec/producer.gd`는 존재하나 actual 발사/normalBow 피해 consumer 없음. 펫의석궁위치코드를 자동사격 완료로 세지 않음 |
| D39 | 일반보스 신성력/실드·즉시부활·180tick 폴백·최종사망 | G31180–31185·42515–42649·34493–34535·41921–41927 | 미착수 | REVIVE_SHIELD §1.3 B01~B09 소유. si0도 revPts200과일반부활을거치므로 si3피날레 제외가 모든 보스부활 제외는 아님. BC phase packet과도 별도 |
| D40 | 설정4탭·볼륨/언어/FPS/전체화면·저장복원 | G2705·44006·48635 이후; I 로비언어 인계 | 독립 모듈만(Main 미연결) | SETTINGS-S01 read view·현재 OPT35와 일부 sfx/프레임 소비자는 있으나 패널/저장·전체 live writer는 없음. main 기존 룩 유지·재사용, 새 룩 제작/웹 그래픽 추가 이식은 제외하고 설정값-서비스 인터페이스만 조정 |
| D41 | 공용 파일 연결 8건(저장·XP·자동물약·강화·스킬·BGM 등) | PC 총괄 제공 사실(2026-10-21) | 통합 결정 대기 | **[1-1 데모 필수]** 필요한 연결은 남아 있으나 PC 집행/Mac 권한 부여 중 사용자 결정 없음. 관련05/06·17~20·25·27·41 등의 후보 표기는 권한 부여가 아님. 8건과 단위ID의 정확한 1:1 대응표는 미확인 |

참조: [LOBBY](FDG_SOURCE_TRACE_LOBBY_20261020.md) §1/3/4, [CH1_ENEMIES](FDG_SOURCE_TRACE_CH1_ENEMIES_20261020.md) §1/4/5, [ELITES](FDG_SOURCE_TRACE_ELITES_20261020.md) §1/4/5, [FIELDBOSS](FDG_SOURCE_TRACE_FIELDBOSS_20261020.md) §2/4/5, [BOSS_CH1](FDG_SOURCE_TRACE_BOSS_CH1_20261020.md) 순서안, [SKILLS](FDG_SOURCE_TRACE_SKILLS_20261020.md) §1/3/4, [WEAPONS](FDG_SOURCE_TRACE_WEAPONS_20261020.md) §1/6, [ITEMS](FDG_SOURCE_TRACE_ITEMS_20261020.md) §1/3/4, [INVENTORY](FDG_SOURCE_TRACE_INVENTORY_20261020.md) §2/4/5, [QUICKSLOT](FDG_SOURCE_TRACE_QUICKSLOT_20261020.md) §1/3/4, [SAVE](FDG_SOURCE_TRACE_SAVE_20261020.md) §1/3/4, [META](FDG_SOURCE_TRACE_META_20261020.md) §1/6/7, [REVIVE_SHIELD](FDG_SOURCE_TRACE_REVIVE_SHIELD_20261020.md) §1/3/4, [SETTINGS](FDG_SOURCE_TRACE_SETTINGS_20261020.md) §1/3/4, [SOUND](FDG_SOURCE_TRACE_SOUND_20261020.md) §1/3/4, [NPC_WORLD](FDG_SOURCE_TRACE_NPC_WORLD_20261020.md) §2–4. 원본 수식·데이터를 새로 베끼지 않고 기존 단위를 재사용한다.

## 3. 우선순위와 최소 코드 단위

**권장 선행 순서: 01→02→03, 05→06→09와 20을 선행한 뒤 10~14/16/21/25/22는 각 행 선행 충족 후 병행한다(10→11,12/13→14,21→22). 03→30→43→§4 적 admission, 31→34~36→49→37 및 06→04→38로 첫 클리어/복귀를 닫는다. 이후 미판정 도달성·남은 코드가 없는 상태에서47로 마감한다.** 번호는 식별자이며 동시 배정 순서가 아니다. ID의 마지막 번호는 필수 작업 수가 아니다. 상위 공통연결과 하위 개별효과/actor는 경계가 달라 합산 진척률·공수를 계산하지 않는다. S=한 정책/얇은접점, M=한 소유자·상태기계/트랜잭션, L=단일 기능이어도 보호/다중 owner 인수 부담이 큼(선행을 나눠 인수; 시간 추정 아님). 후보는 배정 확정이 아니다. PC는 자동 신규 배정 금지라는 WORK_BOARD 방침을 유지하여 **기존 진행분 회수/수동 Windows 검수 후보**로만 쓴다.

| ID | 우선 | 한 번에 인수할 코드 경계·완료 증거 | 후보 | 의존/기존 재사용 | 크기 |
|---|---|---|---|---|---|
| DEMO11-01 | P0 | 실제 Main/boot가 읽는 demo=true·stage0/last0 권위를 연결하고 개발분기 분리. 기존 META-06 cap식 재작성0, 정책/미결정 manifest는 이 문서 재사용 | Mac | D§1·Main owner 정확scope 승인; 후보 미결정목록 유지·새 맵 계약은03 | S |
| DEMO11-02 | P0 | 수락 BC 체인·P2-006a/b·P2-009a 코드 통합 인수: main diff·소유·필수1-1부분을 대조한 뒤 정상 merge/소비자 인계(총괄만 main 병합) | Mac 총괄; PC 기존 담당 확인 | 01·WORK_BOARD; 새 기능 중복 구현0 | S |
| DEMO11-03 | P0 | 새 맵 서비스와 코드 의존 분리: 기존 frozen record/좌표 가드 대신 승인된 spawn/충돌/region/exit provider 계약, 실제 서비스 없는 READY 금지 | Mac | 01의정책manifest·기존 World/factory/P3-002/003 담당 | M |
| DEMO11-04 | P1 | 로컬5슬롯 로비 목록·새로하기/이어하기/삭제요청 UI(실제 IO결과만 반영) | Mac | 01·05/06·SV-LOBBY-VIEW·SETTINGS S10 | M |
| DEMO11-05 | P0 | demo save 저장소 adapter: 원 저장 계약의 native local IO·오류/중복요청 처리, 원자성/보호 형식 인수 | Mac 저장 담당 | 01/02·SV primitive/lifecycle; 저장 owner 승인 | M |
| DEMO11-06 | P0 | collector→실제 Player/INV/skills restore→start, 공유창고 별도 local IO·실패/재시작 복원까지 인수, fresh/loaded 혼합 금지 | Mac 저장 담당 | 05·SV-COLLECT/RESTORE-FLOW/PLAYER/INV·실제자원 writer | L |
| DEMO11-07 | P1 | 로비 char0 생성·이름/잠금·active 슬롯 인계와 cutsceneDone 경계 | Mac | 04/06·LOBBY/기존 character reader 재사용 | M |
| DEMO11-08 | P1 | 세계관/전사/INTRO 재생·자막·skip/오류·기상4컷 인계 하나의 수명 경계 | Mac | 07·기존 P2-001i/P2-007a 무중복·영상 방식 결정 | L |
| DEMO11-09 | P1 | 데모 실제 설정·입력 프로필/일시정지 인계, 기존 BINDS/QE 권위 유지 | Mac; PC 수동입력 검수 | 01·SETTINGS-S01/S10·06 | M |
| DEMO11-10 | P0 | Shift 사슬/돌진 한 이동 owner 연결: 비용/충돌/해제/레슨 성공은 실제 발사 readback | Mac 보호 owner | 03/09·기존 이동·Q/E writer scope 승인 | M |
| DEMO11-11 | P0 | 방향+Space 전격이동/탈출 owner: stock/CD/무적/종료·입력 우선순위 | Mac 보호 owner | 03/09/10·원문 dodge/iceOrb 탈출 | M |
| DEMO11-12 | P0 | Q 누락 carrier 자연입장과 홀딩/방패 자원 경계 연결 | Mac 보호 owner | 03/09·현재 Q adapter/blue producer; black은 Q전용 | L |
| DEMO11-13 | P0 | E 물리5종/충전/방패·반사 owner 연결, black 거부 회귀 | Mac 보호 owner | 03/09·기존 E wave/물리반사 의존 | L |
| DEMO11-14 | P0 | 분노 획득·100%·Space발동/종료·공존기술 우선순위 | Mac 보호 owner | 09/12/13·State/자원 소유 승인 | M |
| DEMO11-15 | P1 | 레슨 step1..7의 실제 소비자 인계·allows 배선·skip/실패/복원, 각step 독립 인수 | Mac | 10~14·P2-001l; 기본/step0/8 재작성0 | L |
| DEMO11-16 | P0 | 실제 SKILL_SLOTS/active/ULT dispatcher(고정4키 유지검수 포함), 비용·쿨 권위 단일화 | Mac; PC P2-009a 회수 | 01/02/09·기존4cast/HUD·SK-S04 slot_rules | M |
| DEMO11-17 | P1 | K/L 학습/강화/환불·SP/악의 commit 및 UI(식은 기존 core), 한 transaction 실패prefix 인수 | Mac | 16/20·SK-S01~05 policies·State writer 권한 대기·PC 웹 스킬 창 새 레이아웃 확정/인수 의존 | M |
| DEMO11-18 | P1 | 데모 합체 허용/흡수/성급·되돌리기 UI를 실제 owner에 연결, 효과는 §4 조건부 항목 | Mac | 01/17/06·fusion_rules/fuse_commit; 금지키 확인 | M |
| DEMO11-19 | P1 | AP/스탯/패시브 투자·예약큐→applyStats·표시, XP tick과 같은 owner순서 | Mac | 20/06·META point/passive_queue·현 provider | M |
| DEMO11-20 | P0 | 실제 addExp에 META-06 entry/loop cap100 연결·레벨 회복/표시/저장 인계: 99→100/대량XP/이미100 | Mac State 담당 | 01·현재 State:523·META-06(수식 새 구현0) | S |
| DEMO11-21 | P0 | P2-006a/b 수락 제품의 바닥 드랍·줍기·INV반입 자연 연결; 이미 만든 표시는 재구현하지 않음 | Mac; PC 기존 P2-006b 회수 | 02/03·현재 drop journal·실제 INV | M |
| DEMO11-22 | P0 | 일반 equip/unequip transaction: bag↔17slot·요구레벨·stats/affix cache 재계산·실제 공격/방어 readback | Mac INV 담당 | 21·TI-00/01·W01/ITEMS·State 승인 | M |
| DEMO11-23 | P1 | 가방/공유창고 선택·이동·비교/상세·정렬/필터 UI, 장착 transaction·SV-SHARED 재사용 | Mac | 22/06·INVENTORY의 기존 TI 후속, 신규가방/창고 owner0 | M |
| DEMO11-24 | P1 | 허용 장비 효과의 실제 소비 누락 인수: 효과 id 하나/분기 하나씩(수식/데이터 재복제0) | Mac 전투/아이템 담당 | 01/22·ITEMS/WEAPONS·현재 hurtE 정직halt; 개별 id 재배정 | L |
| DEMO11-25 | P0 | 자동HP phase→실제HP/악의/CD writer·자연update: threshold·timer·미발동 read순서 | Mac QS 담당 | QS-01(유일 기존 모듈)·20·State/resource; 구현은25b a03a0cbc(main 병합) | M |
| DEMO11-27 | P1 | G 대장간 장비강화/이전 견적→유료RNG·차감·결과 UI | Mac META 담당 | 22/06·native_meta_enhancement_policy 재사용 | M |
| DEMO11-28 | P1 | 분해/자동분해·재료·INV/cache/UI를 기존 salvage policy에 연결 | Mac META/INV 담당 | 21/22/06·native_meta_salvage_policy·중복 writer0 | M |
| DEMO11-29 | P2 | 데모에서 실제 가용한 결정/소켓/제작/재련 한 거래 경계씩: 가용성 후 활성화 | Mac ITEM 담당 | 01/22/27/28·ITEMS/NPC_WORLD 기존 순서안 | L |
| DEMO11-30 | P0 | hell0 M29/M30 자연 actor 연결·단일 lock/실제서비스·forced elite 후처리, 후속장mod 추가0 | Mac 적 담당 | 03·EL-01 이후 재사용·type3/type7 existing kernel | M |
| DEMO11-31 | P0 | 앵글러 한 family 기상/탄/피해/처치→fbDone·지역 gate 인계(배치 제작0) | Mac 필드보스 담당 | 03/12/13·FIELDBOSS 원문·보호피해 owner 승인 | L |
| DEMO11-32 | P1 | 화마귀 한 family 실제 tick/탄/피해/사망·aggro 인계 | Mac 필드보스 담당 | 03/12/13·FIELDBOSS, collider/renderer 서비스 | M |
| DEMO11-33 | P1 | 곰치 한 family 실제 tick/물기/피해/사망·aggro 인계 | Mac 필드보스 담당 | 03/12/13·FIELDBOSS, collider/renderer 서비스 | M |
| DEMO11-34 | P0 | stage0 boss actor snapshot/AI tick assembler: BC의 요청을 원순서 ack, phase·RNG 공유 | Mac 보스 담당 | 02/03/30·BC01~10 재사용; Main 연결 승인 | M |
| DEMO11-35 | P0 | BC09 출생/queue→실제 projectile registry·tick/expiry 서비스, mock ack 성공 금지 | Mac 보스/탄 담당 | 34·02의BC09체인·기존 projectile owner 승인 | M |
| DEMO11-36 | P0 | 보스 HP/poise·hurtE/접촉hurtP/패링 실제 owner route 및 보호 readback | Mac 보호 owner | 12/13/34/35·2_3/Q/E 의미 불변 | L |
| DEMO11-37 | P0 | 지역/앵글러→gate→arena→boss death→보상/clear기록·랭크 집계 인계 | Mac 보스/지역 담당 | 03/20/31/34~36/49·P3-003 실제 귀속 재사용 | M |
| DEMO11-38 | P0 | stageClear 다음버튼→demoEnd·wishlist/lobby복귀: stage1생성0·중복clear0 | Mac UI 담당 | 37/04/06·G43896/63663~63681 | S |
| DEMO11-39 | P0 | fallen→300tick·자연부활/악마화/최종사망·재시작 UI와 저장/로비인계 | Mac 플레이어/저장 담당 | 06/12/13·REVIVE_SHIELD·현재terminal dead 대체 승인 | L |
| DEMO11-40 | P1 | 실제 전투 SFX consumer를 기존 SND backend/mix에 연결, bus/소리중복/종료누수 검수 | Mac SND 담당 | 02·SND01~08·현재 공격/스킬음 재사용 | M |
| DEMO11-41 | P1 | 로비/인트로/필드/보스/종료 BGM·voice lifecycle 실제 재생/정지/복귀 | Mac SND 담당 | 08/34/38/40·bgm_catalog/selection/lifecycle | M |
| DEMO11-42 | P1 | HUD에 새 owner의 보스HP·QS·선택스킬·각panel·실패/자원상태 연결 | Mac UI; PC P2-009a 회수 | 02/16/23/25/34/38·기존HUD 유지 | M |
| DEMO11-43 | P0 | P3-002/003 동적spawn/지역분모·kill 귀속의 공통 adapter 접점 구축, 실제etype 등록은 §4 각행이 후행 | Mac 지역/적 담당 | 03/30·기존spawn_hole_system/regions; 타입별등록을 선행요구하지 않음 | M |
| DEMO11-44 | P1 | 펫·아이리스 생존/회복/대사 이벤트를 새 전투·클리어owner와 연결 | Mac 펫 담당 | 31/37/39·P2-004b/기존native_pets 재사용 | M |
| DEMO11-45 | P2 | 상자/봉화/상인/제단 등 새 맵에 채택된 상호작용 코드 1종씩, 배치·룩 제외 | Mac 월드/경제 담당 | 01/03/21/27·NPC_WORLD; 원본 기본 경로/선택분기 구분 | L |
| DEMO11-46 | P1 | Mac 배포 실행·설정/5슬롯 왕복·종료저장·재시작, PC 수동 Windows 실행 인수 | Mac 플랫폼; PC 수동QA | 04~09/38~42/50·P5-001a 템플릿/export 현황 재확인 | M |
| DEMO11-47 | P0 최종 | 신규/이어하기→레슨/사망/재입장→Lv100→전투/줍기/장착/물약→1-1clear→종료→로비 E2E | Mac 총괄; PC 수동QA | 필수 활성단위 전체·조건부 §4 도달분; 실창·청취·목표60fps/약16.7ms 예산·프레임시간p95/p99 별도 인수(아래 성능 기준) | M |
| DEMO11-48 | P0 | 기본 자동석궁 한 owner: W01 spec→타깃/ST/발사→normalBow 실제 탄/피해·관통/반사/해제 | Mac 무기/탄 담당 | 03/09·기존 신규 INV/W01/projectile store·보호 hurtE;22는장비교체후회귀 | M |
| DEMO11-49 | P0 | si0 일반보스 revPts/실드·즉시부활/180tick 폴백·최종사망 owner: 부활대기중clear 금지 | Mac 부활/보스 보호 owner | 34/36·REVIVE_SHIELD B01~B09·원문42515~42649/34493~34535 | L |
| DEMO11-50 | P1 | 설정 UI→현재 OPT writer·볼륨/언어/FPS/전체화면/접근성·저장복원: 제어1개씩 S02~S10에 맞춰 인수 | Mac 설정/UI 담당; PC 수동장치QA | 06/09/40/41·SETTINGS-S01/S02~S10; 새 맵 gfx는서비스계약만,맵룩이식0 | L |

L 표시는 한 번에 무검수 대형 패치하라는 지시가 아니다. 예를 들어 12/13/36은 먼저 기존 protected owner가 허용한 carrier/피해 경계 한 개를 확정해 인수하고 다음 경계를 처리한다. 24/29/45도 아래처럼 효과·거래·상호작용 id 한 개를 하위 단위로 배정한다. 코드 연결 권한을 이 문서만으로 확대하지 않는다.

## 4. 생성·학습 분모의 조건부 세부 단위

### 4.1 자연 소환 29 etype — 각 행은 다른 장 전체 이식이 아님

근거는 G30969–31025·31120–31349·35648–35688, AI/피해 분기는 CH1_ENEMIES 전수 색인·기존 EN-00~99를 참조한다. **스폰 위치/원본16 id를 새 맵에 옮기는 작업이 아니다.** 각 행은 `DEMO11-03/30/43` 뒤 실제 etype/원소/상태 admission→원문 tick→피해/부활/최종사망/등록→해제 1타입의 작은 단위(M)다(정상 적의 부활/구울/실드도 해당 actor 원문 분기에서 인수). 정확 profile 이미 연결된 경계는 재사용하고 누락 분기만 수행한다. 카탈로그 데이터만 있는 경우를 actor 완료로 세지 않는다. 다음 행은 모두 현재의 **범용 자연스폰 경계는 미착수**, 기존 좁은 actual consumer는 §2 D18/D20에 별도 기록한다.

| 후속 ID | etype | 우선/후보 | 의존·중복 방지 |
|---|---:|---|---|
| DEMO11-51 | 0 | P0 / Mac | 03/30/43·main actor/원소 profile 있으면 재작성0; 미지원 상태/탄/피해만 인수 |
| DEMO11-52 | 1 | P0 / Mac | 03/30/43·main actor/원소 profile 있으면 재작성0; 미지원 상태/탄/피해만 인수 |
| DEMO11-53 | 3 | P0 / Mac | 03/30/43·기존 type3/type7 조립·M29/M30 커널 재사용; exact late 설치를 자연 입장으로 오인 금지 |
| DEMO11-54 | 4 | P0 / Mac | 03/30/43·main actor/원소 profile 있으면 재작성0; 미지원 상태/탄/피해만 인수 |
| DEMO11-55 | 5 | P0 / Mac | 03/30/43·main actor/원소 profile 있으면 재작성0; 미지원 상태/탄/피해만 인수 |
| DEMO11-56 | 6 | P0 / Mac | 03/30/43·main actor/원소 profile 있으면 재작성0; 미지원 상태/탄/피해만 인수 |
| DEMO11-57 | 7 | P0 / Mac | 03/30/43·기존 type3/type7 조립·M29/M30 커널 재사용; exact late 설치를 자연 입장으로 오인 금지 |
| DEMO11-58 | 8 | P0 / Mac | 03/30/43·main actor/원소 profile 있으면 재작성0; 미지원 상태/탄/피해만 인수 |
| DEMO11-59 | 9 | P0 / Mac | 03/30/43·main actor/원소 profile 있으면 재작성0; 미지원 상태/탄/피해만 인수 |
| DEMO11-60 | 10 | P0 / Mac | 03/30/43·main actor/원소 profile 있으면 재작성0; 미지원 상태/탄/피해만 인수 |
| DEMO11-61 | 11 | P0 / Mac | 03/30/43·main actor/원소 profile 있으면 재작성0; 미지원 상태/탄/피해만 인수 |
| DEMO11-62 | 12 | P0 / Mac | 03/30/43·main actor/원소 profile 있으면 재작성0; 미지원 상태/탄/피해만 인수 |
| DEMO11-63 | 13 | P0 / Mac | 03/30/43·main actor/원소 profile 있으면 재작성0; 미지원 상태/탄/피해만 인수 |
| DEMO11-64 | 14 | P0 / Mac | 03/30/43·main actor/원소 profile 있으면 재작성0; 미지원 상태/탄/피해만 인수 |
| DEMO11-65 | 15 | P0 / Mac | 03/30/43·main actor/원소 profile 있으면 재작성0; 미지원 상태/탄/피해만 인수 |
| DEMO11-66 | 16 | P0 / Mac | 03/30/43·main actor/원소 profile 있으면 재작성0; 미지원 상태/탄/피해만 인수 |
| DEMO11-67 | 17 | P0 / Mac | 03/30/43·main actor/원소 profile 있으면 재작성0; 미지원 상태/탄/피해만 인수 |
| DEMO11-68 | 18 | P0 / Mac | 03/30/43·main actor/원소 profile 있으면 재작성0; 미지원 상태/탄/피해만 인수 |
| DEMO11-69 | 19 | P0 / Mac | 03/30/43·main actor/원소 profile 있으면 재작성0; 미지원 상태/탄/피해만 인수 |
| DEMO11-70 | 20 | P0 / Mac(기존 P2-008a writer 재사용) | 03/30/43·기존 factory exact profile 재사용; 임의 공격 추가 금지 |
| DEMO11-71 | 21 | P0 / Mac(PC P2-008b order9·b406e4bc 후보 먼저 회수) | 03/30/43·main actor/원소 profile 있으면 재작성0; 미지원 상태/탄/피해만 인수 |
| DEMO11-72 | 23 | P0 / Mac | 03/30/43·main actor/원소 profile 있으면 재작성0; 미지원 상태/탄/피해만 인수 |
| DEMO11-73 | 24 | P0 / Mac | 03/30/43·main actor/원소 profile 있으면 재작성0; 미지원 상태/탄/피해만 인수 |
| DEMO11-74 | 25 | P0 / Mac | 03/30/43·main actor/원소 profile 있으면 재작성0; 미지원 상태/탄/피해만 인수 |
| DEMO11-75 | 26 | P0 / Mac | 03/30/43·main actor/원소 profile 있으면 재작성0; 미지원 상태/탄/피해만 인수 |
| DEMO11-76 | 27 | P0 / Mac | 03/30/43·main actor/원소 profile 있으면 재작성0; 미지원 상태/탄/피해만 인수 |
| DEMO11-77 | 28 | P0 / Mac | 03/30/43·main actor/원소 profile 있으면 재작성0; 미지원 상태/탄/피해만 인수 |
| DEMO11-78 | 29 | P0 / Mac | 03/30/43·문지기 후처리·사망탄·gate 귀속 포함 |
| DEMO11-79 | 47 | P0 / Mac(PC P2-008b order11·b406e4bc 후보 먼저 회수) | 03/30/43·main actor/원소 profile 있으면 재작성0; 미지원 상태/탄/피해만 인수 |

### 4.2 reqLv≤100 51후보 — 6종의 현재 자연 cast와 나머지 효과

G44161–44224 등록 literal을 read-only 평가해 reqLv>100 네 종과 나머지를 분리했다. 이 결과는 자원/선행/hidden/합체 도달성을 실행 검증한 결과가 아니다. 현재 `kiSlash/fireball/giantSlam/spikeTrap/holyDome/iceOrb`는 §2의 좁은 Main 자연 cast 경계가 있어 재작성하지 않는다. 강화 수치·선택/합체 변형의 남은 효과는 기존 17/18/24로 별도 검수한다.

아래 각 단위는 **01에서 정상데모 도달성이 확인될 때만 활성화**한다. 그 전에는 필수 수량·공수 합계에 더하지 않는다. 01은 기존 미결정 목록을 인계하고, 각 후보를 활성화하기 전 해당 후보의 hidden/requires/합체 경로를 추가 판정한다. 최종47에서는 미판정 도달성 항목이 없어야 한다. 후보가 hidden/requires 경계 밖으로 판정되면 제외 사유를 남기고 비활성화한다. 상태는 현재 그 기술의 완전한 자연 consumer가 없는 **미착수**(maliceSwipe/shieldThrow 등 인접 E/기본 분기 일부는 기존 owner 재사용)다. 하나의 기술 실행자당 M, 한 실제 dispatcher/자원/CD/대상/정직 미지원 경계까지만 인수한다. 12/13/24 또는 다른 기술과 같은 host 경계인 경우에는 같은 구현 단위로 흡수하고 이 child는 중복 코드0으로 닫는다. 공용식은 기존 provider를 호출하며 같은 스킬관리 core를 새로 만들지 않는다.

| 후속 ID | 기술 id / 원문 행 | 우선·후보 | 선행·활성 조건 |
|---|---|---|---|
| DEMO11-80 | `chargeBoost` / G44162 | P1 조건부 / Mac | 도달성01 확인→16/17·기존 스킬별 source 참조 |
| DEMO11-81 | `magicBlink` / G44163 | P1 조건부 / Mac | 도달성01 확인→16/17·기존 스킬별 source 참조 |
| DEMO11-82 | `ghostWalk` / G44164 | P1 조건부 / Mac | 도달성01 확인→16/17·기존 스킬별 source 참조 |
| DEMO11-83 | `bladeDash` / G44165 | P1 조건부 / Mac | 도달성01 확인→16/17·기존 스킬별 source 참조 |
| DEMO11-84 | `whirlwind` / G44168 | P1 조건부 / Mac | 도달성01 확인→16/17·기존 스킬별 source 참조 |
| DEMO11-85 | `detonate` / G44169 | P1 조건부 / Mac | 도달성01 확인→16/17·기존 스킬별 source 참조 |
| DEMO11-86 | `maliceSwipe` / G44170 | P1 조건부 / Mac | 도달성01 확인→16/17·기존 스킬별 source 참조 |
| DEMO11-87 | `fanShot` / G44171 | P1 조건부 / Mac | 도달성01 확인→16/17·기존 스킬별 source 참조 |
| DEMO11-88 | `omniBeam` / G44172 | P1 조건부 / Mac | 도달성01 확인→16/17·기존 스킬별 source 참조 |
| DEMO11-89 | `elemMissile` / G44173 | P1 조건부 / Mac | 도달성01 확인→16/17·기존 스킬별 source 참조 |
| DEMO11-90 | `guardian` / G44175 | P1 조건부 / Mac | 도달성01 확인→16/17·기존 스킬별 source 참조 |
| DEMO11-91 | `maliceHunt` / G44176 | P1 조건부 / Mac | 도달성01 확인→16/17·기존 스킬별 source 참조 |
| DEMO11-92 | `venomBlade` / G44177 | P1 조건부 / Mac | 도달성01 확인→16/17·기존 스킬별 source 참조 |
| DEMO11-93 | `ltnChaser` / G44178 | P1 조건부 / Mac | 도달성01 확인→16/17·기존 스킬별 source 참조 |
| DEMO11-94 | `maliceMortar` / G44179 | P1 조건부 / Mac | 도달성01 확인→16/17·기존 스킬별 source 참조 |
| DEMO11-95 | `boneWall` / G44180 | P1 조건부 / Mac | 도달성01 확인→16/17·기존 스킬별 source 참조 |
| DEMO11-96 | `blackStar` / G44181 | P1 조건부 / Mac | 도달성01 확인→16/17·기존 스킬별 source 참조 |
| DEMO11-97 | `lavaSummon` / G44182 | P1 조건부 / Mac | 도달성01 확인→16/17·기존 스킬별 source 참조 |
| DEMO11-98 | `execution` / G44183 | P1 조건부 / Mac | 도달성01 확인→16/17·기존 스킬별 source 참조 |
| DEMO11-99 | `needleShot` / G44187 | P1 조건부 / Mac | 도달성01 확인→16/17·기존 스킬별 source 참조 |
| DEMO11-100 | `arcLaser` / G44189 | P1 조건부 / Mac | 도달성01 확인→16/17·기존 스킬별 source 참조 |
| DEMO11-101 | `fireBeam` / G44190 | P1 조건부 / Mac | 도달성01 확인→16/17·기존 스킬별 source 참조 |
| DEMO11-102 | `maliceDome` / G44191 | P1 조건부 / Mac | 도달성01 확인→16/17·기존 스킬별 source 참조 |
| DEMO11-103 | `fireAura` / G44192 | P1 조건부 / Mac | 도달성01 확인→16/17·기존 스킬별 source 참조 |
| DEMO11-104 | `plagueBurst` / G44193 | P1 조건부 / Mac | 도달성01 확인→16/17·기존 스킬별 source 참조 |
| DEMO11-105 | `maliceStorm` / G44194 | P1 조건부 / Mac | 도달성01 확인→16/17·기존 스킬별 source 참조 |
| DEMO11-106 | `darkPillar` / G44195 | P1 조건부 / Mac | 도달성01 확인→16/17·기존 스킬별 source 참조 |
| DEMO11-107 | `holyPrison` / G44197 | P1 조건부 / Mac | 도달성01 확인→16/17·기존 스킬별 source 참조 |
| DEMO11-108 | `iceStorm` / G44198 | P1 조건부 / Mac | 도달성01 확인→16/17·기존 스킬별 source 참조 |
| DEMO11-109 | `giantSlam2` / G44200 | P1 조건부 / Mac | 도달성01 확인→16/17·기존 스킬별 source 참조 |
| DEMO11-110 | `skyCrusher` / G44201 | P1 조건부 / Mac | 도달성01 확인→16/17·기존 스킬별 source 참조 |
| DEMO11-111 | `chainAssault` / G44203 | P1 조건부 / Mac | 도달성01 확인→16/17·기존 스킬별 source 참조 |
| DEMO11-112 | `chainSlam` / G44204 | P1 조건부 / Mac | 도달성01 확인→16/17·기존 스킬별 source 참조 |
| DEMO11-113 | `chainSlash` / G44206 | P1 조건부 / Mac | hidden·도달성01 확인→16/17·기존 스킬별 source 참조 |
| DEMO11-114 | `peaceShield` / G44207 | P1 조건부 / Mac | 도달성01 확인→16/17·기존 스킬별 source 참조 |
| DEMO11-115 | `hellRay` / G44208 | P1 조건부 / Mac | hidden·도달성01 확인→16/17·기존 스킬별 source 참조 |
| DEMO11-116 | `shieldThrow` / G44209 | P1 조건부 / Mac | 도달성01 확인→16/17·기존 스킬별 source 참조 |
| DEMO11-117 | `weakPhys` / G44211 | P1 조건부 / Mac | 도달성01 확인→16/17·기존 스킬별 source 참조 |
| DEMO11-118 | `weakMag` / G44212 | P1 조건부 / Mac | 도달성01 확인→16/17·기존 스킬별 source 참조 |
| DEMO11-119 | `weakPj` / G44213 | P1 조건부 / Mac | 도달성01 확인→16/17·기존 스킬별 source 참조 |
| DEMO11-120 | `weakRev` / G44214 | P1 조건부 / Mac | 도달성01 확인→16/17·기존 스킬별 source 참조 |
| DEMO11-121 | `voidScarecrow` / G44218 | P1 조건부 / Mac | 도달성01 확인→16/17·기존 스킬별 source 참조 |
| DEMO11-122 | `explodeScarecrow` / G44219 | P1 조건부 / Mac | 도달성01 확인→16/17·기존 스킬별 source 참조 |
| DEMO11-123 | `ancestorSummon` / G44220 | P1 조건부 / Mac | 도달성01 확인→16/17·기존 스킬별 source 참조 |
| DEMO11-124 | `thunderStake` / G44223 | P1 조건부 / Mac | 도달성01 확인→16/17·기존 스킬별 source 참조 |

### 4.3 합체·아이템·조건부 콘텐츠를 부풀리지 않는 방법

| 분모 | 후속 단위 경계·활성 조건 |
|---|---|
| demo 허용 합체22키 | G16649와 G44324/44453의 원본 짝·host를 유지. `dimBreach,dimSlam,sixFuse,elemFuse,whirlDet,slamStorm,bladeFuse,bladeEcho,plagueFuse,plagueVenom,boneStorm,elecRepent,shieldFuse,holyFuse,holyIce,iceMortar,pillarSpike,pillarSlam,infernoSlam,thunderGhost,dualScarecrow,siegeGhost`. **허용≠재료스킬/성급이 실제 도달 가능**. 01에서 폐쇄 확인 후 18의 `DEMO11-18-<key>` 한 효과씩(M) 배정. 기본 shieldFuse/E wave와 이미 있는 fuseMul을 중복 이식하지 않음 |
| 어픽스/전설/유니크·장비7/활3 | ITEMS·WEAPONS 원본 생성/reqLv/현재장비 소비색인 재사용. 24의 `DEMO11-24-<effectId>`마다 허용생성/장착/실제 발동을 한 경계로(M). 407어픽스 전체를 무조건 데모 공수로 합산하지 않음. 반대로 데모 금지7 외 효과를 전부 후반용으로 제외하지도 않음 |
| 기본 대장간/공유창고 | G31652·32108–32132·44050의 G/창고패널은 stage0 정상 플레이에서도 접근 가능하므로27/28·23/06은 우선 큐에 남긴다. 고급 탭의 개별 가용성은29의조건부 판정. |
| 결정/강화/제작·월드상호작용 | 29/45에서 기본 1-1 또는 새 맵 채택 코드 계약이 확인된 거래/상호작용 id만 `DEMO11-29-<id>`/`45-<id>`로 분리(M). 새 위치·지형·미장센 작업 제외 |
| 레어90..99·리프트 특수분기 | 현 원본 room/field/rift 분기 도달성은 일반 소환굴과 구별. 새 맵 서비스가 이를 유지하기로 정한 경우만 별도 작은 단위 명시. 정상데모에서 도달하지 않는 분기를 이름만 보고 필수로 만들지 않음. 판정 전은 **통합 결정 대기** |

## 5. 통합 결정·기존 담당 접점

| 결정/기존 소유 | 이번 문서의 처리 | 선결 질문·완료 기준 |
|---|---|---|
| BC-CHAIN-M | 02에서 `66ff67a0`/`2c29b697`/체인끝`adc90ec7`의 1-1 공통부분 인수 판단. BC3-02 `3eb45645` facade는 제외 | 이미 수락됐어도 현재 main에는08/09파일 없음. main의 BC04~07/10 기준을 되돌리지 않고 체인 parent/파일 동치 확인 |
| P2-006a/b 드랍·P2-009a 피드백 | 02/21/42는 진행분 회수·누락 연결부터. PC에 새 자동 작업을 보내지 않음 | 실제 제출SHA·Main 소비자를 찾은 뒤 새 구현 필요 구간만 확정. WORK_BOARD 표기만으로 코드 완료 처리0 |
| 새 맵/지역/필드보스 | 기존 P3-002/003 코드·처치 귀속을 재사용. 지도 데이터/원본 좌표 이식 없음 | 4지역 유지/지역 없는 폴백 중 선택은 새 맵 코드 계약에서 명시. **두 원본 경로 모두 stage0 앵글러 _fbDone은 필수**이므로 지역 없는 폴백이 앵글러 생략 허가는 아님. 이를 바꾸려면 별도 사용자 변경 지시 필요 |
| Main/World/Player·Q/E/피해 | 10~15/34~39/48/49는 총괄과 기존 owner에 공용 exactscope 요청 | fixture ack/packet 생성·핵심 producer 통과를 실제 탄/피해/패링 성공으로 세지 않음. 한 owner·원 tick 순서·실제 readback |
| State/자원/INV/저장 | 05/06/19/20/22/25/26/39는 기존 owner를 통해 commit | 복제 P/INV·새 save schema·브라우저 세이브 파괴/암묵 마이그레이션 금지. 원본 demo key/active 교환의 native 대응은 저장 담당 인수 |
| P2-001i·P2-007a·P2-001l | 기존 기상/커튼/가이드·입력 allows·기본연습을 재사용 | 과거 snapshot unported 주석과 현재 함수 분기가 다를 때 실제 caller/STEP_HALTS 우선. 전체 영상/레슨 완료로 확대0 |
| 순수 모듈 다수 | META06·point/queue·SK-S01~05·TI00/01·QS01·SV·SND01~08/W01/IT 계열은 재사용 의존 | 같은 데이터/수식/registry를 다시 이식하는 “쉬운 진척” 금지. **다음 핵심은 실제 owner와 자연 흐름 통합** |

## 6. 검수·제출 경계

| 확인 | 이번 결과·후속 인수 조건 |
|---|---|
| 정적 대조 | G/I demo 분기·등록 literal·Native Main/World/Player/State/HUD·소유자 호출·실제 파일목록 대조. ignored 여부가 아니라 Git tree를 기준으로 port_modules도 확인 |
| read-only 검산 | SKILL_LIST55/명시reqLv>100 4/후보51, HELL_SPAWN0 31/opening29를 원본 literal로 계산. 숫자/원문 변경0. 도달성/실행 검증으로 포장0 |
| 기존 오류/문서 차이 | WORK_BOARD와실파일 불일치 D24/D27, 실제 cap100 미연결 D01/D17, STEP_HALTS와낡은주석 D08/D09를 표로만 기록. 기존 설계·다른담당문서 수정0 |
| 성능 인수(1-1 필수) | **목표 안정적 60fps(프레임 예산 약16.7ms)**. [웹 성능 목표](../12퍼포먼스·최적화/CLAUDE_CODE_인수인계_전체작업보고서_2026-08-10.md):17 및 [웹 실측 참고](../12퍼포먼스·최적화/COMBAT_TEXTURE_WARMUP_20260929.md):25–40의 1600×900 High100·생존50·20초 59.95fps를 참고(동일 Godot 성능 증거 아님). PC는 프레임당 수십ms 제보, 원인 미확정·이번 재측정0. PC/Mac 기기·해상도·룩/옵션·적/탄 수·전투/구간·측정시간을 고정해 실제 출력FPS와 프레임시간 평균/p95/p99/최대, CPU/GPU(가능 시)를 기록. 평균FPS만으로 스파이크 통과 판정 금지, 꼬리 지연 허용치는 실측 후 총괄 확정. 시뮬60Hz·headless·FPS상한은 실제60fps 인수 아님 |
| 필수 후속 검수 | 활성 코드 단위마다 원본 행·정상/경계/실패·실제 Main owner readback·기존 회귀. 최종47은 처음부터 끝까지 1-1 완주, 죽음/이어하기/장비·물약·Lv100·보스·종료 저장복귀. 헤드리스는 실창/입력/소리/배포 인수 대체 불가 |
| 이번 실행 | Godot/import/서버/게임/테스트 실행0. docs-sync 정상 훅 및 문서 범위·원문 hash·내부 ID·경로 정적 검사만. 테스트 PASS 숫자 인용/새 완료율0 |
| Git/인계 | `codex/demo11-gap-20261021`, sparse worktree. 이 문서+CHANGELOG_SYNC 절만 commit, 경로지정 add·자기branch 일반push·원격SHA대조→`~/exoduser-wt/_out/demo11-gap/DONE.txt`→자기worktree제거. R branch/HEAD/index/tracked work 불변·main push0 |
