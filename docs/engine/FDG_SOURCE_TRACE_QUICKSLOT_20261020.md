# 퀵슬롯·물약 원본 추적과 작은 이식 단위 지시서

작업 `trace-quickslot` · 2026-10-20 KST · 검수 대기용 문서. 이번 변경은 이 문서 1개뿐이다. 제품 코드·테스트·기존 설계 문서·작업판은 수정하지 않았다. 아래 QS-01부터의 파일/API 이름과 줄 수는 **후속 구현안**이며 현재 구현된 것으로 읽지 않는다.

## 0. 기준·범위·중복 작업 확인

| 구분 | 확인 결과 |
|---|---|
| 기준 commit | `c7c910fd04559a78be0e64295a97390d01fd2d09` (`origin/main` fetch 후 고정). 이후 이동한 main은 이 문서의 조사 기준이 아님 |
| 자기 작업 위치 | `~/exoduser-wt/trace-quickslot`, `codex/trace-quickslot-20261020` |
| R 보존 | `/Users/fordeargamers/Projects/exoduser-migration-20261001`의 브랜치·HEAD·tracked INDEX/WORK 변경 없음. 최초 worktree 생성은 config lock으로 실패하여 BLOCKED 보고. 재개 지시 후 정상 fetch의 비강제 fast-forward로 자기 미사용 브랜치를 최신화하고 정상 worktree add 성공. 잠금 삭제·force·reset·merge 없음 |
| 원본 파일 | `game.html` 65,692행, SHA-256 `4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4`; `index.html` 4,742행, SHA-256 `36008f72723dbcbf1ae7b6af6b08dfe6299962e2445261139b6237082a24cf12` |
| 보드 | 기준 SHA의 `docs/engine/orders/WORK_BOARD.md` 전체 확인. TRACE-QUICKSLOT은 본 문서 단독 소유로 등록됨. TRACE-INVENTORY(2_7), TRACE-SAVE(15), TRACE-SETTINGS(3.3), TRACE-REVIVE-SHIELD(2_5)와 경계를 분리 |
| P4 | `FDG_GAME_DEVELOPMENT_PLAN.md:35`의 UI/진행 결과 일치·보호 범위와 `:83` P4-001 exactscope/HOLD 확인. QS-01~07은 이 문서 내부 순서 ID이며 작업판의 새 구현 배정·main 반영을 뜻하지 않음 |
| 진행 중 충돌 | P2-001l은 `player.gd`·`main.gd` 입력과 레슨 흐름, P3-002는 World 소환굴, P2-007a는 글꼴/UI, P2-006a는 드랍/줍기 WIP, P2-004b는 펫 대사, QA-002·STARTER-REGIONS는 해당 테스트 소유. 이 파일들에 이번 쓰기 0 |
| 보호 | `docs/2_3`·Q/E·세이브 형식은 **보호**. 추적만 하며 변경/마이그레이션/입력 재배정 제안 없음. 폐지된 수동 물약·qsAuto 토글·드래그 UI 복원도 범위 밖 |
| 증거 수준 | 원본과 Godot 파일/기존 테스트 본문을 정적으로 확인하고, 원본 발췌 식만 Node 24.15.0에서 실행. Godot 테스트 재실행·실창·PC 실행·실세이브 검증은 **미확인** |

핵심 판정: 현행은 **자동 악의 추출**이다. `POT`에는 hp만 있고, HP 물약 드랍은 악의로 즉시 바뀐다. `QSLOTS`는 잔여 호환 상태이며 HUD의 숫자 칸은 스킬 전용이다. Godot의 처치→악의 전환 구현을 자동 회복 구현 완료로 세지 않는다.

## 1. 원본 데이터·상수·함수·UI 전수 추적

행 번호는 위 SHA의 파일 기준이다. §7은 핵심 식별자의 모든 일치 행을 포함한다(주석 포함, 한 행 내 중복은 한 번). 번역 문장·펫 대사·아이템 툴팁 등 경계 소비자는 아래 별도 행으로 묶었다. 다른 스킬·전투 시스템 전체를 이 작업의 소유권으로 확대하지 않는다.

### 1.1 상태와 원본 계산 계약

| ID | 데이터/함수 | `game.html` 행 | 실제 구조·상수·공식·소비 |
|---|---|---|---|
| D01 | `POT` | 27677~27679 | hp 1종. name=`악의구슬 추출`, emoji=`👿`, col=`#33cc66`, colG=`#66ff99`, base=100, per=20, desc=`악의구슬을 소모해 지옥의 힘으로 회복합니다 (+100 HP)`. `base/per`를 `potHeal` 식으로 오인하지 않음 |
| D02 | `QSLOTS` | 27680 | 4객체 `[{type:'hp',count:1},{type:null,count:0}×3]`. hp 사용 비용은 count가 아니라 `G.mats`. 구조 **보호** |
| D03 | `SKILL_SLOTS`, `ULT_SLOT` | 27681~27682 | 6칸/null. 0~3=1~4, 4=Space, 5=F, 별도 R 필살기. 물약 전역과 별개 |
| D04 | 잔여 CD/토글/선택 | 27683~27686 | `qsCooldown=[0,0,0,0]`, `autoPotCd=0`, `qsAuto=[true,true,true,true]`, `_qsSwapSel=-1`. 자동 물약은 qsAuto를 읽지 않음. autoPotCd 주석의 5초/300f는 현행 실행식과 다름 |
| D05 | `POT_LV`, `potHeal(type)` | 28071~28072 | `{hp:0}`. `lv<=0?100:lv===1?150:lv*100`; 0~10단 = 100,150,200,300,400,500,600,700,800,900,1000. 함수 자체에 10 clamp 없음 |
| D06 | 장비·패시브 공급 | 16504/16506, 27706, 27970~27971 | `gl()/blt()`=equipped.gloves/belt 또는 `{}`. pRegen max10 정의·3%/lv. `_eqAffix`는 슬롯별 affix의 `(+a.value\|\|0)`를 합산 후 캐시 조회 |
| D07 | 회복 어픽스 | 14468 | `potionPower`, tiers .12/.20/.35/.55/.75, pants, group pot, weight60. 회복량=`~~(potHeal('hp')*(1+_eqAffix('potionPower')))` |
| D08 | 수동 잔여 쿨감 어픽스 | 14680, 28228 | `potionCdRed`, tiers −.04/−.07/−.11/−.16/−.22, belt, group ptCd, weight55. 수동 함수만 `min(affix,.2)`를 빼며 자동식에는 이 항이 없음. 부호나 자동식 수정 제안 없음 |
| D09 | 장갑/벨트 생성 | 16044/16053 | 장갑 rarity별 [.05,.10,.15,.20,.30], 벨트 [.03,.06,.10,.15,.22] ×(0.9+random×.2), 소수3자리. 자동 소비 시 각각 상한 .2. 아이템 생성·RNG는 TRACE-INVENTORY 경계 |
| D10 | 전설 벨트 | 15056, 16610~16620, 32730, 42226 | `_lBeltBuff=.15`, 사용 시 `_lBeltT=300`(28223/35908), 선행 update에서 양수 timer `-=sp`, 피해 `~~(dmg*(1+_lEq('_lBeltBuff')))`. 주석의15%를 live reader 대신 하드코딩하지 않음 |
| D11 | 통계 | 32686, 31569, 28213, 35910 | `G._pStats._hC++`, `G._sStats.potions++`는 해당 객체가 있을 때만. stage 초기화 `_sStats.potions=0`; 결과 41958/41970의 무약 배지/사용 횟수 소비 |
| D12 | 설정 | 2818, 6311, 49039, 49338 | default `OPT.autoPotThr=.99`; 슬라이더 min30/max99/step1/value99, oninput `/100`, populate `~~((OPT.autoPotThr\|\|.99)*100)`. 자동 발동식의 reader가 아님 |

### 1.2 동작·순서·갱신

| ID | 함수/호출부 | 원본 행 | 조건·쓰기·부수 효과와 이식 경계 |
|---|---|---|---|
| F01 | `useQuickslot(idx)` 잔여 함수 | 28202~28243 | idx0~3, 슬롯 type 존재/CD≤0/G.on/!paused/POT gate. hp: mats>0 및 hp<99%mhp → 통계→mats−1. SFX→전설 timer→수동 CD→회복→8 particles→flash→updateQS. 원본 두 파일의 literal 이름 검색은 선언 1행뿐(직접 caller 없음); 외부 콘솔/동적 호출까지 불가능하다고 확대하지 않음. 시그니처 **보호**, 수동 복원 계획 없음 |
| F02 | 수동 CD | 28224~28229 | `max(6,~~(420*(1-min(gl.potCd\|\|0,.2)-min(blt.potCd\|\|0,.2)-min(pRegen*.03,.3)-min(potionCdRed,.2))))`. 자동의 unary+ 보정 및 affix 미사용과 다름 |
| F03 | `addPotion(type,count)` | 28250~28266 | `count=count\|\|1`. hp → mats+=count, pickup, 위치 P+(0,−20), `+count`, #cc66ff, life25, true. 다른 type은 POT에 없으면 false. 아래 same-type stacking/빈 슬롯/가득참 코드는 현행 POT로 도달하는 종류 없음 |
| F04 | refresh 예약 | 28244~28249 | `_qsRefreshPending` 1회 RAF 묶음. hp early return은 이 예약을 호출하지 않음 |
| F05 | update 선두/clock | 32108~32132, 32680~32683 | system lesson tick → !on return → parry tick return → editor return → panel → paused return. slowMo=0 후 `sp=(slowMo>0?.35:1)*_dtSp`. 물약에 초 단위 delta를 직접 넣지 않음 |
| F06 | 잔여 슬롯 CD | 35885~35891 | 앞4개 양수만 `-=sp`; ≤0이면 정확히0 및 updateQS. CD/스킬CD 있으면 `~~(_now)%3===0` refresh, action키는 `%6`. autoPotCd와 다른 timer |
| F07 | 자동 감쇠·임계 계산 | 35892~35895 | autoPotCd>0이면 `-=sp`(0 clamp 없음). 임계 회복량은 매 update 계산. `!window._parryLesson?.active && autoPotCd<=0 && hp>0 && mats>0 && mhp-hp>=heal`. qsAuto/autoPotThr/slot.count는 읽지 않음 |
| F08 | 자동 성공 순서 전반 | 35896~35904 | system lesson active면 before hp/mats 캡처 → mats−− → CD용 장비/패시브 조회 → autoPotCd 대입 → **회복량 다시 조회** → hp=min(mhp,hp+v). 임계 회복량과 실제 회복량의 provider 읽기를 하나로 캐시하지 않음 |
| F09 | 자동 CD | 35898~35902 | `g=min((+gl().potCd)\|\|0,.2)`, `b=min((+blt().potCd)\|\|0,.2)`, `r=min(pRegen*.03,.3)`; `max(6,~~(420*(1-g-b-r)))`. 음수 하한 clamp 없음; pRegen에는 장비의 `\|\|0`를 추가하지 않음; ~~는 ECMAScript ToInt32 |
| F10 | 자동 성공 순서 후반 | 35905~35910 | system lesson `recovered(before,{hp,mats,cooldown})` → SFX.potion → legendary read/조건부 timer300와 text → 회복 text(P y−25, #33ff33, life40) → 통계. 자동에는 수동의 particles8·flash·updateQS 직접 호출 없음. 한 update 최대1회, 큰 sp에도 while 재소비 없음 |
| F11 | 절차형 물약음 | 10369, 12755~12762 | procedural potion mapping. FM/noise 시작 +55/110/170ms 예약. SFX.potion과 mp3 단일 복사를 동등으로 간주하지 않음 |
| F12 | 강화 단건 | 50690~50707 | potion tab hp만. lv>=10 maxed, reqLv=(lv+1)*100. cost=`_malCost((lv+1)*5)`. 다음 회복량 표시용 lv를 일시+1 후 원복. 선택 callback: POT_LV++→mats−cost→text→render |
| F13 | 강화 비용·공용 확인 | 28080~28085, 50461~50474 | `_MALICE_COST_MUL=.5`, `_malCost(v)=max(1,ceil((Number(v)\|\|0)*.5))`(양수). 실제 1~10단 단건비용3,5,8,10,13,15,18,20,23,25. `_fgCraft`: mats gate, Shift/Ctrl이면 같은 선택 callback 최대10회, 끝 dbSaveNow **보호** |
| F14 | 세계/처치 보상 producer | 25847; 32841; 32876; 32907; 43090~43097 | 오브젝트 loot potion, 상자hp+2/기타hp+1. 처치 potion gate 항상1이나 RNG1회 유지, 종류 hp/st/mp RNG1회, boss cnt2/일반1 및 boss50% hp+1. 이미 Godot 처치 경로 존재, 중복 이식/RNG 추가 금지 |
| F15 | 바닥 줍기/펫/렌더 | 32947~32951, 32972~32976, 35631~35633, 41464, 52562~52577 | 수동/끌어당기기 줍기에서 POT 검증→addPotion→picked; 35633은 자동수거 제거 주석(실행 물약 pickup 아님). 펫 실패시 skip300. 녹색 flask/glow, white highlight, cork #aa8855. P2-006a 및 P2-004b 소유 경계이며 이 보고서는 해당 코드 수정안 없음 |
| F16 | 사용 안내·낡은 문구 | 6348, 7155~7156, 9287, 9567, 2692/3134 | 숫자키 물약·제작 대사가 남아 있음. 현행 키 안내는 1~4 스킬 슬롯. 펫 대사 변경은 진행 중 P2-004b 소유라 보고만 |
| F17 | 아이템 비교/스탯 | 16458, 49789, 49876, 51391 | potCd 점수×80, tooltip −%/비교키. **스탯의 CD는 300 base·상한 없는 g+b+pRegen*.03**, 회복+ 표시만 potionPower. 실자동420과 같다고 표기하지 않음 |

### 1.3 UI와 스킬 슬롯 경계

| 요소 | 원본 행 | 실제 동작 |
|---|---|---|
| 레이아웃 | 711~724, 974~985, 2588~2607 | 슬롯 크기37×45/top70. qs0/1/2/3/5 left128/173/217/261/303; 나머지 ult와 고정칸 포함13개. `qs4` DOM 대신 Space `skSlot1`. CSS 후행/외부 스타일 영향은 실측 **미확인** |
| `updateQS()` | 28267~28358 | 6회 순회지만 각 s는 `{type:null,count:0}` 고정. 스킬 우선·흡수/미습득 정리·쿨다운/스택 sweep. 스킬 없으면 빈 칸으로 continue. 28339~28355의 물약 count/auto-on UI는 현재 도달하지 않음 |
| 스킬 CD 상세 | 28281~28318 | 전용 venomBlade900/ltnChaser720/maliceHunt900, maliceStorm 합체900/일반1200, maliceMortar660, skyCrusher900+최대3스택, iceStorm/boneWall/hellRay recharge480, scarecrow 흡수량; 그 외 cd map/skill.cd. 이는 스킬 담당 계약이며 물약CD로 통합하지 않음 |
| 부속 갱신 | 28359~28374, 28375~28575 | `_updateUltSlot`·빈 `_updateSkCdHud`·`_updateActionKeys`. R blackStar/lavaSummon fallback7200. 액션키 Q/E 연결은 **보호**, 변경 제안 없음 |
| 숫자키 | 13262~13267 | Digit1~4: !repeat이고 skill 존재할 때 `_dispatchSkillSlot`. 물약 fallback 없음 |
| 클릭/우클릭 | 28576~28628 | 첫 click listener는 기존 스킬 해제 후 updateQS/dbSaveNow 또는 빈 칸 popup; 우클릭 popup. 뒤의 별도 click listener도 같은 요소에 popup을 연다(`stopPropagation`은 동일 요소 후속 listener를 막지 않음). F도 해제 listener와 popup listener가 함께 남음 |
| tooltip | 28635~28673 | `_slotSkId`→스킬 정보→`skBarTip`, 스킬 없으면 숨김. 물약 tooltip 아님 |
| 배정/해제 | 44276~, 44965~44995, 46969~, 44879~44931 | 스킬 배정 팝업과 슬롯 비우기·updateSkSlot. 본 문서는 물약 표시 복원 대신 현재 Godot `skillSlots`·쿨다운 구현과 경계를 유지 |
| HP CD 텍스트 | 2630, 60244, 60307~60309 | `hpPotCd`는 QSLOTS 앞4칸의 hp 타입과 **qsCooldown**만 읽어 `POT n.ns`. **autoPotCd는 표시하지 않음** |
| 악의구슬/HP 표시 | 2582, 2625~2627, 60323, 60246~60309 | mats/HP 현재값은 일반 HUD 갱신 소비. 새 물약 전용 슬롯이 필요하다는 근거 아님 |
| 설정 | 2818, 49039, 49338, 48876 | 30~99% slider·표시·`hellcave_settings.opt` 저장만. 트리거 미배선 상태를 그대로 보고하며 기능화 제안 없음 |

### 1.4 저장·초기화 필드 (**보호: 변경 제안 없음**)

| 경로 | 원본 행 | 추적 결과 |
|---|---|---|
| 초기 dbSave | 3533~3573 | qslots=QSLOTS(3554), potLv 복사(3561), skillSlots/ultSlot(3572~3573), player hp/mhp·passives·inv 저장. shared mats 별도, game.mats=0. 스키마/IO **보호** |
| 후행 dbSave override | 63898~63920 | 실제 파일 후반에서 dbSave 재할당. qslots63914/potLv63918/game.mats0, shared mats63903. 선행 함수만 조사해 저장 범위를 단정하지 않음 |
| 다른 직렬화 | 62004/62007, 62141/62147, 64071/64075 | 데모·신규 저장 producer에도 qslots/potLv. 각각 mats 저장 방식은 위 선행/override와 동일하다고 가정하지 않음 |
| dbRestore | 3603~, 3717~3719, 3769, 3880~3892 | truthy qslots이면 배열 길이 max(4,len), 비배열4; 원소 primitive/null/array→빈 객체; truthy unknown POT type→빈; 유효 객체 reference/count/extra field 보존. potLv는 POT에 있는 키만 대입, 숫자변환/0~10 clamp 없음. 스킬 슬롯 별도 복원. **보호** |
| 공유 악의구슬 | 3540~3541, 3724~3729, 63903 | 공유 localStorage와 구 game.mats 최대값 동기화, hp 자동 사용은 실제 G.mats를 소비. 원본 저장 형식과 Godot 런타임 상태가 동일하다고 주장하지 않음 |
| fresh/reset 전수 | 61944~61947, 62119~62122, 62357~62360, 62469~62472, 63949~63952, 64098~64101 | demo test/test char는 hp count5, 나머지 주요 fresh/DB부팅 초기값은 count1. 모두 qsCooldown4개0/autoPotCd0/POT_LV.hp0. 이후 복원·보정과 구분 |
| 저장하지 않는 잔여 timer | §7 전수 검색 | autoPotCd/qsCooldown/qsAuto/_qsSwapSel는 이 두 파일의 saveData property에 없음. qsAuto는 선언+도달하지 않는 표시 reader만. 보호 대상인 저장 형식에 새 필드를 추가하는 계획 없음 |
| index.html | 전체1~4742, 특히4348 | 핵심 물약 식별자/한글 명칭 검색0. 해당 데이터/함수/UI/저장 producer 발견0. 4348에서 game.html로 slot/char/test 라우팅만 확인. 서버·외부 script를 포함한 런타임 부재의 증명은 **미확인** |

## 2. 2_8 설계 문서와 원본의 불일치 표 (수정하지 않음)

폴더에는 `docs/2_8 퀵슬롯+물약시스템/2_8 퀵슬롯+물약시스템.md` 1개가 있으며 전체를 읽었다. 아래는 정정 패치가 아니라 관측표다. 폐지 전 이력은 문서가 명시적으로 이력이라고 밝힌 범위와 구분한다.

| ID | 문서 위치/서술 | 원본 근거 | 판정 |
|---|---|---|---|
| M01 | :41 비용 `(lv+1)*5`, 5~50 | 50696 `_malCost`, 28080~28085 할인. 3,5,8,10,13,15,18,20,23,25 | 현재 실지출과 불일치. 기본 입력값/할인 결과 구분 누락 |
| M02 | :10 현행 표의 “HP% 유지” | autoPotThr 6311/49039/49338만, 35895 미소비 | UI 설정은 유지되나 동작에는 무효. 문서 :54~68의 오펀 감사와는 일치; 현행 표만 읽으면 기능으로 오해 가능 |
| M03 | :13 QSLOTS·qsAuto 구세이브 호환용 | QSLOTS qslots 저장·복원 존재. qsAuto 저장/복원 검색0, 27685/28342/28345/28347만 | QSLOTS는 확인. qsAuto의 ‘직렬화 호환 필드’라는 해석은 근거 없음. 잔여 전역으로만 확인 |
| M04 | :19~23 물약 배정·사용·자동 토글·드래그 | 13265/28269/28576~28628 | 문서가 폐지 전 이력으로 명시한 부분. 현재 구현 요구로 전환하지 않음. 현행 drag swap 없음 |
| M05 | :36 “HP/ST 일정 이하 자동” | 35895 hp만/손실≥정수회복량 | 이력 구역의 낡은 설명. 현행 :54~68과 실제 hp-only 식은 일치 |
| M06 | :40 최대10단/레벨 요구 | 50695~50705 단건 선택 gate, 50466~50471 동일callback 10회 | UI 선택 시 상한/레벨 제한은 있으나 batch 내부 재검사 없음. 정적 코드상 초기9에서 같은 callback10회면19 가능. 실제 UI batch 재현은 **미확인**. 임의 cap/수정 제안 없음 |
| M07 | :56의 예시 행~29262, :60 default~5326, :97 h237 등 | 현행 35895/6311/35898~35902 | 소스 행 번호가 과거 기준. 수식 자체(420/.2/.2/.03/.3/6)와 unary+ 보정은 현행과 일치 |
| M08 | :7 “빈 칸 클릭 popup” | 28580~28590 + 28622~28625 | 빈 칸은 일치. 채워진 칸 click에는 해제와 별도 popup listener가 함께 존재. 현행 문서에 이 중복 동작 상세 없음 |
| M09 | :34~35 420f/설계의7초 | 실행35898~35902=420, 통계표시51391=300, 초기 주석27684=300 | 실행식은 문서와 일치. 원본 내부의 스탯 표시/주석 불일치도 별도 기록. 300으로 이식하지 않음 |
| M10 | 녹색 바닥 물약 표기 :25~30/:49~52 | 52562~52577 POT.hp.col 사용 | 코드 일치. 처치 직행 보상은 바닥 생성이 아니므로 두 경로의 구현 상태를 구분 |
| M11 | :95~106 숫자소비·원형 유지 | 35899/35900 unary+, 수동28225/28226에는 unary+ 없음 | 자동식 문서와 일치. 수동과 자동 CD를 동일 함수로 통합하면 원본 차이가 사라짐 |
| M12 | HP cd가 QSLOTS 앞4칸을 읽는다는 :88~92 | 60308은 qsCooldown, 35893은 autoPotCd | 문서와 일치. 자동 CD를 기존 `hpPotCd`에 연결하는 것은 별도 거동 변경이므로 계획에 없음 |

## 3. Godot 의존성: 존재·소비·테스트 근거

`git ls-files godot`와 `rg --no-ignore`로 `.gd`/`.godot`를 확인했다. 파일명 추정만으로 존재 판정하지 않는다. 기존 테스트는 본문을 읽은 증거이며 **이번 실행 PASS가 아니다**.

| 의존성 | 실제 파일/행 | 실제 테스트·현재 판정 |
|---|---|---|
| G/P/INV/PASSIVES 현재 소유자 | `scripts/native_source_new_run_state.gd:175~185,549~566` | read_current_g/passives/inventory와 P live 동기화 있음. `tests/test_native_main_source_starter_state.gd`가 상태 계약을 검증하는 기존 테스트. 물약 전역 owner는 없음 |
| 처치 addPotion | `scripts/native_source_new_run_state.gd:476~486`; `scripts/native_normal_enemy_hurte.gd:661~678` | `tests/test_p2001c_kill_rewards.gd:153~161` hp mats+1/st 거부 단정, :255~268 실제 처치/RNG 꼬리 단정. mp 별도 단위 단정은 해당 구간에 없음(제품은 hp 외 거부). 원본 `count\|\|1` 전체형변환과 달리 native는 int count≥1 지원 |
| HP/ST/MP authority | `scripts/native_source_resource_authority.gd:169~180,356~383` | 레벨업20% 회복은 있으나 물약용 hp-only commit API 없음. 기존 hp sink는 holy_flat_hp/hp_natural phase만 허용. 자동 물약에 억지로 재사용할 수 없음. `tests/test_native_source_player_regeneration_phase.gd`, `test_native_resource_regeneration_binding.gd`는 자연회복 계약 |
| 장비·어픽스 | `port_modules/equipment_affix_reader/producer.gd:349~374`, `scripts/native_source_player_providers.gd:100~112` | 현재 INV reader/affix provider 연결 존재. JS ToNumber helper 존재. potionPower 값을 현재 인벤토리에서 읽을 수 있는 공급 기반; 물약 consumer 연결은 없음 |
| 물약 관련 아이템 데이터/생성 | `data/item_generation_tables.json::AFFIX_POOL[72]/[244]/LEGENDARY_SPECIAL.belt`; `port_modules/kill_reward/drop_item_source.gd:301,307` | potionPower·potionCdRed tier/slot/weight 및 벨트 전설 데이터가 존재. 장갑/벨트 potCd 원본 배열·난수폭·소수3자리도 이식됨. `test_p2001c_kill_rewards.gd`는 공통 mkItem/RNG 경로 테스트이며 이 두 potCd 전용 입력별 단정을 새로 실행한 증거는 아님. 데이터 존재와 버프 소비/hp 회복은 별개 |
| JS 정수화 | `port_modules/combat_stat_formula/producer.gd:227~243` | `js_to_int32`는 NaN/Infinity→0, trunc/mod2^32/signed32. 기존 helper를 read-only 재사용 가능. 이번에 Godot 경계 재실행 안 함 |
| 패시브 | `port_modules/player_passives_source/producer.gd`, providers:112 | current PASSIVES provider 존재. pRegen을 물약 CD에 소비하는 consumer는 없음. ‘pRegen provider 존재’와 ‘자동 물약 작동’을 구분 |
| 전설 reader/효과 | `scripts/native_source_player_initialization_services.gd:915~927`; `scripts/main.gd:2558~2616`; `scripts/native_normal_enemy_hurte.gd:251~254` | l_eq reader 기반 존재. **timer/피해 소비 미이식**: lBeltT>0이면 현재 hurte는 legendary_belt_boots_spear로 halt. 자동 사용만 연결하고 이 timer를 켜면 기존 전투 중단 가능 |
| update clock | `port_modules/source_update_clock_prefix/producer.gd`; `scripts/native_source_player_initialization_services.gd:301~355` | 현재 prefix는 stage/playTime 단계까지. `tests/test_native_source_update_clock_play_time.gd`, `test_p2001j_lesson_clock.gd`는 해당 앞부분 계약. 물약35885~35910의 후반 update 단계 등록은 없음 |
| 자연회복 wiring | `scripts/main.gd:761~784`; `scripts/player.gd:731~739` | `tests/test_p2005d_regen_wiring.gd:69~78` 실제 binding/clock 단정 존재. 이는32705~32721 회복이며 물약35894와 다른 순서/수명 |
| 스킬 슬롯/UI | `scripts/native_source_new_run_state.gd:443~445,457~474`; `scripts/hud.gd:748~782,803~870` | `tests/test_p2005a_start_skills.gd`, `test_p2002a_hud.gd`는 스킬 지급/표시, cooldown provider는 스킬 전용. 구 물약 슬롯을 추가할 근거 없음 |
| 옵션 | `port_modules/npc_interaction/source_options_state.gd:8~16` | autoPotThr=.99의 state만 존재. 해당값을 물약 발동에 쓰는 consumer 없음. TRACE-SETTINGS 소유 경계 |
| bootstrap 외부 항목 | `port_modules/native_new_run_bootstrap_source/producer.gd:83` | qslots_potion_upgrades는 KIND_EXTERNAL. 명세 레코드 존재가 실제 상태 생성/연결 완료 증거는 아님. 주석 과거 행64388과 현행 fresh63949도 구분 |
| 아직 없음 | POT 정의 모듈/potHeal/POT_LV runtime owner/autoPotCd/auto phase/시스템회복 callback/물약 절차음/대장간 물약 탭 | `godot/**/*.gd` literal 전수검색에서 해당 물약 구현 미발견. `potion_recovery_source/producer.gd`·`test_p4001a_potion_recovery_source.gd`는 조사 시 경로 없음. 실제 플레이 동등성은 **미확인** |

## 4. 작은 이식 단위 순서안 — 다음 구현 지시서

공통: 다음 착수 때 새 fetch·보드·tracked INDEX/WORK를 확인하고 이미 구현된 단위는 중복 작성하지 않는다. 새 경로만 자기 소유로 등록한다. 테스트의 격리명은 아래 제안명을 사용하고, 실제 실행 시 effective ProjectSettings 2값(`use_custom_user_dir=true`, `custom_user_dir_name`)과 user path를 단정한다. 제품 `project.godot`의 사용자 폴더는 바꾸지 않는다. 기존 실세이브·settings를 읽거나 쓰지 않는다. 로그는 `~/exoduser-wt/_out/trace-quickslot/QS-xx/`에 보관한다.

### 4.1 **1번 QS-01: POT 정의·회복량·자동 CD 순수 계산 모듈** — 즉시 착수 가능한 최소 단위

목표는 현재 원본 계산식을 재사용 가능한 독립 모듈로 이식하는 것이다. 이 단위는 Main 연결·HP/mats 쓰기·부팅·자동 사용을 하지 않는다.

| 항목 | 구체 지시 |
|---|---|
| 만들 파일 | `godot/port_modules/potion_recovery_source/producer.gd`, `godot/tests/test_p4001a_potion_recovery_source.gd`. 후속 코드 커밋에는 본 추적 문서의 구현 상태/검수 갱신도 포함. Godot가 이 두 파일용 `.uid`를 만들면 자기 신규 산출물로만 별도 확인 |
| 수정할 제품 파일 | **없음**, 공용6파일 변경0줄. 기존 affix/formula helper도 수정0. global class_name·autoload·project.godot·씬 연결0 |
| API/리턴 | `extends RefCounted`. `hp_definition()->Dictionary`: D01 전체 필드를 매번 독립 복사. `pot_heal(level:Variant)->Dictionary`, `enhanced_heal(level:Variant,potion_power:Variant)->Dictionary`, `auto_cooldown(gloves_raw:Variant,gloves_present:bool,belt_raw:Variant,belt_present:bool,p_regen_raw:Variant,p_regen_present:bool)->Dictionary`. 계산 성공은 `{status:'READY',value:...}`, 지원 밖은 `{status:'NOT_READY',reason:...,raw:...}`로 value 없음. 실패를 회복100/CD420/0으로 대체하지 않음 |
| 지원 범위 | level/potion_power는 JS Number 대응 native int(±2^53−1 이내)/float만. float NaN/Infinity도 source 산술/ToInt32 의미로 처리. level11→1100, 음수level→100 등 함수에 없는 clamp를 추가하지 않음. String/null level·power 및 object/getter/prototype은 **미확인/NOT_READY**(보호된 복원 형식의 coercion 완성이라고 주장 금지). 장비 raw와 pRegen은 absent 및 JSON scalar(null/bool/number/String)만 exact helper 사용; Array/Dictionary/Object/StringName/huge native int는 지원 밖으로 구분 |
| helper 재사용 | `equipment_affix_reader/producer.gd::js_to_number(v,present)`를 인벤토리 미바인딩 인스턴스로 read-only 사용; `combat_stat_formula/producer.gd::js_to_int32`를 재사용. Math.min은 NaN을 보존하는 작은 로컬 helper로 처리(minf의 NaN 취급에 의존하지 않음). get_tree/Node/INV 캐시/파일IO/RNG 없음 |
| 원본 근거/연산 | POT27677~27679, potHeal28071~28072, enhanced35894/35903, autoCD35898~35902. 장비는 unary+ **이후** NaN/±0을 falsy0으로 소비하고 상한 .2만 적용. pRegen은 ToNumber×.03→min(.3), `\|\|0` 추가0. 420 항의 빼기 순서를 `(((1-g)-b)-r)`로 보존한 뒤 ~~→max6. `potionCdRed`, 300f, autoPotThr를 넣지 않음 |
| 수명/반복 조회 | 이 모듈은 입력값 계산만 한다. 후속 dispatcher에서 threshold와 실제회복의 두 시점에 각각 호출할 수 있게 결과 캐시 없음. `POT_LV`라는 실제 owner나 복원/저장 필드는 여기서 만들지 않음 |
| 새 테스트 실행 형태 | `test_p4001a_potion_recovery_source.gd`는 SceneTree 순수 검사로 해당 모듈을 preload하고 결과 JSON/실패 exit1·성공exit0. 격리명 `EXODUSER-P4001A-Quickslot-Isolated-20261020`. headless 테스트 대상은 이 파일 하나이며 Main scene 부팅0. 실행 전 effective 격리가 맞지 않으면 실패(exit1)하고 제품 테스트를 건너뛰어 PASS하지 않음 |
| 핵심 단정 A | definition 필드7개 정확값(name/emoji/col/colG/base/per/desc, 키 집합도 단정), 두 반환 Dictionary 분리; 원본 POT에는 hp만. potHeal 0~10 = `[100,150,200,300,400,500,600,700,800,900,1000]`; −1=100, 11=1100. 100×1.12 ~~→112, 150×1.12 ~~→168. NaN enhanced→0(ToInt32), 무지원 level String은 NOT_READY/value없음 |
| 핵심 단정 B | autoCD 장비absent/pRegen0→420; .8/.9/99→126(상한 .2/.2/.3); String '0.10'/'0.20'/pRegen5→**230**; 'junk'/'junk'/0→420; −.1/0/0→462(하한 없음); −6000000/0/0→6(ToInt32 signed wrap 후 max); pRegen NaN→6. null/false/absent 장비도0으로 소비. pRegen absent는 NaN→6이며 임의기본0을 넣지 않음 |
| 핵심 단정 C | 결과가 threshold 설정·qsAuto·수동 potionCdRed에 의존하지 않음(API 입력에 이 항을 만들지 않음). unsupported raw는 호출자 원참조 보존·수정0. helper/공용파일 diff0, source 파일 바이트 동일. 실제회복/최대HP clamp/쿨다운 ticking 테스트는 QS-02 범위 |
| 검증 근거 | 위 A/B 정수 기대값은 §6의 원본 발췌 Node oracle과 대조한다. 특히 230/126을 소수 산술로 ‘반올림 보정’하지 않음. 원본과 다른 GDScript literal rounding이면 실패를 남기고 exact IEEE 입력/중간값부터 진단하며 제품 식을 조정하지 않음 |
| 선행/충돌 | 새 두 경로가 아직 없음을 확인했음. 기존 helper 사용 가능. 공용 코드·다른 추적 문서·다른 담당 테스트 수정이 없어 현재 보드와 제품 소유권 충돌 없음. 이 단위 종료는 **순수 수식 부분 이식**이며 자동 물약/전체 퀵슬롯 완성 아님 |

### 4.2 2번 QS-02: 자동 사용의 순서·시간 전이 (독립 dispatcher, fixture)

| 항목 | 구체 지시 |
|---|---|
| 파일 | 신규 `godot/port_modules/potion_recovery_source/auto_phase.gd`, `godot/tests/test_p4001b_auto_potion_phase.gd`. QS-01 모듈은 read-only. 공용파일0줄; 해당 단위 구현 상태/검수만 본 추적 문서에 갱신 |
| API | `advance(sp:float,services:Dictionary)->Dictionary` 한 번 호출당 원본35893~35910 한 번만 실행. services는 live P/G, pot level, affix, gl/blt/passives, lesson 관측과 각 write/effect callback을 받는다. 제품이 아닌 fixture owner의 실제 가변값으로 검증. input source tick 입장은 caller 책임으로 명시 |
| 원본/순서 | 35893 양수CD 감쇠(음수 허용)→35894 회복 임계 reader→35895 short-circuit gate→35896 before→35897 mats write→35899~35902 live 장비/패시브와CD write→35903 회복량 **재조회**→35904 HP write→35905 tutorial→35906 SFX→35908 legendary→35909 text→35910 통계. 순서를 한 번에 plan 스냅샷/일괄 commit으로 바꾸지 않음 |
| 테스트 | `test_p4001b_auto_potion_phase.gd`, 격리 `EXODUSER-P4001B-AutoPotion-Isolated-20261020`. mhp350/hp251/level0→무사용; hp250/mats1/cd0→hp350/mats0/cd420; lesson=true/hp0/mats0/양수CD는 각각 무사용. cd.5/sp1→−.5가 된 후 같은 tick 발동 가능; 큰sp도1회. 미발동일 때 장비 reader0·임계 reader1; 발동이면 level/affix2회. 첫회100/둘째150을 주어 threshold100·실회복150 순서 입증. tutorial before/after·effect 순서 로그 단정. timer 양수만감쇠·0하한추가0 |
| 실패/선행 | QS-01 필요. callback가 원순서 중 실패하면 수행 prefix를 보고하고 자동 retry/rollback/refund를 만들지 않음. 필수 provider/effect 미제공을 ‘전체 READY’로 삼지 않음. global G.on/paused/update 경로는 아직 fixture 전제이고 자연 호출은 **미확인**. 다른 담당 소유 파일 충돌 없음 |

### 4.3 3번 QS-03: 실제 런타임 물약 상태·HP commit (자동 호출은 아직 연결하지 않음)

| 항목 | 구체 지시 |
|---|---|
| 파일 | 신규 `godot/scripts/native_potion_recovery.gd`, `godot/tests/test_p4001c_potion_owners.gd`. 수정 후보 `native_source_new_run_state.gd`의 vars:55~65/initialize:111~/read:175~185 근처 **약20~35줄**, `native_source_resource_authority.gd`의 :169~180 옆 hp-only 전용 API **약16~24줄**. 기존 Q/E/자연회복 메서드 변경0 |
| 소유·원본 | 27683~27684/28071 및 fresh63949~63952의 runtime 신규값 autoPotCd0·hp level0를 정확히 별도 소유. State가 G.mats·조건부통계·P 전설timer/레벨을 소유, authority가 actual Player.hp만 변경. NativePotionRecovery는 callback 연결과 QS-02 phase를 소유. QSLOTS 저장/복원/스키마는 **보호**·추가하지 않음 |
| 검증 | `test_p4001c_potion_owners.gd`, 격리 `EXODUSER-P4001C-PotionOwners-Isolated-20261020`. 신규 구성초기 cd0/lv0, mats1→0, hp250→350/mhp350, ST/MP/Q/E 상태/qs 저장정보불변. P dict 재조회와 actual hp 동일; 다른Main/분리된Player/해제owner/중복binding 거부. mats 실패 뒤 HP write없음; fixture가 아닌 실제 authority 통과 확인 |
| 선행/충돌 | QS-02 후. State/authority 소유 조정·보드 exactscope 필요. 기존 hp 자연회복 sink의 허용 phase에 potion 문자열을 끼워 넣지 않고 별도 hp-only commit 경로를 작성. 임의 Player.hp 직접쓰기0. 런타임 level 저장/복원은 제안하지 않음. main/player 추가 연결0. 기존 count≥1 addPotion 경로는 그대로 |

### 4.4 4번 QS-04: 전설 벨트 timer/피해 소비 (자동 timer 생성 전 선행)

| 항목 | 구체 지시 |
|---|---|
| 파일/공용 위치 | 신규 `godot/port_modules/potion_recovery_source/belt_buff.gd`, `godot/tests/test_p4001d_potion_belt_buff.gd`. `native_normal_enemy_hurte.gd:251~254`의 합쳐진 미이식 guard에서 벨트만 원본42226 순서로 처리하도록 **약8~14줄** 분리. 부츠/창의 기존 halt는 보존. `native_source_new_run_state.gd` 앞선 State API 옆 timer writer/감쇠 약8~12줄. main/player/입력0 |
| 원본/수치 | 35908 timer300·live l_eq>0;32730 양수만−sp;42226 `~~(dmg*(1+live_lEq))`. 신규생성 같은 update의 앞32730에서 먼저감쇠하면 안 됨. l_eq 두 번 조회의 조건/산술 순서 보존 |
| 검증 | `test_p4001d_potion_belt_buff.gd`, 격리 `EXODUSER-P4001D-PotionBelt-Isolated-20261020`. dmg100·buff.15·timer300→114(JS Number/~~, 기대를115로 수정 금지); timer0→100; 생성직후300/다음sp1→299; provider failure에 임의1배 fallback0; boots/spear 활성은 기존 halt 유지. 회귀 `test_p1002e_melee_hurte.gd`와 f/g 중 실제 변경 분기 소비 테스트를 해당 기존 격리명으로 실행 |
| 선행/충돌 | QS-03과 실제 l_eq reader 필요. 공용 피해집행자 P2/레슨/전투 다른담당 배선이 바뀌기 쉬워 최신diff/소유 조정 필요. 현재 벨트 활성은 halt하므로 이 단위를 누락한 채 자동 사용에 `_lBeltT=300`을 쓰지 않음. Q/E·피해 다른항 변경은 보호 |

### 4.5 5번 QS-05: 자연 update 후반 호출·연습 차단·관측

| 항목 | 구체 지시 |
|---|---|
| 파일 | 신규 `godot/scripts/native_potion_update_phase.gd`, `godot/tests/test_p4001e_potion_runtime.gd`. Main의 source owner 선언부/`_ready` State·provider 준비 뒤 :250~265에 configure **약1필드+6~10줄** 후보. 실제 후반 tick 연결 위치는 아래 미확인 조건 때문에 확정 전 쓰기 금지 |
| 원본 계약 | 32108~32132 early gates,32730 timer 선행,35885~35910 slotCD/autoCD와 회복,35912 이후 skill CD 순서. `_dtSp`/`sp` 도메인 사용. `player.gd:731~736` 자연회복 옆이나 `main.gd:935` `_process` 끝에 편의상 붙이면 원본35893 위치를 증명하지 못함 |
| 현재 막힌 지점 | 실제 clock dispatcher `native_source_player_initialization_services.gd:352~355`는 stage/playTime 뒤 end_update로 닫음. World :2976~3001은 적 전용 단계. 35893까지 연결된 공용 late-update checkpoint는 **미확인**. 후반 단계 소유/호출 순서가 확정되기 전 이 단위의 자연 연결은 **HOLD**. 빈 gap 영수증을 ‘물약 수행’으로 사용하지 않음 |
| 최소줄/수정 후보 | 후반 checkpoint를 맡은 담당과 정확위치 확정 시 해당 callsite에 `phase.advance(sp,frame)` **호출2~4줄**만. World가 그 위치를 소유할지 Player일지는 **미확인**이라 현재 두 파일 수정0줄 제안. Main configure와 callsite 상세는 그 후 본 표 갱신. player Q/E/input 함수는 보호 |
| 검증 | `test_p4001e_potion_runtime.gd`, 격리 `EXODUSER-P4001E-PotionRuntime-Isolated-20261020`. 자연 source frame으로 hp350/250·mats1에서1회회복/1개차감/cd420, paused/G.off/레슨에서 비용0/자연timer정지, 중복frame0·두Main 독립·캐릭터재시작cd0 확인. 실제 provider/authority/late slot receipts와 호출순서 로그 제출. actor 강제쓰기 fixture 결과와 자연 피격→회복 화면 증거를 분리 |
| 선행/충돌 | QS-04, 레슨 flow 관측권한, 후반clock owner, system lesson recovered consumer·SFX owner가 필요. 이 둘은 현재 미이식이므로 미연결 상태는 ‘core만’ 표기. P2-001l/P3-002의 main/player/world 소유와 충돌 조정 전 진행 금지 |

### 4.6 6번 QS-06: 대장간 단건 강화 (순수 규칙→허용된 메뉴 연결)

| 항목 | 구체 지시 |
|---|---|
| 파일 | 신규 `godot/port_modules/potion_recovery_source/upgrade.gd`, `godot/scripts/native_potion_upgrade_panel.gd`, `godot/tests/test_p4001f_potion_upgrade.gd`. State의 QS-03 level/mats API 옆 commit **약12~20줄**. Main 메뉴 host 연결 위치 **미확인**(현재 native forge owner 없음), 그 전 UI standalone까지만 |
| 원본 | 28080~28085,50690~50707. reqLv=(lv+1)*100, 단건UI maxed>=10, 비용3/5/8/10/13/15/18/20/23/25, 회복표100/150/200…1000. 프리뷰는 별도 숫자계산으로 원복 결과를 보존. 저장/세이브 호출은 **보호**, 제안하지 않음 |
| 검증 | `test_p4001f_potion_upgrade.gd`, 격리 `EXODUSER-P4001F-PotionUpgrade-Isolated-20261020`. lv0·player99 선택불가,100·mats3→lv1/mats0/heal150, mats2→무소비, lv9·player1000/mats25→lv10/heal1000, lv10 단건 선택불가. 프리뷰 전후 level변경0. §2 M06의 Shift/Ctrl stale callback 문제는 원본행/관측을 남기며 임의수정·일괄버튼 도입0 |
| 선행/충돌 | QS-01/QS-03, 메뉴 host의 인벤/대장간 담당 scope 필요. TRACE-INVENTORY와 공용forge ownership 조정 전 제품 메뉴 연결HOLD. 기본비용5를 실제지출5로 오인하지 않음. 세이브 형식/복원 연결은 범위 밖 |

### 4.7 7번 QS-07: UI·사운드·회복 안내 인수

| 항목 | 구체 지시 |
|---|---|
| 파일 | 신규 `godot/scripts/native_potion_feedback.gd`, `godot/tests/test_p4001g_potion_feedback.gd`. Main 생성부/효과callbacks 연결 **약4~8줄** 후보. 기존 `hud.gd` 변경0 기본: HP/mats 일반 refresh가 이미 읽음. 새 potion count/토글 UI를 만들지 않음 |
| 원본/수치 | 12756~12761 FM/noise 0/55/110/170ms,35905 recovery before/after,35908/35909 두 text payload,35910 통계. Auto에는 manual28237 particles8/28241 flash가 없으므로 추가하지 않음. HP text60308도 autoPotCd로 바꾸지 않음 |
| 검증 | `test_p4001g_potion_feedback.gd`, 격리 `EXODUSER-P4001G-PotionFeedback-Isolated-20261020`. event순서 tutorial→potionSound→legendaryText(조건부)→healText→stats, healText life40/#33ff33/y−25, legendary life35/#ff8844/y−45, 중복효과0. 원본/Godot 같은HP·회복단·해상도 실창1x·오디오를 별도대조. SFX 절차음이 미이식이면 sound PASS를 선언하지 않음 |
| 선행/충돌 | QS-05 자연연결과 원본 음향 생성기·system tutorial owner 인수 필요. 존재하지 않는 tutorial을 가짜 성공 callback으로 채우지 않음. P2-007a HUD/폰트·P2-004b 펫대사 소유와 충돌 조정. 시각/사운드 인수 전 전체 포팅 완료 선언0 |

## 5. 공용6파일 접점 목록 (이번 변경 0줄)

| 공용 파일 | 확인 위치/연결 필요성 | 후속 최소 범위·조건 |
|---|---|---|
| `godot/scripts/main.gd` | 선언:83 주변, 부팅:250~265, 리젠 구성:761~784, clock :917~938 | QS-03~05 configure1필드+6~10줄 후보, QS-07 효과4~8줄. `_process` 말미를 물약 tick으로 즉석사용 금지. 레슨/초기화 소유자 조정 필요 |
| `godot/scripts/hud.gd` | HP :241~256, mats :831~833, 스킬 :846~870 | 자동용 변경 **0줄** 우선. legacy qsCooldown 문구·스킬 sweep와 auto timer 혼합 금지. 세부화면 부족은 QS-07에서 증거로 판정 |
| `godot/scripts/world.gd` | source frame :987~, native owner :2976~3001, regen bind:2736~2741 | 후반 물약 checkpoint 소유 여부 **미확인**. 확정 시2~4줄 호출만 후보, 현재 삽입0. P3-002 동적등록과 충돌 가능 |
| `godot/scripts/player.gd` | actual hp :51~52, natural regen :731~739, 입력 :377~455 | HP 쓰기는 authority 경유. 기존 소스regen/Q/E/입력/숫자키 수정 **0줄**. 후반checkpoint를 Player가 맡을 근거는 **미확인**; 편의상 regen에 추가하지 않음 |
| `godot/scripts/native_normal_enemy_hurte.gd` | :251~254 벨트/부츠/창 halt; :661~678 addPotion | QS-04 벨트 분리8~14줄 후보. 처치 addPotion/RNG/보상은 수정0. 실제diff·총괄 소유조정 후만 구현 |
| `godot/scripts/native_source_new_run_state.gd` | var :55~, 초기화 :111~, 현재reader:175~, 비용:447~, 보상:476~, P동기화:549~ | QS-03 runtime물약 상태/전용 write20~35줄, QS-04 timer8~12줄, QS-06 강화12~20줄 후보(각 다른 단위이므로 합계 확정값 아님). QSLOTS 저장형식/복원은 **보호**. literal G/P 필드 수 테스트를 임의정정하지 않음 |

이 밖에 `native_source_resource_authority.gd`의 신규 HP-only commit은 필수 접점이다. 현재 자연회복/Q/E commit의 권한을 넓히는 수정은 제안하지 않는다. clock services 파일은 공용6파일 목록 밖이어도 다른 담당의 실제 소유/계약을 먼저 확인한다.

## 6. 수행한 검증과 아직 하지 않은 검증

| 검증 | 결과/한계 |
|---|---|
| Git/소유 | fetch 후 보드/계획을 확인하고 기준SHA 고정. R tracked INDEX/WORK 분리 조회, 자기WT의 최초 tracked diff없음 확인. 다른WT는 조사/수정하지 않음 |
| 원본 조사 | 핵심 패턴 `QSLOTS\|POT_LV\|autoPotCd\|qsCooldown\|qsAuto\|useQuickslot\|potHeal\|autoPotThr\|\bPOT\b`는 game71 matching-line/index0. §7은 보조 식별자까지 확장한 전체 행 목록 |
| Godot 조사 | tracked godot 파일목록 및 ignore 제외 없는 gd/godot literal 검색, 관련 owner/provider·기존 테스트 본문 및 item_generation_tables.json의 물약 어픽스/전설 데이터를 확인. 신규 QS-01 제안2경로는 부재 |
| 원본 Node oracle | 실제 game.html의28072/35894/35895/35898~35902/28080~28085를 메모리로 발췌해 실행. 회복0~10표 일치, 강화실비3…25, CD420/126/230/420/462/6/6, gate 손실99 false·100 true·lesson/dead/mats0/CD양수 false 확인. 새 테스트 파일 작성0 |
| oracle 준비오류 | 처음 potHeal 발췌 한줄 끝 `//` 주석에 harness return이 가려져 undefined(JSON null)가 출력됨. 줄바꿈으로 발췌 연결을 고쳐 위 표를 재확인. 원본 함수 실패·제품 수정이 아님. 앞선 출력을 PASS 근거로 쓰지 않음 |
| 미수행 | Godot 신규/기존 suite 실행, import/build/서버/자동재시작, 브라우저 원게임 플레이, 실세이브/API, PC 실행, 화면/사운드 인수. 전부 **미확인** |
| 문서 범위 검수 | 행 근거/보호/상수/공식/owner 충돌·단위1 테스트 기대값 정적으로 확인. 새문서1개만 명시경로 stage/commit/push 후 원격 자기branch SHA를 대조. DONE은 실제 제출 SHA 확인 후 Git밖 지정경로에 작성 |

## 7. 핵심 식별자 전체 행 색인

아래는 기준 파일의 exact-word 검색 결과다. 행 번호만 있는 항목도 주석·초기화·리셋·후행override까지 생략하지 않았다. `index.html`의 핵심식별자 일치행0과 라우팅4348은 별도 확인했다. minified 한 행에 여러회 등장해도 같은 행은 한 번이다.

| 식별자 | game.html의 모든 일치 행 | index.html |
|---|---|---|
| `POT` | 3718, 3769, 27677, 28207, 28259, 28339, 32951, 32976, 41464, 43095, 52563, 60308 | 없음 |
| `QSLOTS` | 3554, 3718, 27680, 28204, 28261, 28263, 60308, 61944, 62004, 62119, 62141, 62357, 62469, 63914, 63949, 64071, 64098 | 없음 |
| `POT_LV` | 3561, 3769, 28071, 28072, 50695, 50699, 50705, 61947, 62007, 62122, 62147, 62360, 62472, 63918, 63952, 64075, 64101 | 없음 |
| `potHeal` | 28072, 28232, 35894, 35903, 50699 | 없음 |
| `useQuickslot` | 28202 | 없음 |
| `addPotion` | 28250, 32841, 32876, 32907, 32951, 32976, 41464, 43095, 43097 | 없음 |
| `qsCooldown` | 27683, 28205, 28229, 28341, 28349, 35887, 60308, 61945, 62120, 62358, 62470, 63950, 64099 | 없음 |
| `autoPotCd` | 27684, 35893, 35895, 35902, 35905, 61945, 62120, 62358, 62470, 63950, 64099 | 없음 |
| `qsAuto` | 27685, 28342, 28345, 28347 | 없음 |
| `_qsSwapSel` | 27686, 28333, 28342 | 없음 |
| `_qsRefreshPending` | 28244, 28246, 28247, 28248 | 없음 |
| `_requestQSRefresh` | 28245, 28261, 28263 | 없음 |
| `updateQS` | 12913, 13802, 28242, 28248, 28267, 28587, 28607, 35887, 35890, 44983, 44996, 46819, 47154, 47229, 47322, 47792, 47816, 47881, 47953, 48296, 48402, 48441, 62060, 62199, 62343, 62412, 62515, 63528, 64023, 64144, 65668 | 없음 |
| `autoPotThr` | 6311, 49039, 49338 | 없음 |
| `optAutoPot` | 2818, 49039, 49338 | 없음 |
| `optAutoPotVal` | 2818, 49039, 49338 | 없음 |
| `hpPotCd` | 2630, 60244, 60309 | 없음 |
| `potionPower` | 14468, 14869, 14964, 28232, 35894, 35903, 51391 | 없음 |
| `potionCdRed` | 14680, 14912, 14994, 28228 | 없음 |
| `_lBeltT` | 28223, 32730, 35908, 42226 | 없음 |
| `_lBeltBuff` | 15056, 28222, 28223, 35907, 35908, 42226 | 없음 |
