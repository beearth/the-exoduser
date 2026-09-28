# FDG 공식 홈페이지 — 신규 엑소듀서 캐릭터 갤러리

2026-09-28 사용자 지시: 제공한7장 추가, 기존 중복 이미지 축소. 후속 스크린샷4장의 구형 이미지 삭제 및 복잡한 도트/설명판 정리. 대상 https://www.fordeargamers.com/, 소스 G:/fdg/index.html, Vercel fordeargamers/fdg(prj_qVD9rBL1vvnqAFhDkVb874wQ07S1). 게임 로비/런타임 캐릭터 데이터 변경 없음.

## 전시 구성

| id / 위치 | 현행 |
|---|---|
| exoNewCharacters | EXODUSER 아래 첫 아코디언, New Characters / 신규 캐릭터, 기본 펼침,7 works |
| 대표3장 | 변성술사(파란 구형 코어·변형 무기), 크루시폼 매그넘(의상 정리 버전), 아케인 랜서. 캐릭터 명칭은 기존 제작 문서와 대조 |
| 나머지4장 | 다른 포스터 보기의 details/summary로 펼침. 변성술사 검의 궤적 및 총사3변형. 사용자7장 모두 공개 갤러리에서 확대 가능 |
| 기존 Key Art |8→2 works, 기본 접힘. 여성/남성 가로형 키아트만 각 전체 행으로 표시. 혼자 남은 실버테일 포스터 제거 |
| World & Stages |6→5 works, 기존 맵 이미지 유지. 실버테일 세계관 설명판 제거 |
| Artbook — 설정화 |16→12 works. 중복 종합 설정화2장과 사용자 지정 기본3캐릭터/연속 동작 그림 제거 |
| 합계 | EXODUSER 기존30장 중11장 삭제, 새7장 추가:26장. DIROI8장 및 상단 게임/스튜디오/트레일러 흐름 유지 |
| 이미지 비율 | 원본 RGB를 종횡비 유지해 WebP 변환. 큰 보기 최대2400×2400, 목록 최대1200×1200. quality92/90, method6. 원본7장54,403,170bytes → 큰보기+목록14파일5,725,576bytes |
| 표시 | img width100%, height:auto, aspect-ratio27/16, object-fit:contain. 임의 크롭 없음. 명시 width/height, loading=lazy, decoding=async. button으로 마우스/Enter 확대 |
| 배치 | 대표 그리드3열·gap14px·padding14px. ≤1000px2열/마지막카드전체행, ≤600px1열·gap/padding12px. 변형그리드2열, ≤600px1열 |
| 카드 | border1px/#292120, 배경#0d0b0c, hover blood-glow. focus-visible2px gold/offset3px. 메타padding15px16px17px, 하단선1px/#252021. 제목clamp(.95rem,1.2vw,1.18rem)/600/line-height1.4, 부제.72rem/1.6/상단6px. ≤600px메타13px14px |
| 변형 목록 | margin0 14px14px, 상단1px/#272020. summary padding16px2px/font.82rem. count margin-left10px/font.65rem/spacing.08em. 모바일 margin0 12px12px |
| 모바일 표제 | 아코디언padding18px16px/gap10px, 제목.82rem/line-height1.5/spacing.08em. 한국어는 별도 줄(.78rem/margin-top4px/keep-all), count nowrap |
| 동작 | 기존 openLightbox와 toggleAcc 재사용. 신규 아코디언 aria-expanded 초기true, 접기/펼치기 후 실제상태 갱신. reduced-motion 신규카드/리빌 transition:none. 부모 textContent 교체 없음 |
| 백업/삭제 | 기존 index와 제거 이미지10장을 G:/exoduser/captures/homepage-characters/source-backup/에 보존한 뒤 G:/fdg의 공개 파일 삭제. 파일별 절대경로가 G:/fdg 안인지 검증. 추가 실버테일 포스터/index/문서 백업은 captures/homepage-characters/remove-silvertail/before/. 게임 원본 에셋/Downloads/사용자 스크린샷은 유지 |
| 배포 제외 | .vercelignore에 docs/, .git/, .vercel/. 소스/문서는 Git 커밋, 웹사이트 배포에는 공개 런타임 파일만 포함 |

## 신규 에셋

| 원본 파일 | 큰 보기 / 목록 파일 | 큰 보기 크기 / 목록 크기 | bytes 큰 보기 / 목록 |
|---|---|---|---|
| hf_20260928_010728_3cd9188f-312f-4332-84e7-34795531fcae.png | gallery_exo_new_transmuter-sword_20260928.webp / gallery_exo_new_transmuter-sword_20260928_thumb.webp | 2400×1350 / 1200×675 | 746342 / 207976 |
| Make-a-localized-costume-cleanup-EDIT-of.png | gallery_exo_new_cruciform-costume_20260928.webp / gallery_exo_new_cruciform-costume_20260928_thumb.webp | 2400×1422 / 1200×711 | 677922 / 196888 |
| hf_20260928_064608_40debf3e-d9ec-4cbb-8d8b-a8cdde4199a5.png | gallery_exo_new_transmuter-orbit_20260928.webp / gallery_exo_new_transmuter-orbit_20260928_thumb.webp | 2400×1422 / 1200×711 | 835222 / 244838 |
| hf_20260928_020419_f1feca82-454c-44d6-bfa6-e442740df636.png | gallery_exo_new_cruciform-red-moon_20260928.webp / gallery_exo_new_cruciform-red-moon_20260928_thumb.webp | 2400×1357 / 1200×679 | 545376 / 168080 |
| hf_20260928_010928_1eedfd96-22d8-4b34-ab3c-aead5d19e6a8.png | gallery_exo_new_cruciform-duo_20260928.webp / gallery_exo_new_cruciform-duo_20260928_thumb.webp | 2400×1357 / 1200×679 | 457224 / 137868 |
| hf_20260927_235745_bc692f3c-389e-436c-b616-f036d62e4c77 (1).png | gallery_exo_new_cruciform-ruins_20260928.webp / gallery_exo_new_cruciform-ruins_20260928_thumb.webp | 2400×1350 / 1200×675 | 541726 / 134082 |
| hf_20260928_011117_d25ad6a4-dcbb-46d4-aa19-e9c9eb5e65bc.png | gallery_exo_new_arcane-lancer_20260928.webp / gallery_exo_new_arcane-lancer_20260928_thumb.webp | 2400×1350 / 1200×675 | 656506 / 175526 |

## 제거 이미지

| 파일 | 근거 |
|---|---|
| gallery_exo_banner_chains.jpg | 남성 키아트의 유사 실루엣/배경 반복 |
| gallery_exo_banner_gw_city.jpg | 남성 키아트의 유사 구도/배경 반복 |
| gallery_exo_silvertail_w1.jpg | 실버테일 대표 키아트 반복 |
| gallery_main_poster.png | 붉은 지옥 포스터 계열 반복 |
| gallery_exo_bd_ekdma.jpg | 의상/무기/실루엣 종합 설정화 반복 |
| gallery_exo_bd_sheet_dark.jpg | 사용자 스크린샷211115:구형 어두운 설정화 |
| gallery_exo_bd_bladetail.jpg | 사용자 스크린샷211100:복잡한 연속 동작 그림 |
| gallery_exo_base_characters.jpg | 사용자 스크린샷211121:기본 캐릭터3종 설명판 |
| gallery_exo_poster.png | 사용자 스크린샷211128:붉은 지옥 포스터 |
| gallery_exo_world_poster.jpg | 구형 종합 설명판·실버테일 반복 |
| gallery_exo_silvertail_poster.jpg | 사용자 스크린샷212935: Key Art 마지막 행에 혼자 남은 실버테일 포스터 제거 |

## 검증과 반영 상태

| 확인 | 결과 |
|---|---|
| 로컬 Node 서버 |1920×1080/1280×720/768×1024/390×844의4크기. 가로넘침0, 새 이미지 contain, 표기수와실제 이미지수 일치 |
| 인터랙션 | 새7장을 실제 Enter로 확대하고 배경클릭으로 닫음. 아코디언 expanded=false/true 확인. 제거10장 DOM없음, 로컬 이미지HTTP오류0/pageerror0 |
| 시각 확인 | 대표3장 전체 무기/인물과 모바일1열/한국어 표제 확인. captures/homepage-characters/new-characters-{width}x{height}.png |
| 증거 | captures/homepage-characters/runtime-report.json, tmp/fdg-homepage-manifest.json(원본 해시/규격/개수). 원본자료는7장 모두 사용자 지정파일 |
| 현재 단계 | 실제 G:/fdg 반영·소스/에셋/문서 커밋·프로덕션 배포 및 검증 완료. 아래 결과 참조 |


## 실제 프로덕션 반영 — 2026-09-28T12:23:58.242Z

| 확인 | 결과 |
|---|---|
| 홈페이지 소스 커밋 | c61a399d0099501118ea9a4240827435e715306c, G:/fdg/master. 새7장의 목록/큰보기14파일과 index, 문서, 삭제10장 포함 |
| 배포 | https://fdg-qra04pbmc-fordeargamers.vercel.app — 기존 fordeargamers/fdg Production 배포 완료 |
| 공식 도메인 | https://www.fordeargamers.com/ 실제 HTML+새에셋14파일: HTTP200 및 소스 SHA25615개 일치. CLI 완료와 별개로 공식 도메인 검증 |
| 구형 이미지 | 삭제10개 파일 모두 공식 도메인 HEAD404. 스크린샷 지정4개 모두 포함. 백업 보존 |
| 실배포 인터랙션 |4크기·새7장 Enter확대/클릭닫기·아코디언 aria-expanded·가로넘침0·표시개수 일치·pageerror0/이미지HTTP오류0 |
| 사용자 Chrome | 새로고침 후 신규7/KeyArt3/World5/Artbook12의 실DOM 확인, 사용자 지정4장 제거 확인 |
| 증거 | captures/homepage-characters/production-report.json, production-hashes.json. updated index SHA256 903806dca9abfed1f698baba4709644ce7e8dd52e75f4d76aad54238d8cadd55 |


## 단독 실버테일 포스터 제거 — 2026-09-28

| 항목 | 현행 |
|---|---|
| 요청 | 스크린샷212935의 단독 실버테일 포스터 제거 |
| 구현 | gallery_exo_silvertail_poster.jpg 카드와 공개 파일 삭제, Key Art3→2 works, 각 가로형 원화는 기존 wide 전체 행 배치 유지 |
| 전체 구성 | 신규 캐릭터7 / Key Art2 / World5 / Artbook12 = EXODUSER26장 |
| 검증/배포 | 로컬 확인 후 기존 fordeargamers/fdg에 반영. 실제 프로덕션 결과는 아래 기록 |


## 단독 포스터 제거 프로덕션 확인 — 2026-09-28T12:41:16.446Z

| 확인 | 결과 |
|---|---|
| 소스 커밋 | 8f65d9ef5debb74b900044af709b3e2ea7e0cf6b, index/포스터 삭제/동기화 문서 포함 |
| 배포 | https://fdg-en846i71g-fordeargamers.vercel.app, 기존 fordeargamers/fdg Production |
| 공식 도메인 | HTML 및 신규14에셋 HTTP200/해시15개 일치. 삭제11개 HEAD404, 실버테일 포스터 포함 |
| Key Art |1920×1080/390×844 실제2장 로딩, 전체 행 배치, 가로넘침0, 고아 카드 없음. 다른 섹션7/5/12 유지 |
| 기존 갤러리 |4크기 및 신규7장 확대/닫기 정상, 페이지/이미지 오류0 |
| 증거 | captures/homepage-characters/remove-silvertail/production-keyart.json 및 keyart-{width}x{height}.png, production-hashes.json |
