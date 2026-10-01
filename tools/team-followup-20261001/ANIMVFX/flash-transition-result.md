# ANIMVFX-20261002-FLASH-TRANSITION — 결과 (한국어)

- 담당: ANIMVFX / 터미널 8. 기존 세션 `1d2a7253-…`. 
- 기준 HEAD: `30a204a7`. game.html SHA-256(미수정): `7631f5a083672124624e0b8dc22b0716d10c8815dbb1e6aee98a5e2e51299993`.
- UTC: 수신 16:12:46 / 첫 Read 16:13 / 첫 Edit 16:18 / 검수 16:20 / 완료 16:22:45. 상세 `flash-transition-receipt.json`.
- **성격: 실제 생산 spawn/update/render 소스 추출 회귀로 `_hitFlash` 전이 잔류 확인. 확인 결함 1건 + 최소 미적용 patch. 게임/GL 실화면 실행 0(root/QA 별도). 새 사망 디졸브 구현 0.**

## 1. `e._hitFlash` 생애 경로 (소스 확정)
| 단계 | 위치 | 코드 |
|---|---|---|
| 세팅 | `game.html:40981`/`:40963` | `e._hitFlash=6`(일반)/`=4`(회전참) — hurtE |
| 감쇠 | `game.html:33149` | `if(e._hitFlash>0)e._hitFlash=Math.max(0,e._hitFlash-sp)` — **`if(e.alive){` 블록 안(alive 전용)** |
| 소거 | `game.html:50888` | `if(e._hitFlash)e._hitFlash=0` — **draw() 2D 사망분기(렌더 경로 전용)** |
| 스폰 | `mkEn` `_e={…}` | `_hitFlash` 미포함 → `undefined`(≈0) |

즉 죽은 몹의 `_hitFlash`는 update에서 감쇠되지 않고(alive 가드), **오직 draw의 50888** 한 곳에서만 소거된다.

## 2. 4개 전이 범위 점검 결과
| 범위 | 판정 | 근거 |
|---|---|---|
| 죽음 | 커버 | 사망 시 ens 즉시 splice 없음 → 죽은 몹 ≥1프레임 ens 잔류, GC는 20프레임 주기(`_gcT>20`). 그 사이 draw 50888이 매 프레임 `_hitFlash=0`. |
| **부활** | **결함** | 동일객체 부활 전이 3곳이 `eShield/stunned/reviveIframes`는 리셋하나 **`_hitFlash` 소거 누락**(아래). |
| pool재사용 | 커버 | `mkEn`·`_spawnGhoul`·`_spawnMatSlime` 모두 **신규 객체 리터럴**(origE 복사 아님) → stale 없음. `_deadPool`은 `rebuildDeadPool`이 `ens`에서 재구성(⊆ens) → 50888 커버. |
| GL↔2D 전환 | 커버 | 감쇠=update 33149 **단일 지점**, 렌더(GL `:5227` / 2D `:51851`)는 **그리기만**(감소 없음) → 전환 시 이중감소·누락 없음. |

## 3. 확인된 결함 (ONE)
**동일객체 부활 전이 3곳이 형제 전이 상태(eShield/eShieldMax/stunned/reviveIframes)는 리셋하면서 `_hitFlash`만 소거하지 않는다.**

| # | 위치 | 전이 | 소거 현황 |
|---|---|---|---|
| 1 | `game.html:33205` | 보스 부활 `e.alive=true;…e.eShield=0;…e.stunned=0;…e.reviveIframes=90;` | `_hitFlash` **없음** |
| 2 | `game.html:16219` | 드루이드 피날레 `e.alive=true;…e.eShield=0;…e.stunned=0;e.reviveIframes=90;` | `_hitFlash` **없음** |
| 3 | `game.html:37558` | 주술사 시체 부활(etype9) `corpse.alive=true;…corpse.eShield=0;…corpse.reviveIframes=0;` | `_hitFlash` **없음** |

→ "부활 시 피격 플래시 없음" 불변식이 **상태전이가 아니라 렌더경로(50888)에만 의존**하는 구조. 소거는 `draw()`에 1곳뿐이고 GL 렌더 경로에는 자체 소거가 없다.

### 영향(라이브 재현 여부 — 정직)
현재는 **라이브 잔상 미재현**이다 — 죽은 몹이 ens에 ≥1프레임 남고 draw가 매 프레임 50888로 소거하므로 부활 시점엔 이미 `_hitFlash=0`. 그러나 이는 렌더 타이밍이 가려주는 것뿐이며, **GC 타이밍 변경·비렌더 부활·ens 밖 객체 부활** 중 하나만 생겨도 부활 첫 프레임에 스프라이트 가산 발광 pop이 남는 **잠재·구조 결함**이다. 권위 있는 소유 지점(부활 전이)에서 소거해야 형제 상태들과 일관되고 렌더경로 의존이 사라진다.

## 4. 소스 회귀 (게임 실행 없이)
`node tools/team-followup-20261001/ANIMVFX/flash-transition-source-regression.mjs`
- 실제 `game.html`을 읽어 생애경로 3·스폰/pool 2·부활 전이 3·GL↔2D 2·제어흐름 2를 전부 확인 → **CONFIRMED (exit 0)**.
- 부활 전이 3곳 각각 `eShield=true stunned=true reviveIframes=true _hitFlash=false`로 **누락을 소스에서 직접 증명**.

## 5. 최소 미적용 patch
`tools/team-followup-20261001/ANIMVFX/flash-transition.patch` (CANDIDATE — **game.html 미적용**).
- 전이 3곳 문장군 끝에 `<obj>._hitFlash=0;`만 추가(형제 리셋과 동일 지점).
- **불변**: 수명감쇠(33149)/사망소거(50888)/death/alive/판정/보상(rollDrop·addExp·kills·_stageKills)/시체수(_addCorpse)/경직/쿨다운 전부. 시각 타이머만 0으로(부활 시 원래 0이어야 하는 값). **새 사망 디졸브 구현 0**(기존 보류 계약 유지).
- 원파일 before: `flash-transition-before.md`(game.html SHA·원본 라인 보존).

## 6. 경계·불변
- **game.html 미수정**(SHA `7631f5a0…` 불변). easy·index·server·공유docs·타팀·원 GL 프로브·생산 VFX 수정 0.
- 게임/GL 실화면/브라우저/서버/빌드 실행 0. 사용자 게임 입력/리로드/계측/닫기 0. Git/queue/새세션/새에이전트/권한 0.

## 7. 한계·인계
- **라이브 잔상 미재현**(렌더 소거가 현재 가림) — 소스 기준 잠재·구조 결함. 실제 ≥90Hz·실화면 검수는 계속 미실측.
- **총괄/QA 인계**: `flash-transition.patch` 검토·적용 결정(생산 game.html 총괄 소유). 적용 후 정규 GL 실화면에서 보스/구울/주술사 부활 첫 프레임 `_hitFlash=0`·플래시 pop 없음 실측(root/QA 단독).
- docs 반영안(공유 직접편집 금지): `ANIMATION_VFX_TEAM_MASTER.md` §11 하위 한 줄 — "부활 전이 3곳 `_hitFlash` 소거 누락(렌더경로 단일 의존) 확인 → flash-transition.patch 후보. 라이브 잔상은 렌더 소거가 가림, 구조 보강."
