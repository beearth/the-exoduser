# QA-load-input-guard-reachability-1454 (결과)

완료ID: RECOVERY-QA-1454. 정확 TASK Read 후 수행. 현재 첫 source tool: `shasum`(SHA 재pin) → `Read(TASK)` → `rg/awk/sed(game.html)`.
`productionApplied=false`. native6단계·화면·청취와 분리, 실행/입력 0. 실제 6단계는 root source4 후보+slot 승인 전 **UNKNOWN 유지**.

## 0. 소스 SHA 정정 (새 읽기 pin, 옛 원자료 불변)
- **현재 game.html SHA256 = `e462f2345682856d24bb416a17aec763281a8dceb02f21af565db189992353ea`** (TASK의 source4 `e462…`와 일치).
- 과거 산출의 `ce171131…` pin은 **stale** → 본 산출부터 위 SHA로 정정. 기존 저장 폴더/원자료는 수정하지 않음(불변).

## 1. 검수 목적
load ticker/idle input의 **실제 whole update + 조기 `G.on`/`paused`/loading 가드**를 원문 추출하여, load 중 **Q 입력 도달성**과 순서를 정상 경로와 대조. (손작성 case 루프/과거 329 사망검사 **미수행**.)

## 2. 원문 추출 — update() 조기 가드 + 순서 (SHA e462)
`update()`는 `loop()`에서 **무조건 호출**(L59998). update() 조기 return 가드:
- L30897 `if(!G.on)return;`
- L30898 `if(window._parryLesson&&window._parryLesson.tick())return;`
- L30899 `if(_EDITOR_MODE){_editorUpdate();return}`
- L30919 `if(G.paused)return;`
- **loading(`_bossLoadPhase`) 조기 가드 = 없음.**

**update() 상단(30895)~idle 입력(31760) 사이 `_bossLoadPhase` 가드 = 0건**(awk grep). 따라서 `G.on && !paused`이면 player-act 상태머신이 실행되고, load 중 ticker가 매 프레임 `P.s='idle'`로 강제하므로 플레이어는 **idle 상태 → `case 'idle'`(L31760) 입력 처리 도달**.

**프레임 내 순서 (핵심):**
1. player-act idle 입력 `case 'idle'`(L31760) → `isAct('parry')`(Q) → **L31812 `P.mp-=10;P.s='sBlock';…P._sbCd=~30`** (MP 선차감).
2. `checkRooms()` **호출 L34342** → 그 안의 phase ticker(L40425) `if(_bossLoadPhase>0){P.s='idle';P.st2=0;…}` → **sBlock을 idle로 wipe**.
→ 31760/31812 (MP 차감)가 34342 (wipe)보다 **먼저** 실행. 즉 load 프레임에서 **MP가 차감된 뒤 상태가 wipe**됨.

## 3. 정상 vs load 대조
| 경로 | Q→sBlock(31812) | checkRooms ticker(34342→40425) | 결과 |
|---|---|---|---|
| **정상(phase 0)** | `P.mp-=10`, `P.s='sBlock'` | `_bossLoadPhase<=0` → **wipe 안 함** | sBlock 유지 → 보호막/패링 획득. **MP 정상 소비** |
| **load(phase>0)** | `P.mp-=10`, `P.s='sBlock'` | `_bossLoadPhase>0` → **`P.s='idle'` 강제 wipe** | 보호막 없이 **10 MP 소비만**(비대칭). `_sbCd`로 ~30f당 1회로 제한 |

- **Q 도달성 판정: load 중 Q→sBlock(MP 선차감)은 source상 도달 가능 (확정).** 이전 "정적 가설/HOLD"를 **source-reachable 확정**으로 정정. 단 **native 미확정**(플레이어가 짧은 load 창에 실제 Q를 눌러야 성립; 실행 0) → 실게임 결함 주장 아님.
- 범위: 동일 `case 'idle'`의 **선차감 전이 전체**에 적용 — sBlock(10 MP, L31812), peaceShield(MP, `_enterPeaceShield`), chainSlash(ST, L31035). **sDraw/kiSlash/bowDraw는 자원 무차감(이전 1428 결론)이라 무영향.**

## 4. 재현 source 최소 후보 (1개 — Q수치/환급/패링설계/2_3 불변)
- **후보(load input-guard):** player-act 입력 처리에 **`if(G._bossLoadPhase>0)` 조기 skip**을 추가해, load 중에는 액션 입력을 **처리하지 않음**(ticker가 이미 `P.s='idle'`를 강제하는 의도와 정합). → 선차감-후-wipe 비대칭 제거(MP/ST 손실 방지), blackBean E-반사 등 load 중 액션 전반도 일관 차단.
- **보존:** Q MP 수치·환급 정책·패링 설계·보호2_3 **변경 0**. 이 후보는 "load 중 입력 비처리"라는 **순서/일관성** 교정이지 수치/환급 변경이 아님. `productionApplied=false`, native 미확정 시 실질 영향은 "플레이어가 load 중 Q를 누를 때만".
- **minimal patch 핀:** `update()` 내 player-act 블록 진입부(idle case 이전) 1줄 가드. 적용 판단은 root/SKILL/2_3 소유.

## 5. 경계 / 인계
- 소스 핀(SHA `e462…`): update 조기가드 L30897/30898/30899/30919, idle case L31760, sBlock 선차감 L31812, checkRooms 호출 L34342, phase ticker L40425, update 호출 L59998.
- **capacity rolling-after-e764-1445: 이번 완료 경계 1 file credit → 본 result.md 1개 저장**(반복당 3산출 상한 유지, 실제 1개). 기존 supervisor-next/QA 폴더 불변. 소진 후 file0 메모리 계속. Changes 80 완료소유 보존 인계/100 전 신규 0.
- Git 조회·쓰기/production/공유docs/타팀산출/사용자 game·save/UI/삭제·이동/새세션·resume/서버/권한·인증 **0**. 보호2_3·Q전용magic·E불가·attack ticket 금지 준수. source 대역 ≠ native6/화면/청취. AskUser/승인은 사용자 소유.
- **docs 전체 rg 동기화 root 인계(쓰기 0):** "load 중 update() player-act에 `_bossLoadPhase` 조기 가드 부재 → idle-input 선차감 전이(sBlock 10MP/peaceShield/chainSlash ST)가 처리-후-wipe로 자원 비대칭" 관측을 `2_3 돌진+패링+방패시스템`(읽기 인계) + `14밸런스+수치테이블`(자원 비용) + `4.1맵디자인+설정/MAP_RUNTIME_ARCHITECTURE.md`(load ticker) 소유로 인계.

## 6. 다음 독립 승인 작업 (self-select)
위 후보의 역확인: load 중 player-act 비차단이 **이동/공격 입력**까지 처리해 load 애니메이션 중 플레이어 위치/상태가 틀어지는지(예: 공격 스윙 1프레임 발동 후 wipe) — CH1 전투 입력의 다른 미완료 접점을 원문 순서로 대조하는 작업을 메모리로 이어가겠습니다(수치/환급/2_3 변경 0, QA load-경계 범위). 통합 대기로 종료하지 않고 계속합니다.
