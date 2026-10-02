# BOSS — CH1-1 재도전 caller 상태보존 남은 접점(원자성/순서) + source patch 후보

목표: CH1-1 시작→전투·획득→보스게이트→보스전 사망→부활→재도전 끊김 없는 시연 (MILESTONE-CH1-1-PLAYABLE-20261002)
epoch `capacity-after-6a39b828-1212` (root raw23+목표 checkpoint `6a39b828dda2332e482888609a81a05dfa2c1458`, Changes 60, `allowNewOwnedFiles=true`, 저장 1반복/2파일)
실행: Mac Claude Code (BOSS/Claude) · 지정 Node v24.15.0 · `productionApplied=false` · `runtimeAccepted=false`
소유 2파일: `result.md`(이 파일) + `checks.mjs`. 저장 시 재실행 0 — 아래는 메모리 수행 시 캡처한 원 출력.

> **무결성 플래그:** 목표 문서 전달 SHA `889fb16f…` ≠ 실제 on-disk `713aa80c…`(검증 실패, 드리프트 추정). 전달 SHA는 미검증으로 기록하고 실값 기준으로 읽었다. 내용은 기존 SSOT와 일관.

## 1. 채택 계약 확인(정상 대조)

`CH1-1_BOSS_RESPAWN_PROGRESS_20261002.md`의 46필드 `_captureBossFieldState`/`_restoreBossFieldState`(game.html 현행 29514/29531)와 retry 분기(61452)는 **데이터 보존 완비**로 확인(지역 clear는 `_regions.map(r=>{...r})` 얕은 복제로 `R[i].cleared` 보존, gate/unlock·field refs·fb/fd/wm·region·stageKills 모두 포함). → 남은 결함은 **데이터 누락이 아니라 caller의 원자성/순서**다.

## 2. 남은 접점(경계) — `retryBtn.onclick` 비원자성

현행 소스 읽기(game.html 61444–61498):

| 위치 | 동작 |
|---|---|
| 61444 | `retryBtn.onclick = async () => {` — **try/catch 없음** |
| 61445 | `$('death').classList.remove('on')` — 사망 오버레이 해제(**복원 전**) |
| 61457–64 | `ens=[] / MAP_OBJS=[] / 투사체 recycle / 보스상태 배열 대량 clear` |
| 61465 | `_restoreBossFieldState(b)` — **throwable** |
| 61472–74 | `safePt(_gx,_gy,P.r)` — **throwable** |
| 61479 | `buildMapCache();initTorchLights()` — **throwable** |
| 61495 | `updateQS();G.on=true` (+HUD on) — **맨 끝** |

`grep try/catch/finally 61444–61498 → 없음`. 오버레이 해제·배열 clear가 복원보다 **앞**, `G.on=true`가 **맨 끝**.

**결함:** `_captureBossFieldState`/`_restoreBossFieldState`/`safePt`/`buildMapCache` 중 하나라도 throw → 오버레이 사라짐 + 배열 clear됨 + 필드 미복원 + `G.on=false` = **STUCK(복구 불가·진행 차단)**. 마일스톤 **우선1 "진행을 막지 않음"** 정면 위반.
**도달성:** restore/safePt/buildMapCache의 실게임 throw 여부는 **환경대역**(미증명). 정상 경로 발현 0.

## 3. 메모리 모델 원 출력 (4 PASS, `/dev/stdin`, 파일 0 — 저장 시 재실행 안 함)

```
  [PASS] 정상 current: 복원+gOn
  [PASS] 정상 guarded 등가(폴백 없음)
  [PASS] DEFECT current: overlay off+배열clear+gOn=false → STUCK(진행 차단) — err=BAND restore/safePt/buildMapCache throw
  [PASS] CANDIDATE(B) guarded: 폴백 initStage로 gOn=true 복구 — err=BAND restore throw
== MODEL: 4 PASS / 0 FAIL ==
```
보조 grep 원 출력:
```
retryBtn try/catch/finally → 없음 (async 핸들러, 미가드)
61445:  $('death').classList.remove('on') ...
61495:  updateQS();G.on=true;
```

## 4. source patch 후보 (미적용 — root 소유 반영)

- **(A, 권장) 순서 재배치:** `$('death').remove('on')` + 배열 대량 clear + `G.on=true`/HUD를 **복원 성공 뒤로** 이동(capture→restore 성공 후 dismiss). throw 시 death 화면 유지 → 재시도 가능, **진행 손실 0, 정상 경로 동작 불변**. 양판 동일(game.html 61445/61457-64/61495, easy 대응 59779-/맨끝).
- **(B, 대안) try/catch degrade:** restore 분기를 try/catch로 감싸 실패 시 기존 안전경로 `G._zoneState={};initStage(G.stage)`로 폴백(복구가능). 단 **에러 경로에서 필드 진행이 전체 재시작으로 초기화**.
- **실패 복구 정책(A 진행보존 vs B 전체재시작) = root Gate.** 임의 확정 0.
- **불변:** EXP 30% 손실·`applyStats()/_refillRespawnResources()`·사망횟수·경과시간 **값/정책 SSOT 그대로**(모두 복원 성공 이후 실행). 새 보스/규칙/schema/세이브 변경 0.

## 5. 소유·의존성·Gate

- **소유:** 공용 `game.html`/`game-easy-test.html` 반영·docs rg 동기화·Git/원격 checkpoint = **root 순차**. 본 산출은 후보·근거 인계.
- **QA 인계:** 실게임 사망→부활→재진입(6단계 4·5·6) 및 restore throw 재현은 **QA 같은 후보 Gate**. MAP 기존 구조·§23 visual은 MAP/QA.
- **반복 금지 준수:** 이전 summon mkEn/addParts throw 검사 **반복 아님**(다른 caller·다른 실패양상: 소환 루프 고착 vs 재도전 핸들러 비원자성).
- **보존:** protected `2_3`·Q-only blackBean·attack-ticket 금지·맵 LOCK·사용자 세이브. `productionApplied=false`·`runtimeAccepted=false`. source 분석 ≠ 실게임/native/visual/audio PASS.

## 6. 다음 독립 한 건(이번 2파일 예산 소진 후 메모리 진행)

같은 목표의 다음 미완료 접점: **boss CLEAR(처치)→출구 개방→필드/다음스테이지 반환 경계**의 상태 보존(사망/retry와 대칭). 새 epoch 열릴 때까지 메모리로 조사하고, 예산 열리면 저장·인계한다. 전체 팀 완료를 기다리지 않고 본 patch 후보부터 인계.
