PASS — 1. 정식 빌드·18회 smoke 영수증 — 지정 SHA detach·원격 ref 일치, 전체 checkout·기존 Library 재사용. Unity 6000.6.7f1 ARM64, PortVerification.Build·-remodel-scenes 1, 빌드 1회 Succeeded/errors=0. 사망 6/6·UI 12/12 passed=true, failures=0·런타임 오류=0·잔여 Player=0. 실제 화면 확인을 별도 판정함 — build-receipt.json, build.log, smoke-summary.json, pick/01~06.

| 실행 | 요청/영수증 해상도 | passed | 실패/오류 | 영수증 |
|---|---|---|---|---|
| death-hd2d-1920x1080 | 1920×1080 | true | 0 / 0 | [JSON](evidence/death-hd2d-1920x1080-death-screen-capture.json) |
| death-hd2d-3840x1080 | 3840×1080 | true | 0 / 0 | [JSON](evidence/death-hd2d-3840x1080-death-screen-capture.json) |
| death-hd2d-5120x1440 | 5120×1440 | true | 0 / 0 | [JSON](evidence/death-hd2d-5120x1440-death-screen-capture.json) |
| death-3d-1920x1080 | 1920×1080 | true | 0 / 0 | [JSON](evidence/death-3d-1920x1080-death-screen-capture.json) |
| death-3d-3840x1080 | 3840×1080 | true | 0 / 0 | [JSON](evidence/death-3d-3840x1080-death-screen-capture.json) |
| death-3d-5120x1440 | 5120×1440 | true | 0 / 0 | [JSON](evidence/death-3d-5120x1440-death-screen-capture.json) |
| ui-pause-1920 | 1920×1080 | true | 0 / 0 | [JSON](evidence/ui-pause-1920-death-ui-pause.json) |
| ui-pause-3840 | 3840×1080 | true | 0 / 0 | [JSON](evidence/ui-pause-3840-death-ui-pause.json) |
| ui-settings-1920 | 1920×1080 | true | 0 / 0 | [JSON](evidence/ui-settings-1920-death-ui-settings.json) |
| ui-settings-3840 | 3840×1080 | true | 0 / 0 | [JSON](evidence/ui-settings-3840-death-ui-settings.json) |
| ui-quit-1920 | 1920×1080 | true | 0 / 0 | [JSON](evidence/ui-quit-1920-death-ui-quit.json) |
| ui-quit-3840 | 3840×1080 | true | 0 / 0 | [JSON](evidence/ui-quit-3840-death-ui-quit.json) |
| ui-character-delete-1920 | 1920×1080 | true | 0 / 0 | [JSON](evidence/ui-character-delete-1920-death-ui-character-delete.json) |
| ui-character-delete-3840 | 3840×1080 | true | 0 / 0 | [JSON](evidence/ui-character-delete-3840-death-ui-character-delete.json) |
| ui-lobby-1920 | 1920×1080 | true | 0 / 0 | [JSON](evidence/ui-lobby-1920-death-ui-lobby.json) |
| ui-lobby-3840 | 3840×1080 | true | 0 / 0 | [JSON](evidence/ui-lobby-3840-death-ui-lobby.json) |
| ui-lobby-quit-1920 | 1920×1080 | true | 0 / 0 | [JSON](evidence/ui-lobby-quit-1920-death-ui-lobby-quit.json) |
| ui-lobby-quit-3840 | 3840×1080 | true | 0 / 0 | [JSON](evidence/ui-lobby-quit-3840-death-ui-lobby-quit.json) |

FAIL — 정적 검사 1회 — 로비 우회 등록 2항목 PASS 후 Windows 전용 `G:/unity/Editor/6000.6.7f1/.../net8.0` ENOENT로 중단. 색 공간 프로브는 미실행이며 정적 전체 PASS가 아님. 스크립트 수정·재실행 0 — static-tests.log.

FAIL — 2. 슈퍼와이드 좌·중·우 채도·명도 감소 — 3840×1080·5120×1440 실제 촬영 성공(창 제한으로 인한 생략 0). 명도는 양끝까지 감소하고 밝은 16:9 외곽 띠는 0, 중앙의 빨간 단색 사각 판도 0. 그러나 붉은 비네트의 계단형 띠가 뚜렷하며 최종 합성 화면의 좌우 채도는 증가한다. 예: HD2D 5120 좌/우 S 0.2887/0.3072→0.7814/0.8029. 따라서 최종 화면 전체 탈채도 기준은 FAIL — [5120 전체](pick/01-death-hd2d-5120-full.png), death-metrics.json.

수치는 좌/중/우 순서, 64px 전높이 띠의 평균이다. S=HSV 채도, Y=가중 sRGB 명도(.2126R+.7152G+.0722B), 범위 0~1. 부활 후 같은 필드를 필터 해제 참고값으로 사용했으며 HUD·애니메이션 차이가 있다. 비네트·HUD를 포함한 최종 합성 지표로, 월드 단독 후처리 채도와 구분한다.

| 모드/해상도 | 사망 S 좌/중/우 | 해제 S 좌/중/우 | 사망 Y 좌/중/우 | 해제 Y 좌/중/우 |
|---|---|---|---|---|
| death-3d-3840x1080 | 0.6866/0.2429/0.7729 | 0.3268/0.2608/0.3348 | 0.1174/0.1853/0.0984 | 0.2736/0.3450/0.1727 |
| death-3d-5120x1440 | 0.6979/0.2437/0.7746 | 0.3348/0.2581/0.3345 | 0.1152/0.1798/0.0980 | 0.2636/0.3446/0.1719 |
| death-hd2d-3840x1080 | 0.7709/0.3393/0.7982 | 0.2832/0.1504/0.3011 | 0.0996/0.1142/0.0945 | 0.1839/0.1829/0.1526 |
| death-hd2d-5120x1440 | 0.7814/0.3406/0.8029 | 0.2887/0.1509/0.3072 | 0.0975/0.1083/0.0934 | 0.1763/0.1827/0.1494 |

PASS — 3. HD2D·3D 필드와 보스 카메라 필터 적용 — 사망 6/6 fieldVisible/actualRevive/actualDeath/bossCamera/bossAlive/cameraPostProcessing=true, 필드 Filter/Volume=1/1, 보스 Filter/Volume=1/1. 실제 3D 필드·보스 화면에서 감광 확인. 최종 합성 색 품질은 항목2 FAIL을 유지 — [3D 필드·보스 1x](pick/02-death-3d-field-boss-1x.png), evidence/death-*-death-screen-capture.json.

FAIL — 4. 글자 1x 가독성·3배 잔점·0.5초 해제 — 제목·숫자·부활력은 읽히며 글자 자체의 독립 잔점/디더는 육안 관찰 0. 그러나 HD2D 부제에 `쉴드 파괴!`, 3D 부제·링에 `한방킬! ×5`·`쉴드 파괴!`가 겹친다(3D 충돌 영역 2곳). 6/6 실제 Core 부활, Reviving 중간 필터=.5·해제 후=0은 확인했다. 다만 smoke는 .25초를 강제로 고정한 중간 PNG와 .7초 대기 후 PNG만 남기므로 자연스러운 .5초 연속 동작 증거가 아니다. 외부 창 캡처도 1.3초 수집 구간의 29개 프레임 요청 모두 `could not create image from window`로 실패(유효 0)해 .5초 연속 검수는 미검증 — [글자 3배](pick/03-death-text-x3.png), evidence/death-hd2d-1920x1080-sequence.json.

FAIL — 5. 6개 UI 버튼 재질·1px 금빛 선 — 1920/3840의 12/12 화면에서 밝은 회색 그라데이션이 남는다. 아래 표의 글자/테두리를 피한 버튼 내부 상·하 RGB는 두 해상도에서 동일했다. pause 선은 y414~415, quit 선은 y681~682의 2px(각각 두 해상도 동일)로 1px 조건도 실패. settings·삭제·로비종료 선은 1px. 로비 슬롯 빨간 단색 채움은 육안 0이나 회색 바탕과 가장자리 붉은 번짐은 남음 — [로비 슬롯·버튼](pick/04-lobby-full-slot-button-x3.png), [1920 버튼 3배](pick/05-ui-1920-buttons-x3.png), [3840 버튼 3배](pick/06-ui-3840-buttons-x3.png), button-metrics.json.

| 화면 | 내부 위 RGB | 내부 아래 RGB | 1920 표본 좌표 위/아래 |
|---|---|---|---|
| pause | 77/73/72 | 58/55/55 | (650, 425) / (650, 478) |
| settings | 74/71/70 | 58/55/55 | (1660, 1005) / (1660, 1026) |
| quit | 76/72/71 | 61/57/57 | (1020, 695) / (1020, 740) |
| character-delete | 74/71/70 | 59/57/57 | (800, 574) / (800, 597) |
| lobby | 78/74/73 | 61/58/58 | (1500, 735) / (1500, 775) |
| lobby-quit | 75/72/71 | 60/57/57 | (770, 563) / (770, 588) |

FAIL — 삭제 실행 차단 로그 — 두 삭제 확인 영수증 dialogOpen/rosterUnchanged/persistenceDisabled=true, 로스터 1→1, 실제 삭제 수행 0. 소스 ConfirmCharacterDelete의 smoke 즉시 false 가드는 확인했으나 fixture가 확인 동작을 호출하지 않고 가드도 로그를 출력하지 않아 차단 로그는 0건. 요청된 런타임 차단 로그 증거는 미검증 — evidence/ui-character-delete-{1920,3840}-Player.log, source-evidence.log.

PASS — 6. QA 저장 루트 격리 — 18/18 Player.log와 JSON의 `DEATH_UI_SAVE_BINDING qaRoot=/Users/fordeargamers/exoduser-wt/_out/UNITY-DEATH-UI-MAC/qa-current settings=disabled roster=disabled combat=disabled` 일치, persistenceDisabled=true 18/18. QA 루트에 생성된 저장 파일 0 — evidence/*-Player.log 및 JSON, smoke-summary.json.

원인: 비네트는 월드 탈채도 후 IMGUI에서 별도로 합성되어 붉은 색을 다시 더한다. 256×144 RGBA32 텍스처 확대 경로에서 보이는 띠의 정확한 GPU 양자화 원인은 미확정이다. 사망 글자 배경이 전투 알림을 충분히 가리지 못해 겹침이 남는다. 버튼에는 linear 보정 코드가 있지만 Mac Metal 최종 RGB는 여전히 58~78 범위여서 색 변환/텍스처 업로드 경로 재조사가 필요하다(정확한 원인 미확정). 2px 선은 ActionPlate의 `Round(s)`에서 pause/quit 배율 1.5를 2로 반올림하는 소스와 실측이 일치한다. 검수만 수행했으며 코드 수정·커밋·push 0.

PASS — 실행·정리 — Player 18회 모두 open -g -n -W·창 모드 -screen-fullscreen 0 -popupwindow·-nosound/--unity-mute/-mute-audio, Player batchmode 0·강제 종료 0·smoke 재실행 0. Editor/Player 잔여 0 확인 후 capture-current·qa-current·공용 출력 build-current·PlayerDataCache·임시 Python 환경/프로브/검수 스크립트·임시 합성 PNG 삭제. 판정 PNG 6장과 영수증/핵심 로그/수치만 보존, prev/ 보존. Unity 생성 tracked857개 복원·신규 Assets56개 제거, 시작 전 미추적2개와 기존 Library 보존. 삭제 논리합 12.47GiB(공유블록 포함), df 실회수 6.34GiB — cleanup-receipt.json, cleanup.log, final-state.log.

SHA 1ea269a728c77fa243f244b4e1330e2929b611bb | 소요 470초(세션 시작~검수·정리·보고) | df /System/Volumes/Data 남은 용량 697Gi | DEATH-UI-GATE: FAIL 1ea269a72
