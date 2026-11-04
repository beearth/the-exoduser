# BRIEF — boss-fix-c (보스전 총괄, 2026-11-04 밤, CTO 지시: Claude 사용량 99%라 Codex 레인으로)

## 작업본·브랜치
- 작업본 `E:/exoduser-wt/codex-boss-fix-c`(NTFS, sparse: `unity`·`docs/engine`·`tools/guard.js`·`/game.html`(guard용), `MSYS_NO_PATHCONV=1`). 다른 checkout의 git은 항상 `git -C <경로>` + `set -e`.
- 브랜치 `codex/unity-boss-fix-c-20261104`, 기준 **origin/codex/unity-boss-arena-20261103 @1fa74ff82**. 세 레인(boss-fix-a/b/c)이 같은 기준에서 서로 다른 파일만 고친다 — 아래 "손댈 파일" 밖은 건드리지 않는다. 병합은 보스전 총괄이 한다.
- 손댈 파일: `unity/Assets/Exoduser/Runtime/NativeGame.BossArenaReview.cs`, `NativeArenaReviewPolicy.cs`, 봇 입력이 다른 파일이면 그 파일의 리뷰 분기만, 테스트 `unity/Tools/druid-rigpixel-tests/Program.cs`(정책 케이스만)
- 증거(PC 무창 1920, 드루이드 VFX 후보 874218da0 = 아레나 13064048f 포함): `I:/EXODUSER-Storage/druid-vfx-candidate/capture-1920/arena-review/`(PNG+JSON `bossRig`), 로그 `I:/EXODUSER-Storage/druid-vfx-candidate/capture-1920/Player.log` 105행.

## 금지
Core 수치·판정 수정, 카메라(피치 34°·거리 16.5·FOV) 변경, `git add -A`(`git add -- <경로>` 후 `git commit -- <경로…>`), `--no-verify`, force push·rebase·reset·stash, 창·소리 띄우기, 공용 실행기 밖 Unity 실행, **Player 실행**, python 사용(node·dotnet·PowerShell 파일로), 모든 명령 `</dev/null`, `I:/EXODUSER-Storage` 전체 재귀 검색, `taskkill /IM`(자기 PID만), 같은 검사 2회 실패 시 멈추고 보고. CRLF 파일은 줄 끝 보존(판정은 `git diff --numstat` 대 `--ignore-cr-at-eol --numstat`, `git diff --check` 쓰지 않음). 에디터 부산물(`UniversalRenderPipelineGlobalSettings.asset`, `ProjectSettings/GraphicsSettings.asset`, Lobby `.meta` 삭제, `tools/guard.baseline.json`)은 커밋하지 않는다.

## 검증
- 공용 실행기 `I:/EXODUSER-Storage/unity-jobs/bin/exo-unity.ps1 run -Worktree E:/exoduser-wt/codex-boss-fix-c -Owner codex-boss-fix-c -WaitMin 150 -Method <클래스.메서드>`로 에디터 컴파일 1회(README `I:/EXODUSER-Storage/unity-jobs/bin/README.md`; 새 워크트리는 Library 복사 방법 확인; `PortVerification.CheckCorePresence`는 `-Args '-output,<경로>'` 필요). `I:/EXODUSER-Storage/unity-jobs/HALT`가 있으면 실행하지 말고 "컴파일 미확인(HALT)". dotnet 테스트는 리포 밖 임시 csproj로.
- docs: `docs/engine/UNITY_BOSS_RIGPIXEL_DRUID_PREP_20261104.md` 끝에 자기 절 하나(a=§10.6, b=§10.7, c=§10.8). CHANGELOG는 총괄이 적는다.

## 결과
같은 폴더 `REPORT.md` 맨 위: 커밋 SHA·비강제 push 여부·원격 SHA 대조, 원인 수치, 바꾼 값 전후, 컴파일 결과, 테스트 수치, 남은 일.

## 할 일 — 리뷰 봇 7기술 커버리지 (파일: `Runtime/NativeGame.BossArenaReview.cs`, `Runtime/NativeArenaReviewPolicy.cs`, 봇 입력 코드가 다른 파일이면 그 파일의 리뷰 분기만)
- 증거: 5차·874218da0 모두 보스 직행(`--unity-boss-direct 0`) Lv1 봇 + 장비 CP 1,979로 보스가 1분 안에 죽어 grab·slashCombo(또는 burrowStrike)가 안 나옴(`review.json` `FAIL_MISSING_ACTIVATIONS`).
- 고칠 것: `--unity-boss-arena-review`일 때 **목숨마다** 그 목숨에서 나올 수 있는 기술(리모델 데이터의 목숨별 기술 목록을 읽어서)이 모두 한 번씩 발동하기 전까지 봇은 공격하지 않고 회피·거리 유지만 한다(입력만, HP·위치 직접 수정 금지). 다 나오면 기존 봇 동작으로 돌아간다. edge 단계(`--unity-boss-arena-edge`)·seq 단계와 충돌하지 않게 순서를 정하고 기록한다(예: 커버리지 → edge 타격 → 다음 목숨). 무한 대기 방지: 목숨당 최대 90초 뒤에는 그냥 진행하고 `review.json`에 `coverageTimeout`을 적는다.
- 인자 없이는 기존 경로와 같아야 한다.

