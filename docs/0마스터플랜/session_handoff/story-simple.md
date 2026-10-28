# 단순작업(Sonnet): 스토리총괄 인계 — 2026-10-28 12:00 KST (재생성 대기: 컨텍스트 332K, 200K 초과로 새 일 받지 않음)

- 세션: Sonnet 5.5 / 스토리 총괄(`local_0b7b50a3`) 소속 단순작업. 명세는 총괄, 구현·검증·커밋만.
- 판정 문서(SSOT): `docs/11내러티브·로어디자인/DIALOGUE_CANON_AUDIT_20261028.md` §3.1(B2 명세)·§3.2(B2 결과)·§4(보류)
- 재생성 기준: 작업 단위마다 `get_usage(self)`(deferred → ToolSearch `select:mcp__ccd_session_mgmt__get_usage`), 100K 넘으면 이 문서 갱신 후 총괄에 보고, 200K 넘으면 즉시 멈춤.

## 완료한 것
- 묶음 A(STY-14, 13건): 원격 `2acde58ac`. 묶음 C(STY-15): `14de6fda3`+`77125bc6f`. 묶음 B1(전수 목록): `5539a1c46`.
- **묶음 B2**: 번역 누락 대사 + 피날레 배너 6줄 → 키 142개 × 28언어. 결과는 AUDIT §3.2, 번역대상 No.3599~3720. 원격 `db4c64f34`, 총괄 검수 대체로 PASS. **보정 3건은 스토리 총괄이 처리 중이라 건드리지 않는다**: 번역목록 No.3657·3658·3702·3703 중복 행과 3700·3701 결번, `#stLoadTip` 첫 문구 `_T` 경유, `PROLOGUE_LINES` en/ja/zh wa33 폴백 옛 문장.
- 스크립트·번역표: `I:\EXODUSER-Storage\_handoff\story-simple-dlgB2\` — `dlgB2_keys.py`(키 142·영어), `tr\dlgB2_tr_<코드>.json`(27언어 136개)·`tr\banner.json`(배너 6개), `dlgB2_apply.py <루트> [--no-docs]`, `chkTr.py`(번역 파일 검증), `chkB.cjs <루트>`(반영 후 검증), `cap.mjs <언어>`(headless 캡처).

## 대기 작업 (총괄 지시 받고 착수)
- 순간이동 마감(`_emCell`) 커밋은 계속 **보류**.
- (없음) 새 일은 재생성 뒤 총괄 지시를 받고 착수. `#stLoadTip` `_T` 경유는 총괄이 처리.
- 번역표의 Hecter/Deroy 표기는 기존 lang 파일을 따른 것이다(영어는 Hector/Diroy).

## 금지·주의
- `git add -A`·`--no-verify`·force push·history rewrite(rebase 포함) 금지. 커밋은 경로 지정만. 로컬 G:\exoduser main 커밋·push 금지(로컬 main 번들 8bf094fe6).
- push 거절 시 `git fetch origin && git checkout --detach origin/main && git cherry-pick <SHA>` 후 즉시 push(1회).
- 워크트리(`E:/exoduser-wt/dialogue-b2`)는 push 확인 후 junction 0 확인 → `git worktree remove --force`. 커밋 메모리 20GB 이상일 때만.
- 테스트는 수정 후 1회, 2번 실패면 멈추고 보고. 백그라운드 `python -`(stdin 대기) 절대 금지. Node는 `C:/nvm4w/nodejs/node.exe` 전체 경로.
- 공유 작업트리 G:\exoduser에 타 세션 WIP 상존 — 건드리지 않는다.
- 임시 프로필 `I:\EXODUSER-Storage\_out_dlgB2\prof-AYIG0C` 삭제는 총괄이 CTO 경유로 처리(내 쪽 삭제 명령은 거부됨).
