# 플레이어 → etype0 피해 oracle

`Simulation`(Core)의 플레이어 → 일반 몹(etype0) 피해를 **원본 game.html 함수 실행 결과**와 대조한다. 기대값은 손으로 쓰지 않는다.

```powershell
& 'C:\nvm4w\nodejs\node.exe' unity/Tools/damage-parity-oracle/export.cjs --source <origin/main의 game.html>   # oracle.json 생성(약 1.8MB)
& 'C:\nvm4w\nodejs\node.exe' unity/Tools/damage-parity-oracle/run.cjs --label green                           # DOTNET_CLI_HOME은 E:/exoduser-wt/_dotnet-home 고정
```

- 원본 실행 함수: `meleeRef`·`_skMul`·`pAtkMul`·`statCrit`·`statCritDmg`·`spawnCrescent`·`_fireKiSlashCrescent`·`updateCrescents`·`hitArc`·`hurtE`(전체)·`_poiseHit`·`mkEn`(전체). VFX·소리·패시브·엘리트 굴림(`rollElite`→0, `SpawnNormalEnemy`와 동일하게 일반 몹)은 스텁. 치명은 난수 고정(0 = 치명 가능, .999 = 없음).
- 격자: 시작 장비 그대로의 Lv1 전사(`starter`) + Lv1~30 × 근접 무기 7종 × 무기 affix 3변형(없음 / `sharpAtk` / `sharpAtk+brutalAtk+ruinAtk`) × 장신구 2변형(없음 / 목걸이·반지 피해%·치명율·STR·LCK) × 기검참 Lv × 스테이지 1~4.
- 섹션: `dmgmul`(`DamageMultiplier` = `pAtkMul`), `crit-stats`, `mob-spawn`(HP·쉴드·포이즈·ATK·Lv), `ki-packet`(1·2·3타 + 3타 홀드 0/40/80/120f 발사체 피해), `ki-hit`(치명/비치명 × 같은 몹 최대 4연타: 쉴드→HP 분배·포이즈 소진·기절 ×1.5·처치), `swing-base`, `swing-hit`(무기 LMB 평타, 같은 방식).
- 결과 `runs/green.json`: 211 시나리오, 18,354 검사, 실패 0. `runs/red.json`: 수정 전 4,709 실패.
- 수정 전 불일치 두 가지: (1) 기검참 `meleeRef`가 더하는 `_slotFlatAtk(wp())`(무기 `sharpAtk`/`brutalAtk`/`ruinAtk` 값)가 Core에 없었다 → `SimulationConfig.WeaponFlatAttack`(평타 줄에는 더하지 않는다), `ApplyEquipment`이 `WeaponEnhanceAttack`(= 강화×0.25)도 함께 채운다. (2) `PlayerCriticalChance/Multiplier`가 float라 큰 치명타가 1 낮게 잘렸다 → double.
- 시작 장비 Lv1 전사의 1-1 일반 몹: HP 875 + 쉴드 875, 기검참 1타 1940(웹 `hurtE` 실행 결과와 동일) → 웹에서도 한 번에 죽는다.
- 범위: 일반 etype0·물리·근접만. 엘리트/보스/레어몹 분기, 속성·상태이상 어픽스, 패시브, 유니크·전설 효과는 이 oracle의 대상이 아니다.
