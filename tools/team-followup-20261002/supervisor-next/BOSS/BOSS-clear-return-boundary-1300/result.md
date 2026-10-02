# BOSS — boss CLEAR(처치)→출구 개방→필드/다음스테이지 반환 + post-clear 사망 경계

목표: CH1-1 시작→전투·획득→보스게이트→사망→부활→재도전 끊김 없는 시연 (MILESTONE-CH1-1-PLAYABLE-20261002)
epoch `rolling-after-3b548b06-1300` (root checkpoint `3b548b06…`, Changes 63, 크레딧 2, `allowNewOwnedFiles=true`)
실행: Mac Claude Code (BOSS/Claude) · `productionApplied=false` · `runtimeAccepted=false`
소유: 이 `result.md` 1파일(코드 모델 재생산 없이 소스 읽기 근거). 재실행 0 — 아래는 메모리 조사 시 캡처한 원 출력.

> 복구 TASK(`RECOVERY-BOSS-1250`, sha `d59b8b02…`) 지시대로 반복 모델(EXP/원자성/46필드/소환) 생산을 멈추고, **CLEAR→반환**의 실제 source caller를 소스 읽기로 연결했다. restore/safePt/cache 실패 정책 미확정이어도 이 독립 clear 경계를 진행.

## 1. 실제 CLEAR caller (소스 읽기, 라인 근거)

| 구간 | 라인 | 동작 |
|---|---|---|
| 처치 감지 | game.html 40462 | `if(G.bossAlive&&G._bossArena)` — 부활대기 보스도 live 취급(40465, 문 열림 방지) |
| clear 확정 | 40468 | `G.bossAlive=false`; **`G._bossArena=false`는 하지 않음** |
| 처치 기록 | 40471-72 | `G._killedBosses.push(etype)` (`!includes` 가드 → 중복 없음) |
| 피날레 종료 | 40473 | `_finishDruidFinale(_dBoss)` |
| 보상 | 40477 | 보물상자 `_wiPush({type:'chest'})` |
| 출구 생성 | 40482-92 | `G._bossArenaExit` 좌표로 맵 cut + `G.exits.push` |
| 출구 밟음→클리어 | 40560-79 | `if(!G.bossAlive)` → `G.stageCleared=true`, SP+10, 타임어택, `_showClearResult` → (패널) nextStage(42453) |

출구 좌표 유효성: `_bossArenaExit`는 `_enterBossArena`(29575)에서 `genBossArena`의 `exitX=cx`(항상 64)·`exitY`(기본 it, `if(exitY<1)exitY=1` 클램프)로 설정 → **항상 유효**. 원 출력:
```
genBossArena: let exitY=it; ... if(exitY<1)exitY=1; const exitX=cx;
_bossArenaExit 설정: 29575  G._bossArenaExit={x:arena.exitX,y:arena.exitY};
```
→ **정상 clear→출구→nextStage는 진행 차단 없음(robust).** (40490 `G.exits.push`가 40484 좌표가드 밖이지만 좌표가 항상 유효하므로 현행 콘텐츠 **도달 불가**한 latent nit일 뿐, 라이브 결함 아님.)

## 2. 첫 실제 상태 경계 — post-clear 아레나 사망이 clear를 되돌림

clear 블록은 `G.bossAlive=false`만 하고 **`G._bossArena`는 true로 유지**. 따라서:

- 보스를 **처치(clear)한 뒤 출구를 밟기 전** 아레나에서 사망하면, retry 핸들러 분기 `(G._bossArena&&_preArenaBackup)`(game.html 61455/easy 59793)가 참 → **진입 전 필드(`_preArenaBackup`, clear 이전)**를 복원하고 `G.bossAlive=true`(61470/대응)로 되돌림.
- 결과: **이미 완료한 clear·보물상자·출구가 폐기되고 보스 재전투.** 또한 EXP 30% 손실(61451/59789, 복원 전 무조건 — §아래 정정 참조)은 적용되므로 "clear 직후 미회수 사망"은 **보상 없이 손실만** 발생 가능.
- 성격: 채택 SSOT `CH1-1_BOSS_RESPAWN_PROGRESS`의 "일반 보스 구역 사망=진입 전 필드 복원"을 따른 결과지만, **그 계약은 "보스가 이미 clear된 하위 경우"를 구분하지 않음.** "clear가 post-clear 사망에서 보존되어야 하는가"는 **설계/SSOT 미확정 = root Gate**. 임의 확정 0.
- 도달성: 소스 조건은 확정(라인/분기 읽음). 실게임 재현(처치 후 출구 전 사망)·보상 손실 체감은 **QA 6단계 별도 Gate**(미시연).

## 3. 실행가능 최소 후보 1 (미적용, 실게임 미검증, 안전/무손실 주장 안 함)

- clear 확정 시(40468 부근) **post-clear 스냅샷으로 `_preArenaBackup` 갱신**하거나, 재진입 시 `G._killedBosses`/stage-cleared 기준으로 **보스 재스폰 skip** → post-clear 사망이 clear를 되돌리지 않게.
- 단 **사망 복원 정책 변경**이므로 "되돌림(현행) vs clear 보존" 중 의도는 **root 미확정 Gate**. A안의 자원/필드 영향은 실행검증 전 안전/무손실로 주장하지 않으며, fallback 자체 실패도 성공표시 안 함.

## 4. 이전 EXP 순서 정정 인계 (옛 제출본 미수정 — 포인터)

`BOSS-ch11-retry-caller-atomicity-1212/result.md §4`의 "EXP는 복원 성공 이후 실행"은 **오류**다. 실제 바이트(handler sha `0c924807`, game.html 61447-61501 / easy 59785-59839 동일):
```
EXP손실=61451  overlayOff=61448  restore=61468  G.on=true=61498
순서판정: EXP < restore = true, overlayOff < restore = true, G.on > restore = true
```
→ EXP 30% 손실은 **복원 전(top)·무조건** 실행. retry/clear 실패 경계에서 롤백되지 않음. 옛 파일은 **수정하지 않고** 이 포인터로 정정 인계(root 동기화 시 반영).

## 5. 소유·보존·경계

- 공용 `game.html`/`game-easy-test.html` 반영·docs rg 동기화·Git/원격 checkpoint = **root 순차 소유**. 본 산출은 후보·근거 인계.
- 반복 금지 준수: 46필드/소환/원자성/EXP 모델 **재검사·재실행 0**. protected `2_3`·Q-only blackBean·attack-ticket 금지 불변. 사용자 game/save 변경 0.
- `productionApplied=false`·`runtimeAccepted=false`. source 읽기 ≠ 실게임/native/visual/audio PASS. CH1-1 6단계·시각·청취 = 별도 QA Gate.

## 6. 다음 독립 한 건

`G._killedBosses`(동반부활용, 40471-72)를 **읽는** 경로가 재전투/재진입 보스와 상호작용할 때의 자원·상태 경계(예: 이미 기록된 etype의 동반부활이 재스폰 보스와 겹치는지)를 소스로 조사한다. 크레딧 소진 시 메모리로 진행하고, 새 크레딧 열리면 저장·인계. 전체 팀 완료 대기 없이 본 건부터 인계.
