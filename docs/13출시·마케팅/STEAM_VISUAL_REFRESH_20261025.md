# Steam 소개 화면 개편 — 2026-10-25

대상: 본편 App4749590 / 상점 item1189321. 상태: 한·영 소개·신규 이미지·대체 설명·제작사 정리 저장 및 베타 검수 완료. 전체 Store Publish는 미실행. 내부 출시일 2026-12-01→2027-12-01 변경이 함께 대기하여 사용자 선택 확인 중이다. 출시·SteamPipe 배포와 별개다.

## 실제 변경

| 항목 | 결과 | 검수 경계 |
|---|---|---|
| 소개 첫 화면 | 시네마틱 대신 현재 웹 개발본의 대검 전투 사진 배치 | 1920×1080, 정상 입력, HUD 포함. 소스/세이브/적/피해 상태 주입0. 어두운 바닥·캐릭터 크기는 후속 구도 개선 필요 |
| 스킬 포지 | 승인된 10-23 orb UI 통합 검수 사진 추가 | 2481×1311, 한국어 UI·개발용 lab 수치. 자연 성장 상태를 뜻하지 않으며 인터페이스 예시로 표기 |
| 본문 구성 | 한·영 각각 정지화면6+짧은영상3→정지화면5+짧은영상3 | 전투→공격/기동→빌드/포지→인물 스토리→지옥 환경. 반복 정지화면 축소. 기존 자산 삭제0 |
| 신규 자산 | combat_greatsword_20261025 / skill_forge_orbs_20261025 2종 | English 원본 등록. 한국어도 같은 이미지 fallback을 실제 로드. 한국어 전용 파일 동시 업로드 실패를 성공으로 기록하지 않음 |
| 대체 설명 | 신규2종×한국어/영어=4개 저장 | 게시 diff와 실제 베타 alt 문구 확인 |
| 제작사·배급사 | 각 FOR DEAR GAMERS + 홈페이지 URL의 중복 이름→FOR DEAR GAMERS만 | 홈페이지 방문 링크·YouTube 링크 유지. 실제 베타에서 회사 링크 확인 |
| 기존 콘텐츠 | 주요 특징·기능 수치·짧은 소개·게임 코드 수정0 | 미래 캐릭터/네이티브 이식 완성을 새로 약속하지 않음 |

## 소스·검수

- HEAD: 5659d14d38b8068518cb5866a336bf930a1abbce, main. 공유 INDEX480경로 보존, 시작 index SHA256: 5f0f122de4ce9639d82ebd85ff0136379c7fb589d6c711897461cf62a10c235c.
- 현재 game.html SHA256: d73d691989c1cb847cb500ce02ae81430c575fb90d732a5af131742c96d2c8c5. 유골함·skill-forge 관련 동시 WIP를 수정/통합/배포하지 않았다. 촬영은 현재 디스크 웹 개발본이며 Steam 설치본 동일성 검증이 아니다.
- 격리 server.cjs 3342 / capture-saves 사용. 난이도2, 밝기120, 영어, BGM/SFX0. 사용자 세이브·3333/3350 실행창 변경0. 촬영 탭과 자체 서버PID49476 종료.
- 대사·안내 가림 후보는 보존·미채택. 채택 combat-retry.png의 실제 인코딩은 JPEG이다. 최종 업로드 .jpg: 220260 bytes / SHA256 d46ea4397aedcfb3c056ef5f1093622a3d26b05b80a12006d34af05f313658dc.
- 한·영 저장 성공 후 베타 재조회. combat 1560×878, forge 1560×824, 나머지 정지3장1560×878. 새2장 alt 확인. 본문 영상3개 readyState4·8/6.9/8초, 오류없음. 상단 World Intro는 로딩 직후 일시적인 빈 src 관측 후 한국어에서 0:08/1:53 재생 관찰; 정확한 업로드 원본 SHA/29개 자막판 검수는 별도 미완료.
- 자동 기능/코드 테스트를 새로 실행하지 않았다. 이번 변경은 Steam 편집 콘텐츠와 docs이며, 실제 웹 렌더·이미지 로딩·저장 diff로 검증했다.

## 보관 자료

I:/EXODUSER-Storage/steam/visual_refresh_20261025/ 에 original/ 원문, 새 한·영 BBCode, extras/, shots/, source-receipt.json, beta-ko-receipt.json, creators-before.json, publish-diff-final.txt, about-ko-preview.jpg, about-en-preview.jpg, creators-saved.jpg, Git 영수증을 보관한다. 문서는 I: 실체 docs Junction에 쓴다. 신규 백업/증거를 SSD에 누적하지 않는다.

## 남은 범위

1. 게시 시 묶이는 비소유 출시일 변경에 대한 사용자 선택 후 Store Publish·공개판 재조회. 공개판 revision4(2026-09-26)와 베타를 혼동하지 않는다.
2. 최신 정상 전투·패링·사슬·파밍 구도의 갤러리 세트. 기존 갤러리5장, OS 워터마크/비율 결함 해소 미완료. 이번 사진은 About이며 갤러리 교체가 아니다.
3. 캡슐·대표 이미지 개선, 상단 Gameplay 재편집, 29개 언어 예고편 파일 전송·언어 연결, 나머지 소개 번역 동기화. 드롭 전용 제약은 유지하며 About input을 오용하지 않는다.
4. 스킬 포지 사진은 lab 수치의 인터페이스 예시이므로 자연 성장 값으로 재촬영할 후속 과제다. 전투 사진도 대표 갤러리 최종 품질 판정은 아니다.

## MAP PRODUCTION REPORT — 촬영 한정

| 항목 | 결과 |
|---|---|
| STAGE / MASTER | CH1-1 stage0 초반, 기존 레이아웃·주경로·영역 설계 수정0 |
| OUTER MASS / LARGE | LEFT/RIGHT 생체나무·피부바닥 일부 관찰. 전체 silhouette/major holes 전수판정 아님 |
| MEDIUM / GROUND | 연결·바닥·그림자 기존 유지. 신규 맵 편집0 |
| PLAYABLE | 정상 이동/공격/재시도 후 Lv2 전투 촬영. 전체 이동경로·보스·밀집 정량 QA 아님 |
| LANDMARK / CAMERA QA | START/EARLY와 main arena 일부. SIDE/LATE/EXIT 미검수 |
| TECH QA | 격리 서버·디스크/served source 해시 일치. 전체 collision/seam/성능·404 전수검수 아님 |
| FILES / GIT | 게임·에셋 수정0, 타 팀 WIP·공유 인덱스 보존 |
| VISUAL VERDICT | RETOUCH — About에 실제 전투1장 채택, 대표 갤러리·전체 맵 최종 PASS 아님 |
| NEXT PASS | 전투 실루엣·환경이 함께 읽히는 다양한 구도, 자연 성장 포지, 패링·사슬·장비 장면 확보 |
