# ENEMY 수정 피드백 — phase reset 근거 범위 정정 (2026-10-02)

직전 산출(`ENEMY-phase-reset-cd60-0635`)의 result/evidence/checks와 **현행 원문을 읽기만** 하여 근거 범위를 정정한다.
**Node/검사/fixture 재실행 0, 새 checks.mjs 0**, 기존 3파일 보존. 새 소유 폴더에 `result.md`/`evidence.json` 2파일만 작성.
반복형/1회성 설계는 **UNKNOWN**, `productionApplied=false` 유지. 공유docs/canonical 편집·최종 통합·Git는 root 소유.

## 1. 정정 — 직전 추적표의 '충격파 hurtP 발생'은 틀림 (C1)

- 원문 충격파 게이트: `game.html:36973 / game-easy-test.html:35778` = `dst(P.x,P.y,e.x,e.y)<_waveR && P.iframes<=0 && P.s!=='charge'`.
- fixture harness는 `P.iframes=1`로 설정 → `1<=0` 거짓 → **`hurtP` 호출 0**. 직전 result.md §3 P2 '부수호출 = 빨간콩 spawn·**충격파 hurtP 발생**' 중 hurtP 부분은 **거짓**.
- `_spawnBossProjectile`는 phase1→2(`_bp=2`)에서 `_bCnt=8+_bp*4=16`회 호출(`36980/35785`) — **정적 계산/코드 대조값**이며, stub 기록 횟수일 뿐 **실제 탄 실체·피해·parry·teleport 좌표·실제 충돌 PASS가 아니다.**
- 정정 문구: "P2/P4 전환에서 fixture hurtP=0(iframes=1 게이트). 빨간콩 _spawnBossProjectile 호출=16(정적), 실제 피해/탄 실체와 구분."

## 2. 정정 — P5 '그 외 전부 동일'의 관측 범위 한정 (C2)

P5가 **실제 비교한 필드·카운터**(snap + 추가):

> `phase, hp, cd60(차이), cd13, reviveIframes, s, atk, stunned, bossPatT, spawnProj(stub 호출수), hurtP(=0), speed, maxPoise, bossPatCd`

**미비교(동등 보증 아님)**:

> projectile 인자/el 종류·순서 · VFX/SFX 파라미터·호출 순서 · RNG 소비 횟수 · `P.kb`(넉백 벡터) · P/G 전체 필드 · 엔티티 전체 필드(`x,y,r,el,_combatSt,_comboSeq,_comboIdx,_meleeStreak,_dbgScores,_feinting,_delaying` 등) · 텔레포트 좌표·이펙트 상태

→ "**CD60만 차이, 그 외 동일**"은 위 **비교한 필드 범위로 한정**한다. 미비교 항목에 대한 전면 동등은 입증하지 않았다.

## 3. 정정 — P3/P6 범위 (C3)

- **P3(전환없음, HP .70)**: 현행 `_bossPhaseCheck`만 실행한 증거다. '후보 vs 비전환 양쪽 비교'가 **아니다**(후보는 P4/P5에서만 실행).
- **P6**: `e.s==='recover'` 확인 + `_bossScore` 직접 gate 호출 결과다. **실제 recover→idle 복귀·후속 `_bossAI` 재선택·실제 패턴 실행은 미실행.** 전환 직후 선택불가의 두 독립 조건(패턴상태 s=recover / CD gate)을 분리 보고한 것이며, 실제 전투 루프에서의 재선택 재현은 아니다.
- 반복형/1회성 UNKNOWN, `productionApplied=false` 유지.

## 4. 정정 — 현행 실제 행 / idx 정적표 (C4)

| 구성요소 | 현행 실제 행 (game / easy) | 비고 |
|---|---|---|
| `_bossAI` 선언 | 37059 / 35864 | — |
| per-move CD **감소**문 (`_bossAI` 내) | **37063 / 35868** | continuous result/final의 **37031/35834는 역사값**(현행 아님). `for i<BOSS_MOVES.length` |
| `_bossPhaseCheck` 선언 | 36922 / 35727 | — |
| per-move CD **reset**문 (`_bossPhaseCheck` 내) | **36945 / 35750** | `for i<BOSS_MOVES.length` |
| 충격파 hurtP 게이트 | 36973 / 35778 | `P.iframes<=0` |
| 빨간콩 수 `_bCnt` | 36980 / 35785 | `8+_bp*4` |

**BOSS_MOVES idx 정적표** (정의 59개, 단순 0..58 아님):

| 항목 | 값 |
|---|---|
| idx 순열 | `0..29, 31..58, 60` |
| 공백(결번) | **30, 59** |
| idx60 `burstCounter` | reset(`i<length=59`) **제외**(미초기화) / `_bossScore` 허용 **O**(무브셋 포함 시) |
| idx41 `cageTrap` | reset **포함**(정상 초기화) / `_bossScore` 허용 **X** (`36339: if(mv.id==='cageTrap')return-1`, 모든 보스 금지) |

→ **reset 범위(`i<length`)와 score 허용 기준은 서로 다르다**: idx41은 reset O·score X, idx60은 reset X·score O. idx 재번호·설계라벨·수치 변경 0.

## 5. source SHA 시점 정정 / 시각 정정 (C5)

| 구분 | 값 |
|---|---|
| 직전 fixture 실행 읽기 full SHA (**보존**) | game `7d579cd6…` / easy `1099267636…` |
| 이번 정정 읽기 full SHA | game `06880824…90ba8bc3` / easy `482ec94f…6649bd27` |
| root 06:10 push 보고값 | `b72f3f06…` (독립 현재HEAD·원격검증값으로 **미사용**) |

root 사운드 통합으로 전체 SHA 전진 → 과거 실행 SHA는 pin 보존, 읽기시각/현재 fragment 행을 구분(§4). Git 직접조회 0.

- **실행 시각 정정**: 직전 fixture 실행 UTC `06:41:58.909Z` = **KST `15:41:58.909+09:00`**. 직전 evidence의 `15:42:30 (approx)`는 **별도 작성 추정값이지 실행 시각이 아님**. 이번 정정 읽기 시각 = `06:57:13Z / 15:57:13 KST`. 실제 TASK Read·최종 end_turn은 감독이 독립 확인.

## 6. docs 인계 (현행·후보·UNKNOWN — root 순차 반영, 본건 편집 0)

`rg '_moveCDs|per-move CD|페이즈 전환…리셋|쿨다운…리셋|burstCounter…cd|cageTrap…reset'` → `BOSS_BATTLE_SETTINGS.md`·`ENEMY_AI_TEAM_MASTER.md`에 **per-move CD/`_moveCDs` 매칭 0** (계약 미기재 = 공백).

| 문서 / 위치 | 현행 | 후보/인계 문안 | UNKNOWN |
|---|---|---|---|
| `docs/8.1보스디자인바이블/BOSS_BATTLE_SETTINGS.md` §5 "전환 시 처리 순서" 4번(162행) | `상태 초기화 — stunned=0, s='recover', 콤보/딜레이 리셋` (per-move CD reset 미기재) | 보강: `… + per-move CD reset '_moveCDs[i]=0' for i<BOSS_MOVES.length(=59)`. 현행 idx60(burstCounter) 범위 밖→전환서도 미초기화. 후보: reset을 정의 idx 기준으로. 전환조건·HP회복·스탯·텔레포트/충격파/탄막/연출 수치 불변 | 1회성/반복형 의도 |
| `docs/9적ai패턴디자인/ENEMY_AI_TEAM_MASTER.md` (ENEMY canonical) | per-move CD 감소/reset 범위 미기재 | 신설: 감소(`_bossAI` 37063/35868)·reset(`_bossPhaseCheck` 36945/35750) 모두 `i<BOSS_MOVES.length`라 idx>length-1(idx60) 누락. **완전 복구는 두 곳 모두 정의 idx 기준**(감소=continuous, reset=본건 — 두 계약 후보 범위이며 실게임 완전성·모든 무브 동등 보증 아님) | 동일 |
| 같은 §5 피날레 예외(3행) | 드루이드 피날레 분기 | reset문(36945)은 `_isDruidFinale` 분기 **이전** 실행 → 피날레에서도 idx60 동일 미초기화(본 fixture 비드루이드 경로만=경계) | — |
| idx 정적표(§4) 참고 문서 | — | idx41 cageTrap reset O/score X, idx60 reset X/score O를 canonical에 표로 명기 제안 | — |

보호 문서·canonical 설계 라벨은 임의 변경 0.

## 7. 소유·누적·인계

- 쓰기 2파일(`result.md`/`evidence.json`)만. 직전 3파일(`checks.mjs`/`result.md`/`evidence.json`)·TASK **수정 0**, 재실행 0. production·공유docs·기존test·Git·삭제/이동/cleanup·UI/서버/빌드·미디어·새세션/하위팀·외부메시지 0. CH1-1 사망 복귀는 root 단독(중복 조사 0). 맵 QA 범위 밖. 보호 2_3·Q전용 blackBean magic 패링·어택티켓 금지·캐릭터 LOCK 불변.
- 변경 누적(읽기전용 관찰): 67 (전역 -uall, 타팀 병행 포함). 자신의 2파일로 80/100 판단 안 함. 80 미만. 본인 Git 미수행.
- 감독이 기존 세션 JSONL end_turn·소유 파일을 직접 열람하므로 SendMessage/주소추정 하지 않는다. 이 정정 한 건만 보고하고 추가 업무를 자율 생성하지 않는다.
