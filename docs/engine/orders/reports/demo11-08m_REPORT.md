# DEMO11-08M — 최신 main 충돌·CRLF 보존

기존 같은 브랜치 `codex/demo11-08-20261021`의 `592a983ef2ee589810018f29a18b075e37488f40`에 fetch 후 최신 origin/main `0138c5bb9188d27cee10cb1a901d075092ddb88f`를 정상 merge했다. 이 main은 45be76e49 이후이며 DEMO11-21 72e602d1·DEMO11-04 15af7424를 포함한다. rebase/reset/force/main push0.

| 충돌·검증 대상 | 해소 방식 |
|---|---|
| Main | 음악 API와 PC runtime-stat API 양쪽 보존. 보스 actor·투사체·기존 main 구현 유지. 기존 즉시 intro 설치 한 줄은 이미 승인된 592a983e의 단발 지연 helper 구조를 유지. 전투 핵심·State·Player 수정0 |
| 번역 CRLF | 텍스트 모드 재작성0. 공통 base→ours를 바이트 줄 배열로 비교해 원래 DEMO11-08 추가28줄만 추출. latest-main 원문 CRLF 바이트를 정확한 접두부로 유지하고 추가분도 CRLF로 접합. 단순 union이 만들던 과거35줄 중복은 반입0 |
| 줄바꿈·stat | 전체 CRLF4,253·단독 LF0. `file` CRLF line terminators. 최신 main 대비 번역 +28/−0, Main +38/−1. main 대비 추가 변경은 승인된 음악/인트로 연결이며 PC API 본문은 그대로 |
| 범위·인수 | 같은 브랜치 normal merge/push. DEMO11-07 코드는 이 브랜치에 추가하지 않음. 기존 08 화면은 맥북총괄 눈 검수 PASS(레터박스·명조 자막·skip 톤); 이번 새 UI 제작0 |

| 기존 무수정 관련 검증, 각1회 | 검사/실패 | 원로그 |
|---|---:|---|
| DEMO11-08 실제 viewport/BGM/skip/error/단발 인계 | 36/0 | intro08.* |
| PC runtime-stat 실제 Main/API·원본 oracle | 289/0 | runtime.* |
| 합계 | 325/0 | oracle10케이스·200필드, import exit0/ERROR0 |

각 기존 테스트는 파일 상수 격리명으로1회 실행한다. 신규 테스트0, import만 `EXODUSER-demo11-08m-Isolated-20261021`. Godot 전 정확한 pgrep 명령(별도 .sh, 검사 셸 자기 매칭 방지)을 적용하고2개 이상30초 대기, 다른 프로세스 종료0. 실행마다 override.cfg 0byte, 실제 First 저장소 사용0.

두 실행 모두 exit0·ERROR0·ObjectDB 누수 경고0. 기존 Camera2D interpolation 경고는 각각1건 그대로 기록했다. runtime 검사에는 초기 장착품 소켓별 검사가 포함된다(변경 없는 test107–110행); 이번 관측289/0이며 원본 oracle의10케이스·200필드는 유지된다. 테스트·story owner·cue JSON의 원본 bytes 동일을 확인했다. 신규 tick 목록 생성 호출0, 새 성능 벤치는 없다. 회귀의 내부 viewport 캡처에서 승인된 기존 톤 유지도 확인했다.

원로그는 `~/exoduser-wt/_out/demo11-08m/`: conflict stage byte 원본, translation-eol-final.json, main-line-proof.json, diff-stat/CRLF file 결과, 실행 명령/출력/pgrep 기록. 정상 훅·merge commit 후 자기 브랜치만 push하고 원격 SHA 일치·DONE.txt 작성 뒤 자기 worktree를 제거한다. R HEAD/branch/status 보존과 최종 SHA는 DONE.txt 참조.
