# Steam 체험판 앱(5337590) Unity 전환 — 2026-11-03

## 2026-11-04 소스 대조 — Unity 버전

Unity 데모 v0의 제품 버전은 **0.1.0**(`ProjectSettings.asset: bundleVersion`, 3eab55186/병합1fe5c4366)이다. 타이틀·로비는 `Application.version`을 조회하며 체험판 제목은 DEMO · v0.1.0으로 표시한다. 웹 `release_web.json`의 버전과 별도이고, 로비 날짜는 해당 스냅샷에서 읽는다. 이 기록은 상점 게시·Steam 업로드·설치 실행본 확인이 아니다. [빌드 종류 현행 계약](../engine/UNITY_A26_BUILDFLAVOR_20261026.md#2026-11-04-표시-버전-정정--unity-데모-v0).


스팀 총괄 작성. 사용자 결정(11-03 20:5x, CTO 전달): **"체험판 앱에"** — Unity 1-1 빌드를 체험판 앱 5337590에 먼저 올린다. 본편 4749590의 default는 웹판 25482996을 유지하고, 본편 `unity-beta`는 비공개 시험용으로 둔다.
Steamworks의 공개(Set Live)·게시·상점 문구 게시는 사용자가 누른다(Claude 세션의 자동 안전 검사가 운영 배포 클릭을 막는다). 업로드는 `setlive ""`로 공개 없이 한다.
본편 전환 준비(반려 3항목 대조)는 `STEAM_UNITY_DEFAULT_READINESS_20261103.md`.

## 1. 체험판 앱 현재 상태 (Steamworks 화면 읽기, 11-03 20:40)

| 항목 | 값 |
|---|---|
| 앱 / 디포 | 5337590 (체험판, 상위 4749590) / Windows 5337591 |
| 브랜치 | `default`만 있음 → BuildID **25550483**(09-26 웹 데모, 공개) |
| 실행 옵션 0 | `EXODUSER.exe`, 인수 없음, 베타 키 없음 |
| 게시 대기 | 앱에 **이미 게시되지 않은 변경 사항이 있음**(이번 작업 전부터). 게시 전에 게시 탭 → "변경 사항 보기"로 내용을 먼저 확인 |
| 상점 페이지 | 별도 체험판 상점 페이지 비활성. 본편 상점의 "체험판 다운로드" 버튼 경로. 캡슐·라이브러리 이미지는 09월 본편(웹) 것을 가져와 씀 |

## 2. 업로드 빌드

| 항목 | 값 |
|---|---|
| 기준 | 바탕화면 실행본 `I:\EXODUSER-Storage\unity-latest\build` = unity/main **9f0d00cf8**(11-03 19:59, M1 23/23, 홀드 스킵 3초·지옥문 목표). BuildLoop가 b04ddd73b 이상을 내면 다음 업로드는 그것 |
| 고정 content | `G:\exoduser-steam\content\demo-unity\` (robocopy /MIR /XJ, BackUpThisFolder·pdb 제외, 212파일 6.16GB). 커밋 표식 `content\demo-unity.build-commit.json` |
| VDF | `G:\exoduser-steam\scripts\app_build_5337590_unity.vdf`(setlive "", desc에 SHA) + `depot_build_5337591_unity.vdf`(pdb·BackUpThisFolder·log·bak 제외) |
| 실행 옵션(예정) | `EXODUSER-Unity.exe` / `-force-d3d11 --remodel3d` (flavor는 인수가 아니라 빌드에 내장: `-flavor demo`로 만든 패키지) |
| 업로드 결과 | 3절 |

## 3. 업로드 결과

| 항목 | 값 |
|---|---|
| BuildID | **26404441** (2026-11-03 20:40, steamcmd 캐시 로그인, 종료코드 0) |
| Depot manifest | 6578278875091537519, 새 청크 6254개 |
| 공개 | 없음(`setlive ""`). 어떤 브랜치에도 배정되지 않음 → 6절 A |
| 로그 | `G:\exoduser-steam\output\demo-unity\app_build_5337590.log`·`depot_build_5337591.log` |

## 4. Unity 빌드 flavor 점검 — 체험판에 맞는가

`BuildFlavor.cs`: 내장 `Data/build_flavor.json`(`full`로 커밋) > full. 명령줄 `--unity-build-flavor`는 개발 빌드와 QA 실행에서만 읽고(QA sandbox 강제), 배포 빌드는 무시한다(11-04). 체험판 패키지는 **`-flavor demo`로 빌드해 demo를 내장**한다. 실행 인수로 정식판 저장을 열 수 없다.

| 항목 | demo flavor 동작 (9f0d00cf8) | 판정 / unity/main에서 고칠 것 |
|---|---|---|
| 표기 | 로비·타이틀 라벨 `DEMO`, 제한 문구 `Lv.1 START · Stage 1-1 Only · Lv.100 Cap · 1~2h` | OK |
| 1-1 뒤 종료 | 1-1 클리어 → 체험판 종료 화면(`DemoEndAtStage(0)`) | **고칠 것 U-D1**: 종료 화면 문구가 `DemoEndSub(false)`·`DemoEndButton(false)`로 한국어만 나옴. 영어·27개 언어 표시 필요(번역 목록 등록 포함) |
| 레벨 상한 | `LevelCap`=100이 SimulationConfig로 전달 | OK(정의대로) |
| 데모 어픽스 금지 7종·합성 허용 22종 | `NotPorted` — Unity에 시스템 없음 | **U-D2**: 웹 체험판의 제한이 없음. 1-1만 하므로 영향 작음, 이식 여부는 총괄 결정 |
| 제품명·창 제목 | ProjectSettings `productName` = **"EXODUSER · Unity 이식 검증판"**, company `ForDearGamers` | **U-D3 (공개 전 필수)**: 플레이어에게 보이는 창 제목·저장 폴더명에 "이식 검증판"이 나옴 → `EXODUSER: HELL LORD` 계열로. 저장 폴더 경로가 바뀌므로 기존 시험 세이브 이동 여부를 같이 정함 |
| 세이브 분리 | 저장 위치 = `persistentDataPath` 하나. `SaveNamespace`는 정의만 있고 사용처 없음 | **U-D4**: 체험판과 본편 unity-beta가 같은 세이브를 공유. flavor별 하위 폴더로 분리 권장 |
| 본편 상점 연결 | 체험판 종료 화면에 본편 위시리스트·상점 버튼 없음 | **U-D5(권장)**: 종료 화면에 "위시리스트에 추가"(steam://store/4749590) — 마케팅 목적 |
| 게임 내 구매 | 결제·Steamworks 코드 없음 | OK |

## 5. 상점 페이지 — 웹판 기준이라 Unity 화면으로 바꿀 목록

체험판은 별도 상점 페이지가 없어 **본편 상점 페이지**가 곧 체험판 소개다. 게시는 사용자.

### 5.1 공개 상점 현재 상태 (11-04 새벽, store.steampowered.com·appdetails 공개 데이터 읽기)

| 항목 | 현재 값 |
|---|---|
| 본편 4749590 | 출시 예정(Coming soon). "EXODUSER: HELL LORD Demo 다운로드" 버튼 있음 |
| 체험판 5337590 | **2026-10-07부터 공개 출시 상태**. 공개 빌드 = 웹 데모 25550483. 체험판 앱 자체 스크린샷·영상 0개, 시스템 요구 사항은 "64-bit" 한 줄뿐 |
| 스크린샷 | 5장(1920×1080), 모두 09-23 상점 버전과 함께 올라간 웹판 화면 |
| 트레일러 | 2개: `EXODUSER: HELL LORD —Story Trailer`(257415648), `EXODUSER: HELL LORD - Official Gameplay Trailer`(257407679) |
| 짧은 설명 | 탄막 패링·사슬 이동·스킬 강화/합성·다크 판타지 핵앤슬래시. 그래픽 방식(웹·2D·3D) 언급 없음 |
| 상세 설명 | 5개 단락: 탄막 패링 / 사슬 이동 / 스킬 강화·합성 / 장비 파밍 / 지옥 돌파 |
| 시스템 요구 사항 | 최소 그래픽에 **"Integrated GPU with WebGL2 support"**(웹 기준 문구). 추가 사항 오타 **"nline activation required via Steam."**(O 빠짐). 저장 공간 10GB(Unity 빌드 6.16GB, 여유 충분) |
| 언어·태그 | 29개 언어, 태그 20개(핵 앤 슬래시·탄막 지옥·탑다운 등). Unity 전환으로 바꿀 것 없음 |

### 5.2 Unity로 바꿀 목록

스크린샷·트레일러 촬영은 **맵 3D 반영 뒤** Mac에서 한다(CTO 11-04). 공개 전환(6절 B)과 같은 날 게시해서, 상점 화면과 체험판 실행본이 서로 다른 엔진으로 보이는 기간을 만들지 않는다.

| # | 항목 | 바꿀 것 | 담당·선행 |
|---|---|---|---|
| S1 | 스크린샷 5장 | 웹판 5장을 Unity 화면으로 전부 교체. 후보 장면: ① 1-1 다리 위, 먼 적이 작게 보이는 원근(카메라 LOCK 34°) ② 무지개탄 Q 패링 순간 ③ 적 무리 속 스킬·합성 VFX(탄막이 가려지지 않게) ④ 다크드루이드 보스전 ⑤ 장비·인벤토리 UI ⑥ 타이틀/로비. 1920×1080, HUD 있는 컷과 없는 컷을 섞는다. 3x 크롭 점 0개 | 맵 3D 반영 → Mac 캡처 → 디자인총괄 판정 |
| S2 | Official Gameplay Trailer | Unity 1-1 플레이 영상으로 교체 | 트레일러 담당, S1과 같은 빌드 |
| S3 | Story Trailer | 웹 게임 화면이 들어 있는지 확인. 들어 있으면 그 컷만 Unity로 바꾸거나 순서를 뒤로 | 트레일러 담당 확인 |
| S4 | 상세 설명 5단락 | 문단마다 Unity 체험판(1-1)에서 실제로 되는 기능인지 대조. 특히 "사슬을 벽에 박아 이동"·"스킬 합성"·"장비 파밍". 안 되는 기능은 "정식판" 표기로 나누거나 문장 조정 | Mac 실게임 확인 뒤 스팀 총괄이 문안 작성 |
| S5 | 체험판 소개 문단 | 상세 설명에 체험판 범위 한 단락 추가(1-1 · 다크드루이드 · Lv.100 상한). 29개 언어는 번역 목록 등록 뒤 일괄 | 스팀 총괄 문안, 번역 |
| S6 | 시스템 요구 사항(본편) | 최소 그래픽의 "WebGL2" 문구 제거, GPU·CPU·메모리는 Unity URP DX11 빌드 실측 뒤 값 확정(추정값 금지). 추가 사항 오타 → "Online activation required via Steam." | QA·성능 실측 → 스팀 총괄 |
| S7 | 시스템 요구 사항(체험판 앱) | 지금은 "64-bit" 한 줄뿐 → 본편과 같은 최소·권장 값 입력 | S6 뒤 |
| S8 | 캡슐·헤더·라이브러리 이미지 | 09월 키아트·로고. 11-03 타이틀 리마스터 로고와 맞는지 판정 뒤 교체 여부 결정 | 디자인총괄 |
| S9 | 태그·언어 | 변경 없음. 자동 태그 "애니메이션"·"시네마틱"은 Unity 컷신 상태 보고 유지 여부만 재확인 | — |

## 6. 사용자 클릭 목록 (체험판 앱 5337590)

A. 비공개 시험 (지금)
1. SteamPipe → 빌드 → "새로운 앱 브랜치 생성" → 이름 `unity-test`, 비밀번호 설정
2. 빌드 목록에서 3절 BuildID 줄 → 오른쪽 선택 상자 `unity-test` → "변경 사항 미리 보기" → 적용
3. 설치 → 일반 → "새로운 실행 옵션 추가" → 수정: 실행 파일 `EXODUSER-Unity.exe` / 인수 `-force-d3d11 --remodel3d` / 시작 유형 실행(기본 설정) / Windows / 64비트 전용 / 베타 브랜치 `unity-test` / 설명(영어) `Play Unity Demo` → 갱신
4. 게시 → "변경 사항 보기"로 기존 미게시 변경을 먼저 확인 → 게시 준비 → Steam에 게시
5. Steam 클라이언트에서 체험판 속성 → 베타 → 비밀번호 입력 → `unity-test` 받기 → 실행 확인(DEMO 표기·1-1 종료 화면)

B. 공개 전환 (U-D1·U-D3 수정 빌드로, 사용자 확인 뒤)
1. 수정 빌드 업로드 → `unity-test`에서 확인
2. 빌드 → 그 BuildID를 `default`로 공개
3. 설치 → 일반 → 실행 옵션 0을 `EXODUSER-Unity.exe` / `-force-d3d11 --remodel3d`로 수정(flavor는 demo 내장 빌드가 정한다), 옵션 1 삭제 → 게시
4. 빌드 검토가 필요하면 Notes(영문)와 함께 검토 요청 → 승인 뒤 공개
5. 5절 상점 교체분 게시

## 7. flavor 수정 `20f276b5c` 저장 이전 경로 코드 확인 (11-04 새벽, 스팀 총괄)

대상: `origin/codex/unity-demo-flavor-20261103`의 `NativeFlavorSavePaths.cs`·`NativeFlavorStorage.cs`와 호출부(`NativeLobby.CharacterStore.cs`, `NativeGame.SettingsPersistence.cs`, 전투 저장은 로스터 부모 폴더를 따라감), 테스트 `unity/Tools/demo-flavor-tests/Program.cs`. 코드를 읽어서만 확인했다. PC에서 Unity를 실행하지 않았고 사용자 저장을 건드리지 않았다(폴더 이름만 조회).

| 질문 | 결과 | 근거 |
|---|---|---|
| 기존 저장을 덮어쓰는가 | **아니오** | 목적 폴더(`<persistentDataPath>/<namespace>`)가 이미 있으면 가져오기를 하지 않고 그대로 쓴다. 새 파일은 `FileMode.CreateNew`로 고정 staging(`<namespace>.legacy-import`)에만 쓰고, 끝나면 `Directory.Move`로 목적 폴더를 만든다 |
| 기존 저장을 지우거나 옮기는가 | **아니오** | 원본은 `FileAccess.Read`로만 열고 Delete·Move 호출이 없다. `.json`·`.bak`만 복사하고 Player.log는 가져오지 않는다. 테스트가 원본 바이트 불변을 확인한다 |
| 실패하면 원래 경로로 돌아가는가 | **아니오. 원래 경로로 돌아가지 않고 저장을 막는다(fail-closed)** | `TryResolve` 실패 → 캐릭터 로스터는 `IoError`(로비 저장 오류 표시, 쓰기 금지), 설정은 기본값으로 실행하고 저장하지 않는다. 원본은 그대로 남는다. 옛 경로에 계속 쓰면 체험판·본편 저장이 다시 섞이므로 이 방식이 더 안전하다 |
| 체험판이 본편 저장을 가져가는가 | **아니오** | 이름공간 없는 옛 저장은 full만 가져간다. demo는 옛 루트의 `EXODUSER-HELL-DEMO` 폴더만 가져간다. 웹 데모(25550483) 저장은 NW.js 쪽이라 관계없다 |
| Windows에서 제품명 `:` 처리 | **문제 없음** | 11-03 20:55 PC Editor 컴파일이 `%USERPROFILE%\AppData\LocalLow\ForDearGamers\EXODUSER_ HELL LORD\`를 만들었다. Unity가 `:`를 `_`로 바꾼다. 옛 루트는 실제 경로의 부모 폴더 기준이라 `EXODUSER · Unity 이식 검증판`을 정확히 찾는다. 이 PC에는 옛 루트에 실제 저장(roster·combat·settings, 10-27~28)이 있어, 새 full 빌드를 처음 실행할 때 가져오기가 1회 일어난다 |

**결함 F-1 (병합 전 수정 권장)**: 가져오기가 도중에 실패하면 staging 폴더 `<namespace>.legacy-import`가 남는다. 실패 원인은 원본 파일 잠김, 디스크 부족, 실행 중 강제 종료 등이다. 그 뒤로는 실행할 때마다 첫 검사("Unfinished or conflicting save import")에서 실패해 **저장이 영구히 막힌다**. 플레이어가 그 폴더를 손으로 지우기 전까지 풀리지 않는다. 테스트 "active legacy writer blocks import"도 staging을 남기지만, 잠금이 풀린 뒤 다시 시도하는 경우는 검사하지 않는다.
- 수정안: staging에는 복사본만 있으므로, 이번 시도가 만든 staging은 `catch`에서 지우고 false를 반환한다. 다음 실행 때 목적 폴더가 없는데 staging이 남아 있으면 그 staging을 지우고 한 번 다시 가져온다. 원본은 계속 건드리지 않는다.
- 테스트 추가: 잠금 → 실패 → 잠금 해제 → 두 번째 `TryPrepare` 성공과 바이트 동일.

**남은 확인 F-2**: 체험판 depot은 Windows 전용이다. Mac 판정으로는 Windows의 실제 첫 실행(옛 저장 가져오기와 창 제목)을 볼 수 없다. 가져오기 로직의 Windows 경로는 PC .NET 격리 테스트 58/58로만 확인됐다. 6절 A의 `unity-test`에서 사용자가 처음 실행할 때 창 제목 `EXODUSER: HELL LORD`와 저장 동작을 같이 확인한다.

판정: 덮어쓰기·삭제 위험은 없다(데이터 안전 측면은 병합 가능). 다만 F-1 때문에 일시적 실패가 영구 저장 불가로 바뀌므로, 공개 체험판에 넣기 전에 F-1을 고치는 것을 권장한다.

## 8. 아침 사용자 클릭 목록 (11-04 새벽 Steamworks 화면 읽기 기준)

현재 상태:
- 본편 4749590: "아직 게시되지 않은 변경 사항"이 남아 있다. 실행 옵션 1 추가분이 미게시 상태다. `review-20260916` 브랜치도 아직 활성이다.
- 본편 브랜치: default 25482996(웹), unity-beta 26401646.
- 본편에 v0.7.11 BuildID 26369072(11-01 업로드)가 있다. 어떤 브랜치에도 공개되지 않았다. 공개 여부는 사용자 결정이며 이 목록에는 넣지 않는다.
- 체험판 5337590: default 25550483만 있다. `unity-test` 브랜치가 없어서 A는 아직 시작 전이다.

본편 4749590 (한 번에 게시):
1. SteamPipe → 빌드 → "사용 가능한 앱 브랜치" 표의 `review-20260916` 줄 오른쪽 **비활성화** → 확인. `unity-beta` 줄은 누르지 않는다.
2. 게시 탭 → **변경 사항 보기**: 내용이 실행 옵션 1(`EXODUSER-Unity.exe`, 베타 `unity-beta`)과 브랜치 비활성화뿐인지 확인한다.
3. **게시 준비** → **Steam에 게시**.

체험판 5337590 (6절 A, 비공개 시험):
4. 지금 있는 26404441(수정 전 9f0d00cf8)로 A의 1~5를 진행해 Steam 설치·실행 경로를 먼저 확인한다. flavor 수정 빌드는 F-1 수정과 Mac 판정을 통과한 뒤 같은 `unity-test` 브랜치에 다시 올린다. 그 업로드는 비공개이며 스팀 총괄이 한다.

공개 전환(6절 B)과 상점 교체(5.2절)는 U-D3를 고친 빌드가 `unity-test`에서 확인된 뒤, 사용자 확인을 받고 같은 날 진행한다.

## 9. S4·S5 — 상점 설명과 Unity 체험판 기능 대조, 체험판 소개 초안 (11-04 01시, 스팀 총괄)

기준: 코드 unity/main **93a09dccb**(읽기만), 상태 표기는 `docs/engine/UNITY_PORT_MASTER_20261026.md`(0 미착수 / 1 일부 / 2 웹 동일 소스 / 3 실플레이 인수)를 같이 적는다. 상점 원문은 11-04 공개 appdetails(ko·en)에서 읽었다. 게임 쪽은 고치지 않았다. 판정은 코드 기준이며, Mac 실게임 확인은 아직 하지 않았다.

### 9.1 대조표

| # | 상점 문구(요지) | Unity 93a09dccb에 있는 것 | 근거 | 판정 | 체험판 문구 처리 |
|---|---|---|---|---|---|
| K1 | 대검과 다양한 스킬로 몰려드는 악마를 쓸어버린다 · 대규모 실시간 핵앤슬래시 | 기검참 LMB 3타·차지, 1-1 일반 몹 무리, 공격 티켓 없음 | B02 오라클 93/93, C01(1-1 몹), `Simulation.Death.cs` 티켓 해제는 빈 함수 | 있음 | 그대로 |
| K2 | 색·패턴이 다른 탄막을 읽고 올바른 입력으로 받아친다(Bullet Language) | Q 패링·E 방패 강타, 탄 분류(물리/마법) 판정, 패링 반사(블루콩 유도) | `ParryRules.cs`, `ParryReflect.cs`, 드루이드 탄 연결 `DruidBoss.Reflect.cs`. B07=1(`Simulation.PlayerCombat.cs` 머리 주석의 "반사 미구현"은 옛 문구) | 있음(Mac 확인 필요) | 그대로 |
| K3 | 사슬을 **벽에 박으면** 끌려가 적진을 관통한다(Chain Drive, 홀드 차지) | Shift 홀드 3단 충전 → 사슬 비행 → 끌어당김 이동, 경로 위 적 타격·무적·게이지 | `ChainDash.cs`, `Simulation.PlayerCombat.cs` `TickChainDash`. **벽 고정(wall auto fire)·3단 자동 발사·불길·칼날 날개는 미이식**. 사슬은 최대 거리까지 날아간 뒤 끌어당기고, 벽에 막히면 멈춘다 | 일부 | 체험판 문구에서는 "벽에 박아" 대신 "사슬 기동"으로 쓴다 |
| K4 | 전투로 스킬을 해금·강화한다 | 스킬 창 습득·강화± 버튼, 이식된 시작 스킬 5종(가시덫·대지강타·성역·얼음구슬·화염구)+기검참 | `Simulation.Skills.cs` `PortedSkillIds`, `NativeSkills.cs` 습득/강화 버튼. B03(나머지 스킬) 0 | 일부 | "기본 스킬"로 범위를 한정한다 |
| K5 | 특정 스킬끼리 결합해 새 기술이 된다(스킬 합성, en "21+ fusion") | 없음. 체험판 합성 허용 22종은 정의 목록만 있음 | B04 합체 16종·성급 **0**. `BuildFlavor.FuseAllowed`는 정의뿐(`NotPorted`) | **없음** | 체험판 소개에서는 "정식판" 기능으로 분리한다 |
| K6 | 무기·장비에 능력과 옵션이 붙고, 더 강한 장비로 교체한다 | 처치 드랍(웹 rollDrop 장비 절반), 드랍 빔, 줍기, 가방→장착(Enter·끌기), 어픽스 굴림 | `Simulation.cs` D01 `WorldDrop`, `ItemFactory.cs`(mkItem·rollAffixes 오라클), `NativeInventory.cs` `Equip`. D01=1, D02 어픽스 55종=1, D03 전설·유니크=0, D04 강화·소켓·분해=0 | 일부 | "장비 파밍"은 쓰되 전설·유니크·강화는 쓰지 않는다 |
| K7 | 환경·적이 다른 지옥을 지나며 점점 강한 보스와 싸운다(en "7장·35+ 스테이지·35+ 보스") | 1-1 한 지역 + 보스 다크드루이드 | C04=1(1-1), C03=0(드루이드만 진행), `StageFlow.cs`는 1-1 흐름 | 체험판 범위 밖 | 체험판 소개에 "1-1·첫 보스"로 명시한다 |
| K8 | 다크 판타지 싱글플레이 캠페인 | 싱글플레이, 세계관 인트로·29개 언어 자막 | A01·A02=1 | 있음 | 그대로 |
| E1 | (en) 복수·등 뒤의 칼·아이들·네메시아 서사 | 세계관 인트로, 시작 대사에 네메시아 화자 | A02, `NativeLobby.StartupPresentation.cs` | 있음 | 그대로 |
| E2 | (en) 검은 고양이 디로이·까마귀 헥터가 **함께 다닌다** | 자유 이동 동행 펫 없음. 시작 대사와 필드 상황 말풍선(`NativeGame.PetBubble.cs`)은 있음. 현행 사망 결정 화면에는 펫 초상·대사를 그리지 않음 | B12 동행 펫=0. `NativeDeathOverlay.Draw`는 결정 화면으로 교체됨(1301432f0) | **없음**(동행 이동체) | 체험판 소개에서 동행 펫을 언급하지 않는다 |
| E3 | (en) 유령의 석궁이 함께한다 | 자동 석궁(120프레임 타이머, T 토글) | `Simulation.Crossbow.cs`, B05=0이지만 자동 석궁 Core 있음 | 있음(Mac 확인 필요) | 그대로 |
| E4 | (en) 아키타입 6종 | 전사만 선택 가능 | A04 "전사만, 신규 3영웅 미이식" | **없음** | 체험판은 "전사"로 명시한다 |
| E5 | (en) 희귀도 5단계 | 아이템 희귀도 굴림은 있음, 전설·유니크 상자는 미이식 | `ItemFactory.cs`, D03=0 | 일부 | 쓰지 않는다 |

상점 문구 자체의 결함:
- 한국어와 영어 상세 설명의 내용이 다르다. 영어에만 서사·펫·숫자(7장·35·6·5·21+)가 있다. S4 문안을 다시 쓸 때 두 언어의 항목을 맞춘다.
- 짧은 설명(ko·en)에도 "벽에 박아"(K3)와 "합성"(K5)이 들어 있다. 본편 상점이라 정식판 기능으로는 맞지만, 체험판을 받는 사람이 1-1에서 이 기능을 만나지 못한다. 그래서 체험판 소개 단락(9.2)에 범위를 적는다.

### 9.2 체험판 소개 단락 초안 (S5, 사용자 게시 전 승인 필요)

상세 설명 끝에 덧붙이는 것으로 한다. 문구는 9.1에서 "있음"·"일부"로 확인된 기능만 쓴다. 플레이 시간은 넣지 않았다. flavor 라벨의 `1~2h`는 웹 데모 기준이고, Unity 1-1은 실측 전이다(데모 v0 목표는 10~15분). 실측 뒤에 넣는다.

**KO**

> **체험판 안내**
> 체험판에서는 지옥의 첫 지역 1-1을 처음부터 끝까지 플레이할 수 있습니다. 레벨 1 전사로 시작해 대검과 기본 스킬, 탄막 패링, 사슬 기동, 장비 파밍을 직접 겪어 보고, 지역 끝에서 첫 보스 다크드루이드와 맞서세요. 체험판의 레벨 상한은 100이며, 체험판 진행은 정식판과 따로 저장됩니다. 스킬 합성, 다른 영웅들, 더 깊은 지옥과 그 보스들은 정식판에서 만날 수 있습니다.

**EN**

> **About the Demo**
> The demo lets you play through 1-1, the first region of hell, from start to finish. Begin as a level 1 Warrior, get hands-on with the greatsword, starting skills, bullet parrying, Chain Drive and loot, then face the region's first boss, the Dark Druid. The demo level cap is 100, and demo progress is saved separately from the full game. Skill fusion, more heroes, and the deeper layers of hell and their bosses await in the full game.

전제와 확인할 것:
- "체험판 진행은 정식판과 따로 저장"은 flavor 수정(U-D4, `20f276b5c`, F-1 수정 대기)이 체험판 빌드에 들어간 뒤에만 맞는 문장이다. 그 전에 게시하면 이 문장을 뺀다.
- 보스 영문명 `Dark Druid`는 웹 `game.html` 번역표(`'다크드루이드':'Dark Druid'`)를 따랐다.
- "Chain Drive"는 영어 상점의 기존 기능명을 그대로 썼다. 한국어는 상점 본문 용어 "사슬 기동"을 썼다.

### 9.3 번역대상 No. 등록 준비

상점 문구는 게임 안 표시 문자열이 아니다. 하지만 29개 언어 상점 현지화(`STEAM_STORE_LOCALIZATION_20260909.md` 절차)에 들어가므로, 번역 목록에 "Steam 상점 문구(게임 밖)" 절로 등록한다. 등록은 9.2 문안이 사용자 승인을 받은 뒤 한다. 그때 목록의 마지막 No.를 다시 확인한다. 11-04 01시 기준 마지막 번호는 **No.4258**이고, 다음 빈 번호는 4259다.

등록할 행(번호는 등록 시점에 확정):

| No.(예정) | KO | EN | 사용 위치 | 언어 |
|---|---|---|---|---|
| 4259 | 체험판 안내 | About the Demo | Steam 상점 상세 설명(본편 4749590) 체험판 단락 제목 | 상점 29개 언어 |
| 4260 | (9.2 KO 본문) | (9.2 EN 본문) | 같은 단락 본문 | 상점 29개 언어 |

목록 파일은 CRLF이므로 줄바꿈을 보존해 추가한다. 27개 언어 번역은 등록 직후 일괄 처리한다(번역 자동 처리 규칙). 게시는 사용자가 Steamworks 상점 페이지 편집에서 한다.

## 10. 체험판 소개 단락 승인·번역·상점 붙여 넣기 준비 (11-04 07시대, 스팀 총괄)

사용자가 9.2 문안을 승인했다(CTO 경유, 원문 "4는 승인"). 번역 목록 No.4262–4263에 등록하고 Steam 상점 30개 언어와 ar로 번역했다. 게시와 저장 클릭은 사용자가 한다. 이 절은 Steamworks 상점 편집 화면(Store Item 1189321, Description 탭)을 11-04에 읽기만 해서 확인한 칸 이름을 쓴다. Steamworks 화면 언어는 영어다.

승인문에서 바꾼 것은 한 단어다. "스킬 합성"을 "스킬 합체"로 고쳤다. 게임(웹 game.html의 합체 351회, 합성 73회)과 상점 본문 초안("스킬 포지의 합체")이 모두 "합체"를 쓴다.

### 10.1 게시 시점

- 체험판 앱 5337590이 공개된 뒤, 같은 날 붙인다. 공개 전에 붙이면 본편 상점에 "체험판"이 나오지만 받을 버튼이 없다.
- "체험판 진행은 정식판과 따로 저장" 문장은 저장 분리 수정(U-D4)이 든 체험판 빌드가 공개될 때만 맞다. 지금 계획된 공개 빌드(F-1·U-D1/3/4/5 수정 SHA)에 들어 있으므로, 문장은 그대로 둔다.
- 본편 상점에는 **게시되지 않은 변경**이 이미 있다(한국어·영어 상세 설명 새 초안). Publish 탭에서 게시하면 그 초안도 함께 공개된다(10.3 C1).

### 10.2 붙여 넣는 위치 (사용자 클릭 순서)

언어별 복사 버튼이 있는 페이지(비공개 Artifact, 사용자 계정): https://claude.ai/artifact/Q4suqepkN79TPJHrrRuK2J

1. Steamworks → 앱 4749590 → **Edit Store Page** → **Description** 탭
2. "About This Game" 칸 위쪽의 **Use visual editor** 체크를 끈다(BBCode 원문 보기)
3. 같은 줄의 언어 목록에서 아래 표의 언어를 고른다
4. 본문 맨 끝 `[/list]` 다음 줄에 그 언어 파일 내용을 그대로 붙여 넣는다(줄 하나를 띄운다)
5. 페이지 아래 **Save**를 누른다. 다음 언어로 넘어가 3~5를 되풀이한다
6. 30개 언어를 마치면 **Publish** 탭에서 게시한다. 이 단계는 체험판 공개 직후로 미룬다

짧은 설명(Short Description)은 이번 단락과 관계없다. 바꾸지 않는다(10.3 C3).

| 언어 | Steamworks 언어 목록 이름 | 붙여 넣을 파일 | 제목 |
|---|---|---|---|
| 한국어 | `Korean` | `docs/13출시·마케팅/steam_store_demo_paragraph_20261104/koreana.txt` | 체험판 안내 |
| 영어 | `English` | `docs/13출시·마케팅/steam_store_demo_paragraph_20261104/english.txt` | About the Demo |
| 프랑스어 | `French` | `docs/13출시·마케팅/steam_store_demo_paragraph_20261104/french.txt` | À propos de la démo |
| 이탈리아어 | `Italian` | `docs/13출시·마케팅/steam_store_demo_paragraph_20261104/italian.txt` | Informazioni sulla demo |
| 독일어 | `German` | `docs/13출시·마케팅/steam_store_demo_paragraph_20261104/german.txt` | Über die Demo |
| 스페인어 - 스페인 | `Spanish - Spain` | `docs/13출시·마케팅/steam_store_demo_paragraph_20261104/spanish.txt` | Acerca de la demo |
| 스페인어 - 중남미 | `Spanish - Latin America` | `docs/13출시·마케팅/steam_store_demo_paragraph_20261104/latam.txt` | Acerca de la demo |
| 불가리아어 | `Bulgarian` | `docs/13출시·마케팅/steam_store_demo_paragraph_20261104/bulgarian.txt` | За демото |
| 체코어 | `Czech` | `docs/13출시·마케팅/steam_store_demo_paragraph_20261104/czech.txt` | O demu |
| 덴마크어 | `Danish` | `docs/13출시·마케팅/steam_store_demo_paragraph_20261104/danish.txt` | Om demoen |
| 네덜란드어 | `Dutch` | `docs/13출시·마케팅/steam_store_demo_paragraph_20261104/dutch.txt` | Over de demo |
| 핀란드어 | `Finnish` | `docs/13출시·마케팅/steam_store_demo_paragraph_20261104/finnish.txt` | Tietoa demosta |
| 그리스어 | `Greek` | `docs/13출시·마케팅/steam_store_demo_paragraph_20261104/greek.txt` | Σχετικά με το demo |
| 헝가리어 | `Hungarian` | `docs/13출시·마케팅/steam_store_demo_paragraph_20261104/hungarian.txt` | A demóról |
| 인도네시아어 | `Indonesian` | `docs/13출시·마케팅/steam_store_demo_paragraph_20261104/indonesian.txt` | Tentang Demo |
| 일본어 | `Japanese` | `docs/13출시·마케팅/steam_store_demo_paragraph_20261104/japanese.txt` | 体験版について |
| 말레이어 | `Malay` | `docs/13출시·마케팅/steam_store_demo_paragraph_20261104/malay.txt` | Tentang Demo |
| 노르웨이어 | `Norwegian` | `docs/13출시·마케팅/steam_store_demo_paragraph_20261104/norwegian.txt` | Om demoen |
| 폴란드어 | `Polish` | `docs/13출시·마케팅/steam_store_demo_paragraph_20261104/polish.txt` | O wersji demo |
| 포르투갈어 - 브라질 | `Portuguese - Brazil` | `docs/13출시·마케팅/steam_store_demo_paragraph_20261104/brazilian.txt` | Sobre a demo |
| 포르투갈어 - 포르투갈 | `Portuguese - Portugal` | `docs/13출시·마케팅/steam_store_demo_paragraph_20261104/portuguese.txt` | Sobre a demo |
| 루마니아어 | `Romanian` | `docs/13출시·마케팅/steam_store_demo_paragraph_20261104/romanian.txt` | Despre demo |
| 러시아어 | `Russian` | `docs/13출시·마케팅/steam_store_demo_paragraph_20261104/russian.txt` | О демоверсии |
| 중국어 간체 | `Simplified Chinese` | `docs/13출시·마케팅/steam_store_demo_paragraph_20261104/schinese.txt` | 关于试玩版 |
| 스웨덴어 | `Swedish` | `docs/13출시·마케팅/steam_store_demo_paragraph_20261104/swedish.txt` | Om demot |
| 태국어 | `Thai` | `docs/13출시·마케팅/steam_store_demo_paragraph_20261104/thai.txt` | เกี่ยวกับเดโม |
| 중국어 번체 | `Traditional Chinese` | `docs/13출시·마케팅/steam_store_demo_paragraph_20261104/tchinese.txt` | 關於試玩版 |
| 튀르키예어 | `Turkish` | `docs/13출시·마케팅/steam_store_demo_paragraph_20261104/turkish.txt` | Demo Hakkında |
| 우크라이나어 | `Ukrainian` | `docs/13출시·마케팅/steam_store_demo_paragraph_20261104/ukrainian.txt` | Про демоверсію |
| 베트남어 | `Vietnamese` | `docs/13출시·마케팅/steam_store_demo_paragraph_20261104/vietnamese.txt` | Giới thiệu bản demo |

아랍어(`ar.txt`)는 상점 설명 화면에 아랍어 칸이 없어 붙이지 않는다. 번역 목록의 29개 언어를 맞추려고 만들어 두기만 했다.

### 10.3 상점 문구 정리 대조 (같은 화면에서 11-04 확인)

| # | 칸·언어 | 지금 상태 | 문제 | 처리 |
|---|---|---|---|---|
| C1 | About This Game — 한국어·영어 | 새 초안(제목 6개, 핵터·디로이·스킬 포지·보석 소켓 포함)이 **저장만 됐고 게시 전**이다. 두 언어의 항목은 서로 맞는다 | S4에서 찾은 ko·en 불일치(영어에만 7장·35 스테이지·펫·6 아키타입)는 **공개본**의 문제다. 초안을 게시하면 풀린다 | 체험판 단락과 함께 게시한다. 사용자 클릭 |
| C2 | About This Game — 나머지 28개 언어 | 09-09에 옛 한국어(제목 5개)를 번역한 판이다 | 새 ko·en 초안과 내용이 다르다. 게시하면 한국어·영어만 새 내용이 되고 28개 언어는 옛 내용으로 남는다 | 새 초안을 28개 언어로 다시 번역해야 한다. 체험판 단락은 이 일과 따로 붙일 수 있다. 다시 번역하는 일은 CTO가 배정한다 |
| C3 | Short Description — 한국어 | "사슬을 벽에 박아 … 서로 **합성**해" | ① 용어: 본문 초안은 "합체"를 쓴다. ② "벽에 박아"는 웹 본편(지금 default 빌드)에는 맞다. Unity에는 벽 고정이 없다(9.1 K3) | ①은 "합성"을 "합체"로 바꾸는 한 단어 수정이다. 사용자가 원하면 함께 고친다. ②는 기본 브랜치를 Unity로 바꿀 때 다시 본다. 체험판에서 쓰는 말은 10.2 단락의 "사슬 기동"이다 |
| C4 | Short Description — 영어 | "chain across the battlefield, fuse skills … seven layers of hell" | "fuse"는 본편 기능이라 맞다. "seven layers"는 숫자 약속이다. 본문 초안에서는 숫자를 뺐다 | 숫자를 계속 쓸지는 스토리 총괄이 정본을 보고 판정한다. 체험판 단락은 숫자를 쓰지 않는다 |
| C5 | 체험판 범위 | 본문은 정식판 기능(합체·전설·유니크·보석 소켓·펫 동행)을 소개한다 | 1-1 체험판에는 이 기능이 없다(9.1) | 10.2 단락이 "합체·다른 영웅·더 깊은 지옥은 정식판"이라고 따로 밝힌다. 본문은 바꾸지 않는다 |

"핵터" 표기는 오타가 아니다. 스토리 정본(STORY_LEAD_MASTER, 10-28 "헥터→핵터" 정정)이 이 표기다.

### 10.4 체험판 앱 5337590 상점 페이지 (11-04 10시, CTO 지시로 대상 확정)

CTO가 붙일 곳을 체험판 앱 5337590으로 정했다. 11-04 10시대에 Steamworks 체험판 상점 편집(Store Item **1346593**)을 읽기만 해서 확인했다. Description 탭에는 **About This Demo**와 **Short Description**(200~300자) 두 칸이 있고, 상점 30개 언어가 모두 비어 있다(0자). 그래서 두 칸을 함께 채운다.

- About This Demo = No.4263 본문을 `[p]…[/p]`로 감싼 것. 칸 제목이 이미 "About This Demo"라서 `[h2]` 제목(No.4262)은 넣지 않는다.
- Short Description = No.4273(4263 본문을 줄인 것). 길이는 118~297자다. 일본어·중국어는 200자보다 짧은데, 본편도 같은 언어가 111~139자다.
- 파일: `docs/13출시·마케팅/steam_store_demo_app_5337590_20261104/`에 언어별 `.about.txt`·`.short.txt` 31쌍, `localization_upload_1346593.json`(Localization 탭 업로드 형식, 두 칸만), `demo_app_store_all.json`이 있다. 업로드 사본은 `I:\EXODUSER-Storage\steam_store\demo_5337590_localization_upload_20261104.json`에 있다.
- 업로드 JSON 형식은 09-09 본편 내보내기(`{itemid, languages:{<코드>:{"app[content][about]", "app[content][short_description]"}}}`)와 같다. 이 업로드 방식은 아직 실제로 성공한 적이 없다(09-09에는 확장 권한 때문에 손 입력으로 대신했다). 업로드가 거부되면 손 붙여 넣기(B)로 한다.
- 10.1~10.2의 본편 4749590 단락(`steam_store_demo_paragraph_20261104/`)은 선택 사항으로 남긴다. 본편 상점에도 체험판 안내를 넣을지는 공개 때 정한다.

| 언어 | 언어 목록 이름 | About This Demo | Short Description | 짧은 설명 글자 수 |
|---|---|---|---|---:|
| 영어 | `English` | `english.about.txt` | `english.short.txt` | 291 |
| 프랑스어 | `French` | `french.about.txt` | `french.short.txt` | 293 |
| 이탈리아어 | `Italian` | `italian.about.txt` | `italian.short.txt` | 295 |
| 독일어 | `German` | `german.about.txt` | `german.short.txt` | 291 |
| 스페인어 - 스페인 | `Spanish - Spain` | `spanish.about.txt` | `spanish.short.txt` | 295 |
| 불가리아어 | `Bulgarian` | `bulgarian.about.txt` | `bulgarian.short.txt` | 292 |
| 체코어 | `Czech` | `czech.about.txt` | `czech.short.txt` | 293 |
| 덴마크어 | `Danish` | `danish.about.txt` | `danish.short.txt` | 291 |
| 네덜란드어 | `Dutch` | `dutch.about.txt` | `dutch.short.txt` | 294 |
| 핀란드어 | `Finnish` | `finnish.about.txt` | `finnish.short.txt` | 280 |
| 그리스어 | `Greek` | `greek.about.txt` | `greek.short.txt` | 296 |
| 헝가리어 | `Hungarian` | `hungarian.about.txt` | `hungarian.short.txt` | 294 |
| 인도네시아어 | `Indonesian` | `indonesian.about.txt` | `indonesian.short.txt` | 297 |
| 일본어 | `Japanese` | `japanese.about.txt` | `japanese.short.txt` | 159 |
| 한국어 | `Korean` | `koreana.about.txt` | `koreana.short.txt` | 219 |
| 말레이어 | `Malay` | `malay.about.txt` | `malay.short.txt` | 294 |
| 노르웨이어 | `Norwegian` | `norwegian.about.txt` | `norwegian.short.txt` | 290 |
| 폴란드어 | `Polish` | `polish.about.txt` | `polish.short.txt` | 290 |
| 포르투갈어 - 브라질 | `Portuguese - Brazil` | `brazilian.about.txt` | `brazilian.short.txt` | 289 |
| 포르투갈어 - 포르투갈 | `Portuguese - Portugal` | `portuguese.about.txt` | `portuguese.short.txt` | 294 |
| 루마니아어 | `Romanian` | `romanian.about.txt` | `romanian.short.txt` | 290 |
| 러시아어 | `Russian` | `russian.about.txt` | `russian.short.txt` | 287 |
| 중국어 간체 | `Simplified Chinese` | `schinese.about.txt` | `schinese.short.txt` | 118 |
| 스페인어 - 중남미 | `Spanish - Latin America` | `latam.about.txt` | `latam.short.txt` | 295 |
| 스웨덴어 | `Swedish` | `swedish.about.txt` | `swedish.short.txt` | 293 |
| 태국어 | `Thai` | `thai.about.txt` | `thai.short.txt` | 269 |
| 중국어 번체 | `Traditional Chinese` | `tchinese.about.txt` | `tchinese.short.txt` | 118 |
| 튀르키예어 | `Turkish` | `turkish.about.txt` | `turkish.short.txt` | 282 |
| 우크라이나어 | `Ukrainian` | `ukrainian.about.txt` | `ukrainian.short.txt` | 290 |
| 베트남어 | `Vietnamese` | `vietnamese.about.txt` | `vietnamese.short.txt` | 286 |


### 10.5 패키지 준비물 (11-04)

스크린샷 목록, 영상 콘티, 설치형 빌드 체크리스트, PC 무창 촬영 요청서는 `STEAM_DEMO_PACKAGE_20261104.md`에 있다.
