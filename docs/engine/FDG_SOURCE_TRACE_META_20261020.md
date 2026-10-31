# 메타·진행 원본 추적 및 Godot 이식 단위 — 2026-10-20

> 2026-10-21 소비 갱신: DEMO11-20이 실제 State addExp의 demo entry/loop cap100에 META-06을 연결하고 필요 XP는 META-01을 호출한다. 기본 demo=true는 임시 State 입력이며 DEMO11-01의 configure_native_demo_exp_mode 연결을 기다린다. 기존 회복 authority·HUD 읽기를 유지하고 native_level_up_handoff로 표시/강제저장 요청을 인계한다(실제 저장 IO·popup/VFX·예약큐 소비는 미연결). non-demo 초월의 기존 HOLD와 저장 형식은 변경하지 않는다. [정확 범위·회귀·접점](orders/reports/demo11-20_REPORT.md). 아래 초기 정책/소비 이력은 작성 당시 기준이다.

## 0. 결론·기준·조사 경계

**1번 구현 단위는 `_calcMaxExp` 순수 정책 분리와 기존 State의 Lv999→1000 필요 경험치 경계 정정이다.** 저레벨 경험치·SP/AP 획득·CP 표시는 이미 일부 이식돼 있으므로 새 기능으로 중복 계산하지 않는다. §8은 다음 구현자가 사용할 정확한 파일·계산·테스트 지시서다. 이번 변경은 이 추적 문서 1개뿐이며 코드·테스트·기존 설계 문서는 변경하지 않았다.

| 이름 | 원본의 실제 의미 | 원본 근거 |
|---|---|---|
| SP | `P.sp` 투자 포인트. 스탯·근성·스킬 습득/강화/합체에 사용 | `game.html:29018,3913–3924,47200–47282,51204–51274` |
| AP | `P.ap` 패시브 투자 포인트. SP와 별도 잔액 | `game.html:29018,43153,51269–51274`; `stat-panel-ui.js:4–23` |
| CP | `calcCP()`로 산출하는 **전투력**. 화폐·지갑·교환 재화가 아님 | `game.html:49487–49510,60325` |
| 악의오브 | 실제 공유 소비 재화 `G.mats`. 장비 경제·HP 추출·스킬 등에서 사용 | `game.html:28080–28091,28209–28234,48520–48536` |
| 영구 진행 | 확인된 것은 캐릭터 저장 진행과 공유 악의오브·창고. 뉴게임+·환전·환생 메타 계층의 실행 경로는 **미확인** | 저장/복원 `3533–3811`; `docs/3.2메타·진행시스템/3.2메타·진행시스템.md:3,20–25` |

작업 요청의 “화폐 SP/CP”와 개발 계획의 같은 표현을 그대로 데이터 모델로 옮기면 CP 지갑을 잘못 만들게 된다. 기존 화면의 SP/CP 표기는 보존하며 의미만 구분한다. `cp()`라는 이름은 망토 장비 accessor에도 쓰이므로 `calcCP()`와 구별한다.

| 항목 | 고정 기준 |
|---|---|
| 작업·브랜치·worktree | `trace-meta` / `codex/trace-meta-20261020` / `/Users/fordeargamers/exoduser-wt/trace-meta` |
| 원격 기준 SHA | fetch 후 `c7b21c63b25f7a8e25b9e0ec29e4fc7f21e8d91d`에서 worktree 생성. 아래 행 번호는 전부 이 SHA의 1-based 행 |
| `game.html` | 65,692행 / blob `e755a2d98211ac2a6b4a53d8a1e3e7abe4714400` |
| `index.html` | 4,742행 / blob `88b4940cd5870793e509942224532e06a4a80bdb` |
| 선행 문서 | `docs/engine/orders/WORK_BOARD.md` 67행, `docs/engine/FDG_GAME_DEVELOPMENT_PLAN.md` 현재 작업표·관련 이력, `docs/3.2메타·진행시스템/` 및 `docs/14밸런스+수치테이블/` |
| 조사 방법 | 고정 소스의 심벌·필드 검색→호출/쓰기/표시/저장 분기 추적→Godot 구현·테스트 본문 대조. 테스트 PASS나 실플레이 성공을 새로 주장하지 않음 |
| 이번 소유 파일 | `docs/engine/FDG_SOURCE_TRACE_META_20261020.md` **1개**. 사용자 최신 지시가 단일 파일 산출을 지정했으므로 WORK_BOARD와 별도 REPORT는 읽기만 하고 변경하지 않음 |
| 보호 | **`docs/2_3`·Q/E·세이브 형식: 보호.** 계약 변경안·serializer·마이그레이션 구현을 이 문서의 단위에 포함하지 않음 |

기준 체크아웃 R의 branch `codex/mac-live-play-time-main-20261017`, HEAD `dd49171c5b88e211575a41f185395d6c0a14b184` 및 tracked INDEX/WORK를 분리 확인했다. R에는 fetch·읽기·새 worktree 추가만 했고 브랜치 전환·커밋·파일 수정을 하지 않았다. 다른 담당의 worktree·런타임 로그·app_userdata는 조사 대상이 아니다.

## 1. 원본 데이터·영구성·저장 접점

### 1.1 런타임 데이터와 수명

| 데이터 | 구조·초기값·의미 | 원본 위치 | 유지·변경 주체 |
|---|---|---|---|
| `P.lv/exp/maxExp/sp/ap` | `1/0/15/0/0`. **신규 maxExp15와 curve(1)=17은 서로 다름** | `game.html:29016–29031` | `mkP` 신규 생성, `addExp` 성장, `dbRestore` 복원 |
| `STATS`, `STAT_MAX` | `{str,dex,int,vit,lck}:0`, 상한 각500. UI 정의는 STR/DEX/INT/LCK 4종이며 VIT는 레거시 저장 키 | `27690–27697` | 직접 투자·환불·로드. 레벨 자동 성장과 별도 |
| `PASSIVE_DEF/PASSIVES` | 26키, 일반 최대10, 초기0 | `27699–27728` | AP 투자·환불·예약 큐·복원 |
| `_grit` | 직접 근성0, 투자 상한 없음·1 SP/1. `_gritTotal`은 직접+레벨분+장비+어픽스 | `27893–27900` | 패널 투자, 구 비용 복원/환불 |
| `P._passiveQueue` | 유효 패시브 키의 순서 목록, 최대260개 | `51219–51233,51251–51260` | 예약/취소·레벨업 후 자동 투자. 저장 키 `passiveQueue` |
| `P._transLvDate/_transLvCount` | 로컬 날짜·그날 초월 레벨업 횟수 | `43122–43127,43154` | 날짜 변경 때 count0, 도달Lv>1000이면 count+1 |
| `P._apBossCleared/_goddessGift/_lvStatMigrated` | 레거시 저장 필드 | `3546,3612` | 전자는 복원 확인. 현재 신규 지급·마이그레이션 실행 소비는 검색상 **미확인** |
| `G.mats` | 악의오브 잔액. 보통 신규 `_loadSharedMats()||1000`, 일반 데모 신규1000 | `62126,62476,63956,64105` | 보상·수집·소비, 공유 저장 |
| `UPGRADES` | `{hp,atk,def,mp,st,spd}:0`, “이전 호환” 선언 | `28069–28070` | 저장·복원·초기화는 있음. `UPGRADES.*` 성장 효과 실행 소비는 **미확인** |
| `POT_LV` | `{hp:0}`, 일반 UI 최대10 | `28070–28071,50690–50705` | 물약 강화. TRACE-QUICKSLOT 접점 |
| `INV.equipped/bag` | 장비 `enh`, `rarity`, `tier`, `_enhRefund`, 유물/홈 | `16302–16344,28185–28201,3549–3551` | 장착·이전·분해·강화. TRACE-INVENTORY 접점 |
| `CRYSTAL_BAG/DUST`, `STONE_BAG` | 유물/소켓석 배열 최대9999, 먼지 초기0 | `15276–15334` | 제작·합성·강화·분해, 캐릭터 저장 |
| `G.hellCleared` | 챕터 클리어 bool 배열 | `41982–41987,3737` | 챕터 보스 **사망 직후가 아니라 출구 클리어 경로**에서 기록 |
| `G._taRecords/_clearRecords/comboMax/playTime` | 단계별 최단초, `{t,s,r}` 베스트, 최대콤보, 누적 플레이ticks | `32742,41923–41938,42020–42067,42717` | 클리어·전투·clock, 저장/복원 `3555,3731` |
| `calcCP()` 결과 | `{total,atk,def,extra}` 파생 객체 | `49487–49510` | 읽을 때 계산. 저장 CP 필드·CP 소비 실행은 **미확인** |

패시브 전체 키의 추적 위치는 다음과 같다. 모두 `max:10`, 실제 AP 단계 비용은 공통 `stat-panel-ui.js:4–23`이다. 개별 전투 효과를 새로 설계하지 않는다.

| 원본 행 | 키·한글명 | 원본 행 | 키·한글명 |
|---|---|---|---|
| 27700 | `pAtk` 맹공 | 27701 | `pCharge` 돌파 — **보호 접점** |
| 27702 | `pParry` 반격 — **Q/E 보호** | 27703 | `pMagic` 마력폭주 |
| 27704 | `pBow` 정밀사격 | 27705 | `pGuard` 수호신 — **보호 접점** |
| 27706 | `pRegen` 회복력 — **패링 보호 접점** | 27707 | `pCrit` 급소 |
| 27708 | `pDrop` 약탈 | 27709 | `pPierce` 관통 |
| 27710 | `pMRegen` 마력회복 | 27711 | `pXbow` 쇠뇌력 |
| 27712 | `pMelee` 광전사 | 27713 | `pCombo` 추적자 |
| 27715 | `pAbund` 풍요 | 27716 | `pPred` 약자포식 |
| 27717 | `pDot` 침식 | 27718 | `pVital` 마력그릇 |
| 27719 | `pStamina` 힘의그릇 | 27720 | `pMalice` 악의중독 |
| 27721 | `pFortify` 강인 | 27722 | `pArmor` 철벽 |
| 27723 | `pHunter` 사냥꾼 | 27724 | `pHuman` 인간성 — 부활 담당 접점 |
| 27725 | `pDemon` 악마성 — 부활 담당 접점 | 27726 | `pRage` 분노폭주 |

### 1.2 저장 필드 추적 — **형식 전체 보호**

다음은 기존 필드의 출처 목록이며 새 저장 스키마 제안이 아니다. `dbRestore`는 레벨로 SP/AP를 재계산하지 않는다.

| 저장 영역 | 메타·경제 필드 | 원본 근거·주의 |
|---|---|---|
| `player` | `lv,exp,maxExp,sp,ap,passiveQueue,transLvDate,transLvCount,apBossCleared,goddessGift,_lvStatMigrated` | 클라우드 `3543–3546`; 복원 `3610–3616`. `_lvStatMigrated`의 writer/실행 소비 범위는 비대칭·미확인 |
| `player` 파생 자원 | `baseAtk,baseDef,mpR,stR,hp,mhp,mp,mmp,st,mst,speed,shield,mshield,maskOn` | `3547–3549`. CP가 일부 자원 값을 읽음. 형식 보호 |
| 루트 성장 | `stats,passives,grit,gritCostModeV2,upgrades,potLv,skills,fused,skProf,fuseProfSec,cardProf,catProf` | `3552–3563`; 복원 `3684–3715,3753–3769` |
| 장비·재료 | `inv.bag/equipped/ossCollect,bagMax,crystalBag,crystalDust,stoneBag` | `3551,3556,3559`. 강화값은 아이템 데이터에 포함 |
| 진행 | `game.stage/kills/mats/irisSz/taRecords/clearRecords/comboMax/playTime/cutsceneDone`, 루트 `hellCleared` | `3555–3557,3731–3737` |
| 스킬 선택·슬롯 | `active*Sk,skillSlots,ultSlot,charIdx` | `3564–3574`. **Q/E·형식 보호**, 메타 단위에서 변경하지 않음 |
| 공유 키 | `hellcave_sharedMats`, `hellcave_sharedStorage` | `48520–48536`. 일반 캐릭터 저장의 `game.mats:0`, `storage:{}`와 함께 읽어야 함 |

| 저장/복원 분기 | 행·실제 경계 | 차이 |
|---|---|---|
| 클라우드 캐릭터 | `dbSave:3533–3585`, `dbLoad:3588–3594`, `dbRestore:3603–3811` | SP/AP/mats 정규화 `3501–3506`; 공유 악의오브·창고는 별도, 캐릭터 `game.mats=0` |
| 로컬 서버 | `63899–63940` | `/api/save`, 실패 시 `hellsave_<slot>`; 메타 필드 `63905–63918` |
| 독립 웹 | `64056–64092` | `hellsave_web`; 메타 필드 `64062–64075` |
| 일반 데모 | `62110–62160`, 복원 `62164–62175` | `hellsave_demo`; **game.mats에 실제 잔액 저장**. 일반 공유 저장과 임의 통합 금지 |
| Demo500 QA | `61993–62052` | `hellsave_demo500`; SP/AP·슬롯 위주 복원, 일반 분기와 다른 초기/보정. 공개 신규 상태로 사용 금지 |
| 초월 XP 구버전 복구 | `_restoreExpProgress:3597–3601` | 정상 저장 maxExp 유지. Lv1000+ 비정상 값만 원본 곡선으로 복구. **보호** |
| 구 근성·패시브 복구 | `3684–3715` | 삭제 패시브 AP 환급, 구 스킬 이관, `legacySpent=g*3+(g-1)*g/2`, SP 환급 `max(0,legacySpent-g)`. **보호** |
| 공유 악의오브 이관 | `3721–3737` | 옛 캐릭터 잔액과 공유 잔액은 **합산이 아니라 max**, 옛 `d.game.mats=0`. **보호** |
| 공유 창고·결정 복구 | `3738–3769` | 창고 최대200, 결정 품질/홈·upgrades/potLv 이관. **보호** |

`_loadSharedMats:48527`은 음수/비유한값 방어·안전 정수 상한을 두며 `_saveSharedMats:48529`는 `floor→0이상→Number.MAX_SAFE_INTEGER(9,007,199,254,740,991)`로 제한한다. 같은 값 저장/POST는 생략한다. 로컬 `/api/mats` POST/GET은 `48533/48536`, `_matsDirty:48535`는 3000ms 디바운스, 변경 감지는 `61927`이다. 이 저장 경계는 TRACE-SAVE에 전달할 **보호 의존**이다.

## 2. 경험치·레벨·투자 포인트

### 2.1 획득→성장→보상 순서

| 경로 | 원본 상수·공식·순서 | 원본 행 |
|---|---|---|
| 일반 처치 raw XP | `eLv=e.lv||10`; 보스 `max(30,floor(eLv*2))`, 기타 `max(5,floor(eLv*.4))`; 정예 `1+ELITE_TIERS[e.elite].dropBonus`와 콤보 배율 곱 후 절삭 | `43111–43114` |
| 콤보/난이도 배율 | `1+floor(G.combo/100)*.05+max(0,_diffSigned())*.10` | `43098–43101` |
| `addExp(v,false)` | `/3` 절삭→목걸이 `expBonus>0` 곱·절삭→어픽스 `expBonus>0` 곱·절삭→누적 | `43134–43145` |
| 초월 처치 | 현재 `P.lv>=1000`: 보스10/정예2/일반1, `addExp(v,true)`로 위 세 보정 전부 생략 | `43112–43114,43135–43144` |
| 별도 XP 1 | 벽끼임 구출 실패 일반몹 제거 `addExp(e.exp||1)`; 보스 무료 제거 아님 | `34427–34442` |
| 별도 XP 2 | 비공성 유령허수아비가 3000px 초과하면 자동 회수 `addExp(1000)` | `36011–36022`. 표시 `+1000 XP`와 실제 `/3` 결과는 별개 |
| 빌드 cap | `(EXODUSER_BUILD_TARGET||'demo')==='demo'`, 데모 cap100·최종stage0 | `16644–16648`. 외부 target과 실제 실행판은 **미확인** |
| 날짜/일일 gate | 로컬 OS 날짜 `YYYY-MM-DD`; 날짜 변경 시 count0, count<1. 함수 입구와 while 안에 demo/일일 gate, 넘치면 exp를 `maxExp-1`로 clamp | `43122–43127,43137–43149` |
| 레벨 증가 | lv+1→기존 maxExp 차감→새 maxExp 계산→SP+3→도달 레벨 짝수면 AP+1→도달Lv>1000일 때 count+1 | `43145–43155` |
| 레벨업 후처리 | 예약패시브 자동 투자→다중 레벨업 전체에서 한 번 HP/ST/MP 각 최대치20% 절삭 회복→SFX/팝업/VFX→해금→강제저장 | `43156–43171` |
| 자동 해금 | Lv300 `blueShot`, Lv700 `burstLoop/voidScarecrow` | `43168–43170`; 로드시 `3808–3811`은 blueShot/burstLoop 보충이며 경로가 완전히 같지 않음 |
| 레벨 외 SP | 보스 사망 후 아레나 출구를 밟아 stage clear가 될 때 SP+10 | `41919–41922` |
| 사망 XP | 사망창은 30% 손실을 **표시**. 실제 차감은 retry 클릭에서 `exp=max(0,exp-~~(exp*.3))` | `43867–43894` vs `63471–63477` |
| retry 유지 | 기존 단계 재초기화·전투자원 복원·applyStats·저장. SP/AP/mats/장비 강화 전체 초기화가 아님 | `63471–63530` |

`addExp` 자체가 매 레벨마다 무조건 `applyStats()`를 호출하는 것은 아니다. 예약패시브 실제 투자 시 `51232`가 호출한다. 포트할 때 “레벨업이니 전체 재계산 추가” 같은 임의 수정을 하지 않는다.

### 2.2 필요 경험치와 경계 정적 기대값

```text
lv < 1000: ~~((15 + lv*2.5 + lv*lv*.05) * 1.001^lv)
lv >=1000: floor(5,000,000 + (lv-999)^2 * 10,000)
```

원본 `43128–43132`. 아래는 원본 식의 **정적 계산**이며 이번 작업에서 게임·Godot 테스트를 실행한 결과가 아니다.

| lv | 필요 XP | lv | 필요 XP |
|---:|---:|---:|---:|
| 1 | 17 (**신규 maxExp15와 별개**) | 2 | 20 |
| 3 | 23 | 5 | 28 |
| 10 | 45 | 50 | 278 |
| 99 | 830 | 100 | 845 |
| 500 | 22,688 | 998 | 141,839 |
| 999 | 142,258 | 1000 | **5,010,000** |
| 1001 | 5,040,000 | 1002 | 5,090,000 |
| 1461 | 2,139,440,000 | 1462 | **2,148,690,000** |
| 1500 | **2,515,010,000** | — | — |

1000 이상에 일반식을 계속 쓰면 1000=142,679, 1001=143,100, 1002=143,523이 되어 잘못된다. 초월 분기에 32비트 `~~`를 적용해서도 안 된다. 웹 `test/balanceExpCurve.test.js:33–40`은 **game.html·game-easy-test.html**의 1000/1461/1462/1500·JSON 왕복을 검사한다. `index.html`에 같은 곡선이 있다는 뜻이 아니다. `:43–56` 저장 복구 검사는 **세이브 보호** 근거이며 이번 단위에서 수정하지 않는다.

### 2.3 투자·환불·자동 성장

| 계약 | 수치·규칙 | 원본 행 |
|---|---|---|
| 스탯 SP | 직접 STR/DEX/INT/LCK 각500 상한, 1 SP/1. 레거시 VIT도 저장/전체 환불에 포함 | `27690–27697`, `stat-panel-ui.js:6–9,16–23` |
| 근성 | 1 SP/1, 무한. 총량=`직접+floor(lv*.5)+장비Grit+gritFlatN/R`; HP/MP/ST 각각+1, 방어 기여는 총량*.5 절삭 | `27893–27900,43508–43512` |
| 패시브 AP | 구매 전 rank0..9 비용 `[1,1,1,2,2,2,3,3,3,5]`, 초과 rank 폴백5. Lv10 총23 AP | `stat-panel-ui.js:4–23` |
| 패널 계획 적용 | 기준 allocations가 현재와 같은지·safe integer·키/상한/잔액 검사. 환불총액 차로 새 SP/AP 산출. 확인 뒤 최신값으로 전체 환불 재산출 | `stat-panel-ui.js:256–274`; `game.html:51204–51215,51235–51274` |
| 예약 패시브 | 유효 key만 최대260. 선두가 max면 제거, 비용 부족이면 중단(뒤를 건너뛰지 않음), AP 차감→rank+1→선두 제거 | `51219–51233` |
| 스킬 강화 SP | 현재 `_skillUpSpCost`의 테이블은 **전부1**, nextLv를1..10으로 clamp 후 폴백1. 옛 주석의 단계 비용과 구분 | `3911–3916` |
| 합체 강화 SP | base1 + (성급−1), gemCnt 기본2. curLv>=9이면 성급>=4 비용8, >=2 비용6 | `3918–3924` |
| 스킬 경제·해금 데이터 | `SKILL_LIST`의 `spCost/matCost/upMat/up/req` 등, 일반 강화 한도20·캐릭터 한도 `min(20,floor(P.lv/50)+1)` | `44161` 이하 registry, `44324` 합체 그룹, `44453` 쌍, `_skCtx:47678` |
| 소비/환불 진입 | 일괄 강화·자동 습득/합체·흡수 레벨 환불, 수동 학습/강화/리셋 | `47192–47282,47748–47948,48267–48290`. Q/E 기본 합체는 **보호**, 전체 스킬 효과 재설계는 제외 |
| 유효 스탯 | STR/DEX/INT=직접+장비+`floor(lv*.5)`+해당 flat어픽스 절삭; VIT=`~~vitFlat`; LCK 자동/장비/어픽스는 `_eqLckTotal` | `27902–27908,27996–27999` |
| 레벨 공격 기여 | melee/bow/magicRef에 해당 직접·장비 STR/DEX/INT 및 `_lvB=floor(lv*.5)`를 1:1 더함. 강화는 flat | `28767–28772` |
| 자원/회복 | HP식 STR×5+VIT×3, MP INT×2, HP regen `.05+STR*.002+lifeRegen/60`, ST/MP regen `.05+DEX/INT*.005`, 기본 speed `2.6+DEX*.005` | `27911–27932` |
| ST 예외 | `recalcSt`는 raw `STATS.dex*2` 사용. 유효 DEX 전체를 여기 대입하면 원본과 달라짐. 근성의 레벨분은 별도 합산 | `16425–16431` |
| 성장의 외부 소비 | 적 레벨 하한 `max(1,P.lv+offsets)`; 레벨 부활력 `min(100,floor(P.lv*.03))` | `31125–31130`; `43741–43747` **부활 담당/보호 접점** |

## 3. 악의오브 수입·소비·강화 경제

### 3.1 공유 비용·강화·분해의 순수 규칙

| 함수·상수 | 현재 원본 값 | 행 |
|---|---|---|
| `_MALICE_COST_MUL/_malCost(v)` | `Number(v)||0`, 0이하면0, 양수면 `max(1,ceil(v*.5))` | `28080–28085` |
| `enhRate(n)` | `max(.5,99*.99^n)` **퍼센트**. `enhCost.rate`는 이를100으로 나눈 비율 | `28077–28091` |
| `enhCostRaw(n)` | `max(20000,ceil((20000+3500*n)*1.5))` | `28086–28088` |
| `_itemEconomyRarity(r)` | 비음수 정수면 `min(r,4)`, 그 외0. 유니크5도 경제등급4 | `28185–28186` |
| `enhCost(n,r)` | 배율 `[.5,.7,1,1.3,1.8]`; `cost=_malCost(ceil(raw*배율))` | `28089–28091` |
| `enhMul/enhMulAtk` | 모두 `n*.25`, 복리가 아닌 **선형 flat** | `28093–28099` |
| `xferCost(n)` | `_malCost(ceil(n*1000))`; 유효 정수 n의 실제 비용500n | `28101–28104` |
| `salvageVal(it)` 기본 | `[1000,2000,10000,20000,50000][경제등급]+enhRefund+(tier||0)*2` | `28187–28201` |
| 분해 강화 환급 | `sum(i=0..enh-1) ceil(max(1,ceil((1+i*.15)*1.5))*등급배율)`의 50%를 **JS `~~`**. `_enhRefund>0`이면 이 값과 max | `28189–28200`. **현행 강화 지출의 50%가 아님** |
| 색상 표시 | enh 10/25/50/75/100/200/500/1000 경계, 확률색 .7/.4/.1 경계 | `28105–28120`. 계산 결과와 UI 표시를 분리 |

기초 비용 예: +0의 raw30,000, 실제 등급별 `[7,500,10,500,15,000,19,500,27,000]`, 유니크도27,000. +100 raw555,000, +1000 raw5,280,000. n=831 성공률은 하한 때문에 **0.5%**다. 할인·등급배율·ceil 순서를 바꾸지 않는다.

| 실행·UI | 원본 상태 변화·조건 | 원본 행 |
|---|---|---|
| 수동 강화 | 17장착칸, `isMax=false`. 클릭 시 현재 견적/잔액 재검사→성패 무관 비용 차감→성공만 enh+1. 실패 파괴·단계 하락 없음 | `50582–50645` |
| AI 강화 | 아이템 없음/이미 목표/비양수 budget/잔액<budget 거부. 예산 내 각 시도에서 차감 후 성공판정 RNG1회, 성공만 n++. 종료 시 mats−used/item.enh=n | `28123–28138` |
| AI UI·후처리 | 기대예산 `ceil(sum(cost/rate))`를 보유 악의오브로 제한. target 기본 현재+100, 입력 UI max9999. applyStats/renderForge, used>0일 때 저장 | `28139–28184,50646–50687`. UI max는 알고리즘 강화 상한이 아님 |
| 장착 강화 이전 | old.enh>0이면 이전 비용을 내야 교체. new.enh=old.enh (**max 아님**), old._enhRefund 기록, old.enh=0 | `16302–16318`; 유물 이전 `16320–16344` 별도 |
| 공격 강화 소비 | weapon/bow/helmet의 ATK 참조에 enh*.25 flat | `28770–28772` |
| 방어·자원 강화 소비 | DEF/eDef는 shield/armor/cape 합강*.25 절삭, HP는 gloves/pants/boots 강당1, MP는 bracelet/necklace/headband/headband2/ossuary 강당.2, ST는 ring1/ring2/belt 강당.2 | `43508–43512,27916–27931,16429–16431` |
| 인벤 분해 | 단품은 1000ms 재진입 제한·fav 차단·유한/비음수 확인→악의오브 가산→가방 삭제→저장. 일괄은 확인 후 현물 재검사, fav/장착 제외 | `16381–16396,50359–50407`; 대장간 `50709–50786` |
| 펫 분해 | 필터 이하/가방 가득 찬 비전설은 salvage, 최소1. rarity>=4는 바닥 보존 | `41445–41464` |
| 유물 강화 | 효과 `base*starMul*(1+enh*.1)*(.75+.5*q/100)`, starMul `[1,2,3.5,6,10]`, costMul `[1,1.5,2.5,4,7]`; 비용 `_malCost(ceil(500*(1+enh*.5)*costMul))` | `15276–15300` |
| 유물 합성·소비 | 같은 id/star 재료1+악의오브로 강화(enh<20), 3개 합성→성급+1/enh0/q평균. 수동·일괄 별도 | `15347–15379,50869–51021` |
| 유물 분해·제작 | dust 비용 `[50,200,500,1500,5000]`; 분해는 해당 성급 비용50% 절삭(강화/q 환급 없음). 악의오브25로 HP/MP/ST 1성 제작 | `15380,51024–51077` |
| 소켓 공명 | q1..40 bronze/41..80 silver/81..100 gold **3등급 일치**. 과거10티어 설명과 구분 | `15308–15325` |

### 3.2 악의·SP 수입/소비 진입 전수 분류

단일 지갑 함수만 검색하면 직접 `G.mats +=/-=` 경로가 빠진다. 아래 직접 쓰기·공급자·소비자를 함께 추적했다. 전체 정적 참조 행은 §10의 census로 남긴다.

| 분류 | 경로·실제 값 | 원본 행 |
|---|---|---|
| 처치 공통 | 모든 처치 기본 악의오브+4. 콤보/난이도 보너스는 별도 | `43098–43113` |
| 정예·보스 | `floor((12+stage*3)*12*(1+elite.dropBonus)*(1+goldBonus)*_maliceMul)` 및 `floor((2+floor(rand*2))*10*comboBonus*2)` 추가 | `43076–43108`; `_maliceMul=1+pMalice*.08` at `27888` |
| 레어·도난 반환 | 91:50+floor(stage*3), 93:30+floor(stage*2), 96:훔친 금액×2, 99:200+floor(stage*5) | `42977–42990,43008–43012,43032–43038` |
| 슬라임 | 실제 `floor32(matDrop*2)` 반환. “30%” 주석과 구분 | `43066–43068` |
| 물약 획득/사용 | `addPotion('hp',count)`는 mats+=count, MP/ST 타입 버림. HP 사용은 mats−1·HP99% 이상 거부 | `28250–28259,28209–28234`; 자동 `35895–35905` |
| 상자·오브젝트·잔해 | 오브젝트1..3, 상자 기본5+floor(stage*2)+HP물약2, 잔해 `[3,8,15]+floor(stage*[.5,1,2])` | `32837–32904` |
| 바닥 수집 | `matVal*(1+goldBonus)*_maliceMul` 절삭, 플레이어/펫 경로 | `32950,32975,41463` |
| 패링 보상 | **Q/E 보호 접점** | `38542–38543` — 계약·분류·배율 변경안 제외 |
| 자동 석궁 | 악의오브1/발 | `28675–28689` |
| 기술 소비 | chainBlast `_malCost(20)`, boneStorm 직접12 감산(max0); 다른 개별 스킬은 `_malCost` 호출부 | `32574–32575,36425,45109,45170,45278,45316,45512,46167,46454`. **Q/E 소비는 보호** |
| 상인·도난 | 상인 `_malCost(100+floor(stage*5))`, 영웅70%/전설30%; 탐욕사도 접촉 `max(1,floor(mats*.1))`, cd120 | `40295–40306,40358–40368` |
| 가방 확장 | `_malCost(floor(BAG_MAX/6))`, +6칸 | `50236–50245` — TRACE-INVENTORY 접점 |
| 장비 제작·리롤 | 제작 `_malCost(200000)=100000`, 영웅90%/전설10%, Shift/Ctrl10개; 리롤 `_malCost(200)=100` | `50419,50458,50836,51162–51184` |
| 물약 강화 | HP만·최대10, 비용 `_malCost((lv+1)*5)`, 필요 캐릭터Lv `(lv+1)*100`; heal0강100/1강150/2강이상lv*100 | `50690–50705,28070–28071` — TRACE-QUICKSLOT 접점 |
| 스킬·합체·포인트 | `spCost/matCost`, 업그레이드 `_skillUpSpCost`와 `_malCost(upMat||0)`, 합체 성급·흡수 단계 환불 | `3913–3929,47200–47282,47748–47948,48267–48290` |
| 초기화·복원 | 신규/로드/QA 및 legacy SP·mats 이관은 §1.2, 다음 표 | 저장 형식 **보호** |

| 초기화 분기 | 캐릭터 성장·악의 | 원본 행 |
|---|---|---|
| 공개 일반 데모 신규 | Lv1/SP0/AP0/mats1000 | `62110–62126` |
| 클라우드/로컬/웹 신규 | mkP 초기값, mats=`_loadSharedMats()||1000`(0잔액도1000 폴백) | `62465–62481,63944–63956,64094–64112` |
| DemoTest/개발 캐릭터 | 일반 상태가 아닌 고레벨·대량 재화. `_startDemoTest`의 실제 G.mats 선언999999와 별도 후속 초기화/저장 분기를 일반 신규값에 혼합하지 않음 | `61935–61955,62022–62052`; `_startTestChar:62350–62409` |
| FORGE_LAB | Lv1000/SP99999/AP200/mats99999999, save no-op | `62217–62238` |
| 전체 진행 초기화 버튼 | 현재 캐릭터 저장 DELETE/DB data{} 또는 hellsave_web 삭제 후 로비. 공유 악의오브·창고 삭제 경로는 확인되지 않음 | `49449–49464` — 파괴 버튼 실행 안 함 |

## 4. CP·HUD·로비 UI

### 4.1 CP 공식 — 파생 표시이며 소비 재화가 아님

`game.html:49487–49509`는 atk/def/extra를 합산한 뒤 **각 소계와 total에 JS `~~`**를 적용한다. itemPower 정렬 점수(`16434–16487`)와 다른 식이다.

| 항 | 계수·입력 |
|---|---|
| 기본 atk/def | `P.baseAtk*2*statStr()`, `(P.baseDef+pDefAdd())*3` |
| 성장 extra | `P.lv*10+P.mhp*.5+P.mst*.3+P.mmp*.3+(STR+DEX+INT+LCK 직접투자합)*2+패시브rank합*15` |
| 장비 atk/def | 장착 각 it.atk×2, it.def×3 |
| 속도/근접/활 | spd40, wStagger1.5, wRange.4, bowRange.3, bowSpd30 |
| 사슬/제어 | charge1, chargeDist.5, bonusChargeDist5, chargeW1, chargeAoE1.5, stagger1.5 — **전투·Q/E 소비 계약 보호**, CP 읽기만 추적 |
| 자원/회복 | bonusSt1.5, stRegen200, mpRegen500 |
| 기타 | splashR1, splashMul80, magicPen30, bonusRange8, 각 elements[].dmg*.8 |

강화·어픽스·유물의 직접 합산 항을 여기에 임의 추가하지 않는다. 그중 파생 HP/MP/ST/baseAtk/DEF로 이미 반영되는 간접 효과와 `itemPower`의 직접 crystal 항은 구분한다.

### 4.2 화면·입장·결과의 접점

| 화면·함수 | 내용·수치 | 원본 행 |
|---|---|---|
| 성장 HUD DOM | `lvLbl/expTxt/expF/spCnt/cpHud`, 별도 악의 `matCnt` | `2575–2580,2666–2669` |
| HUD 갱신 | XP너비=exp/maxExp, Lv1000+ 보라색, 레벨은 숫자 그대로. `spCnt`는 `✦ SP` 뒤 AP가 있으면 `+AP`를 덧붙임. `cpHud`는 calcCP.total | `60310–60312,60318–60325`. 합계 지갑으로 바꾸지 않음 |
| 인벤·비교 | CP 소계·현재 전투력·비교 표시 | `49675–49686,49914,50157–50168` |
| 대장간 | 탭 `upgrade/potion/salvage/reroll/crystal/craft`, 현재 악의·강화 견적/성패/AI 결과 | `50518,50549,50582–50687`. 현행 repair 탭 없음 |
| 성장 패널 | SP/AP·능력치·패시브·환불·예약 UI, 요약의 직접/장비/레벨 성분 | `3035–3076,51204–51279,51327–51336,51407`. 외부 UI import `2567`→`stat-panel-ui.js` |
| 빌드 안내 | default demo. full “No Level Cap”, ea Lv500/CH1, demo Lv100/stage0 안내 | `index.html:1257–1271`. **안내 문자열이 실제 cap 구현의 증거는 아님** |
| 온라인 목록 | DB characters 로드, `ch.data.player.lv`/game.stage 표시, 최대5 캐릭터 | `index.html:3026–3042,3143–3149,3181–3185` |
| 로컬 목록 | `/api/slots` 또는 demo 브라우저 폴백, `(d.player&&d.player.lv)||1` 추출·표시 | `index.html:3522–3550,3582–3590` |
| 신규 캐릭터 | name/ts/charIdx 메타만. P 성장 상태 생성은 game 신규시작 경로 | `index.html:2921–2936,3436–3461` |
| 데모 슬롯 인계 | `hellsave_demo_0..4`, active key, runtime `hellsave_demo` 교체. 로비 복귀 시 진행+name/ts/charIdx 병합. 신규/초기화면 메타만 남음 | `index.html:3485–3519` — **저장 보호** |
| 선택·입장 | `_selectSlot/_updateCharDisplay`, `showCharGate`가 build/slot/char query 결정 후 game으로 이동 | `index.html:3648–3685,4339–4350` |
| 스테이지 클리어 | 출구 SP+10, 처치율90% 이상이면 stageTime/60 최단초 기록, 챕터 해금·다음 단계 | `game.html:41919–42003` |
| 클리어 점수·랭크 | parSec=round(90+total*2.5), parScore=total*10+3500. 점수=max0(처치*10+지역*500+보스1000+양수시간차*10+무사망500+무피격500+최대콤보*5−사망*300) | `42024–42036` |
| 랭크·최고기록 | 시간비<=.7/1/1.5이면3/2/1점, score>=par/par*.6이면2/1점, 무사망1. 합6/4/3/2부터S/A/B/C, 나머지D. `{t,s,r}`는 각각 최소시간/최대점수/높은랭크 병합 | `42038–42052,42056–42067` |

`index.html`에는 `P.sp/P.ap/G.mats/calcCP/addExp/_calcMaxExp` 실행 심벌 매칭이 없다. 로비는 저장된 진행을 읽고 슬롯을 넘기는 소비자다. 별도 메타 경제를 로비에 새로 가정하지 않는다.

## 5. docs 대 원본 불일치·누락 표

이번에는 **표로만 보고**하며 기존 문서는 고치지 않는다. 경로 약어 `B`=`docs/14밸런스+수치테이블/14밸런스+수치테이블.md`, `M`=`docs/3.2메타·진행시스템/3.2메타·진행시스템.md`, `Q`=`docs/14밸런스+수치테이블/보석품질_소켓석_수치표.md`.

| 분류 | 문서·행 | 문서값/표현 | 원본 근거·현재 값 | 인계 |
|---|---|---|---|---|
| 수치 불일치 | B:168 | 초월 SP+3 외 5렙SP+2·10렙AP+2 | `43150–43154`: 매렙SP+3·짝수AP+1. 별도5/10배수 보상 없음 | 실행식 유지. B:129–130과 문서 내부도 충돌 |
| 표시 불일치 | B:169 | `⚡ T.{lv}` | `60325` 숫자 Lv, `60311–60312` XP 색만 보라 | 새 HUD 표기를 만들어 맞추지 않음 |
| 수치 불일치 | B:38 | HP에 STR×1 | `27920` STR×5+VIT×3. B:10은STR+5 | 문서 정정 후보 |
| 축약 누락 | B:33–35 | 투자+장비+레벨절반 | `27907` 각 flat어픽스 절삭 추가 | 실제 유효스탯식 사용 |
| 축약 누락 | B:26 | 크리확률 직접 STATS.lck×.025 | `27996–27997` 레벨/장비/LCK 어픽스를 포함한 `_eqLckTotal` | 직접투자만으로 축소 금지 |
| 수치/슬롯 불일치 | B:108 | 13칸 DEF/eDef 강화 .25, HP .5/강 | `43508–43512` DEF는3칸, `27916–27920` HP는3칸×1 | 문서 과거값/현행 분리 후보 |
| 수치/슬롯 불일치 | B:109 | 방어구6칸 ST .1/강 | `16429–16431` ring1/ring2/belt 3칸×.2 | B:270은 현행과 일치 |
| 공격식 불일치 | B:248–250 | atk×(1+강화배율)+flat+base | `28770–28772` atk+enh*.25+flat+base+직접/장비/레벨stat 후 봉인 | 강화 flat를 배율로 변경 금지 |
| 하한 불일치 | B:103 | +831 성공확률 .023% 예시 | `28077–28078` 하한으로 실제 .5% | 현행 확률식 보존 |
| 구현 미확인 | B:252–255 | DUR_MAX·파손50%·수리탭 | game/index `DUR_MAX/durability/repair` 장비 실행 정의 미확인, `50549` repair 탭 없음 | 신규 내구·수리 구현으로 확장하지 않음 |
| 축약 누락 | B:185 | monLv=P.lv+offsets | `31126` 하한 max1 | 적 레벨 정책 변경 아님 |
| 초기 예외 누락 | B:123 | 일반/초월 곡선 | 식은 일치하나 `29018` 신규maxExp15 vs curve(1)17 예외 없음 | 초기값 보존 명시 |
| 공명 설명 모순 | Q:37,46 | 10티어 일치, q91홈/T2유물 비공명 | `15308–15325` 3등급 일치. q91과q81..90 모두gold, ×2.818 | Q:8–18 현행과도 모순 |
| 함수 설명 불일치 | Q:51 | calcCP에 유물파워 직접 합산 | `49487–49510` 직접항 없음. 직접합산은 `itemPower:16485–16486` | 정렬지수·CP 분리 |
| 실행 범위 표현 | M:18, `BALANCE_ECONOMY_TEAM_MASTER.md:19–20` | index/game 데모 “고정” | `16646`, `index:1258` 외부 target 또는 default demo. 실행제품 target 미확인 | 기본값·패키지 주입·실행 검증 구분 |
| 명명 혼동 | `FDG_GAME_DEVELOPMENT_PLAN.md:71` | 화폐 “SP/CP” | `49487–49510` CP 전투력, `60325` SP/AP와 나란히 표시 | CP 지갑 생성 금지 |
| 설계 미완/예정 | M:3,20–25 | 전체 메타 설계 미작성·뉴게임+ 등 예정 | 기존 캐릭터/공유 저장과 경제 실행은 별도로 존재 | 예정=기존 시스템 전부 미구현으로 해석 금지 |
| 측정 공백 | `BALANCE_WORKBOOK.md:25–28` | 실제 성장 빌드·고레벨 미측정 | 이번도 정적 추적이며 새 런타임 자료 없음 | 설계 문서의 미측정을 PASS로 덮지 않음 |
| 현재 일치 | M:9–14, B:94–102,123–130,154–158,290–294 | XP/보상·악의할인·강화확률·legacy 환급 | §2·3의 실행식과 일치하는 범위 | 불일치 건수로 세지 않음 |

원본 내부의 오래된 주석·표시도 문서 불일치와 별도로 보존한다.

| 원본 위치 | 주석/표시 | 실제 실행부 | 판단 |
|---|---|---|---|
| `27689,27698` | stat max200, AP5레벨당1 | `27697` cap500, `43153` 짝수AP1 | 주석이 오래됨 |
| `3911–3912` | 스킬 강화 단계SP 비용 | `3913–3916` 현재 일반 강화는 모두1 | 실제 테이블 우선 |
| `28075–28076` | 강화 보너스 복리 | `28093–28099` 선형 n*.25 | 복리 구현 금지 |
| `28102–28103` | 이전100강=10만악의 | `_malCost` 적용 실제5만 | 할인 전 주석과 구분 |
| `50608–50621` | Forge ATK 강화량을% 표시 | `28770–28772` flat 가산 | UI 표시 불일치 후보, 밸런스 수정으로 해결 금지 |
| `49758–49759` | tooltip ATK는flat, DPS는곱셈 | 실전 참조식은flat | 원본 내부 표시 혼재, 별도 UI 검토 |
| `43066–43067` | 슬라임 악의오브30% 회수 | 실제 matDrop×2 | 주석/계산 불일치, 부활 담당 경계 |

## 6. Godot 실제 이식 의존·미이식 경계

아래 “fixture”는 **현재 테스트 파일의 단정 범위**다. 이번 조사에서 Godot import·테스트·실게임 실행은 하지 않았다. 기존 계획의 통과 수치를 이번 실행 결과처럼 재사용하지 않는다. 파일 앞의 `godot/`는 실제 저장소 경로이며 `res://`는 그 하위 기준이다.

| 기능 | 실제 파일·호출 배선 | 기존 테스트·범위 | 남은 경계 |
|---|---|---|---|
| 처치 보상 P2-001c | `godot/scripts/native_normal_enemy_hurte.gd:523,532,667–690,735–748`→`native_source_new_run_state.gd:476–525` | `godot/tests/test_p2001c_kill_rewards.gd:145–282`, Main의 위치·HP·공격 스킬을 직접 조작한 fixture | 현행 XP 계산은 일반/elite0 부분 경로. 원본의 보스·정예 배율/초월XP 전체를 이식 완료로 볼 수 없음 |
| XP 전처리 | hurtE `:735–747`이 /3→목걸이→어픽스를 적용한 **final_value**를 State에 전달 | `test_p2001c_kill_rewards.gd:181–282` | State API에 rawXP를 넘기고 또 /3 적용하는 중복 포트 금지 |
| 레벨 증가·곡선 | State `:491–525`; `:505–506`에 일반식 inline, `:507–510` SP/AP | 위 테스트 `:162–176`: 신규Lv1/0/15에 final20→Lv2/exp5/max20/SP3/AP1 | **999→1000의 maxExp가 일반식142679 vs 원본5010000**. 기존 테스트에 이 경계 단정 미확인 |
| 초월 미이식 가드 | State `:494` EXP 가산 후 `:497` while 진입, `:499–500`에서 lv>=1000이면 미이식 거부 | 관련 경계 전용 테스트 미확인 | **함수 입구의 무조건 거부가 아님**. 임계 미만 EXP는 누적 가능, 임계 도달 거부 때도 이미 EXP는 써진다. §8에서 이 순서 보존 |
| 레벨업 자원·해금 | State `:513`→`godot/scripts/native_source_resource_authority.gd:169–180`; `:520–522` 300/700 키 | p2001c `:175–176` HP20% 회복 | 전체 자원·300/700 각 경계 검수, 날짜/예약큐/연출/저장은 별도 |
| 악의오브 | State `:147–149` 신규1000, `:447–454` 비용 차감, `:476–485` hp물약 악의오브 변환. `native_skill_slots.gd:247,325` 소비 호출 | p2001c `:153–161,255–258`, `test_p2001e_natural_lmb.gd:114` | 공유 악의오브 저장·서버 동기화 미이식. native 초기1000을 계정 잔액 로드와 동일시 금지 |
| 악의·성장 HUD | `godot/scripts/hud.gd:832–833,1139–1149` 현재 State 값 표시 | `godot/tests/test_p2002a_hud.gd:93`, `test_p2002b_minimap_corner.gd:153–178` | 표시·획득과 투자/소비 UI는 별개 |
| CP P2-002b | `hud.gd:1089–1121` 원본식→`:1148–1149` 표시 | `test_p2002b_minimap_corner.gd:153–178`, 독립 재계산·레벨업 후 표시 | 기존 파생 계산 있음. CP 지갑·신규 CP 재화 모듈 불필요 |
| 근성 계획·환불 | `godot/port_modules/save_adapter/raw_grit_restore.gd:5,44–92` initialize/restore/apply_plan/refund_all | `test_native_main_source_starter_state.gd:129,172`의 **간접 의존** | 반환 `main_connected:false`, 해당 투자 writer의 실제 caller 검색상 없음. helper 존재≠성장패널 연결 |
| 강화값 공격 소비 | `godot/port_modules/combat_reference_source/producer.gd:419–427,501,504`; `main.gd:1485–1509` | starter_state `:129` 간접 provider 소비 | 기존 enh×.25 읽기만으로 강화 시도 경제 완료 아님 |
| 유물 자원 효과 | `godot/port_modules/player_crystal_resource_source/producer.gd:233–309` | `test_native_main_source_player_initialization.gd:109` shared_crystal_current_values | 생성·강화·합성·분해·결제와 별개 |
| 신규 부팅의 외부 경제 단계 | `godot/port_modules/native_new_run_bootstrap_source/producer.gd:29–31,83,143–167,253,484` | starter_state `:65` 간접 부팅/아이템 경로 | 외부 handler 계약을 실제 물약 강화/메타 저장 실행자로 해석 금지 |
| 강화·이전·분해 경제 | 원본 `enhRate/enhCostRaw/enhCost/xferCost/aiEnhance/salvageVal` 대응 실행자명·경제 경로를 Godot에서 검색 | 강화 시도 경제 전용 기존 테스트 미확인 | **미이식**: 견적·paid RNG·실패 차감·이전·legacy 환급·대장간 UI |
| 영구 진행·로비 | `godot/scripts/main.gd:137–157` 신규 State 생성/초기화 | 현재 시작 상태 fixture | 웹 캐릭터/계정 저장·뉴게임+ 전체 완료 근거 없음. 저장 형식은 **보호 의존** |
| 레벨업 연출·예약·저장 | State `:525` unported 목록 | p2001c 결과에도 unported 노출 | SFX.levelup/showPH/VFX/dbSaveForce/passive_queue는 별도 미이식 |

개발 계획의 ID는 오기가 아니다. `FDG_GAME_DEVELOPMENT_PLAN.md:61`=**P2-001c 처치 보상**, `:70`=P2-002a HUD, `:71`=**P2-002b 미니맵·SP/AP·CP 코너**다. `P2-001b`는 사망 연출(`:60`)이다. 계획 상단 `:3,15`의 C/D/E 진행 표현과 하단 `:52–55,61,70–71`의 통합 기록이 낡게 공존하므로, 코드·현재 작업표를 대조해 판정했다. P4-001(`:83`)의 전체 흐름 인수 HOLD를 부분 P2 구현 완료와 혼동하지 않는다.

## 7. 작은 이식 단위 순서안

아래 `META-01…12`는 **이 문서의 제안 식별자**이며 공식 작업판 배정 ID가 아니다. 성공판정 RNG 횟수는 순수 정책/거래 범위의 횟수이며, 원본 UI·VFX의 추가 Math.random 소비까지 1회라고 주장하지 않는다. 이번에 코드를 만들거나 다음 단위를 자동 착수하지 않는다. “예정 파일”은 새 파일명 제안이지 이미 존재한다는 주장이 아니다. 각 테스트는 제안 단계이며 원본/기존 테스트 기대값을 약화하지 않는다. 공용 파일을 쓰는 후속 구현은 시작 시 최신 작업판의 정확 함수 소유를 다시 확인한다.

| 순서 | 작은 산출물·예정 생성/수정 파일 | 원본 행·옮길 공식/상수 | 새 테스트 파일·핵심 단정·격리 이름 | 선행·충돌·인수 한계 |
|---|---|---|---|---|
| **1 / META-01** | **XP 곡선 정책 분리·999→1000 경계 정정**. 생성 `godot/scripts/native_source_meta_exp_curve.gd`, `godot/tests/test_source_meta_exp_curve.gd`; 수정 State의 maxExp 계산 한 곳·해당 preload | `43128–43132`, `43150–43151`; §8 그대로 | `test_source_meta_exp_curve.gd`: 순수 경계값·64bit·신규15 유지·State 단일/다중레벨 경계·초월 미이식 가드 보존. `EXODUSER-TraceMeta-Curve-Isolated-20261020` | 기존 하위 곡선의 중복 기능 추가 아님. State 공용 접점만 조정. 저장·Q/E·초월 실행 확장 없음 |
| 2 / META-02 | **강화 견적 순수 규칙** 생성 `godot/scripts/native_meta_enhancement_policy.gd`, `godot/tests/test_meta_enhancement_policy.gd`; 공용 수정 없음 | `28077–28104,28185–28186`; 할인.5/ceil순서·확률하한.5%·등급배율·unique경제등급4·enh flat·이전비용 | +0 각등급/unique 비용, n831 하한, raw100/raw1000, 0/양수 `_malCost`, invalid rarity→0. `EXODUSER-TraceMeta-EnhQuote-Isolated-20261020` | RNG·차감·INV·UI 연결 없음. 원본 유효 입력 domain과 Number coercion 지원 범위를 명시하고 임의 폴백 추가 금지 |
| 3 / META-03 | **legacy 분해 가치 순수 규칙** 생성 `native_meta_salvage_policy.gd`, `test_meta_salvage_policy.gd`(각각 scripts/tests) | `28187–28201,16302–16318`; base등급표·tier×2·legacy 누적50%·`_enhRefund` max | 등급0/4/5, enh0/1/다중, `_enhRefund` 우선, 현행강화비용50%와 다름, JS signed32 절삭 의미. `EXODUSER-TraceMeta-Salvage-Isolated-20261020` | META-02. TRACE-INVENTORY와 가치 API 공유. 삭제·입금·저장 미포함 |
| 4 / META-04 | **SP/AP 투자·환불 계산** 생성 `native_meta_point_policy.gd`, `test_meta_point_policy.gd`; 기존 `raw_grit_restore.gd`는 재사용 가능 경계만 문서화, writer 연결은 다음 배정 | `27690–27728,27894–27896,51204–51215`; `stat-panel-ui.js:4–23,256–274` | 4스탯500/legacyVIT환불·근성1SP·AP23/10rank·감소환급·잔액부족·낡은plan거부. `EXODUSER-TraceMeta-Points-Isolated-20261020` | 메모리 계산만. helper를 실제 Main 연결로 오인 금지. 세이브 복원부 **보호** |
| 5 / META-05 | **예약 패시브 큐 정책** 생성 `native_meta_passive_queue.gd`, `test_meta_passive_queue.gd`; State의 level-up 후처리 연결은 정확 scope 승인 후 | `51219–51233,51251–51260,43157`; 유효키26종/큐260/FIFO/선두비용부족중단/max10 | 유효키 필터·260cap·max선두제거·부족시뒤스킵0·AP차감/반환 순서·투자 발생 시에만 기존 재계산. `EXODUSER-TraceMeta-Queue-Isolated-20261020` | META-04, 현재 PASSIVES owner. 저장 `passiveQueue` 형식 **보호**, Q/E 효과 정책 변경 없음 |
| 6 / META-06 | **demo/초월 제한 정책** 생성 `native_meta_exp_gate_policy.gd`, `test_meta_exp_gate_policy.gd`; 단계별 반환값만 먼저 검증. 실제 State gate 교체는 별도 소비 배정 | `16644–16648,43122–43127,43137–43155`; demo100·로컬일자·일1회·clamp maxExp−1·>1000 count | 고정 주입 날짜 자정변경/당일두번째/999→1000 count0/1000→1001 count1/demo입구와while. `EXODUSER-TraceMeta-ExpGate-Isolated-20261020` | META-01·05. 원본 날짜 기준을 임의UTC로 변경 금지. clock 주입 구현세부는 이 단위 때 확정. 저장필드 추가/마이그레이션 **보호** |
| 7 / META-07 | **강화 1회 메모리 거래** 생성 `native_meta_enhancement_transaction.gd`, `test_meta_enhancement_transaction.gd`; State에 쓸 경우 새 메서드의 mats/enh 범위만 별도 등록 | `50582–50645`; live견적→잔액검사→성패무관차감→성공만+1 | 부족액이면 RNG/차감0, paid시 성공판정 RNG1, `<rate` 성공/같으면실패, 실패enh유지·파괴0. 원본에 없는 장착 identity 재검증/낡은선택거부는 추가하지 않음. `EXODUSER-TraceMeta-EnhAttempt-Isolated-20261020` | META-02, **실제 INV 장비 쓰기 owner 선행**. writer 없으면 이 단위 연결 HOLD; 임시 가짜 equipped provider 금지. 저장은 별도보호 의존 |
| 8 / META-08 | **장착 강화 이전 거래** 생성 `native_meta_enhancement_transfer.gd`, `test_meta_enhancement_transfer.gd`; 실제 equip caller는 TRACE-INVENTORY 후속 담당 exactscope | `16302–16344`; 비용500n·new.enh=old.enh·old.enh0·legacy_refund 기록 | 잔액부족교체0, old0/positive, 새기존강화보다낮아져도source대입유지, 유물전승은별도. `EXODUSER-TraceMeta-Transfer-Isolated-20261020` | META-02·03·07/장착 owner. 새/구 아이템 identity·공용 INV 충돌. 세이브 형식 **보호** |
| 9 / META-09 | **AI 강화 반복 정책** 생성 `native_meta_ai_enhancement.gd`, `test_meta_ai_enhancement.gd` | `28123–28184,50646–50687`; target/budget gate, 매paid try 성공판정 RNG1, sum(cost/rate)ceil 예산·기본+100 | 예산경계·실패유지·목표도달종료·미달used/tries·미지출잔액유지. `EXODUSER-TraceMeta-AiEnh-Isolated-20261020` | META-02·07. 주입 RNG는 실제 owner 사용, default0/고정성공 금지. UI9999를 강화max로 만들지 않음 |
| 10 / META-10 | **유물 강화·합성·분해 경제 정책** 생성 `native_meta_crystal_economy.gd`, `test_meta_crystal_economy.gd` | `15276–15380,50869–51077`; 별/비용배율·enh<20·재료1·3합성·dust표·q평균·악의오브25 | 같은id/star·live 입력의 재료/악의오브부족 조건, 강화q유지·합성enh0/q평균 round·1..100 clamp·먼지50%·삼등급공명. 낡은 클릭의 재료 재검색 실패를 새 거부/환급으로 일반화하지 않음(`50944–50948`). `EXODUSER-TraceMeta-CrystalEco-Isolated-20261020` | META-02, 현재 crystal 효과 provider·TRACE-INVENTORY. 정책별로 테스트 묶고 실제 배열 쓰기는 해당 owner 선행 |
| 11 / META-11 | **성장 패널 소비 연결** 예정 생성 `godot/scripts/native_meta_growth_panel.gd`, `godot/scenes/meta_growth_panel.tscn`, `test_meta_growth_panel.gd`; Main/HUD 열기 접점은 정확 배정 필요 | `3035–3076,51204–51279,51327–51336`; SP/AP/초안확인·환불·예약·원본표시 | 적용전 base/live plan 재검사·취소무변경·같은 plan 재적용 거부/중복차감0·source잔액갱신(별도 거래ID 저장소 아님). `EXODUSER-TraceMeta-GrowthUi-Isolated-20261020` | META-04·05, 실제 point writer/기존자원소비 연결 선행. 실화면/키보드/패드 인수는 별도. 세이브 자동 호출 연결은 **보호/HOLD** |
| 12 / META-12 | **클리어 진행·기록 정책** 생성 `native_meta_clear_progress.gd`, `test_meta_clear_progress.gd`; exit/world 연결은 별도 | `41893,41919–42003,42024–42067`; !stageCleared gate·SP10·90%타임·점수/랭크/최고기록·hellCleared | 89.9/90%·동률/최단·최고점수·랭크독립병합·동일클리어중복0. `EXODUSER-TraceMeta-Clear-Isolated-20261020` | P3-003 지역+P3-002 분모/보스/출구 선행. 기록·해금 배열은 **저장 보호**. 지급원인/호출owner 확인 전 월드 연결 금지 |

단위 2~10의 `native_*.gd`는 `godot/scripts/`, `test_*.gd`는 `godot/tests/` 아래다. 경로 표에서 파일명이 겹치지 않도록 고정했다. 단위 11의 테스트도 `godot/tests/`다. 새 파일 경로의 충돌은 다음 착수 시 재검색한다.

**별도 선행/HOLD:** 공유 악의오브 repository·캐릭터 저장/복원·기존 세이브 마이그레이션·새 로비 저장 형식은 이식 단위로 설계하지 않는다(**보호**, TRACE-SAVE 의존). 물약 강화/자동추출은 TRACE-QUICKSLOT, 인벤 수집·분해 삭제·장착은 TRACE-INVENTORY, 죽음/부활 UI와 실재시도 XP 차감은 TRACE-REVIVE-SHIELD 접점이다. 그 담당이 확정한 원본 계약을 받아야 실제 끝까지 지속되는 메타 흐름이 된다. 순수 정책 fixture 통과만으로 저장·UI·전체 경제 인수를 선언하지 않는다.

## 8. 1번 단위 구현 지시서 — META-01

### 8.1 해결할 한 문제와 정확한 수정 범위

다음 실행 작업 이름 제안은 `meta-01-exp-curve`, 브랜치 `codex/meta-01-exp-curve-20261020`, worktree `~/exoduser-wt/meta-01-exp-curve`다. 다음 명시적 구현 지시 때 최신 원격에서 별도 작업 공간을 만들며, 이번 문서-only 브랜치에서 지금 코드를 쓰지 않는다. 사용자가 후속에서 경로를 지정하면 그 지시가 우선한다.

현재 State는 일반 곡선을 이미 이식했다. `godot/scripts/native_source_new_run_state.gd:501`에서 lv를 증가시킨 뒤 `:506`이 **무조건 일반식**을 써서 999→1000에서142,679를 만든다. 원본은 그 시점 `_calcMaxExp(1000)=5,010,000`이다. 이는 정적 코드·수치 불일치이며 이번 작업에서 런타임 재현한 결과는 아니다.

| 파일 | 작업 지시 |
|---|---|
| 생성 `godot/scripts/native_source_meta_exp_curve.gd` | `extends RefCounted`, 필요 시 `class_name NativeSourceMetaExpCurve`, `static func required_exp(level: int) -> int` 하나. P/G/시간/RNG/Node·파일 읽기 쓰기 없음 |
| 수정 `godot/scripts/native_source_new_run_state.gd` | 기존 preload 구역에 순수 모듈 const 추가. `apply_native_add_exp`의 **maxExp RHS 한 곳(:506)**만 `required_exp(int(lv))` 호출로 치환. `lv`는 후속 짝수 AP 계산에 쓰이므로 기존 지역변수·순서 보존. 원본 참조 주석을 정확히 갱신 |
| 생성 `godot/tests/test_source_meta_exp_curve.gd` | 순수 정책 경계 + 실제 Main/State owner fixture. 아래 단정·fixture 개입값을 결과에 명시. 기존 테스트 복사로 단정 수를 부풀리지 않음 |
| 문서 동기화 | 새 코드 변경 시 관련 docs 검색 후 실제 바뀐 계산/한계를 이 문서에 기록. 기존 설계표 불일치를 이번 계산에 맞춰 밸런스 변경하지 않음 |
| 수정 금지 | `mkP`/신규 P maxExp15, 보상 XP 전처리, 초월 날짜·횟수·cap, SP/AP·회복·해금 순서, serializer·저장키, Main/HUD/피해 집행자·Q/E·docs2_3 |

API의 지원 입력은 원본 게임에서 사용하는 **양의 정수 레벨**이다. 잘못된 입력을 임의 clamp하거나 새 레벨 상한을 만들지 않는다. META-01의 실제 State caller는 레벨 증가 후 호출되므로 기존 while 가드 아래 lv2..1000이고, 그 밖의 순수함수 표본은 향후 원본식 보존을 위한 oracle 검사다. 이로써 새 게임 레벨 상한을 만드는 것은 아니다. 기존 lower branch 값은 전부 양수·signed32 범위이므로 `int(floor(...))`가 `~~`와 같다. upper branch는 `t=level-999`, `5_000_000+t*t*10_000`를 **64비트 정수**로 계산하고 반환한다. 32비트 helper를 적용하지 않는다. 새 게임 생성 경로가 이 함수를 호출해15를17로 바꾸게 해서는 안 된다. 매우 큰 무제한 입력·safe integer 경계 전 구간의 수치 동등성은 이번 추적에서 인증하지 않았으며 구현 시 지원 범위를 명시한다.

### 8.2 호출/거부 의미 보존

State API는 `apply_native_add_exp(owner, final_value: int)`이다. **이미 /3·장비 보너스를 처리한 최종 credit**이므로 새 테스트의 credit1에 raw3을 넘기지 않는다. rawXP 전처리 검사는 기존 hurtE 테스트의 책임이다.

기존 순서는 owner/음수 거부(:492)→EXP 선누적(:494)→while(:497)→lv>=1000 미이식 가드(:499–500)→레벨·잔여XP·maxExp→SP/AP→후처리다. 이 가드는 입구의 무조건 lv>=1000 거부가 아니다. 예를 들어 Lv1000에서 EXP가 임계에 못 미치면 정상 누적될 수 있다. 임계에 닿아 거부되더라도 EXP 선누적은 이미 일어났다. 이 부분 적용·거부 동작을 “깔끔하게” 롤백하거나 새 날짜 gate로 대체하지 않는다. 그 정정은 META-06의 별도 제품 연결 범위다.

### 8.3 새 테스트 핵심 단정

| 구분 | fixture 입력·조치 | 필수 기대값 |
|---|---|---|
| 순수식 | §2.2의 전 레벨 표 | 정확 int·양수, 특히999/1000/1001/1002·1461/1462/1500 일치. 1462/1500 signed32 오버플로 없음 |
| 새 게임 | 실제 Main 부팅 직후 | lv1/exp0/maxExp15 유지. `required_exp(1)==17`과 공존 |
| 기존 경계 | 신규 State에 `final_value=20` | lv2/exp5/maxExp20, SP+3/AP+1. 기존 p2001c 계약 그대로 |
| 핵심 단일 경계 | 실제 current P의 lv999/exp142257/maxExp142258/SP10/AP4로 **테스트 개입** 후 final1 | applied true, levels1, lv1000/exp0/maxExp5010000/SP13/AP5, ap_gain1. 기존20% 회복/해금 후처리 동작 유지 |
| 다중 carry | lv998/exp141838/maxExp141839/SP10/AP4로 개입, final142259 | levels2, lv1000/exp0/maxExp5010000/SP16/AP5, ap_gain1. 다중레벨 회복을 추가 반복 호출하지 않음 |
| 후속 임계 미만 | lv1000/exp0/maxExp5010000에 final1 | 기존 가드 위치대로 exp1·추가레벨0. 새 무조건 입구 거부 금지 |
| 초월 미이식 경계 | lv1000/exp5009999/maxExp5010000에 final1 | 기존 reason `unported_branch_active:transcend_level_gate` 보존, lv/maxExp/SP/AP 변경0, **EXP는5010000으로 선누적 유지**. clamp/rollback 추가 금지 |
| 혼합 carry의 부분 거부 | lv999/exp142257/maxExp142258/SP10/AP4에 final5010001 | lv1000/exp5010000/maxExp5010000/SP13/AP5까지 변경 후 위 초월 reason으로 applied false. 아직 회복/해금 후처리에 진입하지 않음. 부분 적용을 rollback하거나 성공으로 바꾸지 않음 |
| 기존 거부 | 현재 owner가 아닌 Node 또는 음수 final_value | 기존 reason 유지, 이 거부는 EXP 선누적 전이므로 P 상태 쓰기0 |
| 순수성·범위 | 정책 호출 전후 입력/State/파일 목록 | 정책 자체 user://·저장·시간·RNG 접근0. 테스트가 조작한 P/actor 필드를 관측에 기록. 새 저장 필드 없음 |

구현 시 fixture는 기존 `test_p2001c_kill_rewards.gd:125–178`의 실제 Main/State binding 방식을 재사용한다. 반환 사전의 `applied/reason`을 무시하거나 fake owner·dummy resources를 주입해서 통과시키지 않는다. 테스트 직접 개입은 경계 재현을 위한 것이며 자연 레벨999 실플레이 증거가 아니다. 원본 전체 초월 진행·일일1회·보스/정예 XP·클라우드 저장·1000레벨 데모 도달을 보증하지 않는다.

### 8.4 구현 시 명령·격리·완료 조건

이번 추적에서는 아래 명령을 **실행하지 않았다**. 다음 코드 구현 때 사용할 좁은 검수 목록이다.

1. 최신 fetch/작업판/HEAD·INDEX·WORK 확인, 기존 추적 SHA와 원본 변경 비교. 원본이 달라지면 이 행 번호/정책부터 갱신한다. 이 문서만으로 공용 파일 전체 소유권을 가져가지 않는다.
2. 원앱 `/Users/fordeargamers/.codex/tools/godot-4.7.2/Godot.app/Contents/MacOS/Godot --version`이4.7.2인지 확인. import가 필요하면 기존 사용자 지시대로 `~/Library/Application Support/Godot/` **전체를 새 고유 백업 경로**에 보존한다. 이 승인된 백업 외 목적으로 다른 담당의 worktree 캐시/로그를 검수에 재사용하지 않는다.
3. 격리 이름 `EXODUSER-TraceMeta-Curve-Isolated-20261020`, `godot/override.cfg`의 custom user dir 설정 후 필요한 import 1회. 실제 저장 폴더 `EXODUSER-Godot-Native-First` 사용 금지. 끝나면 override 0 byte·커밋 금지.
4. `--headless --path <WT>/godot --script res://tests/test_source_meta_exp_curve.gd`를 지정 원앱으로 실행하고 stdout/stderr·exit code·직접 fixture 조작량을 `_out/<새구현ID>/`에 기록한다. `test_p2001c_kill_rewards.gd`, `test_p2002b_minimap_corner.gd` 회귀를 각 테스트 상수의 격리 이름으로 실행한다. cap/날짜 검사를 건너뛰어 초월 PASS로 만들지 않는다.
5. 원본 oracle 확인은 `node --test test/balanceExpCurve.test.js`. 이 테스트의 두 소스는 game/game-easy-test이며 index가 아니다. 기존 저장복구 테스트를 약화/수정하지 않는다.
6. source diff는 새 정책·State 한 RHS·필요 preload/주석·새 테스트·관련 docs만이어야 한다. 테스트는 ignore `test_*`에 걸리므로 해당 경로만 `git add -f -- godot/tests/test_source_meta_exp_curve.gd`, 나머지도 `git add -- <정확경로>`. 전체 add 금지.

완료 조건은 **순수 곡선 + 실제 State의 해당 경계 + 기존 저레벨/CP 표시 회귀**다. UI·자연 고레벨 플레이·전체 메타·세이브 완료로 승격하지 않는다. 기존 선재 실패가 나오면 원로그와 기준선을 분리하고 기대값을 편의상 낮추지 않는다.

## 9. 공용 접점·충돌·보호

| 접점·현재 근거 | 담당/경계 | 이 추적의 처리 |
|---|---|---|
| `native_source_new_run_state.gd` / WORK_BOARD:45–46 | 공용 P/G·보상 owner. 현 판에 `apply_native_add_exp` 활성 writer 별도 행은 없음 | META-01은 preload+maxExp RHS만 제안. 시작 시 재확인. 다른 입력/리젠/드랍/G 필드 수정 금지 |
| `native_normal_enemy_hurte.gd:667–758` | 피해·처치 RNG·XP 전처리. 이미 P2-001c 통합 | META-01은 변경0. 일반/정예/보스·초월XP 연결은 별도 정확 배정 |
| `main.gd/player.gd/hud.gd/world.gd` | 공용. PC P2-001l는 레슨·입력 처리 함수, P3-002는 동적 스폰/분모, P2-007a는 글꼴·인트로 UI | 이번 수정0. 제안된 UI·클리어 단위도 함수 소유 확인 전 배선하지 않음 |
| P2-006a / WORK_BOARD:25 | 드랍 바닥·줍기·인벤, 중단·인계 대기 | 드랍 레코드 생성과 실제 인벤 반입을 구분. 무단 인수/재개 금지 |
| TRACE-INVENTORY / :34 | 인벤·장비 문서 추적 | 아이템 enh/rarity/tier/_enhRefund·장착·분해 가치/삭제/자동전승 접점만 전달 |
| TRACE-QUICKSLOT / :35 | 물약·슬롯 문서 추적 | mats1 사용·HP환산·potLv 강화 source 참조, 해당 UI 구현 중복 배정 없음 |
| TRACE-SAVE / :36 | 저장·데이터 문서 추적 | 모든 저장 키/형식/복원은 **보호**. 신규 repository·세이브 schema·마이그레이션 설계 없음 |
| TRACE-SETTINGS / :37 | 키바인딩·난이도·빌드 설정 추적 | `_diffSigned`, target/demo상한·UI 진입키 의존. 설정 writer 변경 없음 |
| TRACE-REVIVE-SHIELD / :38 | 부활·쉴드 추적 | 죽음 표시와 retry XP손실·레벨부활력·pHuman/pDemon 접점. Q/E·확정 보호 설계는 **보호** |
| `docs/2_3`, Q/E | 확정 설계 | **보호** 표시만. 메타 이식 명목으로 수치·패링 분류·입력·판정을 바꾸지 않음 |
| P4-001 / 계획:83 | 전체 게임 흐름 exactscope 미배정·HOLD | 사용자 이번 지시는 추적 문서 작성 권한. 실제 코드 착수는 다음 명시적 단위 지시의 범위에 한정 |
| TRACE-META | 현재 원격 작업판에 별도 행은 없지만 이번 사용자 직접 배정으로 문서1개 소유 | 사용자 단일 파일 지시에 따라 작업판·다른 보고서는 변경하지 않음 |

원본의 일반 뉴게임+·prestige·환전·통합 META 구조는 game/index의 `META/prestige/newgame/ngplus/환전/뉴게임` 및 저장 경로 검색에서 확인되지 않았다. 검색되지 않은 이름을 새 자원이나 meta reset으로 가정하지 않는다. 부활/retry·슬롯 복귀·캐릭터 생성의 실제 경로만 분리 기록한다.

## 10. 조사 검증·미확인·제출

### 10.1 정적 조사 기록

- 초기 fetch/원격 main SHA 고정, worktree 생성, branch·HEAD·tracked INDEX/WORK 분리 확인.
- `rg -n`으로 game/index의 성장·재화·저장 심벌 검색, 원본 정의와 호출/쓰기/UI/저장 분기 대조. 기존 docs의 일치/불일치/누락/미확인 상태 분리.
- Godot 관련 scripts/port_modules/test 본문과 P2-001c·P2-002a/b·P4 작업표 대조. 현재 구현과 선언-only/미연결/실플레이 미인수를 구분.
- 독립 읽기 조사 3개(경제·레벨·Godot 의존)로 교차 확인. EXP while guard가 입구 거부가 아님을 최종 문서에 반영.
- 사전 맥락 없는 별도 독자가 문서로 6개 질문(용어·첫 단위 파일/계산·final_value/가드·기이식/미이식·보호·구현 장애)에 답하고 원본 일부를 대조했다. 원본에 없는 강화 낡은선택 거부를 제거하고, 유물 강화q유지/합성q평균·stale 재료 경로의 원본 차이, 클리어 gate행41893, mixed carry 부분 거부, 승인된 전체 백업 예외를 보완했다. 이것은 문서 검토이지 게임 테스트 PASS가 아니다.
- 코드·테스트·기존 설계 docs·WORK_BOARD 수정0. Godot import·게임/테스트 실행·세이브 접근0. 향후 단위 명령은 미실행 계획.

### 10.2 재현용 참조 census

아래는 고정 소스에서 각 심벌을 포함하는 **행 개수**다(주석/저장 객체 포함, 동일 행의 여러 출현은1). 숫자는 구현률·테스트 개수가 아니다. 전체 행 목록과 소스 manifest는 로컬 `~/exoduser-wt/_out/trace-meta/source-reference-census.json`, `source-manifest.json`에 보존한다. 표 자체는 파일이 없어도 조사 범위를 읽을 수 있게 요약한다.

| 심벌 | game.html 매칭 행 수 | index.html 동일 실행 심벌 |
|---|---:|---:|
| `P.lv` | 85 | 0 |
| `P.exp` | 21 | 0 |
| `P.maxExp` | 18 | 0 |
| `P.sp` | 58 | 0 |
| `P.ap` | 28 | 0 |
| `G.mats` | 146 | 0 |
| `calcCP` | 8 | 0 |
| `_calcMaxExp` | 6 | 0 |
| `addExp` | 5(정의1·호출4) | 0 |
| `transLvDate/Count` | 8 | 0 |
| `hellCleared` | 15 | 0 |
| `UPGRADES` | 14 | 0 |
| `POT_LV` | 17 | 0 |

로비의 `data.player.lv`처럼 **다른 객체 경로로 읽는 저장 진행은 위0과 별개**이며 §4.2에 추적했다. 계정/캐릭터 공유 재화·초월 gate·레거시 복구·QA 분기를 하나로 합쳐 총칭하지 않는다.

### 10.3 미확인·후속 인수

실제 공개/EA/full 패키지 target, 자연 레벨업·고레벨 획득 경제, 전투/화면/성능, 전체 영구 메타 인수는 이번 정적 조사로 확인하지 않았다. `_apBossCleared/_goddessGift/_lvStatMigrated`의 현재 활성 지급/처리, 내구/수리, 뉴게임+/환전 실행도 미확인이다. 미이식 또는 미확인 값을 dummy/default0·가상 UI로 채워 완료 선언하지 않는다.

실제 구현 준비는 META-01이 가장 작고 독립적이다. 새 곡선 파일+기존 maxExp caller+새 경계 테스트로 끝나며, 저장·소유·보상 순서의 나머지를 보존한다. 다른 소비자는 §7의 선행 조건에 맞춰 별도 인수한다.

제출은 이 문서1개를 경로 지정 staging·자기 브랜치 commit/push하고 원격 ref SHA를 대조한다. 최종 제출 SHA·브랜치·한 줄 요약은 로컬 `~/exoduser-wt/_out/trace-meta/DONE.txt`에 기록한다. main push·병합·force·reset은 하지 않는다.

DEMO11-01(2026-10-21)은 Main 부팅 데모 권위와 readonly cap 정책 진입점을 연결한다. META-06 수식·기존 테스트는 그대로 재사용한다. 실제 State.addExp의 entry/loop 교체는 DEMO11-20으로 유지한다. 인터페이스와 공용 변경 범위는 [DEMO11-01 보고서](orders/reports/demo11-01_REPORT.md)를 따른다.
