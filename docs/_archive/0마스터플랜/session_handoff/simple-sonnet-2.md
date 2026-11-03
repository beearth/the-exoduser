# 단순작업2 인계 — 2026-10-26 밤

- 세션: 단순작업2 (Sonnet 5.5, id 접두사 `f5128d34`). 소속 = **보스전 총괄 전속** `local_a98acebe-ea98-4dda-9441-d10b1c7622ed`. 지시는 총괄 세션 메시지로만 받는다(맥북 총괄 `local_f25393ea-f5e3-45f1-80fa-c16e9daa4c6c`, 전체총괄 `local_a65bb55a-bb3e-4c4a-a93d-412fc163bd80`, 디자인 총괄 `local_a1efbc31-1a15-4010-a047-552782aa3c3e`).
- 진행 중인 단위: **없음**. 다음은 보스전 총괄이 CX-02(mkEn 전체, 명세 `E:/exoduser-wt/_out/pc-cx02/SPEC.md`)를 재개 메시지와 함께 보낸다. 보내기 전에는 시작하지 않는다.
- 언어: 채팅은 전부 한국어. 보고는 `================= 작업보고 <단위> =================` ... `================= 끝 =================` 블록, 경계선 밖 글자 금지, 짧게(커밋 SHA, 새 파일, 검사 수와 RED→GREEN, 차이/미확인).

## 최근 완료 (커밋 기준)
| 단위 | 결과 |
|---|---|
| A21 수정·A22·A24·A26·B11 | 맥북 총괄이 인수·커밋 (0eb95c2e4, 98ed00497, 6c8ed9d91, 9ec4a3274, 96de4afa1). 누적 브랜치 `claude/unity-pc-inventory-u04-20261026` |
| B03 | 배정 철회. 진행 메모 `E:/exoduser-wt/_out/pc-b03-core1/PROGRESS.md`(repo 파일 없음) |
| B05 | 단순작업4가 인수. 메모 `_out/pc-b05-extract/PROGRESS.md` |
| **CX-01** | 브랜치 `claude/unity-pc-c01-20261026` tip **`80ea201b4`**, 보드 main `b3d19fc58`. `Runtime/Core/EnemyTables.cs`·`EliteTables.cs`(+.meta, 평면), oracle `unity/Tools/enemy-tables-oracle/`, 보고서 `docs/engine/UNITY_CX01_ENEMY_TABLES_20261026.md`. 2,784/0 (RED 1,154 실패), 변이 27 실패 |

## 작업 브랜치와 worktree
- `E:/exoduser-wt/pc-unity-c01` = `claude/unity-pc-c01-20261026`(sparse: `/unity/`, `/docs/engine/`, `/tools/guard*`, `/game.html`). 기준은 `origin/claude/unity-pc-inventory-u04-20261026` tip `a48faf9ea`. 다음 단위(CX-02)는 이 브랜치에서 이어가거나 총괄이 지정하는 새 브랜치를 쓴다.
- **`E:/exoduser-wt/pc-unity-win`은 건드리지 않는다**(맥북 총괄 누적 브랜치).
- 원본 읽기 전용: `G:/exoduser/game.html`(타 세션이 계속 편집 → 줄 번호는 시점 값, 앵커 텍스트로 찾고 SHA·HEAD를 기록). Codex 소유 `Simulation*`, `NativeGame*`, `NativeHud*`는 수정 금지(연결은 patch+INBOX 요청).
- 산출 폴더: `E:/exoduser-wt/_out/pc-cx01/`(SPEC.md, runs/). 새 단위는 `_out/pc-cx02/`.

## 커밋·push 방법
1. 브랜치 커밋: 경로 지정 `git add -- <경로>` → `git commit`(끝에 `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`) → `git push origin <브랜치>`(비강제, merge 금지). 첫 push만 `-u`.
2. pre-commit guard(`tools/guard.js`)가 worktree에 `game.html`을 요구한다. sparse worktree에는 `/game.html`을 sparse 파일에 추가(`MSYS_NO_PATHCONV=1` 필수, 없으면 `C:/Program Files/Git/game.html`로 잘못 들어감 → `git rev-parse --git-path info/sparse-checkout` 파일을 직접 고치고 `git sparse-checkout reapply`). 가드 통과 후 바뀐 `tools/guard.baseline.json`은 `git checkout --`로 되돌려 커밋에 넣지 않는다. 가드를 우회(`--no-verify`)하지 않는다.
3. main에 docs를 올릴 때(보드 등): `G:/exoduser` 인덱스는 쓰지 않는다. `MSYS_NO_PATHCONV=1 git worktree add --detach E:/exoduser-wt/<이름> origin/main` → 파일 1개만 수정 → `git add -- <경로>` → commit → `git push origin HEAD:main`(비강제). 지우기 전 PowerShell `Get-ChildItem -Recurse -Force -Attributes ReparsePoint`로 reparse point 0 확인 후 `git worktree remove --force`.
4. 새 .cs에는 `.cs.meta`(`fileFormatVersion: 2` + `guid: <무작위 32hex>`)를 같이 추가한다.

## 검증 방식 (B11·CX-01에서 확정)
- Node VM oracle: 원본 game.html 줄을 텍스트 앵커로 추출(첫 줄 접두어가 정확히 1줄 일치해야 함), 수정 없이 VM 실행 → `oracle.json`(소스 SHA·줄 범위·블록 SHA 기록) → C#과 .NET 8 콘솔 대조. 본보기 `unity/Tools/auto-potion-oracle/`(함수·프레임), `unity/Tools/enemy-tables-oracle/`(표). 손으로 쓴 기대값 금지. RED(빈 stub `-p:Red=true`) → GREEN 기록, 변이 검사로 민감도 확인.
- 기존 .NET csproj는 `Runtime/Core/*.cs`를 **비재귀**로 컴파일 → Simulation에 붙는 코드와 공용 데이터는 `Runtime/Core/` 바로 아래(평면). 하위 폴더 금지.
- 실행 스크립트는 프로젝트 폴더에서 돌린다(`runner.cjs`가 cwd=그 폴더, `NuGet.Config`/`global.json` 필요). `Comparison/FirstPractice/SkillUi` 3개 csproj는 NuGet.Config가 없어 복원 오류(NU1100)로 빌드 불가(환경 문제, 이미 2회 확인 → 다시 시도하지 않음).
- 같은 실패 2회면 멈추고 원인+원로그 경로를 보고. 통과한 검사는 다시 돌리지 않는다.
- 이름 충돌 주의: `NativeBossBar.cs`에 private 중첩 `StageDef`가 있어 Core 쪽은 `EnemyStageDef`로 개명함.

## 금지·주의 (사용자 규칙)
- `git add -A`, force push, history rewrite, merge, stash/reset/branch 전환 금지. 타 세션 WIP는 읽기/쓰기/stage 금지.
- 창·이미지·폴더를 자동으로 열지 않는다(start/explorer 금지, 경로만 보고). 자동 브라우저/캡처는 headless+음소거, 캡처 창은 (5120,0) NOACTIVATE.
- 게임 UI에 이모지·기본 산세리프 금지(Hell Gothic). 시각 작업은 완료 시 캡처 경로를 디자인 총괄에도 보낸다. 디자인 규칙 의문은 디자인 총괄에 문의.
- 게임 표시 텍스트를 추가하면 `번역대상_전체목록.md` 등록(번역 규칙). 코드 수치가 docs와 다르면 코드가 기준, docs는 총괄 지시 없이 고치지 않는다.
- 메시지 상한: 사용자가 마지막으로 입력한 뒤 다른 세션에 10건까지. 꼭 필요한 대상에게만.

## 환경 팁
- 셸은 Git Bash: `rm` 거부됨 → `mv`로 `_out/stray`에 치움. 여러 줄/따옴표 많은 heredoc이 깨지면 Write 도구로 파일 작성. `python3 -` heredoc은 이 환경에서 멈추니 쓰지 않는다. node는 `C:/nvm4w/nodejs/node.exe`, dotnet은 `C:/Program Files/dotnet/dotnet.exe`.
- 서버 필요 시 `C:\nvm4w\nodejs\node.exe server.cjs`(포트 3333, python http.server 금지). Playwright 서버는 쓴 뒤 Get-CimInstance로 종료.

## 열린 항목 (결정은 총괄/사용자)
- CX-01 보고서 §docs 차이: `몬스터_총관리.md`의 `RAW_R` 13곳·`RAW_COL[65]`가 코드와 다름(docs 수정은 별도 지시 대기).
- 보드 main의 CX-01 행에는 브랜치 SHA `8faade542`가 적혀 있고 실제 tip은 `80ea201b4`(갱신 요청 시 보드만 수정).
- B11: 정식 플레이에서 웹이 안 그리는 떠오르는 텍스트는 그대로 안 그림(디자인 총괄 확인). 보이게 하는 안은 B11 문서 §0-1 열린 질문.
- 이식 연결: CX-01 표는 어느 시스템에도 연결되지 않음(데이터만). 연결은 CX-02 이후 patch+INBOX.
