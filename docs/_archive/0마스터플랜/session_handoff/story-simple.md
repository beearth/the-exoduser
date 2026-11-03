# 단순작업(Sonnet): 스토리총괄 인계 — 2026-10-28 (STY-17 완료·검수 PASS, 재생성 대기: 컨텍스트 230K, 200K 초과로 STY-18은 새 세션이 시작)

- 세션: Sonnet 5.5 / 스토리 총괄(`local_0b7b50a3`) 소속 단순작업. 명세는 총괄, 구현·검증·커밋만.
- 판정 문서(SSOT): `DIALOGUE_CANON_AUDIT_20261028.md`(B2), `PET_VOICE_CANON_20261028.md`(STY-16), `CH3_STORY_SPINE_20261028.md`(STY-17), `BOSS_NAME_EN_20261028.md`(STY-18) — 모두 `docs/11내러티브·로어디자인/`.
- 재생성 기준: 작업 단위마다 `get_usage(self)`(deferred → ToolSearch `select:mcp__ccd_session_mgmt__get_usage`), 100K 넘으면 이 문서 갱신 후 총괄에 보고, 200K 넘으면 즉시 멈춤.

## 완료한 것
- 묶음 A(STY-14, 13건) `2acde58ac` · 묶음 C(STY-15) `14de6fda3`+`77125bc6f` · 묶음 B1 `5539a1c46` · 묶음 B2(번역대상 No.3599~3720) `db4c64f34`.
- STY-16 펫 말투 61줄 `7e90f22f6`(총괄 PASS `ccc857437`).
- **STY-17 3장 대사(총괄 검수 PASS)**: 코드·27언어·번역목록·펫 문서 `4042e959d`, CH3 뼈대·STORY_LEAD_MASTER 정정 `5b652a35c`. 보스 6키(`intro10`·`die10~12`·`intro13`·`die13`)·디로이 4줄 교체(`_envDlg[2]`·`_bi[2]`·`_cc[2]`·`dd_ch2`)·si13 `boss_kill` 분기 2줄. 번역대상 신규 No.3721~3728, 옛 행 0856·3635·3646·2959 번호 유지 갱신. 명세의 "5줄"은 4줄로 정정됨.
- 스크립트·번역표(재사용): `I:\EXODUSER-Storage\_handoff\story-simple-ch3\` — `master.json`(번호·id·ko·en, 새 일은 이 형식으로 새 폴더에)·`apply_game.py`(`_BOSS_LINES`·호출부 치환·`_EN` 블록 삽입, `rep1`로 1회 일치 단언)·`apply_lang.py <루트> [check]`(번역 JSON 검사 후 27언어 `[I18N-FILL]` 위에 블록 삽입)·`docs1.py`/`docs2.py`(번역목록·펫 문서·뼈대 문서)·`verify.cjs <루트>`(존재·옛 호출부 0·27언어·문법)·`cap.mjs <언어>`(headless·음소거 캡처, 포트 3392 정적 서버 필요). 이전 스크립트: `story-simple-pet\`(STY-16), `story-simple-dlgB2\`.
- 번역 서브작업 방식: 영어 master를 직접 쓰고 Sonnet 서브에이전트 4개(언어 7/7/7/6개)에 `tr\ch3_tr_<코드>.json`(문자열 배열, master 순서)을 맡긴다. 규칙(한글 0·느낌표 수 영어 이하·기존 용어 맞춤)은 `apply_lang.py`가 검사한다. 에이전트는 로컬 G:\exoduser를 읽으므로 STY-16 이후 블록 용례는 보이지 않을 수 있다(무해).

## 다음 일: STY-18 (총괄 지시 받음 — 새 세션이 이어서 한다)
- 명세(유일한 기준): origin/main `BOSS_NAME_EN_20261028.md` §2 이름 규칙·§3 표 30개·§4 반영 규칙. 보스 표시명 영어를 `_EN` `// [STY-18]` 블록 + 27개 `lang_*.js` + 번역목록에 넣는다. **이미 키가 있는 이름은 건드리지 않는다**(다크드루이드·독버섯 거인·지옥기형·킬루). `HELL_BOSSES` 한국어 원문은 바꾸지 않는다. 한국어 문자열로 찾아 반영(si 번호는 참고값). "군주"=Sovereign 통일("Hell Lord" 금지). 번역대상 No.는 **3729부터**(결번 3700·3701 재사용 금지, STY-17이 3721~3728 사용).
- 27언어 번역은 고유명 느낌을 살리고 길이를 영어와 비슷하게(이름표 폭). 기계 초안.
- 캡처: 영어판 보스 이름표 1장(si10 등장 자막의 이름표가 "Ice Wraith"로 나오는지), headless·음소거, 1x 크롭. `cap.mjs`의 `lang=en`이 `#bossLineName`을 이미 읽는다(`bossLineText`/`name` 로그).
- **같은 커밋에** `STORY_LEAD_MASTER_20261026.md` §5 결정 기록 맨 위 행(표 머리 `|---|---|---|` 바로 아래)을 추가: `| 2026-10-28 | **STY-17 검수 PASS**(4042e959d·5b652a35c). 총괄 독립 검사: _BOSS_LINES 6키·새 12문장 존재, 옛 디로이 4줄은 _EN 키에만 잔존, 27언어 12/12. 캡처 si10 등장 자막·영어 디로이 3장 대면 톤 PASS. 87·115행 "5줄" 표기는 이력이라 유지 | 스토리 총괄 검수 |`, 그리고 STY-17 백로그 행(`| STY-17 |`, 상태 칸 "…총괄 검수 대기")을 "검수 PASS"로 바꾼다.
- 끝나면 SHA·검사 결과·캡처 경로를 총괄(`local_0b7b50a3`)에 SendMessage.

## 금지·주의
- `git add -A`·`--no-verify`·force push·history rewrite(rebase 포함) 금지. 커밋은 `git commit -m ... -- <경로>`만. 로컬 G:\exoduser main 커밋·push 금지(로컬 main 번들 8bf094fe6). 작업은 `git worktree add --detach E:/exoduser-wt/<이름> origin/main`에서.
- push 거절(원격이 앞서감) 시 `git fetch origin && git checkout --detach origin/main && git cherry-pick <SHA>` 후 `verify.cjs` 재실행, 즉시 push(1회). pre-commit 훅이 `tools/guard.baseline.json`을 고치지만 커밋엔 안 들어간다 — checkout 전에 `git checkout -- tools/guard.baseline.json`.
- 워크트리는 push 확인 후 junction 0 확인(`Get-ChildItem -Recurse -Force -Attributes ReparsePoint` 개수) → `git worktree remove --force`.
- 테스트는 수정 후 1회, 2번 실패면 멈추고 보고. 백그라운드 `python -`(stdin 대기) 절대 금지 — 스크립트는 파일로. Node는 `C:/nvm4w/nodejs/node.exe` 전체 경로. 워크트리에는 `node_modules`가 없어 `test/localizationCoverage.test.js`(acorn)는 돌지 않는다 — 안 돌았다고 보고한다.
- 캡처: 부팅 로딩 오버레이 `#stageTransition`이 `#bossLine`(z-index 19)을 가려서 자막이 안 찍힌다 → `cap.mjs`처럼 `display:none` 후 `_bossLine('intro10')`. 캡처 후 3392 서버는 `Get-NetTCPConnection -LocalPort 3392`로 PID 찾아 종료. 캡처 폴더 PNG 일괄 `rm`을 묶은 복합 Bash 명령은 권한 거부됐다 — 필요하면 따로 실행.
- Bash 도구 heredoc에서 `\\`·`\1` 같은 역슬래시가 깨진다 — 정규식 스크립트는 `\x5c`를 쓰거나 Write/Edit 도구로 파일을 쓴다.
- 공유 작업트리 G:\exoduser에 타 세션 WIP 상존 — 건드리지 않는다.
- 남은 알려진 항목(내 몫 아님): T-05 옛 키가 `localization/ui-source.json`·`ui/*.json`·`localization-data.js`에 잔존(화면 미사용), `i18n/ko.json`·`game-easy-test.html`·`gamedemo.html`에도 옛 펫 문장 잔존, 말풍선 줄바꿈은 디자인총괄 이관, 순간이동 마감(`_emCell`) 커밋 보류, STORY_LEAD_MASTER 87·115행 "디로이 5줄"은 이력이라 유지.
