# Mac Unity 시작→필드 실키보드 QA — 2026-10-27

2026-10-29 후속 실제 입력은 첫 연습 1~9단계를 완료했다. 10단계 동시 방향+Space는 현 CUA 입력 수단에서 0/5이며, 첫 연습 전체·일반 몹·드롭은 아직 HOLD다. [후속 판정](UNITY_MAC_PRACTICE_MOUSE_BRIDGE_20261029.md).

> 후속 독립 순회에서 같은 QA 앱의 정본 세계관 영상이 입력 없이 자동 로비 전환됨을 확인했다. 그 자연완주 범위와 마지막 영상 프레임 미캡처 경계는 [자연완주 QA](UNITY_MAC_NATURAL_WORLD_INTRO_20261027.md)에 기록했다. 아래 표는 첫 번째 skip 순회의 당시 판정이다.

## 실행 경계

A06 source `5427869fe8cd7aa8eaf1a51505ce437bc2522496`로 이미 빌드된 ARM64 고유 앱 `/Users/fordeargamers/exoduser-wt/_out/UNITY-MAC-A06-20261027/build/EXODUSER-Unity.app`을 재사용했다. 새 빌드·소스 변경은 없다. `CFBundleIdentifier=com.fordeargamers.exoduser.a03a04qa20261027`, product `EXODUSER A03 A04 QA`. `open -n`의 최초 PID 21703과 제목 캡처용 재실행 PID 21814는 모두 `--unity-frontend-review -output /Users/fordeargamers/exoduser-wt/_out/UNITY-MAC-START-FLOW-20261027 -logFile <각 전용 로그>`를 가진 단일 QA 프로세스였고 종료했다. 이 옵션의 roster는 `<output>/character-roster-v1`에만 저장되며 설정 store는 QA 경로에서 초기화되지 않는다. 실행 전 그 roster는 없었고, 종료 시 revision 1, `A06QA` 한 명, selectedIndex 0이다. 원래 일반 앱 PID 38141/48476/52157은 유지했다. 사용자 roster 파일을 열거나 캐릭터를 삭제하지 않았다.

정본 세계관 `world_intro_v22b_steam.mp4`는 실행 앱의 파일 SHA-256 `3b99d59bca9d84a37bb6b49067148e1ed69fefb478ff206221b59c8c952d0b0f`로 현행 [source baseline](UNITY_SOURCE_BASELINE_20261024.md)과 일치한다. FDG/타이틀 무음은 기존 [격리 오디오 계측](UNITY_MAC_INTRO_SILENCE_20261026.md)의 31/31 계약 PASS를 인용한다. 이번 실제 화면 순회에서는 오디오 파형이나 장치 청음을 새로 측정하지 않았다. 실버테일 여성 영상은 반복 `SplashTitle` 키아트이고, 별도 캐릭터 선택 스토리나 공통 세계관 정본이 아니다.

## 실제 도달 순서와 증거

모든 이미지 원본은 `/Users/fordeargamers/exoduser-wt/_out/UNITY-MAC-START-FLOW-20261027/`에 있다. 스크린샷은 CUA가 이 고유 QA 창에서 직접 읽은 1920×1144 전체 창으로, 상단 제목막대 64px을 뺀 게임 내용은 1920×1080이다. 직접 점프 fixture는 사용하지 않았다.

| 순서 | 실제 입력·도달 | 화면·데이터 증거 | 판정·경계 |
| --- | --- | --- | --- |
| 1 FDG→여성 타이틀 | 일반 `NativeLobby.Begin()`으로 실행, FDG가 자동 진행해 여성 타이틀까지 도달 | `title-silvertail-loop.png`; 실행 로그 `fdg_intro.mp4` | 타이틀 실화면 PASS. 이번 순회에서 FDG 개별 프레임 저장은 못 했고 무음은 기존 31/31 계측 근거. 여성 타이틀은 실버테일 캐릭터 스토리가 아님 |
| 2 타이틀→문 | `Return`으로 타이틀의 문/ENTER 화면, 다음 `Return`으로 문 연출 | CUA 실화면에서 문 로고·ENTER와 열림을 확인, 실행 로그 `intro.mp4` | 키보드 전환 PASS; 이 순간의 PNG는 저장하지 않음 |
| 3 문→정본 세계관→로비 | 문 후 세계관 실제 영상 frame, `Escape` 약 5.5초 hold로 로비 | `world-intro-v22b.png`, `lobby-0-of-5.png`, 실행 앱 video SHA 일치 | 실제 UI 경로 PASS. 113초 자연 완주·개별 한글 cue·음성 출력은 이번 순회의 검증 범위 아님 |
| 4 로비→시각선택→취소 | 로비 0/5에서 `N`, 전사 선택 화면에서 `Escape` | `visual-select.png`, `creation-cancel-lobby.png` | 전사 시각선택 및 취소 후 0/5 PASS, 실제 삭제 0 |
| 5 전사 선택→이름→스토리 | 다시 `N`; 전사 아이콘 focus에서 `Tab` 6회로 생성 focus, `Return`; 이름 `A06QA` 입력 후 `Return` | `name-entry.png`, `warrior-story.png`, 격리 roster revision1/name/selected0 | 전사만 생성·저장 PASS. 스토리 영상 `warrior_story_v23_clean.mp4` 실제 frame 확인. 실버테일을 공통 스토리로 오인하지 않음 |
| 6 전사 스토리→시작 안내 | 생성 직후 첫 Esc hold는 입력 fence 중이어서 넘김이 되지 않음. release 후 `Escape` 2초 hold | `startup-guide-1.png` | 두 번째 실제 hold로 전사 스토리 종료·안내 1/4 진입 PASS. 첫 hold 실패는 입력 fence 구분, 우회 코드 변경 없음 |
| 7 안내 1→4→필드 | 각 안내 화면에서 `Return` 4회, 커튼/방벽 후 필드 | `startup-guide-1.png`~`startup-guide-4.png`, `field-hud-first-practice.png` | 네 단계 실키보드 전환과 첫 실습/필드 HUD PASS. preview/direct jump 사용 안 함 |
| 8 필드 이동 | 첫 실습에서 `W` 1초 hold | `field-after-w.png`의 이동 체크·캐릭터 화면 위치 변화 | 실제 키보드 이동 PASS. 좌클릭 처치·물리 마우스 hit/슬롯·첫 실습 완료는 HOLD |

이번 판정은 **시작→로비→격리 캐릭터 생성→전사 스토리→안내→필드 HUD 실제 키보드 경로 PASS**다. 첫2실습 완료, 전체 본편, 113초 세계관 자연완주, FDG 개별 프레임/실장치 청음, 물리 마우스 조작을 이 PASS에 포함하지 않는다. 앱 재실행으로 타이틀 화면을 한 장 더 저장했으며 재실행에서도 기존 QA roster만 읽고 추가 생성·삭제·전투 저장은 없었다. 종료 후 QA PID 0, 원래 세 앱 PID 유지, Git 작업트리 clean이다.
