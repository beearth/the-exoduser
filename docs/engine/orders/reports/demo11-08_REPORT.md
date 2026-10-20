# DEMO11-08 — 세계관/전사/INTRO 수명 경계

브랜치 `codex/demo11-08-20261021`. 기준 최신 origin/main `ac3764bfe5476b56e2f2388b1f2d9baeff731885`에 승인된 DEMO11-41 `8939bbd17acdd420fd102cbee0b4e5409357b3ce`를 정상 merge한 `b90d11bbe235a90911ccca6a50b78f5fbaa5c1f5`가 구현 기준이다. Main 충돌은 기존 보스 actor 설치와 BGM bind 양쪽을 보존했다. gap `61ab71be`의 DEMO11-08/D06·D07 및 UI_FOUNDATION/UI_COMPOSITION을 근거로 했다.

| 범위 | 구현·판단 근거 |
|---|---|
| 재생 방식 | Main에 VideoStreamPlayer/MP4 재생기 없음. 사용자 조건에 따라 기존 정지 이미지+자막 분기 재사용. 새 AI 이미지/영상·변환·바이너리 커밋0 |
| 원본 | index.html:2323 CIN_LINES 19 cue/68,800ms → game.html:62598 PROLOGUE_LINES 34/104,500ms → :62746 INTRO_CUTSCENE_LINES 27/84,000ms. 모든 cue 텍스트·시간·경로를 원본 대조. 영화 v23 22 cue/96.4초와 별도 분기임을 명시 |
| 수명 | native_story_intro가 pause/자막/실이미지/오류 retry/skip/cancel 소유. 정상 종료와 2초 홀드 skip은 단발 handoff → 기존 P2-001i/P2-007a 한 번 설치. 기존 4컷/레슨/커튼 코드는 무수정. 취소는 이전 pause 복원, 인계0 |
| skip 판단 | 세계관 원본 index.html:2644는 5초이나 이 단위에서는 game.html:62868 INTRO의 2초로 통일. 버튼에 2초를 표시. 새 저장 완료 플래그나 G.cutsceneDone writer는 추가하지 않음 |
| BGM·디자인 | DEMO11-41/SND 원모듈 재사용. intro BGM은 gameplay pause 중 재생, hidden은 suspend. guide stop 뒤 기존 wakeup/field 경로 복귀. hell/cinzel_hell·흑철·#dfd6c2·금선·붉은 hover, KO/EN 및 기타 EN 폴백. 신규 표시 문구21개 No.3338–3358 등록 |
| 공용 변경 | Main 최종 99행(필드), 330–336행(부팅 분기), 351–358행(단발 인계 helper), +17/−2. 기존 줄 최소 교체. State/HUD/world/player·전투 핵심·docs/2_3·맵 변경0. native_music_lifecycle 63행 한 줄만 intro pause 예외(+1/−1). 목록 생성 API 새 호출0 |

| 검증 | 통과/실패 | 원로그 |
|---|---:|---|
| bounded 원본 literal·이미지 경로 대조 | 161/0 | source-reference.out, source_story_intro_reference.cjs |
| 최종 신규 실제 Main/창·BGM·종료·중복 인계·hold·오류/retry·cancel·EN·bus 회수 | 36/0 | story-03.out/.err/.json |
| 기존 P2-001i 무수정, 1회 | 18/0 | p2001i.* |
| 기존 P2-007a 무수정, 1920×1080 실제 창, 1회 | 115/0 | p2007a.* |
| 기존 DEMO11-41 무수정, 실제 창, 1회 | 55/0 | music41.* |
| 최종 합계(중복 합산0) | 385/0 | 기존 회귀188/0, 신규·원본197/0 |

Godot 4.7.2 실제 렌더러 Compatibility/Apple M5 Pro. 최종 실행 모두 exit0·ERROR0·ObjectDB 누수 경고0. 기존 Main Camera2D interpolation 경고는 실행당1건 그대로 기록했다. 첫 신규 story-01/02의 각33/0은 캡처 fade-in 시점·구간 표기와 언어 초기화 보완 전 중간 로그로 보존하며 합계에서 제외했다. 별도 성능 수치나 청음 PASS는 주장하지 않는다. 틱 경로 reflection 목록 생성0, 벽시계 벤치는 이 변경에서 불필요해 실행하지 않았다.

실행 전 정확한 pgrep 명령과 2개 이상 시30초 대기를 적용했다. 최초 launcher의 검사 셸이 스스로 매칭되어 대기한 것을 발견해, 명령은 그대로 별도 .sh 파일에 두고 실행했다(진단 gate-observer-diagnostic.json). Godot를 아직 실행하지 않은 자기 대기 launcher만 종료했고 다른 Godot 종료0. 이후 gate 원로그에 2→30초 대기→1 실행을 보존했다. 각 실행은 지정 격리명(기존 회귀는 파일 상수)을 사용했고 override.cfg는 종료마다0byte. 실제 사용자 First 저장소 사용0.

`~/exoduser-wt/_out/demo11-08/captures/`에 Godot 내부 viewport 1920×1080 원본6장(세계관·전사·INTRO·기상 인계·오류·EN), 각 자막/skip 1x crop12장을 저장했다. 프레임·자막·버튼을 직접 눈으로 확인했고 기상 화면은 기존 fade-in 후 캡처했다. 맥북총괄 눈 검수 대기. PNG는 git에 넣지 않았다.

제약: 영화 mux 음성·원본 카메라/vfx/sfx는 미이식이며 영화 동등성은 미확인. 전체 clone에서 원본 외부 이미지/BGM을 읽고 sparse 하니스에서는 명시 root를 사용한다. 독립 export 패키징은 HOLD. 실제 저장/형식/마이그레이션·전투 판정 연결을 새로 만들지 않았다. 상세 계약은 [INTRO 문서](../../DEMO11_INTRO_LIFECYCLE_20261021.md), sound 문서·번역 목록에 동기화했다. 최종 SHA·원격 일치·R 보존 확인·worktree 제거는 원로그 DONE.txt에 기록한다.


2026-10-21 맥북총괄 눈 검수 PASS: 레터박스·명조 자막·건너뛰기 톤 일치. PC 반송의 최신 main/번역 CRLF 충돌은 같은 브랜치에서 정상 merge로 해소했다. [후속 병합 보고서](demo11-08m_REPORT.md), 원로그 `_out/demo11-08m/DONE.txt`에 새 SHA·수치를 기록한다.
