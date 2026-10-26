# CX-01 적 수치 테이블 Core 데이터 + 원본 대조 (2026-10-26)

단순작업2(Sonnet 5.5)가 보스전 총괄 명세(`E:/exoduser-wt/_out/pc-cx01/SPEC.md`)대로 구현했다. 브랜치 `claude/unity-pc-c01-20261026`, 기준 `origin/claude/unity-pc-inventory-u04-20261026` tip `a48faf9eaf6ab75f4bbcc3b358daca8673700974`. Unity Editor 빌드는 하지 않았고, 검증은 standalone .NET 8 oracle이다(Unity Player 판정 아님).

## 새 파일 / API

| 파일 | 내용 |
|---|---|
| `unity/Assets/Exoduser/Runtime/Core/Combat/Enemy/EnemyTables.cs` | `static class EnemyTables`: `Hp`, `Atk`, `SpdRaw`, `Spd`, `R`, `Range`, `Poise`, `Shield` (`double[90]`), `Col`, `Cols` (`string[90]`), `Eres` (`double[120][7]`), `Rare` (`RareEnemyDef[10]`)+`FindRare(etype)`, `IsRareEtype(et)`, `DiffMul`, `DiffLvOff`, `TotalStages`, `SiToHell`, `SiToFloor` (`byte[35]`), `Stg` (`StageDef[35]`). 상수 `EtypeCount=90`, `EresRows=120`, `ElementCount=7` |
| `unity/Assets/Exoduser/Runtime/Core/Combat/Enemy/EliteTables.cs` | `static class EliteTables`: `Tiers`(`EliteTierDef[4]`), `Prob`(`double[7][3]`), `Mods`(`ModDef[31]`) |
| `unity/Tools/enemy-tables-oracle/*` | `export.cjs`(원본 추출·실행), `gen-cs.cjs`(위 두 파일 생성), `Program.cs`+`EnemyTablesTests.csproj`(.NET 대조), `RedStub/`, `run.cjs`, `run-red.cjs`, `runner.cjs`, `README.md`, `oracle.json` |
| `unity/.gitignore` | `EnemyTablesTests.csproj` 예외, `runs/` 무시 |

- 두 `.cs`는 **`gen-cs.cjs`가 `oracle.json`(원본 실행 결과)에서 생성**했다. 값을 손으로 옮기지 않았다. 기존 .NET csproj는 `Runtime/Core/*.cs`를 비재귀로 컴파일하므로 하위 폴더인 이 파일들은 기존 검사에 섞이지 않는다.
- 숫자는 `double`(웹 Number 그대로, 비트 동일), 색은 문자열(`"#dd4455"`, `"#888"` 포함). `Spd`는 C#에서 `v==0?0:Math.Max(0.2,v*1.3)`로 `SpdRaw`에서 계산한다(원본 변환식과 비트 일치 확인).
- `RareEnemyDef`/`StageDef`/`EliteTierDef`/`ModDef`는 필드 이름만 PascalCase로 바꾼 데이터 클래스이며 로직이 없다. `MOD_DEFS`는 웹에서 함수 필드 없이 `id,name,col,hell`만 가진다.

## 원본 위치 (읽기 전용)

`G:/exoduser/game.html` sha256 `4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4`, 65,693줄, repo HEAD `571954a97fef…`, 추출 당시 working tree clean. 이 파일은 타 세션이 계속 바뀌므로 줄 번호는 그 시점 값이다(oracle은 텍스트 앵커를 쓰므로 번호에 의존하지 않는다).

| 표 | 줄 범위 | 표 | 줄 범위 |
|---|---|---|---|
| `EL` | 14333 | `ETYPE_COL` | 30909-30919 |
| `ETYPE_ERES` | 14336 | `ETYPE_COLS` | 19914-19922 |
| `DIFF_LV_OFF` / `DIFF_MUL` | 9272 / 9276 | `RARE_ETYPE` | 30955-30966 |
| `CHAPTER_STAGES` | 16633-16641 | `isRareEtype` | 30967 |
| `TOTAL_STAGES` | 16642 | `ELITE_TIERS` | 31033-31037 |
| `SI_TO_HELL`+`SI_TO_FLOOR` 루프 | 16658-16666 | `ELITE_PROB` | 31041-31043 |
| `HELL_NAMES`/`HELL_THEMES`/`HELL_BOSSES` | 16677-16678 / 16679-16687 / 16688-16696 | `MOD_DEFS` | 31045-31061 |
| `STG` 루프 | 16697-16712 | `ETYPE_HP` / `ETYPE_ATK` | 30823-30836 / 30837-30846 |
| `_ETYPE_SPD_RAW` / `ETYPE_SPD` | 30847-30856 / 30858 | `ETYPE_R` / `ETYPE_RANGE` | 30859-30868 / 30870-30886 |
| `ETYPE_POISE` / `ETYPE_SHIELD` | 30887-30896 / 30900-30907 | | |

## 검사 결과

| 실행 | 결과 |
|---|---|
| RED (표 비어 있는 stub) | 1,274검사 중 **1,154 실패**(기대). 표가 비면 항목 검사 수가 줄어 총수가 다르다 |
| GREEN | **2,784 checks / 0 failures** (길이 + 항목별 비트 비교 + 문자열 + `isRareEtype` 130호출) |
| 변이(속도 하한 0.2→0.25, `Hp[0]` 변경) | 27 실패 → 검사가 민감함. 복구 후 파일은 다시 생성 |
| 회귀 | ki-slash **93/93**, poise **7/7**, auto-potion **2,438/2,438** |

결과 파일: `E:/exoduser-wt/_out/pc-cx01/runs/`. 래퍼는 없다(전역 주입 0): `EL`, `CHAPTER_STAGES`, `TOTAL_STAGES`, `HELL_THEMES`, `HELL_BOSSES`도 원본 선언을 같은 VM에서 실행했다.

## 배열 길이 불일치 (패딩 없이 그대로 보고)

| 표 | 웹 길이 | 비고 |
|---|---|---|
| `ETYPE_HP/ATK/_SPD_RAW/SPD/R/RANGE/POISE/SHIELD/COL/COLS` | 각 **90** (etype 0~89) | 10개 표 길이는 서로 일치. etype 90~99는 이 표들에 **없다** (`ETYPE_HP[95]`는 undefined) → 레어는 `RARE_ETYPE`가 따로 가진다 |
| `ETYPE_ERES` | **120** 행 × 7 | 행 수가 90과 다르다(0~119). 값은 전부 0 |
| `RARE_ETYPE` | 10 키 (90~99) | `Rare[]`에 키 순서대로 저장, `FindRare(etype)`로 조회 |
| `ETYPE_COLS` | 90 | 인덱스 20~39 **20개가 `"#888"` 자리표시**(실제 색 없음)로 웹 그대로 |
| `SI_TO_HELL`/`SI_TO_FLOOR`/`STG` | 각 35 (`TOTAL_STAGES`) | 일치 |

## ETYPE_ERES 변경 위치

| 줄 | 내용 |
|---|---|
| 14334 | 주석 (`[P,F,I,D,L,H,E]`, 0=저항없음, 0.5=50%, 1.0=면역) |
| 14336 | **유일한 선언·초기화**: 120×7을 전부 0으로 채움 |
| 31185 | 읽기: `eRes:ETYPE_ERES[etype]||[0,0,0,0,0,0,0]` (mkEn) |

`ETYPE_ERES[..]=`·`push`·`fill` 등 **변경 위치는 game.html에 없다**(정규식 grep 0건). 그래서 최종값은 전 행 0이다. (다른 HTML 사본·백업에도 같은 이름이 있으나 원본이 아니라 대조하지 않았다.)

## docs vs 코드 차이 (코드가 기준, docs는 수정하지 않음)

`docs/8.0몬스터디자인/몬스터_총관리.md`의 `RAW_*` 배열을 코드값과 자동 대조했다.

| 대상 | 결과 |
|---|---|
| `RAW_HP`, `RAW_ATK`, `RAW_SPD`(= `_ETYPE_SPD_RAW`), `RAW_POISE` | 90항목 전부 일치 |
| `RAW_R` | **13곳 불일치**: 인덱스 3(문서6/코드10), 5(8/10), 7(9/10), 8(9/10), 9(8/10), 10(9/10), 13(5/10), 27(8/10), 33(5/10), 44(8/10), 64(8/10), 73(7/10), 76(8/10) |
| `RAW_COL` | **1곳 불일치**: 인덱스 65 문서 `#556644` / 코드 `#99bb88` |
| `RANGE`, `SHIELD`, `COLS`, `ERES`, `RARE_ETYPE` 값 | 문서에 같은 배열 형태의 표가 없어 대조하지 않음(서술만 있음). `8.2레어몹디자인`은 etype 이름만 있고 hp/atk 등 수치 표가 없다 |
| `ELITE_TIERS`(배율·모디파이어 수·드롭보너스·크기)·`ELITE_PROB`·`DIFF_MUL` | `9_적AI패턴디자인.md` §7, `14밸런스` 문서와 일치 (색은 문서에 한글 이름만) |

문서 수정 제안(담당자 판단): `몬스터_총관리.md`의 `RAW_R`·`RAW_COL[65]`를 코드값으로 정정.

## 제약 준수

Codex 소유 파일(Simulation*, NativeGame*, NativeHud*)·`pc-unity-win`·G:/exoduser 작업 파일은 수정하지 않았다(game.html은 읽기 전용). 이 표들은 아직 어떤 시스템에도 연결하지 않았다(데이터만). 다음 단위 CX-02(mkEn)가 이 표를 읽는다.
