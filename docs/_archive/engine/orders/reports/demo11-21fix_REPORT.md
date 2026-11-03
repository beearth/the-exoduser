# DEMO11-21fix — owner 해제 뒤 pending draw 차단

PC가 보고한 starter_state 148/0 뒤 previously freed SCRIPT ERROR2건을 수정했다. Main/State의 tree_exiting에서 드랍 adapter를 비활성화하며 그리기·입력·물리·snapshot 진입에서 현재 owner 유효성을 확인한다. 이동·피해·드랍 식·표시·줍기 판정은 변경하지 않는다.

| 범위 | 근거 |
|---|---|
| 기준·브랜치 | 최신 origin/main ac3764bfe5476b56e2f2388b1f2d9baeff731885을 기존 codex/demo11-21-20261021(a976680b)에 정상 merge한 3537a348174ebec5b1c067e678961649a2f6ba1c 기준. CHANGELOG/작업판 충돌은 양쪽 절/행 보존. 명시적인 ‘같은 브랜치·새 브랜치 아님’을 뒤의 공통 새 branch명보다 우선했다. worktree 경로는 요청한 demo11-21fix 사용. rebase/force/reset0 |
| 원인·수정 | 기존 native_world_drops.gd364/395의 _configured만으로는 State/Main free 이후 pending draw를 막지 못했다. 현재109–111 owner tree_exiting 연결,308–320 guard/비활성화·자기 exit 적용,131/142/195 입력/물리/줍기·380/411 그리기·442 snapshot 보호. pre-Tree free처럼 signal이 없는 경우도 is_instance_valid가 차단. 목록 생성 API0 |
| 공용 범위 | native_world_drops.gd **+21/-5**. Main0·State0·Player0·World0·HUD0·전투 핵심/저장/맵0줄. 새 수명 테스트는 owner 해제 fixture이며 실제Main 검증은 기존 starter/드랍 스위트에 분리 |

| 실행 | 검사/실패 | exit / ERROR / ObjectDB / resource |
|---|---|---|
| drop-import | import | 0 / 0 / 0 / 0 |
| lifetime | 9/0 | 0 / 0 / 0 / 0 |
| starter | 148/0 | 0 / 0 / 0 / 0 |
| drop-intake | 24/0 | 0 / 0 / 0 / 0 |
| drop-world | 18/0 | 0 / 0 / 0 / 0 |
| drop-pickup | 17/0 | 0 / 0 / 0 / 0 |
| drop-render | 1/0 | 0 / 0 / 0 / 0 |


PC 제보의 수정 전 ERROR2건은 외부 재현 근거다. Mac에서 수정 전 스위트를 추가 실행해 중복 재현하지 않았고, 수정 후 관련 스위트는 각1회 실행했다. 신규 owner 수명9검사: State/Main tree exit 즉시 configured=false, owner free 후 직접/queue redraw와 snapshot, signal 없는 pre-Tree free의 진입 guard를 확인한다. 기존 검사·기대값·종료 대기 유지, 검사 약화0. stderr 종료 ERROR·ObjectDB/resource 검사는 기능 실패와 별도로 판정한다.

새 테스트는 EXODUSER-demo11-21fix-Isolated-20261021, 기존은 파일 상수의 격리 이름을 쓴다. 실제 사용자 저장 폴더 접근0, 매 Godot 지정 pgrep/2이상30초 대기, override 매 실행 종료0byte. 기존 원본 수치/에셋0변경이며 원로그는 ~/exoduser-wt/_out/demo11-21fix/. 로비 RETOUCH는 이 수정 push/원격 일치 후 별도 기존 codex/demo11-04-20261021에서 이어가며 드랍 수정의 기능 통과를 로비 화면 승인으로 확대하지 않는다.
