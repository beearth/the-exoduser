# DEMO11-07 — char0 생성·active 슬롯·cutsceneDone 경계

최신 origin/main `45be76e49d0090316b91a6b7b383d81835e29192`에 DEMO11-04 `15af7424`와 눈 검수 PASS DEMO11-08 `592a983e`를 정상 merge한 `5d6eeaa57682d78eccf550218f2c8789fbb38037`가 구현 기준이다. 브랜치는 `codex/demo11-07-20261021`. 충돌은 Main의 PC runtime API와 음악 API 양쪽, 기존 CHANGELOG·번역 절을 보존해 해소했다. rebase/reset/force0.

| 구현·원본 근거 | 판단·보호 범위 |
|---|---|
| 생성·이름·잠금 | I2909–2910 2–8 UTF-16 단위·7금지 문자, I3199–3231 char0 공개/4잠금, I3447–3450 name/ts/charIdx. 기존 Menu/DEMO11-05 adapter·source_slot_reader 재사용. 메타 생성 settled/readback 뒤에만 진입. 중복 이름은 지역화된 오류로 표시 |
| active·Main | I3488–3519, I4340–4349. game key가 없는 새 metadata 경로에서 실제 active key commit/readback → Main 시작 → 기존 character picker/reader/PC atlas 인터페이스로 char0 선택. 새 저장 형식·키·서버 호출0. 실패 시 기록 보존, 자기 active 값만 rollback. 입장 후 늦은 rollback/중복 요청 거절 |
| 인트로·flag | G62914/62977·62144 기존 cutsceneDone 읽기·완료 경계. 새 진입은 DEMO11-08를 한 번 시작, 완료/skip 때 State `_cutsceneDone` true → 기존 P2 4컷. 이미 본 metadata는 영화만 skip하고 4컷 인계. tutorial-seen을 cutsceneDone으로 대체하지 않는 판단. collector 그대로이며 슬롯에 부분 game save를 만들지 않음 |
| 수명·언어·화면 | standalone demo_lobby.tscn의 정상 실행만 자동 구독, 기존 하니스는 원래 UI 유지. S10 실제 bridge 언어를 INTRO로 인계. Hell Gothic·hell/Cinzel 토큰·명조 입력·금선·붉은 선택색, 이모지0. 새 표시문구16개 No.3359–3374 등록 |
| 공용 파일 범위 | 기준 merge 대비 Main +43/−5: 101행 필드, 337–340 부팅 분기, 358–399 단발 story/helper·입장/flag receipt. State(native_source_new_run_state.gd) +8/−0: 260–267 기존 flag 전용 commit. 나머지 HUD/world/player·전투 핵심·docs/2_3·맵0. PC 함수는 호출만, tick 목록 생성 API0 |
| 인계 접점 | Player가 있는 실제 저장의 복원, 이전 세션 game save의 슬롯 복귀는 DEMO11-06 책임. 그 데이터를 삭제하거나 fresh Player로 바꿔서 성공 처리하지 않음. 기존 continue_requested(slot,data) 유지. 미동기화 저장 존재 시 로비에 머물며 동기화 필요 표시 |

| 검증 | 검사/실패 | 원로그 |
|---|---:|---|
| 최종 신규 actual 로비 생성→active→char0→INTRO/seen·중복·오류·writer lock·늦은 rollback·EN | 52/0 | new-03.* |
| 원본 이름15 case·5캐릭터 이름/잠금 대조 | 17/0 | source-reference.out; bounded index literal/guard |
| 기존 DEMO11-04 무수정, 1회 | 52/0 | lobby04.* |
| 기존 DEMO11-08 무수정, 1회 | 36/0 | intro08.* |
| 최종 합계(중복 합산0) | 157/0 | 신규·원본69/0, 기존88/0 |

원로그 `~/exoduser-wt/_out/demo11-07/`에 명령·pgrep/30초 대기·exit·원문 stderr를 보존했다. Godot는 실제 Compatibility 창에서 실행했고 신규 namespace는 `EXODUSER-demo11-07-Isolated-20261021`, 기존 회귀는 각 파일 상수다. 실제 First 저장소 사용0. 실행마다 override.cfg는0byte로 비웠다. 기존 회귀 소스는 의존 브랜치 파일과 바이트 동일, 각1회만 실행했다.

최종 실행 모두 exit0·ERROR0·ObjectDB 누수 경고0. 기존 Camera2D interpolation 경고는 new-03/intro08 각1건, lobby04는0건이다. 중간 new-01 45/0·new-02 49/0은 중복 이름 표시·늦은 rollback·언어 인계 검증을 보완하기 전 기록으로 보존하고 최종 합계에서 제외했다. 원본 대조 입력은 최종 관측 JSON과 바이트 동일함을 확인했으며 원본 대조는1회다. 별도 FPS/성능 PASS를 주장하지 않는다. 새 코드가 tick을 바꾸거나 목록 생성 API를 호출하지 않으므로 벽시계 벤치는 추가하지 않았다.

`captures/`에 내부 viewport 1920×1080 원본2장과 Image.get_region으로 만든 1x crop2장(780×440 생성폼, 1620×145 자막)이 있다. 직접 명조 입력·잠금·줄 배치·버튼/자막 톤을 확인했다. 기존 로비 아트·인트로 이미지 재사용이며 새 바이너리 커밋0. 맥북총괄 눈 검수 대기. 프로젝트 main_scene/데모 실행 권위는 변경하지 않았고 기존 standalone 로비에서 이어진다.

상세 계약은 [로비 인계](../../DEMO11_LOBBY_ENTRY_20261021.md), LOBBY 추적·INTRO 문서에 동기화했다. 전체 저장된 Player 복원·온라인 생성·독립 export 에셋 패키징은 이 단위 완료로 주장하지 않는다. 최종 SHA·원격 일치·R 보존·DONE 후 worktree 제거는 원로그 DONE.txt 참조.
