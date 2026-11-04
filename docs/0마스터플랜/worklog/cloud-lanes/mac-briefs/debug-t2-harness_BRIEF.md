# BRIEF — debug-t2-harness: 낡은 oracle·소스 검사 하니스 정리(D-T2) (CTO, 11-04 저녁)

## 목표
- docs/engine/DEBUG_LEAD_BOARD_20261103.md의 D-T2 항목을 처리한다.
  - 11-04 일괄 점검(oracle-sweep)에서 NEEDS-INPUT로 남은 C# 하니스 9개를 다룬다: CoreTests, enemy-tick, LobbyTests, comparison, feedback, hud, inventory, ki-slash 2.
  - 추출기·보조 스크립트 NEEDS-INPUT 15개도 대상이다.
- 각 하니스를 현행 코드(최신 origin/unity/main)로 갱신해 실제로 실행되게 하거나, 대체 하니스가 있으면 폐기 판정한다.
- 합격 조건
  - 9개 + 15개 각각이 '실행 PASS', '실행 FAIL(원인 표기)', '폐기(대체 근거)' 중 하나로 확정된다.
  - oracle-sweep run.cjs가 그 분류를 반영한다.
  - Core 변경 0, Unity 실행 0(dotnet·node만).

## 작업 위치
- 작업본: `E:/exoduser-wt/codex-debug-t2` (NTFS)
  - sparse 범위: unity/Tools, unity/Assets/Exoduser/Runtime(읽기용), docs/engine, docs/CHANGELOG_SYNC.md, /game.html, /tools/guard.js
- 브랜치: `codex/unity-debug-t2-20261104`
  - 시작점: 최신 origin/unity/main
- 웹 원문이 필요하면 `git -C G:/exoduser-wt/cto-unity-rules show origin/main:game.html`로 읽는다.

## 금지
- Core·Runtime 수정, `git add -A`, `--no-verify`, force·reset·rebase·stash
- Unity 실행, python 사용(node·dotnet으로 대신)
- 모든 명령에 `</dev/null`을 붙인다.
- 빌드 출력은 레인 폴더나 각 하니스 지정 출력 폴더에만 둔다. 드라이브 루트에 bin/obj를 만들지 않는다(settings-persistence 사고 참고).
- `I:/EXODUSER-Storage` 전체를 재귀 검색하지 않는다.
- 같은 검사가 2회 실패하면 멈춘다.
- CRLF 줄 끝은 줄 단위로 보존한다.

## 결과
- 경로를 지정해 커밋하고, 비강제로 push한 뒤 ls-remote로 원격 SHA를 대조한다.
- REPORT.md 맨 위에 다음을 적는다: SHA, 24개 분류표(하니스, 결과, 근거), oracle-sweep 전후 요약.
- 디버깅 보드에 넣을 문구는 초안만 쓴다. 보드 반영은 디버깅 총괄이 한다.
