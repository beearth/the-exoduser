# D05 레벨·경험치 oracle

`Runtime/Core/LevelExp.cs`(`_calcMaxExp`, `addExp`, `_canTransLv`, 처치 경험치 줄)를 **원본 game.html 함수 실행 결과**와 비교한다. 기대값은 손으로 쓰지 않는다.

```powershell
& 'C:\nvm4w\nodejs\node.exe' unity/Tools/level-exp-oracle/export.cjs --source <game.html>   # oracle.json 생성(약 30MB, git 제외)
& 'C:\nvm4w\nodejs\node.exe' unity/Tools/level-exp-oracle/run.cjs --project <unity 폴더> --out <runs 폴더> --label green
```

- 섹션: `maxExp`(Lv1~1461), `add`(레벨·경험·초월 일일 상태·데모 캡·expBonus 격자 + 난수 4000), `kill`(플레이어 Lv·적 Lv·보스·엘리트·콤보·난이도 격자).
- 범위 제한: 경험치 칸이 `int`라 `maxExp`가 2^31을 넘는 Lv1462 이상(초월 하루 1레벨 → 현실적으로 미도달)은 대조하지 않는다.
- 제외(다른 행): `_processPassiveQueue`(예약 패시브 자동 투자), Lv300/700 스킬 해금, `nc().expBonus`(목걸이 기본 필드; Unity 아이템에 필드 없음).
- `run.cjs`는 `DOTNET_CLI_HOME`을 고정 폴더(`E:/exoduser-wt/_dotnet-home`)로 쓰고 `DOTNET_ADD_GLOBAL_TOOLS_TO_PATH=false`를 건다.
