# EXODUSER — Character & World Art Teaser

30-second review candidate, 2026-10-09. Existing published Steam environment and official homepage character illustrations. No new generated art or captured gameplay. New characters are development concepts; this video does not promise their availability in the demo. Not published to Steam or social channels.

## Reproduce

The delivery ZIP contains native `project-art-r2/`, source inputs, fonts, `edit.jsx`, source manifest, edit plan, and `postmix.sh`. Node and the matching native Higgsedit CLI are required. Existing project can be rendered without rebuilding:

```bash
mkdir -p delivery
higgsedit render project-art-r2 --depth 8 --bitrate 20M --shards 1 --concurrency 1 --out "$PWD/delivery/native-silent.mp4"
bash postmix.sh
```

To rebuild, change the script's project directory to a fresh name, then run `EXODUSER_ART_DIR="$PWD" higgsedit build edit.jsx`. Whole-script build owns a new project and must not overwrite human edits.

Motion preserves the full character and weapon silhouette. The Arcane Lancer uses 0.98→1.00 scale with no horizontal pan to keep the long spear tip visible. The closing brand is native Cinzel typography; no new raster logo was generated. The small `CHARACTER & WORLD ART TEASER` label distinguishes artwork from gameplay.

Music: existing adopted `prologue_theme.mp3`, original 60–90 seconds, fade in 0.3 seconds and out 1.5 seconds, then loudness normalization. The native picture render is silent; running the postmix step is required. Full subjective listening and real-time end-to-end viewing are not verified by automated checks.

`source-assets.json` records downloaded inventory; `used:true` identifies the seven distinct image files in the actual edit. Three unused images are not in the production ZIP. No old rejected combat footage is included. The separate boss redesign/capture wait remains in force.
