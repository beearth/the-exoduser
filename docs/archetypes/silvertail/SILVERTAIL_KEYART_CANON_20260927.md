# 실버테일 이미지·영상 현행 계약 (2026-09-27)

> 2026-09-28 현행: **선대 소환체 · 묘왕 바르칸**, “플레이어가 소환하는 선대의 영체”. 오른쪽은 “대검전사” 캐릭터 정보와 전사 초상화(CHAR_VISUALS[0].bust)를 표시한다. 호흡·천·유물이 움직이는 투명96프레임 v3 스프라이트(셀384×624, 8×12, 24fps/4초)와 바닥·구조물을 고정한 독립 배경 영상(v2, 1920×1088, 24fps/12.083333초)을 사용한다. 이전 정적 원화와 v1 전체 신체 영상은 제작 이력이다. [생성·안정화·검수](<../../5.0애니메이션파이프라인/LOBBY_VARKAN_SPRITE_VIDEO_20260928.md>).


최신 사용자 지시에 따라 로비·선택창은 교체 전 초상화와 3초 idle 영상을 복원했다. 아래 PNG2장은 보관용 키아트이며 현행 CHAR_VISUALS는 참조하지 않는다. 최신 매핑은 문서 끝 복원 표를 따른다.

| 역할 | 프로젝트 파일 | 원본 파일 | SHA-256 | 화면 적용 |
|---|---|---|---|---|
| 대표 키아트 | `assets/charselect/silvertail_solo.png` | `실버테일솔로.png` | `B43F0CB4DF5E8F028A8787615AF8153E16FDEEE86C644AB15E9D070709A9CB57` | 보관용 키아트(현재 선택/로비 미사용) |
| 타이틀 키아트 | `assets/charselect/silvertail_title.png` | `ChatGPT Image 2026년 8월 1일 오후 09_48_11.png` | `A75F39F8B6FB509B2318B3365BA2D6A1AD7E644EC89F5ADD0A1EB27C47392B2D` | 보관용 타이틀(현재 썸네일 미사용) |

`index.html`의 실버테일 CHAR_VISUALS는 복원한 silvertail_cut.png/portrait_silvertail.png/idle_silvertail.mp4/poster_idle_silvertail.jpg를 사용한다. 위 PNG2장은 원본 보관용이다. 로비 영상은 contain으로 전체 프레임을 표시한다.

전투용 `img/exoduser_silvertail/` 48px 방향 시트, 공격·이동 애니메이션, UI 아이콘, VFX, 오디오는 **키아트가 아닌 런타임 자산**이다. 플레이를 유지하기 위해 보존한다. 과거 턴어라운드·웨폰 바이블에서 텍스트로 확정한 장비 계약은 `SILVERTAIL_LOCKED_SPEC_v1_2.md`에 남아 있으나, 제거한 참고 이미지는 더 이상 현행 레퍼런스로 인용하지 않는다. 새 키아트의 손에 든 검 표현은 기존 등 허브 장비·게임플레이 규칙을 자동으로 변경하지 않는다.

제거한 선택 화면 자산·문서 원화 42개와 구 루트 미리보기·8시점 시안 2개, 합계 44개의 복구용 로컬 백업은 `tmp/silvertail_art_backup_20260927.zip`에 두었다. 배포·런타임에는 포함하지 않는다.


## 2026-09-27 선택 캐릭터와 로비 전체 장면 일치

| 항목 | 현행 규격 |
|---|---|
| 사용자 확정 | 로비 표시 이미지는 선택 캐릭터와 일치. 선택 실버테일 뒤/우측 외곽에 랜덤 전사 배경이 남는 상태 금지 |
| 구조 | #lobbyCharPreview/video 및 #lobbyCharKeyart/img를 .lobby-left 안에서 #lobby 직계 자식으로 이동. 선택 시 #lobbyBgImg visibility:hidden,선택 해제 시 복원 |
| 매핑 | _updateCharDisplay의 기존 CHAR_VISUALS[s.charIdx 또는0] 공통 데이터로 이름·직업·영상·정적 이미지 표시. 영상이 있으면 idleVid,실패/재생 거절 시 같은 캐릭터 poster 우선·portrait 폴백. 영상 없는 경우 poster 또는 portrait 표시,keyart 플래그에 의한 숨김 제거 |
| 실버테일 | 기존 공식 assets/charselect/silvertail_solo.png?v=20260927을 전체 선택 장면으로 사용. 썸네일은 공식 bust 유지. 신규 이미지·영상 생성/변형 없음 |
| 늦은 응답 | 정적 폴백 콜백에서 _selectedCharDisplay!==s이면 무시. 캐릭터 전환 시 preview.onerror 초기화,선택 해제 시 video src/poster 및 정적 src 제거 |
| 영상 재사용 | getAttribute(src)의 물음표 앞 경로와 idleVid 경로를 비교하여 같은 영상의 불필요한 reload 방지. 기존 idleRate 유지 |
| 구도 | 선택 미디어는 lobby-ancestor-art.css 현행 오버라이드: inset0,width100%,height100%,object-fit:cover,object-position:center center,transform:none,mask-image:none. 원본 종횡비 보존, 창 비율 차이는 가장자리 크롭. 정적 이미지 z-index1/영상2, 좌·우 UI3; 65%/55% 축소 해제(2026-09-29 사용자 정정) |
| 캐시 | index.html:ui-refinement.css?v=20260927-selected-scene |
| 검증 | 신규4회귀(정적 선택/영상 실패/이전 영상 늦은 실패/선택 해제)와 선택정보·동기화 포함16개 통과. 실제 CSS/함수 격리 브라우저1600×900 실버테일 표시 및 전사 영상 오류 후 전사 포스터1개만 표시 확인. 실물 게임패드·실계정 저장 미검증 |
| 기록 | tmp/lobby-selected-scene/silvertail.png,warrior-fallback.png,report.json,changes.patch. 기존 터미널/.git 제한으로 커밋 미완료 |


## 2026-09-27 전체화면 선택 이미지 잘림 수정

| 항목 | 현행 규격 |
|---|---|
| 원인 | 선택 미디어 width135%/145% 및 음수left와 cover가 전체화면에서 원본 글자·머리·목을 잘라냄. 해당 확대 규칙 폐기 |
| 선택 이미지·영상 | #lobby 직계 .lobby-char-preview: inset0,width100%,height100%,object-fit:cover,object-position:center center,transform:none,mask-image:none. 원본 비율 유지하여 전체 화면 배치. 정적 이미지 z-index1/영상2, 좌·우 UI3(2026-09-29 사용자 정정) |
| 비율 | 2026-09-29 현행: 원본 종횡비 유지. 표시 배율 max(뷰포트폭/원본폭,뷰포트높이/원본높이), 중앙 cover로 전체 화면 채움. 창과 원본 비율이 다르면 가장자리만 크롭; 임의 추가 배경 이미지 없음 |
| 우측 패널 | 사용자 대안 수용: .lobby>.lobby-right background:#100d0e!important로 자기 열을 화면 상하·오른쪽 끝까지 채움. 기존 장식 프레임·안쪽 문양·컨트롤 유지. 이전 외곽 투명 계약의 로비 부분은 이 규칙으로 대체 |
| 캐시 | index.html ui-refinement.css?v=20260927-selected-fit |
| 검증 | 실제 HTML/CSS 격리 렌더2560×900,1920×1080,1600×900,960×540에서 원본 전체 포함·선택 영역과 우측 패널 겹침 없음·횡넘침 없음. 2560×900 표시1588.35×900/가용1664×900,전체 문구와 머리·발 시각 확인. 기능/저장 변경 없음 |
| 기록 | tmp/lobby-selected-fit/report.json,ultrawide.png,changes.patch. 기존 터미널/.git 제한으로 커밋 미완료 |


## 2026-09-27 실버테일 이전 초상화·애니메이션 복원 및 영상 잘림 방지

| 항목 | 현행 규격 |
|---|---|
| 사용자 결정 | 실버테일 애니메이션 전환 요청 후 초상화 교체 이력 확인,이전 초상화·영상 복원 방향으로 진행. 정적 키아트만 표시하던 당일 변경을 대체 |
| 복원 | tmp/silvertail_art_backup_20260927.zip에서 assets/charselect/silvertail_cut.png,portrait_silvertail.png,poster_idle_silvertail.jpg,idle_silvertail.mp4 4개 원본 바이트 복원. 기존 PNG2장은 삭제하지 않고 보관,CHAR_VISUALS에서 미사용 |
| 연결 | CHAR_VISUALS[1] portrait=silvertail_cut.png,bust=portrait_silvertail.png,idleVid=idle_silvertail.mp4,poster=poster_idle_silvertail.jpg. 네 경로 v=20260927-restored. 기존 bg_scene2.png?v=1/bg_scene2_loop.mp4?v=1 복원. comingSoon:true 유지 |
| 영상 | 실버테일1280×720/3초,기본1배속·muted/loop/playsinline. 로비 및 선택창 기존 video 경로로 재생,오류 시 같은 캐릭터 포스터·정적 초상화 사용 |
| 목 잘림 | 전사 원본 및 로비 중간 프레임에 머리 정상. #charVisualPop .cs-idle-vid 기본cover→contain/center top/transform:none,21:9 이상 scale1.15/scaleX1.1 제거. 로비 contain 배율 유지 |
| 검증 | 실제 로비 영상 실버테일0.2초/1.5초 프레임 축소 샘플값279839597/268599186으로 동작 확인. 초광폭2560×900 선택창 전사3840×2160/5.541667초 및 실버테일1280×720/3초 모두 contain/transform none 확인. 관련10개 회귀 통과 |
| 생성·기록 | 새 Higgsfield 영상 생성 제출 없음. tmp/silvertail-animation-restore/에 백업·복원 자산 목록·브라우저 캡처·report.json·코드/문서 changes.patch. 기존 터미널/.git 제한으로 커밋 미완료 |

## 2026-09-28 사용자 지정 레퍼런스 복원

7월 실버테일 이미지 12개를 [원화·기획 레퍼런스](./refs/README.md)에 원본 이름으로 복원했다. 앞선 제거 기록은 정리 당시 이력이다. 이 자료는 현행 로비·선택 화면 매핑이나 장비 계약을 변경하지 않는다.


## 2026-09-28 선택창 영상 수명·캐릭터 폴백 정합성

| 항목 | 현행 계약 |
|---|---|
| 닫기 | index.html _closeVisualSelect가 취소/이름 확정/화면 전환 시 csIdleVid·csSceneVid를 정지하고 src/poster·5000ms 스톨 타이머·미디어 이벤트를 해제. 재열면 선택한 기존 영상과 포스터를 다시 지정 |
| 이전 오류 | selectVisual의 _visualPreviewSeq/isCurrent가 새 선택 또는 창 닫기 이전의 오류·canplay·180ms 초상화/배경 콜백을 무시. 실버테일 선택 뒤 전사 늦은 폴백은 전사 표시나 실버테일 정지를 일으키지 않음 |
| 아트 계약 | 기존 영상/포스터/초상화 파일·캐시 경로·전사0.75배속·실버테일 comingSoon·contain 비율 유지. 새 이미지/영상 생성·수정 없음 |
| 증거 | 실제 Node 서버 페이지의 전후 미디어 재생/선택 정합성 및960×540/1920×1080 취소·재열기 확인. 신규17회귀와 관련187건 통과. tmp/lobby-creation-overlays/browser-report.json. 전체 팝업·키보드 계약은 캐릭터선택_리모델링_기획서.md의 같은 날짜 표 참조 |


## 2026-09-28 외형 재선택 영상 재시작 방지

| id / 적용 위치 | 현행 계약 |
|---|---|
| 원인 | selectVisual이 idleVid/sceneVid의 물음표 앞 경로를 src.endsWith로 비교. 실제 src에는 ?v=20260913-detail1 또는 ?v=20260927-restored 등이 남아 같은 캐릭터 재선택도 다른 영상으로 판정. 960×540 전사 영상2초에서 재클릭 후 emptied/loadstart 발생·0.213648초로 재시작 확인 |
| csIdleVid | idle.getAttribute('src')!==ch.idleVid 또는 idle.error가 있으면 on 클래스 제거·src 지정·load 실행. 동일한 전체 경로·쿼리이며 오류 없으면 기존 영상과 currentTime 유지. _isrc/split('?')/endsWith 비교 제거 |
| csSceneVid | 정적 초상화+씬 영상 분기의 vid.getAttribute('src')!==ch.sceneVid 또는 vid.error일 때만 src 지정. 동일 버전 재선택은 재로드하지 않음. 분기 내 _src/split('?')/endsWith 비교 제거 |
| 버전·실패 | 파일 경로가 같아도 쿼리 버전이 바뀌면 영상 교체. MediaError가 있는 같은 주소는 재선택으로 다시 로드하여 정상 복구 가능. 정상 영상만 재사용하며 재시도 경로를 차단하지 않음 |
| 수명·UI | selectVisual의 _visualPreviewSeq/isCurrent와 기존 오류·180ms 폴백·5000ms 스톨 보호 유지. 닫기에서 src/poster·이벤트·타이머 해제, 재열기에서 선택 영상 재생. 전사0.75배속·실버테일1배속/comingSoon:true·포스터/초상화·contain 비율 및 선택/초점/스크롤 계약 유지. 새 미디어나 세이브 필드 없음 |
| 실제 재선택 | Node 서버 원본480×360/960×540/1920×1080×2외형×클릭·경계 방향키 유지=12조건. sceneVid 분기는 기존 bg_scene1_loop.mp4?v=2로960×540 클릭/Home의2조건. 총14조건 모두 currentTime 연속 증가·emptied/loadstart0·선택/출시 잠금·속도 보존 |
| 실제 교체·재시도 | 버전 교체7조건(아이들6/씬1), 캐릭터 교체6조건, 취소·재열기6조건 통과. 아이들/씬 GET를 각각 일시404로 실패시키고 같은 버튼 재선택: MediaError4→null·readyState4·loadstart 확인2조건. pageerror0/쓰기 요청0 |
| 회귀 | lobbyCreationOverlayLifecycle17→25건. src 속성·대입과 currentTime/load를 반영한 미디어 대역으로 동일 버전 재사용·쿼리 변경·캐릭터 변경/이전 폴백·오류 재시도를 각각2분기 검증. 첫23건2실패/21통과, 재시도25건2실패/23통과→최종25통과. 관련12파일209건/inline script4개 구문 통과 |
| 기록·범위 | tmp/lobby-preview-reselection의 browser-before.json,browser-matrix.json,lifecycle.json,summary.json,red-tests.txt,retry-red-tests.txt,tests.txt,changes.patch. 코드·테스트와 관련 문서9개를 함께 검토 가능한 패치로 정리. 현재 환경의 .git 쓰기 제한으로 이번 변경 커밋 미완료; 기존 스테이징은 보존 |
