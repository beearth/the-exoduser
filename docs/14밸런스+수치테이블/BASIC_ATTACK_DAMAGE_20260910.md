# 기본공격 데미지 3배 (2026-09-10)

사용자 지시: 기본공격이 약해서 존재감이 없으므로 현재 대비 약3배 상향. 적용 범위는 공용 좌클릭 평타·기검참, 기본 자동/일반 석궁이다. 캐릭터·무기 타입에 상관없이 해당 공격 경로에 적용된다.

| id / 적용 위치 | 이전 | 현재 | 유지 항목 |
|---|---|---|---|
| wSwing → hitArc | floor((P.baseAtk+무기atk+강화atk+15)×2) | floor((P.baseAtk+무기atk+강화atk+15)×6) | hitArc의 pAtkMul×pMeleeMul 및 ST 소비 가산 _atkBon 유지; 무기 기반 부분3배 |
| _SK_MUL.kiSlash | b:4, g:3.36 | b:12, g:10.08 | _skMul=b+(Lv−1)×g×0.5 |
| 기검참 일반 콤보 | 7×_skMul | 7×_skMul | Lv1=84, Lv10=401.52, Lv20=754.32배/타; meleeRef×statStr×pAtkMul 곱 후 정수화 |
| bowRecover 캔슬 검기 | 1.2/1.2/2×이전 _skMul | 7/7/7×현재 _skMul | 후속 초반 밸런스 수정: 발사 직후에도 일반 콤보와 동일 피해. 기존 일반 대비17.14%/17.14%/28.57% 경로 제거 |
| _fireXbow | floor((bowRef×pBowMul×pXbowMul×무기atkMul+28)×(_gxFiring 또는1)) | 이전 정수 결과×3 | 자동 normal·ghostXbowTurret 폴백, 장비·패시브·터렛·고정28 포함 |
| fireBow | floor(bowRef×pBowMul×10)+_bowBon | 이전 결과×3 | 악의1/발, 보너스 소모/reset, 관통0 |
| _skSpecificDetails(kiSlash) | 오래된 1.2/1.2/2, 레벨당100% | 일반 콤보별7×현재레벨 _SK_MUL, 레벨당+35.28배 | 표시 레벨 slv에 따라 계산, 소수2자리 |

공격속도·선후딜·소모 자원·범위·속도·관통·애니메이션·소리는 바꾸지 않는다. 회전참, 선택형 석궁 스킬, 우클릭 마법, E 처내기/차징, 패링 반사 배율은 이번 수정 범위가 아니다. 반사 최소치는 기존 고정14×이며 현재 기검참1타와 같은 값이라는 과거 설명만 정정한다. 평타 ST 소비 가산은3배에 포함되지 않으며, 그 외 정수 반올림·적 방어·속성 적용으로 표시 피해 비율은 미세하게 달라질 수 있다.

검증은 `test/basicAttackDamage.test.js`에서 실제 _fireXbow/fireBow/스윙 분기/_skMul을 실행한다. 자동 석궁388→1164, 터렛582→1746, 일반 석궁(보너스 포함)2010→6030, 평타 입력140→420 및 Lv1/10/20 기검참3배를 확인한다. 기존 `test/kiSlashSwingSound.test.js`의 3단 콤보 소리 검사도 유지한다. 실행파일 재패키징은 포함하지 않는다.


## 2026-10-03 source31 무기 옵션 입력 무결성

| 경계 | 현행 계약 |
|---|---|
| _slotFlatAtk | sharpAtk/brutalAtk/ruinAtk 직접 합산에 (+a.value||0). _eqAffix 캐시 경로와 독립 |
| meleeRef/bowRef/magicRef | 기존 전체 함수·공식·장비/강화/스탯/baseAtk·봉인*.3 유지. 직접-affix 문자열 연결만 숫자합으로 복구 |
| _eqAffixRebuild/_eqImplicit | 옵션·임플리싯을 숫자합으로 공급. 생성 수치/티어/확률·스킬/기본공격 배율 변경0 |
| 실제 root 대조 | sharp/brutal/ruin [5,3,2]에서 참조118 유지; [5,"9",3]에서665931527→125; [5,"ab",3]에서NaN→116. 통제 장비 atk60/enh2·스탯 fixture 값이며 실제 캐릭터 수치 아님 |
| 검수 | 신규30+기존 basicAttackDamage4=생산34PASS. 실제 전체3참조와 장비 집계함수·정확 applyStats 장비 기본항 실행, 전체 프레임/후속 스탯/실저장/native 미인수 |

원본 atk/enh/bonusHp 또는 PASSIVES/STATS 손상 후보, 기존 다른 어픽스 미연결 정책은 별도다. 사용자 저장을 수정하지 않았다. [정확한 숫자 합산·소비 계약](../15%20세이브+데이터구조/15%20세이브+데이터구조.md#2026-10-03-source31-장비-옵션-숫자-합산) 및 test/equipmentNumericAggregation.test.cjs를 따른다.


## 2026-10-03 source32 패시브 복원과 기본 피해 무결성

| 적용 위치 | 현행 계약 / 통제 입력 대조 |
|---|---|
| dbRestore / DEMO500 | 두 PASSIVES 복원에 숫자 변환 +값||0. 정상 rank/피해·레벨·공식 변경0 |
| hitArc weapon 선행 분기 | pAtk="ab" 저장 복원 후 baseDmg420의 ~~(baseDmg*pAtkMul()*pMeleeMul())가0→294. _atkBon 가산·reset 유지 |
| 전체 fireBow | 같은 저장 rank에서 bowRef100 투사체 최종 피해0→2100. 기존 ×10·×3·악의1/발·보너스/reset 유지 |
| energyShot 정확 피해식 | magicRef100/statInt1/스킬·합체1에서0→140. 마법2배/pMagicMul(false) 기존 계약 유지 |
| 정상 대조 | pAtk9/"9"는 위 순서558/3990/266 유지. 사용자 실제 피해 수치가 아닌 fixture |
| 검수·한계 | 양판 신규36+장비숫자합30+기본공격4=70PASS. 전체 hitArc·마법시전·전체복원·native 미실행; Infinity/음수소수/초과레벨을 새로 제한하지 않음 |

source31에 별도 후보로 남겨 둔 PASSIVES는 이번 두 복원 경계에 한해 처리했다. STATS·장비 기본값·전체 save normalization Gate는 유지한다. [저장 숫자 경계 정본](../15%20세이브+데이터구조/15%20세이브+데이터구조.md#2026-10-03-source32-패시브-복원-숫자-경계).


## 2026-10-03 source59 무기 기본 공격력 숫자 소비

| id / 위치 | 현재 계산·검수 계약 |
|---|---|
| A59-MELEE / meleeRef | (((+wp().atk\|\|0)+enhMulAtk(wp().enh\|\|0))+_slotFlatAtk(wp())+P.baseAtk+(STATS.str+_eqStat('Str')+_lvB()))*(P._weaponSeal>0?.3:1) |
| A59-BOW / bowRef | (((+bw().atk\|\|0)+enhMulAtk(bw().enh\|\|0))+_slotFlatAtk(bw())+P.baseAtk+(STATS.dex+_eqStat('Dex')+_lvB()))*(P._weaponSeal>0?.3:1) |
| A59-MAGIC / magicRef | (((+hm().atk\|\|0)+enhMulAtk(hm().enh\|\|0))+_slotFlatAtk(hm())+P.baseAtk+(STATS.int+_eqStat('Int')+_lvB()))*(P._weaponSeal>0?.3:1) |
| 최소 변경 | 양판 위3함수의 최초 atk 항에 unary+ 각1개, HTML각+3B. enhMulAtk(n)=n*0.25/어픽스합산/스탯·레벨/봉인*.3/연산순서·공격배율 불변 |
| 복원·장착 | 실제 whole dbRestore→이미장착 weapon/bow/helmet 또는 가방→whole equipItem/_refreshEquipmentStats→whole3참조→whole fireBow/_fireXbow를 같은 VM에서 실행. atk 원값60/0/-10/.5 숫자문자열은 대응 숫자와 동일, ab/빈객체는0 소비. raw 장비·스키마를 다시 쓰지 않음 |
| 정상 호환 | 숫자0/60/-10/.5/10000/NaN/Infinity/undefined 8입력×양판16조건은 원본과 동일. 음수·소수·Infinity 기존 의미 유지, finite clamp/공격력 상한/전체저장정규화 추가0 |
| 합성 명시 사례 | Lv20, STATS STR20/DEX21/INT22, 장비 bStr5/bDex6/bInt7, atk 문자열60/enh2, sharpAtk5/brutalAtk 문자열3, P.baseAtk15: 참조118.5/120.5/122.5. 통제 pBowMul2/pXbowMul1.2/석궁 atkMul1.5/수동 보너스10에서 실제 fireBow 투사체7260, _fireXbow 일반1383/터렛1.5배2076. 이는 합성 장비·통제 배율이며 사용자 캐릭터/게임 기본 상수 아님 |
| 발사 보존 | fireBow의 악의1 소비/_bowBon reset·×10/×3/관통0/회복 및 _fireXbow의 고정28/×3/터렛 배율/위치·사거리·속도·이펙트·음향 호출은 수정0. 실제 투사체의 hit/enemy/hurtE 실행0 |
| 검사 | test/weaponBaseAttackConsumption.test.cjs 후보66PASS/생산66PASS, 명시source58원본16PASS·50 assertion FAIL. 문자열/비숫자6×이미장착/가방2×봉인2×양판48조건, 숫자16 및 명시2. 50은 음성 대조 조건 수이며 독립버그50개 아님. 기존 equipmentNumericAggregation30+basicAttackDamage4=인접34PASS. 양판 inlineJS12/importmap2 구문PASS |
| 준비 오류 | 초기 광범위 atk selector는 중복19을 검출해 생산쓰기 전 거절. 첫 후보검사64PASS/명시2FAIL은 기대값 덧셈20 누락으로 수정, 피해 기대값도 연동 정정. 성장 마이그레이션/제품 결함으로 계산0. 실패 원자료 보존 |
| 인수 경계 | stat-refresh/공간/무관 마이그레이션/음향·UI·네트워크·저장 leaf와 projectile pool/석궁 배율·타입표는 통제 대역. 동일 전체boot·실키·실저장·native·시각·청취·실적피해 인수0 |
| 미변경 범위 | wSwing의 wp().atk 직접식·다른 공격 caller, STATS/b필드 전부 숫자 안전 주장0. raw enh/bonusHp/bonusMp/bonusShield/DEF/eDef/강화이전 정책 미채택. 보호2_3/Q전용패링/E불가/어택티켓금지/사용자23·타인WIP 보존. 현재 app29/3404에는30~59 미반영 |

BALANCE1350A magicRef 및1355 meleeRef/bowRef 원문·당시 source57/WIP 관측 핀을 유지하고 공식source58에서 최소3항만 채택했다. 기존 source31의 원본 atk 미검수 표기는 당시 이력이며, source59는 위 세 참조 소비만 추가 처리한다.
