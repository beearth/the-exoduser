# UNITY-LOBBY-01 source flow oracle

SSOT is the current Windows `G:/exoduser/index.html`, not the older worktree index. `export.cjs` evaluates only the dependency-free subtitle/player definitions at development time. Unity never evaluates JavaScript.

`oracle.json` pins four source SHA-256 values, 17 original next-cut timestamps, the five-second hold and all 29 languages / 32 caption cues. Parent asset export copies this JSON into `Resources/Data/lobby_frontend.json`.

```powershell
& C:/nvm4w/nodejs/node.exe unity/Tools/lobby-oracle/run.cjs --project E:/exoduser-wt/codex-port-takeover-20261023/unity --out I:/EXODUSER-Storage/qa/unity-lobby-20261024 --label lobby-green
```

Pass an explicit project path when Tools is a Junction. The SDK8 test build writes every cache/output to I:. The initial CS2001 missing-source result was only a build-presence check, not behavioral TDD evidence. The actual FDG stall regression RED executes the pre-fix NativeLobby FDG control block with a prepared decoder stuck at .1 seconds for 16 seconds; it fails to advance. Its source SHA and extracted block are preserved in I:/EXODUSER-Storage/qa/unity-lobby-20261024/fdg-stall-red.json. The repaired production watchdog passes 13 explicit no-progress, progress-reset, error, ended and deadline checks, plus the original 52 flow assertions (65 total): startup gate state, 3/15-second fallback, near-end transition, five-second hold/reset, explicit temporary-card admission, return/replay, source cut array and seeking, finite/clamped mix.

This test does not verify video decoding, rendered frames, audio output or live UI input. Actual Editor/Windows Player QA is separate and is required before frontend completion claims.

## Async video intent regression

`run.cjs --suite video-intent --project <Unity project> --label video-intent-green` compiles the actual production NativeLobbyVideo adapter against narrow Unity boundary doubles. The RED built successfully then failed `blur while preparing must prevent asynchronous autoplay`; the GREEN passes 11 checks covering delayed preparation while blurred, intent-preserving resume, manual pause, first-frame title freeze and error. It does not decode media. Keep VideoIntentTests.csproj tracked explicitly when project-level *.csproj ignores apply.
