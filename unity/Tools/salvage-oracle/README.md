# 분해값 원본 함수 대조 (salvage oracle)

`Runtime/Core/InventoryState.cs`의 `SalvageValue`·`JunkItems`·`JunkSalvageTotal`·`SalvageJunk`·`SalvageOne`을 **원본 game.html `salvageVal`을 실제로 실행한 결과**와 웹 `#invJunkBtn`·`dropItem` 규칙에 대조하는 offline .NET 검사다. Unity Player/Editor 검증이 아니다. 손으로 옮긴 기대값은 없다.

```powershell
# 1) 원본 실행 → oracle.json (Node VM, game.html 읽기 전용)
& 'C:\nvm4w\nodejs\node.exe' unity/Tools/salvage-oracle/export.cjs --source 'G:/exoduser/game.html'
# 2) 대조 (ExoduserProject = unity 폴더)
dotnet run --project unity/Tools/salvage-oracle/SalvageOracleTests.csproj -p:ExoduserProject=<작업본>/unity -- unity/Tools/salvage-oracle/oracle.json
```

- `export.cjs`는 `function _itemEconomyRarity(`·`function salvageVal(` 두 블록을 텍스트 앵커(정확히 1회 일치)로 찾아 VM에서 실행한다. 블록 줄 범위와 sha256, game.html sha256을 `oracle.json`에 남긴다.
- 입력 격자: rarity 0~5 × enh 0/1/5/20 × tier 0~7 = 192건 + 경계 22건(rarity -1·7, 빈 객체, enh 2~250 × rarity 0/2/4) = 214건.
- C# 추가 검사 12건: 일괄 분해는 즐겨찾기·비쓰레기를 남기고 합계 = salvageVal 합, 제거된 선택 해제, 두 번째 실행 0, 단일 분해는 즐겨찾기 거부·`min(idx,len-1)` 선택.
- 웹 `_enhRefund`(구 장비 강화 이전 환불)는 Unity 아이템 필드가 없어 대조하지 않는다.

## 실행 기록 (2026-11-03, 클라우드 Linux, dotnet 8.0.133)

- source game.html sha256 `d2976ef53ef14f8658658b32cc1520286e71bcf0c582c0d0b1887604eb4c8162`(main), salvageVal 28601-28615줄.
- GREEN: **226 checks / 0 failures**.
- 변이 검사: 강화 환불 절사 `(int)(total*0.5)`를 `Math.Round`로 바꾸면 **226 중 27 실패**(검사가 실제로 민감함). 되돌림.
- global.json은 8.0.301(latestFeature)이다. 다른 SDK 대역에서는 global.json이 없는 폴더에서 `dotnet run --project`로 실행했다.
