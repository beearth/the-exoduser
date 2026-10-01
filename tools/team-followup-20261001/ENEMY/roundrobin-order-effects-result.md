# ENEMY-20261002-ROUNDROBIN-ORDER-EFFECTS 결과

라운드로빈 회전이 적 update 루프의 **순서 의존 동작**(spawn/splice/hole/동일 tick death/drop 보상)에 **잘못된 중복 update·skip·reward 차이**를 유발하는지, 실제 원문 미니 실행으로 검증했다. 결론: **결함 아님 → 최소 수정 불필요(생산 patch 없음).** 이미 검수한 음수 정규화(roundrobin-boundary 8검사)는 반복하지 않았다.

- UTC 수신 16:25 / Read 16:26 / 코드 Edit 16:30 / 검수 16:32 / 완료 16:32:30 (2026-10-01).
- 원함수 SHA: `game.html` `7631f5a0…`(읽기전용). 원 루프 '함수' 원문 = `roundrobin-boundary.before.txt`(`f379376e…`).
- 중복 확인: `roundrobin-order-effects-*` 신규.

## 실제 원문 근거
| 요소 | 원문 |
|---|---|
| 원본 헤더 | `for(let _ei=0;_ei<ens.length;_ei++){const e=ens[_ei];` — **LIVE 길이**, hole 가드 없음 |
| 후보 헤더 | `const _elen=ens.length; … for(let _k=0;_k<_elen;_k++){const _ei=(_eStart+_k)%_elen;const e=ens[_ei];if(!e)continue;` — **캡처 길이**, 회전, hole 가드 |
| 보상 1회 | 33140 벽끼임 kill `rollDrop/addExp/G.kills/_regKill` + 40703 hurtE `if(e.hp<=0)return`(이중처리 방지) |
| mid-loop 변이 | `ens.push`/`mkEn`(**append만**). 메인 루프 본문 내 `ens.splice` **없음**(제거는 틱시작 GC·별도 함수) |

## 핵심 성질 (왜 결함이 아닌가)
`_eStart∈[0,_elen)`에서 `_ei=(_eStart+_k)%_elen` (k=0…_elen-1)은 **[0,_elen)의 순열(cyclic)** → **tick당 각 인덱스 정확히 1회**. 따라서:
- **중복 update 불가** → 이동/보상 이중 적용 불가.
- break 없을 때 **누락(skip) 0** → 처리되는 엔티티 집합은 원본과 동일(순서만 다름).
- append(인덱스 ≥ `_elen`)는 당틱 미방문 → 다음 tick 재캡처로 처리(이연).

## 검수 (fixture 6 PASS / 0 FAIL, 가상·소형, 실원문 결속)
1. **순열**: N∈{1,2,8,40,97}·여러 `_eStart`(음수/2^31/NaN 포함)에서 방문수=N·중복0·[0,N) 전부 1회.
2. **동일 tick death**: 원본·후보 **보상 총량 동일(8=8)**, 이중 보상 0, 엔티티당 update ≤1.
3. **분열 append**: 원본 신생아 same-tick 1회 update vs 후보 **1-tick 이연** — 2 tick 후 신생아 update **정확히 1회**(tick1 미방문·tick2 방문). 누락/중복 아님. 부모 보상 양쪽 1회.
4. **보상 1회 불변**: 임의 `_eStart`로도 사망 엔티티 정확히 1회 보상, 이중보상 0.
5. **hole**: 후보 `if(!e)continue`로 undefined 슬롯 안전 skip(정상 엔티티 skip 아님); 원문은 hole에서 throw → **후보가 개선**(회귀 아님).
6. **원문 사실**: 메인 루프 본문 내 `ens.splice` 없음 → 캡처 `_elen` 안전.

명령: `node --check` exit0, `node fixture` **6/0**.

## 발견된 순서 효과 (benign — 결함 아님)
- **(A) mid-tick 신생아 1-tick 이연**: 분열/소환으로 틱 중 append된 신생아를 원본은 same-tick, 후보는 다음 tick에 첫 update. **누락/중복 아님**(총 1회), 신생아는 보통 spawn-in 타이머가 있어 16.67ms 지연은 무시 가능하며 모든 신생아가 균일하게 다음 tick 시작 → 오히려 일관적. **수정 불요**.
- **(B) tick 내 처리 순서 회전**: 교차 엔티티 상호작용(분리 `_sepCd`·플로우필드 read/write·충돌 타이브레이크) 순서가 바뀜. **보상/중복/skip과 무관**한 위치 타이브레이크 미세차뿐. 핵앤슬래시 특성상 무해, 라이브 육안은 QA 영역.

## 판정 / 최소 수정 여부
- **중복 update 0 · 잘못된 skip 0 · reward 차이 0** → **결함 아님.** 따라서 **생산 수정 후보를 만들지 않는다**(task: 결함일 때만 최소 수정). 정책 임의 확정 없음.
- 적용 대기 후보는 기존 하드닝본 `roundrobin-boundary.{game,game-easy-test}.patch` 그대로(변경 없음).

## 산출물 (ENEMY 소유, roundrobin-order-effects-*)
| 파일 | sha256 |
|---|---|
| `roundrobin-order-effects.fixture.mjs` | `73a7f323…` |
| `roundrobin-order-effects-receipt.json` / `-result.md` | — |

## 한계 / 라이브 게이트
- 실게임 실행/계측/육안 미수행(QA 소유). **per-tick 보장·FPS 향상 주장 없음.**
- (B) 순서 민감성의 실게임 시각 타이브레이크 미세차는 결정적 미니모델 범위 밖 — 라이브 육안(QA) 확인 대상이나 보상/중복/skip 정확성과 무관.
- 사용자 게임 tab1573846373 입력/리로드/닫기/계측 0. Mac 빌드·부하 중복 0. Git/queue/공유docs/production/새 세션 쓰기 0.

## docs 반영안 (직접 미편집 — 총괄 통합용)
`ENEMY_AI_TEAM_MASTER.md §3-C "후보 A (round-robin)"` 행에 보강:
> 순서 효과 검수 완료(`roundrobin-order-effects.*`, 6 PASS): 회전은 [0,_elen) 순열이라 중복update/이중보상/잘못된skip 없음. mid-tick 분열/소환 신생아는 1-tick 이연(누락/중복 아님), tick 내 순서 민감성만 변화. 결함 아님 — 생산 수정 불요, 하드닝본 유지.

## 인계
root/QA: 회전은 보상·중복·skip 정확성에 결함 없음. 생산 수정 불요, 기존 하드닝 후보 유지. intra-tick 순서 민감성 라이브 육안만 QA 확인. 한 건 종료, 다음 잔여 게이트 인계.
