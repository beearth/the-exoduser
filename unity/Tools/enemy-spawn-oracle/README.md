# 적 생성 `mkEn` 원본 대조 (CX-02 oracle)

`Runtime/Core/EnemySpawn.cs`, `EnemyFactory.cs`(웹 `mkEn` + `rollElite/rollMods/rollAura/_isDruidFinale/_druidFinaleHp/_assignMobSkin/safePt`)를 **원본 game.html 함수를 그대로 실행한 결과**와 대조한다. 보고서: `docs/engine/UNITY_CX02_ENEMY_SPAWN_20261026.md`.

```powershell
# 1) 원본 실행 → oracle.json (Node VM, game.html 읽기 전용; 케이스 입력·난수 수열·결과 기록)
& 'C:\nvm4w\nodejs\node.exe' unity/Tools/enemy-spawn-oracle/export.cjs --source 'G:/exoduser/game.html'
# 2) 같은 oracle.json에서 C# 생성 (EnemySpawn.cs / EnemyFactory.cs)
& 'C:\nvm4w\nodejs\node.exe' unity/Tools/enemy-spawn-oracle/gen-cs.cjs
# 3) RED: 위치만 복사하는 축약(RedStub) → 실패해야 함
& 'C:\nvm4w\nodejs\node.exe' unity/Tools/enemy-spawn-oracle/run-red.cjs --project 'E:/exoduser-wt/pc-unity-c01/unity' --label red
# 4) GREEN: 실제 EnemySpawn.cs / EnemyFactory.cs
& 'C:\nvm4w\nodejs\node.exe' unity/Tools/enemy-spawn-oracle/run.cjs --project 'E:/exoduser-wt/pc-unity-c01/unity' --label green
# 5) 변이 검사: 구현을 한 곳씩 일부러 틀려 검사가 잡는지 확인
& 'C:\nvm4w\nodejs\node.exe' unity/Tools/enemy-spawn-oracle/run-mutants.cjs --project 'E:/exoduser-wt/pc-unity-c01/unity'
```

## export.cjs
- 원문을 텍스트 앵커(줄 시작 접두어, 정확히 1줄 일치)로 찾아 줄 범위·블록 sha256을 `source.anchors`에 기록하고, **수정 없이 한 VM 컨텍스트에서 실행**한다(표 블록은 CX-01과 같은 것).
- VM에 밖에서 넣는 것은 `P.lv`, `OPT.diff`, `G.stage`/`_stageDiffOff`, `_DEMO_MODE`/`_DEMO_LAST_STAGE`, 테스트용 `canMv` 규칙(`open` / `blockAll` / `blockDisc`), `Math.random` 고정 수열뿐이다.
- 케이스: 결과 객체 전체, `Math.random` 소비 횟수, `canMv` 호출 목록. 비유한 좌표는 문자열 `NaN`/`Infinity`로 입력.
- `const _e={…}` 원문을 항목 단위로 파싱해 `entries`로 저장 → `gen-cs.cjs`가 필드 목록·순서·초기식에 사용(손으로 쓴 기대값 없음).

## 대조 방식 (Program.cs)
- null 여부, 모든 필드(웹 이름으로 리플렉션, double은 비트 단위; JSON이 못 담는 −0은 export가 거부), `Random()` 호출 횟수, `canMv` 호출 좌표·반지름(비트 단위).
- C#에만 값이 있고 웹에는 `undefined`인 필드는 실패(null이어야 함).
- 표 드리프트 가드: CX-01 `EnemyTables`/`EliteTables` 값을 이 oracle이 쓴 game.html의 표와 다시 대조.
