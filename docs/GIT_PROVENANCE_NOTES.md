# Git Provenance Notes

이미 push된 커밋에 타세션 작업이 잘못 번들된 사실을 기록한다. **history rewrite 금지** (CLAUDE.md §동시 세션). 재작성 대신 사실만 남긴다.

## b5430a67 — minimap 초상 마커에 타세션 작업 번들 (2026-08-23)

**커밋 메시지:** `feat(minimap): 플레이어 초상 마커 — 원형 얼굴+방향 삼각형+이중테두리`

**실제 포함 내용 (140 insertions / 44 deletions):**
- ✅ **의도된 변경 (내 것):** `_mmDrawPlayerMarker`/`_mmBuildFace` 미니맵 플레이어 초상 마커 (`[MM-PORTRAIT]`), `drawMM` 마커 호출 교체. ~44줄.
- ⚠️ **번들된 타세션 작업 (비의도):**
  - **stream chunk eviction 리팩터** (`_evQuota`, `_streamEvictFrame` 임계 T*3, evict valve) — 원 출처 브랜치 `map-corner-clip-fix@88a8fc60` "perf: stream viewport threshold T*3, chunk evict valve".
  - **eye-bullet** (`_drawEyeBullet`, `p._eyeSkin`, `p.titanEye`) — 다른 세션 미커밋 WIP. b5430a67 이전 어떤 커밋에도 없었음(이 커밋이 main 유일 반입 경로).

**원인:** 공유 워킹트리(단일 checkout)를 여러 세션/auto-sync cron이 동시에 game.html에 기록 중. `main` 전환 직후 game.html은 클린(마커 대상만)이었으나, 마커 편집~`git add game.html` 사이 churn이 eviction+eye-bullet를 작업파일에 재materialize → `git add game.html`이 전부 스테이징.

**상태:** main 문법 OK (`new Function` 검증 통과, 모듈/JSON 스크립트 제외 오류 0). eye-bullet은 스텁 성격(`_eyeSheetReady` 아니면 `return false`)이라 크래시 위험 낮음. 번들된 작업 모두 정상 반입돼 손실 0 — 다만 **provenance(저작/의도)가 커밋 메시지와 불일치**.

**교훈/조치:** MEMORY `game-html-single-main-branch.md` — game.html은 main에서만 편집하되, **동시 세션은 game.html을 건드리지 말 것**. 지키지 않으면 `git add game.html`이 churn을 흡수한다. 회피책: game.html 커밋 직전 `git diff --stat`로 의도 외 변경 확인, 발견 시 커밋 보류·경로별 hunk 스테이징 또는 auto-sync 일시중지.

---

## 2026-10-01 — `ac79dd5e5` "art(story): warrior story v25" 에 BUILD 팀 파일 번들

**의도한 범위 (ART):** `video/warrior_story_v23_clean.mp4`, `character-story-player.js`, `test/warriorStoryLocalization.test.js`, `docs/cinematic/WARINTRO_NEMESIA_V24_20261001.md`, `docs/17게임아트팀/ART_TEAM_MASTER.md` — 이 5개만 `git add <경로>`로 스테이징했다.

**번들된 타 팀 작업 (비의도, BUILD 팀 소유):**
- `build-nwjs.mjs` (+43)
- `tools/integration-build-record.mjs` (신규 91줄)
- `docs/…/INTEGRATION_BUILD_TEAM_MASTER.md` (+49)
- `docs/13출시·마케팅/PC_PACKAGING_20260910.md` (+17)

**원인:** 공유 워킹트리의 인덱스에 BUILD 팀이 위 4개를 이미 스테이징해 둔 상태에서 ART가 `git commit`(경로 미지정)을 실행 → 인덱스 전체가 커밋됨. 경로 지정 `git add`만으로는 타 팀의 기존 스테이징을 막지 못한다.

**상태:** 4개 파일 내용은 BUILD 팀이 스테이징한 그대로 보존(손실 없음). ART는 해당 파일을 읽거나 수정하지 않았다. 이력 재작성 없음.

**교훈/조치:** 공유 인덱스에서는 `git commit -- <경로들>` 또는 `git commit --only <경로들>`로 **커밋 단계에서도 경로를 지정**한다. 커밋 전 `git diff --cached --stat`의 파일 수가 의도와 다르면 멈춘다(이번에는 9개로 표시됐는데 확인 없이 진행함).
