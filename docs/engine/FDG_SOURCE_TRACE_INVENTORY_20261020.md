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

## 5. 작은 이식 단위 순서안 — 구현·배정 아님

`TI-*`는 이 문서의 제안 표식이며 공식 작업표 ID를 새로 배정한 것이 아니다. 아래 예정 파일은 **미생성**이다. 경로를 생략한 `native_inventory_*.gd`는 `godot/scripts/`, `test_native_inventory_*.gd`는 `godot/tests/`를 뜻한다. 각 단위 착수 전에 P4-001 exactscope·담당·허용 consumer·완료 조건을 총괄이 확정해야 한다. 보호된 세이브 형식·Q/E·2_3은 어느 단위에서도 변경 대상으로 삼지 않는다.

| 순서/제안 표식 | 플레이어 기능·작은 범위 | 원본 행 근거 | 소유 예정 파일(안) | 검증 아이디어(미작성·미실행) | 선행 조건·인수 경계 |
|---|---|---|---|---|---|
| TI-00 | actual INV 읽기 계약·원본 고정 fixture | G:15176,16174–16188; Godot N01–N02 | 신규 `godot/scripts/native_inventory_contract.gd`, 해당 `godot/tests/test_native_inventory_contract.gd` | 17slot 순서·null/빈 bag·같은 item identity·bone 분류·지원 안 되는 item 필드 보존. 현재 getter와 참조가 같은지 검사 | P4 exactscope. 기존 owner를 사용하며 별도 INV authority를 만들지 않음. **저장 필드 보호**. |
| TI-01 | 격자/자리 검사만 | G:16183–16210,16247–16256 | 신규 `native_inventory_layout.gd`, `test_native_inventory_layout.gd` | 1×1/2×2·10열 끝·초기120행 끝·skip·같은 카테고리 충돌·서로 다른 카테고리 같은 좌표·공간 없음 | TI-00. 처음에는 격리 fixture만, 실제 bag 쓰기는 owner 승인 후. |
| TI-02 | 정렬·필터·원 bag index | G:16213–16246,50129–50149,50212–50233,50278–50296 | 신규 `native_inventory_query.gd`, `test_native_inventory_query.gd` | fav/junk 우선순위·동점 안정성·rarity0/el0·귀걸이 합동 필터·숨김 item 불변·표시 index와 bag identity 불일치 방지 | TI-01. OPT 드랍 필터와 분리. 유니크 필터 버튼을 임의 추가하지 않음. |
| TI-03 | 읽기 전용 탭·격자·아이템 상세 | G:2927–3014,44049–44079,49522–49862; `ui-panels.js:165–218` | 신규 `godot/scenes/inventory_panel.tscn`, `native_inventory_panel.gd`, `test_native_inventory_panel.gd` | 부팅 전 미생성 P 접근0, 탭 전환1회 갱신·원래 노드/포커스 보존·hover/선택/휠·작은 창·한/영 긴 이름·이미지 폴백 | TI-00~02. main/hud 소유자와 pause·닫기·입력 우선순위 합의. Q/E·레슨 입력 함수 **보호**. |
| TI-04 | 런타임 장비 통계 refresh 접점 | G:16287–16292,16425–16432,27902–27971 | 신규 `native_inventory_refresh.gd`, `test_native_inventory_refresh.gd`; 기존 owner와 연동 지점은 §6에서 승인 | 현재 hp/mp/st/shield 보존, 최대치 감소 clamp·증가 시 무료 충전0, 캐시 무효화 순서, 실제 reader의 새 장비 소비 | N07~N10의 재사용 가능한 실제 API 확정. pre-Tree 단회 초기화를 다시 호출하지 않음. Q/E/2_3 공식 **보호**, 미지원 소비자는 미확인으로 남김. |
| TI-05 | 장착/해제·귀걸이 대상·강화/유물 전승 | G:16272–16380,28101–28104 | 신규 `native_inventory_equipment.gd`, `test_native_inventory_equipment.gd`; INV mutation 권위는 기존 state owner | reqLv 거절·귀걸이 빈칸/명시 대상·비용 부족 전체 차단·old enh/환수 순서·소켓 부족/9999 주머니·가방 자리 부족 해제 거절·같은 item 중복0 | TI-01/04, mats·crystal bag의 실제 owner 계약. 저장 caller는 **보호 경계**로만 기록하고 형식/복원 변경안 없음. |
| TI-06 | 비교 계산·CP 후보·상세2카드 | G:49467–49509,49865–49954 | 신규 `native_inventory_compare.gd`, `test_native_inventory_compare.gd`; TI-03 panel에 표시 연결 | ST비용/무게 역방향 good 판정·pct `%p`·-0·차이 임계값·cost 부족·임플리싯/소켓 전승·귀걸이 대상 차이. 성공/오류 후 P/INV/cache 참조 복구와 중첩 값·자원·mats·bag 영향을 원본 oracle와 비교 | TI-04/05. 실제 statDex·applyStats·CP 권위가 준비돼야 수치 비교 인수. 미지원은 0/정상값으로 대체하지 않고 미확인/NOT_READY 표시. |
| TI-07 | 단건 분해 경제식·잠금·1초 gate | G:16381–16397,28185–28200 | 신규 `native_inventory_salvage.gd`, `test_native_inventory_salvage.gd` | rarity5 경제 cap4·비정수/음수 rarity·tier2항·레거시 환수·_enhRefund max·fav 거절·연속 입력·선택 index 보정 | actual bag/mats writer 인수. 기존 G.mats 소비자와 충돌 없음 확인. 실제 세이브 사용0·**저장 보호**. |
| TI-08 | 선택/쓰레기 확인 분해 UI | G:50359–50406 | TI-07 owner + TI-03 panel, 신규 `test_native_inventory_bulk_salvage.gd` | 취소·중복 참조·확인 중 정렬/장착/삭제/fav 전환·필터 변경·현재 유효 item만 보상·장착 객체 제외 | TI-02/03/07. 선택 Set과 filtered junk snapshot의 서로 다른 범위 보존. 대장간 분해(C15)는 별도 caller로 추후 범위 확정. |
| TI-09 | 공유 보관함 탭·메모리 입출금 | G:48537–48609; `ui-panels.js:171–181` | 신규 `native_inventory_storage_view.gd`, `test_native_inventory_storage_view.gd` | 200개 가득 참·bag count 거절·원 객체 이동·좌표 null 후 render·선택 해제·양쪽 RMB·tab 재진입 닫기 | TI-03/05. **공유 저장·세이브 형식 보호**, 실제 persistence writer의 구현/마이그레이션은 이 순서안에서 제안하지 않음. |
| TI-10a | 유물 가방·품질·홈 장착/해제 화면 | G:15276–15330,15386–15396,15409–15794 | 신규 `native_inventory_relics.gd`, `test_native_inventory_relics.gd` | id/star/enh/q 분리그룹·브론즈1/실버41/골드81·slot 제한·빈홈·9999 반환 거절·focus 복귀·공명 q1 예외 | crystal effect/주머니 실제 owner를 먼저 인수. 유물 전투 효과 전체 구현으로 확대하지 않음. |
| TI-10b | 선택 소켓석 개방/승급만 | G:15796–15827 | TI-10a와 별도 신규 `native_inventory_socket_stones.gd`, 해당 테스트 | 정확 q1개 소비·최대5홈·낮거나 같은 q 거절·crystals/socketQ 길이·보석 유지·마지막 q 선택 해제 | TI-10a·STONE_BAG owner. 기존 아이템 필드를 그대로 사용, **세이브 형식 보호**. |
| TI-11 | 유골 도감 등록/해제·유골함 표시 | G:45788–45888,49991–50128 | 신규 `native_inventory_ossuary.gd`, `test_native_inventory_ossuary.gd` | r+t 상향만·4부위·가방 공간 확보 전 delete0·등록 실패 bag행·유골함1개 지급·초상 fallback | TI-01/03/05. 전대 소환 전투 자체는 별도 담당·선행 미확인. 도감 저장 필드 **보호**. |
| TI-12 | 바닥 획득→INV 연결 인수 | G:16411–16424,32932–32967 | **P2-006a 담당 파일·이름은 인계 전 미확인**, 이 작업에서 새 pickup owner를 중복 제안하지 않음 | 보이는 원본 우선순위·hold9tick·자리 실패시 바닥 유지·성공 정확1회·동일 drop 중복수거0 | **P2-006a WIP 인수 필수**. N03 생성/N05레코드만으로 완료할 수 없음. 차단된 펫 legacy를 복원하지 않음. |
| TI-13 | 인벤→원래 플레이 복귀 흐름 | G:44049–44079,13213,13250–13260,14150–14260; I:4340–4349 | 위 승인된 UI/owner의 통합 검사·실창 인수 계획, 신규 제품 writer 없음 | TAB/ESC/모달취소·원본 입력별 item identity·재배치 hover 무효화·닫은 뒤 입력 잔류0·보호값 불변·작은 창/언어/컨트롤러 접근 | 개별 단위의 격리 인수 및 실창 접근 권한. 실제 창·저장·패키지는 별도 허용 범위에서 인수, 이번 문서 작업은 실행0. |

**순서 보존:** 실패 시 원본이 아직 손대지 않은 필드와 이미 적용한 필드를 구분한다. 새 rollback·refund·재시도·전역 dedup 규칙을 임의로 덧붙이지 않는다. 인벤의 확인 후 identity 재검증과 대장간의 index splice 차이는 X/H 표와 별개로 C13~C15의 원본 계약 차이이다. 공용 통합이 필요하면 먼저 아래 지점을 담당자와 인수하고 신규 단위를 연결한다.

분해 경제 fixture의 기준식은 G:28185–28200 그대로 `econ=integer rarity>=0 ? min(rarity,4) : 0`, `rMul=[.5,.7,1,1.3,1.8][econ]`, `refund=~~(sum(i=0..enh-1,ceil(max(1,ceil((1+i*.15)*1.5))*rMul))*.5)` 및 양수 `_enhRefund`와 max, 최종 `base[econ]+refund+(tier||0)*2`이다. 강화 이전비는 G:28101–28104의 `_malCost(ceil(enh*1000))`, `_malCost`는 양수 입력에 `max(1,ceil(v*.5))`, 그 외0(G:28080–28085)이다. 이는 테스트 아이디어의 원본 기준이며 실제 코드를 추가한 것이 아니다.

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
