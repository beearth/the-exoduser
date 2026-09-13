# 크라켄 물 에너지탄 속성 정합 — 2026-09-13

| 항목 | 현재 구현 |
|---|---|
| 원인 | 물 소용돌이240px 시트를 모든 크라켄이 공유하면서 p.el=fb.el을 사용해 화/암/뇌 개체가 외형과 다른 피해·분열·폭발을 생성 |
| 발사 | _fbFireEnergy에서 전개체 el=EL.I(2), col=ELC[EL.I]=#3388ff. 충전 파티클도 같은 파랑. 개체 고유 el/HP바/순간이동 색과 배치4마리는 유지 |
| 피해 | 실제 spawnProj에 물 속성을 전달하므로 피격·속성 상성 계산도 물/빙 경로. 피해량 atk×2.8 및 스폰 공용배율, 속도·크기·수명은 유지 |
| 분열 | 기존 _splitParriedBigEnergy가 원본 p.el을 보존하므로 물 속성 magic/_parryMagicShot 5발. 발당 max(1,floor(totalDmg/5)), 속도7.5·r8·사거리900·혜성 시각246.4px 유지 |
| 패링 효과 | _resolveBigEnergyParry가 fbEnergy&&p.el===EL.I일 때 doParry의7번째 인수 impactKind=waterEnergy 전달. 이 경우 waterImpact r96/72f(최대288px) 물보라 사용. 물 파란콩의 waterBean 분기와 구분 |
| 충돌·폭발 | 기존 _fbEnergyBoom의 EL.I 경로로 waterImpact r220/90f, 물 bigImpact, 파란 플래시0.32·파티클42·흔들림32. 플레이어·벽 충돌 공통 |
| 유지 | 화마귀 fdEnergy는 불 속성과 불 분열·폭발 유지. 크라켄의 별도 물리 눈알탄 titanEye 3연사와 E패링은 기존 경로. 대형 에너지탄 Q패링·자원회수×10 및 이전 착지 피해½·밀침2배 유지 |
| 적용 | game.html / game-easy-test.html |
| 자동 검증 | test/krakenWaterEnergy.test.js: 두 HTML×4개체 속성의 실제 발사→분열→폭발 함수 실행, 화마귀 불 속성 보존, 전용 물 패링 분기12개 PASS. 기존 bigEnergyParrySplit13개 PASS |
| 브라우저 | 실제 spawnProj·분열·폭발 경로로 네 속성 크라켄의 물 탄과 물 분열5발 확인. output/kraken_water_20260913/qa.json 및 화면. 키 입력 기반 패링 전체 플레이 검증은 기존 경로 검사와 구분 |
| 백업 | tmp/kraken_water_originals/ |
