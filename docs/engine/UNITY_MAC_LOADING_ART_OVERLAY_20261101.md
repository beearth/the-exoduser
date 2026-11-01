# Mac 로딩 원화·하단 오버레이 후보 — 2026-11-01 KST

PC R5 `0a60cbcee273e1150ba7df8909acb77dd9f18edc`에서 게임 구역 전환 화면에 필요한 자산·선택·그리기만 선별 이식한다. 첫 팁 Player의 PASS와 저장 게이트는 이 원화 후보의 시험 결과가 아니다.

| 항목 | 현행 구현 |
|---|---|
| 승인 ID | `01–12, 15, 16, 18, 19` = 16종. `ForStage(stage)`는 이 순서로 순환 |
| 자산 | ID별 `NN.png` 원본, `NN-16.png` 1920×1200, `NN-21.png` 2560×1080, `NN-32.png` 3840×1080. 총 PNG 64개와 대응 `.meta` 64개 |
| variant | `W/H > 2560/1080`이면 `-32`, 그렇지 않고 `W/H > 1920/1080`이면 `-21`, 나머지 `-16`. 경계는 낮은 쪽 |
| 좌표 | 중앙 안전영역 배율 `s=min(W/1920,H/1080)`, 원화와 하단의 확장 배율 `e=H/1080`, 논리 너비 `W/e`. 원화는 화면 cover |
| 누락 variant | 같은 ID 원본을 512px 폭 `LoadingBlur.shader` RenderTexture로 흐리게 하고 밝기 `.28` cover 배경과 contain 전경을 겹침. blur shader 누락 시 같은 원본을 어둡게 cover. 원본도 누락되면 검정 바탕과 상태 정보 표시 |
| 하단 | 그라데이션 높이 물리 `clamp(.22H,150,300)` px. 제목, 구역 detail, `clamp01(LoadT/35)` 진행선, 팁 순서. 제목 글자 크기 `round(clamp(.021H,16,26)/e)`, detail `round(clamp(.0135H,11,17)/e)`, 하단 여백 물리 `clamp(.03H,18,44)` px |
| 팁 | 기존 `NativeLoadingTips` 승인 4종·현재 primary/secondary 바인딩·영어 폴백·`FontPixels(H)` 유지. 물리 `GUI.matrix=identity`에서 진행선 아래 8px. PC helper의 중복 팁은 이식하지 않음 |
| 코드 경계 | 새 `NativeLoadingSelection.cs`, 최소 `NativeUiSafeArea.cs`/`NativeUiViewport.cs`, shader 및 원화 자산. 기존 `NativeGame.cs`/`NativeGame.StageFlow.cs`와 QA `NativeGame.LoadingTipCapture.cs` 변경. 로비 gate·다른 viewport UI는 제외 |
| 합성 순서 | `NativeGame.OnGUI`의 HUD 뒤에서 `StageFlowDrawLoad()`를 그려 전체 원화와 하단 상태판이 전투 HUD를 덮음. `LoadPhase>0`인 프레임에는 뒤의 전투 안내를 그리지 않음 |
| QA 표본 | 기존 언어·키 48개에 1920×1080, 2560×1080, 2880×810, 3024×1964 각각 승인 16종 + variant 강제 누락 1종 = 68개 추가. 비배치 Player Repaint audit와 PNG로 source·팁·파일을 확인 |
| QA 해상도 순서 | 창 모드 1920→2560→2880, 마지막에 3024 전체화면. 1920과 3024에서 팁 24개씩, 각 해상도에서 원화 17개씩 수집. Mac Player의 전체화면→작은 창 전환이 적용되지 않아 순서를 한 방향으로 고정 |

현행 Core 114개와 Runtime/Remodel 200개 소스를 Roslyn 4.10/.NET 8로 각각 정적 컴파일 exit 0 확인했다. 이는 Unity import/Player 화면 검사가 아니다. 첫 공식 ARM64 Settings QA 빌드는 Succeeded/오류0, M1 exit0/차단0/일반 저장11항목 변화0. 첫 GUI에서 로딩 원화가 HUD 아래에 놓이고 글자 단위 audit 때문에 기존 전체 문구 탐지가 실패했다. 수정본 두 번째 공식 빌드는 Succeeded/오류0, 같은 앱 M1 exit0. 두 번째 GUI는 팁 48개 실제 캡처 후 3024 전체화면에서 1920 창으로 되돌리지 못해 원화 수집 전에 종료2. 세 번째 후보는 해상도 수집 순서를 바로잡는다.

### 해상도 순서 수정본 결과

커밋 `00d5f2b518b4c66c5ff5688e19b334f461a39326`을 새 APFS QA 프로젝트에서 Unity 6000.6.7f1 공식 ARM64 Settings QA로 빌드했다. `build-3-receipt.json`은 `Succeeded`/errors0, 같은 앱 M1은 23/23·firstBlocked 빈 문자열·exit0이다. 첫 GUI는 macOS의 이전 창 크기 2704×1634가 남아 1920 요청 검사에서 exit2였고, **동일 앱**을 `-screen-width 1920 -screen-height 1080 -screen-fullscreen 0`으로 다시 열어 비배치 GUI exit0을 얻었다.

| 실제 Player 결과 | 값 |
|---|---|
| 표본 | 팁 48, 원화 68 = PNG·Repaint audit 각 116. 1920×1080·2560×1080·2880×810·3024×1964 원화 각 17, 강제 variant 누락 폴백 각 1 |
| 계약 확인 | 승인 ID 16개 variant source·팁·PNG 존재 전체 통과, `loading-tip-receipt.json` passed=true |
| 무음·종료 | Listener pause=true, volume=0, outputPeak=0, Direct VideoPlayer=0, `QA_MEDIA_DRAIN_COMPLETE LOADING_TIPS`, exit0 |
| 일반 저장 | 사전 11항목과 M1·GUI 종료 후 목록의 존재·크기·SHA-256 동일 |
| 1x 화면 | 1920 기본, 2880 확장/누락 폴백, 3024 기본 PNG 직접 확인. 원화가 HUD를 가리고 제목/detail/진행선/팁이 보임. **표본 VISUAL VERDICT: PASS** |

증거 경로는 `/Users/fordeargamers/exoduser-wt/_out/mac-loading-art-overlay-20261101/`의 `build-3-receipt.json`, `m1-3/m1-check.json`, `gui-3b/loading-tip-receipt.json`, 각 원본 PNG/JSON, `ordinary-before.json`·`ordinary-after-m1-3.json`·`ordinary-after-gui-3b.json`이다. GUI는 QA에서 StageIndex·언어·키와 강제 원화 ID/누락 variant를 설정했으므로 자연 구역 진행의 16종 노출 증거는 아니다. 후속 승인 로고는 별도 자산·로비 참조 범위로 이 결과 이후 적용됐으며 로딩 116표본을 중복 실행하지 않았다.
