# World intro v23 (new opening) — 2026-11-04

Byte-exact copy of `video/world_intro_v23_newopening_steam.mp4` from origin/main `06ac6882b`. 90,144,119 bytes, SHA-256 `6abe88a5d4a5f829fb9f6c3e99cf488d79cd365ae58c52c8ddf6a469c05278c9`, 1920×1080 30fps 3410 frames, 113.70 s.

Only v22b 0–13.15 s (frames 12–394) was replaced with the new concept-series opening (three Kling shots). From frame 395 (the red iron gate) to the end the frames are v22b, and the audio track is v22b's AAC copied as-is, so the 0.400 s cue offset, cut boundaries and 29-language captions are unchanged.

`restore-lobby-media.cjs` joins part-01.bin…part-03.bin in manifest order, validates each part and the final size/SHA-256, and writes `Assets/StreamingAssets/Lobby/world_intro_v23_newopening_steam.mp4`. No transcoding. The previous v22b parts stay in `../world-intro-v22b-steam-canonical/` for rollback.
