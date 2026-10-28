# RM-2 (1-2 뒤틀린 숲길) 인계 — 2026-10-28

세션 "Unity RM-2 1-2 맵 리모델링 구조", 재개 담당 = 맵 총괄(local_9d17d95b). 컨텍스트 53%(533K)라 규칙(200K 이상 즉시)에 따라 재생성. 모든 채팅은 한국어.

## 위치
- worktree `E:/exoduser-wt/pc-unity-rm2`, 브랜치 `claude/unity-pc-rm2-20261028`(시작 `origin/unity/main`), 최신 push `226c8d5dc`. P0 정정본 `2cbbf73b4` = 맵 총괄 PASS.
- 명세 `E:/exoduser-wt/_out/rm-ch1/SPEC_RM2_4.md`(N=2, 끝의 "시선 쐐기" 추가 포함). 계획 `docs/engine/UNITY_RM2_PLAN_20261028.md`, 구현 현황 `docs/engine/UNITY_RM2_SLICE_20261028.md`. 큰 산출물은 `I:/EXODUSER-Storage/rm2/`.
- 내 파일: `unity/Assets/Exoduser/Remodel/CH1_2/**`, `unity/Assets/Exoduser/Editor/Rm2SliceBuilder.cs`, `tools/rm2/**`, `docs/engine/UNITY_RM2_*.md`. 공용 URP·Remodel/Common·Core·RM-1 파일·unity/main 수정 금지(읽기만).

## 끝난 것
- P0: 웹 si=1 정답(origin/main 커밋본, 코드 요청 71개 커밋본 주입, 5회 결정적): 걷기 14,165 / START (100,185)→출구 (99~101,33) 전부 도달 / 게이트 (99~101,31) 막힘 / 충돌물 6 / 걷기 안 막힘 섬 11 / 소환굴 13(1개 (84,85)가 시체나무 충돌 안, 웹 이상, 유니티 총괄에 넘김) / 적 13~15 고정=문지기 etype29 (100,34). 함정: si≠0은 `initMapObjects`가 `_bgInitQueue`라 `_tickBgInit(9999)` 뒤에 재야 충돌물이 들어감(1차 3a43ab3d2는 이 때문에 폐기).
- Unity 대조: unity/main 미이식. 로컬 maps-rough 7d59aa487(원격 미게시)와 웹 막힘·Unity 걷기 229칸(충돌물 5개 누락). 같은 함정이라 maps-rough의 si≠0 전 구역에 같은 누락 가능성.
- 계획: 랜드마크 LM1~5(쓰러진 거목·둑·기운 쌍둥이 고목·이랑 버섯밭·매달린 고목), 채움 F1~F6, 독액 TX1~4 + 마른 물길 DRY, Pool_Hell 14·Pool_Toxic 4·빛줄기 3, 대표 컷 START·REP-A·B·C. `tools/rm2/sketch.mjs` 검사 ok(섬 11 덮음, 걷기 칸 침범 0).
- 맵 총괄 결정: ① 게이트·보스방 기둥은 0.9u 이하 구조 블록만(연출은 보스전 총괄) ② W1 바닥은 si1 전용 그림(landmark_center 지면)이 1안, 1-1 청크 재배치는 비교용 2안 ③ 시선 쐐기 `h ≤ 0.9 + tan(0.85)×D` ④ 빛 웅덩이 14개는 P1 캡처에서 화면당 2~4인지 보고 넘치면 줄임.
- P1 코드(226c8d5dc): `Rm2SliceBuilder`(Run/Capture/Wedge/Fps), `Data/rm2_build.json`(`node tools/rm2/gen_build_data.mjs`로 생성), `tools/rm2/run-rm2.ps1`. Roslyn 단독 컴파일 오류 0(에디터 DLL + RM-1 Library의 Cinemachine·Navigation·URP DLL 참조, 확인용 프로젝트는 `I:/EXODUSER-Storage/rm2/compilecheck/`). **Unity는 한 번도 실행 안 함.**

## 남은 것 (순서대로)
1. 유니티 총괄 알림을 기다림. 순번: rmb1 → O-1 → HUD → UI → UCH-05 → UCH-06 → RM-3 → **RM-2(8번)** → RM-4. 알림 전에는 `run-rm2.ps1`을 띄우지 않는다(Unity가 0개면 바로 시작하므로 앞 순번보다 먼저 잡을 수 있음). 시작 직전 프로세스(`Get-Process EXODUSER-Unity,Unity`)와 커밋 여유(`Get-Counter '\Memory\Committed Bytes','\Memory\Commit Limit'` ≥20GB)를 다시 확인.
2. `tools/rm2/run-rm2.ps1 -Step Run` → `Cap` → `Wedge` → `Fps` 각 1회, Unity 1개씩. 실패하면 원인 수정 후 1회만 재실행, 두 번째도 실패하면 멈추고 보고. 첫 실행 때 Library는 RM-1에서 `robocopy /E /XJ`(스크립트가 함), `restore-lobby-media.cjs`·`restore-warrior-story.cjs` 선행(스크립트가 함).
3. 결과 json(`Data/rm2_walk_overlap·navmesh_diff·islands·wedge·wedge_result·hero_layer.json`)과 캡처를 확인. 쐐기 위반·덮임·섬 미덮임이 있으면 빌더 수정 후 1회 재실행. Unity가 만든 `.meta`(CH1_2 하위)는 함께 커밋, `Remodel.meta`·`Remodel/Common` 메타는 커밋 금지(RM-0 정본).
4. 보고(맵 총괄 + 유니티 총괄 참조): SHA / 수치 5종 / 캡처 경로 / FPS / 수정하지 않은 공용 파일 확인. 병합은 구조 PASS 뒤 유니티 총괄.
5. 구조 PASS 뒤 룩 단계(이번엔 뺌): W1 컬러맵(8192² si1 마스터에서 만드는 도구 필요), 풀·데칼·전경/배경 카드, 버섯 눈·흔들림. 톤은 ① VFX 렌더 병합 뒤.

## 주의
- 금지: `git add -A`, stash, reset, rebase, force, 같은 테스트 반복, 이미지·창 자동 열기, 유료 호출·새 이미지 생성, game.html·maps_data.js 수정, `python -`, C 드라이브 큰 파일. 경로 지정 커밋, 작업 브랜치에만 비강제 push. pre-commit guard가 `tools/guard.baseline.json`을 바꾸면 `git restore`.
- dotnet 실행 시 `DOTNET_ADD_GLOBAL_TOOLS_TO_PATH=false DOTNET_SKIP_FIRST_TIME_EXPERIENCE=1 DOTNET_NOLOGO=1 DOTNET_CLI_HOME=E:/exoduser-wt/_dotnet-home`.
- 웹 추출(`node tools/rm2/extract.mjs --si 1`)은 브라우저 1개, `browser.close()`가 멈추는 PC라 5초 race가 들어 있음. 남은 잔여: 앞서 멈춘 추출의 Chrome 프로필 4개(C Temp, 약 60MB) 삭제는 권한 거부로 못 지움.
- 사용자가 PC를 재부팅하기 전에는 Unity 실행 금지(CTO). 메시지는 세션당 10건 상한이니 꼭 필요한 대상에게만.
