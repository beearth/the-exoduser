# 대검전사 생성 직후 스토리 재생 — 2026-09-10

| 항목 | 현재 구현 |
|---|---|
| 시작 | index.html 이름 입력 후 생성 저장 성공 → `_afterCharacterCreated(name,visualIdx)` |
| 대상 | `visualIdx===0`, CHAR_VISUALS의 exoduser_warrior. 2026-09-10 실버테일1은 `comingSoon:true`로 신규 생성 단계에서 차단. 기존 다른 캐릭터의 목록·입장은 유지 |
| 저장 경로 | 오프라인 `/api/save`, 서버 없는 localStorage 폴백, 온라인 Supabase 성공 모두 연결 |
| 저장 실패 | 중복 이름·실패 응답에서는 영상 시작 안 함 |
| 재생기 | `character-story-player.js`, `ExoduserCharacterStory.play()` Promise, 중복 호출 시 동일 Promise |
| 영상 | `video/warrior_story_v22_bgm.mp4`, v21 영상+BGM, SHA256 ebc651acb31763cc1b9a216a378e953b8f43ba3ea8379736bf748d6fbf914164 |
| 규격 |96.4초5784f,1920×1080/60fps,H.264/AAC스테레오,87,255,213 bytes |
| 소리·자막 |영상 내 영어 음성·주제가 BGM·한글 고정 자막22cue,muted=false/volume=1. 로비 BGM·호버음·선택 영상 정지 |
| 화면 |검정 전체 뷰포트,object-fit:contain,네이티브 재생바 제거·우측 하단 조작 안내는 재생 시각3초부터0.4초 페이드 후 숨김 |
| 건너뛰기 |클릭·확인 입력으로 다음 대사,Esc·게임패드B/Start·하단 버튼1200ms 홀드로 전체 종료. 재생 중 로비 입력 차단 |
| 자동재생 차단 |NotAllowedError이면 클릭하여 계속 표시,첫 확인 입력은 대사 이동 없이 소리 있게 재생 재시도 |
| 종료/스킵 |미디어 pause·src 제거·load·overlay 제거,Promise true. `showCharGate(charId,true)` |
| 진입 |기존 로딩1200ms 후 `game.html?...&story=warrior-v21`,생성한 슬롯/온라인id 유지 |
| 게임 후속 |신규 stage0·cutsceneDone=false이면 네메시스 INTRO부터 재생. 완료 저장은 직접 플레이. 구 한글 전쟁 PRO는 일반 입장에서 생략 |
| 미디어 오류 |Promise false,story 매개변수 없이 게임 진입 후 네메시스 INTRO. 구 전쟁 PRO로 폴백하지 않음 |
| 저장 계약 |시청 플래그를 세이브·계정·localStorage에 추가하지 않음. 현재 진입URL만 사용 |
| 기존 입장 |목록의 기존 캐릭터는 stage·game.cutsceneDone에 따라 네메시스 INTRO 또는 직접 플레이. 구 전쟁 더빙은 생략 |
| 배포 패키지 |build-nwjs.mjs FILES에 player 추가,video 폴더 기존 복사로 MP4 포함. 배포/실행파일 재빌드는 이 작업 범위 아님 |

검증: test/characterStoryCreation.test.js는 저장 성공/실패,오프라인 버튼 override,ended/skip/error cleanup,네메시스 INTRO 진입·구 전쟁 더빙 미재생을 검사한다. tools/verify_character_story_creation.py는 격리 Chromium에서 생성 UI를 클릭하고 실제 MP4 재생·오디오 디코드·로비 음악 정지·게임 연결을 검사한다. 저장 API만 브라우저 내부에서 대체하여 실제 사용자 슬롯을 쓰지 않는다. 부분 스킵 당시 브라우저 결과는 output/cinematic/character_story_controls_20260910/qa.json과 스크린샷 참조.

언어 제한: 이번 요청은 승인된 합본 그대로 연결한 것으로 영상 속 한글 자막은 언어 선택에 따라 바뀌지 않는다. PROLOGUE_LINES 번역은 명시적 cutscene=1 미리보기, 네메시스 INTRO 번역은 일반 신규 입장에서도 사용한다.

## 이전 수정 이력 — 전체 차단은 아래 네메시스 복구로 대체

| 항목 | 확정 동작 |
|---|---|
| 모든 캐릭터 일반 진입 |G._cutsceneDone=true,G.on=true,P.iframes=300 |
| 기존 모닥불 |존재하면 t=300 유지 |
| HUD |hud,hudTop,hudCorner,mmWrap,skBar,mmLvl,globeHP,globeMP에 on 추가 |
| 음악 |BGM.play(BGM.stageKey(G.stage),true) |
| 미호출 |PRO/INTRO 컷씬,구 내레이션,_startIntro()의 기상 대사·커튼·키안내 |
| 실버테일1 포함 |구 PRO/INTRO 자동재생 없이 직접 플레이 |
| 진단용 예외 |?cutscene=1 명시적 미리보기만 기존 컷씬 허용 |
| 검증 |신규 생성 영상/스킵 뒤 직접 플레이,story 쿼리 없는 기존 대검전사 직접 플레이. 회귀 테스트21개 PASS |

### 이전 구현 이력 — 구 한글 더빙 경로 전체 차단 (현재는 INTRO 복구)

직전 수정은 `_charIdx===0` 조건 때문에 실버테일1에서 구버전이 계속 재생됐다. 현재 `_startIntroCutscene()`는 `!_forceCutscene`이면 캐릭터 종류에 관계없이 즉시 플레이로 반환한다. 구 `_proVoice`(`bgm/공통/intro_voice.mp3`)의 play 호출에 도달하지 않는다. 새 v21 영화는 남전사 생성 때만 재생한다. 다른 캐릭터의 선택·공격·피격·게임 중 대화 음성은 변경하지 않는다.

| 검증 | 결과 |
|---|---|
| 남전사0·실버테일1 × story 쿼리 유/무 |구 컷씬 상태 null,게임 on,true,구 내레이션 호출0 |
| 브라우저 실버테일 입장 |charIdx1,구 intro_voice.mp3 play 호출0,구 음성 paused |
| 회귀 테스트 |21개 PASS |
| 증거 |output/cinematic/legacy_story_disabled_20260910/qa.json |


## 2026-09-10 대사 단위 부분 스킵

승인된 v21 MP4를 게임 내 전체 화면 컷씬으로 표시하며 브라우저 재생바를 제거했다. 실시간 게임 캐릭터 렌더로 재제작한 것은 아니다. 입력하지 않으면 기존 편집·음성·쉼을 유지한다.

| 항목 | 현재 구현 |
|---|---|
| 부분 스킵 |화면 클릭, 다음 대사 버튼, Enter, Space, ArrowRight, 패드 A(0)/X(2)/Y(3) → 다음 대사 시작 |
| 탐색 기준 |`CUES.find(t=>t>video.currentTime+.05)`, 22개 시작점. 마지막 대사에서 다시 넘기면 종료 |
| 동기화 |하나의 video.currentTime을 이동하여 영상·내장 음성·고정 자막 함께 탐색 |
| 전체 스킵 |Esc, 패드 B(1)/Start(9), 건너뛰기 버튼을 1200ms 연속 홀드 |
| 홀드 게이지 |HOLD_MS=1200, 16ms 간격으로 Date.now 경과시간 / HOLD_MS, 폭 0~100% |
| 홀드 취소 |키·버튼 해제, 포인터 이탈/취소, 창 blur/visibilitychange. keyboard/pointer/gamepad 소스별 Set 관리 |
| 로비 입력 |컷씬 중 패드 로비 조작 차단. 키보드 반복 입력 무시, Tab은 다음 대사 버튼 포커스 |
| 화면 |검정 전체 뷰포트 contain, z-index2147483647, video pointer-events:none/tabIndex=-1, 네이티브 controls=false/PiP·원격재생 비활성 |
| 조작 표시 |`characterStoryHints`: 오른쪽·아래3%, 버튼 간격22px, serif13px/자간.06em, 버튼 세로패딩10px, 게이지2px. video.currentTime≥3인 첫 timeupdate에서 opacity0으로0.4초 페이드, 이후 visibility:hidden. 숨김 시작부터 pointer-events:none, 해당 재생 중 다시 나타나지 않음 |
| 숨김 후 입력 |화면 클릭·키보드·패드의 부분/전체 스킵 유지. 숨긴 안내 버튼은 포커스 대상에서 제외하고 Tab은 overlay에 유지. 자동재생 차단 시 영상이 진행하지 않으므로 클릭하여 계속 안내 유지 |
| 언어 |play에 getCurrentLanguage 전달. ko: 다음 대사·클릭하여 계속·Esc / B 길게, 그 외 영어. 건너뛰기 명칭은 기존 _TL 사용 |
| 자동재생 차단 |NotAllowedError 시 클릭하여 계속 표시. 첫 확인 입력은 시간을 넘기지 않고 유음 재생 재시도 |
| API |next(), setSkipHeld(held,source='gamepad'), CUES, HOLD_MS 공개. skip()은 내부 즉시 종료 API로 유지 |
| 정리 |종료 시 홀드 타이머·리스너·미디어·overlay 제거, 기존 포커스 복원. 중복 완료 방지 |
| 캐시 |index.html의 character-story-player.js?v=20260910-hints-fade |
| 안내 숨김 검증 (2026-09-10) |기존 controls/creation 테스트22개 PASS. 실제 v22 브라우저 재생0.156초에서 opacity1/visible, 이후 opacity0/hidden/pointer-events:none 확인. 숨김 상태 Enter로29.39초→33.63초 대사 탐색, 안내 숨김 유지. `tmp/story_hint_preview_20260910.html`에서 세이브 없이 검증 |
| 자동 검사 |관련 Node 테스트24개 PASS. CUES 원본 일치·짧은 홀드 취소·입력 소스 분리·cleanup 검사 |
| 브라우저 검사 |클릭→5.5초, Enter→10초, Space→16초. Esc350ms 해제 후 유지, 1200ms 홀드 후 game.html 진입. 실제 저장 대신 격리 API 사용 |
| 증거 |output/cinematic/character_story_controls_20260910/qa.json 및 cinematic_partial_skip.png. page_errors=[] |

### 부분 스킵 시작점 — 초

| ID | 시작 | 대사 |
|---|---:|---|
| wa02 |1|전쟁에서 살아 돌아온 한 남자. |
| wa04 |5.5|하지만 집은 모두 불타 사라졌다. |
| wa06 |10|이웃이자 친구였던 킬루가 그의 가문을 짓밟았다. |
| wa08 |16|아내는 몸종으로 끌려가 온갖 몹쓸 짓을 당했고, |
| wa09 |22.5|끝내 못 이겨 스스로 목숨을 끊었다. |
| wa11 |28|아이들은 노예로 팔려가 어디에 있는지조차 알 수 없다. |
| wa12 |33.5|늙은 부모는 감옥에 갇혀 굶어 죽었다. |
| wa14 |39|킬루 가문의 모두가 알고 있었다. |
| wa15 |42.24|31명이 보고도 못 본 척했다. |
| wa17 |46.5|그날 밤, 킬루 가문을 모두 죽였다. |
| wa19 |51|칼로 킬루의 팔다리를 자르고 |
| wa20 |53.48|불로 지혈까지 해주며 |
| wa21 |56.019999999999996|오래오래 살려두었다. |
| wa22 |59.5|"기억하라." |
| wa23 |59.98|"그리고 지옥에서도 후회하라." |
| wa24 |65|그리고 지옥에 떨어진다. |
| wa26 |70.67|"...이것은 셀 수 없는 복수자 중 하나의 이야기일 뿐." |
| wa28 |76|"지옥의 미로에는 매일 새로운 영혼이 떨어진다." |
| wa29 |81.5|"분노로 가득 찬 자, 억울함에 미친 자, 사랑을 잃은 자..." |
| wa31 |88|"너는 왜 지옥에 왔느냐?" |
| wa33a |90.33333333333333|"지옥을 탈출하라." |
| wa33b |92.9|"죄의 무게를 짊어진 자여." |


## 2026-09-10 사용자 정정 — 전사 외형·네메시스 인트로 복구

직전의 PRO/INTRO 전체 차단은 잘못된 범위였다. 신규 캐릭터는 구 한글 전쟁 PRO만 생략하고 네메시스·디로이·핵터 INTRO를 재생한다. 이전의 모든 일반 입장 즉시 플레이 기록은 이 수정으로 대체한다.

| 항목 | 현재 계약 |
|---|---|
| 대검전사 생성 |charIdx0 메타데이터 저장 → v21 부분/전체 스킵 가능한 스토리 → game.html에서 네메시스 INTRO → 기상 연출·플레이 |
| 신규 인트로 조건 |!_forceCutscene, G.stage===0, !G._cutsceneDone → _cutSeq='INTRO', _cutsceneState='INTRO_CUTSCENE', G.on=false |
| 기존 진행 |G.stage!==0 또는 G._cutsceneDone이면 직접 플레이. 기존 완료 저장값을 초기화하지 않음 |
| 구 전쟁 더빙 |일반 입장에서 _proVoiceStop(). cutscene=1 명시적 미리보기에서만 _cutSeq='PRO', 구 intro_voice.mp3 재생 |
| 네메시스 음악 |BGM.fadeOut(300), 400ms 후 cutscene_nemesis(네메시아의 강림 V3). 기존 INTRO 효과음·번역·카메라·부분 스킵 유지 |
| INTRO 종료 |G._cutsceneDone=true, 컷씬 해제 → _startIntro(). BGM fade500ms, 600ms 후 스테이지 음악 |
| 외형 원인 |신규 저장에는 charIdx만 있고 player가 없어 복원을 생략, localStorage의 이전 _charIdx가 남았음 |
| dbRestore(d) |d 없으면 false. player 검사 전에 슬롯 charIdx 적용. 정수이며 0 이상 CHAR_LIST.length 미만이면 그대로, 누락·무효이면0 |
| 메타데이터 반환 |외형은 적용하되 player가 없으면 false를 반환하여 신규 스탯·장비·인트로 초기화 유지 |
| 호출 경로 |클라우드 startGameFromDB, 로컬 서버, 로컬 폴백, 웹 localStorage, DEMO 신규 부팅 모두 player 유무와 무관하게 dbRestore 호출 |
| 서버 우선 |로컬 _foundSave는 유효한 서버 슬롯 발견 여부, _loaded는 전체 player 복원 여부. 서버 메타데이터를 오래된 로컬 사본으로 덮지 않음 |
| 서버 실패 |조회 예외·HTTP 실패 후에도 해당 hellsave_<slot> 메타데이터를 읽어 외형 적용 |
| 비동기 외형 |로드 콜백의 idx와 현재 _charIdx가 다르면 이전 atlas 결과 무시 |
| 저장 형식 |기존 charIdx/game.cutsceneDone 사용, 추가 필드 없음. 기존에 잘못 저장된 외형·완료 플래그 일괄 변경 없음 |
| 회귀 검사 |test/characterIdentityIntro.test.js 9개: 메타데이터4종·늦은 atlas·인트로 분기4종. 관련 검사 합계43개 PASS |
| 브라우저 |tools/verify_character_story_creation.py, output/cinematic/character_identity_nemesis_20260910/qa.json |

직전 구버전 차단으로 이미 game.cutsceneDone=true가 기록된 캐릭터는 완료 여부를 구별할 정보가 없어 자동 재시청시키지 않는다. 새로 생성하는 캐릭터에는 네메시스 인트로가 정상 연결된다.

### 브라우저 최종 검증 — PASS

| 시나리오 | 실제 결과 |
|---|---|
| 이전 실버테일1 → 생성 전사0 |charIdx0, INTRO, 구 전쟁 음성 play0 |
| 전사 저장·재접속 |charIdx0 저장, cutsceneDone=true 유지, 네메시스 반복 없음 |
| 이전 전사0 → 새 실버테일1 |charIdx1, INTRO, 오래된 로컬 슬롯0보다 서버 메타데이터1 우선 |
| 서버503 → 로컬 신규 슬롯0 |전역 캐시1보다 슬롯0 우선, INTRO 진입 |
| 스킵 |v21 클릭/Enter/Space 대사 탐색·1200ms 전체 홀드, 네메시스 _cutsceneAdvance 부분 진행 PASS |
| 오류 |page_errors=[], 실제 사용자 저장 쓰기 없음 |
| 테스트 데이터 격리 |캐릭터 전환 사례에서는 이전 페이지의 unload 저장이 다음 사례의 고정 서버 응답을 덮지 않도록 accept_writes=false |
| 산출물 |output/cinematic/character_identity_nemesis_20260910/qa.json, nemesis_restored.png |


## 현재 오디오 — v22 BGM 적용

v21과 동일한 영상에 무가사 「심연의 탈주」를 합성한 v22를 재생한다. 대사 중 음악은 절반으로 낮추고 영상·음성·자막·음악을 같은 시각으로 탐색한다. [믹스·검증 전체 계약](WARINTRO_BGM_V22_20260910.md).
