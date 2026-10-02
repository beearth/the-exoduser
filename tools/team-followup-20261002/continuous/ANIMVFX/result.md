# ANIMVFX (continuous) — 실제 queue+draw 결합 부분실패 rollback 검증 (2026-10-02)

VS Code Claude native 연속 후속 한 건. **현재 양판(game.html / game-easy-test.html)의 실제 `_queueEnemy8DirInstanced` + `_drawEnemy8DirInstanced` source를 함께 실행**하여, 전역 용량 잔여1에서 마지막 이동 개체의 idle 큐 성공 → walk 거절 뒤 **잔류 큐와 실제 draw 출력**을 검증했다. 이전 harness가 `ensGLMode=0`/`rolledBack=true` 플래그만 바꾸고 count/total/CPU buffer를 되돌리지 않았으며 `mode0?draw0` 집계로 통과를 강제한 한계를 **실제 draw로 교정**했다. **18/18 그룹 PASS, exit 0.** `productionApplied=false`, **source fixture PASS ≠ GPU/runtime/visual PASS**.

- 실제 cwd/realpath: `/Users/fordeargamers/Projects/exoduser-migration-20261001`
- 소유 쓰기: 이 폴더의 `checks.mjs`·`result.md`·`evidence.json` 3개뿐. TASK/COMMON·이전 산출·생산·공유docs·기존test·저장·Git 인덱스 수정 0.
- **Git 호출 0** (COMMON 계약). HEAD는 총괄 제공 commit `7e69495046323b3120578f67635c20feb48b2a4f`(카드 수명·NW.js 실패 응답)을 **인수**하며 본 세션이 독립 관측한 현행 HEAD로 표시하지 않는다. 그 외 현행 HEAD는 UNKNOWN.

## 0. 인수·메모리·대역 구분

- `claude-native-6/ANIMVFX/{result,evidence,checks}` 및 provider/foot-shadow 산출은 **읽기 인수만** 했고 기존 57/모델 11그룹을 재실행·합산하지 않았다. 그 산출은 수정하지 않는다.
- **이전 harness 한계(교정 대상)**: 그 checks의 rollback 분기는 `ensGLMode=0,rolledBack=true` 표시만 바꾸고 **실제 idle 큐의 count/total/CPU buffer를 되돌리지 않았다.** 또한 mode0이면 GL 출력을 0으로 가정했으나, **실제 `_drawEnemy8DirInstanced`는 개체 mode를 보지 않고 버킷 count를 그린다.** 따라서 그 GREEN은 구현된 rollback 검증이 아니었다. 이번엔 실제 두 함수를 함께 실행해 바로잡았다.
- **메모리 원문**: `MEMORY.md` 인덱스가 비어 있어 저장된 rollback/사전확인 후보가 없다. 후보는 source + 이전 result의 서술에서 도출해 **실제 상태/draw로** 검증했다.
- **대역(band) 경계**: `GL`은 호출과 `bufferSubData` 전송 구간·`drawArraysInstanced` 인스턴스 수를 기록만 하는 작은 대역. `_getTex`는 ready/fail만 명시하는 대역. `_flush`는 noop. 2D body gate는 source를 읽어 모델링(실행은 GL측만 실제)이며 `mode0?draw0` 같은 집계 모형으로 통과를 강제하지 않았다.

## 1. 실제 source 경계·SHA (현재 Read 시점)

| 항목 | game.html | game-easy-test.html |
|---|---|---|
| 파일 전체내용 sha256 | `2e45ee0e9ad909b378bf1a7b864818ce442a4c3e17b12360b42e363dc7d0bd94` | `3e5969ca139497c2efb312dc720ab53eb42a8d1912c8288caa2ce858cfd5120a` |
| `_queueEnemy8DirInstanced` slice sha256 | `95711637…`(양쪽 동일) | 동일 |
| `_drawEnemy8DirInstanced` slice sha256 | 양쪽 동일(검수 `EX-queue-draw-slice-identical` PASS) | 동일 |

- 읽은 핵심 행: 상수 `game 4935·4940·4941`, queue `5028–5041`, draw `5042–5061`, prep idle→walk `5152–5200`(5187 idle 조건·5189–5192 walk 반환 무시·5193 `_ensGLMode=1`), 2D 일반 적 body `51954–51990`(현행 `if(_a8){…}` — `!_ensGLQueued` 가드 없음).
- **상수(실측)**: `_ENS_GL_MAX=512`(버킷별), `_ENS8_GL_MAX=1024`(전역), `_ENS8_GL_GROUPS=16`(idle 0–7 / walk 8–15), `_ENS_GL_STRIDE=9`.
- **source SHA 시점 구분**: 직전 claude-native-6 실행 시 game.html 내용 sha는 `30ae8544…`였고 지금은 `2e45ee0e…`다(총괄의 카드수명/UI minus-수명 가드 순차 통합분). 단 instancing 세 함수의 행·slice SHA는 동일(불변). 타인 변경은 되돌리지 않았다.

## 2. 핵심 경계 재현 — 전역 잔여1, idle 성공 / walk 거절 (실제 queue+draw)

prefill을 **실제 queue 호출**로 생성해 count 합계==total을 일관 유지하고, sentinel(x 인자=`_ens8GLCpu[_o]` 저장값)로 기존 큐와 이번 개체를 구분했다. bucket0=3(유효 prefix x=1000·1001·1002), bucket1=511, bucket2=509 → total **1023**(잔여1). 이번 개체 idle sentinel `9999`, walk `8888`.

| 정책 | 큐 전 | idle 큐 | walk 큐 | 큐 후 total/countSum/b0/b8 | 실제 draw(버퍼·instanced) | 잔류 idle 출력 | prefix 보존 | idle/walk 합산 |
|---|---|---|---|---|---|---|---|---|
| **현행(무후보)** | total 1023, b0 3 | 성공→b0 4, total 1024 | **거절(전역한도)** | 1024/1024/4/0 | bucket0 instanced **4**, 총 1024 전송, sentinel에 **9999 포함** | **예(잔류)** | 예 | **idle 2(이중)**, walk 1 |
| **rollback(실제 복원)** | 1023, 3 | 성공→4,1024 | 거절 | `_ens8GLCounts[0]--`·`_ens8GLTotal--` → **1023/1023/3** | bucket0 instanced **3**, sentinel에 **9999 없음**, 1000·1001·1002 출력 | **아니오** | 예(버퍼 prefix `[1000,1001,1002]` 유지, b1 511·b2 509 그대로 출력) | **idle 1**, walk 1 |
| **precheck(큐 전 확인)** | 1023, 3 | `remain(1)>=2` 거짓 → **미큐** | 미큐 | **1023/1023/3** | bucket0 instanced 3, **9999 없음** | 아니오 | 예 | idle 1, walk 1 |

- **현행**: idle 성공만으로 `_ensGLMode=1`을 설정하고(원문 5193) walk 반환을 받지 않으므로(5189–5192), 거절된 walk의 count/total 잔류가 아니라 **성공한 idle의 잔류**가 핵심이다. 실제 `_drawEnemy8DirInstanced`는 버킷 count(4)를 그려 **잔류 idle을 출력**한다. 2D body는 현행 무가드라 idle+walk를 또 그려 **idle 이중**이 된다(walk는 2D가 담당).
- **rollback / precheck**: **실제 count/total/CPU buffer**를 되돌리거나 애초에 쓰지 않으므로 실제 draw가 잔류 idle을 그리지 않고 유효 prefix와 타 버킷을 보존한다. 이 개체만 2D로 넘어가 **idle/walk 각 1회**가 된다. 이는 플래그 표시가 아니라 **실제 draw 호출/전송버퍼/카운트로** 검증했다. 최소 rollback이 안전한 이유: 잔여1 경계에서 전역 포화 직후 모든 후속 큐가 전역 체크(5029)로 거절되므로 **이 개체의 idle이 해당 버킷의 마지막 append**다. 비말단 인스턴스 rollback은 버퍼 컴팩션이 필요하며 이 경계 밖이다.

## 3. walk 텍스처 실패 경계 (실제 draw + 실패 대역) — 별도 필수

| 조건 | 큐 | 실제 draw(`_getTex` 대역) | 결과 |
|---|---|---|---|
| idle+walk 큐 성공, draw 시 walk 텍스처 실패 | b0=1, b8=1(둘 다 큐됨) | `_getTex('idle')→ok`, `_getTex('walk')→null` → walk 버킷 `continue`(instanced 1건=idle만) | **walk GL 미출력** |

- walk 큐가 **성공**하므로 큐시점 rollback/precheck가 트리거되지 않아 이 draw-시점 실패를 **해결하지 못한다** → **FAIL/UNKNOWN 유지**. draw-시점 폴백이 별도로 필요하다. 지시대로 body `!_ensGLQueued` 가드 단독 채택은 제안하지 않는다(단독 적용 시 보행 누락은 이전 산출에서 이미 확인).

## 4. 정상 성공 경로 보존

용량 여유(prefill total 10)에서 idle+walk 둘 다 성공(b0 5→6, b8 0→1, total→12). 후보(rollback/precheck)는 walk가 성공하므로 롤백/미큐가 트리거되지 않아 **baseline과 완전 동일**(total 12, b0 6, b8 1, countSum 12, 실제 draw 출력 12). → 후보가 정상 경로를 바꾸지 않음(동등성) 확인.

## 5. 현행 실패·후보·미해결 경계 요약

| ID | 경계 | 현행 | 후보 결과 | 미해결 |
|---|---|---|---|---|
| A | 전역 잔여1 idle성공/walk거절 | 잔류 idle 실제 draw 출력 + 2D 중복(idle 이중) | rollback·precheck: 실제 복원→이 개체 2D 1회, prefix·타버킷 보존 | — |
| B | 큐 성공 뒤 walk 텍스처 실패 | walk 버킷 draw skip(walk 미출력) | 큐시점 후보 **미해결** | **draw-시점 폴백 필요(FAIL/UNKNOWN)** |
| C | 정상(용량 여유) | idle+walk 정상 큐·draw | 후보 적용 전후 동일 | — |

자연 walk 버킷만 포화되는 합성 상태, 에셋 부재의 정당한 walk0, 실제 GPU upload/픽셀은 구분하며 이번 범위에 넣지 않았다. 새 4종 모델표·대규모 군집 시각 검수로 범위를 늘리지 않았다. body `!_ensGLQueued` 가드 단독 제안 없음.

## 6. 공유 docs 정정·인계 문안 (총괄 순차 반영)

공유 docs 읽기 전용. rg(`_queueEnemy8DirInstanced|_drawEnemy8DirInstanced|_ensGLMode|rollback|부분 성공|walk`) 완료. 정확 문안은 `evidence.json`의 `docsCorrections`에 기록. 요지:

| 문서 | 정정 요지 |
|---|---|
| `docs/8.0몬스터디자인/몬스터_스킨_렌더링_파이프라인.md` §75~80 | T1 실행 인수 완료(실제 queue+draw로 잔류 draw 출력 확인, 플래그-only는 rollback 아님, 실제 count/total 복원 rollback·precheck 검증). T4는 큐시점 미해결. §80 참조경로를 미존재 `claude-provider/…`에서 **`continuous/ANIMVFX/`** 실행 결과로 정정 |
| `docs/5.0애니메이션파이프라인/몬스터_스킨_시스템.md` §일반 렌더 | 부분 walk 실패 GL 잔류·실제 draw·최소 rollback/precheck·walk-텍스처-실패 미해결 참조 추가(수치 변경 0) |
| `docs/5.1임펙트디자인/ANIMATION_VFX_TEAM_MASTER.md` 백로그 | continuous 18그룹 PASS·플래그 rollback 허위 GREEN 교정·실복원 rollback/precheck·walk-텍스처-실패 미해결·미적용 기록 |

## 7. PASS/FAIL/UNKNOWN·남은 의존성

- **PASS(source·fixture, 18/18)**: 실제 queue+draw 결합. A(잔류 draw·실복원 rollback·precheck), B(walk 텍스처 실패 draw skip), C(정상 경로 동등).
- **FAIL/UNKNOWN**: B의 draw-시점 walk 텍스처 실패는 큐시점 후보로 미해결. 발 앵커 UNKNOWN(런타임 JSON에 pivot/foot 필드 없음).
- **미검수(별도 Gate)**: 실제 GL 부트/업로드/픽셀, 1024 근접 실측 도달, 줌/흔들림 합성, 시각.
- **남은 의존성(총괄)**: ①code+docs 통합·원격 SHA 대조·커밋은 총괄, ②B용 draw-시점 폴백 설계, ③rollback/precheck 중 채택 결정과 body 가드와의 결합(가드 단독 금지), ④UI minus-수명 가드 순차 통합과 충돌 없음 재확인(instancing 함수 불변 확인됨).
- `productionApplied=false`. corpse fade 보류, 에셋/좌표/수치 변경 0, 새 세션/서버/빌드/UI/Git 0 유지.

## 재실행

```sh
cd /Users/fordeargamers/Projects/exoduser-migration-20261001
/Users/fordeargamers/.local/node-runtime/node-v24.15.0-darwin-arm64/bin/node \
  tools/team-followup-20261002/continuous/ANIMVFX/checks.mjs
```

하니스는 JSON을 stdout으로 출력하고 파일을 추가하지 않는다. 적 상태·에셋 준비·텍스처·GL API·시간은 대역이며 셰이더는 실행하지 않는다. source fixture PASS는 GPU/runtime/visual PASS가 아니다.
