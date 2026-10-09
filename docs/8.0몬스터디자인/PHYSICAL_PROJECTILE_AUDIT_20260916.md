# 물리탄 가시성 재검수 — 2026-09-16

2026-10-09 현행 예외: [현행 독탄 core·외곽·꼬리 계약](../5.1임펙트디자인/DRUID_PROJECTILE_READABILITY_20261009.md)가 아래 2026-09-16 Druid 원형반경.42/내부호.27 폴백 기록보다 우선한다. 새 halo반경.37S/alpha.12·core 타원/원형·중심빛과 바깥 패링키를 쓴다. 당시 QA는 역사이며 새 main 인수로 합산하지 않는다.

이전 완료 보고는 공통 물리탄 3발의 정지 화면에 한정되어 있었다. 사용자 제보의 특정 몬스터 무리/구간은 아직 식별하지 못했다. 아래 검사는 해당 장면의 재현과 구분한다.

| 경로 | 확인 방법 | 결과 / 한계 |
|---|---|---|
| 돌진 중 일반 물리 발사 | 실제 `mkEn` etype22/30/43을 생성하고 충전·돌진 타이머를 재현용으로 맞춘 뒤 `updateE` 12틱 실행 | 8틱에 세 개체 모두 eCharge, 12틱에 eCharge 상태에서 3발 생성. physical, sz3, 속도5px/틱. 흰 링과 뱀탄을 WebGL 화면에서 확인 |
| 생성 구간 | `mkEn(...,si=1,...)`로 돌진형 초기 필드를 생성하고 테스트 화면에서 실행 | si0은 `_CH1_OPENING_EXCLUDED_ET`에 의해 돌진형이 etype0으로 치환됨. etype2도 현재 돌진 비활성. 이전 문서의 ‘돌진형 etype2’ 설명 정정 |
| 일반·redBean·swordWave·pierce·fast·phantomSword | 실제 spawnProj → draw 전체 실행, 호출 기록 및 화면 비교 | 당시 여섯 프로필 모두 공통 회백색 입(후속 사용자 지시로 현재 원본 적갈색 복구), 높이67.914px(입력sz1.5→스폰sz3). 전용 플래그로 작은 점 렌더에 빠지지 않음 |
| 혈안탄·드루이드 원본 물리탄 | 같은 화면에 함께 생성 | 혈안은 눈알, 드루이드는 녹색 독탄. 기존 전용 외형 유지 |
| 시트 실패 | 물리 시트 준비=false, 드루이드 이미지 naturalWidth=0 및 캐시=null을 테스트 탭에서 강제 | 일반·검기·관통은 입 실루엣 유지. 드루이드 E/Q탄은 아래 수정 후 녹색 원형 본체 유지 |
| 발사 전조 큐 | enemyShotWarning / projChargeTelegraph | 60틱 대기, 완료탄 밀도드랍 면제, 혼합탄 색 분리, 스턴/사망/스테이지 전환 취소, 사망탄 전조 검사 |
| 패링·전투 데이터 | physicalProjectileParry / ScaleReward / Expiry / enemyProjectileSpeedBand / projectileParryClassification | E/Q 분류·속도·보상·만료 계약 확인 |
| 렌더 검사 보강 | physicalProjectileVisibility | `_ps` 계산 이후 일부 조각 대신 draw의 실제 메인 투사체 ForStatement 전체 실행. 앞쪽 조기 분기로 공통 외형을 건너뛰는 회귀도 검사 |
| 테스트 정비 | projectileParryClassification / projectileVisualTaxonomy | 당시 제거된 X.filter 문자열 기대를 사전 보정 시트 검사로 교체했고, 후속 색 복구 시 원본 시트 사용 검사로 변경. 크라켄은 기존 현행 계약 EL.I를 기대하도록 정정(게임 속성 변경 없음) |

## 발견·수정: 드루이드 이미지 실패 시 투명한 공격

| 항목 | 현행 계약 |
|---|---|
| 원인 | `_drawDruidPoisonShot`이 이미지 미준비 시 false를 반환했지만, 호출부는 무조건 continue. 피해 판정은 남고 본체가 사라짐. 추적지뢰도 같은 함수 사용 |
| 대상 | `_druidPoisonFly` 캐시가 없고 `_fdFlyImg`가 미완료 또는 naturalWidth=0인 경우 |
| 크기 | size=(추적지뢰 또는 elemBall이면240, 아니면 max(96,min(180,(sz\|\|4)×24)))×_physicalProjectileMultiplier(p,2) |
| 본체 | 중심(p.x,p.y), 반지름size×.42, 채움#66dd22, 외곽#102008·3px |
| 내부 호 | 반지름size×.27, 각도−.85π~.35π, #ddffb8, 굵기max(2,size×.025) |
| 투명도 | 전달 alpha 유지, 생략 시1. 추적지뢰 대기.65/활성1 유지 |
| 복구 | 준비된 캐시가 있으면 계속 사용. 이미지 준비 후 기존16프레임 녹색 시트를 자동 사용. 상태·피해·히트박스·패링 변경 없음 |
| 테스트 | druidProjectileFallback: 두 HTML에서 물리·마법·추적지뢰의 로딩 실패 본체/외곽선/전투 데이터 불변 검사 |

## 검증 범위

- 관련 자동 검사 69개 통과. 사용자 제보의 특정 세 마리 무리, 전 스테이지 장시간 교전, 모든 그래픽 품질 및 렌더러 조합까지 완료한 것은 아니다.
- 브라우저 검수는 로컬 WebGL에서 수행. 테스트를 위해 만든 개체/상태는 해당 테스트 탭에만 적용했고 종료 후 탭을 닫았다.


## 2026-09-16 흰 링 거미줄 점탄 누락 수정

| 항목 | 현행 계약 |
|---|---|
| 누락 원인 | `web:true`는 속성 `EL.P`로 흰 링을 쓰지만 패링 분류는 `forbidden`. 기존 physical/E 분류 검수에서 제외됐고, draw의 별도 web 조기 분기가 반지름2px·alpha .2 점과 길이8px·alpha .15·굵기1px 선4개를 그림 |
| 실제 발사 | `etype13` 거미 사도 idle, 거리30 초과~1200 미만에서 `_spawnBossProjectile` → 비보스 `_emitEnemyShot` → 흰 링 `#f4f4f4` 60틱 → `spawnProj` |
| 새 표시 | 두 HTML의 `if(p.web)`에서 `_drawPhysMouth` 호출. 원본 `img/proj_phys_mouth.png` 적갈색 RGB/alpha 그대로, 진행방향 `atan2(vy,vx)`, row0·8프레임. 색 보정 없음 |
| 크기 | `_webScale=max(1.2,min(4,(sz 또는 1)×1.5))×.7×2`; 높이=`22.05×_webScale×.55`, 폭=높이×2. 실제 스폰 sz1.2→2.4이면 셀 전체 **122.2452×61.1226px**. alpha는 기존 비행 fade `fa`. `_eyeSkin=1`은 렌더 표식 |
| 유지 | `parryClass=forbidden`, Q/E 반사 불가, 접촉 둔화 `P._webSlow=90`(1.5초), 피해·충돌·속도·수명·공격 전조 변경 없음. 뱀형 외형을 공유해도 물리탄 부착/물어뜯기 대상에는 추가하지 않음 |
| 폴백 | 기존 `_drawPhysMouth`의 이미지 로딩 실패 방향성 입 실루엣 사용 |
| 자동 검증 | 실제 draw 메인 투사체 루프에 web 프로필 추가: 수정 전 두 HTML에서 실패, 수정 후 통과. 패링 forbidden·전투 데이터 불변 및 부착 제외 검사. 관련 10개 테스트 파일 56개 PASS |
| 브라우저 검증 | 로컬 WebGL 테스트 탭에서 실제 `mkEn(...,si=1,etype=13)` → `updateE` → 경고60틱 완료 실행. 흰 링 큐/최종 web·forbidden·sz2.4, 입 렌더 높이61.1226·alpha1 확인. 원본 색 뱀형 스크린샷 검수. 가림 확인용으로 테스트 탄 위치만 옮겨 단독 외형도 확인 |
| 범위 | 사용자 제보의 특정 세 마리 무리/실행본은 아직 식별되지 않음. 이번에는 재현된 별도 점탄 경로를 수정했으며 모든 스테이지 검수 완료를 의미하지 않음 |
