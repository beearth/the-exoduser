# B05 웹 원본 추출표 — 무기 7종·활(석궁) 3종

> **맥북 총괄 검수 (2026-10-26)**: 작성 = 단순작업2(1차)·단순작업4(완료), 읽기·문서만. 원본 대조로 확인 — `WTYPES` 15863-15871(무기 7종 atkMul 1·stCost 5·spdMul .45·arcW .95·range 50·stagger 8 **완전 동일**), `BOWTYPES` 15886-15890(**석궁 3종**: crossbow/repeater/arcane). 마스터 보드의 "활 5종"은 오기 — 5는 T 슬롯 선택 스킬 수. 코드가 이식 기준이며, 재활용 투사체 관통(정적 해석, 실행 미검증)처럼 의도가 불분명한 것도 웹 동작 그대로 옮기고 oracle로 확인한다. 수치 JSON: `docs/engine/unity_b05/b05_web_values.json`.

- 작성: 단순작업4 (읽기·문서만, 단순작업2 중단분 인수) · 2026-10-26
- 추출 시점 `git -C G:/exoduser rev-parse HEAD` = `b1b69752cb374f498d3a5bc82d2a3bacc389f6ea`
- **줄 번호 기준**: `G:/exoduser/game.html` **작업 트리**(타 세션 미커밋 `M game.html` 포함, 65,694줄). HEAD 대조 없음. 15985줄 이전은 기존 추적(`docs/engine/FDG_SOURCE_TRACE_WEAPONS_20261020.md`, 65,692줄 기준)과 동일, 그 뒤는 **+2줄** 이동. “(trace 인용)”은 그 문서 줄을 +2 보정하지 않고 인용한 것 — 재확인하지 않음.
- 범위: 무기 7종·석궁 3종 정의·수치·함수·호출처. 속성 5종·상성(EL/elMul)은 B06 참조만, 기검참은 B02, 선택 활 스킬 상세는 B03, 강화 경제는 META.
- 코드가 기준(docs와 다르면 표 E). 추정=“추정”, 미확인=“미확인”. 데모 제한: 무기/활 아이템 정의에 `_DEMO_MODE` 분기 없음(미확인 범위: 드랍 생성 시 데모 분기).
- **핵심 사실**: 활은 5종이 아니라 **석궁 3종**(crossbow/repeater/arcane). 무기 7종은 **수치·동작 완전 동일**(이름·이모지만 다름).

## 표 A-1. 근접 무기 7종 WTYPES (L15863-15871)

| 키 | 이름 | 이모지 | atkMul | stCost | spdMul | arcW | range | stagger | 줄 |
|---|---|---|---|---|---|---|---|---|---|
| sword | 검 | ⚔️ | 1.0 | 5 | 0.45 | 0.95 | 50 | 8 | L15864 |
| dagger | 단검 | 🗡️ | 1.0 | 5 | 0.45 | 0.95 | 50 | 8 | L15865 |
| hammer | 해머 | 🔨 | 1.0 | 5 | 0.45 | 0.95 | 50 | 8 | L15866 |
| mace | 메이스 | ⚔️ | 1.0 | 5 | 0.45 | 0.95 | 50 | 8 | L15867 |
| club | 곤봉 | ⚔️ | 1.0 | 5 | 0.45 | 0.95 | 50 | 8 | L15868 |
| axe | 도끼 | 🪓 | 1.0 | 5 | 0.45 | 0.95 | 50 | 8 | L15869 |
| spear | 창 | ⚔️ | 1.0 | 5 | 0.45 | 0.95 | 50 | 8 | L15870 |

## 표 A-2. 석궁 3종 BOWTYPES (L15886-15890)

| 키 | 이름 | 이모지 | atkMul | stCost | spdMul | range | projSpd | 줄 |
|---|---|---|---|---|---|---|---|---|
| crossbow | 석궁 | ⚙️ | 1.0 | 5 | 1.0 | 800 | 22 | L15887 |
| repeater | 연사석궁 | ⚡ | 0.65 | 5 | 1.5 | 700 | 22 | L15888 |
| arcane | 마력석궁 | ✨ | 1.4 | 5 | 0.8 | 840 | 22 | L15889 |

## 표 A-3. 등급별 파생값 (RARITY_MUL L14351 = [1,1.2,1.5,1.8,2.2,2.5], ATK 하한 L15923)

| 등급 | rarity | rm | ATK 하한 | 무기 spd=0.45×rm | wStCost=~~(5×(2-rm×.3)) | wStagger=~~(8×rm) | 석궁 bowSpd (crossbow / repeater / arcane) | bowStCost |
|---|---|---|---|---|---|---|---|---|
| 일반 | 0 | 1 | 0% | 0.45 | 8 | 8 | 1.0 / 1.5 / 0.8 | 8 |
| 고급 | 1 | 1.2 | 5% | 0.54 | 8 | 9 | 1.2 / 1.8 / 0.96 | 8 |
| 희귀 | 2 | 1.5 | 15% | 0.68 | 7 | 12 | 1.5 / 2.25 / 1.2 | 7 |
| 영웅 | 3 | 1.8 | 25% | 0.81 | 7 | 14 | 1.8 / 2.7 / 1.44 | 7 |
| 전설 | 4 | 2.2 | 40% | 0.99 | 6 | 17 | 2.2 / 3.3 / 1.76 | 6 |
| 유니크 | 5 | 2.5 | 50% | 1.13 | 6 | 20 | 2.5 / 3.75 / 2.0 | 6 |

(계산값은 위 식을 그대로 적용한 파생 표 — `toFixed(2)`는 반올림 근사. 실제 spd는 생성 시점 정수 반올림 주의)

## 표 A-4. 상세 정의 (이름 / 상수·변수 / 값 / 줄 / 설명)


### A-4 생성(mkItem)

| 이름 | 상수·변수·식 | 값 | game.html 줄 | 설명 |
|---|---|---|---|---|
| 이름 접두사 표 | _WP_MOD[el][min(tier,4)] | el0 녹슨/강철/흑요석/심판의/천벌의, el1 불꽃/화염/염화/지옥불/멸화의, el2 냉기/빙결/빙하/서리의/영겁빙, el3 그림자/암흑/심연/나락의/무간의, el4 전기/낙뢰/암전/뇌신의/만뢰의 | 15876-15882 | 무기 이름 = 접두사+' '+WTYPES[wt].name. 없는 el은 el0 폴백, 없는 wt는 '무기'(15883). 근접무기 el은 mkItem에서 항상 물리(EL.P)로 강제(15953) |
| 활 이름 표 | bowNames[btype][el][min(tier,4)] | crossbow 낡은/강철/흑요석/미스릴/천벌의 석궁 외 el1~4×5티어(연사석궁·마력석궁 동형) | 15898-15902 | el 0..4 + 티어 5. 표에 없으면 bd.name 폴백(15977). el5(신성)은 활 이름 풀 없음 |
| ATK 상한 _atkMax | ~~((200+tier*200+(P.lv\|\|1))*0.25) | T0 Lv1 = 50, T4 Lv1 = 250 | 15922 | 무기·활·투구(helmet) 공통. 레벨 +0.25/lv. 2차 반감(2026-05-03) 주석 |
| ATK 최소보장 _atkFloor | [0,.05,.15,.25,.40,.50][rarity]\|\|0 | 일반0/고급5/희귀15/영웅25/전설40/유니크50% | 15923 | 배열 6칸 |
| ATK 롤 _atkRoll | max(1,~~(_atkMax*(floor+(1-floor)*random()^2))) | — | 15924 | 제곱 skew(고뎀 희귀). random 1회 소비 |
| 무기 기본 필드 | base.weapon = {atk:_atkRoll, spd:1, antiRevive:+(0.01+0.19*random()^3).toFixed(2)} | — | 15926 | antiRevive random 1회(제곱 아닌 3제곱) |
| 활 기본 필드 | base.bow = {atk:_atkRoll, spd:1, antiRevive:동일 식} | — | 15937 | - |
| 무기 타입 선택 | wt = wtype 인수 또는 WTYPE_KEYS[~~(random*7)] | — | 15959 | 드랍 시 wtype 인수 없으면 균등 랜덤 |
| 무기 ATK | item.atk | ~~(_atkRoll*wd.atkMul) | 15964 | atkMul 전부 1.0이라 사실상 _atkRoll 그대로 |
| 무기 spd | item.spd | +(wd.spdMul*rm).toFixed(2), rm=RARITY_MUL[rarity]=[1,1.2,1.5,1.8,2.2,2.5] (L14351) | 15965 | 0.45×rm: 일반 .45, 고급 .54, 희귀 .68(.675→.68 toFixed), 영웅 .81, 전설 .99, 유니크 1.13(1.125) |
| 무기 ST 비용 wStCost | item.wStCost | ~~(wd.stCost*(2-rm*.3)) | 15966 | 일반 ~~(5×1.7)=8, 유니크 ~~(5×1.25)=6. 표시·점수에만 사용(실제 공격 ST는 stCost('weapon')=5, 31987) |
| 무기 호 wArcW | item.wArcW | +wd.arcW.toFixed(2)=0.95 | 15967 | - |
| 무기 사거리 wRange | item.wRange | ~~(wd.range*(0.95+random*0.1))=47~52 | 15968 | random 1회 |
| 무기 경직 wStagger | item.wStagger | ~~(wd.stagger*rm) | 15969 | 표시·점수 참조만(실제 경직은 hurtE 기본) — 소비처 미발견 |
| 무기 거리 보너스 bonusRange | item.bonusRange | min(3,~~((1+tier*.4+rarity*.5)*(0.8+random*0.4))) | 15970 | 활도 동일 식(15984) |
| 활 타입 선택 | bt2 = wtype 인수 또는 BTYPE_KEYS[~~(random*3)] | — | 15974 | BOWTYPES에 없으면 공통 item 조기 반환(15975) |
| 활 ATK | item.atk | ~~(_atkRoll*bd.atkMul) | 15979 | crossbow ×1, repeater ×.65, arcane ×1.4. 발사식 _fireXbow에서 타입 atkMul을 다시 곱함(이중 적용, 28710 부근) |
| 활 공속 bowSpd | item.bowSpd | +(bd.spdMul*rm).toFixed(2) | 15980 | crossbow=rm, repeater=1.5×rm, arcane=.8×rm |
| 활 ST 비용 bowStCost | item.bowStCost | ~~(bd.stCost*(2-rm*.3)) | 15981 | 생성만, 소비처 미발견(자동사격 ST는 별도 식) |
| 활 사거리 bowRange | item.bowRange | ~~(bd.range*(0.95+random*0.1)) | 15982 | crossbow 760~839, repeater 665~734, arcane 798~881 |
| 활 탄속 bowProjSpd | item.bowProjSpd | bd.projSpd=22 | 15983 | 전 타입 22 |
| 활 관통 확률 bowPierce | item.bowPierce | +((0.02+tier*0.03+rarity*0.04)*(0.8+random*0.4)).toFixed(2) | 15985 | 스킬 관통 보너스 계산(bowPierce×300/×30)에 사용: 악의사냥 등(B03) |
| 요구 레벨 | reqLv | itemLv=min(900,floor(P.lv/10)*10), reqLv=max(0,itemLv-10) | 16143-16147 (mkItem 말미, trace 인용 +2 미재확인) | 무기·활 공통 |
| implicit | weapon _iAtkPct 5..15, bow _iPierce 5..15 | — | 15017-15018, 16116-16123 | 정의 출현 각 1회, 실제 수식 소비 미발견(미확인) |

### A-4 능력치·배율

| 이름 | 상수·변수·식 | 값 | game.html 줄 | 설명 |
|---|---|---|---|---|
| 근접 기준 공격력 meleeRef | ((+wp.atk\|\|0)+enhMulAtk(wp.enh\|\|0)) + _slotFlatAtk(wp) + P.baseAtk + (STATS.str+_eqStat('Str')+_lvB()) 전체 × (P._weaponSeal>0?.3:1) | — | 28772 | enhMulAtk(n)=n*.25 가산(28099). _lvB=~~(P.lv*.5)(28770). STR은 ref에 가산돼 statStr()=1(27995) |
| 석궁 기준 공격력 bowRef | ((+bw.atk\|\|0)+enhMulAtk(bw.enh\|\|0)) + _slotFlatAtk(bw) + P.baseAtk + (STATS.dex+_eqStat('Dex')+_lvB()) 전체 × 봉인 | — | 28773 | DEX 1pt=ATK +1. magicRef(28774)는 투구(hm)/INT |
| 평탄 ATK 어픽스 | _slotFlatAtk(it) = Σ affix(sharpAtk\|brutalAtk\|ruinAtk).value | — | 28768 | 그 아이템 자신의 affix만 |
| baseAtk | P.baseAtk | applyStats에서 G.on? 15+((G.stage 또는 1)-1)*2 : 15 (trace 인용 27926 +2 미재확인); 생성자 8 폴백 | 27926, 29019 | 근접 타격 raw·bowRef 모두 포함 |
| 공속 배율 statDex | 1+(STATS.dex+_eqStat('Dex')+_lvB())*.0005+(+gl.atkSpd\|\|0)+_eqAffix('atkSpeed')+implicit(_iAtkSpd)*.01+_uEq('_uGloveSpd')+(전설장갑 _lGloveElem>0?.20:0) | — | 27996 | 근접 후딜 분모, 카드 DPS, 석궁 카드 발사속도에 사용. 자동 석궁 간격에는 사용 안 함 |
| 패시브 합연산 _passDmgSum(type) | s = pAtk*.10 + _altAtk + pHuman*.05 (+melee: pMelee*.15 / magic: pMagic*.10+magicDmg affix+implicit / bow·proj: pBow*.15 / xbow: pXbow*.05 / dot: pDot*.15), 반환 (1+s)*0.7 | — | 28005-28016 | 전체 ×0.7 너프. pAtkMul=melee(28019), pBowMul=bow(28044), pXbowMul=xbow(28048), pMeleeMul=1(28050) |
| 활 패시브 | pBowCost=max(.60,1-pBow*.04); pBowRange=1+pBow*.08; pBowSpd=1+pBow*.10; pXbowSpd=1+(pXbow\|\|0)*.05 | — | 28045-28049 | pBowRange엔 0 대체 가드 없음(pBow undefined면 NaN) |
| ST 비용 계수 | _stDisc('bow')=pBowCost(), 'weapon'계열=pAtkCost()*pMeleeStCost(); 터렛 발사 중(_gxFiring)이면 ×0.5; × (1+stCostRed 어픽스 음수분) | — | 31985 | stCost('weapon')=kiSlash면 10+(Lv-1)*2 아니면 5(31987) — wStCost 미사용 |

### A-4 근접 LMB 공격

| 이름 | 상수·변수·식 | 값 | game.html 줄 | 설명 |
|---|---|---|---|---|
| LMB 공격 시작 | ST 소비(useStPct('weapon')) → P._atkBon=~~(소모ST*1.5) → P.s='wSwing', st2=5, swProg=0, atkArc=facing; 35% 확률 voice(grunt/male_grunt/voice_attack); kiSlash 아니면 SFX.slash | — | 33055-33058 | kiSlash 활성 시 _fireKiSlashCrescent로 분기(B02) |
| 공격 중 이동 | (P.speed+bt.spd)*sp*.8 | — | 33353 | 주석은 '20%'이나 실제 80% 속도 |
| 타격 시점 | P.s==='wSwing' && P.st2<=3 && P.st2+sp>3 (한 번) | — | 33359 | 스윙 5f 중 3f 이하로 내려가는 프레임에 1회 hitArc |
| 타격 범위·호 | range=(wp.wRange\|\|50)+(wp.bonusRange\|\|0)*4; arcW=(wp.wArcW\|\|.95); 원소=wp.el\|\|(전설장갑이면 1+~~(random*4)) | — | 33360-33363 | - |
| 기초 피해 | ~~(((P.baseAtk+(wp.atk\|\|0)+enhMulAtk(wp.enh\|\|0))+15)*6) | — | 33364 | 아이템 평탄 affix·STR·lvB 미포함(meleeRef와 다른 식) |
| 후딜 | P.st2=~~(16/((wp.spd\|\|.3)*statDex()*(1+_eqAffix('meleeAtkSpd')+_eqAffix('glovesAtkSpd')))) | — | 33366 | 상태 wRecover; Q 입력 시 보호막/평화의보호/얼음보주로 전환 가능(33367) |
| hitArc 피해 후처리 | weapon: baseDmg=~~(baseDmg*pAtkMul()*pMeleeMul())+P._atkBon (소비 후 0); 적마다 mult=elMul(el,e.el), dmg=~~(baseDmg*mult); hurtE(e,dmg,ang,true,{kbMult:1,poiseMult:1.5,...},el) | — | 37605-37620 | 거리 d≤range+e.r, 각도차<arcW, 풀서클(arcW≥π*1.99)은 각 검사 생략 |
| 타격 후 피드백 | G.hitStop=~~(_HS.melee*OPT.hitStop/100), 속성색 파티클 max(4,min(dmg/2,14))×OPT.parts/100, 약점(mult≥2) 텍스트+8방향 링 파티클+e.stunned+=35 | — | 37632-37645 | - |

### A-4 석궁 자동사격

| 이름 | 상수·변수·식 | 값 | game.html 줄 | 설명 |
|---|---|---|---|---|
| 자동사격 토글 | _xbowEquipped (기본 true), T키: 토글 시 _xbowTimer=0, _xbowTarget=null, 안내 문구, OPT.xbowAuto 저장, 설정 체크박스 동기화 | — | 17462, 13220-13224 | 입력 반복(e.repeat) 무시, G.on && !G.paused |
| 자동사격 상수 | XBOW_RANGE=1000, XBOW_INTERVAL=120, XBOW_DMG=28, XBOW_SPEED=13, XBOW_PIERCE=false | — | 17448-17452 | _autoBowSpec 폴백용; 터렛 감지 반경 XBOW_RANGE*1.5(35170) |
| _autoBowSpec | b=bw(); brd=BOWTYPES[b.btype\|\|'crossbow']\|\|BOWTYPES.crossbow; range=max(220, (max(b.bowRange\|\|0, brd.range\|\|1000)+(b.bonusRange\|\|0)*12)*pBowRange()); spd=b.bowProjSpd\|\|brd.projSpd\|\|13 | — | 17453-17459 | 무장비({}) → crossbow 800 |
| 프레임 처리 | INV.equipped.bow 있고 _xbowEquipped·P.hp>0이면 timer+=_dtSp; 발사 원점=G.pets.xbow 있으면 펫, 없으면 플레이어; shQuery(range)에서 가장 가까운(<) alive 적 선택 | — | 35139-35152 | 터렛 설치 시 펫을 터렛 위치로 이동(35140) |
| 발사 조건 | timer ≥ XBOW_INTERVAL/((bw.bowSpd\|\|1)*pXbowSpd()) 이고 타겟 있고 P.st > P.mst*.2 | — | 35153-35154 | 간격 120f=2초 / 공속. 프레임당 최대 1발. bowAtkSpd 어픽스·pBowSpd·statDex 미반영 |
| 터렛 발사 | 터렛 있으면 P 좌표를 터렛으로 임시 이동, _gxFiring=1, 신규 pProjs에 _fromTurret=true, 복구 | — | 35156-35162 | GXBOW_DMG_MUL/SPD_MUL(1.5) 선언만(미사용) |
| _autoFireBowSkill | 활성 bow 스킬 라우터: normal(또는 터렛슬롯)→_fireXbow; bladeShot/blastShot/fanShot/needleShot 해당 함수; ltnChaser·ghostXbowTurret은 자동 금지; 실패 시 터렛이면 기본 볼트, 플레이어면 쿨 대기 return | — | 28727-28767 | ST 소모: (1.5+(fanShot Lv 또는 0)*1.5)*_stDisc('bow') 발사 후 차감(0 클램프) |
| _fireXbow 피해 | ~~((bowRef()*pBowMul()*pXbowMul()*BOWTYPES[type].atkMul + XBOW_DMG)*(_gxFiring\|\|1))*3 | — | 28713 | 타입 atkMul은 생성(15979)과 발사에 두 번 적용. 기본 석궁 3배 주석 |
| _fireXbow 투사체 | 원점+방향×10, 속도 _autoBowSpec.spd, 사거리 spec.range, r=3, stagger0, kb0, pierce=XBOW_PIERCE?.5:0, normalBow=true, ghostXbow=true, el=bw.el | — | 28714 | _pierceRate 기본값 50+pierceFlat는 _resetPProj에서 부여(재활용 객체만, 아래 표 E) |
| 전설 활 추가탄 | _lBowCrit>0 && random*100<statCrit() → ±.12rad 방향 한 발 추가 | — | 28715-28719 | - |
| 발사 부수효과 | 펫 _ang 갱신, 터렛이면 playSampleAt('crossbow_shot',.15)+거리감쇠 else playSample('crossbow_shot',.2), poolPart 2개 | — | 28720-28724 | - |
| 수동 fireBow | 악의오브 1 소비, 피해 (~~(bowRef*pBowMul*10)+_bowBon)*3, 후딜 ~~(45/(pBowSpd*(1+bowAtkSpd))) | — | 28678-28703 | 호출처 없음(죽은 코드). crossbow 사운드 crossbow_shot .7 |

### A-4 투사체·충돌

| 이름 | 상수·변수·식 | 값 | game.html 줄 | 설명 |
|---|---|---|---|---|
| 투사체 풀 | _PPROJ_POOL=120, _getPProj/_resetPProj/_recyclePProj | — | 17309-17364 | 새로 만들 때(_mkPProj)는 _resetPProj를 거치지 않아 _pierceRate 필드가 없음(undefined) |
| 통일 관통률 기본 | _resetPProj: p._pierceRate=50+_eqAffix('pierceFlat') | — | 17350 | 재활용 객체만 적용. 통일 관통: 보장 floor(rate*91/1000)회(rate50→4회) 후 (1-초과수×0.1) 확률(35564-35575) |
| 패시브 관통 | pPierce>0이면 p.pierce=min(.95,pPierce*.05), p.pierceMax=pPierce | — | 17358-17359 | XBOW_PIERCE=false라도 적용(레거시 관통 35607-35618, 관통마다 dmg×min(1,.85+pPierce*.03)) |
| 일반 석궁탄 유도 | normalBow는 일반 유도 제외 | — | 35188 | - |
| 벽 반사 | 비마법 탄: dist<maxDist*.5 && bounces<2 이면 반사, 아니면 소멸 | — | 35238-35247 | - |
| 명중 처리 | mult=elMul(p.el,e.el); dmg=~~(p.dmg*mult); hurtE(e,dmg,ang,_isTurretProj\|\|p.blueBean,p,p.el); normalBow 명중 사운드 bow_hit .4; 킬 시 hitSet 추가 후 통과(킬관통) | — | 35399-35409, 35456, 35619, 35626 | 터렛 탄은 거리 감쇠(1-거리/2000) 사운드 |
| 석궁탄 경직·넉백 | stagger0, kb0; hurtE에서 원거리(maxDist 정의·비마법/normalBow) 넉백 없음 판정 | — | 42468 | - |

### A-4 피해 분류(hurtE)

| 이름 | 상수·변수·식 | 값 | game.html 줄 | 설명 |
|---|---|---|---|---|
| hurtE 화살 판정 | _isArrow = !pure && opts.maxDist!==undefined && !opts.magic | — | 42272 | 석궁탄(maxDist 정의)이 해당. 원소가 있어도 magic으로 분류되지 않음 |
| 화살 타입 배율 | _isArrow면 +rangedDmgPct+projDmgPct (어픽스, 합연산), 물리 방어 약화 영역 제외·투사체 약화(_weakPj) 적용 | — | 42279, 42288-42290 | - |
| 화살 크리 | _isArrow면 크리율 += critRateBow*100 | — | 42315 | - |

### A-4 선택 활 스킬(T 슬롯)

| 이름 | 상수·변수·식 | 값 | game.html 줄 | 설명 |
|---|---|---|---|---|
| T 자동 슬롯 선택 목록 | SKILL_SLOT_DEFS.bow.skills = ['normal','bladeShot','blastShot','fanShot','needleShot'] (5개) | — | 44279-44300대(bow 정의 L16~25 of 블록) | '활 5종'의 실체. bladeShot/blastShot은 SKILL_LIST에 없어(제거 주석) 습득 불가, 저장분만 가능 |
| fanShot | ST 2+Lv, 3발 ±.15rad, 사거리 400+(Lv-1)*68, 속도 20, 피해 ~~(bowRef*statDex*pBowMul*Lv/3*2)+~~(ST*1.5), 후딜 ~~(45/(pBowSpd*(1+bowAtkSpd))) | — | 44944-44965 | B03 상세 표 참조 |
| needleShot | ST 8, 쿨 90f, 발수 2+~~((Lv-1)/5), 간격 2f, 사거리 600, 속도 30, 피해 ~~(bowRef*statDex*pBowMul*_skMul) | — | 45331-45343, 36088-36099 | B03 |
| bladeShot / blastShot | ST 1+~~(Lv/2) 등(코드 잔존) | — | 45296-45311, 45314-45329 | SKILL_LIST 미등재 — 정상 경로로 습득 불가 |

### A-4 저장·복원

| 이름 | 상수·변수·식 | 값 | game.html 줄 | 설명 |
|---|---|---|---|---|
| 무기·활 아이템 저장 | INV.bag/equipped 아이템 객체 전체(wtype, btype, atk, spd, wStCost, wArcW, wRange, wStagger, bonusRange, bowSpd, bowStCost, bowRange, bowProjSpd, bowPierce, enh, affixes …) | — | 3551 | 무기 전용 whitelist 없음 |
| 선택 활 스킬 | P.activeBowSk (기본 'normal') — 저장 3565, 복원 3842-3846 | — | 3565, 3842-3846, 29026 | 미습득·maliceMortar·ghostXbowTurret·합체로 흡수된 fanShot은 normal로 되돌림 |
| 자동사격 설정 | OPT.xbowAuto (설정 저장) | — | 13222, 49072, 49416 | 캐릭터 장비 저장과 별도 |
| 구 데이터 마이그레이션 | _fixBow(BOWTYPES에 없는 btype→crossbow, 이름 '석궁'), _fixWpnSpd(spd=0.45*rm, _spdMig<3), _fixWpnName(_nameMig<1, uniqueArt 제외) | — | 3651-3653, 3669-3674, 3677-3681 | - |

### A-4 사운드

| 이름 | 상수·변수·식 | 값 | game.html 줄 | 설명 |
|---|---|---|---|---|
| 장착음 | 무기: wtype sword→equip_sword, 석궁 crossbow→equip_crossbow, 나머지 equip_base .42; rarity≥2 equip_rare .28 | — | 16265-16267 | - |
| 타격음·VFX | 근접 SFX.slash, 석궁 crossbow_shot/bow_hit, 약점 텍스트 '약점!' | — | 37608, 28720, 35456 | - |

## 표 B. 함수

| 함수 | 줄 범위 | 입력 | 출력·부작용 | 호출하는 곳 |
|---|---|---|---|---|
| wp() / bw() / hm() | 16500 / 16505 / 16504 | — | INV.equipped.weapon\|bow\|helmet 또는 {} | 전투·UI 전반 |
| mkItem | 15894-(말미 ~16169) | slot,tier,el,rarity,wtype | 아이템 객체 생성(무기·활 필드 포함), random 다수 소비 | 드랍 rollDrop(32004~), 시작장비, 제작(51171-51198), 테스트 프리셋 61990 |
| _weaponName | 15883 | wt,el,tier | 접두사+타입 명사 이름 | mkItem 15962, _fixWpnName 3678 |
| enhMulAtk | 28099 | n | n*.25 (가산) | meleeRef/bowRef/magicRef 28772-28774, hitArc 호출부 33364 등 |
| _slotFlatAtk / _lvB | 28768 / 28770 | item / — | 평탄 ATK 어픽스 합 / ~~(P.lv*.5) | 28772-28774 |
| meleeRef / bowRef / magicRef | 28772 / 28773 / 28774 | — | 기준 공격력(스킬 계수 곱의 기반) | 스킬 피해식 전반(B03), _fireXbow 28713, fireBow 28689 |
| statDex | 27996 | — | 공속 배율 | 근접 후딜 33366, 카드 DPS 49741, 카드 발사속도 49769 |
| _passDmgSum / pAtkMul / pBowMul / pXbowMul / pMeleeMul | 28005-28016 / 28019 / 28044 / 28048 / 28050 | type | 합연산 패시브 배율 ×0.7 | hitArc 37610, _fireXbow 28713 |
| pBowCost / pBowRange / pBowSpd / pXbowSpd | 28045 / 28046 / 28047 / 28049 | — | 활 패시브 스칼라 | _stDisc 31985, _autoBowSpec 17456, 자동 간격 35153, fireBow 28698 |
| stCost / _stDisc / useStPct | 31986-31993 / 31985 | key,m | ST 비용(상한 mst×0.9) | LMB 시작 33055 (stCost("weapon")=5 또는 기검참식) |
| LMB 상태머신 (wSwing/wRecover) | 33347-33367 | sp | 타격 1회 + 후딜 설정 | 메인 update |
| hitArc | 37605-37650 | angle,range,arcW,baseDmg,el,type | 범위 내 적에게 hurtE, 반환 hitCount | 33364(무기), 방패·회전참 등 |
| hurtE (석궁 분류 구간) | 42112~ (분류 42272-42285, 크리 42313-42318) | e,dmg,ang,isDot,opts,atkEl | 화살 판정·타입 뎀%·크리·방어 약화 | 투사체 명중 35409, hitArc 37619 |
| _autoBowSpec | 17453-17459 | — | {range,spd} | 자동 프레임 35146, _fireXbow 28711 |
| (자동사격 프레임) | 35139-35175 | _dtSp | 타겟 탐색·간격 판정·발사 호출 | 게임 update 투사체 구역 |
| _autoFireBowSkill | 28727-28767 | tx,ty | 활성 bow 스킬 라우팅, ST 차감 | 35160/35163 |
| _fireXbow | 28705-28725 | tx,ty | 투사체 1발(+전설 추가탄), 사운드 | _autoFireBowSkill 28733/28756/28760 |
| fireBow | 28678-28703 | — | 수동 발사(죽은 코드) | 호출처 없음 |
| _getPProj / _resetPProj / _recyclePProj / _mkPProj | 17362 / 17332-17360 / 17361 / 17311-17331 | — | 투사체 풀(120) | 모든 플레이어 투사체 생성부 |
| (플레이어 투사체 update) | 35174-35631 | sp | 이동·유도·벽 반사·명중·관통·회수 | 게임 update |
| (T 키 토글) | 13220-13224 | KeyboardEvent | _xbowEquipped 토글, OPT.xbowAuto 저장 | keydown 핸들러 |
| updateTSlot / qsT HUD | 44927-44931 / 28401-28406 | — | T 슬롯 아이콘·테두리 갱신 | 스킬 선택 팝업, updateQS 28359 |
| _invCardFields | 49732-(~49863) | item | 카드 스탯 HTML(타입명, ATK, DPS, SPD, ST소모, 사거리, 공격범위, 경직력, 발사속도, 관통확률) | 인벤 툴팁 |
| _invBuildCompare | 49876-(~49902) | sel,cur | 비교 행 구성(키목록 49876) | 인벤 비교 UI |
| itemScore / _itemPower | 43618 / 16453 | item | wStagger·wRange·bonusRange 가중 점수 | 정렬·자동 분류 |
| playEquipSfx | 16267 | item | 타입별 장착음 | 장착 핸들러 |
| _refreshEquipmentStats | 16289 | — | 장비 변경 후 능력치 갱신(캐시 무효화) | 장착·해제 16363, 16376 (trace 인용) |
| dbSave / dbRestore (무기 관련) | 3551 / 3842-3846 / 3651-3681 | — | 아이템·activeBowSk 저장, 구버전 마이그레이션 | 저장 루프 |

## 표 C. 상태 흐름 (획득 → 슬롯 → 사용 → 쿨다운 → HUD → 저장)

| 단계 | 내용 | 근거 줄 | 비고 |
|---|---|---|---|
| 1 획득 | 드랍 시 mkItem(slot,tier,el,rarity,wtype?) → wtype 인수 없으면 균등 랜덤(무기 7/활 3) | 15959, 15974 | rarity별 ATK 하한·ATK 롤은 random²; reqLv=itemLv-10 |
| 2 인벤 배치 | INV.bag/grid, 크기 [2,2] (무기·활 전 타입) | 15830-15833, 16183-16186 (trace 인용) | — |
| 3 장착(슬롯) | INV.equipped.weapon / .bow, reqLv 게이트 후 교체; 장착음 playEquipSfx | 16263-16267, 16297-16379 (trace 인용) | 무기→근접 LMB, 활→T 자동 석궁 즉시 반영(별도 슬롯 배정 없음) |
| 4 사용(수동) | LMB: ST 소모→wSwing 5f→타격 1회(3f)→wRecover; 석궁은 수동 발사 입력 없음(fireBow 호출처 없음) | 33055-33058, 33357-33366 | 무기 타입별 모션 분기 없음 |
| 5 사용(자동) | T 토글 ON(기본) 시 120f/(bowSpd×pXbowSpd) 간격으로 가장 가까운 적에게 자동 발사 | 35139-35165 | 타겟 사거리=_autoBowSpec.range(타입 사거리+bonusRange×12)×pBowRange |
| 6 쿨다운 | 근접: 후딜 wRecover 프레임; 자동: _xbowTimer 간격; 선택 스킬은 개별 쿨(_bltCd/_bsCd2/_ndCd) | 33366, 35153, 28758 | 전용 쿨다운 HUD 없음 — qsT에 아이콘·ON/OFF 테두리만 |
| 7 HUD 갱신 | eq0 무기 슬롯(타입명·원소 점), qsT(활성 bow 스킬 아이콘, 터렛 시 파랑 테두리) | 60348, 28401-28406 | — |
| 8 저장 | inv(bag/equipped 전체 객체) + activeBowSk + OPT.xbowAuto | 3551, 3565, 13222 | — |
| 9 복원 | 구 데이터 보정 3종 + activeBowSk 유효성 보정 | 3651-3681, 3842-3846 | — |
| 10 강화·전설 연계 | enh→enhMulAtk 가산, affix 평탄 ATK, 전설 활 _lBowCrit 추가탄 | 28772-28773, 28715 | META 소유(강화 경제) |

## 표 D. HUD·UI·피드백

| 대상 | 내용 | 줄 | 비고 |
|---|---|---|---|
| HUD 무기 슬롯 eq0 | _slotGlyph(0, 등급색,22) + 원소색 점(.ee) + 타입명(.ed, _T(WTYPES[wtype].name)); 없으면 주먹 글리프+“맨손”; 테두리색=원소색, box-shadow inset 10px ~33 | 60348-60349 | DOM id eq0 (eq1 보조무기, eq2 부츠) |
| HUD 활 슬롯 qsT | 아이콘 skillskin_upscaled/<fanShot\|스킬>.png (normal이면 fanShot 아이콘), 테두리 터렛=#88aadd/ON=#ccaa44/OFF=#443322 | 28401-28406, 44927-44931 | DOM id qsT, 자동 ON/OFF 토글 문구 “석궁 자동발사 ON/OFF”(showPH #ffe066/#888888) |
| 설정 체크박스 | optXbowAuto | 13223, 49072, 49416 | OPT.xbowAuto |
| 아이템 카드 | 타입명(#ccaa77 bold), ATK(강화 +색), DPS(#ff6644/#ffaa66), SPD, ST소모(#cc8844), 무기사거리, 공격범위, 경직력, 발사속도(발/초), 사거리, 관통확률(+%, #44ffcc) | 49756-49772 | DPS=atk×타입atkMul×60/(33/(타입spdMul×statDex)); 강화는 ~~(atk×(1+enh×.25)) 선변환 → 실전과 다름 |
| 인벤 비교 | 키목록(wStCost 등 낮을수록 good), 비교 DPS 타입 기반 | 49876-49902 | trace 인용 |
| 근접 차징 호 미리보기 | wWindup 시 wRange 호 stroke 3px(알파 .15±.1 펄스) + 손 위치 원 | 58950-58959 | wWindup은 일반 LMB에서 거의 사용 안 함(돌진 피니셔 경로) |
| 근접 스윙 궤적 | wSwing 중 속성색 호 트레일 (_charIdx!==1), 반각 wArcW | 58965-58974 | 실버테일은 별도 아크 |
| 근접 타격 피드백 | SFX.slash, hitStop(_HS.melee), 속성 파티클, 약점 시 “약점!”+링 | 37608, 37633-37645 | - |
| 석궁 화살 렌더 | _bowArrowReady=false(스프라이트 미존재) → 벡터 폴백, 터렛 탄은 알파 ×.6 | 23922-23923, 59127-59134 | _bowTinted[el] 틴트 캔버스는 비어 있음 |
| 사운드 | 장착 equip_sword/equip_crossbow/equip_base(+equip_rare .28), 발사 crossbow_shot(.2 플레이어/.15 터렛), 명중 bow_hit .4, 근접 SFX.slash | 16265-16267, 28720-28721, 35456, 35626 | - |

## 표 E. docs/SPEC ↔ 코드 차이

| # | 대상 | docs·SPEC 값 | 코드 값 | 코드 줄 | 비고 |
|---|---|---|---|---|---|
| 1 | 활 개수 | 마스터 보드/SPEC “활 5종” | 코드·docs 모두 BOWTYPES 3종(crossbow/repeater/arcane); “5”는 T 슬롯 선택 스킬 5개(normal,bladeShot,blastShot,fanShot,needleShot) | 15886-15890, 44279대 | 분모를 활 3종 + 선택 스킬 5종(B03)으로 분리 필요 |
| 2 | basicWeaponMode | SPEC “basicWeaponMode 등 무기 전환 방식” | 웹 game.html에 basicWeaponMode 없음 — Unity NativeGame.cs:23 의 런타임 플래그명. 웹은 INV.equipped.weapon 존재 여부로만 무기/맨손 결정 | — | 웹 무기 전환=장비 교체뿐. 기검참/무기 LMB 전환은 P.activeLMBSk |
| 3 | 활 상태 서술 | docs 2_2 “활 3종 — 🔲 미구현(활 캐릭터 추가 시 구현)” | T 자동 석궁(+선택 스킬 5종)이 이미 실행됨. 활 전용 캐릭터만 미구현 | 35139-35165 | docs 제목·본문 갱신 필요 |
| 4 | WTYPES 줄 번호 | docs 2_2 “~L12757” | 현재 L15863-15871 | 15863 | docs 줄 번호 스테일 |
| 5 | 무기 7종 특징 | docs 표: 검=넓은 호, 단검=빠른 찌르기, 해머=충격파 … | 7종 수치·동작 전부 동일(atkMul1 stCost5 spdMul.45 arcW.95 range50 stagger8), 타입별 모션 분기 없음 | 15864-15870 | docs도 “갭”으로 인정(미수정) |
| 6 | ATK 상한식 | docs 14: _atkMax = 200+tier×200+P.lv | 코드: ~~((200+tier×200+lv)×0.25) | 15922 | docs 스테일(×.25 누락) |
| 7 | 등급 최소보장 | docs 14: [0,.05,.15,.25,.40][rarity] | 코드 6칸 [0,.05,.15,.25,.40,.50] (유니크 .50) | 15923 | docs 누락 |
| 8 | 기준 공격력 ref | docs 14: (atk×(1+강화배율)+flat+base)×봉인 | 코드: (atk+enh×.25 가산) + 평탄 affix + baseAtk + (능력치+장비능력치+~~(lv×.5)) 전체 × 봉인(.3) | 28772-28774 | 구조 상이(곱→가산, 능력치 직접 가산) |
| 9 | wStCost / bowStCost | 생성·카드에 “ST소모” 표시 | 실제 ST는 stCost("weapon")=5(기검참 10+(Lv-1)×2), 자동사격은 (1.5+fanShotLv×1.5)×_stDisc; 생성값은 표시·점수·비교에만 사용 | 15966, 15981, 31987, 28734 | 소비처 없는 필드 |
| 10 | wStagger | 생성·카드 “경직력” | 실제 근접 경직은 hurtE 기본 규칙(일반 8f/엘리트 4f, trace 인용); wStagger는 표시·점수 참조 | 15969, 49766, 43618 | trace 인용 — 직접 재확인 미실시 |
| 11 | _iAtkPct / _iPierce | implicit 정의 | game.html에서 정의 각 1회, 수식 소비처 미발견 | 15017-15018 | 미확인(외부 JS 소비 가능성) |
| 12 | 공격 중 이동 주석 | 주석 “공격 중 감속 이동 (20%)” | 코드는 속도 ×0.8 (20% 감속) | 33349, 33353 | 값은 ×0.8 확정. 주석 “20%”는 해석 모호(20%로 이동 / 20% 감속). 기존 trace 문서는 “주석 20%와 다름”으로 표기 |
| 13 | XBOW_PIERCE=false | 주석/상수 “관통 여부 false”, fireBow 주석 “관통 0” | _resetPProj가 재활용 객체에 _pierceRate=50+pierceFlat 부여 → 통일 관통 보장 floor(50×91/1000)=4회 + 확률 최대 9회; 신규 객체(_mkPProj)는 _pierceRate 미정의라 관통 없음. 풀 120개 이후부터 재활용 — 정적 해석, 실행 미검증 | 17350, 17311, 35564-35575, 28714 | 관통 사실상 있음(풀 상태 의존) — Unity 이식 시 의도 확정 필요(HOLD 후보) |
| 14 | GXBOW_DMG_MUL/SPD_MUL | 터렛 +50% 주석 | 1.5 상수 선언만, 소비처 없음(실효 _gxFiring=1) | 17466-17467, 28713 | 터렛 강화 미적용 |
| 15 | bowAtkSpd 어픽스 | 어픽스 “석궁공속+” | 수동 fireBow 후딜(28698)과 fanShot 후딜(44963)에만 반영, 자동 발사 간격(35153)에는 미반영 | 14577, 28698, 35153 | 자동 석궁 공속은 bowSpd×pXbowSpd만 |
| 16 | 카드 DPS vs 실전 | 카드 “DPS” 표시 | 카드는 33/(spdMul×statDex), 강화 선변환; 실전 후딜은 16/(spd×statDex×…) 이고 석궁은 120/(bowSpd×pXbowSpd) 간격 — 두 식 불일치 | 49734-49745, 33366, 35153 | UI 표시식은 실전과 별개(그대로 이식할지 결정 필요) |
| 17 | 수동 fireBow | 함수 존재 | 호출처 없음(죽은 코드) | 28678 | 이식 제외 후보 |
| 18 | bladeShot/blastShot | SKILL_SLOT_DEFS.bow 선택 목록 포함 | SKILL_LIST에 정의 없음(제거 주석 2026-04-10) → 정상 습득 불가, 함수·슬롯 정의만 잔존 | 28744-28745, 45296-45329 | 분모에서 제외 권고 |
| 19 | 석궁 화살 스프라이트 | 주석 “arrow.png 미존재 → 항상 벡터 폴백” | _bowArrowReady 항상 false | 23922-23923, 59127 | Unity에서 화살 스프라이트는 새로 제작(웹은 벡터) |
| 20 | arcane “마력” 석궁 | 이름이 마력석궁 | _fireXbow에서 magic=false인 일반 normalBow 볼트(마법 분기 없음) | 28714 | 타입 이름으로 마법 판정 추가 금지 |
| 21 | T 슬롯 아이콘 | — | normal일 때 fanShot 아이콘 재사용 | 28405, 44930 | 전용 일반 석궁 아이콘 없음 |

## 표 F. Unity 현재 상태 (`origin/claude/unity-pc-inventory-u04-20261026` `unity/Assets/Exoduser/Runtime/`)

| 항목 | 현재 내용 | 상태 | 파일:줄 |
|---|---|---|---|
| Core/Simulation.cs | 근접 LMB: 후딜 ToInt32(16/((WeaponSpeed 또는 .3)×AttackSpeedMultiplier)); HitArc raw=(BaseAttack+WeaponAttack+Enhance+15)×6 × DamageMultiplier(.7)+attackBonus; 사거리 WeaponRange 또는 50(+enemy.Radius), 호 WeaponArc 또는 .95 | 있음(근접 1종 동일식) | Simulation.cs:141, 186-197 |
| Core/EquipmentApplication.cs | ApplyEquipment: 장착 무기 atk/spd/wRange+bonusRange×4/wArcW → Config.Weapon* | 있음 | EquipmentApplication.cs:14 |
| Core/InventoryState.cs | 슬롯 16종, 무기 7종/활 3종 타입 검증, 전투력 계산(atk×spd×6 …), CalculateStats→WeaponAttack/Speed/Range/Arc | 있음(검증·스탯) | InventoryState.cs:4, 33-34, 65-66, 84 |
| Core/InventoryData.cs | 아이템 필드 wtype, btype, atk, spd, wStCost, wArcW, wRange, wStagger, bonusRange, bowSpd, bowStCost, bowRange … (이후 필드는 grep 출력 잘림 — bowProjSpd/bowPierce 존재 미확인) | 있음(데이터 모델) | InventoryData.cs:8-11 |
| Core/InventoryComparison.cs / InventoryCombatPower.cs | 활 bowSpd/bowRange/bowPierce 비교 행, 전투력 extra | 있음(UI 데이터) | InventoryComparison.cs:29-31, InventoryCombatPower.cs:19 |
| Core/SourceStarterFixture.cs / SimulationState.cs | 기본 무기 “녹슨 검” atk18 spd.45 range54 arc.95, ActiveAttack="weapon" | 있음(시작 장비 fixture) | SourceStarterFixture.cs:15, 26-36; SimulationState.cs:9-18 |
| NativeGame.cs | basicWeaponMode(--unity-basic-weapon), TryEquipKiSlash로 해제 | 있음(웹에 없는 Unity 전용 플래그) | NativeGame.cs:23, 41, 96, 285 |
| NativeInventory.cs / NativeInventoryComparison.cs | 무기·활 아이콘 매핑(wtype/btype/el), 카드 정의(wtypes,btypes) | 있음(표시) | NativeInventory.cs:17, 35; NativeInventoryComparison.cs:13-18 |
| bowRef / meleeRef(전체식) | 웹 meleeRef(28772) 전체식 — 평탄 affix·lvB·봉인 포함 | 일부 — 기검참 reference만 인라인(KiSlash.cs:37), 근접 HitArc는 meleeRef 아닌 raw식(원본과 동일) | KiSlash.cs:37 |
| 자동 석궁(_autoBowSpec/프레임/_fireXbow/풀) | 타겟 탐색, 120f 간격, 피해식, 투사체, 관통, 펫/터렛 | 미이식 (Projectiles는 기검참 전용 16개 상한 구조) | — |
| 패시브 합연산 배율 | _passDmgSum ×0.7 등 | 일부 — DamageMultiplier(.7) 단일 스칼라만(pAtk=0 가정) | SourceStarterFixture.cs:35 |
| T 토글/qsT/설정 | T키, optXbowAuto, qsT HUD | 미이식 | — |
| mkItem 생성(웹 드랍) | ATK 롤·무기/활 필드 | 미확인(드랍 생성은 Simulation DropSlots 일부만 확인) — 별도 확인 필요 | Simulation.cs:30 |

`git grep -i "Weapon|Bow|Arrow|basicWeapon|Projectile"`: 근접 무기 경로·장비 적용·인벤토리 데이터는 있으나 **석궁 자동사격·활 투사체는 없음**(Projectiles는 KiSlash 전용). worktree 없이 `git grep/show`만 사용.

## 표 G. 이식 소유 추정

| 구성요소 | 소유 | 비고 |
|---|---|---|
| WTYPES/BOWTYPES/RARITY_MUL 카탈로그 데이터 | Core(PC 가능) | 순수 데이터 — b05_web_values.json을 SSOT로 .NET 대조 |
| mkItem 무기·활 필드 생성(ATK 롤·spd·range·bonusRange·bowPierce·reqLv) | Core(PC 가능) | RNG 호출 순서 보존 필요(random 소비 순서) |
| meleeRef/bowRef/statDex/패시브 합연산/enhMulAtk | Core(PC 가능) | 순수 함수 — 다른 스킬(B03)과 공유 |
| 근접 LMB 상태머신·hitArc | Core(PC 가능) | 이미 근접 1종 동일식 이식됨 — 타입별 차이 없음 |
| 자동 석궁 상태(_autoBowSpec·타겟·간격·ST 게이트·_fireXbow·투사체·관통·벽 반사) | Core(PC 가능) | 투사체 엔진은 B03과 공유 (유도 제외, 통일 관통 포함) |
| hurtE 화살 분류(_isArrow)·rangedDmgPct/projDmgPct/critRateBow | Core(PC 가능) | B01/B05 접점 — 상성은 B06 참조 |
| T 키 토글 입력 | NativeGame=Codex patch | 입력 상태 + OPT.xbowAuto 저장은 Core |
| qsT HUD / eq0 슬롯 / 카드·비교 표시 | NativeHud/NativeInventory=Codex patch | 표시 규칙(색·문구)은 표 D |
| 화살 렌더(벡터 폴백)·장착음·발사음 | Codex patch(리소스) | 웹은 벡터 화살 — Unity 스프라이트 신규 |
| 세이브 직렬화(inv·activeBowSk·xbowAuto) | Core(PC 가능) | 마이그레이션 3종 포함 |

## 미확인·2차 후보

- 드랍 시 무기/활 `mkItem` 호출부(rollDrop 32004~)의 wtype/btype 지정·데모 분기, 제작 화면(51171-51198) 타입 선택.
- `wStagger` 실제 소비(hurtE 경직)와 `bowStCost` 소비처 부재의 정적 재확인, `_iAtkPct/_iPierce` 외부 소비.
- 통일 관통(_pierceRate) 풀 상태 의존 동작의 실행 확인(정적 해석만), 신규/재활용 객체 비율.
- 무기 스프라이트 렌더(58949-59066)·공격 애니(58624-58648) 세부, 인벤 카드/비교(49863~49902) 후반부, 제작·강화 연동.
- 실행 검증은 하지 않음(읽기 전용 정적 추출).
