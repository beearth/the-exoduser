# Mac 로비 문구와 미리보기 진입 정리 — 2026-10-25

NativeLobby.DrawLobby 표시 구역만 변경했다. 좌상단의 UNITY PORT/OFFLINE/검수본·개발 검수·임시 전투 오버레이와 우측 UNITY 꼬리표를 제거해 시네마틱 영역을 비웠다. 기존 미리보기 진입은 우측 패널 아래로 옮겼으며, 저장되거나 정식 캐릭터가 생성되는 기능으로 표시하지 않는다.

| 표시/동작 | 현재 상태 |
|---|---|
| 새 캐릭터·정식 ENTER | 기존 비활성 상태 유지 |
| 미구현 안내 | 새 캐릭터 아래 y570에 ‘캐릭터 생성과 저장은 아직 지원되지 않습니다.’ 표시. 영어 문구도 제공 |
| 미리보기 | x1392/y962/w480/h48의 ‘플레이 미리보기’. 기존 SelectPreview→EnterNativeTest 호출 그대로 |
| 미리보기 안내 | y1018에 ‘미리보기의 진행 상황은 저장되지 않습니다.’ 표시. 영어 문구도 제공 |
| 시네마틱·종료·Steam | 기존 표시 위치와 동작 유지 |
| 코드 범위 | NativeLobby.cs의 DrawLobby만 변경. Core/NativeGame/NativeLobbyVideo/영상·음원·자막·offset/HUD/인벤/저장 무변경 |

## 새 검수

처음 사용한 Documents 아래 QA 프로젝트에는 NativeGame 2.cs/NativeGame.LobbySmoke 2.cs와 TypeDb-All 2.json, Assembly-CSharp 2.dll 등 복제 파일이 존재했다. 최초 컴파일 실패와 이후 Succeeded이지만 errors106인 결과를 그대로 보존했다. BuildReport의 실제 오류는 중복 TypeDB 등록이었다. 복제 소스/meta는 diagnostics/duplicate-scripts-lobby-copy에 원본 SHA와 함께 보존했으며 생성 원인은 단정하지 않는다.

소유 저장소의 Assets/Packages/ProjectSettings만 새 경로 `/Users/fordeargamers/exoduser-wt/_out/UNITY-MAC-LOBBY-20261025/project`로 복사해 487파일/414,866,277bytes의 SHA를 대조했다. 캐시·진단 파일은 복사하지 않았다. 이 새 프로젝트의 Unity6000.6.7f1 ARM64 일반 빌드는 Succeeded/errors0/1,406,121,879bytes다.

CUA로 일반 앱을 열고 Return 및 ESC 6초 유지로 로비에 진입했다. 실제1920×1080 게임 화면에서 오버레이 제거, 우측 미리보기 버튼, 저장/생성 미지원 안내, 비활성 ENTER를 확인했다. 새 문구와 기존 Steam 안내/버튼은 겹치지 않았다. 실제 화면은 이 작업 채팅의 CUA 이미지에 남아 있으며 별도 로컬 PNG를 생성했다고 주장하지 않는다. 앱은 검수 후 종료했다.

113초/20검사·pause/focus9검사는 이번에 재실행하지 않았다. 마우스 직접 클릭, 이번 영문/720p/초광폭 표시, 최종 디자인 인수는 별도 미검수다. [빌드·실패 보존·관측 영수증](UNITY_MAC_LOBBY_COPY_20261025.json).

## 바로 이어갈 단위

로비 언어 선택 표시를 정리한다. 현재 Language=fr 등이어도 로비는 English로 표시하며 버튼은 ko/en만 토글한다. 자막29언어와 ko/en 메뉴 문구 fallback의 경계를 분명히 표시한다. NativeLobby 연결은 이 Mac 담당, 원본 locale alias resolver의 순수 모듈과 검사는 별도 Mac 지원 담당이 맡는다. 지원 모듈은 산출물 폴더에서 받아 정상 통합하며 공유 INDEX를 건드리지 않는다. 영상/offset/저장/자동화는 변경하지 않는다.


2026-10-25 Mac 캐릭터 후속: 생성/선택의 세션 UI와 native preview 이름 전달을 연결했다. 원본 전사만 생성·최대5슬롯·이름 규칙 유지. 영속 저장/기존 슬롯/계정은 미연결. 최신 범위와 검수는 [UNITY_MAC_CHARACTER_UI_20261025](UNITY_MAC_CHARACTER_UI_20261025.md)를 따른다.
