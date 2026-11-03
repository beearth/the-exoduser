PASS — 1. 대상·정식 빌드 — SHA 3941b3ff87e6e80db2cbd12d8af603c73e38e999 detach, 원격 codex/unity-death-screen-20261103 ref 일치. 전체 checkout·기존 Library 재사용. PortVerification.Build / -remodel-scenes 1 / Unity 6000.6.7f1 ARM64 빌드 1회, Succeeded / errors=0. FirstPlayable·RM1_Slice 빌드 로그 확인 — build-receipt.json, build.log; 캡처 없음.

FAIL — 1. 정적 검사 — 지정 명령 1회, 소스 검사 3 PASS 후 No .NET toolchain으로 exit 2. 실제 도구는 Contents/Resources/Scripting/{DotNetSdk,NetCoreRuntime}에 있으나 run.cjs는 Contents 직하를 탐색한다. Player·Editor sanitizer 미실행. 소스 수정·동일 테스트 재실행 0 — static-tests.log, evidence/static-result.txt; 캡처 없음.

PASS — 1. 사망 영수증 — HD2D/remodel3d × 1920×1080·3840×1080·5120×1440, 6/6 passed/fieldVisible/actualRevive/actualDeath/bossCamera/bossAlive/cameraPostProcessing/combatTextHidden/persistenceDisabled=true. filterAtWait=volumeAtWait=bossFilter=bossVolume=1, revivePhase=Reviving, filterAfterRevive=0. 실제 요청 해상도 일치, failures 빈 문자열 — evidence/death-*-death-screen-capture.json, verification.json; pick/01·02·06.

PASS — 1. UI 영수증 — pause/settings/quit/character-delete/lobby/lobby-quit × 1920·3840 = 12/12 passed/dialogOpen/rosterUnchanged/persistenceDisabled=true. 로스터 1→1 유지. 별도 스킨 프로브 2회는 아래 FAIL — evidence/ui-*-death-ui-*.json, verification.json; pick/03·04.

FAIL — 2. 스킨 프로브·회색 원인 — OSXPlayer / Metal / Linear, 2/2 passed=false, 실패 메시지 custom-only plate still gray at FAIL coordinates. 기본 IMGUI 스킨은 회색을 추가하지만 제거만으로 흑철 바탕이 되지 않는다. 직전 위 RGB 74~78 / 아래 55~61과 달리 이번에는 배경 내용에 따라 값이 달라지며 로비 건물·불씨가 버튼 안으로 그대로 비친다 — evidence/skin-{1920,3840}-death-ui-lobby.json; pick/04·06.

| 해상도 | 기본 스킨 대조 위 / 아래 RGB | skinless 위 / 아래 RGB |
|---|---|---|
| 1920 | 114/112/113 / 146/145/146 | 60/58/65 / 78/75/80 |
| 3840 | 122/120/122 / 148/145/146 | 84/79/84 / 86/73/75 |

원인 근거: NativeLobby.SilverHell.cs:116의 plateBase=Texture2D.blackTexture를 :146에서 alphaBlend=true로 그린다. [Unity 6000.6 공식 API](https://docs.unity.com/en-us/engine/6000.6/script-reference/unityengine/texture2d/blacktexture)는 blackTexture를 RGBA (0,0,0,0), 즉 투명 검정으로 명시한다. 불투명 바탕이라는 소스 주석과 실제 API 계약이 다르다. 이 경로는 배경이 비치는 캡처와 일치한다. 런타임 텍스처 알파 자체를 읽는 별도 프로브는 수행하지 않았다. 두 프로브 strippedStates=0이므로 실제 제거된 상태 개수로 원인을 증명했다고 주장하지 않는다. 소스 근거는 source-evidence.log.

FAIL — 2. 버튼 12화면 1x·3x — 기존의 일정한 밝은 스킨 그라데이션은 대조군과 구별되지만 12/12 흑철 불투명 바탕 조건 실패. pause 등에는 회색 패널이, lobby에는 원화가 비친다. 단순 회색 그라데이션 0이라는 이유로 재질 PASS할 수 없다. 글자·테두리를 피한 동일 위치 RGB는 아래와 같다 — button-metrics.json; pick/03·04.

| 화면 | 1920 내부 위 / 아래 RGB | 3840 내부 위 / 아래 RGB | 금선 상단 y / 두께 |
|---|---|---|---|
| pause | 66/65/66 / 67/66/66 | 66/65/66 / 67/66/66 | 413 / 1px |
| settings | 71/78/78 / 69/75/75 | 71/78/78 / 69/75/75 | 998 / 1px |
| quit | 63/60/63 / 60/59/62 | 63/60/63 / 60/59/62 | 680 / 1px |
| character-delete | 67/63/66 / 66/66/67 | 67/63/66 / 66/66/67 | 566 / 1px |
| lobby | 50/35/46 / 75/71/77 | 84/79/84 / 86/73/75 | 726 / 1px |
| lobby-quit | 65/65/64 / 65/65/67 | 65/65/64 / 65/65/67 | 556 / 1px |

PASS — 2. 금선 1px·외곽 붉은 번짐 — 12/12 대표 버튼 금선은 물리 1px. pause y413 RGB171/162/143(위34/34/34·아래67/66/66), quit y680 RGB196/185/160(위32/31/32·아래65/62/64), 두 해상도 동일. 직전 pause·quit 2px 문제는 해소. 기본·선택 버튼 외곽으로 퍼진 붉은 광휘와 로비 슬롯 빨간 단색 채움은 육안 0. 슬롯 안쪽 선택 광휘는 남음. 외곽 RGB 탐색 2px은 3840 로비 원화 불씨/색과 분리하지 못하므로 효과 번짐 수로 사용하지 않았다 — button-metrics.json; pick/03·04.

FAIL — 3. 비네트·최종 합성 채도 — URP Volume의 검정 Vignette 적용 및 좌우 감광은 확인. 그러나 3840·5120의 4/4 사망 화면에서 양끝 S가 중앙 S를 초과한다. 기존 뚜렷한 동심원 계단 띠는 육안 0, 고립 잔점 0. 따뜻한 가로 띠는 남는다 — death-metrics.json, source-evidence.log; pick/01·05.

수치: 64px 전높이 띠 평균, 좌/중/우 순서. HSV S·V 0~1이며 검정 S=0. HUD·사망 글자·가로 띠를 포함한 최종 PNG 수치다. 서로 다른 지형의 원래 채도 차이와 후처리 단독 효과를 분리한 실험은 아니다.

| 모드·해상도 | S 좌 / 중 / 우 | V 좌 / 중 / 우 |
|---|---|---|
| hd2d-3840x1080 | 0.2440 / 0.1397 / 0.2578 | 0.0385 / 0.0801 / 0.0338 |
| hd2d-5120x1440 | 0.2430 / 0.1433 / 0.2580 | 0.0327 / 0.0746 / 0.0316 |
| remodel3d-3840x1080 | 0.2609 / 0.1216 / 0.2635 | 0.0375 / 0.1215 / 0.0328 |
| remodel3d-5120x1440 | 0.2592 / 0.1242 / 0.2611 | 0.0318 / 0.1165 / 0.0307 |

남은 색의 유력 경로는 URP 뒤에 합성하는 DeathBand(): NativeRevive.DeathScreen.cs:244의 RGB(4,3,3), 1×128 텍스처를 전체 너비·520 디자인 px 높이에 그린다(:139). 검정 URP 비네트 자체와 이 따뜻한 IMGUI 띠를 구분해야 한다. 검수 중 제거·토글 실험은 하지 않아 기여량까지 단정하지 않는다.

PASS — 4. 사망 글자 전투 문구 — 사망 6/6 combatTextHidden=true. fixture가 사망 중 쉴드 파괴!·한방킬! ×5를 새로 삽입한 후에도 숨김. 필드·보스 제목/부제 12컷에서 해당 문구 겹침 육안 0 — evidence/death-*-death-screen-capture.json; pick/06.

PASS — 5. 부활 5프레임 — 6/6 reviveTimes=[0,.125,.25,.375,.5], reviveFilters=reviveVolumes=[1,.84375,.5,.15625,0]. 합성 30컷에서 어두운 필드→밝은 필드, 글자·필터 해제를 눈으로 확인. Core 실제 부활도 6/6 true. ForcedReviveAge를 고정해 촬영한 표본이므로 자연 시간 연속 영상으로 부드러움을 검증했다는 의미는 아님 — evidence/death-*-death-screen-capture.json; pick/02.

PASS — QA 20회 저장 격리·오류 — 20/20 JSON·Player.log에서 각 capture-current/<런>/qa-save, settings/roster/combat=disabled 바인딩 일치, sandbox 저장 파일 0, 런타임 오류 0. open 종료코드는 20/20 0이지만 스킨 영수증 2개는 false여서 실패로 판정 — smoke-summary.json, verification.json, evidence/*-player.log; 캡처 없음.

FAIL — 검수 런처 착오 — 첫 open 호출에 -a를 누락하여 QA 인자 없는 Player가 1회 열렸다. 즉시 발견 후 해당 Player를 SIGTERM 종료하고 open -g -n -W -a "$PLAYER" --args로 수정했다. 이 잘못 열린 실행의 저장 격리는 미검증이며 위 20회에 포함하지 않았다. QA smoke 시작·영수증 생성 전의 런처 착오이고 게임 소스·실패 테스트를 수정하거나 반복한 것은 아니다 — run.log, codex-exec.log; 캡처 없음.

PASS — 판정 증거 — pick/ 최종 PNG 6장 모두 직접 열어 확인. 01=5120 HD2D 원본 전체, 02=6런×부활5프레임, 03=12화면 대표 버튼 1x·3x, 04=두 해상도 로비 슬롯·입장 버튼, 05=와이드 4런 좌우 가장자리3x, 06=6런 필드·보스 제목 및 스킨 대조. 확대는 nearest-neighbor, 밝기·색 보정 0. 검수만 수행, 게임 코드 수정·커밋·push 0 — pick/01~06.

PASS — 실행·정리 — 정상 QA 20회는 PLAYER=build-current 앱 실행파일, open -g -n -W -a / 창 모드 -screen-fullscreen 0 -popupwindow / -nosound --unity-mute -mute-audio로 실행. Player batchmode 0, QA 실패 무수정 재실행 0. 종료 확인 후 capture-current·tests-current·build-current·PlayerDataCache·qa-save·임시 분석 환경/스크립트 삭제. Unity 생성 tracked 857개 복원, 신규 Assets 56개 정리; 시작 전 미추적 2개·Library·prev/ 보존. 삭제 논리합 12.56GiB(공유 블록 포함), 삭제 직후 df 가용량 6.44GiB 증가. 타 작업의 디스크 사용은 병행 중이다. 대상 Editor/Player 잔여 0 — cleanup-receipt.json, cleanup.log, final-state.log; 캡처 없음.

SHA 3941b3ff87e6e80db2cbd12d8af603c73e38e999 | 소요 447초(세션 로그 생성~정리·보고) | df /System/Volumes/Data 남은 용량 639Gi
DEATH-UI-GATE: FAIL 3941b3ff8
