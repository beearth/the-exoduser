# NPC·상점·월드 상호작용 원본 추적·작은 이식 단위 — 2026-10-20

작업ID `trace-npc-world` · **원본 추적/구현 순서안 제출, 코드 구현·실플레이 인수 아님**. 다음 1번 후보는 §5.1의 **NW-01 MAP_OBJS 첫 상호작용 대상 읽기 질의**다. 원본의 순서·반경만 신규 모듈에서 검수하고 공용 파일 0줄로 시작한다. NW-*는 문서 내부 후보 ID이며 신규 담당 배정·구현 승인을 뜻하지 않는다.

## 0. 기준·소유권·중복 경계

| 항목 | 고정 근거·제한 |
|---|---|
| 기준 main | 정상 fetch 후 `e556b617190c325ca39f5add04357f5dea5ca87e`. 이후 행 번호는 이 tree에 고정. 브랜치 `codex/trace-npc-world-20261020` |
| 웹 원본 | G=`game.html` 65,692행, SHA256 `4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4`; I=`index.html` 4,742행, SHA256 `36008f72723dbcbf1ae7b6af6b08dfe6299962e2445261139b6237082a24cf12` |
| 작업 폴더 | `~/exoduser-wt/trace-npc-world`, `worktree add --no-checkout` 후 `sparse-checkout set --no-cone`. docs·G/I·Godot 코드/테스트와 필요한 소형 JS만 읽음. 대용량 원화·GLB를 checkout하지 않음 |
| R 불변 | `/Users/fordeargamers/Projects/exoduser-migration-20261001`, branch `codex/mac-live-play-time-main-20261017`, HEAD `dd49171c5b88e211575a41f185395d6c0a14b184`. tracked INDEX/WORK 각각 빈 상태 확인. fetch/분리 worktree 관리 외 R 파일·브랜치·인덱스 변경 0 |
| 작업판 | [WORK_BOARD](orders/WORK_BOARD.md):23–104의 진행·공용·보존 WIP 확인. P2-006b 표시·P2-008b 적 factory·레슨·SK/IT/SV/설정·맵 담당과 중복하지 않음. 사용자 지시가 문서1개+CHANGELOG_SYNC만 허용하므로 작업판/별도 보고서는 수정하지 않음 |
| 분모 | [FEATURE_INVENTORY](FDG_FEATURE_INVENTORY_20261020.md)의 과거 snapshot `2845f96e97d4803e4fb8ab4f3d5c0ff8e80d4353`: 아이템·경제·NPC18행 중 없음12, 월드9행 중 없음8. 이20행은 조사 출발점이며 현재 완료율/새 판정 합계가 아님 |
| 변경·실행 | 이 문서와 CHANGELOG_SYNC 신규 절만. 제품·테스트·보호 설계·공용 6파일 각 0행. **Godot/브라우저/실제 게임/사용자 저장/서버 실행 0**. 원본 단편의 Node VM 관측과 정적 파싱만 수행 |

### 먼저 읽은 추적과 재사용 경계

| 선행 문서 | 이번 문서에서 참조만 할 내용 |
|---|---|
| [ITEMS](FDG_SOURCE_TRACE_ITEMS_20261020.md) §1.1–1.5,3–5 | mkItem/rollDrop·17슬롯·유물18정의·품질·RNG·아이콘·어픽스. 새로운 상점 때문에 생성기를 재작성하지 않음 |
| [INVENTORY](FDG_SOURCE_TRACE_INVENTORY_20261020.md) §2–5,6 | 장착·가방격자·pickupItem·비교·분해·보관함·부착/분리. UI mutation은 TI 담당안 참조. NW는 그 결과/현재 owner를 주입받는 접점만 정의 |
| [META](FDG_SOURCE_TRACE_META_20261020.md) §3,4,6–9 | 비용 할인·강화·분해·리롤·제작·재화 권위·클리어 결과. 수치/경제 구현 단위를 중복 제안하지 않음 |
| MAPS_CH1 | 기준 main에는 파일 없음. 로컬 `codex/trace-maps-ch1-20261020@668cfdedf62dd4758057c4c16ea185fffa0c424f`의 `docs/engine/FDG_SOURCE_TRACE_MAPS_CH1_20261020.md` §1.2/1.4,3–5를 Git object로 읽은 **미병합 참고본**. 배치/타일/충돌/arena 전환은 이쪽 경계, 참고본을 main 구현으로 세지 않음. 원문 사본 MAPS_CH1-reference.md를 로그에 보존 |
| [SAVE](FDG_SOURCE_TRACE_SAVE_20261020.md), [SETTINGS](FDG_SOURCE_TRACE_SETTINGS_20261020.md), [QUICKSLOT](FDG_SOURCE_TRACE_QUICKSLOT_20261020.md) | 슬롯 identity·공유 mats/storage·serializer/복원 **보호**; 입력 바인딩·키 엣지·물약의 실제 악의구슬 전환은 기존 계약. 새 저장 키/바인딩을 발명하지 않음 |
| SKILLS/WEAPONS/REVIVE_SHIELD/SOUND/CH1_ENEMIES/BOSS_CH1 | 기존 각 추적의 범위·공용 접점/관련 심벌 절 확인. F영역스킬·Q/E·피해·상인 actor·펫 대사/음성/효과음은 해당 소비자 경계. 전투 계산/효과를 여기서 변경하지 않음 |

## 1. 기능 분모 20행 대응

원 목록을 삭제·합산하거나 상자/잔해를 새 기능 분모로 추가하지 않았다. ‘참조’ 행도 진입/소비 연결은 §2에서 추적한다. 특히 `IT-npc`는 로비 대화·펫 대사 전체를 한꺼번에 이식하는 작업이 아니다.

| 원 ID(과거 판정 없음) | 이번 대응·선행 소유 | G 원본 행 |
|---|---|---|
| IT-drop-view | 바닥 표시 P2-006a/b·ITEMS 참조; 상자/상인도 같은 `_wiPush` sink 사용 | 16721,27818–27889,52500–52619 |
| IT-pickup | INVENTORY/P2-006 소비자. R의 상자/포탈과 수거 진입 순서만 이번 추적 | 16411–16423,32824–32979 |
| IT-storage | INVENTORY/SAVE, N 또는 패널 탭→공유 창고, NPC 필요 없음 | 32117,44051–44057,48520–48609 |
| IT-salvage | META/INVENTORY, 인벤 분해와 forge 분해는 별도 caller | 16381–16396,28185–28201,50359–50407,50709–50788 |
| IT-enhance | META 비용/확률·실행, forge upgrade 패널 접점만 기록 | 28077–28184,50582–50687 |
| IT-reroll | ITEMS/META, 장착 선택→재화→rollAffixes→refresh/save 경계 | 50460,50790–50840 |
| IT-craft | META/ITEMS/INVENTORY, craft→개별부위→자동장착/가방 | 50419,51082–51184 |
| IT-cr-attach | INVENTORY TI-10a, 대장간이 아니라 인벤 장비 홈 | 15775–15794,49608–49625 |
| IT-cr-enhance | ITEMS/META 비용, forge crystal/enhance | 15297–15300,50869–50946 |
| IT-cr-fuse | ITEMS/META 합성, forge crystal/synth·자동합성 | 15347–15379,50947–51021 |
| IT-shop | etype93 F 즉시 단발 거래·실패/도주·저주 연결이 이번 상세 범위 | 30959,31352,40283–40312,42148–42152,42987–42991 |
| IT-npc | 실제 일반 NPC runtime은 미발견. 별도 fieldNpcRoster 데이터·정적 hook과 game runtime의 차이를 명시 | 6254–6264는 입력 이름뿐; G/I에서 roster caller0, 외부 src 참조 §2.1 |
| WORLD-portal | 개인 P/R 쌍 포탈. zone 자동전이·적 rift와 분리 | 18309–18322,30161,31535,32113,32827,51962–51972 |
| WORLD-lore | 비문 생성/발견 flag/표시, 본문 팝업과 구분 | 25810–25829,32834–32836,52319–52328 |
| WORLD-breakable | R 1회 HP−1/보상, 장식물 전부 파괴 가능하지 않음 | 25831–25851,32837–32845,52329–52338 |
| WORLD-altar | 기능 type=altar vs 장식 m_c1altar 분리; 생성/사용/버프 소비 | 25870–25878,32846–32852,27927,28005,28019,31567,52354–52368 |
| WORLD-trap | 자동 접촉 피해. 생성 주석/잔존 consumer/장식 collider 별개 | 18409,25853–25868,32796–32822,52339–52353 |
| WORLD-stage-title | META/MAPS 의존, 현재 native_regions 부분 구현 정적 확인 (§4); 과거 ‘없음’ 그대로 확대하지 않음 | 60241,60317,60779–60793 |
| WORLD-objective-arrow | 원본 지역/적/앵글러/게이트 목표와 HUD표시, region owner 재사용 | 55427,60794–60929 |
| WORLD-clear-screen | META/MAPS의 보스 사망·상자·출구→클리어 결과. 상자 열기가 clear의 조건은 아님 | 41820–42022,42024–42124,43896 |

별도 기존 WORLD-spawn-barrier(과거 일부)는 참고 의존만이다. `G._bonfire` 안전 결계와 MAP_OBJS의 R회복 bonfire는 다른 상태다.

## 2. 원본 정의→생성→입력→상태→표시→수명 추적

### 2.1 NPC·상인·대장간은 서로 다른 실행 경로

| 경로 | 정의·진입·상태 변화·표시·퇴장 |
|---|---|
| 일반 필드 NPC 데이터 | `src/fieldNpcRoster.js:1–29` 3명: ch1-merchant/마렌/merchant/(92,176)/open_shop, ch1-survivor/에단/survivor/(68,131)/start_rescue_hint, ch1-guide/이실라/guide/(106,54)/show_gate_hint. 각 collision=false, lines1문장. :31–42는 배열·interaction·lines 사본 반환/unknown id 예외. **단위는 문서상 tile**, G/I에서 import·함수명 caller0. spawn/render/거리키/대화창/open_shop 실행은 미확인. etype93와 동일 NPC로 대체하지 않음 |
| 상인 actor 정의 | G:30959 `RARE_ETYPE[93]`: hp16/atk0/spd.60/r14/poise5/색#886644; mkEn 상태 :31352 `_mcShopUsed:false,_mcFleeing:false`. rare 선정·실제 배치는 적 추적 소유. :31423–31431/31471–31476 room/corridor 경로는 death99(.005/1회) 분기 뒤 rareChance(7장.10/그 외.05)에 90..98 무작위 치환이 있지만, :31573–31576은 TileRLE에서 이 경로를 건너뛴다. 실제 CH1 상인 도달/빈도는 미확인. 정의만으로 항상 스폰한다고 주장하지 않음. 도형 렌더 case93 :21830 이후 |
| 거래 조건·입력 | G:40251의 `e._isRare && e.s==='idle'` 외부 gate 안 :40283–40297: `_mcFleeDelay>0` 감소→만료 때 fleeing, fleeing이면 플레이어 반대 방향 speed×2×sp/canMv; 아니고 `!_mcShopUsed && d<50`이면 prompt 60틱 간격/55수명 `[F] 상점`. `K['KeyF']` truthy이면 **잔액 검사 전에** `_mcShopUsed=true`, KeyF=false. BINDS.interact/R가 아님 |
| 거래·실패·도주 | G:40298–40309: cost=`_malCost(100+~~(stage*5))`(할인 helper28080–28085, stage0=50). 잔액>=cost일 때 차감→17슬롯 무작위→U<.3 rarity4/그 외3→mkItem(slot,min(SI_TO_HELL[stage]+2,4),원소P/F/I/D/L 중1,rarity)→worldItems item 드랍(x 오프셋±8,y+20). 구매 성공은 가방 반입이 아님. 잔액 부족도 used=true·퇴장메시지·delay120이 적용돼 재거래 못 함. 실제 상점창/카탈로그/가격목록/판매 경로는 이 분기에 없음 |
| 공격·저주·죽음 | G:42148–42152 hurtE에서 etype93이며 !fleeing이면 fleeing=true/P._greedCurse+=18000. :33021 틱 감소·표시, :32004–32005 dropBonus×.5. :42987–42991 죽으면 mats+=30+~~(stage*2). :43012는 탐욕사도 처치 시 저주 해제. 피해 집행/드랍 계산 소유는 공용·적 담당, 여기서는 접점만 |
| 대장간 진입 | G:31652 ‘forge 삭제됨—G키로 어디서든 접근’. 키 :32108–32132에서 G.on/lesson/editor 검사 후 panel shortcut, **paused return 전** forge toggle. 패드 :13904, HUD 클릭 :28632. :44050 openPanel→closeAllPanels→forge.on/G.paused=true/nav/renderForge. :50514–50520 forgeOpen=true/BGM forge/악의 표시 |
| 대장간 메뉴·확정 | G:50522–50569 실제 상단6탭 upgrade/potion/salvage/reroll/crystal/craft, 장비 탭 meta와 실제표시 구분. 선택 시 _forgeSel/_salSel/_rerollSel/_crForgeSel 초기화. :50570–50579 확인 바. :50461–50475 _fgSelect/_fgCraft는 선택 callback을 보존하고 Shift/Ctrl 최대10회·매회 잔액 gate 후 s.fn() 호출, 완료0이면 부족 안내/그 외 selection 해제·재렌더·저장한다. callback의 비용 차감을 orchestrator가 중복 차감하지 않음. cost·강화/분해/유물 규칙은 META/ITEMS/INVENTORY 표를 권위로 사용 |
| 제작·후처리 | G:50419 CRAFT_COST=_malCost(200000)=100000, :51085 craft부위14종(ossuary 제외), :51162–51184 Shift/Ctrl=최대10회·그 외1회, 매번 잔액검사/차감→생성→빈 장비칸이면 즉시장착/refresh, 아니면 pickupItem→renderForge/dbSaveNow. tooltip의 구30000 문구 :7121/9637은 현 비용이 아님. :44078 closePanel은 on 클래스 제거와 pause=false만 수행. :51203의 fgClose도 이 함수만 호출해 forgeOpen/BGM을 별도로 되돌리지 않는다. :44079 closeAllPanels에서만 forgeOpen=false/BGM 복귀를 처리하고, :32120의 G 재토글은 명시적으로 forgeOpen=false를 쓴다. 닫기 경로를 같은 후처리로 통일하지 않음 |

`F`는 원본 영역 스킬에도 쓰인다(G:28547 및 전투 경로). 상인 actor tick과 F스킬의 실제 충돌 재현·우선순위는 **미확인**이다. 이식 설계에서 임의로 R 또는 새 상점키로 바꾸지 않으며 최종 입력 owner가 원본 순서를 인수해야 한다.

`skill-forge.js`의 합체 화면은 G:2563–2564 외부 로드·:47369–47370 `SkillForge.render()`의 **전투 스킬 패널** 경로다. 이 문서의 장비 대장간 `renderForge`나 월드 `altar`와 이름 때문에 통합하지 않는다. 합체 화면·3D 제단은 SKILLS 추적을 참조한다.

### 2.2 입력 엣지와 ‘우선’의 실제 의미

| 단계 | 원본 행·정확 경계 |
|---|---|
| 엣지·hold | G:6207–6233 `_interactKeyFresh`와 _chkJust를 함께 소비, 마우스는 edge만. primary/secondary를 둘 다 평가한 뒤 OR. parryLesson.allows('interact')가 false면 거부. :6251 바인딩 변경, :31534 initStage에서 reset. Q/E·allows 구현은 보호·이식 담당 의존 |
| 전역 gate | G:32108–32132 G.on false/레슨 tick/editor에서 early return. KeyP 개인 포탈 배치는 pause return보다 앞. 패널은 퍼즈 중에도 열고 닫음. 모든 상호작용을 무조건 단일 `if paused` 앞/뒤로 재배치하면 달라짐 |
| 자동 피해 | G:32796–32822 MAP_OBJS trap/도트는 R 입력 블록보다 앞이며 입력 없이 적용 가능. trap을 R상호작용 후보로 넣지 않음 |
| portal 우선 | G:32825–32827 reset pending이면 pickHoldT0, pressed=_consumeInteractPressed. pressed && !usePlayerPortal일 때만 map→worldItems 블록 진입. 포탈 사용 성공이면 이 블록 전체를 건너뜀 |
| MAP_OBJS 우선 | G:32829–32853 **배열순 첫 조건 일치**를 처리. bonfire<60, unread lore<60, alive breakable<50, unused altar<60. 가장 가까운 것/고정 type 우선순위가 아님. 분기 `break`는 MAP_OBJS for만 종료하며 아래 상자 검사를 막지 않음 |
| 상자→잔해 | G:32855–32911 첫 unopened/unpicked chest<60을 열면 chestOpened=true. 없으면 첫 debris<50을 열고 같은 flag=true. 이 flag만 아래 HP/산소/장비 선택을 차단 |
| 나머지 병행 | G:32913–32952 chestOpened가 false면 HP 가장가까운<60·첫 산소<30·화면 최고등급장비(동률 최근접)를 각각 검사. mat/potion 화면내 최대20건 수거는 **chestOpened 바깥**이라 상자와 병행 가능. MAP_OBJS 성공도 이 처리를 자동 차단하지 않음 |
| hold | G:32954–32979 `!pressed && held`이면 pickHoldT+=sp, >=9에서0으로 하고 화면장비1개+mat/potion최대20. hold는 포탈/map/chest/debris를 다시 실행하지 않음. R주워담기 정책 자체는 TI/P2-006 소유 |

### 2.3 MAP_OBJS 생성·상태·소비·그림

G:25735–25778에서 editor functional5종을 걸러내고 새 MAP_OBJS를 구성, grid200/바닥0·4/충돌·간격 필터를 적용한다. 배치 알고리즘·타일/월드 단위 변환·순서와 최종 y-sort(:26471)는 MAPS_CH1에 위임하며, 아래 배열순은 **소비 시점의 순서**다. ‘가까운 NPC 자동 선택’으로 바꾸지 않는다.

| type·도달성 | 생성 원본 | 입력·상태·정확 보상 | 시각·외부 경계 |
|---|---|---|---|
| bonfire(기능 안식처) | G:25793–25808 생성 코드 전체 주석. 초기 editor 입력에서도 제외(:25736) | G:32830–32833 존재한다면 <60에서 hp/st/mp/shield를 현재 max로, lit=true/mmDirty1/SFX. lit=true여도 재회복 가능. **저장 호출 없음** | G:52302–52318 도형·불꽃·항상라벨/거리<80 키힌트, :4646 조명. 정상 자동배치는 비활성, fixture 소비와 자연 도달을 구분 |
| lore | G:25810–25829 start/boss 제외·최대3, room seed(cx+700,cy+700), R<.4·인접벽 후보 R<.3·허용거리, read=false/textIdx=stage*3+loreIdx. 항상2~3개 보장 아님 | G:32834–32836 unread/<60→read=true·‘비문 발견...’ 텍스트/입자/SFX. textIdx 직접 참조는 G:25825 **1행뿐**, 비문 본문 조회/팝업 consumer 미발견 | G:52319–52328 read별 alpha·라벨, unread/<80 ‘읽기’. 서사 문장 5개 등을 새로 만들지 않음 |
| breakable | G:25831–25851 combatRooms, seed(cx+800,cy+800); R<.3이면 1..3개 시도, hp/maxHp3/alive true, loot mat80%/potion15%/none5%. 배치 탈락 가능 | G:32837–32845 alive/<50→hp−−, <=0에서 alive=false. mat→1+~~(U*3), potion→addPotion('hp',1). 현재 addPotion HP는 **악의+1**(G:28250–28257), 물약 인벤 드랍이 아님. 공격 히트로 mo.hp를 줄이는 경로는 미발견 | G:52329–52338 HP비례 균열/라벨<60; G:52471 dead 파괴물 렌더 skip. 다른 장식 prop에 자동 hp3 부여 금지 |
| trap | G:25853–25868 생성 코드 전체 주석; :18409 pit_blood_a dot 메타도 주석 | G:32798–32806 active/cooldown>0면 -=sp 후continue, 거리<30/iframes<=0/!iceOrb/!ghostWalk면 hp−~~(mhp*dmgPct), iframes30/active=false/교대SFX/.hp<=0은1. hurtP 호출을 거치지 않는 분기. :32809–32821 sprite.dot 경로는 radius(sz||100)*.5·dotPct||.02/dotInterval||30·dead/fallen 제외·HP1 하한. 현재 유효 dot producer 연결은 미확인 | G:52339–52353 3×3/9프레임/300ms pit_blood_a 또는 도형; :52472 inactive skip. pit_poison collider와 피해 trigger는 별개, 비활성 생성을 임의 복원하지 않음 |
| altar(기능 제단) | G:25870–25878 **stage>=5** combatRooms 있고 U<.6, 바닥/거리 허용 시0~1, used=false. 1장0..3의 장식 제단과 다름 | G:32846–32852 unused/<60→used=true/mmDirty1→3개 중 균등1롤: 피의 축복/_altAtk+.15, 뼈의 방벽/_altDef+.20, 광기의 속도/_altSpd+.15. 누적 `(P[stat]||0)+val`, 사용취소/선택 UI 없음 | G:52354–52368 도형/used alpha/미사용<80힌트. used flag와 게임 수치 적용을 구분, 신규 텍스트/임의 multiplier 금지 |

제단 소비: G:28005 공격 가산, :28019 `_altDef*30`(**+.20은 DEF+6**), :27927 speed식의 _altSpd; stage 초기화 :31567 세 값0. 제단 사용 블록에는 applyStats 호출이 없으므로 ‘속도 즉시 갱신’이나 ‘방어력20%’로 과장하지 않는다. 다음 applyStats의 실제 시점별 효과는 **미확인**. 일반 저장 player 필드에 이3값을 새로 추가하지 않는다.

### 2.4 worldItems: 보스상자·잔해·수거

| 경로 | 원본 행·정확 계약 |
|---|---|
| 공통 배열/cap | G:16721 `_wiPush`는 cap20. 미개봉/미수거 chest 점수Infinity, item은rarity, 나머지−1의 최솟값을 tail로 교체 후 축소. 전체가Infinity면 초기 mi0 폴백이므로 ‘상자 절대 미삭제’라고 새 보장하지 않음. Godot 처치 기록 배열과 월드 소비는 구분 |
| 상자 생성 | G:41820–41839 `bossAlive && bossArena`, findBoss/부활대기 확인, bossRoom 존재·생존보스 없음 때 bossAlive=false/clearTime스냅샷/출구연출 후 room중심에 `{type:'chest',picked:false,opened:false}`. _chest3d.show 조건부. 보스 사망 한 번 latch와 부활대기 판정은 보스 담당 경계 |
| 개봉 | G:32855–32878 type/flags/거리<60 첫상자, 먼저 opened=true→3D.open/승리SFX. count3+~~(U*3), 매 item 슬롯17 중1·원소P/F/I/D/L/H 중1·tier0, stgB=min((stage||0)*.015,.30), leg=min(.15+stgB*.5,.40), hero=min(.25+stgB*.4,.35), rr<leg→4/<leg+hero→3/<leg+hero+.30→2/나머지1. mkItem 의존→분산50px world drop, 보장 가방 반입 아님 |
| 추가 보상 | G:32875 mats+=5+~~(stage*2), :32876 addPotion('hp',2)는 원본 :28250–28257에 의해 실제 악의구슬+2. 표기 ‘HP물약+2’를 새 지속 물약2개로 해석하지 않음. 첫상자 pet tut hook32877은 대사/오디오 담당 의존 |
| 잔해 생성 | G:42745–42752 !boss/!rare 적 사망 시 elite>=3/.25·>=2/.15·>=1/.08, 성공하면 debTier2/1/0 레코드. 처치·드랍 담당 소유. breakable/MAP_OBJS와 다른 컬렉션 |
| 잔해 개봉 | G:32882–32911 first unpicked debris/<50, picked=true. mats=[3,8,15][tier]+~~(stage*[.5,1,2][tier]); 장비수=[0,1,2]+(tier>=1&&U<.5?1:0), 등급분기는32901–32902 그대로. tier>=1이면 U<.4일 때 HP추출1→악의구슬1. chestOpened를 공유해 같은 입력의 chest/debris 2중 개봉 방지 |
| 그림·fallback | G:52595–52619 조건부 3D active면2D 힌트, opened/닫힌 도형 fallback. :65235–65338 THREE/GLTF 별도 module·GLB로드/전역 _chest3d.show/open/hide/active, 이후 tick 렌더. 단일 전역3Doverlay와 보상 상태는 별개. 자산 GLB 미수신·실제 로드/동작 미확인, Godot로 이식됐다는 뜻 아님 |
| 수거 | G:32913–32979 HP/산소/장비/mat/potion 및 hold는 기존 TI/P2-006 의존. UI 번호/화면내 판정과 상태 반입 API 완료 여부를 각각 검수해야 함 |

### 2.5 개인 포탈·존 포탈·리프트·게이트·클리어

| 상태 | 생성·이동·수명·소비 |
|---|---|
| 개인 쌍 | G:16631 T40, :18309–18315 on/map/P/dead/fallen gate. pair없음 또는length>=2이면 새 A=[현재위치], 1개면 간격<5T(200) 거부/같으면 B허용. :18316–18322 length정확2, **배열 첫 근접** 거리<2.2T(88), 반대좌표/P.vx/vy0/카메라 snap·FX/true. <=로 바꾸지 않음. :31535 initStage 및 :30161 loadZone에서null. :18323–18332 바닥그림, :51962–51972 렌더·근접힌트. 벽검사/canMv/통행료/새 cooldown 없음 |
| 존 포탈 | G:30149–30215 _saveZoneState/_loadZone·G._zones/_portals, :30646–30673 타일6 생성. :41857–41867 타일6 밟으면 width기반범위→_loadZone(toZone,spawnX,spawnY); R입력 필요 없음. 저장된ens/items/holes/clearedRooms/kills와 맵 재생성(:30151–30156,30180–30186), MAP_OBJS/read/used 상태의 별도 영속 왕복은 미확인. 개인포탈과 통합 금지 |
| 적 사망 리프트 | G:42755–42761 kill chain 5회/chainT180에서 G.rifts 레코드(x,y,t0,maxT120,spawnedfalse,si)를 만들며 :30755 arena entry에서 초기화. G:35695–35720은 t>=maxT에서 적 소환을 시도한다. holyPrison 안·적 cap 도달·mkEn 실패이면 소환 없이 해당 항목을 제거하고, 그 외에는 t>=maxT+30에서 제거한다. 플레이어 접근/입장·귀환 포탈이 아니다. 자세한 생성기/적 소비는 META/적 추적 참조. 개인 쌍/존 포탈 API로 대신하지 않음 |
| 게이트·클리어 | G:41868–41921 region4/4+si0 fieldboss완료→bossUnlocked; region없는맵만 전역80%+문지기10%폴백. 출구 밟음→boss alive면 arena 진입/조건대기, 보스죽었으면 stageCleared=true. :41921–42022 SP/기록·UI, :42024–42124 결과. :43896 nextStage/demo끝/챕터경계. 상자 opened를 clear admission으로 새 요구하지 않음 |
| 안내 | G:60241/60317 구역제목; :60779–60793 지역 진입배너. :60798–60826 arrow target: gate개방이면gate, 아니면 미정화지역별 남은 앵글러/생존적centroid/사이트/지역중심을 만들고 후보 목표가 플레이어에 가장 가까운 미정화 지역 선택. :60867–60929 표시·레이아웃/레슨·paused 등 gate·20프레임 재계산, draw caller55427. 현재 region owner와 별도인 방향그림 미연결을 구분 |
| 시작 안전 결계 | G:31610 `{x:P.x,y:P.y,t:300,r:280}`, :34413 이후 tick/적밀어내기, :55323–55333 sprite. 인트로/레슨 :63281/63431/63523 등 on/off 복원은 별도. 안식처 R회복/세이브포인트가 아님 |

### 2.6 index.html·저장과 경계

I 전체 1–4742행 심벌 색인(부록 A)에서 MAP_OBJS/worldItems/forge·상인 상태·상호작용 함수·필드NPC roster caller는0이다. 대소문자 NPC/shop/forge/portal/altar/chest/interact 검색의 2행은 :2332·2340 시네마틱 다국어 서사 단어 일치이며 NPC/월드 행동이 아니다. 정적 심벌 부재를 외부 서버/동적 코드의 절대 부재로 확대하지 않는다.

I:3026–3058 온라인 목록, :3485–3519 데모 슬롯 동기화/활성화, :3522–3550 로컬 목록, :3650–3655 선택, :4340–4349 game.html 진입은 **SAVE/로비 추적 경계**. NPC 상점·대장간·월드 오브젝트의 UI/상태 producer가 아니다.

G:3533–3576/3603–3811 및 실제 로컬·데모·웹 override는 SAVE 참조. inv/mats/skills 등 기존 payload 보호. mo.read/used/alive/hp·개인 pair·상인 used/도주·제단3값을 새 영구 schema로 옮기지 않는다. zone-state와 캐릭터 저장을 같은 저장이라고 부르지 않는다. 모드별 실제 reload/왕복은 **미확인**이다.

## 3. docs 불일치·기록 경계

원문을 읽고 아래 표로만 보고한다. 다른 담당 설계·분모 문서는 수정0. 구현자는 문서의 과거 계획을 현재 원본에 더해 기능을 창작하지 않는다.

| ID | docs·행의 주장 | 현재 원본/정적 근거 | 판정·취급 |
|---|---|---|---|
| D01 | `8.2레어몹디자인/8.2레어몹디자인.md:27` 상인93 ‘상점 UI 제공’; FEATURE의 IT-shop도 상점 UI 부재 언급 | G:40295–40309 F 즉시 1거래/잔액부족도used/퇴장. 별도 UI창 없음 | **표현 불일치**. 원본 재현의 기준을 가상의 상점 창으로 만들지 않음 |
| D02 | `EXODUSER_MASTER_BIBLE_v2_2 (2).md:1065` 안식처 R회복+세이브 | G:25793–25808 자동생성 비활성, :32830–32833 회복만/저장호출0 | **동작/도달성 불일치**, 새 세이브포인트 구현 금지 |
| D03 | 같은 마스터 :1066 비문 팝업; `HELL_EXODUSER_WORLDVIEW_v2.md:229,252` Ch2~6 비문서사 파편 목표 | G:25825 textIdx writer만, :32834–32836 발견표시/read. 본문 조회/팝업 미발견 | **목표와 구현 분리**, 원문 대사·UI 도달 미확인. 새 비문 내용 작성 제외 |
| D04 | 같은 마스터 :1068 맵 전역 함정~100개 | G:25853–25868 생성 주석·:18409 dot 메타 주석, consumer 잔존 | **생성 상태 불일치**. 일반맵에 자동100개를 되살리지 않음 |
| D05 | 같은 마스터 :1069 ‘3장 이후’ 제단 | G:25871 stage>=5(0-based), :16658–16665 SI_TO_HELL 맵분류와 별개 | **배치 조건 불일치**. 새 chapter>=2 gate로 변경하지 않음 |
| D06 | `map-objects-placeholder-prompt (2).md:69` lore2~3개·막다른방 | G:25812–25826 최대3/확률·탐색실패 허용, start/boss 제외 | **과거 제안 차이**. 최소 개수 보장/새 배치 알고리즘 추가 금지 |
| D07 | 같은 prompt :119–129 공격 파괴/포션 worldItems 드랍 | G:32837–32845 R로 hp1감소·addPotion HP 직접호출, :28250–28257 악의 전환 | **현 구현 차이**. 공격 판정/새 물약 드랍을 만들어 검사 통과시키지 않음 |
| D08 | 같은 prompt :137–146 지옥별 감속/감전·cooldown120 재활성 설명 | G:32798–32806 hp비율/active=false/HP1하한, 생성도주석 | **옛 설계 상충**. 쿨120 재발동/지옥별 효과 추가 제외 |
| D09 | 같은 prompt :155–164 atkMul1.15/defMul1.20/spdMul1.15 또는G._altarBuff·실제적용나중 | G:32848–32850 P._altAtk/.Def/.Spd 가산 .15/.20/.15, DEF 소비×30 | **필드·연산 불일치**. 배율1.2 또는공유buff schema로 옮기지 않음 |
| D10 | FIELD_NPC_ROSTER:3,21–29 데이터/hook PASS·runtime pending | src:1–42 데이터/helper 존재, G/I caller0 | **문서는 경계 정상**. PASS를 실제대화/상점 완료로 오독하지 않음. 좌표를 최신맵에 설치할지도 미확인 |
| D11 | `2_6 소환굴+리프트시스템.md:37` 포탈 2.2T ‘이내’ | G:18318 strict `<2.2T`(정확88은불가), :18313 최소간격은 `<5T` 거부(정확200허용) | **포함 경계 설명 보완 필요**. 코드 변경 없이 strict 단정 |
| D12 | `docs/2_4 펫시스템/대사_스크립트.md:215` 및 G:7121,9637 제작30000 | G:50419 현행 CRAFT_COST100000. META §3가 권위 | **문서·원본 내부 표시 불일치**. 힌트로 경제값을 재설계하지 않음; 원문 대사 변경 제외 |
| D13 | FEATURE snapshot WORLD-stage-title 없음·META-region 없음 | 현 pinned main `native_regions.gd:216–284` banner/title 및 main:267–271 구성 | **시점 차이**, 일부 정적 구현 존재. 실행/화면/완료율을 상향 선언하지 않음 |
| D14 | WORK_BOARD P2-006a 기능 main병합/표시 P2-006b 작업 | 현 pinned tracked Godot에 native_world_drops.gd·world_drops/pickup_contract 테스트 미발견, state drop records는존재 | **기록/tree 차이**. 다른 branch의 WIP를 가져오거나 완료 의존으로 간주하지 않음. 구현 착수 시 최신 main·담당에 재확인 |
| D15 | MAPS_CH1 참고본은 완료 추적·수치, 기능 분모는 과거 MAP0snapshot | 이번 main에 그 문서 없음, 참고 SHA와 원본해시는 분리 기록 | **참고와 인수 차이**. 미병합 문서/관측으로 최신map consumer 완료를 주장하지 않음 |
| D16 | `2_6 소환굴+리프트시스템.md:28–29` 균열 접근 시 보상/이벤트, FEATURE의 META-rift 입장·귀환 명칭 | G:42755–42761 생성→35695–35720 틱 기반 적 소환/소멸 | **행동 의미 불일치**. 원본 G.rifts를 이동 포탈로 이식하지 않음 |

마스터 전체 경로: `docs/0마스터플랜/EXODUSER_MASTER_BIBLE_v2_2 (2).md`; prompt 전체 경로: `docs/4.1맵디자인+설정/map-objects-placeholder-prompt (2).md`. 설계 충돌은 원문/현 코드와 함께 총괄 인수 대상으로 남긴다.

## 4. Godot 의존과 빠진 것 — 코드·테스트 정적 확인

아래 파일/단정은 이번 실행 PASS가 아니다. `native_regions`의 현재 코드와 과거 분모를 구분한다. 검색은 tracked `godot/scripts`, `godot/port_modules`, `godot/tests`를 대상으로 했으며 다른 브랜치 구현·autogenerated scene·실플레이의 존재는 미확인이다.

| 의존·현재 위치 | 확인된 것 | 빠진 것/재사용 조건 |
|---|---|---|
| `port_modules/npc_interaction/source_options_state.gd:1–24,55–91` | source OPT holder/reader·READY/NOT_READY. NPC라는 폴더명뿐 | NPC선택/대화/상점 runtime 아님. 이 파일은 설정 담당 소유, 새 NPC 코드를 덧붙이지 않음 |
| `scripts/native_source_new_run_state.gd:175–184,508–521,560–586` | 실제 G/P/INV reader, HP addPotion→mats, 처치drop 기록/cap20 | 일반 상점 결제·worldItems chest cap보존·mo 상태 mutation API 아님. 신뢰 owner gate를 임의 bypass할 수 없음. 기존 append cap는 rarity 위주로 chestInfinity 특례 없음—그대로 chest완성 sink로 쓰지 않음 |
| `port_modules/kill_reward/drop_item_source.gd`, `equipment_affix_reader/producer.gd`, `combat_stat_formula/producer.gd:320–330` | 기존 아이템 생성·장비조회·_altAtk readonly 소비 | 상인 거래/제단3값 writer·적배치·가방반입/UI와 구분. 생성기 RNG 재사용, 별도 mkItem 구현 금지 |
| `player_defense_speed_parameters_source/producer.gd:549–558,594`·`scripts/hud.gd:1074` | pDefAdd/_altSpd 원본 consumer 일부, CP도_def참조 | used→실제 P쓰기/refresh·레벨 전환 reset 접점 필요. reader 존재를 제단 플레이 완료로 세지 않음 |
| `scripts/enemy_factory.gd:151–166` | 등록된 제한 프로필만지원, 다른etype는native_type_ai_not_ported | etype93 일반consumer 미지원. 상인 actor·추적/도주·F입력·공격저주·사망주머니를 별도 인수해야 함. 근접 적으로 위장 대체 금지 |
| `scripts/world.gd:2082,2753,2781,2803,2825–2836,3127` | 오브젝트 이미지/렌더·frame reset epoch/native tick·parts·enemy phase 등록·충돌 | MAP_OBJS 5종 상태/순서처리·개인포탈/zone/chest consumer는 미발견. static prop/col이 있어도 상호작용 아님. 적용하려면 현맵 실제배열/epoch authority 필요 |
| `source_init_stage_entry_owner/producer.gd:43–49,75–81` | reset_interact_input callback 및 player_portal_pair reset **명령 seam** 정의 | 호출/명령의존만으로 R edge/포탈 이동 구현 아님. 현 Main 연결·실제 source body 인수는 별도 |
| `scripts/native_regions.gd:106–163,216–284`, `scripts/main.gd:267–271` | 실제 G reader·kill·region tick/게이트해제 signal·배너/구역제목 생성 | 지역4개·분모 owner **재사용**. 개인portal/arena transition/result screen/원본방향화살표 미발견. `tests/test_p3003_regions.gd:57–58` title 단정 존재, 이번 미실행 |
| `native_intro_curtain_sequence.gd:171`, `native_parry_lesson_flow.gd:746–774` | 별도 bonfire 결계 저장/제거/복귀 접점 | MAP_OBJS 회복/안식처가 아님. 레슨 allows·Q/E·cleanup 수정 제외 |
| `port_modules/save_adapter/*`, performance_capture | pure save 수명 주기/fixture·QA로그 일부 | 실제 보관함/mats 공유저장·NPC영속/모든world flags 저장 완료 아님. serializer/identity/마이그레이션은 SAVE 보호 |
| 기존 tests | p2001c 처치보상·contracts·p3003 region·입력/레슨 검사 파일 존재, 웹 fieldNpcRoster는 데이터/hook 단정 | 신규 NW runtime 검사 없음. 기존 QA 이력을 이번 추적에서 재실행·상향하지 않음. 실제 씬·브라우저·PC/macOS 플레이 미확인 |

## 5. 작은 이식 순서안

경제/인벤/맵 담당 단위를 기다릴 때 새 대체 owner를 만들지 않는다. 각 단계는 **자기 신규 파일부터**, 실제 Main 연결이 필요한 단계는 총괄이 정확한 접점·소유자를 별도 승인한 뒤 작은 후속 작업으로 분리한다.

| 순서·후보 | 작은 결과물 | 의존·완료선 / 공용 |
|---|---|---|
| 1 NW-01 | MAP_OBJS 첫 상호작용 대상 순수 질의 + 원본대조 신규 테스트 | §5.1 구현지시. 입력/상태쓰기/RNG/씬 연결 없음. 공용 0줄 |
| 2 NW-02 | 개인포탈 설치/사용의 순수 상태전이 proposal | G18309–18322/30161/31535 strict반경·좌표·속도·카메라 명령·reset, 원본발췌대조. 아직제품이동없음/공용 0줄 |
| 3 NW-03 | MAP_OBJS action reducer를 lore→breakable→altar→bonfire로 더 쪼개 검수 | NW01+실제 HP addPotion/mats·RNG·P소비자 의존. fixture에서 source순 effects/write prefix 검수, 상태사본을 actual권위처럼 주장하지 않음/공용 0줄 |
| 4 NW-04 | 상자/잔해 reward proposal·공통 world item admission | ITEMS 생성기/P2-006 sink·cap20/chest 특례·RNG순서 의존. 개봉flag/중복방지/임계·보상순서 fixture 검수, 실제bag쓰기 없음/공용 0줄 |
| 5 NW-05 | world interaction 실제 consumer 연결(먼저 lore/개인쌍 중 하나) | 최신map source/입력epoch/원본배열/레슨·pause·lifetime 인수 필수. Main/world/Player/P owner 공유접점 필요하면 **BLOCKED**, 예상줄·위치·근거만 보고하고 별도 연결 배정 |
| 6 NW-06 | etype93 거래·실패·도주 pure 계획 + 실제actor는 후속 | 적 factory 담당·ITEMS·META 견적/재화·P2-006 의존. 잔액부족도1회소진/120틱/원본F·curse, 실제전투/수거 인수는 별도. factory/피해 집행자 공용 0줄 목표, 필요 시BLOCKED |
| 7 NW-07 | forge 패널 façade (6탭·pause/BGM·닫기부터) | META 계산·TI mutation·IT/결정·SAVE 저장호출을 주입. 경제·인벤 단위를 복제하지 않음. 실제UI입력 연결은 담당승인/시각검수·언어·패드·취소검증 필요 |
| 8 NW-08 | fieldNpcRoster 읽기/대화 hook 상태만 standalone | 현재3명은 미연결 데이터, `open_shop`의 etype93 대체 여부/최신tile좌표 유효성은 미확인. 총괄이 데이터 채택을 확정하기 전 일반NPC 실제스폰/새퀘스트·새대사창을 만들지 않음 |
| 9 NW-09 | trap 도달성/비활성 상태 계약부터 별도 검사 | 생성주석 유지·runtime handler만 fixture검수, 맵 환경피해는 map/Player 피해 owner 합의 필요. 비활성 함정 자동활성화 금지 |
| 10 NW-10 | arrow/clear/zone·arena 연결을 각각 독립 작업으로 | native_regions/MAPS/META·보스·HUD·SAVE 선행. 구역제목 이미있으므로 재구현하지 않고 부족분만 대조. 출구·클리어·상자open·저장을 한 PR로 뭉치지 않음 |

### 5.1 1번 NW-01 — 구현 지시서(아직 구현하지 않음)

**목표:** G:32829–32853에서 MAP_OBJS 루프가 고르는 첫 대상만 readonly로 관측한다. 원본 type5종 전체 구현이나 상호작용 router 완성을 선언하지 않는다. 이 단위는 disabled bonfire도 **입력 fixture로 존재할 때** 판정을 보존하며 자연배치를 활성화하지 않는다.

| 항목 | 구현자가 지킬 계약 |
|---|---|
| 허용 파일(안) | 신규 `godot/port_modules/world_interaction_query/producer.gd`, 신규 `godot/tests/test_native_world_interaction_query.gd`, 필요하면 원본발췌 oracle용 자기 `tools/` 1파일. 관련 docs/CHANGELOG_SYNC만. 최초 착수 시 동일경로/소유 충돌 재확인 |
| 형식 | `extends RefCounted`. 제안 API `query_map_object(player_xy: Variant, ordered_objects: Variant, interact_pressed: Variant, portal_used: Variant) -> Dictionary`, `provenance() -> Dictionary`. 인수는 함수 안에서 검증해 malformed 호출을 엔진 타입 오류로 끝내지 않는다. autoload/Node/SceneTree/리소스 로드·P/G singleton 연결 없음. 이름은 새 native API이며 원본 함수명이 아님 |
| caller 인수 | 현재 소비 순서의 fixture Array와 finite number x/y의 player Dictionary를 받는다. 두 gate는 caller가 레슨/입력 엣지를 소비한 결과 및 포탈 사용 결과를 제공하는 명시 bool. NW01은 allows/keyup/pause/global_on을 직접 판정하지 않음 |
| gate·검증 순서 | **아래 순서 고정**: ① 두 gate가 bool이 아니면 NR(`gate_type`). ② pressed=false 또는 portal_used=true면 정상 no-match, 다른 인수는 읽거나 검증하지 않음. ③ active gate에서는 Array 여부(`objects_not_array`)와 player의 finite x/y(`player_xy_not_finite`)를 검증한 뒤 순회. 빈 Array라도 ③ player 검증은 수행. 이 방어 계약은 native API 지원 범위이며 원본 JS의 모든 예외 순서와 같다는 주장은 아님 |
| 후보 검증 순서 | ④ 순회 중 원소가 Dictionary 아니면 NR(`entry_not_dictionary`); type이 부재/null/StringName/비문자열이면 NR(`entry_type_not_string`). unknown String type(trap/m_c1altar 포함)은 좌표·flag를 읽지 않고 skip. ⑤ lore는 read, altar는 used, breakable은 alive만 평가. bool/null/키 부재만 지원하며 부재/null은 JS falsy. 미지원 flag는 NR(`flag_unsupported`), 다른 type의 미사용 flag는 검사하지 않음. lore의 read=true, altar의 used=true, breakable의 alive=false/null/부재이면 좌표를 읽지 않고 skip. bonfire는 lit을 포함한 모든 flag 무시. ⑥ 남은 후보에서만 finite x/y를 검증(`entry_xy_not_finite`), 거리 판정. hp/loot 등 action 필드는 질의에서 읽거나 검증하지 않음 |
| 선택 | bonfire/lore/altar는 거리<60, breakable은<50. G31723 sqrt 거리·strict 부등호 보존. 입력 수치는 JS Number에 대응하는 float64로 계산하고 정수형 뺄셈·제곱의 overflow를 일으키지 않는다. **앞에서 첫 match를 반환한 뒤 나머지는 검증하지 않는다.** invalid 후보가 앞에 있으면 NR, 첫 match 뒤 invalid는 영향 없음. 최근접/정렬/type별 묶음 금지. prototype/getter/희소배열·그 밖의 JS carrier 완전 동등성은 범위 밖·미확인 |
| 출력 | 고정 6키: `ready`, `matched`, `source_index`, `type`, `reason`, `source`. source는 항상 `game.html:32829–32853`; ready=true이면 reason=null. match는 matched=true/index=int/type=해당 String, 정상 no-match는 matched=false/index=null/type=null. **NR=미지원·미준비 입력으로 ready=false**, matched=false/index=null/type=null/reason=위 코드. index는 영속 ID가 아닌 입력 위치. match를 세계 전체 입력 소진으로 해석하지 않음 |
| provenance | 별도 함수만 반환: file=`game.html`, start_line=32828/end_line=32853(주석 포함), source_sha256=§0 G 전체 해시, fragment_sha256=`9eea8397b33211a9a7b4ba18372d4fb60a5ab6cffa497687254d47b66d6c265f`, connected=false. 이 값은 원본·모듈 범위 식별이며 actual 설치 성공 표식이 아님 |
| 쓰기/난수 | 입력 Array/Dictionary 참조·필드·순서 변경 0, hp/used/read/lit/mats/P 쓰기0, 입력 소진0, RNG 소비0, 신호/오디오/파일·저장 IO0, 생성/배치0. 두 번 호출해도 같은 출력·입력 동일 |
| 의존 | 제한된 finite/null/bool 계약만 필요. OPTIONS 폴더·TI/IT 생성기·Main·shared6를 수정하지 않고 독립 로드. 타 유틸 재사용은 계약/부모SHA의 main 존재를 확인하고 없으면 의존 기록. 범용 JS 변환기를 새로 만들지 않음 |

**필수 검수 입력(목록은 미래 요구이며 현재 Godot PASS 수가 아님):**

| 검사군 | 빠뜨릴 수 없는 단정 |
|---|---|
| 반경 | bonfire/lore/altar 59.999·60·60.001, breakable49.999·50·50.001, diagonal(36,48)=60의 경계. 정확경계는불가 |
| 상태 | read/used false·true·null·부재, alive true·false·null·부재. lit true도회복대상. unknown prop/장식제단/trap/빈배열 불일치 |
| 순서 | 더 먼 유효 첫항목과 가까운 뒤항목→첫항목, 사용완료첫항목 skip→다음, 같은type/다른type 동거리. source_index/입력배열순 유지 |
| gate | pressed 2값×portal_used 2값 및 잘못된 gate. inactive gate+malformed player/array는 정상 no-match, gate 자체가 비bool이면 NR. active 빈 배열+잘못된 player는 NR. 어떤 결과도 chest/bulk 입력 소진을 뜻하지 않음 |
| 도메인 | 음수/소수 좌표 지원. null/숫자 원소·type 부재/비문자열·finite 아닌 후보 좌표·관련 flag 문자열은 위 순서의 NR. read=true/used=true/alive=false 후보의 malformed 좌표는 skip, 미사용 flag 문자열은 무시, match 뒤 malformed 원소도 무시. 입력을0으로 변환하지 않음 |
| 불변·비연결 | deep snapshot·같은 참조 재조회·반복2회 출력 동일, RNG spy0·파일/Node/Main 생성0 검사. `source_data_not_installed=true`는 테스트 보고서의 범위 표식으로만 사용하며 query의 새 필드가 아님. 실제 NPC 설치 PASS를 출력하지 않음 |
| 원본 oracle | 정상 지원 입력은 G32828–32853을 본문 변경 없이 발췌, G31723 dst/메모리 MAP/P/G·FX stub·객체 쓰기 추적 Proxy로 첫 대상을 관측해 비교. gate는 원본32827 조건을 별도 대조. NR carrier/방어 검증 순서는 위 native API 계약 검사이며 **원본 JS의 NR 결과처럼 비교하지 않음**. oracle 미준비는 SKIP/PASS가 아닌 실패/미실행으로 기록 |

oracle은 각 구현 작업의 고정 원본에서 **재생성**한다. Mac의 `_out`이나 이전22개 JSON을 다운로드해야 하는 의존은 두지 않는다. 구현자가 새 `tools/` oracle을 자기 브랜치에 포함하고 (a) §0 기준 G 바이트/전체SHA 확인, (b) 시작 마커 `    // MAP_OBJS 상호작용 (우선)`부터 다음 `    // 보물상자 체크 (우선)` 직전까지 정확 발췌, (c) 위 fragment hash/포함행 대조, (d) 원문·입력·결과를 자기 원로그에 저장한다. G31723의 `dst`도 원문 발췌한다. 마커 중복·누락/hash 차이면 실패로 멈추고 최신 원본 차이부터 보고한다. 최신 main 원본이 달라졌으면 이 고정 증거를 그대로 현행이라고 쓰지 말고 추적/기대값을 먼저 갱신한다. oracle은 fake P/G의 부수효과만 허용하고 함수 본문을 바꿔 정답을 강제하지 않는다.

착수 기준은 그때 fetch한 최신 main. 새 테스트 격리명은 **해당 구현 작업ID의 승인된 고유 이름**, 기존 회귀는각파일상수; 이 문서의 trace-npc-world 이름을 후속 작업에무조건재사용하지않는다. Godot 실행 전 항상 `pgrep -f "Godot.app/Contents/MacOS/Godot" | wc -l`, 2이상이면30초씩대기, 매run override설정/종료후비움. **이번 추적에서는 Godot 실행 0.**

미래 테스트 실행마다 `godot/override.cfg`의 `[application]` 아래 `config/use_custom_user_dir=true`, `config/custom_user_dir_name="<해당 승인 격리명>"`을 설정하고 종료 finally에서 0byte로 비운다. 새 테스트는 시작 시 `OS.get_user_data_dir().get_file() == 승인격리명`을 검사해 불일치면 실패/종료하며 사용자 디렉터리를 만지지 않는다. 부분문자열 포함 검사로 대신하지 않는다. 기존 테스트는 각 상수명 우선, 상수가 없으면 해당 구현 작업의 승인 격리명을 사용한다.

완료 조건: 신규 순수 테스트0실패+기존 test_contracts0실패, oracle 원문/행·hash/검사수·skip0/ERROR를 원로그로 제출. 기존 main에서도 실패하면 이름·원문·baseline SHA를 별도로 보존하고 새 회귀와 구분한다. 공용/다른 테스트를 고치거나 검사를 줄여 회귀 PASS로 만들지 않으며, 해당 회귀 인수는 BLOCKED/미통과로 남긴다. 기존 region/레슨/줍기 관련 테스트는 현행 main 존재·접점에 맞춰 담당이 선택하고 상수격리를 유지한다. 원본·공용·P2-006·저장형식0행이 아니면 NW01은범위초과로BLOCKED. actual설치/자연플레이·비활성타입도달은별도검수다.

## 6. 공용 접점·중단 조건 — 이번 각 0줄

| 공용/타 담당 접점 | 향후 필요한 이유·현재 처리 |
|---|---|
| main.gd 실제 초기화·입력/캐릭터 선택 | native_regions 구성 :267–271과 기존 Player/State bind 사용. NW연결 필요시 좁은함수·예상삽입줄·원본순서 제출, NW01은참조도주입하지않음 |
| world.gd 실제map/물리/epoch | 렌더prop/collider와상호작용배열분리, 소비순서·stage전환·등록해제/Node수명 필요. layout/Ysort/카메라를NW규칙이 임의갱신하지않음 |
| player.gd 현재좌표/velocity/HP·iframes·입력edge | 개인포탈 snap·환경피해·bonfire refill·허용레슨/paused순서. 실제쓰기owner없으면READ-only/NR 유지. Q/E 입력경로변경 0 |
| native_source_new_run_state.gd G/P/INV 권위 | 상점·잔해·제단·포탈 상태쓰기·reset·통화차감 transaction. apply_native_add_potion의기존owner gate 재사용검토, 다른costAPI를우회사용하지않음 |
| hud.gd/NativeRegions | prompt/제목·배너·방향그림·클리어/패널·언어/패드/focus/Pause. 이미있는구역제목을중복생성하지않음; 읽기계산으로시각인수대체금지 |
| native_normal_enemy_hurte.gd / enemy_factory.gd | etype93 attackcurse/사망주머니와실제actor admission. 피해집행자/적담당파일, 이번추적과NW01각 0줄 |
| P2-006a/b·TI·IT·META·SV·설정·레슨 | drop표시/sink·실제반입/생성기·견적·저장·바인딩·allows는그담당계약. 최신 main실파일/지원gate를확인해참조하며제출branch만보고연결완료로간주하지않음 |

새 singleton, 두 번째 G/INV/공유 지갑, 편의 ‘한 번 입력에 한 개만’ 전역 소비 플래그, 비활성 trap/bonfire 자동 스폰, NPC/상점/비문 새 콘텐츠, 세이브 키/마이그레이션 변경은 이 순서안의 승인 범위가 아니다. 필요한 공용 접점이 없거나 다른 담당 파일을 고쳐야 하면 근거를 보고하고 그 연결 단위만 BLOCKED로 남긴다.

## 7. 검증·미확인·제출

원로그 `~/exoduser-wt/_out/trace-npc-world/`: preflight.json, docs/game 키워드 색인, 선행 추적 scope 색인·MAPS_CH1 고정 사본, function-spans.json, reference-census.json, source-audit.cjs, map-query-source-observations.json. G/I의 유효 inline script 13개를 acorn으로 파싱했고 심벌 41개를 각 파일 전행에서 검색했다. 원본 MAP 루프 22입력의 첫 대상 관측은 예측과 22/22 일치(Node VM), **native 구현/기존 회귀 통과가 아니다**. 실제 제품/테스트 파일 변경·Godot/GUI·저장/서버 호출 0.

미확인: 최신 runtime NPC 설치/대화·F 입력 충돌의 자연 재현·전체 상인 스폰 빈도·제단 speed 실제 갱신 시점·trap/dot 실제 도달·최신 맵에서 roster 3명의 좌표 유효성·개인 포탈/상자 3D/클리어의 실창·PC 동등성·모드별 영속 저장. 원본 JS carrier/동적 객체 전체 동등성도 주장하지 않는다.

독립 독자 검토로 NR 검증 순서·출력 형식·oracle 재생성·회귀 실패 처리의 모호성을 점검하고 §5.1을 보완했다. 첫 대상/상자 병행·상인 실패 소진·비활성 생성·12+8 대응도 원본과 재대조했다. 독자 검토는 정적 검토이며 제품 검수 PASS가 아니다.

정상 docs-sync pre-commit, 명시된 2문서만 stage/commit/push. 원격 branch SHA 일치 확인 후 DONE.txt를 원로그에 기록하고 자기 worktree를 제거한다. 브랜치·원로그·본문 사본을 남기며 R/다른 worktree는 보존한다. main push/force/git add -A/훅 우회 0. 구현 완료/기능 분모 상향/테스트 PASS를 조작하지 않는다.

## 부록 A. 심벌 참조행 전수 색인

위 해시의 G/I 모든행에 정확한 ASCII식별자 경계로 검색한 **직접문자참조**다(주석/문자열포함). 함수/상태별 정의·쓰기·호출 위치를 누락 없이 재찾는 색인이며 간접동적참조까지 증명하지 않는다. 0은 그심벌직접일치0. `MAP_OBJS/worldItems`는 타아이템/맵기능도포함하며 참조대상을각선행문서로넘긴다.

| 심벌 | G 직접 참조행 | I 직접 참조행 |
|---|---|---|
| `MAP_OBJS` | 4641–4643, 4923, 17473, 18525, 25736, 25750, 25774–25776, 25801, 25806, 25825, 25848, 25867, 25877, 25896, 25995, 25999, 26014, 26020, 26032, 26043, 26055, 26076, 26079, 26101, 26151, 26177, 26188, 26218, 26229, 26239, 26262, 26272, 26323, 26354, 26364, 26413, 26416, 26443, 26450, 26452–26453, 26456, 26461–26462, 26465, 26470–26471, 29543, 30167, 30275, 30680, 30682, 30692, 30772, 31553, 31581, 31682–31683, 31686–31687, 31718, 31721, 32796–32797, 32828–32829, 38602, 51930–51931, 51960, 52125, 52278, 52297, 52468, 52480, 52616, 52650, 55450, 60110, 60494–60498, 60500, 62247, 62270, 63483, 63499 | 0 |
| `worldItems` | 16719, 16721, 30153, 30167, 30186, 30760, 31553, 32856, 32883–32884, 32915–32916, 32920, 32927–32928, 32935, 32939, 32945, 32961, 32965, 32970, 34384–34385, 34387, 35632, 41634–41635, 41647–41648, 41712–41713, 41724–41725, 43080, 49044, 49052, 52485, 52616, 55251, 60490, 60610, 61924, 63483, 63872 | 0 |
| `initMapObjects` | 11970, 25735, 27029, 30210, 31665, 63513 | 0 |
| `_resetInteractInput` | 6210, 6251, 13372, 31534, 43869, 48742, 48754, 48794, 48798, 48811, 49307, 63472 | 0 |
| `_consumeInteractPressed` | 6222, 32826 | 0 |
| `_interactHeld` | 6231, 32955 | 0 |
| `_placePlayerPortal` | 18309, 32113 | 0 |
| `_usePlayerPortal` | 18316, 32827 | 0 |
| `_drawFloorPlayerPortal` | 18323, 51966 | 0 |
| `_playerPortalPair` | 16718, 18311–18312, 18317, 30161, 31535, 51962–51964, 51967 | 0 |
| `_portals` | 16718, 25982, 26099, 26148, 30172, 30175, 30646, 30673, 41857, 41860, 43896, 51973–51974 | 0 |
| `_loadZone` | 30159, 41863 | 0 |
| `rifts` | 16716, 30755, 30771, 35696–35697, 35718–35719, 38596–38597, 42759, 43896, 61951, 62126, 62364, 62476, 63494, 63956, 64105, 64886, 64896 | 0 |
| `forgeOpen` | 13904, 16715, 28530, 28632, 32120, 44079, 50488, 50493, 50515 | 0 |
| `forgeTab` | 16715, 50554, 50565, 50569, 50582, 50690, 50709, 50790, 50841, 51082, 51108, 51119 | 0 |
| `renderForge` | 28182, 44050, 50462, 50474, 50488, 50514, 50565, 50640, 50663, 50677, 50705, 50731, 50739, 50743–50745, 50761, 50784, 50812, 50836, 50848, 50861, 50912, 50922, 50948, 50998, 51017, 51032, 51045, 51055, 51064, 51077, 51108, 51185 | 0 |
| `openPanel` | 13904, 13913, 28632, 32120, 44042, 44050, 44054, 51411, 62237 | 0 |
| `closePanel` | 13904, 28632, 32120, 44075, 44078, 48873–48874, 50413, 51203–51204 | 0 |
| `closeAllPanels` | 13938, 44049–44050, 44053, 44073, 44079, 51411 | 0 |
| `_fgCraft` | 50464, 50579 | 0 |
| `CRAFT_COST` | 50419, 51094, 51144, 51156, 51159, 51166–51167, 62477 | 0 |
| `REROLL_COST` | 50458, 50794, 50836 | 0 |
| `_mcShopUsed` | 31352, 40291, 40297 | 0 |
| `_mcFleeing` | 31352, 40286–40287, 42149–42150 | 0 |
| `_mcFleeDelay` | 40286, 40309 | 0 |
| `_mcPromptT` | 40293–40294 | 0 |
| `_greedCurse` | 32004, 33021, 42150, 43012 | 0 |
| `_altAtk` | 28005, 31567, 32848 | 0 |
| `_altDef` | 28019, 31567, 32848 | 0 |
| `_altSpd` | 27927, 31567, 32848 | 0 |
| `textIdx` | 25825 | 0 |
| `_chest3d` | 32859, 41837, 52597, 65315 | 0 |
| `chestOpened` | 32855, 32878, 32882, 32908, 32913, 32926, 32933 | 0 |
| `debTier` | 32887, 42751, 52547 | 0 |
| `_showHudAreaTitle` | 60241, 60317 | 0 |
| `_regionArrowTarget` | 60798, 60871 | 0 |
| `_drawRegionArrow` | 55427, 60867 | 0 |
| `_bossUnlocked` | 31569, 41869, 41875, 41881, 41886, 41904, 52005, 52040, 60213, 60800, 62280 | 0 |
| `stageCleared` | 16715, 30204, 30788, 31569, 41893, 41921, 43896, 60868, 62281, 62341, 63496 | 0 |
| `buildCh1FieldNpcRoster` | 0 | 0 |
| `getNpcInteraction` | 0 | 0 |

분모·문서 숫자는 Node/Godot 테스트 횟수와 합산하지 않는다. 검증 세부 결과와 최종 branch/SHA/정리 증거는 원로그의 DONE.txt·submission.json에서 확인한다.
