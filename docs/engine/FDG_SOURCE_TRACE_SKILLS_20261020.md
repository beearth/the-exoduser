# 스킬 관리·합체·성급·비용 원본 추적과 이식 단위 지시서

> 2026-10-21 DEMO11-18: 일반 데모의 허용 합체 원장/흡수/성급·reset을 기존 fusion_rules/fuse_commit와 DEMO11-17 State owner에 연결했다. 새 키0·화면/피해/방패 실행0, shieldFuse 생성/reset HOLD. [보고서](orders/reports/demo11-18_REPORT.md) 및 docs/2_1 Native 절 참조. 아래 순수 모듈 당시의 owner 미연결은 해당 인수 이력이다.

> 2026-10-21 DEMO11-17: SK-S01~05 preview 식은 그대로 두고 학습/강화/감소/환불 ledger·active 제안·슬롯의 실제 State writer와 최소 Main 호출을 연결했다. 아래 S05 당시 runtime_writer 미연결은 당시 범위다. shieldFuse 전용 reset HOLD, PC UI/전투 핵심/저장은 유지한다. [현재 보고서](orders/reports/demo11-17_REPORT.md).

> 2026-10-21 DEMO11-16: SK-S04 policy 본문은 그대로 재사용하고 실제 슬롯 선택→기존 4cast/비용/HUD 연결을 추가했다. 아래 SK-S04 당시의 “P2-005 hardwired input 재배정0”은 그 단위의 이력이다. 보호 active·미구현 ULT 효과와 slot UI는 별도이며 [현재 계약](DEMO11_SKILL_DISPATCH_20261021.md)을 따른다.

작업ID `trace-skills` · 2026-10-20 KST · 문서 검수 대기. **이번 산출물은 이 새 문서 1개뿐**이다. 코드·테스트·기존 설계 docs·WORK_BOARD는 수정하지 않는다. 후속 SK-S01~09는 제안이며 이번에 구현하지 않았다.

## 0. 조사 기준과 작업 경계

| 항목 | 확인 결과 |
|---|---|
| fetch / source pin | `git fetch origin` 성공 후 `origin/main=ad6ac68a2e009c4d299fe1dd2264182355ee992c`에서 신규 worktree 생성. 요구 하한 ad6ac68a2 충족. 모든 원본 행 번호는 **이 SHA의 game.html** 기준이며 구 포트의 SOURCE_REF 행 번호를 복사하지 않음 |
| 자기 위치 | `/Users/fordeargamers/exoduser-wt/trace-skills` / `codex/trace-skills-20261020` |
| R 불변 기준 | `/Users/fordeargamers/Projects/exoduser-migration-20261001`: branch `codex/mac-live-play-time-main-20261017`, HEAD `dd49171c5b88e211575a41f185395d6c0a14b184`, 시작 tracked INDEX/WORK 각각 차이 0. R에서 fetch/read만; checkout/reset/merge/main push 없음 |
| 원본 bytes | game.html 65,692행 / SHA256 `4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4`; index.html 4,742행 / `36008f72723dbcbf1ae7b6af6b08dfe6299962e2445261139b6237082a24cf12` |
| 선행 읽기 | `orders/WORK_BOARD.md`의 진행중/공용/보존WIP, `FDG_GAME_DEVELOPMENT_PLAN.md` 현행 목표·P2-005a~d·P4-001 HOLD, 병합 `FDG_FEATURE_INVENTORY_20261020.md` SK/FU/HUD/PANEL/BIND 행, 병합된 `FDG_SOURCE_TRACE_QUICKSLOT/SAVE/SETTINGS_20261020.md`의 원본·의존·단위·공용 접점 확인 |
| 기존 추적 경계 | QUICKSLOT의 자동 회복·악의오브 할인 계산/HP sink, SAVE의 payload·restore·lifecycle, SETTINGS의 키 재지정·OPT·패널 host를 중복 구현하지 않음. TRACE-INVENTORY/META/REVIVE-SHIELD 및 TRACE-WEAPONS의 미병합 결과는 이 pin에서 **미확인**. 원격 후보를 main 완료로 간주하지 않음 |
| 작업판 충돌 | P2-006b 드랍, P3-002 World 소환굴, P2-007a 글꼴/UI, QA-002 해당 테스트, STARTER-REGIONS starter_state 테스트가 배정됨. main/player/world/hud/공용 State·피해집행자 편집은 해당 담당과 총괄 조정 전 HOLD. 이 문서 외 소유권을 주장하지 않음 |
| 보드 갱신 예외 | 보드의 일반 등록/보고서 규칙보다 이번 사용자 지시인 ‘새 추적 문서 1개만’이 우선. 별도 REPORT·WORK_BOARD 변경 없음; 실제 제출 ref/SHA는 DONE과 최종 응답으로 인계 |
| 보호 | **docs/2_3 수정금지, Q/E 의미·입력·패링·세이브 형식은 보호**. source 추적에만 포함. 보호 설계/저장 필드 변경·마이그레이션·Q/E 재배정은 후속 단위에도 배정하지 않음 |
| 증거 수준 | 원본 리터럴과 실행 함수·Godot 실제 파일/기존 테스트 본문 정적 대조, 기존 Node 테스트 실행. Godot 테스트 재실행·새 export·실창·PC 실행·사용자 세이브 검증은 **미확인**. 게임 서버/앱 재시작 없음 |

핵심: 사용자 작업명에 있는 ‘합체 16종’을 현재 등록 개수로 고정하면 누락된다. 최신 원본은 **SKILL_LIST 55개, _FUSE_PAIRS 32개, _FUSE_GEM_GROUPS 32개, _SK_MUL 37개**다. 합체 reader가 있다는 사실과 합체 생성·장착·강화 UI가 동작한다는 사실은 별개다. P2-005a~d는 이미 이식된 시작 스킬 의존으로만 표시한다.

## 1. 원본 구조·함수·UI·저장 전수 지도

### 1.1 상태와 상수·공식

| 구역 | game.html 행 | 원본 계약 / 추적 범위 |
|---|---|---|
| 기본 보유·보정 | 3483~3492, 3494~3500, 3501~3530 | `_ensureBaseWingStrike`, `_resetWingStrikeUpgrades`, `_sanitizeCoreState`; 기본 shieldFuse, 기존 스킬/성급 sanitization. Q/E·저장 보호 관측만 |
| P 기본 스킬 | 29031 | `skills={kiSlash:1,fireball:1,bladeDash:1,maliceSwipe:1,shieldThrow:1}`, `_fused={shieldFuse:true}`. 최종 새게임 지급과 구분 |
| 슬롯 상태 | 27681~27682 | `SKILL_SLOTS=[null×6]`: 0~3 숫자1~4, 4 Space, 5 F; `ULT_SLOT=null`. QSLOTS 물약과 별개. 저장형식 보호 |
| SP 비용 | 3913~3930 | `_skillUpSpCost`: next=cur+1, table `[0,1,1,1,1,1,1,1,1,1,1]`, index clamp1..10, `\|\|1`; 결과 정상 정수 입력에서 항상1. `_fuseUpSpCost`: base+(gemCnt\|\|2)-1; cur>=9면 star>=4→8 / >=2→6 / 나머지 raw. `_skillSpentSp`: null/비습득0, 그 외 spCost\|\|0 + lv=1..slv-1 비용합 |
| 악의 할인 | 28080~28085 | `_MALICE_COST_MUL=.5`, n=Number(v)\|\|0; n<=0→0, 양수→max(1,ceil(n*.5)). QS-01과 공통 의존, SK-S01에서 중복 생성하지 않음 |
| 쿨다운 감소 | 28065 | `_cdRed=eq(cooldownRed)+eq(helmCooldown)+eq(endCooldownAll)+eq(skillCdRed)-lEq(_lHelmFree)-(hp<=mhp*.5?lEq(_lNeckLow):0)`; 모든 스킬에 일괄 적용한다고 추정하지 않음 |
| 자원 공통표 | 31960~31979 | `_COST_BASE`, `_COST_SK`, `_COST_DPS` 전 키는 부록C. 동일 key라도 실제 발동이 공통표를 쓰는지 별도 확인 |
| 자원 함수 | 31981~31996 | `_skLv`: 매핑 skill\|\|1; `_dpsCostMul=1+(lv-1)*(s\|\|.10)`; `_stDisc` 분류별 pBowCost 또는 pAtkCost*pMeleeStCost, gx firing .5, 음수 stCostRed만 적용. stCost weapon/shield 조기반환, 나머지 ToInt32(base*mul*(m\|\|1)*disc)와 ToInt32(mst*.9)의 min. mpCost=ToInt32((base\|\|7)*mul*pMagicCost). useStPct는 부족0/성공차감; useMp는 clamp0 후 실제 차감액. Q/E 분기는 보호 |
| 데모 | 16646~16649 | build target 기본 demo, 레벨100, 합체 허용 Set 22키. `_canFuse`가 이 Set을 읽음. 32키 전부 데모에서 가능한 것이 아님 |
| 카테고리·추천·계층 | 44082~44116 | SKILL_CATS 9종(move/phys/def/magic/bow/tech/rage/summon/ult), SKILL_REC_PATH 15단계, SKILL_HIER 4탭(rec/atk/def/spec). 상세 카테고리와 상위 탭을 혼동하지 않음 |
| 아이콘 | 44118~44151 | SKILL_ICONS alias·_skFuseIcon 우선순위·_skIcon img 경로/오류 숨김, 허수아비 상태아이콘, cd sweep 및 지속노드 갱신. _skFuseIcon에는 bladeEcho가 없음 |
| 전체 스킬 정의 | 44161~44224 | SKILL_LIST 각 레코드 id/name/cat/act/fixed/ult/hidden/noDmg/default/requires/reqLv/cd/spCost/matCost/up/upSp/upMat/desc/descEn/nameEn 등 **존재하는 키만** 보존. 부록A 55행; metadata cd와 실제 cd 별개 |
| 조회 / 슬롯 허용 | 44226~44274 | _SK_MAP/_skById; _isAreaSkillId=tech+act+!fixed; _isRageBurstSkillId=giantSlam/2 또는 cat rage. `_canAssignSkillSlot`: 미등록/!act/ult/fixed 거부→tech=5→rage=4→일반0..3. `_findAutoSkillSlot` 중복 -1·빈칸 null만, 전용→일반 순. `_repairAreaSkillSlot` displaced 순서/넘침 보존 |
| 고정 슬롯 정의 | 44277~44317 | charge/magic/bow/tech/lmb/rmb/q/ct의 skills/info/key. UI의 ‘E’/‘우클’ 명칭이 현재 실제 action과 다를 수 있음. Q/E·Shift 의미 변경 제안 없음 |
| 보석/레시피 | 44324~44486 | _FUSE_GEM_GROUPS 32·자동 _FUSE_GEMS/2·_fuseGem/Group·_allFuseGemGroups·_gemHtml·_FUSE_PAIRS 32. star override, minLv, hidden, 색, 멤버 순서 모두 보존. **minLv는 _canFuse 게이트가 아님**. 부록B |
| 합체 조회·성급 | 44487~44501 | _getFuseKey는 선언순 탐색+상위완료 skip/elecRepent 표시 선행; _isFused=!!(P._fused&&P._fused[key]); _skInnateStar=min(star\|\|len)-1, 하한1, 비멤버0; _fuseStar는 완료 그룹 최대(star\|\|len), 미합체0 |
| 배율 | 44507~44557 | _SK_MUL 37개(부록C), lv=P.skills[id]\|\|1, 미등록표1. 정확식 `t.b+(lv-1)*t.g*0.5`. `_fuseMul`: star>=2→1+(star-1)*.2, 나머지1; chargeBoost/magicBlink만 skillBoost 미적용, 그 외 *(1+eqAffix(skillBoost)) |
| 숙련도 | 44560~44607 | CATPROF_REQ=600, SK_CAT는 SKILL_LIST에서 구성+meleeAttack/shieldBash phys. _catProfVal/_skProfVal fallback, _skProfLv=ToInt32(sec/10), _skProfMul=1+lv*.02, cap9999. addSkProf는 레슨 중 skip, v\|\|(cd?ToInt32(cd/60):5) 카테고리 적립·skProf 호환쓰기; tick은 dtSp/60. cardProf=min 멤버숙련, fuseProf는 위임, FUSE_TIME_REQ={} |
| 실제 합체 가능·흡수 | 44608~44642 | `_canFuse`: 존재/데모허용/미완료/모든 멤버 Lv>=1만 검사. 숙련·minLv·동급성·선행합체·SP 검사는 없음. _getAbsorbed 정적표 / _getAllAbsorbed 선언순 중복제거 / _isAbsorbed omniBeam 예외. 이름 KO/EN 뒤 bladeEcho 동적 추가 |
| 활성 변수 동기화 | 44644~44664 | _syncActiveSkAfterReset의 호스트 whitelist와 각 active*Sk fallback; 선택/compact/expanded transient. source의 서로 다른 호스트표를 통합한 새 규칙으로 바꾸지 않음 |

### 1.2 함수·UI·발동 연결

| game.html 행 | 함수 / 실제 역할 |
|---|---|
| 2562~2564, 2575~2605, 2664, 3079~3091 | skill-workspace.css·skill-forge.css/js 로드, HUD 숫자/필살/고정 스킬 DOM. UI 스타일은 외부파일 의존 |
| 12905~13092 | `_dispatchSkillSlot(slotIdx,keyCode)`: G/paused/dead/fallen·배정·흡수·gw/io 가드→스킬별 게이트/실행→성공숙련. default는 보유 여부 반환. 모든 등록55종 발동의 공통 owner는 아님 |
| 13093~13125, 13270~13327 | Ctrl dispatcher·숫자/Space/F/필살 입력 및 cycle/ULT 표시 접점. 실제 BINDS 의미는 SETTINGS 추적·Q/E 보호 |
| 28267~28374, 28376~28566 | updateQS/_updateUltSlot/cdMap/활성 표시·스택·키캡. 슬롯 표시는 보유·장착·흡수와 쿨다운을 함께 소비 |
| 32705~32721 | 영역 존재 판정→flat HP/MP/ST→rates→자연회복. P2-005d 의존; 새 중복 회복 owner 작성 금지 |
| 35912 이후, 36500~36715 | update 후반 스킬별 cd/charge/timer, _hdCdBonus 적용 차이, io 자동파쇄·탈출. 정확한 식별자별 모든 행은 부록D |
| 44023~44079 | PANEL_TABS, nav, togglePanel/openPanel/back/closeAllPanels: K 패널·paused·팝업/선택 해제 |
| 44668~44835 | _skDetailHTML / _skSpecificDetails: 상세 추정 피해(별도 lvMul=lv), SP/악의/요구레벨/cd 설명. 실제 피해식 대신 사용 금지 |
| 44836~44878 | _execDimBreach 특수 발동(보호 이동기 접점) |
| 44879~44941 | updateSkSlot/Bow/Magic/LMB/Q/RMB/Ct/TSlot 및 _initFixedSlotKeys; 합체명·아이콘·키·고정기술 표시. Q/E 보호 |
| 44965~45007 | _openSkillSlotPop: 선택 슬롯 후보·합체흡수/배정필터, 슬롯 변경·저장 호출 |
| 45008~45093 | bladeEcho 기록/종료/재입력/틱/VFX. 기존 bladeFuse 단순 alias로 취급 불가 |
| 45094~45465 | 악의사냥·독사·뇌전추격자·폭풍소환·해골무덤·석궁선택·전격이동 함수. 부록D의 skill ID 전 참조행으로 입력/틱/투사체/렌더 소비를 역추적 |
| 45466~45567 | 천공쇄기 spec/충전/시전, 가시덫·공성쇠뇌·유령허수아비 |
| 45568~46164 | 전대 자산/부품·도감·스탯·소환/행동·회수·폭발허수아비. inventory/무기/소환 전문영역 의존으로만 분리 |
| 46165~46447 | 폭독칼날·기본 불꽃칼날·악의기둥·기동파괴. Q/E·이동기 보호는 수정 배정하지 않음 |
| 46448~46822 | 지옥강타/명중, ghostWalk·영역·iceOrb 형성/파쇄. P2-005b~d의 이미 있는 시작 경로와 나머지 분기 분리 |
| 46823~46965 | blackStar·탄막블랙홀·fireHellfireBeam. ultSlot 저장/선택과 실제 발동은 별개 |
| 46966~47083 | openSkSlotPop/close·selectChargeSk: L 고정슬롯 선택·흡수 필터·pause 소유·저장. 고정 Q/E 선택은 보호 관측 |
| 47084~47186 | 드래그 start/activate/move/up: 5px threshold, ult·일반·Space/F·Shift/tech 배정, 중복제거·refresh·저장 |
| 47192~47233 | _skillBatchUp: 큰 완료그룹 우선·claimed 중복방지→minLv, member count로 fuseUp 계산→개별 미claim up·SP/악의오브 차감; max20·레벨락 min(20,ToInt32(P.lv/50)+1) |
| 47235~47272 | _execFuse: **canFuse 통과를 호출자가 보장**. star*3 선차감→멤버 강화분 환불/Lv1→fused=true→특정 LMB/히든→흡수슬롯해제→별도 호스트표 자동배정→active 동기화. 임의 direct 호출에 자동 검증/원자성/rollback 추가하지 않음 |
| 47274~47326 | _learnSkillAuto / _skillRecAuto: 단계순 습득·선택필살 첫항목·reqLv·부분진행·합체, 강화는 안 함. source의 requires 검사와 호출부 차이는 후속 gate 인수 때 구분 |
| 47327~47588 | renderSkillDetail/renderSkillPanel: **47370에서 기본 SkillForge.render 후 return**, 그 아래 구 카드형은 ?skillForge=0 폴백. 정상 기본 UI를 구 카드형만으로 이식하면 불완전 |
| 47589~47677 | 카드 합체선·아이콘 집합(구 UI) |
| 47678~47765 | _skCtx: learned/req/reqLv/가용자원·합체호스트 31개 분기·비용표시/레벨락. bladeEcho는 이 강화 분기에 없음 |
| 47767~47817 | _skLearnUp: 습득/합체강화/개별강화·슬롯동기화·저장. 합체 강화의 실제 gemC=member count, 표시 _skCtx는 star override 사용(불일치) |
| 47819~47882 | _skLevelDown: 최고 멤버수 완료그룹에서 star 기준 환불·멤버감소 / 개별SP+upMat 악의오브 환불. 이름과 달리 Lv1에서 해제 안 함 |
| 47884~47954 | _skResetSkill: 확인→기본shieldFuse 별도 보호처리 / 최대그룹+겹치는 실제 fused key 환불/해제 / 무료기본기 강화분만 환불. 악의 일반reset 미환불. 보호 Q/E 분기 이식은 별도 HOLD |
| 47955~48520 | _renderSkillRow: 구 UI의 습득/강화/레벨다운/reset/합체 버튼·드래그/툴팁, 실제 handler는 위 공용 함수. UI와 원장 함수를 동시에 복제하지 않음 |

외부 기본 UI 의존(동일 pin): `skill-forge.js` 424행 SHA256 `ef68ac45d6d05805f7f088eba7a1daff2f1158fcdd6177f0a7f501ea3add11a0`. :11 MAX_SOCKETS10, :17~24 13슬롯, :28~44 host/group/star/hidden/demo, :57~84 slotValue/eligible/canEquip/equip, :86~114 staged model·정확한 set 일치, :115 원형 소켓, :119~149 DOM, :155~266 슬롯/제단/트레이, :267~302 상세/비용/버튼, :303~333 로드맵·doFuse, :334~378 드래그, :379~402 three loader, :403~424 render/export. `doFuse:318~331`은 _canFuse 검사→확인창→_execFuse(SP 검사/차감 포함)→재렌더/저장 순서다. `skill-forge-3d.js`, CSS, vendored three r186의 Godot 동등 시각은 **미확인**이며 새아트 생성 제안 없음.

### 1.3 저장 필드와 index.html 경계(전부 보호)

| 원본 필드 | 생산자 game.html | 복원 / 의미 |
|---|---|---|
| skills | 3562 / 63918 / 64075 / 62147 / 62007 | P.skills. 3771 이후 복원 및 삭제/키이관·기본보충. 스키마 변경0 |
| fused / skProf | 3563 / 63919 / 64076 / 62148 / 62008 | P._fused/P._skProf, restore3781~3783. 하위합체 보충3800~3831·레거시 삭제는 SAVE 소유 |
| fuseProfSec / cardProf / catProf | 3563 / 63919 / 64076 / 62148~62149 | P._fuseProfSec/_cardProf/_catProf, restore3784~3786. 500데모 생산자62008에는 이 세 필드 없음. 자동 추가하지 않음 |
| activeCharge/Bow/Tech/Magic/LMB/RMB/Q/CtSk | 3564~3571 / 63920~63927 / 64077~64084 / 62150~62157 / 62009~62015 | 마지막 500데모에는 activeTechSk 없음. 복원3836~3877. Q/E 필드 보호, 동일 기본값이라고 합치지 않음 |
| skillSlots / ultSlot | 3572~3573 / 63928~63929 / 64085~64086 / 62158 / 62016 | 전역→payload, restore3881~3884→sanitize·repair. Godot P.skillSlots/ultSlot runtime 위치와 웹 save key를 구분 |
| level/SP/mats | 3543~3575 등 각 생산자의 player/game | 관리 원장의 입력. 실제 SP 지급·레벨해금과 mats 공유 저장은 TRACE-META/SAVE 소유 |
| 새게임·보존 | 63994~64014, 62035~62042, 62189~62191, 62498~62499 | 난이도 시작지급·로컬 슬롯배정 및 경로별 CT 후처리. 이미 P2-005a 의존, 이번 재이식/수정0 |

index.html 전체에서 `skill/Skill/fusion/Fusion/_fused/_catProf/_skProf/스킬/합체` 관리 식별자 직접 구현은 검색상 없음. 스킬 데이터가 없다는 뜻이 아니라 **불투명한 세이브 전체 전달**이다. :2921/2936·3436/3450 신규메타(name/ts/charIdx), :3488~3519 demoSlotRead/sync/activate는 raw JSON 전체를 보존/교환, :3522~3656 캐릭터 목록/선택/삭제, :4340~4349 game.html 진입 URL 전달. 스킬 레벨·슬롯·합체의 로비 편집 UI는 이 파일에서 발견하지 못함. 전체 저장 직렬화/복원은 [SAVE 추적](FDG_SOURCE_TRACE_SAVE_20261020.md) 부록C에 위임하며 보호 형식 변경 제안 없음.

## 2. 설계 docs와 최신 원본 불일치 표(보고만)

아래 약칭 D1=`docs/2_1 스킬관리+합체시스템+자원/2_1 스킬관리+합체시스템.md`, DR=`같은 폴더/자원리젠+소모공식.md`, REC=`같은 폴더/추천빌드_SKILL_REC_PATH.md`, DM=`docs/14밸런스+수치테이블/스킬데미지공식표.md`, DC=`같은 폴더/자원소비량표.md`, BR=`같은 폴더/스킬_밸런스_리포트.md`.과거/설계/현행이 한 문서에 공존하며 아래 판정은 전게임 밸런스 재설계나 수정 승인이 아니다.

| ID | docs 주장·행 | 원본 근거 / 차이 | 후속 처리 |
|---|---|---|---|
| X01 | D1:485 ‘19종+히든’, :1135 전후 ‘27개’ 및 목록 | 44453~44486 실제32. 사용자 제목16종과도 분모 다름 | 32키 전부 추적. 기존 문서/제목 수정0 |
| X02 | D1:1184 ‘모든 스킬10 SP’ | 44222 timeWarp15, chainSlash/peaceShield/hellRay/burstLoop0; 부록A | 정상 원본값 그대로; 공짜 지급과 학습원가를 분리 |
| X03 | D1:1107~1108 / REC:8~9 동급성끼리+최고성급+1 | 44608~44616는 해당 비교 없음, star는 override\|\|멤버수 | 설계 원칙과 실행 gate를 구분. 새 제한 추가0 |
| X04 | D1:491~494/595/600/710 선행합체, stormBeam 각3h | D1:482/1176는 제거됐다고 명시; _canFuse도 선행/숙련 검사0. UI staged 정확set 정책은 skill-forge:92~114에 별도 존재 | 원본 내 UI 표현/실행gate 차이까지 기록; minLv/600을 강제로 gate화하지 않음 |
| X05 | D1:480 카테고리7종 | 44082~44092는 rage/summon 포함9; _SK_CAT도55레코드에서 파생 | 누락2종 포함; 저장 필드 추가 제안 아님 |
| X06 | D1:635 elecRepent2성 vs :1160 목록3성 | gems44340에 star없음·2멤버 → fuseStar2 | 내부 docs 불일치; 현행2를 trace에 보존 |
| X07 | D1:603 stormBeam이 detonate/giantSlam 등4개 자동해금; :604 stormBurst가 burstLoop 해금 | 47251~47256 실행은 peaceShield/hellRay만. detonate/giantSlam은 레시피 선행보유; burstLoop는 _execFuse에서 부여하지 않음. restore3804~3806는 별도 보충 | 생성/restore/표시설명 분리. 저장 보호 |
| X08 | D1:750 timeStep 완료 시 CT 자동전환 | _execFuse47235~47272에는 timeStep 전용 CT 대입 없음; 3877 restore·13100 dispatcher·44920 HUD에서 전환 | 최종 전환 시점·owner를 구분. 새 보호 writer0 |
| X09 | D1:1116 별표 규칙/등록목록과 bladeEcho 추가절1600 | 32개 레시피 중 bladeEcho는 _getAbsorbed44618 및 _skCtx47752/호스트자동배정47263 목록에 없음. 이름44640/기본포지hostOf는 존재 | 누락을 무작정 보완하지 않음. 강화/흡수/장착 설계 결정 미확인 |
| X10 | D1:1183 합체강화 ‘성급’ 기준 / :133 멤버수 적용 | _skCtx47758 및 minus47861~47864/reset47923은 override star, apply47801·batch47206은 멤버수. stormBeam star4/멤버6이면 cur1 표시4·실차감6; siegeGhost star3/멤버2면 표시3·실차감2 | **원본 내부 불일치**, 표시/실행을 한 식으로 통일하지 않음; SK-S05 선행 인수 사항 |
| X11 | D1 강화 기존 ‘10렙 마지막 cap’ 설명 | 3923은 cur>=9 전체에6/8 적용; max20이므로 Lv10 이후도 지속. 3911~3912 주석의 일반1/2/3/5는 실제3915 전부1과 다름 | SK-S01은 실행식·0/1/8/9/19/20 경계 고정 |
| X12 | DM:40/44 ‘Lv1→20 약1.5~2배’ | giantSlam20→200.5(10.025배), fireball13.2→113.52(8.6배), kiSlash12→107.76(8.98배); 44509/44535/44543/44556 | 정성 요약 불일치, 재밸런스0 |
| X13 | DM:163 회전참 b2.5/g2.1, :169 chainSlash b3/g2.4 / BR:95 동값 | 44529 whirlwind b25/g24, 44547 chainSlash b3.5/g2.8 → Lv20 253 / 30.1. 과거 DPS 순위를 현행으로 사용 불가 | _SK_MUL 원표37행을 별도 고정 |
| X14 | DC:76~79 fanShot/bladeShot/blastShot 비용50계열 | 31963 공통 base35 (fanShot Lv1=35, Lv5=56, Lv10=82; cap/할인 전 ToInt32), DC:42~46 자체 표와도 다름 | 실제 개별 발동의 직접 비용은 별도 분기이므로 공통표 수정을 전스킬 비용변경으로 확대하지 않음 |
| X15 | DR:125~126 charge/finisher250,+10%, :115 pMagicCost최소60% | 31962 base50/31976 성장.45; pMagicCost는 28041 실제 max(.40,...) | 구표/현행표 상충. Q/E/기동 보호 수치 수정0 |
| X16 | DR:23 본편 회복 공급 미연결 | main.gd:255~261/761 이후 + test_p2005d_regen_wiring.gd가 P2-005d 실제 부트연결을 검사 | 과거 문서 시점과 현재 source를 구분. 이번 Godot 재실행 PASS 아님 |
| X17 | D1 상세 단독 thunderStake10초 / timeWarp Lv20 MP150 | 수동확정900+(lv-1)*30 및 시간왜곡50+(lv-1)*ToInt32(100/19)=145. D1:1687~1739에 이미 차이를 인정 | 알려진 불일치 보존; 목표값/의도 **미확인**, 자동 교정0 |
| X18 | 추천 경로 문서 REC는15단계 | 기존 test/skillRecommendationOrder.test.js:13은14, 실제44100대 SKILL_REC_PATH는15 | 기존 테스트 실패1 기록. source/docs 원복·기대값수정0 |

키워드 검색은 docs 전체에 수행했으며 매칭 경로 목록은 Git밖 `_out/trace-skills/docs-keyword-paths.txt`에 보존했다. 2_1/14 관련 텍스트·수식·신규캐릭/프로젝트 감사·자원게이트 문서도 검색했으나 사용자 초안/HOLD 내용을 현행55종 registry로 편입하지 않는다. .docx 내부 추가설계 및 외부 링크 내용은 **미확인**; 이번 추적에서 열거나 변경하지 않았다.

## 3. 실제 Godot 의존·미이식 상태

| 구분 | 실제 파일·행 / 테스트 근거 | 현재 판정·한계 |
|---|---|---|
| 시작 보유·슬롯 | native_source_new_run_state.gd:111~113/457~471, test_p2005a_start_skills.gd:65~119 | **이미 이식된 P2-005a 의존**. 기본5종+시작종·6슬롯/ULT·HUD 검사. 이 추적의 신규 완성범위에 산입0 |
| 시작 시전·쿨 | native_skill_slots.gd:33~71/99~159/212~371/511~698/808~835; main.gd:244~249; test_p2005b_giant_slam.gd:81 이후, test_p2005c_spike_holy.gd, test_p2005d_ice_orb.gd:81/122/198 | **P2-005b~d 의존**. implemented는 giantSlam/spikeTrap/holyDome/iceOrb 네 종류. hardwired 입력→각 cast로 연결, P.skillSlots를 읽는 일반 dispatcher 아님. 기존 파일 재작성0 |
| 자연 리젠 | native_source_player_regeneration_phase.gd, native_resource_regeneration_adapter.gd, main.gd:761 이후; test_p2005d_regen_wiring.gd:65 이후, test_native_source_player_regeneration_phase.gd:187~296 | **P2-005d 의존**. 돔 존재/flat·자연 ST/MP/HP 공급자는 이미 있음. 새 스킬관리 모듈에서 회복 재적용0 |
| readonly 합체성급 | port_modules/fusion_star_source/producer.gd:38~105(32키),173~223; native_source_player_providers.gd:95~124/180; test_native_main_source_starter_state.gd:129~149, test_native_source_player_regeneration_phase.gd:155~173 | 현재 P._fused reader·32레시피/override star·READY/NOT_READY 존재. source와 pair/star 집합 정적 대조 가능. `_canFuse`/생성/원장/흡수/강화/UI는 이 모듈 비소유. 기존 SOURCE_REF는 옛행이며 최신 main에선44453 이후 |
| 배율 일부 | port_modules/detonate_blast/producer.gd:113~123, holy_dome_flat_heal_source/producer.gd:208 이후; main.gd:1695~1719/2249 전후, fireball_cast_source/producer.gd | 특정 스킬 skMul/fuseMul/skillBoost 소비 존재. 37개 공용 registry와 슬롯 전체 배율 writer가 구현됐다는 증거 아님 |
| 실제 G/P·자원 권위 | native_source_new_run_state.gd:175~185/447~471/549 이후, native_source_resource_authority.gd의 commit_native_skill_stamina_spend/commit_native_skill_mana_spend | mats·현재P·실제 Player ST/MP 소비 API 존재. **SP 관리/습득/합체/환불 commit API는 검색상 없음**. 임의 P dict 직접쓰기/기존 권한 확대는 다음 구현으로 추정하지 않음 |
| HUD 읽기 | hud.gd:846~870, _native_slot_skill_id 및 NATIVE_SKILL_ICON_FILES; test_p2002a_hud.gd 및 시작스킬 테스트 | 시작 아이콘·키캡·4쿨 존재. 55종 아이콘/합체우선순위·13칸 재배정/UI·모든 스택/활성 표시 미이식 |
| K/L 관리창 | tracked godot gd에서 SkillForge/SKILL_LIST 전체 registry/_skillUpSpCost/_skillBatchUp/_execFuse/_skResetSkill에 대응하는 관리 owner 검색 | **미이식**. game.html 함수명을 찾지 못한 것만이 아니라 main/hud/native_skill_slots의 실제 호출범위도 대조. 별칭 구현·미병합 WIP 존재는 미확인 |
| 숙련도 | native fireball finish 및 providers 일부 source_prof 경로, 레슨 owner | 일부 magic 숙련적립은 존재하나 전체9카테고리 tick/순간형·카드/합체 호환·관리 UI 연결은 미이식. P2-005 네 cast의 숙련 전 경로 동등성은 미확인 |
| 전체 레벨/학습 조건 | test와 State의 시작/경험치 자동해금 경로는 존재 | 요구레벨300/500/700·requires·데모정책·SP 회계·일괄강화·추천자동 관리 흐름은 미이식. 시작지급을 정상 학습 소비로 오인하지 않음 |
| 세이브 | port_modules/save_adapter/source_save_lifecycle_owner.gd·raw_grit_restore.gd, player_passives_source/producer.gd:161 이후, SAVE 추적 §3 | 전체 skills/fused/mastery/active/slots 저장·복원 소비자는 미연결. 보호. 초기 constructor/partial restore를 전체 저장완료로 표시하지 않음 |

파일 기준 경로는 모두 `godot/` 아래이다. 위 테스트의 **본문 존재·검사 대상 정적 확인**과 과거 병합 문서의 PASS는 구분한다. 이번에는 Godot 실행/전체 재검수/시각 인수를 하지 않았다. 부록B의32키가 reader에서 지원된다는 이유로32개 합체 효과를 완료로 올리지 않는다.

## 4. 작은 이식 단위 순서안

### 4.1 1번 SK-S01 — SP 비용·누적 투자액 순수 모듈(바로 구현 가능한 범위)

**목적:** 실제 P/G/UI/저장에 쓰기 없이 원본3913~3930의 세 함수를 옮긴다. 공용 파일 **0줄**, 기존 제품 파일 **0줄**. 악의 할인(_malCost)은 QS-01과 겹치므로 이 단위에 넣지 않는다.

| 항목 | 구체적 구현 지시 |
|---|---|
| 신규 파일 | `godot/port_modules/skill_management_cost_source/producer.gd` (RefCounted, autoload/class_name 불필요), `godot/tests/test_trace_skills_s01_costs.gd`. 엔진이 생성한 이 신규 파일의 .uid만 필요 시 동일 경로 단위에 포함. 이번 추적에서는 생성하지 않음 |
| 수정 파일 | 다음 차례에 본 추적 문서의 SK-S01 구현/검수 상태만 갱신. main.gd/hud.gd/world.gd/player.gd/native_normal_enemy_hurte.gd/native_source_new_run_state.gd/project.godot/설계 docs/기존테스트는 **0줄** |
| 원본 소스 | game.html:3913~3917 `_skillUpSpCost`, :3918~3925 `_fuseUpSpCost`, :3926~3930 `_skillSpentSp`. :3911~3912 역사 주석은 실행수치가 아님 |
| 제안 API | static `skill_up_sp_cost(cur_lv: Variant)->Dictionary`, `fuse_up_sp_cost(cur_lv: Variant, gem_count: Variant)->Dictionary`, `skill_spent_sp(skill: Variant, skill_lv: Variant)->Dictionary`. READY/value 또는 NOT_READY/reason/input 보존. 이름/API는 후속 구현계약이며 아직 없음 |
| 지원 범위 | 정상 게임 입력인 finite 정수 cur/skillLv 0..20, gem 0..7, skill은 null 또는 spCost 누락/0..15 정수인 Dictionary. gem0은 source falsy default2. raw input 참조를 보존하되 수정하지 않음. String/boolean/StringName/Array/nonfinite/범위밖은 NOT_READY(원본 JS 전체 coercion 이식 완료라고 주장하지 않음). null skill·slv0은 source0; 지원검사/조기반환 순서를 문서화 |
| 옮길 상수 | index clamp1..10, 위11원소 테이블, gem fallback2, cur>=9, 고성급 cutoff4→8/2→6. **maxLv20은 caller 정책**, 이 함수의 입력을20으로 clamp하여 다른 값을 READY로 바꾸지 않음 |
| 그대로 옮길 식 | next=cur+1→table[clamp(next,1,10)]\|\|1; raw=base+(gem\|\|2)-1; cur>=9의6/8 분기; spent=spCost\|\|0 + for lv=1;lv<slv;lv++의 upgrade cost. source의 unused 2nd arg false를 새 할인flag로 만들지 않음 |
| 실제 기대값 | cur0..20 일반 항상1. gem0/1/2/3/4/5/6/7의 cur8 결과2/1/2/3/4/5/6/7, cur9·19·20 결과6/1/6/6/8/8/8/8. cur1,gem6=6(암전나선 실제 apply)와 gem4=4(표시) 둘 다 보존. null/{}의 lv0→0, {}의 lv1→0/20→19, spCost10의 lv1/10/20→10/19/29, spCost15 lv20→34, spCost0 lv20→19 |
| 핵심 단정 | 경계8→9, gem0 fallback, star4/멤버6를 함수가 추정하지 않음, 고레벨도6/8 지속, 합산은 전체학습원가 포함·무료기본기 차감은 caller, 입력dict 및 nested sentinel identity/bytes 무변경, 연속반복호출 동일, P/G/InputMap/저장/자원/오디오 호출0 |
| oracle | 이 문서 pin의 원본 세 함수만 Node Function/VM에서 발췌해 위 legal 입력 전조합 결과와 비교. 새 registry나 스텁 game P를 원본으로 만들지 않음. fixture는 테스트 소유값으로 명시하며 사용자의 actor/세이브 주입0 |
| 새 테스트 / 격리 폴더 | `godot/tests/test_trace_skills_s01_costs.gd`, user folder **`EXODUSER-TRACE-SKILLS-S01-Isolated-20261020`**. 자기 worktree의 기존 `godot/override.cfg` 존재·원 bytes를 먼저 보존하고 테스트 동안만 `[application] config/use_custom_user_dir=true`, `config/custom_user_dir_name="EXODUSER-TRACE-SKILLS-S01-Isolated-20261020"`를 설정한다. 프로젝트의 `project.godot` 및 전역 editor_settings는 변경하지 않는다. 종료 시 자기 override를 정확히 원 bytes로 복원하고 stage하지 않는다 |
| 실행·종료 | 기존 Mac 검수 보고서의 실행 파일 `/Users/fordeargamers/.codex/tools/godot-4.7.2/Godot.app/Contents/MacOS/Godot` 존재·버전을 확인한 뒤 `--headless --path <WT>/godot --script res://tests/test_trace_skills_s01_costs.gd`로 실행한다. 격리 불일치는 nonzero로 종료/미검수 표기(SKIP를 PASS로 세지 않음). no Main boot·no asset import·no 사용자 디렉터리 읽기/쓰기. 기본 런타임 연결은 안 하므로 성공을 실게임 기능완료로 표시하지 않음 |
| 선행·충돌 | 비용API가 최신 fetched main에 새로 생겼는지 경로/내용 확인, 이 pin 이후의 새 관리 담당 소유 확인. 위 신규2경로는 조사 pin에서 부재. QS-01/TRACE-META와 원장/악의오브할인 중복 없음, P2-005a~d 변경0. 별도 보호승인/새 저장형식 불필요 |
| 완료 기준 | 신규 모듈+새 격리테스트+관련 추적문서만 경로지정 commit/push. 원본 경계 전조합·NOT_READY/순수성 검증 로그와 정확 counts/exit 보존. 기존 product와 R byte 불변. main 병합은 총괄만 |

격리법의 근거는 `orders/reports/MAC-TESTSWEEP_REPORT.md:16~33` 및 `mac-verify_REPORT.md:29~33`의 worktree-local override 방식이다. 다음 실행은 effective ProjectSettings 두 값과 `OS.get_user_data_dir()`의 실제 이름을 단정해야 한다. 위 설정은 테스트 설계이며 이번에 테스트 파일/override를 만들지 않았다.

### 4.2 2번 이후(모두 미착수)

아래 파일 경로는 `godot/` 기준이다. 각 단위 구현 시 본 추적 문서의 상태/검수 구역도 함께 갱신한다. 단위마다 신규 테스트는 해당 단위 이름의 고유 user folder를 **필수로 확인**한다. 표의 파일명·라인수는 계획이며 구현된 API가 아니다. 보호 Q/E·저장 변경은 어느 단위에도 몰래 포함하지 않는다.

| 단위 | 만들/수정할 파일·공용 예상 | 원본 행·옮길 상수/공식 | 새 테스트·핵심 단정 / 격리 user folder | 선행·충돌 |
|---|---|---|---|---|
| SK-S02 registry readonly | 신규 `port_modules/skill_management_source/catalog.gd`, `tests/test_trace_skills_s02_catalog.gd`; 공용0 | 44082~44118/44161~44324/44324~44362/44453~44486/44507~44557;55정의·32순서·star/색/minLv/hidden·37계수·slot flags. 기존 fusion_star_source의32레시피/override는 그대로 read/비교하고 중복권위 생성하지 않음 | 전체 key/멤버순서/override 집합·metadata cd≠시전cd·미등록 스킬 조회 명시, 반환copy로 원표불변; `EXODUSER-TRACE-SKILLS-S02-Isolated-20261020` | S01. 새 catalogue와 기존 readonly fusion 공급의 소유계약 인수. 아이템/무기/시작스킬 수정0 |
| SK-S03 합체/흡수 readonly 판정 | 신규 `port_modules/skill_management_source/fusion_rules.gd`, `tests/test_trace_skills_s03_fusion_rules.gd`; 공용0 | 44487~44501/44565~44618/44620~44642, canFuse 네 gate·demo22·innateStar/min/max·absorption/omniBeam 예외·별표색. _fuseStar는 기존 provider 재사용 | 32키 full/demo·누락/이미완료·멤버0/1·600미만이어도보유시가능·minLv 미강제·bladeEcho absorbed[] 현행·unknown false와NR 경계; `EXODUSER-TRACE-SKILLS-S03-Isolated-20261020` | S02. ‘선행/동급성’ 미검사·bladeEcho 누락을 수정으로 바꾸지 않음. Q/E 판정/쓰기0 |
| SK-S04 슬롯 read model | 신규 `port_modules/skill_management_source/slot_rules.gd`, `tests/test_trace_skills_s04_slots.gd`; 공용0(명시소유fixture) | 44230~44274/46969~47083/skill-forge57~114; numeric0..3·rage4·tech5·ULT별도·fixed/absorbed filters·null 빈칸·중복/repair 순서. 고정 Q/E는 readonly 목록만 | 일반4칸 가득/전용충돌·기존배정중복·F/Space 역배정 repair 결과·absorbed미노출·13슬롯 model; `EXODUSER-TRACE-SKILLS-S04-Isolated-20261020` | S02/S03, SETTINGS 입력 재지정과 별개. P2-005 hardwired input은 재배정하지 않음 |
| SK-S05a 개별 학습 core | 신규 `port_modules/skill_management_source/learn.gd`, `tests/test_trace_skills_s05a_learn.gd`; 공용0 | 47274~47295/47743~47748/47768~47793; spCost·malCost·req/reqLv·중복 보유·학습 뒤 슬롯 규칙. 원 UI gate와 direct handler의 검사 차이를 기록 | SP/악의오브 각각1 부족·0원가·reqLv299/300·499/500·699/700·chainAssault 보충·기존 입력불변; `EXODUSER-TRACE-SKILLS-S05A-Isolated-20261020` | S01~04, QS-01 할인 의존. fixture 소유 P/G만 사용, META의 실제 SP 지급과 보호 active Q/E writer는 제외 |
| SK-S05b 단건 강화 core | 신규 `port_modules/skill_management_source/upgrade.gd`, `tests/test_trace_skills_s05b_upgrade.gd`; 공용0 | 47678~47765/47794~47817; max20·lock=min(20,ToInt32(P.lv/50)+1), 합체 minLv·표시star와 apply member-count 비용을 분리 | 49/50/949/950 레벨 경계·SP 경계·무료 upMat·미학습/흡수·stormBeam4표시/6실차감·siegeGhost3/2; `EXODUSER-TRACE-SKILLS-S05B-Isolated-20261020` | S05a, X09/10 총괄 인수. 원본 불일치를 자동 정정하지 않음. shieldFuse/QE upgrade 적용은 보호 HOLD |
| SK-S05c 합체 생성 core | 신규 `port_modules/skill_management_source/fuse_commit.gd`, `tests/test_trace_skills_s05c_fuse.gd`; 공용0 | 47235~47272; star×3 선차감→강화분 환불/Lv1→fused→흡수슬롯/호스트·히든. 원본 호출자 gate와 내부 실행 순서 분리 | 32레시피 원장·SP1 부족/정확·환불로 SP가 늘어도 선차감 gate 유지·흡수/호스트 누락현행·중복 호출자는 gate에서 거부; `EXODUSER-TRACE-SKILLS-S05C-Isolated-20261020` | S05a/b, S03. readonly fixture 단계만. stormBeam의 보호 active writer·실제 shieldFuse 생성은 별도 HOLD |
| SK-S05d 레벨다운·환불 core | 신규 `port_modules/skill_management_source/refund.gd`, `tests/test_trace_skills_s05d_refund.gd`; 공용0 | 47819~47954; 최고 멤버수 선택·override star 비용환불·겹치는 실제 fused key 집합·무료기본기 학습비 제외·단건 minus와 reset의 악의오브 환불 차이 | 최대그룹 동률 순서·겹침집합1회·미등록키 fallback·cancel 무쓰기·minus 악의오브반환/reset 미반환·Lv1 유지; `EXODUSER-TRACE-SKILLS-S05D-Isolated-20261020` | S05a~c, X10 인수. `_resetWingStrikeUpgrades`와 Q/E active 동기화는 보호·별도 HOLD |
| SK-S05e batch·추천 core | 신규 `port_modules/skill_management_source/batch_recommend.gd`, `tests/test_trace_skills_s05e_batch.gd`; 공용0 | 47192~47233/47299~47326, SKILL_REC_PATH15; 큰그룹 우선 claimed·멤버수 비용·lock20·부분진행·pick 첫후보·학습/합체만(강화 없음) | 중복 멤버 과금 방지·SP/악의오브 부족 단계 skip·reqLv·demo22·ult 이미보유 skip·반복추천 추가과금0·batch와개별구분; `EXODUSER-TRACE-SKILLS-S05E-Isolated-20261020` | S05a~d·META 자원 소유 분리. 제품 dbSaveForce/보호선택 쓰기 제외, actual owner 연결은 S06 |
| SK-S06 실제 관리 writer 배선 | 신규 `scripts/native_skill_management.gd`, `tests/test_trace_skills_s06_owner.gd`; State에 **승인된 skills/SP/mats·비보호slots writer만** 추가 후보, main configure최소 호출 | 47235~47294/47767~47954의실제write 순서·caller gate·refresh통지. `read_current_p`가 있어도 dict직접변이 권한을 추정하지 않음 | 실제 current P/G동일성·ownerloss·중복요청·prefix·기존시작스킬 불변/재초기화0·원장미준비시NR; `EXODUSER-TRACE-SKILLS-S06-Isolated-20261020` | S05각core·State/Resource/P2공용소유조정. 전체세이브/보호Q/E/active writer는 연결HOLD. 예상공용줄수는 exactscope **미확인**, 임의확장0 |
| SK-S07 K/L 관리 UI | 신규 `scripts/native_skill_management_panel.gd`, `scenes/ui/native_skill_management_panel.tscn`, `tests/test_trace_skills_s07_panel.gd`; main/hud의open/close seam만조정 | 44023~44079/46969~47083/47327~47588 및 skill-forge.js11~424;13슬롯·제단정확set·동급배치·정보/강화/분해·확인취소·ESC/pause. 3D미완은별도표기 | standalone fixture의focus·resize·장착거부·확인취소쓰기0·표시cost≠actual경우표본·1x화면과폴백·닫기pause복원; `EXODUSER-TRACE-SKILLS-S07-Isolated-20261020` | S04/S06. P2-007a폰트/UI·SETTINGS host 조정. 보호Q/E 선택변경/저장호출0, 시각미검수는RETOUCH |
| SK-S08 일반 발동·숙련 bridge | 신규 `port_modules/skill_management_source/mastery.gd`, `scripts/native_skill_dispatch.gd`, `tests/test_trace_skills_s08_dispatch.gd`; 기존 native_skill_slots의 승인된4종 routing seam만후보 | 12905~13125/44560~44607 및 실제update타이머; 보유·배정·흡수·io/gw gate·성공때숙련·tick dtSp/60. scalar비용표31960~31996는 각callsite인수후별도reader | 재배정후1키가 실제지정4종만호출·거부차감0·일반보유default를성공시전으로날조0·레슨숙련skip·tick1회·cd소유중복0; `EXODUSER-TRACE-SKILLS-S08-Isolated-20261020` | S06/S07·P2-005owner인수·후반clock소유조정. **시작4종 외 나머지51개 registry 항목의 발동 이식을 이 단위에 넣지 않음**; Q/E/Ctrl/Shift 경계는 담당별HOLD |
| SK-S09 효과별 후속/저장 인계 | 신규 `port_modules/skill_management_source/fusion_effect_contract.gd`, `tests/test_trace_skills_s09_contract_handoff.gd`; 공용0. 32키의 효과 입력/출력 의존 manifest만 작성 | 부록B32레시피 및 부록D원본각효과참조; 우선 후보 pillarSpike는 darkPillar 미이식 선행, holyFuse는holyPrison 선행. 32개를한단위로하지않음. 저장필드는§1.3을SAVE에읽기인계만 | 각합체의host/흡수/실제damage/zone·원본자산·SFX·불충분자원·연속시전·1x화면필수. handoff folder `EXODUSER-TRACE-SKILLS-S09-Isolated-20261020`; 개별효과별고유suffix는배정시확정 | S08·미이식효과/전투·무기·아이템선행. SAVE SV-RESTORE-FLOW/collector와형식보존합의전저장연결HOLD. 실제 효과 모듈 파일명/담당은 **미확인**으로 남기고, manifest 통과를 합체 효과 완료로 세지 않음 |

## 5. 공용 파일 접점(이번 수정 0)

| 공용/기존 파일 | 현재 정확 접점 | 후속 연결 필요·충돌/보호 |
|---|---|---|
| godot/scripts/main.gd | :244~249 NativeSkillSlots 생성/configure/HUD cd bind, :761 regeneration, :1673~1684 input manifest, :1695 E star reader | SK-S06 관리 owner configure / S07패널host / S08일반dispatcher 구성 후보. P2-001l·UI·SETTINGS와 소유조정, Q/E실행/manifest를승인없이수정0 |
| godot/scripts/hud.gd | :846~870 아이콘·sweep, `_native_slot_skill_id` | 55종/합체아이콘·현재배정 refresh reader seam. 기존 시작13칸과 새 K관리창을 구분. UI/폰트담당조정, 실제 저장0 |
| godot/scripts/world.gd | NativeSkillSlots 자식·투사체/영역/clock owner | 각효과spawn registry와 후반tick owner협의. P3-002 동적등록/기존리젠 중복금지. SK-S01~07에서직접수정불필요 |
| godot/scripts/player.gd | 현재 input·상태/행동 gate·ST/HP actual owner | 일반dispatcher와레슨allows/차지·io/gw 공통거부지점검토. **Q/E/Shift상태기계 보호**. 1번공용0 |
| godot/scripts/native_normal_enemy_hurte.gd | dot/shieldHit/iceBlade 및스킬별피해opts | 합체effect owner준비뒤에만필요한opts집행검토. 무조건fuseMul·숙련전역곱추가금지. 일반피해/드랍/포이즈재설계0 |
| godot/scripts/native_source_new_run_state.gd | :175~185/447~471/549 이후 actual G/P·mats·시작스킬 | SK-S06에서비보호skills/SP/일반slot writer 권위범위인수필요. constructor변경으로대체0·재생성0. 저장필드및Q/Eactive보호 |
| godot/scripts/native_source_resource_authority.gd | 실제skill ST/MP commit | 일반비용 계산과실제차감권위분리. 시작4종상수소비를전스킬정확공식완료로세지않음. 권한확장범위미확인 |
| godot/scripts/native_skill_slots.gd | :146~159 hardwired dispatch / :808~835 cooldown·미이식manifest | 이미P2-005owner. S08새일반routing과4cast중복호출금지·timer1소유. 시작 스킬 의존를다시이식하지않음 |
| native_source_player_providers.gd / fusion_star_source | bundle:180 fuse_star, producer173~223 | 기존readonly32키·typed packet재사용. 새catalogue가이권위를덮어쓰지않음; 실제합체쓰기와조회API분리 |
| save_adapter / 설정·인벤 | §1.3·기존 SAVE/SETTINGS/QUICKSLOT추적 | 보호payload·keybind·공유mats·equip/skillBoost소유를해당담당에인계. 이번형식/이관/메뉴합병0 |

## 6. 이번 검증·미확인·제출

- 기존 Node 명령: `node --test test/balanceSkillUpgradeCost.test.js test/skillSlotEligibility.test.js test/skillForge.test.js test/skillRecommendationOrder.test.js`.
- **exit1 / 21 tests / 20 pass / 1 fail / 0 skipped**. 비용4건에는 game-easy-test.html 대상2건이 포함된다. Forge7·slot9 통과, recommendation1 실패. source의15단계와 옛테스트14단계 기대 불일치이며 나머지이후assert는 도달 미확인. 테스트를고치거나기대값완화하지않음. 전체시스템PASS아님.
- 원로그 `/Users/fordeargamers/exoduser-wt/_out/trace-skills/existing-web-tests.log`, read-only 리터럴 추출 `source-data.json`. 원본55/32/32/37 집합·원본 행 전체 색인·원본 파일 hash·새 경로 부재를 확인했다. 원본 SP 세 함수를 직접 실행한 **252개 단정 통과**(일반21 + 합체168 + 누적63), 기존 Godot readonly32레시피의 key 순서/멤버 및32그룹 star override exact 대조 통과. 참조 색인222행의 압축범위를 다시 펼쳐 원본 matching-line 전체와 일치함을 확인했다. `source-audit.json`에 보존했다. 이는 신규 제품 코드나 신규 테스트 파일의 실행 결과가 아니다.
- Godot 실제파일과기존테스트본문을대조했다. **Godot runtime/테스트재실행·실창·시각·음향·PC실행·사용자save는미확인**. `/Applications/Godot.app`은 없지만 기존 Mac 검수 보고서에는 `.codex/tools/godot-4.7.2/` 실행 경로가 있다. 설치 전체 부재로 단정하지 않으며 이번 문서 조사에서 엔진을 실행하지 않았다.
- 제출은 새문서1경로만stage/commit·자기codex branch비강제push 후원격ref SHA확인. DONE은 `~/exoduser-wt/_out/trace-skills/DONE.txt`에실제브랜치/SHA/요약으로작성. main push/merge/force/reset 및타인WIP stage없음. 문서자체commit SHA는commit전추정하지않음.
- 현재 추적작업의 막힌 필수단계는없음. 제품이식의의존미완/HOLD와이번문서제출BLOCKED를혼동하지않음. 향후보호/권한거부가발생하면우회하지않고해당단위를BLOCKED로보고.

## 부록 A. SKILL_LIST 55개 레코드 전수

수치는 데이터 원가이며 actual 시전 비용은 §1의 발동 함수·부록D를 따른다. `—`는 해당 key가 **없음**(0과 다름). upSp 메타데이터가5/6이어도 실제 강화는3913 함수의1 SP다. flags/선행 열은 up/upSp/upMat/reqLv/requires 등 모든 비설명 필드를 기록하며, nameEn/desc/descEn 원문은 해당 단일 선언행에 있다. 보호 Q/E 레코드도 조회만 한다.

| id | 원본 한글명 | game 행 | cat | 습득SP | 악의오브원가 | metadata cd(f) | flags·강화·요구 key(없는 key는 생략) |
|---|---|---|---|---|---|---|---|
| chargeBoost | 사슬기동:충돌 | 44162 | move | 10 | 100 | — | {"up":true,"upSp":5,"upMat":0} |
| magicBlink | 사슬기동:화염 | 44163 | move | 10 | 100 | — | {"up":true,"upSp":5,"upMat":0} |
| ghostWalk | 뇌전걸음 | 44164 | def | 10 | 100 | 1200 | {"act":true,"up":true,"upSp":5,"upMat":0} |
| bladeDash | 전격이동 | 44165 | move | 10 | 60 | — | {"up":true,"upSp":6,"upMat":0} |
| kiSlash | 기검참 | 44166 | phys | 10 | 0 | — | {"up":true,"upSp":5,"upMat":0,"default":true} |
| fireball | 악의구 | 44167 | magic | 10 | 0 | — | {"up":true,"upSp":5,"upMat":0,"default":true} |
| whirlwind | 회전참 | 44168 | phys | 10 | 100 | — | {"up":true,"upSp":5,"upMat":0} |
| detonate | 기폭팔 | 44169 | def | 10 | 100 | — | {"up":true,"upSp":5,"upMat":0} |
| maliceSwipe | 칼등 처내기 | 44170 | def | 10 | 80 | — | {"up":true,"upSp":5,"upMat":0} |
| fanShot | 만화방창 | 44171 | bow | 10 | 100 | — | {"up":true,"upSp":5,"upMat":0} |
| omniBeam | 멸살광선 | 44172 | magic | 10 | 100 | — | {"up":true,"upSp":5,"upMat":0} |
| elemMissile | 원소추적탄 | 44173 | bow | 10 | 80 | — | {"up":true,"upSp":5,"upMat":0} |
| guardian | 악의 보호자 | 44175 | summon | 10 | 100 | — | {"noDmg":true,"up":true,"upSp":5,"upMat":0} |
| maliceHunt | 악의 사냥 | 44176 | bow | 10 | 100 | 300 | {"act":true,"up":true,"upSp":5,"upMat":0} |
| venomBlade | 독사 | 44177 | bow | 10 | 0 | 900 | {"act":true,"up":true,"upSp":5,"upMat":0} |
| ltnChaser | 뇌전추격자 | 44178 | bow | 10 | 80 | 720 | {"act":true,"up":true,"upSp":5,"upMat":0} |
| maliceMortar | 폭풍소환 | 44179 | magic | 10 | 100 | — | {"act":true,"up":true,"upSp":5,"upMat":0} |
| boneWall | 해골무덤 | 44180 | magic | 10 | 100 | — | {"act":true,"up":true,"upSp":5,"upMat":0} |
| blackStar | 블랙 | 44181 | ult | 10 | 100 | 7200 | {"act":true,"ult":true,"noDmg":true,"up":true,"upSp":5,"upMat":0} |
| lavaSummon | 탄막블랙홀 | 44182 | ult | 10 | 100 | 7200 | {"act":true,"ult":true,"up":true,"upSp":5,"upMat":0} |
| execution | 처형 | 44183 | ult | 10 | 100 | 300 | {"act":true,"ult":true,"up":true,"upSp":5,"upMat":0} |
| iceOrb | 얼음보주 | 44186 | def | 10 | 100 | 1200 | {"act":true,"up":true,"upSp":5,"upMat":0} |
| needleShot | 만화방창 II | 44187 | bow | 10 | 80 | 90 | {"act":true,"up":true,"upSp":5,"upMat":0} |
| arcLaser | 얼음송곳 | 44189 | magic | 10 | 100 | — | {"up":true,"upSp":5,"upMat":0} |
| fireBeam | 업화선 | 44190 | bow | 10 | 100 | — | {"up":true,"upSp":5,"upMat":0} |
| maliceDome | 신의영역 | 44191 | def | 10 | 100 | 1500 | {"act":true,"noDmg":true,"up":true,"upSp":5,"upMat":0} |
| fireAura | 지옥진 | 44192 | magic | 10 | 100 | — | {"up":true,"upSp":5,"upMat":0} |
| plagueBurst | 폭독칼날 | 44193 | bow | 10 | 80 | 1200 | {"act":true,"up":true,"upSp":5,"upMat":0} |
| maliceStorm | 악의폭풍 | 44194 | magic | 10 | 90 | — | {"act":true,"up":true,"upSp":5,"upMat":0} |
| darkPillar | 악의기둥 | 44195 | magic | 10 | 100 | 900 | {"act":true,"up":true,"upSp":5,"upMat":0} |
| holyDome | 회복의 영역 | 44196 | tech | 10 | 90 | 1800 | {"act":true,"noDmg":true,"up":true,"upSp":5,"upMat":0} |
| holyPrison | 구속의 영역 | 44197 | tech | 10 | 80 | 1800 | {"act":true,"noDmg":true,"up":true,"upSp":5,"upMat":0} |
| iceStorm | 아이스스톰 | 44198 | magic | 10 | 90 | — | {"act":true,"noDmg":true,"up":true,"upSp":5,"upMat":0} |
| giantSlam | 지옥강타 1 | 44199 | rage | 10 | 120 | 1800 | {"act":true,"up":true,"upSp":5,"upMat":0} |
| giantSlam2 | 지옥강타 2 | 44200 | rage | 10 | 120 | 1800 | {"act":true,"up":true,"upSp":5,"upMat":0} |
| skyCrusher | 천공쇄기 | 44201 | rage | 10 | 120 | 900 | {"act":true,"up":true,"upSp":5,"upMat":0} |
| chainAssault | 기동불꽃 | 44203 | move | 10 | 0 | — | {"up":true,"upSp":5,"upMat":0} |
| chainSlam | 기동파괴 | 44204 | move | 10 | 100 | — | {"up":true,"upSp":5,"upMat":0} |
| chainSlash | 기동칼날개 | 44206 | move | 0 | 0 | — | {"fixed":true,"hidden":true,"up":true,"upSp":5,"upMat":0} |
| peaceShield | 평화의보호 | 44207 | def | 0 | 0 | — | {"fixed":true,"noDmg":true,"up":true,"upSp":5,"upMat":0} |
| hellRay | 참회 | 44208 | magic | 0 | 0 | — | {"fixed":true,"hidden":true,"up":true,"upSp":5,"upMat":0} |
| shieldThrow | 불꽃칼날 | 44209 | def | 10 | 80 | 720 | {"fixed":true,"up":true,"upSp":5,"upMat":0} |
| weakPhys | 파쇄의 영역 | 44211 | tech | 10 | 80 | 1500 | {"act":true,"noDmg":true,"up":true,"upSp":5,"upMat":0} |
| weakMag | 침식의 영역 | 44212 | tech | 10 | 80 | 1500 | {"act":true,"noDmg":true,"up":true,"upSp":5,"upMat":0} |
| weakPj | 관통의 영역 | 44213 | tech | 10 | 80 | 1500 | {"act":true,"noDmg":true,"up":true,"upSp":5,"upMat":0} |
| weakRev | 부활의 영역 | 44214 | tech | 10 | 80 | 1500 | {"act":true,"noDmg":true,"up":true,"upSp":5,"upMat":0} |
| spikeTrap | 가시덫 | 44215 | phys | 10 | 80 | 600 | {"act":true,"up":true,"upSp":5,"upMat":0} |
| blueShot | 푸른비 | 44216 | bow | 10 | 100 | — | {"fixed":true,"up":true,"upSp":5,"upMat":0,"reqLv":300} |
| burstLoop | 버스트루프 | 44217 | magic | 0 | 0 | — | {"fixed":true,"hidden":true,"up":true,"upSp":5,"upMat":0,"reqLv":700} |
| voidScarecrow | 유령 허수아비 | 44218 | summon | 10 | 100 | 600 | {"act":true,"up":true,"upSp":5,"upMat":0} |
| explodeScarecrow | 폭발 허수아비 | 44219 | summon | 10 | 100 | 600 | {"act":true,"up":true,"upSp":5,"upMat":0} |
| ancestorSummon | 전대 소환 | 44220 | summon | 10 | 100 | 1500 | {"act":true,"up":true,"upSp":5,"upMat":0} |
| ghostXbowTurret | 공성쇠뇌 | 44221 | bow | 10 | 120 | 1200 | {"act":true,"up":true,"upSp":5,"upMat":0,"reqLv":500} |
| timeWarp | 시간왜곡 | 44222 | def | 15 | 150 | 2700 | {"act":true,"up":true,"upSp":5,"upMat":0,"reqLv":500} |
| thunderStake | 뇌전창 | 44223 | magic | 10 | 100 | — | {"act":true,"up":true,"upSp":5,"upMat":0} |

## 부록 B. 합체32개 데이터·성급·흡수 전수

행은 원본의 `_FUSE_PAIRS / _FUSE_GEM_GROUPS` 선언행이다. 레시피 순서는 _FUSE_PAIRS의 실제 순서. 성급=`star||멤버수`, 생성SP=성급×3. gem.minLv는 metadata이며 실행조건이 아니다. 기본포지 호스트는 첫멤버, elemFuse만 omniBeam. 별도의 _execFuse 호스트자동배정표·_skCtx 강화표가 이 표와 완전히 같지는 않다(X09/10).

| key | 원본 이름 | PAIR/GEM 행 | 구성(순서보존) | 포지호스트 | 성급/생성SP | minLv(실행조건 아님) | _getAbsorbed 결과(44618) | gem metadata |
|---|---|---|---|---|---|---|---|---|
| dimBreach | 기동:기습 | 44454 / 44325 | chargeBoost + magicBlink | chargeBoost | 2 / 6 | 5 | magicBlink | #00ddcc/#0066ff;tier=clear |
| dimSlam | 기동:파쇄 | 44455 / 44326 | chargeBoost + magicBlink + chainAssault | chargeBoost | 3 / 9 | 10 | magicBlink,chainAssault | #00ddcc/#0066ff;tier=clear |
| dimThunder | 기동:전폭 | 44456 / 44327 | chargeBoost + magicBlink + chainAssault + chainSlam | chargeBoost | 4 / 12 | 15 | magicBlink,chainAssault,chainSlam | #00ddcc/#0066ff;tier=clear |
| dimRush | 기동:칼날개 | 44457 / 44328 | chargeBoost + magicBlink + chainAssault + chainSlash + chainSlam | chargeBoost | 5 / 15 | 20 | magicBlink,chainAssault,chainSlash,chainSlam | #00ddcc/#0066ff;tier=clear |
| dimBlast | 기동:섬멸 | 44458 / 44329 | chargeBoost + magicBlink + chainAssault + chainSlash + chainSlam + giantSlam | chargeBoost | 6 / 18 | 25 | magicBlink,chainAssault,chainSlash,chainSlam,giantSlam | #00ddcc/#ffaa00;tier=clear |
| whirlDet | 회전기폭 | 44459 / 44332 | whirlwind + detonate | whirlwind | 2 / 6 | 5 | detonate | #ff7722/#ffee00;tier=clear |
| slamStorm | 지진폭풍 | 44460 / 44333 | whirlwind + detonate + giantSlam | whirlwind | 3 / 9 | 10 | detonate,giantSlam | #ff7722/#ffee00;tier=clear |
| stormBeam | 암전나선 | 44461 / 44334 | whirlwind + detonate + giantSlam + fanShot + omniBeam + elemMissile | whirlwind | 4 / 12 | 15 | detonate,giantSlam,fanShot,omniBeam,elemMissile | #ff4400/#ffdd00;tier=clear |
| stormBurst | 암전폭류 | 44462 / 44335 | whirlwind + detonate + giantSlam + fanShot + omniBeam + elemMissile + burstLoop | whirlwind | 5 / 15 | 30 | detonate,giantSlam,fanShot,omniBeam,elemMissile,burstLoop | #dd00ff/#ffdd00;tier=clear;hidden=true |
| bladeFuse | 악의 해방 | 44463 / 44336 | maliceHunt + guardian | maliceHunt | 2 / 6 | 5 | guardian | #ffffff/#ccbbaa;tier=clear |
| bladeEcho | 추적전격 | 44464 / 44337 | maliceHunt + bladeDash | maliceHunt | 2 / 6 | 1 | 없음 | #e6f8ff/#44ddff;tier=clear |
| iceMortar | 얼음소용돌이 | 44465 / 44338 | maliceMortar + iceOrb | maliceMortar | 2 / 6 | 10 | iceOrb | #2299ff/#00ffaa;tier=clear |
| sixFuse | 만화광선 | 44466 / 44330 | fanShot + omniBeam | fanShot | 2 / 6 | 5 | omniBeam | #ffdd00/#ff6600;tier=clear |
| elemFuse | 추적암전 | 44467 / 44331 | fanShot + omniBeam + elemMissile | omniBeam | 3 / 9 | 10 | fanShot,omniBeam,elemMissile | #ffdd00/#ff6600;tier=clear |
| boneStorm | 해골번개 | 44468 / 44339 | maliceStorm + boneWall | maliceStorm | 2 / 6 | 5 | boneWall | #44ee44/#886622;tier=clear |
| elecRepent | 참회 귀환 | 44469 / 44340 | maliceStorm + hellRay | maliceStorm | 2 / 6 | 10 | hellRay,boneWall | #44ee44/#ffd700;tier=clear |
| shieldFuse | 불꽃칼날 | 44470 / 44341 | maliceSwipe + shieldThrow | maliceSwipe | 2 / 6 | 1 | shieldThrow | #8888cc/#cc8844;tier=clear |
| plagueFuse | 독혈해방 | 44471 / 44342 | maliceHunt + guardian + plagueBurst | maliceHunt | 3 / 9 | 10 | guardian,plagueBurst | #ffffff/#ccbbaa;tier=clear |
| plagueVenom | 독사해방 | 44472 / 44343 | maliceHunt + guardian + plagueBurst + venomBlade | maliceHunt | 4 / 12 | 15 | guardian,plagueBurst,venomBlade | #44dd44/#ccbbaa;tier=clear |
| holyFuse | 결계의 영역 | 44473 / 44344 | holyDome + holyPrison | holyDome | 2 / 6 | 5 | holyPrison | #ff88aa/#ffccdd;tier=clear |
| holyIce | 물의 영역 | 44474 / 44345 | holyDome + holyPrison + iceStorm | holyDome | 3 / 9 | 10 | holyPrison,iceStorm | #ff88aa/#88ddff;tier=clear |
| holyWeak1 | 파쇄의 영역 | 44475 / 44346 | holyDome + holyPrison + iceStorm + weakPhys | holyDome | 4 / 12 | 15 | holyPrison,iceStorm,weakPhys | #ff88aa/#aa66cc;tier=clear |
| holyWeak2 | 침식의 영역 | 44476 / 44347 | holyDome + holyPrison + iceStorm + weakPhys + weakMag | holyDome | 5 / 15 | 20 | holyPrison,iceStorm,weakPhys,weakMag | #ff88aa/#8866ff;tier=clear |
| holyWeak3 | 관통의 영역 | 44477 / 44348 | holyDome + holyPrison + iceStorm + weakPhys + weakMag + weakPj | holyDome | 6 / 18 | 25 | holyPrison,iceStorm,weakPhys,weakMag,weakPj | #ff88aa/#6688ff;tier=clear |
| holyWeak4 | 권능의 영역 | 44478 / 44349 | holyDome + holyPrison + iceStorm + weakPhys + weakMag + weakPj + weakRev | holyDome | 7 / 21 | 30 | holyPrison,iceStorm,weakPhys,weakMag,weakPj,weakRev | #ff88aa/#ffdd00;tier=clear |
| pillarSpike | 기둥가시 | 44479 / 44350 | darkPillar + spikeTrap | darkPillar | 2 / 6 | 1 | spikeTrap | #7722cc/#66aa44;tier=clear |
| pillarSlam | 기둥강타 | 44480 / 44351 | giantSlam2 + darkPillar | giantSlam2 | 2 / 6 | 1 | darkPillar | #ff8844/#7722cc;tier=clear |
| infernoSlam | 지옥강타 2 | 44481 / 44352 | giantSlam2 + fireAura | giantSlam2 | 2 / 6 | 1 | fireAura | #ff6622/#ff4400;tier=clear |
| siegeGhost | 공성유령 | 44482 / 44353 | ghostXbowTurret + voidScarecrow | ghostXbowTurret | 3 / 9 | 1 | voidScarecrow | #6688cc/#aa66dd;tier=clear |
| dualScarecrow | 쌍둥이허수아비 | 44483 / 44354 | voidScarecrow + explodeScarecrow | voidScarecrow | 2 / 6 | 1 | explodeScarecrow | #aa66dd/#ff4422;tier=clear |
| thunderGhost | 전격의창 | 44484 / 44355 | bladeDash + thunderStake | bladeDash | 2 / 6 | 1 | thunderStake | #44ddff/#8899bb;tier=clear |
| timeStep | 시간걸음 | 44485 / 44356 | timeWarp + ghostWalk | timeWarp | 2 / 6 | 500 | ghostWalk | #8888ff/#44ddff;tier=clear |

## 부록 C. 피해·자원 상수 전수

_SK_MUL의b/g는 시전의 최종 피해가 아니다. 다음 값과44556의 `b+(Lv-1)*g*.5`를 함께 보존한다. 소수는 표시용 Python 산술을 반올림한 값이며 JS 연산 순서/ToInt32 시점은 원본 각 consumer가 권위다.

| _SK_MUL key | game 행 | b | g | Lv20 계수(정수화 전) |
|---|---|---|---|---|
| giantSlam | 44509 | 20 | 19 | 200.5 |
| maliceMortar | 44510 | 10 | 8 | 86 |
| iceOrb | 44511 | 8 | 6.4 | 68.8 |
| boneWall | 44512 | 9 | 7.2 | 77.4 |
| chainSlam | 44513 | 8 | 6.4 | 68.8 |
| detonate | 44514 | 8 | 6.4 | 68.8 |
| plagueBurst | 44515 | 7 | 5.6 | 60.2 |
| maliceHuntBurst | 44516 | 28 | 22.4 | 240.8 |
| blueShell | 44517 | 8 | 6.4 | 68.8 |
| maliceStorm | 44519 | 14 | 11.2 | 120.4 |
| fireAura | 44520 | 10 | 8 | 86 |
| darkPillar | 44521 | 20 | 16 | 172 |
| spikeTrap | 44522 | 14 | 11.2 | 120.4 |
| skyCrusher | 44523 | 60 | 48 | 516 |
| bladeDash | 44524 | 3.5 | 2.1 | 23.45 |
| thunderStake | 44525 | 2.4 | 1.6 | 17.6 |
| arcLaser | 44527 | 8 | 6.4 | 68.8 |
| omniBeam | 44528 | 0.75 | 0.6 | 6.45 |
| whirlwind | 44529 | 25 | 24 | 253 |
| maliceHunt | 44530 | 1 | 0.8 | 8.6 |
| venomBlade | 44531 | 3 | 2.4 | 25.8 |
| ltnChaser | 44532 | 4 | 3.2 | 34.4 |
| blueShot | 44534 | 1.8 | 1.44 | 15.48 |
| fireball | 44535 | 13.2 | 10.56 | 113.52 |
| fireBeam | 44536 | 3 | 2.4 | 25.8 |
| needleShot | 44537 | 4 | 3.2 | 34.4 |
| blastShot | 44538 | 4 | 3.2 | 34.4 |
| hellRay | 44540 | 5 | 4 | 43 |
| burstLoop | 44541 | 5 | 4 | 43 |
| kiSlash | 44543 | 12 | 10.08 | 107.76 |
| chargeBoost | 44545 | 8 | 6.4 | 68.8 |
| chainAssault | 44546 | 3 | 2.4 | 25.8 |
| chainSlash | 44547 | 3.5 | 2.8 | 30.1 |
| magicBlink | 44548 | 4 | 3.2 | 34.4 |
| ghostWalk | 44550 | 4 | 3.2 | 34.4 |
| elemMissile | 44551 | 2 | 1.6 | 17.2 |
| ancestorSummon | 44553 | 6 | 4.8 | 51.6 |

| 공통 key (31960~31979) | _COST_BASE | _COST_SK | _COST_DPS |
|---|---|---|---|
| weapon | 10 | 없음→Lv1 | 없음→.10 |
| finisher | 50 | 없음→Lv1 | 0.45 |
| shield | 10 | 없음→Lv1 | 없음→.10 |
| giantSlam | 50 | giantSlam | 0.45 |
| charge | 50 | chargeBoost | 0.45 |
| bladeDash | 50 | bladeDash | 0.3 |
| bow | 35 | 없음→Lv1 | 0.15 |
| bladeShot | 35 | bladeShot | 0.3 |
| blastShot | 35 | blastShot | 0.3 |
| shieldThrow | 35 | shieldThrow | 0.25 |
| fanShot | 35 | fanShot | 0.15 |
| magic | 10 | 없음→Lv1 | 0.35 |
| blink | 50 | magicBlink | 0.3 |
| iceOrb | 50 | iceOrb | 0.35 |
| dimBreach | 50 | magicBlink | 0.3 |
| exBolt | 50 | maliceSwipe | 0.3 |
| mortar | 50 | maliceMortar | 0.35 |
| whirlTick | 0.4 | whirlwind | 0.05 |
| sBlockTick | 0.4 | maliceSwipe | 0.05 |
| qsTick | 0.5 | 없음→Lv1 | 0.05 |

weapon/shield는31985~31986에서표와무관한조기반환. bladeDash 실제발동의 MP는45343/45418 이후 직접식이라위base50이실제소모50이라는뜻이아니다. _stDisc/pMagicCost 및최대ST90%cap·sourceToInt32 순서는§1.1 그대로다.

## 부록 D. 원본 전체 참조 행 색인

정의/주석/문자열을 포함한 **game.html 전65,692행**에서 식별자 경계로 검색한 matching-line 전체다. 한 행 내 여러번일치는1행으로 센다. 연속행은 범위로 압축했다. read/write·호출·UI설명은 혼재하며 모든 일치를 실행호출로 주장하지 않는다. 동적 `P.skills[id]`/`P[activeKey]`/별칭은 해당 함수구역의본문을 함께 보아야 한다. 외부JS/다른HTML/미병합branch는 이 game 행 분모가 아니며 별도§1에서구분했다.

### D.1 관리 상수·함수·상태

| 식별자 | game.html 모든 matching 행 |
|---|---|
| SKILL_SLOTS | 3572, 3882, 3894, 3897, 3899, 3905, 9350, 9358, 12911, 12914, 13265, 13284~13285, 13288~13289, 13802, 27681, 28271, 28274, 28330, 28427, 28583~28585, 28604~28605, 28646, 28650, 33059, 44240~44243, 44250, 44253, 44258, 44260, 44262~44263, 44266~44268, 44270, 44890, 44983, 44987, 44994~44995, 47150~47151, 47261, 47265, 47267, 47287, 47292, 47542~47547, 47787, 47792, 47930, 47946, 48423~48424, 48431, 48434, 48439~48440, 61973~61978, 62016, 62035, 62158, 62185~62187, 62228~62229, 62392~62393, 62486~62487, 62502~62503, 63928, 63995~63996, 64011~64012, 64085, 64131~64132 |
| ULT_SLOT | 3573, 3884, 3895, 9583, 12911, 13299, 13302~13303, 13318~13321, 13327, 27682, 28361~28363, 28365~28367, 28647, 47137, 47261, 47289, 47548, 47789, 47930, 47947, 61979, 62016, 62036, 62158, 62230, 62394, 63929, 64086 |
| SKILL_CATS | 44082, 47400, 47477 |
| SKILL_HIER | 13695~13698, 13700, 44111, 47353, 47384, 47398 |
| SKILL_REC_PATH | 44094, 47296, 47301, 47405~47406, 47415~47416 |
| SKILL_ICONS | 44118, 44134, 47555 |
| SKILL_LIST | 3772, 3903, 13304, 13316, 44161, 44225~44226, 44563, 44970, 47213~47214, 47480, 62225, 62230, 64204~64205 |
| _SK_MAP | 44226~44227 |
| SKILL_SLOT_DEFS | 3859, 3873, 28498, 28656, 44277, 44652, 47014, 47032, 47078, 47159, 47168, 47173, 47279~47284, 47539, 47541, 47778~47782, 47784 |
| _FUSE_GEM_GROUPS | 3518~3519, 44324, 44360, 44365, 44376, 44396, 44398, 44414, 44435, 44492, 44499, 44594, 47236, 47330, 47758, 47827, 47848, 47855, 47859, 47890, 47910, 47914, 47920, 48039, 48237, 48262, 48269, 48273, 48340 |
| _FUSE_GEMS | 44358~44361 |
| _FUSE_GEMS2 | 44359~44360 |
| _FUSE_PAIRS | 3520, 3830, 44453, 44487, 44492, 44499, 44597, 44606, 44609, 44614, 44622, 44632, 47197~47198, 47201, 47238, 47504, 47613, 47622, 47756, 47797, 47826, 47849, 47856, 47860, 47915, 47921, 48037, 48172, 48236, 48263, 48270, 48274, 48333, 48337, 48339, 48374, 48386, 48389, 48398, 62227 |
| _FUSE_NAMES | 44638, 44640, 44642, 48354~48360, 48362, 48364~48365, 61968 |
| _FUSE_NAMES_EN | 44639, 44641~44642 |
| _SK_MUL | 44507, 44556, 44750~44753 |
| _CATPROF_REQ | 44560, 44607 |
| _SK_CAT | 44562~44564, 44568, 44578, 44588, 48376, 48386 |
| _SK_TO_GROUPS | 44593~44594 |
| _FUSE_TIME_REQ | 44604, 48368~48369 |
| _COST_BASE | 31960, 31987, 31993 |
| _COST_SK | 31967, 31981 |
| _COST_DPS | 31975, 31982 |
| _MALICE_COST_MUL | 28080, 28084 |
| _DEMO_FUSE_ALLOWED | 16649, 44610, 61969, 62227 |
| _fuseSelId | 44068, 44079, 44364, 44366, 44662, 47247, 47319, 47364, 48331, 48333, 48337, 48387, 48392~48393, 48395, 48397~48398, 48402, 48404 |
| _skCompact | 44663, 47374, 47495, 48164, 48208, 48221, 48229, 48471 |
| _skExpandedId | 44066, 44079, 44664, 47329, 47353, 47364, 47486, 47500, 47578, 47580, 47592, 47602, 47606, 47614, 47619, 48160, 48166~48167, 48169, 48171~48172, 48210, 48225 |
| _skPopOwnsPause | 44079, 46967~46968, 47073 |
| _skPopTab | 46966, 46972, 46994, 46998, 47003, 47008, 47011, 47014~47015, 47026, 47032, 47037~47038, 47054~47061 |
| _skDrag | 47084, 47088, 47103~47104, 47106~47107, 47123~47124 |
| _fused | 3488, 3514, 3516~3517, 3522, 3563, 3781~3782, 3794, 3796, 3800, 3802, 3804, 3806, 3813, 3815, 3817~3820, 3822~3823, 3825~3828, 3831, 3866, 3877, 29031, 44488, 44497, 44649, 47242, 47247, 47823~47825, 47829, 47846~47847, 47910, 47912~47913, 47933, 47945, 48233~48235, 48239, 48260~48261, 61970, 62008, 62148, 62226, 62380, 62387, 63919, 64076, 64888 |
| _skProf | 3563, 3783, 3789, 3888, 44570, 44584, 62008, 62148, 62390, 63919, 64076, 64205 |
| _catProf | 3563, 3786, 44565, 44579, 44582, 44589~44590, 62149, 62389, 63919, 64076, 64204 |
| _cardProf | 3563, 3785, 62149, 63919, 64076 |
| _fuseProfSec | 3563, 3784, 44605, 48369, 62148, 63919, 64076 |
| activeChargeSk | 3564, 3798, 3836, 3838, 3840, 13348, 13362, 28642, 29023, 32180, 32213, 32379, 32534, 33518, 33522, 33526, 33529, 33535, 33539, 33543, 33546, 33566, 33570, 33574, 33577, 33688, 33691, 33695, 33698, 44654, 44881, 47011, 47015, 47026, 47036, 47054, 47077, 47279, 47778, 61980, 62009, 62040, 62150, 62231, 62397, 63920, 64077 |
| activeBowSk | 3565, 3842~3846, 28400, 28726, 29024, 44658, 44927, 45527, 47011, 47015, 47026, 47036, 47056, 47280, 47779, 54895, 61980, 62010, 62039, 62151, 62395, 63921, 64078 |
| activeTechSk | 3566, 3853~3855, 29025, 47036, 47057, 47172, 47281, 47780, 62152, 63922, 64079 |
| activeMagicSk | 3567, 3857~3858, 3860~3861, 28386, 28643, 28779, 28950, 29026, 33061, 33589, 44655, 44896, 47011, 47015, 47026, 47036, 47055, 47254, 47282, 47781, 61980, 62011, 62038, 62153, 62231, 62395, 63923, 64080 |
| activeLMBSk | 3568, 3792, 3794, 3863~3864, 3866, 14299, 28640, 29027, 31985, 33052, 33054, 33056, 33563, 33565, 44653, 44902, 47011, 47015, 47026, 47036, 47058, 47249, 47284, 47784, 61980, 62012, 62042, 62154, 62231, 62396, 63924, 64081 |
| activeRMBSk | 3489, 3569, 3867~3868, 29028, 44660, 47015, 47026, 47036, 47059, 62013, 62155, 62231, 62396, 63925, 64082 |
| activeQSk | 3570, 3869~3870, 14296, 28479, 28644, 29029, 44656, 44909, 47015, 47026, 47036, 47060, 47283, 47782, 61980, 62014, 62041, 62156, 62231, 62396, 63926, 64083, 64889 |
| activeCtSk | 3571, 3871~3872, 3874~3875, 3877, 13096, 13100~13101, 13293, 28492, 28495~28496, 28645, 29030, 44657, 44921, 47015, 47026, 47036, 47061, 61980, 62015, 62037, 62157, 62191, 62231, 62395, 62499, 63927, 64010, 64084 |
| _skillUpSpCost | 3913, 3919, 3929, 47190, 47219, 47761, 47811, 47873, 48042, 48288 |
| _fuseUpSpCost | 3496, 3918, 47189, 47206, 47758, 47801, 47833, 47864, 47926, 48039, 48243, 48278 |
| _skillSpentSp | 3926, 47245, 47941 |
| _malCost | 12932, 12942, 12946~12947, 12983, 13000~13001, 13003~13004, 13011, 15299, 28081, 28091, 28103, 28743, 32574~32575, 40298, 44711, 44787, 45095, 45109, 45170, 45277~45278, 45314, 45316, 45510, 45512, 46166~46167, 46453~46454, 47220~47221, 47245, 47275, 47748, 47762, 47770, 47811, 47874, 48029, 48043, 48131, 48216, 48289, 48317, 50238, 50419, 50458, 50696, 51068 |
| _skLv | 31981~31982 |
| _dpsCostMul | 31982, 31988, 31994 |
| _stDisc | 28732, 28762, 31983, 31988 |
| stCost | 12979, 13000~13001, 13003~13004, 15862, 15864~15870, 15887~15889, 15966, 15981, 31984, 31991, 33109, 34076 |
| mpCost | 12922~12923, 12927~12928, 13111~13112, 14325~14326, 31992, 31996, 33067, 33109, 33518, 33535, 33566, 33583, 33655, 33688, 45470, 45495, 45497 |
| useStPct | 31991, 33053, 33518, 33535, 33562, 33566, 33668, 33688, 34077, 38450, 46182, 46454 |
| useMp | 28905, 28956, 31996, 33522, 33539, 33570, 33691, 44839, 45256, 46757 |
| _dispatchSkillSlot | 12905, 13265, 13286, 13290, 13300, 33059 |
| _dispatchCtSkill | 13093, 13100, 13295 |
| _updateUltSlot | 13318, 13323, 13327, 28357, 28359, 47137, 47789, 49034 |
| _cycleUlt | 2598, 13315 |
| _cdRed | 12946, 12950, 12953, 28065, 45110, 45477, 45512, 46167, 46290, 46302, 46456, 46827, 46903 |
| updateQS | 12913, 13802, 28242, 28248, 28267, 28587, 28607, 35887, 35890, 44983, 44996, 46819, 47154, 47229, 47322, 47792, 47816, 47881, 47953, 48296, 48402, 48441, 62060, 62199, 62343, 62412, 62515, 63528, 64023, 64144, 65668 |
| _skFuseIcon | 28322, 44119, 44134, 44990 |
| _skIcon | 28322, 28367, 28403, 28453, 28507, 44134, 44882, 44891, 44897, 44904, 44911, 44916, 44922, 44928, 44990 |
| _updateScarecrowIcons | 13038, 13078, 36008, 36022, 44136, 45561, 46094, 46134 |
| _skCdSweep | 44147 |
| _skCdSet | 28327, 28371, 28395, 28422, 28470, 28486, 28509, 44149 |
| _skById | 13321, 28275, 28362, 28390, 28453, 28466, 28481, 28584, 28657, 44227, 44230~44231, 44233, 44580, 46612, 47245, 47305, 47312, 47329, 47350, 47450, 47506, 47536, 47557, 47562, 47798, 47906, 48065, 48431 |
| _isAreaSkillId | 44230, 44235, 44241, 44262, 44267 |
| _isRageBurstSkillId | 44231, 44236, 44242, 44263, 44268 |
| _canAssignSkillSlot | 12913, 44232, 44241~44243, 44251, 44259, 44270, 44970, 47145, 48422, 48437 |
| _findAutoSkillSlot | 3905, 13801, 44239, 47266, 47291, 47791, 62229 |
| _repairAreaSkillSlot | 3902, 12913, 44246, 62035 |
| _skN | 28505, 28668, 44319, 47025~47026, 47052, 47062, 47079 |
| _skD | 28668, 44320, 47025, 47052 |
| isDimBreach | 13349, 28415~28416, 28420, 32181, 32214, 32376, 32535, 32782, 44322, 46978, 47680, 47959, 51393, 63459 |
| _fuseGem | 44361, 48146, 48500 |
| _fuseGemGroup | 44362, 44389, 47605~47606, 47763, 47840, 48047, 48171, 48254, 48333, 48337, 48397 |
| _allFuseGemGroups | 44383, 47483, 47602, 48328 |
| _gemHtml | 44431 |
| _getFuseKey | 44487, 47503, 47945, 48500 |
| _isFused | 3846, 12956, 13032, 13100, 16926, 28287, 28289, 28304, 28380, 28495, 28744, 28781, 28903, 28908~28909, 28911, 28962, 31102, 31110, 32349, 32571, 32784, 33052, 33061, 33123~33124, 33151, 33153, 33180, 33250, 33253, 33255, 33269, 33271, 33278, 33307, 33434, 34063, 34109~34111, 34120~34121, 34966, 34969, 35035, 35040, 35063, 35478, 35953, 36323, 36325, 36346, 36397, 36415, 36777~36778, 40771, 43304, 43313, 43319, 43353, 43356, 43373, 43378, 43381, 43497, 44121~44131, 44322, 44410, 44421, 44436, 44487~44488, 44499, 44612, 44623, 44631, 44633, 44903, 45021, 45098, 45101, 45106~45107, 45261, 45394, 45411, 45509, 45533, 46183, 46269, 46294, 46455, 46492, 46504, 46509, 46514, 46612, 46624, 46708, 46721, 46726, 46976, 46978~46979, 46982, 47007, 47019, 47197, 47330, 47353, 47368, 47411, 47420, 47479, 47507, 47603, 47607, 47681~47684, 47691~47693, 47697~47699, 47701~47702, 47705~47706, 47709, 47711~47713, 47715~47720, 47727~47728, 47731, 47733, 47735, 47737, 47739, 47741, 47841, 47892, 47960~47963, 47972~47974, 47978~47980, 47982~47983, 47986~47987, 47990, 47992~47994, 47996~48001, 48008~48009, 48012, 48014, 48016, 48018, 48020, 48022, 48048, 48153, 48255, 48335~48336, 48354~48360, 48362, 48364~48365, 48501, 51393, 54367, 54370, 55571, 55596, 58345, 58408, 59620, 59706, 63462 |
| _skInnateStar | 44490, 48148 |
| _fuseStar | 44432, 44496, 44557, 48148 |
| _skMul | 16825, 28806, 28843, 28966, 32282, 32306, 32344, 32353, 32390, 32424, 32484, 33173, 33212, 33594, 33629, 33641, 34030, 34151, 35383, 36059, 36124, 36173, 36347, 36357, 36405, 36418, 36428, 36591, 36833, 36868, 36892, 36950, 36994, 42771, 43310, 43371, 44167, 44173, 44194, 44216, 44282, 44504, 44522, 44556, 45116, 45143, 45171, 45188, 45221, 45284, 45299~45300, 45335, 45366, 45399, 45500, 45507, 45802, 45815, 46266, 46468, 46648, 46771, 46947 |
| _fuseMul | 28806, 32282, 32306, 32390, 32424, 32484, 32709, 33173, 33212, 33629, 33641, 33979, 34030, 34151, 36059, 36124, 36173, 36347, 36357, 36405, 36418, 36591, 36833, 36868, 36892, 36950, 36994, 43313, 43373, 44557, 45116, 45143, 45188, 45221, 45399, 45802, 45815, 46194, 46213, 46648, 46947 |
| _catProfVal | 44565, 44569, 44584, 48376, 48386 |
| _skProfVal | 44566, 44572, 44575, 44598, 48140 |
| _skProfLv | 44572~44573 |
| _skProfMul | 44573 |
| _skProfCap | 3789, 44574~44575, 48141 |
| _skProfMaxed | 44575 |
| _addSkProf | 13090, 13118, 13362, 14321, 16817, 28823, 28857, 28885, 28913, 32194, 32226, 32250, 32403, 32474, 32521, 32547, 33052, 33529, 33546, 33577, 33605, 33621, 33633, 33645, 33698, 33739, 36361, 36433, 36453, 36601, 38452, 38464, 43305, 44577, 44945, 45249, 45281, 45315, 45333, 45419, 45498, 45511, 45525, 46013, 46185, 46292, 46452, 46688, 46743, 46959 |
| _addSkProfTick | 33123, 33940, 34109, 36638, 36771, 44587, 44602 |
| _cardProfSec | 44595, 44601, 44605 |
| _cardProfHMS | 44601, 48370 |
| _addCardProfTick | 44602, 44606 |
| _addFuseProfTick | 33124, 34110, 44606 |
| _fuseReqProf | 44607, 48374, 48386 |
| _canFuse | 44608, 47234, 47316, 47330, 47587, 47601, 47603, 47607, 48048, 48335, 48391, 48395, 48400, 48501 |
| _getAbsorbed | 44618, 44624, 44634, 47260 |
| _getAllAbsorbed | 3879, 3893, 44620, 44968, 47016, 47040, 47286, 47786 |
| _isAbsorbed | 12914, 13098, 28274, 28494, 44629, 47957 |
| _fuseName | 44642, 44990, 47258, 47267, 47345, 47928, 48106, 48344 |
| _syncActiveSkAfterReset | 3879, 44644, 47270, 47935, 47949 |
| _skDetailHTML | 44668, 48211 |
| _skSpecificDetails | 44733, 44744 |
| _execDimBreach | 44836 |
| updateSkSlot | 28629, 44879, 47011, 47026, 47063, 47080, 47229, 47322, 47778, 47784, 47816, 47881, 47953, 48296, 48402, 62060, 62199, 62343, 62412, 62515, 64023, 64144, 65668 |
| updateBowSlot | 44883, 44888, 47172, 47779~47780 |
| updateMagicSlot | 44883, 44894, 47781, 49034 |
| updateLMBSlot | 44883, 44900, 49034 |
| updateQSlot | 44883, 44907, 47782, 49034 |
| updateRMBSlot | 44883, 44914 |
| updateCtSlot | 44883, 44919 |
| updateTSlot | 44883, 44925 |
| _initFixedSlotKeys | 44884, 44932 |
| _fireFanShot | 28744, 44942 |
| _openSkillSlotPop | 13799, 28590, 28595, 28612, 28621~28626, 44965, 46998, 47566 |
| _closeSkPop | 13312, 13408, 13937, 44064, 46968, 46971, 47011, 47026, 47064, 47321, 48402 |
| openSkSlotPop | 28616~28620, 28627~28628, 32121, 46969, 46998, 47567~47568 |
| selectChargeSk | 47076, 47163 |
| _skDragStart | 47085, 48511 |
| _skDragActivate | 47091, 47106 |
| _skillBatchUp | 3090, 47192 |
| _execFuse | 47235, 47316, 48401 |
| _learnSkillAuto | 47274, 47306, 47314 |
| _skillRecAuto | 3090, 47299 |
| renderSkillDetail | 47327, 47575 |
| renderSkillPanel | 13701, 44049~44050, 44066, 44068, 47154, 47229, 47322, 47353, 47362, 47393, 47816, 47881, 47953, 48210, 48225, 48296, 48393, 48395, 48402, 48404, 48441 |
| _drawSkillFuseLines | 47576, 47589 |
| _skCtx | 47678, 47767, 47819 |
| _skLearnUp | 47767, 48464 |
| _skLevelDown | 47819, 48462 |
| _skResetSkill | 47884, 48456 |
| _renderSkillRow | 47452, 47514, 47518, 47522~47523, 47526, 47955 |

### D.2 스킬55개: 입력·게이트·피해/틱·투사체·UI·저장보정 참조

이 표는 스킬별 consumer를 임의로 누락하지 않기 위한 역색인이다. 개별효과의전함수이식단위는미배정이며, 다음작업이SK-S01이라는범위를확장하지않는다.

| skill id | game.html 모든 matching 행 |
|---|---|
| chargeBoost | 3774, 3777, 12022, 12853, 13362, 28420, 31971, 32166, 32194, 32226, 32289, 32484, 32547, 32778~32779, 32787, 33526, 33529, 33543, 33546, 33574, 33577, 33695, 33698, 33967, 33973, 33979, 44098, 44118, 44162, 44325~44329, 44454~44458, 44545, 44557, 44648, 44797, 44843~44844, 44882, 47007, 47018, 47263, 47538, 47676, 47679, 47681, 47685~47689, 47958, 47960, 47966~47970, 48059~48060, 48126, 48412, 51393, 61957, 62231, 62370, 63457 |
| magicBlink | 12853, 13358, 13362, 31970, 32190, 32194, 32224, 32226, 32278, 32282, 32340~32341, 32343~32344, 32379, 32545, 32547, 32780, 33518, 33522, 33529, 33535, 33539, 33546, 33566, 33570, 33577, 33688, 33691, 33698, 34027~34028, 34030, 44098, 44118, 44163, 44278, 44280, 44325~44329, 44454~44458, 44548, 44557, 44618, 44797, 44843, 47538, 47676, 47679, 47681, 47958, 47960, 48059~48060, 48126, 48412, 51393, 61957, 62370, 62397, 63458 |
| ghostWalk | 3571, 3872, 3874~3875, 3877, 3898, 3901, 9530, 9532, 9584, 12023, 12915, 12980, 13100~13101, 13107, 28316, 28492, 28495~28496, 28499~28500, 28645, 29030, 33855, 36638, 36641, 44104, 44118, 44164, 44313~44314, 44356, 44485, 44550, 44618, 44657, 44921, 44969, 46624, 46633, 46638, 46647~46648, 47022, 47035, 47676, 47739, 48020, 48059~48060, 48412, 58285, 58653, 58788~58789, 58821, 58835, 58838, 58893, 58899, 61963, 61980, 62015, 62157, 62370, 63927, 64084 |
| bladeDash | 3898, 3901, 9529, 9532, 12023, 13232, 28316, 29031, 31962, 31971, 31976, 32985, 33037, 33130, 33371, 33752, 33943, 34117, 34349, 44097, 44118, 44130, 44165, 44337, 44355, 44464, 44484, 44524, 44648, 45021, 45098, 45343, 45358, 45364, 45366, 45408, 45419, 45427, 45456, 47263, 47676, 47737~47738, 48018~48019, 58552, 58653~58654, 58677~58678, 58713, 58798~58799, 58822, 61957, 62370 |
| kiSlash | 3791~3792, 14299, 16817, 16819, 16825, 19837, 28640, 29027, 29031, 31985, 33054, 33056, 33563, 33565, 44118, 44166, 44304~44305, 44543, 44653, 44747, 44750~44753, 44902, 47035, 47284, 47536, 47676, 47784, 47940, 61957, 62370, 62394, 62494, 64003 |
| fireball | 3567, 3858, 3860~3861, 3901, 10323, 12355, 17313, 17335, 24568, 24582, 24589, 24597, 24695, 24713, 28386~28388, 28643, 28779, 28950, 28994, 29009, 29026, 29031, 33061, 33319, 33589, 33633, 33639, 33641, 33644~33645, 35179, 35186~35187, 35202, 35212, 35220, 35257, 35489, 44118, 44167, 44281~44282, 44535, 44655, 44765, 44896, 44969, 46520, 46955, 47007, 47035, 47282, 47676, 47781, 47940, 48059~48060, 48412, 59103, 59151, 59270, 61957, 62153, 62370, 62395, 63923, 64080 |
| whirlwind | 3568, 3792, 3794, 3806, 3864, 3866, 8059, 10463, 11997, 12020, 28407, 31102, 31110, 31972, 33052, 33122~33123, 33145, 33173, 34061, 34851, 34856, 34965, 34974, 35031, 35040, 35063, 37605, 38469, 40771, 42387, 42392, 42701, 43315, 43317, 43413, 43497, 44106, 44118, 44168, 44304, 44306, 44332~44335, 44459~44462, 44529, 44648, 44758, 44903, 45409, 45452, 47007, 47018, 47249, 47263, 47536, 47676, 47692~47696, 47742, 47756, 47797, 47973~47977, 48023, 48037, 48059~48060, 48412, 58343, 58348, 58442, 58480, 58606, 58683, 58743, 58823, 58847, 58869~58870, 59613, 59620, 59626~59627, 61958, 61980, 62012, 62154, 62231, 62370, 62392, 62396, 63924, 64081 |
| detonate | 3806, 6620, 8797, 12798, 14309, 31102, 31110, 33050, 33123, 33151, 33153, 33160, 33203, 33365, 33550, 33581, 33652, 33739, 33744, 33760, 33801, 33876, 34757, 34850, 34925, 34966, 34987, 35065, 35105, 35126, 36007, 36148, 36183, 36630, 36874, 36898, 37000, 37033, 37059, 37067, 37071, 37073, 37131, 37135, 37137, 37147, 37151, 37874, 37945, 38115, 38475, 40535, 40579, 40682, 40771, 41003, 41024, 41058, 41297, 42392, 42701, 43303, 43305~43306, 43310, 43313, 43325, 43348, 43371, 43444, 43465, 43476, 43490, 43497, 44106, 44118, 44169, 44203, 44219, 44309, 44311, 44332~44335, 44459~44462, 44514, 44618, 44772, 46504, 46661, 46844, 46926, 46936, 47676, 47692~47693, 47756, 47797, 47973~47974, 48037, 48126, 48155, 58345, 58393, 59613, 59616, 61020, 61116, 61958, 62370, 62396, 64426, 64889 |
| maliceSwipe | 3486, 3489, 3491, 3497, 28641, 29028, 29031, 31972, 31986, 33377, 33397, 33412, 33434, 34855, 38452, 38464, 44103, 44118, 44124, 44170, 44307~44308, 44341, 44470, 44648, 44660, 44916, 46183, 47018, 47263, 47537, 47676, 47709~47710, 47990~47991, 48059~48060, 48412, 59025, 61960, 62231, 62371, 62396 |
| fanShot | 3806, 3846, 3858, 3898, 3901, 28380, 28403, 28732, 28744, 28762, 28781, 28903, 28908~28909, 31963, 31969, 31977, 31983, 33180, 34109, 34111, 34120, 44101, 44106, 44118, 44171, 44292, 44296, 44330~44331, 44334~44335, 44461~44462, 44466~44467, 44618, 44928, 44943, 44945, 44947, 44969, 46979, 47018, 47263, 47353, 47479~47480, 47507, 47676, 47701~47702, 47704, 47756, 47797, 47982~47983, 47985, 48037, 48059~48060, 48126, 48412, 54367, 61958, 62371 |
| omniBeam | 3806, 3898, 3901, 28380, 28387, 28774, 28781~28782, 28903, 28907~28910, 28913, 33180, 33185, 33212, 34109, 34111, 34120, 34122, 34150~34151, 34158, 34294, 44101, 44106, 44118, 44172, 44281, 44283, 44330~44331, 44334~44335, 44461~44462, 44466~44467, 44528, 44618, 44631, 44648, 44969, 46979, 47007, 47018, 47263, 47353, 47479, 47507, 47676, 47701~47703, 47756, 47797, 47982~47984, 48037, 48059~48060, 48412, 54367, 54407, 54440, 61958, 62231, 62371 |
| elemMissile | 3806, 28387, 28901~28903, 28909, 33180, 33185, 33591~33592, 33594, 33605, 34109, 34121, 34159, 44101, 44106, 44118, 44173, 44281, 44284, 44331, 44334~44335, 44461~44462, 44467, 44551, 44618, 44969, 47676, 47701, 47756, 47797, 47982, 48037, 48059~48060, 54370, 61958, 62371 |
| guardian | 31087, 34410, 36770~36771, 36776, 42186, 44099, 44118, 44175, 44336, 44342~44343, 44463, 44471~44472, 44618, 45101, 47676, 47697, 47978, 59706~59707, 61959, 62371 |
| maliceHunt | 12943, 16864, 16879, 17315, 17336, 28285, 34739~34740, 34747, 35274, 35410, 35449, 35457, 35472~35473, 35475, 35521, 35545, 36777, 36784, 38767, 42386, 42396, 42467, 44099, 44118, 44122, 44176, 44336~44337, 44342~44343, 44463~44464, 44471~44472, 44530, 44648, 44780, 45097, 45116, 45129, 45176, 47018, 47263, 47676, 47697~47698, 47711~47714, 47978~47979, 47992~47995, 48153, 59706~59707, 61959, 61976, 62229, 62371 |
| venomBlade | 12948, 17337, 28281, 35184, 35192, 35194, 35202, 35280, 35284, 35346, 44118, 44177, 44343, 44472, 44531, 44618, 45107, 45142~45143, 45157, 45184, 45188, 45206, 47676, 47712~47713, 47993~47994, 59285, 62371 |
| ltnChaser | 3901, 12951, 17315, 17336, 28283, 28746, 35210, 35274, 35287, 35308, 35316~35317, 35327, 42386, 42396, 44118, 44178, 44298, 44532, 45217, 45221, 45241, 45249, 47676, 59210, 59305 |
| maliceMortar | 3844, 8682, 12924, 28292, 28316, 31968, 36833, 36858, 36867~36868, 36883, 36892, 36948, 36950, 36993~36994, 37000, 44104, 44118, 44123, 44179, 44338, 44465, 44510, 44648, 45259, 47018, 47035, 47263, 47676, 47699~47700, 47980~47981, 55570, 61961, 61974, 62229, 62372 |
| boneWall | 3813, 12929, 28300~28303, 28439~28441, 35888, 36201~36202, 36412~36413, 36418, 44096, 44118, 44180, 44339, 44468, 44512, 44618, 45279~45281, 45284, 47676, 47706, 47987, 55597, 55677, 61959, 62372 |
| blackStar | 8684, 12975, 28316, 28365, 36750, 44100, 44118, 44181, 46826, 46845, 47676, 57339, 57383, 61965, 61979, 62372 |
| lavaSummon | 12972, 28316, 28366, 36714, 44100, 44118, 44182, 46865, 46902, 47676, 57418, 62372 |
| execution | 9541, 28316, 33071, 33075, 44100, 44118, 44183, 47676, 61965, 62372, 62392 |
| iceOrb | 3870, 3898, 3901, 9531~9532, 9584, 12916~12917, 12920, 12922~12923, 13109, 13111~13112, 13273, 13277, 14325~14326, 28316, 28499~28500, 31964, 31970, 31978, 32995, 33040, 33939~33940, 36841~36842, 36880, 36928, 36932, 36948, 44104, 44118, 44186, 44313, 44315, 44338, 44465, 44511, 44618, 44969, 45261, 46757, 46759, 46769, 46771, 47676, 47699, 47980, 48059~48060, 48412, 55571, 57262, 58300, 61961, 62190~62191, 62373, 62498~62499, 64007, 64010 |
| needleShot | 3901, 28316, 28745, 28756, 44118, 44187, 44292, 44297, 44537, 44969, 45330, 45333, 45335, 47676, 48412, 61963, 62373, 62395 |
| arcLaser | 3901, 28828, 28843, 28857, 28933~28934, 44118, 44189, 44281, 44291, 44527, 44969, 47676, 61963, 61980, 62011, 62373 |
| fireBeam | 28387~28388, 28867, 28870, 28945, 33635, 44118, 44190, 44281, 44289, 44536, 46946~46947, 46959, 47676, 61963, 62373 |
| maliceDome | 12992, 28316, 34676, 37240, 44118, 44191, 46693, 46699, 47676, 59866 |
| fireAura | 28387~28388, 28895~28896, 33626~33627, 33629, 33631, 33633, 37353, 44118, 44192, 44281, 44288, 44352, 44481, 44520, 44618, 46514~46515, 46519, 46848, 46855, 47676, 47731, 48012, 56188, 61962, 62373 |
| plagueBurst | 12982, 28316, 35383, 36778, 42771, 44099, 44118, 44193, 44342~44343, 44471~44472, 44515, 44618, 45106, 45133, 46168, 47676, 47698, 47711, 47979, 47992, 61959, 62373 |
| maliceStorm | 12954, 28287, 28289, 35888, 36355, 36357, 36372, 36391, 36405, 36453, 44096, 44118, 44121, 44194, 44339~44340, 44468~44469, 44519, 44648, 47018, 47263, 47676, 47705~47708, 47986~47989, 55595, 61959, 61973, 62229, 62373 |
| darkPillar | 12962, 28316, 36468, 37194, 37196, 37413, 37417~37418, 37427, 37448, 37512, 44095, 44118, 44125, 44195, 44350~44351, 44479~44480, 44521, 44618, 44648, 44803, 46264, 46266, 46282, 46292, 46509, 47018, 47263, 47676, 47727~47728, 47730, 48008~48009, 48011, 56001, 61961, 62229, 62374 |
| holyDome | 3849, 3851, 3901, 9607, 9611, 12995, 28316, 32608, 32706, 32709, 35937, 37255~37256, 38523, 44105, 44118, 44127, 44196, 44344~44349, 44473~44478, 44648, 44910, 46707, 46713, 47018, 47263, 47676, 47715~47726, 47996~48007, 55776, 56294, 59888, 61960, 61978, 62186, 62229, 62374, 62393, 62487, 62496, 62502, 62504, 63996, 64005, 64011, 64013, 64132 |
| holyPrison | 12997, 28316, 35703, 37255, 42524, 42528, 42631, 42645, 44105, 44118, 44197, 44344~44349, 44473~44478, 44618, 46708, 46716, 46718, 46734, 46739, 46743, 47676, 47719~47720, 48000~48001, 56330, 59885, 61960, 62374 |
| iceStorm | 3815, 4671, 12965, 28300~28303, 28439~28441, 32608, 32611, 32641, 35888, 36475~36476, 36489, 36498, 36506, 36512, 37263, 44097, 44107, 44118, 44198, 44345~44349, 44474~44478, 44618, 46720, 46722~46723, 47676, 47719, 48000, 55656, 55776, 55779, 56124, 61960, 62374 |
| giantSlam | 3566, 3806, 3850~3851, 3854~3855, 9599, 12999~13001, 13003~13004, 28316, 28429, 29025, 31961, 31971, 31976, 31983, 32481, 32521, 32571, 32573, 43356, 43368, 43373, 44106, 44118, 44199, 44231, 44301~44302, 44329, 44333~44335, 44458, 44460~44462, 44509, 44618, 44790, 46450~46451, 46454, 46468, 46494, 46548, 47676, 47684, 47692, 47756, 47797, 47963, 47973, 48037, 48059~48060, 48126, 61958, 62152, 62185, 62374, 62393, 62486, 62497, 62502, 62504, 63922, 63995, 64006, 64011, 64013, 64079, 64131 |
| giantSlam2 | 13002~13003, 28316, 28429, 44108, 44118, 44126, 44200, 44231, 44351~44352, 44480~44481, 44648, 44790, 46455, 46492, 46509, 46514, 47018, 47263, 47676, 47727, 47729, 47731~47732, 48008, 48010, 48012~48013, 48126, 61958, 61977, 62229, 62374 |
| skyCrusher | 13007, 28295, 28316, 28429, 28431~28433, 28436, 44118, 44201, 44523, 44821, 45493, 45498, 45500, 47676 |
| chainAssault | 3886~3891, 3901, 32419, 32424, 32474, 32481, 32555~32556, 44098, 44118, 44203, 44326~44329, 44394, 44455~44458, 44546, 44618, 47278, 47676, 47681, 47773~47774, 47960, 47964, 48059~48060, 48412, 61957, 62375 |
| chainSlam | 3889~3891, 3901, 32385, 32390, 32399, 32403, 32481, 32562, 32564, 37586, 44098, 44118, 44204, 44327~44329, 44394, 44456~44458, 44513, 44618, 47278, 47676, 47682, 47773~47774, 47961, 47964, 48059~48060, 48412, 56783, 61957, 62375 |
| chainSlash | 3901, 16519, 32250, 32269, 32303, 32306, 32315, 32351, 32353, 42674, 44109, 44118, 44206, 44328~44329, 44394, 44457~44458, 44547, 44618, 47676, 47683, 47962, 47965, 48059~48060, 48412, 61957, 62375 |
| peaceShield | 3806, 3901, 12024, 14296, 14321, 28316, 28480, 33772, 33774, 38469~38470, 43413, 43448, 44118, 44207, 44309, 44312, 44910, 44969, 47252, 47368, 47540, 47676, 48059~48060, 48412, 59595, 61980, 62014, 62375 |
| hellRay | 3806, 3813, 3901, 28300~28304, 28439~28441, 28443, 33061, 36323~36324, 36344, 36347, 36352, 36361, 36416, 36426~36428, 36430, 36433, 37379, 44118, 44208, 44281, 44285, 44340, 44394, 44469, 44540, 44618, 44969, 47007, 47253~47254, 47368, 47676, 47705, 47986, 48059~48060, 48361, 48412, 55544, 56332, 61959, 62375 |
| shieldThrow | 3487, 3491, 3497, 3901, 13086, 28316, 28514, 28519, 29031, 31963, 31969, 31977, 33434, 38454, 38467, 44103, 44118, 44209, 44341, 44470, 44618, 44969, 46180, 46183, 46185, 46188, 46194, 46213, 47676, 47709, 47990, 48059~48060, 48412, 61960, 62375 |
| weakPhys | 3817, 12986~12987, 28316, 37213, 37223, 37232, 44118, 44211, 44346~44349, 44475~44478, 44618, 46679, 46683~46684, 47676, 47718, 47999, 56268, 56281, 61964, 62376 |
| weakMag | 3818, 12988~12989, 28316, 37213, 37224, 37232, 44118, 44212, 44347~44349, 44476~44478, 44618, 46679, 46683~46684, 47676, 47717, 47998, 56268, 56281, 61964, 62376 |
| weakPj | 3819, 12990~12991, 28316, 37213, 44118, 44213, 44348~44349, 44477~44478, 44618, 46679, 46683~46684, 47676, 47716, 47997, 56268, 56281, 61964, 62376 |
| weakRev | 3820, 12984~12985, 28316, 37202, 43740, 44118, 44214, 44349, 44478, 44618, 46679, 46683~46684, 47676, 47715, 47996, 56268, 61964, 62376 |
| spikeTrap | 3848, 3854, 9350, 9358, 9598, 13010, 28316, 37194, 37196, 37413, 37418, 37465, 37468, 37545, 42689, 42692, 44095, 44118, 44215, 44350, 44479, 44522, 44618, 44812, 45507, 45511, 45513, 45517, 46269, 46294~46295, 46300, 46855, 47676, 47728, 47940, 48009, 56252, 61961, 62187, 62376, 62488, 62495, 62504, 63997, 64004, 64013, 64133 |
| blueShot | 3809, 3901, 28316, 28387~28388, 28780, 28888~28890, 33606, 33618, 33621, 36055, 36059, 36077, 43168, 44118, 44216, 44281, 44286, 44534, 44969, 47676, 48059~48060, 62376 |
| burstLoop | 3804, 3811, 3901, 8681, 12023, 28387, 28882~28885, 28961, 28966, 33069, 33253, 33291, 33305, 33707, 43169, 43413, 43439, 44118, 44217, 44281, 44287, 44335, 44462, 44541, 44618, 47676, 47741, 48022, 48059~48060, 54316, 61963, 62376 |
| voidScarecrow | 13021, 28309, 28316, 43170, 44102, 44118, 44129, 44143~44144, 44218, 44353~44354, 44482~44483, 44618, 45533~45534, 45546, 47263, 47676, 47733, 47735~47736, 48014, 48016~48017, 48064, 61962, 62229, 62377 |
| explodeScarecrow | 13043, 28312, 28316, 44102, 44118, 44143~44144, 44219, 44354, 44483, 44618, 46089, 47676, 47735, 48016, 61962, 62377 |
| ancestorSummon | 13050, 28316, 44118, 44220, 44553, 45563, 45813, 45815, 46013, 47676, 61962, 62377, 62392 |
| ghostXbowTurret | 3844, 13058, 28316, 28728, 28749, 44118, 44128, 44221, 44299, 44353, 44482, 44648, 45525, 47263, 47676, 47733~47734, 48014~48015, 48059~48060, 54895, 61962, 61975, 62377 |
| timeWarp | 3877, 3898, 3901, 13100, 13113, 28316, 28495, 28500, 44118, 44131, 44222, 44313, 44316, 44356, 44485, 44648, 44969, 46599, 46612, 47018, 47263, 47676, 47739~47740, 48020~48021, 48059~48060, 48412, 61963, 62231, 62377, 62395 |
| thunderStake | 13012, 13014, 36211~36212, 36590~36591, 36595, 36601, 44097, 44118, 44223, 44355, 44484, 44525, 44618, 45394, 45398~45399, 47676, 47737, 48018, 55737, 61962, 62377, 62393 |

### D.3 합체32개: 실제 효과·표시·복원 분기 참조

| fusion key | game.html 모든 matching 행 |
|---|---|
| dimBreach | 3828, 8683, 13353, 16649, 31964, 31970, 31978, 32184, 32217, 32278, 32340~32341, 32538, 44098, 44118, 44322, 44325~44326, 44454, 44487, 44618, 44638~44639, 44648, 44839, 47007, 47018, 47263, 47755, 47796, 48036, 48052, 48133, 48150~48152, 48155~48156, 48354, 51393, 62381 |
| dimSlam | 3824, 3827~3828, 16649, 44118, 44326~44327, 44455, 44487, 44618, 44638~44639, 44648, 46978, 47007, 47018, 47263, 47681, 47755, 47796, 47960, 48036, 48052, 48133, 48150~48152, 48155~48156, 48354~48355, 62381 |
| dimThunder | 3824, 3826~3827, 32784, 44118, 44327~44328, 44456, 44487, 44618, 44638~44639, 44648, 46978, 47007, 47018, 47263, 47682, 47755, 47796, 47961, 48036, 48052, 48133, 48150~48152, 48155~48156, 48355~48356, 51393, 62381, 63462 |
| dimRush | 3824~3826, 32784, 44109, 44118, 44206, 44328~44329, 44457, 44487, 44618, 44638~44639, 46978, 47683, 47755, 47796, 47962, 48036, 48133, 48150~48152, 48155~48156, 48356~48357, 51393, 62381, 63462 |
| dimBlast | 3824~3825, 32348~32349, 32478, 32552~32553, 32569, 32571, 44118, 44329, 44458, 44487, 44618, 44638~44639, 44648, 46978, 47007, 47018, 47263, 47684, 47755, 47796, 47963, 48036, 48133, 48150~48152, 48155~48156, 48357, 61980, 62381 |
| whirlDet | 3794, 3801~3802, 3806, 3866, 16649, 31102, 31110, 33123~33124, 33151, 33153, 34966, 34969, 35035, 35040, 35063, 40771, 43304, 43497, 44332, 44459, 44487, 44618, 44638~44639, 44648, 44903, 46976, 47018, 47249, 47263, 47693, 47755, 47796, 47974, 48036, 48052, 48133, 48150~48152, 48155~48156, 48359, 58345, 62382 |
| slamStorm | 3794, 3801~3802, 3805~3806, 3866, 16649, 31102, 31110, 33124, 33255, 33269, 33271, 33278, 40771, 43319, 43353, 43356, 44333~44334, 44460, 44487, 44618, 44638~44639, 44648, 44903, 46504, 46976, 47018, 47249, 47263, 47692, 47755~47756, 47796~47797, 47973, 48036~48037, 48052, 48133, 48150~48152, 48155~48156, 48359, 48364, 59620, 62382 |
| stormBeam | 3794, 3803~3806, 3846, 3866, 28744, 28777, 28911, 33049, 33052, 33061, 33180, 34063, 36323, 43313, 43373, 43378, 43381, 44106, 44334~44335, 44461, 44487, 44618, 44631, 44638~44639, 44648, 45411, 46976, 46979, 47007, 47018, 47249~47251, 47263, 47367~47368, 47691, 47755~47756, 47796~47797, 47972, 48036~48037, 48052, 48133, 48150~48152, 48155~48156, 48363, 58408, 62382, 64888 |
| stormBurst | 3803~3804, 28962, 33250, 33253, 33307, 43313, 43373, 44335, 44462, 44487, 44618, 44638~44639, 44648, 46976, 46979, 47263, 47741, 47755, 47796, 48022, 48036, 61980, 62382 |
| bladeFuse | 16649, 36777, 44099, 44118, 44122, 44336, 44342, 44463, 44618, 44638~44639, 44648, 45101, 47018, 47263, 47697, 47755, 47796, 47978, 48036, 48052, 48133, 48150~48152, 48155~48156, 59706, 62383 |
| bladeEcho | 16649, 33944, 44337, 44464, 44640~44641, 45021, 45027, 45098, 48153 |
| iceMortar | 16649, 44104, 44118, 44123, 44338, 44465, 44618, 44638~44639, 44648, 45261, 47018, 47263, 47699, 47755, 47796, 47980, 48036, 48052, 48133, 48150~48152, 48155~48156, 55571, 61972, 62383 |
| sixFuse | 3799~3800, 3806, 3846, 16649, 28380, 28744, 28777, 28781, 28908, 34110~34111, 34120, 44330, 44392, 44466, 44487, 44618, 44638~44639, 44648, 46979, 47007, 47018, 47263, 47353, 47479, 47507, 47702, 47755, 47796, 47983, 48036, 48052, 48133, 48150~48152, 48155~48156, 48358, 54367, 62383 |
| elemFuse | 3799~3800, 3805~3806, 3846, 16649, 28744, 28777, 28903, 28909, 34109~34110, 34121, 44101, 44331, 44334, 44392, 44467, 44487, 44618, 44631, 44638~44639, 44648, 46979, 47007, 47018, 47263, 47701, 47755~47756, 47796~47797, 47982, 48036~48037, 48052, 48133, 48150~48152, 48155~48156, 48358, 48365, 54370, 62383 |
| boneStorm | 3812~3813, 12956, 16649, 28287, 28289, 36397, 36401, 36423, 37413, 37452, 37522, 44096, 44118, 44121, 44339, 44468, 44487, 44618, 44638~44639, 44648, 47018, 47263, 47676, 47706, 47755, 47796, 47987, 48036, 48052, 48133, 48150~48152, 48155~48156, 48360, 55596, 56004, 56006, 62384 |
| elecRepent | 3812~3813, 12956, 16649, 28287, 28289, 28304, 33061, 34851, 36325, 36346, 36397, 36415, 36426, 38469, 44118, 44121, 44340, 44469, 44487, 44618, 44638~44639, 44648, 47018, 47263, 47676, 47705, 47755, 47796, 47986, 48036, 48052, 48133, 48150~48152, 48155~48156, 48360~48361, 55596, 61972, 62384 |
| shieldFuse | 3488, 16649, 16926, 29031, 33433~33434, 38458, 44103, 44118, 44124, 44341, 44470, 44618, 44638~44639, 44648, 46183, 47018, 47263, 47709, 47755, 47796, 47895, 47990, 48036, 48052, 48133, 48150~48152, 48155~48156, 62384 |
| plagueFuse | 16649, 36778, 44118, 44122, 44342, 44471, 44618, 44638~44639, 44648, 45106, 47018, 47263, 47698, 47711, 47755, 47796, 47979, 47992, 48036, 48052, 48133, 48150~48152, 48155~48156, 61972, 62384 |
| plagueVenom | 16649, 36778, 44118, 44343, 44472, 44618, 44638~44639, 44648, 45106~45107, 47018, 47263, 47712~47713, 47755, 47796, 47993~47994, 48036, 48052, 48106, 48133, 48150~48152, 48155~48156 |
| holyFuse | 3814~3815, 16649, 44105, 44118, 44127, 44344, 44473, 44487, 44618, 44638~44639, 44648, 46708, 47018, 47263, 47720, 47755, 47796, 48001, 48036, 48052, 48133, 48150~48152, 48155~48156, 48362, 61972, 61978, 62385 |
| holyIce | 3814~3815, 3817, 16649, 44107, 44118, 44127, 44345, 44474, 44487, 44618, 44638~44639, 44648, 46720~46721, 46726, 47018, 47263, 47719, 47755, 47796, 48000, 48036, 48133, 48150~48152, 48155~48156, 48362, 62385 |
| holyWeak1 | 3817~3818, 44118, 44127, 44346, 44475, 44487, 44618, 44638~44639, 44648, 46726, 47718, 47755, 47796, 47999, 48036, 48133, 48150~48152, 48155~48156, 62385 |
| holyWeak2 | 3818~3819, 44118, 44127, 44347, 44476, 44487, 44618, 44638~44639, 44648, 46726, 47717, 47755, 47796, 47998, 48036, 48133, 48150~48152, 48155~48156, 62385 |
| holyWeak3 | 3819~3820, 44118, 44127, 44348, 44477, 44487, 44618, 44638~44639, 44648, 46726, 47716, 47755, 47796, 47997, 48036, 48133, 48150~48152, 48155~48156, 62385 |
| holyWeak4 | 3820, 44118, 44127, 44349, 44478, 44487, 44618, 44638~44639, 44648, 46726, 47715, 47755, 47796, 47996, 48036, 48133, 48150~48152, 48155~48156, 62385 |
| pillarSpike | 16649, 44095, 44118, 44125, 44350, 44479, 44618, 44638~44639, 44648, 45509, 46269, 46294, 46508, 46510, 47018, 47263, 47728, 47755, 47796, 48009, 48036, 48052, 48150~48152, 48155~48156, 62386 |
| pillarSlam | 16649, 44118, 44126, 44351, 44480, 44618, 44638~44639, 44648, 46305, 46455, 46509, 47018, 47263, 47727, 47755, 47796, 48008, 48036, 48052, 48150~48152, 48155~48156, 62386 |
| infernoSlam | 16649, 44118, 44126, 44352, 44481, 44618, 44638~44639, 44648, 46455, 46492, 46514, 47263, 47731, 47755, 47796, 48012, 48036, 62386 |
| siegeGhost | 13064, 16649, 35478, 36012, 44118, 44128, 44353, 44482, 44618, 44638~44639, 44648, 45533, 45536, 47263, 47733, 47755, 47796, 48014, 48036, 61972, 61975, 62386 |
| dualScarecrow | 13031~13032, 16649, 35953, 44102, 44118, 44129, 44354, 44483, 44618, 44638~44639, 47263, 47735, 47755, 47796, 48016, 48036, 48133, 48150~48152, 48155~48156, 62386 |
| thunderGhost | 16649, 44097, 44118, 44130, 44355, 44484, 44618, 44638~44639, 44648, 45394, 47263, 47737, 47755, 47796, 48018, 48036, 48133, 48150~48152, 48155~48156, 62386 |
| timeStep | 3877, 13100, 28495, 44118, 44131, 44356, 44485, 44618, 44638~44639, 44648, 46612, 46624, 46982, 47018, 47263, 47739, 47755, 47796, 48020, 48036, 48133, 48150~48152, 48155~48156, 62386 |
