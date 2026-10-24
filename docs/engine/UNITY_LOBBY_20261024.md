# UNITY-LOBBY-01 — 실행 첫 화면·인트로·로비

사용자 최신 지시 “일단 게임 로비부터 인트로 시네마틱같은것들만 잘 옴겨”가 최우선이다. 드랍·전투 확장·새 맵/모션/이펙트는 이번 단위가 아니다. Godot본·웹·사용자 저장·공유 main/INDEX480과 열린 사용자 앱은 보존한다.

| 항목 | 원본과 구현 |
|---|---|
| SSOT | 현재 G:/exoduser/index.html SHA256 `8bff9fd683b274fc538df531e7b007ec7c5e60e7317744948ffc2e5b4f088621`. E:의 이전 index SHA95c7d29.../v15 영상과 다르므로 최신 G: 참조. source7파일 SHA256·원문을 I: source-snapshot에 보존 |
| 실행 경로 | FDG 로고 영상→여캐 타이틀 영상/브랜드→지옥문 첫 프레임/ENTER→문 열림→세계관 v17→로비. 원본 phase0 경고문은 제거 상태여서 다시 추가하지 않음 |
| FDG | 원본3.2초, 재생 시각 진행이12초 없으면 엠블럼 폴백3.2초 후 전환. 준비된 영상의 정지도 감지. 클릭/키 같은 프레임이 다음 화면까지 관통하지 않음 |
| 타이틀 | title_motion_hd_20260929.mp4 무음 loop, 실패 시 SD, 실패 시 원본 plate. 원본 splashTitleBrand SVG를1983×793으로 raster·clean plate 임베드/Georgia font, 원본 crop 수식 사용. 폰트 raster 완전 동등성 미검증 |
| 지옥문 | intro.mp4 첫 프레임 pause/무음, ENTER로 실제 재생·음량.6. BGM4곡 중1곡.6 시작, 문 끝/3초 진입 정지/15초 hard timeout/오류 시 세계관으로 전환 |
| 세계관 | 원본 world_intro_v17_blood_en.mp4 byte exact77,065,370bytes. 영어 voice1, 연속 BGM을1초에.6→.22 duck. 원본17 next-cut 시각과5초 ESC/SPACE 전체 스킵, replay/오류 재시도/일시정지. 컷 넘기기는 음악 시계를 seek하지 않음 |
| 자막 | 원본29언어×32큐·timings/문장을 typed Resources JSON으로 복사. 영상 time으로 현재 cue 표시. NanumMyeongjo와 기존 Noto폰트 사용, 전체29폰트/아랍어 shaping/RTL/현지화는 미검증 |
| 로비 | 원본 crypt 영상 loop/포스터, 바르칸 v3 atlas3072×7488/8×12/96frames/24fps·384×624cell·원본 baseline/foot배치, 원본 로고/입장 artwork. lobby.mp3 .65 loop |
| 수명 | Native VideoPlayer URL+RenderTexture+AudioSource, frame0/끝/오류 콜백. generation으로 오래된 prepare 무효화. 포커스 허용과 재생 의도 분리해 준비 중 창 전환에도 백그라운드 재생 차단, 음악 복귀 상태도 독립. 영상 오류 시 음악 pause/실제 playing 후 resume |
| 렌더 | 1920×1080 uniform fit/letterbox로 영상 왜곡 방지. 원본 title/ENTER 아트 matte alpha를 source cin-logo-art.js의 round(255×clamp((maxRGB−8)/24))로 변환. 원본은 G:와 I: source-art에 보존 |
| 미디어 | 원본24개167,537,430bytes. 원본 video6/audio5/이미지와 derived matte2·WebP→PNG·SVG→PNG·문 frame0 PNG, 각각 source/목적지 SHA256 명세 Tools/Fixtures/lobby-assets.json. 새 이미지 생성0. 원본 MP4는 StreamingAssets에서 byte exact |
| 기준 타깃 | Unity의 full/offline 프런트엔드 표본. 웹 reference는 원본 지원 flag EXODUSER_BUILD_TARGET=full, test=1, 독립 browser context/빈 슬롯, POST 등 전송 차단. 웹 기본 demo welcome/auth 페이지를 full/offline 로비로 가장하지 않음 |
| 저장 경계 | 로비는 빈 캐릭터 목록으로 시작, 생성/기존 저장 불러오기는 미구현 표시/비활성화. 기존 사용자의 슬롯/계정에 접속하거나 임의 저장하지 않음. ‘Unity 전투 검수(임시 캐릭터)’만 격리 시작장비 전투로 연결 |
| 게임 차단 | 프런트엔드 표시 중 NativeGame Tick/입력/기존 HUD/메뉴 차단·world cullingMask0. 임시 전투 선택 후 실행. 전투 메뉴의 로비 복귀 연결. 기존 combat/HUD/inventory CLI QA는 명시 플래그에서 프런트엔드를 건너뜀 |

## 검수 단계

| 단계 | 실제 근거 |
|---|---|
| 모델 | Core65검사 및 실제 NativeLobbyVideo adapter의 좁은 Unity boundary doubles11검사. FDG 준비 후 stall/async blur autoplay 수정 전 행동RED·수정 후GREEN. [소스/테스트 경계](UNITY_LOBBY_CORE_20261024.md) |
| Player gate RED | 기존 inventory combat Player에 새 frontend gate를 실행: 프런트엔드 receipt/영상decode/화면/자막/자연끝/전환16검사 FAIL, 기존 무예외 검사1개만PASS. 단순 파일 존재/컴파일 성공을 실제 재생으로 세지 않음 |
| 정적 컴파일 | 설치된 Unity assemblies 대상으로0오류. 실제 Editor/decoder/출력과 별도 |
| 실제 Editor | I:/EXODUSER-Storage/qa/unity-lobby-20261024/lobby-verify-2026-10-24T11-07-21-792Z PASS/process0. source24미디어·29×32자막·17컷·atlas원본규격·기존HUD GPU/core까지 확인. 수정 후 최신 focus/완주flag 코드의 Player 검수는 진행 중 |
| 실제 Windows/Player | source checkpoint 원격 보존 뒤 독립 I: 프로젝트에서 build/실제 프런트엔드 검수 예정. 아직 자연 영상 끝/음성·BGM 분리 출력·GUI PNG PASS로 표시하지 않음 |

후속 Player fixture는 실제 decoder의 프레임 진행·GPU nonblack·음성/음악 출력·세계관 자연 종료 원인·원본 그림/자막·replay/5초 skip·게임 차단/명시 임시 진입을 검사하고 화면을 저장한다. 이 플래그에서만 포커스를 유지하므로 OS 포커스 직접 입력 인수와 구분한다. 사람의 직접 클릭·모든 해상도·모든 글꼴·전체 CSS/hover/fade·게임패드·캐릭터 생성/저장/계정·캐릭터별 서사/완전 게임 로비는 남아 있다.

**VISUAL VERDICT: RETOUCH.** 원본 브라우저와 실제 Unity 화면을 비교해 계속 보정하며, 모델 통과로 전체 로비/시네마틱 이식 완료를 주장하지 않는다.
