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


## 실제 첫 GPU 시각 실패와 원본 합성 교정

원본 snapshot SHA256 dee094fd165e9b2fb3fbf0eb9cacc3bc3eddeb2c8eeea9c4772ba6cbc1f05209. 원문25502/51944는 lighter로 요청하지만 **GPU proxy6028의 globalCompositeOperation setter는 무동작**이다. _clearFrame5713은 pipeN,5592의 일반 blend는 SrcAlpha/OneMinusSrcAlpha,5614의 sampler는 linear다. 기존 PNG·640²/r320·stops 수치는 맞지만 KiSlashAdditive/One One과 Point sampling을 적용한 이전 후보는 실제 Mac WebGPU 경로와 달랐다.

| 교정 | 이전 후보 | 원본 GPU 계약으로 교정 |
|---|---|---|
| shader | KiSlashAdditive, p.rgb*p.a / One One | SourcePlayerFloor, straight RGBA / SrcAlpha OneMinusSrcAlpha |
| texture filter | Point | Bilinear (source linear sampler) |
| 원본 bitmap/stops | 640²/r320, .28/.13/0 | byte·수치 불변 |
| draw order | −19999 | 불변, actors 아래/field postprocess 이전 |
| 자원 수명 | 최초로드1/Material1/Sprite1 | 그대로, 프레임별 load/할당 추가0, RT 추가0 |
| 첫 측정 | r20 U78.277/W63.383; r40 U80.169/W60.632; r60 U76.392/W56.574 | 가산 과다 확인, 원본합성 교정 뒤 해당시작 capture-only1회 예정 |

첫빌드 b03cb9ed6 ARM64/errors0. 자연 Curtain54ticks/held5/active0/irisTarget4, mean8.640281866/p95 9.303167462/p99 11.413166299ms,900frames/running900/focus900/targetRecreates0. Release profilerGcValid=false이므로 raw0을 GC0 인증으로 해석하지 않는다. HUD55/practice5 PASS(11kills·원본run복원true). 세 항목은 요청대로 재실행하지 않는다. 교정 뒤 성능은 별도 재측정하지 않았다고 명시한다.
