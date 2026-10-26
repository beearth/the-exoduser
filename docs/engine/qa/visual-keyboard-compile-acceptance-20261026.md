# 화신 선택 키보드 후보 — 비대화식 컴파일 검수 접수

2026-10-26. QA 영수증 `visual-keyboard-compile.json`과 `visual-keyboard-compile.md`를 접수했다. Unity 6000.6.7f1 Editor `-batchmode -nographics -noUpm -quit` 스크립트 컴파일은 종료 코드 0, 컴파일 오류 0줄이며 Editor lease가 해제됐다.

영수증과 현재 소스 SHA-256이 일치한다.

| 소스 | SHA-256 |
|---|---|
| `NativeLobby.Characters.cs` | `C09330CFE409567F61AD961F3E4DF157666FD8106E4E3437425C626240150B5F` |
| `NativeLobby.CharacterPresentation.cs` | `AE7674D960B34C76D4C0429D8DB9F0561527B2BD942B6EA722E6DDB5083460C2` |

판정: **이번 키보드 후보의 스크립트 컴파일 통과**. 오류 수정은 필요하지 않아 소스를 변경하지 않았다. 기존 Player PID 50700은 보존됐으나 새 Player GUI 실행·실제 Tab/Enter/Space 입력·긴 말레이어 큐의 화면 검수는 수행되지 않았다. 따라서 조작 또는 시각 품질 PASS로 확장하지 않는다. RTL 화살표는 `next-gap-rtl-visual-arrow-readonly.md`의 후속 검토 범위다.

QA가 검증한 원격 브랜치 SHA `d9626921992a782b794c4da9cea74a2bebaf519d`의 두 소스 blob SHA-256을 별도로 읽어 위 컴파일 입력과 일치시켰다. 따라서 이 결과는 해당 커밋의 **두 소스가 컴파일된 증거**다. 실제 키보드 동작이나 Player 패키지 인수는 아니다.
