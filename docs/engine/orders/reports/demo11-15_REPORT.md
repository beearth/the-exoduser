# DEMO11-15 — 레슨 step1..7 독립 소비자 인계

기준 origin/main `0138c5bb9188d27cee10cb1a901d075092ddb88f`. 기존 P2-001l·P2-001j/k 및 `native_parry_lesson_flow`를 재사용한다. 갭 문서 `codex/demo11-gap-20261021:61ab71be` D09·DEMO11-15의 범위다. 원문은 이 기준의 `game.html:14,32111`와 `parry-lesson.js`. 기본·step0·8을 새로 구현하지 않는다. **1..7 실제 PC 전투 성공 인수는 아직 0건이며 각 단계 NOT_READY**다. 공용 전투 구현을 우회해 성공시킨 단계는 없다.

| 인터페이스·단계 | 계약·원본 근거 | Main 인수·남은 PC 요청 |
|---|---|---|
| 진입 | 실제 `Main.source_intro_sequence.lesson_flow.bind_native_lesson_step(step:int, consumer:Node)->bool`; true는 바인딩 수락만 의미 | 기존 Main339→intro sequence→flow configure/tick을 그대로 사용. Main/State 파일 변경0 |
| PC 소비자 | `native_demo11_lesson_step_consumer.gd` 상속·동일 world 자손. `supports_lesson_step(int)->bool`, `begin_lesson_step(int,context)->Dictionary{ready,reason}`, `advance_lesson_step(int)->Dictionary{ready,failed,failure_kind?,completed}`, `retry_lesson_step(int)->bool`, `restore_lesson_step(int,reason)->void` | begin context는 실제 world/player/state/flow. ready/ack만으로 credit0. completed는 아래 원문 성공 증인을 검증한 **PC 소유자만** 반환해야 한다. 현재 생산 코드에 해당 소비자 바인딩 없음. fixture 완료는 계약 검사일 뿐 전투 인수 아님 |
| 관측·진행 | `flow.get_snapshot().additional_steps`→`{step,results,focus_ticks,retry_ticks,lease,completion_authority}`. results는 단계 키→`{status,reason,failures?,skipped?}` | PRACTICE/COMPLETE/NOT_READY/SKIPPED를 분리. 미지원은90틱 안내+90틱 deferred 전환으로 다음 단계, 체크/성공 연출0. 마지막 보류는 COMPLETE 화면 없이 기존 finish 복원. 이 보류 정책은 새 사용자 지시에 따른 포트 정책이며 원문 성공 분기와 구별 |
| 입력·실패·복원 | JS30–50·458–490·505·683·685–700. 기존 Player allows 퍼널→flow; step7 focus150/방향 해제, 실패 재시도60 | 방향은 intro 외 허용. focus 동안 해당 동작 차단. PC가 advance에서 실제 실패 처리·탄 정리 후 failed/failure_kind(miss/volley/retry) 반환,60틱 뒤 retry에서 원문 HP/pose/cooldown 복원. 실패 복원 거부·owner 소실도 그 단계만 NR. lease는 거부/정상완료/skip/exit 각각 정확히1회 restore. 실제 HP/패링 writer 추가0 |
| step1 E 물리탄 | JS204–230·409–425·653–654: 동일 레슨 탄의 실제 E 반사→원래 발사 적 처치 | NOT_READY. 실제 E snapshot의 `projectile_parry_adopted:false`(adapter734). 기존 암흑 Q탄으로 대체0 |
| step2 Q 다종탄 | JS550–580·409–425·592–611:5종 마법탄, Q120틱, 해제24틱 내 서로 다른3발·releaseR≥300/parryT>0 | NOT_READY. 실제 Q snapshot `reflection_carrier_ready:false`(adapter186), 다종 반사 소비자 부재 |
| step3 E 다종탄 | 같은 원문:5종 물리탄,180틱·chargeMul≥3·동일 해제3발 | NOT_READY. E 실제 다종 반사 소비자 부재 |
| step4 사슬 | JS348–376:1/2/3단 실제 발사·끌림·이동≥1·해제 증인 | NOT_READY. 기존 Main player에 원문 사슬 실행/해제 소비자 없음. 좌표 이동으로 위장0 |
| step5 전격이동 | JS326–344·523–525:방향+Space로 arm, 실제 bdMoveT 비행5회 | NOT_READY. 원문 전격이동 소비자 없음. 일반 이동/돌진 대체0 |
| step6 분노 축적 | JS409–425·534–545·550–574:실제10탄 패링 후 rageParried와 rage≥100 | NOT_READY. 분노 자원/다종 Q 반사 소비자 없음. 레슨이 rage를 직접 채우지 않음 |
| step7 분노 발동 | JS505·529–532·639–649·683:focus150 후 방향 해제, 실제 rageCast amount≥100 | NOT_READY. `player.gd:523 space_rage_slot_not_connected`; 실제 분노 소비자 없음. 임의 사망/가짜 완료0 |

| 검증·범위 | 결과·증거 |
|---|---|
| 신규·관련 회귀 | 최종 신규125/0 + 원문 J21/0·K32/0 + L 보존2그룹37/0 = **215/0**, 각 최종 로그 ERROR/ObjectDB/resource0·skip0. 최초 신규119/0은 종료2객체/1리소스 오류로 clean PASS 제외; 새 하니스에 기존 QA-004와 같은12프레임+200ms 종료 대기 추가, 실패 신규만 재실행(혼합단계·명시 skip 상태 검사6개 추가). 제품 오디오/기존 테스트0줄. 신규 격리 `EXODUSER-demo11-15-Isolated-20261021`; 기존 J/K/L은 원문 상수 사용자 폴더 |
| 구 L 정책 변경 | 기존 L `halted_steps_and_restore`는 1..7 영구정지를 기대하므로 새 독립 보류 정책과 충돌한다. 기존 파일은 수정하지 않는다. 원문 앞2그룹을 상속 wrapper에서 그대로 실행하고 새 단계별 보류/skip/실패 수명 검사로 대체. 전체 L PASS로 보고하지 않는다 |
| 캡처 | `~/exoduser-wt/_out/demo11-15/lesson-step2.png`, `lesson-step7.png`, `lesson-step2-crop-1x.png`. step 선택 UI preview이며 실제 PC 전투 완료 증거로 사용하지 않음. 각1920×1080·crop400×1048, 원본의(1464,16)영역과 복원 픽셀 전수 동일(재표본화0). 프레임/게임 폰트 가독성·줄바꿈 확인, 개발 상태/NOT_READY 문구 노출0; `capture-review.json`·`verify_capture.py` |
| 보호·CRLF | `source-audit.json`: 기존 J/K/L 파일 byte 동일, 원본3파일 diff0; 기본/0/8 관련15개 함수 본문 byte 동일. Player/QE/State byte 동일. 번역26파일 원문·CRLF 보존(변경0), 기존 Hell Gothic frame/crest·게임 font 재사용. tick 목록 생성 API0 |
| 공용 변경 | Main/State0. 기존 공유 flow **+62/−7**, 최종 행 **16–18,36,135,148,153,218,222,237–238,245–247,273–301,427,761–764,787,819,1122,1195,1200–1207,1244,1247,1249**. 본문 재작성은1..7 분기·허용 입력·복원 hook·UI/진단 범위. 신규 consumer/steps 및 자기 테스트만 추가. 저장IO·공용 factory·맵·2_3·DESIGN LOCK0 |
| 원로그·제출 | `_out/demo11-15/`의 gate/engine/out/err/meta·source-audit·DONE. 정상 docs hook·경로 지정 stage·자기 브랜치 일반 push/원격SHA 일치 후 자기 WT 제거. R 불변 별도 확인 |
