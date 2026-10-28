# 스팀 총괄 인계 — 2026-10-28 09:45

- 세션: 스팀 총괄 / Opus 5.5 / 역할: Steam 일일 배포(09:00 예약 작업) 운영·사고 진단, 패치노트 정리, Set Live 준비
- SSOT: `docs/13출시·마케팅/STEAM_UPDATE_RULES.md` (§4 절차, §6 기록표, §9 운영 사고 기록)
- 관련: 예약 작업 `EXODUSER_DailySteamRelease` → `G:\exoduser-steam\daily_release.bat` → `daily_release.ps1` → `steam_update.ps1`. 로그 `G:\exoduser-steam\logs\`, 결과 요약 `G:\exoduser-steam\state\daily_release_<날짜>.md`
- 메모리: `steam-update-rules.md`, `steam-steampipe-setup.md`, `user-path-dotnet-pollution-9009.md`, `git-pack-corruption-20261027.md`

## 현재 상태 (10-28 09:45)
- **v0.7.9 업로드 완료, 비공개**: BuildID **26258132** (setlive ""). smoke·preview·upload PASS(404는 무해한 `/api/load/t1` 1건).
- 릴리스 커밋 `d04602919`(기준 origin/main ecd9098d7, v0.7.8 이후 179커밋). 원격 main 반영 = 병합 커밋 `54db3bf42`(스팀 총괄이 수동 병합 push). 로컬 태그 `v0.7.9` = d04602919, **태그 push는 Set Live 후**(§4.7).
- v0.7.8(로컬 커밋 1d0f1b478, 로컬 태그 v0.7.8)은 10-27 smoke FAIL로 업로드되지 않았다. v0.7.9가 그 변경분까지 포함한다.
- Steam default 브랜치는 아직 예전 빌드(체크 표시 25202408). 10/10 이후 올린 빌드는 하나도 Set Live되지 않았다.

## 이번 대화에서 고친 것 (모두 반영 완료)
| 항목 | 내용 |
|---|---|
| 10-27 9009 | 사용자 PATH dotnet 오염. PATH 정리 + `DOTNET_ADD_GLOBAL_TOOLS_TO_PATH=false`, bat/ps1이 PATH와 무관하게 동작 |
| 기준 HEAD | `daily_release.ps1`이 공유 checkout이 아니라 fetch한 origin/main을 `E:\exoduser-wt\steam-build-<날짜>` worktree로 받아 빌드 (CTO 10-27 결정, 원격 da420823e) |
| 10-28 멈춤 | pre-commit guard.js가 빌드 worktree의 `tools/guard.baseline.json`을 고쳐 dirty → DEPLOY 입력 게이트에서 무인 대기(0xC000013A). 커밋 직후 그 파일을 되돌리고, 다른 변경이 남으면 실패로 끝내게 수정. 09:16 1회 재실행 |
| push 경합 | 다른 세션 push와 겹쳐 2회 거부 → 스크립트 재시도를 fetch+merge+push 최대 5회(10초 간격)로 늘림 |
| 규칙 문서 | 5d82bb9ff(어제 권한 거부로 미반영) → 원격 da420823e, 10-28 사고 기록 → 2be309f10 |

`daily_release.ps1`은 git 밖 파일(UTF-8 BOM 필수). 수정 전 사본 `state\daily_release.ps1.bak_20261027`. DryRun: `daily_release.bat -DryRun`.

## 남은 일
1. **패치노트 v0.7.8+v0.7.9 정리** (Set Live 전): 초안 `docs/13출시·마케팅/patch_notes/v0.7.9.md`(원격, status: draft)는 커밋 제목 나열이다. 플레이어가 보는 변화만 한·영으로 추린다(Unity 이식·docs·도구 제외). 후보 목록 `G:\exoduser-steam\state\patchnote_curation_v0.7.8-0.7.9.md`(디자인총괄 제보 UI 2줄 기록됨). 다듬은 뒤 status: final.
2. **사용자 확인 후**: Steamworks에서 26258132 Set Live(`steam_update.bat setlive`, SETLIVE 입력) → Steam 이벤트 패치노트 게시(§7) → `git push origin v0.7.9` → §6 기록표 한 줄.
3. Set Live 뒤 설치본 확인: `package.nw/package.json` main = `nw-boot.html`, 포트 바인딩 로그(10ce8d7ba 수정분).
4. 10-29 09:00 실행 결과 확인(로그·BuildID·push=yes 여부). 커밋 0이면 건너뛰는 것이 정상.
5. 선택: 옛 worktree `G:\exoduser-steam\worktree\rel-0.7.0…rel-0.7.8`(각 ~30GB) 정리 — 삭제는 사용자 확인 필요, junction 전수조사 먼저.

## 연결 세션
- 상위: CTO `local_7072229c-70cf-4fdf-ab35-c3c59e683d53` (재개 담당)
- 디자인총괄 `local_eb8a8577-c0e4-4a9f-b628-fac0c8549dbf` (패치노트 UI 항목 제보)

## 금지·주의
- Set Live·Steam 패치노트 게시·태그 push는 사용자 확인 후에만. 하루 업로드 최대 1회.
- 공유 checkout(G:\exoduser) main을 건드리지 않는다. 원격 반영은 E:\exoduser-wt 임시 worktree에서 경로 지정 커밋 → 비강제 push → worktree 제거.
- 저장소 gc·repack·prune 금지(10-27 팩 손상, CTO 복구 담당). `git add -A` 금지.
- 실행 중인 개발 서버(3333)·Steam 게임을 재시작하지 않는다.
- 이 세션의 일반 `git push`는 통과했지만, 10-27에는 plumbing(commit-tree) 기반 push가 권한 설정에 막혔다. 막히면 우회하지 말고 사용자에게 명령을 넘긴다.

## 재개 후 첫 행동
1. 이 문서와 MEMORY.md를 읽는다.
2. 패치노트 v0.7.8+v0.7.9 한·영 정리안을 만들어 사용자에게 Set Live·게시 확인을 요청한다.
3. 10-29 09:00 이후 로그를 확인한다.
