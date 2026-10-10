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
3. **커밋된 HEAD 기준**으로 빌드(다른 세션의 미커밋 작업이 섞이지 않게). 작업 트리를 그대로 빌드하지 않는다.
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
| 게임 내 표시 | 로비 좌상단 버전 오버레이(`#lobbyVerOverlay`, 키보드 Enter/Space 가능) 클릭 → Hell Gothic 패치노트 패널(`#patchNotesPanel`). KO/EN은 해당 언어, 그 외 언어는 EN 폴백. 닫기 버튼·Esc·배경 클릭으로 닫힘 |
| 테스트 | `test/releaseVersion.test.js` — bump/check/노트 파싱/빌드 정렬/커밋 필터 8케이스 |

### 7.3 매일 09:00 자동 파이프라인

| 파일 | 역할 |
|---|---|
| `G:\exoduser-steam\daily_release.ps1` (+`daily_release.bat`) | §4 1~5단계 구현. 신규 커밋 없으면/오늘 이미 릴리스했으면 종료 → bump patch → 패치노트 초안 → **경로지정 커밋**(버전 파일+초안만, `git add -A` 금지) + 로컬 태그 `v<version>` → `git worktree add --detach`로 **커밋된 HEAD export** 후 그 트리에서 빌드(작업 트리 빌드 금지 보장; export 트리는 clean이므로 steam_update의 DEPLOY 프롬프트는 설계상 발화하지 않음) → smoke → preview → upload(`setlive ""`) → `state/daily_release_<날짜>.md` 요약+알림. `-DryRun`은 계획만 출력 |
| `G:\exoduser-steam\steam_update.ps1` | `-SourceRoot`(대체 체크아웃 빌드), `-BuildId`, `-RuntimeDir`(검증 런타임), `-AppVdfPath/-PreviewVdfPath`(desc에 버전을 넣은 런타임 생성 VDF — 커밋된 scripts\*.vdf는 불변) 지원. 기존 안전장치(smoke/preview 게이트·SETLIVE 수동) 유지 |
| 로그인 | steamcmd 캐시 로그인만. `-Account`/`STEAM_BUILD_ACCOUNT` 미지정이면 preview 전에 "로그인 필요"로 중단 |
| VDF desc | 실행 시 `output/daily/app_build_4749590_v<ver>.vdf` 생성 — `"desc" "EXODUSER: HELL LORD v<ver> (<YYYYMMDD>, win x64, full)"` |

**스케줄 등록 (사용자 확인 후 직접 실행 — 자동 등록 금지):**
```
schtasks /Create /TN "EXODUSER_DailySteamRelease" /TR "cmd /c G:\exoduser-steam\daily_release.bat" /SC DAILY /ST 09:00 /F
```

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
