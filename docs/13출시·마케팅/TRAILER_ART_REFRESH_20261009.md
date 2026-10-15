# EXODUSER 30초 캐릭터·세계관 아트 티저

2026-10-09 사용자 지시: **기존 Steam 페이지 소재와 최신 캐릭터 이미지로 트레일러를 바꾼다.** 기존 홍보팀과 원화 버전·사용 상태를 대조하고 별도30초 티저를 제작했다. **렌더·기술 검사·연속 표본 검수 완료 / 사용자 검토용 / 미게시**. 본편 대표 게임플레이 트레일러나 신규 보스 완료를 뜻하지 않는다.

## 소재·표현 계약

| 항목 | 실제 적용 |
|---|---|
| 원본 | 현재 Steam `page_bg_raw.jpg` + 2026-09-28 사용자 지정 후 공식 홈페이지에 공개된 캐릭터 원화6장 |
| 대표 | 변성술사 푸른 코어·에너지 낫 / 홈페이지 명칭 크루시폼 매그넘, 후속 사용자 명칭 헬 헌터 / 아케인 랜서 |
| 공개·구현 구분 | 홈페이지 원화 공개 이력이다. 신규3종의 데모 선택·전투·저장 배선 또는 플레이 가능 완료를 뜻하지 않는다 |
| 대기 원화 | 변성술사 Sunburst clean v5는 이미지 컨펌 대기 이력이 있어 사용하지 않음. 공개 orbit 사용 |
| 제외 | 구버전 전투·스킬 몽타주, 이전 직선검 변성술사, 구형 남녀 와이드 키아트. 다운로드 재고10항목 중 실제 이미지7파일 |
| 문구 | 도입 `HELL IS NOT YOUR END.` / CTA `PLAY THE FREE DEMO ON STEAM` / 엔딩 `CHARACTER & WORLD ART TEASER` |
| 약속 | 신규 캐릭터 플레이 가능 수·신규 무기 구현·신규 보스전 문구 없음. 아트 소개로 표기 |
| 변경 | 새 이미지·영상 생성0, 새 게임플레이/맵/보스 캡처0, 게임·수치·세이브 변경0 |
| 대기 | 본편 보스 리디자인·대표 게임플레이 촬영 대기 유지. [별도 전투 티저 기록](NEW_VERSION_TRAILER_PRODUCTION_20261009.md)과 구분 |
| 공개 | Steam/YouTube/홈페이지/소셜 게시 없음. 내부 납품 파일 저장·확인만 수행 |

[공식 홈페이지 갤러리](https://www.fordeargamers.com/)의 원본 URL을 GET하고 크기·해시를 확인했다. 개발 checkout의 `FDG_HOMEPAGE_CHARACTERS_20260928.md` 및 `VIDEO_CHARACTER_BASES_20260928.md`와 홍보팀 인계를 대조했다. [현재 Steam 상점](https://store.steampowered.com/app/4749590/EXODUSER_HELL_LORD/)의 무료 데모 안내를 확인했다. 저해상도 헤더·캡슐과 구버전 스크린샷은 영상에 넣지 않았다. Steam 배경은1438×810이며1080p 출력으로 확대한다.

## 실제 편집표

| id | 시간 | 내용 | scale | 가로 이동px | edge fade초 |
|---|---|---|---|---|---:|
| hell-opening | 0–3 | Steam 지옥 배경·도입 | 1.02→1.055 | 0→−12 | 0.25 |
| blue-core | 3–7 | transmuter-orbit | 1→1.025 | 0→8 | 0.10 |
| hell-hunter | 7–11 | cruciform-costume | 1.025→1 | −8→0 | 0.10 |
| arcane-lancer | 11–15 | arcane-lancer | **0.98→1** | **0→0** | 0.10 |
| duo | 15–17.5 | cruciform-duo | 1.01→1.03 | 0→5 | 0.10 |
| ruins | 17.5–19.5 | cruciform-ruins | 1.02→1 | 5→0 | 0.10 |
| red-moon | 19.5–24 | cruciform-red-moon | 1→1.03 | 0→−8 | 0.10 |
| hell-brand | 24–30 | Steam 배경·브랜드·CTA | 1.025→1.055 | 0→10 | 0.25 |
| 합계 | **30.0초** | 8컷 / 이미지7파일 | **1920×1080 / 30fps / 900f** | | |

이미지 비율은`contain`으로 보존한다. 얼굴·코어·총구·긴 창을 우선하고 확대를 작게 적용했다. 아케인 랜서는 첫 시안에서 창끝 여유가 줄어 확대를0.98→1로 수정하고 가로 이동을 제거했다. 불투명 자막판 없음. 도입 문구0.2–2.8초, 엔딩24–30초. 엔딩 브랜드는 원본 로고 이미지가 아니라 **Cinzel600으로 새 조판한 native text**다. CTA·아트 티저 표기는DM Sans400을 직접fontAssetId로 지정한다. 컷 경계의 짧은 검정fade는 의도된 전환이며17.5초 표본에 포함된다.

## 정본·재현

| 파일/수치 | 실제 기록 |
|---|---|
| 원본 | [source-assets.json](../../marketing/trailers/art-refresh-20261009/source-assets.json). URL·bytes·SHA256·`used` 상태. 실제 사용7파일만 ZIP에 포함 |
| 계획 | [edit-plan.json](../../marketing/trailers/art-refresh-20261009/edit-plan.json). id·시간·scale·pan·fade 정본 |
| Native | [marketing_art_trailer_20261009.jsx](../../tools/marketing_art_trailer_20261009.jsx). 독립`project-art-r2`, 기존 공유 작업 덮어쓰기 없음 |
| 재현 | [README](../../marketing/trailers/art-refresh-20261009/README.md). native render 후 [postmix.sh](../../marketing/trailers/art-refresh-20261009/postmix.sh) 실행 |
| 음악 | 기존 채택곡`bgm/cutscene/prologue_theme.mp3` **60–90초**,30초. SHA256 `9ab69e88008f6ebc625c4c694d7d8aa066dd1c6f465185cfc9e5d10be49e9865` |
| 믹스 | native 화면은 무음. 음악1회, 시작0.3초/28.5초부터1.5초fade. loudnorm **목표** I−14/TP−1.5/LRA11. AAC256k/48k/stereo. 게임SFX·VO 없음 |
| 과거 | 10/8 구버전30초 전투본의 배포 제외·원본 버전 불일치 판정 유지. 이번 아트 티저를 해당 전투본의 최신화 완료로 기록하지 않음 |

## 납품·검수

| 항목 | 결과 |
|---|---|
| MP4 | [30초 검토본](https://d2ol7oe51mr4n9.cloudfront.net/user_3G1zto9sz11Uf3iEOhJefE9HdGG/c262a938-d228-49c1-8b9a-105f6251a927.mp4). 74,930,939bytes / H.264 yuv420p / 1080p30 / 900f / AAC48k stereo |
| MP4 SHA256 | `8f469bab8510653ce359a5e6f5022efd574653e2268b74a79ecde48c65854ce4` |
| 편집 ZIP | [native·원본·폰트·음악·계획·믹스·QA](https://d2ol7oe51mr4n9.cloudfront.net/user_3G1zto9sz11Uf3iEOhJefE9HdGG/246e7257-c9a0-49f5-9be7-13813b0ac2df.zip). 13,403,039bytes |
| ZIP SHA256 | `a44a4e4f90fa247e7a02bbf5a215c1c954c6c60a7ae80c4dfd7a7eda104da87f` |
| QA | [실측JSON](https://d2ol7oe51mr4n9.cloudfront.net/user_3G1zto9sz11Uf3iEOhJefE9HdGG/f8019cb0-e778-4537-a7ce-686a89021c62.json) / [출력30표본](https://d2ol7oe51mr4n9.cloudfront.net/user_3G1zto9sz11Uf3iEOhJefE9HdGG/942b7920-9f43-4747-90a5-e26b709acfe3.jpg) |
| 기술 | native check clean, 전체AV decode 오류0, 정확히900프레임·30.0초·1920×1080·30/1fps·48k stereo 확인 |
| 시각 | native8컷 contact·CTA 전체 화면·수정 후14.8초 창끝 확인. 최종0.5–29.5초1초 간격30표본 확인. 원화·색상 변화·엔딩·의도된fade 유지 |
| 음량 실측 | 최종 AAC **−13.84LUFS / true peak−2.91dBFS / LRA2.6LU**. 정규화 목표와 구분 |
| 패키지 | 서버·로컬 ZIP integrity PASS. native asset URI는`fs:media/...`, 절대`/home/user`경로0, 모든 asset bytes/hash 확인 |
| 로컬 | `output/trailer-art-refresh-20261009/`에MP4·ZIP·contact·QA 보존 |
| 상태 | 사용자 검토 가능. 실시간 전편 감상·주관적 청취·사용자creative승인·외부 게시 미완료 |

모든 저장 업로드PUT200·confirm 및 로컬 재다운로드 해시를 확인했다. 관련 키워드를 docs/ 전체에서`rg` 검색하고 마케팅 색인·리서치 후속·주제가 사용·CHANGELOG_SYNC에 동기화했다. 과거 영상의 타임라인·음량·해시는 당시 이력으로 보존한다. 보호된`2_3 돌진+패링+방패시스템` 수정 없음.
