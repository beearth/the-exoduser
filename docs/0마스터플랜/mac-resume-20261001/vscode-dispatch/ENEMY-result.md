# ENEMY-TYPE3-PROBE-FIX 결과 — type3 발사 관측 후보 정확성 보강

- 팀: ENEMY / 터미널 7 / CLI Claude Code (model claude-opus-4-8)
- 기준 HEAD: `30a204a7aa348a88b90bdc922862c610a7da938f`
- 대조 소스: `game.html` sha256 `593a7a9d84c78402f04c50c94ae169e237e49751ad58d8640e78e672850728f2`
- 원본 후보: `r-input-evidence/evidence.zip!candidates/ENEMY.js` (candidate_sha256 `2dfac4f7…`)
- 정적검증 근거: 같은 zip의 `candidates/검증결과.md` + `validation-manifest.json`(ENEMY `static_review` gate=`DO_NOT_RUN_BINDING_AND_TIMELINE_ERRORS`)

## 산출물 (ENEMY 소유 경로)

| 파일 | sha256 | 용도 |
|---|---|---|
| `tools/team-followup-20261001/ENEMY/et3-probe.fixed.js` | `1bf68b094b792998abe5a9e0ca1f6c57534ef4ec6d9dbbd28c792450cbfdf489` | 교정 독립 사본(관측 전용). 원본 미수정, 복제 후 보강. |
| `tools/team-followup-20261001/ENEMY/et3-probe.mock.test.mjs` | `91a709f333a7c31ab9e8e96b84f30e258403d3784aadb44c022a927b02c18d05` | 결정적 모의 하니스(발사/무발사/대상교체/복원). 게임·브라우저·서버 미실행. |

> 원본 `game.html`은 총괄 소유라 편집하지 않았다. 게임 코드 변경 0. 탄 수명·스폰·전투 수치·어택티켓 변경 0. Git add/commit/push 0.

## 결함 5건 — 소스 대조와 수정

### F1. lexical G/P/ens/projs/ETYPE_RANGE 접근 (바인딩 오류)
- **소스 대조:** `game.html:15778 let G`, `15783 let P,ens,projs`, `29473 const ETYPE_RANGE`. `window.(G|P|ens|ETYPE_RANGE)=` 공개 대입 **grep 0건**. 원본은 `root.G`(root=window)로 읽어 전부 `undefined` → 사실상 동작 불가.
- **수정:** 베어 lexical 식별자를 `typeof` 가드로 읽는 `makeBrowserHost()`로 전환. 콘솔/주입 스크립트는 공유 전역 lexical 환경에서 이 바인딩을 본다. 함수 `_fireChargedProj`/`_spawnBossProjectile`은 최상위 `function` 선언이라 전역명 재대입이 내부 호출부(`18893`, `37337`)에 반영되므로 전역 바인딩 교체는 유지.
- **검증:** `F1` 모의 PASS — 비노출 환경에서 `getG()/getP()/getProjs()` 모두 `null`(원본 `root.X`가 왜 undefined였는지 재현).

### F2. projT 재설정 차징 감지
- **소스 대조:** `game.html:38970 if(e.projT<=0&&d<_eRange){e.projT=e.projCd; … 38975 e._projChargeT=60}`. 차징 개시 **그 프레임에 projT가 projCd(≈240, 양수)로 즉시 리셋**. 문서 `탄막시스템_총정리.md:619`("시작 | idle, projT<=0 + 사거리 안 → _projChargeT=60")과 일치.
- **원본 결함:** `lastProjT>0 && projT<=0 && _projChargeT>0` — projT가 이미 양수라 차징 시작을 놓침.
- **수정:** `_projChargeT`의 `0/undefined → 양수` 전이로 차징 개시를 포착(`prevProjChargeT` 추적).
- **검증:** 시나리오 A에서 `chargeStart.tick` 포착 확인(projT가 리셋돼도 놓치지 않음).

### F3. 실제 투사체 commit 이후 판정
- **소스 대조:** `game.html:18860 _fireChargedProj` — 모든 분기가 `spawnProj({..._commit:true})` 1발 + `_cancelProjCharge`. 문서 `탄막시스템_총정리.md:621` 일치.
- **원본 결함:** orig 호출 **전** firstFire 기록 → 실제 커밋 미증명.
- **수정:** orig를 **먼저 호출**하고 `projs.length` 증가(≥1)로 커밋 확인 후에만 firstFire 확정. 호출됐으나 미증가면 `pendingFire`로 분리(PASS 금지).
- **검증:** 시나리오 A PASS(`committed:true`, `projsDelta≥1`); `F3 커밋실패` 모의에서 호출만 있고 미증가 → `FAIL_PATH`.

### F4. 개체 전환 / 실제 simulation tick
- **소스 대조(중요):** `G.frame`은 `game.html` 전체에서 **대입 0건**(읽기 19건) → 항상 `undefined`. 원본 `curFrame()`은 `G.frame`을 읽어 **항상 -1**. 실제 physics-tick 카운터는 `let _gameFrame`(`30689`), physics tick당 1회 증가(`30727`).
- **원본 결함:** (a) rAF 콜백 수를 tick으로 집계 → 고주사율에서 450tick 예산 왜곡, (b) 대상 사망 후 새 개체로 갈아타며 residency/firstFire/chargeStart 혼합.
- **수정:** tick 회계는 `_gameFrame` 증가분으로만(rAF는 스케줄러). 예산 450은 sim-tick(60tps=7.5초, 주사율 무관). 대상 1회 고정, 사망 시 혼합 없이 `targetLost` 종료.
- **검증:** `F4 dedup` 모의(rAF 2×/tick)에서 `inRangeTicks ≤ 경과 sim-tick`; 시나리오 C에서 사망 후 새 etype3 등장해도 residency 혼합 없음.

### F5. wrapper 소유권 / 재설치
- **원본 결함:** stop이 현재 바인딩이 자기 wrapper인지 미확인 복원, 중복 install 시 wrapper를 원함수로 재저장 가능, namespace 잔존.
- **수정:** wrapper에 소유 태그 `__et3probe`. install 시 기존 자기 wrapper는 먼저 dispose(원함수 재수집) 후 재설치. stop은 `현재===자기 wrapper`일 때만 복원.
- **검증:** `F5 복원`/`F5 재설치`/`F5 소유권` 3개 모의 PASS — 중복 install 후에도 `[OWN].orig`가 원함수, 외부 교체 시 복원 안 함.

## 수행 명령 / 결과

```
node --check tools/team-followup-20261001/ENEMY/et3-probe.fixed.js      → exit 0 (SYNTAX OK)
node --check tools/team-followup-20261001/ENEMY/et3-probe.mock.test.mjs → exit 0 (SYNTAX OK)
node tools/team-followup-20261001/ENEMY/et3-probe.mock.test.mjs        → exit 0
  9 PASS / 0 FAIL
  (F1 / A 실제발사 / F3 커밋실패 / F4 dedup / B 무발사 / C 대상교체 / F5 복원·재설치·소유권)
```
- node: `~/.local/node-runtime/node-v24.15.0-darwin-arm64/bin/node` (v24.15.0)
- 모의는 `game.html` 자연 탄막 경로(38966~38976 idle 차징, 18890~18893 `_tickProjCharge`, 18860~18889 `_fireChargedProj`)를 축약 재현하고, 주입 호스트로 lexical 접근·함수 바인딩 교체를 모사한다.

## docs 키워드 대조 (rg)

- `_projChargeT`/`_tickProjCharge`/`_fireChargedProj`/`spawnProj({_commit:true})` 문서 서술(`탄막시스템_총정리.md:619~621`, `9_적AI패턴디자인.md:320~321`)은 **코드·본 수정과 일치**. 정정 불필요.
- **문서 정정 후보(ENEMY 담당 문서, 총괄 통합용 — 직접 편집하지 않음):**
  `docs/9적ai패턴디자인/ENEMY_AI_TEAM_MASTER.md` ENEMY-002(§2, §7 환경 메모)에 "관측 프로브 교정본은 `_gameFrame`(physics tick)을 사용하며 `G.frame`은 game.html에서 미대입(undefined)"과 "차징 개시는 `_projChargeT` 양의 전이로 포착(projT는 개시 프레임에 projCd로 리셋)" 한 줄 보강 권고.
- **타 팀 관찰(참고, ENEMY 범위 밖 — 수정 안 함):** `G.frame`이 전역 미대입이면 `docs/7아이템디자인`·`docs/2_1 …`·`docs/8.0몬스터디자인/탄막·PHYSICAL_PROJECTILE_SCALE_REWARD`의 "패링 추가회복 `G.frame`당 1회" 게이팅(`P._parryCdFrame!==G.frame`)이 **매 호출 적용**될 소지. SKILL/ITEM·BALANCE 협의 필요. 본 작업에서 코드 변경 없이 사실만 기록.

## 미완료 / 남은 게이트

- **실화면 관측 미수행(설계대로 보류):** QA-receipt gate=`blocked`(`QA-game-release.json` released=true 미인계, 부재 확인). 정규 CH1-1 필드 라이브 관측(verdict 실제 산출)은 **QA 종료 인계 후** 수행. 그 전까지 본 교정본은 정적 대조 + 결정적 모의까지만 검증됨.
- **모의 한계:** 모의는 소스 경로를 축약 재현한 것으로, 실제 realm의 lexical 가시성(콘솔/주입 스크립트에서 베어 `G/_gameFrame` 접근 성공 여부)과 고주사율 다중 physics-tick/rAF 비율은 라이브에서 최종 확인 필요. 프로브는 `tickSource:'unavailable(_gameFrame)'`로 그 실패를 명시 보고한다.
- **소유권 밖:** `game.html` 반영, Git 작업, 라이브 실행은 수행하지 않음(총괄/ QA 소유). 다음 작업은 인계.
