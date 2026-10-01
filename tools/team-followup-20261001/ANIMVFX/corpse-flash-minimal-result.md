# ANIMVFX 시체부활 플래시 최소 후보 — 결과 (한국어)

- 담당: ANIMVFX / 터미널 8. 기존 세션 `1d2a7253-…`. flash-revive-reachability 결과 연속.
- 대상 game.html SHA-256(before, 미수정): `c868284af349c996d42087e93eba47a10614d73cb8f55f4db5ae01dde89da31a`.
- UTC: 수신 17:30:59 / 첫 Read 17:31 / 첫 Edit 17:32 / 명령·검수 17:33 / 완료 17:34. 상세 `corpse-flash-minimal-receipt.json`.
- **성격: 도달 입증된 결함(etype9 시체부활, catch-up 프레임)만 겨냥한 적용 가능한 최소 unified patch + before/after 재현·불변 검증. 생산 직접 수정 0.**

## 1. 현재 소스에서 재추출 (라인 드리프트 반영 — 모델 반복 아님)
game.html이 이전 세션 이후 편집됨(SHA `c868284a…`). 라인 번호가 바뀌어 **내용 기준으로 재탐색**했다.
| 항목 | 현재 라인 | 확인 |
|---|---|---|
| etype9 시체부활 전이 | **37571** | `corpse.alive=true;…corpse.reviveIframes=0;` (`_hitFlash` 소거 없음) |
| 2D 플래시 렌더 조건 | 51981 | `if(e._hitFlash > 0 && !_ensGLQueued)` → hf>0면 그림 |
| GL 플래시 렌더 조건 | 5240 | `if(!e||!e.alive||!(e._hitFlash>0)||e._ensGLMode!==1)continue;` → alive&&hf>0면 그림 |
| 사망 소거 | 51018 | `if(e._hitFlash)e._hitFlash=0;` (draw, 죽은 몹) |
| update 감쇠 | 33162 | `if(e._hitFlash>0)e._hitFlash=Math.max(0,e._hitFlash-sp)` (alive-gated) |
| 보스/드루이드 전이(방어, 미포함) | 33217/33252, 16232 | — |

→ 두 실제 draw 플래시 조건(2D·GL) 모두 `_hitFlash>0`을 요구. 부활한(alive) 시체에 stale `_hitFlash>0`이면 **실제로 그려진다**.

## 2. 최소 unified patch (적용 가능·생산 미적용)
`corpse-flash-minimal.patch` — **단 1행**(L37571) 변경:
```
-        corpse.alive=true;…corpse.reviveIframes=0;
+        corpse.alive=true;…corpse.reviveIframes=0; corpse._hitFlash=0;
```
- 삽입은 **순수 시각상태 대입 1개**(`corpse._hitFlash=0;`). 함수 호출 없음, RNG/보상/kills/drop/exp 토큰 없음, 타이머/수치 변경 없음, 보호 파리 무관.
- **보스/드루이드 전이 미포함**(flash-revive-reachability에서 미도달=방어 전용으로 분류). 효과 없는 수정의 생산 적용을 요구하지 않음.
- **patch dry-run**: `git apply --check tools/team-followup-20261001/ANIMVFX/corpse-flash-minimal.patch` → **exit 0 (클린 적용 가능)**. game.html SHA 불변 확인(미수정).

## 3. before 재현 / 후보 제거 검증 (`corpse-flash-minimal-verify.mjs`, exit 0)
실제 루프 순서 모델(draw 매 프레임 1회, 생략 없음)에 patched 토글(=패치 효과)로 대조.

| 구분 | before(패치 전) | after(패치 후) |
|---|---|---|
| **catch-up 프레임** | 부활 몹에 플래시 **4프레임 렌더(stale, 도달 재현)** | **0프레임 (후보가 제거)** |
| 정상 1tick/프레임 | 0 (사망 프레임 draw가 즉시 소거) | 0 (영향 없음) |

→ catch-up과 정상1tick **분리 확인**. 결함 증거는 "부활 직후 그려진 스퍼리어스 플래시 프레임 수"(before 4 → after 0)이며, 최종 hf는 어차피 감쇠로 0 수렴한다(값이 아니라 **렌더 발생**이 결함).

### 불변 검증 (삽입이 바꾸지 않음)
patched/unpatched 부활 결과 상태 동일 — `alive=true`, `hp`(=mhp×0.5), `poise=maxPoise`, `reviveIframes`, `eShield` 전부 동일. **원 호출/보상 횟수 동일**(`{reviveVFX:1,addTxt:1,addParts:1,rollDrop:0,addExp:0}`). 유일한 차이는 `corpse._hitFlash=0` 하나. hp/alive/poise/reviveIframes/보상·RNG·원 호출횟수 **불변 확정**.

## 4. 양 파일 상태 (미변경)
- game.html: **미수정**(SHA `c868284a…`). 패치는 후보 파일로만 제공(총괄/QA 적용 결정).
- game-easy-test.html: 플래시 **죽은 코드 유지**(`if(e._hitFlash>0){e._hitFlash-=1}` "타이머만 감소, 원형 제거" — 렌더 안 함). easy는 플래시 미렌더 상태 **그대로 유지**(본 세션 미수정; easy SHA는 타 팀 WIP로 변동했으나 내 변경 아님).

## 5. 보존
- 기존 `flash-transition.patch`(3행, SHA `e50b1b92…`)·`flash-transition-before.md`·`flash-revive-reachability-*`(fixture `8ea8dd08…`) **전부 보존**(미변경). 본 산출물은 그 중 **도달 입증된 시체부활 1행만** 적용 가능한 최소 후보로 분리.

## 6. 한계·인계
- 도달/제거 입증은 **추출한 실제 순서의 Node 모델**(라이브 화면 아님). 조건: catch-up 프레임(히치 후 ≥2 update) + 주술사 `reviveT≈0`가 인접(≤150px) 신규 시체와 정렬. 좁지만 밀집 전투+히치에서 현실적. `sp=1` 가정. 실제 ≥90Hz·실화면 미실측.
- **총괄/QA 인계**: `corpse-flash-minimal.patch` 적용 검토(1행, dry-run 클린). 적용 시 정규 GL 실화면에서 히치 유도 + 주술사 인접 사망→부활 첫 프레임 플래시 pop 소거 실측(root/QA 단독).
- **공유docs 반영안**(직접편집 금지, result에만 기록): `ANIMATION_VFX_TEAM_MASTER §11` 한 줄 — "시체부활(etype9) 플래시: catch-up 프레임에서 도달 확인 → `corpse-flash-minimal.patch`(L37571 +`corpse._hitFlash=0`) 1행 후보, dry-run 클린·불변 검증. 보스/드루이드는 방어 전용. easy는 플래시 죽은 코드로 무효."

## 7. 불변(전역)
- game.html/easy/index/server/사용자세이브/생산/공유docs/타팀 수정 0. 신규 사망효과/성능관측기/전투수치·타이머·보호 파리 변경 0. Git 쓰기(커밋/스테이지)/새세션/에이전트/queue/게임/서버/브라우저/빌드/인코딩 0. (`git apply --check`는 읽기 전용 dry-run.)
