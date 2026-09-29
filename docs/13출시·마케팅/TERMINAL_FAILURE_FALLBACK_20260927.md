# 터미널 시작 실패 시 파일 작업 계속하기

2026-09-27 사용자 지시: 다른 에이전트도 같은 오류로 멈추지 않도록 실제 성공한 대체 경로를 공유한다.

## 확인한 증상과 범위

| 항목 | 확인 결과 |
|---|---|
| 실패 도구 | `exec_command`; 명령 본문 실행 전 프로세스 생성 실패 |
| 오류 | `CreateProcessW`, `OS Error -1073283067`, `FormatMessageW() returned error 317` |
| 지정 설정 | Windows PowerShell 전체 경로, `tty:true`, `login:false` |
| 실제 오류 경로 | `C:\Program Files\WindowsApps\Microsoft.PowerShell_7.6.6.0_x64__8wekyb3d8bbwe\pwsh.exe` |
| 재시도 | 권한 상승 실행도 같은 프로세스 생성 오류. 사용자의 권한 거부와 구분 |
| 성공한 쓰기 | `functions.exec` → `tools.apply_patch` → 작업 디렉터리 파일 생성·수정 |
| 성공한 읽기 | 실행 중인 개발 서버의 정적 파일 GET; 브라우저 CDP `Runtime.evaluate`에서 동일 출처 `fetch` |
| 성공한 런타임 검증 | 기존 게임 탭의 DOM/스크린샷, 보석 분류·선택·장착 확인 |

터미널 복구가 완료된 것은 아니다. 파일 접근 대체 경로가 검증된 것이다. 앱 재시작을 사용자에게 요구하기 전에 독립 도구의 동작을 확인한다.

### 2026-09-28 추가 확인 — 숨김 Windows PowerShell 읽기

맵71차 세션에서 Node REPL의 `child_process.execFileSync`로 시스템 Windows PowerShell을 직접 호출한 읽기 작업은 성공했다. `exec_command`는 같은 시스템 경로를 지정해도 오류에 WindowsApps `pwsh.exe`가 나타나고 시작 전에 OS317로 실패했다. 따라서 PowerShell 전체가 실행 불가능하다는 뜻은 아니다.

| 항목 | 실제 확인 | 경계 |
|---|---|---|
| 호출 경로 | `C:/Windows/System32/WindowsPowerShell/v1.0/powershell.exe`, `-NoProfile`, `-NonInteractive` | Node REPL에서 이미 제공하는 파일/프로세스 도구로 실행 |
| 읽기 결과 | `Get-Location`의 Path가 `G:\exoduser` | 파일·Git 쓰기를 검증한 결과가 아님 |
| 창 설정 | child_process 옵션 `cwd:'G:/exoduser'`, `windowsHide:true`, `encoding:'utf8'` | 이번 호출의 창 숨김 설정이며 모든 앱의 팝업 해결 선언 아님 |
| Git 제한 | `.git` 직접 수정·별도 도구를 이용한 권한 우회 금지 유지 | Git 쓰기는 허용된 실행 경로와 해당 쓰기 권한이 모두 확보된 후 수행 |

이 조회 성공을 터미널 실행기 복구 또는 커밋 성공으로 보고하지 않는다. 맵71차의 실제 Node 회귀 검사·로컬 브라우저 검수는 별도 로그로 남겼다: `captures/ch1_outer71/tests.log`, `live/runtime.json`.

## 실제 사용 절차

### 2026-09-29 우선 절차 — PowerShell 실패로 작업 중단 금지

사용자 확정: PowerShell은 필수가 아니다. 실행 가능한 대안을 확인하기 전에 사용자에게 서버 실행이나 환경 복구를 떠넘기지 않는다.

| 순서 | 실행 경로 | 검증 및 다음 행동 |
|---|---|---|
| 1 | `exec_command`: `shell:'C:\\Windows\\System32\\cmd.exe'`, `tty:false`, `login:false` | `echo shell_probe`로 시작 확인 후 `type`, `rg`, `git` 등 CMD에 맞는 명령으로 계속 작업 |
| 2 | CMD에서 `C:\nvm4w\nodejs\node.exe` 전체 경로 실행 | 파일 처리·테스트·서버 실행에 사용. 깨진 기본 `node` shim 사용 금지 |
| 3 | PowerShell 전용 작업만 Node `spawnSync`/`execFileSync`로 시스템 `powershell.exe` 호출 | 인수 배열, `-NoProfile`, `-NonInteractive`, `-WindowStyle Hidden`, `windowsHide:true` 사용 |
| 4 | 허용된 직접 `apply_patch` 및 실행 중인 로컬 서버 읽기 | 셸과 독립적으로 확인. 현재 도구 문서와 보안 정책이 허용하는 API만 사용 |
| 5 | 실제로 필요한 단계가 모든 허용 경로에서 불가능한 경우 | 오류와 미완료 단계만 구체적으로 보고. 권한 거부 우회 금지 |

2026-09-29 실제 확인: CMD `echo shell_probe`, `git status --short --untracked-files=all`, `type AGENTS.md` 성공. 시스템 PowerShell 5.1 실행과 `MainWindowHandle=0` 확인 후에도 같은 설정에서 WindowsApps `pwsh.exe` 시작 오류가 재발했다. 따라서 영구 복구 완료로 보고하지 않고 CMD 경로로 문서 작업을 계속했다.

로컬 서버 연결 거부만으로 파일 작업 불가를 단정하지 않는다. 필요하면 허용된 실행 경로에서 `server.cjs`를 창 숨김으로 시작하고 `/` 및 `/api/slots` 응답을 확인한다. 시작 시도만으로 서버 기동 성공을 보고하지 않는다. 이 절차는 새 파일 접근 API나 명령 실행 엔드포인트를 만드는 허가가 아니다.

### 셸 대안도 사용할 수 없을 때 — 기존 서버를 통한 작업

아래는 당시 도구에서 검증한 절차다. 현재 도구가 해당 API를 제공하지 않거나 브라우저 정책이 차단하면 사용하지 않는다.

1. `cua.getState()`로 실행 중인 게임 탭을 확인한다. 임의로 다른 사용자의 탭을 선택하지 않는다.
2. `cua.getTab(확인한ID, {browser:확인한브라우저ID})`로 연결하고 반환된 API 문서를 읽는다. 브라우저 런타임의 `agent.browsers.get()`와 `browser.tabs.get()`을 쓸 경우 해당 문서에 명시된 방법만 사용한다.
3. `local-web-development` 문서와 `tab.capabilities.get('cdp').documentation()`을 읽는다. CDP의 원시 명령은 해당 로컬 개발 출처 안에서만 사용한다.
4. `fetch('/game.html')`, `fetch('/AGENTS.md')`, 관련 `docs/` 경로로 디스크의 현재 원본을 읽는다. `document.scripts`는 이미 로드된 사본이므로 최신 디스크 파일과 다를 수 있다.
5. 읽은 원본을 기준으로 작은 문맥 패치를 `tools.apply_patch`로 적용한다. 이 도구는 실패 중인 터미널을 거치지 않아 실제 성공했다. 대규모 수정은 기존 백업 규칙을 따른다.
6. `fetch`에 **`{cache:'no-store'}`**를 지정해 수정한 문자열과 주변 문맥을 검증한다. 이 세션에서 기본 fetch는 수정 전 AGENTS.md를 반환했고, no-store 재조회로 실제 수정 내용을 확인했다. 패치 호출 반환이나 캐시 응답만으로 성공·실패를 단정하지 않는다.
7. 현재 진행을 안전하게 저장한 뒤 필요한 새로고침·런타임 테스트를 한다. 브라우저 메모리에만 임시 적용한 변경은 최종 보고에서 따로 밝힌다.
8. docs를 동기화하고 남은 Git/CLI 검증 항목을 기록한다.

### 파일 수정 예시 — functions.exec

```js
text(await tools.apply_patch(
  '*** Begin Patch\n' +
  '*** Update File: G:/exoduser/파일명\n' +
  '@@\n' +
  '-확인한 기존 내용\n' +
  '+새 내용\n' +
  '*** End Patch'
));
```

### 파일 읽기 예시 — cua_repl

아래 `tab`은 API 문서를 읽고 확보한 브라우저 런타임 탭이다. 이전 세션의 변수나 탭 ID가 유지된다고 가정하지 않는다.

```js
const cdp = await tab.capabilities.get('cdp');
nodeRepl.write(await cdp.send('Runtime.evaluate', {
  expression: 'fetch("/AGENTS.md",{cache:"no-store"}).then(r=>{if(!r.ok)throw Error(r.status);return r.text()})',
  awaitPromise: true,
  returnByValue: true
}));
```

큰 파일은 전체 출력 대신 관련 줄과 주변 문맥만 반환한다. 이 세션에서는 중첩 문자열의 역슬래시가 정규식/개행을 손상시킨 사례가 있어 줄 분리에 `String.fromCharCode(10)`, 고정 문자열 검색에 `includes()`를 사용했다.

## 문서 전체 검색 대체와 한계

| 작업 | 터미널 실패 중 가능한 방법 | 한계 |
|---|---|---|
| 관련 docs 읽기 | 이미 확인한 문서 경로를 정적 GET | 경로 추측 반복 대신 참조 링크·파일 목록 활용 |
| 추적 문서 목록 | 이 개발 서버가 제공하는 `/.git/index`를 읽기 전용으로 파싱 | 이 세션 index 버전은 2. 버전 3 확장 플래그나 버전 4 압축 경로를 버전 2처럼 처리하지 않는다 |
| 문서 내용 검색 | 위 목록의 Markdown을 GET하여 키워드 검색 | 실제 `grep` 실행이 아니다. 미추적 파일은 index에 없으므로 전체 작업 트리를 검색했다고 말하지 않는다 |
| Git 상태·커밋 | 정상 터미널/승인된 Git 실행 경로 확보 후 수행 | index 조회로 `git status`나 커밋을 대체할 수 없다. `.git` 직접 수정 금지 |
| 테스트 | 실제 디스크 소스의 브라우저 구문 검사·격리 테스트·UI 검증 | Node 테스트/전체 빌드를 실행했다고 보고하지 않는다 |

보석 저장 조사 때 추적 Markdown **439개**를 읽고 `crystalBag`, `보석함`, `hellsave_demo`, `_startDemoNew`를 검색했다. 미추적 문서까지 포함한 `grep -r` 결과는 아니므로 터미널 복구 후 전체 검색을 보완한다.

## 금지·주의

- 권한 또는 자동 승인 거절을 이 방식으로 우회하지 않는다. 이번 장애는 프로세스 시작 실패였고 직접 패치 작업은 허용된 `G:/exoduser` 안에서 수행했다.
- 기존 서버만 이용한다. 파일 접근용 서버 API·명령 실행 엔드포인트를 새로 만들거나 서버를 외부에 노출하지 않는다.
- `.env`, 인증 파일, 토큰을 읽거나 출력하지 않는다. 서버 소스의 환경 변수 이름 확인은 비밀 값 조회와 다르다.
- `python http.server`, 사용자 터미널 강제 종료, 자동 정리 예약 작업 재등록을 하지 않는다.
- 직접 패치로 게임 코드를 고쳤으면 관련 문서까지 함께 수정한다. 미완료 Git 작업을 숨기지 않는다.
- UI 메모리에서 보석을 넣은 것과 파일 저장 수정은 다르다. 디스크 코드, 저장 데이터, 복원 결과를 각각 확인한다.
