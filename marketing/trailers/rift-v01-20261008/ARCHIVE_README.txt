EXODUSER — RIFT DEVLOG v0.1 (editorial edition), 2026-10-08
15.000 s / 450 frames / 1920x1080 / native Higgsedit / H.264 30 fps.

Historical sources:
- Concept: 2026-10-05, existing AI-assisted concept, not gameplay.
- Footage: 2026-10-06, automated resident-dialogue QA route, not human gameplay.
- Music: existing AI-assisted prologue_theme.mp3, 14-29 s, level/fades edited.
- v0.1 is this devlog edition, not an asserted game-build version.
- The footage is not claimed to match the current Steam public demo.

Timeline:
0-2 concept still
2-4 source 15.2-17.2 resident placement
4-7 source 19.3-22.3 path check
7-10 source 27.4-30.4 stairs
10-13 next iteration
13-15 Steam public-demo CTA
The three footage cuts are chronological hard cuts, not a continuous take.
Selected original windows have stable 980x862 viewport and no >100 ms PTS gaps.
Minor automated facing turns remain; this is accepted only as disclosed WIP.
Previous 34s/20s/Discord motion-QA failures remain rejected.

Editable native project: project/project.json (all fs: asset URIs are relative)
Authoring entry: edit.jsx (same bytes as the delivered workspace JSX)
Input sources, selected H.264 clips, edited BGM and fonts/licenses are included.
Prepared full-CFR intermediate and final MP4 are intentionally not duplicated in ZIP.
Input plus project/media duplicate required assets for re-authoring and native portability.

Open with installed Higgsedit. Optional reproducible rebuild from ZIP directory:
  python3 prepare.py
  RIFT_V01_INPUT="$PWD/input" RIFT_V01_PROJECT="$PWD/project" higgsedit build edit.jsx
  higgsedit render project --out "$PWD/EXODUSER_RIFT_DEVLOG_V01_20261008.mp4" --workers 1 --shards 1 --bitrate 10M
Keep project/fonts/ DM Sans files and input/OFL licenses. NotoSansKR is vendored as a native font asset.
No AI image/music/voice generation, game/server/browser run, optical interpolation or slow motion was used.

See QA.json, input/provenance.json, input/manifest.json and review/ for exact checks.
Full auditory listening was not performed; AAC stream decoding and peak checks were performed.
