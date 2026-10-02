# ENEMY (continuous) — burstCounter idx60 쿨다운 실제 source 경로 (2026-10-02)

실제 양판(`game.html`/`game-easy-test.html`)에서 `BOSS_MOVES`·`BOSS_PHASES`·`_bossScore`·`_bossAI`를 원문 추출하여,
**"한 번 선택한 burstCounter의 실제 CD 기록 → 감소 → 같은 조건 CD gate 재검사"** 경로를 실행했다.
결과 **12 PASS + 6 REPRODUCED / 0 FAIL (양판)**. `productionApplied=false`.
**source fixture PASS ≠ runtime/visual/실제 두 번째 공격 PASS** (실게임 `?bosstest` 재현은 QA Gate).

## 1. 인수 구분 (반복·합산 0)

- `new-four/BOSS` §3-A/§4의 **정적 인계 사실만** 인수: `BOSS_MOVES.length=59`, `burstCounter.idx=60`, `cd160`, `idx30/59 결번`, CD 읽기/쓰기는 `mv.idx`이나 감소/페이즈 reset은 배열 위치 `i<length`.
- 이전 BOSS 목록 감사·ENEMY 전조76·사망탄22 검사는 **인수만** 하고 반복/재실행/합산 0. 본건은 burstCounter CD 도달경로 **단일 신규 fixture**다.

## 2. source SHA 시점 (중요 — 현행이 인수시점과 다름)

| 파일 | 본건 읽기시점 SHA | new-four/BOSS 인수시점 | 비고 |
|---|---|---|---|
| game.html | `2e45ee0e…` | `30ae8544…`(HEAD 4cd0cb49/f1401551) | 총괄의 UI 카드수명/minus가드 등 **무관 변경**으로 전진. 되돌리지 않음 |
| game-easy-test.html | `3e5969ca…` | — | 동일 분류 |

burstCounter 구조 라인은 현행에서도 동일하게 존재(정의 9529/8980, 초기화 29938/28758, `_bossScore` gate 36310/35114, 감소 37031/35834, 기록 37083/35886, reset 36913/35716) — **fixture 실행으로 재확인**했다. HEAD는 Git 직접조회 없이 UNKNOWN; 피어 안내 checkpoint SHA `b72f3f06…`는 총괄 로컬 checkpoint로 인수만 하고 독립 원격검증값으로 쓰지 않는다.

## 3. 상태 추적표 — id / idx / 정의수 / CD식 / 추적 / 현행·후보 / 정상 동등성

| 대상 | idx | 첫 CD 기록 (식) | 감소 프레임(sp) | idx값 추적 | CD gate | 재선택 | 판정 |
|---|---|---|---|---|---|---|---|
| **burstCounter (현행)** | 60 | `cd160 × ph.cdM(phase1 .4) = 64` | 300f·sp1 **미감소**(`for i<BOSS_MOVES.length=59`) | `_moveCDs[60]=64` 영구고정 | `_bossScore` **0 영구** | `committed=1` (1회성) | **REACHABLE 결함** |
| slashCombo (정상 대조) | 13 | `cd90 × .4 = 36` | i<59 포함 → 만료 | 0 도달 후 재기록 | 만료 후 통과 | `committed≥2` | 정상 |
| 길이만 61 증설 | 60 | 64 | i<59 유지 → 미감소 | 64 고정 | 0 | `committed=1` | **미해결**(길이 증설만으론 복구 안 됨) |
| 페이즈 reset (의존성) | — | — | reset `i<length` | reset 후에도 `[60]=64` 생존 | — | — | 광폭화에서도 복구 안 됨 (의존성 기록) |
| **후보 (idx 감소)** | 60 | 64 | `for(_m of BOSS_MOVES) _moveCDs[_m.idx]-=sp` → 만료 | 0 도달 | 만료 후 통과 | `committed≥2` | **복구** |
| 후보 정상 동등성 | 13 | — | slashCombo 현행=후보(G) · 음수오버슛/gate 동일(H) | — | — | 동일 | **정상 보존** |

- **첫 CD 기록·음수 처리**: 감소는 `if(_moveCDs[i]>0) -=sp`라 값<sp면 음수로 오버슛 가능(H: 2→-1), gate는 `>0`만 보므로 음수=선택 가능. 현행/후보 동일.
- **합법 조건**: phase 1, 거리 d=mid(burst 75 / slash 50), 무브셋 Set 지정, `Math.random=0.5` — 모두 **SYNTH 경계**(§5). CD 기록·감소·gate 판정은 `_bossAI`/`_bossScore` **원문 실행 결과**이며 `_moveCDs[60]` 직접 가짜대입은 하지 않았다.

## 4. 현행 vs 최소 후보 — 설계 의도 분리

- **현행 결함 귀결**: burstCounter CD는 `_moveCDs[60]`에 기록되지만 감소 루프(`i<59`)·페이즈 reset(동일 범위)이 index 60을 건드리지 않아 **보스 생존 중 최초 1회만 발동, 이후 재선택·콤보후속 영구 불가**. 배정 보스 = si17~20(4장)·si21~25(5장)·si26~31(6장)·si32~34(7장). (idx30/59는 미사용 결번이라 무해, 그 외 모든 무브 idx≤58 정상.)
- **최소 후보**(메모리, 한 곳): 감소 루프를 **실제 정의 idx 기준**(`for(const _m of BOSS_MOVES) if(_moveCDs[_m.idx]>0) _moveCDs[_m.idx]-=sp`)으로. CD 쓰기(`_moveCDs[mv.idx]`)·gate·정의는 불변. 후보 적용 시 burstCounter 재선택 복구(F), slashCombo 등 정상 idx는 현행과 **완전 동등**(G/H). **정의 idx 재번호·무브 추가/삭제는 하지 않는다.**
- **설계 의도 UNKNOWN**: `cd:160`은 반복 재사용 전제 수치로 읽히나, burstCounter가 1회성인지 반복형인지 명시한 설계 문서는 **부재**. `cd160`이 있다는 이유만으로 반복 재선택의 확정 기획을 발명하지 않는다 — 실행 관찰(현행 1회성)과 설계 의도(미상)를 분리해 보고한다.
- **페이즈 reset 동일 범위 문제**는 관련 source 의존성으로 기록(E)하되 **별도 과제로 확대하지 않는다**. 후보가 감소만 고치면 reset은 그대로 idx60 미초기화이므로, 총괄/ENEMY 통합 시 함께 검토 대상.

## 5. SYNTH(합성) 경계 — 실제 경로와 대역 분리

- **원문 실행**: `BOSS_MOVES`/`BOSS_PHASES`/`_bossScore`/`_bossAI`(선택·CD 쓰기·감소·gate 전부).
- **SYNTH(선택 직전)**: 보스 엔티티 e(s='idle'/phase1/bossPatT/\_moveCDs init), 거리 d, `_BOSS_MOVESET[stage]`를 지정 무브 Set으로 좁힘, `Math.random=()=>0.5`.
- **대역(stub)**: `_bossStartPattern`(선택 커밋 계측), `_isDruidFinale`/`_druidFinaleAI`(비드루이드 경로), `BOSS_COMBOS=[]`(콤보 개시는 CD gate와 무관). `e.s`가 stub으로 idle 유지되어 재선택 윈도우는 `bossPatT`/CD gate가 지배(실게임 패턴상태 전이 미실행).

## 6. docs 정정 인계 (총괄 순차 반영 — 본건 공유docs 편집 0)

`rg 'burstCounter|BOSS_MOVES|_moveCDs|cageTrap|쿨다운' docs` 결과 중 CD 도달경로 관련:

| 문서 / 라인 | 현행 | 인계 문안(현행·후보 구분) |
|---|---|---|
| `docs/8.1보스디자인바이블/BOSS_BATTLE_SETTINGS.md` 201 | 4장 무브셋에 burstCounter 해금 표기(결함 無) | **현행 동작 주석**: idx60 CD는 감소루프 `i<length=59`·페이즈 reset 동일범위가 미처리 → 1회 발동 후 `_moveCDs[60]` 양수고정·gate 0 → 재선택 영구불가(si17~34 배정). 수치(cd160·tele20·rec60·range[0,150]·phase[1~4]) 불변. 설계 의도=UNKNOWN. |
| `docs/9적ai패턴디자인/ENEMY_AI_TEAM_MASTER.md` (ENEMY canonical) | per-move CD 계약 미기재 | **신설**: 쓰기/읽기=`mv.idx`, 감소/페이즈reset=배열위치 `i<BOSS_MOVES.length`. idx가 length-1 초과(60>58) 시 감소·reset 누락. 최소 후보=감소를 실제 idx 기준으로(한 곳), reset 동일범위 의존성 병기. |
| `docs/0마스터플랜/EXODUSER_MASTER_BIBLE_v2_2 (2).md` 912 | `| 27 | burstCounter | ❌ |` (구 순차 번호) | ❌표기는 결함과 정합하나 번호(27)가 런타임 idx(60)와 불일치. `new-four/BOSS §3-B "49 원출처 부재"`와 연결, 번호체계 UNKNOWN 기록. |
| `docs/4.0케릭터스프라이트 디자인/캐릭터_몬스터_보스_최적화디자인_v1.md` 79 | "57행, idx60 불연속" | 행수 57→정의 **59** 정정. 불연속 언급 유지 + "감소/reset 범위 밖 → CD 영구잠김" 귀결 추가. |

보호 문서·canonical 설계 라벨(설계 19보스/49무브 등)은 임의로 바꾸지 않는다. 공유 docs 동기화·생산 반영은 총괄 순차 수행.

## 7. 보존·소유·남은 Gate

- **보존**: 정의 idx 재번호·무브 추가/삭제 0, `cageTrap(idx41)` 예약·무력화 불변, 전조/회복/피해/사거리/쿨다운 **수치** 불변, blackBean Q전용 magic 패링·보호 `2_3`·어택티켓 금지 불변. 수치 변경 아님 — 도달경로 분석만.
- **소유/제약**: 쓰기 3파일(`checks.mjs`/`result.md`/`evidence.json`)만. TASK/COMMON·기존 산출·생산·공유docs·기존test 편집 0. Git/삭제/이동/cleanup/서버/UI/빌드/새세션/하위팀 0. 오경로 수정 0. Node = 지정 경로.
- **변경 누적**: 시작 99(capacity99 보류 안내 수신) → 총괄 checkpoint(`b72f3f06…`, 45파일/56path) 후 **43 회복·해제** → 완료 **47**. 80 미만. 본인 Git 미수행, 원격 push 확인은 총괄 진행 중.
- **다음 Gate**: ① 공유 docs 반영은 총괄 순차 인수 ② 후보(감소 idx 기준) 생산 적용성·페이즈 reset 동일범위 동반 검토는 ENEMY/총괄 승인 ③ **실게임 QA**: `?bosstest=17`(또는 si21~34) 근접 유지로 burstCounter 2회 이상 발동(수정 후)·다른 58무브 CD 회귀 무변·양판 동기 — 본 fixture는 **원문 실행 도달성만 확정**, 실전 발생빈도·시각/청취는 미판정.

이 한 건을 보고하며 다음 업무를 스스로 만들지 않는다.
