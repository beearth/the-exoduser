# 아이템·어픽스 원본 추적 및 작은 이식 단위 지시서

작업ID `trace-items` · 2026-10-20 KST · **문서 추적 완료 / 구현 미착수 / 총괄 검수 대기**. 산출물은 이 파일 1개다. 코드·테스트·설계 docs·WORK_BOARD는 수정하지 않는다. 아래 IT-01~IT-08은 후속 구현 순서안이며 구현 완료·파일 소유 배정 완료를 뜻하지 않는다.

## 0. 고정 기준·기존 작업 경계

| 항목 | 확인 결과 |
|---|---|
| fetch / 원본 기준 | 정상 `git fetch origin` 후 `origin/main=ad6ac68a2e009c4d299fe1dd2264182355ee992c` 고정. 요청된 최소 `ad6ac68a2`와 동일. 이후 원격 이동은 이 문서의 행 기준에 섞지 않는다 |
| 자기 worktree / branch | `/Users/fordeargamers/exoduser-wt/trace-items` / `codex/trace-items-20261020`; 위 main에서 새 worktree 생성 완료. 최초 INDEX/WORK tracked diff 모두 없음 |
| R | `/Users/fordeargamers/Projects/exoduser-migration-20261001`, branch `codex/mac-live-play-time-main-20261017`, HEAD `dd49171c5b88e211575a41f185395d6c0a14b184`; 시작 tracked INDEX/WORK 모두 없음. 파일·브랜치·인덱스 수정, 서버 재시작 없음. fetch로 공유 원격 ref를 갱신한 것과 R 체크아웃 변경을 구분 |
| 원본 | `game.html` 65,692행, SHA256 `4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4`; `index.html` 4,742행, SHA256 `36008f72723dbcbf1ae7b6af6b08dfe6299962e2445261139b6237082a24cf12` |
| 먼저 확인한 기준 docs | `orders/WORK_BOARD.md`(역할·진행 중·공용 파일·보존 WIP 포함), `FDG_GAME_DEVELOPMENT_PLAN.md`(P2-001c/P4-001·인수/보호 기준 중심), 병합된 `FDG_FEATURE_INVENTORY_20261020.md`(특히 :47~61, :523~1102). 기능 목록은 `2845f96e…` snapshot이며 최신 전체 진행률로 사용하지 않음 |
| 병합된 추적 | `FDG_SOURCE_TRACE_QUICKSLOT_20261020.md`, `FDG_SOURCE_TRACE_SAVE_20261020.md`, `FDG_SOURCE_TRACE_SETTINGS_20261020.md`의 원본·의존·단위·공용 접점 확인. 같은 원본 game/index 해시이나 각 추적의 기준 commit은 서로 다름 |
| 동시 인벤토리 추적 추가 확인 | **미병합 참고본** `~/exoduser-wt/trace-inventory/docs/engine/FDG_SOURCE_TRACE_INVENTORY_20261020.md`(로컬 branch `codex/trace-inventory-20261020` 당시 HEAD `647d9b6d…`)의 TI-00~13 경계 확인. main 적용 사실로 세지 않음. TI-10a/b는 유물 화면·장착·소켓석 mutation 담당안. 이번 IT-01은 그쪽에서 재사용할 순수 품질 계산만 제안 |
| 겹치는 작업 | P2-001c 처치 생성은 **의존만**; TRACE-INVENTORY 장착·격자·상세 패널, TRACE-META 경제/진행, TRACE-QUICKSLOT potionPower/potionCdRed, TRACE-SKILLS/WEAPONS 전투 consumer, TRACE-SAVE 복원은 해당 담당 경계. P2-006b 드랍 표시, P2-007a UI 글꼴, QA-002 테스트 소유 파일은 편집 대상 아님 |
| 특별한 관측 | WORK_BOARD :26의 P2-006a “main 병합” 기록과 달리 **이 기준 tree에는 `native_world_drops.gd` 및 world_drops/pickup_contract 테스트가 없다**. tracked Godot 전체 파일·`read_native_drop_records` caller를 확인했으나 표시/줍기 consumer 없음. 어느 다른 SHA에 구현됐는지는 **미확인**. 이를 이번 기준의 이식 완료 의존으로 승격하지 않음 |
| 보호 | `docs/2_3` **수정금지**, Q/E 의미·패링·blackBean Q 전용 규칙, 세이브 형식·구아이템 복원 **보호**. 이 문서는 추적/표시만 한다. Layer 10단·신규 uniqueId·어픽스 재설계·밸런스 수정·새 저장 필드 도입 제안 없음 |
| 검증 수준 | 원본 선언과 함수 본문·실제 godot 파일·기존 테스트의 단정을 읽고 대조. 이번 Godot 실행/테스트 재실행·import·GUI·PC 실행·저장 왕복은 **미확인**. 숫자 일부만 원본 함수 발췌를 Node VM에서 계산(§7). 실제 실행 source 앱은 열거나 갱신하지 않음 |

핵심 분모는 **AFFIX_POOL 409레코드 / 407개 고유 ID**다. `critDmgW`, `antiRevive`가 각각 슬롯 변형 2행이다. “55종”, 이름 사전 417키, `_AFFIX_DESC` 265키를 같은 분모로 세지 않는다. 전설19 / 유니크39 / 외관27(20개 base 풀) / 결정18 / 장비17슬롯을 각각 구분한다. 부록 A는 409행을 생략 없이 열거한다.

## 1. 원본 데이터·상수·함수·UI·저장 추적

이하 `G:`는 위 main의 `game.html`, `I:`는 `index.html`이다. 행 범위는 포함 범위. 부록의 “직접 참조 없음”은 **정적 literal 검색 없음**이며 간접·동적 소비까지 없다는 증명이 아니다. 저장 필드는 읽기 전용 추적이며 신규 schema를 제안하지 않는다.

### 1.1 정의와 생성 계약

| 구역 | 원본 행 | 데이터·수치·규칙 / 이식 경계 |
|---|---|---|
| 희귀도 | G:14346~14351 | `RARITY`는5문자열뿐이지만 이름/영문/색/배율은6칸. rarity0~5=일반/고급/희귀/영웅/전설/유니크; 색 `#aaa,#44cc44,#4488ff,#bb44ff,#ffaa00,#8e55e9`; 배율 `1,1.2,1.5,1.8,2.2,2.5`. 존재하지 않는 RARITY[5] 문자열을 임의 창작하지 않음 |
| 어픽스 슬롯·풀 | G:14364,14370~14856 | `_AFSLOT`17키: weapon→wpn,bow→xbow,helmet→helm,cape→cloak,necklace→neck,ring1/2→ring,headband/2→headband 등. 각 레코드 `{id,type,tiers,unit,slots,group,weight,brType?,tierW?,skewRoll?,minGrade?}`. 정확 전체 필드는 부록 A |
| 표시 사전 | G:14858~15013 | `AFFIX_NAMES_KO`417키, `_AFFIX_DESC`265키; 전부 실제 효과 정의는 아님. 동명 중복 key의 최종 JS 객체값과 원문 행을 구별. 표시 fallback은 이름 `af.id`, 설명 `''` |
| 임플리싯 | G:15016~15034 | 17정의. 슬롯 고정 1개, bracelet는 demon/life 분기. 생성 `_iv=lo+random*(hi-lo)` 뒤 소수2자리. `_implicitStat/_implicitVal/_implicitKo`; 소비 `_eqImplicit` 합산, pct implicit은 보통 ×.01. headband2는 headband 재귀 생성 후 slot만 교체 |
| 전설 | G:15037~15057,16125~16131 | 19정의 `{ko,stat,val}`. rarity>=4에서 **부위와 무관한 전체 풀 무작위 1개**, item.legendarySpecial와 동적 item[stat] 둘 다 저장. 유니크도 상속. 원래 출처 키를 슬롯 제한으로 해석하지 않음 |
| 유니크 외관 | G:15060~15083,16137~16140 | `UNIQUE_ART`20풀/27이미지. `_uniqueArtBase`: wtype 우선, bow/btype→crossbow, ring1/2→ring, headband/2→earring. 효과와 외관은 별도 무작위; `uniqueArt`와 name 지정. `uniqueId` 필드 없음. ossuary 제외 |
| 유니크 효과 | G:15084~15129,16133~16141 | 39정의. 고정12+신규25+패링2. rarity>=5에서 전체 풀1개. roll은 정수 양끝 포함 `lo+~~(U*(hi-lo+1))`; scale 있으면 `+(raw*scale).toFixed(4)`. `uniqueSpecial={ko,stat,val,secs,disp}` + 동적 item[stat]. secs=(raw/60).toFixed(1), disp=raw. 롤 없는 값에 secs/disp는 undefined(직렬화 때 생략 가능). 정의·행·stat 참조는 부록 B |
| 어픽스 추첨 | G:15131~15173 | `rollAffixes(grade,slot,brType)`; 슬롯/brType/DEMO 제외로 pre/suf 캐시. maxCount `[0,2,3,5,6,7]`; 홀수 PRE→SUF, 짝수 SUF→PRE 교대. 같은 group 제외. 후보 없음이면 반대 pool 보충하지 않고 continue |
| 추첨 티어 | G:15147~15168 | baseTier=grade>=4?2:grade>=3?1:0; lvBonus=`~~((P?P.lv:1)/200)`; maxTier=min(tiers.length−1,baseTier+lvBonus). tiers[0]==null 제외, minGrade>grade 제외. tierW는 `(a.tierW[i]\|\|1)` 가중. 그 외 rr=U 또는 U^skewRoll, cnt/val=`lo+~~(rr*(hi-lo+1))`, 나머지는 소수4자리. tierIdx의 비교순서까지 원문 유지. 5티어는 정의값 계단이지 모든 값이 5종 이산값인 것은 아님 |
| DEMO | G:16646~16650,15137 | build target 기본demo; 제외7종 `sharpAtk,brutalAtk,ruinAtk,overkilDmg,staggerExplosion,parryExplosion,elemConvert`. Godot 생성기는 정식 빌드로 제외 비활성(§3). 캐시 key에 grade는 없지만 minGrade는 매 추첨 검사 |
| 슬롯/부위 | G:15176~15178,15830~15891 | 17슬롯; 자연 드랍 pool은 ossuary 제외16. 장비크기 전부2×2, bonePart1×1; WTYPES7/BOWTYPES3. 무기 공격 동작은 TRACE-WEAPONS 범위, 여기서는 생성 데이터 의존 |
| mkItem 전반 | G:15894~16166 | 기본 item 리터럴 G:15954~15956, 부위별 수치 G:15958~16112, affix/implicit/특수 G:16114~16141, itemLv=min(900,floor((P.lv\|\|1)/10)*10),reqLv=max(0,itemLv−10) G:16143~16147. 모든 직접 field·행은 부록 E. **이미 P2-001c 생성 이식: 재작성하지 않음** |
| 자연 홈 | G:16148~16151 | 신규 장비는 rarity와 무관하게 `socketCount=0,crystals=[],socketQ=[]`. 1~4홈 자연 롤은 폐지. 홈 개방은 소켓석 UI 경로 별도 |
| 고정 유골함 | G:16155~16164 | rarity5/tier0/elP/unique=true, anc=iron_warlord,name 전대의 유골함,eDef60,bonusMp150,ancPow.25; bStr/bDex/bInt/bLck/bGrit 삭제; ancHP tier3/value.9 고정, 특수null/implicit_iAncPow10/reqLv0/0홈. 그 앞에 소비된 RNG/동적 property까지 제거됐다고 추정하지 않음. 수집/도감은 TRACE-INVENTORY |
| 드랍 생성 의존 | G:32002~32079 | rollDrop·몹등급별 가중치·dropCount·레벨/등급필터·bone/결정/소켓석 RNG는 **P2-001c 의존**. 생성값을 UI 구현 때문에 재롤하거나 새로운 RNG를 끼우지 않음. 전체 수치 표는 기존 생성기/FEATURE-INVENTORY에 연결하고 복제 구현 단위로 잡지 않음 |

### 1.2 결정·소켓·품질·재료

| 함수/상태 | 원본 행 | 정확 계약·소비 |
|---|---|---|
| 결정 정의 | G:15184~15211,15259 | 공격3슬롯, 방어6, 자원8, DEF union14. CRYSTAL_DEFS18개 `{ko,en,cat,slots,opts,col,form,sigil,svg}`; opts의 stat·base 순서까지 부록 C. legacy ID18개는 **저장 보호** |
| 성급·주머니 | G:15276~15288,15333~15334 | 성급 mul1/2/3.5/6/10, 비용mul1/1.5/2.5/4/7. CRYSTAL_BAG_MAX=STONE_BAG_MAX=9999, 초기[]/CRYSTAL_DUST0 |
| 결정효과 | G:15289~15296 | d/s 없으면 []; `mul=star.mul*(1+(enh\|\|0)*.1)*_qGemMul(cr.q)`; 각 opts base×mul. crystalVal은 첫효과 value\|\|0. 소켓 배율은 여기서 적용하지 않고 caller가 별도 곱함 |
| 결정강화비용 | G:15297~15300,28080~28085 | null crystal→Infinity; `_malCost(ceil(500*(1+(enh\|\|0)*.5)*STAR_COST_MUL[star]))`, malCost는 양수 `.5` 할인 후 ceil/최소1. CRYSTAL_DUST_COST=[50,200,500,1500,5000] G:15380은 별도 제작 소비. 경제 owner와 조율 |
| 품질 | G:15304~15319 | qRoll=1+~~(U*100); qTier=10−floor((clamp(q\|\|50,1,100)−1)/10), qGemMul=.75+.5×clamp(q\|\|50,1,100)/100. Q_GRADES 동(min1/#d19a5c),은(41/#e7edf3),금(81/#f2d388). grade는 tier 10단과 다른3구간. `_qGrp(t)`는 tier중앙 q `(10−t)*10+5`의 등급. `_crFuseQ`는 각 (c&&c.q)\|\|50 clamp 후 평균을 Math.round, 최종1~100/빈목록50 |
| 홈배율 | G:15322~15326 | crystals가 Array이고 해당 crystal truthy일 때만. socketQ Array의 해당 q\|\|1 clamp; b=(q−1)/99; `1+b*(q등급==cr.q등급?2:1)`. q100/gold 결정 →3, q100/silver →2. **같은 티어** 판정이 아님 |
| 공명 표시 | G:15327~15330 | crystal 없으면 false; q raw=`socketQ[si]\|\|1`, **q>1** 및 grade 일치. socketMul의 clamp와 표시의 raw q 읽기는 합치지 않음. q1/동 결정은 배율1·공명false |
| 소켓석 생성 | G:15336~15346 | hi=SI_TO_HELL[G.stage]\|\|0, B=min(.78,.42+.06×hi); t10→1 순 w=B^(10−t), U로 가중선택 후 q=(10−t)*10+1+~~(U*10). 이미 P2-001c 생성 이식, 신규 RNG 이식 단위 없음 |
| 자동 합성/강화 | G:15350~15379 | OPT.crAutoFuse/-Enh; fuse는 동일id/star3개→다음성급/enh0/q=선택3개의 반올림평균, star<4/cap gate. enh는 동일id/star2개+비용, enh<20, while 반복. 성공 묶음 끝 applyStats. star·enh·q·소모 순서 보존. 설정은 TRACE-SETTINGS/재화는 TRACE-META 의존 |
| 주머니 그룹/포맷 | G:15386~15405 | 그룹 key는 id/star/(combineEnh?0:enh)/q\|\|50; cat 필터. 표시 pct stats spd/crit/cdmg/drop, 나머지 단위표. 홈 배율은 `_crValStr(cr,mul)` 명시 인자로 전달 |
| 부착/분리 | G:15775~15794 | attach: item/crystals/index 및 빈홈 gate, 정의 slots 제한, 원cr 참조 대입→bag.splice→applyStats/SFX. detach: 존재+bag<9999→bag.push→null→applyStats. 저장 형식 변경 없이 TRACE-INVENTORY TI-10a가 mutation/UI 담당 예정 |
| 개방/승급 | G:15796~15827 | 정확 선택 q로 STONE_BAG 첫항목 소비. 개방 max5홈, null/q push/socketCount 동기, selection 고갈시null. 승급 cur>=q 거절, crystal 보존/socketQ만 교체. applyStats·dbSaveNow·재렌더는 원문 순서. TRACE-INVENTORY TI-10b와 중복 구현하지 않음 |

### 1.3 합산·실효·캐시·일시 상태

| 함수/소비 | 원본 행 | 추적·공식 및 소유권 |
|---|---|---|
| equipped getters | G:16499~16511 | wp/sh/bt/ar/hm/bw/gl/pt/blt/nc/rg1/rg2/cp는 해당 장비 또는 {}. 별도 장비 authority 생성 금지 |
| `_uEq` | G:16513 | SLOT_NAMES 순 첫 **truthy** item[stat] raw값 반환, 없으면 0. uniqueSpecial.val 합산/최댓값선택 아님. 0은 건너뛰고 음수는 truthy. Godot combat_stat_formula에 존재 |
| 신규유니크 상태 | G:16516~16525 | `_uqS={stage:-1,parryOrbT:0,kiPreT:0,warpT:0,gwRefund:0,iceCastId:0,iceUsed:0,iceHit:null,shieldBankT:0,shieldBankAmt:0,shieldBankCd:0,poiseOrbT:0,turretHits:0,lastShock:null,circuit:null,csEchoUsed:false,hdF:-1}`; ctx3개 `_uqFzCtx/_uqHitCtx/_uqScCtx`. `_uqReset`은 위 객체 모든 key를 초기 literal로 다시 만들지 않음(예 iceCastId/stage 등 대입목록 구별). P._uqRageLatch false, G._uqZoneQ.length0. **영속 저장 없음** |
| 기동 환급 | G:16527~16534 | warpT>0 gate→token0→_uWarpStepRefund>0/cost>0→min(cost×값,게이지빈칸), feedback. TRACE-WEAPONS/기동 경계 |
| 철거 일제사격 | G:16536~16554 | shots=min(~~_uTurretSalvo,~~(turretHits/10)), 즉시 hits0; 피해 max(1,~~(bowRef×statDex×pBowMul×.40)); 거리900 타겟 정렬·순환, 속도18/r3/maxDist900/_uqEcho. 투사체·스킬 owner 선행 |
| 공유 frame | G:16557~16605,32725 | stage 변경→_uqReset; 양수 token6개 -=sp(0 clamp 없음), 분노상승 edge 1회→쿨차감, circuit300f/15f 틱/적당60f/폭30+e.r, source time G.playTime. 자식덫 큐는 장판 루프 밖 push/clear. 자체 새 clock로 대체 금지 |
| 전설 cache | G:16610~16626 | `_lEqRebuild`: 슬롯순 legendarySpecial.stat 확인→item[stat]===undefined이면 val 복원→cache에 첫 undefined key만 저장. `_lEq`는 cache값\|\|0. unique first-truthy와 달리 전설 첫0도 cache 선점. `_legSpKo`는 stat→현행 ko fallback. Q/E 윈도우 helpers :16622~16623은 **보호** |
| cache 무효화/스탯 | G:16287~16292,16425~16432,27902~27971,27992~27999 | recalcSt가 affix/stat/legend cache null. `_eqAffixRebuild`는 슬롯순 `(+a.value\|\|0)` 합산, val 필드 아님. `_eqImplicit`는 같은 stat의 `(+_implicitVal\|\|0)` 합산. applyStats의 결정합산은 `crystalEffects(c)×socketMul(item,ci)` 후 P._crystalStats. 개별 스탯 전체 이식은 inventory refresh/meta 담당과 조율 |
| 전투 효과 | 부록 A·B 및 G:42192~43112 | 어픽스별 직접 `_eqAffix('id')` 행을 전부 부록 A에 색인. 생성/합산/tooltip만 존재하는 ID를 자연 전투 구현으로 세지 않음. hurtE/hurtP/doParry/skill/투사체의 숫자·조건은 해당 consumer owner가 원본 범위를 인수해야 함. 보호 Q/E분기는 추적만 |
| 등급·소켓 정렬점수 | G:16434~16488 | itemPower: special있으면 +120/+200, crystalEffects 합×2×socketMul. CP/compare G:49467~49509/49865~49954와 다른 수식. 이번 새 점수 구현안 없음 |
| 리롤 | G:50458~50460,50790~50840 | REROLL_COST=_malCost(200)=100. 등급>=1 장착목록, mats gate·차감→rollAffixes(rarity,slot) (**brType 전달 없음**)→SFX/text/recalcSt/applyStats/render/dbSaveNow. brType 누락을 임의 수정하지 않음. P2-001c roll_affixes는 재사용만 |

### 1.4 UI·아이콘·플레이 접점

| UI/처리 | 원본 행 | 실제 동작 / 담당 경계 |
|---|---|---|
| 인벤/대장간 DOM | G:2927~3014,44049~44079,50151~50406 | 인벤 탭·닫기·장착·격자·선택·분해는 TRACE-INVENTORY. 기존 부모 DOM 보존 규칙 적용. 아이템 규칙 모듈에서 HUD/패널을 생성하지 않음 |
| 아이템 그림 | G:27786~27817 | `_itemSkin`: uniqueArt→`img/ui/unique-items/<id>.png`, 공통 컷아웃·기본/원소 skin→phys→SVG 경로. uniqueArt는 정체성/효과 ID가 아님. 이미지 로딩 실패와 source guard는 별도 |
| 월드 그림/빔 | G:27818~27889,52500~52561 | `_worldItemSkin`은 `<id>_cut.png` 투명 원화 경로; 공통cutout src동일성 guard, phys fallback/black mask24~72. `_getWorldDropBeamTier` :27824~27828은 layerLv>=1→min(10,~~layerLv), 아니면 `[0,2,3,4,5,6][rarity]\|\|0`. layerLv 생성 기능은 미구현. worldItems cap20 G:16721. P2-006 표시 담당 범위 |
| 상세/비교 | G:49522~49664,49730~49862,49865~49954 | `_invCardFields`: 기본/implicit/affix/전설/유니크/홈표시. affix PRE청록/SUF금, 상세값은 `_affixDetailValStr`; 유니크 ko를 번역 후 {s}/{p}/{n} 치환. disp없으면 scale로 역산, roll위치 >=2/3 상옵, >=1/3 중옵, 나머지 하옵. 특수 박스 자수정·라일락, 홈은 동/은/금+공명 표시. 패널·CP는 TRACE-INVENTORY |
| 숫자 포맷 | G:50422~50441 | 상세 pct/prob **finite number만** round(value×10000)/100, −0→0, 양수+/%; 그 외 compact fallback. compact null→'', 미등록→String(value), pct/prob→~~(value×100)%, dps→/s,tick→(value/60).toFixed(2)+초/s,atk→ATK×~~(v×100)%,hp→~~(v×100)%HP,기타 positive+. 상세와 대장간 compact를 하나로 통일하지 않음 |
| 이름 | G:50442~50456 | `_T(it.name)`에 affixes 첫 type0 접두, 첫 type1 접미 [이름]; fallback이름 ''. `!it.affixes`일 때만 legacy prefix/suffix. 빈 배열은 JS truthy라 legacy 안 붙음. 기존 name/uniqueArt 임의 덮어쓰기 금지 |
| 유물 화면 | G:15407~15794,49608~49625 | renderInvCrystals/renderCrystalBag, 정확 q 선택·빈홈·공명·picker focus 시작/복귀; _SOCK_POS c/tl/tr/bl/br. 품질 연산은 IT-01 재사용 예정, 화면/mutation은 TI-10a/b 소유안 |
| 획득·보관 | G:16293~16424,32932~32976,35631~35633,41464 | equip/unequip/pickupItem·manual/pet 소비는 TRACE-INVENTORY/P2-006. 처치 생성 레코드≠바닥 표시≠실제 줍기. 원본 자동수거 제거 주석은 복원 지시 아님 |
| 퀵슬롯·설정 | G:28224~28229,35892~35910,48873~49438 | potionPower/potionCdRed/전설벨트, OPT.crAutoFuse/crAutoEnh/드랍필터는 관련 TRACE-QUICKSLOT/SETTINGS에 위임. Q/E/저장 **보호** |
| 로비 index 전수 검색 | I:1~4742, 특히3522~3797·4340~4349 | affix/rarity/socket/crystal/uniqueArt/uniqueId/legendarySpecial/uniqueSpecial/stoneBag/crystalBag(대소문자 무시) 일치0. 아이템 데이터·함수·상세 UI·직렬화 producer 없음. 슬롯 API/새 캐릭터·game.html 라우팅만. 외부 모듈/서버 동적 데이터 전체 부재까지 증명하지 않음 |

### 1.5 저장 필드·마이그레이션 (**보호: 추적만**)

| 위치 | 원본 행 | 포함 필드/순서 / 보호 |
|---|---|---|
| 최초 저장 | G:3533~3576, 특히3551/3559 | inv.bag/equipped/ossCollect 전체 객체; crystalBag/crystalDust/stoneBag,bagMax,storage{}. 아이템은 whitelist가 아니므로 id/기본스탯/affixes[{id,tier,value}]/implicit/legendarySpecial/uniqueSpecial/동적special stat/uniqueArt/enh/crystals/socketQ/socketCount/좌표/fav/junk 등 own enumerable JSON 가능 필드 포함 |
| 실제 후행 override | G:63898~63940, 특히63912/63917 | dbSave가 재할당됨. 같은 inv·결정/소켓석 payload가 포함되며 shared mats/storage flush가 별도. 최초 dbSave만 근거로 실제 저장 완성을 주장하지 않음 |
| 다른 저장 producer | G:62000~62018,62135~62161,64057~64090 | DEMO500/검수 신규/새캐릭터 payload 차이는 `FDG_SOURCE_TRACE_SAVE` 부록 C에 있음. 결정/소켓 필드가 모든 producer에 동일하게 있다고 일반화하지 않음 |
| 아이템 복원 | G:3628~3683 | bag/equipped 원객체, belt/bracelet/ossuary/headband2 기본키, brType=demon 수리, ???이름·shield이름·bow타입·legacy prefix/suffix→affixes, 무기공속/이름마커. uniqueArt 있으면 무기이름 수리 제외(:3677). **추가 수리/재롤/신형uniqueId 이관 금지** |
| 결정·홈 복원 | G:3754~3766 | crystalBag/dust복원, stoneBag는 Array+number q1~100만, 결정legacyID 변환+q범위밖50. socketCount미정이면0/crystals=[], socketQ는 crystals 길이만큼 부족·잘못된값1/초과절단. bag/equipped/storage에 적용. 결정 q와 socketQ는 range 비교만 하므로 문자열/소수까지 숫자 정수 검사와 동일하다고 주장하지 않음 |
| 동적·일시 상태 | G:16516~16525,16130/16141 | item[stat]는 item 전체 직렬화로 보존. `_uqS`/contexts/timer·cache는 위 saveData 직접필드 없음; 영속화 대상으로 추가하지 않음. 원본 save artifact를 읽거나 쓰는 테스트는 이번 범위 밖 |

## 2. docs/7아이템디자인/와 원본의 불일치 (표로만 보고, 수정0)

설계 변경 지시가 아니다. 과거 제안·검수 이력은 현행 구현 요구와 구분한다. 폴더15문서의 분모·해시는 부록 F, 원본409레코드의 수치는 부록 A다.

| ID | 문서·행/서술 | 현행 원본·근거 | 판정·경계 |
|---|---|---|---|
| D01 | “어픽스55종”; 아이템_어픽스_시스템 :3/133/151/178의397/399; 현황분석 :13·Layer전수매핑 :1의402/400 | G:14370~14856=409레코드/407ID | 분모 불일치. FEATURE-INVENTORY :58과 이번 추출은 일치 |
| D02 | 아이템_어픽스_시스템 :65/80, full :415의 유니크 빨강 #ff4466 | G:14350 #8e55e9,49844~49846 자수정 박스 | 낡은 현행 표현. 카탈로그 :175~181의 후행 기록은 일치. 드랍 빔6단 빨강은 별도로 남음 |
| D03 | full :1040 자연 홈1~4 유지 | G:16148~16151 신규 장비0홈 | 불일치. 자연 홈 RNG를 재도입하지 않음 |
| D04 | full :1040 홈·유물 **티어** 일치 공명 | G:15325/15330은 Q_GRADES id 비교 | 등급3구간과 티어10단 혼동. q41/80은 tier6/3이어도 둘 다 silver라 공명 |
| D05 | ITEM_TEAM_MASTER :13, 적용계약 :3~16/55, TOP8_HOOK_REVIEW :3의22종·12효과·uniqueId 미연결 | G:15060~15127 외관27/효과39,16139~16141 uniqueArt 연결; uniqueId 검색0 | 당시 이력. 현행 외관은 연결됐고 별도 uniqueId는 없다. 새 schema 도입 요구로 사용하지 않음 |
| D06 | 유니크_어픽스_리스트 F/G의 외형·보라색 미구현 및 D/E 후보표 | G:15060~15083/16139~16140/27806/27866/49844 | 후보/샌드박스 이력과 현행이 섞임. 카탈로그 후행 연결 기록은 일치. 과거 웹25효과 PASS를 Godot39효과 PASS로 전환하지 않음 |
| D07 | 적용계약 §3의 UI-06/22→helmet, UI↔U-D 일대일 제안 | G:15080 earring06/22,15072 helmet17; 효과·외관 독립 추첨 | 실제 연결 정책과 다름. 원화ID를 효과ID로 쓰지 않음 |
| D08 | full :116~195/200~267의3티어 구풀·lifeSteal/movSpd/critChance/killHeal | 현행 G:14370~14856/부록 A의 키와 tiers | 과거 교체 계획. 이름 사전에만 남은 키를 활성 풀로 세지 않음 |
| D09 | 아이템_어픽스_시스템 :13~18 일반화한 5티어 스케일 | G:14375~ poisonDot5/8/14/22/32,fireDot6/10/17/26/38 등 | 예시를 전 ID의 공통값으로 쓰면 불일치. 실제 이식값은 부록 A |
| D10 | 같은 문서 :99~118 슬롯 풀 근사치·:145~151 합계397 | 현재409행+brType/minGrade/DEMO 분기 | 현재 추첨 확률의 정확 분모로 사용할 수 없음 |
| D11 | 아이템_어픽스_시스템에 ancDmg/ancHP/rageDmg/rageMaxFlat 언급 없음 | 부록 A의 활성 정의, G:16160 고정 ancHP .9 | 현행 정의 누락. 슬롯별_어픽스_풀에는 rageDmg/rageMaxFlat/vitFlat 언급 없음 |
| D12 | Layer전수매핑402의 ID 목록 | 현행 ancDmg/ancHP/kiSlashFullCrit/kiSlashParry/maliceWeakAmp/rageSkCrit/rageSkDmg 7ID가 빠짐 | 402→409 차이. critDmgW/antiRevive 중복 레코드는 유지 |
| D13 | Layer재분류 :895/965~1023의20어픽스·layer/sub/layerLv·추출흡수 | G:15142 maxCount[0,2,3,5,6,7], 정의에 layer/sub 없음. mkItem의 layerLv 쓰기 없음,27826 reader만 있음 | 명시된 미구현 설계. 이번 이식안에 10단/키스톤/신규 저장 필드를 끼우지 않음 |
| D14 | Layer재분류 :917의 lastStand/reviveOnce 드랍 버그 수정 계획 | G:14463/14464 tiers[0]=null,15149/15153 후보 제외 | 현재도 추첨 불가. 정의 존재만으로 자연 드랍 가능 판정 금지. 임의 수정 없음 |
| D15 | 유니크_어픽스_리스트 H의 _uDaggerPierce 실효 없음 관측 | G:15086 정의 및 부록 B 참조; 반사탄 consumer와 대입값 구별 | 부여·정의만으로 실효 인증 불가. Q/E 보호라 수리 범위 아님 |
| D16 | full STEP5/8의 applyAffixStats/removeAffixStats/rerollPrefix/rerollSuffix 제안 | 현재 G:27970/27971 캐시 합산,50460 전체 배열 리롤 | 현재 함수와 과거 제안 함수를 중복 작성하지 않음 |
| D17 | 아이템_어픽스_시스템 :91~97 floor PLv/200 | G:15148은 ~~ 연산, grade>=4에 unique도 포함 | 정상 양수 레벨에서는 일치. 비정상 입력 전체 JS 동등성은 미확인 |
| D18 | WORK_BOARD :26의 P2-006a 병합·world_drops/pickup_contract 테스트 | 이번 기준 tracked godot tree/caller에서 미발견 | 상태 기록과 기준 트리 불일치. 해당 구현 SHA는 미확인, P2-006b 담당 범위 보존 |

## 3. 실제 Godot 파일·테스트로 확인한 의존과 미이식

경로는 `godot/` 상대다. 파일 본문과 테스트 단정을 직접 확인했다. **기존 테스트를 읽은 근거와 이번 실행 PASS는 다르다.** 주석의 옛 원본 행 번호는 이번 main과 재대조했다.

| 의존 | 실제 파일·행 | 확인 범위·한계·테스트 |
|---|---|---|
| 생성기·정의 | `data/item_generation_tables.json`; `port_modules/kill_reward/drop_item_source.gd:20~28,50~126,129~421,433~550` | Node로 추출한 AFFIX_POOL/_AFSLOT/IMPLICIT_TABLE/LEGENDARY_SPECIAL/UNIQUE_ART/UNIQUE_SPECIAL/SLOT_NAMES/CRYSTAL_DEFS/CRYSTAL_STAR/Q_GRADES/RARITY_MUL **11집합 내용·배열 순서 일치**. P2-001c 의존으로만 표시 |
| 생성기 테스트 | `tests/test_p2001c_kill_rewards.gd:75~125,180~283` | all-miss4롤/weapon rarity0 43롤/어픽스 수/crystal7롤 q51/실제 처치 기록 단정.39효과·소켓·409행 전투 소비를 전수 검증하지 않음 |
| 생성기 차이 | `drop_item_source.gd:62,94~122` | DEMO 제외 비활성. JS cnt/val은 lo+trunc(product), native는 trunc(lo+product). 현재 정상 정수 lo 범위를 넘는 일반 동등성은 미확인. tierW0의 JS fallback1과 native null/missing 처리도 다름. 보고만 함 |
| 시작 아이템 | `port_modules/starter_item_factory_source/producer.gd`; state`:751~825` | pre-Tree 시작 전용, rarity>=5 미지원. `test_native_main_source_starter_state.gd:138`의 actual inventory affix reader 단정은 자연 장착/리롤 검사가 아님 |
| 실제 상태 권위 | `scripts/native_source_new_run_state.gd:175~185,400~414,528~566` | INV getter·드랍 기록·결정/소켓석 bag 반입 있음. dust/부착/합성/재료 소모 UI 없음. 중복 INV/bag 권위 생성 금지 |
| 처치→드랍 기록 | `scripts/native_normal_enemy_hurte.gd:691~734`; state`:528~548` | roll_drop→append_native_drop_records,cap20. tracked godot 전체에서 바닥 표시·줍기 consumer 및 보드에 적힌2테스트는 미발견 |
| 어픽스 reader | `port_modules/equipment_affix_reader/producer.gd:105~225` | cache token/capture/restore/invalidate/rebuild·(+value 또는0) 부분 지원. starter_state`:138`, `test_p1002e_melee_hurte.gd:185~207`의 실제 reader 관측.409효과 완료 증거 아님 |
| implicit/unique | `port_modules/combat_stat_formula/producer.gd:248~308` | u_eq 첫 truthy/eq_implicit 합산 있음. melee_hurte 테스트에서 _uAxeLeech 등 provider 관측. tooltip/외관/롤 등급 표시는 없음 |
| 전설 reader | formula`:515~553`; `scripts/main.gd:2529~2645`; state`:1007~1066`; services`:627~644,770` | Main 소유 l_eq cache와 실제 권위 연결 있음. 전설19효과 실효/장비 교체 전체 인수는 별개. 새 singleton 불필요 |
| 결정 계산 | `port_modules/player_crystal_resource_source/producer.gd:233~285` |18 opts·5 star의 기본 계산은 있지만 **_qGemMul 없음**. 현행 원본 q에 대해서 부분 이식. q51 드랍 테스트 통과와 품질 효과 적용은 별개 |
| 결정 합산 caller | `port_modules/player_resource_parameters_source/producer.gd:405~444,460~554` | 장착 결정→provider(c)→합산. **item/socket index 전달과 socketMul 곱 없음**. IT-03/04에서 기존 owner와 접점 조율 필요 |
| 일부 효과 consumer | `scripts/main.gd:1870,2223`; `native_normal_enemy_hurte.gd:395,562,809,912` | _uGloveSpd/_uHelmMagic/axe/mace/club/poiseorb reader 접점 있음. 조회 후 미연결 효과까지 완료로 세지 않음 |
| 미이식 | tracked scripts/port_modules/tests 전체 검색 | _uqFrame 전체 상태 owner, 품질/공명 API, 상세 formatter/full tooltip, 전설19/유니크39 전수 소비 검사,리롤/부착/분리/홈 개방·승급/자동합성 UI 미발견. 파일명 추정으로 존재 판정하지 않음 |

## 4. 작은 이식 단위 순서안

다음차례구현은**IT-01만**으로한다. 새fetch후base/보드/INDEX/WORK/동명파일을다시확인하며이미구현됐으면중복생성하지않는다. 아래각단위는원본 공식그대로 를목표로하며새상수/효과를설계하지않는다. 파일경로가새후보인경우소유확정·실제생성은미착수다. 각단위구현에는관련docs동기화가별도로필요하나이번추적은새문서만수정한다.

### 4.1 IT-01 — 품질·소켓 공명 순수 계산 (구현 지시서)

다음 구현은 이 단위만 착수한다. **공용 제품 파일 0줄**, 새 모듈과 새 테스트 2개가 기본 범위다. 게임에 연결하지 않고, 후속 인벤토리 화면과 자원 계산에서 재사용할 원본 수학 계약을 먼저 확보한다.

| 항목 | 구현 지시 |
|---|---|
| 만들 파일 | `godot/port_modules/item_quality_source/producer.gd`, `godot/tests/test_native_item_quality_source.gd`. 둘 다 기준 tree에 없다. 기존 코드·테스트·project.godot 수정 0. 후속 구현 때 관련 docs 동기화는 별도로 수행한다 |
| 원본 범위 | G:15305,15308~15316,15319,15322~15330. Q_GRADES, qTier, qGemMul, crFuseQ, socketMul/socketResonant만 옮긴다. qRoll/소켓석 RNG·crystalEffects 전체·장착·재료 소비·UI는 제외한다 |
| API | `extends RefCounted`; `quality(q:Variant=null)->Dictionary`, `fused_quality(list:Variant)->Dictionary`, `socket(item:Variant,index:int)->Dictionary`. class_name/global 등록은 필요 없다. 반환 Dictionary는 저장 schema가 아닌 일시적 계산 결과다 |
| 반환 계약 | quality READY: `{status,ready,q,tier,grade_id,ko,en,color,gem_multiplier}`. fused_quality READY: `{status,ready,q}`. socket READY: `{status,ready,multiplier,resonant}`. 미지원은 NOT_READY/ready=false/reason을 반환하며 정상 효과값을 공급하지 않는다 |
| 상수 | Q_GRADES 3행을 원본 그대로 const로 두고 테스트에서 기존 `item_generation_tables.json.Q_GRADES`와 대조한다. q fallback50, socket fallback1, 상한100, 등급 경계41/81, 분모99, 품질 배율 .75/.5, 공명 보너스2를 유지한다. 전체 어픽스/특수효과 풀은 복사하지 않는다 |
| 지원 입력 | 1차 지원은 finite int/float와 null/누락이다. q=0/−0/null/누락은 JS `q\|\|50`대로50, 음수는1, 100 초과는100. **소수는 반올림하지 않는다.** bool/string/배열/객체/NaN/±Inf는 명시적으로 NOT_READY. 이는 원본 JS coercion 전체 이식이 아닌 부분 지원이다. 저장값을 수리하여 지원 영역으로 바꾸지 않는다 |
| quality 순서 | raw q의 falsy50 → clamp → tier/grade/gem. grade는 q>=min인 마지막 정의다. tier 10단과 grade 3종을 구분한다. qGrp가 필요하면 tier의 중앙 q `(10-t)*10+5`를 quality로 조회한다. locale 서비스나 DOM label을 여기서 만들지 않는다 |
| fuse 순서 | null/빈 Array는50. 각 요소는 null 또는 q를 가진 Dictionary만 지원하며 q 누락/null도 허용한다. 요소별 `(q\|\|50)` clamp → 합/length → JS Math.round → 최종 clamp. 양수 평균이라 floor(x+.5)를 쓸 수 있다. 음수 tie의 일반 동등성을 주장하지 않는다. 입력·배열 순서·enh/star는 변경하지 않는다 |
| socket 순서 | item null, crystals 누락/비Array, 비어 있거나 범위 밖인 칸은 원본의 multiplier1/resonant=false. 정상 item/crystal Dictionary만 지원한다. socketQ 누락/짧음/null/0은1, crystal.q 누락/null/0은50. multiplier는 socket q를 clamp하고, resonant는 **raw socket q>1**을 유지한다. star/id 등록 검사와 배열 수리는 원본 socket 함수에 없으므로 추가하지 않는다. 미지원 truthy primitive crystal은 NOT_READY |
| 부수효과 | item/crystals/socketQ/list 읽기만 한다. 수리·배열 길이 변경·선택 상태·파일 IO·RNG·Input·clock·Main·INV·P writer 0. `_crBagGroups`, 부착/분리, 소켓석 소비를 포함하지 않는다 |
| 격리 폴더 | **`EXODUSER-IT01-Quality-Isolated-20261020`**. 테스트 첫 단계에서 effective `application/config/use_custom_user_dir=true`, `custom_user_dir_name` 정확 일치, `OS.get_user_data_dir()` suffix를 단정한다. 불일치면 성공 skip 없이 exit1. 제품 project.godot/공용 override.cfg는 수정하지 않는다. 실행 전용 격리 설정을 공급할 승인 경로가 없으면 실행만 BLOCKED로 보고한다 |
| 테스트 구현 | 아래 고정 기대값과 §7의 원본 함수 VM 결과로 검증한다. 기본 범위는 새2파일이다. 추가 Node oracle 테스트가 필요하면 `test/nativeItemQualityOracle.test.cjs`를 후속 범위에 명시한 뒤 작성한다. 기존 제품 API를 테스트용 값으로 바꾸지 않는다 |
| 완료 기준 | 새 모듈 parse 및 격리 테스트 exit0/실패0/검사수>0/ERROR0. 아래 경계·입력 불변·미지원 단정 모두 포함. 실제 연결0/게임 화면 미검수/전체 소켓 이식 미완료를 보고한다. 실패 로그를 보존하고 소유 범위 안에서 수정한다. 권한/환경 차단은 우회하지 않는다 |
| 선행·충돌 | P2-001c JSON은 readonly. TI-10a/b에서 이 모듈을 사용하도록 접점을 인계한다. 공용 파일을 수정하지 않아 TI-03/P2-007a/QA-002와 쓰기 충돌이 없다. 착수 시 같은 이름의 파일이 이미 있으면 중복 작성하지 말고 BLOCKED/담당 조율로 보고한다 |

IT-01의 **필수 단정**:

| 그룹 | 입력 | 기대값 |
|---|---|---|
| fallback | null/누락/0/−0 | q50, tier6, silver, gem1.0 |
| 경계 | q1/10/11/40/41/80/81/90/91/100 | tier10/10/9/7/6/3/2/2/1/1. grade는1~40 동,41~80 은,81~100 금 |
| 숫자 | q−1/101/40.5 | q1/100/40.5. 40.5는 tier7/bronze. 반올림하지 않음 |
| 빈 홈 | null item, crystals 없음/비Array/[]/[null], 범위 밖 index | multiplier1, resonant=false, 입력 보존 |
| 공명 | socket1/crystal1;40/40;40/41;41/41;80/81;100/100;100/50 | 각각1/F,1+78/99/T,1+39/99/F,1+80/99/T,1+79/99/F,3/T,2/F |
| 누락 품질 | crystal.q 없음; socketQ 없음/짧음/0 | crystal fallback50, socket fallback1 →1/F. crystal.q0도50 |
| 등급과 tier | socket41/crystal80 | tier6/3으로 다르지만 silver이므로 1+80/99, 공명 true |
| 합성 | null/[];[q1,q50,q100];[q40,q41];[null,q0,q100] | 50;50;41;67. 양수 tie는 Math.round 그대로 |
| 미지원 | q 문자열/bool/객체·NaN/Inf, 잘못된 truthy crystal shape | NOT_READY, 명확한 reason, 정상값 위장 없음 |
| purity | nested item/list 참조·원값·배열 길이 전후 비교, 반복 조회 | mutation0/RNG0/파일쓰기0/Main생성0. 결과 로그만 격리 출력 |

### 4.2 IT-02 이후 순서 (미착수)

각 행은 독립 인수할 작은 범위다. 모든 테스트는 새 파일 후보이며 격리 폴더명과 effective 경로를 먼저 단정한다. 기존 공용 파일 수정은 해당 담당이 정확 접점을 인수한 뒤 진행한다.

| 단위 | 만들/수정할 파일 | 원본 행·옮길 상수/공식 | 새 테스트·핵심 단정·격리 폴더 | 선행·충돌 |
|---|---|---|---|---|
| IT-02 어픽스·등급 표시 모델 | 신규 `godot/port_modules/item_presentation_source/producer.gd`, `godot/tests/test_native_item_presentation_source.gd`; 공용0줄 | G:14346~14351,14858~15013,50422~50456. 상세 round×10000/100/−0와 compact trunc/tick60/atk/hp, 첫 PRE/SUF 및 legacy 이름 조건. AFFIX_POOL은 기존 JSON 사용 | null/미등록/0/음수/작은 소수, 두 formatter 차이, 빈 배열 truthy, 중복ID first find, 번역 callback. `EXODUSER-IT02-Presentation-Isolated-20261020` | IT-01과 독립 가능. 실제 패널은 TI-03 담당. 전체 번역/화면 연결은 별도 |
| IT-03 결정 품질 배율 | 기존 `godot/port_modules/player_crystal_resource_source/producer.gd` mul 계산, 신규 `godot/tests/test_native_crystal_quality_effects.gd` | G:15289~15296. star×enh에 IT-01 gem multiplier를 원본 순서로 곱함. 기존18 opts/5 star 재사용. 홈 배율은 아직 제외 | q1/.755,q50/1,q100/1.25,enh0/20, 잘못된 d/s의 원래 빈 결과, 미지원 오류/순서/입력 보존. `EXODUSER-IT03-Crystal-Quality-Isolated-20261020` | IT-01 및 기존 crystal/resource owner 인수. 초기 자원 기대값 영향 검수. Main/저장 형식 변경0 |
| IT-04 장착 결정의 홈 배율 합산 | 기존 `godot/port_modules/player_resource_parameters_source/producer.gd` 순회/accumulate seam, 신규 `godot/tests/test_native_equipped_socket_multiplier.gd` | G:27934~27939. c만 전달하던 경로에 item/ci를 사용해 각 value×socketMul 후 합산. 17슬롯·결정 순서 유지 | 빈칸 skip, 서로 다른 홈 q, 정확1회 곱, 지원 상실/packet 오류 시 부분 쓰기 금지. `EXODUSER-IT04-Socket-Sum-Isolated-20261020` | IT-01/03·resource owner. provider 시그니처 임의 변경 금지. TI-04 refresh·TI-10a와 조율 |
| IT-05 특수효과 툴팁 모델 | 신규 `godot/port_modules/item_special_text_source/producer.gd`, `godot/tests/test_native_item_special_text_source.gd`; 공용0줄 | G:16625~16626,49822~49847. stat 역색인, disp 우선/scale 역산, secs 문자열 보존,1/3·2/3 라벨. 기존19/39 정의 재사용 | 39종 placeholder 소거, 하/중/상 경계, disp 없는 구아이템, 고정효과 라벨 없음, 전설 ko fallback. `EXODUSER-IT05-Special-Text-Isolated-20261020` | IT-02/locale 계약. TI-03 화면 담당과 별도 연결. 저장값 변경0, 외관/효과 독립 |
| IT-06 단건 리롤 메모리 명령 | 신규 `godot/port_modules/item_reroll_source/producer.gd`, `godot/tests/test_native_item_reroll_source.gd`; 실제 writer adapter는 권위 인수 후 | G:50458~50460,50837. 비용100, rollAffixes(rarity,slot)의 brType 미전달 그대로. 기존 P2-001c 생성기·주입 RNG 재사용. 성공 후 cache/recalc/apply 순서 | mats99 거절/RNG0,100 소모, affixes만 교체, implicit/special/socket/name 보존, bracelet 후보 차이. `EXODUSER-IT06-Reroll-Isolated-20261020` | META 재화·TI-04 refresh·INV writer 필수. 없으면 readonly 계획까지만, 새 mats writer로 우회 금지. 저장 보호 |
| IT-07 결정 합성·강화 순수 계획 | 신규 `godot/port_modules/item_crystal_craft_source/producer.gd`, `godot/tests/test_native_item_crystal_craft_source.gd` | G:15297~15300,15350~15380. 같은 id/star3개 합성·2개 강화, q 평균,enh<20,기존 STAR_COST_MUL/먼지cost·splice 순서 | 재료2/3 경계, 최상 성급 거절, 평균50/67, ceil/할인/부족 불변, index 조정, 묶음 끝 applyStats. `EXODUSER-IT07-Crystal-Craft-Isolated-20261020` | IT-01/03·reward bags·재화 권위·TI-10a·OPT. 새 주머니 authority 금지. 실제 쓰기/자동 frame/UI는 별도 배정 |
| IT-08 유니크 전투효과 카드 | 신규 `godot/port_modules/item_unique_effect_source/<effect>_source.gd`, `godot/tests/test_native_unique_<effect>.gd`를 **1효과씩**. 기존 consumer 수정은 카드별 인수 | 예: u_n03 G:15102/16824의 step3·charge조건×(1+val). 토큰 효과는 G:16516~16605와 실제 발동부 범위를 함께 인수. 전체 _uqFrame 일괄 이식 금지 | 무장비/장비, 적합·비적합 공격, 첫 특수값,2차 효과 재귀 차단, 실제 clock/consumer 효과. `EXODUSER-IT08-<effect>-Isolated-20261020` | SKILLS/WEAPONS·State/World·피해 owner 선행. Q/E·부활·쉴드는 **보호 HOLD**. 실제 첫 효과 선정은 연결 준비도에 따라 미확인 |

외관27개는 P2-006/TI-03 담당이 기존 원본 PNG를 인수하여 연결한다. 새 생성·가공·색 변경·이미지 수정은 이번 범위가 아니다.

## 5. 공용 파일 접점 (이번 수정0)

| 파일·현재 지점 | 후속 접점 | 선행·보호·충돌 |
|---|---|---|
| `godot/scripts/main.gd:848~849,1870,2223,2529~2645` | 실제 bundle/전설 cache·unique reader/lifetime 재사용. 패널·서식 소비는 TI-03 | IT-01 접촉0. P2-001l 입력·P2-007a UI와 동시 편집 금지 |
| `godot/scripts/native_source_new_run_state.gd:175~185,400~414,528~566,1007~1066` | INV/bag getter 및 최소 mutation API 인수 | G/P/세이브 권위 보호. bag/mats 직접 쓰기로 우회 금지 |
| `godot/scripts/native_source_player_initialization_services.gd:627~644,770` | eq_affix/u_eq/l_eq provider 동일성 유지 | IT-01 등록 불필요. 필수 결손 provider를 가짜0으로 채우지 않음 |
| `godot/port_modules/player_resource_parameters_source/producer.gd:405~444,511~527` | IT-04의 item/ci→홈 배율을 합산 전 공급 | 순서·오류 packet·쓰기0 계약 보존. TI-04와 소유 조율 |
| `godot/port_modules/player_crystal_resource_source/producer.gd:233~285` | IT-03의 gem 품질 배율 | 기존18 opts/empty/NOT_READY 보존 |
| `godot/port_modules/equipment_affix_reader/producer.gd:105~225`; formula`:265~308,545~553` | 장비 변경 후 캐시 무효화·재조회 | TI-04 담당. unique 첫 truthy와 전설 첫 defined 차이 보존 |
| `godot/scripts/native_normal_enemy_hurte.gd:691~734` | 기존 P2-001c 생성·권위 기록 재사용. 효과별 분기만 별도 요청 | 공용 피해 집행자. 드랍/RNG 중복0, Q/E 보호 |
| `godot/scripts/world.gd`, `player.gd`, `hud.gd` | P2-006 표시/줍기·TI-03 상세·개별 스킬 consumer | P3-002/P2-001l/P2-007a 담당. IT-01 변경0 |
| `godot/data/item_generation_tables.json` | IT-01/02/05가 readonly 재사용 |11집합 일치. 재추출·재정렬·전체 덮기 불필요 |
| `game.html`/`index.html`, `docs/2_3`, 원본 저장 IO | oracle·행 추적만 | 수정0. Q/E·세이브 형식·인증·사용자 기록 보호 |

## 6. 완료·제출 경계

- 변경 경로는 이 문서1개다. 작업판/별도 보고서 수정 의무보다 사용자의 최신 “새 문서1개” 제한을 우선한다. 총괄에게 이 문서·브랜치·SHA로 검수 상태를 전달한다.
- 경로 지정 stage/commit, 자기 `codex/trace-items-20261020` 비강제 push 후 원격 SHA 대조. main 병합/push·force/reset·R 코드 변경0. 인증/권한이 막히면 우회하지 않고 BLOCKED로 보고한다.
- Git 밖 `~/exoduser-wt/_out/trace-items/DONE.txt`에 실제 브랜치·SHA·한 줄 요약을 기록한다. 이 문서에는 자기 commit SHA를 순환 기입하지 않는다.
- PC 실행·동기화, Mac 열린 게임 갱신, 실플레이·시각/Godot 테스트 PASS는 **미확인**. 이번 추적 완료를 아이템 전체 이식 완료로 읽지 않는다.

## 7. 이번 검산·검증 근거

`~/exoduser-wt/_out/trace-items/analyze.cjs`(Git 밖)로 원본 선언식만 평가하고 `catalog.json`, `audit.json`을 남겼다. 게임 전체/DOM/저장/API 실행0. 첫 발췌는 CR_ATK_SLOTS 의존 누락으로 실패했고, 원본 slot 상수를 함께 읽어 해결했다. 제품 코드 수정0. 최종 Node v24.15.0 exit0.11개 기존 JSON 집합의 내용·배열 순서 일치. **Godot 실행 통과 증거가 아니다.**

원본 함수 발췌 VM의 관측값(IT-01 고정 oracle):

| q | qTier | grade | qGemMul |
|---|---|---|---|
| 0 | 6 | silver | 1 |
| 1 | 10 | bronze | 0.755 |
| 10 | 10 | bronze | 0.8 |
| 11 | 9 | bronze | 0.805 |
| 40 | 7 | bronze | 0.95 |
| 41 | 6 | silver | 0.955 |
| 50 | 6 | silver | 1 |
| 80 | 3 | silver | 1.15 |
| 81 | 2 | gold | 1.155 |
| 90 | 2 | gold | 1.2 |
| 91 | 1 | gold | 1.205 |
| 100 | 1 | gold | 1.25 |
| -1 | 10 | bronze | 0.755 |
| 101 | 1 | gold | 1.25 |
| None | 6 | silver | 1 |

| socketQ / crystal.q | socketMul | socketResonant |
|---|---|---|
| 1 / 1 | 1 | false |
| 40 / 40 | 1.7878787878787878 | true |
| 40 / 41 | 1.393939393939394 | false |
| 41 / 41 | 1.808080808080808 | true |
| 80 / 81 | 1.797979797979798 | false |
| 100 / 100 | 3 | true |
| 100 / 50 | 2 | false |

제출 전 문서 형식·행 참조·변경 1경로·R 보존·원격 ref를 실제로 확인하고 DONE/최종 보고에 결과를 기록한다.

## 부록 A. AFFIX_POOL 409레코드 전수 색인

정의 순서 그대로 다. 같은 ID 변형도 합치지 않는다. `추가조건`은 brType/tierW/skewRoll/minGrade 및 그 밖의 필드 전부다. `직접 소비행`은 **파일 전체의 `_eqAffix('해당id')` literal call 일치행**(주석 포함, 한 행 중복1회)이며 함수의 효과 완료 판정이 아니다. `이름`은 AFFIX_NAMES_KO의 최종값; undefined는 “이름 미등록”. `unit/type/tiers/slots/group/weight`는 추정 없이 원본 리터럴이다. null tiers를 0으로 고치지 않는다.

| # | id / 한글명 | 정의 G행 | type / unit | tiers | slots | group / weight | 추가조건 | 직접 소비 G행 |
|---|---|---|---|---|---|---|---|---|
| 1 | poisonDot / 맹독의 | 14375 | 0 / dps | [5,8,14,22,32] | wpn | poison / 100 | — | 42424 |
| 2 | fireDot / 불꽃의 | 14376 | 0 / dps | [6,10,17,26,38] | wpn | fire / 100 | — | 42424 |
| 3 | iceDot / 냉기의 | 14377 | 0 / dps | [4,7,12,18,26] | wpn | ice / 90 | — | 42424 |
| 4 | lightChain / 번개의 | 14378 | 0 / dmg | [8,13,22,35,50] | wpn | lightning / 85 | — | 42438 |
| 5 | darkCurse / 암흑의 | 14379 | 0 / prob | [0.12,0.2,0.35,0.55,0.75] | helm | dark / 70 | — | 42440 |
| 6 | armorPen / 관통의 | 14381 | 0 / pct | [0.05,0.08,0.14,0.22,0.32] | wpn | pen / 75 | — | 직접 literal 참조 없음(동적 소비 미확인) |
| 7 | staggerBns / 파쇄의 | 14382 | 0 / val | [5,8,14,22,32] | wpn | stagger / 70 | — | 42489 |
| 8 | chainTarget / 연쇄의 | 14383 | 0 / cnt | [1,1,2,3,4] | xbow | chain / 60 | — | 42442 |
| 9 | killSlayer / 학살의 | 14384 | 0 / pct | [0.1,0.15,0.25,0.4,0.55] | wpn | kill / 75 | — | 42652 |
| 10 | comboBoost / 추적자의 | 14385 | 0 / pct | [0.12,0.2,0.35,0.55,0.75] | wpn | combo / 60 | — | 42295 |
| 11 | dashBoost / 사슬의 | 14386 | 0 / pct | [0.15,0.25,0.4,0.65,0.9] | wpn | dash / 55 | — | 32291, 33979 |
| 12 | skillBoost / 궁극의 | 14387 | 0 / pct | [0.1,0.15,0.25,0.4,0.55] | wpn | skill / 65 | — | 44557 |
| 13 | elemFocus / 집중의 | 14389 | 0 / pct | [0.08,0.12,0.2,0.32,0.44] | helm | elemfcs / 70 | — | 42214 |
| 14 | atkSpeed / 쾌속의 | 14390 | 0 / pct | [0.04,0.06,0.1,0.16,0.22] | wpn,helm | aspd / 85 | — | 27994 |
| 15 | parryBonus / 패리의 | 14391 | 0 / pct | [0.12,0.2,0.35,0.55,0.75] | wpn | parry / 65 | — | 28036, 34858, 34859, 38481 |
| 16 | cooldownRed / 집중력의 | 14392 | 0 / pct | [-0.02,-0.03,-0.05,-0.07,-0.1] | wpn | cd / 70 | — | 28065 |
| 17 | magicDmg / 마력의 | 14393 | 0 / pct | [0.06,0.1,0.18,0.28,0.4] | helm | mdmg / 85 | — | 28008 |
| 18 | critDmgW / 극대화의 | 14395 | 1 / pct | [0.1,0.2,0.3,0.4,0.5] | wpn,helm | cdmgW / 60 | {"tierW":[40,30,20,8,2]} | 27998, 51348 |
| 19 | critRate / 광폭의 | 14396 | 0 / pct | [0.01,0.02,0.03,0.04,0.05] | ring,neck,bracelet | crt / 50 | {"tierW":[40,30,20,8,2]} | 27997, 51348 |
| 20 | critDmgW / 극대화의 | 14397 | 1 / pct | [0.1,0.2,0.3,0.4,0.5] | ring,neck,bracelet | cdmgW / 50 | {"tierW":[40,30,20,8,2]} | 27998, 51348 |
| 21 | sharpAtk / 예리한 | 14399 | 0 / val | [20,50,170,330,500] | wpn | satk / 25 | {"skewRoll":3,"tierW":[40,30,20,8,2]} | 직접 literal 참조 없음(동적 소비 미확인) |
| 22 | brutalAtk / 맹렬한 | 14400 | 0 / val | [20,50,170,330,500] | wpn | batk / 20 | {"skewRoll":3,"tierW":[40,30,20,8,2]} | 직접 literal 참조 없음(동적 소비 미확인) |
| 23 | ruinAtk / 파멸의 | 14401 | 1 / val | [20,50,170,330,500] | wpn | ratk / 15 | {"skewRoll":3,"tierW":[40,30,20,8,2]} | 직접 literal 참조 없음(동적 소비 미확인) |
| 24 | staggerExplosion / 스태거폭발의 | 14403 | 1 / pct | [0.18,0.3,0.5,0.8,1.15] | wpn | sexp / 35 | — | 42492 |
| 25 | elemConvert / 원소전환의 | 14404 | 1 / prob | [0.12,0.2,0.35,0.55,0.75] | wpn | elcv / 40 | — | 42211 |
| 26 | parryExplosion / 패링폭발의 | 14405 | 1 / atk | [0.25,0.4,0.7,1.1,1.6] | wpn | pexp / 35 | — | 38545 |
| 27 | abundDmg / 풍요의 | 14407 | 1 / pct | [0.08,0.12,0.2,0.32,0.44] | wpn,helm | abnd / 45 | — | 42238 |
| 28 | predDmg / 약자포식의 | 14408 | 1 / pct | [0.08,0.12,0.2,0.32,0.44] | wpn,helm | pred / 45 | — | 42243 |
| 29 | fullLifeDmg / 만혈의 | 14409 | 1 / pct | [0.1,0.18,0.28,0.4,0.55] | wpn | flDmg / 35 | {"tierW":[40,30,20,8,2]} | 42240 |
| 30 | lowLifeDmg / 사선의 | 14410 | 1 / pct | [0.15,0.25,0.4,0.6,0.85] | wpn | llDmg / 35 | {"tierW":[40,30,20,8,2]} | 42241 |
| 31 | overkilDmg / 처형의 | 14411 | 1 / pct | [0.2,0.35,0.55,0.8,1.1] | wpn | okDmg / 30 | {"tierW":[40,30,20,8,2]} | 42244 |
| 32 | closeDmg / 근접살의 | 14413 | 1 / pct | [0.08,0.14,0.22,0.32,0.44] | wpn | clDmg / 50 | — | 42248 |
| 33 | farDmg / 원거리의 | 14414 | 1 / pct | [0.08,0.14,0.22,0.32,0.44] | xbow | frDmg / 50 | — | 42249 |
| 34 | stunDmgUp / 경직파의 | 14416 | 1 / pct | [0.1,0.18,0.28,0.4,0.55] | wpn | stDU / 55 | — | 42251 |
| 35 | frozenDmgUp / 동파의 | 14417 | 1 / pct | [0.1,0.18,0.28,0.4,0.55] | wpn | frDU / 55 | — | 42252 |
| 36 | burnDmgUp / 연소의 | 14418 | 1 / pct | [0.1,0.18,0.28,0.4,0.55] | wpn | buDU / 55 | — | 42253 |
| 37 | poisonDmgUp / 맹독살의 | 14419 | 1 / pct | [0.1,0.18,0.28,0.4,0.55] | wpn | poDU / 55 | — | 42254 |
| 38 | curseDmgUp / 저주살의 | 14420 | 1 / pct | [0.1,0.18,0.28,0.4,0.55] | wpn | cuDU / 50 | — | 42255 |
| 39 | slowDmgUp / 구속의 | 14421 | 1 / pct | [0.1,0.18,0.28,0.4,0.55] | wpn | slDU / 50 | — | 42256 |
| 40 | bossSlayer / 왕살의 | 14423 | 1 / pct | [0.1,0.18,0.28,0.4,0.55] | wpn,helm | bsSl / 40 | {"tierW":[40,30,20,8,2]} | 42258 |
| 41 | eliteSlayer / 정예살의 | 14424 | 1 / pct | [0.12,0.2,0.32,0.46,0.65] | wpn,helm | elSl / 45 | — | 42259 |
| 42 | mobSlayer / 군살의 | 14425 | 1 / pct | [0.15,0.25,0.4,0.6,0.85] | wpn | moSl / 60 | — | 42260 |
| 43 | firstStrike / 선제의 | 14427 | 1 / pct | [0.15,0.25,0.4,0.6,0.85] | wpn | fStr / 40 | — | 42245 |
| 44 | lifeLeech / 흡혈의 | 14429 | 1 / pct | [0.005,0.01,0.018,0.028,0.04] | wpn | llch / 35 | {"tierW":[40,30,20,8,2]} | 42361 |
| 45 | manaLeech / 흡마의 | 14430 | 1 / pct | [0.008,0.015,0.025,0.04,0.06] | wpn | mlch / 35 | {"tierW":[40,30,20,8,2]} | 42363 |
| 46 | stLeech / 흡정의 | 14431 | 1 / pct | [0.005,0.01,0.018,0.028,0.04] | wpn | slch / 35 | {"tierW":[40,30,20,8,2]} | 42364 |
| 47 | lifeOnHit / 타격재생의 | 14432 | 1 / val | [1,2,4,7,11] | wpn | loH / 45 | — | 42365 |
| 48 | onKillHeal / 처치회복의 | 14434 | 1 / val | [5,10,18,28,40] | wpn,helm | okHl / 50 | — | 42654 |
| 49 | onKillMana / 처치흡마의 | 14435 | 1 / val | [5,10,18,28,40] | wpn,helm | okMn / 50 | — | 42655 |
| 50 | onKillStam / 처치활력의 | 14436 | 1 / val | [3,6,10,16,24] | wpn | okSt / 45 | — | 42656 |
| 51 | onKillSpeed / 처치질주의 | 14438 | 1 / pct | [0.05,0.08,0.12,0.18,0.25] | wpn | okSp / 40 | — | 42658 |
| 52 | rageMaxFlat / 격노의 | 14440 | 0 / val | [10,20,35,55,80] | wpn | rgMx / 45 | — | 27890 |
| 53 | rageDmg / 광분의 | 14441 | 1 / pct | [0.08,0.14,0.22,0.32,0.44] | wpn | rgDm / 45 | — | 46466 |
| 54 | rageSkCrit / 격노일섬의 | 14443 | 1 / prob | [0.05,0.08,0.12,0.18,0.25] | wpn | rgSC / 40 | — | 42310 |
| 55 | rageSkDmg / 분쇄의 | 14444 | 1 / pct | [0.1,0.18,0.28,0.4,0.55] | wpn | rgSD / 40 | — | 42307 |
| 56 | defFlat / 강철의 | 14449 | 0 / val | [10,20,30,40,50] | armor,shield,gloves,pants,boots,cloak | defF / 100 | — | 27942 |
| 57 | maxHPFlat / 강인의 | 14450 | 0 / val | [60,100,200,300,420] | armor,shield,gloves,pants,boots,cloak | hp / 90 | — | 27913, 51373 |
| 58 | shieldFlat / 수호의 | 14451 | 0 / val | [120,200,400,600,840] | armor,shield,gloves,pants,boots,cloak | shd / 80 | — | 27961, 51374 |
| 59 | maxHPPct / 활력의 | 14452 | 0 / pct | [0.05,0.08,0.14,0.22,0.32] | armor | hpp / 80 | — | 27913, 51373 |
| 60 | movSpeed / 신속의 | 14453 | 0 / pct | [0.03,0.05,0.09,0.14,0.2] | boots,cloak | mspd / 85 | — | 27927, 51381 |
| 61 | physDR / 물리방패의 | 14455 | 1 / pct | [0.04,0.06,0.1,0.16,0.22] | armor,shield | pdr / 80 | — | 43514, 51312 |
| 62 | reflect / 반사의 | 14456 | 1 / pct | [0.03,0.05,0.09,0.15,0.22] | armor,shield | refl / 70 | — | 43604 |
| 63 | thorns / 가시의 | 14457 | 1 / val | [2,4,8,14,22] | armor,gloves | thorn / 65 | — | 43602 |
| 64 | barrier / 흡수의 | 14458 | 1 / val | [8,15,28,45,65] | armor | bar / 60 | — | 43526 |
| 65 | ccRes / 인내의 | 14459 | 1 / pct | [0.08,0.12,0.2,0.32,0.44] | pants | ccr / 70 | — | 34982, 43463, 43488, 43585 |
| 66 | crisisBoost / 위기의 | 14460 | 1 / pct | [0.15,0.25,0.4,0.65,0.9] | armor | cris / 45 | — | 42222 |
| 67 | counterHit / 피격반격의 | 14461 | 1 / prob | [0.1,0.15,0.25,0.4,0.55] | armor,shield | cnt / 40 | — | 43600 |
| 68 | statusClean / 정화의 | 14462 | 1 / cnt | [1,1,1,2,3] | pants | clean / 50 | — | 32745 |
| 69 | lastStand / 불굴의 | 14463 | 1 / cnt | [null,null,null,null,1] | armor | lst / 20 | — | 43606 |
| 70 | reviveOnce / 부활의 | 14464 | 1 / hp | [null,null,null,0.2,0.35] | armor | rev / 10 | — | 43727 |
| 71 | dropRate / 약탈의 | 14466 | 1 / pct | [0.08,0.12,0.2,0.32,0.44] | boots,cloak | drop / 70 | — | 27999 |
| 72 | goldBonus / 골드의 | 14467 | 1 / pct | [0.1,0.15,0.25,0.4,0.55] | boots | gold / 70 | — | 32950, 32975, 41463, 43081 |
| 73 | potionPower / 포션강화의 | 14468 | 1 / pct | [0.12,0.2,0.35,0.55,0.75] | pants | pot / 60 | — | 28232, 35894, 35903 |
| 74 | extraST / 사슬의 | 14469 | 1 / val | [5,10,20,30,45] | boots,pants | exst / 50 | — | 32785, 51393, 63463 |
| 75 | healthyDef / 건강방어의 | 14471 | 1 / val | [5,10,18,28,40] | armor,shield | hDef / 50 | — | 43530 |
| 76 | injuredDR / 중상보호의 | 14472 | 1 / pct | [0.06,0.1,0.16,0.24,0.34] | armor,shield | iDR / 45 | — | 43531 |
| 77 | injuredSpeed / 위기질주의 | 14473 | 1 / pct | [0.04,0.07,0.11,0.16,0.22] | boots | iSpd / 45 | — | 27927 |
| 78 | dotDR / 지속피해방어의 | 14474 | 1 / pct | [0.06,0.1,0.16,0.24,0.34] | pants,cloak | dDR / 55 | — | 43532 |
| 79 | bossDR / 왕피해방어의 | 14475 | 1 / pct | [0.05,0.08,0.14,0.22,0.3] | armor,shield | bDR / 35 | {"tierW":[40,30,20,8,2]} | 43534 |
| 80 | closeDR / 근접방어의 | 14476 | 1 / pct | [0.05,0.08,0.14,0.22,0.3] | armor | cDR / 45 | — | 43536 |
| 81 | farDR / 원거리방어의 | 14477 | 1 / pct | [0.05,0.08,0.14,0.22,0.3] | shield,cloak | fDR / 45 | — | 43536 |
| 82 | hpOnKill / 처치생명의 | 14478 | 1 / val | [3,6,10,16,24] | armor,gloves | hpOK / 50 | — | 42654 |
| 83 | shieldOnKill / 처치수호의 | 14479 | 1 / val | [5,10,18,28,40] | armor,shield | shOK / 45 | — | 42657 |
| 84 | fireRes / 화염수호 | 14485 | 1 / pct | [0.08,0.12,0.2,0.32,0.44] | ring,neck,belt,headband,bracelet | rfir / 100 | — | 51316 |
| 85 | iceRes / 빙결수호 | 14486 | 1 / pct | [0.08,0.12,0.2,0.32,0.44] | ring,neck,belt,headband,bracelet | rice / 100 | — | 51316 |
| 86 | lightRes / 암전수호 | 14487 | 1 / pct | [0.08,0.12,0.2,0.32,0.44] | ring,neck,belt,headband,bracelet | rlit / 100 | — | 51317 |
| 87 | darkRes / 암흑수호 | 14488 | 1 / pct | [0.08,0.12,0.2,0.32,0.44] | ring,neck,belt,headband,bracelet | rdark / 90 | — | 51317 |
| 88 | poisonRes / 독수호 | 14489 | 1 / pct | [0.06,0.1,0.18,0.28,0.4] | ring,neck,belt,headband,bracelet | rpoi / 90 | — | 51318 |
| 89 | allRes / 전원소수호 | 14490 | 1 / pct | [0.03,0.05,0.09,0.15,0.22] | neck | rall / 50 | — | 51315 |
| 90 | eDefFlat / 원소수호의 | 14491 | 1 / val | [25,50,100,150,220] | neck,ring,belt,headband,bracelet | edf / 40 | — | 43512, 51298 |
| 91 | maxSTFlat / 지속의 | 14493 | 0 / val | [20,40,60,80,100] | belt,bracelet,ring,neck,headband | stf / 75 | — | 16431 |
| 92 | maxMPFlat / 마나의 | 14494 | 0 / val | [20,40,60,80,100] | belt,bracelet,ring,neck,headband | mpf / 75 | — | 27931 |
| 93 | mpCostRed / 절약의 | 14495 | 0 / pct | [-0.05,-0.08,-0.14,-0.22,-0.3] | headband,neck | mpcr / 80 | — | 28041 |
| 94 | stCostRed / 절약의 | 14496 | 0 / pct | [-0.05,-0.08,-0.14,-0.22,-0.3] | belt,bracelet | stcr / 75 | — | 31983 |
| 95 | expBonus / 경험의 | 14498 | 1 / pct | [0.06,0.1,0.18,0.28,0.4] | neck | exp / 65 | — | 43143 |
| 96 | antiRevive / 진혼의 | 14499 | 1 / pct | [0.04,0.08,0.12,0.16,0.2] | neck,bracelet | arev / 40 | {"tierW":[50,30,15,4,1]} | 42209, 42522, 42629, 42644 |
| 97 | antiRevive / 진혼의 | 14500 | 1 / pct | [0.02,0.04,0.08,0.12,0.16] | ring | arev / 40 | {"tierW":[50,30,15,4,1]} | 42209, 42522, 42629, 42644 |
| 98 | revivePow / 부활의 | 14502 | 0 / pct | [0.06,0.1,0.18,0.28,0.4] | bracelet | rpow / 80 | {"brType":"demon"} | 43741 |
| 99 | reviveCd / 윤회의 | 14503 | 0 / pct | [-0.06,-0.1,-0.18,-0.28,-0.4] | bracelet | rcd / 70 | {"brType":"demon"} | 43747 |
| 100 | lifeMaxHP / 생명력의 | 14505 | 0 / pct | [0.05,0.08,0.14,0.22,0.32] | bracelet | lhp / 85 | {"brType":"life"} | 27913, 51373 |
| 101 | lifeRegen / 재생의 | 14506 | 0 / val | [1,3,6,10,15] | bracelet | lrg / 80 | {"brType":"life"} | 27930 |
| 102 | lifeHealPow / 치유의 | 14507 | 0 / pct | [0.06,0.1,0.18,0.28,0.4] | bracelet | lhl / 75 | {"brType":"life"} | 32713 |
| 103 | lckFlatN / 행운의 | 14509 | 0 / val | [20,40,60,80,100] | neck | lckN / 80 | — | 27996 |
| 104 | lckFlatR / 행운의 | 14510 | 0 / val | [10,20,30,40,50] | ring,bracelet,belt,headband | lckR / 80 | — | 27996 |
| 105 | gritFlatN / 근성의 | 14511 | 1 / val | [20,40,60,80,100] | neck | grtN / 80 | — | 27897 |
| 106 | gritFlatR / 근성의 | 14512 | 1 / val | [10,20,30,40,50] | ring,bracelet,belt,headband | grtR / 80 | — | 27897 |
| 107 | healthyAtk / 건강공세의 | 14514 | 1 / pct | [0.08,0.14,0.22,0.32,0.44] | ring,neck | hAtk / 45 | — | 42239 |
| 108 | injuredDmg / 중상폭발의 | 14515 | 1 / pct | [0.12,0.2,0.32,0.46,0.65] | ring,neck | iDmg / 40 | — | 42241 |
| 109 | injuredLeech / 중상흡혈의 | 14516 | 1 / pct | [0.008,0.015,0.025,0.04,0.06] | ring | iLch / 30 | {"tierW":[40,30,20,8,2]} | 42361 |
| 110 | vsBossDmg / 토벌의 | 14517 | 1 / pct | [0.08,0.14,0.22,0.32,0.44] | neck,ring | vBDm / 35 | {"tierW":[40,30,20,8,2]} | 42258 |
| 111 | vsEliteDmg / 정예토벌의 | 14518 | 1 / pct | [0.1,0.18,0.28,0.4,0.55] | neck | vEDm / 40 | — | 42259 |
| 112 | fireDmgPct / 화염강화의 | 14524 | 0 / pct | [0.08,0.14,0.22,0.32,0.44] | helm | fDmP / 70 | — | 직접 literal 참조 없음(동적 소비 미확인) |
| 113 | firePen / 화염관통의 | 14525 | 1 / pct | [0.05,0.08,0.14,0.22,0.32] | wpn | fPen / 50 | — | 직접 literal 참조 없음(동적 소비 미확인) |
| 114 | fireOnHit / 발화의 | 14526 | 1 / prob | [0.08,0.14,0.22,0.32,0.44] | wpn | fOH / 55 | — | 42371 |
| 115 | fireBurst / 화염폭발의 | 14527 | 1 / val | [15,28,45,70,100] | wpn | fBst / 35 | — | 직접 literal 참조 없음(동적 소비 미확인) |
| 116 | fireDuration / 맹화의 | 14528 | 0 / pct | [0.1,0.18,0.28,0.4,0.55] | helm | fDur / 55 | — | 직접 literal 참조 없음(동적 소비 미확인) |
| 117 | fireDmgBns / 화염의힘 | 14529 | 1 / pct | [0.06,0.1,0.18,0.28,0.4] | ring,neck | fBns / 60 | — | 직접 literal 참조 없음(동적 소비 미확인) |
| 118 | iceDmgPct / 빙결강화의 | 14531 | 0 / pct | [0.08,0.14,0.22,0.32,0.44] | helm | iDmP / 70 | — | 직접 literal 참조 없음(동적 소비 미확인) |
| 119 | icePen / 빙결관통의 | 14532 | 1 / pct | [0.05,0.08,0.14,0.22,0.32] | wpn | iPen / 50 | — | 직접 literal 참조 없음(동적 소비 미확인) |
| 120 | iceOnHit / 동결의 | 14533 | 1 / prob | [0.06,0.1,0.16,0.24,0.34] | wpn | iOH / 50 | — | 42372 |
| 121 | iceBurst / 빙결폭발의 | 14534 | 1 / val | [12,22,38,58,85] | wpn | iBst / 35 | — | 직접 literal 참조 없음(동적 소비 미확인) |
| 122 | iceDuration / 영빙의 | 14535 | 0 / pct | [0.1,0.18,0.28,0.4,0.55] | helm | iDur / 55 | — | 직접 literal 참조 없음(동적 소비 미확인) |
| 123 | iceDmgBns / 빙결의힘 | 14536 | 1 / pct | [0.06,0.1,0.18,0.28,0.4] | ring,neck | iBns / 60 | — | 직접 literal 참조 없음(동적 소비 미확인) |
| 124 | lightDmgPct / 뇌전강화의 | 14538 | 0 / pct | [0.08,0.14,0.22,0.32,0.44] | helm | lDmP / 70 | — | 직접 literal 참조 없음(동적 소비 미확인) |
| 125 | lightPen / 뇌전관통의 | 14539 | 1 / pct | [0.05,0.08,0.14,0.22,0.32] | wpn | lPen / 50 | — | 직접 literal 참조 없음(동적 소비 미확인) |
| 126 | lightOnHit / 감전의 | 14540 | 1 / prob | [0.06,0.1,0.16,0.24,0.34] | wpn | lOH / 50 | — | 42373 |
| 127 | lightBurst / 뇌전폭발의 | 14541 | 1 / val | [18,32,52,80,115] | wpn | lBst / 35 | — | 직접 literal 참조 없음(동적 소비 미확인) |
| 128 | lightDuration / 낙뢰의 | 14542 | 0 / pct | [0.1,0.18,0.28,0.4,0.55] | helm | lDur / 55 | — | 직접 literal 참조 없음(동적 소비 미확인) |
| 129 | lightDmgBns / 뇌전의힘 | 14543 | 1 / pct | [0.06,0.1,0.18,0.28,0.4] | ring,neck | lBns / 60 | — | 직접 literal 참조 없음(동적 소비 미확인) |
| 130 | darkDmgPct / 암흑강화의 | 14545 | 0 / pct | [0.08,0.14,0.22,0.32,0.44] | helm | dDmP / 65 | — | 직접 literal 참조 없음(동적 소비 미확인) |
| 131 | darkPen / 암흑관통의 | 14546 | 1 / pct | [0.05,0.08,0.14,0.22,0.32] | wpn | dPen / 45 | — | 직접 literal 참조 없음(동적 소비 미확인) |
| 132 | darkOnHit / 침식의 | 14547 | 1 / prob | [0.06,0.1,0.16,0.24,0.34] | wpn | dOH / 45 | — | 42374 |
| 133 | darkBurst / 암흑폭발의 | 14548 | 1 / val | [14,26,42,65,95] | wpn | dBst / 30 | — | 직접 literal 참조 없음(동적 소비 미확인) |
| 134 | darkDuration / 심연의 | 14549 | 0 / pct | [0.1,0.18,0.28,0.4,0.55] | helm | dDur / 50 | — | 직접 literal 참조 없음(동적 소비 미확인) |
| 135 | darkDmgBns / 암흑의힘 | 14550 | 1 / pct | [0.06,0.1,0.18,0.28,0.4] | ring,neck | dBns / 55 | — | 직접 literal 참조 없음(동적 소비 미확인) |
| 136 | poisonDmgPct / 맹독강화의 | 14552 | 0 / pct | [0.08,0.14,0.22,0.32,0.44] | helm | pDmP / 65 | — | 42219 |
| 137 | poisonPen / 독관통의 | 14553 | 1 / pct | [0.05,0.08,0.14,0.22,0.32] | wpn | pPen / 45 | — | 직접 literal 참조 없음(동적 소비 미확인) |
| 138 | poisonOnHit / 중독의 | 14554 | 1 / prob | [0.08,0.14,0.22,0.32,0.44] | wpn | pOH / 55 | — | 42375 |
| 139 | poisonBurst / 독폭발의 | 14555 | 1 / val | [10,20,35,55,80] | wpn | pBst / 30 | — | 직접 literal 참조 없음(동적 소비 미확인) |
| 140 | poisonDuration / 맹독지속의 | 14556 | 0 / pct | [0.12,0.2,0.32,0.46,0.65] | helm | pDur / 55 | — | 직접 literal 참조 없음(동적 소비 미확인) |
| 141 | poisonDmgBns / 독의힘 | 14557 | 1 / pct | [0.06,0.1,0.18,0.28,0.4] | ring,neck | pBns / 55 | — | 42219 |
| 142 | meleeDmgPct / 격투의 | 14562 | 0 / pct | [0.08,0.14,0.22,0.32,0.44] | wpn | mlDm / 75 | — | 42276 |
| 143 | rangedDmgPct / 원사의 | 14563 | 0 / pct | [0.08,0.14,0.22,0.32,0.44] | xbow | rnDm / 75 | — | 42277 |
| 144 | spellDmgPct / 주술의 | 14564 | 0 / pct | [0.08,0.14,0.22,0.32,0.44] | helm | spDm / 75 | — | 42278, 42279 |
| 145 | beamDmgPct / 광선의 | 14565 | 0 / pct | [0.1,0.18,0.28,0.4,0.55] | helm | bmDm / 55 | — | 42279 |
| 146 | dotDmgPct / 침식의 | 14566 | 0 / pct | [0.08,0.14,0.22,0.32,0.44] | wpn | dtDm / 60 | — | 42280 |
| 147 | projDmgPct / 탄도의 | 14567 | 0 / pct | [0.08,0.14,0.22,0.32,0.44] | xbow | pjDm / 65 | — | 42277, 42281 |
| 148 | aoeRadiusPct / 확산의 | 14568 | 0 / pct | [0.06,0.1,0.16,0.24,0.34] | wpn,helm | aoRd / 55 | — | 직접 literal 참조 없음(동적 소비 미확인) |
| 149 | critRateMelee / 근접회심의 | 14573 | 0 / pct | [0.01,0.02,0.03,0.04,0.06] | wpn | crM / 45 | {"tierW":[40,30,20,8,2]} | 42311 |
| 150 | critRateSpell / 마법회심의 | 14574 | 0 / pct | [0.01,0.02,0.03,0.04,0.06] | helm | crS / 45 | {"tierW":[40,30,20,8,2]} | 42312 |
| 151 | critRateBow / 사격회심의 | 14575 | 0 / pct | [0.01,0.02,0.03,0.04,0.06] | xbow | crB / 45 | {"tierW":[40,30,20,8,2]} | 42313 |
| 152 | meleeAtkSpd / 근접쾌속의 | 14576 | 0 / pct | [0.04,0.07,0.11,0.16,0.22] | wpn | mAS / 65 | — | 33364, 58625, 58630, 58648 |
| 153 | bowAtkSpd / 사격쾌속의 | 14577 | 0 / pct | [0.04,0.07,0.11,0.16,0.22] | xbow | bAS / 65 | — | 28696, 44961 |
| 154 | castSpeed / 영창의 | 14578 | 0 / pct | [0.04,0.07,0.11,0.16,0.22] | helm | cSpd / 65 | — | 28050 |
| 155 | elemPenAll / 전속성관통의 | 14579 | 1 / pct | [0.03,0.05,0.09,0.15,0.22] | wpn | ePnA / 30 | {"tierW":[40,30,20,8,2]} | 직접 literal 참조 없음(동적 소비 미확인) |
| 156 | shieldBypass / 쉴드파괴의 | 14580 | 1 / prob | [0.05,0.08,0.14,0.22,0.32] | wpn | shBp / 30 | {"tierW":[40,30,20,8,2]} | 직접 literal 참조 없음(동적 소비 미확인) |
| 157 | armorShred / 갑옷분쇄의 | 14581 | 1 / val | [3,6,10,16,24] | wpn | arSh / 50 | — | 직접 literal 참조 없음(동적 소비 미확인) |
| 158 | projSpeedPct / 탄속의 | 14582 | 0 / pct | [0.08,0.14,0.22,0.32,0.44] | xbow | pjSp / 55 | — | 직접 literal 참조 없음(동적 소비 미확인) |
| 159 | onHitFireball / 화구발사의 | 14585 | 1 / prob | [0.04,0.07,0.11,0.16,0.22] | wpn | ohFb / 25 | {"tierW":[40,30,20,8,2]} | 직접 literal 참조 없음(동적 소비 미확인) |
| 160 | onHitChainL / 연쇄뇌격의 | 14586 | 1 / prob | [0.04,0.07,0.11,0.16,0.22] | wpn | ohCL / 25 | {"tierW":[40,30,20,8,2]} | 직접 literal 참조 없음(동적 소비 미확인) |
| 161 | onHitFreeze / 동결타의 | 14587 | 1 / prob | [0.05,0.08,0.14,0.22,0.3] | wpn | ohFz / 40 | — | 42378 |
| 162 | onHitStun / 경직타의 | 14588 | 1 / prob | [0.03,0.05,0.09,0.15,0.22] | wpn | ohSt / 35 | — | 42377 |
| 163 | onHitPoison / 독침의 | 14589 | 1 / prob | [0.06,0.1,0.16,0.24,0.34] | wpn | ohPo / 45 | — | 직접 literal 참조 없음(동적 소비 미확인) |
| 164 | onHitBleed / 출혈의 | 14590 | 1 / prob | [0.05,0.08,0.14,0.22,0.3] | wpn | ohBl / 40 | — | 42376 |
| 165 | onHitWeaken / 약화의 | 14591 | 1 / prob | [0.04,0.07,0.11,0.16,0.22] | wpn | ohWk / 35 | — | 직접 literal 참조 없음(동적 소비 미확인) |
| 166 | onHitSlow / 둔화의 | 14592 | 1 / prob | [0.06,0.1,0.16,0.24,0.34] | wpn | ohSl / 40 | — | 직접 literal 참조 없음(동적 소비 미확인) |
| 167 | onHitMark / 표적의 | 14593 | 1 / prob | [0.05,0.08,0.14,0.22,0.3] | wpn | ohMk / 30 | — | 직접 literal 참조 없음(동적 소비 미확인) |
| 168 | onCritExplode / 회심폭발의 | 14594 | 1 / pct | [0.2,0.35,0.55,0.8,1.15] | wpn | ocEx / 20 | {"tierW":[40,30,20,8,2]} | 42320 |
| 169 | onCritChain / 회심연쇄의 | 14595 | 1 / pct | [0.15,0.25,0.4,0.6,0.85] | wpn | ocCh / 20 | {"tierW":[40,30,20,8,2]} | 42321 |
| 170 | onCritFreeze / 회심빙결의 | 14596 | 1 / prob | [0.1,0.18,0.28,0.4,0.55] | wpn | ocFz / 30 | — | 42322 |
| 171 | onCritHeal / 회심치유의 | 14597 | 1 / val | [5,10,18,28,40] | wpn | ocHl / 35 | — | 42323 |
| 172 | onCritMana / 회심영력의 | 14598 | 1 / val | [3,6,10,16,24] | wpn | ocMn / 35 | — | 42324 |
| 173 | onCritShield / 회심수호의 | 14599 | 1 / val | [5,10,18,28,40] | wpn,helm | ocSh / 30 | — | 42325 |
| 174 | onHitDefBoost / 피격강화의 | 14600 | 1 / val | [5,10,18,28,40] | armor,shield | ohDb / 40 | — | 직접 literal 참조 없음(동적 소비 미확인) |
| 175 | onHitThorns / 반격가시의 | 14601 | 1 / val | [3,6,10,16,24] | armor,gloves | ohTh / 45 | — | 직접 literal 참조 없음(동적 소비 미확인) |
| 176 | onDodgeDmg / 회피반격의 | 14603 | 1 / pct | [0.1,0.18,0.28,0.4,0.55] | boots,cloak | odDm / 35 | — | 직접 literal 참조 없음(동적 소비 미확인) |
| 177 | onParryBurst / 패링폭파의 | 14604 | 1 / pct | [0.15,0.25,0.4,0.6,0.85] | shield | opBs / 30 | — | 직접 literal 참조 없음(동적 소비 미확인) |
| 178 | onBlockHeal / 블록치유의 | 14605 | 1 / val | [5,10,18,28,40] | shield | oBHl / 40 | — | 직접 literal 참조 없음(동적 소비 미확인) |
| 179 | onBlockMana / 블록영력의 | 14606 | 1 / val | [3,6,10,16,24] | shield | oBMn / 40 | — | 직접 literal 참조 없음(동적 소비 미확인) |
| 180 | kiSlashParry / 검기막이의 | 14608 | 1 / tick | [20,20,20,20,20] | wpn,gloves,bracelet | uKsP / 30 | {"minGrade":5} | 16826 |
| 181 | kiSlashFullCrit / 극참의 | 14610 | 1 / pct | [1,1,1,1,1] | wpn,gloves,bracelet | kSFC / 30 | — | 42315 |
| 182 | skWhirlDmg / 회전참강화 | 14613 | 1 / pct | [0.08,0.14,0.22,0.32,0.44] | wpn | sWD / 40 | — | 직접 literal 참조 없음(동적 소비 미확인) |
| 183 | skBeamDmg / 옴니빔강화 | 14614 | 1 / pct | [0.08,0.14,0.22,0.32,0.44] | helm | sBD / 40 | — | 직접 literal 참조 없음(동적 소비 미확인) |
| 184 | skFireballDmg / 화구강화 | 14615 | 1 / pct | [0.08,0.14,0.22,0.32,0.44] | helm | sFD / 40 | — | 직접 literal 참조 없음(동적 소비 미확인) |
| 185 | maliceWeakAmp / 잠식의 | 14616 | 1 / pct | [0.05,0.08,0.12,0.16,0.2] | helm | mWA / 35 | — | 24572 |
| 186 | skMissileDmg / 미사일강화 | 14617 | 1 / pct | [0.08,0.14,0.22,0.32,0.44] | xbow | sMD / 40 | — | 직접 literal 참조 없음(동적 소비 미확인) |
| 187 | skBlueShotDmg / 청탄강화 | 14618 | 1 / pct | [0.08,0.14,0.22,0.32,0.44] | xbow | sBSD / 40 | — | 직접 literal 참조 없음(동적 소비 미확인) |
| 188 | skBlastShotDmg / 폭렬탄강화 | 14619 | 1 / pct | [0.08,0.14,0.22,0.32,0.44] | xbow | sBShD / 40 | — | 직접 literal 참조 없음(동적 소비 미확인) |
| 189 | skHellRayDmg / 지옥광선강화 | 14620 | 1 / pct | [0.08,0.14,0.22,0.32,0.44] | helm | sHRD / 35 | — | 직접 literal 참조 없음(동적 소비 미확인) |
| 190 | skMaliceStormDmg / 악의폭풍강화 | 14621 | 1 / pct | [0.08,0.14,0.22,0.32,0.44] | xbow | sMSD / 35 | — | 직접 literal 참조 없음(동적 소비 미확인) |
| 191 | skChainSlashDmg / 연쇄참강화 | 14622 | 1 / pct | [0.08,0.14,0.22,0.32,0.44] | wpn | sCSD / 40 | — | 직접 literal 참조 없음(동적 소비 미확인) |
| 192 | skGiantSlamDmg / 지옥강타 1 강화 | 14623 | 1 / pct | [0.08,0.14,0.22,0.32,0.44] | wpn | sGSD / 40 | — | 직접 literal 참조 없음(동적 소비 미확인) |
| 193 | skGhostWalkDmg / 유령보행강화 | 14624 | 1 / pct | [0.08,0.14,0.22,0.32,0.44] | wpn | sGWD / 35 | — | 직접 literal 참조 없음(동적 소비 미확인) |
| 194 | skMaliceMortarDmg / 악의박격강화 | 14625 | 1 / pct | [0.08,0.14,0.22,0.32,0.44] | xbow | sMMD / 35 | — | 직접 literal 참조 없음(동적 소비 미확인) |
| 195 | skFireAuraDmg / 화염오라강화 | 14626 | 1 / pct | [0.08,0.14,0.22,0.32,0.44] | helm | sFAD / 40 | — | 직접 literal 참조 없음(동적 소비 미확인) |
| 196 | skIceOrbDmg / 빙구강화 | 14627 | 1 / pct | [0.08,0.14,0.22,0.32,0.44] | helm | sIOD / 35 | — | 직접 literal 참조 없음(동적 소비 미확인) |
| 197 | skFireBeamDmg / 화염빔강화 | 14628 | 1 / pct | [0.08,0.14,0.22,0.32,0.44] | helm | sFBD / 35 | — | 직접 literal 참조 없음(동적 소비 미확인) |
| 198 | skMaliceHuntDmg / 악의사냥강화 | 14629 | 1 / pct | [0.08,0.14,0.22,0.32,0.44] | xbow | sMHD / 35 | — | 직접 literal 참조 없음(동적 소비 미확인) |
| 199 | skDarkPillarDmg / 암흑기둥강화 | 14630 | 1 / pct | [0.08,0.14,0.22,0.32,0.44] | helm | sDPD / 35 | — | 직접 literal 참조 없음(동적 소비 미확인) |
| 200 | skPlagueDmg / 역병강화 | 14631 | 1 / pct | [0.08,0.14,0.22,0.32,0.44] | helm | sPBD / 35 | — | 직접 literal 참조 없음(동적 소비 미확인) |
| 201 | skSpikeAuraDmg / 가시오라강화 | 14632 | 1 / pct | [0.08,0.14,0.22,0.32,0.44] | helm | sSAD / 35 | — | 직접 literal 참조 없음(동적 소비 미확인) |
| 202 | skChainAssaultDmg / 연쇄돌격강화 | 14633 | 1 / pct | [0.08,0.14,0.22,0.32,0.44] | xbow | sCAD / 35 | — | 직접 literal 참조 없음(동적 소비 미확인) |
| 203 | dodgeChance / 회피의 | 14636 | 1 / pct | [0.02,0.04,0.06,0.09,0.13] | boots,cloak | ddgC / 45 | {"tierW":[40,30,20,8,2]} | 43432 |
| 204 | dodgeCooldown / 회피쿨감의 | 14637 | 1 / pct | [-0.05,-0.08,-0.14,-0.22,-0.3] | boots | ddgCd / 50 | — | 직접 literal 참조 없음(동적 소비 미확인) |
| 205 | maxHPPctArmor / 생명력의 | 14638 | 0 / pct | [0.04,0.07,0.11,0.16,0.22] | pants,shield | hpPA / 65 | — | 직접 literal 참조 없음(동적 소비 미확인) |
| 206 | shieldPct / 수호력의 | 14639 | 0 / pct | [0.1,0.16,0.28,0.44,0.64] | armor | shPct / 55 | — | 직접 literal 참조 없음(동적 소비 미확인) |
| 207 | shieldRegenPct / 수호재생의 | 14640 | 1 / pct | [0.04,0.07,0.11,0.16,0.22] | armor,shield | shRgP / 50 | — | 직접 literal 참조 없음(동적 소비 미확인) |
| 208 | shieldCdRed / 수호쿨감의 | 14641 | 1 / pct | [-0.05,-0.08,-0.14,-0.22,-0.3] | shield | shCdR / 45 | — | 14308, 33050, 33365, 33550, 33581, 33652, 33802 |
| 209 | hpRegenFlat / 재생의 | 14642 | 0 / val | [1,2,4,7,11] | armor,gloves | hpRgF / 60 | — | 직접 literal 참조 없음(동적 소비 미확인) |
| 210 | hpRegenPct / 재생력의 | 14643 | 0 / pct | [0.03,0.05,0.09,0.15,0.22] | armor | hpRgP / 50 | — | 직접 literal 참조 없음(동적 소비 미확인) |
| 211 | stRegenFlat / 활력재생의 | 14644 | 0 / val | [1,2,3,5,8] | boots,pants | stRgF / 55 | — | 직접 literal 참조 없음(동적 소비 미확인) |
| 212 | stRegenPct / 활력의 | 14645 | 0 / pct | [0.03,0.05,0.09,0.15,0.22] | belt | stRgP / 50 | — | 직접 literal 참조 없음(동적 소비 미확인) |
| 213 | mpRegenFlat / 마력재생의 | 14646 | 0 / val | [1,2,3,5,8] | headband,neck | mpRgF / 55 | — | 직접 literal 참조 없음(동적 소비 미확인) |
| 214 | mpRegenPct / 마력의 | 14647 | 0 / pct | [0.03,0.05,0.09,0.15,0.22] | headband | mpRgP / 50 | — | 직접 literal 참조 없음(동적 소비 미확인) |
| 215 | fireDR / 화염보호의 | 14648 | 1 / pct | [0.04,0.07,0.11,0.16,0.22] | armor,cloak | fDR / 55 | — | 직접 literal 참조 없음(동적 소비 미확인) |
| 216 | iceDR / 빙결보호의 | 14649 | 1 / pct | [0.04,0.07,0.11,0.16,0.22] | armor,pants | iDR / 55 | — | 직접 literal 참조 없음(동적 소비 미확인) |
| 217 | lightDR / 뇌전보호의 | 14650 | 1 / pct | [0.04,0.07,0.11,0.16,0.22] | armor,gloves | lDR / 55 | — | 직접 literal 참조 없음(동적 소비 미확인) |
| 218 | darkDR / 암흑보호의 | 14651 | 1 / pct | [0.04,0.07,0.11,0.16,0.22] | armor,shield | dkDR / 50 | — | 직접 literal 참조 없음(동적 소비 미확인) |
| 219 | poisonDRdef / 해독의 | 14652 | 1 / pct | [0.04,0.07,0.11,0.16,0.22] | armor,boots | psDR / 50 | — | 직접 literal 참조 없음(동적 소비 미확인) |
| 220 | allDR / 만물보호의 | 14653 | 1 / pct | [0.02,0.04,0.06,0.09,0.13] | armor | aDR / 15 | {"tierW":[40,30,20,8,2]} | 직접 literal 참조 없음(동적 소비 미확인) |
| 221 | eliteDR / 정예보호의 | 14654 | 1 / pct | [0.05,0.08,0.14,0.22,0.3] | armor | eDR / 35 | — | 직접 literal 참조 없음(동적 소비 미확인) |
| 222 | stunRes / 경직저항의 | 14655 | 1 / pct | [0.06,0.1,0.16,0.24,0.34] | pants,gloves | stRs / 55 | — | 34982, 41348, 43463, 43488, 43585 |
| 223 | freezeRes / 빙결저항의 | 14656 | 1 / pct | [0.06,0.1,0.16,0.24,0.34] | pants,boots | fzRs / 55 | — | 직접 literal 참조 없음(동적 소비 미확인) |
| 224 | slowRes / 감속저항의 | 14657 | 1 / pct | [0.06,0.1,0.16,0.24,0.34] | boots | slRs / 55 | — | 34699, 39934 |
| 225 | knockbackRes / 넉백저항의 | 14658 | 1 / pct | [0.08,0.14,0.22,0.32,0.44] | armor,shield | kbRs / 50 | — | 직접 literal 참조 없음(동적 소비 미확인) |
| 226 | dashRange / 돌진거리의 | 14659 | 0 / pct | [0.05,0.08,0.14,0.22,0.3] | boots | dshR / 45 | — | 직접 literal 참조 없음(동적 소비 미확인) |
| 227 | dashCooldown / 돌진쿨감의 | 14660 | 1 / pct | [-0.04,-0.07,-0.11,-0.16,-0.22] | boots,cloak | dshCd / 45 | — | 32789 |
| 228 | movSpeedCombat / 전투질주의 | 14661 | 0 / pct | [0.03,0.05,0.08,0.12,0.18] | boots | mspC / 40 | — | 27927 |
| 229 | movSpeedOOC / 평화질주의 | 14662 | 0 / pct | [0.06,0.1,0.16,0.24,0.34] | boots,cloak | mspO / 60 | — | 27928 |
| 230 | pickupRadius / 습득범위의 | 14663 | 1 / val | [10,20,35,55,80] | boots | pkRd / 55 | — | 직접 literal 참조 없음(동적 소비 미확인) |
| 231 | strFlat / 힘의 | 14666 | 0 / val | [5,10,18,28,40] | ring,neck,belt,bracelet,headband | strF / 60 | — | 27907 |
| 232 | dexFlat / 민첩의 | 14667 | 0 / val | [5,10,18,28,40] | ring,neck,belt,bracelet,headband | dexF / 60 | — | 27907 |
| 233 | intFlat / 지능의 | 14668 | 0 / val | [5,10,18,28,40] | ring,neck,belt,bracelet,headband | intF / 60 | — | 27907 |
| 234 | vitFlat / 활력의 | 14669 | 0 / val | [5,10,18,28,40] | ring,neck,belt,bracelet,headband | vitF / 60 | — | 27907 |
| 235 | allStat / 만능의 | 14670 | 1 / val | [2,4,7,11,16] | neck | allS / 15 | {"tierW":[40,30,20,8,2]} | 직접 literal 참조 없음(동적 소비 미확인) |
| 236 | maxSTPct / 지구력의 | 14671 | 0 / pct | [0.05,0.08,0.14,0.22,0.3] | belt,bracelet | stPct / 55 | — | 직접 literal 참조 없음(동적 소비 미확인) |
| 237 | maxMPPct / 마나력의 | 14672 | 0 / pct | [0.05,0.08,0.14,0.22,0.3] | headband,neck | mpPct / 55 | — | 51379 |
| 238 | resourceOnHit / 타격자원의 | 14673 | 1 / val | [1,2,3,5,8] | ring | rsOH / 35 | — | 직접 literal 참조 없음(동적 소비 미확인) |
| 239 | fireResMax / 화염한계의 | 14674 | 1 / val | [1,2,3,4,5] | neck,ring | fRM / 20 | {"tierW":[40,30,20,8,2]} | 직접 literal 참조 없음(동적 소비 미확인) |
| 240 | iceResMax / 빙결한계의 | 14675 | 1 / val | [1,2,3,4,5] | neck,ring | iRM / 20 | {"tierW":[40,30,20,8,2]} | 직접 literal 참조 없음(동적 소비 미확인) |
| 241 | lightResMax / 뇌전한계의 | 14676 | 1 / val | [1,2,3,4,5] | neck,ring | lRM / 20 | {"tierW":[40,30,20,8,2]} | 직접 literal 참조 없음(동적 소비 미확인) |
| 242 | darkResMax / 암흑한계의 | 14677 | 1 / val | [1,2,3,4,5] | neck,ring | dRM / 20 | {"tierW":[40,30,20,8,2]} | 직접 literal 참조 없음(동적 소비 미확인) |
| 243 | poisonResMax / 독한계의 | 14678 | 1 / val | [1,2,3,4,5] | neck,ring | pRM / 20 | {"tierW":[40,30,20,8,2]} | 직접 literal 참조 없음(동적 소비 미확인) |
| 244 | skillCdRed / 스킬쿨감의 | 14679 | 1 / pct | [-0.04,-0.07,-0.11,-0.16,-0.22] | headband | skCd / 50 | — | 28065 |
| 245 | potionCdRed / 물약쿨감의 | 14680 | 1 / pct | [-0.04,-0.07,-0.11,-0.16,-0.22] | belt | ptCd / 55 | — | 28228 |
| 246 | craftBonus / 장인의 | 14681 | 1 / pct | [0.03,0.05,0.08,0.12,0.18] | ring | crfB / 15 | {"tierW":[40,30,20,8,2]} | 직접 literal 참조 없음(동적 소비 미확인) |
| 247 | goldFind / 탐욕의 | 14682 | 1 / pct | [0.08,0.14,0.22,0.32,0.44] | belt | glFn / 55 | — | 직접 literal 참조 없음(동적 소비 미확인) |
| 248 | expBonusRing / 수련의 | 14683 | 1 / pct | [0.05,0.08,0.14,0.22,0.3] | ring | exR / 50 | — | 직접 literal 참조 없음(동적 소비 미확인) |
| 249 | dropRateAcc / 수집의 | 14684 | 1 / pct | [0.05,0.08,0.14,0.22,0.3] | neck,ring | drAc / 45 | — | 직접 literal 참조 없음(동적 소비 미확인) |
| 250 | demonDmg / 악마의힘 | 14685 | 1 / pct | [0.08,0.14,0.22,0.32,0.44] | bracelet | dmDm / 55 | {"brType":"demon"} | 직접 literal 참조 없음(동적 소비 미확인) |
| 251 | demonDR / 악마보호의 | 14686 | 1 / pct | [0.05,0.08,0.14,0.22,0.3] | bracelet | dmDR / 50 | {"brType":"demon"} | 직접 literal 참조 없음(동적 소비 미확인) |
| 252 | soulHarvest / 영혼수확의 | 14687 | 1 / val | [1,2,3,5,8] | bracelet | slHv / 40 | {"brType":"demon"} | 직접 literal 참조 없음(동적 소비 미확인) |
| 253 | lifeLeechBr / 생명흡수의 | 14688 | 1 / pct | [0.005,0.01,0.018,0.028,0.04] | bracelet | llBr / 40 | {"brType":"life"} | 직접 literal 참조 없음(동적 소비 미확인) |
| 254 | overhealShield / 과치유수호의 | 14689 | 1 / pct | [0.1,0.18,0.28,0.4,0.55] | bracelet | ohSh / 25 | {"brType":"life","tierW":[40,30,20,8,2]} | 직접 literal 참조 없음(동적 소비 미확인) |
| 255 | onFullManaDmg / 만마력의 | 14690 | 1 / pct | [0.08,0.14,0.22,0.32,0.44] | headband | fmDm / 40 | — | 직접 literal 참조 없음(동적 소비 미확인) |
| 256 | whileMovingDR / 이동방어의 | 14691 | 1 / pct | [0.04,0.07,0.11,0.16,0.22] | belt | wmDR / 40 | — | 직접 literal 참조 없음(동적 소비 미확인) |
| 257 | whileStationaryDmg / 정지공세의 | 14692 | 1 / pct | [0.08,0.14,0.22,0.32,0.44] | ring | wsDm / 35 | — | 직접 literal 참조 없음(동적 소비 미확인) |
| 258 | afterDodgeDmg / 회피공세의 | 14693 | 1 / pct | [0.1,0.18,0.28,0.4,0.55] | ring,bracelet | adDm / 30 | — | 직접 literal 참조 없음(동적 소비 미확인) |
| 259 | afterParryShield / 패링보호의 | 14694 | 1 / val | [10,18,28,40,60] | bracelet,shield | apSh / 35 | — | 직접 literal 참조 없음(동적 소비 미확인) |
| 260 | comboThreshold / 콤보폭발의 | 14695 | 1 / pct | [0.05,0.08,0.14,0.22,0.3] | ring,neck | cmTh / 30 | — | 직접 literal 참조 없음(동적 소비 미확인) |
| 261 | flatPhysDmg / 물리타격의 | 14697 | 0 / val | [8,16,28,44,65] | wpn | fPD / 80 | — | 직접 literal 참조 없음(동적 소비 미확인) |
| 262 | flatFireDmg / 화염타격의 | 14698 | 0 / val | [6,12,22,36,52] | wpn | fFrD / 65 | — | 직접 literal 참조 없음(동적 소비 미확인) |
| 263 | flatIceDmg / 빙결타격의 | 14699 | 0 / val | [5,10,18,30,44] | wpn | fIcD / 65 | — | 직접 literal 참조 없음(동적 소비 미확인) |
| 264 | flatLightDmg / 뇌전타격의 | 14700 | 0 / val | [7,14,24,38,55] | wpn | fLtD / 65 | — | 직접 literal 참조 없음(동적 소비 미확인) |
| 265 | flatDarkDmg / 암흑타격의 | 14701 | 0 / val | [6,12,22,36,52] | wpn | fDkD / 60 | — | 직접 literal 참조 없음(동적 소비 미확인) |
| 266 | flatPoisonDmg / 독타격의 | 14702 | 0 / val | [5,10,18,30,44] | wpn | fPoD / 60 | — | 직접 literal 참조 없음(동적 소비 미확인) |
| 267 | minDmgFlat / 최소공격의 | 14703 | 0 / val | [3,6,10,16,24] | wpn | mnDm / 55 | — | 직접 literal 참조 없음(동적 소비 미확인) |
| 268 | maxDmgFlat / 최대공격의 | 14704 | 0 / val | [5,10,18,28,40] | wpn | mxDm / 55 | — | 직접 literal 참조 없음(동적 소비 미확인) |
| 269 | atkPctAll / 전투력의 | 14705 | 0 / pct | [0.06,0.1,0.16,0.24,0.34] | wpn,helm | aAll / 50 | — | 직접 literal 참조 없음(동적 소비 미확인) |
| 270 | weaponRange / 무기사거리의 | 14706 | 0 / pct | [0.04,0.07,0.11,0.16,0.22] | wpn | wRng / 55 | — | 직접 literal 참조 없음(동적 소비 미확인) |
| 271 | bowRange / 활사거리의 | 14707 | 0 / pct | [0.05,0.08,0.14,0.22,0.3] | xbow | bRng / 55 | — | 직접 literal 참조 없음(동적 소비 미확인) |
| 272 | doubleStrike / 이중타의 | 14708 | 1 / prob | [0.02,0.04,0.06,0.09,0.13] | wpn | dStr / 20 | {"tierW":[40,30,20,8,2]} | 직접 literal 참조 없음(동적 소비 미확인) |
| 273 | multiShot / 다중발사의 | 14709 | 1 / prob | [0.03,0.05,0.08,0.12,0.18] | xbow | mSht / 20 | {"tierW":[40,30,20,8,2]} | 직접 literal 참조 없음(동적 소비 미확인) |
| 274 | pierceChance / 관통의 | 14710 | 0 / prob | [0.05,0.08,0.14,0.22,0.3] | xbow | prCh / 50 | — | 직접 literal 참조 없음(동적 소비 미확인) |
| 275 | pierceCount / 관통횟수의 | 14711 | 0 / cnt | [1,1,2,2,3] | xbow | prCt / 40 | — | 직접 literal 참조 없음(동적 소비 미확인) |
| 276 | pierceDmgKeep / 관통유지의 | 14712 | 1 / pct | [0.1,0.18,0.28,0.4,0.55] | xbow | prDK / 40 | — | 직접 literal 참조 없음(동적 소비 미확인) |
| 277 | chainDmgKeep / 연쇄유지의 | 14713 | 1 / pct | [0.1,0.18,0.28,0.4,0.55] | wpn | chDK / 40 | — | 직접 literal 참조 없음(동적 소비 미확인) |
| 278 | splashRadius / 범위확장의 | 14714 | 0 / pct | [0.06,0.1,0.16,0.24,0.34] | xbow | spRd / 45 | — | 직접 literal 참조 없음(동적 소비 미확인) |
| 279 | splashDmg / 범위피해의 | 14715 | 1 / pct | [0.1,0.18,0.28,0.4,0.55] | xbow | spDm / 35 | — | 직접 literal 참조 없음(동적 소비 미확인) |
| 280 | chargeAtkDmg / 돌진공격의 | 14716 | 0 / pct | [0.1,0.18,0.28,0.4,0.55] | wpn | chAD / 50 | — | 직접 literal 참조 없음(동적 소비 미확인) |
| 281 | counterAtkDmg / 반격공격의 | 14717 | 0 / pct | [0.1,0.18,0.28,0.4,0.55] | wpn | ctAD / 45 | — | 직접 literal 참조 없음(동적 소비 미확인) |
| 282 | backstabDmg / 후방타의 | 14718 | 1 / pct | [0.12,0.2,0.32,0.46,0.65] | wpn | bkSt / 35 | — | 직접 literal 참조 없음(동적 소비 미확인) |
| 283 | executeDmg / 처형의 | 14719 | 1 / pct | [0.15,0.25,0.4,0.6,0.85] | wpn | exDm / 30 | {"tierW":[40,30,20,8,2]} | 직접 literal 참조 없음(동적 소비 미확인) |
| 284 | dotTickRate / 침식가속의 | 14720 | 0 / pct | [0.05,0.08,0.14,0.22,0.3] | wpn | dtTk / 40 | — | 직접 literal 참조 없음(동적 소비 미확인) |
| 285 | bleedDps / 출혈의 | 14721 | 0 / dps | [5,10,18,28,40] | wpn | blDp / 60 | — | 직접 literal 참조 없음(동적 소비 미확인) |
| 286 | bleedDuration / 출혈지속의 | 14722 | 0 / pct | [0.1,0.18,0.28,0.4,0.55] | wpn | blDr / 50 | — | 직접 literal 참조 없음(동적 소비 미확인) |
| 287 | flatMagicDmg / 마법타격의 | 14723 | 0 / val | [6,12,22,36,52] | helm | fMgD / 60 | — | 직접 literal 참조 없음(동적 소비 미확인) |
| 288 | spellAmp / 주문증폭의 | 14724 | 0 / pct | [0.05,0.08,0.14,0.22,0.3] | helm | spAm / 45 | — | 직접 literal 참조 없음(동적 소비 미확인) |
| 289 | killStreakDmg / 연살뎀의 | 14725 | 1 / pct | [0.03,0.05,0.08,0.12,0.18] | wpn | kSD / 35 | — | 직접 literal 참조 없음(동적 소비 미확인) |
| 290 | killStreakSpd / 연살속의 | 14726 | 1 / pct | [0.02,0.04,0.06,0.09,0.13] | wpn | kSS / 35 | — | 직접 literal 참조 없음(동적 소비 미확인) |
| 291 | momentumDmg / 기세의 | 14727 | 1 / pct | [0.08,0.14,0.22,0.32,0.44] | wpn | momD / 35 | — | 직접 literal 참조 없음(동적 소비 미확인) |
| 292 | standingDmg / 정지공격의 | 14728 | 1 / pct | [0.1,0.18,0.28,0.4,0.55] | wpn | stdD / 35 | — | 직접 literal 참조 없음(동적 소비 미확인) |
| 293 | movingDmg / 이동공격의 | 14729 | 1 / pct | [0.08,0.14,0.22,0.32,0.44] | wpn | mvDm / 35 | — | 직접 literal 참조 없음(동적 소비 미확인) |
| 294 | recentParryDmg / 패링공세의 | 14730 | 1 / pct | [0.12,0.2,0.32,0.46,0.65] | wpn | rpDm / 30 | — | 직접 literal 참조 없음(동적 소비 미확인) |
| 295 | nearDeathDmg / 임사폭발의 | 14731 | 1 / pct | [0.2,0.35,0.55,0.8,1.1] | wpn | ndDm / 20 | {"tierW":[40,30,20,8,2]} | 직접 literal 참조 없음(동적 소비 미확인) |
| 296 | fullStaminaDmg / 만기력공의 | 14732 | 1 / pct | [0.08,0.14,0.22,0.32,0.44] | wpn | fsDm / 35 | — | 직접 literal 참조 없음(동적 소비 미확인) |
| 297 | fullManaDmg2 / 만마력공의 | 14733 | 1 / pct | [0.08,0.14,0.22,0.32,0.44] | wpn,helm | fmD2 / 35 | — | 직접 literal 참조 없음(동적 소비 미확인) |
| 298 | freshKillDmg / 신선처치의 | 14734 | 1 / pct | [0.1,0.18,0.28,0.4,0.55] | wpn | fkDm / 35 | — | 직접 literal 참조 없음(동적 소비 미확인) |
| 299 | stunDuration / 경직연장의 | 14735 | 1 / pct | [0.1,0.18,0.28,0.4,0.55] | wpn | stDr / 45 | — | 직접 literal 참조 없음(동적 소비 미확인) |
| 300 | freezeDuration / 빙결연장의 | 14736 | 1 / pct | [0.1,0.18,0.28,0.4,0.55] | wpn | fzDr / 45 | — | 직접 literal 참조 없음(동적 소비 미확인) |
| 301 | slowEfficiency / 둔화강화의 | 14737 | 1 / pct | [0.1,0.18,0.28,0.4,0.55] | wpn | slEf / 40 | — | 직접 literal 참조 없음(동적 소비 미확인) |
| 302 | poisonStack / 독중첩의 | 14738 | 1 / cnt | [1,1,2,2,3] | wpn | poSk / 35 | — | 직접 literal 참조 없음(동적 소비 미확인) |
| 303 | bleedStack / 출혈중첩의 | 14739 | 1 / cnt | [1,1,2,2,3] | wpn | blSk / 35 | — | 직접 literal 참조 없음(동적 소비 미확인) |
| 304 | igniteDmg / 발화강화의 | 14740 | 0 / pct | [0.08,0.14,0.22,0.32,0.44] | helm | igDm / 50 | — | 직접 literal 참조 없음(동적 소비 미확인) |
| 305 | frostbiteDmg / 동상강화의 | 14741 | 0 / pct | [0.08,0.14,0.22,0.32,0.44] | helm | fbDm / 50 | — | 직접 literal 참조 없음(동적 소비 미확인) |
| 306 | shockDmg / 감전강화의 | 14742 | 0 / pct | [0.08,0.14,0.22,0.32,0.44] | helm | skDm / 50 | — | 직접 literal 참조 없음(동적 소비 미확인) |
| 307 | critMultiOnLowHP / 사선회심의 | 14743 | 1 / pct | [0.1,0.2,0.3,0.4,0.5] | wpn | cmLH / 25 | {"tierW":[40,30,20,8,2]} | 직접 literal 참조 없음(동적 소비 미확인) |
| 308 | armorDefPct / 갑옷강화의 | 14745 | 0 / pct | [0.06,0.1,0.16,0.24,0.34] | armor | adPc / 65 | — | 직접 literal 참조 없음(동적 소비 미확인) |
| 309 | shieldBlockDR / 블록흡수의 | 14746 | 1 / pct | [0.04,0.07,0.11,0.16,0.22] | shield | sBDR / 50 | — | 28053 |
| 310 | shieldBashDmg / 방패타격의 | 14747 | 1 / pct | [0.1,0.18,0.28,0.4,0.55] | shield | sBsD / 45 | — | 직접 literal 참조 없음(동적 소비 미확인) |
| 311 | shieldStagger / 방패경직의 | 14748 | 1 / val | [3,6,10,16,24] | shield | sStg / 45 | — | 직접 literal 참조 없음(동적 소비 미확인) |
| 312 | glovesAtkSpd / 격투속의 | 14749 | 0 / pct | [0.03,0.05,0.08,0.12,0.18] | gloves | gAS / 55 | — | 33364, 58625, 58630, 58648 |
| 313 | glovesCritDmg / 격투회심의 | 14750 | 1 / pct | [0.06,0.1,0.16,0.24,0.34] | gloves | gCD / 45 | — | 27998 |
| 314 | glovesStagger / 격투경직의 | 14751 | 0 / val | [2,4,7,11,16] | gloves | gStg / 50 | — | 직접 literal 참조 없음(동적 소비 미확인) |
| 315 | pantsHPRegen / 하반재생의 | 14752 | 0 / val | [1,2,3,5,8] | pants | pHRg / 55 | — | 직접 literal 참조 없음(동적 소비 미확인) |
| 316 | pantsCCDuration / CC단축의 | 14753 | 1 / pct | [-0.06,-0.1,-0.16,-0.24,-0.34] | pants | pCCD / 45 | — | 직접 literal 참조 없음(동적 소비 미확인) |
| 317 | bootsDashDmg / 돌진타의 | 14754 | 1 / pct | [0.1,0.18,0.28,0.4,0.55] | boots | bDD / 45 | — | 직접 literal 참조 없음(동적 소비 미확인) |
| 318 | bootsChargeRange / 돌진범위의 | 14755 | 0 / pct | [0.05,0.08,0.14,0.22,0.3] | boots | bCR / 45 | — | 직접 literal 참조 없음(동적 소비 미확인) |
| 319 | bootsMSOnKill / 처치질주의 | 14756 | 1 / pct | [0.04,0.07,0.11,0.16,0.22] | boots | bMOK / 40 | — | 직접 literal 참조 없음(동적 소비 미확인) |
| 320 | cloakDodgeDR / 회피감쇠의 | 14757 | 1 / pct | [0.06,0.1,0.16,0.24,0.34] | cloak | cDDR / 35 | — | 직접 literal 참조 없음(동적 소비 미확인) |
| 321 | cloakMSPct / 은신질주의 | 14758 | 0 / pct | [0.03,0.05,0.08,0.12,0.18] | cloak | cMSP / 50 | — | 직접 literal 참조 없음(동적 소비 미확인) |
| 322 | cloakElemDR / 속성감쇠의 | 14759 | 1 / pct | [0.03,0.05,0.08,0.12,0.18] | cloak | cEDR / 40 | — | 직접 literal 참조 없음(동적 소비 미확인) |
| 323 | burnDR / 화상저항의 | 14760 | 1 / pct | [0.1,0.16,0.24,0.36,0.5] | cloak | brDR / 45 | — | 43533 |
| 324 | helmMPPct / 마나왕관의 | 14761 | 0 / pct | [0.04,0.07,0.11,0.16,0.22] | helm | hMPP / 50 | — | 직접 literal 참조 없음(동적 소비 미확인) |
| 325 | helmCastSpd / 시전왕관의 | 14762 | 0 / pct | [0.04,0.07,0.11,0.16,0.22] | helm | hCSp / 50 | — | 직접 literal 참조 없음(동적 소비 미확인) |
| 326 | helmCooldown / 쿨감왕관의 | 14763 | 0 / pct | [-0.04,-0.07,-0.11,-0.16,-0.22] | helm | hCd / 45 | — | 28065 |
| 327 | helmExpPct / 경험왕관의 | 14764 | 1 / pct | [0.05,0.08,0.14,0.22,0.3] | helm | hExp / 45 | — | 직접 literal 참조 없음(동적 소비 미확인) |
| 328 | hybAtkHP / 공생의 | 14766 | 1 / pct | [0.04,0.07,0.11,0.16,0.22] | armor | hAH / 30 | — | 직접 literal 참조 없음(동적 소비 미확인) |
| 329 | hybDefSpd / 수질의 | 14767 | 1 / pct | [0.03,0.05,0.08,0.12,0.18] | boots | hDS / 30 | — | 직접 literal 참조 없음(동적 소비 미확인) |
| 330 | hybCritLeech / 회심흡의 | 14768 | 1 / pct | [0.005,0.01,0.015,0.02,0.03] | wpn | hCL / 20 | {"tierW":[40,30,20,8,2]} | 직접 literal 참조 없음(동적 소비 미확인) |
| 331 | hybHPMP / 체마의 | 14769 | 0 / val | [30,60,100,150,220] | armor | hHM / 25 | — | 직접 literal 참조 없음(동적 소비 미확인) |
| 332 | hybHPST / 체기의 | 14770 | 0 / val | [30,60,100,150,220] | armor | hHS / 25 | — | 직접 literal 참조 없음(동적 소비 미확인) |
| 333 | hybMPST / 마기의 | 14771 | 0 / val | [20,40,70,110,160] | belt | hMSt / 25 | — | 직접 literal 참조 없음(동적 소비 미확인) |
| 334 | hybAllRegen / 전재생의 | 14772 | 0 / val | [1,2,3,5,8] | armor | hAR / 20 | {"tierW":[40,30,20,8,2]} | 직접 literal 참조 없음(동적 소비 미확인) |
| 335 | hybStrDex / 힘민의 | 14773 | 0 / val | [3,6,10,16,24] | ring | hSD / 30 | — | 직접 literal 참조 없음(동적 소비 미확인) |
| 336 | hybStrInt / 힘지의 | 14774 | 0 / val | [3,6,10,16,24] | ring | hSI / 30 | — | 직접 literal 참조 없음(동적 소비 미확인) |
| 337 | hybDexInt / 민지의 | 14775 | 0 / val | [3,6,10,16,24] | headband | hDI / 30 | — | 직접 literal 참조 없음(동적 소비 미확인) |
| 338 | hybLckGrit / 운근의 | 14776 | 0 / val | [5,10,18,28,40] | neck | hLG / 25 | — | 직접 literal 참조 없음(동적 소비 미확인) |
| 339 | hybDropExp / 수확의 | 14777 | 1 / pct | [0.04,0.07,0.11,0.16,0.22] | boots | hDE / 30 | — | 직접 literal 참조 없음(동적 소비 미확인) |
| 340 | hybFireIce / 빙화의 | 14778 | 1 / pct | [0.06,0.1,0.16,0.24,0.34] | wpn | hFI / 25 | — | 직접 literal 참조 없음(동적 소비 미확인) |
| 341 | hybLightDark / 뇌암의 | 14779 | 1 / pct | [0.06,0.1,0.16,0.24,0.34] | wpn | hLkD / 25 | — | 직접 literal 참조 없음(동적 소비 미확인) |
| 342 | hybMeleeSpell / 근마의 | 14780 | 1 / pct | [0.05,0.08,0.14,0.22,0.3] | wpn,helm | hMS / 25 | — | 직접 literal 참조 없음(동적 소비 미확인) |
| 343 | hybElemDotDmg / 속성침식의 | 14781 | 1 / pct | [0.06,0.1,0.16,0.24,0.34] | wpn,helm | hEDD / 30 | — | 직접 literal 참조 없음(동적 소비 미확인) |
| 344 | ringFireDmg / 화염반지의 | 14784 | 1 / pct | [0.06,0.1,0.16,0.24,0.34] | ring | rFD / 50 | — | 직접 literal 참조 없음(동적 소비 미확인) |
| 345 | ringIceDmg / 빙결반지의 | 14785 | 1 / pct | [0.06,0.1,0.16,0.24,0.34] | ring | rID / 50 | — | 직접 literal 참조 없음(동적 소비 미확인) |
| 346 | ringLightDmg / 뇌전반지의 | 14786 | 1 / pct | [0.06,0.1,0.16,0.24,0.34] | ring | rLD / 50 | — | 직접 literal 참조 없음(동적 소비 미확인) |
| 347 | ringDarkDmg / 암흑반지의 | 14787 | 1 / pct | [0.06,0.1,0.16,0.24,0.34] | ring | rDD / 50 | — | 직접 literal 참조 없음(동적 소비 미확인) |
| 348 | ringPoisonDmg / 독반지의 | 14788 | 1 / pct | [0.06,0.1,0.16,0.24,0.34] | ring | rPD / 50 | — | 직접 literal 참조 없음(동적 소비 미확인) |
| 349 | ringDmgPerCombo / 콤보반지의 | 14789 | 1 / pct | [0.002,0.004,0.006,0.009,0.013] | ring | rDPC / 25 | — | 직접 literal 참조 없음(동적 소비 미확인) |
| 350 | ringMPOnKill / 처치마나의 | 14790 | 1 / val | [3,6,10,16,24] | ring | rMOK / 40 | — | 직접 literal 참조 없음(동적 소비 미확인) |
| 351 | ringProjPierce / 관통반지의 | 14791 | 1 / pct | [0.04,0.07,0.11,0.16,0.22] | ring | rPP / 30 | — | 직접 literal 참조 없음(동적 소비 미확인) |
| 352 | neckAllDmg / 만능목걸이의 | 14793 | 1 / pct | [0.04,0.07,0.11,0.16,0.22] | neck | nAD / 25 | {"tierW":[40,30,20,8,2]} | 직접 literal 참조 없음(동적 소비 미확인) |
| 353 | neckCritDmg / 회심목걸이의 | 14794 | 1 / pct | [0.06,0.1,0.16,0.24,0.34] | neck | nCD / 35 | — | 27998 |
| 354 | neckElemPen / 관통목걸이의 | 14795 | 1 / pct | [0.03,0.05,0.08,0.12,0.18] | neck | nEP / 25 | {"tierW":[40,30,20,8,2]} | 직접 literal 참조 없음(동적 소비 미확인) |
| 355 | neckSkillDmg / 스킬목걸이의 | 14796 | 1 / pct | [0.06,0.1,0.16,0.24,0.34] | neck | nSkD / 35 | — | 직접 literal 참조 없음(동적 소비 미확인) |
| 356 | neckComboMax / 콤보한계의 | 14797 | 1 / val | [5,10,15,20,30] | neck | nCM / 30 | — | 직접 literal 참조 없음(동적 소비 미확인) |
| 357 | neckKillHeal / 처치치유의 | 14798 | 1 / val | [3,6,10,16,24] | neck | nKH / 40 | — | 직접 literal 참조 없음(동적 소비 미확인) |
| 358 | beltSTMax / 지구벨트의 | 14800 | 0 / val | [5,10,18,28,40] | belt | bSTM / 55 | — | 직접 literal 참조 없음(동적 소비 미확인) |
| 359 | beltPotionHP / 포션벨트의 | 14801 | 1 / pct | [0.1,0.18,0.28,0.4,0.55] | belt | bPHP / 50 | — | 직접 literal 참조 없음(동적 소비 미확인) |
| 360 | beltSTRegen / 활력벨트의 | 14802 | 0 / val | [1,2,3,5,8] | belt | bSRg / 50 | — | 직접 literal 참조 없음(동적 소비 미확인) |
| 361 | beltGoldDrop / 탐욕벨트의 | 14803 | 1 / pct | [0.06,0.1,0.16,0.24,0.34] | belt | bGD / 50 | — | 직접 literal 참조 없음(동적 소비 미확인) |
| 362 | headbandMPMax / 마나띠의 | 14805 | 0 / val | [5,10,18,28,40] | headband | hbMM / 55 | — | 직접 literal 참조 없음(동적 소비 미확인) |
| 363 | headbandCastSpd / 시전띠의 | 14806 | 0 / pct | [0.03,0.05,0.08,0.12,0.18] | headband | hbCS / 50 | — | 28050 |
| 364 | headbandMPRegen / 마력띠의 | 14807 | 0 / val | [1,2,3,5,8] | headband | hbMR / 50 | — | 직접 literal 참조 없음(동적 소비 미확인) |
| 365 | headbandSpellDmg / 주술띠의 | 14808 | 1 / pct | [0.06,0.1,0.16,0.24,0.34] | headband | hbSD / 45 | — | 직접 literal 참조 없음(동적 소비 미확인) |
| 366 | headbandElemDmg / 속성띠의 | 14809 | 1 / pct | [0.05,0.08,0.14,0.22,0.3] | headband | hbED / 40 | — | 직접 literal 참조 없음(동적 소비 미확인) |
| 367 | arcWarriorDmg / 전사의힘 | 14812 | 1 / pct | [0.08,0.14,0.22,0.32,0.44] | wpn | awD / 30 | — | 직접 literal 참조 없음(동적 소비 미확인) |
| 368 | arcWarriorHP / 전사생명의 | 14813 | 0 / val | [30,60,100,150,220] | armor | awHP / 30 | — | 직접 literal 참조 없음(동적 소비 미확인) |
| 369 | arcWarriorLifeSteal / 전사흡혈의 | 14814 | 1 / pct | [0.004,0.008,0.014,0.022,0.032] | wpn | awLS / 20 | {"tierW":[40,30,20,8,2]} | 직접 literal 참조 없음(동적 소비 미확인) |
| 370 | arcWarriorPoise / 전사인내의 | 14815 | 0 / val | [5,10,18,28,40] | armor | awPo / 35 | — | 직접 literal 참조 없음(동적 소비 미확인) |
| 371 | arcMageDmg / 마법사의힘 | 14816 | 1 / pct | [0.08,0.14,0.22,0.32,0.44] | helm | amD / 30 | — | 직접 literal 참조 없음(동적 소비 미확인) |
| 372 | arcMageMP / 마법사마나의 | 14817 | 0 / val | [20,40,70,110,160] | headband | amMP / 30 | — | 직접 literal 참조 없음(동적 소비 미확인) |
| 373 | arcMageShield / 마법사수호의 | 14818 | 0 / val | [30,60,100,150,220] | armor | amSh / 30 | — | 직접 literal 참조 없음(동적 소비 미확인) |
| 374 | arcMageElemDmg / 마법사속성의 | 14819 | 1 / pct | [0.06,0.1,0.16,0.24,0.34] | helm | amED / 30 | — | 직접 literal 참조 없음(동적 소비 미확인) |
| 375 | arcRangerDmg / 궁수의힘 | 14820 | 1 / pct | [0.08,0.14,0.22,0.32,0.44] | xbow | arD2 / 30 | — | 직접 literal 참조 없음(동적 소비 미확인) |
| 376 | arcRangerRange / 궁수사거리의 | 14821 | 0 / pct | [0.05,0.08,0.14,0.22,0.3] | xbow | arRg / 30 | — | 직접 literal 참조 없음(동적 소비 미확인) |
| 377 | arcRangerPierce / 궁수관통의 | 14822 | 1 / pct | [0.04,0.07,0.11,0.16,0.22] | xbow | arPr / 30 | — | 직접 literal 참조 없음(동적 소비 미확인) |
| 378 | arcRangerMS / 궁수질주의 | 14823 | 0 / pct | [0.03,0.05,0.08,0.12,0.18] | boots | arMS / 35 | — | 직접 literal 참조 없음(동적 소비 미확인) |
| 379 | arcTankHP / 탱크생명의 | 14824 | 0 / val | [40,80,130,200,280] | armor | atHP / 30 | — | 직접 literal 참조 없음(동적 소비 미확인) |
| 380 | arcTankDef / 탱크방어의 | 14825 | 0 / val | [5,10,18,28,40] | armor,shield | atDf / 30 | — | 직접 literal 참조 없음(동적 소비 미확인) |
| 381 | arcTankBlock / 탱크블록의 | 14826 | 0 / pct | [0.03,0.05,0.08,0.12,0.18] | shield | atBk / 30 | — | 직접 literal 참조 없음(동적 소비 미확인) |
| 382 | arcTankThorns / 탱크가시의 | 14827 | 1 / val | [4,8,14,22,32] | armor | atTh / 35 | — | 직접 literal 참조 없음(동적 소비 미확인) |
| 383 | arcAssassinCrit / 암살회심의 | 14828 | 1 / pct | [0.02,0.04,0.06,0.09,0.13] | wpn | aaCr / 25 | — | 직접 literal 참조 없음(동적 소비 미확인) |
| 384 | arcAssassinBack / 암살후방의 | 14829 | 1 / pct | [0.15,0.25,0.4,0.6,0.85] | wpn | aaBk / 20 | {"tierW":[40,30,20,8,2]} | 직접 literal 참조 없음(동적 소비 미확인) |
| 385 | arcAssassinPoison / 암살독의 | 14830 | 1 / pct | [0.08,0.14,0.22,0.32,0.44] | wpn | aaPo / 30 | — | 직접 literal 참조 없음(동적 소비 미확인) |
| 386 | arcAssassinDodge / 암살회피의 | 14831 | 1 / pct | [0.02,0.04,0.06,0.09,0.13] | cloak | aaDg / 25 | — | 직접 literal 참조 없음(동적 소비 미확인) |
| 387 | endBossKiller / 종결자의 | 14833 | 1 / pct | [0.1,0.18,0.28,0.4,0.55] | wpn | eBK / 15 | {"tierW":[40,30,20,8,2]} | 직접 literal 참조 없음(동적 소비 미확인) |
| 388 | endSurvival / 생존자의 | 14834 | 1 / pct | [0.05,0.08,0.14,0.22,0.3] | armor | eSv / 15 | {"tierW":[40,30,20,8,2]} | 직접 literal 참조 없음(동적 소비 미확인) |
| 389 | endShield / 종결수호의 | 14835 | 0 / val | [50,100,180,280,400] | armor | eSh / 15 | — | 직접 literal 참조 없음(동적 소비 미확인) |
| 390 | endCritDmg / 종결회심의 | 14836 | 1 / pct | [0.1,0.2,0.3,0.4,0.5] | wpn | eCD / 10 | {"tierW":[40,30,20,8,2]} | 직접 literal 참조 없음(동적 소비 미확인) |
| 391 | endAtkFlat / 종결공격의 | 14837 | 0 / val | [30,70,150,260,400] | wpn | eAF / 8 | {"tierW":[40,30,20,8,2],"skewRoll":3} | 직접 literal 참조 없음(동적 소비 미확인) |
| 392 | endAllRes / 종결저항의 | 14838 | 1 / pct | [0.04,0.07,0.11,0.16,0.22] | neck | eAR / 10 | {"tierW":[40,30,20,8,2]} | 직접 literal 참조 없음(동적 소비 미확인) |
| 393 | endAllDmg / 종결파괴의 | 14839 | 1 / pct | [0.05,0.08,0.14,0.22,0.3] | neck | eAD / 8 | {"tierW":[40,30,20,8,2]} | 직접 literal 참조 없음(동적 소비 미확인) |
| 394 | endAllDR / 종결보호의 | 14840 | 1 / pct | [0.03,0.05,0.08,0.12,0.18] | armor | eADR / 8 | {"tierW":[40,30,20,8,2]} | 직접 literal 참조 없음(동적 소비 미확인) |
| 395 | endLeech / 종결흡혈의 | 14841 | 1 / pct | [0.006,0.012,0.02,0.03,0.042] | wpn | eLch / 8 | {"tierW":[40,30,20,8,2]} | 직접 literal 참조 없음(동적 소비 미확인) |
| 396 | endPoise / 종결인내의 | 14842 | 0 / val | [10,20,35,55,80] | armor | ePo / 15 | — | 직접 literal 참조 없음(동적 소비 미확인) |
| 397 | endCooldownAll / 종결쿨감의 | 14843 | 1 / pct | [-0.03,-0.05,-0.08,-0.12,-0.18] | helm | eCA / 10 | {"tierW":[40,30,20,8,2]} | 28065 |
| 398 | endExpBonus / 종결경험의 | 14844 | 1 / pct | [0.08,0.14,0.22,0.32,0.44] | neck | eEB / 15 | — | 직접 literal 참조 없음(동적 소비 미확인) |
| 399 | endDropBonus / 종결약탈의 | 14845 | 1 / pct | [0.08,0.14,0.22,0.32,0.44] | boots | eDB / 15 | — | 직접 literal 참조 없음(동적 소비 미확인) |
| 400 | endMaliceGain / 종결악의의 | 14846 | 1 / pct | [0.1,0.18,0.28,0.4,0.55] | ring | eMG / 20 | — | 직접 literal 참조 없음(동적 소비 미확인) |
| 401 | endSTR / 종결힘의 | 14847 | 0 / val | [8,16,28,44,65] | ring | eStr / 12 | — | 직접 literal 참조 없음(동적 소비 미확인) |
| 402 | endDEX / 종결민첩의 | 14848 | 0 / val | [8,16,28,44,65] | ring | eDex / 12 | — | 직접 literal 참조 없음(동적 소비 미확인) |
| 403 | endINT / 종결지능의 | 14849 | 0 / val | [8,16,28,44,65] | ring | eInt / 12 | — | 직접 literal 참조 없음(동적 소비 미확인) |
| 404 | endLCK / 종결행운의 | 14850 | 0 / val | [15,30,50,75,110] | neck | eLck / 10 | — | 직접 literal 참조 없음(동적 소비 미확인) |
| 405 | endGrit / 종결근성의 | 14851 | 1 / val | [15,30,50,75,110] | neck | eGrt / 10 | — | 직접 literal 참조 없음(동적 소비 미확인) |
| 406 | endKillChain / 종결연살의 | 14852 | 1 / pct | [0.06,0.1,0.16,0.24,0.34] | wpn | eKCh / 15 | — | 직접 literal 참조 없음(동적 소비 미확인) |
| 407 | pierceFlat / 관통력의 | 14853 | 1 / val | [100,200,300,400,500] | xbow | prFl / 40 | {"tierW":[40,30,20,8,2]} | 17348, 28035, 45114, 45172, 45190, 45223 |
| 408 | ancDmg / 전대의 | 14855 | 0 / pct | [0.1,0.18,0.28,0.4,0.55] | ossuary | ancD / 80 | — | 45816 |
| 409 | ancHP / 계승의 | 14856 | 1 / pct | [0.3,0.6,0.9,1.2,1.5] | ossuary | ancT / 70 | — | 45820 |

## 부록 B. 임플리싯·전설19·유니크39·외관27 전수 색인

stat별 참조는 `game.html` 전체에서 그 stat 문자열이 등장하는 모든 행이다(정의/주석/직접 소비 포함). 동적 item[stat] 생성·lookup은 §1의 공통 함수에 따로 있다. 표의 참조만으로 효과가 자연 발동했다고 선언하지 않는다. Q/E·쉴드·부활에 걸친 항목은 **보호**, 이번 수정 0.

### IMPLICIT_TABLE

| key | 정의 G행 | 한글명/설명 | stat | 값 / roll / scale | stat 전체 참조 G행 |
|---|---|---|---|---|---|
| weapon | 15017 | 공격력 +X% | _iAtkPct | {"val":[5,15]} | 15017 |
| bow | 15018 | 관통 확률 +X% | _iPierce | {"val":[5,15]} | 15018 |
| shield | 15019 | 방어율 +X% | _iBlockPct | {"val":[3,8]} | 15019 |
| armor | 15020 | 물리 피해감소 +X% | _iPhysDR | {"val":[3,8]} | 15020 |
| helmet | 15021 | 최대 HP +X | _iMaxHP | {"val":[10,30]} | 15021, 15027, 27913, 51373 |
| gloves | 15022 | 공격속도 +X% | _iAtkSpd | {"val":[3,8]} | 15022, 27994 |
| pants | 15023 | 상태이상 저항 +X% | _iStsRes | {"val":[5,12]} | 15023 |
| boots | 15024 | 이동속도 +X% | _iMovSpd | {"val":[3,8]} | 15024, 27927 |
| ring1 | 15025 | 원소 저항 +X% | _iElemRes | {"val":[8,15]} | 15025, 15026 |
| ring2 | 15026 | 원소 저항 +X% | _iElemRes | {"val":[8,15]} | 15025, 15026 |
| necklace | 15027 | 최대 HP +X% | _iMaxHPPct | {"val":[5,12]} | 15027, 27913, 51373 |
| cape | 15028 | 회피 쿨다운 -X% | _iDashCd | {"val":[5,12]} | 15028 |
| belt | 15029 | 물약 쿨다운 -X% | _iBeltPot | {"val":[3,8]} | 15029 |
| bracelet_demon | 15030 | 부활력 +X% | _iRevPow | {"val":[5,12]} | 15030, 43741, 51404 |
| bracelet_life | 15031 | 최대 HP +X% | _iLifeHPPct | {"val":[5,12]} | 15031, 27913, 51373 |
| headband | 15032 | 마법 데미지 +X% | _iMagDmg | {"val":[5,12]} | 15032, 28008 |
| ossuary | 15033 | 전대 위력 +X% | _iAncPow | {"val":[5,15]} | 15033, 16162, 45816 |

### LEGENDARY_SPECIAL

| key | 정의 G행 | 한글명/설명 | stat | 값 / roll / scale | stat 전체 참조 G행 |
|---|---|---|---|---|---|
| weapon_sword | 15038 | 기검참 3타 콤보 완성 시 분노 20% 즉시 충전 | _lSwordCombo | {"val":0.2} | 15038, 16828, 16829 |
| weapon_dagger | 15039 | 처치 시 이속 +40%(3초) + 다음 공격 크리 보장 | _lDaggerKill | {"val":1} | 15039, 42314, 42696, 42697 |
| weapon_hammer | 15040 | 스태거 발동 시 범위 충격파 (ATK×120%) | _lHammerShock | {"val":1.2} | 15040, 42493, 42494 |
| weapon_mace | 15041 | 스태거 발동 시 범위 충격파 (ATK×100%) | _lMaceShock | {"val":1} | 15041, 42493, 42494 |
| weapon_club | 15042 | 넉백 거리 2배 + 벽충돌 시 추가 데미지 50% | _lClubKB | {"val":2} | 15042, 42473, 42474 |
| weapon_axe | 15043 | 출혈 대상 크리 시 잔여 DoT×300% 즉시 폭발 | _lAxeBleed | {"val":3} | 15043, 42317, 42318 |
| weapon_spear | 15044 | 사슬기동 착지마다 8초간 데미지 +20% 중첩(최대5) | _lSpearStack | {"val":0.2} | 15044, 32373, 42228 |
| bow | 15045 | 치명타 시 추가 투사체 1발 발사 | _lBowCrit | {"val":1} | 15045, 28690, 28691, 28713, 28714 |
| shield | 15046 | 패리 성공 시 반격 데미지 ×2 | _lShieldParry | {"val":2} | 15046, 28036 |
| armor | 15047 | 피격 시 3초 쿨로 HP 5% 즉시 회복 | _lArmorRegen | {"val":0.05} | 15047, 43574, 43575 |
| helmet | 15048 | 스킬 쿨다운 -20% | _lHelmFree | {"val":0.2} | 15048, 28065 |
| gloves | 15049 | 공격속도 +20% + 기본공격에 랜덤 원소 추가 | _lGloveElem | {"val":1} | 15049, 27994, 33360, 33361 |
| pants | 15050 | 이동 중 지속 HP 재생 (초당 HP의 1%) | _lPantsRegen | {"val":0.01} | 15050, 32733, 32734 |
| boots | 15051 | 회피 직후 첫 공격 데미지 +80% | _lBootsEvade | {"val":0.8} | 15051, 32372, 42227, 43434 |
| cape | 15052 | 패리 타이밍 판정 +50% 확대 | _lCapeParry | {"val":0.5} | 15052, 16621, 16622, 16623 |
| ring1 | 15053 | 속성 약점 적중 시 추가 폭발 (ATK×80%) | _lRingElem | {"val":0.8} | 15053, 42327, 42328, 42330 |
| ring2 | 15054 | 처치 시 분노 5% 회복 | _lRingKill | {"val":0.05} | 15054, 42698, 42699 |
| necklace | 15055 | HP 50% 이하 시 전 스킬 쿨다운 -30% | _lNeckLow | {"val":0.3} | 15055, 28065 |
| belt | 15056 | 물약 사용 시 5초간 피해 +15% | _lBeltBuff | {"val":0.15} | 15056, 28222, 28223, 35907, 35908, 42226 |

### UNIQUE_SPECIAL

| key | 정의 G행 | 한글명/설명 | stat | 값 / roll / scale | stat 전체 참조 G행 |
|---|---|---|---|---|---|
| weapon_sword | 15085 | 분노의 최대치가 100% 추가된다 (200%까지) | _uRageMax | {"val":100} | 15085, 27890 |
| weapon_dagger | 15086 | 패링한 탄막의 관통률이 100% 추가된다 | _uDaggerPierce | {"val":1} | 15086, 33482, 33501 |
| weapon_hammer | 15087 | 폭발 데미지 50% 증가 | _uExplDmg | {"val":0.5} | 15087, 35507, 35619 |
| weapon_axe | 15088 | 출혈 적에게 공격 시 HP 5% 흡수 | _uAxeLeech | {"val":0.05} | 15088, 42366, 42367 |
| weapon_mace | 15089 | 적 처치 시 폭발 (최대HP의 30% AoE) | _uMaceExplode | {"val":0.3} | 15089, 42661, 42662 |
| weapon_club | 15090 | 적 스턴 중 데미지 ×3 | _uClubStun | {"val":3} | 15090, 42251 |
| bow | 15091 | 투사체 관통력 50% 증가 | _uBowPierce | {"val":0.5} | 15091, 35561, 35562 |
| shield | 15092 | 보호막이 탄막을 흡수하면 분노 10%를 생성한다 | _uShieldRage | {"val":10} | 15092, 38495 |
| armor | 15093 | 피격 시 25% 확률로 데미지를 분노로 전환 | _uArmorRage | {"val":0.25} | 15093, 43565, 43566 |
| helmet | 15094 | 마법 스킬 데미지 +50% + 마나 소모 -50% | _uHelmMagic | {"val":0.5} | 15094, 28039, 28041 |
| gloves | 15095 | 공격속도 +40% | _uGloveSpd | {"val":0.4} | 15095, 27994 |
| cape | 15096 | 패링 성공 시 분노스킬 쿨다운 {s}초 회복 | _uParryRageCd | {"val":30,"roll":[30,60]} | 15096, 38503 |
| u_n01 | 15100 | 분노가 가득 차면 분노스킬 쿨다운 {s}초 회복 | _uRageFullCd | {"val":600,"roll":[600,1800]} | 15100, 16568 |
| u_n02 | 15101 | 전격이동 경로의 적에게 약화 — 받는 피해 +{p}% (5초) | _uBlinkWeak | {"val":0.5,"roll":[50,100],"scale":0.01} | 15101, 45434 |
| u_n03 | 15102 | 기검참 차징 3타 데미지 +{p}% | _uKiChargeDmg | {"val":0.5,"roll":[50,100],"scale":0.01} | 15102, 16824 |
| u_d01 | 15103 | 패링 후 5초 내 다음 악의구가 반향 구체 2발 추가 (각 {p}%) | _uParryOrbEcho | {"val":0.2,"roll":[20,40],"scale":0.01} | 15103, 24653, 24655, 38513 |
| u_d02 | 15104 | 악의구 폭발이 중독 3중첩 적에게 2차 폭발 ({p}%) | _uOrbPoisonBurst | {"val":0.3,"roll":[30,50],"scale":0.01} | 15104, 24583 |
| u_d03 | 15105 | 완충전 처내기 적중 시 다음 기검참 3타 차징 {s}초 선지급 | _uKiPrecharge | {"val":20,"roll":[20,40]} | 15105, 16835, 33420, 33509, 38515 |
| u_d04 | 15106 | 파쇄가 빙결 적을 맞히면 적당 얼음보주 쿨다운 {s}초 회복 | _uIceShatterRefund | {"val":60,"roll":[60,180]} | 15106, 35422 |
| u_d05 | 15107 | 뇌전걸음 표식 적이 5초 내 죽으면 기동게이지 {p}% 회수 | _uGhostFuel | {"val":0.1,"roll":[10,30],"scale":0.01} | 15107, 42666, 46665 |
| u_d06 | 15108 | 시간왜곡 후 3초 내 첫 기동기 비용 {p}% 환급 | _uWarpStepRefund | {"val":0.1,"roll":[10,30],"scale":0.01} | 15108, 16529, 46614 |
| u_d07 | 15109 | 3단 사슬기동이 적 3명 이상 적중 시 기동게이지 {p}% 회수 | _uChainCrowdRefund | {"val":0.2,"roll":[20,40],"scale":0.01} | 15109, 32366, 32367 |
| u_d08 | 15110 | 기동칼날개가 출혈 적 처치 시 잔상 칼날 1발 ({p}%) | _uChainBleedEcho | {"val":0.25,"roll":[25,45],"scale":0.01} | 15110, 42674, 42676 |
| u_d09 | 15111 | 전류장판 2개를 연속 설치하면 전류선으로 연결 (틱 {p}%) | _uDashCircuit | {"val":0.2,"roll":[20,40],"scale":0.01} | 15111, 45383 |
| u_d10 | 15112 | 지옥강타가 분노 100 이상 소모 시 {p}% 잔류 (최대 30) | _uSlamEmberRage | {"val":0.1,"roll":[10,20],"scale":0.01} | 15112, 46482 |
| u_d11 | 15113 | 천공쇄기가 적 체간을 붕괴시키면 충전 {s}초 회복 | _uSkyPoiseRefund | {"val":120,"roll":[120,300]} | 15113, 19986 |
| u_d12 | 15114 | 회복의 영역 안 Q 패링마다 영역 쿨다운 {s}초 회복 | _uHolyParryCd | {"val":60,"roll":[60,120]} | 15114, 38520, 38521 |
| u_d13 | 15115 | 가시덫 DOT 처치 시 자식 덫 생성 (틱 {p}%, 3초) | _uTrapOffshoot | {"val":0.2,"roll":[20,40],"scale":0.01} | 15115, 42689, 42692 |
| u_d14 | 15116 | 폭풍소환 소용돌이 안 악의구 폭발 시 추가 충격파 ({p}%) | _uVortexOrbPulse | {"val":0.2,"roll":[20,40],"scale":0.01} | 15116, 24623, 24624 |
| u_d15 | 15117 | 석궁이 중독 3중첩 적 적중 시 독 파편이 다른 적에게 ({p}%) | _uBowPoisonRicochet | {"val":0.25,"roll":[25,45],"scale":0.01} | 15117, 35434 |
| u_d16 | 15118 | 공성쇠뇌 철거 시 축적 탄 일제사격 (최대 {n}발) | _uTurretSalvo | {"val":2,"roll":[2,4]} | 15118, 16535 |
| u_d17 | 15119 | 블랙 종료 시 주변 공격 장판 {n}개를 중심으로 수렴 | _uBlackZoneGather | {"val":1,"roll":[1,3]} | 15119, 46849 |
| u_d18 | 15120 | 탄막블랙홀 흡수 10발마다 최대 MP {p}% 환급 (상한 15%) | _uBlackholeManaReturn | {"val":0.01,"roll":[1,3],"scale":0.01} | 15120, 46930 |
| u_d19 | 15121 | 업화선 폭발이 빙결 적을 맞히면 증기 파열 ({p}%) | _uSteamBreak | {"val":0.2,"roll":[20,40],"scale":0.01} | 15121, 24584 |
| u_d20 | 15122 | 에너지쉴드 파괴 시 3초 내 Q 패링에 파열 에너지 저장 ({p}%) | _uShieldBreakBank | {"val":0.2,"roll":[20,40],"scale":0.01} | 15122, 43550 |
| u_d21 | 15123 | 악마화 부활 성공 시 분노 {n} 즉시 충전 | _uDemonRekindle | {"val":20,"roll":[20,40]} | 15123, 43860 |
| u_d22 | 15124 | 체간 붕괴 후 5초 내 악의구가 균열 잔향 1발 ({p}%) | _uPoiseOrbFracture | {"val":0.2,"roll":[20,40],"scale":0.01} | 15124, 19990, 24639, 24641 |
| u_p01 | 15125 | 패링한 탄이 2발로 분열, 반격 피해 +{p}% | _uParrySplit | {"val":1,"roll":[100,1000],"scale":0.01} | 15125, 34663, 34664 |
| u_p02 | 15126 | 패링한 탄에 시전자 관통력 적용 + 관통력 {n} | _uParryPierce | {"val":10,"roll":[10,100]} | 15126, 28035 |

### UNIQUE_ART

외관과 효과는 독립이다. 원화의 같은 번호를 u_d번호 효과와 강제로 연결하지 않는다.

| base | 정의 G행 | id / 이름 | DOM / 월드 경로 |
|---|---|---|---|
| sword | 15061 | ui-03 / 삼획의 맹세 | img/ui/unique-items/ui-03.png / ui-03_cut.png |
| dagger | 15062 | ui-08 / 혈흔을 따르는 날 | img/ui/unique-items/ui-08.png / ui-08_cut.png |
| hammer | 15063 | ui-11 / 체간을 깨는 추 | img/ui/unique-items/ui-11.png / ui-11_cut.png |
| axe | 15064 | ui-24 / 균열을 문 도끼 | img/ui/unique-items/ui-24.png / ui-24_cut.png |
| mace | 15065 | ui-25 / 갇힌 심장의 메이스 | img/ui/unique-items/ui-25.png / ui-25_cut.png |
| club | 15066 | ui-26 / 결정 뿌리의 곤봉 | img/ui/unique-items/ui-26.png / ui-26_cut.png |
| spear | 15067 | ui-27 / 갈고리 날개의 창 | img/ui/unique-items/ui-27.png / ui-27_cut.png |
| crossbow | 15068 | ui-15 / 독을 기억하는 석궁 | img/ui/unique-items/ui-15.png / ui-15_cut.png |
| shield | 15069 | ui-12 / 성역의 숨결 | img/ui/unique-items/ui-12.png / ui-12_cut.png |
| shield | 15069 | ui-20 / 파열을 품은 견갑 | img/ui/unique-items/ui-20.png / ui-20_cut.png |
| armor | 15070 | ui-10 / 꺼지지 않는 심갑 | img/ui/unique-items/ui-10.png / ui-10_cut.png |
| armor | 15070 | ui-21 / 돌아온 자의 흉갑 | img/ui/unique-items/ui-21.png / ui-21_cut.png |
| helmet | 15071 | ui-17 / 무중력의 왕관 | img/ui/unique-items/ui-17.png / ui-17_cut.png |
| gloves | 15072 | ui-04 / 빙편을 거두는 손 | img/ui/unique-items/ui-04.png / ui-04_cut.png |
| gloves | 15072 | ui-16 / 철거자의 명령 | img/ui/unique-items/ui-16.png / ui-16_cut.png |
| gloves | 15072 | ui-19 / 증기 단조의 손 | img/ui/unique-items/ui-19.png / ui-19_cut.png |
| boots | 15073 | ui-05 / 귀환자의 잔보 | img/ui/unique-items/ui-05.png / ui-05_cut.png |
| pants | 15074 | ui-23 / 봉인된 무릎의 각반 | img/ui/unique-items/ui-23.png / ui-23_cut.png |
| belt | 15075 | ui-07 / 셋째 사슬의 고삐 | img/ui/unique-items/ui-07.png / ui-07_cut.png |
| belt | 15075 | ui-13 / 번지는 뿌리의 띠 | img/ui/unique-items/ui-13.png / ui-13_cut.png |
| necklace | 15076 | ui-14 / 폭심의 씨앗 | img/ui/unique-items/ui-14.png / ui-14_cut.png |
| necklace | 15076 | ui-18 / 흡성의 목걸이 | img/ui/unique-items/ui-18.png / ui-18_cut.png |
| ring | 15077 | ui-02 / 독심의 봉환 | img/ui/unique-items/ui-02.png / ui-02_cut.png |
| cape | 15078 | ui-01 / 반향의 장막 | img/ui/unique-items/ui-01.png / ui-01_cut.png |
| bracelet | 15079 | ui-09 / 쌍극의 회로 | img/ui/unique-items/ui-09.png / ui-09_cut.png |
| earring | 15080 | ui-06 / 되감긴 고리 | img/ui/unique-items/ui-06.png / ui-06_cut.png |
| earring | 15080 | ui-22 / 균열을 보는 눈 | img/ui/unique-items/ui-22.png / ui-22_cut.png |

## 부록 C. 결정18 정의·성급·슬롯 전수

아래 opts의 순서와 base는 현재 원본이다. 각 field와 실제 소비를 혼동하지 않는다. 이미지 form/sigil/svg 같은 표현 데이터도 생략하지 않고 원문 JSON으로 싣는다. 이 표는 이식용 신규 JSON 파일이 아니다.

| id | 정의 G행 | 정의 전체(값·슬롯·표현 포함) |
|---|---|---|
| cr_blood_oath | 15191 | {"ko":"피의 맹세","en":"Blood Oath","cat":"atk","slots":["weapon","bow","helmet"],"opts":[["atk",1],["crit",0.06],["hp",2]],"col":"#ba3647","form":"spire","sigil":"✣","svg":"sword"} |
| cr_hunter_eye | 15192 | {"ko":"사냥꾼의 눈","en":"Hunter's Eye","cat":"atk","slots":["weapon","bow","helmet"],"opts":[["crit",0.23],["cdmg",0.04],["drop",0.04]],"col":"#d39c43","form":"eye","sigil":"◉","svg":"reticle"} |
| cr_ruin_heart | 15193 | {"ko":"파멸의 심장","en":"Heart of Ruin","cat":"atk","slots":["weapon","bow","helmet"],"opts":[["cdmg",0.1],["atk",0.2]],"col":"#a72e63","form":"heart","sigil":"✦","svg":"burst"} |
| cr_cinder_crown | 15194 | {"ko":"잿불 왕관","en":"Cinder Crown","cat":"atk","slots":["weapon","bow","helmet"],"opts":[["fire",1.2],["atk",0.25],["crit",0.04]],"col":"#ea6134","form":"crown","sigil":"♜","svg":"flame"} |
| cr_frost_fang | 15195 | {"ko":"서리의 송곳니","en":"Frost Fang","cat":"atk","slots":["weapon","bow","helmet"],"opts":[["ice",1],["stR",0.03]],"col":"#6bc8e5","form":"fang","sigil":"❄","svg":"snowflake"} |
| cr_night_seed | 15196 | {"ko":"밤의 씨앗","en":"Night Seed","cat":"atk","slots":["weapon","bow","helmet"],"opts":[["dark",1.2],["mpR",0.03]],"col":"#8260b9","form":"seed","sigil":"☾","svg":"moon"} |
| cr_storm_nerve | 15197 | {"ko":"폭풍의 신경","en":"Storm Nerve","cat":"atk","slots":["weapon","bow","helmet"],"opts":[["light",1.5],["spd",0.03],["st",1]],"col":"#e5ce56","form":"bolt","sigil":"ϟ","svg":"bolt"} |
| cr_dawn_relic | 15198 | {"ko":"여명의 성해","en":"Dawn Relic","cat":"atk","slots":["weapon","bow","helmet"],"opts":[["holy",1],["hpR",0.04],["mp",1]],"col":"#e5d7aa","form":"sun","sigil":"✺","svg":"sparkle"} |
| cr_martyr_tear | 15199 | {"ko":"순교자의 눈물","en":"Martyr's Tear","cat":"def","slots":["shield","armor","gloves","pants","boots","cape"],"opts":[["hp",8],["hpR",0.04]],"craft":true,"col":"#c74865","form":"tear","sigil":"✢","svg":"heart"} |
| cr_iron_vow | 15200 | {"ko":"무쇠 서약","en":"Iron Vow","cat":"def","slots":["shield","armor","gloves","pants","boots","cape"],"opts":[["def",1],["hp",2]],"col":"#899ca8","form":"shield","sigil":"◇","svg":"shield"} |
| cr_ward_stone | 15201 | {"ko":"봉인의 핵","en":"Warding Core","cat":"def","slots":["shield","armor","gloves","pants","boots","cape"],"opts":[["eDef",0.5],["def",0.2],["mp",1]],"col":"#5eaeb9","form":"core","sigil":"⌘","svg":"shield"} |
| cr_ash_wing | 15202 | {"ko":"재의 날개","en":"Ash Wing","cat":"def","slots":["shield","armor","gloves","pants","boots","cape"],"opts":[["spd",0.08],["st",1]],"col":"#81c6ad","form":"wing","sigil":"↟","svg":"wind"} |
| cr_living_root | 15203 | {"ko":"살아 있는 뿌리","en":"Living Root","cat":"def","slots":["shield","armor","gloves","pants","boots","cape"],"opts":[["hpR",0.15],["hp",3],["def",0.15]],"col":"#5ba87a","form":"root","sigil":"❧","svg":"heart"} |
| cr_grave_lantern | 15204 | {"ko":"무덤의 등불","en":"Grave Lantern","cat":"def","slots":["shield","armor","gloves","pants","boots","cape"],"opts":[["drop",0.15],["eDef",0.1]],"col":"#a8bb57","form":"lantern","sigil":"✧","svg":"clover"} |
| cr_last_breath | 15205 | {"ko":"최후의 숨결","en":"Last Breath","cat":"acc","slots":["belt","bracelet","ring1","ring2","necklace","headband","ossuary","headband2"],"opts":[["st",5],["stR",0.03]],"craft":true,"col":"#d4b25a","form":"hourglass","sigil":"⌛","svg":"gemdot"} |
| cr_deep_well | 15206 | {"ko":"심연의 샘","en":"Abyssal Well","cat":"acc","slots":["belt","bracelet","ring1","ring2","necklace","headband","ossuary","headband2"],"opts":[["mp",5],["mpR",0.03]],"craft":true,"col":"#4d88c9","form":"well","sigil":"◈","svg":"droplet"} |
| cr_pulse_reed | 15207 | {"ko":"맥동하는 갈대","en":"Pulsing Reed","cat":"acc","slots":["belt","bracelet","ring1","ring2","necklace","headband","ossuary","headband2"],"opts":[["stR",0.08],["st",1],["spd",0.02]],"col":"#83c57e","form":"reed","sigil":"⌁","svg":"regen"} |
| cr_oracle_pupil | 15208 | {"ko":"예언자의 동공","en":"Oracle's Pupil","cat":"acc","slots":["belt","bracelet","ring1","ring2","necklace","headband","ossuary","headband2"],"opts":[["mpR",0.08],["mp",1],["crit",0.02]],"col":"#6f9dd5","form":"pupil","sigil":"◎","svg":"regen"} |

| CRYSTAL_STAR index | 원본 G행 | 정의 | 비용 배율 |
|---|---|---|---|
| 0 | 15277 | {"name":"조각","en":"Fragment","mul":1,"color":"#888888"} | 1 |
| 1 | 15278 | {"name":"파편","en":"Shard","mul":2,"color":"#44cc44"} | 1.5 |
| 2 | 15279 | {"name":"유물","en":"Relic","mul":3.5,"color":"#4488ff"} | 2.5 |
| 3 | 15280 | {"name":"순수유물","en":"Pure Relic","mul":6,"color":"#cc44ff"} | 4 |
| 4 | 15281 | {"name":"완전유물","en":"Perfect Relic","mul":10,"color":"#ffaa00"} | 7 |

| 슬롯 index | SLOT_NAMES G:15176 | _AFSLOT | 결정 분류 |
|---|---|---|---|
| 0 | weapon | wpn | atk |
| 1 | shield | shield | armor |
| 2 | boots | boots | armor |
| 3 | armor | armor | armor |
| 4 | helmet | helm | atk |
| 5 | bow | xbow | atk |
| 6 | gloves | gloves | armor |
| 7 | pants | pants | armor |
| 8 | belt | belt | acc |
| 9 | necklace | neck | acc |
| 10 | ring1 | ring | acc |
| 11 | ring2 | ring | acc |
| 12 | cape | cloak | armor |
| 13 | bracelet | bracelet | acc |
| 14 | headband | headband | acc |
| 15 | ossuary | ossuary | acc |
| 16 | headband2 | headband | acc |

## 부록 D. 핵심 식별자 전체 참조행 인덱스

두 원본 파일을 전수 검색했다. 이름 경계로 검색하며 주석도 포함한다. 함수 선언·직접 caller·저장 key가 같은 행에 여러 번 나와도 1회다. 실제 함수의 전역 lifecycle·외부 JS 호출은 이 literal 인덱스만으로 확정하지 않는다. 원본 함수 정의 구간의 모든 함수와 주요 상수/상태를 포함하고 인벤토리 담당 함수는 경계 참조로 표시한다.

| 식별자 | 선언 G행 | 전체 참조 G행 | index.html 전체 참조 |
|---|---|---|---|
| RARITY | 14346 | 14346 | 없음 |
| RARITY_N | 14347 | 14347, 14349 | 없음 |
| RARITY_N_EN | 14348 | 14348, 14349 | 없음 |
| RARITY_C | 14350 | 14350, 27798, 32940, 32966, 48566, 48567, 48585, 49043, 49342, 49597, 49599, 49953, 50082, 50186, 50193, 50194, 50230, 50299, 50313, 50316, 50594, 50730, 50755, 50803, 50819, 51094, 51105, 51129, 51151, 51152, 60346, 60348, 60350, 60357, 60362, 60365 | 없음 |
| RARITY_MUL | 14351 | 3670, 14351, 15896 | 없음 |
| _AFSLOT | 14364 | 14364, 15132 | 없음 |
| AFFIX_POOL | 14370 | 14365, 14370, 15137, 16064, 16065, 16076, 16077, 16475, 49815, 49866, 50423, 50433, 50446, 50449, 50805, 50820 | 없음 |
| AFFIX_NAMES_KO | 14858 | 14858, 49817, 49927, 49930, 49931, 50447, 50450, 50805, 50820 | 없음 |
| _AFFIX_DESC | 14952 | 14952, 49817 | 없음 |
| IMPLICIT_TABLE | 15016 | 15016, 16117, 16162 | 없음 |
| LEGENDARY_SPECIAL | 15037 | 15037, 16128, 16625 | 없음 |
| UNIQUE_ART | 15060 | 15060, 16139 | 없음 |
| UNIQUE_SPECIAL | 15084 | 15084, 15129, 16136 | 없음 |
| _UNIQ_BY_STAT | 15129 | 15129, 49830 | 없음 |
| SLOT_NAMES | 15176 | 3644, 3649, 3653, 3667, 3674, 3681, 3765, 14241, 15176, 15178, 15405, 15440, 15545, 15560, 15564, 15783, 15837, 15839, 15956, 16430, 16512, 16612, 16613, 27788, 27905, 27935, 27966, 27970, 27978, 27987, 27992, 32866, 32899, 40301, 42981, 43027, 43034, 49495, 49646, 49676, 49696, 50143, 50160, 50178, 50226, 50588, 50796, 51321, 51376, 51403 | 없음 |
| DROP_SLOT_POOL | 15178 | 15178, 32027 | 없음 |
| CR_ATK_SLOTS | 15184 | 15184, 15191, 15192, 15193, 15194, 15195, 15196, 15197, 15198 | 없음 |
| CR_ARMOR_SLOTS | 15185 | 15185, 15188, 15199, 15200, 15201, 15202, 15203, 15204 | 없음 |
| CR_ACC_SLOTS | 15186 | 15186, 15188, 15205, 15206, 15207, 15208 | 없음 |
| CR_DEF_SLOTS | 15188 | 15187, 15188 | 없음 |
| CRYSTAL_DEFS | 15190 | 15190, 15259, 15261, 15290, 15389, 15398, 15399, 15427, 15455, 15486, 15511, 15543, 15596, 15628, 15641, 15713, 15720, 15730, 15781, 16338, 32063, 49616, 49856, 50919, 50928, 51006, 51028, 51042, 51050, 51072 | 없음 |
| _CR_LEGACY_IDS | 15211 | 3757, 15211 | 없음 |
| _CR_LORE | 15212 | 15212, 15574 | 없음 |
| _CR_DESC | 15238 | 15238, 15258 | 없음 |
| CRYSTAL_IDS | 15259 | 15259, 15261, 15396, 32050, 51041, 51071 | 없음 |
| CRYSTAL_STAR | 15276 | 15276, 15290, 15399, 15543, 15641, 15730, 32064, 49059, 49060, 49354, 49360, 49616, 49856, 50919, 50928, 51006, 51028, 51053, 51059, 51077 | 없음 |
| CRYSTAL_STAR_COST_MUL | 15285 | 15285, 15299 | 없음 |
| CRYSTAL_BAG_MAX | 15286 | 15286, 15418, 15792, 16335, 16336, 32047, 50853, 51058, 51074, 51077 | 없음 |
| CRYSTAL_BAG | 15287 | 3559, 3754, 3758, 15287, 15359, 15361, 15362, 15363, 15371, 15373, 15374, 15388, 15415, 15418, 15439, 15500, 15503, 15504, 15538, 15566, 15627, 15641, 15645, 15656, 15713, 15716, 15729, 15744, 15775, 15786, 15792, 15793, 16336, 16337, 32047, 32062, 50853, 50871, 50884, 50885, 50887, 50889, 50897, 50901, 50902, 50903, 50918, 50927, 50928, 50931, 50946, 50947, 50960, 50974, 50983, 50985, 50987, 51012, 51014, 51015, 51027, 51032, 51058, 51064, 51074, 51077, 62146, 63917, 64074 | 없음 |
| CRYSTAL_DUST | 15288 | 3559, 3754, 15288, 15693, 50853, 51032, 51058, 51061, 51064, 62146, 63917, 64074 | 없음 |
| CR_Q_TIER_COL | 15303 | 15303 | 없음 |
| Q_GRADES | 15308 | 15306, 15308, 15313 | 없음 |
| STONE_BAG_MAX | 15333 | 15333, 32069 | 없음 |
| STONE_BAG | 15334 | 3559, 3756, 15334, 15411, 15666, 15670, 15802, 15804, 15808, 15819, 15821, 15825, 32069, 32073, 62146, 63917, 64074 | 없음 |
| CRYSTAL_DUST_COST | 15380 | 15380, 51029, 51053, 51058 | 없음 |
| _SOCK_POS | 15408 | 15408, 15472 | 없음 |
| _uqS | 16515 | 16515, 16521, 16522, 16523, 16527, 16528, 16536, 16537, 16558, 16559, 16560, 16561, 16562, 16563, 16564, 16577, 16580, 16836, 19990, 24639, 24640, 24653, 24654, 32250, 33510, 33511, 35418, 35421, 35424, 35425, 35426, 35427, 38513, 38516, 38517, 38520, 38528, 38534, 38535, 38536, 38537, 42667, 42668, 42674, 42675, 43551, 43552, 43553, 43734, 45386, 45388, 45392, 45530, 46614, 46666, 46775, 46782 | 없음 |
| _uqFzCtx | 16518 | 16518, 16523, 37421, 37487, 42689, 42690, 42692 | 없음 |
| _uqHitCtx | 16519 | 16519, 16523, 32315, 32317, 42674 | 없음 |
| _uqScCtx | 16520 | 16520, 16523, 19985, 19987, 36525, 36531 | 없음 |
| _lEqCache | 16609 | 16289, 16426, 16609, 16611, 16617, 16620, 27983, 27988 | 없음 |
| _LS_BY_STAT | 16625 | 16625, 16626 | 없음 |
| _eqAffixCache | 27969 | 16289, 16426, 16608, 27969, 27970, 27971, 27983, 27988, 49468, 49481, 49484, 51307 | 없음 |
| _eqAffixVer | 27969 | 27969 | 없음 |
| _eqStatCache | 27965 | 16289, 16426, 27965, 27966, 27967, 49468, 49481, 49484 | 없음 |
| _DEMO_MODE | 16646 | 9390, 15137, 16646, 17055, 17120, 42001, 43137, 43148, 43896, 44610, 61265, 61935, 63663, 63681, 63884 | 없음 |
| _DEMO_AFFIX_BANNED | 16650 | 15137, 16650 | 없음 |
| REROLL_COST | 50458 | 50458, 50794, 50836 | 없음 |
| _rerollSel | 50459, 50800 | 50459, 50565, 50800, 50812, 50816, 50817 | 없음 |
| CRAFT_COST | 50419 | 50419, 51094, 51144, 51156, 51159, 51166, 51167, 62477 | 없음 |
| _rarName | 14349 | 14349, 16408, 16419, 45837, 45885, 50001, 50012, 50084, 50086, 50092, 50230, 50728, 50760, 51175 | 없음 |
| _uniqueArtBase | 15083 | 15083, 16139 | 없음 |
| rollAffixes | 15131 | 15131, 15134, 15136, 15138, 15139, 15141, 16114, 50460 | 없음 |
| _crIco | 15232 | 15232, 15740, 49618, 49857, 50921, 50935, 51008, 51031, 51045, 51061, 51076 | 없음 |
| _crDescTxt | 15258 | 15258, 49617 | 없음 |
| _crArt | 15260 | 15234, 15260, 15427 | 없음 |
| _crStarN | 15283 | 15283, 15399, 15548, 15646, 15739, 15740, 32064, 49618, 49857, 50921, 50935, 50939, 51008, 51016, 51031, 51061, 51064, 51077 | 없음 |
| _crDefN | 15284 | 15284, 15399, 15544, 15646, 15647, 15649, 15739, 15741, 16339, 32064, 49618, 49857, 50921, 50935, 50939, 50948, 51008, 51016, 51031, 51045, 51061, 51064, 51076, 51077 | 없음 |
| crystalEffects | 15289 | 15289, 15296, 15321, 15404, 15550, 16486, 27938 | 없음 |
| crystalVal | 15296 | 15296 | 없음 |
| crystalEnhCost | 15297 | 15297, 15372, 50871, 50886, 50929 | 없음 |
| _qRoll | 15304 | 15304, 32061, 51064, 51077 | 없음 |
| _qTier | 15305 | 15305, 15483, 15672, 32072 | 없음 |
| _qGradeOf | 15313 | 15313, 15314, 15315, 15325, 15330, 15740, 32074, 49614, 49854, 50921 | 없음 |
| _qGradeName | 15314 | 15314, 15317, 15522, 15648, 15682, 15740, 15807, 32074, 49615, 49855 | 없음 |
| _qGrp | 15315 | 15315, 15508, 15672 | 없음 |
| _qGemMul | 15316 | 15293, 15316 | 없음 |
| _qLabel | 15317 | 15317, 15513, 15548, 15646, 15647, 15680, 49615 | 없음 |
| _crFuseQ | 15319 | 15319, 15361, 50901, 50983, 51012 | 없음 |
| socketMul | 15322 | 15322, 15515, 15547, 16486, 27937, 49616, 49856 | 없음 |
| socketResonant | 15327 | 15327, 15513, 15556, 49618, 49857 | 없음 |
| _stoneTierRoll | 15336 | 15336, 15346, 32068 | 없음 |
| mkSocketStone | 15346 | 15346, 32072 | 없음 |
| _crAutoProcess | 15350 | 15350, 32065, 49059, 49060 | 없음 |
| _crBagGroups | 15386 | 15386, 15414, 50867, 50871, 51003 | 없음 |
| _crForgeMatches | 15398 | 15398, 50871, 50885, 50897, 50960, 50974 | 없음 |
| _crLabel | 15399 | 15399, 15514, 15515 | 없음 |
| _crValFmt | 15400 | 15400, 15404, 15553 | 없음 |
| _crValStr | 15404 | 15404, 15515, 15549, 15646, 15739, 15741, 49619, 49857, 50921, 50936, 50938 | 없음 |
| _crSlotsStr | 15405 | 15405, 15578 | 없음 |
| renderInvCrystals | 15409 | 15409, 15421, 15496, 15501, 15568, 15582, 15629, 15676, 15809, 15826, 50169 | 없음 |
| renderCrystalBag | 15696 | 15696, 15721, 15725, 15739, 15748, 15775 | 없음 |
| _crPickerFocusStart | 15762 | 15748, 15762, 15775 | 없음 |
| _crPickerFocusRestore | 15766 | 15766, 15776 | 없음 |
| openCrystalPicker | 15775 | 15505, 15775, 49622 | 없음 |
| closeCrystalPicker | 15776 | 13936, 15701, 15717, 15775, 15776, 44062 | 없음 |
| attachCrystal | 15777 | 15501, 15568, 15629, 15777, 49622 | 없음 |
| detachCrystal | 15790 | 15496, 15790, 49617 | 없음 |
| stoneUnseal | 15796 | 15467, 15475, 15796 | 없음 |
| stoneUpgrade | 15813 | 15491, 15813 | 없음 |
| _slotName | 15837 | 15405, 15441, 15545, 15564, 15783, 15837, 49646, 49701, 50186, 50226, 50588, 50810 | 4345, 4348 |
| _weaponName | 15883 | 3675, 3678, 15883, 15897, 15962 | 없음 |
| mkItem | 15894 | 15894, 15895, 16170, 16727, 32030, 32871, 32903, 40303, 42973, 42983, 42996, 43004, 43028, 43035, 45883, 51172, 61988, 62181, 62182, 62183, 62184, 62402, 63988, 63989, 63990, 63991, 64124, 64125, 64126, 64127 | 없음 |
| defaultItems | 16169 | 16169, 62179, 62339, 63974, 63986, 64114, 64122 | 없음 |
| _invRows | 16181 | 16181, 16191, 16196, 16202, 16238, 16250, 49970, 49971, 49985, 50265, 50269 | 없음 |
| _itemSz | 16183 | 16183, 16193, 16236, 16249, 16351, 16359, 16370, 16403, 16413, 50269, 50290 | 없음 |
| _invCategoryKey | 16188 | 16188, 16192, 16236 | 없음 |
| _invGrid | 16189 | 16189, 16201, 16251 | 없음 |
| _invFindSpace | 16200 | 16200, 16239, 16360, 16372, 16405, 16416, 45866, 50269 | 없음 |
| _invSortBag | 16213 | 16213, 16230 | 없음 |
| _invAutoPlace | 16229 | 2981, 14163, 16229, 16490, 16496, 44049, 44050 | 없음 |
| _invCanPlace | 16247 | 16247, 49971, 49986 | 없음 |
| playEquipSfx | 16265 | 16265, 16363, 51175 | 없음 |
| playItemDropSfx | 16268 | 16268, 16721 | 없음 |
| playItemPickupSfx | 16271 | 16271, 16408, 16419 | 없음 |
| _earringSlot | 16272 | 15837, 16272, 16274, 16278, 16300, 49642, 50282, 50588, 50719 | 없음 |
| _equipSlot | 16273 | 16273, 16300, 49558, 49636, 51170 | 없음 |
| _equipEarringTo | 16277 | 16277, 49647 | 없음 |
| _refreshEquipmentStats | 16287 | 16287, 16363, 16376 | 없음 |
| equipItem | 16293 | 16282, 16293, 48603, 49641 | 없음 |
| unequipItem | 16367 | 16367, 49652, 50099, 50206 | 없음 |
| dropItem | 16382 | 16382, 49641 | 없음 |
| pickupItem | 16398 | 16398, 32940, 32966, 41453, 51178 | 없음 |
| recalcSt | 16425 | 16425, 27963, 45887, 50836, 51176, 62192, 62340, 63976, 63992, 64116, 64128 | 없음 |
| itemPower | 16434 | 16211, 16212, 16215, 16434, 16438, 50310 | 없음 |
| sortInvBag | 16489 | 16489 | 없음 |
| _invAutoSortIfClosed | 16494 | 16407, 16418, 16494 | 없음 |
| wp | 16498, 29819 | 9592, 16498, 28770, 29727, 29819, 29820, 29821, 29897, 30252, 30315, 32316, 32391, 32710, 32711, 33164, 33169, 33174, 33358, 33359, 33361, 33362, 33364, 33425, 33745, 34078, 34080, 34083, 34084, 34089, 34091, 34862, 37055, 37065, 37073, 40586, 40627, 40681, 40959, 41033, 41068, 41091, 41128, 41159, 41261, 41278, 41312, 41344, 42211, 43315, 43375, 43444, 46217, 46488, 51344, 51354, 51375, 51377, 51378, 51380, 58208, 58349, 58352, 58444, 58624, 58625, 58629, 58630, 58648, 58949, 58964, 58967, 58968 | 없음 |
| sh | 4708, 5621, 5813 | 309, 2292, 2304, 3493, 4314, 4317, 4708, 4710, 5053, 5074, 5082, 5090, 5094, 5096, 5097, 5098, 5101, 5103, 5104, 5111, 5113, 5193, 5205, 5285, 5513, 5515, 5516, 5517, 5518, 5621, 5622, 5623, 5626, 5627, 5629, 5631, 5632, 5813, 5816, 5822, 5831, 5834, 5835, 6140, 6141, 6142, 6143, 6144, 8875, 8937, 9384, 10837, 10872, 11941, 11942, 12132, 16499, 16762, 16763, 16770, 16771, 18658, 18659, 18662, 18666, 18668, 18671, 18673, 19197, 19202, 19203, 19421, 19427, 19430, 19432, 19458, 19460, 19463, 19464, 19471, 19474, 19476, 19506, 19512, 19515, 19517, 19547, 19553, 19556, 19558, 19589, 19597, 19600, 19602, 19727, 19740, 22886, 23028, 23029, 24205, 24344, 24360, 24421, 24503, 24924, 25322, 25325, 25328, 25331, 25334, 25335, 25346, 27885, 29584, 29587, 29588, 29627, 29630, 29631, 29834, 29835, 30492, 30493, 30526, 30527, 32710, 32711, 33502, 34858, 34859, 43508, 43509, 43511, 43512, 44158, 44159, 46194, 46213, 46393, 46400, 46403, 46747, 46749, 46751, 46752, 46754, 47538, 47565, 48882, 48884, 51295, 51296, 51297, 51298, 51361, 51375, 51377, 51378, 51380, 51899, 51900, 53594, 53595, 53607, 53608, 54110, 54112, 54147, 54149, 54577, 54578, 54583, 54588, 54591, 54594, 54597, 54600, 54603, 54608, 54609, 54612, 54613, 54616, 54620, 54622, 59029, 60131, 60136, 60219, 60220, 60222, 61157, 61159, 61163, 61338, 61341, 61420, 61529, 61530, 61637, 61642, 61729, 61736, 61753, 61754, 61769 | 4640, 4641, 4643 |
| bt | 16500, 27164, 45377 | 16500, 27164, 27168, 27177, 32710, 32711, 32781, 33024, 33137, 33300, 33351, 33951, 34022, 34056, 34072, 34136, 43509, 43512, 45377, 49735, 49736, 49737, 49884, 49885, 49886, 51295, 51296, 51297, 51298, 51361, 51375, 51377, 51378, 51380, 63460, 64580, 64585, 64588, 64589 | 4593, 4595 |
| ar | 16220, 16501, 25874 | 2710, 6060, 6061, 6062, 6065, 6066, 6068, 6069, 6080, 6081, 6082, 6084, 6085, 6086, 6088, 8651, 8652, 8653, 9014, 9016, 9017, 9018, 9022, 16220, 16221, 16501, 20020, 25874, 25875, 26904, 32291, 32292, 32295, 32710, 32711, 32781, 33971, 33975, 33977, 33979, 33981, 33989, 33991, 33993, 33998, 33999, 34682, 34697, 34730, 34903, 35080, 35086, 35089, 36139, 37037, 37055, 37059, 37065, 37067, 37069, 37071, 37073, 37077, 37079, 37122, 37129, 37131, 37133, 37135, 37137, 37139, 37141, 37143, 37145, 37147, 37149, 37151, 40535, 40545, 40553, 40588, 40629, 40685, 40706, 40756, 40768, 40830, 40857, 40862, 40884, 40925, 40935, 40962, 41036, 41069, 41093, 41130, 41161, 41263, 41281, 41293, 41314, 41346, 41370, 42124, 42131, 43508, 43509, 43511, 43512, 44863, 51295, 51296, 51297, 51298, 51361, 51375, 51377, 51378, 51380, 51564, 51571, 55485, 55530, 63020, 63143, 63145, 63150, 63460 | 466, 481, 685, 703, 714, 802, 2150, 2158, 2167, 2324, 2325, 2326, 2327, 2328, 2329, 2330, 2331, 2332, 2333, 2334, 2335, 2336, 2337, 2338, 2339, 2340, 2341, 2342 |
| hm | 16502 | 16502, 28040, 28772, 32710, 32711, 33596, 33644, 34293, 35522, 43512, 51295, 51297, 51298, 51346, 51363, 51375, 51377, 51378, 51380, 54299 | 없음 |
| bw | 4421, 16503, 24104 | 4416, 4417, 4421, 4422, 4426, 4428, 4432, 4435, 16403, 16405, 16503, 17399, 17452, 24104, 24106, 24232, 24233, 27477, 28679, 28695, 28708, 28771, 31711, 32710, 32711, 33232, 35151, 35767, 36077, 36103, 37157, 37158, 37160, 37161, 37162, 37164, 37167, 37168, 37169, 37170, 37171, 37172, 37174, 37177, 37183, 37185, 37189, 43690, 43700, 43701, 43702, 45114, 45172, 45190, 45223, 46170, 51302, 51345, 51351, 51375, 51377, 51378, 51380, 51648, 51650, 52796, 52797, 52798, 52843, 52844, 52845, 52875, 52876, 52877, 53961, 53963, 53965, 53967, 53968, 54920, 54921, 54922, 55815, 55816, 55819, 55820, 55821, 55822, 55824, 55826, 55827, 55832, 55840, 55842, 55846, 55855, 55858, 55866, 55867, 55868, 58737, 58760, 58761, 58768, 59065, 59066, 60425, 60432, 60433, 61190, 61192, 61193, 61194, 61354, 61356, 61357, 61358, 61772, 61773, 61774, 61775 | 없음 |
| gl | 4247, 5925, 5970 | 4247, 4254, 4255, 4257, 4258, 4259, 4260, 4261, 4262, 4263, 4264, 4266, 4268, 4269, 4270, 4271, 4273, 4274, 4276, 4277, 4278, 4279, 4280, 4281, 4282, 4283, 4284, 4285, 4286, 4288, 4289, 4293, 4295, 4297, 4298, 4299, 4300, 4301, 4302, 4305, 4308, 4309, 4310, 4311, 4312, 4324, 4325, 4326, 4327, 4330, 4331, 5925, 5926, 5927, 5929, 5930, 5933, 5934, 5935, 5938, 5939, 5940, 5942, 5943, 5945, 5946, 5947, 5948, 5950, 5951, 5952, 5953, 5954, 5955, 5957, 5958, 5959, 5960, 5970, 5971, 5972, 5973, 5975, 5977, 5978, 5979, 5980, 5981, 5982, 5984, 5985, 5986, 5987, 5988, 5989, 5990, 5991, 5992, 16504, 21622, 21624, 27994, 28225, 32710, 32711, 35899, 43509, 43512, 51295, 51296, 51297, 51298, 51361, 51375, 51377, 51378, 51380, 51391, 58161, 58162, 58164, 58177, 60749, 60750, 60895, 60896 | 2332, 2340 |
| pt | 13620, 13721, 16505 | 8651, 8652, 8653, 9411, 9425, 9430, 9433, 9438, 9443, 9455, 9460, 9471, 9476, 13620, 13621, 13622, 13721, 13722, 13723, 16505, 17167, 23909, 23911, 23913, 23914, 23915, 30785, 30786, 32710, 32711, 32951, 32976, 41464, 43093, 43095, 43430, 43509, 43512, 45786, 46436, 46438, 46440, 48936, 50065, 51295, 51296, 51297, 51298, 51361, 51375, 51377, 51378, 51380, 52563, 52566, 52568, 59618, 59622, 59623, 59630, 59650 | 2150, 2154, 2155, 2167 |
| blt | 16506 | 16506, 28226, 35900, 43512, 51298, 51391 | 없음 |
| nc | 8820, 16507, 49200 | 8820, 16507, 27997, 29688, 29694, 29695, 29697, 29698, 29699, 29701, 29710, 32710, 32711, 42230, 43141, 43512, 49200, 49201, 51295, 51297, 51298, 51348, 51363, 51375, 51377, 51378, 51380, 52992, 54971, 54975 | 없음 |
| rg1 | 16508 | 16508, 27997, 32710, 32711, 42230, 43512, 51295, 51297, 51298, 51348, 51363, 51375, 51377, 51378, 51380 | 없음 |
| rg2 | 16509 | 16509, 27997, 32710, 32711, 42230, 43512, 51295, 51297, 51298, 51348, 51363, 51375, 51377, 51378, 51380 | 없음 |
| cp | 16510, 37145, 49675 | 16510, 32710, 32711, 37145, 43508, 43511, 43512, 49675, 49685, 49686, 50157, 50158, 50159, 50166, 51298, 51375, 51377, 51378, 51380, 58045, 58048, 58049, 58051, 58052, 58053 | 없음 |
| _uEq | 16512 | 16135, 16512, 16529, 16535, 16568, 16607, 16824, 16835, 19986, 19990, 24583, 24584, 24623, 24624, 24639, 24641, 24653, 24655, 27890, 27994, 28035, 28039, 28041, 32366, 32367, 33420, 33482, 33501, 33509, 34663, 34664, 35422, 35434, 35507, 35562, 35619, 38495, 38503, 38513, 38515, 38520, 38521, 42251, 42367, 42662, 42666, 42674, 42676, 42689, 42692, 43550, 43566, 43860, 45383, 45434, 46482, 46614, 46665, 46849, 46930 | 없음 |
| _uqReset | 16521 | 16521, 16558 | 없음 |
| _uqMoveRefund | 16526 | 13346, 16526, 32178, 32211, 32532, 45432 | 없음 |
| _uqTurretSalvo | 16534 | 13061, 16534 | 없음 |
| _uqFrame | 16557 | 16557, 32725 | 없음 |
| _lEqRebuild | 16610 | 16610, 16620 | 없음 |
| _lEq | 16620 | 15036, 16127, 16620, 16622, 16623, 16829, 27994, 28036, 28065, 28223, 28691, 28714, 32372, 32373, 32734, 33361, 35908, 42226, 42227, 42228, 42314, 42318, 42328, 42330, 42474, 42494, 42697, 42699, 43434, 43575 | 없음 |
| _lParryWinTicks | 16622 | 16622, 38469 | 없음 |
| _lSbParryT | 16623 | 14307, 14321, 16623, 33050, 33365, 33550, 33581, 33652 | 없음 |
| _legSpKo | 16626 | 16626, 49825, 50824 | 없음 |
| _slotGlyph | 27787 | 27787, 27788, 50186, 50804, 50810, 60346, 60348, 60350, 60357, 60362, 60365 | 없음 |
| _itemIco | 27788 | 27788, 27810, 48566, 48585, 50759, 50825, 51129 | 없음 |
| _itemSkinSrc | 27795 | 27795, 27803, 27804, 27863, 27864 | 없음 |
| _itemSkin | 27796 | 15082, 15447, 27796, 48566, 50186, 50316 | 없음 |
| _getWorldDropBeamTier | 27824 | 27824, 52582 | 없음 |
| _maskWorldDropBlack | 27830 | 27830, 27854, 27879 | 없음 |
| _worldDropFxTile | 27843 | 27843, 52585 | 없음 |
| _worldItemSkin | 27857 | 27857, 52591 | 없음 |
| _glyph | 27885 | 15235, 15236, 27787, 27885, 35869, 35870, 35871, 35872, 35873, 35874, 41989, 47366, 49002, 49593, 49799, 50159, 50309, 50370, 50400, 50778, 51239, 60346, 60355 | 없음 |
| _stripIco | 27886 | 27886, 51237 | 없음 |
| _maliceMul | 27888 | 27888, 32950, 32975, 41463, 43081 | 없음 |
| applyStats | 27902 | 15378, 15786, 15793, 15826, 16290, 27902, 27983, 27988, 28148, 45888, 49038, 49482, 50836, 50912, 50948, 50998, 51017, 51176, 51215, 51232, 51249, 51267, 51274, 62057, 62196, 62340, 62407, 62511, 63525, 64019, 64140 | 없음 |
| _eqStatRebuild | 27966 | 27966, 27967 | 없음 |
| _eqStat | 27967 | 27897, 27967, 27994, 27996, 28770, 28771, 28772, 43432, 51328, 51332, 51333, 51334, 51344, 51345, 51346 | 없음 |
| _eqAffixRebuild | 27970 | 27970, 27971, 51307 | 없음 |
| _eqAffix | 27971 | 14308, 16431, 16826, 17348, 24572, 27890, 27897, 27907, 27913, 27927, 27928, 27930, 27931, 27942, 27961, 27971, 27977, 27994, 27996, 27997, 27998, 27999, 28008, 28035, 28036, 28041, 28050, 28053, 28065, 28228, 28232, 28696, 31983, 32291, 32713, 32745, 32785, 32789, 32950, 32975, 33050, 33364, 33365, 33550, 33581, 33652, 33802, 33979, 34699, 34858, 34859, 34982, 35894, 35903, 38481, 38545, 39934, 41348, 41463, 42209, 42211, 42214, 42218, 42219, 42222, 42238, 42239, 42240, 42241, 42243, 42244, 42245, 42248, 42249, 42251, 42252, 42253, 42254, 42255, 42256, 42258, 42259, 42260, 42276, 42277, 42278, 42279, 42280, 42281, 42295, 42307, 42310, 42311, 42312, 42313, 42315, 42320, 42321, 42322, 42323, 42324, 42325, 42361, 42363, 42364, 42365, 42371, 42372, 42373, 42374, 42375, 42376, 42377, 42378, 42424, 42438, 42440, 42442, 42489, 42492, 42522, 42629, 42644, 42652, 42654, 42655, 42656, 42657, 42658, 43081, 43143, 43432, 43463, 43488, 43512, 43514, 43526, 43530, 43531, 43532, 43533, 43534, 43536, 43585, 43600, 43602, 43604, 43606, 43727, 43741, 43747, 44557, 44961, 45114, 45172, 45190, 45223, 45816, 45820, 46466, 51298, 51312, 51315, 51316, 51317, 51318, 51322, 51348, 51373, 51374, 51379, 51381, 51393, 58625, 58630, 58648, 63463 | 없음 |
| _eqImplicit | 27992 | 27913, 27927, 27992, 27994, 28008, 43741, 45816, 51373, 51404 | 없음 |
| statStr | 27993, 44675 | 16825, 27993, 28036, 32291, 32306, 32353, 32390, 32484, 33085, 33173, 33416, 36004, 36418, 38545, 42207, 42330, 42495, 43310, 43371, 43600, 44675, 45116, 45171, 45284, 46194, 46213, 46468, 49490, 51301 | 없음 |
| statDex | 27994, 44676, 49739 | 16539, 27994, 33164, 33364, 36003, 36124, 36173, 44676, 44951, 45143, 45188, 45221, 45299, 45300, 45335, 49739, 49767, 49888, 51309, 51310, 51311, 51333, 51347, 58625, 58630, 58648 | 없음 |
| statInt | 27995, 44677 | 27995, 28036, 28806, 28843, 28965, 32282, 32344, 32424, 33212, 33594, 33629, 33641, 33785, 34030, 34151, 35383, 36059, 36347, 36357, 36405, 36428, 36591, 36737, 36833, 36868, 36892, 36950, 36994, 42771, 44677, 45366, 45399, 45500, 45507, 45815, 46113, 46266, 46517, 46648, 46771, 46909, 46947, 51303 | 없음 |
| _eqLckTotal | 27996 | 27996, 27997, 27998, 27999, 51348 | 없음 |
| statCrit | 27997, 44678 | 27997, 28691, 28714, 42316, 44678, 51308, 51335, 51348 | 없음 |
| statCritDmg | 27998, 44679 | 27998, 42316, 44679, 51308, 51335 | 없음 |
| statDropBonus | 27999 | 27999, 32005, 51392 | 없음 |
| _affixDetailValStr | 50422 | 49817, 50422 | 없음 |
| _affixValStr | 50431 | 50428, 50431, 50805, 50820 | 없음 |
| itemDispName | 50442 | 50442, 50759, 50804, 50825 | 없음 |
| rerollAffixes | 50460 | 50460, 50836 | 없음 |
| rollDrop | 32002 | 32002, 34442, 43110 | 없음 |
| _invCardFields | 49730 | 49600, 49730, 49953 | 없음 |
| _invRenderDetail | 49534 | 13256, 13257, 14217, 14222, 14227, 14229, 14241, 49533, 49534, 49617, 49622, 49720, 49724, 50100, 50196, 50333, 50339, 50348, 50350 | 없음 |
| _invBuildCompare | 49874 | 49559, 49874 | 없음 |
| _inventoryEquipCP | 49467 | 49467, 49909 | 없음 |
| calcCP | 49487 | 16212, 49470, 49473, 49483, 49487, 49675, 49908, 50157, 60325 | 없음 |
| _wiPush | 16721 | 16721, 16728, 32033, 32044, 32872, 32904, 40304, 41836, 42751, 42915, 42974, 42984, 42997, 43005, 43029, 43036, 43072 | 없음 |
| _spawnWorldDropPreview | 16722 | 16722, 64050 | 없음 |
| _fgCraft | 50464 | 50464, 50579 | 없음 |
| _malCost | 28081 | 12932, 12942, 12946, 12947, 12983, 13000, 13001, 13003, 13004, 13011, 15299, 28081, 28091, 28103, 28743, 32574, 32575, 40298, 44711, 44787, 45095, 45109, 45170, 45277, 45278, 45314, 45316, 45510, 45512, 46166, 46167, 46453, 46454, 47220, 47221, 47245, 47275, 47748, 47762, 47770, 47811, 47874, 48029, 48043, 48131, 48216, 48289, 48317, 50238, 50419, 50458, 50696, 51068 | 없음 |
| _itemEconomyRarity | 28186 | 16310, 28090, 28186, 28193, 28200 | 없음 |
| enhCostRaw | 28086 | 28086, 28091, 28189 | 없음 |
| enhCost | 28089 | 28089, 28130, 28144, 50604, 50623, 50656 | 없음 |
| enhRate | 28077 | 28077, 28091 | 없음 |
| enhMul | 28093 | 28093, 43508, 43511, 49760, 49761, 50616, 51295, 51297 | 없음 |
| enhMulAtk | 28097 | 28097, 28770, 28771, 28772, 33362, 37055, 37065, 37073, 40586, 40627, 40681, 40959, 41033, 41068, 41091, 41128, 41159, 41261, 41278, 41312, 41344, 49758, 49759, 50608, 50609, 51344, 51345, 51346 | 없음 |
| xferCost | 28101 | 16305, 28101, 49473, 49638, 49942 | 없음 |

## 부록 E. mkItem 인스턴스 field 쓰기·삭제 전수

범위 G:15894~16166. 공통 item literal G:15954~15956의 key와 `item.<field>` 참조를 전수 대조했다. 참조에는 읽기/조건도 섞이므로 원 행에서 쓰기·삭제 구별이 필요하다. 실제 저장은 이 객체 전체 직렬화이며 이 표의 field whitelist로 자르면 안 된다. 후속 장착/강화/좌표/fav/junk·사용자 extra 필드는 TRACE-INVENTORY/TRACE-SAVE에 별도로 있다.

| field / 동적식 | 원본 G행 |
|---|---|
| _implicitKo | 16122, 16162 |
| _implicitStat | 16120, 16162 |
| _implicitVal | 16121, 16162 |
| affixes | 16063, 16066, 16067, 16075, 16078, 16079, 16114, 16160 |
| anc | 16157 |
| ancPow | 16158 |
| atk | 15964, 15979, 15992 |
| atkSpd | 16045 |
| bDex | 16159 |
| bGrit | 16093, 16159 |
| bInt | 16159 |
| bLck | 16092, 16159 |
| bStr | 16159 |
| beamDmg | 16023, 16024, 16031 |
| bonusChargeDist | 16003 |
| bonusHp | 16012, 16049, 16054 |
| bonusMp | 16014, 16158 |
| bonusRange | 15970, 15984, 15989, 16002, 16040 |
| bonusShield | 16013 |
| bonusSt | 15996 |
| bowPierce | 15985 |
| bowProjSpd | 15983 |
| bowRange | 15982 |
| bowSpd | 15980 |
| bowStCost | 15981 |
| brType | 16108, 16110, 16114, 16116 |
| btype | 15976 |
| charge | 15997 |
| chargeAoE | 16008 |
| chargeCharge | 16018 |
| chargeDist | 15998 |
| chargeW | 15999 |
| crystals | 16150, 16164 |
| def | 15993 |
| eDef | 15994, 16158 |
| el | 15954, 16156 |
| elements | 16024, 16031, 16033, 16034 |
| emoji | 15956, 15963, 15978, 16157 |
| id | 15954 |
| itemLv | 16146 |
| legendarySpecial | 16125, 16130, 16161 |
| magicPen | 16038 |
| name | 15955, 15962, 15977, 16033, 16034, 16110, 16140, 16157 |
| potCd | 16044, 16053 |
| range | 16011 |
| rarity | 15954, 16156 |
| reqLv | 16147, 16163 |
| shieldWt | 15990 |
| slot | 15895, 15954 |
| socketCount | 16149, 16164 |
| socketQ | 16151, 16164 |
| spd | 15965, 15995 |
| splashMul | 16037 |
| splashR | 16036 |
| stagger | 16010 |
| tier | 15954, 16156 |
| unique | 16156 |
| uniqueArt | 16140 |
| uniqueSpecial | 16133, 16141, 16161 |
| wArcW | 15967 |
| wRange | 15968 |
| wStCost | 15966 |
| wStagger | 15969 |
| wtype | 15961 |
| item[_ls.stat] | 16130 |
| item[_us.stat] | 16141 |

## 부록 F. docs 설계 폴더 파일 분모와 고정 해시

15파일 전체의 ID/키워드·관련 표/현행/계획/검증 절을 대조했다. 아트 생성 prompt 원문은 새 생성 지시로 적용하지 않는다. 기존 테스트·대장·계획의 완료표시는 해당 시점 이력이며 새 원본/Godot 완료 판정으로 복제하지 않는다. 문서 전체 불일치 표는 §2, 활성409행의 원본 수치는 부록 A다.

| docs/7아이템디자인/ 아래 파일 | 행 수 | SHA256 |
|---|---|---|
| ITEM_TEAM_MASTER.md | 44 | 2ae63014e060b10bf3674032870e975587f67836f17372ed0def070503c642b2 |
| ON_CRIT_RECURSION_OBSERVATION_20260910.md | 11 | 5792df18680acb738411c2f986512781f68937f85561ca962a582405696eb1d2 |
| SEEDREAM_UNIQUE_ART_BATCH_20261001.md | 38 | cb2d6615a839e9110b672323f90ec8f4bd04da0ceebc2edde1413b2c2b453537 |
| UNIQUE_ITEM_GAME_INTEGRATION_CONTRACT_20261001.md | 72 | 3ac09675a8f43c1663158c6398f3b54999ea79263b5a3625add9b3645301d460 |
| UNIQUE_TOP8_HOOK_REVIEW_20261001.md | 32 | 691428e21b5aae6e75e3c7138d16c4fce3f741a95616624551fe91c34cb28b03 |
| exoduser-item-system-full.md | 1198 | 4ce280a5afd65d16f88ab74d9e4130be2a129dc9d6858a41a7c17420f018915b |
| 고유아이템_모델_어픽스_밸런싱_프로젝트_20260930.md | 108 | d9e769dcb26ae70ecbad0dd4b091f5a08bad5437f6ad6743b2d8f7be5c1abdb9 |
| 드롭_프리뷰_테스트.md | 49 | 740d1ef4f0f6ea3107f724881e11fb388a3b40a343c1c1dcdb3a675b50db9daf |
| 보라색_고유아이템_카탈로그_20260930.md | 181 | c60f8249863d894f078a24f58f219c31892d697a4343545b2f3882dc2c64353f |
| 슬롯별_어픽스_풀.md | 1736 | 5bdfc53b8d02d72720226fb5d9c6d390ffeca752113038fb00d40b699115da77 |
| 아이템_어픽스_시스템.md | 905 | 85a8f8d86ebf8c3d7951f71a3b8fe7479e4a8c387690904b979ae18a06e07a83 |
| 어픽스_Layer_재분류_설계_2026-08-10.md | 1023 | 1b569dd7f3f65a70e48818fa251f8cde8fca9a25fa6ccca2608282e064edf14b |
| 어픽스_Layer_전수매핑_402_2026-08-10.md | 411 | ccf9e7fc8e9dc81c4376aa63e24b49332106f95294f058c69348dfa0b3eb0d46 |
| 어픽스_시스템_현황분석_2026-08-10.md | 156 | 222dbe375b902296634bc01ff5e433db84d1505d978307d0647244ba6733e230 |
| 유니크_어픽스_리스트.md | 270 | 79f57934b82d0d051aad9d2c43a0fa3d80d6d8df6e05a6816eef0d56d2a4c2c7 |
