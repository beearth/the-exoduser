# B10 분노·악의 oracle

`Runtime/Core/RageMalice.cs`(`_rageMax`, `_maliceMul`, `_malCost`, 패링 분노 적립, 지옥강타 분노 소비 블록, 유니크 분노 적립, 악의 줍기, 엘리트 처치 악의)를 **원본 game.html 문장 실행 결과**와 비교한다. 기대값은 손으로 쓰지 않는다.

```powershell
& 'C:\nvm4w\nodejs\node.exe' unity/Tools/rage-malice-oracle/export.cjs --source <game.html>   # oracle.json 생성(git 제외)
& 'C:\nvm4w\nodejs\node.exe' unity/Tools/rage-malice-oracle/run.cjs --project <unity 폴더> --out <runs 폴더> --label green
```

- 섹션: `rageMax`, `add`(패링·검콤보·반지킬·갑옷), `slam`(분노 배율·남은 분노·텍스트·폭발 수), `malCost`, `pickup`, `elite`(즉시 드롭·추가).
- 범위 제한: `malCost`는 int 범위(≈4e9 미만)까지. Simulation 연결(`SimulationRage.cs`)은 `--unity-rage-malice-smoke` 빌드 스모크가 확인한다.
