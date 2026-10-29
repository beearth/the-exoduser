## 2026-10-27 Mac 표시 릴리스 메타 동기화

현재 Mac `Resources/Data/release_web.json`은 원격 main `607110d52a56a1e5622a78e2ce7d09582946920a`의 `release-version.json` **동일 bytes**다(원본 blob `528ad945f68c8740a8f8fe77fa33518d18db296e`, SHA256 `21639192625b3db96c95db067d943d173cff6e297226ff9724e3022f0cb549da`). 현행 표시 `v0.7.5 · 20261020`; 아래 초기 PC 추출의 0.7.7 WIP 스냅샷 기록은 이 후속으로 교체됐다. [인수 근거와 범위](UNITY_MAC_RELEASE_METADATA_20261027.md).

# Unity 빌드 종류 정의 BuildFlavor (분모 A26, 웹 데모/BIC/EA 분기) — PC-A26 (2026-10-26)

기준: 사용자 확정 "UI는 일단 그대로 이식". 웹 기준 `G:/exoduser/game.html`·`index.html`(main 1770c2698), 빌드 정의 `build-nwjs.mjs`·`tools/release-target.mjs`·`CLAUDE.md` "DEMO/EA 동기화". 구현: 단순작업2. 작업 위치 `E:/exoduser-wt/pc-unity-win`(`6c8ed9d91` 위, Unity 6000.6.7f1). 커밋은 맥북 총괄 검수 뒤.

## 1. 웹 근거

| 요소 | 코드 | 동작·값 | Unity |
|---|---|---|---|
| 빌드 대상 | `build-target.js` → `window.EXODUSER_BUILD_TARGET`(기본 `'demo'`, NW 패키지는 manifest `exoduser.target`) | full / demo 두 가지만 패키징(`createReleaseConfig`가 full\|demo만 허용). ea는 로비 라벨 값으로만 존재 | `BuildFlavor.Kind` full / demo / bic / ea |
| `_DEMO_MODE` | game.html 16648 `(EXODUSER_BUILD_TARGET||'demo')==='demo'` | 데모 분기 전체 스위치 | `BuildFlavor.DemoMode` |
| `_BIC` | game.html 16647 `location.search.includes('bic')` | **정의만 있고 읽는 곳이 없다**(주석에만 남음). CLAUDE.md의 BIC 규칙(데모, Lv100)은 데모 정의와 같다 | bic = demo 정의 복사 + 패키징 안 됨 표시 |
| 레벨 캡 | `_DEMO_LV_CAP=100`(16649), `addExp`(43139·43150): 데모에서 레벨 ≥100이면 경험치 고정 | 100 | `LevelCap` 정의만(시스템 없음 → **미이식**) |
| 데모 마지막 스테이지 | `_DEMO_LAST_STAGE=0`(16650) | stage 0 구역 클리어 뒤 데모 종료 | `DemoEndAtStage(0)` |
| 클리어 문구 | 42003-42006: `_DEMO_MODE && stage===0` → 부제 "썩은 숲을 정복했습니다."(영 "You conquered the Rotten Forest."), 버튼 `_T('데모 종료')`. 버튼 동작 63665: 난이도 팝업 없이 `nextStage()` | 데모만 | A22 클리어 패널이 `BuildFlavor`를 읽어 DemoEnd 문구로 전환(트리거는 여전히 미연결) |
| 어픽스 금지 | `_DEMO_AFFIX_BANNED` 7종(16652, 사용 15137) | 데모 아이템 굴림에서 제외 | 정의 JSON만(**미이식**: Unity에 아이템 굴림 없음) |
| 합성 허용 | `_DEMO_FUSE_ALLOWED` 22종(16651, 사용 44612) | 데모는 목록 밖 합성 불가 | 정의 JSON만(**미이식**) |
| 로비 복귀·시작 | 63683 `/?lobby=1&demo=1`, 63886-63892 데모 시작(`_startDemoNew`/`_startDemoTest`) | 데모만 | 정의에 entry 문자열로만 기록(미이식) |
| 로비 라벨 | index.html 1262-1275 `_LOBBY_BUILD`, `_LOBBY_VER_LABEL` {full:OFFICIAL, ea:EARLY ACCESS, demo:DEMO}, `_LOBBY_VER_LIMITS` {full:`All Chapters · No Level Cap`, ea:`Lv.500 · Chapter 1 (1-1~1-4) · 8~15h`, demo:`Lv.1 START · Stage 1-1 Only · Lv.100 Cap · 1~2h`}, `_LOBBY_VER`=`v{version} · {date 하이픈 제거}` | 좌상단 `#lobbyVerOverlay`(789, 2885-2890, 3737-3743) 4줄 + 우하단 `#lobbyVersionTxt`(837, 3735) | `NativeLobbyBuildLabels`(아래) |
| 로그인 제목 | 2186, 2832: 데모 "데모버전에 오신 것을 환영합니다"/"Welcome to the Demo", 그 밖 "계정으로 입장하세요"/"Sign in to enter" | 데모는 Google/오프라인 버튼 숨기고 데모 입장 버튼 | 정의만(Unity 로비에 로그인 없음 → **미이식**) |
| 패키지 식별자 | `release-target.mjs`: full appId 4749590·depot 4749591·port 3350·`EXODUSER-HELL-FULL`, demo appId 5337590·depot 5337591·port 3351·`EXODUSER-HELL-DEMO`·entry `nw-boot.html?demo=1` | ea는 없음("EA 패키지 식별자 미정") | 정의 JSON `release` |

웹 캡처(정식 빌드 3종, Playwright, build-target.js 응답 가로채기, 포트 3426, 끝난 뒤 서버 종료): `E:/exoduser-wt/_out/pc-a26/web/lobby_{full,demo,ea}.png`, 라벨 DOM 덤프 `lobby_*_overlay.json`·`lobby_*_corner.json`, 문구 `lobby_info*.json`. 좌상단 라벨은 Noto Sans KR 12px·자간 1.8px·줄 19.2px·색 `rgba(160,130,90,.5)`(제한 줄 `rgba(200,120,80,.5)`), 우하단 라벨 10.24px·자간 2.867px·`rgba(125,100,70,.32)`.

### CLAUDE.md "DEMO/EA 동기화"와 현행 코드의 차이 (기록만, 웹 쪽 파일은 수정하지 않음)

- CLAUDE.md는 `sed`로 `_BIC=true`, `_DEMO_MODE=true`, `_DEMO_LV_CAP=100`, `_LOBBY_BUILD='demo'|'ea'|'full'`를 DEMO/EA 폴더 파일에 박아 넣는 절차를 적는다. **현행 game.html/index.html에는 그 문자열이 없다**(`const _BIC=location.search.includes('bic')`는 있으나 `_BIC=true` 대체 대상이 아니고, `_DEMO_MODE`·`_LOBBY_BUILD`는 `build-target.js`의 `EXODUSER_BUILD_TARGET`을 읽는다). 즉 해당 sed는 지금 아무것도 바꾸지 못한다.
- `build-nwjs.mjs --target=full|demo`만 있고 ea 대상은 없다.
- CLAUDE.md의 "`?bic` → BIC 부스 데모(Lv100), `?demo` → 일반 데모(Lv500)"는 현행 코드와 다르다: 데모 캡은 100 하나, `_BIC`는 읽는 곳이 없다.

## 2. 정의와 상태

| 구분 | 값 | 출처 |
|---|---|---|
| 정의(웹) | 4종 플레이버 행(라벨·제한·로그인 제목·데모 종료 문구·레벨 캡·패키지 식별자·메모), 데모 목록 2개, 로비 라벨 치수 | `Resources/Data/buildflavor_web.json`(줄 번호 기록) |
| 선택 값 | 실행 인자 `--unity-build-flavor <full\|demo\|bic\|ea>` > 임베드 `Resources/Data/build_flavor.json`의 `selected`(저장소에는 `full`로 커밋) > 기본 `full` | `BuildFlavor.Current` |
| 릴리스 버전 | `Resources/Data/release_web.json` = `release-version.json` 스냅샷(`0.7.5`, `2026-10-20`). 매일 릴리스 갱신은 빌드 스크립트 몫이며 Unity는 읽기만 한다 | 스냅샷 |
| 모드 줄 | "OFFLINE" 고정(Unity 로비에 온라인 계정 모드 없음) | Unity 상태 |
| 미이식 | 레벨 캡 100(가짜 제한 금지: 화면·동작에 쓰지 않음), 데모 어픽스 금지 7종, 데모 합성 허용 22종, 로그인·데모 입장 버튼, 데모 시작 경로, EA 패키지 식별자 | `BuildFlavor.NotPorted` |

## 3. 파일

| 구분 | 경로 |
|---|---|
| 신규 | `unity/Assets/Exoduser/Runtime/BuildFlavor.cs`, `NativeLobbyBuildLabels.cs`, `NativeBuildFlavor.Capture.cs` |
| 신규 | `Resources/Data/buildflavor_web.json`, `release_web.json`, `build_flavor.json`(+.meta) |
| 수정(내 파일, A22) | `Runtime/NativeStageClearOverlay.cs`: `Input.stageIndex`, `Show`에서 flavor가 DemoEnd로 전환, 부제·버튼을 `BuildFlavor`에서 읽음, `ShownKind`(검증용) |
| 신규 patch(번호 없는 이름, 1~13 적용 상태에서 `--check`만 통과) | `docs/engine/unity_patches/A26_nativelobby_buildlabels.patch`, `A26_portverification_flavor.patch` |
| 기존 파일 수정 | 없음(Codex 소유 파일은 patch로만) |

## 4. 공개 API

```
BuildFlavor.Current  // Kind Id; Name; Label; Limits; LoginHeading(english); DemoMode; LevelCap(0=없음, 정의만); AffixBanned; FuseAllowed;
                     // Packaged; AppId; DepotId; Port; SaveNamespace; Entry; DemoEndAtStage(int); DemoEndSub(english); DemoEndButton(english)
BuildFlavor.VersionLine  // "v0.7.5 · 20261020"
BuildFlavor.ResolveName(out source) / SelectedSource / Override(kind) / ResetOverride()   // 마지막 둘은 검증용
BuildFlavor.NotPorted   // 정의만 있고 시스템이 없는 항목
NativeLobbyBuildLabels.Draw(float quitButtonCenterY, bool offline=true)   // 1920x1080 설계 좌표
```

## 5. patch

| patch | 내용 | 확인 |
|---|---|---|
| `A26_nativelobby_buildlabels.patch` (NativeLobby.cs 1 hunk) | `DrawPower(...)` 줄 뒤에 `NativeLobbyBuildLabels.Draw(913f);` — 웹 `#lobbyVerOverlay`·`#lobbyVersionTxt` | 1~13 적용 상태 `--check` 통과 |
| `A26_portverification_flavor.patch` (PortVerification.cs 3 hunk) | `-flavor <full\|demo\|bic\|ea>` 인자: 빌드 전에 `build_flavor.json`에 선택 기록, **`finally`에서 원래 내용으로 복원**(빌드 실패·예외 포함). 잘못된 이름이면 쓰기 전에 예외 | 1~13 적용 상태 `--check` 통과 |

## 6. 검증 (Unity 6000.6.7f1, Win64)

| 항목 | 결과 |
|---|---|
| patch 15개(1~13 + A26 2개) 순서 apply | 전부 통과, 역순 `-R` 15개 통과, `NativeGame*`·`NativePauseMenu*`·`NativeLobby.cs`·`PortVerification.cs` 변경 0 |
| Win64 빌드(`-flavor` 없음) | errors 0, error CS 0, warning CS 0 (처음 빌드에서 `JsonUtility`가 JSON `null` 객체를 기본 객체로 만들어 full/ea가 데모 종료로 판정되는 결함을 캡처 검사가 잡아 `HasClearFinal`로 수정, 재빌드 1회) |
| `--unity-overlay-capture flavor`를 `--unity-build-flavor full\|demo\|ea\|bic` 각각 | 4회 모두 종료 0, passed, failures 0. 클리어 패널: full·ea = Zone("정비 후 다음으로 이동하세요" / "다음 구역으로 ▶"), demo·bic = DemoEnd("썩은 숲을 정복했습니다." / "데모 종료"). stage 1은 모든 플레이버에서 Zone |
| 인자 없는 실행 | 임베드 `build_flavor.json`(`full`)에서 선택, passed |
| `-flavor demo`로 빌드한 플레이어 | errors 0, 로그 `UNITY_BUILD_FLAVOR demo`, 인자 없이 실행하면 `demo`("embedded Data/build_flavor.json"), 빌드 뒤 `build_flavor.json`은 `{"selected": "full"}`로 **복원됨**(저장소 상태 유지) |
| `-flavor nonsense` | 빌드는 receipt 없이 종료 코드 2로 실패, 쓰기 전에 예외라 `build_flavor.json`은 `{"selected": "full"}` 그대로. (쓰기 뒤 빌드 실패 경로는 `try/finally` 구조로 복원, 이 경로를 일부러 깨 보지는 않음) |
| 회귀(1회) | inventory-oracle 892 checks / 0 failures, inventory-navigation 35/35 |

비교 이미지 `E:/exoduser-wt/_out/pc-a26/cmp/`: 로비 좌상단 `lobby_overlay_{full,demo,ea,bic}_3x.jpg`·우하단 `lobby_corner_*_3x.jpg`(위 웹 / 아래 Unity), 클리어 `clear_full_vs_demo.jpg`(Unity full | demo), `clear_full_web_vs_unity.jpg`·`clear_demo_web_vs_unity.jpg`(왼쪽 웹 / 오른쪽 Unity). Unity 캡처 원본·receipt `caps_{full,demo,ea,bic,noarg,demobuild_noarg}/`.

## 7. 남은 차이

- 로비 캡처는 로비 패널 색 단색 위에 라벨만 그린다(웹은 로비 아트 위). 웹 라벨이 더 밝게 보이는 것은 배경 차이이며 색 값은 같다. 웹 종료 버튼 y(909)과 Unity(895)의 세로 위치 차이는 기존 Unity 로비 레이아웃 차이로, 우하단 라벨은 Unity 버튼 중심(913)에 맞춘다.
- 데모 종료 버튼의 영어 문구는 웹 `_T('데모 종료')` 영어 값을 아직 추출하지 못해 한국어만 쓴다(`button[1]=null`).
- 레벨 캡·어픽스 금지·합성 허용·로그인/데모 입장·데모 시작 경로는 정의만 있고 동작은 미이식. 화면에도 제한을 흉내 내지 않는다.
- 클리어 오버레이는 여전히 `Show` 호출이 없다(스테이지 클리어 이벤트 없음, A22 기록 그대로). flavor 전환은 호출 시점에 일어난다.
- `release_web.json`은 스냅샷이다(웹은 `release-version.js`에서 읽음). 갱신 절차는 빌드 스크립트 쪽 과제.
- BIC는 패키징·진입 경로가 없고 데모 정의의 별칭이다.

## 8. 누적 순서 (맥북 총괄, 2026-10-26)

- 인수 순서대로 번호를 정한다: **14 `A26_nativelobby_buildlabels`(NativeLobby.cs) → 15 `A26_portverification_flavor`(Editor/PortVerification.cs)**. 진행 중인 A16 키 바인딩 patch(NativePauseMenu·NativeGame)는 그 뒤 16·17이 된다. 세 단위가 고치는 파일이 겹치지 않아 순서를 바꿔도 적용 결과는 같다.
- 웹 쪽 발견(`_BIC` 읽는 곳 없음, CLAUDE.md의 DEMO/EA sed 절차가 현행 `build-target.js` 방식과 달라 치환 대상이 없음)은 Unity 이식 범위 밖이라 웹 파일·CLAUDE.md는 고치지 않았다. 처리 여부는 전체총괄/사용자 판단.

2026-10-29 후속 정정: 위 표의 좌상단 갈색 `rgba(160,130,90,.5)`·제한 줄 `rgba(200,120,80,.5)`는 당시 웹 캡처의 역사값이다. 최신 `main:77e92a44`의 `index.html#lobbyVerOverlay`는 각각 `rgba(131,134,134,.5)`·`rgba(132,135,135,.5)`이며 Mac Unity `buildflavor_web.json`의 두 배열을 그 값으로 동기화했다. 폰트 12px·자간1.8px·행간19.2px 및 우하단 라벨은 그대로다.

2026-10-29 최신 표시 상태 정정: 웹 `main:adb287e698738606d12d4a810796efb9493ce7c4`의 인라인 alpha는 위 `.5`로 남아 있지만 승인된 `lobby-silver-hell.css`가 좌상단 `#lobbyVerOverlay`를 `display:none!important`로 숨긴다. 따라서 위 표의 4줄은 현재 웹 출시 로비에서 표시되지 않는다. Mac은 별도 `.9` 후보를 표시하므로 현재 시각 계약이 다르다. [실제 화면·패치 노트 경로 판정](UNITY_LOBBY_20261024.md#2026-10-29-패치-노트-진입-계약-후속-확인).

2026-10-29 Mac 후속 대비 후보: 위 `.5` 동기화는 당시 상태다. Mac 실제 1280/1600 1x 판독을 위해 `buildflavor_web.json`의 일반·제한 alpha만 `.9`로 높였다. 현재 웹 `main:7e0113fe4`는 `.5`이므로 색상 완전 동등은 **미완료**다. 정확한 웹 동기화 대상과 실창 판정은 [로비 문서](UNITY_LOBBY_20261024.md#2026-10-29-좌상단-메타-대비-후보--mac-범위)를 따른다.
