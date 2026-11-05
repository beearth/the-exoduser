# 스킬 세팅 감사 — 설계 ↔ Unity Core ↔ 웹 oracle 전수 대조 (2026-11-05, 레인 SK)

**요약: 불일치 14건(문서·데이터↔코드 9, 이식 스킬 툴팁↔코드 4, Core↔웹 1) · 미구현 = 스킬 47종(웹 SKILL_LIST 55 중 이식 6·부분 2) + 이식 스킬 내부 기능 8건 + 시스템 3건(합체·필살기·추천 자동) · DPS 표 차이 4건 · 죽은 항목 5건.** Core 코드는 바꾸지 않았다. Core 변경이 필요한 항목은 §7 백로그에 `CP-SK-nn` 번호로 올렸고 사용자 승인 뒤 별도 구현 레인이 한다.

- 기준: unity/main `1b88108c`(이 브랜치의 기반, 2026-11-05). Core = `unity/Assets/Exoduser/Runtime/Core/Skills/SkillRules.cs`·`Simulation.Skills.cs`·`Simulation.Fireball.cs`·`KiSlash.cs`·`Simulation.cs`·`Simulation.PlayerCombat.cs`·`Simulation.BashStrike.cs`·`ParryRules.cs`·`ChainDash.cs`·`RollRules.cs`·`RageMalice.cs`·`EnergyShield.cs`·`SkillUiState.cs`, Runtime `NativeSkillManagementPolicy.cs`·`NativeSkills.cs`, 데이터 `Resources/Data/skill_defs_web.json`·`skill_ui.json`. 웹 oracle = 같은 커밋의 `game.html`(`git show origin/unity/main:game.html`, 부분 읽기). 웹은 정답이 아니고 대조용이다(브리프 §0).
- 읽은 설계 문서: `2_1 스킬관리+합체시스템.md`(합체 체크리스트·성급 규칙 포함), `추천빌드_SKILL_REC_PATH.md`, `자원리젠+소모공식.md`, `신규캐릭_스킬프로젝트_20260930.md`, `KISLASH_HOLD_CHARGE_20260927.md`, `KISLASH_Q_CANCEL_20260916.md`, `E_BASE_WING_STRIKE_20260910.md`, `14밸런스+수치테이블/스킬데미지공식표.md`·`스킬별_DPS_자원소비표.md`·`자원소비량표.md`·`패시브효과표.md`·`스킬_밸런스_리포트.md`·`BASIC_ATTACK_DAMAGE_20260910.md`·`EARLY_COMBAT_5_7_1_20260910.md`.
- 설계 금지(CLAUDE.md §7) 준수: 어택 티켓 제안 없음(Core `MeleeAttackRules` 주석 "No attack tickets" 유지), 무지개탄은 Q 전용(`ParryRules.ECanReflect`가 blackBean을 E에서 제외함을 확인), `docs/2_3` 설계 변경 제안 없음.
- 표시 문자열: 이 감사는 새 표시 문자열을 추가하지 않았다. §7의 툴팁 정정(BL-04)을 실행할 때 `16번역·로컬라이제이션/번역대상_전체목록.md`에 등록할 후보를 §8에 따로 적었다.
- 기본 공격 1타 예비 틱(D-MO-2, `Simulation.cs` 116~139)은 동작 레인의 Core 제안이라 여기서 중복 제안하지 않는다. 링크: [BRIEF_MOTION_PIPELINE_20261105](../0마스터플랜/worklog/cloud-lanes/BRIEF_MOTION_PIPELINE_20261105.md).

상태 표기: **일치** = 문서·Core·웹 셋이 같다 / **불일치** = 어느 둘이 다르다(열에 어느 쌍인지 적음) / **미구현** = 설계·웹에 있고 Core에 없다 / **부분** = Core가 일부만 갖는다 / **문서 없음** = 코드에 있고 문서에 없다 / **이력** = 문서가 과거 기록임을 스스로 표기함.

---

## 1. 공통 규칙 대조 (스킬 공식의 뼈대)

| 항목 | 문서 값 | Core 값 | 웹 값 | 상태 | 파일:줄 |
|---|---|---|---|---|---|
| 스킬 배율 `_skMul` | `b+(Lv−1)×g×0.5`, 미등록 id=1 | `SkMul(id,lv)=t[0]+(l−1)×t[1]×0.5`, 미등록 1, lv<1→1 | 동일 | 일치 | SkillRules.cs:14~31 / game.html:44556 |
| `_SK_MUL` 표(37키) | 공식표·DPS표에 각 b/g 기재 | 37키 전부 웹과 동일(giantSlam 20/19 … ancestorSummon 6/4.8) | 44507~44555 | 일치 | SkillRules.cs:15~23 |
| `_fuseMul` | 성급 s≥2면 `1+(s−1)×0.2`, chargeBoost·magicBlink 제외 `×(1+skillBoost)` | **없음**(합체 미이식, 호출 지점 전부 1) | 44557 | 미구현 | — |
| 물리 ref `meleeRef` | `(무기ATK+강화×0.25+slotFlat+baseAtk+STR+⌊Lv×0.5⌋)×봉인` | `WeaponAttack+Enh+Flat+BaseAttack+StrengthFlat+(int)(Lv×.5)`; **봉인 ×0.3 없음** | 28770 | 부분(봉인 미이식, 봉인 시스템 자체가 미이식) | Simulation.EnemyBridge.cs:75 |
| 마법 ref `magicRef` | `(투구ATK+강화+slotFlat+baseAtk+INT+⌊Lv×0.5⌋)×봉인` | `MagicReference()` 투구 atk·enh×.25·sharp/brutal/ruinAtk·baseAtk·⌊Lv×.5⌋·Growth int·장비 bInt | 28772 | 부분(봉인 없음) | Simulation.Skills.cs:90~96 |
| `statStr()`·`statInt()` | 1(스탯은 ref에 직접 가산) | 호출마다 1 전달 | 27993·27995 | 일치 | Simulation.Skills.cs:208·325·331 |
| `pAtkMul` | `_passDmgSum('melee')=(1+pAtk×.10+pHuman×.05+pMelee×.15)×0.7` | `Config.DamageMultiplier` 기본 .7, 성장 적용 시 `(1+pAtk×.10+human×.05+melee×.15)×.7` | 28003~28017 | 일치 | SimulationState.cs:31 / Simulation.Growth.cs:323 |
| `pMagicMul(true)` | `_passDmgSum('magic')×(1+_uHelmMagic)×2` | `(1+pAtk×.10+human×.05+pMagic×.10+magicDmg+_iMagDmg×.01)×0.7×2`, 유니크 0 | 28039 | 일치(유니크 미이식) | Simulation.Skills.cs:99~103 |
| 평타 기준값 `baseAtk` | `15+(stage−1)×2` | `PlayerBaseAttack=15` 고정 | 27926 | 불일치(문서·웹↔Core: 스테이지 가산 없음. 1-1만 쓰는 데모 v0에서는 영향 0) | SimulationState.cs:22 |
| ST 비용 `stCost` | `min(⌊base×(1+(Lv−1)×dps)×disc⌋, ⌊mst×0.9⌋)`; weapon/shield 조기 반환 | `StCost` 동일, `PAtkCost`·`PMeleeStCost`·stCostRed 음수만 | 31984~31989 | 일치 | SkillRules.cs:33~45 |
| MP 비용 `mpCost` | `⌊base×(1+(Lv−1)×dps)×pMagicCost⌋` | `MpCost` 동일; **미매핑 키 기본값 Core 5 / 웹 7** | 31992~31995 | 불일치(Core↔웹, 이식 키 magic·iceOrb에는 영향 0) | SkillRules.cs:34·47 |
| `_COST_BASE`/`_COST_DPS` | 표(자원소비량표) | giantSlam 50/.45, iceOrb 50/.35, mortar 50/.35, magic 10, weapon 10, 그 외 5/.10 | 31960~31979 | 일치(이식 범위) | SkillRules.cs:34~36 |
| `pMagicCost` | `max(.40, 1−pMagic×.04−mpCostRed−유니크)` | 동일, 유니크 0 | 28041 | 일치 | SkillRules.cs:46 |
| `pMagicSpd` | `(2+pMagic×.08)×(1+castSpeed+headbandCastSpd)` | 동일 | 28050 | 일치 | Simulation.Fireball.cs:35~39 |
| `_cdRed` | cooldownRed+helmCooldown+endCooldownAll+skillCdRed(−`_lHelmFree`, HP 조건 항) | 4개 어픽스 합만 | 28065 | 부분(유니크 항 미이식) | Simulation.Skills.cs:105~107 |
| 악의오브 비용 `_malCost` | `max(1,⌈v×0.5⌉)`, 0 이하는 0 | `RageMalice.Cost`→`AutoPotion.MalCost` | 28164~28169 | 일치 | RageMalice.cs:172 |
| 스킬 최대 Lv / 레벨락 | 20 / `min(20,⌊lv/50⌋+1)` | `MaxSkillLevel=20`, `SkillLevelLock` 동일 | 47193~47194 | 일치 | SkillRules.cs:12·50 |
| 강화 SP | 전 레벨 1 | `UpgradeSpCost=1`, `CanUpgrade` learned∧lv<20∧lv<lock∧sp≥1 | 3913~3917 | 일치 | SkillRules.cs:51~52 |
| 습득 비용 | `spCost`(10, timeWarp 15, 히든 0) + `_malCost(matCost)`, `reqLv` | `NativeSkillManagementPolicy.CanLearn(sp,mats,reqLv)`: sp≥, `Materials≥MaliceCost(mats)`, Lv≥reqLv | 47748 | 일치(6종만 허용) | NativeSkillManagementPolicy.cs:13 |
| 선택 슬롯 | `SKILL_SLOTS` 6칸(1~4·Space·F), Space=분노, F=영역 1개, Z=필살기, Ctrl=고정 | `SlotCount 6, SlotSpace 4, SlotF 5`, Z 분기 빈 블록 | `_canAssignSkillSlot` | 일치(Z 미이식) | SkillRules.cs:12 / Simulation.Skills.cs:161 |
| 시작 스킬 | 문서 표: kiSlash·fireball·iceOrb·giantSlam·holyDome 5종 | giantSlam→Space, holyDome→F, **spikeTrap→1**, iceOrb Ctrl, fireball E/RMB, kiSlash LMB | 62632~62640 + 기본 E `maliceSwipe=1, shieldThrow=1, shieldFuse` | **불일치(문서 누락: spikeTrap 1번·E 기본 보유)** | Simulation.Skills.cs:53~60 |
| 회복의 영역 쿨 가속 | 돔 안 쿨 2배, `_gcCd`·`_hdCd` 제외 | giantSlam·iceOrb만 `−(1+bonus)`, spikeTrap·holyDome 1 | 36517·36678~36687·35936 | 일치 | Simulation.Skills.cs:379~387 |

---

## 2. 스킬 전수표

### 2.1 Core에 실행기가 있는 액션 (이식 6 + 부분 2 + 비스킬 액션 3)

ID / 이름 / 캐릭터 / 키 / 자원·소모 / 쿨다운 / 배율·공식 / 틱(예비·접점·회복) / 사거리·범위 순. 캐릭터는 전부 전사(실버테일·신규 3캐릭은 Core 없음).

| ID | 이름 | 키 | 자원·소모 | 쿨다운 | 배율·공식 | 틱 | 사거리·범위 | 문서 값 | Core 값 | 웹 값 | 상태 | 파일:줄 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| (평타) | 기본공격 | LMB | ST 5 고정 | 없음 | `⌊(baseAtk+무기atk+강화+15)×6⌋×pAtkMul + ⌊비용×1.5⌋` | wSwing 5f(접점 st2 3) → wRecover `⌊16/(wp.spd×…)⌋`(spd .45→35f) | 무기 range 50, 호 .95 | ×6, pAtkMul×pMeleeMul(=1) | `HitArc` 동일, `attackBonus=(int)(cost×1.5)` | 동일 | 일치 | Simulation.cs:105~142·211~222 |
| kiSlash | 기검참 | LMB | ST `10+(Lv−1)×2` | 콤보 120f, 발사 후 12/20f | `⌊meleeRef×7×1×pAtkMul×_skMul(12,10.08)×M⌋`, 3타 홀드 `T=min(3,⌊f/40⌋)`, `M=2^T`, 최대 120f | 1·2타 즉발, 3타 wWindup 홀드 → wSwing 5 → wRecover 35 | 비행 `(250/300/350 + (Lv−1)×15)`px, 속도 14, 반경 55/120×`(1+T×.4)` | ST·공식·충전 일치. **거리 "350+15/Lv"로만 기재** | `CalculateKiSlashDamage`·`SpawnKiSlash` 웹과 동일(봉인 제외) | 16788~16827 | **불일치(문서↔코드: 1·2타 거리 250/300 누락)** | KiSlash.cs:30~73 / SkillUiState.cs:11 |
| fireball | 악의구 | RMB(웹 E) | MP `mpCost('magic')=⌊10×pMagicCost⌋`, 소비×2 보너스 | 없음(홀드 연사) | `⌊magicRef×1×pMagicMul×_skMul(13.2,10.56)⌋+보너스`, 폭발 `⌊×.6⌋`, 중독 풀 `+pDotPool×폭발×2`(600f·10중첩), 악의 약화 `+30%/스택×10` | magicCast `⌊14/pMagicSpd⌋`(7f) → magicRecover 12f | 사거리 `400+(Lv−1)×50+투구bonusRange×20`, 반경 12→`⌊12×(1+(Lv−1)×.5)⌋`, 폭발 `⌊80×scale⌋`, 유도 280px·0.35rad/4f, 벽 반사 3회 | 공식·폭발·약화(2026-10-10 10단) 일치. **2_1 분류표 "유도 제거됨"** | 유도 있음(`TickMaliceOrbs`), **bonusRange 0 고정**, **pDotPool 1 고정** | 유도 있음(35187·35202), bonusRange·pDotPool 적용 | **불일치(문서↔코드: 유도)** + 부분(장비·패시브 입력 2건) | Simulation.Fireball.cs:81~186 / SkillRules.cs:91~97 |
| spikeTrap | 가시덫 | 1 | 악의 원가 10(실소비 5) | `⌊600×(1+_cdRed)⌋` | `⌊magicRef×1×pMagicMul×_skMul(14,11.2)×.75⌋`/틱, 출혈 300f(10스택), 슬로우 90f `min(.95,.91+(Lv−1)×.02)` | 25f 틱, 적당 틱 1회 | 반경 `300+(Lv−1)×15`, 지속 600f | 전부 일치(2_1 영역표·DPS표) | 동일, `spikeHitThisFrame` 1회 | 45507~45521·37413~37432(캡 코드 1, 주석만 "2") | 일치 | SkillRules.cs:55~59 / Simulation.Skills.cs:200~211·390~421 |
| giantSlam | 지옥강타 1 | Space | ST `stCost('giantSlam')`(50×(1+(Lv−1)×.45)×disc, 90% 캡) + 악의 원가 20(실소비 10), 분노 전량 | `⌊max(60,1800−(Lv−1)×12)×(1+_cdRed)⌋` | `⌊⌊meleeRef×1×_skMul(20,19)×_rageMul⌋×pAtkMul⌋+_atkBon`, `_rageMul=1+rage×.19×(1+pRage×.10)×(1+rageDmg)`; 보스 포이즈 25%, 일반 미니스턴 60f, 포이즈 0이면 `min(300,150+(Lv−1)×15)` | windup 10 → strike 10 → recover 12, 이동 35% | 범위 `500+(Lv−1)×15`, 파동 ×2 45f | 공식·쿨·범위 일치. **SKILL_LIST 툴팁 "범위400"** | 동일; **분노 20당 용암 분출(`_addLavaErupt`) 미생성**(`SlamResult.Bombs` 계산만) | 46448~46526 | **불일치(툴팁↔코드)** + 부분(용암 분출) | SkillRules.cs:62~68 / Simulation.Skills.cs:215~260 / RageMalice.cs:152~167 |
| holyDome | 회복의 영역 | F | 없음 | 1800f 고정(`_cdRed` 없음) | 플랫 회복 `(10+Lv×2)/60×_fuseMul`/f를 HP·MP·ST에, 돔 안 giantSlam·iceOrb 쿨 2배 | 매 프레임 | 반경 `500+Lv×20`, 지속 `720+Lv×30` | **문서: "HP/MP/ST 자연회복×2(_hdMul)"**, 툴팁 "초당+10·12초" | 플랫 회복만, **자연회복 ×2 없음** | `_hdMul`은 **HP 자연회복에만** 곱함(32713), ST·MP 자연회복은 미적용(32714~32715) | **불일치(문서↔웹: ST/MP ×2는 웹에 없음)** + **미구현(Core: HP 자연회복 ×2)** + **불일치(툴팁↔코드)** | SkillRules.cs:71~74 / Simulation.Skills.cs:274~282·390~421 / Simulation.cs:85~87 |
| iceOrb | 얼음보주 | Ctrl(1~4 가능) | MP `⌊50×(1+(Lv−1)×.35)×pMagicCost⌋`, 소비×2 보너스 | `max(600,1200−(Lv−1)×60)`(`_cdRed` 없음, 돔 가속) | `base=⌊magicRef×1×pMagicMul×_skMul(8,6.4)⌋+보너스`, 칼날 `max(1,⌊base×.3⌋)×(4+Lv×4)`, 파쇄 `⌊base×.3⌋` | 보주 120f 자동 파쇄, 재입력·Space 파쇄, Shift 180px 탈출+30f 무적 | 발사 반경 `(r+32)×(1+(Lv−1)×.1)`, 칼날 3000px·r12·속도 7~10·관통 .95, 파쇄 `(100+Lv×5)×scale` | 2_1·DPS표 일치. **툴팁 "MP 40, 쿨 20초, 뎀+15%"** | 동일 | 46756~46818·36692~36710 | **불일치(툴팁↔코드)** | SkillRules.cs:77~89 / Simulation.Skills.cs:285~377 |
| maliceSwipe(+shieldFuse) | 칼등 처내기·불꽃칼날(기본 E) | E | ST `5+(L−1)×2`, L=`max(1,min(maliceSwipe,shieldThrow))` | 없음(파동만 `max(120,720−15L)`) | 타격 `⌊⌊meleeRef×2.0×(1+(L−1)×.21)×1×pShieldMul(1)×chg⌋+_atkBon⌋×pAtkMul`; 홀드 `_SD_GRACE 10`, kiGather `KgChg+=2/f`, 해제 배율 `min(3,1+.5×min(t,2)+max(0,t−2))`, 186 자동 | sDraw → sBash 20f(접점 st2 12, 패링창 16f) → sRecover `⌊28/(1+pParry×.1)⌋` | 반경 `⌊(70+견갑bonusRange×4)×(1+(L−1)×.05)×chg⌋`, 파동 maxDist 210M·r50M | E 공식·범위·쿨 일치(E_BASE_WING_STRIKE) | 타격·스턴·포이즈·파동 **표시**(`SlamWave Bash`)까지; **파동 피해·마법탄 반사·물리탄 반사 미구현**(PlayerCombat 헤더) | 33416·38449·3493 | 부분 | Simulation.BashStrike.cs:17~54 / ParryRules.cs:37~40·135~204 / Simulation.PlayerCombat.cs:8~12·67~98 |
| chargeBoost | 사슬기동:충돌(Shift) | Shift | 게이지 `[0,45,98,150]`, ST `tier×1%`(ChainDash.Release) | 게이지 회복 2.5%/s×(1+cb×.05)×pChargeGauge | 통과 피해 `⌊((갑옷charge‖10)+baseAtk)×cbMul×1×(1+dashBoost)⌋`, `cbMul=lv≥1?1.5+(lv−1)×.25:1` | 홀드 `[0,1,6,12]`f 티어, 비행 63px/f, 당김 `[0,7,11,16]`f, 착지 무적 48 | 거리 `[300,500,700]`→만렙 `[500,800,1200]`×(1+pCharge×.02) | 문서 공식 `meleeRef×STR×pAtkMul×_skMul('chargeBoost')×거리배율` | **기본 사슬 경로 피해(32291)만**, `ChargeBoostLevel=0` 고정; **스킬 본체(32484 `_cbBaseDmg`, 3스톡, 쿨 5초) 미구현** | 32290~32291(기본) · 32484(스킬) | 부분 | ChainDash.cs:11~20·116~121 / Simulation.PlayerCombat.cs:110~169 |
| (roll) | 구르기(전사 기본 기동) | 방향키 더블탭/Space | 게이지 45 | 없음 | 피해 없음 | 18f, 무적 앞 14f | 175px(=250×0.7) ease-out | ROLL_MOBILITY_20261027 일치 | 동일 | 일치 | 일치 | RollRules.cs:10~13 |

### 2.2 Core에 없는 스킬 (웹 SKILL_LIST 55 중 47) — 전부 상태 **미구현**

Core 값은 공통으로 "`skill_defs_web.json` 표시 정의만(`NativeSkills`가 '미이식'으로 그림), 실행기·비용·쿨 없음"이며, `_SK_MUL` 계수만 `SkillRules.SkMulTable`에 들어 있다. ★ = `skill_defs_web.json`에도 정의가 **없는** 9종(아래 §2.3). 자원·쿨·배율은 웹 코드(SKILL_LIST 44131~ · `_SK_MUL` · DPS표 대조)다.

| ID | 이름 | cat | 키·슬롯 | 자원(웹) | 쿨(웹) | 배율·공식(웹) | 문서 값 | 상태 | 비고 |
|---|---|---|---|---|---|---|---|---|---|
| ★chargeBoost 스킬 본체 | 사슬기동:충돌 | move | Shift | ST `stCost('charge')` 50×(1+(Lv−1)×.45) | 3스톡·5초 | `meleeRef×_skMul(8,6.4)×pAtkMul×거리배율×_fuseMul` | DPS표 §1 일치 | 미구현(§2.1 부분 참조) | Unity 정의 파일엔 `charge` 의사 항목(비용 null) |
| magicBlink | 사슬기동:화염 | move | Shift(합체) | MP `mpCost('blink')` 50×(1+(Lv−1)×.3) | 없음 | `_skMul(4,3.2)`, 화염길 ×0.5, 티어 ×15/30/50 | 2_1·DPS표 일치 | 미구현 | |
| ghostWalk | 뇌전걸음 | def | Ctrl 후보 | 무료 | 1200f | `_skMul(4,3.2)×(1+적수×.1)`, 유령 `min(300,120+(Lv−1)×18)`f | 일치 | 미구현 | |
| ★bladeDash | 전격이동 | move | 더블탭(마법사 계열 전용) | MP `(10+(Lv−1)×5)×.7`+게이지 31.5 | 없음 | `_skMul(3.5,2.1)` 20f 틱 | 일치(2026-10-27 개정) | 미구현(전사는 구르기로 대체) | |
| whirlwind | 회전참 | phys | LMB | ST `30+(Lv−1)×5`/초 | 없음 | `_skMul(25,24)`, 히트 간격 `max(3,⌊15/(spd×statDex)⌋)` | 일치 | 미구현 | |
| detonate | 기폭팔 | def | Q(합체) | 패링 흡수 | 없음 | `_skMul(8,6.4)×tier(19/32/48)+흡수×단계×2.5` | 일치 | 미구현 | |
| ★fanShot | 만화방창 | bow | T 자동 | ST `2+Lv` | 없음 | 발당 `⌊base×Lv/3×2⌋+⌊ST×1.5⌋`, 3발 | 일치 | 미구현 | |
| omniBeam | 멸살광선 | magic | RMB 홀드 | MP `⌊10×(1+(Lv−1)×.18)⌋`/초 | 과부하 300f | `_skMul(.75,.6)×pBeamMul`, 15판정/초 | 일치 | 미구현 | |
| elemMissile | 원소추적탄 | bow | RMB | `mpCost('magic')` | 없음 | `_skMul(2,1.6)`÷발수, `min(6,⌊3+(Lv−1)×.33⌋)`발 | 일치 | 미구현 | |
| ★guardian | 악의 보호자 | summon | 패시브 | 없음 | 3초 생성 | 구체 `2+(Lv−1)` | 일치 | 미구현 | |
| maliceHunt | 악의 사냥 | bow | 1~4 | 악의 30(실 15)+ST 50 | `max(600,900×(1+cdRed))` | `_skMul('maliceHuntBurst')(28,22.4)`, 관통 `800+(Lv−1)×20+…` | 일치 | 미구현 | SKILL_LIST `cd:300`은 표시값·코드 900f(DPS표가 이미 정정) |
| venomBlade | 독사 | bow | Shift(마법 슬롯) | ST 40 | 900f | `_skMul(3,2.4)`, 독 DOT | 일치 | 미구현 | |
| ltnChaser | 뇌전추격자 | bow | 1~4 | ST 40 | 720f | `_skMul(4,3.2)`, `1+Lv`발 | 일치 | 미구현 | |
| maliceMortar | 폭풍소환 | magic | 1~4 | MP `mpCost('mortar')` | 660f | `_skMul(10,8)`, 범위 `400+(Lv−1)×18`, 흡인 `2+Lv×.1` | 일치 | 미구현 | |
| boneWall | 해골무덤 | magic | 1~4 | 악의 12(실 6) | 2스택/1500f | `⌊meleeRef×STR×pAtkMul×_skMul(9,7.2)⌋` | 일치 | 미구현 | |
| blackStar | 블랙 | ult | Z | MP 30% | 7200f | 피해 없음, 흡인 `1500+Lv×100` | 일치 | 미구현(Z 분기 빈 블록) | |
| lavaSummon | 탄막블랙홀 | ult | Z | MP 30% | 7200f | `×8`→Lv20 ×80, 흡수 +3%/발 | 일치 | 미구현 | |
| execution | 처형 | ult | X | HP·MP·ST 10% | 300f | 보스HP 20%(+2%/Lv)+무기뎀×30(+21%/Lv)+HP30% | 일치 | 미구현 | |
| needleShot | 만화방창 II | bow | T 자동 | ST 8 | 90f | `_skMul(4,3.2)`, `2+⌊(Lv−1)/5⌋`발 | 일치 | 미구현 | |
| arcLaser | 얼음송곳 | magic | E 홀드 | MP `8+(Lv−1)`/초 | 없음 | `_skMul(8,6.4)`÷4틱/초 | 일치 | 미구현 | |
| fireBeam | 업화선 | bow(마법식) | RMB 차징 | MP `⌊50×(1+(Lv−1)×.12)⌋` | `⌊60/pMagicSpd⌋` | `_skMul(3,2.4)×pBeamMul×max(10,초×40)` | FIREBEAM_LOCALIZATION 일치 | 미구현 | |
| maliceDome | 신의영역 | def | 1~4 | MP 60 | 1500f | 피해 없음 | 2_1에 행 없음 | 미구현 · **문서 없음** | 2_1 전체 분류표·DPS표에 maliceDome 행 없음 |
| fireAura | 지옥진 | magic | RMB | MP 100 | 720f | `_skMul(10,8)×_fuseMul`, 12f마다 2% | 일치 | 미구현 | |
| plagueBurst | 폭독칼날 | bow(마법식) | 1~4 | 악의 15(실 8) | 900f(최소 600) | `_skMul(7,5.6)`, 관통 +100 | 일치 | 미구현 | SKILL_LIST 툴팁 "Lv당−0.5초"는 2026-04-18 변경과 불일치(DPS표 정정 완료) |
| maliceStorm | 악의폭풍 | magic | 1~4 | 0(boneStorm·elecRepent MP 50) | 1200f | `_skMul(14,11.2)`, 18f 틱 | 일치 | 미구현 | |
| darkPillar | 악의기둥 | magic | 1~4 | 0 | `900×(1+cdRed)` | `_skMul(20,16)`, 9기둥 30f 틱 | 일치 | 미구현 | 추천 1단계 |
| holyPrison | 구속의 영역 | tech | F | 0 | 1800f | 부활력 −15~30% | 일치 | 미구현 | |
| iceStorm | 아이스스톰 | magic | 1~4 | MP 40 | 2스택/1500f | 빙결 저항 −50% | 일치(툴팁 15초는 코드 불일치로 2_1이 정정) | 미구현 | |
| giantSlam2 | 지옥강타 2 | rage | Space | giantSlam과 동일 | 동일, pillarSlam·infernoSlam 시 420f | 동일 | 일치 | 미구현(Core `CastGiantSlam(srcId)`는 id만 받음) | |
| skyCrusher | 천공쇄기 | rage | Space | MP 80 고정 | 3충전×900f | `magicRef×INT×pMagicMul×_skMul(60,48)`, 파편 35%·화염 5%×6 | 일치(2_1 계약표) | 미구현 | |
| ★chainAssault | 기동불꽃 | move | RMB(사슬 중) | MP `20+Lv×2` | 없음 | `_skMul(3,2.4)×티어 15/30/50` | 일치 | 미구현 | |
| ★chainSlam | 기동파괴 | move | LMB/E(사슬 중) | ST `20+Lv×2` | 없음 | `_skMul(8,6.4)×티어 1/2/3`, 전방 3갈래 | 일치 | 미구현 | |
| ★chainSlash | 기동칼날개 | move | 자동(히든) | ST `15+Lv×2` | 없음 | `_skMul(3.5,2.8)`, 4f 리셋 | 일치 | 미구현 | spCost 0, Lv200(문서) — 코드 `reqLv` 없음, 합체 조건만 |
| peaceShield | 평화의보호 | def | Q(선택 시) | MP 10/초(+5%/초) | 없음 | HP 5%/초→10%, 보호막 100→200px | 일치(2_1 수치표) | 미구현 | Q 무지개탄 패링 계약은 §7 금지 범위 밖(변경 없음) |
| ★hellRay | 참회 | magic | RMB(히든) | MP 100/충전 | 600f/충전 | `_skMul(5,4)×pBeamMul` | 일치 | 미구현 | spCost 0 |
| ★shieldThrow | 불꽃칼날 | def | E 자동(기본 합체) | 0 | 단독 720f/합체 `max(120,720−15L)` | 파동 반사 base×1.5 | 일치 | 미구현(§2.1 E 부분 참조) | Unity 정의 파일은 아이콘만 maliceSwipe에 매핑 |
| weakPhys/weakMag/weakPj/weakRev | 파쇄·침식·관통·부활의 영역 | tech | F | 0 | 1500f | 저항 −10%(+1%/Lv)/부활력 +10% | 일치 | 미구현 | 4행 |
| blueShot | 푸른비 | bow(마법식) | RMB 토글, Lv300 | MP `⌊100+(Lv−1)×1.5⌋`+barrage `⌊100+(Lv−1)×11.1⌋` | 300f | `_skMul(1.8,1.44)÷5` | 일치 | 미구현 | reqLv 300 |
| burstLoop | 버스트루프 | magic | RMB 홀드, Lv700 | 최대MP 10%/초 | 없음 | `max(10,⌊base×_skMul(5,4)⌋)`, 단계 배율 미적용 | 일치 | 미구현 | spCost 0, reqLv 700 |
| voidScarecrow | 유령 허수아비 | summon | 1~4 | 0 | 1200f | 흡수 `20+(Lv−1)×3` | 일치 | 미구현 | |
| explodeScarecrow | 폭발 허수아비 | summon | 1~4 | 0 | 1200f | `max(고정,HP%)×falloff` | 일치 | 미구현 | |
| ancestorSummon | 전대 소환 | summon | 1~4 | 최대MP 30% | 1500f | `_skMul(6,4.8)×부위×(1+⌊(Lv−1)/5⌋×.25)` | 일치(DPS표 긴 행) | 미구현 | 유골함 의존 |
| ghostXbowTurret | 공성쇠뇌 | bow | 1~4, Lv500 | ST 100 | 1200f | 터렛 +50% | 일치 | 미구현 | reqLv 500 |
| timeWarp | 시간왜곡 | def | Ctrl, Lv500 | MP `50+5×Lv` | 2700f | 되감기 `3+(Lv−1)×.105`초 | 일치 | 미구현 | spCost 15, reqLv 500 |
| thunderStake | 뇌전창 | magic | 1~4 | MP 50/개 | 5스택/720f | `_skMul(2.4,1.6)`, 아크 `(A+B)×.0875/20f`, `_tsMaxT=900+(Lv−1)×30` | 공식표가 600f/900f 차이를 이미 표기 | 미구현 | 문서 내부 미확정 항목(공식표 2026-10-16 절) |

### 2.3 Unity 스킬 정의 데이터 누락 (★)

`Resources/Data/skill_defs_web.json`(2026-10-26 추출, 46 스킬 + 의사 항목 `charge`·`parry`)에 웹 SKILL_LIST(55)의 **chargeBoost, bladeDash, fanShot, guardian, chainAssault, chainSlam, chainSlash, hellRay, shieldThrow** 9종이 없다. `NativeSkills`는 이 파일을 스킬 창의 유일한 정의 원본으로 쓰므로 K 창에 이 9종은 "미이식"으로도 뜨지 않는다. **상태: 불일치(Unity 데이터↔웹)**. 수정은 데이터 재추출(BL-05)이며 Core 변경이 아니다.

---

## 3. 합체·성급표

Core에는 합체가 전혀 없다(`_fused`·`_fuseStar`·`_fuseMul`·흡수 판정·합체 강화 비용 모두 없음, 성급 데이터도 `skill_defs_web.json`에 `host` 플래그만 있음). 아래 표의 "Core" 열은 전부 **미구현**이고, 비교는 문서↔웹이다. 성급 = `_FUSE_GEM_GROUPS[k].star || _FUSE_PAIRS[k].length`(44496~44501). 합체 SP = 성급×3, 강화 SP = `1+(성급−1)`(Lv≥9: 2~3성 6, 4성+ 8).

| 합체키 | 이름 | 호스트 → 흡수(웹 `_FUSE_PAIRS`) | 성급(웹) | minLv(웹 그룹) | 문서 등록 | 웹 등록 | 상태 |
|---|---|---|---|---|---|---|---|
| dimBreach | 기동:기습 | chargeBoost → magicBlink | 2 | 5 | ○ | ○ | 일치 |
| dimSlam | 기동:파쇄 | + chainAssault | 3 | 10 | ○ | ○ | 일치 |
| dimThunder | 기동:전폭 | + chainSlam | 4 | 15 | ○ | ○ | 일치 |
| dimRush | 기동:칼날개 | + chainSlash | 5 | 20 | ○ | ○ | 일치 |
| dimBlast | 기동:섬멸 | + giantSlam | 6 | 25 | ○ | ○ | 일치 |
| whirlDet | 회전기폭 | whirlwind → detonate | 2 | 5 | ○ | ○ | 일치 |
| slamStorm | 지진폭풍 | + giantSlam | 3 | 10 | ○ | ○ | 일치 |
| stormBeam | 암전나선 | whirlwind → detonate·giantSlam·fanShot·omniBeam·elemMissile | star 4 | 15 | ○ | ○ | 일치(문서 "숙련 각 3h" 조건은 §3 주석 참조) |
| stormBurst | 암전폭류(히든) | + burstLoop | star 5 | 30 | ○ | ○ hidden | 일치 |
| sixFuse | 만화광선 | fanShot → omniBeam | star 2 | 5 | ○ | ○ | 일치 |
| elemFuse | 추적암전 | omniBeam(승격) ← fanShot·elemMissile | 3 | 10 | ○ | ○ | 일치 |
| bladeFuse | 악의 해방 | maliceHunt → guardian | 2 | 5 | ○ | ○ | 일치 |
| **bladeEcho** | 추적전격 | maliceHunt → bladeDash | star 2 | 1 | 호스트→흡수 표·31개 목록에 **없음**(추적전격_합체 문서에만) | ○ | **불일치(문서 누락, 2_1이 "`_isFuseUp` 목록에 없음"만 적음)** |
| iceMortar | 얼음소용돌이 | maliceMortar → iceOrb | 2 | 10 | ○ | ○ | 일치 |
| boneStorm | 해골번개 | maliceStorm → boneWall | 2 | 5 | ○ | ○ | 일치 |
| elecRepent | 참회 귀환 | maliceStorm → hellRay(+boneWall 흡수 유지) | 2 | 10 | ○ | ○ | 일치 |
| shieldFuse | 불꽃칼날 | maliceSwipe → shieldThrow | 2 | 1 | ○(기본 보유) | ○ | 일치 |
| plagueFuse | 독혈해방 | + plagueBurst | 3 | 10 | ○ | ○ | 일치 |
| plagueVenom | 독사해방 | + venomBlade | star 4 | 15 | ○ | ○ | 일치 |
| holyFuse | 결계의 영역 | holyDome → holyPrison | 2 | 5 | ○ | ○ | 일치 |
| holyIce | 물의 영역 | + iceStorm | 3 | 10 | ○ | ○ | 일치 |
| holyWeak1~4 | 파쇄·침식·관통·권능의 영역 | + weakPhys/weakMag/weakPj/weakRev | star 4·5·6·7 | 15·20·25·30 | ○ | ○ | 일치 |
| pillarSpike | 기둥가시 | darkPillar → spikeTrap | 2 | 1 | ○ | ○ | 일치 |
| pillarSlam | 기둥강타(히든) | giantSlam2 → darkPillar | 2 | 1 | ○ | ○ | 일치 |
| infernoSlam | 지옥강타 2 | giantSlam2 → fireAura | 2 | 1 | ○ | ○ | 일치 |
| siegeGhost | 공성유령 | ghostXbowTurret → voidScarecrow | star 3 | 1 | ○ | ○ | 일치 |
| dualScarecrow | 쌍둥이허수아비 | voidScarecrow → explodeScarecrow | star 2 | 1 | ○ | ○ | 일치 |
| thunderGhost | 전격의창 | bladeDash → thunderStake | star 2 | 1 | ○ | ○ | 일치 |
| timeStep | 시간걸음 | timeWarp → ghostWalk | star 2 | 500 | ○ | ○ | 일치 |

- 합계: 웹 `_FUSE_PAIRS` **33개**, 문서 호스트→흡수 표 32개(bladeEcho 누락), 문서 "등록된 합체 전체 목록 **31개**"·절 제목 "19종 + 히든"은 모두 현행 수와 다르다 → 문서 정리 대상(BL-06). 고유 성급 `_STAR_OVER={chainAssault:2,chainSlam:3,chainSlash:4,hellRay:2}` 중 **hellRay 2★**가 문서 성급 규칙 절에 없다(BL-06).
- 흡수 규칙(`_getAbsorbed`·호스트 승격·`_syncActiveSkAfterReset`)과 `_fMap` 제거 사실은 문서가 웹과 같다(코드 대조 5d910bad6 주석 유지).
- **사용자 결정 1**: 2_1 "합체 수행 방법"은 "선행 체인·숙련도 조건 없음(2026-05-26 전면 제거)"인데 같은 문서의 stormBeam 행은 "phys/def/magic 숙련 각 3h"를 요구하고, 웹에는 `_CATPROF_REQ=600`·`_fuseReqProf`(44560·44607)가 남아 있다. 어느 쪽이 설계인지 문서가 서로 충돌하므로 결정 필요. 멈추지 않고 §7 BL-06에 올린다.
- **사용자 결정 2**: `_FUSE_GEM_GROUPS.minLv`(5~30, timeStep 500)는 데이터에만 있고 코드 참조가 없다(`.minLv` 사용 0건). 문서에도 합체별 minLv 표가 없다. 합체 최소 캐릭터 레벨을 설계로 둘지(Unity 이식 시 게이트로 쓸지) 결정 필요.

---

## 4. 추천빌드(SKILL_REC_PATH) 대조

웹 `SKILL_REC_PATH`(44094~44109) 15단계. Core에는 추천 자동(`_skillRecAuto`)·일괄 레벨업이 없고, 단계 스킬 중 Core에 실제로 있는 것은 아래 "Core" 열이다.

| # | 단계(웹 phase) | 웹 skills | 웹 fuse | 문서 표 | Core 보유 | 해금 조건(웹 reqLv·spCost) | 상태 |
|---|---|---|---|---|---|---|---|
| 1 | 악의기둥+가시덫 | darkPillar, spikeTrap | pillarSpike | 일치 | spikeTrap만 | 둘 다 sp 10, 악의 100/80, reqLv 0 | 미구현(darkPillar·합체) |
| 2 | 해골무덤+악의폭풍 | boneWall, maliceStorm | boneStorm | 일치 | 없음 | sp 10, 악의 100/90 | 미구현 |
| 3 | **"3. 전격의창+아이스스톰"** | **thunderStake, bladeDash, iceStorm** | **thunderGhost** | 문서: "3. 뇌전창+아이스스톰(2026-10-27 개정)", skills thunderStake·iceStorm, 합체 없음, 그러면서 "추천 실행 배열은 변경하지 않았다" | 없음 | — | **불일치(문서↔웹: 배열·제목·합체 모두 다름. 문서가 개정했다고 쓴 내용이 코드에 없음)** |
| 4 | 이동+사슬 | chargeBoost, magicBlink, chainAssault, chainSlam | dimBreach | 일치 | chargeBoost 기본 경로만 | sp 10×4 | 미구현 |
| 5 | 칼날+역병 | maliceHunt, guardian, plagueBurst | bladeFuse | 일치 | 없음 | sp 10×3 | 미구현 |
| 6 | 💀 필살기 선택 | blackStar, lavaSummon, execution (pick) | — | 일치 | 없음(Z 분기 빈 블록) | sp 10 | 미구현 |
| 7 | 멸살+만화+원소 | omniBeam, fanShot, elemMissile | elemFuse | 일치 | 없음 | sp 10×3 | 미구현 |
| 8 | 허수아비 세트 | voidScarecrow, explodeScarecrow | dualScarecrow | 일치 | 없음 | sp 10×2 | 미구현 |
| 9 | 방패 합체 | maliceSwipe, shieldThrow | shieldFuse | 일치(1레벨 기본 보유, 강화 추천만) | E 타격만 | 기본 보유 | 부분 |
| 10 | 폭풍소환+얼음보주+뇌전걸음 | maliceMortar, iceOrb, ghostWalk | iceMortar | 일치 | iceOrb만 | sp 10×3 | 미구현 |
| 11 | 신성 영역 | holyDome, holyPrison | holyFuse | 일치 | holyDome만 | sp 10 | 미구현 |
| 12 | 6단합체: 폭풍빔 | whirlwind, detonate, giantSlam, fanShot, omniBeam, elemMissile | stormBeam | 일치 | giantSlam만 | sp 10×6 | 미구현 |
| 13 | 신성+빙결 | iceStorm | holyIce | 일치 | 없음 | — | 미구현 |
| 14 | 지옥강타 2 | giantSlam2 | — | 일치 | 없음 | sp 10, 악의 120 | 미구현 |
| 15 | 사슬 최종 | chainSlash | dimRush | 일치 | 없음 | **sp 0**, reqLv 없음(문서 Lv200은 코드에 없음 → 합체 조건 dimRush만) | 미구현 · 문서 "Lv200" 근거 미확인(사용자 결정 3) |

- 해금 조건 요약(웹 SKILL_LIST): reqLv가 있는 스킬은 blueShot 300, ghostXbowTurret 500, timeWarp 500, burstLoop 700 뿐이며 추천 15단계 어디에도 들어 있지 않다. 추천 자동은 자원 부족·reqLv 미달·DEMO 제한을 건너뛴다(문서와 같음).
- Core `NativeSkillManagementPolicy.Supported`는 6종만 허용하므로 추천 15단계 중 Core에서 실제로 배울 수 있는 것은 spikeTrap(1)·iceOrb(10)·holyDome(11)·giantSlam(12) 4종, 합체는 0개다.

---

## 5. DPS·자원 효율 재계산 (Core 수치)

### 5.1 계산식과 입력값

| 입력 | 값 | 출처 |
|---|---|---|
| 캐릭터 Lv | 1 → `(int)(Lv×.5)=0` | SimulationState.cs:52~ |
| `BaseAttack` | 15 | SimulationState.cs:22 |
| 무기·투구 | 없음(atk 0, enh 0, flat 0), 성장 스탯 0 | 기본 시작 상태 |
| `meleeRef` | 0+0+0+15+0+0 = **15** | Simulation.EnemyBridge.cs:75 |
| `magicRef` | 0+0+0+15+0 = **15** | Simulation.Skills.cs:90~96 |
| `pAtkMul`=`Config.DamageMultiplier` | **0.7** | SimulationState.cs:31 |
| `pMagicMul`=`MagicDamageMultiplier()` | (1+0)×0.7×2 = **1.4** | Simulation.Skills.cs:99~103 |
| 최대 ST·MP | 100·100, 자연 회복 0.05/8 per f(idle) = **0.375/s** | SimulationState.cs:23·26 / Simulation.cs:85~87 |
| 프레임 | 60f = 1초 | — |
| 공격 템포 | wSwing 5f + wRecover `(int)(16/(.45×1))`=35f → **40f/타 = 1.5타/초** | Simulation.cs:116·139 |

표의 "배율" 열은 ref=1·passive=1 기준이라 기존 문서 표(84×, 13.2× …)와 직접 비교되고, "Lv1 피해" 열은 위 입력으로 Core가 실제로 내는 정수다(`Js.Int` 절사 포함).

### 5.2 결과

| 스킬 | 배율(ref=1) | Lv1 피해(Core) | 템포 | DPS(Core, 단일 대상) | 자원/초 | 효율(피해/자원 1) | 기존 표 값 | 차이 |
|---|---|---|---|---|---|---|---|---|
| 기본공격 | ×6 | `(int)((15+15)×6×.7)`=126 + 보너스 `(int)(5×1.5)`=7 → **133** | 40f | 133×1.5 = **199.5** | ST 5×1.5 = **7.5** | 26.6/ST | 자원소비량표 "기본공격 초당 ~46 ST(23×2회/초)" | **차이 ①**: 평타 ST는 5 고정, 1.5타/초 → 7.5 ST/s. "23"은 기검참 Lv7 비용 |
| kiSlash Lv1 무충전 | 7×12 = ×84/타 (+평타) | 검기 `(int)(15×7×.7×12)`=**882** + 근접 126+15 = 1023/타 | 40f | **1534.5**(검기만 1323) | ST 10×1.5 = **15** | 102/ST | 공식표 "84×/타" ✓; DPS표 "무충전 ~0.45초(공속), DPS ~22.2" | **차이 ②**: Core 공속은 0.667초/타(spd .45 기준, 웹 식 동일). 0.45초는 어느 입력으로도 재현 안 됨 |
| kiSlash Lv10 | ×401.52 | `(int)(15×7×.7×57.36)`=**4215** | 40f | 6322(검기만) | ST 28×1.5 = **42** | 150/ST | 공식표 401.52× ✓ | — |
| kiSlash Lv20 | ×754.32 | `(int)(15×7×.7×107.76)`=**7920** | 40f | 11880 | ST 48×1.5 = **72** | 165/ST | 754.32× ✓ | — |
| kiSlash 3타 풀차지(120f) | 3타 ×8 | 882·882·**7056** + 근접 141×3 | 40+40+120+40 = 240f | 9243/4s = **2310.8** | 30 ST/4s = 7.5 | 308/ST | KISLASH_HOLD 2/4/8배 ✓ | — |
| fireball Lv1 | ×13.2 직격 + ×7.92 폭발 | 직격 `(int)(15×1.4×13.2)`=277 + MP 보너스 20 → **297**, 폭발 `(int)(297×.6)`=**178**, 중독 풀 +356(600f) | 7f+12f = 19f/발(홀드 연사) | (297+178)×3.158 = **1500**(중독 제외) | MP 10×3.158 = **31.6**(MP 100 → 10발 3.2초) | 47.5/MP | 스킬_밸런스_리포트 "fireball 14.0/~0.7초=~20/초", DPS표 "10~20 효율" | **차이 ③**: 현행 연사 간격 19f(0.317초). 두 표는 2026-04 수치(리포트는 "이력" 표기 있음) |
| spikeTrap Lv1 | ×10.5/틱 | `(int)(15×1.4×14×.75)`=**220**/틱 | 25f 틱, 600f | 220×2.4 = **528**/적, 총 5280/적 | 악의 5/10초 = 0.5 | 1056/악의 | DPS표 "틱 계수 10.5→90.3, 초당 2.4틱" ✓ | — |
| giantSlam Lv1 분노 0 | ×20 → ×14(pAtkMul 후) | `(int)(15×20)`=300 → `(int)(300×.7)`=**210** | 32f 동작, 쿨 1800f | 210/30s = **7** | ST 50 + 악의 10 /30s | 4.2/ST | 공식표 Lv1=20 ✓ | — |
| giantSlam Lv1 분노 100 | ×400 | `(int)(15×20×20)`=6000 → **4200** | 쿨 1800f | **140**/s | 동일 | 84/ST | "분노100 기본 20배" ✓ | — |
| giantSlam Lv10 분노 0 | ×105.5 | `(int)(15×105.5)`=1582 → **1107** | 쿨 `max(60,1800−108)`=1692f | 39/s | ST `min(252, 90)`=**90**(mst 100 캡) | — | 자원소비량표 "Lv10 252(캡 전)" ✓ | — |
| holyDome Lv1 | 회복 (10+2)/60 = 0.2/f | HP·MP·ST 각 **12/s**, 지속 750f → 각 **150** | 쿨 1800f | 회복 150×3 / 30s | 0 | — | DPS표 "10+Lv×2/s, 12+Lv×0.5초" ✓ | — |
| iceOrb Lv1 | base ×8 → 칼날·파쇄 각 ×2.4 | base `(int)(15×1.4×8)`=168 + MP 보너스 100 = 268; 칼날 **80**×8발, 파쇄 **80**(r 105) | 보주 ≤120f, 쿨 1200f | 전탄 명중 720 / 20s = **36** | MP 50/20s = 2.5 | 14.4/MP | DPS표 "50 MP, 20초, 효율 2.5" ✓ | — |
| E 칼등 처내기 L1 | ×2.0 → ×1.4 | `(int)(15×2×1)`=30 + 보너스 7 = 37 → `(int)(37×.7)`=**25**, 반경 70 | sBash 20f + sRecover 28f = 48f | 25×1.25 = **31** | ST 5×1.25 = 6.25 | 5/ST | 공식표 "2.0×(1+(Lv−1)×.21)" ✓ | — |
| E 풀차지(kiGather, ×3) | ×6.0 | `(int)(15×2×3)`=90 → **63**, 반경 210 | 홀드 ≥ 186/2 = 93f + 48f | — | ST 5 | — | E_BASE "풀차지 1.5초" ✓(93f≈1.55초) | — |

- **차이 ④**(스킬_밸런스_리포트 "B. DPS 효율" 절 전체): bladeShot·energyShot 등 삭제 스킬과 2026-04 템포를 기준으로 쓴 순위다. 문서 상단에 "과거 비교/순위는 이력"이 있으므로 수정이 아니라 절 제목에 "이력(2026-04-18)"을 붙이는 정리 대상(BL-06).
- Core 수치로 본 균형 메모(제안 아님, 사실만): 전사 Lv1 시작 상태에서 초당 피해는 기검참(1.5k) ≈ 악의구 연사(1.5k, MP 3초 한정) ≫ 가시덫(0.5k/적, 지속) ≫ 지옥강타(분노100 0.14k/초 환산, 단발 4.2k) > 평타(0.2k). 스킬_밸런스_리포트의 "역할군 내 50% 규칙" 재검은 합체·장비가 들어온 뒤가 맞다.

---

## 6. 빈 곳 (설계만·코드만·관례상 필요)

| 구분 | 항목 | 근거 | 트랙 |
|---|---|---|---|
| 설계·웹에 있고 Core에 없음 | 합체 전체(33), `_fuseMul`, 흡수·호스트 승격, 합체 강화 비용 | §3 | 시스템 |
| 〃 | Z 필살기 3종(분기 빈 블록), X 처형 | Simulation.Skills.cs:161 | 시스템 |
| 〃 | 추천 자동·일괄 레벨업·스킬 리셋 환불 공식(`_skillSpentSp` ≈ `ResetRefund`는 있음) | NativeSkillManagementPolicy.cs:18~19 | 시스템 |
| 〃 | holyDome HP 자연회복 ×2(`_hdMul`) | §2.1 | Core |
| 〃 | 불꽃칼날 파동 피해·E 투사체 반사(물리탄 반사, 마법탄은 shieldFuse+`_stWingT`) | PlayerCombat 헤더 | Core |
| 〃 | giantSlam 분노 20당 용암 분출(`_addLavaErupt`) | §2.1 | Core(+화면) |
| 〃 | fireball 투구 bonusRange·pDotPool, meleeRef/magicRef 봉인 ×0.3, `_cdRed` 유니크 항, 지옥강타 `rageSkCrit/rageSkDmg` 어픽스 | §1·§2.1 | Core(장비 입력) |
| 〃 | chargeBoost 스킬 본체(3스톡·쿨 5초·`_cbBaseDmg`), `ChargeBoostLevel`·`MaliceSwipeLevel`·`ShieldThrowLevel` 입력(현재 0 고정) | Simulation.PlayerCombat.cs:18 | Core |
| 〃 | 스킬 정의 9종 데이터 | §2.3 | 데이터 |
| 코드에 있고 문서에 없음 | maliceDome(신의영역) 행이 2_1 분류표·DPS표에 없음 | §2.2 | docs |
| 〃 | `_STAR_OVER.hellRay=2`, bladeEcho 합체 행, `_FUSE_GEM_GROUPS.minLv`(미사용 데이터) | §3 | docs·사용자 결정 |
| 〃 | Core `NativeSkillManagementPolicy.CanEquip` 슬롯 규칙(1~4: spikeTrap·iceOrb만, F: holyDome, Space: giantSlam, Ctrl: iceOrb, RMB: fireball, LMB: kiSlash)은 Unity 전용 정책 — 2_1에 "Unity 현행" 행이 없음 | NativeSkillManagementPolicy.cs:15 | docs |
| 양쪽에 없지만 ARPG 관례 | 스킬 툴팁의 실시간 수치(현재 장비 반영 피해·쿨·비용), 쿨다운 숫자 표시, 자원 부족 시 슬롯 흐림, 스킬 레벨 변화 미리보기 | — | **화면 트랙**(표시만) |
| 〃 | 스킬 리셋 비용·확정 대화(Core는 `RequestReset`/`ResolveReset`로 골격 있음) | NativeSkills.cs:27~28 | 시스템(UI는 화면 트랙) |

죽은 항목(5): ① `_SK_MUL`·`SkMulTable`의 `blueShell`·`blastShot`(bladeShot·blastShot 2026-04-10 삭제 뒤 잔재, Core도 복사) ② 웹 `_COST_BASE`·`_COST_SK`·`_COST_DPS`의 bladeShot·blastShot·exBolt·finisher 키(호출 스킬 없음, Core에는 없음) ③ 스킬데미지공식표 "이동 스킬" 표의 "지옥강타 1 충격파(giantSlam charge) 300/390 ×거리배율" 행(해당 코드 경로 없음) ④ Core `RageMalice.SlamResult.Bombs`·`BonusPercent` 계산 뒤 미사용 ⑤ 웹 fireZone 틱 주석 "적당 최대 2존"(코드는 1).

---

## 7. 백로그 (우선순위 순)

열: 무엇을 / 왜 / Core 변경 여부 / 크기 / 필요한 사용자 결정 / 수용 기준. `CP-SK-nn`은 Core 변경 제안 번호다. 상위 10개(BL-01~10)는 구현 브리프로 바로 쓸 수 있게 수용 기준까지 적었다.

| # | 무엇을 | 왜 | Core | 크기 | 사용자 결정 | 수용 기준 |
|---|---|---|---|---|---|---|
| BL-01 | **CP-SK-01** holyDome 안 HP 자연회복 ×2(`_hdMul`)를 `Simulation.cs` 회복 줄에 넣는다(ST·MP는 그대로) | 웹·문서가 모두 요구하는 1-1 핵심 생존 기능이며 Core에 없다 | 변경 | S | 없음 | ① 돔 안 idle에서 HP 회복량이 돔 밖의 정확히 2배, ST·MP 회복량은 돔 밖과 동일(단위 테스트) ② 플랫 회복 `(10+Lv×2)/60`은 불변 ③ 웹 32713~32715와 수치 대조표 첨부 ④ docs 2_1 영역표·자원리젠 문서를 "HP만 ×2"로 정정 |
| BL-02 | **CP-SK-02** 불꽃칼날 파동(`_autoShieldThrow`) + E 물리탄 반사(기본 E의 `ECanReflect` 물리 경로) | 기본 E가 1레벨부터 보유하는 설계인데 Core는 타격만 있다. 데모 1-1의 첫인상(E 손맛)에 직결 | 변경 | L | 없음 | ① 파동: 쿨 `max(120,720−15L)`, 배율 `M=(1+.05(L−1))×clamp(chg,1,3)`, maxDist 210M·r 50M·폭 95M·속도 12, 피해 base×1.5, 수명 120f를 웹 `_autoShieldThrow`와 오라클 PASS ② E 반사: `ParryRules.ECanReflect` 판정 그대로, blackBean은 E 반사 불가 유지(§7 금지) ③ 기존 Q 패링 수치·`docs/2_3` 무변경 ④ 실게임 캡처 1장(파동 진행) |
| BL-03 | **CP-SK-03** giantSlam 분노 용암 분출: 분노 20당 1개(`⌊rage/20⌋`), 위치 `80+i×35+rand40`px, 반경 `120+i×30`, 피해 인자 `60+i×8`, `_addLavaErupt(...,true)` | 분노 100 지옥강타의 체감(문서 "분노100 1방")의 절반이 분출 연출·피해다 | 변경(+표현) | M | 없음 | ① `RageMalice.SlamResult.Bombs` 사용, 위치·반경·피해를 웹 46473~46478 + `_addLavaErupt`와 대조표로 일치 ② 분노 0이면 0개 ③ 표현 레이어는 좌표·반경만 읽는 이벤트 1개(`MaliceOrbExploded` 방식) |
| BL-04 | 툴팁 정정 4건(§2.1 불일치): giantSlam "범위400"→`500+(Lv−1)×15`, iceOrb "MP 40·쿨 20초·뎀+15%"→`⌊50×(1+(Lv−1)×.35)×pMagicCost⌋`·`20→10초`·`_skMul 8+(Lv−1)×3.2`, holyDome "초당+10·12초"→`10+Lv×2`·`12+Lv×0.5초`, fireball "최대+120%, 3초 해제"→"10단 +300%, 해제 없음" | 수치 1이라도 다르면 바로 고친다(CLAUDE.md §5). Unity `skill_defs_web.json`이 같은 문구를 들고 있다 | 없음(데이터·표시) | S | 없음 | ① `skill_defs_web.json` desc/descEn 4건 수정, 29언어 키를 `번역대상_전체목록.md`에 No. 등록(§8 후보) ② 웹 SKILL_LIST는 main 유지보수 범위라 "oracle 차이"로만 기록(웹 수정은 별도 승인) ③ NativeSkills 캡처 1장에서 새 문구 확인 |
| BL-05 | `skill_defs_web.json` 재추출: 누락 9종 추가(§2.3), `charge`·`parry` 의사 항목 유지 여부 결정, SKILL_LIST 55 전부 포함 | K 창이 웹 스킬 9종을 아예 그리지 못한다 | 없음(데이터) | S | `charge`·`parry` 의사 항목을 남길지(권고: 남기고 `pseudo:true` 표시) | ① `skills` 길이 55(+의사), id 집합이 웹 SKILL_LIST와 같다(스크립트 검증) ② 기존 좌표·슬롯 후보·설명 보존 ③ NativeSkills 로드 예외 0 |
| BL-06 | docs 정정 묶음(Core 변경 없음): ⓐ 2_1 분류표 fireball "유도 제거됨" → "유도 280px·0.35rad/4f"(2_1 우클릭 마법슬롯 표도 "넉백 5%"를 코드 `kb .005`·kbMult .1로 통일) ⓑ 2_1 시작 스킬 표에 spikeTrap(1번)·E 기본 보유 추가 ⓒ KISLASH_HOLD 거리 "250/300/350+(Lv−1)×15" ⓓ 공식표 "지옥강타 1 충격파 300/390" 행 삭제 ⓔ 2_1 합체 목록 수(19종/31개 → 33, bladeEcho 행·hellRay 2★ 추가) ⓕ 추천빌드 문서 3단계를 웹 배열(thunderStake·bladeDash·iceStorm → thunderGhost)로 되돌리거나, 배열 변경을 별도 제안으로 분리 ⓖ 스킬별_DPS표 kiSlash 공속 0.667초·자원소비량표 평타 7.5 ST/s ⓗ 스킬_밸런스_리포트 B절 제목에 "이력(2026-04-18)" ⓘ maliceDome 행 추가 ⓙ Unity 슬롯 정책 행 추가 | §2·§3·§4·§5의 문서↔코드 불일치 전부 | 없음 | S | ⓕ: 추천 3단계를 문서대로 바꾸려면 웹 배열 변경(main) 또는 Unity 추천 데이터 신설이 필요 → 결정 | ① 각 항목 수정 뒤 이 감사 표의 상태가 "일치"로 바뀜 ② `docs/2_3` 무변경 ③ CRLF 파일(추천빌드·자원리젠)은 줄바꿈 보존 |
| BL-07 | **CP-SK-04** fireball 장비·패시브 입력 연결: 사거리 `+투구 bonusRange×20`, 중독 풀 `×pDotPool`(=1+pDot×.05, EnemyBridge에 이미 있음) | Core가 0·1 고정이라 투구 어픽스와 침식 패시브가 악의구에 죽어 있다 | 변경 | S | 없음 | ① `FireballRange(lv, hm.bonusRange)`에 장착 투구 값 전달 ② `OrbExplode` 중독 풀에 `PDotPool()` 사용 ③ bonusRange T0~T4·pDot 0/10 조합 단위 테스트, 웹 33644·24597 식과 일치 |
| BL-08 | **CP-SK-05** chargeBoost 스킬 본체: `ChargeBoostLevel` 입력(학습 레벨), 3스톡·쿨 5초, `_cbBaseDmg=⌊meleeRef×_skMul('chargeBoost')×pAtkMul×_cbDistMul⌋` 경로, `MaliceSwipeLevel`·`ShieldThrowLevel`도 `Skills.Level`에서 공급 | Shift 기동이 데모 조작의 핵심인데 레벨·스톡이 Core에 없다. E 범위 보너스(+5%/L)도 입력이 0이라 죽어 있다 | 변경 | M | 없음 | ① 세 Level 입력이 `SkillBook.Levels`에서 읽힌다(E 범위 L=2에서 +5% 확인) ② 통과 피해가 레벨 1 이상에서 웹 32484 식과 일치, 미학습이면 기존 32291 식 유지 ③ 스톡·쿨 HUD 값 노출(표시는 화면 트랙) |
| BL-09 | **CP-SK-06** 합체 골격: `_FUSE_PAIRS`·`star`·`minLv`·호스트/흡수 데이터 테이블, `FuseStar(id)`·`FuseMul(id)`, 합체 수행(성급×3 SP)·강화 비용·흡수 판정, 저장(`P._fused`) | 추천빌드 15단계 중 14단계가 합체이고 `_fuseMul`이 모든 피해 공식의 인자다. 효과 구현 전에 데이터·판정부터 | 변경 | L | §3 결정 1(숙련도 조건)·결정 2(minLv) | ① 33개 합체 데이터가 Core 테이블 또는 Data JSON에 있고 웹과 집합·성급 일치(스크립트) ② `_fuseStar`·`_fuseMul`·`_skInnateStar` 오라클(Tools/skill-oracle 확장) PASS ③ 합체 수행·강화·리셋 환불 SP가 웹 `_fuseUpSpCost`·환불 공식과 일치 ④ 효과(각 합체 피해)는 범위 밖 |
| BL-10 | 죽은 항목 정리(§6): **CP-SK-07** `SkMulTable`의 blueShell·blastShot 삭제(또는 "삭제 스킬 잔재" 주석), `SlamResult.Bombs`는 BL-03에서 사용; 공식표 giantSlam charge 행 삭제; `MpCost` 기본값 7/5 차이는 주석으로 기록 | 오라클 대조 범위를 명확히 하고 재감사 비용을 줄인다 | 변경(저위험) | S | 없음 | ① 삭제 뒤 skill-oracle 전 항목 PASS(웹 `_skMul('blueShell')` 호출 없음 확인 첨부) ② 문서 행 삭제 ③ 이 감사 §6 죽은 항목 5 → 0 |
| BL-11 | 다음 이식 후보 묶음(추천 1~2단계): darkPillar(9기둥 30f 틱), boneWall(2스택), maliceStorm(18f 틱) | 추천빌드 첫 두 단계·합체 2개의 재료 | 변경 | L | 데모 v0 범위(1-1 한 판)에 넣을지 | 각 스킬 §2.2 수치 오라클 PASS, 1-1 실게임 캡처 |
| BL-12 | Z 필살기 1종(blackStar: 피해 없음·흡인) 또는 보류 결정 | 추천 6단계·Z 키가 빈 블록 | 변경 | M | 데모 v0 범위 밖 여부 | — |
| BL-13 | 추천 자동·일괄 레벨업 Core 정책(`SKILL_REC_PATH` 데이터 + 학습·합체 호출) | K 창 ⭐ 추천 탭 | 변경 | M | BL-06 ⓕ 결정 뒤 | — |
| BL-14 | 봉인(`_weaponSeal`)·`_cdRed` 유니크 항·`baseAtk` 스테이지 가산(`15+(stage−1)×2`) | 2스테이지 이후·유니크 이식 때 필요 | 변경 | S | 없음 | — |
| BL-15 | giantSlam ST 부족 시 "ST 부족!" 텍스트(Core는 deny만) | 웹과 피드백 차이 | 변경(표시 이벤트) | S | 없음 | — |

---

## 8. 번역 등록 후보 (BL-04 실행 시 등록, 이 감사에서는 미등록)

| 대상 | 현재(ko) | 정정(ko 초안) | 위치 |
|---|---|---|---|
| giantSlam desc | "…원형 진동파 발생(범위400)…" | "…원형 진동파 발생(범위 500+Lv당15)…" | skill_defs_web.json / SKILL_LIST 44199 |
| iceOrb desc | "…(MP 40, 쿨 20초). Lv당 칼날+4 뎀+15%" | "…(MP 50부터 Lv당+35%, 쿨 20초→Lv당−1초, 최소 10초). Lv당 칼날+4, 배율+3.2" | 44186 |
| holyDome desc | "…(12초 지속). 땅 위: HP/MP/ST 초당+10 리젠 + 회복력 2배 + 쿨다운 속도 2배…Lv당 범위+20 지속+0.5초" | "…(12.5초 지속). 땅 위: HP/MP/ST 초당 10+Lv×2 회복 + HP 자연회복 2배 + 지옥강타·얼음보주 쿨다운 2배…Lv당 범위+20 지속+0.5초" | 44196 |
| fireball desc | "…다음 악의구 피해 +30%씩 누적(최대 +120%), 3초간 안 맞으면 해제" | "…다음 악의구 피해 +30%씩 누적(최대 10단 +300%), 적이 죽을 때까지 유지" | 44167 |

영문(descEn) 4건도 같은 번호로 등록한다. 27개 언어는 기존 절차(전수조사 → 목록 → 번호순)대로.

---

## 9. 검증·한계

- 대조 방법: Core 파일 전부 읽음(수정 0). 웹은 `git show origin/unity/main:game.html`로 스크래치에 받아 해당 함수만 읽었다(전체 로드·실행 없음). `unity/Tools/skill-oracle`은 이 sparse checkout에 없어 **실행하지 않았다**. 수치 일치 판정은 코드 문면 대조이며, Core 주석이 가리키는 웹 줄 번호와 현행 줄 번호가 다른 곳(예: 가시덫 45654→45508, 지옥강타 46596→46448)은 현행 번호로 바꿔 적었다.
- 산출물 외 수정: `docs/CHANGELOG_SYNC.md` 절 추가, `2_1 스킬관리+합체시스템.md`·`스킬별_DPS_자원소비표.md` 맨 위에 이 감사로 가는 한 줄 안내만 넣었다(수치 본문 정정은 BL-06에서, 사용자 결정 항목과 섞이지 않게 분리).
- 멈추지 않은 충돌(사용자 결정 3건): §3 결정 1·2, §4 15단계 chainSlash Lv200. 결정 전까지 해당 행은 "사용자 결정"으로 둔다.
