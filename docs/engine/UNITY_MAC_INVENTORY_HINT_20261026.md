# Unity inventory equipped-item hint — 2026-10-26

## Change

The equipped-item guide in `NativeInventoryComparison.cs` used a fixed 520-logical-pixel content width and a 20px wrapping style. At 720p the second sentence was just wide enough for its final period to wrap onto a third line by itself. This is visible in the existing `ui-smoke/inventory-equipped.png` (1280×720, SHA-256 `0c0b7ec102473f026c66fb543aa0225e2bbafa9d05efe239449c3bc6829abfe1`). The text now reads `현재 착용 중인 장비입니다.\n소지품에서 장비를 선택해 비교하세요.`. This preserves its meaning while keeping the second sentence short. The shared font, viewport, scrollbar reservation, comparison numbers, and equipment behavior are unchanged.

## Focused capture

Run the existing explicit Player smoke with `--unity-ui-smoke -ui-phase equipped-guide -output <isolated-output> --quit-after-ui-smoke`. This phase follows the existing resumed-game path, selects the currently equipped starter weapon without equipping or saving, opens inventory through `SetInventory`, and captures `equipped-guide-1080p.png` and `equipped-guide-720p.png` after waiting for each file. `equipped-guide-smoke.json` records the selected item, open/equipped checks, and capture completion. The phase does not run the broader 15-check fixture or its other screenshots.

The existing `--unity-ui-smoke` QA scope suppresses settings IO and normal character-roster storage. This capture phase also makes no inventory ownership changes. It is a scripted Player render check, not OS mouse input verification. Unity build and new capture review remain for the root integrator.
