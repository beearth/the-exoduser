# Steam 상점 페이지 상시 관리

최신 사용자 확정: 2026-10-22 KST. 담당 Codex. [운영 규칙 §9](STEAM_UPDATE_RULES.md#9-상점-페이지-주간-최신화-2026-10-22-사용자-확정)를 따른다. 본편 AppID **4749590**, 상점 item **1189321**.

## 운영 기준

- 최소 7일마다 최신 게임과 실제 상점을 대조하고 영상·게임화면·캐릭터·배경·대표/라이브러리 이미지·소개문을 관리한다. 기본 점검은 매주 월요일 10:00 KST이며 큰 승인 변경은 즉시 추가 점검한다.
- 공개판·저장된 초안·베타를 구분한다. 최신 소스 기능과 실제 Steam 배포 기능의 차이는 숨기지 않는다.
- 새 자료는 실제 게임·승인 원화에서 만든다. 미인수 WIP나 부분 네이티브 이식을 완성 본편으로 소개하지 않는다.
- 한 단계가 막혀도 나머지 승인 작업을 진행한다. 새 미디어를 검수하기 전에 기존 것을 먼저 삭제하지 않는다.

## 2026-10-22 점검 (진행 중)

| 구분 | 확인 사실 / 상태 | 다음 실행 |
|---|---|---|
| 로컬 버전 | release-version.json 0.7.7 / 2026-10-22 / ea-full. Steam 설치본 버전은 별도 미확인 | 버전명만으로 미디어 최신 판정하지 않고 실제 source와 촬영 장면 기록 |
| Git 경계 | 시작 HEAD 5659d14d38b8068518cb5866a336bf930a1abbce / origin/main 91e2774b769869e59f80953e148a5c95203b0fea. 공유 INDEX 480경로 보존 | 인수되지 않은 원격/로컬 변경 자동 병합 없음 |
| 상점 접속 | Steamworks 로그인 상태, 본편 상점 공개·미게시 변경 존재 확인 | 초안 저장과 공개 게시 구분 |
| About | 한·영 최신 소개 스틸6+짧은영상3은 10-20 반영 기록. 이번 한국어 편집기에도 실제 참조 확인 | 한·영 실제 렌더·언어별 내용 대조 |
| 상단 영상 | 기존 Story Trailer/게임플레이 교체 미완료. 10-22 인계의 drag/drop 제약 유지 여부 확인 대상 | 업로드 대안은 지원 기능만 사용. 그동안 다른 항목 계속 |
| 갤러리 | 기존 실제 플레이5장의 category를 gameplay로 저장. 새로 읽은5필드 모두 유지·스크린샷 체크리스트 ✔ 확인 | 새 이미지 교체와 별개. 기존4번 OS워터마크·5번 비율 결함은 미해결 |
| 캐릭터·배경 | 최신 승인 에셋과 상점 이미지를 대조할 대상 | 개발 예정 캐릭터와 현재 플레이 가능 전사를 구분 |
| 기본 정보 | 영어 최소·권장 notes의 nline→Online 정정 저장·재조회. Remote Play Together 해제 저장·재조회 | 공개 반영 별도. 온라인 활성화 요구 자체의 기술 검증은 이번 범위 밖 |
| 자동 예약 | 현재 제공된 도구에 이 로컬 프로젝트의 주간 자동화 생성 기능 없음. 예약 미등록 | 예약 기능이 연결되면 아래 지시문으로 생성 후 ACTIVE·다음 실행을 확인 |
| 다음 점검 | 2026-10-26 월요일 10:00 KST 기준. 실제 자동 예약 시각이 아님 | 7일 이내 누락 보충 |

## 주간 실행 지시문

G:\exoduser의 AGENTS.md, 이 문서, STEAM_UPDATE_RULES.md §9, 총괄 마스터와 최신 상점 실적을 읽는다. fetch 후 main/HEAD·tracked INDEX/WORK를 분리 확인하고 변경·실제 실행 source·Steam 배포본을 구분한다. App4749590/item1189321 실제 상점의 공개판과 저장 초안을 최신 승인 게임과 대조한다. 트레일러·실제 전투 스크린샷·About·캐릭터·배경·대표/라이브러리 이미지·짧은 설명·EA·태그·언어를 점검하고 승인 범위의 최신화와 저장·베타 검수를 수행한다. 업로드 하나가 막혀도 독립 작업을 계속한다. 기존 승인 자료·세이브·타인 WIP·공유 인덱스를 보존하고 미인수 WIP·미완성 네이티브 기능을 홍보하지 않는다. 공개 게시·출시·SteamPipe Set Live·새 결제는 각각 승인 범위를 지킨다. 실제 변경·검수·미완료·다음 점검일을 이 문서에 기록하고 관련 docs를 동기화한다. 동일 작업이 실행 중이면 중복으로 시작하지 않는다. 보고는 한국어, 의미 있는 변화만 짧게 전달한다.

## 이전 작업 근거

- [개편 계획](STEAM_STORE_PAGE_REMODEL_20261019.md)
- [미디어 반영 실적](STEAM_STORE_MEDIA_REMASTER_20261020.md)
- [10-22 업로드 인계](STEAM_MEDIA_UPDATE_HANDOFF_20261022.md)


## 이번 실제 변경·검수 결과

| 항목 | 변경 전 → 변경 후 | 근거 / 한계 |
|---|---|---|
| Windows 최소/권장 영어 notes | nline activation required via Steam. → Online activation required via Steam. | 공식 전체언어 JSON 전후 비교: 30언어 중 english의2필드만 변경. 한·영 About·EA·다른 언어 변경0 |
| Remote Play Together | 체크 → 해제 | 싱글플레이 소개·지원 기능의 일치 정정. 새 페이지 재조회·steam-basic-saved.jpg |
| 기존 게임 스크린샷 category | 미지정5개 → gameplay5개 | Save Changes 후 새 페이지의5개 select 값과 상단 ✔ 확인. 이미지 삭제/원본 교체0·모든 연령 체크 변경0 |
| 미디어 최신성 | 현재 웹 소스의1-1을 격리 서버3341·무음 headless1920×1080으로 정상 입력 촬영 | 이동·공격·1/F/Ctrl/Q 입력, Lv2·25처치 후 정상 사망, pageerror0. 소스/세이브/피해/적 상태 주입0. 상점에 채택한 새 사진0 |
| 후보 반려 이유 | 초반 펫 대사 가림·비슷한 구도·일부 과밀VFX, north의개발용 호버문구 | combat/progress 후보는 보존하되 최종 갤러리로 채택하지 않음. 정상 플레이 실측은 전체 맵/보스/컨트롤러 QA가 아님 |
| 실행 대상 차이 | package.json full/3350, 일반 웹 build-target.js demo, source worldIntroVideo v17 | v22b 스팀용 출력과 실제 게임 v17 경로는 별개. 저장소의0.7.7 표기만으로 Steam 설치본/전체 최신화 완료라 하지 않음 |
| 종료 | 자체 촬영 브라우저·3341 서버 종료, capture-saves 보존 | 사용자 실행창·3333/3350 서버·기존 세이브 재시작/수정0 |
| 공개 | 미게시 초안 유지 | 기존 게시 보류와 SteamPipe/출시 경계 유지 |

증거 폴더: output/steam_maintenance_20261022/. 원문 전후 JSON·localization-diff.json·UI 저장 증거·촬영 결과는 로컬 보존한다. capture-session-local.json은 임시 브라우저 연결정보로 Git에 넣지 않는다.

## 우선 후속 작업

1. 워터마크·비율 결함이 있는 기존 사진을 대체할 최신 정상 전투5장 이상을 서로 다른 구도·전투/파밍 상황에서 확보한다. 펫 대사·개발용 문구를 제품 원본에서 숨기는 변경으로 해결하지 않는다.
2. 예고편·갤러리 전용 HTML5 드롭 업로드는 지원되는 파일 전송 기능으로만 수행한다. 현재 렌더 DOM의file input은 현지화·About용뿐이며 해당 input을 갤러리 업로드에 오용하지 않는다.
3. 최신 승인 캐릭터/배경과 캡슐을 대조하고 새 자료는 About/아트 자산과 실제 플레이 슬롯을 구분해 반영한다. 한·영 본문 뒤의28개 번역도 동기화 대상이다.
4. 주간 예약은 도구 연결 후 실행 상태·다음 실행 시각을 확인해야 한다. 월요일10시 정책/지시문 작성은 예약 생성의 증거가 아니다.

## MAP PRODUCTION REPORT — 촬영 한정

| 구분 | 결과 |
|---|---|
| STAGE | CH1-1 stage0, 최신 디스크 웹소스, shot 후보 관찰만 |
| MASTER | silhouette/regions/main route/side spaces 설계 변경0·전체 경로 재검수 안 함 |
| OUTER MASS | LEFT/RIGHT 생체나무와피부바닥 관찰. TOP/SOUTH 전체·major holes 전수판정 안 함 |
| LARGE | 기존 나무 원화 사용. composites/overlap/repeated silhouette 수정0 |
| MEDIUM | connections/remaining holes 전수판정 안 함 |
| GROUND | 기존 shadow/contamination/structure integration 유지. 신규 배경 편집0 |
| PLAYABLE | 초반 main arena에서 정상 이동·적 교전25처치. travel/breathing/threat 전체 검수 아님. 펫 가림·VFX중첩 후보 미채택 |
| LANDMARK | primary/secondary/tertiary 변경0·전체 검수 아님 |
| CAMERA QA | START/EARLY 후보 관찰. ARENA 일부, SIDE L/R 일부. LANDMARK/LATE/EXIT 미검수 |
| TECH QA | pageerror0. route/collision/seam/404 전체/성능 정량 미검수. 실제 입력·로딩 완료 관찰만 |
| FILES | stage-owned 변경0, concurrent game.html의유골함WIP 보존, 무관파일 변경0 |
| GIT | 공용 INDEX 보존, 자기 docs/결과만 별도복구. 배포0 |
| VISUAL VERDICT | **RETOUCH — 스토어용 새 사진 세트 미채택. 전체 맵 최종 판정 아님** |
| NEXT PASS | 초반 안내 이후 전투·다른 화면 구도, 워터마크/테스트문구 없는 후보 확보 |
