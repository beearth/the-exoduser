# ANIMVFX — native-partial-walk-queue-fixture 결과 (2026-10-02)

VS Code Claude native-6 ANIMVFX 팀. **"idle 큐 성공 후 walk 큐 실패"를 실제 source 함수 + 최소 주입 fixture로 재현**하고, 전역한도·walk버킷포화·walk미준비·draw실패 4종을 구분했다. 현행 무가드 2D 경로(idle 이중 렌더)와 foot-shadow 미적용 후보 `!_ensGLQueued`(보행 누락 반례)를 모두 하니스로 확인했으며, 큐-시점 사전확인/rollback 최소 후보와 그 한계(C4 미해결)를 남겼다. **11/11 검수 그룹 PASS, exit 0.** 이는 source·논리 fixture 검수이며 실게임·GPU·시각 PASS가 아니다. 발 앵커 UNKNOWN, corpse fade 보류, 에셋 변경 0을 유지한다.

실제 workdir는 `/Users/fordeargamers/Projects/exoduser-migration-20261001`. 소유 신규 파일은 이 폴더의 `checks.mjs`, `result.md`, `evidence.json` 3개뿐이다. 생산 HTML·서버·에셋·공유 docs·기존 test·타팀 prefix·Git 인덱스는 수정하지 않았다. TASK.md(총괄 소유)는 수정 0.

## 0. 인수 구분

- **별도 일회 Claude(claude-provider/ANIMVFX)의 partial-gl-queue-fallback-review 결과 파일은 존재하지 않는다.** 해당 폴더에는 `TASK.md`만 있고 `result.md`/`evidence.json`이 없다. 지시대로 **알려진 source 경계를 직접 Read**해 재현했다. 단, 그 review의 산출은 총괄이 공유 docs `몬스터_스킨_렌더링_파이프라인.md` §69~80(T1~T4)에 이미 통합해 두었으므로 그 논리 표를 참고 대상으로 삼되, 본 과제는 그 실행(executed fixture) 단계다.
- 완료된 `project-teams/ANIMVFX/`(foot-shadow-anchor)의 result/evidence/checks는 **별도 과제**로 구분해 인수만 하고 재실행·합산하지 않았다. 그 D2 후보(`!_ensGLQueued` guard)를 본 과제의 반례 대상으로만 참조했다.
- 메모리(`MEMORY.md`)에 저장된 rollback/사전확인 후보는 없다(index 비어 있음). 후보는 source + 이전 result.md의 D2에서 도출했다.

## 1. 수신·Read·명령·작성·검수·완료 구분

| 단계 | 관측 UTC | 근거 |
|---|---|---|
| TASK/AGENTS/관리문서/SSOT Read | 최초 명령 실행 전 완료 (정확한 첫 Read 시각 미기록) | TASK.md, AGENTS.md, project-teams result/evidence, claude-provider TASK, game.html/game-easy-test.html 원문, docs rg |
| 첫 소유 코드 산출 | checks.mjs 작성 | 생산 반영 없음 |
| 명령 실행(하니스) | `2026-10-02T04:29:35.159Z` 시작 / `…04:29:35.319Z` 종료 (정정 후 재실행도 동일 경로) | 아래 명령 블록. 실제 원문 함수 추출·실행 |
| 검수 | 11/11 PASS, exit 0 | C3 불변조건 정의 정정(에셋 부재 vs 실제 drop) 후 재검수 |
| 산출·완료 인계 | evidence.json `receipts` | 보고서/증거 기록. 런타임 인수·커밋·시각 PASS 아님 |

시작 HEAD `8fd5b7ecf7bb9caebf4a1c2cadb844e0986f8c82`, 검수 전후 동일. Changes: 시작 **61→63**(본 팀 소유 3파일 추가분 포함), 완료값은 evidence 기록. 80/100 임계 미도달. 본 팀 Git 쓰기 0.

## 2. 실제 source 경계·provenance

| 항목 | 값 |
|---|---|
| `game.html` 전체내용 sha256 | `30ae8544524d7cd710383ebd10f4911bea3247e90b18a46c51c253e73ce9ba3f` |
| `game-easy-test.html` 전체내용 sha256 | `9c7c25c131f6175a464cffe2e981e946cf2a0af70ed04b969cc5292403799af8` |
| `_queueEnemy8DirInstanced` 원문 slice sha256 (양쪽 동일) | `95711637ae1a0adca034382c16016bdb2559b6504919bd15da90ee384b5c9b32` |
| git blob SHA (별도) | game.html `81bf3d45…`, game-easy-test.html `4cf9df09…` |

읽은 핵심 행: `_queueEnemy8DirInstanced` game.html **5028–5041**/easy **4683–4696**(동일), `_drawEnemy8DirInstanced` game **5042–5061**/easy **4697~**, `_prepEnemyInstanced` game **5152–5200**/easy **4807~**, 2D 일반 적 본체 game **51954–51990**/easy **50441–50476**, 용량 상수 game **4935·4940·4941**/easy **4590·4595·4596**. 현행 SHA 재검증은 총괄 단계.

**용량 상수(실측):** `_ENS_GL_MAX=512`(버킷별), `_ENS8_GL_MAX=_ENS_GL_MAX*2=1024`(전역), `_ENS8_GL_GROUPS=16`(idle 0–7 + walk 8–15), `_ENS_GL_STRIDE=9`.

**원문 계약 확인(결함의 핵심):**
- `_prepEnemyInstanced` 5187: idle 큐는 `if(...)` 조건에 들어가 성공 시 블록 진입.
- 5189–5192: walk 큐는 `e._isMoving && _a8.walkDirs && _wm._idxSet.has(_mIdx) && _mW.ready`일 때만 호출되며, **그 반환값을 저장/확인하지 않는다.**
- 5193: `e._ensGLMode=1`을 **idle 성공만으로 무조건** 설정한다.
- 2D 일반 적 본체(game 51969 `if(_a8){`)에는 **`!_ensGLQueued` 가드가 없다.** 반면 그림자(51826)·텔레그래프(51839)·돌진예고(51845)·피격플래시(51999)는 `!_ensGLQueued`로 가드된다 → 본체만 가드 누락 = 현행 idle 이중 렌더(이전 D2 재현).

## 3. 재현: idle 성공 + walk 실패 4종 (입력/예상/관찰)

e=(340,420), r=20, col=1,row=3, cell=256, baseSz=140, idleBucket=0(south), walkBucket=8, walkDist=200(frame=1), VW/VH=1280/800, cam=(100,200). idle img 2048×1280, walk img 8192×1280.

| ID / 한글명 | 조건(입력) | 현재 분기 | 관찰(idleOK/walk) | 판정 |
|---|---|---|---|---|
| **C1 / 전역한도 잔여1** | `_ens8GLTotal=_ENS8_GL_MAX-1`(1023) | queue 5029 전역 `_ens8GLTotal>=_ENS8_GL_MAX` | idleOK=true(→1024), walk 호출됨·반환 false | PASS 재현 |
| **C2 / walk 버킷 포화** | `_ens8GLCounts[8]=_ENS_GL_MAX`(512) | queue 5030 버킷별 `_cnt>=_ENS_GL_MAX` | idleOK=true, walk 호출됨·반환 false | PASS 재현(단, 도달성 §5) |
| **C3 / walk 미준비** | `_mW.ready`/`_idxSet`/`_isMoving` 미충족 | prep 5189 조건 불충족 → walk 큐 **미호출** | idleOK=true, walk 미호출 | PASS 재현 |
| **C4 / draw 텍스처 실패** | idle+walk 큐 성공, draw 시 walk 버킷 `_getTex=null` | draw 5053 `if(!_tex)continue` | idleOK=true, walkOK=true, **walkGL=0** | PASS 재현 |

양쪽 HTML(game/easy) 모두 동일 결과. 재현 그룹 `REPRO-C1~C4` 전부 PASS.

## 4. 불변조건 검수 — 이중 렌더 vs 보행 누락

불변조건: 같은 개체의 idle·walk 몸체가 **GL+2D 합산 정확히 1회**이고, **walk 에셋이 준비됐는데 합산 0이면 안 된다**(=보행 누락). walk 에셋 자체가 없는 C3의 walk 부재는 정당(위반 아님)으로 구분했다.

| 정책 | C1 | C2 | C3 | C4 |
|---|---|---|---|---|
| **현행(무가드)** | idle 이중(2)·walk 1 | idle 이중·walk 1 | idle 이중·walk 0(정당) | idle 이중·walk 1 |
| **guard `!_ensGLQueued`(foot-shadow 미적용)** | 이중0·**walk 누락** | 이중0·**walk 누락** | 클린(정당 부재) | 이중0·**walk 누락** |
| **precheck(큐시점 사전확인)** | 클린(전량 2D) | 클린(전량 2D) | 클린 | **walk 누락(미해결)** |
| **rollback(idle 큐 취소)** | 클린(전량 2D) | 클린(전량 2D) | 클린 | **walk 누락(미해결)** |

- **현행**: 모든 케이스에서 idle이 GL+2D로 이중 렌더(이전 D2). walk는 2D가 담당하므로 실제 누락은 없다. 즉 현행의 결함은 "보행 누락"이 아니라 "본체 이중 렌더"다.
- **guard 단독 적용의 반례(ANIM57이 놓친 것)**: idle만 GL 큐된 상태에서 2D를 전량 생략하면 C1/C2/C4에서 **보행 몸체가 통째로 사라진다.** 이전 57그룹은 capacity=0(큐 전부 성공 또는 전부 실패)만 검사해 이 부분 큐 상태를 재현하지 못했다.
- **precheck/rollback**: C1/C2(큐-시점에 walk 실패를 감지)와 C3(에셋 부재)은 불변조건 충족. 그러나 **C4는 walk 큐가 성공**하므로 큐-시점 후보가 감지하지 못해 guard와 동일하게 보행이 누락된다 → **draw-시점 처리가 별도로 필요**함.

검수 그룹 `INV-current-double-render`, `INV-guard-dropsWalk-C1C2C4`, `INV-guard-clean-C3`, `INV-precheck-rollback-clean-C1C2C3`, `INV-precheck-rollback-C4-unresolved` 전부 PASS.

## 5. 도달성(자연 발생 가능성) — 합성 상태와 구분

- **C1(전역 잔여1): 자연 도달 가능.** prep는 개체마다 idle(+조건부 walk)을 큐한다. idle만 큐되는 개체(비이동/‑walk미사용)가 섞이면 `_ens8GLTotal`이 홀수(예: 1023)가 될 수 있고, 다음 이동 개체의 idle이 마지막 슬롯(1024)을 차지한 뒤 그 개체의 walk가 전역한도로 거절된다. 혼합 군집·1024 근접에서 실제 발생 가능.
- **C2(walk 버킷 포화): 자연 도달성 미입증(합성).** 같은 방향에서 prep는 idle→walk 순으로 큐하므로 방향별 **walk count ≤ idle count**다. walk 버킷(8+d)이 512에 도달하려면 idle 버킷(d)도 512여야 하고, 그 시점 다음 개체의 **idle이 먼저 거절**되어 애초에 walk 단계로 가지 않는다. 본 하니스는 `_ens8GLCounts[8]=512`를 강제 주입해 분기만 확인한 것이며, 자연 발생은 입증되지 않았다(docs T2와 일치).
- **C3**: walk 미준비 몬스터/정지 상태의 기존 정상 경로. GL·2D 모두 기존 `_mW.ready` 게이트를 적용하므로 idle만 출력하는 것이 설계대로다.
- **C4**: 텍스처 수명/GPU 업로드 실패 의존. 실제 GPU 미검수.

## 6. 미적용 최소 후보 (생산 반영 0, 미검수)

세 후보 모두 **미적용**이며 memory 원문·source에만 적용해 비교했다. patch는 만들지 않았다(소유 파일 3개 제한, 하니스 내 모델링).

1. **후보 A — precheck(사전확인)**: prep에서 walk가 필수(이동+에셋준비)인데 walk 큐가 거절되면 이 개체는 GL 경로를 포기(=idle 큐 롤백 + `_ensGLMode` 미설정)해 전량 2D로 처리. C1/C2 해결, 이중 렌더 없음.
2. **후보 B — rollback(동일객체 롤백)**: idle 큐 후 walk 큐가 실패하면 직전 idle 인스턴스를 `_ens8GLCounts`/`_ens8GLTotal`에서 되돌리고 `_ensGLMode=0`. C1/C2 결과는 A와 동일.
3. **후보 C — 2D body 가드 `!_ensGLQueued`(foot-shadow D2)**: 이중 렌더는 없애지만 **A/B 없이 단독 적용하면 C1/C2/C4에서 보행 누락**. 따라서 C는 A 또는 B와 **함께** 적용해야 하며, 그래도 **C4(draw 실패)는 draw-시점 폴백이 추가로 필요**하다.

→ 결론: "이중 렌더 제거(C)"와 "부분 walk 실패 시 보행 보존(A/B)"는 **함께** 가야 하고, C4는 둘 다로도 안 되므로 별도 draw-시점 처리가 남는다. 어느 것도 본 과제에서 생산 반영하지 않았다.

## 7. 공유 docs 정정·보충 제안 (총괄 순차 인수)

공유 docs는 읽기 전용이므로 아래 문안만 제안한다. 보호 문서 `2_3`은 수정 0.

| 문서·위치 | 제안 | 상태 구분 |
|---|---|---|
| `docs/8.0몬스터디자인/몬스터_스킨_렌더링_파이프라인.md` §69~80(T1~T4) | 각 행에 **"실행 인수 완료(claude-native-6/ANIMVFX)"** 표기로 갱신. T1(C1)=자연 도달 가능, **T2(C2)=합성 강제·자연 도달성 미입증 유지**, T3(C3)=에셋 부재 정당, T4(C4)=큐시점 후보 미해결·draw폴백 필요를 명시 | 생산 미적용. 근거는 `claude-native-6/ANIMVFX/{result.md,evidence.json}` |
| 같은 문서 §80 참조 경로 | 현재 `claude-provider/ANIMVFX/result.md·evidence.json`을 가리키나 **그 파일들은 미생성**이다. 참조를 **`claude-native-6/ANIMVFX/`의 실행 결과**로 정정하고, provider는 TASK만 존재함을 명시 | 사실 정정 |
| 같은 문서 line 69 실패 폴백 | "현행 코드는 walk 반환값을 받지 않고 `_ensGLMode=1` 설정" 서술이 정확함을 **source 실행으로 확인**. 추가로 **2D 본체 가드 누락(그림자·플래시는 가드, 본체만 무가드)**과 그로 인한 현행 idle 이중 렌더를 한 줄 보강 | 서술 보강 |
| `docs/5.0애니메이션파이프라인/몬스터_스킨_시스템.md` §일반 렌더 | 부분 walk 실패 4종과 불변조건(이중/누락) 표를 참조 링크로 추가. packed 40/39·8×5·256·4f 값은 유지 | 수치 변경 0 |
| `docs/5.1임펙트디자인/ANIMATION_VFX_TEAM_MASTER.md` 백로그 말미 | **"partial-walk-queue-fixture: native 실행/11그룹 PASS, idle성공+walk실패 4종 재현, guard 단독 반례(보행 누락)·precheck/rollback 후보·C4 미해결 기록, 미적용. 근거 claude-native-6/ANIMVFX"** 추가 | foot-shadow 과제와 분리 |

docs rg(관련 20+ 문서) 완료, 발견 모순은 위 표에 반영. 공유 docs가 이미 동기화됐다고 주장하지 않으며 반영은 총괄 단계다.

## 8. PASS/FAIL/UNKNOWN 및 남은 Gate

- **PASS(source·fixture)**: 11/11 그룹. C1~C4 재현, 현행 이중 렌더/guard 반례/precheck·rollback 한계 모두 모델 확인.
- **UNKNOWN**: 발 앵커(런타임 JSON에 foot/pivot 필드 없음, 이전 과제와 동일) — 추정하지 않음.
- **미검수(Gate 별도)**: 실제 GPU 큐/드로우, 1024 근접 실측, 텍스처 업로드 실패(C4) 실제 발생, 줌/흔들림 합성, 시각 A/B.
- **다음 Gate(총괄·QA)**: ①후보 C는 반드시 A/B와 함께 검토, ②C4용 draw-시점 폴백 설계, ③C2 자연 도달성 실측(미입증이면 합성으로 유지), ④정규 GL 부팅에서 실게임 검수, ⑤code+docs 통합·원격 SHA 대조·커밋은 총괄.

corpse fade 보류, 에셋 변경 0, 새 애니메이션/빌드/서버/세션/subagent 0, Git 쓰기 0을 유지한다. 실게임·시각 PASS를 주장하지 않는다.

## 재실행 명령

```sh
cd /Users/fordeargamers/Projects/exoduser-migration-20261001
/Users/fordeargamers/.local/node-runtime/node-v24.15.0-darwin-arm64/bin/node \
  tools/team-followup-20261002/claude-native-6/ANIMVFX/checks.mjs
```

하니스는 JSON을 stdout으로 출력하고 파일을 추가하지 않는다. 적 상태·에셋 준비·텍스처·GL API·시간은 fixture이며 셰이더는 실행하지 않는다. 생산 반영 전 새 HEAD/원문 SHA에서 재검수해야 한다.
