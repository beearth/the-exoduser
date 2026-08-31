# FORENSIC — "auto: session sync" 커밋 주체 식별 (2026-08-23)

조회 전용 포렌식 3회분 종합 기록. **git history rewrite / commit 삭제 금지. 88a8fc60·map-corner-clip-fix 보존.**

---

## 1. 결론 요약

| 항목 | 결과 |
|---|---|
| "auto: session sync" 커밋 주체 | **Claude Code SessionEnd 훅** (`.claude/settings.json`) — cron 아님 |
| STEP1/STEP2 perf 반영 | main HEAD `2ef7b62a`에 **이미 커밋 반영** (추가작업 불필요) |
| WIP 소실 여부 | **소실 없음** (WIP_backup == HEAD:game.html, 1줄차) |
| 안전망 | `autoloop/snap.cmd` 생성 (워킹트리 무변경 스냅샷) |

---

## 2. 주체 확정 (CONFIRMED)

`G:\exoduser\.claude\settings.json`:
```json
"SessionStart": [{ "hooks": [{ "type":"command","shell":"bash",
  "command":"git pull --rebase --autostash || true" }]}],
"SessionEnd": [{ "hooks": [{ "type":"command","shell":"bash",
  "command":"if [ -n \"$(git status --porcelain)\" ]; then git add -A || true; git commit -m \"auto: session sync\" || true; git push || true; fi" }]}]
```

- Claude Code 세션 종료 시 dirty면 `git add -A` → `commit "auto: session sync"` → `push`.
- `git add -A` 무차별 스테이징 → **lang 26개 / WIP_backup 3.4MB / 타세션 파일이 한 커밋에 번들**되는 근본 원인.
- author = beearth / contact@voisun.com (리포 git 신원 그대로, 별도 봇 아님).
- 주기 불규칙(08-21 00:28 / 08-22 10:23 / 08-23 10:45) = 세션종료 이벤트 구동, **고정 cron 아님**.
- SessionStart의 `git pull --rebase --autostash` = 세션 시작 시 `Created autostash: ...`의 출처.

### 범인 아닌 것 (오해 방지)
- `.git/hooks/pre-commit`(guard.js, 366B): `core.hookspath=G:\hell\.git\hooks`(**NOT FOUND**)로 리다이렉트 → 실행 안 됨.
- 스케줄러 `EXODUSER_AutoGit`: **State=Disabled**.
- `G:\exoduser\auto_commit.ps1`: 대상=`G:\hell`, 메시지="auto: `<stamp>` sync snapshot"(≠"session sync"). 본건 무관. (`da1eea98 ...sync snapshot`이 그쪽 산물 추정.)

---

## 3. STEP1 / STEP2 perf 반영 상태 (별건, 판정=A)

map-corner-clip-fix 브랜치(`88a8fc60`, "perf: stream viewport threshold T*3, chunk evict valve")의 변경 **내용**이 main HEAD game.html에 이미 존재:

| 항목 | STEP 전 | STEP 후(현재 HEAD·워킹트리) | 근거 라인 |
|---|---|---|---|
| 뷰포트 임계 | `_vpW=_camL...+T*4` | `+T*8` | HEAD:game.html 43458 / 워킹트리 43524 |
| evict 주기 | `>=60` 고정 | `>=(_streamChunkCnt>_STREAM_MAX_CHUNKS?60:180)` | HEAD 43466 |
| evict margin | `_margin=2` | `_margin=4` | HEAD 43468 |
| STEP2 퇴거 | 없음 | `[PERF-STEP2]` 1-per-pass + `[PERF-STEP2.5]` 압력밸브 | HEAD 43469~43470 |

- `WIP_backup`(3457952B, 10:20:20) vs `HEAD:game.html` diff = **1 ins / 1 del** → 사실상 동일 = WIP 안착·소실 없음.
- `STEP2_wip.patch` 0바이트 = 소실 신호 아님, "이미 커밋돼 잔여 delta 없음".
- **주의**: commit `88a8fc60` 객체 자체는 main 조상 아님(`git branch --contains 88a8fc60` → map-corner-clip-fix 단독). 내용만 working-tree 경유로 main에 반영됨(SessionEnd 훅 흡수 패턴). provenance 분리 상태 — rewrite 금지.

---

## 4. 안전망 snap.cmd (생성 완료)

`autoloop/snap.cmd` — 자동실행 아님, 수동 스냅샷.
- 동작: `git stash create`(커밋객체만 생성, 워킹트리 무변경) + `git stash store -m SNAP_...`.
- commit/push/checkout **없음**. 워킹트리 원상 유지.
- 복구: `git stash apply stash@{n}` (수동).
- 검증: V9 실행 전=후 porcelain 완전동일(37/37) PASS · V10 stash list SNAP_ 1건 PASS.
- **알려진 버그**: 라벨 날짜토큰 `%d` 미전개 (한국어 `%DATE%`가 `-`구분인데 `delims=/` → `SNAP_%d_151216`, 시간부만 정상). 기능 무해, 표기만. 미수정(지정 스크립트 임의변경 보류).

---

## 5. 미실행 / 대기 (유저 지시 필요)

- [ ] SessionEnd 훅 정지 (`.claude/settings.json` SessionEnd 제거/무력화) — 끄면 이후 수동 커밋 필요
- [ ] snap.cmd 날짜라벨 버그 수정 여부
- [ ] `autoloop/patches/game.html.WIP_backup`(3.4MB) `.gitignore` 등재 여부 (리포 비대화 대응, 기존 blob은 rewrite 금지)
