# RB1-8a / RB1-7 Mac 검수 — FAIL

대상 `321c6b13a83322b3947c3fc34022ade6001c7121`, UNITY-BUILD 전체 checkout·detach·기존 Library 재사용. Unity 6000.6.7f1 / ARM64 / Apple M5 Pro. 코드 수정·커밋·push 0, 빌드 1회, Player 해상도별 1회, 실패 재실행 0. 원격 브랜치 조회 당시 HEAD는 `6e02269d9`였으나 지정 SHA만 검수했다.

PASS — ① 34° 원근 — 동일 SHA의 ForestA2 pitch=34°, FOV=46.9453°, orthographic=0(씬 Camera), Cinemachine ModeOverride=2(Perspective), 전방=1.45. 아레나에서도 r3 카메라 경로 유지와 실제 원근 화면 확인. 수치는 소스/씬 설정 대조이며 런타임 pose readback은 없음 — [1920-slam](pick/1920-slam.png), [3840-slam](pick/3840-slam.png).
FAIL — ② 영웅 높이 10~12% — 두 해상도 slam 표본의 보이는 몸체는 육안 약80~90px/1080=7.4~8.3%(무기·VFX 제외, 자세 영향 포함). 진입에서는 전경 벽에 전신 가려져 가시 높이0px. 108~130px 조건 미달 — [1920-slam](pick/1920-slam.png), [3840-slam](pick/3840-slam.png), [1920-entry](pick/1920-entry.png).
FAIL — ③ 검은 빈 공간0·숲 외곽 덩어리 — 두 해상도 모두 경계에 검은 삼각/수직 면이10곳 이상 보이며, 외곽은 반복 타일 칸막이 형태. 검은 부분이 실제 공백인지 무조명 면인지 PNG만으로 확정하지 않아 공백0을 인증하지 않는다. 높은 남쪽 벽이 진입 영웅을 완전히 가림 — [1920-entry](pick/1920-entry.png), [3840-entry](pick/3840-entry.png), [3840-slam](pick/3840-slam.png).
FAIL — ④ 진입·퇴장·침강 전환 튐0 — 두 실행 모두 입장→보스 사망→출구 개방→구역 클리어→로비 복귀는 영수증으로 확인. 거리16.5↔18.3/0.6초 smoothstep 소스는 있으나 연속 프레임0·카메라 pose 로그0이어서 순간 튐0 판정 불가. boss-direct 강제 진입이며 자연 필드 진입 검수도 아님 — [1920-exit](pick/1920-exit.png), [3840-clear](pick/3840-clear.png), evidence/{1920,3840}/fullrun.json.
FAIL — ⑤ 기둥 가림 반투명 — Core 기둥4개는 높이3.2m의 불투명 회색 실린더. NativeArena3DView는 공통 URP/Lit 재질 alpha=1을 쓰며 가림 판정·투명화 경로0. 해당 SHA 문서도8c 미구현 명시 — [1920-slam](pick/1920-slam.png), [3840-slam](pick/3840-slam.png).
FAIL — ⑥ 60fps 이상 지속 — 평균1920=95.48fps/4505프레임, 3840=96.51fps/4459프레임으로 평균 기준은 통과. 아레나 순간 표본은119.98~120.01fps. 그러나 p99=15.16/17.38ms이고 두 실행 tick1394에서 capture=""·loadPhase=0·arena=true인175.1/175.4ms(약5.71/5.70fps) 장프레임이 있어 지속60fps는 불합격. 전체 최대595.17/584.59ms에는 촬영·리사이즈 포함; 다른 레인 동시 작업도 있어 단독 성능 수치 아님 — evidence/{1920,3840}/{fullrun.json,long-frames.jsonl,telemetry.jsonl}; 캡처 경로 없음(시간축 로그 판정).
FAIL — ⑦ 기술7개 실제 발동·확대 수치 — 실제 active로 특정할 수 있는 보존 증거는 slam 1/7. bossRmWind는 MoveId 미기록인 공통 준비 상태, bossHeartWind는 heartbeat 준비여서 발동으로 세지 않음. 채찍·돌진·잡기·잠행·균열·심장 실제 발동6개는 미입증. 소스 SlashReach=480px(300×1.6), ChargeWidthMultiplier=1.5는 확인했으나 Player 실제 피해/예고 경계 증거0 — [1920-slam](pick/1920-slam.png), [3840-slam](pick/3840-slam.png), measurements.json의 capturedBossStates 및 evidence/{1920,3840}/fullrun.json.

## 실행·근거와 제한

- 빌드: `PortVerification.Build -buildTarget OSXUniversal -remodel-scenes 1 -output ~/exoduser-wt/_out/UNITY-BUILD/build-current -receipt <작업폴더>/build-receipt.json`. Editor만 `-batchmode -nographics -quit`. 빌드 Succeeded/errors=0, bytes=6,697,183,059. build.log·build-receipt.json 보존.
- Player: `open -g -n -W -a <Player> --args --remodel3d --unity-druid-remodel --unity-boss-direct 0 --unity-mute -nosound --unity-qa-sandbox <작업폴더>/qa-current -screen-fullscreen 0 -popupwindow -screen-width W -screen-height 1080 -logFile <작업폴더>/player-W.log --unity-fullrun-qa -output <작업폴더>/capture/W -qa-width W -qa-max-ticks 18000 -qa-retries 0` (W=1920,3840). 창 모드 백그라운드·무음, Player batchmode0. 두 프로세스 종료 확인.
- 기본 지정 인자에는 자동 촬영 시작이 없어 소스의 기존 FullRunQa 경로를 추가했다. 실제 ScreenCapture 최종 프레임·HUD 포함 PNG이며 macOS screencapture 사용0. 가상 InputSystem 입력이며 직접 위치/HP 수정0. boss-direct 자체의 게이트 강제 해제·연습 생략은 적용된다.
- FullRunShot은 일부 장면에서2560/3840도 자동 촬영 후 원래 크기로 복귀한다. pick/6장은 각각 실제1920×1080 3장·3840×1080 3장이고 직접 눈검수했다. 연속 카메라 기록이나 MoveId·판정 반경 영수증을 새로 만들도록 코드를 바꾸지 않았다.
- 두 fullrun 결과는 `stage-cleared-transition-blocked`: worldCleared=true·clearReturnedLobby=true·clearSaveExists=false. review 인자는 전투 저장을 끄므로 clearSaveExists 검사는 이 실행과 맞지 않는다. exit0/하니스 최종 PASS를 화면 PASS로 대신하지 않았다.
- 저장 격리: 지정 qa-current 아래 QA 캐릭터 로스터 생성과 NativeQaSandbox.Resolve 경로를 확인. 이 SHA에는 성공 바인딩을 출력하는 로그가 없어 요청된 **로그 바인딩 확인은 미충족**이다. 실제 사용자 저장 무변경을 로그로 인증하지 않는다. player-1920.log·player-3840.log 및 cleanup.json에 격리 경로·정리 목록 보존.
- 판정 한계 원인: 8a의 높은 외곽 벽·불투명 기둥, 영웅 표시 크기 미달, 전환/기술을 충분히 기록하지 않는 기존 촬영 경로. 수정하지 않았다. 경계 검은 면의 렌더 원인은 추가 구현 검토 필요.

## 정리

capture·qa-current·고정 build-current·unity/Library/PlayerDataCache 삭제 완료. 삭제 전 du 합계 약12.2GiB, df 실제 확보 6.11GiB(공유 블록/동시 작업 영향). Unity 자동 생성 tracked883개 복원·신규 Assets meta 제거. 시작 전 미추적2개는 그대로 보존했으며 tracked 수정0. Library 나머지·다른 checkout·다른 레인 산출물은 유지. 판정 PNG6장과 작은 영수증·로그만 보존했다.

SHA 321c6b13a83322b3947c3fc34022ade6001c7121 | 소요 354초(사전 상태 기록~정리·보고) | df 남은 용량645Gi
BOSS-ARENA-GATE: FAIL 321c6b13a
