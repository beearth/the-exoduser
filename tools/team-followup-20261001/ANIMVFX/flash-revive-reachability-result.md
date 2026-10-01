# ANIMVFX 부활 플래시 후보의 실제 도달 경로 검수 — 결과 (한국어)

- 담당: ANIMVFX / 터미널 8. 기존 세션 `1d2a7253-…`. 
- 기준 HEAD `30a204a7`. game.html SHA(미수정) `7631f5a0…`, game-easy-test.html SHA(미수정) `7d68b80a…`.
- UTC: 수신 16:32:12 / 첫 Read 16:32:20 / 첫 Edit 16:34 / 명령·검수 16:36 / 완료 16:38:28. 상세 `flash-revive-reachability-receipt.json`.
- **성격: draw 임의 생략 가정 없이 실제 루프 순서를 실행 fixture로 재현해, stale `_hitFlash`가 "부활"까지 실제로 도달하는지 검수. 게임/브라우저/빌드 0, 생산 미수정.**
- root 구분 유지: 직전 flash-transition 제출은 "소스상 초기화 누락/잠재상태 차이"였다. 본 검수가 그 중 **일부 경로의 실제 도달을 입증**하고, 나머지는 **방어 전용으로 재분류**한다.

## 1. 실제 루프 순서(원문 추출)
- 메인 `game.html:59803-59830`: `while(_acc>=PHYS_STEP){ update(); _acc-=PHYS_STEP }` → `draw()` **1회**(G.on이면 항상; `_didUpdate=false`여도 else로 draw). **draw는 프레임마다 반드시 1회** 실행된다(생략 없음).
- 누산 클램프 `game.html:59763`: `_accCap = 모바일2틱 / (_prof.u<=8?5틱:3틱)`. → **프레임당 update 최대 5틱**(데스크톱).
- `update()` 내부 순서: `rebuildDeadPool`(`:33089`, `++G._shT>=2` = 2틱 주기) → 적 AI 루프 [감쇠 `:33149` **`if(e.alive)` 안**] [etype9 시체부활 `:37552/:37558`].
- `draw()`: 사망분기 소거 `:50888` `if(!e.alive){ if(e._hitFlash)e._hitFlash=0 }` → `alive && hf>0` 플래시 렌더(2D `:51851` / GL `:5227`).
- 함수 SHA(앞16): update(30844–) `3ede71081bd2dbd4`, draw(49935–) `2c4551389be189c4`, etype9(37551–37560) `4daadabfacc40d6a`, rebuildDeadPool(17913) `b3ef26080d28eca1`.

## 2. 실행 fixture 결과 (`flash-revive-reachability-fixture.mjs`, exit 0)
draw를 매 프레임 1회 반드시 실행하는 충실 모델. 3시나리오:

| 시나리오 | 결과 | 판정 |
|---|---|---|
| **A. etype9 시체부활 · catch-up 5틱 프레임** | tick1 KILL A(hf=6, alive=false) → tick2 rebuildDeadPool→REVIVE A(alive=true, **hf=6 유지**, 그 사이 draw 없음) → 프레임말 draw가 **부활한(alive) A에 플래시 4프레임 렌더** | **실제 도달(REACHABLE)** |
| B. 정상 60fps(프레임당 1틱) | 사망 프레임 draw가 즉시 `_hitFlash=0` 소거 → 부활 시 hf=0, 잔상 렌더 0 | 미도달 |
| C. 보스 부활(reviveTimer=90) · 5틱 catch-up | reviveTimer 90은 ≤5틱/프레임으로 동일프레임 불가 → 사망 중 draw가 소거 → 부활 시 hf=0 | 미도달(방어 전용) |

### 정확한 사건 순서(도달 경로 A)
단일 **catch-up 프레임**(프레임 히치 후 `_acc`가 2틱 이상 누적 → `while`이 draw 없이 여러 update 실행):
1. tick1: 플레이어 막타 — `A._hitFlash=6`(hurtE) 직후 `A.alive=false`(사망). **draw 없음**(프레임 미종료).
2. tick2: `rebuildDeadPool`(2틱 주기)이 A를 `_deadPool`에 포함 → 인접(≤150px) etype9 주술사 `reviveT<=0` → `corpse.alive=true`(전이 `:37558`, **`_hitFlash` 소거 없음**). A는 사망 중이라 `:33149` 감쇠 미적용 → **hf=6 유지**. 여전히 draw 없음.
3. tick3~5: A는 이제 alive → `:33149`로 hf 6→3 감쇠.
4. 프레임말 `draw()` 1회: A는 alive·hf>0 → **부활한 몹에 가산 발광 플래시 렌더(스퍼리어스 pop)**. 이후 ≤6 update틱(≈100ms) 동안 잔상.

## 3. 결론 — 재분류
- **etype9 시체부활(`game.html:37558`) = 실제 도달 결함**(단, catch-up 프레임 + reviveT≈0가 인접 신규 시체와 정렬될 때). → 최소 후보 `corpse._hitFlash=0`(기존 patch 3행 중 **시체부활 행**)은 **효과 있는 수정**.
- **보스(`:33205`)·드루이드(`:16219`) = 미도달 → 방어 전용(defense-in-depth).** reviveTimer(90~180)가 ≤5틱/프레임을 넘어 반드시 중간 draw가 소거하므로 부활 시 hf=0. **이 두 행의 생산 적용을 "결함 수정"으로 요구하지 않는다**(효과 없는 수정 강요 금지 — 과제 지침 준수). 일관성/방어 목적의 선택적 보강일 뿐.

## 4. 양 파일 전이 위치 비교
| 항목 | game.html(생산) | game-easy-test.html(테스트) |
|---|---|---|
| etype9 시체부활 전이 | `:37558` (hf 소거 없음) | `:36352` (동일, hf 소거 없음) |
| 보스 부활 전이 | `:33205`(=`:33204` 블록) | `:32011`/`:32046` (동일) |
| 드루이드 부활 전이 | `:16219` | `:15334` (동일) |
| 피격 플래시 렌더 | **있음**(GL `:5227` + 2D `:51851`, 가산 발광) | **없음 — 죽은 코드**(`:50337` `if(e._hitFlash>0)e._hitFlash-=1;` 감소만, "타이머만 감소, 원형 제거"). PM-014 복원 미적용 |
| 감쇠 위치 | update `:33149`(alive-gated) | render `:50338`(draw당 -1, 구형) |
| 사망 소거(50888) | **있음** `:50888` | **없음** |

→ **전이 위치는 양쪽 동일**(시체/보스/드루이드). 그러나 easy는 **플래시를 렌더하지 않는 죽은 코드**라 `_hitFlash` 잔류가 **시각적으로 무효**다(사망 소거·update 감쇠도 없는 구형 모델). 따라서 **도달 가능한 시각 결함은 생산(game.html) 전용**이며, easy는 패치가 시각상 no-op(테스트 빌드, 미변경).

## 5. 최소 후보 / 보존
- 기존 `flash-transition.patch`(3행)·`flash-transition-before.md` **보존**(SHA `e50b1b92…` / `5f7a2a41…` 불변). 본 검수는 그 중 **시체부활 행만 "도달 결함 수정"으로 승격**, 보스/드루이드 2행은 **방어 전용**으로 라벨 정정.
- 신규 패치 파일 생성 없음(기존 3행 유지). 생산 미적용(총괄/QA 결정).

## 6. 한계·인계
- 도달 입증은 **추출한 실제 순서의 Node 모델**(라이브 화면 아님). 조건: (a) catch-up 프레임(히치 후 ≥2 update, 흔함), (b) 주술사 `reviveT≈0`가 인접(≤150px) 신규 시체와 정렬. 좁지만 밀집 전투+히치에서 비현실적이지 않음. `sp=1` 가정.
- 실제 ≥90Hz·실화면 검수는 계속 미실측(root/QA 별도).
- **인계**: 총괄/QA — `flash-transition.patch`의 **시체부활 행 적용 검토**(도달 결함). 보스/드루이드 2행은 방어 선택. 적용 시 정규 GL 실화면에서 catch-up(히치 유도) + 주술사 인접 사망→부활 첫 프레임 플래시 pop 유무 실측.
- docs 반영안(공유 직접편집 금지): `ANIMATION_VFX_TEAM_MASTER §11` — "부활 플래시: etype9 시체부활은 catch-up 프레임에서 실제 도달(시체부활 행 수정 효과有), 보스/드루이드는 미도달(방어). easy는 플래시 죽은 코드라 무효."

## 7. 불변
- game.html·game-easy-test.html·index·server·사용자세이브·생산·공유docs·타팀 수정 0. 신규 사망효과/성능관측기 0. 게임/브라우저/빌드/Git/새세션 0.
