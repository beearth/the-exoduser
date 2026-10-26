# 적 수치 테이블 원본 대조 (CX-01 oracle)

`Runtime/Core/Combat/Enemy/EnemyTables.cs`, `EliteTables.cs`(웹 `ETYPE_*`, `RARE_ETYPE`, `ELITE_*`, `MOD_DEFS`, `DIFF_*`, `SI_TO_*`, `STG`)를 **원본 game.html 선언을 실제로 실행한 결과**와 대조하는 offline .NET 검사다. Unity Player/Editor 검증이나 게임 전체 판정이 아니다. 손으로 옮긴 기대값도, 손으로 옮긴 C# 값도 없다(C# 값은 `gen-cs.cjs`가 같은 실행 결과에서 생성).

```powershell
# 1) 원본 실행 → oracle.json (Node VM, game.html 읽기 전용)
& 'C:\nvm4w\nodejs\node.exe' unity/Tools/enemy-tables-oracle/export.cjs --source 'G:/exoduser/game.html'
# 2) 같은 oracle.json에서 C# 데이터 생성
& 'C:\nvm4w\nodejs\node.exe' unity/Tools/enemy-tables-oracle/gen-cs.cjs
# 3) RED: 테이블이 빈 모양(RedStub)인 구현에 대해 전부 대조 → 실패해야 함
& 'C:\nvm4w\nodejs\node.exe' unity/Tools/enemy-tables-oracle/run-red.cjs --project 'E:/exoduser-wt/pc-unity-c01/unity' --label red
# 4) GREEN: 실제 EnemyTables.cs / EliteTables.cs
& 'C:\nvm4w\nodejs\node.exe' unity/Tools/enemy-tables-oracle/run.cjs --project 'E:/exoduser-wt/pc-unity-c01/unity' --label green
```

## export.cjs가 하는 일

- 원문을 **텍스트 앵커**(줄 시작 접두어, 정확히 1줄과 일치해야 함)로 찾고, 줄 범위·블록 sha256·첫 줄을 `oracle.json`의 `source.anchors`에 기록한다(줄 번호를 믿지 않는다). 앵커가 0개/2개 이상이면 오류로 멈춘다. `--expect-source-sha <sha256>`로 파일 해시 불일치 시 거절할 수 있다.
- 문장 블록은 **`vm.Script`로 컴파일이 되는 첫 줄**까지 늘려 끝을 정하고(원문 주석 포함 그대로), 루프 블록(`SI_TO_HELL`+`SI_TO_FLOOR`, `STG`)은 첫 열의 `}`까지다.
- 실행하는 원문 블록(전부 한 VM 컨텍스트에서 **수정 없이 순서대로**): `EL`, `CHAPTER_STAGES`, `TOTAL_STAGES`, `HELL_NAMES`, `HELL_THEMES`, `HELL_BOSSES`, `SI_TO_HELL`/`SI_TO_FLOOR` 루프, `STG` 루프, `ETYPE_HP`, `ETYPE_ATK`, `_ETYPE_SPD_RAW`, `ETYPE_R`, `ETYPE_RANGE`, `ETYPE_POISE`, `ETYPE_SHIELD`, `ETYPE_COL`, `ETYPE_COLS`, `ETYPE_ERES`, `RARE_ETYPE`, `ELITE_TIERS`, `ELITE_PROB`, `MOD_DEFS`, `DIFF_MUL`, `DIFF_LV_OFF`, `ETYPE_SPD`(변환식 포함), `isRareEtype`(0~129 전부 호출).

## 최소 래퍼

**전역 주입이 없다.** 명세가 예시로 든 `TOTAL_STAGES`, `EL`, `CHAPTER_STAGES`, `HELL_THEMES`, `HELL_BOSSES`는 래퍼로 흉내 내지 않고 원본 선언 자체를 위 목록처럼 먼저 추출해 같은 VM에서 실행한다(빈 전역에서 시작). 이 선언들은 `STG`/`SI_TO_HELL` 루프의 입력이다.

## 대조 방식 (Program.cs)

- 숫자 표는 길이 1검사 + 항목마다 1검사, **double은 비트 단위 동일**(`BitConverter.DoubleToInt64Bits`). 문자열(색·이름)은 서수 비교. 길이가 다르면 길이 검사가 실패하고 남은 항목은 "missing"으로 실패 처리한다(패딩 없음).
- `ETYPE_SPD`는 C#에서 `SpdRaw`로부터 `v==0?0:Math.Max(0.2,v*1.3)`로 계산하고 JS가 계산한 값과 비트 대조한다.
- `RARE_ETYPE`는 키별 7개 필드, `isRareEtype`는 원본 함수를 0~129에 대해 호출한 결과와 대조한다. `ETYPE_ERES`는 120행×7열 전부를 항목별로 대조한다.

## 실행 기록

- `RED`(`RedStub/EnemyTablesStub.cs`, 빈 표): **1,274검사 중 1,154 실패**(기대 실패. 표가 비어 있으면 항목 검사 수 자체가 줄어든다).
- `green-01`: **2,784 checks / 0 failures**.
- 변이 검사(구현 상수를 일부러 바꿈): 속도 하한 0.2→0.25, `Hp[0]` 32→…11 → **2,784 중 27 실패**(검사가 실제로 민감함). 변이 후 파일은 `gen-cs.cjs`로 다시 생성해 복구.
- 회귀(같은 worktree, 기존 oracle): ki-slash **93/93**, poise **7/7**, auto-potion **2,438/2,438**.
- 결과 파일: `E:/exoduser-wt/_out/pc-cx01/runs/{red,green-01,mutation}.{json,log}`, `reg-*`.
