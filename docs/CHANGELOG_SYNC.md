# Sync Changelog

게임 코드 변경과 `docs/` 반영을 같이 남기는 누적 로그다.

## 2026-04-03

### CH1 floor green noise regression documented
- 코드:
  - `game.html`
  - `test/ch1FloorSoilRestore.test.js`
- 문서:
  - `docs/4.1맵디자인+설정/CH1_녹색노이즈_버그리포트.md`
  - `docs/4.1맵디자인+설정/맵베이스세팅.md`
- 변경:
  - CH1 바닥 녹색 노이즈의 실제 원인이 `buildMapCache()`의 `Pass 4` ambient radial glow였다는 점을 문서화
  - 최종 수정과 회귀 테스트 위치를 기록
  - 바닥 procedural overlay 재발 방지 규칙 추가

## 2026-04-01

### 맵 함정 사운드 동기화
- 코드: `game.html`
- 변경:
  - 맵 바닥 함정(`MAP_OBJS.type==='trap'`) 발동 시 `death_flesh2` 단일 재생에서
    `death_flesh` / `death_flesh2` 2교대 재생으로 변경
  - 토글 상태값 `G._mapTrapSfxFlip` 사용
- 동기화 문서:
  - `docs/6사운드디자인/6사운드디자인.md`
  - `docs/4.1맵디자인+설정/맵오브젝트_에셋목록.md`
  - `docs/0마스터플랜/EXODUSER_MASTER_BIBLE_v2_2 (2).md`

### docs 동기화 강제 훅 추가
- 코드:
  - `tools/docs-sync-check.ps1`
  - `.githooks/pre-commit`
  - `package.json`
- 변경:
  - 비문서 파일 변경 시 `docs/` 수정이 없으면 커밋 차단
  - 추가로 `docs/CHANGELOG_SYNC.md` 업데이트가 없으면 커밋 차단
  - 예외 우회는 `ALLOW_MISSING_DOCS=1`

### 3시간 자동 커밋/푸시 준비
- 코드:
  - `auto_commit.ps1`
  - `tools/install-auto-sync-task.ps1`
  - `package.json`
- 변경:
  - 변경점이 있을 때만 `git add -A` 후 자동 커밋 시도
  - 커밋 전 `docs-sync-check.ps1 -Staged` 실행으로 문서 누락 차단
  - 푸시는 고정 `main` 대신 현재 브랜치의 `origin HEAD` 기준 사용
  - Windows 작업 스케줄러에 3시간 반복 등록 가능한 설치 스크립트 추가
