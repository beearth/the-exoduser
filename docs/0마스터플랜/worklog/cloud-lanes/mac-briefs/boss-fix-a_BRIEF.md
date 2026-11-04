# BRIEF — boss-fix-a (보스전 총괄, 2026-11-04 밤, CTO 지시: Claude 사용량 99%라 Codex 레인으로)

## 작업본·브랜치
- 작업본 `E:/exoduser-wt/codex-boss-fix-a`(NTFS, sparse: `unity`·`docs/engine`·`tools/guard.js`·`/game.html`(guard용), `MSYS_NO_PATHCONV=1`). 다른 checkout의 git은 항상 `git -C <경로>` + `set -e`.
- 브랜치 `codex/unity-boss-fix-a-20261104`, 기준 **origin/codex/unity-boss-arena-20261103 @1fa74ff82**. 세 레인(boss-fix-a/b/c)이 같은 기준에서 서로 다른 파일만 고친다 — 아래 "손댈 파일" 밖은 건드리지 않는다. 병합은 보스전 총괄이 한다.
- 손댈 파일: `unity/Assets/Exoduser/Resources/Shaders/DruidRigPixelToon.shader`, `unity/Assets/Exoduser/Runtime/NativeDruidRigPixelView.cs`, `NativeDruidRigPolicy.cs`, `NativeRigPixelPolicy.cs`(드루이드 함수만), `unity/Tools/druid-rigpixel-tests/Program.cs`. 참고: 중단된 이전 시도의 셰이더 부분 수정 diff `I:/EXODUSER-Storage/codex-takeover/boss-fix-a/partial_shader_sonnet_stopped.diff`(검증 안 됨, 참고만)
- 증거(PC 무창 1920, 드루이드 VFX 후보 874218da0 = 아레나 13064048f 포함): `I:/EXODUSER-Storage/druid-vfx-candidate/capture-1920/arena-review/`(PNG+JSON `bossRig`), 로그 `I:/EXODUSER-Storage/druid-vfx-candidate/capture-1920/Player.log` 105행.

## 금지
Core 수치·판정 수정, 카메라(피치 34°·거리 16.5·FOV) 변경, `git add -A`(`git add -- <경로>` 후 `git commit -- <경로…>`), `--no-verify`, force push·rebase·reset·stash, 창·소리 띄우기, 공용 실행기 밖 Unity 실행, **Player 실행**, python 사용(node·dotnet·PowerShell 파일로), 모든 명령 `</dev/null`, `I:/EXODUSER-Storage` 전체 재귀 검색, `taskkill /IM`(자기 PID만), 같은 검사 2회 실패 시 멈추고 보고. CRLF 파일은 줄 끝 보존(판정은 `git diff --numstat` 대 `--ignore-cr-at-eol --numstat`, `git diff --check` 쓰지 않음). 에디터 부산물(`UniversalRenderPipelineGlobalSettings.asset`, `ProjectSettings/GraphicsSettings.asset`, Lobby `.meta` 삭제, `tools/guard.baseline.json`)은 커밋하지 않는다.

## 검증
- 공용 실행기 `I:/EXODUSER-Storage/unity-jobs/bin/exo-unity.ps1 run -Worktree E:/exoduser-wt/codex-boss-fix-a -Owner codex-boss-fix-a -WaitMin 150 -Method <클래스.메서드>`로 에디터 컴파일 1회(README `I:/EXODUSER-Storage/unity-jobs/bin/README.md`; 새 워크트리는 Library 복사 방법 확인; `PortVerification.CheckCorePresence`는 `-Args '-output,<경로>'` 필요). `I:/EXODUSER-Storage/unity-jobs/HALT`가 있으면 실행하지 말고 "컴파일 미확인(HALT)". dotnet 테스트는 리포 밖 임시 csproj로.
- docs: `docs/engine/UNITY_BOSS_RIGPIXEL_DRUID_PREP_20261104.md` 끝에 자기 절 하나(a=§10.6, b=§10.7, c=§10.8). CHANGELOG는 총괄이 적는다.

## 결과
같은 폴더 `REPORT.md` 맨 위: 커밋 SHA·비강제 push 여부·원격 SHA 대조, 원인 수치, 바꾼 값 전후, 컴파일 결과, 테스트 수치, 남은 일.

## 할 일 — 드루이드 리그 픽셀 렌더 2건 (파일: `Resources/Shaders/DruidRigPixelToon.shader`, `Runtime/NativeDruidRigPixelView.cs`, `Runtime/NativeDruidRigPolicy.cs`·`NativeRigPixelPolicy.cs`(드루이드 함수만), 테스트 `unity/Tools/druid-rigpixel-tests/Program.cs`)
1. **은색 유령**: `move-slam-active.png`·`move-charge-active.png`·`bullet-cut.png`에서 P1 껍질 전체가 은색 얼룩으로 보인다. 원인: 53b411c2b의 시선 림 `half facing=saturate(dot(n,view)); fres=1-facing; rimBand=step(.55,fres)*.55+step(.78,fres)*.45; color+=(.30,.37,.46)*rimBand` — 껍질은 양면 깃털 카드라 뒷면 법선에서 facing=0 → 몸 전체가 림. 고칠 것: 양면에서도 맞도록 `facing=abs(dot(n,view))`(또는 VFACE로 법선 뒤집기), 림 임계값을 실제 외곽에만 걸리게(예: fres ≥ .80/.92 두 단), 세기 낮춤(합 ≤ .30). 카메라 채움광도 같은 facing을 쓴다. 셀 4단 유지, 디더·노이즈 금지. 목표: 공격 중에도 뿔·두개골 실루엣이 읽히고 몸 면은 원래 재질색.
2. **근평면 영구 대체**: `move-heartbeat-active.json` `pose phase23_collapse`, `projectedBoundsHeightPx 6144`, `texelScale 8`, `failed true`, 로그 `[DruidRig] existing boss fallback, once: Boss intersects capture near plane` → 옛 2D 스프라이트. 고칠 것: ① 뼈 상자(`NativeDruidRigPixelView.cs` 125~139행 근처)에 넣는 뼈를 실제 그리는 렌더러의 `SkinnedMeshRenderer.bones` 중 가중이 있는 뼈로 한정하고, 발 기준점에서 몸 높이의 2배보다 먼 뼈는 뺀다(원인 뼈 이름을 찾아 보고) ② 111행 근평면 검사에서 예외를 던지지 말고 상자를 근평면 앞쪽으로 잘라 계속 그린다. **크기·근평면 때문에 옛 2D로 떨어지는 경로 0.** 영구 `Fail`은 모델 로드·애니메이터 오류에만.
3. 테스트: 정책 함수로 뺄 수 있는 부분(뼈 거리 필터, 근평면 자르기)은 `druid-rigpixel-tests`에 케이스 추가(csproj 없으면 리포 밖 임시 csproj).

