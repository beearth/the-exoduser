# B07 돌진·패링·방패·포이즈(Q/E) — 웹 원본 추출표

> **맥북 총괄 검수 (2026-10-26)**: 작성 = 단순작업4(Sonnet, 읽기·문서만, docs 2_3 수정금지 문서는 읽기만). 원본 대조로 확인한 줄 — 적 포이즈 = HP 31166(`poise:_hp,maxPoise:_hp`), 비-DOT 피격 시 `P.iframes=0` 43584, 플레이어 기절 `~~(240*(1-min(.5,ccRes+stunRes)))` 43587, 패링 판정 반경 `min(140,110+bonusRange*4+pParry*2+~~(parryBonus*20))` 34860. **이식 기준은 코드(웹 동작) 1:1**이며 docs 2_3과의 차이(표 E)와 코드 내부 불일치(망토 보정 패링 창 vs `_sbActive` 게이트, `_chgMP` 곱으로 반경 상한 초과 가능)도 웹 동작 그대로 옮긴다(개선 금지). 수치 JSON: `docs/engine/unity_b07/b07_web_values.json`.

- 추출 시점 HEAD: `1770c2698d67a72b5b6febcf0ebeedb4fa5061f2` (`G:/exoduser`, game.html 65,694줄). **작업 트리에 타 세션의 미커밋 수정(`M game.html`)이 있었다** → 줄 번호·값은 그 작업 트리 파일 기준이며 HEAD 커밋과 다를 수 있다(HEAD 대조는 하지 않음).
- 기준: docs와 코드가 다르면 **코드가 기준**. 추정은 "추정", 확인 못 한 것은 "미확인". docs `2_3`은 수정금지라 **읽기만 했고 수정 제안은 하지 않는다**(차이는 사실로만 표 E에 적음).
- 단위: **프레임 = 60Hz 게임 틱**. `P.st2`·타이머는 매 프레임 `sp`(시간배율, 정상=1)만큼 감소. `OPT.hitStop`/`OPT.shake`는 100이 기본 배율.
- 읽은 것: game.html(아래 줄 번호 전부), `parry-lesson.js`(패링 연습, 700줄), docs `2_3`, Unity `origin/claude/unity-pc-inventory-u04-20261026 @6c8ed9d91`(git grep만).
- **범위 경계**: 전격이동(`bladeDash`)·유령걸음·얼음보주·기검참(kiSlash)·천공쇄기·합체 스킬 세부는 B07 밖이라 "이동기/탈출기로 호출되는 지점"만 적고 수치는 추출하지 않음(미추출).

## 0. 가장 중요한 사실

1. **키**: 사슬 이동=`Shift`(`BINDS.charge`='ShiftLeft'), Q=`BINDS.parry`('KeyQ', 보호막/패링), E=`BINDS.shield`('KeyE', 칼등 처내기) (L6188-6193). 구 우클릭=마법(`beam`='mouse2').
2. **"돌진"은 두 계통**: (a) **사슬 이동(`_harp*`/`_dash*`, Shift 홀드·탭, 게이지 소모)** — 현행 본체 (L12849-12883, 13335-13365, 32168-32384). (b) 구 `P.s==='charge'` 상태(관통 돌진, L33962-34018) — 상태 정의·피니시는 살아 있으나 진입점 `P.s='charge'`는 이번 grep에서 대입 지점을 찾지 못함(= 현행 미사용 가능성, 미확인).
3. **패링 입력 구분이 규칙**: 물리탄(빨콩·titanEye·bwBean·입/뱀탄)=E(sBash)만, 마법탄(무지개·다크볼·원소탄 등)=Q(sBlock/해제 패링)만, 틀리면 피격+"❌ E키로!"(L34912-34933). 분류 SSOT = `_projectileParryClass`(L16913).
4. **플레이어 포이즈 4칸**: 피격(비 DOT) -1, 무지개 폭발 -2, 패링 실패 -1, 패링 성공 +1(최대 4). 0이면 `pStun`=**240f × (1 − min(0.5, ccRes+stunRes))**(docs 480f/300f와 다름). 집중 상태(`_isFocusState`)는 면역(포이즈 0이면 1칸 복원 "집중!").
5. **`hurtP`는 비-DOT 피격 시 `P.iframes=0`을 대입**한다(L43584) → docs의 "피격 후 30f 무적"은 코드에 없음(표 E).
6. **적 포이즈 = 최대 HP와 같은 값**(`poise=maxPoise=_hp`, L31166). 보스 그로기 90f, 일반 180f, 그로기 종료 시 보스만 5초(300f) 면역.
7. **패링 성공 보상**(`doParry`, L38472-38577): iframes 25, HP/ST/MP 각 `50×(1+parryBonus)×(1+pRegen×0.2)`(빨콩 ×0.5, 무지개 ×1.5, 물리탄 자원배율 ×3), 포이즈 +1, 기동게이지 +10/+5/+15(×2), 분노 ×2, 악의오브 +1000~4000, 히트스톱 `_HS.parry`=6f, 슬로모 25f, 흔들림 14.

## 표 A. 정의·수치

### A-1 키·입력·상태 이름
| # | 이름 | 상수·변수 | 값 | 줄 | 설명 |
|---|---|---|---|---|---|
| A1 | 사슬 이동 키 | `BINDS.charge` | `'ShiftLeft'` | 6191 | 탭=1단, 홀드로 단 상승 |
| A2 | 패링/보호막 키 | `BINDS.parry` | `'KeyQ'` | 6192 | 홀드=sBlock, 평화의보호 합체 시 peaceShield |
| A3 | 칼등 처내기 키 | `BINDS.shield` | `'KeyE'` | 6190 | 탭(≤10f)=sBash, 홀드>10f=kiGather 차징 |
| A4 | 무기 | `BINDS.weapon` | `'mouse0'` | 6190 | |
| A5 | 마법 | `BINDS.beam` | `'mouse2'` | 6193 | 구 E와 스왑됨(docs 2026-07-27) |
| A6 | 플레이어 상태 문자열 | `P.s` | `'sBash','sRecover','sDraw','kiGather','sBlock','peaceShield','charge','cRecover','pStun','stagger','fallen','dead'` | 33368, 33535, 33663, 33686, 33739, 33774, 33962, 34069, 34340, 34333 | 상태 머신(switch) |
| A7 | 집중(면역) 상태 | `_isFocusState()` | `sBlock`,`peaceShield`,`whirlwind`,`beam`,`burstLoop`,`charge`,`bowDraw`,`rainLightning` | 43415 | 포이즈 감소·경직·기절 면역 |
| A8 | 차징 하이퍼아머 | `P.s` ∈ {`kiGather`,`sDraw`} 또는 `_isKiCharging()` | 경직 면역(포이즈는 감소) | 43588, 35089, 16834 | `_isKiCharging()=P.s==='wWindup'&&P._kiChargeActive` |

### A-2 사슬 이동(돌진) — 게이지·거리·무적
| # | 이름 | 상수·변수 | 값 | 줄 | 설명 |
|---|---|---|---|---|---|
| A9 | 홀드 단계 프레임 | `_HARP_TIER_F` | `[0,1,6,12]` (미사용,탭=1단,6f=2단,12f=3단) | 12851, 32170-32173 | `_dashHold` 홀드 프레임 `_dashHoldF`(상한 120) |
| A10 | 단별 기본 거리 | `_harpDistTier(t)` | 기본 `[0,300,500,700]`, 만렙(스킬 Lv10) `[0,500,800,1200]`, 중간은 선형 `(Lv-1)/9`, 곱 `pChargeRange()=1+pCharge×0.02` | 12852-12862, 28022 | 스킬 Lv=max(chargeBoost,magicBlink); `~~` 정수화 |
| A11 | 사슬 비행 속도 | `_HARP_SPD` | `63` px/f | 12869 | 비행 중 `_harpStep=min(dt, 남은거리/63)` (32237) |
| A12 | 끌려가는 시간 | `_HARP_PULL_DUR` | `[0,7,11,16]` f | 12868, 32254 | 속도=거리/시간, 매 프레임 `_dashLeft-=step` |
| A13 | 이동 중 무적 | `_HARP_IFRAME` | `[0,8,14,24]` (`_dashIframe`로 대입) | 12867, 32250 | 실제 보호는 `P.iframes=max(P.iframes,2)` 매 프레임(32264) |
| A14 | **착지 무적** | `P.iframes=max(P.iframes,48)` | 48f(0.8초) | 32363, 33967, 34018 | 사슬 착지/구 돌진 벽충돌·종료 모두 |
| A15 | 착지 애니 | `_harpLandT` | 30f | 32366 | 착지 후 `_dashPhase=3`→0 (58592) |
| A16 | 사슬 데미지 배율(미사용 표기) | `_HARP_DMG` | `[0,0.7,1.5,2.5]` | 12870 | 참조 지점은 이번에 미확인 |
| A17 | 기동 게이지 코스트 | `_HARP_GAUGE_COST` | `[0,45,98,150]` | 12880, 13342 | 단별 소비 `min(_harpGauge, cost[tier])` |
| A18 | 기동 게이지 최대 | `_HARP_GAUGE_MAX` | `칸수×45 + ~~(extraST)`; 칸수 기본 5(`_HARP_GAUGE_BASE_CELLS`), 돌진스킬 보유 6, dimBreach 7, dimThunder 9, dimRush 10 | 12881-12883, 32786-32787, 63465 | 기본값 `5×45=225` |
| A19 | 기동 게이지 회복 | `_hgRegen` | `MAX×0.025/60×(1+chargeBoost×0.05)×pChargeGauge()`/f (≈초당 2.5%, 풀충전 약 20초) | 32168, 28023 | 홀드·비행·대시 중에는 정지; 패링 연습 ch2 중 정지 |
| A20 | 사슬 스태미나 | `P.mst*0.01*tier` | 1단 1%, 2단 2%, 3단 3% | 13343, 32177, 32210 | 부족하면 발사 안 됨(조용히) |
| A21 | 자동 발사 | 3단 도달 자동 | `_dashTier>=3`이면 홀드 중 자동 발사(게이지>0 && ST 충분) | 32175-32197 | |
| A22 | 벽 감지 자동 발사 | 조준선 벽 감지 | 16px 간격 스캔(`canMvBlink`, 반경 2) | 32199-32231 | |
| A23 | 입력 딜레이 | `P._chainSkDelay` | 3f | 13354, 32234 | |
| A24 | 돌진 스톡(구) | `P.maxChargeStocks` | `min(5,(_hasChargeSk?3+~~(chargeBoost/10):1)+장비)`; dimBreach 5 | 32785 | |
| A25 | 스톡 재충전 | `chargeCd` | 기본 300f, 돌진스킬 보유 600f, dimBreach `max(180,420-chargeBoost×20)`, `×(1+dashCooldown)` | 32790-32791, 33523 | 칼등치기 캔슬 후 `chargeCd=~~(300*1)` |
| A26 | 사슬 데미지(경로 적, STR) | `_cDmg` | `~~(((ar().charge||10)+P.baseAtk)×_cbMul×statStr()×(1+dashBoost))`, `_cbMul=chargeBoost≥1?1.5+(Lv-1)×0.25:1` | 32291-32293 | `hurtE(...,{kbMult:2,poiseHit:true,poiseMult:2.0})`, 넉백 +25 |
| A27 | 사슬 데미지(INT 화염) | `_ltnDmg` | `~~(magicRef()×_skMul('magicBlink')×statInt()×pMagicMul()×티어(1/2/3)×_fuseMul)` `{poiseHit:true,poiseMult:1.5}` | 32282-32285 | 화상 `burnT=180f` 중첩+1(최대10) |
| A28 | 경로 히트 반경 | `dst(P,e)>e.r+20` 제외 | 40px(칼날개 활성 시 `160+(Lv-1)×5` 쿼리) | 32271-32277 | 히트 시 hitStop 3f·shake 4 (32299) |
| A29 | 사슬 이동 중 탈출기 효과 | 시작 시 `P.poise=4` | 포이즈 풀 회복 | 32250 | `_dashActive`/`_harpActive` 중 `hurtP`는 즉시 return(무적) (43424) |
| A30 | 구 돌진 감속 | `P.chargeSpd *= _cbDecay**sp` | `_cbDecay=min(0.985, chargeBoost≥1?0.96+(Lv-1)×0.001:0.94)` | 33969-33970 | 종료: `st2<=0||chargeSpd<1.5` → `cRecover` st2=10 |
| A31 | 구 돌진 데미지 | `cDmg` | `~~((((ar().charge||10)+P.baseAtk)×_cbDmgMul×elMul×10+_chBon)×_fuseMul('chargeBoost')×(1+dashBoost))` `{kbMult:1.5,poiseHit:true,poiseMult:1.0}` | 33981-33983 | 히트 시 `e.stunned=~~(40×mult)`(돌진 커밋 중인 적 제외) (33990) |
| A32 | 구 돌진 hitStop | `_HS.charge` / `chargeWall` | 2f / 3f | 8675, 34010, 33966 | |

### A-3 칼등 처내기(E, sBash) — 판정 창·반경·보상
| # | 이름 | 상수·변수 | 값 | 줄 | 설명 |
|---|---|---|---|---|---|
| A33 | sBash 총 틱 | `P.st2=20` 진입 | 20f | 38454, 38466 | `_sBashFire`/`_kgRelease` |
| A34 | 패링 활성 틱 | `var _PARRY_WIN` | `16` (최대 20) → 활성 구간 `st2>20-16=4` | 8670, 34854, 38471 | 뒤 4틱(st2≤4) 후딜 |
| A35 | 망토 보정 | `_lParryWinTicks()` | `min(20,~~(_PARRY_WIN×(1+_lCapeParry)))` | 16624 | **isPWin에만 적용**. 투사체 판정 `_sbActive`(34854)는 보정 없는 `_PARRY_WIN` 사용(불일치, 표 E) |
| A36 | E 탭 유예 | `_SD_GRACE` | 10f (탭 확정, 이상이면 홀드) | 33667 | sDraw에서 `_sdHold>10` → kiGather. 이동 속도 ×0.5(33681) |
| A37 | E 탭 버퍼 | `_sdTapBuf` TTL | 3프레임 | 38448-38449 | 초고속 탭 보장 |
| A38 | sBash 진입 ST | `stCost('shield')` | `5+((maliceSwipe||1)-1)×2` (`useStPct('shield')`) | 31988, 38452 | ST 부족이면 "ST 부족!" 후 미발동 |
| A39 | **타격 순간** | `P.st2<=12 && P.st2+sp>12` | 8f째(20→12 통과 시점) 1회 | 33411 | `_gSlamHit(P.facing,_gsRange2,π×0.8,_gsDmg2,el,1.5,0.8)` + 진동파 + 파편 + 투사체 반사 |
| A40 | 타격 반경 | `_eSwingRadius(chg)` | `floor((70+sh().bonusRange×4)×_eSkillRangeMul()×chg)` | 3493 | `_eSkillRangeMul=1+(min(maliceSwipe,shieldThrow)-1)×0.05`(3491-3492) |
| A41 | 타격 데미지 | `_gsDmg2` | `~~(meleeRef()×2.0×(1+(maliceSwipe≥1?(Lv-1)×0.21:0))×statStr()×pShieldMul()×chg)+_atkBon` | 33418 | `pShieldMul()=1`(28053) |
| A42 | 투사체 반사 반경 | `_sdRange` | `_gsRange2`, 불꽃칼날(shieldFuse) 시 `×1.5` | 33436-33437 | 전방 ±1.8rad(`Math.abs(diff)<1.8`) 내 |
| A43 | 투사체 판정 반경(상시) | `_parryR` | `min(140, 110+sh().bonusRange×4+pParry×2+~~(parryBonus×20))×_chgMP` | 34860 | `_chgMP`(sBash만)=`min(3,max(1,_sBashChgMul))×_eSkillRangeMul()` |
| A44 | Q기폭 판정 반경 | `_parryRDet` | `min(200, 140+bonusRange×6+pParry×3+~~(parryBonus×30))×_chgMP` | 34861 | (E 경로에서는 미사용; sBlock 폭파 관련) |
| A45 | 반대 입력 패널티 반경 | `_wrongR` | 100px 고정 | 34912 | |
| A46 | 처내기 후 회복 | `sRecover` | `P.st2=~~(28/pParryRmbSpd())`, `pParryRmbSpd()=1+pParry×0.10` | 33533, 28039 | 이 동안 Shift 사슬/Q로 캔슬 가능, 종료 시 `P._stWingT=0; P._sBashChgMul=1`, E 홀드면 `sDraw` |
| A47 | 돌진 캔슬 | `sBash st2<=14` + Shift | 사슬 발사(`_harpTier=min(3,2+~~(chargeBoost/3))`), 스톡 -1 | 33520-33531 | |
| A48 | 차징 검격 배율 | `P._sBashChgMul` | `min(3,max(1,1+0.5×min(t,2)+max(0,t-2)))`, `t=min(3,_kgChg/60)` | 33733, 38463 | 1초=1.5, 2초=2, 3초=3(풀) |
| A49 | kiGather 단계 | `P._kgChg` 누적 `+sp×2` | 단계 1=60, 2=120, 3=180; 186↑ 자동 릴리즈(mult 3) | 33710-33729 | 이동 ×0.18(33706), 불발 `_kgChg<18` |
| A50 | 차징 이동 | 감속 | sDraw ×0.5, kiGather ×0.18, sBlock ×0.35 | 33681, 33706, 33769 | |
| A51 | 실버테일 전진 패링 | `_slpDist` | `150+175×(mult-1)` px, `_slpSpd=_slpDist/20`/f(20f) | 33374-33375 | 반경 `_slpR=_eSwingRadius(mult)`, 전방 ±1.8rad 탄 반사, 진입 시 `iframes=max(,8)`(38467) |
| A52 | 반사 데미지(E, 스킬Lv≥1) | `p.dmg` | `~~(pParryProjDmg(dmg,false)×(1.5+(_sdLv-1))×_msReflect×((_stWingT>0)?1.5:1))`, life 80 | 33482-33483 | 일반탄→블루콩 |
| A53 | 반사 데미지(E, 스킬Lv=0) | `p.dmg` | `~~(pParryProjDmg×0.8×_msReflect)`, life 60, 속도 ×-1.5 | 33501-33502 | |
| A54 | 빨콩(E) 변환 | | 데미지 `×(2.5+(_sdLv-1))×wing`, `_aoeR=160`, `_aoeDmg=dmg×2`, life 240 / Lv0: `×1.8`, `_aoeR=120`, `_aoeDmg=×1.5`, life 180 | 33471-33473, 33493-33494 | 투사체 경로(34934-34942)는 별도: `×1.5`, 속도 7, `_aoeR=160`, `_aoeDmg=×2`, life 240 |
| A55 | 무지개탄 접촉(sBash) | | 30% 관통 `p.dmg×0.3`, 폭발 반경 100, 폭발 데미지 `max(80,~~(dmg×1.5))`, `iframes=max(,12)` | 33450-33456 | 흡수 없음 |
| A56 | 패링 파라미터 | `pParryProjDmg(b,isQ)` | `max(~~(b×(1+min(1,scale/300))×0.5×pParryDmg()×(1+parryBonus)×_legSP), ~~(meleeRef()×14×statStr()×pAtkMul()))`, scale=Q면 `magicRef()×statInt()×pMagicMul(false)` 아니면 `meleeRef()×statStr()×pAtkMul()` | 28038 | 최소 기검참 1방(14×) 보장 |
| A57 | 카운터뎀 | `pParryDmg()` | `1+pParry×0.50` | 28024 | |
| A58 | 무지개 피해감소 | `pParryRainbowDR()` | `min(0.50, pParry×0.10)` | 28040 | |

### A-4 Q 보호막(sBlock)·평화의보호·해제 패링
| # | 이름 | 상수·변수 | 값 | 줄 | 설명 |
|---|---|---|---|---|---|
| A59 | Q 진입 | `P.mp-=10` (`mp>=10` 필요) | 10 | 33552, 14306-14307 | `P.s='sBlock'; st2=999; _sbParryT=_lSbParryT()` |
| A60 | 패링 윈도우(Q 누른 직후) | `_lSbParryT()` | `~~(20×(1+_lCapeParry))` = 기본 **20f** | 16625 | sBlock 중 매 프레임 `-=sp`(33744) |
| A61 | 보호막 쿨다운 | `P._sbCd` | `~~(30×(1+shieldCdRed))` = 기본 30f | 14308, 33552, 33804 | Q 진입 조건 `_sbCd<=0` |
| A62 | MP 소모(홀드) | `P.mp -= P.mmp×0.000833×sp` | ≈초당 5% | 33743 | MP 0이면 해제 |
| A63 | 해제 패링 창 | `P._sbParryT=12` | 12f | 33760, 33804 | 해제 직후 `hurtP`에서 처리(43443) |
| A64 | 홀드 반경 성장 | `_sBlockChargeRadius(holdT)` | `100+(500-100)×min(1,holdT/240)` | 14313-14316 | 해제 시 `_sbReleaseR` |
| A65 | 눌림 패링/흡수 반경 | `_sBlockProjectileZone(d,parryT)` | `d<=20`→흡수, `parryT>0 && d<=100`→패링 | 14317-14320 | 흡수 시 투사체 삭제+"흡수" |
| A66 | 해제 패링 반경 | `_qPulseR=_releasePW?P._sbReleaseR:0` | `_sbReleaseR` (최대 500) | 34862-34863, 34880 | |
| A67 | Q 마법 패링 데미지 | `_npDmg` | `~~(pParryProjDmg(dmg,_sbPW)×1.5)`, life 180, 유도 반사, 속도 `max(5,|v|)` | 35054-35060 | `parryBank+=p.dmg` |
| A68 | 다크볼(gbBean) Q | | `pParryProjDmg(dmg,_sbPW)×2`, life 200 | 35023 | 피격 시 `~~(dmg×1.3)` (35027) |
| A69 | 화이트볼(bwBean) E | | `pParryProjDmg(dmg,_sbPW)×1.5`, life 180 | 35007 | 피격 `×1.3`(35011) |
| A70 | 보호막 흡수율 | `pGuardAbsorb()` | `min(0.50, 0.30+pGuard×0.02+shieldBlockDR)`; `pShieldBlock()=0` | 28055, 28054 | |
| A71 | 패링 실패(Q 홀드 중 창 지남) | `_parryFailed=P._sbParryT<=0&&!dot` | 흡수율 `min(0.25, base×0.5)`, 피해 ×1.3, 포이즈 -1, 넉백 5, 흔들림 8, "⚠패링 실패!" | 43483-43496 | 성공 시(창 안) 피해 0, 넉백 3, 흔들림 4 |
| A72 | 평화의보호 | `peaceShield` | 반경 `100+min(10,holdT/60)×10`(100→200), MP `10/60×sp×(1+floor(holdT/60)×0.05)`/f, 해제 패링 12f | 33777-33809, 14321 | 해제 충격파 `~~(magicRef()×statInt()×(Lv×.15+.85)×(R/200+.5))×2`, 범위 `R×1.2` |
| A73 | 기폭팔(detonate) 차지 | `P.parryT` | `+sp`, 120f 도달 시 자동 `_detonateBlast('자동기폭!')`, Q 홀드당 1회, HP 드레인 `mhp×0.0003×sp`/f(HP 1 하한) | 33746-33748 | 해제 시 `parryT>=120`이면 기폭(43446) |
| A74 | 기폭 폭발 | `_detonateBlast` | `chgBars=min(3,1+~~(parryT/60))`, 배율 `19/32/48`, `boom=~~((meleeRef()×statStr()×pAtkMul()×_skMul('detonate')×배율 + parryBank×chgBars×2.5)×_fuseMul×(stormBurst1.5/stormBeam1.2))`, 반경 `(150+(Lv-1)×10)×chgBars`, 거리감쇠 `0.5+0.5×falloff` | 43304-43350 | 보스 포이즈 `maxPoise×0.20`, 일반몹 `stunned=~~((120+(Lv-1)×8)×elMul), poise=0` (43356-43360), hitStop `10+chgBars×3`, slowMo `25+chgBars×5`, shake `(14+chgBars×4)` |

### A-5 hurtP(플레이어 피격)·포이즈·기절
| # | 이름 | 상수·변수 | 값 | 줄 | 설명 |
|---|---|---|---|---|---|
| A75 | 최대 포이즈 | `P.maxPoise` | `4` 고정 | 27924 | 초기 `P.poise=min(4,…)`, `poiseR=0` |
| A76 | 피격 포이즈 | 비 DOT·비 집중 상태 | `P.poise-=1` | 43586 | 0이면 `pStun` |
| A77 | 무지개 폭발 | | `P.poise-=2` | 34983 | 집중이면 0→1 복원 |
| A78 | 패링 성공 | `doParry` | `P.poise=min(maxPoise,poise+1)` | 38492 | |
| A79 | pStun 시간 | `P.st2` | `~~(240×(1−min(0.5, ccRes+stunRes)))` | 43587, 43465, 43490, 34984 | **기절 진입 시 hitStop `_HS.pStun=5`(43587)**, 패링 실패 경로는 `iframes=60`(43465, 43490, 34984), 일반 피격 경로는 iframes 대입 없음 |
| A80 | 경직(stagger) | `P.s='stagger'; st2=6` | 6f | 43588 | 차징 중(kiGather/sDraw/_isKiCharging) 면역, 덫은 st2=30 (35089) |
| A81 | pStun 탈출 | | Shift(`isJust('charge')` 또는 사슬/대시 중 Shift) → `idle, iframes=30, poise=4`; `skill7`(Ctrl 탈출기) 동일; 전격이동(`_bdTrigger`) → `poise=4` + 대시; 자연 종료 `st2<=0` → `idle, iframes=60, poise=4` | 34343-34346 | 스킬 슬롯 발동도 `P.s==='pStun'`이면 `poise=4`(12910) |
| A82 | stagger 탈출 | | Shift, Q(`isJust('parry')`), `skill7`, 전격이동 → 즉시 idle | 34335-34338 | |
| A83 | 피격 대사 | `P._pStunSayF` | 480f 쿨 "여기가 지옥인가" | 34341 | |
| A84 | 한방 캡 | `_hitCap` | `~~(P.mhp×0.33)` 초과 시 캡 + `iframes=max(,60)` + "💥한방캡!" | 43522-43523 | |
| A85 | 최소 피해 | `_minDmg` | `max(1,~~(P.mhp×0.005))` | 43541 | |
| A86 | DR | `pDR`,`eDR` | `min(DR_CAP, def/(def+2500)+physDR)` | 43516-43517 | 돌진(`P.s==='charge'`) 중 `a=max(1,~~(a×0.3))`(70% 감소, 43520) |
| A87 | 조건부 DR 캡 | `_cDR` | `min(.50,_cDR)` | 43539 | |
| A88 | 회피 | `_dodgePct` | `min(35,(DEX+_lvB+Dex장비)×0.05+dodgeChance×100)` (DOT 제외) | 43434 | |
| A89 | 즉시 return | | fallen/dead, 보스 로딩, `_harpActive||_dashActive`, `_ioActive`, `_gwActive`, `iframes>0`, `_parryLesson.active` | 43418-43431 | |
| A90 | 피격 넉백 | `_kbStr` | `min(12,max(1,a/P.mhp×30))` | 43593 | 화면 흔들림 `min(16,max(4,~~(a/mhp×60)))` (43596) |
| A91 | 플레이어 HP 위기 | | `a>P.mhp×0.15` 시 색수차 4f | 43599 | |

### A-6 doParry 보상 상수
| # | 이름 | 값 | 줄 | 설명 |
|---|---|---|---|---|
| A92 | 무적 | `P.iframes=max(,18)` 후 `P.iframes=25`(덮어씀) → **최종 25f** | 38473, 38487 | |
| A93 | 회복량 `_prBase` | `~~((red?raw×0.5 : rainbow?raw×1.5 : raw)×resourceBonus)`, `raw=50×(1+parryBonus)×(1+pRegen×0.20)` | 38483-38486 | HP·ST·MP 각각 동일 값, 상한 mhp/mst/mmp |
| A94 | 자원 배율 | `_physicalProjectileMultiplier` | 물리 적대탄 ×3, 그 외 ×1 | 16931-16933 | `_resourceMul` |
| A95 | 기동 게이지 | `_harpAdd=(red?5:rainbow?15:10)×resourceBonus×2` | 38493 | 일반 +20, 빨콩 +10, 무지개 +30 (상한 `_HARP_GAUGE_MAX`) |
| A96 | 분노 | `(red?5:rainbow?15:10)×resourceBonus+유니크)×2` | 38498 | `P.rage` 최대 `_rageMax()` |
| A97 | 악의 | `(red?500:rainbow?2000:1000)×resourceBonus×2` | 38544 | 일반 2000, 빨콩 1000, 무지개 4000 |
| A98 | 히트스톱·슬로모 | 일반: `hitStop=~~(_HS.parry×OPT.hitStop/100)=6`, `slowMo=25`, `shake=14×OPT.shake/100`; 기폭 충전 중(`parryT>0`): shake 6만; 패링 연습 중: hitStop·slowMo 0 | 38476-38478, 8677 | `_HS.parryReflect=7`(8677) |
| A99 | 패드 진동 | `_gpVibrate(Q?50:30, Q?300:200)` | 38478 | |
| A100 | 패링 폭발(어픽스) | `parryExplosion` | `~~(meleeRef()×statStr()×parryExplosion)` 반경 100 | 38547 | |
| A101 | 분노 쿨 회복 | 물리탄 패링 | `_physicalParryCut=_resourceMul===3?30:0` 분노스킬 쿨 -30f | 38503-38511 | 프레임당 1회 가드 `_parryCdFrame` |
| A102 | 유니크 패링 트리거 | `_uParryOrbEcho`(5초=300f), `_uKiPrecharge`, `_uHolyParryCd`(영역당 300f 상한), `_uShieldBreakBank` | 38515-38540 | docs 말미 유니크 절과 일치 |
| A103 | 펫 | `_petOnParry()` | 호출 | 38472 | 통계 `_pH++`, `_sStats.parries++` |

### A-7 적 포이즈·그로기
| # | 이름 | 상수·변수 | 값 | 줄 | 설명 |
|---|---|---|---|---|---|
| A104 | 적 포이즈 초기 | `poise`,`maxPoise` | `=_hp` (최대 HP 100%) | 31166 | 변수 `po`(보스 105/`ETYPE_POISE`)는 계산되나(31142) 대입에 쓰이지 않음(추정). 다른 스폰: `baseHp×0.4`(41612), `×0.5`(41688), 일부 `80`(31626) |
| A105 | 일반몹 포이즈 회복 | `poiseR>=200`f | `+~~(maxPoise×0.15)` (비보스만) | 38663-38666 | 포이즈 피해 시 `poiseR=0` |
| A106 | 그로기 시간 | `_poiseHit` | 보스 90f, 일반 180f (`max(기존)`) | 19982-19984 | |
| A107 | 스턴 상한 | `e.stunned>180` → 180 | 보스·일반 공통 | 38622 | `_FULL_STUN=180`, `_MINI_STUN=60` (8668-8669) |
| A108 | 보스 면역 | `e._pImmune` | 그로기 시작 시 300f(5초) 세팅(19985) + 그로기 종료 시 `max(,300)` | 19985, 38632, 34456 | 면역 중 `_poiseHit` false (19977), hurtE 포이즈 블록 제외(42488) |
| A109 | 그로기 종료 | `stunned<=0` | `_poiseReset(e)`(`poise=maxPoise`), 보스는 `idle, st2=30, _teleDropY=0` 강제 | 34456, 38630-38635, 20002-20007 | |
| A110 | 그로기 중 피해 | `e.stunned>0 && !DOT` | `dmg×1.5` | 42338 | |
| A111 | 포이즈 데미지 공식(hurtE) | `poiseHit` 옵션 | `amt=~~(dmg×psM)`, 보스는 `×(atkEl>0?0.2:0.5)`, `+staggerBns`; `psM=opts.poiseMult ?? 1.0` | 42268, 42488-42492 | DOT 제외 |
| A112 | 보스 페이즈/부활 | | 페이즈 전환 `maxPoise×1.2`(38256, 현재 포이즈 유지); 부활 `maxPoise×1.5`, 현재 25%(42557) | | |
| A113 | 칼등 포이즈(hitArc shield) | `poiseDmg` | 보스 `~~(maxPoise×0.15)`, 일반 `~~(dmg×2.0)`; 실패 시 `stunned=max(,30)`+"흔들!" | 37625-37630 | 그로기 시 `hitStop=_HS.groggy(8)`, shake 16 |
| A114 | 약점(mult≥2) | | `e.stunned+=35` | 37632 | |
| A115 | 대왕치기(_gSlamHit) 포이즈 | | 보스 `maxPoise×0.25`; 일반 미니스턴 `_MINI_STUN`, 포이즈 0이면 풀스턴 `min(300,150+(Lv-1)×15)×mult` | 46544-46552 | |
| A116 | 기동파괴 | | 보스 `maxPoise×0.30` | 46330 | |
| A117 | 그로기 연출 | `_poiseHit` | `SFX.groggy()`, 텍스트 "💥 그로기!"(`#ff8800`, 60), `slowMo=20`(히트스톱 무시 중이 아니면), 링 파티클 14 | 19993-19996 | |
| A118 | 그로기 히트스톱 | `_HS.groggy` | 8f | 8685 | |

### A-8 적 근접 패링 포인트(`isPWin()` → `doParry` + `_poiseHit`)
`isPWin()`이 참이면 해당 공격을 패링으로 처리한다. 패링 성공 시 `parryBank += …`, `doParry(e.atk,e.x,e.y,false,e.el)`, `_poiseHit(e, 수치)`, 일부는 `e.stunned`·반격 `hurtE`. 20개 지점(전부 L40536~41366):

| 줄 | 공격(case) | 적 스턴 | `_poiseHit` | 반격 데미지 `_pd` | parryBank 가산 |
|---|---|---|---|---|---|
| 40536 | eCharge | (0) | 20 | — | `e.atk||10` |
| 40546 | eSwoop | (0) | 20 | — | `e.atk||10` |
| 40589 | bossFanWaveAim | 60 | 20 | `_ppd` | `_ppd` |
| 40630 | bossRadialAim | 60 | 20 | `_ppd` | `_ppd` |
| 40686 | bossCharge | 90 | 20 | `(baseAtk+wp.atk+enh)×5×pParryDmg()` | — |
| 40738 | bossLaser | (0) | 20 | — | `~~(e.atk×1.6)` |
| 40769 | eShieldBash | (0) | 20 | — | — |
| 40831 | bossMeteor | (0) | 20 | — | `~~(e.atk×1.5)` |
| 40885 | bossSpin | (0) | 20 | — | `~~(e.atk×1.2)` |
| 40962 | bossMultiDash | 90 | (없음) | `…×4×pParryDmg()` | `_pd` |
| 41036 | bossTeleDrop | 60 | 20 | `…×3×pParryDmg()` | `_pd2` |
| 41070 | bossDruidErupt | 60 | 20 | `…×4×pParryDmg()` | `_pd` |
| 41094 | bossSlash | 60 | 20 | `…×3×pParryDmg()` | `_pd` |
| 41131 | bossSlam | 80 | 20 | `…×4×pParryDmg()` | `_pd` |
| 41162 | bossSweep | 60 | 20 | `…×3×pParryDmg()` | `_pd` |
| 41264 | bossDelaySlashSwing | 70 | 20 | `…×3.5×pParryDmg()` | `_pd` |
| 41281 | bossPerilThrust | 120 | **60** | `…×5×pParryDmg()` | `_pd` |
| 41315 | bossCrescendo | 30 | **15** | `…×2×pParryDmg()` | `_pd` |
| 41347 | bossSBash | 60 | **25** | `…×3×pParryDmg()` | `_pd` |
| 41366 | bossItemSteal | (0) | 20 | — | — |

- 반격식 `(baseAtk+wp().atk+enhMulAtk(wp().enh))×배수×pParryDmg()` 의 괄호는 코드 그대로(`P.baseAtk+(wp().atk||0)+enhMulAtk(wp().enh||0)`).
- 보스 공격 데이터 `_PARRYABLE_ATK` Set(23종): charge, slashCombo, slam, sweep, tailSwipe, spin, multiDash, teleStrike, swordWave, jump, judgeCut, delaySlash, perilThrust, phantomSwords, crescendoCombo, tideWave, rewindStrike, mirrorClone, shieldBash2, mirrorGuard, chainLightning, cageTrap, doppelganger (L37703, 적용 L37705 `e._atkParryable`).
- 적 근접 비-패링 피격식 예: eCharge `hurtP(~~(e.atk×30×elMul))` + 넉백 100 (40537), eSwoop `e.atk×1.8` + 넉백 6 (40547), bossPerilThrust `e.atk×2.5` (41283).

### A-9 투사체 패링 분류·정책
| # | 이름 | 값 | 줄 | 설명 |
|---|---|---|---|---|
| A119 | `_projectileParryClass(p)` | `p.parryClass` 우선 → fbEnergy/fdEnergy/mine/trap/blackBean=`magic`; friendly/noParry/bomb/web/poisonZone/iceZone/blizzard/dimRift/elemBall/_coralSpike=`forbidden`; gbBean/blueBean/fireMagic/waterBean=`magic`; titanEye/bwBean=`physical`; 그 외 `el===P(0)?'physical':'magic'` | 16913-16923 | 입력 구분 SSOT |
| A120 | `_eCanReflectProjectile(p)` | friendly/noParry/blackBean/대형에너지탄 제외, `physical`이거나 `magic`이면서 sBash+`_stWingT>0`+`shieldFuse` | 16925-16929 | E 반사 가능 조건 |
| A121 | 물리 자원 배율 | 3 (시각 2배) | 16931-16933 | |
| A122 | 입/뱀탄 | `_isPhysicalMouthProjectile(p)` → E 전용 | 17042 | Q 시도 시 오패링(34914) |
| A123 | 오패링(빨콩·입탄) | `_hurtProjectilePlayer(p,p.dmg,{dtype:'parry',redBean:true})`, `P.iframes=3`, "❌ E키로! -dmg", 빨콩은 추가로 화상 `{total:dmg×2,t:600,tick:0}` 최대 10중첩, 넉백 6, `shake(12)`, `slowMo=max(,8)` | 34914-34932 | 대상 반경 `_wrongR=100` |
| A124 | 무지개 폭발(접촉) | `_bkD=max(~~(mhp×0.15×(1-RDR)), ~~(dmg×0.7×(1-RDR)))`, 중독 `{total:_bkD×2,t:600}` 최대 10, 포이즈 -2, 넉백 7, `iframes=max(,15)`, 폭발 반경 120 `max(120,~~(dmg×2))` | 34975-34999 | 패링 중이면(`_bkQParry`) 접촉 폭발 안 함 |
| A125 | 대형 에너지탄 | `_resolveBigEnergyParry(p, ~~(pParryProjDmg(dmg,_sbPW)×1.5))`, 패링 반경 `max(P.r+sz+90, 100/해제반경)` | 34898-34908 | |
| A126 | Q 눌림 패링 반경 | 100 고정; 해제 패링 `_sbReleaseR`; 투사체 스캔 반경 `max(400, qScanR)` | 34842-34843, 34850 | |
| A127 | 일반탄 피격 | `_hurtProjectilePlayer(p,~~(dmg×elMul(p.el,ar().el)),…)`, `dtype=redBean?'parry':'magic'` | 35091 | 회전참 중이면 흡수 `0.15+pGuard×0.01`(캡0.25) (35034) |
| A128 | 회전기폭 합체 | 흡수 `min(.30,.20+detLv×0.005)` | 35067 | parryBank 적립 |

## 표 B. 함수

| 함수 | 줄 | 입력 | 출력·부작용 | 호출하는 곳 |
|---|---|---|---|---|
| `isPWin()` | 38471 | — | `(sBash && st2>20-_lParryWinTicks())||_kiParryT>0||(sBlock&&_sbParryT>0)||(peaceShield&&_sbParryT>0)||(P.s∉{whirlwind,beam,elecRepent}&&_sbParryT>0)` | 적 근접 패링 지점 20곳(표 A-8), 투사체 판정(34864) |
| `doParry(inDmg,px,py,forceQ,parryEl,resourceMul,impactKind)` | 38472-38577 | 반사 전 데미지, 위치, Q 여부, 속성, 자원배율, 임팩트 종류 | 무적 25f, 회복, 포이즈+1, 기동/분노/악의오브, 히트스톱/슬로모/흔들림, 사운드(`q_parry` 또는 `sword_parry`+`sword_back*`, `voice_parry*`), VFX(`_rainbowImpact`/`_dark02Impact`/`_addBoom(...,'physical')`/Lightning 콤보), 파티클 12, `⚡PARRY!`(`#ffdd00`,45) | 투사체 판정(34943~35064), sBash 반사(33397~33486), 적 근접(표 A-8), hurtP 해제/눌림(43445, 43453, 43477) |
| `hurtP(dmg,opts)` | 43417-43609 | 피해, `{dot,redBean,ang,src,dtype,projHit,knockback,…}` | 즉시 return 조건(A89) → 해제패링(43443) → peaceShield(43450) → sBlock(43473) → DR·쉴드·HP 감소 → 포이즈/기절/경직 → 넉백·플래시 → 어픽스(counterHit/thorns/reflect/lastStand) → `die()` | 투사체 `_hurtProjectilePlayer`(16998), 적 근접, 장판 등 |
| `_poiseHit(e,amt,label)` | 19974-19999 | 적, 포이즈 피해, 라벨 | `e.poise-=amt`; 0이면 그로기(보스 90/일반 180f), 보스 면역 300f, SFX/텍스트/파티클, 유니크 훅(`_uSkyPoiseRefund`,`_uPoiseOrbFracture`) | hurtE(42492), hitArc(37627), `_gSlamHit`(46545), `_detonateBlast`(43356), 적 패링 지점 |
| `_poiseReset(e)` | 20002-20007 | 적 | `poise=maxPoise; poiseR=0` | 그로기 종료(34456, 38630) |
| `_isFocusState()` | 43415 | — | A7 8상태 | hurtP, 포이즈 0 분기 |
| `_sBashFire()` | 38451-38458 | — | `useStPct('shield')`→`_sBashChgMul=1; _atkBon=~~(_lastCost×1.5); P.s='sBash'; st2=20`, 모션, `maliceSwipe` 숙련, 목소리 30%, `shieldThrow` 자동 발사 | sDraw 탭 확정(33675) |
| `_kgRelease(tier,mult)` | 38461-38470 | 단계, 배율 | `_sBashChgMul=min(3,max(1,mult))`, `P.s='sBash'; st2=20`, 실버테일이면 `iframes=max(,8)` | kiGather(33729, 33733) |
| `_sdTapOk()` | 38449 | — | 버퍼 3프레임 확인 후 소모 | E 키 처리(위치 미확인) |
| `_eSwingRadius(chg)` / `_eSkillRangeMul()` / `_wingStrikeLevel()` | 3493 / 3492 / 3491 | | A40 | sBash, 반사 |
| `_gSlamHit(dir,range,arcW,dmg,el,kbM,psM,stunRange)` | 46529-46568~ | | 반경 안 적에게 `hurtE(…,{kbMult,noPoise:true,noImpact:true})` + 포이즈(보스 25%/일반 미니스턴·풀스턴) | sBash 타격(33427) 외 대왕치기 등. **`dir`/`arcW`는 읽은 범위(46529-46568)에서 판정에 쓰이지 않음(원형 범위로 보임) — 이후 구간 미확인** |
| `hitArc(angle,range,arcW,baseDmg,el,type)` | 37605-37660~ | | `type==='shield'`이면 `poiseHit:true`, 칼등 그로기/흔들림 | 무기/방패 근접 |
| `pParryProjDmg` / `pParryDmg` / `pParryRmbSpd` / `pParryRainbowDR` / `pGuardAbsorb` / `pShieldBlock` / `pShieldMul` | 28038 / 28024 / 28039 / 28040 / 28055 / 28054 / 28053 | | A56-A58, A70 | 투사체·적 근접 반격 |
| `_lSbParryT()` / `_lParryWinTicks()` | 16625 / 16624 | | A60, A35 | sBlock 진입/해제 |
| `_sBlockChargeRadius` / `_sBlockProjectileZone` | 14313 / 14317 | | A64, A65 | sBlock 해제/투사체 판정 |
| `_enterPeaceShield()` | 14321 | | `P.s='peaceShield'; _psShieldR=100; _sbParryT=_lSbParryT(); parryBank=0` | Q 처리(14302, 33551, 33657) |
| `_detonateBlast(label,el)` | 43304 | | A74 | 자동/해제/지진 등 |
| `_projectileParryClass` / `_eCanReflectProjectile` / `_physicalProjectileMultiplier` / `_isPhysicalMouthProjectile` | 16913 / 16925 / 16931 / 17042 | | A119-A122 | 투사체 루프 |
| `_parryHomingTarget()` | 18763 | | 프레임당 1회 캐싱한 반사 유도 대상(적) | 투사체 패링 |
| 투사체 충돌 루프(update 내) | 34836-35100~ | 모든 `projs` | `_qZone`, 오패링, 빨콩/입탄/titanEye E 반사, 무지개 접촉, bwBean/gbBean, 회전참 흡수, 일반탄 Q/피격, 반사탄 착탄 폭발(35102~) | 매 프레임 |
| 사슬 이동 발사(키업) | 13335-13365 | KeyUp ShiftLeft | `_dashHold` 해제, 단계 결정, 게이지·ST 소비, `_harp*` 세팅, 사운드(`chain_throw`,`chain_fly`,`chain_dash*`), 텍스트 `⛓️ 사슬!`(`#ffaa00`,35) | 키 이벤트 |
| 사슬 이동 업데이트 | 32168-32384 | `_dtSp` | 게이지 회복, 홀드 단계, 자동 발사, 비행→꽂힘→끌림→착지(iframes 48) | update 루프 |
| `P.s==='charge'` 상태 | 33962-34018 | | 구 관통 돌진 | 진입점 미확인 |
| `stCost(key)` / `useStPct(key)` | 31986 / 31993 | | `weapon`: kiSlash 10+(Lv-1)×2 또는 5; `shield`: 5+(maliceSwipe-1)×2; 기타 `~~(base×_dpsCostMul×m×_stDisc)`, 최대 `mst×0.9` 캡 | 모든 ST 소비 |
| `_harpDistTier` / `_harpAvailableDist(tier,gauge)` | 12852 / 12864 | | `거리×min(1,gauge/cost[tier])` | 발사 |
| 포이즈 틱(적) | 38662-38666 | | A105 | updateE |
| 스턴/그로기 틱(적) | 34451-34456, 38619-38637 | | 타이머 감소, 종료 처리 | update/updateE |
| `ParryLesson.hit/miss/holdRelease/physicalParry/tick/fireVolley` | parry-lesson.js 409/447/576/582/468/549 | | 패링 연습(표 C 말미) | hurtP 시작(43418)·투사체 루프·doParry 시작(38472 `_lesson?.physicalParry`) |

## 표 C. 상태 흐름

| 단계 | 사슬 이동(Shift) | 칼등 처내기(E) | 보호막/패링(Q) | 근거 줄 |
|---|---|---|---|---|
| 획득 | 돌진스킬 보유 여부로 스톡·게이지 칸 결정 | 기본 보유(`maliceSwipe` 숙련 Lv로 배율) | 기본 보유, `detonate`·`peaceShield` 합체로 변형 | 32781-32787, 33418, 14302 |
| 슬롯/입력 | `BINDS.charge` 탭/홀드(`_dashHold`) | `BINDS.shield` → `sDraw`(10f 유예) | `BINDS.parry` → `sBlock` | 13335, 33663, 33552 |
| 사용 | 키업 또는 3단 자동 발사 → 게이지·ST 소비 → 비행 → 꽂힘 → 끌림 | 탭=sBash(20f), 홀드=kiGather 차징→릴리즈 sBash | 누름=창 20f, 홀드=보호막, 해제=창 12f | 13342-13365, 38451-38470, 33752-33760 |
| 판정 창 | 이동 중 `iframes≥2`(+`_dashIframe` 값), 경로 40px 적 히트 | 앞 16틱(st2>4) 패링 + 12f째 타격 | sBlock 20f 눌림 패링(반경 100), 해제 12f(반경 `_sbReleaseR`) | 32264-32277, 34854, 34880 |
| 쿨다운/후딜 | 게이지(회복 초당 2.5%), 스톡 `chargeCd`, 착지 `iframes=48` | sRecover 28/pParryRmbSpd f, 후딜 4틱 비패링 | `_sbCd` 30f | 32363, 33533, 14308 |
| 성공 시 | — | `doParry`(보상 A92-A103) + 반사탄 | `doParry` + `parryBank+=100`(detonate) | 38472, 43446-43478 |
| 실패 시 | 벽/사거리 도달 시 그 자리 꽂힘 | 후딜 중 피격=포이즈 -1(기절 0) | 창 지남 홀드 중 피격=흡수 ×0.5·피해 ×1.3·포이즈 -1 | 32242, 43483-43491 |
| HUD 갱신 | `#mobilityRing` conic-gradient(게이지/MAX), 갑옷 슬롯 게이지 오버레이 | 포이즈 눈알 4개(`hpEyeL/R`,`mpEyeL/R`) | 보스 포이즈 바 `#bossPoiseF` | 60298, 60340-60342, 35847-35867 |
| 저장 | **저장 안 함**(게이지·포이즈·상태는 런타임) — 세이브 직렬화에서 `_harpGauge`/`P.poise` 미확인 | 〃 | 〃 | 확인 범위(B07 키워드)에서 세이브 키 미발견 |

패링 연습(`parry-lesson.js`, 챕터1 스텝 -3..8 / 챕터2 자원 연습): 스텝0 마법탄 패링(Q), 1 물리탄 패링(E), 2 Q 홀딩+다수 마법탄(5발, 속도 4.8, 해제 `P._sbReleaseR>=300`·충전 ≥120, 한 번에 3발 이상), 3 E 홀딩+다수 물리탄(5발, 속도 6.4, 충전 ≥180, `_sBashChgMul>=3`, 3발 이상), 4 Shift 사슬 이동, 5 방향키+Space 전격이동, 6 패링 분노 축적(10발), 7 Space 분노 발동. 미스 시 `max(1,ceil(mhp×0.1))`(HP 1 하한) 피해, `failTicks=60`, 체력 복구 후 재시도(parry-lesson.js 447-459, 549-575, 576-581, 라벨 5).

## 표 D. HUD·UI·피드백

| 요소 | DOM id / 코드 | CSS·줄 | 표시 규칙 |
|---|---|---|---|
| 기동 게이지 링 | `#mobilityRing` (`.globe-ring`), `#mobilityRingTicks` | HTML 2635-2636; CSS `.globe-ring`(277), `.mp-globe .globe-ring{--ring-col:#ffcc33}`(290) | `conic-gradient(rgba(255,204,51,.95) {pct}%, transparent 0%)`, pct=`_harpGauge/_HARP_GAUGE_MAX×100`(60297-60298). 눈금: `--shift-cell-deg=360×cost[1]/MAX`(60300-60301) = Shift 탭 1회 최소 거리 |
| 포이즈 눈알 | `#hpEyeL,#hpEyeR,#mpEyeL,#mpEyeR` (`.skull-eye`) | CSS 205-209 (`opacity:0` → `.on{opacity:1}`) | 왼쪽→오른쪽 4개. `_pi>=4-_pc`이면 on(`_pc=P.poise`, `pStun`이면 0) (60340-60342) |
| 포이즈 글로우 | `E.mpGlass` filter | 60284-60291 | 포이즈 풀(≥0.99) && 기절 아님 → `drop-shadow(0 0 10px rgba(255,204,68,.7))` |
| 구 포이즈 바 | `#poiseBarWrap` | HTML 2591, CSS `display:none!important`(323) | 비표시 |
| 보스 포이즈/그로기 바 | `#bossPoiseF`, `#bossPoiseLbl`, `#bossStatus` | HTML 2701 | 평시: 포이즈% 폭(`<30`: `#ff4400→#ff8800`, `<60`: `#ddaa00→#ffcc44`, 아니면 `#aaaaaa→#ffffff`), 라벨 `포이즈 N%`; 그로기(`stunned>0`): 폭=`stunned/_maxStunned`, `#ff6600→#ffaa00`, `그로기! N.Ns`, 테두리 `#ff6600`; 면역(`_pImmune>0`): 폭=`(1-_pImmune/300)`, `#4455cc→#8899ff`, `충전 중 N.Ns`, 테두리 `#4455cc`; 상태 아이콘 6f마다(`그로기`/`면역`) (35847-35877) |
| 사슬 게이지(갑옷 슬롯) | 장비 슬롯 오버레이 | 60355-60357 | `conic-gradient(transparent {pct×360}deg, rgba(0,0,0,.6)…)`, 색 `pct>=1:#44ffaa / ≥.5:#88ccff / else #ff8844`, `trident` 글리프+`~~_harpGauge` |
| 쿨 텍스트 | `showPH('충전 중...')` 등 | 33753 | 전격이동 불가 시 |
| PARRY 텍스트 | `addTxt(P.x,P.y-42,'⚡PARRY!','#ffdd00',45)`, `showPH('PARRY!','#ffdd00')` | 38577 | doParry 말미 |
| 오패링 텍스트 | `❌ E키로! -dmg` (`#ff4444`/`#eeeeee`, 50) | 34917, 34925 | |
| 패링 실패 텍스트 | `⚠패링 실패!` `#ff6644` 30; 보호막 `🛡 보호막 N%`(실패 `#ff6644`, 성공 `#4488ff`, 22), 평화 `🕊️ 평화보호 N%` | 43466, 43496, 43470 | |
| 히트스톱 | `_HS`: parry 6, parryReflect 7, charge 2, chargeHit 3, chargeWall 3, meleeSh 3, groggy 8, pStun 5, proj 3, projGroggy 8, projBomb 5, projBombBlue 9, finisher 5 | 8674-8687 | 값×`OPT.hitStop/100` |
| 슬로모 | doParry 25f; 그로기 20f(히트스톱 무시 중 아니면); 무지개 오패링 `max(,8)`; 기폭 `25+chgBars×5` | 38478, 19995, 34928, 43330 | |
| 화면 흔들림 | doParry 14(기폭 충전 중 6), 사슬 착지 `3단30/2단20/1단10`, sBash 타격 10, 기폭 `(14+chgBars×4)`, 오패링 12 | 38478, 32378, 33432, 43330, 34927 | ×`OPT.shake/100` |
| 사운드 | Q 패링 `q_parry`(.9), E 패링 `sword_parry`+`sword_back[,2,3]`(.5), `voice_parry1-4`/`male_grunt`, `SFX.deflect()`, `SFX.groggy()`, `shield_activate`(.8)/`shield_end`(.7)/`shield_hit`(흡수, .6), `chain_throw`/`chain_fly`/`chain_stick`/`chain_land`(1단)/`chain_land2`(3단)/`chain_dash1-4`, `scarecrow_charge`(차징 단계), `SFX.shieldBash()`(무지개 접촉), `SFX.detonate()` | 38472, 38575, 33552, 33763, 34893, 13359, 32246, 32377, 33718 | |
| VFX | `_dark02Impact`(Q), `_rainbowImpact`(무지개), `_addBoom(...,'physical')`(물리탄 E), Lightning(`_TVFX2_COMBOS[2]`, ×1.2), `fire_medium`(빨콩), `bossWaterImpact`/`bossFireQImpact`, 파티클 12(방사), 착지 `land_fire`(0.35), 차징 파티클, 진동파 `_gSlamWave`(r40→maxR=`_gsRange2×1.6`, 35f) | 38548-38577, 34942, 32379, 33431 | |
| 화면 플래시 | `doHitFlash(_parEC,0.25)`: 색 `physicalProjectile→#fff`, `red→#ff2200`, `rainbow→#ff00ff`, 그 외 `ELC[el]||#00ccff`; 피격 `scrFlash rgba(200,0,0,.25)`; 무지개 폭발 `rgba(255,60,0,.35)` | 38574-38575, 43596, 34990 | |
| 패링 연습 HUD | 챕터 체크리스트·`lesson-*` 요소, 홀드 게이지 | parry-lesson.js | 위 표 C 말미 |
| 그리기(상태 스프라이트) | sBlock `59677~`, pStun `59747~`, sBash 불꽃칼날 `59024-59048` | 줄만 기록, 상세 미확인 | |

## 표 E. docs ↔ 코드 차이 (docs `2_3`은 수정금지 — 사실만 기록)

| # | docs | 코드(기준) | 중요도 |
|---|---|---|---|
| E1 | pStun "480f(8초, ccRes 최대 30%)" 및 포이즈 절 "300f(5초)" | `P.st2=~~(240×(1−min(0.5,ccRes+stunRes)))` → 기본 240f(4초), 최대 감소 50% (L43587, 43465, 43490, 34984). docs가 서로도 모순 | **높음** |
| E2 | "일반 피격 후 무적 30f(0.5초) — 연속 피격 방지" | 비-DOT 피격 시 `P.iframes=0`을 대입(L43584), 후속 무적 없음. 한방캡만 60f(L43523). **패링 실패 기절만 `iframes=60`** (L43465, 43490, 34984) | **높음** |
| E3 | "기절 진입 시 무적 없음" | 일반 피격 기절은 맞음(대입 없음). **패링 실패/무지개 폭발 기절은 `P.iframes=60`** (L34984, 43465, 43490). 무지개 폭발은 별도로 `iframes=max(,15)`(34987) | 높음 |
| E4 | doParry "HP/ST/MP 회복 E=30, Q=50" | E·Q 모두 `50×(1+parryBonus)×(1+pRegen×0.2)`; 빨콩 ×0.5, 무지개 ×1.5, 물리 ×3 (L38485-38486) | **높음** |
| E5 | "iframes 25프레임" | 18→25로 덮어써 최종 25 (L38473, 38487) — 일치 | 일치 |
| E6 | "기동게이지 +10 (MAX 300 캡)" | `+(5/10/15)×resource×2` = 일반 +20(물리 +60), 빨콩 +10, 무지개 +30; 캡 `_HARP_GAUGE_MAX`(기본 225, 칸수에 따라 270~450+extraST) (L38493-38494, 12882) | **높음** |
| E7 | "악의오브 +1000" | `(500/1000/2000)×resource×2` → 일반 2000(물리 6000), 빨콩 1000, 무지개 4000 (L38544) | **높음** |
| E8 | 패링 윈도우 "20프레임, 해제 후 12프레임" | Q 눌림 20f(`_lSbParryT`, 망토 보정 가능), 해제 12f — 일치. sBash는 별도 16틱 | 일치 |
| E9 | sBash "뒤 4틱(st2≤4)" 후딜 / 다른 문단 "뒤 10틱" | 코드: 활성 `st2>20-_PARRY_WIN`(=st2>4) → **뒤 4틱**(L34854, 38471). 헛침 처벌 문단의 "10틱"은 코드와 불일치 | 중간 |
| E10 | "`isPWin()`·투사체 반사 게이트 모두 `_PARRY_WIN`" | isPWin은 `_lParryWinTicks()`(망토 보정)를 쓰고, 투사체 게이트 `_sbActive`는 보정 없는 `_PARRY_WIN`(L38471 vs 34854) → 망토 장착 시 두 판정이 어긋남 | 중간 |
| E11 | `_parryR` 110+bonusRange×4+pParry×2+parryBonus×20, 최대 140 / `_parryRDet` 140+…×6/×3/×30, 최대 200 | 일치(L34860-34861). 단 `_chgMP`(차징 배율×`_eSkillRangeMul`)가 곱해져 140·200 상한을 넘을 수 있음 | 중간 |
| E12 | 보스 포이즈 "HP×0.5" 및 "보스 포이즈 = HP 100%"(모순) / 일반몹 "HP×0.5" | 일반·보스 모두 `poise=maxPoise=HP`(L31166). 일부 소환체 `×0.4`/`×0.5`(41612, 41688) | **높음** |
| E13 | 그로기: 보스 90f·스턴 캡 180f·면역 300f, 일반 180f | 일치(L19982, 38622, 19985) | 일치 |
| E14 | 보스 포이즈 삭감 "대왕치기 25%, 기동파괴 30%, 기폭팔 20%, 칼등치기 15%" | 일치(L46545, 46330, 43356, 37625) | 일치 |
| E15 | "패링 시 고정값 (패턴별 15~60)" | 20개 지점 중 대부분 20, 60(bossPerilThrust), 15(bossCrescendo), 25(bossSBash), 일부 0(포이즈 미삭감: bossMultiDash) (표 A-8) | 낮음 |
| E16 | 무지개탄(blackBean) Q 패링 "pParryProjDmg×3, AoE×2, life 300" | Q 경로에서 무지개탄은 일반 마법 분기(`×1.5`, life 180, `_aoeR=0`)로 처리(L35054-35060). 별도 무지개 분기는 이번 탐색에서 미발견(추정: docs 수치는 구 경로) | 중간 |
| E17 | 일반탄 Q "max(탄뎀,무기뎀)×1.5×pParryDmg()" | `pParryProjDmg(…)×1.5`(탄뎀×0.5×장비보너스×pParryDmg×parryBonus×legSP, 최소 기검참 1방) — 식 구조 다름 | 중간 |
| E18 | 칼등처내기 반사 "×1.5×Lv배율×_msReflect×pParryDmg()×날개, life 80" | `pParryProjDmg×(1.5+(Lv-1))×_msReflect×(날개1.5)`, life 80 (L33482-33483) — 구조 유사·식 다름 | 낮음 |
| E19 | 빨콩 E "×1.5, 속도 7, AoE×2, life 240" | 투사체 경로 일치(L34940). 칼등치기 타격 경로는 `×(2.5+(Lv-1))`/`×1.8` 별도 수치(L33473, 33494) | 중간 |
| E20 | 오패링 "탄뎀 100% + ❌ E키로!" | 일치. 추가로 빨콩은 화상 중첩(데미지×2/10초/최대 10)·넉백 6 (L34924-34926) | 낮음 |
| E21 | "보호막 쿨다운 30프레임" | `~~(30×(1+shieldCdRed))` (L14308) | 일치 |
| E22 | 보호막 흡수율 표 | `pGuardAbsorb`=min(0.50,0.30+pGuard×0.02+shieldBlockDR) (L28055) — 일치(shieldBlockDR 어픽스가 합산됨) | 일치 |
| E23 | 패링 실패 "×1.3·흡수 ×0.5·포이즈 -1·넉백 3→5·셰이크 4→8" | 일치(L43483-43496) | 일치 |
| E24 | 기폭팔 "2초(120f) 자동폭파, 해제는 2초 이상 홀드 시만" | Q 홀드 중 `parryT>=120` 자동폭파(L33746), 해제 패링 시 `parryT>=120`(L43446) — 일치 | 일치 |
| E25 | 포이즈 "무지개탄 2칸" | 일치(L34983) | 일치 |
| E26 | 돌진 "착지 무적 48f" | 일치(L32363, 33967, 34018) | 일치 |
| E27 | "탈출: Shift/Ctrl/전격이동/Space" | `isJust('charge')`·Shift 홀드 중 사슬/대시, `isJust('skill7')`(=Ctrl 탈출기로 추정), 전격이동 트리거 (L34343-34345). Space 직접 해제는 없음 | 낮음 |
| E28 | "집중 스킬 4곳 적용" | `_isFocusState` 사용처: hurtP 포이즈 0 분기(43465, 43490, 34984), `if(!_isFocusState())` 포이즈 감소(43584), 무지개 폭발(34984) 등 확인 | 일치(세부 미확인) |
| E29 | 사슬/돌진 설명이 "돌진 시스템 (P.s==='charging')" | 코드에 `P.s==='charging'`은 AI 회피 조건(40121) 및 `_isAtkState`(34858)에만 등장. 플레이어 돌진 본체는 `_harp*`/`_dash*` 사슬 이동 | 낮음 |
| E30 | docs는 사슬 이동 수치(거리·게이지·ST·무적)를 거의 적지 않음(설계 외) | 표 A-2가 코드 기준 전부 | — |
| E31 | docs 주석 "Shift 릴리즈: ST 퍼센트 소비: 1단25% 2단50% 3단100% 4단300%" (코드 주석 L13335) | 실제 `P.mst×0.01×tier`(1/2/3%) (L13343) — 코드 주석이 구값 | 중간 |

## 표 F. Unity 현재 상태 (`origin/claude/unity-pc-inventory-u04-20261026 @ 6c8ed9d91`, git grep 읽기 전용)

| 항목 | 상태 | 근거 |
|---|---|---|
| 플레이어 포이즈 4칸 | **있음(단순화)**: `Player.Poise`(초기 4 추정), `HurtPlayer`에서 `Poise-1`, 0이면 `State="pStun"; StateTicks=240; CancelKiCharge()` — **정수 240f는 웹과 일치**, ccRes/stunRes 감소·집중 면역·hitStop 5f·패링 실패 경로 없음 | `Core/Simulation.cs:364-376` |
| 경직 stagger | **있음**: `StateTicks=6`, 기검참 차징 중이면 면역 | `Core/Simulation.cs:373-374` |
| pStun/stagger 종료 | **있음**: `StateTicks<=0` → `idle`, `Poise<=0`이면 4로 복원. **웹의 `iframes=60/30`, `P.poise=4` 탈출기 해제 없음** | `Core/Simulation.cs:103-105` |
| 무적 프레임 | **일부**: `Iframes` 감소 틱만 있고 `HurtPlayer`는 `Iframes>0`이면 return. 웹의 착지 48f·패링 25f·한방캡 60f·기동 무적 미이식 | `Core/Simulation.cs:101, 366` |
| 피격 공식 | **일부**: `dr=min(.75, def/(def+2500))`, 한방캡 `MaxHp×0.33`, 최소 `MaxHp×0.005`, 쉴드 먼저 — 웹의 배리어·조건부 DR·회피·어픽스·lastStand 없음 | `Core/Simulation.cs:366-375` |
| 적 포이즈 | **있음**: `Poise=MaxPoise=hp`(웹 L31166과 일치), `poiseHit&&damage>0`이면 `Poise-=damage`(웹은 `~~(dmg×psM)`·보스 ×0.2/0.5 저항 미이식), 0이면 `Stunned=max(,180)`. 보스 90f/면역 300f/그로기 1.5배 데미지 없음 | `Core/Simulation.cs:71, 232-236` |
| 적 포이즈 회복 | **있음**: 200틱마다 `+(int)(MaxPoise×.15)`(웹 일치, 보스 구분 없음 — "admitted ordinary profile"이라 주석) | `Core/Simulation.cs:324-328` |
| 그로기 종료 | **일부**: `MaxStunned` 리셋만(보스 `_poiseReset`·idle 강제·면역 미이식) | `Core/Simulation.cs:153-154` |
| 패링(Q)/칼등 처내기(E)/보호막 | **없음 = 미이식**: `Q`/`E` 키 입력 시 `Toast("패링·방패 기능은 아직 사용할 수 없습니다")`만 표시 | `NativeGame.cs:148` |
| 사슬 이동/돌진(Shift) | **없음 = 미이식**(`ShiftLeft` 게임 입력 처리 미발견) | — |
| 기동 게이지 `_harpGauge` | **없음**(HUD `mobilityRing` 대응 미발견) | — |
| HUD 포이즈 눈알 | **있음**: `PoiseEyes[i]= i>=4-poise`, `State=="pStun"`이면 0 (웹 60340과 동일) | `Core/HudValues.cs:31, 50-52` |
| 기검참(kiSlash) | **있음(B07 밖)**: 차징 틱 상한 120, `PoiseHit=true` | `Core/KiSlash.cs`, `Simulation.cs:123-133` |
| 패링 연습 | **일부**: 첫 연습(FirstPractice)은 기검참 중심, 웹 parry-lesson.js 대응(Q/E 패링 연습) 미발견 | `Core/FirstPractice*.cs` |
| 인벤토리 스탯 | **있음**: `bonusRange`/`charge`/`chargeW`/`chargeAoE`/`potCd` 등 장비 필드·비교 UI만 | `Core/InventoryData.cs:11-12` 등 |

## 표 G. 이식 시 소유 추정

| 구분 | 내용 | 소유(추정) |
|---|---|---|
| **순수 상태(Core, PC 가능)** | 판정 창(`_PARRY_WIN`=16, 눌림 20, 해제 12, `_SD_GRACE`=10, 망토 보정 식), 반경 식(`_parryR`/`_eSwingRadius`/`_sBlockChargeRadius`/`_sBlockProjectileZone`), 입력 구분 분류(`_projectileParryClass`), `doParry` 보상 수치(A92-A103), `pParryProjDmg` 등 데미지 식, 포이즈 4칸·pStun 240f·집중 면역·탈출 규칙, `hurtP` 방어 순서(해제패링→peaceShield→sBlock→DR→쉴드→포이즈), 적 포이즈/그로기/면역(`_poiseHit`, 틱), 기동 게이지(코스트·최대·회복·단별 거리·ST), 사슬 이동 상태기계(비행→끌림→착지 iframes 48), 적 근접 패링 20지점의 수치(표 A-8), 반사탄 변환 규칙 | PC(Core) |
| **HUD 표시(NativeHud = Codex, patch)** | `mobilityRing`(conic-gradient, 눈금 셀각), 포이즈 눈알(이미 `HudValues.PoiseEyes`), 보스 포이즈/그로기/면역 바(색·라벨 규칙), 플로팅 텍스트(`⚡PARRY!`, `❌ E키로!`, `⚠패링 실패!`, `🛡 보호막 N%`, `⛓️ 사슬!`, `💥 착지!`), 차징 단계 연출, 상태 스프라이트(sBash 불꽃칼날, sBlock, pStun) | Codex(patch) |
| **입력(NativeGame = Codex, patch)** | Q/E/Shift 매핑(현재 Q/E는 토스트 차단), E 탭/홀드 판정(10f), 더블탭 전격이동 연계, 마우스 에임(`_aimDir`/`P.facing`), 게임패드 매핑(LT+ABXY 등은 B11 문서 참조) | Codex(patch) |
| **결정 필요** | ① 코드에 남은 구 `P.s==='charge'` 돌진(진입점 미확인)을 이식할지 ② 망토 보정과 투사체 게이트 불일치(E10) 유지 여부 ③ 기동 게이지 최대(웹 225 기본) 표시 기준 ④ pStun HUD/상태 스프라이트 범위 ⑤ 적 근접 패링 20지점의 스턴 값이 0인 지점(미삭감) 유지 | 총괄 |

## 이식 시 Codex patch가 필요한 지점 (요약)

1. `NativeGame.cs:148` Q/E 토스트 차단 해제 + Q/E/Shift 입력 라우팅(E 탭/홀드 10f 규칙 포함).
2. `Core/Simulation.HurtPlayer`: 해제 패링·peaceShield·sBlock 분기, 패링 실패 처리(흡수 ×0.5·×1.3·포이즈 -1·기절 시 iframes 60), 집중 상태 면역, pStun 탈출기 해제(iframes 30/60), 기절 hitStop 5f.
3. `Core/Simulation` 플레이어 상태: `sBash`/`sRecover`/`sDraw`/`kiGather`/`sBlock` 틱(st2, 타격 12f째, 활성 4<st2 등)과 `_gSlamHit` 대응(적 범위 포이즈).
4. 사슬 이동 상태기계 + 기동 게이지(코스트·회복·최대)와 HUD `mobilityRing` 값 공급.
5. 적 근접/투사체 패링 판정 루프(표 A-8, A-9)와 `doParry` 보상(자원·분노·악의 연동은 B11 `Materials`와 연결).
6. 적 포이즈: 보스 저항·그로기 90f·면역 300f·`_poiseReset`·그로기 중 1.5배 피해.

> 미추출(범위 밖/미확인): 전격이동 `bladeDash`·`ghostWalk`·`iceOrb` 수치, `_hurtFieldMobs`/`_shCache` 세부, 합체 스킬 효과(`shieldFuse`/`whirlDet`/`slamStorm` 등)의 전체 수치, sBlock/pStun/sBash 그리기(59024-59048, 59677, 59747), `_sdTapOk` 호출 지점, `P.s='charge'` 진입점, 세이브 직렬화의 B07 키, `_HARP_DMG`/`_gSlamHit` 이후 구간의 용도.
