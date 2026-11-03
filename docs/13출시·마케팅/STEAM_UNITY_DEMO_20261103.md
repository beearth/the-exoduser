# Steam 체험판 앱(5337590) Unity 전환 — 2026-11-03

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
| 실행 옵션(예정) | `EXODUSER-Unity.exe` / `-force-d3d11 --remodel3d --unity-build-flavor demo` |
| 업로드 결과 | 3절 |

## 3. 업로드 결과

| 항목 | 값 |
|---|---|
| BuildID | **26404441** (2026-11-03 20:40, steamcmd 캐시 로그인, 종료코드 0) |
| Depot manifest | 6578278875091537519, 새 청크 6254개 |
| 공개 | 없음(`setlive ""`). 어떤 브랜치에도 배정되지 않음 → 6절 A |
| 로그 | `G:\exoduser-steam\output\demo-unity\app_build_5337590.log`·`depot_build_5337591.log` |

## 4. Unity 빌드 flavor 점검 — 체험판에 맞는가

`BuildFlavor.cs`: 명령줄 `--unity-build-flavor demo` > 내장 `Data/build_flavor.json`(`full`로 커밋) > full. 체험판은 **실행 인수로 demo를 준다**(빌드 재생성 없이).

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
3. 설치 → 일반 → "새로운 실행 옵션 추가" → 수정: 실행 파일 `EXODUSER-Unity.exe` / 인수 `-force-d3d11 --remodel3d --unity-build-flavor demo` / 시작 유형 실행(기본 설정) / Windows / 64비트 전용 / 베타 브랜치 `unity-test` / 설명(영어) `Play Unity Demo` → 갱신
4. 게시 → "변경 사항 보기"로 기존 미게시 변경을 먼저 확인 → 게시 준비 → Steam에 게시
5. Steam 클라이언트에서 체험판 속성 → 베타 → 비밀번호 입력 → `unity-test` 받기 → 실행 확인(DEMO 표기·1-1 종료 화면)

B. 공개 전환 (U-D1·U-D3 수정 빌드로, 사용자 확인 뒤)
1. 수정 빌드 업로드 → `unity-test`에서 확인
2. 빌드 → 그 BuildID를 `default`로 공개
3. 설치 → 일반 → 실행 옵션 0을 `EXODUSER-Unity.exe` / `-force-d3d11 --remodel3d --unity-build-flavor demo`로 수정, 옵션 1 삭제 → 게시
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
