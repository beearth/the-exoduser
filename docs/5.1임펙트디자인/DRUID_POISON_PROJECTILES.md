# 드루이드 녹색 독탄 — 2026-09-06

> **2026-09-08 데모 피날레 예외:** `?demo`/`?bic`의 마지막 보스(si3)는 [다크드루이드 피날레 v0.2](../8.1보스디자인바이블/DARK_DRUID_DEMO_FINALE_DESIGN.md) §0을 따른다. 전용 3막·5종 패턴, 동작별 Q독탄(48f 전조/막별1·2·3웨이브/간격30f/수명90f), 돌진·잠행 뒤96f 회복, 잠행 표적 고정, 제자리 HP페이즈 전환, 반투명 독늪을 적용했다. 이 조건의 독립 ORB·상시 리듬탄·idle 자동탄은 생성하지 않는다. 일반 si0/si3와 다른 보스의 수치·부활·Q/E 규칙은 기존 계약 유지. 아래 이전 드루이드 설명은 해당 예외를 제외한 기존 계약/이력이다.

> **2026-09-06 드루이드 독탄 최신 계약:** si0/si3 보스 소유 탄은 녹색 독탄으로 통일한다. 기존 화염 혜성 외형 설명보다 `docs/5.1임펙트디자인/DRUID_POISON_PROJECTILES.md`가 우선한다. 화마귀16f 구체의 녹색 질감 버전을 사용하고 피해 EL.P 및 실제 HP 피해시 중독+3을 적용한다. 기존 Q/E 분류는 보존한다. 추적지뢰도 드루이드만 녹색 구체240px로 교체; 다른 보스/소환 잡몹은 제외. 독립 녹색 ORB는 유지. 교체목록 전체 완료는 아님.

| 항목 | 구현 계약 |
|---|---|
| 대상 | si0/si3의 ib=true 보스가 발사한 탄. `_spawnBossProjectile(e,props)`에서 `_druidPoison` 표식 부여. 소환 잡몹 및 다른 보스 제외 |
| 독 속성 | 독 전용 EL 번호는 만들지 않는다. 기존 독의 EL.P=0 기반 피해와 P.poison 상태이상을 사용. col=#66dd22 |
| 패링 | 변환 전 `_projectileParryClass` 값을 p.parryClass에 보존. Q/E/패링금지 구분 유지, blackBean은 Q 전용 유지. 반사 후에는 기존 아군 탄 외형 사용 |
| 비행 아트 | 화마귀 `img/proj_firedevil_orb.png` 4×4/16f를 1회 grayscale→multiply #66dd22→원본 alpha 마스크로 베이크. 픽셀 질감 유지. 프레임70ms, source-over |
| 비행 크기 | 일반 max(96,min(180,(sz\|\|4)×24))px. elemBall 및 추적지뢰240px. 판정 반경은 시각 크기로 변경하지 않음 |
| 리듬탄 | 기존 발사 속도/주기/발수 입력 유지. 화염 입력 프로필을 owner wrapper에서 독으로 정규화. 집광/Q 텍스트 녹색 |
| 피격 | `_hurtProjectilePlayer`가 druidPoison 옵션 전달. hurtP에서 최종 HP 피해 a>0일 때 P.poison+=3. 무적/회피/무피해에는 신규 독 부여 없음. 기존 중독 감소/틱 공식 재사용 |
| 화상 | 드루이드 빨콩의 기존 _rbBurn 추가는 금지. 중독으로 대체 |
| 추적지뢰 | `_druidMine` 소유 표식, 녹색 화마귀 구체240px, 대기alpha .65/활성1. 실제 피해시 중독+3. 기존 추적/준비/수명 유지 |
| 독립 ORB | 이미 녹색 드루이드 8f 시트와 중독+3/속박을 쓰는 별도 G._druidOrbs 경로 유지 |
| 풀 재사용 | spawnProj 재사용시 _druidPoison=false, _druidParryClass=null 초기화. 다른 적에게 표식 누수 방지 |
| 범위 제외 | 보스 근접공격 및 모든 장판 재디자인은 이번 탄막 요청 범위가 아님. 보스 VFX 교체 목록 전체 작업은 별도 |

## 검증

- owner-aware 테스트: stage0/3/4 × ib true/false에서 드루이드 소유자만 표식 획득.
- 관련 테스트 7개 PASS(소유자, 리듬탄, 풀, 문법).
- `tmp/verify_druid_poison.py`: 실제 브라우저에서 드루이드 탄 poison=true/el0/green/Q, 일반 몬스터 false/el1 확인, pageerror0.
- `captures/druid_poison_projectiles.png`: 녹색 재질·16f 시트 경로/일반과 대형 크기 확인. 모든 패턴 장시간 교전 검수는 미실시.
