# P1-002.E — 기본 근접 1타 hurtE 실행 경로 추적표 (2026-10-19)

## 입력 고정 (이 표의 전제)

원본 caller: `wSwing`(game.html 33362) → `hitArc(P.atkArc,_wRange,_wArc,~~(((P.baseAtk+(wp().atk||0)+enhMulAtk(wp().enh||0))+15)*6),_wEl,'weapon')`(37603)
→ 루프 내 `hurtE(e,dmg,ang,true,{kbMult:1,poiseMult:1.5,noPoise:false,poiseHit:false,poiseSkill:false,_lessonAttack:'weapon'},el)`(37617).

| 항목 | 값 | 근거 |
|---|---|---|
| 시작 장비 | 스타터 15장비(검 tier0 rarity0 어픽스 0개) + 가방 10 | starter_item_factory(원 64395~), Godot Main 부팅 시 `run_native_initial_starter_items` READY 필수 |
| 공격 속성 `atkEl` | 0 (물리). `_wEl=(wp().el||0)||(_lEq('_lGloveElem')>0?rand:0)` — 스타터 검 el=0, `_lGloveElem`=0 → RNG 미소비, atkEl=0 | 33360 |
| 대상 (브리프 기준) | etype0 일반몹: elite 0, mods `[]`, ib false, el=P(0), eShield=mhp, eRes=[0×7], reviveIframes 0 | mkEn 31120~ (`eShield:_hp,eShieldMax:_hp`) |
| 대상 (Godot 실 테스트) | **눈알 육괴(eye_mass)**: generic enemy.gd 유일 지원 대상. etype **4**, el **3(EL.D)**, elite 0, mods [], hp=mhp=875, eShield=eShieldMax=875, eRes=[0×7], lv1, r≈32.8 | encounters.json records 0·1 / enemy_factory `unsupported_reason` |
| 플레이어 | mkP 리터럴: baseAtk 8, lv1, hp=mhp(350), STATS 전부 0 → `_lvB()`=0 | State.source_boot_p() |
| opts | `{kbMult:1, poiseMult:1.5, noPoise:false, poiseHit:false, poiseSkill:false, _lessonAttack:'weapon'}` — 비WW, type='weapon' | 37617 |
| DOT | isDot=false | opts.dot 없음 |

etype 0↔4 차이는 각 행에 표기. **etype4(눈알 육괴)가 Godot 구현·테스트의 실제 대상**이다 (첫 스테이지에서 generic enemy.gd로 스폰되는 유일한 일반 적 2마리).

## hitArc 측 (37603~37647, hurtE 진입 전/후)

| 행 | 문장 | 읽기 | 효과 | RNG | Godot |
|---|---|---|---|---|---|
| 37605 | `_isWW=P.s==='whirlwind'` → false | P.s | — | — | 해당 없음(기본 스윙) |
| 37606 | `SFX.slash()` (type weapon) | — | 스윙 사운드 | 오디오 자체 RNG | 기존 이식: `_request_native_attack_sound("hit_arc",0)` |
| 37608 | `baseDmg=~~(baseDmg*pAtkMul()*pMeleeMul())+(P._atkBon||0); P._atkBon=0` | p_atk_mul(=1), pMeleeMul(=1), P._atkBon(=⌊ST비용×1.5⌋) | P._atkBon 소거 | — | 기존 이식: `_melee_contact` 선두 |
| 37611 | 거리/생존/arc 필터 | ens, e.r | — | — | 기존 이식: `_melee_contact` 루프 |
| 37614 | `mult=elMul(el,e.el); dmg=~~(baseDmg*mult)` | **el_mul provider**. elMul(0,3)=1 (물리→암흑) | — | — | **신규: el_mul provider 경유** (기존 단순화 경로는 미적용이었음) |
| 37617 | `hurtE(...)` | 아래 표 | 아래 표 | 아래 표 | **신규 native_normal_enemy_hurte.gd** |
| 37620~37631 | 비WW 후처리: type shield 아님 → 칼등 스킵. `mult>=2` 약점 스킵(mult=1). `G.hitStop=~~(_HS.melee*OPT.hitStop/100)` | OPT.hitStop | 히트스톱 | — | **미이식** (Godot 히트스톱 시스템 없음) |
| 37632~37643 | 원소색 히트 파티클 pCount 루프 + mult>=2 링버스트 | OPT.parts | 파티클 | 파티클당 다수 (시각 전용) | **미이식** (적 _hit_flash가 피격 피드백; 파티클·링 없음, provider rand 미경유) |
| 37646 | `_hurtFieldMobs(...)` | 필드몹 | 필드몹 피해 | — | **미이식** (필드몹 시스템 없음) |

## hurtE 본문 (42110~43119) — 이 입력에서 실제 실행되는 문장

표기: ✅=실행(효과 있음) / ○=실행(이 입력에서 수치 무변화) / ✂=단락 스킵(근거) / 🚫=미이식(건너뜀, 가짜 구현 금지).
행 번호는 game.html 절대 행.

### A. 진입 가드 ~ 사전 감산

| 행 | 문장 | 읽기 (provider/owner) | 효과 | RNG | 판정 |
|---|---|---|---|---|---|
| 42111 | `window._parryLesson?.active` → lesson 위임 | **parry_lesson_active provider** | (active면 lesson.hurtEnemy로 위임 후 return) | — | ✅ 게이트 실행, 평시 false. active면 **정지**(lesson hurtEnemy 위임은 본 범위 외 — 폴백 금지, telemetry halt) |
| 42112 | `!e||!e.alive → return` | enemy.alive | — | — | ✅ |
| 42113 | `e.hp<=0 → return` | enemy.hp | — | — | ✅ |
| 42114 | `window._btDmgLog` | 디버그 전역 | — | — | ✂ (디버그 미설치) |
| 42115 | `_shBufI++` / 43118 `finally _shBufI--` | — | shQuery 버퍼 가드 | — | ○ JS 내부 재진입 가드 — Godot 불필요(구조 전용) |
| 42117 | `_petOnAtk()` | — | 펫 공격 카운터 +1 | — | 🚫 펫 시스템 미이식 |
| 42118 | `isDot=opts&&opts.dot` → false | opts | — | — | ✅ |
| 42120 | `if(e.reviveIframes>90)e.reviveIframes=90` | enemy.native_final.reviveIframes(=0) | — | — | ○ (0이라 무변화, 게이트는 실행) |
| 42121 | `reviveIframes>0&&!isDot → 감소+return` | 〃 | — | — | ✂ (0) — 단, >0 케이스도 구현함 (감소+정지) |
| 42124~42134 | 보스 거울방어/폭발반격 | e.ib | — | — | ✂ (ib=false) |
| 42136~42158 | 레어몹 99/92/91/93, 40/41/57 특수 | e.etype | — | — | ✂ (etype 0/4) |
| 42162 | parryBlueBean 최소뎀 | opts | — | — | ✂ (opts에 없음) |
| 42164~42166 | opts.bleed / opts.poison DOT 축적 | — | — | — | ✂ (opts에 없음 → **p_dot_pool provider 이 경로에서 미호출**) |
| 42168~42171 | etype6 방패돌격병 방어 | e.etype | — | — | ✂ |
| 42172 | `_shBlocked=false` | — | 로컬 | — | ✅ |
| 42173 | `e.eRes&&e.eRes[atkEl]>0 → 감산` | enemy.eRes(=[0×7]), atkEl=0 | — | — | ○ (eRes[0]=0 → 감산 없음, 읽기는 실행) |
| 42175~42178 | etype 63/74 방어 | e.etype | — | — | ✂ |
| 42180~42182 | etype85 25% 회피 | e.etype | — | (85면 RNG) | ✂ (etype 0/4 → RNG 미소비) |
| 42187 | M14 보호막 | e.mods([]) | — | — | ○ `[].includes('M14')`=false |
| 42188 | `e._aDefM` 수호 오라 | native_final(_aDefM 없음=aura null) | — | — | ✂ (undefined) |
| 42189 | M22 동료불사: `e.mods&&!e.ib` → **shQuery(e,120) 스캔 실행** | world 적 목록(반경 120) | (M22 이웃 있으면 ×0.67) | — | ✅ 스캔 실행 — 첫 스테이지에 M22 없음 → 효과 0. Godot: world.get_enemies() 거리≤120 스캔(mods 'M22'). shQuery 셀 근사와의 차이는 결과 영향 0 |
| 42191~42195 | 몬스터 피격음: `_hitSfxCd<=0 → cd=8; _hitSfxForEtype(et); playSample(key,.3,pitch)` | etype 분류표 | 피격 사운드 | etype0(HUMANOID 폴백): key 선택 1회. **etype4(_BONE_ET): monster_hit1 pitch1.15, RNG 없음** | ✅ **기존 이식 소비자 사용**: main `_on_native_attack_enemy_audio`가 enemy_damage(raw>0, source weapon) telemetry로 동일 분류·8틱 쿨다운·동일 랜덤 폴백 수행 (오디오 전용 RNG는 원본 playSample과 동일하게 provider rand 비경유) |

### B. 배율 체인 (모두 실행 순서 고정, 스타터 장비에서 어픽스 전부 0)

| 행 | 문장 | 읽기 | 수치 | RNG | 판정 |
|---|---|---|---|---|---|
| 42197 | 감전 스택 ×(1+stk·.05) | e._shockStk(없음) | — | — | ✂ |
| 42199~42203 | atkEl===EL.L 감전 부여 | atkEl=0 | — | — | ✂ |
| 42205 | `e._cursed>0` ×1.25 | native_final._cursed? (없음→falsy) | — | — | ✂ |
| 42207 | `dmg=~~(dmg*statStr())` | **stat_str provider**(=1) | ~~ 재절단(무변화) | — | ✅ |
| 42209 | 신성력: `(_UNDEAD_ET.has(et)||_isGhoul)&&!ib → _eqAffix('antiRevive')` | **etype4∈UNDEAD → eq_affix('antiRevive') 읽기(0)**; etype0은 집합 미포함 → 어픽스 미읽기 | — | — | ○(4) / ✂(0) |
| 42211 | elemConvert: `atkEl===0&&_eqAffix>0&&rand<v&&wp().el>0` | eq_affix('elemConvert')=0 | — | **0이라 RNG 미소비 (&&단락)** | ○ 읽기만 |
| 42213 | elemFocus (atkEl>0) | — | — | — | ✂ (atkEl=0 → 어픽스 미읽기) |
| 42215~42219 | 속성별 뎀%: atkEl=0 분기 → `_pv=_eqAffix('poisonDmgPct')+_eqAffix('poisonDmgBns')` 계산 | eq_affix 2회(각 0) | — | — | ○ 읽기 2회 실행, `_pv>0&&opts.poison` false |
| 42222 | crisisBoost: `P.hp<P.mhp*.3 && …` | **player_view**(P.hp,P.mhp) | — | — | ✂ (풀피 → 어픽스 미읽기) |
| 42224 | killSlayer 버프: `P._killBuff>0` | player_view(_killBuff 없음) | — | — | ✂ |
| 42226~42228 | 전설 벨트/부츠/창: `P._lBeltT>0` 등 선행 | player_view | — | — | ✂ (P 필드 falsy → **l_eq 미읽기**) |
| 42230 | 장신구 dmgBonus 합: nc/rg1/rg2/belt/bracelet/headband×2 `.dmgBonus` ×0.01 | **State.inventory owner** | — | — | ○ 합 0 → 곱 스킵 (읽기 실행) |
| 42232 | `_predBonus(e)`: e.hp≤30%? → PASSIVES.pPred×.20 | enemy.hp/mhp, State.passives | — | — | ○ (첫 타 false; 후반 타에서 조건 true여도 pPred=0) |
| 42234 | `_hunterMul(e)`: e.isBoss/isElite/etype≥90 | enemy (isBoss/isElite 필드 없음→falsy) | — | — | ○ =1 |
| 42236~42262 | 조건부 어픽스 합연산 `_cAx` | eq_affix: abundDmg(+passives.pAbund), healthyAtk, fullLifeDmg, (lowLife/injured — 풀피라 미읽기), predDmg/overkilDmg(적HP≤30/20%일 때만), firstStrike(첫 타만), closeDmg(맨해튼≤120시), farDmg(>300시), stunDmgUp+u_eq('_uClubStun')(스턴시만), frozen/burn/poison/curse/slowDmgUp(상태시만), mobSlayer(항상: 일반몹) | 전부 0 → _cAx=0 → 곱 스킵 | — | ✅ 조건 평가·읽기 실행 (타수 진행에 따라 읽는 어픽스 집합이 변함 — HP 비율·거리 조건 그대로 구현) |
| 42263 | `dmg<1&&!_shBlocked → dmg=1` | — | 최소 1 | — | ✅ |
| 42265~42267 | `kbM=1, psM=1.5, _isPure=false` | opts | 로컬 | — | ✅ |
| 42269~42272 | `_isArrow/_isGunpowder/_isMagicDmg = false` | opts | 로컬 | — | ✅ |
| 42275~42283 | 타입별 뎀%: 근접 → `_eqAffix('meleeDmgPct')`(0) | eq_affix 1회 | — | — | ○ |
| 42285~42291 | _weakPhys/_weakMag/_weakPj/_shockDR/_blinkWeak | native_final(없음→falsy) | — | — | ✂ |
| 42295~42304 | 약점노출: `_cbAf=_eqAffix('comboBoost')`, `_cbPas=PASSIVES.pCombo` | eq_affix 1회 + passives | — | — | ○ 둘 다 0 → 블록 스킵 |
| 42306~42307 | 분노스킬: `P._rageSkCtx` | player_view | — | — | ✂ (rageSkDmg 미읽기) |
| 42309~42315 | 크리 보너스: `_crBonus+=_eqAffix('critRateMelee')*100` (비마법·비활 1회만). `_lDagForce`: `P._lNextCrit>0` 선행 false → l_eq 미읽기. `_ksFC`: opts._kiFull 없음 → 0 | eq_affix('critRateMelee') | — | — | ✅ |
| 42316 | **크리 판정** `Math.random()*100<statCrit()+_crBonus` → `dmg=~~(dmg*(statCritDmg()+0))`, G._sStats.crits++(G에 _sStats 없음→스킵) | **rand provider 1회** + statCrit()/statCritDmg() (아래 '파생 공식' 참조) | 크리 시 뎀 배율 | **RNG #1** | ✅ |
| 42317~42323 | 크리 시: _lAxeBleed(l_eq, 0), onCritExplode/Chain/Freeze/Heal/Mana/Shield(eq_affix 각 0) | 크리 시에만 읽기 | — | — | ○ (크리 시 읽기 실행, 전부 0) |
| 42328 | 전설 반지 _lRingElem: `!isDot&&atkEl>0&&…&&(G.playTime…)` | — | — | — | ✂ **atkEl=0 → 2번째 조건에서 단락, l_eq·elMul·G.playTime 모두 미읽기** (playTime NOT_READY여도 무관 — 원본 단락 순서 보존) |
| 42336 | `e.stunned>0&&!isDot → ×1.5` | enemy._stun_ticks(=0; 기본무기는 poiseHit 없음→스턴 유발 경로 없음) | — | — | ✂ |
| 42338 | `e._frozen>0 → ×1.5` | native_final(_frozen 없음) | — | — | ✂ |
| 42340 | 보스 parryBlueBean | e.ib | — | — | ✂ |

### C. 에너지쉴드 → HP 분배 (42345~42352)

| 행 | 문장 | 읽기 | 효과 | 판정 |
|---|---|---|---|---|
| 42345 | `(!isDot||shieldHit)&&e.eShieldMax>0&&e.eShield>0` | enemy.eShield(875)/eShieldMax(875) | — | ✅ **mkEn이 모든 적에게 eShield=mhp 부여 → 첫 타부터 쉴드 흡수** |
| 42346~42348 | `_shAbs=min(eShield,dmg); eShield=max(0,eShield-dmg); dmg=max(0,dmg-_shAbs)` | 〃 | **enemy.eShield 차감 (쉴드 소진 전 HP 불변)** | ✅ 신규 owner 쓰기 (`apply_native_normal_enemy_shield_write`) |
| 42350 | `_shAbs>0&&!isDot → addTxt(e.x,e.y-70,String(_shAbs),'#66ddff',45,48,…)` | — | 청색 흡수 숫자 | ✅ 기존 NativeFloatingText `emit_native_text` 사용 |
| 42351 | `dmg===0 → _shBlocked=true` | — | 로컬 | ✅ |

### D. `if(dmg>0)` — HP 피해 블록 (42354~42460; **쉴드 전량 흡수 타에서는 블록 전체 미실행**)

| 행 | 문장 | 읽기 | 효과 | RNG | 판정 |
|---|---|---|---|---|---|
| 42355 | `G._sStats` 게이트 | State.G(_sStats 없음) | — | — | ✂ |
| 42357~42358 | `G._dmgPeak` 생성/갱신 ({val,t:300}) | State.G | **G._dmgPeak 쓰기** (HUD 피크 표시용) | — | ✅ State G owner 쓰기 (표시 소비자는 미이식) |
| 42361~42368 | 흡수: lifeLeech(+injuredLeech 게이트)/manaLeech/stLeech/lifeOnHit, _uAxeLeech(u_eq) | eq_affix 4~5회 + u_eq 1회 (전부 0) | — | — | ○ |
| 42370~42379 | onHit 상태이상 8종: fire/ice/light/dark/poisonOnHit, onHitBleed/Stun/Freeze | eq_affix 8회 (전부 0) | — | **0 → &&단락, RNG 미소비** | ○ |
| 42380 | `e._alerted=true` | — | **적 인식(거리 무시 추적)** | — | ✅ enemy owner (alerted=true) |
| 42382 | 즉시반격: `s==='recover'→idle,st2=0` / `s==='idle'&&st2>5→st2=5` | enemy.state | **대기 단축** | — | ✅ enemy.gd의 st2 대응 필드는 `_contact_ticks`(기존 receive_damage와 동일 매핑: `_contact_ticks=min(_contact_ticks,5)`) — recover 상태는 generic enemy.gd 상태기계에 없음(매핑 표기) |
| 42383 | `e.hp-=dmg` | — | **HP 쓰기** | — | ✅ **기존 owner `apply_native_normal_enemy_hp_write`** |
| 42384 | `_dpsDmg+=dmg` | — | HUD DPS 누적 | — | 🚫 (HUD DPS 미이식) |
| 42386~42390 | `G._dmgPeakShow={x,y,dmg,crit}` (비quiet 단발) | State.G | **G 쓰기** (피해 숫자 표시 선택자) | — | ✅ State G owner 쓰기 (렌더 소비자 미이식) |
| 42392~42397 | 회전참 분기 | P.s | — | — | ✂ (비WW → else로) |
| 42398~42401 | `_txtPerFrame++`·예산, addParts(피 파티클), 피 스플래시 루프 | OPT.parts | 파티클 | 파티클당 다수(시각 전용) | 🚫 파티클 미이식 (provider rand 비경유 — 시각 전용 스트림, 원본도 게임플레이 판정과 비공유 아님에 유의: 원본은 동일 Math.random 스트림이지만 Godot rand provider는 게임플레이 소비 지점만 기록) |
| 42412 | `e._hitFlash=6` | — | **히트 플래시** | — | ✅ enemy owner (_hit_flash=6.0) |
| 42414 | `!e.ib&&e.s==='idle' → e._hitStun=elite>0?4:8` | enemy.state/elite | **피격 경직 8f** | — | ✅ enemy owner (_hit_stun=8; data.hit_stun_ticks=8 동일) |
| 42415 | `G._flashCol='#ffffff';G._flashT=0.08` | — | 화면 플래시 | — | 🚫 (화면 플래시 미이식) |
| 42416 | hitStop≥5, shake | — | 히트스톱/쉐이크 | — | 🚫 |
| 42417~42419 | `_addImpact(... 'slash')` | — | 슬래시 임팩트 | — | 🚫 (근접 임팩트 FX 미이식; 투사체 HitFX는 별개) |
| 42421~42435 | OnHit DoT 어픽스: poisonDot/fireDot/iceDot, lightChain, darkCurse, chainTarget | eq_affix 6회 (전부 0) | — | darkCurse 0 → RNG 미소비 | ○ |
| 42446~42460 | 냉기 프리즌 (atkEl===2) | — | — | — | ✂ |

### E. 넉백 (42462~42476; dmg>0 블록 **밖** — 쉴드 흡수 타에도 실행되나 dmg=0이라 양 0)

| 행 | 문장 | 읽기 | 효과 | 판정 |
|---|---|---|---|---|
| 42463~42464 | `isBoss=false; finalKbM=kbM=1` | e.ib | — | ✅ |
| 42466~42470 | `_isRanged/_isMH/_isBB/_isMagicProj/_noKB=false; _kbScale=1` | opts, atkEl | — | ✅ |
| 42471 | `_kbAmt=min(dmg*.25*1*1, 15)` — **dmg는 쉴드 흡수 후 잔여** | — | — | ✅ (쉴드 전량 흡수 타: 0) |
| 42472~42475 | _lClubKB (l_eq 읽기 0 → 스킵) | l_eq 1회 | — | ○ |
| 42476 | `_kbInView`(시야 내) → `e.kb+=cos/sin×_kbAmt` | 카메라 범위 | **넉백** | ✅ enemy owner `add_native_knockback`. 근접 교전은 시야 내 → in-view 분기 고정, 뷰포트 밖 좌표이동 분기는 이 입력에서 미도달(미구현·표기) |

### F. 포이즈 (42486~42498)

| 행 | 판정 |
|---|---|
| 42486 | `opts.poiseHit` **false(기본 무기)** → 블록 전체 ✂. **기본 근접 1타는 포이즈 피해 0** (poiseHit는 type==='shield' 칼등 전용). staggerBns/staggerExplosion/_lHammerShock 등 모두 미도달 |

### G. 처치 파이프라인 (42500~43117, `e.hp<=0`일 때)

| 행 | 문장 | 읽기 | 효과 | RNG | 판정 |
|---|---|---|---|---|---|
| 42502~42506 | 디코이 | e._isDecoy | — | — | ✂ |
| 42508~42511 | etype87 도플갱어 | etype | — | — | ✂ |
| 42516~42625 | 보스 부활 | e.ib | — | — | ✂ |
| 42627~42636 | **일반몹 부활 판정**: `!ib&&!_revived&&!_isGhoul` → `_revPow=0.5+⌊lv/100⌋×0.1=0.5`; `_suppress=_eqAffix('antiRevive')`(0); G._fireZones(부트 G에 없음→스캔 스킵); `Math.random()<0.5` → 성공 시 `e._revived=true;_reviveTimer=90;_reviveX/Y;` `e._reviveAsGhoul=Math.random()<0.5` | eq_affix 1회, State.G | 부활 예약 플래그 | **RNG #2 (+성공 시 #3)** | ✅ 롤 소비+플래그 기록(enemy native_final에 owner 쓰기). **실제 부활 타이머→재스폰 동작은 🚫 미이식** (적 update 루프 소관). 주의: 부활 성공이어도 아래 처치 파이프라인은 원본에서도 전부 계속 실행됨 |
| 42638~42646 | 보스 2차 판정 | e.ib | — | — | ✂ |
| 42648 | killSlayer(eq_affix 0) | 1회 | — | — | ○ |
| 42650~42655 | On-Kill: onKillHeal+hpOnKill/onKillMana/onKillStam/shieldOnKill/onKillSpeed | eq_affix 6회 (0) | — | — | ○ |
| 42658 | _uMaceExplode (u_eq 0) | 1회 | — | — | ○ |
| 42660~42669 | u_d05 귀환연료: `e._uqGwExp&&(G.playTime…)` | — | — | — | ✂ **_uqGwExp 없음(undefined) → 1번째 조건 단락, G.playTime 미읽기** (42664) |
| 42671~42686 | u_d08 잔상 (_uqHitCtx) | — | — | — | ✂ |
| 42688~42695 | u_d13 덫 (_uqFzCtx) | — | — | — | ✂ |
| 42697~42699 | _lDaggerKill/_lRingKill (l_eq 각 0) | 2회 | — | — | ○ |
| 42700~42701 | `_isBurnDeath=false; _isWhirlKill=false` | atkEl, opts, P.s | — | — | ✅ |
| 42702 | `atkTicketRelease(e)` 🚫(AI 티켓 없음) `; e.alive=false` ✅owner `; G.kills++; G._stageKills++` ✅State G `; _regKill(e)` 🚫(처치 귀속) `; _petOnKill(e)` 🚫(펫) | — | **사망 확정·킬 카운트** | — | 부분 ✅ |
| 42704~42711 | deathFX(사망 FX·사운드) | — | 시각/음향 | 내부 RNG(시각) | 🚫 enemy.gd 기존 사망 연출(충돌 해제·modulate)로 대체, deathFX 본체 미이식 |
| 42712 | 처치 히트스톱 | — | — | — | 🚫 |
| 42714~42718 | **콤보**: `G.combo++; comboTimer=min(1200,+60); comboMax` (1000콤보 텍스트 ✂) | State.G | **G 쓰기** | — | ✅ State G owner |
| 42719 | `_killAng=ang` | — | 로컬 | — | ✅ |
| 42720 | _spawnLargeMonsterDeathFx | — | 시각 | 내부 RNG | 🚫 |
| 42722 | `_addCorpse(e,ang,min(8,dmg/mhp*20))` | — | 시체 | 내부 RNG | 🚫 |
| 42724 | 화염사망 분기 | _isBurnDeath=false | — | — | ✂ |
| 42726~42731 | **고어**: `_gPick=rand<.8?common:rare`(RNG) → `_gPick[~~(rand*len)]`(RNG) → `_gL=e.ib||e.r>=18` true(r≈33) → `rand<.5?'intestine':'organ'`(RNG) | — | 고어 조각 | **RNG #4,#5,#6 (r≥18일 때 3회; r<18이면 2회)** | 롤 소비 ✅ + 시각 🚫 |
| 42732 | _addDeathImpact | — | 시각 | — | 🚫 |
| 42733 | `e._fromHole!=null` | native_final(없음=undefined) | — | — | ✂ (JS `undefined!=null`은 false) |
| 42734~42735 | 보스 사망 텍스트 | e.ib | — | — | ✂ |
| 42737~42745 | 문지기 | e._isGateGuard | — | — | ✂ |
| 42747~42754 | 잔해 드롭: `_debC=0`(elite0) | e.elite | — | **RNG 미소비 (_debC>0 false)** | ✂ |
| 42756~42762 | **킬 체인**: `G._chainCnt++; G._chainT=180`; `_chainCnt>=5&&!ib` → 리셋+`G.rifts.push({...})`+텍스트+SFX+쉐이크 | State.G | **G 쓰기 (5킬마다 균열 레코드)** | — | ✅ G 쓰기 (균열 스폰 동작 자체는 🚫 — 리프트 시스템 미이식, rifts 배열 기록만) |
| 42764~42767 | M26 복수자: **shQuery(e,200) 스캔 실행** | world 적 목록 | (M26 이웃 강화) | — | ✅ 스캔 실행 — M26 없음 → 효과 0 |
| 42769~42944 | _plagued, etype 8/15/25/28/29/51/55/57/59/60-69/70-72/79/80/84/85/88/89 | etype/플래그 | — | — | ✂ 전부 |
| 42946~42963 | **속성 사망 장판**: `!ib&&!_isDecoy&&e.el!==EL.P&&(elite>=1||rand<.2)` — **etype4 눈알육괴 el=3(D)** → RNG 롤. <0.2면 EL.D 독장판 스폰+텍스트 | e.el | 독장판 | **RNG #7 (etype0 el=P는 ✂·미소비)** | 롤 소비 ✅, 장판 스폰(_spawnBossProjectile poisonZone) 🚫 미이식 — 기록만 |
| 42965~42975 | 레어몹 | _isRare | — | — | ✂ |
| 43040~43070 | 엘리트 모디파이어 | mods.length>0 | — | — | ✂ |
| 43072~43076 | 슬라임 | _isSlime | — | — | ✂ |
| 43078~43089 | 엘리트/보스 악의 | ib/elite | — | — | ✂ |
| 43092~43096 | **물약**: `rand<1`(항상 true·소비) → `pt=ptypes[~~(rand*3)]`(소비) → `addPotion(pt,1)` 성공 시 텍스트 | — | 물약 +1 | **RNG #8,#9** | 롤 소비 ✅, addPotion(물약/퀵슬롯 시스템) 🚫 미이식 — 선택 결과 telemetry 기록 |
| 43098 | 보스 추가 물약 | e.ib | — | — | ✂ |
| 43099~43101 | `_comboPct=⌊combo/100⌋×.05; _diffPct=max(0,_diffSigned())×.10; _comboBonus` | State.G, signed_difficulty | 로컬 | — | ✅ 계산 (소비자는 addExp/엘리트 — 아래) |
| 43103 | `G.mats+=4` | State.G | **악의구슬 +4** | — | ✅ State G owner |
| 43105~43108 | 엘리트/보스 추가 악의 | ib/elite | — | — | ✂ |
| 43110 | `rollDrop(e)` | — | 장비 드롭 | **내부 RNG 다수** | 🚫 **아이템 드롭 시스템 미이식 — RNG 미소비** (이후 이 호출 경로에 추가 RNG 소비 없음 → 스트림 영향 없음) |
| 43112~43114 | `eLv=1; _expMul=1×_comboBonus;` `addExp(~~(max(5,~~(1×.4))×_expMul))` = addExp(5) | — | 경험치 +5 | — | 🚫 addExp(레벨업 체계) 미이식 — 기대값 telemetry 기록 |
| 43115 | `checkRooms()` | — | 방 클리어 체크 | — | 🚫 |
| 43116 | `G.kills%10===0 → dbSaveNow()` | State.G | 자동저장 | — | 🚫 **세이브 수정 금지(지시) — 미이식 명시** |

### 파생 공식 (hurtE가 호출하는 원본 헬퍼 — 신규 모듈 내 구현, owner에서 읽음)

| 공식 | 원본 | 입력 owner |
|---|---|---|
| `statCrit()` (27997) | `_eqLckTotal()*.025 + PASSIVES.pCrit*1.5 + rg1/rg2/nc.critRate + _eqAffix('critRate')*100 + P._crystalStats.crit` | State.stats/passives/inventory, eq_affix, player_view |
| `statCritDmg()` (27998) | `1.5 + _eqLckTotal()*.002 + PASSIVES.pCrit*.08 + _eqAffix('critDmgA'+'critDmgB'+'critDmgW'+'neckCritDmg'+'glovesCritDmg') + crystal.cdmg*.01` | 〃 |
| `_eqLckTotal()` (27996) | `STATS.lck + ~~(P.lv*.5) + Σ장비 bLck + _eqAffix('lckFlatN')+_eqAffix('lckFlatR')` | 〃 (`_eqStat`: 장비의 `b`접두 숫자 필드 합, 27966) |
| `_predBonus(e)` (28016) | `e.hp<=mhp*.3 ? pPred*.20 : 0` | enemy, State.passives |
| `_hunterMul(e)` (27892) | `e.isBoss/isElite/etype>=90 ? 1+pHunter*.10 : 1` | enemy, State.passives |

### RNG 소비 요약 (rand provider 경유, 소비 순서 고정)

**비처치 타 (etype4 눈알 육괴)**: ① 크리 판정 1회. 합계 **1회/타**.
(etype0이면 피격음 폴백 키 선택이 크리 판정 **앞**에 1회 추가 — 단 Godot에선 피격음 랜덤이 기존 이식 오디오 소비자(오디오 전용 RNG)에 있음 → provider 스트림은 크리 1회. 차이 명시.)

**처치 타 (etype4)**: ① 크리 ② 일반몹 부활 롤 (③ 부활 성공 시 구울 롤) ④ 고어 common/rare ⑤ 고어 조각 인덱스 ⑥ 고어 대형 추가(r≥18) ⑦ 사망 장판 롤(el≠P) ⑧ 물약 발생 롤 ⑨ 물약 종류 롤 — 합계 **8회(부활 실패) / 9회(부활 성공)**.
(etype0: 장판 롤 없음 → 7/8회.)

**[P2-001c 갱신]** 43110 rollDrop이 이식되어 처치 롤은 위 고정 접두 **뒤에 `drop:*` 롤
(드랍 게이트→등급/슬롯/원소/mkItem 내부→유골/결정/소켓석 게이트)이 이어진다 —
docs/engine/FDG_P2_001C_KILL_REWARDS_20261020.md. deathFX·파티클·시체·고어 시각은
P2-001b에서 시각 전용 스트림(world 공유 샘플러)으로 이식됨.
(이하는 P1-002.E 당시 고정 문구) rollDrop·deathFX·파티클·시체·고어 "시각 본체"의 내부 RNG는 미이식 범위와 함께 소비되지 않음 — 원본과 같은 단일 전역 스트림 정렬은 엔진이 달라 불가능하므로, **게임플레이 판정 롤과 hurtE 본문 직접 롤만 provider로 소비**하고 그 사실을 본 표에 고정한다.

## 미이식 항목 목록 (가짜 구현 금지 — 건너뛰고 telemetry/표 기록만)

1. `_petOnAtk`/`_petOnKill` — 펫 시스템
2. 히트스톱(G.hitStop)·화면 플래시(G._flashCol/_flashT)·쉐이크 — 연출 전역
3. 피 스플래시·히트 파티클·슬래시 임팩트·deathFX·대형사망FX·시체(_addCorpse)·고어 조각 시각·사망 임팩트 — 시각 FX (롤만 소비)
4. `_dpsDmg` HUD DPS·`G._dmgPeak`/`_dmgPeakShow`의 렌더 소비자 (G 쓰기는 수행)
5. 일반몹 부활의 실제 재스폰 동작 (_reviveTimer 소비 루프) — 플래그 기록만
6. 균열(rifts) 실제 스폰·업데이트 — G.rifts 레코드 기록만
7. 속성 사망 장판 스폰(_spawnBossProjectile poisonZone) — 롤 소비·기록만
8. 물약 `addPotion`/퀵슬롯 — 롤 소비·기록만
9. `rollDrop` 장비 드롭 — 전체 미이식(내부 RNG 포함)
10. `addExp` 경험치/레벨업 — 기대값 기록만
11. `checkRooms` 방 클리어·`atkTicketRelease` AI 티켓·`_regKill` 처치 귀속
12. `dbSaveNow` 자동저장 — **세이브 수정 금지 지시에 따라 명시적 제외**
13. hitArc 측: 히트스톱·히트 파티클·`_hurtFieldMobs`
14. 42111 패링 수련(lesson) active 케이스의 lesson.hurtEnemy 위임 — active면 정지(telemetry) 후 무효과

## §전용 적 — 전용 스크립트 적 4종 hurtE 연결 (P1-002.F, 2026-10-20)

P1-002.F에서 첫 스테이지 전용 스크립트 적 4종도 기본 근접 1타가 **같은 hurtE 실행자**
(`native_normal_enemy_hurte.gd`)를 탄다. 기존 `receive_damage`는 다른 피해 경로
(kiSlash 검기·Q/E·투사체 등)용으로 그대로 유지 — 기본 근접만 hurtE로 이동.
receive_damage에 부분 이식돼 있던 스턴×1.5·eShield 흡수·즉시반격·KB는 기본 근접에서
이제 hurtE 본문 42336/42345~42352/42382/42462~42476이 수행한다 (동일 산술).

### 적별 원본 hurtE 경로 차이 (이 입력: atkEl=0 기본 무기, 스타터 장비)

| 적 | id/order | etype | el | 42191~42195 피격음 | 42209 신성력(antiRevive) | 42946 사망 장판 롤 | 처치 RNG 합계 |
|---|---|---|---|---|---|---|---|
| flesh_crawler | ch1_initial_015 / 14 | 0 | 0 (P) | HUMANOID 폴백: `Math.random()<.5?'monster_hit':'monster_hit1'` (24793) — **오디오 RNG 1회** | etype0 ∉ `_UNDEAD_ET`(24729) → **어픽스 미읽기** (✂) | el=EL.P → **롤 없음** (✂) | **7**(부활실패) / **8**(성공+구울) |
| spine_beast | ch1_initial_014 / 13 | 4 | 0 (P) | `_BONE_ET`(24728): monster_hit1 pitch1.15 — **RNG 없음** | etype4 ∈ UNDEAD → eq_affix('antiRevive') 읽기(0) (○) | el=EL.P → 롤 없음 (✂) | **7 / 8** |
| ice_soul_flame | ch1_initial_009 / 8 | 4 | 2 (I) | 〃 (BONE 고정) | 〃 (○) | el≠P → **롤 1회**, <0.2면 EL.I 장판 스폰(🚫 기록만) | **8 / 9** |
| hive_bloater | ch1_initial_016 / 15 | 1 | 4 (L) | etype1 ∈ `_HUMANOID_ET`(24725): 랜덤 키 — **오디오 RNG 1회** | etype1 ∉ UNDEAD → 미읽기 (✂) | el≠P → 롤 1회, EL.L 전류장판(🚫 기록만) | **8 / 9** |

- 4종 전원 r≥18 (22.1/34.4/34.9/20.6) → 고어 대형 추가 롤(42731) **항상 3회**.
- 피격음 랜덤은 원본과 같이 provider 스트림이 아닌 오디오 소비자
  (`main._on_native_attack_enemy_audio`, `ATTACK_HIT_CATEGORIES`=원본 집합과 동일) 소관 —
  **provider rand 스트림: 비처치 타 = 4종 모두 크리 1회뿐**.
- 42136~42182·42769~42944 특수 etype 분기: etype 0/1/4 전부 해당 없음 (✂) —
  실행자 `SPECIAL_HIT_ETYPES` 가드에 0/1/4 없음.
- etype1(hive)은 원본 근접 접촉 레지스트리에 없음(원거리형) — hurtE 피격 측에는 영향 없음.

### generic enemy.gd와 다른 owner 구현 지점

| 항목 | generic enemy.gd (E) | 전용 4종 (F) | 근거 |
|---|---|---|---|
| 42382 즉시반격 | 상태기계에 recover 없음 → `contact_clamp`=min(ct,5) 매핑 | **원문 전체**: `s==='recover'→s='idle',ct=0` / `s==='idle'&&ct>5→ct=5` | 42382 |
| st2 대응 필드 | `_contact_ticks` | flesh=`st2`, spine/ice=`_contact_ticks`, hive=`_state_ticks` (각 스크립트 `HURTE_CONTACT_FIELD`) | mkEn.st2 |
| 42414 `e.s` 읽기 | 스냅샷과 동일값 | 42382 recover→idle 전환 반영 위해 **실행자가 owner의 현재 state 재읽기**로 수정 (generic은 값 동일 — E 기준선 무변경 102/0 확인) | 42414 |
| el owner | native_final.el | 전용 runtime config의 native_final에 el 키 없음 → factory가 encounters native_final.el과 동일함을 검증하는 **top-level `element_id`** | enemy_factory 검증 행 |
| eShield 설치 | E에서 native_final 값으로 신설 | **기존부터** configure()가 `data.eShield`(=native_final.eShield, factory 동일성 검증) 설치 — 변경 없음 | mkEn 31178 |
| 사망 연출 | _body 변색 | 각 전용 receive_damage 사망 블록과 동일(_body.modulate.a=0.5, _walk 숨김) | — |
| 쉴드 바 | E에서 추가 | **F에서 4종 동일 추가**: drawEn(53963)과 같이 HP 바 같은 칸 위 #44aaff 덮어그리기 | 53963 |

구현 파일 (P1-002.F):
- `godot/scripts/native_dedicated_enemy_hurte_owner.gd` (신규) — 4종 공용 owner 구현
  (read/field_write/bookkeeping/hp_write/death_write + owner-current 검사). 각 적 스크립트는
  preload 위임 메서드 7종만 추가 — 기존 고유 동작(flesh v3 field-owner 경로
  `commit_native_source_damage_field`/`apply_native_source_poise_hit`, hive 2단 원거리 이동 등) 무변경.
- `godot/scripts/player.gd` — `_melee_contact` 분기 일반화: 스크립트 동일성 비교 대신
  **owner API 메서드 7종 존재**(`NORMAL_HURTE_OWNER_METHODS`)로 식별. 실제 owner 검사는
  실행자 진입부 `read_native_normal_enemy_hurte_fields`의 owner-current 게이트가 수행 —
  불통과 시 정지(halt), 단순화 경로 폴백 없음.
- `godot/scripts/native_normal_enemy_hurte.gd` — 42414의 e.s를 스냅샷 대신 owner 현재값으로 재읽기 (위 표).
- flesh_crawler의 `_pending_poise_amount`(크레센트 포이즈 유예)는 hurtE 경로가 소비하지 않음 —
  기본 근접은 포이즈 0(42486 ✂)이므로 원본과 동일. kiSlash 경로 무변경.

### P1-002.F 검증 결과 (2026-10-20, PC Godot 4.7.2 headless)

- `godot/tests/test_p1002f_dedicated_hurte.gd` (격리 userdir `EXODUSER-P1002F-Isolated-20261020`,
  실제 Main 부팅 + 공개 `request_attack()`): 4종이 인접 스폰·플레이어로 수렴해 근접 호가
  여러 마리를 함께 때리므로, 매 스윙 추적 4종 전원의 사전 상태를 스냅샷하고 교차타 포함
  모든 outcome을 검증. **351 assertions / 0 failures** — 적별 전량흡수≥2·오버플로≥1·
  처치 파이프라인(G.kills/_stageKills/combo/comboTimer/_chainCnt/mats, 다중 처치 스윙은
  순차 규칙으로 기대값 계산)·RNG 순서/횟수(위 표: 7/8/8/9 — death_zone은 el≠P인
  ice/hive만, 구울 롤은 부활 성공 시만) 전부 원본 산술과 일치. 포이즈 불변·
  _pending_poise=0·v3 field-owner 경로 ready·halt 0건.
- **비결정 실패 진단·하니스 수정 (2026-10-20 총괄 인수 중 발견)**: 초기 테스트가 간헐
  실패(연속 8회 미적중 → 중단). 스윙별 진단 로그(swing_log: 수락여부·조준각·거리·
  거부사유·피격수)를 넣어 재현 — 원인은 **테스트 하니스 2종, 제품 결함 아님**(값 검증
  125건 전부 정상·halt 0):
  ① 거부된 `request_attack` 후 `release_attack()` 미호출 → `_weapon_held` 잔류 →
  제품의 홀드 자동 재공격(player.gd `state=="idle" and held`)이 스태미나가 5 될 때마다
  즉시 소비 → 영구 자원 고갈(실측: stamina_insufficient 수백 회/시도, stamina ~1.5 고정).
  수정: 거부 즉시 release + idle·stamina≥20 회복 대기 후 1회 재시도.
  ② 고정 서쪽 배치가 수렴한 몹 무리(추적 외 포함) 한가운데가 되면 스윙 시작 2틱 안
  피격 스태거(제품 정상 동작)로 접촉 취소. 수정: 8방위 중 이동 가능하고 다른 적에서
  가장 먼 지점 선택(`_pick_stand`). 미적중 상한(dry 8)은 그대로 — 상한 완화 없음.
  ③ (인수 2차 실패) 대기(아이들 복귀·스태미나 회복 최대 600프레임) 전에 계산한 배치
  좌표·facing을 대기 후 재사용 → 원거리 적(hive 후퇴 AI)이 그 사이 거리를 벌려
  사거리 밖(실측 dist 147~172)·조준 이탈(aim_err 135°). 수정: 모든 대기가 끝난 직후
  **request_attack 직전 같은 프레임**에 대상 현재 좌표로 재배치·재조준
  (`_place_for_swing`). 공격 방향의 근거(aim_basis 실측): facing은 headless에서도
  매 프레임 마우스 위치(뷰포트 원점 → 플레이어 좌상단 고정점)로 **덮어써진다**
  (player.gd 707~712, `facing_write_survives_frame=false` 관측). 그러나 기본 근접의
  방향은 `_attack_direction = facing`으로 **request_attack 시점에 래치**되고(599),
  swing 상태에서는 갱신되지 않으므로(782는 windup 전용), 테스트가 facing 기록과
  request_attack을 **같은 프레임**에 수행하면 그 값이 그대로 스윙 방향이 된다 —
  적중 스윙의 aim_err=0.0이 그 증거. `_place_for_swing`은 이 래치 직전에 실행된다.
- 회귀 (기준선 = main 91565d492 동일 테스트): test_p1002e_melee_hurte **102/0 동일**,
  test_contracts·test_etype0_physical_burn·test_etype1_lightning_hive_bloater·
  test_native_main_source_lesson PASS 동일, test_etype0_physical_flesh_crawler(1)·
  test_etype4_physical_spine_beast(1)·test_etype4_ice_soul_flame(3)은 기준선과 **동일 수**의
  선재 실패 (본 변경 무관).
- 원로그: `scratchpad/p1-002f/` (baseline / run1~3 / regress).

## §kiSlash — 검기 피해의 hurtE 경로 (P1-002.G, 2026-10-20)

caller: `updateCrescents`(19822~) 비행/충돌 루프 →
`hurtE(e, c.dmg, atan2(e.y-c.y,e.x-c.x), true, {poiseHit:true, kbMult:0.5, noImpact:true, _lessonAttack:'kiSlash', _lessonFullCharge:…, _kiFull:step3&&chargeScale≥2.2}, c.el)`(19837).
Godot: `crescent.gd` 충돌 루프가 hurtE owner API 보유 적(6마리: generic eye_mass 2 + 전용 4종)에
같은 실행자를 호출 — opts는 실행자 인자(`SUPPORTED_OPT_KEYS` 목록 밖 키는 정지).
owner 미보유 적은 기존 receive_damage 경로 유지, 정지 시 폴백 금지 동일.

### caller 측 (19822~19852)

| 행 | 문장 | Godot |
|---|---|---|
| 19833 | `shQuery(c.x,c.y,c.r+8)` 스캔 → `dst<c.r+e.r && !_hitSet.has(e) && hasLOS` | crescent.gd 동일(get_enemies 스캔 + distance + _hits + LOS) |
| 19837 | `hurtE(e,c.dmg,atan2(e-c),true,opts,c.el)` | **신규: 실행자 호출** (atkEl=c.el=0 고정 — 16802 `c.el=el||0`, 16841 spawnCrescent el 인자 0) |
| 19838~19840 | step3: `G.hitStop=max(,6);shake(8)` / else hitStop 3 | 🚫 히트스톱·쉐이크 미이식 (crescent_hit telemetry에 수치만 보고 — 기존 유지) |
| 19841 | `_playKiSlashHit` | 기존 `_play_hit`(HIT_EFFECT)로 이식돼 있음 — 유지 |
| 19845 | `_hurtFieldMobs(...)` | 🚫 필드몹 미이식 (E와 동일) |

### c.dmg 대조 (16816 `_fireKiSlashCrescent` ↔ crescent.gd `configure`)

원본: `~~(meleeRef()×7.0×statStr()×pAtkMul()×_skMul('kiSlash')×_mul×_ukcMul)`, el=0.
`_skMul`(44556)=`b+(lv-1)×g×0.5`, kiSlash `{b:12.0, g:10.08}`(44543 — 2026-09-10 "기본공격 3배" 이후 값).
crescent.gd: `js_to_int32(melee_ref×7.0×stat_str×p_atk_mul×(12.0+(lv-1)×10.08×0.5)×2^tier)` —
combat.json(12.0/10.08/0.5/7.0)과 함께 **원본과 일치(수치 변경 없음)**. 차이 1건:
`_ukcMul`(유니크 u_n03 `_uKiChargeDmg`, 차징 3타 +50~100%) **미이식** — 스타터 0이라 현재 영향 0, 표에 고정.
(참고: CLAUDE.md "기검참 b:2.0 → 최종 14×" 표기는 위 2026-09-10 변경 전 구버전 — 현행 원본은 b=12.0, Lv1 84×/타.)

### hurtE 본문 — weapon 프로필과 달라지는 행만

| 행 | weapon(37617) | kiSlash(19837) |
|---|---|---|
| 42265~66 | kbM=1, psM=1.5(미사용) | **kbM=0.5, psM=1.0**(poiseMult 미전달 기본값) |
| 42269~72 | 플래그 전부 false | 동일 (pure/maxDist/magic/beam 없음, atkEl=0) |
| 42275 | meleeDmgPct | 동일 (비마법·비화살·비DOT → 근접 뎀%) |
| 42313 | _ksFC=0 (키 없음) | **_kiFull일 때 eq_affix('kiSlashFullCrit') 읽기** → min(1,v); >0이면 확정 치명+치명피해+v (스타터 0). 크리 RNG 롤은 두 프로필 모두 항상 1회(42316 `||` 좌변 평가) |
| 42336 | 실질 미도달 | **그로기 후속타 ×1.5 실제 발생** (아래 포이즈로 stunned=180 유발 가능) |
| 42417~19 | _addImpact 🚫 | noImpact=true — 소비처 자체가 미이식이라 효과 지점 없음(수용만) |
| 42466~76 | kbAmt=min(잔여×.25, 15) | **kbAmt=min(잔여×.25×.5, 15×.5)** |
| 42486~98 | poiseHit=false → 단락 | **블록 진입** — 아래 |

### 42486~42498 포이즈 블록 + `_poiseHit`(19973~20001)

| 행 | 문장 | 구현 |
|---|---|---|
| 42487 | `!isDot && opts.poiseHit && !(isBoss&&_pImmune>0)` | 진입 (ib는 42124 정지로 비보스 고정) |
| 42488 | `amt=~~(dmg×psM)` — **dmg는 쉴드 흡수 후 잔여** | ✅ **쉴드 전량 흡수 타는 amt=0 → 19974 가드로 포이즈 무변경** (레거시 receive_poise_damage는 쉴드 이전 전체 피해로 선적용했음 — 원본대로 교정) |
| 42489 | `staggerBns>0 → amt+=~~staggerBns` | ✅ 읽기(0) |
| 42490 | `_poiseHit(e,amt)` 19973~19983 코어: alive/amt 가드, `poise-=amt; poiseR=0`; 붕괴 시 `poise=0; stunned=max(,180); _maxStunned=max(\|\|0,180)` | ✅ owner 경유 — generic/spine/ice/hive: `apply_native_normal_enemy_poise_core`(신규, 코어 그대로. _maxStunned는 native_final 북키핑 — 원본처럼 붕괴 시에만 키 생성). **flesh_crawler: 기존 v3 field-owner 계약**(`world.begin_native_normal_enemy_field_call` → `poise_hit(42490, 빈 prefix)`) — 코어가 19985에서 정지 보고(`core_staggered`)하면 그로기 성립으로 받고 꼬리는 실행자가 수행(이중 owner 금지) |
| 19985~19993 | 유니크 u_d11 환급: `_uqScCtx` 게이트 | ✂ 컨텍스트 부재(천공쇄기 미이식) |
| 19994 | `_uEq('_uPoiseOrbFracture')` | ✅ 읽기(0; >0이면 정지) |
| 19995~19997 | SFX.groggy·파티클 | 🚫 (enemy_stagger telemetry로 사실 보고) |
| 19996 | `addTxt('💥 그로기!','#ff8800',60)` | ✅ NativeFloatingText |
| 19996 | `!(G._noHitStopT>0) → G.slowMo=20` | ✅ G owner 쓰기 (화이트리스트 `slowMo` 추가 — 소비자 미이식) |
| 42491~42493 | 붕괴 시 staggerExplosion | ✅ 읽기(0; >0 정지) |
| 42494~42497 | _lHammerShock/_lMaceShock | ✅ 읽기(각 0; >0 정지) |

RNG: 포이즈 코어·꼬리에 게임플레이 RNG 없음 → **비처치 1회(크리)/처치 7·8/8·9 — weapon 프로필과 동일**.

### P1-002.G 구현·검증 결과 (2026-10-20, PC Godot 4.7.2 headless)

구현 파일: native_normal_enemy_hurte.gd(opts 인자·_ksFC·포이즈 블록·_poiseHit 코어/꼬리),
crescent.gd(owner API 적 → hurtE 라우팅, 레거시 경로는 미보유 적만),
enemy.gd + native_dedicated_enemy_hurte_owner.gd(+spine/ice/hive 위임)의
`apply_native_normal_enemy_poise_core`, native_source_new_run_state.gd(G 화이트리스트 slowMo),
player.gd(37617 opts 명시 전달).

- `godot/tests/test_p1002g_kislash_hurte.gd`(격리 EXODUSER-P1002G-Isolated-20261020,
  공개 request_attack → crescent_requested → 충돌 루프): 6마리 전원 추적·교차타 포함
  전 outcome 검증. **5연속 220/0·168/0·220/0·168/0·168/0 PASS** — 쉴드 선흡수/오버플로
  산술, 포이즈 = 잔여 dmg×1(전액 흡수 타는 포이즈 무변경), 그로기(스턴 180·G.slowMo=20·
  owner 경로: flesh=v3_field_call, 나머지=owner_core), 처치 RNG 7/8(el0)·8/9(el≠0,
  eye_mass el3 포함), c.dmg 공식 전 캐스트 일치(lv1 skMul 12.0, 예: melee_ref16 → 940,
  tier3 ×8=7526), 풀차지(_kiFull) 1회 실측, v3 호출 스택 청산·레거시 유예 0, halt 0.
  스타터 무기 롤에 따라 비처치 타 존재 런(940: 2타 처치)과 1타 처치 런이 모두 커버됨.
- 회귀: p1002e 102/0 동일, p1002f 225/0, contracts 5/0, flesh_crawler 1(선재 동일).
- 화면 검수(1920×1080 실제 창, 대상 화면 좌표 출력·크롭 내 대상 가시 확인):
  검기 적중 시 #66ddff 흡수 숫자(875)·'💥 그로기!' 텍스트 표시, 쉴드 바 렌더는 F와
  동일 코드(만땅 파랑 → 소진/사망). kiSlash는 1타 흡수가 항상 875 전액이라 부분 바
  상태는 화면에 남지 않음 — 부분 상태는 F(동일 _draw)에서 검증 완료.
- 잔여 차이(G): ① `_ukcMul`(u_n03 _uKiChargeDmg) 미이식(스타터 0) ② 그로기 꼬리의
  SFX.groggy·파티클·슬로모 소비자 미이식(G.slowMo 기록만) ③ G.hitStop/shake(19838)·
  _hurtFieldMobs(19845) 미이식 유지 ④ 다른 피해 경로(Q/E·투사체)는 여전히
  receive_damage 직통(수정 금지 범위) ⑤ CLAUDE.md 기검참 "b:2.0→14×" 표기는 현행
  원본(b=12.0, 84×/타)과 불일치 — 본 작업 범위 밖, 보고만.

## 구현·검증 결과 (2026-10-19, PC Godot 4.7.2 headless)

구현 파일:
- `godot/scripts/native_normal_enemy_hurte.gd` (신규) — 본 표의 실행자. 12 provider + State/enemy owner만 읽고, NOT_READY·미이식 분기 활성 시 정지(journal/halt 기록, 폴백 없음).
- `godot/scripts/enemy.gd` — eShield/eShieldMax/eRes 설치(native_final owner 값), hurtE 필드 읽기/쓰기 owner API 5종(`read_native_normal_enemy_hurte_fields`/`apply_native_normal_enemy_field_write`/`apply_native_normal_enemy_bookkeeping`/`apply_native_normal_enemy_death_write`/`report_native_normal_enemy_hurte_event`), 쉴드 바 표시.
- `godot/scripts/native_source_new_run_state.gd` — `apply_native_normal_enemy_hurte_g_writes` (G 효과 owner: kills/_stageKills/combo/comboTimer/comboMax/_chainCnt/_chainT/mats/_dmgPeak/_dmgPeakShow/rifts_append 화이트리스트).
- `godot/scripts/player.gd` — `_melee_contact`: generic enemy.gd 대상만 hurtE 경로로 교체(전용 적은 기존 receive_damage 유지), atkEl 결정(33360) 추가.

provider 사전 확인 (라이브 Main 부팅 프로브): 12종 중 **11 READY**, `play_time`만 NOT_READY(`native_play_time_field_unresolved`) — 본 경로의 두 읽기 지점(42328·42664)은 선행 조건 단락으로 **읽지 않음**이 원본 순서이므로 owner 수정 불요.

검증 (`godot/tests/test_p1002e_melee_hurte.gd`, 격리 userdir `EXODUSER-P1002E-Isolated-20261019`, 실제 Main 부팅 + 공개 `request_attack()` 경로):
- 수치: basic_base_damage 342(=((8+27)+0+15)×6… 스타터 녹슨 검 atk27), p_atk_mul 0.7, 기본근접 비용 5 → _atkBon 7 → 타당 246. statCrit=0, statCritDmg=1.5 (스타터 LCK/critRate 0 — owner 재계산과 모듈 값 일치 검증).
- 쉴드 선흡수: 1~3타 쉴드만 차감(HP 불변), 4타 쉴드 137 흡수 + HP 오버플로 109 — 원본 산술과 매 타 정확 일치.
- RNG: 비처치 타 = rand provider 1회(크리) / 처치 타 = 8회(부활 실패) 또는 9회(부활 성공·구울 롤) — 소비 순서 `crit → normal_revive(→revive_as_ghoul) → gore×3(r≥18) → death_zone(el≠P) → potion×2` 원본 순서와 일치, 부활 성공 분기(run6) 포함 검증.
- 처치: enemy alive=false/state dead, G.kills/_stageKills/combo(+60캡)/_chainCnt/mats(+4) 전부 원본 규칙대로 — 5회 반복 실행 전부 PASS (총 71~102 assertions/run, failures 0).
- 기존 회귀: test_contracts·test_etype0_physical_burn·test_etype1_lightning_hive_bloater·test_native_world_phases·test_native_qe_binding·test_native_main_source_lesson·test_native_source_update_clock_play_time **PASS(변경 전과 동일)**. test_etype0_physical_flesh_crawler(1)·test_etype4_spine(1)·test_etype4_ice(3)·test_encounter_factory(3)·test_native_main_source_player_initialization(2)·test_native_main_source_starter_state(2)는 **기준선(HEAD 4a4403b7b)에서도 동일 수로 실패하는 선재 결함** — 본 변경과 무관(기준선 비교 로그 보존).
- 원로그: `C:\Users\심도진\AppData\Local\Temp\claude\G--exoduser\01df6303-6873-40fb-a2e6-1c93fb00612e\scratchpad\p1-002e\` (run1~8 + regress + baseline).
- 테스트 한계(기록): activeLMBSk='weapon' 로드아웃을 State P에 직접 기록(공개 셀렉터 부재), 스윙 전 플레이어 위치/시선 배치 — forced_actor_fields로 집계. 적 투사체 피격으로 스윙이 취소되면 재시도(최대 3회).

## Godot 측 기존 경로와의 잔여 차이 (이번 구현 후에도 남는 것)

1. 다른 피해 경로(kiSlash 검기, Q/E, 투사체)는 여전히 `receive_damage` 직통 — **eShield를 우회** (수정 금지 범위). 쉴드는 기본 근접 경로에서만 차감됨.
2. 기본 근접이 치는 포이즈 피해 0은 원본과 동일 (기존 enemy.gd 주석과 일치).
3. 넉백 뷰포트-밖 좌표이동 분기(42476 else) 미구현 — 근접 교전에서 미도달.
4. 피격음 랜덤 폴백은 기존 오디오 소비자(_on_native_attack_enemy_audio)의 오디오 전용 RNG — provider rand 스트림과 분리 (원본은 동일 Math.random 스트림).

## PC-COMBAT-PACK-B — normalBow 패킷 opts 프로필 (2026-10-21)

35407 `hurtE(e,dmg,ang,_isTurretProj||p.blueBean,p,p.el)`의 패킷 opts를 실행자가 수용한다(`opts.normalBow===true`일 때). 원본 패킷은 `source_opts`로 동일성 보존, hurtE가 읽는 키만 view로 투영해 위 표의 같은 문장을 실행한다. 이 프로필에서 바뀌는 행: 42270 `_isArrow=true`·`_isGunpowder=true`·`_isMagicDmg=false`, 42276–42277 타입%=`rangedDmgPct+projDmgPct`, 42287 `_weakPj`, 42312 `critRateBow`, 42466 `_isRanged`(넉백·`_lClubKB` 미진입). 미이식 키 truthy·maxDist 없음·불 원소(42700 화상 사망)는 42110에서 쓰기 전 정지. 원본 VM 대조(같은 RNG 값 공급): 비치명/치명 각 1건 HP·쉴드·생존·킬 수·RNG 행 순서·타입 어픽스 읽기 일치. 상세 [PC_COMBAT_PACK_B_CONTRACT_20261021 §3·§8](PC_COMBAT_PACK_B_CONTRACT_20261021.md).
