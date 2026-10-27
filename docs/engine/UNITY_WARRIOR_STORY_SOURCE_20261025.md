# 신규 전사 이야기 원본 인수 — 2026-10-25

> 2026-10-27 현재 영상은 `main` `d038ba4ab4191921c4e5a52ce92a903e27554244`의 킬루 피눈물 v3 **94,795,327B / SHA-256 `8b8248424b63d808dc225576fda44e39d459709963f97923ffaa38a51dba28ab`**다. 아래 97,796,468B·`277fbe09…`와 `unity/Tools/warrior-story/`의 검증 JSON은 2026-10-25 인수 당시 원본의 이력이다. 현재 Unity StreamingAssets/복구 manifest의 값은 [Mac 미디어 입력 동기화](UNITY_MAC_WARRIOR_STORY_20261025.md#2026-10-27-킬루-피눈물-v3-미디어-입력-동기화)를 따른다. 22컷·29언어×22자막/1.2초 hold 계약은 변경하지 않았다.

지원 범위는 현재 PC·Mac에서 동일한 기존 인게임 자료의 추출·수명 계약이다. 새 영상 생성/인코딩/업로드/Unity UI·모델 중복 구현·공유INDEX 변경0. 재생·입장 연결과 실제 decoder/화면/입력 검수는 기존 Mac 구현 담당의 소유다.

## 실제 파일·데이터

| 항목 | 정본 / 이번 산출 |
|---|---|
| JS | character-story-player.js / SHA e44a78225e4ecd234609836529d51b350e82d219070a75db810349770f9c9983 |
| 인게임 영상 URL | video/warrior_story_v23_clean.mp4?v=20261008-killu-montage |
| Mac 실제 원본 | /Users/fordeargamers/Projects/exoduser-migration-20261001/video/warrior_story_v23_clean.mp4 |
| 영상 bytes/SHA | 97,796,468B / 277fbe09c4f5c0b70a98aae6376a8d820a7377cbd6f96a3bc62365cf0a166b34 |
| VTT | video/subtitles/warrior_story_v23_<code>.vtt29개,각22큐/합638큐. 영상하나+선택자막이며언어별영상을발명하지않음 |
| KO VTT | 1,830B / 37a50ddefc49d231cbf46eaa6af23428e71155418a7fc2a2a0fba8030c1e4d69 |
| EN VTT | 1,747B / fd4e9d1e92aa45fbe872691a51399c035b9ea7e716309e88a7db5e34c46506c6 |
| PC 확인 | G:/exoduser HEAD5659d14d,위JS/영상/KO·EN실물과Mac1회추출SHA정확일치. 인게임연결자료일치이며별도최신마케팅후보승인주장이아님 |
| 런타임 데이터 | warrior_story.json의schema/video/cuts22/holdSeconds1.2/captions29×22/controls29×5. 기존LobbyCaptionLanguage의start/end/text와같은필드 |
| 상세 provenance | warrior-story-source.json: 원본32파일(Script·번역제어·영상·VTT29) SHA/bytes, VTT id/settings/원문제어라벨. 원VTT내markup없음/settings빈문자열확인 |

## 원본 수치·영상 제어

| 항목 | 정확 계약 |
|---|---|
| CUES22 | [1,5.5,10,16,22.5,28,33.5,39,42.24,46.5,51,53.48,56.019999999999996,59.5,59.98,65,70.67,76,81.5,88,90.33333333333333,92.9] |
| 다음 대사 | 첫cut중 t>currentTime+.05인것으로video.currentTime이동. 없으면finish(true). paused면resume도시도. VTT는ms정밀도,cut의소수정밀도와동일값으로강제수정하지않음 |
| 스킵 hold | HOLD_MS1200,wallclockDate.now기준·setInterval16ms로진행. 여러입력source의Set을유지하며하나라도남으면timer재시작0. 마지막sourcerelease/blur/visibilitychange는모두취소/진행0 |
| 음향·화면 | 기존 영상의voicevolume1/unmute,object-fit contain,원본nativecontrols/remote/PiP비활성. story시작때lobbyBGM/hover·캐릭터preview비디오정지. story에world-intro BGMduck/5초hold를재사용하지않음 |
| 힌트 | video.currentTime≥3초를처음관측하면opacity.4초/visibility.4초지연으로숨김·pointer입력비활성. 키입력/overlayclick은계속가능 |
| 언어 | ExoduserI18n.resolveLanguage우선,없으면rawko일때ko/그외en. label/controls는번역데이터해당언어→ko/en fallback. zht HTMLlang zh-Hant/ptbr pt-BR/ar dir rtl |

## 입력과 수명

| 이벤트 | 원본 동작 |
|---|---|
| Enter / Right | repeat아닐때advance,다른로비/게임입력으로전파차단 |
| Space down | repeat아닐때keyboard-Space hold추가+advance1회 |
| Escape down | repeat아닐때keyboard-Escape hold추가,즉시닫기아님 |
| Space/Escape up | 해당키source만제거. 다른source가남아있으면hold유지 |
| pointer | skip버튼down이pointer source추가,up/leave/cancel이pointer source제거. skipclick은overlayadvance로전파되지않음 |
| overlay/다음 버튼 | click advance. 다음버튼은전파차단해두번advance하지않음. contextmenu차단 |
| Tab | 힌트보이면다음버튼,숨으면overlay focus. 일반로비focus로빠지지않음 |
| gamepad | index4175~4178: buttons1또는9 hold,just0/2/3 next. 게임패드전체이식완료가아님 |
| 재진입 | activePromise가있으면같은Promise반환. 중복overlay/동시2재생금지 |
| 정상끝/skip | finish(true)1회. ExoduserCharacterStory.skip도finish(true) |
| 실패 | video error 또는NotAllowedError외재생실패는finish(false). NotAllowedError만needsGesture=true로다음버튼재생재시도. 재시도시새캐릭터생성하지않음 |
| cleanup | listener/holdtimer 제거,video.pause/src제거/load로해제,overlay제거,전focus복원,activePromise/현재callbacks null,결과bool resolve |

## 생성·입장 caller gate

원본 index3402~3426의_afterCharacterCreated는 **저장이이미성공한뒤** 실행한다. visual0만전사story를재생하고,그외직업은목록load로돌아간다. 온라인은created name의DB id를찾아쓴다. nativev1은전사0의새Unity목록만사용하므로DB/웹슬롯을읽지않는다.

성공한이름/slot을캡처해선택하고lobbyBGM·preview를정지→story await→같은요청seq일때만showCharGate로진입한다. 저장/재생실패때기존슬롯을다시만들지않고이미저장된이름을유지한다. 원본은seen=false에서도showCharGate를호출한다. Native가실패안내와계속버튼을추가하면그것은명시한UX차이이며정확동일동작으로주장하지않는다.

원본true의URL suffix는`story=warrior-v21`이고실재생파일은v23이다. 이이름차이를version추측으로고치거나별도파일을선택하지않는다. native는URL이없으므로완료bool/현재이름관계만명확히한다. 기존슬롯입장때story를반복재생하거나story시청flag를캐릭터목록파일에새로저장하는것은이번원본에서요구하지않는다.

Native입력에서는이름제출Enter/닫기키의잔여hold가story첫next·skip·이후pause로전파되지않게기존release-fence를연결한다. sourceblur는hold를취소하며Native기존focus영상pause정책과구분한다. 완료/오류/입력동시도착에서입장callback은한번만소비하고pending name/선택/요청수명을확인한다.

## 검증과 다음 단계

새추출자료의29언어집합/각22큐·유효한start<end/순서·제어문구5개·22cut/1.2초를검사했다. JS/영상/KO/ENVTT의PC회신SHA를이미수집한MacsourceSHA와비교해4/4일치했다. 원VTT·caption본문·타이밍·영상바이트변경0. 미디어의전체decode/재생/원본worldintro통과군반복0.

관련docs전체를warrior_story/character-story-player/전사이야기/HOLD_MS로grep한목록을동봉한다. 이데이터와계약을인수하는NativeLobby.CharacterStory/WarriorStoryState의제품owner가원본제약·현재재생범위·실검수·입장1회·미완료를관련docs/작업보드와정상checkpoint에반영한다. 전체스토리·패드·글꼴/RTL·전투세이브이식완료는아니다.
