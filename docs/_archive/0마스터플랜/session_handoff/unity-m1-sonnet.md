# unity-m1-sonnet (Unity M1 HUD · RM-INT · LT-3·4 단순작업 세션) 인계 — Codex CLI용 브리프 (2026-10-28)

이 세션은 사용자 지시(2026-10-28 "이제 대부분 작업을 코덱스 시켜", "단순작업자들 다 정리하고")로 정리된다. 유니티 총괄(local_59ad835c)이 병합·배정한다. 승인 방식이 바뀌어 판정을 기다리지 않고 진행한 뒤 컨펌 목록으로 모은다(화면 판정·사용자에게 보이는 것은 승인 뒤).

## 1. 한 일 (병합 완료, 다시 하지 않는다)

| 단위 | 병합 | 내용 |
|---|---|---|
| M1 지역 HUD(진입·정화 배너, 방향 화살표, 게이트 라벨, 진행바) | unity/main `4ceb18b51` (브랜치 `claude/unity-pc-m1-hud-20261028` 1a7c96946) | `NativeRegionHud.cs`. 웹 대조 캡처 4장(위치·폭·서체 일치). 웹은 봉인 떠다니는 문구를 화면에 그리지 않아 Unity도 뺐고, 포탈 라벨은 1-1에서 게이트 나무에 가려져 보스 게이트 없는 맵에서만 그린다. 문서 `docs/engine/UNITY_M1_REGION_HUD_20261028.md` |

## 2. 브랜치별 상태와 남은 일 (전부 push됨, 아직 unity/main 병합 전)

모든 브랜치는 `unity/main`의 `cd545b813` 이후를 합친 상태다(rm-int는 cd545b813 병합 확인, lt34·hud-webgpu는 그 직전 unity/main까지). 병합 전에 최신 unity/main을 다시 merge하고 빌드 1회로 오류 0을 확인한다.

### 2-A. RM-INT 1단계 — `claude/unity-pc-rm-int-20261028` (tip `f1af4da10`, worktree `E:\exoduser-wt\pc-unity-rm-int`)
리모델 3D(RM-1 1-1 필드)를 `--remodel3d` 스위치로 연결. **Core 변경 0**, 꺼짐이면 옛 2D 경로와 같은 값. 문서 `docs/engine/UNITY_RM_INT_RUNTIME_HOOK_20261028.md`(결정 기록·좌표·스위치·검증).
- 새 파일: `Runtime/NativeRemodel3D.cs`(`NativeRemodel3D` 좌표 한 곳 + 공개 API `RemodelWorld.ToWorld/GroundHeight/GroundNormal/ToCore`), `NativeGame.Remodel3D.cs`(씬 additive 로드·LOOK-001 리그·빌보드·조준), `NativeGame.Remodel3DCheck.cs`(`--unity-rmint-check`). 기존 파일 한 줄 훅: `NativeGame.cs`(Point/ToGUI/조준/IsLootOnScreen), `NativeGame.StageFlow.cs`(`Remodel3DSync()`), 뷰 5곳의 `Point` 위임, `Editor/PortVerification.cs`(`-remodel-scenes 1`일 때만 RM1_Slice 씬을 빌드에 포함).
- 검증 끝난 것: Roslyn 0 오류, 빌드 errors 0, **Core 틱 기록 일치 PASS**(1,800틱, `logHash` 11640a5da4a88c94 = 11640a5da4a88c94, 기록 180개 동일), 3D 캡처에서 캐릭터가 2D와 같은 위치·크기(`E:\exoduser-wt\_out\rmint-batch\side\`), 1차 m1-check 꺼짐/켜짐 20/20(**격리 도입 전이라 사용자 세이브를 건드린 실행** — 다시 돌릴 때는 아래 §3의 격리 실행기만).
- **남은 검증(병합 조건, 유니티 총괄 지시)**: 최신 unity/main 병합본으로 빌드 1회 + **격리 m1-check 꺼짐 1회(20/20 이상)**, 켜짐은 참고. 3D는 기본 꺼짐이라 꺼짐 결과가 병합 조건이다.
- 남은 일(병합 뒤): ① VFX 연결 줄(임펙트 총괄 요청): `VfxBridge.Bind(sim)`·틱마다 `Pump()`, `DispatchFeedback`의 `kiVfx?.Handle(e)`, `--unity-vfx-check` 분기. **VFX 클래스가 unity/main에 병합된 뒤에** `--remodel3d` 한정으로 넣는다(없으면 컴파일이 깨진다). 임펙트 총괄이 병합 알림을 준다. ② 2단계: A1 아레나(`RM1_Arena`)·RM-3/2/4를 같은 훅(`StageFlowSyncViews`)에 연결. ③ 맵 총괄 판정(걷기·충돌 일치, 이동 경로 비교는 후속)·디자인총괄 판정(톤)은 승인 항목이지 병합을 막지 않는다. ④ 스프라이트 재질(조명 받는 `SpriteLit3D`)·그림자·가림·성능(`FindObjectsByType<SpriteRenderer>` 매 프레임)은 이후 단계.
- RM-1 좌표·카메라 근거: 브랜치 `claude/unity-pc-rm1-20261027`(3c102aae7)의 `docs/engine/UNITY_RM1_SLICE_20261028.md` 맨 끝 "Core → 월드 좌표 변환". 지형은 타일 x48~152·y126~200 창만 덮고, 걷기·충돌 비교는 x60~140·y138~192 안에서만 판정. 구운 씬은 아직 `RM1_CameraRig`로 다시 굽기 전이라 코드가 이름으로 리그를 찾는다.

### 2-B. LT-3 · LT-4 · HUD 영문 부제 — `claude/unity-pc-lt34-20261028` (tip `9b1847712`, worktree `E:\exoduser-wt\pc-unity-lt34`)
문서 `docs/engine/UNITY_LT34_LOBBY_LABELS_20261028.md`.
- LT-3(로비 왼쪽 위 버전 표기 이중·옛 v0.7.5): 원인은 `DrawPatchNotesLauncher`가 `NativeLobbyBuildLabels` 오버레이와 같은 자리에 패치노트 첫 항목 글자를 한 번 더 그린 것 → 런처는 클릭 영역만 남김. 데이터 동기화: `Resources/Data/release_web.json` = main `release-version.json`(0.7.9 · 2026-10-28 · ea-full), `patch_notes.json` = main `patch-notes.js`(0.7.9·0.7.8·0.7.0).
- LT-4("이 Mac에 저장"): 새 `NativePlatformLabel.ThisDevice`(macOS 이 Mac, Windows 이 PC, 그 외 이 기기) → `NativeLobby.CharacterStore.cs` 캐릭터 카드·안내 문구와 `NativePauseMenu.cs` 저장 문구 4곳.
- HUD 조건(맵 총괄 4ceb18b51 조건부 PASS): 영문 부제(`NORTHEAST · LIGHTNING`, `REGION PURGED · 1 / 4`)가 웹보다 흐림 → `NativeRegionHud.FitBoldLine`이 Bold로 그리되 웹 DOM이 잰 폭(Normal 글자폭 + .32em)을 자간·크기로 유지. **글꼴 종류는 바꾸지 않는다**(LT-6 결정: 웹 그대로 PASS, 명조 전환은 별도 과제).
- 테스트 하네스: `NativeGame.RegionHudCapture.cs`(`--unity-region-hud-capture`, A 진입 배너 / B 정화 배너 / C 화살표 / D 게이트 라벨+진행바 2/4 + `E-lobby.png`)와 실험용 `NativeGuiCapture.cs`(batchmode에서 GUI를 RenderTexture로 돌리는 시도, **OnGUI Repaint가 batchmode에서 돌지 않으면 효과 없음 — 검증 못 함, 실험으로만 둔다**).
- **남은 검증**: LT-3(버전 표기 한 겹·0.7.9)·LT-4("이 PC")·HUD 영문 부제를 **1x 크롭**으로 웹과 나란히. 웹 기준 캡처가 이미 있다: `E:\exoduser-wt\_out\m1hud\web\A-banner-enter.png`·`B-banner-purge.png`(1920×1080), 웹 장면 스크립트 `E:\exoduser-wt\_out\m1hud\webscenes.mjs`. **IMGUI 화면은 무창 batchmode에서 완전한 검은 화면**이라(2026-10-28 실측: `ScreenCapture` 결과 전부 0) 개발툴이 만드는 "숨은 Windows 데스크톱 방식(창 0, OnGUI 정상)"이 공용 실행기 기본이 된 뒤 그것으로 찍는다. 화면 판정은 승인 게이트(컨펌 목록).

### 2-C. 웹(WebGPU) HUD 스킬 바 회색 띠 — `claude/unity-pc-hud-webgpu-20261028` (tip `a56a40d0d`, worktree `E:\exoduser-wt\pc-unity-hudweb`)
문서 `docs/engine/UNITY_HUD_WEBGPU_READBACK_20261028.md`. 개발툴 DT-16이 찾은 결함(`I:\EXODUSER-Storage\devtools\web\compare_hud_pc_vs_web.png`).
- 원인: `NativeHud.BuildLabelCleanBar()`가 `Graphics.Blit` 뒤 `ReadPixels`(동기 GPU Readback)로 복사본을 만드는데, WebGL/WebGPU는 이게 안 돼 빈 텍스처가 되고 `GUI.color .8`이 곱해져 회색 띠가 된다. 같은 Readback이 `NativeInventoryWebLayout.BakeKnightLit()`에도.
- 수정: 새 `NativeCpuPixels.UseCpu(texture)`(WebGL 플레이어이고 `isReadable`일 때만 참) → 참이면 `GetPixels32()`, 아니면 **기존 Blit 경로 그대로**(데스크톱 코드 경로 불변). 소스 텍스처 `ui_bar_only.png.meta`·`inventory/knight.png.meta`에 `isReadable: 1`(knight는 60바이트 스텁이던 meta를 같은 형식의 전체 블록으로).
- **남은 검증**: ① WebGPU 확인: 이 브랜치로 웹 빌드(개발툴 DT-16 쪽)를 돌려 스킬 바 회색 띠가 사라지고 키 글자가 지워진 바가 나오는지, `compare_hud_pc_vs_web.png` 구도로 재비교. ② PC 화면 불변: PC 1x 캡처 전후 비교(스킬 바 크롭이 픽셀 동일해야 함). 코드 경로가 그대로라 같아야 하지만 증명은 안 했다.
- 같은 결함이 남은 곳(고치지 않음): `NativeGame.WorldDrops.cs` `StripBackground`(드랍 아이템 배경 제거, Blit+ReadPixels, 아이템 텍스처가 많아 읽기 가능으로 바꾸기엔 범위가 큼), `NativeHud.cs` `Pixels(RenderTexture)`(QA 프로브), 캡처 하네스.

## 3. 실행 방법 (Unity는 항상 공용 실행기로만)

**Unity 에디터·플레이어·Playwright를 직접 띄우지 않는다**(사용자 실제 세이브 `LocalLow\ForDearGamers` 오염 사고 이력). 공용 실행기 `unity/Tools/devtools/exo-unity.ps1`(README 같은 폴더)이 예약 큐·잠금·`--unity-qa-sandbox`·USER_SAVE 전후 비교·창 0·무음을 맡는다.
```powershell
$x = 'E:\exoduser-wt\<worktree>\unity\Tools\devtools\exo-unity.ps1'
& $x reserve -Owner <이름> -Note '...' -TtlMin 300
& $x build  -Worktree E:\exoduser-wt\<worktree> -Owner <이름> -KeepReservation -WaitMin 300 -TimeoutSec 1800 -Args @('-output',$b,'-receipt',"$b\build-receipt.json"[,'-remodel-scenes','1'])
& $x player -Exe "$b\EXODUSER-Unity.exe" -Args @('--unity-m1-check','-output',$d,'-screen-width','1600','-screen-height','900') -AllowPlayer -Owner <이름> -KeepReservation -WaitMin 300 -TimeoutSec 1200
& $x unreserve -Owner <이름>
```
- 내가 쓴 러너(저장소 밖, 참고): `E:\exoduser-wt\_out\rmint\run-rmint3.ps1`·`run-batch.ps1`·`run-merge.ps1`(예약 한 번으로 빌드·플레이어 여러 번). `-Args`는 PowerShell 배열로 넘긴다(`-File` 모드에서는 쉼표 문자열). 한글이 든 `.ps1`은 UTF-8 BOM.
- 코드 컴파일 확인(Unity 없이, 빠름): `E:\exoduser-wt\_out\rmint\roslyn.sh <unity/Assets 경로> <out.dll>` — 비-Editor `.cs` 전부를 플레이어 빌드의 `EXODUSER-Unity_Data\Managed` DLL(Assembly-CSharp 제외) 대상으로 `csc`(dotnet SDK Roslyn)로 컴파일. "오류 0"이 목표. 빌드 한 번(약 3~5분)보다 훨씬 싸다.
- 플레이어 하네스: `--unity-rmint-check [--remodel3d] -output <dir>`(Core 틱 로그+3D/2D 캡처), `--unity-m1-check -output <dir>`(20단계), `--unity-region-hud-capture -output <dir>`(배너·화살표·게이트 라벨·진행바). 실행기가 `--unity-qa-sandbox`를 붙인다.
- 출력은 `E:\exoduser-wt\_out\...` 또는 `I:\EXODUSER-Storage\...`. C 드라이브에 대용량 산출물 금지. 실행 전 Unity 0개·커밋 여유(실행기 기본 20GB, 플레이어 8GB)를 실행기가 확인한다.
- 웹 대조 캡처(Playwright, 헤드리스·무음): `E:\exoduser-wt\_out\m1hud\webscenes.mjs`(origin/main game.html을 개발 서버 3333에 주입, 같은 위치·몹 없음·같은 클리어 집합). 브라우저 프로세스가 프로필을 잡고 남는 일이 있어 프로필은 실행마다 새 폴더, 끝나면 정리.

## 4. 금지·주의 (이 세션이 실제로 겪은 것)

- Core(`unity/Assets/Exoduser/Runtime/Core`) 수정 금지. 표시에 필요한 읽기 전용 값만 쓴다. `Remodel/Common`·`Rendering/` 공용 자산 수정은 유니티 총괄에게 먼저 묻는다.
- UI는 웹 그대로(디자인 확정): 서체·색·위치를 Unity 쪽 취향으로 바꾸지 않는다. 웹 서체가 디자인 규칙(산세리프 금지)에 어긋나면 디자인총괄이 웹에서 고치고 Unity가 따라간다(예: 웹 게이트 라벨 `bold 13px "Noto Sans KR"`는 "디자인총괄 검토 후보"로 문서에 적어 둠).
- `git add -A`·force push·rebase·reset 금지. 경로를 지정해 커밋하고 브랜치에 비강제 push. `G:\exoduser` 메인 폴더에서 커밋하지 않는다. 엔진 코드는 `unity/main` 줄기만(main에 `godot/`·Unity 코드를 넣지 않는다).
- 실패하면 원인을 고친 뒤 1회만 다시 돌리고, 같은 실패가 2번이면 멈추고 보고한다. 빌드·플레이어를 동시에 두 개 돌리지 않는다(PC 메모리 부족, 커밋 여유 20GB 미만이면 Unity 필요 없는 일부터).
- 무창·무음: `-popupwindow`·`-screen-fullscreen`·`-nographics`·Playwright `headless:false` 금지(실행기가 거부). 실행 뒤 Unity 프로세스가 남지 않았는지 확인.
- 새 문구가 생기면 번역 목록 규칙(`docs/16번역·로컬라이제이션/번역대상_전체목록.md`)을 따르되 Unity 전용 문구는 총괄 판단.
- 이 repo의 로컬 git 팩이 손상돼 있다(`git-pack-corruption`): 전체 체크아웃이 실패하므로 worktree는 `git worktree add --no-checkout` + `git sparse-checkout set unity docs/engine tools` + `git read-tree HEAD` + `git checkout HEAD -- unity docs/engine tools game.html`로 만든다(`game.html`은 pre-commit guard가 요구). 커밋 뒤 `tools/guard.baseline.json`이 바뀌어 있으면 `git checkout --`로 되돌린다. worktree 안에서 `Library`가 새로 만들어지면 첫 임포트가 길다.
- PowerShell로 프로세스를 죽이는 명령에 자기 자신의 명령줄이 걸리지 않게 스크립트 파일로 실행한다.

## 5. 보고

작업 단위가 끝나면 결과·커밋 SHA를 유니티 총괄(local_59ad835c)에게 SendMessage, 화면 판정이 필요한 것은 컨펌 목록으로(총괄이 올림). 보고는 한국어.
