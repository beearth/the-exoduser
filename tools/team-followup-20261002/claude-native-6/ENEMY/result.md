# ENEMY (claude-native-6) — native-hurtE-death-shot-fixture 결과 (2026-10-02)

실제 `hurtE` 사망탄 블록(etype29/55/59)과 실제 발사 helper·`eShootWind` 완료 case를 소스에서 추출하여
**생전예약 → 동일frame 사망탄 경로의 최소 fixture**를 작성·실행했다. 결과: **18 PASS + 4 REPRODUCED / 0 FAIL (양쪽 HTML)**.
생산 적용·게임 실행·시각/청취 인수·기존76검사 재실행은 0이다. 후보는 메모리에서만 대조했다.

## 1. 인수 구분 (세 산출은 별개, 수치 합산 없음)

| 출처 | 성격 | 본건과의 관계 |
|---|---|---|
| `project-teams/ENEMY/result.md` | telegraph-cancel-boundary 76 PASS / 10 REPRODUCED, 12라인 candidate 미적용 | **재실행·합산 안 함.** 본건은 그 76검사를 반복하지 않고 TCB-03/04 도달경로만 신규 검사 |
| `claude-provider/ENEMY/result.md` | 읽기전용 호출순서 논증 (TCB-04 합성전용 / TCB-03 도달·협소) | 본 fixture가 그 논증을 **실제 사망탄 원문 실행**으로 재현·확정 |
| `claude-native-6/ENEMY` (본건) | 실제 `hurtE` 사망탄 블록을 돌리는 도달성 fixture | 아래 산출 |

## 2. 실제 소스 근거 (SHA·라인)

- `game.html` SHA256 `30ae8544524d7cd7…`, `game-easy-test.html` SHA256 `9c7c25c131f6175a…`, HEAD `4cd0cb49…`, node `v24.15.0`
- 추출 함수(원문 slice): `_emitEnemyShot`(18920/18017), `_tickEnemyShotWarnings`(18934/18030), `_spawnBossProjectile`(16107/15222), `_projectileParryClass`, `_prepareDarkSphere`, `_fieldEnemyCanShoot`, `_cancelProjCharge`
- `eShootWind` 완료 case 라인 **39180 / 37979**: `if(e.st2<=0){if(e._swFire){e._swFire();e._swFire=null}e._swChargeEl=null;e.s='idle'}`
- `hurtE` 최종 처치 `e.alive=false` 라인 **41235 / 40033**
- 실제 사망탄 블록 라인 etype29 **41350/40148**, etype55 **41370/40168**, etype59 **41384/40182** (세 블록 SHA는 양쪽 HTML 동일: 29 `e32d9317…`, 55 `28fb941d…`, 59 `14c58886…`)
- 핵심 사실(원문 확인): `_emitEnemyShot` 즉시발사 분기 18923/18020 = `e.s==='eShootWind'&&e.st2<=0&&e._swChargeEl===props.el&&!props.blackBean`; 링 병합 `find` 18926/18022은 `owner·frame·world·el·blackBean(·본편 parryClass)`만 비교하고 **`dead` 미비교**; 링 생성 시 `dead:!e.alive`; `_tickEnemyShotWarnings` 취소식 `(!w.dead&&(!e.alive||e.stunned>0||e._frozen>0))` → **dead 링은 상태이상/사망에도 안 취소, 생전 링만 취소**

## 3. 검사 항목 — 입력 / 예상 / 관찰 / 판정

| ID | 입력(실제 원문) | 예상 | 관찰 | 판정 |
|---|---|---|---|---|
| S1 | hurtE 라인 순서 | alive=false(41235/40033) < 사망탄(41350+/40148+) | 참 | **PASS** — 블록 진입시 항상 alive=false |
| S2 | 생전예약 1링(el=I) → alive=false → 실제 etype29 사망탄 8발 | 같은 키로 흡수, dead링 無, 60f 후 0발 | `{livePre:1,ringsAfter:1,anyDeadRing:false,fired:0}` | **REPRODUCED (TCB-03 도달)** |
| S3 | 생전예약 없이 실제 etype29 사망탄만 | dead=true 링 단독, 60f 후 8발 | 59f=0, 60f=8 | **PASS** — 의도 사망탄 보존 |
| S4 | 실제 eShootWind 완료 case, st2=0 | _swFire 실행·소진, _swChargeEl=null, s='idle' | 그대로 | **PASS** (TCB-04 불변식) |
| S5 | 완료 case 통과 → alive=false → 실제 사망탄 | 즉시발사 아님(s≠eShootWind), dead링→60f 8발 | fired=0 후 60f=8 | **PASS** (실제순서 도달불가) |
| S6 | 완료 case 건너뛴 강제 dead+eShootWind+st2=0 | 즉시 1발(60f 우회) | `{fired:1,rings:0}` | **REPRODUCED (합성전용)** |
| C1 | 후보 find.dead + 생전예약 → 사망탄 | 두 링 분리, 사망탄 8발·생전예약 취소 | deadRing=1,liveRing=1, 60f=8 | **PASS** (후보 효과) |
| C2 | 후보 즉시발사 e.alive 가드 | 실제경로 no-op, 합성만 0발 | 실제경로 8발 / 합성 0발 | **PASS** |
| P1 | `_projectileParryClass` | blackBean(EL.P여도)→magic, EL.P→physical, EL.I→magic | 그대로 | **PASS** (Q전용 패링 보존) |
| P2 | 실제 사망탄 수치(rnd=0 blackBean / rnd=0.9 redBean) | blackBean el=P dmg=15 / redBean el=I dmg=12 | 그대로 | **PASS** (수치 불변) |
| P3 | 후보 `_emitEnemyShot` 역치환 | 지정 2라인 외 원문 동일 | 동일 | **PASS** |

## 4. 도달성 판정

- **TCB-03 (생전예약/사망탄 혼합) = REACHABLE(협소).** 실제 사망탄 블록(etype29)을 돌리면, 같은 frame·owner·world·el·blackBean(·parryClass)의 **생전 링(dead=false)**이 있을 때 사망탄이 그 링에 흡수된다(find가 dead 미비교). 흡수된 링은 `!w.dead && !e.alive`로 **생전예약+의도 사망탄이 함께 취소(0발)**. 근접 처치는 적 루프 이전이라 동일frame 선행 생전링이 없어 미발생이고, **투사체/루프후 처치**에서만 성립 → 협소하나 실제 도달. (S2 REPRODUCED)
- **TCB-04 (사망탄 즉시발사 오인) = UNREACHABLE(합성전용).** 즉시발사 조건의 유일 실제 진입은 `s==='eShootWind'&&st2<=0`인데, 완료 case(39180/37979)가 updateE 안에서 `st2<=0` 즉시 `_swFire` 실행 후 `s='idle'·_swChargeEl=null`로 소진한다(S4). 따라서 updateE 밖에서 사망한 소유자는 이 상태로 남을 수 없고(S5), **완료 case를 건너뛴 강제 합성상태에서만** 즉시발사가 발생한다(S6). 기존76의 "사망시 완료 eShootWind 잔류 1발"은 이 합성상태다.

## 5. 현재 12라인 후보 — 필요성·부작용 (본 과제 범위 = TCB-03/04 해당 4라인)

| 후보 라인 | 필요성 | 부작용 | 권고 |
|---|---|---|---|
| **TCB-03** find에 `w.dead===!e.alive` (18926/18022, 파일당 1줄) | **실효.** 도달가능(협소) 결함 복구 — 흡수로 인한 사망버스트 부분유실 방지 | 저위험. dead 분리로 링 1개 추가 가능하나 수치·속성·사망탄 발사 불변(C1/P2 PASS) | **채택 후보(저우선)** |
| **TCB-04** 즉시발사에 `e.alive&&` (18923/18020, 파일당 1줄) | **실게임 필요성 없음.** 실제순서로 도달불가=합성전용, 재현 결함 아님 | 실제경로 no-op, 합성 강제상태만 차단(C2 PASS) | **보류** — 방어적 어서션. "버그수정"으로 기록 금지 |
| 범위 밖 8라인 (`_cancelProjCharge(e,interrupt)`+`_hitStun`/stun/freeze 분기) | TCB-01/02 (telegraph-cancel 영역) | — | 본 reach-path 과제 밖. provider 평가 인용만 (TCB-01 채택후보/중·QA필요, TCB-02 보류/경미) |

## 6. docs 정정표 (총괄 순차 인수 — 본건 편집 0)

`rg '사망탄|_emitEnemyShot|_shotWarnings|eShootWind|즉시발사|_swFire' docs` = 다수 매칭. 아래 3개 문서에 동일 계약표가 있고 모두 정정 필요:

| 문서 / 라인 | 현행 | 정정안 |
|---|---|---|
| `docs/9적ai패턴디자인/9_적AI패턴디자인.md` 314 / `8.0몬스터디자인/몬스터_공격시스템.md` 668 / `탄막시스템_총정리.md` 679 | "owner·world·_gameFrame·el·blackBean 같은 탄만 링1개" | **묶음키에 `dead`(생명상태) 비교가 없음을 명시**: 생전예약과 사망탄이 같은 키면 흡수. 본편은 `parryClass`도 비교(현행 누락). |
| 같은 문서 319 / 673 / 684 "사망탄" 행 | "이미 죽은 소유자는 사망 위치 링60f 후 방출. 원래 효과 유지" | **예외 추가**: 동일frame 생전예약(dead=false)과 키 일치 시 현행 `find`가 함께 취소될 수 있음(투사체/루프후 처치 한정, 근접 처치 미발생). |
| 같은 문서 312 / 666 / 677 "eProjAt/radialProjs" 행 | "eShootWind 완료(st2≤0)…즉시 발사" | **불변식 추가**: 완료 case(39180/37979)가 st2≤0을 즉시 소진하므로 **사망 소유자는 즉시발사 분기 도달불가(TCB-04 합성전용)**. |

## 7. 보존 확인·남은 Gate

- **보존(검사로 확인)**: blackBean = Q전용 magic 패링(P1), 실제 사망탄 수치·blackBean/redBean 분기(P2), 즉시발사·find가 수치·속성 불변(C1/P3). 돌진 커밋(eChargeWind)·보호 2_3·의도 사망탄 발사(S3)는 본 fixture가 건드리지 않음. 티켓 변경 0.
- **변경 누적(읽기전용)**: 시작 43 → 중간 59 (공유 체크아웃 전체, 타팀 병행 포함). 본인 소유 신규 3개(checks.mjs/result.md/evidence.json). 80 미만 → 총괄 checkpoint 불필요. 직접 stage/commit/push 0.
- **소유/제약 준수**: TASK.md 수정 0. 생산 HTML/서버/기존test/에셋/공유docs/타팀 prefix 읽기전용. Git쓰기·rollback·새세션·새subagent·설정변경 0. Node = 지정 경로 사용.
- **다음 Gate (총괄/타팀)**: ① docs 정정 반영은 총괄의 순차 인수 ② TCB-03 find.dead 1줄 생산 적용성·현행 diff 확인(저위험) ③ TCB-04 가드는 생산 미반영 권고 ④ 실제 게임 Gate(QA): etype29/55/59가 투사체로 사망하는 프레임에 동일 키 생전 이동탄을 실제 발사하는 동시성 빈도 — 본 fixture는 **원문 실행 도달성만 확정**, 실전 발생빈도·시각/청취는 미판정.

## 8. 한계 (미실행 명시)

Node VM 소스 추출 — 실제 helper + 실제 완료 case + 실제 hurtE etype29/55/59 사망탄 블록만 실행. alive=false 선행은 소스 라인 순서(S1)로 정적 검증 후 그 사실대로 진입상태 구성. 전체 hurtE·updateE·게임루프·GPU픽셀·FPS·패링 성공동작·시각/청취 인수 미실행. spawnProj/particles/render/geometry는 stub. 기존76검사 반복 0 — 본 fixture는 TCB-03/04 도달경로 전용 신규 검사다.
