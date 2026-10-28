# 단순작업(Sonnet): 스토리총괄 인계 — 2026-10-28 (STY-16 완료, 재생성 대기: 컨텍스트 249K, 200K 초과로 새 일 받지 않음)

- 세션: Sonnet 5.5 / 스토리 총괄(`local_0b7b50a3`) 소속 단순작업. 명세는 총괄, 구현·검증·커밋만.
- 판정 문서(SSOT): `docs/11내러티브·로어디자인/DIALOGUE_CANON_AUDIT_20261028.md`(B2), `docs/11내러티브·로어디자인/PET_VOICE_CANON_20261028.md`(STY-16)
- 재생성 기준: 작업 단위마다 `get_usage(self)`(deferred → ToolSearch `select:mcp__ccd_session_mgmt__get_usage`), 100K 넘으면 이 문서 갱신 후 총괄에 보고, 200K 넘으면 즉시 멈춤.

## 완료한 것
- 묶음 A(STY-14, 13건): 원격 `2acde58ac`. 묶음 C(STY-15): `14de6fda3`+`77125bc6f`. 묶음 B1(전수 목록): `5539a1c46`. 묶음 B2(번역 누락 142키×28언어, 번역대상 No.3599~3720): `db4c64f34`.
- **STY-16 펫 말투 61줄(STY-D19)**: 원격 `7e90f22f6`, 총괄 검수 PASS(`ccc857437`). 디로이 58·핵터 3. game.html 호출부 교체 + `_EN` `// [STY-16]` 새 블록 61키(옛 `_EN` 항목 삭제) + 27개 `lang_*.js` 각 +61키(옛 키 잔존) + 번역대상 옛 행 61개 KO/EN 교체(번호 유지, 신규 No. 없음) + 펫 문서 3곳 + `test/petRageFullDialogue.test.js`를 호출부 기준으로 정정. 번역은 기계 초안(원어민 감수 전).
- 스크립트·번역표: `I:\EXODUSER-Storage\_handoff\story-simple-pet\` — `en.py`(영어 61줄)·`master.json`(번호·화자·옛/새 KO·EN)·`tr\pet_tr_<코드>.json`(27언어 61개, master 순서)·`chkTr.py [코드…]`(번역 파일 검증)·`apply_game.py <루트>`(game.html 따옴표 경계 치환+`_EN` 블록+테스트)·`apply_lang.py <루트>`(27언어 블록 삽입)·`apply_docs.py`/`docs2.py`/`docs3.py`(번역목록·펫 문서)·`verify.cjs <루트>`(spec §4 표 파싱 검수)·`cap.mjs <언어>`(headless·음소거 펫 말풍선 캡처, 포트 3392 정적 서버 필요: 워크트리에서 `node tools/local-static-server.mjs 3392`, 끝나면 종료). 이전 B2 스크립트: `I:\EXODUSER-Storage\_handoff\story-simple-dlgB2\`.
- 번역 서브작업 방식: 영어 master를 쓰고 Sonnet 서브에이전트 4개(언어 8/7/7/5개)에 `tr\pet_tr_<코드>.json` 작성을 맡긴 뒤 `chkTr.py`로 검증. 에이전트에게 `lang_<코드>.js`에서 옛 줄 번역(ST·LCK·핵터·디로이 표기)을 보고 용어를 맞추게 했다.

## 다음 일: STY-17 (총괄 지시 대기 — 재생성 뒤 총괄이 보낸다)
- 명세(유일한 기준): `docs/11내러티브·로어디자인/CH3_STORY_SPINE_20261028.md` **§5 보스 6줄**(키 `intro10`·`die10`·`die11`·`die12`·`intro13`·`die13`, **트리거 코드 변경 없음**) + **§6 디로이 5줄**(si13 처치 분기는 선택). 번역대상 목록 등록과 27언어(+`_EN`) 포함. §5는 `[제안]` 표라 STY-D29 채택 판정이 끝난 문장만 반영한다(총괄 지시 확인).
- 기존 3장 보스 한 줄 자막 구조는 `_BOSS_LINES`(game.html, STY-12/15) — 키 규칙·`#bossLine` UI는 거기를 따른다. 새 줄은 번역대상 신규 No.를 **3721부터 순서대로** 받는다(옛 행이 없는 줄. 3700·3701 결번 재사용 금지는 STY-16에서 이어 적용).
- 말투: 디로이는 PET_VOICE_CANON §2.1(도도·직설, 느낌표는 위급/처치 직후 1개, 속어·늘임 금지), 핵터는 냉소·짧은 관찰. 영어·27언어도 같은 톤으로 짧고 건조하게.

## 금지·주의
- `git add -A`·`--no-verify`·force push·history rewrite(rebase 포함) 금지. 커밋은 `git commit -m ... -- <경로>`만. 로컬 G:\exoduser main 커밋·push 금지(로컬 main 번들 8bf094fe6). 작업은 `git worktree add --detach E:/exoduser-wt/<이름> origin/main`에서.
- push 거절(원격이 앞서감) 시 `git fetch origin && git checkout --detach origin/main && git cherry-pick <SHA>` 후 즉시 push(1회). pre-commit 훅이 `tools/guard.baseline.json`을 고치면 커밋에 안 들어갈 수 있다 — checkout 전에 `git checkout -- tools/guard.baseline.json`로 되돌린다(필요하면 다음 커밋에서 갱신).
- 워크트리는 push 확인 후 junction 0 확인 → `git worktree remove --force`.
- 테스트는 수정 후 1회, 2번 실패면 멈추고 보고. 백그라운드 `python -`(stdin 대기) 절대 금지(heredoc가 비면 멈춘다). Node는 `C:/nvm4w/nodejs/node.exe` 전체 경로. 워크트리에는 `node_modules`가 없어 `test/localizationCoverage.test.js`(acorn)는 돌지 않는다 — 안 돌았다고 보고한다.
- Bash 도구 heredoc에서 `\\`·`\1` 같은 역슬래시가 깨진다 — 정규식 스크립트는 `\x5c`를 쓰거나 Edit 도구로 쓴다.
- 공유 작업트리 G:\exoduser에 타 세션 WIP 상존 — 건드리지 않는다.
- 남은 알려진 항목(내 몫 아님): T-05 옛 키가 `localization/ui-source.json`·`ui/*.json`·`localization-data.js`에 잔존(화면 미사용), 말풍선 줄바꿈은 디자인총괄 이관, 순간이동 마감(`_emCell`) 커밋 보류.
