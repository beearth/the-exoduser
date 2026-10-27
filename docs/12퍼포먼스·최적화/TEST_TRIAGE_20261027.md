# H5 main 테스트 실패 분류 (2026-10-27)

- 기준: `origin/main` = `cc898c690` (작업 브랜치 `cto/qa-fix-20261027`, worktree `E:/exoduser-wt/qa-fix`)
- 실행: `C:/nvm4w/nodejs/node.exe --experimental-vm-modules --test "test/*.test.*"` (node v24.15.0)
- 원본 결과: CTO 노트 `qa-main-20261027/` (fail_tests_by_file.tsv, fail_file_level.tsv, engine_check.txt, 전체 출력 2건)
- 금지 준수: 게임 코드(game.html 등) 수정 0, 승인 SHA 미갱신, 테스트 로직 미변경(skip 가드와 삭제만)

## 1. 전후 수치

| 구분 | tests | pass | fail | skipped | 비고 |
|---|---:|---:|---:|---:|---|
| 변경 전 (origin/main, qa-main 실행) | 2865 | 2603 | 250 | 12 | engine:check 3 fail 별도 |
| 변경 후 (이 브랜치, 전체 1회) | 2895 | 2608 | 251 | 36 | 아래 설명 참조 |

변경 후 251건의 구성: **표 95행 189건** + resumeRuntime 28건(변경 전에는 파일 단위 1건으로 가려져 있던 번역 누락 실패가 `--experimental-vm-modules` 적용으로 드러남, §4 R-3) + resumeSystemRuntime 29건(§2 (c)) + **5건 = 이 worktree에서 playwright를 복사하지 않아 생긴 파일 단위 실패**(deathReplayOnDemand, demoSaveReload.browser, localizedGrowthSearch, skillBarGamepadDisplay, steamDeckReadability — `Cannot find module 'playwright'`; 변경 전 qa-main 실행에서는 통과했으므로 스위트 결함이 아니라 이 실행의 환경 문제). 환경 5건을 빼면 **246건**.

증감 설명: 제거 31건(godot 10 + skip 19: gate5 1·steamLang 1·subtitle 1·darkDruid 1·trailer 15, + vm 해소 2: lessonHeader·practiceLocalization) − 추가 32건(resumeRuntime 가림 해제 +27, 환경 5). skipped 12→36(+24 = gate5 1·smoothing 1·steamLang 1·subtitle 1·darkDruid 5·trailer 15). 파일 단위로는 실패 파일 114 → 102 (환경 5 포함). 표의 실패 수 합계는 변경 전과 같은 값이다(ch1StartSmoothingPass만 파일 단위 1 → 실제 단정 1로 의미가 바뀜).

## 2. 이번 브랜치에서 한 일

### (a) Godot 분리로 깨진 10파일 삭제

삭제 전에 10파일 모두 `godot/` 경로(`godot/tools/*.mjs`, `godot/data/*`, `godot/scripts/*`)를 실제로 import/읽는 것을 확인했다. main에서 `godot/`가 제거됐으므로(godot/main 동결 607110d52) 영구 실패 → `git rm`. 이력은 `godot/main`에 남아 있다.

| 삭제 파일 | godot 의존 근거 |
|---|---|
| test/fdgCh1AreaSource.test.mjs | import `../godot/tools/export_ch1_area_source.mjs` |
| test/fdgCh1Stage0AssetSnapshot.test.mjs | import `../godot/tools/sync_ch1_stage0_assets.mjs`, `godot/data/map.json` |
| test/fdgCh1Stage1Source.test.mjs | import `../godot/tools/export_ch1_area_source.mjs` |
| test/fdgCh1Stage1World.test.mjs | import `../godot/tools/export_ch1_area_resources.mjs` |
| test/fdgCh2Stage4Source.test.mjs | import `../godot/tools/export_ch1_area_source.mjs` |
| test/fdgCh2Stage4World.test.mjs | import `../godot/tools/export_ch2_area_resources.mjs` |
| test/fdgMapResourceProvenance.test.mjs | import `../godot/tools/export_ch2_area_resources.mjs`, `godot/scripts/native_ch2_area_resources.gd` |
| test/qa007Portability.test.mjs | import `../godot/tools/export_ch2_area_resources.mjs` |
| test/qa007bPortability.test.mjs | import `../godot/tools/cli_paths.mjs` |
| test/fdgNativePitPoisonSource.test.mjs | `new URL('../godot/data/map.json')` 및 `godot/` 텍스처 읽기 |

문서(`docs/engine/*`)의 이 테스트 언급은 이력 기록이라 수정하지 않았다.

### (b) 미추적 파일 의존 6파일 — skip 처리

테스트 로직은 그대로 두고 `{ skip: <이유> }` 가드만 추가했다. 의존 파일이 생기면(해당 PC에서 `tmp/`·`out/` 복원 시) 자동으로 다시 실행된다.

| 파일 | skip 범위 | 이유(의존 경로) |
|---|---|---|
| test/ch1Gate5CombatCapture.test.js | 전체(1) | `tmp/verify_ch1_gate5_combat.py` 미추적 |
| test/ch1StartSmoothingPass.test.js | 테스트 1개 (capture waits for first visible chunks…) | `tmp/capture_ch1_start_smoothing.py` 미추적. 나머지 16개는 실행됨 → **15 pass, 1 fail** (아래 §3 `ch1StartSmoothingPass`) |
| test/steamLanguageRegionLabels.test.js | 전체(1) | `out/EXODUSER-steam-languages-20260923/package.nw/{index,game}.html` 빌드 산출물 미추적 |
| test/subtitleServing.test.js | 테스트 1개 (packaged server serves all29…) | `release-config.json` 미추적(빌드 생성; node-main.js가 읽음). 나머지 3개 pass |
| test/fdgDarkDruidBody.test.mjs | 전체(5) | pngjs를 Mac Codex 런타임 하드코딩 경로 `/Users/fordeargamers/.cache/codex-runtimes/...`에서 import. 근본 수정은 `import {PNG} from 'pngjs'`(package.json 의존성에 있음) — 이번 범위(로직 불변) 밖이라 후속 |
| test/trailerCapturePipeline.test.js | 전체(15) | `tmp/record_ch3_trailer_takes.py` 외 `tmp/*.py` 8종, `output/imagegen/trailer/steam_*_api.png` 미추적 |

### (c) vm.SourceTextModule 파일 3종

- `package.json`에 `"test": "node --experimental-vm-modules --test \"test/*.test.*\""` 추가. (지시문의 `test/` 디렉터리 인자는 Node 24에서 `Cannot find module '…\test'`로 실패해 glob으로 대체. 기존 `tools/verify-language-support.mjs`도 같은 플래그를 spawn으로 넘긴다.)
- 개별 확인: lessonHeaderLocalization 1/1 pass, practiceLocalization 3/3 pass. **resumeRuntime은 플래그 후 28건 실패로 남음** → 원인은 번역 누락(§4 R-3).
- resumeSystemRuntime(29건) 원인 1줄: `system-lesson.js`의 `finishFlow`가 `this.body.insertBefore(...)`를 호출하는데 테스트의 `El` 스텁(`test/resumeSystemRuntime.test.cjs` 2행)에 `insertBefore`가 없어 TypeError → 하니스가 코드 변화를 못 따라감(HARNESS). 수정은 하지 않았다.

## 3. (d) 나머지 분류 — 95행 (수정 없음)

유형: **STALE** = 테스트가 코드 변화를 못 따라감 / **HARNESS** = 잘라낸 코드·vm 컨텍스트에 의존 심볼·전역 누락(또는 환경 경로) / **REGRESSION 의심**.
근거에 `(미검증)`이 붙은 행은 에러 메시지와 현재 코드 대조까지만 했고 코드 변경 의도(커밋 메시지)는 확인하지 못한 것이다.

주요 원인 묶음(HARNESS):
- `window._FDGDruidQaStorage.active` 가드(game.html 59곳)가 들어간 뒤, `window`가 없는 vm 컨텍스트에서 ReferenceError(try/catch에 삼켜져 조용히 오동작하는 경우 포함) — "window is not defined" 계열.
- 추출 하니스가 의존 함수를 안 가져옴: `_FDG_RUINED_FOREST_FIRST`, `_resetInteractInput`, `_uEq`, `_fdgNativePerspective` 등 (모두 현재 game.html에 정의돼 있음).

| 파일 | 실패 수 | 유형 | 근거 |
|---|---:|---|---|
| ancestorSwordSkill.test.js | 1 | STALE | `ANC_ROSTER` 항목에 portrait 필드가 붙은 현재 형태, 정규식은 필드 없는 옛 형태 |
| baseWingStrike.test.js | 2 | HARNESS | ReferenceError `_isKiCharging` — game.html에 정의 존재, 추출에서 누락 |
| bigEnergyParrySplit.test.js | 1 | STALE | `doParry(...)` 마지막 인자가 `…'waterEnergy':p.fdEnergy&&p.el===EL.F?'fireEnergy':undefined`로 확장(화염 에너지 추가) |
| bladeDashCost.test.js | 2 | HARNESS | ReferenceError `_uqMoveRefund` |
| ch1HighGround.test.js | 1 | HARNESS | ReferenceError `_FDG_RUINED_FOREST_FIRST` |
| ch1ProductionFinish.test.js | 1 | STALE | 현 코드 `const _moCull=_worldViewBounds||_mapObjectCullBounds(…)`인데 테스트는 `const _moCull=_mapObjectCullBounds(`로 슬라이스해 `_moCull` 미정의 |
| ch1StartMediumEyeMass.test.js | 1 | STALE | 렌더러 aspect 단정(96행) 정규식이 현 `drawH/drawW` 코드 형태와 다름 (미검증) |
| ch1StartOuterMass.test.js | 1 | STALE | `_CH1_START_OUTER={stage:0,chunkSize:_ROOTWORLD_ART_PREVIEW?256:1024,bleed:1,…}` — chunkSize가 조건식으로 바뀜 |
| ch1StartSmoothingPass.test.js | 1 | STALE | skip 가드 후 드러난 실패: `_buildCh1HillSmoothingTex`가 `.ellipse(` 대신 `organicSkirt` 경로를 쓰는 현재 코드와 정규식 `/\.ellipse\(/` 불일치 ("organic hill visual" 테스트 144행) |
| ch3HellWinterLayout.test.js | 1 | STALE | ch1ProductionFinish와 같은 앵커 — `_worldViewBounds\|\|` 접두 추가로 정규식 불일치 |
| characterStoryCreation.test.js | 1 | HARNESS | index.html `doCreateChar`가 `_LOBBY_BUILD==='demo'`를 참조하나 vm 컨텍스트에 `_LOBBY_BUILD` 없음 → ReferenceError가 안쪽 catch로 들어가 localStorage 폴백 저장이 성공 처리돼 "거절 시 스토리 미시작" 단정 실패 |
| cloudAutoSave.test.js | 2 | HARNESS | ReferenceError `_charId` |
| crystalForgeManagement.test.js | 1 | HARNESS | DOM 스텁에 노드 없음(`reading 'onclick'`, 117행) (미검증) |
| darkSphereIdentity.test.js | 1 | HARNESS | `window` 미정의 |
| demoSaveRoute.test.js | 1 | HARNESS | `_characterLoadSeq`(index.html 전역; game.html에는 0건) 선언이 하니스에 없음 |
| demoScope.test.js | 1 | STALE | 로비 문구가 `DEMO 멀티 캐릭터`로 바뀌어 정규식 `DEMO CHARACTER[\s\S]*Lv.1 START · Stage 1-1 · Lv.100 Cap` 불일치 |
| druidFinalePacing.test.js | 1 | HARNESS | ReferenceError `_FDG_RUINED_FOREST_FIRST` |
| druidParryBarrage.test.js | 1 | STALE | 1/3 밀도 드롭 조건이 `if(!p._commit&&!p._druidParryVolley&&!p._druidThornVolley)`로 `_druidThornVolley` 추가 |
| druidProjectileFallback.test.js | 1 | HARNESS | `window` 미정의 |
| earlyCombatBalance.test.js | 1 | STALE | kiSlash `spawnCrescent(P.x…)` 호출이 단일 지점(game.html:16827, `_mul`·`_ukcMul` 포함)으로 통합돼 테스트의 "2줄" 기대와 불일치 |
| earringSlots.test.cjs | 2 | HARNESS | `pickupItem` 추출에서 `_invAutoSortIfClosed` 누락 → 소켓 deep-equal 연쇄 실패 (미검증) |
| eightDirEnemyInstancing.test.js | 1 | STALE | `if(e._mob8dir&&e._mobCh)…_queueEnemy8DirInstanced…e._ensGLMode=1` 정규식이 현 GL 큐잉 분기 형태와 다름 (미검증) |
| enemyProjectileSpeedBand.test.js | 9 | HARNESS | `window` 미정의 (`_speedBandBullet` 줄에 `window._FDGDruidQaStorage?.active` 가드) |
| enemyShotWarning.test.js | 7 | HARNESS | `window` 미정의 |
| enemyTeleportImpactBalance.test.js | 7 | HARNESS | ReferenceError `_FDG_RUINED_FOREST_FIRST` |
| fdgDarkDruidSlamContactBridge.test.mjs | 3 | HARNESS | fetch 스텁이 `/Users/fordeargamers/the-exoduser/tools/...` Mac 절대경로를 기대 — Windows는 `/E:/exoduser-wt/...` |
| fdgDruidETapBuffer.test.mjs | 4 | HARNESS | ReferenceError `_handleDeathMenuKeyboard` |
| fdgDruidIdleBridge.test.mjs | 1 | HARNESS | ReferenceError `_fdgNativePerspective` |
| fdgDruidNativeEncounter.test.mjs | 2 | HARNESS | NORMAL 소유 판정이 `_FDGDruidQaStorage` 상태에 의존하는데 하니스 스텁과 불일치 (미검증) |
| fdgDruidQaConsumers.test.mjs | 4 | STALE | `tutorial-badges.complete('combat', 11개)`가 false — combat 연습 단계 구성이 바뀜(§4 R-3의 연습 문구 변경과 같은 흐름) + 일부는 `_resetInteractInput` 누락 (미검증) |
| fdgDruidScreenQualityConsumer.test.mjs | 1 | HARNESS | ReferenceError `_refreshPetBubbleInput` |
| fdgDruidShockFieldLive.test.mjs | 1 | STALE | 늦은 장식 알파 기대 .102 vs 실측 .0288 (.12 gain 소비값) — 코드 의도 미확인 (미검증, 수치 변경이면 후속 확인 가치 있음) |
| fdgDruidSourceSelection.test.mjs | 4 | HARNESS | vm 컨텍스트에 `fetch` 없음 (`_loadDruidPoolClip`) |
| fdgDruidThornVolley.test.mjs | 1 | HARNESS | `window` 미정의 |
| fdgHellAberrantMotion.test.mjs | 1 | STALE | "visible tail tip must move" — 리그 모션 데이터 변화 (미검증) |
| fdgLegacy.test.mjs | 1 | STALE | **의도된 변경** — §5 참조 |
| fdgMapSourceAdapter.test.mjs | 2 | STALE | `result.pending` 필드 검증이 현 어댑터 출력과 불일치 (미검증) |
| fdgNativeEastVisibilityIntegration.test.mjs | 1 | HARNESS | 캡처 호출 미발생(`reading 'args'`) — 추출 하니스 누락 추정 (미검증) |
| fdgNativeEncounterPlacementIntegration.test.mjs | 3 | HARNESS | ReferenceError `_resetInteractInput` |
| fdgNativeMapPackIntegration.test.mjs | 4 | HARNESS | ReferenceError `_resetInteractInput` |
| fdgNativePerspectiveIntegration.test.mjs | 4 | HARNESS | native loader 설치 횟수 0≠1 — `window`/`_fdgNativePerspective` 스텁 의존 (미검증) |
| fdgRigSceneRuntime.test.mjs | 2 | STALE | draw 순서/호출 수 7≠5 기대 — 장면 렌더 순서 변화 (미검증) |
| fdgRuinedForestScene.test.mjs | 4 | HARNESS | ReferenceError `_resetInteractInput`, `_prepareNativeMapPack` |
| fdgRuinedForestVisibility.test.mjs | 2 | HARNESS | ReferenceError `G` |
| fdgRuntime.test.mjs | 2 | HARNESS | rAF 스텁에 예약 프레임 없음("A scheduled animation frame exists") (미검증) |
| fdgSourceReadabilityRuntime.test.mjs | 1 | STALE | 지면 높이 삼각형 기대 2024 vs 실측 2208 — 상수 pin (미검증) |
| fdgSourceSceneContract.test.mjs | 2 | STALE | `sourceRequired.length` 기대 6 vs 실측 4 (미검증) |
| fieldBossSpawnEmerge.test.js | 1 | STALE | 대형 에너지볼 패링 반경이 `P._sbParryT>0?100:P._sbReleaseR\|\|0`로 바뀜 — 코드 주석 "차지는 해제파에만 적용, 눌림 패링은 100px 고정"(의도된 변경) |
| friendlyReflectBlueBeanDamageFlags.test.js | 1 | STALE | `hurtE` 옵션에 `_lessonParryShot:p._lessonShot?p:null` 추가 |
| giantSlamClone.test.js | 2 | STALE | 현 `giantSlam2`는 `cat:'rage'`(테스트는 `'phys'`)이고 시전부는 `activateGiantSlam('giantSlam2')`·`window._parryLesson?.active\|\|` 조건 추가 — `hellSlamNaming`은 `'rage'`를 기대해 두 테스트가 서로 모순, 현 코드는 후자와 일치 |
| gritSystem.test.js | 1 | STALE | `_gritTotal` = `(+_grit\|\|0)+_lvB()+…` NaN 방어 `(+x\|\|0)` 추가 |
| groundTrapVisibility.test.js | 1 | HARNESS | ReferenceError `_mineTrapWardSheet` |
| hardwareTierBench.test.cjs | 3 | HARNESS | `window` 미정의 (`_benchTick`) |
| hellSlamNaming.test.js | 2 | STALE | 스킬 설명의 합체 문구(`지옥강타 1과 합체→기둥강타`)가 현 desc와 다름 — 이름/cat은 일치 |
| inventoryPaperdollLayout.test.cjs | 1 | STALE | 페이퍼돌 소켓 경계 단정(`bounds 0`) — 장비 슬롯 레이아웃 변화 (미검증) |
| itemEquipSound.test.js | 1 | STALE | 장착 흐름이 `recalcSt();playEquipSfx…`에서 `_refreshEquipmentStats();playEquipSfx(item);notify(…)`로 교체 |
| itemPickupSound.test.js | 1 | STALE | 자동 장착 알림이 `SFX.pickup();playEquipSfx(item);notify(…자동 장착!)` 형태로 변경 |
| kiSlashHoldCharge.test.cjs | 4 | HARNESS | ReferenceError `_uEq` |
| krakenWaterEnergy.test.js | 6 | HARNESS | ReferenceError `_loadKrakenWaterOrbClip`, `_loadFiredevilOrb24` |
| levelUpVfx.test.js | 3 | HARNESS | ReferenceError `_processPassiveQueue` |
| localizationCoverage.test.js | 1 | **REGRESSION 의심** | §4 R-1 — 자동 투자 예약 문구 9건 번역 미등록 |
| localizationHandoff.test.js | 3 | HARNESS | 부팅 구간의 `window._FDGDruidQaStorage` ReferenceError가 try/catch에 삼켜져 언어 복원이 실행 안 됨(`code:'ko'`≠`'en'`) |
| magicBarrageHoming.test.js | 4 | STALE | `_enemyHomingTurnRate` 기본값 .00655(코드 주석 "일반 마법탄 약 22.5°/s")로 재하향 — 테스트는 .0131(45°/s) |
| maliceEconomyRegression.test.js | 1 | STALE | bigEnergyParrySplit과 같은 `doParry` 인자 확장 |
| mapStreamChunkLoading.test.js | 1 | STALE | `if(_bootMapBuildPromise)await _bootMapBuildPromise;` 단문 형태 — 정규식은 `{…}` 블록 형태 기대 |
| nodeMainMats.test.js | 1 | HARNESS | vm 추출 환경에서 `"undefined" is not valid JSON` (fs 스텁 반환값) (미검증) |
| nodeMainRange.test.js | 1 | HARNESS | vm 컨텍스트 `fs.readFileSync is not a function` — fs 스텁 부족 |
| omniBeamFusionDamage.test.js | 1 | STALE | `pBeamMul` = `1+Math.max(0,(+hm().beamDmg\|\|0))*0.08` — `+` 강제변환 추가 |
| ossuaryAutoGrantStats.test.cjs | 2 | HARNESS | `"undefined" is not valid JSON` — localStorage/window 스텁 (미검증) |
| petGateLockedDialogue.test.js | 1 | STALE | 대사가 `지역 네 곳을 모두 클리어하면 지옥문이 열릴 거야.`로 변경 |
| physicalProjectileScaleReward.test.js | 2 | STALE | `game.html`과 `game-easy-test.html`의 `doParry` 본문 동일성 비교 불일치 — 두 변형 파일 분기 (미검증) |
| physicalProjectileVisibility.test.js | 1 | HARNESS | ReferenceError `_FDG_RUINED_FOREST_FIRST` |
| practiceCatalog.test.js | 1 | **REGRESSION 의심** | §4 R-2 — 튜토리얼 번역 레지스트리가 live 소스와 불일치 |
| projChargeTelegraph.test.js | 1 | STALE | druidParryBarrage와 같은 `_druidThornVolley` 조건 추가 |
| regionClearGate.test.js | 6 | HARNESS | `Image` 미정의 |
| renderSettingsRestore.test.js | 3 | HARNESS | 저장 설정 복원 구간의 `window._FDGDruidQaStorage` ReferenceError가 try/catch에 삼켜져 `OPT.resScale`이 100에 머문 것 — 하니스에 window 없음(실 런타임 영향 없음) |
| runtimePackaging.test.js | 1 | HARNESS | 스테이징에 `output/` 참조 런타임 아트 누락 — 미추적 산출물 의존(환경) |
| settingsBindingControls.test.js | 1 | HARNESS | ReferenceError `_resetInteractInput` |
| settingsDifficultyVersion.test.cjs | 7 | HARNESS | `window` 미정의 |
| silvertailAttackMotion.test.js | 2 | STALE | `if((P.s==='sBash'\|\|P.s==='sRecover')&&_charIdx!==1)` 형태 소멸 — 현재는 `_silvertailAttackPose()` 단일 함수가 `_charIdx!==1\|\|!P` 처리 |
| silvertailWalkSheetLoader.test.js | 1 | STALE | `_SILVERTAIL_ASSET_VERSION='20260915-walk-v3'`(테스트는 `20260817-4frame-v4`) |
| skillForge.test.js | 1 | STALE | css 버전이 `skill-forge.css?v=20261023-detach`(fab7a167c 2026-10-23)로 갱신, 정규식은 `20261021-orbs\d+` |
| softFloorEdgeFade.test.js | 1 | STALE | `ctx.scale(_CH1_START_ROOT!=='assets/map/ch1/baked_start_outer'?1:_CH1_OUTER_HUG_X,1)` 조건 추가 — 정규식은 무조건 scale |
| specialShotElement.test.js | 1 | HARNESS | ReferenceError `_drawProjectileChargeLabel` |
| staticAssetEtagCache.test.js | 1 | STALE | server.cjs:340이 `matchesIfNoneMatch(req.headers['if-none-match'],_etag)`로 교체(다중·weak ETag 대응), 정규식은 `===` 비교 |
| steamDemoScope.test.js | 1 | STALE | package.json `main`이 `nw-boot.html`(10ce8d7ba 포트 3333 교차오염 수정)로 바뀜, 테스트는 `http://localhost:3350/index.html` 기대 |
| storageRightClick.test.cjs | 1 | STALE | f046cd606d(2026-10-16 "avoid duplicate stats refresh on bag right-click") — 우클릭 장착 시 stats 호출 1→0, 테스트는 1 기대 |
| systemLessonLocalization.test.cjs | 1 | HARNESS | vm 컨텍스트 `setTimeout` 미정의 |
| testCharacterVoiceIdentity.test.js | 2 | HARNESS | `Illegal return statement` — 함수 추출 경계가 선언 밖 return을 포함 |
| texAsyncPrewarm.test.js | 2 | STALE | while 조건이 `_texPreQ.length+_texPreBusy<_TEXHOT_QMAX`로 변경 |
| trailerRemakePipeline.test.js | 4 | HARNESS | `tmp/` 미추적 캡처 스크립트 필요(CTO (b) 목록 외, 같은 계열 — 후속으로 skip 가드 권고) |
| uiPanelInitialization.test.js | 3 | HARNESS | canvas 스텁에 `getContext` 없음 (`titleFrames`) |
| waterBeanIceBarrage.test.js | 1 | STALE | `_fbEnergyBoom`이 `_bossWaterImpact?'bossWaterImpact':'waterImpact'`로 분기 — 정규식은 `el===EL.I?'waterImpact'` |
| worldIntroPlayer.test.js | 1 | STALE | 로비 세계 인트로 영상 v15→v17(846889174, 2026-10-22) 교체 |
| worldIntroSubtitles.test.js | 1 | STALE | 같은 커밋 — `world_intro_v15_clean_en.mp4` 기대, 현재 v17 |

집계 (95행): STALE 45 · HARNESS 48 · REGRESSION 의심 2 (resumeRuntime의 R-3은 §2 (c) 쪽 집계).

## 4. REGRESSION 의심

게임 동작이 실제로 나빠졌다고 증명된 항목은 없다. 아래는 모두 **번역 누락**(CLAUDE.md "텍스트 추가 시 번역 등록" 규칙 위반 가능성)이다.

| ID | 테스트 | 내용 | 확인 방법 |
|---|---|---|---|
| R-1 | localizationCoverage | 성장 패널의 자동 투자 예약 문구 9건이 localization 데이터에 없음: `자동 투자 예약 {n}개 저장됨 · 짝수 레벨업마다 AP +1, …`, `AP가 부족해도 예약 가능 · …`, `자동 투자 예약 · {n} AP`, `현재 AP {ap} · 예약 후 예상 레벨 {rank} · …`, `자동 투자 예약 {n}개 저장됨 · 아래에서 개별 취소 가능`, `AP가 부족해도 예약할 수 있습니다. …`, `자동 투자 예약`, `예약 취소`, `자동 투자 예약 취소` | 테스트 출력의 actual 배열(미등록 키) |
| R-2 | practiceCatalog | `localization/tutorial-source.json`의 행 `좌클릭 · 적 3마리 처치`가 live 소스(parry-lesson.js/resource-practice.js)와 불일치 — 소스 문구가 바뀌었는데 레지스트리를 재생성하지 않음 | 테스트 출력: expected `Left click · Defeat 3 enemies` |
| R-3 | resumeRuntime (28건) | `en missing 좌클릭 · 10마리 처치 + 3단 차징` 등 27개 언어에서 새 연습 문구 번역 키 없음 (`--experimental-vm-modules` 후에도 실패) | 테스트 출력: `typeof value === 'string'` 단정 |

R-2·R-3는 같은 원인(연습 문구 변경 후 번역 레지스트리·언어 데이터 미갱신)으로 보인다. 담당: 번역/튜토리얼 담당 세션 (CLAUDE.md 번역 규칙 §2~§6 순서대로).

## 5. fdgLegacy `_buildCh1StartForestRLE` 승인 SHA 불일치

- 승인 SHA: `8f6ad81bd9183d5e58deb99ccddac189d7a59a00cdab6b6157069f17a87d6ca8` (`engine/fdg/source-map.js:1850` REVIEWED, 검증은 `tools/fdg-catalog.mjs` `reviewedFunction`).
- 커밋별 함수 본문 SHA를 직접 계산: `a339adb39`(2026-09-16 "fix: replace faint web projectile dots with original snake artwork")까지 승인 SHA와 동일, 이후 최신(`fab7a167c` 2026-10-23)까지 모두 `28caed8b82…` 하나로 고정 — 변경은 한 번뿐이다.
- 변경 내용: 함수 첫 줄에 `if(typeof CH1_1_PRODUCTION!=='undefined')return CH1_1_PRODUCTION.buildRLE(mw,mh);` 추가(원래 본문은 폴백으로 유지).
- 도입 커밋: `d9597ae2b` 2026-09-16 "auto: local checkpoint (82 changed files)" — 같은 커밋이 `assets/map/ch1/production_finish/CH1_1_PRODUCTION_MASTER.png`와 chunk 자산을 추가한 CH1-1 production-finish 작업이다.
- 판정: **의도된 변경** (CH1-1 production 맵으로 위임하는 `typeof` 가드 분기 + 원본 폴백). 커밋 메시지가 자동 체크포인트라 의도 문구는 없으나 같은 커밋의 자산 추가로 맥락이 확인된다. 승인 SHA는 갱신하지 않았다 — 맵 SSOT 재검토 후 map 담당이 갱신해야 한다.

## 6. 저장소 상태 메모 (판정 한계)

- 이 저장소의 `game.html` 이력에 **읽을 수 없는 blob이 있다**: 최근 400개 game.html 커밋 중 56개가 `git cat-file blob <commit>:game.html` 실패, `git log -S/-L`은 `fatal: unable to read cfc0835d96aece141c3de5fad99277e4d7cdf72d`(f046cd606d의 game.html)·`48342c95ee…`에서 중단된다 (inflate data stream error).
- 그래서 blame/pickaxe로 모든 변경 커밋을 특정하지 못했다. 위 표의 커밋 SHA는 읽을 수 있는 blob 범위에서 확인한 것만 적었고, 나머지는 현재 코드와 테스트 기대값 대조(근거에 명시)로 판단했다. 이는 개발 PC 안정성 문제(메모리 `pc-hardware-14900kf-bsod`)와 관련 가능성이 있다 — `git fsck` 확인과 복구(원격에서 해당 blob 재취득)를 권고한다.
- game.html 변경의 상당수가 `auto: local checkpoint`/`release: sync` 번들 커밋이라 커밋 메시지만으로는 변경 의도를 알 수 없다.

## 7. 후속 권고 (이 브랜치 범위 밖)

1. HARNESS 약 45파일의 다수는 같은 두 원인이라 하니스 공용 헬퍼(`window` 스텁 + 의존 함수 자동 수집) 한 곳 수정으로 대량 복구 가능.
2. STALE은 정규식 pin을 실제 의도(동작)를 보는 단정으로 바꾸는 것이 안전. 수치 pin 3건(fdgDruidShockFieldLive·fdgSourceReadabilityRuntime·fdgSourceSceneContract)은 코드 의도 확인 후 갱신.
3. R-1~R-3 번역 누락은 별도 처리(번역 규칙 순서).
4. fdgDarkDruidBody는 `import 'pngjs'`로 바꾸면 skip 해제 가능, trailerRemakePipeline에도 (b)와 같은 skip 가드 필요.
