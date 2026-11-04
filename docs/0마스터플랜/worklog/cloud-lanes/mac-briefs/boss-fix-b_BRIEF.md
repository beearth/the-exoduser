# BRIEF — boss-fix-b (보스전 총괄, 2026-11-04 밤, CTO 지시: Claude 사용량 99%라 Codex 레인으로)

## 작업본·브랜치
- 작업본 `E:/exoduser-wt/codex-boss-fix-b`(NTFS, sparse: `unity`·`docs/engine`·`tools/guard.js`·`/game.html`(guard용), `MSYS_NO_PATHCONV=1`). 다른 checkout의 git은 항상 `git -C <경로>` + `set -e`.
- 브랜치 `codex/unity-boss-fix-b-20261104`, 기준 **origin/codex/unity-boss-arena-20261103 @1fa74ff82**. 세 레인(boss-fix-a/b/c)이 같은 기준에서 서로 다른 파일만 고친다 — 아래 "손댈 파일" 밖은 건드리지 않는다. 병합은 보스전 총괄이 한다.
- 손댈 파일: 새 `unity/Assets/Exoduser/Editor/BossArenaLookShot.cs`(+.meta), `unity/Assets/Exoduser/Resources/Arena8b/Ground.shader`, `unity/Assets/Exoduser/Runtime/NativeArena3DView.cs`·`NativeArena3DView.Materials.cs`, 아레나 조명 분기 코드(9f5c88db5가 고친 곳, `git show 9f5c88db5 --stat`로 확인)
- 증거(PC 무창 1920, 드루이드 VFX 후보 874218da0 = 아레나 13064048f 포함): `I:/EXODUSER-Storage/druid-vfx-candidate/capture-1920/arena-review/`(PNG+JSON `bossRig`), 로그 `I:/EXODUSER-Storage/druid-vfx-candidate/capture-1920/Player.log` 105행.

## 금지
Core 수치·판정 수정, 카메라(피치 34°·거리 16.5·FOV) 변경, `git add -A`(`git add -- <경로>` 후 `git commit -- <경로…>`), `--no-verify`, force push·rebase·reset·stash, 창·소리 띄우기, 공용 실행기 밖 Unity 실행, **Player 실행**, python 사용(node·dotnet·PowerShell 파일로), 모든 명령 `</dev/null`, `I:/EXODUSER-Storage` 전체 재귀 검색, `taskkill /IM`(자기 PID만), 같은 검사 2회 실패 시 멈추고 보고. CRLF 파일은 줄 끝 보존(판정은 `git diff --numstat` 대 `--ignore-cr-at-eol --numstat`, `git diff --check` 쓰지 않음). 에디터 부산물(`UniversalRenderPipelineGlobalSettings.asset`, `ProjectSettings/GraphicsSettings.asset`, Lobby `.meta` 삭제, `tools/guard.baseline.json`)은 커밋하지 않는다.

## 검증
- 공용 실행기 `I:/EXODUSER-Storage/unity-jobs/bin/exo-unity.ps1 run -Worktree E:/exoduser-wt/codex-boss-fix-b -Owner codex-boss-fix-b -WaitMin 150 -Method <클래스.메서드>`로 에디터 컴파일 1회(README `I:/EXODUSER-Storage/unity-jobs/bin/README.md`; 새 워크트리는 Library 복사 방법 확인; `PortVerification.CheckCorePresence`는 `-Args '-output,<경로>'` 필요). `I:/EXODUSER-Storage/unity-jobs/HALT`가 있으면 실행하지 말고 "컴파일 미확인(HALT)". dotnet 테스트는 리포 밖 임시 csproj로.
- docs: `docs/engine/UNITY_BOSS_RIGPIXEL_DRUID_PREP_20261104.md` 끝에 자기 절 하나(a=§10.6, b=§10.7, c=§10.8). CHANGELOG는 총괄이 적는다.

## 결과
같은 폴더 `REPORT.md` 맨 위: 커밋 SHA·비강제 push 여부·원격 SHA 대조, 원인 수치, 바꾼 값 전후, 컴파일 결과, 테스트 수치, 남은 일.

## 할 일 — 아레나 실조명 에디터 촬영 도구 + 바닥 밝기 재조정 (파일: 새 `Editor/BossArenaLookShot.cs`(이름 확인, `TmpGroundShot`과 겹치지 않게), `Resources/Arena8b/Ground.shader`, `Runtime/NativeArena3DView*.cs`, 아레나 조명 코드(`NativeGame.HellLighting.cs`의 아레나 분기 등 9f5c88db5가 고친 곳))
1. 증거: 바닥 Y(Rec.601) 측정 — 874218da0 `move-slam-active.png` 7.5/7.5/9.3, `move-heartbeat-active.png` 11.1/8.3/9.1, 5차(51ad581ed) 116~137. 목표 Y **70~80**, 흑갈·적갈, 채도 ≤ .30(디자인총괄 B1). 9f5c88db5(톤 `_Tint .66/.56/.50`·`_Sat .62`·`_Flat .45`, 아레나 직사광 ×.65·피치 48°, 환경광 ×.80, 횃불 4개)와 13064048f(이음매 교차 흙 노출 제거) 이후 바닥이 거의 검다. 원인을 먼저 수치로 찾는다(그림자 감쇠가 바닥 전체에 걸리는지 — 피치 48°에서 숲 벽 그림자, `_Dark` 값, 바닥 셰이더 환경광이 상수 .08뿐인 점 등).
2. **에디터 촬영 도구**: 에디터 batch 정적 메서드로 런타임과 같은 코드 경로(`NativeArena3DView` 생성·재질·아레나 조명 분기·횃불)를 세우고, 런타임 카메라와 같은 34°·거리 16.5·FOV 46.9453·1920×1080으로 오프스크린 렌더한 PNG와 바닥 영역 Y 측정 JSON을 `-output` 경로에 쓴다. 이 도구는 리포에 남긴다(Editor 전용, 빌드 미포함). 런타임 코드를 바꾸지 않고 재현이 안 되면 그 이유를 보고한다.
3. 바닥 Y 70~80이 되도록 조명·톤을 다시 맞춘다(먼 적·보스·영웅 밝기 유지가 우선 — 전체 노출을 올려 맞추지 말고 바닥 그림자·환경광·톤을 고친다). 격자·반복 무늬 0 유지. 전후 PNG와 수치를 `G:/exoduser/tmp/design-review/20261104_boss_arena_preview6/look/`에.

