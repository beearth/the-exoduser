# 유니티 커스텀 총괄 인계 — 2026-10-28 22:05

## Codex 새 진단 단위 — 2026-10-29 KST

- 소유: `Runtime/Input/ExoInput.cs`, `Editor/ExoInputVerification.cs`, C-02 관련 `docs/engine`와 이 인계. 실행기 `exo-unity.ps1`은 기존 Owner 소유로 수정하지 않았다.
- `I:\EXODUSER-Storage\custom\c02\diagnostic-20261029\exo-input-verification.json`: 가상 키보드가 현재 장치, W `isPressed=true`·`wasPressedThisFrame=false`, 합성 `anyKey.isPressed=true`·`wasPressedThisFrame=false`, 파사드 W Down=false/held=true/AnyDown=false. 107개 매핑 뒤 같은 단언 exit 2.
- 버튼 사전 등록과 `AnyKeyDown` 개별 키 조회 후보를 적용한 `fix-20261029`도 컴파일 오류 0·동일 W 누름 실패(exit 2). 이번 새 단위의 진단 1회/수정본 1회가 모두 실패해 실행 중단. Core presence·FrontendPad·Win 빌드·Player는 미실행. C-02b RED와 제품 코드는 여전히 미실행/미구현이며 병합 큐에 넣지 않는다.
- 다음 인수는 Editor 수동 update의 `device.wasUpdatedThisFrame`, update type, 이전 프레임 버퍼를 분리하는 **새 원인 분석 단위**가 필요하다. 현 후보를 PASS로 간주하지 않는다. 자세한 근거는 `docs/engine/UNITY_C02A_INPUT_SYSTEM_20261028.md`와 기존 `I:\EXODUSER-Storage\codex-takeover\custom\REPORT.md`에 기록했다.

## Codex 인수 갱신 — 2026-10-28 23:07 KST

**23:09 결과 정정:** 수정본 재실행은 `verify-fix/exoinput/exo-input-verification.json`에서 `passed:false`, `mappedCodes:107`, `checks:109`, `W press frame`로 exit 2다. CS0246은 해소돼 컴파일 오류 0이지만 가상 W 입력 검증은 실패했다. 이 스크립트는 fail-fast로 Core presence·FrontendPad·Win 빌드를 실행하지 않았다. 원본 실패 뒤 1회 재실행 한도에 도달했으므로 추가 실행 없이 C-02a·C-02b 병합과 구현을 보류한다. `W press frame`의 세 부분값은 영수증에 없어 아직 원인 미분리다. 다음 담당은 실행 한도/새 검수 단위를 정식 인수한 뒤 가상 `Keyboard.current`·`wasPressedThisFrame`·`isPressed`·`anyKey` 값을 개별 기록해 원인을 좁힌다.

- 전용 작업 트리 `E:\exoduser-wt\codex-custom`, 브랜치 `codex/pc-custom-c02b-20261028`. C-02a의 기존 두 커밋 `d5da207ad`·`97807cf8c` 위에서 작업한다. 다른 작업 트리와 `G:\exoduser`는 읽기만 했다.
- C-01은 `claude/unity-pc-c01-asmdef-20261028` @ `6f1637b02` 그대로다. 병합 순번과 GPU m1 스모크 조건은 유지하며, 이 역할이 `unity/main`에 병합하지 않는다.
- 기존 C-02a 검증 `I:\EXODUSER-Storage\custom\c02\verify\verify.log`는 23:03 `DONE`이지만 네 실행 모두 exit 1이다. 첫 컴파일에서 `ExoInput.cs:175`의 `IMECompositionString` CS0246이 재현됐다. Input System 1.20.1 패키지 선언의 `UnityEngine.InputSystem.LowLevel` using 누락이 원인이다.
- 수정 한 줄과 보고서 갱신은 `59307eb80`에 커밋했다. 수정본 검증은 `I:\EXODUSER-Storage\custom\c02\verify_c02a_fix.ps1` → `verify-fix/`로 23:06 제출해 23:09 exit 2로 끝났다. 컴파일 오류 0·매핑 107개 뒤 `W press frame`에서 실패했으며 Win 빌드·Player PASS는 없다.
- C-02b 웹 패드 계약은 `docs/engine/UNITY_C02B_GAMEPAD_20261028.md`로 정리해 main `273a609a`까지 반영했다. 웹 원본은 원격 main `game.html` blob `d676c50e`를 기준으로 했다. 가상 패드 RED 검증 코드는 브랜치 `584c3a59d`에 보존했으나 아직 실행하지 않았고 C-02b 제품 코드는 없다.
- 재개 첫 행동: 새 검수 단위를 정식 인수해 `W press frame`의 부분값을 분리한다. 현재 재실행 한도에 도달했고 C-02a는 병합 보류다. 해당 게이트가 풀리면 `C02bGamepadVerification.Run`의 RED를 확인하고 C-02b 제품 입력을 구현한다. `MERGE_QUEUE.md`에는 검증되지 않은 PASS를 적지 않는다.


- 세션 `local_143f9249` / Opus / 역할: Unity 기능 전부 활용·엔진 커스텀(asmdef·자체 패키지·URP 확장)·기능 사용 표준·패키지 승인. 사용자 지정(10-28).
- SSOT: `docs/engine/UNITY_CUSTOM_LEAD_MASTER_20261028.md` (§1 활용도 실측, §2 커스텀 L1~L5, §3 로드맵 C-01~C-17 + C-01·C-02 상세, §4 사용 표준 1~8, §5 패키지, §6 개발툴 총괄 경계·합의, §7 운영, §8 결정, 부록 A PC 점검). 메모리 `unity-custom-lead-role.md`.
- 재생성 이유: 컨텍스트 392K(기준 200K). 주간 사용량 94%(11-01 리셋) → CTO 지시: 구현·캡처는 Codex, Claude는 판정·검수·커밋만, 진행 알림 금지(작업 단위 끝 1회 보고), 대기만 하는 턴 금지.

## 진행 중

### C-01 asmdef 1차 분리 — 검수 통과, 병합 대기
- 구현 `unity-core-oracle-opus` `local_eedbb777`. 브랜치 `claude/unity-pc-c01-asmdef-20261028` @ 6f1637b02. 결과는 SSOT "C-01 결과"와 main f7bc31e3b(보고서 사본 `docs/engine/UNITY_C01_ASMDEF_20261028.md`).
- 남은 것: 1-1 GPU 스모크(m1)를 oracle 세션이 메모리 여유가 생기면 돌린다 → 통과하면 유니티 총괄이 병합(순번 RM-INT → RM-0 → C-01). 이쪽은 결과 보고만 기다린다.

### C-02a Input System 전환 1단계 — Unity 검증 실행 중
- worktree `E:\exoduser-wt\pc-unity-c02-input`, 브랜치 `claude/unity-pc-c02-input-20261028`(**아직 push 안 함**). C-01 브랜치 기준 → 최신 unity/main 병합.
  - d5da207ad: Codex 구현(ExoInput 파사드 `Runtime/Input/ExoInput.cs`, 구형 Input 143건/19파일 교체, asmdef 2개에 `Unity.InputSystem`, `Editor/ExoInputVerification.cs`, 보고서 `docs/engine/UNITY_C02A_INPUT_SYSTEM_20261028.md`). 총괄이 diff 검수함(문제 없음).
  - 97807cf8c: origin/unity/main 병합. `NativeLobby.cs` 충돌은 unity/main 쪽(LobbyKeys 사용)으로 정리. 새로 들어온 `LobbyKeys.cs` 3건·`NativeLobby.TitleMenu.cs:57` GetAxisRaw 1건은 총괄이 ExoInput으로 바꿈. 구형 `Input.` 남은 것 0.
  - worktree의 `tools/guard.baseline.json`은 pre-commit 가드가 바꾼 것이라 되돌림(커밋에 넣지 말 것).
- 검증 스크립트 `I:\EXODUSER-Storage\custom\c02\verify_c02a.ps1`(백그라운드 실행 중, 22:03 시작). 로그 `I:\EXODUSER-Storage\custom\c02\verify\verify.log`·`run.log`. 순서: Library 복사(C-01 worktree에서, robocopy exit=1이 정상 = 복사됨) → `exo-unity.ps1 run` batch 3건(ExoInputVerification.Run → `verify\exoinput\`, PortVerification.CheckCorePresence → `verify\core-presence.json`, FrontendPadVerification.Run → `verify\frontendpad\`) → `build`(→ `verify\build`, receipt `verify\build-receipt.json`) → unreserve → `DONE`. 예약 Owner `custom-c02`.
- 재개 후 할 일:
  1. `verify.log`에 DONE이 있는지 본다. 각 exit이 0인지, 결과 JSON의 passed를 확인한다. 실패하면 원인 1개를 고쳐(Codex 브리프 `I:\EXODUSER-Storage\custom\c02\brief_c02a.md` 형식) 1회만 다시 돌린다(재실행 반복 금지).
  2. 통과하면 `git -C E:/exoduser-wt/pc-unity-c02-input push origin claude/unity-pc-c02-input-20261028`(비강제).
  3. 보고서 사본을 main에 올린다: `git show <브랜치>:docs/engine/UNITY_C02A_INPUT_SYSTEM_20261028.md > G:/exoduser/docs/engine/...` → push 도구로 push. SSOT에 "C-02a 결과"를 적는다(바뀐 수 143+4, 검증 결과, 남은 것 = 1-1 직접 조작 판정은 플레이어 보류가 풀린 뒤).
  4. 유니티 총괄 `local_59ad835c`에 병합 요청: C-02는 C-01을 포함하므로 C-01 다음 순번. CTO `local_7072229c`에 작업 단위 보고 1회.
  5. 병합이 끝나면 worktree를 지운다(junction 0 확인, force 없이 `git worktree remove`).

## 대기·연결
- 개발툴 총괄 `local_55f5cfd6`: 경계 합의 완료(그쪽 e9b2ccd8d). DT-11·12는 이쪽 C-03·C-04로 넘어옴. DevTools 참조 검사 결과 0건(main e5995d504). DT-03 lookdev가 push되면 같은 검사(`I:\EXODUSER-Storage\custom\tools\devtools_refs.sh`에 브랜치를 추가해 실행). `QaRunPolicy`는 `Runtime/Core/Platform/`으로 옮기라고 답함(§4-8, main dc80a4a13). 옮겼는지는 그 브랜치 병합 때 확인.
- 유니티 총괄 `local_59ad835c`: 병합 창구. 병합 체크에 "새 패키지 참조를 Runtime asmdef에 넣었는가"가 들어감. Verify의 A15 SFX exit 2(원래 있던 결함)를 그쪽에 넘김.
- CTO `local_7072229c`: 보고처. PC 점검 부록 A·E 드라이브 급감(801→318GB) 전달함. worktree 정리 도구는 개발툴 총괄 담당.

## 이번 대화에서 확정된 것 (메모리·docs에 없는 것만)
- 원격 반영 도구: `bash I:/EXODUSER-Storage/custom/tools/push_paths.sh <메시지파일> <경로...>` — 공유 폴더 작업 파일의 지정 경로만 최신 origin/main 위에 임시 인덱스로 커밋·비강제 push. 로컬 main·인덱스는 건드리지 않는다. fetch ref 잠금 경합이 나면 1회 다시 실행.
- 이 세션은 `rm`이 거부된다(삭제는 `mv`로 보관 폴더에 옮기거나 사용자 승인).
- 원격 제어 중에는 start_session이 거부된다 → 구현 배정은 Codex(`codex exec`, 메모리 `implementation-via-codex-exec.md`) 또는 유니티 총괄 경유.
- 승인 방식(10-28 사용자): 멈추지 말고 되돌리기 쉬운 상태까지 진행, 컨펌 목록은 작업 단위 끝에 CTO로.

## 다음 후보 (C-02a 뒤)
- C-02b 패드(웹 game.html 13592·13969·20071의 getGamepads 처리 + Core `FrontendPadPolicy`) → C-05 ProfilerMarker → C-06 Test Framework(개발툴과 공동). 명세 작성 후 Codex로.

## 금지·주의
- `git add -A`·force push·`--no-verify`·gc 계열 금지. 커밋은 경로 지정. Unity 실행은 `exo-unity.ps1`만(창·소리 0, 세이브 격리). 백그라운드 `python -` 금지. 대용량 산출물은 `I:\EXODUSER-Storage\custom\`.
