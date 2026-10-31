# Steam 업데이트 규칙 (2026-10-09 사용자 확정)

> 모든 세션은 Steam 본편 업데이트를 이 규칙대로만 진행한다. 기술 절차 상세는 `G:\exoduser-steam\README.md`(SteamPipe 파이프라인)와 `STEAM_FULL_RESUBMISSION_20261002.md`(본편 패키지 계약)를 따른다.

## 1. 주기

| 항목 | 규칙 |
|---|---|
| 업데이트 시각 | **매일 오전 9시(KST)** |
| 횟수 | **하루 최대 1회.** 전날 업데이트 이후 커밋이 없으면 그날은 건너뜀 |
| 긴급 수정 | 게임 진행 불가·세이브 손상 같은 치명 버그만 예외로 9시 외 추가 업데이트 허용. 이때도 사용자 확인 필수 |

## 2. 버전

| 항목 | 규칙 |
|---|---|
| 단일 기준 | 저장소 루트 `release-version.json`의 `version`. 로비 표시·`package.json`·NW 빌드 manifest·Steam 빌드 설명(VDF desc)은 모두 이 값을 읽는다. 다른 곳에 버전을 직접 적지 않는다 |
| 형식 | `MAJOR.MINOR.PATCH` (얼리액세스 기간 MAJOR=0) |
| 매일 업데이트 | PATCH +1 (예: 0.7.0 → 0.7.1) |
| 큰 업데이트 | 새 시스템·새 장·대규모 밸런스 개편은 MINOR +1, PATCH 0 (예: 0.7.5 → 0.8.0). 사용자 지시 또는 사전 확인 후 |
| 시작 버전 | **0.7.0** (이전 로비 표시 v0.6.0 · 20260521 이후 대규모 변경 다수) |
| git 태그 | 업로드한 커밋에 `v<version>` 태그 (예: `v0.7.1`) |

## 3. 패치노트

| 항목 | 규칙 |
|---|---|
| 위치 | `docs/13출시·마케팅/patch_notes/v<version>.md` — 한국어·영어 두 언어 |
| 범위 | 이전 버전 태그 이후 커밋 중 **플레이어에게 보이는 변경만** (기능 추가·밸런스·버그 수정·아트/연출). 내부 도구·문서·테스트·리팩터는 제외 |
| 문체 | 플레이어용 짧은 문장. 커밋 해시·파일명·변수명 금지. 분류: 새 기능 / 개선 / 버그 수정 / 밸런스 |
| 초안 | 업데이트 준비 시 자동 생성 → 사람이 읽기 좋게 다듬어 확정 |
| 게임 내 표시 | 로비 버전 표시에서 최근 패치노트를 볼 수 있게 한다 |
| Steam 게시 | Steamworks → 이벤트 및 공지 → **패치노트**로 게시. 외부 공개 게시이므로 **사용자 확인 후** 게시 (Steamworks 로그인은 사용자) |

## 4. 빌드·업로드 절차 (매일 09:00)

1. 전날 업데이트 태그 이후 커밋 확인 → 없으면 종료.
2. `release-version.json` 버전 올림 + 패치노트 초안 생성.
3. **커밋된 HEAD 기준**으로 빌드(다른 세션의 미커밋 작업이 섞이지 않게). 작업 트리를 그대로 빌드하지 않는다. **2026-10-27 CTO 결정: 기준 HEAD = fetch한 원격 `origin/main`** — `E:\exoduser-wt\steam-build-<날짜>` worktree로 떼어 내 그 안에서 버전 커밋·빌드하고, 업로드 성공 시에만 로컬 태그 + `git push origin HEAD:main`(비강제, 거절 시 fetch+merge+push 최대 5회 재시도), 끝나면 worktree 제거. 공유 폴더 `G:\exoduser`의 로컬 main은 쓰지 않는다. 태그 push는 7번(공개 후) 그대로.
4. smoke(실제 실행 점검) → preview(SteamPipe 미리 올리기) → upload(`setlive ""`, 공개 전환 안 함).
5. 사용자에게 알림: 새 BuildID·버전·패치노트 초안.
6. **공개 전환(Set Live)과 패치노트 게시는 사용자 확인 후에만.** 자동 공개 금지(기존 안전장치 유지: DEPLOY/SETLIVE 입력, smoke/preview 통과 필수).
7. 공개 후 `v<version>` 태그 push, 이 문서 하단 기록표에 한 줄 추가.

## 5. 금지

- 하루 2회 이상 정기 업데이트
- 버전 미변경 업로드, 패치노트 없는 업로드
- 미커밋 작업 트리 빌드
- 사용자 확인 없는 Set Live·패치노트 게시
- 데모 App(5337590) 업데이트는 별도 지시가 있을 때만

## 6. 기록

| 날짜 | 버전 | BuildID | 공개 | 패치노트 |
|---|---|---|---|---|
| 2026-10-10 | 0.7.0 | 25842101 | 대기 (Set Live 사용자 확인) | v0.7.0.md (final), Steam 게시 대기 |

## 7. 구현 도구 (2026-10-09 구축)

### 7.1 버전 단일 소스

| 파일 | 역할 |
|---|---|
| `release-version.json` (저장소 루트) | `{version, date, channel}` — 버전이 적히는 유일한 곳. 시작 0.7.0 |
| `release-version.js` (생성물, 커밋함) | `window.EXODUSER_RELEASE={version,date}` — 로비 `_LOBBY_VER` 표시용. index.html이 `build-target.js` 옆에서 로드 |
| `tools/release-version.mjs` | `get` / `bump patch\|minor`(json 버전+날짜 갱신, release-version.js 재생성, package.json `version`만 서식 보존 치환) / `check`(불일치 시 exit 1) |
| `package.json` `version` | bump가 동기화. NW manifest `version`(tools/release-target.mjs runtimeManifest)이 이 값을 읽음 |
| `build-nwjs.mjs` | `app.version`을 release-version.json에서 읽음(하드코딩 금지). FILES에 `release-version.js`·`patch-notes.js` 포함 → NW 빌드·웹 빌드(tools/build-web.mjs가 FILES를 재사용) 모두 배포됨 |

### 7.2 패치노트

| 파일 | 역할 |
|---|---|
| `docs/13출시·마케팅/patch_notes/v<version>.md` | frontmatter `version/date/status(draft\|final)` + `## KO`/`## EN` + `### 분류`(새 기능/개선/버그 수정/밸런스 · New/Improved/Fixed/Balance) + `- 항목` |
| `tools/patch-notes.mjs` | `draft --from <tag> --version X.Y.Z`(태그 없으면 `--since <날짜>`) — 커밋 제목 수집, docs/chore/test/qa/guard/tools/refactor/내부 커밋 제외, 해시·트래커ID 제거 후 분류별 초안(`status: draft`) 생성. `build [--include-draft]` — `status: final` 노트(옵션 시 최신 초안 포함)를 최신순 5개로 `patch-notes.js` 생성 |
| `patch-notes.js` (생성물, 커밋함) | `window.EXODUSER_PATCH_NOTES=[{version,date,ko:{sections},en:{sections}},…]` |
| 게임 내 표시 | 로비 우하단의 보이는 버전 버튼(`#lobbyVersionTxt`) 클릭·Enter/Space → Hell Gothic 패치노트 패널(`#patchNotesPanel`). 좌상단 개발 정보(`#lobbyVerOverlay`)는 출시 CSS에서 숨김. KO/EN은 해당 언어, 그 외 언어는 EN 폴백. 닫기 버튼·Esc·배경 클릭으로 닫히고 버전 버튼으로 포커스 복귀 |
| 테스트 | `test/releaseVersion.test.js` — bump/check/노트 파싱/빌드 정렬/커밋 필터 8케이스 |

### 7.3 매일 09:00 자동 파이프라인

| 파일 | 역할 |
|---|---|
| `G:\exoduser-steam\daily_release.ps1` (+`daily_release.bat`) | §4 1~5단계 구현. fetch한 origin/main을 별도 worktree로 준비 → 신규 커밋 없으면/오늘 이미 릴리스했으면 종료 → bump patch → 다음 버전 노트가 있으면 보존, 없으면 초안 생성 → final 노트만 `patch-notes.js`로 생성 → 버전 파일·생성물·해당 노트만 **경로지정 커밋**(`git add -A` 금지) → 잔여 dirty 게이트 → 그 커밋에서 build·smoke·preview·upload(`setlive ""`) → 성공 시에만 로컬 태그 `v<version>`·원격 main 비강제 push → `state/daily_release_<날짜>.md` 요약. `-DryRun`도 fetch·worktree export·check·정리는 수행하며 bump·commit·tag·push·build·upload는 하지 않음 |
| `G:\exoduser-steam\steam_update.ps1` | `-SourceRoot`(대체 체크아웃 빌드), `-BuildId`, `-RuntimeDir`(검증 런타임), `-AppVdfPath/-PreviewVdfPath`(desc에 버전을 넣은 런타임 생성 VDF — 커밋된 scripts\*.vdf는 불변) 지원. 기존 안전장치(smoke/preview 게이트·SETLIVE 수동) 유지 |
| 로그인 | steamcmd 캐시 로그인만. `-Account`/`STEAM_BUILD_ACCOUNT` 미지정이면 preview 전에 "로그인 필요"로 중단 |
| VDF desc | 실행 시 `output/daily/app_build_4749590_v<ver>.vdf` 생성 — `"desc" "EXODUSER: HELL LORD v<ver> (<YYYYMMDD>, win x64, full)"` |

**스케줄 등록 (사용자 확인 후 직접 실행 — 자동 등록 금지):**
```
schtasks /Create /TN "EXODUSER_DailySteamRelease" /TR "cmd /c G:\exoduser-steam\daily_release.bat" /SC DAILY /ST 09:00 /F
```

**무창·무음 실행 (2026-10-28 사용자 지시 "유령같이 브라우저도 안뜨고 소리안나오게"):** 자동 실행은 창을 하나도 띄우지 않고 소리를 내지 않는다.

| 위치 | 설정 |
|---|---|
| 예약 작업 동작 | `C:\Windows\System32\conhost.exe --headless cmd.exe /c G:\exoduser-steam\daily_release.bat -Account shsia` — 콘솔 창 없음. 실행 시간 제한 `PT3H`(창이 없어 입력 대기로 멈추면 3시간 뒤 강제 종료). 변경 전 작업 정의 `state\task_EXODUSER_DailySteamRelease.bak_20261028.xml` |
| smoke (`steam_smoke.mjs`) | Playwright Chromium `headless: true` + `--mute-audio`, 출시 서버(node-main.js) `windowsHide: true` |
| 결과 알림 | `msg.exe` 팝업 제거. 결과는 `state\daily_release_<날짜>.md`와 `logs\daily_release_*.log`로만 |
| setlive (수동 단계) | Steamworks 페이지를 자동으로 열지 않고 URL만 출력 |
| 빌드·preview·upload | nwbuild `mode: build`(앱 실행 안 함), steamcmd는 같은 숨은 콘솔 안에서 실행 |

검증(10-28): 숨은 conhost로 `daily_release.bat -DryRun` 종료코드 0·로그 기록, smoke 단독 실행 PASS(무음). 수정 전 스크립트 사본 `state\*.bak_20261028_ghost`.

### 7.4 Steamworks 패치노트 게시 절차 (공개 — 사용자 확인 후)

1. `docs/13출시·마케팅/patch_notes/v<version>.md` 초안을 플레이어용으로 다듬고 `status: final`로 변경
2. `node tools/patch-notes.mjs build` 재실행 → `patch-notes.js` 갱신(다음 빌드의 게임 내 표시 반영) → 경로지정 커밋
3. https://partner.steamgames.com/apps/landing/4749590 → **이벤트 및 공지(Events & Announcements)** → **Create a new event or announcement** → 유형 **Patch Notes / Game Update** 선택
4. 제목 `v<version> Update (YYYY-MM-DD)` — 본문은 노트 EN 섹션 붙여넣기(스팀 BBCode: `[h2]New[/h2]` `[list][*]…[/list]`), 한국어는 동일 이벤트의 언어 탭에 KO 섹션 입력
5. 미리보기 확인 → **Publish**(사용자 직접 클릭) → §6 기록표에 한 줄 추가
6. 공개 후 `git push origin main v<version>` (태그 push는 공개 이후에만 — §4.7)

## 8. 첫 실행(2026-10-10) 결함과 수정

| 결함 | 증상 | 수정 |
|---|---|---|
| robocopy 종료코드 | 빌드 성공 후 robocopy 1(=복사함)을 실패로 오판, 09:00 실행 중단 | steam_update.ps1: 8 이상만 실패, 이후 LASTEXITCODE 0 |
| worktree 정리 | 남은 worktree를 `worktree remove --force`로 지우며 node_modules junction을 따라 **메인 node_modules 삭제** (npm ci로 복구) | daily_release.ps1: junction을 `rmdir`로 먼저 끊고, 진짜 폴더면 중단 |
| smoke 포트 | 3333 고정 → 정식판 3350 미대응, 타 세션 dev 서버와 충돌 | steam_smoke.mjs: package.nw/release-config.json 포트 사용, 빈 세이브 `/api/load` 404만 정상 처리 |
| 생성 VDF 경로 | output\daily의 VDF가 depot VDF 상대경로를 못 찾아 preview 실패 | daily_release.ps1: depot VDF를 scripts 절대경로로 치환 |
| 실행 로그 | 예약 실행 출력이 남지 않음 | daily_release.ps1: Start-Transcript → G:\exoduser-steam\logs\daily_release_*.log |

## 9. 운영 사고 기록

| 날짜 | 증상 | 원인 | 조치 |
|---|---|---|---|
| 2026-10-27 | 09:00 예약 작업이 종료코드 **9009**로 끝나고 로그 파일이 없음(빌드 0회) | 사용자 PATH가 12.7K자(182항목)로 불어나 새 cmd가 `powershell`·`where`를 못 찾음. 원인은 Unity 오라클·뮤테이션 테스트가 실행마다 `DOTNET_CLI_HOME`을 새 `dotnet-home`으로 잡아, dotnet 첫 실행이 `…\dotnet-home\.dotnet\tools`를 사용자 PATH에 영구 추가한 것(157개) | 사용자 PATH를 25항목(939자)으로 정리, 원본 백업 `G:\exoduser-steam\state\user_path_backup_20261027.txt`. 재발 방지로 사용자 환경변수 `DOTNET_ADD_GLOBAL_TOOLS_TO_PATH=false` 추가, Unity 러너 쪽 동일 설정은 CTO 경유로 요청. 같은 날 13시대에 오늘 몫 1회를 수동 실행. 정리 후에도 이미 떠 있던 러너가 다시 붙여(13:31 기준 40개) 3차 정리. **예약 작업 자체를 PATH와 무관하게 수정**: `daily_release.bat`이 `chcp`·`powershell`을 `%SystemRoot%` 전체 경로로 부르고, `daily_release.ps1`이 시작할 때 레지스트리 Machine+User PATH를 다시 읽어 `\.dotnet\tools` 찌꺼기를 뺀다(PATH 12,954자 셸에서 DryRun 통과 확인, 수정 전 사본 `state\daily_release.*.bak_20261027`) |
| 2026-10-27 | 수동 실행이 smoke FAIL로 중단(빌드 산출물 검사 단계, preview·upload 없음) | `index.html`의 ENTER 버튼 이미지가 `output/imagegen/enter-gothic-v2-brass.png`를 참조(로고 C안 커밋). `output/`은 출시본에 들어가지 않아 404 | 디자인총괄에 에셋 폴더 이동 요청. 오늘은 재실행하지 않음(하루 1회·실패 반복 금지). 로컬 커밋 `1d0f1b478`·로컬 태그 `v0.7.8`은 남고, 10/28 09:00이 v0.7.9로 v0.7.8 변경분까지 함께 빌드한다. Steam 이벤트 패치노트는 v0.7.8+v0.7.9를 합쳐 다듬는다 |
| 2026-10-28 | 09:00 실행이 v0.7.9 커밋 뒤 빌드 직전에 멈춤(종료코드 0xC000013A, 빌드 0회). 빌드 폴더가 남음 | 커밋 때 도는 pre-commit `guard.js`가 줄 수 기준선을 갱신하며 `tools/guard.baseline.json`을 고쳐 빌드 worktree가 dirty로 남음 → `steam_update.ps1`의 DEPLOY 입력 게이트(Read-Host)가 무인 실행에서 대기하다 강제 종료 | `daily_release.ps1` 5단계 커밋 직후 `tools/guard.baseline.json`을 되돌리고, 그 밖의 변경이 남으면 빌드 전에 실패로 끝내며 worktree를 정리하도록 수정. 오늘 업로드 0회라 09:16에 1회 재실행 → BuildID **26258132** 업로드(비공개). 원격 main push는 다른 세션 push와 겹쳐 두 번 거부돼 스팀 총괄이 수동 병합 push(`54db3bf42`). 다음 개선 후보: push 거부 시 재시도 횟수 늘리기 |

| 2026-10-28 | 사용자 지시: 자동 실행이 창·브라우저를 띄우거나 소리를 내지 말 것 | 예약 작업이 Interactive 로그온으로 `cmd.exe`를 직접 실행해 09:00에 콘솔 창이 뜸, 끝날 때 `msg.exe` 팝업, smoke Chromium에 음소거 옵션 없음, setlive가 브라우저를 자동으로 엶 | §7.3 무창·무음 실행 표대로 수정 |

| 2026-10-31 | 09:00 실행 로그·당일 요약 없음, 최근 시도 09:10:34·2147946720(**0x800710E0**) | System 로그: 08:59:58 종료→09:00:39 부팅으로 정각 재부팅 겹침. StartWhenAvailable=false·InteractiveToken. 실제 코드는 Win32 4320 실행 요청 거부이며 0x8004131F가 아님. TaskScheduler/Operational 비활성으로 09:10 거부의 세부 조건·당시 중복 여부는 확정 불가(현재 Ready·릴리스 잔여 프로세스 없음) | 예약 설정·수동 릴리스·프로세스/공용 잠금 변경 없음. 11/01 09:00 전에 PC 켜짐·재부팅/절전 없음·등록 사용자 로그온·AC 전원·작업 Enabled/Ready·중복 실행 없음·네트워크/Git/캐시 로그인/출력 공간이 필요. 다음 예정은 11/01 09:00이나 정상 실행 보장 아님. 증거: I:/EXODUSER-Storage/steam-prep/20261031/REPORT.md. 필요 시 누락 실행 보충 설정·이력 활성화는 제안만 검토 |

**9009 점검법**: 예약 작업 `LastTaskResult`가 9009이고 `logs\daily_release_<오늘>-*.log`가 없으면 PATH 문제다. 레지스트리 PATH로 새 cmd를 띄워 `where powershell`이 되는지 확인한다(이미 떠 있는 셸은 예전 PATH를 물려받으므로 판정에 쓰지 않는다).

## 10. 10-29 v0.7.10 사전 준비 (2026-10-28 Codex 인수)

| 항목 | 확인·준비 결과 |
|---|---|
| 작업 범위 | 문서 준비와 예약 작업 읽기 점검. 실제 빌드·업로드·Set Live·Steam 게시·steamcmd 로그인·태그 push 미실행 |
| 버전 | 원격 `release-version.json` = 0.7.9(2026-10-28). 다음 예약 실행 때 PATCH +1로 0.7.10. 지금 버전을 올리지 않음 |
| 검토 범위 | 로컬 태그 `v0.7.9` = `d04602919` → 검토 당시 원격 `62b538d0063fbf045d0ed97fca3cac1c2580d198`. 일반 커밋 169개, 출시본 소스·에셋 변경을 선별 |
| 패치노트 | `patch_notes/v0.7.10.md` 한국어·영어 final 사전 작성. 문구 확정이며 출시 완료가 아님. `steam_event_v0.7.10.md` 합본에도 현재 검토분 반영 |
| 게임 내 반영 | 미리 작성한 final 노트는 예약 스크립트가 보존하고 `patch-notes.mjs build`로 생성한다. 준비 커밋이 빌드 기준에 포함되면 v0.7.10 노트가 해당 빌드에 들어갈 예정. 현재 `patch-notes.js`·게임 코드는 보존 |
| 예약 상태 | `EXODUSER_DailySteamRelease` = Enabled=true·Ready, 다음 **2026-10-29 09:00:00 KST**, 최근 2026-10-28 09:16:09, 결과 0, 누락 0 |
| 예약 정의 | `conhost.exe --headless cmd.exe /c G:\exoduser-steam\daily_release.bat`(기존 계정 인수 유지), 제한 PT3H, 중복 IgnoreNew, 매일 간격 1일. InteractiveToken이므로 사용자 로그온 필요. 등록·설정 변경 0 |
| 실행 source | 실제 예약 체인 = G:의 daily_release.bat → daily_release.ps1 → fetch한 origin/main → E:의 steam-build 날짜별 worktree. G: 공유 로컬 main·Codex 작업 브랜치에서 직접 빌드하지 않음 |
| 근거 위치 | `I:\EXODUSER-Storage\codex-takeover\steam\evidence-20261028-2255\예약작업.xml`·`준비근거.json`(조회 시각·일반 커밋 목록·스크립트 해시·변경 전 문서 사본). 최종 SHA·원격 확인은 상위 `REPORT.md` |
| 빌드 뒤 할 일 | 실제 source SHA까지 추가 변경 재대조, BuildID·smoke·preview·upload·push 결과와 1600×900 무창·무음 패치노트 화면 확인. 그 뒤 확정 BuildID 및 합본 최종 게시 사용자 확인 |

주요 문구의 소스 근거는 아래와 같다. 이 표는 코드 차이 대조이며 실제 Player·소리·디자인 검수를 뜻하지 않는다.

| 노트 항목 | main에 포함된 근거 커밋 |
|---|---|
| 2·3장 보스 대사·펫 반응 | `14de6fda3`, `4042e959d` |
| 펫 말투·이야기 정합·보스명 번역 | `2acde58ac`, `7e90f22f6`, `10521fa7f` |
| 대사·배너·로딩 팁 번역 | `db4c64f34`, `511278b65` |
| UI 열기·닫기·취소·실패·분해·탭 소리 | `c0913f138`, `d40568974` |
| 첫 진입 인장·로고(이전 문 배경을 대체한 최종 상태) | `4f6f4ecc9` |
| 메뉴·로비·캐릭터 선택·명조·난이도 카드 | `1e2f79a40`, `3fe35d78b`, `6d63b42e9`, `6350adb2f`, `a0ebc8cc7`, `3531d110b`, `d131d9a67` |
| 튜토리얼·막 전환·승리·장 클리어 표기 | `caceafdc7`, `6f3d94cd0`, `7f45c0101` |
| 드루이드 침강 시 남은 위험물 정리 | `91e5dee2b` |
| 연사·마력석궁 발사음 | `264cffe06` |
| 한국어 말풍선·장 클리어 줄바꿈 | `3b8892fda`, `294d173be` |

기존 인계의 **26258132(v0.7.9)는 Set Live하지 않음**과 **v0.7.0~v0.7.10 합본 방향**을 보존한다. 다음 BuildID는 아직 없으므로 임의로 지정하지 않고 공용 `USER_CONFIRM.md`에 최종 실행 확인만 모은다.

### 10-29 08:49 KST 사전 준비 재확인

| 항목 | 결과 |
|---|---|
| 원격 포함 | `5d0d4d44aba03f618b2139e690fbab466f168a0e` 실조회. 노트·합본·규칙·인계 4개 문서가 기존 준비 커밋과 동일 blob |
| 추가 변경 | 사전 검토 `62b538d0063fbf045d0ed97fca3cac1c2580d198` 이후 비문서 변경 0개. 플레이어 노트 내용 유지 |
| 버전·노트 | 현재 0.7.9 / 다음 0.7.10 / 기존 파서로 한·영 각 12항목·final 확인. 버전·생성물 변경 없음 |
| 예약 작업 | Enabled=true·Ready / 다음 2026-10-29 09:00:00 KST / 최근 10-28 09:16:09·결과 0·누락 0 / 숨김 실행·PT3H·IgnoreNew 유지 |
| 결과 경계 | 10-29 결과 요약 없음·실행 전. 예약 설정·등록·수동 실행·빌드·업로드·steamcmd 로그인·Set Live·Steam 게시·태그 push 모두 미실행 |
| 근거 | `I:\EXODUSER-Storage\codex-takeover\steam\evidence-20261029-preflight\재확인.json`·`예약작업.xml` |

브리프의 사전 준비는 완료다. 빌드 뒤 실제 source SHA·BuildID·검증 결과와 게임 내 노트 화면을 확인하는 후속 절차는 그대로 유지한다. 기존 공용 사용자 확인 항목은 유효하므로 같은 요청을 중복 추가하지 않았다.


## 11. v0.7.11 사전 준비 — 2026-10-31

| 항목 | 결과·남은 조건 |
|---|---|
| 범위 | v0.7.10 `7b80603d8` 이후 `origin/main fd8d727671cd673d99062dd69e69cf398f933952`. 검수 중 추가된 전체 화면 원화 확장도 포함. 선택형 `?r3d=1`·확인 기능·Unity·내부 도구는 플레이어 노트에서 제외 |
| 패치노트 | `patch_notes/v0.7.11.md`, 한·영 각18항목·`status: draft`. 날짜11/01은 다음 예약 예정일이며 출시 이력 아님. 파서 검증 PASS. 원격 버전은0.7.10 유지, 버전·게임 내 생성물·태그 변경 없음. draft는 자동 게임 내 노트 생성에서 제외되므로 문구 확정 후 final 전환과 생성물 반영 필요 |
| 원본 스모크 | `fd8d727671cd673d99062dd69e69cf398f933952` 별도 전체 체크아웃·빈 포트58561·I: 격리 저장에서 1920×1080·3840×1080 각각 첫 화면→로비→캐릭터 생성→1-1 로딩/진입→일시정지→재개→재로딩 PASS. pageerror0·404 0(예외 처리 없이 원시 수집), HTTP/디스크 핵심12파일 SHA256 일치. 브라우저 기본 웹/demo 경로이며 Steam full 패키지·자연 완주·청취 검수는 별도 |
| 출시 차단 결함 | 새 HTML의 `fullscreen-art-data.js`·`fullscreen-art.js`·`fullscreen-art.css`·`fullscreen-art-dom.js`가 현재 `build-nwjs.mjs`의 FILES에서 누락. 원본 파일 존재와 패키지 포함은 별개이며 현 목록으로 패키징하면 해당 참조404가 발생할 것으로 정적 판정. 출시 패키징 담당이 목록·관련 docs를 보완한 뒤 다음 승인 빌드에서 확인해야 함. 이번 문서 준비 범위에서 패키징 코드 수정·실제 빌드는 하지 않음 |
| DEMO·EA | 각 대상 신규366경로 누락·기존37경로 차이. 403경로×2대상 개별 목록은 외부 TSV. 루트 신규11개는 기존 에셋 폴더 복사 외 별도 동기화가 필요. 대상별 빌드 상수·DEMO 별칭 치환은 유지해야 하며 복사0회 |
| 내일09시 | 작업 Enabled·Ready, 다음11/01 09:00. v0.7.11 로컬 태그·11/01 빌드 작업 경로 충돌 없음. 정각 재부팅·로그온 등 §9 조건을 충족해야 하고 현재 패키징 누락도 남아 있어 **출시 준비 완료·정상 성공을 보장하지 않음**. 계정 재인증·예약 실행 재현은 미실행 |
| 사용자 확인 | 실제 다음 BuildID·검수 결과와 노트 문구를 확인한 뒤 Set Live·Steam 패치노트 게시. 새 BuildID를 임의 지정하지 않음 |
| 권한 경계 | 빌드·preview·업로드·Steam 로그인·Set Live·Steam 게시·예약 작업 설정·공용 실행기/잠금 변경0회. 예약 XML 전후 SHA256 동일, 자기 스모크 서버/브라우저 종료 확인. 기존 latest-web·사용자 소스·세이브 보존. 증거: `I:/EXODUSER-Storage/steam-prep/20261031/REPORT.md` |

| 2026-10-31 | v0.7.11 준비 점검에서 새 루트 모듈 6개가 `build-nwjs.mjs` FILES에 빠진 것을 발견(패키지에서 404 예상) | `fullscreen-art-data.js`·`fullscreen-art.js`·`fullscreen-art.css`·`fullscreen-art-dom.js`(전체 화면 원화 확장)·`currency-orb.js`·`currency-orb.css`(악의오브)를 FILES에 추가. 새 루트 파일을 만든 작업은 같은 커밋에서 FILES도 갱신한다 |
