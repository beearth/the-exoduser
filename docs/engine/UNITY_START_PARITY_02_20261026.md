# UNITY-START-PARITY-02 — 독립 시작 바닥광원 GPU 검수

상태: GPU 대기. 이전 34927cd7125673f1013ebc2854cb716ba993e0b4 / runtime 84ee74a573ff147f706f6fe4d297e7a77cfcf841 인수. 최종 판정은 외부 `_out/UNITY-START-PARITY-02/DONE.txt`와 실측 근거에서 확정한다.

| 항목 | 현재 계약 / 범위 |
|---|---|
| 바닥광원 | 원본 dee094fd 25502/51944 `_ptLight`, 640² / r320, RGBA(255,190,90,.28) → .4:(220,120,40,.13) → 1:0. 인수 코드/PNG 불변 |
| 이름 배지 | NativeGame.OnGUI는 ActiveCharacterName만 표시. 일반 실행에도 붙던 ` · 미리보기` / ` · Preview` 접미사 제거, 패널·좌표·게임플레이 불변 |
| QA 이름 | `시작검수`는 --unity-startup-capture + -startParity true의 StartParityCapture에서만 생성. Settings QA product/identifier, 절대 output, 격리 roster, nativeSettingsStore null 검증 뒤 실행. 일반 실행에서 생성하지 않음 |
| GPU | 사용자38141/48476/52157 제외, 타 Editor/QA Player는 5분 간격 최대90분 대기. 타 프로세스 종료0 |
| 실행 계획 | 기존 ARM64 Build1 / 자연54tick 시작+900프레임 측정1 / HUD1 / practice1. 웹 기존54tick PNG 재사용. 새 테스트 파일0 |
| 보호 | NativeLobby.cs/NativeLobbyVideo.cs/audio/intro-silence fixture/UNITY-MAC-20261024 WIP 변경·병합0. NativeGame.cs는 이름 배지1hunk만 |

맵 geometry·배치·충돌·아트 제작은 하지 않는다. MAP PRODUCTION GUIDELINE v0.9 전체를 읽고 START CAMERA/TECH QA만 적용한다. 기술 PASS를 전체 맵 시각 PASS로 확대하지 않는다.
