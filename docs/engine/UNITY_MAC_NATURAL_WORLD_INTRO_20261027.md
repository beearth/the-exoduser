# Mac Unity 정본 세계관 영상 자연완주 QA — 2026-10-27

## 격리 실행과 판정 범위

새 빌드 없이 A06 source `5427869fe8cd7aa8eaf1a51505ce437bc2522496`의 ARM64 고유 QA 앱을 사용했다. bundle ID `com.fordeargamers.exoduser.a03a04qa20261027`, 단일 PID `22329`, 명령행은 `--unity-frontend-review -output /Users/fordeargamers/exoduser-wt/_out/UNITY-MAC-NATURAL-INTRO-20261027 -logFile <같은 폴더>/player.log`였다. 새 절대 output에는 roster 파일이 생성되지 않았다. 일반 앱 PID 38141/48476/52157과 기존 개인 저장 파일은 열거나 종료하거나 변경하지 않았다. QA PID는 검수 뒤 종료했다.

실행 앱의 `StreamingAssets/Lobby/world_intro_v22b_steam.mp4`는 **102,204,634 bytes**, SHA-256 `3b99d59bca9d84a37bb6b49067148e1ed69fefb478ff206221b59c8c952d0b0f`로 [정본 SSOT](UNITY_WORLD_INTRO_CANONICAL_20261025.md)와 일치한다. 이전 전용 Player 계측의 native `VideoPlayer.duration=113.667s`와 실제 113.63s 자연완주 기록은 참고 근거이며, 이번 일반 UI 순회에서 `VideoPlayer.time`/frame/peak를 직접 계측한 값이 아니다.

## 실제 UI 순회

`NativeLobby.Begin()`의 일반 FDG→실버테일 반복 타이틀을 지나 `Return`으로 제목문의 ENTER에 도달하고, 다음 `Return`으로 문을 열었다. 그 뒤에는 키보드·마우스 입력이나 skip 호출 없이 **화면 관찰만** 했다. 원본 PNG와 시간 기록은 `/Users/fordeargamers/exoduser-wt/_out/UNITY-MAC-NATURAL-INTRO-20261027/`에 있다. 시간은 `milestone-times.json`의 단조 증가 wall 관찰 차이이며 영상 내부 재생 시각이 아니다.

| 관찰점 | 문 ENTER 이후 wall | 첫 영상 관찰 이후 wall | 화면 증거와 판정 |
| --- | ---: | ---: | --- |
| 문 ENTER | 0s | — | `gate-enter.png`, 실제 `Return` 입력. 이후 입력0 |
| 세계관 첫 관찰 | 19.763s | 0s | `world-start.png`: 행성 장면, 한국어 자막, 언어 선택. 영상은 이 캡처보다 먼저 시작했을 수 있음 |
| 세계관 중간 관찰 | 79.108s | 59.345s | `world-middle.png`: 다른 거대 몬스터 장면·다른 한국어 자막. 눈에 띄는 단일 정지 화면은 아님 |
| 종료 뒤 로비 관찰 | 129.133s | 109.370s | `lobby-natural.png`: 캐릭터 0/5 로비 자동 표시, 실제 skip 입력0. 마지막 영상 프레임 자체는 이 캡처 전 사이에 지나가 별도 저장되지 않음 |

**판정: 정본 영상의 일반 UI 경로 자연 로비 전환 PASS.** `NativeLobby.Update`의 WorldIntro 경로는 `movie.Ended`일 때 `WorldEndedNaturally=true; FinishIntro()`로 로비에 도달하며, 이 실행에는 세계관 진입 이후 사용자 입력이 없었다. 이는 자동 종료 경로라는 코드·관찰 결합 추론이다. 관찰 시각만으로 영상 길이, 정확한 마지막 frame, 모든 중간 frame의 연속성, 오디오 음성·BGM·장치 청음, 정밀 frame gap을 새로 PASS 처리하지 않는다. 마지막 영상 프레임의 별도 PNG는 **HOLD**이며, 자동 로비 전환 화면은 확보했다. Player 로그에는 `world_intro_v22b_steam.mp4`의 AVFoundation 색 원색 정보 fallback 경고 한 건이 보였고, 세계관 관련 예외·buffer 오류·명백한 정체 기록은 없었다.

FDG 개별 frame과 FDG/실버테일 타이틀의 무음은 이번 순회의 직접 캡처/파형 검사가 아니다. [기존 무음 계측](UNITY_MAC_INTRO_SILENCE_20261026.md)의 31/31과 원본 mute 계약만 인용한다. 실버테일 여성 화면은 `SplashTitle` 반복 키아트로, 비전사 캐릭터 스토리나 정본 세계관 영상과 구분한다. 현재 Mac 전사 스토리 flow와 비전사외형 WIP는 변경하지 않았다. `docs/engine/orders/PC_TO_MAC_INBOX_20261021.md`의 해당 최신 기록은 2026-10-26 무음·실버테일 범위 회신이며, 이번 단위에 새 코드 인수 지시는 확인되지 않았다.
