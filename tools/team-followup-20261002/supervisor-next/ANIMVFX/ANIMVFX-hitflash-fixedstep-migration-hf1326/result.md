# ANIMVFX-hitflash-fixedstep-migration-hf1326 — 결과 (2026-10-02)

CH1-1 playable 마일스톤 hit-flash lifetime 실제 연결. 선행 후보(28c167dc, easy 사망 flash clear)와 main의 **고정스텝 감쇠(`_hitFlash-=sp`)**를 easy의 실제 update/render caller에 연결하여, **30/60/144fps 대조**와 **render(`-=1`)→update(`-=sp`) 이동의 double-decay 검수**를 수행했다. **검수 6/6 PASS, exit 0.**

- `productionApplied=false`, `runtimeAccepted=false`. 실제 주사율별 체감·시각은 **QA 화면 Gate**(native 미인수).
- 저장 epoch `rolling-after-0d918990-1326` (credit 2, maxFiles 3, changes 64, stop<100). 소유 신규 2파일: 이 폴더 `checks.mjs`·`result.md`. 기존 정적7표(ts1300)·GL ring bridge·`_telegraphT` 반복 0, 이미 제출한 폴더/원자료 불변. 공유 source/docs/Git·사용자 save 미변경(root 소유 → 후보만 인계).

## 1. 실제 source 경계·SHA (7 앵커 전부 참)

| 앵커 | 위치 | 의미 |
|---|---|---|
| `PHYS_STEP=1000/60` | game.html:58760 | 고정 60Hz 스텝 |
| `while(_acc>=PHYS_STEP)` | game.html:59990 | 고정스텝 accumulator 루프 |
| `_hitFlash=Math.max(0,_-sp)` | game.html:33200 | **update 단일 감쇠(주사율 독립)** |
| GL/2D render = 그리기만 | game.html 5240·52046 | render 경로 **감쇠 없음**(단일 사이트 보장) |
| `_hitFlash-=1` | easy 50526–50528 | **render 프레임마다 감쇠(FPS 의존)** — easy 유일 감쇠 |
| easy update 감쇠 부재 | easy updateE | 고정스텝 감쇠 없음 |

감쇠 사이트 수: **game=1(update), easy=1(render `-=1`)**. 실Read sha256는 evidence `sourceReadSHA`. Git 미호출.

## 2. 발견 — easy 피격 flash 지속시간이 FPS 의존 (main은 상수)

고정스텝 accumulator(PHYS_STEP=1000/60)와 render-frame 감쇠를 **원문 수식대로 시뮬**(flash=6→0 wall-clock ms):

| FPS | easy 현행(`render -=1`) | 후보/main(`update -=sp`) | 잘못된 이동(both, double-decay) |
|---|---|---|---|
| 30 | **200ms** | 100ms | 67ms |
| 60 | 100ms | 100ms | 50ms |
| 144 | **42ms** | 104ms | 35ms |

- **easy 현행**: flash 지속 = 6/FPS초 → 30fps 0.2s vs 144fps 0.042s (**~5배 편차**). 고주사율일수록 피격 발광이 비정상적으로 짧아짐.
- **후보/main(update-sp)**: ~100ms **wall-clock 상수**(FPS 무관).
- **double-decay 버그**: render `-=1`을 제거하지 않고 update `-=sp`만 추가하면 두 사이트가 동시 감쇠 → 수명 ~절반(특히 저FPS). → 이동은 반드시 **추가+제거 쌍**.

## 3. 최소 후보 (render→update 이동·미적용)

```
// easy: _hitFlash 감쇠를 render(-=1) → 고정스텝 update(-=sp)로 이동 (double-decay 회피 위해 쌍)
(1) game-easy-test.html updateE 타이머 블록: if(e._hitFlash>0)e._hitFlash=Math.max(0,e._hitFlash-sp);
(2) game-easy-test.html render 50526-50528 의 `e._hitFlash-=1` 제거 (렌더는 그리기만)
(3) 선행 28c167dc: !e.alive 블록에 if(e._hitFlash)e._hitFlash=0; (부활 잔상 방지)
```

- **단일 감쇠 사이트 유지**(`MIGRATION-keeps-single-site` PASS) → double-decay 0. 사망 clear(28c167dc)와 합치면 **부활 잔상 + FPS 의존 둘 다** 해소, main과 provenance 일치.
- **보존**: `_hitFlash`는 순수 피격 발광 VFX(hurtE 세팅·감쇠·GL/2D 렌더). ENEMY 공격 상태/수치/보호2_3/asset 불변 → render-only. sp*2/4/8 tier(culled 적)는 main과 동일 구조로 함께 적용되어 culling에도 주사율 독립 유지.

## 4. 정상 대조·double-decay 검수 (요약)
- 정상 피격(alive): easy 현행은 FPS 따라 수명 변동(위 표), 후보는 상수 → control.
- `BUGGY-both-double-decays` PASS: render+update 동시 시 수명 단축을 실제 시뮬로 재현 → 이동 시 render 제거 필수 확정.

## 5. docs 인계 (root 순차)
| 정본 | 문안 |
|---|---|
| `docs/5.1임펙트디자인/ANIMATION_VFX_TEAM_MASTER.md` | easy enemy `_hitFlash`가 render `-=1`(FPS 의존)·사망 clear 없음 → main 고정스텝 `-=sp` + 사망 clear로 이동 권장. render→update 이동은 render `-=1` 제거와 쌍(double-decay 회피) |
| `docs/12퍼포먼스·최적화/QA_PERFORMANCE_TEAM_MASTER.md` | VFX 수명 주사율 독립 원칙: 감쇠는 고정스텝 update(`-=sp`) 단일 사이트, render는 그리기만. easy 미이관 잔존 |

docs 전체 키워드(`_hitFlash|고정스텝|PHYS_STEP|주사율`) 검색 기준 위 2정본이 관련. 보호 `2_3`/Q-only/attack-ticket 금지 유지.

## 6. PASS·의존성·Gate
- **PASS(source/fixture, 6/6)**: 앵커·감쇠 사이트 수·easy FPS 의존·후보 상수·double-decay 버그 재현·단일 사이트 이동.
- **의존성**: ENEMY(hurtE/`_hitFlash` 세팅), QA(실제 30/60/144fps 체감), BUILD(easy 빌드 적용은 root).
- **Gate**: 실제 주사율별 발광 지속·시각은 QA 화면 Gate. easy/game 적용·공유 docs·Git은 root 슬롯.
- 발앵커 UNKNOWN·corpse fade 보류·수치/에셋 변경 0.

## 재실행
```sh
cd /Users/fordeargamers/Projects/exoduser-migration-20261001
/Users/fordeargamers/.local/node-runtime/node-v24.15.0-darwin-arm64/bin/node \
  tools/team-followup-20261002/supervisor-next/ANIMVFX/ANIMVFX-hitflash-fixedstep-migration-hf1326/checks.mjs
```
하니스는 JSON을 stdout으로 출력하고 파일을 추가하지 않는다. 고정스텝/render 감쇠는 원문 수식대로 시뮬이며 GL/2D 실픽셀은 없다. source/fixture PASS는 실제 fps/시각 PASS가 아니다.
