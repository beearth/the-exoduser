# 1-1 공개 보스 — 다크드루이드 (2026-09-06)

> **2026-09-09 피날레 v0.3:** 데모/bic 마지막 si3 보스의 전용 카메라(.30~.80)·마우스 조준 보정·최종 부활 판정 후210f 승리 배너/음악·잔류 독탄/독늪 제거·비긴급 펫 잡담 억제는 [현행 계약과 검수 기록](../8.1보스디자인바이블/DARK_DRUID_FINALE_QA_20260909.md)을 따른다. 일반 보스/일반 bosstest 및 기존 부활/HP/피해/패링 수치는 유지한다.


> **2026-09-08 데모 피날레 예외:** `?demo`/`?bic`의 마지막 보스(si3)는 [다크드루이드 피날레 v0.2](../8.1보스디자인바이블/DARK_DRUID_DEMO_FINALE_DESIGN.md) §0을 따른다. 전용 3막·5종 패턴, 동작별 Q독탄(48f 전조/막별1·2·3웨이브/간격30f/수명90f), 돌진·잠행 뒤96f 회복, 잠행 표적 고정, 제자리 HP페이즈 전환, 반투명 독늪을 적용했다. 이 조건의 독립 ORB·상시 리듬탄·idle 자동탄은 생성하지 않는다. 일반 si0/si3와 다른 보스의 수치·부활·Q/E 규칙은 기존 계약 유지. 아래 이전 드루이드 설명은 해당 예외를 제외한 기존 계약/이력이다.

> **2026-09-06 드루이드 독탄 최신 계약:** si0/si3 보스 소유 탄은 녹색 독탄으로 통일한다. 기존 화염 혜성 외형 설명보다 `docs/5.1임펙트디자인/DRUID_POISON_PROJECTILES.md`가 우선한다. 화마귀16f 구체의 녹색 질감 버전을 사용하고 피해 EL.P 및 실제 HP 피해시 중독+3을 적용한다. 기존 Q/E 분류는 보존한다. 추적지뢰도 드루이드만 녹색 구체240px로 교체; 다른 보스/소환 잡몹은 제외. 독립 녹색 ORB는 유지. 교체목록 전체 완료는 아님.

> **2026-09-06 최종 확정 — 해골무덤 플레이어 전용:** 드루이드만이 아니라 **전체 보스(si0~34)의 cageTrap 사용을 금지**한다. 아래 보스 사용 계약은 이전 기록이다. 모든 무브셋에서 제외, 관련 콤보 2개 제거, AI 점수 -1, 강제 실행도 생성·피해·소리 없이 recover/25f 종료. idx41 정의는 배열 인덱스 호환용 예약으로 보존한다. 플레이어 boneWall/boneStorm과 공용 boss_cageTrap 이미지·음향은 유지한다. 기존 보스용 잔여 배열/렌더는 호환용이며 신규 생성 경로는 없다. 회귀 검사: 35개 stage 강제 호출 모두 생성 0, 플레이어 공용 시트·음향 포함 관련 테스트 7개 PASS.

사용자 확정: 1-1 보스는 다크드루이드. 기존 흑요염 배정은 철회한다. 맵 번호를 si3으로 바꾸지 않으며 1-1 맵·진행·보상 스케일은 유지한다. 1-4 드루이드도 유지한다.

| 항목 | 현행 값 / 적용 위치 |
|---|---|
| 스테이지 / 표시 이름 | si0 / `HELL_BOSSES[0][0]='다크드루이드'`, `STG[0].bn`·보스 HUD·등장 타이틀 |
| 외형 | `_CODEX_BOSS[0]=_CODEX_BOSS[3]`, use2D=true, anim=true, dw=9.3, dh=14.1 (기존 대비 1.5배, r=44 기준 높이 620.4px). 기존 드루이드 8방향 walk/attack 및 idle/emerge 시트를 사용 |
| 3D / 거대 플래그 | use2D로 3D overlay 차단; `_enterBossArena`에서 si0 `_isLargeBoss=true` 할당 제거 |
| 속성 | `STG` 생성 `be:th.be`; CH1 EL.P=0. 구 si0 EL.F 강제 지정 제거. 독 디버프는 전용 패턴의 기존 규칙 |
| 무브셋 | `_BOSS_MOVESET[0]=new Set(_BOSS_MOVESET[3])`; 23종: slashCombo, slam, sweep, charge, jump, burst, shock, fan, groundFissure, poisonTrail, spin, grab, multiDash, tideWave, chaseAoe, elemBall, beanStorm, summon, mine, seekerMines, lavaPools, rapidMissile, burrowStrike |
| 전용 분기 | 기존 `G.stage===3` 드루이드 조건을 `(G.stage===0\|\|G.stage===3)`으로 확장: 혜성 Q탄막, orb, 독/감속, 근접 연속 AI 보정, 독늪 3지점, 돌진 잔상, 충격 링, 잠행, 독장판 렌더 |
| 수치 유지 | 본체 시각 크기만 1.5배. 기술 피해·주기·범위, 피격 반경 r=44, si0 HP/ATK·부활·보상 공식 및 맵/스폰 좌표 불변 |
| 구 자산 | 흑요염 이미지/번역/음성 카탈로그 보존. 기존 `_BOSS_SFX[0]` 음성 유지 |
| 적용 범위 | 일반 1-1 보스 아레나 및 `bosstest=0`. mapqa 무전투 관람의 보스 제거 규칙은 변경하지 않음 |

## 검증

### 후속 수정 — 크기와 해골무덤 사용 금지

| 항목 | 계약 |
|---|---|
| 크기 원인 | 드루이드 전용 렌더의 `1/_btScaleMul`이 공통 확대를 상쇄한다. 구 기본 박스 높이 44×9.4=413.6px. 원래보다 작아진 이력 자체는 미확정이며 이번 수정은 명시적 1.5배 확대다 |
| 크기 수정 | si0/si3 공유 spec dw=9.3, dh=14.1. 걷기/공격/변신/잠행 출현 모두 적용. 테스트베드 공통 배율 상쇄는 유지 |
| 기술 차단 | `_BOSS_MOVESET[3].delete('cageTrap')` 후 si0 복제. 직접 cageTrap 실행도 si0/si3에서는 생성·소리 없이 recover/25f로 종료 |
| 보존 | 다른 보스 cageTrap, 플레이어 boneWall/boneStorm, 공용 뼈감옥 이미지·효과는 유지 |
| 회귀 검사 | 배정/강제 감옥 차단/공용 뼈감옥/문법 7개 PASS |

- `test/ch1DruidAssignment.test.js`: 변경 전 이름 흑요염으로 실패 → 변경 후 드루이드 이름/애니메이션/23종 무브셋 통과.
- 관련 Node 테스트 10개 통과(배정, 기존 자산 보존, 탄막, inline 문법).
- `tmp/verify_ch1_druid_assignment.py`: 실제 stage0 아레나에서 name=다크드루이드, animated/use2D/burrow=true, large=false, element=0, pageerror=0 확인.
- 화면 증거: `captures/ch1_druid_assignment.png`.

## MAP PRODUCTION REPORT

| 항목 | 결과 |
|---|---|
| STAGE | CH1-1 / si0, 보스 배정 수정만 |
| MASTER | silhouette/regions/main route/side spaces 변경 없음 |
| OUTER MASS | LEFT/RIGHT/TOP/SOUTH/major holes 변경 없음 |
| LARGE | assets/composites/overlap/repetition 변경 없음 |
| MEDIUM | connections/holes 변경 없음 |
| GROUND | shadow/contamination/integration 변경 없음 |
| PLAYABLE | arena/travel/breathing/threat 공간 변경 없음; 보스 종류 변경 |
| LANDMARK | primary/secondary/tertiary 변경 없음 |
| CAMERA QA | EXIT/BOSS 배정 확인; START/EARLY/ARENA/SIDE L/R/LANDMARK/LATE 환경 재심사 미실시 |
| TECH QA | 런타임 배정·문법·pageerror PASS; route/collision/seam/loading/performance/404 전수 재검증 미실시 |
| FILES | game.html, 보스 배정 테스트·QA 스크립트, 관련 docs. 기존 동시 변경 보존 |
| GIT | staged/commit/push/deploy 실행하지 않음 |
| VISUAL VERDICT | RETOUCH — 전체 공개용 맵 환경/카메라 QA는 아직 미완료; 자동 테스트로 시각 최종 승인하지 않음 |
| NEXT PASS | 1-1·2-1·3-1 공개용 배치/각 장 보스 구성 정리 및 전체 카메라 QA |
