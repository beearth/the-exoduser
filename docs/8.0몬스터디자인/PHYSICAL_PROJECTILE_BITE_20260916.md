# 물리탄 축소·피격 이빨 연출 — 2026-09-16

현재 작업 중이던 물리탄 코드와 회귀 검사를 전체 작업 정리 시 함께 보존한다. 전투 수치 변경 없이 기존 큰 이빨입을 축소하고 실제 피해가 승인된 순간 플레이어에 짧은 이빨 연출을 붙인다.

| 항목 | 현행 값·공식·위치 |
|---|---|
| 비행 본체 | 공통 physical 분기의 `_drawPhysMouth` 높이=`22.05×_sSc×0.55`, 폭=높이×2. 최대135.828×67.914px |
| 궤적 굵기 | 기존 `_hr`에 `_isBitingPhysicalProjectile(p)?0.55:1` 적용 |
| 대상 | 적대 physical. friendly·titanEye·_druidPoison·fbEnergy·fdEnergy는 붙는 이빨 제외 |
| 피격 전달 | `_hurtProjectilePlayer`가 `opts.mouthProjectile=p` 전달. `hurtP`에서 DOT가 아니고 projectileHitSfx이며 최종피해a>0일 때 `_addPhysicalBite` 호출. ES 흡수도 표시 |
| 미발동 | 무적·회피·패링·DOT·비투사체 피해는 붙는 이빨 없음. 물리탄의 기존 즉시 `_projHitFx` 대신 몸에 붙는 연출 사용 |
| 저장 | `P._physicalBites`: born=`_gameFrame`, stage, ang, size의 값만 보관. 풀에 반환할 투사체 객체를 참조하지 않음 |
| 수량·수명 | 최대3개, 초과 시 가장 오래된 것 제거.48틱(0.8초),16틱 주기3회. 스테이지 변경·게임 정지·플레이어 사망 시 제거 |
| 크기 | `clamp(22.05×max(1.2,min(4,(sz||1)×1.5))×.7×2×.55×.65,22,36)` |
| 방향 | vx/vy가 있으면 atan2(vy,vx), 없으면 투사체→플레이어 방향 |
| 위치 | bite=`sin((age%16)/16×π)`; x=`P.x−cos(ang)×(18−bite×3)`, y=`P.y−14−sin(ang)×(12−bite×3)` |
| 연출 | row1의6프레임, scale=`1−bite×.16`, 회전=`ang+sin(age×1.4)×.055`, fade=`min(1,(48−age)/12)`, 비행탄과 같은 사전 보정 `_physMouthSheet` 사용. [회백색 픽셀 공식](PHYSICAL_PROJECTILE_VISIBILITY_20260914.md) |
| 상처 | 주기6~11틱에 #a92232 선3개, 두께2px, 방향간격.65rad, 길이=`4+(phase−6)×1.4`, alpha=`fade×(12−phase)/6` |
| 렌더 순서 | drawP 직후 `_drawPhysicalBites`, source-over·save/restore. 별도 추가 피해·DOT 없음 |
| 시트 함수 | `_drawPhysMouth(x,y,sz,ang,alpha,row,frame)`의 frame 생략 시 기존 자동재생, 지정 시0..n−1 범위로 제한. 시트 미준비 실루엣 유지 |
| 검증 | `physicalProjectileBite`, `physicalProjectileVisibility`, `projectilePlayerHitSound`: 플레이어 추적·수명·최대수·제외 대상·풀 재사용·실제 피해 경로·ES 흡수 확인 |

- 관련 회귀50개 PASS. 양쪽 HTML의 실행형 인라인 스크립트 각6개 구문검사 PASS.
- Chrome 실제 게임에서 에너지쉴드 흡수 명중 후 부착 생성, 캐릭터 위 개구/씹기 프레임을 직접 확인했다. 전체 장시간 전투 체감 검증은 별도다.
- 관련 문서에 남아 있던 과거 자원 수치를 현행 HP/MP/ST 기본50·기동력/분노/악의 최종2배 계약으로 동기화했다. 코드의 자원 계산은 변경하지 않았다.
