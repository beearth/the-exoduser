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


## 2026-09-16 — 대형탄 패링 분열탄 유도·적중 임팩트 수정

| 항목 / 적용 위치 | 현재 코드 계약 |
|---|---|
| 원인 | 원형 5발 분열 이후 일반 magic의 250px 탐색만 사용. shQuery에 없는 크라켄·화마귀·지상뱀장어는 유도에서 누락. 필드몹 적중에는 전용 속성 임팩트·타격음이 없고, hitCd 중 접촉은 탄 소멸로 처리되지 않았음 |
| 분열 / _splitParriedBigEnergy | 크라켄 fbEnergy와 화마귀 fdEnergy 공통. 5발·원형 균등 72° 간격·반지름12px 스폰·속도7.5·r8·사거리900·발당 max(1,floor(totalDmg/5))·magic/_parryMagicShot·혜성 길이246.4px 유지. Q 보상×10 유지 |
| 탐색 / 플레이어 투사체 유도 루프 | _parryMagicShot만 탐색 반경900px, 최대 선회0.7×_dtSp rad/갱신, (G._gcT+i)%2===0에서 갱신. 일반 magic은 기존250px/0.35 유지. 반사 쿨다운 동안 유도 중단 유지 |
| 필드 타깃 / _parryMagicFieldTarget | 일반 적 후보와 G._fieldBosses(없으면 G._fieldBoss)·G._fireDevils·G._worms를 거리로 비교. asleep, 사망, _fmCanHit 불가, _hitSet 포함 대상 제외. 크라켄 TP 중 _fmXY의 tpX/tpY를 추적하며 화마귀·뱀장어는 실제 충돌과 동일한 x/y 사용. 타깃이 사라지면 다음 갱신에 재탐색 |
| 물 적중 / _parryMagicHitFx | EL.I: waterImpact r72/66f, Water_ImpactWater_Sheet.png 전체16프레임, 최대 표시216px. 분열 시작 Q 물보라는 기존 r96/72f·최대288px. 임팩트 위치는 탄 접촉 x/y |
| 기타 속성·소리 | 물 이외에는 기존 _projHitFx(x,y,el,false). 모든 분열탄 적중에 playSampleAt('bullet_hit',0.3,1,x,y). 일반 적 magic 타격음 중복 호출 제외 |
| 필드 접촉 / _hurtFieldMobs(...,parryShot) | 선택적 여섯째 인수에 분열탄 전달. 유효한 필드몹 접촉 시 임팩트·음향·탄 회수를 보장하고 일반 적 충돌까지 중복 진행하지 않음. 기존 _fmApply의 hitCd=8 피해 간격 유지: 쿨다운 중에는 추가 피해 없이 접촉 효과 후 소멸. 기존 다른 호출은 피해 적용 횟수 반환 유지 |
| 적용 / 검증 | game.html 및 game-easy-test.html. test/parryMagicTrackingImpact.test.js: 5발 모두600px 크라켄 도달, 일반 적600px 포착, 일반 magic 범위 보존, 필드 쿨다운 접촉 효과·소멸 계약, TP 좌표·비활성 타깃 제외. 백업 tmp/kraken_parry_20260916/ |

분열탄은 공용 magic 벽 반사 경로를 그대로 사용한다. 기존 문서의 ‘튕김 미사용’은 arcMissile 전용 튕김을 뜻하며, 실제 공용 벽 반사는 _maxBounce||3에 따라 최대3회, 반사 후 _bounceCool=6이다. 이번 수정은 이 값을 변경하지 않는다.

검증 결과: 관련6개 테스트 파일43개 PASS. Chrome 실제 런타임에서 `_hurtFieldMobs`의 쿨다운 중 분열탄 접촉 반환1·waterImpact r72/66f 생성·물 시트 로드·화면 물보라 표시 확인, 브라우저 error 로그0. 캡처 `tmp/kraken_parry_20260916/water-impact.jpg`. 브라우저 검증은 접촉 함수를 직접 실행한 효과 확인이며 키 입력 기반 전체 Q패링 전투 검증과 구분한다.
