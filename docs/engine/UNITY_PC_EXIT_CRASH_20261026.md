# Unity Player 종료 크래시 조사 (PC-EXITCRASH, 마스터 보드 E05 차단) — 2026-10-26

조사 전용. 코드 수정·커밋 없음. 산출물: 이 문서, `fix.patch`(실험용 초안), `diag/`.

## 1. 판정

| 항목 | 판정 |
|---|---|
| Codex 기존 결함 / PC 변경 | **Codex tip 그대로 빌드도 재현 → PC 변경이 원인이 아님.** 이 크래시는 Codex tip(`b674ebce4`)·PC A13·A14 빌드·QA 빌드 모두에서 같은 위치로 난다 |
| 하드웨어/드라이버 가능성 | **낮음.** 오류 모듈이 드라이버·커널이 아니라 `UnityPlayer.dll`, 12건 모두 **같은 오프셋 `+0x107a81`**, 스택 프레임에 드라이버 없음, BSOD(10-26) 전인 10-24 21:22에도 같은 오프셋. 무작위 하드웨어 오류는 같은 명령 주소에서 반복되지 않는다 |
| 성격 | 종료 마지막 단계(Mono 해제·`CodeReloadManager destroyed` 이후)에서 `UnityPlayer.dll` 내부의 **널 객체 멤버 읽기(`[null+0xE0]`)** 접근 위반. 스모크 결과 JSON·게임 로직과 무관 |
| 확정 원인 | **미확정.** 심볼(`UnityPlayer.pdb`)이 없어 `+0x107a81`이 어느 함수인지 알 수 없다. **구분 실험(`-force-d3d11`) 결과 D3D와 무관한 엔진 결함으로 판정(§7)** |

## 2. 종료 코드 표

| 빌드 | SHA·경로 | 명령 | 종료 코드 |
|---|---|---|---|
| **Codex tip** | `b674ebce4` (origin/codex/unity-mac-20261024, 14:51 KST), `_out/pc-exitcrash/build-codex` | `--unity-skill-smoke --quit-after-skill-smoke -output <dir>` + `-screen-fullscreen 0 -screen-width 1920 -screen-height 1080`, 창 (5120,0) NOACTIVATE, 15:35:50 시작 | **-1073741819 (0xC0000005)** |
| PC A14 기본 빌드 | `E:/exoduser-wt/_out/pc-a14/build` | 이전 보고의 `--unity-skill-smoke` 1회 + `--unity-forge-capture` | **-1073741819** (기존 관측 인용, 재실행 없음) |
| PC A14 8패치 적용 | `_out/pc-a14/build8` | `--unity-forge-capture` | **-1073741819** (이벤트 15:33) |
| PC A13 | `_out/pc-a13/build` | A13 세션 실행 | 이벤트 15:14~15:20 4건, 같은 오프셋 |
| QA 빌드 | `I:\EXODUSER-Storage\qa\unity-ui-resume-20261026\build` | 13:46·13:47 | 같은 오프셋 |
| Mac→Win 플레이 빌드 | `E:\exoduser-unity-play\exoduser-unity.exe` | 2026-10-24 21:22 | 같은 오프셋 (BSOD·오늘 작업 이전) |

## 3. 크래시 증거 (원본: `diag/`)

이벤트 뷰어 Application ID 1000 (`diag/event1000.txt`, 전체 `event1000_all.txt`) — 가장 최근 Codex 실행:

```
Faulting application name: EXODUSER-Unity.exe, time stamp: 0x6a03dde8
Faulting module name: UnityPlayer.dll, time stamp: 0x6a043e7f
Exception code: 0xc0000005
Fault offset: 0x0000000000107a81
Faulting application path: E:\exoduser-wt\_out\pc-exitcrash\build-codex\EXODUSER-Unity.exe
```

미니덤프 `diag/EXODUSER-Unity.exe.6792.dmp`를 표준 파이썬으로 읽은 결과(`diag/dump-analysis-6792.txt`, 분석기 `readdump.py`; **cdb/WinDbg는 미설치라 `!analyze -v` 결과는 없음**, 설치하지 않음):

- 예외 스레드 40236(메인), 예외 주소 `UnityPlayer.dll+0x107a81`, 접근 유형 **읽기, 대상 주소 `0xe0`**, `RAX=RCX=RDX=0` → 널 포인터 객체의 오프셋 0xE0 멤버를 읽음.
- 스택의 반환 주소 후보는 전부 `UnityPlayer.dll` 안(`+0x118260 → +0x13e54c6 → +0x12eb829 → +0x1261221 → +0x11f64d7`)이고 `EXODUSER-Unity.exe+0x17d0`(WinMain)으로 끝난다. 드라이버(nvlddmkm/amdkmdag/atidxx64 등) 프레임 없음.
- 덤프 모듈 목록(71개)에 **Mono 런타임(`mono-2.0-bdwgc.dll`)과 Media Foundation(`mfplat/mf/mfreadwrite`)이 없다** → 크래시 시점엔 이미 둘 다 해제됐다. 즉 VideoPlayer 해제 도중이 아니라 엔진 최종 정리 단계다.
- 로드된 GPU 계열: `D3D12.dll, D3D12Core.dll, amdxx64.dll, atidxx64.dll, amdenc64.dll, amdihk64.dll`(AMD 사용자 모드 드라이버, 크래시 프레임은 아님).

Player.log(`diag/Player-codex.log`, 44줄) 마지막 요지:

```
Initialize engine version: 6000.4.8f1 (f8b72d3d7343)
[D3D12 Device Filter] Device Name: AMD Radeon RX 9070 XT / Driver 32.0.32015.7029 / Feature Level 12.2
GfxDevice: creating device client; kGfxThreadingModeSplitJobs
d3d12: failed to query info queue interface (0x80004002).
Direct3D: ... Renderer: AMD Radeon RX 9070 XT ... Version: Direct3D 12 [level 12.2]
D3D11 device created for Microsoft Media Foundation video decoding.
Direct3D: detected that vsync is broken ... until the game window is moved.
[Physics::Module] Cleanup current backend.
Input System module state changed to: ShutdownInProgress.
Input Polling Thread exited.
Input System module state changed to: Shutdown.
CodeReloadManager destroyed      <- 마지막 줄, 이 뒤에서 크래시
```

## 4. 원인 후보 (근거, 우선순위)

| # | 후보 | 근거 | 소유 |
|---|---|---|---|
| 1 | ~~**Direct3D12 백엔드 종료 정리 + AMD(RDNA4) 드라이버 조합에서 Unity 6000.4.8f1 엔진 결함** | 빌드는 그래픽 API를 지정하지 않아(`ProjectSettings.asset:300 m_BuildTargetGraphicsAPIs: []`) Windows 기본인 D3D12가 선택됨. 로그 `d3d12: failed to query info queue`. 크래시는 모든 managed 정리가 끝난 뒤 `UnityPlayer.dll` 안에서 널 읽기. 빌드 내용(Codex·A13·A14·QA)과 무관하게 동일 오프셋 | 엔진/설정(`Editor/PortVerification.cs`, Codex 소유)~~ **기각(§7: `-force-d3d11`에서도 같은 오프셋)** |
| 2 | 종료 직전 창/스왑체인 변경(`Screen.SetResolution`) 영향 | `NativeGame.SkillSmoke.cs:23`에서 종료 직전 `Screen.SetResolution(1920,1080,Windowed)`. 그러나 SetResolution이 없는 A14 `--unity-forge-capture`도 같은 오프셋 → 필요조건 아님(후보 약함) | NativeGame(Codex) |
| 3 | 종료 시 로비 영상(VideoPlayer) 정리 순서 | 다른 스모크(`LanguageMenuSmoke.cs:27`, `StartupCapture`, `SettingsPersistenceCapture`)는 종료 전에 `movie.Close()`를 부른다(`NativeLobby.StartupPresentation.cs:14`). 그러나 덤프에서 Media Foundation 모듈이 이미 없고 오류 위치는 managed 해제 이후라 가능성 낮음 | NativeLobby*(Codex) |

참고 조사(웹 검색, 일치 이슈 없음): Unity 이슈 트래커에 D3D12 종료/AMD 관련 유사 보고는 있으나 6000.4 + Application.Quit 조합의 일치 항목은 못 찾았다(UUM-137629는 6000.4.8f1에서 수정 표기, UUM-74280은 6000.0.0b1 수정). 확정 근거로 쓰지 않는다.

## 5. 수정안·다음 실험

- **구분 실험(코드 수정 없음, 사용자 승인 후 1회)**: 같은 `--unity-skill-smoke --quit-after-skill-smoke` 명령에 `-force-d3d11`를 붙여 한 번만 실행해 종료 코드를 본다. 정상(0)이면 후보 1 확정, 같은 오프셋이면 후보 1 기각(그래도 `UnityPlayer.dll+0x107a81`은 D3D 무관 엔진 결함). `-force-d3d12`와의 대조는 이미 기록된 값(-1073741819)으로 대신한다.
- **수정 초안(`fix.patch`)**: 위 실험이 정상으로 나온 뒤에만 적용. `Editor/PortVerification.cs`(Codex 소유)의 `MakeScene()`에서 Windows 검증 빌드에 한해 `SetUseDefaultGraphicsAPIs(false)` + Direct3D11 지정. Codex tip `b674ebce4` 대상 `git apply --check` 통과(적용하지 않음). 그래픽 API 변경은 렌더 결과(HUD RenderTexture, 셰이더)에 영향을 줄 수 있어 비교 캡처 재확인이 필요하다.
- **적용하지 않는 안**: 종료 시 프로세스를 `Kill`로 끝내 코드를 숨기는 방법(원인을 감춤), Unity 업그레이드(범위 밖).
- 심볼이 필요하면 Unity 설치본에 `UnityPlayer` PDB가 없어 불가. 기본 대응은 위 실험. 덤프 정밀 분석이 필요하면 WinDbg 설치 승인 필요(이번엔 설치하지 않음).

## 6. 정리

임시 worktree `E:/exoduser-wt/pc-exitcrash`는 아래 순서로 정리했다: reparse 목록 → 링크만 제거 → `git worktree remove --force`. 결과는 `diag/reparse.txt`와 보고 메시지에 기록. 빌드 산출물 `build-codex`는 남겼다.

## 7. 구분 실험 결과 (`-force-d3d11`, 사용자 승인 1회)

| 항목 | 값 |
|---|---|
| 빌드 | Codex tip `b674ebce4` (`build-codex`, 재빌드 없음) |
| 명령 | `-force-d3d11 --unity-skill-smoke --quit-after-skill-smoke -output <dir> -screen-fullscreen 0 -screen-width 1920 -screen-height 1080`, 창 (5120,0) NOACTIVATE, 15:40:00 시작 |
| 종료 코드 | **-1073741819 (0xC0000005)** — 변화 없음 |
| Player.log 그래픽 | `Forcing GfxDevice: Direct3D 11`, `Direct3D 11.0 [level 11.1]`, `Renderer: AMD Radeon RX 9070 XT` (`diag/Player-codex-d3d11.log`) — D3D11 적용 확인 |
| 이벤트 1000 | 15:40:06, `UnityPlayer.dll` 0xc0000005, **오프셋 `0x107a81` 동일** |

판정: 크래시는 그래픽 API(D3D12/D3D11)와 무관한 **UnityPlayer.dll 엔진 결함**(널 객체 `[+0xE0]` 읽기, 종료 최종 정리 단계). 후보 ①(D3D12)은 기각되어 `fix.patch`(Direct3D11 고정)는 효과가 없으므로 **적용하지 않는다**(문서 보존용). 규칙에 따라 추가 실행은 하지 않았다. 남은 방향: ② `Screen.SetResolution`·③ 영상 정리 순서는 이미 약한 후보이고, 엔진 내부 문제라 Unity 패치 버전 확인(6000.4.8f1 이후 릴리스 노트)이나 심볼이 있는 WinDbg 분석(설치 승인 필요)이 다음 단계다. 스모크 결과 JSON·게임 로직에는 영향이 없다.

## 8. 맥북 총괄 보충 — 버전 통일 실험안 (전체총괄 지시, 2026-10-26)

`-force-d3d11`에서도 같은 오프셋(0x107a81)으로 크래시했으므로 그래픽 API와 무관한 **Unity 6000.4.8f1 `UnityPlayer.dll` 엔진 결함**이 1순위 후보다. 해결 후보는 **PC·Mac Unity 버전 통일**이다(PC 6000.4.8f1 / Mac 6000.6.7f1, 프로젝트 `ProjectVersion.txt`는 6000.4.8f1).

실험안(기록만, **실행·설치하지 않음**):
1. PC에 Unity 6000.6.7f1 설치(Hub). 설치 여부는 Codex와 버전 통일을 정할 때 사용자 확인 후 결정.
2. 같은 Codex tip(`b674ebce4` 또는 그때 최신)을 6000.6.7f1로 Win64 빌드(별도 임시 worktree, 빈 Library — 6000.4 Library 재사용 금지).
3. `--unity-skill-smoke --quit-after-skill-smoke` 1회 → 종료 코드·이벤트 1000 오프셋 기록.
   - 정상 종료면 버전 통일로 해결(프로젝트 버전 6000.6.7f1 상향은 Codex·사용자 결정).
   - 재현되면 심볼 서버를 쓰는 WinDbg 분석(설치 승인 필요) 또는 Unity 버그 리포트로 이관.

`fix.patch`(D3D11 고정)는 효과가 없어 **적용 대상 아님**(보존만). 배포 빌드 영향: 사용자에게 나가는 Windows 빌드도 종료 시 같은 크래시가 날 수 있으므로 E05 인수 전 해결 필요.

## 9. Unity 6000.6.7f1 재현 결과 (사용자 지시, 전체총괄 경유)

| 항목 | 값 |
|---|---|
| 설치 | Unity Hub 3.18 헤드리스 `install --version 6000.6.7f1`(Hub 릴리스 목록에 있어 changeset 불필요). 설치 위치 **`G:/unity/Editor/6000.6.7f1/Editor/Unity.exe`**(C: 미사용). 설치 전 Hub 기본 경로를 G:로 바꿨다가 끝나자 원래 값 `C:/Program Files/Unity/Hub/Editor`로 복원. 모듈 추가 없음: 에디터 본체에 `PlaybackEngines/windowsstandalonesupport/Variations/win64_player_*_mono`가 이미 있고 이 프로젝트는 Mono 백엔드(Player.log `Mono path`)라 IL2CPP 불필요. 6000.4.8f1은 그대로. 라이선스·계정 파일 미접촉, 설치 중 라이선스 문제 없음 |
| 트리 | 새 임시 worktree `E:/exoduser-wt/pc-unity66`, Codex tip `b674ebce4`, **ProjectVersion.txt = 6000.4.8f1 (f8b72d3d7343)**(업그레이드 전 값). 기존 worktree(pc-unity-win, pc-unity-a14, pc-unity-map3d)의 프로젝트는 열지 않음 |
| 에디터 | 6000.6.7f1 (b22767f04f04). 프로젝트를 열자 ProjectVersion.txt가 6000.6.7f1로 자동 업그레이드됨(아래 업그레이드 변경) |
| 빌드(PC patch 없음) | `PortVerification.Build` Win64: receipt `passed`, `errors 0`, `engine 6000.6.7f1`, error CS 0, **warning CS 0** (`_out/pc-unity66/receipt-codex66.json`, `build-codex66.log`) |
| 실행 | `--unity-skill-smoke --quit-after-skill-smoke`, `-screen-fullscreen 0 -screen-width 1920 -screen-height 1080`, 창 (5120,0) NOACTIVATE, 1회: **종료 코드 0** (6000.4.8f1 같은 빌드는 -1073741819), `skill-smoke.json` passed=true/failures 0 |
| 이벤트 1000 | 이 실행 뒤 **새 `EXODUSER-Unity.exe` 크래시 이벤트 없음**(최신 이벤트는 모두 6000.4.8f1 빌드들의 `UnityPlayer.dll +0x107a81`). 비교할 새 오프셋이 없다 |
| Player.log | `Initialize engine version: 6000.6.7f1 (b22767f04f04)`, Direct3D 12(AMD RX 9070 XT) 그대로, 종료 마지막 줄 동일(`CodeReloadManager destroyed`) — **D3D12를 그대로 쓰는데도 크래시 없음** (`_out/pc-unity66/Player-66.log`) |

판정: §7의 "D3D 무관 `UnityPlayer.dll` 엔진 결함"이 **6000.6.7f1에서 사라졌다.** 원인은 Unity 6000.4.8f1 엔진 쪽 결함으로 확정(게임 코드·그래픽 API 무관). 해결책은 에디터 버전을 6000.6.7f1로 올리는 것.

### PC 누적 브랜치 `cc39eb672` + patch 8개, 6000.6.7f1 빌드 (1회)

- 같은 임시 worktree를 `git switch --detach cc39eb672`로 옮겨(업그레이드된 ProjectVersion·Library 유지) patch 8개(U04B→U08 NativeGame→U08 PauseMenu→U05→A07B NativeGame→A07B PauseMenu→A13→A14)를 순서대로 `git apply --check`+적용(전부 OK) → Win64 빌드: **receipt `passed`, `errors 0`, `engine 6000.6.7f1`, error CS 0** (`receipt-pc66.json`, `build-pc66.log`).
- **새 경고(기준 대비)**: 기준(patch 없음)은 `warning CS` 0, `UAC1001` 1종(`NativeCharacterPresentationPlayback.cs(8,27)`, 기존). patch 적용 상태는 `warning CS` 12줄(= 서로 다른 3종 × 컴파일 4회), 전부 **PC 소유 신규 파일** `NativeForgePanel.Capture.cs`(A14):
  1. `(37,24)` CS0618 `Object.FindObjectsByType<T>(FindObjectsSortMode)` obsolete (6000.6에서 폐기 표시)
  2. `(37,55)` CS0618 `FindObjectsSortMode` obsolete
  3. `(26,66)` CS0414 `ForgeCaptureHost.closed` 대입만 하고 쓰지 않음
  6000.4.8f1 빌드에서는 1·2 경고가 없었다. 같은 호출이 A20 `NativeLevelUpOverlay.Capture.cs`에도 있다. 수정안(적용하지 않음, PC 소유): `FindObjectsByType<AudioSource>(FindObjectsSortMode.None)`를 정렬 인자 없는 오버로드로 바꾸고 `closed` 필드는 제거.
- **업그레이드로 바뀐 프로젝트 파일**(Mac이 6000.6.7f1로 열 때도 생김): `Packages/manifest.json`에 모듈 3개 추가(`com.unity.modules.physicscore2d`, `tetgen`, `timelinefoundation`)·`video` 항목 순서 이동, `Packages/packages-lock.json`(+33/-6), `ProjectSettings/ProjectVersion.txt`(6000.6.7f1 b22767f04f04), 새 파일 `ProjectSettings/PhysicsCoreProjectSettings2D.asset`, `ProjectAuditorSettings.asset`. 전체 diff: `_out/pc-unity66/upgrade-diff.txt`.
- 정리: patch 8개를 `git apply -R` 역순으로 모두 되돌림(NativeGame*·NativePauseMenu* 변경 0), reparse point 0개(`_out/pc-unity66/reparse.txt`) → `git worktree remove --force` 완료. 빌드 산출물(`build-codex66`, `build-pc66`)과 로그는 남김.
