# 대검전사 생성 직후 스토리 재생 — 2026-09-10

| 항목 | 현재 구현 |
|---|---|
| 시작 | index.html 이름 입력 후 생성 저장 성공 → `_afterCharacterCreated(name,visualIdx)` |
| 대상 | `visualIdx===0`, CHAR_VISUALS의 exoduser_warrior. 다른 캐릭터는 기존 목록 갱신 |
| 저장 경로 | 오프라인 `/api/save`, 서버 없는 localStorage 폴백, 온라인 Supabase 성공 모두 연결 |
| 저장 실패 | 중복 이름·실패 응답에서는 영상 시작 안 함 |
| 재생기 | `character-story-player.js`, `ExoduserCharacterStory.play()` Promise, 중복 호출 시 동일 Promise |
| 영상 | `video/warrior_story_v21.mp4`, v21 합본과 SHA256 동일 a4d43f3990b941d11d2ae9a7f61254133c486d6c47e8e496f4a27fb5b763a82d |
| 규격 |96.4초5784f,1920×1080/60fps,H.264/AAC스테레오,85,860,266 bytes |
| 소리·자막 |영상 내 영어 음성·한글 고정 자막22cue,muted=false/volume=1. 로비 BGM·호버음·선택 영상 정지 |
| 화면 |검정 전체 뷰포트,object-fit:contain,네이티브 재생·일시정지·탐색·볼륨 컨트롤 |
| 건너뛰기 |상단 버튼,Escape,게임패드B/Start. 재생 중 로비 패드 입력 차단 |
| 자동재생 차단 |NotAllowedError이면 네이티브 재생 버튼으로 소리 있게 시작 가능 |
| 종료/스킵 |미디어 pause·src 제거·load·overlay 제거,Promise true. `showCharGate(charId,true)` |
| 진입 |기존 로딩1200ms 후 `game.html?...&story=warrior-v21`,생성한 슬롯/온라인id 유지 |
| 게임 후속 |charIdx0의 일반 게임 입장은 구 PRO·INTRO와 눈을 떠 대사·커튼·키안내를 시작하지 않고 즉시 플레이. story URL 유무와 무관 |
| 미디어 오류 |Promise false,story 매개변수 없이 게임으로 직접 진입. 예전 스토리로 폴백하지 않음 |
| 저장 계약 |시청 플래그를 세이브·계정·localStorage에 추가하지 않음. 현재 진입URL만 사용 |
| 기존 입장 |목록의 기존 대검전사도 직접 플레이. 다른 캐릭터의 기존 컷씬 경로 유지 |
| 배포 패키지 |build-nwjs.mjs FILES에 player 추가,video 폴더 기존 복사로 MP4 포함. 배포/실행파일 재빌드는 이 작업 범위 아님 |

검증: test/characterStoryCreation.test.js는 저장 성공/실패,오프라인 버튼 override,ended/skip/error cleanup,game 직접 플레이를 검사한다. tools/verify_character_story_creation.py는 격리 Chromium에서 생성 UI를 클릭하고 실제 MP4 재생·오디오 디코드·로비 음악 정지·게임 연결을 검사한다. 저장 API만 브라우저 내부에서 대체하여 실제 사용자 슬롯을 쓰지 않는다. 브라우저 결과는 output/cinematic/character_story_direct_play_20260910/qa.json과 스크린샷 참조.

언어 제한: 이번 요청은 승인된 합본 그대로 연결한 것으로 영상 속 한글 자막은 언어 선택에 따라 바뀌지 않는다. 기존 PROLOGUE_LINES·여신 INTRO 번역 데이터는 다른 캐릭터와 명시적 cutscene=1 미리보기에서 유지한다.

## 사용자 정정 — 기존 게임 시작 연출 미재생

| 항목 | 확정 동작 |
|---|---|
| 일반 대검전사0 진입 |G._cutsceneDone=true,G.on=true,P.iframes=300 |
| 기존 모닥불 |존재하면 t=300 유지 |
| HUD |hud,hudTop,hudCorner,mmWrap,skBar,mmLvl,globeHP,globeMP에 on 추가 |
| 음악 |BGM.play(BGM.stageKey(G.stage),true) |
| 미호출 |PRO/INTRO 컷씬,구 내레이션,_startIntro()의 기상 대사·커튼·키안내 |
| 다른 캐릭터 |기존 동작 유지 |
| 진단용 예외 |?cutscene=1 명시적 미리보기만 기존 컷씬 허용 |
| 검증 |신규 생성 영상/스킵 뒤 직접 플레이,story 쿼리 없는 기존 대검전사 직접 플레이. 회귀 테스트19개 PASS |
