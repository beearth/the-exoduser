# 공식 실행기 로그 공유 읽기와 GPU 판정 — 2026-10-31

범위: `unity/Tools/devtools/exo-unity.ps1`의 Editor/Player 로그 읽기와 GPU 파서. 게임 Assets·Core·Runtime·실행 방식·권한은 변경하지 않는다. 실제 Player 종료 결함의 해결 증거가 아니다.

| 문제 | 변경 | 검수 |
|---|---|---|
| 종료 중 writer가 남은 로그를 ReadAllText로 열면 공유 위반이 발생해 실패 영수증 생성도 끊김 | `Read-RunLogShared`: Open/Read·FileShare.ReadWrite·UTF-8 BOM 감지. 읽기 후 reader/stream Dispose | 자기 쓰기 핸들을 유지한 대조군: 기존 읽기 실패, 공식 공유 reader 통과. 과거 실제 실패 로그 f3ea160c도 새 실행 없이 읽음 |
| Renderer 이름이 없으면 실패 메모만 남기고 extraOk=true 유지 | 파일 없음·장치 이름 없음은 extraOk=false | 실제 Cmd-Player 파서 블록의4합성대조군: 수정 전2실패→0. Null GPU 실패·이름 있는 경우 허용 유지 |
| 로그 읽기 성공이 종료 실패를 덮을 가능성 | 시간초과·비정상 종료·창·세이브 변경의 기존 불합격 조건 유지 | I: 격리 ExecDir의 합성 Finish-Guarded 입력은 ok=false·timedOut=true·exit=-1·잔존1로 기록. 실제 Player/GPU로 세지 않음 |

근거: `I:/EXODUSER-Storage/demo-art/gameplay-parity/player-log-share-red/`, `player-log-share-green/`, `player-log-timeout-verdict/`, `player-gpu-parser-red/`, `player-gpu-parser-green/`. 합성 done 파일은 이 I: 검수 폴더 안에만 생성하며 전역 unity-jobs/done에는 넣지 않았다. 코드 변경 후 docs 전체 검색은 `공유로그-문서전체검색.log`, `공유로그-최종-문서전체검색.log`다.

별도 실패: 05:43 GPU batch 대조는 공식 Start-Process의 Access is denied가 PowerShell Operational4100(20:43:22.561Z)으로 확인됐다. Player 생성0·빈 로그이며 권한·다른 실행 API/경로로 재시도하지 않았다. 해당 실행기 PID15036 사망·자기 잠금의 owner/시각을 확인하고 기존 공식 Release-Lock 함수로 자기 stale 잠금만 반환했다. CI/AppLocker의 같은15초 이벤트는 없었으나 거부 원인을 특정 정책이나 보안 제품으로 단정하지 않는다.

앞선 Native Player의 InputShutdown 뒤 종료 지연은 별도 미해결이다. 이 도구 수정으로 정상 종료나 새 빌드·M1·화면·영상·공통·바탕화면 검수가 완료됐다고 보고하지 않는다.
