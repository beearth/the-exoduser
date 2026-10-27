# 패링 반사 시뮬레이션 검사

실제 `Simulation`+StageFlow 보스 아레나에서 드루이드 탄을 쏘고(`Druid.SpawnProjectile`), 플레이어를 E 쳐내기 / Q 패링 / 무방비 상태로 두고 틱을 돌린다. 규칙 자체는 `../parry-reflect-oracle`이 웹과 대조하고, 여기서는 **연결**을 본다.

```powershell
dotnet build unity/Tools/parry-reflect-test/ParryReflectSim.csproj -c Release -o <출력>
dotnet <출력>/ParryReflectSim.dll <결과 폴더>      # parry-reflect-report.md, 실패 있으면 종료 코드 1
```

| 상황 | 기대 |
|---|---|
| E 쳐내기 + 물리탄 | 1~2틱 안에 반사, 빨콩→블루콩(폭발 160·×2), 속도 7로 보스 쪽, 패링 1회 지급, 보스 HP 약 10 % 감소 |
| Q 패링 + 마법탄 | 반사(수명 180), `parryBank` 증가, 보스 피해 |
| 패링 없음 | 반사 0, 플레이어 피격 |
| Q로 물리탄 | 반사 0 (오입력) |
| 표적 없음 | 탄이 되돌아감 |
