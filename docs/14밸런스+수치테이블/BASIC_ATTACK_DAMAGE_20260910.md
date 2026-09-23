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
