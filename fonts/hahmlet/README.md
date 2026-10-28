# Hahmlet (실버 헬 UI 패키지 본문·제목 글꼴)

- 원본: Hahmlet 가변 글꼴 `Hahmlet[wght].ttf` — https://github.com/google/fonts/tree/main/ofl/hahmlet (Copyright 2020 The Hahmlet Project Authors, https://github.com/hyper-type/hahmlet)
- 라이선스: SIL Open Font License 1.1 — 같은 폴더 `OFL.txt`. 무료·상업 사용·게임 동봉 가능. 이 서브셋도 OFL 1.1을 따르며, 글꼴 이름 "Hahmlet"은 예약 이름이 아니다.
- 채택: 2026-10-28 사용자 승인([승인-디자인-3] "Hahmlet 300"). 근거 문서 `docs/3.1 ui hud 디자인/LOBBY_AAA_REFERENCE_STUDY_20261028.md` §9.
- 서브셋(`tools/subset_hahmlet.py`): 굵기 300·400 고정 인스턴스, KS X 1001 한글 2,350자 + 게임 원문(index.html·game.html·루트 JS)에 쓰인 한글 1,110자(그중 KS 밖 55자) + ASCII·Latin-1·일반 문장부호. 총 2,711 코드포인트.
  - 서브셋에 없는 글자(다른 문자권·드문 한글)는 CSS 글꼴 목록의 다음 글꼴(나눔명조 → Noto Serif KR)로 자동 대체된다.
  - 새 한글 문구를 추가했으면 `python tools/subset_hahmlet.py fonts/hahmlet <원문 폴더…>`로 다시 만든다(원본 가변 글꼴은 저장소 밖에 둔다).

| 파일 | 용도 | 크기 |
|---|---|---|
| `Hahmlet-300-ko.woff` | 웹(index.html·game.html·DEMO·EA) | 370,472 B |
| `Hahmlet-400-ko.woff` | 웹 | 329,044 B |
| `Hahmlet-300-ko.ttf` | Unity(TextMeshPro 폰트 에셋 원본) | 1,176,844 B |
| `Hahmlet-400-ko.ttf` | Unity | 1,179,624 B |

웹 로딩: `silver-hell-ui-kit.css`의 `@font-face`(font-display:swap). 두 굵기를 합쳐 약 0.7MB.
