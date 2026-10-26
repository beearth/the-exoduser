# Unity HUD world blend adjustment — 2026-10-26

> 2026-10-27 A06 후속: 이 문서의 `.78`/구슬·슬롯 좌표는 당시 빌드 이력이다. 현행 Mac 좌표 `.9`, 웹 원본 슬롯/키행, 새 720p/1080p 화면 판정은 [A06 인수 기록](UNITY_MAC_A06_HUD_COORDINATE_20261027.md)을 따른다.

우상단 상시 장·레벨·경험치·처치·악의 정보판은 이 문서의 하단 스킬 상태문구와 다른 UI다. 2026-10-26 후속으로 검정 직사각형 배경을 약화한 범위·수치는 [우측 상단 상태 표시 보정](UNITY_MAC_STATUS_BLEND_20261026.md)을 따른다. 아래 인수 결과는 후속 변경 전 하단 HUD에 관한 당시 기록이다.

## Visual target and scope

The user's latest review withdrew the large black state plate and broad square footing from the 9dd integrated HUD candidate. The accepted direction is a low, compact grouping: the resource orbs and slot rail remain legible, the world stays visible around and between them, and a thin curved worn-metal contour ties the lower group together. The two reference images were viewed directly: `reference-compact.png` (716×452, SHA-256 `ae54147d0a865a94a23b32c9e573b0088d393220317eac45fd02058f340c9aed`) and `reference-world-blend.png` (1388×597, SHA-256 `a9305e08b3e030061a3b7e0d0526f1e8849b4fcc25ca02eacb529f4849de0230`). They inform scale, transparency, and restraint only; none of their artwork is copied.

This adjustment changes presentation code in `NativeHud.cs`, `NativeHudPresentation.cs`, `NativeHudSkills.cs`, and the shared `NativeHudDockLayout.cs`. It preserves the existing orb and slot artwork, all resource values, all 13 key names and callbacks, charge simulation, and the hit areas calculated from `SkillSlotRect`. No save, gameplay balance, exercise, or source-art data changed. `NativeGame.cs` receives only the `--unity-hud-blend-smoke` dispatch needed for the new QA fixture.

## Presentation changes

The shared `ArtScale` is reduced from 0.9 to 0.78, so orb art, slot rail, icon slot, and pointer rectangles shrink together and sit lower above the viewport edge. Resource label/value offsets are scaled by the same value; their fonts are reduced to 14/17 logical pixels to keep them inside the smaller liquid area. Key labels now use the common `KeyLabelRect` and 15px type. A runtime copy of the imported bar masks only warm glyph pixels within the 13 source-label bounds before drawing the shared labels; the original PNG bytes remain unchanged, with no opaque key plates added.

The former 1048×172 filled dark foundation, status ridge, and bottom rail are removed. `NativeHudPresentation` creates only a narrow curved contour and a faint contact shadow; the texture interior and surrounding pixels have zero alpha. Its muted highlight uses the existing dark-metal palette. The existing skill rail and orbs remain visible against the world with only this subtle line underneath them.

The orb frames move inward to a 920-logical-pixel span to connect them visually with the slot bar. The always-visible `기검참 · ST · 준비 [K]` banner and wide charge meter are removed. A compact, unbacked status label appears only while the LMB slot is hovered, for 1.6 seconds after it is selected, or during an active charge. Its text is measured and the label expands as needed, with a 360px minimum. The charge meter is 160×2 logical pixels. These are presentation conditions; the same skill callbacks and `SkillUiState` values remain in use.

## Focused Player capture fixture

Run the integrated Unity build with `--unity-hud-blend-smoke -output <isolated-output>`. The fixture follows `ShowLobby → SelectPreview → EnterNativeTest`, verifies that generic smoke mode has no user-roster store open, disables enemy AI and clears enemies for these QA captures, then records four images: idle at 720p/1080p and actual `StepInput` charge tier 2 at 720p and tier 3 at 1080p. It waits up to three seconds for all screenshot files before recording capture checks. `--keep-open-after-hud-blend` leaves that same QA Player open after writing the receipt so the root integrator can check pointer hover and slot hit areas without relaunching. In this mode only, HUD MouseDown/MouseUp logs record event and screen pointer coordinates, computed slot candidates, GUI matrix/enabled/depth, and the subscribed `SlotSelected` result. Without that option the fixture exits after one second. This is a scripted Player capture, not OS keyboard or mouse input verification.

`hud-blend-capture.json` includes all 13 key strings, the shared logical rectangles for the bar, both orbs, active icon, status label, every slot hit area and each key label. It also records minimum inter-slot and inset-label gaps, the common scale, and capture checks. The key-label rectangles and skill hit areas share slot centers from `NativeHudDockLayout`; the fixture checks center alignment, positive gaps, and both rectangle corners against the parent bounds.

## Verification status

The integrated build at `7d5200ca64b7bfc6982239102b4c3fcee0f78151` compiled without errors; the root integrator inspected all four 720p/1080p HUD captures and recorded 55/55 fixture checks passing. A separate keep-open build at `5a933f6b95b575cbf23efd3e09eb34c062c30ffa` traced the failed CUA pointer clicks to off-window coordinates. Physical mouse input remains unverified. This unit did not run Unity or repeat any previous test suite.


## ROOT 실행 인수 — 2026-10-26 01:30 KST 마감

사용자 최신 피드백에 맞춰9dd의 최종 디자인 인수를 철회하고 낮고 투명한 HUD로 보정했다. 새 실행본: `/Users/fordeargamers/exoduser-wt/_out/UNITY-MAC-HUD-BLEND-20261026/build-world-blend/EXODUSER-Unity.app`, source `7d5200ca64b7bfc6982239102b4c3fcee0f78151`. Unity6000.6.7f1/ARM64/오류0,1971663694B. 빌드 입력335파일682143647B SHA 불일치0. 기존 프로젝트·자산 재사용, 원본 PNG 수정/유료생성/재인코딩0.

720/1080 idle·실제 tier2/3 charge4PNG를 확인했다. 큰 불투명 받침과 상시 상태판 제거, ArtScale .78, 전체 orb 외곽폭920logical px, orb와bar 끝단 연결, 필요한 때만 무배경 상태문구/160×2 차징계이지가 보인다. 원본 baked 키문자와 새문자 겹침을 runtime 알파 사본에서 제거하고 상태문자열 끝[K] 잘림도 수정했다. VISUAL VERDICT: PASS (이번 요청 방향의 ROOT 검수이며 사용자 최종 미적 승인으로 간주하지 않음).

새 fixture55/55 PASS,13키/공통layout/양의 간격/각 hitrect 경계/idle 숨김·hover·선택·charge 표시조건, 실제 tier2/3 및4파일 저장을 확인했다. 첫 후보 마지막PNG 비동기 저장 판정1실패는 최대3초 파일 대기로 수정해 새 입력에서0실패. 이전 통과 프런트·실습·저장 전체군은 다시 실행하지 않았다.

CUA 실제 K 입력으로 기존 스킬창 열림을 확인했다. 좌표 클릭에서는 슬롯 callback을 확인하지 못했으므로 OS 마우스 PASS는 주장하지 않으며, 이는 남은 좁은 수동 확인 항목이다. scripted13개 hitrect/그리기 중심 일치는 통과했다. QA Cmd-Q 시 도구가 사용자 앱 변경을 알렸으므로 추가 UI 조작을 멈췄다. 실제 잔여 프로세스는 [최종 영수증](UNITY_MAC_HUD_BLEND_ACCEPTANCE_20261026.json)에 기록했다. 기존 사용자 앱/정상 저장은 보존했다.

첫2실습 기능 인수와 이번 HUD 표현 인수는 별개다. 나머지 실습·전체 본편 동등성은 기존 미이식 목록에 유지하며, 새 맵/모션/VFX/전체27실습을 추가로 시작하지 않았다.

## Pointer-coordinate review — 2026-10-26

The 7d5200ca build's focused HUD receipt records 55/55 checks passing, including all 13 shared slot rectangles, positive gaps, center alignment, and bounds. Static review confirms `NativeGame` passes bottom-origin `Input.mousePosition` to `NativeHud.PointerOverSlots`, which converts it with the same uniform scale and `NativeHudDockLayout`/`SkillSlotRect` geometry used by drawing; this contract and the recorded geometry were left unchanged.

In the keep-open CUA review, clicks aimed at visible screen positions `[754,1086]` and `[960,1086]` (plus a drag between them) produced MouseDown/MouseUp events, but Unity reported the same `Input.mousePosition=(1100,-264)` and GUI `eventPos=(1100,1344)` at 1920×1080. Both computed slot candidates were `-1`, with GUI enabled and depth 1; no `SlotSelected` callback followed. The coordinates are outside the Unity display, so this run demonstrates a CUA-to-window coordinate mismatch rather than a hitbox failure. K input still opened the skill screen. It does not verify physical mouse input, which remains untested. Raw trace: `pointer-review-5a933f6.log`.


## 취침 중 자율 진행 후 최종 상태

사용자 최신 직접 지시 “이식총괄아 작업좀 알아서 잘해봐라 잔다”에 따라 사소한 확인 질문 없이 남은 포인터 검증·정리·정상 실행본 제시를 계속했다. 일반 전역 memory·권한·구매·리셋·공개배포 설정은 변경하지 않았다.

검수 로그 source5a933f6에서 별도 CUA 첫슬롯/LMB 클릭·드래그·창 Raise를 비교했다. 서로 다른 화면점에도 Unity Event=(1100,1344), Input.mousePosition=(1100,−264), 화면1920×1080이 고정되어 두 hit-test가모두−1이었다. 이벤트는 도착했고 GUI.enabled=true이며, 실제 slot에 닿지 않아 callback이 호출되지 않았다. 이 관측은 전달 좌표 문제를 설명하며 제품 hitbox 결함이나 물리 마우스 PASS를 증명하지 않는다. 제품을 도구 좌표에 맞춰 바꾸지 않았다. 로그와 SHA는 영수증에 남겼다.

진단 앱을 모두 종료했다. 현재 앞에 열린 제품은 source7d5200ca6 `build-world-blend/EXODUSER-Unity.app`, 정상 모드 PID52157·한국어 로비·기존 캐릭터1/5다. 후속5a933f6은 keep-open 검수 모드의 관측 로그만 추가한 source이며 다른 HUD 디자인 버전이 아니다. 원래 사용자38141과 앞서 제시한9dd48476도 강제 종료하지 않았다. 캐릭터 생성/삭제/덮어쓰기0.

기존 자동 진행 상태는 읽기전용으로 한 번 점검했다. 이 Mac의 CODEX_HOME/automations에는 automation.toml0개였고, 기존 id exoduser view는 앱에 카드를 표시했지만 활성/중지·호스트 상태를 모델에 반환하지 않았다. 따라서 실제 Mac 자동 실행을 확인했다고 주장하지 않는다. 생성·수정·재개·삭제0, 새 task/상시 scheduler0, PC paused 자동화 재개0.

기존 담당이 현재 worktree MD와 실제 ROOT PROJECT_MANAGEMENT_MASTER 최신 끝부분까지 읽기전용 검토했다. 현재 포인터 확인 외에 선행 차단 없이 바로 착수할 구체적인 승인 Mac 업데이트 단위는 없었다. 미확정 제안·PC 배포·HOLD 렌더 계약을 새 업무로 승격하지 않았다. 다음 실제 게임 업데이트 우선순위는 이 목록과 미이식 목록을 구분해 이어받는다. 사용자를 깨우는 새 질문은 보내지 않았다.
