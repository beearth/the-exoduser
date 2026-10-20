# 인벤토리·장비 원본 추적과 Godot 이식 순서안 — 2026-10-20

## 0. 기준·범위·증거 수준

| 항목 | 고정 기준 |
|---|---|
| 작업 | `trace-inventory` / `codex/trace-inventory-20261020` |
| 소스 | fetch 후 `origin/main` **`788ba758f9f5c92564abacb2f2fce88a42af2c1a`**. 아래 모든 행 번호는 이 commit 기준이다. 동시 진행되는 후속 main을 소급하지 않는다. |
| 전용 worktree | `/Users/fordeargamers/exoduser-wt/trace-inventory` |
| 유일한 Git 산출물 | 이 추적 문서 1개. 코드·테스트·기존 설계 docs·계획·작업판 수정 없음. Godot import/실행·웹 실행·게임 입력·세이브 접근 없음. |
| 추적 대상 | INV 구조·아이템 필드·격자·정렬·필터·선택·비교·분해·장착/해제·직접 연결된 유물/유골/보관함/획득/저장 경계. 전투 효과 전체의 재설계나 새 아이템 제작은 범위 밖이다. |
| 원본 표기 | `G:행` = `game.html`, `I:행` = `index.html`. 그 외는 저장소 상대 경로를 적는다. 함수의 내부 분기는 행 범위로 묶되 서로 다른 호출 경로는 합치지 않는다. |
| 보호 | **`docs/2_3`, Q/E·돌진/패링 소비 설계, 세이브 형식·마이그레이션은 보호**. 관련 필드·호출 사실만 기록하며 변경을 제안하지 않는다. |
| 정적 근거 | 파일·함수·테스트 정의를 읽은 근거이다. 테스트 존재를 PASS, 안내 문구를 UI 구현, 초기화 API를 런타임 장착 API, QA JSON을 플레이어 세이브로 간주하지 않는다. 실행 인수는 **미확인**이다. |
| 보존·제출 | R의 브랜치/HEAD `codex/mac-live-play-time-main-20261017` / `dd49171c5b88e211575a41f185395d6c0a14b184`, 시작 시 tracked INDEX/WORK 변경 없음. 별도 worktree 추가 외 R 변경 금지. 원문 hash·검색 근거·최종 SHA는 `~/exoduser-wt/_out/trace-inventory/`에 보존한다. |

### 작업판·P4와 중복 방지

| 확인한 문서·행 | 현재 배정·조건 | 이번 추적의 경계 |
|---|---|---|
| `docs/engine/orders/WORK_BOARD.md:25` | P2-006a 드랍 바닥 표시·줍기·인벤 반입은 PC WIP 중단·인계 대기 | 그 WIP나 다른 worktree는 열거나 수정하지 않았다. 아래 획득 단위는 해당 담당 인수 후에만 연결한다. |
| 같은 문서 `:24`, `:35` | 레슨 입력·펫 대사는 타 담당 진행 중 | 인벤 단축키 설계가 Q/E·레슨 입력이나 펫 담당 변경을 요구하지 않도록 접점만 기록한다. |
| 같은 문서 `:38` | FEATURE-INVENTORY 전체 기능 분모는 PC 담당 | 이 문서는 한 시스템의 원본 추적이다. 전체 기능 목록·진행률·ETA를 만들지 않는다. |
| `docs/engine/FDG_GAME_DEVELOPMENT_PLAN.md:35`, `:83` | P4 게임 흐름·진행, P4-001은 데이터/UI/저장 exactscope 미배정·개별 HOLD 유지 | 아래 단위는 **설계 순서안**이며 구현 승인·작업 배정·HOLD 해제가 아니다. |
| 같은 문서 `:61` | P2-001c 아이템 생성·드랍 레코드는 격리 검수 보고, 바닥 표시·줍기·인벤 반입·세이브는 미이식 명시 | 이미 있는 생성자와 없는 플레이어 획득 경로를 분리한다. |

## 1. 원본 데이터 구조·상수·필드

### 1.1 INV·분류·배치 권위

| ID | 구조·상수 | 실제 계약 | 원본 근거 |
|---|---|---|---|
| D01 | `INV` | `{bag:[], equipped:{17슬롯:null}, selected:null, ossCollect:{}}`. bag index·동일 item 객체·장착 slot을 함께 사용한다. | G:16174–16179 |
| D02 | `SLOT_NAMES` 순서 | `weapon, shield, boots, armor, helmet, bow, gloves, pants, belt, necklace, ring1, ring2, cape, bracelet, headband, ossuary, headband2` **17개**. headband/headband2는 귀걸이 1/2다. | G:15176, 15835–15838 |
| D03 | `DROP_SLOT_POOL`·`defaultItems` | 드랍 후보는 ossuary만 제외한 16슬롯. 기본 장비는 belt·ossuary 제외 **15개**, tier0/일반/물리, sword·crossbow 지정. | G:15177–15178, 16169–16171 |
| D04 | `BAG_MAX`·`INV_COLS`·`_invRows()` | **BAG_MAX 초기값300 / 10열**, rows=`max(10,ceil(BAG_MAX*4/INV_COLS))`, 초기120행. 일반 pickup/unequip은 bag.length 직접검사 없이 같은 분류 격자공간을 검사하고, 보관함/도감 출금은 전체 bag.length≥BAG_MAX를 별도로 거절한다. 독립 격자이므로 총 bag hard cap300으로 일반화할 수 없다. UI의 정적24는 초기표시다. | G:15834,16180–16181,16370–16374,16413–16418,48606,45861,2979,50247 |
| D05 | `ITEM_SIZE/WTYPE_SIZE/BTYPE_SIZE`·`_itemSz` | 장비·근접7종·석궁3종 모두 2×2, bonePart 1×1. 조회는 무기/석궁 타입→slot→미지원 `[1,1]` 순서다. | G:15829–15833, 16183–16187 |
| D06 | `_invCategoryKey`·격자 | ossuary/bonePart는 `ossuary`, 나머지는 `equipment`. item이 전달된 점유 검사에서는 같은 카테고리만 충돌하므로 두 분류가 좌표를 따로 쓴다. | G:16188–16199 |
| D07 | `_invFindSpace/_invCanPlace` | y→x 좌상단 우선 검색, skip index 허용, 공간 없으면 null. 이동 검사는 음수·경계·같은 카테고리 충돌을 거절한다. | G:16200–16210, 16247–16256 |
| D08 | `_invSortBag` | **fav 먼저→junk 뒤→rarity 내림→itemPower 내림→itemLv 내림→enh 내림→기존 순서**. 앞선 주석 순서보다 실제 comparator가 근거다. | G:16211–16228 |
| D09 | `_invAutoPlace` | 정렬→좌표 초기화→카테고리별 row packing→행 초과 시 같은 분류 빈자리 재검색. | G:16229–16246 |
| D10 | UI 선택 상태 | `selected`: null/가방 number/`eq:<slot>`/`st:<index>`; `_invSalSel:Set<number>`, `_invHover=-1`, `_invDrag`, `_invDragMoved`, `_GC_SZ=48`, 배치 snapshot. 런타임 UI 상태와 저장 INV 필드를 구분한다. | G:16178, 48562, 49520–49521, 49716–49727, 49957–49959, 50141–50149 |
| D11 | 화면 필터 | `invFilter={slot:null,rarity:null,el:null}`. 분류·slot·rarity·el 조건은 AND. null은 해제이며 물리 `el=0`·일반 `rarity=0`을 falsy로 버리지 않는다. | G:16260, 50129–50139, 50212–50233, 50278–50285 |
| D12 | 등급 | `RARITY` 키 5개와 달리 표시명/색/배율 배열은 일반~유니크 6개, 배율 `[1,1.2,1.5,1.8,2.2,2.5]`. 화면 등급 필터 버튼은 0~4만 만든다. 경제 등급은 별도 cap4다. | G:14346–14351, 50230, 28185–28186 |
| D13 | `EQ_POS`·명칭·아트 | 슬롯 index와 좌표가 결합. 현행 페이퍼돌 기준 **654×560·96px 소켓**, ossuary는 전용 패널로 제외하여 페이퍼돌은 16슬롯. | G:15835–15859, 50174–50208; `inventory-paperdoll.js:7–14` |
| D14 | 보관함 | `STORAGE[0]` 단일 공유 배열·`STORAGE_MAX=200`. 선택 index와 실제 bag index는 별도다. **저장 보호**. | G:16257–16260, 48537–48553 |
| D15 | 드랍 필터 | 화면 `invFilter`와 다른 `OPT.minPickRar/minPickLvTier`·tier threshold. 드랍 생성 필터와 가방 표시 필터를 같은 owner로 합치지 않는다. | G:32001–32032, 41433–41467(차단된 legacy); 현행 수동 획득 G:32932–32967 |

### 1.2 아이템 생성·가변 필드 목록

| ID | producer·필드 | 실제 계약·소비 경계 | 원본 근거 |
|---|---|---|---|
| F01 | `mkItem(slot,tier,el,rarity,wtype)` | headband2는 headband 템플릿 생성 후 slot만 치환. 일반 id=`Date.now()+Math.random()`, 공통 slot/el/rarity/tier/name/emoji. 미지원 slot의 `???` 최소 객체는 별도로 id=`~~(performance.now()*1000)+~~(Math.random()*9999)`다. | G:15894–15896,15951–15956 |
| F02 | `WTYPES/BOWTYPES`, `_weaponName` | 근접7종·석궁 `crossbow/repeater/arcane` 3종. 원소×tier 이름 수식어와 canonical 이름 조합. 무기·견갑의 생성 el은 물리 강제다. | G:15861–15891, 15953–15956 |
| F03 | 공격 롤·무기 필드 | `atk,wtype,spd,wStCost,wArcW,wRange,wStagger,bonusRange`. 공격 max=`~~((200+tier*200+(P.lv||1))*.25)`, 등급 floor `[0,.05,.15,.25,.40,.50]`, random²·최소1. bonusRange≤3. | G:15921–15924, 15958–15971 |
| F04 | 석궁 필드 | `btype,atk,bowSpd,bowStCost,bowRange,bowProjSpd,bonusRange,bowPierce`; bonusRange≤3. | G:15973–15986 |
| F05 | 방어·자원·돌진 필드 | `def,eDef,spd,bonusSt,charge,chargeDist,chargeW,stagger,range,bonusHp,bonusShield,bonusMp,shieldWt,bonusRange,bonusChargeDist,chargeAoE,chargeCharge` 등 공통 롤·부위별 분기. **Q/E·돌진 소비는 보호**. | G:15925–15950, 15987–16019 |
| F06 | 왕관 필드 | `beamDmg,elements:[{el,dmg}],splashR,splashMul,magicPen,bonusRange`; 추가 원소 수 0/0/1/2/3/3, splashR≤10, bonusRange≤5. | G:16021–16041 |
| F07 | 장갑·바지·벨트 | `potCd,atkSpd,bonusHp` 부위별 추가. potCd 5원소 배열에 rarity를 직접 index하는 원본 경계를 임의 보정하지 않는다. | G:16042–16055 |
| F08 | 스탯·팔찌 | `bStr,bDex,bInt,bLck,bGrit`, `brType:'demon'/'life'`. 고급 이상 악세는 LCK/근성+STR/DEX/INT 중1종, 방어구는 등급별0~3개, 팔찌 타입은 50% 분기. | G:16081–16110 |
| F09 | 어픽스 | `_AFSLOT`, `AFFIX_POOL`, `rollAffixes`; 최종 `{id,tier,value}` 배열. 최대 개수 `[0,2,3,5,6,7]`, 접두/접미 교대·group 중복·minGrade·부위·팔찌·데모 gate. 앞서 생성한 반지/목걸이 임시 `{id,val}`은 최종 roll에서 덮어쓴다. | G:14364, 14370–15015, 15131–15174, 16056–16080, 16114 |
| F10 | 임플리싯·특수 | `_implicitStat/_implicitVal/_implicitKo`, `legendarySpecial`, `uniqueSpecial`, `uniqueArt`, 동적 `item[special.stat]`. 임플리싯 난수 소수2자리, 전설≥4·유니크≥5 별도 풀. | G:15016, 15037, 15084, 16115–16142 |
| F11 | 아이템 레벨 | `itemLv=min(900,floor(playerLv/10)*10)`, `reqLv=max(0,itemLv-10)`. | G:16143–16147 |
| F12 | 소켓 | 신규 장비 `socketCount=0,crystals=[],socketQ=[]`. 이미 있는 세이브의 소켓은 별도 보호 복원 경로다. | G:16148–16151, 3735–3766 |
| F13 | 유골함 override | `unique=true,name='전대의 유골함',emoji='⚱️'`, rarity5/tier0/물리, `anc='iron_warlord'`, eDef60/bonusMp150/ancPow.25, ancHP .9, `_iAncPow`10, reqLv0·0홈. 일반 스탯 bStr/bDex/bInt/bLck/bGrit 삭제. | G:16152–16165 |
| F14 | 유골 부위 | `{id,slot:'bonePart',anc,part,el:0,rarity,tier,name,emoji,itemLv,reqLv:0,affixes:[]}`; tier0~4/rarity0~5 clamp. `ossCollect[anc_part]={r,t}`. | G:45788–45799 |
| F15 | 아이템 후속 필드 | `fav,junk,_gx,_gy,_pickT,enh,_enhRefund` 및 구자료 마이그레이션 표식은 생성 필드와 구분. fav/junk는 상호 배타 토글, 좌표는 분류별 격자, 강화 이전은 old의 환수값을 남긴다. | G:13250–13258, 16302–16365, 16407–16418, 3628–3683 |
| F16 | 유물·소켓석 가방 | `CRYSTAL_BAG`, `CRYSTAL_DUST`, `STONE_BAG`, 각 bag max9999. 유물 그룹은 id/star/enh/q까지 포함. 품질 q1~100, 동1/은41/금81. | G:15276–15288, 15304–15334, 15386–15396 |
| F17 | 소켓 효과 | `socketMul=1+(clamp(q,1,100)-1)/99×(동일 등급?2:1)`; `socketResonant`는 q>1도 요구. `crystalEffects`와 곱해 사용한다. | G:15289–15296, 15320–15330 |

## 2. 원본 함수·호출 순서·UI 전수 추적

### 2.1 획득·장착·제거·통계

| ID | 진입점·함수 | 순서·성공/거절·관련 owner | 원본 근거 |
|---|---|---|---|
| C01 | `_earringSlot/_equipSlot/_equipEarringTo` | 자동 대상은 headband 빈칸→headband2 빈칸→원래 slot. 명시 대상은 임시 target/try-finally 해제, 실패 시 원래 slot 복원. | G:16272–16286 |
| C02 | `_refreshEquipmentStats` | 현재 hp/mp/st/shield snapshot→장비 관련 3캐시 무효화→applyStats→새 최대치로 min clamp. 장착으로 현재 자원을 전부 채우는 동작이 아니다. | G:16287–16292 |
| C03 | `equipItem` 입장 | bonePart는 도감 등록 후 return→요구 레벨→실제 대상 slot 결정. 장착 UI disable 표시는 실제 함수의 레벨 gate를 대신하지 않는다. | G:16293–16301 |
| C04 | 강화 자동 이전 | old.enh>0이면 비용 검사, 부족 시 교체 차단. 충분하면 mats 차감→새 enh=old enh→old 환수 기록→old enh=0. | G:16302–16319; 비용 G:28080–28085, 28101–28104 |
| C05 | 유물 자동 전승 | old 유물 순서대로 새 빈 홈→CRYSTAL_BAG. 주머니 max9999면 해당 유물은 old에 유지하고 다음 유물 진행. | G:16320–16345 |
| C06 | 장착 commit | 새 좌표를 old에 전달(크기 다르면 null)→old bag push→equipped 대입·item.slot 치환→새 item identity로 bag에서 제거→old 빈자리→stats→장착음/안내/레슨→`dbSaveForce`(**저장 보호**). | G:16346–16366 |
| C07 | `unequipItem` | bag push→빈자리 검색→없으면 pop 후 거절→좌표→equipped=null→stats→안내/음→`dbSaveForce`(**보호**). | G:16367–16380 |
| C08 | `dropItem` | 이름과 달리 **단건 분해**. 전역 1초 gate, item/fav 거절, salvage finite·≥0 확인→mats 증가→splice→선택 index 보정→`dbSaveNow`(**보호**). | G:16381–16397 |
| C09 | 일반 `pickupItem` | 빈 장비 슬롯이어도 자동 장착하지 않는다. bag push→자리 없으면 pop/false→좌표·_pickT→닫힌 패널 자동정렬→음/안내/펫/레슨→`dbSaveForce`(**보호**). | G:16411–16424 |
| C10 | bonePart `pickupItem` | 유골함 지급→도감 상향 등록 성공이면 저장/true. 등록 실패면 bag·1×1 배치로 이동, 공간 실패 시 pop/false. | G:16398–16410 |
| C11 | `sortInvBag/_invAutoSortIfClosed` | 명시 정렬은 재배치·분해 선택/selected 해제. 자동 정렬은 인벤 on이면 하지 않는다. | G:16489–16497 |
| C12 | `salvageVal/_itemEconomyRarity` | `base[cap4]+enhRefund+(tier||0)*2`; base=`[1000,2000,10000,20000,50000]`. 유니크도 경제등급4. 환수는 레거시 누적식의50% 정수화이며 현행 강화 지출의50%가 아니다. `_enhRefund`가 크면 max 적용. | G:28185–28201 |
| C13 | 선택 분해 | Set index→item identity snapshot·중복제거→fav·장착 객체·비유효 salvage값 배제→확인→현재 bag·잠금·장착 여부 재검증→identity 제거→보상/선택 초기화/음/저장. | G:50359–50377 |
| C14 | 전체 쓰레기 지정·쓰레기 분해 | 지정은 **현재 filtered 항목** 중 !fav. 분해는 junk&!fav snapshot을 확인 후 재검증하며 장착 객체 제외. 선택분해 Set과 범위가 다르다. | G:50380–50406 |
| C15 | 대장간 분해 | 별도 `_salSel`과 rarity/slot 필터. 확인 후 index 역순 splice/계산해둔 보상. 이 경로에는 인벤 분해의 fav 배제·확인 후 재검증이 보이지 않는다. **원본 경로 차이로 기록하며 수정·통합을 제안하지 않는다.** | G:50712–50720, 50743–50745, 50767–50784 |
| C16 | 가방 확장 | BAG_MAX<300만 표시; cost=`_malCost(~~(BAG_MAX/6))`, mats 차감/BAG_MAX+6/재렌더/저장. 초기300이므로 기본 상태는 MAX. | G:50235–50247 |
| C17 | 수동 R·hold 획득 | 화면 내 장비를 등급 우선·동급 거리 우선 선택. pickup 성공일 때만 picked 처리. hold는9tick마다 같은 경로. | G:32932–32942, 32954–32967 |
| C18 | 제작·유골함 지급 | 일반 pickup과 다르게 제작은 빈 장착 slot에 직접 자동장착; 유골함 지급도 직접 equipped.ossuary 대입. 이 예외를 일반 수거 규칙으로 확대하지 않는다. | G:51162–51178, 45880–45888 |
| C19 | 잔존 펫 수거/자동분해 | **차단된 legacy**. follow에 수거 전환 없음, fetch 진입 즉시 follow/target/timer reset 후 return하여 하단 분해 코드에 도달할 수 없다. 현행 이식 대상으로 확정하지 않는다. | G:41420–41432, 잔존 G:41433–41467, 자동수거 제거 G:41480–41486 |
| C20 | `depositStorage/withdrawStorage` | 입금은 store<200 확인→같은 객체 push/bag splice. 출금은 bag.length≥BAG_MAX 거절→좌표 null·bag push·store splice, 함수 자체의 빈자리 선검사 없음. 공유 저장/재렌더/게임 저장은 **보호**. | G:48592–48609 |
| C21 | `registerBonePart/withdrawBonePart` | anc_part의 r+t가 더 높을 때 등록. 해제는 bag 용량·1×1 자리 확보 후에만 도감 delete, 복원 itemLv0. | G:45827–45877 |
| C22 | 유물 장착·해제 | `attachCrystal`: 빈 홈·슬롯 제한→유물 이동→applyStats/음. `detachCrystal`: 주머니 max 검사→반환/null→applyStats. 함수의 저장 호출 유무를 외부 UI caller와 구분한다. | G:15775–15794 |
| C23 | `stoneUnseal/stoneUpgrade` | 선택한 정확 q의 소켓석을 소비. 개방은 최대5홈, crystals/socketQ/socketCount 동기화. 승급은 현재보다 높은 q만, 보석 유지→applyStats/저장/재렌더. | G:15796–15827 |
| C24 | 장비 reader·캐시 | wp/sh/bt/ar/hm/bw/gl/pt/blt/nc/rg1/rg2/cp, `_eqStat`(대상 b+stat 값 합), `_eqAffix`(affix.value 합), `_eqImplicit`(매번 순회 합), `_uEq`(매번 순회 첫 truthy), `_lEq`(첫 전설 값 lazy cache). implicit/uEq에 별도 캐시가 있다고 가정하지 않는다. 구필드 복원은 **보호**. | G:16498–16512,16607–16623,27965–27971,27991–27992 |
| C25 | `applyStats/recalcSt`·공격 기준 | applyStats→기본/장비/어픽스/임플리싯/유물 자원·방어·리젠·이동→recalcSt. melee/bow/magic reference는 서로 다른 무기/스탯·flatAffix를 읽는다. Q/E·2_3 공식은 **보호**, 여기서 바꾸지 않는다. | G:27902–27964, 16425–16432, 27993–27999, 28097–28099, 28766–28772 |
| C26 | `itemPower`·`calcCP` | 정렬 itemPower와 플레이어 CP는 별개. itemPower는 enh×80/itemLv×3/atk·공속/DEF·eDEF/자원·어픽스·특수·소켓 효과를 정수화. CP는 P/STATS/PASSIVES+전슬롯 장비의 atk/def/extra를 합산한다. | G:16434–16488, 49487–49509 |
| C27 | 장착/드랍/획득음 | playEquipSfx/playItemDropSfx/playItemPickupSfx: 무기·석궁 타입별 장착음, 희귀≥2 layer, 드랍45ms gate, 픽업6종 random. | G:16262–16271 |

### 2.2 화면·입력·필터·비교

| ID | 화면/함수 | 실제 계약 | 원본 근거 |
|---|---|---|---|
| U01 | `invPanel` DOM | CP/자원/닫기, 장착/페이퍼돌, 유골 도감·전대 초상, 공유 보관함, 유물 전용 panel, 가방·필터·정렬·확장, 상세·비교, 분해3버튼. | G:2927–3014 |
| U02 | 열기/닫기·pause | TAB 기본 inventory, N 보관함. togglePanel/openPanel은 다른 패널 닫기→재배치/선택 해제→paused=true→nav/render. 닫기는 pause 해제. _panelBack은 확인창·유물 picker 등 중첩 상태를 먼저 닫는다. | G:6194, 32116, 44022–44079, 50413 |
| U03 | 4개 내부 탭 | 실제 탭 생성은 **외부 `ui-panels.js`**: equipment/ossuary/crystals/storage. 첫 구성은 플레이어 생성 전이므로 render 호출하지 않고, 후속 분류 변경만 `_invChangeCategory` 호출·aria-hidden/보관 목록 부모 갱신. | G:2558; `ui-panels.js:165–193,218`; `test/uiPanelInitialization.test.js:37–71`(정의만 확인) |
| U04 | 페이퍼돌 렌더 | 아트 노드는 보존하고 직계 장비 socket만 교체. ossuary 제외16슬롯, click 선택·RMB 해제·hover 상세. 좌표 index와 slot 이름을 함께 추적한다. | G:50174–50208 |
| U05 | 스케일·아트 fallback | 배율=max(.1,min(2.1,(폭−36)/654,(높이−98)/560)). knight alpha 원화→대체 paperdoll. 아이템 uniqueArt→공통 컷아웃/원소/물리→최종 glyph; bone·ring·earring 파일명 매핑. | G:2555, 2947, 27786–27813; `inventory-paperdoll.js:1–23` |
| U06 | `renderInv` 요약 | CP·장착/홈 수 갱신→유물 탭은 전용 render 후 return→보관/유골 패널→장착→필터→격자→상세→분해 버튼→배치 snapshot. 재배치·객체 교체 시 hover/selection 무효화. | G:50141–50173, 50409–50411 |
| U07 | 필터 버튼 | slot은 ossuary/headband2 제외, 귀걸이 통합·bonePart 추가. rarity0~4, el 물리/화염/빙결/암흑/암전 5버튼. 같은 버튼 재선택은 null 해제. | G:50212–50233 |
| U08 | 실제 필터·index | 분류→slot(귀걸이 두 slot 허용)→rarity→el. 숨겨진 item을 삭제하거나 가방 index로 압축하지 않는다. 각 카드 `dataset.inventoryBagIndex`는 **원 bag index**. | G:50129–50139, 50278–50296 |
| U09 | 격자 치수·리사이즈 | 셀 크기=max(1,min(56,floor((availableWidth−gutter)/10))), gutter≥12. 부모 ResizeObserver, 경계 밖 좌표 재검색, 유효하지 않은 분해 index 정리. | G:50249–50277 |
| U10 | 가방 조작 | LMB 선택, Ctrl/Meta+LMB 분해 Set 토글(!fav), RMB는 storage 입금→bone 등록→장착 순. hover preview와 선택 상세를 분리한다. | G:50317–50340, 48599–48604 |
| U11 | 드래그 | mousedown→ghost, document mousemove에서 round/clip 및 `_invCanPlace` 미리보기→mouseup에서 유효할 때 `_gx/_gy`만 갱신→render. 별도 touch 드래그 동등성은 **미확인**. | G:49957–49990, 50317–50324 |
| U12 | 키보드 | hover 우선 또는 selected 원 bag index. Space/X=junk(켜면 fav 해제), F=fav(켜면 junk 해제), Y=원 bag index dataset을 찾은 contextmenu. 포커스된 native button 키처리 예외도 있음. | G:13213, 13250–13260, 50295 |
| U13 | 게임패드 | L3 정렬, LT 쓰레기 지정, RT 분해, LB/RB eq/bag/bot/st 영역, A선택/B우클릭/Xjunk/Yfav, 장착 영역 Y해제·오른스틱 스크롤. 필터 후 선택 index 동등성의 실제 플레이는 **미확인**. | G:14150–14260; 보관함 D-pad G:13897 |
| U14 | 상세·footer | bag/eq/st의 실제 item 조회, hover preview vs 선택, 장착 비교 두 카드, 동일 item/source의 스크롤·펼침 보존. footer는 요구 레벨/강화이전 비용/귀걸이 대상·분해·해제·출금. | G:49522–49664 |
| U15 | 빈 상세·복귀 | 장착 현황/CP·홈 수/장착 목록, hover 종료 시 기존 선택 action 복구·표시 숨김. _invPlacement는 item identity·좌표·장착 참조 변경을 판정한다. | G:49665–49727, 50141–50155 |
| U16 | `_invCardFields` | bone/레벨/요구레벨/무기종/강화·기본스탯/DPS/돌진·자원·스탯·크리/임플리싯/어픽스/전설·유니크/홈 q·유물·공명 표시. legacy 소비 필드를 신규 producer 존재로 간주하지 않는다. **Q/E 수치는 보호 표시**. | G:49730–49862 |
| U17 | `_invBuildCompare` 수치 | cmpKeys의 필드 차이, ST소모·무게·물약쿨은 감소를 좋은 값으로 표시. 부동 차이 threshold .0001, 소수3자리. DPS는 atk×타입 atkMul×60/(33/(타입 spdMul×statDex)), 차이 .05 초과를 소수1자리로 표시. | G:49874–49902 |
| U18 | CP 가상 장착 | `_inventoryEquipCP`는 후보 얕은 사본·강화/홈 전승 미리보기→P/INV.equipped 임시 참조·캐시 무효화·applyStats→calcCP→**finally 원래 P/INV/캐시 참조 복구**. 비용 부족/레벨 부족이면 현재 CP. 비교 카드의 curEq는 `_equipSlot(it)`이지만 CP 분기의 slot은 `item.slot`이다. 귀걸이 대상 차이의 실제 표시 결과·얕은 복사의 중첩 객체 영향은 **미확인**이다. 실제 장착·소비·저장 호출은 하지 않는다. | G:49467–49485,49557–49559,49904–49917 |
| U19 | 비교 기타 | 왕관 원소별 차이·el 변경·affix id별 value 합/증감/새·잃음·임플리싯·강화이전 비용 표시. pct/prob 차이는 `%p` 단위, -0 보정. 비교는 강화 제외 베이스 표기와 후보 CP를 구분한다. | G:49865–49872, 49918–49954 |
| U20 | 상세 휠·접근성 | 외부 controller가 visible·높이·preview/compare 조건에서 카드들을 같이 scroll, deltaMode 1→16px/2→패널높이. modifiers 제외, overflow 검사 없이 preventDefault. footer focus 자동 수평 스크롤. | `ui-panels.js:194–217`; G:49538–49583 |
| U21 | 유물 탭·picker | `renderInvCrystals`, `_crBagGroups`, `renderCrystalBag`, picker focus 시작/복귀·open/close, 선택 유물/정확 q 소켓석 상태. 장비 상세의 홈 클릭도 attach/detach/picker로 이어진다. | G:15386–15409, 15409–15694, 15696–15794, 49608–49625 |
| U22 | 유골 도감 | `renderOssPanel`, `_ossShowBoneInfo/_ossHideBoneInfo`; 4부위 등록/해제·유골함 장착/해제·선대 portrait fallback. 실제 전대 소환 전투 구현과 별개다. | G:49991–50128 |
| U23 | 보관함 화면 | `renderInvStorage`는 기존 store/빈칸/가방 보관 목록 렌더, 양쪽 click/RMB. 렌더 숫자34px은 CSS로 덮어써지므로 최종 실제 크기로 단정하지 않는다. | G:48555–48609; 스타일 로드 G:2552–2566 |
| U24 | 확인창·분해 UI | `gameConfirm` 비동기 확인과 선택/쓰레기 snapshot 재검증. 취소·대기 중 item 교체·fav 전환·장착을 각각 검증해야 한다. 대장간 경로는 C15와 구별한다. | G:3406, 50366–50376, 50396–50405 |

비교의 `cmpKeys` 필드 집합은 `atk,def,spd,wStCost,wRange,wArcW,wStagger,bowSpd,bowRange,bowPierce,bonusSt,charge,chargeDist,bonusChargeDist,chargeW,chargeAoE,chargeCharge,stagger,blockRate,shieldWt,splashR,splashMul,magicPen,bonusRange,stRegen,mpRegen,bStr,bDex,bInt,atkSpd,potCd,bonusHp,expBonus,critRate,critDmg,beamDmg,bonusChargeStock,eDef,ancPow`이다(G:49876). 카드에 표시하는 모든 필드가 이 비교 집합에 들어가는 것은 아니다. 실제 집합의 누락을 추정으로 보충하지 않는다.

### 2.3 저장·복원·로비 연결 — 모두 보호

| ID | 필드·경로 | 확인 사실 | 원본 근거 |
|---|---|---|---|
| S01 | DB 수집 | `inv:{bag,equipped,ossCollect}`, `bagMax`, `storage:{}`, `crystalBag,crystalDust,stoneBag`. bag/equipped 안의 item 전체 객체이므로 fav/junk/좌표/enh/소켓/특수/구표식도 포함한다. UI selected는 이 inv payload에 넣지 않는다. **보호**. | G:3533–3559 |
| S02 | INV 복원·호환 | d.inv 복원, 후발 slot 결측 null/ossCollect 결측{}, 팔찌/???/명칭/석궁/legacy prefix/suffix/무기 spd·이름 호환, selected=null. **보호**, 마이그레이션 변경안 없음. | G:3628–3683 |
| S03 | 가방·창고·유물 복원 | bagMax 기본300, 옛 storage[0] 최초 공유창고 이관·max200, crystalBag/dust/stoneBag, 소켓 q/배열 길이 정리. **보호**. | G:3734–3766 |
| S04 | 저장 호출 의미 | `dbSaveNow`는500ms debounce/캐릭터 identity 확인, `dbSaveForce`도 최소5초 간격·진행 중 pending. 함수 이름만으로 즉시 저장이라 부르지 않는다. **보호**. | G:3947–3977 |
| S05 | 공유 저장 | `hellcave_sharedStorage`, `hellcave_sharedMats`, dirty flush, QA namespace 분기. 실제 저장소 접근·변경 없이 코드만 추적했다. **보호**. | G:48520–48553 |
| S06 | 모드별 직렬화 | 데모 inv/bagMax, local/API, web 각각 별도 직렬화 경로가 있다. 한 경로만 보고 전체 저장 완료로 세지 않는다. **보호**. | G:62002–62006, 62139–62146, 63899–63934, 64056–64089 |
| S07 | 모드별 초기화 | demo test/new·test char·editor·local·web의 INV/용량/필터 reset. 신규 시작과 d.inv 복원을 구별한다. **보호**. | G:61941–61950, 62116–62125, 62354–62363, 62468–62475, 63948–63955, 64097–64104 |
| S07a | 별도 QA 시작 경계 | `_startDruidQaChar`는 기본 장비를 equipped에 직접 넣고 recalc/applyStats 뒤 현재 자원을 채운다. 일반 bag reset 경로로 묶지 않는다. **보호**, 이번 실행 없음. | G:62330–62340 |
| S08 | index의 직접 시스템 | I 전체4742행에서 `INV/inventory/equip/장비/인벤/dismantle/salvage` 직접 구현은 검색 확인되지 않았다. 인벤 조작 화면·생성자는 game 쪽이다. 검색 결과의 부재를 로비가 저장과 무관하다는 뜻으로 쓰지 않는다. | I:1–4742(범위 검색); 아래 S09–S10 |
| S09 | 데모 슬롯 복제 | `_demoSyncActiveSave/_demoActivateSlot`은 세이브 JSON 전체를 spread/복제하여 캐릭터별 슬롯↔`hellsave_demo`로 넘긴다. INV 필드도 opaque payload로 운반될 수 있으며 필드별 편집은 없다. **보호**. | I:3485–3519 |
| S10 | 로비 선택·입장 | `/api/slots` 또는 localStorage 목록, `showCharGate`에서 char/slot/demo query로 game.html 진입. inventory UI가 아니라 저장할 캐릭터 identity 경계다. **보호**. | I:3026, 3522–3554, 3650–3657, 4340–4349 |

## 3. 지정 설계 폴더 전체 대조

아래 5개 문서 **1666행**을 읽고 원본과 대조했다. 문서 자체는 수정하지 않았다. `D1`~`D5`는 이 절에서만 쓰는 경로 약칭이다. 미실행인 과거 QA와 현재 구현 사실을 구별한다.

| 약칭 | `docs/2_7 인벤토리+장비시스템/` 아래 파일 | 행 수 | 대조 범위 |
|---|---|---:|---|
| D1 | `2_7 인벤토리+장비시스템.md` | 1303 | 본문·후속 수정·Godot WIP 이력 전체 |
| D2 | `3파트_아이템분류.md` | 297 | 분류·스탯·어픽스·소켓·UI 계약 전체 |
| D3 | `INVENTORY_EARRINGS_QA_20260924.md` | 16 | 당시 QA 근거와 현행 귀걸이 경로 구분 |
| D4 | `INVENTORY_VISUAL_QA_20260924.md` | 32 | 당시 화면·회귀 이력과 현행 구조 구분 |
| D5 | `보관함_단일_UI_20260928.md` | 18 | 탭·조작·용량·공유 저장·스타일 로드 경계 |

### 3.1 현재 설명의 불일치·누락 (수정하지 않음)

| ID | 문서·행 / 문서값 | 원본 파일·행 / 실제값 | 판정·취급 |
|---|---|---|---|
| X01 | D1:238 itemPower에 bLck×3·bGrit×3 | G:16464–16465, 전체16434–16487은 bStr/bDex/bInt만 합산 | **불일치**. 원본 itemPower에 새 항을 제안하지 않는다. |
| X02 | D1:314–317 lckFlatR/gritFlatR 부위 ring/bracelet | G:14510,14512는 ring/bracelet/belt/headband | **불일치**, 문서 부위 누락. |
| X03 | D1:294 shieldFlat 장신구 전용 | G:14451은 armor/shield/gloves/pants/boots/cloak, 이름 매핑 G:14364 | **불일치**. |
| X04 | D1:300 방어구6종 강화가 DEF/eDEF에 동시 적용 | G:43508,43511 소비·49760–49761 상세 표시는 shield/armor/cape 3종 | **불일치**. 피해/Q/E 관련 소비 변경안 없음·보호. |
| X05 | D1:47–59,291 방어구 HP/ST가 동일 티어 범위 | G:15932–15940은 base이고 최종 bonusSt는 G:15996 등급배율×`(0.9+rand×0.2)` 롤, pants HP G:16049·belt HP G:16054 추가 | **최종 생성값 설명 누락**. base 표가 최종 roll 표와 같지는 않다. |
| X06 | D1:198,373,381 펫 회수·즉시분해를 현행 경로로 설명 | G:41431–41432 무조건 return, 41484 자동수거 제거. 현행 R 획득 G:32932–32967은 pickupItem 직결 | **도달성 불일치**. 잔존 펫 코드를 현행 기능으로 이식하지 않는다. |
| X07 | D1:281–288 등급0~4의5단계만 설명 | G:14347–14351 표시/색/배율0~5, G:15142 어픽스7개·16134–16141 유니크 특수 | **기준표 불완전**. 문서의 유니크 별도 절과 구분한다. |
| X08 | D2:19 유골함에 악세 LCK+근성 확정+STR/DEX/INT 중1종 준거 | G:16159 최종 override에서 bStr/bDex/bInt/bLck/bGrit 삭제 | **불일치**. 일반 악세 규칙을 유골함에 적용하지 않는다. |
| X09 | D2:52,77 크리 확률·배율 무기 전용 | G:14396–14397은 ring/neck/bracelet 허용 | **불일치·문서 내부 충돌**. D2:275–276 후속 이력도 악세 허용. |
| X10 | D2:78 악세 STR/DEX/INT 금지 | G:16088–16095 고급 이상 악세는 셋 중1종 | **불일치·내부 충돌**, D2:23,72의 허용 설명과도 충돌. |
| X11 | D2:46 최대+50/티어·5티어=250 | G:14449 defFlat tiers `[10,20,30,40,50]`, 최대50 | **불일치·내부 모순**, D2:58–64 자체 표는 원본과 일치. |
| X12 | D2:68 개별저항 목록에 holyRes | G:14485–14490 fire/ice/light/dark/poison 및 allRes, holyRes 정의 없음 | **식별자 불일치**. 존재하지 않는 정의를 새로 만들지 않는다. |
| X13 | D2:121 bow subtype bow/crossbow | G:15886–15891 crossbow/repeater/arcane | **불일치**. |
| X14 | D2:176–181 장신구 dmgBonus·ring critRate5/neck critRate10을 생성 스탯처럼 설명 | G:15942–15947 base에는 있지만 mkItem 전체 G:15894–16167에서 해당 base 값을 반환 item으로 복사하지 않는다. 소비 G:27997,42230,49801은 존재 | **신규 생성 계약 불일치**. 구세이브의 보유 여부는 미확인·보호. consumer 존재만으로 producer를 만들지 않는다. |
| X15 | D1:73–81 INV 예시에 bag/equipped만 | G:16174–16178 selected/ossCollect도 존재 | **구조 예시 불완전**. S01의 저장 payload와 런타임 INV를 구분·세이브 보호. |

### 3.2 후속 계약으로 대체된 기록·과거 QA

| ID | 문서의 구값·이력 | 현재 원본·후속 문서 근거 | 판정 |
|---|---|---|---|
| H01 | D1:141 유골함2홈 고정 | G:16164는0홈, D1:943이2홈 폐지를 명시 | **구계약 잔존**, 후속 계약은 정상 일치. |
| H02 | D2:126,163–165,212–214,227; D1:469,883,906의600×324/72px·구좌표 | G:15839–15858은654×560/96px. D1:86–105, `inventory-paperdoll.js:8–11`, `inventory-space.css:434–458` 일치 | **구계약 잔존**. 옛 좌표를 현재안으로 혼합하지 않는다. |
| H03 | D1:243 유물 파워 crystalEffects 합×2 | G:16486은 socketMul도 곱함. D1:945–946이 새 홈 보너스 소비 설명 | **구공식 요약 잔존**, 후속 계약 정상. |
| H04 | D1:618 유물 그룹 id/star/enh만 | G:15391–15396은 q 포함, D1:940 후속 설명 | **구계약 잔존**. |
| H05 | D1:487,548,623,675,886,908,923 및 D5:12 당시 캐시 키(D5=`20260928-storage-icon-gem-picker2`) | G:2552–2561 ui-refinement/ui-panels=`20261006-panel-fit`, inventory-space=`20260928-relic-frame1`, paperdoll/knight=`20260928-equipment-cutout3` | **시점별 이력**. 모든 과거 키를 현행 로딩값으로 읽으면 불일치. |
| H06 | D1:729–730 실제 세로 overflow가 있어야 휠 처리 | `ui-panels.js:195–209`는 visible/높이/preview·compare만 검사. D1:11은 짧은 비교 카드에서도 가방 스크롤 차단 설명 | **이전 계약 잔존**. 현재 정적 분기는 JS 기준. |
| H07 | D4:14 당시15소켓/화면 PASS | 현재 G:15176·50179는17슬롯−ossuary=16. 당시 QA를 재실행하지 않음 | **과거 QA 이력**, 현재16소켓의 시각 PASS나 새 회귀 결과로 확대 불가. |
| H08 | D3/D4의 화면·회귀 PASS와 원화 출처 | 문서 이력만 읽음, 이번 화면·과거 외부 receipt·PC 인수 확인 없음 | 해당 과거 증거의 현재 유효성은 **미확인**. |

### 3.3 주요 일치 계약

| 문서 근거 | 원본 근거 | 대조 결과 |
|---|---|---|
| D1:75–79,270–271 | G:15176,16176 | 17슬롯·순서 일치 |
| D1:205–221 | G:16213–16245 | 실제 sort 우선순위·분류별 배치 일치 |
| D1:249–261 | G:28185–28200 | 경제등급 cap4·기본액·레거시환수·이전환수 max·tier×2 일치 |
| D1:265–268 | G:16143–16147 | itemLv 10단위/cap900·reqLv 일치 |
| D1:328 | G:16411–16423 | 일반 pickup은 빈 slot과 무관하게 가방행 |
| D1:342–350,363–366 | G:16263–16271 | 타입별 장착음·픽업6종 .5볼륨/피치±.05 계약 일치 |
| D1:380 | G:32001,32026–32032 | tier 필터 threshold·off→−1 일치. 펫 도달성 X06과 별개 |
| D1:390–394 | G:16303–16344 | 강화이전 비용 부족 차단·유물 빈홈/주머니 반환 일치. max 주머니 예외는 G:16336 |
| D1:468,470–478 | G:15176,15895,16272–16284 | 귀걸이2 index16·템플릿 공유·빈칸 우선·명시 대상 일치 |
| D1:1010–1018,1099–1109,1118 | G:16287–16291,16363,16376,49467–49484,49904–49917,49941–49944 | 현재 자원 보존/clamp·CP 후보 사본/finally 참조 복구·비용 부족 안내 일치 |
| D1:1164–1168 | G:13258,50295 | 필터된 화면에서도 keyboard Y가 원 bag index dataset으로 우클릭 라우팅 |
| D5:5–10 | G:16258–16259,48537–48608; `ui-panels.js:165–187` | 단일 보관함 탭·200개·입출금·기존 저장 경계 일치·저장 보호 |
| D2:105–115,142–150,191–197 | G:15184–15208 | 유물18종·8/6/4 분류 일치. 전투 효과 전체 인수와 별개 |
| D1:105,9 | `inventory-paperdoll.js:7–11`; G:49538–49544,49657–49662 | 페이퍼돌 배율·동일 상세의 스크롤/펼침 보존 일치 |

## 4. Godot의 기존 의존성과 결손

아래 테스트는 **파일과 검사 내용을 읽은 정적 근거**이며 이번 작업의 실행 결과가 아니다. 검사명만 적은 파일의 디렉터리는 `godot/tests/`이다. 계획의 기존 격리 검수 보고와 실제 플레이 인수도 구분한다.

| ID | 의존 단위 | 실제 Godot 파일·행 | 테스트·기존 작업ID | 판정·남은 경계 |
|---|---|---|---|---|
| N01 | actual INV owner | `godot/scripts/native_source_new_run_state.gd:115,128,152,184` | `godot/tests/test_native_main_source_starter_state.gd:84–99` 실제 객체·17slot/15장비/10bag 정의 | **있음**. read_current_inventory가 실제 owner 객체를 반환. 새 가짜 INV를 만들 필요 없음. |
| N02 | 시작 아이템 생성·투입 | `godot/scripts/main.gd:143–148`; state `:751,796–825`; `godot/port_modules/starter_item_factory_source/producer.gd:913` | starter test 위 범위 | **시작 전용 일부**. _initial_starter_running·Player pre-Tree gate라 일반 equip/pickup API가 아님. |
| N03 | 아이템·rollDrop 생성 | `godot/port_modules/kill_reward/drop_item_source.gd:433`; `godot/data/item_generation_tables.json`; `native_normal_enemy_hurte.gd:691–734` | P2-001c, `test_p2001c_kill_rewards.gd:75–125,180–283`, 격리 guard `:27–34`; 계획:61 | **생성/기록 있음**. 원본 표 리터럴·처치 RNG 소비와 UI 반입은 별개. |
| N04 | 드랍 필터 | `godot/port_modules/npc_interaction/source_options_state.gd:10`; `main.gd:1109–1116`; drop module `:467,475` | `test_p2001c_kill_rewards.gd:80` 기본 context 검사 | **계산·consumer 일부 있음**. OPT 필터 UI/복원 및 모든 threshold 분기 인수는 미확인. 화면 invFilter는 별개. |
| N05 | 바닥 레코드·재료 bag owner | state `:398–414,527–547` | `test_p2001c_kill_rewards.gd:269–276` cap20·journal/bag 검사 정의 | **레코드 있음**. append/read_native_drop_records의 실제 world/HUD pickup consumer는 확인되지 않음. |
| N06 | 바닥 표시·줍기·INV 반입 | hurte `:692,734`, drop module `:11` 범위 밖 명시 | P2-006a 작업판:25 중단·인계 대기, 계획:61 미이식 | **현 pinned consumer 없음/미이식**. 타 worktree WIP의 완성 여부는 미확인·접근 안 함. |
| N07 | affix/stat/formula reader | `godot/scripts/native_source_player_providers.gd:105–112,127–133`; `godot/port_modules/equipment_affix_reader/producer.gd:214`; `main.gd:2317–2324` | starter test `:129–141` Cref/Affix/Rates 검사 | **현재 장비 읽기 있음**. 모든 장비 효과가 완성됐다는 뜻은 아님. |
| N08 | 초기 applyStats/recalc | `godot/scripts/native_source_player_initialization_services.gd:497–531`; `native_source_player_initialization.gd:167–237` | `test_native_main_source_player_initialization.gd:82–98,110–122` | **초기화 있음**. 현재 초기 applyStats/recalc caller인 initialize_new_run은 단회/pre-Tree 계약. services 전체가 초기화 전용이라는 뜻은 아니다. 런타임 교체 후 refresh 인수는 별개다. |
| N09 | cache 무효화·token | `godot/scripts/native_source_player_initialization_services.gd:580–599`; affix module `:105,119–124` | 초기 recalc dispatcher·cache primitive 정의 | **primitive 있음**. 일반 equip caller·CP preview transaction·관련 UI/직접 테스트는 미확인. |
| N10 | armor 속성 소비 | `main.gd:160–162`→`player.gd:947,956–959`; `godot/port_modules/item_armor_element/producer.gd:2–3` | Player actual reader bind 정의 | **readonly 소비 있음**. 인벤 교체/저장 구현으로 세지 않는다. |
| N11 | 공격·피해 장비 소비 | `native_normal_enemy_hurte.gd:37–59,256–268,821,838,855`; `main.gd:1854–1869` | `test_p1002e_melee_hurte.gd:185–197` provider 검사 | **지원 분기 있음**. weapon/gloves·dmgBonus/LCK/crit 등. Q/E·피해 집행자는 **보호·읽기만**. |
| N12 | HUD CP | `godot/scripts/hud.gd:97,1089–1121,1135–1149` | P2-002b, `test_p2002b_minimap_corner.gd:70–107,154–157,177–178` | **현재 CP 표시 있음**. 가방/상세/가상교체 UI는 아님. |
| N13 | 인벤 UI·선택·장착/해제 | main/player/hud/scripts consumer 검색. starter-only writer N02와 구분 | `native_pets.gd:398–403`의 TAB 안내는 문구만 | **일반 소비자 확인되지 않음**. TAB 안내로 구현 완료 판정 불가. |
| N14 | 비교·분해 | affix token N09 외 원본 비교 transaction·salvage/dismantle consumer/직접 테스트 검색 | 대응 Godot UI·분해 테스트는 확인되지 않음 | **없음/미확인**. 기존 cache primitive만으로 장착 미리보기나 분해 완료를 주장하지 않는다. |
| N15 | 저장 lifecycle | `godot/port_modules/save_adapter/source_save_lifecycle_owner.gd:6,21,106` (`Main_connected=false`); scripts caller 미확인 | 주입 collector/slot/rift/primitive 요구 | **미연결·보호**. 전체 INV 직렬화·복원 완료 근거 없음. |
| N16 | 좁은 grit 복원 | `godot/port_modules/save_adapter/raw_grit_restore.gd:44–55`; providers `:121` 초기 raw 연결 | 모듈의 main_connected=false 경계 | **부분 입력만**, 전체 INV load 아님. 저장 형식·복원은 **보호**. |
| N17 | QA 저장 | `godot/scripts/performance_capture.gd:4,270`; hurte `:758–760`의10킬 dbSaveNow 미이식 | QA `user://qa/latest-session.json` | **QA 기록만**. 플레이어 INV 저장과 혼동 금지·실제 세이브 보호. |
| N18 | world frame·RNG | `godot/scripts/world.gd:2743,2750,2966,2976,3052` | 실제 자원 bind/RNG·owner/birth/render phase 정의 | **기존 권위 있음**. 바닥 아이템·pickup frame 연결은 확인되지 않음. 새 타이머·독립 RNG로 대체하지 않는다. |

## 5. 작은 이식 단위 순서안 — 다음 구현용 지시서

### 5.1 보강 기준과 공통 실행 조건

**다음 차례에 구현할 “1번 단위”는 순서 1 / TI-00이다.** 사용자 보충 지시에 따라 신규 읽기 계약 모듈과 신규 테스트부터 착수한다. 이번 커밋은 이 절만 보강하며 코드·테스트는 만들지 않는다. 최초 추적의 “구현·배정 아님”과 구분하여 다음 TI-00의 실행 범위를 아래에 정한다. TI-*는 문서 내부 순서 표식이며 공식 작업표 ID를 새로 배정한 것이 아니다.

보강 때 fetch한 `origin/main`은 **`43aa97ffe203d1b273922ba522fa335c7af5cde6`**이다. 최초 기준 `788ba758f9f5c92564abacb2f2fce88a42af2c1a`와 `game.html`·`index.html`은 동일하여 G/I 원본 행과 수치는 유효하다. 이 절 밖의 추적은 최초 SHA에 고정되어 있다. 진전된 공용 Godot 코드는 아래 함수 접점을 기준으로 최신 행·소유권·INDEX/WORK를 착수 때 다시 확인한다. 이번 브랜치에 main을 병합하지 않는다. 마감 확인 때 공통 origin/main ref가 `9528ea35b429498fcf42fe3723008219ed0ed7e1`로 진전된 것도 관측했다. 두 SHA 사이의 Git diff에서 웹 원본·TI-00의 State/ResourceAuthority/슬롯 producer와 여섯 공용 파일에는 변경이 없고, 제안한 신규 inventory 경로도 아직 없다. 아래 작업판 기록의 시점은 43aa 기준으로 유지한다.

| 최신 main 확인 사항 | 구현에 적용할 제한 |
|---|---|
| `WORK_BOARD.md:26`은 P2-006a 기능 완료·main 병합/화면 RETOUCH를 기록하나 위 SHA의 Git tree에 대응 pickup/world-drops 신규 모듈·테스트가 확인되지 않으며 `native_normal_enemy_hurte.gd:734`도 `floor_item_render_pickup` 미이식을 기록 | **작업판/코드 불일치, 연결 API 미확인**. 다른 WT로 보완 추정하지 않는다. TI-12는 실제 통합 SHA·소유 파일·API 인계 전 BLOCKED. TI-00 독립 읽기 계약은 진행 가능 |
| P2-006b는 `native_world_drops.gd` 표시부, P2-007a는 글꼴·인트로 패널 소유 | TI-03/12/13에서 해당 파일/구역 수정 금지 |
| TRACE-META/ITEMS/WEAPONS, SV-CONTRACT/QS-01/SETTINGS-S01 진행 | 경제·아이템·무기 상수/저장/옵션 owner 중복 생성 금지. 필요한 실제 writer가 없으면 선행 미확인 |
| 레슨 P2-001l 병합 기록과 공용 입력 처리 | main/player의 기존 allows·입력 소모 순서·Q/E 변경 금지. TI-13 배선은 공용 담당 조정 |
| P4-001의 넓은 데이터/UI/저장 범위 | 다음 사용자 지시의 TI-00을 일반 장착·UI·저장 연결 승인으로 확대하지 않음 |

공통 규칙은 다음과 같다.

- 아래 `native_inventory_*.gd`는 `godot/scripts/`, `test_native_inventory_*.gd`는 `godot/tests/`의 **예정 파일**이다. 별도 표기한 기존 파일만 수정 후보이다. 해당 단위 결과는 이 문서에 반영하며 기존 설계 docs·계획·WORK_BOARD는 직접 수정하지 않는다.
- **공용 0행**은 `main.gd/hud.gd/world.gd/player.gd/native_normal_enemy_hurte.gd/native_source_new_run_state.gd` 모두 0행이다. 초기 단위는 격리 fixture/인수된 owner로 검증하고 실제 패널 배선은 TI-13에 모은다. 이를 actual Main·실플레이 완료로 보고하지 않는다.
- 원본의 처리/실패 순서를 보존한다. 별도 INV/G/P 권위·임의 RNG/clock·cache epoch·rollback·자동 재시도 규칙을 발명하지 않는다. **docs/2_3·Q/E·세이브 형식은 보호**다. 원본 dbSaveNow/dbSaveForce는 경계 사실만 기록하고 저장 포맷·직렬화·마이그레이션 변경안을 제안하지 않는다.
- 미래 테스트는 원앱 `/Users/fordeargamers/.codex/tools/godot-4.7.2/Godot.app/Contents/MacOS/Godot`의 버전을 확인하고 자기 WT의 `godot/override.cfg`에 `[application]`의 `config/use_custom_user_dir=true`와 아래 정확한 `config/custom_user_dir_name`을 설정한다. 첫 검사 `OS.get_user_data_dir().get_file() == ISOLATED_DIRECTORY` 실패 시 `quit(2)`·fixture 생성0. 실제 `EXODUSER-Godot-Native-First` 폴더·열린 게임 창 접근 금지. 기존 override가 있으면 소유/내용을 확인하며 덮어쓰지 않는다.
- 실행 형식은 해당 WT에서 `"<위 Godot 절대경로>" --headless --path godot --script res://tests/<아래 테스트 파일명>`. stdout/stderr·exit code·실제 userdir·코드 SHA는 `~/exoduser-wt/_out/<실제 배정 작업ID>/`에 보존한다. child 종료 후 자기 override만 복구하고 override/import cache는 커밋하지 않는다. 실제 Main은 resource import 선행 여부를 확인하며 사용자 전역 Godot 설정을 보존한다. 권한 실패는 우회하지 않는다. 이번 보강에서는 Godot/import/테스트 실행0이다.
- TI-00은 Main/Player scene·이미지·오디오 preload 없이 구성한다. 이 구성의 실제 실행 가능 여부는 아직 미확인이다. 신규 테스트의 ignore 여부도 확인하고 자기 코드·테스트·관련 문서의 정확한 경로만 staging한다. `git add -A`·force push·reset은 금지한다.

### 5.2 순서 1 / TI-00 — actual INV 읽기 계약·원본 fixture

**다음 구현의 산출물은 신규 두 파일과 이 문서의 결과 갱신이다. 공용 코드 0행·기존 테스트 0행·입력/저장/장착 writer 0개.**

| 파일/참조 | 구체 지시·원본 근거 |
|---|---|
| 신규 `godot/scripts/native_inventory_contract.gd` | `extends RefCounted`. 실제 State의 WeakRef만 보관하는 읽기 bridge. INV 복제/생성·Node 추가/재초기화 없음 |
| 신규 `godot/tests/test_native_inventory_contract.gd` | `extends SceneTree`. 아래 실제 State holder + 테스트 Player/World fixture와 실패 case 검증. actual Main으로 보고하지 않음 |
| 읽기 전용 `native_source_new_run_state.gd:115–159,184–185`; 보강 SHA `:922–979` | 제품 모듈은 기존 `read_current_inventory()`만 호출. `initialize_new_run`은 테스트 fixture 준비 때만1회. 유효한 pre-Tree holder도 읽을 수 있음 |
| 읽기 전용 `equipment_affix_reader/producer.gd:25–28`의 `SLOT_NAMES` | G:15176 canonical17 순서 재사용. 제품에 같은 배열을 다시 손으로 정의하지 않음 |
| 읽기 전용 `native_new_run_bootstrap_source/producer.gd:59–62`의 `EQUIPPED_SLOTS` | fresh slot 집합 재사용. canonical과 삽입 순서가 다르므로 key 집합 대조 |
| 읽기 전용 `native_source_resource_authority.gd:58–81,448–475`와 `player_resource_parameters_source/producer.gd::source_boot_parameters()` | 실제 자원 authority와 기존 boot packet으로 최소 fixture 준비. 기본 자원값을 발명하지 않음 |
| G:15176,16174–16179 | 17slot과 bag/equipped/selected/ossCollect. BAG_MAX300·10열·크기/분류/행 계산(G:16180–16188)은 **TI-01**로 남김 |

위 producer의 전체 경로는 `godot/port_modules/<모듈명>/producer.gd`이다. 다음 API 이름·반환 계약으로 구현한다.

| 예정 API | 정확한 계약 |
|---|---|
| `bind_source_state(owner: Node) -> bool` | 먼저 이전 binding을 비운다. live·삭제예약 아님·정확한 State script·기존 getter 존재 검사 후 WeakRef만 보관/true, 그 외 false/unbound. 구조적 binding이므로 초기화 안 된 정확한 State도 bind=true/read=null일 수 있다. parent/metadata/State 필드 쓰기0 |
| `read_current_inventory() -> Variant` | 매번 WeakRef·수명·script·getter 재검사 후 기존 getter 호출. 아래 gate를 만족하면 **동일 Dictionary 참조**를 반환. unbound/freed/queued/원 getter null/잘못된 구조는 null. 이전 성공값·snapshot·새 빈 INV로 대체 금지 |
| native admission | bag:Array, equipped:Dictionary, selected 키 존재, ossCollect:Dictionary와 canonical17 equipped 키 존재만 검사. 추가 top-level/slot/item/중첩 필드 허용. 빈 bag·전슬롯null·selected=null을 live 조건으로 쓰지 않음. 이는 native 접점 조건이며 원본 JS의 validator라고 주장하지 않음 |
| `source_slot_names() -> Array` | 기존 canonical 상수의 사본 반환. caller의 배열 수정이 canonical에 영향0. live equipped.keys를 정렬해 순서를 만들지 않음 |

setter·`make_read_only()`·필드 보충·schema 정규화·item whitelist·read cache·stats/좌표/선택/정렬 기능을 추가하지 않는다. owner Dictionary의 `make_read_only()`는 정상 writer도 막으므로 금지한다. Tree 전체 readiness인 `is_native_new_run_state_ready()`를 pre-Tree 읽기의 추가 gate로 넣지 않는다.

**fixture 구성:** 테스트 내부 `WorldFixture extends Node`에 player, `PlayerFixture extends Node2D`에 state:String, hp/max_hp, stamina/max_stamina, radius, iframes, facing:Vector2, get_combat_world()를 둔다. 양쪽 참조를 맞춘 뒤 실제 ResourceAuthority에 기존 source_boot_parameters()를 전달해 초기화, 이어 실제 State를 같은 Player/World/resources로 Tree 진입 전에 초기화한다. starter 생성/RNG/clock/Main을 호출하지 않는다. hp/max_hp/radius/iframes 초기값은 기존 `State.source_boot_p()["values"]`의 hp/mhp/r/iframes에서 가져오고(`native_source_new_run_state.gd:91–113`), state="idle"·facing=Vector2.RIGHT는 실제 `player.gd:68–69`와 맞춘다. ST/MST는 기존 ResourceAuthority가 boot에서 설치한다(`:74–75`). world/player 상호참조만 테스트 소유이다. 최신 constructor가 다른 조건을 요구하면 최소 fixture를 해당 코드와 대조·기록한다. 이는 실제 holder+테스트 actor 검수이고 Main 통합이 아니다.

격리 이름은 **`EXODUSER-TI00-InventoryContract-Isolated-20261020`**이다.

| ID | 필수 단정·기대값·근거 |
|---|---|
| TI00-T01 | 슬롯은 정확히 `["weapon","shield","boots","armor","helmet","bow","gloves","pants","belt","necklace","ring1","ring2","cape","bracelet","headband","ossuary","headband2"]`, 길이17·중복0. 반환 배열 수정 후 재조회 canonical 불변(G:15176) |
| TI00-T02 | 원본 fresh literal fixture는 bag0·17slot null·selected=null·ossCollect={} (G:16174–16179). 실제 초기 holder key 집합과 대조하되 삽입 순서 비교0. 이 fresh 상태를 live 필수조건으로 삼지 않음. 기존 actual Main starter는 별도15장비/10bag(N02) |
| TI00-T03 | 실제 holder를 bind한 뒤 `is_same(contract.read_current_inventory(),state.read_current_inventory())`. INV/bag/equipped/ossCollect/item 참조 동일, pre-Tree getter가 유효하면 adapter도 유효 |
| TI00-T04 | 테스트 소유 INV에 nonempty bag·item을 명시 주입. `{"_future":{"list":[1,null,"x"]},"futureScalar":123}`와 추가 top-level 키의 값/키/중첩 참조 보존. _gx/_gy/fav/junk/selected에 삽입·수정·삭제0. 주입 fixture임을 기록 |
| TI00-T05 | fixture owner가 현재 item 값을 수정/bag append한 뒤 adapter 재조회에서 바로 관측. 복제본/옛 성공 cache0 |
| TI00-T06 | unbound read=null, 일반 Node/foreign script bind=false·이전 binding 제거. uninitialized 실제 State는 구조적 bind=true 후 read=null. 빈 INV 성공 대체0 |
| TI00-T07 | owner queue_free/free부터 read=null, authority free로 원 getter가 null이면 adapter도 null. 다른 유효 holder로 재bind하면 새 holder 객체만 반환·옛 fallback0 |
| TI00-T08 | fixture의 필수 키/타입을 하나씩 잘못 만들면 null·자동 수선0. fixture만 복구해 다음 case 수행. 추가 필드 자체는 거절 사유 아님 |
| TI00-T09 | 정상/실패 read 전후 INV·Player 자원·metadata/claim 불변, initializer 재호출0. 초기 fixture 설치 write와 읽기 단계 write를 구분. 제품 읽기 경로의 RNG/time/save/input 호출0은 정적 호출 검토와 측정 가능한 fixture 관측을 따로 기록하며 상태 동일성만으로 모두 입증했다고 하지 않음 |
| TI00-T10 | 자기 Node/RefCounted만 정리, userdir·fixture/actual holder 구분·실패/exit code 기록. 기존 창/실제 데이터 접근0 |

**완료 조건:** 위 단정·프로세스 종료를 실제 확인할 때만 “격리 holder 읽기 계약 통과”로 보고한다. 실행 불가면 미실행/막힌 명령/원로그와 BLOCKED. actual Main/UI/장착/pickup/저장/P4 전체 인수는 주장하지 않는다. 현재 신규 두 경로의 타 담당 소유 충돌은 확인되지 않았다. 착수 직전 최신 main/작업판에 동명 파일이나 새 담당이 생겼으면 중복 구현하지 않고 보고한다.

### 5.3 순서 2 / TI-01 — 크기·분류·격자·자리 검사

- **파일/공용:** 신규 `native_inventory_layout.gd`, `test_native_inventory_layout.gd`. TI-00 무수정·공용 0행. 예정 API `source_item_size(item)`, `source_item_category(item)`, `source_inventory_rows(bag_max)`, `build_grid(bag,skip,item)`, `find_space(bag,w,h,skip,item,bag_max)`, `can_place(...)`. 입력을 조회하고 위치만 반환하며 실제 좌표를 쓰지 않는다.
- **원본/상수:** G:15829–15834,16180–16210,16247–16256. BAG_MAX 초기300은 INV 외부 입력, 열10, 행 `max(10,ceil(bag_max*4/10))`. 17장비 슬롯·근접 sword/dagger/hammer/mace/club/axe/spear·석궁 crossbow/repeater/arcane은2×2, bonePart는1×1. 조회는 weapon+wtype→bow+btype→slot→(1,1). ossuary/bonePart만 ossuary 분류, 나머지는 equipment.
- **검증:** `EXODUSER-TI01-InventoryLayout-Isolated-20261020`. rows 입력300/24/26/30/301→120/10/11/12/121. unknown subtype의 weapon/bow는 slot fallback2×2, future-slot+wtype sword는1×1, 빈 Dictionary는1×1/equipment; null은 원본의 정상 item fallback이 아니므로 조용히 정상 수용하지 않는다. 같은 분류2×2 (0,0) 다음은(2,0), 장비만 있는 bag에 bone은(0,0). 10×120에서2×2 (8,118) 허용/x9 또는 y119 거절. skip·카테고리 독립·공간 없음·입력 참조/값 불변 검사.
- **선행/충돌:** TI-00. 재사용할 기존 layout authority는 보강 SHA에서 미확인. 실제 bag writer 미연결. 일반 pickup/unequip 공간 검사와 보관함/도감의 전체 bag 개수 검사를 보편 hard cap300으로 합치지 않는다.

### 5.4 순서 3 / TI-02 — 정렬·필터·원 bag index

- **파일/공용:** 신규 `native_inventory_query.gd`, `test_native_inventory_query.gd`. 공용 0행. `sorted_indices(bag)`·`filtered_indices(bag,category,filter)`는 원 bag index 배열만 반환한다. 실제 bag 정렬/재배치는 승인 writer가 원본 호출 시점에 적용한다.
- **원본/상수:** G:16213–16246,16434–16448,50129–50149,50212–50233,50278–50296. fav 먼저→junk 뒤→rarity↓→itemPower↓→itemLv↓→enh↓→기존 순서. slot/rarity/el은 AND·null만 해제, 귀걸이는 headband/headband2 합동 필터. itemPower 식 전체를 그대로 사용하고 전투 CP로 대체하지 않는다.
- **검증:** `EXODUSER-TI02-InventoryQuery-Isolated-20261020`. fav rarity0은 unfav rarity5보다 앞, nonjunk rarity0은 junk rarity5보다 앞, 동점은 원순서. `{slot:"armor",def:2}` itemPower=10(def×5). rarity0/el0 필터 유효, 표시 index→원 bag index→동일 item 확인. 숨긴 항목·unknown 필드·원 bag 불변. 자동배치 결과 fixture는 G:16229–16246의 분류별 packing과 대조하되 실제 INV 쓰기0.
- **선행/충돌:** TI-01. OPT 드랍 필터와 화면 필터 구분·SETTINGS-S01의 source_options_state.gd 무수정. 유니크 전용 필터 버튼 임의 추가 금지.

### 5.5 순서 4 / TI-03 — 읽기 전용 탭·격자·상세 패널

- **파일/공용:** 신규 `godot/scenes/inventory_panel.tscn`, `native_inventory_panel.gd`, `test_native_inventory_panel.gd`. panel에 `bind_inventory(contract)`·`refresh_view()`·open/close·원 index 선택 모델을 둔다. 기존 main/hud/input **0행**·TI-13에서 연결. 기존 UI scene/글꼴 무수정.
- **원본/상수:** G:2927–3014,44049–44079,49522–49862,50141–50296; `ui-panels.js:165–218`. cell48, 열10·2분류. 17slot 중 ossuary 전용 패널/페이퍼돌16슬롯, 귀걸이2 index16(G:15835–15859), 페이퍼돌654×560·소켓96(`inventory-paperdoll.js:7–14`). bag 원 index와 eq:/st: 선택 표시를 구분한다.
- **검증:** `EXODUSER-TI03-InventoryPanel-Isolated-20261020`. unbound/null owner는 NOT_READY·미생성 P 접근0. 슬롯/탭 수·원 identity·필터 뒤 원 index, 탭1회 전환당 갱신1회, 상세 재표시 때 노드/포커스/스크롤 보존·hover/휠·이미지 fallback 검사. 작은 창/한영 긴 이름/선택 강조는 새 격리 창 증거로 별도 시각 판정, headless 통과를 시각 PASS로 쓰지 않는다.
- **선행/충돌:** TI-00~02. 장착/분해/drag writer 미연결. P2-007a 글꼴·인트로, HUD 소유 영역 무수정. TAB pause/ESC/컨트롤러 실입력은 TI-13에서 인수한다.

### 5.6 순서 5 / TI-04 — 자원 보존·장비 refresh 순서

- **파일/공용:** 신규 `native_inventory_refresh.gd`, `test_native_inventory_refresh.gd`. 원본 순서의 controller를 인수된 owner Callable들로 검증. 공용 0행. **실제 runtime applyStats/자원 commit API 미확인**이며 fixture callback으로 actual runtime 완료를 주장하지 않는다.
- **원본/공식:** G:16287–16292는 hp/mp/st/shield 보관→_eqAffixCache/_eqStatCache/_lEqCache=null→applyStats1회→각 현재값 `min(new_max,old_current)`. recalc 근거 G:16425–16432,27902–27971. 기존 `native_source_player_initialization_services.gd::_write_context_ready/_invalidate_sink`는 pre-Tree/active initializer gate, `native_source_player_initialization.gd::initialize_new_run`은 단회. 이를 런타임에 다시 호출하지 않는다.
- **검증:** `EXODUSER-TI04-InventoryRefresh-Isolated-20261020`. old hp80/max100→new max120이면80, new max60이면60, mp/st/shield도 동일·무료 충전0. trace는 capture4→invalidate3→applyStats1→clamp4. 타 owner cache/자원 불변. 실제 새 장비의 reader 소비 검사는 actual runtime sink 인수 후 별도로 추가하고 fixture 결과와 분리한다.
- **선행/충돌:** N07~N10 producer는 재사용 후보지만 runtime sink/actual 자원 동기화는 별도 인수 필요. 없으면 실제 연결 BLOCKED. State/Player/자원 authority에 범용 writer를 임의 신설하지 않는다. 필요한 API와 공용 최소 줄/위치는 담당이 runtime 계약을 정한 뒤 기록하며 현재는 **미확인**이다. Q/E·2_3 계산/소비 보호.

### 5.7 순서 6 / TI-05 — 장착·해제·귀걸이·강화/유물 이전

- **파일/공용:** 신규 `native_inventory_equipment.gd`, `test_native_inventory_equipment.gd`. 예정 `equip(item,explicit_earring_target=null)`·`unequip(slot)`에 기존 actual INV/인수된 mats·crystal owner/TI-04만 주입. 공용 0행, TI-00 setter 추가0.
- **원본/공식:** G:16272–16380,28080–28085,28101–28104. 귀걸이는 빈 headband→빈 headband2→item.slot, 명시 target은 try/finally 동안만 우선. reqLv 거절은 교체 전 종료. 이전비 `_malCost(ceil(old.enh*1000))`, 양수 _malCost=`max(1,ceil(v*.5))`. 강화→legacy 환수 기록→유물 빈홈/주머니→old 좌표/가방→장착/새 item bag 제거→old 자리→TI-04 순서. 원본 bag filter는 배열 참조를 교체하므로 옛 bag cache 금지.
- **검증:** `EXODUSER-TI05-InventoryEquipment-Isolated-20261020`. old enh1 비용500, mats499 전체 차단, mats500→0/new enh1/old enh0. reqLv2/P.lv1 거절. 귀걸이 빈칸/둘 다 참/명시 target/실패 후 임시 target 해제·동일 item 중복0. 유물은 새 빈홈 우선→주머니, cap9999면 그 gem은 old에 남기고 다음 처리. 같은 크기는 old가 새 좌표를 받고 다른 크기는 null 후 탐색. unequip 실패 push/pop·장착 유지, 성공만 slot=null.
- **선행/충돌:** TI-01/04·actual mats/CRYSTAL_BAG owner 인수, 없으면 실제 writer BLOCKED. 레슨/SFX는 기존 담당 callback만 사용. dbSaveForce는 **저장 보호·미연결**로 기록. TRACE-META/ITEMS 경제·생성자 소유 파일 무수정.

### 5.8 순서 7 / TI-06 — 비교·CP 후보·상세 두 카드

- **파일/공용:** 신규 `native_inventory_compare.gd`, `test_native_inventory_compare.gd`; 자기 `native_inventory_panel.gd`의 비교 표시 함수만 수정. 공용 0행. `compare(candidate,target)`는 현재/후보/차이 또는 NOT_READY를 반환하며 실제 소비/장착0.
- **원본/공식:** G:49467–49509,49865–49954. 후보 shallow copy, reqLv/이전비 부족이면 현재 CP. P/equipped/cache 참조 snapshot→가상 계산→finally 복구. cmp39key(G:49876), stat 차이 임계값0.0001/소수3자리. wStCost/shieldWt/potCd 감소가 good, affix pct 차이×100=%p·-0 정규화. DPS는 `atk*type.atkMul*60/(33/(type.spdMul*statDex))`, 표시 차이 임계값0.05(G:49881–49902).
- **검증:** `EXODUSER-TI06-InventoryCompare-Isolated-20261020`. def10→12는+2/good, wStCost10→8은-2/good, pct 차이0.01→+1%p, stat 차이0.00001 미표시. mats499/이전비500이면 현재 CP·mats 불변. 정상/오류 finally 후 원 P/equipped/cache 참조 복귀, 중첩 값/자원/bag 영향은 원본 oracle와 대조. shallow copy를 임의 deep-copy 무변이 계약으로 바꾸지 않음.
- **선행/충돌:** TI-03~05·actual statDex/applyStats/CP owner 인수. 없으면 NOT_READY, 0/중립값 대체 금지. 상세 curEq의 _equipSlot(G:49557–49559)과 CP의 raw item.slot(G:49905) 차이는 귀걸이별 oracle로 검사·임의 통일0. HUD 현재 CP 무수정.

### 5.9 순서 8 / TI-07 — 단건 분해 경제·보호·1초 gate

- **파일/공용:** 신규 `native_inventory_salvage.gd`, `test_native_inventory_salvage.gd`. `salvage_value(item)` 순수 계산과 승인 owner caller `drop_item(raw_index,now_ms)` 분리. now_ms는 기존 caller 시각을 주입, 독립 clock0. 공용 0행.
- **원본/공식:** G:16381–16397,28185–28200. `econ=integer rarity>=0 ? min(rarity,4) : 0`, base=[1000,2000,10000,20000,50000], rMul=[.5,.7,1,1.3,1.8]. total=`sum(i=0..enh-1,ceil(max(1,ceil((1+i*.15)*1.5))*rMul[econ]))`, refund=`~~(total*.5)`와 양수 _enhRefund 중 max, value=`base[econ]+refund+(tier||0)*2`. 현행 enhCostRaw 지출의 절반으로 대체 금지.
- **검증:** `EXODUSER-TI07-InventorySalvage-Isolated-20261020`. rarity5/tier2/enh0→50004, rarity4.5/tier2/enh0→1004, rarity5/tier2/enh1→50006, 여기에 _enhRefund10→50014. now2000 성공 뒤2999 거절/3000 가능. **gate 갱신은 item/fav/value 검사보다 먼저**이므로 fav/invalid 거절도 다음1초에 영향. 성공만 mats1회·원 index splice·빈 bag selected=null/아니면min(index,last). 새 rollback/즉시재시도 규칙 추가0.
- **선행/충돌:** TI-00·actual bag/mats writer, UI는 TI-03 뒤 연결. TRACE-META G.mats owner 충돌 확인. 저장 callback 보호·미연결, 실제 save 쓰기0.

### 5.10 순서 9 / TI-08 — 선택·쓰레기 확인 분해

- **파일/공용:** 신규 `native_inventory_bulk_salvage.gd`, `test_native_inventory_bulk_salvage.gd`; 자기 panel 선택/확인 모달만 수정. TI-07 경제식 호출·재정의0. 공용 0행.
- **원본/범위:** G:50359–50406. 선택 원 index→identity snapshot·dedup·fav/장착/invalid 제외→확인→실행 전 identity 재검증. junk는 현재 filtered list의 snapshot이며 **선택과 달리 dedup하지 않는다**(G:50398–50404). 선택 Set에는 숨겨진 item이 남을 수 있다. 대장간 C15 index splice caller는 개편하지 않는다.
- **검증:** `EXODUSER-TI08-InventoryBulkSalvage-Isolated-20261020`. **선택분해**는 동일 객체가 bag 두 칸에 있어도 dedup하여50004 한 번, **쓰레기분해**는 같은 두 참조를 reduce하여100008이다. 서로 다른 각50004인2개는100008, 하나 fav 전환하면50004. 취소0회·확인 중 sort/equip/delete/fav 변경 뒤 현재 유효 identity만 처리. filtered junk와 숨긴 일반 선택을 별도 검사. 원본에 없는 bulk1초 gate 추가0.
- **선행/충돌:** TI-02/03/07·모달 focus/선택 수명 인수. forge/경제 담당 파일 무수정. persistence 보호·미연결.

### 5.11 순서 10 / TI-09 — 공유 보관함 메모리 입출금

- **파일/공용:** 신규 `native_inventory_storage_view.gd`, `test_native_inventory_storage_view.gd`; 자기 panel 보관함 탭/목록/RMB만 수정. 기존 owner의 STORAGE[0] 배열 사용, 공용 0행.
- **원본/상수:** G:16257–16260,48537–48609; `ui-panels.js:171–181`. 단일 보관함 cap200. 입금은 원 객체/좌표를 유지해 이동·선택 해제. 출금은 전체 bag.length>=BAG_MAX 거절→store item 확인→그 item 좌표 null→bag push/store splice→render이며 **빈자리 사전검사 없음**(G:48605–48608). 새 계정 저장/tab/필드 제안0.
- **검증:** `EXODUSER-TI09-InventoryStorage-Isolated-20261020`. storage199→200 허용/200에서 거절. bag300/BAG_MAX300 출금 거절,299이면 count gate 통과하여300으로 이동하고 자리 보정은 render 단계이다. 동일 item 참조·원 배열1회 제거·입금 좌표 유지/출금 좌표 null 후 render, 실패 원본 단계 상태, 양쪽 RMB·탭 재진입 닫힘 검사. 파일 IO0.
- **선행/충돌:** TI-01/03/05·actual STORAGE owner 인수, 없으면 fixture만 가능·실제 연결 BLOCKED. **공유 저장/세이브 형식 보호**, SV-CONTRACT key set/복원 경로 무수정.

### 5.12 순서 11 / TI-10a — 유물 주머니·품질·홈 장착/해제

- **파일/공용:** 신규 `native_inventory_relics.gd`, `test_native_inventory_relics.gd`; 자기 panel 유물 목록/홈 선택만 수정. 순수 품질/공명 계산과 owner attach/detach 분리, 공용 0행.
- **원본/상수:** G:15184–15208,15276–15330,15386–15396,15409–15794. 주머니 cap9999·id/star/enh/q 그룹 구분. q1~100, `_qGemMul(q)=.75+.5*clamp(q,1,100)/100`, 등급 시작1/41/81. socketMul/socketResonant는 원식 그대로. 효과18종/전투 consumer 전체 구현으로 확대0.
- **검증:** `EXODUSER-TI10a-InventoryRelics-Isolated-20261020`. q1/50/100 배율 .755/1/1.25, q40동/41은/80은/81금. 유물없음 mul1/공명false; 홈1+유물1→1/false, 홈100+유물1→2/false, 홈100+유물81→3/true. 피의 맹세 ATK1·star0/enh0·홈100/유물100→1×1.25×3=3.75. 주머니9999면 반환 거절/기존홈 유지·빈홈/slot 제한/동일 gem/focus 검사.
- **선행/충돌:** TI-03/04/05·actual CRYSTAL_BAG/effect owner 인수. **설계 차이 보강:** D1:945의 같은10단계 티어 공명/D1:966의5단계 tint와 달리 현재 G:15308–15330은 동/은/금3등급. 홈100/유물81은 서로 다른10단계 티어여도 공명true. 기존 설계 docs는 고치지 않고 이 oracle로 검사. 전투 효과 담당 writer 무수정·저장 보호.

### 5.13 순서 12 / TI-10b — 소켓석 개방·승급

- **파일/공용:** 신규 `native_inventory_socket_stones.gd`, `test_native_inventory_socket_stones.gd`; 자기 panel 소켓석 선택/개방/승급 caller만 수정. TI-10a 품질 식 재사용·공용 0행.
- **원본/상수:** G:15796–15827. stone_unseal은 정확q 돌1개 소비→crystals null/socketQ q append→socketCount 갱신·최대5홈. stone_upgrade는 현재q<선택q일 때 정확q돌1개 소비/socketQ만 변경·보석 유지. 원본 함수에는 **5홈일 때만 승급** guard가 없다.
- **검증:** `EXODUSER-TI10b-InventorySocketStones-Isolated-20261020`. 0홈+q41돌1개→[null]/[41]/count1, 돌0·같은q 없으면 선택null. 이미5홈 false/미소모. 홈40→선택41 성공, 홈41/42→선택41 거절/미소모. 보석 identity·배열길이·잘못된 index/없는 정확q·원본 배열 보충 시점 검사.
- **선행/충돌:** TI-10a/04·actual STONE_BAG owner 인수. UI의5홈 안내를 API 추가 gate로 바꾸지 않는다. 기존 필드 사용만 다루며 세이브 형식/복원 보호.

### 5.14 순서 13 / TI-11 — 유골 도감·반환·유골함

- **파일/공용:** 신규 `native_inventory_ossuary.gd`, `test_native_inventory_ossuary.gd`; 자기 panel 도감/유골함 상세만 수정. register_bone_part/withdraw_part/ensure_ossuary 예정, 공용 0행.
- **원본/공식:** G:45788–45888,49991–50128,16155–16164. 등록은 rarity+tier 엄격 상향, 미수집 점수-1. 네 부위 완성과 실제 소환 분리. 반환은 bag 개수/1×1공간 확보 후 도감 key 삭제·r/t 유지/itemLv0. 장착/가방 유골함 모두 없을 때 고정1개 지급·recalc/applyStats.
- **검증:** `EXODUSER-TI11-InventoryOssuary-Isolated-20261020`. 기존{r3,t2}=5에 새{rarity4,tier1}=5 false/유지, 새{rarity2,tier4}=6 true. 미수집0+0 등록가능·네 부위0+0 complete=true. bag300/공간없음 key유지, 반환성공1회/r·t유지/itemLv0. bag/장착 유골함 있으면 지급0, 둘다없으면1. 초상 fallback/상세는 별도 시각검사.
- **선행/충돌:** TI-01/03/04/05·actual ossCollect owner. 전대 소환 전투 담당/API 미확인, 소환/AI 범위 확대0. ossCollect 저장 필드 보호·실제 저장0.

### 5.15 순서 14 / TI-12 — 바닥 획득과 actual INV 연결 인수

- **파일/공용:** 신규 `test_native_inventory_pickup_bridge.gd`만 우선 소유. **제품 pickup 파일명/API는 P2-006a 인계 전 미확인**. P2-006b `native_world_drops.gd` 표시부 무수정. 현재 공용 0행·새 pickup owner 중복 생성0.
- **원본/상수:** G:16411–16424,32932–32967. 빈 장착칸이 있어도 일반 장비는 bag행, 공간 실패는 push/pop 후 false. 성공만 좌표/_pickT/닫힘 자동정렬/효과/picked 처리. 화면 half viewport+40, rarity 높은 순→같으면 가까운 순, hold9tick마다 장비1개. 재료/물약 일괄최대20은 별도 기존 담당 경계.
- **검증:** `EXODUSER-TI12-InventoryPickupBridge-Isolated-20261020`. rarity 높은 먼 item 우선·동급 가까운 item, hold8은0회/9는1회. 공간 실패면 floor picked=false/장착·bag 원상, 성공만 동일 item bag1개/picked=true·자동장착0. 재수거0·deathDrop 동일 item 해제·원 index/identity 검사. 새 RNG/주기 clock0.
- **선행/충돌:** actual P2-006a SHA/소유 파일/API 인수, TI-01/02/05. 5.1의 문서/코드 불일치 해소 전 **BLOCKED**. 이후 world frame 연결은 기존 담당이 `world.gd` item update phase의 최소 호출을 정하며 현재 줄수/API는 미확인. 피해 집행자/P2-006b 표시부/차단된 펫 legacy 무수정.

### 5.16 순서 15 / TI-13 — 패널부터 원래 플레이 복귀까지

- **파일:** 신규 `native_inventory_flow.gd`, `test_native_inventory_flow.gd`, `test_native_inventory_main_flow.gd`; 자기 panel scene/script 연결 수정. 신규 flow에 owner binding·모달/선택 수명·TAB/ESC 소비·close 복귀 본문을 모은다.
- **원본:** G:44049–44079,13213,13250–13260,14150–14260; I:4340–4349. TAB/ESC/확인취소·bag 원 index RMB/keyboard Y·플레이 입력 복귀를 행별로 대응한다.
- **공용 최소 연결안:** 아래는 미적용 호출 배선안이다. 실제 diff가 늘면 위치·이유·담당을 먼저 기록한다. 위치는 함수 기준이며 6절의 옛 행을 최신 행으로 간주하지 않는다.

| 수정 후보 | 위치/최소 코드행 계획 | 조건·금지 |
|---|---|---|
| `godot/scripts/main.gd` | preload1행+flow field1행, `_ready`의 source_state/providers/HUD bind 완료 뒤 flow 생성/configure/부착 최소3행, `_unhandled_input` consume 분기 최소2행. **최소7행 배선안** | 정확한 입력 분기 앞/뒤는 레슨 담당 인수 전 미확인. 기존 allows/Q/E를 이동·개편하지 않는다. configure 실패는 미연결로 보고 |
| `godot/scripts/hud.gd` | pause/menu overlay 관리 지점(최초 snapshot `set_pause_menu` 주변)의 panel overlay 등록 호출 **최소1행 후보** | 신규 flow가 기존 overlay API만으로 붙으면 **0행 우선**. 정확 API 인수 전 실행가능1행이라고 단정하지 않음. CP/미니맵/글꼴/노드 재생성 금지 |
| `world.gd/player.gd/native_normal_enemy_hurte.gd/native_source_new_run_state.gd` | **0행** | TI-04 runtime sink·TI-12 pickup 인계 선행. 이 단계에서 누락을 범용 공용 writer로 보충하지 않음 |

- **검증:** 두 테스트는 `EXODUSER-TI13-InventoryFlow-Isolated-20261020`를 사용하며 동시에 실행하지 않는다. flow fixture와 actual Main 결과를 분리한다. TAB1회 열림/닫힘, ESC 최상단 모달1개 닫기, 분해 확인 취소 보상0, 닫은 다음 frame 입력 잔류0. 필터/정렬 뒤 다른 identity를 조작하지 않음, 장착/실패/분해/반환 후 동일 owner·보호값 불변. actual Main의 기존 시작15장비/10bag와 열린 panel의 참조를 대조한다.
- **선행/충돌·실창 인수:** 개별 격리 결과·TI-04 실제 runtime API·TI-12 pickup 인계·Main/HUD 담당의 정확한 배선 범위가 선행. 기존 창은 건드리지 않고 새 격리 창에서 작은 창/한영/컨트롤러/닫은 뒤 실제 플레이를 관측한다. 권한/resource 실패는 명령·원로그와 BLOCKED, headless 통과와 화면 PASS/RETOUCH를 분리한다. 실제 저장·패키지·배포는 범위 밖이다.

**결과 기록 양식:** 파일/commit·원본 근거·실행 명령·정확한 userdir·핵심 단정·원로그·실패/미실행·actual Main 여부·미연결 owner를 적는다. TI-00 통과를 UI/장착 완료로 확대하지 않는다. 타 담당 파일이 필요하면 그 연결만 BLOCKED로 보고하고 우회 구현하지 않는다.

## 6. 공용 파일 접점 — 모두 이번 작업에서 미수정

| 공용 파일 | 현재 실제 접점·행 | 인벤 연결 때 조정이 필요한 경계 | 소유·보호 조건 |
|---|---|---|---|
| `godot/scripts/main.gd` | `_ready:106`, 시작장비 `:143–148`, armor bind `:160–162`, 입력 `:1176`, `_toggle_pause:1601–1616`, `_register_inputs:1652–1674`, 공격 장비 reader `:1854–1869`, affix bridge `:2317–2324` | 기존 source_state를 신규 UI에 읽기 bind할 위치, 인벤 pause와 캐릭터 선택 pause의 구분·원상 복귀, stat refresh 완료 뒤 HUD 알림 접점. 현재 pause는 character panel/QA 저장까지 연동한다. | PC 레슨 입력 담당과 충돌 금지. 입력 함수·Q/E는 **보호**. 정확 삽입 위치·시그널/Callable 계약은 구현 배정 때 확정(미확인). |
| `godot/scripts/hud.gd` | state bind `:97`, pause `:107`, key input `:897`, `_native_calc_cp:1089–1121`, HUD 갱신 `:1135–1149` | 새 inventory Control의 표시 host·포커스·modal stacking, 현재 CP 재사용과 후보 CP 분리, 장비 변경 후 현행 owner getter 읽기 | HUD/폰트 담당의 기존 WIP를 수정하지 않음. 현재 CP 표시는 비교 transaction가 아니며 UI에 가짜 계산값을 넣지 않음. |
| `godot/scripts/world.gd` | 자원 bind `:2743`, RNG `:2750`, physics/owner/birth/render `:2966,2976,3003,3052` | P2-006a가 바닥 레코드를 실제 view/pickup으로 소비할 때 수명·frame phase·정확1회 제거 접점 | P2-006a·동적 world 담당과 인수. 픽업 구현·새 RNG·타이머를 이번 설계에서 중복 소유하지 않음. |
| `godot/scripts/player.gd` | source 자원 bind `:181`, 입력 `:377,400–455`, armor reader `:947–959`, snapshot `:961` | 장비 교체 후 현재 owner reader를 유지하면서 자원 최대치/현재치 clamp를 소비할 접점·UI가 전투 입력을 소비했을 때의 경계 확인 | 입력·레슨·Q/E·2_3은 **보호**. 입력 함수를 고쳐 장착을 구현하는 안은 제안하지 않음. runtime refresh의 실제 허용 API는 미확인. |
| `godot/scripts/native_normal_enemy_hurte.gd` | weapon element `:37–59`, dmgBonus `:256–268`, kill/drop `:691–734`, LCK/crit `:821,838,855` | 새 장비를 이미 있는 INV reader가 자연 소비하는지 영향 검수할 지점. 레코드 생성과 UI 수거 경계 확인 | **공용 피해 집행자 보호**, 이번 인벤을 위해 분기·Q/E·피해 공식을 변경할 필요가 확인되지 않았다. 필요한 수정은 담당·총괄 인수 없이는 제안/수행하지 않음. |
| `godot/scripts/native_source_new_run_state.gd` | `_inventory` 설치 `:115–152`, getter `:184`, drop bags `:398–414`, mats 소비 `:447`, drop records `:528–547`, starter `:751–845`, legendary restore `:1029–1038` | runtime equip/unequip/bag 이동의 단일 owner·실제 참조·cache invalidation 계약, mats/crystal/stone와 순서 합의 | starter-only gate 제거·재활용 금지. 기존 INV를 복제 authority로 바꾸지 않음. **저장/legacy 복원 형식 보호**; 새 runtime writer의 exactscope만 향후 별도 확정. |

`native_source_player_initialization_services.gd`의 두 캐시와 affix module의 token primitive(N09), providers/initialization services(N07–N08)도 관련 의존성이다. 공용 6파일 밖이라는 이유로 단독 수정 권한을 가정하지 않는다. 소유 예정 파일명·접점은 설계안이며 실제 writer 배정은 미확인이다.

## 7. 검토 결과·제출 범위

- 신규 작성 파일은 이 문서 1개다. 설계 불일치 X01~X15와 구계약/과거 QA H01~H08은 기존 문서·원본을 수정하지 않고 표로만 남겼다.
- 원본 `game.html/index.html` 및 지정 설계 5파일의 hash·행 수는 `~/exoduser-wt/_out/trace-inventory/baseline.json`, INV 관련 463개 직접 검색 행의 색인은 `web-inventory-reference-index.txt`에 보존했다. 검색 색인만으로 동작 인수를 주장하지 않으며 실제 분기·legacy 도달성은 본문에 따로 추적했다.
- Godot·웹 실행·테스트 재실행·UI 조작·실제 저장소 접근은 하지 않았다. 나열한 테스트는 기존 검사 정의, TI-* 테스트는 향후 아이디어다. 실플레이 인수·전체 이식 완료·진행률·ETA는 기재하지 않는다.
- 최종 자기 브랜치 커밋 SHA·원격 ref 대조·R 보존 확인 및 한 줄 요약은 `~/exoduser-wt/_out/trace-inventory/DONE.txt`에 기록한다. main push·병합·force·reset·타 worktree 변경은 수행하지 않는다.


### 2026-10-21 DEMO11-22r — TI-04 runtime 선행 조건 해소

과거 위 runtime refresh 미인수/HOLD는 당시 main 기준의 기록이다. main `45be76e4`에서 PC `a28117c1` 및 `PC_RUNTIME_STAT_REFRESH_CONTRACT_20261021.md` 인수를 확인했다. 일반17슬롯 transaction은 기존 TI-00/01 reader/grid를 재사용하고 PC `equipment_refresh` 호출로만 실제 스탯을 갱신한다. 상세 검증·남은 inventory UI/SFX/lesson/저장 접점은 [DEMO11-22r 보고서](orders/reports/demo11-22r_REPORT.md)를 따른다. 전투 핵심/초기화 guard/저장 형식은 변경하지 않는다.
