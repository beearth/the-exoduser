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
