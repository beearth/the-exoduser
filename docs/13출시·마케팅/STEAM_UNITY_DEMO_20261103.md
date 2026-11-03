> 2026-11-03 21:10 후속 소스 수정: U-D3 제품명·빌드 초기화 정식명, U-D4 flavor 저장 분리와 원본 보존 이전, U-D1 29언어 표/locale API, U-D5 본편 상점 버튼을 구현했다. PC 계약6/6·격리 동작58/58, Mac 검수 대기. ar은 기존 IMGUI 영문 폴백 유지. U-D2 보류. [구현·보존 계약·검수 인자](../engine/UNITY_DEMO_FLAVOR_20261103.md). 아래 26404441은 수정 이전 업로드 이력이며 새 업로드·공개는 하지 않았다.

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
| 로그 | `G:exoduser-steamoutputdemo-unityapp_build_5337590.log`·`depot_build_5337591.log` |

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

| 항목 | 현재 | 바꿀 것 |
|---|---|---|
| 스크린샷 | 웹판 게임 화면 | Unity 1-1 화면(1920×1080, HUD 포함/미포함 섞어 5장 이상). 촬영은 무창 캡처, 화면 점 0 확인 |
| 트레일러 | 웹판 편집본 | Unity 1-1 플레이 영상으로 교체(트레일러 담당 후속) |
| 짧은 설명·상세 설명 | 웹판 기준 문구 | 체험판 범위(1-1 · 다크드루이드 · 약 1~2시간) 반영 문단 추가, 그래픽 표현 문장 Unity 기준으로 |
| 캡슐·라이브러리 이미지 | 09월 로고·키아트 | 11-03 타이틀 리마스터 로고와 맞는지 디자인총괄 판정 후 교체 여부 결정 |
| 시스템 요구 사항 | 웹(NW.js) 기준 | Unity Windows 플레이어 기준(DirectX 11, GPU·메모리·용량 6.2GB+)으로 갱신 |

실제 업로드된 상점 이미지 목록은 상점 페이지 편집 화면에서 다시 읽어 확정한다.

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
