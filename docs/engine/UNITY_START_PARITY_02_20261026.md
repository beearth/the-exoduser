> 2026-10-26 최신03: 블룸의GPU source-over복원으로r20차+6.842223→+1.568692,r260+6.781058→+4.039426. 54tick/ARM64/900프레임/HUD55/practice5단회인수. 잔차로 **RETOUCH**, worktree보존. [최종03](UNITY_START_PARITY_03_20261026.md). 아래는이전차수이력.

> 2026-10-26 후속03: 블룸 GPU 일반합성 오류를 분리·교정한 후보와 새 실측은 [UNITY-START-PARITY-03](UNITY_START_PARITY_03_20261026.md)를 따른다. 아래02 수치는 당시 이력이다.

# UNITY-START-PARITY-02 — 독립 시작 바닥광원 GPU 검수

상태: **IMPLEMENTED_UNVERIFIED / VISUAL VERDICT: RETOUCH**. 이전 34927cd7125673f1013ebc2854cb716ba993e0b4 / runtime 84ee74a573ff147f706f6fe4d297e7a77cfcf841 인수. 최종 판정은 외부 `_out/UNITY-START-PARITY-02/DONE.txt`와 실측 근거에서 확정한다.

| 항목 | 현재 계약 / 범위 |
|---|---|
| 바닥광원 | 원본 dee094fd 25502/51944 `_ptLight`, 640² / r320, RGBA(255,190,90,.28) → .4:(220,120,40,.13) → 1:0. PNG byte 불변, 합성 방식 교정 |
| 이름 배지 | NativeGame.OnGUI는 ActiveCharacterName만 표시. 일반 실행에도 붙던 ` · 미리보기` / ` · Preview` 접미사 제거, 패널·좌표·게임플레이 불변 |
| QA 이름 | `시작검수`는 --unity-startup-capture + -startParity true의 StartParityCapture에서만 생성. Settings QA product/identifier, 절대 output, 격리 roster, nativeSettingsStore null 검증 뒤 실행. 일반 실행에서 생성하지 않음 |
| GPU | 사용자38141/48476/52157 제외, 타 Editor/QA Player는 5분 간격 최대90분 대기. 타 프로세스 종료0 |
| 실행 계획 | 기존 ARM64 Build1 / 자연54tick 시작+900프레임 측정1 / HUD1 / practice1. 웹 기존54tick PNG 재사용. 새 테스트 파일0 |
| 보호 | NativeLobby.cs/NativeLobbyVideo.cs/audio/intro-silence fixture/UNITY-MAC-20261024 WIP 변경·병합0. NativeGame.cs는 이름 배지1hunk만 |

맵 geometry·배치·충돌·아트 제작은 하지 않는다. MAP PRODUCTION GUIDELINE v0.9 전체를 읽고 START CAMERA/TECH QA만 적용한다. 기술 PASS를 전체 맵 시각 PASS로 확대하지 않는다.


## 실제 첫 GPU 시각 실패와 원본 합성 교정

원본 snapshot SHA256 dee094fd165e9b2fb3fbf0eb9cacc3bc3eddeb2c8eeea9c4772ba6cbc1f05209. 원문25502/51944는 lighter로 요청하지만 **GPU proxy6028의 globalCompositeOperation setter는 무동작**이다. _clearFrame5715은 pipeN,5592의 일반 blend는 SrcAlpha/OneMinusSrcAlpha,5606의 sampler는 linear다. 기존 PNG·640²/r320·stops 수치는 맞지만 KiSlashAdditive/One One과 Point sampling을 적용한 이전 후보는 실제 Mac WebGPU 경로와 달랐다.

| 교정 | 이전 후보 | 원본 GPU 계약으로 교정 |
|---|---|---|
| shader | KiSlashAdditive, p.rgb*p.a / One One | SourcePlayerFloor, straight RGBA / SrcAlpha OneMinusSrcAlpha |
| texture filter | Point | Bilinear (source linear sampler) |
| 원본 bitmap/stops | 640²/r320, .28/.13/0 | byte·수치 불변 |
| draw order | −19999 | 불변, actors 아래/field postprocess 이전 |
| 자원 수명 | 최초로드1/Material1/Sprite1 | 그대로, 프레임별 load/할당 추가0, RT 추가0 |
| 첫 측정 | r20 U78.277/W63.383; r40 U80.169/W60.632; r60 U76.392/W56.574 | 가산 과다 확인, 원본합성 교정 뒤 해당시작 capture-only1회 예정 |

첫빌드 b03cb9ed6 ARM64/errors0. 자연 Curtain54ticks/held5/active0/irisTarget4, mean8.640281866/p95 9.303167462/p99 11.413166299ms,900frames/running900/focus900/targetRecreates0. Release profilerGcValid=false이므로 raw0을 GC0 인증으로 해석하지 않는다. HUD55/practice5 PASS(11kills·원본run복원true). 세 항목은 요청대로 재실행하지 않는다. 교정 뒤 성능은 별도 재측정하지 않았다고 명시한다.


## 최종 GPU 결과 — 추가 실행 중지

**IMPLEMENTED_UNVERIFIED / VISUAL VERDICT: RETOUCH.** 02에서 독립 바닥빛의 실제 ARM64 렌더·54tick·900프레임·HUD55/practice5를 인수했다. 첫 가산 과다를 원본 GPU normal alpha/linear로 교정하고 해당 시작장면만1회 재촬영했지만 r40=71.135259 대60.631586(+10.503673)가 남아 VERIFIED 아님. 성능8.640282/p95 9.303167/p99 11.413166ms는 합성 교정 전02 빌드의1회 측정이며 최종 합성 뒤 재측정0. worktree 보존.

실제 최종 렌더 코드 `df7e5bb011d7f87cc8f6d508d1bf6c802364c183`, Unity6000.6.7f1/ARM64 Release/errors0/2,010,502,006B. 최초02 빌드는 b03cb9ed66b3c3afaad0c8a759bba1607ac096b4/2,010,497,622B다. 두 실제빌드는 각각1회이며 빌드 실패0이다. 시작 시각 항목은 최초 가산 과다, 교정후 밝기 잔차로 두 번 RETOUCH이며 사용자 규칙에 따라 더 튜닝하거나 재촬영하지 않았다.

원본 byte·320px 감쇠·색계열·source-over 합성 누락은 교정했다. 여전히 Unity 중심 근방은 밝으며 r20 +6.842223, r40 +10.503673, r60 +11.191824 Y′다. 원본 stop을 임의로 낮춰 잔차를 가리지 않았다. 배경/field grade/가림/actor 차이도 있어 잔차 전부가 바닥bitmap 때문이라고 단정하지 않는다. r0은 본체pixel로 +109.250400이며 actor mask없는 이 방법으로 바닥 광량으로 해석할 수 없다. 전체 UI/미니맵/전경/본체 방향·실습 완전 parity는 이번 범위 밖이며 기존 차이가 보인다.

`captures/start_compare_1x.png`는3840×1080, 왼쪽 최종Unity/오른쪽 기존WEB1920×1080(새웹촬영0)을 리샘플 없이 나란히 결합했다. `player_4x.png`는각(800,374,320,320)을nearest4x,2560×1280. 두 결과 모두 실제 열어 시각 확인했다. 초회비교는 captures-initial 및 initial-radial-*에 보존했다. 최종captures/manifest.json에원본경로/SHA256/크기/crop 기록.

### 방사 밝기 전체표

중심(960,534),r0..600/20,각1440,좌표floor(v+.5),공통0≤x<1920/60≤y<840. encoded sRGB Rec709 Y′=.2126R+.7152G+.0722B(0..255),선형광량 아님,actor mask0. r0는같은pixel1440번;외측ring에UI/배경 차이 포함. 원시 CSV/JSON과 radial-method.json 별도 보존.

| r px | Unity final | WEB54tick | U−W | samples |
|---:|---:|---:|---:|---:|
| 0 | 193.594200 | 84.343800 | 109.250400 | 1440 |
| 20 | 70.224776 | 63.382552 | 6.842223 | 1440 |
| 40 | 71.135259 | 60.631586 | 10.503673 | 1440 |
| 60 | 67.765538 | 56.573714 | 11.191824 | 1440 |
| 80 | 61.386451 | 52.051546 | 9.334905 | 1440 |
| 100 | 57.392038 | 48.543864 | 8.848175 | 1440 |
| 120 | 54.622588 | 46.170673 | 8.451915 | 1440 |
| 140 | 50.056363 | 42.527548 | 7.528815 | 1440 |
| 160 | 47.203645 | 39.998130 | 7.205515 | 1440 |
| 180 | 45.758233 | 38.197874 | 7.560359 | 1440 |
| 200 | 43.230974 | 36.232105 | 6.998869 | 1440 |
| 220 | 41.341006 | 34.541855 | 6.799151 | 1440 |
| 240 | 39.738523 | 33.097706 | 6.640816 | 1440 |
| 260 | 38.633046 | 31.851988 | 6.781058 | 1440 |
| 280 | 38.003126 | 31.156702 | 6.846425 | 1440 |
| 300 | 38.339472 | 30.993772 | 7.345700 | 1440 |
| 320 | 38.244202 | 31.526271 | 6.717931 | 1301 |
| 340 | 37.682133 | 31.029975 | 6.652158 | 1231 |
| 360 | 37.382922 | 30.961648 | 6.421274 | 1185 |
| 380 | 36.007810 | 29.690133 | 6.317677 | 1149 |
| 400 | 35.781884 | 29.558615 | 6.223269 | 1119 |
| 420 | 35.099521 | 29.127706 | 5.971814 | 1093 |
| 440 | 34.212240 | 28.987999 | 5.224241 | 1071 |
| 460 | 34.163264 | 28.380455 | 5.782809 | 1053 |
| 480 | 33.681365 | 27.999066 | 5.682299 | 968 |
| 500 | 33.959474 | 27.894998 | 6.064476 | 874 |
| 520 | 33.258071 | 28.768411 | 4.489660 | 814 |
| 540 | 32.899982 | 26.190785 | 6.709198 | 766 |
| 560 | 33.401217 | 25.311335 | 8.089882 | 728 |
| 580 | 32.316149 | 25.318801 | 6.997348 | 694 |
| 600 | 30.566439 | 27.290097 | 3.276342 | 664 |

### 실행 횟수·성능·보호

| 항목 | 실제 결과 |
|---|---|
| GPU 대기 | 2026-10-26 22:03:10 KST에 타QA1652 확인,22:08:20의5분확인에서 사용자3개만 남음. 사용자38141/48476/52157는 대기사유 제외. 이후각GPU실행직전 타Editor/QA없음 확인 |
| ARM64 | 최초1/합성교정후1,둘다exit0/errors0. 무수정 실패 재빌드0 |
| 시작 | 최초54tick/교정후54tick,active0/held5/irisTarget4/t104. 교정후 --lighting-capture-only로 해당시작만1회. 실제 ordinary entry callback,OS입력검수 아님 |
| 성능 | 최초02 b03cb9ed6 natural lesson intro,180 warmup/900frames,cap120/vsync0. mean8.640281866408056/p95 9.303167462348938/p99 11.413166299462318ms. running/focus/render/cache900/900,RT재생성0. corrected df7e5bb01의성능재측정0,성능인증확대0 |
| GC/리소스 | release profilerGcValid=false,raw update/render0은GC0인증 아님. 새floor 경로는최초PNG로드/Sprite/Material1회,프레임별위치/visible만,자원로드/새할당 추가0은코드검토근거. corrected shader는추가pass/RT/texture없음 |
| HUD | --unity-hud-blend-smoke1회,exit0/55checks/0failures,720/1080 idle·charge PNG4개 |
| practice | --unity-first-practice-capture1회,exit0/5checks/0failures/11kills,player/config/resources/RNG/clock/actors/originalReference복원true. 2조건범위,전체실습완료 아님 |
| QA 라벨 | 최종캡처좌상단 시작검수는StartParityCapture의격리캐릭터이름. 일반실행에서해당이름자동생성없음. 일반이름에붙던미리보기/Preview접미사는NativeGame.cs1hunk로삭제. 일반사용자저장접근/정상실행추가0,실제일반화면재촬영0(소스분기검토) |
| 실패·보정 | 시각 RETOUCH2회 후중지. Unity빌드/프로그램test실패0,무수정실패반복0,새진단test파일0. 최초prelaunch byte감사에서생성scene차이를제외하도록감사범위수정(당시Editor시작0);기본python Pillow없음은기존image-tools venv로해결,새GPU촬영아님 |
| Git hook | 첫commit시CHANGELOG_SYNC누락거부1회,해당로그추가후정상통과. hook비활성/우회0 |
| 프로세스 | 자기Editor2317/2575,Player2447/2483/2497/2658 모두exit0. 타프로세스종료0. 최종사용자3Player생존확인 |
| 보호 | NativeLobby.cs/NativeLobbyVideo.cs/audio/intro-silence fixture/UNITY-MAC-20261024 WIP 변경·병합0. 공용NativeGame.cs추가1hunk(이름배지접미사제거)만,외부NativeGame-hunks.patch |
| 저장·배포 | output안격리roster만,actual사용자저장폴더접근0. main push/force/reset/rebase/-A0. PC/main/기존사용자실행창업데이트/Steam배포0 |
| 후속 | 최종완전시각일치·최종성능미검증,worktree보존. 추가실행/백로그확장0 |

## MAP PRODUCTION REPORT (§23)

| 구분 | 결과 |
|---|---|
| STAGE | CH1-1 START camera / 바닥빛GPU QA만 |
| MASTER | silhouette/regions/main route/side spaces변경0 |
| OUTER MASS | LEFT/RIGHT/TOP/SOUTH/major holes변경0 |
| LARGE | source assets/composites/overlap/repeated silhouette변경0 |
| MEDIUM | connections/remaining holes제작변경0 |
| GROUND | 원본640²floor bitmap유지,합성normal alpha/linear복원. contamination/structure배치변경0 |
| PLAYABLE | main arenas/travel/breathing/threat space변경0. dense combat미실시;START동결장면읽힘만관찰 |
| LANDMARK | primary/secondary/tertiary변경0 |
| CAMERA QA | START실제1x/4x RETOUCH. EARLY/ARENA/SIDE L/SIDE R/LANDMARK/LATE/EXIT이번미실시 |
| TECH QA | route/collision/seam전수재시험없음(geometry불변). build/runtime에shader-error/exception표식0. field전체loading/404인수아님;성능1회/최종재측정0은위표 |
| FILES | NativeFieldLighting/SourcePlayerFloor shader/meta·NativeGame이름1hunk·관련docs. unrelated0 |
| GIT | 경로지정stage/commit·동일전용branch비강제push. 최종SHA/원격영수증은외부DONE. deploy0 |
| VISUAL VERDICT | RETOUCH — VERIFIED아님 |
| NEXT PASS | 웹과남은r20..180밝기차이·최종성능을미검증으로인계. 사용자2회실패중지규칙으로추가실행0 |
