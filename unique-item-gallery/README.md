# 자수정 유물 도감

`http://localhost:3333/unique-item-gallery/` — U-D01~22 후보에 대응하는 신규 고유아이템 22종의 원화·이름·형태·효과를 보는 **독립 시각 시안**이다. 실행 서버는 리포의 `server.cjs`(포트 3333)다.

| 파일 | 역할 |
|---|---|
| `catalog.js` | UI-01~22와 U-D01~22의 1:1 연결, 제안 슬롯, 짧은 효과, 원화 경로. 수치 원본은 `docs/7아이템디자인/유니크_어픽스_리스트.md` |
| `index.html`, `styles.css`, `app.js` | 보라색 유물 도감, 종류 필터·검색·상세 보기, 반응형 화면 |
| `../assets/unique-items/ui-01.png`~`ui-22.png` | Higgsfield GPT Image 2.5 생성 원화, 각각 1024×1024 PNG |
| `catalog.test.mjs` | 22개 ID·어픽스·원화 경로 및 필터 계약 검사 |

`C:\nvm4w\nodejs\node.exe --test unique-item-gallery\catalog.test.mjs`로 데이터 검사를 실행한다. Chrome의 1440×900과 390×844에서 22개 로딩, 무기 필터 4개, `포이즈` 검색 2개, UI-15 상세 전환을 직접 확인했다.

본게임 `game.html`의 `UNIQUE_SPECIAL`, 등급 색, 드롭, 세이브, 번역은 수정하지 않았다. 도감의 슬롯은 제안이며 게임 착용 가능 슬롯으로 확정된 값이 아니다. 생성 프롬프트·작업 ID·아트 경로와 구현 계약은 [카탈로그 문서](../docs/7아이템디자인/보라색_고유아이템_카탈로그_20260930.md)에 있다.
