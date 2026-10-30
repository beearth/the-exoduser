# Mac Unity A06 HUD 좌표 인수 — 2026-10-27

> 2026-10-27 후속: 아래에 남긴 구형 `VerifyUiComposition` 충돌은 [Mac Metal Editor 계측](UNITY_MAC_A06_GPU_METAL_20261027.md)에서 웹 clipping 계약으로 정정했고, 실제 Metal 자원 마스크를 통과했다. 전체 `Verify`는 후속 Inventory 검사에서 종료2이므로 전체 PASS가 아니다.

PC 고정 커밋 `741d97ba1245631a8098d9cecac5589332252189`의 `NativeHudDockLayout.cs`와 `NativeHudSkills.cs` 두 파일만 Mac에 byte-exact 적용했다. 수정 전 원본 두 파일은 `_out/UNITY-MAC-A06-20261027/before/`에 보존했다. 적용 후 SHA-256은 각각 `6011347812546114f65e13eeea49d85f7b8cbccc5bf178441d9d6cc1356276bb`, `9eda21f929eb4abd6d46fbe3bea211363994ffde33ad71c09cc99b06177ca8ff`이다. `NativeHud.cs`, `NativeHudPresentation.cs`, `NativeGame.cs`, 원본 이미지, 자원·전투·키 동작은 변경하지 않았다. 이전 HUD blend 문서의 `.78` 수치와 시각 PASS는 당시 2026-10-26 빌드의 이력이며 현재 A06 좌표는 이 문서가 우선한다.

## 1920×1080 논리 좌표 계약

| 항목 | 이전 Mac | A06 현재 | 적용 위치 |
| --- | ---: | ---: | --- |
| 공통 `ArtScale` | 0.78 | 0.9 | dock, 구슬, 바, foundation 공통 |
| 좌/우 액체 중심 x | 약 605.7 / 1320.6 | 519 / 1401 | 구슬 frame에서 액체 중심 보정 |
| 구슬 frame | 920px 외곽 중심 배치, 화면 안 | 좌 x397.05 / 우 x1279.05, y872.9, 각 236.7² | 액체 하단 화면에서 10px, glass 끝은 화면 아래 29.6px |
| 슬롯바 | 폭639.6 | `(591, 931.2, 738, 163.8)` | `bottom:10−25` 웹 원본 요소 좌표 |
| foundation | 873.6×110.8 | 1008×127.8 | 코드는 그대로, 공통 배율로 확대 |
| 13 슬롯 x 오프셋 | `(128+44i)×0.78` | `{128,173,217,261,303,347,392,436,479,522,566,610,654}×0.9` | `dock.SlotRect(i)`, ActiveSlot, `SkillSlotRect`, draw/click 공통 |
| 슬롯 hit rect | 37×77×0.78 | 37×45×0.9 = 33.3×40.5 | bar 상대 y=70×0.9; 첫 슬롯 `(706.2, 994.2, 33.3, 40.5)` |
| 키라벨 rect | 화면 아래 y44, 높이31 | 각 슬롯 x와 동일, bar 상대 y121×0.9, 37×18×0.9 | 첫 라벨 `(706.2, 1040.1, 33.3, 16.2)` |

720p는 논리 좌표에 균등 2/3 배율을 적용한다. 첫 슬롯 hit rect는 `(470.8, 662.8, 22.2, 27)`, 첫 키라벨은 `(470.8, 693.4, 22.2, 10.8)`이다. 13 키 이름은 `1,2,3,4,F,Z,LMB,RMB,Shift,E,Q,Ctrl,Space`로 유지한다. 슬롯 최소 간격 4.5 논리 px, 라벨 inset 간격 10.5 논리 px이다. 슬롯바/구슬/키라벨 변경은 UI 좌표만이며 스킬 슬롯 배정·발동·자원 비용·저장 schema를 변경하지 않는다.

## 격리 Player 검증과 화면 판정

Unity 6000.6.7f1 `PortVerification.Build -a03a04UiQa true` 1회 ARM64 빌드는 `Succeeded`, errors 0, C# error 0이었다. 기존 UAC1001 경고는 이 변경과 무관하게 남았다. 고유 앱 product `EXODUSER A03 A04 QA`, identifier `com.fordeargamers.exoduser.a03a04qa20261027`; `open -n`으로 단일 QA PID 20524가 `--unity-hud-blend-smoke -output <절대 경로>`로 실행됐다. fixture는 사용자 roster 저장소를 열지 않고 자동 종료했으며, 별도 일반 앱 PID 38141/48476/52157은 유지됐다. 빌드 import로 생성된 413 tracked/2 untracked 파일은 패치와 tar로 보존 후 원래 bytes로 되돌렸다.

`_out/UNITY-MAC-A06-20261027/capture/`의 idle 720p/1080p와 실제 tier2 720p/tier3 1080p PNG 네 장을 직접 확인했다. `hud-blend-capture.json`은 55/55 PASS, failures 0, 13슬롯 draw/label 중심·바 내부 hit rect·양의 간격·상태 표시 조건·네 PNG 존재를 기록한다. 이는 scripted Player 기하 검사이며 물리 마우스 클릭 PASS를 뜻하지 않는다.

**VISUAL VERDICT: PASS (A06 좌표·접점 범위).** 기존 2026-10-26 idle 캡처와 같은 720p/1080p 게임 화면에서 구슬과 바가 함께 커지고 아래로 내려가며, 얇은 foundation 윤곽이 확대된 구슬과 바 끝에 연결된다. 두 화면에서 구슬 액체·자원 숫자와 13 키라벨이 화면 안에서 식별된다. glass frame 아래 29.6 논리 px의 화면 밖 연장은 웹 좌표 계약에 의도된 것으로, 실제 액체나 슬롯 hit rect의 clipping과 구분한다. 720p 긴 키라벨은 작지만 보인다. tier2 720p 상태문구와 바/구슬도 겹침 없이 보인다. 플레이 중 실제 OS 포인터 hit 확인은 여전히 HOLD다.

기존 `PortVerification.VerifyUiComposition`의 `VisibleFrame.yMax<=height−4`, frame bounding box 대칭, 전체 폭 `<=1100`은 새 웹 좌표와 충돌한다. A06에서는 frame 끝 `height+29.6`, bbox 중심 `mid−3.6`, 외곽 폭 약 1118.7이므로 이 구형 Editor assertion은 실패 예상이다. 배경 art의 의도된 clipping과 실제 액체/슬롯 hit 범위를 분리해 판단한다. 해당 검사 삭제·완화로 PASS 처리하지 않았고, 웹 oracle에 맞춘 QA 계약 갱신은 별도 작업이다.

`grep -r -n -E 'ArtScale|SkillSlotRect|HUD frame clipped|slot bar|슬롯 바' docs/` 검색 결과를 `_out/UNITY-MAC-A06-20261027/docs-keyword-grep.txt`에 보관했다. `UNITY_HUD_INTEGRATED_20261025.md`와 `UNITY_MAC_HUD_BLEND_20261026.md`의 옛 좌표는 해당 날짜의 이력이며 이 문서의 현행 표와 구분한다.

2026-10-30 PC 후속: 실버 헬 미니맵 원형 원화·구슬 sRGB 출력 정정의 현행 계약과 검수는 [UI 원화 반영](UNITY_UI_ASSETS_20261030.md)을 따른다. 위 날짜의 검수 이력은 보존한다.
