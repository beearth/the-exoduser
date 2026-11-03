# Steam 기본 브랜치 Unity 전환 준비 — 2026-11-03

스팀 총괄 작성. CTO 지시(11-03 20:15·20:30): 기본 브랜치를 Unity로 바꾸기 전에 지난 심사 반려 항목을 정리하고, 옛 베타 브랜치 정리 클릭 목록을 준비한다. 업로드·Set Live·기본 브랜치 전환·게시는 사용자 확인 뒤에 한다. Steamworks 설정 변경 클릭은 Claude 세션의 자동 안전 검사(운영 배포 분류)가 막으므로 사용자가 누른다.

## 1. 현재 Steam 상태 (11-03 20:40, Steamworks 빌드 화면 직접 확인)

| 브랜치 | BuildID | 내용 | 비고 |
|---|---|---|---|
| default | **25482996** (09-23) | 웹판 "29-language completion" | 이전 기록의 25202408은 틀림. `G:\exoduser-steam\state\default_buildid.txt`를 25482996으로 정정(사본 `.bak_20261103`) |
| review-20260916 | 25482996 | 09월 심사용 베타(비밀번호) | 정리 대상 — 3절 |
| unity-beta | **26401646** (11-03 18:13) | Unity unity/main `b8214e5`, "1-1 natural clear verified" | 비밀번호 보호. 업로드 시 setlive로 자동 배정 |

실행 옵션(설치 → 일반, 11-03 사용자 입력·저장, 게시 대기):

| 옵션 | 실행 파일 | 인수 | OS/CPU | 베타 브랜치 | 설명 |
|---|---|---|---|---|---|
| 0 | `EXODUSER.exe` | — | Windows / 64비트 | — | — |
| 1 | `EXODUSER-Unity.exe` | `-force-d3d11 --remodel3d` | Windows / 64비트 | `unity-beta` | Play Unity Beta |

옵션 0은 베타 키가 없어 unity-beta에서도 보인다. unity-beta 사용자는 실행 때 두 옵션 중 고르는 창을 보고, Unity 빌드에는 `EXODUSER.exe`가 없으므로 옵션 1을 골라야 한다. 기본 브랜치를 Unity로 바꿀 때는 옵션 0의 실행 파일을 `EXODUSER-Unity.exe`로 바꾸고 옵션 1을 지운다(4절).

## 2. 지난 심사 반려 항목 대조 (반려 BuildID 25482996, 2026-09-26 Valve 통보)

근거: `STEAM_REVIEW_20260926.md`, `STEAM_FULL_REVIEW_NOTES_DRAFT_20261002.md`. Unity 확인 기준 = origin/unity/main `b3cf7a682`(소스), 업로드 빌드 = `b8214e5`.

| # | 반려 사유 | 09월 조치 | Unity 빌드 상태 | 판정 |
|---|---|---|---|---|
| 1 | 언어 지역 표시 — 게임 내 단일 스페인어·포르투갈어에 상점은 2종씩 선언 | 상점을 `Spanish - Spain`·`Portuguese - Brazil`만 남겨 29개로 정리(게시 완료) | `Core/LobbyLanguage.cs` 29개 코드·이름이 상점 29개와 같음: `Español (España)`, `Português (Brasil)` 표기 | **소스 일치.** 실제 Unity 빌드에서 29개 전환·저장과 번역 누락(한국어 잔존) 화면 검수는 미실시 → 전환 전 검수 필요 |
| 2 | 데모 빌드 — 본편 앱(4749590)에 데모 문구·1-1 뒤 종료가 있는 빌드 제출 | 데모는 별도 앱 5337590(체험판)으로 분리. 본편은 full target | `BuildFlavor.cs` 기본값 full, 데모 입장 문구는 미이식 목록(`NotPorted`)이라 "Welcome to the Demo" 류 문구 없음 | **문구는 OK, 분량이 위험.** Unity판 플레이 범위가 1-1뿐이면 본편 앱 기본 브랜치에서 다시 "데모 빌드"로 반려될 수 있다. 기본 브랜치 전환은 본편 진행 범위가 갖춰진 뒤로 하거나, 1-1 한 판 빌드는 체험판 앱 5337590 쪽 후보로 검토(사용자 결정) |
| 3 | 게임 내 구매 — 콘텐츠 설문에 체크됐으나 해당 기능 없음 | 설문 `In-game purchases` 해제, 설문 829793 게시 | Unity 소스에 Steamworks·실결제 코드 없음(유료 대장간 강화 등은 게임 내 재화) | **OK.** 설문은 그대로 두면 됨. 실결제를 넣게 되면 설문부터 다시 |

전환 전 남은 일: (a) Unity 빌드 29개 언어 화면 검수, (b) 본편 기본 브랜치에 올릴 플레이 범위 결정(2번), (c) 심사 Notes 영문 초안 갱신 — 아래 문단을 기반으로.

> Draft (for the next build review): This build replaces the previous NW.js client with a Unity Windows x64 client for EXODUSER: HELL LORD (AppID 4749590). It is the full-game target; demo wording and the 1-1 demo ending are not present, and the separate demo is AppID 5337590. Supported languages are the same 29 regional variants declared on the store (Spanish - Spain, Portuguese - Brazil). There are no in-game purchases.

## 3. 옛 베타 브랜치 정리 (사용자 클릭 목록)

사용자 지시: "기존 베타는 정리해야지". 대상 = `review-20260916`(09월 심사용, 25482996).

1. Steamworks → 앱 4749590 → SteamPipe → **빌드** 화면
2. 위쪽 "사용 가능한 앱 브랜치" 표에서 `review-20260916` 줄 오른쪽 **비활성화**
3. 확인 창이 뜨면 확인. 빌드 자체는 삭제되지 않고 브랜치만 사용할 수 없게 된다
4. 이 작업은 앱 설정 게시가 필요할 수 있으므로, 화면 위 빨간 "게시되지 않은 변경 사항" 줄이 생기면 게시 탭 → 게시 준비 → Steam에 게시

`unity-beta` 줄의 비활성화는 누르지 않는다.

## 4. 기본 브랜치를 Unity로 바꾸는 순서 (사용자 확인 뒤)

1. 2절 남은 일 (a)(b)(c) 정리
2. 바탕화면 빌드 기준 새 Unity 빌드(현재 후보 `9f0d00cf8`)를 unity-beta에 업로드(사용자 확인 뒤) → 설치·실행 확인
3. 빌드 화면에서 그 BuildID를 default로 Set Live
4. 설치 → 일반: 옵션 0 실행 파일 `EXODUSER-Unity.exe`, 인수 `-force-d3d11 --remodel3d`로 바꾸고 옵션 1 삭제 → 게시
5. Steam 이벤트 패치노트 게시, `STEAM_UPDATE_RULES.md` §6 기록
