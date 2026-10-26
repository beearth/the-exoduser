# NW.js 로컬 서버 포트 바인딩 수정 (2026-10-26)

Steam판(NW.js) 실행 창이 **자기 로컬 서버가 아닌 다른 프로그램의 서버 페이지**를 열거나, 포트가 막혔을 때 아무 안내 없이 깨지던 결함을 고쳤다. 사용자 지시: "node-main.js 포트 바인딩 버그 고쳐줘. 커밋까지 하고, 다음 9시 배포 빌드에 들어가게."

## 1. 원인

| # | 결함 | 근거 |
|---|---|---|
| 1 | `node-main.js`는 `127.0.0.1:<port>`에만 listen하는데 창(`package.json` main)은 `http://localhost:<port>`를 연다. Chromium은 `localhost`를 **::1부터** 시도하므로 `[::]`(IPv6 듀얼스택)에 떠 있는 다른 서버가 응답한다 | 2026-10-26 재현: 같은 포트에 `[::]` 서버 + `127.0.0.1` 서버 → Chromium `localhost` = `[::]` 쪽, `127.0.0.1` = 우리 쪽 |
| 2 | 개발 PC에서는 `server.cjs`(개발 서버)가 `0.0.0.0`+`[::]`:3333에 상시 떠 있다. 라이브 Steam 빌드 25482996(포트 3333)을 켜면 **개발 작업트리 game.html**이 열렸다 | `netstat`: `node server.cjs` `[::]:3333` LISTEN. 메모리 `steam-build-port-3333-conflict`(반대 방향 증상) |
| 3 | `listen()`에 오류 처리가 없어 포트 점유(`EADDRINUSE`)·Windows 예약 포트(`EACCES`)면 서버 없이 창만 뜬다 → 연결 실패 화면이나 남의 페이지 | 수정 전 `node-main.js` 마지막 줄 `.listen(PORT,'127.0.0.1',cb)` 단독 |
| 4 | 남의 서버 페이지가 `node-remote` 출처(`http://localhost:<port>`)로 열리면 그 페이지가 **Node 권한**(`require`)을 얻는다 | `package.json` `node-remote` = 해당 출처 |
| 5 | 서버 listen 완료 전에 창이 URL을 열 수 있는 경합 | node-main은 창 로드 전에 실행되지만 listen은 비동기 |

## 2. 수정 내용

| 파일 | 변경 |
|---|---|
| `node-main.js` | 요청 처리기를 `handleRequest`로 분리. 후보 포트마다 **`127.0.0.1`과 `::1`을 모두 listen**(`bindLoopback`). IPv6가 없는 PC(`EADDRNOTAVAIL`/`EAFNOSUPPORT`)는 127.0.0.1만. 한쪽이라도 막히면 그 포트를 버리고 다음 후보로. 결과를 `global.__exoduserServer = {status:'pending'\|'ready'\|'failed', port, tried[]}`에 기록, 모든 시도는 `oauth-debug.log`에 남김 |
| `nw-boot.html` (신규) | NW 창의 시작 페이지(패키지 내부, 네트워크 없음). `nw.global.__exoduserServer`를 30ms 간격으로 확인해 `ready`면 `http://localhost:<실제 포트>/index.html` + 기존 쿼리(`?demo=1`)로 `location.replace`. `failed` 또는 20초 초과 시 안내 패널 + 게임 종료 버튼(Esc/Enter도 종료). 29개 언어 문구 내장(`navigator.language`) |
| `tools/release-target.mjs` | `createReleaseConfig`에 `fallbackPorts` 추가. `releaseEntrypoint()` = `nw-boot.html`(demo는 `?demo=1`). `runtimeManifest`의 `node-remote`에 기본+fallback 전 포트 × `127.0.0.1`/`localhost`. 검증기는 배열 키를 JSON 비교, entrypoint를 `nw-boot.html`로 검사 |
| `build-nwjs.mjs` | 필수 복사 목록에 `nw-boot.html` 추가(없으면 빌드 실패) |
| `package.json` (루트, 소스 직접 NW 실행용) | `main` = `nw-boot.html`, `exoduser.fallbackPorts`, `node-remote` 5개 포트 |
| `test/releaseTarget.test.js` | 기존 `new URL(pkg.main)`을 상대 경로 대응으로 수정. 신규 테스트: 시작 페이지·demo 쿼리·전 포트 node-remote·full/demo 포트 비중복·3333/3334(개발) 비충돌·빌드 목록 포함 |

### 포트 표

| target | 기본 | fallback (순서대로) | 저장 namespace | 프로필 |
|---|---|---|---|---|
| full (App 4749590) | 3350 | 3360 → 3370 → 3380 → 3390 | `EXODUSER-HELL-FULL` | `./userdata-full` |
| demo (App 5337590) | 3351 | 3361 → 3371 → 3381 → 3391 | `EXODUSER-HELL-DEMO` | `./userdata-demo` |
| 개발 `server.cjs` | 3333 | — | — | — |

- fallback 포트로 열리면 출처(origin)가 달라져 **localStorage(설정 등)는 기본 포트와 따로** 저장된다. 캐릭터 세이브는 APPDATA 서버 저장이라 그대로다. 드문 예외 경로라 허용한다.
- OAuth `redirectTo`는 `window.location.origin` 기준이다. fallback 포트에서는 Supabase 허용 목록에 그 출처가 없으면 로그인만 실패할 수 있다(오프라인 플레이·저장은 무관). 필요 시 Supabase Redirect URL에 3360~3390 추가 — **미조치**.
- 시작 페이지는 `chrome-extension://` 출처라 다른 프로그램의 서버 페이지를 열지 않는다 → 결함 4 차단.

### 실패 안내 문구 (번역대상 전체목록 No.3338~3340)

| No. | KO | EN |
|---|---|---|
| 3338 | 게임을 시작할 수 없습니다 | Unable to start the game |
| 3339 | 게임의 로컬 서버가 포트를 열지 못했습니다. 다른 프로그램이 사용 중일 수 있습니다. 그 프로그램을 종료한 뒤 게임을 다시 실행하세요. | The game's local server could not open a port. Another program may be using it. Close that program and launch the game again. |
| 3340 | 게임 종료 | Quit Game (기존 lang_*.js `'게임 종료'` 번역 재사용) |

나머지 27개 언어 번역은 `nw-boot.html` `MSG` 표에 직접 넣었다(서버 없이 표시돼야 하므로 lang_*.js를 쓰지 않음). 원어민 감수는 아니다. 하단 `PORT 3350 · 3360 …`은 시도한 포트 번호만 표기한다(오류 코드는 로그).

## 3. 검증 (2026-10-26, PC)

| 항목 | 결과 |
|---|---|
| 단위 테스트 `node --preserve-symlinks --preserve-symlinks-main --test test/releaseTarget.test.js` | 6/6 PASS (`test/`가 I: 보관소 링크라 symlink 보존 옵션 필요) |
| 실제 NW.js 0.111.2 (`cache/nwjs-v0.111.2-win-x64`, 창 숨김) S1 충돌 없음 | `localhost:3350`, 우리 서버, `nw.App` 사용 가능, `/api/slots` OK |
| S2 다른 서버가 `[::]:3350` 듀얼스택 점유(개발 서버와 같은 형태) | 3350에 127.0.0.1+::1 바인딩 성공, **우리 서버가 응답** (수정 전: 남의 서버) |
| S3 `127.0.0.1:3350` 점유 | 3360으로 fallback, 우리 서버, nw API OK |
| S4 `::1:3350` 점유 | 3360으로 fallback, 우리 서버, nw API OK |
| S5 후보 5개 전부 점유 | `failed` 기록, 남의 페이지로 이동하지 않음 |
| 안내 화면 (Playwright, `nw` 모의) ko 1600×900 / en 1920×1080 / ar(RTL) / de | 스크린샷 직접 확인: 흑철 패널·금빛 헤어라인·뼈색 문자, 한국어 어절 줄바꿈, RTL 포트 표기 정상, Esc로 종료 호출, pageerror 0. `ready` 경로는 `?demo=1` 유지하며 실제 포트로 이동 |
| 일반 node 실행(steam_smoke 방식) | `localhost`·`[::1]`·`127.0.0.1` 모두 응답 |

**미검증:** 실제 Steam 설치본에서의 확인(다음 빌드가 Set Live된 뒤 가능), S5 안내 화면을 실제 NW 창에서 눈으로 확인(숨김 창이라 DOM 경로만 확인), 플레이어 PC의 Hyper-V 예약 포트(EACCES) 실측.

## 4. 배포 반영

- 다음 날 09:00에 `daily_release.ps1`(`G:\exoduser-steam`)이 커밋된 main HEAD를 export해 빌드한다. 이 커밋이 "마지막 릴리스 이후 커밋"으로 잡히므로 그날 빌드가 생성된다.
- **현재 라이브 default = 25482996(9/24, 포트 3333·데모 모드)**. 10/10~10/22에 올린 BuildID 7개(25842101~26120761)는 Set Live되지 않았다. 이번 수정도 사용자가 새 BuildID를 Steamworks에서 Set Live해야 플레이어에게 반영된다.
