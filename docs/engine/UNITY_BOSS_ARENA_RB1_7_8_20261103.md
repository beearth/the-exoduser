# RB1-7 / RB1-8 구현 기록 — 2026-11-03

최신 병합: origin/unity/main 309892b1da390a6ac7218d2935ca0e808157c7a8 (merge 51e0b30e77). 작업본 G:/exoduser-wt/codex-boss-arena, 브랜치 codex/unity-boss-arena-20261103. 20:25/21:00/21:35/21:45 및11-04 00:50/01:20/03:00 실제시각 CTO 결정을 적용한다. PC는 CPU 하니스·Roslyn 컴파일, Player 빌드·화면·성능 판정은 Mac 담당이다.

## RB1-7 현재 상태

21:00 정정 적용: 채찍 AI160·타격/예고300, 돌진 추가 접촉120. CPU 전투 검증 PASS. 실제 플레이 판정 미검증. [정본 §13](UNITY_BOSS_RM1_DARK_DRUID_20261027.md#13-rb1-7--첫-보스-재기획-반영-보스전-카메라-줌--기술-7개-수치-2026-11-03-보스전-총괄-명세).

| id(원래 슬롯 유지) | P | tele | active | rec | cd | 크기 |
|---|---|---|---|---|---|---|
| slashCombo | 1·2·3 | 36/26/26 | 각10, HitAt8 | 84 | 120 | AI160 / 실제 추가 도달300 |
| slam | 1·2·3 | 52 | 6 | 76 | 160 | r260 |
| charge | 1·2·3 | 58 | 최대40,22px/틱 | 74 | 130 | 추가 접촉120 / 전폭2×(R+pr+120) |
| grab | 1·2·3 | 64 | 덮치기20,9px/틱,흡수120 | 빗나감84/던진뒤60 | 200 | GrabContact150(+120) |
| burrowStrike | 2·3 | 56 | 땅속45/솟기예고34 | 76 | 220 | 기둥 옆 |
| groundFissure | 2·3 | 42 | 머리14px/틱 | 60 | 160 | 기존 |
| heartbeat | 3 | 90/60/60 | 간격30 | 90 | 2400 | 발치r260+기둥그림자 |

fan/chaseAoe/summon/tideWave/seekerMines는 슬롯·실행기를 남기고 Phase 비움. 콤보 C1·C2(P1~3), C4·C7(P2~3). WalkStandOff220, 걷기1.1/가속20/정지12/회전3°·2°/조준고정12/빈시간45·36·30/연계12는 기존 계약. SFX 데이터 참조 지연은 채찍38/28/28틱·내려찍기58틱(청취 미검증).

## 검증과 잠행 실패 정정

- 이전41d16c6dd는 데이터 부분구현·잠행18실패 체크포인트였다. 재개 전 하니스를 재실행하지 않고 원인을 분리했다.
- 실제 BurrowTarget 출현오차0. HurtEnemy의 넉백0.75px가 출현 뒤 누적되어 9번째틱에 반경오차3.02545px. 검사 전제가 잘못돼, 출현 전·첫 출현은 기존3px 한계, 이후는 예고중심=실제 보스 위치0.001px로 구분했다. Core의 잠행 위치·넉백 수정0.
- 새 실제 피해 경계 테스트 RED4건 확인 뒤 드루이드 전용 값 연결. 처음 GREEN 검사에서 예고상수 연결누락 및 기존 채찍전진2.5px를 빼먹은 테스트 배치2건을 확인·수정했다.
- 21:00 정정 후 최종 druid-remodel99210/0, remodel-frame124/0. 이전 후보의 flag-off 웹 oracle은48케이스·54400틱·5421635검사/0불일치(이번 미재실행). 로그는 레인 폴더 DruidRemodelTests.out.log·DruidBossTests.out.log·burrow-origin-probe.out.log.
- 전체 디자인·Player·60fps PASS 아님. Mac 같은 SHA1920/3840 실제 플레이 판정 대기.

## RB1-8 Mac FAIL 수정 후보 (21:35/21:45)

origin/unity/main 2b1bbf2a0 병합. 정본 [RM1 §14.5](UNITY_BOSS_RM1_DARK_DRUID_20261027.md#145-2135-mac-fail-수정-및-2145-거리-정정--mac-재검수-후보)의 7개 항목을 구현했다. 34°/16.5/FOV46.9453/전방1.45 고정·영웅 필드 크기 유지·보스 영웅 모델 높이×2.8. 원근이 같은 필드±5%가 영웅 판정 기준이며10~12%는 폐기됐다. 회색 수직벽/실린더 대신 기존 A2 숲과 뿌리 모델, 남쪽 낮은 뿌리, 최전방 알파0.2 가림을 쓴다.

CPU arena44/0, 전체Roslyn5어셈블리 오류0(Core121/Runtime265/Editor57). Core 규칙 변경0, PC Player/Unity/빌드/캡처0, Library 복사0, 유료0. GPU/셰이더·필드 대비 크기·외곽 덩어리/그림자·가림·전환·7기술 실제 수집·60fps는 Mac 재검수 전이다. 이 절은21:35 후보 이력이다. 8b 소스 후보는 아래 절, 8d 미술 마감은 맵 총괄 후속이다.

## RB1-8b 11-04 00:50 소스 후보

[정본 §14.6](UNITY_BOSS_RM1_DARK_DRUID_20261027.md#146-rb1-8b-조명재질-소스-후보-11-04-0050-cto): 실제 필드 달빛/후처리 공유, A2R 원화/노멀/마스크 두 종류·흙/뿌리 혼합, Y-up 횃불2개와 실제 point light, Core 외곽1타일 독액·지면 투영 연결. 34°/16.5와 전투 규칙 불변. Meshy 저LOD는 인수 가능한 Unity 자원이 없어 기존3D 숲 유지. 원화2장을 직접 확인했고, 새 Player 화면은 PC에서 실행하지 않았다.

arena73/0. 첫 Roslyn의 GetInstanceID obsolete-error2곳을 문서 확인 후 GetEntityId로 고쳐 재검사5어셈블리 오류0(Core126/Runtime273/Editor59). 8b 소스·컴파일 후보이며, 8a/8c 및8b 시각/성능 판정은 Mac 대기다. 아레나 planar reflection·P3 수위 상승·8d 미술 마감은 이번 범위 밖이다.

## Mac 실행 인자 전체

Mac의 기존 무창 GPU 실행 경로에 아래 Player 인자를 전달한다. 실제 GPU 캡처이므로 -nographics를 쓰지 않는다. 동시 Player 없이 아래 실행을 하나씩 한다. 사용자 세이브 대신 별도 QA sandbox를 쓴다. 출력 폴더는 해상도/종류별 고정 폴더로, 재실행 때 recorder 자신의 이전 파일만 정리한다. 정상 게임 키보드·마우스 입력 수집이며 강제 직행은 기존 --unity-boss-direct의 범위다.

1920×1080 촬영:

```text
"<Mac Player 실행경로>" --remodel3d --unity-druid-remodel --unity-boss-direct 0 --unity-fullrun-qa --unity-boss-arena-review --unity-boss-arena-material-review --unity-mute -nosound --unity-qa-sandbox "<QA 루트>/profile-1920" -screen-fullscreen 0 -screen-width 1920 -screen-height 1080 -qa-width 1920 -qa-max-ticks 36000 -qa-retries 3 -output "<QA 루트>/capture-1920" -logFile "<QA 루트>/capture-1920/Player.log"
```

3840×1080 촬영:

```text
"<Mac Player 실행경로>" --remodel3d --unity-druid-remodel --unity-boss-direct 0 --unity-fullrun-qa --unity-boss-arena-review --unity-boss-arena-material-review --unity-mute -nosound --unity-qa-sandbox "<QA 루트>/profile-3840" -screen-fullscreen 0 -screen-width 3840 -screen-height 1080 -qa-width 3840 -qa-max-ticks 36000 -qa-retries 3 -output "<QA 루트>/capture-3840" -logFile "<QA 루트>/capture-3840/Player.log"
```

성능 계측(촬영/격리 GPU 측정/encode 없음):

```text
"<Mac Player 실행경로>" --remodel3d --unity-druid-remodel --unity-boss-direct 0 --unity-fullrun-qa --unity-boss-arena-review --unity-boss-arena-material-review --unity-boss-arena-metrics-only --unity-mute -nosound --unity-qa-sandbox "<QA 루트>/profile-perf-1920" -screen-fullscreen 0 -screen-width 1920 -screen-height 1080 -qa-width 1920 -qa-max-ticks 36000 -qa-retries 3 -output "<QA 루트>/metrics-1920" -logFile "<QA 루트>/metrics-1920/Player.log"
"<Mac Player 실행경로>" --remodel3d --unity-druid-remodel --unity-boss-direct 0 --unity-fullrun-qa --unity-boss-arena-review --unity-boss-arena-material-review --unity-boss-arena-metrics-only --unity-mute -nosound --unity-qa-sandbox "<QA 루트>/profile-perf-3840" -screen-fullscreen 0 -screen-width 3840 -screen-height 1080 -qa-width 3840 -qa-max-ticks 36000 -qa-retries 3 -output "<QA 루트>/metrics-3840" -logFile "<QA 루트>/metrics-3840/Player.log"
```

각 출력/arena-review/review.json의 missing·missingScreenshots가 빈 배열인지 먼저 확인한다(metrics-only는 PNG 미요청). 7/7 라벨은 시각 판정이 아니다. moves.jsonl의 actual-activation과 마지막 예고 경계, same-frame PNG/JSON을 대조한다. warning만 포착한 기술은 수집 완료로 세지 않는다. 기본 7기술이 자연 AI에서 나오지 않거나 사망하면 명시적 FAIL이므로 Mac에서 새 증거 없이 PASS로 올리지 않는다.

camera-frames.jsonl에는 실제 position/quaternion/Euler/FOV/marker 거리, 해상도, 영웅 표시 경로와 투영 bounds, 장면 상태·frame/tick·가림수·meshBuilds가 있다. 촬영 JSON의 heroGpuSilhouetteHeightPx/HeightFraction은 실제3D 모델 격리 렌더 계측(무기/망토 포함)이며, 투영 bounds와 별개다. 7기술 active-hero-isolated.png와 본 화면을 나란히 보고 몸만의 높이·가림을 판정한다. source PNG 알파 높이는 HD2D/fallback 전용이다.

진입 load/visible·퇴장·침강 start/end의0.6초 동안 매 렌더 프레임을 남긴다. PNG encode/격리GPU readback은 성능을 오염시키므로 촬영 실행의 장프레임으로175ms 개선을 단정하지 않는다. metrics-only 단독 실행의 long-frames.jsonl/Player.log에서 prepare phase·meshBuilds1·prepare/sync/mode/shader CPU 시간을 확인한다. GPU 드라이버 stall·전체 shader variants·동시 Player 오염의 최종 원인은 Mac 계측 전 미확정이다.

리뷰용 직행 인자는 CombatSaveAllowed=false라 fullrun.json의 clearSaveExists=false 및 stage-cleared-transition-blocked가 나올 수 있다. 이는 기존 fullrun 저장 기대값과 리뷰 인자의 차이다. 별도 arena-review/review.json, 실제 입장→사망/침강→출구→로비 증거 및 격리 경로를 함께 판정한다.

8b 비교: 각 capture-<해상도>/arena-review/material-comparison.html을 열어 같은 Player의 실제 필드/아레나를 Fit·Native1x로 비교한다. PNG·JSON은 material-field-reference와 material-arena-reference다. 조명은 moonEntity/profileEntity가 같은지, 실제 exposure/contrast/fog·달빛 값이 유지되는지 확인하고, surface.torches의2점광·shader·channelCells를 대조한다. 프로필 ID는 다른 Player 실행끼리 비교하지 않는다. 기본 fullrun/review의7기술 검수는 별도이며, 7기술 누락으로 FAIL이어도8b 두 비교 이미지의 존재/시각 판정은 따로 기록한다. 새 material 인자에서도 hero/HP/보스 기술 강제 변경은 없다.


## 11-04 01:20 드루이드 rig-pixel Mac 인계

Mac의 기존 무창 GPU 실행 경로에 아래 Player 인자를 전달한다. 먼저 같은 SHA의 Mac Unity Editor에서 Generic 임포트 검사를 실행한다. 실제 GPU 캡처이므로 -nographics를 쓰지 않는다. 동시 Player 없이 아래 실행을 하나씩 한다. 사용자 세이브 대신 별도 QA sandbox를 쓴다. 출력 폴더는 해상도/종류별 고정 폴더로, 재실행 때 recorder 자신의 이전 파일만 정리한다. 정상 게임 키보드·마우스 입력 수집이며 강제 직행은 기존 --unity-boss-direct의 범위다.

Mac Editor 임포트 검사(PC 실행 금지):

```text
"<Mac Unity Editor 실행경로>" -batchmode -quit -projectPath "<Mac 작업본>/unity" -executeMethod Exoduser.CharacterLab.DruidRigPixelVerification.Verify -output "<QA 루트>/import" -logFile "<QA 루트>/import/Editor.log"
```

import/druid-rigpixel-import.json의 passed=true·Generic·avatarValid=true·humanoid=false·socket=true·Idle/Walk 곡선·Fist_L/보조본10개를 확인한 뒤 같은 후보 Player를 만든다. 이 검사는 게임 화면 PASS가 아니다.

1920×1080 촬영:

```text
"<Mac Player 실행경로>" --remodel3d --unity-druid-remodel --hero-render=rigpixel --boss-render=rigpixel --unity-boss-direct 0 --unity-fullrun-qa --unity-boss-arena-review --unity-boss-arena-material-review --unity-mute -nosound --unity-qa-sandbox "<QA 루트>/profile-1920" -screen-fullscreen 0 -screen-width 1920 -screen-height 1080 -qa-width 1920 -qa-max-ticks 36000 -qa-retries 3 -output "<QA 루트>/capture-1920" -logFile "<QA 루트>/capture-1920/Player.log"
```

3840×1080 촬영:

```text
"<Mac Player 실행경로>" --remodel3d --unity-druid-remodel --hero-render=rigpixel --boss-render=rigpixel --unity-boss-direct 0 --unity-fullrun-qa --unity-boss-arena-review --unity-boss-arena-material-review --unity-mute -nosound --unity-qa-sandbox "<QA 루트>/profile-3840" -screen-fullscreen 0 -screen-width 3840 -screen-height 1080 -qa-width 3840 -qa-max-ticks 36000 -qa-retries 3 -output "<QA 루트>/capture-3840" -logFile "<QA 루트>/capture-3840/Player.log"
```

성능 계측(촬영/격리 GPU 측정/encode 없음):

```text
"<Mac Player 실행경로>" --remodel3d --unity-druid-remodel --hero-render=rigpixel --boss-render=rigpixel --unity-boss-direct 0 --unity-fullrun-qa --unity-boss-arena-review --unity-boss-arena-material-review --unity-boss-arena-metrics-only --unity-mute -nosound --unity-qa-sandbox "<QA 루트>/profile-perf-1920" -screen-fullscreen 0 -screen-width 1920 -screen-height 1080 -qa-width 1920 -qa-max-ticks 36000 -qa-retries 3 -output "<QA 루트>/metrics-1920" -logFile "<QA 루트>/metrics-1920/Player.log"
"<Mac Player 실행경로>" --remodel3d --unity-druid-remodel --hero-render=rigpixel --boss-render=rigpixel --unity-boss-direct 0 --unity-fullrun-qa --unity-boss-arena-review --unity-boss-arena-material-review --unity-boss-arena-metrics-only --unity-mute -nosound --unity-qa-sandbox "<QA 루트>/profile-perf-3840" -screen-fullscreen 0 -screen-width 3840 -screen-height 1080 -qa-width 3840 -qa-max-ticks 36000 -qa-retries 3 -output "<QA 루트>/metrics-3840" -logFile "<QA 루트>/metrics-3840/Player.log"
```

각 출력/arena-review/review.json의 missing·missingScreenshots가 빈 배열인지 먼저 확인한다(metrics-only는 PNG 미요청). 7/7 라벨은 시각 판정이 아니다. moves.jsonl의 actual-activation과 마지막 예고 경계, same-frame PNG/JSON을 대조한다. warning만 포착한 기술은 수집 완료로 세지 않는다. 기본 7기술이 자연 AI에서 나오지 않거나 사망하면 명시적 FAIL이므로 Mac에서 새 증거 없이 PASS로 올리지 않는다.

camera-frames.jsonl에는 실제 position/quaternion/Euler/FOV/marker 거리, 해상도, 영웅 표시 경로와 투영 bounds, 장면 상태·frame/tick·가림수·meshBuilds가 있다. 촬영 JSON의 heroGpuSilhouetteHeightPx/HeightFraction은 실제3D 모델 격리 렌더 계측(무기/망토 포함)이며, 투영 bounds와 별개다. 7기술 active-hero-isolated.png와 본 화면을 나란히 보고 몸만의 높이·가림을 판정한다. source PNG 알파 높이는 HD2D/fallback 전용이다.

진입 load/visible·퇴장·침강 start/end의0.6초 동안 매 렌더 프레임을 남긴다. PNG encode/격리GPU readback은 성능을 오염시키므로 촬영 실행의 장프레임으로175ms 개선을 단정하지 않는다. metrics-only 단독 실행의 long-frames.jsonl/Player.log에서 prepare phase·meshBuilds1·prepare/sync/mode/shader CPU 시간을 확인한다. GPU 드라이버 stall·전체 shader variants·동시 Player 오염의 최종 원인은 Mac 계측 전 미확정이다.

리뷰용 직행 인자는 CombatSaveAllowed=false라 fullrun.json의 clearSaveExists=false 및 stage-cleared-transition-blocked가 나올 수 있다. 이는 기존 fullrun 저장 기대값과 리뷰 인자의 차이다. 별도 arena-review/review.json, 실제 입장→사망/침강→출구→로비 증거 및 격리 경로를 함께 판정한다.

8b 비교: 각 capture-<해상도>/arena-review/material-comparison.html을 열어 같은 Player의 실제 필드/아레나를 Fit·Native1x로 비교한다. PNG·JSON은 material-field-reference와 material-arena-reference다. 조명은 moonEntity/profileEntity가 같은지, 실제 exposure/contrast/fog·달빛 값이 유지되는지 확인하고, surface.torches의2점광·shader·channelCells를 대조한다. 프로필 ID는 다른 Player 실행끼리 비교하지 않는다. 기본 fullrun/review의7기술 검수는 별도이며, 7기술 누락으로 FAIL이어도8b 두 비교 이미지의 존재/시각 판정은 따로 기록한다. 새 material 인자에서도 hero/HP/보스 기술 강제 변경은 없다.


rigpixel 확인: camera-frames.jsonl 및 same-frame JSON의 bossRig.ready=true, failed=false, sourceVersion=v7, humanoid=false, avatarValid=true, rtSize(32배수64..1024), texelScale=1을 확인한다. idle 정지는 Idle, 이동은 Walk, 기술은 missingClip=true/Idle@0이다. 각 기술의 실제 판정·예고는 기존 moves.jsonl/PNG로 별도 확인한다. 기존 bossHeroRatio=-1은 rig에서 구형 스프라이트 지표를 무효화한 값이다. 새 projectedBoundsHeightPx와 rawAlphaHeightPx는 뿌리팔·지팡이를 포함하므로 몸통/뿔 기준2.6~3.0은 실제 화면1x·3x에서 확인한다. 최신 druid-rigpixel-rt.png는 합성/가림 전 raw RT1장이며 최종화면 PASS 근거가 아니다.

Idle·Walk가 실제로 보이는 1920/3840 컷,1x·3x 크롭·10초 무음 영상, 발/지팡이 접지·뿔 상단 여백8%·발광≤0.5%·낱점0·먼 적·같은 카메라16.5/34°·60fps를 판정한다. 자연 입력에서 필요한 상태가 수집되지 않으면 누락으로 보고하며 강제로 기술/HP/위치를 바꾸지 않는다. 보조 물리·7기술·피격/사망 클립은 이번 제공 자산에 없다.


## 11-04 03:00 실제시각 v8.1 7기술 Mac 인계

Mac의 기존 무창 GPU 실행 경로에 아래 Player 인자를 전달한다. 먼저 같은 SHA의 Mac Unity Editor에서 Generic 임포트 검사를 실행한다. 실제 GPU 캡처이므로 -nographics를 쓰지 않는다. 동시 Player 없이 아래 실행을 하나씩 한다. 사용자 세이브 대신 별도 QA sandbox를 쓴다. 출력 폴더는 해상도/종류별 고정 폴더로, 재실행 때 recorder 자신의 이전 파일만 정리한다. 정상 게임 키보드·마우스 입력 수집이며 강제 직행은 기존 --unity-boss-direct의 범위다.

Mac Editor 임포트 검사(PC 실행 금지):

```text
"<Mac Unity Editor 실행경로>" -batchmode -quit -projectPath "<Mac 작업본>/unity" -executeMethod Exoduser.CharacterLab.DruidRigPixelVerification.Verify -output "<QA 루트>/import" -logFile "<QA 루트>/import/Editor.log"
```

import/druid-rigpixel-import.json의 passed=true·Generic·avatarValid=true·humanoid=false·socket=true·31클립 길이·곡선·수평 발 계약·Fist_L/보조본10개를 확인한 뒤 같은 후보 Player를 만든다. 이 검사는 게임 화면 PASS가 아니다.

1920×1080 촬영:

```text
"<Mac Player 실행경로>" --remodel3d --unity-druid-remodel --hero-render=rigpixel --boss-render=rigpixel --unity-boss-direct 0 --unity-fullrun-qa --unity-boss-arena-review --unity-boss-arena-material-review --unity-mute -nosound --unity-qa-sandbox "<QA 루트>/profile-1920" -screen-fullscreen 0 -screen-width 1920 -screen-height 1080 -qa-width 1920 -qa-max-ticks 36000 -qa-retries 2 -output "<QA 루트>/capture-1920" -logFile "<QA 루트>/capture-1920/Player.log"
```

3840×1080 촬영:

```text
"<Mac Player 실행경로>" --remodel3d --unity-druid-remodel --hero-render=rigpixel --boss-render=rigpixel --unity-boss-direct 0 --unity-fullrun-qa --unity-boss-arena-review --unity-boss-arena-material-review --unity-mute -nosound --unity-qa-sandbox "<QA 루트>/profile-3840" -screen-fullscreen 0 -screen-width 3840 -screen-height 1080 -qa-width 3840 -qa-max-ticks 36000 -qa-retries 2 -output "<QA 루트>/capture-3840" -logFile "<QA 루트>/capture-3840/Player.log"
```

성능 계측(촬영/격리 GPU 측정/encode 없음):

```text
"<Mac Player 실행경로>" --remodel3d --unity-druid-remodel --hero-render=rigpixel --boss-render=rigpixel --unity-boss-direct 0 --unity-fullrun-qa --unity-boss-arena-review --unity-boss-arena-material-review --unity-boss-arena-metrics-only --unity-mute -nosound --unity-qa-sandbox "<QA 루트>/profile-perf-1920" -screen-fullscreen 0 -screen-width 1920 -screen-height 1080 -qa-width 1920 -qa-max-ticks 36000 -qa-retries 2 -output "<QA 루트>/metrics-1920" -logFile "<QA 루트>/metrics-1920/Player.log"
"<Mac Player 실행경로>" --remodel3d --unity-druid-remodel --hero-render=rigpixel --boss-render=rigpixel --unity-boss-direct 0 --unity-fullrun-qa --unity-boss-arena-review --unity-boss-arena-material-review --unity-boss-arena-metrics-only --unity-mute -nosound --unity-qa-sandbox "<QA 루트>/profile-perf-3840" -screen-fullscreen 0 -screen-width 3840 -screen-height 1080 -qa-width 3840 -qa-max-ticks 36000 -qa-retries 2 -output "<QA 루트>/metrics-3840" -logFile "<QA 루트>/metrics-3840/Player.log"
```

각 출력/arena-review/review.json의 missing·missingScreenshots가 빈 배열인지 먼저 확인한다(metrics-only는 PNG 미요청). 7/7 라벨은 시각 판정이 아니다. moves.jsonl의 actual-activation과 마지막 예고 경계, same-frame PNG/JSON을 대조한다. warning만 포착한 기술은 수집 완료로 세지 않는다. 기본 7기술이 자연 AI에서 나오지 않거나 사망하면 명시적 FAIL이므로 Mac에서 새 증거 없이 PASS로 올리지 않는다.

camera-frames.jsonl에는 실제 position/quaternion/Euler/FOV/marker 거리, 해상도, 영웅 표시 경로와 투영 bounds, 장면 상태·frame/tick·가림수·meshBuilds가 있다. 촬영 JSON의 heroGpuSilhouetteHeightPx/HeightFraction은 실제3D 모델 격리 렌더 계측(무기/망토 포함)이며, 투영 bounds와 별개다. 7기술 active-hero-isolated.png와 본 화면을 나란히 보고 몸만의 높이·가림을 판정한다. source PNG 알파 높이는 HD2D/fallback 전용이다.

진입 load/visible·퇴장·침강 start/end의0.6초 동안 매 렌더 프레임을 남긴다. PNG encode/격리GPU readback은 성능을 오염시키므로 촬영 실행의 장프레임으로175ms 개선을 단정하지 않는다. metrics-only 단독 실행의 long-frames.jsonl/Player.log에서 prepare phase·meshBuilds1·prepare/sync/mode/shader CPU 시간을 확인한다. GPU 드라이버 stall·전체 shader variants·동시 Player 오염의 최종 원인은 Mac 계측 전 미확정이다.

리뷰용 직행 인자는 CombatSaveAllowed=false라 fullrun.json의 clearSaveExists=false 및 stage-cleared-transition-blocked가 나올 수 있다. 이는 기존 fullrun 저장 기대값과 리뷰 인자의 차이다. 별도 arena-review/review.json, 실제 입장→사망/침강→출구→로비 증거 및 격리 경로를 함께 판정한다.

8b 비교: 각 capture-<해상도>/arena-review/material-comparison.html을 열어 같은 Player의 실제 필드/아레나를 Fit·Native1x로 비교한다. PNG·JSON은 material-field-reference와 material-arena-reference다. 조명은 moonEntity/profileEntity가 같은지, 실제 exposure/contrast/fog·달빛 값이 유지되는지 확인하고, surface.torches의2점광·shader·channelCells를 대조한다. 프로필 ID는 다른 Player 실행끼리 비교하지 않는다. 기본 fullrun/review의7기술 검수는 별도이며, 7기술 누락으로 FAIL이어도8b 두 비교 이미지의 존재/시각 판정은 따로 기록한다. 새 material 인자에서도 hero/HP/보스 기술 강제 변경은 없다.


rigpixel 확인: camera-frames.jsonl 및 same-frame JSON의 bossRig.ready=true, failed=false, sourceVersion=v8.1, humanoid=false, avatarValid=true, rtSize(32배수64..1024), texelScale=1을 확인한다. idle 정지는 Idle, 이동은 Walk,7기술은 §9.1의 단계별 클립으로 전환되며 missingClip=false여야 한다. 각 기술의 실제 판정·예고는 기존 moves.jsonl/PNG로 별도 확인한다. 기존 bossHeroRatio=-1은 rig에서 구형 스프라이트 지표를 무효화한 값이다. 새 projectedBoundsHeightPx와 rawAlphaHeightPx는 뿌리팔·지팡이를 포함하므로 몸통/뿔 기준2.6~3.0은 실제 화면1x·3x에서 확인한다. 최신 druid-rigpixel-rt.png는 합성/가림 전 raw RT1장이며 최종화면 PASS 근거가 아니다.

Idle·Walk가 실제로 보이는 1920/3840 컷,1x·3x 크롭·10초 무음 영상, 발/지팡이 접지·뿔 상단 여백8%·발광≤0.5%·낱점0·먼 적·같은 카메라16.5/34°·60fps를 판정한다. 자연 입력에서 필요한 상태가 수집되지 않으면 누락으로 보고하며 강제로 기술/HP/위치를 바꾸지 않는다. 보조 물리·피격/사망 전용 클립은 없으며7기술31클립의 상태/시간 연결은 새로 포함됐다.

### 7기술 각각의 실제1x·10초 무음 영상 요청

같은 후보·같은 해상도의 자연 입력을 Mac 기존 GPU 캡처/영상 수집 경로에서 기록한다. 위 Player 인수는7기술 PNG/JSON·상태/틱 영수증을 자동 수집하며 MP4 인코더를 실행하지 않는다. 10초 영상은 Mac 실행 담당이 같은 실제 패키지에서7기술별로 수집해야 하며, PNG 몇 장을 이어 붙인 영상을 실제 연속 영상으로 세지 않는다. 각 영상은 해당 기술의 예고를 포함해10초, 무음,1920/3840 실제1x 프레임을 유지하고 고정 출력의 기술ID.mp4 하나만 남긴다. 최초 시전이 누락되거나 기술이 안 나오면 미수집으로 적는다.

| 기술ID | 1x PNG·영수증 대조 | 10초 영상에서 확인할 단계 |
|---|---|---|
| slashCombo | move-slashCombo-active.png/json·실제 MoveId | slash1~3 tele/act·회복, 실제 타격 source6f와Core2틱,3타 패링 불가 |
| slam | move-slam-active.png/json | slam_tele→act→rec, 지팡이 아래끝 접지/예고 경계 |
| charge | move-charge-active.png/json | charge_tele→run→rec, Core 이동 중복0·접촉/벽 중단·발 |
| grab | move-grab-active.png/json | tele→lunge→hold→throw 또는miss_rec, 흡수/탈출 분기 |
| burrowStrike | move-burrowStrike-active.png/json | dive→지하→erupt_warn/erupt→rec, 지면 아래 clip·출현 예고/발동 |
| groundFissure | move-groundFissure-active.png/json | tele→Core rec 안 act20/rec40, 균열 VFX와 실제 타격 시점 |
| heartbeat | move-heartbeat-active.png/json | 첫tele90·후속beat60·pause30·rec90, 실제3펄스/가슴 맥동 |

1x/3x 크롭에서는 좁은 실루엣·7예비 자세 구분·발/지팡이 접지·치마·뿔 상단8%·발광≤0.5%·낱점0·먼 적을 판정한다. bossRig의 sourceFrame/sampleSeconds/coreStageTicks/elapsedStageTicks·좌우 foot 좌표를 same-frame PNG와 대조한다. footDeltaCm는 Core 이동/회전·의도된 발 들기를 포함하고 단계 처음0으로 초기화되므로0=실제 발고정 PASS로 해석하지 않는다. 별도 metrics-only에서60fps/장프레임을 판정한다.
