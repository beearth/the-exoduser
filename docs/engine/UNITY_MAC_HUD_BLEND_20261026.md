# Unity HUD world blend adjustment — 2026-10-26

## Visual target and scope

The user's latest review withdrew the large black state plate and broad square footing from the 9dd integrated HUD candidate. The accepted direction is a low, compact grouping: the resource orbs and slot rail remain legible, the world stays visible around and between them, and a thin curved worn-metal contour ties the lower group together. The two reference images were viewed directly: `reference-compact.png` (716×452, SHA-256 `ae54147d0a865a94a23b32c9e573b0088d393220317eac45fd02058f340c9aed`) and `reference-world-blend.png` (1388×597, SHA-256 `a9305e08b3e030061a3b7e0d0526f1e8849b4fcc25ca02eacb529f4849de0230`). They inform scale, transparency, and restraint only; none of their artwork is copied.

This adjustment changes presentation code in `NativeHud.cs`, `NativeHudPresentation.cs`, `NativeHudSkills.cs`, and the shared `NativeHudDockLayout.cs`. It preserves the existing orb and slot artwork, all resource values, all 13 key names and callbacks, charge simulation, and the hit areas calculated from `SkillSlotRect`. No save, gameplay balance, exercise, or source-art data changed. `NativeGame.cs` receives only the `--unity-hud-blend-smoke` dispatch needed for the new QA fixture.

## Presentation changes

The shared `ArtScale` is reduced from 0.9 to 0.78, so orb art, slot rail, icon slot, and pointer rectangles shrink together and sit lower above the viewport edge. Resource label/value offsets are scaled by the same value; their fonts are reduced to 14/17 logical pixels to keep them inside the smaller liquid area. Key labels now use the common `KeyLabelRect` and 15px type. A runtime copy of the imported bar masks only warm glyph pixels within the 13 source-label bounds before drawing the shared labels; the original PNG bytes remain unchanged, with no opaque key plates added.

The former 1048×172 filled dark foundation, status ridge, and bottom rail are removed. `NativeHudPresentation` creates only a narrow curved contour and a faint contact shadow; the texture interior and surrounding pixels have zero alpha. Its muted highlight uses the existing dark-metal palette. The existing skill rail and orbs remain visible against the world with only this subtle line underneath them.

The orb frames move inward to a 920-logical-pixel span to connect them visually with the slot bar. The always-visible `기검참 · ST · 준비 [K]` banner and wide charge meter are removed. A compact, unbacked status label appears only while the LMB slot is hovered, for 1.6 seconds after it is selected, or during an active charge. Its text is measured and the label expands as needed, with a 360px minimum. The charge meter is 160×2 logical pixels. These are presentation conditions; the same skill callbacks and `SkillUiState` values remain in use.

## Focused Player capture fixture

Run the integrated Unity build with `--unity-hud-blend-smoke -output <isolated-output>`. The fixture follows `ShowLobby → SelectPreview → EnterNativeTest`, verifies that generic smoke mode has no user-roster store open, disables enemy AI and clears enemies for these QA captures, then records four images: idle at 720p/1080p and actual `StepInput` charge tier 2 at 720p and tier 3 at 1080p. It waits up to three seconds for all screenshot files before recording capture checks. `--keep-open-after-hud-blend` leaves that same QA Player open after writing the receipt so the root integrator can check pointer hover and slot hit areas without relaunching. Without that option the fixture exits after one second. This is a scripted Player capture, not OS keyboard or mouse input verification.

`hud-blend-capture.json` includes all 13 key strings, the shared logical rectangles for the bar, both orbs, active icon, status label, every slot hit area and each key label. It also records minimum inter-slot and inset-label gaps, the common scale, and capture checks. The key-label rectangles and skill hit areas share slot centers from `NativeHudDockLayout`; the fixture checks center alignment, positive gaps, and both rectangle corners against the parent bounds.

## Verification status

The reference images were visually inspected. Code and fixture changes have not yet been built or captured in Unity, so the new HUD's actual frame weight, orb text fit, and visual fit at 720p/1080p remain for the root integrator to inspect. No previous test suite or exercise was rerun by this unit.


## ROOT 실행 인수 — 2026-10-26 01:30 KST 마감

사용자 최신 피드백에 맞춰9dd의 최종 디자인 인수를 철회하고 낮고 투명한 HUD로 보정했다. 새 실행본: `/Users/fordeargamers/exoduser-wt/_out/UNITY-MAC-HUD-BLEND-20261026/build-world-blend/EXODUSER-Unity.app`, source `7d5200ca64b7bfc6982239102b4c3fcee0f78151`. Unity6000.6.7f1/ARM64/오류0,1971663694B. 빌드 입력335파일682143647B SHA 불일치0. 기존 프로젝트·자산 재사용, 원본 PNG 수정/유료생성/재인코딩0.

720/1080 idle·실제 tier2/3 charge4PNG를 확인했다. 큰 불투명 받침과 상시 상태판 제거, ArtScale .78, 전체 orb 외곽폭920logical px, orb와bar 끝단 연결, 필요한 때만 무배경 상태문구/160×2 차징계이지가 보인다. 원본 baked 키문자와 새문자 겹침을 runtime 알파 사본에서 제거하고 상태문자열 끝[K] 잘림도 수정했다. VISUAL VERDICT: PASS (이번 요청 방향의 ROOT 검수이며 사용자 최종 미적 승인으로 간주하지 않음).

새 fixture55/55 PASS,13키/공통layout/양의 간격/각 hitrect 경계/idle 숨김·hover·선택·charge 표시조건, 실제 tier2/3 및4파일 저장을 확인했다. 첫 후보 마지막PNG 비동기 저장 판정1실패는 최대3초 파일 대기로 수정해 새 입력에서0실패. 이전 통과 프런트·실습·저장 전체군은 다시 실행하지 않았다.

CUA 실제 K 입력으로 기존 스킬창 열림을 확인했다. 좌표 클릭에서는 슬롯 callback을 확인하지 못했으므로 OS 마우스 PASS는 주장하지 않으며, 이는 남은 좁은 수동 확인 항목이다. scripted13개 hitrect/그리기 중심 일치는 통과했다. QA Cmd-Q 시 도구가 사용자 앱 변경을 알렸으므로 추가 UI 조작을 멈췄다. 실제 잔여 프로세스는 [최종 영수증](UNITY_MAC_HUD_BLEND_ACCEPTANCE_20261026.json)에 기록했다. 기존 사용자 앱/정상 저장은 보존했다.

첫2실습 기능 인수와 이번 HUD 표현 인수는 별개다. 나머지 실습·전체 본편 동등성은 기존 미이식 목록에 유지하며, 새 맵/모션/VFX/전체27실습을 추가로 시작하지 않았다.
