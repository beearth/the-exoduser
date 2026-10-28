# 스팀 총괄 인계 — 2026-10-28 Codex 예약 빌드 준비

- 세션: Codex(PC) 스팀 총괄 인수 / 원인계: Opus 5.5 / 역할: Steam 일일 배포(09:00 예약 작업) 운영·사고 진단, 패치노트 정리, Set Live 준비
- SSOT: `docs/13출시·마케팅/STEAM_UPDATE_RULES.md` (§4 절차, §6 기록표, §9 운영 사고 기록)
- 관련: 예약 작업 `EXODUSER_DailySteamRelease` → `G:\exoduser-steam\daily_release.bat` → `daily_release.ps1` → `steam_update.ps1`. 로그 `G:\exoduser-steam\logs\`, 결과 요약 `G:\exoduser-steam\state\daily_release_<날짜>.md`
- 메모리: `steam-update-rules.md`, `steam-steampipe-setup.md`, `user-path-dotnet-pollution-9009.md`, `git-pack-corruption-20261027.md`

## 현재 상태 (10-28 밤, 사전 준비)
- **10-29 09:00 KST 준비 완료, 빌드 실행 전**: `release-version.json`은 아직 **0.7.9**. 예약 작업이 실행 때 PATCH를 올려 **0.7.10**으로 만든다. 이번에는 버전·런타임 파일을 수정하지 않았다.
- `v0.7.10.md` 한·영 플레이어 문구를 **final**로 사전 작성했다. 범위는 `v0.7.9` = `d04602919` → 검토 기준 `origin/main 62b538d0063fbf045d0ed97fca3cac1c2580d198`, 일반 커밋 169개. 문서·도구·Unity·Godot·미반영 후보는 노트에서 제외했다. final은 문구 확정이며 출시 완료가 아니다.
- `daily_release.ps1` 183~187행을 읽어 확인: 다음 버전 노트가 이미 있으면 초안 생성을 건너뛰고 final 노트로 `patch-notes.js`를 생성한다. 따라서 이 문서가 포함된 원격 기준으로 예약 빌드가 성공하면 **v0.7.10 노트도 해당 빌드에 포함**된다. 현재 main의 `patch-notes.js`는 그대로 보존했다.
- 예약 작업 읽기 점검: **Enabled=true·Ready**, 다음 `2026-10-29 09:00:00`(Korea Standard Time), 최근 `2026-10-28 09:16:09`, 결과 **0**, 누락 **0**. 동작 `conhost.exe --headless` → `daily_release.bat`, 제한 `PT3H`, 중복 실행 `IgnoreNew`. 등록·변경·수동 실행은 하지 않았다. InteractiveToken이므로 실행 시 사용자 로그온 상태가 필요하다.
- 근거·변경 전 사본: `I:\EXODUSER-Storage\codex-takeover\steam\evidence-20261028-2255\`. 최종 브랜치·SHA·원격 조회 결과는 같은 상위 폴더의 `REPORT.md`를 따른다.
- **v0.7.9 업로드 완료, 비공개**: BuildID **26258132** (setlive ""). smoke·preview·upload PASS(404는 무해한 `/api/load/t1` 1건).
- 릴리스 커밋 `d04602919`(기준 origin/main ecd9098d7, v0.7.8 이후 179커밋). 원격 main 반영 = 병합 커밋 `54db3bf42`(스팀 총괄이 수동 병합 push). 로컬 태그 `v0.7.9` = d04602919, **태그 push는 Set Live 후**(§4.7).
- v0.7.8(로컬 커밋 1d0f1b478, 로컬 태그 v0.7.8)은 10-27 smoke FAIL로 업로드되지 않았다. v0.7.9가 그 변경분까지 포함한다.
- 이전 인계의 Steam default 관측은 예전 빌드(체크 표시 25202408)다. 이번 준비에서는 Steamworks에 접속하지 않았으므로 현재 공개 BuildID를 재확인한 것은 아니다.

## 이전 스팀 총괄의 수정 이력 (원인계 기준 반영 완료)
| 항목 | 내용 |
|---|---|
| 10-27 9009 | 사용자 PATH dotnet 오염. PATH 정리 + `DOTNET_ADD_GLOBAL_TOOLS_TO_PATH=false`, bat/ps1이 PATH와 무관하게 동작 |
| 기준 HEAD | `daily_release.ps1`이 공유 checkout이 아니라 fetch한 origin/main을 `E:\exoduser-wt\steam-build-<날짜>` worktree로 받아 빌드 (CTO 10-27 결정, 원격 da420823e) |
| 10-28 멈춤 | pre-commit guard.js가 빌드 worktree의 `tools/guard.baseline.json`을 고쳐 dirty → DEPLOY 입력 게이트에서 무인 대기(0xC000013A). 커밋 직후 그 파일을 되돌리고, 다른 변경이 남으면 실패로 끝내게 수정. 09:16 1회 재실행 |
| push 경합 | 다른 세션 push와 겹쳐 2회 거부 → 스크립트 재시도를 fetch+merge+push 최대 5회(10초 간격)로 늘림 |
| 규칙 문서 | 5d82bb9ff(어제 권한 거부로 미반영) → 원격 da420823e, 10-28 사고 기록 → 2be309f10 |

`daily_release.ps1`은 git 밖 파일(UTF-8 BOM 필수). 수정 전 사본 `state\daily_release.ps1.bak_20261027`. DryRun: `daily_release.bat -DryRun`.

## 남은 일
- **10-28 사용자 결정(CTO 승인 카드)**: ① 26258132(v0.7.9)는 Set Live하지 않는다. 10-29 09:00 빌드(v0.7.10)가 후보이며 **실제 BuildID 확정 뒤 사용자 확인 전에는 Set Live 금지**. ② 게시물은 v0.7.0~v0.7.10 합본 방향이다. `steam_event_v0.7.10.md`에 현재 검토분을 합쳤고, 빌드 뒤 추가 커밋과 최종 게시 내용을 확인한다. 같은 질문을 채팅에 반복하지 않고 공용 `USER_CONFIRM.md`에 한 줄 추가했다.
0. **무창·무음 전환 완료(10-28 10:30, 사용자 지시 CTO 경유)**: 예약 작업 = `conhost.exe --headless`·제한 3시간, smoke `--mute-audio`·서버 windowsHide, msg.exe 팝업·setlive 브라우저 자동 열기 제거. 10-29 09:00이 숨김 실행 첫 검증 — 창이 없으므로 로그·summary 파일로만 확인한다. 상세 STEAM_UPDATE_RULES §7.3.
1. ~~패치노트 v0.7.8+v0.7.9 정리~~ **완료(10-28 재개)**: `v0.7.8.md`·`v0.7.9.md` status: final(출시본 파일을 바꾼 커밋만 수동 큐레이션, 영문 이름은 게임 _EN 기준 Lightning Dash·Ceaseless Motion·Hell Slam), `patch-notes.js` 재생성(다음 빌드부터 게임 내 반영), Steam 이벤트 게시본(EN/KO BBCode) `docs/13출시·마케팅/patch_notes/steam_event_v0.7.9.md`. **주의**: 26258132 안의 게임 내 패치노트는 정리 전 초안 문구 그대로다(게시본 하단 표). 게시·Set Live는 CTO 경유 사용자 확인 대기.
2. **10-29 빌드 뒤에만**: `daily_release_20261029.md`·로그에서 실제 source SHA·버전·BuildID·smoke/preview/upload·push 결과 확인 → 사전 검토 기준 이후 추가된 출시본 변경을 노트와 대조 → 1600×900 무창·무음 게임 내 패치노트 캡처 직접 검수. 그 뒤 확정 BuildID와 합본 게시본의 사용자 확인을 받고 수동 Set Live·게시·해당 버전 태그 push·§6 기록을 진행한다. 26258132나 v0.7.9 태그로 대체 진행하지 않는다.
3. Set Live 뒤 설치본 확인: `package.nw/package.json` main = `nw-boot.html`, 포트 바인딩 로그(10ce8d7ba 수정분).
4. 10-29 09:00 실행 결과는 아직 미래 단계다. 예약 등록과 최근 결과 0은 내일 빌드·업로드·실설치·디자인 검수의 증거가 아니다. 커밋 0이면 건너뛰는 것이 정상.
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
2. 10-29 09:00 전이면 준비 문서의 원격 포함 여부만 확인한다. 예약 작업 실행·등록 변경·steamcmd 로그인은 하지 않는다.
3. 10-29 09:00 이후라면 위 2번의 실제 빌드 결과·추가 커밋·패치노트 화면을 확인한다. 사용자 확인 항목은 `I:\EXODUSER-Storage\codex-takeover\USER_CONFIRM.md`에 모으며, 확인 전 Set Live·Steam 게시·태그 push는 보류한다.
