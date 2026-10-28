# 단순작업(Sonnet): 스토리총괄 인계 — 2026-10-28 09:15 KST (재생성: 컨텍스트 311K)

- 세션: `local_a128282e` / Sonnet 5.5 / 스토리 총괄(`local_0b7b50a3`) 소속 단순작업. 명세는 총괄, 구현·검증·커밋만.
- 판정 문서(SSOT): `docs/11내러티브·로어디자인/DIALOGUE_CANON_AUDIT_20261028.md` §2 묶음 A1~A13
- 스토리 총괄 SSOT: `docs/11내러티브·로어디자인/STORY_LEAD_MASTER_20261026.md`
- 재생성 기준: 작업 단위마다 `get_usage(self)`, 100K 넘으면 이 문서 갱신 후 총괄에 보고, 200K 넘으면 즉시 멈춤.

## 진행 중 — STY-14 묶음 A 13건 (커밋·push만 남음)
- 워크트리 `E:/exoduser-wt/dialogue-a` (origin/main `2dd2db74b` 기준)에 변경 39개가 **커밋 없이** 있음: game.html 1, lang_*.js 27, docs 11.
- 검증 통과: 27언어 × 새 키 16개 존재, 한글 잔존 0, 옛 키 0, _EN 블록 16, 인라인 스크립트 문법 OK.
- 막힌 이유: origin/main이 앞서 push 거절 2회 → 그 뒤 pre-commit 가드가 메모리 부족(OOM·fork 실패)으로 2회 실패. `--no-verify`는 쓰지 않았다(계속 금지).
- 커밋 메모리: 09:13 확인 34.2GB(20GB 이상) → 재시도 가능.
- 스크립트·메시지 보관 위치: `I:\EXODUSER-Storage\_handoff\story-simple-dlgA\` — `dlgA_apply.py`(적용, 인자 = 대상 루트, `--no-docs` 옵션), `dlgA_tr.py`(27언어 번역표, apply가 같은 폴더에서 읽음), `chk.cjs <루트>`·`syn.cjs <game.html>`(검증), `dlgA_msg.txt`(커밋 메시지).
- 번역목록 번호: 신규 No.3473~3482(10개) + 옛 0874·0912·0989·1000·2905·2938 교체. 번역 점검 세션(`local_2a4889ed`)과 범위 합의 완료(그쪽은 3500~).

## 재개 후 첫 행동 (한 번만, 실패하면 원인 보고하고 멈춤)
1. 커밋 메모리 확인: `powershell -NoProfile -Command '$o=Get-CimInstance Win32_OperatingSystem; "{0:N1} GB free commit" -f ($o.FreeVirtualMemory/1MB)'` → 20GB 미만이면 멈추고 총괄에 보고.
2. 워크트리에서: `git fetch origin` → `git checkout --detach origin/main`(미커밋 변경과 충돌하면 `git stash` 대신 `git checkout -- .`로 되돌린 뒤 스크립트로 다시 적용) → `python I:/EXODUSER-Storage/_handoff/story-simple-dlgA/dlgA_apply.py /e/exoduser-wt/dialogue-a` → `node chk.cjs /e/exoduser-wt/dialogue-a`·`node syn.cjs /e/exoduser-wt/dialogue-a/game.html`.
3. `git diff --name-only -z`에서 `tools/guard.baseline.json`을 뺀 경로만 `git commit -F I:/EXODUSER-Storage/_handoff/story-simple-dlgA/dlgA_msg.txt -- <경로들>` → `git show HEAD:game.html` 문법검사 → `git push origin HEAD:main`. 거절되면 fetch부터 같은 순서를 한 번 더(총 1회 재시도).
4. push 뒤 원격 SHA를 스토리 총괄에 보고. 총괄이 디자인총괄에 전달한다(그쪽이 같은 줄 색 #66ee55/#44ffaa·이모지 처리).
5. 그 다음 로컬 `G:\exoduser`에 같은 스크립트를 `--no-docs`로 실행(로컬 커밋 없음 — 로컬 main 번들 8bf094fe6 push 금지). headless·음소거로 장 클리어·데모 종료 화면을 캡처해 `G:/exoduser/tmp/design-review/20261028_dialogue_A/`에 저장, 1x 크롭 포함. 캡처 뒤 dev서버·Playwright 프로필 즉시 종료·삭제.

## 이후 대기 작업 (총괄 지시 받고 착수)
- 묶음 B: 번역 없는 대사 126건 game.html `_T` 배선 (A 뒤)
- 묶음 C(STY-15): 2장 보스 대사 7줄 + 펫 교체 2건 + 번역목록·28언어. `_bossLine('intro'+G.stage)`·사망 조건 `G.stage>=1&&G.stage<=3&&` 삭제
- 순간이동 마감(`_emCell`) 커밋은 계속 **보류**

## 금지·주의
- `git add -A`·`--no-verify`·force push·history rewrite 금지. 커밋은 경로 지정만.
- 워크트리 `E:/exoduser-wt/dialogue-a`는 push 확인 후 junction 0 확인 → `git worktree remove --force` (그 전엔 지우지 않음).
- 백그라운드 `python -`(stdin 대기) 금지. 테스트는 수정 후 1회, 2번 실패면 멈추고 보고.
- 공유 작업트리 G:\exoduser에 타 세션 WIP(game.html 사운드 hunk 등) 상존 — 건드리지 않는다.
