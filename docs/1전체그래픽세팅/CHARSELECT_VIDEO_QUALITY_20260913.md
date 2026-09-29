# 남전사 캐릭터 선택 영상 선명도 수정 — 2026-09-13

사용자 22:25 스크린샷은 PNG 배경이 아니라 `CHAR_VISUALS[0].idleVid` 영상이다. 초기 로비 이미지 검수는 점묘 여부만 확인해 영상의 원본 디테일 부족을 놓쳤다. 기존 1080p 영상 첫 프레임부터 얼굴·갑옷이 흐리고, 사용자 화면 너비 2503px에서는 기본 cover가 약 1.304배 확대한다. CSS blur 추가가 원인은 아니다.

## 적용 계약

| 항목 | 값 / 위치 |
|---|---|
| 기존 생성 | Seedance 2.5 job `88756648-e041-43b7-b645-e697e6e4a57e`, 1920×1080, 24fps, 145프레임 |
| 복원 | Higgsfield Topaz `2160p`, `16:9`, job `1fe88d22-767a-4085-ad97-d1202296bf31` |
| 복원 원본 | HEVC 3840×2160, 24fps, 145프레임, 16,892,889 bytes |
| 최종 영상 | `assets/charselect/idle_warrior_higgsfield_4k.mp4?v=20260913-detail1`, H.264 3840×2160, 24fps, 133프레임, 11,222,864 bytes |
| 포스터 | `assets/charselect/poster_idle_warrior_higgsfield_4k.jpg?v=20260913-detail1`, 3840×2160, 572,270 bytes, 최종 첫 프레임, JPEG q:v=2 |
| 연결 | `index.html`의 `CHAR_VISUALS[0].idleVid/poster`; `#csIdleVid` 선택 화면과 `#lobbyCharPreview` 로비가 공유 |
| 반복 마감 | 기존 `tools/build_warrior_higgsfield_loop.py` 그대로. 정방향 본문 121프레임 + 끝/처음 12프레임 smoothstep 혼합 |
| 인코딩 | libx264, preset slow, CRF18, yuv420p, GOP24, faststart, 오디오 없음 |
| 속도 | `idleRate=0.75`, 파일 133/24초, 실제 반복 133/24/0.75 ≈ 7.388889초 |
| 확대 | 검수 뷰포트 2548×1255: 기존 1080p cover 배율 약 1.3271 → 4K 약 0.6635. 기본 cover와 21:9 contain/상단/scale(1.15) scaleX(1.1) 규칙 유지 |
| 원본 보존 | 기존 `idle_warrior_higgsfield.mp4`, `poster_idle_warrior_higgsfield.jpg`; UI 연결만 새 파일로 전환 |

## 검수와 한계

| 검수 | 결과 |
|---|---|
| 같은 프레임 비교 | 실제 선택 UI 2548×1255, 영상 시간 0.5초 고정. `output/charselect_quality_20260913/before-still.png`, `after-still.png` |
| 육안 개선 | 얼굴 윤곽·머리카락·갑옷 판 경계와 망토 섬유의 번짐 감소. 기존 인물·칼·구도·관절 동작 유지 |
| 연속 재생 | 5회 경계 간격 약 41.6 / 62.6 / 50.1 / 58.4 / 66.7ms, 페이지 오류 0, 3840×2160 디코딩과 0.75배속 확인 |
| 최종 재생 통계 | 적용 경로로 879프레임 재생 중 dropped 0 / corrupted 0, 경계 6회 약 50.0~58.4ms, 페이지 오류 0. `output/charselect_quality_20260913/playback.json` |
| 실제 UI | 로비 슬롯 선택 및 새 캐릭터 선택 화면 양쪽 3840×2160, 0.75배속 재생과 새 포스터 경로 확인. 저장/생성 작업 없음. `output/charselect_quality_20260913/verification.json` |
| 코드 검사 | `index.html` inline script 4개 Acorn 구문 검사 통과, 새 영상/포스터 파일 및 캐시 경로 존재 확인 |
| 아트 제한 | 1080p 생성본의 AI 복원이다. 네이티브 4K 원화/영상 재제작이 아니며, 기존 칼 표면의 거친 무늬와 일부 재질의 불규칙성은 남아 있다. 디자인 재제작 완료로 판정하지 않는다 |
| 용량 영향 | MP4 2,286,721 → 11,222,864 bytes. 실행 시 추가 AI 처리나 캔버스 필터 없음; 4K 영상 디코딩 비용 증가 |
| 범위 | 이번 교체는 남전사 선택/로비 아이들 영상. 기존 인트로 PNG 검수 완료를 이 영상의 원본 품질 보증으로 해석하지 않는다 |

시각 판정: **선명도 개선 채택**. 칼과 갑옷의 디자인 정합성까지 모두 해결됐다는 판정은 아니다. 재제작 시 선명한 재질과 직선 칼날을 원화 단계에서 확정하고, 실제 움직이는 프레임의 동일성까지 다시 검수해야 한다.


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
