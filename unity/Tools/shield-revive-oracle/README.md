# B08 에너지쉴드·부활·신성력 oracle

`Runtime/Core/EnergyShield.cs`와 `Runtime/Core/ReviveRules.cs`를 **원본 game.html 코드를 Node VM에서 실행한 결과**와 비교한다. 기대값은 손으로 쓰지 않는다.

```powershell
& 'C:\nvm4w\nodejs\node.exe' unity/Tools/shield-revive-oracle/export.cjs --source <game.html>   # oracle.json 생성(git 제외)
& 'C:\nvm4w\nodejs\node.exe' unity/Tools/shield-revive-oracle/run.cjs --project <unity 폴더> --out <runs 폴더> --label green
```

- 추출한 원본: `hurtE` 쉴드 흡수·부활 무적 게이트·사망 부활 블록(도플갱어/보스 즉시 부활/일반몹 예약/보스 폴백), `update()`의 죽은 적 부활 타이머 분기, `_spawnGhoul`/`GHOUL_DEFS`/`_ghoulType`, `_reviveDruidFinale`/`_isDruidFinale`/`_isSi0DruidSink`, `hurtP` 플레이어 쉴드 흡수, 쉴드 리젠 틱, `die()` 부활 확률 판정, `_fallenResolve` 성공 분기.
- 난수는 같은 LCG를 JS(`Math.random` 치환)와 C#에 넣어 **추첨 횟수와 순서까지** 대조한다. VFX 파티클 인자의 `Math.random`은 `poolPart(`를 단락(`_NOP&&`)해 건너뛴다(Unity에 파티클이 없다).
- 제외: 텍스트의 영문 번역 사전 값(`_T` → 영문)은 대조하지 않는다(한국어 원문만 대조). 데코이 사망·공격 티켓·VFX/SFX 호출·`hurtP` 내부 DR(별도 행).
- `run.cjs`는 `DOTNET_CLI_HOME`을 고정 폴더(`E:/exoduser-wt/_dotnet-home`)로 쓰고 `DOTNET_ADD_GLOBAL_TOOLS_TO_PATH=false`를 건다.
